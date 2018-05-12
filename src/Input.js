"use strict";

const KEY_LENGTH = 0x10;
const KEY_BUFFER = new ArrayBuffer(KEY_LENGTH);

export class Input{
    
    keys = new Uint8Array(KEY_BUFFER);
    lastKeyPressed = false;
    onNextKeyPress = null;

    keyMap = {
        49 : 0x1, 50 : 0x2, 51 : 0x3, 52 : 0xC,
        81 : 0x4, 87 : 0x5, 69 : 0x6, 82 : 0xD,
        65 : 0x7, 83 : 0x8, 68 : 0x9, 70 : 0xE,
        90 : 0xA, 88 : 0x0, 67 : 0xB, 86 : 0xF
    };


    constructor(){}

    requestNextKeyPress(fn){
        this.onNextKeyPress = fn;
    }
    
    initialize(){
        window.addEventListener('keydown', this.keyDown.bind(this));
        window.addEventListener('keyup', this.keyUp.bind(this));
    }

    _getKey(keycode){
        return this.keyMap[keycode];
    }

    _isKey(key){
        return typeof key !== 'undefined';
    }

    _isKeyPressed(key){
        return this.keys[key] !== 0;
    }

    _registerKey(key){
        this.keys[key] = 255;
        this.lastKeyPressed = key;
    }

    _unRegisterKey(key){
        this.keys[key] = 0;
    }

    keyDown(e){
        let keycode = e.which;
        let key = this._getKey(keycode);
        if(this._isKey(key) && !this._isKeyPressed(key)){
            this._registerKey(key);
            if(this.onNextKeyPress){
                this.onNextKeyPress();
                this.onNextKeyPress = null;
            }
        }
    }

    keyUp(e){
        let keycode = e.which;
        let key = this._getKey(keycode);

        if(this._isKey(key)){
            this._unRegisterKey(key);
        }
    }
}