#### CLS 
 * Clears the screen.
```
CLS
```
#### RET 
 * Returns from a subroutine.
```
RET
```
#### JP 
 * Jump To place in memory
```
 JP NNN; Jumps to address NNN.
 JP $0, addr; Jumps to the address NNN plus Register 0.
 
```
#### CALL
 * Calls subroutine.
 ```asm
 CALL NNN; Calls subroutine at address NNN.
 ```
#### SE 
 * Skips the next instruction if Register x equals NN.
 ```asm
    SE $x, NN; Skips the next instruction if Register x equals NN.
    SE $x, $y; Skips the next instruction if Register x equals Register y.
 ```
#### SNE
 * Skips the next instruction if Register x doesn't equal NN.
 ```asm
 SNE $x, NN; Skips the next instruction if Register x doesn't equal NN.
 SNE $x, $y; Skips the next instruction if Register x doesn't equal Register y.
 ```

#### LD
 * Load (or move) values.
 ```asm
 LD $x, NN; Sets Register x to NN.
 LD $x, $y; Sets Register x to the value of Register Y.
 LD I, NNN; Sets Register I to the address NNN.
 LD $x, DT; Sets Register X to the value of the delay timer.
 LD $x, K; A key press is awaited, and then stored in Register x. (Blocking Operation. All instruction halted until next key event)
 LD DT, $x; Sets the delay timer to the value in Register X.
 LD ST, $x; Sets the sound timer to the value in Register X.
 LD F, Vx; Sets I to the location of the sprite for the character in VX.(Characters 0-F (in hexadecimal) are represented by a 4x5 font.)
 LD B, Vx; Stores the binary-coded decimal representation of VX, with the most significant of three digits at the address in I, the middle digit at I plus 1, and the least significant digit at I plus 2.
 LD I, $0, $x; Stores Register 0 to Register x (including  Register X) in memory starting at address I.
 LD $0, $x, I; Fills Register 0 to Register x (including Register X) with values from memory starting at address I.
 ```

#### ADD
 * Add values
 ```asm
 ADD $x, NN; Adds NN to Register x. (Carry flag is not changed) (x += NN)
 ADD $x, $y; Adds Register y to Register x. Register F is set to 1 when there's a carry, and to 0 when there isn't. (x += y)
 ADD I, $x; Adds Register x to I. (I += x)
 ```
 
#### SUB, SUBN
  *  Subtract values
  ```asm
  SUB $x, $y; Register y is subtracted from Register x. Register F is set to 0 when there's a borrow, and 1 when there isn't. (x -= y)
  SUBN $x, $y; Register x is set to Register y minus Register x (x = y - x)
  ```
  
#### OR
 *  Bitwise OR
 ```asm
 OR $x, $y; Sets Register x to Register x or Register y ( x = x | y ).
 ```
 
#### XOR
  * Bitwise XOR
  ```asm
  XOR $x, $y; Sets Register x to Register x xor Register y (x = x ^ y).
  ```

#### AND
  * Bitwise AND
  ```asm
  AND $x, $y; Sets register x to Register x AND Register y (x = x & y)
  ```  
#### SHR
  * Bitwise Shift Right
  ```asm
  SHR $x; Set Register F to the least significant bit of Register x and then shift Register x right by one
  ```
  
#### SHL
  * Bitwise Shift Left
  ```asm
  SHL $x; Set Register F to the least significant bit of Register x and then shift Register X Left By One.
  ```  

#### RND
  * Random Number
  ```asm
  RND $x, NN;  Sets VX to the result of a bitwise AND operation on a random number and NN.
  ```
  
#### DRW
  * Draw to screen
  ```asm
  DRW Vx, Vy, N;  
      Draws a sprite at coordinate (Register X, Register Y) that has a width of 8 pixels and a height of N pixels.
      Each row of 8 pixels is read as bit-coded starting from memory location Register I -- Register I value doesn’t change after the execution of this instruction.
      As described above, Register F is set to 1 if any screen pixels are flipped from set to unset when the sprite is drawn, and to 0 if that doesn't happen
  ```
  
 #### SKP, SKNP 
   * Key Operations
   ```asm
   SKP $x; Skips the next instruction if the key stored in Register x is pressed.
   SKNP $x; Skips the next instruction if the key stored in Register x isn't pressed.
   ```
  