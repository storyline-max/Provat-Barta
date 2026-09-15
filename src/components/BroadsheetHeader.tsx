import React from 'react';
import { ProvatBartaLogo } from './ProvatBartaLogo';
import { Category, WeatherReport, MarketIndex } from '../types';
import {
  Sun,
  TrendingUp,
  DollarSign,
  Printer,
  Bookmark,
  Search,
  Share2,
  Award,
  Clock,
  Calendar,
  Grid,
  Radio,
  Mic,
  User as UserIcon,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface BroadsheetHeaderProps {
  currentCategory: Category;
  onSelectCategory: (cat: Category) => void;
  selectedEdition: string;
  onSelectEdition: (edition: string) => void;
  languageMode: 'dual' | 'en' | 'bn';
  onToggleLanguage: () => void;
  onOpenPartnerDashboard: () => void;
  onOpenArchive: () => void;
  onOpenPuzzles?: () => void;
  onPrintPaper: () => void;
  weatherList: WeatherReport[];
  marketList: MarketIndex[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  affiliateEarnings: number;
  loadedArchiveDate?: string;
  loadedArchiveVolume?: string;
  savedArticlesCount?: number;
  onOpenSavedArticles?: () => void;
  onOpenLiveVoice?: () => void;
  onOpenTranscribe?: () => void;
  onOpenUserAccount?: () => void;
  currentUser?: User | null;
}

export const BroadsheetHeader: React.FC<BroadsheetHeaderProps> = ({
  currentCategory,
  onSelectCategory,
  selectedEdition,
  onSelectEdition,
  languageMode,
  onToggleLanguage,
  onOpenPartnerDashboard,
  onOpenArchive,
  onOpenPuzzles,
  onPrintPaper,
  weatherList,
  marketList,
  searchQuery,
  onSearchChange,
  affiliateEarnings,
  loadedArchiveDate,
  loadedArchiveVolume,
  savedArticlesCount = 0,
  onOpenSavedArticles,
  onOpenLiveVoice,
  onOpenTranscribe,
  onOpenUserAccount,
  currentUser,
}) => {
  const categories: { id: Category; labelEn: string; labelBn: string }[] = [
    { id: 'front-page', labelEn: 'Front Page', labelBn: 'প্রথম পাতা' },
    { id: 'national', labelEn: 'US National', labelBn: 'যুক্তরাষ্ট্র' },
    { id: 'world', labelEn: 'World & South Asia', labelBn: 'আন্তর্জাতিক' },
    { id: 'business', labelEn: 'Business & Markets', labelBn: 'অর্থ ও বাণিজ্য' },
    { id: 'opinion', labelEn: 'Editorial & Op-Ed', labelBn: 'মতামত ও সম্পাদকীয়' },
    { id: 'tech', labelEn: 'Science & Tech', labelBn: 'প্রযুক্তি' },
    { id: 'arts', labelEn: 'Arts & Heritage', labelBn: 'শিল্প ও সংস্কৃতি' },
    { id: 'sports', labelEn: 'Sports', labelBn: 'খেলাধুলা' },
    { id: 'puzzles', labelEn: 'Crossword & Sudoku', labelBn: 'ধাঁধা ও সুডোকু' },
    { id: 'archive', labelEn: 'Archive & Microfilm', labelBn: 'আর্কাইভ' },
    { id: 'partner-program', labelEn: 'Provat Partner (PPP)', labelBn: 'পার্টনার প্রোগ্রাম' },
  ];

  const editions = ['US National', 'New York Metro', 'Washington DC', 'Dhaka / Global Diaspora'];

  return (
    <header className="border-b border-stone-300 bg-[#fbf9f4] no-print">
      {/* Top Ear / Auxiliary Bar */}
      <div className="border-b border-stone-300 px-4 py-1.5 text-[11px] font-dateline text-stone-700">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Volume & Date */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#00204A] tracking-wider uppercase">
              {loadedArchiveVolume || 'Vol. CXLII No. 48,219'}
            </span>
            <span className="text-stone-300">|</span>
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-stone-500" />
              {loadedArchiveDate || 'Saturday, September 5, 2026'}
            </span>
            <span className="text-stone-300 hidden sm:inline">|</span>
            <span className="hidden sm:inline font-medium text-stone-600">
              {loadedArchiveDate ? 'Archival Facsimile Record' : 'Late Morning City Edition • $2.50 USD / ৳15.00 BDT'}
            </span>
          </div>

          {/* Center: Live Tickers & Mini Weather */}
          <div className="hidden lg:flex items-center gap-4 text-stone-600">
            <div className="flex items-center gap-1.5 bg-stone-100/80 px-2 py-0.5 rounded border border-stone-200">
              <Sun className="w-3 h-3 text-[#FD8B18]" />
              <span>NYC {weatherList[0]?.temp || '68°F'}</span>
              <span className="text-stone-400">•</span>
              <span>Dhaka {weatherList[2]?.temp || '31°C'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-100/80 px-2 py-0.5 rounded border border-stone-200">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>Dow {marketList[0]?.value}</span>
              <span className="text-emerald-700 font-semibold">{marketList[0]?.change}</span>
            </div>
          </div>

          {/* Right: Actions & Partner Quick Access */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Voice Intelligence (gemini-3.1-flash-live-preview) */}
            {onOpenLiveVoice && (
              <button
                onClick={onOpenLiveVoice}
                className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#E5000C] hover:bg-red-700 text-white rounded font-bold text-[11px] transition-colors shadow-2xs animate-pulse"
                title="Open Live Voice Conversation (gemini-3.1-flash-live-preview)"
              >
                <Radio className="w-3 h-3" />
                <span>Live Voice</span>
              </button>
            )}

            {/* Audio Transcribe (gemini-3.5-transcribe) */}
            {onOpenTranscribe && (
              <button
                onClick={onOpenTranscribe}
                className="flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-stone-100 text-[#00204A] border border-stone-300 rounded font-semibold text-[11px] transition-colors shadow-2xs"
                title="Record & Transcribe Audio (gemini-3.5-transcribe)"
              >
                <Mic className="w-3 h-3 text-[#FD8B18]" />
                <span>Transcribe</span>
              </button>
            )}

            {/* User Account / Firebase Google Sign In */}
            {onOpenUserAccount && (
              <button
                onClick={onOpenUserAccount}
                className="flex items-center gap-1.5 px-2.5 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded font-semibold text-[11px] transition-colors shadow-2xs text-[#00204A]"
                title={currentUser ? `Signed in as ${currentUser.displayName || currentUser.email}` : 'Sign in with Google'}
              >
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Profile"
                    className="w-3.5 h-3.5 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserIcon className="w-3 h-3 text-[#00204A]" />
                )}
                <span>{currentUser ? currentUser.displayName?.split(' ')[0] || 'Account' : 'Sign In'}</span>
                {savedArticlesCount > 0 && (
                  <span className="bg-[#00204A] text-white text-[9px] px-1 py-0.2 rounded-full font-bold">
                    {savedArticlesCount}
                  </span>
                )}
              </button>
            )}

            {/* Read Later / Saved Quick Button */}
            {onOpenSavedArticles && (
              <button
                onClick={onOpenSavedArticles}
                className="flex items-center gap-1.5 px-2 py-0.5 bg-stone-100 hover:bg-stone-200/80 text-[#00204A] border border-stone-300 rounded font-semibold text-[11px] transition-colors shadow-2xs"
                title="View Read Later Bookmarks in PPP Dashboard"
              >
                <Bookmark className="w-3 h-3 text-[#E5000C] fill-[#E5000C]/20" />
                <span>Saved</span>
                <span className="bg-[#00204A] text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                  {savedArticlesCount}
                </span>
              </button>
            )}

            {/* Daily Puzzles Quick Button */}
            {onOpenPuzzles && (
              <button
                onClick={onOpenPuzzles}
                className="flex items-center gap-1 px-2 py-0.5 bg-stone-100 hover:bg-stone-200/80 text-[#00204A] border border-stone-300 rounded font-semibold text-[11px] transition-colors shadow-2xs"
                title="Play Daily Crossword & Sudoku"
              >
                <Grid className="w-3 h-3 text-[#FD8B18]" />
                <span>Daily Puzzles</span>
              </button>
            )}

            {/* Archive & Calendar Button */}
            <button
              onClick={onOpenArchive}
              className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 hover:bg-amber-100/90 text-[#00204A] border border-amber-300 rounded font-semibold text-[11px] transition-colors shadow-2xs"
              title="Browse Past Editions by Date"
            >
              <Calendar className="w-3 h-3 text-[#E5000C]" />
              <span>Archive by Date</span>
            </button>

            {/* Edition Switcher */}
            <select
              value={selectedEdition}
              onChange={(e) => onSelectEdition(e.target.value)}
              className="bg-stone-100 border border-stone-300 text-stone-800 rounded px-2 py-0.5 text-[11px] font-dateline cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#00204A]"
            >
              {editions.map((ed) => (
                <option key={ed} value={ed}>
                  {ed}
                </option>
              ))}
            </select>

            {/* Language Mode Toggle */}
            <button
              onClick={onToggleLanguage}
              className="px-2 py-0.5 border border-stone-300 rounded hover:bg-stone-200/70 transition-colors font-medium text-[11px] text-[#00204A]"
              title="Toggle Bengali / English Headlines"
            >
              {languageMode === 'dual' ? 'Dual (EN+বাংলা)' : languageMode === 'en' ? 'English Only' : 'বাংলা সংস্করণ'}
            </button>

            {/* Provat Partner Program Badge */}
            <button
              onClick={onOpenPartnerDashboard}
              className="flex items-center gap-1.5 bg-[#00204A] hover:bg-[#00306e] text-white px-2.5 py-0.5 rounded transition-all shadow-xs text-[11px] font-semibold"
            >
              <Award className="w-3 h-3 text-[#FD8B18]" />
              <span>PPP Portal</span>
              <span className="bg-[#E5000C] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                ৳{affiliateEarnings.toFixed(0)}
              </span>
            </button>

            {/* Print Broadsheet Button */}
            <button
              onClick={onPrintPaper}
              className="p-1 text-stone-600 hover:text-stone-950 transition-colors border border-stone-300 rounded bg-white hover:bg-stone-100"
              title="Print Today's Broadsheet Edition"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grand Broadsheet Masthead */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4">
          {/* Left Broadsheet Ear: Quote of the Day & Motto */}
          <div className="hidden lg:flex lg:col-span-3 flex-col justify-center border-r border-stone-200 pr-6 space-y-2 text-left">
            <div className="border-l-2 border-[#00204A] pl-3 py-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#00204A] block">
                Editor's Creed
              </span>
              <p className="text-[12px] font-editorial italic text-stone-700 leading-snug mt-0.5">
                "Without fear or favor, holding a mirror to truth and serving the global diaspora."
              </p>
            </div>
            <div className="text-[11px] text-stone-500 font-dateline flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Wire: Bureau feeds active in NYC, DC, London & Dhaka
            </div>
          </div>

          {/* Center: The Official Brand Logo Artwork (Matching uploaded Prove.jpeg) */}
          <div className="lg:col-span-6 flex justify-center py-1">
            <ProvatBartaLogo variant="full" />
          </div>

          {/* Right Broadsheet Ear: Provat Partner Program Spotlight */}
          <div className="hidden lg:flex lg:col-span-3 flex-col justify-center border-l border-stone-200 pl-6 space-y-2 text-left">
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-sm p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00204A]">
                  Provat Partner Program
                </span>
                <span className="text-[9px] bg-[#E5000C] text-white px-1.5 py-0.2 rounded font-bold uppercase">
                  50/50 Split
                </span>
              </div>
              <p className="text-[11px] text-stone-700 leading-tight mt-1 font-dateline">
                Share authentic news, empower your community, and earn revenue daily via bKash, Nagad or direct bank transfer.
              </p>
              <button
                onClick={onOpenPartnerDashboard}
                className="mt-2 text-[10px] font-bold text-[#00204A] hover:text-[#E5000C] underline decoration-1 underline-offset-2 flex items-center gap-1"
              >
                Launch PPP Dashboard →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Authentic Double Horizontal Border Lines (Classic US Broadsheet Rule) */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="border-t-[3px] border-[#00204A] pt-[2px]">
          <div className="border-t border-stone-400"></div>
        </div>
      </div>

      {/* Editorial Navigation Menu */}
      <nav className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between overflow-x-auto scrollbar-none py-1.5 gap-1 md:gap-2">
          <div className="flex items-center gap-1 md:gap-2 flex-nowrap whitespace-nowrap">
            {categories.map((cat) => {
              const isActive =
                currentCategory === cat.id ||
                (cat.id === 'national' && currentCategory === 'politics') ||
                (cat.id === 'world' && currentCategory === 'international') ||
                (cat.id === 'tech' && currentCategory === 'technology') ||
                (cat.id === 'politics' && currentCategory === 'national') ||
                (cat.id === 'international' && currentCategory === 'world') ||
                (cat.id === 'technology' && currentCategory === 'tech');
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-2.5 py-1 text-[12px] sm:text-[13px] font-bold uppercase tracking-wider transition-all duration-150 rounded-sm ${
                    isActive
                      ? 'bg-[#00204A] text-white shadow-xs'
                      : 'text-stone-800 hover:text-[#00204A] hover:bg-stone-200/60'
                  }`}
                >
                  <span>{cat.labelEn}</span>
                  {languageMode !== 'en' && (
                    <span className={`ml-1 text-[10px] normal-case opacity-80 ${isActive ? 'text-amber-200' : 'text-stone-500'}`}>
                      • {cat.labelBn}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[140px] sm:min-w-[180px] ml-2 hidden sm:block">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search broadsheet..."
              className="w-full pl-8 pr-3 py-1 bg-stone-100/90 border border-stone-300 rounded text-[11px] text-stone-800 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00204A]"
            />
          </div>
        </div>
      </nav>

      {/* Bottom Thin Line */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="border-b border-stone-300"></div>
      </div>
    </header>
  );
};
