import { Router, Response } from "express";
import { YoutubeTranscript } from "youtube-transcript";
import { groq, GROQ_MODEL } from "../config/groq";
import { supabase } from "../config/supabase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// ── POST /summarize ──────────────────────────────────────────────────────────
router.post("/summarize", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { videoUrl, title } = req.body;
    const userId = req.userId;

    if (!videoUrl) {
      return res.status(400).json({ message: "YouTube URL is required." });
    }

    // 1. Fetch Transcript
    console.log("📺 Fetching transcript for:", videoUrl);
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoUrl);
    const fullText = transcriptItems.map(item => item.text).join(" ");

    // 2. Summarize with Groq
    console.log("🤖 Summarizing YouTube content...");
    const prompt = `Summarise the following YouTube video transcript in 5-7 detailed bullet points. Then list 5 key topics as a JSON array.
    Return ONLY valid JSON: { "summary": "string", "topics": ["string"] }
    
    Transcript:
    ${fullText.substring(0, 15000)}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      response_format: { type: "json_object" }
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");

    // 3. Save as a Note
    const { data: note, error } = await supabase
      .from("notes")
      .insert([
        {
          user_id: userId,
          title: title || "YouTube Summary",
          raw_text: fullText.substring(0, 50000),
          summary: parsed.summary,
          key_topics: parsed.topics,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(note);
  } catch (error: any) {
    console.error("YouTube error:", error);
    res.status(500).json({ message: "Failed to process YouTube video. Ensure it has captions." });
  }
});

export default router;
