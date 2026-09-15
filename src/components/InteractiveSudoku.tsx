import React, { useState, useEffect, useCallback } from 'react';
import { SudokuPuzzle } from '../data/mockPuzzles';
import { RotateCcw, Timer, Sparkles, Edit3, Trash2, Lightbulb, CheckCircle } from 'lucide-react';

interface InteractiveSudokuProps {
  puzzle: SudokuPuzzle;
  onComplete?: (timeSeconds: number) => void;
}

export const InteractiveSudoku: React.FC<InteractiveSudokuProps> = ({
  puzzle,
  onComplete,
}) => {
  // 9x9 board values
  const [board, setBoard] = useState<number[][]>(() =>
    puzzle.initialBoard.map((row) => [...row])
  );

  // Pencil notes: 9x9 array of Sets
  const [notes, setNotes] = useState<{ [key: string]: number[] }>({});

  const [selectedCell, setSelectedCell] = useState<[number, number] | null>([0, 2]);
  const [isPencilMode, setIsPencilMode] = useState<boolean>(false);
  const [showConflicts, setShowConflicts] = useState<boolean>(true);
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isSolved, setIsSolved] = useState<boolean>(false);

  // Check initial locked cells
  const isLocked = useCallback(
    (r: number, c: number) => puzzle.initialBoard[r][c] !== 0,
    [puzzle.initialBoard]
  );

  // Timer
  useEffect(() => {
    if (!isRunning || isSolved) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning, isSolved]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  // Check if board is complete and valid
  const checkCompletion = useCallback((currentBoard: number[][]) => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentBoard[r][c] !== puzzle.solution[r][c]) {
          return false;
        }
      }
    }
    return true;
  }, [puzzle.solution]);

  // Handle number input (both typed and clicked)
  const handleInputNumber = useCallback(
    (num: number) => {
      if (!selectedCell || isSolved) return;
      const [r, c] = selectedCell;

      if (isLocked(r, c)) return;

      if (isPencilMode) {
        // Toggle note
        const key = `${r},${c}`;
        setNotes((prev) => {
          const current = prev[key] || [];
          const next = current.includes(num)
            ? current.filter((n) => n !== num)
            : [...current, num].sort((a, b) => a - b);
          return { ...prev, [key]: next };
        });
      } else {
        setBoard((prev) => {
          const next = prev.map((row) => [...row]);
          // Toggle off if same number
          next[r][c] = next[r][c] === num ? 0 : num;

          if (checkCompletion(next)) {
            setIsSolved(true);
            setIsRunning(false);
            onComplete?.(seconds);
          }

          return next;
        });

        // Clear notes for this cell
        const key = `${r},${c}`;
        if (notes[key]) {
          setNotes((prev) => {
            const copy = { ...prev };
            delete copy[key];
            return copy;
          });
        }
      }
    },
    [selectedCell, isSolved, isLocked, isPencilMode, notes, checkCompletion, onComplete, seconds]
  );

  const handleErase = useCallback(() => {
    if (!selectedCell || isSolved) return;
    const [r, c] = selectedCell;
    if (isLocked(r, c)) return;

    setBoard((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = 0;
      return next;
    });

    const key = `${r},${c}`;
    if (notes[key]) {
      setNotes((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  }, [selectedCell, isSolved, isLocked, notes]);

  // Keyboard navigation & number input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        handleInputNumber(parseInt(e.key, 10));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        e.preventDefault();
        handleErase();
      } else if (e.key === 'ArrowUp' && selectedCell) {
        e.preventDefault();
        setSelectedCell([Math.max(selectedCell[0] - 1, 0), selectedCell[1]]);
      } else if (e.key === 'ArrowDown' && selectedCell) {
        e.preventDefault();
        setSelectedCell([Math.min(selectedCell[0] + 1, 8), selectedCell[1]]);
      } else if (e.key === 'ArrowLeft' && selectedCell) {
        e.preventDefault();
        setSelectedCell([selectedCell[0], Math.max(selectedCell[1] - 1, 0)]);
      } else if (e.key === 'ArrowRight' && selectedCell) {
        e.preventDefault();
        setSelectedCell([selectedCell[0], Math.min(selectedCell[1] + 1, 8)]);
      } else if (e.key === 'p' || e.key === 'n') {
        setIsPencilMode((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, handleInputNumber, handleErase]);

  const handleReset = () => {
    setBoard(puzzle.initialBoard.map((row) => [...row]));
    setNotes({});
    setIsSolved(false);
    setSeconds(0);
    setIsRunning(true);
    setSelectedCell([0, 2]);
  };

  const handleHint = () => {
    if (!selectedCell || isSolved) return;
    const [r, c] = selectedCell;
    if (isLocked(r, c)) return;

    setBoard((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = puzzle.solution[r][c];

      if (checkCompletion(next)) {
        setIsSolved(true);
        setIsRunning(false);
      }

      return next;
    });
  };

  // Find conflict for current cell
  const hasConflict = (r: number, c: number) => {
    if (!showConflicts) return false;
    const val = board[r][c];
    if (val === 0) return false;

    // Check row
    for (let col = 0; col < 9; col++) {
      if (col !== c && board[r][col] === val) return true;
    }
    // Check col
    for (let row = 0; row < 9; row++) {
      if (row !== r && board[row][c] === val) return true;
    }
    // Check 3x3 block
    const blockRow = Math.floor(r / 3) * 3;
    const blockCol = Math.floor(c / 3) * 3;
    for (let br = blockRow; br < blockRow + 3; br++) {
      for (let bc = blockCol; bc < blockCol + 3; bc++) {
        if ((br !== r || bc !== c) && board[br][bc] === val) return true;
      }
    }
    return false;
  };

  const selectedValue = selectedCell ? board[selectedCell[0]][selectedCell[1]] : 0;

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00204A] text-white text-[10px] font-cinzel font-bold px-2 py-0.5 rounded-2xs uppercase tracking-wider">
              {puzzle.title}
            </span>
            <span className="text-[11px] font-dateline text-stone-500">
              {puzzle.difficulty} • 9×9 Nikoli Grid
            </span>
          </div>
          <p className="text-[11px] font-dateline text-stone-600 mt-0.5">
            By {puzzle.author} • {puzzle.date}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 border border-stone-300 rounded text-xs font-dateline font-bold text-stone-800">
            <Timer className="w-3.5 h-3.5 text-[#FD8B18]" />
            <span>{formatTime(seconds)}</span>
          </div>

          <button
            onClick={() => setIsPencilMode((p) => !p)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-dateline font-semibold rounded border transition-colors shadow-2xs ${
              isPencilMode
                ? 'bg-[#00204A] text-white border-[#00204A]'
                : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-300'
            }`}
            title="Toggle Notes mode"
          >
            <Edit3 className="w-3 h-3" />
            <span>Pencil ({isPencilMode ? 'ON' : 'OFF'})</span>
          </button>

          <button
            onClick={handleHint}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-dateline font-semibold rounded border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 transition-colors shadow-2xs"
            title="Fill selected square with hint"
          >
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>Hint</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded border border-transparent"
            title="Reset Board"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Board & Keypad Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 9x9 Sudoku Board */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="inline-block border-2 border-stone-900 bg-stone-900 p-0.5 rounded-xs shadow-md">
            <div className="grid grid-cols-9 gap-0 bg-stone-400">
              {board.map((row, r) =>
                row.map((val, c) => {
                  const locked = isLocked(r, c);
                  const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
                  const isSameRow = selectedCell?.[0] === r;
                  const isSameCol = selectedCell?.[1] === c;
                  const isSameBlock =
                    selectedCell &&
                    Math.floor(selectedCell[0] / 3) === Math.floor(r / 3) &&
                    Math.floor(selectedCell[1] / 3) === Math.floor(c / 3);
                  const isMatchingVal = selectedValue !== 0 && val === selectedValue;
                  const conflict = hasConflict(r, c);

                  // Border styling for 3x3 boxes
                  const isRightBorder = (c + 1) % 3 === 0 && c !== 8;
                  const isBottomBorder = (r + 1) % 3 === 0 && r !== 8;

                  const cellNotes = notes[`${r},${c}`] || [];

                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      onClick={() => setSelectedCell([r, c])}
                      className={`relative w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center font-headline font-bold text-base sm:text-lg border-stone-200 border-r border-b select-none transition-colors ${
                        isRightBorder ? 'border-r-2 border-r-stone-900' : ''
                      } ${isBottomBorder ? 'border-b-2 border-b-stone-900' : ''} ${
                        isSelected
                          ? 'bg-[#FD8B18] text-[#00204A] ring-2 ring-[#00204A] z-10'
                          : conflict
                          ? 'bg-red-100 text-[#E5000C]'
                          : isMatchingVal
                          ? 'bg-amber-100 text-[#00204A]'
                          : isSameRow || isSameCol || isSameBlock
                          ? 'bg-stone-100/90 text-stone-900'
                          : 'bg-white text-stone-900'
                      }`}
                    >
                      {/* Render Digit */}
                      {val !== 0 ? (
                        <span
                          className={`${
                            locked
                              ? 'font-black text-stone-900'
                              : 'text-[#00204A] font-semibold'
                          } ${conflict ? 'text-[#E5000C]' : ''}`}
                        >
                          {val}
                        </span>
                      ) : cellNotes.length > 0 ? (
                        /* Render Pencil Notes */
                        <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5 text-[8px] font-dateline leading-none text-stone-500 pointer-events-none">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                            <span key={n} className="flex items-center justify-center">
                              {cellNotes.includes(n) ? n : ''}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-2.5 text-center text-xs font-dateline text-stone-500">
            Use on-screen keypad or physical keyboard numbers 1–9
          </div>
        </div>

        {/* Right: Keypad and Controls */}
        <div className="lg:col-span-4 bg-stone-50 border border-stone-300 p-4 rounded-sm space-y-4">
          <div className="border-b border-stone-200 pb-2">
            <h4 className="font-cinzel font-bold text-xs uppercase text-[#00204A] tracking-wider">
              Input Numbers (1–9)
            </h4>
            <p className="text-[11px] font-dateline text-stone-500">
              Mode: <strong className="text-[#00204A]">{isPencilMode ? 'Pencil Notes' : 'Direct Entry'}</strong>
            </p>
          </div>

          {/* Number Pad Grid 3x3 */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                onClick={() => handleInputNumber(n)}
                className="h-11 sm:h-12 bg-white hover:bg-stone-100 active:bg-amber-100 border border-stone-300 text-[#00204A] font-headline font-bold text-xl rounded shadow-2xs flex items-center justify-center transition-all"
              >
                {n}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleErase}
              className="py-2 px-3 bg-white hover:bg-stone-100 border border-stone-300 rounded text-xs font-dateline font-semibold text-stone-700 flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5 text-stone-500" />
              <span>Erase Cell</span>
            </button>

            <button
              onClick={() => setShowConflicts((c) => !c)}
              className={`py-2 px-3 border rounded text-xs font-dateline font-semibold flex items-center justify-center gap-1.5 shadow-2xs ${
                showConflicts
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
              }`}
            >
              <span>Auto-Check {showConflicts ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Rules & Instructions reminder */}
          <div className="pt-2 border-t border-stone-200 text-[11px] font-dateline text-stone-600 space-y-1">
            <div className="font-bold text-stone-800">Nikoli Broadsheet Rules:</div>
            <p>Every row, column, and 3×3 square box must contain the digits 1 through 9 exactly once.</p>
          </div>
        </div>
      </div>

      {/* Solved Victory Celebration Banner */}
      {isSolved && (
        <div className="mt-4 p-4 bg-emerald-50 border-2 border-emerald-600 rounded-sm text-emerald-950 flex flex-wrap items-center justify-between gap-3 shadow-md animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-headline font-bold text-base text-emerald-900">
                Magnificent! Sudoku Solved
              </h4>
              <p className="font-dateline text-xs text-emerald-800">
                You successfully mastered the 9×9 Nikoli Grid in <strong>{formatTime(seconds)}</strong>! Your puzzle rating has been updated.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-white hover:bg-stone-50 border border-emerald-300 rounded text-xs font-dateline font-semibold text-emerald-900 shadow-2xs"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
