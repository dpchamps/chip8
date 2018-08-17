import chalk from 'chalk';

const WARN_COLOR = chalk.yellow;
const INFO_COLOR = chalk.green;
const ERROR_COLOR = chalk.red;

export default class Log {
    constructor(debug = false) {
        this.isDebug = !!debug;
    }

    LOG(type, ...args) {
        let output;
        switch (type) {
            case 'warn':
                output = WARN_COLOR;
                break;
            case 'info':
                output = INFO_COLOR;
                break;
            case 'error':
                output = ERROR_COLOR;
                break;
            default:
                args.unshift(type);
                console.log.apply(null, args);
                return
        }

        console.log(output.apply(null, args));
    }

    WARN(...args) {
        this.LOG('warn', WARN_COLOR.bold('[WARN]'), args);
    }

    ERROR(...args) {
        this.LOG('error', ERROR_COLOR.bold('[ERROR]'), args);
    }

    INFO(...args) {
        this.LOG('info', INFO_COLOR.bold('[INFO]'), args);
    }

    GREEN_TEXT(...args) {
        this.LOG('info', args);
    }

    BLUE_TEXT(...args){
        console.log(chalk.blue(...args));
    }

    toHexString(number){
        return number.toString(16).padStart(6, '0x0000');
    }
}