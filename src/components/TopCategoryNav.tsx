import React from 'react';
import {
  Layers,
  Landmark,
  Trophy,
  Cpu,
  Globe2,
  TrendingUp,
  Feather,
  Palette,
  Grid,
  Calendar,
  Sparkles,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { Category } from '../types';

export interface CategoryNavItem {
  id: Category;
  labelEn: string;
  labelBn: string;
  icon: React.ElementType;
  badge?: string;
}

export interface TopCategoryNavProps {
  currentCategory: Category;
  onSelectCategory: (category: Category) => void;
  languageMode: 'dual' | 'en' | 'bn';
  articleCounts?: Partial<Record<Category, number>>;
  onOpenArchive?: () => void;
  onOpenPuzzles?: () => void;
  onOpenPartner?: () => void;
  isArchiveLoaded?: boolean;
}

export const TOP_NAV_CATEGORIES: CategoryNavItem[] = [
  {
    id: 'front-page',
    labelEn: 'Front Page',
    labelBn: 'প্রথম পাতা',
    icon: Layers,
  },
  {
    id: 'politics',
    labelEn: 'Politics',
    labelBn: 'রাজনীতি',
    icon: Landmark,
    badge: 'Trending',
  },
  {
    id: 'sports',
    labelEn: 'Sports',
    labelBn: 'খেলাধুলা',
    icon: Trophy,
  },
  {
    id: 'technology',
    labelEn: 'Technology',
    labelBn: 'প্রযুক্তি',
    icon: Cpu,
  },
  {
    id: 'international',
    labelEn: 'International',
    labelBn: 'আন্তর্জাতিক',
    icon: Globe2,
  },
  {
    id: 'business',
    labelEn: 'Business',
    labelBn: 'বাণিজ্য',
    icon: TrendingUp,
  },
  {
    id: 'opinion',
    labelEn: 'Opinion',
    labelBn: 'মতামত',
    icon: Feather,
  },
  {
    id: 'arts',
    labelEn: 'Arts & Culture',
    labelBn: 'শিল্প-সংস্কৃতি',
    icon: Palette,
  },
];

export const TopCategoryNav: React.FC<TopCategoryNavProps> = ({
  currentCategory,
  onSelectCategory,
  languageMode,
  articleCounts = {},
  onOpenArchive,
  onOpenPuzzles,
  onOpenPartner,
  isArchiveLoaded = false,
}) => {
  // Category match helper
  const isSelected = (catId: Category) => {
    if (currentCategory === catId) return true;
    if (catId === 'politics' && currentCategory === 'national') return true;
    if (catId === 'national' && currentCategory === 'politics') return true;
    if (catId === 'international' && currentCategory === 'world') return true;
    if (catId === 'world' && currentCategory === 'international') return true;
    if (catId === 'technology' && currentCategory === 'tech') return true;
    if (catId === 'tech' && currentCategory === 'technology') return true;
    return false;
  };

  return (
    <nav
      id="top-category-navigation-bar"
      aria-label="Top-Level Category Sections"
      className="bg-[#F8F6F0] border-b-2 border-[#00204A]/20 shadow-2xs sticky top-0 z-30 backdrop-blur-md no-print transition-colors"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between gap-2 py-1.5 overflow-x-auto scrollbar-none">
          {/* Main Category Sections List */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap whitespace-nowrap">
            {TOP_NAV_CATEGORIES.map((item) => {
              const active = isSelected(item.id);
              const Icon = item.icon;
              const count = articleCounts[item.id] ?? 0;

              return (
                <button
                  key={item.id}
                  id={`nav-category-${item.id}`}
                  onClick={() => onSelectCategory(item.id)}
                  className={`group relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-sm font-dateline text-[12px] sm:text-[13px] font-bold tracking-wider transition-all duration-150 select-none ${
                    active
                      ? 'bg-[#00204A] text-white shadow-xs'
                      : 'text-stone-700 hover:text-[#00204A] hover:bg-stone-200/80 active:bg-stone-300'
                  }`}
                  title={`Filter news by ${item.labelEn} (${item.labelBn})`}
                >
                  {/* Category Icon */}
                  <Icon
                    className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${
                      active
                        ? 'text-[#FD8B18]'
                        : item.id === 'politics'
                        ? 'text-[#E5000C]'
                        : item.id === 'sports'
                        ? 'text-emerald-700'
                        : item.id === 'technology'
                        ? 'text-blue-600'
                        : item.id === 'international'
                        ? 'text-purple-700'
                        : 'text-stone-500'
                    }`}
                  />

                  {/* English Section Label */}
                  {languageMode !== 'bn' && (
                    <span className="uppercase">{item.labelEn}</span>
                  )}

                  {/* Bengali Section Label */}
                  {languageMode !== 'en' && (
                    <span
                      className={`font-bengali font-normal text-[11px] ${
                        active
                          ? 'text-amber-200'
                          : 'text-stone-500 group-hover:text-[#00204A]'
                      }`}
                    >
                      {languageMode === 'dual' ? `• ${item.labelBn}` : item.labelBn}
                    </span>
                  )}

                  {/* Article Count Badge */}
                  {count > 0 && item.id !== 'front-page' && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-sans font-bold leading-none ${
                        active
                          ? 'bg-[#FD8B18] text-[#00204A]'
                          : 'bg-stone-200 text-stone-600 group-hover:bg-stone-300 group-hover:text-stone-900'
                      }`}
                    >
                      {count}
                    </span>
                  )}

                  {/* Hot/Trending Badge */}
                  {item.badge && !active && (
                    <span className="hidden xl:inline-flex items-center gap-0.5 text-[8px] bg-red-100 text-[#E5000C] px-1 py-0.2 rounded font-bold uppercase tracking-wider">
                      <Flame className="w-2.5 h-2.5 fill-current" />
                      {item.badge}
                    </span>
                  )}

                  {/* Active bottom notch / indicator */}
                  {active && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#00204A]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Shortcuts: Puzzles, Archive, PPP */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 pl-2 border-l border-stone-300">
            {onOpenPuzzles && (
              <button
                id="top-nav-puzzles"
                onClick={onOpenPuzzles}
                className="hidden lg:flex items-center gap-1 px-2 py-1 text-[11px] font-dateline font-semibold text-stone-600 hover:text-[#00204A] hover:bg-stone-200/60 rounded transition-colors"
                title="Play Daily Crossword and Sudoku"
              >
                <Grid className="w-3 h-3 text-[#FD8B18]" />
                <span>Puzzles</span>
              </button>
            )}

            {onOpenArchive && (
              <button
                id="top-nav-archive"
                onClick={onOpenArchive}
                className={`hidden md:flex items-center gap-1 px-2 py-1 text-[11px] font-dateline font-semibold rounded transition-colors ${
                  isArchiveLoaded
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                    : 'text-stone-600 hover:text-[#00204A] hover:bg-stone-200/60'
                }`}
                title="Browse Newspaper Archive by Date"
              >
                <Calendar className="w-3 h-3 text-[#E5000C]" />
                <span>Archive</span>
              </button>
            )}

            {onOpenPartner && (
              <button
                id="top-nav-ppp"
                onClick={onOpenPartner}
                className="flex items-center gap-1 px-2 py-1 text-[11px] font-dateline font-bold bg-[#E5000C]/10 text-[#E5000C] hover:bg-[#E5000C] hover:text-white rounded transition-colors shadow-2xs"
                title="Provat Partner Program (Earn by Sharing News)"
              >
                <Sparkles className="w-3 h-3" />
                <span className="hidden sm:inline">Partner</span>
                <span>(PPP)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
