import React from 'react';
import { Article } from '../types';
import { Clock, Share2, ArrowRight, Bookmark } from 'lucide-react';

interface OffLeadGridProps {
  articles: Article[];
  languageMode: 'dual' | 'en' | 'bn';
  onOpenArticle: (article: Article) => void;
  onQuickShare: (article: Article) => void;
  savedArticleIds?: string[];
  onToggleSave?: (article: Article) => void;
}

export const OffLeadGrid: React.FC<OffLeadGridProps> = ({
  articles,
  languageMode,
  onOpenArticle,
  onQuickShare,
  savedArticleIds = [],
  onToggleSave,
}) => {
  return (
    <section className="mb-10">
      {/* Section Header */}
      <div className="flex items-center justify-between border-y-2 border-[#00204A] py-1.5 mb-6 bg-stone-100/60 px-2">
        <h3 className="font-cinzel font-black text-sm sm:text-base tracking-[0.2em] text-[#00204A] uppercase">
          General News & Regional Dispatches
        </h3>
        <span className="text-[11px] font-dateline font-medium text-stone-600 uppercase tracking-wider">
          Section A • Pages A2–A8
        </span>
      </div>

      {/* 3-Column Broadsheet Grid with Vertical Column Dividers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((art, idx) => {
          const isSaved = savedArticleIds.includes(art.id);
          return (
            <article
              key={art.id}
              className="flex flex-col justify-between border-b md:border-b-0 pb-6 md:pb-0 relative"
            >
              <div>
                {/* Category Tag & Bookmark */}
                <div className="flex items-center justify-between text-[11px] font-dateline uppercase tracking-widest text-stone-500 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#E5000C]">{art.category}</span>
                    <span className="text-stone-300">•</span>
                    <span>{art.author.location}</span>
                  </div>
                  {onToggleSave && (
                    <button
                      onClick={() => onToggleSave(art)}
                      className={`flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded transition-colors ${
                        isSaved
                          ? 'bg-[#00204A] text-[#FD8B18]'
                          : 'text-stone-400 hover:text-[#00204A] hover:bg-stone-100'
                      }`}
                      title={isSaved ? 'Saved in Read Later (click to remove)' : 'Save to Read Later'}
                    >
                      <Bookmark className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>
                  )}
                </div>

              {/* Thumbnail Image */}
              <div
                onClick={() => onOpenArticle(art)}
                className="cursor-pointer overflow-hidden border border-stone-300 mb-3 bg-stone-100 group"
              >
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Bengali Title if applicable */}
              {languageMode !== 'en' && art.bengaliTitle && (
                <h4
                  onClick={() => onOpenArticle(art)}
                  className="font-bengali font-bold text-lg text-[#00204A] hover:text-[#E5000C] cursor-pointer transition-colors leading-snug mb-1"
                >
                  {art.bengaliTitle}
                </h4>
              )}

              {/* English Headline */}
              {languageMode !== 'bn' && (
                <h3
                  onClick={() => onOpenArticle(art)}
                  className="font-headline font-bold text-xl text-[#181512] hover:text-[#00204A] cursor-pointer transition-colors leading-snug mb-2"
                >
                  {art.title}
                </h3>
              )}

              {/* Subtitle / Excerpt */}
              <p className="font-editorial text-[14px] text-stone-700 leading-relaxed text-justify mb-3">
                {art.subtitle || art.leadParagraph}
              </p>
            </div>

            {/* Bottom Meta & Action */}
            <div className="border-t border-stone-200 pt-3 mt-2 flex items-center justify-between text-[11px] font-dateline">
              <div className="flex items-center gap-2 text-stone-600">
                <span className="font-bold text-stone-800">By {art.author.name}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {art.readTimeMinutes}m
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {onToggleSave && (
                  <button
                    onClick={() => onToggleSave(art)}
                    className={`p-1 rounded transition-colors ${
                      isSaved
                        ? 'text-[#FD8B18] bg-[#00204A]'
                        : 'text-stone-400 hover:text-[#00204A] hover:bg-stone-100'
                    }`}
                    title={isSaved ? 'Saved in Read Later (click to remove)' : 'Save to Read Later'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                )}

                <button
                  onClick={() => onQuickShare(art)}
                  className="p-1 hover:bg-amber-100 rounded text-[#00204A] hover:text-[#E5000C] transition-colors"
                  title="Share with Provat Partner affiliate link"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onOpenArticle(art)}
                  className="font-bold text-[#00204A] hover:text-[#E5000C] uppercase tracking-wider flex items-center gap-0.5 ml-1"
                >
                  <span>Read</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </article>
          );
        })}
      </div>
    </section>
  );
};
