import React, { useState } from 'react';
import { SchoolInfo, Language } from '../types/index.ts';
import {
  CreditCard,
  Building2,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Download,
  HelpCircle,
  FileSpreadsheet,
  ShieldCheck,
  Calendar,
  DollarSign
} from 'lucide-react';

interface SchoolFeesViewProps {
  schoolInfo: SchoolInfo;
  lang: Language;
  onNavigate: (page: any) => void;
}

export const SchoolFeesView: React.FC<SchoolFeesViewProps> = ({ schoolInfo, lang, onNavigate }) => {
  const [activeCategory, setActiveCategory] = useState<'boarding' | 'day'>('boarding');

  const feeStructures = {
    boarding: {
      title: 'Boarding Students (Interne)',
      term1: '85,000 RWF',
      term2: '80,000 RWF',
      term3: '80,000 RWF',
      annual: '245,000 RWF',
      breakdown: [
        { item: 'Tuition & Academic Instruction', amount: '35,000 RWF', note: 'Covers teacher instruction, laboratory chemicals, and library access' },
        { item: 'Full Boarding & Nutritious Meals', amount: '38,000 RWF', note: 'Breakfast, lunch, and dinner, dormitory accommodation and utilities' },
        { item: 'Campus Infrastructure & Maintenance', amount: '5,000 RWF', note: 'Dormitory, laboratory, and classroom upkeep' },
        { item: 'Sports, Culture & Healthcare Infirmary', amount: '4,000 RWF', note: 'School nurse, first aid, and inter-school championships' },
        { item: 'Internal Assessments & Examinations', amount: '3,000 RWF', note: 'Printing of examination papers, answer booklets, and report cards' }
      ],
      firstTermOnly: [
        { item: 'Official School Uniform (2 Sets + Sweater)', amount: '22,000 RWF', note: 'Paid once upon new admission or replacement' },
        { item: 'Student Identity Card & Digital Badge', amount: '2,500 RWF', note: 'Biometric student card' },
        { item: 'Medical Clearance & Insurance Check', amount: '1,500 RWF', note: 'Institutional health file verification' }
      ]
    },
    day: {
      title: 'Day Scholars (Externe)',
      term1: '32,000 RWF',
      term2: '30,000 RWF',
      term3: '30,000 RWF',
      annual: '92,000 RWF',
      breakdown: [
        { item: 'Tuition & Academic Instruction', amount: '22,000 RWF', note: 'Covers classroom teaching, laboratory materials, and library' },
        { item: 'Campus Utilities & Maintenance', amount: '3,500 RWF', note: 'Electricity, clean water, and sanitation' },
        { item: 'School Feeding Program (Hot Lunch)', amount: '4,000 RWF', note: 'Balanced lunch on school weekdays' },
        { item: 'Sports & Student Activities', amount: '1,500 RWF', note: 'Athletics, clubs, and cultural events' },
        { item: 'Internal Assessments & Exams', amount: '1,000 RWF', note: 'Term exams and progress reports' }
      ],
      firstTermOnly: [
        { item: 'Official School Uniform (1 Set + Sweater)', amount: '16,000 RWF', note: 'Paid once upon admission' },
        { item: 'Student Identity Card', amount: '2,500 RWF', note: 'Valid for full academic cycle' }
      ]
    }
  };

  const currentFees = feeStructures[activeCategory];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12 text-slate-700">
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-wider text-[#1d4ed8]">
          Transparency & Financial Governance · Academic Year 2026/2027
        </span>
        <div>
          <h2
            className="text-4xl sm:text-5xl font-black text-[#0c2340] tracking-tight leading-none"
          >
            GSFAK School Fees Structure
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
            Groupe Scolaire Frank Adamson de Kibogora · Regulated in Compliance with Rwanda Ministry of Education Guidelines
          </p>
        </div>
        <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
          Clear, predictable fee schedules for Boarding and Day students. All payments must be deposited directly into verified institutional accounts with student registration numbers.
        </p>
      </div>

      {/* Category Toggle */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveCategory('boarding')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeCategory === 'boarding'
              ? 'bg-[#1d4ed8] text-white shadow-xs'
              : 'text-[#0c2340] hover:text-[#1d4ed8] hover:bg-white/80'
          }`}
        >
          <span>Boarding Students (Interne)</span>
        </button>
        <button
          onClick={() => setActiveCategory('day')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
            activeCategory === 'day'
              ? 'bg-[#1d4ed8] text-white shadow-xs'
              : 'text-[#0c2340] hover:text-[#1d4ed8] hover:bg-white/80'
          }`}
        >
          <span>Day Scholars (Externe)</span>
        </button>
      </div>

      {/* Term Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1d4ed8] block mb-1">
            Term 1 (September - December)
          </span>
          <span className="text-2xl sm:text-3xl font-black text-[#0c2340] block">
            {currentFees.term1}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Payable before start of Term 1</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1d4ed8] block mb-1">
            Term 2 (January - March)
          </span>
          <span className="text-2xl sm:text-3xl font-black text-[#0c2340] block">
            {currentFees.term2}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Payable before start of Term 2</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1d4ed8] block mb-1">
            Term 3 (April - July)
          </span>
          <span className="text-2xl sm:text-3xl font-black text-[#0c2340] block">
            {currentFees.term3}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">Payable before start of Term 3</span>
        </div>

        <div className="bg-[#0c2340] text-white rounded-3xl p-6 shadow-md border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
            Full Academic Year Total
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white block">
            {currentFees.annual}
          </span>
          <span className="text-xs text-slate-300 mt-1 block">Yearly complete sum</span>
        </div>
      </div>

      {/* Detailed Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-[#0c2340]">
              Detailed Component Breakdown — {currentFees.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified allocation approved by the General Parents & Teachers Association (PTA)
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold w-fit">
            MINEDUC Aligned
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Fee Item & Purpose</th>
                <th className="py-3 px-6">Amount per Term</th>
                <th className="py-3 px-6">Description / Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {currentFees.breakdown.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-6 font-semibold text-slate-900">{row.item}</td>
                  <td className="py-3.5 px-6 font-black text-[#1d4ed8]">{row.amount}</td>
                  <td className="py-3.5 px-6 text-slate-500">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Student / Admission One-time Items */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-[#0c2340] flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-[#1d4ed8]" />
          <span>New Admissions / Entry Level Requirements (One-time or Annual)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentFees.firstTermOnly.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-900 block">{item.item}</span>
              <span className="text-sm font-black text-[#1d4ed8] block">{item.amount}</span>
              <p className="text-[11px] text-slate-500 leading-relaxed">{item.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Official Payment Channels & Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bank of Kigali */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1d4ed8] border border-blue-200 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1d4ed8]">Primary Banking Channel</span>
              <h4 className="font-bold text-base text-[#0c2340]">Bank of Kigali (BK)</h4>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Account Name:</span>
              <strong className="text-slate-900">GS FAKIBOGORA / ES KIBOGORA</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Account Number:</span>
              <strong className="text-[#1d4ed8] font-mono text-sm">00045-0698241-33</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Branch:</span>
              <strong className="text-slate-900">Nyamasheke / Tyazo Branch</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Currency:</span>
              <strong className="text-slate-900">Rwandan Francs (RWF)</strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            * Please specify the <strong>Student Full Name</strong> and <strong>Class (e.g. S4 MCB)</strong> on the bank deposit slip (Bordereau).
          </p>
        </div>

        {/* MTN Mobile Money / Airtel Money */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Mobile Money Gateway</span>
              <h4 className="font-bold text-base text-[#0c2340]">MTN MoMo & Airtel Money Pay</h4>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">MoMo Merchant Code:</span>
              <strong className="text-amber-800 font-mono text-sm">*182*8*1*045698#</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Merchant Name:</span>
              <strong className="text-slate-900">GSFAK KIBOGORA SCHOOL</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Bursar Contact:</span>
              <strong className="text-slate-900">+250 788 450 120</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Receipt SMS:</span>
              <strong className="text-slate-900">Present confirmation SMS at finance office</strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            * After paying through Mobile Money, keep the transaction ID SMS to receive your official stamped clearance card.
          </p>
        </div>
      </div>

      {/* Important Notice Strip */}
      <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-amber-950">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm mb-0.5">Payment Assistance & Installment Inquiries</span>
            <p className="text-amber-900 leading-relaxed">
              Parents needing installment schedules or assistance for vulnerable students under social protection categories (Ubudehe) should reach out directly to the School Administration.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('contact')}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition shrink-0 cursor-pointer shadow-xs"
        >
          Contact Finance Office
        </button>
      </div>
    </div>
  );
};
