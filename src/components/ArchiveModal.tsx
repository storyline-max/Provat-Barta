import React, { useState, useMemo } from 'react';
import { 
  X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  BookOpen, Printer, Download, Share2, Check, Sparkles, 
  Search, FileText, Layers, Clock, Eye, AlertCircle, ArrowRight
} from 'lucide-react';
import { ArchiveEdition } from '../types';
import { CURATED_ARCHIVE_EDITIONS, getArchiveEditionForDate } from '../data/mockArchives';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadEditionToFrontPage: (edition: ArchiveEdition) => void;
  currentLoadedDate?: string;
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  onClose,
  onLoadEditionToFrontPage,
  currentLoadedDate = '2026-09-05',
}) => {
  // Calendar State
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 8 is September (0-indexed)
  const [selectedDateStr, setSelectedDateStr] = useState<string>(currentLoadedDate);
  const [activeTab, setActiveTab] = useState<'overview' | 'articles' | 'microfilm'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeMicrofilmPage, setActiveMicrofilmPage] = useState<number>(0);

  // Curated dates lookup set for fast highlighting
  const publishedDatesSet = useMemo(() => {
    return new Set(CURATED_ARCHIVE_EDITIONS.map((e) => e.date));
  }, []);

  // Selected edition object
  const selectedEdition = useMemo(() => {
    return getArchiveEditionForDate(selectedDateStr);
  }, [selectedDateStr]);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Month Name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

    const days: {
      day: number;
      dateStr: string;
      isCurrentMonth: boolean;
      hasPublishedEdition: boolean;
      isToday: boolean;
      isSelected: boolean;
    }[] = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevM = currentMonth === 0 ? 12 : currentMonth;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        day: dayNum,
        dateStr,
        isCurrentMonth: false,
        hasPublishedEdition: publishedDatesSet.has(dateStr),
        isToday: dateStr === '2026-09-05',
        isSelected: dateStr === selectedDateStr,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        day,
        dateStr,
        isCurrentMonth: true,
        hasPublishedEdition: publishedDatesSet.has(dateStr),
        isToday: dateStr === '2026-09-05',
        isSelected: dateStr === selectedDateStr,
      });
    }

    // Next month padding to fill standard 35 or 42 grid slots
    const remainingSlots = 42 - days.length >= 7 ? 42 - days.length : 35 - days.length;
    for (let day = 1; day <= remainingSlots; day++) {
      const nextM = currentMonth === 11 ? 1 : currentMonth + 2;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({
        day,
        dateStr,
        isCurrentMonth: false,
        hasPublishedEdition: publishedDatesSet.has(dateStr),
        isToday: dateStr === '2026-09-05',
        isSelected: dateStr === selectedDateStr,
      });
    }

    return days;
  }, [currentYear, currentMonth, publishedDatesSet, selectedDateStr]);

  // Filtered editions based on keyword search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return CURATED_ARCHIVE_EDITIONS.filter((ed) => 
      ed.leadHeadline.toLowerCase().includes(q) ||
      (ed.leadBengaliHeadline && ed.leadBengaliHeadline.toLowerCase().includes(q)) ||
      ed.leadSummary.toLowerCase().includes(q) ||
      ed.featuredStories.some(s => s.title.toLowerCase().includes(q) || s.snippet.toLowerCase().includes(q)) ||
      ed.date.includes(q) ||
      ed.volumeNumber.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Jump to specific milestone date
  const handleSelectDate = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    const [y, m] = dateStr.split('-').map(Number);
    if (y && m) {
      setCurrentYear(y);
      setCurrentMonth(m - 1);
    }
  };

  const handleCopyArchiveLink = () => {
    const url = `https://provatbarta.com/archive/${selectedDateStr}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-xs no-print animate-in fade-in duration-200">
      <div 
        className="bg-[#fbf9f4] border-2 border-[#00204A] rounded-sm shadow-2xl max-w-6xl w-full max-h-[92vh] flex flex-col text-stone-900 overflow-hidden font-editorial"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Archival Vault Header Banner */}
        <div className="bg-[#00204A] text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-[#FD8B18]">
          <div className="flex items-center gap-3">
            <div className="bg-[#FD8B18] p-1.5 rounded-sm text-[#00204A]">
              <CalendarIcon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-dateline uppercase font-bold tracking-widest text-[#FD8B18]">
                  Digital Microfilm Vault • 2024–2026
                </span>
                <span className="bg-[#E5000C] text-[9px] px-1.5 py-0.2 rounded uppercase font-bold">
                  Permanent Record
                </span>
              </div>
              <h2 className="font-headline font-bold text-lg sm:text-xl text-white tracking-wide">
                The Provat Barta Archival Newspaper Explorer
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Close Archive Explorer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Header: Search & Historical Quick Jump Shortcuts */}
        <div className="bg-[#f2eee3] border-b border-stone-300 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-dateline">
          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-stone-500 uppercase font-bold text-[10px] tracking-wider whitespace-nowrap mr-1">
              Historical Milestones:
            </span>
            <button
              onClick={() => handleSelectDate('2026-09-05')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap transition-colors border ${
                selectedDateStr === '2026-09-05'
                  ? 'bg-[#00204A] text-white border-[#00204A]'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
              }`}
            >
              Today's Paper (Sep 5, 2026)
            </button>
            <button
              onClick={() => handleSelectDate('2026-09-04')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap transition-colors border ${
                selectedDateStr === '2026-09-04'
                  ? 'bg-[#00204A] text-white border-[#00204A]'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
              }`}
            >
              Yesterday (Sep 4)
            </button>
            <button
              onClick={() => handleSelectDate('2026-09-01')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap transition-colors border ${
                selectedDateStr === '2026-09-01'
                  ? 'bg-[#00204A] text-white border-[#00204A]'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
              }`}
            >
              Summit Accord (Sep 1)
            </button>
            <button
              onClick={() => handleSelectDate('2026-08-31')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap transition-colors border ${
                selectedDateStr === '2026-08-31'
                  ? 'bg-[#00204A] text-white border-[#00204A]'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
              }`}
            >
              Dhaka Metro (Aug 31)
            </button>
            <button
              onClick={() => handleSelectDate('2026-08-15')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap transition-colors border ${
                selectedDateStr === '2026-08-15'
                  ? 'bg-[#00204A] text-white border-[#00204A]'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
              }`}
            >
              Monsoon Relief (Aug 15)
            </button>
            <button
              onClick={() => handleSelectDate('2026-07-04')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap transition-colors border ${
                selectedDateStr === '2026-07-04'
                  ? 'bg-[#00204A] text-white border-[#00204A]'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
              }`}
            >
              US 250th (Jul 4, 2026)
            </button>
            <button
              onClick={() => handleSelectDate('2024-07-04')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap transition-colors border ${
                selectedDateStr === '2024-07-04'
                  ? 'bg-[#E5000C] text-white border-[#E5000C]'
                  : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
              }`}
            >
              ⭐ Inaugural Issue (Vol. 1)
            </button>
          </div>

          {/* Keyword Search in Archive */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search historical archives..."
              className="w-full pl-8 pr-3 py-1 bg-white border border-stone-300 rounded text-[11px] text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#00204A]"
            />
          </div>
        </div>

        {/* Modal Main Body Grid: Left Calendar / Right Edition Reader */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-stone-300">
          
          {/* LEFT COLUMN: Calendar Interface & Archive Index (4.5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col space-y-4 bg-[#f9f7f1]">
            
            {/* Calendar Controls */}
            <div className="bg-white border border-stone-300 rounded-sm p-3.5 shadow-xs">
              <div className="flex items-center justify-between mb-3 border-b border-stone-200 pb-2.5">
                <div>
                  <h4 className="font-cinzel font-bold text-sm text-[#00204A] tracking-wider uppercase">
                    {monthNames[currentMonth]} {currentYear}
                  </h4>
                  <span className="text-[10px] font-dateline text-stone-500">
                    Select any date to inspect published broadsheet
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-stone-100 rounded text-stone-700 border border-stone-200"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-stone-100 rounded text-stone-700 border border-stone-200"
                    title="Next Month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day-of-Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-dateline text-[10px] font-bold uppercase text-stone-600 mb-1.5">
                <span className="text-red-700">Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((item, idx) => {
                  const isCurated = item.hasPublishedEdition;
                  const isCurrent = item.isSelected;
                  const isToday = item.isToday;

                  return (
                    <button
                      key={`${item.dateStr}-${idx}`}
                      onClick={() => handleSelectDate(item.dateStr)}
                      className={`h-9 sm:h-10 rounded text-xs font-dateline relative flex flex-col items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-[#00204A] text-white font-bold shadow-sm ring-2 ring-[#FD8B18]'
                          : isCurated
                          ? 'bg-amber-50 hover:bg-amber-100/90 text-stone-900 border border-amber-300 font-bold'
                          : item.isCurrentMonth
                          ? 'bg-stone-50/70 hover:bg-stone-100 text-stone-700'
                          : 'text-stone-300 hover:text-stone-500 hover:bg-stone-50'
                      }`}
                    >
                      <span className="leading-none">{item.day}</span>
                      
                      {/* Curated Edition Indicator Dot */}
                      {isCurated && (
                        <span 
                          className={`w-1.5 h-1.5 rounded-full mt-1 ${
                            isCurrent ? 'bg-[#FD8B18]' : 'bg-[#E5000C]'
                          }`}
                          title="Curated Broadsheet Edition Available"
                        />
                      )}

                      {/* Today Badge */}
                      {isToday && !isCurrent && (
                        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-emerald-600 rounded-full" title="Current Day" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-3 pt-2.5 border-t border-stone-200 flex items-center justify-between text-[10px] font-dateline text-stone-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E5000C]" />
                  <span>Curated Major Issue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00204A] ring-1 ring-[#FD8B18]" />
                  <span>Selected Date</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Today</span>
                </div>
              </div>
            </div>

            {/* If Search Query entered, display matching list */}
            {searchQuery.trim() ? (
              <div className="bg-white border border-stone-300 rounded-sm p-3 shadow-xs flex-1">
                <h5 className="font-cinzel font-bold text-xs text-[#00204A] uppercase mb-2">
                  Matching Historical Issues ({searchResults.length})
                </h5>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {searchResults.map((res) => (
                    <div
                      key={res.id}
                      onClick={() => handleSelectDate(res.date)}
                      className="p-2 border border-stone-200 hover:border-[#00204A] rounded cursor-pointer bg-[#fdfcf9] hover:bg-stone-100 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[10px] font-dateline text-stone-500 mb-0.5">
                        <span className="font-bold text-[#E5000C]">{res.date}</span>
                        <span>{res.volumeNumber}</span>
                      </div>
                      <p className="font-headline font-bold text-xs text-stone-900 leading-snug line-clamp-1">
                        {res.leadHeadline}
                      </p>
                    </div>
                  ))}
                  {searchResults.length === 0 && (
                    <p className="text-xs text-stone-500 italic text-center py-4">
                      No curated editions matched "{searchQuery}". You can select any date on the calendar to generate its broadsheet record.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* Archive Almanac & Volume Ledger */
              <div className="bg-stone-100/90 border border-stone-300 rounded-sm p-3 text-[11px] font-dateline space-y-1.5 text-stone-700">
                <div className="flex items-center justify-between font-bold text-[#00204A] border-b border-stone-200 pb-1">
                  <span>Archival Microfilm Repository</span>
                  <span className="text-[10px] bg-stone-200 px-1.5 py-0.2 rounded">Library of Congress Ref</span>
                </div>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  All daily broadsheets from July 4, 2024 to present are preserved in uncompressed high-resolution digital facsimiles, containing complete commercial advertisements, legal notices, and multi-bureau reporting.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 font-semibold text-stone-800">
                  <div className="bg-white p-1.5 rounded border border-stone-200">
                    <span className="text-[9px] uppercase text-stone-500 block">Total Issues</span>
                    <span className="text-xs text-[#00204A] font-bold">793 Daily Broadsheets</span>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-stone-200">
                    <span className="text-[9px] uppercase text-stone-500 block">Digitized Pages</span>
                    <span className="text-xs text-[#00204A] font-bold">25,376 Preserved Pages</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Archival Edition Details & Broadsheet Preview (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col justify-between space-y-4 bg-[#fbf9f4]">
            
            <div className="space-y-4">
              {/* Historical Edition Top Folio */}
              <div className="border-b-2 border-stone-900 pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-dateline text-stone-600 uppercase tracking-wider mb-1">
                  <span className="font-bold text-[#00204A]">
                    {selectedEdition.volumeNumber}
                  </span>
                  <span>•</span>
                  <span>{selectedEdition.editionName}</span>
                  <span>•</span>
                  <span className="font-bold text-[#E5000C]">{selectedEdition.pageCount} Pages (A1–D8)</span>
                </div>

                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h3 className="font-headline font-black text-xl sm:text-2xl text-[#00204A] tracking-tight leading-tight">
                      Edition of {selectedEdition.displayDate}
                    </h3>
                    {selectedEdition.bengaliDate && (
                      <p className="font-bengali text-xs text-stone-600 mt-0.5">
                        {selectedEdition.bengaliDate}
                      </p>
                    )}
                  </div>

                  <div className="text-[11px] font-dateline text-stone-600 bg-stone-100 px-2 py-1 rounded border border-stone-200">
                    {selectedEdition.weatherSnapshot}
                  </div>
                </div>

                {selectedEdition.specialNotice && (
                  <div className="mt-2 bg-amber-50 border-l-4 border-[#FD8B18] p-2 text-xs font-dateline text-amber-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FD8B18] flex-shrink-0" />
                    <span>{selectedEdition.specialNotice}</span>
                  </div>
                )}
              </div>

              {/* Tab Selector: Overview / Stories / Microfilm Facsimile */}
              <div className="flex items-center gap-2 border-b border-stone-300">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2 px-3 text-xs font-cinzel font-bold uppercase tracking-wider border-b-2 transition-colors ${
                    activeTab === 'overview'
                      ? 'border-[#00204A] text-[#00204A]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Front Page Lead
                </button>
                <button
                  onClick={() => setActiveTab('articles')}
                  className={`pb-2 px-3 text-xs font-cinzel font-bold uppercase tracking-wider border-b-2 transition-colors ${
                    activeTab === 'articles'
                      ? 'border-[#00204A] text-[#00204A]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Key Dispatches ({selectedEdition.featuredStories.length})
                </button>
                <button
                  onClick={() => setActiveTab('microfilm')}
                  className={`pb-2 px-3 text-xs font-cinzel font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === 'microfilm'
                      ? 'border-[#00204A] text-[#00204A]'
                      : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Microfilm Facsimile</span>
                </button>
              </div>

              {/* Tab 1: Front Page Lead Story */}
              {activeTab === 'overview' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-dateline uppercase font-bold tracking-widest text-[#E5000C] block">
                      Lead Broadsheet Headline
                    </span>
                    <h4 className="font-headline font-bold text-lg sm:text-xl text-[#00204A] leading-snug">
                      {selectedEdition.leadHeadline}
                    </h4>
                    {selectedEdition.leadBengaliHeadline && (
                      <h5 className="font-bengali text-sm text-stone-700 leading-normal">
                        {selectedEdition.leadBengaliHeadline}
                      </h5>
                    )}
                  </div>

                  {/* Photo & Caption */}
                  <div className="relative group overflow-hidden border border-stone-300 rounded-sm">
                    <img
                      src={selectedEdition.leadImageUrl}
                      alt={selectedEdition.leadHeadline}
                      className="w-full h-44 sm:h-52 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="p-2 bg-stone-100 border-t border-stone-200 text-[11px] font-editorial italic text-stone-600 flex justify-between items-center">
                      <span>{selectedEdition.leadImageCaption}</span>
                      <span className="text-[10px] font-dateline font-semibold text-stone-500 uppercase not-italic">
                        {selectedEdition.circulationEstimate}
                      </span>
                    </div>
                  </div>

                  <p className="font-editorial text-sm text-stone-800 leading-relaxed drop-cap">
                    {selectedEdition.leadSummary}
                  </p>
                </div>
              )}

              {/* Tab 2: Key Stories Published on that date */}
              {activeTab === 'articles' && (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {selectedEdition.featuredStories.map((story, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white border border-stone-300 rounded-sm shadow-2xs hover:border-[#00204A] transition-colors"
                    >
                      <div className="flex items-center justify-between text-[10px] font-dateline font-bold uppercase text-stone-500 mb-1">
                        <span className="bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded border border-stone-200">
                          {story.category}
                        </span>
                        <span>By {story.author}</span>
                      </div>
                      <h5 className="font-headline font-bold text-sm text-[#00204A] leading-snug">
                        {story.title}
                      </h5>
                      {story.bengaliTitle && (
                        <p className="font-bengali text-xs text-stone-600 mt-0.5">
                          {story.bengaliTitle}
                        </p>
                      )}
                      <p className="font-editorial text-xs text-stone-700 mt-1 line-clamp-2">
                        {story.snippet}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Microfilm Page Facsimile */}
              {activeTab === 'microfilm' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {(selectedEdition.microfilmPages || [
                      { pageNumber: 'A1', section: 'Front Page', title: 'Main Cover Dispatches', summary: 'Lead wire' },
                      { pageNumber: 'A2', section: 'National Desk', title: 'Capitol Reports', summary: 'Federal' },
                      { pageNumber: 'B1', section: 'Business', title: 'Financial Tables', summary: 'Wall Street' },
                    ]).map((pg, idx) => (
                      <button
                        key={pg.pageNumber}
                        onClick={() => setActiveMicrofilmPage(idx)}
                        className={`px-3 py-1 text-xs font-dateline font-bold rounded border whitespace-nowrap ${
                          activeMicrofilmPage === idx
                            ? 'bg-[#00204A] text-white border-[#00204A]'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        Page {pg.pageNumber}: {pg.section}
                      </button>
                    ))}
                  </div>

                  {/* Microfilm Viewer Canvas / Mock Paper Plate */}
                  <div className="bg-stone-200 border-2 border-stone-400 p-4 rounded-sm shadow-inner min-h-[200px] flex flex-col justify-between">
                    <div className="border border-stone-400 bg-[#f4f1ea] p-4 shadow-sm text-center">
                      <div className="border-b border-stone-400 pb-2 mb-2">
                        <span className="font-cinzel text-xs font-bold uppercase tracking-widest text-[#00204A]">
                          THE PROVAT BARTA • MICROFILM ARCHIVES
                        </span>
                        <div className="text-[10px] text-stone-500 font-dateline">
                          {selectedEdition.volumeNumber} • {selectedEdition.displayDate} • Page {selectedEdition.microfilmPages?.[activeMicrofilmPage]?.pageNumber || 'A1'}
                        </div>
                      </div>
                      <h5 className="font-headline font-bold text-base text-[#00204A] my-2">
                        {selectedEdition.microfilmPages?.[activeMicrofilmPage]?.title || selectedEdition.leadHeadline}
                      </h5>
                      <p className="font-editorial text-xs text-stone-700 max-w-lg mx-auto italic">
                        "{selectedEdition.microfilmPages?.[activeMicrofilmPage]?.summary || selectedEdition.leadSummary}"
                      </p>
                      <div className="mt-3 text-[10px] text-stone-500 uppercase tracking-widest border-t border-stone-300 pt-2 flex items-center justify-center gap-3">
                        <span>Digital Archival Resolution: 600 DPI</span>
                        <span>•</span>
                        <span>Preservation Standard ISO 11799</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Drawer */}
            <div className="border-t border-stone-300 pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyArchiveLink}
                  className="px-3 py-1.5 border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-dateline font-semibold rounded flex items-center gap-1.5 transition-colors"
                  title="Copy permanent archive URL"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-stone-500" />}
                  <span>{copiedLink ? 'Link Copied' : 'Share Issue'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-dateline font-semibold rounded flex items-center gap-1.5 transition-colors"
                  title="Print this edition"
                >
                  <Printer className="w-3.5 h-3.5 text-stone-500" />
                  <span>Print Broadsheet</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onLoadEditionToFrontPage(selectedEdition);
                    onClose();
                  }}
                  className="bg-[#00204A] hover:bg-[#00306e] text-white px-4 py-2 rounded font-cinzel font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 group"
                >
                  <BookOpen className="w-4 h-4 text-[#FD8B18]" />
                  <span>Load Into Broadsheet</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
