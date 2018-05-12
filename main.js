"use strict";
import {EVENT_TYPE, Events} from './src/events/Events';
import {FileLoader} from './src/FileLoader';
import {Chip8} from './src/Chip8';
import {Gpu} from './src/Gpu';
import {Spu} from './src/Spu';
import {Input} from './src/Input';

const TARGET_CLOCK_SPEED = 900;
const gpu = new Gpu();
const spu = new Spu();
const input = new Input();
const chip8 = new Chip8(gpu, input);

let game = new Uint8Array([0x0000, 0x00E0]);
window.c8 = chip8;
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
            requestAnimationFrame(runLoop);
        }
    };

    requestAnimationFrame(runLoop);
};

window.addEventListener(EVENT_TYPE.MAIN_EXIT, () => {
    console.log('main loop exit');
});

FileLoader.load('invaders.rom')
    .then(dataStream => {
        game = dataStream;
        main();
    });