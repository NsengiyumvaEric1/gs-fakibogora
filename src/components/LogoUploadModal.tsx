import React, { useState, useRef } from 'react';
import { SchoolInfo } from '../types/index.ts';
import { Upload, X, Check, Image as ImageIcon, RotateCcw, Sparkles } from 'lucide-react';

interface LogoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogoUrl?: string;
  onLogoUpdated: (newLogoUrl: string) => void;
}

export const LogoUploadModal: React.FC<LogoUploadModalProps> = ({
  isOpen,
  onClose,
  currentLogoUrl,
  onLogoUpdated,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(currentLogoUrl || '/gsfak_logo.jpg');
  const [urlInput, setUrlInput] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP, or SVG).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('The image size is too large (maximum 8MB). Please choose a smaller photo.');
      return;
    }

    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlApply = () => {
    if (!urlInput.trim()) return;
    setPreviewUrl(urlInput.trim());
    setUrlInput('');
  };

  const handleResetToDefault = () => {
    setPreviewUrl('/gsfak_logo.jpg');
    setErrorMessage('');
  };

  const handleSaveLogo = async () => {
    setIsUploading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // 1. Save to local storage for immediate browser persistence
      localStorage.setItem('gsfak_school_logo', previewUrl);

      // 2. Persist to server API
      try {
        await fetch('/api/public/update-logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logoUrl: previewUrl }),
        });
      } catch (err) {
        console.warn('Backend logo sync notice:', err);
      }

      // 3. Notify parent app
      onLogoUpdated(previewUrl);
      setSuccessMessage('School logo photo successfully updated across the website!');

      setTimeout(() => {
        onClose();
        setSuccessMessage('');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update school logo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1d4ed8]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#0c2340]">
                Upload School Logo Photo
              </h3>
              <p className="text-xs text-slate-500">
                GSFAK · Groupe Scolaire Frank Adamson de Kibogora
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="my-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="my-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <X className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="space-y-6 py-4">
          {/* Live Preview Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0c2340] block mb-3">
              Live Preview of School Logo
            </span>
            <div className="flex items-center justify-center gap-6">
              {/* Square / Badge style */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-24 h-24 rounded-2xl bg-white border-2 border-slate-200 p-1 shadow-sm overflow-hidden flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">Header Badge</span>
              </div>

              {/* Circle emblem style */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-24 h-24 rounded-full bg-white border-2 border-slate-200 p-1 shadow-sm overflow-hidden flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Logo circle preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-semibold">Round Emblem</span>
              </div>
            </div>
          </div>

          {/* Upload Photo Button / Dropzone */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-[#1d4ed8]/40 hover:border-[#1d4ed8] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-center bg-blue-50/20 hover:bg-blue-50/50 transition cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100/80 group-hover:bg-[#1d4ed8] group-hover:text-white text-[#1d4ed8] flex items-center justify-center transition">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0c2340]">
                  Click to select a photo from your computer or phone
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Supports PNG, JPG, JPEG, WEBP, or SVG format
                </p>
              </div>
            </button>
          </div>

          {/* Alternative: Enter Image URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Or paste an image web link (URL):</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/school-logo.png"
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:border-[#1d4ed8] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleUrlApply}
                disabled={!urlInput.trim()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveLogo}
              disabled={isUploading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-60"
            >
              {isUploading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Set as School Logo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
