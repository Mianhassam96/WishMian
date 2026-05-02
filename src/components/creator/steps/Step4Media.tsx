"use client";

import { motion } from "framer-motion";
import { useCreatorStore } from "@/store/creator";
import Button from "@/components/ui/Button";
import { ArrowRight, ArrowLeft, Upload, Music, X } from "lucide-react";
import { useRef } from "react";
import { MediaAsset } from "@/types";

const MUSIC_TRACKS = [
  { id: "upbeat-celebration", label: "🎉 Upbeat Celebration" },
  { id: "romantic-strings", label: "🎻 Romantic Strings" },
  { id: "spiritual-ambient", label: "🕌 Spiritual Ambient" },
  { id: "epic-triumph", label: "🏆 Epic Triumph" },
  { id: "emotional-piano", label: "🎹 Emotional Piano" },
  { id: "none", label: "🔇 No Music" },
];

export default function Step4Media() {
  const {
    media,
    musicTrack,
    addMedia,
    removeMedia,
    setMusicTrack,
    nextStep,
    prevStep,
  } = useCreatorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const asset: MediaAsset = {
        id: `${Date.now()}-${Math.random()}`,
        type: file.type.startsWith("video")
          ? "video"
          : file.type.startsWith("audio")
          ? "audio"
          : "image",
        url,
        thumbnail: file.type.startsWith("image") ? url : undefined,
      };
      addMedia(asset);
    });
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          Add your media.
        </h2>
        <p className="text-white/40">Photos, videos, and music make it real.</p>
      </motion.div>

      <div className="max-w-xl mx-auto space-y-6">
        {/* Upload area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full glass rounded-2xl border border-dashed border-white/10 hover:border-violet-500/40 p-8 flex flex-col items-center gap-3 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
              <Upload className="w-6 h-6 text-violet-400" />
            </div>
            <div className="text-center">
              <p className="text-white/60 text-sm">
                Drop photos or videos here
              </p>
              <p className="text-white/20 text-xs mt-1">
                JPG, PNG, MP4 supported
              </p>
            </div>
          </button>
        </motion.div>

        {/* Media preview */}
        {media.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-3 gap-2"
          >
            {media.map((asset) => (
              <div key={asset.id} className="relative group aspect-square">
                {asset.type === "image" && asset.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.thumbnail}
                    alt="media"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full glass rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎬</span>
                  </div>
                )}
                <button
                  onClick={() => removeMedia(asset.id)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {/* Music selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="flex items-center gap-2 text-white/60 text-sm mb-3">
            <Music className="w-4 h-4" />
            Background Music
          </label>
          <div className="grid grid-cols-2 gap-2">
            {MUSIC_TRACKS.map((track) => (
              <button
                key={track.id}
                onClick={() => setMusicTrack(track.id === "none" ? null : track.id)}
                className={`glass rounded-xl px-3 py-2.5 text-sm text-left transition-all border ${
                  (musicTrack === track.id) ||
                  (track.id === "none" && !musicTrack)
                    ? "border-violet-500/50 text-white bg-violet-500/10"
                    : "border-white/5 text-white/50 hover:border-white/10"
                }`}
              >
                {track.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between pt-2"
        >
          <Button variant="ghost" onClick={prevStep}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button variant="primary" onClick={nextStep}>
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
