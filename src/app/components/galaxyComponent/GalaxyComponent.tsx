"use client";
import { useEffect, useState } from "react";
import { PlanetCard } from "../PlanetCard";
import { Planet } from "./objects/planet";
import * as THREE from "three";

// Extend window interface for global Three.js objects
declare global {
   interface Window {
      camera?: THREE.PerspectiveCamera;
      renderer?: THREE.WebGLRenderer;
   }
}

export default function GalaxyComponent() {
   const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
   const [planetScreenPosition, setPlanetScreenPosition] = useState<{ x: number; y: number } | null>(null);
   const [isPlanetVisible, setIsPlanetVisible] = useState<boolean>(false);

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
               const canvas = document.getElementById('canvas') as HTMLCanvasElement;
               if (canvas) {
                  const rect = canvas.getBoundingClientRect();
                  const x = (worldPosition.x * 0.5 + 0.5) * rect.width + rect.left;
                  const y = (worldPosition.y * -0.5 + 0.5) * rect.height + rect.top;

                  setPlanetScreenPosition({ x, y });
               }
            }
         }
      };

      window.addEventListener('planetClick', handlePlanetClick as EventListener);

      return () => {
         window.removeEventListener('planetClick', handlePlanetClick as EventListener);
      };
   }, []);

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
               const canvas = document.getElementById('canvas') as HTMLCanvasElement;
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
      <>
         <canvas id="canvas" className="w-full h-full block" />
         {selectedPlanet && planetScreenPosition && isPlanetVisible && (
            <PlanetCard
               planet={selectedPlanet.data}
               position={planetScreenPosition}
               onClose={handleCloseCard}
               onEdit={handleEditPlanet}
               onDelete={handleDeletePlanet}
            />
         )}
      </>
   );
}
