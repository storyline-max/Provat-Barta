import React from 'react';
import { Article } from '../types';
import { Share2, Clock, MapPin, Volume2, Sparkles, ChevronRight, DollarSign, Bookmark, BookmarkCheck } from 'lucide-react';

interface LeadStoryProps {
  article: Article;
  languageMode: 'dual' | 'en' | 'bn';
  onOpenArticle: (article: Article) => void;
  onQuickShare: (article: Article) => void;
  isSaved?: boolean;
  onToggleSave?: (article: Article) => void;
}

export const LeadStory: React.FC<LeadStoryProps> = ({
  article,
  languageMode,
  onOpenArticle,
  onQuickShare,
  isSaved = false,
  onToggleSave,
}) => {
  return (
    <article className="border-b-2 border-stone-300 pb-8 mb-8">
      {/* Editorial Kicker */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-1.5 mb-3 text-[11px] font-dateline">
        <div className="flex items-center gap-2">
          <span className="bg-[#00204A] text-white px-2 py-0.5 font-bold uppercase tracking-widest text-[10px]">
            Lead Dispatches
          </span>
          <span className="text-[#E5000C] font-bold uppercase tracking-wider">
            Diplomacy & Economic Corridors
          </span>
        </div>
        <div className="flex items-center gap-3 text-stone-500">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#00204A]" />
            {article.author.location}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.readTimeMinutes} min read
          </span>
        </div>
      </div>

      {/* Main Headline */}
      <div className="space-y-2 mb-4">
        {languageMode !== 'en' && article.bengaliTitle && (
          <h2
            onClick={() => onOpenArticle(article)}
            className="font-bengali font-black text-2xl sm:text-3xl lg:text-4xl text-[#00204A] hover:text-[#E5000C] cursor-pointer transition-colors leading-tight"
          >
            {article.bengaliTitle}
          </h2>
        )}

        {languageMode !== 'bn' && (
          <h1
            onClick={() => onOpenArticle(article)}
            className="font-headline font-bold text-3xl sm:text-4xl lg:text-5xl text-[#181512] hover:text-[#00204A] cursor-pointer transition-colors leading-[1.12] tracking-tight"
          >
            {article.title}
          </h1>
        )}

        {article.subtitle && (
          <p className="font-editorial text-lg sm:text-xl text-stone-700 italic leading-snug border-l-2 border-[#E5000C] pl-3 py-0.5">
            {article.subtitle}
          </p>
        )}
      </div>

      {/* Byline and Dateline */}
      <div className="flex flex-wrap items-center justify-between border-y border-stone-300 py-2 mb-5 text-[12px] font-dateline text-stone-700">
        <div className="flex items-center gap-2.5">
          {article.author.avatar && (
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-7 h-7 rounded-full object-cover border border-stone-300"
            />
          )}
          <div>
            <span className="font-bold text-[#00204A] uppercase tracking-wide">
              By {article.author.name}
            </span>
            <span className="text-stone-500 ml-1.5">• {article.author.role}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-4 mt-2 sm:mt-0">
          <span className="text-stone-500">{article.publishedAt}</span>

          {/* Read Later Toggle Button */}
          {onToggleSave && (
            <button
              onClick={() => onToggleSave(article)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition-all border shadow-2xs ${
                isSaved
                  ? 'bg-[#00204A] text-[#FD8B18] border-[#00204A] hover:bg-[#00306e]'
                  : 'bg-stone-100 hover:bg-stone-200/90 text-stone-800 border-stone-300'
              }`}
              title={isSaved ? 'Bookmarked in Read Later. Click to remove.' : 'Save to Read Later (view in PPP dashboard)'}
            >
              {isSaved ? (
                <BookmarkCheck className="w-3.5 h-3.5 text-[#FD8B18]" />
              ) : (
                <Bookmark className="w-3.5 h-3.5 text-stone-600" />
              )}
              <span>{isSaved ? 'Saved for Later' : 'Read Later'}</span>
            </button>
          )}

          <button
            onClick={() => onQuickShare(article)}
            className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-[#00204A] px-2.5 py-1 rounded text-[11px] font-bold transition-colors border border-amber-300 shadow-2xs"
            title="Share with your affiliate link to earn 50% ad revenue"
          >
            <Share2 className="w-3.5 h-3.5 text-[#E5000C]" />
            <span>Share & Earn (PPP)</span>
          </button>
        </div>
      </div>

      {/* Grid: Image + 3-Column Text Layout (Authentic Broadsheet Composition) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Photo + Caption */}
        <div className="lg:col-span-7 flex flex-col justify-start">
          <div
            onClick={() => onOpenArticle(article)}
            className="group cursor-pointer overflow-hidden rounded-xs border border-stone-300 bg-stone-100 relative"
          >
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-auto aspect-16/10 object-cover group-hover:scale-[1.01] transition-transform duration-300"
            />
            <div className="absolute top-2 left-2 bg-[#00204A]/90 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider backdrop-blur-xs">
              Exclusive Bureau Wire
            </div>
          </div>
          {/* Photo Cutline */}
          <p className="font-editorial text-[13px] text-stone-600 mt-2 italic leading-normal border-b border-stone-200 pb-2">
            <span className="font-bold font-dateline not-italic text-stone-800 uppercase mr-1">
              Historic Accord:
            </span>
            {article.imageCaption}
            <span className="text-stone-400 ml-2 not-italic text-[11px] font-dateline">
              [{article.imageCredit}]
            </span>
          </p>

          {/* At A Glance Takeaways */}
          {article.keyTakeaways && (
            <div className="mt-4 bg-stone-100/80 border border-stone-300 p-3.5 rounded-xs">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#00204A] mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#FD8B18]" />
                Key Developments at a Glance
              </h4>
              <ul className="space-y-1.5 text-[13px] font-editorial text-stone-800">
                {article.keyTakeaways.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#E5000C] font-bold leading-none mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right 5 Columns: Lead Paragraph with Drop Cap & Body Columns */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <p className="drop-cap font-editorial text-[17px] text-stone-900 leading-[1.65] text-justify">
              {article.leadParagraph}
            </p>

            {article.bodyParagraphs.slice(0, 2).map((paragraph, index) => (
              <p key={index} className="font-editorial text-[15px] text-stone-800 leading-[1.65] text-justify">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Pull Quote Box */}
          {article.pullQuote && (
            <div className="my-2 border-y-2 border-[#00204A] py-3 px-2 bg-stone-50 text-center">
              <p className="font-headline font-bold text-lg sm:text-xl text-[#00204A] italic leading-snug">
                "{article.pullQuote}"
              </p>
              {article.pullQuoteAuthor && (
                <p className="text-[11px] font-dateline font-semibold text-[#E5000C] uppercase tracking-wider mt-1.5">
                  — {article.pullQuoteAuthor}
                </p>
              )}
            </div>
          )}

          {/* Read Continuation Button */}
          <div className="pt-2 flex items-center justify-between border-t border-stone-200">
            <button
              onClick={() => onOpenArticle(article)}
              className="font-dateline font-bold text-[13px] text-[#00204A] hover:text-[#E5000C] flex items-center gap-1 uppercase tracking-wider group"
            >
              <span>Continue Reading Full Report</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <span className="text-[11px] font-dateline text-stone-500">
              Page A1 • Section 1
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
