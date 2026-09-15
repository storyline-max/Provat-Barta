import React, { useState, useEffect, useMemo } from 'react';
import { AffiliateUser, Article, WithdrawalRecord } from '../types';
import { 
  X, Award, DollarSign, Share2, Copy, Check, ArrowDownCircle, 
  ShieldCheck, Wallet, ExternalLink, Users, AlertCircle, 
  Bookmark, Trash2, BookOpen, Clock, Sparkles, Search, ArrowRight 
} from 'lucide-react';

interface EarningsDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AffiliateUser;
  articles: Article[];
  withdrawals: WithdrawalRecord[];
  onWithdraw: (amount: number, method: string, account: string) => void;
  savedArticleIds?: string[];
  onToggleSave?: (articleId: string) => void;
  onClearAllSaved?: () => void;
  onOpenArticle?: (article: Article) => void;
  onShareArticle?: (article: Article) => void;
  initialTab?: 'overview' | 'links' | 'withdraw' | 'team' | 'saved';
}

const BRAND = {
  navy: '#00204A',
  red: '#E5000C',
  gold: '#FD8B18',
};

export const EarningsDashboardModal: React.FC<EarningsDashboardModalProps> = ({
  isOpen,
  onClose,
  user,
  articles,
  withdrawals,
  onWithdraw,
  savedArticleIds = [],
  onToggleSave,
  onClearAllSaved,
  onOpenArticle,
  onShareArticle,
  initialTab = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'links' | 'withdraw' | 'team' | 'saved'>(initialTab);
  const [selectedArticleId, setSelectedArticleId] = useState<string>(articles[0]?.id || '');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('whatsapp');
  const [copiedLink, setCopiedLink] = useState(false);

  // Saved Section Search & Category Filter
  const [savedSearchQuery, setSavedSearchQuery] = useState('');
  const [savedCategoryFilter, setSavedCategoryFilter] = useState<string>('all');

  // Withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState<string>('1000');
  const [withdrawMethod, setWithdrawMethod] = useState<'bkash' | 'nagad' | 'bank'>('bkash');
  const [withdrawAccount, setWithdrawAccount] = useState<string>(user.paymentAccount);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Derived Saved Articles List
  const savedArticles = useMemo(() => {
    return articles.filter((art) => savedArticleIds.includes(art.id));
  }, [articles, savedArticleIds]);

  const filteredSavedArticles = useMemo(() => {
    return savedArticles.filter((art) => {
      const matchesCategory = savedCategoryFilter === 'all' || art.category === savedCategoryFilter;
      const q = savedSearchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        art.title.toLowerCase().includes(q) ||
        (art.bengaliTitle && art.bengaliTitle.toLowerCase().includes(q)) ||
        art.author.name.toLowerCase().includes(q) ||
        art.leadParagraph.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [savedArticles, savedCategoryFilter, savedSearchQuery]);

  const totalSavedReadTime = useMemo(() => {
    return savedArticles.reduce((acc, a) => acc + (a.readTimeMinutes || 3), 0);
  }, [savedArticles]);

  const selectedArticle = articles.find((a) => a.id === selectedArticleId) || articles[0];
  const generatedAffiliateUrl = `https://provatbarta.com/a/${user.affiliateId}/${selectedArticle?.id || 'lead'}?src=${selectedPlatform}&ref=${user.referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedAffiliateUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawSuccess(null);

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawError('Please enter a valid withdrawal amount.');
      return;
    }
    if (amount > user.availableBalance) {
      setWithdrawError(`Amount exceeds your available balance of ৳${user.availableBalance.toFixed(2)}.`);
      return;
    }
    if (amount < 50) {
      setWithdrawError('Minimum withdrawal is ৳50.00 for mobile wallets.');
      return;
    }

    onWithdraw(amount, withdrawMethod.toUpperCase(), withdrawAccount);
    setWithdrawSuccess(`Withdrawal request for ৳${amount.toFixed(2)} via ${withdrawMethod.toUpperCase()} submitted successfully! Status: Processing.`);
    setWithdrawAmount('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs no-print">
      <div className="bg-[#fbf9f4] border-2 border-[#00204A] rounded-md shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-stone-900 font-editorial">
        {/* Header */}
        <div className="bg-[#00204A] text-white p-4 flex items-center justify-between border-b-2 border-[#E5000C]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center border border-white/20">
              <Award className="w-5 h-5 text-[#FD8B18]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-cinzel font-bold text-base tracking-wider">
                  Provat Partner Program (PPP)
                </h3>
                <span className="bg-[#E5000C] text-white text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-widest">
                  Verified Creator
                </span>
              </div>
              <p className="text-[11px] font-dateline text-stone-300">
                Member: <strong className="text-white">{user.name}</strong> • ID: {user.affiliateId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded transition-colors text-stone-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-stone-200/80 border-b border-stone-300 px-4 flex items-center gap-1 sm:gap-4 overflow-x-auto text-[12px] font-dateline font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-2 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-[#00204A] text-[#00204A]'
                : 'border-transparent text-stone-600 hover:text-[#00204A]'
            }`}
          >
            Overview & Stats
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`py-2.5 px-2 border-b-2 transition-colors ${
              activeTab === 'links'
                ? 'border-[#00204A] text-[#00204A]'
                : 'border-transparent text-stone-600 hover:text-[#00204A]'
            }`}
          >
            Link Generator
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`py-2.5 px-2 border-b-2 transition-colors ${
              activeTab === 'withdraw'
                ? 'border-[#00204A] text-[#00204A]'
                : 'border-transparent text-stone-600 hover:text-[#00204A]'
            }`}
          >
            Payout & Wallets
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`py-2.5 px-2 border-b-2 transition-colors ${
              activeTab === 'team'
                ? 'border-[#00204A] text-[#00204A]'
                : 'border-transparent text-stone-600 hover:text-[#00204A]'
            }`}
          >
            Referral Network
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`py-2.5 px-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'border-[#00204A] text-[#00204A]'
                : 'border-transparent text-stone-600 hover:text-[#00204A]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-[#E5000C]" />
            <span>Saved ({savedArticles.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Primary Balance Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white border-2 border-[#00204A] p-3.5 rounded-sm">
                  <span className="text-[10px] font-dateline font-bold text-stone-500 uppercase tracking-wider block">
                    Total Lifetime Earnings
                  </span>
                  <div className="text-2xl font-headline font-bold text-[#00204A] mt-1">
                    ৳{user.totalEarnings.toFixed(2)}
                  </div>
                  <span className="text-[10px] font-dateline text-emerald-700 font-semibold">
                    ~${(user.totalEarnings / 121.4).toFixed(2)} USD
                  </span>
                </div>

                <div className="bg-white border-2 border-emerald-700 p-3.5 rounded-sm">
                  <span className="text-[10px] font-dateline font-bold text-stone-500 uppercase tracking-wider block">
                    Available for Withdrawal
                  </span>
                  <div className="text-2xl font-headline font-bold text-emerald-700 mt-1">
                    ৳{user.availableBalance.toFixed(2)}
                  </div>
                  <button
                    onClick={() => setActiveTab('withdraw')}
                    className="text-[10px] font-dateline font-bold text-[#E5000C] hover:underline mt-1 inline-block uppercase"
                  >
                    Withdraw Funds →
                  </button>
                </div>

                <div className="bg-white border border-stone-300 p-3.5 rounded-sm">
                  <span className="text-[10px] font-dateline font-bold text-stone-500 uppercase tracking-wider block">
                    Pending Verification
                  </span>
                  <div className="text-2xl font-headline font-bold text-amber-700 mt-1">
                    ৳{user.pendingBalance.toFixed(2)}
                  </div>
                  <span className="text-[10px] font-dateline text-stone-500">
                    Settles in 24h fraud screen
                  </span>
                </div>
              </div>

              {/* Time Range Stats */}
              <div className="bg-white border border-stone-300 p-4 rounded-sm">
                <h4 className="text-[11px] font-dateline font-bold uppercase tracking-wider text-[#00204A] mb-3">
                  Earnings Velocity & Engagement
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center border-t border-stone-200 pt-3">
                  <div>
                    <span className="text-[10px] font-dateline text-stone-500 uppercase">Today</span>
                    <span className="block font-headline font-bold text-base text-stone-900">
                      ৳{user.todayEarnings.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-dateline text-stone-500 uppercase">This Week</span>
                    <span className="block font-headline font-bold text-base text-stone-900">
                      ৳{user.weekEarnings.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-dateline text-stone-500 uppercase">This Month</span>
                    <span className="block font-headline font-bold text-base text-stone-900">
                      ৳{user.monthEarnings.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-dateline text-stone-500 uppercase">Total Clicks</span>
                    <span className="block font-headline font-bold text-base text-stone-900">
                      {user.totalClicks.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-dateline text-stone-500 uppercase">Total Shares</span>
                    <span className="block font-headline font-bold text-base text-stone-900">
                      {user.totalShares}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Performing Articles */}
              <div className="bg-white border border-stone-300 p-4 rounded-sm">
                <h4 className="text-[11px] font-dateline font-bold uppercase tracking-wider text-[#00204A] mb-2 flex items-center justify-between">
                  <span>Top Performing Shared Articles</span>
                  <span className="text-stone-500 text-[10px]">50% Ad Revenue Share</span>
                </h4>
                <div className="divide-y divide-stone-200">
                  {articles.slice(0, 4).map((art, i) => (
                    <div key={art.id} className="py-2 flex items-center justify-between text-[13px]">
                      <div className="pr-4 truncate flex-1">
                        <span className="font-bold text-[#00204A] mr-1.5">{i + 1}.</span>
                        <span className="font-headline font-medium text-stone-900">{art.title}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 font-dateline">
                        <span className="text-stone-500 text-[11px]">{art.sharesCount} shares</span>
                        <strong className="text-emerald-700 font-bold">
                          ৳{(art.adRevenueEstimate * 0.5).toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Link Generator */}
          {activeTab === 'links' && (
            <div className="bg-white border border-stone-300 p-5 rounded-sm space-y-4">
              <div>
                <h4 className="font-cinzel font-bold text-base text-[#00204A]">
                  Trackable Affiliate Link Generator
                </h4>
                <p className="text-[12px] font-dateline text-stone-600 mt-1">
                  Select any Provat Barta news dispatch, choose your distribution platform, and share. Every verified reader who views the article credits 50% of display ad earnings to your balance.
                </p>
              </div>

              {/* Article Selector */}
              <div>
                <label className="block text-[11px] font-dateline font-bold uppercase text-stone-700 mb-1">
                  Select Dispatch:
                </label>
                <select
                  value={selectedArticleId}
                  onChange={(e) => setSelectedArticleId(e.target.value)}
                  className="w-full p-2 text-[12px] border border-stone-300 rounded bg-stone-50 font-editorial text-stone-900"
                >
                  {articles.map((art) => (
                    <option key={art.id} value={art.id}>
                      [{art.category.toUpperCase()}] {art.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Platform Selector */}
              <div>
                <label className="block text-[11px] font-dateline font-bold uppercase text-stone-700 mb-1">
                  Target Social Channel:
                </label>
                <div className="flex flex-wrap gap-2">
                  {['whatsapp', 'facebook', 'twitter', 'telegram', 'linkedin'].map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setSelectedPlatform(plat)}
                      className={`px-3 py-1 rounded text-[11px] font-dateline font-bold uppercase tracking-wider transition-colors ${
                        selectedPlatform === plat
                          ? 'bg-[#00204A] text-white'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generated URL Box */}
              <div className="bg-stone-100 border border-stone-300 p-3 rounded space-y-2">
                <span className="text-[10px] font-dateline font-bold uppercase text-stone-600 block">
                  Your Personalized Tracking URL
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedAffiliateUrl}
                    className="flex-1 bg-white border border-stone-300 px-3 py-1.5 rounded text-[11px] font-mono text-stone-800 select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 bg-[#00204A] hover:bg-[#00306e] text-white px-3 py-1.5 rounded text-[11px] font-dateline font-bold uppercase transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Withdrawal & Payouts */}
          {activeTab === 'withdraw' && (
            <div className="space-y-5">
              <div className="bg-white border border-stone-300 p-5 rounded-sm">
                <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-4">
                  <h4 className="font-cinzel font-bold text-base text-[#00204A]">
                    Request Revenue Payout
                  </h4>
                  <div className="text-[12px] font-dateline text-stone-600">
                    Available Balance: <strong className="text-emerald-700">৳{user.availableBalance.toFixed(2)}</strong>
                  </div>
                </div>

                {withdrawSuccess && (
                  <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded text-[12px] font-dateline">
                    {withdrawSuccess}
                  </div>
                )}

                {withdrawError && (
                  <div className="mb-4 bg-rose-50 border border-rose-300 text-[#E5000C] p-3 rounded text-[12px] font-dateline">
                    {withdrawError}
                  </div>
                )}

                <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-dateline font-bold uppercase text-stone-700 mb-1">
                      Select Payment Method:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'bkash', name: 'bKash Wallet' },
                        { id: 'nagad', name: 'Nagad Wallet' },
                        { id: 'bank', name: 'Bank Transfer' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setWithdrawMethod(m.id as any)}
                          className={`py-2 px-3 border rounded text-[12px] font-dateline font-bold text-center transition-colors ${
                            withdrawMethod === m.id
                              ? 'border-[#00204A] bg-[#00204A] text-white'
                              : 'border-stone-300 bg-stone-50 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-dateline font-bold uppercase text-stone-700 mb-1">
                        Amount to Withdraw (BDT ৳):
                      </label>
                      <input
                        type="number"
                        min="50"
                        max={user.availableBalance}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full p-2 text-[13px] border border-stone-300 rounded bg-white text-stone-900 font-bold focus:ring-1 focus:ring-[#00204A]"
                        placeholder="e.g. 1000"
                      />
                      <span className="text-[10px] text-stone-500 font-dateline">
                        Min: ৳50.00 • Instant MFS Transfer
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-dateline font-bold uppercase text-stone-700 mb-1">
                        Account / Mobile Number:
                      </label>
                      <input
                        type="text"
                        value={withdrawAccount}
                        onChange={(e) => setWithdrawAccount(e.target.value)}
                        className="w-full p-2 text-[13px] border border-stone-300 rounded bg-white text-stone-900 focus:ring-1 focus:ring-[#00204A]"
                        placeholder="+880 17..."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#E5000C] hover:bg-[#c4000a] text-white py-2.5 rounded font-cinzel font-bold uppercase tracking-wider text-xs transition-colors shadow-xs"
                  >
                    Confirm Withdrawal Request
                  </button>
                </form>
              </div>

              {/* Past Transactions */}
              <div className="bg-white border border-stone-300 p-4 rounded-sm">
                <h4 className="text-[11px] font-dateline font-bold uppercase tracking-wider text-[#00204A] mb-2">
                  Recent Payout History
                </h4>
                <div className="divide-y divide-stone-200 text-[12px] font-dateline">
                  {withdrawals.map((w) => (
                    <div key={w.id} className="py-2 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-stone-900">{w.method}</span>
                        <span className="text-stone-500 ml-2">({w.account})</span>
                        <span className="text-stone-400 text-[11px] block">{w.timestamp}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-stone-900 block">৳{w.amount.toFixed(2)}</span>
                        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {w.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Referral Network */}
          {activeTab === 'team' && (
            <div className="bg-white border border-stone-300 p-5 rounded-sm space-y-4">
              <div>
                <h4 className="font-cinzel font-bold text-base text-[#00204A]">
                  Referral Program & Team Commission
                </h4>
                <p className="text-[12px] font-dateline text-stone-600 mt-1">
                  Invite friends, students, and community writers to join the Provat Partner Program. Earn a 10% override on all direct referrals plus ৳10 signup credit for each verified participant.
                </p>
              </div>

              <div className="bg-amber-50/80 border border-amber-300 p-4 rounded">
                <span className="text-[11px] font-dateline font-bold uppercase text-[#00204A] block mb-1">
                  Your Exclusive Referral Code
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-lg text-[#00204A] tracking-wider bg-white px-3 py-1 rounded border border-amber-200">
                    {user.referralCode}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(user.referralCode);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="bg-[#00204A] hover:bg-[#00306e] text-white text-[11px] font-dateline font-bold uppercase px-3 py-1.5 rounded"
                  >
                    {copiedLink ? 'Copied' : 'Copy Code'}
                  </button>
                </div>
              </div>

              <div className="border border-stone-200 rounded p-3 text-[12px] font-dateline text-stone-700 space-y-2">
                <div className="flex items-center gap-2 text-stone-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Fraud Screening & Anti-Abuse Standards</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-normal">
                  All traffic is monitored against self-click abuse, automated bots, and proxy farms. Payouts are guaranteed within 24 hours for verified impressions.
                </p>
              </div>
            </div>
          )}

          {/* Tab 5: Saved (Read Later) */}
          {activeTab === 'saved' && (
            <div className="space-y-4">
              {/* Header Card */}
              <div className="bg-white border border-stone-300 p-4 rounded-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-[#00204A] text-[#FD8B18] rounded">
                        <Bookmark className="w-4 h-4 fill-current" />
                      </div>
                      <h4 className="font-cinzel font-bold text-base text-[#00204A]">
                        Creator Reading Stash & Research Desk
                      </h4>
                    </div>
                    <p className="text-[12px] font-dateline text-stone-600 mt-1">
                      Articles bookmarked for later reading, editorial research, and syndication with your Provat Partner referral code.
                    </p>
                  </div>

                  {savedArticles.length > 0 && onClearAllSaved && (
                    <button
                      onClick={onClearAllSaved}
                      className="text-[11px] font-dateline font-semibold text-stone-500 hover:text-[#E5000C] transition-colors flex items-center gap-1 border border-stone-200 hover:border-stone-300 px-2 py-1 rounded"
                      title="Remove all saved articles from Read Later"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All Saved</span>
                    </button>
                  )}
                </div>

                {/* Metrics Summary Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-stone-50 border border-stone-200 p-2.5 rounded-sm">
                    <span className="text-[10px] font-dateline font-bold uppercase text-stone-500 tracking-wider block">
                      Saved Dispatches
                    </span>
                    <span className="text-xl font-headline font-bold text-[#00204A]">
                      {savedArticles.length} {savedArticles.length === 1 ? 'Article' : 'Articles'}
                    </span>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 p-2.5 rounded-sm">
                    <span className="text-[10px] font-dateline font-bold uppercase text-stone-500 tracking-wider block">
                      Estimated Read Time
                    </span>
                    <span className="text-xl font-headline font-bold text-stone-800 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-stone-400" />
                      ~{totalSavedReadTime} Minutes
                    </span>
                  </div>

                  <div className="bg-stone-50 border border-stone-200 p-2.5 rounded-sm">
                    <span className="text-[10px] font-dateline font-bold uppercase text-stone-500 tracking-wider block">
                      Potential Partner Rewards
                    </span>
                    <span className="text-xl font-headline font-bold text-emerald-700">
                      ৳{(savedArticles.length * 25).toFixed(0)} <span className="text-[11px] font-normal text-stone-500 font-dateline">est. BDT</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Filters & Search Row (Only when items exist) */}
              {savedArticles.length > 0 && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-stone-100/80 p-2.5 rounded border border-stone-200 text-xs font-dateline">
                  {/* Category Filter Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider whitespace-nowrap mr-1">
                      Filter:
                    </span>
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'national', label: 'National' },
                      { id: 'world', label: 'World' },
                      { id: 'business', label: 'Business' },
                      { id: 'opinion', label: 'Opinion' },
                      { id: 'tech', label: 'Tech' },
                      { id: 'arts', label: 'Arts' },
                      { id: 'sports', label: 'Sports' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSavedCategoryFilter(cat.id)}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap transition-colors ${
                          savedCategoryFilter === cat.id
                            ? 'bg-[#00204A] text-white shadow-2xs'
                            : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Search within Saved */}
                  <div className="relative min-w-[170px]">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={savedSearchQuery}
                      onChange={(e) => setSavedSearchQuery(e.target.value)}
                      placeholder="Filter saved..."
                      className="w-full pl-8 pr-2.5 py-1 bg-white border border-stone-300 rounded text-[11px] text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#00204A]"
                    />
                  </div>
                </div>
              )}

              {/* Saved Articles List */}
              {savedArticles.length === 0 ? (
                /* Empty State */
                <div className="bg-white border border-stone-300 p-8 rounded-sm text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-[#FD8B18] flex items-center justify-center mx-auto">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <h4 className="font-cinzel font-bold text-lg text-[#00204A]">
                    Your Reading Stash is Empty
                  </h4>
                  <p className="text-[13px] font-dateline text-stone-600 max-w-md mx-auto leading-relaxed">
                    Bookmark dispatches across today's newspaper or the historical archive by clicking the <strong>"Read Later"</strong> or bookmark icon. They will be stored here for convenient offline reading, research, and quick PPP link generation.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={onClose}
                      className="bg-[#00204A] hover:bg-[#00306e] text-white text-xs font-dateline font-bold uppercase tracking-wider px-4 py-2 rounded shadow-2xs inline-flex items-center gap-1.5"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Browse Front Page Stories</span>
                    </button>
                  </div>
                </div>
              ) : filteredSavedArticles.length === 0 ? (
                /* Filtered Empty State */
                <div className="bg-white border border-stone-300 p-6 rounded text-center space-y-2">
                  <p className="text-sm font-dateline text-stone-600">
                    No saved articles match your current filter <strong>"{savedSearchQuery}"</strong>.
                  </p>
                  <button
                    onClick={() => {
                      setSavedSearchQuery('');
                      setSavedCategoryFilter('all');
                    }}
                    className="text-xs font-bold text-[#00204A] hover:underline uppercase tracking-wider"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                /* List of Saved Article Cards */
                <div className="space-y-3">
                  {filteredSavedArticles.map((art) => (
                    <div
                      key={art.id}
                      className="bg-white border border-stone-300 hover:border-[#00204A]/60 p-3.5 rounded-sm transition-all shadow-2xs flex flex-col sm:flex-row gap-4"
                    >
                      {/* Thumbnail */}
                      <div
                        onClick={() => {
                          onOpenArticle?.(art);
                          onClose();
                        }}
                        className="w-full sm:w-40 h-28 shrink-0 overflow-hidden rounded-xs border border-stone-200 bg-stone-100 cursor-pointer relative group"
                      >
                        <img
                          src={art.imageUrl}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-1.5 left-1.5 bg-[#00204A]/90 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-2xs">
                          {art.category}
                        </span>
                      </div>

                      {/* Content & Actions */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          {/* Byline and Read Time */}
                          <div className="flex items-center justify-between text-[11px] font-dateline text-stone-500 mb-1">
                            <span className="font-semibold text-stone-700">By {art.author.name} • {art.author.location}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {art.readTimeMinutes} min read
                            </span>
                          </div>

                          {/* Bilingual Title */}
                          {art.bengaliTitle && (
                            <h5
                              onClick={() => {
                                onOpenArticle?.(art);
                                onClose();
                              }}
                              className="font-bengali font-bold text-sm sm:text-base text-[#00204A] hover:text-[#E5000C] cursor-pointer transition-colors leading-snug line-clamp-1"
                            >
                              {art.bengaliTitle}
                            </h5>
                          )}
                          <h4
                            onClick={() => {
                              onOpenArticle?.(art);
                              onClose();
                            }}
                            className="font-headline font-bold text-base sm:text-lg text-stone-900 hover:text-[#00204A] cursor-pointer transition-colors leading-snug line-clamp-2"
                          >
                            {art.title}
                          </h4>

                          {/* Excerpt */}
                          <p className="font-editorial text-[13px] text-stone-600 line-clamp-2 mt-1 leading-normal">
                            {art.leadParagraph}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="border-t border-stone-200 pt-2.5 mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-dateline">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                onOpenArticle?.(art);
                                onClose();
                              }}
                              className="bg-[#00204A] hover:bg-[#00306e] text-white px-3 py-1 rounded font-bold uppercase tracking-wider text-[11px] transition-colors flex items-center gap-1 shadow-2xs"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Read Article</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedArticleId(art.id);
                                setActiveTab('links');
                              }}
                              className="bg-amber-100 hover:bg-amber-200 text-[#00204A] border border-amber-300 px-2.5 py-1 rounded font-bold uppercase tracking-wider text-[11px] transition-colors flex items-center gap-1"
                              title="Generate customized PPP affiliate tracking link"
                            >
                              <Share2 className="w-3 h-3 text-[#E5000C]" />
                              <span>Create PPP Link</span>
                            </button>

                            {onShareArticle && (
                              <button
                                onClick={() => onShareArticle(art)}
                                className="text-stone-600 hover:text-[#00204A] px-2 py-1 rounded text-[11px] font-semibold transition-colors border border-stone-200 hover:bg-stone-100"
                                title="Quick share & earn ৳2.50 bonus"
                              >
                                Quick Share
                              </button>
                            )}
                          </div>

                          <button
                            onClick={() => onToggleSave?.(art.id)}
                            className="text-stone-400 hover:text-[#E5000C] p-1.5 rounded transition-colors flex items-center gap-1 text-[11px]"
                            title="Remove from Read Later"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-100 border-t border-stone-300 p-3 px-5 flex items-center justify-between text-[11px] font-dateline text-stone-500">
          <span>Provat Barta Media Group • Editorial Revenue Sharing</span>
          <button
            onClick={onClose}
            className="text-stone-700 hover:text-[#00204A] font-bold uppercase tracking-wider"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
