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

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * vnoise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float t = u_time * 0.3;

    // Perspective-like terrain UV
    vec2 terrainUV = vec2(uv.x * 4.0 - 2.0, (1.0 - uv.y) * 3.0 + 1.0);
    terrainUV.y *= 1.0 / (uv.y + 0.3); // fake perspective

    // Scrolling terrain
    terrainUV.y += t * 2.0;

    // Height from noise + audio
    float height = fbm(terrainUV + u_bass * 0.5);
    height += vnoise(terrainUV * 3.0 + t) * u_mid * 0.3;

    // Grid lines
    vec2 grid = abs(fract(terrainUV * 2.0) - 0.5);
    float gridLine = min(grid.x, grid.y);
    float line = 1.0 - smoothstep(0.0, 0.05, gridLine);

    // Base color
    vec3 pink = vec3(0.925, 0.282, 0.6);
    vec3 purple = vec3(0.3, 0.05, 0.4);
    vec3 dark = vec3(0.01, 0.01, 0.03);

    // Depth fog
    float depth = uv.y;
    vec3 col = mix(dark, purple, height * depth);

    // Grid overlay
    col += pink * line * 0.4 * depth;

    // Audio-reactive glow at horizon
    float horizonGlow = exp(-abs(uv.y - 0.5) * 8.0);
    col += pink * horizonGlow * u_volume * 0.6;

    // Treble sparkles
    float sparkle = step(0.995, hash(uv * u_resolution + floor(t * 20.0)));
    col += vec3(1.0) * sparkle * u_treble * 0.8;

    // Bass pulse from bottom
    float bottomPulse = exp(-uv.y * 4.0) * u_bass * 0.3;
    col += pink * bottomPulse;

    // Vignette
    float vig = 1.0 - length(uv - 0.5) * 0.7;
    col *= vig;

    float alpha = 0.25 + u_volume * 0.5;

    gl_FragColor = vec4(col, alpha);
  }
`;

export const terrainPreset = {
  name: "terrain",
  label: "Terrain",
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
