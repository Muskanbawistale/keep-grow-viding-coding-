

import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, Blob, LiveServerMessage } from '@google/genai';
import { Persona, UserProfile } from '../types';

interface LiveVoiceProps {
  persona: Persona;
  userProfile: UserProfile;
  onClose: () => void;
}

const LiveVoice: React.FC<LiveVoiceProps> = ({ persona, userProfile, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for audio handling to avoid re-renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null); // To hold the live session
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  useEffect(() => {
    let mounted = true;

    const startSession = async () => {
      try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) throw new Error("API Key missing");
        
        const ai = new GoogleGenAI({ apiKey });
        
        // Initialize audio contexts
        inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        // Get Microphone stream
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Construct System Instruction with Assessment Context
        let enhancedInstruction = persona.systemInstruction;
        
        if (userProfile.history.length > 0) {
            const latest = userProfile.history[0];
            const contextString = `
            \n\n[CONTEXT: The user has shared their latest mental health assessment (DASS-21) results with you. Please review and use this to guide your responses:
            Date: ${latest.date}
            Overall Status: ${latest.label} (Score: ${latest.score})
            Breakdown: Depression (${latest.breakdown.depression.level}), Anxiety (${latest.breakdown.anxiety.level}), Stress (${latest.breakdown.stress.level}).
            AI Summary: ${latest.aiAnalysis.overallSummary}]
            `;
            enhancedInstruction += contextString;
        }

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          callbacks: {
            onopen: () => {
              if (!mounted) return;
              setIsConnected(true);
              
              // Set up input processing
              if (inputContextRef.current) {
                const source = inputContextRef.current.createMediaStreamSource(stream);
                // Use ScriptProcessor for wide compatibility as per example
                const scriptProcessor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
                
                scriptProcessor.onaudioprocess = (e) => {
                  if (!mounted) return;
                  const inputData = e.inputBuffer.getChannelData(0);
                  const pcmBlob = createBlob(inputData);
                  
                  sessionPromise.then(session => {
                    session.sendRealtimeInput({ media: pcmBlob });
                  });
                };
                
                source.connect(scriptProcessor);
                scriptProcessor.connect(inputContextRef.current.destination);
              }
            },
            onmessage: async (msg: LiveServerMessage) => {
              if (!mounted) return;

              // Handle Audio Output
              const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (base64Audio && audioContextRef.current) {
                setIsSpeaking(true);
                const ctx = audioContextRef.current;
                
                // Decode
                const audioBuffer = await decodeAudioData(
                  decode(base64Audio),
                  ctx,
                  24000,
                  1
                );
                
                // Schedule playback
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                const gainNode = ctx.createGain();
                gainNode.gain.value = 1.0;
                source.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                source.addEventListener('ended', () => {
                  sourcesRef.current.delete(source);
                  if (sourcesRef.current.size === 0) setIsSpeaking(false);
                });
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
              }
              
              // Handle interruptions
              if (msg.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                setIsSpeaking(false);
              }
            },
            onclose: () => {
              if (mounted) setIsConnected(false);
            },
            onerror: (err) => {
              console.error("Live API Error:", err);
              if (mounted) setError("Connection failed. Please try again.");
            }
          },
          config: {
             responseModalities: [Modality.AUDIO],
             systemInstruction: enhancedInstruction,
             speechConfig: {
                 voiceConfig: { prebuiltVoiceConfig: { voiceName: persona.voiceName || 'Kore' } }
             }
          }
        });
        
        sessionRef.current = sessionPromise;

      } catch (err: any) {
        console.error(err);
        if (mounted) setError(err.message || "Failed to start voice session");
      }
    };

    startSession();

    return () => {
      mounted = false;
      // Cleanup
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (inputContextRef.current) inputContextRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
      sourcesRef.current.forEach(s => s.stop());
      // There is no explicit .close() on sessionPromise in the SDK type, but closing socket happens on unmount naturally via garbage collection or if SDK exposes it.
      // Ideally we would send a close signal if the SDK supports it.
    };
  }, [persona, userProfile]);

  // Helper functions
  function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        // Clamp values to [-1, 1] before scaling
        const val = Math.max(-1, Math.min(1, data[i]));
        int16[i] = val * 32767;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
  }

  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
  
  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
        <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-3 bg-slate-800 rounded-full text-white hover:bg-slate-700 transition-colors"
        >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <div className="flex flex-col items-center gap-8 max-w-md w-full text-center">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl shadow-2xl ${persona.color} relative`}>
                {persona.icon}
                {isConnected && (
                    <>
                        <div className={`absolute inset-0 rounded-full border-4 border-current opacity-20 animate-ping ${isSpeaking ? 'animation-duration-1000' : 'animation-duration-3000'}`}></div>
                        <div className={`absolute inset-[-10px] rounded-full border-2 border-current opacity-10 animate-pulse`}></div>
                    </>
                )}
            </div>

            <div>
                <h3 className="text-3xl font-bold text-white mb-2">{persona.name}</h3>
                <p className="text-slate-400 text-lg">Voice Mode</p>
            </div>

            {error ? (
                <div className="bg-red-900/50 text-red-200 px-4 py-2 rounded-lg border border-red-800">
                    {error}
                </div>
            ) : (
                <div className="h-12 flex items-center gap-1">
                     {isConnected ? (
                         isSpeaking ? (
                            <span className="text-primary-400 font-medium animate-pulse">Speaking...</span>
                         ) : (
                            <span className="text-slate-400 font-medium">Listening...</span>
                         )
                     ) : (
                         <span className="text-slate-500">Connecting...</span>
                     )}
                </div>
            )}

            <div className="flex gap-4 mt-8">
                <button 
                    onClick={onClose}
                    className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-lg shadow-red-600/30 transition-all transform hover:scale-105"
                >
                    End Call
                </button>
            </div>
            
            <p className="text-sm text-slate-500 mt-4">
                Powered by Gemini Live. Speak naturally.
            </p>
        </div>
    </div>
  );
};

export default LiveVoice;