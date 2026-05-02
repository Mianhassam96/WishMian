"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Wish<span className="text-violet-400">Mian</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          {["Templates", "Features", "Pricing"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-white/60 hover:text-white text-sm transition-colors duration-200"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-white/60 hover:text-white text-sm transition-colors hidden md:block"
          >
            Sign in
          </Link>
          <Link href="/create">
            <Button size="sm" variant="primary">
              Create Now
            </Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
