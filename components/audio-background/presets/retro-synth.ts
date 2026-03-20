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

  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float aspect = u_resolution.x / u_resolution.y;
    float t = u_time;

    // Warm dark base — deep magenta-black
    vec3 col = mix(vec3(0.03, 0.01, 0.03), vec3(0.06, 0.01, 0.06), uv.y);

    // ── Oscilloscope waveform (center) ──
    float scopeY = 0.5;
    // Use aspect-corrected x so wave density is consistent on wide screens
    float wx = uv.x * aspect;
    float waveFreq = 4.0 + u_mid * 8.0;
    float waveAmp = 0.06 + u_bass * 0.12;
    float wave2Freq = 12.0 + u_treble * 16.0;
    float wave2Amp = 0.02 + u_treble * 0.04;

    // Composite waveform — fundamental + harmonic
    float wave = sin(wx * waveFreq * PI + t * 3.0) * waveAmp
               + sin(wx * wave2Freq * PI + t * 5.0) * wave2Amp;
    float scopeDist = abs(uv.y - scopeY - wave);

    // Hot pink phosphor glow (matching player theme)
    vec3 phosphor = vec3(0.925, 0.282, 0.6);
    float scopeLine = smoothstep(0.012 + u_volume * 0.005, 0.0, scopeDist);
    float scopeGlow = smoothstep(0.12 + u_volume * 0.06, 0.0, scopeDist);
    col += phosphor * scopeLine * (0.9 + u_volume * 0.5);
    col += phosphor * scopeGlow * 0.2;

    // ── VU meter bars (bottom) ──
    float barRegionTop = 0.22;
    float barRegionBot = 0.04;
    if (uv.y < barRegionTop && uv.y > barRegionBot) {
      float barUV = (uv.y - barRegionBot) / (barRegionTop - barRegionBot);
      float numBars = 64.0;
      float barIndex = floor(uv.x * numBars);
      float barCenter = (barIndex + 0.5) / numBars;
      float barWidth = 0.6 / numBars;
      float inBar = smoothstep(barWidth, barWidth * 0.5, abs(uv.x - barCenter));

      // Each bar gets a slightly different "frequency" level with a base minimum
      float freq = barIndex / numBars;
      float level = 0.0;
      if (freq < 0.33) level = 0.15 + u_bass * 0.85 * (0.6 + 0.4 * sin(barIndex * 0.5 + t));
      else if (freq < 0.66) level = 0.1 + u_mid * 0.9 * (0.6 + 0.4 * sin(barIndex * 0.8 + t * 1.5));
      else level = 0.08 + u_treble * 0.92 * (0.6 + 0.4 * sin(barIndex * 1.2 + t * 2.0));

      float barFill = step(barUV, level);

      // Color gradient: deep pink → hot pink → white-pink
      vec3 barCol = mix(vec3(0.6, 0.1, 0.3), vec3(0.925, 0.282, 0.6), barUV);
      barCol = mix(barCol, vec3(1.0, 0.6, 0.8), smoothstep(0.7, 0.95, barUV));

      col += barCol * inBar * barFill * 0.7;

      // Faint bar outlines even when empty
      col += vec3(0.06, 0.02, 0.04) * inBar * 0.3;
    }

    // ── Horizontal frequency bands (top area) ──
    float bandRegionBot = 0.78;
    if (uv.y > bandRegionBot) {
      float bandUV = (uv.y - bandRegionBot) / (1.0 - bandRegionBot);

      // Three analog-style horizontal bands
      vec3 amber = vec3(0.925, 0.282, 0.6);

      float band1Y = 0.25;
      float band1Val = 0.2 + u_bass * 0.8 * (0.5 + 0.5 * sin(uv.x * aspect * 6.0 + t * 2.0));
      float band1 = smoothstep(0.06, 0.0, abs(bandUV - band1Y)) * band1Val;

      float band2Y = 0.5;
      float band2Val = 0.15 + u_mid * 0.85 * (0.5 + 0.5 * sin(uv.x * aspect * 10.0 - t * 2.5));
      float band2 = smoothstep(0.06, 0.0, abs(bandUV - band2Y)) * band2Val;

      float band3Y = 0.75;
      float band3Val = 0.1 + u_treble * 0.9 * (0.5 + 0.5 * sin(uv.x * aspect * 14.0 + t * 3.0));
      float band3 = smoothstep(0.06, 0.0, abs(bandUV - band3Y)) * band3Val;

      col += amber * (band1 + band2 + band3) * 0.5;
    }

    // ── CRT effects ──
    // Scanlines
    float scanline = sin(gl_FragCoord.y * 1.5) * 0.5 + 0.5;
    col *= 0.85 + 0.15 * scanline;

    // Phosphor dot pattern (subtle RGB subpixel simulation)
    float dotX = mod(gl_FragCoord.x, 3.0);
    vec3 dotMask = vec3(
      smoothstep(1.0, 0.0, abs(dotX - 0.5)),
      smoothstep(1.0, 0.0, abs(dotX - 1.5)),
      smoothstep(1.0, 0.0, abs(dotX - 2.5))
    );
    col *= 0.7 + 0.3 * dotMask;

    // Subtle vignette — just darken corners slightly
    vec2 vigUV = uv * 2.0 - 1.0;
    float vig = 1.0 - dot(vigUV * 0.25, vigUV * 0.25);
    vig = clamp(vig, 0.0, 1.0);
    col *= vig;

    // Analog noise / film grain
    float grain = (rand(uv + t) - 0.5) * 0.06;
    col += grain;

    // Warm color tint — slight pink push
    col.r *= 1.1;
    col.g *= 0.85;

    float alpha = 0.3 + u_volume * 0.55;
    gl_FragColor = vec4(col, alpha);
  }
`;

export const retroSynthPreset = {
  name: "retro-synth",
  label: "Retro",
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
