"use strict";

export const EVENT_TYPE = {
    GAME_LOAD : 'gameload',
    MAIN_EXIT : 'mainexit'
};

export const Events = {
    gameLoad : new Event(EVENT_TYPE.GAME_LOAD),
    mainExit : new Event(EVENT_TYPE.MAIN_EXIT)
};