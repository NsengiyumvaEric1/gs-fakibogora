import React, { useState } from 'react';
import { SchoolInfo, Language } from '../types/index.ts';
import { translations } from '../i18n/translations.ts';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Compass
} from 'lucide-react';

interface ContactViewProps {
  schoolInfo: SchoolInfo;
  lang: Language;
}

export const ContactView: React.FC<ContactViewProps> = ({ schoolInfo, lang }) => {
  const [formData, setFormData] = useState({
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!formData.senderName || !formData.senderEmail || !formData.subject || !formData.message) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }

      setSuccessMessage(t.form_success);
      setFormData({
        senderName: '',
        senderEmail: '',
        senderPhone: '',
        subject: '',
        message: '',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Error transmitting message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 text-slate-700">
      {/* Page Title */}
      <div className="max-w-3xl space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-wider text-[#1d4ed8]">
          Communications & Inquiries
        </span>
        <div>
          <h2
            className="text-4xl sm:text-5xl font-black text-[#0c2340] tracking-tight leading-none"
          >
            GSFAK
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
            Groupe Scolaire Frank Adamson de Kibogora
          </p>
        </div>
        <h1
          className="text-2xl sm:text-3xl font-extrabold text-[#0c2340] tracking-tight mt-2"
        >
          {t.contact_title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
          {t.contact_sub}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Col: School Location, Email & Telephone Numbers (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. School Location */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                  Campus Geography
                </span>
                <h3 className="font-extrabold text-[#0c2340] text-base">
                  School Location
                </h3>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal pt-1">
              {schoolInfo.location.village}, {schoolInfo.location.cell} Cell,{' '}
              {schoolInfo.location.sector} Sector, {schoolInfo.location.district} District,{' '}
              {schoolInfo.location.province}, {schoolInfo.location.country}
            </p>
            <div className="pt-2 text-xs text-amber-800 font-semibold flex items-center gap-1.5">
              <span>● Landmark:</span>
              <span className="font-normal text-slate-600">{schoolInfo.location.landmark}</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Postal Address: {schoolInfo.contact.postalAddress}
            </p>
          </div>

          {/* 2. Telephone Numbers */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1d4ed8] shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1d4ed8] block">
                  Direct Phone Lines
                </span>
                <h3 className="font-extrabold text-[#0c2340] text-base">
                  Telephone Numbers
                </h3>
              </div>
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-slate-700 pt-1">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-600">Primary Line:</span>
                <a href={`tel:${schoolInfo.contact.phonePrimary}`} className="font-bold text-[#1d4ed8] hover:underline">
                  {schoolInfo.contact.phonePrimary}
                </a>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-600">Secondary Line:</span>
                <a href={`tel:${schoolInfo.contact.phoneSecondary}`} className="font-bold text-[#1d4ed8] hover:underline">
                  {schoolInfo.contact.phoneSecondary}
                </a>
              </div>
            </div>
          </div>

          {/* 3. Official Email */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Official Inquiries
                </span>
                <h3 className="font-extrabold text-[#0c2340] text-base">
                  Official Email
                </h3>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm flex items-center justify-between">
              <span className="font-semibold text-slate-600">Email Address:</span>
              <a href={`mailto:${schoolInfo.contact.emailOfficial}`} className="font-bold text-emerald-700 hover:underline">
                {schoolInfo.contact.emailOfficial}
              </a>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Office Hours: {schoolInfo.contact.officeHours}</span>
            </div>
          </div>

        </div>

        {/* Right Col: Space to Write Message to Admission (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-5">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#1d4ed8] block">
                Admissions & Enrollment Office
              </span>
              <h2
                className="text-2xl sm:text-3xl font-extrabold text-[#0c2340] tracking-tight mt-1"
              >
                Write a Message to School Admission
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Use this space to send your inquiries regarding student admission, academic stream vacancies, transfer applications, or boarding arrangements directly to the GSFAK Admissions Office.
              </p>
            </div>

            {successMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                <span className="font-medium leading-relaxed">{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Student or Parent Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  placeholder="e.g. Jean de Dieu Munyaneza"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#1d4ed8] focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.senderEmail}
                    onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                    placeholder="parent@example.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#1d4ed8] focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Telephone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.senderPhone}
                    onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                    placeholder="+250 788 000 000"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#1d4ed8] focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Academic Combination or Level of Interest *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#1d4ed8] focus:outline-none transition"
                >
                  <option value="Admission Inquiry: Ordinary Level (Senior 1 - Senior 3)">Ordinary Level (Senior 1 - Senior 3)</option>
                  <option value="Admission Inquiry: MCB (Mathematics - Chemistry - Biology)">MCB (Mathematics - Chemistry - Biology)</option>
                  <option value="Admission Inquiry: MPC (Mathematics - Physics - Chemistry)">MPC (Mathematics - Physics - Chemistry)</option>
                  <option value="Admission Inquiry: PCB (Physics - Chemistry - Biology)">PCB (Physics - Chemistry - Biology)</option>
                  <option value="Admission Inquiry: MEG (Mathematics - Economics - Geography)">MEG (Mathematics - Economics - Geography)</option>
                  <option value="General Admission & School Transfer Inquiry">General Admission & School Transfer Inquiry</option>
                </select>
              </div>

              {/* Space to write message to admission */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Space to Write Message to Admission *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your message here regarding admission requirements, fee structures, boarding items, student transfer, or registration dates for GSFAK..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-[#1d4ed8] focus:outline-none transition leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] disabled:bg-blue-300 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Transmitting message to admission...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message to Admission</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* FIND US ON THE MAP SECTION                                       */}
      {/* Interactive Google Map with Get Directions button & responsive UI */}
      {/* ================================================================= */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#1d4ed8] text-[11px] font-bold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-[#1d4ed8]" />
              <span>Campus Geolocation & Navigation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0c2340] tracking-tight">
              {t.map_section_title || 'Find Us on the Map'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {t.map_section_sub ||
                'Groupe Scolaire Frank Adamson de Kibogora (GSFAK), located in Kibogora, Kanjongo Sector, Nyamasheke District, Western Province, Rwanda.'}
            </p>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={
                schoolInfo.location?.directionsUrl ||
                `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  'Groupe Scolaire Frank Adamson de Kibogora, Kibogora, Kanjongo, Nyamasheke, Western Province, Rwanda'
                )}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-xs sm:text-sm shadow-sm transition group"
              title="Open Google Maps navigation to GS FAKIBOGORA"
            >
              <Compass className="w-4 h-4 text-amber-300 group-hover:rotate-45 transition duration-300" />
              <span>{t.get_directions || 'Get Directions'}</span>
            </a>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                'Groupe Scolaire Frank Adamson de Kibogora, Kibogora, Kanjongo, Nyamasheke, Western Province, Rwanda'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition"
              title="Open location in full Google Maps website or app"
            >
              <span>{t.open_in_google_maps || 'Open in Google Maps'}</span>
              <span className="text-slate-400">↗</span>
            </a>
          </div>
        </div>

        {/* Location Highlights Badge Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#1d4ed8] shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Administrative Location
              </span>
              <span className="font-bold text-slate-900 block mt-0.5">
                Kibogora, Kanjongo Sector
              </span>
              <span className="text-slate-500 text-[11px]">
                Nyamasheke District, Western Province, Rwanda
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Key Campus Landmarks
              </span>
              <span className="font-bold text-slate-900 block mt-0.5">
                {schoolInfo.location?.landmark || 'Near Kibogora Hospital & Lake Kivu'}
              </span>
              <span className="text-slate-500 text-[11px]">
                Along scenic hills overlooking Lake Kivu
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 sm:col-span-2 lg:col-span-1">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Visitor Reception Hours
              </span>
              <span className="font-bold text-slate-900 block mt-0.5">
                {schoolInfo.contact?.officeHours || 'Monday – Friday: 07:30 – 17:00'}
              </span>
              <span className="text-slate-500 text-[11px]">
                Admissions, campus tours & consultations
              </span>
            </div>
          </div>
        </div>

        {/* Responsive Interactive Google Map Frame */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
          <iframe
            title="Groupe Scolaire Frank Adamson de Kibogora (GSFAK) Campus Map"
            src={
              schoolInfo.location?.mapEmbedUrl ||
              `https://maps.google.com/maps?q=${encodeURIComponent(
                'Groupe Scolaire Frank Adamson de Kibogora, Kibogora, Kanjongo, Nyamasheke, Western Province, Rwanda'
              )}&t=&z=15&ie=UTF8&iwloc=&output=embed`
            }
            className="w-full h-72 sm:h-96 md:h-[440px] lg:h-[480px] border-0 block"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Directions & Travel Guide Info Footer */}
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span>
              <strong>Travel Notice:</strong> Visitors arriving via public transport or private vehicle can take the main Kivu Belt highway (RN10) towards Kibogora / Kanjongo.
            </span>
          </div>

          <a
            href={
              schoolInfo.location?.directionsUrl ||
              `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                'Groupe Scolaire Frank Adamson de Kibogora, Kibogora, Kanjongo, Nyamasheke, Western Province, Rwanda'
              )}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#1d4ed8] hover:text-[#1e40af] font-bold hover:underline shrink-0"
          >
            <span>{t.get_directions || 'Get Directions'}</span>
            <span>→</span>
          </a>
        </div>
      </section>
    </div>
  );
};

