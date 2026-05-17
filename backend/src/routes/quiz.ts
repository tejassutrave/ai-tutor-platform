import { Router, Response } from "express";
import { groq, GROQ_MODEL } from "../config/groq";
import { supabase } from "../config/supabase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/generate", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { subject, topic, difficulty, count } = req.body;

    // Clamp count between 1 and 20 (max 20 as requested)
    const questionCount = Math.max(1, Math.min(20, Number(count) || 5));

    const prompt = `Generate ${questionCount} multiple-choice questions about ${topic} in ${subject} at ${difficulty} level. 
    Return ONLY valid JSON: { "questions": [{ "question": "string", "options": ["string", "string", "string", "string"], "answer": "string" }] }`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      response_format: { type: "json_object" }
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
    res.json(parsed.questions);
  } catch (error) {
    console.error("Groq Quiz error:", error);
    res.status(500).json({ message: "Failed to generate quiz." });
  }
});

router.post("/submit", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { subject, topic, difficulty, questions, score, total } = req.body;
    const userId = req.userId;

    await supabase.from("quizzes").insert([{ user_id: userId, subject, topic, difficulty, questions, score, total }]);

    const { data: analytics } = await supabase.from("analytics").select("*").eq("user_id", userId).single();
    if (analytics) {
      const newAccuracy = ((analytics.quiz_accuracy || 0) + (score / total)) / 2;
      await supabase.from("analytics").update({ quiz_accuracy: newAccuracy, last_updated: new Date().toISOString() }).eq("user_id", userId);
    }

    res.json({ saved: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to save quiz results." });
  }
});

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data: quizzes, error } = await supabase.from("quizzes").select("*").eq("user_id", req.userId).order("created_at", { ascending: false });
    if (error) throw error;
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch quizzes." });
  }
});

export default router;
