import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Routes
import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chat";
import noteRoutes from "./routes/notes";
import quizRoutes from "./routes/quiz";
import liveQuizRoutes from "./routes/liveQuiz";
import analyticsRoutes from "./routes/analytics";
import youtubeRoutes from "./routes/youtube";
import flashcardRoutes from "./routes/flashcards";
import plannerRoutes from "./routes/planner";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());

// Health Check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ── Mount Routes ─────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/quiz/live", liveQuizRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/planner", plannerRoutes);

app.listen(PORT, () => {
  console.log(`🚀 AI Tutor Backend running on http://localhost:${PORT}`);
  console.log(`🔑 Auth: /api/auth`);
  console.log(`🤖 Chat: /api/chat`);
  console.log(`📝 Notes: /api/notes`);
  console.log(`❓ Quiz: /api/quiz`);
  console.log(`📊 Analytics: /api/analytics`);
  console.log(`📺 YouTube: /api/youtube`);
  console.log(`🗂️ Flashcards: /api/flashcards`);
  console.log(`📅 Planner: /api/planner`);
});
