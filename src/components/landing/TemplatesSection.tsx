"use client";

import { motion } from "framer-motion";
import { TEMPLATES, EVENT_LABELS } from "@/lib/templates";
import GlassCard from "@/components/ui/GlassCard";
import { Lock } from "lucide-react";
import Link from "next/link";

export default function TemplatesSection() {
  return (
    <section id="templates" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="cinematic text-violet-400 mb-4">Emotion Engines</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Every template is a feeling.
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            Not static designs. Each one controls animation, color mood, music,
            and reveal logic.
          </p>
        </motion.div>

        {/* Template grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <GlassCard
                hover
                glow="purple"
                className="p-6 group relative overflow-hidden"
              >
                {/* Color preview bar */}
                <div className="flex gap-1 mb-4">
                  {template.colorPalette.map((color, ci) => (
                    <div
                      key={ci}
                      className="h-1.5 flex-1 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                {/* Event badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-white/60">
                    {EVENT_LABELS[template.eventType]}
                  </span>
                  {template.tier !== "free" && (
                    <span className="flex items-center gap-1 text-xs text-amber-400 glass px-2 py-0.5 rounded-full border border-amber-500/20">
                      <Lock className="w-3 h-3" />
                      {template.tier.toUpperCase()}
                    </span>
                  )}
                </div>

                <h3 className="text-white font-bold text-xl mb-2">
                  {template.name}
                </h3>
                <p className="text-white/40 text-sm mb-4">
                  {template.description}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-white/30">
                  <span>🎵 {template.musicPack}</span>
                  <span>✨ {template.animationStyle}</span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link
            href="/create"
            className="text-violet-400 hover:text-violet-300 text-sm transition-colors underline underline-offset-4"
          >
            Explore all templates →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
