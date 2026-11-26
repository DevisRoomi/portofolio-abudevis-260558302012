import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { DevisSignatureSvg } from './DevisSignatureSvg';

interface PreloaderProps {
  onLoadingComplete: () => void;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRELOADER — PHOTOREALISTIC WHITE DOVES & SKY RIBBONS (DEVIS® EDITION)
   Ultra-Clean, Unhurried (~5.1s) Cinema — Zero Percentage / Bar Clutter:
   1. Pixel-identical Hero Cobalt Sky canvas (#7DD3FC -> #38BDF8 -> #2563EB ->
      #1538A6) for a 100% seamless sky dissolve directly into Hero.
   2. 4 Photorealistic Articulated Side-Gliding White Doves on 60fps HiDPI
      <canvas>, crossing full screen Left->Right AND Right->Left upright with
      real feathered 2-wing flapping and silky luminous white wind ribbons.
   3. 1 Curious Front-Facing Hovering White Dove (4 articulated WebP layers in
      3D perspective): swoops toward camera, flaps real feathered wings while
      hovering in mid-air, playfully cocks its head side-to-side like a curious
      bird peeking at the screen, then swoops gracefully upward off-screen.
   4. 8 Warm Multilingual Greetings (Arabic, Javanese, Indonesian, English,
      French, Chinese, Russian, Indonesian Finale) -> White Devis Signature
      (starts `opacity-0` so ZERO frame-0 flash!) -> Seamless Sky Dissolve.
   ═══════════════════════════════════════════════════════════════════════════ */

interface GreetingItem {
  text: string;
  italic: boolean;
  fontFamily: string;
}

const GREETINGS: GreetingItem[] = [
  {
    text: 'السَّلَامُ عَلَيْكُمْ',
    italic: false,
    fontFamily: '"Amiri", "Instrument Serif", "Noto Naskh Arabic", Georgia, serif',
  },
  {
    text: 'Sugeng Rawuh',
    italic: true,
    fontFamily: '"Instrument Serif", "Playfair Display", Georgia, serif',
  },
  {
    text: 'Halo',
    italic: true,
    fontFamily: '"Instrument Serif", "Playfair Display", Georgia, serif',
  },
  {
    text: 'Hello',
    italic: true,
    fontFamily: '"Instrument Serif", "Playfair Display", Georgia, serif',
  },
  {
    text: 'Bonjour',
    italic: true,
    fontFamily: '"Instrument Serif", "Playfair Display", Georgia, serif',
  },
  {
    text: '你好',
    italic: false,
    fontFamily: '"Noto Serif SC", "Songti SC", "STSong", "Instrument Serif", serif',
  },
  {
    text: 'Привет',
    italic: true,
    fontFamily: '"Playfair Display", "Instrument Serif", Georgia, serif',
  },
  {
    text: 'Selamat Datang.',
    italic: true,
    fontFamily: '"Instrument Serif", "Playfair Display", Georgia, serif',
  },
];

// Unified 300x348 sprite pivots for articulated side-gliding dove WebPs
const SIDE_SPRITE_W = 300;
const SIDE_SPRITE_H = 348;
const SIDE_NEAR_PIVOT_X = 168;
const SIDE_NEAR_PIVOT_Y = 212;
const SIDE_FAR_PIVOT_X = 158;
const SIDE_FAR_PIVOT_Y = 198;

interface TrailPoint {
  x: number;
  y: number;
}

interface SideDoveSpec {
  dir: 1 | -1; // 1 = Left -> Right, -1 = Right -> Left
  startYFrac: number;
  endYFrac: number;
  arcLiftFrac: number;
  delaySec: number;
  durationSec: number;
  scale: number; // multiplier on 300x348 sprite
  depth: number; // 0.65 (far) .. 1.05 (hero foreground)
  flapHz: number;
  flapOffset: number;
  waveAmp: number;
  waveFreq: number;
}

interface ActiveSideDove extends SideDoveSpec {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: TrailPoint[];
  maxTrail: number;
}

interface SideSprites {
  farWing: HTMLImageElement;
  body: HTMLImageElement;
  nearWing: HTMLImageElement;
  ready: boolean;
}

function drawSilkyWindRibbon(ctx: CanvasRenderingContext2D, dove: ActiveSideDove) {
  const pts = dove.trail;
  if (pts.length < 3) return;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const depthAlpha = Math.min(1, 0.55 + dove.depth * 0.36);

  for (let i = 1; i < pts.length; i++) {
    const t = i / (pts.length - 1);
    const p0 = pts[i - 1];
    const p1 = pts[i];
    if (Math.hypot(p1.x - p0.x, p1.y - p0.y) > 95) continue;

    const fade = Math.pow(t, 1.75);
    const lineW = (0.35 + fade * 2.1) * dove.depth;
    const alpha = fade * 0.62 * depthAlpha;

    if (dove.depth > 0.8 && i % 2 === 0) {
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = `rgba(186, 230, 253, ${(alpha * 0.36).toFixed(3)})`;
      ctx.lineWidth = lineW * 3.0;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
    ctx.lineWidth = lineW;
    ctx.stroke();
  }

  ctx.restore();
}

function drawPhotorealisticSideDove(
  ctx: CanvasRenderingContext2D,
  dove: ActiveSideDove,
  sprites: SideSprites,
  flapPhase: number
) {
  if (!sprites.ready) return;

  const sc = dove.scale;
  const facing = dove.vx >= 0 ? 1 : -1;

  // Keep every gliding dove gracefully upright! Clamp pitch gently to ±18°
  const rawPitch = Math.atan2(dove.vy, Math.abs(dove.vx) + 0.01);
  const pitch = Math.max(-0.31, Math.min(0.31, rawPitch * 0.58));

  // Aerodynamic wingbeat wave (slightly stronger downstroke, smooth glide transition)
  const rawNear = Math.sin(flapPhase) + 0.14 * Math.sin(flapPhase * 2);
  const rawFar = Math.sin(flapPhase + 0.42) + 0.14 * Math.sin((flapPhase + 0.42) * 2);

  // Maps smoothly from +1.0 (full raised upstroke) -> -0.68 (photorealistic downstroke)
  let syNear = 0.16 + 0.78 * (rawNear / 1.14);
  let syFar = 0.16 + 0.74 * (rawFar / 1.14);
  if (Math.abs(syNear) < 0.04) syNear = syNear >= 0 ? 0.04 : -0.04;
  if (Math.abs(syFar) < 0.04) syFar = syFar >= 0 ? 0.04 : -0.04;

  const rotNear = Math.cos(flapPhase) * 0.09;
  const rotFar = Math.cos(flapPhase + 0.42) * 0.08;
  // Subtle natural vertical body lift reacting to each wing downstroke
  const liftY = Math.sin(flapPhase - 1.15) * 6.5 * sc;

  ctx.save();
  ctx.translate(dove.x, dove.y + liftY);
  ctx.scale(facing * sc, sc);
  ctx.rotate(pitch);

  const depthAlpha = Math.min(1, 0.56 + dove.depth * 0.44);
  ctx.globalAlpha = depthAlpha;

  if (dove.depth > 0.85) {
    ctx.shadowColor = 'rgba(15, 38, 112, 0.24)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
  }

  // 1. Far Wing (rendered behind body, pivoting around far shoulder joint)
  ctx.save();
  const farDx = SIDE_FAR_PIVOT_X - SIDE_NEAR_PIVOT_X;
  const farDy = SIDE_FAR_PIVOT_Y - SIDE_NEAR_PIVOT_Y;
  ctx.translate(farDx, farDy);
  ctx.rotate(rotFar);
  ctx.scale(1, syFar);
  ctx.drawImage(
    sprites.farWing,
    -SIDE_FAR_PIVOT_X,
    -SIDE_FAR_PIVOT_Y,
    SIDE_SPRITE_W,
    SIDE_SPRITE_H
  );
  ctx.restore();

  // 2. Sculpted Photorealistic Dove Body, Head & Fanned Tail
  ctx.drawImage(
    sprites.body,
    -SIDE_NEAR_PIVOT_X,
    -SIDE_NEAR_PIVOT_Y,
    SIDE_SPRITE_W,
    SIDE_SPRITE_H
  );

  // 3. Near Wing (rendered in front of body, pivoting smoothly around near shoulder joint)
  ctx.save();
  ctx.rotate(rotNear);
  ctx.scale(1, syNear);
  ctx.drawImage(
    sprites.nearWing,
    -SIDE_NEAR_PIVOT_X,
    -SIDE_NEAR_PIVOT_Y,
    SIDE_SPRITE_W,
    SIDE_SPRITE_H
  );
  ctx.restore();

  ctx.restore();
}

export const Preloader: React.FC<PreloaderProps> = ({ onLoadingComplete }) => {
  const [greetingIdx, setGreetingIdx] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const greetingWrapRef = useRef<HTMLDivElement>(null);
  const greetingTextRef = useRef<HTMLSpanElement>(null);
  const sigWrapRef = useRef<HTMLDivElement>(null);

  // Curious Front-Facing Hovering Hero Dove Refs
  const heroDoveWrapRef = useRef<HTMLDivElement>(null);
  const heroDoveBobRef = useRef<HTMLDivElement>(null);
  const heroDoveWingLRef = useRef<HTMLImageElement>(null);
  const heroDoveWingRRef = useRef<HTMLImageElement>(null);
  const heroDoveBodyRef = useRef<HTMLImageElement>(null);
  const heroDoveHeadRef = useRef<HTMLImageElement>(null);
  const heroFlapFreqRef = useRef<number>(3.0);

  const completedRef = useRef(false);

  // Silky relaxed vertical slide when each multilingual greeting appears
  useEffect(() => {
    if (!greetingTextRef.current) return;
    gsap.fromTo(
      greetingTextRef.current,
      { yPercent: 52, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.34, ease: 'power3.out', overwrite: 'auto' }
    );
  }, [greetingIdx]);

  // ── 1. 60FPS PHOTOREALISTIC CROSS-SCREEN SIDE-GLIDING DOVES + CURIOUS DOVE WINGBEAT ENGINE ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Preload articulated side-profile photorealistic dove WebP layers (~22 KB total)
    const farWing = new Image();
    const body = new Image();
    const nearWing = new Image();
    const sprites: SideSprites = { farWing, body, nearWing, ready: false };

    let loadedCount = 0;
    const onImgReady = () => {
      loadedCount += 1;
      if (loadedCount >= 3) {
        sprites.ready = true;
      }
    };
    farWing.onload = onImgReady;
    body.onload = onImgReady;
    nearWing.onload = onImgReady;
    farWing.src = '/assets/preloader/dove_side_wing_far.webp';
    body.src = '/assets/preloader/dove_side_body.webp';
    nearWing.src = '/assets/preloader/dove_side_wing_near.webp';
    if (farWing.complete && body.complete && nearWing.complete) {
      sprites.ready = true;
    }

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = window.innerWidth;
    let h = window.innerHeight;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const isMobile = w < 640;
    const scaleFactor = isMobile ? 0.68 : 1;

    // 4 Choreographed Photorealistic Side-Gliding Doves Crossing Full Width (2 L->R, 2 R->L!)
    const specs: SideDoveSpec[] = [
      // 1. High Distant Dove: Left -> Right across upper horizon (calm opening movement)
      {
        dir: 1,
        startYFrac: 0.24,
        endYFrac: 0.16,
        arcLiftFrac: -0.07,
        delaySec: 0.0,
        durationSec: 4.9,
        scale: 0.34 * scaleFactor,
        depth: 0.68,
        flapHz: 2.15,
        flapOffset: 0.4,
        waveAmp: 14,
        waveFreq: 2.1,
      },
      // 2. Hero Foreground Dove #1: Left -> Right sweeping grandly from lower-left -> upper-right!
      {
        dir: 1,
        startYFrac: 0.80,
        endYFrac: 0.24,
        arcLiftFrac: -0.13,
        delaySec: 0.15,
        durationSec: 4.4,
        scale: 0.62 * scaleFactor,
        depth: 1.05,
        flapHz: 1.85,
        flapOffset: 1.3,
        waveAmp: 20,
        waveFreq: 1.9,
      },
      // 3. Hero Foreground Dove #2: RIGHT -> LEFT gliding majestically across upper-right -> lower-left!
      {
        dir: -1,
        startYFrac: 0.24,
        endYFrac: 0.74,
        arcLiftFrac: -0.09,
        delaySec: 0.78,
        durationSec: 4.35,
        scale: 0.56 * scaleFactor,
        depth: 0.98,
        flapHz: 1.95,
        flapOffset: 2.7,
        waveAmp: 18,
        waveFreq: 2.0,
      },
      // 4. Mid-Sky Finale Dove: RIGHT -> LEFT sweeping cleanly across lower-right -> mid-left!
      {
        dir: -1,
        startYFrac: 0.74,
        endYFrac: 0.26,
        arcLiftFrac: -0.11,
        delaySec: 1.72,
        durationSec: 3.9,
        scale: 0.46 * scaleFactor,
        depth: 0.86,
        flapHz: 2.05,
        flapOffset: 4.2,
        waveAmp: 16,
        waveFreq: 2.1,
      },
    ];

    const doves: ActiveSideDove[] = specs.map((spec) => ({
      ...spec,
      x: spec.dir === 1 ? -160 : w + 160,
      y: h * spec.startYFrac,
      vx: spec.dir * 4,
      vy: 0,
      trail: [],
      maxTrail: Math.round(58 + spec.depth * 26),
    }));

    const startTime = performance.now();
    let prevTime = startTime;
    let heroFlapPhase = 0;
    let animId = 0;

    const tick = (now: number) => {
      const dtSec = Math.min(0.05, (now - prevTime) / 1000);
      prevTime = now;
      const elapsedSec = (now - startTime) / 1000;

      ctx.clearRect(0, 0, w, h);

      // Draw far-to-near so foreground hero doves cleanly overlap distant ones
      const ordered = [...doves].sort((a, b) => a.depth - b.depth);

      for (let i = 0; i < ordered.length; i++) {
        const d = ordered[i];
        const localT = (elapsedSec - d.delaySec) / d.durationSec;

        if (localT < 0) continue;

        const margin = d.scale * SIDE_SPRITE_W * 0.9 + 55;
        const startX = d.dir === 1 ? -margin : w + margin;
        const endX = d.dir === 1 ? w + margin : -margin;
        const clampedT = Math.min(1.16, localT);

        // Airy organic glide velocity across entire screen
        const easeX = clampedT + Math.sin(clampedT * Math.PI) * 0.032;
        const nextX = startX + (endX - startX) * easeX;

        const baseLineY = h * (d.startYFrac + (d.endYFrac - d.startYFrac) * clampedT);
        const archY = Math.sin(Math.min(1, clampedT) * Math.PI) * h * d.arcLiftFrac;
        const waveY = Math.sin(elapsedSec * d.waveFreq + d.flapOffset) * d.waveAmp;
        const nextY = baseLineY + archY + waveY;

        if (d.trail.length > 0) {
          d.vx = nextX - d.x;
          d.vy = nextY - d.y;
        }
        d.x = nextX;
        d.y = nextY;

        // Attach silky wind ribbon right behind the dove's fanned tail feathers
        const facing = d.vx >= 0 ? 1 : -1;
        const tailX = d.x - facing * (114 * d.scale);
        const tailY = d.y + 70 * d.scale;
        d.trail.push({ x: tailX, y: tailY });
        if (d.trail.length > d.maxTrail) {
          d.trail.shift();
        }

        drawSilkyWindRibbon(ctx, d);

        if (d.x > -margin * 1.15 && d.x < w + margin * 1.15) {
          const flapPhase = elapsedSec * d.flapHz * Math.PI * 2 + d.flapOffset;
          drawPhotorealisticSideDove(ctx, d, sprites, flapPhase);
        }
      }

      // ── Continuous 60fps 3D Hover Wingbeat for the Curious Front-Facing Hero Dove ──
      heroFlapPhase += dtSec * heroFlapFreqRef.current * Math.PI * 2;
      // Sharp aerodynamic hovering downstroke + graceful recovery upstroke
      const rawBeat = Math.sin(heroFlapPhase) + 0.2 * Math.sin(heroFlapPhase * 2);
      const beat = rawBeat / 1.2; // -1 (full downstroke) .. +1 (full high upstroke)

      if (heroDoveWingLRef.current && heroDoveWingRRef.current) {
        // Left wing sweeps forward & downward in 3D space on downstroke
        const lRotZ = -14 + beat * 24; // -38deg (downstroke) .. +10deg (upstroke)
        const lRotY = 12 - beat * 26; // sweeps forward toward camera!
        const lScaleY = 0.92 + beat * 0.1;

        const rRotZ = 14 - beat * 24; // +38deg (downstroke) .. -10deg (upstroke)
        const rRotY = -12 + beat * 26;
        const rScaleY = 0.92 + beat * 0.1;

        heroDoveWingLRef.current.style.transform = `rotateZ(${lRotZ.toFixed(2)}deg) rotateY(${lRotY.toFixed(2)}deg) scaleY(${lScaleY.toFixed(3)})`;
        heroDoveWingRRef.current.style.transform = `rotateZ(${rRotZ.toFixed(2)}deg) rotateY(${rRotY.toFixed(2)}deg) scaleY(${rScaleY.toFixed(3)})`;
      }

      if (heroDoveBobRef.current) {
        // Natural hover cushion: body lifts gently right after each downstroke
        const bobY = Math.sin(heroFlapPhase - 1.1) * 7.5;
        const microSwayX = Math.sin(elapsedSec * 1.7) * 4.5;
        heroDoveBobRef.current.style.transform = `translate3d(${microSwayX.toFixed(2)}px, ${bobY.toFixed(2)}px, 0)`;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // ── 2. UNHURRIED 8-LANGUAGE + CURIOUS HOVER DOVE + SIGNATURE CINEMA (~5.15s) ──
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const triggerComplete = () => {
      if (!completedRef.current) {
        completedRef.current = true;
        onLoadingComplete();
      }
    };

    if (prefersReducedMotion) {
      const quickTimer = setTimeout(triggerComplete, 200);
      return () => clearTimeout(quickTimer);
    }

    // Failsafe timeout for backgrounded/throttled browser tabs
    const safetyTimer = setTimeout(triggerComplete, 7400);

    // Comfortable human-readable cadence across all 8 languages, resting warmly on "Selamat Datang."
    const greetingScheduleMs = [540, 970, 1370, 1770, 2200, 2630, 3060];
    const greetingTimers = greetingScheduleMs.map((ms, idx) =>
      setTimeout(() => {
        setGreetingIdx(idx + 1);
      }, ms)
    );

    const ctx = gsap.context(() => {
      const sigPaths = gsap.utils.toArray<SVGPathElement>(
        '.sig-stroke',
        sigWrapRef.current || undefined
      );

      sigPaths.forEach((path) => {
        const len = Math.ceil(path.getTotalLength());
        gsap.set(path, {
          strokeDasharray: len,
          strokeDashoffset: len,
        });
      });

      if (sigWrapRef.current) {
        gsap.set(sigWrapRef.current, { opacity: 0, scale: 0.94, y: 14 });
      }

      if (heroDoveWrapRef.current) {
        gsap.set(heroDoveWrapRef.current, {
          x: -185,
          y: -135,
          scale: 0.44,
          rotation: -14,
          opacity: 0,
        });
      }

      const tl = gsap.timeline({
        onComplete: triggerComplete,
      });

      // ── CURIOUS FRONT-FACING HOVERING HERO DOVE CHOREOGRAPHY ──
      if (heroDoveWrapRef.current && heroDoveHeadRef.current && heroDoveBodyRef.current) {
        // Swoop gently in from upper-left sky & brake into mid-air hover facing visitor (0.22s -> 1.12s)
        tl.to(
          heroDoveWrapRef.current,
          {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
          },
          0.22
        );

        // Curious Head-Cock #1 ("Eh, siapa nih?" — crisp avian head tilt left -18deg + staring pause)
        tl.to(
          heroDoveHeadRef.current,
          { rotation: -18, duration: 0.22, ease: 'back.out(2.2)' },
          1.22
        );
        tl.to(
          heroDoveBodyRef.current,
          { rotation: -3.5, duration: 0.26, ease: 'power2.out' },
          1.22
        );

        // Curious Head-Cock #2 + Lean Slightly Closer to Screen ("Hmm, penasaran!" -> +20deg right!)
        tl.to(
          heroDoveHeadRef.current,
          { rotation: 20, duration: 0.24, ease: 'back.out(2.4)' },
          1.92
        );
        tl.to(
          heroDoveBodyRef.current,
          { rotation: 4, duration: 0.28, ease: 'power2.out' },
          1.92
        );
        tl.to(
          heroDoveWrapRef.current,
          { scale: 1.11, x: 16, y: 10, duration: 0.45, ease: 'power2.out' },
          1.92
        );

        // Curious Double-Take #3 (cute inquisitive tilt back left -14deg)
        tl.to(
          heroDoveHeadRef.current,
          { rotation: -14, duration: 0.2, ease: 'back.out(2.0)' },
          2.68
        );
        tl.to(
          heroDoveBodyRef.current,
          { rotation: -2.5, duration: 0.24, ease: 'power2.out' },
          2.68
        );

        // Alert Straighten & Energetic Takeoff Ascent toward Upper-Right Sky (3.24s -> 4.24s)
        tl.to(
          heroDoveHeadRef.current,
          { rotation: 0, duration: 0.18, ease: 'power2.out' },
          3.24
        );
        tl.to(
          heroDoveBodyRef.current,
          { rotation: 0, duration: 0.18, ease: 'power2.out' },
          3.24
        );
        tl.call(
          () => {
            heroFlapFreqRef.current = 4.2; // crisp burst of rapid takeoff wingbeats
          },
          undefined,
          3.36
        );
        tl.to(
          heroDoveWrapRef.current,
          {
            x: 360,
            y: -290,
            scale: 0.52,
            rotation: 15,
            opacity: 0,
            duration: 0.84,
            ease: 'power2.in',
          },
          3.42
        );
      }

      // ── 1. Act 1 -> Act 2: Greetings drift gently upward & fade out cleanly (3.74s -> 4.02s) ──
      if (greetingWrapRef.current) {
        tl.to(
          greetingWrapRef.current,
          { opacity: 0, y: -18, duration: 0.28, ease: 'power2.in' },
          3.74
        );
      }

      // ── 2. Act 2: Authentic White Devis Signature fades in & draws calmly in open sky (3.92s -> 4.62s) ──
      if (sigWrapRef.current) {
        tl.to(
          sigWrapRef.current,
          { opacity: 1, scale: 1, y: 0, duration: 0.34, ease: 'power2.out' },
          3.9
        );
      }

      if (sigPaths.length > 0) {
        const strokeWindow = 0.66;
        const perStroke = strokeWindow / sigPaths.length;
        sigPaths.forEach((path, idx) => {
          tl.to(
            path,
            {
              strokeDashoffset: 0,
              duration: perStroke * 1.55,
              ease: 'power1.inOut',
            },
            3.94 + idx * perStroke * 0.8
          );
        });
      }

      // ── 3. Act 3: Brief poetic hold, then Signature lifts & Cobalt Sky dissolves seamlessly into Hero! ──
      if (sigWrapRef.current) {
        tl.to(
          sigWrapRef.current,
          { opacity: 0, y: -16, scale: 1.02, duration: 0.32, ease: 'power2.in' },
          4.68
        );
      }

      if (rootRef.current) {
        tl.to(
          rootRef.current,
          { opacity: 0, duration: 0.42, ease: 'power2.inOut' },
          4.76
        );
      }
    }, rootRef);

    return () => {
      clearTimeout(safetyTimer);
      greetingTimers.forEach(clearTimeout);
      ctx.revert();
    };
  }, [onLoadingComplete]);

  const currentGreeting = GREETINGS[greetingIdx] ?? GREETINGS[0];

  return (
    <div
      ref={rootRef}
      aria-label="Memuat portofolio Abu Devis"
      className="fixed inset-0 z-[9999] pointer-events-auto overflow-hidden select-none text-white"
      style={{
        // Pixel-identical match to 01_HeroSection.tsx Cobalt Sky for 100% seamless sky dissolve!
        background:
          'radial-gradient(ellipse at 50% 44%, #7DD3FC 0%, #38BDF8 26%, #2563EB 58%, #1D4ED8 80%, #1538A6 100%)',
      }}
    >
      {/* Matching Hero Volumetric Sky Halo & Blueprint Hairline Grid (Pure radial-gradient — zero GPU blur bloat!) */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(460px 340px at 50% 44%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 72%), radial-gradient(380px 380px at 0% 0%, rgba(29,78,216,0.32) 0%, rgba(29,78,216,0) 72%), radial-gradient(520px 520px at 100% 100%, rgba(30,58,138,0.42) 0%, rgba(30,58,138,0) 72%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(#1D4ED8 1px, transparent 1px), linear-gradient(90deg, #1D4ED8 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Organic Film Grain matching Hero */}
      <div className="film-grain-overlay opacity-[0.04] pointer-events-none" />

      {/* ── 60FPS PHOTOREALISTIC CROSS-SCREEN SIDE-GLIDING WHITE DOVES & SILKY SKY RIBBONS ── */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 z-10 w-full h-full pointer-events-none will-change-transform"
      />

      {/* ── CURIOUS FRONT-FACING HOVERING HERO DOVE (4 ARTICULATED PHOTOREALISTIC WEBP LAYERS) ── */}
      <div
        aria-hidden="true"
        className="absolute top-[11%] left-1/2 -translate-x-1/2 sm:translate-x-0 sm:top-[15%] sm:left-[8%] md:left-[12%] lg:left-[15%] z-20 pointer-events-none"
      >
        <div
          ref={heroDoveWrapRef}
          className="opacity-0 relative w-[164px] h-[164px] sm:w-[220px] sm:h-[220px] md:w-[258px] md:h-[258px] will-change-transform drop-shadow-[0_18px_36px_rgba(12,30,90,0.28)]"
          style={{ perspective: '900px' }}
        >
          <div
            ref={heroDoveBobRef}
            className="relative w-full h-full will-change-transform"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Left Feathered Wing (pivots cleanly at left chest shoulder) */}
            <img
              ref={heroDoveWingLRef}
              src="/assets/preloader/dove_front_wing_l.webp"
              alt=""
              width={360}
              height={360}
              decoding="sync"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none will-change-transform"
              style={{ transformOrigin: '45.55% 52.22%' }}
            />

            {/* Right Feathered Wing (pivots cleanly at right chest shoulder) */}
            <img
              ref={heroDoveWingRRef}
              src="/assets/preloader/dove_front_wing_r.webp"
              alt=""
              width={360}
              height={360}
              decoding="sync"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none will-change-transform"
              style={{ transformOrigin: '60.55% 51.11%' }}
            />

            {/* Sculpted White Torso, Red Feet & Fanned Tail */}
            <img
              ref={heroDoveBodyRef}
              src="/assets/preloader/dove_front_body.webp"
              alt=""
              width={360}
              height={360}
              decoding="sync"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none will-change-transform"
              style={{ transformOrigin: '50% 55%' }}
            />

            {/* Expressive Head & Neck (cocks playfully side-to-side like a curious bird!) */}
            <img
              ref={heroDoveHeadRef}
              src="/assets/preloader/dove_front_head.webp"
              alt=""
              width={360}
              height={360}
              decoding="sync"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none will-change-transform"
              style={{ transformOrigin: '55% 48.33%' }}
            />
          </div>
        </div>
      </div>

      {/* ── ULTRA-CLEAN CENTER STAGE (NO PERCENTAGE, NO BOTTOM BAR CLUTTER!) ── */}
      <div className="relative z-30 w-full h-full flex items-center justify-center px-6 text-center pointer-events-none">
        {/* Act 1: 8-Language Warm Editorial Greeting */}
        <div
          ref={greetingWrapRef}
          className="absolute flex flex-col items-center justify-center will-change-transform"
        >
          <div className="h-20 sm:h-24 md:h-28 flex items-center justify-center overflow-hidden px-4">
            <span
              ref={greetingTextRef}
              className={`inline-block text-[36px] sm:text-[52px] md:text-[64px] font-normal text-white tracking-[-0.01em] drop-shadow-[0_6px_28px_rgba(12,30,90,0.3)] will-change-transform ${
                currentGreeting.italic ? 'italic' : 'not-italic'
              }`}
              style={{ fontFamily: currentGreeting.fontFamily }}
            >
              {currentGreeting.text}
            </span>
          </div>
        </div>

        {/* Act 2: Crisp Luminous White Devis Signature (Starts opacity-0 -> ZERO frame-0 flash!) */}
        <div
          ref={sigWrapRef}
          className="absolute opacity-0 flex flex-col items-center justify-center will-change-transform"
        >
          <DevisSignatureSvg
            className="w-[200px] sm:w-[258px] md:w-[295px] h-auto drop-shadow-[0_8px_28px_rgba(12,30,90,0.32)]"
            strokeColor="#FFFFFF"
          />
          <span className="mt-2.5 font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.28em] uppercase text-sky-100/90">
            ABU DEVIS · PORTFOLIO 26
          </span>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
