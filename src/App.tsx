/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { BroadsheetHeader } from './components/BroadsheetHeader';
import { BreakingNewsTicker } from './components/BreakingNewsTicker';
import { TopCategoryNav } from './components/TopCategoryNav';
import { LeadStory } from './components/LeadStory';
import { OffLeadGrid } from './components/OffLeadGrid';
import { OpinionSection } from './components/OpinionSection';
import { MarketAndWeatherWidget } from './components/MarketAndWeatherWidget';
import { BroadsheetFooter } from './components/BroadsheetFooter';
import { ArticleModal } from './components/ArticleModal';
import { EarningsDashboardModal } from './components/EarningsDashboardModal';
import { SubmitTipModal } from './components/SubmitTipModal';
import { ArchiveModal } from './components/ArchiveModal';
import { ArchiveSection } from './components/ArchiveSection';
import { DailyPuzzlesSection } from './components/DailyPuzzlesSection';
import { DailyPuzzlesModal } from './components/DailyPuzzlesModal';
import { ProvatBartaLogo } from './components/ProvatBartaLogo';
import { WireNotificationBanner } from './components/WireNotificationBanner';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { AudioTranscribeModal } from './components/AudioTranscribeModal';
import { UserAccountModal } from './components/UserAccountModal';
import { useWebNotifications } from './hooks/useWebNotifications';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { MOCK_ARTICLES, MOCK_MARKETS, MOCK_WEATHER, INITIAL_AFFILIATE_USER, INITIAL_WITHDRAWALS } from './data/mockNews';
import { Article, Category, AffiliateUser, WithdrawalRecord, ArchiveEdition } from './types';
import { Share2, Check, Sparkles, Filter, X, Award, Calendar, RotateCcw, Layers, Radio, Mic } from 'lucide-react';

export default function App() {
  const [currentCategory, setCurrentCategory] = useState<Category>('front-page');
  const [selectedEdition, setSelectedEdition] = useState<string>('US National');
  const [languageMode, setLanguageMode] = useState<'dual' | 'en' | 'bn'>('dual');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isPartnerDashboardOpen, setIsPartnerDashboardOpen] = useState(false);
  const [isSubmitTipOpen, setIsSubmitTipOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isPuzzlesModalOpen, setIsPuzzlesModalOpen] = useState(false);
  const [puzzleModalTab, setPuzzleModalTab] = useState<'crossword' | 'sudoku'>('crossword');
  
  // Voice & AI Modals
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [isTranscribeOpen, setIsTranscribeOpen] = useState(false);
  const [isUserAccountOpen, setIsUserAccountOpen] = useState(false);
  const [tipInitialContent, setTipInitialContent] = useState('');

  // Firebase Auth & Firestore Integration
  const {
    currentUser,
    bookmarks: firestoreBookmarks,
    savedTipHistory,
    login: handleGoogleLogin,
    logout: handleGoogleLogout,
    toggleBookmark: handleFirestoreToggleBookmark,
    saveNewsTipToFirestore,
  } = useFirebaseAuth();

  const handleOpenCrossword = () => {
    setPuzzleModalTab('crossword');
    setIsPuzzlesModalOpen(true);
  };

  const handleOpenSudoku = () => {
    setPuzzleModalTab('sudoku');
    setIsPuzzlesModalOpen(true);
  };
  
  // Loaded Historical Archive Edition
  const [loadedArchiveEdition, setLoadedArchiveEdition] = useState<ArchiveEdition | null>(null);

  // Web Notifications API for Real-Time Breaking & Urgent Bulletins
  const {
    permission: notificationPermission,
    isEnabled: notificationsEnabled,
    soundEnabled,
    activeInAppAlert,
    requestPermission: handleRequestNotificationPermission,
    toggleEnabled: handleToggleNotifications,
    toggleSound: handleToggleSound,
    triggerPushNotification,
    dismissInAppAlert,
    testNotification: handleTestNotification,
  } = useWebNotifications((article) => setSelectedArticle(article));

  // Provat Partner Program state
  const [affiliateUser, setAffiliateUser] = useState<AffiliateUser>(INITIAL_AFFILIATE_USER);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>(INITIAL_WITHDRAWALS);
  const [partnerDashboardTab, setPartnerDashboardTab] = useState<'overview' | 'links' | 'withdraw' | 'team' | 'saved'>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Read Later / Saved Bookmarks state with localStorage persistence
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('provat_barta_read_later');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved articles from localStorage', e);
    }
    // Default seed articles so user immediately sees populated bookmark state
    return ['art-1', 'art-3'];
  });

  // Persist bookmarks whenever savedArticleIds changes
  useEffect(() => {
    try {
      localStorage.setItem('provat_barta_read_later', JSON.stringify(savedArticleIds));
    } catch (e) {
      console.error('Failed to save bookmarks to localStorage', e);
    }
  }, [savedArticleIds]);

  // Merge Firestore bookmarks into savedArticleIds when user is signed in
  useEffect(() => {
    if (currentUser && firestoreBookmarks.length > 0) {
      const firestoreIds = firestoreBookmarks.map((b) => b.articleId);
      setSavedArticleIds((prev) => Array.from(new Set([...prev, ...firestoreIds])));
    }
  }, [currentUser, firestoreBookmarks]);

  // Dynamic articles source: either loaded historical edition or live current articles
  const baseArticles = useMemo(() => {
    if (!loadedArchiveEdition) return MOCK_ARTICLES;

    const archiveLead: Article = {
      id: `archive-${loadedArchiveEdition.id}-lead`,
      title: loadedArchiveEdition.leadHeadline,
      bengaliTitle: loadedArchiveEdition.leadBengaliHeadline,
      subtitle: `${loadedArchiveEdition.editionName} • Published ${loadedArchiveEdition.displayDate}`,
      category: 'national',
      isLeadStory: true,
      isBreaking: false,
      author: {
        name: 'Provat Barta Bureau Staff',
        role: 'Diplomatic & National Correspondents',
        location: 'Washington / New York / Dhaka',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
      publishedAt: `${loadedArchiveEdition.displayDate} • Historic Morning Edition`,
      readTimeMinutes: 5,
      imageUrl: loadedArchiveEdition.leadImageUrl,
      imageCaption: loadedArchiveEdition.leadImageCaption,
      imageCredit: 'The Provat Barta Archival Microfilm Vault',
      leadParagraph: loadedArchiveEdition.leadSummary,
      bodyParagraphs: [
        loadedArchiveEdition.leadSummary,
        `According to dispatches published in The Provat Barta (${loadedArchiveEdition.volumeNumber}), today marks an essential historical reference preserved in our international broadsheet records.`,
        `Correspondents across global bureaus noted the strategic ramifications of these developments, which shaped public dialogue throughout North America and South Asia.`,
        `The full printed broadsheet issue spans ${loadedArchiveEdition.pageCount} pages, including dedicated business indices, municipal gazette notices, cultural reviews, and editorial perspectives.`
      ],
      pullQuote: loadedArchiveEdition.leadHeadline,
      pullQuoteAuthor: `${loadedArchiveEdition.volumeNumber} Editorial Archival Record`,
      keyTakeaways: [
        `Official broadsheet edition preserved: ${loadedArchiveEdition.volumeNumber}`,
        `Published date: ${loadedArchiveEdition.displayDate}`,
        `Circulation record: ${loadedArchiveEdition.circulationEstimate}`,
        `Weather almanac: ${loadedArchiveEdition.weatherSnapshot}`
      ],
      sharesCount: 890,
      viewsCount: 14200,
      adRevenueEstimate: 1250,
    };

    const archiveFeatured: Article[] = loadedArchiveEdition.featuredStories.map((story, i) => ({
      id: `archive-${loadedArchiveEdition.id}-story-${i}`,
      title: story.title,
      bengaliTitle: story.bengaliTitle,
      category: (story.category as Category) || 'world',
      author: {
        name: story.author,
        role: 'Staff Correspondent',
        location: 'Provat Barta Bureau',
      },
      publishedAt: loadedArchiveEdition.displayDate,
      readTimeMinutes: 4,
      imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
      imageCaption: `Archival photographic record for ${story.title}.`,
      imageCredit: 'The Provat Barta Microfilm Archives',
      leadParagraph: story.snippet,
      bodyParagraphs: [
        story.snippet,
        `Preserved within ${loadedArchiveEdition.volumeNumber}, this report reflects the contemporaneous newsroom coverage documented by the editorial staff.`
      ],
      sharesCount: 340,
      viewsCount: 5400,
      adRevenueEstimate: 450,
    }));

    return [archiveLead, ...archiveFeatured, ...MOCK_ARTICLES.filter((_, idx) => idx > 1)];
  }, [loadedArchiveEdition]);

  // Helper to match category aliases (e.g. politics -> national, international -> world, technology -> tech)
  const matchCategory = (artCat: Category, targetCat: Category): boolean => {
    if (targetCat === 'front-page' || targetCat === 'archive' || targetCat === 'partner-program') return true;
    if (targetCat === 'politics' || targetCat === 'national') {
      return artCat === 'politics' || artCat === 'national';
    }
    if (targetCat === 'international' || targetCat === 'world') {
      return artCat === 'international' || artCat === 'world';
    }
    if (targetCat === 'technology' || targetCat === 'tech') {
      return artCat === 'technology' || artCat === 'tech';
    }
    if (targetCat === 'sports') {
      return artCat === 'sports';
    }
    return artCat === targetCat;
  };

  // Pre-calculate count of articles in each category
  const articleCategoryCounts = useMemo(() => {
    const counts: Partial<Record<Category, number>> = {
      'front-page': baseArticles.length,
      politics: 0,
      national: 0,
      sports: 0,
      technology: 0,
      tech: 0,
      international: 0,
      world: 0,
      business: 0,
      opinion: 0,
      arts: 0,
    };

    baseArticles.forEach((art) => {
      if (art.category === 'politics' || art.category === 'national') {
        counts.politics = (counts.politics || 0) + 1;
        counts.national = (counts.national || 0) + 1;
      } else if (art.category === 'international' || art.category === 'world') {
        counts.international = (counts.international || 0) + 1;
        counts.world = (counts.world || 0) + 1;
      } else if (art.category === 'technology' || art.category === 'tech') {
        counts.technology = (counts.technology || 0) + 1;
        counts.tech = (counts.tech || 0) + 1;
      } else {
        counts[art.category] = (counts[art.category] || 0) + 1;
      }
    });

    return counts;
  }, [baseArticles]);

  // Filtered Articles based on category and search query
  const filteredArticles = useMemo(() => {
    let result = baseArticles;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.bengaliTitle && a.bengaliTitle.toLowerCase().includes(q)) ||
          a.author.name.toLowerCase().includes(q) ||
          a.leadParagraph.toLowerCase().includes(q)
      );
    } else if (currentCategory !== 'front-page') {
      if (currentCategory === 'partner-program' || currentCategory === 'archive') {
        return baseArticles;
      }
      result = result.filter((a) => matchCategory(a.category, currentCategory));
    }

    return result;
  }, [baseArticles, currentCategory, searchQuery]);

  // Lead article is either marked leadStory or first article in filtered set
  const leadArticle = useMemo(() => {
    return filteredArticles.find((a) => a.isLeadStory) || filteredArticles[0] || baseArticles[0];
  }, [filteredArticles, baseArticles]);

  const secondaryArticles = useMemo(() => {
    return filteredArticles.filter((a) => a.id !== leadArticle.id);
  }, [filteredArticles, leadArticle]);

  // Handle Quick Share / PPP Affiliate Link
  const handleQuickShare = (article: Article) => {
    const affiliateUrl = `https://provatbarta.com/a/${affiliateUser.affiliateId}/${article.id}?ref=${affiliateUser.referralCode}`;
    navigator.clipboard.writeText(affiliateUrl);
    
    // Simulate share count increment & earnings increment
    setAffiliateUser((prev) => ({
      ...prev,
      totalShares: prev.totalShares + 1,
      todayEarnings: prev.todayEarnings + 2.50,
      totalEarnings: prev.totalEarnings + 2.50,
      availableBalance: prev.availableBalance + 2.50,
    }));

    showToast(`PPP Link Copied! You earned ৳2.50 creator share bonus for "${article.title.slice(0, 32)}..."`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Handle withdrawal submission in PPP modal
  const handleWithdrawal = (amount: number, method: string, account: string) => {
    const newRecord: WithdrawalRecord = {
      id: `w-${Date.now().toString().slice(-4)}`,
      amount,
      method,
      account,
      status: 'pending',
      timestamp: 'Just now',
    };

    setWithdrawals((prev) => [newRecord, ...prev]);
    setAffiliateUser((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance - amount,
      pendingBalance: prev.pendingBalance + amount,
    }));
  };

  const handlePrintPaper = () => {
    window.print();
  };

  // Bookmark / Read Later Toggle
  const handleToggleSaveArticle = (articleOrId: Article | string) => {
    const articleId = typeof articleOrId === 'string' ? articleOrId : articleOrId.id;
    const articleObj = typeof articleOrId === 'string'
      ? baseArticles.find((a) => a.id === articleId) || MOCK_ARTICLES.find((a) => a.id === articleId)
      : articleOrId;

    setSavedArticleIds((prev) => {
      const isAlreadySaved = prev.includes(articleId);
      if (isAlreadySaved) {
        showToast(`Removed "${articleObj ? articleObj.title.slice(0, 30) : 'Article'}..." from Read Later.`);
        return prev.filter((id) => id !== articleId);
      } else {
        showToast(`Bookmarked to Read Later! Synced with your account.`);
        return [...prev, articleId];
      }
    });

    if (articleObj) {
      handleFirestoreToggleBookmark(articleObj);
    }
  };

  const handleClearAllSaved = () => {
    setSavedArticleIds([]);
    showToast('Cleared all articles from Read Later stash.');
  };

  const handleOpenPartnerDashboard = (tab: 'overview' | 'links' | 'withdraw' | 'team' | 'saved' = 'overview') => {
    setPartnerDashboardTab(tab);
    setIsPartnerDashboardOpen(true);
  };

  const handleCategorySelect = (cat: Category) => {
    if (cat === 'partner-program') {
      handleOpenPartnerDashboard('overview');
      return;
    }
    if (cat === 'archive') {
      setIsArchiveOpen(true);
      setCurrentCategory('archive');
      return;
    }
    if (cat === 'puzzles') {
      setCurrentCategory('puzzles');
      setIsPuzzlesModalOpen(true);
      return;
    }
    setCurrentCategory(cat);
    setSearchQuery('');
  };

  // Handle loading an archive edition into the broadsheet
  const handleLoadArchiveEdition = (edition: ArchiveEdition) => {
    setLoadedArchiveEdition(edition);
    setCurrentCategory('front-page');
    setSearchQuery('');
    showToast(`Loaded Archival Edition: ${edition.displayDate} (${edition.volumeNumber})`);
  };

  const handleResetToToday = () => {
    setLoadedArchiveEdition(null);
    showToast("Returned to Today's Live Broadsheet (Saturday, September 5, 2026)");
  };

  return (
    <div className="min-h-screen bg-[#fbf9f4] text-[#181512] flex flex-col selection:bg-[#00204A] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#00204A] text-white px-4 py-3 rounded shadow-xl border-2 border-[#E5000C] text-xs font-dateline flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#FD8B18] flex-shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-white/20 rounded ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Breaking Wire Ticker */}
      <BreakingNewsTicker
        articles={MOCK_ARTICLES}
        onSelectArticle={(art) => setSelectedArticle(art)}
        onTriggerNotification={triggerPushNotification}
        notificationPermission={notificationPermission}
        notificationsEnabled={notificationsEnabled}
        soundEnabled={soundEnabled}
        onRequestPermission={handleRequestNotificationPermission}
        onToggleNotifications={handleToggleNotifications}
        onToggleSound={handleToggleSound}
        onTestNotification={handleTestNotification}
      />

      {/* Top-Level Category Navigation Bar Underneath Ticker */}
      <TopCategoryNav
        currentCategory={currentCategory}
        onSelectCategory={handleCategorySelect}
        languageMode={languageMode}
        articleCounts={articleCategoryCounts}
        onOpenArchive={() => setIsArchiveOpen(true)}
        onOpenPuzzles={handleOpenCrossword}
        onOpenPartner={() => handleOpenPartnerDashboard('overview')}
        isArchiveLoaded={!!loadedArchiveEdition}
      />

      {/* Broadsheet Grand Header */}
      <BroadsheetHeader
        currentCategory={currentCategory}
        onSelectCategory={handleCategorySelect}
        selectedEdition={selectedEdition}
        onSelectEdition={setSelectedEdition}
        languageMode={languageMode}
        onToggleLanguage={() => {
          setLanguageMode((prev) => (prev === 'dual' ? 'en' : prev === 'en' ? 'bn' : 'dual'));
        }}
        onOpenPartnerDashboard={() => handleOpenPartnerDashboard('overview')}
        onOpenSavedArticles={() => handleOpenPartnerDashboard('saved')}
        savedArticlesCount={savedArticleIds.length}
        onOpenArchive={() => setIsArchiveOpen(true)}
        onOpenPuzzles={handleOpenCrossword}
        onPrintPaper={handlePrintPaper}
        weatherList={MOCK_WEATHER}
        marketList={MOCK_MARKETS}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        affiliateEarnings={affiliateUser.availableBalance}
        loadedArchiveDate={loadedArchiveEdition?.displayDate}
        loadedArchiveVolume={loadedArchiveEdition?.volumeNumber}
        onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
        onOpenTranscribe={() => setIsTranscribeOpen(true)}
        onOpenUserAccount={() => setIsUserAccountOpen(true)}
        currentUser={currentUser}
      />

      {/* Historical Archival Edition Alert Banner */}
      {loadedArchiveEdition && (
        <div className="bg-[#00204A] text-white border-b-2 border-[#FD8B18] px-4 py-2.5 shadow-md no-print">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-dateline">
            <div className="flex items-center gap-2.5">
              <span className="bg-[#E5000C] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
                Archival Record
              </span>
              <span className="font-bold text-[#FD8B18] text-sm">
                {loadedArchiveEdition.displayDate}
              </span>
              <span className="text-stone-300 hidden sm:inline">|</span>
              <span className="text-stone-200 hidden md:inline">
                {loadedArchiveEdition.volumeNumber} • {loadedArchiveEdition.editionName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsArchiveOpen(true)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/30 rounded text-white font-semibold transition-colors flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-[#FD8B18]" />
                <span>Change Archive Date</span>
              </button>
              <button
                onClick={handleResetToToday}
                className="px-2.5 py-1 bg-[#FD8B18] hover:bg-[#e0770a] text-[#00204A] font-bold rounded transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Return to Today's Paper</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Newspaper Paper Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* If 'archive' category selected, highlight Archive Section */}
        {currentCategory === 'archive' && (
          <ArchiveSection
            onSelectEdition={handleLoadArchiveEdition}
            onOpenArchiveModal={() => setIsArchiveOpen(true)}
            currentLoadedDate={loadedArchiveEdition?.date || '2026-09-05'}
          />
        )}

        {/* Active Filter Indicator if search active */}
        {searchQuery && (
          <div className="mb-4 bg-stone-200/70 border border-stone-300 p-2.5 rounded flex items-center justify-between text-xs font-dateline">
            <span>
              Showing search results for: <strong>"{searchQuery}"</strong> ({filteredArticles.length} dispatches found)
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="font-bold text-[#E5000C] hover:underline"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Active Section Filter Indicator */}
        {currentCategory !== 'front-page' && currentCategory !== 'archive' && currentCategory !== 'partner-program' && currentCategory !== 'puzzles' && (
          <div className="mb-5 bg-white border border-stone-300 border-l-4 border-l-[#00204A] p-3 rounded-xs shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs font-dateline">
            <div className="flex items-center gap-2.5">
              <span className="bg-[#00204A] text-white px-2 py-0.5 rounded-xs font-bold uppercase tracking-wider text-[10px]">
                Section Feed
              </span>
              <span className="text-sm font-bold text-[#00204A] uppercase tracking-wide">
                {currentCategory === 'politics' || currentCategory === 'national'
                  ? 'Politics & National Affairs'
                  : currentCategory === 'sports'
                  ? 'Sports & Athletics'
                  : currentCategory === 'technology' || currentCategory === 'tech'
                  ? 'Technology & Science'
                  : currentCategory === 'international' || currentCategory === 'world'
                  ? 'International & World Affairs'
                  : currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}
              </span>
              <span className="text-stone-300 hidden sm:inline">•</span>
              <span className="text-stone-600 hidden sm:inline">
                {filteredArticles.length} {filteredArticles.length === 1 ? 'dispatch' : 'dispatches'} published
              </span>
            </div>
            <button
              onClick={() => handleCategorySelect('front-page')}
              className="flex items-center gap-1 text-[11px] font-bold text-[#E5000C] hover:text-[#B30009] hover:underline"
            >
              <span>✕ Return to Front Page</span>
            </button>
          </div>
        )}

        {/* Financial Quotations & Weather Widget */}
        <MarketAndWeatherWidget markets={MOCK_MARKETS} weather={MOCK_WEATHER} />

        {/* Lead Story Package */}
        {leadArticle && (
          <LeadStory
            article={leadArticle}
            languageMode={languageMode}
            onOpenArticle={(art) => setSelectedArticle(art)}
            onQuickShare={handleQuickShare}
            isSaved={savedArticleIds.includes(leadArticle.id)}
            onToggleSave={handleToggleSaveArticle}
          />
        )}

        {/* Secondary Off-Lead Articles Grid */}
        <OffLeadGrid
          articles={secondaryArticles}
          languageMode={languageMode}
          onOpenArticle={(art) => setSelectedArticle(art)}
          onQuickShare={handleQuickShare}
          savedArticleIds={savedArticleIds}
          onToggleSave={handleToggleSaveArticle}
        />

        {/* Dedicated Editorial Board & Opinion Section */}
        <OpinionSection
          articles={MOCK_ARTICLES}
          languageMode={languageMode}
          onOpenArticle={(art) => setSelectedArticle(art)}
          onOpenSubmitTip={() => setIsSubmitTipOpen(true)}
          onQuickShare={handleQuickShare}
          savedArticleIds={savedArticleIds}
          onToggleSave={handleToggleSaveArticle}
        />

        {/* Daily Crossword & Sudoku Interactive Broadsheet Section */}
        <DailyPuzzlesSection
          onOpenCrossword={handleOpenCrossword}
          onOpenSudoku={handleOpenSudoku}
        />

        {/* Inline Archive Browser if on Front Page */}
        {currentCategory === 'front-page' && !loadedArchiveEdition && (
          <ArchiveSection
            onSelectEdition={handleLoadArchiveEdition}
            onOpenArchiveModal={() => setIsArchiveOpen(true)}
            currentLoadedDate="2026-09-05"
          />
        )}

        {/* Provat Partner Program Spotlight Banner */}
        <section className="bg-gradient-to-r from-[#00204A] via-[#002b66] to-[#001838] text-white p-6 sm:p-8 rounded-sm shadow-md border-2 border-[#FD8B18]/40 mb-10 no-print">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6">
            <div className="md:col-span-8 space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#E5000C] text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                  Provat Partner Program (PPP)
                </span>
                <span className="text-amber-300 text-xs font-dateline font-semibold">
                  Share News • Earn Revenue Daily
                </span>
              </div>
              <h3 className="font-headline font-bold text-2xl sm:text-3xl text-white">
                Empower Independent Journalism & Share 50% Ad Revenue
              </h3>
              <p className="font-editorial text-stone-300 text-sm leading-relaxed max-w-2xl">
                The Provat Barta believes in economic democracy for our readers. By sharing verified dispatches with your unique partner link, you receive 50% of ad impressions directly to your mobile wallet (bKash, Nagad) or bank account.
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-2.5 justify-center">
              <button
                onClick={() => handleOpenPartnerDashboard('overview')}
                className="bg-[#FD8B18] hover:bg-[#e0770a] text-[#00204A] px-5 py-3 rounded font-cinzel font-black uppercase tracking-wider text-xs transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4 text-[#00204A]" />
                <span>Open PPP Earnings Portal</span>
              </button>
              <button
                onClick={() => handleQuickShare(leadArticle)}
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-5 py-2.5 rounded font-dateline font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-3.5 h-3.5 text-[#FD8B18]" />
                <span>Share Lead Story Link</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Broadsheet Colophon & Footer */}
      <BroadsheetFooter
        onOpenPartnerDashboard={() => handleOpenPartnerDashboard('overview')}
        onOpenSubmitTip={() => setIsSubmitTipOpen(true)}
        onPrintPaper={handlePrintPaper}
        onOpenArchive={() => setIsArchiveOpen(true)}
        onOpenPuzzles={handleOpenCrossword}
        onOpenSavedArticles={() => handleOpenPartnerDashboard('saved')}
      />

      {/* Interactive Daily Crossword & Sudoku Lounge Modal */}
      {isPuzzlesModalOpen && (
        <DailyPuzzlesModal
          isOpen={isPuzzlesModalOpen}
          onClose={() => setIsPuzzlesModalOpen(false)}
          initialTab={puzzleModalTab}
        />
      )}

      {/* Interactive Archive & Calendar Explorer Modal */}
      {isArchiveOpen && (
        <ArchiveModal
          isOpen={isArchiveOpen}
          onClose={() => setIsArchiveOpen(false)}
          onLoadEditionToFrontPage={handleLoadArchiveEdition}
          currentLoadedDate={loadedArchiveEdition?.date || '2026-09-05'}
        />
      )}

      {/* Interactive Full Article Reader Modal */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onShareArticle={handleQuickShare}
          languageMode={languageMode}
          isSaved={savedArticleIds.includes(selectedArticle.id)}
          onToggleSave={handleToggleSaveArticle}
        />
      )}

      {/* Provat Partner Program Earnings Dashboard Modal */}
      {isPartnerDashboardOpen && (
        <EarningsDashboardModal
          isOpen={isPartnerDashboardOpen}
          onClose={() => setIsPartnerDashboardOpen(false)}
          user={affiliateUser}
          articles={baseArticles}
          withdrawals={withdrawals}
          onWithdraw={handleWithdrawal}
          savedArticleIds={savedArticleIds}
          onToggleSave={(id) => handleToggleSaveArticle(id)}
          onClearAllSaved={handleClearAllSaved}
          onOpenArticle={(art) => setSelectedArticle(art)}
          onShareArticle={handleQuickShare}
          initialTab={partnerDashboardTab}
        />
      )}

      {/* Submit Tip / Letter to Editor Modal */}
      {isSubmitTipOpen && (
        <SubmitTipModal
          isOpen={isSubmitTipOpen}
          onClose={() => {
            setIsSubmitTipOpen(false);
            setTipInitialContent('');
          }}
          onSaveToFirestore={saveNewsTipToFirestore}
          initialContent={tipInitialContent}
        />
      )}

      {/* Live Voice Intelligence Modal (gemini-3.1-flash-live-preview) */}
      <LiveVoiceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
      />

      {/* Audio Transcription Modal (gemini-3.5-transcribe) */}
      <AudioTranscribeModal
        isOpen={isTranscribeOpen}
        onClose={() => setIsTranscribeOpen(false)}
        onUseTranscription={(transcript) => {
          setSearchQuery(transcript);
          showToast(`Applied voice transcript to search: "${transcript.slice(0, 35)}..."`);
        }}
        onSaveToNewsTip={(transcript) => {
          setTipInitialContent(transcript);
          setIsSubmitTipOpen(true);
        }}
      />

      {/* Reader Account & Firebase Cloud Sync Modal */}
      <UserAccountModal
        isOpen={isUserAccountOpen}
        onClose={() => setIsUserAccountOpen(false)}
        currentUser={currentUser}
        onLogin={handleGoogleLogin}
        onLogout={handleGoogleLogout}
        bookmarks={firestoreBookmarks}
        savedTips={savedTipHistory}
        onSelectArticleById={(artId) => {
          const found = baseArticles.find((a) => a.id === artId) || MOCK_ARTICLES.find((a) => a.id === artId);
          if (found) setSelectedArticle(found);
        }}
        onRemoveBookmark={(artId) => {
          const found = baseArticles.find((a) => a.id === artId) || MOCK_ARTICLES.find((a) => a.id === artId) || { id: artId, title: 'Article', category: 'world' } as Article;
          handleToggleSaveArticle(found);
        }}
      />

      {/* Real-time Wire Push Notification Floating Banner */}
      <WireNotificationBanner
        alert={activeInAppAlert}
        onSelectArticle={(art) => setSelectedArticle(art)}
        onDismiss={dismissInAppAlert}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        nativePermission={notificationPermission}
      />
    </div>
  );
}
