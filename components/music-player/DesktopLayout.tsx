import Image from "next/image";
import { formatTime, getStrapiMedia } from "./api";
import { PlayIcon, PauseIcon, PrevIcon, NextIcon, RestartIcon, LoopIcon, VolumeHighIcon, VolumeMuteIcon, VolumeLowIcon } from "./icons";
import { SongRow, HeaderCell } from "./SongRow";
import type { PlayerState } from "./usePlayerState";
import type { LoopMode, AudioData } from "./types";

interface DesktopLayoutProps {
  player: PlayerState;
  sample?: () => AudioData | null;
}

export function DesktopLayout({ player, sample }: Readonly<DesktopLayoutProps>) {
  const {
    songs, currentSong, isPlaying, loopMode,
    currentTime, duration, durations, songLoading,
    volume, imageUrl, waveformContainerRef, lastScrolledRef,
    handlePlayPause, playPrev, playNext, restartSong,
    cycleLoopMode, setVolume, handleSongClick,
  } = player;

  return (
    <>
      {/* Player */}
      <div className="grid grid-cols-[180px_1fr] grid-rows-[auto_1fr] gap-x-5 gap-y-3 p-5 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shrink-0 transition-colors">
        {/* Album art */}
        <div className="row-span-2 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800 relative">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={currentSong?.image?.alternativeText ?? currentSong?.title ?? "Album art"}
              fill
              className="object-cover"
              sizes="180px"
            />
          ) : (
            <span className="text-2xl text-neutral-400 dark:text-neutral-500">&#9834;</span>
          )}
          {/* Neon blue→pink radial tint */}
          <div
            className="absolute inset-0 mix-blend-color opacity-50 dark:opacity-60 pointer-events-none"
            style={{ background: "radial-gradient(circle at 30% 70%, #3b82f6 0%, #ec4899 60%, #f43f5e 100%)" }}
          />
        </div>

        {/* Row 1: Controls + song info */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Play/Pause with radial effect */}
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <button
              onClick={handlePlayPause}
              disabled={songLoading}
              className="w-14 h-14 rounded-full border-2 border-player-accent text-player-accent flex items-center justify-center hover:bg-player-accent/10 transition-colors relative z-[1] disabled:opacity-50"
              aria-label={songLoading ? "Loading" : isPlaying ? "Pause" : "Play"}
            >
              {songLoading
                ? <span className="w-4 h-4 border-2 border-player-accent border-t-transparent rounded-full animate-spin" />
                : isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
          </div>

          {/* Song info */}
          <div className="min-w-0 flex-1">
            <p className="text-lg font-black uppercase tracking-tight truncate font-heading">{currentSong?.title ?? "Select a song"}</p>
            {currentSong?.artist?.name && (
              <p className="text-base text-player-accent truncate font-sans">by {currentSong.artist.name}</p>
            )}
            <p className="text-sm text-neutral-500 dark:text-neutral-400 tabular-nums font-sans">
              {formatTime(currentTime)}
              {duration > 0 && ` / ${formatTime(duration)}`}
            </p>
          </div>

          {/* Transport controls */}
          <div className="flex items-center gap-1 shrink-0">
            <ControlButton onClick={playPrev} label="Previous"><PrevIcon /></ControlButton>
            <ControlButton onClick={restartSong} label="Restart"><RestartIcon /></ControlButton>
            <ControlButton onClick={playNext} label="Next"><NextIcon /></ControlButton>
            <LoopButton loopMode={loopMode} onClick={cycleLoopMode} />
          </div>
        </div>

        {/* Row 2: Waveform + volume */}
        <div className="relative min-h-[120px]">
          <div ref={waveformContainerRef} className="w-full h-full" />
          {songLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="w-6 h-6 border-2 border-player-accent border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {/* Volume — bottom right of waveform */}
          <div className="absolute bottom-1 right-0 z-10">
            <VolumeControl volume={volume} onChange={setVolume} />
          </div>
        </div>
      </div>

      {/* Song List */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="grid grid-cols-[32px_44px_1fr_28px_1fr_64px_88px] gap-3 items-center px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 bg-neutral-200 dark:bg-neutral-900 z-10 transition-colors">
          <HeaderCell>#</HeaderCell>
          <span />
          <HeaderCell>Title</HeaderCell>
          <span />
          <HeaderCell>Artist</HeaderCell>
          <HeaderCell>Time</HeaderCell>
          <HeaderCell>Added</HeaderCell>
        </div>

        {songs.map((song, index) => {
          const isActive = currentSong?.documentId === song.documentId;
          const thumbUrl = getStrapiMedia(song.image?.url ?? null);
          const avatarUrl = getStrapiMedia(song.artist?.image?.url ?? null);

          return (
            <SongRow
              key={song.documentId}
              song={song}
              index={index}
              isActive={isActive}
              thumbUrl={thumbUrl}
              avatarUrl={avatarUrl}
              duration={durations[song.documentId]}
              onClick={() => handleSongClick(song)}
              scrollRef={lastScrolledRef}
            />
          );
        })}
      </div>
    </>
  );
}

/* ── Desktop-only sub-components ── */

function ControlButton({ onClick, label, children }: Readonly<{ onClick: () => void; label: string; children: React.ReactNode }>) {
  return (
    <button
      onClick={onClick}
      type="button"
      aria-label={label}
      className="w-10 h-10 rounded-full border-2 border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 flex items-center justify-center hover:border-player-accent hover:text-player-accent transition-colors outline-none focus:outline-none"
    >
      {children}
    </button>
  );
}

function LoopButton({ loopMode, onClick }: Readonly<{ loopMode: LoopMode; onClick: () => void }>) {
  let className = "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors relative outline-none focus:outline-none ";
  if (loopMode === "all") className += "border-player-accent bg-player-accent text-white hover:opacity-80";
  else if (loopMode === "one") className += "border-player-accent text-player-accent hover:bg-player-accent/10";
  else className += "border-neutral-300 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 hover:border-player-accent hover:text-player-accent";

  return (
    <button onClick={onClick} type="button" aria-label={`Loop: ${loopMode}`} className={className}>
      <LoopIcon />
      {loopMode === "one" && <span className="absolute -bottom-0.5 -right-0.5 text-[9px] font-bold leading-none">1</span>}
    </button>
  );
}

function VolumeControl({ volume, onChange }: Readonly<{ volume: number; onChange: (v: number) => void }>) {
  const VIcon = volume === 0 ? VolumeMuteIcon : volume < 0.5 ? VolumeLowIcon : VolumeHighIcon;

  return (
    <div className="group/vol flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
      <button
        type="button"
        aria-label={volume === 0 ? "Unmute" : "Mute"}
        onClick={() => onChange(volume === 0 ? 1 : 0)}
        className="text-neutral-400 dark:text-neutral-500 hover:text-player-accent transition-colors"
      >
        <VIcon size={12} />
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-16 h-0.5 appearance-none bg-neutral-300 dark:bg-neutral-700 rounded-full cursor-pointer accent-player-accent"
        aria-label="Volume"
      />
    </div>
  );
}
