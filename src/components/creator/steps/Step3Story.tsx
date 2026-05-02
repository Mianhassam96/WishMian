"use client";

import { motion } from "framer-motion";
import { useCreatorStore } from "@/store/creator";
import Button from "@/components/ui/Button";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function Step3Story() {
  const {
    message,
    recipientName,
    senderName,
    setMessage,
    setRecipientName,
    setSenderName,
    nextStep,
    prevStep,
  } = useCreatorStore();

  const canProceed = message.trim().length > 0 && recipientName.trim().length > 0;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          Tell the story.
        </h2>
        <p className="text-white/40">
          Write from the heart. Short lines hit harder.
        </p>
      </motion.div>

      <div className="max-w-xl mx-auto space-y-5">
        {/* Recipient */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-white/60 text-sm mb-2">
            Who is this for?
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Their name..."
            className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/20 border border-white/5 focus:border-violet-500/50 focus:outline-none transition-colors"
          />
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <label className="block text-white/60 text-sm mb-2">
            Your message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write something that will make them feel it..."
            rows={5}
            className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/20 border border-white/5 focus:border-violet-500/50 focus:outline-none transition-colors resize-none"
          />
          <p className="text-white/20 text-xs mt-1 text-right">
            {message.length} characters
          </p>
        </motion.div>

        {/* Sender */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-white/60 text-sm mb-2">
            From (optional)
          </label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Your name..."
            className="w-full glass rounded-xl px-4 py-3 text-white placeholder-white/20 border border-white/5 focus:border-violet-500/50 focus:outline-none transition-colors"
          />
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between pt-4"
        >
          <Button variant="ghost" onClick={prevStep}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            variant="primary"
            onClick={nextStep}
            disabled={!canProceed}
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
