import { Router, Response } from "express";
import { groq, GROQ_MODEL } from "../config/groq";
import { supabase } from "../config/supabase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/generate", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { subject, topic, difficulty, count } = req.body;

    const countNum = count !== undefined ? Number(count) : 5;
    if (isNaN(countNum) || countNum <= 0) {
      return res.json([]);
    }
    const questionCount = Math.min(30, countNum);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert academic examiner. You generate high-quality multiple-choice questions in strict JSON format. You must always return a JSON object with a single key 'questions' containing an array of questions. Each question must have 'question' (string), 'options' (array of exactly 4 strings), and 'answer' (string matching one of the options exactly)."
        },
        {
          role: "user",
          content: `Generate exactly ${questionCount} multiple-choice questions about "${topic}" in the subject "${subject}" at "${difficulty}" level. Make sure the output is a valid JSON object matching the schema: { "questions": [{ "question": "string", "options": ["string", "string", "string", "string"], "answer": "string" }] }. Do not write any conversational text before or after the JSON.`
        }
      ],
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
