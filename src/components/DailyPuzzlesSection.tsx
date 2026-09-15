import React from 'react';
import { DAILY_CROSSWORD, DAILY_SUDOKU } from '../data/mockPuzzles';
import { Grid, Sparkles, Trophy, Play, Clock, Flame, ArrowRight, PenTool } from 'lucide-react';

interface DailyPuzzlesSectionProps {
  onOpenCrossword: () => void;
  onOpenSudoku: () => void;
}

export const DailyPuzzlesSection: React.FC<DailyPuzzlesSectionProps> = ({
  onOpenCrossword,
  onOpenSudoku,
}) => {
  return (
    <section className="border-t-2 border-b-2 border-[#00204A] bg-[#fbf9f4] my-8 py-6 px-4 sm:px-6 shadow-2xs">
      {/* Section Header Masthead */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="h-px bg-stone-300 flex-1" />
          <span className="text-[10px] font-cinzel font-bold tracking-[0.2em] text-[#E5000C] uppercase">
            The Provat Barta Morning Pastimes
          </span>
          <div className="h-px bg-stone-300 flex-1" />
        </div>
        
        <h3 className="font-cinzel font-black text-xl sm:text-2xl text-[#00204A] tracking-wider uppercase">
          Daily Crossword &amp; Sudoku
        </h3>
        
        <p className="font-dateline text-xs text-stone-600 italic mt-1">
          Test your acumen with today’s editorial word square and classic 9×9 Nikoli numbers grid.
        </p>
      </div>

      {/* Side-by-Side Puzzle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-6">
        {/* Crossword Card */}
        <div className="border border-stone-300 bg-white p-5 rounded-xs shadow-2xs hover:shadow-sm transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="bg-[#00204A] text-white text-[9px] font-cinzel font-bold px-2 py-0.5 rounded-2xs uppercase tracking-wider">
                    Puzzle No. 482
                  </span>
                  <span className="text-[11px] font-dateline text-stone-500 font-semibold">
                    Gentle • 5×5 Word Square
                  </span>
                </div>
                <h4 className="font-headline font-bold text-base text-[#00204A] mt-1">
                  The Daily Mini Crossword
                </h4>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-100 text-[#00204A] flex items-center justify-center">
                <PenTool className="w-4 h-4 text-[#00204A]" />
              </div>
            </div>

            {/* Mini Grid Teaser Preview */}
            <div className="flex items-center gap-4 my-3">
              <div className="w-24 h-24 border border-stone-400 grid grid-cols-5 gap-[1px] bg-stone-300 p-0.5 shrink-0 shadow-inner">
                {Array(25)
                  .fill(0)
                  .map((_, i) => {
                    const row = Math.floor(i / 5);
                    const col = i % 5;
                    const sampleLetter = row === 0 ? ['H', 'E', 'A', 'R', 'T'][col] : '';
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-center font-headline font-bold text-[10px] ${
                          row === 0
                            ? 'bg-amber-100 text-[#00204A]'
                            : 'bg-white text-stone-400'
                        }`}
                      >
                        {sampleLetter || (i % 7 === 0 ? '•' : '')}
                      </div>
                    );
                  })}
              </div>

              {/* Sample Clues preview */}
              <div className="text-xs font-dateline text-stone-700 space-y-1.5 flex-1">
                <div className="font-bold text-[#00204A] uppercase text-[10px]">Today's Clue Teasers:</div>
                <div className="line-clamp-1">
                  <strong className="text-[#E5000C]">1-Across:</strong> Core of the matter; vital organ (5)
                </div>
                <div className="line-clamp-1">
                  <strong className="text-[#E5000C]">6-Across:</strong> Glowing coal lingering in hearth (5)
                </div>
                <div className="line-clamp-1">
                  <strong className="text-[#E5000C]">1-Down:</strong> Center of compassion or pulse (5)
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-dateline text-stone-500">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>Avg time: <strong>2m 45s</strong></span>
            </div>

            <button
              onClick={onOpenCrossword}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00204A] hover:bg-[#003166] text-white font-cinzel font-bold text-xs uppercase tracking-wider rounded-xs shadow-2xs transition-colors"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Play Crossword</span>
            </button>
          </div>
        </div>

        {/* Sudoku Card */}
        <div className="border border-stone-300 bg-white p-5 rounded-xs shadow-2xs hover:shadow-sm transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="bg-[#00204A] text-white text-[9px] font-cinzel font-bold px-2 py-0.5 rounded-2xs uppercase tracking-wider">
                    Puzzle No. 719
                  </span>
                  <span className="text-[11px] font-dateline text-stone-500 font-semibold">
                    Medium • 9×9 Nikoli Grid
                  </span>
                </div>
                <h4 className="font-headline font-bold text-base text-[#00204A] mt-1">
                  The Daily 9×9 Sudoku
                </h4>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-100 text-[#00204A] flex items-center justify-center">
                <Grid className="w-4 h-4 text-[#00204A]" />
              </div>
            </div>

            {/* Mini Grid Teaser Preview */}
            <div className="flex items-center gap-4 my-3">
              <div className="w-24 h-24 border border-stone-900 grid grid-cols-3 gap-[1px] bg-stone-900 p-[1px] shrink-0 shadow-inner">
                {/* 3x3 blocks */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((b) => (
                  <div key={b} className="bg-white grid grid-cols-3 gap-0 p-[0.5px]">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => (
                      <div
                        key={c}
                        className="flex items-center justify-center text-[7px] font-headline font-bold text-stone-800"
                      >
                        {(b + c) % 3 === 0 ? (b * 2 + c) % 9 + 1 : ''}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Rules & Teaser preview */}
              <div className="text-xs font-dateline text-stone-700 space-y-1.5 flex-1">
                <div className="font-bold text-[#00204A] uppercase text-[10px]">Pure Editorial Logic:</div>
                <p className="line-clamp-2 leading-relaxed">
                  Fill every row, column, and 3×3 square box with numbers 1 through 9. No math required.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-amber-800 font-semibold">
                  <Flame className="w-3 h-3 text-[#FD8B18]" />
                  <span>Reader engagement streak bonus: +150 BDT</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-dateline text-stone-500">
              <Trophy className="w-3.5 h-3.5 text-[#FD8B18]" />
              <span>3,480 solvers today</span>
            </div>

            <button
              onClick={onOpenSudoku}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00204A] hover:bg-[#003166] text-white font-cinzel font-bold text-xs uppercase tracking-wider rounded-xs shadow-2xs transition-colors"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Play Sudoku</span>
            </button>
          </div>
        </div>
      </div>

      {/* Community Engagement & Interactive Lounge CTA Banner */}
      <div className="max-w-5xl mx-auto bg-stone-200/80 border border-stone-300 p-3 rounded-xs flex flex-wrap items-center justify-between gap-3 text-xs font-dateline">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#FD8B18] text-[#00204A] flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#00204A]">Interactive Puzzle Lounge:</span>
            <span className="text-stone-600 ml-1.5">
              Live timers, error checking, pencil notes mode, and printable edition broadsheets.
            </span>
          </div>
        </div>

        <button
          onClick={onOpenCrossword}
          className="inline-flex items-center gap-1 text-xs font-cinzel font-bold uppercase text-[#00204A] hover:text-[#E5000C] transition-colors"
        >
          <span>Open Full Puzzle Lounge</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
