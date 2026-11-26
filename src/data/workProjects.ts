import { Project, SlotConfig, FooterCategory } from '../types/work';

/* ═══════════════════════════════════════════════════════════════════════════
   8 SHOWCASE PROJECTS (Disciplined Editorial Curation — Chronological 01-08)
   Hierarchy: 1 Master Hero Card + 7 Stepped Supporting Cards
   Each project defines its own pastel studio canvas tint (`stageBg`) so the
   entire Work studio atmosphere shifts softly with the active card.
   ═══════════════════════════════════════════════════════════════════════════ */
export const PROJECTS: Project[] = [
  // ── 01: PENTACART (Hero Card — Sky Mist / Ice Blue) ──
  {
    id: 'pentacart',
    num: '01',
    category: 'WEB APPLICATION',
    title: 'PENTACART',
    subtitle: 'Campus Procurement Platform',
    description: 'Sistem pemesanan dan pengelolaan tenant kantin kampus dalam satu platform terpadu dengan katalog QRIS mandiri.',
    longDesc: 'Katalog QRIS & pesan antar asrama mahasiswa. Memfasilitasi transaksi internal mahasiswa secara efisien, pelacakan status pesanan real-time, dan sistem rekapitulasi penjualan mandiri untuk tenant kantin asrama.',
    highlights: [
      'Katalog multi-tenant kantin kampus terintegrasi pembayaran QRIS mandiri',
      'Pelacakan status pesanan antar asrama mahasiswa secara real-time',
      'Dasbor rekapitulasi penjualan otomatis untuk setiap pengelola tenant',
    ],
    tags: ['Laravel', 'Livewire', 'MySQL'],
    githubUrl: 'https://github.com/DevisRoomi/pentacart-IDN',
    images: [
      { url: '/assets/projects/Pentacart.webp', label: 'Katalog Multi-Tenant' },
      { url: '/assets/projects/Pentacart%202.webp', label: 'Detail Pesanan' },
      { url: '/assets/projects/Pentacart%203.webp', label: 'Dasbor Tenant' },
    ],
    bg: '#BAE6FD',
    fg: '#0C4A6E',
    bevelColor: '#7DD3FC',
    accentBg: 'rgba(12, 74, 110, 0.10)',
    accentFg: '#0C4A6E',
    stageBg: '#F0F8FF',
    dark: false,
  },
  // ── 02: BASOKU (Peeking Right-Top — Warm Amber / Butter) ──
  {
    id: 'basoku',
    num: '02',
    category: 'WEB APP',
    title: 'BASOKU',
    subtitle: 'Recipe & Production Cost Apparatus',
    description: 'Kalkulator adonan presisi dan estimasi HPP per porsi otomatis untuk mengontrol efisiensi biaya produksi kuliner bakso.',
    longDesc: 'Basoku dikembangkan khusus untuk pelaku UMKM kuliner bakso. Dilengkapi kalkulator adonan presisi, estimasi HPP (Harga Pokok Penjualan) per porsi otomatis, dan manajemen inventaris bahan baku real-time berbasis Laravel dan Livewire.',
    highlights: [
      'Kalkulator takaran adonan presisi untuk menjaga konsistensi produksi',
      'Estimasi otomatis HPP (Harga Pokok Penjualan) per porsi bakso',
      'Manajemen stok bahan baku reaktif berbasis Laravel dan Livewire',
    ],
    tags: ['Laravel', 'Livewire', 'MySQL'],
    githubUrl: 'https://github.com/DevisRoomi/Basoku',
    images: [
      { url: '/assets/projects/Basoku.webp', label: 'Halaman Utama & Resep' },
      { url: '/assets/projects/Basoku%20Kalkulator.webp', label: 'Kalkulator Adonan & Biaya' },
    ],
    bg: '#FDE047',
    fg: '#18181B',
    bevelColor: '#EAB308',
    accentBg: 'rgba(24, 24, 27, 0.10)',
    accentFg: '#18181B',
    stageBg: '#FEFCE8',
    dark: false,
  },
  // ── 03: TAHFIDZ KALAMUL HAFIDZ (Peeking Left-Top — Soft Iris / Lavender) ──
  {
    id: 'tahfidz',
    num: '03',
    category: 'EDUCATION',
    title: 'TAHFIDZ KALAMUL HAFIDZ',
    subtitle: 'Quran Memorization Progress Platform',
    description: 'Sistem manajemen terpadu pencatatan setoran hafalan Al-Quran, evaluasi tajwid, dan rekapitulasi kemajuan santri.',
    longDesc: 'Platform digital manajemen tahfidz Al-Quran untuk pesantren & lembaga Islam. Memudahkan ustadz dan santri mencatat setoran hafalan, penilaian kelancaran tajwid, serta menerbitkan rapor kemajuan santri per semester.',
    highlights: [
      'Pencatatan setoran hafalan Al-Quran harian antara ustadz dan santri',
      'Evaluasi terstruktur kelancaran bacaan serta ketepatan tajwid',
      'Penerbitan laporan dan rapor kemajuan hafalan santri per semester',
    ],
    tags: ['Laravel', 'MySQL', 'Tailwind'],
    githubUrl: 'https://github.com/DevisRoomi/Tahfidz-Kalamul-Hafizh',
    images: [
      { url: '/assets/projects/Tahfidz%20Kalamul%20Hafidz.webp', label: 'Dasbor Santri' },
      { url: '/assets/projects/Tahfidz%20Kalamul%20Hafidz%202.webp', label: 'Input Setoran' },
      { url: '/assets/projects/Tahfidz%20Kalamul%20Hafidz%203.webp', label: 'Laporan Hafalan' },
    ],
    bg: '#8B5CF6',
    fg: '#FFFFFF',
    bevelColor: '#6D28D9',
    accentBg: 'rgba(255, 255, 255, 0.20)',
    accentFg: '#FFFFFF',
    stageBg: '#F5F3FF',
    dark: true,
  },
  // ── 04: JARVIS AI (Peeking Mid-Left — Deep Teal / Cyan) ──
  {
    id: 'jarvis',
    num: '04',
    category: 'AI ASSISTANT',
    title: 'JARVIS AI',
    subtitle: 'Autonomous Quantum Voice Assistant',
    description: 'Asisten AI suara berlatensi ultra-rendah dengan visualisasi 3D WebGL reaktif dan kendali sistem operasi native.',
    longDesc: 'DEVIS® JARVIS — Autonomous Quantum Full-Duplex Voice Assistant & Native OS Controller. Dibangun menggunakan FastAPI backend, Three.js 3D WebGL reactive visualizer, Groq LPU ultra-low latency inference, dan sintesis suara ElevenLabs.',
    highlights: [
      'Interaksi suara full-duplex berlatensi ultra-rendah lewat Groq LPU',
      'Visualisasi 3D WebGL reaktif berbasis Three.js dan sintesis ElevenLabs',
      'Integrasi backend FastAPI untuk kendali perintah sistem operasi native',
    ],
    tags: ['FastAPI', 'Three.js', 'Groq'],
    githubUrl: 'https://github.com/DevisRoomi/jarvis-assistant',
    images: [
      { url: '/assets/projects/DevisJarvis.webp', label: 'Voice Interface & Telemetry HUD' },
    ],
    bg: '#0F766E',
    fg: '#F0FDFA',
    bevelColor: '#115E59',
    accentBg: 'rgba(240, 253, 250, 0.16)',
    accentFg: '#F0FDFA',
    stageBg: '#F0FDFA',
    dark: true,
  },
  // ── 05: DUITIN (Peeking Lower-Left — Slate Navy / Midnight) ──
  {
    id: 'duitin',
    num: '05',
    category: 'FINTECH',
    title: 'DUITIN',
    subtitle: 'Smart Cashflow & Expense Tracker',
    description: 'Pelacak keuangan pribadi berbasis Rust & React untuk pencatatan arus kas harian dan analitik alokasi budget bulanan.',
    longDesc: 'Aplikasi web personal finance tracker berbasis Rust & React yang dirancang untuk membantu mahasiswa dan individu pemula mencatat arus kas harian, memantau sisa saldo, serta menganalisis kebiasaan belanja bulanan dalam Rupiah (IDR).',
    highlights: [
      'Pencatatan arus kas harian cepat dengan dukungan mata uang Rupiah (IDR)',
      'Analitik visual alokasi budget dan pola belanja bulanan interaktif',
      'Arsitektur ringan dan responsif dengan backend Rust serta antarmuka React',
    ],
    tags: ['Rust', 'React', 'ChartJS'],
    githubUrl: 'https://github.com/DevisRoomi/Duitin',
    images: [
      { url: '/assets/projects/Duitin.webp', label: 'Dasbor Arus Kas & Budget' },
    ],
    bg: '#1E293B',
    fg: '#F8FAFC',
    bevelColor: '#0F172A',
    accentBg: 'rgba(255, 255, 255, 0.14)',
    accentFg: '#F8FAFC',
    stageBg: '#F1F5F9',
    dark: true,
  },
  // ── 06: MATCHAVERSE (Peeking Mid-Right — Sage / Matcha Olive) ──
  {
    id: 'matchaverse',
    num: '06',
    category: 'E-COMMERCE',
    title: 'MATCHAVERSE',
    subtitle: 'Artisan Matcha Store System',
    description: 'Platform katalog e-commerce artisan matcha premium dengan keranjang interaktif, ongkir dinamis, dan checkout mulus.',
    longDesc: 'Platform e-commerce katalog artisan matcha premium dengan sistem cart interaktif, estimasi ongkir otomatis, dan checkout terintegrasi yang dibangun di atas stack Laravel 13, Alpine.js, dan Tailwind CSS.',
    highlights: [
      'Katalog varian artisan matcha premium dengan presentasi brand editorial',
      'Keranjang belanja interaktif dilengkapi estimasi ongkir otomatis',
      'Alur checkout terintegrasi berbasis Laravel 13, Alpine.js, dan Tailwind',
    ],
    tags: ['Laravel 13', 'Alpine.js', 'Tailwind'],
    githubUrl: 'https://github.com/DevisRoomi/e-commerce-laravel-13-matcha',
    images: [
      { url: '/assets/projects/Matchaverse.webp', label: 'Halaman Brand' },
      { url: '/assets/projects/Matchaverse%20Katalog.webp', label: 'Katalog Varian' },
    ],
    bg: '#2D5A27',
    fg: '#F8FAFC',
    bevelColor: '#1E3E1A',
    accentBg: 'rgba(255, 255, 255, 0.14)',
    accentFg: '#F8FAFC',
    stageBg: '#F0FDF4',
    dark: true,
  },
  // ── 07: E-REPORT (Peeking Top-Rear — Warm Terracotta / Peach) ──
  {
    id: 'e-report',
    num: '07',
    category: 'CIVIC TECH',
    title: 'E-REPORT',
    subtitle: 'Public Infrastructure Incident Platform',
    description: 'Platform pelaporan dan pemantauan kerusakan fasilitas publik terintegrasi dinas dengan tiket insiden transparan.',
    longDesc: 'Sistem informasi pelaporan infrastruktur publik dengan verifikasi berkas bertingkat, pelacakan tiket perbaikan, serta dasbor analitik respon dinas berbasis PHP Blade & MySQL.',
    highlights: [
      'Pelaporan kerusakan fasilitas publik dengan verifikasi berkas bertingkat',
      'Sistem tiket insiden transparan untuk memantau progres perbaikan',
      'Dasbor analitik respons dinas berbasis PHP Blade dan basis data MySQL',
    ],
    tags: ['PHP', 'MySQL', 'Bootstrap'],
    githubUrl: 'https://github.com/DevisRoomi/project-e-report-abudevis-260558302012',
    images: [
      { url: '/assets/projects/E-report.webp', label: 'Dasbor Insiden Publik' },
    ],
    bg: '#FDBA74',
    fg: '#451A03',
    bevelColor: '#EA580C',
    accentBg: 'rgba(69, 26, 3, 0.12)',
    accentFg: '#451A03',
    stageBg: '#FFF7ED',
    dark: false,
  },
  // ── 08: CAPYQUEST (Peeking Lower-Right — Coral Rose) ──
  {
    id: 'capyquest',
    num: '08',
    category: 'GAME DEV',
    title: 'CAPYQUEST',
    subtitle: 'Gamified Quest & Habit Engine',
    description: 'Aplikasi pembangun kebiasaan harian dengan mekanik quest petualangan interaktif capybara berbasis Bun dan React 19.',
    longDesc: 'Playful gamified quest & habit tracker. Backend Bun + Hono ultra-cepat, React 19 frontend, SQLite embedded, JWT authentication, dan TanStack Query state orchestration.',
    highlights: [
      'Pembangun kebiasaan harian berbalut mekanik quest petualangan & leaderboard',
      'Backend ultra-cepat Bun + Hono dengan SQLite embedded dan autentikasi JWT',
      'Sinkronisasi state antarmuka mulus memakai React 19 & TanStack Query',
    ],
    tags: ['Bun', 'Hono', 'React 19'],
    githubUrl: 'https://github.com/DevisRoomi/Capyquest',
    images: [
      { url: '/assets/projects/Capyquest.webp', label: 'Quest Explorer' },
      { url: '/assets/projects/Capyquest%202.webp', label: 'Habit Matrix' },
      { url: '/assets/projects/Capyquest%203.webp', label: 'Leaderboard' },
    ],
    bg: '#F43F5E',
    fg: '#FFFFFF',
    bevelColor: '#BE123C',
    accentBg: 'rgba(255, 255, 255, 0.20)',
    accentFg: '#FFFFFF',
    stageBg: '#FFF1F2',
    dark: true,
  },
];

export const HERO_W = 295;
export const HERO_H = 410;
export const SUB_W = 232;
export const SUB_H = 318;

export const SLOTS: SlotConfig[] = [
  // 0: CENTER HERO CARD — Clear master focal point, perfectly upright
  { x: 0,    y: -14,  rot: 0,    w: HERO_W, h: HERO_H, z: 65, opacity: 1.00, scale: 1.0,   depthZ: 50 },
  // 1: RIGHT FLANK (On-Deck: enters to Center on Next)
  { x: 238,  y: -6,   rot: 6.0,  w: SUB_W,  h: SUB_H,  z: 46, opacity: 1.00, scale: 0.786, depthZ: 25 },
  // 2: LOWER-RIGHT
  { x: 148,  y: 94,   rot: 3.5,  w: SUB_W,  h: SUB_H,  z: 42, opacity: 1.00, scale: 0.786, depthZ: 15 },
  // 3: TOP-RIGHT
  { x: 172,  y: -128, rot: 5.0,  w: SUB_W,  h: SUB_H,  z: 38, opacity: 1.00, scale: 0.786, depthZ: 8 },
  // 4: TOP-REAR HORIZON (Deepest rear)
  { x: 8,    y: -176, rot: -1.5, w: 226,    h: 312,    z: 28, opacity: 1.00, scale: 0.765, depthZ: 0 },
  // 5: TOP-LEFT
  { x: -172, y: -128, rot: -5.0, w: SUB_W,  h: SUB_H,  z: 38, opacity: 1.00, scale: 0.786, depthZ: 8 },
  // 6: LOWER-LEFT
  { x: -148, y: 94,   rot: -3.5, w: SUB_W,  h: SUB_H,  z: 42, opacity: 1.00, scale: 0.786, depthZ: 15 },
  // 7: LEFT FLANK (Egress: departs from Center on Next)
  { x: -238, y: -6,   rot: -6.0, w: SUB_W,  h: SUB_H,  z: 46, opacity: 1.00, scale: 0.786, depthZ: 25 },
];

export const FOOTER_CATEGORIES: FooterCategory[] = [
  { label: 'Web App', match: (c: string) => c.includes('WEB') },
  { label: 'Civic Tech', match: (c: string) => c.includes('CIVIC') },
  { label: 'AI', match: (c: string) => c.includes('AI') },
  { label: 'Fintech', match: (c: string) => c.includes('FINTECH') },
  { label: 'E-Commerce', match: (c: string) => c.includes('COMMERCE') },
  { label: 'Education', match: (c: string) => c.includes('EDUCATION') },
  { label: 'Game Dev', match: (c: string) => c.includes('GAME') },
];
