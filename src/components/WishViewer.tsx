"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { decodeWish, getTemplate } from "@/lib/wish";
import type { WishData, Template } from "@/lib/wish";
import { Share2, RotateCcw, Sparkles, Music, VolumeX, Check, Heart, Wand2 } from "lucide-react";
import ExplosionCanvas from "./ExplosionCanvas";
import confetti from "canvas-confetti";
import ParticlesBg from "./ParticlesBg";

type Stage = "silence" | "tap" | "flash" | "exploding" | "chat" | "cinematic" | "message" | "finale" | "share";

function createSound() {
  if (typeof window === "undefined") return null;
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const beep = (freq: number, dur: number, vol: number, type: OscillatorType = "sine") => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = type; o.connect(g); g.connect(ctx.destination);
      o.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.start(); o.stop(ctx.currentTime + dur);
    };
    const noise = (dur: number, vol: number) => {
      const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.5);
      const src = ctx.createBufferSource(); const g = ctx.createGain();
      src.buffer = buf; src.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      src.start();
    };
    return {
      tap:     () => { beep(880, 0.1, 0.18, "sine"); setTimeout(() => beep(1100, 0.08, 0.1, "sine"), 60); },
      pop:     () => { beep(700, 0.07, 0.09, "sine"); },
      tick:    () => { beep(1200, 0.03, 0.04, "square"); },
      boom:    () => { noise(0.45, 0.65); setTimeout(() => beep(180, 0.4, 0.35, "sine"), 40); },
      chime:   () => { beep(1047, 0.3, 0.15); setTimeout(() => beep(1319, 0.3, 0.12), 120); setTimeout(() => beep(1568, 0.5, 0.1), 260); },
    };
  } catch { return null; }
}

function useTyping(text: string, speed = 42, startDelay = 0, onTick?: () => void) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false); let i = 0;
    const t = setTimeout(() => {
      const tick = () => {
        i++; setDisplayed(text.slice(0, i));
        if (i % 3 === 0 && onTick) onTick();
        if (i >= text.length) { setDone(true); return; }
        const ch = text[i - 1];
        const d = ch === "." || ch === "!" || ch === "?" ? speed * 9
          : ch === "," ? speed * 3
          : speed + (Math.random() - 0.5) * 16;
        setTimeout(tick, d);
      };
      tick();
    }, startDelay);
    return () => clearTimeout(t);
  }, [text, speed, startDelay]);
  return { displayed, done };
}

function TypingDots({ color }: { color: string }) {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "10px 16px" }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i}
          style={{ width: 8, height: 8, borderRadius: "50%", background: color }}
          animate={{ y: [0, -7, 0], opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 0.85, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function ChatBubble({ text, from, color, delay, onDone, onTick }: {
  text: string; from: "them" | "you"; color: string; delay: number;
  onDone?: () => void; onTick?: () => void;
}) {
  const [phase, setPhase] = useState<"hidden" | "typing" | "shown">("hidden");
  const { displayed, done } = useTyping(text, 40, phase === "typing" ? 0 : 9999999, onTick);
  const snd = useRef<ReturnType<typeof createSound>>(null);
  useEffect(() => { snd.current = createSound(); }, []);
  // Randomize typing duration slightly for human feel
  const typeDur = useRef(from === "them" ? Math.min(text.length * 28 + 400 + Math.random() * 300, 2600) : 300 + Math.random() * 100);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("typing"), delay);
    const t2 = setTimeout(() => { setPhase("shown"); snd.current?.pop(); }, delay + typeDur.current);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [delay]);
  useEffect(() => { if (done && onDone) onDone(); }, [done, onDone]);
  const isRight = from === "you";
  const now = new Date();
  const h = now.getHours(); const m = String(now.getMinutes()).padStart(2, "0");
  const time = (h > 12 ? h - 12 : h || 12) + ":" + m + " " + (h >= 12 ? "PM" : "AM");
  if (phase === "hidden") return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", flexDirection: "column", alignItems: isRight ? "flex-end" : "flex-start", marginBottom: 12 }}
    >
      {phase === "typing" && from === "them" && (
        <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: "18px 18px 18px 4px",
          border: "1px solid rgba(255,255,255,0.1)", display: "inline-block" }}>
          <TypingDots color={color} />
        </div>
      )}
      {phase === "shown" && (
        <>
          <div style={{
            maxWidth: "78%", padding: "13px 17px",
            borderRadius: isRight ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            background: isRight ? `linear-gradient(135deg, ${color}ee, ${color}99)` : "rgba(255,255,255,0.09)",
            border: !isRight ? "1px solid rgba(255,255,255,0.1)" : "none",
            boxShadow: isRight ? `0 4px 24px ${color}30` : "none",
            fontSize: "0.97rem", lineHeight: 1.65, color: "#fff", backdropFilter: "blur(12px)",
          }}>
            {displayed}{!done && <span style={{ opacity: 0.3 }}>|</span>}
          </div>
          <span style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.2)", marginTop: 4, padding: "0 4px" }}>{time}</span>
        </>
      )}
    </motion.div>
  );
}

function LineReveal({ lines, color, baseDelay = 0 }: { lines: string[]; color: string; baseDelay?: number }) {
  return (
    <div style={{ textAlign: "center" }}>
      {lines.map((line, i) => (
        <motion.p key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: baseDelay + i * 0.9, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: i === 0 ? "clamp(2rem,7vw,3.2rem)" : i === 1 ? "1.15rem" : "1rem",
            fontWeight: i === 0 ? 900 : i === 1 ? 400 : 300,
            color: i === 0 ? "#fff" : "rgba(255,255,255,0.65)",
            textShadow: i === 0 ? `0 0 40px ${color}70, 0 0 80px ${color}35` : "none",
            marginBottom: i === 0 ? 16 : 8, lineHeight: 1.2,
          }}
        >
          {line}
        </motion.p>
      ))}
    </div>
  );
}

function fireConfetti(color: string, wave = 1) {
  const colors = [color, "#fff", "#ffd700", "#ff6b6b", "#a78bfa"];
  const spread = 70 + Math.random() * 30;
  const count = wave === 2 ? 160 + Math.floor(Math.random() * 60) : 90 + Math.floor(Math.random() * 40);
  confetti({ particleCount: count, spread, origin: { y: 0.58 + Math.random() * 0.06 }, colors });
  setTimeout(() => confetti({ particleCount: 60, spread: spread + 30, origin: { y: 0.42 }, colors }), 280 + Math.random() * 100);
  if (wave === 2) {
    const angle1 = 55 + Math.random() * 10;
    const angle2 = 115 + Math.random() * 10;
    setTimeout(() => confetti({ particleCount: 55, angle: angle1, spread: 65, origin: { x: 0, y: 0.65 }, colors }), 480);
    setTimeout(() => confetti({ particleCount: 55, angle: angle2, spread: 65, origin: { x: 1, y: 0.65 }, colors }), 480);
    setTimeout(() => confetti({ particleCount: 80, spread: 100, origin: { y: 0.3 }, colors }), 900);
  }
}


export default function WishViewer() {
  const [stage, setStage] = useState<Stage>("silence");
  const [data, setData] = useState<WishData | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [musicOn, setMusicOn] = useState(true);
  const [chatDone, setChatDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [glowPulse, setGlowPulse] = useState(0.1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundRef = useRef<ReturnType<typeof createSound>>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Decode wish + restore photo from sessionStorage
  useEffect(() => {
    soundRef.current = createSound();
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("data");
    if (!encoded) { setStage("tap"); return; }
    const decoded = decodeWish(encoded);
    if (!decoded) { setStage("tap"); return; }
    const photoKey = params.get("pk");
    if (photoKey) { try { const p = sessionStorage.getItem(photoKey); if (p) (decoded as { photo?: string }).photo = p; } catch { /**/ } }
    setData(decoded);
    setTemplate(getTemplate(decoded.occasion, decoded.mood));
    setStage("silence");
  }, []);

  // Setup music
  useEffect(() => {
    if (!template || !data) return;
    const base = window.location.pathname.startsWith("/WishMian") ? "/WishMian" : "";
    const src = data.occasion === "birthday" ? base + "/audio/birthday.mp3" : base + template.musicFile;
    const audio = new Audio(src);
    audio.loop = true; audio.volume = 0;
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ""; };
  }, [template, data]);

  const startMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !musicOn) return;
    audio.play().catch(() => {});
    let vol = 0;
    const fade = setInterval(() => { vol = Math.min(vol + 0.01, 0.55); audio.volume = vol; if (vol >= 0.55) clearInterval(fade); }, 120);
  }, [musicOn]);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicOn) { audio.pause(); setMusicOn(false); }
    else { audio.play().catch(() => {}); setMusicOn(true); }
  };

  const handleTap = () => {
    if (stage !== "tap") return;
    soundRef.current?.tap();
    setStage("flash");
    setTimeout(() => { setStage("exploding"); soundRef.current?.boom(); startMusic(); setGlowPulse(0.4); }, 500);
    setTimeout(() => { setStage("chat"); setGlowPulse(0.15); }, 2800);
  };

  const handleReplay = () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setChatDone(false); setGlowPulse(0.1); setStage("silence");
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title: "A wish for you \uD83C\uDF81", url }).catch(() => {}); }
    else { await navigator.clipboard.writeText(url).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2200); }
  };

  // Auto-scroll chat
  useEffect(() => {
    if (stage === "chat" && chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [stage, chatDone]);

  // Stage auto-advance timers
  useEffect(() => {
    if (!data || !template) return;
    const gc = template.glowColor;
    if (stage === "cinematic") {
      setGlowPulse(0.28);
      // 0.5s pause then name appears, hold 6s total
      const t = setTimeout(() => { setStage("message"); setGlowPulse(0.32); }, 6000);
      return () => clearTimeout(t);
    }
    if (stage === "message") {
      // Hold message longer — 15s emotional anchor
      const t = setTimeout(() => { setStage("finale"); setGlowPulse(0.5); fireConfetti(gc, 1); soundRef.current?.chime(); }, 15000);
      return () => clearTimeout(t);
    }
    if (stage === "finale") {
      const t = setTimeout(() => fireConfetti(gc, 2), 2500);
      return () => clearTimeout(t);
    }
  }, [stage, data, template]);

  // Loading
  if (!data || !template) return (
    <div style={{ position: "fixed", inset: 0, background: "#060010", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Opening...</span>
      </motion.div>
    </div>
  );

  const gc = template.glowColor;

  // Chat messages — emotional story with slight random delays
  const chatMsgs = [
    { text: "Hey " + data.name + "\u2026 \uD83D\uDE0A", from: "them" as const, delay: 400 },
    { text: "I wanted to tell you something\u2026", from: "them" as const, delay: 2800 },
    { text: "What is it? \uD83D\uDC40", from: "you" as const, delay: 5600 },
    { text: "You\u2019ve been really important to me.", from: "them" as const, delay: 7400 },
    { text: "Today is your special day " + template.emoji, from: "them" as const, delay: 11500 },
    { text: "Omg really?! \uD83E\uDD79", from: "you" as const, delay: 14800 },
    { text: "Open your surprise below \u2193", from: "them" as const, delay: 16500 },
  ];
  const onChatDone = () => { setChatDone(true); setTimeout(() => { setStage("cinematic"); }, 2400); };

  return (
    <div style={{ minHeight: "100vh", background: "#060010", position: "relative", overflow: "hidden" }}>
      <ParticlesBg count={40} />
      {/* Breathing glow */}
      <motion.div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `radial-gradient(ellipse at center, ${gc}${Math.round(glowPulse * 255).toString(16).padStart(2, "0")} 0%, transparent 65%)` }}
        animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />

      <AnimatePresence mode="wait">

        {stage === "silence" && (
          <motion.div key="silence" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
            onClick={() => setStage("tap")}
            style={{ position: "fixed", inset: 0, background: "#020008", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", cursor: "pointer", userSelect: "none", zIndex: 1 }}
          >
            <motion.div style={{ position: "absolute", inset: 0,
              background: `radial-gradient(ellipse at center, ${gc}14 0%, transparent 60%)` }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.06, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 2.5 }}
              style={{ textAlign: "center", marginBottom: 56, zIndex: 1 }}>
              <p style={{ fontSize: "0.78rem", letterSpacing: "0.28em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.2)", lineHeight: 2.5 }}>
                Hey\u2026 someone has<br />something for you
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.8, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, zIndex: 1 }}>
              <motion.div
                animate={{ scale: [1, 1.12, 1], boxShadow: [`0 0 25px ${gc}22`, `0 0 55px ${gc}55`, `0 0 25px ${gc}22`] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: 84, height: 84, borderRadius: "50%", border: `1.5px solid ${gc}44`,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "0.52rem", letterSpacing: "0.32em", textTransform: "uppercase", color: gc + "cc" }}>TAP</span>
              </motion.div>
              <motion.p animate={{ opacity: [0.1, 0.35, 0.1] }} transition={{ duration: 3.5, repeat: Infinity }}
                style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.18)", letterSpacing: "0.12em" }}>
                tap to open
              </motion.p>
            </motion.div>
          </motion.div>
        )}

        {stage === "tap" && (
          <motion.div key="tap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleTap}
            style={{ position: "fixed", inset: 0, background: "#020008", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", cursor: "pointer", userSelect: "none", zIndex: 1, overflow: "hidden" }}>
            <motion.div style={{ position: "absolute", inset: 0,
              background: `radial-gradient(ellipse at center, ${gc}22 0%, transparent 55%)` }}
              animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
            <motion.p animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.85, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontSize: "0.58rem", letterSpacing: "0.38em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)", marginBottom: 48, zIndex: 1 }}>
              For {data.name}
            </motion.p>
            <motion.div
              animate={{ scale: [1, 1.22, 1], boxShadow: [`0 0 40px ${gc}40`, `0 0 90px ${gc}75`, `0 0 40px ${gc}40`] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: 92, height: 92, borderRadius: "50%", border: `2px solid ${gc}77`,
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
              <span style={{ fontSize: "0.56rem", letterSpacing: "0.3em", textTransform: "uppercase", color: gc }}>TAP</span>
            </motion.div>
          </motion.div>
        )}

        {stage === "flash" && (
          <motion.div key="flash" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.55, times: [0, 0.08, 0.75, 1] }}
            style={{ position: "fixed", inset: 0, background: "#ffffff", zIndex: 200 }} />
        )}

        {stage === "exploding" && (
          <motion.div key="exploding" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.2 } }}
            style={{ position: "fixed", inset: 0, background: "#060010", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at center, ${gc}45 0%, transparent 55%)` }} />
            <ExplosionCanvas colors={template.particleColors} style={template.animationStyle} />
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.6, 1.1, 1], opacity: [0, 1, 1, 1] }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontSize: 96, position: "relative", zIndex: 2, filter: `drop-shadow(0 0 40px ${gc})` }}>
              {template.emoji}
            </motion.div>
          </motion.div>
        )}

        {stage === "chat" && (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30, transition: { duration: 1.5 } }}
            style={{ position: "fixed", inset: 0, background: "#060010", display: "flex", flexDirection: "column", zIndex: 1 }}>
            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
              <motion.div animate={{ boxShadow: [`0 0 15px ${gc}30`, `0 0 35px ${gc}65`, `0 0 15px ${gc}30`] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg, ${gc}, ${gc}88)`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                {template.emoji}
              </motion.div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: "0.92rem", fontWeight: 600 }}>WishMian</div>
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.68rem" }}>delivering your surprise\u2026</motion.div>
              </div>
              <div style={{ display: "flex", gap: 14 }}>
                <button onClick={toggleMusic} style={{ background: "none", border: "none", cursor: "pointer", color: musicOn ? gc : "rgba(255,255,255,0.3)" }}>
                  {musicOn ? <Music size={16} /> : <VolumeX size={16} />}
                </button>
                <button onClick={handleReplay} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)" }}>
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
            {/* Messages */}
            <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "24px 18px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              {chatMsgs.map((m, i) => (
                <ChatBubble key={i} text={m.text} from={m.from} color={gc} delay={m.delay}
                  onTick={() => soundRef.current?.tick()}
                  onDone={i === chatMsgs.length - 1 ? onChatDone : undefined} />
              ))}
            </div>
            {/* Reveal button */}
            <AnimatePresence>
              {chatDone && (
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "14px 20px 36px" }}>
                  <motion.button onClick={() => setStage("cinematic")}
                    whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
                    style={{ width: "100%", height: 60, borderRadius: 20, border: "none", cursor: "pointer",
                      background: `linear-gradient(135deg, ${gc}, ${gc}bb)`,
                      boxShadow: `0 0 50px ${gc}55, 0 8px 32px ${gc}30`,
                      color: "#fff", fontSize: "1.05rem", fontWeight: 700, letterSpacing: "0.02em" }}>
                    Open Your Wish {template.emoji}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {stage === "cinematic" && (
          <motion.div key="cinematic" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 2 } }}
            style={{ position: "fixed", inset: 0, background: "#060010", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 24px", zIndex: 1 }}>
            <motion.div style={{ position: "absolute", inset: 0,
              background: `radial-gradient(ellipse at 50% 55%, ${gc}30 0%, transparent 60%)` }}
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3.5, repeat: Infinity }} />
            <ParticlesBg count={25} />
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 1.2 }}
              style={{ fontSize: "0.58rem", letterSpacing: "0.4em", textTransform: "uppercase", color: gc + "88", marginBottom: 28 }}>
              {template.label}
            </motion.p>
            {/* Name: blur → sharp with 0.5s pause */}
            <motion.div initial={{ opacity: 0, scale: 0.65, filter: "blur(24px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ delay: 1.1, duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: "clamp(3.2rem,13vw,6.5rem)", fontWeight: 900, letterSpacing: "-0.04em",
                color: "#fff", textShadow: `0 0 70px ${gc}90, 0 0 140px ${gc}45`, lineHeight: 1, marginBottom: 24 }}>
              {data.name}
            </motion.div>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ delay: 3.0, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: 140, height: 2, background: `linear-gradient(90deg, transparent, ${gc}, transparent)`, marginBottom: 24 }} />
            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.6, duration: 1.2 }}
              style={{ color: "rgba(255,255,255,0.38)", fontSize: "1.05rem", letterSpacing: "0.06em" }}>
              your moment is here {template.emoji}
            </motion.p>
          </motion.div>
        )}

        {stage === "message" && (
          <motion.div key="message" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4 }}
            style={{ minHeight: "100vh", display: "flex", flexDirection: "column", zIndex: 1 }}>
            {/* Top bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
              <a href="/" style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.35, textDecoration: "none" }}>
                <Sparkles size={13} color="#fff" />
                <span style={{ color: "#fff", fontSize: "0.6rem", letterSpacing: "0.24em", textTransform: "uppercase" }}>WishMian</span>
              </a>
              <div style={{ display: "flex", gap: 14 }}>
                <button onClick={toggleMusic} style={{ background: "none", border: "none", cursor: "pointer", color: musicOn ? gc : "rgba(255,255,255,0.3)" }}>
                  {musicOn ? <Music size={17} /> : <VolumeX size={17} />}
                </button>
                <button onClick={handleReplay} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)" }}>
                  <RotateCcw size={15} />
                </button>
                <button onClick={handleShare} style={{ background: "none", border: "none", cursor: "pointer", color: gc, display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem" }}>
                  <Share2 size={15} /> Share
                </button>
              </div>
            </div>
            {/* Content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 24px 40px", textAlign: "center" }}>
              {/* Photo */}
              {data.photo && (
                <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.45 }} style={{ marginBottom: 28 }}>
                  <motion.div animate={{ boxShadow: [`0 0 30px ${gc}40`, `0 0 65px ${gc}75`, `0 0 30px ${gc}40`] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ width: 114, height: 114, borderRadius: "50%", overflow: "hidden", border: `3px solid ${gc}` }}>
                    <img src={data.photo} alt={data.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </motion.div>
                </motion.div>
              )}
              {/* Line-by-line message reveal */}
              <LineReveal
                lines={[template.label, "You mean more than words can say.", "Stay blessed, always \u2728"]}
                color={gc}
                baseDelay={0.4}
              />
              {/* Message card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 1 }}
                style={{ maxWidth: 420, width: "100%", background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${gc}22`, borderRadius: 24, padding: "24px 28px",
                  boxShadow: `0 0 50px ${gc}12`, backdropFilter: "blur(20px)", margin: "22px 0" }}>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "rgba(255,255,255,0.85)", fontWeight: 300 }}>
                  {data.message}
                </p>
              </motion.div>
              {data.from && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
                  style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.88rem", marginBottom: 24 }}>
                  &mdash; {data.from}
                </motion.p>
              )}
              {/* Floating emoji */}
              <motion.div animate={{ y: [0, -14, 0], rotate: [-4, 4, -4] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontSize: 52, marginBottom: 28 }}>{template.emoji}</motion.div>
              {/* Color bar */}
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                transition={{ delay: 1.5, duration: 1.1 }}
                style={{ display: "flex", gap: 6, marginBottom: 36 }}>
                {template.colorPalette.map((c: string, i: number) => (
                  <div key={i} style={{ width: 38, height: 3, borderRadius: 2, background: c }} />
                ))}
              </motion.div>
              {/* Smile CTA */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.8 }}>
                <motion.button onClick={() => { fireConfetti(gc); soundRef.current?.chime(); setStage("finale"); }}
                  whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.96 }}
                  style={{ padding: "15px 36px", borderRadius: 50, border: "none", cursor: "pointer",
                    background: `linear-gradient(135deg, ${gc}, ${gc}bb)`,
                    color: "#fff", fontSize: "0.98rem", fontWeight: 700, letterSpacing: "0.03em",
                    boxShadow: `0 0 40px ${gc}55, 0 10px 30px ${gc}35`,
                    display: "flex", alignItems: "center", gap: 10 }}>
                  <Heart size={17} fill="white" /> Did this make you smile?
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {stage === "finale" && (
          <motion.div key="finale" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "#060010", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center", zIndex: 1 }}>
            <motion.div style={{ position: "absolute", inset: 0,
              background: `radial-gradient(ellipse at center, ${gc}35 0%, transparent 60%)` }}
              animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
            <ParticlesBg count={70} />
            <motion.div className="float-anim" style={{ fontSize: 84, marginBottom: 20, position: "relative", zIndex: 1 }}>\uD83C\uDF89</motion.div>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ fontSize: "clamp(2.2rem,7vw,3.5rem)", fontWeight: 900, color: "#fff", marginBottom: 10,
                position: "relative", zIndex: 1, textShadow: `0 0 50px ${gc}90` }}>
              {template.label}!
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.05rem", marginBottom: 44, position: "relative", zIndex: 1 }}>
              Stay blessed, always \u2728
            </motion.p>
            {/* CONVERSION SCREEN — growth engine */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 380, position: "relative", zIndex: 1 }}>
              {/* Primary: Share */}
              <motion.button onClick={handleShare} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                style={{ height: 60, borderRadius: 20, border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg, ${gc}, ${gc}bb)`,
                  boxShadow: `0 0 50px ${gc}55`, color: "#fff", fontSize: "1.02rem", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                {copied ? <><Check size={18} /> Copied!</> : <><Share2 size={18} /> Share this wish</>}
              </motion.button>
              {/* Secondary: Create your own — GROWTH ENGINE */}
              <motion.a href="/" whileHover={{ scale: 1.02, y: -1 }}
                style={{ height: 60, borderRadius: 20, border: `1.5px solid ${gc}44`,
                  background: `${gc}11`, color: "#fff", fontSize: "1rem",
                  fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <Wand2 size={18} /> Create Your Own Wish
              </motion.a>
              {/* Tertiary: Replay */}
              <button onClick={handleReplay}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.22)", fontSize: "0.85rem", padding: "8px" }}>
                <RotateCcw size={14} style={{ display: "inline", marginRight: 6 }} />Replay
              </button>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}