"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface ShockRevealProps {
  onReveal: () => void;
  recipientName: string;
}

export default function ShockReveal({ onReveal, recipientName }: ShockRevealProps) {
  const [phase, setPhase] = useState<"waiting" | "tapped" | "exploding">(
    "waiting"
  );

  const handleTap = () => {
    if (phase !== "waiting") return;
    setPhase("tapped");
    setTimeout(() => {
      setPhase("exploding");
      setTimeout(() => {
        onReveal();
      }, 1200);
    }, 800);
  };

  // Particles for explosion
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    angle: (i / 30) * 360,
    distance: 80 + Math.random() * 120,
    color: ["#8b5cf6", "#f5a623", "#ec4899", "#4ade80", "#60a5fa"][i % 5],
    size: 4 + Math.random() * 8,
  }));

  return (
    <div
      className="fixed inset-0 bg-black flex items-center justify-center cursor-pointer z-50"
      onClick={handleTap}
    >
      <AnimatePresence>
        {phase === "waiting" && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center select-none"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white/60 text-sm cinematic mb-4"
            >
              For {recipientName}
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mx-auto"
            >
              <span className="text-white/40 text-xs cinematic">TAP</span>
            </motion.div>
          </motion.div>
        )}

        {phase === "tapped" && (
          <motion.div
            key="tapped"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.4, repeat: 1 }}
              className="text-4xl"
            >
              ✨
            </motion.div>
          </motion.div>
        )}

        {phase === "exploding" && (
          <motion.div key="exploding" className="relative">
            {/* Central burst */}
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 8, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-20 h-20 rounded-full bg-violet-500"
            />

            {/* Particles */}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute top-1/2 left-1/2 rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  marginTop: -p.size / 2,
                  marginLeft: -p.size / 2,
                }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
                  y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
