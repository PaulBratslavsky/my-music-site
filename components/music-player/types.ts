import type { AudioData } from "../audio-background/useAudioAnalyser";

export type { AudioData };

export interface StrapiMedia {
  id: number;
  url: string;
  alternativeText?: string | null;
}

export interface Artist {
  id: number;
  documentId: string;
  name: string;
  image?: StrapiMedia | null;
}

export interface Song {
  id: number;
  documentId: string;
  title: string;
  createdAt: string;
  image?: StrapiMedia | null;
  audio?: StrapiMedia | null;
  artist?: Artist | null;
  peaks?: number[] | null;
  duration?: number | null;
}

export type LoopMode = "none" | "all" | "one";

export interface MusicPlayerProps {
  onAudioElement?: (el: HTMLAudioElement | null) => void;
  onSongChange?: (song: Song | null) => void;
  sample?: () => AudioData | null;
  forceMobile?: boolean;
}
