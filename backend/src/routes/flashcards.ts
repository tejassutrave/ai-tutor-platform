import { Router, Response } from "express";
import { groq, GROQ_MODEL } from "../config/groq";
import { supabase } from "../config/supabase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// ── POST /generate ──────────────────────────────────────────────────────────
router.post("/generate", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { noteId, text } = req.body;
    const userId = req.userId;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Please provide study material text to generate flashcards from." });
    }

    const prompt = `Generate 10 high-quality flashcards based on the following study material. 
    Each flashcard must have a "front" (question/term) and a "back" (answer/definition).
    Return ONLY valid JSON: { "flashcards": [{ "front": "string", "back": "string" }] }
    
    Material:
    ${text.substring(0, 10000)}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      response_format: { type: "json_object" }
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");

    if (!parsed.flashcards || !Array.isArray(parsed.flashcards) || parsed.flashcards.length === 0) {
      return res.status(500).json({ message: "AI did not return valid flashcards. Please try again." });
    }

    // Save individual card rows to DB
    const cardsToInsert = parsed.flashcards.map((f: any) => ({
      user_id: userId,
      note_id: noteId || null,
      front: f.front,
      back: f.back,
      mastered: false
    }));

    const { data: savedCards, error } = await supabase
      .from("flashcards")
      .insert(cardsToInsert)
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    res.status(201).json(savedCards);
  } catch (error) {
    console.error("Flashcard generation error:", error);
    res.status(500).json({ message: "Failed to generate flashcards." });
  }
});

// ── GET / ────────────────────────────────────────────────────────────────────
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data: cards, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", req.userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch flashcards." });
  }
});

// ── PATCH /:id/master ────────────────────────────────────────────────────────
router.patch("/:id/master", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { mastered } = req.body;
    const { error } = await supabase
      .from("flashcards")
      .update({ mastered })
      .eq("id", req.params.id)
      .eq("user_id", req.userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to update flashcard." });
  }
});

export default router;
