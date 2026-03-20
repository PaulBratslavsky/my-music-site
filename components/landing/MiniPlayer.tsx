"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getStrapiMedia, getStreamURL } from "@/lib/strapi";
import type { Song } from "@/lib/types";

interface MiniPlayerProps {
  song: Song | null;
  onClose: () => void;
}

export function MiniPlayer({ song, onClose }: MiniPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song) return;

    audio.src = getStreamURL(song.documentId);
    audio.play().then(() => setIsPlaying(true)).catch(() => {});

    const onTime = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onEnded = () => { setIsPlaying(false); setProgress(0); };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
  }, [song]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  if (!song) return null;

  const imageUrl = getStrapiMedia(song.image?.url ?? song.artist?.image?.url ?? null);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/10">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-4 px-6 py-3 max-w-screen-xl mx-auto">
        {/* Album art */}
        <div className="size-12 shrink-0 relative overflow-hidden rounded bg-white/10">
          {imageUrl ? (
            <Image src={imageUrl} alt={song.title} fill className="object-cover" sizes="48px" />
          ) : (
            <div className="size-full bg-gradient-to-br from-purple-600 to-pink-600" />
          )}
        </div>

        {/* Song info */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold truncate">{song.title}</p>
          <p className="text-white/40 text-xs truncate">{song.artist?.name ?? "Unknown Artist"}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-white/80 size-10"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/40 hover:text-white size-8"
            onClick={onClose}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </Button>
        </div>
      </div>

      <audio ref={audioRef} preload="metadata" />
    </div>
  );
}
