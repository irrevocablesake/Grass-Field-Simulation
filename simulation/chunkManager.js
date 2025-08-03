import * as THREE from 'three'
import { QuadTree, Rectangle, Point } from './accelerationStructure/QuadTree.js'
import GrassStrand from './GrassStrand.js'

const GRASS_FIELD_SIZE = 100
const CHUNK_SIZE = 10   

export default class ChunkManager {
    constructor( scene, debugPanel, camera ) {
        this._debugPanel = debugPanel
        this._grassStrand = null

        this._scene = scene
        this._camera = camera

        this._chunkList = []
    }

    setupGrassChunk( position, LODLevel ){
        const mesh = new THREE.Mesh( this._grassStrand.getLOD( LODLevel ), this._grassStrand.getMaterialForLOD( LODLevel) )
        mesh.position.set( ...position )
        mesh.frustumCulled = false

        return mesh
    }

    generateChunks(){

        const chunkCountX = GRASS_FIELD_SIZE / CHUNK_SIZE
        const chunkCountY = GRASS_FIELD_SIZE / CHUNK_SIZE

        this._quadTree = new QuadTree(
            new Rectangle( GRASS_FIELD_SIZE / 2, GRASS_FIELD_SIZE / 2, GRASS_FIELD_SIZE, GRASS_FIELD_SIZE )
        )

        for( let i = 0; i < chunkCountX; i++ ){
            for( let j = 0; j < chunkCountY; j++ ){

                const centerX = i * CHUNK_SIZE + CHUNK_SIZE / 2
                const centerY = j * CHUNK_SIZE + CHUNK_SIZE / 2

                const position = new THREE.Vector3(  centerX, 0,  centerY )
                const LODLevel = 2

                const tile = this.setupGrassChunk( position, LODLevel )
                
                this._chunkList.push( tile )
                this._scene.add( tile )
                this._quadTree.insert( new Point( centerX, centerY, tile ))
            }       
        }        
    }
 
    updateLOD(){

        for (let i = 0; i < this._chunkList.length; i++) {
            this._chunkList[i].visible = false;
        }

        const frustum = new THREE.Frustum()
        const m = new THREE.Matrix4()

        this._camera.updateMatrixWorld()

        m.multiplyMatrices( this._camera.projectionMatrix, this._camera.matrixWorldInverse )
        frustum.setFromProjectionMatrix( m )

        const cameraBoundary = new Rectangle( this._camera.position.x, this._camera.position.z,  200, 200 )
        const visiblePoints = this._quadTree.query( cameraBoundary )

        const margin = 1
        const size = new THREE.Vector3(CHUNK_SIZE + margin * 2, 2 + margin * 2, CHUNK_SIZE + margin * 2)

        for( let i = 0; i < visiblePoints.length; i++ ){
            const point = visiblePoints[i]
            point.userData.geometry = this._grassStrand.getLOD(0)

            const box = new THREE.Box3().setFromCenterAndSize(
                point.userData.position.clone(),
                size
            );

            const distance = this._camera.position.distanceTo(box.getCenter(new THREE.Vector3()));

            let targetGeometry = this._grassStrand.getLOD( 2 )
            point.userData.material = this._grassStrand.getMaterialForLOD( 2 )
            if( distance >= 0 && distance < 20 ){
                targetGeometry = this._grassStrand.getLOD( 0 )
                point.userData.material = this._grassStrand.getMaterialForLOD( 0 )
            }
            else if( distance >= 20 && distance < 40 ){
                targetGeometry = this._grassStrand.getLOD( 1 )
                point.userData.material = this._grassStrand.getMaterialForLOD( 1 )
            }

             if (point.userData.geometry !== targetGeometry) {
                point.userData.geometry.dispose()
		        point.userData.geometry = targetGeometry;
                point.userData.geometry.computeBoundingBox(); 
            }

            point.userData.visible = frustum.intersectsBox( box )

            if( distance < 20 ){
                point.userData.visible = true
            }
        }
    }

    setup(){
        const TOTAL_CHUNKS = GRASS_FIELD_SIZE / CHUNK_SIZE
        const STRANDS_PER_TILE = 100000 / Math.pow( TOTAL_CHUNKS, 2 )

        this._grassStrand = new GrassStrand( CHUNK_SIZE, STRANDS_PER_TILE )
        this._grassStrand.setup()
    }
}