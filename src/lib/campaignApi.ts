import { CampaignSetupConfig } from "@/components/screens/CampaignSetupScreen";
import { api } from "@/lib/apiClient";
import { PlanetData } from "@/components/galaxyComponent/objects/planet";

export type PlanetRoute = {
  fromPlanetId: string;
  toPlanetId: string;
  distance: number;
};

type PlanetApiRecord = {
  id: string;
  name: string;
  faction?: string;
  domain?: string;
  chapter?: string | null;
  isHomePlanet?: boolean;
  planetType: string;
  population: number;
  status: "ativo" | "destruido";
  image?: string | null;
  color?: string | null;
  segmentum?: string | null;
  position: { x: number; y: number; z: number };
};

type StartCampaignResponse = {
  planets: PlanetApiRecord[];
  routes?: PlanetRoute[];
};

function toPlanetData(planet: PlanetApiRecord): PlanetData {
  return {
    id: planet.id,
    name: planet.name,
    faction: planet.faction,
    domain: planet.domain ?? planet.faction,
    chapter: planet.chapter ?? null,
    isHomePlanet: Boolean(planet.isHomePlanet),
    planetType: planet.planetType,
    population: planet.population,
    status: planet.status,
    image: planet.image ?? undefined,
    color: planet.color ?? undefined,
    segmentum: planet.segmentum ?? undefined,
    position: planet.position,
  };
}

function normalizeHomePlanet(planets: PlanetData[]): PlanetData[] {
  if (planets.length === 0) return planets;
  if (planets.some((planet) => planet.isHomePlanet)) return planets;

  const preferredIndex = planets.findIndex(
    (planet) => (planet.domain ?? planet.faction) && (planet.domain ?? planet.faction) !== "Sem dominio"
  );
  const fallbackIndex = preferredIndex >= 0 ? preferredIndex : 0;

  return planets.map((planet, index) => ({
    ...planet,
    isHomePlanet: index === fallbackIndex,
  }));
}

export async function startCampaignMap(config: CampaignSetupConfig): Promise<{
  planets: PlanetData[];
  routes: PlanetRoute[];
}> {
  const response = await api.request<StartCampaignResponse>("/campaigns/start", {
    method: "POST",
    body: JSON.stringify({
      difficulty: null,
      galaxyShape: null,
      stars: config.stars,
      faction: config.faction,
      subFaction: config.subFaction,
      chapter: config.chapter ?? null,
      botsRangeEnabled: null,
      bots: null,
      botsMin: null,
      botsMax: null,
    }),
  });

  return {
    planets: normalizeHomePlanet(response.planets.map(toPlanetData)),
    routes: response.routes ?? [],
  };
}

export async function getPlanets(): Promise<PlanetData[]> {
  const response = await api.request<{ planets: PlanetApiRecord[] }>("/planets");
  return normalizeHomePlanet(response.planets.map(toPlanetData));
}

export async function getRoutes(): Promise<PlanetRoute[]> {
  const response = await api.request<{ routes: PlanetRoute[] }>("/campaigns/routes");
  return response.routes;
}

export async function attackPlanet(planetId: string): Promise<PlanetData> {
  const response = await api.request<{ planet: PlanetApiRecord }>(`/planets/${planetId}/attack`, {
    method: "POST",
  });
  return toPlanetData(response.planet);
}

export async function resetCampaign(): Promise<void> {
  await api.request("/campaigns/reset", { method: "POST" });
}
