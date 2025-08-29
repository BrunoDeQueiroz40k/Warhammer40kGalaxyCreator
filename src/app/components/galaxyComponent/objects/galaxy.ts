import * as THREE from 'three';
import { Star } from './star';
import { ARMS, ARM_X_DIST, ARM_X_MEAN, ARM_Y_DIST, ARM_Y_MEAN, CORE_X_DIST, CORE_Y_DIST, GALAXY_THICKNESS, HAZE_RATIO, NUM_STARS, OUTER_CORE_X_DIST, OUTER_CORE_Y_DIST } from '../config/galaxyConfig';
import { gaussianRandom, spiral } from '../utils';
import { mulberry32 } from '../prng';
import { Haze } from './haze';

export class Galaxy {
    scene: THREE.Scene;
    stars: Star[];
    haze: Haze[];

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        // Use uma seed fixa para sempre gerar a mesma galáxia
        const rand = mulberry32(123456);
        this.stars = this.generateObject(NUM_STARS, (pos: THREE.Vector3) => new Star(pos), rand);
        this.haze = this.generateObject(NUM_STARS * HAZE_RATIO, (pos: THREE.Vector3) => new Haze(pos), rand);

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
    }

    generateObject<T>(numStars: number, generator: (pos: THREE.Vector3) => T, rand: () => number): T[] {
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
}