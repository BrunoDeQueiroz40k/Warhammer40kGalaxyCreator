import { useState, useCallback } from 'react';
import { ExportablePlanetData } from '../lib/galaxyExport';

export function useGalaxyPlanets() {
  const [planets, setPlanets] = useState<ExportablePlanetData[]>([]);

  const addPlanet = useCallback((planet: ExportablePlanetData) => {
    setPlanets(prev => [...prev, planet]);
  }, []);

  const updatePlanet = useCallback((index: number, updatedPlanet: ExportablePlanetData) => {
    setPlanets(prev => prev.map((planet, i) => i === index ? updatedPlanet : planet));
  }, []);

  const removePlanet = useCallback((index: number) => {
    setPlanets(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearPlanets = useCallback(() => {
    setPlanets([]);
  }, []);

  const loadPlanets = useCallback((newPlanets: ExportablePlanetData[]) => {
    setPlanets(newPlanets);
  }, []);

  return {
    planets,
    addPlanet,
    updatePlanet,
    removePlanet,
    clearPlanets,
    loadPlanets
  };
}
