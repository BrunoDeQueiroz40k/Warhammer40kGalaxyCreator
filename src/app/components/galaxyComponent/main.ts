import * as THREE from "three";
import { PlanetData } from "./objects/planet";

// Extend window interface for global Three.js objects
declare global {
  interface Window {
    camera?: THREE.PerspectiveCamera;
    renderer?: THREE.WebGLRenderer;
    orbit?: OrbitControls;
  }
}

// Interface for sprite with custom planet properties
interface PlanetSprite extends THREE.Sprite {
  isPlanet?: boolean;
  planetData?: PlanetData;
}

// Data and visualization
import { CompositionShader } from "./shaders/CompositionShader";
import {
  BASE_LAYER,
  BLOOM_LAYER,
  BLOOM_PARAMS,
  OVERLAY_LAYER,
} from "./config/renderConfig";

// Rendering
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { Galaxy } from "./objects/galaxy";
import { Planet } from "./objects/planet";
import { Segmentum, segmentums } from "./objects/segmentum";

// No interface needed for EditIndicator anymore

let canvas!: HTMLCanvasElement;
let renderer!: THREE.WebGLRenderer;
let camera!: THREE.PerspectiveCamera;
let scene!: THREE.Scene;
let orbit!: OrbitControls;
let baseComposer!: EffectComposer;
let bloomComposer!: EffectComposer;
let overlayComposer!: EffectComposer;
let galaxy: Galaxy | null = null;
let segmentumObjects: Segmentum[] = [];

// Planet editing variables
let currentPlanet: Planet | null = null;
let planetMoveSpeed = 0.1; // Base movement speed

// Planet click detection
let raycaster: THREE.Raycaster;
let mouse: THREE.Vector2;

// Camera and renderer will be exposed globally after initialization

function setupPlanetEditing() {
  // Add keyboard event listeners for planet movement
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  // Add click event listener for planet selection
  canvas.addEventListener("click", onCanvasClick);
}

function onCanvasClick(event: MouseEvent) {
  console.log("Canvas clicked!", event);
  if (!galaxy) {
    console.log("No galaxy instance found");
    return;
  }

  // Only handle left clicks for planet selection
  if (event.button !== 0) return;

  // Calculate mouse position in normalized device coordinates
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  console.log("Mouse position:", mouse);

  // Update raycaster
  raycaster.setFromCamera(mouse, camera);

  // Get all planets from galaxy
  const planets = galaxy.getPlanets();
  console.log("Total planets:", planets.length);
  const planetObjects = planets
    .map((planet) => planet.obj)
    .filter((obj) => obj !== null);
  console.log("Planet objects:", planetObjects.length);

  // Check for intersections with different approaches
  raycaster.near = 0;
  raycaster.far = 1000000; // Very large far distance

  // Try intersection with all objects first
  const allIntersects = raycaster.intersectObjects(scene.children);
  console.log("All scene intersections found:", allIntersects.length);

  // Also try intersection with bloom layer objects (where planets are)
  raycaster.layers.set(BLOOM_LAYER);
  const bloomIntersects = raycaster.intersectObjects(scene.children);
  console.log("Bloom layer intersections found:", bloomIntersects.length);

  // Combine and sort intersections by renderOrder (highest first) to prioritize planets
  const combinedIntersects = [...allIntersects, ...bloomIntersects];
  combinedIntersects.sort(
    (a, b) => (b.object.renderOrder || 0) - (a.object.renderOrder || 0)
  );

  // Reset raycaster to default layer
  raycaster.layers.set(0);

  // Log the first few intersections to see what's blocking
  combinedIntersects.slice(0, 5).forEach((intersect, index) => {
    console.log(`Combined Intersection ${index}:`, {
      object: intersect.object,
      distance: intersect.distance,
      point: intersect.point.toArray(),
      uuid: intersect.object.uuid,
      renderOrder: intersect.object.renderOrder,
      layers: intersect.object.layers.mask,
    });
  });

  // Then try with just planets
  const intersects = raycaster.intersectObjects(planetObjects);
  console.log("Planet intersections found:", intersects.length);

  // Try with recursive search
  const recursiveIntersects = raycaster.intersectObjects(planetObjects, true);
  console.log(
    "Recursive planet intersections found:",
    recursiveIntersects.length
  );

  // Debug: Log planet positions and sizes
  planets.forEach((planet, index) => {
    if (planet.obj) {
      console.log(`Planet ${index}:`, {
        position: planet.obj.position.toArray(),
        scale: planet.obj.scale.toArray(),
        visible: planet.obj.visible,
        renderOrder: planet.obj.renderOrder,
        layers: planet.obj.layers.mask,
      });
    }
  });

  // Debug: Log raycaster details
  console.log("Raycaster:", {
    ray: {
      origin: raycaster.ray.origin.toArray(),
      direction: raycaster.ray.direction.toArray(),
    },
    near: raycaster.near,
    far: raycaster.far,
  });

  // Debug: Log camera position
  console.log("Camera position:", camera.position.toArray());

  // Check if any of the intersections are planets
  let clickedPlanet = null;

  // First try direct planet intersections
  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    clickedPlanet = planets.find((planet) => planet.obj === clickedObject);
  }

  // If no direct planet intersection, check all intersections for planets
  // Since we sorted by renderOrder, check the first intersection (highest priority)
  if (!clickedPlanet && combinedIntersects.length > 0) {
    const firstIntersect = combinedIntersects[0];
    console.log("Checking first intersection (highest renderOrder):", {
      renderOrder: firstIntersect.object.renderOrder,
      uuid: firstIntersect.object.uuid,
      isPlanet: (firstIntersect.object as PlanetSprite).isPlanet,
    });

    // Check if the first intersected object is a planet using custom property
    if ((firstIntersect.object as PlanetSprite).isPlanet) {
      const planetData = (firstIntersect.object as PlanetSprite).planetData;
      clickedPlanet = planets.find((planet) => planet.data === planetData);
      console.log("Found planet using isPlanet property:", planetData);
      console.log("Intersected object UUID:", firstIntersect.object.uuid);
    } else {
      // Fallback: check by UUID
      const planet = planets.find(
        (planet) => planet.obj && planet.obj.uuid === firstIntersect.object.uuid
      );
      if (planet && planet.obj) {
        clickedPlanet = planet;
        console.log("Found planet in all intersections:", planet.data);
        console.log("Planet UUID:", planet.obj.uuid);
        console.log("Intersected object UUID:", firstIntersect.object.uuid);
      }
    }
  }

  if (clickedPlanet) {
    // Prevent orbit controls from processing this click
    event.stopPropagation();
    event.preventDefault();

    console.log("Planet clicked:", clickedPlanet.data);
    // Dispatch custom event with planet data
    const planetClickEvent = new CustomEvent("planetClick", {
      detail: { planet: clickedPlanet },
    });
    window.dispatchEvent(planetClickEvent);
  } else {
    console.log("No planet intersection found");
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (!galaxy) return;

  const planetInEditMode = galaxy.getPlanetInEditMode();
  if (!planetInEditMode) return;

  // Set current planet for movement
  if (!currentPlanet) {
    currentPlanet = planetInEditMode;

    console.log("Planet movement started");
    console.log(
      "Controls: W/A/S/D (X/Z), Q/E (Y), R (speed up), T (speed down)"
    );
    console.log("Current speed:", planetMoveSpeed);
  }

  const key = event.key.toLowerCase();

  switch (key) {
    case "e": // Move forward (Z+)
      movePlanet(0, 0, planetMoveSpeed);
      break;
    case "q": // Move backward (Z-)
      movePlanet(0, 0, -planetMoveSpeed);
      break;
    case "d": // Move left (X-)
      movePlanet(-planetMoveSpeed, 0, 0);
      break;
    case "a": // Move right (X+)
      movePlanet(planetMoveSpeed, 0, 0);
      break;
    case "s": // Move up (Y+)
      movePlanet(0, planetMoveSpeed, 0);
      break;
    case "w": // Move down (Y-)
      movePlanet(0, -planetMoveSpeed, 0);
      break;
    case "r": // Increase speed
      planetMoveSpeed = Math.min(planetMoveSpeed * 1.5, 100);
      console.log("Planet speed increased to:", planetMoveSpeed);
      break;
    case "t": // Decrease speed
      planetMoveSpeed = Math.max(planetMoveSpeed * 0.7, 0.1);
      console.log("Planet speed decreased to:", planetMoveSpeed);
      break;
    case "enter": // Confirm planet position
      if (galaxy && currentPlanet) {
        galaxy.confirmPlanetPosition(currentPlanet);
        clearCurrentPlanet();
        console.log("Planet position confirmed");
      }
      break;
    case "escape": // Cancel planet editing
      if (galaxy && currentPlanet) {
        galaxy.removePlanet(currentPlanet);
        clearCurrentPlanet();
        console.log("Planet editing cancelled");
      }
      break;
  }
}

function onKeyUp(event: KeyboardEvent) {
  const key = event.key.toLowerCase();

  // Stop movement when movement keys are released
  if (["w", "a", "s", "d", "q", "e"].includes(key)) {
  }
}

function movePlanet(deltaX: number, deltaY: number, deltaZ: number) {
  if (!currentPlanet) return;

  const newPosition = currentPlanet.position.clone();
  newPosition.add(new THREE.Vector3(deltaX, deltaY, deltaZ));

  currentPlanet.updatePosition(newPosition);
  console.log("Planet moved to:", newPosition);
}

function clearCurrentPlanet() {
  currentPlanet = null;
}

function createSegmentums() {
  // Clear existing segmentums
  segmentumObjects.forEach((segmentum) => {
    scene.remove(segmentum.obj);
  });
  segmentumObjects = [];

  // Create new segmentums
  segmentums.forEach((segmentumData) => {
    const segmentum = new Segmentum(segmentumData, scene);
    segmentumObjects.push(segmentum);
  });
}

function toggleSegmentums(show: boolean) {
  segmentumObjects.forEach((segmentum) => {
    segmentum.toggleVisibility(show);
  });
}

function updateSegmentumVisibility() {
  segmentumObjects.forEach((segmentum) => {
    segmentum.updateVisibility(camera);
  });
}

function initThree(): void {
  // grab canvas
  canvas = document.querySelector("#canvas") as HTMLCanvasElement;

  // scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xebe2db, 0.00003);

  // camera
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    5000000
  );
  camera.position.set(0, 500, 500);
  camera.up.set(0, 0, 1);
  camera.lookAt(0, 0, 0);

  window.camera = camera;

  // map orbit
  orbit = new OrbitControls(camera, canvas);
  window.orbit = orbit;
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.05;
  orbit.screenSpacePanning = false;
  orbit.minDistance = 1;
  orbit.maxDistance = 16384;
  orbit.maxPolarAngle = Math.PI / 2 - Math.PI / 360;

  initRenderPipeline();

  galaxy = new Galaxy(scene);

  // Create segmentums
  createSegmentums();

  // Expose galaxy instance and segmentum functions globally
  (
    window as {
      galaxyInstance?: Galaxy;
      toggleSegmentums?: (show: boolean) => void;
    }
  ).galaxyInstance = galaxy;

  (
    window as {
      galaxyInstance?: Galaxy;
      toggleSegmentums?: (show: boolean) => void;
    }
  ).toggleSegmentums = toggleSegmentums;

  // Expor funções simples de controle
  (
    window as {
      setPosicaoSegmentums?: (x: number, y: number, z: number) => void;
    }
  ).setPosicaoSegmentums = (x: number, y: number, z: number) => {
    Segmentum.setPosicao(x, y, z);
  };

  (
    window as { setRotacaoSegmentums?: (angulo: number) => void }
  ).setRotacaoSegmentums = (angulo: number) => {
    Segmentum.setRotacao(angulo);
  };

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  setupPlanetEditing();
}

function initRenderPipeline(): void {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
    logarithmicDepthBuffer: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;

  window.renderer = renderer;

  const renderScene = new RenderPass(scene, camera);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = BLOOM_PARAMS.bloomThreshold;
  bloomPass.strength = BLOOM_PARAMS.bloomStrength;
  bloomPass.radius = BLOOM_PARAMS.bloomRadius;

  bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(bloomPass);

  overlayComposer = new EffectComposer(renderer);
  overlayComposer.renderToScreen = false;
  overlayComposer.addPass(renderScene);

  const finalPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture },
        overlayTexture: { value: overlayComposer.renderTarget2.texture },
      },
      vertexShader: CompositionShader.vertex,
      fragmentShader: CompositionShader.fragment,
      defines: {},
    }),
    "baseTexture"
  );
  finalPass.needsSwap = true;

  baseComposer = new EffectComposer(renderer);
  baseComposer.addPass(renderScene);
  baseComposer.addPass(finalPass);
}

function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer): boolean {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

async function render(): Promise<void> {
  orbit.update();

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  const canvas = renderer.domElement;
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();

  if (galaxy) {
    galaxy.updateScale(camera);

    if (currentPlanet && !currentPlanet.isInEditMode) {
      clearCurrentPlanet();
    }
  }

  // Update segmentum visibility based on camera position
  updateSegmentumVisibility();

  renderPipeline();

  requestAnimationFrame(render);
}

function renderPipeline(): void {
  camera.layers.set(BLOOM_LAYER);
  bloomComposer.render();

  camera.layers.set(OVERLAY_LAYER);
  overlayComposer.render();

  camera.layers.set(BASE_LAYER);
  baseComposer.render();
}

initThree();
const axes = new THREE.AxesHelper(5.0);
scene.add(axes);

requestAnimationFrame(render);
