import React, { useEffect, useRef, useState } from "react";

/**
 * Dorah 💙 — Tech / gamer vibe portfolio with a circular pop-up showcase
 * Wired to backend:
 * - GET  /api/projects
 * - POST /api/auth/login
 * - POST /api/upload (multipart: video)
 * - POST /api/projects
 * - DELETE /api/projects/:id
 * - GET /api/content
 * - PUT /api/content (admin)
 * - POST /api/upload-audio (multipart: audio)
 */

const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:5000").replace(/\/$/, "");

const seedProjects = [
  {
    title: "E-commerce Storefront",
    role: "Web Builder / Frontend",
    stack: ["React", "Payments", "Responsive"],
    year: "2026",
    video: "/videos/demo1.mp4",
    poster: "/videos/poster1.jpg",
    link: "#",
    blurb: "Clean storefront with product pages, cart flow, and checkout integration.",
  },
  {
    title: "Landing Page (High Conversion)",
    role: "UI + Build",
    stack: ["Design", "Animations", "SEO"],
    year: "2026",
    video: "/videos/demo2.mp4",
    poster: "/videos/poster2.jpg",
    link: "#",
    blurb: "Neon-dark landing page with crisp typography, motion, and performance-first layout.",
  },
  {
    title: "Admin Dashboard UI",
    role: "Frontend",
    stack: ["Tables", "Forms", "Auth UI"],
    year: "2026",
    video: "/videos/demo3.mp4",
    poster: "/videos/poster3.jpg",
    link: "#",
    blurb: "Dashboard screens: analytics cards, data tables, filters, and clean components.",
  },
];

const defaultContent = {
  brandName: "Dorah 💙",
  navLine: "Web Builder • Abuja",
  taglinePill: "Web builder • Frontend • interactive UI",
  heroHeadline: "Dark-blue, floating project showcase.",
  heroSubheadline: "A portfolio with circular pop-up motion.",
  heroDescription: "Scroll, swipe, or tap through the floating showcase.",
  cardName: "Dorah 💙",
  cardLine1: "Web Builder • UniAbuja",
  cardLine2: "Azul profundo + neon energy.",
  clientsTitle: "What clients get",
  clientsText:
    "Clean, responsive pages, smooth interactions, and performance-first code — built to look premium and convert.",
  aboutTitle: "About me",
  aboutText:
    "I’m a frontend developer who builds responsive, high-quality websites and web apps. My focus is performance, usability, and elegant interfaces—combining strong engineering with design polish to deliver products that look great and work reliably.",
  aboutSpanishLine: "Construyo experiencias web claras, rápidas y confiables. ✨",
  skillsTitle: "Skills",
  contactTitle: "Contact",
  contactText: "Let’s build something clean and business-ready 😌",
  contactSubLine: "Hablemos — I reply fast.",
  email: "yourname@email.com",
  github: "#",
  footerName: "Dorah",

  bgMusicEnabled: false,
  bgMusicVolume: 0.35,
  bgMusicUrl: "",
};

const SKILL_GROUPS = [
  {
    title: "Core Frontend",
    items: ["React", "JavaScript (ES6+)", "HTML5 / CSS3", "Tailwind CSS", "Responsive & Mobile-First Development"],
  },
  {
    title: "UI Engineering",
    items: [
      "Interface Implementation from Concept / Inspiration",
      "Interactive UI & Micro-animations",
      "Dark / Modern Interface Styling",
      "Performance-Focused Frontend Development",
      "Cross-Device Optimization",
    ],
  },
  {
    title: "Backend & Integration",
    items: ["Node.js (Express)", "REST APIs", "JWT Authentication", "Media Upload Handling", "CRUD Systems"],
  },
  {
    title: "Workflow & Tools",
    items: ["Git / GitHub", "Vite", "Debugging & Optimization", "Deployment Basics"],
  },
];

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function Tag({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80">
      {children}
    </span>
  );
}

function GlowDot({ className = "" }) {
  return (
    <span
      className={
        "absolute h-1.5 w-1.5 rounded-full bg-white/90 shadow-[0_0_18px_rgba(110,231,255,0.9)] " + className
      }
    />
  );
}

function resolveMedia(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE}${url}`;
  return url;
}

function normalizeContentPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { ...defaultContent };
  }

  if ("brandName" in payload || "heroHeadline" in payload || "bgMusicUrl" in payload) {
    return { ...defaultContent, ...payload };
  }

  if (payload.content && typeof payload.content === "object") {
    return { ...defaultContent, ...payload.content };
  }

  if (payload.data && typeof payload.data === "object") {
    return { ...defaultContent, ...payload.data };
  }

  return { ...defaultContent };
}

async function apiGetProjects() {
  const res = await fetch(`${API_BASE}/api/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return await res.json();
}

async function apiLogin(password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Login failed");
  return data.token;
}

async function apiUpload(token, { videoFile }) {
  const fd = new FormData();
  fd.append("video", videoFile);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Upload failed");
  return data;
}

async function apiUploadAudio(token, audioFile) {
  const fd = new FormData();
  fd.append("audio", audioFile);

  const res = await fetch(`${API_BASE}/api/upload-audio`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Audio upload failed");
  return data;
}

async function apiCreateProject(token, payload) {
  const res = await fetch(`${API_BASE}/api/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Create failed");
  return data;
}

async function apiDeleteProject(token, id) {
  const res = await fetch(`${API_BASE}/api/projects/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Delete failed");
  return data;
}

async function apiGetContent() {
  const res = await fetch(`${API_BASE}/api/content`);
  if (!res.ok) throw new Error("Failed to fetch content");
  const data = await res.json();
  return normalizeContentPayload(data);
}

async function apiUpdateContent(token, payload) {
  const res = await fetch(`${API_BASE}/api/content`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Update failed");
  return normalizeContentPayload(data);
}

function BackgroundAudio({ content }) {
  const audioRef = useRef(null);
  const [blocked, setBlocked] = useState(false);

  const enabled = !!content?.bgMusicEnabled;
  const src = resolveMedia(content?.bgMusicUrl || "");
  const volume = clamp(Number(content?.bgMusicVolume ?? 0.35), 0, 1);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = volume;
  }, [volume]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    if (!enabled || !src) {
      a.pause();
      a.removeAttribute("src");
      a.load();
      setBlocked(false);
      return;
    }

    a.src = src;
    a.load();

    const tryPlay = async () => {
      try {
        await a.play();
        setBlocked(false);
      } catch {
        setBlocked(true);
      }
    };

    tryPlay();
  }, [enabled, src]);

  if (!enabled || !src) return null;

  return (
    <>
      <audio ref={audioRef} loop preload="auto" playsInline />

      {blocked && (
        <button
          onClick={async () => {
            try {
              await audioRef.current?.play();
              setBlocked(false);
            } catch {
              setBlocked(true);
            }
          }}
          className="fixed bottom-5 right-5 z-[999] rounded-full border border-white/10 bg-[#070B1A]/90 px-4 py-3 text-sm text-white/85 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur hover:bg-white/10"
          aria-label="Enable background music"
          title="Enable background music"
        >
          🔊 Tap to enable sound
        </button>
      )}
    </>
  );
}

function WelcomeOverlay({ open }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 sm:px-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[28px] border border-white/10 bg-[#070B1A]/88 px-6 py-8 text-center shadow-[0_50px_180px_rgba(0,0,0,0.9)] backdrop-blur sm:rounded-[34px] sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.22),transparent_55%),radial-gradient(circle_at_80%_90%,rgba(34,211,238,0.16),transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:100%_10px]" />
        </div>

        <div className="relative mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_25px_80px_rgba(0,0,0,0.75)] sm:h-16 sm:w-16">
          <div className="absolute inset-1 rounded-full border border-white/10" />
          <div className="absolute inset-3 rounded-full border border-white/10" />
          <div className="text-lg text-white/80" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            ✶
          </div>
          <span className="absolute -right-1 top-2 h-1.5 w-1.5 rounded-full bg-white/85 shadow-[0_0_18px_rgba(110,231,255,0.75)]" />
          <span className="absolute -left-1 bottom-3 h-1.5 w-1.5 rounded-full bg-white/70 shadow-[0_0_18px_rgba(99,102,241,0.65)]" />
        </div>

        <div className="mx-auto flex max-w-sm items-center justify-center gap-4 text-white/35">
          <span className="h-[1px] flex-1 bg-white/10" />
          <span className="text-[10px] tracking-[0.6em]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            ✦ ✦ ✦
          </span>
          <span className="h-[1px] flex-1 bg-white/10" />
        </div>

        <div
          className="mt-5 text-3xl font-semibold tracking-[0.18em] text-white sm:text-4xl"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", textShadow: "0 0 30px rgba(34,211,238,0.15)" }}
        >
          WELCOME
        </div>

        <div className="mt-3 text-sm tracking-wide text-white/70" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          Enter &amp; explore.
        </div>

        <div className="mt-7 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full animate-[welcomeBar_5s_linear_forwards] bg-gradient-to-r from-indigo-500/80 to-cyan-400/70" />
        </div>

        <div className="mt-6 text-[10px] tracking-[0.35em] text-white/35" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          ✦ PORTFOLIO ✦
        </div>
      </div>

      <style>{`
        @keyframes welcomeBar {
          from { transform: translateX(-100%); }
          to { transform: translateX(0%); }
        }
      `}</style>
    </div>
  );
}

function ProjectCard({ p, active = false }) {
  const vref = useRef(null);

  useEffect(() => {
    const v = vref.current;
    if (!v) return;

    if (active) {
      const playNow = async () => {
        try {
          v.currentTime = 0;
          await v.play();
        } catch {}
      };
      playNow();
    } else {
      v.pause();
      try {
        v.currentTime = 0;
      } catch {}
    }
  }, [active]);

  const videoSrc = resolveMedia(p.video);
  const posterSrc = resolveMedia(p.poster);

  return (
    <a
      href={p.link || "#"}
      className="group relative block w-[min(86vw,380px)] sm:w-[min(78vw,380px)]"
      aria-label={`${p.title} — open project`}
      target={p.link && p.link.startsWith("http") ? "_blank" : undefined}
      rel={p.link && p.link.startsWith("http") ? "noreferrer" : undefined}
    >
      <div
        className={`relative overflow-hidden rounded-3xl border bg-gradient-to-b from-white/10 to-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_22px_60px_rgba(0,0,0,0.55)] transition duration-500 ${
          active ? "border-cyan-200/40 ring-2 ring-cyan-200/20" : "border-white/10"
        }`}
      >
        <div className="aspect-[16/9] w-full">
          <video
            ref={vref}
            muted
            loop
            playsInline
            preload="metadata"
            poster={posterSrc || undefined}
            className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${
              active ? "opacity-100 scale-100" : "opacity-70 scale-[1.02]"
            }`}
            src={videoSrc}
          />
        </div>

        <div
          className={`pointer-events-none absolute inset-0 transition duration-500 ${
            active ? "opacity-100" : "opacity-50"
          }`}
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[length:100%_6px]" />
          <div className="absolute -inset-12 bg-[radial-gradient(circle,rgba(99,102,241,0.28),transparent_55%)]" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-wide text-white">{p.title}</div>
              <div className="truncate text-xs text-white/70">{p.role}</div>
            </div>
            <div className="shrink-0 rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[11px] text-white/70">
              {p.year}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {(p.stack || []).slice(0, 4).map((t, idx) => (
              <Tag key={t + idx}>{t}</Tag>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 max-w-full text-sm text-white/70">
        <span className="line-clamp-2">{p.blurb}</span>
      </div>
    </a>
  );
}

function CircularPopupGallery({ projects }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const wheelLock = useRef(false);
  const touchStartX = useRef(0);

  const total = projects.length;

  const goNext = () => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const goPrev = () => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  const handleWheel = (e) => {
    if (wheelLock.current || total <= 1) return;

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 10) return;

    if (delta > 0) goNext();
    else goPrev();

    wheelLock.current = true;
    setTimeout(() => {
      wheelLock.current = false;
    }, 420);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0]?.clientX || 0;
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0]?.clientX || 0;
    const diff = endX - touchStartX.current;

    if (Math.abs(diff) < 40) return;
    if (diff < 0) goNext();
    else goPrev();
  };

  if (!projects?.length) return null;

  return (
    <section
      id="work"
      className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: "pan-y" }}
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">Selected Work</div>
          <div className="mt-2 text-sm text-white/60">
            Use the arrows, swipe, or scroll to rotate the showcase ✨
          </div>
        </div>

        <div className="hidden gap-3 sm:flex">
          <button
            type="button"
            onClick={goPrev}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
            aria-label="Previous project"
          >
            ←
          </button>
          <button
            type="button"
            onClick={goNext}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
            aria-label="Next project"
          >
            →
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 px-2 py-8 sm:rounded-[36px] sm:px-6 sm:py-10 md:px-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[10%] top-[15%] h-40 w-40 rounded-full bg-indigo-600/20 blur-3xl sm:h-56 sm:w-56" />
          <div className="absolute right-[10%] top-[18%] h-40 w-40 rounded-full bg-cyan-400/15 blur-3xl sm:h-56 sm:w-56" />
          <div className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 sm:h-[420px] sm:w-[420px]" />
          <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04] sm:h-[560px] sm:w-[560px]" />
        </div>

        <div className="relative h-[370px] sm:h-[440px] md:h-[520px]">
          {projects.map((p, i) => {
            let offset = i - activeIndex;

            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            const abs = Math.abs(offset);
            const isActive = offset === 0;

            const x = abs === 0 ? 0 : offset < 0 ? (abs === 1 ? -110 : -150) : abs === 1 ? 110 : 150;
            const xDesktop = abs === 0 ? 0 : offset < 0 ? (abs === 1 ? -240 : -320) : abs === 1 ? 240 : 320;

            const y = abs === 0 ? 0 : abs === 1 ? 24 : 52;
            const scale = isActive ? 1 : abs === 1 ? 0.82 : 0.66;
            const opacity = isActive ? 1 : abs === 1 ? 0.38 : 0.12;
            const blur = isActive ? 0 : abs === 1 ? 1.2 : 2.6;
            const rotateY = offset * -14;
            const zIndex = 50 - abs;

            return (
              <div
                key={p.id || p.title + i}
                className="absolute left-1/2 top-1/2 transition-all duration-700 ease-out"
                style={{
                  transform: `translate(-50%, -50%) translateX(clamp(${x}px, 24vw, ${xDesktop}px)) translateY(${y}px) scale(${scale}) rotateY(${rotateY}deg)`,
                  opacity,
                  filter: `blur(${blur}px)`,
                  zIndex,
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                <ProjectCard p={p} active={isActive} />
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {projects.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Go to project ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                i === activeIndex
                  ? "w-8 bg-cyan-300 shadow-[0_0_18px_rgba(110,231,255,0.8)]"
                  : "w-2.5 bg-white/25 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        <div className="mt-5 text-center text-xs text-white/50">
          Active project: <span className="text-white/75">{projects[activeIndex]?.title}</span>
        </div>

        <div className="mt-5 flex justify-center gap-3 sm:hidden">
          <button
            type="button"
            onClick={goPrev}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80"
            aria-label="Previous project"
          >
            ←
          </button>
          <button
            type="button"
            onClick={goNext}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80"
            aria-label="Next project"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}

function PasswordModal({ open, onClose, onSuccess }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setPw("");
      setErr("");
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const token = await apiLogin(pw);
      sessionStorage.setItem("dorah_admin_token", token);
      onSuccess?.();
      onClose?.();
    } catch (e2) {
      setErr(e2?.message || "Wrong password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-6">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#070B1A] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.75)]">
        <div className="text-sm font-semibold text-white">Admin</div>
        <div className="mt-1 text-xs text-white/60">Enter password to manage your portfolio.</div>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-cyan-200/40"
          />
          {err ? <div className="text-xs text-red-300">{err}</div> : null}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-500/80 to-cyan-400/70 px-4 py-3 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Checking..." : "Enter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SkillsDropdowns() {
  const [openIdx, setOpenIdx] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    const onDown = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpenIdx(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const toggle = (idx) => setOpenIdx((prev) => (prev === idx ? null : idx));

  return (
    <div ref={rootRef} className="mt-4 flex flex-wrap gap-3">
      {SKILL_GROUPS.map((group, idx) => {
        const open = openIdx === idx;

        return (
          <div
            key={group.title}
            className="relative"
            onMouseEnter={() => setOpenIdx(idx)}
            onMouseLeave={() => setOpenIdx(null)}
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/85 transition hover:bg-white/10 active:scale-[0.99]"
              aria-expanded={open}
              aria-haspopup="true"
            >
              {group.title}
            </button>

            {open && (
              <div className="absolute left-0 top-[52px] z-50 w-[320px] max-w-[85vw] rounded-3xl border border-white/10 bg-[#070B1A]/95 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.75)] backdrop-blur">
                <div className="text-xs font-semibold text-white/80">{group.title}</div>

                <ul className="mt-3 space-y-2">
                  {group.items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-white/75">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-200/80 shadow-[0_0_18px_rgba(110,231,255,0.7)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 text-[11px] text-white/45">Tap outside to close</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AdminPage({ projects, refresh, content, setContent }) {
  const token = sessionStorage.getItem("dorah_admin_token") || "";

  const [title, setTitle] = useState("");
  const [role, setRole] = useState("Web Builder");
  const [stack, setStack] = useState("React, Tailwind");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [link, setLink] = useState("https://");
  const [blurb, setBlurb] = useState("");
  const [videoFile, setVideoFile] = useState(null);

  const [audioFile, setAudioFile] = useState(null);
  const [audioBusy, setAudioBusy] = useState(false);

  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const [site, setSite] = useState(content || defaultContent);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSite({ ...defaultContent, ...(content || {}) });
  }, [content]);

  const logout = () => {
    sessionStorage.removeItem("dorah_admin_token");
    window.location.hash = "#/";
  };

  const addProject = async (e) => {
    e.preventDefault();
    setNotice("");
    if (!title.trim()) return setNotice("Title is required.");
    if (!videoFile) return setNotice("Please pick a video file.");
    if (!token) return setNotice("Not logged in.");

    setBusy(true);
    try {
      const { videoUrl } = await apiUpload(token, { videoFile });

      await apiCreateProject(token, {
        title: title.trim(),
        role: role.trim() || "Web Builder",
        stack: stack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 10),
        year: year.trim() || String(new Date().getFullYear()),
        link: link.trim() || "#",
        blurb: blurb.trim() || "",
        video: videoUrl,
      });

      setTitle("");
      setRole("Web Builder");
      setStack("React, Tailwind");
      setYear(String(new Date().getFullYear()));
      setLink("https://");
      setBlurb("");
      setVideoFile(null);

      setNotice("Added! Go back home — it’s now in the showcase ✅");
      await refresh();
    } catch (e2) {
      setNotice(e2?.message || "Failed.");
    } finally {
      setBusy(false);
    }
  };

  const removeProject = async (id) => {
    if (!token) return;
    setBusy(true);
    setNotice("");
    try {
      await apiDeleteProject(token, id);
      await refresh();
    } catch (e2) {
      setNotice(e2?.message || "Delete failed.");
    } finally {
      setBusy(false);
    }
  };

  const saveSite = async (e) => {
    e.preventDefault();
    if (!token) return setNotice("Not logged in.");

    setSaving(true);
    setNotice("");
    try {
      const updated = await apiUpdateContent(token, site);
      setContent(updated);
      await refresh();
      setNotice("Saved! Home page updated ✅");
    } catch (e2) {
      setNotice(e2?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const uploadBgMusic = async () => {
    if (!token) return setNotice("Not logged in.");
    if (!audioFile) return setNotice("Please choose an MP3 file.");

    setAudioBusy(true);
    setNotice("");
    try {
      const { audioUrl } = await apiUploadAudio(token, audioFile);

      const updated = await apiUpdateContent(token, {
        ...site,
        bgMusicUrl: audioUrl,
        bgMusicEnabled: true,
      });

      setContent(updated);
      setSite(updated);
      setAudioFile(null);

      await refresh();

      setNotice("Background music uploaded + enabled ✅");
    } catch (e2) {
      setNotice(e2?.message || "Audio upload failed.");
    } finally {
      setAudioBusy(false);
    }
  };

  const Input = ({ label, value, onChange, placeholder }) => (
    <label className="block text-xs text-white/70">
      {label}
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-cyan-200/40"
      />
    </label>
  );

  const TextArea = ({ label, value, onChange, placeholder, rows = 3 }) => (
    <label className="block text-xs text-white/70">
      {label}
      <textarea
        rows={rows}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-cyan-200/40"
      />
    </label>
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-2xl font-semibold text-white">Admin Panel</div>
          <div className="mt-1 text-sm text-white/60">
            Upload projects + edit homepage + set background music. Sí, como mini CMS 😌
          </div>
          <div className="mt-1 text-xs text-white/50">Backend: {API_BASE}</div>
        </div>
        <div className="flex gap-2">
          <a href="#/" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 hover:bg-white/10">
            Back to Home
          </a>
          <button onClick={logout} className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 hover:bg-white/10">
            Logout
          </button>
        </div>
      </div>

      {notice ? <div className="mt-4 text-sm text-cyan-100/80">{notice}</div> : null}

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-7">
          <div className="text-sm font-semibold text-white">Add a project</div>
          <form onSubmit={addProject} className="mt-4 space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project title"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-cyan-200/40"
            />
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Role"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-cyan-200/40"
            />
            <input
              value={stack}
              onChange={(e) => setStack(e.target.value)}
              placeholder="Stack (comma separated)"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-cyan-200/40"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Year"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-cyan-200/40"
              />
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Live link (https://...)"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-cyan-200/40"
              />
            </div>
            <textarea
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              placeholder="Short blurb"
              rows={3}
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-cyan-200/40"
            />

            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-semibold text-white/80">Upload video</div>
              <label className="mt-2 block text-xs text-white/70">
                Video (mp4/webm)
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="mt-2 block w-full text-xs text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:text-white/80 hover:file:bg-white/15"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-500/80 to-cyan-400/70 px-5 py-3 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-60"
            >
              {busy ? "Working..." : "Add to Showcase"}
            </button>
          </form>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-7">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Current projects</div>
            <div className="text-xs text-white/60">{projects.length} items</div>
          </div>

          <div className="mt-4 space-y-3">
            {projects.map((p) => (
              <div key={p.id || p.title} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{p.title}</div>
                    <div className="truncate text-xs text-white/60">
                      {p.role} • {p.year}
                    </div>
                  </div>
                  {p.id ? (
                    <button
                      onClick={() => removeProject(p.id)}
                      disabled={busy}
                      className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 hover:bg-white/10 disabled:opacity-60"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(p.stack || []).slice(0, 6).map((t, idx) => (
                    <Tag key={t + idx}>{t}</Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/5 p-7">
          <div className="text-sm font-semibold text-white">Edit Home Page</div>
          <div className="mt-1 text-xs text-white/60">Change everything here and click save ✨</div>

          <form onSubmit={saveSite} className="mt-4 space-y-3">
            <Input label="Brand name" value={site.brandName} onChange={(v) => setSite((s) => ({ ...s, brandName: v }))} placeholder="Your name" />
            <Input label="Top bar line" value={site.navLine} onChange={(v) => setSite((s) => ({ ...s, navLine: v }))} placeholder="Web Builder • Abuja" />
            <Input label="Tagline pill text" value={site.taglinePill} onChange={(v) => setSite((s) => ({ ...s, taglinePill: v }))} placeholder="Web builder • Frontend • ..." />
            <Input label="Hero headline" value={site.heroHeadline} onChange={(v) => setSite((s) => ({ ...s, heroHeadline: v }))} placeholder="Main heading" />
            <Input label="Hero subheadline" value={site.heroSubheadline} onChange={(v) => setSite((s) => ({ ...s, heroSubheadline: v }))} placeholder="Smaller line" />
            <TextArea label="Hero description" value={site.heroDescription} onChange={(v) => setSite((s) => ({ ...s, heroDescription: v }))} placeholder="Short line" rows={2} />

            <Input label="Profile card name" value={site.cardName} onChange={(v) => setSite((s) => ({ ...s, cardName: v }))} placeholder="Card name" />
            <Input label="Profile card line 1" value={site.cardLine1} onChange={(v) => setSite((s) => ({ ...s, cardLine1: v }))} placeholder="Line 1" />
            <Input label="Profile card line 2" value={site.cardLine2} onChange={(v) => setSite((s) => ({ ...s, cardLine2: v }))} placeholder="Line 2" />

            <Input label="Clients section title" value={site.clientsTitle} onChange={(v) => setSite((s) => ({ ...s, clientsTitle: v }))} placeholder="Title" />
            <TextArea label="Clients section text" value={site.clientsText} onChange={(v) => setSite((s) => ({ ...s, clientsText: v }))} placeholder="What clients get" />

            <Input label="About title" value={site.aboutTitle} onChange={(v) => setSite((s) => ({ ...s, aboutTitle: v }))} placeholder="About me" />
            <TextArea label="About text" value={site.aboutText} onChange={(v) => setSite((s) => ({ ...s, aboutText: v }))} placeholder="Your bio" />
            <Input label="Spanish line" value={site.aboutSpanishLine} onChange={(v) => setSite((s) => ({ ...s, aboutSpanishLine: v }))} placeholder="Una línea en español..." />

            <Input label="Skills title" value={site.skillsTitle} onChange={(v) => setSite((s) => ({ ...s, skillsTitle: v }))} placeholder="Skills" />

            <Input label="Contact title" value={site.contactTitle} onChange={(v) => setSite((s) => ({ ...s, contactTitle: v }))} placeholder="Contact" />
            <TextArea label="Contact text" value={site.contactText} onChange={(v) => setSite((s) => ({ ...s, contactText: v }))} placeholder="Contact message" rows={2} />
            <Input label="Contact subline" value={site.contactSubLine} onChange={(v) => setSite((s) => ({ ...s, contactSubLine: v }))} placeholder="Hablemos — ..." />

            <Input label="Email" value={site.email} onChange={(v) => setSite((s) => ({ ...s, email: v }))} placeholder="your@email.com" />
            <Input label="GitHub link" value={site.github} onChange={(v) => setSite((s) => ({ ...s, github: v }))} placeholder="https://github.com/..." />
            <Input label="Footer name" value={site.footerName} onChange={(v) => setSite((s) => ({ ...s, footerName: v }))} placeholder="Footer name" />

            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-semibold text-white/80">Background Music</div>

              <label className="mt-3 flex items-center gap-3 text-sm text-white/75">
                <input
                  type="checkbox"
                  checked={!!site.bgMusicEnabled}
                  onChange={(e) => setSite((s) => ({ ...s, bgMusicEnabled: e.target.checked }))}
                  className="h-4 w-4 accent-cyan-300"
                />
                Enable background music
              </label>

              <label className="mt-3 block text-xs text-white/70">
                Default volume: {Math.round((Number(site.bgMusicVolume ?? 0.35) || 0) * 100)}%
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={Number(site.bgMusicVolume ?? 0.35)}
                  onChange={(e) => setSite((s) => ({ ...s, bgMusicVolume: Number(e.target.value) }))}
                  className="mt-2 w-full"
                />
                <div className="mt-1 text-[11px] text-white/45">Nota: iPhones may block autoplay until a user taps once 😅</div>
              </label>

              <label className="mt-3 block text-xs text-white/70">
                Upload MP3 (from your system)
                <input
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  className="mt-2 block w-full text-xs text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:text-white/80 hover:file:bg-white/15"
                />
              </label>

              <button
                type="button"
                disabled={!audioFile || audioBusy}
                onClick={uploadBgMusic}
                className="mt-3 w-full rounded-2xl bg-white/10 px-5 py-3 text-sm text-white/85 transition hover:bg-white/15 disabled:opacity-60"
              >
                {audioBusy ? "Uploading..." : "Upload & Set as Background Music"}
              </button>

              {site.bgMusicUrl ? (
                <div className="mt-3 text-xs text-white/60">
                  Current file: <span className="text-white/80">{site.bgMusicUrl}</span>
                </div>
              ) : (
                <div className="mt-3 text-xs text-white/45">No background music uploaded yet.</div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-500/80 to-cyan-400/70 px-5 py-3 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Website"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [projects, setProjects] = useState(seedProjects);
  const [content, setContent] = useState(defaultContent);

  const [route, setRoute] = useState(() => window.location.hash || "#/");
  const [pwOpen, setPwOpen] = useState(false);
  const token = sessionStorage.getItem("dorah_admin_token");

  const [imgOpen, setImgOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowWelcome(false), 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const refresh = async () => {
    try {
      const [list, c] = await Promise.all([apiGetProjects(), apiGetContent()]);
      setContent(c);

      if (Array.isArray(list) && list.length) setProjects(list);
      else setProjects(seedProjects);
    } catch {
      setProjects(seedProjects);
      setContent(defaultContent);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!route.startsWith("#/admin")) {
      refresh();
    }
  }, [route]);

  const goAdmin = () => {
    if (token) window.location.hash = "#/admin";
    else setPwOpen(true);
  };

  if (route.startsWith("#/admin")) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-[#070B1A] text-white">
        <PasswordModal open={pwOpen} onClose={() => setPwOpen(false)} onSuccess={() => (window.location.hash = "#/admin")} />
        {!token ? (
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
              <div className="text-sm font-semibold text-white">Admin locked</div>
              <p className="mt-2 text-sm text-white/70">Click Admin to enter the password. Sí, seguridad primero 😌</p>
              <div className="mt-5 flex gap-2">
                <a href="#/" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 hover:bg-white/10">
                  Back to Home
                </a>
                <button
                  onClick={() => setPwOpen(true)}
                  className="rounded-full bg-gradient-to-r from-indigo-500/80 to-cyan-400/70 px-5 py-3 text-sm font-semibold text-black hover:brightness-110"
                >
                  Enter Password
                </button>
              </div>
            </div>
          </div>
        ) : (
          <AdminPage projects={projects} refresh={refresh} content={content} setContent={setContent} />
        )}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen min-h-[100dvh] bg-[#070B1A] text-white">
      <style>{`
        :root { color-scheme: dark; }
        html { -webkit-text-size-adjust: 100%; }
        body { text-rendering: geometricPrecision; overscroll-behavior-y: none; }
        #root { min-height: 100vh; min-height: 100dvh; }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 999px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }

        @supports not (backdrop-filter: blur(8px)) {
          .backdrop-blur,
          .backdrop-blur-sm {
            backdrop-filter: none !important;
            background-color: rgba(7, 11, 26, 0.92) !important;
          }
        }
      `}</style>

      <div
        className={
          showWelcome
            ? "opacity-60 pointer-events-none select-none transition duration-500 supports-[filter:blur(3px)]:blur-[3px]"
            : "transition duration-500"
        }
      >
        <div className="pointer-events-none fixed inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(99,102,241,0.25),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.14),transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[length:26px_26px]" />
        </div>

        <PasswordModal open={pwOpen} onClose={() => setPwOpen(false)} onSuccess={() => (window.location.hash = "#/admin")} />

        <BackgroundAudio content={content} />

        {imgOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 backdrop-blur-sm" onClick={() => setImgOpen(false)}>
            <img
              src="/me.png"
              alt="Profile Large"
              className="max-h-[84vh] max-w-[84vw] rounded-3xl border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.9)]"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070B1A]/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-2xl border border-white/10 bg-white/5">
                <GlowDot className="left-2 top-2" />
                <GlowDot className="right-2 bottom-2 opacity-70" />
              </div>
              <div>
                <div className="text-sm font-semibold tracking-wide">{content.brandName}</div>
                <div className="text-xs text-white/60">{content.navLine}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <nav className="hidden items-center gap-2 md:flex">
                {["Work", "About", "Skills"].map((label) => (
                  <a
                    key={label}
                    href={`#${label.toLowerCase()}`}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/75 transition hover:bg-white/10 hover:text-white"
                  >
                    {label}
                  </a>
                ))}
              </nav>

              <a
                href="#contact"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs text-white/80 transition hover:bg-white/10"
                title="Contact"
                aria-label="Contact"
              >
                ✉️
              </a>

              <button
                onClick={goAdmin}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-xs text-white/80 transition hover:bg-white/10"
                title="Admin"
              >
                <span className="text-sm">⚙️</span>
                <span className="hidden sm:inline">Admin</span>
              </button>
            </div>
          </div>
        </header>

        <main>
          <section className="relative mx-auto max-w-6xl px-4 pt-14 sm:px-6 sm:pt-16">
            <div className="grid gap-10 md:grid-cols-2 md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-300 shadow-[0_0_18px_rgba(99,102,241,0.8)]" />
                  {content.taglinePill}
                </div>

                <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
                  {content.heroHeadline}
                  <span className="block text-white/70">{content.heroSubheadline}</span>
                </h1>

                <p className="mt-4 max-w-xl text-base text-white/70">{content.heroDescription}</p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <a
                    href="#work"
                    className="rounded-full bg-gradient-to-r from-indigo-500/80 to-cyan-400/70 px-6 py-3 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(34,211,238,0.15)] transition hover:brightness-110"
                  >
                    View my work
                  </a>
                  <a
                    href="#contact"
                    className="rounded-full border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                  >
                    Contact
                  </a>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-6 rounded-[32px] bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.22),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.25),transparent_60%)] blur-2xl" />
                <div className="relative rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.55)]">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                      <img
                        src="/me.png"
                        alt="Profile"
                        className="h-full w-full cursor-pointer object-cover transition duration-300 hover:scale-105 active:scale-[0.98]"
                        onClick={() => setImgOpen(true)}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{content.cardName}</div>
                      <div className="text-sm text-white/70">{content.cardLine1}</div>
                      <div className="mt-1 text-xs text-white/55">{content.cardLine2}</div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs font-semibold text-white/80">{content.clientsTitle}</div>
                    <div className="mt-1 text-sm text-white/70">{content.clientsText}</div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {["React", "JavaScript", "Tailwind", "REST APIs", "Responsive UI"].map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <CircularPopupGallery projects={projects} />

          <section id="about" className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
              <div className="text-sm font-semibold text-white">{content.aboutTitle}</div>
              <p className="mt-3 max-w-3xl text-base text-white/70">
                {content.aboutText}
                <span className="mt-2 block text-white/70">{content.aboutSpanishLine}</span>
              </p>
            </div>
          </section>

          <section id="skills" className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
              <div className="text-sm font-semibold text-white">{content.skillsTitle}</div>
              <div className="mt-2 text-sm text-white/60">
                Hover or tap a category to explore. <span className="text-white/45">“Calidad, claridad y velocidad.”</span>
              </div>
              <SkillsDropdowns />
            </div>
          </section>

          <section id="contact" className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">{content.contactTitle}</div>
                  <p className="mt-2 max-w-2xl text-sm text-white/70">
                    {content.contactText}
                    <span className="mt-1 block">{content.contactSubLine}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`mailto:${content.email}`}
                    className="rounded-full bg-white/10 px-5 py-3 text-sm text-white/80 transition hover:bg-white/15"
                  >
                    Email
                  </a>
                  <a
                    href={content.github || "#"}
                    target={content.github && content.github.startsWith("http") ? "_blank" : undefined}
                    rel={content.github && content.github.startsWith("http") ? "noreferrer" : undefined}
                    className="rounded-full bg-white/10 px-5 py-3 text-sm text-white/80 transition hover:bg-white/15"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://wa.me/2347032608224?text=Hello%20I%20saw%20your%20portfolio%20and%20would%20like%20to%20discuss%20a%20project."
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white/10 px-5 py-3 text-sm text-white/80 transition hover:bg-white/15"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-white/10 bg-[#070B1A]/60">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-white/55 sm:px-6">
            <span className="text-white/70">{content.footerName}</span> • web builder portfolio • {new Date().getFullYear()}
          </div>
        </footer>
      </div>

      <WelcomeOverlay open={showWelcome} />
    </div>
  );
}