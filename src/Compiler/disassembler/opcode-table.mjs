"use strict";
import Log from '../log';
import Parser from '../Parser';
import Register from '../tokens/register';
import {Timer, Key, Instruction, Font, BCD} from '../tokens';

const log = new Log();
const opcodes = {
    0x0000() {
        if ((this._opcode & 0x00FF)) {
            return opcodes[this._opcode & 0x00FF].call(this);
        } else {
            /**
             * 0x0NNN - Not Implemented, call RCA 1802 program at address NNN
             */
            log.WARN(`Skipping instruction ${this._opcode} @ opcode ${this.opcodesProcessed}`);
        }
    },
    0x00E0() {
        /**
         * 00E0
         *
         * CLS; Clears the screen.
         */
        return Parser.formatAssembly(Instruction.CLS);
    },
    0x00EE() {
        /**
         * 00EE    Flow
         *
         * RET;    Returns from a subroutine.
         */

        return Parser.formatAssembly(Instruction.RET);
    },
    0x1000() {
        /**
         * 1NNN    Flow    goto NNN;
         *
         * JP addr; Jumps to address NNN.
         */
        const address = Parser.toHexString(this._opcode & 0x0FFF);

        return Parser.formatAssembly(Instruction.JP, address);
    },
    0x2000() {
        /**
         * 2NNN    Flow    *(0xNNN)()
         *
         * CALL addr; Calls subroutine at NNN.
         */

        const address = Parser.toHexString(this._opcode & 0x0FFF);

        return Parser.formatAssembly(Instruction.CALL, address);
    },
    0x3000() {
        /**
         * 3XNN    Cond    if(Vx==NN)
         *
         * SE $x, byte; Skips the next instruction if VX equals NN.
         */

        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);
        const nn = Parser.toHexString(this._opcode & 0x00FF);

        return Parser.formatAssembly(Instruction.SE, x, nn);
    },
    0x4000() {
        /**
         * 4XNN    Cond    if(Vx!=NN)
         *
         * SNE $x, byte; Skips the next instruction if VX doesn't equal NN.
         */

        const instruction = Instruction.SNE;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);
        let nn = Parser.toHexString(this._opcode & 0x00FF);

        return Parser.formatAssembly(instruction, x, nn);
    },
    0x5000() {
        /**
         * 5XY0    Cond    if(Vx==Vy)
         *
         * SE $x, $y; Skips the next instruction if VX equals VY.
         */

        const instruction = Instruction.SE;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);
        const y = Parser.toRegisterString((this._opcode & 0x00F0) >> 4);

        return Parser.formatAssembly(instruction, x, y);
    },
    0x6000() {
        /**
         * 6XNN    Const    Vx = NN
         *
         * LD $x, byte; Sets VX to NN.
         */

        const instruction = Instruction.LD;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);
        const nn = Parser.toHexString(this._opcode & 0x00FF);

        return Parser.formatAssembly(instruction, x, nn);
    },
    0x7000() {
        /**
         * 7XNN    Const    Vx += NN
         *
         * ADD $x, byte; Adds NN to VX. (Carry flag is not changed)
         */

        const instruction = Instruction.ADD;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);
        const nn = Parser.toHexString(this._opcode & 0x00FF);

        return Parser.formatAssembly(instruction, x, nn);
    },
    0x8000() {
        if ((this._opcode & 0x000F)) {
            return opcodes[this._opcode & 0xF00F].call(this);
        } else {
            /**
             * 8XY0    Assign    Vx=Vy
             *
             * LD $x, $y; Sets VX to the value of VY.
             */

            const instruction = Instruction.LD;
            const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);
            const y = Parser.toRegisterString((this._opcode & 0x00F0) >> 4);

            return Parser.formatAssembly(instruction, x, y);
        }
    },
    0x8001() {
        /**
         * 8XY1    BitOp    Vx=Vx|Vy
         *
         * OR $x, $y; Sets VX to VX or VY. (Bitwise OR operation)
         */

        const instruction = Instruction.OR;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);
        const y = Parser.toRegisterString((this._opcode & 0x00F0) >> 4);

        return Parser.formatAssembly(instruction, x, y);
    },
    0x8002() {
        /**
         * 8XY2    BitOp    Vx=Vx&Vy
         *
         * AND $x, $y; Sets VX to VX and VY. (Bitwise AND operation)
         */

        const instruction = Instruction.AND;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);
        const y = Parser.toRegisterString((this._opcode & 0x00F0) >> 4);

        return Parser.formatAssembly(instruction, x, y);
    },
    0x8003() {
        /**
         * 8XY3    BitOp    Vx=Vx^Vy
         *
         * XOR $x, $y; Sets VX to VX xor VY.
         */

        const instruction = Instruction.XOR;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);
        const y = Parser.toRegisterString((this._opcode & 0x00F0) >> 4);

        return Parser.formatAssembly(instruction, x, y);
    },
    0x8004() {
        /**
         * 8XY4    Math    Vx += Vy
         *
         * ADD $x, $y; Adds VY to VX. VF is set to 1 when there's a carry, and to 0 when there isn't.
         */

        const instruction = Instruction.ADD;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);
        const y = Parser.toRegisterString((this._opcode & 0x00F0) >> 4);

        return Parser.formatAssembly(instruction, x, y);
    },
    0x8005() {
        /**
         * 8XY5    Math    Vx -= Vy
         *
         * SUB $x, $y; VY is subtracted from VX. VF is set to 0 when there's a borrow, and 1 when there isn't.
         */

        const instruction = Instruction.SUB;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);
        const y = Parser.toRegisterString((this._opcode & 0x00F0) >> 4);

        return Parser.formatAssembly(instruction, x, y);
    },
    0x8006() {
        /**
         * 8XY6    BitOp Vx=Vy=Vy>>1
         *
         * SHR $x; If the least-significant bit of Vx is 1, then VF is set to 1, otherwise 0. Then Vx is divided by 2.
         */

        const instruction = Instruction.SHR;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);

        return Parser.formatAssembly(instruction, x);
    },
    0x8007() {
        /**
         * 8XY7    Math    Vx=Vy-Vx
         *
         * SUBN $x, $y; Sets VX to VY minus VX. VF is set to 0 when there's a borrow, and 1 when there isn't.
         */

        const instruction = Instruction.SUBN;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);
        const y = Parser.toRegisterString((this._opcode & 0x00F0) >> 4);

        return Parser.formatAssembly(instruction, x, y);
    },
    0x800E() {
        /**
         * 8XYE    BitOp    Vx=Vy=Vy<<1
         *
         * SHL $x; Shifts VX Left By One.
         * VF is set to the value of the most significant bit of VX before the shift.
         */

        const instruction = Instruction.SHL;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);

        return Parser.formatAssembly(instruction, x);
    },
    0x9000() {
        /**
         * 9XY0    Cond    if(Vx!=Vy)
         *
         * SNE $x, $y; Skips the next instruction if VX doesn't equal VY.
         */

        const instruction = Instruction.SNE;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);
        const y = Parser.toRegisterString((this._opcode & 0x00F0) >> 4);

        return Parser.formatAssembly(instruction, x, y);
    },
    0xA000() {
        /**
         * ANNN    MEM    I = NNN
         *
         * LD I, addr; Sets I to the address NNN.
         */

        const instruction = Instruction.LD;
        const register = Parser.toRegisterString('', Register.INDEX);
        const address = Parser.toHexString(this._opcode & 0x0FFF);

        return Parser.formatAssembly(instruction, register, address);
    },
    0xB000() {
        /**
         * BNNN    Flow    PC=V0+NNN
         *
         * JP $0, addr; Jumps to the address NNN plus V0.
         */
        const instruction = Instruction.JP;
        const register = Parser.toRegisterString(0);
        const address = Parser.toHexString(this._opcode & 0x0FFF);

        return Parser.formatAssembly(instruction, register, address);
    },
    0xC000() {
        /**
         * CXNN    Rand    Vx=rand()&NN
         *
         * RND Vx, byte; Sets VX to the result of a bitwise and operation on a random number (Typically: 0 to 255) and NN.
         */

        const instruction = Instruction.RND;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);
        const nn = Parser.toHexString(this._opcode & 0x00FF);

        return Parser.formatAssembly(instruction, x, nn);
    },
    0xD000() {
        /**
         * DXYN    Disp    draw(Vx,Vy,N)
         *
         * DRW Vx, Vy, nibble;
         *
         * Draws a sprite at coordinate (VX, VY) that has a width of 8 pixels and a height of N pixels.
         * Each row of 8 pixels is read as bit-coded starting from memory location I -- I value doesn’t change after the execution of this instruction.
         * As described above, VF is set to 1 if any screen pixels are flipped from set to unset when the sprite is drawn, and to 0 if that doesn't happen
         */
        const instruction = Instruction.DRW;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);
        const y = Parser.toRegisterString((this._opcode & 0x00F0) >> 4);
        const n = Parser.toHexString(this._opcode & 0x000F);

        return Parser.formatAssembly(instruction, x, y, n);
    },
    0xE000() {
        return opcodes[this._opcode & 0xF0FF].call(this);
    },
    0xE09E() {
        /**
         * EX9E    KeyOp    if(key()==Vx)
         *
         * SKP $x; Skips the next instruction if the key stored in VX is pressed.
         */

        const instruction = Instruction.SKP;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);

        return Parser.formatAssembly(instruction, x);
    },
    0xE0A1() {
        /**
         * EXA1    KeyOp    if(key()!=Vx)
         * SKNP $x; Skips the next instruction if the key stored in VX isn't pressed.
         */

        const instruction = Instruction.SKNP;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);

        return Parser.formatAssembly(instruction, x);
    },
    0xF000() {
        return opcodes[(this._opcode & 0xF0FF)].call(this);
    },
    0xF007() {
        /**
         * FX07    Timer    Vx = get_delay()
         *
         * LD $x, DT; Sets VX to the value of the delay timer.
         */

        const instruction = Instruction.LD;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);

        return Parser.formatAssembly(instruction, x, Timer.DT);
    },
    0xF00A() {
        /**
         * FX0A    KeyOp    Vx = get_key()
         *
         * LD $x, K; A key press is awaited, and then stored in VX.
         * (Blocking Operation. All instruction halted until next key event)
         */

        const instruction = Instruction.LD;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);

        return Parser.formatAssembly(instruction, x, Key.K);
    },
    0xF015() {
        /**
         * FX15    Timer    delay_timer(Vx)
         *
         * LD DT, Vx; Sets the delay timer to VX.
         */

        const instruction = Instruction.LD;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);


        return Parser.formatAssembly(instruction, Timer.DT, x);
    },
    0xF018() {
        /**
         * FX18    Sound    sound_timer(Vx)
         *
         * LD ST, Vx; Sets the sound timer to VX.
         */

        const instruction = Instruction.LD;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);

        return Parser.formatAssembly(instruction, Timer.ST, x);
    },
    0xF01E() {
        /**
         * FX1E    MEM    I +=Vx
         *
         * ADD I, Vx; Adds VX to I.
         *
         * Note from wikipedia:
         * VF is set to 1 when there is a range overflow (I+VX>0xFFF), and to 0 when there isn't.
         * This is an undocumented feature of the CHIP-8 and used by the Spacefight 2091! game.
         */

        const instruction = Instruction.LD;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);

        return Parser.formatAssembly(instruction, Parser.toRegisterString('', Register.INDEX), x);
    },
    0xF029() {
        /**
         * FX29    MEM    I=sprite_addr[Vx]
         *
         * LD F, Vx;
         *
         * Sets I to the location of the sprite for the character in VX.
         * Characters 0-F (in hexadecimal) are represented by a 4x5 font.
         */

        const instruction = Instruction.LD;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);

        return Parser.formatAssembly(instruction, Font.F, x);
    },
    0xF033() {
        /**
         * FX33    BCD      set_BCD(Vx);
         *                  (I+0)=BCD(3);
         *                  (I+1)=BCD(2);
         *                  (I+2)=BCD(1);
         *
         * LD B, Vx;
         *
         * Stores the binary-coded decimal representation of VX, with the most significant of three digits at the address in I, the middle digit at I plus 1, and the least significant digit at I plus 2.
         *
         */

        const instruction = Instruction.LD;
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);

        return Parser.formatAssembly(instruction, BCD.B, x);
    },
    0xF055() {
        /**
         * FX55    MEM        reg_dump(Vx,&I)
         *
         * LD I, $0, $x
         *
         * Stores V0 to VX (including VX) in memory starting at address I.
         */

        const instruction = Instruction.LD;
        const $0 = Parser.toRegisterString(0);
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);
        const I = Parser.toRegisterString('', Register.INDEX);

        return Parser.formatAssembly(instruction, I, $0, x);
    },
    0xF065() {
        /**
         * FX65    MEM    reg_load(Vx,&I)
         *
         * LD $0, $x, I;
         *
         * Fills V0 to VX (including VX) with values from memory starting at address I.
         * I does not change
         */

        const instruction = Instruction.LD;
        const $0 = Parser.toRegisterString(0);
        const x = Parser.toRegisterString((this._opcode & 0x0F00) >> 8);
        const I = Parser.toRegisterString('', Register.INDEX);

        return Parser.formatAssembly(instruction, $0, x, I);
    }

};

export default opcodes;