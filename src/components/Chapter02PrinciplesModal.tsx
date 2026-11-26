import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Globe,
  LayoutList,
  Pause,
  Play,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { PullCordSwitch } from './PullCordSwitch';

interface Chapter02PrinciplesModalProps {
  isOpen: boolean;
  onClose: () => void;
  origin?: { x: number; y: number };
}

export type StoryChapterKey = 'all' | 'academic' | 'voice' | 'leadership' | 'milestone';
type ViewMode = 'orbit' | 'list';
type GalleryMood = 'studio' | 'planetarium';

export interface GraphicFrame {
  id: string;
  number: string;
  chapter: Exclude<StoryChapterKey, 'all'>;
  chapterLabel: string;
  silhouette: 'tall' | 'editorial' | 'feature';
  title: string;
  location: string;
  role: string;
  summary: string;
  extendedStory: string;
  src: string;
  rotation: string;
}

export const BEYOND_THE_MASK_FRAMES: GraphicFrame[] = [
  {
    id: 'hafalan-terbanyak',
    number: '01',
    chapter: 'academic',
    chapterLabel: 'HAFALAN & AKADEMIK',
    silhouette: 'tall',
    title: 'Penghafal Terbanyak MTsN 1 Lumajang',
    location: 'MTsN 1 Lumajang',
    role: 'Siswa / Santri',
    summary: "Dokumentasi apresiasi hafalan Al-Qur'an di MTsN 1 Lumajang.",
    extendedStory:
      "Momen penerimaan apresiasi sebagai salah satu siswa dengan hafalan terbanyak di MTsN 1 Lumajang. Kegiatan hafalan ini dibimbing secara rutin setiap pagi dan sore hari.",
    src: '/assets/person/Pengahafal Terbanyak MTsN 1 LMJ 2022.jpg',
    rotation: '-0.8deg',
  },
  {
    id: 'juara-1-nahwu',
    number: '02',
    chapter: 'academic',
    chapterLabel: 'HAFALAN & AKADEMIK',
    silhouette: 'feature',
    title: 'Juara 1 Cerdas Cermat Nahwu',
    location: "Ma'had Aly",
    role: 'Peserta Tim',
    summary: 'Juara 1 lomba cerdas cermat tata bahasa Arab (Nahwu).',
    extendedStory:
      "Dokumentasi bersama tim setelah berhasil meraih juara 1 dalam perlombaan cerdas cermat Nahwu antar santri di ma'had.",
    src: '/assets/person/Lomba Cerdas Cermat Nahwu juara 1.jpg',
    rotation: '0.6deg',
  },
  {
    id: 'hadiah-juara-nahwu',
    number: '03',
    chapter: 'academic',
    chapterLabel: 'HAFALAN & AKADEMIK',
    silhouette: 'editorial',
    title: 'Penyerahan Hadiah Cerdas Cermat Nahwu',
    location: 'Auditorium Pesantren',
    role: 'Penerima Hadiah',
    summary: 'Penyerahan piagam dan piala lomba cerdas cermat Nahwu.',
    extendedStory:
      'Momen di atas panggung saat menerima piagam penghargaan dan piala perlombaan cerdas cermat Nahwu bersama perwakilan tim.',
    src: '/assets/person/Penerimaan hadiah juara 1 cc nhwu.png',
    rotation: '-0.5deg',
  },
  {
    id: 'dauroh-palestina',
    number: '04',
    chapter: 'academic',
    chapterLabel: 'HAFALAN & AKADEMIK',
    silhouette: 'feature',
    title: 'Dauroh Bersama Syeikh dari Palestina',
    location: "Halaqah Ma'had",
    role: 'Peserta Dauroh',
    summary: 'Foto bersama setelah mengikuti kegiatan dauroh intensif.',
    extendedStory:
      "Dokumentasi bersama teman-teman peserta setelah selesai mengikuti sesi pengajian dan dauroh singkat bersama syeikh tamu dari Palestina di ma'had.",
    src: '/assets/person/Dauroh Intensif Bersama Syeikh dari palestina.jpg',
    rotation: '0.9deg',
  },
  {
    id: 'para-juara-kelas',
    number: '05',
    chapter: 'academic',
    chapterLabel: 'HAFALAN & AKADEMIK',
    silhouette: 'editorial',
    title: 'Foto Bersama Peraih Peringkat Kelas',
    location: "Aula Ma'had",
    role: 'Santri Berprestasi',
    summary: "Foto bersama kawan-kawan peraih peringkat kelas di ma'had.",
    extendedStory:
      "Dokumentasi bersama teman-teman satu angkatan yang meraih peringkat kelas pada saat pembagian rapor semester di ma'had.",
    src: '/assets/person/foto bersama para juara kelas.jpeg',
    rotation: '-0.6deg',
  },
  {
    id: 'radio-santri-perdana',
    number: '06',
    chapter: 'voice',
    chapterLabel: 'SUARA & PANGGUNG',
    silhouette: 'tall',
    title: 'Siaran Pertama Radio Santri',
    location: 'Studio Radio Santri',
    role: 'Penyiar / MC',
    summary: "Momen pertama kali siaran langsung radio ma'had.",
    extendedStory:
      "Pengalaman pertama kali memegang mikrofon dan membawakan program siaran radio santri yang diperdengarkan ke seluruh area ma'had.",
    src: '/assets/person/mc radio santri mengudara pertama.jpeg',
    rotation: '0.7deg',
  },
  {
    id: 'radio-santri-studio',
    number: '07',
    chapter: 'voice',
    chapterLabel: 'SUARA & PANGGUNG',
    silhouette: 'feature',
    title: 'Studio & Kontrol Audio Radio Santri',
    location: 'Studio Radio Santri',
    role: 'Operator Audio / Co-Host',
    summary: 'Dokumentasi di balik meja siaran dan kontrol audio.',
    extendedStory:
      'Momen saat bertugas di ruang siaran radio santri, belajar mengatur mikrofon, musik latar, dan alur obrolan siaran langsung.',
    src: '/assets/person/mc radio santri mengudara pertamaa.jpeg',
    rotation: '-0.9deg',
  },
  {
    id: 'muhadhoroh-pidato',
    number: '08',
    chapter: 'voice',
    chapterLabel: 'SUARA & PANGGUNG',
    silhouette: 'editorial',
    title: 'Muhadhoroh Pidato Bahasa Arab',
    location: 'Podium Santri',
    role: 'Pembicara Pidato',
    summary: 'Latihan berpidato bahasa Arab di depan santri.',
    extendedStory:
      'Kegiatan muhadhoroh mingguan untuk melatih keberanian berbicara dan berpidato dalam bahasa Arab di depan para santri dan asatidz.',
    src: '/assets/person/saat muhadhoroh (pidato b.arab).jpeg',
    rotation: '0.5deg',
  },
  {
    id: 'muhadhoroh-audiens',
    number: '09',
    chapter: 'voice',
    chapterLabel: 'SUARA & PANGGUNG',
    silhouette: 'feature',
    title: 'Dokumentasi Pidato Muhadhoroh',
    location: "Mimbar Sentral Ma'had",
    role: 'Pembicara Pidato',
    summary: 'Dokumentasi dari sudut lain saat giliran pidato santri.',
    extendedStory:
      "Foto dokumentasi dari sudut lain saat menyampaikan pidato di panggung muhadhoroh ma'had.",
    src: '/assets/person/saat muhadhoroh (pidato b.arab) 2.jpeg',
    rotation: '-0.7deg',
  },
  {
    id: 'hayya-fest-penutup',
    number: '10',
    chapter: 'voice',
    chapterLabel: 'SUARA & PANGGUNG',
    silhouette: 'tall',
    title: 'Pemberi Pesan Kesan Hayya Fest',
    location: 'Panggung Utama Hayya Fest',
    role: 'Perwakilan Suara Santri',
    summary: 'Menyampaikan pesan dan kesan perwakilan santri di Hayya Fest.',
    extendedStory:
      'Momen dipercaya maju ke mikrofon utama untuk menyampaikan pesan dan kesan mewakili santri pada malam penutupan acara tahunan Hayya Fest.',
    src: '/assets/person/pemberi_pesan_hayya_fest_portrait.jpg',
    rotation: '0.8deg',
  },
  {
    id: 'pelantikan-osis',
    number: '11',
    chapter: 'leadership',
    chapterLabel: 'ORGANISASI',
    silhouette: 'feature',
    title: 'Pelantikan Pengurus OSIS',
    location: 'Lapangan Upacara',
    role: 'Sekretaris & Bendahara OSIS',
    summary: 'Pelantikan ketua, wakil, dan bendahara kepengurusan OSIS.',
    extendedStory:
      "Dokumentasi saat upacara pelantikan pengurus inti OSIS di ma'had, diberi amanah membantu pengelolaan administrasi dan keuangan kegiatan santri.",
    src: '/assets/person/Pelantikan Ketua Wakil n Sekben (aku) OSIS.jpg',
    rotation: '-0.5deg',
  },
  {
    id: 'koordinasi-divisi',
    number: '12',
    chapter: 'leadership',
    chapterLabel: 'ORGANISASI',
    silhouette: 'editorial',
    title: 'Foto Bersama Ketua Divisi OSIS',
    location: "Sekretariat Pengurus Ma'had",
    role: 'Pengurus Inti OSIS',
    summary: 'Foto bersama jajaran ketua divisi kepengurusan santri.',
    extendedStory:
      'Foto bersama rekan-rekan ketua divisi organisasi santri (keamanan, bahasa, ibadah, dan logistik) setelah rapat koordinasi kegiatan.',
    src: '/assets/person/foto bersama ketua dvisi sesuai peran.jpeg',
    rotation: '0.9deg',
  },
  {
    id: 'pekan-ukhuwwah',
    number: '13',
    chapter: 'leadership',
    chapterLabel: 'ORGANISASI',
    silhouette: 'feature',
    title: 'Juara Perlombaan Pekan Ukhuwwah',
    location: "Arena Pekan Ukhuwwah Ma'had",
    role: 'Ketua Tim',
    summary: 'Dokumentasi tim saat meraih juara di kegiatan Pekan Ukhuwwah.',
    extendedStory:
      'Foto bersama kawan-kawan satu tim setelah memenangkan perlombaan pada kegiatan Pekan Ukhuwwah antar santri.',
    src: '/assets/person/foto bersama juara event pekan ukhuwwh.jpeg',
    rotation: '-0.8deg',
  },
  {
    id: 'divisi-kebersihan',
    number: '14',
    chapter: 'leadership',
    chapterLabel: 'ORGANISASI',
    silhouette: 'tall',
    title: 'Divisi Kebersihan Lingkungan',
    location: 'Lingkungan Asrama',
    role: 'Petugas Kebersihan Asrama',
    summary: "Foto bersama teman satu tim divisi kebersihan ma'had.",
    extendedStory:
      "Foto santai bersama kawan seperjuangan saat bertugas di bagian kebersihan dan pemeliharaan lingkungan asrama ma'had.",
    src: "/assets/person/Foto sama temenku divisi kebersihan ma'had.jpeg",
    rotation: '0.6deg',
  },
  {
    id: 'wisuda-angkatan-37',
    number: '15',
    chapter: 'milestone',
    chapterLabel: 'KELULUSAN',
    silhouette: 'feature',
    title: 'Momen Kelulusan Santri Angkatan 37',
    location: "Gedung Acara Ma'had",
    role: 'Santri Angkatan 37',
    summary: 'Dokumentasi perpisahan dan kelulusan santri angkatan 37.',
    extendedStory:
      "Foto bersama teman-teman angkatan 37 di hari perpisahan kelulusan ma'had sebelum melanjutkan ke jenjang pendidikan berikutnya.",
    src: '/assets/person/perpisahan angkatan 37.jpeg',
    rotation: '-0.4deg',
  },
];

// Lightweight static star coordinates for Planetarium dark mode (0% CPU!)
const PLANETARIUM_STARS = [
  { x: 6, y: 12, r: 1.1, o: 0.5 }, { x: 14, y: 28, r: 0.8, o: 0.35 }, { x: 22, y: 9, r: 1.3, o: 0.65 },
  { x: 31, y: 19, r: 0.9, o: 0.3 }, { x: 42, y: 7, r: 1.0, o: 0.45 }, { x: 56, y: 11, r: 0.8, o: 0.35 },
  { x: 68, y: 16, r: 1.4, o: 0.6 }, { x: 79, y: 8, r: 1.0, o: 0.4 }, { x: 88, y: 22, r: 1.2, o: 0.55 },
  { x: 94, y: 14, r: 0.8, o: 0.3 }, { x: 8, y: 46, r: 1.2, o: 0.45 }, { x: 18, y: 62, r: 0.9, o: 0.3 },
  { x: 11, y: 78, r: 1.4, o: 0.6 }, { x: 25, y: 86, r: 1.0, o: 0.4 }, { x: 36, y: 92, r: 0.8, o: 0.35 },
  { x: 64, y: 89, r: 1.1, o: 0.45 }, { x: 76, y: 82, r: 1.3, o: 0.6 }, { x: 85, y: 68, r: 0.9, o: 0.35 },
  { x: 92, y: 48, r: 1.2, o: 0.5 }, { x: 90, y: 84, r: 1.0, o: 0.45 }, { x: 4, y: 90, r: 0.9, o: 0.4 },
  { x: 49, y: 94, r: 1.1, o: 0.35 }, { x: 74, y: 34, r: 0.8, o: 0.25 }, { x: 24, y: 42, r: 0.8, o: 0.28 },
  { x: 82, y: 54, r: 1.0, o: 0.35 }, { x: 16, y: 38, r: 0.7, o: 0.25 }, { x: 61, y: 6, r: 0.9, o: 0.4 },
  { x: 34, y: 74, r: 0.8, o: 0.25 }, { x: 68, y: 72, r: 0.8, o: 0.25 }, { x: 95, y: 64, r: 1.1, o: 0.4 },
];

const clamp = (v: number, min: number, max: number) => (v < min ? min : v > max ? max : v);
const clamp01 = (v: number) => clamp(v, 0, 1);
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeInQuart = (t: number) => t * t * t * t;

interface GlobeTile {
  key: string;
  frame: GraphicFrame;
  frameIdx: number;
  lon: number; // degrees (-180 .. 180)
  lat: number; // degrees (-60 .. +60)
  tileScale: number;
}

/**
 * Arranges photos into TRUE 3D Latitude Rings (just like a real Earth Globe / motionsites Orbit Sphere!).
 * - All (15 frames): 34 compact tangent photo tiles across 5 crisp latitude parallels
 *   (+60°: 4, +30°: 8, 0°: 10, -30°: 8, -60°: 4) -> unmistakably round, dense 3D Photo Globe!
 * - Filtered chapter (2..5 frames): 18 tiles across 3 graceful parallels (+30°, 0°, -30°) -> keeps full globe silhouette!
 * - Single frame (1 frame): clean hero orbital center tile.
 */
function buildGlobeTiles(frames: GraphicFrame[]): GlobeTile[] {
  if (frames.length === 0) return [];
  if (frames.length === 1) {
    return [
      {
        key: `${frames[0].id}-hero`,
        frame: frames[0],
        frameIdx: 0,
        lon: 0,
        lat: 0,
        tileScale: 1.45,
      },
    ];
  }

  const bands =
    frames.length >= 10
      ? [
          { lat: 60, count: 4, offsetLon: 22, scale: 0.86 },
          { lat: 30, count: 8, offsetLon: 11, scale: 0.96 },
          { lat: 0, count: 10, offsetLon: 0, scale: 1.0 },
          { lat: -30, count: 8, offsetLon: 22, scale: 0.96 },
          { lat: -60, count: 4, offsetLon: 45, scale: 0.86 },
        ]
      : [
          { lat: 32, count: 6, offsetLon: 20, scale: 0.95 },
          { lat: 0, count: 8, offsetLon: 0, scale: 1.02 },
          { lat: -32, count: 6, offsetLon: 40, scale: 0.95 },
        ];

  const tiles: GlobeTile[] = [];
  let cursor = 0;

  for (let b = 0; b < bands.length; b++) {
    const band = bands[b];
    const step = 360 / band.count;
    for (let j = 0; j < band.count; j++) {
      const fIdx = cursor % frames.length;
      const frame = frames[fIdx];
      tiles.push({
        key: `${frame.id}-b${b}-j${j}`,
        frame,
        frameIdx: fIdx,
        lon: j * step + band.offsetLon,
        lat: band.lat,
        tileScale: band.scale,
      });
      cursor += 1;
    }
  }

  return tiles;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CHAPTER 02 — BEYOND THE MASK (TRUE CSS 3D PHOTO GLOBE + DUAL-MOOD GALLERY)
   1. Cinematic Obsidian-Flash 3D Silver Silk Web Punch-Through (`0.68s`):
      - ZERO frame-0 leak (`stageRef` starts `opacity-0` in JSX!).
      - Luminous silver silk strands + subtle crimson radial flash over dark
        obsidian veil -> punches past camera & clears 100% BEFORE globe blooms!
   2. TRUE 3D CURVED PHOTO GLOBE (`preserve-3d` Hardware-Accelerated):
      - 34 compact borderless photo tiles placed TANGENT on 5 latitude rings
        using true spherical surface transforms (`rotateY(lon) rotateX(lat) translateZ(R)`).
      - Two-sided faces: crisp full-color exterior + soft dimmed translucent
        interior face peeking authentically through the back hemisphere!
      - Rotates ONE single GPU parent layer at locked 60fps (~0% CPU!).
      - Free 360° drag + fling inertia + scroll zoom + touchpad anti-back lock.
   3. Dual-Mood Gallery (BG-3 = BG-1 Light Studio <-> BG-2 Dark Planetarium):
      - `studio` (Light): Warm Alabaster Spotlight + Gallery Floor Shadow +
        Framed 4-Corner Editorial Typography (`Beyond / The Mask` & `Stories / You Can Orbit`).
      - `planetarium` (Dark): Deep Obsidian Sky + Crimson-Amber Nebula Glow +
        Micro-Starfield + Luminous Silver Orbital Rings!
   4. 1-Click `3D GLOBE | LIST` switcher + Spatial Lightbox Dossier.
   ═══════════════════════════════════════════════════════════════════════════ */

export const Chapter02PrinciplesModal: React.FC<Chapter02PrinciplesModalProps> = ({
  isOpen,
  onClose,
  origin,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const webCanvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // True 3D Globe refs
  const globeStageRef = useRef<HTMLDivElement>(null);
  const globeRigRef = useRef<HTMLDivElement>(null);
  const globeShadowRef = useRef<HTMLDivElement>(null);

  // List Storyboard refs
  const trackWrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const listCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const listImgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const scrubberFillRef = useRef<HTMLDivElement>(null);
  const scrubberTrackRef = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('orbit');
  const [mood, setMood] = useState<GalleryMood>('studio');
  const [autoSpin, setAutoSpin] = useState<boolean>(true);
  const [hoveredTileKey, setHoveredTileKey] = useState<string | null>(null);
  const [hoveredFrame, setHoveredFrame] = useState<GraphicFrame | null>(null);
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [sphereRadius, setSphereRadius] = useState<number>(255);

  // Lightbox Dossier state
  const [selectedFrame, setSelectedFrame] = useState<GraphicFrame | null>(null);
  const selectedFrameRef = useRef<GraphicFrame | null>(null);
  const lightboxOverlayRef = useRef<HTMLDivElement>(null);
  const lightboxModalRef = useRef<HTMLDivElement>(null);
  const isLightboxAnimatingRef = useRef<boolean>(false);

  const autoSpinRef = useRef<boolean>(autoSpin);
  autoSpinRef.current = autoSpin;
  const hoveredTileRef = useRef<string | null>(hoveredTileKey);
  hoveredTileRef.current = hoveredTileKey;
  const viewModeRef = useRef<ViewMode>(viewMode);
  viewModeRef.current = viewMode;

  useEffect(() => {
    selectedFrameRef.current = selectedFrame;
  }, [selectedFrame]);

  const filteredFrames = BEYOND_THE_MASK_FRAMES;

  const globeTiles = useMemo(() => buildGlobeTiles(filteredFrames), [filteredFrames]);

  // ── True 3D Globe Rotation Physics Refs (degrees for CSS 3D rotateX / rotateY) ──
  const rotYDegRef = useRef<number>(-22);
  const rotXDegRef = useRef<number>(-10);
  const velYDegRef = useRef<number>(0);
  const velXDegRef = useRef<number>(0);
  const snapTargetRef = useRef<{ rotY: number; rotX: number } | null>(null);
  const zoomTargetRef = useRef<number>(1);
  const zoomCurrentRef = useRef<number>(1);
  const bloomScaleRef = useRef<number>(0.72);
  const globeDraggingRef = useRef<boolean>(false);
  const globeLastXRef = useRef<number>(0);
  const globeLastYRef = useRef<number>(0);
  const globeDragDistRef = useRef<number>(0);

  // ── List Mode Physics Refs ──
  const targetXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);
  const maxScrollRef = useRef<number>(0);
  const smoothVelRef = useRef<number>(0);
  const activeIdxRef = useRef<number>(0);
  const listDraggingRef = useRef<boolean>(false);
  const listDragLastXRef = useRef<number>(0);
  const listDragLastTimeRef = useRef<number>(0);
  const listDragVelRef = useRef<number>(0);
  const listDragMovedRef = useRef<number>(0);

  const isClosingRef = useRef<boolean>(false);
  const scrollYPosRef = useRef<number>(0);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Compute responsive Globe radius so the 3D sphere fills ~66% of viewport cleanly without hitting header/footer
  useEffect(() => {
    if (!isOpen) return;
    const measureRadius = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (vw < 640) {
        setSphereRadius(Math.round(clamp(Math.min(vw * 0.42, vh * 0.25), 148, 188)));
      } else if (vw < 1024) {
        setSphereRadius(Math.round(clamp(Math.min(vw * 0.30, vh * 0.31), 205, 245)));
      } else {
        setSphereRadius(Math.round(clamp(Math.min(vw * 0.23, vh * 0.335), 228, 286)));
      }
    };
    measureRadius();
    window.addEventListener('resize', measureRadius);
    return () => window.removeEventListener('resize', measureRadius);
  }, [isOpen]);

  const updateListBounds = useCallback(() => {
    if (!trackRef.current || !trackWrapRef.current) return;
    const maxS = Math.max(0, trackRef.current.scrollWidth - trackWrapRef.current.clientWidth);
    maxScrollRef.current = maxS;
    targetXRef.current = clamp(targetXRef.current, 0, maxS);
    currentXRef.current = clamp(currentXRef.current, 0, maxS);
  }, []);

  // Rotate the 3D Globe smoothly to face a specific frame index straight at the viewer
  const focusGlobeFrame = useCallback(
    (idx: number) => {
      if (filteredFrames.length === 0) return;
      const wrapped = ((idx % filteredFrames.length) + filteredFrames.length) % filteredFrames.length;
      const targetFrame = filteredFrames[wrapped];
      const matchTile =
        globeTiles.find((t) => t.frame.id === targetFrame.id && t.lat === 0) ??
        globeTiles.find((t) => t.frame.id === targetFrame.id);

      if (matchTile) {
        // Tile sits at rotateY(lon) rotateX(lat) translateZ(R).
        // Parent rotates rotateX(rotX) rotateY(rotY), so setting rotY = -lon and rotX = -lat brings tile dead-center!
        const desiredY = -matchTile.lon;
        let deltaY = (desiredY - rotYDegRef.current) % 360;
        if (deltaY > 180) deltaY -= 360;
        if (deltaY < -180) deltaY += 360;

        velYDegRef.current = 0;
        velXDegRef.current = 0;
        snapTargetRef.current = {
          rotY: rotYDegRef.current + deltaY,
          rotX: clamp(-matchTile.lat, -52, 52),
        };
      }
      activeIdxRef.current = wrapped;
      setActiveIdx(wrapped);
    },
    [filteredFrames, globeTiles]
  );

  const scrollListToIndex = useCallback(
    (idx: number) => {
      const clamped = clamp(idx, 0, Math.max(0, filteredFrames.length - 1));
      const cardEl = listCardRefs.current[clamped];
      const wrapEl = trackWrapRef.current;
      if (!cardEl || !wrapEl) return;

      const cardCenter = cardEl.offsetLeft + cardEl.offsetWidth / 2;
      const desired = cardCenter - wrapEl.clientWidth / 2;
      targetXRef.current = clamp(desired, 0, maxScrollRef.current);
    },
    [filteredFrames.length]
  );

  const navigateStep = useCallback(
    (delta: 1 | -1) => {
      if (viewModeRef.current === 'orbit') {
        focusGlobeFrame(activeIdxRef.current + delta);
      } else {
        scrollListToIndex(activeIdxRef.current + delta);
      }
    },
    [focusGlobeFrame, scrollListToIndex]
  );

  const resetGlobeView = useCallback(() => {
    zoomTargetRef.current = 1;
    velYDegRef.current = 0;
    velXDegRef.current = 0;
    snapTargetRef.current = { rotY: -22, rotX: -10 };
  }, []);

  // ── 1. CLOSE HANDLER ──
  const handleClose = useCallback(
    (popHistory = true) => {
      if (isClosingRef.current) return;
      isClosingRef.current = true;

      if (popHistory && window.history.state?.modal === 'chapter-02-principles') {
        window.history.back();
      }

      const restoreAndExit = () => {
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
        const win = window as unknown as {
          __lenis?: { start: () => void; scrollTo: (y: number, opts: unknown) => void };
        };
        if (win.__lenis) {
          win.__lenis.scrollTo(scrollYPosRef.current, { immediate: true });
          win.__lenis.start();
        } else if (typeof window !== 'undefined' && scrollYPosRef.current > 0) {
          window.scrollTo({ top: scrollYPosRef.current, behavior: 'instant' });
        }
        onClose();
      };

      if (prefersReducedMotion || !containerRef.current) {
        restoreAndExit();
        return;
      }

      const origX = origin?.x ?? window.innerWidth / 2;
      const origY = origin?.y ?? window.innerHeight / 2;

      const tl = gsap.timeline({ onComplete: restoreAndExit });
      if (stageRef.current) {
        tl.to(stageRef.current, { opacity: 0, scale: 0.96, duration: 0.24, ease: 'power2.in' }, 0);
      }
      tl.to(
        containerRef.current,
        {
          opacity: 0,
          clipPath: `circle(0px at ${origX}px ${origY}px)`,
          duration: 0.36,
          ease: 'power3.inOut',
        },
        0.04
      );
    },
    [onClose, origin, prefersReducedMotion]
  );

  // ── 2. LIGHTBOX DOSSIER HANDLERS ──
  const openLightbox = useCallback((frame: GraphicFrame) => {
    setSelectedFrame(frame);
    selectedFrameRef.current = frame;
    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: 'chapter-02-principles', view: 'lightbox' }, '');
    }
  }, []);

  const closeLightbox = useCallback((popHistory = true) => {
    if (!selectedFrameRef.current || isLightboxAnimatingRef.current) return;
    isLightboxAnimatingRef.current = true;

    const finalize = () => {
      setSelectedFrame(null);
      selectedFrameRef.current = null;
      isLightboxAnimatingRef.current = false;
      if (popHistory && typeof window !== 'undefined' && window.history.state?.view === 'lightbox') {
        window.history.back();
      }
    };

    if (lightboxModalRef.current && lightboxOverlayRef.current) {
      const tl = gsap.timeline({ onComplete: finalize });
      tl.to(
        lightboxModalRef.current,
        { opacity: 0, scale: 0.92, y: 16, duration: 0.22, ease: 'power2.in' },
        0
      );
      tl.to(lightboxOverlayRef.current, { opacity: 0, duration: 0.22, ease: 'power2.in' }, 0);
    } else {
      finalize();
    }
  }, []);

  const navigateLightbox = useCallback((targetFrame: GraphicFrame, dir: 1 | -1) => {
    setSelectedFrame(targetFrame);
    selectedFrameRef.current = targetFrame;
    if (lightboxModalRef.current) {
      const img = lightboxModalRef.current.querySelector('.dossier-main-img');
      if (img) {
        gsap.fromTo(
          img,
          { opacity: 0.25, x: dir * 24, scale: 0.98 },
          { opacity: 1, x: 0, scale: 1, duration: 0.32, ease: 'power2.out', clearProps: 'transform' }
        );
      }
    }
  }, []);

  // ── 3. ENTRANCE: CINEMATIC OBSIDIAN-FLASH 3D SILVER SILK PUNCH-THROUGH (ZERO GLITCH!) ──
  useEffect(() => {
    if (!isOpen) return;
    isClosingRef.current = false;
    setViewMode('orbit');
    setAutoSpin(true);
    setHoveredTileKey(null);
    setHoveredFrame(null);
    setActiveIdx(0);
    activeIdxRef.current = 0;

    rotYDegRef.current = -26;
    rotXDegRef.current = -10;
    velYDegRef.current = 0.65;
    velXDegRef.current = 0;
    snapTargetRef.current = null;
    zoomTargetRef.current = 1;
    zoomCurrentRef.current = 1;
    bloomScaleRef.current = prefersReducedMotion ? 1 : 0.68;
    targetXRef.current = 0;
    currentXRef.current = 0;

    scrollYPosRef.current = typeof window !== 'undefined' ? window.scrollY : 0;
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');

    const win = window as unknown as { __lenis?: { stop: () => void; start: () => void } };
    win.__lenis?.stop();

    window.history.pushState({ modal: 'chapter-02-principles' }, '');
    const handlePopState = () => {
      if (isClosingRef.current) return;
      if (selectedFrameRef.current) {
        closeLightbox(false);
        return;
      }
      handleClose(false);
    };
    window.addEventListener('popstate', handlePopState);

    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = origin?.x ?? w / 2;
    const cy = origin?.y ?? h / 2;

    if (prefersReducedMotion) {
      bloomScaleRef.current = 1;
      if (containerRef.current) {
        containerRef.current.style.opacity = '1';
        containerRef.current.style.clipPath = 'none';
      }
      if (stageRef.current) {
        stageRef.current.style.opacity = '1';
      }
      if (webCanvasRef.current) {
        webCanvasRef.current.style.display = 'none';
      }
      return () => {
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
        window.removeEventListener('popstate', handlePopState);
        win.__lenis?.start();
      };
    }

    // Ensure ZERO frame-0 leak on stageRef while silk canvas plays cleanly over obsidian!
    if (stageRef.current) {
      gsap.set(stageRef.current, { opacity: 0, scale: 0.96 });
    }

    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 1, clipPath: `circle(0px at ${cx}px ${cy}px)` },
        {
          opacity: 1,
          clipPath: `circle(155% at ${cx}px ${cy}px)`,
          duration: 0.42,
          ease: 'power3.out',
          onComplete: () => {
            if (containerRef.current) containerRef.current.style.clipPath = 'none';
          },
        }
      );
    }

    // Stage reveals AFTER the silver silk web punches past the camera -> ZERO web lines crossing photos!
    if (stageRef.current) {
      gsap.to(stageRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.46,
        delay: 0.44,
        ease: 'power3.out',
        clearProps: 'transform',
      });
    }

    // ── CINEMATIC OBSIDIAN-FLASH 3D SILVER SILK WEB PUNCH-THROUGH (0.64s) ──
    let webRafId = 0;
    const canvas = webCanvasRef.current;
    if (canvas) {
      canvas.style.display = 'block';
      const ctx = canvas.getContext('2d');
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);

      // 18 organic asymmetric spokes with natural tension variations
      const N = 18;
      const RINGS = 7;
      const maxR = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) * 1.18;
      const angles: number[] = [];
      const spokeReach: number[] = [];
      for (let i = 0; i < N; i++) {
        const jitter = Math.sin(i * 2.7) * 0.055;
        angles.push(-Math.PI / 2 + (i * Math.PI * 2) / N + jitter);
        spokeReach.push(0.86 + ((i * 13) % 7) * 0.032);
      }

      const startTime = performance.now();
      const TOTAL_MS = 640;

      const drawSilkFrame = (now: number) => {
        if (!ctx) return;
        const t = clamp01((now - startTime) / TOTAL_MS);

        // Beat 1 (0.00 -> 0.44): High-tension silver silk fires outward over obsidian veil
        const shootP = easeOutExpo(clamp01(t / 0.36));
        const ringP = easeOutExpo(clamp01((t - 0.08) / 0.42));
        // Beat 2 (0.50 -> 1.00): Camera punches cleanly through web (rapid zoom & vanish!)
        const punchP = easeInQuart(clamp01((t - 0.48) / 0.52));

        const zoomScale = 1 + punchP * 2.6;
        const webAlpha = 1 - punchP;
        const obsidianAlpha = 1 - easeOutExpo(clamp01((t - 0.44) / 0.42));

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        if (webAlpha <= 0.01 && obsidianAlpha <= 0.01) {
          canvas.style.display = 'none';
          return;
        }

        // 1. Brief Obsidian Veil + Warm Crimson Spider-Sense Core Flash (gives silver silk jaw-dropping contrast!)
        if (obsidianAlpha > 0.01) {
          ctx.fillStyle = `rgba(9, 11, 16, ${(obsidianAlpha * 0.94).toFixed(3)})`;
          ctx.fillRect(0, 0, w, h);

          const pulseR = maxR * (0.12 + shootP * 0.38);
          const crimsonGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR);
          crimsonGrad.addColorStop(0, `rgba(220, 68, 52, ${(obsidianAlpha * 0.34).toFixed(3)})`);
          crimsonGrad.addColorStop(0.45, `rgba(200, 62, 43, ${(obsidianAlpha * 0.12).toFixed(3)})`);
          crimsonGrad.addColorStop(1, 'rgba(9, 11, 16, 0)');
          ctx.fillStyle = crimsonGrad;
          ctx.fillRect(0, 0, w, h);
        }

        // 2. Luminous 3D Silver-White Silk Web Strands
        if (webAlpha > 0.01) {
          ctx.save();
          ctx.globalAlpha = webAlpha;
          ctx.translate(cx, cy);
          ctx.scale(zoomScale, zoomScale);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          // Radial silk spokes with tapered light-falloff gradient
          for (let i = 0; i < N; i++) {
            const a = angles[i];
            const len = maxR * spokeReach[i] * shootP;
            const ex = Math.cos(a) * len;
            const ey = Math.sin(a) * len;

            const grad = ctx.createLinearGradient(0, 0, ex, ey);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
            grad.addColorStop(0.55, 'rgba(226, 232, 240, 0.62)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0.08)');

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(ex, ey);
            ctx.strokeStyle = grad;
            ctx.lineWidth = i % 3 === 0 ? 1.55 : 0.95;
            ctx.stroke();
          }

          // 7 Organic Catenary Tension Rings with inner-to-outer specular shimmer
          for (let r = 1; r <= RINGS; r++) {
            const localP = clamp01((ringP - (r - 1) * 0.065) / 0.44);
            if (localP <= 0.01) continue;

            const depthFactor = r / RINGS;
            const baseRad = Math.pow(depthFactor, 1.38) * maxR * 0.86 + 22;
            const rad = baseRad * (0.28 + 0.72 * localP);
            const sag = 0.86 + depthFactor * 0.05;

            ctx.beginPath();
            for (let i = 0; i <= N; i++) {
              const idx = i % N;
              const a1 = angles[idx];
              const x1 = Math.cos(a1) * rad;
              const y1 = Math.sin(a1) * rad;

              if (i === 0) {
                ctx.moveTo(x1, y1);
              } else {
                const prevA = angles[(i - 1) % N];
                let nextA = a1;
                if (nextA < prevA) nextA += Math.PI * 2;
                const midA = (prevA + nextA) / 2;
                ctx.quadraticCurveTo(
                  Math.cos(midA) * rad * sag,
                  Math.sin(midA) * rad * sag,
                  x1,
                  y1
                );
              }
            }
            ctx.closePath();

            // Outer soft silver glow pass on innermost tension rings
            if (r <= 4) {
              ctx.strokeStyle = `rgba(255, 255, 255, ${(0.22 * localP).toFixed(3)})`;
              ctx.lineWidth = 3.2 - r * 0.4;
              ctx.stroke();
            }

            // Crisp luminous silk core
            ctx.strokeStyle = `rgba(248, 250, 252, ${((0.92 - depthFactor * 0.35) * localP).toFixed(3)})`;
            ctx.lineWidth = Math.max(0.65, 1.35 - depthFactor * 0.5);
            ctx.stroke();
          }

          // Subtle Crimson-White Tension Focal Spark (vanishes cleanly on punch-through)
          const sparkAlpha = (1 - clamp01((t - 0.35) / 0.25)) * webAlpha;
          if (sparkAlpha > 0.02) {
            ctx.beginPath();
            ctx.arc(0, 0, 5 * easeOutExpo(clamp01(t / 0.18)), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${sparkAlpha.toFixed(3)})`;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = `rgba(220, 68, 52, ${sparkAlpha.toFixed(3)})`;
            ctx.stroke();
          }

          ctx.restore();
        }

        if (t < 1) {
          webRafId = requestAnimationFrame(drawSilkFrame);
        } else {
          canvas.style.display = 'none';
        }
      };

      webRafId = requestAnimationFrame(drawSilkFrame);
    }

    return () => {
      cancelAnimationFrame(webRafId);
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      window.removeEventListener('popstate', handlePopState);
      win.__lenis?.start();
    };
  }, [isOpen, origin, handleClose, closeLightbox, prefersReducedMotion]);

  // ── 4. SMOOTH BLOOM ON FILTER / VIEW CHANGE ──
  useEffect(() => {
    if (!isOpen) return;
    setHoveredTileKey(null);
    setHoveredFrame(null);
    activeIdxRef.current = 0;
    setActiveIdx(0);

    if (viewMode === 'orbit') {
      bloomScaleRef.current = prefersReducedMotion ? 1 : 0.78;
      velYDegRef.current = 0.45;
      velXDegRef.current = 0;
      snapTargetRef.current = null;
      return;
    }

    targetXRef.current = 0;
    currentXRef.current = 0;
    const raf = requestAnimationFrame(() => {
      updateListBounds();
      if (!prefersReducedMotion && trackRef.current) {
        const cards = trackRef.current.querySelectorAll('.story-card');
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 24, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.45,
              stagger: 0.04,
              ease: 'power3.out',
              clearProps: 'transform',
            }
          );
        }
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [viewMode, isOpen, prefersReducedMotion, updateListBounds]);

  // ── 5. NATIVE NON-PASSIVE WHEEL LISTENER (100% BLOCKS CHROME SWIPE-BACK!) ──
  useEffect(() => {
    if (!isOpen) return;
    const el = containerRef.current;
    if (!el) return;

    const onNativeWheel = (e: WheelEvent) => {
      if (selectedFrameRef.current) {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault();
        }
        return;
      }

      e.preventDefault();

      if (viewModeRef.current === 'orbit') {
        snapTargetRef.current = null;
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          velYDegRef.current += e.deltaX * 0.025;
        } else {
          zoomTargetRef.current = clamp(zoomTargetRef.current - e.deltaY * 0.0008, 0.74, 1.32);
        }
      } else {
        const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        targetXRef.current = clamp(targetXRef.current + delta * 1.25, 0, maxScrollRef.current);
      }
    };

    const onWindowGuard = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 0) {
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', onNativeWheel, { passive: false });
    window.addEventListener('wheel', onWindowGuard, { passive: false });
    return () => {
      el.removeEventListener('wheel', onNativeWheel);
      window.removeEventListener('wheel', onWindowGuard);
    };
  }, [isOpen]);

  // ── 6. KEYBOARD NAVIGATION ──
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedFrameRef.current) closeLightbox(true);
        else handleClose(true);
      } else if (e.key === 'ArrowRight') {
        if (selectedFrameRef.current) {
          const cur = filteredFrames.findIndex((f) => f.id === selectedFrameRef.current?.id);
          if (cur !== -1 && cur < filteredFrames.length - 1) {
            navigateLightbox(filteredFrames[cur + 1], 1);
          }
        } else {
          navigateStep(1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (selectedFrameRef.current) {
          const cur = filteredFrames.findIndex((f) => f.id === selectedFrameRef.current?.id);
          if (cur > 0) navigateLightbox(filteredFrames[cur - 1], -1);
        } else {
          navigateStep(-1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredFrames, closeLightbox, handleClose, navigateLightbox, navigateStep]);

  // Lightbox entrance bloom
  useEffect(() => {
    if (selectedFrame && lightboxModalRef.current && lightboxOverlayRef.current) {
      gsap.fromTo(lightboxOverlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: 'power2.out' });
      gsap.fromTo(
        lightboxModalRef.current,
        { opacity: 0, scale: 0.9, y: 24 },
        { opacity: 1, scale: 1, y: 0, duration: 0.42, ease: 'power3.out' }
      );
    }
  }, [selectedFrame?.id]);

  // ── 7A. 60FPS TRUE CSS 3D GLOBE ROTATION LOOP (Rotates ONE parent GPU div -> ~0% CPU!) ──
  useEffect(() => {
    if (!isOpen || viewMode !== 'orbit' || selectedFrame !== null) return;

    let animId = 0;

    const tickGlobe = () => {
      if (bloomScaleRef.current < 1) {
        bloomScaleRef.current = Math.min(1, bloomScaleRef.current + (1 - bloomScaleRef.current) * 0.085 + 0.003);
      }

      zoomCurrentRef.current += (zoomTargetRef.current - zoomCurrentRef.current) * 0.1;

      if (snapTargetRef.current) {
        const dY = snapTargetRef.current.rotY - rotYDegRef.current;
        const dX = snapTargetRef.current.rotX - rotXDegRef.current;
        rotYDegRef.current += dY * 0.11;
        rotXDegRef.current += dX * 0.11;
        if (Math.abs(dY) < 0.08 && Math.abs(dX) < 0.08) {
          rotYDegRef.current = snapTargetRef.current.rotY;
          rotXDegRef.current = snapTargetRef.current.rotX;
          snapTargetRef.current = null;
        }
      } else if (!globeDraggingRef.current) {
        const shouldSpin =
          autoSpinRef.current &&
          !prefersReducedMotion &&
          !hoveredTileRef.current &&
          filteredFrames.length > 1;

        if (shouldSpin) {
          rotYDegRef.current += 0.16;
        }

        rotYDegRef.current += velYDegRef.current;
        rotXDegRef.current = clamp(rotXDegRef.current + velXDegRef.current, -54, 54);

        velYDegRef.current *= 0.94;
        velXDegRef.current *= 0.92;
        if (Math.abs(velYDegRef.current) < 0.005) velYDegRef.current = 0;
        if (Math.abs(velXDegRef.current) < 0.005) velXDegRef.current = 0;
      }

      const finalScale = zoomCurrentRef.current * bloomScaleRef.current;

      if (globeRigRef.current) {
        globeRigRef.current.style.transform = `scale3d(${finalScale.toFixed(4)}, ${finalScale.toFixed(4)}, ${finalScale.toFixed(4)}) rotateX(${rotXDegRef.current.toFixed(2)}deg) rotateY(${rotYDegRef.current.toFixed(2)}deg)`;
      }

      if (globeShadowRef.current) {
        const shadowSc = 0.72 + finalScale * 0.28;
        globeShadowRef.current.style.transform = `translate3d(-50%, 0, 0) scaleX(${shadowSc.toFixed(3)})`;
      }

      animId = requestAnimationFrame(tickGlobe);
    };

    animId = requestAnimationFrame(tickGlobe);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, viewMode, selectedFrame, filteredFrames.length, prefersReducedMotion]);

  // ── 7B. 60FPS LIST STORYBOARD LOOP (ONLY runs in List mode while Lightbox closed!) ──
  useEffect(() => {
    if (!isOpen || viewMode !== 'list' || selectedFrame !== null) return;

    updateListBounds();
    window.addEventListener('resize', updateListBounds);

    let animId = 0;
    const tickList = () => {
      const diff = targetXRef.current - currentXRef.current;
      currentXRef.current += diff * 0.095;
      if (Math.abs(diff) < 0.05) currentXRef.current = targetXRef.current;

      smoothVelRef.current += (diff - smoothVelRef.current) * 0.14;
      const clampedSkew = prefersReducedMotion
        ? 0
        : clamp(-smoothVelRef.current * 0.025, -4.2, 4.2);

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${(-currentXRef.current).toFixed(2)}px, 0, 0) skewX(${clampedSkew.toFixed(2)}deg)`;
      }

      if (scrubberFillRef.current) {
        const ratio =
          maxScrollRef.current > 0 ? clamp01(currentXRef.current / maxScrollRef.current) : 1;
        scrubberFillRef.current.style.transform = `scaleX(${Math.max(0.08, ratio).toFixed(4)})`;
      }

      const wrapW = trackWrapRef.current?.clientWidth || window.innerWidth;
      const viewCenter = currentXRef.current + wrapW / 2;
      let closestIdx = activeIdxRef.current;
      let minDist = Infinity;

      for (let i = 0; i < filteredFrames.length; i++) {
        const cardEl = listCardRefs.current[i];
        if (!cardEl) continue;
        const cardCenter = cardEl.offsetLeft + cardEl.offsetWidth / 2;
        const dist = cardCenter - viewCenter;
        const absDist = Math.abs(dist);

        if (absDist < minDist) {
          minDist = absDist;
          closestIdx = i;
        }

        const imgEl = listImgRefs.current[i];
        if (imgEl && !prefersReducedMotion && absDist < wrapW) {
          const norm = clamp(dist / (wrapW * 0.65), -1, 1);
          imgEl.style.transform = `translate3d(${(-norm * 14).toFixed(1)}px, 0, 0) scale(1.08)`;
        }
      }

      if (closestIdx !== activeIdxRef.current) {
        activeIdxRef.current = closestIdx;
        setActiveIdx(closestIdx);
      }

      animId = requestAnimationFrame(tickList);
    };

    animId = requestAnimationFrame(tickList);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateListBounds);
    };
  }, [isOpen, viewMode, selectedFrame, filteredFrames.length, prefersReducedMotion, updateListBounds]);

  // ── 3D Globe Pointer Drag + Throw Inertia Handlers ──
  const handleGlobePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (selectedFrameRef.current) return;
    globeDraggingRef.current = true;
    snapTargetRef.current = null;
    globeLastXRef.current = e.clientX;
    globeLastYRef.current = e.clientY;
    globeDragDistRef.current = 0;
    velYDegRef.current = 0;
    velXDegRef.current = 0;
  };

  const handleGlobePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!globeDraggingRef.current) return;
    const dx = e.clientX - globeLastXRef.current;
    const dy = e.clientY - globeLastYRef.current;
    globeLastXRef.current = e.clientX;
    globeLastYRef.current = e.clientY;
    globeDragDistRef.current += Math.hypot(dx, dy);

    const degPerPx = 0.28;
    rotYDegRef.current += dx * degPerPx;
    rotXDegRef.current = clamp(rotXDegRef.current - dy * degPerPx, -54, 54);

    velYDegRef.current = dx * degPerPx * 0.78;
    velXDegRef.current = -dy * degPerPx * 0.62;
  };

  const handleGlobePointerUp = () => {
    globeDraggingRef.current = false;
  };

  // ── List Mode Drag Handlers ──
  const handleListPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (selectedFrameRef.current) return;
    listDraggingRef.current = true;
    listDragLastXRef.current = e.clientX;
    listDragLastTimeRef.current = performance.now();
    listDragVelRef.current = 0;
    listDragMovedRef.current = 0;
  };

  const handleListPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!listDraggingRef.current) return;
    const dx = e.clientX - listDragLastXRef.current;
    const now = performance.now();
    const dt = Math.max(1, now - listDragLastTimeRef.current);

    listDragMovedRef.current += Math.abs(dx);
    listDragVelRef.current = dx / dt;
    listDragLastXRef.current = e.clientX;
    listDragLastTimeRef.current = now;

    targetXRef.current = clamp(targetXRef.current - dx * 1.25, 0, maxScrollRef.current);
  };

  const handleListPointerUp = () => {
    if (!listDraggingRef.current) return;
    listDraggingRef.current = false;
    if (Math.abs(listDragVelRef.current) > 0.25) {
      const fling = listDragVelRef.current * 280;
      targetXRef.current = clamp(targetXRef.current - fling, 0, maxScrollRef.current);
    }
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberTrackRef.current) return;
    const rect = scrubberTrackRef.current.getBoundingClientRect();
    const ratio = clamp01((e.clientX - rect.left) / rect.width);
    targetXRef.current = ratio * maxScrollRef.current;
  };

  if (!isOpen) return null;

  const isDark = mood === 'planetarium';
  const activeFramePreview = hoveredFrame ?? filteredFrames[activeIdx] ?? filteredFrames[0];

  // Compact curved tile dimensions matched proportionally to sphereRadius so gaps stay crisp & spherical!
  const tileW = Math.round(sphereRadius * 0.50);
  const tileH = Math.round(tileW * 0.72);

  const getSilhouetteClasses = (silhouette: GraphicFrame['silhouette'], idx: number) => {
    if (silhouette === 'tall') {
      return `w-[265px] sm:w-[310px] md:w-[340px] h-[52vh] sm:h-[58vh] max-h-[510px] ${
        idx % 2 === 0 ? '-translate-y-2' : 'translate-y-2'
      }`;
    }
    if (silhouette === 'feature') {
      return `w-[315px] sm:w-[385px] md:w-[440px] h-[48vh] sm:h-[53vh] max-h-[465px] ${
        idx % 2 === 0 ? 'translate-y-2.5' : '-translate-y-2.5'
      }`;
    }
    return `w-[285px] sm:w-[345px] md:w-[380px] h-[50vh] sm:h-[56vh] max-h-[490px] ${
      idx % 2 === 0 ? '-translate-y-1' : 'translate-y-1.5'
    }`;
  };

  const modalContent = (
    <div
      ref={containerRef}
      data-lenis-prevent
      className={`fixed inset-0 z-[200] overflow-hidden select-none pointer-events-auto transition-colors duration-500 ${
        isDark ? 'bg-[#080A0F]' : 'bg-[#F2EFE9]'
      }`}
      style={{
        opacity: 0,
        overscrollBehavior: 'none',
        overscrollBehaviorX: 'none',
        touchAction: 'none',
      }}
    >
      {/* ── CINEMATIC OBSIDIAN-FLASH 3D SILVER SILK WEB PUNCH-THROUGH ── */}
      <canvas
        ref={webCanvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-40"
      />

      {/* ═══════════════════════════════════════════════════════════════════
          DUAL-MOOD GALLERY STAGE (BG-1 LIGHT STUDIO <-> BG-2 DARK PLANETARIUM)
          Starts `opacity-0` in JSX -> ZERO frame-0 flash before silk clears!
          ═══════════════════════════════════════════════════════════════════ */}
      <div
        ref={stageRef}
        className={`opacity-0 relative z-10 w-full h-[100dvh] flex flex-col justify-between overflow-hidden transition-colors duration-500 ${
          isDark ? 'text-[#F5F2EC]' : 'text-[#18181B]'
        }`}
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 72% 66% at 50% 50%, #19131C 0%, #0C0E14 52%, #06070B 100%)'
            : 'radial-gradient(ellipse 68% 62% at 50% 48%, #FFFFFF 0%, #F4F1EB 48%, #E6E1D7 100%)',
        }}
      >
        {/* ── BACKGROUND ATMOSPHERE LAYERS (ADAPTIVE BG-1 LIGHT <-> BG-2 DARK) ── */}
        {isDark ? (
          <>
            {/* BG-2: Subtle Crimson-Amber Cosmic Nebula Glow behind the 3D Globe */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0"
              style={{
                background:
                  'radial-gradient(480px 420px at 50% 50%, rgba(200, 62, 43, 0.22) 0%, rgba(234, 150, 74, 0.08) 38%, transparent 72%)',
              }}
            />
            {/* BG-2: Lightweight Static Micro-Starfield (0% CPU!) */}
            <svg
              aria-hidden="true"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 w-full h-full z-0"
            >
              {PLANETARIUM_STARS.map((s, i) => (
                <circle
                  key={i}
                  cx={s.x}
                  cy={s.y}
                  r={s.r * 0.14}
                  fill="#F8FAFC"
                  fillOpacity={s.o}
                />
              ))}
            </svg>
          </>
        ) : (
          /* BG-1: Subtle Architectural Museum Gallery Grid Vignette */
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 opacity-[0.035]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #18181B 1px, transparent 1px), linear-gradient(to bottom, #18181B 1px, transparent 1px)',
              backgroundSize: '72px 72px',
              WebkitMaskImage:
                'radial-gradient(ellipse 75% 75% at 50% 50%, transparent 35%, black 100%)',
              maskImage:
                'radial-gradient(ellipse 75% 75% at 50% 50%, transparent 35%, black 100%)',
            }}
          />
        )}

        {/* ── 1. ULTRA-CLEAN GALLERY HEADER + HD VERLET PULL-CORD SWITCH ANCHOR ── */}
        <header
          className={`relative z-30 w-full shrink-0 overflow-visible px-4 sm:px-8 md:px-10 py-3 border-b transition-colors duration-500 ${
            isDark
              ? 'border-white/10 bg-[#0A0B10]/85'
              : 'border-black/10 bg-[#F4F1EB]/85'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Left: Quiet Museum-Grade Typography (Zero generic AI dots or slashes!) */}
            <div className="flex items-baseline gap-3 select-none">
              <span
                className={`font-mono text-[10.5px] tracking-[0.18em] tabular-nums ${
                  isDark ? 'text-stone-400' : 'text-stone-500'
                }`}
              >
                02
              </span>
              <span
                className={`w-[1px] h-3 self-center ${
                  isDark ? 'bg-white/20' : 'bg-black/15'
                }`}
              />
              <span
                className={`text-base sm:text-[18px] tracking-[-0.01em] ${
                  isDark ? 'text-stone-100' : 'text-[#18181B]'
                }`}
                style={{ fontFamily: '"Instrument Serif", "Playfair Display", Georgia, serif' }}
              >
                Beyond The Mask
              </span>
            </div>

            {/* Right: HD Pull-Cord Bolt Switch + 3D Globe / List + Close */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 overflow-visible">
              {/* HD Verlet-Physics Pull-Cord Switch anchored RIGHT at the theme bolt position! */}
              <PullCordSwitch
                isDark={isDark}
                onToggle={() => setMood((m) => (m === 'studio' ? 'planetarium' : 'studio'))}
                paused={selectedFrame !== null}
              />

              {/* View Mode Switcher: 3D Globe | List */}
              <div
                role="tablist"
                aria-label="Mode tampilan arsip"
                className={`inline-flex items-center p-0.5 rounded-full border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'
                }`}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === 'orbit'}
                  onClick={() => setViewMode('orbit')}
                  className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full font-mono text-[9.5px] sm:text-[10px] font-bold tracking-[0.14em] uppercase transition-all cursor-pointer ${
                    viewMode === 'orbit'
                      ? isDark
                        ? 'bg-white text-[#090B10] shadow-sm'
                        : 'bg-[#18181B] text-[#FAF8F5] shadow-sm'
                      : isDark
                        ? 'text-stone-400 hover:text-white'
                        : 'text-stone-600 hover:text-[#18181B]'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span className="hidden sm:inline">3D GLOBE</span>
                  <span className="sm:hidden">3D</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === 'list'}
                  onClick={() => setViewMode('list')}
                  className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full font-mono text-[9.5px] sm:text-[10px] font-bold tracking-[0.14em] uppercase transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? isDark
                        ? 'bg-white text-[#090B10] shadow-sm'
                        : 'bg-[#18181B] text-[#FAF8F5] shadow-sm'
                      : isDark
                        ? 'text-stone-400 hover:text-white'
                        : 'text-stone-600 hover:text-[#18181B]'
                  }`}
                >
                  <LayoutList className="w-3 h-3" />
                  <span>LIST</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleClose(true)}
                className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:pl-3.5 sm:pr-2 py-1.5 rounded-full border font-mono text-[10px] sm:text-[10.5px] font-bold tracking-[0.16em] uppercase transition-all cursor-pointer shadow-sm ${
                  isDark
                    ? 'border-white/15 bg-white/10 text-white hover:bg-white hover:text-[#090B10]'
                    : 'border-black/15 bg-white text-[#18181B] hover:bg-[#18181B] hover:text-white'
                }`}
                title="Tutup Arsip (Esc)"
              >
                <span className="hidden sm:inline">TUTUP</span>
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-white/15' : 'bg-black/5'
                  }`}
                >
                  <X className="w-3 h-3" />
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════════════
            2A. MODE 3D GLOBE — TRUE CSS 3D CURVED PHOTO GLOBE + 4-CORNER FRAMING
            ═══════════════════════════════════════════════════════════════════ */}
        {viewMode === 'orbit' ? (
          <div
            ref={globeStageRef}
            onPointerDown={handleGlobePointerDown}
            onPointerMove={handleGlobePointerMove}
            onPointerUp={handleGlobePointerUp}
            onPointerCancel={handleGlobePointerUp}
            onPointerLeave={handleGlobePointerUp}
            className="relative z-20 flex-1 min-h-0 w-full overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            {/* ── CLEAN DIAGONAL EDITORIAL FRAMING TYPOGRAPHY (NO CORNER CLUTTER!) ── */}
            {/* Top-Left Corner Sculptural Title */}
            <div className="pointer-events-none absolute top-5 sm:top-7 left-5 sm:left-10 z-10 select-none">
              <h2
                className={`text-3xl sm:text-5xl lg:text-[54px] font-normal leading-[0.95] tracking-[-0.02em] transition-colors duration-500 ${
                  isDark ? 'text-white' : 'text-[#18181B]'
                }`}
                style={{ fontFamily: '"Instrument Serif", "Playfair Display", Georgia, serif' }}
              >
                <span className="block">Beyond</span>
                <span className={`block italic ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                  The Mask
                </span>
              </h2>
              <p
                className={`mt-2 font-mono text-[9.5px] tracking-[0.2em] uppercase ${
                  isDark ? 'text-stone-500' : 'text-stone-400'
                }`}
              >
                15 Moments
              </p>
            </div>

            {/* Bottom-Right Corner Mirror Title */}
            <div className="pointer-events-none hidden sm:block absolute bottom-5 sm:bottom-7 right-5 sm:right-10 z-10 text-right select-none">
              <p
                className={`text-2xl sm:text-4xl lg:text-[46px] font-normal leading-[0.96] tracking-[-0.02em] transition-colors duration-500 ${
                  isDark ? 'text-white' : 'text-[#18181B]'
                }`}
                style={{ fontFamily: '"Instrument Serif", "Playfair Display", Georgia, serif' }}
              >
                <span className="block">Stories</span>
                <span className={`block italic ${isDark ? 'text-[#E8715D]' : 'text-[#C83E2B]'}`}>
                  You Can Orbit
                </span>
              </p>
            </div>

            {/* Subtle Orbital Meridian Wireframe Ring framing the 3D Globe */}
            <svg
              aria-hidden="true"
              viewBox="0 0 600 600"
              fill="none"
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 transition-opacity duration-500"
              style={{
                width: `${Math.round(sphereRadius * 2.52)}px`,
                height: `${Math.round(sphereRadius * 2.52)}px`,
              }}
            >
              <circle
                cx="300"
                cy="300"
                r="268"
                stroke={isDark ? '#FFFFFF' : '#18181B'}
                strokeOpacity={isDark ? 0.10 : 0.08}
                strokeWidth="1"
                strokeDasharray="3 7"
              />
              <ellipse
                cx="300"
                cy="300"
                rx="268"
                ry="86"
                stroke={isDark ? '#F59E0B' : '#18181B'}
                strokeOpacity={isDark ? 0.14 : 0.06}
                strokeWidth="1"
              />
              <line x1="300" y1="16" x2="300" y2="30" stroke="#C83E2B" strokeOpacity="0.65" strokeWidth="1.2" />
              <line x1="300" y1="570" x2="300" y2="584" stroke="#C83E2B" strokeOpacity="0.65" strokeWidth="1.2" />
              <line x1="16" y1="300" x2="30" y2="300" stroke="#C83E2B" strokeOpacity="0.65" strokeWidth="1.2" />
              <line x1="570" y1="300" x2="584" y2="300" stroke="#C83E2B" strokeOpacity="0.65" strokeWidth="1.2" />
            </svg>

            {/* Gallery Floating Floor Shadow directly beneath the 3D Globe */}
            <div
              ref={globeShadowRef}
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 z-0 rounded-full transition-opacity duration-500"
              style={{
                top: `calc(50% + ${Math.round(sphereRadius * 1.06)}px)`,
                width: `${Math.round(sphereRadius * 1.65)}px`,
                height: `${Math.round(sphereRadius * 0.24)}px`,
                transform: 'translate3d(-50%, 0, 0)',
                background: isDark
                  ? 'radial-gradient(ellipse at center, rgba(200,62,43,0.22) 0%, rgba(0,0,0,0.45) 45%, transparent 72%)'
                  : 'radial-gradient(ellipse at center, rgba(24,24,27,0.16) 0%, rgba(24,24,27,0.05) 48%, transparent 72%)',
              }}
            />

            {/* ── TRUE CSS 3D PERSPECTIVE CAMERA & PRESERVE-3D SPHERICAL GLOBE ── */}
            <div
              className="relative z-20 flex items-center justify-center"
              style={{
                perspective: `${Math.round(sphereRadius * 4.4)}px`,
                perspectiveOrigin: '50% 50%',
                width: `${Math.round(sphereRadius * 2.2)}px`,
                height: `${Math.round(sphereRadius * 2.2)}px`,
              }}
            >
              <div
                ref={globeRigRef}
                className="relative w-full h-full will-change-transform"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: 'scale3d(0.72, 0.72, 0.72) rotateX(-10deg) rotateY(-26deg)',
                }}
              >
                {globeTiles.map((tile) => {
                  const isTileHovered = hoveredTileKey === tile.key;
                  const liftZ = isTileHovered ? sphereRadius + 24 : sphereRadius;
                  const effScale = tile.tileScale * (isTileHovered ? 1.09 : 1);

                  return (
                    <div
                      key={tile.key}
                      className="absolute top-1/2 left-1/2"
                      style={{
                        width: `${tileW}px`,
                        height: `${tileH}px`,
                        marginLeft: `${-tileW / 2}px`,
                        marginTop: `${-tileH / 2}px`,
                        transformStyle: 'preserve-3d',
                        transform: `rotateY(${tile.lon.toFixed(2)}deg) rotateX(${tile.lat.toFixed(2)}deg) translateZ(${liftZ}px) scale(${effScale.toFixed(3)})`,
                        transition: 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
                      }}
                    >
                      {/* FRONT EXTERIOR FACE: Crisp Full-Color Tangent Photo Tile (Interactive!) */}
                      <button
                        type="button"
                        onMouseEnter={() => {
                          setHoveredTileKey(tile.key);
                          setHoveredFrame(tile.frame);
                          activeIdxRef.current = tile.frameIdx;
                          setActiveIdx(tile.frameIdx);
                        }}
                        onMouseLeave={() => {
                          setHoveredTileKey(null);
                          setHoveredFrame(null);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (globeDragDistRef.current > 8) return;
                          openLightbox(tile.frame);
                        }}
                        aria-label={`Buka cerita: ${tile.frame.title}`}
                        className={`group absolute inset-0 w-full h-full rounded-[6px] overflow-hidden cursor-pointer focus:outline-none transition-shadow duration-200 ${
                          isTileHovered
                            ? isDark
                              ? 'ring-2 ring-[#E8715D] shadow-[0_14px_34px_rgba(200,62,43,0.45)]'
                              : 'ring-2 ring-[#C83E2B] shadow-[0_16px_34px_rgba(24,24,27,0.30)]'
                            : isDark
                              ? 'ring-1 ring-white/20 shadow-[0_8px_22px_rgba(0,0,0,0.55)]'
                              : 'ring-1 ring-black/15 shadow-[0_8px_20px_rgba(24,24,27,0.16)]'
                        }`}
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          backgroundColor: isDark ? '#15171F' : '#E7E2D8',
                        }}
                      >
                        <img
                          src={tile.frame.src}
                          alt={tile.frame.title}
                          draggable={false}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover object-center pointer-events-none transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Subtle Hover Index + Read Pill (Clean & unobtrusive!) */}
                        <div
                          className={`pointer-events-none absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 via-black/35 to-transparent flex items-end justify-between transition-opacity duration-200 ${
                            isTileHovered ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <span className="font-mono text-[8.5px] font-bold tracking-wider text-white/95 truncate max-w-[78%]">
                            {tile.frame.number} · {tile.frame.title}
                          </span>
                          <ArrowUpRight className="w-3 h-3 text-[#F28B78] shrink-0" />
                        </div>
                      </button>

                      {/* INNER BACK FACE: Soft Translucent Silhouette visible through the 3D Globe! */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 w-full h-full rounded-[6px] overflow-hidden"
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                          backgroundColor: isDark ? '#0E1018' : '#DDD7CC',
                          border: isDark
                            ? '1px solid rgba(255,255,255,0.08)'
                            : '1px solid rgba(24,24,27,0.08)',
                        }}
                      >
                        <img
                          src={tile.frame.src}
                          alt=""
                          draggable={false}
                          loading="lazy"
                          decoding="async"
                          className={`w-full h-full object-cover object-center scale-x-[-1] ${
                            isDark ? 'opacity-30 saturate-50' : 'opacity-30 saturate-50'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════════════
             2B. MODE LIST — GRAND EDITORIAL STORYBOARD RUNWAY (ADAPTIVE MOOD!)
             ═══════════════════════════════════════════════════════════════════ */
          <div
            ref={trackWrapRef}
            onPointerDown={handleListPointerDown}
            onPointerMove={handleListPointerMove}
            onPointerUp={handleListPointerUp}
            onPointerCancel={handleListPointerUp}
            onPointerLeave={handleListPointerUp}
            className="relative z-20 flex-1 min-h-0 w-full flex items-center overflow-hidden cursor-grab active:cursor-grabbing"
          >
            <div
              ref={trackRef}
              className="flex items-center gap-6 sm:gap-9 md:gap-11 px-[8vw] sm:px-[12vw] py-6 will-change-transform"
            >
              {filteredFrames.map((frame, idx) => {
                const isAnyHovered = hoveredFrame !== null;
                const isThisHovered = hoveredFrame?.id === frame.id;
                const isDimmed = isAnyHovered && !isThisHovered;

                return (
                  <article
                    key={frame.id}
                    ref={(el) => {
                      listCardRefs.current[idx] = el as HTMLDivElement | null;
                    }}
                    onMouseEnter={() => setHoveredFrame(frame)}
                    onMouseLeave={() => setHoveredFrame(null)}
                    onClick={() => {
                      if (listDragMovedRef.current > 8) return;
                      openLightbox(frame);
                    }}
                    className={`story-card group relative shrink-0 flex flex-col justify-between border p-3.5 sm:p-4 transition-all duration-300 ease-out cursor-pointer ${getSilhouetteClasses(
                      frame.silhouette,
                      idx
                    )} ${
                      isDark
                        ? isThisHovered
                          ? 'bg-[#141620] border-[#E8715D] shadow-[0_28px_60px_-14px_rgba(0,0,0,0.7)] -translate-y-2 z-20'
                          : isDimmed
                            ? 'bg-[#10121A] border-white/10 opacity-45 scale-[0.985]'
                            : 'bg-[#11131B] border-white/15 shadow-[0_14px_34px_-10px_rgba(0,0,0,0.5)]'
                        : isThisHovered
                          ? 'bg-[#FAF8F5] border-[#18181B]/60 shadow-[0_28px_60px_-14px_rgba(24,24,27,0.22)] -translate-y-2 z-20'
                          : isDimmed
                            ? 'bg-[#FAF8F5] border-black/10 opacity-55 scale-[0.985]'
                            : 'bg-[#FAF8F5] border-black/15 shadow-[0_12px_34px_-10px_rgba(24,24,27,0.10)]'
                    }`}
                  >
                    <div
                      className={`absolute top-0 left-0 h-[3px] bg-[#C83E2B] transition-all duration-300 ${
                        isThisHovered ? 'w-full' : 'w-10'
                      }`}
                    />

                    <div
                      className={`flex items-center justify-between gap-2 pb-2 border-b font-mono text-[10px] tracking-[0.16em] uppercase ${
                        isDark ? 'border-white/10' : 'border-black/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-[#C83E2B] shrink-0">№ {frame.number}</span>
                        <span className={isDark ? 'text-white/20' : 'text-stone-300'}>/</span>
                        <span className={`truncate ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                          {frame.chapterLabel}
                        </span>
                      </div>
                      <span className="text-[9px] text-stone-400 truncate max-w-[110px] hidden sm:inline">
                        {frame.location}
                      </span>
                    </div>

                    <div
                      className={`relative my-3 flex-1 min-h-0 w-full overflow-hidden border ${
                        isDark ? 'bg-[#0A0C12] border-white/10' : 'bg-[#EAE5DC] border-black/10'
                      }`}
                    >
                      <img
                        ref={(el) => {
                          listImgRefs.current[idx] = el;
                        }}
                        src={frame.src}
                        alt={frame.title}
                        draggable={false}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-center pointer-events-none"
                        style={{ transform: 'scale(1.08)' }}
                      />

                      <div
                        className={`pointer-events-none absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-[#18181B]/95 text-[#FAF8F5] font-mono text-[9.5px] font-bold tracking-[0.16em] uppercase flex items-center gap-1.5 shadow-lg transition-all duration-300 ${
                          isThisHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                        }`}
                      >
                        <span>Baca Cerita</span>
                        <ArrowUpRight className="w-3 h-3 text-[#F28B78]" />
                      </div>
                    </div>

                    <div className="space-y-1 pt-0.5">
                      <h3
                        className={`text-lg sm:text-[21px] font-normal group-hover:text-[#C83E2B] transition-colors leading-tight line-clamp-1 ${
                          isDark ? 'text-white' : 'text-[#18181B]'
                        }`}
                        style={{ fontFamily: '"Instrument Serif", "Playfair Display", Georgia, serif' }}
                      >
                        {frame.title}
                      </h3>
                      <p
                        className={`font-sans text-[11.5px] sm:text-xs leading-relaxed line-clamp-2 ${
                          isDark ? 'text-stone-400' : 'text-stone-600'
                        }`}
                      >
                        {frame.summary}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 3. BOTTOM TELEMETRY & GLOBE CONTROLS BAR ── */}
        <footer
          className={`relative z-30 w-full shrink-0 px-4 sm:px-8 md:px-10 py-2.5 border-t transition-colors duration-500 ${
            isDark
              ? 'border-white/10 bg-[#0A0B10]/90'
              : 'border-black/10 bg-[#F4F1EB]/90'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Live Hovered / Focused Story Preview */}
            <button
              type="button"
              onClick={() => activeFramePreview && openLightbox(activeFramePreview)}
              className="flex items-center gap-2 min-w-0 max-w-[54%] md:max-w-[38%] font-mono text-[10px] sm:text-[10.5px] tracking-[0.14em] uppercase text-left group cursor-pointer"
              title="Klik untuk membuka cerita lengkap"
            >
              <span className="font-bold text-[#C83E2B] tabular-nums shrink-0">
                № {activeFramePreview?.number ?? '01'}
              </span>
              <span className={isDark ? 'text-white/25 shrink-0' : 'text-stone-300 shrink-0'}>—</span>
              <span
                className={`font-semibold truncate transition-colors ${
                  isDark
                    ? 'text-stone-100 group-hover:text-[#F28B78]'
                    : 'text-[#18181B] group-hover:text-[#C83E2B]'
                }`}
              >
                {activeFramePreview?.title}
              </span>
              <ArrowUpRight className="hidden sm:inline w-3 h-3 text-stone-400 group-hover:text-[#C83E2B] shrink-0 transition-colors" />
            </button>

            {/* Center: Globe Camera Controls (Orbit) OR Scrubber Rail (List) */}
            {viewMode === 'orbit' ? (
              <div className="hidden md:flex items-center gap-1.5">
                <span
                  className={`hidden lg:inline font-mono text-[9.5px] tracking-[0.16em] uppercase mr-2 ${
                    isDark ? 'text-stone-500' : 'text-stone-400'
                  }`}
                >
                  DRAG 360° · SCROLL ZOOM
                </span>
                <button
                  type="button"
                  onClick={() => setAutoSpin((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono text-[9.5px] font-bold tracking-[0.14em] uppercase transition-colors cursor-pointer ${
                    isDark
                      ? 'border-white/15 bg-white/5 text-stone-200 hover:bg-white hover:text-[#090B10]'
                      : 'border-black/15 bg-white text-[#18181B] hover:bg-[#18181B] hover:text-white'
                  }`}
                  title={autoSpin ? 'Jeda putaran globe' : 'Lanjutkan putaran globe'}
                >
                  {autoSpin ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{autoSpin ? 'SPIN' : 'PAUSED'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    zoomTargetRef.current = clamp(zoomTargetRef.current - 0.14, 0.74, 1.32);
                  }}
                  aria-label="Perkecil globe"
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                    isDark
                      ? 'border-white/15 bg-white/5 text-stone-200 hover:bg-white hover:text-[#090B10]'
                      : 'border-black/15 bg-white text-[#18181B] hover:bg-[#18181B] hover:text-white'
                  }`}
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    zoomTargetRef.current = clamp(zoomTargetRef.current + 0.14, 0.74, 1.32);
                  }}
                  aria-label="Perbesar globe"
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                    isDark
                      ? 'border-white/15 bg-white/5 text-stone-200 hover:bg-white hover:text-[#090B10]'
                      : 'border-black/15 bg-white text-[#18181B] hover:bg-[#18181B] hover:text-white'
                  }`}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={resetGlobeView}
                  aria-label="Reset sudut globe"
                  title="Reset sudut pandang"
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                    isDark
                      ? 'border-white/15 bg-white/5 text-stone-200 hover:bg-white hover:text-[#090B10]'
                      : 'border-black/15 bg-white text-[#18181B] hover:bg-[#18181B] hover:text-white'
                  }`}
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-3 max-w-md mx-auto">
                <span className="font-mono text-[10px] font-bold text-stone-500 tabular-nums shrink-0">
                  {String(activeIdx + 1).padStart(2, '0')} / {String(filteredFrames.length).padStart(2, '0')}
                </span>
                <div
                  ref={scrubberTrackRef}
                  onClick={handleScrubberClick}
                  className="relative flex-1 h-2 flex items-center cursor-pointer"
                  title="Klik untuk lompat ke posisi arsip"
                >
                  <div
                    className={`w-full h-[2px] rounded-full overflow-hidden ${
                      isDark ? 'bg-white/15' : 'bg-black/15'
                    }`}
                  >
                    <div
                      ref={scrubberFillRef}
                      className="w-full h-full origin-left bg-[#C83E2B] will-change-transform"
                      style={{ transform: 'scaleX(0.08)' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Right: Tactile Prev / Next Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline font-mono text-[10px] font-bold text-stone-500 tabular-nums mr-1">
                {String(activeIdx + 1).padStart(2, '0')} / {String(filteredFrames.length).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={() => navigateStep(-1)}
                disabled={viewMode === 'list' && activeIdx <= 0}
                aria-label="Cerita sebelumnya"
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors disabled:opacity-25 disabled:pointer-events-none cursor-pointer active:scale-95 ${
                  isDark
                    ? 'border-white/15 bg-white/5 text-white hover:bg-white hover:text-[#090B10]'
                    : 'border-black/15 bg-white text-[#18181B] hover:bg-[#18181B] hover:text-white'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => navigateStep(1)}
                disabled={viewMode === 'list' && activeIdx >= filteredFrames.length - 1}
                aria-label="Cerita berikutnya"
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors disabled:opacity-25 disabled:pointer-events-none cursor-pointer active:scale-95 ${
                  isDark
                    ? 'border-white/15 bg-white/5 text-white hover:bg-white hover:text-[#090B10]'
                    : 'border-black/15 bg-white text-[#18181B] hover:bg-[#18181B] hover:text-white'
                }`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          UPGRADED SPATIAL LIGHTBOX DOSSIER + CLICKABLE MINI FILMSTRIP
          ═══════════════════════════════════════════════════════════════════ */}
      {selectedFrame && (
        <div
          ref={lightboxOverlayRef}
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-label={`Detail Dokumen: ${selectedFrame.title}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox(true);
          }}
          className="fixed inset-0 z-[250] backdrop-blur-md bg-black/70 flex items-center justify-center p-3 sm:p-6 md:p-8 select-none cursor-pointer"
        >
          <div
            ref={lightboxModalRef}
            onClick={(e) => e.stopPropagation()}
            className={`cursor-default relative w-full max-w-5xl max-h-[92dvh] border shadow-[0_30px_80px_rgba(0,0,0,0.45)] overflow-hidden flex flex-col select-text ${
              isDark
                ? 'bg-[#12141D] border-white/15 text-[#F4F1EA]'
                : 'bg-[#FAF8F5] border-black/20 text-[#18181B]'
            }`}
          >
            <div className="h-1 w-full bg-[#C83E2B] shrink-0" />

            <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden editorial-scrollbar">
              {/* Left High-Res Archival Photo Stage */}
              <div
                className={`lg:w-7/12 relative flex items-center justify-center min-h-[220px] sm:min-h-[320px] lg:min-h-[460px] p-4 sm:p-7 border-b lg:border-b-0 lg:border-r shrink-0 ${
                  isDark
                    ? 'bg-[#090B10] border-white/10'
                    : 'bg-[#EBE6DC] border-black/10'
                }`}
              >
                <img
                  src={selectedFrame.src}
                  alt={selectedFrame.title}
                  draggable={false}
                  decoding="async"
                  className="dossier-main-img max-h-[42vh] sm:max-h-[52vh] lg:max-h-[62vh] w-auto max-w-full object-contain shadow-lg border border-black/10"
                />

                <div className="absolute inset-y-0 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = filteredFrames.findIndex((f) => f.id === selectedFrame.id);
                      if (cur > 0) navigateLightbox(filteredFrames[cur - 1], -1);
                    }}
                    disabled={filteredFrames.findIndex((f) => f.id === selectedFrame.id) <= 0}
                    aria-label="Dokumen sebelumnya"
                    className="pointer-events-auto w-9 h-9 rounded-full bg-[#FAF8F5]/95 border border-black/15 text-[#18181B] hover:bg-[#18181B] hover:text-white flex items-center justify-center transition-all disabled:opacity-20 disabled:pointer-events-none cursor-pointer shadow-md"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = filteredFrames.findIndex((f) => f.id === selectedFrame.id);
                      if (cur !== -1 && cur < filteredFrames.length - 1) {
                        navigateLightbox(filteredFrames[cur + 1], 1);
                      }
                    }}
                    disabled={
                      filteredFrames.findIndex((f) => f.id === selectedFrame.id) >=
                      filteredFrames.length - 1
                    }
                    aria-label="Dokumen berikutnya"
                    className="pointer-events-auto w-9 h-9 rounded-full bg-[#FAF8F5]/95 border border-black/15 text-[#18181B] hover:bg-[#18181B] hover:text-white flex items-center justify-center transition-all disabled:opacity-20 disabled:pointer-events-none cursor-pointer shadow-md"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Right Narrative Dossier */}
              <div
                data-lenis-prevent
                className="lg:w-5/12 p-5 sm:p-7 flex flex-col justify-between lg:overflow-y-auto editorial-scrollbar"
              >
                <div className="space-y-4">
                  <div
                    className={`flex items-center justify-between pb-3 border-b font-mono text-[11px] ${
                      isDark ? 'border-white/10' : 'border-black/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#C83E2B]" />
                      <span className="font-bold uppercase">
                        DOKUMEN {selectedFrame.number} // {String(BEYOND_THE_MASK_FRAMES.length).padStart(2, '0')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => closeLightbox(true)}
                      aria-label="Tutup detail cerita"
                      className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                        isDark
                          ? 'border-white/15 hover:bg-white hover:text-[#090B10]'
                          : 'border-black/15 hover:bg-[#18181B] hover:text-white'
                      }`}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div>
                    <span className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-[#C83E2B] block mb-1">
                      {selectedFrame.chapterLabel}
                    </span>
                    <h2
                      className="text-2xl sm:text-3xl font-normal leading-tight"
                      style={{ fontFamily: '"Instrument Serif", "Playfair Display", Georgia, serif' }}
                    >
                      {selectedFrame.title}
                    </h2>
                  </div>

                  <p
                    className={`font-sans text-sm leading-relaxed ${
                      isDark ? 'text-stone-300' : 'text-stone-700'
                    }`}
                  >
                    {selectedFrame.extendedStory}
                  </p>

                  <div
                    className={`grid grid-cols-2 gap-3 pt-3 border-t font-mono text-[10.5px] ${
                      isDark ? 'border-white/10' : 'border-black/10'
                    }`}
                  >
                    <div>
                      <span className="block text-[9px] uppercase tracking-[0.18em] text-stone-400">
                        Lokasi
                      </span>
                      <span className="font-semibold">{selectedFrame.location}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-[0.18em] text-stone-400">
                        Peran
                      </span>
                      <span className="font-semibold">{selectedFrame.role}</span>
                    </div>
                  </div>
                </div>

                {/* Compact Clickable Filmstrip Inside Dossier */}
                <div
                  className={`mt-6 pt-3 border-t ${
                    isDark ? 'border-white/10' : 'border-black/10'
                  }`}
                >
                  <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-stone-400 mb-2">
                    Lompat ke arsip lain
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {filteredFrames.map((item) => {
                      const isCurr = item.id === selectedFrame.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            const cur = filteredFrames.findIndex((f) => f.id === selectedFrame.id);
                            const next = filteredFrames.findIndex((f) => f.id === item.id);
                            navigateLightbox(item, next >= cur ? 1 : -1);
                          }}
                          className={`relative shrink-0 w-12 h-10 overflow-hidden border-2 transition-all cursor-pointer ${
                            isCurr
                              ? 'border-[#C83E2B] scale-105 opacity-100'
                              : isDark
                                ? 'border-white/15 opacity-55 hover:opacity-100'
                                : 'border-black/10 opacity-55 hover:opacity-100'
                          }`}
                          title={item.title}
                        >
                          <img
                            src={item.src}
                            alt={item.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

export default Chapter02PrinciplesModal;
