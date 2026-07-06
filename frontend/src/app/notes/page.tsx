"use client";

import { useState, useEffect, useRef } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { FileText, Plus, BookOpen, Clock, Tag, Loader2, Upload, FileUp, Layers } from "lucide-react";
import { useRouter } from "next/navigation";

interface Note {
  id: string;
  title: string;
  summary: string;
  key_topics: string[];
  created_at: string;
}

export default function NotesPage() {
  const [title, setTitle] = useState("");
  const [rawText, setRawText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [generatingFlashcards, setGeneratingFlashcards] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await api.get("/notes");
      setNotes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || (!rawText && !file) || loading) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      if (file) {
        formData.append("file", file);
      } else {
        formData.append("rawText", rawText);
      }

      const res = await api.post("/notes/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNotes((prev) => [res.data, ...prev]);
      setTitle("");
      setRawText("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || "Failed to process notes.";
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFlashcards = async (note: Note) => {
    setGeneratingFlashcards(note.id);
    try {
      await api.post("/flashcards/generate", { 
        noteId: note.id, 
        text: note.summary // Using summary for faster, focused generation
      });
      router.push("/flashcards");
    } catch (err) {
      console.error(err);
      alert("Failed to generate flashcards.");
    } finally {
      setGeneratingFlashcards(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="pl-64 min-h-screen bg-gray-50 pb-12 text-gray-900 font-medium">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-900">Study Notes</h1>
        </header>

        <div className="p-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-50 border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                  <Plus size={24} />
                </div>
                <h2 className="font-black text-xl">New Note</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Note Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Quantum Physics"
                    className="block w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Upload Document</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      file ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-400"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0] || null;
                        if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
                          alert("File size exceeds the 5MB limit. Please upload a smaller file.");
                          if (fileInputRef.current) fileInputRef.current.value = "";
                          setFile(null);
                        } else {
                          setFile(selectedFile);
                        }
                      }}
                    />
                    {file ? (
                      <div className="flex flex-col items-center text-blue-600">
                        <FileUp size={32} className="mb-2" />
                        <span className="text-sm font-bold truncate max-w-full">{file.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <Upload size={32} className="mb-2" />
                        <span className="text-sm font-bold">PDF, DOCX, or TXT</span>
                      </div>
                    )}
                  </div>
                </div>

                {!file && (
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Or Paste Notes</label>
                    <textarea
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      rows={8}
                      placeholder="Paste your content here..."
                      className="block w-full rounded-2xl border-2 border-gray-50 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-none resize-none transition-all"
                    ></textarea>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={24} className="animate-spin mx-auto" /> : "Summarise with AI"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="font-black text-2xl flex items-center gap-3">
              <BookOpen size={28} className="text-blue-600" />
              Past Summaries
            </h2>

            {fetching ? (
              <div className="flex justify-center py-20">
                <Loader2 size={48} className="animate-spin text-blue-600" />
              </div>
            ) : notes.length === 0 ? (
              <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100">
                <FileText size={64} className="mx-auto text-gray-200 mb-6" />
                <p className="text-gray-400 text-lg font-bold">No notes yet. Start by uploading a file!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {notes.map((note) => (
                  <div key={note.id} className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-50 border border-gray-100 group transition-all hover:shadow-blue-100">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-black text-2xl text-gray-900 mb-1">{note.title}</h3>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                          <Clock size={14} />
                          {new Date(note.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleGenerateFlashcards(note)}
                        disabled={generatingFlashcards === note.id}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                      >
                        {generatingFlashcards === note.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Layers size={16} />
                        )}
                        Generate Flashcards
                      </button>
                    </div>
                    
                    <div className="prose prose-sm text-gray-600 font-medium mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <p className="whitespace-pre-wrap leading-relaxed">{note.summary}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {note.key_topics.map((topic, idx) => (
                        <span key={idx} className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-full shadow-sm">
                          <Tag size={12} className="text-blue-500" />
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
