import { Router, Response } from "express";
import { groq, GROQ_MODEL } from "../config/groq";
import { supabase } from "../config/supabase";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import multer from "multer";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post("/upload", authMiddleware, upload.single("file"), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file was uploaded." });
    }

    const { mimetype, buffer } = req.file;
    let extractedText = "";

    if (mimetype === "application/pdf") {
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
      mimetype === "application/msword"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (mimetype === "text/plain") {
      extractedText = buffer.toString("utf-8");
    } else {
      return res.status(400).json({ message: "Unsupported file type. Only PDF, DOCX, and TXT are supported." });
    }

    res.json({ text: extractedText, filename: req.file.originalname });
  } catch (error) {
    console.error("File upload parse error:", error);
    res.status(500).json({ message: "Failed to parse document text." });
  }
});

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { message, subject, history, documentContext } = req.body;
    const userId = req.userId;

    if (!message || !subject) {
      return res.status(400).json({ message: "Message and subject are required." });
    }

    // Prepare system instructions, injecting documentContext if present
    let systemInstruction = `You are an expert academic tutor specialising in ${subject}. Give clear, step-by-step explanations. Be encouraging and concise.`;
    
    if (documentContext) {
      systemInstruction += `\n\nCONTEXT FROM UPLOADED DOCUMENT:\n<document>\n${documentContext}\n</document>\n\nCRITICAL SYSTEM RULES:\n1. If the user's query references, implies, or asks for definitions/answers "as per PDF" or "as per document", or contains concepts defined in the document, you must answer strictly according to the document text only. In this case, respond with the exact words, definitions, or direct statements found in the document where appropriate, and do not use external knowledge or invent facts.\n2. Otherwise, use the context document as your primary reference resource to help explain the concept, but maintain your encouraging tutoring style.`;
    }

    // 1. Prepare Groq History
    const messages = [
      {
        role: "system" as const,
        content: systemInstruction
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
