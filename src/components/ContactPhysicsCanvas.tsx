import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   CONTACT PHYSICS CANVAS — DEVIS® EDITION (PAKET A: STORY TOKENS × SWISS)
   60fps HiDPI 2D Rigid-Body Physics Playground inspired by Lusion.co:
   1. 9 Crisp Flat-Graphic Silhouettes (Paket A):
      - Swiss Classics: Solid Pebble Circle, Hollow Precision Ring, Hourglass
        Bowtie, Rounded UI Pill
      - Devis Story Tokens: Mountain Peak Triangle (Merbabu/Alpine), 4-Point
        Sparkle (Arc Reactor), Poker Diamond (Work Vault), Micro Code Discs
        (< >, { }, ⌘), plus 1–2 rare Golden Star Coins!
   2. Strict Swiss 55 / 25 / 20 Color Ratio:
      - 55% Frosted Alpine Neutrals (#E2E8F0, #CBD5E1, #94A3B8, #DBEAFE)
      - 25% Editorial Ink (#0F172A, #1E293B)
      - 20% Devis 8-Project Vibrant Pops (Cobalt, Sky, Nailong Gold, Coral,
        Tahfidz Iris, Matcha Emerald)
   3. O(n) Spatial-Grid Collision Solver + Cursor Wave Scoop & Splash +
      Iridescent Whisper Cursor Trail + Click-to-Burst + Live Zero-G Mode!
   4. Zero external physics bloat, IntersectionObserver auto-pause (0% CPU
      off-screen), and clean static layout for `prefers-reduced-motion`.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ContactPhysicsHandle {
  onPointerMove: (x: number, y: number, isDown: boolean) => void;
  onPointerLeave: () => void;
  triggerBurstAt: (x: number, y: number) => void;
  triggerHeadlineCheer: () => void;
  resetPile: () => void;
}

interface Props {
  zeroGravity: boolean;
}

type ShapeKind =
  | 'circle'
  | 'ring'
  | 'bowtie'
  | 'mountain'
  | 'sparkle'
  | 'diamond'
  | 'pill'
  | 'codeDisc'
  | 'goldenStar';

interface PhysicsBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  vRot: number;
  kind: ShapeKind;
  color: string;
  inkColor: string;
  glyph?: string;
  isBurst?: boolean;
}

interface TrailPoint {
  x: number;
  y: number;
  life: number;
}

const NEUTRAL_PALETTE = ['#E2E8F0', '#CBD5E1', '#94A3B8', '#DBEAFE', '#D6E4F0'];
const INK_PALETTE = ['#0F172A', '#1E293B'];
const PROJECT_POPS = [
  '#2563EB', // Hero Cobalt Blue
  '#0EA5E9', // Pentacart Sky Cyan
  '#FACC15', // Nailong / Basoku Gold
  '#F43F5E', // CapyQuest Coral Rose
  '#8B5CF6', // Tahfidz Iris Violet
  '#10B981', // Matchaverse Emerald
];
const CODE_GLYPHS = ['<>', '{}', '⌘'];

function pickColor(): { color: string; inkColor: string } {
  const roll = Math.random();
  if (roll < 0.55) {
    const c = NEUTRAL_PALETTE[Math.floor(Math.random() * NEUTRAL_PALETTE.length)];
    return { color: c, inkColor: '#334155' };
  }
  if (roll < 0.80) {
    const c = INK_PALETTE[Math.floor(Math.random() * INK_PALETTE.length)];
    return { color: c, inkColor: '#F8FAFC' };
  }
  const c = PROJECT_POPS[Math.floor(Math.random() * PROJECT_POPS.length)];
  const isLightPop = c === '#FACC15';
  return { color: c, inkColor: isLightPop ? '#0F172A' : '#FFFFFF' };
}

function pickShapeKind(): ShapeKind {
  const r = Math.random();
  if (r < 0.20) return 'circle';
  if (r < 0.38) return 'ring';
  if (r < 0.54) return 'bowtie';
  if (r < 0.66) return 'mountain';
  if (r < 0.76) return 'sparkle';
  if (r < 0.84) return 'diamond';
  if (r < 0.90) return 'pill';
  return 'codeDisc';
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBody(ctx: CanvasRenderingContext2D, b: PhysicsBody) {
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.rot);

  const r = b.r;

  switch (b.kind) {
    case 'circle': {
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.96, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();
      break;
    }

    case 'ring': {
      const lw = Math.max(4.5, r * 0.42);
      ctx.beginPath();
      ctx.arc(0, 0, r - lw * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = b.color;
      ctx.lineWidth = lw;
      ctx.stroke();
      break;
    }

    case 'bowtie': {
      // Iconic Lusion Hourglass Bowtie (crisp twin opposing wedges)
      const hw = r * 0.96;
      const hh = r * 0.82;
      ctx.beginPath();
      ctx.moveTo(-hw, -hh);
      ctx.lineTo(0, -hh * 0.14);
      ctx.lineTo(hw, -hh);
      ctx.lineTo(hw * 0.72, 0);
      ctx.lineTo(hw, hh);
      ctx.lineTo(0, hh * 0.14);
      ctx.lineTo(-hw, hh);
      ctx.lineTo(-hw * 0.72, 0);
      ctx.closePath();
      ctx.fillStyle = b.color;
      ctx.fill();
      break;
    }

    case 'mountain': {
      // Soft-cornered Alpine Peak Triangle (Merbabu / Lemongan nod)
      const s = r * 1.02;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.lineTo(s * 0.92, s * 0.74);
      ctx.lineTo(-s * 0.92, s * 0.74);
      ctx.closePath();
      ctx.lineJoin = 'round';
      ctx.lineWidth = r * 0.24;
      ctx.strokeStyle = b.color;
      ctx.fillStyle = b.color;
      ctx.stroke();
      ctx.fill();
      break;
    }

    case 'sparkle': {
      // Crisp 4-Point Concave Sparkle Star (Arc Reactor / Creative Spark nod)
      const outer = r * 1.06;
      const inner = r * 0.28;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a0 = (i * Math.PI) / 2;
        const aMid = a0 + Math.PI / 4;
        const aNext = a0 + Math.PI / 2;
        if (i === 0) ctx.moveTo(Math.cos(a0) * outer, Math.sin(a0) * outer);
        ctx.quadraticCurveTo(
          Math.cos(aMid) * inner,
          Math.sin(aMid) * inner,
          Math.cos(aNext) * outer,
          Math.sin(aNext) * outer
        );
      }
      ctx.closePath();
      ctx.fillStyle = b.color;
      ctx.fill();
      break;
    }

    case 'diamond': {
      // Refined Poker Vault Diamond
      const dx = r * 0.84;
      const dy = r * 1.06;
      ctx.beginPath();
      ctx.moveTo(0, -dy);
      ctx.lineTo(dx, 0);
      ctx.lineTo(0, dy);
      ctx.lineTo(-dx, 0);
      ctx.closePath();
      ctx.fillStyle = b.color;
      ctx.fill();

      // Subtle inner facet dot for craft depth
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
      ctx.fillStyle = b.inkColor;
      ctx.globalAlpha = 0.35;
      ctx.fill();
      break;
    }

    case 'pill': {
      // Clean UI Capsule Pill
      const pw = r * 1.72;
      const ph = r * 0.92;
      drawRoundedRectPath(ctx, -pw / 2, -ph / 2, pw, ph, ph / 2);
      ctx.fillStyle = b.color;
      ctx.fill();
      break;
    }

    case 'codeDisc': {
      // Micro Developer Token Disc (< >, { }, ⌘)
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.96, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();

      ctx.fillStyle = b.inkColor;
      ctx.font = `700 ${Math.round(r * 0.78)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.glyph || '⌘', 0, 1);
      break;
    }

    case 'goldenStar': {
      // Rare Easter Egg: Gleaming Golden Nailong Coin!
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.0, 0, Math.PI * 2);
      ctx.fillStyle = '#FACC15';
      ctx.fill();
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = '#0F172A';
      ctx.stroke();

      // Inner crisp 4-point star emblem
      const so = r * 0.56;
      const si = r * 0.16;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a0 = (i * Math.PI) / 2;
        const aMid = a0 + Math.PI / 4;
        const aNext = a0 + Math.PI / 2;
        if (i === 0) ctx.moveTo(Math.cos(a0) * so, Math.sin(a0) * so);
        ctx.quadraticCurveTo(
          Math.cos(aMid) * si,
          Math.sin(aMid) * si,
          Math.cos(aNext) * so,
          Math.sin(aNext) * so
        );
      }
      ctx.closePath();
      ctx.fillStyle = '#0F172A';
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

export const ContactPhysicsCanvas = forwardRef<ContactPhysicsHandle, Props>(
  ({ zeroGravity }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const zeroGRef = useRef<boolean>(zeroGravity);
    const prevZeroGRef = useRef<boolean>(zeroGravity);

    const bodiesRef = useRef<PhysicsBody[]>([]);
    const trailRef = useRef<TrailPoint[]>([]);
    const sizeRef = useRef<{ w: number; h: number }>({ w: 1280, h: 720 });
    const pointerRef = useRef<{
      x: number;
      y: number;
      lastX: number;
      lastY: number;
      vx: number;
      vy: number;
      active: boolean;
      isDown: boolean;
    }>({
      x: -9999,
      y: -9999,
      lastX: -9999,
      lastY: -9999,
      vx: 0,
      vy: 0,
      active: false,
      isDown: false,
    });

    const spawnInitialBodies = (w: number, h: number, dropFromHigh: boolean) => {
      const isMobile = w < 640;
      const isTablet = w < 1024;
      const count = isMobile ? 54 : isTablet ? 82 : 108;
      const minR = isMobile ? 13 : 16;
      const maxR = isMobile ? 22 : 29;
      const list: PhysicsBody[] = [];

      for (let i = 0; i < count; i++) {
        const isGoldenEasterEgg = i === Math.floor(count * 0.35) || (count > 80 && i === Math.floor(count * 0.72));
        const r = isGoldenEasterEgg
          ? maxR * 0.92
          : minR + Math.random() * (maxR - minR);
        const kind: ShapeKind = isGoldenEasterEgg ? 'goldenStar' : pickShapeKind();
        const { color, inkColor } = isGoldenEasterEgg
          ? { color: '#FACC15', inkColor: '#0F172A' }
          : pickColor();

        const x = r + 12 + Math.random() * Math.max(40, w - (r + 12) * 2);
        const y = dropFromHigh
          ? h * 0.32 + Math.random() * (h * 0.56) - Math.random() * 180
          : h * 0.64 + Math.random() * (h * 0.32);

        list.push({
          x,
          y,
          vx: (Math.random() - 0.5) * (dropFromHigh ? 4.2 : 0),
          vy: dropFromHigh ? Math.random() * 2.5 : 0,
          r,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.08,
          kind,
          color,
          inkColor,
          glyph:
            kind === 'codeDisc'
              ? CODE_GLYPHS[i % CODE_GLYPHS.length]
              : undefined,
        });
      }

      bodiesRef.current = list;
    };

    // React cleanly when user toggles ZERO-G without resetting the loop
    useEffect(() => {
      zeroGRef.current = zeroGravity;
      if (zeroGravity && !prevZeroGRef.current) {
        // Give every piece a dreamy weightless lift & gentle swirl!
        for (const b of bodiesRef.current) {
          b.vy -= 2.4 + Math.random() * 4.4;
          b.vx += (Math.random() - 0.5) * 3.8;
          b.vRot += (Math.random() - 0.5) * 0.09;
        }
      } else if (!zeroGravity && prevZeroGRef.current) {
        // Gentle downward nudge when restoring gravity
        for (const b of bodiesRef.current) {
          b.vy += 1.2 + Math.random() * 1.8;
        }
      }
      prevZeroGRef.current = zeroGravity;
    }, [zeroGravity]);

    useImperativeHandle(ref, () => ({
      onPointerMove: (x, y, isDown) => {
        const ptr = pointerRef.current;
        if (ptr.lastX !== -9999) {
          const dx = x - ptr.lastX;
          const dy = y - ptr.lastY;
          ptr.vx = Math.max(-46, Math.min(46, dx * 0.72));
          ptr.vy = Math.max(-46, Math.min(46, dy * 0.72));

          // Append whisper trail point on brisk sweeps
          if (Math.hypot(dx, dy) > 4) {
            trailRef.current.push({ x, y, life: 1 });
            if (trailRef.current.length > 20) trailRef.current.shift();
          }
        }
        ptr.lastX = x;
        ptr.lastY = y;
        ptr.x = x;
        ptr.y = y;
        ptr.active = true;
        ptr.isDown = isDown;
      },

      onPointerLeave: () => {
        const ptr = pointerRef.current;
        ptr.active = false;
        ptr.isDown = false;
        ptr.lastX = -9999;
        ptr.lastY = -9999;
        ptr.x = -9999;
        ptr.y = -9999;
      },

      triggerBurstAt: (bx, by) => {
        const { w } = sizeRef.current;
        const bodies = bodiesRef.current;
        const isMobile = w < 640;
        const baseCap = isMobile ? 74 : w < 1024 ? 106 : 134;

        // Radial shockwave impulse on nearby bodies
        for (const b of bodies) {
          const dx = b.x - bx;
          const dy = b.y - by;
          const dist = Math.hypot(dx, dy);
          if (dist < 220 && dist > 0.5) {
            const force = (1 - dist / 220) * 14.5;
            b.vx += (dx / dist) * force;
            b.vy += (dy / dist) * force - 4.2;
            b.vRot += (Math.random() - 0.5) * 0.22;
          }
        }

        // Spawn 6 joyful fresh shapes bursting outward from click point
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.4;
          const speed = 4.5 + Math.random() * 6.5;
          const kind = pickShapeKind();
          const { color, inkColor } = pickColor();
          const r = (isMobile ? 14 : 17) + Math.random() * (isMobile ? 8 : 11);

          bodies.push({
            x: bx + Math.cos(angle) * 10,
            y: by + Math.sin(angle) * 10,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 3.5,
            r,
            rot: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.18,
            kind,
            color,
            inkColor,
            glyph:
              kind === 'codeDisc'
                ? CODE_GLYPHS[Math.floor(Math.random() * CODE_GLYPHS.length)]
                : undefined,
            isBurst: true,
          });
        }

        // Keep total body count bounded for locked 60fps
        while (bodies.length > baseCap) {
          const burstIdx = bodies.findIndex((b) => b.isBurst);
          if (burstIdx !== -1) bodies.splice(burstIdx, 1);
          else bodies.shift();
        }
      },

      triggerHeadlineCheer: () => {
        const { w, h } = sizeRef.current;
        for (const b of bodiesRef.current) {
          if (b.x > w * 0.18 && b.x < w * 0.82 && b.y > h * 0.50) {
            const centerBoost = 1 - Math.abs(b.x - w * 0.5) / (w * 0.35);
            b.vy -= (4.2 + Math.random() * 6.2) * Math.max(0.35, centerBoost);
            b.vx += (b.x - w * 0.5) * 0.012 + (Math.random() - 0.5) * 2.4;
            b.vRot += (Math.random() - 0.5) * 0.16;
          }
        }
      },

      resetPile: () => {
        const { w, h } = sizeRef.current;
        spawnInitialBodies(w, h, true);
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Cap DPR at 1.5x for crisp flat Swiss geometry with ~44% less GPU canvas RAM!
      let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      let width = canvas.parentElement?.offsetWidth || window.innerWidth;
      let height = canvas.parentElement?.offsetHeight || window.innerHeight;
      sizeRef.current = { w: width, h: height };

      const applyCanvasSize = () => {
        if (!canvas.parentElement) return;
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        width = canvas.parentElement.offsetWidth || window.innerWidth;
        height = canvas.parentElement.offsetHeight || window.innerHeight;
        sizeRef.current = { w: width, h: height };
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      applyCanvasSize();
      spawnInitialBodies(width, height, !prefersReducedMotion);

      let isVisible = false;
      let hasDroppedOnce = false;
      let animId = 0;

      const handleResize = () => {
        const prevW = width;
        applyCanvasSize();
        // Clamp existing bodies safely inside new bounds
        for (const b of bodiesRef.current) {
          b.x = Math.min(width - b.r - 2, Math.max(b.r + 2, (b.x / Math.max(1, prevW)) * width));
          b.y = Math.min(height - b.r - 2, b.y);
        }
        if (prefersReducedMotion) {
          renderFrame(false);
        }
      };
      window.addEventListener('resize', handleResize);

      // Reusable spatial hash grid for O(n) collision solving
      const grid = new Map<number, number[]>();
      const CELL_SIZE = 68;

      const solveCollisions = () => {
        const bodies = bodiesRef.current;
        const cols = Math.ceil(width / CELL_SIZE) + 2;

        for (let iter = 0; iter < 2; iter++) {
          grid.clear();
          for (let i = 0; i < bodies.length; i++) {
            const b = bodies[i];
            const cx = Math.floor(b.x / CELL_SIZE);
            const cy = Math.floor(b.y / CELL_SIZE);
            const key = cy * cols + cx;
            let bucket = grid.get(key);
            if (!bucket) {
              bucket = [];
              grid.set(key, bucket);
            }
            bucket.push(i);
          }

          for (let i = 0; i < bodies.length; i++) {
            const a = bodies[i];
            const cx = Math.floor(a.x / CELL_SIZE);
            const cy = Math.floor(a.y / CELL_SIZE);

            for (let oy = -1; oy <= 1; oy++) {
              for (let ox = -1; ox <= 1; ox++) {
                const bucket = grid.get((cy + oy) * cols + (cx + ox));
                if (!bucket) continue;

                for (let k = 0; k < bucket.length; k++) {
                  const j = bucket[k];
                  if (j <= i) continue;

                  const b = bodies[j];
                  const dx = b.x - a.x;
                  const dy = b.y - a.y;
                  const minDist = a.r + b.r + 1.2;
                  const distSq = dx * dx + dy * dy;

                  if (distSq < minDist * minDist && distSq > 0.0001) {
                    const dist = Math.sqrt(distSq);
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const overlap = minDist - dist;

                    // Position separation (mass-weighted by area)
                    const ma = a.r * a.r;
                    const mb = b.r * b.r;
                    const totalM = ma + mb;
                    const ratioA = mb / totalM;
                    const ratioB = ma / totalM;

                    a.x -= nx * overlap * ratioA * 0.82;
                    a.y -= ny * overlap * ratioA * 0.82;
                    b.x += nx * overlap * ratioB * 0.82;
                    b.y += ny * overlap * ratioB * 0.82;

                    // Impulse velocity exchange only on first pass
                    if (iter === 0) {
                      const rvx = b.vx - a.vx;
                      const rvy = b.vy - a.vy;
                      const velAlongNormal = rvx * nx + rvy * ny;

                      if (velAlongNormal < 0) {
                        const restitution = zeroGRef.current ? 0.72 : 0.34;
                        const imp = -(1 + restitution) * velAlongNormal;
                        a.vx -= imp * nx * ratioA;
                        a.vy -= imp * ny * ratioA;
                        b.vx += imp * nx * ratioB;
                        b.vy += imp * ny * ratioB;

                        // Subtle tangential spin transfer
                        const tx = -ny;
                        const ty = nx;
                        const tangVel = rvx * tx + rvy * ty;
                        a.vRot += tangVel * 0.0018;
                        b.vRot -= tangVel * 0.0018;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };

      const renderFrame = (stepPhysics: boolean) => {
        ctx.clearRect(0, 0, width, height);

        const ptr = pointerRef.current;
        const bodies = bodiesRef.current;
        const isZeroG = zeroGRef.current;

        // 1. Subtle Iridescent Whisper Cursor Trail (Lusion frame_05 homage!)
        const trail = trailRef.current;
        if (trail.length > 1) {
          for (let i = 0; i < trail.length; i++) {
            trail[i].life -= 0.045;
          }
          while (trail.length > 0 && trail[0].life <= 0) {
            trail.shift();
          }

          if (trail.length > 1) {
            ctx.save();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            for (let i = 1; i < trail.length; i++) {
              const p0 = trail[i - 1];
              const p1 = trail[i];
              const alpha = Math.max(0, p1.life) * 0.24;
              const grad = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
              grad.addColorStop(0, `rgba(56, 189, 248, ${alpha})`);
              grad.addColorStop(0.5, `rgba(139, 92, 246, ${alpha * 0.78})`);
              grad.addColorStop(1, `rgba(250, 204, 21, ${alpha * 0.7})`);
              ctx.strokeStyle = grad;
              ctx.lineWidth = Math.max(2, p1.life * 22);
              ctx.beginPath();
              ctx.moveTo(p0.x, p0.y);
              ctx.lineTo(p1.x, p1.y);
              ctx.stroke();
            }
            ctx.restore();
          }
        }

        // 2. Step Rigid-Body Physics
        if (stepPhysics) {
          const gravity = isZeroG ? 0 : 0.42;
          const airDrag = isZeroG ? 0.993 : 0.991;
          const scoopRadius = ptr.isDown ? 175 : 135;

          ptr.vx *= 0.85;
          ptr.vy *= 0.85;

          for (let i = 0; i < bodies.length; i++) {
            const b = bodies[i];

            b.vy += gravity;

            // Gentle ambient float breeze in ZERO-G mode
            if (isZeroG) {
              b.vx += Math.sin(b.y * 0.012 + i) * 0.016;
              b.vy += Math.cos(b.x * 0.012 + i) * 0.016;
            }

            // Cursor Wave Scoop & Splash Impulse!
            if (ptr.active) {
              const dx = b.x - ptr.x;
              const dy = b.y - ptr.y;
              const dist = Math.hypot(dx, dy);

              if (dist < scoopRadius && dist > 0.5) {
                const falloff = 1 - dist / scoopRadius;
                const nx = dx / dist;
                const ny = dy / dist;

                // Radial parting push
                const pushStrength = (ptr.isDown ? 2.4 : 1.35) * falloff * falloff;
                b.vx += nx * pushStrength;
                b.vy += ny * pushStrength;

                // Directional velocity scoop + upward wave curl!
                const ptrSpeed = Math.hypot(ptr.vx, ptr.vy);
                if (ptrSpeed > 0.4) {
                  b.vx += ptr.vx * falloff * 0.34;
                  b.vy += ptr.vy * falloff * 0.34 - Math.abs(ptr.vx) * falloff * 0.22;
                  b.vRot += (ptr.vx * 0.0045 + (Math.random() - 0.5) * 0.04) * falloff;
                }
              }
            }

            b.vx *= airDrag;
            b.vy *= airDrag;
            b.vRot *= 0.972;

            // Speed cap for absolute numerical stability
            const speed = Math.hypot(b.vx, b.vy);
            if (speed > 28) {
              b.vx = (b.vx / speed) * 28;
              b.vy = (b.vy / speed) * 28;
            }

            b.x += b.vx;
            b.y += b.vy;
            b.rot += b.vRot;

            // Boundary Walls & Floor Restitution
            const pad = 2;
            if (b.x < b.r + pad) {
              b.x = b.r + pad;
              b.vx = Math.abs(b.vx) * (isZeroG ? 0.85 : 0.48);
            } else if (b.x > width - b.r - pad) {
              b.x = width - b.r - pad;
              b.vx = -Math.abs(b.vx) * (isZeroG ? 0.85 : 0.48);
            }

            if (b.y > height - b.r - pad) {
              b.y = height - b.r - pad;
              if (Math.abs(b.vy) < 0.85 && !isZeroG) {
                b.vy = 0;
              } else {
                b.vy = -Math.abs(b.vy) * (isZeroG ? 0.85 : 0.42);
              }
              b.vx *= 0.92; // Subtle floor friction
              b.vRot = b.vx * 0.025;
            } else if (b.y < b.r + pad) {
              b.y = b.r + pad;
              b.vy = Math.abs(b.vy) * (isZeroG ? 0.85 : 0.4);
            }
          }

          solveCollisions();
        }

        // 3. Draw All Crisp HiDPI Vector Shapes
        for (let i = 0; i < bodies.length; i++) {
          drawBody(ctx, bodies[i]);
        }
      };

      const tick = () => {
        if (!isVisible) {
          animId = 0;
          return;
        }
        renderFrame(true);
        animId = requestAnimationFrame(tick);
      };

      // IntersectionObserver: truly cancel & restart RAF off-screen (0% CPU!) + pour-in on first sight
      const io = new IntersectionObserver(
        (entries) => {
          const nowVis = entries[0]?.isIntersecting ?? false;
          isVisible = nowVis;
          if (prefersReducedMotion) {
            if (nowVis && !hasDroppedOnce) {
              hasDroppedOnce = true;
              for (let s = 0; s < 24; s++) {
                solveCollisions();
                for (const b of bodiesRef.current) {
                  b.y = Math.min(height - b.r - 2, b.y + 8);
                }
              }
              renderFrame(false);
            }
            return;
          }
          if (nowVis) {
            if (!hasDroppedOnce) {
              hasDroppedOnce = true;
              spawnInitialBodies(width, height, true);
            }
            if (!animId) {
              animId = requestAnimationFrame(tick);
            }
          } else if (animId) {
            cancelAnimationFrame(animId);
            animId = 0;
          }
        },
        { threshold: 0.04 }
      );
      io.observe(canvas);

      return () => {
        if (animId) cancelAnimationFrame(animId);
        io.disconnect();
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 z-10 w-full h-full pointer-events-none select-none will-change-transform"
      />
    );
  }
);

ContactPhysicsCanvas.displayName = 'ContactPhysicsCanvas';

export default ContactPhysicsCanvas;
