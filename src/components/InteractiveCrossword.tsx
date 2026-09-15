import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CrosswordPuzzle, CrosswordClue } from '../data/mockPuzzles';
import { CheckCircle2, RotateCcw, HelpCircle, Eye, Timer, Sparkles, Award, ArrowRight } from 'lucide-react';

interface InteractiveCrosswordProps {
  puzzle: CrosswordPuzzle;
  onComplete?: (timeSeconds: number) => void;
}

export const InteractiveCrossword: React.FC<InteractiveCrosswordProps> = ({
  puzzle,
  onComplete,
}) => {
  const [grid, setGrid] = useState<string[][]>(() =>
    Array(puzzle.size)
      .fill('')
      .map(() => Array(puzzle.size).fill(''))
  );
  const [selectedRow, setSelectedRow] = useState<number>(0);
  const [selectedCol, setSelectedCol] = useState<number>(0);
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [checkedErrors, setCheckedErrors] = useState<boolean[][]>(() =>
    Array(puzzle.size)
      .fill(false)
      .map(() => Array(puzzle.size).fill(false))
  );
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    if (!isRunning || isSolved) return;
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isSolved]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  // Find active clue based on selected cell and direction
  const activeClue = React.useMemo(() => {
    const clueList = direction === 'across' ? puzzle.clues.across : puzzle.clues.down;
    return clueList.find((clue) => {
      if (direction === 'across') {
        return (
          clue.row === selectedRow &&
          selectedCol >= clue.col &&
          selectedCol < clue.col + clue.length
        );
      } else {
        return (
          clue.col === selectedCol &&
          selectedRow >= clue.row &&
          selectedRow < clue.row + clue.length
        );
      }
    });
  }, [direction, selectedRow, selectedCol, puzzle.clues]);

  // Check completion
  const checkIfSolved = useCallback((currentGrid: string[][]) => {
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        if (currentGrid[r][c].toUpperCase() !== puzzle.solution[r][c].toUpperCase()) {
          return false;
        }
      }
    }
    return true;
  }, [puzzle.size, puzzle.solution]);

  const handleCellClick = (r: number, c: number) => {
    if (selectedRow === r && selectedCol === c) {
      // Toggle direction
      setDirection((d) => (d === 'across' ? 'down' : 'across'));
    } else {
      setSelectedRow(r);
      setSelectedCol(c);
    }
  };

  const handleClueClick = (clue: CrosswordClue, dir: 'across' | 'down') => {
    setDirection(dir);
    setSelectedRow(clue.row);
    setSelectedCol(clue.col);
  };

  // Keyboard navigation & typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in another input
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedCol((c) => Math.min(c + 1, puzzle.size - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedCol((c) => Math.max(c - 1, 0));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedRow((r) => Math.min(r + 1, puzzle.size - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedRow((r) => Math.max(r - 1, 0));
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setDirection((d) => (d === 'across' ? 'down' : 'across'));
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setGrid((prev) => {
          const next = prev.map((row) => [...row]);
          if (next[selectedRow][selectedCol] !== '') {
            next[selectedRow][selectedCol] = '';
          } else {
            // Move back
            if (direction === 'across' && selectedCol > 0) {
              setSelectedCol(selectedCol - 1);
              next[selectedRow][selectedCol - 1] = '';
            } else if (direction === 'down' && selectedRow > 0) {
              setSelectedRow(selectedRow - 1);
              next[selectedRow - 1][selectedCol] = '';
            }
          }
          return next;
        });
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        const char = e.key.toUpperCase();
        setGrid((prev) => {
          const next = prev.map((row) => [...row]);
          next[selectedRow][selectedCol] = char;

          // Clear error highlight on typed cell
          setCheckedErrors((errs) => {
            const copy = errs.map((row) => [...row]);
            copy[selectedRow][selectedCol] = false;
            return copy;
          });

          // Check if now fully solved
          if (checkIfSolved(next)) {
            setIsSolved(true);
            setIsRunning(false);
            onComplete?.(seconds);
          }

          return next;
        });

        // Advance cursor to next cell
        if (direction === 'across') {
          if (selectedCol < puzzle.size - 1) {
            setSelectedCol(selectedCol + 1);
          }
        } else {
          if (selectedRow < puzzle.size - 1) {
            setSelectedRow(selectedRow + 1);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRow, selectedCol, direction, puzzle.size, checkIfSolved, seconds, onComplete]);

  // Actions
  const handleCheckGrid = () => {
    const newErrors = Array(puzzle.size)
      .fill(false)
      .map(() => Array(puzzle.size).fill(false));

    let hasMismatch = false;
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        if (grid[r][c] && grid[r][c].toUpperCase() !== puzzle.solution[r][c].toUpperCase()) {
          newErrors[r][c] = true;
          hasMismatch = true;
        }
      }
    }
    setCheckedErrors(newErrors);
  };

  const handleRevealLetter = () => {
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      next[selectedRow][selectedCol] = puzzle.solution[selectedRow][selectedCol];
      if (checkIfSolved(next)) {
        setIsSolved(true);
        setIsRunning(false);
      }
      return next;
    });
  };

  const handleRevealGrid = () => {
    setGrid(puzzle.solution.map((row) => [...row]));
    setIsSolved(true);
    setIsRunning(false);
  };

  const handleReset = () => {
    setGrid(
      Array(puzzle.size)
        .fill('')
        .map(() => Array(puzzle.size).fill(''))
    );
    setCheckedErrors(
      Array(puzzle.size)
        .fill(false)
        .map(() => Array(puzzle.size).fill(false))
    );
    setIsSolved(false);
    setSeconds(0);
    setIsRunning(true);
  };

  // Helper to determine if a cell is in the active clue
  const isCellInActiveClue = (r: number, c: number) => {
    if (!activeClue) return false;
    if (direction === 'across') {
      return r === activeClue.row && c >= activeClue.col && c < activeClue.col + activeClue.length;
    } else {
      return c === activeClue.col && r >= activeClue.row && r < activeClue.row + activeClue.length;
    }
  };

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00204A] text-white text-[10px] font-cinzel font-bold px-2 py-0.5 rounded-2xs uppercase tracking-wider">
              {puzzle.title}
            </span>
            <span className="text-[11px] font-dateline text-stone-500">
              {puzzle.difficulty} • 5×5 Grid
            </span>
          </div>
          <p className="text-[11px] font-dateline text-stone-600 mt-0.5">
            By {puzzle.author} • {puzzle.date}
          </p>
        </div>

        {/* Timer and Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 border border-stone-300 rounded text-xs font-dateline font-bold text-stone-800">
            <Timer className="w-3.5 h-3.5 text-[#FD8B18]" />
            <span>{formatTime(seconds)}</span>
          </div>

          <button
            onClick={handleCheckGrid}
            className="px-2.5 py-1 text-xs font-dateline font-semibold border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 rounded transition-colors shadow-2xs"
            title="Check entries for errors"
          >
            Check Grid
          </button>

          <button
            onClick={handleRevealLetter}
            className="px-2.5 py-1 text-xs font-dateline font-semibold border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 rounded transition-colors shadow-2xs"
            title="Reveal current cell"
          >
            Hint
          </button>

          <button
            onClick={handleReset}
            className="p-1 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded border border-transparent"
            title="Reset Puzzle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Active Clue Ribbon */}
      <div className="bg-[#00204A] text-white p-2.5 rounded-sm shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="bg-[#FD8B18] text-[#00204A] font-cinzel font-black text-xs px-2 py-0.5 rounded-2xs uppercase">
            {activeClue ? `${activeClue.num} ${direction.toUpperCase()}` : 'Select a cell'}
          </span>
          <span className="font-headline font-semibold text-xs sm:text-sm text-amber-50">
            {activeClue ? activeClue.text : 'Click any square or clue to begin solving'}
          </span>
        </div>
        <span className="text-[10px] font-dateline text-stone-300 hidden md:inline">
          Tap spacebar to switch direction
        </span>
      </div>

      {/* Play Area: 5x5 Grid and Clues Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Crossword Grid (5 columns on desktop) */}
        <div className="md:col-span-6 flex flex-col items-center">
          <div className="inline-block border-2 border-[#00204A] bg-[#00204A] p-0.5 rounded-xs shadow-md">
            <div className="grid grid-cols-5 gap-[1.5px] bg-[#00204A]">
              {grid.map((row, r) =>
                row.map((val, c) => {
                  const isSelected = r === selectedRow && c === selectedCol;
                  const inActiveWord = isCellInActiveClue(r, c);
                  const isError = checkedErrors[r][c];
                  const cellNum = puzzle.cellNumbers[`${r},${c}`];

                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      onClick={() => handleCellClick(r, c)}
                      className={`relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-headline font-bold text-lg sm:text-xl transition-colors select-none ${
                        isSelected
                          ? 'bg-[#FD8B18] text-[#00204A] ring-2 ring-[#00204A]'
                          : inActiveWord
                          ? 'bg-amber-100 text-[#00204A]'
                          : 'bg-white text-stone-900 hover:bg-stone-100'
                      }`}
                    >
                      {/* Cell Clue Number in Top-Left */}
                      {cellNum && (
                        <span className="absolute top-0.5 left-1 text-[9px] font-dateline font-bold text-stone-600 leading-none pointer-events-none">
                          {cellNum}
                        </span>
                      )}

                      {/* Cell Value */}
                      <span className={`${isError ? 'text-[#E5000C] line-through' : ''}`}>
                        {val}
                      </span>

                      {/* Error Dot Indicator */}
                      {isError && (
                        <span className="absolute bottom-0.5 right-1 w-1.5 h-1.5 bg-[#E5000C] rounded-full" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-3 text-center text-xs font-dateline text-stone-500">
            Type on your keyboard to fill letters • Backspace to erase
          </div>
        </div>

        {/* Right: Across & Down Clues Lists (6 columns on desktop) */}
        <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-dateline">
          {/* Across Clues */}
          <div className="border border-stone-300 rounded-sm bg-stone-50/70 p-3">
            <h4 className="font-cinzel font-bold text-xs uppercase tracking-wider text-[#00204A] border-b border-stone-200 pb-1 mb-2 flex items-center justify-between">
              <span>Across</span>
              <span className="text-[10px] text-stone-500 font-dateline">5 Words</span>
            </h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {puzzle.clues.across.map((clue) => {
                const isCurrent = direction === 'across' && activeClue?.num === clue.num;
                return (
                  <button
                    key={`across-${clue.num}`}
                    onClick={() => handleClueClick(clue, 'across')}
                    className={`w-full text-left p-1.5 rounded transition-all flex items-start gap-1.5 ${
                      isCurrent
                        ? 'bg-[#00204A] text-white font-bold shadow-2xs'
                        : 'hover:bg-stone-200/60 text-stone-800'
                    }`}
                  >
                    <span className={`font-bold w-4 shrink-0 ${isCurrent ? 'text-[#FD8B18]' : 'text-[#E5000C]'}`}>
                      {clue.num}
                    </span>
                    <span className="leading-snug">{clue.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Down Clues */}
          <div className="border border-stone-300 rounded-sm bg-stone-50/70 p-3">
            <h4 className="font-cinzel font-bold text-xs uppercase tracking-wider text-[#00204A] border-b border-stone-200 pb-1 mb-2 flex items-center justify-between">
              <span>Down</span>
              <span className="text-[10px] text-stone-500 font-dateline">5 Words</span>
            </h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {puzzle.clues.down.map((clue) => {
                const isCurrent = direction === 'down' && activeClue?.num === clue.num;
                return (
                  <button
                    key={`down-${clue.num}`}
                    onClick={() => handleClueClick(clue, 'down')}
                    className={`w-full text-left p-1.5 rounded transition-all flex items-start gap-1.5 ${
                      isCurrent
                        ? 'bg-[#00204A] text-white font-bold shadow-2xs'
                        : 'hover:bg-stone-200/60 text-stone-800'
                    }`}
                  >
                    <span className={`font-bold w-4 shrink-0 ${isCurrent ? 'text-[#FD8B18]' : 'text-[#E5000C]'}`}>
                      {clue.num}
                    </span>
                    <span className="leading-snug">{clue.text}</span>
                  </button>
                );
              })}
            </div>
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
                Splendid! Daily Crossword Completed
              </h4>
              <p className="font-dateline text-xs text-emerald-800">
                You solved the Word Square in <strong>{formatTime(seconds)}</strong>! Your streak has been registered with the editorial desk.
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
