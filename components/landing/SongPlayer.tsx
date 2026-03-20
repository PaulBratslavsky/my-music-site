"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { getStrapiMedia, getStreamURL } from "@/lib/strapi";
import type { Song } from "@/lib/types";

interface SongPlayerProps {
  song: Song;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function SongPlayer({ song }: SongPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = getStreamURL(song.documentId);
    audio.volume = volume;
    audio.play().then(() => setIsPlaying(true)).catch(() => {});

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
  }, [song.documentId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  }, [duration]);

  const restart = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  const imageUrl = getStrapiMedia(song.image?.url ?? song.artist?.image?.url ?? null);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full">
      {/* Album art */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900 rounded">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={song.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 500px"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-player-accent to-pink-500" />
        )}
        {/* Neon blue→pink radial tint overlay — stronger in dark mode */}
        <div
          className="absolute inset-0 mix-blend-color opacity-50 dark:opacity-80 pointer-events-none"
          style={{ background: "radial-gradient(circle at 30% 70%, #3b82f6 0%, #ec4899 60%, #f43f5e 100%)" }}
        />
        <div className="absolute inset-0 bg-black/0 dark:bg-black/30 pointer-events-none" />
      </div>

      {/* Transport controls */}
      <div className="flex items-center justify-center gap-8 py-4">
        <button
          onClick={restart}
          className="text-black dark:text-white hover:opacity-60 transition-opacity"
          aria-label="Previous"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>
        <button
          onClick={togglePlay}
          className="text-black dark:text-white hover:opacity-60 transition-opacity"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <button
          className="text-black dark:text-white hover:opacity-60 transition-opacity"
          aria-label="Next"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>

      {/* Bottom player bar */}
      <div className="border border-player-accent/20 rounded-md px-4 py-3 bg-white dark:bg-neutral-950 shadow-[0_0_15px_color-mix(in_oklch,var(--player-accent)_12%,transparent)]">
        {/* Row 1: Song title */}
        <p className="text-black dark:text-white text-sm font-black uppercase tracking-tight font-heading leading-tight">
          {song.title}
        </p>

        {/* Row 2: Progress + time + volume — all on one line */}
        <div className="flex items-center gap-2 mt-1.5">
          <div
            ref={progressRef}
            className="w-2/5 h-0.5 bg-black/80 dark:bg-white/20 rounded-full cursor-pointer relative shrink-0"
            onClick={seek}
          >
            <div
              className="absolute top-0 left-0 h-full bg-player-accent rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-black/50 dark:text-white/50 text-xs tabular-nums shrink-0">
            {formatTime(currentTime)}/{duration > 0 ? formatTime(duration) : "--:--"}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-black/60 dark:text-white/60 shrink-0 ml-auto">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
          <div
            className="w-20 h-0.5 bg-black/80 dark:bg-white/20 rounded-full cursor-pointer relative shrink-0"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const v = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              setVolume(v);
              if (audioRef.current) audioRef.current.volume = v;
            }}
          >
            <div
              className="absolute top-0 left-0 h-full bg-player-accent rounded-full"
              style={{ width: `${volume * 100}%` }}
            />
          </div>
        </div>

        {/* Row 3: Artist name */}
        <p className="text-black/40 dark:text-white/40 text-xs mt-1">
          {song.artist?.name ?? "Unknown Artist"}
        </p>
      </div>

      <audio ref={audioRef} preload="metadata" />
    </div>
  );
}
