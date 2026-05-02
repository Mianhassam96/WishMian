"use client";

import { useCreatorStore } from "@/store/creator";
import StepIndicator from "@/components/creator/StepIndicator";
import Step1EventType from "@/components/creator/steps/Step1EventType";
import Step2EmotionTone from "@/components/creator/steps/Step2EmotionTone";
import Step3Story from "@/components/creator/steps/Step3Story";
import Step4Media from "@/components/creator/steps/Step4Media";
import Step5Publish from "@/components/creator/steps/Step5Publish";
import ParticleField from "@/components/ui/ParticleField";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const stepComponents = [
  Step1EventType,
  Step2EmotionTone,
  Step3Story,
  Step4Media,
  Step5Publish,
];

export default function CreatePage() {
  const { step } = useCreatorStore();
  const StepComponent = stepComponents[step - 1];

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative">
      <ParticleField count={30} />

      {/* Header */}
      <header className="relative z-10 px-6 py-5 border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">
              Wish<span className="text-violet-400">Mian</span>
            </span>
          </Link>
          <span className="text-white/30 text-sm cinematic">Creator Studio</span>
        </div>
      </header>

      {/* Step indicator */}
      <div className="relative z-10 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <StepIndicator currentStep={step} />
        </div>
      </div>

      {/* Step content */}
      <main className="relative z-10 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StepComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
