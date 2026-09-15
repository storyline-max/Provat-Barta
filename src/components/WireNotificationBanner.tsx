import React, { useEffect } from 'react';
import { AlertCircle, Zap, X, ArrowRight, Bell, Volume2, VolumeX } from 'lucide-react';
import { Article } from '../types';

interface WireNotificationBannerProps {
  alert: {
    article: Article;
    type: 'urgent' | 'breaking';
    timestamp: number;
  } | null;
  onSelectArticle: (article: Article) => void;
  onDismiss: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  nativePermission: string;
}

export const WireNotificationBanner: React.FC<WireNotificationBannerProps> = ({
  alert,
  onSelectArticle,
  onDismiss,
  soundEnabled,
  onToggleSound,
  nativePermission,
}) => {
  useEffect(() => {
    if (!alert) return;

    // Urgent alerts stay longer (14s), Breaking alerts stay 9s
    const timeoutDuration = alert.type === 'urgent' ? 14000 : 9000;
    const timer = setTimeout(() => {
      onDismiss();
    }, timeoutDuration);

    return () => clearTimeout(timer);
  }, [alert, onDismiss]);

  if (!alert) return null;

  const { article, type } = alert;
  const isUrgent = type === 'urgent';

  return (
    <div
      id="wire-push-notification-banner"
      role="alert"
      aria-live="assertive"
      className={`no-print fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] rounded-sm shadow-2xl border-2 transition-all duration-300 transform translate-y-0 ${
        isUrgent
          ? 'bg-[#1a0505] border-[#E5000C] text-stone-100 shadow-red-950/50'
          : 'bg-[#001738] border-[#FD8B18] text-stone-100 shadow-blue-950/50'
      }`}
    >
      {/* Top Accent Line */}
      <div
        className={`h-1 w-full ${
          isUrgent ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 animate-pulse' : 'bg-gradient-to-r from-[#FD8B18] via-amber-300 to-[#E5000C]'
        }`}
      />

      <div className="p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Badge & Dateline */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-widest font-dateline ${
                isUrgent ? 'bg-[#E5000C] text-white animate-pulse' : 'bg-[#FD8B18] text-[#00204A]'
              }`}
            >
              {isUrgent ? <AlertCircle className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
              <span>{isUrgent ? 'Urgent Wire Bulletin' : 'Breaking News Push'}</span>
            </span>

            <span className="text-[10px] font-dateline text-stone-400">
              {article.author.location} • Just now
            </span>
          </div>

          {/* Controls: Sound & Close */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleSound}
              className="p-1 text-stone-400 hover:text-stone-200 transition-colors rounded hover:bg-white/10"
              title={soundEnabled ? 'Mute alert chime' : 'Enable alert chime'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-stone-500" />}
            </button>
            <button
              onClick={onDismiss}
              className="p-1 text-stone-400 hover:text-white transition-colors rounded hover:bg-white/10"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Headline */}
        <h4
          onClick={() => {
            onSelectArticle(article);
            onDismiss();
          }}
          className="mt-2 text-[14px] sm:text-[15px] font-headline font-bold leading-snug cursor-pointer hover:text-amber-300 transition-colors line-clamp-2"
        >
          {article.title}
        </h4>

        {/* Subtitle / Lead snippet */}
        <p className="mt-1 text-[11px] sm:text-[12px] text-stone-300 font-dateline line-clamp-2 leading-relaxed">
          {article.subtitle || article.leadParagraph}
        </p>

        {/* Footer Actions */}
        <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-dateline">
            <Bell className="w-3 h-3 text-[#FD8B18]" />
            <span>Web Push API {nativePermission === 'granted' ? 'Active' : 'Simulated'}</span>
          </div>

          <button
            onClick={() => {
              onSelectArticle(article);
              onDismiss();
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-xs transition-all font-dateline shadow-xs ${
              isUrgent
                ? 'bg-[#E5000C] text-white hover:bg-red-700'
                : 'bg-[#FD8B18] text-[#00204A] hover:bg-amber-400'
            }`}
          >
            <span>Read Bulletin</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
