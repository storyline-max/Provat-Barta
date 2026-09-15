import React from 'react';
import {
  User as UserIcon,
  LogOut,
  Bookmark,
  FileText,
  X,
  ExternalLink,
  Trash2,
  Calendar,
  CheckCircle2,
  Shield,
  Sparkles,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { SavedBookmark, UserNewsTip } from '../hooks/useFirebaseAuth';
import { Article } from '../types';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogin: () => void;
  onLogout: () => void;
  bookmarks: SavedBookmark[];
  savedTips: UserNewsTip[];
  onSelectArticleById: (articleId: string) => void;
  onRemoveBookmark: (articleId: string) => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  bookmarks,
  savedTips,
  onSelectArticleById,
  onRemoveBookmark,
}) => {
  const [activeTab, setActiveTab] = React.useState<'bookmarks' | 'tips'>('bookmarks');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-account-title"
    >
      <div className="bg-[#fcfaf7] text-stone-900 w-full max-w-lg rounded-sm shadow-2xl border-2 border-stone-400 overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="bg-[#00204A] text-white p-4 border-b border-[#001738] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-white/10 text-white">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 id="user-account-title" className="text-sm font-bold uppercase tracking-wider font-dateline">
                Reader Account & Cloud Storage
              </h3>
              <p className="text-[11px] text-stone-300 font-dateline">
                Google Authentication & Firebase Cloud Firestore Persistence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white rounded transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Status / Login Block */}
        <div className="p-5 border-b border-stone-300 bg-stone-100">
          {currentUser ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-12 h-12 rounded-full border-2 border-[#00204A] shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#00204A] text-white flex items-center justify-center font-bold text-lg">
                    {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm text-[#00204A] font-headline">
                    {currentUser.displayName || 'Verified Reader'}
                  </h4>
                  <p className="text-xs text-stone-600 font-dateline">{currentUser.email}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold font-dateline mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Firebase Auth & Firestore Synced</span>
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onLogout();
                }}
                className="px-3 py-1.5 border border-stone-300 hover:bg-stone-200 text-stone-700 text-xs font-bold font-dateline rounded-xs flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-3">
              <p className="text-sm font-headline text-stone-800 font-semibold">
                Sign in to synchronize your reading list and dispatches across devices
              </p>
              <p className="text-xs text-stone-600 font-dateline mt-1 mb-4">
                Securely persist bookmarked dispatches and submitted investigative news tips in Firebase Firestore.
              </p>
              <button
                onClick={onLogin}
                className="px-5 py-2.5 bg-[#00204A] hover:bg-[#001738] text-white text-xs font-bold font-dateline rounded-xs shadow flex items-center gap-2 mx-auto transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-stone-300 bg-stone-50">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex-1 py-2.5 px-4 text-xs font-bold font-dateline flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
              activeTab === 'bookmarks'
                ? 'border-[#00204A] text-[#00204A] bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Dispatches ({bookmarks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`flex-1 py-2.5 px-4 text-xs font-bold font-dateline flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
              activeTab === 'tips'
                ? 'border-[#00204A] text-[#00204A] bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Your Submitted News Tips ({savedTips.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 max-h-[320px] overflow-y-auto space-y-3">
          {activeTab === 'bookmarks' ? (
            bookmarks.length === 0 ? (
              <div className="text-center py-8 text-stone-500 font-dateline text-xs">
                <Bookmark className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p>No dispatches saved yet.</p>
                <p className="text-[11px] text-stone-400 mt-1">
                  Click the bookmark icon on any article card to save it to your personal Firestore collection.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="p-3 bg-white border border-stone-200 rounded-sm hover:border-[#00204A] transition-colors flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div
                      onClick={() => {
                        onSelectArticleById(bm.articleId);
                        onClose();
                      }}
                      className="cursor-pointer flex-1"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 font-dateline">
                        {bm.category}
                      </span>
                      <h5 className="text-xs font-bold font-headline text-[#00204A] line-clamp-2 hover:underline mt-0.5">
                        {bm.title}
                      </h5>
                      {bm.bengaliTitle && (
                        <p className="text-[11px] text-stone-600 font-bengali line-clamp-1 mt-0.5">
                          {bm.bengaliTitle}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => onRemoveBookmark(bm.articleId)}
                      className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : savedTips.length === 0 ? (
            <div className="text-center py-8 text-stone-500 font-dateline text-xs">
              <FileText className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p>No investigative tips submitted yet.</p>
              <p className="text-[11px] text-stone-400 mt-1">
                News tips and audio transcriptions you submit are securely archived in your account.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedTips.map((tip) => (
                <div
                  key={tip.id}
                  className="p-3 bg-white border border-stone-200 rounded-sm shadow-2xs"
                >
                  <div className="flex items-center justify-between text-[10px] font-dateline text-stone-500 mb-1">
                    <span className="font-bold text-[#00204A]">{tip.location || 'Local Bureau'}</span>
                    <span>{new Date(tip.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h5 className="text-xs font-bold font-headline text-stone-900">{tip.headline}</h5>
                  <p className="text-[11px] text-stone-600 font-serif line-clamp-2 mt-1">
                    {tip.details}
                  </p>
                  {tip.audioTranscription && (
                    <div className="mt-1.5 p-2 bg-stone-50 rounded border border-stone-200 text-[10px] text-stone-700 italic">
                      <span className="font-bold font-sans not-italic text-stone-500">Audio Transcription: </span>
                      {tip.audioTranscription}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-100 p-3 border-t border-stone-300 flex items-center justify-between text-[11px] text-stone-500 font-dateline">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-stone-600" />
            <span>Secured via Firebase Firestore & Authentication</span>
          </span>
          <button
            onClick={onClose}
            className="text-stone-700 hover:text-stone-900 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
