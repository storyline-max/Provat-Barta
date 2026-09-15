import React, { useState } from 'react';
import { X, Send, Lock, CheckCircle2, Mic, Sparkles, Square } from 'lucide-react';

interface SubmitTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveToFirestore?: (tip: { headline: string; details: string; location?: string; audioTranscription?: string }) => void;
  initialContent?: string;
}

export const SubmitTipModal: React.FC<SubmitTipModalProps> = ({
  isOpen,
  onClose,
  onSaveToFirestore,
  initialContent = '',
}) => {
  const [type, setType] = useState<'tip' | 'letter'>('tip');
  const [headline, setHeadline] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState(initialContent);
  const [location, setLocation] = useState('Washington Bureau');
  const [isConfidential, setIsConfidential] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Audio recording state inside tip modal
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState('');
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  React.useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  const startVoiceRecording = async () => {
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

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());

        setIsTranscribing(true);
        try {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64data = reader.result as string;
            const base64Audio = base64data.split(',')[1];

            const response = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audio: base64Audio,
                mimeType: mediaRecorder.mimeType || 'audio/webm',
              }),
            });
            const data = await response.json();
            if (data.transcription) {
              setAudioTranscript(data.transcription);
              setContent((prev) => (prev ? `${prev}\n\n[Audio Transcription]: ${data.transcription}` : `[Audio Transcription]: ${data.transcription}`));
            }
            setIsTranscribing(false);
          };
        } catch (err) {
          console.error('Error transcribing audio tip:', err);
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mic access denied:', err);
      alert('Microphone access was denied. Please allow microphone permissions in your browser.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveToFirestore) {
      onSaveToFirestore({
        headline,
        details: content,
        location,
        audioTranscription: audioTranscript,
      });
    }
    setIsSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs no-print">
      <div className="bg-[#fbf9f4] border-2 border-[#00204A] rounded shadow-2xl max-w-lg w-full p-6 text-stone-900 font-editorial">
        <div className="flex items-center justify-between border-b border-stone-300 pb-3 mb-4">
          <div>
            <span className="text-[10px] font-dateline uppercase font-bold tracking-widest text-[#E5000C]">
              Newsroom Editorial Gateway
            </span>
            <h3 className="font-headline font-bold text-xl text-[#00204A]">
              {type === 'letter' ? 'Letter to the Editor' : 'Confidential News Tip'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-200 rounded text-stone-600 hover:text-stone-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-headline font-bold text-xl text-[#00204A]">
              Submission Received & Archived
            </h4>
            <p className="text-[13px] font-editorial text-stone-600 max-w-sm mx-auto">
              Your dispatch has been saved to your secure Firestore account history and routed directly to the editorial review desk at The Provat Barta.
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                onClose();
              }}
              className="bg-[#00204A] text-white px-4 py-1.5 rounded text-xs font-dateline font-bold uppercase tracking-wider mt-4"
            >
              Return to Paper
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('tip')}
                className={`flex-1 py-1.5 text-xs font-dateline font-bold uppercase rounded border transition-colors ${
                  type === 'tip'
                    ? 'bg-[#00204A] text-white border-[#00204A]'
                    : 'bg-stone-100 text-stone-700 border-stone-300'
                }`}
              >
                Confidential Tip
              </button>
              <button
                type="button"
                onClick={() => setType('letter')}
                className={`flex-1 py-1.5 text-xs font-dateline font-bold uppercase rounded border transition-colors ${
                  type === 'letter'
                    ? 'bg-[#00204A] text-white border-[#00204A]'
                    : 'bg-stone-100 text-stone-700 border-stone-300'
                }`}
              >
                Letter to the Editor
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-dateline font-bold uppercase text-stone-700 mb-1">
                Subject / Working Headline:
              </label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Environmental concerns regarding port dredging"
                className="w-full p-2 text-xs border border-stone-300 rounded bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#00204A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-dateline font-bold uppercase text-stone-700 mb-1">
                  Your Full Name:
                </label>
                <input
                  type="text"
                  required={!isConfidential}
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder={isConfidential ? 'Anonymous' : 'Dr. / Mr. / Ms.'}
                  className="w-full p-2 text-xs border border-stone-300 rounded bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#00204A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-dateline font-bold uppercase text-stone-700 mb-1">
                  Location / Bureau:
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New York, Dhaka, London"
                  className="w-full p-2 text-xs border border-stone-300 rounded bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#00204A]"
                />
              </div>
            </div>

            {/* Audio Voice Input Dictation */}
            <div className="p-2.5 bg-stone-100 border border-stone-300 rounded-sm flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-stone-700 font-dateline">
                <Mic className="w-3.5 h-3.5 text-[#FD8B18]" />
                <span>Voice Dictation (gemini-3.5-transcribe):</span>
              </div>
              {isRecording ? (
                <button
                  type="button"
                  onClick={stopVoiceRecording}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold font-dateline flex items-center gap-1 animate-pulse"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>Stop Recording</span>
                </button>
              ) : isTranscribing ? (
                <span className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  <span>Transcribing audio...</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  className="px-2.5 py-1 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 rounded text-[11px] font-bold font-dateline flex items-center gap-1 transition-colors"
                >
                  <Mic className="w-3 h-3 text-[#E5000C]" />
                  <span>Record Voice Note</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-dateline font-bold uppercase text-stone-700 mb-1">
                Message / Verified Facts / Details:
              </label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Compose your commentary or outline verified documents..."
                className="w-full p-2 text-xs border border-stone-300 rounded bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#00204A]"
              ></textarea>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="confidential"
                checked={isConfidential}
                onChange={(e) => setIsConfidential(e.target.checked)}
                className="rounded text-[#00204A] focus:ring-[#00204A]"
              />
              <label htmlFor="confidential" className="text-[11px] font-dateline text-stone-700 flex items-center gap-1 cursor-pointer">
                <Lock className="w-3 h-3 text-stone-500" />
                <span>Protect identity under newsroom whistleblower policy</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[#00204A] hover:bg-[#00306e] text-white py-2.5 rounded font-cinzel font-bold text-xs uppercase tracking-wider transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-[#FD8B18]" />
              <span>Submit to Newsroom</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
