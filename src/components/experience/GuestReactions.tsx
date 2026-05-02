"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { GuestReaction } from "@/types";

const EMOJI_REACTIONS = ["❤️", "🔥", "✨", "😭", "🎉", "💫"];

interface GuestReactionsProps {
  reactions: GuestReaction[];
  onAddReaction: (reaction: Omit<GuestReaction, "id" | "createdAt">) => void;
}

export default function GuestReactions({
  reactions,
  onAddReaction,
}: GuestReactionsProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("❤️");

  const handleSubmit = () => {
    if (!message.trim()) return;
    onAddReaction({ name: name || "Anonymous", message, emoji: selectedEmoji });
    setName("");
    setMessage("");
    setShowForm(false);
  };

  return (
    <div className="py-12 px-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" />
            Reactions ({reactions.length})
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Leave a message
          </button>
        </div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <GlassCard className="p-4 space-y-3">
                {/* Emoji picker */}
                <div className="flex gap-2">
                  {EMOJI_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`text-xl p-1.5 rounded-lg transition-all ${
                        selectedEmoji === emoji
                          ? "bg-violet-500/20 scale-110"
                          : "hover:bg-white/5"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full glass rounded-xl px-3 py-2 text-white text-sm placeholder-white/20 border border-white/5 focus:border-violet-500/50 focus:outline-none"
                />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your wish..."
                  rows={3}
                  className="w-full glass rounded-xl px-3 py-2 text-white text-sm placeholder-white/20 border border-white/5 focus:border-violet-500/50 focus:outline-none resize-none"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!message.trim()}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reactions list */}
        <div className="space-y-3">
          <AnimatePresence>
            {reactions.map((reaction) => (
              <motion.div
                key={reaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <GlassCard className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{reaction.emoji || "❤️"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/80 text-sm font-medium">
                          {reaction.name}
                        </span>
                        <span className="text-white/20 text-xs">
                          {new Date(reaction.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-white/50 text-sm">{reaction.message}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>

          {reactions.length === 0 && !showForm && (
            <p className="text-center text-white/20 text-sm py-6">
              Be the first to leave a wish ✨
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
