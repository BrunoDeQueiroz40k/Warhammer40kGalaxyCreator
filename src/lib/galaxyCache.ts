import { ExportablePlanetData } from "./galaxyExport";

// Schema de validação para planetas
interface PlanetSchema {
  name: string;
  faction: string;
  planetType: string;
  description: string;
  population: number;
  status: "ativo" | "destruido";
  image: string;
  vrchatUrl: string;
  color: string;
  segmentum: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

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
  private static readonly MAX_CACHE_SIZE = 5 * 1024 * 1024; // 5MB máximo para o cache

  // Valida se um planeta tem a estrutura correta
  private static validatePlanet(planet: unknown): planet is PlanetSchema {
    if (!planet || typeof planet !== "object" || planet === null) return false;

    const p = planet as Record<string, unknown>;
    return (
      typeof p.name === "string" &&
      typeof p.faction === "string" &&
      typeof p.planetType === "string" &&
      typeof p.description === "string" &&
      typeof p.population === "number" &&
      (p.status === "ativo" || p.status === "destruido") &&
      typeof p.image === "string" &&
      typeof p.vrchatUrl === "string" &&
      typeof p.color === "string" &&
      typeof p.segmentum === "string" &&
      Boolean(p.position) &&
      typeof p.position === "object" &&
      p.position !== null &&
      typeof (p.position as Record<string, unknown>).x === "number" &&
      typeof (p.position as Record<string, unknown>).y === "number" &&
      typeof (p.position as Record<string, unknown>).z === "number"
    );
  }

  // Valida os dados do cache
  private static validateCacheData(data: unknown): data is GalaxyCacheData {
    if (!data || typeof data !== "object" || data === null) return false;

    const d = data as Record<string, unknown>;
    return (
      Array.isArray(d.planets) &&
      typeof d.timestamp === "number" &&
      typeof d.sessionId === "string" &&
      d.planets.every((planet: unknown) => this.validatePlanet(planet))
    );
  }

  // Verifica se o cache não excede o tamanho máximo
  private static isCacheSizeValid(data: string): boolean {
    return data.length <= this.MAX_CACHE_SIZE;
  }

  // Verifica se o usuário deu consentimento para cookies
  static hasConsent(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(this.CONSENT_KEY) === "accepted";
  }

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

  static isSessionActive(): boolean {
    if (!this.hasConsent()) return false;
    if (typeof window === "undefined") return false;

    const sessionId = localStorage.getItem(this.SESSION_KEY);
    return !!sessionId; // Sessão ativa se existe um ID de sessão
  }

  static updateActivity(): void {
    if (!this.hasConsent()) return;
    if (typeof window === "undefined") return;

    // Atualiza o timestamp do cache para manter os 30 minutos
    localStorage.setItem(this.TIMESTAMP_KEY, Date.now().toString());
  }

  // Salva os dados da galáxia no cache com validação
  static saveGalaxy(planets: ExportablePlanetData[]): boolean {
    if (!this.hasConsent()) return false;
    if (typeof window === "undefined") return false;

    try {
      // Validar planetas antes de salvar
      if (!planets.every((planet) => this.validatePlanet(planet))) {
        console.warn(
          "Alguns planetas têm dados inválidos, ignorando salvamento"
        );
        return false;
      }

      const sessionId = this.getOrCreateSessionId();
      const cacheData: GalaxyCacheData = {
        planets,
        timestamp: Date.now(),
        sessionId,
      };

      const cacheString = JSON.stringify(cacheData);

      // Verificar tamanho do cache
      if (!this.isCacheSizeValid(cacheString)) {
        console.warn("Cache muito grande, limpando dados antigos");
        this.clearCache();
        return false;
      }

      localStorage.setItem(this.CACHE_KEY, cacheString);
      localStorage.setItem(this.TIMESTAMP_KEY, Date.now().toString());
      this.updateActivity();

      console.log("Galáxia salva no cache:", planets.length, "planetas");
      return true;
    } catch (error) {
      console.error("Erro ao salvar galáxia no cache:", error);
      // Tentar limpar cache corrompido
      if (error instanceof DOMException && error.code === 22) {
        console.log("Cache corrompido, limpando...");
        this.clearCache();
      }
      return false;
    }
  }

  static loadGalaxy(): ExportablePlanetData[] | null {
    if (!this.hasConsent()) return null;
    if (!this.isCacheValid()) return null;
    if (typeof window === "undefined") return null;

    try {
      const cachedData = localStorage.getItem(this.CACHE_KEY);
      if (!cachedData) return null;

      const parsedData = JSON.parse(cachedData);

      // Validar estrutura dos dados
      if (!this.validateCacheData(parsedData)) {
        console.warn("Dados do cache inválidos, limpando...");
        this.clearCache();
        return null;
      }

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
      // Limpar cache corrompido
      this.clearCache();
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
