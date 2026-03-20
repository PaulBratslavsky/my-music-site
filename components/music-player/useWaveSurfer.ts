import { useState, useRef, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import { getStreamURL } from "./api";

interface UseWaveSurferOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  documentId: string | undefined;
  peaks: number[] | null | undefined;
  duration: number | null | undefined;
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
  peaks,
  duration: songDuration,
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

    // Set the audio source for streaming playback
    audio.src = getStreamURL(documentId);

    const hasPeaks = peaks && peaks.length > 0;

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
      // Use peaks + duration if available — avoids downloading the full audio for waveform
      peaks: hasPeaks ? [peaks] : undefined,
      duration: hasPeaks && songDuration ? songDuration : undefined,
      // Only fetch audio for waveform if no peaks data
      url: hasPeaks ? undefined : getStreamURL(documentId),
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
