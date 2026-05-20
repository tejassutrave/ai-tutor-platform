import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// ── LOCAL TEACHER AUTH HELPER ───────────────────────────────────────────────
const verifyTeacher = (req: Request, res: Response, next: () => void) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role?: string };
    if (decoded.role !== "teacher") {
      return res.status(403).json({ message: "Access denied. Instructor privileges required." });
    }
    (req as any).teacherId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// ── 1. POST /create (Teacher Only) ───────────────────────────────────────────
router.post("/create", verifyTeacher, async (req: Request, res: Response) => {
  try {
    const { subject, topic, accessCode, durationMinutes, questions } = req.body;
    const teacherId = (req as any).teacherId;

    if (!subject || !topic || !accessCode || !durationMinutes || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Please provide subject, topic, accessCode, durationMinutes, and questions array." });
    }

    // Check if access code is unique
    const { data: existingCode } = await supabase
      .from("live_quizzes")
      .select("id")
      .eq("access_code", accessCode.trim().toUpperCase())
      .single();

    if (existingCode) {
      return res.status(400).json({ message: "An exam room with this access code already exists. Please choose a unique code." });
    }

    // Save exam in Supabase
    const { data: newQuiz, error } = await supabase
      .from("live_quizzes")
      .insert([{
        teacher_id: teacherId,
        subject: subject.trim(),
        topic: topic.trim(),
        access_code: accessCode.trim().toUpperCase(),
        duration_minutes: Number(durationMinutes),
        questions,
        is_active: true
      }])
      .select()
      .single();

    if (error || !newQuiz) {
      console.error("Live quiz creation error:", error);
      return res.status(500).json({ message: "Failed to create live exam." });
    }

    res.status(201).json({ message: "Live exam created successfully!", quizId: newQuiz.id });
  } catch (err) {
    console.error("Unexpected error in live quiz creation:", err);
    res.status(500).json({ message: "Server error during live exam creation." });
  }
});

// ── 2. GET /teacher/results (Teacher Only) ───────────────────────────────────
router.get("/teacher/results", verifyTeacher, async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).teacherId;

    // Fetch all live quizzes created by this teacher
    const { data: quizzes, error: quizzesError } = await supabase
      .from("live_quizzes")
      .select("id, subject, topic, access_code")
      .eq("teacher_id", teacherId);

    if (quizzesError || !quizzes) {
      console.error("Error fetching teacher quizzes:", quizzesError);
      return res.status(500).json({ message: "Failed to load assessments." });
    }

    const quizIds = quizzes.map((q) => q.id);

    if (quizIds.length === 0) {
      return res.json([]);
    }

    // Fetch all submissions for these quizzes
    const { data: submissions, error: submissionsError } = await supabase
      .from("live_quiz_submissions")
      .select(`
        *,
        live_quizzes (
          subject,
          topic,
          access_code
        )
      `)
      .in("live_quiz_id", quizIds)
      .order("submitted_at", { ascending: false });

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError);
      return res.status(500).json({ message: "Failed to load grade book." });
    }

    res.json(submissions);
  } catch (err) {
    console.error("Unexpected error in live quiz results:", err);
    res.status(500).json({ message: "Server error during grade book retrieval." });
  }
});

// ── 3. GET /active (Student Public) ──────────────────────────────────────────
router.get("/active", async (req: Request, res: Response) => {
  try {
    const { data: activeQuizzes, error } = await supabase
      .from("live_quizzes")
      .select(`
        id,
        subject,
        topic,
        duration_minutes,
        created_at,
        teachers (
          name
        )
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching active quizzes:", error);
      return res.status(500).json({ message: "Failed to fetch live class assessments." });
    }

    // Clean up join property to make it easier for frontend
    const cleaned = activeQuizzes.map((quiz: any) => ({
      id: quiz.id,
      subject: quiz.subject,
      topic: quiz.topic,
      durationMinutes: quiz.duration_minutes,
      createdAt: quiz.created_at,
      teacherName: quiz.teachers?.name || "Independent Instructor"
    }));

    res.json(cleaned);
  } catch (err) {
    console.error("Unexpected error in fetching active quizzes:", err);
    res.status(500).json({ message: "Server error fetching live assessments." });
  }
});

// ── 4. POST /unlock (Student Public) ─────────────────────────────────────────
router.post("/unlock", async (req: Request, res: Response) => {
  try {
    const { quizId, accessCode, studentName, studentUsn } = req.body;

    if (!quizId || !accessCode) {
      return res.status(400).json({ message: "Please provide quizId and accessCode." });
    }

    if (studentUsn) {
      const { data: existingSubmission } = await supabase
        .from("live_quiz_submissions")
        .select("id")
        .eq("live_quiz_id", quizId)
        .eq("student_usn", studentUsn.trim().toUpperCase())
        .maybeSingle();

      if (existingSubmission) {
        return res.status(403).json({ message: "Access Denied: You have already submitted or been locked out of this assessment." });
      }
    }

    const { data: quiz, error } = await supabase
      .from("live_quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (error || !quiz) {
      return res.status(404).json({ message: "Assessment not found or closed by teacher." });
    }

    if (quiz.access_code !== accessCode.trim().toUpperCase()) {
      return res.status(401).json({ message: "Incorrect Access Code! Access Denied." });
    }

    const createdAt = new Date(quiz.created_at);
    const elapsedSeconds = Math.floor((Date.now() - createdAt.getTime()) / 1000);
    const totalSeconds = quiz.duration_minutes * 60;
    const remainingSeconds = totalSeconds - elapsedSeconds;

    if (!quiz.is_active || remainingSeconds <= 0) {
      if (quiz.is_active) {
        await supabase
          .from("live_quizzes")
          .update({ is_active: false })
          .eq("id", quiz.id);
      }
      return res.status(403).json({ message: "Access Denied: This assessment has already terminated." });
    }

    // Clean answers from the questions returned to student so they can't inspect element and find correct answers!
    const studentQuestions = quiz.questions.map((q: any) => ({
      question: q.question,
      options: q.options
    }));

    res.json({
      quizId: quiz.id,
      subject: quiz.subject,
      topic: quiz.topic,
      durationMinutes: quiz.duration_minutes,
      remainingSeconds: remainingSeconds,
      questions: studentQuestions
    });
  } catch (err) {
    console.error("Unexpected error in unlocking quiz:", err);
    res.status(500).json({ message: "Server error during unlocking." });
  }
});

// ── 5. POST /submit (Student Public) ─────────────────────────────────────────
router.post("/submit", async (req: Request, res: Response) => {
  try {
    const { quizId, studentName, studentUsn, userAnswers, tabSwitchCount } = req.body;

    if (!quizId || !studentName || !studentUsn || !userAnswers || !Array.isArray(userAnswers)) {
      return res.status(400).json({ message: "Please provide all student credentials and answers." });
    }

    // Fetch quiz from database to grade answers securely
    const { data: quiz, error } = await supabase
      .from("live_quizzes")
      .select("questions")
      .eq("id", quizId)
      .single();

    if (error || !quiz) {
      return res.status(404).json({ message: "Exam room not found." });
    }

    // Grade answers securely on server
    let score = 0;
    quiz.questions.forEach((q: any, idx: number) => {
      if (userAnswers[idx] === q.answer) {
        score++;
      }
    });

    // Save student submission
    const { error: insertError } = await supabase
      .from("live_quiz_submissions")
      .insert([{
        live_quiz_id: quizId,
        student_name: studentName.trim(),
        student_usn: studentUsn.trim().toUpperCase(),
        score,
        total: quiz.questions.length,
        user_answers: userAnswers,
        tab_switch_count: Number(tabSwitchCount) || 0
      }]);

    if (insertError) {
      console.error("Error inserting submission:", insertError);
      return res.status(500).json({ message: "Failed to save assessment results." });
    }

    // Return generic success message without score so students can't cheat/see score!
    res.json({ message: "Assessment submitted successfully! Your grade has been forwarded to your instructor." });
  } catch (err) {
    console.error("Unexpected error in submitting live quiz:", err);
    res.status(500).json({ message: "Server error during submission." });
  }
});

// ── 5.5. GET /check-active (Student Public) ───────────────────────────────────
router.get("/check-active", async (req: Request, res: Response) => {
  try {
    const { quizId } = req.query;
    if (!quizId) {
      return res.status(400).json({ active: false });
    }

    const { data: quiz, error } = await supabase
      .from("live_quizzes")
      .select("is_active, created_at, duration_minutes")
      .eq("id", quizId)
      .single();

    if (error || !quiz) {
      return res.json({ active: false });
    }

    const createdAt = new Date(quiz.created_at);
    const elapsedSeconds = Math.floor((Date.now() - createdAt.getTime()) / 1000);
    const totalSeconds = quiz.duration_minutes * 60;
    const remainingSeconds = totalSeconds - elapsedSeconds;

    if (!quiz.is_active || remainingSeconds <= 0) {
      if (quiz.is_active) {
        await supabase
          .from("live_quizzes")
          .update({ is_active: false })
          .eq("id", quizId);
      }
      return res.json({ active: false });
    }

    res.json({ active: true, remainingSeconds });
  } catch (err) {
    res.json({ active: false });
  }
});

// ── 6. GET /active-exam (Teacher Only) ──────────────────────────────────────────
router.get("/active-exam", verifyTeacher, async (req: Request, res: Response) => {
  try {
    const teacherId = (req as any).teacherId;

    // Fetch the most recent active quiz created by this teacher
    const { data: quiz, error: errorCheck } = await supabase
      .from("live_quizzes")
      .select("*")
      .eq("teacher_id", teacherId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (errorCheck || !quiz || quiz.length === 0) {
      return res.json(null);
    }

    const activeQuiz = quiz[0];
    const createdAt = new Date(activeQuiz.created_at);
    const elapsedSeconds = Math.floor((Date.now() - createdAt.getTime()) / 1000);
    const totalSeconds = activeQuiz.duration_minutes * 60;
    const remainingSeconds = totalSeconds - elapsedSeconds;

    if (remainingSeconds <= 0) {
      // Automatically mark as inactive
      await supabase
        .from("live_quizzes")
        .update({ is_active: false })
        .eq("id", activeQuiz.id);

      return res.json(null);
    }

    res.json({
      ...activeQuiz,
      remainingSeconds
    });
  } catch (err) {
    console.error("Unexpected error fetching active exam:", err);
    res.status(500).json({ message: "Server error fetching active exam status." });
  }
});

// ── 7. POST /terminate (Teacher Only) ───────────────────────────────────────────
router.post("/terminate", verifyTeacher, async (req: Request, res: Response) => {
  try {
    const { quizId } = req.body;
    const teacherId = (req as any).teacherId;

    if (!quizId) {
      return res.status(400).json({ message: "Please provide quizId." });
    }

    const { data, error } = await supabase
      .from("live_quizzes")
      .update({ is_active: false })
      .eq("id", quizId)
      .eq("teacher_id", teacherId)
      .select()
      .single();

    if (error) {
      console.error("Error terminating exam:", error);
      return res.status(500).json({ message: "Failed to terminate exam room." });
    }

    res.json({ message: "Exam room terminated successfully.", data });
  } catch (err) {
    console.error("Unexpected error during exam termination:", err);
    res.status(500).json({ message: "Server error during termination." });
  }
});

export default router;
