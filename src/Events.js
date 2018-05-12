"use strict";

export const EVENT_TYPE = {
    GAME_LOAD : 'gameload',
    MAIN_EXIT : 'mainexit'
};

/**
 * A short and sweet standalone event bus
 */
export class EventBus {
    events = null;

    constructor() {
        this.events = new Map();
    }

    /**
     * get an event by name from the list of currently registered events
     *
     * @param eventName
     * @returns {Array}
     * @private
     */
    _getEvent(eventName) {
        return this.events.get(eventName) || [];
    }

    /**
     * Register an event
     *
     * @param eventName<String> - Name of the event
     * @param fn<Function> - Function associated with the event name
     */
    on(eventName, fn) {
        let events = this._getEvent(eventName);

        events.push(fn);

        this.events.set(eventName, events);
    }

    /**
     * Remove an event from the list of registered events
     *
     * @param eventName<String> - Name of the event
     * @param fn<Function|Undefined> - Optional, the specific function to remove from the events registered under the selected name
     */
    off(eventName, fn) {
        let events = this._getEvent(eventName);

        if (typeof fn === 'undefined') {
            events = [];
        } else {
            events = events.filter(_fn => fn !== _fn);
        }

        this.events.set(eventName, events);
    }


    /**
     * Fire events registered under an event name
     *
     * @param eventName<String> - Name of the event to fir
     * @param data<*> - Data to pass to the functions registered under the event name.
     */
    trigger(eventName, data) {
        this._getEvent(eventName).forEach(fn => fn(data));
    }
}