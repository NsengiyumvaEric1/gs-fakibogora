import React, { useState } from 'react';
import { SchoolInfo, Language } from '../types/index.ts';
import { translations } from '../i18n/translations.ts';
import {
  GraduationCap,
  BookOpen,
  FlaskConical,
  Binary,
  Microscope,
  CheckCircle2,
  Award,
  Clock,
  FileCheck,
  Send,
  Phone,
  Mail,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface CoursesViewProps {
  schoolInfo: SchoolInfo;
  lang: Language;
  onNavigate: (page: any) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({ schoolInfo, lang, onNavigate }) => {
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'o_level' | 'a_level'>('all');

  // Single dedicated space for school admissions messages
  const [admissionsName, setAdmissionsName] = useState('');
  const [admissionsEmail, setAdmissionsEmail] = useState('');
  const [admissionsPhone, setAdmissionsPhone] = useState('');
  const [admissionsStream, setAdmissionsStream] = useState('Ordinary Level (Tronc Commun)');
  const [admissionsMessage, setAdmissionsMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [admissionsSuccess, setAdmissionsSuccess] = useState('');
  const [admissionsError, setAdmissionsError] = useState('');

  const handleAdmissionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdmissionsSuccess('');
    setAdmissionsError('');

    if (!admissionsName.trim() || !admissionsEmail.trim() || !admissionsMessage.trim()) {
      setAdmissionsError('Please provide your name, email, and message.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: admissionsName.trim(),
          senderEmail: admissionsEmail.trim(),
          senderPhone: admissionsPhone.trim(),
          subject: `[Admissions Inquiry] Stream: ${admissionsStream}`,
          message: admissionsMessage.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit admission inquiry.');
      }

      setAdmissionsSuccess('Your message has been successfully transmitted to the GSFAK Admissions Office. The administration will contact you shortly.');
      setAdmissionsName('');
      setAdmissionsEmail('');
      setAdmissionsPhone('');
      setAdmissionsMessage('');
    } catch (err: any) {
      setAdmissionsError(err.message || 'Error transmitting your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const detailedCourses = [
    {
      code: 'MCB',
      name: 'Mathematics - Chemistry - Biology',
      level: 'A-Level (Senior 4 - Senior 6)',
      levelCategory: 'a_level',
      category: 'STEM / Biological Sciences',
      description:
        'A premier pre-medical and life-sciences stream preparing students for Medicine, Pharmacy, Nursing, Biotechnology, and Agricultural Sciences. Backed by fully equipped biology and chemistry laboratories.',
      subjects: [
        'Advanced Mathematics',
        'Inorganic & Organic Chemistry',
        'Cellular & Human Biology',
        'Subsidiary Mathematics / ICT',
        'General Studies & Communication Skills'
      ],
      careers: ['Medicine & Surgery', 'Pharmacy', 'Biomedical Engineering', 'Public Health', 'Veterinary Medicine'],
      prerequisites: 'Excellent passes in Ordinary Level National Examinations (O-Level) in Mathematics, Chemistry, and Biology.'
    },
    {
      code: 'MPC',
      name: 'Mathematics - Physics - Chemistry',
      level: 'A-Level (Senior 4 - Senior 6)',
      levelCategory: 'a_level',
      category: 'STEM / Physical Sciences & Engineering',
      description:
        'Intensive analytical preparation for Civil, Electrical, Mechanical, and Software Engineering, Architecture, and Industrial Chemistry. Focuses heavily on mathematical modeling and physical laboratory experimentation.',
      subjects: [
        'Advanced Mathematics (Calculus, Linear Algebra, Mechanics)',
        'Physics (Mechanics, Electricity, Modern Physics, Optics)',
        'Physical & Analytical Chemistry',
        'Subsidiary ICT & Programming',
        'General Paper'
      ],
      careers: ['Civil & Structural Engineering', 'Computer Science & AI', 'Electrical Engineering', 'Architecture', 'Data Science'],
      prerequisites: 'Strong grades in O-Level Mathematics and Physics, certified by NESA/REB.'
    },
    {
      code: 'PCB',
      name: 'Physics - Chemistry - Biology',
      level: 'A-Level (Senior 4 - Senior 6)',
      levelCategory: 'a_level',
      category: 'STEM / Natural Sciences',
      description:
        'A comprehensive triple-science combination providing holistic grounding in the fundamental physical and life sciences with extensive practical laboratory sessions.',
      subjects: [
        'Experimental Physics',
        'General & Environmental Chemistry',
        'Ecology & Molecular Biology',
        'Subsidiary Mathematics',
        'General Studies'
      ],
      careers: ['Environmental Science', 'Medical Laboratory Technology', 'Geology & Mining', 'Agronomy', 'Biochemistry'],
      prerequisites: 'Pass in O-Level Physics, Chemistry, and Biology.'
    },
    {
      code: 'BCG',
      name: 'Biology - Chemistry - Geography',
      level: 'A-Level (Senior 4 - Senior 6)',
      levelCategory: 'a_level',
      category: 'Environmental Sciences',
      description:
        'Combines natural sciences with geographical GIS mapping, meteorology, geology, and environmental protection, highly relevant to Rwanda’s green economy and sustainable development.',
      subjects: [
        'Biological Systems',
        'Applied Chemistry',
        'Physical & Human Geography',
        'Cartography & Environmental Management',
        'General Paper'
      ],
      careers: ['Environmental Management', 'Urban & Regional Planning', 'Geological Sciences', 'Ecology & Forestry', 'GIS Analysis'],
      prerequisites: 'Pass in O-Level Geography and Science subjects.'
    },
    {
      code: 'O-Level',
      name: 'Ordinary Level Secondary Education (Tronc Commun)',
      level: 'O-Level (Senior 1 - Senior 3)',
      levelCategory: 'o_level',
      category: 'General Foundation',
      description:
        'Comprehensive, competency-based national curriculum instilling scientific mindset, strong linguistic capabilities in English and French, mathematical logic, and civic education under NESA.',
      subjects: [
        'Mathematics & Integrated Science',
        'Physics, Chemistry & Biology',
        'English Language & Literature',
        'Kinyarwanda & French',
        'History & Citizenship',
        'Geography & Entrepreneurship',
        'Information and Communication Technology (ICT)',
        'Physical Education'
      ],
      careers: ['Progression to Advanced Level combinations or Technical/Vocational TVET institutions'],
      prerequisites: 'Primary Leaving Examination (PLE) certificate with national qualification eligibility.'
    }
  ];

  const filtered = selectedLevel === 'all'
    ? detailedCourses
    : detailedCourses.filter(c => c.levelCategory === selectedLevel);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12 text-slate-700">
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-wider text-[#1d4ed8]">
          Academic Excellence · Rwanda National Curriculum (REB/NESA)
        </span>
        <div>
          <h2
            className="text-4xl sm:text-5xl font-black text-[#0c2340] tracking-tight leading-none"
          >
            GSFAK Courses & Combinations
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
            Groupe Scolaire Frank Adamson de Kibogora · Accredited Secondary Education Since 1969
          </p>
        </div>
        <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
          Explore our accredited Ordinary Level and Advanced Level STEM & Sciences combinations, equipped with dedicated laboratories and experienced instructors.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setSelectedLevel('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            selectedLevel === 'all'
              ? 'bg-[#1d4ed8] text-white shadow-xs'
              : 'text-[#0c2340] hover:text-[#1d4ed8] hover:bg-white/80'
          }`}
        >
          All Offerings
        </button>
        <button
          onClick={() => setSelectedLevel('a_level')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            selectedLevel === 'a_level'
              ? 'bg-[#1d4ed8] text-white shadow-xs'
              : 'text-[#0c2340] hover:text-[#1d4ed8] hover:bg-white/80'
          }`}
        >
          Advanced Level Combinations (S4 - S6)
        </button>
        <button
          onClick={() => setSelectedLevel('o_level')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            selectedLevel === 'o_level'
              ? 'bg-[#1d4ed8] text-white shadow-xs'
              : 'text-[#0c2340] hover:text-[#1d4ed8] hover:bg-white/80'
          }`}
        >
          Ordinary Level (Tronc Commun S1 - S3)
        </button>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filtered.map((course) => (
          <div
            key={course.code}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-[#1d4ed8] font-black text-base flex items-center justify-center shrink-0">
                    {course.code}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1d4ed8] block">
                      {course.category}
                    </span>
                    <h3
                      className="font-black text-xl text-[#0c2340] leading-snug"
                    >
                      {course.name}
                    </h3>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold shrink-0 border border-amber-200/60">
                  {course.level}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                {course.description}
              </p>

              {/* Core Subjects */}
              <div className="mb-6 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#1d4ed8]" />
                  <span>Key Subjects & Curriculum Modules</span>
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  {course.subjects.map((subj, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{subj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Career Pathways */}
              <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="font-bold text-[#0c2340] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>University & Career Pathways:</span>
                </span>
                <p className="text-slate-600">
                  {course.careers.join(' · ')}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                <strong className="text-slate-700">Admission Requirement:</strong> {course.prerequisites}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* DEDICATED SPACE: SEND A MESSAGE TO SCHOOL ADMISSIONS         */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50/40 rounded-3xl p-6 sm:p-10 border-2 border-slate-200/90 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Official Admissions Contacts & Guidelines */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#1d4ed8] text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Admissions Office</span>
            </div>

            <div>
              <h3
                className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight leading-tight"
              >
                School Admissions & Enrollment Inquiries
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
                Groupe Scolaire Frank Adamson de Kibogora · Directorate of Studies
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Have questions regarding enrollment requirements, transfer credentials, student boarding, or term dates for Ordinary Level or Advanced Level STEM streams? Leave your message here directly for the GSFAK Admissions team.
            </p>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-3 text-xs text-slate-600 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#1d4ed8] shrink-0" />
                <span>
                  <strong className="text-slate-800">Direct Telephone:</strong> {schoolInfo.contact.phonePrimary}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#1d4ed8] shrink-0" />
                <span>
                  <strong className="text-slate-800">Admissions Email:</strong> {schoolInfo.contact.emailOfficial}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong className="text-slate-800">Office Working Hours:</strong> {schoolInfo.contact.officeHours}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Direct Message Form for Admissions */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <h4
              className="text-lg font-bold text-[#0c2340] mb-1"
            >
              Send a Message to School Admissions
            </h4>
            <p className="text-xs text-slate-500 mb-6">
              Messages submitted here are reviewed directly by the GSFAK Admissions and Academic Office.
            </p>

            {admissionsSuccess && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{admissionsSuccess}</span>
              </div>
            )}

            {admissionsError && (
              <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{admissionsError}</span>
              </div>
            )}

            <form onSubmit={handleAdmissionsSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Student or Parent Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={admissionsName}
                    onChange={(e) => setAdmissionsName(e.target.value)}
                    placeholder="e.g. Jean Pierre Habimana"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Phone or WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={admissionsPhone}
                    onChange={(e) => setAdmissionsPhone(e.target.value)}
                    placeholder="+250 78... or 078..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={admissionsEmail}
                    onChange={(e) => setAdmissionsEmail(e.target.value)}
                    placeholder="parent@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Academic Combination of Interest
                  </label>
                  <select
                    value={admissionsStream}
                    onChange={(e) => setAdmissionsStream(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] bg-white"
                  >
                    <option value="Ordinary Level (Tronc Commun)">Ordinary Level (Tronc Commun)</option>
                    <option value="MCB (Maths - Chemistry - Biology)">MCB (Maths - Chemistry - Biology)</option>
                    <option value="MPC (Maths - Physics - Chemistry)">MPC (Maths - Physics - Chemistry)</option>
                    <option value="PCB (Physics - Chemistry - Biology)">PCB (Physics - Chemistry - Biology)</option>
                    <option value="MEG (Maths - Economics - Geography)">MEG (Maths - Economics - Geography)</option>
                    <option value="General Admission Inquiry">General Admission Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Your Message to School Admissions *
                </label>
                <textarea
                  rows={3}
                  required
                  value={admissionsMessage}
                  onChange={(e) => setAdmissionsMessage(e.target.value)}
                  placeholder="Ask about required pass marks, boarding items, fee payment installments, or reporting dates..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Transmitting Message...' : 'Send Message to School Admissions'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      </section>

      {/* Facilities Highlight */}
      <div className="p-8 sm:p-10 rounded-3xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1d4ed8] border border-blue-200 flex items-center justify-center shrink-0">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#0c2340]">Modern Science Laboratories</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Standardized physics, chemistry, and biology labs with individual workstations and optical microscopes.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1d4ed8] border border-blue-200 flex items-center justify-center shrink-0">
            <Binary className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#0c2340]">ICT & Computer Lab</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Equipped with high-speed internet, coding tools, and e-learning resources for computer science and research.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1d4ed8] border border-blue-200 flex items-center justify-center shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#0c2340]">NESA Certified Assessment</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Continuous assessment, mock examinations, and rigorous preparation guaranteeing top national pass rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
