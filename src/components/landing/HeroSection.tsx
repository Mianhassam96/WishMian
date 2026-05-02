"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";

const floatingEmojis = ["🎂", "💍", "🌙", "🏆", "✨", "🎊", "💫", "🎉"];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-transparent to-transparent pointer-events-none" />

      {/* Floating emojis */}
      {floatingEmojis.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl select-none pointer-events-none"
          style={{
            left: `${10 + (i * 11) % 80}%`,
            top: `${15 + (i * 13) % 70}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [-5, 5, -5],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8 border border-violet-500/20"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-violet-300 text-xs cinematic">
            Cinematic Celebration Platform
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6"
        >
          <span className="text-white">Turn moments into</span>
          <br />
          <span className="gradient-text">memories people feel.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Create cinematic celebration experiences with shock reveals, emotional
          animations, and viral sharing. Not just a greeting — a story.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/create">
            <Button size="lg" variant="primary" className="group">
              Start Creating
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <button className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group">
            <div className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center group-hover:border-violet-500/50 transition-colors">
              <Play className="w-4 h-4 ml-0.5" />
            </div>
            <span className="text-sm">Watch demo</span>
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-16 flex items-center justify-center gap-8 text-white/30 text-sm"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-white font-bold text-2xl">10K+</span>
            <span>Moments created</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-white font-bold text-2xl">98%</span>
            <span>Emotional impact</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-white font-bold text-2xl">5x</span>
            <span>More shares</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />
    </section>
  );
}
