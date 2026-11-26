import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speedY: number;
  speedX: number;
  wobble: number;
  wobbleSpeed: number;
  rotation: number;
  vRot: number;
  pitch: number;
  pitchSpeed: number;
  shimmer: number;
  shimmerSpeed: number;
  windVx: number;
  windVy: number;
  type: 'dust' | 'mid' | 'macro';
  spriteIdx: number;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRISMATIC 6-FOLD DENDRITIC GLACIAL SNOW CANVAS (BRIGHT SKY EDITION)
   Upgrades over previous version:
   1. Visible on bright light-blue sky (#EEF7FF -> #B6E1FE): uses `normal`
      blending + dual-pass crystal drawing (crisp sky-azure frosted rim
      behind pure white 6-fold stellar dendrites) so crystals glint vividly!
   2. IntersectionObserver auto-pause: zero GPU/CPU cost when off-screen.
   3. Respects `prefers-reduced-motion: reduce` (draws 1 clean static frame).
   ═══════════════════════════════════════════════════════════════════════════ */
function createPrismaticSnowflakeSprites(): HTMLCanvasElement[] {
  if (typeof document === 'undefined') return [];

  const sizes = [28, 36, 46];
  const sprites: HTMLCanvasElement[] = [];

  sizes.forEach((size, variant) => {
    const canvas = document.createElement('canvas');
    const dpr = 2;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.42;

    const drawCrystalGeometry = () => {
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 3);

        // Main stem
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -r);
        ctx.stroke();

        // Dendritic branch pairs
        const branchTiers = variant === 1 ? [0.32, 0.56, 0.78] : [0.36, 0.62, 0.84];
        const branchLengths = [r * 0.34, r * 0.28, r * 0.18];

        branchTiers.forEach((tier, bIdx) => {
          const yPos = -r * tier;
          const bLen = branchLengths[bIdx];

          ctx.beginPath();
          ctx.moveTo(0, yPos);
          ctx.lineTo(-bLen * 0.866, yPos + bLen * 0.5);
          ctx.moveTo(0, yPos);
          ctx.lineTo(bLen * 0.866, yPos + bLen * 0.5);
          ctx.stroke();

          if (bIdx < 2) {
            const subDist = 0.52;
            const subLen = bLen * 0.42;
            const lx = -bLen * 0.866 * subDist;
            const ly = yPos + bLen * 0.5 * subDist;
            const rx = bLen * 0.866 * subDist;
            const ry = yPos + bLen * 0.5 * subDist;

            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(lx - subLen * 0.5, ly - subLen * 0.866);
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx + subLen * 0.5, ry - subLen * 0.866);
            ctx.stroke();
          }
        });

        // Diamond tip
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(-r * 0.055, -r * 0.93);
        ctx.lineTo(0, -r * 1.04);
        ctx.lineTo(r * 0.055, -r * 0.93);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // Central hexagonal facet
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const hx = Math.cos(angle) * (r * 0.14);
        const hy = Math.sin(angle) * (r * 0.14);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Pass 1: Crisp Frosted Azure Outer Rim (gives unmistakable visibility on bright alpine sky!)
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.46)';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.42)';
    ctx.lineWidth = Math.max(1.45, size * 0.072);
    ctx.shadowColor = 'rgba(2, 132, 199, 0.28)';
    ctx.shadowBlur = Math.max(1.5, size * 0.08);
    drawCrystalGeometry();

    // Pass 2: Pure Radiant Icy-White Core
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.98)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
    ctx.lineWidth = Math.max(0.7, size * 0.036);
    drawCrystalGeometry();

    ctx.restore();
    sprites.push(canvas);
  });

  return sprites;
}

export const GlacialSnowCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animId = 0;
    let isVisible = false;
    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || 800);

    const sprites = createPrismaticSnowflakeSprites();
    if (sprites.length === 0) return;

    let mouseX = -9999;
    let mouseY = -9999;
    let lastMouseX = -9999;
    let lastMouseY = -9999;
    let mouseVx = 0;
    let mouseVy = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) return;
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      if (lastMouseX !== -9999) {
        mouseVx = (currentX - lastMouseX) * 0.38;
        mouseVy = (currentY - lastMouseY) * 0.38;
      }
      lastMouseX = currentX;
      lastMouseY = currentY;
      mouseX = currentX;
      mouseY = currentY;
    };

    const handleMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
      mouseVx = 0;
      mouseVy = 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = Math.min(58, Math.max(34, Math.floor(width / 25)));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const depthRoll = Math.random();
      let type: 'dust' | 'mid' | 'macro' = 'mid';
      let size = 18;
      let alpha = 0.72;
      let speedY = 0.65;
      let sizeVariant = 1;

      if (depthRoll < 0.28) {
        type = 'dust';
        size = 2.5 + Math.random() * 3.5;
        alpha = 0.35 + Math.random() * 0.3;
        speedY = 0.3 + Math.random() * 0.35;
        sizeVariant = 0;
      } else if (depthRoll < 0.80) {
        type = 'mid';
        size = 15 + Math.random() * 12;
        alpha = 0.58 + Math.random() * 0.3;
        speedY = 0.55 + Math.random() * 0.55;
        sizeVariant = Math.floor(Math.random() * 2);
      } else {
        type = 'macro';
        size = 28 + Math.random() * 14;
        alpha = 0.76 + Math.random() * 0.22;
        speedY = 0.9 + Math.random() * 0.65;
        sizeVariant = 2;
      }

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        alpha,
        speedY,
        speedX: (Math.random() - 0.5) * 0.28,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.012 + Math.random() * 0.016,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.012,
        pitch: Math.random() * Math.PI * 2,
        pitchSpeed: 0.014 + Math.random() * 0.018,
        shimmer: Math.random() * Math.PI * 2,
        shimmerSpeed: 0.02 + Math.random() * 0.03,
        windVx: 0,
        windVy: 0,
        type,
        spriteIdx: sizeVariant,
      });
    }

    let frameCount = 0;

    const drawStep = (advance: boolean) => {
      ctx.clearRect(0, 0, width, height);
      if (advance) frameCount++;

      mouseVx *= 0.88;
      mouseVy *= 0.88;
      const ambientBreeze = Math.sin(frameCount * 0.006) * 0.16;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (advance) {
          p.wobble += p.wobbleSpeed;
          p.rotation += p.vRot;
          p.pitch += p.pitchSpeed;
          p.shimmer += p.shimmerSpeed;

          if (mouseX !== -9999 && mouseY !== -9999) {
            const dx = p.x - mouseX;
            const dy = p.y - mouseY;
            const dist = Math.hypot(dx, dy);
            const windRadius = p.type === 'macro' ? 90 : p.type === 'mid' ? 72 : 52;

            if (dist < windRadius && dist > 1) {
              const force = 1 - dist / windRadius;
              const angle = Math.atan2(dy, dx);
              p.windVx += Math.cos(angle) * force * 0.72 + mouseVx * force * 0.24;
              p.windVy += Math.sin(angle) * force * 0.52 + mouseVy * force * 0.14 - force * 0.2;
              p.vRot += (Math.random() - 0.5) * force * 0.025;
            }
          }

          p.windVx *= 0.94;
          p.windVy *= 0.94;

          p.x += p.speedX + Math.sin(p.wobble) * 0.5 + ambientBreeze + p.windVx;
          p.y += p.speedY + p.windVy;

          if (p.y > height + 40) {
            p.y = -40;
            p.x = Math.random() * width;
            p.windVx = 0;
            p.windVy = 0;
          } else if (p.y < -40) {
            p.y = height + 30;
          }

          if (p.x < -40) p.x = width + 30;
          else if (p.x > width + 40) p.x = -30;
        }

        if (p.type === 'dust') {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * (0.85 + 0.15 * Math.sin(p.shimmer))})`;
          ctx.strokeStyle = `rgba(14, 165, 233, ${p.alpha * 0.55})`;
          ctx.lineWidth = 0.8;
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        } else {
          const sprite = sprites[p.spriteIdx];
          if (!sprite) continue;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          const pitchFactor = 0.38 + 0.62 * Math.abs(Math.cos(p.pitch));
          ctx.scale(1, pitchFactor);
          const glint = 0.85 + 0.15 * Math.sin(p.shimmer);
          ctx.globalAlpha = Math.min(1, p.alpha * glint);
          ctx.drawImage(sprite, -p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      }
    };

    const render = () => {
      if (!isVisible) {
        animId = 0;
        return;
      }
      drawStep(true);
      animId = requestAnimationFrame(render);
    };

    // Truly cancel & restart RAF when Skills section enters/leaves viewport (0% idle off-screen!)
    const io = new IntersectionObserver(
      (entries) => {
        const nowVis = entries[0]?.isIntersecting ?? false;
        isVisible = nowVis;
        if (prefersReducedMotion) {
          if (nowVis) drawStep(false);
          return;
        }
        if (nowVis && !animId) {
          animId = requestAnimationFrame(render);
        } else if (!nowVis && animId) {
          cancelAnimationFrame(animId);
          animId = 0;
        }
      },
      { threshold: 0.02 }
    );
    io.observe(canvas);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      io.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full will-change-transform"
    />
  );
};
