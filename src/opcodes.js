"use strict";

export const opcodes = {
    0x0000(){
        if ((this._opcode & 0x00FF)) {
            opcodes[this._opcode & 0x00FF].call(this);
        } else {
            /**
             * 0x0NNN - Not Implemented, call RCA 1802 program at address NNN
             */
            //this._log(`Skipping instruction at ${this._pc.toString(16).padStart(6, '0x0000')}`);
            this._pc += 2;
        }
    },
    0x00E0(){
        /**
         * 00E0    Display    disp_clear()
         *
         * Clears the screen.
         */
        this._gpu.clearScreen();
        this._pc += 2;
    },
    0x00EE(){
        /**
         * 00EE    Flow
         *
         * return;    Returns from a subroutine.
         */

        this._pc = this._stack[--this._sp];
        this._pc += 2;
    },
    0x1000(){
        /**
         * 1NNN    Flow    goto NNN;
         *
         * Jumps to address NNN.
         */
        //this._log(`Jumping from ${this._toHexString(this._pc)}, to ${this._toHexString( this._opcode & 0x0FFF)}`);
        this._pc = this._opcode & 0x0FFF;
    },
    0x2000(){
        /**
         * 2NNN    Flow    *(0xNNN)()
         *
         * Calls subroutine at NNN.
         */

        this._stack[this._sp] = this._pc;
        this._sp++;
        this._pc = this._opcode & 0x0FFF;
    },
    0x3000(){
        /**
         * 3XNN    Cond    if(Vx==NN)
         *
         * Skips the next instruction if VX equals NN.
         */

        const x = (this._opcode & 0x0F00) >> 8;
        let nn = this._opcode & 0x00FF;

        if (this._V[x] === nn) {
            this._pc += 4;
        } else {
            this._pc += 2;
        }
    },
    0x4000(){
        /**
         * 4XNN    Cond    if(Vx!=NN)
         *
         * Skips the next instruction if VX doesn't equal NN.
         */

        const x = (this._opcode & 0x0F00) >> 8;
        let nn = this._opcode & 0x00FF;

        if (this._V[x] !== nn) {
            this._pc += 4;
        } else {
            this._pc += 2;
        }
    },
    0x5000(){
        /**
         * 5XY0    Cond    if(Vx==Vy)
         *
         * Skips the next instruction if VX equals VY.
         */

        const x = (this._opcode & 0x0F00) >> 8;
        const y = (this._opcode & 0x00F0) >> 4;

        if (this._V[x] === this._V[y]) {
            this._pc += 4;
        } else {
            this._pc += 2;
        }
    },
    0x6000(){
        /**
         * 6XNN    Const    Vx = NN
         *
         * Sets VX to NN.
         */

        const x = (this._opcode & 0x0F00) >> 8;
        this._V[x] = (this._opcode & 0x00FF);

        this._pc += 2;
    },
    0x7000(){
        /**
         * 7XNN    Const    Vx += NN
         *
         * Adds NN to VX. (Carry flag is not changed)
         */

        const x = (this._opcode & 0x0F00) >> 8;
        this._V[x] += (this._opcode & 0x00FF);

        this._pc += 2;
    },
    0x8000(){
        if ((this._opcode & 0x000F)) {
            opcodes[this._opcode & 0xF00F].call(this);
        } else {
            /**
             * 8XY0    Assign    Vx=Vy
             *
             * Sets VX to the value of VY.
             */

            const x = (this._opcode & 0x0F00) >> 8;
            const y = (this._opcode & 0x00F0) >> 4;

            this._V[x] = this._V[y];

            this._pc += 2;
        }
    },
    0x8001(){
        /**
         * 8XY1    BitOp    Vx=Vx|Vy
         *
         * Sets VX to VX or VY. (Bitwise OR operation)
         */

        const x = (this._opcode & 0x0F00) >> 8;
        const y = (this._opcode & 0x00F0) >> 4;

        this._V[x] |= this._V[y];

        this._pc += 2;
    },
    0x8002(){
        /**
         * 8XY2    BitOp    Vx=Vx&Vy
         *
         * Sets VX to VX and VY. (Bitwise AND operation)
         */

        const x = (this._opcode & 0x0F00) >> 8;
        const y = (this._opcode & 0x00F0) >> 4;

        this._V[x] = (this._V[x] & this._V[y]);

        this._pc += 2;
    },
    0x8003(){
        /**
         * 8XY3    BitOp    Vx=Vx^Vy
         *
         * Sets VX to VX xor VY.
         */

        const x = (this._opcode & 0x0F00) >> 8;
        const y = (this._opcode & 0x00F0) >> 4;

        this._V[x] = (this._V[x] ^ this._V[y]);

        this._pc += 2;
    },
    0x8004(){
        /**
         * 8XY4    Math    Vx += Vy
         *
         * Adds VY to VX. VF is set to 1 when there's a carry, and to 0 when there isn't.
         */

        const x = (this._opcode & 0x0F00) >> 8;
        const y = (this._opcode & 0x00F0) >> 4;

        if (this._V[x] > (0xFF - this._V[y])) {
            this._V[0xF] = 1;
        } else {
            this._V[0xF] = 0;
        }

        this._V[x] += this._V[y];
        this._pc += 2;
    },
    0x8005(){
        /**
         * 8XY5    Math    Vx -= Vy
         *
         * VY is subtracted from VX. VF is set to 0 when there's a borrow, and 1 when there isn't.
         */

        const x = (this._opcode & 0x0F00) >> 8;
        const y = (this._opcode & 0x00F0) >> 4;

        if (this._V[y] > this._V[x]) {
            this._V[0xF] = 0;
        } else {
            this._V[0xF] = 1;
        }

        this._V[x] -= this._V[y];

        this._pc += 2;
    },
    0x8006(){
        /**
         * 8XY6    BitOp Vx=Vy=Vy>>1
         *
         * Shifts VY right by one and copies the result to VX.
         * VF is set to the value of the least significant bit of VY before the shift.
         */

        const x = (this._opcode & 0x0F00) >> 8;
        //const y = (this._opcode & 0x00F0) >> 4;


        this._V[0xF] = this._V[x] & 0x01;
        //this._V[y] = this._V[y]>>1;
        this._V[x] = this._V[x] >> 1;

        this._pc += 2;
    },
    0x8007(){
        /**
         * 8XY7    Math    Vx=Vy-Vx
         *
         * Sets VX to VY minus VX. VF is set to 0 when there's a borrow, and 1 when there isn't.
         */

        const x = (this._opcode & 0x0F00) >> 8;
        const y = (this._opcode & 0x00F0) >> 4;

        if (this._V[x] > this._V[y]) {
            this._V[0xF] = 0;
        } else {
            this._V[0xF] = 1;
        }

        this._V[x] = this._V[y] - this._V[x];

        this._pc += 2;
    },
    0x800E(){
        /**
         * 8XYE    BitOp    Vx=Vy=Vy<<1
         *
         * Shifts VX Left By One.
         * VF is set to the value of the most significant bit of VX before the shift.
         */

        const x = (this._opcode & 0x0F00) >> 8;

        this._V[0xF] = (this._V[x] & 0x80);
        this._V[x] = this._V[x] << 1;

        this._pc += 2;
    },
    0x9000(){
        /**
         * 9XY0    Cond    if(Vx!=Vy)
         *
         * Skips the next instruction if VX doesn't equal VY.
         */

        const x = (this._opcode & 0x0F00) >> 8;
        const y = (this._opcode & 0x00F0) >> 4;

        if (this._V[x] !== this._V[y]) {
            this._pc += 4;
        } else {
            this._pc += 2;
        }
    },
    0xA000(){
        /**
         * ANNN    MEM    I = NNN
         *
         * Sets I to the address NNN.
         */

        this._I = this._opcode & 0x0FFF;

        this._pc += 2;
    },
    0xB000(){
        /**
         * BNNN    Flow    PC=V0+NNN
         *
         * Jumps to the address NNN plus V0.
         */

        this._pc = this._V[0] + (this._opcode & 0x0FFF);
    },
    0xC000(){
        /**
         * CXNN    Rand    Vx=rand()&NN
         *
         * Sets VX to the result of a bitwise and operation on a random number (Typically: 0 to 255) and NN.
         */

        const x = (this._opcode & 0x0F00) >> 8;
        let nn = this._opcode & 0x00FF;

        this._V[x] = ((Math.random() * 0xFF) & nn) | 0;

        this._pc += 2;
    },
    0xD000(){
        /**
         * DXYN    Disp    draw(Vx,Vy,N)
         *
         * Draws a sprite at coordinate (VX, VY) that has a width of 8 pixels and a height of N pixels.
         * Each row of 8 pixels is read as bit-coded starting from memory location I -- I value doesn’t change after the execution of this instruction.
         * As described above, VF is set to 1 if any screen pixels are flipped from set to unset when the sprite is drawn, and to 0 if that doesn't happen
         */
        const x = (this._opcode & 0x0F00) >> 8;
        const y = (this._opcode & 0x00F0) >> 4;
        let n = (this._opcode & 0x000F);
        let pixel;

        for (let row = 0; row < n; row += 1) {
            pixel = this._memory[this._I + row];
            for (let col = 0; col < 8; col += 1) {
                if ((pixel & (0b10000000 >> col)) !== 0) {
                    let screenLocation = (this._V[x] + col) + ( (this._V[y] + row) * 64 );
                    if (this._gpu.screen[screenLocation] === 1) {
                        this._V[0xF] = 1;
                    } else {
                        this._V[0xF] = 0;
                    }
                    this._gpu.screen[screenLocation] ^= 1;
                }
            }
        }
        this.drawFlag = true;
        this._pc += 2;
    },
    0xE000(){
        opcodes[this._opcode & 0xF0FF].call(this);
    },
    0xE09E(){
        /**
         * EX9E    KeyOp    if(key()==Vx)
         *
         * Skips the next instruction if the key stored in VX is pressed.
         */

        const x = (this._opcode & 0x0F00) >> 8;

        if (this._input.keys[this._V[x]] > 0) {
            this._pc += 4;
        } else {
            this._pc += 2;
        }
    },
    0xE0A1(){
        /**
         * EXA1    KeyOp    if(key()!=Vx)
         * Skips the next instruction if the key stored in VX isn't pressed.
         */

        const x = (this._opcode & 0x0F00) >> 8;

        if (this._input.keys[this._V[x]] === 0) {
            this._pc += 4;
        } else {
            this._pc += 2;
        }
    },
    0xF000(){
        opcodes[(this._opcode & 0xF0FF)].call(this);
    },
    0xF007(){
        /**
         * FX07    Timer    Vx = get_delay()
         *
         * Sets VX to the value of the delay timer.
         */

        const x = (this._opcode & 0x0F00) >> 8;

        this._V[x] = this._TIMERS.delay;

        this._pc += 2;
    },
    0xF00A(){
        /**
         * FX0A    KeyOp    Vx = get_key()
         *
         *  A key press is awaited, and then stored in VX.
         * (Blocking Operation. All instruction halted until next key event)
         */

        const x = (this._opcode & 0x0F00) >> 8;
        const nextKeyPress = () => {
            this.isWaiting = false;
            this._V[x] = this._input.lastKeyPressed;
        };

        this.isWaiting = true;
        this._input.requestNextKeyPress( nextKeyPress.bind(this) );

        this._pc += 2;
    },
    0xF015(){
        /**
         * FX15    Timer    delay_timer(Vx)
         *
         * Sets the delay timer to VX.
         */

        const x = (this._opcode & 0x0F00) >> 8;

        this._TIMERS.delay = this._V[x];

        this._pc += 2;
    },
    0xF018(){
        /**
         * FX18    Sound    sound_timer(Vx)
         *
         * Sets the sound timer to VX.
         */

        const x = (this._opcode & 0x0F00) >> 8;

        this._TIMERS.sound = this._V[x];

        this._pc += 2;
    },
    0xF01E(){
        /**
         * FX1E    MEM    I +=Vx
         *
         * Adds VX to I.
         *
         * Note from wikipedia:
         * VF is set to 1 when there is a range overflow (I+VX>0xFFF), and to 0 when there isn't.
         * This is an undocumented feature of the CHIP-8 and used by the Spacefight 2091! game.
         */

        const x = (this._opcode & 0x0F00) >> 8;

        if ((0xFFF - this._I) < this._V[x]) {
            this._V[0xF] = 1;
        } else {
            this._V[0xF] = 0;
        }

        this._I += this._V[x];

        this._pc += 2;
    },
    0xF029(){
        /**
         * FX29    MEM    I=sprite_addr[Vx]
         * Sets I to the location of the sprite for the character in VX.
         * Characters 0-F (in hexadecimal) are represented by a 4x5 font.
         */

        const x = (this._opcode & 0x0F00) >> 8;
        this._I = this._V[x] * 5;

        this._pc += 2;
    },
    0xF033(){
        /**
         * FX33    BCD     set_BCD(Vx);
         *      (I+0)=BCD(3);
         *      (I+1)=BCD(2);
         *      (I+2)=BCD(1);
         *
         * Stores the binary-coded decimal representation of VX, with the most significant of three digits at the address in I, the middle digit at I plus 1, and the least significant digit at I plus 2.
         *
         * (In other words, take the decimal representation of VX, place the hundreds digit in memory at location in I, the tens digit at location I+1, and the ones digit at location I+2.)
         */

        const x = (this._opcode & 0x0F00) >> 8;


        this._memory[this._I + 0] = (this._V[x] / 100) | 0;
        this._memory[this._I + 1] = ((this._V[x] % 100) / 10) | 0;
        this._memory[this._I + 2] = ((this._V[x] % 10)) | 0;

        this._pc += 2;
    },
    0xF055(){
        /**
         * FX55    MEM        reg_dump(Vx,&I)
         *
         * Stores V0 to VX (including VX) in memory starting at address I.
         * I does not change
         */
        const x = (this._opcode & 0x0F00) >> 8;

        for (let i = 0; i <= x; i += 1) {
            this._memory[this._I + i] = this._V[i];
        }

        this._pc += 2;
    },
    0xF065(){
        /**
         * FX65    MEM    reg_load(Vx,&I)
         *
         * Fills V0 to VX (including VX) with values from memory starting at address I.
         * I does not change
         */

        const x = (this._opcode & 0x0F00) >> 8;

        for (let i = 0; i <= x; i += 1) {
            this._V[i] = this._memory[this._I + i];
        }

        this._pc += 2;
    }

};