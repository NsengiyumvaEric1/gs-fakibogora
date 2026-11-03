import React, { useState } from 'react';
import { NewsAnnouncement, Language } from '../types/index.ts';
import {
  Newspaper,
  Calendar,
  User,
  ChevronRight,
  Sparkles,
  Search,
  BookOpen
} from 'lucide-react';

interface NewsViewProps {
  newsItems: NewsAnnouncement[];
  lang: Language;
  onSelectArticle: (article: NewsAnnouncement) => void;
}

export const NewsView: React.FC<NewsViewProps> = ({
  newsItems,
  lang,
  onSelectArticle,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const articles = newsItems.filter(
    (item) => item.type === 'news' || item.type === 'event' || !item.isImportant
  );

  const filtered = articles.filter((item) => {
    const title = (item.title[lang] || item.title.en || '').toLowerCase();
    const summary = (item.summary[lang] || item.summary.en || '').toLowerCase();
    return title.includes(searchQuery.toLowerCase()) || summary.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12 text-slate-700">
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-wider text-[#1d4ed8]">
          Campus Life · Scientific Innovations · Events
        </span>
        <div>
          <h2
            className="text-4xl sm:text-5xl font-black text-[#0c2340] tracking-tight leading-none"
          >
            GSFAK Campus News
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
            Groupe Scolaire Frank Adamson de Kibogora · Stories of Academic Achievement & Student Life
          </p>
        </div>
        <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
          Discover latest happenings, national science competition awards, laboratory projects, and sports tournaments from our campus in Kibogora.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search campus news & articles..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#1d4ed8] transition shadow-2xs"
        />
      </div>

      {/* News Grid */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
          No news articles found matching your query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item) => (
            <article
              key={item.id}
              onClick={() => onSelectArticle(item)}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {item.imageUrl && (
                  <div className="h-52 overflow-hidden bg-slate-100 relative">
                    <img
                      src={item.imageUrl}
                      alt={item.title[lang] || item.title.en}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/gsfak_campus_life.jpg';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                )}

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>By {item.authorName}</span>
                  </div>

                  <h3
                    className="font-bold text-lg text-[#0c2340] group-hover:text-[#1d4ed8] transition leading-snug line-clamp-2"
                  >
                    {item.title[lang] || item.title.en}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {item.summary[lang] || item.summary.en}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-[#1d4ed8] font-bold">
                <span>Read Full Story</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
