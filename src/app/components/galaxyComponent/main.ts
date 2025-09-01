import * as THREE from "three";

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

// Planet editing variables
let currentPlanet: Planet | null = null;
let planetMoveSpeed = 0.1; // Base movement speed
let isMovingPlanet = false;

function setupPlanetEditing() {
  // Add keyboard event listeners for planet movement
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
}

function onKeyDown(event: KeyboardEvent) {
  if (!galaxy) return;

  const planetInEditMode = galaxy.getPlanetInEditMode();
  if (!planetInEditMode) return;

  // Set current planet for movement
  if (!currentPlanet) {
    currentPlanet = planetInEditMode;
    isMovingPlanet = true;
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
  }
}

function onKeyUp(event: KeyboardEvent) {
  const key = event.key.toLowerCase();

  // Stop movement when movement keys are released
  if (["w", "a", "s", "d", "q", "e"].includes(key)) {
    isMovingPlanet = false;
  }
}

function movePlanet(deltaX: number, deltaY: number, deltaZ: number) {
  if (!currentPlanet) return;

  const newPosition = currentPlanet.position.clone();
  newPosition.add(new THREE.Vector3(deltaX, deltaY, deltaZ));

  currentPlanet.updatePosition(newPosition);
  console.log("Planet moved to:", newPosition);
}

// Function to clear current planet when it exits edit mode
function clearCurrentPlanet() {
  currentPlanet = null;
  isMovingPlanet = false;
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

  // map orbit
  orbit = new OrbitControls(camera, canvas);
  orbit.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  orbit.dampingFactor = 0.05;
  orbit.screenSpacePanning = false;
  orbit.minDistance = 1;
  orbit.maxDistance = 16384;
  orbit.maxPolarAngle = Math.PI / 2 - Math.PI / 360;

  initRenderPipeline();

  // Create galaxy instance
  galaxy = new Galaxy(scene);

  // Expose galaxy instance globally for external access
  (window as { galaxyInstance?: Galaxy }).galaxyInstance = galaxy;

  // Add event listeners for planet editing
  setupPlanetEditing();
}

function initRenderPipeline(): void {
  // Assign Renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
    logarithmicDepthBuffer: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  // three r179 uses outputColorSpace instead of outputEncoding
  // @ts-expect-error: outputColorSpace is the correct property on modern three
  renderer.outputColorSpace = THREE.SRGBColorSpace as unknown as number;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;

  // General-use rendering pass for chaining
  const renderScene = new RenderPass(scene, camera);

  // Rendering pass for bloom
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = BLOOM_PARAMS.bloomThreshold;
  bloomPass.strength = BLOOM_PARAMS.bloomStrength;
  bloomPass.radius = BLOOM_PARAMS.bloomRadius;

  // bloom composer
  bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(bloomPass);

  // overlay composer
  overlayComposer = new EffectComposer(renderer);
  overlayComposer.renderToScreen = false;
  overlayComposer.addPass(renderScene);

  // Shader pass to combine base layer, bloom, and overlay layers
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

  // base layer composer
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

  // fix buffer size
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  // fix aspect ratio
  const canvas = renderer.domElement;
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();

  if (galaxy) {
    galaxy.updateScale(camera);

    // Check if current planet is still in edit mode
    if (currentPlanet && !currentPlanet.isInEditMode) {
      clearCurrentPlanet();
    }
  }

  // Run each pass of the render pipeline
  renderPipeline();

  requestAnimationFrame(render);
}

function renderPipeline(): void {
  // Render bloom
  camera.layers.set(BLOOM_LAYER);
  bloomComposer.render();

  // Render overlays
  camera.layers.set(OVERLAY_LAYER);
  overlayComposer.render();

  // Render normal
  camera.layers.set(BASE_LAYER);
  baseComposer.render();
}

initThree();
const axes = new THREE.AxesHelper(5.0);
scene.add(axes);

requestAnimationFrame(render);
