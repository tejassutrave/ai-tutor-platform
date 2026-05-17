"use client";

import { useState, useEffect, useRef } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Loader2, 
  User, 
  Bot,
  Sparkles
} from "lucide-react";

const SUBJECTS = ["Maths", "Physics", "Chemistry", "Biology", "History", "CS", "Other"];

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [subject, setSubject] = useState("Maths");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Auto Scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Voice-to-Text ──────────────────────────────────────────────────────────
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.start();
  };

  // ── Text-to-Speech ──────────────────────────────────────────────────────────
  const speak = (text: string) => {
    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1; // Slightly faster for efficiency
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // ── Handle Send ─────────────────────────────────────────────────────────────
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chat", {
        message: currentInput,
        subject,
        history: messages,
      });

      const aiMsg: Message = { role: "assistant", content: res.data.reply };
      setMessages((prev) => [...prev, aiMsg]);
      
      if (autoSpeak) {
        speak(aiMsg.content);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="pl-64 flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100">
              <Bot size={24} />
            </div>
            <h1 className="text-xl font-black text-gray-900">AI Tutor Chat</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest pl-3">Auto-Speak</span>
              <button 
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`p-2 rounded-lg transition-all ${autoSpeak ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "bg-white text-gray-400"}`}
              >
                {autoSpeak ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Subject:</span>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="rounded-xl border-2 border-gray-100 bg-gray-50 px-4 py-2 text-sm text-gray-900 font-bold focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-100 animate-pulse">
                <Sparkles size={48} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900">How can I help you today?</h2>
                <p className="text-gray-500 max-w-sm mx-auto font-medium text-lg mt-2">
                  Select a subject and start chatting or use your voice to ask questions!
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                  msg.role === "user" ? "bg-blue-600 text-white shadow-blue-100" : "bg-white border border-gray-100 text-gray-600"
                }`}>
                  {msg.role === "user" ? <User size={24} /> : <Bot size={24} />}
                </div>
                <div className={`relative max-w-[70%] p-6 rounded-3xl shadow-xl ${
                  msg.role === "user" 
                    ? "bg-blue-600 text-white rounded-tr-none shadow-blue-50" 
                    : "bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-gray-200/20"
                }`}>
                  <p className="text-lg font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  {msg.role === "assistant" && (
                    <button 
                      onClick={() => speak(msg.content)}
                      className="absolute -right-12 top-2 p-3 text-gray-400 hover:text-blue-600 hover:bg-white hover:rounded-xl transition-all"
                    >
                      <Volume2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                <Loader2 size={24} className="animate-spin" />
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 rounded-tl-none flex gap-2 items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-8 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-4">
            <div className="flex-1 relative flex items-center bg-gray-50 border-2 border-gray-100 rounded-3xl focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-blue-50 transition-all px-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask anything about ${subject}...`}
                className="flex-1 bg-transparent px-6 py-5 text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none text-lg"
              />
              <button
                type="button"
                onClick={startListening}
                className={`p-3 rounded-2xl transition-all mr-2 ${isListening ? "text-red-500 bg-red-50 animate-pulse shadow-inner" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"}`}
              >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white p-6 rounded-3xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-2xl shadow-blue-200 hover:scale-105 active:scale-95"
            >
              <Send size={28} />
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
