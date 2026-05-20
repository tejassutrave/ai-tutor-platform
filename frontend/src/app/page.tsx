"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  MessageSquare, 
  GraduationCap, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Award,
  CheckCircle2,
  XCircle,
  BrainCircuit,
  Volume2,
  Copy
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [quizSelected, setQuizSelected] = useState<string | null>(null);

  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Background Gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-400 to-indigo-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72rem]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-36 items-center justify-between">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
          <div className="mt-12 sm:mt-16 lg:mt-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold leading-6 text-blue-600 ring-1 ring-inset ring-blue-600/10">
              <Sparkles size={14} className="animate-pulse" /> New: Dynamic AI Quiz Practice
            </span>
          </div>
          <h1 className="mt-8 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl leading-none">
            Your Personal <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI Tutor</span> for Every Subject
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 font-medium">
            Master complex topics with personalized explanations, interactive quizzes, and automated study notes. 
            All powered by the latest Gemini 1.5 Flash model and Llama-3.3 high-speed inference.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 hover:shadow-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all transform hover:-translate-y-0.5"
            >
              Get started for free
            </Link>
            <Link href="/login" className="text-sm font-bold leading-6 text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-1">
              Log in <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200/50 flex items-center gap-2 select-none">
            <span className="text-xs font-bold text-gray-500">Are you an instructor?</span>
            <Link 
              href="/teacher/login" 
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-all border border-indigo-100"
            >
              🏫 Access Teacher Portal →
            </Link>
          </div>
        </div>
        
        {/* Modern Interactive Dashboard Mockup Preview */}
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-20">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="-m-2 rounded-2xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-3xl lg:p-4 shadow-xl">
              
              {/* Outer Window Container */}
              <div className="w-[42rem] h-[26rem] rounded-xl bg-white shadow-2xl ring-1 ring-gray-900/10 flex flex-col overflow-hidden">
                
                {/* 1. Windows Browser Top Bar */}
                <div className="h-10 bg-gray-50 border-b border-gray-100 flex items-center justify-between px-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400 block" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400 block" />
                    <span className="w-3 h-3 rounded-full bg-green-400 block" />
                  </div>
                  <div className="bg-white border border-gray-200/80 rounded-md px-12 py-0.5 text-[11px] font-bold text-gray-400 select-none shadow-sm flex items-center gap-1">
                    <BrainCircuit size={10} className="text-blue-500" /> app.aitutor.com
                  </div>
                  <div className="w-12" />
                </div>

                {/* Main Window Workspace */}
                <div className="flex-1 flex overflow-hidden">
                  
                  {/* 2. Left Mock Navigation Sidebar */}
                  <div className="w-44 bg-gray-50/70 border-r border-gray-100 p-4 flex flex-col gap-1.5 select-none">
                    <div className="flex items-center gap-2 mb-5 px-1">
                      <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-100">
                        A
                      </div>
                      <span className="text-xs font-black text-gray-900 tracking-tight">AI Tutor</span>
                    </div>

                    <button 
                      onClick={() => setActiveTab("dashboard")}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeTab === "dashboard" ? "bg-blue-50 text-blue-600 shadow-sm border border-blue-100/50" : "text-gray-500 hover:bg-gray-100/50"
                      }`}
                    >
                      <LayoutDashboard size={14} />
                      Dashboard
                    </button>

                    <button 
                      onClick={() => setActiveTab("chat")}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeTab === "chat" ? "bg-blue-50 text-blue-600 shadow-sm border border-blue-100/50" : "text-gray-500 hover:bg-gray-100/50"
                      }`}
                    >
                      <MessageSquare size={14} />
                      AI Chat
                    </button>

                    <button 
                      onClick={() => {
                        setActiveTab("quiz");
                        setQuizSelected(null);
                      }}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeTab === "quiz" ? "bg-blue-50 text-blue-600 shadow-sm border border-blue-100/50" : "text-gray-500 hover:bg-gray-100/50"
                      }`}
                    >
                      <GraduationCap size={14} />
                      AI Quiz
                    </button>
                    
                    <div className="mt-auto p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100/40">
                      <span className="text-[10px] font-black text-blue-600 block mb-0.5">PRO TIP</span>
                      <span className="text-[9px] font-medium text-gray-600 leading-tight block">Click tabs to preview modules!</span>
                    </div>
                  </div>

                  {/* 3. Right Mock View Panel */}
                  <div className="flex-1 p-6 bg-white overflow-y-auto">
                    
                    {/* View A: Dashboard Preview */}
                    {activeTab === "dashboard" && (
                      <div className="space-y-4 animate-fadeIn">
                        <div>
                          <h3 className="text-sm font-black text-gray-900">Welcome back, Sarah! 👋</h3>
                          <p className="text-[11px] text-gray-400 font-medium">Ready to master organic chemistry today?</p>
                        </div>

                        {/* Top Metrics Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl border border-gray-100 bg-gray-50/30 flex items-center justify-between">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Quiz Accuracy</span>
                              <span className="text-lg font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">92.4%</span>
                            </div>
                            <div className="p-2 bg-green-50 text-green-500 rounded-lg">
                              <Award size={18} />
                            </div>
                          </div>

                          <div className="p-3 rounded-xl border border-gray-100 bg-gray-50/30 flex items-center justify-between">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Study Time</span>
                              <span className="text-lg font-black text-gray-800">12.5 hrs</span>
                            </div>
                            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                              <Clock size={18} />
                            </div>
                          </div>
                        </div>

                        {/* Weak Topics Analysis */}
                        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/10 space-y-2">
                          <div className="flex items-center gap-1.5">
                            <TrendingUp size={14} className="text-indigo-500" />
                            <span className="text-xs font-bold text-gray-800">AI Weak Topics Review</span>
                          </div>
                          <p className="text-[10px] text-gray-500 leading-tight font-medium">Gemini analyzed 3 past quizzes. Focus on these areas:</p>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100/50">Carboxylic Acids</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100/50">Aldehydes</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100/50">Esterification</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* View B: AI Chat Preview */}
                    {activeTab === "chat" && (
                      <div className="space-y-4 animate-fadeIn flex flex-col h-full">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-800">Quantum Physics Discussion</span>
                          <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Llama-3.3 Live</span>
                        </div>

                        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                          {/* User Message */}
                          <div className="flex justify-end">
                            <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-3.5 py-2 text-[11px] font-medium max-w-[85%] shadow-sm">
                              Explain quantum physics simply.
                            </div>
                          </div>

                          {/* AI Message */}
                          <div className="flex gap-2 items-start">
                            <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-[9px] border border-indigo-100">
                              🤖
                            </div>
                            <div className="bg-gray-50 text-gray-800 rounded-2xl rounded-tl-none px-3.5 py-2.5 text-[11px] leading-relaxed font-medium max-w-[85%] border border-gray-100">
                              Think of quantum physics like a magical rulebook for tiny particles. Instead of being in one place, they exist in multiple states at once until we look at them! 💫
                            </div>
                          </div>
                        </div>

                        {/* Text utilities */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto select-none">
                          <div className="flex gap-2">
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                              <Volume2 size={12} />
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                              <Copy size={12} />
                            </button>
                          </div>
                          <span className="text-[9px] font-bold text-gray-400 italic">Try speaking to your chat inside the app!</span>
                        </div>
                      </div>
                    )}

                    {/* View C: Quiz Interactive Preview */}
                    {activeTab === "quiz" && (
                      <div className="space-y-3 animate-fadeIn">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-wider">Practice Session</span>
                          <h4 className="text-xs font-black text-gray-900 leading-tight">What gas do plants absorb during photosynthesis?</h4>
                        </div>

                        {/* Options */}
                        <div className="space-y-2 pt-1">
                          <button 
                            onClick={() => setQuizSelected("A")}
                            className={`w-full text-left p-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-between transition-all ${
                              quizSelected === "A" 
                                ? "border-red-500 bg-red-50/50 text-red-700" 
                                : "border-gray-100 bg-gray-50/20 text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            <span>A) Oxygen</span>
                            {quizSelected === "A" && <XCircle size={14} className="text-red-500" />}
                          </button>

                          <button 
                            onClick={() => setQuizSelected("B")}
                            className={`w-full text-left p-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-between transition-all ${
                              quizSelected === "B" 
                                ? "border-green-500 bg-green-50 text-green-700 shadow-sm" 
                                : "border-gray-100 bg-gray-50/20 text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            <span>B) Carbon Dioxide</span>
                            {quizSelected === "B" && <CheckCircle2 size={14} className="text-green-600" />}
                          </button>

                          <button 
                            onClick={() => setQuizSelected("C")}
                            className={`w-full text-left p-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-between transition-all ${
                              quizSelected === "C" 
                                ? "border-red-500 bg-red-50/50 text-red-700" 
                                : "border-gray-100 bg-gray-50/20 text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            <span>C) Nitrogen</span>
                            {quizSelected === "C" && <XCircle size={14} className="text-red-500" />}
                          </button>
                        </div>

                        {/* Interactive Banner */}
                        <div className="text-center pt-2">
                          {quizSelected === null && (
                            <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-3 py-1 rounded-full animate-pulse">
                              👉 Click the correct option above to test it!
                            </span>
                          )}
                          {quizSelected === "B" && (
                            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full">
                              Correct! Plants absorb Carbon Dioxide to produce glucose. 🎉
                            </span>
                          )}
                          {(quizSelected === "A" || quizSelected === "C") && (
                            <span className="text-[10px] text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full">
                              Oops! Try again. Hint: It's what humans breathe out. 💡
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
