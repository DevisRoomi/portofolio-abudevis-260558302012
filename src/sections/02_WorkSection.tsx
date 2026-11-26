import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Project } from '../types/work';
import { PROJECTS, SLOTS, FOOTER_CATEGORIES } from '../data/workProjects';
import { WorkProjectCard } from '../components/WorkProjectCard';
import { WorkStickmanRunner, WorkStickmanRunnerHandle } from '../components/WorkStickmanRunner';
import { CheekyMascotHead } from '../components/CheekyMascotHead';
import { DetailInspectorModal } from '../components/DetailInspectorModal';
import { RollingText, WordFlip } from '../components/MicroInteractions';

gsap.registerPlugin(ScrollTrigger);

const PROJECT_GLOW_COLORS: Record<string, string> = {
  pentacart: 'rgba(56, 189, 248, 0.48)',
  basoku: 'rgba(245, 158, 11, 0.48)',
  tahfidz: 'rgba(168, 85, 247, 0.45)',
  jarvis: 'rgba(20, 184, 166, 0.48)',
  duitin: 'rgba(71, 85, 105, 0.40)',
  matchaverse: 'rgba(34, 197, 94, 0.45)',
  'e-report': 'rgba(249, 115, 22, 0.50)',
  capyquest: 'rgba(244, 63, 94, 0.48)',
};

const LINE_1_WORDS = ['Setiap', 'produk', 'yang', 'rapi,'];
const LINE_2_WORDS = ['selalu', 'punya', 'versi', 'draf', 'yang'];
const LINE_3_OLD_WORDS = ['hampir', 'masuk', 'tempat', 'sampah.'];

/* ═══════════════════════════════════════════════════════════════════════════
   04 · SELECTED WORKS — COPY OPSI 1 + TACTILE 3D KEYCAPS + NAILONG + HORIZONTAL CINEMA
   Unified Single Pinned 100dvh Stage (w-[200vw] track, end +=275%, scrub 0.9):
   1. Panel 1 (0.00–0.40):
      - Beat 1: "Setiap produk yang rapi, selalu punya versi draf yang hampir masuk tempat sampah."
      - Beat 2: Crimson strikethrough + Tactile 3D Mechanical Keycap [ ⌫ Del ] physically pressing down
        with minimalist hairline progress meter (DRAFT · 99%) + Stickman panic "!"
      - Beat 3: Dual 3D Mechanical Keycaps [ ⌘ ] + [ Z ] physically clicking down with ripple ring ->
        Line 3 REPLACED IN-PLACE by "untung tetap saya lanjutkan." (Plus Jakarta Sans Bold)
        + Transparent Nailong Yellow Dino sticking tongue out & wiggling!
        + Clean Editorial Hairline Link (01 — 08 · Lihat karyanya →) — ZERO generic AI pills!
   2. Horizontal Camera Pan (0.40–0.59) + Heroic 1.75× 8-Milestone Stickman Runway
   3. Panel 2 Magician's Ribbon Deal + Zero-Clip 3D 180° Poker-to-Project Flip (0.55–0.88)
   4. Interactive Chromatic Pastel Studio (0.88–1.00)
   ═══════════════════════════════════════════════════════════════════════════ */
export const WorkSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [subSlideMap, setSubSlideMap] = useState<Record<string, number>>({});
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [modalOrigin, setModalOrigin] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Floating High-Contrast Obsidian Cursor Badge (synced with Nexus)
  const [cursorLabel, setCursorLabel] = useState<string>('INSPECT PROJECT ↗');
  const [cursorVisible, setCursorVisible] = useState<boolean>(false);
  const cursorBadgeRef = useRef<HTMLDivElement>(null);
  const cursorTargetRef = useRef<{ x: number; y: number }>({ x: -999, y: -999 });
  const cursorCurrentRef = useRef<{ x: number; y: number }>({ x: -999, y: -999 });

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const sectionRef = useRef<HTMLElement>(null);
  const cinemaStageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cinemaTriggerRef = useRef<ScrollTrigger | null>(null);

  // Panel 1 — Copy Opsi 1 + Tactile 3D Mechanical Keycaps Refs
  const poemTopLinesRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const line3OldRef = useRef<HTMLDivElement>(null);
  const strikethroughRef = useRef<HTMLSpanElement>(null);
  const line3NewRef = useRef<HTMLDivElement>(null);
  const mascotRef = useRef<HTMLSpanElement>(null);

  // Beat 2: Tactile [ ⌫ Del ] Mechanical Keycap + Minimal Hairline Meter
  const delStageRef = useRef<HTMLDivElement>(null);
  const delKeycapRef = useRef<HTMLSpanElement>(null);
  const delProgressBarRef = useRef<HTMLDivElement>(null);
  const delPctTextRef = useRef<HTMLSpanElement>(null);

  // Beat 3a: Dual Tactile [ ⌘ ] + [ Z ] Mechanical Keycaps + Click Ripple Ring
  const undoStageRef = useRef<HTMLDivElement>(null);
  const undoKeyCmdRef = useRef<HTMLSpanElement>(null);
  const undoKeyZRef = useRef<HTMLSpanElement>(null);
  const undoRippleRef = useRef<HTMLSpanElement>(null);

  // Beat 3b: Clean Editorial Hairline Link
  const ctaLinkRef = useRef<HTMLDivElement>(null);
  const runnerRef = useRef<WorkStickmanRunnerHandle>(null);

  // Panel 2 Refs
  const panel2Ref = useRef<HTMLDivElement>(null);
  const topChromeRef = useRef<HTMLDivElement>(null);
  const bottomChromeRef = useRef<HTMLDivElement>(null);
  const deckBreathingRef = useRef<HTMLDivElement>(null);
  const ambientGlowRef = useRef<HTMLDivElement>(null);

  // Unified Ribbon Deal + Zero-Clip Flip Coordinator
  const cinemaProgressRef = useRef<number>(prefersReducedMotion ? 1 : 0);
  const cinemaUpdatersRef = useRef<Map<string, (progress: number) => void>>(new Map());
  const isDeckInteractiveRef = useRef<boolean>(prefersReducedMotion);
  const hasEnteredChromaticRef = useRef<boolean>(prefersReducedMotion);
  const activeIndexRef = useRef<number>(activeIndex);
  activeIndexRef.current = activeIndex;

  // Magnetic Parallax quickTo refs
  const glowXTo = useRef<gsap.QuickToFunc | null>(null);
  const glowYTo = useRef<gsap.QuickToFunc | null>(null);
  const cardsParallaxXTo = useRef<gsap.QuickToFunc | null>(null);
  const cardsParallaxYTo = useRef<gsap.QuickToFunc | null>(null);

  const touchStartX = useRef<number>(0);

  const registerCinemaUpdater = useCallback((id: string, fn: (progress: number) => void) => {
    cinemaUpdatersRef.current.set(id, fn);
    fn(cinemaProgressRef.current);
    return () => {
      cinemaUpdatersRef.current.delete(id);
    };
  }, []);

  const getSlotIndex = useCallback(
    (projectIdx: number) => {
      const offset = (projectIdx - activeIndex + PROJECTS.length) % PROJECTS.length;
      return offset < SLOTS.length ? offset : SLOTS.length - 1;
    },
    [activeIndex]
  );

  const advance = useCallback((step: number) => {
    setActiveIndex((prev) => (prev + step + PROJECTS.length) % PROJECTS.length);
  }, []);

  // Viewport & deck-ready scoped ArrowLeft / ArrowRight navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalProject || !isDeckInteractiveRef.current) return;
      if (e.key === 'ArrowRight') advance(1);
      if (e.key === 'ArrowLeft') advance(-1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [advance, modalProject]);

  // Idle background preloading
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const preload = () => {
      PROJECTS.slice(0, 3).forEach((p) => {
        if (p.images[0]) {
          const i = new Image();
          i.src = p.images[0].url;
        }
      });
    };
    if ('requestIdleCallback' in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(preload);
    } else {
      setTimeout(preload, 1200);
    }
  }, []);

  // Floating Obsidian Cursor Badge Lerp Loop (ONLY runs while badge is actually visible -> 0% idle CPU!)
  useEffect(() => {
    if (!cursorVisible || modalProject) return;
    let rafId = 0;
    const tick = () => {
      const badge = cursorBadgeRef.current;
      if (badge) {
        const k = 0.14;
        cursorCurrentRef.current.x += (cursorTargetRef.current.x - cursorCurrentRef.current.x) * k;
        cursorCurrentRef.current.y += (cursorTargetRef.current.y - cursorCurrentRef.current.y) * k;
        badge.style.transform = `translate3d(${cursorCurrentRef.current.x.toFixed(1)}px, ${cursorCurrentRef.current.y.toFixed(1)}px, 0) translate(-50%, -140%)`;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [cursorVisible, modalProject]);

  useEffect(() => {
    const badge = cursorBadgeRef.current;
    if (!badge) return;
    if (cursorVisible && !modalProject) {
      gsap.killTweensOf(badge);
      gsap.fromTo(
        badge,
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.28, ease: 'back.out(1.6)' }
      );
    } else {
      gsap.killTweensOf(badge);
      gsap.to(badge, { scale: 0.85, opacity: 0, duration: 0.18, ease: 'power2.in' });
    }
  }, [cursorVisible, modalProject]);

  const handleCardCursorBadge = useCallback(
    (label: string | null, e?: React.MouseEvent) => {
      if (!label) {
        setCursorVisible(false);
        return;
      }
      if (e) {
        if (!cursorVisible) {
          cursorCurrentRef.current = { x: e.clientX, y: e.clientY };
        }
        cursorTargetRef.current = { x: e.clientX, y: e.clientY };
      }
      setCursorLabel(label);
      setCursorVisible(true);
    },
    [cursorVisible]
  );

  // 1. GSAP ADAPTIVE AMBIENT GLOW + CHROMATIC PASTEL STUDIO BACKGROUND
  useEffect(() => {
    const currentProj = PROJECTS[activeIndex];
    const targetGlow = PROJECT_GLOW_COLORS[currentProj.id] || 'rgba(56, 189, 248, 0.45)';

    if (ambientGlowRef.current) {
      gsap.to(ambientGlowRef.current, {
        backgroundColor: targetGlow,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    if (sectionRef.current && hasEnteredChromaticRef.current) {
      gsap.to(sectionRef.current, {
        backgroundColor: currentProj.stageBg,
        duration: 0.9,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  }, [activeIndex]);

  // 2. GSAP SUBTLE MAGNETIC PARALLAX ON PANEL 2
  useEffect(() => {
    if (prefersReducedMotion) return;

    if (ambientGlowRef.current) {
      glowXTo.current = gsap.quickTo(ambientGlowRef.current, 'x', { duration: 0.85, ease: 'power2.out' });
      glowYTo.current = gsap.quickTo(ambientGlowRef.current, 'y', { duration: 0.85, ease: 'power2.out' });
    }
    if (deckBreathingRef.current) {
      cardsParallaxXTo.current = gsap.quickTo(deckBreathingRef.current, 'x', { duration: 0.65, ease: 'power2.out' });
      cardsParallaxYTo.current = gsap.quickTo(deckBreathingRef.current, 'y', { duration: 0.65, ease: 'power2.out' });
    }
  }, [prefersReducedMotion]);

  const handlePanel2MouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion || !panel2Ref.current || !isDeckInteractiveRef.current) return;
    const rect = panel2Ref.current.getBoundingClientRect();
    const normX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const normY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

    glowXTo.current?.(normX * 24);
    glowYTo.current?.(normY * 16);
    cardsParallaxXTo.current?.(normX * 12);
    cardsParallaxYTo.current?.(normY * 8);
  };

  const handlePanel2MouseLeave = () => {
    if (prefersReducedMotion) return;
    glowXTo.current?.(0);
    glowYTo.current?.(0);
    cardsParallaxXTo.current?.(0);
    cardsParallaxYTo.current?.(0);
    setCursorVisible(false);
  };

  // Smooth jump straight to the flipped interactive Project Vault
  const glideToProjectVault = () => {
    const st = cinemaTriggerRef.current;
    if (!st) return;
    const targetY = st.start + 0.90 * (st.end - st.start);
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number, opts?: unknown) => void } }).__lenis;
    if (lenis) {
      lenis.scrollTo(targetY, {
        duration: 1.5,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
    }
  };

  // 3. UNIFIED HORIZONTAL CINEMA TIMELINE (Copy Opsi 1 + Tactile 3D Keycaps + Pan + Ribbon Deal & Zero-Clip 3D Flip)
  useEffect(() => {
    if (!cinemaStageRef.current || !trackRef.current) return;

    const words = wordsRef.current.filter(Boolean) as HTMLSpanElement[];

    if (prefersReducedMotion) {
      gsap.set(words, { opacity: 1 });
      if (line3OldRef.current) gsap.set(line3OldRef.current, { autoAlpha: 0 });
      if (line3NewRef.current) gsap.set(line3NewRef.current, { autoAlpha: 1, y: 0, scale: 1 });
      if (mascotRef.current) gsap.set(mascotRef.current, { autoAlpha: 1, scale: 1, rotation: 0 });
      if (ctaLinkRef.current) gsap.set(ctaLinkRef.current, { autoAlpha: 1, y: 0 });
      cinemaProgressRef.current = 1;
      isDeckInteractiveRef.current = true;
      hasEnteredChromaticRef.current = true;
      cinemaUpdatersRef.current.forEach((fn) => fn(1));
      return;
    }

    const ctx = gsap.context(() => {
      const cinemaProxy = { progress: 0 };
      const runnerProxy = { p: 0 };
      const delPctProxy = { val: 0 };

      // Initial states for 3-Beat Tactile Plot Twist
      gsap.set(words, { opacity: 0.16 });
      if (poemTopLinesRef.current) gsap.set(poemTopLinesRef.current, { opacity: 1 });
      if (line3OldRef.current) gsap.set(line3OldRef.current, { autoAlpha: 1, y: 0, scale: 1 });
      if (strikethroughRef.current) {
        gsap.set(strikethroughRef.current, { scaleX: 0, transformOrigin: 'left center' });
      }
      if (line3NewRef.current) gsap.set(line3NewRef.current, { autoAlpha: 0, y: 26, scale: 0.92 });
      if (mascotRef.current) gsap.set(mascotRef.current, { autoAlpha: 0, scale: 0.45, rotation: -16 });

      if (delStageRef.current) gsap.set(delStageRef.current, { autoAlpha: 0, y: 10 });
      if (delKeycapRef.current) gsap.set(delKeycapRef.current, { y: 0 });
      if (delProgressBarRef.current) gsap.set(delProgressBarRef.current, { scaleX: 0, transformOrigin: 'left center' });

      if (undoStageRef.current) gsap.set(undoStageRef.current, { autoAlpha: 0, y: 10 });
      if (undoKeyCmdRef.current) gsap.set(undoKeyCmdRef.current, { y: 0 });
      if (undoKeyZRef.current) gsap.set(undoKeyZRef.current, { y: 0 });
      if (undoRippleRef.current) gsap.set(undoRippleRef.current, { scale: 0.6, opacity: 0 });

      if (ctaLinkRef.current) gsap.set(ctaLinkRef.current, { autoAlpha: 0, y: 14 });

      // Initial states for Panel 2 (Stacked Obsidian Poker Deck)
      cinemaProgressRef.current = 0;
      cinemaUpdatersRef.current.forEach((fn) => fn(0));

      if (ambientGlowRef.current) gsap.set(ambientGlowRef.current, { scale: 0.22, opacity: 0.12 });
      if (topChromeRef.current) gsap.set(topChromeRef.current, { opacity: 0, y: -16 });
      if (bottomChromeRef.current) gsap.set(bottomChromeRef.current, { opacity: 0, y: 18 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: cinemaStageRef.current,
          start: 'top top',
          end: '+=275%',
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            isDeckInteractiveRef.current = self.progress >= 0.82;
            const nowChromatic = self.progress >= 0.68;
            if (nowChromatic !== hasEnteredChromaticRef.current) {
              hasEnteredChromaticRef.current = nowChromatic;
              if (sectionRef.current) {
                gsap.to(sectionRef.current, {
                  backgroundColor: nowChromatic
                    ? PROJECTS[activeIndexRef.current]?.stageBg || '#F0F8FF'
                    : '#F5F4F0',
                  duration: 0.8,
                  ease: 'power2.out',
                  overwrite: 'auto',
                });
              }
            }
          },
        },
      });

      cinemaTriggerRef.current = tl.scrollTrigger ?? null;

      // ══════════════════════════════════════════════════════════════════════
      // BEAT 1 (0.00 -> 0.12): CALM EDITORIAL OPENING (COPY OPSI 1)
      // ══════════════════════════════════════════════════════════════════════
      const seg1 = words.slice(0, LINE_1_WORDS.length);
      const seg2 = words.slice(LINE_1_WORDS.length, LINE_1_WORDS.length + LINE_2_WORDS.length);
      const seg3 = words.slice(LINE_1_WORDS.length + LINE_2_WORDS.length);

      tl.to(seg1, { opacity: 1, stagger: 0.009, duration: 0.045, ease: 'none' }, 0.01);
      tl.to(seg2, { opacity: 1, stagger: 0.009, duration: 0.04, ease: 'none' }, 0.05);
      tl.to(seg3, { opacity: 1, stagger: 0.009, duration: 0.04, ease: 'none' }, 0.085);

      // ══════════════════════════════════════════════════════════════════════
      // BEAT 2 (0.13 -> 0.24): TACTILE 3D [ ⌫ Del ] KEYCAP PHYSICAL PRESS!
      // ══════════════════════════════════════════════════════════════════════
      if (delStageRef.current) {
        tl.to(delStageRef.current, { autoAlpha: 1, y: 0, duration: 0.025, ease: 'power2.out' }, 0.128);
      }
      // Physical mechanical keycap depression (press down -> spring slightly)
      if (delKeycapRef.current) {
        tl.to(
          delKeycapRef.current,
          {
            y: 3.5,
            boxShadow: '0 1px 0 #CBD5E1, 0 3px 8px rgba(244,63,94,0.16)',
            duration: 0.022,
            ease: 'power2.in',
          },
          0.145
        ).to(
          delKeycapRef.current,
          {
            y: 0,
            boxShadow: '0 4px 0 #CBD5E1, 0 10px 22px rgba(15,23,42,0.08)',
            duration: 0.025,
            ease: 'power2.out',
          },
          0.20
        );
      }
      if (strikethroughRef.current) {
        tl.to(strikethroughRef.current, { scaleX: 1, duration: 0.045, ease: 'power2.out' }, 0.145);
      }
      if (poemTopLinesRef.current) {
        tl.to(poemTopLinesRef.current, { opacity: 0.38, duration: 0.045, ease: 'power1.out' }, 0.15);
      }
      if (delProgressBarRef.current) {
        tl.to(delProgressBarRef.current, { scaleX: 0.99, duration: 0.06, ease: 'power2.inOut' }, 0.148);
      }
      tl.to(
        delPctProxy,
        {
          val: 99,
          duration: 0.06,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (delPctTextRef.current) {
              delPctTextRef.current.textContent = `${Math.round(delPctProxy.val)}%`;
            }
          },
        },
        0.148
      );

      // ══════════════════════════════════════════════════════════════════════
      // BEAT 3 (0.24 -> 0.39): DUAL 3D [ ⌘ ] + [ Z ] CLICK → LINE-3 SWAP + NAILONG!
      // ══════════════════════════════════════════════════════════════════════
      if (delStageRef.current) {
        tl.to(delStageRef.current, { autoAlpha: 0, y: -10, duration: 0.024, ease: 'power2.in' }, 0.238);
      }
      if (undoStageRef.current) {
        tl.to(undoStageRef.current, { autoAlpha: 1, y: 0, duration: 0.026, ease: 'power2.out' }, 0.246);
        tl.to(undoStageRef.current, { autoAlpha: 0, y: -10, duration: 0.022, ease: 'power2.in' }, 0.312);
      }
      // Simultaneous physical click press of [ ⌘ ] + [ Z ] mechanical keycaps!
      const undoKeys = [undoKeyCmdRef.current, undoKeyZRef.current].filter(Boolean);
      if (undoKeys.length > 0) {
        tl.to(
          undoKeys,
          {
            y: 3.5,
            boxShadow: '0 1px 0 #0284C7, 0 2px 8px rgba(2,132,199,0.22)',
            duration: 0.022,
            stagger: 0.006,
            ease: 'power2.in',
          },
          0.268
        ).to(
          undoKeys,
          {
            y: 0,
            boxShadow: '0 4px 0 #CBD5E1, 0 10px 22px rgba(15,23,42,0.08)',
            duration: 0.024,
            ease: 'power2.out',
          },
          0.292
        );
      }
      // Crisp keystroke click ripple ring!
      if (undoRippleRef.current) {
        tl.fromTo(
          undoRippleRef.current,
          { scale: 0.7, opacity: 0.65 },
          { scale: 2.1, opacity: 0, duration: 0.045, ease: 'power2.out' },
          0.275
        );
      }
      if (poemTopLinesRef.current) {
        tl.to(poemTopLinesRef.current, { opacity: 1, duration: 0.04, ease: 'power2.out' }, 0.27);
      }
      // Line 3 OLD ("hampir masuk tempat sampah.") glides out cleanly
      if (line3OldRef.current) {
        tl.to(
          line3OldRef.current,
          { autoAlpha: 0, y: -28, scale: 0.94, duration: 0.042, ease: 'power2.in' },
          0.272
        );
      }
      // Line 3 NEW ("untung tetap saya lanjutkan.") springs RIGHT INTO ITS EXACT PLACE!
      if (line3NewRef.current) {
        tl.to(
          line3NewRef.current,
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.052, ease: 'back.out(1.6)' },
          0.292
        );
      }
      // Transparent Yellow Dino (Nailong) pops cleanly to 100% full scale alongside the punchline!
      if (mascotRef.current) {
        tl.to(
          mascotRef.current,
          { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.048, ease: 'back.out(2.0)' },
          0.295
        );
      }
      // Clean Editorial Hairline Link fades in AFTER [ ⌘ ] + [ Z ] exits completely (zero overlap!)
      if (ctaLinkRef.current) {
        tl.to(
          ctaLinkRef.current,
          { autoAlpha: 1, y: 0, duration: 0.038, ease: 'power2.out' },
          0.340
        );
      }

      // ── HEROIC 1.75× STICKMAN RUNNER SYNCED ACROSS PANEL 1 + PAN (0.02 -> 0.56) ──
      tl.to(
        runnerProxy,
        {
          p: 1,
          duration: 0.54,
          ease: 'none',
          onUpdate: () => {
            const totalP = 0.02 + runnerProxy.p * 0.54;
            const panicIn = Math.max(0, Math.min(1, (totalP - 0.135) / 0.025));
            const panicOut = 1 - Math.max(0, Math.min(1, (totalP - 0.24) / 0.02));
            const panic = panicIn * panicOut;
            runnerRef.current?.updateRun(runnerProxy.p, panic);
          },
        },
        0.02
      );

      // ══════════════════════════════════════════════════════════════════════
      // PHASE 2 (0.40 -> 0.59): HORIZONTAL CAMERA PAN (Scroll Down = Glide Right!)
      // ══════════════════════════════════════════════════════════════════════
      tl.to(
        trackRef.current,
        {
          xPercent: -50,
          duration: 0.19,
          ease: 'power2.inOut',
          force3D: true,
        },
        0.40
      );

      // ══════════════════════════════════════════════════════════════════════
      // PHASE 3 (0.55 -> 0.88): MAGICIAN'S RIBBON DEAL + ZERO-CLIP 3D FLIP!
      // ══════════════════════════════════════════════════════════════════════
      tl.to(
        cinemaProxy,
        {
          progress: 1,
          duration: 0.33,
          ease: 'none',
          onUpdate: () => {
            cinemaProgressRef.current = cinemaProxy.progress;
            cinemaUpdatersRef.current.forEach((fn) => fn(cinemaProxy.progress));
          },
        },
        0.55
      );

      if (ambientGlowRef.current) {
        tl.to(ambientGlowRef.current, { scale: 1, opacity: 0.58, duration: 0.16, ease: 'power2.out' }, 0.68);
      }
      if (topChromeRef.current) {
        tl.to(topChromeRef.current, { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.72);
      }
      if (bottomChromeRef.current) {
        tl.to(bottomChromeRef.current, { opacity: 1, y: 0, duration: 0.12, ease: 'power2.out' }, 0.74);
      }

      // ── PHASE 4 (0.88 -> 1.00): INTERACTIVE CHROMATIC STUDIO HOLD ──
      tl.to({}, { duration: 0.12 }, 0.88);
    }, cinemaStageRef);

    return () => {
      cinemaTriggerRef.current = null;
      ctx.revert();
    };
  }, [prefersReducedMotion]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDeckInteractiveRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) advance(dx < 0 ? 1 : -1);
  };

  const toggleSubSlide = (e: React.MouseEvent, id: string, max: number) => {
    e.stopPropagation();
    setSubSlideMap((prev) => ({
      ...prev,
      [id]: ((prev[id] ?? 0) + 1) % max,
    }));
  };

  const openModal = (e: React.MouseEvent, p: Project) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setCursorVisible(false);
    setModalOrigin({ x: r.left, y: r.top, w: r.width, h: r.height });
    setModalProject(p);
  };

  return (
    <section
      id="work"
      ref={sectionRef}
      className="selected-works relative z-20 w-full select-none overflow-hidden bg-[#F5F4F0]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Tactile Organic Film Grain */}
      <div className="film-grain-overlay opacity-[0.025] pointer-events-none" />

      {/* ═════════════════════════════════════════════════════════════════════
          UNIFIED PINNED HORIZONTAL CINEMA STAGE (100dvh viewport, 200vw track)
          ═════════════════════════════════════════════════════════════════════ */}
      <div
        ref={cinemaStageRef}
        className="relative w-full h-[100dvh] min-h-[640px] overflow-hidden"
      >
        <div
          ref={trackRef}
          className={`flex h-full will-change-transform ${
            prefersReducedMotion ? 'flex-col w-full h-auto' : 'flex-row w-[200vw]'
          }`}
        >
          {/* ═══════════════════════════════════════════════════════════════════
              PANEL 1 (LEFT 100vw): COPY OPSI 1 + TACTILE 3D KEYCAPS + NAILONG + RUNWAY
              ═══════════════════════════════════════════════════════════════════ */}
          <div className="relative w-[100vw] h-[100dvh] min-h-[640px] shrink-0 flex flex-col justify-between pt-20 sm:pt-24 pb-4 sm:pb-6 px-5 sm:px-12 md:px-16 overflow-hidden">
            {/* Clean Unclipped Architectural Watermark (100% legible W & dynamic project count) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-sans font-extrabold text-[8.5vw] sm:text-[9.5vw] text-slate-900/[0.028] tracking-[0.12em] uppercase whitespace-nowrap select-none"
            >
              WORKS · {String(PROJECTS.length).padStart(2, '0')}
            </div>

            {/* Clean Top Architectural Eyebrow */}
            <div className="relative z-20 w-full max-w-6xl mx-auto flex items-center justify-between pb-3 border-b border-stone-300/75 shrink-0">
              <div className="flex items-center gap-2.5 font-mono text-[10.5px] sm:text-[11.5px] tracking-[0.22em] uppercase">
                <span className="font-bold text-slate-900">04 — SELECTED WORKS</span>
                <span className="text-stone-300">/</span>
                <span className="text-stone-500 font-semibold">
                  {String(PROJECTS.length).padStart(2, '0')} HANDCRAFTED PROJECTS
                </span>
              </div>
              <div className="hidden md:flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] uppercase text-stone-500 mr-52 lg:mr-64">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>SCROLL STORY → PROJECT VAULT</span>
              </div>
            </div>

            {/* Center 3-Beat Comedic Editorial Stage */}
            <div className="relative z-20 w-full max-w-4xl mx-auto flex-1 flex flex-col items-center justify-center text-center py-2">
              <h2
                className="w-full text-[28px] xs:text-[34px] sm:text-[46px] md:text-[54px] italic font-normal tracking-[-0.015em] text-slate-900 leading-[1.28] sm:leading-[1.24]"
                style={{ fontFamily: '"Instrument Serif", "Playfair Display", Georgia, serif' }}
              >
                {/* Lines 1 & 2 (Copy Opsi 1) */}
                <div ref={poemTopLinesRef} className="will-change-[opacity]">
                  <div className="block">
                    {LINE_1_WORDS.map((w, i) => (
                      <span
                        key={`w1-${i}`}
                        ref={(el) => {
                          if (el) wordsRef.current[i] = el;
                        }}
                        className="inline-block opacity-20 transition-opacity mr-[0.25em] will-change-transform"
                      >
                        {w}
                      </span>
                    ))}
                  </div>

                  <div className="block mt-1">
                    {LINE_2_WORDS.map((w, i) => (
                      <span
                        key={`w2-${i}`}
                        ref={(el) => {
                          if (el) wordsRef.current[LINE_1_WORDS.length + i] = el;
                        }}
                        className="inline-block opacity-20 transition-opacity mr-[0.25em] will-change-transform"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Line 3 IN-PLACE SWAP SLOT: "hampir masuk tempat sampah." <-> "untung tetap saya lanjutkan." + Full-Scale Nailong! */}
                <div className="relative w-full mt-1.5 sm:mt-2 min-h-[1.65em] flex items-center justify-center overflow-visible">
                  {/* Layer 3A: Original Line + Bold Crimson Strikethrough */}
                  <div
                    ref={line3OldRef}
                    className="relative inline-block will-change-transform"
                  >
                    {LINE_3_OLD_WORDS.map((w, i) => (
                      <span
                        key={`w3-${i}`}
                        ref={(el) => {
                          if (el) wordsRef.current[LINE_1_WORDS.length + LINE_2_WORDS.length + i] = el;
                        }}
                        className="inline-block opacity-20 transition-opacity mr-[0.25em] will-change-transform"
                      >
                        {w}
                      </span>
                    ))}

                    <span
                      ref={strikethroughRef}
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-[2.5px] sm:h-[3.5px] w-full bg-rose-500 rounded-full origin-left scale-x-0 pointer-events-none shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                    />
                  </div>

                  {/* Layer 3B: Replacement Punchline — 100% Dead-Center Aligned Under Lines 1 & 2, Nailong Anchored Out-of-Flow! */}
                  <div
                    ref={line3NewRef}
                    className="absolute inset-0 flex items-center justify-center overflow-visible will-change-transform"
                  >
                    <span className="relative inline-block not-italic font-sans font-bold text-[19px] sm:text-[38px] md:text-[46px] tracking-[-0.025em] text-slate-950 leading-tight whitespace-nowrap">
                      untung tetap saya lanjutkan.
                      <span className="absolute left-0 -bottom-1 w-full h-[2.5px] rounded-full bg-gradient-to-r from-sky-400/80 via-amber-400/90 to-sky-400/80" />

                      {/* Out-of-Flow Nailong Anchor: never pushes the headline off-center! */}
                      <span className="inline-flex items-center absolute left-full top-1/2 -translate-y-1/2 ml-2.5 sm:ml-6 md:ml-8">
                        <CheekyMascotHead ref={mascotRef} />
                      </span>
                    </span>
                  </div>
                </div>
              </h2>

              {/* ── TACTILE 3D MECHANICAL KEYCAPS & CLEAN EDITORIAL LINK SLOT (Zero Generic AI Pills!) ── */}
              <div className="relative w-full max-w-md h-[70px] mt-6 sm:mt-8 flex items-center justify-center">
                {/* Beat 2: Tactile 3D [ ⌫ Del ] Mechanical Keycap + Minimal Hairline Meter */}
                <div
                  ref={delStageRef}
                  className="absolute flex items-center gap-4 will-change-transform"
                >
                  <span
                    ref={delKeycapRef}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300/90 font-mono text-xs sm:text-[13px] font-bold text-rose-600 tracking-wide will-change-transform"
                    style={{
                      boxShadow: '0 4px 0 #CBD5E1, 0 10px 22px rgba(15,23,42,0.08)',
                    }}
                  >
                    <span className="text-sm leading-none">⌫</span>
                    <span>Del</span>
                  </span>

                  <div className="flex flex-col items-start gap-1.5 min-w-[148px]">
                    <div className="w-full flex items-center justify-between font-mono text-[10px] tracking-[0.16em] uppercase text-slate-500">
                      <span>DRAFT · 412</span>
                      <span ref={delPctTextRef} className="font-bold text-rose-600 tabular-nums">
                        0%
                      </span>
                    </div>
                    <div className="w-full h-[2px] rounded-full bg-stone-300/80 overflow-hidden">
                      <div
                        ref={delProgressBarRef}
                        className="w-full h-full bg-rose-500 origin-left will-change-transform"
                      />
                    </div>
                  </div>
                </div>

                {/* Beat 3a: Dual Tactile 3D Mechanical Keycaps [ ⌘ ] + [ Z ] Physically Clicking Together! */}
                <div
                  ref={undoStageRef}
                  className="absolute flex items-center gap-2.5 will-change-transform"
                >
                  {/* Expanding Keystroke Ripple Ring */}
                  <span
                    ref={undoRippleRef}
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-12 rounded-2xl border-2 border-sky-400/70 pointer-events-none"
                  />

                  <span
                    ref={undoKeyCmdRef}
                    className="inline-flex items-center justify-center min-w-[44px] h-[40px] px-3 rounded-xl bg-white border border-slate-300/90 font-sans text-base font-bold text-slate-900 will-change-transform"
                    style={{
                      boxShadow: '0 4px 0 #CBD5E1, 0 10px 22px rgba(15,23,42,0.08)',
                    }}
                  >
                    ⌘
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-400">+</span>
                  <span
                    ref={undoKeyZRef}
                    className="inline-flex items-center justify-center min-w-[44px] h-[40px] px-3 rounded-xl bg-white border border-sky-300 font-mono text-sm font-extrabold text-sky-700 will-change-transform"
                    style={{
                      boxShadow: '0 4px 0 #CBD5E1, 0 10px 22px rgba(15,23,42,0.08)',
                    }}
                  >
                    Z
                  </span>
                  <span className="ml-2 font-mono text-[10.5px] font-semibold tracking-[0.2em] uppercase text-slate-500">
                    UNDO
                  </span>
                </div>

                {/* Beat 3b: Clean Minimalist Editorial Hairline Link (No Black Pill, No Neon Dot!) */}
                <div ref={ctaLinkRef} className="absolute will-change-transform">
                  <button
                    type="button"
                    onClick={glideToProjectVault}
                    className="group inline-flex items-center gap-3.5 py-2 px-1 cursor-pointer focus:outline-none"
                  >
                    <span className="font-mono text-[10.5px] tracking-[0.2em] text-stone-400 font-semibold">
                      01 — {String(PROJECTS.length).padStart(2, '0')}
                    </span>
                    <span className="relative font-sans text-sm sm:text-[15px] font-semibold text-slate-900 tracking-tight">
                      Lihat karyanya
                      <span className="absolute left-0 -bottom-0.5 w-full h-[1.5px] bg-slate-900/25" />
                      <span className="absolute left-0 -bottom-0.5 w-full h-[1.5px] bg-slate-950 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                    </span>
                    <span className="w-8 h-8 rounded-full border border-slate-900/25 group-hover:border-slate-950 group-hover:bg-slate-950 group-hover:text-white text-slate-900 flex items-center justify-center transition-all duration-300">
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Heroic 8-Milestone Stickman Runway */}
            <div className="relative z-20 w-full max-w-6xl mx-auto pt-1 shrink-0">
              <WorkStickmanRunner ref={runnerRef} />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              PANEL 2 (RIGHT 100vw): THE PROJECT VAULT — ZERO-CLIP 3D POKER DECK
              ═══════════════════════════════════════════════════════════════════ */}
          <div
            ref={panel2Ref}
            onMouseMove={handlePanel2MouseMove}
            onMouseLeave={handlePanel2MouseLeave}
            className="relative z-20 w-[100vw] h-[100dvh] min-h-[640px] shrink-0 flex flex-col justify-between overflow-hidden"
          >
            {/* Clean Unclipped Editorial Watermark (dynamic project count) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-sans font-extrabold text-[8.5vw] sm:text-[9.5vw] text-slate-900/[0.026] tracking-[0.12em] uppercase whitespace-nowrap select-none -z-20"
            >
              PROJECTS · {String(PROJECTS.length).padStart(2, '0')}
            </div>

            {/* GSAP Adaptive Color-Sync Ambient Glow */}
            <div
              ref={ambientGlowRef}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[820px] sm:w-[1120px] h-[580px] sm:h-[740px] rounded-full blur-[100px] sm:blur-[140px] pointer-events-none -z-10 will-change-transform will-change-[background-color]"
              style={{
                backgroundColor: PROJECT_GLOW_COLORS[PROJECTS[0].id] || 'rgba(56, 189, 248, 0.48)',
                opacity: 0.55,
              }}
            />

            {/* Top Studio Header */}
            <div
              ref={topChromeRef}
              className="relative z-30 w-full flex items-center justify-between px-4 sm:px-14 pt-16 sm:pt-8 shrink-0 will-change-transform"
            >
              <div className="flex items-center gap-2.5 font-mono text-[10.5px] sm:text-[11.5px] tracking-[0.22em] uppercase">
                <span className="font-bold text-slate-900">04 — SELECTED WORKS</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-500 font-semibold">{PROJECTS.length} PROJECTS</span>
              </div>

              <div className="hidden md:flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] uppercase text-slate-500 mr-52 lg:mr-64">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                <span>CLICK ANY CARD OR USE ← →</span>
              </div>
            </div>

            {/* Center Stage: Flat 2D Stacking Container (Each card owns its own isolated 3D perspective -> ZERO clipping!) */}
            <div
              ref={deckBreathingRef}
              className="relative flex-1 flex items-center justify-center -translate-y-2 sm:-translate-y-3 my-0 py-1 sm:py-2 scale-[0.58] xs:scale-[0.68] sm:scale-[0.82] md:scale-100 origin-center will-change-transform"
            >
              {PROJECTS.map((proj, i) => {
                const slotIdx = getSlotIndex(i);
                return (
                  <WorkProjectCard
                    key={proj.id}
                    project={proj}
                    cardIndex={i}
                    slotIndex={slotIdx}
                    isActive={slotIdx === 0}
                    onClick={() => setActiveIndex(i)}
                    onImageClick={openModal}
                    subSlide={subSlideMap[proj.id] ?? 0}
                    onSubSlideToggle={toggleSubSlide}
                    slots={SLOTS}
                    cinemaProgressRef={cinemaProgressRef}
                    registerCinemaUpdater={registerCinemaUpdater}
                    onCursorBadge={handleCardCursorBadge}
                  />
                );
              })}
            </div>

            {/* Bottom Studio Bar: Categories & Prev / Next */}
            <div
              ref={bottomChromeRef}
              className="relative z-30 w-full flex items-center justify-between px-4 sm:px-14 pb-4 sm:pb-8 shrink-0 gap-2 sm:gap-4 will-change-transform"
            >
              <div className="flex items-center gap-1 sm:gap-2 font-mono text-[9.5px] sm:text-[10.5px] tracking-wider overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink min-w-0 pr-2">
                {FOOTER_CATEGORIES.map((cat, idx) => {
                  const isCatActive = cat.match(PROJECTS[activeIndex].category.toUpperCase());
                  return (
                    <React.Fragment key={cat.label}>
                      <button
                        type="button"
                        onClick={() => {
                          const targetIdx = PROJECTS.findIndex((p) =>
                            cat.match(p.category.toUpperCase())
                          );
                          if (targetIdx !== -1) setActiveIndex(targetIdx);
                        }}
                        className={`group flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 rounded-full transition-all duration-300 cursor-pointer whitespace-nowrap shrink-0 ${
                          isCatActive
                            ? 'text-slate-950 font-bold bg-white/95 border border-slate-300 shadow-sm'
                            : 'text-slate-500 hover:text-slate-900 font-semibold'
                        }`}
                        title={`Tampilkan kategori ${cat.label}`}
                      >
                        {isCatActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_6px_#38bdf8] shrink-0" />
                        )}
                        <WordFlip text={cat.label} />
                      </button>
                      {idx < FOOTER_CATEGORIES.length - 1 && (
                        <span className="text-slate-300 select-none text-[9px] shrink-0">/</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => advance(-1)}
                  aria-label="Proyek sebelumnya"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white/85 hover:bg-white border border-slate-300/80 text-slate-700 hover:text-slate-950 shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>

                <span className="font-mono text-[10.5px] sm:text-[11px] text-slate-700 hidden xs:inline font-bold tracking-wider min-w-[44px] text-center">
                  {PROJECTS[activeIndex].num} / {String(PROJECTS.length).padStart(2, '0')}
                </span>

                <button
                  type="button"
                  onClick={() => advance(1)}
                  className="group flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-slate-900 hover:bg-black text-white font-mono text-[10.5px] sm:text-[11.5px] font-bold tracking-[0.12em] uppercase shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <RollingText text="Next" staggerMs={24} />
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* High-Contrast Obsidian Floating Cursor Badge */}
      <div
        ref={cursorBadgeRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-50 will-change-transform opacity-0 select-none"
        style={{ transform: 'translate3d(-999px, -999px, 0)' }}
      >
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-md bg-[#111318]/95 border border-white/20 shadow-[0_14px_34px_rgba(0,0,0,0.30)]">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.85)] inline-block shrink-0" />
          <span className="font-mono text-[10.5px] font-bold tracking-[0.2em] uppercase text-white whitespace-nowrap">
            {cursorLabel}
          </span>
        </div>
      </div>

      {/* Chromatic Editorial Project Studio Modal */}
      <DetailInspectorModal
        project={modalProject}
        projects={PROJECTS}
        onSelectProject={(proj, idx) => {
          setModalProject(proj);
          setActiveIndex(idx);
        }}
        onClose={() => setModalProject(null)}
        origin={modalOrigin}
      />
    </section>
  );
};

export default WorkSection;
