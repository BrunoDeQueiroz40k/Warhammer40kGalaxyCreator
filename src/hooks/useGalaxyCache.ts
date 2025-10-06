import { useEffect, useCallback, useRef } from "react";
import { GalaxyCache } from "../lib/galaxyCache";
import { GalaxyEvents } from "../lib/galaxyEvents";

interface PlanetData {
  name?: string;
  faction?: string;
  planetType?: string;
  description?: string;
  population?: number;
  status?: string;
  image?: string;
  vrchatUrl?: string;
  color?: string;
  segmentum?: string;
}

interface Planet {
  data: PlanetData;
  position: { x: number; y: number; z: number };
}

export function useGalaxyCache() {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string | null>(null);

  // Salvar galáxia no cache com debounce e otimização
  const saveGalaxy = useCallback(() => {
    if (typeof window === "undefined") return;

    const galaxyInstance = (
      window as {
        galaxyInstance?: {
          getAllPlanetsData?: () => Planet[];
          getPlanets?: () => Planet[];
          clearAllPlanets?: () => void;
          addPlanetWithoutEditMode?: (planetData: unknown) => void;
        };
      }
    ).galaxyInstance;
    if (!galaxyInstance) return;

    try {
      // Obter todos os planetas
      const planets = galaxyInstance.getAllPlanetsData
        ? galaxyInstance.getAllPlanetsData()
        : galaxyInstance.getPlanets
        ? galaxyInstance.getPlanets()
        : [];

      if (planets.length > 0) {
        // Converter para formato exportável
        const exportablePlanets = planets.map((planet: Planet) => ({
          name: planet.data?.name || "",
          faction: planet.data?.faction || "",
          planetType: planet.data?.planetType || "",
          description: planet.data?.description || "",
          population: planet.data?.population || 0,
          status: (planet.data?.status as "ativo" | "destruido") || "ativo",
          image: planet.data?.image || "",
          vrchatUrl: planet.data?.vrchatUrl || "",
          color: planet.data?.color || "",
          segmentum: planet.data?.segmentum || "",
          position: {
            x: planet.position?.x || 0,
            y: planet.position?.y || 0,
            z: planet.position?.z || 0,
          },
        }));

        // Verificar se os dados mudaram para evitar saves desnecessários
        const currentData = JSON.stringify(exportablePlanets);
        if (lastSavedDataRef.current === currentData) {
          return; // Dados não mudaram, não salvar
        }

        GalaxyCache.saveGalaxy(exportablePlanets);
        lastSavedDataRef.current = currentData;
      }
    } catch (error) {
      console.error("Erro ao salvar galáxia no cache:", error);
    }
  }, []);

  // Função de salvamento com debounce
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(saveGalaxy, 1000); // 1 segundo de debounce
  }, [saveGalaxy]);

  // Carregar galáxia do cache
  const loadGalaxy = useCallback(() => {
    if (typeof window === "undefined") return;

    const galaxyInstance = (
      window as {
        galaxyInstance?: {
          getAllPlanetsData?: () => Planet[];
          getPlanets?: () => Planet[];
          clearAllPlanets?: () => void;
          addPlanetWithoutEditMode?: (planetData: unknown) => void;
        };
      }
    ).galaxyInstance;
    if (!galaxyInstance) return;

    try {
      const cachedPlanets = GalaxyCache.loadGalaxy();
      if (cachedPlanets && cachedPlanets.length > 0) {
        // Limpar planetas existentes
        if (galaxyInstance.clearAllPlanets) {
          galaxyInstance.clearAllPlanets();
        }

        // Adicionar planetas do cache
        for (const planet of cachedPlanets) {
          if (galaxyInstance.addPlanetWithoutEditMode) {
            galaxyInstance.addPlanetWithoutEditMode(planet);
          }
        }

        console.log(
          `Galáxia carregada do cache: ${cachedPlanets.length} planetas`
        );
        return true;
      }
    } catch (error) {
      console.error("Erro ao carregar galáxia do cache:", error);
    }
    return false;
  }, []);

  // Configurar salvamento automático otimizado
  useEffect(() => {
    if (!GalaxyCache.hasConsent()) return;
    
    // Reduzir frequência de salvamento automático para 2 minutos
    const saveInterval = setInterval(() => {
      GalaxyCache.updateActivity();
      debouncedSave(); // Usar debouncedSave em vez de saveGalaxy direto
    }, 120000); // 2 minutos em vez de 30 segundos

    const handleBeforeUnload = () => {
      // Limpar timeout pendente e salvar imediatamente
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      GalaxyCache.forceSave([]);
      saveGalaxy(); // Salvar imediatamente no beforeunload
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        debouncedSave(); // Usar debouncedSave
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(saveInterval);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [saveGalaxy, debouncedSave]);

  useEffect(() => {
    if (GalaxyCache.hasConsent()) {
      const timer = setTimeout(() => {
        loadGalaxy();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [loadGalaxy]);

  // Escutar eventos de mudança na galáxia para salvar com debounce
  useEffect(() => {
    // Adicionar listeners para eventos de mudança
    GalaxyEvents.addEventListener(GalaxyEvents.EVENTS.PLANET_ADDED, debouncedSave);
    GalaxyEvents.addEventListener(GalaxyEvents.EVENTS.PLANET_REMOVED, debouncedSave);
    GalaxyEvents.addEventListener(GalaxyEvents.EVENTS.PLANET_UPDATED, debouncedSave);
    GalaxyEvents.addEventListener(GalaxyEvents.EVENTS.GALAXY_CLEARED, debouncedSave);

    return () => {
      // Limpar timeout pendente
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Remover listeners
      GalaxyEvents.removeEventListener(GalaxyEvents.EVENTS.PLANET_ADDED, debouncedSave);
      GalaxyEvents.removeEventListener(GalaxyEvents.EVENTS.PLANET_REMOVED, debouncedSave);
      GalaxyEvents.removeEventListener(GalaxyEvents.EVENTS.PLANET_UPDATED, debouncedSave);
      GalaxyEvents.removeEventListener(GalaxyEvents.EVENTS.GALAXY_CLEARED, debouncedSave);
    };
  }, [debouncedSave]);

  return {
    saveGalaxy,
    loadGalaxy,
    hasConsent: GalaxyCache.hasConsent(),
    cacheInfo: GalaxyCache.getCacheInfo(),
  };
}
