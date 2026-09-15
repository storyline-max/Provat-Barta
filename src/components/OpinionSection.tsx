import React from 'react';
import { Article } from '../types';
import { MessageSquare, Feather, Share2, Bookmark } from 'lucide-react';

interface OpinionSectionProps {
  articles: Article[];
  languageMode: 'dual' | 'en' | 'bn';
  onOpenArticle: (article: Article) => void;
  onOpenSubmitTip: () => void;
  onQuickShare: (article: Article) => void;
  savedArticleIds?: string[];
  onToggleSave?: (article: Article) => void;
}

export const OpinionSection: React.FC<OpinionSectionProps> = ({
  articles,
  languageMode,
  onOpenArticle,
  onOpenSubmitTip,
  onQuickShare,
  savedArticleIds = [],
  onToggleSave,
}) => {
  const editorialArticle = articles.find((a) => a.category === 'opinion') || articles[0];
  const opinionColumns = articles.filter((a) => a.id !== editorialArticle.id).slice(0, 3);
  const isEditorialSaved = savedArticleIds.includes(editorialArticle.id);

  return (
    <section className="border-t-2 border-stone-800 pt-6 mb-12">
      {/* Op-Ed Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-stone-300 pb-2 mb-6">
        <div>
          <span className="text-[10px] font-dateline uppercase tracking-[0.25em] font-bold text-[#E5000C] block">
            The Forum of Discourse
          </span>
          <h2 className="font-headline font-black text-2xl sm:text-3xl text-[#00204A] tracking-tight">
            Opinion, Letters & The Editorial Board
          </h2>
        </div>

        <button
          onClick={onOpenSubmitTip}
          className="flex items-center gap-1.5 text-[11px] font-dateline font-bold uppercase tracking-wider bg-stone-100 hover:bg-stone-200 text-[#00204A] border border-stone-300 px-3 py-1 rounded transition-colors mt-2 sm:mt-0"
        >
          <Feather className="w-3.5 h-3.5 text-[#E5000C]" />
          <span>Write a Letter to the Editor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Columns: Formal Editorial by The Board */}
        <div className="lg:col-span-7 bg-stone-100/70 border border-stone-300 p-6 rounded-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-dateline uppercase tracking-widest text-[#00204A] border-b border-stone-300 pb-2 mb-3">
              <span className="font-bold flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-[#E5000C]"></span>
                The Editorial Voice of Provat Barta
              </span>
              <span className="text-stone-500">Unsigned Consensus</span>
            </div>

            {languageMode !== 'en' && editorialArticle.bengaliTitle && (
              <h3
                onClick={() => onOpenArticle(editorialArticle)}
                className="font-bengali font-bold text-xl sm:text-2xl text-[#00204A] hover:text-[#E5000C] cursor-pointer transition-colors leading-snug mb-2"
              >
                {editorialArticle.bengaliTitle}
              </h3>
            )}

            {languageMode !== 'bn' && (
              <h3
                onClick={() => onOpenArticle(editorialArticle)}
                className="font-headline font-bold text-2xl sm:text-3xl text-[#181512] hover:text-[#00204A] cursor-pointer transition-colors leading-tight mb-3"
              >
                {editorialArticle.title}
              </h3>
            )}

            <p className="font-editorial text-[15px] text-stone-800 leading-[1.7] text-justify mb-4 drop-cap">
              {editorialArticle.leadParagraph}
            </p>

            <blockquote className="border-l-3 border-[#00204A] pl-4 my-4 font-headline italic text-stone-700 text-base">
              "{editorialArticle.pullQuote || 'Truth is not an accident of algorithms; it is forged through fearless journalism.'}"
            </blockquote>
          </div>

          <div className="border-t border-stone-300 pt-3 flex items-center justify-between text-[11px] font-dateline">
            <span className="font-bold text-[#00204A] uppercase tracking-wider">
              By The Editorial Directorate
            </span>
            <div className="flex items-center gap-2 sm:gap-3">
              {onToggleSave && (
                <button
                  onClick={() => onToggleSave(editorialArticle)}
                  className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded transition-colors ${
                    isEditorialSaved
                      ? 'bg-[#00204A] text-[#FD8B18] font-bold'
                      : 'text-stone-600 hover:text-[#00204A] hover:bg-stone-100'
                  }`}
                  title={isEditorialSaved ? 'Saved in Read Later (click to remove)' : 'Save to Read Later'}
                >
                  <Bookmark className={`w-3 h-3 ${isEditorialSaved ? 'fill-current' : ''}`} />
                  <span>{isEditorialSaved ? 'Saved' : 'Read Later'}</span>
                </button>
              )}
              <button
                onClick={() => onQuickShare(editorialArticle)}
                className="text-[#00204A] hover:text-[#E5000C] flex items-center gap-1 font-semibold"
              >
                <Share2 className="w-3 h-3" />
                <span>Share (PPP)</span>
              </button>
              <button
                onClick={() => onOpenArticle(editorialArticle)}
                className="font-bold text-[#00204A] hover:text-[#E5000C] uppercase tracking-wider"
              >
                Read Full Editorial →
              </button>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Signed Columnists */}
        <div className="lg:col-span-5 space-y-5">
          <h4 className="text-[11px] font-dateline font-bold uppercase tracking-[0.2em] text-stone-500 border-b border-stone-300 pb-1">
            Contributing Columnists
          </h4>

          {opinionColumns.map((art) => {
            const isColSaved = savedArticleIds.includes(art.id);
            return (
              <div
                key={art.id}
                className="border-b border-stone-200 pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start gap-3">
                  {art.author.avatar && (
                    <img
                      src={art.author.avatar}
                      alt={art.author.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-stone-300 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-dateline font-bold uppercase tracking-wider text-[#00204A] block">
                        {art.author.name}
                      </span>
                      {onToggleSave && (
                        <button
                          onClick={() => onToggleSave(art)}
                          className={`p-1 rounded text-[11px] transition-colors ${
                            isColSaved
                              ? 'text-[#FD8B18] bg-[#00204A]'
                              : 'text-stone-400 hover:text-[#00204A] hover:bg-stone-100'
                          }`}
                          title={isColSaved ? 'Saved in Read Later (click to remove)' : 'Save to Read Later'}
                        >
                          <Bookmark className={`w-3 h-3 ${isColSaved ? 'fill-current' : ''}`} />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-500 font-dateline block mb-1">
                      {art.author.role} • {art.author.location}
                    </span>

                    <h5
                      onClick={() => onOpenArticle(art)}
                      className="font-headline font-bold text-base text-stone-900 hover:text-[#E5000C] cursor-pointer transition-colors leading-snug"
                    >
                      {art.title}
                    </h5>

                    <p className="font-editorial text-[13px] text-stone-600 line-clamp-2 mt-1">
                      {art.subtitle || art.leadParagraph}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
