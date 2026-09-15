import React, { useState, useMemo, useEffect } from 'react';
import { Article } from '../types';
import {
  X,
  Share2,
  Printer,
  Bookmark,
  ThumbsUp,
  Sparkles,
  Headphones,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Volume2,
} from 'lucide-react';
import { ProvatBartaLogo } from './ProvatBartaLogo';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  onShareArticle: (article: Article) => void;
  languageMode: 'dual' | 'en' | 'bn';
  isSaved?: boolean;
  onToggleSave?: (article: Article) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onShareArticle,
  languageMode,
  isSaved = false,
  onToggleSave,
}) => {
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [themeMode, setThemeMode] = useState<'newsprint' | 'sepia' | 'dark'>('newsprint');
  const [copiedLink, setCopiedLink] = useState(false);
  const [likeCount, setLikeCount] = useState(article ? (article.sharesCount || 120) : 120);
  const [hasLiked, setHasLiked] = useState(false);

  // Prepare sequential paragraphs for TTS reading
  const speechParagraphs = useMemo(() => {
    if (!article) return [];
    const list: string[] = [];
    const titleText =
      languageMode === 'bn' && article.bengaliTitle ? article.bengaliTitle : article.title;
    const subText = article.subtitle ? `${article.subtitle}.` : '';
    list.push(`${titleText}. ${subText}`.trim());

    if (article.leadParagraph) {
      list.push(article.leadParagraph);
    }

    if (article.bodyParagraphs) {
      article.bodyParagraphs.forEach((p) => {
        if (p.trim()) list.push(p);
      });
    }

    return list;
  }, [article, languageMode]);

  // Hook-based TTS engine utilizing browser SpeechSynthesis API
  const tts = useTextToSpeech(speechParagraphs);

  useEffect(() => {
    if (article) {
      setLikeCount(article.sharesCount || 120);
      setHasLiked(false);
    }
    // Stop speech when switching articles
    tts.stop();
  }, [article?.id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleClose = () => {
    tts.stop();
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  const fontClasses = {
    sm: 'text-[14px] leading-relaxed',
    base: 'text-[16px] leading-[1.7]',
    lg: 'text-[18px] leading-[1.75]',
    xl: 'text-[21px] leading-[1.8]',
  };

  const themeClasses = {
    newsprint: 'bg-[#fbf9f4] text-[#181512]',
    sepia: 'bg-[#f4ebd0] text-[#2c221e]',
    dark: 'bg-[#181a1b] text-[#e8e6e3]',
  };

  if (!article) return null;

  const isAudioActive = tts.isPlaying || tts.isPaused || tts.currentParagraphIndex >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs no-print">
      <div
        className={`max-w-4xl w-full max-h-[95vh] rounded shadow-2xl flex flex-col overflow-hidden border-2 border-[#00204A] ${themeClasses[themeMode]}`}
      >
        {/* Modal Header Controls */}
        <div className="border-b border-stone-300 px-4 py-2.5 flex items-center justify-between bg-stone-100/90 text-stone-800 text-[12px] font-dateline">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#00204A] uppercase tracking-wider">
              {article.category} Section
            </span>
            <span className="text-stone-300">|</span>
            <span className="text-stone-500">{article.readTimeMinutes} min read</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* 'Listen' Button (Text-to-Speech Engine) */}
            <button
              onClick={tts.togglePlay}
              disabled={!tts.isSupported}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded text-[11px] font-dateline font-bold uppercase tracking-wider transition-all border shadow-2xs ${
                tts.isPlaying
                  ? 'bg-[#E5000C] text-white border-[#B30009]'
                  : tts.isPaused
                  ? 'bg-amber-600 text-white border-amber-700'
                  : 'bg-white hover:bg-stone-50 text-[#00204A] border-stone-300'
              } ${!tts.isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={
                !tts.isSupported
                  ? 'Speech synthesis is not supported on this browser'
                  : tts.isPlaying
                  ? 'Click to pause narration'
                  : tts.isPaused
                  ? 'Click to resume narration'
                  : 'Listen to article (Text-to-Speech)'
              }
            >
              {tts.isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                  {/* Animated Equalizer */}
                  <span className="flex items-end gap-0.5 h-3 ml-0.5" aria-hidden="true">
                    <span className="w-0.5 h-2 bg-white animate-pulse" />
                    <span className="w-0.5 h-3 bg-white animate-pulse" style={{ animationDelay: '150ms' }} />
                    <span className="w-0.5 h-1.5 bg-white animate-pulse" style={{ animationDelay: '300ms' }} />
                  </span>
                </>
              ) : tts.isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Headphones className="w-3.5 h-3.5 text-[#E5000C]" />
                  <span>Listen</span>
                </>
              )}
            </button>

            {/* Font Size Adjuster */}
            <div className="hidden sm:flex items-center gap-1 bg-white border border-stone-300 rounded px-1.5 py-0.5">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-1 font-bold ${fontSize === 'sm' ? 'text-[#00204A]' : 'text-stone-400'}`}
                title="Small text"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-1 font-bold ${fontSize === 'base' ? 'text-[#00204A]' : 'text-stone-400'}`}
                title="Regular text"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-1 font-bold ${fontSize === 'lg' ? 'text-[#00204A]' : 'text-stone-400'}`}
                title="Large text"
              >
                A+
              </button>
            </div>

            {/* Reading Mode Theme */}
            <div className="flex items-center gap-1 bg-white border border-stone-300 rounded px-1.5 py-0.5">
              <button
                onClick={() => setThemeMode('newsprint')}
                className={`w-4 h-4 rounded-full bg-[#fbf9f4] border border-stone-400 ${themeMode === 'newsprint' ? 'ring-2 ring-[#00204A]' : ''}`}
                title="Newsprint"
              />
              <button
                onClick={() => setThemeMode('sepia')}
                className={`w-4 h-4 rounded-full bg-[#f4ebd0] border border-stone-400 ${themeMode === 'sepia' ? 'ring-2 ring-[#00204A]' : ''}`}
                title="Sepia"
              />
              <button
                onClick={() => setThemeMode('dark')}
                className={`w-4 h-4 rounded-full bg-[#181a1b] border border-stone-400 ${themeMode === 'dark' ? 'ring-2 ring-[#00204A]' : ''}`}
                title="Dark"
              />
            </div>

            {/* Read Later Bookmark in Header */}
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(article)}
                className={`p-1.5 rounded transition-colors ${
                  isSaved
                    ? 'bg-[#00204A] text-[#FD8B18]'
                    : 'hover:bg-stone-200 text-stone-700'
                }`}
                title={isSaved ? 'Bookmarked in Read Later. Click to remove.' : 'Save to Read Later'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}

            {/* Print */}
            <button
              onClick={handlePrint}
              className="p-1.5 hover:bg-stone-200 rounded text-stone-700 transition-colors"
              title="Print article"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-stone-200 rounded text-stone-700 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Text-to-Speech Audio Player Dock (Active when listening) */}
        {isAudioActive && (
          <div className="bg-[#00204A] text-white px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-dateline border-b border-[#001737] shadow-sm animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                {tts.isPlaying && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    tts.isPlaying ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
              </span>
              <span className="font-bold tracking-wide uppercase text-[11px] text-amber-300">
                {tts.isPlaying ? 'Narrating Audio Edition' : 'Narration Paused'}
              </span>
              <span className="text-stone-400 text-[10px]">•</span>
              <span className="text-stone-300 text-[11px]">
                Paragraph {Math.max(1, tts.currentParagraphIndex + 1)} of {speechParagraphs.length}
              </span>
            </div>

            {/* Player Controls & Speed Adjustment */}
            <div className="flex items-center gap-3">
              {/* Skip Prev / Play-Pause / Skip Next / Stop */}
              <div className="flex items-center gap-1 bg-[#001737] px-1.5 py-0.5 rounded border border-white/10">
                <button
                  onClick={tts.previous}
                  disabled={tts.currentParagraphIndex <= 0}
                  className="p-1 hover:text-amber-300 disabled:opacity-30 transition-colors"
                  title="Previous paragraph"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={tts.togglePlay}
                  className="p-1 hover:text-amber-300 transition-colors text-white"
                  title={tts.isPlaying ? 'Pause' : 'Play'}
                >
                  {tts.isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                </button>

                <button
                  onClick={tts.next}
                  disabled={tts.currentParagraphIndex >= speechParagraphs.length - 1}
                  className="p-1 hover:text-amber-300 disabled:opacity-30 transition-colors"
                  title="Next paragraph"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={tts.stop}
                  className="p-1 hover:text-red-400 transition-colors text-stone-300"
                  title="Stop and reset speech"
                >
                  <Square className="w-3 h-3 fill-current" />
                </button>
              </div>

              {/* Speed Multiplier */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-stone-400 hidden sm:inline">Speed:</span>
                {[0.8, 1.0, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => tts.changeRate(rate)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                      tts.speechRate === rate
                        ? 'bg-amber-500 text-stone-900 border-amber-400'
                        : 'bg-white/10 hover:bg-white/20 text-stone-200 border-white/10'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Voice Selector (if multiple voices are detected) */}
              {tts.availableVoices.length > 1 && (
                <div className="hidden md:flex items-center gap-1">
                  <span className="text-[10px] text-stone-400">Voice:</span>
                  <select
                    value={tts.selectedVoice?.name || ''}
                    onChange={(e) => {
                      const v = tts.availableVoices.find((x) => x.name === e.target.value);
                      if (v) tts.changeVoice(v);
                    }}
                    className="bg-[#001737] text-white text-[10px] border border-white/20 rounded px-1 py-0.5 max-w-[120px] truncate focus:outline-none"
                  >
                    {tts.availableVoices
                      .filter((v) => v.lang.startsWith('en') || v.lang.startsWith('bn'))
                      .slice(0, 8)
                      .map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name.replace(/Google|Microsoft|Apple/g, '').trim()} ({v.lang})
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Content Scroll Area */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 font-editorial">
          {/* Masthead Header Branding */}
          <div className="text-center border-b border-stone-300 pb-4 mb-6">
            <ProvatBartaLogo variant="minimal" className="justify-center mb-2" />
            <div className="text-[10px] font-cinzel tracking-[0.25em] text-stone-500 uppercase">
              US Standard Newspaper • Editorial Dispatches
            </div>
          </div>

          {/* Bilingual Titles with Speech Highlighting */}
          <div
            className={`transition-all duration-300 rounded p-1 ${
              tts.currentParagraphIndex === 0
                ? 'bg-amber-100/70 border-l-4 border-[#00204A] pl-3'
                : ''
            }`}
          >
            {languageMode !== 'en' && article.bengaliTitle && (
              <h2 className="font-bengali font-black text-2xl sm:text-3xl lg:text-4xl text-[#00204A] leading-tight mb-3">
                {article.bengaliTitle}
              </h2>
            )}

            {languageMode !== 'bn' && (
              <h1 className="font-headline font-bold text-3xl sm:text-4xl lg:text-5xl leading-[1.15] mb-4">
                {article.title}
              </h1>
            )}

            {article.subtitle && (
              <p className="font-editorial text-lg sm:text-xl text-stone-600 italic leading-snug border-l-3 border-[#E5000C] pl-4 py-1 mb-2">
                {article.subtitle}
              </p>
            )}
          </div>

          {/* Byline & Sharing Strip */}
          <div className="flex flex-wrap items-center justify-between border-y border-stone-300 py-3 mb-6 text-[12px] font-dateline">
            <div className="flex items-center gap-3">
              {article.author.avatar && (
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-10 h-10 rounded-full object-cover border border-stone-300"
                />
              )}
              <div>
                <span className="font-bold text-[#00204A] block">
                  By {article.author.name}
                </span>
                <span className="text-stone-500">
                  {article.author.role} • {article.author.location}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 sm:mt-0 flex-wrap">
              <span className="text-stone-500 mr-2">{article.publishedAt}</span>

              {/* Read Later Bookmark in Byline */}
              {onToggleSave && (
                <button
                  onClick={() => onToggleSave(article)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-dateline font-bold uppercase tracking-wider text-[11px] transition-all border shadow-2xs ${
                    isSaved
                      ? 'bg-[#00204A] text-[#FD8B18] border-[#00204A] hover:bg-[#00306e]'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                  }`}
                  title={isSaved ? 'Bookmarked in Read Later (click to remove)' : 'Save to Read Later (view in PPP dashboard)'}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-[#FD8B18]' : 'text-stone-600'}`} />
                  <span>{isSaved ? 'Saved for Later' : 'Read Later'}</span>
                </button>
              )}

              {/* PPP Share to Earn button */}
              <button
                onClick={() => onShareArticle(article)}
                className="flex items-center gap-1.5 bg-[#00204A] hover:bg-[#00306e] text-white px-3 py-1.5 rounded font-dateline font-bold uppercase tracking-wider text-[11px] transition-colors shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5 text-[#FD8B18]" />
                <span>Share & Earn (PPP)</span>
              </button>

              <button
                onClick={() => {
                  setLikeCount((prev) => (hasLiked ? prev - 1 : prev + 1));
                  setHasLiked(!hasLiked);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded border transition-colors ${
                  hasLiked
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{likeCount}</span>
              </button>
            </div>
          </div>

          {/* Featured Image & Caption */}
          <div className="mb-6">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-auto max-h-[440px] object-cover rounded-xs border border-stone-300"
            />
            <p className="text-[12px] font-editorial text-stone-500 italic mt-2 leading-normal">
              {article.imageCaption}
              <span className="not-italic text-[10px] font-dateline text-stone-400 ml-2">
                [{article.imageCredit}]
              </span>
            </p>
          </div>

          {/* Article Text Content with Dynamic Speech Highlighting */}
          <div className={`space-y-5 text-justify ${fontClasses[fontSize]}`}>
            <p
              className={`drop-cap transition-all duration-300 rounded p-1 ${
                tts.currentParagraphIndex === 1
                  ? 'bg-amber-100/70 border-l-4 border-[#00204A] pl-3'
                  : ''
              }`}
            >
              {article.leadParagraph}
            </p>

            {article.bodyParagraphs.map((para, i) => {
              const isCurrentlySpoken = tts.currentParagraphIndex === i + 2;
              return (
                <p
                  key={i}
                  className={`transition-all duration-300 rounded p-1 ${
                    isCurrentlySpoken
                      ? 'bg-amber-100/70 border-l-4 border-[#00204A] pl-3'
                      : ''
                  }`}
                >
                  {para}
                </p>
              );
            })}

            {article.pullQuote && (
              <blockquote className="border-y-2 border-[#00204A] py-4 px-6 my-6 bg-stone-100/50 text-center">
                <p className="font-headline font-bold text-xl italic text-[#00204A] leading-snug">
                  "{article.pullQuote}"
                </p>
                {article.pullQuoteAuthor && (
                  <cite className="block text-[12px] font-dateline font-semibold text-[#E5000C] uppercase tracking-wider mt-2 not-italic">
                    — {article.pullQuoteAuthor}
                  </cite>
                )}
              </blockquote>
            )}
          </div>

          {/* Provat Partner Banner at End of Article */}
          <div className="mt-8 bg-amber-50 border-2 border-amber-300 rounded p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FD8B18]" />
                <span className="font-cinzel font-bold text-sm text-[#00204A]">
                  Support Independent Journalism With Provat Partner Program
                </span>
              </div>
              <p className="text-[12px] font-dateline text-stone-600 mt-1">
                Share this article with your unique creator link. You earn a 50% split of every verified reader engagement.
              </p>
            </div>
            <button
              onClick={() => onShareArticle(article)}
              className="bg-[#00204A] hover:bg-[#00306e] text-white px-4 py-2 rounded text-xs font-dateline font-bold uppercase tracking-wider whitespace-nowrap shadow-xs"
            >
              Get My Affiliate Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
