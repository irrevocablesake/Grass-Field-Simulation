import GUI from "lil-gui"
import Stats from 'three/addons/libs/stats.module.js';

export default class DebugPanel{   
    constructor(){
        this._GUI = null
        this._stats = null

        this._params = {
            totalGrassStrands: 100000,
            windSpeed: 2
        }
    }

    setupGUI(){
        this._GUI = new GUI()
        this._GUI.add( this._params, 'totalGrassStrands', 100000, 500000, 100000 ).name('Grass Strand Count')
        this._GUI.add( this._params, 'windSpeed', 0, 10, 1 ).name('Wind Speed')

        this._stats = new Stats()
        document.body.appendChild( this._stats.dom )
    }
}