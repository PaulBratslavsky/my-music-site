import { useState, useRef, useCallback, useEffect } from "react";
import { fetchSongs, getStrapiMedia, getStreamURL } from "./api";
import { useSwipe } from "./useSwipe";
import { useWaveSurfer } from "./useWaveSurfer";
import type { Song, LoopMode, MusicPlayerProps } from "./types";

export function usePlayerState({ onAudioElement, onSongChange }: Pick<MusicPlayerProps, "onAudioElement" | "onSongChange">) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopMode, setLoopMode] = useState<LoopMode>("one");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [volume, setVolumeState] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [layoutKey, setLayoutKey] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const waveformContainerRef = useRef<HTMLDivElement>(null);
  const loopModeRef = useRef<LoopMode>(loopMode);
  const onEndedRef = useRef<() => void>(() => {});
  const isPlayingRef = useRef(false);
  const shouldAutoPlayRef = useRef(false);
  const lastScrolledRef = useRef<string | null>(null);

  // ── Data fetching ──

  useEffect(() => {
    fetchSongs().then((data) => {
      setSongs(data);
      const params = new URLSearchParams(window.location.search);
      const songParam = params.get("song");
      const autoplay = params.get("autoplay");
      const initial = (songParam && data.find((s) => s.documentId === songParam)) || data[0];
      if (initial) {
        setCurrentSong(initial);
        if (songParam && autoplay !== "false") {
          shouldAutoPlayRef.current = true;
        }
      }
      setLoading(false);
    });
  }, []);

  // Preload durations for song list
  useEffect(() => {
    songs.forEach((song) => {
      if (durations[song.documentId]) return;
      const audio = new Audio();
      audio.preload = "metadata";
      audio.addEventListener("loadedmetadata", () => {
        setDurations((prev) => ({ ...prev, [song.documentId]: audio.duration }));
      });
      audio.src = getStreamURL(song.documentId);
    });
  }, [songs]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync song to URL ──

  useEffect(() => {
    if (!currentSong) return;
    const url = new URL(window.location.href);
    url.searchParams.set("song", currentSong.documentId);
    window.history.replaceState(null, "", url.toString());
  }, [currentSong]);

  // ── Notify parent of song change ──

  useEffect(() => {
    onSongChange?.(currentSong);
  }, [currentSong, onSongChange]);

  // ── Ref syncs ──

  useEffect(() => { loopModeRef.current = loopMode; }, [loopMode]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  // ── WaveSurfer ──

  const { wavesurferRef, songLoading } = useWaveSurfer({
    containerRef: waveformContainerRef,
    audioRef,
    documentId: currentSong?.documentId,
    layoutKey,
    shouldAutoPlay: shouldAutoPlayRef,
    isPlayingRef,
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
    onTimeUpdate: (time) => setCurrentTime(time),
    onReady: (dur) => setDuration(dur),
    onFinish: () => onEndedRef.current(),
  });

  // ── Playback controls ──

  const playNext = useCallback(() => {
    if (!currentSong || songs.length === 0) return;
    const idx = songs.findIndex((s) => s.documentId === currentSong.documentId);
    shouldAutoPlayRef.current = shouldAutoPlayRef.current || isPlayingRef.current;
    if (idx < songs.length - 1) {
      setCurrentSong(songs[idx + 1]);
    } else if (loopModeRef.current === "all") {
      setCurrentSong(songs[0]);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [currentSong, songs]);

  const playPrev = useCallback(() => {
    if (!currentSong || songs.length === 0) return;
    shouldAutoPlayRef.current = shouldAutoPlayRef.current || isPlayingRef.current;
    const idx = songs.findIndex((s) => s.documentId === currentSong.documentId);
    if (idx > 0) {
      setCurrentSong(songs[idx - 1]);
    } else if (loopModeRef.current === "all") {
      setCurrentSong(songs[songs.length - 1]);
    }
  }, [currentSong, songs]);

  const restartSong = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const cycleLoopMode = useCallback(() => {
    setLoopMode((prev) => (prev === "one" ? "none" : prev === "none" ? "all" : "one"));
  }, []);

  const handlePlayPause = useCallback(() => {
    wavesurferRef.current?.playPause();
  }, [wavesurferRef]);

  const handleSongClick = useCallback(
    (song: Song) => {
      if (currentSong?.documentId === song.documentId) {
        handlePlayPause();
      } else {
        shouldAutoPlayRef.current = true;
        setCurrentSong(song);
      }
    },
    [currentSong, handlePlayPause]
  );

  // Wire ended handler — force auto-play since WaveSurfer fires pause before finish
  useEffect(() => {
    onEndedRef.current = () => {
      if (loopModeRef.current === "one") {
        restartSong();
      } else {
        shouldAutoPlayRef.current = true;
        playNext();
      }
    };
  }, [restartSong, playNext]);

  // ── Swipe (mobile) ──

  const { swipeX, handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipe(playNext, playPrev);

  // ── Viewport detection ──

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      setLayoutKey((k) => k + 1);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ── Audio ref callback ──

  const audioRefCallback = useCallback(
    (el: HTMLAudioElement | null) => {
      (audioRef as React.RefObject<HTMLAudioElement | null>).current = el;
      onAudioElement?.(el);
    },
    [onAudioElement]
  );

  // ── Derived values ──

  const imageUrl = getStrapiMedia(currentSong?.image?.url ?? null);

  return {
    // State
    songs, loading, currentSong, isPlaying, loopMode,
    currentTime, duration, durations, songLoading,
    volume, isMobile, imageUrl, swipeX,
    // Refs
    waveformContainerRef, audioRefCallback, lastScrolledRef,
    // Actions
    playNext, playPrev, restartSong, cycleLoopMode, setVolume,
    handlePlayPause, handleSongClick,
    handleTouchStart, handleTouchMove, handleTouchEnd,
  };
}

export type PlayerState = ReturnType<typeof usePlayerState>;
