import Image from "next/image";
import { AlbumRadialEffect } from "../AlbumRadialEffect";
import { formatTime } from "./api";
import { PlayIcon, PauseIcon, PrevIcon, NextIcon, ShuffleIcon, LoopIcon } from "./icons";
import type { PlayerState } from "./usePlayerState";
import type { AudioData } from "./types";

interface MobileLayoutProps {
  player: PlayerState;
  sample?: () => AudioData | null;
}

export function MobileLayout({ player, sample }: MobileLayoutProps) {
  const {
    imageUrl, currentSong, songLoading, isPlaying, loopMode,
    currentTime, duration, swipeX, waveformContainerRef,
    handleTouchStart, handleTouchMove, handleTouchEnd,
    cycleLoopMode, playPrev, playNext, handlePlayPause,
  } = player;

  return (
    <div className="flex flex-col h-full">
      {/* Album art — fills most of the screen */}
      <div className="flex-1 min-h-0 px-5 pt-5 relative z-20">
        <div
          className="w-full h-full transition-transform duration-200 ease-out"
          style={{ transform: `translateX(${swipeX}px)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative w-full h-full rounded-3xl overflow-hidden bg-neutral-200 dark:bg-neutral-800">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={currentSong?.image?.alternativeText ?? currentSong?.title ?? "Album art"}
                fill
                className="object-cover"
                sizes="(max-width: 767px) 100vw, 180px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl text-neutral-400 dark:text-neutral-500">&#9834;</span>
              </div>
            )}
            {/* Neon blue→pink radial tint */}
            <div
              className="absolute inset-0 mix-blend-color opacity-50 dark:opacity-60 pointer-events-none"
              style={{ background: "radial-gradient(circle at 30% 70%, #3b82f6 0%, #ec4899 60%, #f43f5e 100%)" }}
            />
            {/* Gradient overlay with song info */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20 pb-6 px-6 text-center">
              <p className="text-2xl font-bold truncate text-white">{currentSong?.title ?? "Select a song"}</p>
              {currentSong?.artist?.name && (
                <p className="text-sm text-neutral-300 mt-1">{currentSong.artist.name}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom controls area */}
      <div className="shrink-0 px-6 pt-5 pb-8 flex flex-col gap-4 relative z-20">
        {/* Waveform */}
        <div className="relative w-full min-h-[50px]">
          <div ref={waveformContainerRef} className="w-full h-full" />
          {songLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-6 h-6 border-2 border-player-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Timestamps */}
        <div className="flex justify-between">
          <span className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">{formatTime(currentTime)}</span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
            {duration > 0 ? formatTime(duration) : "--:--"}
          </span>
        </div>

        {/* Transport controls */}
        <div className="flex items-center justify-between px-2 mt-2">
          <button onClick={cycleLoopMode} type="button" aria-label="Shuffle" className="text-neutral-400 dark:text-neutral-500 p-2 hover:text-black dark:hover:text-white transition-colors">
            <ShuffleIcon size={22} />
          </button>
          <button onClick={playPrev} type="button" aria-label="Previous" className="text-neutral-400 dark:text-neutral-500 p-2 hover:text-black dark:hover:text-white transition-colors">
            <PrevIcon size={22} />
          </button>
          {/* Play/Pause — large filled circle */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            {sample && <AlbumRadialEffect sample={sample} />}
            <button
              onClick={handlePlayPause}
              disabled={songLoading}
              className="w-16 h-16 rounded-full bg-player-accent text-white flex items-center justify-center hover:opacity-80 transition-colors relative z-[1] disabled:opacity-50"
              aria-label={songLoading ? "Loading" : isPlaying ? "Pause" : "Play"}
            >
              {songLoading
                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : isPlaying ? <PauseIcon size={28} /> : <PlayIcon size={28} />}
            </button>
          </div>
          <button onClick={playNext} type="button" aria-label="Next" className="text-neutral-400 dark:text-neutral-500 p-2 hover:text-black dark:hover:text-white transition-colors">
            <NextIcon size={22} />
          </button>
          <button
            onClick={cycleLoopMode}
            type="button"
            aria-label={`Loop: ${loopMode}`}
            className={`relative p-2 transition-colors ${loopMode !== "none" ? "text-player-accent" : "text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white"}`}
          >
            <LoopIcon size={22} />
            {loopMode === "one" && <span className="absolute top-0 right-0 text-[8px] font-bold leading-none">1</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
