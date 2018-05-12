"use strict";

const BEEP_HZ = 523.25;

export class Spu{

    _currentOscillator = null;

    constructor(){
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    _getOscillator(){
        const oscillator = this.audioCtx.createOscillator();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(BEEP_HZ, this.audioCtx.currentTime);
        oscillator.start(0);
        oscillator.connect(this.audioCtx.destination);

        return oscillator;
    }

    _start(){
        if(!this._currentOscillator){
            this._currentOscillator = this._getOscillator();
        }
    }

    _stop(){
        this._currentOscillator.stop(0);
        this._currentOscillator = null;
    }

    update(beep){
        if(beep){
            this._start();
        }else if(this._currentOscillator){
            this._stop();
        }
    }
}