"use client";

import { usePlayerState } from "./usePlayerState";
import { MobileLayout } from "./MobileLayout";
import { DesktopLayout } from "./DesktopLayout";
import type { MusicPlayerProps } from "./types";

export function MusicPlayer({ onAudioElement, sample }: MusicPlayerProps = {}) {
  const player = usePlayerState({ onAudioElement });

  if (player.loading) {
    return (
      <div className="flex items-center justify-center p-8 text-neutral-500">
        Loading songs...
      </div>
    );
  }

  if (player.songs.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-neutral-500">
        No songs found.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white rounded-lg overflow-hidden">
      <audio ref={player.audioRefCallback} crossOrigin="anonymous" preload="metadata" />

      {player.isMobile
        ? <MobileLayout player={player} sample={sample} />
        : <DesktopLayout player={player} sample={sample} />}
    </div>
  );
}
