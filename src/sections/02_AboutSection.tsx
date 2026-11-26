import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DevisSignatureSvg } from '../components/DevisSignatureSvg';

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════════════════
   02 · ABOUT SECTION — CLEAN EDITORIAL MANIFESTO (`two26.studio` × DEVIS®)
   1A + 2A Minimalist Gallery Edition:
   1. Soft Curved Coastal Mist Horizon rising seamlessly over Hero (#F4F8FC)
   2. Ultra-clean centered single-typeface bold manifesto (Plus Jakarta Sans)
      — zero top/bottom divider clutter, zero boxy doorway pills.
   3. 3-Stage Per-Character Electric Cobalt Wave Scrub (Zero Re-Renders):
      Soft Ice Sky (#90C2F9) -> Electric Cobalt Wave (#2563EB) -> Obsidian Ink (#0F172A)
   4. Devis's Authentic Walking Video (`journey_pill.mp4`) as the sole living
      inline media jewel (+ hover ±840 KM Lumajang -> Bogor tooltip).
   5. 3 Playful Tilted Elastic Stamp Stickers popping onto key phrases right
      as the electric blue wave passes each beat!
   6. Centered authentic hand-traced Devis Signature SVG stroke-draw + smooth
      exit background morph (#F4F8FC -> #F5F4F0) into `03 · THE NEXUS`.
   ═══════════════════════════════════════════════════════════════════════════ */

interface StickerConfig {
  id: string;
  label: string;
  bgClass: string;
  textClass: string;
  targetRot: number;
  startRot: number;
  triggerAt: number;
}

const STICKER_MAP: Record<string, StickerConfig> = {
  jauh: {
    id: 'merantau',
    label: '±840 km merantau',
    bgClass: 'bg-[#2563EB] shadow-[0_12px_28px_rgba(37,99,235,0.35)]',
    textClass: 'text-white',
    targetRot: -3.5,
    startRot: -12,
    triggerAt: 0.21,
  },
  'ketenangan,': {
    id: 'detail',
    label: 'Overthinking detail 0.5px',
    bgClass: 'bg-[#FACC15] border border-slate-900/15 shadow-[0_12px_28px_rgba(234,179,8,0.30)]',
    textClass: 'text-slate-950',
    targetRot: 3,
    startRot: 12,
    triggerAt: 0.45,
  },
  karya: {
    id: 'alergi',
    label: 'Alergi UI generik',
    bgClass: 'bg-[#0284C7] shadow-[0_12px_28px_rgba(2,132,199,0.32)]',
    textClass: 'text-white',
    targetRot: -2.5,
    startRot: -10,
    triggerAt: 0.60,
  },
};

const SEGMENT_BEFORE_VIDEO = ['Dari', 'kaki', 'Semeru'];
const SEGMENT_AFTER_VIDEO = [
  'saya',
  'melangkah',
  'jauh',
  'untuk',
  'satu',
  'hal:',
  'rekayasa',
  'bukan',
  'sekadar',
  'baris',
  'kode',
  'yang',
  'berjalan,',
  'melainkan',
  'cara',
  'meramu',
  'ketenangan,',
  'komunikasi,',
  'dan',
  'eksekusi',
  'menjadi',
  'karya',
  'yang',
  'terasa',
  'hidup.',
];

const UNREAD_RGB: [number, number, number] = [144, 194, 249]; // #90C2F9 soft pastel sky
const COBALT_RGB: [number, number, number] = [37, 99, 235];   // #2563EB electric Hero Cobalt
const INK_RGB: [number, number, number] = [15, 23, 42];       // #0F172A deep obsidian ink

function lerpRgb(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

export const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLDivElement>(null);
  const videoPillRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sigWrapRef = useRef<HTMLDivElement>(null);
  const sigCaptionRef = useRef<HTMLDivElement>(null);
  const stickerRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // Auto-play / auto-pause muted walking video when entering viewport
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            vid.play().catch(() => {});
          } else {
            vid.pause();
          }
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(vid);
    return () => observer.disconnect();
  }, []);

  // Zero-rerender ambient spotlight tracking via CSS custom properties
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    stageRef.current.style.setProperty('--ax', `${e.clientX - rect.left}px`);
    stageRef.current.style.setProperty('--ay', `${e.clientY - rect.top}px`);
    stageRef.current.style.setProperty('--a-op', '1');
  };

  const handleMouseLeave = () => {
    if (!stageRef.current) return;
    stageRef.current.style.setProperty('--a-op', '0');
  };

  // GSAP ScrollTrigger 3-Stage Electric Cobalt Wave + Elastic Stickers + Signature Draw
  useEffect(() => {
    if (!sectionRef.current || !stageRef.current) return;

    const ctx = gsap.context(() => {
      const chars = gsap.utils.toArray<HTMLElement>('.about-char', manifestoRef.current || undefined);
      const sigPaths = gsap.utils.toArray<SVGPathElement>('.sig-stroke', sigWrapRef.current || undefined);

      // Measure authentic signature paths for stroke-draw
      sigPaths.forEach((path) => {
        const len = Math.ceil(path.getTotalLength());
        gsap.set(path, {
          strokeDasharray: len,
          strokeDashoffset: prefersReducedMotion ? 0 : len,
        });
      });

      if (prefersReducedMotion) {
        chars.forEach((el) => {
          el.style.color = 'rgb(15, 23, 42)';
        });
        if (videoPillRef.current) gsap.set(videoPillRef.current, { opacity: 1, scale: 1 });
        Object.values(STICKER_MAP).forEach((cfg) => {
          const el = stickerRefs.current[cfg.id];
          if (el) gsap.set(el, { opacity: 1, scale: 1, rotation: cfg.targetRot });
        });
        if (sigCaptionRef.current) gsap.set(sigCaptionRef.current, { opacity: 1, y: 0 });
        return;
      }

      // ── INITIAL STATES ──
      const unreadCss = `rgb(${UNREAD_RGB[0]}, ${UNREAD_RGB[1]}, ${UNREAD_RGB[2]})`;
      const inkCss = `rgb(${INK_RGB[0]}, ${INK_RGB[1]}, ${INK_RGB[2]})`;
      const lastColors = new Array<string>(chars.length).fill(unreadCss);

      chars.forEach((el) => {
        el.style.color = unreadCss;
      });

      if (videoPillRef.current) {
        gsap.set(videoPillRef.current, { opacity: 0.48, scale: 0.82, y: 4 });
      }

      Object.values(STICKER_MAP).forEach((cfg) => {
        const el = stickerRefs.current[cfg.id];
        if (el) {
          gsap.set(el, {
            opacity: 0,
            scale: 0.25,
            y: 8,
            rotation: cfg.startRot,
          });
        }
      });

      if (sigCaptionRef.current) {
        gsap.set(sigCaptionRef.current, { opacity: 0, y: 10 });
      }

      // ── 3-STAGE ELECTRIC COBALT WAVE UPDATER (ONLY MUTATES ACTIVE WAVE FRONTIER) ──
      const PEAK_W = 6;
      const TRAIL_W = 17;
      const totalChars = chars.length;

      const updateCharWave = (progress: number) => {
        const waveHead = progress * (totalChars + TRAIL_W);

        for (let i = 0; i < totalChars; i++) {
          const dist = waveHead - i;
          let nextColor: string;

          if (dist <= 0) {
            nextColor = unreadCss;
          } else if (dist < PEAK_W) {
            nextColor = lerpRgb(UNREAD_RGB, COBALT_RGB, dist / PEAK_W);
          } else if (dist < TRAIL_W) {
            nextColor = lerpRgb(COBALT_RGB, INK_RGB, (dist - PEAK_W) / (TRAIL_W - PEAK_W));
          } else {
            nextColor = inkCss;
          }

          if (lastColors[i] !== nextColor) {
            lastColors[i] = nextColor;
            chars[i].style.color = nextColor;
          }
        }
      };

      const waveProxy = { p: 0 };

      // ── PINNED TIMELINE (100dvh, end +=145%, scrub: 0.75) ──
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stageRef.current,
          start: 'top top',
          end: '+=145%',
          pin: true,
          scrub: 0.75,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // 1. Electric Cobalt Wave sweeping character-by-character across the manifesto (0.02 -> 0.72)
      tl.to(
        waveProxy,
        {
          p: 1,
          duration: 0.70,
          ease: 'none',
          onUpdate: () => updateCharWave(waveProxy.p),
        },
        0.02
      );

      // 2. Hero Walking Video Pill blooms right as the wave sweeps past "Semeru" (0.06 -> 0.17)
      if (videoPillRef.current) {
        tl.to(
          videoPillRef.current,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.11,
            ease: 'back.out(1.9)',
          },
          0.06
        );
      }

      // 3. 3 Elastic Tilted Sticker Pills stamp playfully onto the text as the blue wave arrives!
      Object.values(STICKER_MAP).forEach((cfg) => {
        const el = stickerRefs.current[cfg.id];
        if (!el) return;
        tl.to(
          el,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            rotation: cfg.targetRot,
            duration: 0.085,
            ease: 'back.out(2.2)',
          },
          cfg.triggerAt
        );
      });

      // 4. Authentic Devis Signature Stroke-Draw directly centered beneath manifesto (0.68 -> 0.90)
      if (sigPaths.length > 0) {
        const strokeStart = 0.68;
        const totalDrawWindow = 0.21;
        const perStroke = totalDrawWindow / sigPaths.length;

        sigPaths.forEach((path, idx) => {
          tl.to(
            path,
            {
              strokeDashoffset: 0,
              duration: perStroke * 1.45,
              ease: 'power1.inOut',
            },
            strokeStart + idx * perStroke * 0.82
          );
        });
      }

      if (sigCaptionRef.current) {
        tl.to(
          sigCaptionRef.current,
          { opacity: 1, y: 0, duration: 0.09, ease: 'power2.out' },
          0.83
        );
      }

      // 5. Seamless Exit Background Morph: Morning Coastal Mist (#F4F8FC) -> Nexus Warm Gallery (#F5F4F0)
      tl.to(
        sectionRef.current,
        {
          backgroundColor: '#F5F4F0',
          duration: 0.22,
          ease: 'none',
        },
        0.78
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // Render each word as an atomic wrap unit with per-character wave spans & optional anchored sticker
  const renderWord = (word: string, key: string, includeTrailingSpace = true) => {
    const sticker = STICKER_MAP[word];

    return (
      <React.Fragment key={key}>
        <span className="relative inline-block whitespace-nowrap">
          {word.split('').map((ch, cIdx) => (
            <span key={`${key}-${cIdx}`} className="about-char inline-block">
              {ch}
            </span>
          ))}

          {sticker && (
            <span className="pointer-events-none absolute -top-3.5 xs:-top-4 sm:-top-5 left-1/2 -translate-x-1/2 z-30">
              <span
                ref={(el) => {
                  stickerRefs.current[sticker.id] = el;
                }}
                className={`inline-block px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full font-sans text-[10px] xs:text-[11px] sm:text-[13px] font-bold tracking-tight whitespace-nowrap will-change-transform ${sticker.bgClass} ${sticker.textClass}`}
              >
                {sticker.label}
              </span>
            </span>
          )}
        </span>
        {includeTrailingSpace && ' '}
      </React.Fragment>
    );
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative z-20 w-full overflow-hidden bg-[#F4F8FC] text-slate-900 rounded-t-[44px] sm:rounded-t-[64px] md:rounded-t-[84px] shadow-[0_-24px_60px_-10px_rgba(15,23,42,0.16)]"
    >
      {/* Top Specular Curved Rim Highlight */}
      <div className="absolute top-0 inset-x-[10%] h-[1.5px] bg-gradient-to-r from-transparent via-white/95 to-transparent pointer-events-none z-30" />

      {/* Pinned Full-Viewport Clean Editorial Stage (1A + 2A) */}
      <div
        ref={stageRef}
        className="relative w-full h-[100dvh] min-h-[640px] flex flex-col items-center justify-center px-5 xs:px-7 sm:px-12 md:px-16 overflow-hidden"
        style={
          {
            '--ax': '50%',
            '--ay': '45%',
            '--a-op': '0',
          } as React.CSSProperties
        }
      >
        {/* Subtle Coastal Mist Atmosphere (Pure radial-gradient — zero heavy GPU blur-[135px] surfaces!) */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none -z-20 overflow-hidden">
          <div
            className="absolute -top-[14%] right-[8%] w-[560px] h-[560px] rounded-full opacity-40"
            style={{
              background:
                'radial-gradient(circle, rgba(125, 211, 252, 0.34) 0%, rgba(186, 230, 253, 0.12) 50%, transparent 72%)',
            }}
          />
          <div
            className="absolute -bottom-[16%] left-[6%] w-[520px] h-[520px] rounded-full opacity-30"
            style={{
              background:
                'radial-gradient(circle, rgba(224, 242, 254, 0.7) 0%, rgba(245, 244, 240, 0.2) 50%, transparent 72%)',
            }}
          />
        </div>

        {/* Zero-Rerender Cursor Light */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none -z-10 transition-opacity duration-500"
          style={{
            opacity: 'var(--a-op)',
            background:
              'radial-gradient(500px circle at var(--ax) var(--ay), rgba(56, 189, 248, 0.10), transparent 72%)',
          }}
        />

        {/* Subtle Tactile Editorial Grain */}
        <div className="film-grain-overlay opacity-[0.02] pointer-events-none" />

        {/* ── CENTERED GALLERY COLUMN: EYEBROW + MANIFESTO + SIGNATURE ── */}
        <div className="relative z-20 w-full max-w-5xl mx-auto flex flex-col items-center text-center pt-8 sm:pt-10">
          {/* Quiet Minimalist Centered Eyebrow */}
          <p className="font-mono text-[10px] sm:text-[11.5px] font-semibold tracking-[0.26em] uppercase text-slate-500 mb-5 sm:mb-7">
            SEDIKIT TENTANG SAYA
          </p>

          {/* Bold Single-Typeface Centered Manifesto with Electric Cobalt Wave + Living Walking Video */}
          <div ref={manifestoRef} className="w-full max-w-[960px]">
            <h2 className="font-sans font-bold text-[26px] xs:text-[31px] sm:text-[42px] md:text-[50px] lg:text-[56px] leading-[1.22] sm:leading-[1.18] tracking-[-0.035em] text-[#90C2F9]">
              {SEGMENT_BEFORE_VIDEO.map((w, i) => renderWord(w, `pre-${i}`, true))}

              {/* SOLE LIVING INLINE MEDIA JEWEL: Devis's Real Walking Video (`journey_pill.mp4`) */}
              <span
                ref={videoPillRef}
                className="group/vid relative inline-flex items-center align-middle mx-1.5 sm:mx-2.5 -mt-1.5 sm:-mt-2.5 cursor-pointer select-none will-change-transform"
              >
                <span className="relative block w-[82px] h-[36px] xs:w-[96px] xs:h-[42px] sm:w-[130px] sm:h-[56px] md:w-[152px] md:h-[64px] rounded-full overflow-hidden border-2 border-white ring-1 ring-sky-300/75 shadow-[0_14px_32px_rgba(37,99,235,0.20)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/vid:scale-[1.12] group-hover/vid:-rotate-1 group-hover/vid:shadow-[0_20px_42px_rgba(37,99,235,0.30)] bg-sky-100">
                  <video
                    ref={videoRef}
                    src="/assets/about/journey_pill.mp4"
                    poster="/assets/about/journey_pill_poster.webp"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover object-center scale-[1.06] transition-transform duration-700 ease-out group-hover/vid:scale-[1.16]"
                  />
                  <span className="absolute inset-0 bg-gradient-to-tr from-sky-900/10 via-transparent to-white/25 pointer-events-none" />
                </span>

                {/* Crisp Hover Distance Tooltip */}
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-slate-950/95 text-white font-mono text-[9.5px] font-semibold tracking-[0.16em] uppercase whitespace-nowrap shadow-lg opacity-0 translate-y-1.5 group-hover/vid:opacity-100 group-hover/vid:translate-y-0 transition-all duration-300 flex items-center gap-1.5 z-40">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  ±840 KM · LUMAJANG → BOGOR
                </span>
              </span>

              <span className="about-char inline-block -ml-1 mr-[0.2em]">,</span>

              {SEGMENT_AFTER_VIDEO.map((w, i) =>
                renderWord(w, `post-${i}`, i < SEGMENT_AFTER_VIDEO.length - 1)
              )}
            </h2>
          </div>

          {/* ── CENTERED AUTHENTIC HAND-TRACED DEVIS SIGNATURE (2A — ZERO BOXES, ZERO DIVIDERS) ── */}
          <div ref={sigWrapRef} className="mt-9 sm:mt-12 flex flex-col items-center">
            <DevisSignatureSvg
              className="w-[146px] xs:w-[164px] sm:w-[192px] md:w-[208px] h-auto text-slate-900"
              strokeColor="#0F172A"
            />
            <div
              ref={sigCaptionRef}
              className="mt-1.5 font-mono text-[9.5px] sm:text-[10.5px] tracking-[0.2em] uppercase text-slate-500 flex items-center gap-2"
            >
              <span className="font-semibold text-slate-700">Abu Devis Jalaluddin Rumi</span>
              <span className="text-slate-300">·</span>
              <span>TRPL IDN</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
