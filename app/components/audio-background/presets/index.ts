import type * as THREE from "three";
import { auroraColumnsPreset } from "./aurora-columns";
import { radialPreset } from "./radial";

export interface PresetFactory {
  name: string;
  label: string;
  createMaterial: () => THREE.ShaderMaterial;
}

export const presets: PresetFactory[] = [
  auroraColumnsPreset,
  radialPreset,
];
