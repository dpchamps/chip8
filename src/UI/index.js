"use strict";
const romList = require('./../../roms/romList.json');
import {EVENT_TYPE} from '../Events';

export class UI {

    buildSelectDropDown() {
        const selectNode = document.createElement('SELECT');
        const defaultNode = document.createElement('OPTION');

        defaultNode.appendChild(document.createTextNode('Select ROM to Load'));
        selectNode.appendChild(defaultNode);
        romList.forEach(rom => {
            let optionNode = document.createElement('OPTION');
            let textNode = document.createTextNode(rom.toUpperCase());

            optionNode.value = rom;
            optionNode.appendChild(textNode);
            selectNode.appendChild(optionNode);
        });

        selectNode.addEventListener('change', e => {
            this.events.trigger(EVENT_TYPE.GAME_LOAD, e.target.value);
            e.target.blur();
        });

        document.body.querySelector('main').appendChild(selectNode);
    }

    bindResetButtonEvents() {
        const resetButton = document.querySelector('button');
        const select = document.querySelector('select');
        let currentGame = "";
        select.addEventListener('change', (e) => {
            resetButton.disabled = false;
            currentGame = e.target.value;
        });
        resetButton.addEventListener('click', ()=> {
            this.events.trigger(EVENT_TYPE.GAME_LOAD, currentGame);
        })
    }

    constructor(events) {
        this.events = events;
        this.buildSelectDropDown();
        this.bindResetButtonEvents();
    }
}