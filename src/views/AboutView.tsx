import React from 'react';
import { SchoolInfo, StaffMember, Language } from '../types/index.ts';
import { translations } from '../i18n/translations.ts';
import {
  Compass,
  Target,
  Sparkles,
  Users,
  Building,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  Award
} from 'lucide-react';

interface AboutViewProps {
  schoolInfo: SchoolInfo;
  staff: StaffMember[];
  lang: Language;
}

export const AboutView: React.FC<AboutViewProps> = ({
  schoolInfo,
  staff,
  lang,
}) => {
  const t = translations[lang];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20 text-slate-700">
      {/* 1. Header & Founding Narrative with Official Emblem */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1d4ed8]">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Founding Story</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Established 1969</span>
          </div>

          <div>
            <h2
              className="text-4xl sm:text-5xl font-black text-[#0c2340] tracking-tight leading-none"
            >
              GSFAK
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-semibold mt-1.5">
              Groupe Scolaire Frank Adamson de Kibogora
            </p>
          </div>

          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#0c2340] tracking-tight leading-snug"
          >
            {t.about_title}
          </h1>

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            {schoolInfo.aboutStory[lang] || schoolInfo.aboutStory.en}
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-[#0c2340]">
              <Building className="w-4 h-4 text-[#1d4ed8]" />
              <span>Kibogora, Kanjongo, Nyamasheke, Western Province, Rwanda</span>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-[#0c2340]">
              <GraduationCap className="w-4 h-4 text-[#1d4ed8]" />
              <span>Ordinary Level & Advanced Level STEM/Humanities</span>
            </span>
          </div>
        </div>

        {/* Official Crest Showcase Card */}
        <div className="lg:col-span-4 flex flex-col items-center">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg text-center max-w-xs w-full">
            <div className="w-48 h-48 mx-auto flex items-center justify-center overflow-hidden mb-3">
              <img
                src={schoolInfo.logoUrl || '/gsfak_logo.jpg'}
                alt="GSFAK Crest"
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="font-black text-xl text-[#0c2340]">
              GSFAK
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Groupe Scolaire Frank Adamson de Kibogora
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] font-bold text-[#1d4ed8] uppercase tracking-wider">
              Ubumenyi - Uburere · 1969
            </div>
          </div>
        </div>
      </section>

      {/* 2. Mission & Vision Cards (rundatss.rw style) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1d4ed8] mb-6">
            <Target className="w-6 h-6" />
          </div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-[#1d4ed8] mb-2 block">
            {t.mission_title}
          </span>
          <h2
            className="text-xl sm:text-2xl font-bold text-[#0c2340] tracking-tight mb-4"
          >
            Transformative Secondary Education
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {schoolInfo.mission[lang] || schoolInfo.mission.en}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1d4ed8] mb-6">
            <Compass className="w-6 h-6" />
          </div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-[#1d4ed8] mb-2 block">
            {t.vision_title}
          </span>
          <h2
            className="text-xl sm:text-2xl font-bold text-[#0c2340] tracking-tight mb-4"
          >
            Center of Academic & Moral Distinction
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {schoolInfo.vision[lang] || schoolInfo.vision.en}
          </p>
        </div>
      </section>

      {/* 3. Core Values */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase font-extrabold tracking-wider text-[#1d4ed8]">
            Guiding Philosophy
          </span>
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-[#0c2340] mt-1"
          >
            {t.core_values_title}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {schoolInfo.coreValues.map((val, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-blue-300 transition"
            >
              <div>
                <span className="text-xs font-bold text-[#1d4ed8]">
                  0{idx + 1}. Value
                </span>
                <h3
                  className="font-bold text-[#0c2340] text-base mt-1 mb-2"
                >
                  {val.name[lang] || val.name.en}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {val.description[lang] || val.description.en}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Leadership & Faculty (Clearly Marked Editable Placeholders) */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-[#1d4ed8]">
              Institutional Governance
            </span>
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-[#0c2340] mt-1"
            >
              {t.leadership_title}
            </h2>
          </div>
        </div>

        {/* Clear Notice Regarding Placeholders */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{t.leadership_placeholder_note}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-blue-300 transition"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={member.photoUrl}
                    alt={member.fullName}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h3
                      className="font-bold text-[#0c2340] text-sm"
                    >
                      {member.fullName}
                    </h3>
                    <p className="text-xs text-[#1d4ed8] font-semibold mt-0.5">
                      {member.title[lang] || member.title.en}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {member.department}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                  <p>
                    <span className="font-semibold text-slate-700">Qualification:</span>{' '}
                    {member.qualification}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Contact:</span>{' '}
                    {member.emailPlaceholder}
                  </p>
                </div>
              </div>

              {member.isPlaceholderNotice && (
                <div className="mt-4 pt-2 text-[10px] text-amber-700 font-medium">
                  ● Editable via Admin Dashboard
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
