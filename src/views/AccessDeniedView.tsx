import React from 'react';
import { Language } from '../types/index.ts';
import { translations } from '../i18n/translations.ts';
import { ShieldAlert, ArrowLeft, LogIn, Lock } from 'lucide-react';

interface AccessDeniedViewProps {
  lang: Language;
  onReturnHome: () => void;
  onOpenLogin: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  lang,
  onReturnHome,
  onOpenLogin,
}) => {
  const t = translations[lang];

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-2xl w-full bg-white border border-rose-200 rounded-3xl p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
        {/* Top Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />

        {/* Shield Alert Icon */}
        <div className="w-20 h-20 rounded-2xl bg-rose-50 border border-rose-200 mx-auto flex items-center justify-center text-rose-600 mb-6 shadow-xs">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/70 text-rose-800 text-xs font-bold tracking-wide uppercase mb-4">
          <Lock className="w-3 h-3" />
          <span>{t.access_denied_badge}</span>
        </div>

        {/* Access Denied Heading */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight mb-4">
          {t.access_denied_heading}
        </h2>

        {/* Descriptive Body */}
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-8">
          {t.access_denied_desc}
        </p>

        {/* Actions */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onReturnHome}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.access_denied_return_home}</span>
          </button>

          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-sm font-bold shadow-sm transition cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{t.access_denied_staff_login}</span>
          </button>
        </div>

        {/* Informative Security Guarantee */}
        <div className="mt-8 text-[11px] text-slate-400">
          Protected by server-side role validation, session tracking, and encrypted credentials.
        </div>
      </div>
    </div>
  );
};
