export class CustomError extends Error{
    constructor(msg, type){
        super();
        this.message = msg;
        this.type = type;
    }
}
export class IllegalArgument extends CustomError{
    constructor(msg){
        super(msg, 'IllegalArgument');
    }
}

export class UnknownMnemonic extends CustomError{
    constructor(msg){
        super(msg, UnknownMnemonic);
    }
}

export class InvalidInstruction extends CustomError{
    constructor(msg){
        super(msg, 'InvalidInstruction');
    }
}

export class InvalidArgumentType extends CustomError{
    constructor(msg){
        super(msg, 'InvalidArgumentType');
    }
}

export class MalformedOpcode extends CustomError{
    constructor(msg){
        super(msg, 'MalformedOpcode');
    }
}