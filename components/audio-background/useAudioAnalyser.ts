"use client";

import { useRef, useEffect, useCallback } from "react";

export interface AudioData {
  frequencyData: Uint8Array<ArrayBuffer>;
  timeDomainData: Uint8Array<ArrayBuffer>;
  bass: number;
  mid: number;
  treble: number;
  volume: number;
}

export function useAudioAnalyser(audioElement: HTMLAudioElement | null) {
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const dataRef = useRef<AudioData | null>(null);

  useEffect(() => {
    if (!audioElement || sourceRef.current) return;

    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;

    const source = ctx.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(ctx.destination);

    analyserRef.current = analyser;
    sourceRef.current = source;

    const bufferLength = analyser.frequencyBinCount;
    dataRef.current = {
      frequencyData: new Uint8Array(bufferLength),
      timeDomainData: new Uint8Array(bufferLength),
      bass: 0,
      mid: 0,
      treble: 0,
      volume: 0,
    };

    const resume = () => {
      if (ctx.state === "suspended") ctx.resume();
    };
    audioElement.addEventListener("play", resume);

    return () => {
      audioElement.removeEventListener("play", resume);
    };
  }, [audioElement]);

  const sample = useCallback((): AudioData | null => {
    const analyser = analyserRef.current;
    const data = dataRef.current;
    if (!analyser || !data) return null;

    analyser.getByteFrequencyData(data.frequencyData);
    analyser.getByteTimeDomainData(data.timeDomainData);

    const bins = data.frequencyData;
    const len = bins.length;
    const third = Math.floor(len / 3);

    let bassSum = 0,
      midSum = 0,
      trebleSum = 0;
    for (let i = 0; i < third; i++) bassSum += bins[i];
    for (let i = third; i < third * 2; i++) midSum += bins[i];
    for (let i = third * 2; i < len; i++) trebleSum += bins[i];

    data.bass = bassSum / (third * 255);
    data.mid = midSum / (third * 255);
    data.treble = trebleSum / ((len - third * 2) * 255);

    let rms = 0;
    for (let i = 0; i < len; i++) {
      const v = (data.timeDomainData[i] - 128) / 128;
      rms += v * v;
    }
    data.volume = Math.sqrt(rms / len);

    return data;
  }, []);

  return { sample };
}
