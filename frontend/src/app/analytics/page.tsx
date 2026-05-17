"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { BarChart3, Target, Book, Clock, Loader2 } from "lucide-react";

interface Analytics {
  quiz_accuracy: number;
  study_minutes: number;
  weak_topics: string[];
}

interface Quiz {
  score: number;
  total: number;
  created_at: string;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, qRes] = await Promise.all([
          api.get("/analytics"),
          api.get("/quiz"),
        ]);
        setAnalytics(aRes.data);
        setQuizzes(qRes.data);
      } catch (err) {
        console.error("Data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="pl-64 flex items-center justify-center min-h-screen">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      </ProtectedRoute>
    );
  }

  const accuracy = (analytics?.quiz_accuracy || 0) * 100;
  const accuracyColor = accuracy >= 70 ? "text-green-600" : accuracy >= 40 ? "text-amber-500" : "text-red-600";
  const accuracyBg = accuracy >= 70 ? "bg-green-100" : accuracy >= 40 ? "bg-amber-100" : "bg-red-100";

  // Chart Logic (Last 5 quizzes)
  const lastQuizzes = quizzes.slice(0, 5).reverse();
  const chartWidth = 400;
  const chartHeight = 200;
  const barWidth = 40;
  const gap = 30;

  return (
    <ProtectedRoute>
      <div className="pl-64 min-h-screen bg-gray-50 pb-20">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
          <h1 className="text-xl font-bold text-gray-900 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Performance Analytics
          </h1>
        </header>

        <div className="p-8 max-w-6xl mx-auto space-y-8">
          
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Target className="text-blue-600" />
                <h3 className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Quiz Accuracy</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black ${accuracyColor}`}>{accuracy.toFixed(1)}%</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${accuracyBg} ${accuracyColor}`}>
                  {accuracy >= 70 ? "Excellent" : accuracy >= 40 ? "Average" : "Needs Review"}
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="text-blue-600" />
                <h3 className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Study Time</h3>
              </div>
              <span className="text-4xl font-black text-gray-900">{analytics?.study_minutes || 0}m</span>
              <p className="text-xs text-gray-400 mt-1">Total focused learning time</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Book className="text-blue-600" />
                <h3 className="font-semibold text-gray-500 uppercase text-xs tracking-wider">Active Subjects</h3>
              </div>
              <span className="text-4xl font-black text-gray-900">{quizzes.length > 0 ? "4" : "0"}</span>
              <p className="text-xs text-gray-400 mt-1">Based on recent activity</p>
            </div>
          </div>

          {/* Weak Topics & Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weak Topics */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Target size={20} className="text-red-500" />
                Areas for Improvement
              </h3>
              {analytics?.weak_topics && analytics.weak_topics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analytics.weak_topics.map((topic, i) => (
                    <span key={i} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium">
                      {topic}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400 italic">
                  Complete more quizzes to identify weak spots!
                </div>
              )}
            </div>

            {/* Quiz Progress Chart */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <BarChart3 size={20} className="text-indigo-600" />
                Recent Quiz Scores
              </h3>
              <div className="flex justify-center">
                <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                  {lastQuizzes.map((q, i) => {
                    const h = (q.score / q.total) * (chartHeight - 40);
                    const x = i * (barWidth + gap) + 40;
                    const y = chartHeight - h - 30;
                    return (
                      <g key={i}>
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={h}
                          fill="#4F46E5"
                          rx="4"
                          className="animate-pulse"
                        />
                        <text x={x + barWidth / 2} y={chartHeight - 10} textAnchor="middle" fontSize="10" fill="#9CA3AF">
                          {new Date(q.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </text>
                        <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#4F46E5">
                          {q.score}/{q.total}
                        </text>
                      </g>
                    );
                  })}
                  {/* Axis */}
                  <line x1="20" y1={chartHeight - 30} x2={chartWidth - 20} y2={chartHeight - 30} stroke="#E5E7EB" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
