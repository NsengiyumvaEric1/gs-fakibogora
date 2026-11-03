import React, { useState, useRef } from 'react';
import { Upload, Camera, CheckCircle2, AlertCircle, RefreshCw, X, Image as ImageIcon } from 'lucide-react';

interface AdminImageUploaderProps {
  label: string;
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
  token: string;
  folder: 'announcements' | 'gallery' | 'staff' | 'slides' | 'branding';
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
  helperText?: string;
  buttonLabel?: string;
  required?: boolean;
}

export const AdminImageUploader: React.FC<AdminImageUploaderProps> = ({
  label,
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  token,
  folder,
  aspectRatio = 'auto',
  helperText,
  buttonLabel = 'Choose Image',
  required = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      setUploadError('Please choose a valid JPG, PNG, or WebP image file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Image size exceeds 15MB. Please choose a smaller file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onerror = () => {
      setUploadError('Failed to read file from your computer.');
      setIsUploading(false);
    };

    reader.onload = async () => {
      try {
        const fileData = reader.result as string;
        const res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            fileData,
            folder,
            prefix: folder.slice(0, 4)
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Server failed to save uploaded image.');
        }

        onImageUploaded(data.url);
      } catch (err: any) {
        console.error('Image upload error:', err);
        setUploadError(err.message || 'Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.readAsDataURL(file);
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square w-32';
      case 'video':
        return 'aspect-video w-full max-w-sm';
      case 'wide':
        return 'aspect-16/9 w-full';
      default:
        return 'max-h-48 w-auto';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block font-bold text-slate-700 text-xs">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
        {currentImageUrl && (
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Image Ready
          </span>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
      />

      {/* Upload & Preview Container */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        {currentImageUrl ? (
          <div className="space-y-3">
            {/* Image Preview Box */}
            <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs group flex items-center justify-center">
              <img
                src={currentImageUrl}
                alt="Selected preview"
                className={`${getAspectClass()} object-cover object-center max-h-52 rounded-xl transition duration-300 group-hover:scale-102`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"></div>
              
              <div className="absolute top-2 right-2 bg-slate-950/80 text-white text-[10px] px-2 py-0.5 rounded-md font-medium backdrop-blur-xs shadow-xs">
                Preview
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-2xs cursor-pointer transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
                <span>{isUploading ? 'Uploading...' : 'Replace Image'}</span>
              </button>

              {onImageRemoved && (
                <button
                  type="button"
                  onClick={onImageRemoved}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-200 font-semibold text-xs transition cursor-pointer disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}

              <span className="text-[11px] text-slate-500 font-mono truncate max-w-[200px]" title={currentImageUrl}>
                {currentImageUrl.split('/').pop()}
              </span>
            </div>
          </div>
        ) : (
          /* Empty State: Upload Button */
          <div className="flex flex-col items-center justify-center py-6 px-4 border-2 border-dashed border-slate-300 hover:border-blue-700 rounded-xl bg-white hover:bg-blue-50/40 transition group cursor-pointer text-center"
               onClick={() => !isUploading && fileInputRef.current?.click()}>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 group-hover:scale-105 transition flex items-center justify-center mb-2.5">
              {isUploading ? (
                <RefreshCw className="w-6 h-6 animate-spin text-blue-900" />
              ) : (
                <Upload className="w-6 h-6 text-blue-900" />
              )}
            </div>

            <button
              type="button"
              disabled={isUploading}
              className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span>{isUploading ? 'Uploading image...' : buttonLabel}</span>
            </button>

            <p className="text-[11px] text-slate-500 mt-2 font-medium">
              Click to choose picture from your computer (JPG, PNG, WebP)
            </p>
          </div>
        )}

        {/* Loading Progress Bar Indicator */}
        {isUploading && (
          <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 flex items-center gap-2.5 text-blue-900">
            <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-blue-900" />
            <div className="flex-1">
              <span className="font-bold text-xs block">Uploading image to server storage...</span>
              <span className="text-[10px] text-blue-700 font-medium">Writing file permanently to server</span>
            </div>
          </div>
        )}

        {/* Error Notice */}
        {uploadError && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
};
