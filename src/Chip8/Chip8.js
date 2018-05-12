"use strict";

import {chip8FontSet} from './chip8FontSet';
import {opcodes} from './opcodes';

const MEM_LEN = 4096;
const MEM_BUFFER = new ArrayBuffer(MEM_LEN);

const REG_LEN = 16;
const REG_BUFFER = new ArrayBuffer(REG_LEN);

const STACK_LEN = 16;
const STACK_BUFFER = new ArrayBuffer(STACK_LEN);

const PROGRAM_OFFSET = 0x200;

export class Chip8{

    /**
     * Program Counter
     *
     * @type {Number}
     */
    _pc;

    /**
     * Index Register
     *
     * @type {Number}
     */
    _I;

    /**
     * The internal stack
     *
     * @type {Uint16Array}
     * @private
     */
    _stack = new Uint16Array(STACK_BUFFER);

    /**
     * Stack Pointer
     *
     * @type {Number}
     */
    _sp;

    /**
     * Current Opcode
     *
     * @type {Number}
     */
    _opcode;

    /**
     * Internal Memory
     *
     * @type {Uint8Array}
     * @private
     */
    _memory = new Uint8Array(MEM_BUFFER);

    /**
     * CHIP8 Registers
     *
     * @type {Uint8Array}
     * @private
     */
    _V = new Uint8Array(REG_BUFFER);

    _TIMERS = {
        delay : 0,
        sound : 0
    };

    /**
     * Determines the draw operation in the main cycle
     *
     * @type {boolean}
     */
    drawFlag = false;

    beepFlag = false;

    /**
     * Determines whether or not the CPU is running
     * @type {boolean}
     */
    isRunning = false;

    /**
     * Determines whther of not the CPU is waiting for input
     * @type {boolean}
     */
    isWaiting = false;

    debug = true;

    _toHexString(number){
        return number.toString(16).padStart(6, '0x0000');
    }

    _toBinString(number){
        return number.toString(2).padStart(16, '0b0000000000000000');
    }

    _log(msg){
        if(this.debug === true) {
            if(typeof msg === 'string'){
                msg = "%c"+msg;
            }
            console.log(msg, 'color: #263238; font-weight: bold; font-size: 13px; background-color:#90f9cd; font-style: italic');
        }
    }

    _dump(msg){
        if(this.debug === true){
            if(typeof msg === 'string'){
                msg = "%c"+msg;
            }
            console.log(msg, 'color: #263238; font-weight: bold; font-size: 17px; background-color:#f99090');
            console.warn.apply(null, [...Array.prototype.slice.call(arguments,1)]);
            console.log('\n------------------Current CPU SnapShot');
            console.log("Current Opcode", this._toHexString(this._opcode));
            console.log(`pc: ${this._toHexString(this._pc)}, sp: ${this._toHexString(this._sp)}, I: ${this._toHexString(this._I)}`);
            console.log("Registers");
            console.table( Array.prototype.map.call(this._V, this._toHexString) );
            console.log("Stack");
            console.table(Array.prototype.map.call(this._stack, this._toHexString));
            console.log("Timers");
            console.log(this._TIMERS);
            console.log('------------------');
        }
        this._halt();
    }

    /**
     * @constructor
     * @param gpu - a gpu instance
     * @param input - an input instance
     */
    constructor(gpu, input){
        if(typeof gpu === 'undefined'){
            this._dump('No gpu instance :(');
        }

        if(typeof input === 'undefined'){
            this._dump('No input instance D:');
        }

        this._gpu = gpu;
        this._input = input;
    }

    /**
     * Initializes the CHIP8 CPU
     */
    initialize(){
        this._pc = PROGRAM_OFFSET;
        this._opcode = 0;
        this._I = 0;

        this._gpu.initialize();
        this._input.initialize();

        this._clearStack();
        this._clearRegisters();
        this._clearMemory();

        this._loadFontset();
        this._log('Chip8 CPU initialized');
        this.isRunning = true;
    }

    _halt(){
        this.isRunning = false;
    }

    /**
     * Loads the CHIP8 fontset
     * @private
     */
    _loadFontset(){
        for(let i = 0; i < 80; i++){
            this._memory[i] = chip8FontSet[i];
        }
    }

    /**
     * Clear internal registers
     */
    _clearRegisters(){
        for(let i = 0; i < REG_LEN; i++){
            this._V[i] = 0;
        }
    }

    /**
     * Clear internal memory
     */
    _clearMemory(){
        for(let i = 0; i < MEM_LEN; i++){
            this._memory[i] = 0;
        }
    }

    _clearStack(){
        for(let i = 0; i < STACK_LEN; i++){
            this._stack[i] = 0;
        }

        this._sp = 0;
    }

    _loadOpcode(){
        this._opcode = this._memory[this._pc] << 8 | this._memory[this._pc+1];
    }

    _executeOpcode(){
        try{
            opcodes[this._opcode & 0xf000].call(this);
        }catch(e){
            this._dump('Oops, unknown opcode :3');
        }
    }

    _updateTimers(){
        if(this._TIMERS.delay > 0){
            this._TIMERS.delay -= 1;
        }

        if(this._TIMERS.sound > 0){
            this._TIMERS.sound -= 1;
        }
        this.beepFlag = !!this._TIMERS.sound;
    }

    /**
     * Loads a specified game into memory
     * @param game {Uint8Array}
     */
    loadGame(game){
        for(let i = 0; i < game.length; i++){
            this._memory[i + PROGRAM_OFFSET] = game[i];
        }
    }

    /**
     * Method for ~60hz clockspeed
     */
    update(){
        this._updateTimers();
    }

    /**
     * Method for ~550hz clockspeed
     */
    emulateCycle(){
        try{
            if(!this.isWaiting){
                this._loadOpcode();
                this._executeOpcode();
            }

            if(this._pc >= MEM_LEN){
                this._dump("Segfault >:[");
            }

            if(isNaN(this._pc)){
                this._dump("Invalid Program Counter :0");
            }
        }catch(e){
            this._dump(e);
        }
    }
}