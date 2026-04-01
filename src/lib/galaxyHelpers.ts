import { GalaxyDataProvider } from "@/types/interfaces";

export function readPlanets<T>(provider: GalaxyDataProvider<T> | null | undefined): T[] {
  if (!provider) return [];
  if (provider.getPlanets) return provider.getPlanets();
  return [];
}

export function getWindowGalaxyProvider<T>(): GalaxyDataProvider<T> | null {
  if (typeof window === "undefined") return null;
  return (window as { galaxyInstance?: GalaxyDataProvider<T> }).galaxyInstance ?? null;
}
