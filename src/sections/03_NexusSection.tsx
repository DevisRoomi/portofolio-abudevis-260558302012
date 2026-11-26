import React, { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FieldNotesArchiveModal from '../components/FieldNotesArchiveModal';
import Chapter02PrinciplesModal from '../components/Chapter02PrinciplesModal';
import Chapter03ReceiptsModal from '../components/Chapter03ReceiptsModal';
import { CERTIFICATES_DATA } from '../data/certificates';

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════════════════
   03 · THE NEXUS — THE FORGE & PERSONA (KOTA-INSPIRED CHOREOGRAPHY)
   
   1. Para Karakter Utama (Center Stage Runway):
      - Berdiri tepat di TENGAH panggung ketika aktif.
      - Karakter 02 & 03 disembunyikan total (autoAlpha: 0) saat belum gilirannya.
      - Frame Karakter 01 100% bersih tanpa antrean mengintip di sudut.
      - Transisi bergantian naik dari bawah ke tengah, lalu meluncur keluar ke atas.
   
   2. Sang Narator (Sticky Teks di Kiri):
      - Terkunci di kolom kiri (w-[280px] - w-[370px]), terbebas dari panggung.
      - Tipografi editorial minimalis, dialog berganti otomatis per babak.
   
   3. Sang Penunjuk Babak (Angka Raksasa di Kanan):
      - Terkunci di kolom kanan mandiri (shrink-0).
      - Bergulir sinkron 1:1 via GSAP scrub (01 -> 02 -> 03).
   
   4. Interaksi Portal Modal:
      - Tombol cta membuka ekspansi radial lingkaran hitam halus untuk tiap babak.
   ═══════════════════════════════════════════════════════════════════════════ */

interface ChapterData {
  id: string;
  number: string;
  shortLabel: string;
  tagline: string;
  title: string;
  quote: string;
  caption: string;
  ctaText: string;
  imgUrl: string;
  imgAlt: string;
  imgHeightClass: string;
  imgFilter?: string;
  imgMask?: string;
  imgTransform?: string;
  modalCategory: string;
  modalTags: string[];
}

const CHAPTERS: ChapterData[] = [
  {
    id: 'adventurer',
    number: '01',
    shortLabel: 'FIELD NOTES',
    tagline: 'FIELD NOTES // ANALOG EXPEDITION',
    title: 'OFF-SCREEN',
    quote: 'Daya tahan fisik dan ketenangan kepala sebelum baris kode pertama.',
    caption:
      'Dokumentasi rute pendakian, navigasi medan nyata, dan arsip visual reflektif di luar riuhnya ruang digital.',
    ctaText: 'LIHAT GALERI',
    imgUrl: '/assets/person/awalan/devis_portrait_4k_hd.webp',
    imgAlt: 'Abu Devis the Adventurer',
    imgHeightClass: 'h-[68vh] sm:h-[76vh] max-h-[700px]',
    imgFilter:
      'sepia(0.08) contrast(0.96) brightness(1.02) drop-shadow(0 24px 32px rgba(28, 25, 23, 0.12))',
    imgMask:
      'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.85) 4%, black 14%)',
    modalCategory: 'Analog Resilience & Life Documentation',
    modalTags: ['Puncak Merbabu · Lemongan · Sentul', '40+ Dokumentasi Lapangan', 'Pintu Arsip Terbuka'],
  },
  {
    id: 'spiderman',
    number: '02',
    shortLabel: 'PRINCIPLES',
    tagline: 'GROUNDED // PRINCIPLES',
    title: 'BEYOND THE MASK',
    quote: 'Urip iku urup — Hidup cuma sekali, pastikan menyala dan memberi arti.',
    caption:
      'Jurnal prinsip, interaksi sosial, dan jeda kontemplatif untuk menjaga kompas nilai tetap berpijak ke tanah.',
    ctaText: 'BACA JURNAL',
    imgUrl: '/assets/person/awalan/spiderman_thobe_hd.webp',
    imgAlt: 'Spider-Man in a Regal Thobe',
    imgHeightClass: 'h-[62vh] sm:h-[68vh] lg:h-[72vh] max-h-[640px]',
    imgFilter:
      'contrast(0.98) brightness(1.01) drop-shadow(0 24px 32px rgba(28, 25, 23, 0.14))',
    imgMask:
      'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.85) 4%, black 12%)',
    imgTransform: 'scale(1.0)',
    modalCategory: 'Moral Integrity & Daily Realities',
    modalTags: ['Adab & Integritas', 'Refleksi Harian', 'Komunitas & Diskusi Nyata'],
  },
  {
    id: 'receipts',
    number: '03',
    shortLabel: 'RECEIPTS',
    tagline: 'VERIFIED // CREDENTIALS',
    title: 'THE RECEIPTS',
    quote: 'Bukti nyata dedikasi teknis yang ditempa lewat malam panjang.',
    caption:
      'Koleksi sertifikasi rekayasa perangkat lunak, arsitektur sistem modular, dan pengakuan kompetensi yang terverifikasi.',
    ctaText: 'LIHAT SERTIFIKAT',
    imgUrl: '/assets/person/awalan/ironman_receipts_hd.webp',
    imgAlt: 'Abu Devis Credentials & Certificates',
    imgHeightClass: 'h-[68vh] sm:h-[76vh] max-h-[700px]',
    imgFilter:
      'contrast(0.98) brightness(1.0) drop-shadow(0 24px 32px rgba(28, 25, 23, 0.14))',
    imgMask:
      'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.85) 4%, black 12%)',
    imgTransform: 'scale(1.02)',
    modalCategory: 'Software Engineering & Verified Accomplishments',
    modalTags: ['Rekayasa Perangkat Lunak', 'Arsitektur Modular & Full-Stack', '15+ Sertifikasi Terverifikasi'],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   EDITORIAL BESPOKE DESCENDING SPIDER / APPARATUS PROMPT (AWWWARDS-STYLE)
   A thread descends from the top anchor dial with a minimal silhouette icon.
   As it drops, letters C - L - I - C - K - ← unfold along the silk line.
   At the bottom, it enters idle pendulum swing + micro-twitch.
   Reacts dynamically on character hover (recoil upward + taut thread + arrow pulse).
   ═══════════════════════════════════════════════════════════════════════════ */
const CLICK_PROMPT_CHARS = ['c', 'l', 'i', 'c', 'k', '←'];

const SWEEP_THEMES = [
  // Chapter 1 (Adventurer): Electric Cyan / Sky Blue
  {
    color: '#0284c7',
    highlight: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.75)',
  },
  // Chapter 2 (Spider-Man): Regal Crimson / Scarlet
  {
    color: '#dc2626',
    highlight: '#f87171',
    glow: 'rgba(239, 68, 68, 0.75)',
  },
  // Chapter 3 (Iron Man): Arc Reactor Amber / Gold
  {
    color: '#d97706',
    highlight: '#fbbf24',
    glow: 'rgba(245, 158, 11, 0.75)',
  },
];

// 1. High-End Editorial Spider Silhouette with Animated Crawling Legs
const SpiderSilhouette: React.FC<{ isHovered?: boolean; isCrawling?: boolean }> = ({
  isHovered,
  isCrawling,
}) => (
  <svg
    viewBox="0 0 20 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-[18px] h-[20px] transition-transform duration-300 drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] ${
      isHovered ? 'scale-110' : 'scale-100'
    }`}
  >
    {/* Left Legs - Group A (1, 3) */}
    <g className={isCrawling ? 'animate-spider-leg-a' : ''} style={{ transformOrigin: '8px 10px' }}>
      <path d="M 8.5 7.5 Q 4 3 2.5 6.5" stroke="#111215" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 8 11.5 Q 2 13 1.5 16.5" stroke="#111215" strokeWidth="1.2" strokeLinecap="round" />
    </g>

    {/* Left Legs - Group B (2, 4) */}
    <g className={isCrawling ? 'animate-spider-leg-b' : ''} style={{ transformOrigin: '8px 10px' }}>
      <path d="M 8 9.5 Q 2 7 1 11" stroke="#111215" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 8.5 13.5 Q 4.5 17.5 3.5 21" stroke="#111215" strokeWidth="1.2" strokeLinecap="round" />
    </g>

    {/* Right Legs - Group A (2, 4) */}
    <g className={isCrawling ? 'animate-spider-leg-a' : ''} style={{ transformOrigin: '12px 10px' }}>
      <path d="M 12 9.5 Q 18 7 19 11" stroke="#111215" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 11.5 13.5 Q 15.5 17.5 16.5 21" stroke="#111215" strokeWidth="1.2" strokeLinecap="round" />
    </g>

    {/* Right Legs - Group B (1, 3) */}
    <g className={isCrawling ? 'animate-spider-leg-b' : ''} style={{ transformOrigin: '12px 10px' }}>
      <path d="M 11.5 7.5 Q 16 3 17.5 6.5" stroke="#111215" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 12 11.5 Q 18 13 18.5 16.5" stroke="#111215" strokeWidth="1.2" strokeLinecap="round" />
    </g>

    {/* Cephalothorax (Head) */}
    <ellipse cx="10" cy="7.5" rx="2.2" ry="2" fill="#111215" />
    {/* Abdomen */}
    <ellipse cx="10" cy="13" rx="3.3" ry="4.5" fill="#111215" />

    {/* Iconic Spider-Man Abdomen Micro Inlay */}
    <path
      d="M 9.3 11.2 L 10.7 11.2 L 10 12.4 L 10.7 14.2 L 9.3 14.2 L 10 12.4 Z"
      fill="#FAF8F5"
      opacity="0.85"
    />
  </svg>
);

// 2. High-End Vintage Nautical & Topographic Compass Rose (Field Notes // Hiker)
interface CompassRoseProps {
  isHovered?: boolean;
  isSpinningInCenter?: boolean;
  hasSettled?: boolean;
}

const CompassRoseSilhouette: React.FC<CompassRoseProps> = ({
  isHovered,
  isSpinningInCenter,
  hasSettled,
}) => (
  <div className="relative flex items-center justify-center">
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-[26px] h-[26px] xs:w-[28px] xs:h-[28px] transition-transform duration-300 drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] ${
        isHovered ? 'scale-115' : 'scale-100'
      }`}
    >
      <defs>
        {/* Iridescent Aurora Shifting Gradient for the Left Needle (West / Barat) */}
        <linearGradient id="auroraLeftNeedle" x1="100%" y1="50%" x2="0%" y2="50%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="35%" stopColor="#10b981" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>

        {/* Center Multi-Color Gradient for in-place mid-spin */}
        <radialGradient id="compassCenterChromatic" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="35%" stopColor="#06b6d4" />
          <stop offset="70%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>

      {/* Outer & Inner Degree Dial Rings */}
      <circle
        cx="50"
        cy="50"
        r="31"
        stroke={isSpinningInCenter ? 'url(#compassCenterChromatic)' : '#111215'}
        strokeWidth={isSpinningInCenter ? '1.5' : '1'}
        fill="none"
        opacity="0.85"
      />
      <circle
        cx="50"
        cy="50"
        r="26"
        stroke={isSpinningInCenter ? 'url(#compassCenterChromatic)' : '#111215'}
        strokeWidth="0.8"
        fill="none"
        opacity="0.75"
      />

      {/* Radial Degree Graduation Ticks (16 Ticks around the ring) */}
      <g stroke={isSpinningInCenter ? 'url(#compassCenterChromatic)' : '#111215'} strokeWidth="0.8" opacity="0.8">
        <line x1="50" y1="19" x2="50" y2="24" />
        <line x1="50" y1="76" x2="50" y2="81" />
        <line x1="19" y1="50" x2="24" y2="50" />
        <line x1="76" y1="50" x2="81" y2="50" />
        <line x1="28.1" y1="28.1" x2="31.6" y2="31.6" />
        <line x1="68.4" y1="68.4" x2="71.9" y2="71.9" />
        <line x1="71.9" y1="28.1" x2="68.4" y2="31.6" />
        <line x1="31.6" y1="68.4" x2="28.1" y2="71.9" />
        <line x1="38.5" y1="20.5" x2="40.5" y2="25.2" />
        <line x1="61.5" y1="20.5" x2="59.5" y2="25.2" />
        <line x1="38.5" y1="79.5" x2="40.5" y2="74.8" />
        <line x1="61.5" y1="79.5" x2="59.5" y2="74.8" />
        <line x1="20.5" y1="38.5" x2="25.2" y2="40.5" />
        <line x1="20.5" y1="61.5" x2="25.2" y2="59.5" />
        <line x1="79.5" y1="38.5" x2="74.8" y2="40.5" />
        <line x1="79.5" y1="61.5" x2="74.8" y2="59.5" />
      </g>

      {/* 4 Secondary Points (NE, SE, SW, NW) with Faceted Shading */}
      <g>
        {/* NE Point */}
        <polygon points="50,50 71,29 55,45" fill="#FAF8F5" stroke="#111215" strokeWidth="0.6" />
        <polygon points="50,50 71,29 45,55" fill="#111215" />
        {/* SE Point */}
        <polygon points="50,50 71,71 55,55" fill="#111215" />
        <polygon points="50,50 71,71 45,55" fill="#FAF8F5" stroke="#111215" strokeWidth="0.6" />
        {/* SW Point */}
        <polygon points="50,50 29,71 45,55" fill="#FAF8F5" stroke="#111215" strokeWidth="0.6" />
        <polygon points="50,50 29,71 55,45" fill="#111215" />
        {/* NW Point */}
        <polygon points="50,50 29,29 45,45" fill="#111215" />
        <polygon points="50,50 29,29 55,45" fill="#FAF8F5" stroke="#111215" strokeWidth="0.6" />
      </g>

      {/* 4 Primary Star Points (Utara, Selatan, Timur, Barat) */}
      <g>
        {/* North / Utara (U) */}
        <polygon points="50,50 50,8 43,43" fill="#FAF8F5" stroke="#111215" strokeWidth="0.7" />
        <polygon points="50,50 50,8 57,43" fill="#111215" />

        {/* South / Selatan (S) */}
        <polygon points="50,50 50,92 43,57" fill="#111215" />
        <polygon points="50,50 50,92 57,57" fill="#FAF8F5" stroke="#111215" strokeWidth="0.7" />

        {/* East / Timur (T) */}
        <polygon points="50,50 92,50 57,43" fill="#FAF8F5" stroke="#111215" strokeWidth="0.7" />
        <polygon points="50,50 92,50 57,57" fill="#111215" />

        {/* WEST / BARAT (B) — POINTING DIRECTLY TO THE LEFT (TOWARDS CHARACTER 1 DEVIS)! */}
        {/* When hasSettled or hovered: shines with iridescent chromatic aurora! */}
        <g
          className={
            hasSettled || isHovered
              ? 'filter drop-shadow-[0_0_6px_rgba(6,182,212,0.95)] drop-shadow-[0_0_10px_rgba(16,185,129,0.85)]'
              : ''
          }
        >
          <polygon
            points="50,50 8,50 43,43"
            fill={hasSettled || isHovered ? 'url(#auroraLeftNeedle)' : '#FAF8F5'}
            stroke={hasSettled || isHovered ? '#06b6d4' : '#111215'}
            strokeWidth="0.8"
          />
          <polygon
            points="50,50 8,50 43,57"
            fill={hasSettled || isHovered ? 'url(#auroraLeftNeedle)' : '#111215'}
            stroke={hasSettled || isHovered ? '#ec4899' : '#111215'}
            strokeWidth="0.8"
          />
        </g>
      </g>

      {/* Center Pivot Hub */}
      <circle
        cx="50"
        cy="50"
        r="3.8"
        fill={isSpinningInCenter ? 'url(#compassCenterChromatic)' : '#111215'}
      />
      <circle cx="50" cy="50" r="1.5" fill="#FAF8F5" />

      {/* Cardinal Labels: U, T, S, B */}
      <text x="50" y="6" textAnchor="middle" fill="#111215" fontSize="7" fontWeight="900" fontFamily="serif">
        U
      </text>
      <text x="96" y="52.5" textAnchor="middle" fill="#111215" fontSize="7" fontWeight="900" fontFamily="serif">
        T
      </text>
      <text x="50" y="100" textAnchor="middle" fill="#111215" fontSize="7" fontWeight="900" fontFamily="serif">
        S
      </text>
      <text
        x="4"
        y="52.5"
        textAnchor="middle"
        fill={hasSettled || isHovered ? '#06b6d4' : '#111215'}
        fontSize="7.5"
        fontWeight="900"
        fontFamily="serif"
        className={hasSettled || isHovered ? 'filter drop-shadow-[0_0_4px_#06b6d4]' : ''}
      >
        B
      </text>
    </svg>
  </div>
);

// 3. Iconic Stark Mark VI Triangular Arc Reactor (Receipts // Iron Man)
const ArcReactorSilhouette: React.FC<{
  isHovered?: boolean;
  isCharging?: boolean;
}> = ({ isHovered, isCharging }) => (
  <div className="relative flex items-center justify-center">
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-[22px] h-[22px] transition-all duration-300 drop-shadow-[0_1px_2px_rgba(255,255,255,0.7)] ${
        isHovered
          ? 'rotate-180 scale-125'
          : isCharging
          ? 'scale-120'
          : 'scale-100'
      }`}
      style={{
        transformOrigin: '16px 16px',
        filter: isCharging
          ? 'drop-shadow(0 0 10px rgba(6,182,212,0.95)) drop-shadow(0 0 16px rgba(245,158,11,0.9))'
          : isHovered
          ? 'drop-shadow(0 0 8px rgba(245,158,11,0.95)) drop-shadow(0 0 12px rgba(6,182,212,0.8))'
          : 'drop-shadow(0 0 3px rgba(245,158,11,0.6))',
      }}
    >
      <defs>
        <linearGradient id="arcStarkChassis" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#292524" />
          <stop offset="100%" stopColor="#141414" />
        </linearGradient>
        <linearGradient id="arcReactorGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="arcReactorCore" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>

      {/* Outer Inverted Triangle (Stark Mark VI Chassis) */}
      <polygon
        points="4,6 28,6 16,28"
        stroke="#111215"
        strokeWidth="1.8"
        fill="url(#arcStarkChassis)"
      />

      {/* Inner Gold Chamfer Border */}
      <polygon
        points="7,8 25,8 16,24.5"
        stroke="url(#arcReactorGold)"
        strokeWidth="1"
        fill="none"
        opacity="0.9"
      />

      {/* HUD Targeting Ticks / Crosshairs */}
      <line x1="16" y1="2" x2="16" y2="5" stroke="#06b6d4" strokeWidth="1" strokeLinecap="round" />
      <line x1="2" y1="16" x2="5" y2="16" stroke="#06b6d4" strokeWidth="1" strokeLinecap="round" />
      <line x1="27" y1="16" x2="30" y2="16" stroke="#06b6d4" strokeWidth="1" strokeLinecap="round" />

      {/* Central Reactor Outer Ring */}
      <circle
        cx="16"
        cy="13.5"
        r="5.2"
        stroke="#06b6d4"
        strokeWidth="1.2"
        fill="#0f172a"
      />

      {/* Reactor Radial Coils (0°, 60°, 120°, 180°, 240°, 300°) */}
      <g stroke="#f59e0b" strokeWidth="0.8" opacity="0.85">
        <line x1="16" y1="9" x2="16" y2="11" />
        <line x1="12" y1="15.8" x2="13.8" y2="14.8" />
        <line x1="20" y1="15.8" x2="18.2" y2="14.8" />
      </g>

      {/* Central Core (Unibeam Emitter) */}
      <circle
        cx="16"
        cy="13.5"
        r="2.6"
        fill="url(#arcReactorCore)"
        className={isHovered ? 'animate-ping' : isCharging ? 'animate-pulse' : ''}
      />
      <circle
        cx="16"
        cy="13.5"
        r="1.2"
        fill="#ffffff"
        opacity="0.95"
      />
    </svg>
  </div>
);

const ThematicPlumbBob: React.FC<{
  chapterIndex: number;
  isHovered?: boolean;
  isCrawling?: boolean;
  compassInCenter?: boolean;
  compassSettled?: boolean;
  isArcCharging?: boolean;
}> = ({
  chapterIndex,
  isHovered,
  isCrawling,
  compassInCenter,
  compassSettled,
  isArcCharging,
}) => {
  if (chapterIndex === 1) return <SpiderSilhouette isHovered={isHovered} isCrawling={isCrawling} />;
  if (chapterIndex === 2)
    return (
      <ArcReactorSilhouette
        isHovered={isHovered}
        isCharging={isArcCharging}
      />
    );
  return (
    <CompassRoseSilhouette
      isHovered={isHovered}
      isSpinningInCenter={compassInCenter}
      hasSettled={compassSettled}
    />
  );
};

const JARVIS_GLYPHS = ['0', '1', '7', '8', 'X', '9', 'Δ', '4', 'F', 'A', '3', '%', 'Ø', 'Ξ', 'Ψ'];

interface VerticalClickPromptProps {
  onClick: (e: React.MouseEvent) => void;
  chapterNumber: string;
  chapterIndex?: number;
  isActive?: boolean;
  isCharacterHovered?: boolean;
}

const VerticalClickPrompt: React.FC<VerticalClickPromptProps> = ({
  onClick,
  chapterIndex = 0,
  isActive = true,
  isCharacterHovered = false,
}) => {
  const [hasSettled, setHasSettled] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [isPromptHovered, setIsPromptHovered] = useState(false);

  // Chapter 1 Compass States
  const [compassInCenter, setCompassInCenter] = useState(false);
  const [compassSettled, setCompassSettled] = useState(false);

  // Chapter 3 Iron Man & J.A.R.V.I.S. States
  const [isArcCharging, setIsArcCharging] = useState(false);
  const [scramblingSlots, setScramblingSlots] = useState<boolean[]>([false, false, false, false, false, false]);
  const [displayChars, setDisplayChars] = useState<string[]>(CLICK_PROMPT_CHARS);

  const bobRef = useRef<HTMLDivElement>(null);
  const laserRef = useRef<HTMLDivElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);

  const theme = SWEEP_THEMES[chapterIndex % SWEEP_THEMES.length] || SWEEP_THEMES[0];
  const isHovered = isCharacterHovered || isPromptHovered;

  // J.A.R.V.I.S. Scramble ticker for Iron Man (Chapter 3)
  useEffect(() => {
    const isAnyActive = scramblingSlots.some(Boolean);
    if (!isAnyActive) return;

    const interval = setInterval(() => {
      setDisplayChars((prev) =>
        prev.map((_, idx) => {
          if (scramblingSlots[idx]) {
            return JARVIS_GLYPHS[Math.floor(Math.random() * JARVIS_GLYPHS.length)];
          }
          return CLICK_PROMPT_CHARS[idx];
        })
      );
    }, 40);

    return () => clearInterval(interval);
  }, [scramblingSlots]);

  // Ensure elements start fully hidden before first browser paint
  useLayoutEffect(() => {
    if (!isActive) {
      if (bobRef.current) {
        gsap.set(bobRef.current, { y: 0, opacity: 0, rotate: 0 });
      }
      const letters = lettersRef.current.filter(Boolean);
      if (letters.length > 0) {
        gsap.set(letters, { opacity: 0, scale: 0.4, y: -6, rotate: -35 });
      }
    }
  }, [isActive]);

  // Descent & Staggered Reveal Choreography with GSAP
  useEffect(() => {
    if (!isActive) {
      setHasSettled(false);
      setIsCrawling(false);
      setCompassInCenter(false);
      setCompassSettled(false);
      setIsArcCharging(false);
      setScramblingSlots([false, false, false, false, false, false]);
      setDisplayChars(CLICK_PROMPT_CHARS);
      if (bobRef.current) {
        gsap.set(bobRef.current, { y: 0, opacity: 0, rotate: 0 });
      }
      const letters = lettersRef.current.filter(Boolean);
      if (letters.length > 0) {
        gsap.set(letters, { opacity: 0, scale: 0.4, y: -6, rotate: -35 });
      }
      if (laserRef.current) {
        gsap.set(laserRef.current, { opacity: 0, scaleY: 0 });
      }
      return;
    }

    setHasSettled(false);
    setIsCrawling(false);
    setCompassInCenter(false);
    setCompassSettled(false);
    setIsArcCharging(false);
    setScramblingSlots([false, false, false, false, false, false]);
    setDisplayChars(CLICK_PROMPT_CHARS);

    const bob = bobRef.current;
    const letters = lettersRef.current.filter(Boolean);

    if (!bob) return;

    const tl = gsap.timeline({
      delay: 0.25,
      onComplete: () => {
        setIsCrawling(false);
        setHasSettled(true);
      },
    });

    if (chapterIndex === 0) {
      // ═════════════════════════════════════════════════════════════════
      // CHAPTER 1 (HIKER): COMPASS SPINS DOWN -> PAUSES IN CENTER WITH CHROMATIC SHIMMER -> SETTLES WITH WEST NEEDLE GLOWING
      // ═════════════════════════════════════════════════════════════════
      gsap.set(bob, { y: 0, opacity: 0, rotate: 0 });
      gsap.set(letters, { opacity: 0, scale: 0.4, y: -6, rotate: -35 });

      tl.to(bob, { opacity: 1, duration: 0.15, ease: 'power1.out' }, 0);

      // Stage 1: Compass descends from y: 0 to y: 76px while spinning fast
      tl.to(
        bob,
        {
          y: 76,
          rotate: 540,
          duration: 0.65,
          ease: 'power1.inOut',
        },
        0.08
      );

      // Letters C, L, I reveal as compass descends
      tl.to(letters[0], { opacity: 1, scale: 1, y: 0, rotate: 0, duration: 0.22, ease: 'back.out(1.8)' }, 0.18);
      tl.to(letters[1], { opacity: 1, scale: 1, y: 0, rotate: 0, duration: 0.22, ease: 'back.out(1.8)' }, 0.36);
      tl.to(letters[2], { opacity: 1, scale: 1, y: 0, rotate: 0, duration: 0.22, ease: 'back.out(1.8)' }, 0.54);

      // Stage 2: Compass PAUSES in the center for ~0.4s and spins in place with chromatic shifting
      tl.call(() => setCompassInCenter(true), [], 0.73);
      tl.to(
        bob,
        {
          rotate: 900,
          duration: 0.42,
          ease: 'power1.inOut',
        },
        0.75
      );

      // Stage 3: Resumes descending to bottom (y: 76px -> 168px) and aligns West needle horizontally pointing left
      tl.call(() => setCompassInCenter(false), [], 1.18);
      tl.to(
        bob,
        {
          y: 168,
          rotate: 1080,
          duration: 0.6,
          ease: 'power2.out',
        },
        1.2
      );

      // Letters C, K, and arrow ← reveal
      tl.to(letters[3], { opacity: 1, scale: 1, y: 0, rotate: 0, duration: 0.22, ease: 'back.out(1.8)' }, 1.3);
      tl.to(letters[4], { opacity: 1, scale: 1, y: 0, rotate: 0, duration: 0.22, ease: 'back.out(1.8)' }, 1.48);
      tl.to(letters[5], { opacity: 1, scale: 1, y: 0, rotate: 0, duration: 0.22, ease: 'back.out(1.8)' }, 1.66);

      // Stage 4: Settles at bottom, West needle (pointing to left / Devis) lights up with chromatic aurora!
      tl.call(() => {
        setCompassSettled(true);
      }, [], 1.82);
    } else if (chapterIndex === 1) {
      // ═════════════════════════════════════════════════════════════════
      // CHAPTER 2 (SPIDER-MAN): CRAWLS DOWN -> PAUSES AT MID -> CONTINUES TO BOTTOM
      // ═════════════════════════════════════════════════════════════════
      gsap.set(bob, { y: 0, opacity: 0, rotate: 0 });
      gsap.set(letters, { opacity: 0, scale: 0.4, y: -6, rotate: -35 });

      tl.to(bob, { opacity: 1, duration: 0.15, ease: 'power1.out' }, 0);

      // Stage 1: Starts crawling down to middle (y: 0 -> 76px)
      tl.call(() => setIsCrawling(true), [], 0.05);

      tl.to(
        bob,
        {
          y: 76,
          duration: 0.65,
          ease: 'power1.inOut',
        },
        0.08
      );

      // Letters C, L, I reveal as spider crawls past
      tl.to(letters[0], { opacity: 1, scale: 1, y: 0, rotate: 0, duration: 0.24, ease: 'back.out(1.8)' }, 0.18);
      tl.to(letters[1], { opacity: 1, scale: 1, y: 0, rotate: 0, duration: 0.24, ease: 'back.out(1.8)' }, 0.38);
      tl.to(letters[2], { opacity: 1, scale: 1, y: 0, rotate: 0, duration: 0.24, ease: 'back.out(1.8)' }, 0.58);

      // Stage 2: Spider PAUSES at middle for ~0.35s and looks around
      tl.call(() => setIsCrawling(false), [], 0.73);
      tl.to(bob, { rotate: -6, duration: 0.14, ease: 'power1.out' }, 0.75);
      tl.to(bob, { rotate: 5, duration: 0.14, ease: 'power1.inOut' }, 0.89);
      tl.to(bob, { rotate: 0, duration: 0.12, ease: 'power1.inOut' }, 1.03);

      // Stage 3: Resumes crawling down to bottom (y: 76px -> 168px)
      tl.call(() => setIsCrawling(true), [], 1.15);
      tl.to(
        bob,
        {
          y: 168,
          duration: 0.65,
          ease: 'power1.inOut',
        },
        1.18
      );

      // Letters C, K, and arrow ← reveal
      tl.to(letters[3], { opacity: 1, scale: 1, y: 0, rotate: 0, duration: 0.24, ease: 'back.out(1.8)' }, 1.28);
      tl.to(letters[4], { opacity: 1, scale: 1, y: 0, rotate: 0, duration: 0.24, ease: 'back.out(1.8)' }, 1.48);
      tl.to(letters[5], { opacity: 1, scale: 1, y: 0, rotate: 0, duration: 0.24, ease: 'back.out(1.8)' }, 1.68);

      // Arrival at bottom: stops crawling
      tl.call(() => setIsCrawling(false), [], 1.83);
    } else {
      // ═════════════════════════════════════════════════════════════════
      // CHAPTER 3 (IRON MAN): ARC REACTOR CHARGES -> VERTICAL LASER SWEEPS UP -> J.A.R.V.I.S. SCRAMBLE DECODER
      // ═════════════════════════════════════════════════════════════════
      gsap.set(bob, { y: 168, opacity: 0, rotate: 0 });
      gsap.set(letters, { opacity: 0, scale: 0.6, y: -4, rotate: 0 });
      if (laserRef.current) {
        gsap.set(laserRef.current, { opacity: 0, scaleY: 0, transformOrigin: 'bottom' });
      }

      // Stage 1: Arc Reactor fades in and charges up
      tl.to(bob, { opacity: 1, duration: 0.25, ease: 'power1.out' }, 0);
      tl.call(() => setIsArcCharging(true), [], 0.05);

      // Stage 2: Fires glowing vertical laser line upwards
      if (laserRef.current) {
        tl.to(laserRef.current, { opacity: 1, scaleY: 1, duration: 0.28, ease: 'power2.out' }, 0.2);
      }

      // Stage 3: J.A.R.V.I.S. Scramble decoder triggers on each letter sequentially
      CLICK_PROMPT_CHARS.forEach((_, i) => {
        const startTime = 0.3 + i * 0.12;
        const lockTime = startTime + 0.24;

        // Reveal slot and start scramble
        tl.to(
          letters[i],
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.16,
            ease: 'power2.out',
          },
          startTime
        );
        tl.call(() => {
          setScramblingSlots((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, [], startTime);

        // Lock in final character with snap
        tl.call(() => {
          setScramblingSlots((prev) => {
            const next = [...prev];
            next[i] = false;
            return next;
          });
          setDisplayChars((prev) => {
            const next = [...prev];
            next[i] = CLICK_PROMPT_CHARS[i];
            return next;
          });
        }, [], lockTime);

        tl.fromTo(
          letters[i],
          { scale: 1.25 },
          { scale: 1, duration: 0.14, ease: 'back.out(2)' },
          lockTime
        );
      });

      // Stage 4: Laser beam fades cleanly into whitespace, Arc charging settles
      if (laserRef.current) {
        tl.to(
          laserRef.current,
          {
            opacity: 0,
            duration: 0.35,
            ease: 'power1.out',
          },
          1.15
        );
      }
      tl.call(() => {
        setIsArcCharging(false);
        setHasSettled(true);
      }, [], 1.25);
    }

    return () => {
      tl.kill();
    };
  }, [isActive, chapterIndex]);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      title="Klik untuk membuka dokumen"
      onMouseEnter={() => setIsPromptHovered(true)}
      onMouseLeave={() => setIsPromptHovered(false)}
      className="group/prompt pointer-events-auto absolute top-[35%] xs:top-[37%] left-[calc(100%+8px)] xs:left-[calc(100%+14px)] sm:left-[calc(100%+22px)] -translate-y-1/2 z-30 flex flex-col items-center cursor-pointer select-none py-2 px-1 transition-transform duration-300 active:scale-95"
    >
      <style>{`
        @keyframes spiderLegGaitA {
          0%, 100% {
            transform: rotate(-10deg);
          }
          50% {
            transform: rotate(10deg);
          }
        }
        @keyframes spiderLegGaitB {
          0%, 100% {
            transform: rotate(10deg);
          }
          50% {
            transform: rotate(-10deg);
          }
        }
        .animate-spider-leg-a {
          animation: spiderLegGaitA 0.16s ease-in-out infinite alternate;
        }
        .animate-spider-leg-b {
          animation: spiderLegGaitB 0.16s ease-in-out infinite alternate;
        }
        @keyframes editorialBobPendulum {
          0% {
            transform: rotate(-6deg);
          }
          50% {
            transform: rotate(6deg);
          }
          100% {
            transform: rotate(-6deg);
          }
        }
        @keyframes editorialBobTwitch {
          0%, 88%, 100% {
            transform: scale(1) translateY(0);
          }
          91% {
            transform: scale(1.1) translateY(-2px) rotate(-3deg);
          }
          94% {
            transform: scale(0.95) translateY(1.5px) rotate(3deg);
          }
          97% {
            transform: scale(1.04) translateY(0) rotate(0deg);
          }
        }
        @keyframes compassMagneticTremor {
          0% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-2.5deg);
          }
          50% {
            transform: rotate(1.5deg);
          }
          75% {
            transform: rotate(-1deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        @keyframes arcReactorPulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 3px rgba(245, 158, 11, 0.6));
          }
          50% {
            transform: scale(1.08);
            filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.9)) drop-shadow(0 0 12px rgba(6, 182, 212, 0.8));
          }
        }
      `}</style>

      {/* Top Spinning Compass Dial / Anchor */}
      <div className="relative w-5 h-5 xs:w-6 xs:h-6 flex items-center justify-center pointer-events-none z-20 mb-1">
        <div className="absolute inset-0 rounded-full border-[1.5px] border-dashed border-stone-400 group-hover/prompt:border-stone-900 transition-colors animate-[spin_8s_linear_infinite]" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#111215]" />
      </div>

      {/* Vertical Letters & Descending Icon Track (Pure & Clean Negative Space) */}
      <div className="relative w-7 h-[178px] flex flex-col items-center pointer-events-none">
        {/* High-Tech Vertical Laser Beam for Iron Man Charging Sequence */}
        {chapterIndex === 2 && (
          <div
            ref={laserRef}
            className="absolute left-1/2 -translate-x-1/2 w-[2px] pointer-events-none z-15 rounded-full origin-bottom"
            style={{
              top: 0,
              bottom: '12px',
              background: 'linear-gradient(to top, #f59e0b, #06b6d4, #ffffff)',
              boxShadow: '0 0 10px rgba(6,182,212,0.95), 0 0 16px rgba(245,158,11,0.85)',
              opacity: 0,
            }}
          />
        )}

        {/* Downward Vertical Letters ("C - L - I - C - K - ←") Pure & Legible */}
        <div className="relative z-10 pt-1 flex flex-col items-center gap-1 font-mono font-black text-[12.5px] xs:text-[13.5px] sm:text-[14.5px] tracking-[0.24em] uppercase text-[#111215] drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]">
          {CLICK_PROMPT_CHARS.map((char, i) => {
            const isArrow = char === '←';
            const isScramblingNow = scramblingSlots[i];
            const renderedChar = displayChars[i] || char;

            return (
              <span
                key={i}
                ref={(el) => {
                  lettersRef.current[i] = el;
                }}
                className={`inline-block transition-transform duration-200 will-change-transform ${
                  isScramblingNow
                    ? 'text-[13px] font-mono font-bold text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.95)]'
                    : isArrow
                    ? 'text-[15px] xs:text-[17px] sm:text-[19px] font-sans font-black mt-0.5'
                    : 'animate-text-glyph-sweep'
                } ${
                  isHovered && isArrow
                    ? '-translate-x-1 text-[var(--sweep-color)] scale-110 drop-shadow-[0_0_6px_var(--sweep-glow)]'
                    : ''
                }`}
                style={{
                  // @ts-ignore
                  '--sweep-color': theme.color,
                  '--sweep-highlight': theme.highlight,
                  '--sweep-glow': theme.glow,
                  animationDelay: `${i * 0.14}s`,
                }}
              >
                {renderedChar}
              </span>
            );
          })}
        </div>

        {/* The Descending / Placed Silhouette (Compass / Spider / Arc Reactor) below the Arrow */}
        <div
          ref={bobRef}
          className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none will-change-transform"
          style={{
            transformOrigin: 'center center',
          }}
        >
          {/* Inner animated wrapper for idle physics and hover reflex */}
          <div
            className="flex items-center justify-center transition-transform duration-250 ease-out"
            style={{
              transform:
                isHovered && hasSettled && chapterIndex === 1
                  ? 'translateY(-14px)'
                  : isHovered && hasSettled && chapterIndex === 0
                  ? 'translateX(-3px) rotate(-6deg)'
                  : 'translateY(0)',
              animation:
                hasSettled && !isHovered && chapterIndex === 1
                  ? 'editorialBobPendulum 2.8s ease-in-out infinite alternate, editorialBobTwitch 4.8s ease-in-out infinite'
                  : hasSettled && !isHovered && chapterIndex === 0
                  ? 'compassMagneticTremor 3.2s ease-in-out infinite alternate'
                  : hasSettled && chapterIndex === 2 && !isHovered
                  ? 'arcReactorPulse 2.4s ease-in-out infinite'
                  : undefined,
              transformOrigin: 'center center',
            }}
          >
            <ThematicPlumbBob
              chapterIndex={chapterIndex}
              isHovered={isHovered}
              isCrawling={isCrawling}
              compassInCenter={compassInCenter}
              compassSettled={compassSettled}
              isArcCharging={isArcCharging}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const NexusSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<(HTMLDivElement | null)[]>([]);
  const textsRef = useRef<(HTMLDivElement | null)[]>([]);
  const numeralTrackRef = useRef<HTMLDivElement>(null);

  // Architectural Framing & Entrance Choreography Refs
  const topLineRef = useRef<HTMLDivElement>(null);
  const bottomLineRef = useRef<HTMLDivElement>(null);
  const char0ImgRef = useRef<HTMLImageElement>(null);
  const headline0Ref = useRef<HTMLHeadingElement>(null);
  const numeral0Ref = useRef<HTMLSpanElement>(null);
  const supporting0Ref = useRef<HTMLDivElement>(null);
  const stepperRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  // Active Chapter State
  const [activeIdx, setActiveIdx] = useState(0);
  const [isStageInView, setIsStageInView] = useState(false);

  // Black Dot Expansion State
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [modalIdx, setModalIdx] = useState(0);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  // Iron Man Cinematic Repulsor & CRT Preloader Gate States
  const [isIronManTransitioning, setIsIronManTransitioning] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const ironManOriginRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const repulsorFlareRef = useRef<HTMLDivElement>(null);
  const repulsorBeamRef = useRef<HTMLDivElement>(null);
  const crtWhiteFlashRef = useRef<HTMLDivElement>(null);
  const crtLaserLineRef = useRef<HTMLDivElement>(null);
  const hudContainerRef = useRef<HTMLDivElement>(null);
  const ironManGateStartTimeRef = useRef<number>(0);
  const isIronManCompletedRef = useRef<boolean>(false);

  // Interactive Editorial Character Cursor Badge State & Physics (Lerp / Spring Follower)
  const cursorBadgeRef = useRef<HTMLDivElement>(null);
  const cursorTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cursorCurrentRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cursorRafRef = useRef<number | null>(null);
  const [badgeVisible, setBadgeVisible] = useState(false);
  const [activeHoverIdx, setActiveHoverIdx] = useState<number>(0);

  // Wave 2 Polish: Atmospheric Mood Halo + 3-Layer Cursor Depth Parallax (zero React re-render)
  const moodHaloRef = useRef<HTMLDivElement>(null);
  const runwayParallaxRef = useRef<HTMLDivElement>(null);
  const numeralParallaxRef = useRef<HTMLDivElement>(null);
  // Wave 2.5 Polish: Arch Gallery Aperture + Title Whisper + Staggered Stage Awakening Refs
  const apertureRef = useRef<HTMLDivElement>(null);
  const titleWhisperRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const bottomMetaRef = useRef<HTMLDivElement>(null);
  const mobileNumeralRef = useRef<HTMLDivElement>(null);
  const char0EnterRef = useRef<HTMLDivElement>(null);
  const text0EnterRef = useRef<HTMLDivElement>(null);
  const haloXTo = useRef<gsap.QuickToFunc | null>(null);
  const haloYTo = useRef<gsap.QuickToFunc | null>(null);
  const runwayXTo = useRef<gsap.QuickToFunc | null>(null);
  const runwayYTo = useRef<gsap.QuickToFunc | null>(null);
  const numeralXTo = useRef<gsap.QuickToFunc | null>(null);
  const numeralYTo = useRef<gsap.QuickToFunc | null>(null);

  // Atmospheric Mood Halo color shift per chapter (01 Alpine Sky, 02 Soft Crimson, 03 Warm Arc Gold)
  useEffect(() => {
    if (!moodHaloRef.current) return;
    const haloColors = [
      'rgba(56, 189, 248, 0.22)',
      'rgba(244, 63, 94, 0.18)',
      'rgba(245, 158, 11, 0.22)',
    ];
    gsap.to(moodHaloRef.current, {
      backgroundColor: haloColors[activeIdx] || haloColors[0],
      duration: 0.9,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  }, [activeIdx]);

  // Initialize 3-layer cursor depth parallax quickTo functions
  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    if (moodHaloRef.current) {
      haloXTo.current = gsap.quickTo(moodHaloRef.current, 'x', { duration: 1.05, ease: 'power2.out' });
      haloYTo.current = gsap.quickTo(moodHaloRef.current, 'y', { duration: 1.05, ease: 'power2.out' });
    }
    if (runwayParallaxRef.current) {
      runwayXTo.current = gsap.quickTo(runwayParallaxRef.current, 'x', { duration: 0.75, ease: 'power2.out' });
      runwayYTo.current = gsap.quickTo(runwayParallaxRef.current, 'y', { duration: 0.75, ease: 'power2.out' });
    }
    if (numeralParallaxRef.current) {
      numeralXTo.current = gsap.quickTo(numeralParallaxRef.current, 'x', { duration: 0.9, ease: 'power2.out' });
      numeralYTo.current = gsap.quickTo(numeralParallaxRef.current, 'y', { duration: 0.9, ease: 'power2.out' });
    }
  }, []);

  const handleStageMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (overlayOpen || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const normX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const normY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

    haloXTo.current?.(normX * 26);
    haloYTo.current?.(normY * 18);
    runwayXTo.current?.(normX * 10);
    runwayYTo.current?.(normY * 6);
    numeralXTo.current?.(-normX * 14);
    numeralYTo.current?.(-normY * 8);
  };

  const handleStageMouseLeave = () => {
    haloXTo.current?.(0);
    haloYTo.current?.(0);
    runwayXTo.current?.(0);
    runwayYTo.current?.(0);
    numeralXTo.current?.(0);
    numeralYTo.current?.(0);
  };

  const handleTabClick = (idx: number) => {
    setIsStageInView(true);
    const st = scrollTriggerRef.current;
    if (!st) return;
    // Map each chapter to spotlight position in scrub timeline:
    // Chapter 01: 0.08, Chapter 02: 0.47, Chapter 03: 0.88
    const progressMap = [0.225, 0.55, 0.875];
    const targetProgress = progressMap[idx] ?? 0;
    const targetScroll = st.start + targetProgress * (st.end - st.start);
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });
  };

  // ── Iron Man Click-Origin Repulsor Ignition & CRT Preloader Gate ──
  const startIronManTransition = useCallback((clickX: number, clickY: number) => {
    if (overlayOpen || isIronManTransitioning) return;
    setIsIronManTransitioning(true);
    setPreloadProgress(0);
    ironManOriginRef.current = { x: clickX, y: clickY };
    ironManGateStartTimeRef.current = performance.now();
    isIronManCompletedRef.current = false;

    const win = window as unknown as { __lenis?: { stop: () => void; start: () => void } };
    if (win.__lenis) win.__lenis.stop();

    // Start Real Preloading of all 30 certificate images
    let loadedCount = 0;
    const totalImages = CERTIFICATES_DATA.length;
    const progressObj = { val: 0 };

    const onAssetLoaded = () => {
      loadedCount++;
      const targetVal = Math.min(100, Math.round((loadedCount / totalImages) * 100));
      gsap.to(progressObj, {
        val: targetVal,
        duration: 0.35,
        ease: 'power2.out',
        onUpdate: () => {
          setPreloadProgress(Math.round(progressObj.val));
        },
      });
    };

    CERTIFICATES_DATA.forEach((cert) => {
      const img = new Image();
      img.onload = onAssetLoaded;
      img.onerror = onAssetLoaded;
      img.src = cert.imageUrl;
    });

    // Fallback safety timeout (5.5 seconds)
    const fallbackTimer = setTimeout(() => {
      if (!isIronManCompletedRef.current) {
        gsap.to(progressObj, {
          val: 100,
          duration: 0.25,
          onUpdate: () => {
            setPreloadProgress(Math.round(progressObj.val));
          },
        });
      }
    }, 5500);

    // Run GSAP Cinematic Repulsor & CRT Ignition Timeline
    requestAnimationFrame(() => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const maxRadius = Math.hypot(W, H) * 1.35;

      const tl = gsap.timeline();

      // 1. Repulsor Core Expansion from Click Origin
      if (repulsorFlareRef.current) {
        tl.fromTo(
          repulsorFlareRef.current,
          {
            width: 0,
            height: 0,
            xPercent: -50,
            yPercent: -50,
            left: clickX,
            top: clickY,
            opacity: 1,
            display: 'block',
          },
          {
            width: maxRadius * 2,
            height: maxRadius * 2,
            duration: 0.38,
            ease: 'power4.in',
            force3D: true,
          },
          0
        );
      }

      // 2. Anamorphic Horizontal Lens Flare Line
      if (repulsorBeamRef.current) {
        tl.fromTo(
          repulsorBeamRef.current,
          {
            scaleX: 0.05,
            opacity: 0,
            left: clickX,
            top: clickY,
            xPercent: -50,
            yPercent: -50,
            display: 'block',
          },
          {
            scaleX: 30,
            opacity: 1,
            duration: 0.36,
            ease: 'power3.in',
            force3D: true,
          },
          0.02
        );
      }

      // ── CRITICAL FIX: At 0.38s, Repulsor blast fills screen with 100% white ──
      // Immediately turn OFF Layer 1 (repulsor flare) & Layer 2 (repulsor beam)
      // so behind the white CRT flash layer sits ONLY pure deep pitch black (#050505)!
      if (repulsorFlareRef.current) {
        tl.set(repulsorFlareRef.current, { opacity: 0, display: 'none' }, 0.38);
      }
      if (repulsorBeamRef.current) {
        tl.set(repulsorBeamRef.current, { opacity: 0, display: 'none' }, 0.38);
      }

      // 3. CRT Power-Off Collapse (white layer collapses vertically to scaleY: 0.004)
      // Reveals pitch black #050505 background above and below the collapsing white beam
      if (crtWhiteFlashRef.current) {
        tl.set(crtWhiteFlashRef.current, { opacity: 1, scaleY: 1, scaleX: 1, display: 'block' }, 0.38);
        tl.to(
          crtWhiteFlashRef.current,
          {
            scaleY: 0.004,
            duration: 0.22,
            ease: 'power4.out',
            force3D: true,
          },
          0.40
        );
      }

      // 4. Center Glowing Cyan Laser Line
      if (crtLaserLineRef.current) {
        tl.set(crtLaserLineRef.current, { opacity: 1, scaleX: 1, scaleY: 1, display: 'block' }, 0.44);
      }

      // 5. HUD Display
      if (hudContainerRef.current) {
        tl.fromTo(
          hudContainerRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' },
          0.46
        );
      }
    });

    return () => {
      clearTimeout(fallbackTimer);
    };
  }, [overlayOpen, isIronManTransitioning]);

  useEffect(() => {
    if (!isIronManTransitioning) return;
    if (preloadProgress >= 100 && !isIronManCompletedRef.current) {
      isIronManCompletedRef.current = true;

      // Ensure minimum hold duration (0.75s from start) so user perceives the CRT line & HUD smoothly
      const elapsed = performance.now() - ironManGateStartTimeRef.current;
      const delay = Math.max(0, 750 - elapsed) / 1000;

      const finishTl = gsap.timeline({
        delay,
        onComplete: () => {
          const clickOrigin = ironManOriginRef.current;
          setOrigin(clickOrigin);
          setModalIdx(2);
          setActiveIdx(2);
          setOverlayOpen(true);
          // Seamless handoff: unmount preloader gate only after K3 modal is mounted
          requestAnimationFrame(() => {
            setIsIronManTransitioning(false);
          });
        },
      });

      // Collapse laser line horizontally to center spark
      if (crtLaserLineRef.current) {
        finishTl.to(
          crtLaserLineRef.current,
          {
            scaleX: 0,
            duration: 0.22,
            ease: 'power3.in',
            force3D: true,
          },
          0
        );
      }

      if (crtWhiteFlashRef.current) {
        finishTl.to(
          crtWhiteFlashRef.current,
          {
            scaleX: 0,
            opacity: 0,
            duration: 0.22,
            ease: 'power3.in',
            force3D: true,
          },
          0
        );
      }

      // Fade out HUD
      if (hudContainerRef.current) {
        finishTl.to(
          hudContainerRef.current,
          {
            opacity: 0,
            y: -10,
            duration: 0.2,
            ease: 'power2.in',
          },
          0
        );
      }
    }
  }, [preloadProgress, isIronManTransitioning]);

  const handleOpenModal = (idx: number, e?: React.MouseEvent) => {
    if (overlayOpen || isIronManTransitioning) return;
    const x = e ? e.clientX : window.innerWidth / 2;
    const y = e ? e.clientY : window.innerHeight / 2;
    if (idx === 2) {
      startIronManTransition(x, y);
      return;
    }
    setOrigin({ x, y });
    setModalIdx(idx);
    setActiveIdx(idx);
    setOverlayOpen(true);
  };

  const handleCloseArchive = useCallback(() => {
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    const win = window as unknown as { __lenis?: { start: () => void; scrollTo: (y: number, opts: unknown) => void } };
    if (win.__lenis) {
      win.__lenis.start();
    }
    setOverlayOpen(false);

    // If closing Chapter 3 (Iron Man), guarantee the stage is locked cleanly on Chapter 3!
    const st = scrollTriggerRef.current;
    if (st && modalIdx === 2) {
      setActiveIdx(2);
      const targetScroll = st.start + 0.875 * (st.end - st.start);
      if (win.__lenis) {
        win.__lenis.scrollTo(targetScroll, { immediate: true });
      } else {
        window.scrollTo({ top: targetScroll, behavior: 'instant' });
      }
    }
  }, [modalIdx]);

  // ── Physics Lerp Loop for Buttery Smooth Cursor Trailing (ONLY runs while badge is visible -> 0% idle CPU!) ──
  useEffect(() => {
    if (!badgeVisible || overlayOpen) return;
    const tick = () => {
      const badge = cursorBadgeRef.current;
      if (badge) {
        // Fluid spring lerp factor (0.13 gives an organic, luxurious trailing delay)
        const lerp = 0.13;
        cursorCurrentRef.current.x += (cursorTargetRef.current.x - cursorCurrentRef.current.x) * lerp;
        cursorCurrentRef.current.y += (cursorTargetRef.current.y - cursorCurrentRef.current.y) * lerp;

        badge.style.transform = `translate3d(${cursorCurrentRef.current.x.toFixed(1)}px, ${cursorCurrentRef.current.y.toFixed(1)}px, 0) translate(-50%, -135%)`;
      }
      cursorRafRef.current = requestAnimationFrame(tick);
    };

    cursorRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (cursorRafRef.current) cancelAnimationFrame(cursorRafRef.current);
      cursorRafRef.current = null;
    };
  }, [badgeVisible, overlayOpen]);

  // ── Spring Scale & Opacity Entrance / Exit for Cursor Badge ──
  useEffect(() => {
    const badge = cursorBadgeRef.current;
    if (!badge) return;

    if (badgeVisible && !overlayOpen) {
      gsap.killTweensOf(badge);
      gsap.fromTo(
        badge,
        {
          scale: 0.85,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.32,
          ease: 'back.out(1.5)',
        }
      );
    } else {
      gsap.killTweensOf(badge);
      gsap.to(badge, {
        scale: 0.85,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      });
    }
  }, [badgeVisible, overlayOpen]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const ctx = gsap.context(() => {
      const c0 = charsRef.current[0];
      const c1 = charsRef.current[1];
      const c2 = charsRef.current[2];

      const t0 = textsRef.current[0];
      const t1 = textsRef.current[1];
      const t2 = textsRef.current[2];

      const numTrack = numeralTrackRef.current;

      if (!c0 || !c1 || !c2 || !t0 || !t1 || !t2) return;

      const isMobile = window.innerWidth < 768;
      const activeX = isMobile ? 0 : -48;
      const enterX = isMobile ? 80 : 140;
      const enterY = isMobile ? 80 : 140;
      const exitX = isMobile ? -140 : -260;
      const exitY = isMobile ? -100 : -160;

      // ── Initial State ──
      // Karakter 01 & Teks 01 berada di posisi spotlight untuk pinned timeline;
      // animasi masuk mereka dikendalikan wrapper khusus (char0EnterRef / text0EnterRef) di approachTl (0% konflik!)
      gsap.set(c0, {
        xPercent: -50,
        x: activeX,
        y: 0,
        scale: 1,
        autoAlpha: 1,
      });

      // Karakter 02 & 03 disiapkan di posisi Kanan-Bawah sesuai lintasan diagonal
      gsap.set([c1, c2], {
        xPercent: -50,
        x: enterX,
        y: enterY,
        scale: 0.85,
        autoAlpha: 0,
      });

      // Numeral track awal (01)
      if (numTrack) {
        gsap.set(numTrack, { yPercent: 0 });
      }

      // Dialog narator awal: siap di spotlight; entrance dikendalikan oleh text0EnterRef
      gsap.set(t0, { x: 0, y: 0, autoAlpha: 1, pointerEvents: 'auto' });
      gsap.set([t1, t2], { x: 40, y: 25, autoAlpha: 0, pointerEvents: 'none' });

      // ── FASE 1: ARCH GALLERY APERTURE + TITLE WHISPER + STAGGERED STAGE AWAKENING ──
      // Seamless handoff from 02_AboutSection's exit color (#F5F4F0) — zero seam & zero blue border cut
      if (containerRef.current) {
        gsap.set(containerRef.current, { backgroundColor: '#F5F4F0' });
      }

      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const framingLines = [topLineRef.current, bottomLineRef.current].filter(Boolean);

      if (prefersReduced) {
        if (titleWhisperRef.current) gsap.set(titleWhisperRef.current, { autoAlpha: 0 });
        if (apertureRef.current) {
          gsap.set(apertureRef.current, {
            clipPath: 'inset(0% 0% 0% 0% round 0px)',
            backgroundColor: '#F5F4F0',
          });
        }
        if (framingLines.length) gsap.set(framingLines, { scaleX: 1 });
        if (moodHaloRef.current) gsap.set(moodHaloRef.current, { autoAlpha: 1, scale: 1 });
      } else {
        // Hide ALL Nexus chrome, mood halo & Chapter 01 inside closed aperture until entrance triggers
        if (apertureRef.current) {
          gsap.set(apertureRef.current, {
            clipPath: isMobile ? 'inset(3% 3% 2% 3% round 28px)' : 'inset(4.5% 4.5% 2% 4.5% round 44px)',
            backgroundColor: '#FAF9F5',
          });
        }
        if (titleWhisperRef.current) {
          gsap.set(titleWhisperRef.current, { autoAlpha: 0, y: 20, scale: 0.96 });
        }
        if (framingLines.length) {
          gsap.set(framingLines, { scaleX: 0, transformOrigin: 'left center' });
        }
        if (moodHaloRef.current) {
          gsap.set(moodHaloRef.current, { autoAlpha: 0, scale: 0.45 });
        }
        if (eyebrowRef.current) gsap.set(eyebrowRef.current, { autoAlpha: 0, y: 14 });
        if (stepperRef.current) gsap.set(stepperRef.current, { autoAlpha: 0, y: 16 });
        if (numeralParallaxRef.current) gsap.set(numeralParallaxRef.current, { autoAlpha: 0, y: 24 });
        if (mobileNumeralRef.current) gsap.set(mobileNumeralRef.current, { autoAlpha: 0, y: 16 });
        if (bottomMetaRef.current) gsap.set(bottomMetaRef.current, { autoAlpha: 0, y: 12 });
        if (text0EnterRef.current) gsap.set(text0EnterRef.current, { autoAlpha: 0, x: -28 });
        if (char0EnterRef.current) {
          gsap.set(char0EnterRef.current, { autoAlpha: 0, y: isMobile ? 40 : 60, scale: 0.93 });
        }

        const approachTl = gsap.timeline({
          scrollTrigger: {
            trigger: stage,
            start: 'top 92%',
            end: 'top top',
            scrub: 0.75,
            invalidateOnRefresh: true,
          },
        });

        // 1. Expanding Arch Gallery Aperture opens outward to full-bleed (0.00 -> 0.78)
        if (apertureRef.current) {
          approachTl.to(
            apertureRef.current,
            {
              clipPath: 'inset(0% 0% 0% 0% round 0px)',
              backgroundColor: '#F5F4F0',
              duration: 0.78,
              ease: 'power2.inOut',
            },
            0
          );
        }

        // 2. Cinematic Title Whisper rises & settles 100% crisp in the exact center by the time the stage locks
        if (titleWhisperRef.current) {
          approachTl.to(
            titleWhisperRef.current,
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.62, ease: 'power2.out' },
            0.2
          );
        }
        approachTl.to({}, { duration: 0.18 }, 0.82);
      }

      // 4. Deteksi Panggung Hidup untuk memicu animasi prompt CLICK & Siluet
      // Aktif tepat setelah Karakter 01 bangun di awal pin dan tetap aktif selama berada di Section 03
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top-=420',
        end: 'bottom bottom',
        onEnter: () => setIsStageInView(true),
        onLeaveBack: () => setIsStageInView(false),
        onRefresh: (self) => {
          setIsStageInView(self.progress > 0);
        },
      });

      // ── Pinned Stage Timeline Layout (Total 4.0 units) ──
      // 0.00–0.60 : Title Intro hold & dissolve → Stage Awakening (Chrome + Mood Halo + Karakter 01)
      // 0.60–1.55 : Babak 01 (Off-Screen)     | 1.55–2.85 : Babak 02 (Beyond The Mask)
      // 2.85–4.00 : Babak 03 (The Receipts)   | 3.82–4.00 : Mood Halo soft exit (clean seam into Work)
      const INTRO = 0.6;
      const TOTAL = 4.0;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: '+=4900',
          pin: true,
          scrub: 1.0,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const t = self.progress * TOTAL;
            if (t < 1.75) {
              setActiveIdx(0);
            } else if (t < 2.95) {
              setActiveIdx(1);
            } else {
              setActiveIdx(2);
            }
          },
        },
      });

      scrollTriggerRef.current = tl.scrollTrigger ?? null;

      // ══════════════════════════════════════════════════════════════════
      // INTRO: "THE NEXUS" TITLE HOLD → CINEMATIC DISSOLVE → STAGE AWAKENING
      // ══════════════════════════════════════════════════════════════════
      if (!prefersReduced) {
        if (titleWhisperRef.current) {
          tl.fromTo(
            titleWhisperRef.current,
            { autoAlpha: 1, y: 0, scale: 1 },
            {
              autoAlpha: 0,
              y: -16,
              scale: 1.14,
              duration: 0.24,
              ease: 'power2.in',
              immediateRender: false,
            },
            0.18
          );
        }
        if (framingLines.length) {
          tl.to(framingLines, { scaleX: 1, duration: 0.3, ease: 'power2.out' }, 0.24);
        }
        if (moodHaloRef.current) {
          tl.to(moodHaloRef.current, { autoAlpha: 1, scale: 1, duration: 0.34, ease: 'power2.out' }, 0.26);
        }
        if (eyebrowRef.current) {
          tl.to(eyebrowRef.current, { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power2.out' }, 0.28);
        }
        if (stepperRef.current) {
          tl.to(stepperRef.current, { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power2.out' }, 0.32);
        }
        if (numeralParallaxRef.current) {
          tl.to(numeralParallaxRef.current, { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power2.out' }, 0.34);
        }
        if (mobileNumeralRef.current) {
          tl.to(mobileNumeralRef.current, { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power2.out' }, 0.34);
        }
        if (bottomMetaRef.current) {
          tl.to(bottomMetaRef.current, { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power2.out' }, 0.36);
        }
        if (char0EnterRef.current) {
          tl.to(char0EnterRef.current, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'power3.out' }, 0.3);
        }
        if (text0EnterRef.current) {
          tl.to(text0EnterRef.current, { autoAlpha: 1, x: 0, duration: 0.26, ease: 'power2.out' }, 0.34);
        }
      }

      // ══════════════════════════════════════════════════════════════════
      // BABAK 1: KARAKTER 01 (OFF-SCREEN)
      // ══════════════════════════════════════════════════════════════════

      // 1. Fase Diam di Spotlight Tengah: Karakter & Teks 100% kokoh & terbaca
      tl.to(c0, { x: activeX, y: 0, scale: 1, autoAlpha: 1, duration: 0.55 }, INTRO + 0.0)
      .to(t0, { x: 0, y: 0, autoAlpha: 1, duration: 0.55 }, INTRO + 0.0)

      // 2. Fase Keluar Sinkron Sempurna: Karakter 01 & Teks Narator 01 memudar BERSAMAAN
      .to(
        c0,
        {
          x: exitX,
          y: exitY,
          scale: 0.88,
          autoAlpha: 0,
          duration: 0.40,
          ease: 'power1.inOut',
        },
        INTRO + 0.55
      )
      .to(
        t0,
        {
          x: -80,
          y: -24,
          autoAlpha: 0,
          duration: 0.40,
          ease: 'power1.inOut',
          onComplete: () => {
            if (t0) t0.style.pointerEvents = 'none';
          },
        },
        INTRO + 0.55
      );

      // Sinkronisasi Numeral Babak 1 -> 2 (01 -> 02)
      if (numTrack) {
        tl.to(
          numTrack,
          {
            yPercent: -33.333,
            duration: 0.40,
            ease: 'power2.inOut',
          },
          INTRO + 0.75
        );
      }

      // ══════════════════════════════════════════════════════════════════
      // BABAK 2: KARAKTER 02 (BEYOND THE MASK — SPIDER-MAN)
      // ══════════════════════════════════════════════════════════════════

      tl.fromTo(
        t1,
        { x: 40, y: 25, autoAlpha: 0 },
        {
          x: 0,
          y: 0,
          autoAlpha: 1,
          duration: 0.40,
          ease: 'power2.out',
          onStart: () => {
            if (t1) t1.style.pointerEvents = 'auto';
          },
        },
        INTRO + 0.95
      )
      .fromTo(
        c1,
        { x: enterX, y: enterY, scale: 0.85, autoAlpha: 0 },
        { x: activeX, y: 0, scale: 1, autoAlpha: 1, duration: 0.40, ease: 'power2.out' },
        INTRO + 0.95
      )
      .to(c1, { x: activeX, y: 0, scale: 1, autoAlpha: 1, duration: 0.50 }, INTRO + 1.35)
      .to(t1, { x: 0, y: 0, autoAlpha: 1, duration: 0.50 }, INTRO + 1.35)
      .to(
        c1,
        {
          x: exitX,
          y: exitY,
          scale: 0.88,
          autoAlpha: 0,
          duration: 0.40,
          ease: 'power1.inOut',
        },
        INTRO + 1.85
      )
      .to(
        t1,
        {
          x: -80,
          y: -24,
          autoAlpha: 0,
          duration: 0.40,
          ease: 'power1.inOut',
          onComplete: () => {
            if (t1) t1.style.pointerEvents = 'none';
          },
        },
        INTRO + 1.85
      );

      // Sinkronisasi Numeral Babak 2 -> 3 (02 -> 03)
      if (numTrack) {
        tl.to(
          numTrack,
          {
            yPercent: -66.666,
            duration: 0.40,
            ease: 'power2.inOut',
          },
          INTRO + 2.05
        );
      }

      // ══════════════════════════════════════════════════════════════════
      // BABAK 3: KARAKTER 03 (THE RECEIPTS — IRON MAN)
      // ══════════════════════════════════════════════════════════════════

      tl.fromTo(
        t2,
        { x: 40, y: 25, autoAlpha: 0 },
        {
          x: 0,
          y: 0,
          autoAlpha: 1,
          duration: 0.40,
          ease: 'power2.out',
          onStart: () => {
            if (t2) t2.style.pointerEvents = 'auto';
          },
        },
        INTRO + 2.25
      )
      .fromTo(
        c2,
        { x: enterX, y: enterY, scale: 0.85, autoAlpha: 0 },
        { x: activeX, y: 0, scale: 1, autoAlpha: 1, duration: 0.40, ease: 'power2.out' },
        INTRO + 2.25
      )
      // Fase Diam: Tetap kokoh di posisi tengah sampai scroll unpin
      .to(c2, { x: activeX, y: 0, scale: 1, autoAlpha: 1, duration: TOTAL - (INTRO + 2.65) }, INTRO + 2.65)
      .to(t2, { x: 0, y: 0, autoAlpha: 1, duration: TOTAL - (INTRO + 2.65) }, INTRO + 2.65);

      // Clean bottom seam: Warm Arc Gold halo dissolves softly before unpinning into Work (zero golden cut-line)
      if (moodHaloRef.current && !prefersReduced) {
        tl.to(moodHaloRef.current, { autoAlpha: 0, scale: 0.72, duration: 0.18, ease: 'power1.in' }, TOTAL - 0.18);
      }
    }, stageRef);

    return () => {
      scrollTriggerRef.current = null;
      ctx.revert();
    };
  }, []);

  return (
    <div
      id="nexus"
      ref={containerRef}
      className="relative z-20 w-full overflow-hidden bg-[#F5F4F0] text-[#141414] select-none"
    >
      
      {/* ═══════════════════════════════════════════════════════════════════════════
          SECTION 03 · THE NEXUS (KOTA-INSPIRED ARCHITECTURAL RUNWAY STAGE)
          ═══════════════════════════════════════════════════════════════════════════ */}
      <section
        ref={stageRef}
        id="nexus-stage"
        onMouseMove={handleStageMouseMove}
        onMouseLeave={handleStageMouseLeave}
        className="relative w-full h-[100dvh] min-h-[580px] overflow-hidden bg-[#F5F4F0]"
      >
        {/* ── EXPANDING ARCH GALLERY APERTURE CONTAINER ── */}
        <div
          ref={apertureRef}
          className="relative w-full h-full overflow-hidden flex flex-col justify-between pt-16 pb-3 sm:py-8 px-4 xs:px-6 sm:px-12 md:px-16 bg-[#F5F4F0] shadow-[inset_0_0_0_1px_rgba(20,20,20,0.06)] will-change-[clip-path,background-color]"
        >
        {/* ── CINEMATIC TITLE WHISPER (Appears inside expanding arch, dissolves before stage awakens) ── */}
        <div
          ref={titleWhisperRef}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-40 flex flex-col items-center justify-center text-center px-6 will-change-transform"
        >
          <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.32em] uppercase text-stone-400 mb-2">
            CHAPTER GALLERY · 03
          </span>
          <span className="font-display font-black text-3xl xs:text-4xl sm:text-5xl md:text-6xl tracking-tight text-stone-900/90 uppercase leading-none">
            THE NEXUS
          </span>
          <span className="font-mono text-[9.5px] sm:text-[10.5px] tracking-[0.26em] uppercase text-stone-500 mt-3">
            THREE SIDES BEHIND THE CRAFT
          </span>
        </div>

        {/* Ambient Paper Glow, Dynamic Chapter Mood Halo & Tactile Grain (Zero heavy blur-[140px] or SVG feTurbulence!) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-20">
          {/* Chapter-Synced Atmospheric Mood Halo (Alpine Sky -> Soft Crimson -> Warm Arc Gold) */}
          <div
            ref={moodHaloRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] sm:w-[780px] h-[460px] sm:h-[620px] rounded-full blur-[90px] will-change-transform"
            style={{ backgroundColor: 'rgba(56, 189, 248, 0.22)' }}
          />
          <div
            className="absolute -top-[10%] left-[10%] w-[680px] h-[680px] rounded-full opacity-35"
            style={{
              background: 'radial-gradient(circle, rgba(226, 224, 216, 0.65) 0%, rgba(245, 244, 240, 0.15) 55%, transparent 72%)',
            }}
          />
          <div
            className="absolute -bottom-[15%] right-[15%] w-[740px] h-[620px] rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(235, 230, 220, 0.72) 0%, rgba(245, 244, 240, 0.2) 50%, transparent 72%)',
            }}
          />
        </div>

        {/* Tactile Lookbook Paper Grain (Pre-baked static tile -> 0 SVG filter cost!) */}
        <div
          className="absolute inset-0 pointer-events-none -z-10 opacity-40"
          style={{
            backgroundImage: 'url("/assets/film_grain_tile.webp")',
            backgroundSize: '128px 128px',
            backgroundRepeat: 'repeat',
          }}
        />

        {/* ── 1. CLEAN ARCHITECTURAL EYEBROW & FRAMING LINE ── */}
        <div className="relative z-30 w-full flex flex-col shrink-0">
          <div ref={eyebrowRef} className="w-full flex items-center justify-between will-change-transform">
            <div className="flex items-center gap-2.5 font-mono text-[11px] sm:text-[12px] text-stone-600 tracking-[0.22em] uppercase">
              <span className="font-bold text-stone-900">03 — THE NEXUS</span>
              <span className="text-stone-300">/</span>
              <span className="text-stone-600 font-semibold tracking-[0.24em]">PERSONA & ARCHIVE</span>
            </div>

            {/* Spacer for Top-Right Floating Navbar */}
            <div className="w-48 h-8 shrink-0 pointer-events-none" />
          </div>

          {/* Architectural Framing Top Line (Scrubbed scaleX 0 -> 1) */}
          <div
            ref={topLineRef}
            className="w-full h-[1px] bg-stone-300 mt-3.5 origin-left will-change-transform"
          />
        </div>

        {/* ── 2. THREE-ZONE ARCHITECTURE (NARRATOR LEFT | RUNWAY CENTER | NUMERAL RIGHT) ── */}
        <div className="relative z-20 flex-1 w-full h-full flex items-center justify-between overflow-visible">
          
          {/* Mobile Ghost Watermark Numeral (Visible on small screens only) */}
          <div
            ref={mobileNumeralRef}
            className="md:hidden absolute top-0 right-0 pointer-events-none select-none z-10 flex flex-col items-end will-change-transform"
          >
            <span className="font-display font-black text-6xl xs:text-7xl text-[#141414]/10 tracking-tighter leading-none">
              0{activeIdx + 1}
            </span>
          </div>

          {/* ═════════════════════════════════════════════════════════════════════════
              ZONE 1: SANG "NARATOR" (STICKY DI KIRI)
              KOTA-style: Dedicated width, completely independent from runway
              ═════════════════════════════════════════════════════════════════════════ */}
          <div className="w-[56%] xs:w-[54%] sm:w-[300px] md:w-[340px] lg:w-[370px] shrink-0 z-30 relative select-none">
            
            {/* Interactive Architectural Stepper Tabs */}
            <div
              ref={stepperRef}
              className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 mb-4 sm:mb-6 will-change-transform flex-wrap"
              role="tablist"
              aria-label="Navigasi Babak Nexus"
            >
              {CHAPTERS.map((ch, idx) => {
                const isActive = activeIdx === idx;
                return (
                  <button
                    key={ch.id}
                    onClick={() => handleTabClick(idx)}
                    role="tab"
                    aria-selected={isActive}
                    title={`Lompat ke Babak 0${idx + 1} — ${ch.shortLabel}`}
                    className="group flex items-center gap-1.5 xs:gap-2 cursor-pointer py-1 select-none transition-all duration-300 focus:outline-none"
                  >
                    {/* Number Badge */}
                    <span
                      className={`w-4 h-4 xs:w-5 xs:h-5 rounded-full flex items-center justify-center font-mono text-[8.5px] xs:text-[9.5px] font-bold border transition-all duration-200 ${
                        isActive
                          ? 'bg-[#141414] text-white border-[#141414] shadow-sm scale-105'
                          : 'bg-stone-200/70 text-stone-700 border-stone-400 group-hover:bg-[#141414] group-hover:text-white group-hover:border-[#141414]'
                      }`}
                    >
                      0{idx + 1}
                    </span>

                    {/* Label with Underline on Hover */}
                    <span
                      className={`font-mono text-[10px] xs:text-[11px] sm:text-[12px] tracking-[0.12em] xs:tracking-[0.14em] uppercase transition-all duration-200 border-b pb-0.5 ${
                        isActive
                          ? 'font-bold text-stone-900 border-stone-900'
                          : 'font-medium text-stone-600 border-transparent group-hover:text-stone-900 group-hover:border-stone-500'
                      }`}
                    >
                      {ch.shortLabel}
                    </span>

                    {/* Separator Line */}
                    {idx < CHAPTERS.length - 1 && (
                      <span className="w-1.5 xs:w-2.5 h-[1px] bg-stone-300 inline-block ml-0.5 xs:ml-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Stacked Narrative Dialogs */}
            <div className="relative w-full min-h-[260px] sm:min-h-[300px]">
              {CHAPTERS.map((ch, idx) => (
                <div
                  key={ch.id}
                  ref={(el) => {
                    textsRef.current[idx] = el;
                  }}
                  className={`absolute inset-x-0 top-0 flex flex-col will-change-transform ${
                    activeIdx === idx ? 'pointer-events-auto z-30' : 'pointer-events-none z-10'
                  }`}
                >
                  <div
                    ref={idx === 0 ? text0EnterRef : undefined}
                    className="flex flex-col will-change-transform"
                  >
                  {/* Tagline / Sub-Eyebrow */}
                  <span className="font-mono text-[9.5px] xs:text-[11px] sm:text-[12px] tracking-[0.18em] xs:tracking-[0.22em] text-stone-500 uppercase mb-1.5 xs:mb-2.5 font-medium truncate">
                    {ch.tagline}
                  </span>

                  {/* Headline Masked from Overflow Hidden */}
                  <div className="overflow-hidden">
                    <h3
                      ref={idx === 0 ? headline0Ref : undefined}
                      className="font-display font-black text-2xl xs:text-3xl sm:text-[34px] lg:text-[40px] text-[#141414] tracking-tight uppercase leading-[0.98] will-change-transform"
                    >
                      {ch.title}
                    </h3>
                  </div>

                  {/* Supporting Content Group (Quote, Caption, CTA Button) */}
                  <div
                    ref={idx === 0 ? supporting0Ref : undefined}
                    className="flex flex-col will-change-transform"
                  >
                    {/* Quote */}
                    <p className="font-serif italic text-xs xs:text-sm sm:text-base text-stone-700 mt-2 xs:mt-3.5 leading-snug line-clamp-2 sm:line-clamp-none">
                      "{ch.quote}"
                    </p>

                    {/* Description */}
                    <p className="font-sans text-[11px] xs:text-xs sm:text-[13px] text-stone-600 leading-relaxed mt-2 sm:mt-3 max-w-[195px] xs:max-w-[225px] sm:max-w-[340px] line-clamp-3 sm:line-clamp-none">
                      {ch.caption}
                    </p>
                  </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* ═════════════════════════════════════════════════════════════════════════
              ZONE 2: PANGGUNG RUNWAY KARAKTER (TENGAH / KANAN MOBILE)
              Desktop: center (50%). Mobile: placed at 65% so it never collides with text.
              ═════════════════════════════════════════════════════════════════════════ */}
          <div
            ref={runwayParallaxRef}
            className="relative flex-1 h-full overflow-visible pointer-events-none z-20 will-change-transform"
          >
            {CHAPTERS.map((ch, idx) => (
              <div
                key={ch.id}
                ref={(el) => {
                  charsRef.current[idx] = el;
                }}
                className={`absolute bottom-0 left-[74%] xs:left-[71%] sm:left-[58%] md:left-1/2 will-change-transform flex flex-col items-center ${
                  activeIdx === idx ? 'pointer-events-auto z-30' : 'pointer-events-none z-10'
                }`}
                style={{
                  transformOrigin: 'bottom center',
                }}
              >
                <div
                  ref={idx === 0 ? char0EnterRef : undefined}
                  className="flex flex-col items-center will-change-transform"
                >
                {/* Ambient Soft Ground Shadow per Character */}
                <div
                  className="w-[180px] xs:w-[220px] sm:w-[320px] h-3.5 sm:h-4 rounded-full pointer-events-none -z-10 translate-y-2"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, rgba(20,20,20,0.22) 0%, rgba(20,20,20,0.03) 55%, transparent 75%)',
                    filter: 'blur(6px)',
                  }}
                />

                {/* Interactive Living Figure Wrapper with Keyboard & Micro-interactions */}
                <div
                  role="button"
                  tabIndex={overlayOpen ? -1 : 0}
                  aria-label={`Buka detail babak 0${idx + 1} — ${ch.shortLabel}`}
                  onClick={(e) => {
                    if (overlayOpen) return;
                    handleOpenModal(idx, e);
                  }}
                  onKeyDown={(e) => {
                    if (overlayOpen) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenModal(idx);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (overlayOpen) return;
                    cursorTargetRef.current = { x: e.clientX, y: e.clientY };
                    cursorCurrentRef.current = { x: e.clientX, y: e.clientY };
                    setActiveHoverIdx(idx);
                    setBadgeVisible(true);
                  }}
                  onMouseMove={(e) => {
                    if (overlayOpen) return;
                    cursorTargetRef.current = { x: e.clientX, y: e.clientY };
                  }}
                  onMouseLeave={() => {
                    setBadgeVisible(false);
                  }}
                  className="group relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141414] focus-visible:ring-offset-8 focus-visible:rounded-lg select-none"
                >
                  {/* Living Figure Cutout */}
                  <img
                    ref={idx === 0 ? char0ImgRef : undefined}
                    src={ch.imgUrl}
                    alt={ch.imgAlt}
                    className="h-[46vh] xs:h-[50vh] sm:h-[64vh] md:h-[72vh] lg:h-[76vh] max-h-[700px] w-auto object-contain object-bottom transition-all duration-300 ease-out will-change-transform group-hover:scale-[1.03] group-hover:drop-shadow-[0_20px_35px_rgba(20,20,20,0.18)]"
                    style={{
                      filter: ch.imgFilter,
                      WebkitFilter: ch.imgFilter,
                      maskImage: ch.imgMask,
                      WebkitMaskImage: ch.imgMask,
                      transform: ch.imgTransform,
                    }}
                    loading={idx === 0 ? "eager" : "lazy"}
                    decoding={idx === 0 ? "sync" : "async"}
                  />

                  {/* Vertical Animated "CLICK ←" Typewriter Spin Indicator with Descending Silhouette */}
                  <VerticalClickPrompt
                    chapterNumber={ch.number}
                    chapterIndex={idx}
                    isActive={isStageInView && activeIdx === idx}
                    isCharacterHovered={badgeVisible && activeHoverIdx === idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (overlayOpen) return;
                      handleOpenModal(idx, e);
                    }}
                  />
                </div>
                </div>
              </div>
            ))}
          </div>

          {/* ═════════════════════════════════════════════════════════════════════════
              ZONE 3: SANG "PENUNJUK BABAK" (ANGKA RAKSASA DI KANAN ALA KOTA)
              Visible on medium/large desktop screens; mobile uses ghost watermark.
              ═════════════════════════════════════════════════════════════════════════ */}
          <div
            ref={numeralParallaxRef}
            className="hidden md:flex w-[125px] sm:w-[155px] lg:w-[195px] shrink-0 text-right z-10 select-none flex-col items-end justify-center will-change-transform"
          >
            
            {/* Rolling Chapter Numerals */}
            <div className="h-[90px] sm:h-[120px] lg:h-[150px] overflow-hidden flex flex-col items-end pointer-events-none">
              <div
                ref={numeralTrackRef}
                className="flex flex-col items-end will-change-transform"
              >
                {CHAPTERS.map((ch, cIdx) => (
                  <div
                    key={ch.number}
                    className="h-[90px] sm:h-[120px] lg:h-[150px] overflow-hidden flex items-center justify-end"
                  >
                    <span
                      ref={cIdx === 0 ? numeral0Ref : undefined}
                      className="block font-display font-black text-7xl sm:text-8xl lg:text-[140px] leading-none text-[#141414]/20 tracking-tighter will-change-transform select-none"
                    >
                      {ch.number}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clean Progress Dashes (Streamlined — no redundant text clutter) */}
            <div className="mt-3 flex flex-col items-end pointer-events-auto">
              <div
                className="flex items-center gap-1.5"
                role="group"
                aria-label="Indikator Babak"
              >
                {CHAPTERS.map((_, barIdx) => {
                  const isCurrent = activeIdx === barIdx;
                  return (
                    <button
                      key={barIdx}
                      onClick={() => handleTabClick(barIdx)}
                      title={`Lompat ke Babak 0${barIdx + 1} — ${CHAPTERS[barIdx].shortLabel}`}
                      className={`h-[2.5px] rounded-full transition-all duration-300 cursor-pointer ${
                        isCurrent
                          ? 'w-7 bg-[#141414]'
                          : 'w-3 bg-stone-300 hover:bg-stone-600 hover:w-4'
                      }`}
                      aria-label={`Babak 0${barIdx + 1}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* ── 3. MINIMALIST BOTTOM STATUS BAR & FRAMING LINE ── */}
        <div className="relative z-30 w-full flex flex-col shrink-0">
          {/* Architectural Framing Bottom Line (Scrubbed scaleX 0 -> 1) */}
          <div
            ref={bottomLineRef}
            className="w-full h-[1px] bg-stone-300 mb-3 origin-left will-change-transform"
          />

          <div
            ref={bottomMetaRef}
            className="w-full flex items-center justify-between font-mono text-[10.5px] sm:text-[11.5px] text-stone-500 tracking-[0.16em] uppercase will-change-transform"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-800">{CHAPTERS[activeIdx].title}</span>
              <span className="text-stone-300">—</span>
              <span className="text-stone-500 font-medium">{CHAPTERS[activeIdx].shortLabel}</span>
            </div>
            <div className="hidden xs:flex items-center gap-2 text-stone-600 font-medium">
              <span className="tracking-[0.18em] text-[10px] sm:text-[11px]">
                SCROLL OR CLICK FIGURE
              </span>
              <span className="text-stone-900 font-bold animate-bounce">↓</span>
            </div>
          </div>
        </div>

        </div>
      </section>

      {/* Floating Editorial Cursor Badge near Character on Hover (High-Contrast Obsidian Pill with Chapter Accent Dot) */}
      <div
        ref={cursorBadgeRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-50 will-change-transform opacity-0 select-none"
        style={{
          transform: 'translate3d(-999px, -999px, 0)',
        }}
      >
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md bg-[#111318]/95 border border-white/20 shadow-[0_14px_34px_rgba(0,0,0,0.32)]">
          <span
            className={`w-1.5 h-1.5 rounded-full inline-block shrink-0 ${
              activeHoverIdx === 0
                ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.9)]'
                : activeHoverIdx === 1
                ? 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.9)]'
                : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]'
            }`}
          />
          <span className="font-mono text-[10.5px] font-bold tracking-[0.22em] uppercase text-white whitespace-nowrap">
            {activeHoverIdx === 0
              ? 'EXPLORE ARCHIVE ↗'
              : activeHoverIdx === 1
              ? 'ENTER SANCTUARY ↗'
              : 'INSPECT RECEIPTS ↗'}
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          CHAPTER 01: SPECIALIZED EDITORIAL ARCHIVE MODAL (OFF-SCREEN / 21 FRAMES)
          Warm stone lookbook with draggable filmstrip & interactive cursor trail
          ═══════════════════════════════════════════════════════════════════════════ */}
      {overlayOpen && modalIdx === 0 && (
        <FieldNotesArchiveModal
          isOpen={overlayOpen}
          onClose={handleCloseArchive}
          origin={origin}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          CHAPTER 02: BEYOND THE MASK // SPIDER-MAN SILVERY WEB TRANSITION & PRINCIPLES
          Procedural spider web snap ("Jepret!") & 4 Core Engineering Principles
          ═══════════════════════════════════════════════════════════════════════════ */}
      {overlayOpen && modalIdx === 1 && (
        <Chapter02PrinciplesModal
          isOpen={overlayOpen}
          onClose={handleCloseArchive}
          origin={origin}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          IRON MAN CLICK-ORIGIN REPULSOR IGNITION & CRT POWER-OFF PRELOADER GATE
          (0.0s – 0.65s + Preload Hold until 100% -> Final Spark & Entry ke K3)
          ═══════════════════════════════════════════════════════════════════════════ */}
      {isIronManTransitioning && typeof document !== 'undefined' && createPortal(
        <div
          role="status"
          aria-live="polite"
          aria-label="Memuat Arsip Dossier Iron Man"
          className="fixed inset-0 z-[99999] bg-[#050505] overflow-hidden select-none pointer-events-auto"
        >
          {/* Layer 1: Exponential Repulsor Blast from Click Origin */}
          <div
            ref={repulsorFlareRef}
            className="absolute rounded-full pointer-events-none will-change-transform"
            style={{
              background:
                'radial-gradient(circle at center, #FFFFFF 0%, #FFFFFF 30%, #00E5FF 55%, #38BDF8 75%, transparent 100%)',
              mixBlendMode: 'plus-lighter',
            }}
          />

          {/* Layer 2: Anamorphic Horizontal Lens Flare Beam */}
          <div
            ref={repulsorBeamRef}
            className="absolute w-[180px] h-[3px] bg-white pointer-events-none will-change-transform"
            style={{
              boxShadow:
                '0 0 24px 6px rgba(0, 229, 255, 0.95), 0 0 45px 12px rgba(56, 189, 248, 0.75)',
              mixBlendMode: 'screen',
            }}
          />

          {/* Layer 3: CRT TV Collapse White Screen (scaleY: 1 -> 0.004) */}
          <div
            ref={crtWhiteFlashRef}
            className="absolute inset-0 bg-white pointer-events-none will-change-transform opacity-0"
            style={{ transformOrigin: 'center center' }}
          />

          {/* Layer 4: Razor-Sharp Center Cyan-White Horizontal Laser Beam */}
          <div
            ref={crtLaserLineRef}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2.5px] bg-white pointer-events-none will-change-transform opacity-0"
            style={{
              transformOrigin: 'center center',
              boxShadow:
                '0 0 16px 4px #FFFFFF, 0 0 32px 8px #00E5FF, 0 0 60px 18px rgba(56, 189, 248, 0.85)',
            }}
          />

          {/* Layer 5: Technical Minimalist Stark HUD Readiness Gate */}
          <div
            ref={hudContainerRef}
            className="absolute inset-x-0 bottom-[18vh] sm:bottom-[22vh] flex flex-col items-center justify-center text-center opacity-0 pointer-events-none px-4"
          >
            {/* Status Line */}
            <div className="font-mono text-xs sm:text-sm tracking-[0.28em] uppercase text-cyan-300 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00E5FF]" />
              <span>SYNCING DOSSIER // {preloadProgress}%</span>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-56 sm:w-72 h-[2px] bg-white/10 rounded-full overflow-hidden mt-3 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-300 to-white shadow-[0_0_12px_rgba(0,229,255,0.9)] transition-all duration-150 ease-out"
                style={{ width: `${preloadProgress}%` }}
              />
            </div>

            {/* Sub-label */}
            <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.24em] uppercase text-stone-500 mt-2.5">
              {preloadProgress >= 100
                ? 'PROTOCOL READY // ACCESS GRANTED'
                : 'INITIALIZING IRON MAN ACCREDITED DATABASE'}
            </span>
          </div>
        </div>,
        document.body
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          CHAPTER 03: THE RECEIPTS // ARISTIDE BENOIST 1:1 ACCREDITED CERTIFICATES
          100vw × 100vh matte dark editorial gallery with Lerp inertia & focus view
          ═══════════════════════════════════════════════════════════════════════════ */}
      {overlayOpen && modalIdx === 2 && (
        <Chapter03ReceiptsModal
          isOpen={overlayOpen}
          onClose={handleCloseArchive}
          origin={origin}
          skipPreloader={true}
        />
      )}

    </div>
  );
};

export default NexusSection;
