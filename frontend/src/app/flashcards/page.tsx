"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { Layers, RotateCcw, CheckCircle, ArrowRight, ArrowLeft, Plus, Loader2 } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
}

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await api.get("/flashcards");
      setCards(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  const toggleMastered = async (id: string, current: boolean) => {
    try {
      await api.patch(`/flashcards/${id}/master`, { mastered: !current });
      setCards(cards.map(c => c.id === id ? { ...c, mastered: !current } : c));
    } catch (err) {
      console.error(err);
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

  const currentCard = cards[currentIndex];

  return (
    <ProtectedRoute>
      <div className="pl-64 min-h-screen bg-gray-50 flex flex-col p-8">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Layers className="text-blue-600" />
              Flashcards
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              Master your subjects one card at a time.
            </p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Progress</span>
            <div className="text-2xl font-black text-blue-600">
              {cards.filter(c => c.mastered).length} / {cards.length}
            </div>
          </div>
        </header>

        {cards.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mb-6">
              <Plus size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Flashcards Yet</h2>
            <p className="text-gray-500 max-w-sm mb-8">
              Generate flashcards from your Study Notes to start learning!
            </p>
            <a href="/notes" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
              Go to Notes
            </a>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
            
            {/* Card Container */}
            <div 
              className="w-full h-96 perspective-1000 cursor-pointer mb-12"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div
                className="w-full h-full relative preserve-3d transition-all duration-500"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {/* Front */}
                <div className="absolute w-full h-full bg-white rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-xl shadow-blue-50 border border-gray-100 backface-hidden">
                  <span className="absolute top-6 left-6 text-xs font-black text-gray-300 uppercase tracking-widest">Question</span>
                  <p className="text-2xl font-bold text-gray-900 leading-tight">
                    {currentCard.front}
                  </p>
                  <div className="absolute bottom-6 text-gray-400 text-sm font-medium flex items-center gap-2">
                    <RotateCcw size={16} /> Click to flip
                  </div>
                </div>

                {/* Back */}
                <div 
                  className="absolute w-full h-full bg-blue-600 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-xl shadow-blue-100 border border-blue-500 backface-hidden"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <span className="absolute top-6 left-6 text-xs font-black text-blue-200 uppercase tracking-widest">Answer</span>
                  <p className="text-2xl font-bold text-white leading-tight">
                    {currentCard.back}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
              <button 
                onClick={handlePrev}
                className="p-4 bg-white rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
              >
                <ArrowLeft size={24} />
              </button>

              <button 
                onClick={() => toggleMastered(currentCard.id, currentCard.mastered)}
                className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all shadow-lg ${
                  currentCard.mastered 
                    ? "bg-green-100 text-green-600 border border-green-200" 
                    : "bg-white text-gray-900 border border-gray-200 hover:border-green-500 hover:text-green-600"
                }`}
              >
                <CheckCircle size={20} />
                {currentCard.mastered ? "Mastered" : "Mark as Mastered"}
              </button>

              <button 
                onClick={handleNext}
                className="p-4 bg-white rounded-2xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
              >
                <ArrowRight size={24} />
              </button>
            </div>

            <div className="mt-8 text-sm font-bold text-gray-400 uppercase tracking-widest">
              Card {currentIndex + 1} of {cards.length}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </ProtectedRoute>
  );
}
