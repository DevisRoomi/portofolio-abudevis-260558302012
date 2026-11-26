import React, { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ArrowRight, Layers, ArrowUpRight } from 'lucide-react';
import { Project, SlotConfig } from '../types/work';
import { CardWordFlip } from './MicroInteractions';

interface CardProps {
  project: Project;
  cardIndex: number;
  slotIndex: number;
  isActive: boolean;
  onClick: () => void;
  onImageClick: (e: React.MouseEvent, project: Project) => void;
  subSlide: number;
  onSubSlideToggle: (e: React.MouseEvent, id: string, max: number) => void;
  slots: SlotConfig[];
  cinemaProgressRef: React.MutableRefObject<number>;
  registerCinemaUpdater: (id: string, fn: (progress: number) => void) => () => void;
  onCursorBadge?: (label: string | null, e?: React.MouseEvent) => void;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const CARD_SUITS = [
  { symbol: '♠', accent: '#7DD3FC' }, // 01 Pentacart
  { symbol: '♦', accent: '#FBBF24' }, // 02 Basoku
  { symbol: '♣', accent: '#C4B5FD' }, // 03 Tahfidz
  { symbol: '♥', accent: '#5EEAD4' }, // 04 Jarvis AI
  { symbol: '♠', accent: '#94A3B8' }, // 05 Duitin
  { symbol: '♦', accent: '#86EFAC' }, // 06 Matchaverse
  { symbol: '♣', accent: '#FDBA74' }, // 07 E-Report
  { symbol: '♥', accent: '#FDA4AF' }, // 08 CapyQuest
];

/* ═══════════════════════════════════════════════════════════════════════════
   WORK PROJECT CARD — ZERO-CLIP ISOLATED 3D PERSPECTIVE + RIBBON DEAL FLIP
   Key 3D Architecture:
   - Parent container (`deckBreathingRef`) uses flat 2D stacking (z-index)
   - Each individual `cardRef` owns its own `perspective: 1400px` context!
   - Result: Full real 3D 180° Poker-to-Project Flip + 3D Cursor Tilt with
     ZERO physical card slicing/intersection at any rotation angle!
   ═══════════════════════════════════════════════════════════════════════════ */
export const WorkProjectCard: React.FC<CardProps> = ({
  project,
  cardIndex,
  slotIndex,
  isActive,
  onClick,
  onImageClick,
  subSlide,
  onSubSlideToggle,
  slots,
  cinemaProgressRef,
  registerCinemaUpdater,
  onCursorBadge,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const wasHeroRef = useRef<boolean>(slotIndex === 0);
  const isFirstRender = useRef<boolean>(true);

  const slot = slots[slotIndex] ?? slots[7];
  const slotRef = useRef<SlotConfig>(slot);
  const slotIndexRef = useRef<number>(slotIndex);
  slotRef.current = slot;
  slotIndexRef.current = slotIndex;

  const suit = CARD_SUITS[cardIndex % CARD_SUITS.length];

  const tiltRotXTo = useRef<gsap.QuickToFunc | null>(null);
  const tiltRotYTo = useRef<gsap.QuickToFunc | null>(null);
  const peekYTo = useRef<gsap.QuickToFunc | null>(null);
  const peekScaleTo = useRef<gsap.QuickToFunc | null>(null);

  // Magician's Ribbon Deal (0.00 -> 0.48) + Zero-Clip Domino 180° Flip (0.46 -> 0.98)
  const computeCinemaState = useCallback(
    (rawProgress: number, targetSlot: SlotConfig, sIdx: number) => {
      const p = clamp01(rawProgress);

      // Ring stagger: 0 = center hero, 1 = inner flanks, 2 = lower flanks, 3 = upper/rear flanks
      const ring = sIdx === 0 ? 0 : sIdx === 1 || sIdx === 7 ? 1 : sIdx === 2 || sIdx === 6 ? 2 : 3;

      // ── Phase A: Tight Stacked Obsidian Poker Deck → Smooth Velvet Fan-Out Deal (0.00 -> 0.48) ──
      const stackX = ((cardIndex % 3) - 1) * 3.5;
      const stackY = 22 + (7 - cardIndex) * 2.5;
      const stackRot = (cardIndex - 3.5) * 1.15;
      const stackScale = 0.88;

      const dealStart = ring * 0.035;
      const dealEnd = 0.37 + ring * 0.035;
      const dNorm = clamp01((p - dealStart) / (dealEnd - dealStart));
      const dEase = easeOutCubic(dNorm);
      // Gentle natural dealing lift arc (no chaotic criss-crossing!)
      const dealArcY = -Math.sin(dNorm * Math.PI) * (14 + ring * 4);

      // ── Phase B: Staggered Zero-Clip 180° Domino Flip (0.46 -> 0.98) ──
      const flipStart = 0.46 + ring * 0.08;
      const flipDuration = 0.27;
      const flipNorm = clamp01((p - flipStart) / flipDuration);
      const flipEase = easeInOutCubic(flipNorm);

      const rotateY = lerp(180, 0, flipEase);
      const flipPopScale = Math.sin(flipEase * Math.PI) * 0.055;
      const flipLiftY = -Math.sin(flipEase * Math.PI) * 10;

      const targetScale = targetSlot.scale ?? targetSlot.w / 295;

      return {
        x: lerp(stackX, targetSlot.x, dEase),
        y: lerp(stackY, targetSlot.y, dEase) + dealArcY + flipLiftY,
        rotation: lerp(stackRot, targetSlot.rot, dEase),
        scale: lerp(stackScale, targetScale, dEase) + flipPopScale,
        rotateY,
      };
    },
    [cardIndex]
  );

  // Register live scroll-driven deal + flip updater
  useEffect(() => {
    const updateFromCinema = (progress: number) => {
      if (!cardRef.current || !flipRef.current) return;
      const st = computeCinemaState(progress, slotRef.current, slotIndexRef.current);

      gsap.set(cardRef.current, {
        xPercent: -50,
        yPercent: -50,
        x: st.x,
        y: st.y,
        rotation: st.rotation,
        scale: st.scale,
        zIndex: slotIndexRef.current === 0 ? 75 : slotRef.current.z,
        force3D: true,
      });

      gsap.set(flipRef.current, {
        rotateY: st.rotateY,
        force3D: true,
      });
    };

    const unregister = registerCinemaUpdater(project.id, updateFromCinema);
    return unregister;
  }, [project.id, computeCinemaState, registerCinemaUpdater]);

  // Setup inner 3D tilt & hover peek quickTo animators
  useEffect(() => {
    if (!tiltRef.current) return;
    tiltRotXTo.current = gsap.quickTo(tiltRef.current, 'rotateX', { duration: 0.35, ease: 'power2.out' });
    tiltRotYTo.current = gsap.quickTo(tiltRef.current, 'rotateY', { duration: 0.35, ease: 'power2.out' });
    peekYTo.current = gsap.quickTo(tiltRef.current, 'y', { duration: 0.32, ease: 'power2.out' });
    peekScaleTo.current = gsap.quickTo(tiltRef.current, 'scale', { duration: 0.32, ease: 'power2.out' });
  }, []);

  useEffect(() => {
    tiltRotXTo.current?.(0);
    tiltRotYTo.current?.(0);
    peekYTo.current?.(0);
    peekScaleTo.current?.(1);
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  }, [isActive]);

  // Interactive slot switching when user clicks a card or Prev/Next
  useEffect(() => {
    if (!cardRef.current || !flipRef.current) return;

    const st = computeCinemaState(cinemaProgressRef.current, slot, slotIndex);

    if (isFirstRender.current) {
      isFirstRender.current = false;
      wasHeroRef.current = slotIndex === 0;
      gsap.set(cardRef.current, {
        xPercent: -50,
        yPercent: -50,
        x: st.x,
        y: st.y,
        rotation: st.rotation,
        scale: st.scale,
        zIndex: slotIndex === 0 ? 75 : slot.z,
        force3D: true,
      });
      gsap.set(flipRef.current, {
        rotateY: st.rotateY,
        force3D: true,
      });
      return;
    }

    const isBecomingHero = slotIndex === 0;
    const wasHero = wasHeroRef.current;
    wasHeroRef.current = isBecomingHero;

    if (isBecomingHero) {
      gsap.set(cardRef.current, { zIndex: 100 });
      gsap.to(cardRef.current, {
        xPercent: -50,
        yPercent: -50,
        x: st.x,
        y: st.y,
        rotation: st.rotation,
        scale: st.scale,
        duration: 0.64,
        ease: 'power3.out',
        force3D: true,
        overwrite: 'auto',
        onComplete: () => {
          if (cardRef.current) gsap.set(cardRef.current, { zIndex: 75 });
        },
      });
    } else if (wasHero) {
      gsap.set(cardRef.current, { zIndex: 70 });
      gsap.to(cardRef.current, {
        xPercent: -50,
        yPercent: -50,
        x: st.x,
        y: st.y,
        rotation: st.rotation,
        scale: st.scale,
        duration: 0.64,
        ease: 'power3.out',
        force3D: true,
        overwrite: 'auto',
        onComplete: () => {
          if (cardRef.current) gsap.set(cardRef.current, { zIndex: slot.z });
        },
      });
    } else {
      gsap.set(cardRef.current, { zIndex: slot.z });
      gsap.to(cardRef.current, {
        xPercent: -50,
        yPercent: -50,
        x: st.x,
        y: st.y,
        rotation: st.rotation,
        scale: st.scale,
        duration: 0.6,
        ease: 'power3.out',
        force3D: true,
        overwrite: 'auto',
      });
    }
  }, [slotIndex, slot, cinemaProgressRef, computeCinemaState]);

  const isFlippedToFront = () => cinemaProgressRef.current >= 0.86;

  const handleCardMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFlippedToFront()) return;
    if (!isActive) {
      peekYTo.current?.(-16);
      peekScaleTo.current?.(1.045);
      onCursorBadge?.('SELECT CARD', e);
    }
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isFlippedToFront()) return;
    if (!isActive) {
      onCursorBadge?.('SELECT CARD', e);
      return;
    }

    if (!tiltRef.current) return;
    const rect = tiltRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const normX = (px - 0.5) * 2;
    const normY = (py - 0.5) * 2;

    tiltRotYTo.current?.(normX * 7.5);
    tiltRotXTo.current?.(-normY * 6.5);

    if (glareRef.current) {
      glareRef.current.style.opacity = '1';
      glareRef.current.style.background = `radial-gradient(240px circle at ${(px * 100).toFixed(1)}% ${(py * 100).toFixed(1)}%, rgba(255,255,255,${project.dark ? '0.24' : '0.45'}), transparent 72%)`;
    }
  };

  const handleCardMouseLeave = () => {
    tiltRotXTo.current?.(0);
    tiltRotYTo.current?.(0);
    peekYTo.current?.(0);
    peekScaleTo.current?.(1);
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
    onCursorBadge?.(null);
  };

  const currentImg = project.images[subSlide] ?? project.images[0];

  return (
    <div
      ref={cardRef}
      onClick={(e) => {
        if (!isFlippedToFront()) return;
        if (isActive) {
          onImageClick(e, project);
        } else {
          onClick();
        }
      }}
      onMouseEnter={handleCardMouseEnter}
      onMouseMove={handleCardMouseMove}
      onMouseLeave={handleCardMouseLeave}
      className="absolute select-none cursor-pointer group/card"
      style={{
        width: 295,
        height: 410,
        left: '50%',
        top: '50%',
        zIndex: slotIndex === 0 ? 75 : slot.z,
        perspective: '1400px', // Isolated 3D camera per card -> ZERO inter-card Z-clipping!
        transformOrigin: 'center center',
        willChange: 'transform',
      }}
    >
      {/* ── LAYER 2: INNER 3D TILT + PEEK WRAPPER ── */}
      <div
        ref={tiltRef}
        className="relative w-full h-full will-change-transform"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* ── LAYER 3: TRUE DOUBLE-SIDED 3D POKER-TO-PROJECT FLIPPER ── */}
        <div
          ref={flipRef}
          className="relative w-full h-full will-change-transform"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* ═══════════════════════════════════════════════════════════════
              FRONT FACE (rotateY: 0deg) — VIBRANT PROJECT CARD
              ═══════════════════════════════════════════════════════════════ */}
          <div
            className="absolute inset-0 w-full h-full rounded-[20px] overflow-hidden flex flex-col justify-between p-3.5 sm:p-4 transition-shadow duration-500"
            style={{
              backgroundColor: project.bg,
              color: project.fg,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg) translateZ(1px)',
              boxShadow: isActive
                ? `0 8px 0 ${project.bevelColor}, 0 16px 28px -4px rgba(0,0,0,0.28), 0 40px 80px -15px rgba(0,0,0,0.38), inset 0 2px 1.5px rgba(255,255,255,0.7), inset 0 -3px 8px rgba(0,0,0,0.18)`
                : `0 5px 0 ${project.bevelColor}, 0 12px 24px -6px rgba(0,0,0,0.18), 0 26px 50px -12px rgba(0,0,0,0.20), inset 0 1.5px 1px rgba(255,255,255,0.5)`,
              border: project.dark ? '1.5px solid rgba(255,255,255,0.18)' : '1.5px solid rgba(0,0,0,0.12)',
            }}
          >
            <div
              ref={glareRef}
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none z-30 opacity-0 transition-opacity duration-300 rounded-[20px]"
            />

            <div
              className="absolute top-0 left-[8%] right-[8%] h-[1.5px] pointer-events-none z-10"
              style={{
                background: project.dark
                  ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.90), transparent)',
              }}
            />

            {isActive && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-20 rounded-[20px]"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="1"
                  y="1"
                  width="calc(100% - 2px)"
                  height="calc(100% - 2px)"
                  rx="19"
                  fill="none"
                  stroke={project.dark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.22)'}
                  strokeWidth="1.5"
                  strokeDasharray="1400"
                  strokeDashoffset="1400"
                  className="animate-border-draw"
                />
              </svg>
            )}

            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-1.5">
                <span
                  className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{ backgroundColor: project.accentBg, color: project.accentFg }}
                >
                  <CardWordFlip text={project.category} />
                </span>
              </div>

              <span
                className="font-mono text-[10px] font-bold tracking-widest opacity-65"
                style={{ color: project.fg }}
              >
                {project.num} / 08
              </span>
            </div>

            <div className="my-auto py-1 z-10">
              <h3
                className="font-display font-extrabold text-lg sm:text-xl tracking-tight leading-tight uppercase"
                style={{ color: project.fg }}
              >
                {project.title}
              </h3>
              <p
                className="font-mono text-[10px] sm:text-[11px] font-medium leading-snug mt-0.5 opacity-75 line-clamp-1"
                style={{ color: project.fg }}
              >
                {project.subtitle}
              </p>

              <div
                onMouseEnter={(e) => {
                  if (isActive && isFlippedToFront()) onCursorBadge?.('INSPECT PROJECT ↗', e);
                }}
                onMouseMove={(e) => {
                  if (isActive && isFlippedToFront()) onCursorBadge?.('INSPECT PROJECT ↗', e);
                }}
                onMouseLeave={() => {
                  if (isActive) onCursorBadge?.(null);
                }}
                className={`mt-2 rounded-xl overflow-hidden relative group/img cursor-pointer ${
                  isActive ? 'ring-2 ring-white/40 shadow-md' : 'opacity-85'
                }`}
                style={{
                  backgroundColor: project.dark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.45)',
                  border: project.dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)',
                }}
              >
                <div
                  className="h-5 px-2 flex items-center justify-between border-b"
                  style={{
                    backgroundColor: project.dark ? 'rgba(0,0,0,0.40)' : 'rgba(255,255,255,0.60)',
                    borderColor: project.dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  </div>

                  <span
                    className="font-mono text-[8px] opacity-60 truncate max-w-[130px]"
                    style={{ color: project.fg }}
                  >
                    {currentImg.label}
                  </span>

                  {project.images.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => onSubSlideToggle(e, project.id, project.images.length)}
                      className="flex items-center gap-0.5 font-mono text-[7.5px] px-1 py-0.2 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                      style={{ color: project.fg }}
                      title="Ganti tangkapan layar"
                    >
                      <Layers className="w-2.5 h-2.5" />
                      <span>
                        {subSlide + 1}/{project.images.length}
                      </span>
                    </button>
                  )}
                </div>

                <div className="relative aspect-[16/10] overflow-hidden bg-black/5">
                  <picture>
                    <source srcSet={currentImg.url} type="image/webp" />
                    <img
                      src={currentImg.url}
                      alt={currentImg.label}
                      width="400"
                      height="250"
                      className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover/img:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>

                  {isActive && (
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-2 py-1 rounded bg-black/75 text-white font-mono text-[9px] flex items-center gap-1 shadow-lg backdrop-blur-sm">
                        <span>Inspect</span>
                        <ArrowUpRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {isActive && (
                <p
                  className="font-sans text-[11px] leading-relaxed mt-2.5 line-clamp-3 font-medium opacity-90 transition-opacity duration-300"
                  style={{ color: project.fg }}
                >
                  {project.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 z-10 border-t border-black/5 dark:border-white/10">
              <div className="flex items-center gap-1 flex-wrap">
                {project.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[8px] px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: project.accentBg, color: project.accentFg }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <span
                className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wider group-hover/card:translate-x-0.5 transition-transform"
                style={{ color: project.fg }}
              >
                <span>{isActive ? 'Explore' : 'View'}</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              BACK FACE (rotateY: 180deg) — LUXURY OBSIDIAN FOIL POKER CARD
              ═══════════════════════════════════════════════════════════════ */}
          <div
            aria-hidden="true"
            className="absolute inset-0 w-full h-full rounded-[20px] overflow-hidden p-3 flex flex-col justify-between select-none"
            style={{
              background:
                'radial-gradient(ellipse at 30% 20%, #1B2338 0%, #101522 52%, #090C14 100%)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(1px)',
              boxShadow:
                '0 6px 0 #05070C, 0 18px 38px -8px rgba(0,0,0,0.42), inset 0 1.5px 1px rgba(255,255,255,0.22)',
              border: '1.5px solid rgba(251, 191, 36, 0.34)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-40"
              style={{
                background:
                  'linear-gradient(125deg, transparent 15%, rgba(125,211,252,0.14) 38%, rgba(251,191,36,0.16) 52%, transparent 72%)',
              }}
            />

            <svg
              viewBox="0 0 270 385"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-2.5 w-[calc(100%-20px)] h-[calc(100%-20px)] pointer-events-none"
            >
              <rect x="2" y="2" width="266" height="381" rx="13" stroke="rgba(251,191,36,0.42)" strokeWidth="1.2" />
              <rect
                x="8"
                y="8"
                width="254"
                height="369"
                rx="9"
                stroke="rgba(125,211,252,0.26)"
                strokeWidth="0.8"
                strokeDasharray="4 3"
              />
              <path d="M 135 28 L 236 192.5 L 135 357 L 34 192.5 Z" stroke="rgba(251,191,36,0.28)" strokeWidth="1" />
              <path d="M 135 54 L 214 192.5 L 135 331 L 56 192.5 Z" stroke="rgba(125,211,252,0.22)" strokeWidth="0.9" />
              <circle cx="135" cy="192.5" r="56" stroke="rgba(251,191,36,0.34)" strokeWidth="1" />
              <circle
                cx="135"
                cy="192.5"
                r="46"
                stroke="rgba(125,211,252,0.28)"
                strokeWidth="0.85"
                strokeDasharray="2 3"
              />
              <line x1="135" y1="22" x2="135" y2="122" stroke="rgba(251,191,36,0.22)" strokeWidth="0.8" />
              <line x1="135" y1="263" x2="135" y2="363" stroke="rgba(251,191,36,0.22)" strokeWidth="0.8" />
              <circle cx="22" cy="22" r="2.2" fill="rgba(251,191,36,0.65)" />
              <circle cx="248" cy="22" r="2.2" fill="rgba(251,191,36,0.65)" />
              <circle cx="22" cy="363" r="2.2" fill="rgba(251,191,36,0.65)" />
              <circle cx="248" cy="363" r="2.2" fill="rgba(251,191,36,0.65)" />
            </svg>

            <div className="relative z-10 flex items-start justify-between px-2 pt-1.5">
              <div className="flex flex-col items-center leading-none">
                <span className="font-mono text-[11px] font-bold tracking-wider text-amber-200/95">
                  {project.num}
                </span>
                <span className="text-base mt-0.5" style={{ color: suit.accent }}>
                  {suit.symbol}
                </span>
              </div>
              <span className="font-mono text-[8px] tracking-[0.22em] text-sky-200/55 uppercase mt-1">
                EDITION · 26
              </span>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto px-4">
              <span className="text-lg mb-1 opacity-90" style={{ color: suit.accent }}>
                {suit.symbol}
              </span>
              <span className="font-display font-black text-xl tracking-[0.16em] text-white leading-none">
                DEVIS<span className="text-amber-300 text-xs align-top ml-0.5">®</span>
              </span>
              <span className="w-10 h-[1px] bg-gradient-to-r from-transparent via-amber-300/70 to-transparent my-2" />
              <span className="font-mono text-[8.5px] font-semibold tracking-[0.26em] text-sky-200/80 uppercase">
                PROJECT VAULT
              </span>
            </div>

            <div className="relative z-10 flex items-end justify-between px-2 pb-1.5">
              <span className="font-mono text-[8px] tracking-[0.2em] text-amber-200/50 uppercase mb-1">
                {project.category.slice(0, 10)}
              </span>
              <div className="flex flex-col items-center leading-none rotate-180">
                <span className="font-mono text-[11px] font-bold tracking-wider text-amber-200/95">
                  {project.num}
                </span>
                <span className="text-base mt-0.5" style={{ color: suit.accent }}>
                  {suit.symbol}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
