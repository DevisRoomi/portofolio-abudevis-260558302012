import React, { useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   LIVE MULTI-COLOR CODE RAIN PILL
   Dark obsidian glass capsule with crisp, readable syntax-highlighted code
   cascading downward like neon rain (cyan, magenta, amber, emerald, violet).
   - High-DPI Retina canvas (devicePixelRatio scaled)
   - Zero weird blue outer border/glow; clean editorial dark contrast
   - IntersectionObserver auto-pause when off-screen
   - Hover: smooth bullet-time slow-down + brightness boost for legibility
   ═══════════════════════════════════════════════════════════════════════════ */

const SYNTAX_TOKENS = [
  'const',
  '=>',
  'fn()',
  'ret',
  '<div>',
  '01',
  '10',
  'if()',
  'let',
  '{}',
  '[]',
  'async',
  '();',
  'try',
  '::',
  '0x',
];

const SYNTAX_PALETTE = [
  { main: '#38BDF8', glow: 'rgba(56, 189, 248, 0.55)', beam: 'rgba(56, 189, 248, 0.14)' }, // Electric Cyan
  { main: '#F472B6', glow: 'rgba(244, 114, 182, 0.55)', beam: 'rgba(244, 114, 182, 0.14)' }, // Neon Magenta/Pink
  { main: '#FBBF24', glow: 'rgba(251, 191, 36, 0.52)', beam: 'rgba(251, 191, 36, 0.13)' }, // Warm Amber Gold
  { main: '#34D399', glow: 'rgba(52, 211, 153, 0.52)', beam: 'rgba(52, 211, 153, 0.13)' }, // Mint Emerald
  { main: '#C084FC', glow: 'rgba(192, 132, 252, 0.55)', beam: 'rgba(192, 132, 252, 0.14)' }, // Vivid Violet
  { main: '#FB7185', glow: 'rgba(251, 113, 133, 0.52)', beam: 'rgba(251, 113, 133, 0.12)' }, // Coral Syntax Red
];

interface RainColumn {
  x: number;
  y: number;
  speed: number;
  fontSize: number;
  colorIdx: number;
  tokens: string[];
  stepY: number;
  phase: number;
}

export const CodeRainPill: React.FC = () => {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isHoveredRef = useRef<boolean>(false);
  const speedScaleRef = useRef<number>(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    let animId = 0;
    let isVisible = true;
    let width = 140;
    let height = 56;
    let columns: RainColumn[] = [];

    const initColumns = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(88, Math.round(rect.width || 136));
      height = Math.max(34, Math.round(rect.height || 54));
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Clean readable columns evenly distributed across pill
      const colCount = width >= 120 ? 8 : 6;
      const colSpacing = width / colCount;

      columns = Array.from({ length: colCount }, (_, i) => {
        const fontSize = width >= 120 ? (i % 2 === 0 ? 8.5 : 7.5) : 7.0;
        const stepY = fontSize + 2.8;
        const tokenCount = 8;
        const tokens = Array.from(
          { length: tokenCount },
          (_, tIdx) => SYNTAX_TOKENS[(i * 5 + tIdx * 3) % SYNTAX_TOKENS.length]
        );
        return {
          x: colSpacing * i + colSpacing * 0.5,
          y: ((i * 23) % (height + 44)) - 16,
          speed: 0.34 + (i % 3) * 0.14 + (i % 2) * 0.06,
          fontSize,
          colorIdx: i % SYNTAX_PALETTE.length,
          tokens,
          stepY,
          phase: i * 1.3,
        };
      });
    };

    initColumns();

    const resizeObserver = new ResizeObserver(() => {
      initColumns();
      if (prefersReducedMotion) drawFrame(0);
    });
    resizeObserver.observe(wrap);

    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    io.observe(wrap);

    let tick = 0;

    const drawFrame = (dt: number) => {
      tick += dt;
      const targetScale = isHoveredRef.current ? 0.38 : 1.0;
      speedScaleRef.current += (targetScale - speedScaleRef.current) * 0.1;

      // Crisp obsidian background
      ctx.fillStyle = '#070A12';
      ctx.fillRect(0, 0, width, height);

      // Subtle bottom rainbow nebula glow (inspired by colorful code waterfall mist)
      const mistGrad = ctx.createLinearGradient(0, height * 0.62, width, height);
      mistGrad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
      mistGrad.addColorStop(0.45, 'rgba(244, 114, 182, 0.16)');
      mistGrad.addColorStop(0.8, 'rgba(251, 191, 36, 0.12)');
      mistGrad.addColorStop(1, 'rgba(52, 211, 153, 0.12)');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, height * 0.58, width, height * 0.42);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let c = 0; c < columns.length; c++) {
        const col = columns[c];
        const pal = SYNTAX_PALETTE[col.colorIdx];

        if (dt > 0) {
          col.y += col.speed * speedScaleRef.current;
          const streamHeight = col.tokens.length * col.stepY;
          if (col.y - streamHeight > height + 8) {
            col.y = -4;
            // Gently cycle syntax token for fresh living code stream
            const shifted = col.tokens.shift();
            if (shifted) col.tokens.push(shifted);
          }
        }

        // Luminous vertical rain beam behind column
        const beamGrad = ctx.createLinearGradient(col.x, 0, col.x, height);
        beamGrad.addColorStop(0, 'transparent');
        beamGrad.addColorStop(0.5, pal.beam);
        beamGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(col.x - 1.2, 0, 2.4, height);

        // Draw crisp cascading syntax glyphs
        ctx.font = `600 ${col.fontSize}px "JetBrains Mono", ui-monospace, monospace`;

        for (let k = 0; k < col.tokens.length; k++) {
          const gy = col.y - k * col.stepY;
          if (gy < -10 || gy > height + 10) continue;

          const isHead = k === 0;
          const tailFade = Math.max(0.14, 1 - k / col.tokens.length);
          const hoverBoost = isHoveredRef.current ? 1.18 : 1.0;

          ctx.save();
          ctx.globalAlpha = Math.min(1, tailFade * hoverBoost);

          if (isHead) {
            ctx.shadowColor = pal.glow;
            ctx.shadowBlur = isHoveredRef.current ? 8 : 5;
            ctx.fillStyle = '#FFFFFF';
          } else {
            ctx.shadowColor = pal.glow;
            ctx.shadowBlur = 2.5;
            ctx.fillStyle = pal.main;
          }

          ctx.fillText(col.tokens[k], col.x, gy);
          ctx.restore();
        }
      }

      // Soft top & bottom vignette so code rain enters & fades smoothly
      const topFade = ctx.createLinearGradient(0, 0, 0, height * 0.24);
      topFade.addColorStop(0, 'rgba(7, 10, 18, 0.85)');
      topFade.addColorStop(1, 'rgba(7, 10, 18, 0)');
      ctx.fillStyle = topFade;
      ctx.fillRect(0, 0, width, height * 0.24);

      const botFade = ctx.createLinearGradient(0, height * 0.78, 0, height);
      botFade.addColorStop(0, 'rgba(7, 10, 18, 0)');
      botFade.addColorStop(1, 'rgba(7, 10, 18, 0.65)');
      ctx.fillStyle = botFade;
      ctx.fillRect(0, height * 0.78, width, height * 0.22);
    };

    if (prefersReducedMotion) {
      drawFrame(0);
    } else {
      const loop = () => {
        if (isVisible) {
          drawFrame(1);
        }
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <span
      ref={wrapRef}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
      className="about-capsule group/code relative inline-flex items-center justify-center align-middle mx-1.5 sm:mx-2.5 -mt-1 sm:-mt-2 cursor-default select-none will-change-transform"
    >
      <span className="relative block w-[86px] h-[34px] xs:w-[98px] xs:h-[40px] sm:w-[124px] sm:h-[50px] md:w-[142px] md:h-[56px] rounded-full overflow-hidden bg-[#070A12] border border-slate-900/25 ring-2 ring-white/85 shadow-[0_10px_24px_rgba(15,23,42,0.16)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/code:scale-[1.12] group-hover/code:shadow-[0_16px_34px_rgba(15,23,42,0.28)]">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          aria-hidden="true"
        />
        {/* Crisp top dark-glass reflection sheen (neutral, zero blue tint) */}
        <span className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-transparent pointer-events-none" />
      </span>

      {/* Floating Hover Tooltip */}
      <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-slate-900/95 text-white font-mono text-[9.5px] font-semibold tracking-[0.15em] uppercase whitespace-nowrap shadow-lg opacity-0 translate-y-1.5 group-hover/code:opacity-100 group-hover/code:translate-y-0 transition-all duration-300 z-40">
        CLEAN CODE &amp; SYSTEMS
      </span>
    </span>
  );
};

export default CodeRainPill;
