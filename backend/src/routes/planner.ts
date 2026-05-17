import { Router, Response } from "express";
import { groq, GROQ_MODEL } from "../config/groq";
import { supabase } from "../config/supabase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/generate", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    // 1. Fetch Analytics & Weak Topics
    const { data: analytics } = await supabase.from("analytics").select("*").eq("user_id", userId).single();
    
    // 2. Fetch Recent Notes
    const { data: notes } = await supabase.from("notes").select("title, key_topics").eq("user_id", userId).limit(5);

    const weakTopics = analytics?.weak_topics || [];
    const subjects = notes?.map(n => n.title).join(", ") || "various subjects";

    const prompt = `Based on the student's weak topics: [${weakTopics.join(", ")}] and recent study materials in: [${subjects}], 
    generate a highly focused 7-day study plan. 
    Include daily goals, specific topics to review, and suggested activities (e.g. "Take a quiz on X").
    Return ONLY valid JSON: { "plan": [{ "day": number, "goal": "string", "tasks": ["string"] }] }`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      response_format: { type: "json_object" }
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");

    // Save/Update plan
    await supabase.from("study_plans").upsert({
      user_id: userId,
      plan_json: parsed.plan,
      created_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    res.json(parsed.plan);
  } catch (error) {
    console.error("Planner error:", error);
    res.status(500).json({ message: "Failed to generate study plan." });
  }
});

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase.from("study_plans").select("*").eq("user_id", req.userId).single();
    if (error && error.code !== 'PGRST116') throw error;
    res.json(data?.plan_json || []);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch study plan." });
  }
});

export default router;
