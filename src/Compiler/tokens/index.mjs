import Digit from './digit.mjs';
import Instruction from './instruction.mjs';
import Timer from './timer.mjs';
import Delimiter from './delimiter';
import Register from './register';
const Key = {
    K : 'K'
};

const Font = {
    F : 'F'
};

const BCD = {
    B : 'B'
};

export default {
    ...Digit,
    ...Instruction,
    ...Timer,
    ...Key,
    ...Font,
    ...BCD,
    ...Delimiter,
    ...Register
}

export {Timer, Instruction, Digit, Key, Font, BCD, Delimiter, Register};
