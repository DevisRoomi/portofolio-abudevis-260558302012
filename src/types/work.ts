export interface ProjectImage {
  url: string;
  label: string;
}

export interface Project {
  id: string;
  num: string;
  category: string;
  title: string;
  subtitle: string;
  description: string; // Exactly 1 specific sentence about function & value
  longDesc: string;
  highlights?: string[];
  year?: string;
  tags: string[];
  githubUrl: string;
  images: ProjectImage[];
  bg: string;          // Main card background
  fg: string;          // Text color
  bevelColor: string;  // 3D physical edge bevel extrusion
  accentBg: string;    // Chip background
  accentFg: string;    // Chip text
  stageBg: string;     // Subtle chromatic pastel studio canvas tint
  dark: boolean;       // Dark card flag
}

export interface SlotConfig {
  x: number;
  y: number;
  rot: number;
  w: number;
  h: number;
  z: number;
  opacity: number;
  scale?: number;
  depthZ?: number;
}

export interface FooterCategory {
  label: string;
  match: (cat: string) => boolean;
}
