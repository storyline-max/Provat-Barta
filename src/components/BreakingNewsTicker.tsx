import React, { useState, useEffect, useRef } from 'react';
import {
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Pause,
  Play,
  Bell,
  BellRing,
  BellOff,
  Volume2,
  VolumeX,
  Zap,
  Sparkles,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Article } from '../types';

interface BreakingNewsTickerProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  onTriggerNotification?: (article: Article) => void;
  notificationPermission?: string;
  notificationsEnabled?: boolean;
  soundEnabled?: boolean;
  onRequestPermission?: () => void;
  onToggleNotifications?: () => void;
  onToggleSound?: () => void;
  onTestNotification?: () => void;
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({
  articles,
  onSelectArticle,
  onTriggerNotification,
  notificationPermission = 'default',
  notificationsEnabled = true,
  soundEnabled = true,
  onRequestPermission,
  onToggleNotifications,
  onToggleSound,
  onTestNotification,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isBellMenuOpen, setIsBellMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter or prioritize breaking/urgent stories in ticker rotation
  const headlines = React.useMemo(() => {
    const priority = articles.filter(
      (a) => a.isBreaking || a.isUrgent || a.urgencyLevel === 'urgent' || a.urgencyLevel === 'breaking'
    );
    const others = articles.filter(
      (a) => !a.isBreaking && !a.isUrgent && a.urgencyLevel !== 'urgent' && a.urgencyLevel !== 'breaking'
    );
    const combined = [...priority, ...others];
    return combined.slice(0, 8);
  }, [articles]);

  const current = headlines[currentIndex] || headlines[0];

  // Auto-cycle headlines every 7 seconds when not paused
  useEffect(() => {
    if (isPaused || headlines.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % headlines.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [isPaused, headlines.length]);

  // When current headline changes, trigger push notification if marked Urgent or Breaking
  useEffect(() => {
    if (!current) return;
    const isUrgent = !!(current.isUrgent || current.urgencyLevel === 'urgent');
    const isBreaking = !!(current.isBreaking || current.urgencyLevel === 'breaking');

    if ((isUrgent || isBreaking) && onTriggerNotification) {
      onTriggerNotification(current);
    }
  }, [current, onTriggerNotification]);

  // Close bell popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsBellMenuOpen(false);
      }
    };
    if (isBellMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isBellMenuOpen]);

  const nextHeadline = () => {
    setCurrentIndex((prev) => (prev + 1) % headlines.length);
  };

  const prevHeadline = () => {
    setCurrentIndex((prev) => (prev - 1 + headlines.length) % headlines.length);
  };

  const isCurrentUrgent = current?.isUrgent || current?.urgencyLevel === 'urgent';
  const isCurrentBreaking = current?.isBreaking || current?.urgencyLevel === 'breaking';

  return (
    <div
      id="breaking-news-ticker-container"
      className="bg-[#001738] text-white text-[12px] font-dateline border-b border-[#000f24] relative z-40 no-print"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Ticker Flag & Headline */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 overflow-hidden min-w-0">
          {/* Dynamic Wire Flag Badge */}
          {isCurrentUrgent ? (
            <div className="flex items-center gap-1 bg-[#E5000C] text-white px-2 py-0.5 rounded-xs font-bold text-[10px] tracking-wider uppercase flex-shrink-0 animate-pulse shadow-xs">
              <AlertCircle className="w-3 h-3" />
              <span>Urgent Wire</span>
            </div>
          ) : isCurrentBreaking ? (
            <div className="flex items-center gap-1 bg-[#FD8B18] text-[#00204A] px-2 py-0.5 rounded-xs font-bold text-[10px] tracking-wider uppercase flex-shrink-0 shadow-xs">
              <Zap className="w-3 h-3 fill-current" />
              <span>Breaking Wire</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-stone-700 text-stone-200 px-2 py-0.5 rounded-xs font-bold text-[10px] tracking-wider uppercase flex-shrink-0">
              <span>News Wire</span>
            </div>
          )}

          {/* Current Headline Text */}
          {current && (
            <div
              onClick={() => onSelectArticle(current)}
              className="cursor-pointer truncate hover:text-amber-300 transition-colors flex items-center gap-2 min-w-0"
              title={`Read: ${current.title}`}
            >
              <span className="font-semibold truncate">{current.title}</span>
              <span className="text-stone-400 text-[11px] hidden md:inline flex-shrink-0">
                — {current.author.location}
              </span>
            </div>
          )}
        </div>

        {/* Right: Notification Toggle + Navigation Controls */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 text-stone-300 text-[11px]">
          {/* Push Notification Trigger / Bell Menu */}
          <div className="relative" ref={menuRef}>
            <button
              id="wire-notification-bell-btn"
              onClick={() => setIsBellMenuOpen((prev) => !prev)}
              className={`relative p-1 rounded transition-colors flex items-center gap-1 ${
                notificationsEnabled && notificationPermission === 'granted'
                  ? 'text-[#FD8B18] hover:bg-white/10'
                  : notificationPermission === 'denied'
                  ? 'text-stone-500 hover:text-stone-300 hover:bg-white/10'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
              title="Real-Time Push Notifications Settings"
              aria-label="Toggle Push Notifications Settings"
            >
              {notificationsEnabled && notificationPermission === 'granted' ? (
                <BellRing className="w-3.5 h-3.5" />
              ) : notificationPermission === 'denied' ? (
                <BellOff className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Bell className="w-3.5 h-3.5" />
              )}
              <span className="hidden xl:inline text-[10px] font-semibold">Push Wire</span>
            </button>

            {/* Notification Settings Popover */}
            {isBellMenuOpen && (
              <div
                id="wire-notifications-popover"
                className="absolute right-0 top-full mt-1.5 w-72 bg-[#001f4d] border border-stone-600/80 rounded-sm shadow-2xl p-3 text-stone-200 z-50 text-left font-sans"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#FD8B18]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                      Web Push Notifications
                    </span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase font-bold ${
                      notificationPermission === 'granted'
                        ? 'bg-emerald-900/70 text-emerald-300 border border-emerald-500/40'
                        : notificationPermission === 'denied'
                        ? 'bg-red-900/70 text-red-300 border border-red-500/40'
                        : 'bg-amber-900/70 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {notificationPermission}
                  </span>
                </div>

                <p className="text-[11px] text-stone-300 leading-relaxed mt-2 font-dateline">
                  Receive instant system push notifications when the news ticker displays urgent or breaking bulletins.
                </p>

                {/* Enable/Disable Toggle */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between p-1.5 bg-white/5 rounded border border-white/5">
                    <span className="text-[11px] font-medium text-stone-200">Push Alerts</span>
                    <button
                      onClick={onToggleNotifications}
                      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                        notificationsEnabled ? 'bg-[#FD8B18]' : 'bg-stone-600'
                      }`}
                      aria-label="Toggle Push Alerts"
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          notificationsEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Audio Chime Toggle */}
                  <div className="flex items-center justify-between p-1.5 bg-white/5 rounded border border-white/5">
                    <span className="text-[11px] font-medium text-stone-200 flex items-center gap-1">
                      {soundEnabled ? <Volume2 className="w-3 h-3 text-[#FD8B18]" /> : <VolumeX className="w-3 h-3 text-stone-400" />}
                      <span>Wire Audio Chime</span>
                    </span>
                    <button
                      onClick={onToggleSound}
                      className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                        soundEnabled ? 'bg-[#FD8B18]' : 'bg-stone-600'
                      }`}
                      aria-label="Toggle Audio Chime"
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          soundEnabled ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Browser Permission Request Button if not granted */}
                {notificationPermission !== 'granted' && onRequestPermission && (
                  <button
                    onClick={() => {
                      onRequestPermission();
                      setIsBellMenuOpen(false);
                    }}
                    className="w-full mt-3 py-1 px-2.5 bg-[#FD8B18] text-[#00204A] hover:bg-amber-400 rounded font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Grant Browser Permission</span>
                  </button>
                )}

                {/* Send Test Notification Button */}
                {onTestNotification && (
                  <button
                    onClick={() => {
                      onTestNotification();
                    }}
                    className="w-full mt-2 py-1 px-2.5 bg-white/10 hover:bg-white/20 text-white rounded font-medium text-[11px] transition-colors flex items-center justify-center gap-1.5 border border-white/15"
                  >
                    <Sparkles className="w-3 h-3 text-[#FD8B18]" />
                    <span>Send Test Wire Flash</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pause / Play Auto-cycle */}
          <button
            onClick={() => setIsPaused((prev) => !prev)}
            className="p-1 hover:text-white transition-colors hover:bg-white/10 rounded hidden sm:inline-flex"
            title={isPaused ? 'Resume auto ticker' : 'Pause ticker'}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>

          {/* Index Counter */}
          <span className="tabular-nums text-[10px] hidden sm:inline">
            {currentIndex + 1}/{headlines.length}
          </span>

          {/* Prev / Next Navigation */}
          <button
            onClick={prevHeadline}
            className="p-1 hover:text-white transition-colors hover:bg-white/10 rounded"
            title="Previous bulletin"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={nextHeadline}
            className="p-1 hover:text-white transition-colors hover:bg-white/10 rounded"
            title="Next bulletin"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
