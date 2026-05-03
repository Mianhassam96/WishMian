"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCreatorStore } from "@/store/creator";
import StepIndicator from "@/components/creator/StepIndicator";
import Step1EventType from "@/components/creator/steps/Step1EventType";
import Step2EmotionTone from "@/components/creator/steps/Step2EmotionTone";
import Step3Story from "@/components/creator/steps/Step3Story";
import Step4Media from "@/components/creator/steps/Step4Media";
import Step5Publish from "@/components/creator/steps/Step5Publish";
import ParticlesBg from "@/components/ParticlesBg";
import { Sparkles } from "lucide-react";
import Link from "next/link";

const STEPS = [Step1EventType, Step2EmotionTone, Step3Story, Step4Media, Step5Publish];

export default function CreatePage() {
  const { step } = useCreatorStore();
  const StepComponent = STEPS[step - 1];

  return (
    <div style={{ minHeight: "100vh", background: "#060010", position: "relative", overflowX: "hidden" }}>
      <ParticlesBg count={60} />

      {/* Aurora blobs */}
      <div aria-hidden="true" style={{ position: "fixed", top: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%", pointerEvents: "none", zIndex: 0, background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)", animation: "aurora 12s ease-in-out infinite" }} />
      <div aria-hidden="true" style={{ position: "fixed", bottom: "-15%", right: "-10%", width: 500, height: 500, borderRadius: "50%", pointerEvents: "none", zIndex: 0, background: "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)", animation: "aurora2 15s ease-in-out infinite" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "32px 20px 80px" }}>
        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(124,58,237,0.5)" }}>
              <Sparkles size={16} color="#fff" />
            </div>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.1rem" }}>Wish<span style={{ color: "#a78bfa" }}>Mian</span></span>
          </Link>
          <span style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(167,139,250,0.5)" }}>Creator Studio</span>
        </div>

        {/* Step indicator */}
        <div style={{ marginBottom: 48 }}>
          <StepIndicator currentStep={step} />
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
