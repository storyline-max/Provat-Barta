export interface CrosswordClue {
  num: number;
  text: string;
  answer: string;
  row: number;
  col: number;
  length: number;
}

export interface CrosswordPuzzle {
  id: string;
  number: number;
  title: string;
  date: string;
  size: number;
  difficulty: 'Gentle' | 'Medium' | 'Challenging';
  author: string;
  solution: string[][];
  cellNumbers: { [key: string]: number };
  clues: {
    across: CrosswordClue[];
    down: CrosswordClue[];
  };
}

export interface SudokuPuzzle {
  id: string;
  number: number;
  title: string;
  date: string;
  difficulty: 'Gentle' | 'Medium' | 'Diabolical';
  author: string;
  initialBoard: number[][];
  solution: number[][];
}

export const DAILY_CROSSWORD: CrosswordPuzzle = {
  id: 'daily-crossword-482',
  number: 482,
  title: 'The Broadsheet Daily Word Square',
  date: 'Saturday, September 5, 2026',
  size: 5,
  difficulty: 'Gentle',
  author: 'Arthur Wynne & The Provat Barta Desk',
  solution: [
    ['H', 'E', 'A', 'R', 'T'],
    ['E', 'M', 'B', 'E', 'R'],
    ['A', 'B', 'U', 'S', 'E'],
    ['R', 'E', 'S', 'I', 'N'],
    ['T', 'R', 'E', 'N', 'D'],
  ],
  cellNumbers: {
    '0,0': 1,
    '0,1': 2,
    '0,2': 3,
    '0,3': 4,
    '0,4': 5,
    '1,0': 6,
    '2,0': 7,
    '3,0': 8,
    '4,0': 9,
  },
  clues: {
    across: [
      { num: 1, text: 'Core of the matter; vital bodily engine (5)', answer: 'HEART', row: 0, col: 0, length: 5 },
      { num: 6, text: 'Glowing coal lingering in a wood hearth (5)', answer: 'EMBER', row: 1, col: 0, length: 5 },
      { num: 7, text: 'Improper use or mistreatment (5)', answer: 'ABUSE', row: 2, col: 0, length: 5 },
      { num: 8, text: 'Amber-yielding pine secretion (5)', answer: 'RESIN', row: 3, col: 0, length: 5 },
      { num: 9, text: 'Direction of public opinion or market shift (5)', answer: 'TREND', row: 4, col: 0, length: 5 },
    ],
    down: [
      { num: 1, text: 'Center of compassion or ticker pulse (5)', answer: 'HEART', row: 0, col: 0, length: 5 },
      { num: 2, text: 'Smoldering fragment of an evening fire (5)', answer: 'EMBER', row: 0, col: 1, length: 5 },
      { num: 3, text: 'Wrongful exercise of authority or power (5)', answer: 'ABUSE', row: 0, col: 2, length: 5 },
      { num: 4, text: 'Natural polymer tapped from trees (5)', answer: 'RESIN', row: 0, col: 3, length: 5 },
      { num: 5, text: 'Current inclination or viral trajectory (5)', answer: 'TREND', row: 0, col: 4, length: 5 },
    ],
  },
};

export const DAILY_SUDOKU: SudokuPuzzle = {
  id: 'daily-sudoku-719',
  number: 719,
  title: 'The Classic 9×9 Nikoli Grid',
  date: 'Saturday, September 5, 2026',
  difficulty: 'Medium',
  author: 'Maki Kaji Syndicate / Provat Barta',
  initialBoard: [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ],
  solution: [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ],
};
