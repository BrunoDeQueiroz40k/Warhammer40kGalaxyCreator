import { ExportablePlanetData } from "./galaxyExport";

interface GalaxyCacheData {
  planets: ExportablePlanetData[];
  timestamp: number;
  sessionId: string;
}

export class GalaxyCache {
  private static readonly CACHE_KEY = "galaxy-cache";
  private static readonly CONSENT_KEY = "galaxy-cookie-consent";
  private static readonly TIMESTAMP_KEY = "galaxy-cookie-timestamp";
  private static readonly SESSION_KEY = "galaxy-session-id";
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutos em millisegundos (só quando fechar o site)

  /**
   * Verifica se o usuário deu consentimento para cookies
   */
  static hasConsent(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(this.CONSENT_KEY) === "accepted";
  }

  /**
   * Verifica se o cache ainda é válido
   * O cache só expira quando a pessoa fecha o site (30 minutos após o último save)
   */
  static isCacheValid(): boolean {
    if (!this.hasConsent()) return false;
    if (typeof window === "undefined") return false;

    const timestamp = localStorage.getItem(this.TIMESTAMP_KEY);
    if (!timestamp) return false;

    const cacheTime = parseInt(timestamp);
    const now = Date.now();

    // Verificar se passou de 30 minutos desde o último save
    // Isso só acontece quando a pessoa fecha o site e volta depois
    if (now - cacheTime > this.CACHE_DURATION) {
      this.clearCache();
      return false;
    }

    return true;
  }

  /**
   * Verifica se a sessão ainda está ativa
   * A sessão permanece ativa enquanto o site estiver aberto
   */
  static isSessionActive(): boolean {
    if (!this.hasConsent()) return false;
    if (typeof window === "undefined") return false;

    const sessionId = localStorage.getItem(this.SESSION_KEY);
    return !!sessionId; // Sessão ativa se existe um ID de sessão
  }

  /**
   * Atualiza a última atividade do usuário
   * Agora só atualiza o timestamp do cache, não controla inatividade
   */
  static updateActivity(): void {
    if (!this.hasConsent()) return;
    if (typeof window === "undefined") return;

    // Atualiza o timestamp do cache para manter os 30 minutos
    localStorage.setItem(this.TIMESTAMP_KEY, Date.now().toString());
  }

  /**
   * Salva os dados da galáxia no cache
   */
  static saveGalaxy(planets: ExportablePlanetData[]): void {
    if (!this.hasConsent()) return;
    if (typeof window === "undefined") return;

    try {
      const sessionId = this.getOrCreateSessionId();
      const cacheData: GalaxyCacheData = {
        planets,
        timestamp: Date.now(),
        sessionId,
      };

      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      localStorage.setItem(this.TIMESTAMP_KEY, Date.now().toString());
      this.updateActivity();

      console.log("Galáxia salva no cache:", planets.length, "planetas");
    } catch (error) {
      console.error("Erro ao salvar galáxia no cache:", error);
    }
  }

  static loadGalaxy(): ExportablePlanetData[] | null {
    if (!this.hasConsent()) return null;
    if (!this.isCacheValid()) return null;
    if (typeof window === "undefined") return null;

    try {
      const cachedData = localStorage.getItem(this.CACHE_KEY);
      if (!cachedData) return null;

      const parsedData: GalaxyCacheData = JSON.parse(cachedData);

      // Verificar se a sessão ainda é a mesma (só muda quando fecha e abre o site)
      const currentSessionId = this.getOrCreateSessionId();
      if (parsedData.sessionId !== currentSessionId) {
        console.log(
          "Sessão diferente (site foi fechado e reaberto), cache inválido"
        );
        return null;
      }

      // Atualiza o timestamp para manter os 30 minutos
      this.updateActivity();
      console.log(
        "Galáxia carregada do cache:",
        parsedData.planets.length,
        "planetas"
      );
      return parsedData.planets;
    } catch (error) {
      console.error("Erro ao carregar galáxia do cache:", error);
      return null;
    }
  }

  static clearCache(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem(this.CACHE_KEY);
    localStorage.removeItem(this.TIMESTAMP_KEY);
    localStorage.removeItem(this.SESSION_KEY);
    console.log("Cache da galáxia limpo");
  }

  private static getOrCreateSessionId(): string {
    if (typeof window === "undefined") return "";

    let sessionId = localStorage.getItem(this.SESSION_KEY);
    if (!sessionId) {
      sessionId =
        "session-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(this.SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  static forceSave(planets: ExportablePlanetData[]): void {
    if (!this.hasConsent()) return;

    // Força o salvamento mesmo se a sessão estiver inativa
    this.saveGalaxy(planets);
  }

  static getCacheInfo(): {
    hasConsent: boolean;
    isValid: boolean;
    isSessionActive: boolean;
    planetCount: number;
    lastSave: string | null;
  } {
    const hasConsent = this.hasConsent();
    const isValid = this.isCacheValid();
    const isSessionActive = this.isSessionActive();

    let planetCount = 0;
    let lastSave: string | null = null;

    if (hasConsent && typeof window !== "undefined") {
      try {
        const cachedData = localStorage.getItem(this.CACHE_KEY);
        if (cachedData) {
          const parsedData: GalaxyCacheData = JSON.parse(cachedData);
          planetCount = parsedData.planets.length;
          lastSave = new Date(parsedData.timestamp).toLocaleString();
        }
      } catch (error) {
        console.error("Erro ao obter informações do cache:", error);
      }
    }

    return {
      hasConsent,
      isValid,
      isSessionActive,
      planetCount,
      lastSave,
    };
  }
}
