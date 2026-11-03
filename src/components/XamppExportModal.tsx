import React, { useState } from 'react';
import { X, Download, Copy, Check, FileText, Code2, Server } from 'lucide-react';

interface XamppExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const XamppExportModal: React.FC<XamppExportModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="max-w-3xl w-full bg-white rounded-3xl p-6 sm:p-10 shadow-2xl relative my-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Windows XAMPP / PHP 8.2 & MySQL Deployment
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
              Export Source Code & Database Schema
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The complete, standalone PHP 8.2 application and MySQL database schema for{' '}
          <strong>Groupe Scolaire Frank Adamson de Kibogora (GS FAKIBOGORA)</strong> is ready for local deployment in Windows XAMPP.
        </p>

        {/* Quick Download Strip */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-900 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 text-xs block">
                MySQL Database Schema (database.sql)
              </span>
              <span className="text-[11px] text-slate-500">
                11 normalized tables with indexes, foreign keys & sample credentials
              </span>
            </div>
          </div>
          <a
            href="/api/export/schema.sql"
            download="gsfakibogora_database.sql"
            className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download database.sql</span>
          </a>
        </div>

        {/* Local Folder Structure */}
        <div className="space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 text-sm">
            Local Deployment Files in Project Root
          </h3>
          <p className="text-slate-600">
            All files are available inside the <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-blue-900 font-bold">/php-app/</code> directory of this workspace:
          </p>
          <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl font-mono text-[11px] space-y-1">
            <p>📂 php-app/</p>
            <p>├── 📄 index.php (Unified public portal + integrated admin routing)</p>
            <p>├── 📄 config.php (PDO connection, CSRF tokens, session security)</p>
            <p>├── 📄 auth.php (password_verify, session regeneration, rate limiting)</p>
            <p>├── 📄 login_view.php (Staff authentication template)</p>
            <p>├── 📄 admin_view.php (Dashboard with overview, announcements, gallery & admins)</p>
            <p>├── 📄 database.sql (Full MySQL database schema & seed records)</p>
            <p>└── 📄 README.md (Detailed step-by-step Windows XAMPP installation guide)</p>
          </div>
        </div>

        {/* Windows Setup Instructions */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-2 leading-relaxed">
          <h4 className="font-bold">Instructions to run on Windows XAMPP:</h4>
          <ol className="list-decimal list-inside space-y-1 text-slate-700">
            <li>Start Apache and MySQL in XAMPP Control Panel.</li>
            <li>Copy the contents of <code className="bg-amber-100/60 px-1 rounded">php-app/</code> into <code className="bg-amber-100/60 px-1 rounded">C:\xampp\htdocs\gsfakibogora\</code>.</li>
            <li>In phpMyAdmin (<code className="bg-amber-100/60 px-1 rounded">http://localhost/phpmyadmin/</code>), create a database named <code className="font-bold text-blue-900">gsfakibogora</code> and import <code className="font-bold text-blue-900">database.sql</code>.</li>
            <li>Open <code className="font-bold text-blue-900">http://localhost/gsfakibogora/</code> in your browser.</li>
          </ol>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
