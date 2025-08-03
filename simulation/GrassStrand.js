import * as THREE from 'three'

const vertexShader = await fetch('./simulation/shaders/vertex.vs').then(res => res.text());
const fragmentShader = await fetch('./simulation/shaders/fragment.fs').then(res => res.text());

const GRASS_SEGMENTS_LOD = [
    4,
    2,
    1
]

const GRASS_WIDTH = 0.03
const GRASS_HEIGHT = 2

export default class GrassStrand{
    constructor( CHUNK_SIZE, STRANDS_PER_TILE ) {
        this.LODCount = null
        this.LODLevel = []
		this.LODMaterial = []

        this._material = null

        this._CHUNK_SIZE = CHUNK_SIZE
        this._STRANDS_PER_TILE = STRANDS_PER_TILE
    }

    generateGeometry( segments ){
		const VERTICES = ( segments + 1 ) * 2
        const indices = []

        for (let i = 0; i < segments; ++i) {
			const vi = i * 2
			indices[i * 12 + 0] = vi + 0
			indices[i * 12 + 1] = vi + 1
			indices[i * 12 + 2] = vi + 2

			indices[i * 12 + 3] = vi + 2
			indices[i * 12 + 4] = vi + 1
			indices[i * 12 + 5] = vi + 3

			const fi = VERTICES + vi;
			indices[i * 12 + 6] = fi + 2
			indices[i * 12 + 7] = fi + 1
			indices[i * 12 + 8] = fi + 0

			indices[i * 12 + 9] = fi + 3
			indices[i * 12 + 10] = fi + 1
			indices[i * 12 + 11] = fi + 2
		}

		const geometry = new THREE.InstancedBufferGeometry()
		geometry.instanceCount = this._STRANDS_PER_TILE
		geometry.setIndex(indices)
		geometry.computeBoundingBox()

		return geometry
    }   

	configureUniforms( segments ){
		const uniform = {
			grassParams: {
				value: new THREE.Vector4(
					segments, this._CHUNK_SIZE, GRASS_WIDTH, GRASS_HEIGHT
				)
			},
			time: { value: 0 },
			windSpeed: { 
				value: 2
			}
		}

		return uniform
	}

    generateMaterial(segments ){
        const material = new THREE.ShaderMaterial({
			uniforms: this.configureUniforms( segments ),
			vertexShader,
			fragmentShader,
			side: THREE.FrontSide
		})

		return material
    }

    setupLOD(){
        this.LODCount = GRASS_SEGMENTS_LOD.length
        GRASS_SEGMENTS_LOD.forEach( ( segments ) => {
            this.LODLevel.push( this.generateGeometry( segments ) )
			this.LODMaterial.push( this.generateMaterial( segments ))
        })
    }

    setup(){
		this.setupLOD()
		this.generateMaterial()
    }

    getLOD( index ){
        return this.LODLevel[ index ]
    }

	getMaterialForLOD( index ){
		return this.LODMaterial[ index ]
	}
}