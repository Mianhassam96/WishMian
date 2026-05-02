export type EventType =
  | "birthday"
  | "wedding"
  | "eid"
  | "success"
  | "farewell";

export type EmotionTone =
  | "joy"
  | "love"
  | "spiritual"
  | "achievement"
  | "nostalgia";

export type RevealMode = "shock" | "gentle" | "cinematic";

export type Tier = "free" | "pro" | "ultra";

export interface MediaAsset {
  id: string;
  type: "image" | "video" | "audio";
  url: string;
  thumbnail?: string;
}

export interface GuestReaction {
  id: string;
  name: string;
  message: string;
  emoji?: string;
  voiceUrl?: string;
  createdAt: string;
}

export interface WishPage {
  id: string;
  slug: string;
  title: string;
  eventType: EventType;
  emotionTone: EmotionTone;
  revealMode: RevealMode;
  message: string;
  recipientName: string;
  senderName: string;
  media: MediaAsset[];
  musicTrack?: string;
  templateId: string;
  guestReactions: GuestReaction[];
  viewCount: number;
  createdAt: string;
  tier: Tier;
}

export interface Template {
  id: string;
  name: string;
  eventType: EventType;
  emotionTone: EmotionTone;
  description: string;
  colorPalette: string[];
  animationStyle: string;
  musicPack: string;
  tier: Tier;
  preview: string;
}

export interface CreatorStep {
  id: number;
  title: string;
  description: string;
}
