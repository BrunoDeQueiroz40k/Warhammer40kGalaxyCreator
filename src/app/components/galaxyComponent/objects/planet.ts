import * as THREE from "three";
import { BLOOM_LAYER, STAR_MAX, STAR_MIN } from "../config/renderConfig";
import { starTypes } from "../config/starDistributions";
import { clamp } from "../utils";

interface EditIndicator extends THREE.Sprite {
    ring?: THREE.Mesh;
}

const texture = new THREE.TextureLoader().load('/assets/GalaxyMap/sprite120.png');
const materials: THREE.SpriteMaterial[] = starTypes.color.map((color: number) => new THREE.SpriteMaterial({ map: texture, color }));

export interface PlanetData {
  name: string;
  faction: string;
  planetType: string;
  description: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

export class Planet {
    position: THREE.Vector3;
    starType: number;
    obj: THREE.Sprite | null;
    data: PlanetData;
    isInEditMode: boolean;
    editIndicator: THREE.Sprite | null;

    constructor(data: PlanetData) {
        this.data = data;
        this.position = new THREE.Vector3(data.position.x, data.position.y, data.position.z);
        this.starType = this.generateStarType();
        this.obj = null;
        this.isInEditMode = false;
        this.editIndicator = null;
    }

    private generateStarType(): number {
        let num = Math.random() * 100.0;
        const pct = starTypes.percentage;
        for (let i = 0; i < pct.length; i++) {
            num -= pct[i];
            if (num < 0) {
                return i;
            }
        }
        return 0;
    }

    updateScale(camera: THREE.Camera) {
        const dist = this.position.distanceTo((camera as THREE.Camera & { position: THREE.Vector3 }).position) / 250;

        // update planet size
        let planetSize = dist * starTypes.size[this.starType];
        planetSize = clamp(planetSize, STAR_MIN, STAR_MAX);
        this.obj?.scale.copy(new THREE.Vector3(planetSize, planetSize, planetSize));
    }

    toThreeObject(scene: THREE.Scene) {
        const sprite = new THREE.Sprite(materials[this.starType]);
        sprite.layers.set(BLOOM_LAYER);

        sprite.scale.multiplyScalar(starTypes.size[this.starType]);
        sprite.position.copy(this.position);

        // Make planet more visible and easier to interact with
        sprite.renderOrder = 1000; // Render on top
        sprite.material.depthTest = false; // Always render on top

        this.obj = sprite;

        scene.add(sprite);
    }

    removeFromScene(scene: THREE.Scene) {
        if (this.obj) {
            scene.remove(this.obj);
            this.obj = null;
        }
        if (this.editIndicator) {
            scene.remove(this.editIndicator);
            this.editIndicator = null;
        }
    }

    enterEditMode(scene: THREE.Scene) {
        this.isInEditMode = true;
        this.createEditIndicator(scene);
    }

    exitEditMode(scene: THREE.Scene) {
        this.isInEditMode = false;
        if (this.editIndicator) {
            // Remove the arrow indicator
            scene.remove(this.editIndicator);
            
            // Remove the ring if it exists
            const indicator = this.editIndicator as EditIndicator;
            if (indicator.ring) {
                scene.remove(indicator.ring);
            }
            
            this.editIndicator = null;
        }
    }

    private createEditIndicator(scene: THREE.Scene) {
        // Create a small directional arrow indicator using sprite
        const arrowTexture = new THREE.TextureLoader().load('/assets/GalaxyMap/sprite120.png');
        const arrowMaterial = new THREE.SpriteMaterial({ 
            map: arrowTexture,
            color: 0x00ff00, 
            transparent: true, 
            opacity: 0.9
        });
        
        this.editIndicator = new THREE.Sprite(arrowMaterial);
        this.editIndicator.position.copy(this.position);
        this.editIndicator.position.y += 25; // Position above the planet
        this.editIndicator.scale.set(15, 15, 15); // Small size
        this.editIndicator.layers.set(BLOOM_LAYER);
        this.editIndicator.renderOrder = 1001; // Render above planet
        (this.editIndicator.material as THREE.Material).depthTest = false; // Always visible
        
        // Add a border ring around the planet
        const ringGeometry = new THREE.RingGeometry(12, 16, 16);
        const ringMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            transparent: true, 
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2; // Lay flat
        ring.position.copy(this.position);
        ring.layers.set(BLOOM_LAYER);
        ring.renderOrder = 1001; // Render above planet
        (ring.material as THREE.Material).depthTest = false; // Always visible
        
        // Add ring to scene
        scene.add(ring);
        
        // Store ring reference for cleanup
        (this.editIndicator as EditIndicator).ring = ring;
        
        scene.add(this.editIndicator);
    }

    updatePosition(newPosition: THREE.Vector3) {
        this.position.copy(newPosition);
        if (this.obj) {
            this.obj.position.copy(newPosition);
        }
        if (this.editIndicator) {
            this.editIndicator.position.copy(newPosition);
            this.editIndicator.position.y = newPosition.y + 25; // Keep arrow above
            
            // Update ring position
            const indicator = this.editIndicator as EditIndicator;
            if (indicator.ring) {
                indicator.ring.position.copy(newPosition);
            }
        }
    }
}
