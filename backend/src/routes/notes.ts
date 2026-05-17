import { Router, Response } from "express";
import multer from "multer";
import mammoth from "mammoth";
const pdf = require("pdf-parse");
import { groq, GROQ_MODEL } from "../config/groq";
import { supabase } from "../config/supabase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ── Helper: Extract text from various file types ─────────────────────────────
async function extractText(file: Express.Multer.File): Promise<string> {
  if (file.mimetype === "application/pdf") {
    try {
      // Standard pdf-parse v1.1.1 call
      const data = await pdf(file.buffer);
      return data.text || "";
    } catch (err: any) {
      throw new Error("PDF extraction failed: " + err.message);
    }
  } else if (
    file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const data = await mammoth.extractRawText({ buffer: file.buffer });
    return data.value;
  } else if (file.mimetype === "text/plain") {
    return file.buffer.toString("utf-8");
  }
  throw new Error("Unsupported file type: " + file.mimetype);
}

// ── POST /upload ─────────────────────────────────────────────────────────────
router.post("/upload", authMiddleware, upload.single("file"), async (req: AuthRequest, res: Response) => {
  try {
    const { title, rawText } = req.body;
    const userId = req.userId;
    let textToProcess = rawText || "";

    if (req.file) {
      console.log(`📂 Processing file: ${req.file.originalname}`);
      try {
        textToProcess = await extractText(req.file);
        console.log(`📄 Extracted ${textToProcess.length} characters.`);
        
        if (textToProcess.trim().length === 0) {
          return res.status(400).json({ 
            message: "The uploaded file contains no readable text." 
          });
        }
      } catch (err: any) {
        console.error("❌ Extraction error:", err.message);
        return res.status(400).json({ message: `File processing failed: ${err.message}` });
      }
    }

    if (!title || !textToProcess) {
      return res.status(400).json({ message: "Note title and content are required." });
    }

    console.log("🤖 Sending to Groq...");
    const prompt = `Summarise the following study notes in 3-5 bullet points. Then list up to 8 key topics as a JSON array. 
    Return ONLY valid JSON: { "summary": "string", "topics": ["string"] }
    
    Notes:
    ${textToProcess.substring(0, 15000)}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: GROQ_MODEL,
      response_format: { type: "json_object" }
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");

    const { data: note, error } = await supabase
      .from("notes")
      .insert([
        {
          user_id: userId,
          title,
          raw_text: textToProcess.substring(0, 50000),
          summary: parsed.summary,
          key_topics: parsed.topics,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    console.log("✅ Note saved successfully.");
    res.status(201).json(note);
  } catch (error) {
    console.error("❌ General processing error:", error);
    res.status(500).json({ message: "An internal error occurred." });
  }
});

router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { data: notes, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", req.userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notes." });
  }
});

export default router;
