import * as THREE from "three";
import { Star } from "./star";
import {
  ARMS,
  ARM_X_DIST,
  ARM_X_MEAN,
  ARM_Y_DIST,
  ARM_Y_MEAN,
  CORE_X_DIST,
  CORE_Y_DIST,
  GALAXY_THICKNESS,
  HAZE_RATIO,
  NUM_STARS,
  OUTER_CORE_X_DIST,
  OUTER_CORE_Y_DIST,
} from "../config/galaxyConfig";
import { gaussianRandom, spiral } from "../utils";
import { mulberry32 } from "../prng";
import { Haze } from "./haze";
import { Planet, PlanetData } from "./planet";
import { GalaxyEvents } from "../../../../lib/galaxyEvents";

export class Galaxy {
  scene: THREE.Scene;
  stars: Star[];
  haze: Haze[];
  planets: Planet[];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.planets = [];
    const rand = mulberry32(123456);
    this.stars = this.generateObject(
      NUM_STARS,
      (pos: THREE.Vector3) => new Star(pos),
      rand
    );
    this.haze = this.generateObject(
      NUM_STARS * HAZE_RATIO,
      (pos: THREE.Vector3) => new Haze(pos),
      rand
    );

    this.stars.forEach((star) => star.toThreeObject(scene));
    this.haze.forEach((haze) => haze.toThreeObject(scene));
  }

  updateScale(camera: THREE.Camera) {
    this.stars.forEach((star) => {
      star.updateScale(camera);
    });
    this.haze.forEach((haze) => {
      haze.updateScale(camera);
    });
    this.planets.forEach((planet) => {
      planet.updateScale(camera);
    });
  }

  generateObject<T>(
    numStars: number,
    generator: (pos: THREE.Vector3) => T,
    rand: () => number
  ): T[] {
    const objects: T[] = [];

    for (let i = 0; i < numStars / 4; i++) {
      const pos = new THREE.Vector3(
        gaussianRandom(0, CORE_X_DIST, rand),
        gaussianRandom(0, CORE_Y_DIST, rand),
        gaussianRandom(0, GALAXY_THICKNESS, rand)
      );
      const obj = generator(pos);
      objects.push(obj);
    }

    for (let i = 0; i < numStars / 4; i++) {
      const pos = new THREE.Vector3(
        gaussianRandom(0, OUTER_CORE_X_DIST, rand),
        gaussianRandom(0, OUTER_CORE_Y_DIST, rand),
        gaussianRandom(0, GALAXY_THICKNESS, rand)
      );
      const obj = generator(pos);
      objects.push(obj);
    }

    for (let j = 0; j < ARMS; j++) {
      for (let i = 0; i < numStars / 4; i++) {
        const pos = spiral(
          gaussianRandom(ARM_X_MEAN, ARM_X_DIST, rand),
          gaussianRandom(ARM_Y_MEAN, ARM_Y_DIST, rand),
          gaussianRandom(0, GALAXY_THICKNESS, rand),
          (j * 2 * Math.PI) / ARMS
        );
        const obj = generator(pos);
        objects.push(obj);
      }
    }

    return objects;
  }

  addPlanet(planetData: PlanetData): Planet {
    const planet = new Planet(planetData);
    planet.toThreeObject(this.scene);
    planet.enterEditMode(this.scene);
    this.planets.push(planet);
    
    // Disparar evento para salvar imediatamente no cache
    GalaxyEvents.dispatchEvent(GalaxyEvents.EVENTS.PLANET_ADDED);
    
    return planet;
  }

  addPlanetWithoutEditMode(planetData: PlanetData): Planet {
    const planet = new Planet(planetData);
    planet.toThreeObject(this.scene);
    this.planets.push(planet);
    
    // Disparar evento para salvar imediatamente no cache
    GalaxyEvents.dispatchEvent(GalaxyEvents.EVENTS.PLANET_ADDED);
    
    return planet;
  }

  getPlanetInEditMode(): Planet | null {
    return this.planets.find((planet) => planet.isInEditMode) || null;
  }

  confirmPlanetPosition(planet: Planet) {
    planet.exitEditMode(this.scene);
    
    // Atualizar a posição no data do planeta
    planet.data.position = {
      x: planet.position.x,
      y: planet.position.y,
      z: planet.position.z,
    };
    
    // Disparar evento para salvar imediatamente no cache
    GalaxyEvents.dispatchEvent(GalaxyEvents.EVENTS.PLANET_UPDATED);
  }

  updatePlanet(updatedPlanetData: PlanetData): void {
    // Tentar encontrar o planeta por nome
    let planet = this.planets.find(p => p.data.name === updatedPlanetData.name);
    
    if (!planet) {
      // Tentar encontrar por outros critérios se o nome mudou
      planet = this.planets.find(p => 
        p.data.faction === updatedPlanetData.faction && 
        p.data.planetType === updatedPlanetData.planetType &&
        Math.abs(p.position.x - updatedPlanetData.position.x) < 0.1 &&
        Math.abs(p.position.y - updatedPlanetData.position.y) < 0.1 &&
        Math.abs(p.position.z - updatedPlanetData.position.z) < 0.1
      );
    }
    
    if (planet) {
      // Atualizar dados do planeta
      planet.data = { ...updatedPlanetData };
      
      // Atualizar posição se necessário
      planet.position.set(updatedPlanetData.position.x, updatedPlanetData.position.y, updatedPlanetData.position.z);
      
      // Atualizar visual do planeta
      planet.updateVisual();
      
      // Disparar evento para salvar imediatamente no cache
      GalaxyEvents.dispatchEvent(GalaxyEvents.EVENTS.PLANET_UPDATED);
    }
  }

  removePlanet(planet: Planet): void {
    const index = this.planets.indexOf(planet);
    if (index > -1) {
      planet.removeFromScene(this.scene);
      this.planets.splice(index, 1);
      
      // Disparar evento para salvar imediatamente no cache
      GalaxyEvents.dispatchEvent(GalaxyEvents.EVENTS.PLANET_REMOVED);
    }
  }

  removePlanetByData(planetData: PlanetData): void {
    const planet = this.planets.find(p => p.data.name === planetData.name);
    if (planet) {
      this.removePlanet(planet);
    }
  }

  getPlanets(): Planet[] {
    return this.planets;
  }

  clearAllPlanets(): void {
    this.planets.forEach((planet) => {
      planet.removeFromScene(this.scene);
    });
    this.planets = [];
    
    // Disparar evento para salvar imediatamente no cache
    GalaxyEvents.dispatchEvent(GalaxyEvents.EVENTS.GALAXY_CLEARED);
  }

  getAllPlanetsData(): Planet[] {
    return [...this.planets];
  }

  enterAllPlanetsEditMode(): void {
    this.planets.forEach((planet) => {
      if (!planet.isInEditMode) {
        planet.enterEditMode(this.scene);
      }
    });
  }
}
