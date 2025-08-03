import * as THREE from 'three'
import DebugPanel from './DebugPanel.js'
import ChunkManager from './chunkManager.js';
import Controller from './Controller.js';

const CAMERA_HEIGHT = 3
export default class GrassField{
    constructor(){
        this._scene = null
        this._camera = null
        this._renderer = null

        this._chunkManager = null
        this._debugPanel = null
        this._clock = null
        this._textures = {}
        this._controller = null
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
        this._debugPanel = new DebugPanel( this._chunkManager )
        this._debugPanel.setupGUI()
    }

    setupChunkManager(){
        this._chunkManager = new ChunkManager( this._scene, this._camera )
        this._chunkManager.setup()
        this._chunkManager.generateChunks()
    }

    animate(){

        this._debugPanel._stats.begin()

        this._controller.pointerLock( this._clock.getDelta() )

        this._chunkManager.updateLOD()
        this._chunkManager._grassStrand.getMaterialForLOD( 0 ).uniforms.time.value = this._clock.getElapsedTime();
        this._chunkManager._grassStrand.getMaterialForLOD( 1 ).uniforms.time.value = this._clock.getElapsedTime();
        this._chunkManager._grassStrand.getMaterialForLOD( 2 ).uniforms.time.value = this._clock.getElapsedTime();

        this._renderer.render( this._scene, this._camera )

        this._debugPanel._stats.end()
    }

    startSimulation(){
        this._clock = new THREE.Clock();
      
        this.setupScene()
        this.setupChunkManager()
        this.setupDebugPanel()
      
        this._controller = new Controller( this._camera, this._renderer )
        this._controller.setup()
        
    }

    simulate(){

        this._loadingManager = new THREE.LoadingManager()
        this._loadingManager.onLoad = () => {
            this.startSimulation()
        };

        const textureLoader = new THREE.TextureLoader(this._loadingManager);
        this._textures['environment'] = textureLoader.load('../Grass-Field-Simulation/public/environment.webp')
    }
}