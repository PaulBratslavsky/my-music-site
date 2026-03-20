"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import type { AudioData } from "./useAudioAnalyser";
import { auroraColumnsPreset } from "./presets/aurora-columns";

interface Props {
  sample: () => AudioData | null;
}

export function AudioBackground({ sample }: Readonly<Props>) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(1);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = auroraColumnsPreset.createMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      if (material.uniforms.u_resolution) {
        material.uniforms.u_resolution.value.set(w, h);
      }
    };
    resize();
    window.addEventListener("resize", resize);

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
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [sample]);

  return <div ref={containerRef} className="fixed inset-0 z-10 pointer-events-none flex items-center justify-center opacity-30" />;
}
