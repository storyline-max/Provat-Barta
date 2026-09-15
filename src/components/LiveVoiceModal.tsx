import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  Volume2,
  X,
  Sparkles,
  AlertCircle,
  Power,
  RotateCcw,
  Headphones,
} from 'lucide-react';
import { float32ToPcmBase64, GaplessAudioQueue } from '../lib/audioUtils';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({ isOpen, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [statusText, setStatusText] = useState<string>('Ready to connect');
  const [modelSpeaking, setModelSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userSpeechDetected, setUserSpeechDetected] = useState(false);

  // References
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<GaplessAudioQueue | null>(null);
  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  // Cleanup on unmount or close
  const cleanupAudio = useCallback(() => {
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {}
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (audioQueueRef.current) {
      audioQueueRef.current.stopAll();
      audioQueueRef.current.close();
      audioQueueRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setModelSpeaking(false);
    setUserSpeechDetected(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      cleanupAudio();
    }
  }, [isOpen, cleanupAudio]);

  const connectToLiveVoice = async () => {
    cleanupAudio();
    setIsConnecting(true);
    setErrorMessage(null);
    setStatusText('Requesting microphone access...');

    try {
      // 1. Request Microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // 2. Setup 16kHz AudioContext for mic capture
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const inputCtx = new AudioCtx({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;
      if (inputCtx.state === 'suspended') {
        await inputCtx.resume();
      }

      // 3. Setup playback queue
      audioQueueRef.current = new GaplessAudioQueue();
      // Prime output audio context on user gesture
      audioQueueRef.current.getContext();

      // 4. Connect WebSocket to backend /ws/live
      setStatusText('Connecting to Gemini Live API...');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setStatusText('Live Voice session connected. Speak now or ask a question.');

        // Setup microphone processor
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        source.connect(processor);
        processor.connect(inputCtx.destination);

        processor.onaudioprocess = (e) => {
          if (isMutedRef.current || ws.readyState !== WebSocket.OPEN) {
            setUserSpeechDetected(false);
            return;
          }

          const channelData = e.inputBuffer.getChannelData(0);
          
          // Calculate RMS for visual speech detection
          let sum = 0;
          for (let i = 0; i < channelData.length; i++) {
            sum += channelData[i] * channelData[i];
          }
          const rms = Math.sqrt(sum / channelData.length);
          setUserSpeechDetected(rms > 0.02);

          const base64Pcm = float32ToPcmBase64(channelData);
          ws.send(
            JSON.stringify({
              type: 'audio',
              audio: base64Pcm,
            })
          );
        };
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'audio' && msg.audio) {
            setModelSpeaking(true);
            setStatusText('Provat Editorial Voice is speaking...');
            if (audioQueueRef.current) {
              audioQueueRef.current.enqueueChunk(msg.audio);
            }
          } else if (msg.type === 'interrupted') {
            setModelSpeaking(false);
            setStatusText('Interrupted by user. Listening...');
            if (audioQueueRef.current) {
              audioQueueRef.current.stopAll();
            }
          } else if (msg.type === 'turnComplete') {
            setModelSpeaking(false);
            setStatusText('Listening for your voice...');
          } else if (msg.type === 'error') {
            setErrorMessage(msg.message || 'Live session error received from server');
          }
        } catch (e) {
          console.warn('Error handling live message:', e);
        }
      };

      ws.onerror = () => {
        setErrorMessage('WebSocket connection error. Verify Gemini API key is configured.');
        setIsConnecting(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        setModelSpeaking(false);
        setStatusText('Session disconnected.');
      };
    } catch (err: any) {
      console.error('Failed to initialize Live voice:', err);
      setErrorMessage(
        err?.message || 'Failed to start Live Voice session. Check microphone permissions.'
      );
      setIsConnecting(false);
    }
  };

  const sendQuickPrompt = (text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setStatusText(`Sent query: "${text}"`);
      wsRef.current.send(
        JSON.stringify({
          type: 'text',
          text,
        })
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="live-voice-title"
    >
      <div className="bg-[#001738] text-white w-full max-w-xl rounded-sm shadow-2xl border-2 border-[#002b66] overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="bg-[#000f24] p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E5000C] flex items-center justify-center animate-pulse">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 id="live-voice-title" className="text-sm font-bold uppercase tracking-wider font-dateline flex items-center gap-2">
                <span>Provat Barta Live Voice Intelligence</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                  gemini-3.1-flash-live-preview
                </span>
              </h3>
              <p className="text-[11px] text-stone-400 font-dateline">
                রেডিও প্রভাত • Real-time low-latency voice conversation with editorial intelligence
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              cleanupAudio();
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-white rounded transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* Status Indicator */}
          <div className="mb-6">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-dateline font-semibold border ${
                isConnected
                  ? modelSpeaking
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : isConnecting
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 animate-pulse'
                  : 'bg-stone-800 text-stone-300 border-stone-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected
                    ? modelSpeaking
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-emerald-400 animate-pulse'
                    : isConnecting
                    ? 'bg-blue-400'
                    : 'bg-stone-500'
                }`}
              />
              <span>{statusText}</span>
            </span>
          </div>

          {/* Central Animated Visualizer Sphere */}
          <div className="relative my-4 flex items-center justify-center">
            {/* Outer pulsating aura */}
            <div
              className={`w-44 h-44 rounded-full transition-all duration-300 flex items-center justify-center ${
                modelSpeaking
                  ? 'bg-amber-500/20 ring-4 ring-amber-400/40 scale-105'
                  : userSpeechDetected
                  ? 'bg-red-500/20 ring-4 ring-red-500/40 scale-102'
                  : isConnected
                  ? 'bg-blue-600/10 ring-2 ring-blue-500/20'
                  : 'bg-stone-800/40'
              }`}
            >
              <div
                className={`w-32 h-32 rounded-full transition-all duration-300 flex items-center justify-center ${
                  modelSpeaking
                    ? 'bg-[#FD8B18] shadow-lg shadow-amber-500/50'
                    : userSpeechDetected
                    ? 'bg-[#E5000C] shadow-lg shadow-red-600/50'
                    : isConnected
                    ? 'bg-[#002b66]'
                    : 'bg-stone-800'
                }`}
              >
                {modelSpeaking ? (
                  <Volume2 className="w-12 h-12 text-[#00204A] animate-bounce" />
                ) : userSpeechDetected ? (
                  <Mic className="w-12 h-12 text-white animate-pulse" />
                ) : isConnected ? (
                  <Headphones className="w-10 h-10 text-stone-300" />
                ) : (
                  <Power className="w-10 h-10 text-stone-500" />
                )}
              </div>
            </div>
          </div>

          {/* Error Banner if any */}
          {errorMessage && (
            <div className="my-3 w-full bg-red-950/70 border border-red-800 text-red-200 text-xs p-3 rounded text-left flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
              <div>
                <p className="font-bold">Live API Error</p>
                <p className="text-[11px] mt-0.5 text-red-300">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Main Action Buttons */}
          <div className="mt-4 flex items-center justify-center gap-3">
            {!isConnected ? (
              <button
                onClick={connectToLiveVoice}
                disabled={isConnecting}
                className="px-6 py-2.5 bg-[#FD8B18] hover:bg-amber-400 text-[#00204A] font-bold rounded text-sm transition-all shadow-md flex items-center gap-2 font-dateline disabled:opacity-50"
              >
                <Radio className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting...' : 'Start Live Voice Session'}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsMuted((prev) => !prev)}
                  className={`p-3 rounded-full transition-colors ${
                    isMuted
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={cleanupAudio}
                  className="px-5 py-2.5 bg-[#E5000C] hover:bg-red-700 text-white font-bold rounded text-sm transition-colors flex items-center gap-2 font-dateline shadow-md"
                >
                  <Power className="w-4 h-4" />
                  <span>End Session</span>
                </button>
              </>
            )}
          </div>

          {/* Quick Suggested Conversational Questions */}
          <div className="mt-6 w-full pt-4 border-t border-white/10 text-left">
            <span className="text-[11px] uppercase tracking-wider font-bold text-stone-400 font-dateline flex items-center gap-1 mb-2">
              <Sparkles className="w-3 h-3 text-[#FD8B18]" />
              <span>Suggested Spoken Inquiries (Voice or 1-Click)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                onClick={() =>
                  isConnected
                    ? sendQuickPrompt('Give me a 60-second summary of today’s lead stories.')
                    : connectToLiveVoice()
                }
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-stone-300 hover:text-white transition-colors text-left"
              >
                "Give me a 60-second summary of today’s lead stories."
              </button>
              <button
                onClick={() =>
                  isConnected
                    ? sendQuickPrompt('Explain the maritime commerce treaty and its tariff impact.')
                    : connectToLiveVoice()
                }
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-stone-300 hover:text-white transition-colors text-left"
              >
                "Explain the maritime commerce treaty & its impact."
              </button>
              <button
                onClick={() =>
                  isConnected
                    ? sendQuickPrompt('বাংলায় আজকের আবহাওয়া এবং প্রধান রাজনৈতিক খবরগুলো সংক্ষেপে বলুন।')
                    : connectToLiveVoice()
                }
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-stone-300 hover:text-white transition-colors text-left font-bengali"
              >
                "বাংলায় আজকের প্রধান রাজনৈতিক খবরগুলো বলুন।"
              </button>
              <button
                onClick={() =>
                  isConnected
                    ? sendQuickPrompt('Tell me about the Press Freedom bill introduced on Capitol Hill.')
                    : connectToLiveVoice()
                }
                className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-stone-300 hover:text-white transition-colors text-left"
              >
                "Tell me about the Press Freedom bill on Capitol Hill."
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-[#000f24] px-4 py-2 border-t border-white/5 text-[10px] text-stone-400 font-dateline flex items-center justify-between">
          <span>Model: gemini-3.1-flash-live-preview • 16kHz PCM In / 24kHz PCM Out</span>
          <span className="text-[#FD8B18] font-bold">Bi-directional Live Stream</span>
        </div>
      </div>
    </div>
  );
};
