import banner from './banner';
import usage from './usage';
import fs from 'fs';
import Log from './log';
import Disassembler from './disassembler/Disassembler';
import Lexer from './assembler/Lexer';

import path from 'path';

const log = new Log;
const printUsage = () => {
    log.GREEN_TEXT(usage);
};

const exit = (displayUsage) => {
    if (displayUsage)
        printUsage();
    process.exit();
};

const loadFile = async (filename) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (error, data) => {
            if (error) {
                log.ERROR(`Error loading file ${filename}`);
                reject(error.message);
            }

            resolve(data);

        })
    })
};

const writeFile = async (destination, data, fileEncoding) => {
    return new Promise((resolve, reject) => {
       fs.writeFile(destination, data, fileEncoding, (error) => {
           if(error)
               reject(error);

           resolve(true);
       })
    });
};

const handleInstruction = async (data, instruction) => {
    let processedData;
    let fileExtension;
    let fileEncoding;
    switch (instruction) {
        case 'disassemble':
            const disassembler = new Disassembler(data);
            disassembler.disassemble();
            processedData = disassembler.instructionSet;
            fileExtension = disassembler.DISSASEMBLE_FILE_EXT;
            fileEncoding = 'utf8';
            break;
        case 'assemble':
            const assembler = new Lexer(data.toString());
            processedData = assembler.assemble();
            fileExtension = '.rom';
            fileEncoding = 'binary';
            break;
        default:
            return Promise.reject(`Unknown instruction ${instruction}`)
    }

    return Promise.resolve([processedData, fileExtension, fileEncoding]);
};

const main = async () => {
    log.LOG(banner);
    const args = process.argv.slice(2);
    const filename = args[0];
    const instruction = args[1];
    const outputFile = args[2];
    if (!filename || !instruction) {
        exit(true);
    }

    const filePath = path.parse(filename);
    const baseName = filePath.name;

    try {
        const data = await loadFile(filename);
        const [processedData, fileExt, fileEncoding] = await handleInstruction(data, instruction);
        const fileDestination = path.join(filePath.dir, outputFile || baseName+fileExt);
        await writeFile(fileDestination, processedData, fileEncoding);
        log.INFO(`Success :D\tWrote file to ${fileDestination}`);
    } catch (e) {
        log.ERROR(`A fatal error occurred: ${e}`);
        exit();
    }
};

main();