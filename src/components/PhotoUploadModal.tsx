import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Sparkles, Check, AlertCircle } from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSlide: (slide: {
    title: string;
    subtitle: string;
    image: string;
    badge: string;
    label: string;
  }) => void;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  onAddSlide,
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string>('');
  const [badge, setBadge] = useState<string>('Campus Highlights');
  const [label, setLabel] = useState<string>('New Photo');
  const [urlInput, setUrlInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('The photo size exceeds 10MB. Please select an optimized image.');
      return;
    }

    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageSrc(result);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
      if (!label) {
        setLabel('Uploaded Photo');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setImageSrc(urlInput.trim());
    setUrlInput('');
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageSrc) {
      setErrorMessage('Please upload a photo or enter an image URL.');
      return;
    }

    onAddSlide({
      title: title.trim() || 'GSFAK Campus Life & Educational Excellence',
      subtitle: subtitle.trim() || 'Inspiring scholars through discipline, Christian ethics, and academic distinction in Kibogora.',
      image: imageSrc,
      badge: badge.trim() || 'Campus Highlights',
      label: label.trim() || 'School Photo',
    });

    // Reset form
    setImageSrc('');
    setTitle('');
    setSubtitle('');
    setUrlInput('');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="bg-[#0c2340] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center">
              <Upload className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">
                Add Photo to Animated Showcase
              </h3>
              <p className="text-[11px] text-slate-300">
                Upload new school pictures to animate fluently in the hero banner
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Photo Preview / Upload Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Photo Upload
            </label>
            {imageSrc ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-300 aspect-video bg-slate-900 group">
                <img
                  src={imageSrc}
                  alt="Slide preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageSrc('')}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition cursor-pointer shadow-md"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xl bg-slate-900/80 backdrop-blur-xs text-white text-xs">
                  <span className="font-semibold text-amber-300 text-[11px]">{badge || 'Preview'}</span>
                  <p className="font-bold truncate">{title || 'Photo Title'}</p>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#1d4ed8] rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50 hover:bg-blue-50/30 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 group-hover:border-[#1d4ed8] shadow-2xs flex items-center justify-center mx-auto mb-3 transition">
                  <ImageIcon className="w-6 h-6 text-[#1d4ed8]" />
                </div>
                <p className="text-xs font-bold text-slate-700">Click to choose a photo from your computer</p>
                <p className="text-[11px] text-slate-500 mt-1">Supports JPG, PNG, WEBP (Up to 10MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Or Paste URL */}
          {!imageSrc && (
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Or paste an image web link (https://...)"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#1d4ed8]"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Load
              </button>
            </div>
          )}

          {/* Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Badge / Category
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Sports & Athletics"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#1d4ed8]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Thumbnail Label
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Handball Team"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#1d4ed8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Headline Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 2024/2025 Handball 2nd Division Champions"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#1d4ed8]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Subtitle / Description
            </label>
            <textarea
              rows={2}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Congratulations to our victorious champions for raising the flag of GSFAK Kibogora..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-[#1d4ed8] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!imageSrc}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                imageSrc
                  ? 'bg-[#1d4ed8] hover:bg-[#1e40af]'
                  : 'bg-slate-300 cursor-not-allowed text-slate-500'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Add to Slideshow</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
