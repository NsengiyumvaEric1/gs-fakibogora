/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  SchoolInfo,
  NewsAnnouncement,
  GalleryItem,
  StaffMember,
  ActivityEvent,
  HeroSlide,
  AdminUser,
  Language,
  NavigationPage
} from './types/index.ts';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { HomeView } from './views/HomeView.tsx';
import { AboutView } from './views/AboutView.tsx';
import { CoursesView } from './views/CoursesView.tsx';
import { SchoolFeesView } from './views/SchoolFeesView.tsx';
import { GalleryView } from './views/GalleryView.tsx';
import { StaffView } from './views/StaffView.tsx';
import { AnnouncementsView } from './views/AnnouncementsView.tsx';
import { NewsView } from './views/NewsView.tsx';
import { ContactView } from './views/ContactView.tsx';
import { AccessDeniedView } from './views/AccessDeniedView.tsx';
import { AdminLoginView } from './views/AdminLoginView.tsx';
import { AdminDashboardView } from './views/AdminDashboardView.tsx';
import { AnnouncementDetailModal } from './components/AnnouncementDetailModal.tsx';
import { XamppExportModal } from './components/XamppExportModal.tsx';
import { LogoUploadModal } from './components/LogoUploadModal.tsx';

export default function App() {
  // Navigation state: all institutional pages + admin
  const [activePage, setActivePage] = useState<NavigationPage>('home');
  // Admin sub-flow when not authenticated: 'denied' | 'login'
  const [adminFlowState, setAdminFlowState] = useState<'denied' | 'login'>('denied');

  // Active Language: 'en' | 'rw' | 'fr'
  const [lang, setLang] = useState<Language>('en');

  // Authentication State
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem('gsfak_token'));
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);

  // School Data State
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [announcements, setAnnouncements] = useState<NewsAnnouncement[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<NewsAnnouncement | null>(null);
  const [isXamppModalOpen, setIsXamppModalOpen] = useState<boolean>(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState<boolean>(false);

  const handleLogoUpdated = (newLogoUrl: string) => {
    if (schoolInfo) {
      setSchoolInfo({
        ...schoolInfo,
        logoUrl: newLogoUrl
      });
    }
  };

  // Fetch Public Data
  const fetchPublicData = async () => {
    try {
      const res = await fetch('/api/public/data');
      if (res.ok) {
        const data = await res.json();
        const savedLogo = localStorage.getItem('gsfak_school_logo');
        if (savedLogo && data.schoolInfo) {
          data.schoolInfo.logoUrl = savedLogo;
        }
        setSchoolInfo(data.schoolInfo);
        if (data.heroSlides) {
          setHeroSlides(data.heroSlides);
        }
        setAnnouncements(data.announcements);
        setGallery(data.gallery);
        setStaff(data.staff);
        setActivities(data.activities);
      }
    } catch (err) {
      console.error('Failed to load school data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify Session Token
  const verifySession = async (token: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentAdmin(data.admin);
      } else {
        // Expired or invalid
        localStorage.removeItem('gsfak_token');
        setAuthToken(null);
        setCurrentAdmin(null);
      }
    } catch {
      localStorage.removeItem('gsfak_token');
      setAuthToken(null);
      setCurrentAdmin(null);
    }
  };

  useEffect(() => {
    fetchPublicData();
    if (authToken) {
      verifySession(authToken);
    }
  }, [authToken]);

  // Handle Navigation Click (Institutional routes & Admin)
  const handleNavigate = (page: NavigationPage) => {
    if (page === 'admin') {
      setActivePage('admin');
      setAdminFlowState('login');
    } else {
      setActivePage(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Login Success
  const handleLoginSuccess = (token: string, adminData: any) => {
    setAuthToken(token);
    setCurrentAdmin(adminData);
    setActivePage('admin');
    fetchPublicData();
  };

  // Logout
  const handleLogout = async () => {
    if (authToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` }
        });
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem('gsfak_token');
    setAuthToken(null);
    setCurrentAdmin(null);
    setActivePage('home');
  };

  if (isLoading || !schoolInfo) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-20 h-20 rounded-2xl bg-white border border-slate-700 p-1 flex items-center justify-center shadow-lg mb-4 overflow-hidden animate-pulse">
          <img
            src="/gsfak_logo.jpg"
            alt="GS FAKIBOGORA Crest"
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className="text-lg font-bold tracking-tight">GS FAKIBOGORA</h2>
        <p className="text-xs text-slate-400 mt-1">
          Loading official school portal & administration system...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        schoolInfo={schoolInfo}
        activePage={activePage}
        onNavigate={handleNavigate}
        lang={lang}
        onLanguageChange={setLang}
        currentAdmin={currentAdmin}
        onLogout={handleLogout}
        onOpenStaffLogin={() => {
          setAdminFlowState('login');
          setActivePage('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLogoUpload={() => setIsLogoModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {/* 1. HOME VIEW */}
        {activePage === 'home' && (
          <HomeView
            schoolInfo={schoolInfo}
            announcements={announcements}
            gallery={gallery}
            heroSlides={heroSlides}
            lang={lang}
            onNavigate={handleNavigate}
            onSelectAnnouncement={setSelectedAnnouncement}
          />
        )}

        {/* 2. ABOUT US VIEW */}
        {activePage === 'about' && (
          <AboutView schoolInfo={schoolInfo} staff={staff} lang={lang} />
        )}

        {/* 3. COURSES VIEW */}
        {activePage === 'courses' && (
          <CoursesView schoolInfo={schoolInfo} lang={lang} onNavigate={handleNavigate} />
        )}

        {/* 4. SCHOOL FEES VIEW */}
        {activePage === 'fees' && (
          <SchoolFeesView schoolInfo={schoolInfo} lang={lang} onNavigate={handleNavigate} />
        )}

        {/* 5. GALLERY VIEW */}
        {activePage === 'gallery' && (
          <GalleryView gallery={gallery} lang={lang} />
        )}

        {/* 6. STAFF VIEW */}
        {activePage === 'staff' && (
          <StaffView schoolInfo={schoolInfo} staff={staff} lang={lang} onNavigate={handleNavigate} />
        )}

        {/* 7. ANNOUNCEMENTS VIEW */}
        {activePage === 'announcements' && (
          <AnnouncementsView
            announcements={announcements}
            lang={lang}
            onSelectAnnouncement={setSelectedAnnouncement}
          />
        )}

        {/* 8. NEWS VIEW */}
        {activePage === 'news' && (
          <NewsView
            newsItems={announcements}
            lang={lang}
            onSelectArticle={setSelectedAnnouncement}
          />
        )}

        {/* 9. CONTACT US VIEW */}
        {activePage === 'contact' && (
          <ContactView schoolInfo={schoolInfo} lang={lang} />
        )}

        {/* 10. ADMIN VIEW */}
        {activePage === 'admin' && (
          <>
            {currentAdmin ? (
              <AdminDashboardView
                currentAdmin={currentAdmin}
                token={authToken!}
                lang={lang}
                onLogout={handleLogout}
                onViewPublicSite={() => handleNavigate('home')}
                onRefreshData={fetchPublicData}
              />
            ) : (
              <AdminLoginView
                schoolInfo={schoolInfo}
                lang={lang}
                onLoginSuccess={handleLoginSuccess}
                onCancel={() => handleNavigate('home')}
              />
            )}
          </>
        )}
      </main>

      {/* Institutional School Footer (with XAMPP export trigger) */}
      <Footer
        schoolInfo={schoolInfo}
        lang={lang}
        onNavigate={handleNavigate}
        onOpenXamppExport={() => setIsXamppModalOpen(true)}
      />

      {/* Announcement Detail Modal */}
      <AnnouncementDetailModal
        announcement={selectedAnnouncement}
        lang={lang}
        onClose={() => setSelectedAnnouncement(null)}
      />

      {/* XAMPP / PHP & MySQL Export Package Modal */}
      <XamppExportModal
        isOpen={isXamppModalOpen}
        onClose={() => setIsXamppModalOpen(false)}
      />

      {/* Photo Logo Upload Modal */}
      <LogoUploadModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        currentLogoUrl={schoolInfo?.logoUrl}
        onLogoUpdated={handleLogoUpdated}
      />
    </div>
  );
}
