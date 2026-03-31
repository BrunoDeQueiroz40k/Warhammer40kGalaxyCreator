import { CampaignSetupConfig } from "@/components/screens/CampaignSetupScreen";
import { api } from "@/lib/apiClient";
import { PlanetData } from "@/components/galaxyComponent/objects/planet";

type PlanetApiRecord = {
  name: string;
  faction?: string;
  domain?: string;
  chapter?: string | null;
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
};

function toPlanetData(planet: PlanetApiRecord): PlanetData {
  return {
    name: planet.name,
    faction: planet.faction,
    domain: planet.domain ?? planet.faction,
    chapter: planet.chapter ?? null,
    planetType: planet.planetType,
    population: planet.population,
    status: planet.status,
    image: planet.image ?? undefined,
    color: planet.color ?? undefined,
    segmentum: planet.segmentum ?? undefined,
    position: planet.position,
  };
}

export async function startCampaign(config: CampaignSetupConfig): Promise<PlanetData[]> {
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

  return response.planets.map(toPlanetData);
}

export async function getPlanets(): Promise<PlanetData[]> {
  const response = await api.request<{ planets: PlanetApiRecord[] }>("/planets");
  return response.planets.map(toPlanetData);
}

export async function resetCampaign(): Promise<void> {
  await api.request("/campaigns/reset", { method: "POST" });
}
