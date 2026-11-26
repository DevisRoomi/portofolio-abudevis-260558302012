import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from 'lucide-react';
import { Project } from '../types/work';
import { MagneticButton, RollingText } from './MicroInteractions';

interface ModalProps {
  project: Project | null;
  projects: Project[];
  onSelectProject: (project: Project, index: number) => void;
  onClose: () => void;
  origin: { x: number; y: number; w: number; h: number } | null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   CHROMATIC EDITORIAL PROJECT STUDIO (Awwwards / Printed Art-Book Edition)
   Upgrades over legacy dark modal:
   1. Portal (document.body, z-9990) + `modal-open` class -> Navbar glides
      cleanly away with ZERO collision & outer page scrollbar disappears.
   2. 100% Lenis Scroll Lock (`__lenis.stop()` / `.start()`) + `data-lenis-prevent`
      + `overscroll-y-contain` -> wheel/touch scrolls ONLY inside the dossier.
   3. True Two-Way GSAP Spatial Card-to-Studio Morph launching right from the
      clicked card's `origin` rect (with 3D perspective lift) & folding back!
   4. Chromatic Personality Canvas adapting dynamically per project (`stageBg`,
      `bg`, `fg`, `bevelColor`) — zero generic dark AI box.
   5. Interactive 3D Cursor-Tilt Exhibition Stage + Visual Thumbnail Filmstrip
      + Click-to-Zoom Fullscreen HD Lightbox + Live Scroll Progress Hairline.
   6. Seamless In-Modal Project Deck Switcher (`← Prev` | `01 / 08` | `Next →`)
      that live-morphs palette & syncs the 3D Poker Deck behind the studio!
   ═══════════════════════════════════════════════════════════════════════════ */

export const DetailInspectorModal: React.FC<ModalProps> = ({
  project,
  projects,
  onSelectProject,
  onClose,
  origin,
}) => {
  const [imgIdx, setImgIdx] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

  const backdropRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const stageFrameRef = useRef<HTMLDivElement>(null);
  const stageGlareRef = useRef<HTMLDivElement>(null);
  const activeImgRef = useRef<HTMLImageElement>(null);
  const dossierScrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);

  const isClosingRef = useRef<boolean>(false);
  const hasEnteredRef = useRef<boolean>(false);
  const switchDirRef = useRef<number>(1);
  const historyPushedRef = useRef<boolean>(false);

  // QuickTo refs for silky 3D cursor tilt on desktop showcase frame
  const tiltXTo = useRef<gsap.QuickToFunc | null>(null);
  const tiltYTo = useRef<gsap.QuickToFunc | null>(null);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const currentIdx = project ? Math.max(0, projects.findIndex((p) => p.id === project.id)) : 0;

  // Compute spatial launch offset from clicked card rect to viewport center
  const getSpatialOrigin = useCallback(() => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
    const sheetW = Math.min(vw - 32, 1152);
    const sheetH = Math.min(vh * 0.9, 820);

    if (!origin) {
      return { ox: 0, oy: 36, sx: 0.86, sy: 0.86 };
    }
    const ox = origin.x + origin.w / 2 - vw / 2;
    const oy = origin.y + origin.h / 2 - vh / 2;
    const sx = Math.max(0.24, Math.min(0.85, origin.w / sheetW));
    const sy = Math.max(0.24, Math.min(0.85, origin.h / sheetH));
    return { ox, oy, sx, sy };
  }, [origin]);

  // Smooth GSAP Close Choreography (Folds back toward origin card!)
  const handleClose = useCallback(
    (fromPopState = false) => {
      if (isClosingRef.current) return;
      isClosingRef.current = true;
      setLightboxOpen(false);

      const finish = () => {
        hasEnteredRef.current = false;
        isClosingRef.current = false;
        if (!fromPopState && historyPushedRef.current) {
          historyPushedRef.current = false;
          window.history.back();
        }
        onClose();
      };

      if (prefersReducedMotion || !sheetRef.current || !backdropRef.current) {
        finish();
        return;
      }

      const { ox, oy, sx, sy } = getSpatialOrigin();
      const tl = gsap.timeline({ onComplete: finish });

      const staggerEls = sheetRef.current.querySelectorAll('.studio-stagger');
      if (staggerEls.length > 0) {
        tl.to(
          staggerEls,
          { opacity: 0, y: 10, duration: 0.16, ease: 'power2.in' },
          0
        );
      }

      tl.to(
        sheetRef.current,
        {
          x: ox,
          y: oy,
          scaleX: sx,
          scaleY: sy,
          rotateX: -6,
          opacity: 0,
          transformPerspective: 1400,
          duration: 0.36,
          ease: 'power3.inOut',
        },
        0.04
      );

      tl.to(
        backdropRef.current,
        { opacity: 0, duration: 0.32, ease: 'power2.in' },
        0.06
      );
    },
    [getSpatialOrigin, onClose, prefersReducedMotion]
  );

  // Switch active project directly inside the studio (keeps deck synced!)
  const switchProject = useCallback(
    (dir: -1 | 1) => {
      if (!project || projects.length <= 1 || isClosingRef.current) return;
      switchDirRef.current = dir;
      const nextIdx = (currentIdx + dir + projects.length) % projects.length;
      setImgIdx(0);
      setLightboxOpen(false);
      if (dossierScrollRef.current) dossierScrollRef.current.scrollTop = 0;
      if (mobileScrollRef.current) mobileScrollRef.current.scrollTop = 0;
      if (progressBarRef.current) progressBarRef.current.style.transform = 'scaleX(0)';
      onSelectProject(projects[nextIdx], nextIdx);
    },
    [currentIdx, onSelectProject, project, projects]
  );

  // ── 1. LIFECYCLE: LENIS SCROLL LOCK + NAVBAR HIDE + CARD-TO-STUDIO ENTRANCE ──
  const isOpen = Boolean(project);

  useEffect(() => {
    if (!isOpen) {
      hasEnteredRef.current = false;
      return;
    }

    isClosingRef.current = false;
    setImgIdx(0);
    setLightboxOpen(false);

    // Lock page scroll & smoothly hide floating header navbar
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');

    const win = window as unknown as { __lenis?: { stop: () => void; start: () => void } };
    win.__lenis?.stop();

    // Support browser back gesture cleanly
    window.history.pushState({ workStudioModal: true }, '');
    historyPushedRef.current = true;

    const handlePopState = () => {
      historyPushedRef.current = false;
      handleClose(true);
    };
    window.addEventListener('popstate', handlePopState);

    // Reset internal scroll & reading bar
    if (dossierScrollRef.current) dossierScrollRef.current.scrollTop = 0;
    if (mobileScrollRef.current) mobileScrollRef.current.scrollTop = 0;
    if (progressBarRef.current) progressBarRef.current.style.transform = 'scaleX(0)';

    // GSAP Spatial Card-to-Studio Morph Entrance
    const ctx = gsap.context(() => {
      if (prefersReducedMotion || !sheetRef.current || !backdropRef.current) {
        hasEnteredRef.current = true;
        return;
      }

      const { ox, oy, sx, sy } = getSpatialOrigin();
      const tl = gsap.timeline({
        onComplete: () => {
          hasEnteredRef.current = true;
        },
      });

      tl.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.42, ease: 'power2.out' },
        0
      );

      tl.fromTo(
        sheetRef.current,
        {
          x: ox,
          y: oy,
          scaleX: sx,
          scaleY: sy,
          rotateX: 8,
          opacity: 0.35,
          transformPerspective: 1400,
        },
        {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          rotateX: 0,
          opacity: 1,
          duration: 0.66,
          ease: 'power4.out',
          clearProps: 'transform',
        },
        0.02
      );

      const staggerEls = sheetRef.current.querySelectorAll('.studio-stagger');
      if (staggerEls.length > 0) {
        tl.fromTo(
          staggerEls,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.48,
            stagger: 0.04,
            ease: 'power3.out',
            clearProps: 'transform',
          },
          0.16
        );
      }
    });

    return () => {
      ctx.revert();
      window.removeEventListener('popstate', handlePopState);
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      win.__lenis?.start();
    };
  }, [isOpen, getSpatialOrigin, handleClose, prefersReducedMotion]);

  // ── 2. DIRECTIONAL CROSSFADE WHEN CYCLING PROJECTS INSIDE THE STUDIO ──
  useEffect(() => {
    if (!project || !hasEnteredRef.current || prefersReducedMotion || !sheetRef.current) return;

    const els = sheetRef.current.querySelectorAll('.studio-switch-content');
    if (els.length === 0) return;

    gsap.fromTo(
      els,
      { opacity: 0, x: switchDirRef.current * 28 },
      {
        opacity: 1,
        x: 0,
        duration: 0.42,
        stagger: 0.03,
        ease: 'power3.out',
        clearProps: 'transform',
      }
    );
  }, [project?.id, prefersReducedMotion]);

  // ── 3. SMOOTH SLIDE ZOOM-FADE WHEN CHANGING SCREENSHOTS ──
  useEffect(() => {
    if (!activeImgRef.current || prefersReducedMotion) return;
    gsap.fromTo(
      activeImgRef.current,
      { opacity: 0.2, scale: 1.035 },
      { opacity: 1, scale: 1, duration: 0.36, ease: 'power2.out', clearProps: 'transform' }
    );
  }, [imgIdx, project?.id, prefersReducedMotion]);

  // ── 4. SETUP 3D CURSOR TILT QUICKTO ON SHOWCASE FRAME ──
  useEffect(() => {
    if (!isOpen || prefersReducedMotion || !stageFrameRef.current) return;
    tiltXTo.current = gsap.quickTo(stageFrameRef.current, 'rotateX', {
      duration: 0.4,
      ease: 'power2.out',
    });
    tiltYTo.current = gsap.quickTo(stageFrameRef.current, 'rotateY', {
      duration: 0.4,
      ease: 'power2.out',
    });
  }, [isOpen, prefersReducedMotion]);

  // ── 5. FULLSCREEN HD LIGHTBOX BLOOM ──
  useEffect(() => {
    if (!lightboxOpen || prefersReducedMotion || !lightboxRef.current) return;
    gsap.fromTo(
      lightboxRef.current,
      { opacity: 0, scale: 0.94 },
      { opacity: 1, scale: 1, duration: 0.32, ease: 'power3.out' }
    );
  }, [lightboxOpen, prefersReducedMotion]);

  // ── 6. KEYBOARD SHORTCUTS (ESC closes Lightbox first, then Studio; Arrows switch slides) ──
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxOpen) {
          setLightboxOpen(false);
        } else {
          handleClose(false);
        }
      } else if (e.key === 'ArrowRight') {
        if (project.images.length > 1) {
          setImgIdx((prev) => (prev + 1) % project.images.length);
        } else if (!lightboxOpen) {
          switchProject(1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (project.images.length > 1) {
          setImgIdx((prev) => (prev - 1 + project.images.length) % project.images.length);
        } else if (!lightboxOpen) {
          switchProject(-1);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose, lightboxOpen, project, switchProject]);

  // Interactive 3D Tilt handlers on Left Exhibition Stage
  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !stageFrameRef.current) return;
    const rect = stageFrameRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const normX = (px - 0.5) * 2;
    const normY = (py - 0.5) * 2;

    tiltYTo.current?.(normX * 4.5);
    tiltXTo.current?.(-normY * 4);

    if (stageGlareRef.current) {
      stageGlareRef.current.style.opacity = '1';
      stageGlareRef.current.style.background = `radial-gradient(280px circle at ${(px * 100).toFixed(1)}% ${(py * 100).toFixed(1)}%, rgba(255,255,255,0.42), transparent 72%)`;
    }
  };

  const handleStageMouseLeave = () => {
    tiltXTo.current?.(0);
    tiltYTo.current?.(0);
    if (stageGlareRef.current) {
      stageGlareRef.current.style.opacity = '0';
    }
  };

  // Live Reading Progress Hairline (zero React re-renders!)
  const handleDossierScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, el.scrollTop / maxScroll)) : 0;
    if (progressBarRef.current) {
      progressBarRef.current.style.transform = `scaleX(${ratio.toFixed(4)})`;
    }
  };

  if (!project || typeof document === 'undefined') return null;

  const activeImg = project.images[imgIdx] ?? project.images[0];
  const prevProject = projects[(currentIdx - 1 + projects.length) % projects.length];
  const nextProject = projects[(currentIdx + 1) % projects.length];
  const accentInk = project.dark ? project.bevelColor : project.fg;

  return createPortal(
    <div
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-label={`Detail proyek ${project.title}`}
      className="fixed inset-0 z-[9990] flex items-center justify-center p-2.5 xs:p-4 sm:p-6 md:p-8 select-text"
      onWheel={(e) => e.stopPropagation()}
    >
      {/* ── 1. FROSTED CHROMATIC BACKDROP ── */}
      <div
        ref={backdropRef}
        onClick={() => handleClose(false)}
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-md cursor-pointer"
      />

      {/* ── 2. CHROMATIC EDITORIAL PROJECT STUDIO SHEET ── */}
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-6xl h-[92dvh] sm:h-[88dvh] max-h-[820px] rounded-[24px] sm:rounded-[30px] overflow-hidden flex flex-col bg-[#FAF9F6] text-slate-900 border border-white/80 shadow-[0_40px_110px_-20px_rgba(15,23,42,0.55)] will-change-transform"
      >
        {/* Top Chromatic Signature Accent Bar */}
        <div
          className="h-1.5 w-full shrink-0 transition-colors duration-500"
          style={{
            background: `linear-gradient(90deg, ${project.bg} 0%, ${project.bevelColor} 100%)`,
          }}
        />

        {/* ── MOBILE STICKY TOPBAR (< lg) ── */}
        <div className="flex lg:hidden items-center justify-between px-4 py-3 border-b border-slate-900/10 bg-[#FAF9F6]/95 backdrop-blur-md shrink-0 z-20">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 transition-colors duration-500"
              style={{ backgroundColor: project.bg, color: project.fg }}
            >
              {project.num} · {project.category}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleClose(false)}
            className="w-8 h-8 rounded-full bg-slate-900/5 hover:bg-slate-900 hover:text-white text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Tutup detail proyek"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── ASYMMETRIC SPLIT-STAGE BODY (Desktop: Fixed Left + Independent Scroll Right; Mobile: Unified Scroll) ── */}
        <div
          ref={mobileScrollRef}
          data-lenis-prevent
          onScroll={handleDossierScroll}
          className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden editorial-scrollbar"
        >
          {/* ═════════════════════════════════════════════════════════════════
              LEFT COLUMN (~58%): INTERACTIVE VISUAL EXHIBITION STAGE
              ═════════════════════════════════════════════════════════════════ */}
          <div
            className="relative w-full lg:w-[58%] lg:h-full shrink-0 flex flex-col justify-between p-4 xs:p-5 sm:p-7 md:p-8 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-900/10 transition-colors duration-500"
            style={{ backgroundColor: project.stageBg }}
          >
            {/* Soft Chromatic Ambient Glow Orb */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[320px] rounded-full blur-[95px] opacity-30 transition-colors duration-500"
              style={{ backgroundColor: project.bg }}
            />

            {/* Giant Architectural Ghost Numeral Watermark */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-8 -right-4 font-display font-black text-[150px] sm:text-[210px] leading-none tracking-tighter text-slate-950/[0.045] select-none"
            >
              {project.num}
            </div>

            {/* Stage Top Micro-Strip */}
            <div className="studio-stagger relative z-10 flex items-center justify-between gap-2 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[10.5px] font-semibold tracking-[0.18em] uppercase text-slate-600">
                <span
                  className="w-2 h-2 rounded-full shrink-0 transition-colors duration-500"
                  style={{ backgroundColor: project.bevelColor }}
                />
                <span>VISUAL EXHIBITION</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-bold truncate max-w-[180px] sm:max-w-[260px]">
                  {activeImg.label}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/85 hover:bg-white border border-slate-900/10 font-mono text-[9.5px] font-bold tracking-[0.14em] uppercase text-slate-800 shadow-sm transition-all cursor-pointer active:scale-95"
                title="Perbesar layar penuh"
              >
                <Maximize2 className="w-3 h-3" />
                <span className="hidden xs:inline">Zoom HD</span>
              </button>
            </div>

            {/* Center 3D Cursor-Tilt Interactive Browser Showcase Frame */}
            <div
              className="studio-stagger studio-switch-content relative z-10 flex-1 flex items-center justify-center my-1 sm:my-2"
              style={{ perspective: '1200px' }}
              onMouseMove={handleStageMouseMove}
              onMouseLeave={handleStageMouseLeave}
            >
              <div
                ref={stageFrameRef}
                onClick={() => setLightboxOpen(true)}
                className="group/frame relative w-full rounded-2xl overflow-hidden bg-white border border-slate-900/10 shadow-[0_24px_60px_-14px_rgba(15,23,42,0.22)] cursor-zoom-in will-change-transform"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Specular Light Sweep Overlay */}
                <div
                  ref={stageGlareRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300"
                />

                {/* Minimalist Editorial Window Chrome */}
                <div className="h-8 px-3.5 bg-white/95 border-b border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400/90" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90" />
                  </div>

                  <div className="px-3 py-0.5 rounded-md bg-slate-100 border border-slate-200/70 font-mono text-[9.5px] text-slate-500 tracking-wide truncate max-w-[180px] sm:max-w-[260px]">
                    devis.vault/{project.id}
                  </div>

                  <span className="font-mono text-[9.5px] font-bold text-slate-400 tabular-nums">
                    {String(imgIdx + 1).padStart(2, '0')} / {String(project.images.length).padStart(2, '0')}
                  </span>
                </div>

                {/* Main Screenshot Canvas */}
                <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                  <img
                    ref={activeImgRef}
                    src={activeImg.url}
                    alt={`${project.title} — ${activeImg.label}`}
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover/frame:scale-[1.02]"
                  />

                  {/* Subtle Hover Zoom Indicator */}
                  <div className="pointer-events-none absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-slate-950/85 text-white font-mono text-[9.5px] font-bold tracking-[0.14em] uppercase flex items-center gap-1.5 opacity-0 translate-y-1 group-hover/frame:opacity-100 group-hover/frame:translate-y-0 transition-all duration-300 shadow-lg">
                    <Maximize2 className="w-3 h-3 text-sky-300" />
                    <span>Inspect Full HD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Visual Thumbnail Filmstrip & Slide Arrows */}
            <div className="studio-stagger studio-switch-content relative z-10 mt-3 sm:mt-4 flex items-center justify-between gap-3">
              {project.images.length > 1 ? (
                <>
                  <div className="flex items-center gap-2.5 overflow-x-auto py-1 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {project.images.map((im, i) => {
                      const isThumbActive = i === imgIdx;
                      return (
                        <button
                          key={im.url}
                          type="button"
                          onClick={() => setImgIdx(i)}
                          className={`group/thumb relative shrink-0 w-20 xs:w-24 sm:w-28 aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                            isThumbActive
                              ? 'scale-[1.03] shadow-md opacity-100'
                              : 'border-white/80 opacity-65 hover:opacity-100 hover:scale-[1.02]'
                          }`}
                          style={{
                            borderColor: isThumbActive ? project.bevelColor : undefined,
                          }}
                          title={im.label}
                        >
                          <img
                            src={im.url}
                            alt={im.label}
                            className="w-full h-full object-cover object-top"
                          />
                          <div className="absolute inset-x-0 bottom-0 px-1.5 py-0.5 bg-gradient-to-t from-slate-950/85 via-slate-950/50 to-transparent text-left">
                            <span className="block font-mono text-[8px] font-semibold text-white truncate">
                              {im.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Mini Prev / Next Slide Controls */}
                  <div className="hidden xs:flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setImgIdx((prev) => (prev - 1 + project.images.length) % project.images.length)
                      }
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-white border border-slate-900/10 text-slate-700 hover:text-slate-950 flex items-center justify-center shadow-sm transition-all cursor-pointer active:scale-95"
                      aria-label="Slide sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setImgIdx((prev) => (prev + 1) % project.images.length)}
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-white border border-slate-900/10 text-slate-700 hover:text-slate-950 flex items-center justify-center shadow-sm transition-all cursor-pointer active:scale-95"
                      aria-label="Slide berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between w-full font-mono text-[10px] tracking-[0.16em] uppercase text-slate-500">
                  <span>SINGLE FRAME EXHIBITION</span>
                  <span>CLICK PREVIEW TO ZOOM HD</span>
                </div>
              )}
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════
              RIGHT COLUMN (~42%): INDEPENDENT SCROLLABLE EDITORIAL DOSSIER
              ═════════════════════════════════════════════════════════════════ */}
          <div className="relative w-full lg:w-[42%] lg:h-full flex flex-col bg-[#FAF9F6]">
            {/* Desktop Sticky Dossier Header */}
            <div className="hidden lg:flex items-center justify-between px-7 py-4 border-b border-slate-900/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <span
                  className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-[0.14em] transition-colors duration-500"
                  style={{ backgroundColor: project.bg, color: project.fg }}
                >
                  {project.category}
                </span>
                <span className="font-mono text-[10.5px] font-bold tracking-[0.18em] text-slate-400 tabular-nums">
                  {project.num} / {String(projects.length).padStart(2, '0')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleClose(false)}
                className="group/close inline-flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-full bg-slate-900/5 hover:bg-slate-950 hover:text-white text-slate-700 transition-all duration-200 cursor-pointer"
                title="Tutup Studio (Esc)"
              >
                <span className="font-mono text-[9.5px] font-bold tracking-[0.16em] uppercase opacity-70 group-hover/close:opacity-100">
                  ESC
                </span>
                <span className="w-6 h-6 rounded-full bg-white group-hover/close:bg-white/15 flex items-center justify-center shadow-sm">
                  <X className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>

            {/* Live Reading Progress Hairline (Tracks Right Column / Mobile Scroll!) */}
            <div className="relative w-full h-[2px] bg-slate-900/5 shrink-0 overflow-hidden">
              <div
                ref={progressBarRef}
                className="h-full w-full origin-left will-change-transform transition-colors duration-500"
                style={{
                  transform: 'scaleX(0)',
                  backgroundColor: project.bevelColor,
                }}
              />
            </div>

            {/* Independently Scrollable Editorial Story Body */}
            <div
              ref={dossierScrollRef}
              data-lenis-prevent
              onScroll={handleDossierScroll}
              className="flex-1 min-h-0 lg:overflow-y-auto editorial-scrollbar px-5 xs:px-6 sm:px-7 py-6 sm:py-7 space-y-7"
            >
              {/* Title & Italic Serif Subtitle */}
              <div className="studio-stagger studio-switch-content">
                <h2 className="font-display font-black text-2xl xs:text-3xl sm:text-[32px] text-slate-950 uppercase tracking-tight leading-[1.08]">
                  {project.title}
                </h2>
                <p
                  className="text-lg sm:text-xl italic text-slate-600 mt-1.5 leading-snug"
                  style={{ fontFamily: '"Instrument Serif", "Playfair Display", Georgia, serif' }}
                >
                  {project.subtitle}
                </p>
                <div
                  className="mt-4 w-12 h-[3px] rounded-full transition-colors duration-500"
                  style={{ backgroundColor: project.bevelColor }}
                />
              </div>

              {/* 01 · Overview Story */}
              <div className="studio-stagger studio-switch-content space-y-2">
                <span className="font-mono text-[10px] font-bold tracking-[0.22em] text-slate-400 uppercase block">
                  01 · OVERVIEW
                </span>
                <p className="font-sans text-[14px] sm:text-[14.5px] text-slate-700 leading-[1.75]">
                  {project.longDesc}
                </p>
              </div>

              {/* 02 · Key Architectural Highlights */}
              {project.highlights && project.highlights.length > 0 && (
                <div className="studio-stagger studio-switch-content space-y-3">
                  <span className="font-mono text-[10px] font-bold tracking-[0.22em] text-slate-400 uppercase block">
                    02 · KEY HIGHLIGHTS
                  </span>
                  <ul className="divide-y divide-slate-900/10 border-y border-slate-900/10">
                    {project.highlights.map((point, idx) => (
                      <li key={point} className="py-3 flex items-start gap-3">
                        <span
                          className="font-mono text-[10.5px] font-bold tabular-nums mt-0.5 shrink-0"
                          style={{ color: accentInk }}
                        >
                          0{idx + 1}
                        </span>
                        <span className="font-sans text-[13.5px] text-slate-800 leading-relaxed font-medium">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 03 · Tech Stack & Craft Spec Chips */}
              <div className="studio-stagger studio-switch-content space-y-3 pb-2">
                <span className="font-mono text-[10px] font-bold tracking-[0.22em] text-slate-400 uppercase block">
                  03 · TECH STACK &amp; CRAFT
                </span>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-900/10 font-mono text-[11px] font-bold text-slate-800 shadow-sm"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-500"
                        style={{ backgroundColor: project.bevelColor }}
                      />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── STICKY BOTTOM ACTION & LIVE PROJECT DECK SWITCHER DOCK ── */}
            <div className="studio-stagger shrink-0 px-5 xs:px-6 sm:px-7 py-4 border-t border-slate-900/10 bg-white/80 backdrop-blur-md space-y-3">
              {/* Primary Magnetic GitHub CTA */}
              <MagneticButton
                href={project.githubUrl}
                strength={0.2}
                className="w-full py-3 px-5 rounded-2xl bg-slate-950 hover:bg-black text-white font-mono text-[11px] sm:text-[11.5px] font-bold tracking-[0.16em] uppercase shadow-[0_10px_28px_-8px_rgba(15,23,42,0.45)] transition-colors"
              >
                <RollingText text="Lihat Repository GitHub" staggerMs={16} />
                <ArrowUpRight className="w-4 h-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </MagneticButton>

              {/* Seamless In-Modal Project Deck Switcher */}
              {projects.length > 1 && (
                <div className="flex items-center justify-between gap-2 pt-1 font-mono text-[10px] tracking-[0.14em] uppercase">
                  <button
                    type="button"
                    onClick={() => switchProject(-1)}
                    className="group/prev inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-950 font-semibold transition-colors cursor-pointer max-w-[42%]"
                    title={`Proyek sebelumnya: ${prevProject?.title}`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover/prev:-translate-x-0.5" />
                    <span className="truncate">{prevProject?.title}</span>
                  </button>

                  <span className="text-slate-400 font-bold tabular-nums shrink-0">
                    {project.num} / {String(projects.length).padStart(2, '0')}
                  </span>

                  <button
                    type="button"
                    onClick={() => switchProject(1)}
                    className="group/next inline-flex items-center justify-end gap-1.5 text-slate-600 hover:text-slate-950 font-semibold transition-colors cursor-pointer max-w-[42%]"
                    title={`Proyek berikutnya: ${nextProject?.title}`}
                  >
                    <span className="truncate">{nextProject?.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover/next:translate-x-0.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. FULLSCREEN HD ZOOM LIGHTBOX OVERLAY ── */}
      {lightboxOpen && (
        <div
          ref={lightboxRef}
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[9995] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-10 cursor-zoom-out"
        >
          <div className="w-full max-w-6xl flex items-center justify-between mb-4 text-white">
            <div className="flex items-center gap-2.5 font-mono text-xs tracking-[0.16em] uppercase">
              <span className="font-bold">{project.title}</span>
              <span className="text-white/35">/</span>
              <span className="text-sky-300">{activeImg.label}</span>
            </div>

            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Tutup zoom HD"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-6xl max-h-[82dvh] flex items-center justify-center cursor-default"
          >
            <img
              src={activeImg.url}
              alt={`${project.title} HD — ${activeImg.label}`}
              className="max-w-full max-h-[80dvh] rounded-2xl object-contain border border-white/15 shadow-2xl"
            />

            {project.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setImgIdx((prev) => (prev - 1 + project.images.length) % project.images.length)
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center shadow-lg cursor-pointer"
                  aria-label="Gambar sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setImgIdx((prev) => (prev + 1) % project.images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-white/20 text-white flex items-center justify-center shadow-lg cursor-pointer"
                  aria-label="Gambar berikutnya"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default DetailInspectorModal;
