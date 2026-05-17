"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { Video, Link as LinkIcon, Loader2, BookOpen, CheckCircle2, AlertCircle } from "lucide-react";

export default function YoutubePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setSuccess(false);
    try {
      await api.post("/youtube/summarize", { videoUrl: url });
      setSuccess(true);
      setUrl("");
      // Redirect to notes after short delay
      setTimeout(() => router.push("/notes"), 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to summarize video. Make sure it has English captions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="pl-64 min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-white rounded-3xl p-10 shadow-xl shadow-blue-50 border border-gray-100 text-center">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-50">
            <Video size={40} />
          </div>
          
          <h1 className="text-3xl font-black text-gray-900 mb-2">YouTube Study Assistant</h1>
          <p className="text-gray-500 font-medium mb-10 max-w-md mx-auto">
            Paste any lecture or educational video link. I'll watch it for you, summarize the key points, and save it to your notes.
          </p>

          <form onSubmit={handleSummarize} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <LinkIcon size={20} />
              </div>
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="block w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 text-gray-900 font-medium focus:border-red-500 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className={`w-full py-4 rounded-2xl font-black text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                success ? "bg-green-500 shadow-green-100" : "bg-red-600 hover:bg-red-700 shadow-red-100"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  Analyzing Video...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={24} />
                  Note Saved! Redirecting...
                </>
              ) : (
                "Summarize Video"
              )}
            </button>
          </form>

          <div className="mt-10 flex items-start gap-3 bg-blue-50 p-4 rounded-2xl text-left">
            <AlertCircle className="text-blue-600 shrink-0 mt-1" size={20} />
            <p className="text-sm text-blue-700 font-medium leading-relaxed">
              <strong>Tip:</strong> This works best for educational videos, TED talks, and lectures that have English subtitles or captions.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
