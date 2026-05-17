"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { MessageSquare, FileText, ClipboardList, Target, Clock, BookOpen, ChevronRight } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({ accuracy: 0, time: 0, weak: 0 });
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/analytics");
        setStats({
          accuracy: (res.data.quiz_accuracy || 0) * 100,
          time: res.data.study_minutes || 0,
          weak: res.data.weak_topics?.length || 0,
        });
        
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        setUserName(user.name?.split(" ")[0] || "Student");
      } catch (err) {
        console.error("Dashboard stats failed:", err);
      }
    };
    fetchStats();
  }, []);

  const actions = [
    { title: "AI Chat", desc: "Ask questions and get explanations", href: "/chat", icon: MessageSquare, color: "bg-blue-600" },
    { title: "Study Notes", desc: "Summarise lectures and extract topics", href: "/notes", icon: FileText, color: "bg-indigo-600" },
    { title: "Take a Quiz", desc: "Test your knowledge with AI questions", href: "/quiz", icon: ClipboardList, color: "bg-purple-600" },
  ];

  return (
    <ProtectedRoute>
      <div className="pl-64 min-h-screen bg-gray-50 pb-20">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
          <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
        </header>

        <main className="p-8 max-w-6xl mx-auto space-y-12">
          
          {/* Welcome Header */}
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Welcome back, {userName}! 👋</h2>
            <p className="text-gray-500 mt-2">Ready to master some new topics today?</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-blue-500 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Target size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Quiz Accuracy</p>
                  <p className="text-2xl font-black text-gray-900">{stats.accuracy.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-indigo-500 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Study Minutes</p>
                  <p className="text-2xl font-black text-gray-900">{stats.time}m</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 group hover:border-purple-500 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <BookOpen size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Weak Topics</p>
                  <p className="text-2xl font-black text-gray-900">{stats.weak}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {actions.map((action, i) => (
                <Link key={i} href={action.href} className="group">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center text-center">
                    <div className={`${action.color} text-white p-5 rounded-2xl mb-6 shadow-lg`}>
                      <action.icon size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed mb-6">
                      {action.desc}
                    </p>
                    <div className="flex items-center text-sm font-bold text-blue-600 gap-1 group-hover:gap-2 transition-all">
                      Get Started <ChevronRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}
