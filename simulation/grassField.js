import * as THREE from 'three'
import DebugPanel from './DebugPanel.js'
import ChunkManager from './chunkManager.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

const CAMERA_HEIGHT = 3
const CAMERA_CLAMP_X = new THREE.Vector3( 10, CAMERA_HEIGHT, 10 )
const CAMERA_CLAMP_Y = new THREE.Vector3( 100, CAMERA_HEIGHT, 100 )

const CAMERA_KEYS = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
}

const MOVE_DIRECTION = new THREE.Vector3();
const CAMERA_MOVE_SPEED = 10;

export default class GrassField{
    constructor(){
        this._scene = null
        this._camera = null
        this._renderer = null

        this._chunkManager = null
        this._debugPanel = null
        this._clock = null
        this._textures = {}
    }

    setupScene(){
        this._scene = new THREE.Scene()

        this._camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
        this._camera.position.set( 45, CAMERA_HEIGHT, 90)

        this._renderer = new THREE.WebGLRenderer({
            antialias: true
        })
        this._renderer.setSize( window.innerWidth, window.innerHeight )
        this._renderer.setAnimationLoop( this.animate.bind( this ) )
        document.body.appendChild( this._renderer.domElement )

        const geometry = new THREE.SphereGeometry(500, 32, 32);
        const material = new THREE.MeshBasicMaterial({
                map: this._textures.environment,
                side: THREE.BackSide, 
                depthWrite: false,  
            });

        const skyDome = new THREE.Mesh(geometry, material);
        this._scene.add(skyDome);
    }

    setupDebugPanel(){
        this._debugPanel = new DebugPanel()
        this._debugPanel.setupGUI()
    }

    setupChunkManager(){
        this._chunkManager = new ChunkManager( this._scene, this._debugPanel, this._camera )
        this._chunkManager.setup()
        this._chunkManager.generateChunks()
    }

    setupEventListeners(){

        document.addEventListener('keydown', e => CAMERA_KEYS[e.key.toLowerCase()] = true);
        document.addEventListener('keyup', e => CAMERA_KEYS[e.key.toLowerCase()] = false);

        document.addEventListener('click', () => {
            this._controls.lock()
        })
    }

    setupClock(){
        this._clock = new THREE.Clock();
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

        this._camera.position.clamp( CAMERA_CLAMP_X, CAMERA_CLAMP_Y )
    }   

    updateWindConfiguration( value ){
        this._chunkManager._grassStrand.getMaterialForLOD( 0 ).uniforms.windSpeed.value = value
        this._chunkManager._grassStrand.getMaterialForLOD( 1 ).uniforms.windSpeed.value = value
        this._chunkManager._grassStrand.getMaterialForLOD( 2 ).uniforms.windSpeed.value = value
    }

     updateStrandCount( value ){
        const totalStrandCount = value
        const TOTAL_CHUNKS = 100 / 10
        const STRANDS_PER_TILE = totalStrandCount / Math.pow( TOTAL_CHUNKS, 2 )

        this._chunkManager._grassStrand.getLOD(0).instanceCount = STRANDS_PER_TILE
        this._chunkManager._grassStrand.getLOD(1).instanceCount = STRANDS_PER_TILE
        this._chunkManager._grassStrand.getLOD(2).instanceCount = STRANDS_PER_TILE
    }

    animate(){

        this._debugPanel._stats.begin()

        this.pointerLock(this._clock.getDelta() )
        this._chunkManager.updateLOD()
        this._chunkManager._grassStrand.getMaterialForLOD( 0 ).uniforms.time.value = this._clock.getElapsedTime();
        this._chunkManager._grassStrand.getMaterialForLOD( 1 ).uniforms.time.value = this._clock.getElapsedTime();
        this._chunkManager._grassStrand.getMaterialForLOD( 2 ).uniforms.time.value = this._clock.getElapsedTime();
        this._renderer.render( this._scene, this._camera )

        this._debugPanel._stats.end()
    }

    startSimulation(){
        this.setupScene()
        this.setupDebugPanel()
        this.setupClock()
        this._controls = new PointerLockControls( this._camera, this._renderer.domElement)
        this.setupEventListeners()
        this.setupChunkManager()

        this._debugPanel._GUI.controllers[1].onChange( this.updateWindConfiguration.bind( this ) )
        this._debugPanel._GUI.controllers[0].onChange( this.updateStrandCount.bind( this ) )

        this._controls.addEventListener('change', () => {
            this._controls.maxPolarAngle = Math.PI / 2
            this._controls.minPolarAngle = 0
        });
    }

    simulate(){

        this._loadingManager = new THREE.LoadingManager()
        this._loadingManager.onLoad = () => {
            this.startSimulation()
        };

        const textureLoader = new THREE.TextureLoader(this._loadingManager);
        this._textures['environment'] = textureLoader.load('../grassField/public/environment.webp')
    }
}