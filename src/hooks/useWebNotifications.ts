import { useState, useEffect, useCallback, useRef } from 'react';
import { Article } from '../types';

export type NotificationSupportState = 'unsupported' | 'default' | 'granted' | 'denied';

export interface UseWebNotificationsReturn {
  isSupported: boolean;
  permission: NotificationSupportState;
  isEnabled: boolean;
  soundEnabled: boolean;
  activeInAppAlert: { article: Article; type: 'urgent' | 'breaking'; timestamp: number } | null;
  requestPermission: () => Promise<NotificationSupportState>;
  toggleEnabled: () => void;
  toggleSound: () => void;
  triggerPushNotification: (article: Article, force?: boolean) => boolean;
  dismissInAppAlert: () => void;
  testNotification: () => void;
}

const STORAGE_KEY_ENABLED = 'provat_wire_push_enabled';
const STORAGE_KEY_SOUND = 'provat_wire_sound_enabled';

// Play an authentic subtle wire-chime using Web Audio API
const playWireChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    
    // First bell tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second bell tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.1, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch {
    // AudioContext blocked by browser policy
  }
};

export const useWebNotifications = (
  onSelectArticle?: (article: Article) => void
): UseWebNotificationsReturn => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationSupportState>('unsupported');
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ENABLED);
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SOUND);
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });
  const [activeInAppAlert, setActiveInAppAlert] = useState<{
    article: Article;
    type: 'urgent' | 'breaking';
    timestamp: number;
  } | null>(null);

  const notifiedArticlesRef = useRef<Set<string>>(new Set());

  // Check initial support and current permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission as NotificationSupportState);
    } else {
      setIsSupported(false);
      setPermission('unsupported');
    }
  }, []);

  // Request native permission
  const requestPermission = useCallback(async (): Promise<NotificationSupportState> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return 'unsupported';
    }

    try {
      // Modern Promise-based request
      const res = await Notification.requestPermission();
      const mapped = res as NotificationSupportState;
      setPermission(mapped);
      if (mapped === 'granted') {
        setIsEnabled(true);
        try {
          localStorage.setItem(STORAGE_KEY_ENABLED, 'true');
        } catch {
          // ignore
        }
      }
      return mapped;
    } catch (err) {
      console.warn('Notification permission request error:', err);
      // Fallback for older browsers with callback pattern
      return new Promise((resolve) => {
        try {
          Notification.requestPermission((status) => {
            const mapped = status as NotificationSupportState;
            setPermission(mapped);
            if (mapped === 'granted') {
              setIsEnabled(true);
            }
            resolve(mapped);
          });
        } catch {
          resolve('denied');
        }
      });
    }
  }, []);

  const toggleEnabled = useCallback(() => {
    setIsEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_ENABLED, String(next));
      } catch {
        // ignore
      }
      // If user enables and permission is default, prompt for permission
      if (next && permission === 'default' && isSupported) {
        requestPermission().catch(() => {});
      }
      return next;
    });
  }, [permission, isSupported, requestPermission]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_SOUND, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const dismissInAppAlert = useCallback(() => {
    setActiveInAppAlert(null);
  }, []);

  // Primary push trigger function
  const triggerPushNotification = useCallback(
    (article: Article, force: boolean = false): boolean => {
      if (!article) return false;

      const isUrgent = !!(article.isUrgent || article.urgencyLevel === 'urgent');
      const isBreaking = !!(article.isBreaking || article.urgencyLevel === 'breaking');

      // Only trigger for Urgent or Breaking
      if (!isUrgent && !isBreaking) return false;

      // Deduplication: do not trigger multiple alerts for the same article unless forced
      if (!force && notifiedArticlesRef.current.has(article.id)) {
        return false;
      }

      notifiedArticlesRef.current.add(article.id);

      // Play audio chime if enabled
      if (soundEnabled) {
        playWireChime();
      }

      const alertType: 'urgent' | 'breaking' = isUrgent ? 'urgent' : 'breaking';

      // Always populate active in-app flash alert (visible regardless of iframe permission state)
      setActiveInAppAlert({
        article,
        type: alertType,
        timestamp: Date.now(),
      });

      // Try native Web Notifications API if enabled and supported
      if (isEnabled && typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          try {
            const titlePrefix = isUrgent ? '🚨 URGENT WIRE BULLETIN' : '⚡ BREAKING NEWS WIRE';
            const notificationTitle = `${titlePrefix}: ${article.title}`;
            
            const options: NotificationOptions = {
              body: `${article.subtitle || article.leadParagraph.slice(0, 120)}...`,
              icon: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=128&auto=format&fit=crop&q=80',
              badge: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=96&auto=format&fit=crop&q=80',
              tag: `provat-wire-${article.id}`,
              requireInteraction: isUrgent,
              data: {
                articleId: article.id,
              },
            };

            const notif = new Notification(notificationTitle, options);

            notif.onclick = (event) => {
              event.preventDefault();
              window.focus();
              if (onSelectArticle) {
                onSelectArticle(article);
              }
              notif.close();
            };
            return true;
          } catch (error) {
            // Can fail if sandboxed in cross-origin iframe without permission delegation
            console.info('Native notification dispatched with fallback in-app alert.', error);
          }
        }
      }

      return true;
    },
    [isEnabled, soundEnabled, onSelectArticle]
  );

  // Test notification helper
  const testNotification = useCallback(() => {
    const sampleArticle: Article = {
      id: `test-wire-${Date.now()}`,
      title: 'Global Financial Markets Rally as Bilateral Infrastructure Compact Passes',
      bengaliTitle: 'দ্বিপাক্ষিক পরিকাঠামো চুক্তি পাসের পর বৈশ্বিক আর্থিক বাজারে জোরালো উত্থান',
      subtitle: 'Trading exchanges across New York and South Asia surge following formal signing in Washington.',
      category: 'business',
      isBreaking: true,
      urgencyLevel: 'breaking',
      author: {
        name: 'Provat Wire Desk',
        role: 'Flash Dispatch Editor',
        location: 'New York Bureau',
      },
      publishedAt: 'Just now',
      readTimeMinutes: 2,
      imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
      imageCaption: 'Real-time ticker indices illuminating exchange floor screens.',
      imageCredit: 'Provat Wire',
      leadParagraph: 'NEW YORK — Markets experienced rapid gains on Friday morning following the announcement of a multi-billion dollar trade and microelectronics corridor.',
      bodyParagraphs: ['Financial analysts praised the treaty for cutting cross-border logistics costs.'],
      sharesCount: 50,
      viewsCount: 300,
      adRevenueEstimate: 120,
    };

    triggerPushNotification(sampleArticle, true);
  }, [triggerPushNotification]);

  return {
    isSupported,
    permission,
    isEnabled,
    soundEnabled,
    activeInAppAlert,
    requestPermission,
    toggleEnabled,
    toggleSound,
    triggerPushNotification,
    dismissInAppAlert,
    testNotification,
  };
};
