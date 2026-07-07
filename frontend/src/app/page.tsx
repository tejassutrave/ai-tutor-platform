"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Loader2, 
  ChevronRight, 
  ArrowDown, 
  FileText, 
  Video, 
  Layers
} from "lucide-react";

export default function LandingPage() {
  const [activeSection, setActiveSection] = useState("hero");

  // Chat Simulator State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { sender: "ai", text: "Hello! I am your AI Tutor. Choose a prompt below to see how I can help you learn." }
  ]);
  const [isChatTyping, setIsChatTyping] = useState(false);

  // Quiz Simulator State
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);

  // Planner Simulator State
  const [selectedDay, setSelectedDay] = useState<"Mon" | "Tue" | "Wed" | "Thu" | "Fri">("Mon");

  // Flashcards Simulator State
  const [isFlipped, setIsFlipped] = useState(false);

  // Notes Simulator State
  const [showConcepts, setShowConcepts] = useState(false);

  // YouTube Simulator State
  const [ytStatus, setYtStatus] = useState<"idle" | "loading" | "complete">("idle");

  // Observer to track current scrolled-into-view section
  useEffect(() => {
    const sections = ["hero", "chat", "quiz", "planner", "flashcards", "notes", "youtube"];
    const observerOptions = {
      root: null,
      rootMargin: "-45% 0px -45% 0px", // Trigger when section is around the center of the viewport
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Chat Prompt Handler
  const handleChatPrompt = (prompt: string, answer: string) => {
    if (isChatTyping) return;
    
    // Add user question
    setChatMessages(prev => [...prev, { sender: "user", text: prompt }]);
    setIsChatTyping(true);

    setTimeout(() => {
      setIsChatTyping(false);
      setChatMessages(prev => [...prev, { sender: "ai", text: answer }]);
    }, 1500);
  };

  return (
    <div className="relative bg-slate-50 text-slate-800 min-h-screen overflow-x-hidden selection:bg-indigo-500 selection:text-white font-sans">
      
      {/* ── Background Mesh Gradients ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full bg-purple-200/20 blur-[130px]" />
        <div className="absolute top-[40%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-200/20 blur-[120px]" />
      </div>

      {/* ── Side Dots Navigation ── */}
      <nav className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-4 bg-white/80 backdrop-blur-md px-3 py-6 rounded-full border border-slate-200/80 shadow-xl">
        {[
          { id: "hero", label: "Overview" },
          { id: "chat", label: "AI Tutor" },
          { id: "quiz", label: "Practice Quizzes" },
          { id: "planner", label: "Study Planner" },
          { id: "flashcards", label: "Flashcards" },
          { id: "notes", label: "Automated Notes" },
          { id: "youtube", label: "Video Extractor" }
        ].map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            title={item.label}
            className={`w-3.5 h-3.5 rounded-full transition-all duration-300 relative group flex items-center justify-center ${
              activeSection === item.id 
                ? "bg-indigo-650 scale-125 ring-4 ring-indigo-650/20" 
                : "bg-slate-300 hover:bg-slate-400"
            }`}
          >
            <span className="absolute right-7 bg-white text-slate-800 border border-slate-200 text-[10px] font-bold px-2.5 py-1 rounded shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {item.label}
            </span>
          </a>
        ))}
      </nav>

      {/* ── Header Navbar ── */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
            A
          </div>
          <span className="font-black text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">AI Tutor</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
            Log In
          </Link>
          <Link 
            href="/register" 
            className="px-4.5 py-2 text-xs font-black bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl shadow-lg shadow-indigo-600/10 transition-all transform hover:-translate-y-0.5"
          >
            Sign Up Free
          </Link>
        </div>
      </header>

      {/* ── SECTION 1: HERO (OVERVIEW) ── */}
      <section id="hero" className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-32 min-h-[calc(100vh-5rem)] flex flex-col justify-center items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 max-w-4xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-150 px-4 py-1.5 text-xs font-black tracking-wide text-indigo-650 uppercase">
            <Sparkles size={12} className="animate-pulse" /> Next-Generation Learning Engine
          </span>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-none bg-gradient-to-b from-slate-900 via-slate-800 to-slate-650 bg-clip-text text-transparent">
            Your Personal <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-500 bg-clip-text text-transparent">AI Tutor</span> <br className="hidden sm:inline" /> for Every Subject
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Step into a simulated study ecosystem. Practice live, adaptive quizzes, converse with AI tutors, map structured planner tasks, and synthesize YouTube lectures into study guides instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link
              href="/register"
              className="w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-4 text-sm font-black text-white shadow-xl shadow-indigo-600/10 hover:bg-indigo-550 transition-all transform hover:-translate-y-1 text-center"
            >
              Get Started Free
            </Link>
            <Link 
              href="/teacher/login" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-8 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all transform hover:-translate-y-1 shadow-sm"
            >
              🏫 Teacher Portal →
            </Link>
          </div>
        </motion.div>

        {/* Animated Scroll Down Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 flex flex-col items-center gap-2 cursor-pointer select-none"
          onClick={() => document.getElementById("chat")?.scrollIntoView({ behavior: "smooth" })}
        >
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Scroll to Explore Features</span>
          <ArrowDown size={16} className="text-indigo-600" />
        </motion.div>
      </section>

      {/* ── SECTION 2: AI TUTOR CHAT (FEATURE 1) ── */}
      <section id="chat" className="relative z-10 max-w-7xl mx-auto px-6 py-28 border-t border-slate-200/60 min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          
          {/* Left Text Column */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-600">
              <MessageSquare size={24} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Instant explanations on any concept, powered by AI
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              Don&apos;t understand a difficult formula or historical context? Converse directly with your AI tutor. Get answers styled with formatting, simple analogies, and conversational depth.
            </p>
            <ul className="space-y-3.5 pt-2">
              {[
                "Llama-3.3 high-speed inference integration",
                "Text-to-speech audio explanation synthesis",
                "Instant prompts for formula parsing and quick recaps"
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-700 font-bold">
                  <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right Simulator Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Simulator Browser Ribbon */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 block" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Tutor Chat Simulator</span>
              <div className="w-12" />
            </div>

            {/* Chat Messages Log */}
            <div className="h-64 overflow-y-auto space-y-4 pr-1 mb-4 flex flex-col scrollbar-thin">
              {chatMessages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs ${
                    msg.sender === "user" ? "bg-indigo-600 text-white" : "bg-slate-100 border border-slate-200 text-indigo-600"
                  }`}>
                    {msg.sender === "user" ? "U" : "🤖"}
                  </div>
                  <div className={`rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed ${
                    msg.sender === "user" 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-slate-50 border border-slate-150 text-slate-700 rounded-tl-none"
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {isChatTyping && (
                <div className="flex gap-3 max-w-[85%] mr-auto items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-indigo-600 flex items-center justify-center text-xs">
                    🤖
                  </div>
                  <div className="bg-slate-50 border border-slate-150 text-slate-400 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs font-bold flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              )}
            </div>

            {/* Clickable Live Prompts */}
            <div className="space-y-2 select-none border-t border-slate-100 pt-4">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Click a question to test:</span>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleChatPrompt(
                    "Explain photosynthesis in one sentence.",
                    "Photosynthesis is the chemical process where green plants use sunlight to turn water and carbon dioxide into oxygen and energy (glucose). 🌿"
                  )}
                  className="w-full text-left bg-slate-50 hover:bg-slate-100/70 border border-slate-150 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center justify-between group"
                >
                  <span>What is Photosynthesis?</span>
                  <ChevronRight size={14} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </button>
                <button
                  onClick={() => handleChatPrompt(
                    "Explain Python loops simply.",
                    "Python loops (for & while) act like recurring instructions that repeat a block of code as long as a condition is satisfied or for each item in a list! 🔁"
                  )}
                  className="w-full text-left bg-slate-50 hover:bg-slate-100/70 border border-slate-150 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center justify-between group"
                >
                  <span>How do Python loops work?</span>
                  <ChevronRight size={14} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── SECTION 3: PRACTICE QUIZZES (FEATURE 2) ── */}
      <section id="quiz" className="relative z-10 max-w-7xl mx-auto px-6 py-28 border-t border-slate-200/60 min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          
          {/* Left Simulator Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden order-last lg:order-first"
          >
            {/* Quiz Browser Ribbon */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 block" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interactive Quiz Simulator</span>
              <div className="w-12" />
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Question Practice</span>
                <h4 className="text-sm font-extrabold text-slate-800 leading-tight">
                  Which cloud computing concept delivers computing services (servers, storage, databases) over the internet?
                </h4>
              </div>

              {/* Quiz Options */}
              <div className="space-y-2 pt-2">
                {[
                  { key: "A", text: "IaaS (Infrastructure as a Service)", correct: true },
                  { key: "B", text: "SaaS (Software as a Service)", correct: false },
                  { key: "C", text: "PaaS (Platform as a Service)", correct: false }
                ].map((option) => {
                  let borderClass = "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 text-slate-700";
                  if (quizAnswer !== null) {
                    if (option.correct) {
                      borderClass = "border-emerald-500 bg-emerald-50 text-emerald-700";
                    } else if (quizAnswer === option.key) {
                      borderClass = "border-rose-500 bg-rose-50 text-rose-700";
                    }
                  }

                  return (
                    <button
                      key={option.key}
                      onClick={() => setQuizAnswer(option.key)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${borderClass}`}
                    >
                      <span>{option.key}) {option.text}</span>
                      {quizAnswer !== null && option.correct && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                      {quizAnswer === option.key && !option.correct && <XCircle size={16} className="text-rose-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Interactive Feedbacks */}
              <div className="text-center pt-2 select-none min-h-[40px]">
                {quizAnswer === null && (
                  <span className="text-[11px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full animate-pulse inline-block">
                    👉 Click the correct option above to test it!
                  </span>
                )}
                {quizAnswer === "A" && (
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full inline-block">
                    🎉 Correct! IaaS provides the fundamental raw hardware resources over the cloud.
                  </span>
                )}
                {(quizAnswer === "B" || quizAnswer === "C") && (
                  <span className="text-[11px] text-rose-700 font-bold bg-rose-50 border border-rose-100 px-4 py-1.5 rounded-full inline-block">
                    ❌ Incorrect! SaaS provides complete apps, and PaaS provides execution runtimes. Try option A!
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Text Column */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-600">
              <GraduationCap size={24} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Adaptive tests configured dynamically using AI
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              Verify your comprehension on any topic using custom interactive evaluations. Generate difficulty-customized assessments or connect to live teacher classrooms featuring proctor tab-audit telemetry.
            </p>
            <ul className="space-y-3.5 pt-2">
              {[
                "Proctor mode anti-cheat monitoring for schools",
                "Llama-3.3 dynamic quiz option generator",
                "Instant accuracy evaluation and weak-spot mapping"
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-700 font-bold">
                  <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </motion.div>

        </div>
      </section>

      {/* ── SECTION 4: SMART PLANNER (FEATURE 3) ── */}
      <section id="planner" className="relative z-10 max-w-7xl mx-auto px-6 py-28 border-t border-slate-200/60 min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          
          {/* Left Text Column */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-600">
              <Calendar size={24} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Stay organized with intelligent weekly planning
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              Plan out assignments, study goals, and examination preparations. Set target review hours, track progress scores, and customize target timelines with daily schedules.
            </p>
            <ul className="space-y-3.5 pt-2">
              {[
                "Dynamic progress tracker charts",
                "Adaptive scheduling intervals based on difficulty",
                "Visual timeline cards categorized by subject weight"
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-700 font-bold">
                  <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right Simulator Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Planner Browser Ribbon */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 block" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Study Planner Simulator</span>
              <div className="w-12" />
            </div>

            {/* Weekdays tabs */}
            <div className="flex items-center justify-between bg-slate-100/80 border border-slate-200 p-1.5 rounded-xl mb-6 select-none">
              {(["Mon", "Tue", "Wed", "Thu", "Fri"] as const).map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${
                    selectedDay === day 
                      ? "bg-indigo-600 text-white shadow" 
                      : "text-slate-500 hover:text-slate-750"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Switchable content */}
            <div className="space-y-4 min-h-[140px]">
              {selectedDay === "Mon" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black text-indigo-650 uppercase tracking-wider block">Subject</span>
                      <span className="text-xs font-extrabold text-slate-800">Algorithms & Data Structures</span>
                    </div>
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100/50 px-2 py-0.5 rounded-full">
                      2.5 hrs
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider block">Subject</span>
                      <span className="text-xs font-extrabold text-slate-800">Physics II: Electromagnetism</span>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/50 px-2 py-0.5 rounded-full">
                      1.5 hrs
                    </span>
                  </div>
                </motion.div>
              )}

              {selectedDay === "Tue" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black text-purple-600 uppercase tracking-wider block">Subject</span>
                      <span className="text-xs font-extrabold text-slate-800">Linear Algebra: Vector Spaces</span>
                    </div>
                    <span className="text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100/50 px-2 py-0.5 rounded-full">
                      3.0 hrs
                    </span>
                  </div>
                </motion.div>
              )}

              {selectedDay === "Wed" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider block">Subject</span>
                      <span className="text-xs font-extrabold text-slate-800">Chemistry: Organic Nomenclature</span>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100/50 px-2 py-0.5 rounded-full">
                      2.0 hrs
                    </span>
                  </div>
                </motion.div>
              )}

              {selectedDay === "Thu" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider block">Subject</span>
                      <span className="text-xs font-extrabold text-slate-800">Operating Systems: Semaphores</span>
                    </div>
                    <span className="text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100/50 px-2 py-0.5 rounded-full">
                      2.5 hrs
                    </span>
                  </div>
                </motion.div>
              )}

              {selectedDay === "Fri" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black text-indigo-650 uppercase tracking-wider block">Subject</span>
                      <span className="text-xs font-extrabold text-slate-800">Algorithms & Data Structures</span>
                    </div>
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100/50 px-2 py-0.5 rounded-full">
                      1.5 hrs
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider block">Subject</span>
                      <span className="text-xs font-extrabold text-slate-800">Chemistry: Practice Lab</span>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100/50 px-2 py-0.5 rounded-full">
                      2.0 hrs
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Bottom mini metric */}
            <div className="border-t border-slate-100 pt-4 mt-4 flex justify-between items-center select-none text-[10px] font-bold text-slate-400">
              <span>Progress Score: 85%</span>
              <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">11 Hours Logged</span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── SECTION 5: INTERACTIVE FLASHCARDS (FEATURE 4) ── */}
      <section id="flashcards" className="relative z-10 max-w-7xl mx-auto px-6 py-28 border-t border-slate-200/60 min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          
          {/* Left Simulator Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center order-last lg:order-first"
          >
            {/* 3D Rotate Container */}
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-80 h-48 cursor-pointer [perspective:1000px] select-none"
            >
              <div 
                className={`relative w-full h-full text-center transition-all duration-700 [transform-style:preserve-3d] ${
                  isFlipped ? "[transform:rotateY(180deg)]" : ""
                }`}
              >
                {/* Front Side */}
                <div className="absolute inset-0 w-full h-full bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between items-center shadow-2xl [backface-visibility:hidden]">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Question (Flashcard Front)</span>
                  <p className="text-sm font-extrabold text-slate-800 text-center leading-normal">
                    What primary function does Mitochondria execute inside living eukaryotic cells?
                  </p>
                  <span className="text-[9px] font-bold text-slate-400 hover:text-indigo-650 transition-colors">
                    🖱️ Click to reveal answer
                  </span>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 w-full h-full bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between items-center shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Answer (Flashcard Back)</span>
                  <p className="text-sm font-extrabold text-slate-700 text-center leading-normal">
                    ⚡ Produces adenosine triphosphate (ATP) through cellular respiration, acting as the cell&apos;s primary energy converter.
                  </p>
                  <span className="text-[9px] font-bold text-slate-400">
                    🖱️ Click to flip back
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-6 select-none font-bold">
              Tip: Flip the card back and forth to check out the 3D rotation animation.
            </p>
          </motion.div>

          {/* Right Text Column */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-600">
              <Layers size={24} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Reinforce long-term memory with Spaced Repetition
            </h2>
            <p className="text-slate-550 text-base leading-relaxed">
              Create specialized flashcard deck folders automatically using AI. Review custom answers, mark card mastery level, and allow AI scheduling intervals to queue reviews before exams.
            </p>
            <ul className="space-y-3.5 pt-2">
              {[
                "Interactive 3D flip-card navigation controls",
                "Spaced repetition scheduling algorithm integration",
                "Dynamic category labeling and tag categorization"
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-700 font-bold">
                  <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </motion.div>

        </div>
      </section>

      {/* ── SECTION 6: AUTOMATED STUDY NOTES (FEATURE 5) ── */}
      <section id="notes" className="relative z-10 max-w-7xl mx-auto px-6 py-28 border-t border-slate-200/60 min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          
          {/* Left Text Column */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-600">
              <FileText size={24} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Create structured study guides and lecture summaries
            </h2>
            <p className="text-slate-550 text-base leading-relaxed">
              Organize complex lecture scripts, slides, or chapters into cleanly formatted study notes. Generate bulleted concept structures, key term glossaries, and tag directories automatically.
            </p>
            <ul className="space-y-3.5 pt-2">
              {[
                "Markdown syntax formatter compatibility",
                "AI-powered concept keyword extractor engine",
                "Quick copy and clipboard sharing tools"
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-700 font-bold">
                  <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right Simulator Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Notes Browser Ribbon */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 block" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Study Notes Simulator</span>
              <div className="w-12" />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full inline-block">
                  Topic: Operating System Kernels
                </span>
                <h4 className="text-sm font-extrabold text-slate-800">Core Architectural Concepts</h4>
              </div>

              {/* Note Content Display */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-[11px] leading-relaxed text-slate-650 space-y-2.5">
                <p className="font-semibold text-slate-800">1. Monolithic vs. Microkernel Architecture</p>
                <p>
                  Monolithic systems run all OS operations (file systems, memory managers) in kernel space. Microkernels delegate operations to userspace servers, improving resilience.
                </p>
                <p className="font-semibold text-slate-800">2. System Interrupt Handlers</p>
                <p>
                  Signals triggering CPU execution shifts. Hardware interrupts arrive asynchronously, while software traps are synchronous.
                </p>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex justify-between items-center select-none">
                <button
                  onClick={() => setShowConcepts(!showConcepts)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow shadow-indigo-600/10 flex items-center gap-1.5"
                >
                  <Sparkles size={13} />
                  {showConcepts ? "Hide Key Concepts" : "Extract Key Concepts"}
                </button>
                <span className="text-[10px] font-bold text-slate-400">Auto-extracted tags</span>
              </div>

              {/* Dynamic Concept Extraction Reveal */}
              <AnimatePresence>
                {showConcepts && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 mt-2"
                  >
                    {[
                      { text: "Monolithic", color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
                      { text: "Microkernel", color: "text-purple-600 bg-purple-50 border-purple-100" },
                      { text: "Interrupts", color: "text-amber-600 bg-amber-50 border-amber-100" },
                      { text: "CPU Trap", color: "text-emerald-600 bg-emerald-50 border-emerald-100" }
                    ].map((tag, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold border ${tag.color}`}
                      >
                        {tag.text}
                      </span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── SECTION 7: YOUTUBE EXTRACTOR (FEATURE 6) ── */}
      <section id="youtube" className="relative z-10 max-w-7xl mx-auto px-6 py-28 border-t border-slate-200/60 min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          
          {/* Left Simulator Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden order-last lg:order-first"
          >
            {/* YouTube Browser Ribbon */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 block" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">YouTube Extractor Simulator</span>
              <div className="w-12" />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-rose-600 uppercase tracking-wider block">YouTube Lecture URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    className="flex-1 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-550 select-all outline-none"
                  />
                  <button
                    onClick={() => {
                      if (ytStatus === "idle") {
                        setYtStatus("loading");
                        setTimeout(() => setYtStatus("complete"), 2000);
                      } else {
                        setYtStatus("idle");
                      }
                    }}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 rounded-xl transition-all flex items-center justify-center shrink-0"
                  >
                    {ytStatus === "loading" ? <Loader2 size={14} className="animate-spin" /> : "Analyze"}
                  </button>
                </div>
              </div>

              {/* YouTube Analysis Output Display */}
              <div className="min-h-[140px] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-150 p-4 select-none">
                {ytStatus === "idle" && (
                  <div className="text-center space-y-2">
                    <Video className="mx-auto text-slate-400 animate-pulse" size={24} />
                    <p className="text-[10px] font-bold text-slate-500 leading-normal">
                      Click the &quot;Analyze&quot; button to trigger lecture transcript simulation.
                    </p>
                  </div>
                )}

                {ytStatus === "loading" && (
                  <div className="text-center space-y-3">
                    <Loader2 className="mx-auto text-rose-550 animate-spin" size={24} />
                    <p className="text-[10px] font-extrabold text-slate-400">
                      Parsing video stream transcript...
                    </p>
                  </div>
                )}

                {ytStatus === "complete" && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="w-full space-y-3 text-left"
                  >
                    <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                      <span className="text-[10px] font-black text-emerald-600">Analysis Successful</span>
                      <span className="text-[8px] font-black bg-slate-100 px-2 py-0.5 rounded text-slate-500">4:25 Duration</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-700">Video Title: Introduction to Machine Learning</p>
                      <p className="text-[9.5px] leading-relaxed text-slate-500">
                        Summary: Explains supervised vs. unsupervised training patterns, defining parameter weights, loss optimizations, and gradient descent convergence.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Text Column */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-600">
              <Video size={24} />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Convert video lectures into searchable transcripts
            </h2>
            <p className="text-slate-500 text-base leading-relaxed">
              Input public YouTube video streams to extract complete scripts, segment timestamps, and summaries automatically. Allow AI to queue corresponding quiz mockups directly from video material.
            </p>
            <ul className="space-y-3.5 pt-2">
              {[
                "YouTube link parsing capability",
                "Video timestamp bookmark mapping",
                "Automated corresponding dynamic quiz generators"
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-700 font-bold">
                  <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </motion.div>

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-slate-200/80 py-12 text-center text-xs font-bold text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-[10px]">
              A
            </div>
            <span className="font-extrabold text-slate-700">AI Tutor Platform</span>
          </div>
          <p className="text-slate-500">© 2026 AI Tutor Inc. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
