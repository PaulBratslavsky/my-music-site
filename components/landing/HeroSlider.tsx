"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia, getStreamURL } from "@/lib/strapi";
import type { Song } from "@/lib/types";

const FILTERS = [
  "radial-gradient(circle at 30% 60%, #ff00ff 0%, #ff1493 30%, #00bfff 70%, #0a0a2e 100%)",
  "radial-gradient(circle at 70% 40%, #7b2ff7 0%, #ff2975 40%, #0ff0fc 80%, #0a0a2e 100%)",
  "radial-gradient(circle at 50% 70%, #00ffff 0%, #bc13fe 40%, #ff2281 80%, #0a0a2e 100%)",
  "radial-gradient(circle at 20% 50%, #f43f5e 0%, #6366f1 50%, #0ff0fc 100%)",
];

interface HeroSliderProps {
  songs: Song[];
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function HeroSlider({ songs }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const slides = songs.slice(0, 4);
  const song = slides[current];

  const goTo = useCallback(
    (idx: number, dir: "next" | "prev") => {
      if (animating) return;
      setDirection(dir);
      setAnimating(true);
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setTimeout(() => {
        setCurrent(idx);
        setTimeout(() => setAnimating(false), 50);
      }, 400);
    },
    [animating]
  );

  const next = useCallback(() => {
    goTo((current + 1) % slides.length, "next");
  }, [current, slides.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length, "prev");
  }, [current, slides.length, goTo]);

  // Auto-advance (only when not playing)
  useEffect(() => {
    if (isPlaying) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, isPlaying]);

  // Audio setup
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = 0.8;
    }
    const audio = audioRef.current;
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
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !song) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (audio.src !== getStreamURL(song.documentId)) {
        audio.src = getStreamURL(song.documentId);
      }
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying, song]);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
  }, [duration]);

  if (slides.length === 0) return null;

  const imageUrl = getStrapiMedia(song?.image?.url ?? song?.artist?.image?.url ?? null);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background gradients */}
      {slides.map((_, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: FILTERS[i % FILTERS.length],
            opacity: i === current ? 1 : 0,
          }}
        />
      ))}

      {/* Song image as background (blurred) */}
      {imageUrl && (
        <div className="absolute inset-0 z-[1]">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover blur-sm scale-105 opacity-40"
            sizes="100vw"
            priority
          />
        </div>
      )}

      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none z-[2]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute inset-0 bg-black/40 z-[3]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        {/* Artist subtitle */}
        <p
          className={`text-white/70 text-lg md:text-xl italic mb-2 transition-all duration-500 ${
            animating
              ? direction === "next" ? "-translate-x-12 opacity-0" : "translate-x-12 opacity-0"
              : "translate-x-0 opacity-100"
          }`}
        >
          {song?.artist?.name ?? "Unknown Artist"}
        </p>

        {/* Song title */}
        <h1
          className={`text-white text-5xl sm:text-7xl md:text-[8rem] font-black uppercase tracking-tighter leading-none font-heading transition-all duration-500 delay-75 ${
            animating
              ? direction === "next" ? "-translate-x-16 opacity-0" : "translate-x-16 opacity-0"
              : "translate-x-0 opacity-100"
          }`}
        >
          {song?.title ?? ""}
        </h1>

        {/* Divider */}
        <div
          className={`w-12 h-[2px] bg-white/50 my-6 transition-all duration-500 delay-100 ${
            animating ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
          }`}
        />

        {/* CTA */}
        <div
          className={`transition-all duration-500 delay-150 ${
            animating ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          <Link
            href={`/music/${song?.documentId}`}
            className="inline-block px-10 py-3 bg-white text-black text-xs font-bold tracking-[0.2em] uppercase font-heading hover:bg-white/90 transition-colors"
          >
            Listen Now
          </Link>
        </div>

        {/* Inline player bar */}
        <div
          className={`mt-10 w-full max-w-2xl transition-all duration-500 delay-200 ${
            animating ? "translate-y-8 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          <div className="flex items-center gap-3 bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-lg border border-white/10 px-3 py-2">
            {/* Album art thumbnail */}
            <div className="size-12 shrink-0 relative overflow-hidden rounded bg-white/10">
              {imageUrl ? (
                <Image src={imageUrl} alt={song?.title ?? ""} fill className="object-cover" sizes="48px" />
              ) : (
                <div className="size-full bg-gradient-to-br from-player-accent to-pink-500" />
              )}
            </div>

            {/* Song info + progress */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold uppercase tracking-tight font-heading truncate">
                {song?.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  ref={progressRef}
                  className="flex-1 h-0.5 bg-white/20 rounded-full cursor-pointer relative"
                  onClick={seek}
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-player-accent rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-white/40 text-[10px] tabular-nums shrink-0">
                  {formatTime(currentTime)}/{duration > 0 ? formatTime(duration) : "--:--"}
                </span>
              </div>
              <p className="text-white/40 text-[10px] mt-0.5 truncate">
                {song?.artist?.name ?? "Unknown Artist"}
              </p>
            </div>

            {/* Transport */}
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={prev} className="text-white/50 hover:text-white p-1 transition-colors" aria-label="Previous">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
              </button>
              <button onClick={togglePlay} className="text-white hover:text-white/80 p-1 transition-colors" aria-label={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
              <button onClick={next} className="text-white/50 hover:text-white p-1 transition-colors" aria-label="Next">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Prev / Next side buttons */}
      <button
        onClick={prev}
        className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 z-20 text-white/40 hover:text-white text-xs font-bold tracking-[0.2em] uppercase transition-colors font-heading"
      >
        Prev
      </button>
      <button
        onClick={next}
        className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 z-20 text-white/40 hover:text-white text-xs font-bold tracking-[0.2em] uppercase transition-colors font-heading"
      >
        Next
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? "next" : "prev")}
            className={`h-[2px] rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-white" : "w-4 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
