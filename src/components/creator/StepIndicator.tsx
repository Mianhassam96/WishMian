"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const STEPS = [
  { id: 1, label: "Event" },
  { id: 2, label: "Tone" },
  { id: 3, label: "Story" },
  { id: 4, label: "Media" },
  { id: 5, label: "Publish" },
];

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, i) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isCompleted
                    ? "#7c3aed"
                    : isActive
                    ? "#8b5cf6"
                    : "rgba(255,255,255,0.05)",
                  borderColor: isCompleted
                    ? "#7c3aed"
                    : isActive
                    ? "#8b5cf6"
                    : "rgba(255,255,255,0.1)",
                }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-white" />
                ) : (
                  <span
                    className={`text-xs font-medium ${
                      isActive ? "text-white" : "text-white/30"
                    }`}
                  >
                    {step.id}
                  </span>
                )}
              </motion.div>
              <span
                className={`text-xs ${
                  isActive
                    ? "text-violet-400"
                    : isCompleted
                    ? "text-white/60"
                    : "text-white/20"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div className="w-12 h-px mx-1 mb-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10" />
                <motion.div
                  className="absolute inset-0 bg-violet-500"
                  animate={{ scaleX: isCompleted ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ transformOrigin: "left" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
