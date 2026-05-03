// ─── Types ────────────────────────────────────────────────────────────────────

export type Occasion = "birthday" | "eid" | "wedding" | "success" | "love";
export type Mood = "luxury" | "cute" | "emotional" | "royal" | "celebration";

export interface WishData {
  name: string;       // recipient name
  from: string;       // sender name
  message: string;    // personal message
  occasion: Occasion;
  mood: Mood;
  photo?: string;     // base64 data URL (optional)
}

// ─── Encoding / Decoding ──────────────────────────────────────────────────────

export function encodeWish(data: WishData): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

export function decodeWish(encoded: string): WishData | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  } catch {
    return null;
  }
}

// ─── Template Engine ──────────────────────────────────────────────────────────

export interface Template {
  colors: string[];
  colorPalette: string[];
  particleColors: string[];
  bgGradient: string;
  glowColor: string;
  emoji: string;
  label: string;
  musicFile: string;
  animationStyle: "explosion" | "gold-fall" | "petal-rise" | "star-burst" | "heart-float";
}

export function getTemplate(occasion: Occasion, mood: Mood): Template {
  const t = TEMPLATES[occasion]?.[mood] ?? TEMPLATES.birthday.luxury;
  // colorPalette = colors array (used for accent bar in viewer)
  return { ...t, colorPalette: t.colors };
}

export const TEMPLATES: Record<Occasion, Record<Mood, Omit<Template, "colorPalette">>> = {
  birthday: {
    luxury:      { colors: ["#ffd700","#ff6b6b"], particleColors: ["#ffd700","#ff6b6b","#fff","#ffb347"], bgGradient: "from-[#1a0a00] via-[#0d0005] to-[#05050a]", glowColor: "#ffd700", emoji: "🎂", label: "Happy Birthday", musicFile: "/audio/birthday.mp3", animationStyle: "explosion" },
    cute:        { colors: ["#ff6eb4","#ffb3d9"], particleColors: ["#ff6eb4","#ffb3d9","#fff","#ffd6ec"], bgGradient: "from-[#1a0010] via-[#0d0008] to-[#05050a]", glowColor: "#ff6eb4", emoji: "🎀", label: "Happy Birthday", musicFile: "/audio/birthday.mp3", animationStyle: "heart-float" },
    emotional:   { colors: ["#a78bfa","#c4b5fd"], particleColors: ["#a78bfa","#c4b5fd","#fff","#7c3aed"], bgGradient: "from-[#0a0015] via-[#07000f] to-[#05050a]", glowColor: "#a78bfa", emoji: "🎂", label: "Happy Birthday", musicFile: "/audio/emotional.mp3", animationStyle: "star-burst" },
    royal:       { colors: ["#ffd700","#6a0dad"], particleColors: ["#ffd700","#9f7aea","#fff","#c9a84c"], bgGradient: "from-[#0d0a00] via-[#08000d] to-[#05050a]", glowColor: "#ffd700", emoji: "👑", label: "Happy Birthday", musicFile: "/audio/royal.mp3", animationStyle: "gold-fall" },
    celebration: { colors: ["#ff4d6d","#ffd166"], particleColors: ["#ff4d6d","#ffd166","#06d6a0","#fff"], bgGradient: "from-[#1a0005] via-[#0d0800] to-[#05050a]", glowColor: "#ff4d6d", emoji: "🎉", label: "Happy Birthday", musicFile: "/audio/celebration.mp3", animationStyle: "explosion" },
  },
  eid: {
    luxury:      { colors: ["#c9a84c","#2d6a4f"], particleColors: ["#ffd700","#52b788","#fff","#c9a84c"], bgGradient: "from-[#0a0800] via-[#000d05] to-[#05050a]", glowColor: "#c9a84c", emoji: "🌙", label: "Eid Mubarak", musicFile: "/audio/royal.mp3", animationStyle: "gold-fall" },
    cute:        { colors: ["#52b788","#b7e4c7"], particleColors: ["#52b788","#b7e4c7","#fff","#ffd700"], bgGradient: "from-[#000d05] via-[#000a03] to-[#05050a]", glowColor: "#52b788", emoji: "🌙", label: "Eid Mubarak", musicFile: "/audio/celebration.mp3", animationStyle: "petal-rise" },
    emotional:   { colors: ["#a78bfa","#52b788"], particleColors: ["#a78bfa","#52b788","#fff","#ffd700"], bgGradient: "from-[#0a0015] via-[#000d05] to-[#05050a]", glowColor: "#a78bfa", emoji: "✨", label: "Eid Mubarak", musicFile: "/audio/emotional.mp3", animationStyle: "star-burst" },
    royal:       { colors: ["#ffd700","#1b4332"], particleColors: ["#ffd700","#52b788","#fff","#c9a84c"], bgGradient: "from-[#0d0a00] via-[#001208] to-[#05050a]", glowColor: "#ffd700", emoji: "👑", label: "Eid Mubarak", musicFile: "/audio/royal.mp3", animationStyle: "gold-fall" },
    celebration: { colors: ["#ffd700","#06d6a0"], particleColors: ["#ffd700","#06d6a0","#fff","#52b788"], bgGradient: "from-[#0a0800] via-[#000d08] to-[#05050a]", glowColor: "#06d6a0", emoji: "🎊", label: "Eid Mubarak", musicFile: "/audio/celebration.mp3", animationStyle: "explosion" },
  },
  wedding: {
    luxury:      { colors: ["#ffd700","#fff0f3"], particleColors: ["#ffd700","#ffb3c6","#fff","#c9a84c"], bgGradient: "from-[#1a0a00] via-[#0d0005] to-[#05050a]", glowColor: "#ffd700", emoji: "💍", label: "Congratulations", musicFile: "/audio/royal.mp3", animationStyle: "gold-fall" },
    cute:        { colors: ["#ffb3c6","#ffd6ec"], particleColors: ["#ffb3c6","#ffd6ec","#fff","#ff6eb4"], bgGradient: "from-[#1a0010] via-[#0d0008] to-[#05050a]", glowColor: "#ffb3c6", emoji: "🌸", label: "Congratulations", musicFile: "/audio/celebration.mp3", animationStyle: "petal-rise" },
    emotional:   { colors: ["#c4b5fd","#ffd6ec"], particleColors: ["#c4b5fd","#ffd6ec","#fff","#a78bfa"], bgGradient: "from-[#0a0015] via-[#0d0008] to-[#05050a]", glowColor: "#c4b5fd", emoji: "💒", label: "Congratulations", musicFile: "/audio/emotional.mp3", animationStyle: "petal-rise" },
    royal:       { colors: ["#ffd700","#9f7aea"], particleColors: ["#ffd700","#9f7aea","#fff","#c9a84c"], bgGradient: "from-[#0d0a00] via-[#08000d] to-[#05050a]", glowColor: "#ffd700", emoji: "👑", label: "Congratulations", musicFile: "/audio/royal.mp3", animationStyle: "gold-fall" },
    celebration: { colors: ["#ff6eb4","#ffd700"], particleColors: ["#ff6eb4","#ffd700","#fff","#ffb3c6"], bgGradient: "from-[#1a0010] via-[#0d0a00] to-[#05050a]", glowColor: "#ff6eb4", emoji: "🎊", label: "Congratulations", musicFile: "/audio/celebration.mp3", animationStyle: "explosion" },
  },
  success: {
    luxury:      { colors: ["#ffd700","#fff"], particleColors: ["#ffd700","#fff","#c9a84c","#ffb347"], bgGradient: "from-[#1a0a00] via-[#0d0800] to-[#05050a]", glowColor: "#ffd700", emoji: "🏆", label: "Congratulations", musicFile: "/audio/royal.mp3", animationStyle: "star-burst" },
    cute:        { colors: ["#06d6a0","#b7e4c7"], particleColors: ["#06d6a0","#b7e4c7","#fff","#52b788"], bgGradient: "from-[#000d08] via-[#000a05] to-[#05050a]", glowColor: "#06d6a0", emoji: "⭐", label: "Congratulations", musicFile: "/audio/celebration.mp3", animationStyle: "star-burst" },
    emotional:   { colors: ["#a78bfa","#ffd700"], particleColors: ["#a78bfa","#ffd700","#fff","#c4b5fd"], bgGradient: "from-[#0a0015] via-[#0d0a00] to-[#05050a]", glowColor: "#a78bfa", emoji: "✨", label: "Congratulations", musicFile: "/audio/emotional.mp3", animationStyle: "star-burst" },
    royal:       { colors: ["#ffd700","#6a0dad"], particleColors: ["#ffd700","#9f7aea","#fff","#c9a84c"], bgGradient: "from-[#0d0a00] via-[#08000d] to-[#05050a]", glowColor: "#ffd700", emoji: "👑", label: "Congratulations", musicFile: "/audio/royal.mp3", animationStyle: "gold-fall" },
    celebration: { colors: ["#ff4d6d","#ffd700"], particleColors: ["#ff4d6d","#ffd700","#06d6a0","#fff"], bgGradient: "from-[#1a0005] via-[#0d0a00] to-[#05050a]", glowColor: "#ff4d6d", emoji: "🎉", label: "Congratulations", musicFile: "/audio/celebration.mp3", animationStyle: "explosion" },
  },
  love: {
    luxury:      { colors: ["#ff6eb4","#ffd700"], particleColors: ["#ff6eb4","#ffd700","#fff","#ffb3d9"], bgGradient: "from-[#1a0010] via-[#0d0a00] to-[#05050a]", glowColor: "#ff6eb4", emoji: "💖", label: "With Love", musicFile: "/audio/emotional.mp3", animationStyle: "heart-float" },
    cute:        { colors: ["#ff6eb4","#ffb3d9"], particleColors: ["#ff6eb4","#ffb3d9","#fff","#ffd6ec"], bgGradient: "from-[#1a0010] via-[#0d0008] to-[#05050a]", glowColor: "#ff6eb4", emoji: "🌸", label: "With Love", musicFile: "/audio/celebration.mp3", animationStyle: "petal-rise" },
    emotional:   { colors: ["#c4b5fd","#ff6eb4"], particleColors: ["#c4b5fd","#ff6eb4","#fff","#a78bfa"], bgGradient: "from-[#0a0015] via-[#1a0010] to-[#05050a]", glowColor: "#c4b5fd", emoji: "💜", label: "With Love", musicFile: "/audio/emotional.mp3", animationStyle: "heart-float" },
    royal:       { colors: ["#ffd700","#ff6eb4"], particleColors: ["#ffd700","#ff6eb4","#fff","#c9a84c"], bgGradient: "from-[#0d0a00] via-[#1a0010] to-[#05050a]", glowColor: "#ffd700", emoji: "👑", label: "With Love", musicFile: "/audio/royal.mp3", animationStyle: "gold-fall" },
    celebration: { colors: ["#ff4d6d","#ff6eb4"], particleColors: ["#ff4d6d","#ff6eb4","#ffd700","#fff"], bgGradient: "from-[#1a0005] via-[#1a0010] to-[#05050a]", glowColor: "#ff4d6d", emoji: "❤️", label: "With Love", musicFile: "/audio/celebration.mp3", animationStyle: "heart-float" },
  },
};
