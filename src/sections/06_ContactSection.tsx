import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUp, ArrowUpRight, Check, RotateCcw, Sparkles } from 'lucide-react';
import {
  ContactPhysicsCanvas,
  ContactPhysicsHandle,
} from '../components/ContactPhysicsCanvas';
import { RollingText } from '../components/MicroInteractions';

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════════════════
   06 · CONTACT / OUTRO SECTION — MINIMALIST SWISS EDITORIAL PLAYGROUND (OPSI A)
   Ultra-clean gallery breathing room echoing Lusion.co (`geooooo.mp4`):
   1. Zero noisy top status bars, zero stacked black buttons, zero full-width
      bottom bar cutting through the physics pit!
   2. Full-bleed 100dvh Bright Frost-Sky Canvas (#EEF6FF -> #F8FAFC) with
      4 subtle Swiss crosshairs (`+`) & 60fps 2D Physics Pit (Paket A).
   3. Centerpiece Kinetic Headline ("Mari berkarya / bersama!"):
      - Individual letter vertical slot-machine rolls + ambient idle flip
      - Bold dual-line sweep underline + click copies email + cheer bounce
   4. Single whisper-clean hairline email line (`abudevis5@gmail.com — Kirim Email ↗`)
   5. Single compact floating center-bottom pill (`✦ ZERO-G · ↺ · ↑ TOP`)
      leaving 85%+ of the lower physics pit completely open!
   6. Quiet 1-line Magazine Micro-Footer cleanly tucked beneath the canvas.
   ═══════════════════════════════════════════════════════════════════════════ */

const EMAIL = 'abudevis5@gmail.com';
const LINE_1 = 'Mari berkarya';
const LINE_2 = 'bersama!';

const SOCIALS = [
  {
    label: 'GitHub',
    href: 'https://github.com/DevisRoomi',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/abu-devis-jalaluddin-rumi-5475a33b6/',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/adevss_/',
  },
];

function formatBogorTime(): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());
  } catch {
    return '--:--';
  }
}

interface KineticLetterProps {
  char: string;
  isAmbientFlipping: boolean;
}

const KineticLetter: React.FC<KineticLetterProps> = ({ char, isAmbientFlipping }) => {
  const [hovered, setHovered] = useState(false);

  if (char === ' ') {
    return <span className="inline-block w-[0.26em]">&nbsp;</span>;
  }

  const active = hovered || isAmbientFlipping;

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative inline-block overflow-hidden align-top leading-[1.08] py-[0.02em]"
    >
      <span
        className="inline-block transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
        style={{
          transform: active ? 'translate3d(0, -105%, 0)' : 'translate3d(0, 0%, 0)',
        }}
      >
        {char}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 py-[0.02em] inline-block text-sky-600 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
        style={{
          transform: active ? 'translate3d(0, 0%, 0)' : 'translate3d(0, 105%, 0)',
        }}
      >
        {char}
      </span>
    </span>
  );
};

export const ContactSection: React.FC = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const physicsRef = useRef<ContactPhysicsHandle>(null);
  const isPointerDownRef = useRef<boolean>(false);

  const [copied, setCopied] = useState(false);
  const [isZeroG, setIsZeroG] = useState(false);
  const [headlineHovered, setHeadlineHovered] = useState(false);
  const [ambientFlipKey, setAmbientFlipKey] = useState<string | null>(null);
  const [bogorTime, setBogorTime] = useState<string>(() => formatBogorTime());

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Quiet Bogor WIB clock (updates every 15s for crisp minimal readability)
  useEffect(() => {
    const timer = setInterval(() => {
      setBogorTime(formatBogorTime());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Gentle ambient single-letter roll so the headline breathes quietly
  useEffect(() => {
    if (prefersReducedMotion) return;

    const allKeys: string[] = [];
    LINE_1.split('').forEach((c, i) => {
      if (c !== ' ') allKeys.push(`l1-${i}`);
    });
    LINE_2.split('').forEach((c, i) => {
      if (c !== ' ') allKeys.push(`l2-${i}`);
    });

    let clearTimer: ReturnType<typeof setTimeout> | null = null;
    const interval = setInterval(() => {
      const pick = allKeys[Math.floor(Math.random() * allKeys.length)];
      setAmbientFlipKey(pick);
      clearTimer = setTimeout(() => setAmbientFlipKey(null), 650);
    }, 2400);

    return () => {
      clearInterval(interval);
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, [prefersReducedMotion]);

  // Calm Editorial Entrance Reveal
  useEffect(() => {
    if (!stageRef.current || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.contact-reveal',
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.09,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: stageRef.current,
            start: 'top 72%',
            once: true,
          },
        }
      );
    }, stageRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = EMAIL;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const scrollToTop = () => {
    const lenis = (
      window as unknown as { __lenis?: { scrollTo: (t: number, opts?: unknown) => void } }
    ).__lenis;
    if (lenis) {
      lenis.scrollTo(0, {
        duration: 1.6,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Exact 1:1 pointer mapping strictly within the 100dvh physics stage
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    physicsRef.current?.onPointerMove(
      e.clientX - rect.left,
      e.clientY - rect.top,
      isPointerDownRef.current
    );
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerDownRef.current = true;
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    physicsRef.current?.onPointerMove(e.clientX - rect.left, e.clientY - rect.top, true);
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  const handlePointerLeave = () => {
    isPointerDownRef.current = false;
    physicsRef.current?.onPointerLeave();
  };

  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    physicsRef.current?.triggerBurstAt(e.clientX - rect.left, e.clientY - rect.top);
  };

  return (
    <footer id="contact" className="relative z-20 w-full flex flex-col text-slate-950">
      {/* ═══════════════════════════════════════════════════════════════════
          1. FULL-BLEED 100DVH MINIMALIST SWISS PHYSICS GALLERY STAGE
          ═══════════════════════════════════════════════════════════════════ */}
      <div
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onClick={handleStageClick}
        className="relative w-full min-h-[100dvh] flex flex-col items-center justify-between pt-20 sm:pt-24 pb-7 sm:pb-9 px-5 sm:px-12 overflow-hidden select-none cursor-crosshair"
        style={{
          background: 'linear-gradient(180deg, #EEF6FF 0%, #F4F8FF 42%, #F8FAFC 100%)',
        }}
      >
        {/* 4 Subtle Swiss Architectural Crosshairs (`+`) */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <span className="absolute top-[16%] left-[10%] sm:left-[18%] font-mono text-base font-light text-slate-900/30">
            +
          </span>
          <span className="absolute top-[16%] right-[10%] sm:right-[18%] font-mono text-base font-light text-slate-900/30">
            +
          </span>
          <span className="hidden sm:block absolute bottom-[27%] left-[18%] font-mono text-base font-light text-slate-900/30">
            +
          </span>
          <span className="hidden sm:block absolute bottom-[27%] right-[18%] font-mono text-base font-light text-slate-900/30">
            +
          </span>
        </div>

        {/* Full-Bleed 60fps 2D Physics Geometry Pit (Paket A — Unobstructed Left to Right!) */}
        <ContactPhysicsCanvas ref={physicsRef} zeroGravity={isZeroG} />

        {/* Serene Top Breathing Spacer */}
        <div aria-hidden="true" className="h-4 sm:h-8 shrink-0" />

        {/* ── CENTERPIECE: PURE EDITORIAL TYPOGRAPHY + WHISPER EMAIL LINE ── */}
        <div className="relative z-20 w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center -mt-12 sm:-mt-16 pointer-events-none">
          <p className="contact-reveal font-mono text-[10px] sm:text-[11.5px] font-medium tracking-[0.26em] uppercase text-slate-500 mb-3.5 sm:mb-5">
            PUNYA IDE YANG INGIN DIWUJUDKAN?
          </p>

          {/* Massive Kinetic Headline ("Mari berkarya / bersama!") */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCopyEmail();
              physicsRef.current?.triggerHeadlineCheer();
            }}
            onMouseEnter={() => {
              setHeadlineHovered(true);
              physicsRef.current?.triggerHeadlineCheer();
            }}
            onMouseLeave={() => setHeadlineHovered(false)}
            className="contact-reveal pointer-events-auto inline-flex flex-col items-center justify-center focus:outline-none cursor-pointer"
            title="Klik untuk menyalin abudevis5@gmail.com"
          >
            <span className="relative inline-block font-sans font-medium text-[44px] xs:text-[56px] sm:text-[82px] md:text-[102px] lg:text-[116px] tracking-[-0.04em] leading-[1.03] text-slate-950">
              {LINE_1.split('').map((ch, i) => (
                <KineticLetter
                  key={`l1-${i}`}
                  char={ch}
                  isAmbientFlipping={ambientFlipKey === `l1-${i}`}
                />
              ))}
              <span
                aria-hidden="true"
                className="absolute left-0 -bottom-1 sm:-bottom-1.5 w-full h-[3.5px] sm:h-[5px] rounded-full bg-slate-950 origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  transform: headlineHovered ? 'scaleX(1)' : 'scaleX(0)',
                }}
              />
            </span>

            <span className="relative inline-block font-sans font-medium text-[44px] xs:text-[56px] sm:text-[82px] md:text-[102px] lg:text-[116px] tracking-[-0.04em] leading-[1.03] text-slate-950 mt-1 sm:mt-1.5">
              {LINE_2.split('').map((ch, i) => (
                <KineticLetter
                  key={`l2-${i}`}
                  char={ch}
                  isAmbientFlipping={ambientFlipKey === `l2-${i}`}
                />
              ))}
              <span
                aria-hidden="true"
                className="absolute left-0 -bottom-1 sm:-bottom-1.5 w-full h-[3.5px] sm:h-[5px] rounded-full bg-slate-950 origin-left transition-transform duration-500 delay-75 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  transform: headlineHovered ? 'scaleX(1)' : 'scaleX(0)',
                }}
              />
            </span>
          </button>

          {/* Single Whisper-Minimalist Editorial Email Line (Zero Pills, Zero Heavy Boxes!) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="contact-reveal pointer-events-auto mt-7 sm:mt-9 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-[14px]"
          >
            <button
              type="button"
              onClick={handleCopyEmail}
              className="group/email relative inline-flex items-center gap-1.5 py-0.5 font-mono font-medium tracking-wide text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
              title="Klik untuk salin alamat email"
            >
              {copied ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
                  <Check className="w-3.5 h-3.5" />
                  <span>Disalin — {EMAIL}</span>
                </span>
              ) : (
                <>
                  <span>{EMAIL}</span>
                  <span className="absolute left-0 bottom-0 w-full h-[1px] bg-slate-900/20" />
                  <span className="absolute left-0 bottom-0 w-full h-[1px] bg-slate-950 origin-left scale-x-0 group-hover/email:scale-x-100 transition-transform duration-300" />
                </>
              )}
            </button>

            <span aria-hidden="true" className="text-slate-300 select-none">
              —
            </span>

            <a
              href={`mailto:${EMAIL}`}
              className="group/mail relative inline-flex items-center gap-1 py-0.5 font-sans font-semibold text-slate-900 hover:text-sky-600 transition-colors"
            >
              <RollingText text="Kirim Email" staggerMs={16} />
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/mail:translate-x-0.5 group-hover/mail:-translate-y-0.5" />
              <span className="absolute left-0 bottom-0 w-full h-[1px] bg-slate-900/20" />
              <span className="absolute left-0 bottom-0 w-full h-[1px] bg-sky-600 origin-left scale-x-0 group-hover/mail:scale-x-100 transition-transform duration-300" />
            </a>
          </div>
        </div>

        {/* ── SINGLE COMPACT FLOATING CENTER PILL (Mirrors Lusion Bottom Anchor — 85% Open Pit!) ── */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative z-20 pointer-events-auto"
        >
          <div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-xl border border-slate-900/10 shadow-[0_14px_38px_rgba(15,23,42,0.10)] transition-all">
            <button
              type="button"
              onClick={() => setIsZeroG((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer active:scale-95 ${
                isZeroG
                  ? 'bg-sky-500 text-white shadow-[0_0_16px_rgba(14,165,233,0.45)]'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
              title={isZeroG ? 'Kembalikan gravitasi' : 'Aktifkan mode tanpa gravitasi'}
            >
              <Sparkles className="w-3 h-3" />
              <span>{isZeroG ? 'ZERO-G ON' : 'ZERO-G'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsZeroG(false);
                physicsRef.current?.resetPile();
              }}
              className="w-7 h-7 rounded-full text-slate-500 hover:text-slate-950 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              title="Jatuhkan ulang bentuk"
              aria-label="Reset tumpukan bentuk"
            >
              <RotateCcw className="w-3 h-3" />
            </button>

            <span aria-hidden="true" className="w-[1px] h-3.5 bg-slate-900/10 mx-1" />

            <button
              type="button"
              onClick={scrollToTop}
              className="group/top inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-slate-800 hover:bg-slate-950 hover:text-white font-mono text-[10px] font-bold tracking-[0.16em] uppercase transition-colors cursor-pointer active:scale-95"
              title="Kembali ke puncak halaman"
            >
              <ArrowUp className="w-3 h-3 transition-transform duration-300 group-hover/top:-translate-y-0.5" />
              <span>Top</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          2. QUIET 1-LINE MAGAZINE MICRO-FOOTER (ZERO OVERLAP WITH PHYSICS PIT)
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="w-full bg-white border-t border-slate-900/5 py-4 px-5 sm:px-12 md:px-16">
        <div className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 font-mono text-[10px] sm:text-[10.5px] tracking-[0.16em] uppercase text-slate-500">
          {/* Social Links */}
          <div className="flex items-center gap-5">
            {SOCIALS.map((soc) => (
              <a
                key={soc.label}
                href={soc.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-950 transition-colors"
              >
                <RollingText text={soc.label} staggerMs={16} />
                <ArrowUpRight className="w-3 h-3 opacity-55 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            ))}
          </div>

          {/* Local Time */}
          <span className="tabular-nums text-slate-400">
            Bogor, ID · {bogorTime} WIB
          </span>

          {/* Copyright */}
          <span className="text-slate-400">
            © 2026 Abu Devis Jalaluddin Rumi
          </span>
        </div>
      </div>
    </footer>
  );
};

export default ContactSection;
