"use client";

import { motion } from "framer-motion";
import { useCreatorStore } from "@/store/creator";
import { EventType } from "@/types";
import { cn } from "@/lib/utils";

const events: { type: EventType; emoji: string; label: string; desc: string }[] =
  [
    {
      type: "birthday",
      emoji: "🎂",
      label: "Birthday",
      desc: "Joy explosion theme",
    },
    {
      type: "wedding",
      emoji: "💍",
      label: "Wedding",
      desc: "Elegant cinematic love",
    },
    {
      type: "eid",
      emoji: "🌙",
      label: "Eid al-Fitr",
      desc: "Spiritual glow & particles",
    },
    {
      type: "success",
      emoji: "🏆",
      label: "Success",
      desc: "Achievement spotlight",
    },
    {
      type: "farewell",
      emoji: "💔",
      label: "Farewell",
      desc: "Emotional slow cinematic",
    },
  ];

export default function Step1EventType() {
  const { eventType, setEventType, nextStep } = useCreatorStore();

  const handleSelect = (type: EventType) => {
    setEventType(type);
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
          What are we celebrating?
        </h2>
        <p className="text-white/40">Choose the event type to begin</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event, i) => (
          <motion.button
            key={event.type}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => handleSelect(event.type)}
            className={cn(
              "glass rounded-2xl p-6 text-left transition-all duration-300 border",
              eventType === event.type
                ? "border-violet-500 shadow-[0_0_30px_rgba(139,92,246,0.2)] bg-violet-500/10"
                : "border-white/5 hover:border-violet-500/30 hover:bg-white/5"
            )}
          >
            <span className="text-4xl mb-3 block">{event.emoji}</span>
            <h3 className="text-white font-semibold text-lg mb-1">
              {event.label}
            </h3>
            <p className="text-white/40 text-sm">{event.desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
