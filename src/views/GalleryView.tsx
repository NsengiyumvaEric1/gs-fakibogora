import React, { useState } from 'react';
import { GalleryItem, Language } from '../types/index.ts';
import { translations } from '../i18n/translations.ts';
import { X, ZoomIn, Calendar, Tag } from 'lucide-react';

interface GalleryViewProps {
  gallery: GalleryItem[];
  lang: Language;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ gallery, lang }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const t = translations[lang];

  const categories = [
    { key: 'all', label: t.cat_all },
    { key: 'campus', label: t.cat_campus },
    { key: 'labs', label: t.cat_labs },
    { key: 'academics', label: t.cat_academics },
    { key: 'sports', label: t.cat_sports },
    { key: 'events', label: t.cat_events },
  ];

  const filteredItems =
    selectedCategory === 'all'
      ? gallery
      : gallery.filter((item) => item.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-slate-700">
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <span className="text-xs uppercase font-extrabold tracking-wider text-[#1d4ed8]">
          Campus Archives
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
          {t.gallery_title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
          {t.gallery_sub}
        </p>
      </div>

      {/* Category Filter Buttons (Functional segmented buttons permitted by anti-slop rules) */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              selectedCategory === cat.key
                ? 'bg-[#1d4ed8] text-white shadow-xs'
                : 'text-[#0c2340] hover:text-[#1d4ed8] hover:bg-white/80'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-500">
          No images uploaded in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setLightboxItem(item)}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col"
            >
              <div className="h-64 overflow-hidden bg-slate-100 relative">
                <img
                  src={item.imageUrl}
                  alt={item.title[lang] || item.title.en}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-full">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <span className="capitalize font-bold text-[#1d4ed8]">
                      {item.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-slate-950 text-base mb-1.5">
                    {item.title[lang] || item.title.en}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {item.caption[lang] || item.caption.en}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center transition cursor-pointer"
              aria-label="Close image modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[65vh] bg-slate-950 flex items-center justify-center overflow-hidden">
              <img
                src={lightboxItem.imageUrl}
                alt={lightboxItem.title[lang] || lightboxItem.title.en}
                referrerPolicy="no-referrer"
                className="max-h-[65vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs text-blue-900 font-bold uppercase tracking-wider mb-2">
                <span>{lightboxItem.category}</span>
                <span>·</span>
                <span className="font-normal text-slate-500 normal-case">
                  {new Date(lightboxItem.uploadedAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950 mb-2">
                {lightboxItem.title[lang] || lightboxItem.title.en}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {lightboxItem.caption[lang] || lightboxItem.caption.en}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
