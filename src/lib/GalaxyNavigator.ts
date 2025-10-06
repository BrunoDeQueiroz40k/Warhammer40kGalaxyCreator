import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

interface Planet {
  data: {
    name: string;
    faction: string;
    planetType: string;
    description: string;
    population: number;
    status: string;
    color: string;
    segmentum: string;
  };
  position: { x: number; y: number; z: number };
}

export class GalaxyNavigator {
  static navigateToPlanet(planet: Planet): void {
    if (typeof window === "undefined") return;

    try {
      // Obter câmera e controles
      const camera = (window as { camera?: THREE.PerspectiveCamera }).camera;
      const controls = (window as { orbit?: OrbitControls }).orbit;

      if (!camera || !controls) {
        console.warn("Câmera ou controles não encontrados");
        return;
      }

      // Posição do planeta
      const planetPosition = planet.position;

      // Calcular posição da câmera (afastada do planeta)
      const distance = 5; // Distância de visualização
      const cameraPosition = {
        x: planetPosition.x + distance,
        y: planetPosition.y + distance * 0.3,
        z: planetPosition.z + distance,
      };

      // Posições atuais
      const currentTarget = controls.target.clone();
      const currentPosition = camera.position.clone();

      // Configurar animação
      const duration = 2000; // 2 segundos
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easeOut = 1 - Math.pow(1 - progress, 3);

        const newTarget = {
          x: currentTarget.x + (planetPosition.x - currentTarget.x) * easeOut,
          y: currentTarget.y + (planetPosition.y - currentTarget.y) * easeOut,
          z: currentTarget.z + (planetPosition.z - currentTarget.z) * easeOut,
        };

        const newPosition = {
          x:
            currentPosition.x +
            (cameraPosition.x - currentPosition.x) * easeOut,
          y:
            currentPosition.y +
            (cameraPosition.y - currentPosition.y) * easeOut,
          z:
            currentPosition.z +
            (cameraPosition.z - currentPosition.z) * easeOut,
        };

        controls.target.set(newTarget.x, newTarget.y, newTarget.z);
        camera.position.set(newPosition.x, newPosition.y, newPosition.z);
        controls.update();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          console.log(
            `Navegação concluída para ${planet.data?.name} em (${planetPosition.x}, ${planetPosition.y}, ${planetPosition.z})`
          );
        }
      };

      animate();
    } catch (error) {
      console.error("Erro ao navegar para o planeta:", error);
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
        console.warn("Câmera ou controles não encontrados");
        return;
      }

      const cameraPosition = {
        x: targetPosition.x + cameraDistance,
        y: targetPosition.y + cameraDistance * 0.3,
        z: targetPosition.z + cameraDistance,
      };

      const currentTarget = controls.target.clone();
      const currentPosition = camera.position.clone();

      const duration = 2000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);

        const newTarget = {
          x: currentTarget.x + (targetPosition.x - currentTarget.x) * easeOut,
          y: currentTarget.y + (targetPosition.y - currentTarget.y) * easeOut,
          z: currentTarget.z + (targetPosition.z - currentTarget.z) * easeOut,
        };

        const newPosition = {
          x:
            currentPosition.x +
            (cameraPosition.x - currentPosition.x) * easeOut,
          y:
            currentPosition.y +
            (cameraPosition.y - currentPosition.y) * easeOut,
          z:
            currentPosition.z +
            (cameraPosition.z - currentPosition.z) * easeOut,
        };

        controls.target.set(newTarget.x, newTarget.y, newTarget.z);
        camera.position.set(newPosition.x, newPosition.y, newPosition.z);
        controls.update();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          console.log(
            `Navegação concluída para posição (${targetPosition.x}, ${targetPosition.y}, ${targetPosition.z})`
          );
        }
      };

      animate();
    } catch (error) {
      console.error("Erro ao navegar para a posição:", error);
    }
  }

  static resetCamera(): void {
    if (typeof window === "undefined") return;

    try {
      const camera = (window as { camera?: THREE.PerspectiveCamera }).camera;
      const controls = (window as { orbit?: OrbitControls }).orbit;

      if (!camera || !controls) {
        console.warn("Câmera ou controles não encontrados");
        return;
      }

      // Posição inicial padrão
      const initialTarget = { x: 0, y: 0, z: 0 };

      this.navigateToPosition(initialTarget, 500);
    } catch (error) {
      console.error("Erro ao resetar câmera:", error);
    }
  }
}
