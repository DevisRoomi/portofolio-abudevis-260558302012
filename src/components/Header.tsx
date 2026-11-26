import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { RollingText, MagneticButton } from './MicroInteractions';

type SectionKey = 'hero' | 'about' | 'nexus' | 'work' | 'skills' | 'contact';

const NAV_ITEMS: { id: SectionKey; label: string; href: string }[] = [
  { id: 'about', label: 'About', href: '#about' },
  { id: 'nexus', label: 'Nexus', href: '#nexus' },
  { id: 'work', label: 'Work', href: '#work' },
  { id: 'skills', label: 'Skills', href: '#skills' },
];

export const Header: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>('hero');
  const [isDesktop, setIsDesktop] = useState<boolean>(true);

  useEffect(() => {
    const checkWidth = () => {
      setIsDesktop(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth, { passive: true });
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Pin-spacer-proof active section detection using getBoundingClientRect()
  useEffect(() => {
    let rafId: number | null = null;

    const evaluateActiveSection = () => {
      rafId = null;
      const triggerY = window.innerHeight * 0.36;

      const sections: { key: SectionKey; el: HTMLElement | null }[] = [
        { key: 'contact', el: document.getElementById('contact') },
        {
          key: 'skills',
          el: document.getElementById('skills') || document.getElementById('skills-container'),
        },
        { key: 'work', el: document.getElementById('work') },
        { key: 'nexus', el: document.getElementById('nexus') },
        { key: 'about', el: document.getElementById('about') },
      ];

      for (const sec of sections) {
        if (!sec.el) continue;
        const rect = sec.el.getBoundingClientRect();
        if (rect.top <= triggerY) {
          setActiveSection(sec.key);
          return;
        }
      }

      setActiveSection('hero');
    };

    const handleScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(evaluateActiveSection);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    evaluateActiveSection();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const smoothScrollTo = (targetSelector: string | number) => {
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: unknown, o?: unknown) => void } }).__lenis;
    if (typeof targetSelector === 'number') {
      if (lenis) {
        lenis.scrollTo(targetSelector, {
          duration: 1.25,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        window.scrollTo({ top: targetSelector, behavior: 'smooth' });
      }
      return;
    }

    const target =
      document.querySelector(targetSelector) ||
      (targetSelector === '#skills-container' ? document.getElementById('skills') : null);

    if (lenis && target) {
      lenis.scrollTo(target, {
        duration: 1.25,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    smoothScrollTo(href);
  };

  const handleTalkClick = (e: React.MouseEvent) => {
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      e.preventDefault();
      smoothScrollTo('#contact');
    }
  };

  const isLight =
    activeSection === 'about' ||
    activeSection === 'nexus' ||
    activeSection === 'work' ||
    activeSection === 'skills' ||
    activeSection === 'contact';
  const isShifted = activeSection !== 'hero';
  const shouldShift = isDesktop && isShifted;

  return (
    <header
      data-global-header="true"
      className="fixed top-2.5 sm:top-4 inset-x-0 z-50 pointer-events-none px-2 sm:px-8"
    >
      {/* 
        ── DYNAMIC CONTEXTUAL MORPHING NAVBAR ──
        Mobile: Always centered at 50% for zero collisions
        Desktop: Hero Centered, Inner Sections Right-aligned
        Theme: Dark Glass on Cobalt Sky (Hero & Contact), Crisp Light Glass on Editorial Light Sections
      */}
      <nav
        aria-label="Navigasi Utama"
        className={`pointer-events-auto absolute flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full will-change-transform max-w-[calc(100vw-1rem)] sm:max-w-none ${
          isLight
            ? 'bg-white/90 backdrop-blur-xl border border-slate-300/80 shadow-[0_8px_30px_rgba(15,23,42,0.08)] text-slate-800'
            : 'bg-[#060b17]/85 hover:bg-[#060b17]/95 backdrop-blur-2xl border border-white/20 shadow-[0_12px_40px_rgba(2,8,24,0.52)] text-slate-200'
        }`}
        style={{
          left: shouldShift ? 'calc(100% - clamp(1rem, 5vw, 5.5rem))' : '50%',
          transform: shouldShift ? 'translate3d(-100%, 0, 0)' : 'translate3d(-50%, 0, 0)',
          transition:
            'left 0.85s cubic-bezier(0.25, 1, 0.5, 1), transform 0.85s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease, color 0.5s ease',
        }}
      >
        {/* Left Brand Monogram: Smooth Return to Top */}
        <button
          type="button"
          onClick={() => smoothScrollTo(0)}
          title="Kembali ke atas"
          className={`hidden xs:inline-flex items-center px-2.5 py-1 rounded-full font-display font-extrabold text-[11px] sm:text-[12px] tracking-tight transition-colors cursor-pointer shrink-0 ${
            isLight
              ? 'text-slate-900 hover:bg-slate-100'
              : 'text-white hover:bg-white/10'
          }`}
        >
          DEVIS<span className="text-sky-500 text-[9px] ml-0.5">®</span>
        </button>

        <span
          className={`hidden xs:block w-[1px] h-3.5 shrink-0 ${
            isLight ? 'bg-slate-200' : 'bg-white/15'
          }`}
        />

        {/* Center Nav Links with Staggered Rolling Text & Active Indicator */}
        <div className="flex items-center gap-0.5 px-0.5">
          {NAV_ITEMS.map((item, idx) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                aria-current={isActive ? 'location' : undefined}
                className={`group relative flex items-center gap-1.5 px-2 sm:px-3 py-1 text-[11px] sm:text-[12.5px] font-medium tracking-wide rounded-full transition-all duration-200 cursor-pointer ${
                  isLight
                    ? isActive
                      ? 'text-slate-950 bg-sky-50/95 font-semibold ring-1 ring-sky-200/80'
                      : hoveredIdx === idx
                        ? 'text-slate-950 bg-slate-100 font-semibold'
                        : 'text-slate-600 hover:text-slate-950'
                    : isActive
                      ? 'text-white bg-white/20 font-semibold'
                      : hoveredIdx === idx
                        ? 'text-white bg-white/15'
                        : 'text-slate-200 hover:text-white'
                }`}
              >
                {isActive && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isLight
                        ? 'bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.7)]'
                        : 'bg-sky-300 shadow-[0_0_6px_rgba(125,211,252,0.8)]'
                    }`}
                  />
                )}
                <RollingText text={item.label} staggerMs={18} />
              </a>
            );
          })}
        </div>

        {/* Right Action Button: Magnetic CTA with Rolling Text */}
        <MagneticButton
          href="mailto:abudevis5@gmail.com"
          onClick={handleTalkClick}
          strength={0.32}
          className={`px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-[12.5px] font-semibold tracking-tight transition-all duration-200 shrink-0 shadow-sm active:scale-95 ${
            isLight
              ? 'bg-slate-900 hover:bg-black text-white shadow-[0_4px_14px_rgba(15,23,42,0.18)]'
              : 'bg-white hover:bg-slate-100 text-[#08132e] shadow-[0_4px_16px_rgba(255,255,255,0.25)]'
          }`}
        >
          <RollingText text="Let's Talk" staggerMs={18} />
          <ArrowUpRight
            className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ml-1 ${
              isLight ? 'text-white' : 'text-[#08132e]'
            }`}
          />
        </MagneticButton>
      </nav>
    </header>
  );
};

export default Header;
