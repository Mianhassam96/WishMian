"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { decodeWish, getTemplate, WishData, Template } from "@/lib/wish";
import { Share2, RotateCcw, Sparkles, Music, VolumeX } from "lucide-react";
import ExplosionCanvas from "./ExplosionCanvas";
import confetti from "canvas-confetti";

type Stage = "loading" | "tap" | "exploding" | "chat" | "message" | "end";

/* ── Typing hook ─────────────────────────────────────────────────────────── */
function useTyping(text: string, speed = 38, startDelay = 0) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    let i = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(iv); setDone(true); }
      }, speed);
      return () => clearInterval(iv);
    }, startDelay);
    return () => clearTimeout(t);
  }, [text, speed, startDelay]);
  return { displayed, done };
}

/* ── Chat bubble ─────────────────────────────────────────────────────────── */
function ChatBubble({ text, from, color, delay, onDone }: {
  text: string; from: "them" | "you"; color: string; delay: number; onDone?: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const { displayed, done } = useTyping(text, 35, delay);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay - 100);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => { if (done && onDone) onDone(); }, [done, onDone]);

  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex",
        justifyContent: from === "you" ? "flex-end" : "flex-start",
        marginBottom: 10,
      }}
    >
      <div style={{
        maxWidth: "78%",
        padding: "12px 16px",
        borderRadius: from === "you" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
        background: from === "you"
          ? `linear-gradient(135deg, ${color}, ${color}cc)`
          : "rgba(255,255,255,0.08)",
        border: from === "them" ? "1px solid rgba(255,255,255,0.1)" : "none",
        boxShadow: from === "you" ? `0 4px 20px ${color}40` : "none",
        fontSize: "0.95rem",
        lineHeight: 1.5,
        color: "#fff",
        backdropFilter: "blur(10px)",
      }}>
        {displayed}
        {!done && <span style={{ opacity: 0.5, animation: "blink 1s infinite" }}>|</span>}
      </div>
    </motion.div>
  );
}

/* ── Main viewer ─────────────────────────────────────────────────────────── */
export default function WishViewer() {
  const [data, setData] = useState<WishData | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [stage, setStage] = useState<Stage>("loading");
  const [invalid, setInvalid] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [chatStep, setChatStep] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shakeControls = useAnimation();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("data");
    if (!encoded) { setInvalid(true); return; }
    const decoded = decodeWish(encoded);
    if (!decoded) { setInvalid(true); return; }
    setData(decoded);
    setTemplate(getTemplate(decoded.occasion, decoded.mood));
    setStage("tap");
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatStep]);

  const fireConfetti = useCallback((color: string) => {
    const colors = [color, "#ffffff", "#ffd700", "#a78bfa"];
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors });
    setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { y: 0.5 }, colors, angle: 60 }), 300);
    setTimeout(() => confetti({ particleCount: 80, spread: 120, origin: { y: 0.5 }, colors, angle: 120 }), 500);
  }, []);

  const playMusic = useCallback((src: string) => {
    try {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(src);
      audio.volume = 0.4; audio.loop = true;
      audio.play().catch(() => {});
      audioRef.current = audio;
      setMusicOn(true);
    } catch {}
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (musicOn) { audioRef.current.pause(); setMusicOn(false); }
    else { audioRef.current.play().catch(() => {}); setMusicOn(true); }
  };

  const handleTap = useCallback(async () => {
    if (stage !== "tap" || !template) return;
    setStage("exploding");
    await shakeControls.start({
      x: [0, -10, 10, -8, 8, -4, 4, 0],
      transition: { duration: 0.6, ease: "easeOut" },
    });
    playMusic(template.musicFile);
    fireConfetti(template.glowColor);
    setTimeout(() => {
      setStage("chat");
      setChatStep(1);
    }, 1200);
  }, [stage, template, shakeControls, playMusic, fireConfetti]);

  const handleReplay = () => {
    audioRef.current?.pause(); audioRef.current = null;
    setMusicOn(false); setChatStep(0); setStage("tap");
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: `A special wish for ${data?.name}`, url });
    else navigator.clipboard.writeText(url);
  };

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  if (invalid) return <InvalidPage />;
  if (!data || !template) return <LoadingScreen />;

  // Chat script
  const chatScript = [
    { from: "them" as const, text: "Hey 👋" },
    { from: "them" as const, text: `${data.name}... I have something for you.` },
    { from: "them" as const, text: "Something I've been wanting to say for a while... 💭" },
    { from: "you"  as const, text: "What is it? 🥺" },
    { from: "them" as const, text: `${template.label} ${template.emoji}` },
    { from: "them" as const, text: data.message },
    ...(data.from ? [{ from: "them" as const, text: `— ${data.from} 💖` }] : []),
  ];

  const chatDelays = chatScript.reduce<number[]>((acc, item, i) => {
    const prev = acc[i - 1] ?? 0;
    const typingTime = item.text.length * 38 + 600;
    acc.push(prev + typingTime);
    return acc;
  }, []);

  const totalChatTime = chatDelays[chatDelays.length - 1] + chatScript[chatScript.length - 1].text.length * 38 + 1000;

  return (
    <motion.div animate={shakeControls} style={{ minHeight: "100vh", background: "#060010", position: "relative", overflow: "hidden" }}>
      {/* Background gradient */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 30% 20%, ${template.glowColor}18 0%, transparent 60%),
                     radial-gradient(ellipse at 70% 80%, ${template.colors[1]}12 0%, transparent 60%)`,
      }} />

      {/* Floating particles */}
      <FloatingParticles colors={template.particleColors} />

      <AnimatePresence mode="wait">

        {/* ── TAP SCREEN ── */}
        {stage === "tap" && (
          <motion.div key="tap"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.7 }}
            onClick={handleTap}
            style={{
              position: "fixed", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", cursor: "pointer",
              background: "#060010",
            }}
          >
            {/* Radial glow */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: `radial-gradient(ellipse at center, ${template.glowColor}20 0%, transparent 65%)`,
            }} />

            {/* Pulsing rings */}
            {[1, 2, 3].map((i) => (
              <motion.div key={i}
                style={{
                  position: "absolute", width: 80 + i * 60, height: 80 + i * 60,
                  borderRadius: "50%", border: `1px solid ${template.glowColor}`,
                  opacity: 0,
                }}
                animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
              />
            ))}

            {/* Center emoji */}
            <motion.div
              animate={{ scale: [1, 1.08, 1], rotate: [-3, 3, -3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontSize: 72, marginBottom: 28, position: "relative", zIndex: 1 }}
            >
              {template.emoji}
            </motion.div>

            {/* Typing intro */}
            <TypingIntro name={data.name} color={template.glowColor} />

            {/* Tap hint */}
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4], y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 2 }}
              style={{ position: "relative", zIndex: 1, marginTop: 32 }}
            >
              <div style={{
                padding: "12px 28px", borderRadius: 50,
                border: `1px solid ${template.glowColor}50`,
                background: `${template.glowColor}10`,
                fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase",
                color: template.glowColor,
              }}>
                Tap to open ✨
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── EXPLODING ── */}
        {stage === "exploding" && (
          <motion.div key="exploding" initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "#060010", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <ExplosionCanvas colors={template.particleColors} style={template.animationStyle} />
            <motion.div initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.5 }}
              style={{ position: "absolute", inset: 0, background: "#fff", pointerEvents: "none" }} />
          </motion.div>
        )}

        {/* ── CHAT REVEAL ── */}
        {stage === "chat" && (
          <motion.div key="chat"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
            style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
          >
            {/* Chat header */}
            <div style={{
              padding: "16px 20px", display: "flex", alignItems: "center", gap: 12,
              background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, zIndex: 10,
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: "50%",
                background: `linear-gradient(135deg, ${template.glowColor}, ${template.colors[1]})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, boxShadow: `0 0 15px ${template.glowColor}60`,
              }}>
                {template.emoji}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#fff" }}>
                  {data.from || "Someone Special"}
                </div>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ fontSize: "0.7rem", color: template.glowColor }}
                >
                  typing...
                </motion.div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
                <button onClick={toggleMusic} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)" }}>
                  {musicOn ? <Music size={18} /> : <VolumeX size={18} />}
                </button>
                <button onClick={handleReplay} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)" }}>
                  <RotateCcw size={16} />
                </button>
                <button onClick={handleShare} style={{ background: "none", border: "none", cursor: "pointer", color: template.glowColor }}>
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Chat messages */}
            <div style={{ flex: 1, padding: "20px 16px", maxWidth: 520, margin: "0 auto", width: "100%" }}>
              {chatScript.map((msg, i) => (
                <ChatBubble
                  key={i}
                  text={msg.text}
                  from={msg.from}
                  color={template.glowColor}
                  delay={chatDelays[i]}
                  onDone={i === chatScript.length - 1 ? () => {
                    fireConfetti(template.glowColor);
                    setTimeout(() => setStage("message"), 1200);
                  } : undefined}
                />
              ))}
              <div ref={chatEndRef} />
            </div>
          </motion.div>
        )}

        {/* ── FULL MESSAGE ── */}
        {stage === "message" && (
          <motion.div key="message"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
            style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
          >
            {/* Top bar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px",
            }}>
              <a href="../" style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.4, textDecoration: "none" }}>
                <Sparkles size={14} color="#fff" />
                <span style={{ color: "#fff", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>WishMian</span>
              </a>
              <div style={{ display: "flex", gap: 14 }}>
                <button onClick={toggleMusic} style={{ background: "none", border: "none", cursor: "pointer", color: musicOn ? template.glowColor : "rgba(255,255,255,0.3)" }}>
                  {musicOn ? <Music size={18} /> : <VolumeX size={18} />}
                </button>
                <button onClick={handleReplay} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)" }}>
                  <RotateCcw size={16} />
                </button>
                <button onClick={handleShare} style={{ background: "none", border: "none", cursor: "pointer", color: template.glowColor, display: "flex", alignItems: "center", gap: 5, fontSize: "0.85rem" }}>
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 24px 40px", textAlign: "center" }}>

              {/* Photo */}
              {data.photo && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                  style={{ marginBottom: 28 }}>
                  <div style={{
                    width: 110, height: 110, borderRadius: "50%", overflow: "hidden",
                    border: `3px solid ${template.glowColor}`,
                    boxShadow: `0 0 30px ${template.glowColor}50, 0 0 60px ${template.glowColor}20`,
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={data.photo} alt={data.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </motion.div>
              )}

              {/* Occasion */}
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: `${template.glowColor}90`, marginBottom: 12 }}>
                {template.label}
              </motion.p>

              {/* Name */}
              <motion.h1
                initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: "clamp(2.8rem,10vw,4.5rem)", fontWeight: 800,
                  letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 24,
                  textShadow: `0 0 40px ${template.glowColor}70, 0 0 80px ${template.glowColor}30`,
                  color: "#fff",
                }}
              >
                {data.name} {template.emoji}
              </motion.h1>

              {/* Message card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                style={{
                  maxWidth: 420, width: "100%",
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${template.glowColor}25`,
                  borderRadius: 24, padding: "24px 28px",
                  boxShadow: `0 0 40px ${template.glowColor}12`,
                  backdropFilter: "blur(20px)",
                  marginBottom: 20,
                }}
              >
                <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "rgba(255,255,255,0.85)", fontWeight: 300 }}>
                  {data.message}
                </p>
              </motion.div>

              {/* From */}
              {data.from && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
                  style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.9rem", marginBottom: 32 }}>
                  — {data.from}
                </motion.p>
              )}

              {/* Floating emoji */}
              <motion.div
                animate={{ y: [0, -14, 0], rotate: [-4, 4, -4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontSize: 52, marginBottom: 32 }}
              >
                {template.emoji}
              </motion.div>

              {/* Color bar */}
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.2, duration: 0.8 }}
                style={{ display: "flex", gap: 6, marginBottom: 36 }}>
                {template.colorPalette.map((c: string, i: number) => (
                  <div key={i} style={{ width: 40, height: 3, borderRadius: 2, background: c }} />
                ))}
              </motion.div>

              {/* CTA */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }}>
                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.8rem", marginBottom: 12 }}>
                  Send your own magical wish
                </p>
                <a href="../" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "12px 24px", borderRadius: 50, textDecoration: "none",
                  background: `${template.glowColor}18`,
                  border: `1px solid ${template.glowColor}35`,
                  color: template.glowColor, fontSize: "0.85rem", fontWeight: 600,
                }}>
                  <Sparkles size={14} /> Create with WishMian
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}

/* ── Typing intro ─────────────────────────────────────────────────────────── */
function TypingIntro({ name, color }: { name: string; color: string }) {
  const line1 = useTyping("Hey 👋 Someone special", 45, 400);
  const line2 = useTyping(`has a message for you, ${name}…`, 45, 400 + line1.displayed.length * 45 + 600);
  return (
    <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
      <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", marginBottom: 8, minHeight: "1.6em" }}>
        {line1.displayed}
        {!line1.done && <span style={{ color, opacity: 0.7 }}>|</span>}
      </p>
      {line1.done && (
        <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", minHeight: "1.6em" }}>
          {line2.displayed}
          {!line2.done && <span style={{ color, opacity: 0.7 }}>|</span>}
        </p>
      )}
    </div>
  );
}

/* ── Floating particles ───────────────────────────────────────────────────── */
function FloatingParticles({ colors }: { colors: string[] }) {
  const items = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: 4 + Math.random() * 8,
    duration: 8 + Math.random() * 12,
    delay: Math.random() * 8,
    color: colors[i % colors.length],
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {items.map((p) => (
        <motion.div key={p.id}
          style={{
            position: "absolute", left: `${p.x}%`, bottom: -20,
            width: p.size, height: p.size, borderRadius: "50%",
            background: p.color, opacity: 0.4,
          }}
          animate={{ y: [0, -(window?.innerHeight ?? 800) - 40], opacity: [0, 0.5, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
}

/* ── Loading / Invalid ────────────────────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#060010", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}
        style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
        Opening...
      </motion.div>
    </div>
  );
}

function InvalidPage() {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#060010", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center", padding: 24 }}>
      <span style={{ fontSize: 48 }}>💔</span>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1rem" }}>This wish link is invalid or expired.</p>
      <a href="../" style={{ color: "#a78bfa", fontSize: "0.9rem", textDecoration: "underline" }}>Create your own wish →</a>
    </div>
  );
}
