"use client";

import { useState, useEffect, useRef } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { ClipboardList, CheckCircle2, XCircle, Loader2, RefreshCw, Sparkles, PenTool, Plus, Trash2, ShieldAlert, Key, Users, BookOpen, Clock, Activity, AlertTriangle } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  answer: string;
}

export default function QuizPage() {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const [quizMode, setQuizMode] = useState<"ai" | "manual" | "live">("ai");
  const [manualQuestions, setManualQuestions] = useState<Question[]>([
    { question: "", options: ["", "", "", ""], answer: "" }
  ]);

  // ── Live Quiz States ────────────────────────────────────────────────────────
  const [liveQuizzes, setLiveQuizzes] = useState<any[]>([]);
  const [loadingLive, setLoadingLive] = useState(false);
  const [selectedLiveQuiz, setSelectedLiveQuiz] = useState<any | null>(null);
  
  // Student registration states
  const [studentName, setStudentName] = useState("");
  const [studentUsn, setStudentUsn] = useState("");
  const [studentAccessCode, setStudentAccessCode] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  // Active exam states
  const [isExamActive, setIsExamActive] = useState(false);
  const [activeExamId, setActiveExamId] = useState("");
  const [activeExamDetails, setActiveExamDetails] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [examSubmittedSuccessfully, setExamSubmittedSuccessfully] = useState(false);

  // References for tracking state inside listeners without closures
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const tabSwitchCountRef = useRef(0);
  const isExamActiveRef = useRef(false);
  const userAnswersRef = useRef<string[]>([]);
  const lastViolationTimeRef = useRef<number>(0);
  // Refs for student credentials so they are always current in async callbacks
  const studentNameRef = useRef("");
  const studentUsnRef = useRef("");
  const activeExamIdRef = useRef("");

  // Keep refs up to date with latest state values
  useEffect(() => { userAnswersRef.current = userAnswers; }, [userAnswers]);
  useEffect(() => { isExamActiveRef.current = isExamActive; }, [isExamActive]);
  useEffect(() => { tabSwitchCountRef.current = tabSwitchCount; }, [tabSwitchCount]);
  useEffect(() => { studentNameRef.current = studentName; }, [studentName]);
  useEffect(() => { studentUsnRef.current = studentUsn; }, [studentUsn]);
  useEffect(() => { activeExamIdRef.current = activeExamId; }, [activeExamId]);

  // ── Fetch Live Quizzes ──────────────────────────────────────────────────────
  const fetchLiveQuizzes = async () => {
    setLoadingLive(true);
    try {
      const res = await api.get("/quiz/live/active");
      setLiveQuizzes(res.data);
    } catch (err) {
      console.error("Failed to load active exams:", err);
    } finally {
      setLoadingLive(false);
    }
  };

  useEffect(() => {
    if (quizMode === "live" && !isExamActive) {
      fetchLiveQuizzes();
    }
  }, [quizMode, isExamActive]);

  // ── Unlock Exam ─────────────────────────────────────────────────────────────
  const handleUnlockExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentUsn.trim() || !studentAccessCode.trim()) {
      alert("Please fill in all details.");
      return;
    }
    setUnlocking(true);
    try {
      const res = await api.post("/quiz/live/unlock", {
        quizId: selectedLiveQuiz.id,
        accessCode: studentAccessCode.trim(),
        studentName: studentName.trim(),
        studentUsn: studentUsn.trim().toUpperCase()
      });

      // Successfully unlocked!
      setQuestions(res.data.questions);
      const initialAnswers = new Array(res.data.questions.length).fill("");
      setUserAnswers(initialAnswers);
      userAnswersRef.current = initialAnswers;

      // Set timer (use real remaining seconds from backend if available)
      const durationSecs = res.data.remainingSeconds !== undefined ? res.data.remainingSeconds : res.data.durationMinutes * 60;
      setTimeLeft(durationSecs);

      // Set exam status
      setActiveExamId(selectedLiveQuiz.id);
      setActiveExamDetails({
        subject: res.data.subject,
        topic: res.data.topic,
        teacherName: selectedLiveQuiz.teacherName
      });
      setIsExamActive(true);
      isExamActiveRef.current = true;
      setTabSwitchCount(0);
      tabSwitchCountRef.current = 0;
      lastViolationTimeRef.current = 0;
      setExamSubmittedSuccessfully(false);

      // Close registration modal state
      setSelectedLiveQuiz(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to unlock quiz. Please check access code.");
    } finally {
      setUnlocking(false);
    }
  };

  // ── Submit Exam (Live) ──────────────────────────────────────────────────────
  const submitLiveExam = async (forceTimeOut = false) => {
    // Clear timer
    if (timerRef.current) clearInterval(timerRef.current);

    setIsExamActive(false);
    isExamActiveRef.current = false;

    try {
      const finalAnswers = userAnswersRef.current;
      const finalTabSwitches = tabSwitchCountRef.current;
      // Use refs so we always get the current value even inside async/event callbacks
      const finalStudentName = studentNameRef.current;
      const finalStudentUsn = studentUsnRef.current;

      await api.post("/quiz/live/submit", {
        quizId: activeExamIdRef.current,
        studentName: finalStudentName,
        studentUsn: finalStudentUsn,
        userAnswers: finalAnswers,
        tabSwitchCount: finalTabSwitches
      });

      setExamSubmittedSuccessfully(true);
      setQuestions([]); // clean questions to show success page
      if (forceTimeOut) {
        alert("Time limit reached! Your exam has been automatically submitted.");
      }
    } catch (err: any) {
      console.error("Failed to submit exam:", err);
      const errMsg = err.response?.data?.message || "Please check your internet connection.";
      alert(`Error submitting exam: ${errMsg}`);
    }
  };

  // ── Countdown Timer Hook ────────────────────────────────────────────────────
  useEffect(() => {
    if (isExamActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            submitLiveExam(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isExamActive, timeLeft]);

  // ── Telemetry & Active Status Polling Hook ──────────────────────────────────
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;

    if (isExamActive && activeExamId) {
      pollInterval = setInterval(async () => {
        try {
          const res = await api.get(`/quiz/live/check-active?quizId=${activeExamId}`);
          if (res.data) {
            if (!res.data.active) {
              clearInterval(pollInterval!);
              alert("This assessment has been terminated by the instructor.");
              submitLiveExam(false); // force submit without time-out alert message
            } else if (res.data.remainingSeconds !== undefined) {
              // Sync the clock with the server's time left if there's drift
              const serverTimeLeft = res.data.remainingSeconds;
              if (Math.abs(timeLeft - serverTimeLeft) > 5) {
                setTimeLeft(serverTimeLeft);
              }
            }
          }
        } catch (err) {
          console.error("Error polling exam status:", err);
        }
      }, 10000); // Poll every 10 seconds
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isExamActive, activeExamId, timeLeft]);

  // ── Tab Sentry Cheat Violation ──────────────────────────────────────────────
  const triggerCheatViolation = () => {
    const now = Date.now();
    // Ignore violations within 1.5 seconds of each other to prevent duplicate triggers from browser native alert blurs
    if (now - lastViolationTimeRef.current < 1500) {
      return;
    }
    lastViolationTimeRef.current = now;

    const newCount = tabSwitchCountRef.current + 1;
    tabSwitchCountRef.current = newCount;
    setTabSwitchCount(newCount);

    if (newCount >= 3) {
      alert("🚨 SECURITY LOCKOUT! You have switched windows/tabs more than 2 times. The exam will now be automatically submitted.");
      submitLiveExam(false);
    } else {
      alert(`⚠️ WARNING: Switching windows or tabs is strictly prohibited! Violation logged (${newCount}/2). If you switch again, your exam will be automatically locked and submitted.`);
    }
  };

  useEffect(() => {
    // Only use visibilitychange — it is the most reliable cross-browser event
    // for detecting tab switches. 'blur' fires at the same time on the same
    // tab switch and would double-count every violation.
    const handleVisibilityChange = () => {
      if (isExamActiveRef.current && document.hidden) {
        triggerCheatViolation();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleLiveOptionChange = (qIdx: number, option: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[qIdx] = option;
    setUserAnswers(newAnswers);
    userAnswersRef.current = newAnswers;
  };

  // ── Manual Quiz Handlers ──────────────────────────────────────────────────
  const handleAddManualQuestion = () => {
    setManualQuestions([
      ...manualQuestions,
      { question: "", options: ["", "", "", ""], answer: "" },
    ]);
  };

  const handleRemoveManualQuestion = (index: number) => {
    const updated = manualQuestions.filter((_, i) => i !== index);
    setManualQuestions(updated.length ? updated : [{ question: "", options: ["", "", "", ""], answer: "" }]);
  };

  const handleManualQuestionChange = (index: number, value: string) => {
    const updated = [...manualQuestions];
    updated[index].question = value;
    setManualQuestions(updated);
  };

  const handleManualOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...manualQuestions];
    updated[qIndex].options[oIndex] = value;
    setManualQuestions(updated);
  };

  const handleManualAnswerSelect = (qIndex: number, optionValue: string) => {
    const updated = [...manualQuestions];
    updated[qIndex].answer = optionValue;
    setManualQuestions(updated);
  };

  const startManualQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      alert("Please enter a subject.");
      return;
    }
    if (!topic.trim()) {
      alert("Please enter a topic.");
      return;
    }
    for (let i = 0; i < manualQuestions.length; i++) {
      const q = manualQuestions[i];
      if (!q.question.trim()) {
        alert(`Please fill out the question text for Question ${i + 1}`);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        alert(`Please fill out all 4 options for Question ${i + 1}`);
        return;
      }
      if (!q.answer) {
        alert(`Please select the correct answer for Question ${i + 1}`);
        return;
      }
    }
    setQuestions(manualQuestions);
    setUserAnswers(new Array(manualQuestions.length).fill(""));
    setSubmitted(false);
    setScore(0);
  };

  // ── Generate Quiz ───────────────────────────────────────────────────────────
  const generateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitted(false);
    setScore(0);
    setUserAnswers([]);

    try {
      const res = await api.post("/quiz/generate", { subject, topic, difficulty, count: numQuestions });
      setQuestions(res.data);
      setUserAnswers(new Array(res.data.length).fill(""));
    } catch (err) {
      console.error("Failed to generate quiz:", err);
      alert("Error generating quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Handle Option Change (AI / Manual) ────────────────────────────────────
  const handleOptionChange = (qIdx: number, option: string) => {
    if (submitted) return;
    const newAnswers = [...userAnswers];
    newAnswers[qIdx] = option;
    setUserAnswers(newAnswers);
  };

  // ── Submit Quiz (AI / Manual) ─────────────────────────────────────────────
  const submitQuiz = async () => {
    let currentScore = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) currentScore++;
    });
    setScore(currentScore);
    setSubmitted(true);

    try {
      await api.post("/quiz/submit", {
        subject,
        topic,
        difficulty,
        questions,
        score: currentScore,
        total: questions.length,
      });
    } catch (err) {
      console.error("Failed to submit quiz results:", err);
    }
  };

  return (
    <ProtectedRoute>
      <div className="pl-64 min-h-screen bg-gray-50 pb-20 text-gray-900">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-900">AI Knowledge Quiz</h1>
        </header>

        <div className="p-8 max-w-4xl mx-auto">
          {/* Main Top Navigation Tabs */}
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200/65 mb-8 gap-1">
            <button
              onClick={() => {
                setQuizMode("ai");
                setQuestions([]); // clear current questions to return to generation form
                setExamSubmittedSuccessfully(false);
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                quizMode === "ai"
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Sparkles size={16} />
              🤖 AI Generated Quiz
            </button>
            <button
              onClick={() => {
                setQuizMode("manual");
                setQuestions([]); // clear current questions to return to manual form
                setExamSubmittedSuccessfully(false);
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                quizMode === "manual"
                  ? "bg-indigo-50 text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <PenTool size={16} />
              ✍️ Custom Manual Quiz
            </button>
            <button
              onClick={() => {
                setQuizMode("live");
                setQuestions([]); // clear current questions to return to live list
                setExamSubmittedSuccessfully(false);
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                quizMode === "live"
                  ? "bg-purple-50 text-purple-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Activity size={16} />
              🎒 Live Class Exams
            </button>
          </div>

          {/* 🎒 Live Class Exams List Section */}
          {quizMode === "live" && !isExamActive && !examSubmittedSuccessfully && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Live Assessment Rooms</h2>
                  <p className="text-sm text-gray-500 font-medium mt-1">Authorized tests launched by college instructors</p>
                </div>
                <button 
                  onClick={fetchLiveQuizzes}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                  title="Refresh Active List"
                >
                  <RefreshCw size={18} className={loadingLive ? "animate-spin" : ""} />
                </button>
              </div>

              {loadingLive ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-purple-600" size={36} />
                </div>
              ) : liveQuizzes.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-gray-150 text-center space-y-4">
                  <div className="mx-auto w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">No active assessments found</h3>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                    There are no live exams scheduled at this moment. Check back when your professor provides a secure access code.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {liveQuizzes.map((quiz) => (
                    <div key={quiz.id} className="bg-white rounded-2xl border border-gray-150 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="px-2.5 py-1 text-[10px] font-black text-purple-700 bg-purple-50 rounded-full uppercase tracking-wider">
                            Active Assessment
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400 font-semibold">
                            <Clock size={12} /> {quiz.durationMinutes} Min
                          </span>
                        </div>
                        <h3 className="text-lg font-extrabold text-gray-950 leading-tight">{quiz.subject}</h3>
                        <p className="text-sm font-semibold text-gray-700 block truncate">Topic: {quiz.topic}</p>
                        <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            {quiz.teacherName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-gray-400 font-bold">By {quiz.teacherName}</span>
                        </div>
                      </div>
                      <div className="pt-6">
                        <button
                          onClick={() => {
                            setSelectedLiveQuiz(quiz);
                            setStudentAccessCode("");
                          }}
                          className="w-full bg-purple-600 text-white font-bold py-2.5 rounded-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Key size={14} /> Enter Exam Room
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 🔑 Unlock Credentials & Access Code Prompt Modal */}
          {selectedLiveQuiz && (
            <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
              <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-gray-100 space-y-6">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3">
                    <Key size={24} />
                  </div>
                  <h3 className="text-xl font-black text-gray-950">Verify Exam Authorization</h3>
                  <p className="text-xs text-gray-500 leading-normal mt-1">
                    Please provide your authentic college credentials and the access code to unlock the assessment.
                  </p>
                </div>

                <form onSubmit={handleUnlockExam} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1">Student Full Name</label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-950 font-medium focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1">USN (University Serial Number)</label>
                    <input
                      type="text"
                      required
                      value={studentUsn}
                      onChange={(e) => setStudentUsn(e.target.value)}
                      placeholder="e.g. 1RV22CS045"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-950 font-black focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100/50">
                    <label className="text-[10px] font-black text-purple-700 uppercase tracking-wider block mb-1">🔑 Access Code</label>
                    <input
                      type="password"
                      required
                      value={studentAccessCode}
                      onChange={(e) => setStudentAccessCode(e.target.value)}
                      placeholder="Enter access code"
                      className="w-full rounded-lg border border-purple-200 px-3 py-2 text-sm text-gray-950 font-black tracking-widest focus:border-purple-500 focus:outline-none text-center"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedLiveQuiz(null)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-bold transition-all text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={unlocking}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-bold transition-all text-sm flex items-center justify-center gap-1.5"
                    >
                      {unlocking ? "Verifying..." : "Unlock Assessment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ❌ Successful Lock & Grade forwarded Landing screen */}
          {examSubmittedSuccessfully && (
            <div className="bg-white rounded-2xl p-12 border border-gray-150 text-center space-y-6 max-w-xl mx-auto shadow-sm select-none">
              <div className="mx-auto w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center shadow-sm">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-950">Assessment Lock Success!</h3>
                <p className="text-xs font-black text-green-600 bg-green-50 inline-block px-3 py-1 rounded-full uppercase tracking-wider">
                  Grade Securely Uploaded
                </p>
                <p className="text-sm text-gray-500 leading-relaxed pt-2">
                  Thank you! Your responses have been safely saved, locked, and submitted to **{activeExamDetails?.teacherName}** for grading. 
                </p>
                <p className="text-xs text-red-500 font-bold italic leading-normal">
                  In compliance with exam regulations, correct answers and individual scores will not be displayed to students.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                <div className="bg-gray-50 p-4 rounded-xl text-left border border-gray-100 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 block uppercase">Registration Details</span>
                  <span className="text-xs font-black block text-gray-800">Student: {studentName}</span>
                  <span className="text-xs font-black block text-gray-800">USN: {studentUsn}</span>
                  <span className="text-xs font-black block text-gray-800">Assessment: {activeExamDetails?.subject} ({activeExamDetails?.topic})</span>
                </div>
                <button
                  onClick={() => {
                    setExamSubmittedSuccessfully(false);
                    setQuizMode("ai");
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all mt-2"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* 🤖 Standard AI Quiz Generator */}
          {quizMode === "ai" && (!questions.length || submitted) && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <ClipboardList size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Generate a New Quiz</h2>
                  <p className="text-sm text-gray-500 font-medium">Customized questions powered by AI</p>
                </div>
              </div>

              <form onSubmit={generateQuiz} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="text-sm font-bold text-gray-700">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Science"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="text-sm font-bold text-gray-700">Topic</label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Photosynthesis"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="text-sm font-bold text-gray-700">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-bold focus:border-blue-500 focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="text-sm font-bold text-gray-700">Questions (Max 20)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-4 mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-100"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <RefreshCw size={18} />}
                    {loading ? "Generating Quiz..." : "Generate Quiz"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ✍️ Custom Manual Quiz Builder */}
          {quizMode === "manual" && (!questions.length || submitted) && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <PenTool size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Create a Custom Quiz</h2>
                  <p className="text-sm text-gray-500 font-medium">Design your own questions and options</p>
                </div>
              </div>

              <form onSubmit={startManualQuiz} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-gray-700">Subject</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. History"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700">Topic</label>
                    <input
                      type="text"
                      required
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. World War II"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-6 border-t border-gray-100 pt-6">
                  {manualQuestions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-gray-55 rounded-xl p-6 border border-gray-200 relative">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                          Question {qIndex + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveManualQuestion(qIndex)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Question"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="mb-4">
                        <label className="text-sm font-bold text-gray-700">Question Text</label>
                        <input
                          type="text"
                          required
                          value={q.question}
                          onChange={(e) => handleManualQuestionChange(qIndex, e.target.value)}
                          placeholder="e.g. Who was the first President of the United States?"
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 font-medium focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">
                          Options (Check the circle of the correct answer)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((opt, oIndex) => {
                            return (
                              <div key={oIndex} className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-2 focus-within:border-indigo-500">
                                <input
                                  type="radio"
                                  name={`correct-answer-${qIndex}`}
                                  checked={q.answer !== "" && q.answer === opt}
                                  onChange={() => handleManualAnswerSelect(qIndex, opt)}
                                  disabled={opt === ""}
                                  className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer"
                                  title="Mark as correct answer"
                                />
                                <input
                                  type="text"
                                  required
                                  value={opt}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    handleManualOptionChange(qIndex, oIndex, val);
                                    if (q.answer === opt) {
                                      handleManualAnswerSelect(qIndex, val);
                                    }
                                  }}
                                  placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                  className="flex-1 text-sm text-gray-900 font-medium focus:outline-none"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleAddManualQuestion}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 border border-gray-300"
                  >
                    <Plus size={18} />
                    Add Question
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                  >
                    Start Custom Quiz ({manualQuestions.length} Questions)
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Standard AI or Custom Manual Quiz Question list (Student viewable score) */}
          {quizMode !== "live" && questions.length > 0 && (
            <div className="space-y-6">
              {submitted && (
                <div className={`p-6 rounded-2xl border text-center ${
                  (score / questions.length) >= 0.8 ? "bg-green-50 border-green-100 text-green-700" : "bg-blue-50 border-blue-100 text-blue-700"
                }`}>
                  <h3 className="text-2xl font-black mb-1">Your Score: {score} / {questions.length}</h3>
                  <p className="text-sm font-bold opacity-80">{(score / questions.length) >= 0.8 ? "Excellent work!" : "Keep practicing to improve!"}</p>
                </div>
              )}

              {questions.map((q, qIdx) => (
                <div key={qIdx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-black text-sm">
                      {qIdx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-900 mb-4 leading-tight">{q.question}</p>
                      <div className="space-y-3">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = userAnswers[qIdx] === opt;
                          const isCorrect = opt === q.answer;
                          const showSuccess = submitted && isCorrect;
                          const showError = submitted && isSelected && !isCorrect;

                          return (
                            <label
                              key={oIdx}
                              className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                                isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                              } ${showSuccess ? "border-green-500 bg-green-50" : ""} ${
                                showError ? "border-red-500 bg-red-50" : ""
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q-${qIdx}`}
                                checked={isSelected}
                                onChange={() => handleOptionChange(qIdx, opt)}
                                className="hidden"
                              />
                              <div className="flex-1 flex justify-between items-center">
                                <span className={showSuccess ? "text-green-700 font-bold" : showError ? "text-red-700 font-bold" : "text-gray-900 font-medium"}>
                                  {opt}
                                </span>
                                {showSuccess && <CheckCircle2 size={18} className="text-green-600" />}
                                {showError && <XCircle size={18} className="text-red-600" />}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {!submitted && (
                <button
                  onClick={submitQuiz}
                  disabled={userAnswers.some(a => a === "")}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl disabled:opacity-50"
                >
                  Submit Quiz
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 🛡️ FULLSCREEN DISTRACTION-FREE SECURE ANTI-CHEAT EXAM CONSOLE ── */}
      {isExamActive && (
        <div 
          className="fixed inset-0 z-50 bg-gray-50 flex flex-col overflow-y-auto select-none"
          onCopy={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Header */}
          <header className="h-20 bg-indigo-950 text-white flex items-center justify-between px-8 sticky top-0 z-10 shadow-md">
            <div>
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block">Live Secure Assessment Hub</span>
              <h2 className="text-lg font-black">{activeExamDetails?.subject} — {activeExamDetails?.topic}</h2>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Warnings display */}
              {tabSwitchCount > 0 && (
                <div className="flex items-center gap-1.5 bg-red-900/60 border border-red-500 px-3.5 py-1.5 rounded-lg text-xs font-black text-red-200 animate-pulse">
                  <AlertTriangle size={15} />
                  <span>Cheat Violation: {tabSwitchCount}/2</span>
                </div>
              )}

              {/* Timer block */}
              <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                <Clock size={16} className="text-indigo-300" />
                <span className="text-sm font-black tracking-widest font-mono">
                  {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </header>

          {/* Sentry warning bar */}
          <div className="bg-indigo-900 text-indigo-100 py-2.5 px-8 text-center text-xs font-bold border-b border-indigo-800 flex items-center justify-center gap-2">
            <ShieldAlert size={14} className="text-indigo-400" />
            <span>EXAM REGULATIONS: Switching tabs, minimizing the window, or copying questions will trigger security lockdowns.</span>
          </div>

          {/* Exam Questions Form */}
          <div className="flex-1 p-8 max-w-3xl mx-auto w-full space-y-8">
            {/* Student metadata header */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-between shadow-sm">
              <span className="text-xs font-extrabold text-gray-500">Student: <b className="text-gray-900">{studentName}</b></span>
              <span className="text-xs font-extrabold text-gray-500">USN: <b className="text-gray-950">{studentUsn}</b></span>
              <span className="text-xs font-extrabold text-gray-500">Instructor: <b className="text-gray-900">{activeExamDetails?.teacherName}</b></span>
            </div>

            {/* Questions list */}
            <div className="space-y-6">
              {questions.map((q, qIdx) => (
                <div key={qIdx} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-150">
                  <div className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                      {qIdx + 1}
                    </span>
                    <div className="flex-1 space-y-4">
                      <p className="font-extrabold text-lg text-gray-950 leading-tight select-none">{q.question}</p>
                      
                      <div className="space-y-3">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = userAnswers[qIdx] === opt;
                          return (
                            <label
                              key={oIdx}
                              className={`flex items-center p-3.5 rounded-xl border cursor-pointer transition-all ${
                                isSelected ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:bg-gray-50/50"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`live-q-${qIdx}`}
                                checked={isSelected}
                                onChange={() => handleLiveOptionChange(qIdx, opt)}
                                className="hidden"
                              />
                              <span className={`text-sm font-semibold ${isSelected ? "text-purple-700 font-extrabold" : "text-gray-800"}`}>
                                {opt}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Action */}
            <div className="pt-6">
              <button
                onClick={() => submitLiveExam(false)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} />
                Submit and Lock Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
