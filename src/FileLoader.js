"use strict";

const romDirectory = 'http://localhost:8080/roms';

export class FileLoader{

    /**
     * Makes a synchronous request to load a rom
     * @param filePath
     * @returns {Promise<Uint8Array>|Promise<Error>}
     */
    static load(filePath){
        let rom = romDirectory+'/'+filePath;
        let request = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
            request.open('GET', rom, true);
            request.responseType = 'arraybuffer';
            request.send(null);

            request.onload = (evt) => {
                resolve(new Uint8Array(request.response));
            };

            request.onerror = (evt) => {
                reject(new Error(`Couldn't load ${rom}`));
            };
        });
    }
}