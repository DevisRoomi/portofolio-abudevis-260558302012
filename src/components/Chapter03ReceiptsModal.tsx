import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { CERTIFICATES_DATA, CertificateItem } from '../data/certificates';

interface Chapter03ReceiptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  origin?: { x: number; y: number };
  skipPreloader?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COLOR INTERPOLATION HELPERS (REAL-TIME RGB LERP)
   ═══════════════════════════════════════════════════════════════════════════ */
function hexToRgb(hex: string): [number, number, number] {
  let c = (hex || '#141414').replace('#', '').trim();
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return [20, 20, 20];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function lerpColor(hexA: string, hexB: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   FOCUS MODE DIMENSION & 5% PEEKING STRIDE FORMULA
   neighbor left edge = 0.5 * W + stride - 0.375 * cardW = 0.95 * W
   => stride = 0.45 * W + 0.375 * cardW
   ═══════════════════════════════════════════════════════════════════════════ */
function getFocusDimensions(width: number, height: number) {
  const isMobile = width < 640;
  const isTablet = width < 1024;

  let cardW = isMobile ? width * 0.74 : isTablet ? width * 0.44 : Math.min(520, width * 0.36);
  let cardH = isMobile ? height * 0.40 : Math.min(430, height * 0.48);

  if (cardW / cardH > 1.48) cardW = cardH * 1.48;
  if (cardW / cardH < 1.15) cardH = cardW / 1.15;

  const stride = 0.45 * width + 0.375 * cardW;
  return { cardW, cardH, stride };
}

/* ═══════════════════════════════════════════════════════════════════════════
   ARISTIDE BENOIST 1:1 MASTERPIECE — EDITORIAL CERTIFICATE SHOWCASE
   
   1. Canvas: 100vw × 100vh locked, #141414 matte charcoal, zero vertical scroll.
   2. Motion Physics:
      - Mode A (Ribbon): Damped Lerp + Velocity Skew & Sine Undulation
      - Mode B (Focus): Full rAF + Damped Lerp Inertia + Cosine Bell Curve Scaling
        + 5% Peeking Edges + Inner Counter-Scale Parallax + Real-Time RGB Lerp
   3. 4 Fixed Zones:
      - Top-Left: Logo text ABU DEVIS (condensed all-caps)
      - Top-Center: Fluid 30 vertical tick marks (| | | |) + continuous needle
      - Top-Right: [ABOUT] / [PROJECTS ✕] / [CLOSE]
      - Center: Filmstrip Ribbon / Continuous Hero Focus Carousel
      - Bottom: Independent status lines & minimal stacked contacts
   ═══════════════════════════════════════════════════════════════════════════ */
export const Chapter03ReceiptsModal: React.FC<Chapter03ReceiptsModalProps> = ({
  isOpen,
  onClose,
  origin: _origin,
  skipPreloader = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Ribbon Mode Refs
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const topBarRef = useRef<HTMLDivElement>(null);
  const needleRef = useRef<HTMLDivElement>(null);
  const cardOffsets = useRef<number[]>([]);

  // Master RAF & Common State
  const rafId = useRef<number | null>(null);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [counter, setCounter] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const focusedIndexRef = useRef<number | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const aboutOpenRef = useRef<boolean>(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const zoomImageRef = useRef<string | null>(null);
  const isClosingRef = useRef<boolean>(false);
  const scrollYPosRef = useRef<number>(0);

  // Safe State Synchronizers for synchronous popstate lookups
  const setZoomImageSafe = useCallback((url: string | null, pushHist = true) => {
    zoomImageRef.current = url;
    setZoomImage(url);
    if (url && pushHist && typeof window !== 'undefined') {
      window.history.pushState({ modal: 'chapter-03-receipts', view: 'zoom' }, '');
    }
  }, []);

  const setAboutOpenSafe = useCallback((open: boolean, pushHist = true) => {
    aboutOpenRef.current = open;
    setAboutOpen(open);
    if (open && pushHist && typeof window !== 'undefined') {
      window.history.pushState({ modal: 'chapter-03-receipts', view: 'about' }, '');
    }
  }, []);

  const closeZoomImage = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.state?.view === 'zoom') {
      window.history.back();
    } else {
      setZoomImageSafe(null, false);
    }
  }, [setZoomImageSafe]);

  const closeAboutSheet = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.state?.view === 'about') {
      window.history.back();
    } else {
      setAboutOpenSafe(false, false);
    }
  }, [setAboutOpenSafe]);

  // Ribbon Physics Refs
  const targetX = useRef<number>(0);
  const currentX = useRef<number>(0);
  const scrollVelocityLerp = useRef<number>(0);
  const activeRibbonIndexRef = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const startDragX = useRef<number>(0);
  const dragDelta = useRef<number>(0);
  const lastDragTime = useRef<number>(0);
  const dragVelocity = useRef<number>(0);
  const maxScroll = useRef<number>(0);

  // Focus Mode Refs (Aristide 1:1 Inverted Canvas Mode)
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const focusTrackRef = useRef<HTMLDivElement>(null);
  const focusCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const focusImageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const posterTitleRef = useRef<HTMLDivElement>(null);
  const focusTopBarRef = useRef<HTMLDivElement>(null);
  const focusNeedleRef = useRef<HTMLDivElement>(null);
  const focusHeaderRef = useRef<HTMLDivElement>(null);
  const focusMetaRef = useRef<HTMLDivElement>(null);
  const focusFooterRef = useRef<HTMLDivElement>(null);

  // Focus Mode Physics Refs (Full rAF + Damped Lerp + Drag + Snap)
  const focusTargetX = useRef<number>(0);
  const focusCurrentX = useRef<number>(0);
  const focusIsDragging = useRef<boolean>(false);
  const focusStartDragX = useRef<number>(0);
  const focusLastDragX = useRef<number>(0);
  const focusDragMoved = useRef<number>(0);
  const focusLastDragTime = useRef<number>(0);
  const focusDragVelocity = useRef<number>(0);
  const focusSnapTimer = useRef<number | null>(null);
  const focusActiveIndexRef = useRef<number>(0);

  // FLIP Morph State Refs (Smooth Expansion from Slender Strip into Hero Card)
  const isMorphingRef = useRef<boolean>(false);
  const morphProgressRef = useRef<number>(1);
  const morphOriginRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const morphActiveIdxRef = useRef<number>(0);

  // Active Certificate Item for Focus Mode
  const currentCert: CertificateItem | null =
    focusedIndex !== null ? CERTIFICATES_DATA[focusedIndex] || null : null;

  // Track if modal has completed entrance so re-renders or prop changes don't restart preloader
  const hasOpenedRef = useRef<boolean>(false);

  // ── Entrance & Exit Radial Expansion via GSAP ──
  useEffect(() => {
    if (!containerRef.current) return;

    if (isOpen) {
      if (hasOpenedRef.current) {
        // Prevent re-triggering entrance animation & preloader if already open
        return;
      }
      hasOpenedRef.current = true;

      // Blur background buttons (e.g. Iron Man dossier button) and claim focus
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      containerRef.current?.focus();

      scrollYPosRef.current = window.scrollY || window.pageYOffset;
      const win = window as unknown as { __lenis?: { stop: () => void; start: () => void; scrollTo: (y: number, opts: unknown) => void } };
      if (win.__lenis) win.__lenis.stop();

      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');

      if (skipPreloader) {
        setCounter(100);
        setPreloaderDone(true);
      } else {
        setPreloaderDone(false);
        setCounter(0);
        const countObj = { val: 0 };
        gsap.to(countObj, {
          val: 100,
          duration: 0.55,
          ease: 'power2.inOut',
          onUpdate: () => {
            setCounter(Math.floor(countObj.val));
          },
          onComplete: () => {
            setPreloaderDone(true);
          },
        });
      }
      setFocusedIndex(null);
      focusedIndexRef.current = null;
      setAboutOpen(false);
      setZoomImage(null);
      targetX.current = 0;
      currentX.current = 0;
      focusTargetX.current = 0;
      focusCurrentX.current = 0;
      focusActiveIndexRef.current = 0;

      if (containerRef.current) {
        gsap.set(containerRef.current, { backgroundColor: '#050505', opacity: 1 });
        gsap.to(containerRef.current, {
          backgroundColor: '#141414',
          duration: 0.45,
          ease: 'power2.out',
        });
      }
      if (trackRef.current) {
        gsap.fromTo(
          trackRef.current,
          { opacity: 0, y: 24, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out', delay: 0.05, force3D: true }
        );
      }

      // Preload all 30 certificate images in browser memory to eliminate flicker
      CERTIFICATES_DATA.forEach((cert) => {
        const img = new Image();
        img.src = cert.imageUrl;
      });
    }

    return () => {
      hasOpenedRef.current = false;
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      const win = window as unknown as { __lenis?: { start: () => void } };
      if (win.__lenis) {
        win.__lenis.start();
      }
    };
  }, [isOpen]);

  // Compute maximum scroll bounds and cache static card centers for ribbon mode
  const updateBounds = useCallback(() => {
    if (!trackRef.current) return;
    const viewportWidth = window.innerWidth;
    const viewportCenter = viewportWidth / 2;

    cardOffsets.current = cardRefs.current.map((card) =>
      card ? card.offsetLeft + card.offsetWidth / 2 : 0
    );

    const lastOffset = cardOffsets.current[cardOffsets.current.length - 1];
    if (lastOffset) {
      // Allows the very last card to scroll all the way to dead center with 50vw negative space
      maxScroll.current = Math.max(0, lastOffset - viewportCenter);
    } else {
      const trackWidth = trackRef.current.scrollWidth;
      maxScroll.current = Math.max(0, trackWidth - viewportWidth);
    }
  }, []);

  // Jump to specific certificate via top tick marks or keyboard arrow navigation in ribbon mode
  const jumpToIndex = useCallback((idx: number) => {
    setActiveIndex(idx);
    activeRibbonIndexRef.current = idx;
    if (!trackRef.current || maxScroll.current <= 0) return;
    const cardCenter = cardOffsets.current[idx];
    if (cardCenter !== undefined) {
      const viewportCenter = window.innerWidth / 2;
      const desiredScroll = cardCenter - viewportCenter;
      targetX.current = Math.max(0, Math.min(maxScroll.current, desiredScroll));
    }
  }, []);

  // Close Focus Mode: Smoothly Contract Back into Ribbon Filmstrip
  const handleCloseDetail = useCallback((popHistory = true) => {
    if (isMorphingRef.current) return;
    if (popHistory && typeof window !== 'undefined' && window.history.state?.view === 'focus') {
      window.history.back();
      return;
    }
    isMorphingRef.current = true;

    if (focusHeaderRef.current) gsap.to(focusHeaderRef.current, { opacity: 0, duration: 0.2 });
    if (focusMetaRef.current) gsap.to(focusMetaRef.current, { opacity: 0, duration: 0.2 });
    if (focusFooterRef.current) gsap.to(focusFooterRef.current, { opacity: 0, duration: 0.2 });

    const targetIdx = focusActiveIndexRef.current;
    const targetCard = cardRefs.current[targetIdx];
    if (targetCard) {
      const rect = targetCard.getBoundingClientRect();
      morphOriginRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        w: rect.width,
        h: rect.height,
      };
      morphActiveIdxRef.current = targetIdx;
    }

    const currentBg = CERTIFICATES_DATA[targetIdx]?.canvasBg || '#0D5C75';
    const currentRgb = hexToRgb(currentBg);
    const darkRgb = hexToRgb('#141414');
    const colorObj = { r: currentRgb[0], g: currentRgb[1], b: currentRgb[2] };

    gsap.to(colorObj, {
      r: darkRgb[0],
      g: darkRgb[1],
      b: darkRgb[2],
      duration: 0.45,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (heroContainerRef.current) {
          heroContainerRef.current.style.backgroundColor = `rgb(${Math.round(colorObj.r)}, ${Math.round(colorObj.g)}, ${Math.round(colorObj.b)})`;
        }
      },
    });

    const morphObj = { progress: 1 };
    gsap.to(morphObj, {
      progress: 0,
      duration: 0.45,
      ease: 'power2.inOut',
      onUpdate: () => {
        morphProgressRef.current = morphObj.progress;
      },
      onComplete: () => {
        morphProgressRef.current = 1;
        isMorphingRef.current = false;
        morphOriginRef.current = null;
        focusedIndexRef.current = null;
        setFocusedIndex(null);
        jumpToIndex(targetIdx);
      },
    });
  }, [jumpToIndex]);

  // Close Modal with Radial Collapse & Optional History Pop
  const handleClose = useCallback((popHistory = true) => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    hasOpenedRef.current = false;

    if (popHistory && typeof window !== 'undefined' && window.history.state?.modal === 'chapter-03-receipts') {
      window.history.back();
    }

    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    const win = window as unknown as { __lenis?: { start: () => void; scrollTo: (y: number, opts: unknown) => void } };
    if (win.__lenis) {
      win.__lenis.start();
    }

    if (!containerRef.current) {
      onClose();
      return;
    }

    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.35,
      ease: 'power2.inOut',
      onComplete: () => {
        onClose();
      },
    });
  }, [onClose]);

  // ── Browser History & Popstate Stack Synchronization (Zero Unexpected Exits) ──
  useEffect(() => {
    if (!isOpen) return;
    isClosingRef.current = false;

    // Push browser history state for smooth back gesture & back button support
    window.history.pushState({ modal: 'chapter-03-receipts' }, '');

    const handlePopState = () => {
      if (isClosingRef.current) return;

      // 1. If Zoom Lightbox is open, close Zoom cleanly
      if (zoomImageRef.current) {
        setZoomImageSafe(null, false);
        return;
      }

      // 2. If About Sheet is open, close About cleanly
      if (aboutOpenRef.current) {
        setAboutOpenSafe(false, false);
        return;
      }

      // 3. If in Focus Mode (Aristide 1:1 view), return to Ribbon view cleanly
      if (focusedIndexRef.current !== null) {
        handleCloseDetail(false);
        return;
      }

      // 4. In Ribbon Gallery: close the modal cleanly (false because browser back already popped state)
      handleClose(false);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, handleClose, handleCloseDetail, setAboutOpenSafe, setZoomImageSafe]);

  useEffect(() => {
    updateBounds();
    const raf1 = requestAnimationFrame(() => {
      updateBounds();
      const raf2 = requestAnimationFrame(() => {
        updateBounds();
      });
      return () => cancelAnimationFrame(raf2);
    });

    const handleResize = () => {
      updateBounds();
      if (focusedIndex !== null) {
        const { stride } = getFocusDimensions(window.innerWidth, window.innerHeight);
        const k = focusActiveIndexRef.current;
        focusTargetX.current = k * stride;
        focusCurrentX.current = k * stride;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(raf1);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateBounds, preloaderDone, focusedIndex]);

  // ── Master Physics Animation Loop (Ribbon Mode & Focus Mode) ──
  useEffect(() => {
    if (!isOpen) return;

    const loop = () => {
      // ═════════════════════════════════════════════════════════════════════
      // BRANCH A: FOCUS MODE MASTER PHYSICS (ARISTIDE BENOIST 1:1)
      // ═════════════════════════════════════════════════════════════════════
      if (focusedIndexRef.current !== null) {
        const W = window.innerWidth;
        const H = window.innerHeight;
        const { cardW, cardH, stride } = getFocusDimensions(W, H);
        const totalCards = CERTIFICATES_DATA.length;
        const maxFocusScroll = (totalCards - 1) * stride;

        // 1. Damped Lerp Inertia: currentX += (targetX - currentX) * 0.08
        const focusDiff = focusTargetX.current - focusCurrentX.current;
        focusCurrentX.current += focusDiff * 0.08;

        const curFocusX = focusCurrentX.current;
        const floatIndex = Math.max(0, Math.min(totalCards - 1, curFocusX / stride));

        // 2. Active Index Sync (State only updates when crossing index boundary)
        const approxIndex = Math.round(floatIndex);
        if (approxIndex !== focusActiveIndexRef.current && !isMorphingRef.current) {
          focusActiveIndexRef.current = approxIndex;
          focusedIndexRef.current = approxIndex;
          setActiveIndex(approxIndex);
          setFocusedIndex(approxIndex);
        }

        // 3. Real-Time Continuous RGB Lerp (Background & Active Accent)
        const idx0 = Math.floor(floatIndex);
        const idx1 = Math.min(totalCards - 1, idx0 + 1);
        const t = floatIndex - idx0;

        const cert0 = CERTIFICATES_DATA[idx0] || CERTIFICATES_DATA[0];
        const cert1 = CERTIFICATES_DATA[idx1] || cert0;
        const bg0 = cert0.canvasBg || '#141414';
        const bg1 = cert1.canvasBg || '#141414';
        const text0 = cert0.textColor || cert0.accentColor || '#FAF6EE';
        const text1 = cert1.textColor || cert1.accentColor || '#FAF6EE';

        let targetBg = lerpColor(bg0, bg1, t);
        const interpolatedAccent = lerpColor(text0, text1, t);

        // When not morphing, normal horizontal scroll RGB lerp operates continuously
        if (!isMorphingRef.current && heroContainerRef.current) {
          heroContainerRef.current.style.backgroundColor = targetBg;
          heroContainerRef.current.style.setProperty('--active-accent', interpolatedAccent);
        }

        // 4. Distance-Based Center-Focus Scaling & Inner Parallax + FLIP Morphing
        const p = morphProgressRef.current;
        const Cx = W / 2;
        const Cy = H / 2;
        const morphOrigin = morphOriginRef.current;
        const morphIdx = morphActiveIdxRef.current;

        for (let idx = 0; idx < totalCards; idx++) {
          const cardEl = focusCardRefs.current[idx];
          const imgEl = focusImageRefs.current[idx];
          if (!cardEl) continue;

          const deltaX = idx * stride - curFocusX;
          const centerOnScreen = Cx + deltaX;

          // Frustum culling: only cards in or near viewport are rendered
          if (centerOnScreen > -stride * 1.2 && centerOnScreen < W + stride * 1.2) {
            cardEl.style.display = 'flex';

            const dist = Math.min(1.0, Math.abs(deltaX) / stride);
            // Cosine Bell Curve: factor goes from 1.0 (center) to 0.0 (edge)
            const factor = Math.cos(dist * Math.PI * 0.5);

            // Membesar mulus hingga 1.0 di tengah, mengecil ke ~0.75 di tepi
            const scale = 0.75 + 0.25 * factor;
            // Redup halus ke ~0.38 di tepi
            let opacity = 0.38 + 0.62 * factor;
            let zIndex = Math.round(10 + 10 * factor);

            let posX = centerOnScreen - cardW / 2;
            let posY = 0;
            let scaleX = scale;
            let scaleY = scale;

            // ── FLIP Morphing: Melebar dan Membesar Smooth dari Barisan Sempit ──
            if (p < 1 && morphOrigin && idx === morphIdx) {
              const initOffsetX = morphOrigin.x - Cx;
              const initOffsetY = morphOrigin.y - Cy;
              const initScaleX = morphOrigin.w / cardW;
              const initScaleY = morphOrigin.h / cardH;

              const curOffsetX = initOffsetX * (1 - p);
              const curOffsetY = initOffsetY * (1 - p);
              scaleX = (initScaleX + (1.0 - initScaleX) * p) * scale;
              scaleY = (initScaleY + (1.0 - initScaleY) * p) * scale;

              posX += curOffsetX;
              posY += curOffsetY;
              zIndex = 50; // Hero card sits proudly on top during expansion
            } else if (p < 1) {
              // Neighbor cards smoothly slide outward from behind center card
              const slideMult = 0.3 + 0.7 * p;
              const neighborShift = (centerOnScreen - Cx) * (slideMult - 1);
              posX += neighborShift;
              opacity *= p;
            }

            // Card transform (100% GPU-accelerated translate3d + scale)
            cardEl.style.transform = `translate3d(${posX}px, calc(-50% + ${posY}px), 0) scale(${scaleX}, ${scaleY})`;
            cardEl.style.opacity = `${opacity}`;
            cardEl.style.zIndex = `${zIndex}`;

            // Counter-Scale & Inner Parallax pada Gambar
            if (imgEl) {
              const innerParallaxX = -(deltaX / stride) * 24;
              const innerScale = 1.0 + 0.12 * (1.0 - factor);
              imgEl.style.transform = `translate3d(${innerParallaxX}px, 0, 0) scale(${innerScale})`;
            }
          } else {
            cardEl.style.display = 'none';
          }
        }

        // 5. Atmospheric Backdrop Typography Parallax & Morph Fade
        if (posterTitleRef.current) {
          const titleDeltaX = -(curFocusX - approxIndex * stride) * 0.20;
          posterTitleRef.current.style.transform = `translate3d(${titleDeltaX}px, 0, 0)`;
          posterTitleRef.current.style.opacity = `${0.22 * p}`;
        }

        // 6. Top Needle / Tick Progress Indicator in Focus Mode
        if (focusNeedleRef.current && focusTopBarRef.current && maxFocusScroll > 0) {
          const progress = Math.max(0, Math.min(1, curFocusX / maxFocusScroll));
          const barWidth = focusTopBarRef.current.offsetWidth;
          const needleX = progress * Math.max(0, barWidth - 4);
          focusNeedleRef.current.style.transform = `translate3d(${needleX}px, -50%, 0)`;
        }

        rafId.current = requestAnimationFrame(loop);
        return;
      }

      // ═════════════════════════════════════════════════════════════════════
      // BRANCH B: RIBBON FILMSTRIP GALLERY MASTER PHYSICS (VELOCITY-AMPLIFIED BELL-CURVE ELEVATION)
      // ═════════════════════════════════════════════════════════════════════
      // 1. Damped Lerp Inertia: 0.085 factor provides luxurious smooth glide
      const diff = targetX.current - currentX.current;
      currentX.current += diff * 0.085;

      // 2. Velocity Calculation with Fluid Elastic Damping
      const instVelocity = diff;
      const instSpeed = Math.abs(instVelocity);
      scrollVelocityLerp.current += (instSpeed - scrollVelocityLerp.current) * 0.12;

      // Keep track translate3d on x-axis
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${-currentX.current}px, 0, 0)`;
      }

      // 3. 3D Forward Depth Physics (ZERO translateY, zero CSS filter repaints)
      // Active center card pushes forward in 3D (translateZ: 60px, scale: 1.12),
      // non-active side cards sit back (translateZ: 0px, scale: 0.88, opacity: 0.35)
      const viewportWidth = window.innerWidth;
      const viewportCenter = viewportWidth / 2;
      const curX = currentX.current;
      const offsets = cardOffsets.current;
      const bellRadius = Math.min(360, viewportWidth * 0.32);

      let closestCenterIdx = activeRibbonIndexRef.current;
      let minCenterDist = Infinity;

      for (let idx = 0; idx < offsets.length; idx++) {
        const centerOnScreen = offsets[idx] - curX;
        // Limit GPU transform updates to visible window around viewport
        if (centerOnScreen > -220 && centerOnScreen < viewportWidth + 220) {
          const card = cardRefs.current[idx];
          const distFromCenter = centerOnScreen - viewportCenter;
          const absDist = Math.abs(distFromCenter);

          if (absDist < minCenterDist) {
            minCenterDist = absDist;
            closestCenterIdx = idx;
          }

          const normX = distFromCenter / bellRadius;

          // Gaussian Bell Curve (1.0 at center, falling smoothly to 0 at edges)
          const bell = Math.exp(-normX * normX * 2.2);

          // 3D Forward Depth: center card pushes forward (translateZ: 60px, scale: 1.12),
          // side cards sit back (translateZ: 0px, scale: 0.88). Vertical position y: 0 is locked!
          const cardScale = 0.88 + 0.24 * bell;
          const cardZ = 60 * bell;
          const cardOpacity = 0.35 + 0.65 * bell;
          const cardZIndex = Math.round(1 + 19 * bell);

          if (card) {
            card.style.opacity = `${cardOpacity}`;
            card.style.zIndex = `${cardZIndex}`;
            card.style.transform = `translate3d(0, 0, ${cardZ.toFixed(1)}px) scale(${cardScale.toFixed(3)})`;
          }
        } else {
          const card = cardRefs.current[idx];
          if (card) {
            card.style.opacity = '0';
          }
        }
      }

      if (closestCenterIdx !== activeRibbonIndexRef.current) {
        activeRibbonIndexRef.current = closestCenterIdx;
        setActiveIndex(closestCenterIdx);
      }

      // 4. Sub-pixel Continuous Smooth Needle for Top Indicator
      if (needleRef.current && topBarRef.current && maxScroll.current > 0) {
        const progress = Math.max(0, Math.min(1, currentX.current / maxScroll.current));
        const barWidth = topBarRef.current.offsetWidth;
        const needleX = progress * Math.max(0, barWidth - 4);
        needleRef.current.style.transform = `translate3d(${needleX}px, -50%, 0)`;
      }

      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isOpen]);

  // Card Click in Ribbon: Smooth FLIP Expansion into Focus Mode
  const handleCardClick = (idx: number) => {
    if (isMorphingRef.current) return;

    const clickedCard = cardRefs.current[idx];
    if (clickedCard) {
      const rect = clickedCard.getBoundingClientRect();
      morphOriginRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        w: rect.width,
        h: rect.height,
      };
    } else {
      morphOriginRef.current = null;
    }

    const { stride } = getFocusDimensions(window.innerWidth, window.innerHeight);
    focusTargetX.current = idx * stride;
    focusCurrentX.current = idx * stride;
    focusActiveIndexRef.current = idx;
    focusedIndexRef.current = idx;
    morphActiveIdxRef.current = idx;
    morphProgressRef.current = 0;
    isMorphingRef.current = true;

    setFocusedIndex(idx);
    setActiveIndex(idx);

    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: 'chapter-03-receipts', view: 'focus' }, '');
    }

    const targetBg = CERTIFICATES_DATA[idx]?.canvasBg || '#0D5C75';
    const targetAccent = CERTIFICATES_DATA[idx]?.textColor || CERTIFICATES_DATA[idx]?.accentColor || '#FAF6EE';

    if (focusHeaderRef.current) gsap.fromTo(focusHeaderRef.current, { opacity: 0 }, { opacity: 1, duration: 0.55, delay: 0.25 });
    if (focusMetaRef.current) gsap.fromTo(focusMetaRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.3 });
    if (focusFooterRef.current) gsap.fromTo(focusFooterRef.current, { opacity: 0 }, { opacity: 1, duration: 0.55, delay: 0.25 });

    // Smooth continuous color dissolve: #141414 -> target canvasBg (zero sudden popping / light switch)
    const initialRgb = hexToRgb('#141414');
    const targetRgb = hexToRgb(targetBg);
    const colorObj = { r: initialRgb[0], g: initialRgb[1], b: initialRgb[2] };

    requestAnimationFrame(() => {
      if (heroContainerRef.current) {
        heroContainerRef.current.style.backgroundColor = '#141414';
        heroContainerRef.current.style.setProperty('--active-accent', targetAccent);
      }
      gsap.to(colorObj, {
        r: targetRgb[0],
        g: targetRgb[1],
        b: targetRgb[2],
        duration: 0.85,
        ease: 'power2.out',
        onUpdate: () => {
          if (heroContainerRef.current && isMorphingRef.current) {
            heroContainerRef.current.style.backgroundColor = `rgb(${Math.round(colorObj.r)}, ${Math.round(colorObj.g)}, ${Math.round(colorObj.b)})`;
          }
        },
        onComplete: () => {
          if (heroContainerRef.current) {
            heroContainerRef.current.style.backgroundColor = targetBg;
          }
        },
      });
    });

    // Smoothly expand and widen from the narrow strip into hero frame with cinematic bloom
    const morphObj = { progress: 0 };
    gsap.to(morphObj, {
      progress: 1,
      duration: 0.75,
      ease: 'power2.out',
      onUpdate: () => {
        morphProgressRef.current = morphObj.progress;
      },
      onComplete: () => {
        morphProgressRef.current = 1;
        isMorphingRef.current = false;
      },
    });
  };

  // Next Certificate in Focus Mode
  const handleNext = useCallback(() => {
    const { stride } = getFocusDimensions(window.innerWidth, window.innerHeight);
    const currentIdx = Math.round(focusCurrentX.current / stride);
    const nextIdx = Math.min(CERTIFICATES_DATA.length - 1, currentIdx + 1);
    focusTargetX.current = nextIdx * stride;
  }, []);

  // Previous Certificate in Focus Mode
  const handlePrev = useCallback(() => {
    const { stride } = getFocusDimensions(window.innerWidth, window.innerHeight);
    const currentIdx = Math.round(focusCurrentX.current / stride);
    const prevIdx = Math.max(0, currentIdx - 1);
    focusTargetX.current = prevIdx * stride;
  }, []);

  // Click specific tick mark in focus mode
  const handleFocusTickClick = (idx: number) => {
    const { stride } = getFocusDimensions(window.innerWidth, window.innerHeight);
    focusTargetX.current = idx * stride;
  };

  // Focus Mode Card Click (Center Card -> Zoom Image Lightbox, Side Card -> Snap to Center)
  const handleFocusCardClick = (idx: number) => {
    if (focusDragMoved.current > 6) return;

    const { stride } = getFocusDimensions(window.innerWidth, window.innerHeight);
    const curCenterIdx = Math.round(focusCurrentX.current / stride);

    if (idx === curCenterIdx) {
      const cert = CERTIFICATES_DATA[idx];
      // Simply zoom image (PDF opening is already handled by dedicated 'OPEN PDF | +' button below)
      if (cert?.imageUrl) {
        setZoomImageSafe(cert.imageUrl);
      } else if (cert?.pdfUrl) {
        window.open(cert.pdfUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      focusTargetX.current = idx * stride;
    }
  };

  // Native Non-Passive Wheel Listener (100% blocks Chrome/Edge/Safari horizontal swipe-back gesture!)
  useEffect(() => {
    if (!isOpen) return;
    const el = containerRef.current;
    if (!el) return;

    const onNativeWheel = (e: WheelEvent) => {
      // Allow vertical scrolling inside About drawer, but always block horizontal browser-back overscroll
      if (aboutOpenRef.current || zoomImageRef.current) {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault();
        }
        return;
      }

      // CRITICAL: Prevent browser horizontal overscroll history-back (blue ← arrow)
      e.preventDefault();

      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

      if (focusedIndexRef.current !== null) {
        const { stride } = getFocusDimensions(window.innerWidth, window.innerHeight);
        const maxScrollBounds = (CERTIFICATES_DATA.length - 1) * stride;

        if (focusSnapTimer.current) {
          window.clearTimeout(focusSnapTimer.current);
          focusSnapTimer.current = null;
        }

        // Smooth inertia target update
        focusTargetX.current = Math.max(
          0,
          Math.min(maxScrollBounds, focusTargetX.current + delta * 1.15)
        );

        // Debounced smooth snap to nearest card when wheel stops
        focusSnapTimer.current = window.setTimeout(() => {
          const nearestIdx = Math.max(
            0,
            Math.min(CERTIFICATES_DATA.length - 1, Math.round(focusTargetX.current / stride))
          );
          focusTargetX.current = nearestIdx * stride;
        }, 120);
        return;
      }

      targetX.current = Math.max(0, Math.min(maxScroll.current, targetX.current + delta * 1.25));
    };

    // Global horizontal guard while modal is open so swiping near edges also never triggers browser back
    const onWindowHorizontalGuard = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 0) {
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', onNativeWheel, { passive: false });
    window.addEventListener('wheel', onWindowHorizontalGuard, { passive: false });
    return () => {
      el.removeEventListener('wheel', onNativeWheel);
      window.removeEventListener('wheel', onWindowHorizontalGuard);
    };
  }, [isOpen]);

  // Pointer / Mouse Drag with Momentum Physics
  const handlePointerDown = (e: React.PointerEvent) => {
    if (aboutOpen || zoomImage) return;

    if (focusedIndexRef.current !== null) {
      focusIsDragging.current = true;
      focusStartDragX.current = e.clientX;
      focusLastDragX.current = e.clientX;
      focusDragMoved.current = 0;
      focusLastDragTime.current = performance.now();
      focusDragVelocity.current = 0;
      if (focusSnapTimer.current) {
        window.clearTimeout(focusSnapTimer.current);
        focusSnapTimer.current = null;
      }
      return;
    }

    isDragging.current = true;
    startDragX.current = e.clientX;
    dragDelta.current = 0;
    lastDragTime.current = performance.now();
    dragVelocity.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (aboutOpen || zoomImage) return;

    if (focusedIndexRef.current !== null) {
      if (!focusIsDragging.current) return;
      const now = performance.now();
      const dt = Math.max(1, now - focusLastDragTime.current);
      const dx = e.clientX - focusLastDragX.current;
      focusLastDragX.current = e.clientX;
      focusDragMoved.current += Math.abs(dx);
      focusDragVelocity.current = dx / dt;
      focusLastDragTime.current = now;

      const { stride } = getFocusDimensions(window.innerWidth, window.innerHeight);
      const maxScrollBounds = (CERTIFICATES_DATA.length - 1) * stride;
      focusTargetX.current = Math.max(0, Math.min(maxScrollBounds, focusTargetX.current - dx * 1.2));
      return;
    }

    if (!isDragging.current) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastDragTime.current);
    const dx = e.clientX - startDragX.current;
    startDragX.current = e.clientX;
    dragDelta.current += Math.abs(dx);
    dragVelocity.current = dx / dt;
    lastDragTime.current = now;
    targetX.current = Math.max(0, Math.min(maxScroll.current, targetX.current - dx * 1.15));
  };

  const handlePointerUp = () => {
    if (focusedIndexRef.current !== null) {
      if (!focusIsDragging.current) return;
      focusIsDragging.current = false;

      const { stride } = getFocusDimensions(window.innerWidth, window.innerHeight);
      const maxScrollBounds = (CERTIFICATES_DATA.length - 1) * stride;

      // Release momentum glide
      if (Math.abs(focusDragVelocity.current) > 0.3) {
        const momentum = focusDragVelocity.current * 320;
        focusTargetX.current = Math.max(0, Math.min(maxScrollBounds, focusTargetX.current - momentum));
      }

      // Auto lock / snap to nearest card
      const nearestIdx = Math.max(0, Math.min(CERTIFICATES_DATA.length - 1, Math.round(focusTargetX.current / stride)));
      focusTargetX.current = nearestIdx * stride;
      return;
    }

    if (!isDragging.current) return;
    isDragging.current = false;
    if (Math.abs(dragVelocity.current) > 0.3) {
      const momentum = dragVelocity.current * 320;
      targetX.current = Math.max(0, Math.min(maxScroll.current, targetX.current - momentum));
    }
  };

  // Keyboard navigation for detail view & modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (zoomImage) {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          closeZoomImage();
        }
        return;
      }
      if (aboutOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          closeAboutSheet();
        }
        return;
      }
      if (focusedIndexRef.current !== null) {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          handleCloseDetail(true);
          return;
        }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          e.stopPropagation();
          handleNext();
          return;
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          e.stopPropagation();
          handlePrev();
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          handleFocusCardClick(focusedIndexRef.current);
          return;
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleClose(true);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        const next = Math.min(CERTIFICATES_DATA.length - 1, activeRibbonIndexRef.current + 1);
        activeRibbonIndexRef.current = next;
        jumpToIndex(next);
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        const prev = Math.max(0, activeRibbonIndexRef.current - 1);
        activeRibbonIndexRef.current = prev;
        jumpToIndex(prev);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handleCardClick(activeRibbonIndexRef.current);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, aboutOpen, zoomImage, hoveredIndex, activeIndex, handleNext, handlePrev, handleCloseDetail, handleClose, jumpToIndex, setAboutOpenSafe, setZoomImageSafe, closeZoomImage, closeAboutSheet]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={containerRef}
      tabIndex={-1}
      data-lenis-prevent
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="fixed inset-0 z-[99999] w-screen h-screen bg-[#141414] text-[#EFEFEF] overflow-hidden select-none font-sans cursor-default will-change-transform"
      style={{
        touchAction: 'none',
        overscrollBehavior: 'none',
        overscrollBehaviorX: 'none',
      }}
    >
      <style>{`
        /* Aristide Benoist Pure Minimalist Styling */
        @keyframes tickPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; filter: drop-shadow(0 0 5px rgba(255,255,255,0.9)); }
        }
        .active-tick-line {
          animation: tickPulse 2s ease-in-out infinite;
        }

        /* Completely hide native browser scrollbars globally inside modal */
        *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
      `}</style>

      {/* ═════════════════════════════════════════════════════════════════════
          ATMOSPHERIC TACTILE BACKGROUND (HAIRLINE GRID + SUBTLE GRAIN + VIGNETTE)
          ═════════════════════════════════════════════════════════════════════ */}
      {/* Architectural Hairline Grid */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.024) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.024) 1px, transparent 1px)
          `,
          backgroundSize: 'clamp(80px, 10vw, 130px) clamp(80px, 10vw, 130px)',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 35%, rgba(0,0,0,0.12) 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 35%, rgba(0,0,0,0.12) 85%)',
        }}
      />

      {/* Subtle Analog Film Grain (Opacity: 0.032) */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.032] mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Studio Radial Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 38%, rgba(8, 8, 8, 0.6) 100%)',
        }}
      />

      {/* ═════════════════════════════════════════════════════════════════════
          PRELOADER (ARISTIDE BENOIST 00 -> 100 NUMERIC ACCREDITED ENTRANCE)
          ═════════════════════════════════════════════════════════════════════ */}
      {!preloaderDone && (
        <div className="absolute inset-0 z-50 bg-[#141414] flex flex-col items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500">
              ACCREDITED ARCHIVE
            </span>
            <span className="font-display font-black text-6xl sm:text-8xl tracking-tighter text-[#EFEFEF]">
              {counter < 10 ? `0${counter}` : counter}
            </span>
            <div className="w-24 h-[1px] bg-stone-800 overflow-hidden relative">
              <div
                className="h-full bg-white transition-all duration-75"
                style={{ width: `${counter}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          ZONE 1: TOP-LEFT — BRAND LOGO (1:1 ARISTIDE CONDENSED STYLE)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className={`absolute top-5 sm:top-8 left-6 sm:left-12 z-30 flex items-center transition-opacity duration-300 ${focusedIndex !== null ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <button
          onClick={() => {
            if (focusedIndex !== null) setFocusedIndex(null);
            else if (aboutOpen) setAboutOpenSafe(false);
            else setHoveredIndex(null);
          }}
          className="group flex flex-col items-start cursor-pointer focus:outline-none"
        >
          <span className="font-sans font-light sm:font-normal text-2xl sm:text-[28px] tracking-[0.28em] uppercase text-[#E5E5E5] group-hover:text-white transition-colors">
            ABU DEVIS
          </span>
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          ZONE 2: TOP-CENTER — 30 SUB-PIXEL CONTINUOUS TICK MARKS
          Faint tick background with gliding needle indicator
          ═════════════════════════════════════════════════════════════════════ */}
      <div
        ref={topBarRef}
        className={`absolute top-6 sm:top-9 left-1/2 -translate-x-1/2 z-30 flex items-center gap-[3px] sm:gap-[5px] py-2 px-1 cursor-pointer transition-opacity duration-300 ${focusedIndex !== null ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        {/* Continuous Gliding Needle Indicator */}
        <div
          ref={needleRef}
          className="absolute top-1/2 left-0 w-[2px] h-5 sm:h-6 bg-white pointer-events-none rounded-full will-change-transform shadow-[0_0_8px_rgba(255,255,255,0.9)]"
        />

        {/* 30 Static Background Tick Marks */}
        {CERTIFICATES_DATA.map((cert, idx) => {
          const isCurrent = activeIndex === idx;
          return (
            <button
              key={cert.id}
              onClick={() => jumpToIndex(idx)}
              onMouseEnter={() => {
                setHoveredIndex(idx);
              }}
              title={`${cert.index} — ${cert.title}`}
              className="py-1 px-0.5 focus:outline-none cursor-pointer flex flex-col items-center"
            >
              <div
                className={`w-[1px] transition-all duration-200 rounded-full ${
                  isCurrent
                    ? 'h-3.5 bg-stone-400'
                    : 'h-2.5 sm:h-3 bg-stone-700/60 hover:bg-stone-400 hover:h-4'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          ZONE 3: TOP-RIGHT — [ABOUT] / [CLOSE] EDITORIAL LINKS
          ═════════════════════════════════════════════════════════════════════ */}
      <div className={`absolute top-5 sm:top-8 right-6 sm:right-12 z-30 flex items-center gap-6 font-mono text-[11px] sm:text-[12px] tracking-[0.2em] uppercase transition-opacity duration-300 ${focusedIndex !== null ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <button
          onClick={() => {
            if (focusedIndex !== null) setFocusedIndex(null);
            if (aboutOpen) closeAboutSheet();
            else setAboutOpenSafe(true);
          }}
          className="group relative text-stone-300 hover:text-white transition-colors cursor-pointer focus:outline-none"
        >
          <span>{aboutOpen ? 'CLOSE' : 'ABOUT'}</span>
          <span className="block w-full h-[1px] bg-stone-600 group-hover:bg-white transition-colors mt-0.5" />
        </button>

        <button
          onClick={() => handleClose(true)}
          className="group relative text-stone-500 hover:text-stone-200 transition-colors cursor-pointer focus:outline-none"
          title="Kembali ke The Nexus"
        >
          <span>CLOSE</span>
          <span className="block w-full h-[1px] bg-stone-800 group-hover:bg-stone-400 transition-colors mt-0.5" />
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          ZONE 4: CENTER — 1:1 SLIVER GRID GALLERY (PURE ARISTIDE BENOIST)
          30 slender vertical strips starting at ~48vw from the left edge.
          ═════════════════════════════════════════════════════════════════════ */}
      <div
        onMouseLeave={() => {
          setHoveredIndex(null);
        }}
        className="relative w-full h-full flex flex-col justify-center overflow-hidden select-none pointer-events-auto"
        style={{ perspective: '1200px' }}
      >
        {/* Floating Active Strip Label (Ample margin below so cards never collide) */}
        <div className="h-6 flex items-center justify-center mb-8 sm:mb-12 pt-6 pointer-events-none transition-all duration-300">
          {(() => {
            const displayIdx = hoveredIndex !== null ? hoveredIndex : activeIndex;
            const cert = CERTIFICATES_DATA[displayIdx];
            if (!cert) return null;
            return (
              <div className="flex items-center gap-2 font-mono text-[9px] sm:text-[10px] tracking-[0.24em] uppercase text-stone-300 animate-[fadeIn_0.25s_ease-out]">
                <span className="text-white font-semibold">{cert.index}</span>
                <span className="text-stone-600">//</span>
                <span className="text-stone-300">{cert.title}</span>
                <span className="text-stone-600">//</span>
                <span className="text-stone-500">{cert.year}</span>
              </div>
            );
          })()}
        </div>

        {/* 30 Cards Horizontal Strip with 3D Forward Depth */}
        <div
          ref={trackRef}
          className="flex items-center gap-3 sm:gap-4 md:gap-5 will-change-transform pl-[48vw] pr-[55vw]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {CERTIFICATES_DATA.map((cert, idx) => {
            return (
              <div
                key={cert.id}
                ref={(el) => {
                  cardRefs.current[idx] = el;
                }}
                onClick={() => {
                  handleCardClick(idx);
                }}
                className="group relative shrink-0 cursor-pointer overflow-hidden rounded-[4px] border border-white/10 select-none will-change-transform w-[95px] xs:w-[115px] sm:w-[135px] md:w-[155px] lg:w-[175px] shadow-[0_12px_32px_rgba(0,0,0,0.65)]"
                style={{
                  height: 'clamp(220px, 46vh, 440px)',
                  transformOrigin: 'center center',
                }}
              >
                {/* Soft top & bottom vignette to dissolve into background */}
                <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-[#141414]/80 to-transparent pointer-events-none z-10" />
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#141414]/80 to-transparent pointer-events-none z-10" />

                <img
                  ref={(el) => {
                    imageRefs.current[idx] = el;
                  }}
                  src={cert.imageUrl}
                  alt={cert.title}
                  className="w-full h-full object-cover object-center border-0 border-none outline-none ring-0 pointer-events-none"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            );
          })}
        </div>

        {/* Subtle Edge Prev / Next Arrows for Effortless Mouse Navigation in Ribbon Mode */}
        {focusedIndex === null && !aboutOpen && !zoomImage && (
          <div className="pointer-events-none absolute inset-x-3 sm:inset-x-6 top-1/2 -translate-y-1/2 z-30 flex items-center justify-between">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const prev = Math.max(0, activeRibbonIndexRef.current - 1);
                jumpToIndex(prev);
              }}
              disabled={activeIndex === 0}
              aria-label="Sertifikat sebelumnya"
              className="pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md text-white flex items-center justify-center transition-all duration-200 disabled:opacity-15 disabled:pointer-events-none cursor-pointer active:scale-95"
            >
              <span className="font-mono text-sm leading-none">←</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const next = Math.min(CERTIFICATES_DATA.length - 1, activeRibbonIndexRef.current + 1);
                jumpToIndex(next);
              }}
              disabled={activeIndex >= CERTIFICATES_DATA.length - 1}
              aria-label="Sertifikat berikutnya"
              className="pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md text-white flex items-center justify-center transition-all duration-200 disabled:opacity-15 disabled:pointer-events-none cursor-pointer active:scale-95"
            >
              <span className="font-mono text-sm leading-none">→</span>
            </button>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          ZONE 5: BOTTOM-LEFT — TWO-LINE INDEPENDENT STATUS
          ═════════════════════════════════════════════════════════════════════ */}
      <div className={`absolute bottom-6 sm:bottom-8 left-6 sm:left-12 z-30 flex flex-col font-mono text-[9px] sm:text-[10px] tracking-[0.22em] uppercase text-stone-500 leading-relaxed pointer-events-none transition-opacity duration-300 ${focusedIndex !== null ? 'opacity-0' : 'opacity-100'}`}>
        <span className="text-stone-300">INDEPENDENT DEVELOPER</span>
        <span className="text-stone-500">ACCREDITED PORTFOLIO // {CERTIFICATES_DATA.length} RECORDS</span>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          ZONE 6: BOTTOM-RIGHT — STACKED CONTACTS WITH EDITORIAL HOVER EFFECTS
          ═════════════════════════════════════════════════════════════════════ */}
      <div className={`absolute bottom-6 sm:bottom-8 right-6 sm:right-12 z-30 flex flex-col items-end gap-1.5 font-mono text-[9.5px] sm:text-[10px] tracking-[0.22em] uppercase text-stone-500 transition-opacity duration-300 ${focusedIndex !== null ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <a
          href="mailto:abudevis5@gmail.com"
          className="group relative flex items-center gap-1.5 px-2.5 py-1 -mr-2 rounded-full hover:bg-white/[0.06] hover:text-white transition-all duration-300 border border-transparent hover:border-white/10 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 group-hover:bg-emerald-400 group-hover:scale-125 transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="relative">
            EMAIL
            <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-300 ease-out" />
          </span>
          <span className="text-[9px] text-stone-600 group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300">↗</span>
        </a>

        <a
          href="https://www.linkedin.com/in/abu-devis-jalaluddin-rumi-5475a33b6/"
          className="group relative flex items-center gap-1.5 px-2.5 py-1 -mr-2 rounded-full hover:bg-white/[0.06] hover:text-white transition-all duration-300 border border-transparent hover:border-white/10 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500/70 group-hover:bg-sky-400 group-hover:scale-125 transition-all duration-300 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
          <span className="relative">
            LINKEDIN
            <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-300 ease-out" />
          </span>
          <span className="text-[9px] text-stone-600 group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300">↗</span>
        </a>

        <a
          href="https://github.com/DevisRoomi"
          className="group relative flex items-center gap-1.5 px-2.5 py-1 -mr-2 rounded-full hover:bg-white/[0.06] hover:text-white transition-all duration-300 border border-transparent hover:border-white/10 hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-stone-500/70 group-hover:bg-white group-hover:scale-125 transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          <span className="relative">
            GITHUB
            <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-300 ease-out" />
          </span>
          <span className="text-[9px] text-stone-600 group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300">↗</span>
        </a>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          STATE 2: 1:1 ARISTIDE BENOIST EDITORIAL HERO SHOWCASE (CANALS STYLE)
          Continuous horizontal carousel + Distance Bell Curve + RGB Lerp
          - Layer 0 (z-0): Giant widely tracked backdrop typography with parallax
          - Layer 10 (z-10): Continuous 30-card horizontal stage with Bell Curve scaling & 5% peeking
          - Layer 20 (z-20): Metadata table + OPEN PDF | + action row
          - Layer 30 (z-30): Fixed Top Header and Bottom Footer
          ═════════════════════════════════════════════════════════════════════ */}
      {focusedIndex !== null && currentCert && (() => {
        const activeColor = currentCert.textColor || currentCert.accentColor || '#FAF6EE';
        const { cardW, cardH } = getFocusDimensions(
          typeof window !== 'undefined' ? window.innerWidth : 1440,
          typeof window !== 'undefined' ? window.innerHeight : 900
        );

        return (
          <div
            ref={heroContainerRef}
            className="absolute inset-0 z-40 flex flex-col justify-between p-0 select-none overflow-hidden will-change-transform"
            style={{
              // @ts-ignore
              '--active-accent': activeColor,
            }}
          >
            {/* Fine-art Paper Grain for Vibrant Canvas */}
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-[0.035] mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
              }}
            />
            {/* LAYER 30: FIXED TOP BAR */}
            <div ref={focusHeaderRef} className="w-full flex items-center justify-between px-6 sm:px-12 pt-5 sm:pt-8 z-30 shrink-0">
              {/* Top-Left: Logo */}
              <span
                className="font-sans font-light sm:font-normal text-2xl sm:text-[28px] tracking-[0.28em] uppercase transition-colors cursor-pointer"
                style={{ color: 'var(--active-accent)' }}
                onClick={() => handleCloseDetail(true)}
                title="Kembali ke galeri strip"
              >
                ABU DEVIS
              </span>

              {/* Top-Center: 01 ▢ 30 and Active Needle Ticks */}
              <div className="hidden sm:flex items-center gap-4">
                {/* 01 ▢ 30 Box Indicator (1:1 Aristide) */}
                <div
                  className="flex items-center gap-2 font-mono text-[11px] sm:text-xs tracking-widest select-none"
                  style={{ color: 'var(--active-accent)' }}
                >
                  <span className="font-semibold">{currentCert.index}</span>
                  <span
                    className="w-4 h-2.5 border rounded-[1px] inline-block opacity-75"
                    style={{ borderColor: 'var(--active-accent)' }}
                  />
                  <span className="opacity-60">
                    {CERTIFICATES_DATA.length < 10 ? `0${CERTIFICATES_DATA.length}` : CERTIFICATES_DATA.length}
                  </span>
                </div>

                {/* 30 Ticks with Gliding Needle */}
                <div
                  ref={focusTopBarRef}
                  className="relative flex items-center gap-[3px] sm:gap-[5px] py-1 px-1 cursor-pointer"
                >
                  {/* Smooth Needle Indicator */}
                  <div
                    ref={focusNeedleRef}
                    className="absolute top-1/2 left-0 w-[2px] h-4 sm:h-5 pointer-events-none rounded-full will-change-transform"
                    style={{
                      backgroundColor: 'var(--active-accent)',
                      boxShadow: '0 0 8px var(--active-accent)',
                    }}
                  />

                  {CERTIFICATES_DATA.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleFocusTickClick(i)}
                      className="py-1 px-0.5 focus:outline-none cursor-pointer flex flex-col items-center"
                    >
                      <div
                        className={`w-[1px] rounded-full transition-all duration-150 ${
                          i === focusedIndex ? 'h-3.5 opacity-100' : 'h-2 sm:h-2.5 opacity-30 hover:opacity-75'
                        }`}
                        style={{ backgroundColor: 'var(--active-accent)' }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Top-Right: ABOUT & PROJECTS ✕ */}
              <div
                className="flex items-center gap-6 font-mono text-[11px] sm:text-xs tracking-[0.2em] uppercase"
                style={{ color: 'var(--active-accent)' }}
              >
                <button
                  onClick={() => setAboutOpenSafe(true)}
                  className="group relative transition-colors cursor-pointer focus:outline-none"
                >
                  <span>ABOUT</span>
                  <span
                    className="block w-full h-[1px] mt-0.5"
                    style={{ backgroundColor: 'var(--active-accent)' }}
                  />
                </button>
                <button
                  onClick={() => handleCloseDetail(true)}
                  className="group flex items-center gap-1.5 transition-colors cursor-pointer focus:outline-none opacity-85 hover:opacity-100"
                >
                  <span>PROJECTS</span>
                  <span className="transition-transform group-hover:rotate-90">✕</span>
                </button>
              </div>
            </div>

            {/* LAYER 0: ATMOSPHERIC BACKDROP TYPOGRAPHY (z-0, STRICTLY BEHIND CARDS) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0 overflow-hidden px-4 sm:px-8">
              <div
                ref={posterTitleRef}
                className="flex flex-col items-center justify-center select-none will-change-transform text-center pointer-events-none w-full"
                style={{ color: 'var(--active-accent)', opacity: 0.22 }}
              >
                <span
                  className="font-display font-black text-[clamp(3.5rem,8.5vw,7.8rem)] uppercase leading-[0.88] whitespace-nowrap block"
                  style={{
                    fontFamily: 'Impact, "Arial Narrow", "Arial Black", Anton, sans-serif',
                    fontStretch: 'condensed',
                    letterSpacing: '0.16em',
                  }}
                >
                  {currentCert.posterLine1 || currentCert.title}
                </span>
                {currentCert.posterLine2 && (
                  <span
                    className="font-display font-black text-[clamp(3.5rem,8.5vw,7.8rem)] uppercase leading-[0.88] whitespace-nowrap block mt-1 sm:mt-2"
                    style={{
                      fontFamily: 'Impact, "Arial Narrow", "Arial Black", Anton, sans-serif',
                      fontStretch: 'condensed',
                      letterSpacing: '0.16em',
                    }}
                  >
                    {currentCert.posterLine2}
                  </span>
                )}
              </div>
            </div>

            {/* LAYER 10: CONTINUOUS 30-CARD HORIZONTAL STAGE (FULL rAF + BELL CURVE SCALING) */}
            <div
              ref={focusTrackRef}
              className="relative flex-1 w-full h-full overflow-visible select-none pointer-events-auto"
            >
              {CERTIFICATES_DATA.map((cert, idx) => (
                <div
                  key={cert.id}
                  ref={(el) => {
                    focusCardRefs.current[idx] = el;
                  }}
                  onClick={() => handleFocusCardClick(idx)}
                  className="absolute top-1/2 left-0 -translate-y-1/2 flex items-center justify-center cursor-pointer select-none will-change-transform"
                  style={{
                    width: `${cardW}px`,
                    height: `${cardH}px`,
                    transformOrigin: 'center center',
                  }}
                  title={idx === focusedIndex ? 'Klik untuk memperbesar gambar sertifikat' : `Lihat: ${cert.title}`}
                >
                  <div className="w-full h-full overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] flex items-center justify-center p-2 sm:p-2.5 bg-white border border-black/5">
                    <img
                      ref={(el) => {
                        focusImageRefs.current[idx] = el;
                      }}
                      src={cert.imageUrl}
                      alt={cert.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain object-center pointer-events-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* LAYER 20: METADATA + OPEN PDF ACTION + DESCRIPTION ROW */}
            <div
              ref={focusMetaRef}
              className="w-full max-w-[58vw] md:max-w-[50vw] mx-auto mt-2 sm:mt-4 flex items-start justify-between z-20 shrink-0"
              style={{ color: 'var(--active-accent)' }}
            >
              {/* Left: 3-Row Metadata Table */}
              <div className="hidden md:flex flex-col gap-1 font-mono text-[9px] tracking-[0.2em] uppercase opacity-90 text-left min-w-[180px]">
                <div className="flex items-center gap-2.5">
                  <span className="opacity-40">A</span>
                  <span className="opacity-60 w-20">COMPLETED</span>
                  <span className="font-semibold">{currentCert.year}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="opacity-40">B</span>
                  <span className="opacity-60 w-20">CATEGORY</span>
                  <span className="font-semibold truncate max-w-[130px]">{currentCert.category.split('&')[0].trim()}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="opacity-40">C</span>
                  <span className="opacity-60 w-20">ISSUER</span>
                  <span className="font-semibold truncate max-w-[130px]">
                    {currentCert.issuer.split('&')[0].split('(')[0].trim()}
                  </span>
                </div>
              </div>

              {/* Center: OPEN PDF | + */}
              <div className="flex flex-col items-center gap-1 select-none mx-auto md:mx-0">
                <button
                  onClick={() => {
                    if (currentCert.pdfUrl) {
                      window.open(currentCert.pdfUrl, '_blank', 'noopener,noreferrer');
                    } else {
                      setZoomImageSafe(currentCert.imageUrl);
                    }
                  }}
                  className="group flex flex-col items-center cursor-pointer focus:outline-none"
                >
                  <span
                    className="font-mono text-[10.5px] sm:text-[11.5px] tracking-[0.26em] uppercase pb-0.5 border-b transition-all duration-200 group-hover:opacity-75"
                    style={{
                      borderColor: 'var(--active-accent)',
                      color: 'var(--active-accent)',
                    }}
                  >
                    OPEN PDF
                  </span>
                  <span className="text-[11px] font-mono leading-none my-0.5" style={{ color: 'var(--active-accent)' }}>
                    |
                  </span>
                  <span
                    className="text-[14px] font-light leading-none group-hover:scale-125 transition-transform"
                    style={{ color: 'var(--active-accent)' }}
                  >
                    +
                  </span>
                </button>
              </div>

              {/* Right: Project Summary Description */}
              <div className="hidden md:flex flex-col items-end text-right max-w-[220px] font-mono text-[8.5px] sm:text-[9px] tracking-[0.16em] uppercase opacity-85 leading-relaxed">
                <p>{currentCert.description.slice(0, 90).toUpperCase()}...</p>
              </div>
            </div>

            {/* LAYER 30: FIXED BOTTOM BAR */}
            <div
              ref={focusFooterRef}
              className="w-full flex items-end justify-between px-6 sm:px-12 pb-6 sm:pb-8 z-30 shrink-0 font-mono text-[9px] sm:text-[10px] tracking-[0.22em] uppercase"
              style={{ color: 'var(--active-accent)' }}
            >
              <div className="flex flex-col leading-relaxed pointer-events-none opacity-85">
                <span>INDEPENDENT DEVELOPER</span>
                <span>AVAILABLE DEC. 2026</span>
              </div>

              <div className="flex flex-col items-end gap-1.5 opacity-90">
                <a
                  href="mailto:abudevis5@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center gap-1.5 px-2 py-0.5 -mr-2 rounded-full hover:bg-black/10 transition-all duration-300"
                  style={{ color: 'var(--active-accent)' }}
                >
                  <span className="relative">
                    EMAIL
                    <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] group-hover:w-full transition-all duration-300 ease-out" style={{ backgroundColor: 'var(--active-accent)' }} />
                  </span>
                  <span className="text-[8px] opacity-60 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300">↗</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/abu-devis-jalaluddin-rumi-5475a33b6/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center gap-1.5 px-2 py-0.5 -mr-2 rounded-full hover:bg-black/10 transition-all duration-300"
                  style={{ color: 'var(--active-accent)' }}
                >
                  <span className="relative">
                    LINKEDIN
                    <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] group-hover:w-full transition-all duration-300 ease-out" style={{ backgroundColor: 'var(--active-accent)' }} />
                  </span>
                  <span className="text-[8px] opacity-60 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300">↗</span>
                </a>
                <a
                  href="https://github.com/DevisRooomi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center gap-1.5 px-2 py-0.5 -mr-2 rounded-full hover:bg-black/10 transition-all duration-300"
                  style={{ color: 'var(--active-accent)' }}
                >
                  <span className="relative">
                    GITHUB
                    <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] group-hover:w-full transition-all duration-300 ease-out" style={{ backgroundColor: 'var(--active-accent)' }} />
                  </span>
                  <span className="text-[8px] opacity-60 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300">↗</span>
                </a>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═════════════════════════════════════════════════════════════════════
          STATE 3: OVERLAY [ABOUT] / [ACCREDITED DOSSIER] (AWWWARDS-STYLE STATS)
          ═════════════════════════════════════════════════════════════════════ */}
      {aboutOpen && (
        <div className="absolute inset-0 z-50 bg-[#141414]/98 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-12 md:p-16 animate-[fadeIn_0.3s_ease-out] overflow-y-auto">
          {/* Top Bar */}
          <div className="w-full flex items-center justify-between border-b border-stone-800 pb-4 shrink-0">
            <span className="font-mono text-xs tracking-[0.24em] uppercase text-stone-400">
              ACCREDITED DOSSIER // ABU DEVIS
            </span>
            <button
              onClick={closeAboutSheet}
              className="px-4 py-1.5 rounded-full border border-stone-700 hover:border-white text-stone-300 hover:text-white font-mono text-xs tracking-widest transition-all cursor-pointer"
            >
              [CLOSE] ✕
            </button>
          </div>

          {/* About Body: 3-Column Dossier Grid */}
          <div className="w-full max-w-6xl mx-auto my-auto py-8 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 text-left">
            {/* Column 1: Awwwards-Style Credential Metrics */}
            <div className="flex flex-col space-y-4">
              <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-stone-500 border-b border-stone-800 pb-2">
                ACADEMIC & CREDENTIAL METRICS
              </span>
              <div className="space-y-3 font-mono text-xs sm:text-[13px] text-stone-300">
                <div className="flex justify-between items-center py-1 border-b border-stone-900">
                  <span className="text-white font-bold">{CERTIFICATES_DATA.length}</span>
                  <span className="text-stone-400">Total Verified Records</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-stone-900">
                  <span className="text-amber-400 font-bold">593</span>
                  <span className="text-stone-400">TOAFL Advanced Score (C1)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-stone-900">
                  <span className="text-emerald-400 font-bold">4x</span>
                  <span className="text-stone-400">Juara 1 & Peringkat 1 Awards</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-stone-900">
                  <span className="text-sky-400 font-bold">9 Juz</span>
                  <span className="text-stone-400">Tartil Hafalan Al-Qur'an</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-stone-900">
                  <span className="text-white font-bold">97.7%</span>
                  <span className="text-stone-400">Peak Academic Standing</span>
                </div>
              </div>
            </div>

            {/* Column 2: Accredited Categories (A–Z) */}
            <div className="flex flex-col space-y-4">
              <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-stone-500 border-b border-stone-800 pb-2">
                COMPETENCY CATEGORIES (A–Z)
              </span>
              <ul className="space-y-1.5 font-mono text-xs text-stone-400">
                <li className="hover:text-white transition-colors">• Academic Excellence (5 Records)</li>
                <li className="hover:text-white transition-colors">• Arabic Linguistics & Syntax (3 Records)</li>
                <li className="hover:text-white transition-colors">• Islamic Jurisprudence & Matn (2 Records)</li>
                <li className="hover:text-white transition-colors">• Mathematics & Realistic Logic (1 Record)</li>
                <li className="hover:text-white transition-colors">• Oratory & Public Speaking (1 Record)</li>
                <li className="hover:text-white transition-colors">• Quranic Memorization & Tartil (2 Records)</li>
                <li className="hover:text-white transition-colors">• Sports & Athletic Focus (1 Record)</li>
                <li className="hover:text-white transition-colors">• Leadership & Service (1 Record)</li>
              </ul>
            </div>

            {/* Column 3: Accredited Issuing Institutions */}
            <div className="flex flex-col space-y-4">
              <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-stone-500 border-b border-stone-800 pb-2">
                VERIFIED ISSUING INSTITUTIONS
              </span>
              <ul className="space-y-1.5 font-mono text-xs text-stone-400">
                <li className="hover:text-white transition-colors">→ Lisanul Arab Pare Kediri (Diknas RI)</li>
                <li className="hover:text-white transition-colors">→ Ma'had Al-Furqon Al-Islami Gresik</li>
                <li className="hover:text-white transition-colors">→ Kementerian Agama Republik Indonesia</li>
                <li className="hover:text-white transition-colors">→ Klinik Pendidikan MIPA (KPM)</li>
                <li className="hover:text-white transition-colors">→ MTs Negeri 1 Lumajang</li>
                <li className="hover:text-white transition-colors">→ Dinas Pendidikan Kabupaten Lumajang</li>
                <li className="hover:text-white transition-colors">→ Nusantara Archery Club & Malang Open</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Contact */}
          <div className="w-full flex items-center justify-between border-t border-stone-800 pt-4 font-mono text-[10px] text-stone-500 shrink-0">
            <span>ALL RIGHTS RESERVED ABU DEVIS JALALUDDIN RUMI 2026©</span>
            <div className="flex items-center gap-3">
              <a
                href="mailto:abudevis5@gmail.com"
                className="hover:text-white transition-colors"
              >
                EMAIL ↗
              </a>
              <span>•</span>
              <a
                href="https://www.linkedin.com/in/abu-devis-jalaluddin-rumi-5475a33b6/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                LINKEDIN ↗
              </a>
              <span>•</span>
              <a
                href="https://github.com/DevisRooomi"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                GITHUB ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          FULL RESOLUTION IMAGE ZOOM LIGHTBOX
          ═════════════════════════════════════════════════════════════════════ */}
      {zoomImage && (
        <div
          onClick={closeZoomImage}
          className="fixed inset-0 z-[130] bg-black/92 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-8 cursor-zoom-out animate-[fadeIn_0.2s_ease-out]"
        >
          <div className="absolute top-6 right-6 sm:top-8 sm:right-10 flex items-center gap-2 font-mono text-[10px] tracking-[0.24em] uppercase text-stone-400 bg-stone-900/80 px-4 py-1.5 rounded-full border border-stone-800 shadow-xl pointer-events-none">
            <span>TUTUP</span>
            <span>✕</span>
          </div>
          <img
            src={zoomImage}
            alt="Perbesaran Sertifikat"
            className="max-w-[92vw] max-h-[88vh] object-contain rounded shadow-[0_25px_60px_rgba(0,0,0,0.85)] border border-white/10"
          />
        </div>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default Chapter03ReceiptsModal;
