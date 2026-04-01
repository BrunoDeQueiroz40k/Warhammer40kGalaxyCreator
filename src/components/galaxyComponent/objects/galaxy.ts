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
import { GalaxyEvents } from "@/lib/galaxyEvents";
import { PlanetRoute } from "@/lib/campaignApi";

export class Galaxy {
  scene: THREE.Scene;
  stars: Star[];
  haze: Haze[];
  planets: Planet[];
  private routeGroup: THREE.Group;
  private routes: PlanetRoute[];
  private lastCameraPosition: THREE.Vector3;
  private static CAMERA_MOVE_THRESHOLD = 0.5;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.planets = [];
    this.routes = [];
    this.routeGroup = new THREE.Group();
    this.lastCameraPosition = new THREE.Vector3(Infinity, Infinity, Infinity);
    this.scene.add(this.routeGroup);
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
    const cameraPos = (camera as THREE.Camera & { position: THREE.Vector3 }).position;
    const cameraMoved = this.lastCameraPosition.distanceTo(cameraPos) >= Galaxy.CAMERA_MOVE_THRESHOLD;

    if (cameraMoved) {
      this.stars.forEach((star) => {
        star.updateScale(camera);
      });
      this.haze.forEach((haze) => {
        haze.updateScale(camera);
      });
      this.lastCameraPosition.copy(cameraPos);
    }

    this.planets.forEach((planet) => {
      planet.updateScale(camera);
    });
  }

  getPlanetObjects(): THREE.Object3D[] {
    const result: THREE.Object3D[] = [];
    for (const planet of this.planets) {
      if (planet.obj) result.push(planet.obj);
    }
    return result;
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
    this.rebuildRoutesVisual();
    
    // Disparar evento para salvar imediatamente no cache
    GalaxyEvents.dispatchEvent(GalaxyEvents.EVENTS.PLANET_ADDED);
    
    return planet;
  }

  addPlanetWithoutEditMode(planetData: PlanetData): Planet {
    const planet = new Planet(planetData);
    planet.toThreeObject(this.scene);
    this.planets.push(planet);
    this.rebuildRoutesVisual();
    
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
      this.rebuildRoutesVisual();
      
      // Disparar evento para salvar imediatamente no cache
      GalaxyEvents.dispatchEvent(GalaxyEvents.EVENTS.PLANET_UPDATED);
    }
  }

  removePlanet(planet: Planet): void {
    const index = this.planets.indexOf(planet);
    if (index > -1) {
      planet.removeFromScene(this.scene);
      this.planets.splice(index, 1);
      this.rebuildRoutesVisual();
      
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
    this.rebuildRoutesVisual();
    
    // Disparar evento para salvar imediatamente no cache
    GalaxyEvents.dispatchEvent(GalaxyEvents.EVENTS.GALAXY_CLEARED);
  }

  enterAllPlanetsEditMode(): void {
    this.planets.forEach((planet) => {
      if (!planet.isInEditMode) {
        planet.enterEditMode(this.scene);
      }
    });
  }

  setRoutes(routes: PlanetRoute[]): void {
    this.routes = [...routes];
    this.rebuildRoutesVisual();
  }

  canAttackViaRoute(targetPlanetId: string, playerDomain: string | null): boolean {
    if (!playerDomain) return false;
    const target = this.planets.find((planet) => planet.data.id === targetPlanetId);
    if (!target) return false;
    const targetDomain = target.data.domain ?? target.data.faction ?? "Sem dominio";
    if (targetDomain === playerDomain) return false;

    const ownedIds = new Set(
      this.planets
        .filter((planet) => (planet.data.domain ?? planet.data.faction) === playerDomain)
        .map((planet) => planet.data.id)
        .filter((id): id is string => Boolean(id))
    );
    if (ownedIds.size === 0) return false;

    // Fallback seguro: se rotas ainda nao foram carregadas, permite por proximidade.
    if (this.routes.length === 0) {
      const targetPos = target.position;
      return this.planets.some((planet) => {
        const id = planet.data.id;
        if (!id || !ownedIds.has(id)) return false;
        const d = planet.position.distanceTo(targetPos);
        return d <= 220;
      });
    }

    return this.routes.some((route) => {
      if (route.fromPlanetId === targetPlanetId) return ownedIds.has(route.toPlanetId);
      if (route.toPlanetId === targetPlanetId) return ownedIds.has(route.fromPlanetId);
      return false;
    });
  }

  private clearRouteObjects() {
    this.routeGroup.children.forEach((child) => {
      if (child instanceof THREE.Line) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    this.routeGroup.clear();
  }

  private rebuildRoutesVisual() {
    this.clearRouteObjects();
    const homePlanet = this.planets.find((planet) => planet.data.isHomePlanet);
    const playerDomainCandidate = homePlanet?.data.domain ?? homePlanet?.data.faction ?? null;
    const playerDomain =
      playerDomainCandidate && playerDomainCandidate !== "Sem dominio"
        ? playerDomainCandidate
        : null;

    if (this.routes.length === 0) return;

    const byId = new Map(
      this.planets
        .filter((planet) => !!planet.data.id)
        .map((planet) => [planet.data.id as string, planet])
    );

    const uniqueRoutes = new Map<string, PlanetRoute>();
    for (const route of this.routes) {
      const key =
        route.fromPlanetId < route.toPlanetId
          ? `${route.fromPlanetId}:${route.toPlanetId}`
          : `${route.toPlanetId}:${route.fromPlanetId}`;
      if (!uniqueRoutes.has(key)) {
        uniqueRoutes.set(key, route);
      }
    }

    for (const route of uniqueRoutes.values()) {
      const fromPlanet = byId.get(route.fromPlanetId);
      const toPlanet = byId.get(route.toPlanetId);
      if (!fromPlanet || !toPlanet) continue;

      const fromDomain = fromPlanet.data.domain ?? fromPlanet.data.faction ?? "Sem dominio";
      const toDomain = toPlanet.data.domain ?? toPlanet.data.faction ?? "Sem dominio";
      const isOwnedConnection =
        !!playerDomain && fromDomain === playerDomain && toDomain === playerDomain;

      const points = [
        fromPlanet.position.clone().add(new THREE.Vector3(0, 0, 0.08)),
        toPlanet.position.clone().add(new THREE.Vector3(0, 0, 0.08)),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const baseMaterial = new THREE.LineBasicMaterial({
        color: isOwnedConnection ? 0x15803d : 0x64748b,
        transparent: true,
        opacity: isOwnedConnection ? 0.78 : 0.5,
        depthTest: false,
      });
      const baseLine = new THREE.Line(geometry, baseMaterial);
      baseLine.renderOrder = 12;
      baseLine.userData.isFrontierLine = true;
      this.routeGroup.add(baseLine);
    }
  }
}