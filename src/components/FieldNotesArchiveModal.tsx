import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { X, ChevronLeft, ChevronRight, Maximize2, Compass, Mountain } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   01 · FIELD NOTES ARCHIVE MODAL (OFF-SCREEN)
   
   Aesthetic References:
   - jozue.fr: Warm stone canvas (#F5F4F0), razor 1px divider lines, spacious editorial typography.
   - gallery-play.be: Continuous gentle auto-drift marquee with pause on hover, smooth momentum drag,
     clean minimal captions underneath, and interactive cursor image-trail playground.
   ═══════════════════════════════════════════════════════════════════════════ */

interface FieldPhotoItem {
  id: string;
  figure: string;
  title: string;
  location: string;
  category: 'merbabu' | 'lemongan' | 'sentul' | 'expedition';
  categoryLabel: string;
  elevation?: string;
  src: string;
  aspect: 'portrait' | 'landscape' | 'wide' | 'square';
  cardWidthClass: string;
  objectPosition: string;
  caption: string;
  coordinates: string;
}

const FIELD_PHOTOS: FieldPhotoItem[] = [
  // ── 1. PUNCAK MERBABU (Gunung: Real Elevation MDPL) ──
  {
    id: 'merbabu-01',
    figure: '01',
    title: 'Sabana Suwanting',
    location: 'Gunung Merbabu',
    category: 'merbabu',
    categoryLabel: 'Puncak Merbabu',
    elevation: '3.142 MDPL',
    src: '/assets/person/merbabu_savana.jpg',
    aspect: 'portrait',
    cardWidthClass: 'w-[285px] sm:w-[325px]',
    objectPosition: 'object-[50%_30%]',
    caption: 'Jalur pendakian sabana Suwanting menjelang batas vegetasi puncak Gunung Merbabu.',
    coordinates: '7.4554° S, 110.4398° E',
  },
  {
    id: 'merbabu-02',
    figure: '02',
    title: 'Basecamp Suwanting',
    location: 'Gunung Merbabu',
    category: 'merbabu',
    categoryLabel: 'Puncak Merbabu',
    elevation: '1.400 MDPL',
    src: '/assets/person/merbabu_suwanting_basecamp.jpg',
    aspect: 'portrait',
    cardWidthClass: 'w-[285px] sm:w-[325px]',
    objectPosition: 'object-[50%_40%]',
    caption: 'Titik awal di Basecamp Suwanting Indah untuk persiapan logistik dan pengecekan stok air bersama kawan pendakian.',
    coordinates: '7.4690° S, 110.3950° E',
  },

  // ── 2. GUNUNG LEMONGAN & BROMO (Gunung: Real Elevation MDPL) ──
  {
    id: 'lemongan-01',
    figure: '03',
    title: 'Awal Pendakian Pertama',
    location: 'Gunung Lemongan',
    category: 'lemongan',
    categoryLabel: 'Gunung Lemongan',
    elevation: '1.651 MDPL',
    src: '/assets/person/first hiking.jpg',
    aspect: 'portrait',
    cardWidthClass: 'w-[285px] sm:w-[325px]',
    objectPosition: 'object-[50%_25%]',
    caption: 'Dokumentasi pendakian pertama di Puncak Tarub, Gunung Lemongan, Lumajang.',
    coordinates: '7.9860° S, 113.3420° E',
  },
  {
    id: 'lemongan-02',
    figure: '04',
    title: 'Panorama Kaldera TNBTS',
    location: 'TNBTS, Bromo',
    category: 'lemongan',
    categoryLabel: 'Gunung Lemongan',
    elevation: '2.329 MDPL',
    src: '/assets/person/bromo bareng.jpeg',
    aspect: 'landscape',
    cardWidthClass: 'w-[420px] sm:w-[480px]',
    objectPosition: 'object-center',
    caption: 'Dokumentasi bersama kawan di kawasan lautan pasir kaldera Taman Nasional Bromo Tengger Semeru.',
    coordinates: '7.9425° S, 112.9530° E',
  },

  // ── 3. SENTUL RIDGE (Non-Gunung: Tanpa MDPL) ──
  {
    id: 'sentul-01',
    figure: '05',
    title: 'Trek Hutan Hujan Sentul',
    location: 'Sentul, Bogor',
    category: 'sentul',
    categoryLabel: 'Sentul Ridge',
    src: '/assets/person/menjelajahi alam sentul.jpeg',
    aspect: 'portrait',
    cardWidthClass: 'w-[285px] sm:w-[325px]',
    objectPosition: 'object-[50%_35%]',
    caption: 'Trek susur lembah sungai dan jalur hutan di kawasan Sentul Selatan.',
    coordinates: '6.5980° S, 106.9120° E',
  },
  {
    id: 'sentul-02',
    figure: '06',
    title: 'Acara Wawasan Kebangsaan',
    location: 'Sentul, Bogor',
    category: 'sentul',
    categoryLabel: 'Sentul Ridge',
    src: '/assets/person/wawasan kebangsaan.jpeg',
    aspect: 'portrait',
    cardWidthClass: 'w-[285px] sm:w-[325px]',
    objectPosition: 'object-[50%_30%]',
    caption: 'Kegiatan pembinaan wawasan kebangsaan dan latihan kedisiplinan di alam terbuka.',
    coordinates: '6.6120° S, 106.9240° E',
  },
  {
    id: 'sentul-03',
    figure: '07',
    title: 'Mendirikan Tenda Regu',
    location: 'Sentul, Bogor',
    category: 'sentul',
    categoryLabel: 'Sentul Ridge',
    src: '/assets/person/wawasan kebangsaan aku ketua kelompok.jpeg',
    aspect: 'wide',
    cardWidthClass: 'w-[480px] sm:w-[540px]',
    objectPosition: 'object-center',
    caption: 'Mendirikan tenda perkemahan bersama anggota regu, bertindak sebagai ketua kelompok.',
    coordinates: '6.6080° S, 106.9190° E',
  },
  {
    id: 'sentul-04',
    figure: '08',
    title: 'Menjaga Sholat di Tengah Medan',
    location: 'Sentul, Bogor',
    category: 'sentul',
    categoryLabel: 'Sentul Ridge',
    src: '/assets/person/wawasan kebangsaan sholat.jpeg',
    aspect: 'portrait',
    cardWidthClass: 'w-[285px] sm:w-[325px]',
    objectPosition: 'object-[50%_30%]',
    caption: 'Menjaga waktu sholat berjamaah di sela padatnya agenda kegiatan wawasan kebangsaan di lapangan.',
    coordinates: '6.6110° S, 106.9210° E',
  },
  {
    id: 'sentul-05',
    figure: '09',
    title: 'Paperclip Barter Challenge',
    location: 'Sentul, Bogor',
    category: 'sentul',
    categoryLabel: 'Sentul Ridge',
    src: '/assets/person/paper klip challenge.jpeg',
    aspect: 'portrait',
    cardWidthClass: 'w-[285px] sm:w-[325px]',
    objectPosition: 'object-[50%_25%]',
    caption: 'Tantangan barter barang bertingkat yang diawali dari sebutir klip kertas kepada warga di Sentul.',
    coordinates: '6.5870° S, 106.8920° E',
  },

  // ── 4. EKSPEDISI TERBUKA, VOX POP & MA'HAD (Non-Gunung: Tanpa MDPL) ──
  {
    id: 'exp-01',
    figure: '10',
    title: 'Checkpoint Bundaran HI',
    location: 'Jakarta Pusat',
    category: 'expedition',
    categoryLabel: 'Ekspedisi Terbuka',
    src: '/assets/person/edurace sentul-jkt-plmbang-lampung.jpeg',
    aspect: 'portrait',
    cardWidthClass: 'w-[285px] sm:w-[325px]',
    objectPosition: 'object-[50%_35%]',
    caption: 'Titik transit rute perjalanan Sentul - Jakarta - Palembang - Lampung di Bundaran HI.',
    coordinates: '6.1950° S, 106.8230° E',
  },
  {
    id: 'exp-02',
    figure: '11',
    title: 'Benteng Kuto Besak Musi',
    location: 'Palembang',
    category: 'expedition',
    categoryLabel: 'Ekspedisi Terbuka',
    src: '/assets/person/edurace sentul-jkt-plmbang-lampungg.jpeg',
    aspect: 'square',
    cardWidthClass: 'w-[350px] sm:w-[400px]',
    objectPosition: 'object-center',
    caption: 'Dokumentasi di kawasan Benteng Kuto Besak tepi Sungai Musi, Palembang.',
    coordinates: '2.9910° S, 104.7610° E',
  },
  {
    id: 'exp-03',
    figure: '12',
    title: 'Vox Pop Pedestrian Thamrin',
    location: 'Jakarta Pusat',
    category: 'expedition',
    categoryLabel: 'Ekspedisi Terbuka',
    src: '/assets/person/Urban Workforce Vox Pop Jakarta Edition.jpeg',
    aspect: 'landscape',
    cardWidthClass: 'w-[430px] sm:w-[490px]',
    objectPosition: 'object-center',
    caption: 'Wawancara langsung bersama para pekerja di jalur pedestrian jalan MH Thamrin Jakarta.',
    coordinates: '6.1890° S, 106.8240° E',
  },
  {
    id: 'exp-04',
    figure: '13',
    title: 'Dokumentasi Urban Workforce',
    location: 'Jakarta Pusat',
    category: 'expedition',
    categoryLabel: 'Ekspedisi Terbuka',
    src: '/assets/person/Urban Workforce Vox Pop Jakarta Edition 2.jpeg',
    aspect: 'landscape',
    cardWidthClass: 'w-[430px] sm:w-[490px]',
    objectPosition: 'object-center',
    caption: 'Mendokumentasikan dinamika keseharian para pekerja komuter di Jakarta Pusat.',
    coordinates: '6.1900° S, 106.8250° E',
  },
  {
    id: 'exp-05',
    figure: '14',
    title: 'Belanja Kebutuhan Kompetisi',
    location: 'Kampus',
    category: 'expedition',
    categoryLabel: 'Ekspedisi Terbuka',
    src: '/assets/person/business competition dari kampus (aku).jpeg',
    aspect: 'portrait',
    cardWidthClass: 'w-[285px] sm:w-[325px]',
    objectPosition: 'object-[50%_25%]',
    caption: 'Momen belanja perlengkapan dan bahan untuk stan kompetisi bisnis kampus.',
    coordinates: '6.5920° S, 106.8790° E',
  },
  {
    id: 'exp-06',
    figure: '15',
    title: 'Dagangan Ludes Diborong',
    location: 'Kampus',
    category: 'expedition',
    categoryLabel: 'Ekspedisi Terbuka',
    src: '/assets/person/tim business competition  acara kampus.jpeg',
    aspect: 'portrait',
    cardWidthClass: 'w-[285px] sm:w-[325px]',
    objectPosition: 'object-[50%_30%]',
    caption: 'Foto bersama rekan tim setelah produk jualan kompetisi bisnis ludes diborong pembeli.',
    coordinates: '6.5930° S, 106.8800° E',
  },
  {
    id: 'exp-07',
    figure: '16',
    title: 'Silent Seminar Cybersecurity',
    location: 'Jakarta',
    category: 'expedition',
    categoryLabel: 'Ekspedisi Terbuka',
    src: '/assets/person/acara cybersecurity nasional.jpeg',
    aspect: 'portrait',
    cardWidthClass: 'w-[285px] sm:w-[325px]',
    objectPosition: 'object-[50%_25%]',
    caption: 'Menghadiri sesi silent seminar konferensi keamanan siber nasional menggunakan headphone receiver nirkabel.',
    coordinates: '6.2088° S, 106.8456° E',
  },
  {
    id: 'exp-08',
    figure: '17',
    title: 'Konferensi Keamanan Siber',
    location: 'Jakarta',
    category: 'expedition',
    categoryLabel: 'Ekspedisi Terbuka',
    src: '/assets/person/seminar acara cybersecurity nasional.jpeg',
    aspect: 'portrait',
    cardWidthClass: 'w-[285px] sm:w-[325px]',
    objectPosition: 'object-[50%_30%]',
    caption: 'Sesi pemaparan materi dari praktisi industri mengenai lanskap proteksi sistem siber nasional.',
    coordinates: '6.2095° S, 106.8465° E',
  },
  {
    id: 'exp-09',
    figure: '18',
    title: 'Ketua Bazar Manaahel',
    location: 'Bandung',
    category: 'expedition',
    categoryLabel: 'Ekspedisi Terbuka',
    src: '/assets/person/Ketua Bazar Manaahel(nyampain promosi wkwk).jpeg',
    aspect: 'portrait',
    cardWidthClass: 'w-[285px] sm:w-[325px]',
    objectPosition: 'object-[50%_25%]',
    caption: 'Menyampaikan promosi stan dan koordinasi acara saat bertugas sebagai ketua bazar Manaahel.',
    coordinates: '6.9175° S, 107.6191° E',
  },
  {
    id: 'exp-10',
    figure: '19',
    title: 'Ketua Divisi & Peran Tugas',
    location: 'Ma\'had',
    category: 'expedition',
    categoryLabel: 'Ekspedisi Terbuka',
    src: '/assets/person/foto bersama ketua dvisi sesuai peran.jpeg',
    aspect: 'portrait',
    cardWidthClass: 'w-[285px] sm:w-[325px]',
    objectPosition: 'object-[50%_30%]',
    caption: 'Foto bersama seluruh ketua divisi ma\'had dengan memperagakan peran dan tugas divisi masing-masing.',
    coordinates: '6.9200° S, 107.6250° E',
  },
  {
    id: 'exp-11',
    figure: '20',
    title: 'Foto Formal Dewan Ketua Divisi',
    location: 'Ma\'had',
    category: 'expedition',
    categoryLabel: 'Ekspedisi Terbuka',
    src: '/assets/person/foto bersama ketua dvisi.jpeg',
    aspect: 'landscape',
    cardWidthClass: 'w-[420px] sm:w-[480px]',
    objectPosition: 'object-center',
    caption: 'Dokumentasi sesi foto formal bersama seluruh jajaran ketua divisi organisasi santri.',
    coordinates: '6.9200° S, 107.6250° E',
  },
  {
    id: 'exp-12',
    figure: '21',
    title: 'Divisi Kebersihan Ma\'had',
    location: 'Ma\'had',
    category: 'expedition',
    categoryLabel: 'Ekspedisi Terbuka',
    src: '/assets/person/Foto sama temenku divisi kebersihan ma\'had.jpeg',
    aspect: 'portrait',
    cardWidthClass: 'w-[285px] sm:w-[325px]',
    objectPosition: 'object-[50%_30%]',
    caption: 'Foto bersama teman seperjuangan saat bertugas di divisi kebersihan lingkungan ma\'had.',
    coordinates: '6.9250° S, 107.6300° E',
  },
];

interface TrailItem {
  id: number;
  x: number;
  y: number;
  rotation: number;
  photo: FieldPhotoItem;
}

interface FieldNotesArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  origin: { x: number; y: number };
}

export const FieldNotesArchiveModal: React.FC<FieldNotesArchiveModalProps> = ({
  isOpen,
  onClose,
  origin,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const filmstripWrapperRef = useRef<HTMLDivElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);
  const trailSectionRef = useRef<HTMLElement>(null);

  // Filter State
  const [activeFilter, setActiveFilter] = useState<'all' | 'merbabu' | 'lemongan' | 'sentul' | 'expedition'>('all');

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxIndexRef = useRef<number | null>(null);
  lightboxIndexRef.current = lightboxIndex;

  // Seamless Lightbox Return: positions filmstrip precisely at the opened figure upon exit
  const closeLightbox = useCallback(() => {
    const curIdx = lightboxIndexRef.current;
    if (curIdx !== null && marqueeTrackRef.current) {
      const targetCard = marqueeTrackRef.current.children[curIdx] as HTMLElement;
      if (targetCard) {
        const containerWidth = marqueeTrackRef.current.parentElement?.clientWidth || window.innerWidth;
        const targetScroll = targetCard.offsetLeft - (containerWidth / 2) + (targetCard.offsetWidth / 2);
        const singleWidth = singleSetWidthRef.current;
        let finalScroll = targetScroll;
        if (singleWidth > 0) {
          while (finalScroll < 0) finalScroll += singleWidth;
          while (finalScroll >= singleWidth) finalScroll -= singleWidth;
        }
        scrollPosRef.current = finalScroll;
        velocityRef.current = 0;
        marqueeTrackRef.current.style.transform = `translate3d(${-finalScroll}px, 0, 0)`;
      }
    }
    setLightboxIndex(null);
  }, []);

  // Cursor Trail Playground State
  const [trailItems, setTrailItems] = useState<TrailItem[]>([]);
  const lastSpawnRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const photoIndexRef = useRef<number>(0);
  const isClosingRef = useRef<boolean>(false);
  const scrollYPosRef = useRef<number>(0);

  // ── Auto-Drift & Physics State ──
  const scrollPosRef = useRef<number>(0);
  const currentSpeedRef = useRef<number>(0.65);
  const velocityRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const isHoveredRef = useRef<boolean>(false);
  const lastPointerXRef = useRef<number>(0);
  const pointerDownPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const singleSetWidthRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  // Filtered Photo List
  const filteredPhotos = activeFilter === 'all'
    ? FIELD_PHOTOS
    : FIELD_PHOTOS.filter((p) => p.category === activeFilter);

  // Duplikasi tepat 2x ([...items, ...items]) dengan reset 50% lebar kontainer (ringan di DOM)
  const displayItems = [...filteredPhotos, ...filteredPhotos];

  // Helper: Hitung radius lingkaran agar mencakup seluruh sudut layar dari titik klik
  const getApertureGeometry = useCallback((origX: number, origY: number) => {
    if (typeof window === 'undefined') {
      return { radius: 1200 };
    }
    const maxDist = Math.hypot(
      Math.max(origX, window.innerWidth - origX),
      Math.max(origY, window.innerHeight - origY)
    );
    return { radius: Math.ceil(maxDist * 1.15) };
  }, []);

  // ── 1. Hide Navbar, Prevent Double Scrollbar & Expanding Iris Navigation ──
  const handleClose = useCallback((popHistory = true) => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    if (popHistory && window.history.state?.modal === 'field-notes-archive') {
      window.history.back();
    }

    if (!containerRef.current) {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      const win = window as unknown as { __lenis?: { start: () => void; scrollTo: (y: number, opts: { immediate: boolean }) => void } };
      if (win.__lenis) {
        win.__lenis.scrollTo(scrollYPosRef.current, { immediate: true });
        win.__lenis.start();
      }
      onClose();
      return;
    }

    const origX = origin?.x ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
    const origY = origin?.y ?? (typeof window !== 'undefined' ? window.innerHeight / 2 : 400);
    const { radius } = getApertureGeometry(origX, origY);

    // Susutkan lingkaran clipPath modal secara kalem, santai, dan elegan kembali ke titik klik asal
    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
        const win = window as unknown as { __lenis?: { start: () => void; scrollTo: (y: number, opts: { immediate: boolean }) => void } };
        if (win.__lenis) {
          win.__lenis.scrollTo(scrollYPosRef.current, { immediate: true });
          win.__lenis.start();
        } else if (typeof window !== 'undefined' && scrollYPosRef.current > 0) {
          window.scrollTo({ top: scrollYPosRef.current, behavior: 'instant' });
        }
        onClose();
      },
    });

    if (scrollWrapperRef.current) {
      tl.to(
        scrollWrapperRef.current,
        {
          opacity: 0.35,
          y: 20,
          duration: 0.45,
          ease: 'power2.in',
        },
        0
      );
    }

    tl.fromTo(
      containerRef.current,
      {
        opacity: 1,
        clipPath: `circle(${radius}px at ${origX}px ${origY}px)`,
      },
      {
        opacity: 0.95,
        clipPath: `circle(0px at ${origX}px ${origY}px)`,
        duration: 0.72,
        ease: 'power3.inOut',
      },
      0
    );
  }, [onClose, origin, getApertureGeometry]);

  useEffect(() => {
    if (!isOpen) return;
    isClosingRef.current = false;
    scrollYPosRef.current = typeof window !== 'undefined' ? window.scrollY : 0;

    // Add modal-open class to html & body to hide main scrollbar & navbar
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');

    // Push browser history state for smooth back gesture & button support without hash jump
    window.history.pushState({ modal: 'field-notes-archive' }, '');

    const handlePopState = () => {
      handleClose(false);
    };
    window.addEventListener('popstate', handlePopState);

    // Focus scroll wrapper so Escape, touchpad and keyboard navigation work immediately
    setTimeout(() => {
      scrollWrapperRef.current?.focus({ preventScroll: true });
    }, 40);

    // Temporarily pause global Lenis instance
    const win = window as unknown as { __lenis?: { stop: () => void; start: () => void } };
    if (win.__lenis) win.__lenis.stop();

    // Reset modal internal scroll position
    if (scrollWrapperRef.current) {
      scrollWrapperRef.current.scrollTop = 0;
    }

    // ── Single Unified Circular Expansion Entrance Animation (Santai, Kalem, Elegan ~0.92s, power3.inOut) ──
    if (containerRef.current) {
      const origX = origin?.x ?? (typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
      const origY = origin?.y ?? (typeof window !== 'undefined' ? window.innerHeight / 2 : 400);
      const { radius } = getApertureGeometry(origX, origY);

      const tl = gsap.timeline({
        onComplete: () => {
          if (containerRef.current) {
            containerRef.current.style.clipPath = 'none';
          }
        },
      });

      tl.fromTo(
        containerRef.current,
        {
          opacity: 1,
          clipPath: `circle(0px at ${origX}px ${origY}px)`,
        },
        {
          opacity: 1,
          clipPath: `circle(${radius}px at ${origX}px ${origY}px)`,
          duration: 0.92,
          ease: 'power3.inOut',
        },
        0
      );

      if (scrollWrapperRef.current) {
        tl.fromTo(
          scrollWrapperRef.current,
          {
            opacity: 0.45,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.92,
            ease: 'power3.out',
          },
          0.05
        );
      }
    }

    return () => {
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      window.removeEventListener('popstate', handlePopState);
      if (win.__lenis) win.__lenis.start();
    };
  }, [isOpen, origin, handleClose, getApertureGeometry]);

  // ── 2. Keyboard Navigation for Lightbox & Modal (Escape / Arrow keys) ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        if (lightboxIndex !== null) {
          closeLightbox();
        } else {
          handleClose(true);
        }
      } else if (lightboxIndex !== null) {
        if (e.key === 'ArrowLeft') {
          setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : filteredPhotos.length - 1));
        } else if (e.key === 'ArrowRight') {
          setLightboxIndex((prev) => (prev! < filteredPhotos.length - 1 ? prev! + 1 : 0));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, lightboxIndex, filteredPhotos.length, handleClose, closeLightbox]);

  // ── 2b. Touchpad 2-Finger Horizontal Swipe & Touch Edge Swipe to Go Back ──
  const swipeDeltaRef = useRef<number>(0);
  const swipeResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // 1. Touchpad two-finger horizontal swipe right (standard "Back" gesture on laptop trackpads)
    const handleWheelSwipe = (e: WheelEvent) => {
      // If lightbox is open, let lightbox handle escape/close
      if (lightboxIndex !== null) return;

      // Check if horizontal delta is clearly dominant over vertical delta
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.3) {
        // e.deltaX < 0 means user swiped fingers to the right (Back gesture)
        if (e.deltaX < -15) {
          swipeDeltaRef.current += Math.abs(e.deltaX);

          if (swipeResetTimerRef.current) clearTimeout(swipeResetTimerRef.current);
          swipeResetTimerRef.current = setTimeout(() => {
            swipeDeltaRef.current = 0;
          }, 300);

          // Once cumulative swipe reaches threshold (~55px of swipe momentum):
          if (swipeDeltaRef.current > 55) {
            swipeDeltaRef.current = 0;
            handleClose(true);
          }
        }
      }
    };

    // 2. Touchscreen left-edge swipe right (iOS / Android / touchscreen laptop swipe-back)
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartX > 0 && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;
        // Swipe initiated from left edge (< 70px) and moved right > 65px
        if (touchStartX < 70 && deltaX > 65 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
          touchStartX = 0;
          handleClose(true);
        }
      }
    };

    window.addEventListener('wheel', handleWheelSwipe, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheelSwipe);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      if (swipeResetTimerRef.current) clearTimeout(swipeResetTimerRef.current);
    };
  }, [isOpen, lightboxIndex, handleClose]);

  // Reset filmstrip position only when the user switches categories
  useEffect(() => {
    scrollPosRef.current = 0;
    velocityRef.current = 0;
  }, [activeFilter]);

  // ── 3. High-Performance Auto-Drift & Inertia Loop (requestAnimationFrame) ──
  useEffect(() => {
    if (!isOpen) return;

    const measureWidth = () => {
      if (marqueeTrackRef.current) {
        singleSetWidthRef.current = marqueeTrackRef.current.scrollWidth / 2;
      }
    };

    measureWidth();
    const timer = setTimeout(measureWidth, 300);
    window.addEventListener('resize', measureWidth);

    const tick = () => {
      if (marqueeTrackRef.current) {
        const singleWidth = singleSetWidthRef.current;

        const desiredSpeed = (isHoveredRef.current || isDraggingRef.current || lightboxIndexRef.current !== null)
          ? 0
          : 0.65;

        currentSpeedRef.current += (desiredSpeed - currentSpeedRef.current) * 0.08;

        if (!isDraggingRef.current) {
          velocityRef.current *= 0.94;
          if (Math.abs(velocityRef.current) < 0.01) {
            velocityRef.current = 0;
          }
        }

        scrollPosRef.current += currentSpeedRef.current + velocityRef.current;

        if (singleWidth > 0) {
          if (scrollPosRef.current >= singleWidth) {
            scrollPosRef.current -= singleWidth;
          } else if (scrollPosRef.current < 0) {
            scrollPosRef.current += singleWidth;
          }
        }

        marqueeTrackRef.current.style.transform = `translate3d(${-scrollPosRef.current}px, 0, 0)`;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      clearTimeout(timer);
      window.removeEventListener('resize', measureWidth);
    };
  }, [isOpen, filteredPhotos.length]);

  // ── 4. Pointer Drag & Touchpad Wheel Handlers ──
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastPointerXRef.current = e.clientX;
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastPointerXRef.current;
    lastPointerXRef.current = e.clientX;
    scrollPosRef.current -= deltaX;
    velocityRef.current = -deltaX;
  };

  const handlePointerUpOrCancel = () => {
    isDraggingRef.current = false;
  };

  const handleFilmstripWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
      const delta = e.shiftKey ? e.deltaY : e.deltaX;
      velocityRef.current += delta * 0.15;
    }
  };

  const handlePushNav = (direction: 'left' | 'right') => {
    velocityRef.current += direction === 'left' ? -18 : 18;
  };

  const handleCardClick = (e: React.MouseEvent, photo: FieldPhotoItem) => {
    const dist = Math.hypot(
      e.clientX - pointerDownPosRef.current.x,
      e.clientY - pointerDownPosRef.current.y
    );
    if (dist < 6) {
      const realIndex = filteredPhotos.findIndex((p) => p.id === photo.id);
      setLightboxIndex(realIndex >= 0 ? realIndex : 0);
    }
  };

  // ── 5. Interactive Cursor Image Trail (Zona Bawah) ──
  const handleTrailSpawn = (clientX: number, clientY: number) => {
    if (!trailSectionRef.current) return;
    const rect = trailSectionRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

    const nextPhoto = FIELD_PHOTOS[photoIndexRef.current % FIELD_PHOTOS.length];
    photoIndexRef.current += 1;

    const newItem: TrailItem = {
      id: Date.now() + Math.random(),
      x,
      y,
      rotation: (Math.random() - 0.5) * 12,
      photo: nextPhoto,
    };

    setTrailItems((prev) => [...prev.slice(-6), newItem]);
  };

  const handleMouseMoveTrail = (e: React.MouseEvent<HTMLElement>) => {
    const dist = Math.hypot(
      e.clientX - lastSpawnRef.current.x,
      e.clientY - lastSpawnRef.current.y
    );

    if (dist > 90) {
      lastSpawnRef.current = { x: e.clientX, y: e.clientY };
      handleTrailSpawn(e.clientX, e.clientY);
    }
  };

  const handleTouchTapTrail = (e: React.TouchEvent<HTMLElement> | React.MouseEvent<HTMLElement>) => {
    const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    handleTrailSpawn(clientX, clientY);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={containerRef}
      tabIndex={-1}
      data-lenis-prevent="true"
      data-lenis-prevent-wheel="true"
      data-lenis-prevent-touch="true"
      className="fixed inset-0 z-[200] bg-[#F5F4F0] text-[#181818] select-none overflow-hidden outline-none"
      style={{
        opacity: 0,
      }}
    >
      {/* Tactile Lookbook Paper Grain Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Internal Scrollable Canvas Container with Native Touchpad / Wheel Support */}
      <div
        ref={scrollWrapperRef}
        tabIndex={-1}
        data-lenis-prevent="true"
        data-lenis-prevent-wheel="true"
        data-lenis-prevent-touch="true"
        className="relative z-20 w-full h-full overflow-y-auto overflow-x-hidden overscroll-y-contain outline-none editorial-scrollbar"
      >
        {/* Sticky Top Header Bar: Accessible from anywhere while scrolling */}
        <header className="sticky top-0 z-50 w-full bg-[#F5F4F0]/90 backdrop-blur-md px-4 sm:px-12 md:px-16 lg:px-20 py-3 sm:py-5 border-b border-[#181818]/15 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-[10.5px] sm:text-xs tracking-wider sm:tracking-[0.22em] uppercase text-stone-500 min-w-0">
            <span className="font-bold text-[#181818] shrink-0">01 // FIELD NOTES</span>
            <span className="text-stone-300 hidden sm:inline">/</span>
            <span className="text-stone-700 font-medium truncate hidden sm:inline">EXPEDITION & OUTDOOR ARCHIVE</span>
          </div>

          <button
            onClick={() => handleClose(true)}
            className="group relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-[2px] border border-[#181818]/25 bg-white/80 hover:bg-[#181818] hover:text-[#F5F4F0] text-stone-900 font-mono text-[11px] sm:text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-xs shrink-0"
            aria-label="Tutup Halaman Detail"
          >
            <span>[ TUTUP</span>
            <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300 group-hover:rotate-90" />
            <span>]</span>
          </button>
        </header>

        {/* ═══════════════════════════════════════════════════════════════════
            ZONA ATAS — HERO INTERACTIVE CURSOR IMAGE TRAIL PLAYGROUND
            ═══════════════════════════════════════════════════════════════════ */}
        <section
          ref={trailSectionRef}
          onMouseMove={handleMouseMoveTrail}
          onTouchStart={handleTouchTapTrail}
          onClick={handleTouchTapTrail}
          className="relative w-full min-h-[75vh] sm:min-h-[85vh] bg-[#EFECE6]/50 flex flex-col items-center justify-center p-8 sm:p-14 overflow-hidden cursor-crosshair select-none"
        >
          {/* Subtle Radar/Grid Background Pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: `radial-gradient(circle, #181818 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          />

          {/* Center Statement Display Typography */}
          <div className="relative z-20 text-center max-w-4xl pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] bg-[#181818]/5 border border-[#181818]/10 font-mono text-[10px] sm:text-[11px] tracking-[0.25em] text-stone-600 uppercase mb-5">
              <Compass className="w-3 h-3 text-stone-800 animate-spin" style={{ animationDuration: '14s' }} />
              <span>EPILOG // THE LIVING ARCHIVE</span>
            </div>

            <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight uppercase text-[#181818] leading-[0.95]">
              EVERY TRAIL LEAVES A FRAME BEHIND.
            </h1>

            <p className="font-sans font-medium text-base sm:text-xl text-stone-600 mt-5 max-w-2xl mx-auto leading-relaxed">
              Arsip perjalanan, ketinggian, dan momen di luar layar kerja.
            </p>

            <div className="mt-8 font-mono text-xs sm:text-[13px] tracking-widest uppercase text-stone-500 flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gerakkan kursor di area ini untuk menebar arsip.</span>
            </div>

            {/* Mobile Fallback Trigger Button */}
            <div className="mt-6 md:hidden pointer-events-auto">
              <button
                onClick={handleTouchTapTrail}
                className="px-5 py-2.5 rounded-[2px] bg-[#181818] text-[#F5F4F0] font-mono text-xs uppercase tracking-wider shadow-md active:scale-95 transition-transform"
              >
                Tap untuk tebar foto ↗
              </button>
            </div>

            {/* Scroll Down Cue */}
            <div className="mt-10 font-mono text-[11px] text-stone-400 tracking-widest uppercase flex items-center justify-center gap-2">
              <span>Scroll untuk telusuri 21 frame</span>
              <span className="animate-bounce">↓</span>
            </div>
          </div>

          {/* Cursor-Spawned Floating Image Trail Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
            {trailItems.map((item) => {
              const isPortrait = item.photo.aspect === 'portrait';
              return (
                <div
                  key={item.id}
                  className="absolute will-change-transform animate-trail-fade pointer-events-none"
                  style={{
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                  }}
                >
                  <div
                    className={`p-2 bg-white rounded-[2px] shadow-2xl border border-stone-300/80 transition-shadow ${
                      isPortrait ? 'w-[155px] sm:w-[175px]' : 'w-[210px] sm:w-[245px]'
                    }`}
                  >
                    <div
                      className={`w-full overflow-hidden rounded-[2px] bg-stone-100 ${
                        isPortrait ? 'h-[190px] sm:h-[220px]' : 'h-[130px] sm:h-[155px]'
                      }`}
                    >
                      <img
                        src={item.photo.src}
                        alt={item.photo.title}
                        className={`w-full h-full object-cover ${item.photo.objectPosition || 'object-center'}`}
                      />
                    </div>
                    <div className="mt-1.5 px-0.5 flex items-center justify-between font-mono text-[9px] text-stone-500 uppercase tracking-wider">
                      <span className="font-bold text-stone-800">FIG. {item.photo.figure}</span>
                      <span className="truncate max-w-[100px]">{item.photo.location}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════
            ZONA BAWAH — FILTERABLE FILMSTRIP LOOKBOOK GALLERY (21 FOTO)
            ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative w-full pt-10 sm:pt-14 pb-16 sm:pb-24 px-6 sm:px-12 md:px-16 lg:px-20 border-t border-[#181818]/15 bg-[#F5F4F0]">

          {/* Filter Bar (Gallery-play.be Style Minimalist Category Tabs) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Minimalist Tab Buttons with Sharp 2px Edges & Clean Flex Wrap */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {[
                { key: 'all', label: `Semua Frame (${FIELD_PHOTOS.length})` },
                { key: 'merbabu', label: `Puncak Merbabu (${FIELD_PHOTOS.filter(p => p.category === 'merbabu').length})` },
                { key: 'lemongan', label: `Gunung Lemongan & Bromo (${FIELD_PHOTOS.filter(p => p.category === 'lemongan').length})` },
                { key: 'sentul', label: `Sentul Ridge (${FIELD_PHOTOS.filter(p => p.category === 'sentul').length})` },
                { key: 'expedition', label: `Ekspedisi Terbuka (${FIELD_PHOTOS.filter(p => p.category === 'expedition').length})` },
              ].map((tab) => {
                const isActive = activeFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key as any)}
                    className={`whitespace-nowrap px-4 sm:px-5 py-2 rounded-[2px] font-mono text-[11px] sm:text-xs tracking-[0.16em] uppercase transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-[#181818] text-[#F5F4F0] border border-[#181818] shadow-xs font-bold'
                        : 'bg-transparent text-stone-600 border border-[#181818]/20 hover:border-[#181818] hover:text-[#181818]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Filmstrip Left/Right Nav Controls */}
            <div className="hidden md:flex items-center gap-3">
              <span className="font-mono text-[11px] text-stone-400 tracking-widest uppercase mr-1">
                Auto-Drift · Touchpad / Drag Pita
              </span>
              <button
                onClick={() => handlePushNav('left')}
                className="w-9 h-9 rounded-[2px] border border-[#181818]/20 flex items-center justify-center hover:bg-[#181818] hover:text-[#F5F4F0] transition-colors cursor-pointer"
                aria-label="Dorong Pita ke Kiri"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePushNav('right')}
                className="w-9 h-9 rounded-[2px] border border-[#181818]/20 flex items-center justify-center hover:bg-[#181818] hover:text-[#F5F4F0] transition-colors cursor-pointer"
                aria-label="Dorong Pita ke Kanan"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Continuous Gentle Auto-Drift Filmstrip with Editorial Cards */}
          <div
            ref={filmstripWrapperRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUpOrCancel}
            onPointerCancel={handlePointerUpOrCancel}
            onMouseEnter={() => {
              isHoveredRef.current = true;
            }}
            onMouseLeave={() => {
              isHoveredRef.current = false;
              isDraggingRef.current = false;
            }}
            onWheel={handleFilmstripWheel}
            className="mt-8 relative -mx-6 sm:-mx-12 md:-mx-16 lg:-mx-20 overflow-hidden cursor-grab active:cursor-grabbing select-none py-4 touch-pan-y"
          >
            {/* Edge Fog Gradient Indicators */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#F5F4F0] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#F5F4F0] to-transparent z-10 pointer-events-none" />

            <div
              ref={marqueeTrackRef}
              className="flex items-start gap-6 sm:gap-8 px-6 sm:px-12 md:px-16 lg:px-20 will-change-transform"
            >
              {displayItems.map((photo, itemIdx) => (
                <div
                  key={`${photo.id}-${itemIdx}`}
                  onClick={(e) => handleCardClick(e, photo)}
                  className="flex flex-col shrink-0 group select-none cursor-pointer"
                >
                  {/* Sharp Editorial Photographic Print Frame (rounded-[2px]) */}
                  <div
                    className={`relative overflow-hidden rounded-[2px] border border-[#181818]/15 shadow-xs transition-all duration-500 group-hover:border-[#181818]/40 group-hover:shadow-md h-[380px] sm:h-[430px] ${photo.cardWidthClass} bg-stone-200/50`}
                  >
                    <img
                      src={photo.src}
                      alt={photo.title}
                      loading="lazy"
                      draggable={false}
                      className={`w-full h-full object-cover ${photo.objectPosition} transition-transform duration-500 ease-out group-hover:scale-[1.03]`}
                      style={{
                        filter: 'sepia(0.04) contrast(0.98) brightness(1.01)',
                      }}
                    />

                    {/* Hover Prompt Pill */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#181818]/85 text-[#F5F4F0] font-mono text-[9px] uppercase tracking-wider">
                        <Maximize2 className="w-3 h-3" />
                        <span>Detail</span>
                      </div>
                    </div>

                    {/* Elevation Badge on Corner (Only if genuine mountain photo) */}
                    {photo.elevation && (
                      <div className="absolute bottom-2.5 left-2.5 pointer-events-none">
                        <span className="px-2 py-0.5 rounded-[2px] bg-white/95 text-stone-900 font-mono text-[9px] font-bold tracking-widest border border-stone-300/80 shadow-xs">
                          {photo.elevation}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Clean Minimalist Monospace Micro-Label */}
                  <div className="mt-3 flex items-baseline justify-between font-mono text-[10.5px] sm:text-[11px] tracking-wider text-stone-600 border-t border-[#181818]/10 pt-2">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="font-bold text-stone-900 shrink-0">FIG. {photo.figure}</span>
                      <span className="text-stone-400 shrink-0">—</span>
                      <span className="font-semibold text-stone-800 truncate uppercase tracking-wider group-hover:text-black transition-colors">
                        {photo.title}
                      </span>
                    </div>
                    {photo.elevation && (
                      <span className="text-stone-500 shrink-0 font-mono text-[10px] font-semibold">
                        {photo.elevation}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filmstrip Footer Meta Note */}
          <div className="mt-8 flex items-center justify-between font-mono text-[10px] sm:text-[11px] text-stone-400 uppercase tracking-widest border-t border-[#181818]/10 pt-4">
            <div className="flex items-center gap-2">
              <Mountain className="w-3.5 h-3.5 text-stone-500" />
              <span>Menampilkan {filteredPhotos.length} dari {FIELD_PHOTOS.length} Arsip Ekspedisi Kolektif</span>
            </div>
            <span className="hidden sm:inline">Klik foto untuk membaca catatan jurnal lengkap di Lightbox</span>
          </div>

          {/* Bottom Footer Credits Bar */}
          <div className="mt-12 pt-6 border-t border-[#181818]/10 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[10.5px] text-stone-500 tracking-wider">
            <span>FIGURE 01 // 03 — OFF-SCREEN DOSSIER</span>
            <button
              onClick={() => handleClose(true)}
              className="text-stone-800 font-bold underline hover:text-black cursor-pointer transition-colors"
            >
              ← Kembali ke Panggung The Nexus
            </button>
          </div>

        </section>

      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          FULLSCREEN LIGHTBOX MODAL (Detailed Field Journal Notes)
          ═══════════════════════════════════════════════════════════════════════ */}
      {lightboxIndex !== null && filteredPhotos[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
          className="fixed inset-0 z-[250] bg-[#F5F4F0]/92 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8 md:p-10 select-none animate-fadeIn cursor-zoom-out"
        >
          {/* Lightbox Top Header (Kiri Atas: FIG + Lokasi + Tombol Tutup) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between w-full border-b border-[#181818]/15 pb-3 sm:pb-4 cursor-default"
          >
            <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs sm:text-[13px] tracking-widest uppercase">
              <span className="px-2.5 py-0.5 rounded-[2px] bg-[#181818] text-[#F5F4F0] font-bold shadow-xs">
                FIG. {filteredPhotos[lightboxIndex].figure}
              </span>
              <span className="text-stone-400">•</span>
              <span className="font-bold text-stone-900">{filteredPhotos[lightboxIndex].location}</span>
              {filteredPhotos[lightboxIndex].elevation && (
                <>
                  <span className="text-stone-400">•</span>
                  <span className="px-2 py-0.5 rounded-[2px] bg-emerald-900/10 text-emerald-800 font-bold border border-emerald-800/20 text-[10.5px]">
                    {filteredPhotos[lightboxIndex].elevation}
                  </span>
                </>
              )}
            </div>

            <button
              onClick={closeLightbox}
              className="group px-3 py-1 sm:py-1.5 rounded-[2px] border border-[#181818]/25 bg-white/90 hover:bg-[#181818] hover:text-[#F5F4F0] text-[#181818] font-mono text-xs tracking-wider uppercase transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              aria-label="Tutup Tampilan Penuh"
            >
              <span>[ TUTUP</span>
              <X className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-90" />
              <span>]</span>
            </button>
          </div>

          {/* Lightbox Center Image with Nav Arrows (Clicking backdrop closes) */}
          <div className="relative flex-1 flex items-center justify-center my-3 sm:my-4 overflow-hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : filteredPhotos.length - 1));
              }}
              className="absolute left-2 sm:left-6 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-[2px] bg-white/95 border border-[#181818]/25 text-[#181818] flex items-center justify-center hover:bg-[#181818] hover:text-[#F5F4F0] shadow-md transition-all cursor-pointer"
              aria-label="Foto Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl max-h-[64vh] sm:max-h-[68vh] flex items-center justify-center cursor-default"
            >
              <img
                src={filteredPhotos[lightboxIndex].src}
                alt={filteredPhotos[lightboxIndex].title}
                className="max-w-full max-h-[64vh] sm:max-h-[68vh] object-contain rounded-[2px] shadow-2xl border border-[#181818]/15 select-none bg-stone-200/40"
              />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev! < filteredPhotos.length - 1 ? prev! + 1 : 0));
              }}
              className="absolute right-2 sm:right-6 z-10 w-10 h-10 sm:w-11 sm:h-11 rounded-[2px] bg-white/95 border border-[#181818]/25 text-[#181818] flex items-center justify-center hover:bg-[#181818] hover:text-[#F5F4F0] shadow-md transition-all cursor-pointer"
              aria-label="Foto Selanjutnya"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Lightbox Bottom Caption Bar (Protected High-Contrast Editorial Plaque) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full mt-2 sm:mt-3 p-4 sm:p-5 rounded-[2px] bg-white/90 backdrop-blur-md border border-[#181818]/15 shadow-sm flex flex-col md:flex-row items-start md:items-end justify-between gap-4 cursor-default select-text"
          >
            <div className="max-w-3xl">
              {/* Category / Location Tag */}
              <div className="flex items-center gap-2 font-mono text-[11px] sm:text-xs text-stone-500 uppercase tracking-widest mb-1.5">
                <span className="font-bold text-[#0f766e]">
                  FIG. {filteredPhotos[lightboxIndex].figure}
                </span>
                <span>•</span>
                <span className="font-semibold text-stone-800">{filteredPhotos[lightboxIndex].location}</span>
                {filteredPhotos[lightboxIndex].elevation && (
                  <>
                    <span>•</span>
                    <span className="px-1.5 py-0.5 rounded-[2px] bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {filteredPhotos[lightboxIndex].elevation}
                    </span>
                  </>
                )}
              </div>

              {/* Photo Title (Deep High-Contrast Charcoal Ink) */}
              <h4 className="font-sans font-black text-xl sm:text-2xl text-[#181818] tracking-tight leading-snug">
                {filteredPhotos[lightboxIndex].title}
              </h4>

              {/* Photo Description (Dark Charcoal, Highly Legible & Comfortable to Read) */}
              <p className="font-sans font-medium text-xs sm:text-sm text-stone-700 mt-1.5 leading-relaxed">
                {filteredPhotos[lightboxIndex].caption}
              </p>
            </div>

            {/* Navigation Guide Indicator */}
            <div className="font-mono text-[10.5px] sm:text-[11px] text-stone-500 uppercase tracking-widest text-left md:text-right shrink-0 border-t md:border-t-0 border-[#181818]/10 pt-2 md:pt-0 w-full md:w-auto">
              <span className="text-stone-800 font-bold">NAVIGASI:</span> [←] [→] / Klik luar atau [ESC] untuk kembali
            </div>
          </div>
        </div>
      )}

      {/* Global Embedded Keyframes for Trail Fade */}
      <style>{`
        @keyframes trailFadeAnimation {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.85);
          }
          15% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          70% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.88);
          }
        }
        .animate-trail-fade {
          animation: trailFadeAnimation 1.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      </div>
  );

  return createPortal(modalContent, document.body);
};

export default FieldNotesArchiveModal;
