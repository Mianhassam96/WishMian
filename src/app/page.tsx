"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { encodeWish, WishData, Occasion, Mood } from "@/lib/wish";
import { Sparkles, Copy, Check, ArrowRight, Camera, X } from "lucide-react";
import ParticlesBg from "@/components/ParticlesBg";

const OCCASIONS: { value: Occasion; label: string; emoji: string }[] = [
  { value: "birthday", label: "Birthday", emoji: "🎂" },
  { value: "eid",      label: "Eid",      emoji: "🌙" },
  { value: "wedding",  label: "Wedding",  emoji: "💍" },
  { value: "success",  label: "Success",  emoji: "🏆" },
  { value: "love",     label: "Love",     emoji: "💖" },
];

const MOODS: { value: Mood; label: string; desc: string }[] = [
  { value: "luxury",      label: "Luxury",      desc: "Gold & elegant" },
  { value: "royal",       label: "Royal",       desc: "Purple & gold" },
  { value: "celebration", label: "Celebration", desc: "Colorful burst" },
  { value: "emotional",   label: "Emotional",   desc: "Deep & touching" },
  { value: "cute",        label: "Cute",        desc: "Soft & sweet" },
];

export default function CreatorPage() {
  const [form, setForm] = useState<WishData>({
    name: "",
    from: "",
    message: "",
    occasion: "birthday",
    mood: "luxury",
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
      const result = ev.target?.result as string;
      // Compress to max ~200kb for URL safety
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
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = () => {
    const data: WishData = { ...form, photo };
    const encoded = encodeWish(data);
    const base = window.location.origin;
    setLink(`${base}/w?data=${encoded}`);
    setStep("done");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const canGenerate = form.name.trim() && form.message.trim();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <ParticlesBg />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex items-center gap-2 mb-10"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.5)]">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-bold text-2xl tracking-tight">
          Wish<span className="gold-text">Mian</span>
        </span>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === "form" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-lg"
          >
            {/* Card */}
            <div className="glass rounded-3xl p-8 glow-purple">
              <p className="label text-violet-400 mb-1">Create Your Wish</p>
              <h1 className="text-2xl font-bold text-white mb-6">
                Make someone feel it. ✨
              </h1>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="label text-white/40 block mb-2">For who?</label>
                  <input
                    className="input"
                    placeholder="Their name..."
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                {/* From */}
                <div>
                  <label className="label text-white/40 block mb-2">From</label>
                  <input
                    className="input"
                    placeholder="Your name (optional)..."
                    value={form.from}
                    onChange={(e) => setForm({ ...form, from: e.target.value })}
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="label text-white/40 block mb-2">Your Message</label>
                  <textarea
                    className="input resize-none"
                    rows={4}
                    placeholder="Write something they'll never forget..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                {/* Occasion */}
                <div>
                  <label className="label text-white/40 block mb-2">Occasion</label>
                  <div className="grid grid-cols-5 gap-2">
                    {OCCASIONS.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => setForm({ ...form, occasion: o.value })}
                        className={`flex flex-col items-center gap-1 py-3 rounded-2xl border transition-all duration-200 ${
                          form.occasion === o.value
                            ? "border-violet-500 bg-violet-500/15 shadow-[0_0_15px_rgba(124,58,237,0.2)]"
                            : "border-white/5 hover:border-white/15"
                        }`}
                      >
                        <span className="text-xl">{o.emoji}</span>
                        <span className="text-white/50 text-[10px]">{o.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood */}
                <div>
                  <label className="label text-white/40 block mb-2">Mood</label>
                  <div className="grid grid-cols-5 gap-2">
                    {MOODS.map((m) => (
                      <button
                        key={m.value}
                        onClick={() => setForm({ ...form, mood: m.value })}
                        className={`py-2.5 px-1 rounded-2xl border text-center transition-all duration-200 ${
                          form.mood === m.value
                            ? "border-yellow-500/60 bg-yellow-500/10 shadow-[0_0_15px_rgba(255,215,0,0.15)]"
                            : "border-white/5 hover:border-white/15"
                        }`}
                      >
                        <span className={`text-xs font-medium block ${form.mood === m.value ? "text-yellow-300" : "text-white/50"}`}>
                          {m.label}
                        </span>
                        <span className="text-white/20 text-[9px]">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Photo */}
                <div>
                  <label className="label text-white/40 block mb-2">Photo (optional)</label>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                  {photo ? (
                    <div className="relative w-full h-32 rounded-2xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt="preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setPhoto(undefined)}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center"
                      >
                        <X className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="w-full h-20 rounded-2xl border border-dashed border-white/10 hover:border-violet-500/40 flex items-center justify-center gap-2 text-white/30 hover:text-white/50 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      <span className="text-sm">Add a photo</span>
                    </button>
                  )}
                </div>

                {/* Generate */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all duration-300 ${
                    canGenerate
                      ? "bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_rgba(124,58,237,0.6)]"
                      : "bg-white/5 text-white/20 cursor-not-allowed"
                  }`}
                >
                  Generate Magic Link
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="relative z-10 w-full max-w-lg text-center"
          >
            {/* Success */}
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8 }}
              className="text-6xl mb-6"
            >
              🎁
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-2">
              Your wish is ready!
            </h2>
            <p className="text-white/40 mb-8">
              Send this link. When they open it — magic happens.
            </p>

            {/* Link box */}
            <div className="glass rounded-2xl p-4 mb-4 glow-gold">
              <p className="text-white/30 text-xs label mb-2">Your Magic Link</p>
              <div className="flex items-center gap-3">
                <span className="text-white/70 text-sm flex-1 truncate text-left">
                  {link}
                </span>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    copied
                      ? "bg-green-500/20 text-green-400"
                      : "bg-violet-500/20 text-violet-400 hover:bg-violet-500/30"
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Preview button */}
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-bold text-base mb-4 shadow-[0_0_30px_rgba(255,215,0,0.3)] hover:shadow-[0_0_50px_rgba(255,215,0,0.5)] transition-all"
            >
              Preview Experience ✨
            </a>

            <button
              onClick={() => { setStep("form"); setLink(""); }}
              className="text-white/30 hover:text-white/60 text-sm transition-colors"
            >
              ← Create another wish
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 mt-10 text-white/15 text-xs label"
      >
        WishMian — Cinematic Wish Links
      </motion.p>
    </div>
  );
}
