import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  // We'll allow it to be missing for now so the server doesn't crash on startup,
  // but we'll log a warning.
  console.warn("⚠️  Missing GROQ_API_KEY in environment variables");
}

export const groq = new Groq({
  apiKey: apiKey || "",
});

// Recommended model
export const GROQ_MODEL = "llama-3.3-70b-versatile";

export default groq;
