import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json({ limit: "2mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "change_me";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

// CORS
app.use(
  cors({
    origin: FRONTEND_ORIGIN === "*" ? true : FRONTEND_ORIGIN,
    credentials: true,
  })
);

// Storage paths
const DATA_DIR = path.join(__dirname, "data");
const UPLOADS_DIR = path.join(__dirname, "uploads");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");

// Ensure folders/files exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(PROJECTS_FILE)) fs.writeFileSync(PROJECTS_FILE, "[]", "utf8");
if (!fs.existsSync(CONTENT_FILE)) fs.writeFileSync(CONTENT_FILE, "{}", "utf8");

// Serve uploads publicly
app.use("/uploads", express.static(UPLOADS_DIR));

// Helpers
function readProjects() {
  try {
    return JSON.parse(fs.readFileSync(PROJECTS_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeProjects(projects) {
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf8");
}

function readContent() {
  try {
    return JSON.parse(fs.readFileSync(CONTENT_FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeContent(content) {
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), "utf8");
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// IMPORTANT SECURITY NOTE:
// Don’t store plaintext passwords in code. We keep it in .env.
// For extra safety, we hash it once at runtime.
const adminPasswordPlain = process.env.ADMIN_PASSWORD || "D0R4H!!.";
const adminPasswordHash = bcrypt.hashSync(adminPasswordPlain, 10);

// Auth: password -> JWT
app.post("/api/auth/login", async (req, res) => {
  const { password } = req.body || {};

  if (!password) {
    return res.status(400).json({ error: "Password required" });
  }

  const ok = await bcrypt.compare(password, adminPasswordHash);
  if (!ok) {
    return res.status(401).json({ error: "Wrong password" });
  }

  const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

// Multer config (uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const stamp = Date.now();
    cb(null, `${stamp}_${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
});

// Upload endpoint (admin only)
// field names: video, poster(optional)
app.post(
  "/api/upload",
  auth,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "poster", maxCount: 1 },
  ]),
  (req, res) => {
    const video = req.files?.video?.[0];
    if (!video) {
      return res.status(400).json({ error: "Video file required" });
    }

    const poster = req.files?.poster?.[0];

    res.json({
      videoUrl: `/uploads/${video.filename}`,
      posterUrl: poster ? `/uploads/${poster.filename}` : null,
    });
  }
);

// Upload background audio (admin only)
app.post("/api/upload-audio", auth, upload.single("audio"), (req, res) => {
  const audio = req.file;

  if (!audio) {
    return res.status(400).json({ error: "Audio file required" });
  }

  res.json({
    audioUrl: `/uploads/${audio.filename}`,
  });
});

// Public: get projects
app.get("/api/projects", (req, res) => {
  res.json(readProjects());
});

// Admin: add project metadata
app.post("/api/projects", auth, (req, res) => {
  const { title, role, stack, year, link, blurb, video, poster } = req.body || {};

  if (!title || !video) {
    return res.status(400).json({ error: "title + video required" });
  }

  const projects = readProjects();

  const item = {
    id: crypto.randomUUID(),
    title,
    role: role || "Web Builder",
    stack: Array.isArray(stack) ? stack.slice(0, 10) : [],
    year: year || String(new Date().getFullYear()),
    link: link || "#",
    blurb: blurb || "",
    video,
    poster: poster || "",
    createdAt: new Date().toISOString(),
  };

  projects.unshift(item);
  writeProjects(projects);

  res.json(item);
});

// Admin: delete project
app.delete("/api/projects/:id", auth, (req, res) => {
  const { id } = req.params;
  const projects = readProjects();
  const next = projects.filter((p) => p.id !== id);

  writeProjects(next);
  res.json({ ok: true });
});

// Public: get homepage content
app.get("/api/content", (req, res) => {
  res.json(readContent());
});

// Admin: update homepage content
app.put("/api/content", auth, (req, res) => {
  const incoming = req.body || {};
  const current = readContent();

  const updated = {
    ...current,
    ...incoming,
  };

  writeContent(updated);
  res.json(updated);
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});