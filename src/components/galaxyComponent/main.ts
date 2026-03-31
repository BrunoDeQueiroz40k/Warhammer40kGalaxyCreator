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

let currentPlanet: Planet | null = null;
let planetMoveSpeed = 0.1; // Base movement speed

// Planet click detection
let raycaster: THREE.Raycaster;
let mouse: THREE.Vector2;

function setupPlanetEditing() {
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  canvas.addEventListener("click", onCanvasClick);
}

function onCanvasClick(event: MouseEvent) {
  if (!galaxy) {
    return;
  }

  if (event.button !== 0) return;

  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const planets = galaxy.getPlanets();
  const planetObjects = planets
    .map((planet) => planet.obj)
    .filter((obj) => obj !== null);

  raycaster.near = 0;
  raycaster.far = 1000000; // Very large far distance

  const allIntersects = raycaster.intersectObjects(scene.children);

  raycaster.layers.set(BLOOM_LAYER);
  const bloomIntersects = raycaster.intersectObjects(scene.children);

  const combinedIntersects = [...allIntersects, ...bloomIntersects];
  combinedIntersects.sort(
    (a, b) => (b.object.renderOrder || 0) - (a.object.renderOrder || 0)
  );

  raycaster.layers.set(0);

  const intersects = raycaster.intersectObjects(planetObjects);

  let clickedPlanet = null;

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    clickedPlanet = planets.find((planet) => planet.obj === clickedObject);
  }

  if (!clickedPlanet && combinedIntersects.length > 0) {
    const firstIntersect = combinedIntersects[0];

    if ((firstIntersect.object as PlanetSprite).isPlanet) {
      const planetData = (firstIntersect.object as PlanetSprite).planetData;
      clickedPlanet = planets.find((planet) => planet.data === planetData);
    } else {
      const planet = planets.find(
        (planet) => planet.obj && planet.obj.uuid === firstIntersect.object.uuid
      );
      if (planet && planet.obj) {
        clickedPlanet = planet;
      }
    }
  }

  if (clickedPlanet) {
    event.stopPropagation();
    event.preventDefault();

    const planetClickEvent = new CustomEvent("planetClick", {
      detail: { planet: clickedPlanet },
    });
    window.dispatchEvent(planetClickEvent);
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (!galaxy) return;

  const planetInEditMode = galaxy.getPlanetInEditMode();
  if (!planetInEditMode) return;

  // Set current planet for movement
  if (!currentPlanet) {
    currentPlanet = planetInEditMode;
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
      break;
    case "t": // Decrease speed
      planetMoveSpeed = Math.max(planetMoveSpeed * 0.7, 0.1);
      break;
    case "enter": // Confirm planet position
      if (galaxy && currentPlanet) {
        galaxy.confirmPlanetPosition(currentPlanet);
        clearCurrentPlanet();
      }
      break;
    case "escape": // Cancel planet editing
      if (galaxy && currentPlanet) {
        galaxy.removePlanet(currentPlanet);
        clearCurrentPlanet();
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
}

function clearCurrentPlanet() {
  currentPlanet = null;
}

function createSegmentums() {
  segmentumObjects.forEach((segmentum) => {
    scene.remove(segmentum.obj);
  });
  segmentumObjects = [];

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
  setupWindowResize();
}

function setupWindowResize() {
  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  if (!camera || !renderer || !canvas) return;

  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;

  camera.aspect = canvasWidth / canvasHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvasWidth, canvasHeight, false);
  renderer.setPixelRatio(window.devicePixelRatio);

  if (bloomComposer) {
    const bloomPass = bloomComposer.passes[1] as UnrealBloomPass;
    if (bloomPass) {
      bloomPass.setSize(canvasWidth, canvasHeight);
    }
  }

  // Update composers
  if (baseComposer) {
    baseComposer.setSize(canvasWidth, canvasHeight);
  }
  if (bloomComposer) {
    bloomComposer.setSize(canvasWidth, canvasHeight);
  }
  if (overlayComposer) {
    overlayComposer.setSize(canvasWidth, canvasHeight);
  }
}

function initRenderPipeline(): void {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
    logarithmicDepthBuffer: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
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
    renderer.setPixelRatio(window.devicePixelRatio);
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
