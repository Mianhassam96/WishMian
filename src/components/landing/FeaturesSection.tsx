"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { Zap, Film, Music, Heart, Share2, Eye } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Shock Reveal System",
    description:
      "Dark screen → tap → explosion + music drop. The viral engine that makes people share.",
    color: "text-yellow-400",
    glow: "rgba(250,204,21,0.15)",
  },
  {
    icon: Film,
    title: "Cinematic Scroll Engine",
    description:
      "Scroll = scene transitions. Sections fade like movie frames with parallax depth layers.",
    color: "text-violet-400",
    glow: "rgba(139,92,246,0.15)",
  },
  {
    icon: Music,
    title: "Emotion Sync System",
    description:
      "Music, motion, and color all sync to your chosen emotion state. Joy, love, achievement.",
    color: "text-pink-400",
    glow: "rgba(236,72,153,0.15)",
  },
  {
    icon: Heart,
    title: "Guest Interaction Layer",
    description:
      "Voice messages, animated reactions, timeline wishes. Viewers become participants.",
    color: "text-red-400",
    glow: "rgba(248,113,113,0.15)",
  },
  {
    icon: Share2,
    title: "Viral Sharing Loop",
    description:
      "Built-in emotional triggers. People share when they feel impact. Replay culture built in.",
    color: "text-emerald-400",
    glow: "rgba(52,211,153,0.15)",
  },
  {
    icon: Eye,
    title: "Live Preview Engine",
    description:
      "Real-time rendering with mobile-first preview, scroll simulation, and music sync preview.",
    color: "text-blue-400",
    glow: "rgba(96,165,250,0.15)",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-32 px-6 relative">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="cinematic text-violet-400 mb-4">Core Experience</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Built to make people feel.
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Every feature is designed around emotional impact, not just
            aesthetics.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <GlassCard className="p-6 h-full" hover glow="purple">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: feature.glow }}
                  >
                    <Icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
