"use client";
import { useEffect, useRef, useState } from "react";
import { PlanetCard } from "../planet/PlanetCard";
import { PlanetLabel } from "../planet/PlanetLabel";
import { Planet } from "./objects/planet";
import * as THREE from "three";
import { attackPlanet, getPlanets, getRoutes } from "@/lib/campaignApi";

// Extend window interface for global Three.js objects
declare global {
  interface Window {
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
  }
}

interface GalaxyComponentProps {
  showSegmentums: boolean;
  showPlanetNames?: boolean; // Nova prop para controlar exibição dos nomes
  playerFaction?: string | null;
}

export default function GalaxyComponent({
  showSegmentums,
  showPlanetNames = false,
  playerFaction = null,
}: GalaxyComponentProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [planetScreenPosition, setPlanetScreenPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isPlanetVisible, setIsPlanetVisible] = useState<boolean>(false);
  const [isAttacking, setIsAttacking] = useState(false);

  const [visiblePlanets, setVisiblePlanets] = useState<
    Array<{
      planet: Planet;
      position: { x: number; y: number };
      isVisible: boolean;
    }>
  >([]);
  const lastPlanetLabelUpdateRef = useRef(0);
  const lastVisiblePlanetsRef = useRef<typeof visiblePlanets>([]);

  useEffect(() => {
    import("./main");

    // Listen for planet click events
    const handlePlanetClick = (event: CustomEvent) => {
      const planet = event.detail.planet;
      setSelectedPlanet(planet);

      // Calculate planet position on screen
      if (planet && planet.obj) {
        // Get the planet's world position
        const worldPosition = planet.obj.position.clone();

        // Get camera and renderer from the global scope
        const camera = window.camera;
        const renderer = window.renderer;

        if (camera && renderer) {
          // Project 3D position to 2D screen coordinates
          worldPosition.project(camera);

          // Convert normalized device coordinates to screen coordinates
          const canvas = document.getElementById("canvas") as HTMLCanvasElement;
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const x = (worldPosition.x * 0.5 + 0.5) * rect.width + rect.left;
            const y = (worldPosition.y * -0.5 + 0.5) * rect.height + rect.top;

            setPlanetScreenPosition({ x, y });
          }
        }
      }
    };

    window.addEventListener("planetClick", handlePlanetClick as EventListener);

    return () => {
      window.removeEventListener(
        "planetClick",
        handlePlanetClick as EventListener
      );
    };
  }, []);

  // Control segmentum visibility
  useEffect(() => {
    const toggleSegmentums = (show: boolean) => {
      const toggleFn = (
        window as { toggleSegmentums?: (show: boolean) => void }
      ).toggleSegmentums;
      if (toggleFn) {
        toggleFn(show);
      }
    };

    toggleSegmentums(showSegmentums);
  }, [showSegmentums]);

  // Update planet position every frame when a planet is selected
  useEffect(() => {
    if (!selectedPlanet || !selectedPlanet.obj) return;

    const updatePlanetPosition = () => {
      const camera = window.camera;
      const renderer = window.renderer;

      if (camera && renderer && selectedPlanet.obj) {
        // Get the planet's world position
        const worldPosition = selectedPlanet.obj.position.clone();

        // Project 3D position to 2D screen coordinates
        worldPosition.project(camera);

        // Check if planet is in front of camera (z < 1)
        const isVisible = worldPosition.z < 1;
        setIsPlanetVisible(isVisible);

        if (isVisible) {
          // Convert normalized device coordinates to screen coordinates
          const canvas = document.getElementById("canvas") as HTMLCanvasElement;
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const x = (worldPosition.x * 0.5 + 0.5) * rect.width + rect.left;
            const y = (worldPosition.y * -0.5 + 0.5) * rect.height + rect.top;

            setPlanetScreenPosition({ x, y });
          }
        }
      }

      requestAnimationFrame(updatePlanetPosition);
    };

    updatePlanetPosition();
  }, [selectedPlanet]);

  // Update all visible planets when showPlanetNames is enabled
  useEffect(() => {
    if (!showPlanetNames) {
      setVisiblePlanets([]);
      return;
    }

    const updateAllPlanets = () => {
      const camera = window.camera;
      const renderer = window.renderer;
      const galaxy = (
        window as { galaxyInstance?: { getPlanets: () => Planet[] } }
      ).galaxyInstance;

      if (!camera || !renderer || !galaxy) {
        requestAnimationFrame(updateAllPlanets);
        return;
      }

      const now = performance.now();
      if (now - lastPlanetLabelUpdateRef.current < 200) {
        requestAnimationFrame(updateAllPlanets);
        return;
      }

      const planets = galaxy.getPlanets ? galaxy.getPlanets() : [];
      const visiblePlanetsData: Array<{
        planet: Planet;
        position: { x: number; y: number };
        isVisible: boolean;
      }> = [];

      planets.forEach((planet: Planet) => {
        if (planet.obj) {
          const worldPosition = planet.obj.position.clone();
          worldPosition.project(camera);

          const isVisible = worldPosition.z < 1;

          if (isVisible) {
            const canvas = document.getElementById(
              "canvas"
            ) as HTMLCanvasElement;
            if (canvas) {
              const rect = canvas.getBoundingClientRect();
              const x = (worldPosition.x * 0.5 + 0.5) * rect.width + rect.left;
              const y = (worldPosition.y * -0.5 + 0.5) * rect.height + rect.top;

              visiblePlanetsData.push({
                planet,
                position: { x, y },
                isVisible: true,
              });
            }
          }
        }
      });

      const prev = lastVisiblePlanetsRef.current;
      const changed =
        prev.length !== visiblePlanetsData.length ||
        visiblePlanetsData.some(
          (v, i) =>
            v.planet !== prev[i]?.planet ||
            Math.abs(v.position.x - prev[i].position.x) > 1 ||
            Math.abs(v.position.y - prev[i].position.y) > 1
        );

      if (changed) {
        lastVisiblePlanetsRef.current = visiblePlanetsData;
        setVisiblePlanets(visiblePlanetsData);
      }

      lastPlanetLabelUpdateRef.current = now;
      requestAnimationFrame(updateAllPlanets);
    };

    updateAllPlanets();
  }, [showPlanetNames]);

  const handleCloseCard = () => {
    setSelectedPlanet(null);
    setPlanetScreenPosition(null);
    setIsPlanetVisible(false);
  };

  const handleEditPlanet = () => {
    // TODO: Implement planet editing
  };

  const handleDeletePlanet = () => {
    if (selectedPlanet) {
      // TODO: Implement planet deletion
      setSelectedPlanet(null);
    }
  };

  const handleAttackPlanet = async () => {
    if (!selectedPlanet?.data?.id || isAttacking) return;
    try {
      setIsAttacking(true);
      await attackPlanet(selectedPlanet.data.id);

      const galaxyInstance = (
        window as {
          galaxyInstance?: {
            clearAllPlanets?: () => void;
            addPlanetWithoutEditMode?: (planet: unknown) => void;
          };
        }
      ).galaxyInstance;

      if (galaxyInstance?.clearAllPlanets && galaxyInstance?.addPlanetWithoutEditMode) {
        const planets = await getPlanets();
        const routes = await getRoutes();
        galaxyInstance.clearAllPlanets();
        planets.forEach((planet) => galaxyInstance.addPlanetWithoutEditMode?.(planet));
        (galaxyInstance as { setRoutes?: (routes: unknown[]) => void }).setRoutes?.(routes);
        setSelectedPlanet(null);
      }
    } catch {
      window.alert("Falha ao atacar planeta.");
    } finally {
      setIsAttacking(false);
    }
  };

  const selectedDomain = selectedPlanet?.data?.domain ?? selectedPlanet?.data?.faction ?? "Sem dominio";
  const homePlanetDomain =
    typeof window === "undefined"
      ? null
      : (
        window as {
          galaxyInstance?: { getPlanets?: () => Planet[] };
        }
      ).galaxyInstance?.getPlanets?.()
        .find((planet) => planet.data.isHomePlanet)?.data.domain ?? null;
  const effectivePlayerDomain =
    playerFaction ?? homePlanetDomain;
  const canAttackSelectedPlanet =
    !!effectivePlayerDomain &&
    !!selectedPlanet &&
    !!selectedPlanet.data.id &&
    selectedDomain !== effectivePlayerDomain &&
    (typeof window !== "undefined"
      ? (
        window as {
          galaxyInstance?: {
            canAttackViaRoute?: (targetPlanetId: string, playerDomain: string | null) => boolean;
          };
        }
      ).galaxyInstance?.canAttackViaRoute?.(selectedPlanet.data.id ?? "", effectivePlayerDomain) === true
      : false);

  return (
    <div className="w-full h-full relative">
      <canvas id="canvas" className="w-full h-full block absolute top-0 left-0" />
      {selectedPlanet && planetScreenPosition && isPlanetVisible && (
        <PlanetCard
          planet={selectedPlanet.data}
          position={planetScreenPosition}
          onClose={handleCloseCard}
          onAttack={handleAttackPlanet}
          canAttack={canAttackSelectedPlanet}
          isAttacking={isAttacking}
          onEdit={handleEditPlanet}
          onDelete={handleDeletePlanet}
        />
      )}
      {/* Renderizar nomes dos planetas quando habilitado */}
      {showPlanetNames &&
        visiblePlanets.map((planetData, index) => (
          <PlanetLabel
            key={`${planetData.planet.data.name}-${index}`}
            planet={planetData.planet.data}
            position={planetData.position}
            isVisible={planetData.isVisible}
          />
        ))}
    </div>
  );
}
