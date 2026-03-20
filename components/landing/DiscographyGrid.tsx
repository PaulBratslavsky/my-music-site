"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia, getStreamURL } from "@/lib/strapi";
import type { Song } from "@/lib/types";

const GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
  "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
];

const FILTERS = [
  // Synthwave sunset — hot pink to electric blue
  "radial-gradient(circle at 30% 70%, #ff00ff 0%, #ff1493 40%, #00bfff 100%)",
  // Neon grid — cyan to magenta
  "radial-gradient(circle at 70% 30%, #00ffff 0%, #ff00ff 70%, #8b00ff 100%)",
  // Retrowave purple — deep violet to hot orange
  "radial-gradient(circle at 50% 80%, #7b2ff7 0%, #ff2975 50%, #ff6b35 100%)",
  // Outrun — electric blue to neon pink
  "radial-gradient(circle at 20% 40%, #0ff0fc 0%, #bc13fe 50%, #ff2281 100%)",
];

interface DiscographyGridProps {
  songs: Song[];
}

export function DiscographyGrid({ songs }: DiscographyGridProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const unlockAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = 0.4;
    }
    // Play silent audio to unlock
    audioRef.current.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
    audioRef.current.play().then(() => {
      audioRef.current!.pause();
      setAudioUnlocked(true);
    }).catch(() => {});
  }, []);

  const startPreview = useCallback((song: Song, index: number) => {
    if (!audioRef.current || !audioUnlocked) return;
    const audio = audioRef.current;
    audio.src = getStreamURL(song.documentId);
    audio.play().then(() => setPlayingIndex(index)).catch(() => {});
  }, [audioUnlocked]);

  const stopPreview = useCallback(() => {
    setPlayingIndex(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  if (songs.length === 0) return null;

  return (
    <section id="discography">
      {/* Audio unlock prompt — fixed position, no layout shift */}
      {!audioUnlocked && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={unlockAudio}
            className="flex items-center gap-2 px-5 py-2.5 bg-black/80 dark:bg-white/90 text-white dark:text-black text-xs font-bold tracking-[0.1em] uppercase rounded-full backdrop-blur-md shadow-lg hover:bg-black dark:hover:bg-white transition-all cursor-pointer font-heading"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
            Enable Preview on Hover
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
        {songs.map((song, index) => {
          const imageUrl = getStrapiMedia(song.image?.url ?? song.artist?.image?.url ?? null);
          const isHovered = hoveredIndex === index;
          const isPlaying = playingIndex === index;

          return (
            <div
              key={song.documentId}
              className="relative overflow-hidden cursor-pointer group"
              style={{ paddingBottom: "100%" }}
              onMouseEnter={() => { setHoveredIndex(index); startPreview(song, index); }}
              onMouseLeave={() => { setHoveredIndex(null); stopPreview(); }}
            >
              <div className="absolute inset-0">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={song.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div
                    className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                    style={{ background: GRADIENTS[index % GRADIENTS.length] }}
                  />
                )}

                {/* Synth tint overlay — rotates through 4 styles */}
                <div
                  className="absolute inset-0 mix-blend-color opacity-50 dark:opacity-80 pointer-events-none"
                  style={{ background: FILTERS[index % FILTERS.length] }}
                />
                {/* Extra dark overlay in dark mode */}
                <div className="absolute inset-0 bg-black/0 dark:bg-black/30 pointer-events-none" />
                {/* Dark overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500" />

                {/* Playing equalizer indicator */}
                {isPlaying && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-end gap-0.75 h-4">
                      <span className="w-0.75 bg-white animate-[equalize_0.8s_ease-in-out_infinite] h-full" />
                      <span className="w-0.75 bg-white animate-[equalize_0.8s_ease-in-out_0.2s_infinite] h-3/4" />
                      <span className="w-0.75 bg-white animate-[equalize_0.8s_ease-in-out_0.4s_infinite] h-1/2" />
                    </div>
                  </div>
                )}

                {/* Center: Full Song button on hover */}
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Link
                    href={`/music/${song.documentId}`}
                    className="px-6 py-2.5 bg-white/90 hover:bg-white text-black text-xs font-bold tracking-[0.15em] uppercase transition-all duration-200 backdrop-blur-sm font-heading"
                  >
                    Full Song
                  </Link>
                </div>

                {/* Title overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <div
                    className={`transform transition-all duration-500 ${
                      isHovered
                        ? "translate-y-0 opacity-100"
                        : "translate-y-1 opacity-80"
                    }`}
                  >
                    <p className="text-white/70 text-xs tracking-wide drop-shadow-lg">
                      {song.artist?.name ?? "Unknown Artist"}
                    </p>
                    <h3 className="text-white text-sm md:text-base font-bold leading-tight drop-shadow-lg mt-0.5">
                      {song.title}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
