import React, { useState, useEffect } from 'react';
import { SchoolInfo, NewsAnnouncement, GalleryItem, HeroSlide, Language, NavigationPage } from '../types/index.ts';
import { translations } from '../i18n/translations.ts';
import {
  Calendar,
  ChevronRight,
  ChevronLeft,
  Award,
  BookOpen,
  GraduationCap,
  Users,
  User,
  Compass,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Building,
  Target,
  Pause,
  Play,
  Layers,
  HelpCircle,
  ShieldCheck,
  ZoomIn,
  X,
  Upload,
  Maximize2,
  Image as ImageIcon
} from 'lucide-react';

interface HomeViewProps {
  schoolInfo: SchoolInfo;
  announcements: NewsAnnouncement[];
  gallery: GalleryItem[];
  heroSlides?: HeroSlide[];
  lang: Language;
  onNavigate: (page: NavigationPage) => void;
  onSelectAnnouncement: (ann: NewsAnnouncement) => void;
}

interface PhotoSlide {
  id?: string;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  label: string;
  isCustom?: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  schoolInfo,
  announcements,
  gallery,
  heroSlides,
  lang,
  onNavigate,
  onSelectAnnouncement,
}) => {
  const t = translations[lang] || translations.en;

  // Initial authentic GSFAK photos and educational slides
  const defaultSlides: PhotoSlide[] = [
    {
      title: 'Scenic Lake Kivu Campus Environment',
      subtitle: 'A serene, peaceful learning haven overlooking the sparkling waters of Lake Kivu with fresh mountain air conducive to disciplined academic study.',
      image: '/gsfak_campus_kivu.jpg',
      badge: 'Kibogora, Nyamasheke · Est. 1969',
      label: 'Campus & Lake Kivu'
    },
    {
      title: 'Distinguished Leadership & Championship Honors',
      subtitle: 'Legal Representative & Headmaster Mr. Jean Bosco Nsengimana proudly presenting national trophies earned by GSFAK Kibogora scholars and athletic teams.',
      image: '/gsfak_principal_trophies.jpg',
      badge: 'Institutional Leadership · Honors',
      label: 'Headmaster & Trophies'
    },
    {
      title: '2024/2025 Rwanda National Handball Champions',
      subtitle: 'Celebrating championship victory in the FERWAHAND National Division, demonstrating discipline, teamwork, and athletic distinction.',
      image: '/gsfak_handball_champions.jpg',
      badge: 'National Champions · Sports Division',
      label: 'Handball Champions'
    },
    {
      title: 'Dedicated Teachers & Administrative Faculty',
      subtitle: 'Our qualified Rwandan educators and administrative leaders united at the GSFAK main gate, committed to educational excellence ("Uburezi Bufite Ireme").',
      image: '/gsfak_staff_group.jpg',
      badge: 'Teaching Faculty & Staff',
      label: 'Staff & Faculty'
    },
    {
      title: 'Modern Chemistry & Science Laboratory Research',
      subtitle: 'Hands-on experimentation with analytical reagents, beakers, and equipment fostering national distinction in PCB and MCB streams.',
      image: '/gsfak_science_lab.jpg',
      badge: 'Advanced Science & Chemistry Lab',
      label: 'Science Laboratory'
    },
    {
      title: 'Smart ICT & Computer Center',
      subtitle: 'Modern computer lab equipped with high-speed internet, coding workstations, and digital learning tools empowering technological mastery.',
      image: '/gsfak_ict_center.jpg',
      badge: 'Smart Class & Technology',
      label: 'ICT Center'
    },
    {
      title: 'Vibrant Campus Life & Academic Discipline',
      subtitle: 'Students thriving in a peaceful, disciplined secondary school environment anchored in knowledge, character, and community leadership.',
      image: '/gsfak_campus_life.jpg',
      badge: 'Student Community & Character',
      label: 'Campus Life'
    }
  ];

  const [slides, setSlides] = useState<PhotoSlide[]>(() => {
    if (heroSlides && heroSlides.length > 0) {
      return heroSlides;
    }
    try {
      const saved = localStorage.getItem('gsfak_custom_slides');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validCustom = parsed.filter((s: PhotoSlide) => s && s.image);
          return [...defaultSlides, ...validCustom];
        }
      }
    } catch {
      // fallback
    }
    return defaultSlides;
  });

  useEffect(() => {
    if (heroSlides && heroSlides.length > 0) {
      setSlides(heroSlides);
      if (activeSlide >= heroSlides.length) {
        setActiveSlide(0);
      }
    }
  }, [heroSlides]);

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // New photo upload state
  const [uploadImageTitle, setUploadImageTitle] = useState('');
  const [uploadImageSubtitle, setUploadImageSubtitle] = useState('');
  const [uploadImageBadge, setUploadImageBadge] = useState('Campus Showcase');
  const [uploadImagePreview, setUploadImagePreview] = useState<string | null>(null);

  // Auto slide timer (5.5s per slide)
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Handle local user file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCustomSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadImagePreview || !uploadImageTitle.trim()) return;

    const newSlide: PhotoSlide = {
      title: uploadImageTitle.trim(),
      subtitle: uploadImageSubtitle.trim() || 'Custom uploaded campus photography.',
      image: uploadImagePreview,
      badge: uploadImageBadge.trim() || 'Campus Photo',
      label: uploadImageTitle.slice(0, 16),
      isCustom: true
    };

    const updated = [...slides, newSlide];
    setSlides(updated);
    setActiveSlide(updated.length - 1);

    // Save custom slides to localStorage
    try {
      const customOnly = updated.filter((s) => s.isCustom);
      localStorage.setItem('gsfak_custom_slides', JSON.stringify(customOnly));
    } catch {
      // ignore
    }

    // Reset form
    setUploadImagePreview(null);
    setUploadImageTitle('');
    setUploadImageSubtitle('');
    setUploadModalOpen(false);
  };

  // Urgent announcement if any
  const urgentNotice = announcements.find((a) => a.isImportant && a.isPublished);

  // Gallery preview (up to 6 items)
  const galleryPreview = gallery.slice(0, 6);

  const currentSlide = slides[activeSlide] || slides[0];

  return (
    <div className="space-y-0 text-slate-700">

      {/* ============================================================ */}
      {/* 1. ANIMATED SPACE (CLEAN WHITISH / RESPONSIVE BACKGROUND)    */}
      {/* ============================================================ */}
      {/* ============================================================ */}
      {/* 1. ANIMATED IMAGE SHOWCASE WITH SMALL SCHOOL NAME RECTANGLE  */}
      {/* ============================================================ */}
      <section className="relative bg-gradient-to-b from-[#f8fafc] via-[#ffffff] to-[#f1f5f9] text-slate-800 overflow-hidden py-6 sm:py-8 border-b border-slate-200">
        
        {/* Soft subtle ambient lighting */}
        <div
          className="absolute inset-0 opacity-40 filter blur-3xl pointer-events-none transition-all duration-1000 scale-125"
          style={{
            backgroundImage: `radial-gradient(circle at 75% 35%, rgba(29, 78, 216, 0.08) 0%, rgba(245, 158, 11, 0.05) 50%, transparent 80%)`,
          }}
        />

        {/* Delicate collegiate texture */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* THE ANIMATED IMAGE PLACE (EXPANSIVE THEATER SHOWCASE) */}
          <div className="relative group rounded-3xl overflow-hidden bg-slate-100 border-2 border-slate-200/90 shadow-2xl ring-1 ring-slate-900/5 aspect-[16/10] sm:aspect-[21/10] lg:aspect-[2.35/1] min-h-[380px] sm:min-h-[460px] lg:min-h-[520px]">
            
            {/* 100% Clear & Fluent Crossfading Photo Slides with Ken Burns Animation */}
            {slides.map((s, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  idx === activeSlide ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                }`}
              >
                <img
                  src={s.image}
                  alt={s.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/gsfak_campus_kivu.jpg';
                  }}
                  className={`w-full h-full object-cover transition-transform duration-[7000ms] ease-out ${
                    idx === activeSlide ? 'scale-105' : 'scale-100'
                  }`}
                />
              </div>
            ))}

            {/* Protective top and bottom vignettes so overlays remain perfectly legible */}
            <div className="absolute inset-x-0 top-0 h-32 sm:h-36 bg-gradient-to-b from-slate-950/70 via-slate-950/20 to-transparent pointer-events-none z-20" />
            <div className="absolute inset-x-0 bottom-0 h-36 sm:h-44 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent pointer-events-none z-20" />

            {/* Top-Right: Controls (Pause/Play Auto-exchange & HD Zoom) */}
            <div className="absolute top-3.5 sm:top-5 right-3.5 sm:right-6 z-30 flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3 py-1.5 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white backdrop-blur-md border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md"
                title={isPlaying ? 'Pause auto-exchange' : 'Resume auto-exchange'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                <span className="hidden md:inline">{isPlaying ? 'Auto-Exchange' : 'Paused'}</span>
              </button>

              <button
                onClick={() => setLightboxOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white text-slate-800 backdrop-blur-md border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md hover:scale-105"
                title="Inspect photo in full screen HD"
              >
                <ZoomIn className="w-3.5 h-3.5 text-[#1d4ed8]" />
                <span className="hidden sm:inline">View HD</span>
              </button>
            </div>

            {/* Previous Photo Chevron (Exchange Anytime) */}
            <button
              onClick={handlePrevSlide}
              className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-[#0c2340] border border-slate-200 shadow-xl backdrop-blur-md flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
              aria-label="Previous photo (Exchange anytime)"
              title="Previous photo"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Next Photo Chevron (Exchange Anytime) */}
            <button
              onClick={handleNextSlide}
              className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-[#0c2340] border border-slate-200 shadow-xl backdrop-blur-md flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
              aria-label="Next photo (Exchange anytime)"
              title="Next photo"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Bottom Overlay: Slide Info & Interactive Dots to Exchange Anytime */}
            <div className="absolute bottom-3.5 sm:bottom-5 left-3.5 sm:left-6 right-3.5 sm:right-6 z-30 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
              
              {/* Photo Title & Caption */}
              <div className="space-y-0.5 sm:space-y-1 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                  <Sparkles className="w-3 h-3 text-slate-950" />
                  <span>{currentSlide.badge}</span>
                </div>
                <h2 className="text-base sm:text-xl lg:text-2xl font-black text-white drop-shadow-md leading-tight">
                  {currentSlide.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 drop-shadow line-clamp-1 sm:line-clamp-2 max-w-lg font-normal">
                  {currentSlide.subtitle}
                </p>
              </div>

              {/* Interactive Slide Dots to Exchange Anytime + Counter */}
              <div className="flex items-center gap-2 sm:gap-3 bg-slate-950/65 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 self-start sm:self-end">
                <div className="flex items-center gap-1.5">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === activeSlide
                          ? 'w-7 sm:w-8 bg-amber-400'
                          : 'w-2 sm:w-2.5 bg-white/40 hover:bg-white/80'
                      }`}
                      aria-label={`Jump to photo ${idx + 1}`}
                      title={`Photo ${idx + 1}: ${slides[idx].label}`}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-mono font-bold text-amber-300 pl-1.5 border-l border-white/20">
                  {String(activeSlide + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}
                </span>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* LIGHTBOX MODAL: FULLSCREEN HIGH DEFINITION PHOTO VIEW         */}
      {/* ============================================================ */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                {currentSlide.badge}
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {currentSlide.title}
                </h3>
                <p className="text-xs text-slate-400">
                  GSFAK Kibogora Campus Photo {activeSlide + 1} of {slides.length}
                </p>
              </div>
            </div>

            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Close Fullscreen View"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Large Image Frame */}
          <div className="relative flex-1 flex items-center justify-center my-4 max-w-7xl mx-auto w-full overflow-hidden">
            <button
              onClick={handlePrevSlide}
              className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-white/20 backdrop-blur-md transition cursor-pointer shadow-xl hover:scale-110"
              title="Previous Photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/gsfak_campus_kivu.jpg';
              }}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/20"
            />

            <button
              onClick={handleNextSlide}
              className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white border border-white/20 backdrop-blur-md transition cursor-pointer shadow-xl hover:scale-110"
              title="Next Photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Footer Caption */}
          <div className="max-w-3xl mx-auto text-center text-slate-300 text-xs sm:text-sm py-2">
            <p>{currentSlide.subtitle}</p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: UPLOAD & ANIMATE CUSTOM PHOTOS                        */}
      {/* ============================================================ */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1d4ed8] border border-blue-200 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0c2340]">
                    Upload & Animate Photo
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add custom images to the campus slideshow
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomSlide} className="space-y-4">
              {/* File upload input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Photo File (JPG, PNG)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#1d4ed8] hover:file:bg-blue-100 cursor-pointer border border-slate-200 rounded-xl p-1"
                />
              </div>

              {/* Or image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Or Paste Image Web URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/school-photo.jpg"
                  value={uploadImagePreview || ''}
                  onChange={(e) => setUploadImagePreview(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
              </div>

              {/* Preview */}
              {uploadImagePreview && (
                <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video relative bg-slate-100">
                  <img
                    src={uploadImagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-[10px] font-bold text-white">
                    Preview Ready
                  </span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Photo Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Fair Champions 2025"
                  value={uploadImageTitle}
                  onChange={(e) => setUploadImageTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Photo Description / Story
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the occasion, teachers, or students pictured..."
                  value={uploadImageSubtitle}
                  onChange={(e) => setUploadImageSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
              </div>

              {/* Badge */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category Tag / Badge
                </label>
                <input
                  type="text"
                  placeholder="e.g. Academic Honors · 2025"
                  value={uploadImageBadge}
                  onChange={(e) => setUploadImageBadge(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadImagePreview || !uploadImageTitle.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1d4ed8] hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Add to Slideshow & Animate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. TWO DIVISIONS: LEFT (VISION & MISSION) & RIGHT (RESERVED) */}
      {/* ============================================================ */}
      <section className="py-14 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            
            {/* ======================================================== */}
            {/* DIVISION 1 (LEFT PART): SCHOOL VISION, UNDER THAT MISSION */}
            {/* ======================================================== */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-[#1d4ed8]">
                    Core Educational Philosophy
                  </span>
                  <h2
                    className="text-2xl sm:text-3xl font-extrabold text-[#0c2340] mt-1 tracking-tight"
                  >
                    Vision & Mission of GSFAK
                  </h2>
                </div>

                {/* Left Part: 1. SCHOOL VISION */}
                <div className="p-6 sm:p-7 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-sm transition space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1d4ed8] border border-blue-200 flex items-center justify-center shrink-0">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#1d4ed8] block">
                        Institutional Aspiration
                      </span>
                      <h3
                        className="text-lg sm:text-xl font-black text-[#0c2340] leading-tight"
                      >
                        School Vision
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal pt-1">
                    {schoolInfo.vision[lang] || schoolInfo.vision.en}
                  </p>
                </div>

                {/* Left Part: 2. UNDER THAT WILL BE SCHOOL MISSION */}
                <div className="p-6 sm:p-7 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-sm transition space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1d4ed8] border border-blue-200 flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#1d4ed8] block">
                        Our Core Purpose
                      </span>
                      <h3
                        className="text-lg sm:text-xl font-black text-[#0c2340] leading-tight"
                      >
                        School Mission
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal pt-1">
                    {schoolInfo.mission[lang] || schoolInfo.mission.en}
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-200/60">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Providing quality, disciplined secondary education preparing self-reliant leaders.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Fostering academic rigor and scientific curiosity in mathematics and laboratory sciences.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Instilling human values, Christian ethics, and patriotic Rwandan citizenship.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('about')}
                  className="px-5 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Learn More About Our History</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ======================================================== */}
            {/* DIVISION 2 (RIGHT PART): CORE VALUES & EDUCATIONAL PILLARS */}
            {/* ======================================================== */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-[#1d4ed8]">
                    Guiding Principles
                  </span>
                  <h2
                    className="text-2xl sm:text-3xl font-extrabold text-[#0c2340] mt-1 tracking-tight"
                  >
                    Core Values & Pillars
                  </h2>
                </div>

                <div className="space-y-4">
                  {schoolInfo.coreValues && schoolInfo.coreValues.length > 0 ? (
                    schoolInfo.coreValues.map((val, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:shadow-sm transition"
                      >
                        <div className="flex items-center gap-3 mb-1.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1d4ed8] border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
                            {idx + 1}
                          </div>
                          <h4 className="font-extrabold text-[#0c2340] text-sm sm:text-base">
                            {val.name[lang] || val.name.en}
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pl-11">
                          {val.description[lang] || val.description.en}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-3">
                      <h4 className="font-bold text-[#0c2340]">Academic & Moral Distinction</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Anchored in knowledge and character ("Ubumenyi - Uburere"), empowering young scholars with holistic development.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('contact')}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Connect With Our Admissions Office</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. ACADEMIC COMBINATIONS SECTION                             */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-extrabold tracking-wider text-[#1d4ed8]">
              Academic Streams
            </span>
            <h2
              className="text-2xl sm:text-4xl font-extrabold text-[#0c2340] mt-1 tracking-tight"
            >
              Educational Streams & Combinations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Comprehensive curricula accredited by the Rwanda Basic Education Board (NESA/REB).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {schoolInfo.academicStreams.map((stream) => (
              <div
                key={stream.code}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-[#1d4ed8] font-black text-sm flex items-center justify-center mb-4 group-hover:bg-[#1d4ed8] group-hover:text-white transition">
                    {stream.code}
                  </div>
                  <h3
                    className="font-bold text-[#0c2340] text-base mb-1"
                  >
                    {stream.name}
                  </h3>
                  <span className="text-xs font-semibold text-amber-700 block mb-3">
                    {stream.level}
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {stream.description}
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onNavigate('courses')}
                    className="text-[#1d4ed8] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Curriculum</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. RECENT POSTS / ANNOUNCEMENTS                              */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-12">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#1d4ed8]">
                Official School Communications
              </span>
              <h2
                className="text-2xl sm:text-4xl font-extrabold text-[#0c2340] mt-1 tracking-tight"
              >
                Recent News & Announcements
              </h2>
            </div>
            <button
              onClick={() => onNavigate('announcements')}
              className="text-xs font-bold text-[#1d4ed8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Bulletins</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Urgent Banner if active */}
          {urgentNotice && (
            <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0">
                  <Award className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-xs font-bold text-amber-900 uppercase">
                    Important Announcement · {new Date(urgentNotice.publishedAt).toLocaleDateString()}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base mt-0.5">
                    {urgentNotice.title[lang] || urgentNotice.title.en}
                  </h4>
                </div>
              </div>
              <button
                onClick={() => onSelectAnnouncement(urgentNotice)}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shrink-0 transition cursor-pointer shadow-xs"
              >
                Read Details
              </button>
            </div>
          )}

          {/* Numbered Announcements List */}
          <ol className="space-y-6 list-none p-0 m-0">
            {announcements.slice(0, 3).map((item, idx) => {
              const contentText = (item.content[lang] || item.content.en || '').trim();
              const summaryText = (item.summary[lang] || item.summary.en || '').trim();
              const isLarger = contentText.length > 0 && contentText !== summaryText;

              return (
                <li
                  key={item.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    
                    {/* Number Badge (1, 2, 3...) */}
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#0c2340] text-amber-400 font-black text-base sm:text-lg flex items-center justify-center shrink-0 shadow-sm border border-slate-700/40">
                      {idx + 1}
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 space-y-3.5 min-w-0">
                      
                      {/* Date & Meta */}
                      <div className="flex flex-wrap items-center gap-2.5 text-xs">
                        <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
                          <Calendar className="w-3.5 h-3.5 text-[#1d4ed8]" />
                          <span>{new Date(item.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </span>

                        {item.isImportant && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 font-bold flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-600" />
                            <span>Urgent Circular</span>
                          </span>
                        )}

                        <span className="font-bold text-[#1d4ed8] uppercase tracking-wider text-[11px] px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-100">
                          {item.type}
                        </span>

                        {item.authorName && (
                          <span className="text-slate-500 text-xs hidden sm:inline flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.authorName}</span>
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3
                        className="font-extrabold text-lg sm:text-2xl text-[#0c2340] leading-snug tracking-tight"
                      >
                        {item.title[lang] || item.title.en}
                      </h3>

                      {/* ALL OVERVIEW (Fully visible right here instead of pressing on it) */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                        <p className="whitespace-pre-line">{item.summary[lang] || item.summary.en}</p>
                      </div>

                      {/* If larger, show "View the Announcement" button */}
                      {isLarger && (
                        <div className="pt-1">
                          <button
                            onClick={() => onSelectAnnouncement(item)}
                            className="px-5 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-xs cursor-pointer group"
                          >
                            <span>View the Announcement</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                          </button>
                        </div>
                      )}

                    </div>

                    {/* Clean Image with NO TEXT on it */}
                    {item.imageUrl && (
                      <div className="w-full md:w-56 lg:w-64 aspect-[16/10] md:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs relative">
                        <img
                          src={item.imageUrl}
                          alt={item.title[lang] || item.title.en}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/gsfak_science_lab.jpg';
                          }}
                          className="w-full h-full object-cover hover:scale-105 transition duration-500"
                        />
                        {/* Zero text on image as instructed */}
                      </div>
                    )}

                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. GALLERY PREVIEW                                           */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 bg-slate-50/80 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#1d4ed8]">
                Campus Archives
              </span>
              <h2
                className="text-2xl sm:text-4xl font-extrabold text-[#0c2340] mt-1 tracking-tight"
              >
                School Photo Gallery
              </h2>
            </div>
            <button
              onClick={() => onNavigate('gallery')}
              className="text-xs font-bold text-[#1d4ed8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Gallery</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryPreview.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate('gallery')}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs cursor-pointer"
              >
                <div className="h-56 overflow-hidden bg-slate-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title[lang] || item.title.en}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1d4ed8]">
                    {item.category}
                  </span>
                  <h4
                    className="font-bold text-[#0c2340] text-sm mt-0.5 line-clamp-1"
                  >
                    {item.title[lang] || item.title.en}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
