import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   HEROIC STICKMAN RUNWAY (1.75× Scale + Double Rail + 8 Milestones 01–08)
   Expressive 3-Act Runner synced with Panel 1's comedic plot twist:
     - Beat 2 (Panic 99% deletion): Frantic sprint + crimson `!` panic sign
       popping above head!
     - Beat 3 ("Untung nggak jadi."): Joyful athletic sprint with flowing
       cyan scarf, speed streaks, & footstep dust puffs lighting milestones 01–08
     - Exit (0.80–1.00): High parkour hurdle leap right into Panel 2's deck!
   Zero React re-renders: direct SVG DOM ref updates at 60/120fps.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface WorkStickmanRunnerHandle {
  updateRun: (progress: number, panicIntensity?: number) => void;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

const DEG = Math.PI / 180;
// Heroic viewBox 0 0 640 84 (~1.75x bigger editorial stickman!)
const GROUND_Y = 63;
const X_START = 28;
const X_END = 602;
const THIGH_L = 9.8;
const SHIN_L = 9.8;
const TORSO_L = 13.4;
const HEAD_R = 4.6;
const UARM_L = 7.8;
const FARM_L = 7.4;
const BASE_HIP_Y = GROUND_Y - (THIGH_L + SHIN_L); // 43.4

const MILESTONES = Array.from({ length: 8 }, (_, idx) => ({
  num: `0${idx + 1}`,
  x: 68 + idx * 71, // 68 .. 565 evenly across the double runway track
}));

const segEnd = (px: number, py: number, len: number, angleDeg: number): [number, number] => {
  const rad = angleDeg * DEG;
  return [px + Math.sin(rad) * len, py + Math.cos(rad) * len];
};

export const WorkStickmanRunner = forwardRef<WorkStickmanRunnerHandle>((_, ref) => {
  const fillLineRef = useRef<SVGLineElement>(null);
  const figureRef = useRef<SVGGElement>(null);
  const torsoRef = useRef<SVGLineElement>(null);
  const backpackRef = useRef<SVGGElement>(null);
  const scarfRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGCircleElement>(null);
  const lLegRef = useRef<SVGPolylineElement>(null);
  const rLegRef = useRef<SVGPolylineElement>(null);
  const lArmRef = useRef<SVGPolylineElement>(null);
  const rArmRef = useRef<SVGPolylineElement>(null);
  const speedLinesRef = useRef<SVGGElement>(null);
  const dustGroupRef = useRef<SVGGElement>(null);
  const panicGroupRef = useRef<SVGGElement>(null);
  const milestoneDotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const milestoneTextRefs = useRef<(SVGTextElement | null)[]>([]);

  const renderAt = (rawP: number, rawPanic = 0) => {
    const p = clamp01(rawP);
    const panic = clamp01(rawPanic);

    const runT = smoothstep(0.05, 0.98, p);
    const x = lerp(X_START, X_END, runT);

    // Light up each of the 8 project milestones as stickman sprints past them!
    for (let i = 0; i < MILESTONES.length; i++) {
      const passed = x >= MILESTONES[i].x - 4;
      const dot = milestoneDotRefs.current[i];
      const lbl = milestoneTextRefs.current[i];
      if (dot) {
        dot.setAttribute('fill', passed ? '#0284C7' : '#CBD5E1');
        dot.setAttribute('r', passed ? '3.3' : '2.4');
      }
      if (lbl) {
        lbl.setAttribute('fill', passed ? '#0F172A' : '#94A3B8');
      }
    }

    const readyW = 1 - smoothstep(0.05, 0.16, p);
    const sprintW = smoothstep(0.07, 0.18, p) * (1 - smoothstep(0.81, 0.88, p));
    const leapU = clamp01((p - 0.81) / 0.19);
    const leapArc = Math.sin(leapU * Math.PI);

    // Faster frantic cadence while panicking at 99% deletion, sleek athletic stride after!
    const phase = p * 26 * Math.PI;
    const sinR = Math.sin(phase);
    const cosR = Math.cos(phase);

    // Expressive athletic running kinematics
    let torsoLean = lerp(14, 24 + panic * 7, sprintW);
    let hipOffY = -Math.abs(sinR) * 3.8 * sprintW + readyW * 3.8;
    let lThigh = sinR * 48 * sprintW + readyW * 24;
    let lKnee = (Math.max(0, -cosR) * 62 + 16) * sprintW + readyW * 44;
    let rThigh = -sinR * 48 * sprintW - readyW * 12;
    let rKnee = (Math.max(0, cosR) * 62 + 16) * sprintW + readyW * 24;

    // Arms pump energetically (and lift higher in panic during 99% deletion!)
    let lShoulder = (-sinR * 52 + panic * 38) * sprintW - readyW * 20;
    let lElbow = (68 + Math.max(0, -sinR) * 26 + panic * 18) * sprintW + readyW * 28;
    let rShoulder = (sinR * 52 + panic * 44) * sprintW + readyW * 34;
    let rElbow = (68 + Math.max(0, sinR) * 26 + panic * 18) * sprintW + readyW * 40;

    // Heroic high parkour hurdle leap toward Panel 2!
    if (p > 0.81) {
      const lw = smoothstep(0.81, 0.87, p);
      hipOffY = lerp(hipOffY, -21 * leapArc, lw);
      torsoLean = lerp(torsoLean, 20, lw);
      lThigh = lerp(lThigh, -46, lw);
      lKnee = lerp(lKnee, 56, lw);
      rThigh = lerp(rThigh, 58, lw);
      rKnee = lerp(rKnee, 52, lw);
      lShoulder = lerp(lShoulder, -58, lw);
      lElbow = lerp(lElbow, 36, lw);
      rShoulder = lerp(rShoulder, 128, lw);
      rElbow = lerp(rElbow, 24, lw);
    }

    const [lkX, lkY] = segEnd(0, 0, THIGH_L, lThigh);
    const [lfX, lfY] = segEnd(lkX, lkY, SHIN_L, lThigh - lKnee);
    const [rkX, rkY] = segEnd(0, 0, THIGH_L, rThigh);
    const [rfX, rfY] = segEnd(rkX, rkY, SHIN_L, rThigh - rKnee);

    // Foot-grounding constraint keeps toes crisply ON top of the runway rail
    const lowestFootY = Math.max(lfY, rfY);
    const groundedHipY = GROUND_Y - lowestFootY;
    const isAirborne = p > 0.82;
    const hipY = isAirborne ? BASE_HIP_Y + hipOffY : Math.min(BASE_HIP_Y + hipOffY, groundedHipY);

    const leanRad = torsoLean * DEG;
    const shX = Math.sin(leanRad) * TORSO_L;
    const shY = -Math.cos(leanRad) * TORSO_L;
    const hdX = shX + Math.sin(leanRad) * (HEAD_R + 2.0);
    const hdY = shY - Math.cos(leanRad) * (HEAD_R + 2.0);

    const [leX, leY] = segEnd(shX, shY, UARM_L, lShoulder);
    const [lhX, lhY] = segEnd(leX, leY, FARM_L, lShoulder + lElbow);
    const [reX, reY] = segEnd(shX, shY, UARM_L, rShoulder);
    const [rhX, rhY] = segEnd(reX, reY, FARM_L, rShoulder + rElbow);

    if (fillLineRef.current) {
      fillLineRef.current.setAttribute('x2', Math.min(618, Math.max(20, x + 3)).toFixed(1));
    }
    if (figureRef.current) {
      figureRef.current.setAttribute('transform', `translate(${x.toFixed(2)}, ${hipY.toFixed(2)})`);
    }
    if (torsoRef.current) {
      torsoRef.current.setAttribute('x2', shX.toFixed(2));
      torsoRef.current.setAttribute('y2', shY.toFixed(2));
    }
    if (backpackRef.current) {
      backpackRef.current.setAttribute(
        'transform',
        `translate(${(shX * 0.56).toFixed(2)}, ${(shY * 0.56).toFixed(2)}) rotate(${torsoLean.toFixed(1)})`
      );
    }
    // Dynamic fluttering cyan scarf tail streaming behind neck while running
    if (scarfRef.current) {
      const wave = Math.sin(phase * 1.4) * 3.2;
      const tailLen = 9 + sprintW * 7 + leapArc * 6;
      scarfRef.current.setAttribute(
        'd',
        `M ${(shX - 0.5).toFixed(1)} ${(shY + 1).toFixed(1)} Q ${(shX - tailLen * 0.5).toFixed(1)} ${(shY - 1.5 + wave).toFixed(1)}, ${(shX - tailLen).toFixed(1)} ${(shY + 1.5 - wave * 0.6).toFixed(1)}`
      );
    }
    if (headRef.current) {
      headRef.current.setAttribute('cx', hdX.toFixed(2));
      headRef.current.setAttribute('cy', hdY.toFixed(2));
    }
    if (lLegRef.current) {
      lLegRef.current.setAttribute('points', `0,0 ${lkX.toFixed(2)},${lkY.toFixed(2)} ${lfX.toFixed(2)},${lfY.toFixed(2)}`);
    }
    if (rLegRef.current) {
      rLegRef.current.setAttribute('points', `0,0 ${rkX.toFixed(2)},${rkY.toFixed(2)} ${rfX.toFixed(2)},${rfY.toFixed(2)}`);
    }
    if (lArmRef.current) {
      lArmRef.current.setAttribute('points', `${shX.toFixed(2)},${shY.toFixed(2)} ${leX.toFixed(2)},${leY.toFixed(2)} ${lhX.toFixed(2)},${lhY.toFixed(2)}`);
    }
    if (rArmRef.current) {
      rArmRef.current.setAttribute('points', `${shX.toFixed(2)},${shY.toFixed(2)} ${reX.toFixed(2)},${reY.toFixed(2)} ${rhX.toFixed(2)},${rhY.toFixed(2)}`);
    }

    // Crisp horizontal speed lines trailing behind torso
    if (speedLinesRef.current) {
      const speedOp = Math.max(sprintW * 0.72, leapArc * 0.85);
      speedLinesRef.current.setAttribute('opacity', speedOp.toFixed(3));
      speedLinesRef.current.setAttribute('transform', `translate(${(x - 22).toFixed(2)}, ${(hipY - 8).toFixed(2)})`);
    }

    // Playful footstep dust puffs popping behind heels at each stride peak!
    if (dustGroupRef.current) {
      const dustCycle = Math.abs(Math.cos(phase));
      const dustOp = sprintW * dustCycle * 0.65;
      const dustDrift = (1 - dustCycle) * 10;
      dustGroupRef.current.setAttribute('opacity', dustOp.toFixed(3));
      dustGroupRef.current.setAttribute(
        'transform',
        `translate(${(x - 14 - dustDrift).toFixed(1)}, ${(GROUND_Y - 2).toFixed(1)}) scale(${(0.75 + (1 - dustCycle) * 0.45).toFixed(2)})`
      );
    }

    // Crimson panic "!" popping above stickman's head during 99% deletion shock!
    if (panicGroupRef.current) {
      panicGroupRef.current.setAttribute('opacity', panic.toFixed(3));
      const bob = Math.sin(phase * 1.5) * 1.6;
      panicGroupRef.current.setAttribute(
        'transform',
        `translate(${(x + hdX + 4).toFixed(1)}, ${(hipY + hdY - 10 + bob).toFixed(1)}) scale(${(0.75 + panic * 0.3).toFixed(2)})`
      );
    }
  };

  useImperativeHandle(ref, () => ({
    updateRun: renderAt,
  }));

  useEffect(() => {
    renderAt(0, 0);
  }, []);

  return (
    <div className="w-full flex items-end justify-between gap-3 sm:gap-5 font-mono text-[10px] sm:text-[11px] tracking-[0.18em] uppercase text-slate-500 select-none">
      <div className="hidden sm:flex flex-col items-start pb-1.5 shrink-0">
        <span className="font-bold text-slate-900">04 // VAULT</span>
        <span className="text-[9px] text-slate-400 tracking-[0.2em]">RUNWAY</span>
      </div>

      {/* Wide Heroic Double-Rail Track with 8 Project Milestones */}
      <div className="relative flex-1 max-w-[680px] h-[68px] sm:h-[82px] overflow-visible">
        <svg
          viewBox="0 0 640 84"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="workHeroicRailGrad" x1="20" y1="63" x2="620" y2="63" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="65%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>

          {/* Architectural Double Rail Track */}
          <line x1="20" y1={GROUND_Y} x2="620" y2={GROUND_Y} stroke="#CBD5E1" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="20" y1={GROUND_Y + 7} x2="612" y2={GROUND_Y + 7} stroke="#E2E8F0" strokeWidth="1.2" strokeDasharray="6 6" />

          {/* Active Glowing Trail Following Stickman */}
          <line ref={fillLineRef} x1="20" y1={GROUND_Y} x2="28" y2={GROUND_Y} stroke="url(#workHeroicRailGrad)" strokeWidth="2.8" strokeLinecap="round" />

          {/* Right Direction Chevron Tip */}
          <path d="M 613 58 L 622 63 L 613 68" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

          {/* 8 Project Milestones (01–08) Lighting Up as Stickman Passes */}
          {MILESTONES.map((m, i) => (
            <g key={m.num}>
              <line x1={m.x} y1={GROUND_Y} x2={m.x} y2={GROUND_Y + 7} stroke="#CBD5E1" strokeWidth="1.2" />
              <circle
                ref={(el) => {
                  milestoneDotRefs.current[i] = el;
                }}
                cx={m.x}
                cy={GROUND_Y}
                r="2.4"
                fill="#CBD5E1"
              />
              <text
                ref={(el) => {
                  milestoneTextRefs.current[i] = el;
                }}
                x={m.x}
                y={GROUND_Y + 18}
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="8.5"
                fontWeight="700"
                fontFamily="JetBrains Mono, monospace"
              >
                {m.num}
              </text>
            </g>
          ))}

          {/* Footstep Dust Puffs */}
          <g ref={dustGroupRef} opacity="0">
            <circle cx="0" cy="-2" r="2.8" fill="#CBD5E1" />
            <circle cx="-6" cy="-4.5" r="2.0" fill="#94A3B8" opacity="0.7" />
            <circle cx="4" cy="-5" r="1.4" fill="#38BDF8" opacity="0.65" />
          </g>

          {/* Athletic Sprint Speed Lines */}
          <g ref={speedLinesRef} opacity="0">
            <line x1="-18" y1="-4" x2="0" y2="-4" stroke="#38BDF8" strokeWidth="2.0" strokeLinecap="round" />
            <line x1="-26" y1="3" x2="-4" y2="3" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="-14" y1="9" x2="2" y2="9" stroke="#38BDF8" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
          </g>

          {/* Crimson Panic "!" Sign During 99% Deletion Fake-Out */}
          <g ref={panicGroupRef} opacity="0">
            <line x1="0" y1="-8" x2="0" y2="0" stroke="#F43F5E" strokeWidth="2.8" strokeLinecap="round" />
            <circle cx="0" cy="4.2" r="1.5" fill="#F43F5E" />
          </g>

          {/* ── HEROIC 1.75× EDITORIAL INK STICKMAN WITH BACKPACK & FLOWING SCARF ── */}
          <g ref={figureRef} transform={`translate(${X_START}, ${BASE_HIP_Y})`}>
            {/* Back Leg & Arm (depth-separated slate) */}
            <polyline ref={lLegRef} points="0,0 0,9.8 0,19.6" stroke="#475569" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <polyline ref={lArmRef} points="0,-13.4 0,-5.6 0,1.8" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

            {/* Flowing Sky-Blue Scarf Tail */}
            <path ref={scarfRef} d="M -0.5 -12 Q -6 -13, -12 -11" stroke="#0EA5E9" strokeWidth="2.4" strokeLinecap="round" fill="none" />

            {/* Detailed Signature Sky-Blue Backpack */}
            <g ref={backpackRef}>
              <rect x="-8.4" y="-5.2" width="7.2" height="10.6" rx="2.6" fill="#BAE6FD" stroke="#0F172A" strokeWidth="1.9" />
              <line x1="-7.8" y1="-1.2" x2="-1.8" y2="-1.2" stroke="#0284C7" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="-4.8" cy="2.0" r="0.9" fill="#0284C7" />
            </g>

            {/* Torso */}
            <line ref={torsoRef} x1="0" y1="0" x2="0" y2={-TORSO_L} stroke="#0F172A" strokeWidth="2.7" strokeLinecap="round" />

            {/* Head */}
            <circle ref={headRef} cx="0" cy={-TORSO_L - HEAD_R - 2.0} r={HEAD_R} fill="#F5F4F0" stroke="#0F172A" strokeWidth="2.5" />

            {/* Front Leg & Arm */}
            <polyline ref={rLegRef} points="0,0 0,9.8 0,19.6" stroke="#0F172A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <polyline ref={rArmRef} points="0,-13.4 0,-5.6 0,1.8" stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        </svg>
      </div>

      <div className="flex flex-col items-end pb-1.5 shrink-0">
        <span className="font-bold text-slate-900 flex items-center gap-1.5">
          <span>THE DECK</span>
          <span className="text-sky-600">→</span>
        </span>
        <span className="hidden sm:inline text-[9px] text-slate-400 tracking-[0.18em]">SCROLL TO GLIDE</span>
      </div>
    </div>
  );
});

WorkStickmanRunner.displayName = 'WorkStickmanRunner';

export default WorkStickmanRunner;
