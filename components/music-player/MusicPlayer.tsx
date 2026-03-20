"use client";

import { usePlayerState } from "./usePlayerState";
import { MobileLayout } from "./MobileLayout";
import { DesktopLayout } from "./DesktopLayout";
import type { MusicPlayerProps } from "./types";

export function MusicPlayer({ onAudioElement, onSongChange, sample, forceMobile }: MusicPlayerProps = {}) {
  const player = usePlayerState({ onAudioElement, onSongChange });
  const useMobile = forceMobile ?? player.isMobile;

  if (player.loading) {
    return (
      <div className="flex items-center justify-center p-8 text-neutral-500 dark:text-neutral-400">
        Loading songs...
      </div>
    );
  }

  if (player.songs.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-neutral-500 dark:text-neutral-400">
        No songs found.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-950 text-black dark:text-white rounded-lg overflow-hidden transition-colors">
      <audio ref={player.audioRefCallback} crossOrigin="anonymous" preload="metadata" />

      {useMobile
        ? <MobileLayout player={player} sample={sample} />
        : <DesktopLayout player={player} sample={sample} />}
    </div>
  );
}
