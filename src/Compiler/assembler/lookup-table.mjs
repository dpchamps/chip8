import {InvalidInstruction, IllegalArgument} from "../error/index.mjs";
import Parser from '../Parser';
import {Register, Timer, Font, Key, BCD} from '../tokens';
import Log from '../log.mjs';

const log = new Log();
const validateArgs = (args, min, max) => {
    max = max || min;
    if (args.length < min || args.length > max) {
        throw new InvalidInstruction(`Invalid Argument Length, expected ${min} to ${max}, recieved ${args.length}`)
    }
};

const formatOpcode = (msb, ...args) => {
    return `0x${msb}${args.join('')}`.padEnd(6, '0');
};

export default {
    NOOP : () => {
        return "0x0000";
    },
    CLS: (...args) => {
        validateArgs(args, 0);
        return "0x00E0";
    },
    RET: (...args) => {
        validateArgs(args, 0);
        return "0x00EE";
    },
    JP: (...args) => {
        validateArgs(args, 1, 2);
        switch (args.length) {
            case 1:
                return formatOpcode('1', Parser.parseNumber(args[0], true));
            case 2:
                return formatOpcode('B', Parser.parseNumber(args[0], true));
        }
    },
    CALL: (...args) => {
        validateArgs(args, 1);
        return formatOpcode('2', Parser.parseNumber(args[0], true, 3));
    },
    SE: (...args) => {
        validateArgs(args, 2);
        const registerX = Parser.parseNonIndexRegister(args[0], true, 3);
        let msb;

        try {
            msb = '5';
            const registerY = Parser.parseNonIndexRegister(args[1]);
            return formatOpcode(msb, registerX, registerY);
        } catch (e) {
            msb = '3';
            const byte = Parser.parseNumber(args[1], true);
            return formatOpcode(msb, registerX, byte);
        }
    },
    SNE: (...args) => {
        validateArgs(args, 2);
        const registerX = Parser.parseNonIndexRegister(args[0], true);
        let msb;
        try {
            msb = '9';
            const registerY = Parser.parseNonIndexRegister(args[1], true);
            return formatOpcode(msb, registerX, registerY);
        } catch (e) {
            msb = '4';
            const byte = Parser.parseNumber(args[1], true);
            return formatOpcode(msb, registerX, byte);
        }
    },
    LD: (...args) => {
        validateArgs(2, 3);
        switch (args.length) {
            case 3:
                if (args[0] === Register.INDEX) {
                    return formatOpcode('F', Parser.parseNonIndexRegister(args[2]), '55');
                } else {
                    return formatOpcode('F', Parser.parseNonIndexRegister(args[1]), '65');
                }
            case 2:
                let rX;
                if (Parser.isNonIndexRegister(args[0])) {
                    if (Parser.isNonIndexRegister(args[1])) {
                        const rX = Parser.parseNonIndexRegister(args[0], true);
                        const rY = Parser.parseNonIndexRegister(args[1], true);
                        return formatOpcode('8', rX, rY);
                    } else if (args[1] === Timer.DT) {
                        const rX = Parser.parseNonIndexRegister(args[0], true);
                        return formatOpcode('F', rX, '07');
                    } else if (args[1] === Key.K) {
                        const rX = Parser.parseNonIndexRegister(args[0], true);
                        return formatOpcode('F', rX, '0A');
                    } else {
                        const rX = Parser.parseNonIndexRegister(args[0], true);
                        const byte = Parser.parseNumber(args[1], true);
                        return formatOpcode('6', rX, byte);
                    }
                } else {
                    switch (args[0]) {
                        case Register.INDEX:
                            return formatOpcode('A', Parser.parseNumber(args[1], true, 3));
                        case Timer.DT:
                            rX = Parser.parseNonIndexRegister(args[1], true);
                            return formatOpcode('F', rX, '15');
                        case Timer.ST:
                            rX = Parser.parseNonIndexRegister(args[1], true);
                            return formatOpcode('F', rX, '18');
                        case Font.F:
                            rX = Parser.parseNonIndexRegister(args[1], true);
                            return formatOpcode('F', rX, '29');
                        case BCD.B:
                            rX = Parser.parseNonIndexRegister(args[1], true);
                            return formatOpcode('F', rX, '33');
                        default:
                            throw new IllegalArgument(`Recieved an unexpected LD parameters: ${args.join(',')}`);
                    }
                }
        }
    },
    ADD: (...args) => {
        validateArgs(args, 2);
        let rX = Parser.parseNonIndexRegister(args[0], true);
        let rY;
        if (args[0] === Register.INDEX) {
            return formatOpcode('F', rX, '1E');
        } else if (Parser.isNonIndexRegister(args[1])) {
            rY = Parser.parseNonIndexRegister(args[1], true);
            return formatOpcode('8', rX, rY, '4');
        } else {
            const byte = Parser.parseNumber(args[1], true);
            return formatOpcode('7', rX, byte);
        }
    },
    SUB: (...args) => {
        validateArgs(args, 2);
        const rX = Parser.parseNonIndexRegister(args[0], true);
        const rY = Parser.parseNonIndexRegister(args[1], true);
        return formatOpcode('8', rX, rY, '5');
    },
    SUBN: (...args) => {
        validateArgs(args, 2);
        const rX = Parser.parseNonIndexRegister(args[0], true);
        const rY = Parser.parseNonIndexRegister(args[1], true);
        return formatOpcode('8', rX, rY, '7');
    },
    OR: (...args) => {
        validateArgs(args, 2);
        const rX = Parser.parseNonIndexRegister(args[0], true);
        const rY = Parser.parseNonIndexRegister(args[1], true);
        return formatOpcode('8', rX, rY, '1');
    },
    XOR: (...args) => {
        validateArgs(args, 2);
        const rX = Parser.parseNonIndexRegister(args[0], true);
        const rY = Parser.parseNonIndexRegister(args[1], true);
        return formatOpcode('8', rX, rY, '3');
    },
    AND: (...args) => {
        validateArgs(args, 2);
        const rX = Parser.parseNonIndexRegister(args[0], true);
        const rY = Parser.parseNonIndexRegister(args[1], true);
        return formatOpcode('8', rX, rY, '2');
    },
    SHR: (...args) => {
        validateArgs(args, 1);
        const rX = Parser.parseNonIndexRegister(args[0], true);
        return formatOpcode('8', rX, '06');
    },
    SHL: (...args) => {
        validateArgs(args, 1);
        const rX = Parser.parseNonIndexRegister(args[0], true);
        return formatOpcode('8', rX, '0E');
    },
    RND: (...args) => {
        validateArgs(args, 2);
        const rX = Parser.parseNonIndexRegister(args[0], true);
        const byte = Parser.parseNumber(args[1], true);
        return formatOpcode('C', rX, byte);
    },
    DRW: (...args) => {
        validateArgs(args, 3);
        const rX = Parser.parseNonIndexRegister(args[0], true);
        const rY = Parser.parseNonIndexRegister(args[1], true);
        const nibble = Parser.parseNumber(args[2], true, 1);
        return formatOpcode('D', rX, rY, nibble);
    },
    SKP: (...args) => {
        validateArgs(args, 1);
        const rX = Parser.parseNonIndexRegister(args[0], true);
        return formatOpcode('E', rX, '9E');
    },
    SKNP: (...args) => {
        validateArgs(args, 1);
        const rX = Parser.parseNonIndexRegister(args[0], true);
        return formatOpcode('E', rX, 'A1');
    }
}