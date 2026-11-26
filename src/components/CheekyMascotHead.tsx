import { forwardRef } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   CHEEKY MASCOT — FULL-SCALE NAILONG + ALWAYS-VISIBLE "wleee!" COMIC BUBBLE
   Anchored out-of-flow right beside the centered Work punchline so the main
   headline stays 100% dead-center while Nailong & his comic "wleee!" bubble
   stand clearly visible at full proportional scale.
   ═══════════════════════════════════════════════════════════════════════════ */

export const CheekyMascotHead = forwardRef<HTMLSpanElement>((_, ref) => {
  return (
    <span
      ref={ref}
      className="group/mascot relative inline-flex shrink-0 items-end justify-center -mt-3 sm:-mt-6 cursor-pointer select-none will-change-transform"
      title="Untung tetap dilanjutkan, wleee!"
    >
      {/* Always-Visible Playful Editorial Comic Speech Bubble ("wleee!") */}
      <span className="pointer-events-none absolute -top-6 sm:-top-8 -right-2 sm:-right-5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#FFFBEB] border-[1.5px] border-slate-900 text-slate-950 font-sans text-[10px] sm:text-[13px] font-extrabold tracking-tight lowercase whitespace-nowrap shadow-[2px_3px_0_#0F172A] animate-bubble-bob group-hover/mascot:scale-110 transition-transform duration-300 z-30">
        wleee!
        <span className="absolute -bottom-[5px] left-4 w-2.5 h-2.5 bg-[#FFFBEB] border-r-[1.5px] border-b-[1.5px] border-slate-900 rotate-45" />
      </span>

      {/* Full-Scale Wiggling Transparent Nailong Dino (100% Protected from Flex Squish) */}
      <span className="inline-block shrink-0 animate-mascot-wiggle group-hover/mascot:[animation-duration:0.75s] transition-transform duration-300 group-hover/mascot:scale-110">
        <img
          src="/assets/work/nailong_cheeky.webp"
          alt="Karakter dino kuning melet"
          width="168"
          height="280"
          decoding="async"
          className="h-[74px] w-[44px] sm:h-[120px] sm:w-[72px] md:h-[144px] md:w-[86px] max-w-none shrink-0 object-contain select-none pointer-events-none drop-shadow-[0_14px_24px_rgba(15,23,42,0.18)]"
        />
      </span>
    </span>
  );
});

CheekyMascotHead.displayName = 'CheekyMascotHead';

export default CheekyMascotHead;
