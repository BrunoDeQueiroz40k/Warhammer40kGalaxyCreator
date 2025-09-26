import { useEffect, useCallback } from "react";
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
  // Salvar galáxia no cache
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

        GalaxyCache.saveGalaxy(exportablePlanets);
      }
    } catch (error) {
      console.error("Erro ao salvar galáxia no cache:", error);
    }
  }, []);

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

  // Configurar salvamento automático
  useEffect(() => {
    if (!GalaxyCache.hasConsent()) return;
    const saveInterval = setInterval(() => {
      GalaxyCache.updateActivity();
      saveGalaxy();
    }, 30000);

    const handleBeforeUnload = () => {
      GalaxyCache.forceSave([]);
      saveGalaxy();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        saveGalaxy();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(saveInterval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [saveGalaxy]);

  useEffect(() => {
    if (GalaxyCache.hasConsent()) {
      const timer = setTimeout(() => {
        loadGalaxy();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [loadGalaxy]);

  // Escutar eventos de mudança na galáxia para salvar imediatamente
  useEffect(() => {
    const handleGalaxyChange = () => {
      // Pequeno delay para garantir que a galáxia foi atualizada
      setTimeout(() => {
        saveGalaxy();
      }, 100);
    };

    // Adicionar listeners para eventos de mudança
    GalaxyEvents.addEventListener(GalaxyEvents.EVENTS.PLANET_ADDED, handleGalaxyChange);
    GalaxyEvents.addEventListener(GalaxyEvents.EVENTS.PLANET_REMOVED, handleGalaxyChange);
    GalaxyEvents.addEventListener(GalaxyEvents.EVENTS.PLANET_UPDATED, handleGalaxyChange);
    GalaxyEvents.addEventListener(GalaxyEvents.EVENTS.GALAXY_CLEARED, handleGalaxyChange);

    return () => {
      // Remover listeners
      GalaxyEvents.removeEventListener(GalaxyEvents.EVENTS.PLANET_ADDED, handleGalaxyChange);
      GalaxyEvents.removeEventListener(GalaxyEvents.EVENTS.PLANET_REMOVED, handleGalaxyChange);
      GalaxyEvents.removeEventListener(GalaxyEvents.EVENTS.PLANET_UPDATED, handleGalaxyChange);
      GalaxyEvents.removeEventListener(GalaxyEvents.EVENTS.GALAXY_CLEARED, handleGalaxyChange);
    };
  }, [saveGalaxy]);

  return {
    saveGalaxy,
    loadGalaxy,
    hasConsent: GalaxyCache.hasConsent(),
    cacheInfo: GalaxyCache.getCacheInfo(),
  };
}
