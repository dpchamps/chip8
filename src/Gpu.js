"use strict";
const WIDTH = 64;
const HEIGHT = 32;
const RESOLUTION = WIDTH * HEIGHT;
const SCREEN_BUFFER = new ArrayBuffer(RESOLUTION);

export class Gpu{
    screen = new Uint8Array(SCREEN_BUFFER);

    _screenNode;
    _canvas;
    _context;

    _options = {
        scale : 10,
        backgroundColor : '#b7b7b7',
        borderColor : '#2e2e2e',
        pixelColor: ' #efff8d'
    };
    
    constructor(options){
        this._options = Object.assign({}, this._options, options);
    }
    
    clearScreen(){
        for(let i = 0;  i < RESOLUTION; i+=1){
            this.screen[i] = 0;
        }

    }
    
    draw(){
        this._context.clearRect(0,0,WIDTH * this._options.scale, HEIGHT * this._options.scale);
        for(let i = 0; i < RESOLUTION; i+=1){
            let x = (i % WIDTH) * this._options.scale;
            let y = (Math.floor(i/WIDTH)) * this._options.scale;

            if(this.screen[i]){
                this._context.fillStyle = this._options.pixelColor;
                this._context.fillRect(x, y, this._options.scale, this._options.scale);
            }
        }
    }

    _emptyScreenNode(){
        let canvasNodes = this._screenNode.getElementsByTagName('CANVAS');
        if(canvasNodes){
            Array.prototype.slice.call( canvasNodes ).forEach(el =>{
                this._screenNode.removeChild(el);
            });
        }
    }

    _createCanvas(){
        const canvas = document.createElement('canvas');

        canvas.width = WIDTH * this._options.scale;
        canvas.height = HEIGHT * this._options.scale;

        canvas.style.backgroundColor = this._options.backgroundColor;
        canvas.style.borderColor = this._options.borderColor;

        this._canvas = canvas;
        this._context = this._canvas.getContext('2d');
    }

    _attachCanvas(){
        this._screenNode.appendChild(this._canvas);
    }
    
    initialize(){
        this._screenNode = document.querySelector('#screen');

        this._emptyScreenNode();
        this._createCanvas();
        this._attachCanvas();
    }
    
    update(draw){
        if (draw) {
            this.draw();
        }
    }
}