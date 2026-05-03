"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { decodeWish, getTemplate, WishData, Template } from "@/lib/wish";
import { Share2, RotateCcw, Sparkles, Music, VolumeX, Copy, Check, Heart } from "lucide-react";
import ExplosionCanvas from "./ExplosionCanvas";
import confetti from "canvas-confetti";

type Stage = "loading" | "tap" | "black" | "exploding" | "chat" | "message" | "share";

// â”€â”€ Sound engine (Web Audio API â€” zero files needed) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function createSound() {
  if (typeof window === "undefined") return null;
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return {
      tap: () => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.setValueAtTime(880, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
        g.gain.setValueAtTime(0.25, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        o.start(); o.stop(ctx.currentTime + 0.15);
      },
      pop: () => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sine";
        o.frequency.setValueAtTime(600, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.06);
        g.gain.setValueAtTime(0.12, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        o.start(); o.stop(ctx.currentTime + 0.1);
      },
      boom: () => {
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
        const src = ctx.createBufferSource(); const g = ctx.createGain();
        src.buffer = buf; src.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0.55, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        src.start();
      },
    };
  } catch { return null; }
}

// â”€â”€ Typing hook with variable speed + punctuation pauses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function useTyping(text: string, baseSpeed = 38, startDelay = 0) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    let i = 0;
    const t = setTimeout(() => {
      const tick = () => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { setDone(true); return; }
        const ch = text[i - 1];
        const delay = ch === "." || ch === "!" || ch === "?" ? baseSpeed * 7
          : ch === "," ? baseSpeed * 3
          : baseSpeed + (Math.random() - 0.5) * 10;
        setTimeout(tick, delay);
      };
      tick();
    }, startDelay);
    return () => clearTimeout(t);
  }, [text, baseSpeed, startDelay]);
  return { displayed, done };
}

// â”€â”€ Animated typing dots â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TypingDots({ color }: { color: string }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "10px 14px" }}>
      {[0, 1, 2].map((i) => (
        <motion.div key={i}
          style={{ width: 7, height: 7, borderRadius: "50%", background: color, opacity: 0.6 }}
          animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 0.75, repeat: Infinity, delay: i * 0.17, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// â”€â”€ Chat bubble with typing indicator + timestamp â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ChatBubble({ text, from, color, delay, onVisible, onDone }: {
  text: string; from: "them" | "you"; color: string; delay: number;
  onVisible?: () => void; onDone?: () => void;
}) {
  const [phase, setPhase] = useState<"hidden" | "typing" | "shown">("hidden");
  const { displayed, done } = useTyping(text, 36, phase === "typing" ? 0 : 9999999);
  const soundRef = useRef<ReturnType<typeof createSound>>(null);

  useEffect(() => { soundRef.current = createSound(); }, []);

  useEffect(() => {
    const typingDuration = from === "them" ? Math.min(text.length * 26 + 350, 2000) : 280;
    const t1 = setTimeout(() => { setPhase("typing"); if (onVisible) onVisible(); }, delay);
    const t2 = setTimeout(() => { setPhase("shown"); soundRef.current?.pop(); }, delay + typingDuration);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [delay, from, text.length, onVisible]);

  useEffect(() => { if (done && onDone) onDone(); }, [done, onDone]);

  const isRight = from === "you";
  const now = new Date();
  const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

  if (phase === "hidden") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.93 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", flexDirection: "column", alignItems: isRight ? "flex-end" : "flex-start", marginBottom: 6 }}
    >
      {phase === "typing" && from === "them" && (
        <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: "18px 18px 18px 4px", border: "1px solid rgba(255,255,255,0.1)", display: "inline-block" }}>
          <TypingDots color={color} />
        </div>
      )}
      {phase === "shown" && (
        <>
          <div style={{
            maxWidth: "78%", padding: "11px 15px",
            borderRadius: isRight ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            background: isRight ? `linear-gradient(135deg, ${color}ee, ${color}aa)` : "rgba(255,255,255,0.08)",
            border: !isRight ? "1px solid rgba(255,255,255,0.1)" : "none",
            boxShadow: isRight ? `0 4px 20px ${color}35` : "none",
            fontSize: "0.95rem", lineHeight: 1.55, color: "#fff",
            backdropFilter: "blur(12px)",
          }}>
            {displayed}
            {!done && <span style={{ opacity: 0.35 }}>|</span>}
          </div>
          <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.18)", marginTop: 3, paddingLeft: 4, paddingRight: 4 }}>{time}</span>
        </>
      )}
    </motion.div>
  );
}
        {stage === "message" && (
          <motion.div key="message" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
              <a href="../" style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.35, textDecoration: "none" }}><Sparkles size={13} color="#fff" /><span style={{ color: "#fff", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase" }}>WishMian</span></a>
              <div style={{ display: "flex", gap: 14 }}>
                <button onClick={toggleMusic} style={{ background: "none", border: "none", cursor: "pointer", color: musicOn ? template.glowColor : "rgba(255,255,255,0.3)" }}>{musicOn ? <Music size={17} /> : <VolumeX size={17} />}</button>
                <button onClick={handleReplay} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)" }}><RotateCcw size={15} /></button>
                <button onClick={handleShare} style={{ background: "none", border: "none", cursor: "pointer", color: template.glowColor, display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem" }}><Share2 size={15} /> Share</button>
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 24px 32px", textAlign: "center" }}>
              {data.photo && (
                <motion.div initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: "spring", bounce: 0.4 }} style={{ marginBottom: 24 }}>
                  <div style={{ width: 108, height: 108, borderRadius: "50%", overflow: "hidden", border: 3px solid , boxShadow:   0 30px 50, 0 0 60px 20 }}>
                    <img src={data.photo} alt={data.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </motion.div>
              )}
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase", color: `${template.glowColor}85`, marginBottom: 10 }}>{template.label}</motion.p>
              <motion.h1 initial={{ opacity: 0, y: 28, filter: "blur(14px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.5, duration: 1.1, ease: [0.16, 1, 0.3, 1] }} style={{ fontSize: "clamp(2.6rem,9vw,4.2rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 22, textShadow:   0 40px 65, 0 0 80px 28, color: "#fff" }}>{data.name} {template.emoji}</motion.h1>
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.9 }} style={{ maxWidth: 400, width: "100%", background: "rgba(255,255,255,0.04)", border: 1px solid 22, borderRadius: 22, padding: "22px 26px", boxShadow:   0 40px 10, backdropFilter: "blur(20px)", marginBottom: 18 }}>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.75, color: "rgba(255,255,255,0.88)", fontWeight: 300 }}>{data.message}</p>
              </motion.div>
              {data.from && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.88rem", marginBottom: 28 }}>â€” {data.from}</motion.p>}
              <motion.div animate={{ y: [0, -13, 0], rotate: [-3, 3, -3] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} style={{ fontSize: 50, marginBottom: 28 }}>{template.emoji}</motion.div>
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.2, duration: 0.9 }} style={{ display: "flex", gap: 5, marginBottom: 32 }}>
                {template.colorPalette.map((c: string, i: number) => (<div key={i} style={{ width: 36, height: 3, borderRadius: 2, background: c }} />))}
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 }}>
                <button onClick={() => { fireConfetti(template.glowColor); setStage("share"); }} style={{ padding: "14px 32px", borderRadius: 50, border: "none", cursor: "pointer", background: linear-gradient(135deg, , ), color: "#fff", fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.03em", boxShadow:   0 30px 50, 0 8px 24px 30, display: "flex", alignItems: "center", gap: 8 }}>
                  <Heart size={16} fill="white" /> Did this make you smile?
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

