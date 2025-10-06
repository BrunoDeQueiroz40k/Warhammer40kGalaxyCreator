"use client";
import { useEffect, useState } from "react";
import { PlanetCard } from "../PlanetCard";
import { PlanetLabel } from "../PlanetLabel";
import { Planet } from "./objects/planet";
import * as THREE from "three";

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
}

export default function GalaxyComponent({
  showSegmentums,
  showPlanetNames = false,
}: GalaxyComponentProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [planetScreenPosition, setPlanetScreenPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isPlanetVisible, setIsPlanetVisible] = useState<boolean>(false);

  // Estados para nomes dos planetas
  const [visiblePlanets, setVisiblePlanets] = useState<
    Array<{
      planet: Planet;
      position: { x: number; y: number };
      isVisible: boolean;
    }>
  >([]);

  useEffect(() => {
    import("./main");

    // Listen for planet click events
    const handlePlanetClick = (event: CustomEvent) => {
      console.log("Planet click event received:", event.detail);
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

      setVisiblePlanets(visiblePlanetsData);
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
    console.log("Edit planet:", selectedPlanet?.data);
  };

  const handleDeletePlanet = () => {
    if (selectedPlanet) {
      // TODO: Implement planet deletion
      console.log("Delete planet:", selectedPlanet.data);
      setSelectedPlanet(null);
    }
  };

  return (
    <div className="w-full h-full relative">
      <canvas id="canvas" className="w-full h-full block absolute top-0 left-0" />
      {selectedPlanet && planetScreenPosition && isPlanetVisible && (
        <PlanetCard
          planet={selectedPlanet.data}
          position={planetScreenPosition}
          onClose={handleCloseCard}
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
