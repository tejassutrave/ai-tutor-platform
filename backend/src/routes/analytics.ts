import { Router, Response } from "express";
import { supabase } from "../config/supabase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// ── GET / ────────────────────────────────────────────────────────────────────
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    // 1. Fetch Analytics
    let { data: analytics, error } = await supabase
      .from("analytics")
      .select("*")
      .eq("user_id", userId)
      .single();

    // 2. Create blank row if missing
    if (error || !analytics) {
      const { data: newRow, error: createError } = await supabase
        .from("analytics")
        .insert([{ user_id: userId }])
        .select()
        .single();
      
      if (createError) throw createError;
      analytics = newRow;
    }

    res.json(analytics);
  } catch (error) {
    console.error("Analytics fetch error:", error);
    res.status(500).json({ message: "Failed to fetch analytics." });
  }
});

export default router;
