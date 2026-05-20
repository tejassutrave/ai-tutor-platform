"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { GraduationCap, ShieldAlert, Key } from "lucide-react";

export default function TeacherLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/teacher/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "teacher");
      localStorage.setItem("user", JSON.stringify(res.data.user));
      router.push("/teacher/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-indigo-100/50">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4 shadow-sm border border-indigo-100/50">
            <GraduationCap size={28} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Teacher Portal</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">Log in to manage live exam quizzes & assessments</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-600 border border-red-100 flex items-center gap-2">
              <ShieldAlert size={16} className="text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="teacher@college.edu"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {loading ? "Verifying Teacher credentials..." : "Sign In to Portal"}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-6 flex flex-col gap-3 text-center">
          <p className="text-sm text-gray-500">
            Need a new portal account?{" "}
            <Link href="/teacher/register" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors flex items-center justify-center gap-1 mt-1">
              <Key size={14} /> Register as Teacher
            </Link>
          </p>
          <div className="pt-2">
            <Link href="/" className="text-xs text-gray-400 font-bold hover:text-gray-600 transition-colors">
              ← Back to Student Hub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
