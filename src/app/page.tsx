"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, ArrowRight, Camera, X, Wand2 } from "lucide-react";
import { encodeWish, WishData, Occasion, Mood } from "@/lib/wish";
import ParticlesBg from "@/components/ParticlesBg";

// ─── Data ─────────────────────────────────────────────────────────────────────

const OCCASIONS = [
  { value: "birthday" as Occasion, emoji: "🎂", label: "Birthday", color: "#ff6b6b", glow: "rgba(255,107,107,0.4)" },
  { value: "eid"      as Occasion, emoji: "🌙", label: "Eid",      color: "#4ade80", glow: "rgba(74,222,128,0.4)"  },
  { value: "wedding"  as Occasion, emoji: "💍", label: "Wedding",  color: "#f9a8d4", glow: "rgba(249,168,212,0.4)"},
  { value: "success"  as Occasion, emoji: "🏆", label: "Success",  color: "#fbbf24", glow: "rgba(251,191,36,0.4)" },
  { value: "love"     as Occasion, emoji: "💖", label: "Love",     color: "#f472b6", glow: "rgba(244,114,182,0.4)"},
];

const MOODS = [
  { value: "luxury"      as Mood, label: "Luxury",    emoji: "✨", color: "#ffd700" },
  { value: "royal"       as Mood, label: "Royal",     emoji: "👑", color: "#a78bfa" },
  { value: "celebration" as Mood, label: "Celebrate", emoji: "🎊", color: "#fb923c" },
  { value: "emotional"   as Mood, label: "Emotional", emoji: "💜", color: "#818cf8" },
  { value: "cute"        as Mood, label: "Cute",      emoji: "🌸", color: "#f9a8d4" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as number[], delay },
});

function Shimmer() {
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none",
        background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
      }}
      animate={{ x: ["-100%", "100%"] }}
      transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.8, ease: "easeInOut" }}
    />
  );
}

const inputBase: React.CSSProperties = {
  width: "100%", background: "rgba(255,255,255,0.05)",
  border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 20,
  padding: "18px 22px", fontSize: "1.05rem", color: "#fff",
  outline: "none", transition: "border 0.25s, box-shadow 0.25s", fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase",
  color: "rgba(167,139,250,0.7)", marginBottom: 10, display: "block",
};

function FocusInput({ as: Tag = "input", style: extraStyle, ...props }:
  { as?: "input" | "textarea"; style?: React.CSSProperties } &
  React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  const [focused, setFocused] = useState(false);
  const focusStyle: React.CSSProperties = focused ? {
    border: "1.5px solid rgba(167,139,250,0.8)",
    boxShadow: "0 0 0 4px rgba(124,58,237,0.15), 0 0 30px rgba(124,58,237,0.2)",
    background: "rgba(124,58,237,0.06)",
  } : {};
  const mergedStyle = { ...inputBase, ...focusStyle, ...extraStyle };
  if (Tag === "textarea") {
    return (
      <textarea
        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        style={mergedStyle}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    );
  }
  return (
    <input
      {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
      style={mergedStyle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [pageState, setPageState] = useState<"form" | "done">("form");
  const [name, setName]       = useState("");
  const [from, setFrom]       = useState("");
  const [message, setMessage] = useState("");
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [mood, setMood]         = useState<Mood | null>(null);
  const [photo, setPhoto]       = useState<string | null>(null);
  const [link, setLink]         = useState("");
  const [copied, setCopied]     = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const canGenerate = name.trim() && message.trim() && occasion && mood;

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max = 400;
        const ratio = Math.min(max / img.width, max / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setPhoto(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = () => {
    if (!canGenerate) return;
    const data: WishData = {
      name: name.trim(), from: from.trim(), message: message.trim(),
      occasion: occasion!, mood: mood!, ...(photo ? { photo } : {}),
    };
    const encoded = encodeWish(data);
    const origin = window.location.origin;
    const base = window.location.pathname.startsWith("/WishMian") ? "/WishMian" : "";
    setLink(`${origin}${base}/w/?data=${encoded}`);
    setPageState("done");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const reset = () => {
    setPageState("form"); setName(""); setFrom(""); setMessage("");
    setOccasion(null); setMood(null); setPhoto(null); setLink("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060010", position: "relative", overflowX: "hidden" }}>
      <ParticlesBg count={90} />

      {/* ── Aurora blobs ── */}
      <div aria-hidden="true" className="aurora-1" style={{
        position: "fixed", top: "-20%", left: "-10%", width: 700, height: 700,
        borderRadius: "50%", pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)",
      }} />
      <div aria-hidden="true" className="aurora-2" style={{
        position: "fixed", bottom: "-15%", right: "-10%", width: 600, height: 600,
        borderRadius: "50%", pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)",
      }} />
      <div aria-hidden="true" style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 900, height: 400, borderRadius: "50%", pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse, rgba(109,40,217,0.08) 0%, transparent 70%)",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <AnimatePresence mode="wait">

          {/* ════════════════════════════════ FORM ════════════════════════════════ */}
          {pageState === "form" && (
            <motion.div key="form"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }}
              style={{ maxWidth: 560, margin: "0 auto", padding: "60px 20px 80px" }}
            >
              {/* Logo */}
              <motion.div {...fadeUp(0)} style={{ textAlign: "center", marginBottom: 44 }}>
                <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <div style={{ position: "relative" }}>
                    <div style={{
                      width: 60, height: 60, borderRadius: 18,
                      background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 0 40px rgba(124,58,237,0.7), 0 0 80px rgba(124,58,237,0.3)",
                    }}>
                      <Sparkles size={28} color="#fff" />
                    </div>
                    <div style={{
                      position: "absolute", top: -5, right: -5, width: 16, height: 16,
                      borderRadius: "50%", background: "linear-gradient(135deg,#ffd700,#f59e0b)",
                      boxShadow: "0 0 12px rgba(255,215,0,0.9)", border: "2px solid #060010",
                    }} />
                  </div>
                  <div style={{ lineHeight: 1 }}>
                    <span style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#fff" }}>Wish</span>
                    <span style={{
                      fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.02em",
                      background: "linear-gradient(135deg,#ffd700,#f59e0b,#fbbf24)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>Mian</span>
                  </div>
                  <span style={{ fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(167,139,250,0.5)" }}>
                    Cinematic Wish Links
                  </span>
                </div>
              </motion.div>

              {/* Hero */}
              <motion.div {...fadeUp(0.08)} style={{ textAlign: "center", marginBottom: 52 }}>
                <div style={{ fontSize: "clamp(2.2rem,7vw,3.8rem)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em" }}>
                  <div style={{ color: "#fff" }}>Make someone</div>
                  <div className="text-glow-gold" style={{
                    background: "linear-gradient(135deg,#ffd700 0%,#f59e0b 40%,#fbbf24 70%,#ffd700 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    fontSize: "clamp(2.4rem,8vw,4.2rem)",
                  }}>feel magic.</div>
                </div>
                <p style={{ marginTop: 18, color: "rgba(255,255,255,0.3)", fontSize: "1rem", lineHeight: 1.7 }}>
                  Fill the form. Get a link. Send it. Watch them feel it.
                </p>
              </motion.div>

              {/* Names */}
              <motion.div {...fadeUp(0.14)} style={{ marginBottom: 28 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={labelStyle}>For who?</label>
                    <FocusInput as="input" type="text" placeholder="Their name…"
                      value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>From</label>
                    <FocusInput as="input" type="text" placeholder="Your name…"
                      value={from} onChange={(e) => setFrom(e.target.value)} />
                  </div>
                </div>
              </motion.div>

              {/* Message */}
              <motion.div {...fadeUp(0.18)} style={{ marginBottom: 32 }}>
                <label style={labelStyle}>Your Message</label>
                <FocusInput as="textarea" rows={5} placeholder="Write something from the heart…"
                  value={message} style={{ resize: "none" }}
                  onChange={(e) => setMessage(e.target.value)} />
              </motion.div>

              {/* Occasion */}
              <motion.div {...fadeUp(0.22)} style={{ marginBottom: 32 }}>
                <label style={labelStyle}>Occasion</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
                  {OCCASIONS.map((o) => {
                    const sel = occasion === o.value;
                    return (
                      <motion.button key={o.value}
                        onClick={() => setOccasion(o.value)}
                        whileHover={{ scale: 1.06, y: -4 }} whileTap={{ scale: 0.94 }}
                        style={{
                          height: 84, borderRadius: 18, cursor: "pointer",
                          border: sel ? `2px solid ${o.color}` : "1.5px solid rgba(255,255,255,0.08)",
                          background: sel ? `linear-gradient(135deg,${o.glow},rgba(255,255,255,0.03))` : "rgba(255,255,255,0.03)",
                          boxShadow: sel ? `0 0 24px ${o.glow},0 0 48px ${o.glow}` : "none",
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7,
                          transition: "border 0.2s, background 0.2s, box-shadow 0.2s",
                        }}>
                        <span style={{ fontSize: 30 }}>{o.emoji}</span>
                        <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.06em", color: sel ? o.color : "rgba(255,255,255,0.45)" }}>
                          {o.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Mood */}
              <motion.div {...fadeUp(0.26)} style={{ marginBottom: 32 }}>
                <label style={labelStyle}>Mood</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
                  {MOODS.map((m) => {
                    const sel = mood === m.value;
                    return (
                      <motion.button key={m.value}
                        onClick={() => setMood(m.value)}
                        whileHover={{ scale: 1.06, y: -4 }} whileTap={{ scale: 0.94 }}
                        style={{
                          height: 84, borderRadius: 18, cursor: "pointer",
                          border: sel ? `2px solid ${m.color}` : "1.5px solid rgba(255,255,255,0.08)",
                          background: sel ? `linear-gradient(135deg,${m.color}33,rgba(255,255,255,0.03))` : "rgba(255,255,255,0.03)",
                          boxShadow: sel ? `0 0 24px ${m.color}66,0 0 48px ${m.color}33` : "none",
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7,
                          transition: "border 0.2s, background 0.2s, box-shadow 0.2s",
                        }}>
                        <span style={{ fontSize: 30 }}>{m.emoji}</span>
                        <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.06em", color: sel ? m.color : "rgba(255,255,255,0.45)" }}>
                          {m.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Photo */}
              <motion.div {...fadeUp(0.30)} style={{ marginBottom: 36 }}>
                <label style={labelStyle}>Photo <span style={{ textTransform: "none", letterSpacing: 0, color: "rgba(255,255,255,0.2)", fontSize: "0.7rem" }}>(optional)</span></label>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
                {!photo ? (
                  <motion.button onClick={() => fileRef.current?.click()}
                    whileHover={{ scale: 1.01, borderColor: "rgba(167,139,250,0.5)" }}
                    whileTap={{ scale: 0.99 }}
                    style={{
                      width: "100%", height: 100, borderRadius: 20, cursor: "pointer",
                      border: "2px dashed rgba(167,139,250,0.25)", background: "rgba(124,58,237,0.04)",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
                      transition: "all 0.2s",
                    }}>
                    <Camera size={24} color="rgba(167,139,250,0.5)" />
                    <span style={{ fontSize: "0.8rem", color: "rgba(167,139,250,0.5)", letterSpacing: "0.05em" }}>Add a photo</span>
                  </motion.button>
                ) : (
                  <div style={{ position: "relative", borderRadius: 20, overflow: "hidden" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt="preview" style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)" }} />
                    <motion.button onClick={() => setPhoto(null)}
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      style={{
                        position: "absolute", top: 10, right: 10, width: 32, height: 32,
                        borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: "none",
                        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                      }}>
                      <X size={16} color="#fff" />
                    </motion.button>
                  </div>
                )}
              </motion.div>

              {/* Generate button */}
              <motion.div {...fadeUp(0.34)}>
                <motion.button onClick={handleGenerate} disabled={!canGenerate}
                  whileHover={canGenerate ? { scale: 1.02, y: -2 } : {}}
                  whileTap={canGenerate ? { scale: 0.98 } : {}}
                  style={{
                    position: "relative", width: "100%", height: 68, borderRadius: 20,
                    border: "none", cursor: canGenerate ? "pointer" : "not-allowed", overflow: "hidden",
                    background: canGenerate
                      ? "linear-gradient(135deg,#7c3aed 0%,#9333ea 50%,#6d28d9 100%)"
                      : "rgba(255,255,255,0.06)",
                    boxShadow: canGenerate
                      ? "0 0 60px rgba(124,58,237,0.7),0 0 120px rgba(124,58,237,0.3),0 20px 40px rgba(124,58,237,0.4)"
                      : "none",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                    transition: "all 0.3s",
                  }}>
                  {canGenerate && <Shimmer />}
                  <Wand2 size={22} color={canGenerate ? "#fff" : "rgba(255,255,255,0.2)"} style={{ position: "relative", zIndex: 1 }} />
                  <span style={{
                    fontSize: "1.15rem", fontWeight: 700, letterSpacing: "0.02em",
                    color: canGenerate ? "#fff" : "rgba(255,255,255,0.2)",
                    position: "relative", zIndex: 1,
                  }}>✦ Generate Magic Link ✦</span>
                  <ArrowRight size={22} color={canGenerate ? "#fff" : "rgba(255,255,255,0.2)"} style={{ position: "relative", zIndex: 1 }} />
                </motion.button>
              </motion.div>

            </motion.div>
          )}

          {/* ════════════════════════════════ DONE ════════════════════════════════ */}
          {pageState === "done" && (
            <motion.div key="done"
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                minHeight: "100vh", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "60px 20px 80px", textAlign: "center",
              }}
            >
              {/* Gold radial glow */}
              <div aria-hidden="true" style={{
                position: "fixed", inset: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse at center, rgba(255,215,0,0.1) 0%, transparent 60%)",
              }} />

              <motion.div className="float-anim" style={{ fontSize: 88, marginBottom: 28, lineHeight: 1 }}>✨</motion.div>

              <motion.h1 {...fadeUp(0.05)} style={{
                fontSize: "clamp(2rem,6vw,3.2rem)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12,
                background: "linear-gradient(135deg,#ffd700,#f59e0b,#fbbf24)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>Your wish is ready!</motion.h1>

              <motion.p {...fadeUp(0.1)} style={{ color: "rgba(255,255,255,0.35)", fontSize: "1rem", marginBottom: 40 }}>
                Share this link. When they open it — magic happens.
              </motion.p>

              {/* Link box */}
              <motion.div {...fadeUp(0.15)} style={{ width: "100%", maxWidth: 520, marginBottom: 20 }}>
                <div style={{
                  background: "rgba(255,255,255,0.04)", borderRadius: 18,
                  border: "1.5px solid rgba(255,215,0,0.3)", padding: "16px 18px",
                  display: "flex", alignItems: "center", gap: 12,
                  boxShadow: "0 0 30px rgba(255,215,0,0.1),0 0 60px rgba(255,215,0,0.05)",
                }}>
                  <span style={{ flex: 1, fontFamily: "monospace", fontSize: "0.75rem", color: "rgba(255,255,255,0.65)", wordBreak: "break-all", textAlign: "left", lineHeight: 1.5 }}>
                    {link}
                  </span>
                  <motion.button onClick={handleCopy}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    style={{
                      flexShrink: 0, width: 42, height: 42, borderRadius: 12, cursor: "pointer",
                      background: copied ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.08)",
                      border: copied ? "1.5px solid rgba(74,222,128,0.5)" : "1.5px solid rgba(255,255,255,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                    }}>
                    <AnimatePresence mode="wait">
                      {copied
                        ? <motion.div key="c" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check size={16} color="#4ade80" /></motion.div>
                        : <motion.div key="cp" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Copy size={16} color="rgba(255,255,255,0.6)" /></motion.div>
                      }
                    </AnimatePresence>
                  </motion.button>
                </div>
              </motion.div>

              {/* Gold CTA */}
              <motion.div {...fadeUp(0.2)} style={{ width: "100%", maxWidth: 520, marginBottom: 14 }}>
                <motion.a href={link} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                  style={{
                    position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    width: "100%", height: 68, borderRadius: 20, textDecoration: "none", overflow: "hidden",
                    background: "linear-gradient(135deg,#d97706 0%,#f59e0b 40%,#fbbf24 70%,#d97706 100%)",
                    boxShadow: "0 0 60px rgba(251,191,36,0.6),0 0 120px rgba(251,191,36,0.25),0 20px 40px rgba(251,191,36,0.35)",
                    transition: "all 0.3s",
                  }}>
                  <Shimmer />
                  <Sparkles size={22} color="#fff" style={{ position: "relative", zIndex: 1 }} />
                  <span style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff", position: "relative", zIndex: 1, letterSpacing: "0.02em" }}>
                    ✨ Open the Experience
                  </span>
                  <ArrowRight size={22} color="#fff" style={{ position: "relative", zIndex: 1 }} />
                </motion.a>
              </motion.div>

              <motion.div {...fadeUp(0.25)}>
                <button onClick={reset}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: "0.9rem", padding: "10px 20px", borderRadius: 12, transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                >
                  ← Create another
                </button>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

