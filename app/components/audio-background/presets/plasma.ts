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

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float t = u_time * 0.4;

    // Plasma interference pattern
    float v1 = sin(uv.x * 10.0 + t + u_bass * 4.0);
    float v2 = sin(uv.y * 8.0 - t * 1.3 + u_mid * 3.0);
    float v3 = sin((uv.x + uv.y) * 6.0 + t * 0.7);
    float v4 = sin(length(uv - 0.5) * 12.0 - t * 2.0 + u_treble * 5.0);

    float plasma = (v1 + v2 + v3 + v4) * 0.25;

    // Color mapping — pink/purple/dark theme
    vec3 col;
    col.r = sin(plasma * 3.14159 + 0.0) * 0.5 + 0.5;
    col.g = sin(plasma * 3.14159 + 2.094) * 0.5 + 0.5;
    col.b = sin(plasma * 3.14159 + 4.189) * 0.5 + 0.5;

    // Shift toward pink/magenta palette
    vec3 pink = vec3(0.925, 0.282, 0.6);
    vec3 purple = vec3(0.4, 0.1, 0.6);
    vec3 dark = vec3(0.02, 0.02, 0.05);
    col = mix(dark, mix(purple, pink, col.r), col.g * 0.6);

    // Volume-driven intensity
    col *= 0.3 + u_volume * 0.8;

    // Bass pulse — radial wave
    float dist = length(uv - 0.5);
    float bassPulse = sin(dist * 20.0 - t * 8.0) * u_bass * 0.15;
    col += pink * max(bassPulse, 0.0);

    // Vignette
    float vig = 1.0 - dist * 0.8;
    col *= vig;

    float alpha = 0.2 + u_volume * 0.5;

    gl_FragColor = vec4(col, alpha);
  }
`;

export const plasmaPreset = {
  name: "plasma",
  label: "Plasma",
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
