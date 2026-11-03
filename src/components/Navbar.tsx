import React, { useState } from 'react';
import { SchoolInfo, Language, AdminUser, NavigationPage } from '../types/index.ts';
import { translations } from '../i18n/translations.ts';
import {
  LogOut,
  Menu,
  X,
  Globe,
  Camera,
  Home,
  Info,
  BookOpen,
  CreditCard,
  Image as ImageIcon,
  Users,
  Bell,
  Newspaper,
  LayoutDashboard,
  KeyRound,
  Mail
} from 'lucide-react';

interface NavbarProps {
  schoolInfo: SchoolInfo;
  activePage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  currentAdmin: AdminUser | null;
  onLogout: () => void;
  onOpenStaffLogin: () => void;
  onOpenLogoUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  schoolInfo,
  activePage,
  onNavigate,
  lang,
  onLanguageChange,
  currentAdmin,
  onLogout,
  onOpenStaffLogin,
  onOpenLogoUpload,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[lang] || translations.en;

  const handleAdminClick = () => {
    onNavigate('admin');
    setMobileMenuOpen(false);
  };

  const navItems = [
    { key: 'home' as const, label: t.nav_home || 'Home', icon: Home },
    { key: 'about' as const, label: t.nav_about || 'About Us', icon: Info },
    { key: 'courses' as const, label: t.nav_courses || 'Courses', icon: BookOpen },
    { key: 'fees' as const, label: t.nav_fees || 'School Fees', icon: CreditCard },
    { key: 'gallery' as const, label: t.nav_gallery || 'Gallery', icon: ImageIcon },
    { key: 'staff' as const, label: t.nav_staff || 'Staff', icon: Users },
    {
      key: 'announcements' as const,
      label: lang === 'rw' ? 'Amakuru n\'Amatangazo' : lang === 'fr' ? 'Nouvelles & Avis' : 'News & Announcements',
      icon: Bell
    },
    {
      key: 'contact' as const,
      label: lang === 'rw' ? 'Twandikire' : lang === 'fr' ? 'Contactez-nous' : 'Contact Us',
      icon: Mail
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Main School Brand & Complete Navigation Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & School Name */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Official School Logo */}
            <div className="relative group/logo">
              <div
                onClick={() => onNavigate('home')}
                className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-white border border-slate-200 p-1 shadow-xs overflow-hidden flex items-center justify-center shrink-0 cursor-pointer group-hover/logo:border-[#1d4ed8] transition"
              >
                <img
                  src={schoolInfo.logoUrl || '/gsfak_logo.jpg'}
                  alt="GSFAK Official School Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Upload Photo Overlay: ONLY visible to logged-in administrator */}
              {currentAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLogoUpload();
                  }}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1d4ed8] text-white flex items-center justify-center shadow-md hover:bg-[#1e40af] transition cursor-pointer"
                  title="Admin: Change school logo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* School Name */}
            <button
              onClick={() => onNavigate('home')}
              className="text-left group cursor-pointer"
            >
              <div className="font-black text-2xl sm:text-3xl text-[#0c2340] tracking-tight leading-none group-hover:text-[#1d4ed8] transition">
                GSFAK
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mt-0.5 tracking-tight line-clamp-1">
                Groupe Scolaire Frank Adamson de Kibogora
              </div>
            </button>
          </div>

          {/* Navigation Items (Desktop) */}
          <div className="hidden xl:flex items-center gap-1">
            <nav className="flex items-center gap-0.5 text-xs lg:text-[13px] font-semibold">
              {navItems.map((item) => {
                const isActive = item.key === 'announcements'
                  ? (activePage === 'announcements' || activePage === 'news')
                  : activePage === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onNavigate(item.key)}
                    className={`px-2.5 py-2 transition-colors cursor-pointer relative whitespace-nowrap ${
                      isActive
                        ? 'text-[#1d4ed8] font-bold'
                        : 'text-[#0c2340] hover:text-[#1d4ed8]'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#1d4ed8] rounded-full"></span>
                    )}
                  </button>
                );
              })}

              {/* Admin Login / Dashboard Navigation Button */}
              <button
                onClick={handleAdminClick}
                className={`ml-1 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  activePage === 'admin'
                    ? 'bg-[#1d4ed8] text-white border-[#1d4ed8] shadow-xs'
                    : currentAdmin
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-[#1d4ed8]'
                }`}
                title={currentAdmin ? 'Open Admin Dashboard' : 'Open Admin Login'}
              >
                {currentAdmin ? (
                  <>
                    <LayoutDashboard className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t.nav_admin_dashboard || 'Admin Dashboard'}</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.nav_admin_login || 'Admin Login'}</span>
                  </>
                )}
              </button>

              {currentAdmin && (
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer border border-transparent hover:border-rose-200"
                  title={t.logout_btn || 'Sign out'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </nav>

            {/* Desktop Language Selector */}
            <div className="pl-3 ml-2 border-l border-slate-200 flex items-center">
              <div className="flex items-center bg-slate-100/90 p-1 rounded-full border border-slate-200/90 shadow-2xs">
                <Globe className="w-3.5 h-3.5 text-[#1d4ed8] ml-1.5 mr-1" />
                <button
                  onClick={() => onLanguageChange('en')}
                  className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    lang === 'en'
                      ? 'bg-[#1d4ed8] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#0c2340]'
                  }`}
                  title="Switch to English"
                >
                  EN
                </button>
                <button
                  onClick={() => onLanguageChange('rw')}
                  className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    lang === 'rw'
                      ? 'bg-[#1d4ed8] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#0c2340]'
                  }`}
                  title="Hindura mu Kinyarwanda"
                >
                  RW
                </button>
                <button
                  onClick={() => onLanguageChange('fr')}
                  className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    lang === 'fr'
                      ? 'bg-[#1d4ed8] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#0c2340]'
                  }`}
                  title="Passer en Français"
                >
                  FR
                </button>
              </div>
            </div>
          </div>

          {/* Medium Screen / Tablet Shortcuts & Mobile Menu Trigger */}
          <div className="flex items-center gap-2 xl:hidden">
            {/* Quick Admin Access Button on Mobile/Tablet */}
            <button
              onClick={handleAdminClick}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
                activePage === 'admin'
                  ? 'bg-[#1d4ed8] text-white border-[#1d4ed8]'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {currentAdmin ? (
                <>
                  <LayoutDashboard className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Dashboard</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Admin</span>
                </>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer border border-slate-200"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Includes all requested nav items) */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-1 shadow-lg animate-fadeIn max-h-[85vh] overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.key === 'announcements'
              ? (activePage === 'announcements' || activePage === 'news')
              : activePage === item.key;
            const ItemIcon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onNavigate(item.key);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition cursor-pointer ${
                  isActive
                    ? 'text-[#1d4ed8] bg-blue-50/80 font-bold border-l-4 border-[#1d4ed8]'
                    : 'text-[#0c2340] hover:bg-slate-50'
                }`}
              >
                <ItemIcon className="w-4 h-4 shrink-0 text-slate-500" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Admin Login / Dashboard Item in Mobile Menu */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleAdminClick}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition cursor-pointer ${
                activePage === 'admin'
                  ? 'text-white bg-[#1d4ed8] font-bold shadow-xs'
                  : currentAdmin
                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                  : 'text-[#0c2340] hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {currentAdmin ? (
                  <LayoutDashboard className="w-4 h-4 text-amber-500" />
                ) : (
                  <KeyRound className="w-4 h-4 text-slate-500" />
                )}
                <span>
                  {currentAdmin
                    ? (t.nav_admin_dashboard || 'Admin Dashboard')
                    : (t.nav_admin_login || 'Admin Login')}
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/10">
                {currentAdmin ? 'Authenticated' : 'Portal'}
              </span>
            </button>
          </div>

          {/* Mobile Language Switcher */}
          <div className="mt-4 pt-4 border-t border-slate-200 px-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#1d4ed8]" />
              <span>{t.language_select || 'Language / Ururimi / Langue'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  onLanguageChange('en');
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center border transition cursor-pointer ${
                  lang === 'en'
                    ? 'bg-[#1d4ed8] text-white border-[#1d4ed8] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                English
              </button>
              <button
                onClick={() => {
                  onLanguageChange('rw');
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center border transition cursor-pointer ${
                  lang === 'rw'
                    ? 'bg-[#1d4ed8] text-white border-[#1d4ed8] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Kinyarwanda
              </button>
              <button
                onClick={() => {
                  onLanguageChange('fr');
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold text-center border transition cursor-pointer ${
                  lang === 'fr'
                    ? 'bg-[#1d4ed8] text-white border-[#1d4ed8] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Français
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
