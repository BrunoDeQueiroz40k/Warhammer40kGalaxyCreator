import * as THREE from 'three';
import { BLOOM_LAYER, STAR_MAX, STAR_MIN } from '../config/renderConfig';
import { starTypes } from '../config/starDistributions';
import { clamp } from '../utils';

const texture = new THREE.TextureLoader().load('/assets/GalaxyMap/sprite120.png');
const materials: THREE.SpriteMaterial[] = starTypes.color.map((color: number) => new THREE.SpriteMaterial({ map: texture, color }));

export class Star {
    position: THREE.Vector3;
    starType: number;
    obj: THREE.Sprite | null;

    constructor(position: THREE.Vector3) {
        this.position = position;
        this.starType = this.generateStarType();
        this.obj = null;
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

        // update star size
        let starSize = dist * starTypes.size[this.starType];
        starSize = clamp(starSize, STAR_MIN, STAR_MAX);
        this.obj?.scale.copy(new THREE.Vector3(starSize, starSize, starSize));
    }

    toThreeObject(scene: THREE.Scene) {
        const sprite = new THREE.Sprite(materials[this.starType]);
        sprite.layers.set(BLOOM_LAYER);

        sprite.scale.multiplyScalar(starTypes.size[this.starType]);
        sprite.position.copy(this.position);

        this.obj = sprite;

        scene.add(sprite);
    }
}
