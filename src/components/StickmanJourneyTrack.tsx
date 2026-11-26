import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   STICKMAN JOURNEY TRACK — 4-ACT PROCEDURAL KINEMATICS (LUMAJANG → BOGOR)
   Ultra-smooth scroll-scrubbed articulated SVG stickman with mini backpack:
     Act 1 (0.00–0.29): Brisk stride walk with 2-segment knee/elbow swing
     Act 2 (0.29–0.61): Casual walk while holding & reading tiny newspaper
                        (0.56–0.63: newspaper flutters off & fades out)
     Act 3 (0.61–0.87): Anticipation crouch → airborne 360° tucked front-flip
                        salto with motion swoosh → elastic roll landing
     Act 4 (0.87–1.00): Standing tall at Bogor + charming little wave &
                        arrival dot ripple!
   Zero React re-renders during scroll: updates SVG DOM directly via refs.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface StickmanJourneyHandle {
  updateProgress: (progress: number) => void;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const easeInOutQuad = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const DEG = Math.PI / 180;

// Compute joint endpoint from (px, py), length L, angle from straight DOWN (+y) toward RIGHT (+x)
const segEnd = (px: number, py: number, len: number, angleDeg: number): [number, number] => {
  const rad = angleDeg * DEG;
  return [px + Math.sin(rad) * len, py + Math.cos(rad) * len];
};

// Geometry constants (viewBox 0 0 280 54)
const GROUND_Y = 46;
const X_START = 16;
const X_END = 260;
const THIGH_L = 6.2;
const SHIN_L = 6.2;
const TORSO_L = 8.4;
const HEAD_R = 2.85;
const UARM_L = 4.9;
const FARM_L = 4.6;
const BASE_HIP_Y = GROUND_Y - (THIGH_L + SHIN_L); // 33.6

interface Pose {
  x: number;
  hipOffsetY: number;
  bodySpin: number;
  torsoLean: number;
  headNod: number;
  lThigh: number;
  lKnee: number;
  rThigh: number;
  rKnee: number;
  lShoulder: number;
  lElbow: number;
  rShoulder: number;
  rElbow: number;
  paperAlpha: number;
  paperReleaseT: number;
  swooshAlpha: number;
  arrivedT: number;
}

function evaluatePose(rawP: number): Pose {
  const p = clamp01(rawP);

  // Smooth horizontal travel from Lumajang (16) to Bogor (260), reaching destination at p = 0.88
  const moveT = clamp01(p / 0.88);
  const x = lerp(X_START, X_END, moveT);

  // Continuous walk cycle phase across Acts 1 & 2
  const walkPhase = p * 28 * Math.PI;
  const sinW = Math.sin(walkPhase);
  const cosW = Math.cos(walkPhase);

  // ── Base Act 1: Energetic Walk Pose ──
  const wLThigh = sinW * 31;
  const wLKnee = Math.max(0, -cosW) * 38 + 8;
  const wRThigh = -sinW * 31;
  const wRKnee = Math.max(0, cosW) * 38 + 8;
  const wLShoulder = -sinW * 26;
  const wLElbow = 16 + Math.max(0, -sinW) * 18;
  const wRShoulder = sinW * 26;
  const wRElbow = 16 + Math.max(0, sinW) * 18;
  const wBob = -Math.abs(sinW) * 1.45;
  const wLean = 9;

  // ── Act 2 Blend: Walking While Reading Newspaper (0.29 -> 0.59) ──
  const readIn = smoothstep(0.26, 0.33, p);
  const readOut = 1 - smoothstep(0.55, 0.61, p);
  const readW = readIn * readOut;

  let torsoLean = lerp(wLean, 6.5, readW);
  let headNod = lerp(0, 17, readW);
  let lShoulder = lerp(wLShoulder, 34, readW);
  let lElbow = lerp(wLElbow, 78, readW);
  let rShoulder = lerp(wRShoulder, 44, readW);
  let rElbow = lerp(wRElbow, 72, readW);
  let lThigh = wLThigh;
  let lKnee = wLKnee;
  let rThigh = wRThigh;
  let rKnee = wRKnee;
  let hipOffsetY = wBob;

  // Newspaper visibility & release flutter (0.56 -> 0.64)
  const paperFadeIn = smoothstep(0.28, 0.33, p);
  const paperReleaseT = clamp01((p - 0.56) / 0.085);
  const paperAlpha = paperFadeIn * (1 - smoothstep(0.57, 0.645, p));

  // ── Act 3: Crouch (0.61-0.66) → Airborne 360° Front-Flip Salto (0.66-0.81) → Roll Landing (0.81-0.88) ──
  let bodySpin = 0;
  let swooshAlpha = 0;

  if (p > 0.60 && p < 0.89) {
    // 3a. Anticipation crouch (0.60 -> 0.665)
    const crouchIn = smoothstep(0.60, 0.645, p);
    const crouchOut = 1 - smoothstep(0.645, 0.675, p);
    const crouchW = crouchIn * crouchOut;

    if (crouchW > 0) {
      hipOffsetY = lerp(hipOffsetY, 5.2, crouchW);
      torsoLean = lerp(torsoLean, 28, crouchW);
      headNod = lerp(headNod, -8, crouchW);
      lThigh = lerp(lThigh, 48, crouchW);
      lKnee = lerp(lKnee, 84, crouchW);
      rThigh = lerp(rThigh, 34, crouchW);
      rKnee = lerp(rKnee, 72, crouchW);
      lShoulder = lerp(lShoulder, -48, crouchW);
      lElbow = lerp(lElbow, 24, crouchW);
      rShoulder = lerp(rShoulder, -38, crouchW);
      rElbow = lerp(rElbow, 20, crouchW);
    }

    // 3b. Airborne 360° Front-Flip Tuck Salto (0.66 -> 0.815)
    if (p >= 0.655 && p <= 0.82) {
      const u = clamp01((p - 0.66) / 0.155);
      const jumpArc = 4 * u * (1 - u); // 0 -> 1 -> 0
      const tuckW = Math.sin(u * Math.PI); // tightest at apex

      // Smooth parabolic jump up into sky headroom (clean breathing room at apex)
      hipOffsetY = lerp(hipOffsetY, -14.5 * jumpArc, smoothstep(0.655, 0.675, p));
      // Full clockwise forward 360° front-flip rotation!
      bodySpin = easeInOutQuad(u) * 360;
      swooshAlpha = Math.pow(tuckW, 0.85) * 0.72;

      // Tuck knees tightly to chest & wrap arms around shins
      torsoLean = lerp(torsoLean, 26, tuckW);
      headNod = lerp(headNod, 22, tuckW);
      lThigh = lerp(lThigh, 114, tuckW);
      lKnee = lerp(lKnee, 126, tuckW);
      rThigh = lerp(rThigh, 102, tuckW);
      rKnee = lerp(rKnee, 120, tuckW);
      lShoulder = lerp(lShoulder, 62, tuckW);
      lElbow = lerp(lElbow, 78, tuckW);
      rShoulder = lerp(rShoulder, 54, tuckW);
      rElbow = lerp(rElbow, 74, tuckW);
    }

    // 3c. Forward Roll Touchdown & Elastic Recovery (0.81 -> 0.89)
    if (p > 0.81) {
      const landU = clamp01((p - 0.81) / 0.08);
      const absorb = Math.sin(landU * Math.PI);
      const standBlend = smoothstep(0.81, 0.885, p);

      hipOffsetY = lerp(4.8 * absorb, 0, standBlend * standBlend);
      torsoLean = lerp(24 * absorb, 0, standBlend);
      headNod = lerp(6 * absorb, -3, standBlend);
      lThigh = lerp(42 * absorb, -7, standBlend);
      lKnee = lerp(74 * absorb, 4, standBlend);
      rThigh = lerp(26 * absorb, 8, standBlend);
      rKnee = lerp(56 * absorb, 4, standBlend);
      lShoulder = lerp(28 * absorb, -13, standBlend);
      lElbow = lerp(34 * absorb, 18, standBlend);
      rShoulder = lerp(48 * absorb, 126, standBlend);
      rElbow = lerp(36 * absorb, 30, standBlend);
    }
  }

  // ── Act 4: Proud Stand & Charming Little Wave at Bogor (0.88 -> 1.00) ──
  const arrivedT = smoothstep(0.87, 0.92, p);
  if (p >= 0.87) {
    const waveU = clamp01((p - 0.88) / 0.12);
    // Two crisp friendly waves as user completes scroll
    const waveOsc = Math.sin(waveU * Math.PI * 4) * 24;

    hipOffsetY = lerp(hipOffsetY, 0, arrivedT);
    torsoLean = lerp(torsoLean, -2, arrivedT);
    headNod = lerp(headNod, -5, arrivedT);
    lThigh = lerp(lThigh, -7, arrivedT);
    lKnee = lerp(lKnee, 3, arrivedT);
    rThigh = lerp(rThigh, 8, arrivedT);
    rKnee = lerp(rKnee, 3, arrivedT);
    // Left arm rests casually near hip
    lShoulder = lerp(lShoulder, -15, arrivedT);
    lElbow = lerp(lElbow, 26, arrivedT);
    // Right arm raised in a friendly little wave!
    rShoulder = lerp(rShoulder, 134, arrivedT);
    rElbow = lerp(rElbow, 32 + waveOsc, arrivedT);
  }

  return {
    x,
    hipOffsetY,
    bodySpin,
    torsoLean,
    headNod,
    lThigh,
    lKnee,
    rThigh,
    rKnee,
    lShoulder,
    lElbow,
    rShoulder,
    rElbow,
    paperAlpha,
    paperReleaseT,
    swooshAlpha,
    arrivedT,
  };
}

export const StickmanJourneyTrack = forwardRef<StickmanJourneyHandle>((_, ref) => {
  const fillLineRef = useRef<SVGLineElement>(null);
  const progressDotRef = useRef<SVGCircleElement>(null);
  const arrivalRippleRef = useRef<SVGCircleElement>(null);

  const figureGroupRef = useRef<SVGGElement>(null);
  const torsoRef = useRef<SVGLineElement>(null);
  const backpackGroupRef = useRef<SVGGElement>(null);
  const headRef = useRef<SVGCircleElement>(null);
  const lLegRef = useRef<SVGPolylineElement>(null);
  const rLegRef = useRef<SVGPolylineElement>(null);
  const lArmRef = useRef<SVGPolylineElement>(null);
  const rArmRef = useRef<SVGPolylineElement>(null);
  const paperGroupRef = useRef<SVGGElement>(null);
  const swooshGroupRef = useRef<SVGGElement>(null);

  const renderAtProgress = (rawP: number) => {
    const p = clamp01(rawP);
    const pose = evaluatePose(p);

    // Update glowing route line fill & travel dot underneath feet
    const lineEndX = Math.max(8, Math.min(272, pose.x + 4));
    if (fillLineRef.current) {
      fillLineRef.current.setAttribute('x2', lineEndX.toFixed(2));
    }
    if (progressDotRef.current) {
      progressDotRef.current.setAttribute('cx', lineEndX.toFixed(2));
    }
    if (arrivalRippleRef.current) {
      const rippleR = 3 + pose.arrivedT * 5.5;
      const rippleOp = pose.arrivedT > 0.05 ? Math.sin(pose.arrivedT * Math.PI) * 0.55 + 0.18 : 0;
      arrivalRippleRef.current.setAttribute('r', rippleR.toFixed(2));
      arrivalRippleRef.current.setAttribute('opacity', rippleOp.toFixed(3));
    }

    // Compute 2-segment legs (hip -> knee -> foot)
    const [lkX, lkY] = segEnd(0, 0, THIGH_L, pose.lThigh);
    const [lfX, lfY] = segEnd(lkX, lkY, SHIN_L, pose.lThigh - pose.lKnee);

    const [rkX, rkY] = segEnd(0, 0, THIGH_L, pose.rThigh);
    const [rfX, rfY] = segEnd(rkX, rkY, SHIN_L, pose.rThigh - pose.rKnee);

    // Center of mass pivot in local figure coordinates (hip is at (0, 0), torso goes up)
    // Foot-grounding constraint ensures feet rest crisply ON the line (never poking beneath it)
    const hipX = pose.x;
    const lowestFootLocalY = Math.max(lfY, rfY);
    const groundedHipY = GROUND_Y - lowestFootLocalY;
    const isAirborne = p >= 0.66 && p <= 0.815;
    const hipY = isAirborne
      ? BASE_HIP_Y + pose.hipOffsetY
      : Math.min(BASE_HIP_Y + pose.hipOffsetY, groundedHipY);

    // Shoulder coordinates relative to hip (torso leans forward by torsoLean)
    const leanRad = pose.torsoLean * DEG;
    const shX = Math.sin(leanRad) * TORSO_L;
    const shY = -Math.cos(leanRad) * TORSO_L;

    // Head center sits cleanly above shoulder with optional reading nod
    const headRad = (pose.torsoLean + pose.headNod * 0.55) * DEG;
    const hdX = shX + Math.sin(headRad) * (HEAD_R + 1.35);
    const hdY = shY - Math.cos(headRad) * (HEAD_R + 1.35);

    // Compute 2-segment arms (shoulder -> elbow -> hand)
    const [leX, leY] = segEnd(shX, shY, UARM_L, pose.lShoulder);
    const [lhX, lhY] = segEnd(leX, leY, FARM_L, pose.lShoulder + pose.lElbow);

    const [reX, reY] = segEnd(shX, shY, UARM_L, pose.rShoulder);
    const [rhX, rhY] = segEnd(reX, reY, FARM_L, pose.rShoulder + pose.rElbow);

    // Pivot spin cleanly around mid-torso so front-flip feels centered & weightless
    const spinPivotX = shX * 0.45;
    const spinPivotY = shY * 0.45;

    if (figureGroupRef.current) {
      figureGroupRef.current.setAttribute(
        'transform',
        `translate(${hipX.toFixed(2)}, ${hipY.toFixed(2)}) rotate(${pose.bodySpin.toFixed(2)}, ${spinPivotX.toFixed(2)}, ${spinPivotY.toFixed(2)})`
      );
    }

    if (torsoRef.current) {
      torsoRef.current.setAttribute('x1', '0');
      torsoRef.current.setAttribute('y1', '0');
      torsoRef.current.setAttribute('x2', shX.toFixed(2));
      torsoRef.current.setAttribute('y2', shY.toFixed(2));
    }

    // Mini Backpack attached to back of torso (rotates seamlessly with lean & 360° flip!)
    if (backpackGroupRef.current) {
      const bpX = shX * 0.55;
      const bpY = shY * 0.55;
      backpackGroupRef.current.setAttribute(
        'transform',
        `translate(${bpX.toFixed(2)}, ${bpY.toFixed(2)}) rotate(${pose.torsoLean.toFixed(2)})`
      );
    }

    if (headRef.current) {
      headRef.current.setAttribute('cx', hdX.toFixed(2));
      headRef.current.setAttribute('cy', hdY.toFixed(2));
    }

    if (lLegRef.current) {
      lLegRef.current.setAttribute(
        'points',
        `0,0 ${lkX.toFixed(2)},${lkY.toFixed(2)} ${lfX.toFixed(2)},${lfY.toFixed(2)}`
      );
    }
    if (rLegRef.current) {
      rLegRef.current.setAttribute(
        'points',
        `0,0 ${rkX.toFixed(2)},${rkY.toFixed(2)} ${rfX.toFixed(2)},${rfY.toFixed(2)}`
      );
    }
    if (lArmRef.current) {
      lArmRef.current.setAttribute(
        'points',
        `${shX.toFixed(2)},${shY.toFixed(2)} ${leX.toFixed(2)},${leY.toFixed(2)} ${lhX.toFixed(2)},${lhY.toFixed(2)}`
      );
    }
    if (rArmRef.current) {
      rArmRef.current.setAttribute(
        'points',
        `${shX.toFixed(2)},${shY.toFixed(2)} ${reX.toFixed(2)},${reY.toFixed(2)} ${rhX.toFixed(2)},${rhY.toFixed(2)}`
      );
    }

    // Tiny Newspaper positioned right at hands during Act 2, fluttering back on release
    if (paperGroupRef.current) {
      const rel = pose.paperReleaseT;
      const pX = (lhX + rhX) * 0.5 + 1.8 - rel * 11;
      const pY = (lhY + rhY) * 0.5 - 3.6 - Math.sin(rel * Math.PI) * 5.5 + rel * 2.5;
      const pRot = -14 - rel * 48;
      paperGroupRef.current.setAttribute('opacity', pose.paperAlpha.toFixed(3));
      paperGroupRef.current.setAttribute(
        'transform',
        `translate(${pX.toFixed(2)}, ${pY.toFixed(2)}) rotate(${pRot.toFixed(1)})`
      );
    }

    // Crisp sky-blue speed swoosh arc visible during 360° front-flip salto
    if (swooshGroupRef.current) {
      swooshGroupRef.current.setAttribute('opacity', pose.swooshAlpha.toFixed(3));
      swooshGroupRef.current.setAttribute(
        'transform',
        `translate(${hipX.toFixed(2)}, ${(hipY - 3).toFixed(2)}) rotate(${(pose.bodySpin * 0.85).toFixed(1)})`
      );
    }
  };

  useImperativeHandle(ref, () => ({
    updateProgress: renderAtProgress,
  }));

  // Render pristine initial standing/starting pose on mount
  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    renderAtProgress(reduced ? 1 : 0);
  }, []);

  return (
    <div className="flex items-end gap-2 sm:gap-3 font-mono text-[10px] sm:text-[11px] tracking-[0.14em] text-slate-600 uppercase select-none">
      <span className="font-semibold text-slate-800 whitespace-nowrap pb-[3px]">
        LUMAJANG <span className="hidden md:inline text-slate-400">08°08′S</span>
      </span>

      {/* Wide Runway SVG with Generous Sky Headroom for Front-Flip Salto */}
      <div className="relative w-[145px] xs:w-[175px] sm:w-[235px] md:w-[280px] h-[42px] sm:h-[48px] shrink-0 overflow-visible">
        <svg
          viewBox="0 0 280 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
          role="img"
          aria-label="Animasi perjalanan stickman ber-ransel dari Lumajang ke Bogor"
        >
          <defs>
            <linearGradient id="journeyRouteGrad" x1="8" y1="46" x2="272" y2="46" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>

          {/* Base muted track line */}
          <line
            x1="8"
            y1={GROUND_Y}
            x2="272"
            y2={GROUND_Y}
            stroke="#CBD5E1"
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          {/* Dynamic active sky-blue route fill trailing behind stickman */}
          <line
            ref={fillLineRef}
            x1="8"
            y1={GROUND_Y}
            x2="16"
            y2={GROUND_Y}
            stroke="url(#journeyRouteGrad)"
            strokeWidth="2.0"
            strokeLinecap="round"
          />

          {/* Subtle Start Origin Dot (Lumajang) */}
          <circle cx="8" cy={GROUND_Y} r="2.2" fill="#94A3B8" />

          {/* Destination Arrival Ripple & Glowing Dot (Bogor) */}
          <circle
            ref={arrivalRippleRef}
            cx="272"
            cy={GROUND_Y}
            r="3"
            stroke="#0EA5E9"
            strokeWidth="1.2"
            fill="none"
            opacity="0"
          />
          <circle cx="272" cy={GROUND_Y} r="2.6" fill="#0EA5E9" opacity="0.35" />

          {/* Moving Leading Energy Dot on the Line */}
          <circle ref={progressDotRef} cx="16" cy={GROUND_Y} r="3.1" fill="#0284C7" />

          {/* Salto Air-Spin Motion Swoosh Arc */}
          <g ref={swooshGroupRef} opacity="0">
            <path
              d="M -11 -7 A 13 13 0 0 1 9 -9"
              stroke="#38BDF8"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeDasharray="16 8"
            />
            <path
              d="M 10 8 A 12 12 0 0 1 -9 7"
              stroke="#0284C7"
              strokeWidth="1.15"
              strokeLinecap="round"
              opacity="0.7"
            />
          </g>

          {/* ── ARTICULATED EDITORIAL STICKMAN WITH MINI BACKPACK ── */}
          <g ref={figureGroupRef} transform={`translate(${X_START}, ${BASE_HIP_Y})`}>
            {/* Back Leg & Back Arm (slightly lighter slate for 2.5D depth separation!) */}
            <polyline
              ref={lLegRef}
              points="0,0 0,6.2 0,12.4"
              stroke="#475569"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <polyline
              ref={lArmRef}
              points="0,-8.4 0,-3.5 0,1.1"
              stroke="#475569"
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Cute Mini Backpack strapped to back of torso (callback to harbor video!) */}
            <g ref={backpackGroupRef}>
              {/* Main pack body */}
              <rect
                x="-5.4"
                y="-3.3"
                width="4.6"
                height="6.8"
                rx="1.8"
                fill="#BAE6FD"
                stroke="#0F172A"
                strokeWidth="1.35"
              />
              {/* Little top flap / pocket detail */}
              <line
                x1="-5.0"
                y1="-0.8"
                x2="-1.2"
                y2="-0.8"
                stroke="#0284C7"
                strokeWidth="1.0"
                strokeLinecap="round"
              />
            </g>

            {/* Torso */}
            <line
              ref={torsoRef}
              x1="0"
              y1="0"
              x2="0"
              y2={-TORSO_L}
              stroke="#0F172A"
              strokeWidth="1.95"
              strokeLinecap="round"
            />

            {/* Head */}
            <circle
              ref={headRef}
              cx="0"
              cy={-TORSO_L - HEAD_R - 1.35}
              r={HEAD_R}
              fill="#F4F8FC"
              stroke="#0F172A"
              strokeWidth="1.85"
            />

            {/* Front Leg & Front Arm (crisp deep slate ink) */}
            <polyline
              ref={rLegRef}
              points="0,0 0,6.2 0,12.4"
              stroke="#0F172A"
              strokeWidth="1.85"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <polyline
              ref={rArmRef}
              points="0,-8.4 0,-3.5 0,1.1"
              stroke="#0F172A"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Tiny Editorial Folded Newspaper (Act 2: Walk While Reading!) */}
            <g ref={paperGroupRef} opacity="0">
              {/* Angled open pages */}
              <path
                d="M -1.5 1.5 L 5.8 -0.8 L 7.6 5.4 L 0.3 7.6 Z"
                fill="#FFFFFF"
                stroke="#0F172A"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
              {/* Tiny sky-blue masthead header line */}
              <line x1="0.4" y1="2.4" x2="4.9" y2="1.0" stroke="#0284C7" strokeWidth="1.15" strokeLinecap="round" />
              {/* Micro text columns */}
              <line x1="1.0" y1="4.2" x2="5.4" y2="2.8" stroke="#64748B" strokeWidth="0.75" strokeLinecap="round" />
              <line x1="1.5" y1="5.7" x2="5.9" y2="4.3" stroke="#64748B" strokeWidth="0.75" strokeLinecap="round" />
            </g>
          </g>
        </svg>
      </div>

      <span className="font-semibold text-sky-700 whitespace-nowrap pb-[3px]">
        BOGOR <span className="hidden md:inline text-sky-500/80">06°35′S</span>
      </span>
    </div>
  );
});

StickmanJourneyTrack.displayName = 'StickmanJourneyTrack';

export default StickmanJourneyTrack;
