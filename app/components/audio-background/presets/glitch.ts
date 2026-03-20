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

  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = rand(i);
    float b = rand(i + vec2(1.0, 0.0));
    float c = rand(i + vec2(0.0, 1.0));
    float d = rand(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float t = u_time;

    // Dark base gradient
    vec3 col = mix(vec3(0.02, 0.02, 0.04), vec3(0.06, 0.01, 0.06), uv.y);

    // Block glitch displacement — volume-driven
    float blockY = floor(uv.y * 25.0) / 25.0;
    float blockRand = rand(vec2(blockY, floor(t * 10.0)));
    float blockThreshold = 1.0 - u_volume * 0.9;
    float displacement = 0.0;
    if (blockRand > blockThreshold) {
      displacement = (rand(vec2(blockY, t)) - 0.5) * 0.15 * u_bass;
    }
    vec2 glitchUV = uv + vec2(displacement, 0.0);

    // RGB split — bass-driven chromatic aberration
    float rgbShift = u_bass * 0.025;
    float r = noise(glitchUV * 8.0 + vec2(rgbShift, t * 0.3));
    float g = noise(glitchUV * 8.0 + vec2(0.0, t * 0.3));
    float b = noise(glitchUV * 8.0 + vec2(-rgbShift, t * 0.3));
    col += vec3(r, g, b) * 0.08;

    // Pink accent pulse — mid-driven
    vec3 pink = vec3(0.925, 0.282, 0.6);
    float pulse = sin(uv.y * 12.0 + t * 3.0) * 0.5 + 0.5;
    col += pink * u_mid * 0.35 * pulse;

    // Flowing energy lines
    float line1 = smoothstep(0.0, 0.003, abs(sin(uv.y * 40.0 + t * 2.0 + u_bass * 5.0) * 0.02));
    col += pink * (1.0 - line1) * u_volume * 0.4;

    // Scanlines
    float scanline = sin(uv.y * u_resolution.y * 0.5 + t * 5.0) * 0.5 + 0.5;
    col *= 0.92 + 0.08 * scanline;

    // Static noise — treble-driven
    float staticNoise = rand(uv * u_resolution + t * 100.0) * u_treble * 0.2;
    col += staticNoise;

    // Horizontal glitch lines
    float lineGlitch = step(0.97, rand(vec2(floor(uv.y * 50.0), floor(t * 12.0))));
    col = mix(col, pink, lineGlitch * u_volume * 0.7);

    // Vignette
    float vig = 1.0 - length(uv - 0.5) * 0.9;
    col *= vig;

    // Alpha — subtle when quiet, stronger on beats
    float alpha = 0.25 + u_volume * 0.6;

    gl_FragColor = vec4(col, alpha);
  }
`;

export const glitchPreset = {
  name: "glitch",
  label: "Glitch",
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
