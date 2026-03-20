"use client";

import { useState } from "react";
import { MusicPlayer } from "@/components/music-player";

export function ArtistMusicPlayer() {
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);

  return (
    <section className="px-8 md:px-16 lg:px-20 py-16">
      <div className="max-w-7xl mx-auto">
        <MusicPlayer onAudioElement={setAudioEl} />
      </div>
    </section>
  );
}
