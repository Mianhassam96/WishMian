"use client";

import { motion } from "framer-motion";
import { useCreatorStore } from "@/store/creator";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import { ArrowLeft, Zap, Sparkles, Film, Copy, Check } from "lucide-react";
import { RevealMode } from "@/types";
import { useState } from "react";
import { EVENT_LABELS, EMOTION_LABELS } from "@/lib/templates";

const revealModes: {
  mode: RevealMode;
  icon: React.ElementType;
  label: string;
  desc: string;
}[] = [
  {
    mode: "shock",
    icon: Zap,
    label: "Shock Reveal",
    desc: "Dark screen → tap → explosion",
  },
  {
    mode: "gentle",
    icon: Sparkles,
    label: "Gentle Open",
    desc: "Soft fade-in with music",
  },
  {
    mode: "cinematic",
    icon: Film,
    label: "Cinematic",
    desc: "Full movie-style opening",
  },
];

export default function Step5Publish() {
  const {
    eventType,
    emotionTone,
    recipientName,
    senderName,
    message,
    revealMode,
    setRevealMode,
    prevStep,
  } = useCreatorStore();

  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handlePublish = async () => {
    setPublishing(true);
    // Simulate publish
    await new Promise((r) => setTimeout(r, 1800));
    const slug = `${recipientName.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString(36)}`;
    setLink(`${window.location.origin}/w/${slug}`);
    setPublished(true);
    setPublishing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (published) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md mx-auto"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="text-6xl mb-6"
        >
          🎉
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Your moment is live.
        </h2>
        <p className="text-white/40 mb-8">
          Share this link and let the magic happen.
        </p>

        <GlassCard className="p-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-white/60 text-sm flex-1 truncate">{link}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-sm transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </GlassCard>

        <Button variant="primary" size="lg" className="w-full" onClick={() => window.open(link, "_blank")}>
          Preview Experience
        </Button>
      </motion.div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          Almost there.
        </h2>
        <p className="text-white/40">Choose how they experience it.</p>
      </motion.div>

      <div className="max-w-xl mx-auto space-y-6">
        {/* Summary */}
        <GlassCard className="p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-white/30 block mb-0.5">Event</span>
              <span className="text-white">
                {eventType ? EVENT_LABELS[eventType] : "—"}
              </span>
            </div>
            <div>
              <span className="text-white/30 block mb-0.5">Emotion</span>
              <span className="text-white">
                {emotionTone ? EMOTION_LABELS[emotionTone] : "—"}
              </span>
            </div>
            <div>
              <span className="text-white/30 block mb-0.5">For</span>
              <span className="text-white">{recipientName || "—"}</span>
            </div>
            <div>
              <span className="text-white/30 block mb-0.5">From</span>
              <span className="text-white">{senderName || "Anonymous"}</span>
            </div>
          </div>
          {message && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <span className="text-white/30 text-xs block mb-1">Message preview</span>
              <p className="text-white/60 text-sm line-clamp-2">{message}</p>
            </div>
          )}
        </GlassCard>

        {/* Reveal mode */}
        <div>
          <label className="text-white/60 text-sm mb-3 block">
            Reveal Mode
          </label>
          <div className="grid grid-cols-3 gap-3">
            {revealModes.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.mode}
                  onClick={() => setRevealMode(item.mode)}
                  className={`glass rounded-xl p-4 text-center transition-all border ${
                    revealMode === item.mode
                      ? "border-violet-500/50 bg-violet-500/10"
                      : "border-white/5 hover:border-white/10"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mx-auto mb-2 ${
                      revealMode === item.mode
                        ? "text-violet-400"
                        : "text-white/30"
                    }`}
                  />
                  <p
                    className={`text-xs font-medium ${
                      revealMode === item.mode ? "text-white" : "text-white/40"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="text-white/20 text-xs mt-0.5">{item.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" onClick={prevStep}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            variant="gold"
            size="lg"
            onClick={handlePublish}
            loading={publishing}
          >
            {publishing ? "Creating magic..." : "Publish Experience"}
          </Button>
        </div>
      </div>
    </div>
  );
}
