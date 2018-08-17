import {Digit, Register, Instruction, Delimiter, Key, BCD, Font} from './tokens';
import {IllegalArgument} from "./error/index.mjs";

const DIGIT_REGEX = `([0-9A-F]+)([${Digit.BIN}|${Digit.DEC}|${Digit.OCT}|${Digit.HEX}])?`;
const REGISTER_REGEX = "(\\$|I)([0-9A-F]{0,3})";
const INSTRUCTION_REGEX = "^[a-z]{2,4}";
const DIG_OR_REG = `${DIGIT_REGEX}|${REGISTER_REGEX}|ST|DT|B|F|K`;
const PRECEDING_DIG_OR_REG = `,\\s(${DIG_OR_REG})`;

export const DigitMatcher = new RegExp(`^${DIGIT_REGEX}$`, 'i');
export const RegisterMatcher = new RegExp(`^${REGISTER_REGEX}$`, 'i');
export const NonIndexRegisterMatcher = new RegExp(`^\\$([0-9A-F]+)$`, 'i');
export const ValidArgumentForm = new RegExp(`${INSTRUCTION_REGEX}(\\s+(${DIG_OR_REG}))?(${PRECEDING_DIG_OR_REG})?(${PRECEDING_DIG_OR_REG})?$`, 'i');
export const ValidOpcode = new RegExp('^[0-9a-z]{4}$', 'i');

export default class Parser{
    static toHexString(number){
        return `${number.toString(16).toUpperCase()}${Digit.HEX}`;
    }

    static toOctString(number){
        return `${number.toString(8).toUpperCase()}${Digit.OCT}`;
    }

    static toDecString(number){
        return `${number.toString(10).toUpperCase()}${Digit.DEC}`;
    }

    static toBinString(number){
        return `${number.toString(2).toUpperCase()}${Digit.BIN}`;
    }

    static toRegisterString(registerNumber, type = Register.REG){
        registerNumber = (registerNumber !== '')  ? Number(registerNumber).toString(16) : '';
        return `${type}${registerNumber}`;
    }

    static isValidNumber(str){
        return (DigitMatcher.exec(str) !== null);
    }

    static parseNumber(str, toHex = false, pad = 2){
        const match = DigitMatcher.exec(str.trim());
        let radix = 0;

        if(match === null){
            throw new IllegalArgument(`Invalid number as string: ${str}`)
        }

        if(typeof match[2] === 'undefined'){
            match[2] = Digit.DEFAULT;
        }

        const number = match[1];

        switch(match[2]){
            case Digit.HEX:
                radix = 16;
                break;
            case Digit.DEC:
                radix = 10;
                break;
            case Digit.OCT:
                radix = 8;
                break;
            case Digit.BIN:
                radix = 2
        }

        return (toHex) ? parseInt(number,radix).toString(16).padStart(pad, '0') : parseInt(number, radix);
    }

    static isValidRegister(str){
        return RegisterMatcher.exec(str) !== null;
    }

    static getRegisterType(str){
        const match = RegisterMatcher.exec(str);

        if(match === null){
            throw new IllegalArgument(`Invalid register as string: ${str}`);
        }

        return match[1];
    }

    static isNonIndexRegister(str){
        return NonIndexRegisterMatcher.exec(str) !== null;
    }

    static parseNonIndexRegister(str, toHex = false){
        const match = NonIndexRegisterMatcher.exec(str.trim());

        if(match === null){
            throw new IllegalArgument(`Invalid register as string: ${str}`);
        }

        return (toHex) ? parseInt(match[1], 16).toString(16) : parseInt(match[1], 16);
    }

    static isValidMnemonic(str){
        return Object.keys(Instruction).includes(str.toUpperCase());
    }

    static getValidArgumentType(str){
        const validInstructionTokens = Object.keys({
            ...Key,
            ...Font,
            ...BCD
        });

    }

    static isValidArgumentForm(line){
        return ValidArgumentForm.exec(line) !== null;
    }

    static formatAssembly(instruction, lhs = null, rhs = null, operand = null){
        let line = `${instruction.padStart(2, ' ')}\t`;

        if(lhs)
            line += `${lhs}`;
        if(rhs)
            line += `, ${rhs}`;
        if(operand)
            line += `, ${operand}`;

        return line;
    }

    static prependLineWithAddr(line, index){
        const address = `${ Number(0x200 + index * 2).toString(16).padStart(6, '0x0000').toUpperCase()}`;
        return `${address}${Delimiter.ADDR}${line||''}`;
    }

    static isValidOpcode(number){
        // return ValidOpcode.exec(number.toString(16)) !== null;
        return !(number < 0 && number > 0xFFFF)
    }
}