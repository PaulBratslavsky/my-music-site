import * as THREE from "three";

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision mediump float;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_bass;
  uniform float u_mid;
  uniform float u_treble;
  uniform float u_volume;

  #define PI 3.14159265359

  // Hash functions for randomness
  float hash(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  float hash2(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Value noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash2(i);
    float b = hash2(i + vec2(1.0, 0.0));
    float c = hash2(i + vec2(0.0, 1.0));
    float d = hash2(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float t = u_time;

    // Deep dark magenta-black background
    vec3 col = mix(vec3(0.03, 0.01, 0.03), vec3(0.04, 0.01, 0.04), uv.y);

    // ── Vertical light columns ──
    // Many thin vertical bars with varying heights, driven by audio
    float numColumns = 80.0;
    for (float i = 0.0; i < 80.0; i++) {
      // Evenly distribute columns across width with slight random jitter
      float colX = (i + 0.5) / numColumns + (hash(i * 7.13) - 0.5) * 0.008;
      float colWidth = 0.001 + hash(i * 7.13) * 0.003;

      float dist = abs(uv.x - colX);
      if (dist > 0.03) continue;

      // Column height — audio-reactive with per-column variation
      float freqBand = hash(i * 3.71);
      float audioLevel = 0.0;
      if (freqBand < 0.33) audioLevel = u_bass;
      else if (freqBand < 0.66) audioLevel = u_mid;
      else audioLevel = u_treble;

      // Each column pulses at slightly different rate
      float pulse = 0.3 + 0.7 * audioLevel;
      float heightNoise = noise(vec2(i * 0.5, t * 0.1));
      float columnHeight = pulse * (0.3 + heightNoise * 0.7);

      // Column grows from the bottom edge
      float baseY = 0.0;
      float topY = columnHeight * 0.7;

      // Only draw if we're within the column's vertical range
      float inColumn = smoothstep(baseY - 0.02, baseY + 0.05, uv.y)
                      * smoothstep(topY + 0.02, topY - 0.05, uv.y);

      // Horizontal falloff — sharp core + soft glow
      float core = smoothstep(colWidth * 2.0, 0.0, dist);
      float glow = smoothstep(0.02, 0.0, dist);

      // Smooth shimmer along the column (slow movement, no flicker)
      float grain = noise(vec2(colX * 50.0, uv.y * 30.0 - t * 0.3 - i));
      grain = smoothstep(0.2, 0.7, grain);

      // Brightness varies along the column — brighter at base
      float yFade = 1.0 - smoothstep(baseY, topY, uv.y);
      float brightness = yFade * yFade;

      // Pink/magenta color with slight variation per column
      float hueShift = hash(i * 23.7) * 0.15;
      vec3 colColor = mix(
        vec3(1.0, 0.5, 0.7),
        vec3(0.925, 0.282, 0.6),
        hueShift
      );

      // Combine: core line + glow + grain texture
      float intensity = inColumn * (core * grain * 0.8 + glow * 0.15) * brightness;
      intensity *= 0.5 + audioLevel * 1.5;

      col += colColor * intensity;
    }

    // ── Bright hotspots at column bases ──
    for (float i = 0.0; i < 20.0; i++) {
      float hx = (i + 0.5) / 20.0;
      float hy = hash(i * 19.3 + 0.5) * 0.05;

      float freqBand = hash(i * 3.71 + 0.5);
      float audioLevel = 0.0;
      if (freqBand < 0.33) audioLevel = u_bass;
      else if (freqBand < 0.66) audioLevel = u_mid;
      else audioLevel = u_treble;

      vec2 hotspot = vec2(hx, hy);
      float d = length((uv - hotspot) * vec2(1.0, 2.0)); // squished vertically
      float hotGlow = smoothstep(0.06, 0.0, d) * audioLevel;

      // Slow pulsing brightness
      float hotPulse = 0.6 + 0.4 * sin(t * 0.5 + i * 1.7);
      col += vec3(1.0, 0.5, 0.7) * hotGlow * hotPulse * 1.5;
    }

    // ── Falling particle rain ──
    for (float i = 0.0; i < 40.0; i++) {
      float px = (i + 0.5) / 40.0 + (hash(i * 17.31) - 0.5) * 0.02;
      float speed = 0.3 + hash(i * 11.13) * 0.7;
      float py = fract(1.0 - t * speed * 0.05 - hash(i * 29.7));

      vec2 particle = vec2(px, py);
      float d = length((uv - particle) * vec2(1.0, 1.5));
      float dot = smoothstep(0.004, 0.0, d);

      // Faint trail above the particle
      float trail = 0.0;
      if (uv.y > py && uv.y < py + 0.04) {
        float trailDist = abs(uv.x - px);
        trail = smoothstep(0.002, 0.0, trailDist) * smoothstep(py + 0.04, py, uv.y);
      }

      float particleBrightness = (dot + trail * 0.3) * (0.3 + u_volume * 0.7);
      col += vec3(1.0, 0.6, 0.8) * particleBrightness * 0.5;
    }

    // ── Floating dust motes ──
    for (float i = 0.0; i < 12.0; i++) {
      float mx = hash(i * 41.1) + sin(t * 0.3 + i) * 0.05;
      float my = hash(i * 53.7) + cos(t * 0.2 + i * 1.3) * 0.05;
      vec2 mote = vec2(fract(mx), fract(my));
      float d = length(uv - mote);
      float glow = smoothstep(0.008, 0.0, d);
      col += vec3(0.9, 0.5, 0.7) * glow * 0.4;
    }

    // ── Global atmosphere ──
    // Faint vertical streaks across entire screen (very slow)
    float streaks = noise(vec2(uv.x * 100.0, t * 0.05));
    streaks = smoothstep(0.6, 0.9, streaks) * 0.02 * u_volume;
    col += vec3(0.8, 0.3, 0.5) * streaks;

    // Subtle overall glow in the center
    float centerGlow = smoothstep(0.5, 0.0, length(uv - vec2(0.5, 0.0)));
    col += vec3(0.08, 0.02, 0.06) * centerGlow * u_volume;

    // Very subtle vignette
    vec2 vigUV = uv * 2.0 - 1.0;
    float vig = 1.0 - dot(vigUV * 0.2, vigUV * 0.2);
    col *= clamp(vig, 0.0, 1.0);

    float alpha = 0.45 + u_volume * 0.25;
    gl_FragColor = vec4(col, alpha);
  }
`;

export const auroraColumnsPreset = {
  name: "aurora-columns",
  label: "Aurora",
  createMaterial: () =>
    new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2() },
        u_bass: { value: 0 },
        u_mid: { value: 0 },
        u_treble: { value: 0 },
        u_volume: { value: 0 },
      },
    }),
};
