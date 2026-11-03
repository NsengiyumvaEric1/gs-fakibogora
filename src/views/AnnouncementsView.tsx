import React, { useState } from 'react';
import { NewsAnnouncement, Language } from '../types/index.ts';
import {
  Bell,
  Calendar,
  User,
  ChevronRight,
  Award,
  AlertCircle,
  Search,
  Tag
} from 'lucide-react';

interface AnnouncementsViewProps {
  announcements: NewsAnnouncement[];
  lang: Language;
  onSelectAnnouncement: (ann: NewsAnnouncement) => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  lang,
  onSelectAnnouncement,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Unified News & Announcements list
  const filtered = announcements.filter((item) => {
    const title = (item.title[lang] || item.title.en || '').toLowerCase();
    const summary = (item.summary[lang] || item.summary.en || '').toLowerCase();
    const matchesSearch = title.includes(searchQuery.toLowerCase()) || summary.includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'all') return true;
    if (filterType === 'important') return item.isImportant;
    if (filterType === 'news') return item.type === 'news' || item.type === 'event';
    if (filterType === 'announcement') return item.type === 'announcement' || item.type === 'academic';
    return item.type === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12 text-slate-700">
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-wider text-[#1d4ed8]">
          Directorate of Studies & Communications
        </span>
        <div>
          <h2
            className="text-4xl sm:text-5xl font-black text-[#0c2340] tracking-tight leading-none"
          >
            GSFAK News & Announcements
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
            Groupe Scolaire Frank Adamson de Kibogora · Official Circulars, Academic Timetables & Campus News
          </p>
        </div>
        <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
          Stay informed with official circulars, examination schedules, academic calendar releases, science awards, and campus life stories.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl w-full sm:w-fit">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#1d4ed8] text-white shadow-xs'
                : 'text-[#0c2340] hover:text-[#1d4ed8] hover:bg-white/80'
            }`}
          >
            All Updates
          </button>
          <button
            onClick={() => setFilterType('announcement')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterType === 'announcement'
                ? 'bg-[#1d4ed8] text-white shadow-xs'
                : 'text-[#0c2340] hover:text-[#1d4ed8] hover:bg-white/80'
            }`}
          >
            Official Circulars
          </button>
          <button
            onClick={() => setFilterType('news')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterType === 'news'
                ? 'bg-[#1d4ed8] text-white shadow-xs'
                : 'text-[#0c2340] hover:text-[#1d4ed8] hover:bg-white/80'
            }`}
          >
            Campus News & Events
          </button>
          <button
            onClick={() => setFilterType('important')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              filterType === 'important'
                ? 'bg-[#1d4ed8] text-white shadow-xs'
                : 'text-[#0c2340] hover:text-[#1d4ed8] hover:bg-white/80'
            }`}
          >
            Important & Urgent
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#1d4ed8] transition"
          />
        </div>
      </div>

      {/* Announcements Numbered List */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
          No announcements found matching your criteria.
        </div>
      ) : (
        <ol className="space-y-6 list-none p-0 m-0">
          {filtered.map((item, idx) => {
            const contentText = (item.content[lang] || item.content.en || '').trim();
            const summaryText = (item.summary[lang] || item.summary.en || '').trim();
            // Larger if it has extended content beyond the summary
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

                  {/* Main Announcement Details */}
                  <div className="flex-1 space-y-3.5 min-w-0">
                    
                    {/* Date and Meta */}
                    <div className="flex flex-wrap items-center gap-2.5 text-xs">
                      {/* Date (Explicitly displayed) */}
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

                    {/* Announcement Title */}
                    <h3
                      className="font-extrabold text-lg sm:text-2xl text-[#0c2340] leading-snug tracking-tight"
                    >
                      {item.title[lang] || item.title.en}
                    </h3>

                    {/* ALL OVERVIEW (Fully visible right here instead of pressing on it) */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                      <p className="whitespace-pre-line">{item.summary[lang] || item.summary.en}</p>
                    </div>

                    {/* If it is larger, show "View the Announcement" button */}
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
      )}
    </div>
  );
};
