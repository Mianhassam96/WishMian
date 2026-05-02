"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShockReveal from "@/components/experience/ShockReveal";
import GuestReactions from "@/components/experience/GuestReactions";
import ParticleField from "@/components/ui/ParticleField";
import { Share2, RotateCcw, Sparkles } from "lucide-react";
import { GuestReaction } from "@/types";
import Link from "next/link";

// Demo data — in production fetched from DB by slug
const DEMO_PAGE = {
  recipientName: "Sarah",
  senderName: "Your Best Friend",
  message:
    "Every year you make the world a little brighter. Today is your day to shine. Happy Birthday, Sarah — this one's for you. 🎂",
  eventType: "birthday",
  emotionTone: "joy",
  revealMode: "shock",
  templateId: "birthday-joy",
  colorPalette: ["#FF6B6B", "#FFE66D", "#4ECDC4", "#FF8E53"],
};

export default function WishPageClient() {
  const [revealed, setRevealed] = useState(false);
  const [reactions, setReactions] = useState<GuestReaction[]>([
    {
      id: "1",
      name: "Alex",
      message: "Happy birthday! You deserve all the happiness in the world! 🎉",
      emoji: "🎉",
      createdAt: new Date().toISOString(),
    },
  ]);

  const handleAddReaction = (
    reaction: Omit<GuestReaction, "id" | "createdAt">
  ) => {
    setReactions((prev) => [
      ...prev,
      {
        ...reaction,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `A special moment for ${DEMO_PAGE.recipientName}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative">
      <ParticleField colors={DEMO_PAGE.colorPalette} count={50} />

      {/* Shock reveal overlay */}
      <AnimatePresence>
        {!revealed && (
          <ShockReveal
            recipientName={DEMO_PAGE.recipientName}
            onReveal={() => setRevealed(true)}
          />
        )}
      </AnimatePresence>

      {/* Main experience */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative z-10"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4">
              <Link href="/" className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-white/40 text-xs cinematic">WishMian</span>
              </Link>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setRevealed(false)}
                  className="text-white/30 hover:text-white/60 transition-colors"
                  title="Replay"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-sm transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Hero message */}
            <div className="min-h-[80vh] flex items-center justify-center px-6">
              <div className="text-center max-w-2xl mx-auto">
                {/* Event emoji */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="text-7xl mb-8"
                >
                  🎂
                </motion.div>

                {/* Recipient */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="cinematic text-white/40 mb-4"
                >
                  For {DEMO_PAGE.recipientName}
                </motion.p>

                {/* Message */}
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-white text-2xl md:text-3xl font-light leading-relaxed mb-8"
                >
                  {DEMO_PAGE.message}
                </motion.p>

                {/* Sender */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-white/30 text-sm"
                >
                  — {DEMO_PAGE.senderName}
                </motion.p>

                {/* Color palette accent */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="flex gap-1 mt-10 justify-center"
                >
                  {DEMO_PAGE.colorPalette.map((color, i) => (
                    <div
                      key={i}
                      className="h-1 w-12 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Guest reactions */}
            <div className="border-t border-white/5">
              <GuestReactions
                reactions={reactions}
                onAddReaction={handleAddReaction}
              />
            </div>

            {/* Footer CTA */}
            <div className="text-center py-10 border-t border-white/5">
              <p className="text-white/20 text-sm mb-3">
                Create your own cinematic moment
              </p>
              <Link
                href="/"
                className="text-violet-400 hover:text-violet-300 text-sm transition-colors underline underline-offset-4"
              >
                Make one with WishMian →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
