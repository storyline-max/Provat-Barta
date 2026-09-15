import { useState, useEffect, useRef, useCallback } from 'react';

export interface TTSVoiceOption {
  name: string;
  lang: string;
  voice: SpeechSynthesisVoice;
}

export interface UseTextToSpeechOptions {
  onParagraphChange?: (index: number) => void;
  onFinish?: () => void;
}

export function useTextToSpeech(
  paragraphs: string[],
  options?: UseTextToSpeechOptions
) {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState<number>(-1);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const paragraphsRef = useRef<string[]>(paragraphs);
  paragraphsRef.current = paragraphs;

  const currentIdxRef = useRef<number>(-1);
  currentIdxRef.current = currentParagraphIndex;

  const isPlayingRef = useRef<boolean>(false);
  isPlayingRef.current = isPlaying;

  const isPausedRef = useRef<boolean>(false);
  isPausedRef.current = isPaused;

  const rateRef = useRef<number>(speechRate);
  rateRef.current = speechRate;

  const voiceRef = useRef<SpeechSynthesisVoice | null>(selectedVoice);
  voiceRef.current = selectedVoice;

  // Initialize SpeechSynthesis and voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setAvailableVoices(voices);

        // Prefer natural English voices or high-quality voices
        const preferred =
          voices.find(
            (v) =>
              (v.lang.startsWith('en') || v.lang.startsWith('bn')) &&
              (v.name.includes('Natural') ||
                v.name.includes('Google') ||
                v.name.includes('Neural') ||
                v.name.includes('Samantha') ||
                v.name.includes('Daniel'))
          ) ||
          voices.find((v) => v.lang.startsWith('en')) ||
          voices[0];

        setSelectedVoice((prev) => prev || preferred || null);
      }
    };

    updateVoices();

    if ('onvoiceschanged' in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Internal helper to speak a specific paragraph index
  const speakParagraphAtIndex = useCallback((index: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const list = paragraphsRef.current;
    if (index < 0 || index >= list.length) {
      // Completed reading all paragraphs
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentParagraphIndex(-1);
      options?.onFinish?.();
      return;
    }

    window.speechSynthesis.cancel();

    const text = list[index].trim();
    if (!text) {
      // If paragraph is empty, advance to next
      speakParagraphAtIndex(index + 1);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rateRef.current;
    utterance.pitch = 1.0;

    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setCurrentParagraphIndex(index);
      options?.onParagraphChange?.(index);
    };

    utterance.onend = () => {
      // Continue to next paragraph only if we are still marked as playing
      if (isPlayingRef.current && !isPausedRef.current) {
        speakParagraphAtIndex(index + 1);
      }
    };

    utterance.onerror = (e) => {
      // 'interrupted' or 'canceled' are common when pausing or stopping
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('SpeechSynthesis error:', e.error);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, [options]);

  // Start reading from the beginning or a specific index
  const start = useCallback((fromIndex: number = 0) => {
    if (!isSupported) return;
    setIsPlaying(true);
    setIsPaused(false);
    speakParagraphAtIndex(fromIndex);
  }, [isSupported, speakParagraphAtIndex]);

  // Pause speech
  const pause = useCallback(() => {
    if (!isSupported) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  }, [isSupported]);

  // Resume speech
  const resume = useCallback(() => {
    if (!isSupported) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else if (currentIdxRef.current >= 0) {
      // Re-speak current paragraph if resume didn't catch
      setIsPaused(false);
      setIsPlaying(true);
      speakParagraphAtIndex(currentIdxRef.current);
    } else {
      start(0);
    }
  }, [isSupported, speakParagraphAtIndex, start]);

  // Stop / Cancel speech
  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentParagraphIndex(-1);
  }, [isSupported]);

  // Skip to next paragraph
  const next = useCallback(() => {
    if (!isSupported) return;
    const nextIdx = currentParagraphIndex + 1;
    if (nextIdx < paragraphsRef.current.length) {
      speakParagraphAtIndex(nextIdx);
    } else {
      stop();
    }
  }, [isSupported, currentParagraphIndex, speakParagraphAtIndex, stop]);

  // Skip to previous paragraph
  const previous = useCallback(() => {
    if (!isSupported) return;
    const prevIdx = Math.max(0, currentParagraphIndex - 1);
    speakParagraphAtIndex(prevIdx);
  }, [isSupported, currentParagraphIndex, speakParagraphAtIndex]);

  // Change playback speed
  const changeRate = useCallback((newRate: number) => {
    setSpeechRate(newRate);
    rateRef.current = newRate;
    // If currently speaking, restart current paragraph with new speed
    if (isPlayingRef.current && currentIdxRef.current >= 0) {
      speakParagraphAtIndex(currentIdxRef.current);
    }
  }, [speakParagraphAtIndex]);

  // Change voice
  const changeVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
    voiceRef.current = voice;
    if (isPlayingRef.current && currentIdxRef.current >= 0) {
      speakParagraphAtIndex(currentIdxRef.current);
    }
  }, [speakParagraphAtIndex]);

  // Toggle playback
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      start(0);
    }
  }, [isPlaying, isPaused, pause, resume, start]);

  return {
    isSupported,
    isPlaying,
    isPaused,
    currentParagraphIndex,
    speechRate,
    availableVoices,
    selectedVoice,
    start,
    pause,
    resume,
    stop,
    next,
    previous,
    changeRate,
    changeVoice,
    togglePlay,
  };
}
