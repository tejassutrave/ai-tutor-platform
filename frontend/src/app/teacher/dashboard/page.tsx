"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { 
  GraduationCap, 
  Users, 
  ClipboardList, 
  Settings, 
  LogOut, 
  BookOpen, 
  Activity, 
  ArrowRight,
  Sparkles,
  Calendar,
  Plus,
  Trash2,
  Key,
  Clock,
  PlayCircle,
  Eye,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ShieldAlert
} from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface Question {
  question: string;
  options: string[];
  answer: string;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "publisher" | "gradebook">("overview");

  // Publisher States
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", options: ["", "", "", ""], answer: "" }
  ]);
  const [publishing, setPublishing] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState("Medium");
  const [aiCount, setAiCount] = useState(20);
  const [generatingAi, setGeneratingAi] = useState(false);

  // Gradebook States
  const [results, setResults] = useState<any[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  // Active Exam Monitoring States
  const [activeExam, setActiveExam] = useState<any | null>(null);
  const [activeExamTimeLeft, setActiveExamTimeLeft] = useState<number>(0);

  const fetchActiveExam = async () => {
    try {
      const res = await api.get("/quiz/live/active-exam");
      if (res.data) {
        setActiveExam(res.data);
        setActiveExamTimeLeft(res.data.remainingSeconds);
      } else {
        setActiveExam(null);
        setActiveExamTimeLeft(0);
      }
    } catch (err) {
      console.error("Failed to fetch active exam status:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userStr = localStorage.getItem("user");

    if (!token || role !== "teacher" || !userStr) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      router.push("/teacher/login");
    } else {
      setTeacher(JSON.parse(userStr));
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (teacher) {
      fetchActiveExam();
    }
  }, [teacher]);

  useEffect(() => {
    if (activeTab === "publisher" && teacher) {
      fetchActiveExam();
    }
  }, [activeTab, teacher]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeExam && activeExamTimeLeft > 0) {
      interval = setInterval(() => {
        setActiveExamTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            fetchActiveExam(); // check status which will mark it inactive
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeExam, activeExamTimeLeft]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    
    const mStr = String(m).padStart(2, "0");
    const sStr = String(s).padStart(2, "0");
    
    if (h > 0) {
      return `${h}:${mStr}:${sStr}`;
    }
    return `${mStr}:${sStr}`;
  };

  const handleTerminateExam = async () => {
    if (!activeExam) return;
    const confirmClose = window.confirm("Are you sure you want to terminate this live exam immediately? This will force-submit all active student sessions.");
    if (!confirmClose) return;

    try {
      await api.post("/quiz/live/terminate", { quizId: activeExam.id });
      setActiveExam(null);
      setActiveExamTimeLeft(0);
      alert("Exam terminated successfully!");
    } catch (err: any) {
      console.error("Failed to terminate exam:", err);
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || "Please check your connection.";
      if (status === 401 || status === 403) {
        alert(`Access denied (${status}): ${msg}\n\nYour session may have expired. Please log out and log back in to the Teacher Portal.`);
      } else {
        alert(`Failed to terminate exam: ${msg}`);
      }
    }
  };

  // Fetch results when gradebook tab is active
  useEffect(() => {
    if (activeTab === "gradebook" && teacher) {
      fetchResults();
    }
  }, [activeTab, teacher]);

  const fetchResults = async () => {
    setLoadingResults(true);
    try {
      const res = await api.get("/quiz/live/teacher/results");
      const mapped = (res.data || []).map((r: any) => ({
        id: r.id,
        studentName: r.student_name,
        studentUsn: r.student_usn,
        subject: r.live_quizzes?.subject || "Unknown Subject",
        topic: r.live_quizzes?.topic || "Unknown Topic",
        score: r.score,
        totalQuestions: r.total,
        tabSwitchCount: r.tab_switch_count,
        createdAt: r.submitted_at
      }));
      setResults(mapped);
    } catch (err) {
      console.error("Failed to fetch results:", err);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    router.push("/teacher/login");
  };

  // ── Publisher Handlers ──────────────────────────────────────────────────
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], answer: "" },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated.length ? updated : [{ question: "", options: ["", "", "", ""], answer: "" }]);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updated = [...questions];
    updated[index].question = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleAnswerSelect = (qIndex: number, optionValue: string) => {
    const updated = [...questions];
    updated[qIndex].answer = optionValue;
    setQuestions(updated);
  };

  const handleAiGenerate = async () => {
    if (!subject.trim() || !topic.trim()) {
      alert("Please fill in Subject and Topic in Room Configuration first.");
      return;
    }

    const countVal = Math.max(0, Math.min(30, aiCount));

    if (countVal === 0) {
      setQuestions([{ question: "", options: ["", "", "", ""], answer: "" }]);
      return;
    }

    setGeneratingAi(true);
    try {
      const res = await api.post("/quiz/generate", {
        subject: subject.trim(),
        topic: topic.trim(),
        difficulty: aiDifficulty,
        count: countVal,
      });

      if (Array.isArray(res.data) && res.data.length > 0) {
        const formatted = res.data.map((q: any) => ({
          question: q.question || "Generated Question",
          options: Array.isArray(q.options) && q.options.length === 4 
            ? q.options.map((opt: any) => String(opt).trim()) 
            : ["Option A", "Option B", "Option C", "Option D"],
          answer: q.answer || ""
        }));
        setQuestions(formatted);
      } else {
        alert("No questions were generated. Please try again.");
      }
    } catch (err) {
      console.error("AI Generation error:", err);
      alert("Failed to generate questions using AI. Please check your credentials or try again.");
    } finally {
      setGeneratingAi(false);
    }
  };

  const handlePublishExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !topic.trim() || !accessCode.trim()) {
      alert("Please fill in all details.");
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        alert(`Please fill out the question text for Question ${i + 1}`);
        return;
      }
      if (q.options.some((opt) => !opt.trim())) {
        alert(`Please fill out all 4 options for Question ${i + 1}`);
        return;
      }
      if (!q.answer) {
        alert(`Please select the correct answer for Question ${i + 1}`);
        return;
      }
    }

    setPublishing(true);
    try {
      await api.post("/quiz/live/create", {
        subject,
        topic,
        accessCode,
        durationMinutes,
        questions,
      });
      alert("Success! Live exam published.");
      // Reset form
      setSubject("");
      setTopic("");
      setAccessCode("");
      setDurationMinutes(30);
      setQuestions([{ question: "", options: ["", "", "", ""], answer: "" }]);
      
      // Fetch active exam to switch view to the countdown monitor
      await fetchActiveExam();
      setActiveTab("publisher");
    } catch (err) {
      console.error("Failed to publish exam:", err);
      alert("Failed to publish exam.");
    } finally {
      setPublishing(false);
    }
  };

  if (loading || !teacher) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <GraduationCap size={28} />
          </div>
          <p className="text-sm font-bold text-gray-500">Authorizing Portal Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      {/* ── Left Navigation Sidebar ────────────────────────────────────────── */}
      <aside className="w-64 bg-indigo-950 text-white flex flex-col fixed h-full z-20 shadow-xl select-none">
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-indigo-900 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white text-indigo-950 flex items-center justify-center font-black shadow-md">
            T
          </div>
          <div>
            <span className="font-black text-sm tracking-tight block">Instructor Portal</span>
            <span className="text-[10px] font-bold text-indigo-300 block">AI Tutor Platform</span>
          </div>
        </div>

        {/* Navigation Actions */}
        <nav className="flex-1 p-4 space-y-1.5 pt-6">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-3 mb-2">Workspace</div>
          
          <button 
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "overview" 
                ? "bg-indigo-900/60 text-white shadow-sm border border-indigo-800"
                : "text-indigo-200 hover:text-white hover:bg-indigo-900/30 border border-transparent"
            }`}
          >
            <Activity size={15} />
            Assessment Overview
          </button>
          
          <button 
            onClick={() => setActiveTab("gradebook")}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "gradebook" 
                ? "bg-indigo-900/60 text-white shadow-sm border border-indigo-800"
                : "text-indigo-200 hover:text-white hover:bg-indigo-900/30 border border-transparent"
            }`}
          >
            <Users size={15} />
            Live Gradebook
          </button>

          <Link href="/quiz" className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-indigo-200 hover:text-white hover:bg-indigo-900/30 border border-transparent">
            <ClipboardList size={15} />
            Quiz Manager
          </Link>

          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-3 pt-6 mb-2">Controls</div>

          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-indigo-200 hover:text-white hover:bg-indigo-900/30 border border-transparent">
            <Settings size={15} />
            Portal Settings
          </button>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-red-300 hover:text-red-200 hover:bg-red-950/20 border border-transparent"
          >
            <LogOut size={15} />
            Log Out Portal
          </button>
        </nav>

        {/* Active Footer Profile */}
        <div className="p-4 border-t border-indigo-900 bg-indigo-900/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-800 flex items-center justify-center font-bold text-sm text-indigo-100">
            {teacher.name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <span className="font-bold text-xs block truncate text-indigo-50">{teacher.name}</span>
            <span className="text-[9px] font-semibold block truncate text-indigo-400">{teacher.email}</span>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ──────────────────────────────────────────────── */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        {/* Sticky Page Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 select-none">
          <h1 className="text-lg font-black text-gray-900 flex items-center gap-2">
            Assessment Analytics Dashboard
          </h1>
          <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar size={14} /> Today: {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </header>

        <main className="p-8 max-w-6xl mx-auto w-full space-y-8 flex-1">
          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <>
              {/* Welcome Alert */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl flex items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="space-y-2 z-10">
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-black tracking-wider uppercase inline-block mb-1">
                    🛡️ Authorized Teacher Session
                  </span>
                  <h2 className="text-3xl font-black">Welcome back, {teacher.name}! 🏫</h2>
                  <p className="text-indigo-100 font-medium text-sm max-w-lg leading-relaxed">
                    Welcome to your command center. Monitor student accuracy, generate customizable manual/AI quizzes, and log class evaluations.
                  </p>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm hidden md:block">
                  <GraduationCap size={48} className="text-indigo-100" />
                </div>
              </div>

              {/* Feature Quick Launch Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm flex flex-col justify-between h-64 hover:shadow-md transition-shadow">
                  <div className="p-8 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <PlayCircle size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Live Exam Publisher</h3>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                      Publish secure, time-bound assessments for live class environments. Anti-cheat features enabled automatically.
                    </p>
                  </div>
                  <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Ready</span>
                    <button onClick={() => setActiveTab("publisher")} className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors">
                      Launch Publisher <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm flex flex-col justify-between h-64 hover:shadow-md transition-shadow">
                  <div className="p-8 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                      <Eye size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Real-time Gradebook</h3>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                      Monitor ongoing class assessments, view secure student grades, and track anti-cheat violations immediately.
                    </p>
                  </div>
                  <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Live</span>
                    <button onClick={() => setActiveTab("gradebook")} className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors">
                      View Results <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── PUBLISHER TAB ── */}
          {activeTab === "publisher" && (
            activeExam ? (
              // ── Active Exam Monitor Screen ──
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-150 mb-8 space-y-8 select-none">
                <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-red-50 border border-red-100 text-red-600 rounded-xl relative">
                      <Activity size={24} className="animate-pulse" />
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-950">Active Assessment Room</h2>
                      <p className="text-sm text-gray-500 font-bold mt-1">Telemetry and monitoring for the ongoing exam</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-red-50 border border-red-100 text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Live Auditing
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Exam Details */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Assessment Subject</span>
                        <span className="text-xl font-extrabold text-gray-950">{activeExam.subject}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Assessment Topic</span>
                        <span className="text-sm font-bold text-gray-700">{activeExam.topic}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200/60">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Total Questions</span>
                          <span className="text-sm font-black text-gray-900">{activeExam.questions?.length || 0} MCQs</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Duration</span>
                          <span className="text-sm font-black text-gray-900">{activeExam.duration_minutes} Minutes</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider block">Student Access Code</span>
                        <span className="text-2xl font-black text-purple-900 tracking-wider font-mono">{activeExam.access_code}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(activeExam.access_code);
                          alert("Access Code copied to clipboard!");
                        }}
                        className="bg-white hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-sm flex items-center gap-1.5"
                      >
                        Copy Code
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Time Remaining & Controls */}
                  <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-200 flex flex-col justify-between items-center text-center space-y-6">
                    <div className="space-y-2 w-full">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Time Remaining</span>
                      <div className="text-4xl font-black text-gray-950 font-mono tracking-tight tabular-nums bg-white border border-gray-150 py-4 px-6 rounded-2xl shadow-inner flex items-center justify-center gap-2">
                        <Clock size={28} className="text-purple-600 animate-pulse" />
                        {formatTime(activeExamTimeLeft)}
                      </div>
                    </div>

                    <div className="space-y-3 w-full">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("gradebook");
                        }}
                        className="w-full bg-white hover:bg-gray-150 text-gray-800 font-bold py-3 rounded-xl border border-gray-250 transition-all text-xs flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Users size={14} /> Open Live Gradebook
                      </button>
                      <button
                        type="button"
                        onClick={handleTerminateExam}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-black py-3.5 rounded-xl border border-red-100 transition-all text-xs flex items-center justify-center gap-2"
                      >
                        <AlertTriangle size={14} /> Terminate Exam Now
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50/45 p-5 rounded-2xl border border-indigo-100/60 text-xs font-semibold text-indigo-900 leading-relaxed flex gap-3">
                  <ShieldAlert className="text-indigo-600 shrink-0 mt-0.5" size={16} />
                  <div>
                    <span className="font-bold block text-indigo-950 mb-0.5">Automated Sentry Protection Active</span>
                    Students attempting to bypass window focus limits (more than 2 tab switches/minimizations) will have their exams locked down and forced-submitted to the Gradebook.
                  </div>
                </div>
              </div>
            ) : (
              // ── Publish Live Assessment Form ──
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-150 mb-8">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl">
                      <Activity size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-950">Publish Live Assessment</h2>
                      <p className="text-sm text-gray-500 font-bold mt-1">Configure your room, set the code, and launch.</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handlePublishExam} className="space-y-8">
                  {/* Exam Settings */}
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Settings size={16} className="text-gray-500" />
                      Room Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-700 block mb-1.5">Subject</label>
                        <input
                          type="text"
                          required
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="e.g. Computer Science"
                          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-950 font-bold focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-700 block mb-1.5">Topic</label>
                        <input
                          type="text"
                          required
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="e.g. Data Structures"
                          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-950 font-bold focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-black text-purple-700 block mb-1.5">🔑 Access Code</label>
                        <input
                          type="text"
                          required
                          value={accessCode}
                          onChange={(e) => setAccessCode(e.target.value)}
                          placeholder="e.g. CS101-FALL"
                          className="block w-full rounded-lg border border-purple-200 bg-purple-50/50 px-4 py-2.5 text-sm text-gray-950 font-black tracking-widest focus:border-purple-500 focus:outline-none placeholder:text-purple-300 placeholder:font-medium"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-700 block mb-1.5 flex items-center gap-1">
                          <Clock size={12} /> Duration (Minutes)
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="180"
                          value={durationMinutes}
                          onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 30)}
                          className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-950 font-bold focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* AI Questions Generator */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-purple-950 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles size={16} className="text-purple-600 animate-pulse" />
                        AI Questions Generator
                      </h3>
                      <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Powered by Llama 3.3
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                      <div>
                        <label className="text-xs font-bold text-purple-900 block mb-1.5">Difficulty</label>
                        <select
                          value={aiDifficulty}
                          onChange={(e) => setAiDifficulty(e.target.value)}
                          className="block w-full rounded-lg border border-purple-200 bg-white px-3.5 py-2.5 text-sm text-gray-950 font-bold focus:border-purple-500 focus:outline-none"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-purple-900 block mb-1.5">Number of Questions (0 - 30)</label>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={aiCount}
                          onChange={(e) => setAiCount(Math.max(0, Math.min(30, parseInt(e.target.value) || 0)))}
                          className="block w-full rounded-lg border border-purple-200 bg-white px-3.5 py-2.5 text-sm text-gray-950 font-bold focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAiGenerate}
                        disabled={generatingAi}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-200 disabled:opacity-50"
                      >
                        {generatingAi ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} />
                            Generate with AI
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] font-medium text-purple-500 leading-tight">
                      * Make sure to set <strong>Subject</strong> and <strong>Topic</strong> in the Room Configuration above before generating. Generating will overwrite the list below.
                    </p>
                  </div>

                  {/* Question Builder */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <ClipboardList size={16} className="text-gray-500" />
                        Questions Builder
                      </h3>
                    </div>

                    {questions.map((q, qIndex) => (
                      <div key={qIndex} className="bg-white rounded-xl p-6 border-2 border-gray-100 shadow-sm relative focus-within:border-purple-200 transition-colors">
                        <div className="flex justify-between items-center mb-5">
                          <span className="text-xs font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full uppercase tracking-wider">
                            Question {qIndex + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIndex)}
                            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Question"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="mb-5">
                          <label className="text-xs font-bold text-gray-700 block mb-1.5">Question Text</label>
                          <input
                            type="text"
                            required
                            value={q.question}
                            onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                            placeholder="Type your question here..."
                            className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-950 font-bold focus:border-purple-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 mb-2 block">
                            Options (Select the radio button for the correct answer)
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options.map((opt, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-2 bg-gray-50 rounded-lg border border-gray-200 p-2 focus-within:border-purple-500 focus-within:bg-white transition-colors">
                                <input
                                  type="radio"
                                  name={`correct-answer-pub-${qIndex}`}
                                  checked={q.answer !== "" && q.answer === opt}
                                  onChange={() => handleAnswerSelect(qIndex, opt)}
                                  disabled={opt === ""}
                                  className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500 cursor-pointer ml-1"
                                  title="Mark as correct answer"
                                />
                                <input
                                  type="text"
                                  required
                                  value={opt}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    handleOptionChange(qIndex, oIndex, val);
                                    if (q.answer === opt) {
                                      handleAnswerSelect(qIndex, val);
                                    }
                                  }}
                                  placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                  className="flex-1 bg-transparent text-sm text-gray-950 font-semibold focus:outline-none px-1 py-1"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-gray-150">
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-gray-200"
                    >
                      <Plus size={18} />
                      Add Question
                    </button>
                    <button
                      type="submit"
                      disabled={publishing}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200 disabled:opacity-50"
                    >
                      {publishing ? <Loader2 className="animate-spin" size={18} /> : <PlayCircle size={18} />}
                      {publishing ? "Publishing Room..." : "Launch Live Exam"}
                    </button>
                  </div>
                </form>
              </div>
            )
          )}

          {/* ── GRADEBOOK TAB ── */}
          {activeTab === "gradebook" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-150 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-green-100 text-green-700 rounded-xl">
                    <Users size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-950">Live Gradebook & Audits</h2>
                    <p className="text-xs text-gray-500 font-bold mt-0.5">Real-time assessment scores and anti-cheat telemetry</p>
                  </div>
                </div>
                <button 
                  onClick={fetchResults}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                >
                  {loadingResults ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}
                  Refresh Data
                </button>
              </div>

              <div className="flex-1 overflow-auto">
                {loadingResults ? (
                  <div className="flex items-center justify-center h-full min-h-[400px]">
                    <Loader2 className="animate-spin text-green-600" size={32} />
                  </div>
                ) : results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-3 p-8">
                    <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center">
                      <ShieldAlert size={32} />
                    </div>
                    <p className="text-gray-500 font-bold text-sm max-w-sm leading-relaxed">
                      No live exam submissions have been recorded yet. Submissions will appear here instantly once students complete their tests.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/80 sticky top-0 backdrop-blur-sm z-10">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-500 border-b border-gray-100">Student Name</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-500 border-b border-gray-100">USN / ID</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-500 border-b border-gray-100">Assessment</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-500 border-b border-gray-100 text-center">Score</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-500 border-b border-gray-100 text-center">Cheat Violations</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-500 border-b border-gray-100 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {results.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-sm font-extrabold text-gray-950">{r.studentName}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md tracking-widest">{r.studentUsn}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-gray-900 block truncate max-w-[200px]">{r.subject}</span>
                            <span className="text-[10px] font-semibold text-gray-400 block truncate max-w-[200px]">{r.topic}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-50 text-green-700 font-black text-sm shadow-sm border border-green-100">
                              {r.score}
                            </span>
                            <span className="text-xs font-bold text-gray-400 ml-1">/ {r.totalQuestions}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {r.tabSwitchCount > 0 ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-xs font-black animate-pulse">
                                <AlertTriangle size={12} /> {r.tabSwitchCount} Warning{r.tabSwitchCount > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-500 text-xs font-bold">
                                <CheckCircle2 size={12} className="text-green-500" /> Clean
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right text-[11px] font-bold text-gray-400">
                            {new Date(r.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
