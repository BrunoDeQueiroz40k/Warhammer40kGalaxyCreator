import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { PlanetEntry, PlanetSummaryData } from "@/types/interfaces";

function animateCameraTo(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  target: { x: number; y: number; z: number },
  lookAt: { x: number; y: number; z: number },
  duration: number
): void {
  const currentTarget = controls.target.clone();
  const currentPosition = camera.position.clone();
  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);

    controls.target.set(
      currentTarget.x + (lookAt.x - currentTarget.x) * easeOut,
      currentTarget.y + (lookAt.y - currentTarget.y) * easeOut,
      currentTarget.z + (lookAt.z - currentTarget.z) * easeOut
    );

    camera.position.set(
      currentPosition.x + (target.x - currentPosition.x) * easeOut,
      currentPosition.y + (target.y - currentPosition.y) * easeOut,
      currentPosition.z + (target.z - currentPosition.z) * easeOut
    );

    controls.update();

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  animate();
}

export class GalaxyNavigator {
  static navigateToPlanet(planet: PlanetEntry<PlanetSummaryData>): void {
    if (typeof window === "undefined") return;

    try {
      const camera = (window as { camera?: THREE.PerspectiveCamera }).camera;
      const controls = (window as { orbit?: OrbitControls }).orbit;

      if (!camera || !controls) {
        return;
      }

      const planetPosition = planet.position;
      const distance = 5;

      const cameraPosition = {
        x: planetPosition.x + distance,
        y: planetPosition.y + distance * 0.3,
        z: planetPosition.z + distance,
      };

      animateCameraTo(camera, controls, cameraPosition, planetPosition, 2000);
    } catch (error) {
      console.error("Erro ao navegar para planeta:", error);
    }
  }

  static navigateToPosition(
    targetPosition: { x: number; y: number; z: number },
    cameraDistance: number = 5
  ): void {
    if (typeof window === "undefined") return;

    try {
      const camera = (window as { camera?: THREE.PerspectiveCamera }).camera;
      const controls = (window as { orbit?: OrbitControls }).orbit;

      if (!camera || !controls) {
        return;
      }

      const cameraPosition = {
        x: targetPosition.x + cameraDistance,
        y: targetPosition.y + cameraDistance * 0.3,
        z: targetPosition.z + cameraDistance,
      };

      animateCameraTo(camera, controls, cameraPosition, targetPosition, 2000);
    } catch (error) {
      console.error("Erro ao navegar para posicao:", error);
    }
  }

  static resetCamera(): void {
    if (typeof window === "undefined") return;

    try {
      const camera = (window as { camera?: THREE.PerspectiveCamera }).camera;
      const controls = (window as { orbit?: OrbitControls }).orbit;

      if (!camera || !controls) {
        return;
      }

      const initialTarget = { x: 0, y: 0, z: 0 };

      this.navigateToPosition(initialTarget, 500);
    } catch (error) {
      console.error("Erro ao resetar camera:", error);
    }
  }
}
