import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Pause, Play } from 'lucide-react';
import { GlacialSnowCanvas } from '../components/GlacialSnowCanvas';

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════════════════
   05 · SKILLS SECTION — BRIGHT ALPINE GLACIAL + DUAL OPPOSING VELOCITY MARQUEE
   Upgrades over previous version:
   1. Seamless Bright Alpine Ice sky (#F5F4F0 -> #EEF7FF -> #D9EFFF -> #B6E1FE)
      with visible Prismatic 6-Fold Snowflakes (`mixBlendMode: normal`)
   2. Dual Opposing Infinite Velocity Marquee (Track 1: 11 Web Core Left,
      Track 2: 10 AI & Dev Tooling Right — ZERO jittery 3-of-5 swap, ZERO pin)
   3. Real-time Lenis scroll velocity surge + dynamic `skewX` lean!
   4. Soft edge fog alpha mask (cards fade smoothly at left/right edges)
   5. Hover "Focus Lock": hovered track smoothly decelerates to rest, sibling
      cards dim gently, hovered card lifts in 3D with brand-tinted aura glow!
   6. Live Telemetry Inspector Bar showing hovered tool's Role & Projects Used
   7. Zero React re-renders on cursor movement (pure CSS custom properties)
   ═══════════════════════════════════════════════════════════════════════════ */

export interface ArsenalItem {
  id: string;
  name: string;
  category: string;
  role: string;
  usedIn: string;
  brandColor: string;
  brandGlow: string;
  logoSrc: string;
  fallbackSrc?: string;
}

const WEB_CORE_STACK: ArsenalItem[] = [
  {
    id: 'php',
    name: 'PHP',
    category: 'BACKEND RUNTIME',
    role: 'Server-Side Application Logic',
    usedIn: 'E-Report · Laravel Ecosystem',
    brandColor: '#777BB4',
    brandGlow: 'rgba(119, 123, 180, 0.24)',
    logoSrc: 'https://cdn.simpleicons.org/php/777BB4',
  },
  {
    id: 'laravel',
    name: 'Laravel',
    category: 'FULL-STACK MVC',
    role: 'Web Architecture & REST Systems',
    usedIn: 'Pentacart · Basoku · Tahfidz · Matchaverse',
    brandColor: '#FF2D20',
    brandGlow: 'rgba(255, 45, 32, 0.22)',
    logoSrc: 'https://cdn.simpleicons.org/laravel/FF2D20',
  },
  {
    id: 'livewire',
    name: 'Livewire',
    category: 'REACTIVE UI',
    role: 'Dynamic Server-Driven Interfaces',
    usedIn: 'Pentacart · Basoku Calculator',
    brandColor: '#FB70A9',
    brandGlow: 'rgba(251, 112, 169, 0.26)',
    logoSrc: '/logos/livewire.png',
    fallbackSrc: 'https://cdn.simpleicons.org/livewire/FB70A9',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'STATIC TYPED JS',
    role: 'Type-Safe Front-End Engineering',
    usedIn: 'DEVIS Portfolio v2 · CapyQuest',
    brandColor: '#3178C6',
    brandGlow: 'rgba(49, 120, 198, 0.24)',
    logoSrc: 'https://cdn.simpleicons.org/typescript/3178C6',
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    category: 'DESIGN ENGINE',
    role: 'Rapid Editorial Styling & Tokens',
    usedIn: 'Portfolio v2 · Tahfidz · Matchaverse',
    brandColor: '#06B6D4',
    brandGlow: 'rgba(6, 182, 212, 0.24)',
    logoSrc: 'https://cdn.simpleicons.org/tailwindcss/06B6D4',
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'CLIENT RUNTIME',
    role: 'Interactive Motion & DOM Physics',
    usedIn: 'Interactive Web & Motion Systems',
    brandColor: '#EAB308',
    brandGlow: 'rgba(234, 179, 8, 0.24)',
    logoSrc: 'https://cdn.simpleicons.org/javascript/EAB308',
  },
  {
    id: 'html5',
    name: 'HTML5',
    category: 'SEMANTICS',
    role: 'Accessible Document Architecture',
    usedIn: 'All Web Platforms',
    brandColor: '#E34F26',
    brandGlow: 'rgba(227, 79, 38, 0.22)',
    logoSrc: 'https://cdn.simpleicons.org/html5/E34F26',
  },
  {
    id: 'css3',
    name: 'CSS3',
    category: 'MODERN LAYOUT',
    role: '3D Transforms, Grid & Micro-Motion',
    usedIn: 'Portfolio v2 3D Card Engine',
    brandColor: '#2563EB',
    brandGlow: 'rgba(37, 99, 235, 0.24)',
    logoSrc: 'https://cdn.simpleicons.org/css/2563EB',
  },
  {
    id: 'mysql',
    name: 'MySQL',
    category: 'RELATIONAL DB',
    role: 'Normalized Schema & Query Tuning',
    usedIn: 'Pentacart · Basoku · Tahfidz · E-Report',
    brandColor: '#4479A1',
    brandGlow: 'rgba(68, 121, 161, 0.24)',
    logoSrc: 'https://cdn.simpleicons.org/mysql/4479A1',
  },
  {
    id: 'vite',
    name: 'Vite',
    category: 'ESM BUNDLER',
    role: 'Instant HMR & Production Builds',
    usedIn: 'Portfolio v2 · Duitin · CapyQuest',
    brandColor: '#646CFF',
    brandGlow: 'rgba(100, 108, 255, 0.24)',
    logoSrc: 'https://cdn.simpleicons.org/vite/646CFF',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'EDGE DEPLOY',
    role: 'Zero-Config Global Edge Hosting',
    usedIn: 'Portfolio & Cloud Deployments',
    brandColor: '#0F172A',
    brandGlow: 'rgba(15, 23, 42, 0.16)',
    logoSrc: '/logos/vercel.svg',
    fallbackSrc: 'https://cdn.simpleicons.org/vercel/0F172A',
  },
];

const AI_DEV_STACK: ArsenalItem[] = [
  {
    id: 'antigravity',
    name: 'Antigravity',
    category: 'AGENTIC IDE',
    role: 'AI-Assisted System Orchestration',
    usedIn: 'Portfolio v2 & Rapid Prototyping',
    brandColor: '#0284C7',
    brandGlow: 'rgba(2, 132, 199, 0.24)',
    logoSrc: '/logos/antigravity.svg',
    fallbackSrc: '/logos/antigravity-lockup.svg',
  },
  {
    id: 'hermes',
    name: 'Hermes Agent',
    category: 'AUTONOMOUS RUNNER',
    role: 'Automated Engineering Workflows',
    usedIn: 'Multi-Step Dev Automation',
    brandColor: '#D97706',
    brandGlow: 'rgba(217, 119, 6, 0.22)',
    logoSrc: '/logos/hermes.webp',
    fallbackSrc: '/logos/hermes.png',
  },
  {
    id: 'aistudio',
    name: 'Google AI Studio',
    category: 'MODEL STUDIO',
    role: 'Prompt & Multimodal API Prototyping',
    usedIn: 'Jarvis AI & LLM Experiments',
    brandColor: '#2563EB',
    brandGlow: 'rgba(37, 99, 235, 0.24)',
    logoSrc: '/logos/google-ai-studio.svg',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    category: 'MULTIMODAL AI',
    role: 'Visual Reasoning & Code Synthesis',
    usedIn: 'AI Product & Research Pipelines',
    brandColor: '#4285F4',
    brandGlow: 'rgba(66, 133, 244, 0.26)',
    logoSrc: '/logos/gemini.svg',
    fallbackSrc: '/logos/gemini.webp',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    category: 'REASONING LLM',
    role: 'Architecture Review & Ideation',
    usedIn: 'Daily Engineering Companion',
    brandColor: '#10A37F',
    brandGlow: 'rgba(16, 163, 127, 0.22)',
    logoSrc: '/logos/openai.svg',
    fallbackSrc: 'https://cdn.simpleicons.org/openai/10A37F',
  },
  {
    id: 'vscode',
    name: 'VS Code',
    category: 'WORKSPACE',
    role: 'Primary Code Editor & Debugging',
    usedIn: 'All Software Projects',
    brandColor: '#007ACC',
    brandGlow: 'rgba(0, 122, 204, 0.24)',
    logoSrc: '/logos/vscode.svg',
  },
  {
    id: 'laravel-herd',
    name: 'Laravel Herd',
    category: 'LOCAL DAEMON',
    role: 'Zero-Friction Native PHP Runtime',
    usedIn: 'Laravel Local Environments',
    brandColor: '#EF4444',
    brandGlow: 'rgba(239, 68, 68, 0.22)',
    logoSrc: '/logos/laravel-herd.png',
  },
  {
    id: 'flyenv',
    name: 'FlyEnv',
    category: 'MULTI-STACK ENV',
    role: 'Multi-Runtime Local Stack Manager',
    usedIn: 'Full-Stack Database & Server Testing',
    brandColor: '#0EA5E9',
    brandGlow: 'rgba(14, 165, 233, 0.24)',
    logoSrc: '/logos/flyenv.webp',
  },
  {
    id: 'git',
    name: 'Git',
    category: 'VERSION CONTROL',
    role: 'Branching, Rebase & History Hygiene',
    usedIn: 'Every Repository',
    brandColor: '#F05032',
    brandGlow: 'rgba(240, 80, 50, 0.22)',
    logoSrc: 'https://cdn.simpleicons.org/git/F05032',
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'COLLAB & CI',
    role: 'Open-Source Hosting & Collaboration',
    usedIn: 'github.com/DevisRoomi',
    brandColor: '#181717',
    brandGlow: 'rgba(24, 23, 23, 0.16)',
    logoSrc: 'https://cdn.simpleicons.org/github/181717',
  },
];

export const ASSETS_POOL: ArsenalItem[] = [...WEB_CORE_STACK, ...AI_DEV_STACK];

export const SkillsSection: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<{ track: 1 | 2; item: ArsenalItem } | null>(null);
  const [isMotionPaused, setIsMotionPaused] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const frostVeilRef = useRef<HTMLDivElement>(null);
  const row1RevealRef = useRef<HTMLDivElement>(null);
  const row2RevealRef = useRef<HTMLDivElement>(null);
  const track1Ref = useRef<HTMLDivElement>(null);
  const track2Ref = useRef<HTMLDivElement>(null);
  const skew1WrapRef = useRef<HTMLDivElement>(null);
  const skew2WrapRef = useRef<HTMLDivElement>(null);

  // Refs synced cleanly for RAF marquee without restarting loop
  const hoveredTrackRef = useRef<1 | 2 | null>(null);
  const isPausedRef = useRef<boolean>(false);
  const isVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    hoveredTrackRef.current = hoveredCard ? hoveredCard.track : null;
  }, [hoveredCard]);

  useEffect(() => {
    isPausedRef.current = isMotionPaused;
  }, [isMotionPaused]);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 1. GSAP ALPINE FROST CURTAIN TRANSITION (WORK -> SKILLS) + SERENE REVEAL ──
  useEffect(() => {
    if (!containerRef.current || !sectionRef.current || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // A. Scroll-scrubbed curved Frost Curtain rising smoothly out of Work Studio
      gsap.fromTo(
        sectionRef.current,
        {
          borderTopLeftRadius: '64px',
          borderTopRightRadius: '64px',
          scale: 0.965,
          y: 34,
        },
        {
          borderTopLeftRadius: '0px',
          borderTopRightRadius: '0px',
          scale: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 96%',
            end: 'top 22%',
            scrub: 0.75,
            invalidateOnRefresh: true,
          },
        }
      );

      // B. Top Alpine Mist Veil gently parting as snow awakens
      if (frostVeilRef.current) {
        gsap.fromTo(
          frostVeilRef.current,
          { opacity: 0.95, y: 0 },
          {
            opacity: 0,
            y: -44,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 92%',
              end: 'top 28%',
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          }
        );
      }

      // C. Calm Masked Serif + Sans Line Reveal
      gsap.fromTo(
        '.skills-masked-line',
        { yPercent: 108 },
        {
          yPercent: 0,
          duration: 0.92,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
            once: true,
          },
        }
      );

      gsap.fromTo(
        '.skills-header-fade',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
            once: true,
          },
        }
      );

      // D. Opposing Track Cinematic Slide-In (decoupled from RAF marquee & skewX!)
      if (row1RevealRef.current) {
        gsap.fromTo(
          row1RevealRef.current,
          { x: -75, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.95,
            ease: 'power3.out',
            clearProps: 'transform',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 74%',
              once: true,
            },
          }
        );
      }
      if (row2RevealRef.current) {
        gsap.fromTo(
          row2RevealRef.current,
          { x: 75, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.95,
            delay: 0.08,
            ease: 'power3.out',
            clearProps: 'transform',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 74%',
              once: true,
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // ── 2. DUAL OPPOSING VELOCITY MARQUEE ENGINE (Auto-stops RAF 100% off-screen!) ──
  useEffect(() => {
    if (prefersReducedMotion || !sectionRef.current) return;

    const skew1To = skew1WrapRef.current
      ? gsap.quickTo(skew1WrapRef.current, 'skewX', { duration: 0.45, ease: 'power2.out' })
      : null;
    const skew2To = skew2WrapRef.current
      ? gsap.quickTo(skew2WrapRef.current, 'skewX', { duration: 0.45, ease: 'power2.out' })
      : null;

    let animId = 0;
    let offset1 = 0;
    let offset2 = 0;
    let speedMult1 = 1;
    let speedMult2 = 1;
    let lastScrollY = window.scrollY;
    let smoothVelocity = 0;

    // Seed Track 2 at -halfWidth on first valid measure so rightward motion wraps seamlessly
    let initializedTrack2 = false;

    const tick = () => {
      if (!isVisibleRef.current) {
        animId = 0;
        return;
      }

      if (track1Ref.current && track2Ref.current) {
        const half1 = track1Ref.current.scrollWidth / 2;
        const half2 = track2Ref.current.scrollWidth / 2;

        if (!initializedTrack2 && half2 > 0) {
          offset2 = -half2;
          initializedTrack2 = true;
        }

        // Read live Lenis velocity (or native scroll delta fallback)
        const lenisVel = (window as unknown as { __lenis?: { velocity?: number } }).__lenis?.velocity;
        const rawVel =
          typeof lenisVel === 'number'
            ? lenisVel
            : (window.scrollY - lastScrollY) * 0.9;
        lastScrollY = window.scrollY;

        smoothVelocity += (rawVel - smoothVelocity) * 0.12;
        const velBoost = Math.max(-6.5, Math.min(6.5, smoothVelocity * 0.14));

        // Smooth Focus-Lock deceleration when hovering a track or pausing
        const targetMult1 = isPausedRef.current || hoveredTrackRef.current === 1 ? 0 : 1;
        const targetMult2 = isPausedRef.current || hoveredTrackRef.current === 2 ? 0 : 1;
        speedMult1 += (targetMult1 - speedMult1) * 0.085;
        speedMult2 += (targetMult2 - speedMult2) * 0.085;

        // Track 1 glides LEFT; Track 2 glides RIGHT (opposing surge with scroll velocity!)
        const baseSpeed1 = 0.78;
        const baseSpeed2 = 0.72;
        const delta1 = (-baseSpeed1 - velBoost * 0.65) * speedMult1;
        const delta2 = (baseSpeed2 + velBoost * 0.65) * speedMult2;

        offset1 += delta1;
        offset2 += delta2;

        if (half1 > 0) {
          while (offset1 <= -half1) offset1 += half1;
          while (offset1 > 0) offset1 -= half1;
        }
        if (half2 > 0) {
          while (offset2 >= 0) offset2 -= half2;
          while (offset2 < -half2) offset2 += half2;
        }

        track1Ref.current.style.transform = `translate3d(${offset1.toFixed(2)}px, 0, 0)`;
        track2Ref.current.style.transform = `translate3d(${offset2.toFixed(2)}px, 0, 0)`;

        // Subtle tactile dynamic skewX reacting to scroll speed (opposing lean!)
        const targetSkew = Math.max(-4.5, Math.min(4.5, smoothVelocity * 0.085));
        skew1To?.(-targetSkew * speedMult1);
        skew2To?.(targetSkew * speedMult2);
      }

      animId = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const nowVisible = entries[0]?.isIntersecting ?? false;
        isVisibleRef.current = nowVisible;
        if (nowVisible && !animId) {
          lastScrollY = window.scrollY;
          animId = requestAnimationFrame(tick);
        } else if (!nowVisible && animId) {
          cancelAnimationFrame(animId);
          animId = 0;
        }
      },
      { threshold: 0.02 }
    );
    io.observe(sectionRef.current);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      io.disconnect();
    };
  }, [prefersReducedMotion]);

  // Zero-rerender cursor ambient glacial spotlight via CSS custom properties
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    sectionRef.current.style.setProperty('--sx', `${e.clientX - rect.left}px`);
    sectionRef.current.style.setProperty('--sy', `${e.clientY - rect.top}px`);
    sectionRef.current.style.setProperty('--s-op', '1');
  };

  const handleMouseLeave = () => {
    if (!sectionRef.current) return;
    sectionRef.current.style.setProperty('--s-op', '0');
    setHoveredCard(null);
  };

  const renderCard = (item: ArsenalItem, trackNum: 1 | 2, dupKey: string) => {
    const isTrackFocused = hoveredCard?.track === trackNum;
    const isThisHovered = hoveredCard?.track === trackNum && hoveredCard.item.id === item.id;
    const isDimmed = isTrackFocused && !isThisHovered;

    return (
      <div
        key={`${trackNum}-${dupKey}-${item.id}`}
        onMouseEnter={() => setHoveredCard({ track: trackNum, item })}
        onMouseLeave={() => setHoveredCard(null)}
        onClick={() =>
          setHoveredCard((prev) =>
            prev?.item.id === item.id ? null : { track: trackNum, item }
          )
        }
        className={`group relative w-[176px] sm:w-[208px] md:w-[224px] h-[108px] sm:h-[122px] md:h-[128px] shrink-0 rounded-2xl border flex flex-col items-center justify-center p-3.5 cursor-pointer select-none transition-all duration-300 ease-out ${
          isThisHovered
            ? 'bg-white border-sky-400/80 -translate-y-1.5 scale-[1.04] z-20'
            : isDimmed
              ? 'bg-white/70 border-white/80 opacity-45 scale-[0.96]'
              : 'bg-white/90 border-white/95 shadow-[0_6px_22px_rgba(14,116,144,0.06)] hover:bg-white'
        }`}
        style={{
          boxShadow: isThisHovered
            ? `0 18px 38px -8px ${item.brandGlow}, 0 6px 16px rgba(15, 23, 42, 0.08)`
            : undefined,
        }}
      >
        {/* Subtle Brand-Colored Radial Halo Inside Card on Hover */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isThisHovered ? 1 : 0,
            background: `radial-gradient(120px circle at 50% 42%, ${item.brandGlow}, transparent 75%)`,
          }}
        />

        {/* Crisp Corner Precision Crosshairs [ ] */}
        <span
          className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l transition-all duration-200 pointer-events-none"
          style={{
            borderColor: isThisHovered ? item.brandColor : 'rgba(2, 132, 199, 0.25)',
            opacity: isThisHovered ? 1 : 0.45,
          }}
        />
        <span
          className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r transition-all duration-200 pointer-events-none"
          style={{
            borderColor: isThisHovered ? item.brandColor : 'rgba(2, 132, 199, 0.25)',
            opacity: isThisHovered ? 1 : 0.45,
          }}
        />
        <span
          className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l transition-all duration-200 pointer-events-none"
          style={{
            borderColor: isThisHovered ? item.brandColor : 'rgba(2, 132, 199, 0.25)',
            opacity: isThisHovered ? 1 : 0.45,
          }}
        />
        <span
          className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r transition-all duration-200 pointer-events-none"
          style={{
            borderColor: isThisHovered ? item.brandColor : 'rgba(2, 132, 199, 0.25)',
            opacity: isThisHovered ? 1 : 0.45,
          }}
        />

        {/* Centered Uniform Logo Container */}
        <div
          className={`relative z-10 flex items-center justify-center h-10 sm:h-11 w-full transition-transform duration-300 ${
            isThisHovered ? '-translate-y-2' : 'translate-y-0'
          }`}
        >
          <img
            src={item.logoSrc}
            alt={item.name}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              if (item.fallbackSrc && e.currentTarget.src !== item.fallbackSrc) {
                e.currentTarget.src = item.fallbackSrc;
              }
            }}
            className={`max-h-[34px] sm:max-h-[38px] max-w-[96px] w-auto h-auto object-contain pointer-events-none transition-all duration-300 ${
              isThisHovered
                ? 'grayscale-0 opacity-100 scale-110'
                : 'grayscale opacity-75'
            }`}
          />
        </div>

        {/* Crisp Tool Name + Tiny Category Dot on Hover */}
        <div
          className={`absolute bottom-2.5 inset-x-2 flex items-center justify-center gap-1.5 transition-all duration-300 pointer-events-none ${
            isThisHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1.5'
          }`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: item.brandColor }}
          />
          <span className="font-mono text-[9.5px] sm:text-[10px] font-bold tracking-[0.16em] uppercase text-slate-900 truncate">
            {item.name}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div id="skills-container" ref={containerRef} className="relative z-20 w-full overflow-x-clip bg-[#F5F4F0]">
      <section
        id="skills"
        ref={sectionRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full min-h-[90vh] sm:min-h-[96vh] text-slate-900 overflow-hidden flex flex-col justify-between pt-20 sm:pt-28 pb-12 sm:pb-16 will-change-transform shadow-[0_-24px_60px_rgba(14,116,144,0.06)]"
        style={
          {
            background:
              'linear-gradient(180deg, #F5F4F0 0%, #EDF6FF 16%, #D7ECFE 52%, #DCEFFE 82%, #EEF6FF 100%)',
            '--sx': '50%',
            '--sy': '50%',
            '--s-op': '0',
          } as React.CSSProperties
        }
      >
        {/* ── 0A. ALPINE FROST MIST VEIL (Parts smoothly on scroll entry from Work) ── */}
        <div
          ref={frostVeilRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 inset-x-0 h-56 z-30 will-change-transform"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(238,247,255,0.52) 55%, rgba(238,247,255,0) 100%)',
          }}
        />

        {/* ── 0B. PRISMATIC 6-FOLD DENDRITIC SNOWFLAKES (VISIBLE ON BRIGHT SKY!) ── */}
        <GlacialSnowCanvas />

        {/* ── 1. FINE ARCHITECTURAL SPEC-GRID BACKGROUND ── */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.055]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #0284C7 1px, transparent 1px),
              linear-gradient(to bottom, #0284C7 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 85%, transparent 100%)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 85%, transparent 100%)',
          }}
        />

        {/* ── 2. UNCLIPPED FAINT EDITORIAL WATERMARK ── */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 font-sans font-extrabold text-[8.5vw] sm:text-[9.5vw] text-sky-950/[0.035] tracking-[0.12em] uppercase whitespace-nowrap select-none"
        >
          CAPABILITIES · 05
        </div>

        {/* ── 3. ZERO-RERENDER CURSOR GLACIAL LIGHT ── */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
          style={{
            opacity: 'var(--s-op)',
            background:
              'radial-gradient(500px circle at var(--sx) var(--sy), rgba(255, 255, 255, 0.58), transparent 72%)',
          }}
        />

        {/* ── 4. TOP EDITORIAL HEADER (SERENE ALPINE SERIF + CLEAN SANS — OPSI 1A) ── */}
        <div className="relative z-20 w-full max-w-6xl mx-auto px-5 xs:px-7 sm:px-12 md:px-16 shrink-0">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 pb-6 border-b border-sky-900/15">
            <div className="flex flex-col max-w-2xl">
              <span className="skills-header-fade font-mono text-[10.5px] sm:text-[11px] font-bold tracking-[0.22em] text-sky-700/90 uppercase mb-2.5">
                05 — CAPABILITIES &amp; STACK
              </span>

              <h2 className="leading-[1.08] tracking-[-0.02em] text-slate-950">
                <span className="block overflow-hidden">
                  <span
                    className="skills-masked-line block italic font-normal text-[36px] xs:text-[42px] sm:text-[52px] md:text-[58px] text-slate-900 leading-[1.12]"
                    style={{ fontFamily: '"Instrument Serif", "Playfair Display", Georgia, serif' }}
                  >
                    Instrumen di balik
                  </span>
                </span>
                <span className="block overflow-hidden">
                  <span className="skills-masked-line block font-sans font-semibold text-[27px] xs:text-[32px] sm:text-[40px] md:text-[45px] tracking-[-0.03em] text-sky-950 leading-[1.14]">
                    setiap karya yang hidup.
                  </span>
                </span>
              </h2>

              <p className="skills-header-fade font-sans text-xs sm:text-[14px] text-slate-600 leading-relaxed mt-3 max-w-xl">
                Dari baris kode hingga orkestrasi AI — perangkat yang setiap hari saya andalkan
                untuk mengubah konsep menjadi{' '}
                <span className="font-semibold text-slate-900">sistem yang stabil</span> dan terasa
                manusiawi.
              </p>
            </div>

            {/* Clean Motion Control & Stack Count */}
            <div className="skills-header-fade flex items-center gap-3 font-mono text-[10.5px] tracking-[0.16em] uppercase text-sky-900/75 shrink-0">
              <span>{ASSETS_POOL.length} VERIFIED TOOLS</span>
              <span className="text-sky-900/25">•</span>
              <button
                type="button"
                onClick={() => setIsMotionPaused((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white border border-sky-900/15 text-sky-950 font-bold shadow-sm transition-all cursor-pointer"
              >
                {isMotionPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                <span>{isMotionPaused ? 'RESUME' : 'PAUSE'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 5. FULL-BLEED DUAL OPPOSING VELOCITY MARQUEE WITH EDGE FOG MASK ── */}
        <div
          className="relative z-20 w-full flex-1 flex flex-col justify-center gap-5 sm:gap-6 py-10 sm:py-14 overflow-hidden"
          style={{
            WebkitMaskImage:
              'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
            maskImage:
              'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
          }}
        >
          {/* Row 1 Label + Leftward Web Core Velocity Track */}
          <div ref={row1RevealRef} className="w-full will-change-transform">
            <div ref={skew1WrapRef} className="w-full will-change-transform py-2">
              <div
                ref={track1Ref}
                className="flex items-center gap-3.5 sm:gap-5 w-max will-change-transform"
              >
                {WEB_CORE_STACK.map((item) => renderCard(item, 1, 'a'))}
                {WEB_CORE_STACK.map((item) => renderCard(item, 1, 'b'))}
              </div>
            </div>
          </div>

          {/* Row 2 Label + Rightward AI & Dev Tooling Velocity Track */}
          <div ref={row2RevealRef} className="w-full will-change-transform">
            <div ref={skew2WrapRef} className="w-full will-change-transform py-2">
              <div
                ref={track2Ref}
                className="flex items-center gap-3.5 sm:gap-5 w-max will-change-transform"
              >
                {AI_DEV_STACK.map((item) => renderCard(item, 2, 'a'))}
                {AI_DEV_STACK.map((item) => renderCard(item, 2, 'b'))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 6. LIVE TELEMETRY INSPECTOR BAR (Replaces Technical Implementation Jargon!) ── */}
        <div className="relative z-20 w-full max-w-6xl mx-auto px-5 xs:px-7 sm:px-12 md:px-16 shrink-0">
          <div className="pt-4 border-t border-sky-900/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 min-h-[44px] font-mono text-[10px] sm:text-[11px] tracking-[0.15em] uppercase">
            {hoveredCard ? (
              <>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: hoveredCard.item.brandColor,
                      boxShadow: `0 0 10px ${hoveredCard.item.brandGlow}`,
                    }}
                  />
                  <span className="font-bold text-slate-950">{hoveredCard.item.name}</span>
                  <span className="text-sky-900/30">/</span>
                  <span className="text-sky-900 font-semibold">{hoveredCard.item.role}</span>
                </div>
                <div className="text-sky-950/80 font-medium">
                  <span className="text-sky-900/50 mr-1.5">USED IN:</span>
                  <span className="font-semibold">{hoveredCard.item.usedIn}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sky-950/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                  <span>WEB CORE ({WEB_CORE_STACK.length})</span>
                  <span className="text-sky-900/30">·</span>
                  <span>AI &amp; DEV TOOLING ({AI_DEV_STACK.length})</span>
                </div>
                <div className="text-sky-950/65 font-medium">
                  SCROLL TO SURGE VELOCITY · HOVER ANY MODULE TO INSPECT
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SkillsSection;
