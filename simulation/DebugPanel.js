import GUI from "lil-gui"
import Stats from 'three/addons/libs/stats.module.js';

export default class DebugPanel{   
    constructor( chunkManager ){
        this._chunkManager = chunkManager

        this._GUI = null
        this._stats = null

        this._params = {
            totalGrassStrands: 100000,
            windSpeed: 2
        }
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

    setupGUI(){
        this._GUI = new GUI()
        this._GUI.add( this._params, 'totalGrassStrands', 100000, 500000, 100000 ).name('Grass Strand Count').onChange( this.updateStrandCount.bind( this ) )
        this._GUI.add( this._params, 'windSpeed', 0, 10, 1 ).name('Wind Speed').onChange( this.updateWindConfiguration.bind( this ) )

        this._stats = new Stats()
        document.body.appendChild( this._stats.dom )
    }
}