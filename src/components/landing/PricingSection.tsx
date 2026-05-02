"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Start creating memories",
    features: [
      "3 basic templates",
      "WishMian watermark",
      "Standard animations",
      "Share via link",
      "Guest reactions",
    ],
    cta: "Get Started",
    href: "/create",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "Cinematic experiences",
    features: [
      "All cinematic templates",
      "No watermark",
      "Shock reveal mode",
      "Music library access",
      "Voice message reactions",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Go Pro",
    href: "/pricing",
    highlight: true,
  },
  {
    name: "Ultra",
    price: "$29",
    period: "/month",
    description: "Premium everything",
    features: [
      "Everything in Pro",
      "Custom domain pages",
      "AI-generated pages",
      "Premium animation packs",
      "White-label option",
      "API access",
      "Dedicated support",
    ],
    cta: "Go Ultra",
    href: "/pricing",
    highlight: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-32 px-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="cinematic text-violet-400 mb-4">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, honest pricing.
          </h2>
          <p className="text-white/40 text-lg">
            Start free. Upgrade when you need the cinematic power.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="relative"
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="flex items-center gap-1 bg-violet-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </span>
                </div>
              )}
              <GlassCard
                className={`p-6 h-full flex flex-col ${
                  plan.highlight
                    ? "border border-violet-500/40 shadow-[0_0_40px_rgba(139,92,246,0.15)]"
                    : ""
                }`}
              >
                <div className="mb-6">
                  <h3 className="text-white font-bold text-xl mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-white/40 text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-white/40 text-sm">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-white/60"
                    >
                      <Check className="w-4 h-4 text-violet-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href={plan.href}>
                  <Button
                    variant={plan.highlight ? "primary" : "secondary"}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
