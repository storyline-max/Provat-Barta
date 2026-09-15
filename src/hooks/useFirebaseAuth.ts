import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  auth,
  db,
  signInWithGoogle,
  logOut,
  onAuthStateChanged,
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
} from '../lib/firebase';
import { Article } from '../types';

export interface SavedBookmark {
  id: string;
  articleId: string;
  title: string;
  bengaliTitle?: string;
  category: string;
  savedAt: string;
}

export interface UserNewsTip {
  id: string;
  headline: string;
  details: string;
  location?: string;
  audioTranscription?: string;
  createdAt: string;
}

export const useFirebaseAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([]);
  const [savedTipHistory, setSavedTipHistory] = useState<UserNewsTip[]>([]);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user);
        setAuthLoading(false);
      },
      (err) => {
        console.error('Firebase Auth state error:', err);
        setAuthError(err.message);
        setAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Listen to User Bookmarks in Firestore
  useEffect(() => {
    if (!currentUser) {
      setBookmarks([]);
      setSavedTipHistory([]);
      return;
    }

    // Bookmarks collection
    const bookmarksRef = collection(db, 'users', currentUser.uid, 'bookmarks');
    const unsubBookmarks = onSnapshot(
      bookmarksRef,
      (snapshot) => {
        const list: SavedBookmark[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<SavedBookmark, 'id'>) });
        });
        setBookmarks(list);
      },
      (err) => {
        console.warn('Firestore bookmarks listener error:', err);
      }
    );

    // News tips collection
    const tipsRef = collection(db, 'users', currentUser.uid, 'tips');
    const unsubTips = onSnapshot(
      tipsRef,
      (snapshot) => {
        const list: UserNewsTip[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<UserNewsTip, 'id'>) });
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setSavedTipHistory(list);
      },
      (err) => {
        console.warn('Firestore tips listener error:', err);
      }
    );

    return () => {
      unsubBookmarks();
      unsubTips();
    };
  }, [currentUser]);

  const handleLogin = useCallback(async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError(err?.message || 'Failed to sign in with Google');
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setAuthError(null);
    try {
      await logOut();
    } catch (err: any) {
      console.error('Logout error:', err);
      setAuthError(err?.message || 'Failed to log out');
    }
  }, []);

  const toggleBookmark = useCallback(
    async (article: Article) => {
      if (!currentUser) {
        handleLogin();
        return;
      }

      const bookmarkDocRef = doc(db, 'users', currentUser.uid, 'bookmarks', article.id);
      const isAlreadyBookmarked = bookmarks.some((b) => b.articleId === article.id);

      try {
        if (isAlreadyBookmarked) {
          await deleteDoc(bookmarkDocRef);
        } else {
          await setDoc(bookmarkDocRef, {
            articleId: article.id,
            title: article.title,
            bengaliTitle: article.bengaliTitle || '',
            category: article.category,
            savedAt: new Date().toISOString(),
          });
        }
      } catch (err: any) {
        console.error('Error toggling bookmark:', err);
      }
    },
    [currentUser, bookmarks, handleLogin]
  );

  const isArticleBookmarked = useCallback(
    (articleId: string) => {
      return bookmarks.some((b) => b.articleId === articleId);
    },
    [bookmarks]
  );

  const saveNewsTipToFirestore = useCallback(
    async (tip: { headline: string; details: string; location?: string; audioTranscription?: string }) => {
      if (!currentUser) return;
      try {
        const tipDocRef = doc(collection(db, 'users', currentUser.uid, 'tips'));
        await setDoc(tipDocRef, {
          headline: tip.headline,
          details: tip.details,
          location: tip.location || 'Local Bureau',
          audioTranscription: tip.audioTranscription || '',
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Error saving news tip to Firestore:', err);
      }
    },
    [currentUser]
  );

  return {
    currentUser,
    authLoading,
    authError,
    bookmarks,
    savedTipHistory,
    login: handleLogin,
    logout: handleLogout,
    toggleBookmark,
    isArticleBookmarked,
    saveNewsTipToFirestore,
  };
};
