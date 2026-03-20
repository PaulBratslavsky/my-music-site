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
  #define TWO_PI 6.28318530718
  #define NUM_BARS 64.0

  float hash(float n) {
    return fract(sin(n) * 43758.5453);
  }

  // Rounded rectangle SDF for bar shapes
  float roundedBox(vec2 p, vec2 size, float radius) {
    vec2 d = abs(p) - size + radius;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - radius;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float aspect = u_resolution.x / u_resolution.y;

    // Center coordinates, aspect-corrected
    vec2 center = vec2(0.5, 0.5);
    vec2 p = uv - center;
    p.x *= aspect;

    float t = u_time;

    // Transparent background — only effect elements will be visible
    vec3 col = vec3(0.0);
    float totalAlpha = 0.0;

    // Polar coordinates
    float dist = length(p);
    float angle = atan(p.y, p.x); // -PI to PI

    // ── Ring of radial bars ──
    float ringRadius = 0.25;
    float barMaxLen = 0.18;

    // Determine which bar segment we're in
    float barAngle = TWO_PI / NUM_BARS;
    float barIndex = floor((angle + PI) / barAngle);
    float barCenterAngle = barIndex * barAngle - PI + barAngle * 0.5;

    // Angular distance from bar center
    float angleDiff = abs(angle - barCenterAngle);
    // Handle wrap-around
    angleDiff = min(angleDiff, TWO_PI - angleDiff);

    // Bar width in angular terms (thin bars with gaps)
    float barHalfWidth = barAngle * 0.35;

    // Audio level for this bar — simulate frequency distribution around the ring
    float freq = barIndex / NUM_BARS;
    float audioLevel = 0.0;
    if (freq < 0.33) {
      audioLevel = u_bass * (0.6 + 0.4 * sin(barIndex * 0.7 + t * 1.5));
    } else if (freq < 0.66) {
      audioLevel = u_mid * (0.6 + 0.4 * sin(barIndex * 1.1 + t * 2.0));
    } else {
      audioLevel = u_treble * (0.6 + 0.4 * sin(barIndex * 1.5 + t * 2.5));
    }

    float barLength = 0.02 + audioLevel * barMaxLen;

    // Check if pixel is within a bar
    float radialDist = dist - ringRadius;
    float inBar = 0.0;

    if (radialDist > -0.005 && radialDist < barLength && angleDiff < barHalfWidth) {
      // Smooth edges
      float edgeSmooth = smoothstep(barHalfWidth, barHalfWidth * 0.6, angleDiff);
      float tipSmooth = smoothstep(barLength, barLength - 0.01, radialDist);
      float baseSmooth = smoothstep(-0.005, 0.005, radialDist);
      inBar = edgeSmooth * tipSmooth * baseSmooth;

      // Bar color — gradient from deep pink at base to bright pink at tip
      float barProgress = radialDist / barLength;
      vec3 barColor = mix(
        vec3(0.7, 0.1, 0.4),   // deep pink base
        vec3(1.0, 0.5, 0.7),   // bright pink tip
        barProgress
      );

      // Brighter when audio is louder
      barColor *= 0.8 + audioLevel * 1.2;

      col += barColor * inBar;
      totalAlpha = max(totalAlpha, inBar);
    }

    // ── Inner ring glow (pink/magenta) ──
    float ringDist = abs(dist - ringRadius);
    float ringGlow = smoothstep(0.015, 0.0, ringDist);
    float ringOuter = smoothstep(0.04, 0.0, ringDist);

    vec3 ringColor = mix(vec3(0.925, 0.282, 0.6), vec3(0.8, 0.2, 0.5), 0.5 + 0.5 * sin(angle * 2.0 + t));
    col += ringColor * ringGlow * 0.8;
    col += ringColor * ringOuter * 0.1;
    totalAlpha = max(totalAlpha, ringGlow * 0.8);
    totalAlpha = max(totalAlpha, ringOuter * 0.1);

    // ── Inner circle dot ring (small dots along the inner edge) ──
    float dotRingRadius = ringRadius - 0.01;
    float numDots = 48.0;
    float dotAngle = TWO_PI / numDots;
    float dotIndex = floor((angle + PI) / dotAngle);
    float dotCenterAngle = dotIndex * dotAngle - PI + dotAngle * 0.5;
    vec2 dotPos = dotRingRadius * vec2(cos(dotCenterAngle), sin(dotCenterAngle));
    float dotDist = length(p - dotPos);
    float dotBright = smoothstep(0.005, 0.002, dotDist);

    // Dots pulse with audio
    float dotAudio = 0.0;
    float dotFreq = dotIndex / numDots;
    if (dotFreq < 0.33) dotAudio = u_bass;
    else if (dotFreq < 0.66) dotAudio = u_mid;
    else dotAudio = u_treble;

    vec3 dotColor = mix(vec3(0.8, 0.2, 0.5), vec3(1.0, 0.5, 0.7), dotAudio);
    float dotVal = dotBright * (0.4 + dotAudio * 0.6);
    col += dotColor * dotVal;
    totalAlpha = max(totalAlpha, dotVal);

    // ── Neon glow behind the ring ──
    float behindGlow = smoothstep(0.25, 0.0, dist) * smoothstep(0.03, 0.10, dist);
    vec3 glowColor = mix(vec3(0.4, 0.05, 0.2), vec3(0.6, 0.1, 0.3), 0.5 + 0.5 * sin(t * 0.5));
    float glowVal = behindGlow * (0.15 + u_volume * 0.25);
    col += glowColor * glowVal;
    totalAlpha = max(totalAlpha, glowVal);

    // ── Floating particles ──
    for (float i = 0.0; i < 8.0; i++) {
      float mx = hash(i * 41.1 + 7.0) * aspect * 0.8 - aspect * 0.4;
      float my = hash(i * 53.7 + 3.0) * 0.8 - 0.4;
      mx += sin(t * 0.2 + i * 2.0) * 0.02;
      my += cos(t * 0.15 + i * 1.7) * 0.02;
      float d = length(p - vec2(mx, my));
      float mote = smoothstep(0.006, 0.0, d);
      col += vec3(0.9, 0.4, 0.6) * mote * 0.5;
      totalAlpha = max(totalAlpha, mote * 0.5);
    }

    gl_FragColor = vec4(col, totalAlpha);
  }
`;

export const radialPreset = {
  name: "radial",
  label: "Radial",
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
