"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { MusicPlayer } from "@/components/music-player";
import { AudioBackground } from "@/components/audio-background/AudioBackground";
import { useAudioAnalyser } from "@/components/audio-background/useAudioAnalyser";

export default function MusicPage() {
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const { sample } = useAudioAnalyser(audioEl);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black transition-colors">
      <Navbar />
      <div className="relative flex-1">
        <AudioBackground sample={sample} />
        <MusicPlayer onAudioElement={setAudioEl} sample={sample} />
      </div>
      <Footer />
    </div>
  );
}
