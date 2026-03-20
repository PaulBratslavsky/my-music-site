import { useState, useRef, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import { getStreamURL } from "./api";

interface UseWaveSurferOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  documentId: string | undefined;
  layoutKey: number;
  shouldAutoPlay: React.MutableRefObject<boolean>;
  isPlayingRef: React.MutableRefObject<boolean>;
  onPlay: () => void;
  onPause: () => void;
  onTimeUpdate: (time: number) => void;
  onReady: (duration: number) => void;
  onFinish: () => void;
}

export function useWaveSurfer({
  containerRef,
  audioRef,
  documentId,
  layoutKey,
  shouldAutoPlay,
  isPlayingRef,
  onPlay,
  onPause,
  onTimeUpdate,
  onReady,
  onFinish,
}: UseWaveSurferOptions) {
  const [songLoading, setSongLoading] = useState(false);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!documentId || !audioRef.current || !containerRef.current) return;

    const audio = audioRef.current;
    const autoPlay = shouldAutoPlay.current || isPlayingRef.current;
    shouldAutoPlay.current = false;

    // Destroy previous instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }

    setSongLoading(true);

    const ws = WaveSurfer.create({
      container: containerRef.current,
      height: 120,
      waveColor: "rgb(236 72 153)",
      progressColor: "rgb(164 162 161)",
      barWidth: 4,
      barGap: 1,
      barRadius: 1,
      barMinHeight: 1,
      cursorWidth: 0,
      dragToSeek: true,
      barAlign: "bottom" as const,
      url: getStreamURL(documentId),
      media: audio,
    });

    ws.on("play", onPlay);
    ws.on("pause", onPause);
    ws.on("timeupdate", onTimeUpdate);
    ws.on("ready", () => {
      setSongLoading(false);
      onReady(ws.getDuration());
      if (autoPlay) {
        ws.play().catch(() => {});
      }
    });
    ws.on("finish", onFinish);

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
      wavesurferRef.current = null;
    };
  }, [documentId, layoutKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return { wavesurferRef, songLoading };
}
