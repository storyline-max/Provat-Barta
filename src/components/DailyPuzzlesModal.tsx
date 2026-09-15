import React, { useState } from 'react';
import { X, Printer, Trophy, Grid, Sparkles, BookOpen, Share2, Check } from 'lucide-react';
import { DAILY_CROSSWORD, DAILY_SUDOKU } from '../data/mockPuzzles';
import { InteractiveCrossword } from './InteractiveCrossword';
import { InteractiveSudoku } from './InteractiveSudoku';

interface DailyPuzzlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'crossword' | 'sudoku';
}

export const DailyPuzzlesModal: React.FC<DailyPuzzlesModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'crossword',
}) => {
  const [activeTab, setActiveTab] = useState<'crossword' | 'sudoku'>(initialTab);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync initial tab when changed
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-[#fbf9f4] border-2 border-[#00204A] w-full max-w-4xl rounded-sm shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="bg-[#00204A] text-white p-3 sm:p-4 border-b-2 border-[#FD8B18] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FD8B18] text-[#00204A] flex items-center justify-center font-cinzel font-bold text-sm">
              <Grid className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-cinzel font-bold text-sm sm:text-base tracking-wider uppercase">
                  Daily Broadsheet Diversions & Puzzles
                </h3>
                <span className="bg-[#E5000C] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest hidden sm:inline">
                  Interactive
                </span>
              </div>
              <p className="text-[11px] font-dateline text-stone-300">
                Saturday, September 5, 2026 • Morning Editorial Pastimes
              </p>
            </div>
          </div>

          {/* Quick Actions & Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded border border-white/20 transition-colors"
              title="Print Puzzles Page"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded border border-white/20 transition-colors"
              title="Share Puzzle Challenge"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 bg-white/10 hover:bg-[#E5000C] text-white rounded transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="bg-stone-200 border-b border-stone-300 px-4 pt-2 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('crossword')}
              className={`px-4 py-2 text-xs font-cinzel font-bold uppercase tracking-wider rounded-t-sm border-t border-l border-r transition-all ${
                activeTab === 'crossword'
                  ? 'bg-[#fbf9f4] text-[#00204A] border-stone-300 border-b-[#fbf9f4] -mb-px'
                  : 'bg-stone-300 text-stone-600 border-transparent hover:text-[#00204A]'
              }`}
            >
              Daily Mini Crossword (No. 482)
            </button>

            <button
              onClick={() => setActiveTab('sudoku')}
              className={`px-4 py-2 text-xs font-cinzel font-bold uppercase tracking-wider rounded-t-sm border-t border-l border-r transition-all ${
                activeTab === 'sudoku'
                  ? 'bg-[#fbf9f4] text-[#00204A] border-stone-300 border-b-[#fbf9f4] -mb-px'
                  : 'bg-stone-300 text-stone-600 border-transparent hover:text-[#00204A]'
              }`}
            >
              Daily 9×9 Sudoku (No. 719)
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-dateline text-stone-600 pb-1">
            <Trophy className="w-3.5 h-3.5 text-[#FD8B18]" />
            <span>3,480 readers solved today</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'crossword' ? (
            <InteractiveCrossword puzzle={DAILY_CROSSWORD} />
          ) : (
            <InteractiveSudoku puzzle={DAILY_SUDOKU} />
          )}
        </div>

        {/* Modal Colophon Footer */}
        <div className="bg-[#f4f1ea] border-t border-stone-300 px-4 py-2.5 flex flex-wrap items-center justify-between text-[11px] font-dateline text-stone-600">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#00204A]">The Provat Barta Puzzles Desk</span>
            <span>•</span>
            <span>Syndicated with Nikoli & International Broadsheet League</span>
          </div>

          <div className="text-stone-500">
            Next puzzles publish daily at 6:00 AM Eastern Time
          </div>
        </div>
      </div>
    </div>
  );
};
