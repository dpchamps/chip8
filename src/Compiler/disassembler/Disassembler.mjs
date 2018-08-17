import Log from '../log';
import opcodeTable from './opcode-table';
import Parser from '../Parser';
const log = new Log();

export default class Disassembler {
    printOpcodes() {
        log.INFO(`Got the following opcodes: `);
        let opcodeString = " ";
        this.opcodes.forEach((opcode, index) => {
            if (index !== 0) {
                if (index % 16 === 0) {
                    opcodeString += '\n ';
                } else if (index % 8 === 0) {
                    opcodeString += '\t';
                }
            }

            opcodeString += `[${(""+(index+1)).padStart(3, '0')}]${log.toHexString(opcode).toUpperCase()} `;
        });
        log.BLUE_TEXT(opcodeString);
    }

    loadOpcodes(data) {
        for (let i = 0; i < data.length; i += 2) {
            const high = data[i];
            const low = data[i + 1] || 0;
            const opcode = (high << 8 | low);

            this.opcodes.push(opcode);
        }
    }

    processNextOpcode(){
        this.opcodesProcessed++;
        this._opcode = this.opcodes.shift();
        try{
            this.instructions.push(opcodeTable[this._opcode & 0xF000].call(this));
        }catch(e){
            log.WARN(`Unkown opcode ${this._opcode.toString(16).padStart(6, '0x0000')} @${this.opcodesProcessed}`);
            this.instructions.push(Parser.formatAssembly('NOOP'));
        }
    }

    disassemble(){
        while(this.opcodes.length > 0){
            this.processNextOpcode();
        }

        this.instructions.forEach( (line, index) => {
           this.instructions[index] = Parser.prependLineWithAddr(line, index)
        });

        log.INFO('Finished processing the binary.');
    }


    constructor(buffer) {
        this.opcodes = [];
        this.instructions = [];
        this.opcodesProcessed = 0;
        this.DISSASEMBLE_FILE_EXT = '.chip8';

        const data = new Uint8Array(buffer);
        log.INFO(`Loaded a buffer into the dissasembler of ${data.length} bytes`);
        this.loadOpcodes(data);
        this.printOpcodes();
    }

    get instructionSet(){
        return this.instructions.join('\n');
    }


}