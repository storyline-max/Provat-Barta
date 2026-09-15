import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Upload,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  X,
  FileAudio,
  Send,
  RotateCcw,
} from 'lucide-react';

interface AudioTranscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseTranscription?: (text: string) => void;
  onSaveToNewsTip?: (text: string) => void;
}

export const AudioTranscribeModal: React.FC<AudioTranscribeModalProps> = ({
  isOpen,
  onClose,
  onUseTranscription,
  onSaveToNewsTip,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clear timer and resources on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      if (isRecording && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
      setRecordingSeconds(0);
      setErrorMessage(null);
    }
  }, [isOpen, isRecording]);

  const startRecording = async () => {
    setErrorMessage(null);
    setTranscription('');
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setAudioBlob(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());

        // Automatically trigger transcription
        transcribeAudioBlob(blob, mimeType);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error starting recording:', err);
      setErrorMessage(
        err?.message || 'Microphone access was denied. Please allow microphone permissions.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setTranscription('');
    if (audioUrl) URL.revokeObjectURL(audioUrl);

    setAudioBlob(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    transcribeAudioBlob(file, file.type || 'audio/mp3');
  };

  const transcribeAudioBlob = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setErrorMessage(null);

    try {
      // Convert Blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = async () => {
        const base64data = reader.result as string;
        // Strip data:audio/xyz;base64, prefix
        const base64Audio = base64data.split(',')[1];

        const response = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audio: base64Audio,
            mimeType: mimeType || 'audio/webm',
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to transcribe audio');
        }

        setTranscription(data.transcription || 'No audible speech detected.');
        setIsTranscribing(false);
      };

      reader.onerror = () => {
        throw new Error('Failed to read audio file.');
      };
    } catch (err: any) {
      console.error('Transcription error:', err);
      setErrorMessage(err.message || 'Error occurred while transcribing audio.');
      setIsTranscribing(false);
    }
  };

  const handleCopy = () => {
    if (!transcription) return;
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transcribe-modal-title"
    >
      <div className="bg-[#fcfaf7] text-stone-900 w-full max-w-xl rounded-sm shadow-2xl border-2 border-stone-400 overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="bg-[#00204A] text-white p-4 border-b border-[#001738] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-white/10 text-white">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 id="transcribe-modal-title" className="text-sm font-bold uppercase tracking-wider font-dateline flex items-center gap-2">
                <span>Editorial Audio Transcriber</span>
                <span className="text-[10px] bg-amber-400 text-[#00204A] px-1.5 py-0.5 rounded font-bold">
                  gemini-3.5-transcribe
                </span>
              </h3>
              <p className="text-[11px] text-stone-300 font-dateline">
                Record voice notes or citizen journalism audio for instant verbatim text transcription
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

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Recording / Upload Controls */}
          <div className="bg-stone-100 border border-stone-300 rounded-sm p-5 text-center flex flex-col items-center">
            {isRecording ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-red-600 font-bold font-dateline text-sm animate-pulse">
                  <span className="w-3 h-3 rounded-full bg-red-600" />
                  <span>Recording In Progress: {formatTime(recordingSeconds)}</span>
                </div>
                <p className="text-xs text-stone-600">Speak clearly into your microphone...</p>
                <button
                  onClick={stopRecording}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xs shadow text-sm font-dateline flex items-center gap-2 mx-auto transition-colors"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop & Transcribe</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3 w-full">
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={startRecording}
                    disabled={isTranscribing}
                    className="px-5 py-2.5 bg-[#00204A] hover:bg-[#001738] text-white font-bold rounded-xs shadow text-sm font-dateline flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Mic className="w-4 h-4 text-[#FD8B18]" />
                    <span>Start Microphone Recording</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isTranscribing}
                    className="px-4 py-2.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold rounded-xs text-sm font-dateline flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4 text-stone-600" />
                    <span>Upload Audio File</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-[11px] text-stone-500 font-dateline">
                  Supports bilingual English and Bengali speech (WAV, MP3, WEBM, OGG, M4A)
                </p>
              </div>
            )}

            {/* Audio Playback Preview */}
            {audioUrl && !isRecording && (
              <div className="mt-4 w-full pt-3 border-t border-stone-200 flex flex-col items-center">
                <p className="text-[11px] text-stone-500 font-dateline mb-1.5 flex items-center gap-1">
                  <FileAudio className="w-3.5 h-3.5 text-stone-600" />
                  <span>Audio Sample Preview</span>
                </p>
                <audio controls src={audioUrl} className="w-full h-8" />
              </div>
            )}
          </div>

          {/* Transcribing Loading State */}
          {isTranscribing && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-amber-900 font-bold text-sm font-dateline">
                <Sparkles className="w-4 h-4 animate-spin text-[#FD8B18]" />
                <span>Transcribing via gemini-3.5-transcribe...</span>
              </div>
              <p className="text-xs text-amber-800 font-dateline">
                Parsing audio waveforms, linguistic structures, and speech cadence...
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs rounded flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Transcription Notice</p>
                <p className="text-[11px] mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Transcription Result Area */}
          {transcription && !isTranscribing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#00204A] font-dateline flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FD8B18]" />
                  <span>Transcription Output</span>
                </label>
                <button
                  onClick={handleCopy}
                  className="text-xs font-dateline text-stone-600 hover:text-stone-900 flex items-center gap-1 p-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-3.5 bg-white border border-stone-300 rounded-sm shadow-inner min-h-[100px] max-h-[220px] overflow-y-auto text-sm text-stone-800 leading-relaxed font-serif select-text">
                {transcription}
              </div>

              {/* Action Buttons with Transcription */}
              <div className="pt-2 flex flex-wrap items-center gap-2 justify-end">
                {onSaveToNewsTip && (
                  <button
                    onClick={() => {
                      onSaveToNewsTip(transcription);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-[#00204A] hover:bg-[#001738] text-white text-xs font-bold font-dateline rounded-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Send className="w-3 h-3 text-[#FD8B18]" />
                    <span>Insert into News Tip Submission</span>
                  </button>
                )}

                {onUseTranscription && (
                  <button
                    onClick={() => {
                      onUseTranscription(transcription);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold font-dateline rounded-xs flex items-center gap-1 transition-colors"
                  >
                    <span>Use as Search Query</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-100 px-5 py-2.5 border-t border-stone-300 flex items-center justify-between text-[11px] text-stone-500 font-dateline">
          <span>Model: gemini-3.5-transcribe • Secure Server-side API Proxy</span>
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
