import Parser from '../Parser';
import {IllegalArgument, InvalidInstruction, MalformedOpcode, UnknownMnemonic} from "../error/index.mjs";
import {Timer, Instruction, Digit, Key, Font, BCD, Delimiter, Register} from '../tokens';
import LookupTable from './lookup-table';
import Log from '../log';

const log = new Log();

export default class Lexer {
    constructor(input) {
        if (typeof input !== 'string') {
            throw new IllegalArgument(`Unexpected input: ${typeof input}, expected type string`);
        }
        this.lines = input.split('\n');
        this.instructions = [];
        this.opcodes = [];
    }

    static findMnemonic(line) {
        return /([a-z]+)\s/i.exec(line);
    }

    static tokenize(line) {
        const addrPos = line.indexOf(Delimiter.ADDR);
        const commentPos = line.indexOf(Delimiter.COMMENT);

        //remove address
        if (addrPos !== -1) {
            line = line.substring(addrPos + 1);
        }
        //remove comments
        if (commentPos !== -1) {
            line = line.substring(0, commentPos);
        }

        if(!line)
            line = "NOOP ";

        if (!Parser.isValidArgumentForm(line.trim())) {
            throw new InvalidInstruction(line);
        }

        const mnemonic = Lexer.findMnemonic(line);

        line = line.replace(mnemonic[0], '');
        if (!Parser.isValidMnemonic(mnemonic[1])) {
            throw new UnknownMnemonic(mnemonic[1]);
        }

        const instructionArgs = line.split(',').map(x => x.trim()).filter(x => x);

        return {
            mnemonic : mnemonic[1],
            instructionArgs
        };
    }

    printContext(index) {
        return `
                ${(index > 0) ? '...\n\t\t' + this.lines[index - 1] : ''}
                ${this.lines[index]} <-- @here
                ${this.lines[index + 1]+'\n\t\t...' || ''}`
    }

    assemble() {
        this.lines.forEach((line, index) => {
            let tokens;
            let opcode;
            try {
                tokens = Lexer.tokenize(line);
            } catch (e) {
                log.ERROR(`Recieved an error during tokenization: ${e.type || 'UNDEFINED ERROR :0'}
                ${this.printContext(index)}`);
                throw e;
            }
            // log.INFO(`Looking for ${tokens.mnemonic}`);
            try {
                // opcode = Number(LookupTable[tokens.mnemonic](...tokens.instructionArgs));
                opcode = Number(LookupTable[tokens.mnemonic](...tokens.instructionArgs));
            } catch (e) {
                log.ERROR(`Recieved an error during lookup: : ${e.type || 'UNDEFINED ERROR :0'}
                ${this.printContext(index)}`);
                throw e;
            }

            if(!Parser.isValidOpcode(opcode)){
                log.ERROR(`Received an invalid opcode: ${opcode.toString(16)}
                ${this.printContext(index)}`);
                throw new MalformedOpcode(`${opcode} is not a valid opcode`);
            }

            const high = (opcode & 0xFF00) >> 8;
            const low = (opcode & 0xFF);

            this.opcodes.push(...[high, low]);
        });

        return Uint8Array.from(this.opcodes);
    }
}