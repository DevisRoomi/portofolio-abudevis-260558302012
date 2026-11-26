import React, { useEffect, useRef, useState } from 'react';

interface PullCordSwitchProps {
  isDark: boolean;
  onToggle: () => void;
  paused?: boolean;
}

interface RopeNode {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
   HD VERLET-PHYSICS PULL-CORD LAMP SWITCH
   - Anchored directly at the machined mounting bolt ("baut") on the header.
   - 11-node Verlet rope solver with continuous organic multi-harmonic wind
     sway, nearby cursor air-draft nudge, free 360° tactile pulling, elastic
     tension stretch, mechanical detent click + bolt shockwave ripple, spring
     recoil snapback, AND 1-click quick-tug support!
   - 2× HiDPI local canvas (180×290px, ~0.4 MB VRAM) — zero fullscreen bloat,
     pointer-events-none canvas so surrounding 3D Globe drag is 100% unhindered!
   ═══════════════════════════════════════════════════════════════════════════ */

const CANVAS_W = 180;
const CANVAS_H = 290;
const ANCHOR_X = 90;
const ANCHOR_Y = 20;
const NUM_NODES = 11; // 10 segments
const REST_SEG_LEN = 11.4; // ~114px total natural hanging length
const REST_TOTAL_LEN = (NUM_NODES - 1) * REST_SEG_LEN;
const PULL_TRIGGER_STRETCH = 44; // px beyond rest length to click switch
const MAX_PULL_LEN = REST_TOTAL_LEN + 96;

export const PullCordSwitch: React.FC<PullCordSwitchProps> = ({
  isDark,
  onToggle,
  paused = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grabBtnRef = useRef<HTMLButtonElement>(null);

  const isDarkRef = useRef<boolean>(isDark);
  isDarkRef.current = isDark;
  const onToggleRef = useRef<() => void>(onToggle);
  onToggleRef.current = onToggle;

  const [isHovered, setIsHovered] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  // Interactive physics refs (zero React re-renders inside 60fps loop!)
  const nodesRef = useRef<RopeNode[]>([]);
  const draggingRef = useRef<boolean>(false);
  const dragPointerIdRef = useRef<number | null>(null);
  const pointerLocalRef = useRef<{ x: number; y: number }>({ x: ANCHOR_X, y: ANCHOR_Y + REST_TOTAL_LEN });
  const dragStartClientRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragMaxMoveRef = useRef<number>(0);
  const hasTriggeredPullRef = useRef<boolean>(false);
  const isHoveredRef = useRef<boolean>(false);
  isHoveredRef.current = isHovered;

  // Quick-click pull animation & mechanical bolt ripple states
  const quickTugProgressRef = useRef<number>(-1); // -1 = inactive, 0..1 = active tug
  const quickTugFiredRef = useRef<boolean>(false);
  const clickRippleRef = useRef<number>(0); // 1 -> 0 expanding ring at mounting bolt
  const boltDepressRef = useRef<number>(0); // 0..1 mechanical pull depression at bolt

  // Mouse-proximity breeze tracker
  const airCursorRef = useRef<{ x: number; y: number; vx: number; active: boolean }>({
    x: -999,
    y: -999,
    vx: 0,
    active: false,
  });

  // Initialize Verlet rope nodes once
  if (nodesRef.current.length === 0) {
    const initial: RopeNode[] = [];
    for (let i = 0; i < NUM_NODES; i++) {
      initial.push({
        x: ANCHOR_X + Math.sin(i * 0.25) * 2.5,
        y: ANCHOR_Y + i * REST_SEG_LEN,
        oldX: ANCHOR_X + Math.sin(i * 0.25) * 2.5,
        oldY: ANCHOR_Y + i * REST_SEG_LEN,
      });
    }
    nodesRef.current = initial;
  }

  useEffect(() => {
    if (paused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(CANVAS_W * dpr);
    canvas.height = Math.round(CANVAS_H * dpr);

    // Subtle nearby mouse air-draft nudge (passive, never blocks anything!)
    let prevClientX = -999;
    const handleWindowPointerMove = (e: PointerEvent) => {
      if (draggingRef.current) {
        const rect = canvas.getBoundingClientRect();
        pointerLocalRef.current.x = e.clientX - rect.left;
        pointerLocalRef.current.y = e.clientY - rect.top;
        dragMaxMoveRef.current = Math.max(
          dragMaxMoveRef.current,
          Math.hypot(e.clientX - dragStartClientRef.current.x, e.clientY - dragStartClientRef.current.y)
        );
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const lx = e.clientX - rect.left;
      const ly = e.clientY - rect.top;
      const vx = prevClientX === -999 ? 0 : Math.max(-28, Math.min(28, e.clientX - prevClientX));
      prevClientX = e.clientX;

      if (lx >= -20 && lx <= CANVAS_W + 20 && ly >= 0 && ly <= CANVAS_H + 20) {
        airCursorRef.current = { x: lx, y: ly, vx, active: true };
      } else {
        airCursorRef.current.active = false;
      }
    };

    const handleWindowPointerUp = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      if (dragPointerIdRef.current !== null && e.pointerId !== dragPointerIdRef.current) return;

      const nodes = nodesRef.current;
      const tip = nodes[NUM_NODES - 1];
      const stretch = Math.hypot(tip.x - ANCHOR_X, tip.y - ANCHOR_Y) - REST_TOTAL_LEN;

      draggingRef.current = false;
      dragPointerIdRef.current = null;
      setIsPulling(false);

      // If user just clicked/tapped without dragging far -> trigger crisp natural quick-tug!
      if (!hasTriggeredPullRef.current && dragMaxMoveRef.current < 10) {
        quickTugProgressRef.current = 0;
        quickTugFiredRef.current = false;
      } else {
        // Spring elastic recoil upward + organic sideways pendulum sway!
        const recoil = Math.max(0, stretch) * 0.24;
        tip.oldY = tip.y + recoil;
        tip.oldX = tip.x - (tip.x - ANCHOR_X) * 0.08;
      }
      hasTriggeredPullRef.current = false;
    };

    window.addEventListener('pointermove', handleWindowPointerMove, { passive: true });
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);

    let animId = 0;
    const startTime = performance.now();

    const triggerSwitchClick = () => {
      clickRippleRef.current = 1;
      boltDepressRef.current = 1;
      onToggleRef.current();
    };

    const drawMachinedBolt = (
      c: CanvasRenderingContext2D,
      dark: boolean,
      depress: number,
      ripple: number,
      tensionRatio: number
    ) => {
      c.save();
      c.translate(ANCHOR_X, ANCHOR_Y);

      // 1. Expanding tactile click shockwave ripple around the bolt!
      if (ripple > 0.01) {
        const r = 10 + (1 - ripple) * 30;
        c.beginPath();
        c.arc(0, 0, r, 0, Math.PI * 2);
        c.strokeStyle = dark
          ? `rgba(251, 191, 36, ${(ripple * 0.72).toFixed(3)})`
          : `rgba(200, 62, 43, ${(ripple * 0.65).toFixed(3)})`;
        c.lineWidth = 1.6 * ripple + 0.5;
        c.stroke();
      }

      // 2. Subtle shadow under mounting rosette
      c.beginPath();
      c.arc(0, 2, 11.2, 0, Math.PI * 2);
      c.fillStyle = dark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(24, 24, 27, 0.18)';
      c.fill();

      // 3. Outer machined metallic collar ("baut ganti tema")
      const outerGrad = c.createLinearGradient(-10, -10, 10, 10);
      if (dark) {
        outerGrad.addColorStop(0, '#FDE68A');
        outerGrad.addColorStop(0.45, '#D97706');
        outerGrad.addColorStop(1, '#78350F');
      } else {
        outerGrad.addColorStop(0, '#FFFFFF');
        outerGrad.addColorStop(0.42, '#A8A29E');
        outerGrad.addColorStop(1, '#3F3F46');
      }
      c.beginPath();
      c.arc(0, 0, 10.5, 0, Math.PI * 2);
      c.fillStyle = outerGrad;
      c.fill();

      // 4. Inner chamfered recessed face
      const innerGrad = c.createRadialGradient(-2.5, -2.5, 1, 0, 0, 8.2);
      if (dark) {
        innerGrad.addColorStop(0, '#FEF3C7');
        innerGrad.addColorStop(0.6, '#B45309');
        innerGrad.addColorStop(1, '#451A03');
      } else {
        innerGrad.addColorStop(0, '#F4F4F5');
        innerGrad.addColorStop(0.58, '#71717A');
        innerGrad.addColorStop(1, '#27272A');
      }
      c.beginPath();
      c.arc(0, 0, 7.8, 0, Math.PI * 2);
      c.fillStyle = innerGrad;
      c.fill();

      // 5. Crisp slotted precision screw groove across bolt shoulders
      c.strokeStyle = dark ? 'rgba(69, 26, 3, 0.55)' : 'rgba(24, 24, 27, 0.45)';
      c.lineWidth = 1.25;
      c.beginPath();
      c.moveTo(-6.6, -1.8);
      c.lineTo(-3.1, -0.8);
      c.moveTo(3.1, 0.8);
      c.lineTo(6.6, 1.8);
      c.stroke();

      // 6. Central brass/dark eyelet aperture where cord pulls smoothly out
      const eyeOffsetY = depress * 1.4 + tensionRatio * 1.4;
      c.beginPath();
      c.arc(0, eyeOffsetY, 3.2, 0, Math.PI * 2);
      c.fillStyle = '#09090B';
      c.fill();
      c.lineWidth = 0.9;
      c.strokeStyle = dark ? 'rgba(253, 230, 138, 0.8)' : 'rgba(255, 255, 255, 0.75)';
      c.stroke();

      c.restore();
    };

    const drawBraidedCord = (c: CanvasRenderingContext2D, nodes: RopeNode[], dark: boolean) => {
      const traceSmoothRope = () => {
        c.beginPath();
        c.moveTo(nodes[0].x, nodes[0].y + 1.5);
        for (let i = 1; i < nodes.length - 1; i++) {
          const xc = (nodes[i].x + nodes[i + 1].x) * 0.5;
          const yc = (nodes[i].y + nodes[i + 1].y) * 0.5;
          c.quadraticCurveTo(nodes[i].x, nodes[i].y, xc, yc);
        }
        const last = nodes[nodes.length - 1];
        c.lineTo(last.x, last.y);
      };

      // Pass 1: Soft directional cast shadow for 3D floating depth
      c.save();
      c.translate(5, 6);
      c.lineCap = 'round';
      c.lineJoin = 'round';
      traceSmoothRope();
      c.strokeStyle = dark ? 'rgba(0, 0, 0, 0.45)' : 'rgba(24, 24, 27, 0.14)';
      c.lineWidth = 3.2;
      c.stroke();
      c.restore();

      // Pass 2: Main woven cord body with rich depth
      c.save();
      c.lineCap = 'round';
      c.lineJoin = 'round';
      traceSmoothRope();
      c.strokeStyle = dark ? '#D6C7A9' : '#27272A';
      c.lineWidth = 2.6;
      c.stroke();

      // Pass 3: Fine braided specular yarn weave dashes along cord
      c.setLineDash([2.2, 3.2]);
      c.lineDashOffset = -1.2;
      traceSmoothRope();
      c.strokeStyle = dark ? 'rgba(255, 251, 235, 0.85)' : 'rgba(161, 161, 170, 0.75)';
      c.lineWidth = 1.15;
      c.stroke();
      c.restore();
    };

    const drawSculptedKnob = (
      c: CanvasRenderingContext2D,
      tip: RopeNode,
      prev: RopeNode,
      dark: boolean,
      hovered: boolean,
      tensionRatio: number
    ) => {
      const angle = Math.atan2(tip.y - prev.y, tip.x - prev.x) - Math.PI / 2;

      c.save();
      c.translate(tip.x, tip.y);
      c.rotate(angle);

      // 1. Ambient warm glow aura behind knob in Planetarium dark mode (or subtle crimson hover in light mode)
      if (dark) {
        const glowR = hovered ? 36 : 26;
        const glow = c.createRadialGradient(0, 15, 2, 0, 15, glowR);
        glow.addColorStop(0, `rgba(251, 191, 36, ${hovered ? 0.52 : 0.34})`);
        glow.addColorStop(0.55, 'rgba(234, 88, 12, 0.12)');
        glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
        c.fillStyle = glow;
        c.beginPath();
        c.arc(0, 15, glowR, 0, Math.PI * 2);
        c.fill();
      } else if (hovered || tensionRatio > 0.1) {
        const glow = c.createRadialGradient(0, 15, 2, 0, 15, 26);
        glow.addColorStop(0, 'rgba(200, 62, 43, 0.22)');
        glow.addColorStop(1, 'rgba(200, 62, 43, 0)');
        c.fillStyle = glow;
        c.beginPath();
        c.arc(0, 15, 26, 0, Math.PI * 2);
        c.fill();
      }

      // 2. Soft drop shadow behind finial
      c.save();
      c.translate(4, 6);
      c.beginPath();
      c.moveTo(0, 1);
      c.bezierCurveTo(6.5, 4, 10, 14, 7.8, 22);
      c.bezierCurveTo(6.2, 27.5, -6.2, 27.5, -7.8, 22);
      c.bezierCurveTo(-10, 14, -6.5, 4, 0, 1);
      c.closePath();
      c.fillStyle = dark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(24, 24, 27, 0.2)';
      c.fill();
      c.restore();

      // 3. Machined Brass Top Ferrule Collar (where cord meets weighted knob)
      const ferruleGrad = c.createLinearGradient(-4.5, 0, 4.5, 0);
      ferruleGrad.addColorStop(0, '#78350F');
      ferruleGrad.addColorStop(0.32, '#FDE68A');
      ferruleGrad.addColorStop(0.68, '#D97706');
      ferruleGrad.addColorStop(1, '#451A03');
      c.fillStyle = ferruleGrad;
      c.beginPath();
      c.roundRect(-4.2, -1.5, 8.4, 5.2, 2);
      c.fill();

      // 4. Sculpted Weighted Teardrop / Acorn Body (HD turned ceramic-obsidian OR warm glowing amber-ivory!)
      c.beginPath();
      c.moveTo(-4, 3.2);
      c.bezierCurveTo(-7.2, 7.5, -10.2, 14.8, -8.2, 21.8);
      c.bezierCurveTo(-6.6, 27.2, 6.6, 27.2, 8.2, 21.8);
      c.bezierCurveTo(10.2, 14.8, 7.2, 7.5, 4, 3.2);
      c.closePath();

      const bodyGrad = c.createLinearGradient(-9, 6, 9, 22);
      if (dark) {
        // Warm luminous alabaster-amber glass finial (pull to turn light studio ON!)
        bodyGrad.addColorStop(0, '#FFFBEB');
        bodyGrad.addColorStop(0.35, '#FDE68A');
        bodyGrad.addColorStop(0.75, '#F59E0B');
        bodyGrad.addColorStop(1, '#B45309');
      } else {
        // Matte obsidian-graphite turned ceramic finial (pull to turn night planetarium ON!)
        bodyGrad.addColorStop(0, '#52525B');
        bodyGrad.addColorStop(0.28, '#27272A');
        bodyGrad.addColorStop(0.72, '#111114');
        bodyGrad.addColorStop(1, '#09090B');
      }
      c.fillStyle = bodyGrad;
      c.fill();

      // Subtle rim edge highlight
      c.lineWidth = 0.85;
      c.strokeStyle = dark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.18)';
      c.stroke();

      // 5. Crisp 3D Cylindrical Specular Reflection Strip along left curve
      c.beginPath();
      c.moveTo(-3.2, 6.2);
      c.bezierCurveTo(-5.8, 11.2, -6.2, 17.2, -4.2, 21.5);
      c.strokeStyle = dark ? 'rgba(255, 255, 255, 0.82)' : 'rgba(255, 255, 255, 0.34)';
      c.lineWidth = 1.9;
      c.lineCap = 'round';
      c.stroke();

      // 6. Signature Brass Bottom Bead Tip (adds tactile luxury detail!)
      const tipBeadGrad = c.createRadialGradient(-1, 26.8, 0.5, 0, 27.6, 3.2);
      tipBeadGrad.addColorStop(0, '#FEF3C7');
      tipBeadGrad.addColorStop(0.55, '#D97706');
      tipBeadGrad.addColorStop(1, '#78350F');
      c.beginPath();
      c.arc(0, 27.4, 2.7, 0, Math.PI * 2);
      c.fillStyle = tipBeadGrad;
      c.fill();

      // 7. Tiny indicator inlay on knob belly (Warm Moon dot in light mode, Sun filament dot in dark mode)
      c.beginPath();
      c.arc(0, 16.5, hovered ? 2.1 : 1.6, 0, Math.PI * 2);
      c.fillStyle = dark ? '#FFFFFF' : '#E8715D';
      c.fill();

      // 8. Subtle tension progress ring right beneath finial while actively pulling toward threshold!
      if (tensionRatio > 0.08 && !hasTriggeredPullRef.current) {
        c.beginPath();
        c.arc(
          0,
          16.5,
          12.5,
          -Math.PI / 2,
          -Math.PI / 2 + Math.PI * 2 * Math.min(1, tensionRatio)
        );
        c.strokeStyle = dark ? 'rgba(253, 224, 71, 0.85)' : 'rgba(200, 62, 43, 0.85)';
        c.lineWidth = 1.4;
        c.stroke();
      }

      c.restore();
    };

    const tick = (now: number) => {
      const elapsedSec = (now - startTime) / 1000;
      const nodes = nodesRef.current;
      const tip = nodes[NUM_NODES - 1];
      const dark = isDarkRef.current;

      // ── 1. VERLET INTEGRATION + ORGANIC MULTI-HARMONIC WIND ──
      const windGust = prefersReducedMotion
        ? 0
        : Math.sin(elapsedSec * 1.18) * 0.044 +
          Math.sin(elapsedSec * 2.55 + 1.1) * 0.02 +
          Math.sin(elapsedSec * 0.54 + 2.7) * 0.03 +
          Math.sin(elapsedSec * 4.2 + 0.4) * 0.007;

      const damping = draggingRef.current ? 0.86 : 0.985;
      const gravity = 0.46;

      for (let i = 1; i < NUM_NODES; i++) {
        const n = nodes[i];
        const vx = (n.x - n.oldX) * damping;
        const vy = (n.y - n.oldY) * damping;
        n.oldX = n.x;
        n.oldY = n.y;

        const windWeight = (i / (NUM_NODES - 1)) * (0.6 + 0.4 * Math.sin(elapsedSec * 1.8 - i * 0.35));
        let airNudge = 0;

        // Subtle air-displacement nudge when cursor sweeps near the swaying cord
        if (!draggingRef.current && airCursorRef.current.active) {
          const dist = Math.hypot(n.x - airCursorRef.current.x, n.y - airCursorRef.current.y);
          if (dist < 46) {
            airNudge = airCursorRef.current.vx * (1 - dist / 46) * 0.016;
          }
        }

        n.x += vx + windGust * windWeight + airNudge;
        n.y += vy + gravity;
      }

      // Decay cursor breeze velocity smoothly
      airCursorRef.current.vx *= 0.82;

      // ── 2. HANDLE INTERACTIVE DRAG OR 1-CLICK QUICK TUG ──
      let currentSegLen = REST_SEG_LEN;
      let tensionRatio = 0;

      if (draggingRef.current) {
        const dx = pointerLocalRef.current.x - ANCHOR_X;
        const dy = Math.max(18, pointerLocalRef.current.y - ANCHOR_Y);
        const rawDist = Math.hypot(dx, dy);

        // Realistic progressive elastic resistance when stretching cord past resting length
        let targetDist = rawDist;
        if (rawDist > REST_TOTAL_LEN) {
          const over = rawDist - REST_TOTAL_LEN;
          targetDist = REST_TOTAL_LEN + over * 0.64;
        }
        targetDist = Math.min(MAX_PULL_LEN, targetDist);

        const ux = dx / Math.max(1, rawDist);
        const uy = dy / Math.max(1, rawDist);
        const targetX = ANCHOR_X + ux * targetDist;
        const targetY = ANCHOR_Y + uy * targetDist;

        tip.x += (targetX - tip.x) * 0.55;
        tip.y += (targetY - tip.y) * 0.55;

        const actualDist = Math.hypot(tip.x - ANCHOR_X, tip.y - ANCHOR_Y);
        const stretch = Math.max(0, actualDist - REST_TOTAL_LEN);
        tensionRatio = Math.min(1, stretch / PULL_TRIGGER_STRETCH);

        // Allow segments to stretch smoothly when pulled taut
        if (actualDist > REST_TOTAL_LEN) {
          currentSegLen = actualDist / (NUM_NODES - 1);
        }

        // Cross click detent threshold -> toggle light/dark immediately!
        if (!hasTriggeredPullRef.current && stretch >= PULL_TRIGGER_STRETCH) {
          hasTriggeredPullRef.current = true;
          triggerSwitchClick();
        }
      } else if (quickTugProgressRef.current >= 0) {
        // Crisp organic 1-click downward tug -> click -> spring release!
        quickTugProgressRef.current += 0.085;
        const p = quickTugProgressRef.current;

        if (p < 0.55) {
          const downNorm = Math.sin((p / 0.55) * (Math.PI / 2));
          const pullDist = REST_TOTAL_LEN + downNorm * (PULL_TRIGGER_STRETCH + 10);
          currentSegLen = pullDist / (NUM_NODES - 1);
          tip.y = ANCHOR_Y + pullDist;
          tip.x += (ANCHOR_X - tip.x) * 0.25;
          tensionRatio = downNorm;
        } else {
          if (!quickTugFiredRef.current) {
            quickTugFiredRef.current = true;
            triggerSwitchClick();
            // Inject lively upward spring recoil + playful horizontal pendulum swing!
            tip.oldY = tip.y + 13;
            tip.oldX = tip.x + (dark ? -5.5 : 5.5);
          }
          quickTugProgressRef.current = -1;
        }
      }

      // ── 3. CONSTRAINT RELAXATION (7 passes -> silky inextensible rope!) ──
      for (let iter = 0; iter < 7; iter++) {
        nodes[0].x = ANCHOR_X;
        nodes[0].y = ANCHOR_Y;

        for (let i = 0; i < NUM_NODES - 1; i++) {
          const a = nodes[i];
          const b = nodes[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const diff = (currentSegLen - dist) / dist;

          if (i === 0) {
            b.x += dx * diff;
            b.y += dy * diff;
          } else if (i === NUM_NODES - 2 && draggingRef.current) {
            a.x -= dx * diff;
            a.y -= dy * diff;
          } else {
            a.x -= dx * diff * 0.5;
            a.y -= dy * diff * 0.5;
            b.x += dx * diff * 0.5;
            b.y += dy * diff * 0.5;
          }
        }
      }

      // Decay tactile bolt pulse & depression
      clickRippleRef.current *= 0.88;
      if (clickRippleRef.current < 0.01) clickRippleRef.current = 0;
      boltDepressRef.current *= 0.84;
      if (boltDepressRef.current < 0.01) boltDepressRef.current = 0;

      // Sync lightweight invisible grab button directly over the swinging finial!
      if (grabBtnRef.current) {
        grabBtnRef.current.style.transform = `translate3d(${(tip.x - 24).toFixed(1)}px, ${(tip.y - 8).toFixed(1)}px, 0)`;
      }

      // ── 4. RENDER HD 2× RETINA SWITCH ──
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      drawBraidedCord(ctx, nodes, dark);
      drawMachinedBolt(ctx, dark, boltDepressRef.current, clickRippleRef.current, tensionRatio);
      drawSculptedKnob(
        ctx,
        nodes[NUM_NODES - 1],
        nodes[NUM_NODES - 2],
        dark,
        isHoveredRef.current,
        tensionRatio
      );

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, [paused]);

  const handleKnobPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    draggingRef.current = true;
    dragPointerIdRef.current = e.pointerId;
    hasTriggeredPullRef.current = false;
    quickTugProgressRef.current = -1;
    dragStartClientRef.current = { x: e.clientX, y: e.clientY };
    dragMaxMoveRef.current = 0;
    pointerLocalRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setIsPulling(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      quickTugProgressRef.current = 0;
      quickTugFiredRef.current = false;
    }
  };

  return (
    <div
      className="relative w-[36px] h-[32px] flex items-center justify-center shrink-0 overflow-visible"
      title={isDark ? 'Tarik tali untuk mode Studio Terang' : 'Tarik tali untuk mode Planetarium Gelap'}
    >
      {/* Hanging HD 2x Verlet Canvas (pointer-events-none so 3D Globe behind it remains 100% draggable!) */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2"
        style={{
          width: `${CANVAS_W}px`,
          height: `${CANVAS_H}px`,
          marginLeft: `${-ANCHOR_X}px`,
          marginTop: `${-ANCHOR_Y}px`,
        }}
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="w-full h-full block pointer-events-none"
        />

        {/* Interactive Dynamic Grab Handle tracking the swinging finial tip */}
        <button
          ref={grabBtnRef}
          type="button"
          onPointerDown={handleKnobPointerDown}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label={
            isDark
              ? 'Tarik tali lampu untuk ganti ke tema Studio Terang'
              : 'Tarik tali lampu untuk ganti ke tema Planetarium Gelap'
          }
          className={`pointer-events-auto absolute top-0 left-0 w-[48px] h-[52px] rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C83E2B] ${
            isPulling ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            transform: `translate3d(${ANCHOR_X - 24}px, ${ANCHOR_Y + REST_TOTAL_LEN - 8}px, 0)`,
            touchAction: 'none',
          }}
        >
          {/* Quiet micro cue beside knob ONLY on hover (vanishes while pulling) */}
          <span
            className={`pointer-events-none absolute right-full top-1/2 -translate-y-1/2 mr-1 px-2 py-0.5 rounded-full font-mono text-[8.5px] font-semibold tracking-[0.14em] uppercase whitespace-nowrap transition-all duration-200 ${
              isHovered && !isPulling
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-1'
            } ${
              isDark
                ? 'bg-white/10 text-amber-200 border border-white/15'
                : 'bg-[#18181B]/90 text-[#FAF8F5]'
            }`}
          >
            Tarik ↓
          </span>
        </button>
      </div>
    </div>
  );
};

export default PullCordSwitch;
