"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import type { AudioData } from "./audio-background/useAudioAnalyser";
import { radialPreset } from "./audio-background/presets/radial";

interface Props {
  sample: () => AudioData | null;
}

export function AlbumRadialEffect({ sample }: Readonly<Props>) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, premultipliedAlpha: false, antialias: false });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(1);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = radialPreset.createMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      if (material.uniforms.u_resolution) {
        material.uniforms.u_resolution.value.set(w, h);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const audioData = sample();
      material.uniforms.u_time.value = clock.getElapsedTime();

      if (audioData) {
        material.uniforms.u_bass.value = audioData.bass;
        material.uniforms.u_mid.value = audioData.mid;
        material.uniforms.u_treble.value = audioData.treble;
        material.uniforms.u_volume.value = audioData.volume;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [sample]);

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none" />;
}
