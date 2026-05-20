import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { supabase } from "../config/supabase";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 12;

// ── POST /register ───────────────────────────────────────────────────────────
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email, and password." });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user into Supabase
    const { data: newUser, error } = await supabase
      .from("users")
      .insert([{ name, email, password_hash: passwordHash }])
      .select()
      .single();

    if (error || !newUser) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Error creating user." });
    }

    // Create JWT
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });
  } catch (error) {
    console.error("Unexpected error during registration:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// ── POST /login ──────────────────────────────────────────────────────────────
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password." });
    }

    // Find user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Create JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Unexpected error during login:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// ── POST /teacher/register ───────────────────────────────────────────────────
router.post("/teacher/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, secretPasskey } = req.body;

    if (!name || !email || !password || !secretPasskey) {
      return res.status(400).json({ message: "Please provide name, email, password, and the secret teacher passkey." });
    }

    // Validate Teacher Secret Passkey (configurable via env, default "1234")
    const expectedPasskey = process.env.TEACHER_SECRET_KEY || "1234";
    if (secretPasskey !== expectedPasskey) {
      return res.status(403).json({ message: "Invalid teacher secret verification key." });
    }

    // Check if teacher already exists
    const { data: existingTeacher } = await supabase
      .from("teachers")
      .select("id")
      .eq("email", email)
      .single();

    if (existingTeacher) {
      return res.status(400).json({ message: "Teacher with this email already exists." });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert teacher into Supabase
    const { data: newTeacher, error } = await supabase
      .from("teachers")
      .insert([{ name, email, password_hash: passwordHash }])
      .select()
      .single();

    if (error || !newTeacher) {
      console.error("Teacher registration error:", error);
      return res.status(500).json({ message: "Error creating teacher profile." });
    }

    // Create JWT with teacher role
    const token = jwt.sign(
      { userId: newTeacher.id, role: "teacher" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      role: "teacher",
      user: { id: newTeacher.id, name: newTeacher.name, email: newTeacher.email }
    });
  } catch (error) {
    console.error("Unexpected error during teacher registration:", error);
    res.status(500).json({ message: "Server error during teacher registration." });
  }
});

// ── POST /teacher/login ──────────────────────────────────────────────────────
router.post("/teacher/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password." });
    }

    // Find teacher by email
    const { data: teacher, error } = await supabase
      .from("teachers")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !teacher) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, teacher.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Create JWT with teacher role
    const token = jwt.sign(
      { userId: teacher.id, role: "teacher" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: "teacher",
      user: { id: teacher.id, name: teacher.name, email: teacher.email }
    });
  } catch (error) {
    console.error("Unexpected error during teacher login:", error);
    res.status(500).json({ message: "Server error during teacher login." });
  }
});

export default router;
