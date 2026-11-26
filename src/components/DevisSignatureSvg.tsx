import React from 'react';

interface DevisSignatureSvgProps {
  className?: string;
  strokeColor?: string;
}

/**
 * Hand-traced multi-stroke vector recreation of Abu Devis Jalaluddin Rumi's
 * authentic marker signature (viewBox 0 0 440 225).
 * Every path carries `.sig-stroke` ordered in natural pen-writing sequence
 * so GSAP ScrollTrigger can draw it stroke-by-stroke with strokeDashoffset.
 */
export const DevisSignatureSvg: React.FC<DevisSignatureSvgProps> = ({
  className = 'w-[180px] sm:w-[220px] h-auto',
  strokeColor = 'currentColor',
}) => {
  return (
    <svg
      viewBox="0 0 440 225"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Tanda tangan Abu Devis Jalaluddin Rumi"
    >
      {/* 1. Left J / Arabic initial hook */}
      <path
        className="sig-stroke"
        d="M 31 114 C 37 103, 44 100, 50 105 C 58 113, 59 136, 51 151 C 44 162, 26 164, 19 152"
        stroke={strokeColor}
        strokeWidth="5.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 2. Horizontal connecting flourish */}
      <path
        className="sig-stroke"
        d="M 54 112 C 70 112, 86 112, 100 101"
        stroke={strokeColor}
        strokeWidth="5.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 3. Accent ink dot beneath left flourish */}
      <path
        className="sig-stroke"
        d="M 92 136 C 93 135.5, 95 135.5, 95.5 136.5"
        stroke={strokeColor}
        strokeWidth="6.2"
        strokeLinecap="round"
      />

      {/* 4. Inner vertical stem of D */}
      <path
        className="sig-stroke"
        d="M 143 56 C 139 78, 134 104, 130 128"
        stroke={strokeColor}
        strokeWidth="5.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 5. Sweeping outer dome & inner loop of D */}
      <path
        className="sig-stroke"
        d="M 95 85 C 102 52, 134 18, 170 20 C 204 22, 218 62, 211 100 C 204 134, 178 158, 149 156 C 136 155, 139 138, 154 128 C 170 118, 192 114, 198 126 C 201 132, 209 134, 217 128"
        stroke={strokeColor}
        strokeWidth="5.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 6. Cursive "evis" flow */}
      <path
        className="sig-stroke"
        d="M 216 128 C 221 122, 224 109, 225 112 C 226 118, 222 132, 229 132 C 234 132, 236 114, 238 114 C 239 120, 237 132, 244 132 C 250 132, 253 111, 255 112 C 256 119, 252 133, 259 132 C 264 131, 265 113, 266 114 C 267 120, 264 133, 270 132 C 275 131, 276 114, 277 115 C 277 122, 273 134, 281 131 C 290 127, 298 107, 305 105 C 299 112, 294 118, 299 124 C 308 130, 312 138, 298 148 C 292 152, 287 152, 285 151"
        stroke={strokeColor}
        strokeWidth="5.0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 7. Top diacritic / flourish mark above evis */}
      <path
        className="sig-stroke"
        d="M 252 24 C 258 22, 260 26, 261 34 C 266 33, 271 27, 280 26 C 288 25, 296 25, 301 24"
        stroke={strokeColor}
        strokeWidth="4.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 8. Tall vertical stem of R */}
      <path
        className="sig-stroke"
        d="M 345 34 C 343 72, 342 112, 342 151"
        stroke={strokeColor}
        strokeWidth="5.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 9. Bowl & sweeping tail of R */}
      <path
        className="sig-stroke"
        d="M 332 71 C 336 60, 349 62, 354 74 C 359 88, 353 102, 338 103 C 327 104, 326 98, 332 100 C 344 106, 360 124, 374 139 C 388 152, 408 152, 424 145"
        stroke={strokeColor}
        strokeWidth="5.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 10. Upper underline stroke */}
      <path
        className="sig-stroke"
        d="M 65 186 C 145 182, 228 178, 309 176"
        stroke={strokeColor}
        strokeWidth="5.0"
        strokeLinecap="round"
      />

      {/* 11. Lower parallel underline stroke */}
      <path
        className="sig-stroke"
        d="M 186 206 C 254 198, 324 185, 393 190"
        stroke={strokeColor}
        strokeWidth="4.8"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default DevisSignatureSvg;
