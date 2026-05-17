import { Router, Response } from "express";
import { groq, GROQ_MODEL } from "../config/groq";
import { supabase } from "../config/supabase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { message, subject, history } = req.body;
    const userId = req.userId;

    if (!message || !subject) {
      return res.status(400).json({ message: "Message and subject are required." });
    }

    // 1. Prepare Groq History
    const messages = [
      {
        role: "system" as const,
        content: `You are an expert academic tutor specialising in ${subject}. Give clear, step-by-step explanations. Be encouraging and concise.`
      },
      ...(history || []).map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      })),
      { role: "user" as const, content: message }
    ];

    // 2. Call Groq
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: GROQ_MODEL,
    });

    const reply = completion.choices[0]?.message?.content || "";

    // 3. Save to chat_history
    await supabase.from("chat_history").insert([
      { user_id: userId, role: "user", content: message, subject },
      { user_id: userId, role: "assistant", content: reply, subject },
    ]);

    res.json({ reply });
  } catch (error) {
    console.error("Groq Chat error:", error);
    res.status(500).json({ message: "Error communicating with AI tutor." });
  }
});

export default router;
