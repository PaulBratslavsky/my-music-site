"use client";

import { useState } from "react";
import { MusicPlayer } from "../components/music-player";
import { AudioBackground } from "../components/audio-background/AudioBackground";
import { useAudioAnalyser } from "../components/audio-background/useAudioAnalyser";

export default function MusicPage() {
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const { sample } = useAudioAnalyser(audioEl);

  return (
    <div className="relative h-screen w-full">
      <AudioBackground sample={sample} />
      <MusicPlayer onAudioElement={setAudioEl} sample={sample} />
    </div>
  );
}
