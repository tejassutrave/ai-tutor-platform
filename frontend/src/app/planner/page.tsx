"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { 
  Calendar, 
  Target, 
  CheckCircle2, 
  Loader2, 
  RefreshCw,
  Clock,
  Sparkles
} from "lucide-react";

interface PlanDay {
  day: number;
  goal: string;
  tasks: string[];
}

export default function PlannerPage() {
  const [plan, setPlan] = useState<PlanDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      const res = await api.get("/planner");
      setPlan(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateNewPlan = async () => {
    setGenerating(true);
    try {
      const res = await api.get("/planner/generate");
      setPlan(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate plan. Try taking more quizzes first!");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="pl-64 h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="pl-64 min-h-screen bg-gray-50 pb-20 p-8">
        <header className="max-w-6xl mx-auto flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4">
              <Calendar className="text-blue-600" size={36} />
              AI Study Planner
            </h1>
            <p className="text-gray-500 font-bold mt-2 text-lg">
              Personalized schedule based on your performance and weak topics.
            </p>
          </div>
          
          <button
            onClick={generateNewPlan}
            disabled={generating}
            className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {generating ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
            {plan.length > 0 ? "Regenerate Plan" : "Generate Plan"}
          </button>
        </header>

        <div className="max-w-6xl mx-auto">
          {plan.length === 0 ? (
            <div className="bg-white rounded-3xl p-20 text-center shadow-xl shadow-blue-50 border border-gray-100">
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <Sparkles size={48} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">Ready to Optimize?</h2>
              <p className="text-gray-500 text-lg max-w-md mx-auto mb-10 font-medium">
                Our AI will analyze your quiz scores and study notes to build a custom 7-day roadmap for you.
              </p>
              <button
                onClick={generateNewPlan}
                disabled={generating}
                className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-blue-200 hover:scale-105 transition-all disabled:opacity-50"
              >
                Create My Study Plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {plan.map((day) => (
                <div key={day.day} className="bg-white rounded-3xl p-6 shadow-xl shadow-blue-50 border border-gray-100 flex flex-col transition-all hover:translate-y-[-4px]">
                  <div className="flex items-center justify-between mb-6">
                    <span className="bg-blue-600 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md shadow-blue-100">
                      Day {day.day}
                    </span>
                    <div className="text-gray-300">
                      <Clock size={20} />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black text-gray-900 mb-4 leading-tight min-h-[3rem]">
                    {day.goal}
                  </h3>

                  <div className="space-y-4 flex-1">
                    {day.tasks.map((task, tIdx) => (
                      <div key={tIdx} className="flex gap-3 items-start p-3 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-200 transition-all">
                        <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600 font-bold leading-relaxed">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="bg-blue-600 rounded-3xl p-8 flex flex-col items-center justify-center text-center text-white shadow-2xl shadow-blue-200">
                <Target size={48} className="mb-6 text-blue-200" />
                <h3 className="text-2xl font-black mb-2">Weekly Goal</h3>
                <p className="text-blue-100 font-bold opacity-80 mb-6">
                  Improve accuracy in weak topics by 15%
                </p>
                <div className="w-full h-2 bg-blue-700 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
