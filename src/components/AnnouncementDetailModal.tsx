import React from 'react';
import { NewsAnnouncement, Language } from '../types/index.ts';
import { X, Calendar, User, Tag, Award } from 'lucide-react';

interface AnnouncementDetailModalProps {
  announcement: NewsAnnouncement | null;
  lang: Language;
  onClose: () => void;
}

export const AnnouncementDetailModal: React.FC<AnnouncementDetailModalProps> = ({
  announcement,
  lang,
  onClose,
}) => {
  if (!announcement) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white flex items-center justify-center transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {announcement.imageUrl && (
          <div className="h-64 sm:h-80 w-full overflow-hidden bg-slate-100">
            <img
              src={announcement.imageUrl}
              alt={announcement.title[lang] || announcement.title.en}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 sm:p-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="font-bold text-blue-900 capitalize">
              {announcement.type}
            </span>
            <span>·</span>
            <span>{new Date(announcement.publishedAt).toLocaleDateString()}</span>
            <span>·</span>
            <span>By {announcement.authorName}</span>
            {announcement.isImportant && (
              <span className="text-amber-800 font-bold ml-auto flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>Important Official Notice</span>
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-950 leading-tight">
            {announcement.title[lang] || announcement.title.en}
          </h1>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
            {announcement.summary[lang] || announcement.summary.en}
          </div>

          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {announcement.content[lang] || announcement.content.en}
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Groupe Scolaire Frank Adamson de Kibogora (GSFAK)</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
