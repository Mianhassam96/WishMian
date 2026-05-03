"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { decodeWish, getTemplate } from "@/lib/wish";
import type { WishData, Template } from "@/lib/wish";
import { Share2, RotateCcw, Sparkles, Music, VolumeX, Check, Heart } from "lucide-react";
import ExplosionCanvas from "./ExplosionCanvas";
import confetti from "canvas-confetti";

type Stage = "loading" | "tap" | "black" | "exploding" | "chat" | "message" | "share";

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
  const time = now.getHours() + ":" + String(now.getMinutes()).padStart(2, "0");
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
            background: isRight ? ("linear-gradient(135deg," + color + "ee," + color + "aa)") : "rgba(255,255,255,0.08)",
            border: !isRight ? "1px solid rgba(255,255,255,0.1)" : "none",
            boxShadow: isRight ? ("0 4px 20px " + color + "35") : "none",
            fontSize: "0.95rem", lineHeight: 1.55, color: "#fff", backdropFilter: "blur(12px)",
          }}>
            {displayed}{!done && <span style={{ opacity: 0.35 }}>|</span>}
          </div>
          <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.18)", marginTop: 3, paddingLeft: 4, paddingRight: 4 }}>{time}</span>
        </>
      )}
    </motion.div>
  );
}

function fireConfetti(color: string) {
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: [color, "#fff", "#ffd700"] });
  setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { y: 0.5 }, colors: [color, "#fff"] }), 300);
}

export default function WishViewer() {
  const [stage, setStage] = useState<Stage>("loading");
  const [data, setData] = useState<WishData | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [musicOn, setMusicOn] = useState(true);
  const [chatDone, setChatDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundRef = useRef<ReturnType<typeof createSound>>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    soundRef.current = createSound();
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("data");
    if (!encoded) { setStage("tap"); return; }
    const decoded = decodeWish(encoded);
    if (!decoded) { setStage("tap"); return; }
    setData(decoded);
    setTemplate(getTemplate(decoded.occasion, decoded.mood));
    setStage("tap");
  }, []);

  useEffect(() => {
    if (!template) return;
    const audio = new Audio(template.musicFile);
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ""; };
  }, [template]);

  const startMusic = () => {
    const audio = audioRef.current;
    if (!audio || !musicOn) return;
    audio.play().catch(() => {});
    let vol = 0;
    const fade = setInterval(() => {
      vol = Math.min(vol + 0.02, 0.45);
      audio.volume = vol;
      if (vol >= 0.45) clearInterval(fade);
    }, 80);
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicOn) { audio.pause(); setMusicOn(false); }
    else { audio.play().catch(() => {}); setMusicOn(true); }
  };

  const handleTap = () => {
    if (stage !== "tap") return;
    soundRef.current?.tap();
    setStage("black");
    setTimeout(() => {
      setStage("exploding");
      soundRef.current?.boom();
      startMusic();
      setTimeout(() => setStage("chat"), 2200);
    }, 600);
  };

  const handleReplay = () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setChatDone(false);
    setStage("tap");
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: "A wish for you", url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if (stage === "chat" && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [stage, chatDone]);

  if (!data || !template) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#060010", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {stage === "loading" ? (
          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Opening...</span>
          </motion.div>
        ) : (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💔</div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>No wish found. Ask them to resend the link.</p>
          </div>
        )}
      </div>
    );
  }

  const glowColor = template.glowColor;
  const chatMessages = [
    { text: "Hey " + data.name + "! 👋", from: "them" as const, delay: 200 },
    { text: "Someone sent you something special...", from: "them" as const, delay: 1800 },
    { text: "What is it? 👀", from: "you" as const, delay: 3800 },
    { text: template.label + "! " + template.emoji, from: "them" as const, delay: 5000 },
    { text: "Open it below ↓", from: "them" as const, delay: 6800 },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#060010", position: "relative", overflow: "hidden" }}>
      <AnimatePresence mode="wait">

        {stage === "tap" && (
          <motion.div key="tap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleTap}
            style={{ position: "fixed", inset: 0, background: "#060010", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", userSelect: "none" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center," + glowColor + "18 0%,transparent 65%)", pointerEvents: "none" }} />
            <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 40 }}>
              For {data.name}
            </motion.div>
            <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: 90, height: 90, borderRadius: "50%", border: "2px solid " + glowColor + "55", boxShadow: "0 0 40px " + glowColor + "30,0 0 80px " + glowColor + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "0.6rem", letterSpacing: "0.25em", textTransform: "uppercase", color: glowColor + "cc" }}>TAP</span>
            </motion.div>
            <motion.p animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 3, repeat: Infinity }}
              style={{ marginTop: 32, fontSize: "0.75rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
              tap anywhere to open
            </motion.p>
          </motion.div>
        )}

        {stage === "black" && (
          <motion.div key="black" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "#000" }} />
        )}

        {stage === "exploding" && (
          <motion.div key="exploding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "#060010", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center," + glowColor + "35 0%,transparent 60%)" }} />
            <ExplosionCanvas colors={template.particleColors} style={template.animationStyle} />
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 1] }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ fontSize: 80, position: "relative", zIndex: 2 }}>
              {template.emoji}
            </motion.div>
          </motion.div>
        )}

        {stage === "chat" && (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "#060010", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg," + glowColor + "," + glowColor + "88)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {template.emoji}
              </div>
              <div>
                <div style={{ color: "#fff", fontSize: "0.9rem", fontWeight: 600 }}>WishMian</div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem" }}>delivering your surprise...</div>
              </div>
            </div>
            <div ref={chatScrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              {chatMessages.map((msg, i) => (
                <ChatBubble key={i} text={msg.text} from={msg.from} color={glowColor} delay={msg.delay}
                  onDone={i === chatMessages.length - 1 ? () => setChatDone(true) : undefined} />
              ))}
            </div>
            <AnimatePresence>
              {chatDone && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "16px 20px 32px" }}>
                  <motion.button onClick={() => setStage("message")} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{ width: "100%", height: 58, borderRadius: 18, border: "none", cursor: "pointer", background: "linear-gradient(135deg," + glowColor + "," + glowColor + "bb)", boxShadow: "0 0 40px " + glowColor + "55", color: "#fff", fontSize: "1rem", fontWeight: 700 }}>
                    Open Your Wish {template.emoji}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {stage === "message" && (
          <motion.div key="message" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}
            style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
              <a href="/" style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.35, textDecoration: "none" }}>
                <Sparkles size={13} color="#fff" />
                <span style={{ color: "#fff", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase" }}>WishMian</span>
              </a>
              <div style={{ display: "flex", gap: 14 }}>
                <button onClick={toggleMusic} style={{ background: "none", border: "none", cursor: "pointer", color: musicOn ? glowColor : "rgba(255,255,255,0.3)" }}>
                  {musicOn ? <Music size={17} /> : <VolumeX size={17} />}
                </button>
                <button onClick={handleReplay} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)" }}>
                  <RotateCcw size={15} />
                </button>
                <button onClick={handleShare} style={{ background: "none", border: "none", cursor: "pointer", color: glowColor, display: "flex", alignItems: "center", gap: 5, fontSize: "0.82rem" }}>
                  <Share2 size={15} /> Share
                </button>
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 24px 32px", textAlign: "center" }}>
              {data.photo && (
                <motion.div initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: "spring", bounce: 0.4 }} style={{ marginBottom: 24 }}>
                  <div style={{ width: 108, height: 108, borderRadius: "50%", overflow: "hidden", border: "3px solid " + glowColor, boxShadow: "0 0 30px " + glowColor + "50,0 0 60px " + glowColor + "20" }}>
                    <img src={data.photo} alt={data.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </motion.div>
              )}
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{ fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase", color: glowColor + "85", marginBottom: 10 }}>
                {template.label}
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 28, filter: "blur(14px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.5, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ fontSize: "clamp(2.6rem,9vw,4.2rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 22, textShadow: "0 0 40px " + glowColor + "65,0 0 80px " + glowColor + "28", color: "#fff" }}>
                {data.name} {template.emoji}
              </motion.h1>
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.9 }}
                style={{ maxWidth: 400, width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid " + glowColor + "22", borderRadius: 22, padding: "22px 26px", boxShadow: "0 0 40px " + glowColor + "10", backdropFilter: "blur(20px)", marginBottom: 18 }}>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.75, color: "rgba(255,255,255,0.88)", fontWeight: 300 }}>{data.message}</p>
              </motion.div>
              {data.from && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
                  style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.88rem", marginBottom: 28 }}>
                  &mdash; {data.from}
                </motion.p>
              )}
              <motion.div animate={{ y: [0, -13, 0], rotate: [-3, 3, -3] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontSize: 50, marginBottom: 28 }}>
                {template.emoji}
              </motion.div>
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.2, duration: 0.9 }}
                style={{ display: "flex", gap: 5, marginBottom: 32 }}>
                {template.colorPalette.map((c: string, i: number) => (
                  <div key={i} style={{ width: 36, height: 3, borderRadius: 2, background: c }} />
                ))}
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 }}>
                <button onClick={() => { fireConfetti(glowColor); setStage("share"); }}
                  style={{ padding: "14px 32px", borderRadius: 50, border: "none", cursor: "pointer", background: "linear-gradient(135deg," + glowColor + "," + glowColor + "bb)", color: "#fff", fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.03em", boxShadow: "0 0 30px " + glowColor + "50,0 8px 24px " + glowColor + "30", display: "flex", alignItems: "center", gap: 8 }}>
                  <Heart size={16} fill="white" /> Did this make you smile?
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {stage === "share" && (
          <motion.div key="share" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
            style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center," + glowColor + "15 0%,transparent 60%)", pointerEvents: "none" }} />
            <div className="float-anim" style={{ fontSize: 72, marginBottom: 24 }}>🥹</div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ fontSize: "clamp(1.8rem,5vw,2.8rem)", fontWeight: 800, color: "#fff", marginBottom: 10 }}>
              So glad it made you smile!
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.95rem", marginBottom: 36 }}>
              Share this moment or create your own wish.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 360 }}>
              <button onClick={handleShare}
                style={{ height: 56, borderRadius: 18, border: "none", cursor: "pointer", background: "linear-gradient(135deg," + glowColor + "," + glowColor + "bb)", boxShadow: "0 0 40px " + glowColor + "50", color: "#fff", fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {copied ? <><Check size={18} /> Copied!</> : <><Share2 size={18} /> Share this wish</>}
              </button>
              <a href="/"
                style={{ height: 56, borderRadius: 18, border: "1.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.7)", fontSize: "0.95rem", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Sparkles size={16} /> Create your own wish
              </a>
              <button onClick={handleReplay}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.25)", fontSize: "0.85rem", padding: "8px" }}>
                Replay
              </button>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}