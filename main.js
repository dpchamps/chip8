"use strict";
import {EVENT_TYPE, EventBus} from './src/Events';
import {FileLoader} from './src/FileLoader';
import {Chip8} from './src/Chip8/Chip8';
import {Gpu} from './src/Gpu';
import {Spu} from './src/Spu';
import {Input} from './src/Input';
import {UI} from './src/UI';

const TARGET_CLOCK_SPEED = 800;
const gpu = new Gpu();
const spu = new Spu();
const input = new Input();
const chip8 = new Chip8(gpu, input);
const eventBus = new EventBus();
const ui = new UI(eventBus);

let game = new Uint8Array([0x0000, 0x00E0]);
let animationFrame = null;

const main = () => {
    chip8.initialize();
    chip8.loadGame(game);

    let animationFramePeriod;
    let animationFrameHz = 60;

    const runLoop = function () {
        if (animationFramePeriod) {
            animationFrameHz = (1000 / (performance.now() - animationFramePeriod));
        }

        //Run methods at target clock speed
        let cycles = (TARGET_CLOCK_SPEED / animationFrameHz) | 0;
        while (cycles-- > 0) {
            chip8.emulateCycle();
        }

        //Run methods at 60hz clock speed
        chip8.update();
        spu.update(chip8.beepFlag);
        gpu.update(chip8.drawFlag);

        animationFramePeriod = performance.now();

        if(chip8.isRunning){
            chip8.drawFlag = false;
            animationFrame = requestAnimationFrame(runLoop);
        }
    };

    animationFrame = requestAnimationFrame(runLoop);
};

eventBus.on(EVENT_TYPE.GAME_LOAD, (filename)=> {
    FileLoader.load(filename)
        .then(dataStream => {
            cancelAnimationFrame(animationFrame);
            game = dataStream;
            main();
        });
});

gpu.initialize();