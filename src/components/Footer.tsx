import React from 'react';
import { SchoolInfo, Language, NavigationPage } from '../types/index.ts';
import { translations } from '../i18n/translations.ts';
import { MapPin, Phone, Mail, Clock, Download, ShieldCheck, ExternalLink, ChevronRight } from 'lucide-react';

interface FooterProps {
  schoolInfo: SchoolInfo;
  lang: Language;
  onNavigate: (page: NavigationPage) => void;
  onOpenXamppExport: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  schoolInfo,
  lang,
  onNavigate,
  onOpenXamppExport,
}) => {
  const t = translations[lang] || translations.en;

  return (
    <footer className="bg-slate-50 text-slate-600 border-t border-slate-200 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Col 1: Institutional Identity (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div
                onClick={() => onNavigate('home')}
                className="w-13 h-13 rounded-2xl bg-white border border-slate-200 p-1.5 shadow-2xs overflow-hidden flex items-center justify-center shrink-0 cursor-pointer hover:border-[#1d4ed8] transition"
              >
                <img
                  src={schoolInfo.logoUrl || '/gsfak_logo.jpg'}
                  alt="GSFAK Official School Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-black text-[#0c2340] text-xl sm:text-2xl leading-none tracking-tight">
                  GSFAK
                </h3>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  Groupe Scolaire Frank Adamson de Kibogora
                </p>
                <p className="text-[10px] text-amber-600 font-bold mt-1 uppercase tracking-wider">
                  Ubumenyi - Uburere · Est. {schoolInfo.establishedYear}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {schoolInfo.motto[lang] || schoolInfo.motto.en}
            </p>

            <div className="pt-1 text-xs text-slate-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">Accredited Secondary Institution in Rwanda (NESA/REB)</span>
            </div>
          </div>

          {/* Col 2: Navigation Links (Span 2) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold text-[#0c2340] uppercase tracking-wider mb-4">
              School Navigation
            </h4>
            <ul className="grid grid-cols-2 sm:grid-cols-1 gap-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="text-slate-600 hover:text-[#1d4ed8] transition cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>{t.nav_home || 'Home'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="text-slate-600 hover:text-[#1d4ed8] transition cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>{t.nav_about || 'About Us'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('courses')}
                  className="text-slate-600 hover:text-[#1d4ed8] transition cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>{t.nav_courses || 'Courses & Combos'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('fees')}
                  className="text-slate-600 hover:text-[#1d4ed8] transition cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>{t.nav_fees || 'School Fees'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="text-slate-600 hover:text-[#1d4ed8] transition cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>{t.nav_gallery || 'Gallery'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('staff')}
                  className="text-slate-600 hover:text-[#1d4ed8] transition cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>{t.nav_staff || 'Staff & Teachers'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('announcements')}
                  className="text-slate-600 hover:text-[#1d4ed8] transition cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>News & Announcements</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="text-slate-600 hover:text-[#1d4ed8] transition cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>Contact Us</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="text-slate-600 hover:text-[#1d4ed8] transition cursor-pointer flex items-center gap-1.5 font-medium"
                >
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span>{t.nav_admin || 'Admin Portal'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Official Location & Contacts (Span 4) */}
          <div className="lg:col-span-4">
            <h4
              className="text-xs font-bold text-[#0c2340] uppercase tracking-wider mb-4"
            >
              Campus & Contacts
            </h4>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#1d4ed8] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {schoolInfo.location.village}, {schoolInfo.location.sector} Sector,{' '}
                  {schoolInfo.location.district} District, {schoolInfo.location.province},{' '}
                  {schoolInfo.location.country}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#1d4ed8] shrink-0" />
                <span className="font-semibold text-slate-700">{schoolInfo.contact.phonePrimary}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#1d4ed8] shrink-0" />
                <span className="truncate text-slate-700">{schoolInfo.contact.emailOfficial}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#1d4ed8] shrink-0" />
                <span>{schoolInfo.contact.officeHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & institutional credentials */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} <span className="font-bold text-[#0c2340]">GSFAK</span> (Groupe Scolaire Frank Adamson de Kibogora). All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Kibogora, Nyamasheke · Est. {schoolInfo.establishedYear}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
