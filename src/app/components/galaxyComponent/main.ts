import * as THREE from 'three'

// Data and visualization
import { CompositionShader } from './shaders/CompositionShader';
import { BASE_LAYER, BLOOM_LAYER, BLOOM_PARAMS, OVERLAY_LAYER } from "./config/renderConfig";

// Rendering
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { Galaxy } from './objects/galaxy';
import { Planet } from './objects/planet';

interface EditIndicator extends THREE.Sprite {
    ring?: THREE.Mesh;
}

let canvas!: HTMLCanvasElement
let renderer!: THREE.WebGLRenderer
let camera!: THREE.PerspectiveCamera
let scene!: THREE.Scene
let orbit!: OrbitControls
let baseComposer!: EffectComposer
let bloomComposer!: EffectComposer
let overlayComposer!: EffectComposer
let galaxy: Galaxy | null = null

// Planet editing variables
let isDraggingPlanet = false;
let currentPlanet: Planet | null = null;
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

function setupPlanetEditing() {
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
}

function onMouseDown(event: MouseEvent) {
    if (!galaxy) return;
    
    const planetInEditMode = galaxy.getPlanetInEditMode();
    if (!planetInEditMode) return;
    
    console.log("Planet in edit mode found:", planetInEditMode);
    
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Raycast to check if we clicked on the planet or its indicator
    raycaster.setFromCamera(mouse, camera);
    
    // Check for intersection with the planet sprite
    const planetIntersects = raycaster.intersectObject(planetInEditMode.obj!);
    
    // Check for intersection with the edit indicator (arrow)
    const indicatorIntersects = planetInEditMode.editIndicator ? 
        raycaster.intersectObject(planetInEditMode.editIndicator) : [];
    
    // Check for intersection with the ring
    const indicator = planetInEditMode.editIndicator as EditIndicator;
    const ringIntersects = indicator && indicator.ring ? 
        raycaster.intersectObject(indicator.ring) : [];
    
    console.log("Mouse click detected:", {
        planetIntersects: planetIntersects.length,
        indicatorIntersects: indicatorIntersects.length,
        ringIntersects: ringIntersects.length,
        mouse: { x: mouse.x, y: mouse.y },
        planetPosition: planetInEditMode.position,
        cameraPosition: camera.position
    });
    
    // For now, let's enable drag on any click when there's a planet in edit mode
    // This will help us test if the drag system works
    if (planetInEditMode) {
        isDraggingPlanet = true;
        currentPlanet = planetInEditMode;
        orbit.enabled = false; // Disable orbit controls while dragging
        console.log("Planet drag started (forced)");
    }
}

function onMouseMove(event: MouseEvent) {
    if (!isDraggingPlanet || !currentPlanet || !galaxy) return;
    
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Create a plane at the planet's Z position for dragging
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), currentPlanet.position.z);
    raycaster.setFromCamera(mouse, camera);
    
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectPoint);
    
    if (intersectPoint) {
        currentPlanet.updatePosition(intersectPoint);
        console.log("Planet moved to:", intersectPoint);
    } else {
        console.log("No intersection point found for mouse position:", mouse);
    }
}

function onMouseUp(event: MouseEvent) {
    if (isDraggingPlanet) {
        isDraggingPlanet = false;
        currentPlanet = null;
        orbit.enabled = true; // Re-enable orbit controls
    }
}

function initThree(): void {

    // grab canvas
    canvas = document.querySelector('#canvas') as HTMLCanvasElement;

    // scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xEBE2DB, 0.00003);

    // camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000000);
    camera.position.set(0, 500, 500);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    // map orbit
    orbit = new OrbitControls(camera, canvas)
    orbit.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    orbit.dampingFactor = 0.05;
    orbit.screenSpacePanning = false;
    orbit.minDistance = 1;
    orbit.maxDistance = 16384;
    orbit.maxPolarAngle = (Math.PI / 2) - (Math.PI / 360)

    initRenderPipeline()

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
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    // three r179 uses outputColorSpace instead of outputEncoding
    // @ts-expect-error: outputColorSpace is the correct property on modern three
    renderer.outputColorSpace = THREE.SRGBColorSpace as unknown as number
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.5

    // General-use rendering pass for chaining
    const renderScene = new RenderPass(scene, camera)

    // Rendering pass for bloom
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
    bloomPass.threshold = BLOOM_PARAMS.bloomThreshold
    bloomPass.strength = BLOOM_PARAMS.bloomStrength
    bloomPass.radius = BLOOM_PARAMS.bloomRadius

    // bloom composer
    bloomComposer = new EffectComposer(renderer)
    bloomComposer.renderToScreen = false
    bloomComposer.addPass(renderScene)
    bloomComposer.addPass(bloomPass)

    // overlay composer
    overlayComposer = new EffectComposer(renderer)
    overlayComposer.renderToScreen = false
    overlayComposer.addPass(renderScene)

    // Shader pass to combine base layer, bloom, and overlay layers
    const finalPass = new ShaderPass(
        new THREE.ShaderMaterial({
            uniforms: {
                baseTexture: { value: null },
                bloomTexture: { value: bloomComposer.renderTarget2.texture },
                overlayTexture: { value: overlayComposer.renderTarget2.texture }
            },
            vertexShader: CompositionShader.vertex,
            fragmentShader: CompositionShader.fragment,
            defines: {}
        }), 'baseTexture'
    );
    finalPass.needsSwap = true;

    // base layer composer
    baseComposer = new EffectComposer(renderer)
    baseComposer.addPass(renderScene)
    baseComposer.addPass(finalPass)
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

    orbit.update()

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
        galaxy.updateScale(camera)
    }

    // Run each pass of the render pipeline
    renderPipeline()

    requestAnimationFrame(render)

}

function renderPipeline(): void {

    // Render bloom
    camera.layers.set(BLOOM_LAYER)
    bloomComposer.render()

    // Render overlays
    camera.layers.set(OVERLAY_LAYER)
    overlayComposer.render()

    // Render normal
    camera.layers.set(BASE_LAYER)
    baseComposer.render()

}

initThree()
const axes = new THREE.AxesHelper(5.0)
scene.add(axes)

requestAnimationFrame(render)
