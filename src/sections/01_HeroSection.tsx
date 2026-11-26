import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  isLoading?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ isLoading = false }) => {
  const heroRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const portraitEnterRef = useRef<HTMLDivElement>(null);
  const marqueeWrapRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const singleSpanRef = useRef<HTMLSpanElement>(null);
  const hasPlayedEntranceRef = useRef<boolean>(false);

  // Marquee velocity state
  const offsetRef = useRef<number>(0);
  const currentSpeedRef = useRef<number>(-1.6); // default leftward drift
  const targetSpeedRef = useRef<number>(-1.6);
  const lastMouseXRef = useRef<number>(0);
  const isHoveredOnTextRef = useRef<boolean>(false);

  // Check prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // Kinetic Interactive Marquee Animation Loop (Auto-stops 100% when Hero scrolls off-screen!)
  useEffect(() => {
    if (prefersReducedMotion || !heroRef.current) return;

    let animId = 0;
    let isVisible = true;

    const tick = () => {
      if (!isVisible) {
        animId = 0;
        return;
      }
      if (trackRef.current && singleSpanRef.current) {
        const singleWidth = singleSpanRef.current.offsetWidth || 1200;

        // Smooth acceleration / deceleration toward targetSpeed
        currentSpeedRef.current +=
          (targetSpeedRef.current - currentSpeedRef.current) * 0.08;

        offsetRef.current += currentSpeedRef.current;

        // Seamless infinite loop wrapping in both directions
        if (offsetRef.current <= -singleWidth) {
          offsetRef.current += singleWidth;
        } else if (offsetRef.current >= 0) {
          offsetRef.current -= singleWidth;
        }

        trackRef.current.style.transform = `translate3d(${offsetRef.current.toFixed(2)}px, 0, 0)`;
      }
      animId = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (!animId && isVisible) {
        animId = requestAnimationFrame(tick);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? false;
        if (isVisible) {
          startLoop();
        } else if (animId) {
          cancelAnimationFrame(animId);
          animId = 0;
        }
      },
      { threshold: 0.01 }
    );
    io.observe(heroRef.current);

    startLoop();
    return () => {
      io.disconnect();
      if (animId) cancelAnimationFrame(animId);
    };
  }, [prefersReducedMotion]);

  // Mouse Move Interaction: Parallax on portrait + dynamic marquee steering
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion || !heroRef.current) return;

    const rect = heroRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const normX = (mouseX - rect.width / 2) / (rect.width / 2);
    const normY = (mouseY - rect.height / 2) / (rect.height / 2);

    // 1. Subtle 3D portrait parallax
    if (portraitRef.current) {
      gsap.to(portraitRef.current, {
        x: normX * 14,
        y: normY * 8,
        rotateY: normX * 3,
        rotateX: -normY * 2,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }

    // 2. Dynamic marquee steering based on mouse velocity
    const deltaX = e.clientX - lastMouseXRef.current;
    lastMouseXRef.current = e.clientX;

    if (isHoveredOnTextRef.current) {
      if (Math.abs(deltaX) > 1) {
        targetSpeedRef.current = deltaX > 0 ? 1.8 : -2.4;
      } else {
        targetSpeedRef.current = -0.3; // dramatically slowed down crawl
      }
    }
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion) return;

    if (portraitRef.current) {
      gsap.to(portraitRef.current, {
        x: 0,
        y: 0,
        rotateY: 0,
        rotateX: 0,
        duration: 1.2,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    }

    isHoveredOnTextRef.current = false;
    targetSpeedRef.current = -1.6; // return to normal flow
  };

  // Text hover triggers
  const handleTextMouseEnter = () => {
    isHoveredOnTextRef.current = true;
    targetSpeedRef.current = -0.3;
  };

  const handleTextMouseLeave = () => {
    isHoveredOnTextRef.current = false;
    targetSpeedRef.current = -1.6;
  };

  // Post-Preloader Opening Choreography (100% Solid Rise — ZERO translucent ghosting over marquee!)
  useEffect(() => {
    if (prefersReducedMotion) return;

    if (isLoading) {
      // Prime opening states cleanly below horizon on matching Cobalt Sky while Preloader covers viewport
      if (portraitEnterRef.current) {
        gsap.set(portraitEnterRef.current, { yPercent: 102, scale: 1.03, opacity: 1 });
      }
      if (marqueeWrapRef.current) {
        gsap.set(marqueeWrapRef.current, { opacity: 0, y: 24 });
      }
      if (bottomBarRef.current) {
        gsap.set(bottomBarRef.current, { opacity: 0, y: 16 });
      }
      return;
    }

    if (hasPlayedEntranceRef.current) return;
    hasPlayedEntranceRef.current = true;

    // Velocity surge on marquee that naturally decays to smooth drift via RAF lerp
    currentSpeedRef.current = -8.5;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // 1. Devis rises 100% SOLID opaque from the bottom horizon (no marquee bleed-through on face!)
    if (portraitEnterRef.current) {
      tl.fromTo(
        portraitEnterRef.current,
        { yPercent: 102, scale: 1.03, opacity: 1 },
        { yPercent: 0, scale: 1, opacity: 1, duration: 0.98, ease: 'expo.out', clearProps: 'transform' },
        0
      );
    }

    // 2. Editorial marquee glides in crisply BEHIND Devis's solid shoulders once he enters frame
    if (marqueeWrapRef.current) {
      tl.fromTo(
        marqueeWrapRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.82, ease: 'power3.out', clearProps: 'transform' },
        0.18
      );
    }

    // 3. Bottom horizon metadata settles softly
    if (bottomBarRef.current) {
      tl.fromTo(
        bottomBarRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.72, clearProps: 'transform' },
        0.38
      );
    }

    return () => {
      tl.kill();
    };
  }, [isLoading, prefersReducedMotion]);

  // Stacking Sections with Scale-Down Parallax (Scrubbed smoothly via GSAP ScrollTrigger)
  useEffect(() => {
    if (prefersReducedMotion || !heroRef.current) return;

    // Ensure pristine full-bleed initial state: scale 1, full brightness, 0 border radius
    gsap.set(heroRef.current, {
      scale: 1,
      filter: 'brightness(1)',
      borderRadius: '0px',
      transformOrigin: 'center top',
    });

    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current,
        {
          scale: 1,
          filter: 'brightness(1)',
          borderRadius: '0px',
        },
        {
          scale: 0.92,
          filter: 'brightness(0.65)',
          borderRadius: '28px',
          transformOrigin: 'center top',
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );

      // Smooth parallax sink on Devis's portrait as Section 2 curved horizon rises
      if (portraitRef.current) {
        gsap.to(portraitRef.current, {
          y: 110,
          opacity: 0.88,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      id="hero"
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="sticky top-0 z-10 h-screen max-h-screen w-full flex flex-col justify-between pt-24 pb-6 sm:pb-8 px-4 sm:px-12 md:px-16 overflow-hidden select-none origin-top will-change-transform"
      style={{
        background:
          'radial-gradient(ellipse at 50% 44%, #7DD3FC 0%, #38BDF8 26%, #2563EB 58%, #1D4ED8 80%, #1538A6 100%)',
      }}
    >
      {/* 1. Subtle Organic Film Grain Overlay */}
      <div className="film-grain-overlay" />

      {/* 2. Solusi 2: Balanced Ambient Lighting (Pure radial-gradient — zero heavy GPU blur-[140px] offscreen surfaces!) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft volumetric halo centered behind torso & shoulders */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(460px 340px at 50% 44%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 72%), radial-gradient(380px 380px at 0% 0%, rgba(29,78,216,0.32) 0%, rgba(29,78,216,0) 72%), radial-gradient(520px 520px at 100% 100%, rgba(30,58,138,0.42) 0%, rgba(30,58,138,0) 72%)',
          }}
        />

        {/* Blueprint hairline grid */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#1D4ED8 1px, transparent 1px), linear-gradient(90deg, #1D4ED8 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Spacer to push content naturally */}
      <div className="w-full flex-1" />

      {/* Semantic H1 for SEO & Accessibility without altering visual marquee */}
      <h1 className="sr-only">
        Abu Devis Jalaluddin Rumi — Software Engineering Student & Creative Web Developer
      </h1>

      {/* 
        3. Sandwich Layer 1 (Back): Tall, Condensed Editorial Marquee (Level Bahu & Leher)
        Ref: Drama Owns aesthetic.
      */}
      <div
        ref={marqueeWrapRef}
        onMouseEnter={handleTextMouseEnter}
        onMouseLeave={handleTextMouseLeave}
        className="absolute bottom-[28%] sm:bottom-[30%] md:bottom-[32%] lg:bottom-[34%] left-0 w-full overflow-hidden select-none z-10 cursor-pointer py-4 will-change-transform"
      >
        <div
          ref={trackRef}
          className="flex whitespace-nowrap will-change-transform"
          style={{ transform: 'translate3d(0, 0, 0)' }}
        >
          {/* Loop Segment 1 */}
          <span
            ref={singleSpanRef}
            className="flex items-center text-[18vw] sm:text-[17vw] md:text-[15vw] lg:text-[14vw] font-bebas font-normal tracking-wide text-white drop-shadow-[0_16px_40px_rgba(29,78,216,0.3)] leading-none shrink-0 pr-8 sm:pr-14"
          >
            ABU DEVIS JALALUDDIN RUMI <span className="mx-6 sm:mx-10 text-sky-200/70 font-light">—</span>
          </span>

          {/* Loop Segment 2 */}
          <span className="flex items-center text-[18vw] sm:text-[17vw] md:text-[15vw] lg:text-[14vw] font-bebas font-normal tracking-wide text-white drop-shadow-[0_16px_40px_rgba(29,78,216,0.3)] leading-none shrink-0 pr-8 sm:pr-14">
            ABU DEVIS JALALUDDIN RUMI <span className="mx-6 sm:mx-10 text-sky-200/70 font-light">—</span>
          </span>

          {/* Loop Segment 3 */}
          <span className="flex items-center text-[18vw] sm:text-[17vw] md:text-[15vw] lg:text-[14vw] font-bebas font-normal tracking-wide text-white drop-shadow-[0_16px_40px_rgba(29,78,216,0.3)] leading-none shrink-0 pr-8 sm:pr-14">
            ABU DEVIS JALALUDDIN RUMI <span className="mx-6 sm:mx-10 text-sky-200/70 font-light">—</span>
          </span>
        </div>
      </div>

      {/* 
        4. Sandwich Layer 2 (Front): Commanding Cutout Portrait with Breathing Room
        Scaled to 80-84vh to provide a generous, comfortable gap below the floating navbar.
      */}
      <div className="absolute bottom-0 inset-x-0 flex justify-center pointer-events-none z-20">
        <div
          ref={portraitRef}
          className="relative -translate-x-2 sm:-translate-x-3 h-[76vh] sm:h-[80vh] md:h-[82vh] lg:h-[84vh] max-h-[860px] flex items-end justify-center pointer-events-none will-change-transform"
          style={{ transform: 'translate3d(0, 0, 0)' }}
        >
          <div ref={portraitEnterRef} className="h-full w-auto flex items-end justify-center will-change-transform">
            <picture className="h-full w-auto max-w-full block">
              <source srcSet="/assets/devis_portrait_polished.webp" type="image/webp" />
              <img
                src="/assets/devis_portrait_polished.webp"
                alt="Abu Devis Jalaluddin Rumi"
                width="720"
                height="860"
                className="h-full w-auto max-w-full object-contain object-bottom select-none filter contrast-[1.03] brightness-[1.01] drop-shadow-[0_32px_60px_rgba(15,23,42,0.4)]"
                loading="eager"
                decoding="sync"
                // @ts-ignore
                fetchpriority="high"
              />
            </picture>
          </div>
        </div>
      </div>

      {/* 
        5. Clean Minimalist Bottom Horizon (Ref: Drama Owns)
      */}
      <div
        ref={bottomBarRef}
        className="w-full z-30 flex items-center justify-between text-white/90 text-xs sm:text-sm font-mono tracking-wider pointer-events-none"
      >
        {/* Left: Clean Tagline */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
          <span>Software Engineering · IDN Polytechnic</span>
        </div>

        {/* Right: Clean Origin / Telemetry */}
        <div className="hidden sm:flex items-center gap-2 text-white/80 pointer-events-auto">
          <span>Bogor, Indonesia</span>
          <span className="text-white/40">//</span>
          <span className="text-sky-200">06°35′S 106°47′E</span>
        </div>
      </div>
    </section>
  );
};
