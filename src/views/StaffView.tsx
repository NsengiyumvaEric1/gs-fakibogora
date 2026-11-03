import React, { useState } from 'react';
import { StaffMember, SchoolInfo, Language } from '../types/index.ts';
import {
  Users,
  Award,
  Mail,
  GraduationCap,
  ShieldCheck,
  Building,
  Briefcase
} from 'lucide-react';

interface StaffViewProps {
  schoolInfo: SchoolInfo;
  staff: StaffMember[];
  lang: Language;
  onNavigate: (page: any) => void;
}

export const StaffView: React.FC<StaffViewProps> = ({
  schoolInfo,
  staff,
  lang,
  onNavigate,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');

  const departments = [
    { key: 'all', label: 'All Faculty & Staff' },
    { key: 'leader', label: 'School Leadership' },
    { key: 'teacher', label: 'Teaching Faculty' },
    { key: 'Administration', label: 'Administration' },
    { key: 'Mathematics & STEM', label: 'Sciences & STEM' },
  ];

  const filteredStaff = selectedDept === 'all'
    ? staff
    : selectedDept === 'leader'
      ? staff.filter(s => s.category !== 'teacher')
      : selectedDept === 'teacher'
        ? staff.filter(s => s.category === 'teacher')
        : staff.filter(s => s.department === selectedDept || (selectedDept === 'Mathematics & STEM' && s.department?.includes('Science')));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12 text-slate-700">
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-wider text-[#1d4ed8]">
          School Governance & Academic Leadership
        </span>
        <div>
          <h2
            className="text-4xl sm:text-5xl font-black text-[#0c2340] tracking-tight leading-none"
          >
            GSFAK Faculty & Staff
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
            Groupe Scolaire Frank Adamson de Kibogora · Dedicated Educators Committed to Educational Excellence
          </p>
        </div>
        <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
          Meet our dedicated leadership team, department coordinators, laboratory instructors, and qualified teachers preparing Rwanda's future leaders.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
        {departments.map((dept) => (
          <button
            key={dept.key}
            onClick={() => setSelectedDept(dept.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              selectedDept === dept.key
                ? 'bg-[#1d4ed8] text-white shadow-xs'
                : 'text-[#0c2340] hover:text-[#1d4ed8] hover:bg-white/80'
            }`}
          >
            {dept.label}
          </button>
        ))}
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredStaff.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
          >
            <div>
              <div className="h-56 bg-slate-100 overflow-hidden relative">
                <img
                  src={member.photoUrl}
                  alt={member.fullName}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold tracking-wider uppercase">
                  {member.department}
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-black text-lg text-[#0c2340] leading-snug">
                  {member.fullName}
                </h3>
                {member.category !== 'teacher' && (
                  <p className="text-xs text-[#1d4ed8] font-bold mt-1">
                    {member.title[lang] || member.title.en}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
