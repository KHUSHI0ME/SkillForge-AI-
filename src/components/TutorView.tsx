/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  MessageSquare, 
  Brain, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  CheckCircle,
  HelpCircle,
  ChevronRight
} from "lucide-react";
import { ChatMessage, UserProgress } from "../types";

interface TutorViewProps {
  progress: UserProgress;
}

export default function TutorView({ progress }: TutorViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial_welcome",
      role: "model",
      text: "Hello! I am your SkillForge AI Mentor. 🚀\n\nI can explain complicated algorithms, help design system composition files, review code, or prepare you for technical interviews. What shall we learn or draft together today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Voice Mentor states
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceModelType, setVoiceModelType] = useState<'local' | 'gemini'>('local');
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Clean speaking state on close
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Web Speech API Voice Synthesis (Local)
  const speakLocal = (text: string, msgId: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[`#*_\-]/g, ""); // Strip markdown
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setSpeakingMsgId(msgId);
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    window.speechSynthesis.speak(utterance);
  };

  // High Fidelity Voice Synthesis via Gemini TTS API
  const speakGemini = async (text: string, msgId: string) => {
    setSpeakingMsgId(msgId);
    try {
      const response = await fetch("/api/voice-tutor/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.substring(0, 300) }) // request first chunk
      });

      if (!response.ok) throw new Error("TTS API call failed");
      const data = await response.json();
      
      if (data.audio) {
        // Decode raw pcm little endian or wav bytes
        const binaryString = window.atob(data.audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Play audio directly using Web Audio Context
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const buffer = audioCtx.createBuffer(1, len / 2, 24000);
        const channel = buffer.getChannelData(0);
        
        const dataView = new DataView(bytes.buffer);
        for (let i = 0; i < len; i += 2) {
          if (i / 2 < channel.length) {
            // Read 16-bit PCM little endian
            channel[i / 2] = dataView.getInt16(i, true) / 32768.0;
          }
        }
        
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        
        source.onended = () => {
          setSpeakingMsgId(null);
        };
        source.start();
      } else {
        throw new Error("Empty audio response");
      }
    } catch (err) {
      console.warn("Gemini TTS failed, falling back to local SpeechSynthesis:", err);
      speakLocal(text, msgId);
    }
  };

  const handleSpeakToggle = (msg: ChatMessage) => {
    if (speakingMsgId === msg.id) {
      window.speechSynthesis?.cancel();
      setSpeakingMsgId(null);
    } else {
      if (voiceModelType === 'gemini') {
        speakGemini(msg.text, msg.id);
      } else {
        speakLocal(msg.text, msg.id);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      // Pack the last 8 messages for memory efficiency
      const historyContext = [...messages, userMsg].slice(-8).map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyContext,
          roadmapContext: progress.activeRoadmap
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Tutor server connection lost.");
      }

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);

      // If voice mentor toggle is on, trigger vocal readout automatically
      if (isVoiceActive) {
        if (voiceModelType === 'gemini') {
          speakGemini(aiMsg.text, aiMsg.id);
        } else {
          speakLocal(aiMsg.text, aiMsg.id);
        }
      }
    } catch (err: any) {
      console.error(err);
      
      const fallbackMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        text: "My Express server proxy is offline, but I can assist you locally! Let me remind you to continue practicing on your coding workspace, solving challenges, and reviewing documentation.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
      if (isVoiceActive) speakLocal(fallbackMsg.text, fallbackMsg.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-4 gap-6"
      id="tutor-workspace"
    >
      {/* Voice Mentor configurations parameters sidebar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5" id="voice-mentor-controls">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-1.5 justify-between">
            <span className="flex items-center gap-1">
              <Volume2 className="text-indigo-600 w-4 h-4" /> Voice Mentor Mode
            </span>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold font-mono">Premium Beta</span>
          </h2>
          <p className="text-[11px] text-slate-500">
            Hear answers spoken out loud automatically as soon as the mentor replies.
          </p>
        </div>

        <div className="space-y-3.5 pt-1">
          {/* Active Voice mentor switch */}
          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/50 transition">
            <input 
              type="checkbox" 
              checked={isVoiceActive}
              onChange={(e) => {
                setIsVoiceActive(e.target.checked);
                if (!e.target.checked) window.speechSynthesis?.cancel();
              }}
              className="text-indigo-600 focus:ring-indigo-500 rounded" 
            />
            <div>
              <span className="text-xs font-bold text-slate-800 block">Vocal Readout</span>
              <span className="text-[10px] text-slate-500">Enable voice speech synthesizer</span>
            </div>
          </label>

          {/* High Fidelity selection toggle */}
          {isVoiceActive && (
            <div className="space-y-2 p-3 bg-indigo-50/20 border border-indigo-100/20 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Synthesis Engine</span>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="voice_type_opt"
                    checked={voiceModelType === 'local'}
                    onChange={() => setVoiceModelType('local')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-semibold text-slate-700">WebSpeech API (Fast, Free)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="voice_type_opt"
                    checked={voiceModelType === 'gemini'}
                    onChange={() => setVoiceModelType('gemini')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-semibold text-slate-700">Gemini 3 TTS (High Fidelity)</span>
                </label>
              </div>
            </div>
          )}

          {/* Quick study questions */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">Suggested Questions:</span>
            <div className="space-y-1.5 text-left">
              {[
                "Explain Big O notation with analogies",
                "How to construct non-blocking loops in Node?",
                "What is the Virtual DOM and reconciliation?",
                "Conduct a mock system design interview!"
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(q)}
                  className="w-full text-left p-2.5 bg-slate-50 hover:bg-slate-100 text-[11px] text-slate-600 rounded-lg font-medium transition line-clamp-1 truncate block"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main chat terminal window (Span 3) */}
      <div className="lg:col-span-3 bg-white border border-slate-100 shadow-xl rounded-2xl flex flex-col h-[520px] justify-between relative" id="chat-board">
        {/* Header bar */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center relative">
              <Brain className="w-5 h-5" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">AI Forge Assistant</span>
              <span className="text-[10px] text-slate-400 font-mono">Powered by gemini-3.5-flash</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 font-mono bg-emerald-50 px-2 py-0.5 rounded-md">
            ● AI Online
          </div>
        </div>

        {/* Message logs */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 font-sans text-xs">
          {messages.map((m) => {
            const isAI = m.role === "model";
            return (
              <div 
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${
                  isAI ? "mr-auto text-left" : "ml-auto flex-row-reverse text-right"
                }`}
              >
                {/* Visual Avatar */}
                <span className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-bold text-[10px] ${
                  isAI ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-slate-900 text-slate-100"
                }`}>
                  {isAI ? "A" : "U"}
                </span>

                {/* Bubble content */}
                <div className="space-y-1">
                  <div className={`p-4 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    isAI 
                      ? "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100/50" 
                      : "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10"
                  }`}>
                    {m.text}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 px-1 font-mono">
                    <span>{m.timestamp}</span>
                    {isAI && (
                      <button
                        onClick={() => handleSpeakToggle(m)}
                        className="flex items-center gap-0.5 text-indigo-500 font-bold hover:underline"
                      >
                        {speakingMsgId === m.id ? (
                          <>
                            <VolumeX className="w-3 h-3 text-red-500" /> Stop Speech
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-indigo-500" /> Read aloud
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 mr-auto items-center text-slate-400">
              <span className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-bold">A</span>
              <div className="flex gap-1.5 p-3.5 bg-slate-50 border border-slate-100/50 rounded-2xl rounded-tl-none">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-200"></span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input form */}
        <form onSubmit={handleSendMessage} className="p-4 bg-slate-50 rounded-b-2xl border-t border-slate-50 flex gap-2.5">
          <input
            type="text"
            placeholder="Type your technical doubt, explain concepts, or submit code..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-white rounded-xl text-xs border border-slate-200 outline-none focus:border-indigo-400"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition flex items-center justify-center disabled:opacity-50"
            id="send-chat-message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
