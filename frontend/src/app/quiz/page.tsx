"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { ClipboardList, CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";

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

  // ── Handle Option Change ───────────────────────────────────────────────────
  const handleOptionChange = (qIdx: number, option: string) => {
    if (submitted) return;
    const newAnswers = [...userAnswers];
    newAnswers[qIdx] = option;
    setUserAnswers(newAnswers);
  };

  // ── Submit Quiz ────────────────────────────────────────────────────────────
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
          {/* Generation Form */}
          {!questions.length || submitted ? (
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
          ) : null}

          {/* Quiz Content */}
          {questions.length > 0 && (
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
    </ProtectedRoute>
  );
}
