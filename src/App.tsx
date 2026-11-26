import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Preloader } from './components/Preloader';
import { Header } from './components/Header';
import { HeroSection } from './sections/01_HeroSection';
import { AboutSection } from './sections/02_AboutSection';
import { NexusSection } from './sections/03_NexusSection';
import { WorkSection } from './sections/02_WorkSection';
import { SkillsSection } from './sections/04_SkillsSection';
import { ContactSection } from './sections/06_ContactSection';
import { useLenis } from './hooks/useLenis';

gsap.registerPlugin(ScrollTrigger);

export const App: React.FC = () => {
  const isOnlyWork = typeof window !== 'undefined' && window.location.search.includes('onlyWork');

  const [isLoading, setIsLoading] = useState(() => {
    if (isOnlyWork) return false;
    if (typeof window !== 'undefined' && window.location.search.includes('skipPreloader')) {
      return false;
    }
    return true;
  });

  // Initialize Lenis smooth scroll
  useLenis();

  // Synchronize all pinned ScrollTriggers once web fonts & layout settle
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isCancelled = false;
    const refreshTriggers = () => {
      if (!isCancelled) {
        ScrollTrigger.refresh();
      }
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        setTimeout(refreshTriggers, 120);
      });
    }

    const settleTimer = setTimeout(refreshTriggers, 450);

    return () => {
      isCancelled = true;
      clearTimeout(settleTimer);
    };
  }, [isLoading]);

  // URL scroll helper for testing & visual verification
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const scrollTarget = params.get('scroll');
      if (scrollTarget) {
        const y = parseInt(scrollTarget, 10);
        setTimeout(() => {
          const win = window as unknown as {
            __lenis?: { scrollTo: (target: number, opts: { immediate: boolean }) => void };
          };
          if (win.__lenis) {
            win.__lenis.scrollTo(y, { immediate: true });
          } else {
            window.scrollTo({ top: y, behavior: 'instant' });
          }
        }, 200);
      }
    }
  }, []);

  if (isOnlyWork) {
    return (
      <div className="relative min-h-screen bg-[#EAF3FD]">
        <WorkSection />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#070b14] text-text-primary selection:bg-sky-400 selection:text-black">
      {/* Preloader with Hello / Multilingual Greetings */}
      {isLoading && <Preloader onLoadingComplete={() => setIsLoading(false)} />}

      {/* Floating Pill Capsule Navbar */}
      <Header />

      {/* Main Flow (Alur A — Story-First): Hero -> About -> Nexus -> Work -> Skills -> Contact */}
      <main className="relative w-full">
        <HeroSection isLoading={isLoading} />
        <AboutSection />
        <NexusSection />
        <WorkSection />
        <SkillsSection />
        <ContactSection />
      </main>
    </div>
  );
};

export default App;
