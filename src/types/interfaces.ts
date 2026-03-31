import { PlanetData } from "@/components/galaxyComponent/objects/planet";
import type React from "react";
import type * as SelectPrimitive from "@radix-ui/react-select";

export interface Vector2D {
  x: number;
  y: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export type MatchType = "name" | "faction" | "type";

export type BadgeVariant =
  | "normal"
  | "imperium"
  | "necrons"
  | "caos"
  | "orks"
  | "xenos"
  | "tau"
  | "aeldari"
  | "dark_eldar";

export interface PlanetSummaryData {
  name: string;
  faction?: string;
  domain?: string;
  chapter?: string | null;
  planetType: string;
  population: number;
  status: string;
  color: string;
  segmentum: string;
  image?: string;
}

export interface CachePlanetData {
  name?: string;
  faction?: string;
  domain?: string;
  chapter?: string | null;
  planetType?: string;
  population?: number;
  status?: string;
  image?: string;
  color?: string;
  segmentum?: string;
}

export interface PlanetEntry<TData = PlanetSummaryData> {
  data: TData;
  position: Vector3D;
}

export interface SearchResult {
  planet: PlanetEntry<PlanetSummaryData>;
  matchScore: number;
  matchType: MatchType;
}

export interface GalaxyDataProvider<TPlanet = PlanetEntry> {
  getAllPlanetsData?: () => TPlanet[];
  getPlanets?: () => TPlanet[];
}

export interface GalaxyCacheDataProvider<TPlanet = PlanetEntry<CachePlanetData>>
  extends GalaxyDataProvider<TPlanet> {
  clearAllPlanets?: () => void;
  addPlanetWithoutEditMode?: (planetData: unknown) => void;
}

export interface PlanetCardProps {
  planet: PlanetData;
  position: Vector2D;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export interface PlanetLabelProps {
  planet: PlanetData;
  position: Vector2D;
  isVisible: boolean;
}

export interface LoadingProps {
  size?: number;
  width?: number;
  height?: number;
  animationSpeed?: number;
  className?: string;
}

export interface LoadingScreenProps extends LoadingProps {
  message?: string;
  progress?: number;
}

export interface VisualizationProps {
  showSegmentums: boolean;
  onToggleSegmentums: (show: boolean) => void;
  showPlanetNames: boolean;
  onTogglePlanetNames: (show: boolean) => void;
}

export type JsonValue =
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | null;

export interface ExportablePlanetData extends PlanetData {
  color?: string;
  segmentum?: string;
}

export interface PlanetSchema extends ExportablePlanetData { }

export interface GalaxyCacheData {
  planets: ExportablePlanetData[];
  timestamp: number;
  sessionId: string;
}

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  placeholderIcon?: React.ReactNode;
}

export interface SelectItemProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  icon?: React.ReactNode;
}
