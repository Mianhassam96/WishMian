import { create } from "zustand";
import { EventType, EmotionTone, RevealMode, MediaAsset } from "@/types";

interface CreatorState {
  step: number;
  eventType: EventType | null;
  emotionTone: EmotionTone | null;
  templateId: string | null;
  message: string;
  recipientName: string;
  senderName: string;
  media: MediaAsset[];
  musicTrack: string | null;
  revealMode: RevealMode;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setEventType: (type: EventType) => void;
  setEmotionTone: (tone: EmotionTone) => void;
  setTemplateId: (id: string) => void;
  setMessage: (msg: string) => void;
  setRecipientName: (name: string) => void;
  setSenderName: (name: string) => void;
  addMedia: (asset: MediaAsset) => void;
  removeMedia: (id: string) => void;
  setMusicTrack: (track: string | null) => void;
  setRevealMode: (mode: RevealMode) => void;
  reset: () => void;
}

const initialState = {
  step: 1,
  eventType: null,
  emotionTone: null,
  templateId: null,
  message: "",
  recipientName: "",
  senderName: "",
  media: [],
  musicTrack: null,
  revealMode: "shock" as RevealMode,
};

export const useCreatorStore = create<CreatorState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 5) })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),
  setEventType: (eventType) => set({ eventType }),
  setEmotionTone: (emotionTone) => set({ emotionTone }),
  setTemplateId: (templateId) => set({ templateId }),
  setMessage: (message) => set({ message }),
  setRecipientName: (recipientName) => set({ recipientName }),
  setSenderName: (senderName) => set({ senderName }),
  addMedia: (asset) => set((s) => ({ media: [...s.media, asset] })),
  removeMedia: (id) =>
    set((s) => ({ media: s.media.filter((m) => m.id !== id) })),
  setMusicTrack: (musicTrack) => set({ musicTrack }),
  setRevealMode: (revealMode) => set({ revealMode }),
  reset: () => set(initialState),
}));
