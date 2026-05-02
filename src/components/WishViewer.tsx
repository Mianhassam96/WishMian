"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { decodeWish, getTemplate, WishData, Template } from "@/lib/wish";
import { Share2, RotateCcw, Sparkles } from "lucide-react";
import ExplosionCanvas from "./ExplosionCanvas";

type Stage = "loading" | "tap" | "exploding" | "reveal" | "message" | "end";

export default function WishViewer() {
  const [data, setData] = useState<WishData | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [stage, setStage] = useState<Stage>("loading");
  const [invalid, setInvalid] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shakeControls = useAnimation();

  // Decode URL on mount
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

  const playMusic = useCallback((src: string) => {
    try {
      if (audioRef.current) { audioRef.current.pause(); }
      const audio = new Audio(src);
      audio.volume = 0.6;
      audio.loop = true;
      audio.play().catch(() => {});
      audioRef.current = audio;
    } catch {}
  }, []);

  const handleTap = useCallback(async () => {
    if (stage !== "tap" || !template) return;

    // Stage: exploding
    setStage("exploding");

    // Screen shake
    await shakeControls.start({
      x: [0, -8, 8, -6, 6, -3, 3, 0],
      transition: { duration: 0.5, ease: "easeOut" },
    });

    // Play music
    playMusic(template.musicFile);

    // After explosion (1.2s) → reveal
    setTimeout(() => {
      setStage("reveal");
      setTimeout(() => setStage("message"), 1800);
    }, 1200);
  }, [stage, template, shakeControls, playMusic]);

  const handleReplay = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setStage("tap");
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: `A special wish for ${data?.name}`, url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  if (invalid) return <InvalidPage />;
  if (!data || !template) return <LoadingScreen />;

  return (
    <motion.div
      animate={shakeControls}
      className="relative min-h-screen overflow-hidden"
      style={{ background: "#05050a" }}
    >
      {/* Dynamic background gradient */}
      <div
        className={`fixed inset-0 bg-gradient-to-br ${template.bgGradient} opacity-80 pointer-events-none`}
      />

      {/* Glow orbs */}
      <div
        className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20 pointer-events-none"
        style={{ background: template.glowColor }}
      />
      <div
        className="fixed bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-[100px] opacity-[0.15] pointer-events-none"
        style={{ background: template.colors[1] }}
      />

      <AnimatePresence mode="wait">

        {/* ── STAGE: TAP ─────────────────────────────────────────────── */}
        {stage === "tap" && (
          <motion.div
            key="tap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="viewer-screen cursor-pointer select-none"
            onClick={handleTap}
          >
            {/* Subtle radial glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at center, ${template.glowColor}15 0%, transparent 70%)`,
              }}
            />

            <div className="relative text-center">
              {/* Pulsing ring */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-28 h-28 rounded-full border mx-auto mb-8 flex items-center justify-center"
                style={{ borderColor: `${template.glowColor}40` }}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                  className="w-20 h-20 rounded-full border flex items-center justify-center"
                  style={{ borderColor: `${template.glowColor}70` }}
                >
                  <span className="text-3xl">{template.emoji}</span>
                </motion.div>
              </motion.div>

              {/* For name */}
              <motion.p
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="label mb-3"
                style={{ color: `${template.glowColor}99` }}
              >
                For {data.name}
              </motion.p>

              {/* Tap hint */}
              <motion.p
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="text-white/30 text-sm label"
              >
                Tap to open
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* ── STAGE: EXPLODING ───────────────────────────────────────── */}
        {stage === "exploding" && (
          <motion.div
            key="exploding"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="viewer-screen"
          >
            <ExplosionCanvas
              colors={template.particleColors}
              style={template.animationStyle}
            />
            {/* Flash */}
            <motion.div
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-white pointer-events-none"
            />
          </motion.div>
        )}

        {/* ── STAGE: REVEAL ──────────────────────────────────────────── */}
        {stage === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 1.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="viewer-screen"
          >
            <motion.div
              animate={{ scale: [0.8, 1.2, 1], opacity: [0, 1, 1] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-8xl"
            >
              {template.emoji}
            </motion.div>
          </motion.div>
        )}

        {/* ── STAGE: MESSAGE ─────────────────────────────────────────── */}
        {stage === "message" && (
          <motion.div
            key="message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative z-10 min-h-screen flex flex-col"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-5">
              <a href="../" className="flex items-center gap-1.5 opacity-40 hover:opacity-70 transition-opacity">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span className="text-white text-xs label">WishMian</span>
              </a>
              <div className="flex items-center gap-4">
                <button onClick={handleReplay} className="text-white/30 hover:text-white/60 transition-colors" title="Replay">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={handleShare} className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: template.glowColor }}>
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">

              {/* Photo (if provided) */}
              {data.photo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
                  className="mb-8"
                >
                  <div
                    className="w-28 h-28 rounded-full overflow-hidden border-2"
                    style={{ borderColor: `${template.glowColor}60`, boxShadow: `0 0 30px ${template.glowColor}40` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={data.photo} alt={data.name} className="w-full h-full object-cover" />
                  </div>
                </motion.div>
              )}

              {/* Occasion label */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="label mb-3"
                style={{ color: `${template.glowColor}80` }}
              >
                {template.label}
              </motion.p>

              {/* Name — floating glass letters effect */}
              <motion.h1
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-6xl font-bold text-white text-center mb-8 leading-tight"
                style={{ textShadow: `0 0 40px ${template.glowColor}60, 0 0 80px ${template.glowColor}30` }}
              >
                {data.name}
              </motion.h1>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="glass rounded-3xl p-6 max-w-md w-full mb-6"
                style={{ borderColor: `${template.glowColor}20`, boxShadow: `0 0 40px ${template.glowColor}10` }}
              >
                <p className="text-white/80 text-lg leading-relaxed text-center font-light">
                  {data.message}
                </p>
              </motion.div>

              {/* From */}
              {data.from && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                  className="text-white/30 text-sm"
                >
                  — {data.from}
                </motion.p>
              )}

              {/* Floating emoji */}
              <motion.div
                animate={{ y: [0, -12, 0], rotate: [-3, 3, -3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-5xl mt-8"
              >
                {template.emoji}
              </motion.div>
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
              className="px-6 pb-10 text-center border-t border-white/5 pt-6"
            >
              <p className="text-white/20 text-sm mb-3">
                Send your own magical wish
              </p>
              <a
                href="../"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all"
                style={{
                  background: `${template.glowColor}15`,
                  color: template.glowColor,
                  border: `1px solid ${template.glowColor}30`,
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Create with WishMian
              </a>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}

function LoadingScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#05050a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-white/30 label"
      >
        Opening...
      </motion.div>
    </div>
  );
}

function InvalidPage() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#05050a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        textAlign: "center",
        padding: "1.5rem",
      }}
    >
      <span className="text-4xl">💔</span>
      <p className="text-white/60 text-lg">This wish link is invalid or expired.</p>
      <a
        href="/"
        className="text-violet-400 hover:text-violet-300 text-sm underline underline-offset-4 transition-colors"
      >
        Create your own wish →
      </a>
    </div>
  );
}
