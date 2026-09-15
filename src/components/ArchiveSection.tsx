import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, BookOpen, 
  Search, Layers, Sparkles, Clock, ArrowRight, Printer, Share2, Check
} from 'lucide-react';
import { ArchiveEdition } from '../types';
import { CURATED_ARCHIVE_EDITIONS, getArchiveEditionForDate } from '../data/mockArchives';

interface ArchiveSectionProps {
  onSelectEdition: (edition: ArchiveEdition) => void;
  onOpenArchiveModal: () => void;
  currentLoadedDate?: string;
}

export const ArchiveSection: React.FC<ArchiveSectionProps> = ({
  onSelectEdition,
  onOpenArchiveModal,
  currentLoadedDate = '2026-09-05',
}) => {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(8); // September (0-indexed)
  const [activeDateStr, setActiveDateStr] = useState<string>(currentLoadedDate);
  const [filterTopic, setFilterTopic] = useState<'all' | 'diplomacy' | 'climate' | 'heritage' | 'tech'>('all');
  const [searchWord, setSearchWord] = useState('');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const publishedSet = useMemo(() => new Set(CURATED_ARCHIVE_EDITIONS.map(e => e.date)), []);

  const activeEdition = useMemo(() => getArchiveEditionForDate(activeDateStr), [activeDateStr]);

  // Calendar days
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const prevDays = new Date(selectedYear, selectedMonth, 0).getDate();

    const result = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevDays - i;
      const m = selectedMonth === 0 ? 12 : selectedMonth;
      const y = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
      const dStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({ day: d, dateStr: dStr, isCurrentMonth: false, isPublished: publishedSet.has(dStr) });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({ day: d, dateStr: dStr, isCurrentMonth: true, isPublished: publishedSet.has(dStr) });
    }
    const rem = 35 - result.length >= 0 ? 35 - result.length : 42 - result.length;
    for (let d = 1; d <= rem; d++) {
      const m = selectedMonth === 11 ? 1 : selectedMonth + 2;
      const y = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
      const dStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      result.push({ day: d, dateStr: dStr, isCurrentMonth: false, isPublished: publishedSet.has(dStr) });
    }
    return result;
  }, [selectedYear, selectedMonth, publishedSet]);

  return (
    <section className="my-8 bg-[#fbf9f4] border-2 border-[#00204A] p-4 sm:p-6 rounded-sm shadow-md">
      {/* Archive Header */}
      <div className="border-b-2 border-stone-900 pb-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#E5000C] text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                Digital Microfilm Archive
              </span>
              <span className="text-stone-500 font-dateline text-xs">
                Permanent Record • 2024 to Present
              </span>
            </div>
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-[#00204A] mt-1">
              Browse Past Broadsheet Editions
            </h2>
          </div>

          <button
            onClick={onOpenArchiveModal}
            className="bg-[#00204A] hover:bg-[#00306e] text-white px-4 py-2 rounded text-xs font-cinzel font-bold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1.5"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-[#FD8B18]" />
            <span>Open Interactive Calendar Vault</span>
          </button>
        </div>
      </div>

      {/* Grid: 5 cols Calendar & Jump / 7 cols Edition Highlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Quick Calendar */}
        <div className="lg:col-span-5 bg-stone-50 border border-stone-300 p-4 rounded-sm space-y-3">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <h3 className="font-cinzel font-bold text-sm text-[#00204A] uppercase">
              {monthNames[selectedMonth]} {selectedYear}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setSelectedYear(y => y - 1);
                  } else {
                    setSelectedMonth(m => m - 1);
                  }
                }}
                className="p-1 hover:bg-stone-200 rounded border border-stone-300 text-stone-700"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setSelectedYear(y => y + 1);
                  } else {
                    setSelectedMonth(m => m + 1);
                  }
                }}
                className="p-1 hover:bg-stone-200 rounded border border-stone-300 text-stone-700"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center font-dateline text-[10px] font-bold text-stone-500 uppercase mb-1">
            <span className="text-red-700">S</span>
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item, i) => {
              const isSelected = item.dateStr === activeDateStr;
              return (
                <button
                  key={i}
                  onClick={() => setActiveDateStr(item.dateStr)}
                  className={`h-8 rounded text-[11px] font-dateline flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#00204A] text-white font-bold ring-1 ring-[#FD8B18]'
                      : item.isPublished
                      ? 'bg-amber-50 hover:bg-amber-100 text-stone-900 border border-amber-300 font-bold'
                      : item.isCurrentMonth
                      ? 'bg-white hover:bg-stone-100 text-stone-700'
                      : 'text-stone-300'
                  }`}
                >
                  <span>{item.day}</span>
                  {item.isPublished && (
                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-[#FD8B18]' : 'bg-[#E5000C]'}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Year selector */}
          <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs font-dateline">
            <span className="text-stone-500">Jump Year:</span>
            <div className="flex gap-1.5">
              {[2026, 2025, 2024].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedYear === yr
                      ? 'bg-[#00204A] text-white'
                      : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Selected Edition Preview Card */}
        <div className="lg:col-span-7 bg-white border border-stone-300 p-5 rounded-sm shadow-xs space-y-4">
          <div className="border-b border-stone-200 pb-3">
            <div className="flex items-center justify-between text-[11px] font-dateline text-stone-500 mb-1">
              <span className="font-bold text-[#00204A] uppercase">{activeEdition.volumeNumber}</span>
              <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200">{activeEdition.editionName}</span>
            </div>
            <h3 className="font-headline font-bold text-xl text-[#00204A]">
              {activeEdition.displayDate}
            </h3>
            {activeEdition.bengaliDate && (
              <p className="font-bengali text-xs text-stone-600 mt-0.5">
                {activeEdition.bengaliDate}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-4">
              <img
                src={activeEdition.leadImageUrl}
                alt={activeEdition.leadHeadline}
                className="w-full h-32 object-cover border border-stone-300 rounded-sm"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="sm:col-span-8 space-y-1.5">
              <span className="text-[10px] font-dateline font-bold uppercase text-[#E5000C] tracking-wider">
                Front Page Lead
              </span>
              <h4 className="font-headline font-bold text-base text-stone-900 leading-snug">
                {activeEdition.leadHeadline}
              </h4>
              <p className="font-editorial text-xs text-stone-600 line-clamp-2">
                {activeEdition.leadSummary}
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-dateline text-stone-500">
              {activeEdition.pageCount} Pages • {activeEdition.circulationEstimate}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenArchiveModal}
                className="px-3 py-1.5 border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-dateline font-semibold rounded flex items-center gap-1"
              >
                <Layers className="w-3 h-3 text-stone-500" />
                <span>View Full Facsimile</span>
              </button>

              <button
                onClick={() => onSelectEdition(activeEdition)}
                className="bg-[#00204A] hover:bg-[#00306e] text-white px-3 py-1.5 rounded font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#FD8B18]" />
                <span>Load Into Paper</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Curated Historical Editions Row */}
      <div className="mt-8 pt-6 border-t border-stone-300">
        <h3 className="font-cinzel font-bold text-sm text-[#00204A] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FD8B18]" />
          <span>Major Historical Milestone Editions</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {CURATED_ARCHIVE_EDITIONS.slice(0, 4).map((ed) => (
            <div
              key={ed.id}
              onClick={() => {
                setActiveDateStr(ed.date);
                onSelectEdition(ed);
              }}
              className="p-3 bg-white border border-stone-300 hover:border-[#00204A] rounded-sm cursor-pointer transition-all hover:shadow-sm flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-dateline text-stone-500 mb-1">
                  <span className="font-bold text-[#E5000C]">{ed.date}</span>
                  <span>{ed.pageCount}p</span>
                </div>
                <h4 className="font-headline font-bold text-xs text-stone-900 group-hover:text-[#00204A] line-clamp-2 leading-snug">
                  {ed.leadHeadline}
                </h4>
              </div>
              <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] font-dateline font-semibold text-[#00204A]">
                <span>{ed.volumeNumber}</span>
                <span className="text-[#E5000C] group-hover:underline flex items-center gap-0.5">
                  Read <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
