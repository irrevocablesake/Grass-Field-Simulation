import * as THREE from 'three'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const CAMERA_HEIGHT = 3
const CAMERA_CLAMP_X = new THREE.Vector3(10, CAMERA_HEIGHT, 10)
const CAMERA_CLAMP_Y = new THREE.Vector3(100, CAMERA_HEIGHT, 100)

const CAMERA_KEYS = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
}

const MOVE_DIRECTION = new THREE.Vector3();
const CAMERA_MOVE_SPEED = 10;

export default class Controller {
    constructor(camera, renderer) {
        this._camera = camera
        this._controls = null
        this._renderer = renderer
    }

    pointerLock(delta) {
        MOVE_DIRECTION.set(0, 0, 0);

        if (CAMERA_KEYS.w) MOVE_DIRECTION.z += 1;
        if (CAMERA_KEYS.s) MOVE_DIRECTION.z -= 1;
        if (CAMERA_KEYS.a) MOVE_DIRECTION.x -= 1;
        if (CAMERA_KEYS.d) MOVE_DIRECTION.x += 1;

        MOVE_DIRECTION.normalize();

        const camDirection = new THREE.Vector3();
        this._camera.getWorldDirection(camDirection);
        camDirection.y = 0;
        camDirection.normalize();

        const camRight = new THREE.Vector3().crossVectors(camDirection, this._camera.up);

        const move = new THREE.Vector3();
        move.addScaledVector(camDirection, MOVE_DIRECTION.z);
        move.addScaledVector(camRight, MOVE_DIRECTION.x);

        move.multiplyScalar(delta * CAMERA_MOVE_SPEED);
        this._camera.position.add(move);

        this._camera.position.clamp(CAMERA_CLAMP_X, CAMERA_CLAMP_Y)
    }


    setupEventListeners() {

        document.addEventListener('keydown', e => CAMERA_KEYS[e.key.toLowerCase()] = true);
        document.addEventListener('keyup', e => CAMERA_KEYS[e.key.toLowerCase()] = false);

        document.addEventListener('click', () => {
            this._controls.lock()
        })
    }

    setup(){
        this._controls = new PointerLockControls( this._camera, this._renderer.domElement)
        this._controls.addEventListener('change', () => {
            this._controls.maxPolarAngle = Math.PI / 2
            this._controls.minPolarAngle = 0
        });

        this.setupEventListeners()
    }
}