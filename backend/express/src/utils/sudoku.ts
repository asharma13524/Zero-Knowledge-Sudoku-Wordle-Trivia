export function generateValidSudoku(): number[][] {
  // Initialize empty 9x9 grid
  const grid: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));

  // Helper function to check if a given number can be placed in a cell
  function isValid(row: number, col: number, num: number): boolean {
    // Check if number is already present in row
    if (grid[row].includes(num)) {
      return false;
    }
    // Check if number is already present in column
    if (grid.some((r) => r[col] === num)) {
      return false;
    }
    // Check if number is already present in 3x3 subgrid
    const subgridRow = 3 * Math.floor(row / 3);
    const subgridCol = 3 * Math.floor(col / 3);
    for (let i = subgridRow; i < subgridRow + 3; i++) {
      for (let j = subgridCol; j < subgridCol + 3; j++) {
        if (grid[i][j] === num) {
          return false;
        }
      }
    }
    // If number can be placed in cell, return true
    return true;
  }

  // Helper function to generate a list of valid numbers for a cell
  function* validNumbers(row: number, col: number): Generator<number> {
    const candidates = Array.from({ length: 9 }, (_, i) => i + 1);
    shuffleArray(candidates);
    for (const num of candidates) {
      if (isValid(row, col, num)) {
        yield num;
      }
    }
  }

  // Fill in grid with valid numbers using backtracking
  function fillGrid(): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          for (const num of validNumbers(row, col)) {
            grid[row][col] = num;
            if (fillGrid()) {
              return true;
            }
            grid[row][col] = 0;
          }
          return false;
        }
      }
    }
    return true;
  }

  // Fill in grid and return result
  fillGrid();
  return grid;
}

export function generateSudokuPuzzle(validSudoku: number[][]): number[][] {
  // Copy valid sudoku to avoid modifying it
  const puzzle: number[][] = validSudoku.map((row) => [...row]);

  // Remove random cells from each row
  for (const row of puzzle) {
    const indicesToRemove = shuffleArray([...Array(9).keys()]).slice(
      0,
      randomInt(4, 7)
    );
    for (const index of indicesToRemove) {
      row[index] = 0;
    }
  }

  return puzzle;
}

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function convertSudokuBoardToAleoPuzzleInfo(puzzle: number[][]) {
  return `{ row1: {
      n1: ${puzzle[0][0]}u8,
      n2: ${puzzle[0][1]}u8,
      n3: ${puzzle[0][2]}u8,
      n4: ${puzzle[0][3]}u8,
      n5: ${puzzle[0][4]}u8,
      n6: ${puzzle[0][5]}u8,
      n7: ${puzzle[0][6]}u8,
      n8: ${puzzle[0][7]}u8,
      n9: ${puzzle[0][8]}u8
    }, row2: {
      n1: ${puzzle[1][0]}u8,
      n2: ${puzzle[1][1]}u8,
      n3: ${puzzle[1][2]}u8,
      n4: ${puzzle[1][3]}u8,
      n5: ${puzzle[1][4]}u8,
      n6: ${puzzle[1][5]}u8,
      n7: ${puzzle[1][6]}u8,
      n8: ${puzzle[1][7]}u8,
      n9: ${puzzle[1][8]}u8
    }, row3: {
      n1: ${puzzle[2][0]}u8,
      n2: ${puzzle[2][1]}u8,
      n3: ${puzzle[2][2]}u8,
      n4: ${puzzle[2][3]}u8,
      n5: ${puzzle[2][4]}u8,
      n6: ${puzzle[2][5]}u8,
      n7: ${puzzle[2][6]}u8,
      n8: ${puzzle[2][7]}u8,
      n9: ${puzzle[2][8]}u8
    }, row4: {
      n1: ${puzzle[3][0]}u8,
      n2: ${puzzle[3][1]}u8,
      n3: ${puzzle[3][2]}u8,
      n4: ${puzzle[3][3]}u8,
      n5: ${puzzle[3][4]}u8,
      n6: ${puzzle[3][5]}u8,
      n7: ${puzzle[3][6]}u8,
      n8: ${puzzle[3][7]}u8,
      n9: ${puzzle[3][8]}u8
    }, row5: {
      n1: ${puzzle[4][0]}u8,
      n2: ${puzzle[4][1]}u8,
      n3: ${puzzle[4][2]}u8,
      n4: ${puzzle[4][3]}u8,
      n5: ${puzzle[4][4]}u8,
      n6: ${puzzle[4][5]}u8,
      n7: ${puzzle[4][6]}u8,
      n8: ${puzzle[4][7]}u8,
      n9: ${puzzle[4][8]}u8
    }, row6: {
      n1: ${puzzle[5][0]}u8,
      n2: ${puzzle[5][1]}u8,
      n3: ${puzzle[5][2]}u8,
      n4: ${puzzle[5][3]}u8,
      n5: ${puzzle[5][4]}u8,
      n6: ${puzzle[5][5]}u8,
      n7: ${puzzle[5][6]}u8,
      n8: ${puzzle[5][7]}u8,
      n9: ${puzzle[5][8]}u8
    }, row7: {
      n1: ${puzzle[6][0]}u8,
      n2: ${puzzle[6][1]}u8,
      n3: ${puzzle[6][2]}u8,
      n4: ${puzzle[6][3]}u8,
      n5: ${puzzle[6][4]}u8,
      n6: ${puzzle[6][5]}u8,
      n7: ${puzzle[6][6]}u8,
      n8: ${puzzle[6][7]}u8,
      n9: ${puzzle[6][8]}u8
    }, row8: {
      n1: ${puzzle[7][0]}u8,
      n2: ${puzzle[7][1]}u8,
      n3: ${puzzle[7][2]}u8,
      n4: ${puzzle[7][3]}u8,
      n5: ${puzzle[7][4]}u8,
      n6: ${puzzle[7][5]}u8,
      n7: ${puzzle[7][6]}u8,
      n8: ${puzzle[7][7]}u8,
      n9: ${puzzle[7][8]}u8
    }, row9: {
      n1: ${puzzle[8][0]}u8,
      n2: ${puzzle[8][1]}u8,
      n3: ${puzzle[8][2]}u8,
      n4: ${puzzle[8][3]}u8,
      n5: ${puzzle[8][4]}u8,
      n6: ${puzzle[8][5]}u8,
      n7: ${puzzle[8][6]}u8,
      n8: ${puzzle[8][7]}u8,
      n9: ${puzzle[8][8]}u8
    }
  }`;
}