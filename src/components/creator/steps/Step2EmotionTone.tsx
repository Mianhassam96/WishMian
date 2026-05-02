"use client";

import { motion } from "framer-motion";
import { useCreatorStore } from "@/store/creator";
import { EmotionTone } from "@/types";
import { cn } from "@/lib/utils";

const tones: {
  tone: EmotionTone;
  label: string;
  desc: string;
  color: string;
  bg: string;
}[] = [
  {
    tone: "joy",
    label: "Joy",
    desc: "Bright + fast motion",
    color: "text-yellow-400",
    bg: "rgba(250,204,21,0.1)",
  },
  {
    tone: "love",
    label: "Love",
    desc: "Soft glow + slow zoom",
    color: "text-pink-400",
    bg: "rgba(236,72,153,0.1)",
  },
  {
    tone: "spiritual",
    label: "Spiritual",
    desc: "Warm amber + peaceful",
    color: "text-emerald-400",
    bg: "rgba(52,211,153,0.1)",
  },
  {
    tone: "achievement",
    label: "Achievement",
    desc: "Spotlight + rising particles",
    color: "text-amber-400",
    bg: "rgba(245,158,11,0.1)",
  },
  {
    tone: "nostalgia",
    label: "Nostalgia",
    desc: "Low saturation + slow fade",
    color: "text-blue-300",
    bg: "rgba(147,197,253,0.1)",
  },
];

export default function Step2EmotionTone() {
  const { emotionTone, setEmotionTone, nextStep } = useCreatorStore();

  const handleSelect = (tone: EmotionTone) => {
    setEmotionTone(tone);
    setTimeout(() => nextStep(), 300);
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          What emotion should it carry?
        </h2>
        <p className="text-white/40">
          This controls the entire visual and audio experience
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tones.map((item, i) => (
          <motion.button
            key={item.tone}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => handleSelect(item.tone)}
            className={cn(
              "glass rounded-2xl p-6 text-left transition-all duration-300 border",
              emotionTone === item.tone
                ? "border-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.2)]"
                : "border-white/5 hover:border-violet-500/30 hover:bg-white/5"
            )}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: item.bg }}
            >
              <div
                className={`w-3 h-3 rounded-full ${item.color}`}
                style={{ background: "currentColor" }}
              />
            </div>
            <h3 className={`font-semibold text-lg mb-1 ${item.color}`}>
              {item.label}
            </h3>
            <p className="text-white/40 text-sm">{item.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
