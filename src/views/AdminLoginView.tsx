import React, { useState, useEffect } from 'react';
import { SchoolInfo, Language } from '../types/index.ts';
import { translations } from '../i18n/translations.ts';
import {
  Eye,
  EyeOff,
  Lock,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  User,
  Mail,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface AdminLoginViewProps {
  schoolInfo?: SchoolInfo;
  lang: Language;
  onLoginSuccess: (token: string, adminData: any) => void;
  onCancel: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  schoolInfo,
  lang,
  onLoginSuccess,
  onCancel,
}) => {
  // Modes: 'login' | 'forgot' | 'reset'
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');

  // Login form state
  const [username, setUsername] = useState('superadmin@gsfakibogora.rw');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [issuedResetLink, setIssuedResetLink] = useState('');
  const [issuedResetToken, setIssuedResetToken] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Reset password form state
  const [resetToken, setResetToken] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & notifications
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const t = translations[lang] || translations.en;

  // Check URL query parameters for reset token (e.g. ?token=... or ?view=admin-reset-password&token=...)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenParam = urlParams.get('token');
      if (tokenParam) {
        setResetToken(tokenParam);
        verifyToken(tokenParam);
      }
    } catch {
      // ignore
    }
  }, []);

  const verifyToken = async (token: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (data.valid) {
        setResetEmail(data.email);
        setMode('reset');
      } else {
        setErrorMessage(data.error || 'Password reset link is invalid or has expired.');
        setMode('login');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to verify reset token.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Handle Standard Admin Sign In
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!username.trim() || !password) {
      setErrorMessage(
        lang === 'rw'
          ? 'Shyiramo izina ry\'ukoresha hamwe n\'ijambobanga byawe.'
          : lang === 'fr'
          ? 'Veuillez saisir votre nom d\'utilisateur et votre mot de passe.'
          : 'Please enter both your username and password.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      // Successful login
      localStorage.setItem('gsfak_token', data.token);
      onLoginSuccess(data.token, data.admin);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          (lang === 'rw'
            ? 'Izina ry\'ukoresha cyangwa ijambobanga ntabwo bihuye.'
            : lang === 'fr'
            ? 'Nom d\'utilisateur ou mot de passe incorrect.'
            : 'Invalid username or password. Please try again.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Forgot Password Request
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!forgotEmail.trim()) {
      setErrorMessage('Please enter your registered administrator email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request password reset link.');
      }

      const fullLink = `${window.location.origin}${data.resetLink}`;
      setIssuedResetLink(fullLink);
      setIssuedResetToken(data.token);
      setResetEmail(data.email);
      setSuccessMessage('A secure password reset link has been successfully created.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to generate password reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Password Reset Execution
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Check if passwords are different
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords are different. Please ensure both new passwords match exactly.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken || issuedResetToken,
          newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      setSuccessMessage('Your password has been changed successfully! You can now log in using your new password.');
      // Prepare login view
      setUsername(resetEmail || forgotEmail || username);
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMode('login');
    } catch (err: any) {
      setErrorMessage(err.message || 'Password reset failed. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (issuedResetLink) {
      navigator.clipboard.writeText(issuedResetLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm relative">
        {/* Top School Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 p-1 mx-auto flex items-center justify-center shadow-xs mb-3 overflow-hidden">
            <img
              src={schoolInfo?.logoUrl || '/gsfak_logo.jpg'}
              alt="GSFAK Official Crest"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0c2340] tracking-tight leading-none">
            GSFAK
          </h1>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Groupe Scolaire Frank Adamson de Kibogora
          </p>

          {mode === 'login' && (
            <>
              <h2 className="text-lg font-bold text-[#0c2340] tracking-tight mt-3">
                {t.login_heading || 'Administrator Sign In'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {t.login_sub || 'Enter your username and password to access the administration portal.'}
              </p>
            </>
          )}

          {mode === 'forgot' && (
            <>
              <h2 className="text-lg font-bold text-[#0c2340] tracking-tight mt-3">
                Forgot Administrator Password
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Provide your registered school email to receive a secure password reset link.
              </p>
            </>
          )}

          {mode === 'reset' && (
            <>
              <h2 className="text-lg font-bold text-[#0c2340] tracking-tight mt-3">
                Create New Password
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Set a new secure password for {resetEmail || 'your administrator account'}.
              </p>
            </>
          )}
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 1: STANDARD SIGN IN FORM                             */}
        {/* ========================================================= */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Field 1: Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username or email"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-[#1d4ed8] focus:outline-none transition"
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMessage('');
                    setSuccessMessage('');
                    if (username.includes('@')) {
                      setForgotEmail(username);
                    }
                  }}
                  className="text-[11px] font-bold text-[#1d4ed8] hover:text-[#1e40af] transition cursor-pointer hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-[#1d4ed8] focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] disabled:bg-blue-300 text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* MODE 2: FORGOT PASSWORD REQUEST                           */}
        {/* ========================================================= */}
        {mode === 'forgot' && (
          <div className="space-y-4">
            {!issuedResetLink ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Registered Administrator Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. superadmin@gsfakibogora.rw"
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-[#1d4ed8] focus:outline-none transition"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Must be the email address registered with your administrator profile.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#1d4ed8] hover:bg-[#1e40af] disabled:bg-blue-300 text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Generating Reset Link...</span>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Send Password Reset Link</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-xs text-slate-600 hover:text-slate-900 transition font-medium inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>Password Reset Link Created</span>
                  </div>
                  <p className="text-emerald-900 leading-relaxed">
                    A secure password reset link has been generated for <strong>{forgotEmail}</strong>. This single-use link expires in 60 minutes.
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 break-all text-[11px] font-mono text-slate-700 select-all">
                    {issuedResetLink}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied to Clipboard' : 'Copy Reset Link'}</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setResetToken(issuedResetToken);
                    setMode('reset');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Proceed to Reset Password Now</span>
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setIssuedResetLink('');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-xs text-slate-600 hover:text-slate-900 transition font-medium inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Sign In</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 3: RESET PASSWORD (NEW PASSWORD FORM)               */}
        {/* ========================================================= */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
              <span className="font-semibold block text-slate-800">Target Administrator Account:</span>
              <span className="font-mono text-blue-900">{resetEmail || 'Verified Administrator'}</span>
            </div>

            {/* Field: New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:border-[#1d4ed8] focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Field: Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-12 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none transition ${
                    confirmPassword && newPassword !== confirmPassword
                      ? 'border-rose-400 focus:border-rose-500'
                      : confirmPassword && newPassword === confirmPassword
                      ? 'border-emerald-400 focus:border-emerald-500'
                      : 'border-slate-300 focus:border-[#1d4ed8]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* DIRECT FEEDBACK: PASSWORDS ARE DIFFERENT OR MATCH */}
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Passwords are different. Please ensure both passwords match.</span>
                </p>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <p className="mt-1.5 text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Passwords match.</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || (confirmPassword ? newPassword !== confirmPassword : false)}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Save New Password & Sign In</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                }}
                className="text-xs text-slate-600 hover:text-slate-900 transition font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel and Return to Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* Security Notice */}
        <div className="mt-8 pt-5 border-t border-slate-200 text-center">
          <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs mb-1">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Institutional Security Protocol</span>
          </div>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
            GSFAK Administration Portal is protected by PBKDF2 encryption, session validation, and strict role authorization.
          </p>
        </div>

        {/* Back Link */}
        <div className="mt-5 text-center">
          <button
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </button>
        </div>
      </div>
    </div>
  );
};
