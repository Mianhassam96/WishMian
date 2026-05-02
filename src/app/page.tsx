"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { encodeWish, WishData, Occasion, Mood } from "@/lib/wish";
import { Sparkles, Copy, Check, ArrowRight, Camera, X, Wand2 } from "lucide-react";
import ParticlesBg from "@/components/ParticlesBg";

/* ── Data ─────────────────────────────────────────────────────────────────── */

const OCCASIONS: { value: Occasion; emoji: string; label: string; color: string }[] = [
  { value: "birthday", emoji: "🎂", label: "Birthday",  color: "#ff6b6b" },
  { value: "eid",      emoji: "🌙", label: "Eid",       color: "#52b788" },
  { value: "wedding",  emoji: "💍", label: "Wedding",   color: "#ffb3c6" },
  { value: "success",  emoji: "🏆", label: "Success",   color: "#ffd700" },
  { value: "love",     emoji: "💖", label: "Love",      color: "#ff6eb4" },
];

const MOODS: { value: Mood; label: string; emoji: string; desc: string; gradient: string }[] = [
  { value: "luxury",      label: "Luxury",      emoji: "✨", desc: "Gold & elegant",   gradient: "from-yellow-500/20 to-amber-600/10" },
  { value: "royal",       label: "Royal",       emoji: "👑", desc: "Purple & gold",    gradient: "from-purple-600/20 to-yellow-500/10" },
  { value: "celebration", label: "Celebrate",   emoji: "🎊", desc: "Colorful burst",   gradient: "from-pink-500/20 to-orange-500/10" },
  { value: "emotional",   label: "Emotional",   emoji: "💜", desc: "Deep & touching",  gradient: "from-violet-600/20 to-blue-600/10" },
  { value: "cute",        label: "Cute",        emoji: "🌸", desc: "Soft & sweet",     gradient: "from-pink-400/20 to-rose-400/10" },
];

/* ── Component ────────────────────────────────────────────────────────────── */

export default function CreatorPage() {
  const [form, setForm] = useState<WishData>({
    name: "", from: "", message: "", occasion: "birthday", mood: "luxury",
  });
  const [photo, setPhoto] = useState<string | undefined>();
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"form" | "done">("form");
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const max = 400;
        const ratio = Math.min(max / img.width, max / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setPhoto(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = () => {
    const data: WishData = { ...form, photo };
    const encoded = encodeWish(data);
    const origin = window.location.origin;
    const repoBase = window.location.pathname.startsWith("/WishMian") ? "/WishMian" : "";
    setLink(`${origin}${repoBase}/w/?data=${encoded}`);
    setStep("done");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const canGenerate = form.name.trim().length > 0 && form.message.trim().length > 0;
  const selectedOccasion = OCCASIONS.find(o => o.value === form.occasion)!;

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#03020a" }}>
      <ParticlesBg />

      {/* ── Deep background layers ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Top-left purple nebula */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />
        {/* Bottom-right gold nebula */}
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%)" }} />
        {/* Center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 70%)" }} />
      </div>

      <AnimatePresence mode="wait">
        {step === "form" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 min-h-screen flex flex-col items-center justify-start px-4 py-10"
          >
            {/* ── Logo ── */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex items-center gap-3 mb-12"
            >
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #4c1d95)",
                    boxShadow: "0 0 30px rgba(124,58,237,0.6), 0 0 60px rgba(124,58,237,0.2), inset 0 1px 0 rgba(255,255,255,0.15)"
                  }}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400"
                  style={{ boxShadow: "0 0 8px rgba(255,215,0,0.8)" }} />
              </div>
              <div>
                <span className="text-white font-bold text-2xl tracking-tight">
                  Wish<span className="gold-text">Mian</span>
                </span>
                <p className="text-white/25 text-[10px] label tracking-widest">Cinematic Wish Links</p>
              </div>
            </motion.div>

            {/* ── Hero headline ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-center mb-10"
            >
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-3">
                <span className="hero-text">Create a moment</span>
                <br />
                <span className="text-white/90">they&apos;ll never forget.</span>
              </h1>
              <p className="text-white/35 text-base max-w-sm mx-auto leading-relaxed">
                Fill in the details. Get a magic link. Send it. Watch them feel it.
              </p>
            </motion.div>

            {/* ── Main form card ── */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-lg"
            >
              <div className="rounded-3xl p-8 relative overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.06)"
                }}>

                {/* Card shimmer */}
                <div className="absolute inset-0 shimmer rounded-3xl pointer-events-none" />

                <div className="relative space-y-6">

                  {/* ── Name + From row ── */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label text-violet-400/80 block mb-2.5">✦ For who</label>
                      <input
                        className="input"
                        placeholder="Their name..."
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label text-violet-400/80 block mb-2.5">✦ From</label>
                      <input
                        className="input"
                        placeholder="Your name..."
                        value={form.from}
                        onChange={(e) => setForm({ ...form, from: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* ── Message ── */}
                  <div>
                    <label className="label text-violet-400/80 block mb-2.5">✦ Your message</label>
                    <div className="relative">
                      <textarea
                        className="input resize-none"
                        rows={4}
                        placeholder="Write something that will make them feel it deeply..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                      />
                      {form.message.length > 0 && (
                        <span className="absolute bottom-3 right-4 text-white/15 text-xs">
                          {form.message.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── Occasion ── */}
                  <div>
                    <label className="label text-violet-400/80 block mb-3">✦ Occasion</label>
                    <div className="grid grid-cols-5 gap-2">
                      {OCCASIONS.map((o) => {
                        const isSelected = form.occasion === o.value;
                        return (
                          <motion.button
                            key={o.value}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setForm({ ...form, occasion: o.value })}
                            className="relative flex flex-col items-center gap-1.5 py-3.5 rounded-2xl transition-all duration-300"
                            style={{
                              background: isSelected
                                ? `linear-gradient(135deg, ${o.color}25, ${o.color}10)`
                                : "rgba(255,255,255,0.03)",
                              border: isSelected
                                ? `1px solid ${o.color}60`
                                : "1px solid rgba(255,255,255,0.06)",
                              boxShadow: isSelected
                                ? `0 0 20px ${o.color}25, 0 4px 15px rgba(0,0,0,0.3)`
                                : "none",
                            }}
                          >
                            <span className="text-2xl">{o.emoji}</span>
                            <span className="text-[10px] font-medium"
                              style={{ color: isSelected ? o.color : "rgba(255,255,255,0.4)" }}>
                              {o.label}
                            </span>
                            {isSelected && (
                              <motion.div
                                layoutId="occasion-indicator"
                                className="absolute -bottom-px left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                                style={{ background: o.color }}
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Mood ── */}
                  <div>
                    <label className="label text-violet-400/80 block mb-3">✦ Mood & style</label>
                    <div className="grid grid-cols-5 gap-2">
                      {MOODS.map((m) => {
                        const isSelected = form.mood === m.value;
                        return (
                          <motion.button
                            key={m.value}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setForm({ ...form, mood: m.value })}
                            className="relative flex flex-col items-center gap-1 py-3 px-1 rounded-2xl transition-all duration-300"
                            style={{
                              background: isSelected
                                ? "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(124,58,237,0.1))"
                                : "rgba(255,255,255,0.03)",
                              border: isSelected
                                ? "1px solid rgba(255,215,0,0.4)"
                                : "1px solid rgba(255,255,255,0.06)",
                              boxShadow: isSelected
                                ? "0 0 20px rgba(255,215,0,0.15), 0 4px 15px rgba(0,0,0,0.3)"
                                : "none",
                            }}
                          >
                            <span className="text-lg">{m.emoji}</span>
                            <span className="text-[10px] font-semibold"
                              style={{ color: isSelected ? "#ffd700" : "rgba(255,255,255,0.4)" }}>
                              {m.label}
                            </span>
                            <span className="text-[8px] text-center leading-tight"
                              style={{ color: isSelected ? "rgba(255,215,0,0.5)" : "rgba(255,255,255,0.2)" }}>
                              {m.desc}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Photo upload ── */}
                  <div>
                    <label className="label text-violet-400/80 block mb-3">✦ Photo <span className="text-white/20 normal-case" style={{ letterSpacing: "0" }}>(optional)</span></label>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                    {photo ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative h-36 rounded-2xl overflow-hidden"
                        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo} alt="preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0"
                          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)" }} />
                        <button
                          onClick={() => setPhoto(undefined)}
                          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all"
                          style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}
                        >
                          <X className="w-3.5 h-3.5 text-white" />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => fileRef.current?.click()}
                        className="w-full h-24 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 group"
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: "1px dashed rgba(255,255,255,0.1)",
                        }}
                      >
                        <Camera className="w-5 h-5 text-white/20 group-hover:text-violet-400 transition-colors" />
                        <span className="text-white/25 text-sm group-hover:text-white/40 transition-colors">
                          Add a photo
                        </span>
                      </motion.button>
                    )}
                  </div>

                  {/* ── Generate button ── */}
                  <motion.button
                    whileHover={canGenerate ? { scale: 1.02, y: -1 } : {}}
                    whileTap={canGenerate ? { scale: 0.98 } : {}}
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden"
                    style={canGenerate ? {
                      background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 50%, #4c1d95 100%)",
                      color: "#fff",
                      boxShadow: "0 0 40px rgba(124,58,237,0.5), 0 8px 30px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                    } : {
                      background: "rgba(255,255,255,0.04)",
                      color: "rgba(255,255,255,0.2)",
                      cursor: "not-allowed",
                    }}
                  >
                    {canGenerate && (
                      <div className="absolute inset-0 shimmer" />
                    )}
                    <Wand2 className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Generate Magic Link</span>
                    <ArrowRight className="w-4 h-4 relative z-10" />
                  </motion.button>

                </div>
              </div>
            </motion.div>

            {/* ── Preview cards floating ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-2 mt-8 text-white/15 text-xs"
            >
              {["🎂 Birthday", "🌙 Eid", "💍 Wedding", "🏆 Success", "💖 Love"].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {tag}
                </span>
              ))}
            </motion.div>

          </motion.div>

        ) : (
          /* ── DONE SCREEN ── */
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
            className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16"
          >
            {/* Celebration glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at center, rgba(255,215,0,0.08) 0%, transparent 60%)" }} />

            {/* Floating emoji */}
            <motion.div
              animate={{ y: [0, -15, 0], rotate: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-7xl mb-8 relative z-10"
            >
              {selectedOccasion.emoji}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-10 relative z-10"
            >
              <h2 className="text-4xl font-bold mb-3">
                <span className="hero-text">Your wish is ready.</span>
              </h2>
              <p className="text-white/35 text-lg">
                Send this link. When they open it —{" "}
                <span className="gold-text font-semibold">magic happens.</span>
              </p>
            </motion.div>

            {/* Link card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="w-full max-w-lg mb-4 relative z-10"
            >
              <div className="rounded-2xl p-5 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(124,58,237,0.06))",
                  border: "1px solid rgba(255,215,0,0.2)",
                  boxShadow: "0 0 40px rgba(255,215,0,0.08), 0 20px 40px rgba(0,0,0,0.4)"
                }}>
                <p className="label text-yellow-500/60 mb-3">✦ Your Magic Link</p>
                <div className="flex items-center gap-3">
                  <span className="text-white/50 text-sm flex-1 truncate font-mono">{link}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0"
                    style={copied ? {
                      background: "rgba(52,211,153,0.15)",
                      color: "#34d399",
                      border: "1px solid rgba(52,211,153,0.3)"
                    } : {
                      background: "rgba(124,58,237,0.2)",
                      color: "#a78bfa",
                      border: "1px solid rgba(124,58,237,0.3)"
                    }}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Preview button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="w-full max-w-lg relative z-10 space-y-3"
            >
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-4 rounded-2xl font-bold text-base text-center text-black transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #ffd700 0%, #ffed4a 50%, #f59e0b 100%)",
                  boxShadow: "0 0 40px rgba(255,215,0,0.4), 0 8px 30px rgba(255,215,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)"
                }}
              >
                ✨ Preview the Experience
              </a>

              <button
                onClick={() => { setStep("form"); setLink(""); }}
                className="w-full py-3 rounded-2xl text-sm text-white/30 hover:text-white/60 transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}
              >
                ← Create another wish
              </button>
            </motion.div>

            {/* Share hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-white/15 text-xs text-center relative z-10"
            >
              Share via WhatsApp, Instagram, or any messenger
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
