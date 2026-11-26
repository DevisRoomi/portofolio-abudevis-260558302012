# DEVIS PORTFOLIO v2 — MOTIONSITES COHESION MASTER SPEC (SINGLE SOURCE OF TRUTH)

> **Status:** ACTIVE — Approved by Owner (Abu Devis Jalaluddin Rumi)  
> **Tujuan:** Menyamakan kualitas *MotionSites / Awwwards* di seluruh halaman agar sejajar dengan **Nexus**, dengan nuansa **terang, segar, dan ceria** dari awal hingga akhir.  
> **Aturan Keras:** Setiap sesi atau model (Gemini 4 Neon, Claude Opus 5.5, Claude Sonnet 5.5, dll.) WAJIB membaca file ini sebelum melanjutkan Wave berikutnya dan tidak boleh menyimpang dari spesifikasi di bawah.

---

## 1. Alur Section Terkunci (Alur A — Story-First)

| # | ID | File | Nama / Peran | Atmosfer & Palet Hex |
|---|---|---|---|---|
| **01** | `#hero` | `src/sections/01_HeroSection.tsx` | **Hero** — High-Noon Cobalt Sky | Radial `#7DD3FC → #38BDF8 → #2563EB → #1D4ED8 → #1538A6` |
| **02** | `#about` | `src/sections/02_AboutSection.tsx` | **About (Prologue Bridge)** — Morning Coastal Mist | Curved sheet `#F4F8FC` → GSAP exit morph `#F5F4F0` |
| **03** | `#nexus` | `src/sections/03_NexusSection.tsx` | **Nexus** — Sunlit Editorial Gallery | `#F5F4F0` + GSAP Mood Halo (01 Sky `rgba(56,189,248,0.22)`, 02 Crimson `rgba(244,63,94,0.18)`, 03 Gold `rgba(245,158,11,0.22)`) |
| **04** | `#work` | `src/sections/02_WorkSection.tsx` | **Work** — Chromatic Studio Canvas | Start `#F6F6F2` → GSAP reactive pastel `stageBg` per active project (`#F0F8FF`, `#FEFCE8`, `#F5F3FF`, `#F0FDFA`, `#F1F5F9`, `#F0FDF4`, `#FFF7ED`, `#FFF1F2`) |
| **05** | `#skills` | `src/sections/04_SkillsSection.tsx` | **Skills** — Bright Alpine Glacial | Gradasi `#F6F6F2 → #EEF7FF → #D6EEFF → #B6E1FE` + Prismatic 6-fold Snowflakes (`mixBlendMode: 'normal'`) |
| **06** | `#contact` | `src/sections/06_ContactSection.tsx` | **Contact / Outro** — GSAP Horizon Bloom | GSAP scrub morph `#B6E1FE → Radial Cobalt Sky (#7DD3FC → #2563EB → #1D4ED8)` + Interactive Cursor Aurora |

---

## 2. Copy & Micro-Copy Terkunci

### 02 · About Section (Opsi A — Puitis & Editorial)
- **Eyebrow:** `02 — PROLOGUE`
- **Coordinate Route:** `LUMAJANG 08°08'S  ─────▶  BOGOR 06°35'S` dengan **4-Act Scroll-Driven Stickman Journey** (`StickmanJourneyTrack.tsx`, ber-ransel mini: jalan → jalan baca koran → salto roll depan 360° → berdiri & melambai kecil di Bogor)
- **Manifesto Utama:**
  > *"Dari kota kecil di kaki Semeru `[🎬 Video Pill: journey_pill.mp4]`, saya melangkah jauh untuk satu keyakinan: **rekayasa** bukan sekadar baris kode `[💻 CodeRainPill: Dark Obsidian Multi-Color Syntax Rain]`, melainkan cara meramu **ketenangan**, **komunikasi** `[〰 Audio Wave]`, dan **eksekusi** menjadi karya yang terasa hidup."*
- **Video Pill Hover Tooltip:** `±840 KM · LUMAJANG → BOGOR`
- **Signature Caption:** `Abu Devis Jalaluddin Rumi · TRPL Politeknik IDN`
- **Bridge Teaser ke Nexus:**
  > *"Sebelum melihat apa yang saya bangun, kenali dulu tiga sisi yang membentuk cara pandang saya."*
- **3 Doorway Pills:** `01 OFF-SCREEN` · `02 PRINCIPLES` · `03 RECEIPTS`

### Floating Cursor Badges (Exact Text — Bahasa Inggris Konsisten)
| Lokasi | Teks Exact |
|---|---|
| Nexus Chapter 01 (Off-Screen) | `EXPLORE ARCHIVE ↗` |
| Nexus Chapter 02 (Beyond The Mask) | `ENTER SANCTUARY ↗` |
| Nexus Chapter 03 (The Receipts) | `INSPECT RECEIPTS ↗` |
| Work Active Card Image | `INSPECT PROJECT ↗` |
| Work Flanking Cards (Slot 1–7) | `SELECT CARD` |

### Header Navigation
- **Left Brand Button:** `DEVIS®` (smooth scroll ke `#hero`)
- **Nav Links:** `About (#about)` · `Nexus (#nexus)` · `Work (#work)` · `Skills (#skills)`
- **Primary CTA:** `Let's Talk` (smooth scroll ke `#contact` jika ada, fallback `mailto:abudevis5@gmail.com`)

---

## 3. Aset Khusus Wave 0

- **Video Pill:** `public/assets/about/journey_pill.mp4` (< 700 KB, 720p, muted, H.264 `yuv420p`, `+faststart`) + `public/assets/about/journey_pill_poster.webp`
- **Signature SVG:** `src/components/DevisSignatureSvg.tsx` — hasil tracing presisi dari tanda tangan asli Devis (6 goresan berurutan, siap GSAP `strokeDashoffset`).

---

## 4. Kontrak Teknis GSAP, Lenis & Guardrails (WAJIB PATUH)

1. **Zero Pin-Spacer Drift:**
   - Setiap `ScrollTrigger` wajib `invalidateOnRefresh: true`.
   - `App.tsx` menjalankan `ScrollTrigger.refresh()` saat `document.fonts.ready`.
   - `Header.tsx` WAJIB mendeteksi section aktif menggunakan `getBoundingClientRect().top` (BUKAN `el.offsetTop`, karena `offsetTop` bergeser ketika GSAP membungkus section dalam `.pin-spacer`).
2. **Zero React Re-render saat Mouse Move:**
   - Semua efek spotlight/aura/parallax kursor WAJIB menggunakan `gsap.quickTo` atau CSS custom properties (`el.style.setProperty('--mx', ...)`) — DILARANG `useState` di dalam `onMouseMove`.
3. **Zero Tween Conflict di Work Fan-Out:**
   - Animasi *Scroll-Driven Deck Fan-Out Explosion* di `02_WorkSection.tsx` WAJIB beroperasi pada outer wrapper (`fan-card-wrapper`) atau variabel terpisah agar tidak bertabrakan dengan GSAP `slotIndex` tween di dalam `WorkProjectCard.tsx`.
4. **Nexus Protection Guardrail (TIDAK BOLEH RUSAK):**
   - Pertahankan 100% koreografi 3 babak diagonal, kompas berputar, laba-laba `c-l-i-c-k-←`, Arc Reactor + J.A.R.V.I.S. scramble decoder, dan ketiga modal (`FieldNotesArchiveModal`, `Chapter02PrinciplesModal`, `Chapter03ReceiptsModal`).
5. **Accessibility & Reduced Motion:**
   - Selalu hormati `prefers-reduced-motion: reduce` pada setiap section baru/diubah.
   - Jangan gunakan `select-none` pada teks kontak/email agar mudah disalin manual selain tombol copy.

---

## 5. Progress Tracker per Wave

- [x] **Wave 0:** Master Spec Doc (`MOTIONSITES_UPGRADE_SPEC.md`), optimasi `journey_pill.mp4` (326.6 KB) + poster (17.5 KB), komponen `DevisSignatureSvg.tsx`.
- [x] **Wave 1:** `01_HeroSection` (opening burst + `<h1>`), `02_AboutSection` (Prologue Bridge), `App.tsx` (Alur A), `Header.tsx` (`DEVIS®`, `getBoundingClientRect`, active dot). → **Checkpoint 1**
- [x] **Wave 2 + 2.6:** `03_NexusSection` (Arch Gallery Aperture + pinned `THE NEXUS` Title Reveal + Mood Halo + clean bottom exit + 3-layer parallax + Obsidian Cursor Pill exact badges) + `02_WorkSection` / `WorkProjectCard` / `WorkStickmanRunner` (Horizontal Camera Pan + Giant `SELECTED WORKS` Signpost + Backpack Stickman Rail Runner Cameo + 8 Flying Luxury Obsidian Foil Poker Cards → 3D 180° Domino Flip to Chromatic Pastel Project Studio, 3D tilt + glare, hover peek, urut `01–08`, Prev/Next). → **Checkpoint 2**
- [x] **Wave 3:** `GlacialSnowCanvas` (visible prismatic 6-fold crystals + IntersectionObserver) + `04_SkillsSection` (Bright Alpine Ice + Dual Opposing Velocity Marquee + Lenis velocity surge & `skewX` + Hover Focus Lock + Live Telemetry Inspector) + `06_ContactSection` (GSAP Horizon Bloom `#B6E1FE → Cobalt Sky` + Cursor Aurora + Copy Email + Live Bogor WIB Clock + Back to Top ↑). → **Final Verification & Walkthrough**
