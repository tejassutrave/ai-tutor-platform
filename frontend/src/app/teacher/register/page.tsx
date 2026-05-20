"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { GraduationCap, ShieldCheck, ShieldAlert } from "lucide-react";

export default function TeacherRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretPasskey, setSecretPasskey] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/teacher/register", { 
        name, 
        email, 
        password,
        secretPasskey 
      });
      
      setSuccess(true);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", "teacher");
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      setTimeout(() => {
        router.push("/teacher/dashboard");
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please make sure the secret key is correct.");
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
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Create Instructor Account</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">Verify credentials to unlock the Teacher Dashboard</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-600 border border-red-100 flex items-center gap-2">
              <ShieldAlert size={16} className="text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-green-50 p-3.5 text-xs font-semibold text-green-600 border border-green-100 flex items-center gap-2">
              <ShieldCheck size={16} className="text-green-500 flex-shrink-0" />
              <span>Registration Successful! Entering Dashboard...</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="Dr. Eleanor Vance"
              />
            </div>

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

            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50 space-y-2">
              <label className="text-xs font-black text-indigo-700 uppercase tracking-wider block">🔑 Teacher Secret Passkey</label>
              <input
                type="password"
                required
                value={secretPasskey}
                onChange={(e) => setSecretPasskey(e.target.value)}
                className="block w-full rounded-lg border border-indigo-200 px-3.5 py-2 text-sm text-gray-900 font-black focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="Enter 4-digit key"
              />
              <span className="text-[10px] font-bold text-indigo-500 leading-tight block">Required to authorize registration. Ask your system admin if unknown.</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="flex w-full justify-center rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? "Registering & Authenticating..." : "Complete Registration"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 border-t border-gray-100 pt-6">
          Already have a portal account?{" "}
          <Link href="/teacher/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}
