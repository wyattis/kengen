# KenKen
This is a library for generating and rendering KenKen puzzles. Puzzle generation is seedable and highly 
customizable. Rendering can also be customized.

[KenKen](https://en.wikipedia.org/wiki/KenKen) are mathematical puzzles similar to [Sudoku](). 
They must include exactly one of each number in each column and row while also solving the simple math
problems arranged throughout the board.

This library generates KenKen puzzles of any size and is capable of rendering them as images via an 
HTMLCanvasElement.

## Usage
#####  Generate a 4x4 KenKen puzzle.
```typescript
import { KenKenGenerator } from 'ken-ken'

const puz = KenKenGenerator.generate({ size: 4 })
```
   
##### Generate a 6x6 KenKen puzzle with a specific seed and more math operations

```typescript
import { KenKenGenerator, MathOperators } from 'ken-ken'

const puz = KenKenGenerator.generate({ 
  size: 6, 
  seed: 1069, 
  operations: [
    MathOperators.ADDITION, 
    MathOperators.SUBTRACTION, 
    MathOperators.MULTIPLICATION, 
    MathOperators.DIVISION] 
})
```

    
##### Render a 7x7 to a PNG
Uses the [node-canvas](https://www.npmjs.com/package/canvas) library.
```typescript
import { KenKenGenerator, Renderer } from 'ken-ken'
import { createCanvas } from 'canvas'
import * as fs from 'fs'

const puz = KenKenGenerator.generate({ size: 7 })
const canvas = createCanvas(100, 100)
Renderer.renderCanvas(puz, canvas.getContext('2d'), { withSolution: true })
const canvasBuffer = canvas.toBuffer()
fs.writeFileSync('kenken-7x7.png', canvasBuffer)
```

## Output

### 4x4
![4x4 Puzzle](static/images/4x4-kenken-1.png) ![4x4 Puzzle Solution](static/images/4x4-kenken-1-solution.png)
### 5x5
![5x5 Puzzle](static/images/5x5-kenken-1.png) ![5x5 Puzzle Solution](static/images/5x5-kenken-1-solution.png)
### 6x6
![6x6 Puzzle](static/images/6x6-kenken-1.png) ![6x6 Puzzle Solution](static/images/6x6-kenken-1-solution.png)
### 7x7
![7x7 Puzzle](static/images/7x7-kenken-1.png) ![7x7 Puzzle Solution](static/images/7x7-kenken-1-solution.png)
### 8x8
![8x8 Puzzle](static/images/8x8-kenken-1.png) ![8x8 Puzzle Solution](static/images/8x8-kenken-1-solution.png)
### 9x9
![9x9 Puzzle](static/images/9x9-kenken-1.png) ![9x9 Puzzle Solution](static/images/9x9-kenken-1-solution.png)
### 10x10
![10x10 Puzzle](static/images/10x10-kenken-1.png) ![10x10 Puzzle Solution](static/images/10x10-kenken-1-solution.png)

### TODO
- [ ] Allow more complex math constraints to be imposed
- [ ] Test the various types of math operations
- [ ] Generate cell and math distributions
- [ ] Add CLI interface
