import React, { useState, useEffect } from 'react';
import {
  SchoolInfo,
  AdminUser,
  NewsAnnouncement,
  GalleryItem,
  StaffMember,
  ActivityEvent,
  ContactMessage,
  AuditLog,
  HeroSlide,
  Language
} from '../types/index.ts';
import { translations } from '../i18n/translations.ts';
import { AdminImageUploader } from '../components/AdminImageUploader.tsx';
import {
  LayoutDashboard,
  Megaphone,
  Image as ImageIcon,
  School,
  Users,
  Mail,
  UserCog,
  UserPlus,
  UserMinus,
  KeyRound,
  FileText,
  Download,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Eye,
  LogOut,
  Shield,
  Clock,
  Search,
  Filter,
  Save,
  RefreshCw,
  ExternalLink,
  Lock,
  ArrowRight,
  Camera,
  Upload,
  RotateCcw,
  Check
} from 'lucide-react';

interface AdminDashboardViewProps {
  currentAdmin: AdminUser;
  token: string;
  lang: Language;
  onLogout: () => void;
  onViewPublicSite: () => void;
  onRefreshData: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentAdmin,
  token,
  lang,
  onLogout,
  onViewPublicSite,
  onRefreshData
}) => {
  const t = translations[lang];
  const isSuperAdmin = currentAdmin.role === 'super_admin';

  // Active Tab
  type TabKey =
    | 'overview'
    | 'announcements'
    | 'school_info'
    | 'gallery'
    | 'staff_activities'
    | 'messages'
    | 'admins'
    | 'replacement';

  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // Dashboard Data State
  const [stats, setStats] = useState({
    publishedAnnouncements: 0,
    draftAnnouncements: 0,
    newsArticles: 0,
    galleryCount: 0,
    activeAdmins: 0,
    unreadMessages: 0
  });

  const [announcements, setAnnouncements] = useState<NewsAnnouncement[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);

  // Hero Slide Management State
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [slideToDelete, setSlideToDelete] = useState<HeroSlide | null>(null);
  const [isDeletingSlide, setIsDeletingSlide] = useState(false);
  const [isUploadingSlidePhoto, setIsUploadingSlidePhoto] = useState(false);
  const [slideForm, setSlideForm] = useState({
    title: '',
    subtitle: '',
    image: '',
    badge: 'Excellence in Education',
    label: 'GSFAK Kibogora',
    displayOrder: 1,
    isPublished: true
  });

  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals & Form Dialogs
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Partial<NewsAnnouncement> | null>(null);
  const [announcementToDelete, setAnnouncementToDelete] = useState<NewsAnnouncement | null>(null);
  const [isDeletingAnn, setIsDeletingAnn] = useState(false);
  const [isUploadingAnnPhoto, setIsUploadingAnnPhoto] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<GalleryItem | null>(null);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [newGalleryItem, setNewGalleryItem] = useState({
    titleEn: '',
    captionEn: '',
    category: 'campus' as const,
    imageUrl: '',
    isPublished: true
  });

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaffMember, setEditingStaffMember] = useState<StaffMember | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [isDeletingStaff, setIsDeletingStaff] = useState(false);
  const [isUploadingStaffPhoto, setIsUploadingStaffPhoto] = useState(false);
  const [newStaffMember, setNewStaffMember] = useState({
    fullName: '',
    category: 'teacher' as 'leader' | 'teacher',
    titleEn: '',
    department: 'Teaching Faculty',
    qualification: '',
    emailPlaceholder: '',
    photoUrl: ''
  });

  const [showNewAdminModal, setShowNewAdminModal] = useState(false);
  const [editingAdminUser, setEditingAdminUser] = useState<AdminUser | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);
  const [isDeletingAdmin, setIsDeletingAdmin] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    fullName: '',
    email: '',
    role: 'content_admin' as const,
    password: '',
    notes: ''
  });

  // Guided Replacement Form
  const [replacementForm, setReplacementForm] = useState({
    predecessorId: '',
    replacementFullName: '',
    replacementEmail: '',
    replacementRole: 'content_admin' as const,
    replacementPassword: '',
    reasonNotes: ''
  });

  // Password Change
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState('');

  // Message Deletion State
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);

  // Announcements Search & Filter
  const [annSearch, setAnnSearch] = useState('');
  const [annFilter, setAnnFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Load Dashboard Data
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Overview
      const resOverview = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resOverview.ok) {
        const data = await resOverview.json();
        setStats(data.stats);
        setSchoolInfo(data.schoolInfo);
      }

      // 2. Announcements
      const resAnn = await fetch('/api/admin/announcements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resAnn.ok) {
        const data = await resAnn.json();
        setAnnouncements(data.announcements);
      }

      // 2.5 Hero Slideshow
      const resSlides = await fetch('/api/admin/slides', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resSlides.ok) {
        const data = await resSlides.json();
        setHeroSlides(data.slides || []);
      }

      // 3. Gallery
      const resGal = await fetch('/api/admin/gallery', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resGal.ok) {
        const data = await resGal.json();
        setGallery(data.gallery);
      }

      // 4. Staff
      const resStaff = await fetch('/api/admin/staff', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resStaff.ok) {
        const data = await resStaff.json();
        setStaff(data.staff);
      }

      // 5. Messages
      const resMsg = await fetch('/api/admin/messages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resMsg.ok) {
        const data = await resMsg.json();
        setMessages(data.messages);
      }

      // 6. Admin users
      const resUsers = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resUsers.ok) {
        const data = await resUsers.json();
        setAdminUsers(data.admins);
      }

      // 7. Audit logs (if super admin)
      if (isSuperAdmin) {
        const resAudit = await fetch('/api/admin/audit-logs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resAudit.ok) {
          const data = await resAudit.json();
          setAuditLogs(data.logs);
        }
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [token, activeTab]);

  const showNotice = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 5000);
  };

  // -------------------------------------------------------------
  // HANDLERS: ANNOUNCEMENTS
  // -------------------------------------------------------------
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnn?.title?.en || !editingAnn?.summary?.en || !editingAnn?.content?.en) {
      showNotice('error', 'English Title, Summary, and Content are required.');
      return;
    }

    try {
      const isEdit = Boolean(editingAnn.id);
      const url = isEdit ? `/api/admin/announcements/${editingAnn.id}` : '/api/admin/announcements';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingAnn)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save announcement');

      showNotice('success', `Announcement ${isEdit ? 'updated' : 'created'} successfully.`);
      setShowAnnModal(false);
      setEditingAnn(null);
      loadDashboardData();
      onRefreshData();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  const handleDeleteAnnouncement = async (targetAnn: NewsAnnouncement) => {
    setIsDeletingAnn(true);
    try {
      const res = await fetch(`/api/admin/announcements/${targetAnn.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete announcement');

      // Update local state immediately so it disappears from UI
      setAnnouncements((prev) => prev.filter((a) => a.id !== targetAnn.id));
      setStats((prev) => ({
        ...prev,
        publishedAnnouncements: targetAnn.isPublished
          ? Math.max(0, prev.publishedAnnouncements - 1)
          : prev.publishedAnnouncements,
        draftAnnouncements: !targetAnn.isPublished
          ? Math.max(0, prev.draftAnnouncements - 1)
          : prev.draftAnnouncements
      }));

      showNotice('success', `Announcement "${targetAnn.title.en}" was permanently deleted.`);
      setAnnouncementToDelete(null);
      loadDashboardData();
      onRefreshData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete announcement. Record was kept intact.');
    } finally {
      setIsDeletingAnn(false);
    }
  };

  const handleTogglePublishAnnouncement = async (ann: NewsAnnouncement) => {
    try {
      const res = await fetch(`/api/admin/announcements/${ann.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished: !ann.isPublished })
      });
      if (!res.ok) throw new Error('Failed to toggle status');
      showNotice('success', `Announcement status changed to ${!ann.isPublished ? 'Published' : 'Draft'}.`);
      loadDashboardData();
      onRefreshData();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: HERO SLIDESHOW (AUTO-CHANGING IMAGES)
  // -------------------------------------------------------------
  const handleOpenAddSlideModal = () => {
    setEditingSlide(null);
    setSlideForm({
      title: '',
      subtitle: '',
      image: '',
      badge: 'Excellence in Education',
      label: 'GSFAK Kibogora',
      displayOrder: (heroSlides.length || 0) + 1,
      isPublished: true
    });
    setShowSlideModal(true);
  };

  const handleOpenEditSlideModal = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setSlideForm({
      title: slide.title,
      subtitle: slide.subtitle,
      image: slide.image,
      badge: slide.badge || 'Excellence in Education',
      label: slide.label || 'GSFAK Kibogora',
      displayOrder: slide.displayOrder ?? 1,
      isPublished: slide.isPublished !== false
    });
    setShowSlideModal(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideForm.image.trim()) {
      showNotice('error', 'Hero image file or URL is required.');
      return;
    }

    try {
      const isEdit = Boolean(editingSlide?.id);
      const url = isEdit ? `/api/admin/slides/${editingSlide!.id}` : '/api/admin/slides';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(slideForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save hero slide');

      showNotice('success', `Hero slide ${isEdit ? 'updated' : 'added'} successfully.`);
      setShowSlideModal(false);
      setEditingSlide(null);
      loadDashboardData();
      onRefreshData();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  const handleDeleteSlide = async (targetSlide: HeroSlide) => {
    setIsDeletingSlide(true);
    try {
      const res = await fetch(`/api/admin/slides/${targetSlide.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete hero slide');

      showNotice('success', 'Slide removed from home showcase.');
      setSlideToDelete(null);
      loadDashboardData();
      onRefreshData();
    } catch (err: any) {
      showNotice('error', err.message);
    } finally {
      setIsDeletingSlide(false);
    }
  };

  const handleTogglePublishSlide = async (slide: HeroSlide) => {
    try {
      const res = await fetch(`/api/admin/slides/${slide.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished: !slide.isPublished })
      });
      if (!res.ok) throw new Error('Failed to toggle slide status');
      showNotice('success', `Slide status changed to ${!slide.isPublished ? 'Live in rotation' : 'Hidden'}.`);
      loadDashboardData();
      onRefreshData();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  const handleSlideFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotice('error', 'Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showNotice('error', 'Image file size exceeds the 15MB limit.');
      return;
    }

    setIsUploadingSlidePhoto(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fileData = reader.result as string;
        const res = await fetch('/api/admin/slides/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ fileData, fileName: file.name })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to upload hero image');

        setSlideForm((prev) => ({
          ...prev,
          image: data.imageUrl
        }));
        showNotice('success', 'Slide image uploaded successfully!');
      } catch (err: any) {
        showNotice('error', err.message);
      } finally {
        setIsUploadingSlidePhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // -------------------------------------------------------------
  // HANDLERS: GALLERY
  // -------------------------------------------------------------
  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryItem.titleEn || !newGalleryItem.imageUrl) {
      showNotice('error', 'Title and image URL are required.');
      return;
    }

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: { en: newGalleryItem.titleEn, rw: newGalleryItem.titleEn, fr: newGalleryItem.titleEn },
          caption: { en: newGalleryItem.captionEn, rw: newGalleryItem.captionEn, fr: newGalleryItem.captionEn },
          category: newGalleryItem.category,
          imageUrl: newGalleryItem.imageUrl,
          isPublished: newGalleryItem.isPublished
        })
      });

      if (!res.ok) throw new Error('Failed to add gallery item');
      showNotice('success', 'Image added to gallery.');
      setShowGalleryModal(false);
      setNewGalleryItem({
        titleEn: '',
        captionEn: '',
        category: 'campus',
        imageUrl: '',
        isPublished: true
      });
      loadDashboardData();
      onRefreshData();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotice('error', 'Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showNotice('error', 'Image file size exceeds the 10MB limit.');
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fileData = reader.result as string;
        const res = await fetch('/api/admin/gallery/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ fileData, fileName: file.name })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to upload photo file');

        setNewGalleryItem((prev) => ({
          ...prev,
          imageUrl: data.url,
          titleEn: prev.titleEn || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
        }));
        showNotice('success', 'Photo file uploaded to server storage successfully.');
      } catch (err: any) {
        showNotice('error', err.message || 'File upload failed');
      } finally {
        setIsUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteGalleryItem = async (photo: GalleryItem) => {
    setIsDeletingPhoto(true);
    try {
      const res = await fetch(`/api/admin/gallery/${photo.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete photo from gallery');
      }

      // Update gallery immediately so the deleted photo no longer appears in dashboard or site
      setGallery((prev) => prev.filter((g) => g.id !== photo.id));
      setStats((prev) => ({
        ...prev,
        galleryCount: Math.max(0, prev.galleryCount - 1)
      }));
      setPhotoToDelete(null);
      showNotice('success', data.message || 'Photo successfully deleted from the gallery.');
      loadDashboardData();
      onRefreshData();
    } catch (err: any) {
      // If deletion fails, display a clear error message and keep the photo record intact
      showNotice('error', err.message || 'Failed to delete photo. The photo record was kept intact.');
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: STAFF
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // HANDLERS: STAFF MANAGEMENT (TEACHERS & SCHOOL LEADERS)
  // -------------------------------------------------------------
  const handleStaffPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotice('error', 'Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showNotice('error', 'Photograph file size exceeds the 10MB limit.');
      return;
    }

    setIsUploadingStaffPhoto(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fileData = reader.result as string;
        const res = await fetch('/api/admin/staff/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ fileData, fileName: file.name })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to upload staff photo');

        if (isEditing && editingStaffMember) {
          setEditingStaffMember((prev) => prev ? ({ ...prev, photoUrl: data.url }) : null);
        } else {
          setNewStaffMember((prev) => ({ ...prev, photoUrl: data.url }));
        }
        showNotice('success', 'Staff photograph uploaded to server storage successfully.');
      } catch (err: any) {
        showNotice('error', err.message || 'Photo upload failed');
      } finally {
        setIsUploadingStaffPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddStaffMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffMember.fullName.trim()) {
      showNotice('error', 'Staff member full name is required.');
      return;
    }

    try {
      const isLeader = newStaffMember.category === 'leader';
      const titleEn = isLeader
        ? (newStaffMember.titleEn.trim() || 'School Leader')
        : (newStaffMember.titleEn.trim() || 'Teacher');

      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: newStaffMember.fullName.trim(),
          category: newStaffMember.category,
          title: {
            en: titleEn,
            rw: isLeader ? (newStaffMember.titleEn || 'Umuyobozi') : 'Umwarimu',
            fr: isLeader ? (newStaffMember.titleEn || 'Responsable') : 'Enseignant'
          },
          department: newStaffMember.department.trim() || (isLeader ? 'School Administration' : 'Teaching Faculty'),
          qualification: newStaffMember.qualification.trim() || 'Degree in Education',
          emailPlaceholder: newStaffMember.emailPlaceholder.trim() || 'staff@gsfakibogora.rw (Placeholder)',
          photoUrl: newStaffMember.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add staff record');

      showNotice('success', `Staff member "${newStaffMember.fullName}" added successfully.`);
      setShowStaffModal(false);
      setNewStaffMember({
        fullName: '',
        category: 'teacher',
        titleEn: '',
        department: 'Teaching Faculty',
        qualification: '',
        emailPlaceholder: '',
        photoUrl: ''
      });
      loadDashboardData();
      onRefreshData();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  const handleUpdateStaffMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffMember || !editingStaffMember.fullName.trim()) {
      showNotice('error', 'Staff member full name is required.');
      return;
    }

    try {
      const res = await fetch(`/api/admin/staff/${editingStaffMember.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: editingStaffMember.fullName.trim(),
          category: editingStaffMember.category,
          title: editingStaffMember.title,
          department: editingStaffMember.department,
          qualification: editingStaffMember.qualification,
          emailPlaceholder: editingStaffMember.emailPlaceholder,
          photoUrl: editingStaffMember.photoUrl
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update staff record');

      showNotice('success', `Staff profile for "${editingStaffMember.fullName}" updated successfully.`);
      setEditingStaffMember(null);
      loadDashboardData();
      onRefreshData();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  const handleConfirmDeleteStaff = async (member: StaffMember) => {
    setIsDeletingStaff(true);
    try {
      const res = await fetch(`/api/admin/staff/${member.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete staff member');

      // Update state immediately so the deleted staff member disappears from dashboard and public page
      setStaff((prev) => prev.filter((s) => s.id !== member.id));
      setStaffToDelete(null);
      showNotice('success', data.message || `Staff member "${member.fullName}" removed.`);
      loadDashboardData();
      onRefreshData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete staff member. The record was kept intact.');
    } finally {
      setIsDeletingStaff(false);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: SCHOOL INFO UPDATE
  // -------------------------------------------------------------
  const handleUpdateSchoolInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolInfo) return;

    try {
      const res = await fetch('/api/admin/school-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(schoolInfo)
      });

      if (!res.ok) throw new Error('Failed to update school information');
      showNotice('success', 'School details updated and published.');
      onRefreshData();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  // -------------------------------------------------------------
  // HANDLERS: ADMINISTRATOR ACCOUNTS & REPLACEMENT (CRITICAL)
  // -------------------------------------------------------------
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminForm.fullName || !newAdminForm.email || !newAdminForm.password) {
      showNotice('error', 'Please fill in name, email, and password.');
      return;
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newAdminForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create administrator');

      showNotice('success', `Administrator account created for ${data.admin.email}.`);
      setShowNewAdminModal(false);
      setNewAdminForm({
        fullName: '',
        email: '',
        role: 'content_admin',
        password: '',
        notes: ''
      });
      loadDashboardData();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  const handleToggleAdminStatus = async (adminId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'DEACTIVATE' : 'ACTIVATE'} this administrator account? If deactivated, all active sessions will be terminated immediately.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${adminId}/toggle-status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update account status');

      showNotice('success', `Account ${data.isActive ? 'activated' : 'deactivated and active sessions revoked'}.`);
      loadDashboardData();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  // GUIDED STAFF SUCCESSION / REPLACEMENT WORKFLOW
  const handleExecuteReplacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !replacementForm.predecessorId ||
      !replacementForm.replacementFullName ||
      !replacementForm.replacementEmail ||
      !replacementForm.replacementPassword
    ) {
      showNotice('error', 'Please select predecessor and complete successor details.');
      return;
    }

    const confirmed = confirm(
      'CONFIRM SUCCESSION WORKFLOW:\n\n' +
      '1. A new account will be created for the replacement employee.\n' +
      '2. The previous employee\'s account will be permanently deactivated.\n' +
      '3. All active sessions belonging to the departing administrator will be terminated.\n' +
      '4. An institutional succession event will be recorded in the audit trail.\n\nProceed?'
    );
    if (!confirmed) return;

    try {
      const res = await fetch('/api/admin/users/replace-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(replacementForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to execute succession workflow');

      showNotice('success', data.message);
      setReplacementForm({
        predecessorId: '',
        replacementFullName: '',
        replacementEmail: '',
        replacementRole: 'content_admin',
        replacementPassword: '',
        reasonNotes: ''
      });
      setActiveTab('admins');
      loadDashboardData();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  // SELF PASSWORD CHANGE WITH DIRECT FEEDBACK
  const handleChangeMyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    setPasswordChangeSuccess('');

    // DIRECT RESPONSE: Check if passwords do not match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordChangeError('Passwords are different. Please ensure both new passwords match exactly.');
      showNotice('error', 'Passwords are different. Please ensure both new passwords match exactly.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordChangeError('New password must be at least 8 characters long.');
      showNotice('error', 'New password must be at least 8 characters long.');
      return;
    }

    try {
      const res = await fetch('/api/admin/users/change-my-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      // DIRECT RESPONSE: Confirm password has changed
      setPasswordChangeSuccess('Your password has been changed successfully!');
      showNotice('success', 'Your password has been changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setPasswordChangeSuccess('');
        setPasswordChangeError('');
      }, 2000);
    } catch (err: any) {
      setPasswordChangeError(err.message || 'Current password is incorrect.');
      showNotice('error', err.message || 'Current password is incorrect.');
    }
  };

  // DELETE CONTACT INQUIRY MESSAGE
  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;
    setIsDeletingMessage(true);
    try {
      const res = await fetch(`/api/admin/messages/${messageToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete message');

      setMessages(prev => prev.filter(m => m.id !== messageToDelete.id));
      setStats(prev => ({
        ...prev,
        unreadMessages: Math.max(0, prev.unreadMessages - (messageToDelete.status === 'unread' ? 1 : 0))
      }));
      showNotice('success', 'Inquiry message has been permanently deleted.');
      setMessageToDelete(null);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete message.');
    } finally {
      setIsDeletingMessage(false);
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdminUser || !editingAdminUser.fullName.trim() || !editingAdminUser.email.trim()) {
      showNotice('error', 'Administrator name and email are required.');
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${editingAdminUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: editingAdminUser.fullName.trim(),
          email: editingAdminUser.email.trim(),
          role: editingAdminUser.role,
          notes: editingAdminUser.notes || ''
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update administrator account');

      showNotice('success', `Administrator "${editingAdminUser.email}" updated successfully.`);
      setEditingAdminUser(null);
      loadDashboardData();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  const handleDeleteAdmin = async (targetAdmin: AdminUser) => {
    setIsDeletingAdmin(true);
    try {
      const res = await fetch(`/api/admin/users/${targetAdmin.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete administrator');

      setAdminUsers((prev) => prev.filter((a) => a.id !== targetAdmin.id));
      setAdminToDelete(null);
      showNotice('success', data.message || `Administrator account "${targetAdmin.email}" deleted successfully.`);
      loadDashboardData();
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete administrator');
    } finally {
      setIsDeletingAdmin(false);
    }
  };


  // Filtered announcements list
  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch =
      (a.title.en && a.title.en.toLowerCase().includes(annSearch.toLowerCase())) ||
      (a.summary.en && a.summary.en.toLowerCase().includes(annSearch.toLowerCase()));
    if (!matchesSearch) return false;
    if (annFilter === 'published') return a.isPublished;
    if (annFilter === 'draft') return !a.isPublished;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Administrative Bar */}
      <div className="bg-slate-900 border-b border-slate-800 text-white py-3 px-4 sm:px-8 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('school_info')}
              className="relative group/adminlogo cursor-pointer"
              title="Click to edit school logo & identity"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-700 p-0.5 flex items-center justify-center overflow-hidden shrink-0 group-hover/adminlogo:border-amber-400 transition">
                <img
                  src={schoolInfo?.logoUrl || '/gsfak_logo.jpg'}
                  alt="GS FAKIBOGORA Crest"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs text-[10px]">
                <Camera className="w-2.5 h-2.5" />
              </div>
            </button>
            <div>
              <div
                className="text-lg font-black text-white tracking-tight leading-none"
              >
                GSFAK
              </div>
              <div className="text-[10.5px] text-slate-300 font-medium mt-0.5 flex items-center gap-2">
                <span>Groupe Scolaire Frank Adamson de Kibogora</span>
                <span className="hidden md:inline-block text-[10px] text-amber-400 font-semibold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">Admin Control</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* User Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-slate-200">{currentAdmin.fullName}</span>
              <span className="text-slate-400">·</span>
              <span className="capitalize text-amber-300 font-bold">
                {currentAdmin.role === 'super_admin' ? 'Super Administrator' : 'Content Editor'}
              </span>
            </div>

            <button
              onClick={() => setShowChangePasswordModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </button>

            <button
              onClick={onViewPublicSite}
              className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Website</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`mx-4 sm:mx-8 mt-4 p-4 rounded-2xl text-xs font-medium flex items-center justify-between border max-w-7xl sm:mx-auto ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Admin Dashboard Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        {/* Navigation Tabs (Functional button controls conforming to anti-slop guidelines) */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'announcements'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Announcements & News ({stats.publishedAnnouncements + stats.draftAnnouncements})</span>
          </button>

          <button
            onClick={() => setActiveTab('school_info')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'school_info'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <School className="w-4 h-4" />
            <span>School Profile & Content</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'gallery'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Gallery ({stats.galleryCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('staff_activities')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'staff_activities'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff Management ({staff.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'messages'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Inquiries {stats.unreadMessages > 0 && `(${stats.unreadMessages})`}</span>
          </button>

          <button
            onClick={() => setActiveTab('admins')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'admins'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <UserCog className="w-4 h-4" />
            <span>Administrators ({stats.activeAdmins})</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('replacement')}
              className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'replacement'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <UserMinus className="w-4 h-4" />
              <span>★ Succession Wizard</span>
            </button>
          )}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW & MANAGEMENT                              */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Actions Strip */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h3 className="font-bold text-slate-950 text-sm mb-4">
                Institutional Management Shortcuts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setEditingAnn({
                      title: { en: '', rw: '', fr: '' },
                      summary: { en: '', rw: '', fr: '' },
                      content: { en: '', rw: '', fr: '' },
                      type: 'announcement',
                      isImportant: false,
                      isPublished: true,
                      publishedAt: new Date().toISOString()
                    });
                    setShowAnnModal(true);
                  }}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition text-left cursor-pointer flex items-start gap-3"
                >
                  <Plus className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      New Announcement
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Draft or publish a school notice
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setShowGalleryModal(true)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition text-left cursor-pointer flex items-start gap-3"
                >
                  <ImageIcon className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      Add Gallery Image
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Upload lab, sports, or campus photo
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('school_info')}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition text-left cursor-pointer flex items-start gap-3"
                >
                  <Edit3 className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">
                      Update School Info
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Edit contact, motto, or mission
                    </span>
                  </div>
                </button>

                {isSuperAdmin ? (
                  <button
                    onClick={() => setActiveTab('replacement')}
                    className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 transition text-left cursor-pointer flex items-start gap-3"
                  >
                    <UserMinus className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">
                        Staff Succession Wizard
                      </span>
                      <span className="text-[11px] text-slate-600">
                        Replace departing administrator
                      </span>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition text-left cursor-pointer flex items-start gap-3"
                  >
                    <Mail className="w-5 h-5 text-blue-900 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">
                        Public Inquiries
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Review & manage parent inquiries
                      </span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: NEWS & ANNOUNCEMENTS MANAGEMENT                     */}
        {/* ========================================================= */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  News & Announcements Repository
                </h3>
                <p className="text-xs text-slate-500">
                  Manage official bulletins, exam reporting dates, achievements, and drafts.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingAnn({
                    title: { en: '', rw: '', fr: '' },
                    summary: { en: '', rw: '', fr: '' },
                    content: { en: '', rw: '', fr: '' },
                    type: 'announcement',
                    isImportant: false,
                    isPublished: true,
                    publishedAt: new Date().toISOString()
                  });
                  setShowAnnModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Announcement</span>
              </button>
            </div>

            {/* Search & Status Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search announcements by title or content..."
                  value={annSearch}
                  onChange={(e) => setAnnSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-900"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setAnnFilter('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    annFilter === 'all'
                      ? 'bg-blue-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  All ({announcements.length})
                </button>
                <button
                  onClick={() => setAnnFilter('published')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    annFilter === 'published'
                      ? 'bg-blue-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  Published ({stats.publishedAnnouncements})
                </button>
                <button
                  onClick={() => setAnnFilter('draft')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    annFilter === 'draft'
                      ? 'bg-blue-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  Drafts ({stats.draftAnnouncements})
                </button>
              </div>
            </div>

            {/* Announcements Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">Title & Type</th>
                      <th className="py-3 px-4">Publication Date</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAnnouncements.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No announcements match the criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredAnnouncements.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 max-w-md line-clamp-1">
                              {item.title.en}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="capitalize font-semibold text-blue-900">
                                {item.type}
                              </span>
                              {item.isImportant && (
                                <span className="text-amber-700 font-bold">★ Urgent</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {new Date(item.publishedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {item.authorName}
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleTogglePublishAnnouncement(item)}
                              className={`px-2.5 py-1 rounded-md font-bold text-[11px] cursor-pointer ${
                                item.isPublished
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                              title="Click to toggle publish status"
                            >
                              {item.isPublished ? '● Published' : '○ Draft'}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingAnn(item);
                                setShowAnnModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setAnnouncementToDelete(item)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold cursor-pointer"
                              title="Delete announcement permanently"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}



        {/* ========================================================= */}
        {/* TAB 3: SCHOOL INFO MANAGEMENT                             */}
        {/* ========================================================= */}
        {activeTab === 'school_info' && schoolInfo && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs max-w-4xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-950">
                Official School Profile & Institutional Identity
              </h3>
              <p className="text-xs text-slate-500">
                Changes saved here update the public Home, About, and Contact pages in real time.
              </p>
            </div>

            <form onSubmit={handleUpdateSchoolInfo} className="space-y-6 text-xs">
              {/* School Logo Photo Management */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#0c2340]">
                      Official School Logo Photo
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Upload your school emblem or badge photo to display in the header, footer, and school crest.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSchoolInfo({ ...schoolInfo, logoUrl: '/gsfak_logo.jpg' });
                      localStorage.removeItem('gsfak_school_logo');
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Default</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-white border-2 border-slate-200 p-1 shadow-sm overflow-hidden flex items-center justify-center">
                      <img
                        src={schoolInfo.logoUrl || '/gsfak_logo.jpg'}
                        alt="Current School Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="w-20 h-20 rounded-full bg-white border-2 border-slate-200 p-1 shadow-sm overflow-hidden flex items-center justify-center">
                      <img
                        src={schoolInfo.logoUrl || '/gsfak_logo.jpg'}
                        alt="Current School Logo Circle"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="flex-1 w-full">
                    <AdminImageUploader
                      label="Upload Logo from Computer"
                      currentImageUrl={schoolInfo.logoUrl}
                      onImageUploaded={(url) => {
                        setSchoolInfo({ ...schoolInfo, logoUrl: url });
                        localStorage.setItem('gsfak_school_logo', url);
                      }}
                      token={token}
                      folder="branding"
                      aspectRatio="square"
                      buttonLabel="Choose Logo from Computer"
                      helperText="Select a PNG, JPG, or WebP file from your computer. Click 'Save & Publish Changes' below to apply."
                    />
                  </div>
                </div>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Official School Name
                  </label>
                  <input
                    type="text"
                    value={schoolInfo.name}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Acronym / Code
                  </label>
                  <input
                    type="text"
                    value={schoolInfo.acronym}
                    onChange={(e) => setSchoolInfo({ ...schoolInfo, acronym: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Motto (Trilingual) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm">School Motto (Motto)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">English</label>
                    <input
                      type="text"
                      value={schoolInfo.motto.en}
                      onChange={(e) =>
                        setSchoolInfo({
                          ...schoolInfo,
                          motto: { ...schoolInfo.motto, en: e.target.value }
                        })
                      }
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Ikinyarwanda</label>
                    <input
                      type="text"
                      value={schoolInfo.motto.rw}
                      onChange={(e) =>
                        setSchoolInfo({
                          ...schoolInfo,
                          motto: { ...schoolInfo.motto, rw: e.target.value }
                        })
                      }
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Français</label>
                    <input
                      type="text"
                      value={schoolInfo.motto.fr}
                      onChange={(e) =>
                        setSchoolInfo({
                          ...schoolInfo,
                          motto: { ...schoolInfo.motto, fr: e.target.value }
                        })
                      }
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Mission Statement */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-900 mb-1">
                  Institutional Mission Statement (English)
                </label>
                <textarea
                  rows={3}
                  value={schoolInfo.mission.en}
                  onChange={(e) =>
                    setSchoolInfo({
                      ...schoolInfo,
                      mission: { ...schoolInfo.mission, en: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-900 focus:outline-none"
                />
              </div>

              {/* Vision Statement */}
              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Institutional Vision Statement (English)
                </label>
                <textarea
                  rows={3}
                  value={schoolInfo.vision.en}
                  onChange={(e) =>
                    setSchoolInfo({
                      ...schoolInfo,
                      vision: { ...schoolInfo.vision, en: e.target.value }
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-900 focus:outline-none"
                />
              </div>

              {/* Contacts */}
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">Official Contact Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Primary Telephone
                    </label>
                    <input
                      type="text"
                      value={schoolInfo.contact.phonePrimary}
                      onChange={(e) =>
                        setSchoolInfo({
                          ...schoolInfo,
                          contact: { ...schoolInfo.contact, phonePrimary: e.target.value }
                        })
                      }
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Official Email
                    </label>
                    <input
                      type="email"
                      value={schoolInfo.contact.emailOfficial}
                      onChange={(e) =>
                        setSchoolInfo({
                          ...schoolInfo,
                          contact: { ...schoolInfo.contact, emailOfficial: e.target.value }
                        })
                      }
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Office Working Hours
                    </label>
                    <input
                      type="text"
                      value={schoolInfo.contact.officeHours}
                      onChange={(e) =>
                        setSchoolInfo({
                          ...schoolInfo,
                          contact: { ...schoolInfo.contact, officeHours: e.target.value }
                        })
                      }
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <AdminImageUploader
                      label="Hero Banner Image"
                      currentImageUrl={schoolInfo.heroImageUrl}
                      onImageUploaded={(url) => {
                        setSchoolInfo({ ...schoolInfo, heroImageUrl: url });
                      }}
                      token={token}
                      folder="branding"
                      aspectRatio="wide"
                      buttonLabel="Choose Banner Image from Computer"
                      helperText="Select a landscape photo from your computer (JPG, PNG, or WebP) for the banner. Click 'Save & Publish Changes' below to apply."
                    />
                  </div>
                </div>
              </div>

              {/* Institutional History / About Story */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="block font-bold text-slate-900 text-sm">
                  About School / Institutional Heritage Story (English)
                </label>
                <textarea
                  rows={4}
                  value={schoolInfo.aboutStory?.en || ''}
                  onChange={(e) =>
                    setSchoolInfo({
                      ...schoolInfo,
                      aboutStory: {
                        en: e.target.value,
                        rw: schoolInfo.aboutStory?.rw || e.target.value,
                        fr: schoolInfo.aboutStory?.fr || e.target.value
                      }
                    })
                  }
                  placeholder="Enter the official school heritage narrative shown on the About Us page..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-900 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Core Values Section */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Institutional Core Values</h4>
                    <p className="text-[11px] text-slate-500">
                      Displayed on the homepage and about page.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {(schoolInfo.coreValues || []).map((val, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Value Name (English)
                        </label>
                        <input
                          type="text"
                          value={val.name?.en || ''}
                          onChange={(e) => {
                            const updated = [...(schoolInfo.coreValues || [])];
                            updated[idx] = {
                              ...updated[idx],
                              name: { ...updated[idx].name, en: e.target.value, rw: updated[idx].name?.rw || e.target.value, fr: updated[idx].name?.fr || e.target.value }
                            };
                            setSchoolInfo({ ...schoolInfo, coreValues: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Value Description (English)
                        </label>
                        <input
                          type="text"
                          value={val.description?.en || ''}
                          onChange={(e) => {
                            const updated = [...(schoolInfo.coreValues || [])];
                            updated[idx] = {
                              ...updated[idx],
                              description: { ...updated[idx].description, en: e.target.value, rw: updated[idx].description?.rw || e.target.value, fr: updated[idx].description?.fr || e.target.value }
                            };
                            setSchoolInfo({ ...schoolInfo, coreValues: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Academic Streams / Combinations */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Academic Combinations & Streams</h4>
                    <p className="text-[11px] text-slate-500">
                      Official secondary education curricula and combinations offered at GSFAK.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {(schoolInfo.academicStreams || []).map((stream, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Code (e.g. MPC)
                        </label>
                        <input
                          type="text"
                          value={stream.code}
                          onChange={(e) => {
                            const updated = [...(schoolInfo.academicStreams || [])];
                            updated[idx] = { ...updated[idx], code: e.target.value };
                            setSchoolInfo({ ...schoolInfo, academicStreams: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Combination Name
                        </label>
                        <input
                          type="text"
                          value={stream.name}
                          onChange={(e) => {
                            const updated = [...(schoolInfo.academicStreams || [])];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            setSchoolInfo({ ...schoolInfo, academicStreams: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={stream.description}
                          onChange={(e) => {
                            const updated = [...(schoolInfo.academicStreams || [])];
                            updated[idx] = { ...updated[idx], description: e.target.value };
                            setSchoolInfo({ ...schoolInfo, academicStreams: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Google Maps Location Configuration */}
              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-4">
                <div>
                  <h4 className="font-bold text-[#0c2340] text-sm">
                    Google Maps Location & Embed Settings
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Controls the interactive campus map displayed on the public Contact Us page. You can easily paste any Google Maps embed link or custom destination URL.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Google Maps Embed URL or &lt;iframe&gt; code
                    </label>
                    <input
                      type="text"
                      placeholder="https://maps.google.com/maps?q=... or <iframe src='...'></iframe>"
                      value={schoolInfo.location?.mapEmbedUrl || ''}
                      onChange={(e) => {
                        let val = e.target.value.trim();
                        const match = val.match(/src=["']([^"']+)["']/i);
                        if (match && match[1]) {
                          val = match[1];
                        }
                        setSchoolInfo({
                          ...schoolInfo,
                          location: {
                            ...schoolInfo.location,
                            mapEmbedUrl: val
                          }
                        });
                      }}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-mono text-[11px] text-slate-800"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Default: Official location of Groupe Scolaire Frank Adamson de Kibogora in Kibogora, Kanjongo Sector, Nyamasheke, Western Province, Rwanda.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      "Get Directions" Navigation URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://www.google.com/maps/dir/?api=1&destination=..."
                      value={schoolInfo.location?.directionsUrl || ''}
                      onChange={(e) =>
                        setSchoolInfo({
                          ...schoolInfo,
                          location: {
                            ...schoolInfo.location,
                            directionsUrl: e.target.value.trim()
                          }
                        })
                      }
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-mono text-[11px] text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Publish Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: GALLERY MANAGEMENT                                 */}
        {/* ========================================================= */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  School Image Archives & Gallery
                </h3>
                <p className="text-xs text-slate-500">
                  Add, replace, caption, and organize photos for public presentation.
                </p>
              </div>

              <button
                onClick={() => setShowGalleryModal(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Upload / Add Image</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <img
                      src={item.imageUrl}
                      alt={item.title.en}
                      referrerPolicy="no-referrer"
                      className="w-full h-44 object-cover"
                    />
                    <div className="p-4">
                      <span className="text-[11px] font-bold text-blue-900 uppercase">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1">
                        {item.title.en}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {item.caption.en}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 pt-0 flex justify-between items-center text-xs">
                    <span className="text-slate-400">
                      {new Date(item.uploadedAt).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPhotoToDelete(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 font-bold text-xs transition shadow-2xs cursor-pointer"
                      title="Delete this photo from school archives"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: STAFF & ACTIVITIES                                 */}
        {/* ========================================================= */}
        {activeTab === 'staff_activities' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Staff Profiles & Leadership Module
                </h3>
                <p className="text-xs text-slate-500">
                  Manage leadership positions and placeholders without hardcoded changes.
                </p>
              </div>

              <button
                onClick={() => setShowStaffModal(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Staff Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <img
                        src={member.photoUrl}
                        alt={member.fullName}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm truncate">
                            {member.fullName}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              member.category === 'leader'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-blue-50 text-blue-800'
                            }`}
                          >
                            {member.category === 'leader' ? 'Leader' : 'Teacher'}
                          </span>
                        </div>
                        <p className="text-xs text-blue-900 font-semibold truncate">
                          {member.title.en}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {member.department}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                      <p>
                        <span className="font-semibold">Qualification:</span>{' '}
                        {member.qualification || 'N/A'}
                      </p>
                      <p>
                        <span className="font-semibold">Email:</span>{' '}
                        {member.emailPlaceholder || 'N/A'}
                      </p>
                      {member.category === 'teacher' && (
                        <p className="text-[11px] text-slate-400 italic">
                          Public site rule: Only name and photograph are shown publicly.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingStaffMember(member)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStaffToDelete(member)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition cursor-pointer"
                      title="Delete this staff member"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: CONTACT INQUIRIES                                  */}
        {/* ========================================================= */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-950">
                Contact Messages & Inquiries Repository
              </h3>
              <p className="text-xs text-slate-500">
                Messages submitted by parents, students, and community members through the public Contact page.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="divide-y divide-slate-100 text-xs">
                {messages.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    No inquiries submitted yet.
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="p-6 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <span className="font-bold text-slate-900 text-sm">
                            {msg.subject}
                          </span>
                          <span className="text-slate-400 mx-2">·</span>
                          <span className="text-slate-600">
                            From: {msg.senderName} ({msg.senderEmail}
                            {msg.senderPhone ? ` / ${msg.senderPhone}` : ''})
                          </span>
                        </div>
                        <span className="text-slate-400 whitespace-nowrap">
                          {new Date(msg.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-700 bg-slate-50 p-4 rounded-xl leading-relaxed">
                        {msg.message}
                      </p>
                      {msg.notes && (
                        <p className="text-amber-800 text-[11px] italic">
                          Admin Notes: {msg.notes}
                        </p>
                      )}

                      {/* Action Strip: Status & Permanent Delete */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                              msg.status === 'unread'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {msg.status === 'unread' ? '● Unread Inquiry' : '✓ Read'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setMessageToDelete(msg)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition cursor-pointer shadow-2xs"
                            title="Permanently delete this message from database"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delete Message</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: ADMINISTRATOR ACCOUNTS MANAGEMENT                  */}
        {/* ========================================================= */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Administrator Accounts & Role Access
                </h3>
                <p className="text-xs text-slate-500">
                  Super Administrator vs Content Administrator privileges with instant session revocation.
                </p>
              </div>

              {isSuperAdmin && (
                <button
                  onClick={() => setShowNewAdminModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Administrator Account</span>
                </button>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-bold">
                      <th className="py-3 px-4">Administrator</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Last Login</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminUsers.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {a.fullName}
                          {a.notes && (
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {a.notes}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{a.email}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                              a.role === 'super_admin'
                                ? 'bg-purple-100 text-purple-900'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {a.role === 'super_admin' ? 'Super Admin' : 'Content Admin'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-bold text-[11px] ${
                              a.isActive ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            ● {a.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString() : 'Never'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {(isSuperAdmin || a.id === currentAdmin.id) && (
                              <button
                                type="button"
                                onClick={() => setEditingAdminUser(a)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer inline-flex items-center gap-1"
                                title="Edit administrator details"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                            )}

                            {isSuperAdmin && a.id !== currentAdmin.id && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleToggleAdminStatus(a.id, a.isActive)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                                    a.isActive
                                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                                  }`}
                                  title={a.isActive ? 'Deactivate account' : 'Reactivate account'}
                                >
                                  {a.isActive ? 'Deactivate' : 'Reactivate'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAdminToDelete(a)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer inline-flex items-center gap-1"
                                  title="Delete administrator account"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Delete</span>
                                </button>
                              </>
                            )}

                            {a.id === currentAdmin.id && (
                              <span className="text-slate-400 italic text-[11px] px-2 py-1">
                                (Your Account)
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: STAFF SUCCESSION & REPLACEMENT WIZARD (CRITICAL)   */}
        {/* ========================================================= */}
        {activeTab === 'replacement' && isSuperAdmin && (
          <div className="bg-white border border-amber-200 rounded-3xl p-8 sm:p-10 shadow-xs max-w-3xl mx-auto space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl shrink-0">
                ★
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-950">
                  Staff Succession & Administrator Replacement Wizard
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Required procedure when an administrator leaves GS FAKIBOGORA, changes duties, or is replaced by another employee.
                </p>
              </div>
            </div>

            {/* Protocol Notice */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 leading-relaxed space-y-2">
              <p className="font-bold">Institutional Security Standard:</p>
              <p>
                Passwords belonging to former employees must NEVER be transferred to replacements.
                This automated wizard creates a fresh verified account for the successor, assigns formal permissions, deactivates the predecessor account, and immediately revokes all active sessions with an audit trail entry.
              </p>
            </div>

            <form onSubmit={handleExecuteReplacement} className="space-y-4 text-xs">
              {/* Predecessor Selector */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  1. Select Departing Administrator to Replace *
                </label>
                <select
                  required
                  value={replacementForm.predecessorId}
                  onChange={(e) =>
                    setReplacementForm({ ...replacementForm, predecessorId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-900 focus:outline-none"
                >
                  <option value="">-- Choose Departing Administrator --</option>
                  {adminUsers
                    .filter((a) => a.id !== currentAdmin.id && a.isActive)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.fullName} ({a.email}) — [{a.role}]
                      </option>
                    ))}
                </select>
              </div>

              {/* Successor Details */}
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <span className="font-bold text-slate-900 block">
                  2. Successor / Replacement Employee Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Successor Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Emmanuel Habimana"
                      value={replacementForm.replacementFullName}
                      onChange={(e) =>
                        setReplacementForm({
                          ...replacementForm,
                          replacementFullName: e.target.value
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Successor Official Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g., e.habimana@gsfakibogora.rw"
                      value={replacementForm.replacementEmail}
                      onChange={(e) =>
                        setReplacementForm({
                          ...replacementForm,
                          replacementEmail: e.target.value
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Assign Administrative Role *
                    </label>
                    <select
                      value={replacementForm.replacementRole}
                      onChange={(e) =>
                        setReplacementForm({
                          ...replacementForm,
                          replacementRole: e.target.value as any
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    >
                      <option value="content_admin">Content Administrator</option>
                      <option value="super_admin">Super Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Initial Temporary Password *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Minimum 8 characters"
                      value={replacementForm.replacementPassword}
                      onChange={(e) =>
                        setReplacementForm({
                          ...replacementForm,
                          replacementPassword: e.target.value
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Transition / Handover Reason Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Former communications officer transferred to district education board."
                    value={replacementForm.reasonNotes}
                    onChange={(e) =>
                      setReplacementForm({
                        ...replacementForm,
                        reasonNotes: e.target.value
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Execute Staff Succession & Revoke Predecessor</span>
                </button>
              </div>
            </form>
          </div>
        )}


      </div>

      {/* ========================================================= */}
      {/* MODAL: CREATE / EDIT ANNOUNCEMENT                         */}
      {/* ========================================================= */}
      {showAnnModal && editingAnn && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-950 text-base">
                {editingAnn.id ? 'Edit Announcement' : 'Create New Announcement'}
              </h3>
              <button
                onClick={() => setShowAnnModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={editingAnn.title?.en || ''}
                  onChange={(e) =>
                    setEditingAnn({
                      ...editingAnn,
                      title: {
                        en: e.target.value,
                        rw: editingAnn.title?.rw || e.target.value,
                        fr: editingAnn.title?.fr || e.target.value
                      }
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={editingAnn.type || 'announcement'}
                  onChange={(e) =>
                    setEditingAnn({ ...editingAnn, type: e.target.value as any })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="announcement">Official Announcement</option>
                  <option value="news">News Article</option>
                  <option value="academic">Academic Schedule</option>
                  <option value="event">School Event</option>
                </select>
              </div>

              {/* Direct Image Upload for Announcement */}
              <AdminImageUploader
                label="Featured Announcement Photograph"
                currentImageUrl={editingAnn.imageUrl}
                onImageUploaded={(url) => setEditingAnn({ ...editingAnn, imageUrl: url })}
                onImageRemoved={() => setEditingAnn({ ...editingAnn, imageUrl: '' })}
                token={token}
                folder="announcements"
                aspectRatio="video"
                buttonLabel="Choose Image from Computer"
                helperText="Select a picture from your computer (JPG, PNG, or WebP) to feature with this notice."
              />

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Summary / Brief (English) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingAnn.summary?.en || ''}
                  onChange={(e) =>
                    setEditingAnn({
                      ...editingAnn,
                      summary: {
                        en: e.target.value,
                        rw: editingAnn.summary?.rw || e.target.value,
                        fr: editingAnn.summary?.fr || e.target.value
                      }
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Announcement Content (English) *
                </label>
                <textarea
                  rows={5}
                  required
                  value={editingAnn.content?.en || ''}
                  onChange={(e) =>
                    setEditingAnn({
                      ...editingAnn,
                      content: {
                        en: e.target.value,
                        rw: editingAnn.content?.rw || e.target.value,
                        fr: editingAnn.content?.fr || e.target.value
                      }
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingAnn.isPublished ?? true}
                    onChange={(e) =>
                      setEditingAnn({ ...editingAnn, isPublished: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span>Publish immediately to public site</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-amber-800">
                  <input
                    type="checkbox"
                    checked={editingAnn.isImportant ?? false}
                    onChange={(e) =>
                      setEditingAnn({ ...editingAnn, isImportant: e.target.checked })
                    }
                    className="rounded"
                  />
                  <span>Mark as Urgent / Important Banner</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 text-white font-bold cursor-pointer"
                >
                  Save Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================= */}
      {/* MODAL: CONFIRM ANNOUNCEMENT DELETION                      */}
      {/* ========================================================= */}
      {announcementToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-slate-950 text-base">Delete Announcement</h3>
              </div>
              <button
                type="button"
                disabled={isDeletingAnn}
                onClick={() => setAnnouncementToDelete(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">
                Are you sure you want to permanently delete this announcement?
              </p>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3">
                {announcementToDelete.imageUrl && (
                  <img
                    src={announcementToDelete.imageUrl}
                    alt={announcementToDelete.title.en}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                )}
                <div className="overflow-hidden">
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {announcementToDelete.title.en}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span className="capitalize px-1.5 py-0.5 rounded bg-slate-200 font-semibold text-slate-700">
                      {announcementToDelete.type}
                    </span>
                    <span>•</span>
                    <span>{new Date(announcementToDelete.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                <strong>Permanent Deletion:</strong> This item will be removed immediately from the database and public school website. It will not return after page refresh or logout.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                disabled={isDeletingAnn}
                onClick={() => setAnnouncementToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingAnn}
                onClick={() => handleDeleteAnnouncement(announcementToDelete)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingAnn ? 'Deleting...' : 'Yes, Delete Announcement'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD GALLERY IMAGE                                  */}
      {/* ========================================================= */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-950 text-base">Upload to School Gallery</h3>
              <button
                onClick={() => setShowGalleryModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddGalleryItem} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Senior 5 Chemistry Laboratory Session"
                  value={newGalleryItem.titleEn}
                  onChange={(e) =>
                    setNewGalleryItem({ ...newGalleryItem, titleEn: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={newGalleryItem.category}
                  onChange={(e) =>
                    setNewGalleryItem({ ...newGalleryItem, category: e.target.value as any })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="campus">Campus Grounds & Buildings</option>
                  <option value="labs">Science Laboratories</option>
                  <option value="academics">Classrooms & Library</option>
                  <option value="sports">Athletics & Sports Grounds</option>
                  <option value="events">Cultural & Official Events</option>
                </select>
              </div>

              <AdminImageUploader
                label="Gallery Photograph File"
                required
                currentImageUrl={newGalleryItem.imageUrl}
                onImageUploaded={(url) => {
                  setNewGalleryItem((prev) => ({
                    ...prev,
                    imageUrl: url
                  }));
                }}
                onImageRemoved={() => setNewGalleryItem((prev) => ({ ...prev, imageUrl: '' }))}
                token={token}
                folder="gallery"
                aspectRatio="video"
                buttonLabel="Choose Image from Computer"
                helperText="Select a photograph from your computer (JPG, PNG, or WebP). It will be saved permanently in the school gallery archive."
              />

              <div>
                <label className="block font-bold text-slate-700 mb-1">Caption / Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief explanatory caption..."
                  value={newGalleryItem.captionEn}
                  onChange={(e) =>
                    setNewGalleryItem({ ...newGalleryItem, captionEn: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowGalleryModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingPhoto}
                  className="px-5 py-2 rounded-xl bg-blue-900 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  Add to Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CONFIRM PHOTO DELETION                             */}
      {/* ========================================================= */}
      {photoToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-slate-950 text-base">Confirm Photo Deletion</h3>
              </div>
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                disabled={isDeletingPhoto}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">
                Are you sure you want to delete this photo?
              </p>

              <div className="flex gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <img
                  src={photoToDelete.imageUrl}
                  alt={photoToDelete.title.en}
                  className="w-20 h-16 object-cover rounded-xl shrink-0 border border-slate-200"
                />
                <div className="overflow-hidden">
                  <span className="text-[10px] font-bold text-blue-900 uppercase">
                    {photoToDelete.category}
                  </span>
                  <p className="font-bold text-slate-900 text-xs truncate">
                    {photoToDelete.title.en}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {photoToDelete.caption.en || 'No description provided'}
                  </p>
                </div>
              </div>

              <p className="text-slate-500 text-xs leading-relaxed">
                If this photo was uploaded to the server, its file will be removed from storage and its record will be permanently deleted from the school database.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                disabled={isDeletingPhoto}
                onClick={() => setPhotoToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingPhoto}
                onClick={() => handleDeleteGalleryItem(photoToDelete)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingPhoto ? 'Deleting...' : 'Yes, Delete Photo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD STAFF PROFILE                                  */}
      {/* ========================================================= */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-slate-950 text-base">Add Staff Member</h3>
              <button
                type="button"
                onClick={() => setShowStaffModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStaffMember} className="space-y-4">
              {/* Category Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Staff Category *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                      newStaffMember.category === 'teacher'
                        ? 'border-blue-900 bg-blue-50/70 text-blue-950 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="staffCategory"
                      value="teacher"
                      checked={newStaffMember.category === 'teacher'}
                      onChange={() =>
                        setNewStaffMember({
                          ...newStaffMember,
                          category: 'teacher',
                          department: 'Teaching Faculty',
                          titleEn: newStaffMember.titleEn || 'Teacher'
                        })
                      }
                      className="text-blue-900"
                    />
                    <span>Teacher</span>
                  </label>
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                      newStaffMember.category === 'leader'
                        ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="staffCategory"
                      value="leader"
                      checked={newStaffMember.category === 'leader'}
                      onChange={() =>
                        setNewStaffMember({
                          ...newStaffMember,
                          category: 'leader',
                          department: 'School Administration',
                          titleEn: newStaffMember.titleEn === 'Teacher' ? 'School Leader' : newStaffMember.titleEn
                        })
                      }
                      className="text-amber-600"
                    />
                    <span>School Leader</span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {newStaffMember.category === 'teacher'
                    ? 'Public Display Rule: For teachers, ONLY their name and photograph appear on the public website.'
                    : 'Public Display Rule: For school leaders, their name, photograph, and official role/position appear publicly.'}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Jean-Paul Ndayisaba"
                  value={newStaffMember.fullName}
                  onChange={(e) =>
                    setNewStaffMember({ ...newStaffMember, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {newStaffMember.category === 'leader'
                    ? 'Official Role / Position Title *'
                    : 'Subject / Teaching Specialization'}
                </label>
                <input
                  type="text"
                  required={newStaffMember.category === 'leader'}
                  placeholder={
                    newStaffMember.category === 'leader'
                      ? 'e.g., Dean of Discipline (DOD) or Head Teacher'
                      : 'e.g., Mathematics & Physics Teacher'
                  }
                  value={newStaffMember.titleEn}
                  onChange={(e) =>
                    setNewStaffMember({ ...newStaffMember, titleEn: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              {/* Direct Image Upload for Staff */}
              <AdminImageUploader
                label="Staff Photograph"
                currentImageUrl={newStaffMember.photoUrl}
                onImageUploaded={(url) => {
                  setNewStaffMember((prev) => ({ ...prev, photoUrl: url }));
                }}
                onImageRemoved={() => setNewStaffMember((prev) => ({ ...prev, photoUrl: '' }))}
                token={token}
                folder="staff"
                aspectRatio="square"
                buttonLabel="Choose Staff Photo from Computer"
                helperText="Select a portrait photo (JPG, PNG, or WebP) from your computer. For teachers, only name and photo are visible on the public site."
              />

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g., Mathematics & Physical Sciences Directorate"
                  value={newStaffMember.department}
                  onChange={(e) =>
                    setNewStaffMember({ ...newStaffMember, department: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Academic Qualification (Internal Records)
                </label>
                <input
                  type="text"
                  placeholder="e.g., B.Ed. in Physical Sciences"
                  value={newStaffMember.qualification}
                  onChange={(e) =>
                    setNewStaffMember({ ...newStaffMember, qualification: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Contact / Institutional Email
                </label>
                <input
                  type="text"
                  placeholder="staff@gsfakibogora.rw"
                  value={newStaffMember.emailPlaceholder}
                  onChange={(e) =>
                    setNewStaffMember({ ...newStaffMember, emailPlaceholder: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingStaffPhoto}
                  className="px-5 py-2 rounded-xl bg-blue-900 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT STAFF PROFILE                                 */}
      {/* ========================================================= */}
      {editingStaffMember && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="font-bold text-slate-950 text-base">Edit Staff Member</h3>
              <button
                type="button"
                onClick={() => setEditingStaffMember(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStaffMember} className="space-y-4">
              {/* Category Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Staff Category *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                      editingStaffMember.category === 'teacher'
                        ? 'border-blue-900 bg-blue-50/70 text-blue-950 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="editStaffCategory"
                      value="teacher"
                      checked={editingStaffMember.category === 'teacher'}
                      onChange={() =>
                        setEditingStaffMember({
                          ...editingStaffMember,
                          category: 'teacher'
                        })
                      }
                      className="text-blue-900"
                    />
                    <span>Teacher</span>
                  </label>
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                      editingStaffMember.category === 'leader'
                        ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="editStaffCategory"
                      value="leader"
                      checked={editingStaffMember.category === 'leader'}
                      onChange={() =>
                        setEditingStaffMember({
                          ...editingStaffMember,
                          category: 'leader'
                        })
                      }
                      className="text-amber-600"
                    />
                    <span>School Leader</span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {editingStaffMember.category === 'teacher'
                    ? 'Public Display Rule: For teachers, ONLY their name and photograph appear on the public website.'
                    : 'Public Display Rule: For school leaders, their name, photograph, and official role appear publicly.'}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingStaffMember.fullName}
                  onChange={(e) =>
                    setEditingStaffMember({
                      ...editingStaffMember,
                      fullName: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Official Role / Position Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingStaffMember.title.en}
                  onChange={(e) =>
                    setEditingStaffMember({
                      ...editingStaffMember,
                      title: {
                        ...editingStaffMember.title,
                        en: e.target.value,
                        rw: editingStaffMember.title.rw || e.target.value,
                        fr: editingStaffMember.title.fr || e.target.value
                      }
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              {/* Direct Image Upload for Staff Replacement */}
              <AdminImageUploader
                label="Staff Photograph & Replacement"
                currentImageUrl={editingStaffMember.photoUrl}
                onImageUploaded={(url) => {
                  setEditingStaffMember((prev) => prev ? ({ ...prev, photoUrl: url }) : null);
                }}
                onImageRemoved={() => setEditingStaffMember((prev) => prev ? ({ ...prev, photoUrl: '' }) : null)}
                token={token}
                folder="staff"
                aspectRatio="square"
                buttonLabel="Choose New Photo from Computer"
                helperText="Select a replacement portrait photo (JPG, PNG, or WebP) from your computer. The image is immediately updated upon saving."
              />

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={editingStaffMember.department}
                  onChange={(e) =>
                    setEditingStaffMember({
                      ...editingStaffMember,
                      department: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Academic Qualification
                </label>
                <input
                  type="text"
                  value={editingStaffMember.qualification}
                  onChange={(e) =>
                    setEditingStaffMember({
                      ...editingStaffMember,
                      qualification: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Contact Placeholder
                </label>
                <input
                  type="text"
                  value={editingStaffMember.emailPlaceholder}
                  onChange={(e) =>
                    setEditingStaffMember({
                      ...editingStaffMember,
                      emailPlaceholder: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setEditingStaffMember(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingStaffPhoto}
                  className="px-5 py-2 rounded-xl bg-blue-900 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CONFIRM STAFF DELETION                             */}
      {/* ========================================================= */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-slate-950 text-base">Confirm Staff Deletion</h3>
              </div>
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                disabled={isDeletingStaff}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">
                Are you sure you want to delete this staff member?
              </p>

              <div className="flex gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <img
                  src={staffToDelete.photoUrl}
                  alt={staffToDelete.fullName}
                  className="w-16 h-16 object-cover rounded-xl shrink-0 border border-slate-200"
                />
                <div className="overflow-hidden">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      staffToDelete.category === 'leader'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-blue-50 text-blue-800'
                    }`}
                  >
                    {staffToDelete.category === 'leader' ? 'School Leader' : 'Teacher'}
                  </span>
                  <p className="font-bold text-slate-900 text-sm truncate mt-1">
                    {staffToDelete.fullName}
                  </p>
                  <p className="text-[11px] text-blue-900 font-semibold truncate">
                    {staffToDelete.title.en}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {staffToDelete.department}
                  </p>
                </div>
              </div>

              <p className="text-slate-500 text-xs leading-relaxed">
                Deleting this staff member will remove their profile immediately from the administration dashboard and the public website. Any uploaded image file managed by this application will be securely cleaned up.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                disabled={isDeletingStaff}
                onClick={() => setStaffToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingStaff}
                onClick={() => handleConfirmDeleteStaff(staffToDelete)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingStaff ? 'Deleting...' : 'Yes, Delete Staff Member'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT ADMINISTRATOR ACCOUNT                         */}
      {/* ========================================================= */}
      {editingAdminUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-950 text-base">Edit Administrator Account</h3>
              <button
                type="button"
                onClick={() => setEditingAdminUser(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateAdmin} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingAdminUser.fullName}
                  onChange={(e) =>
                    setEditingAdminUser({ ...editingAdminUser, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editingAdminUser.email}
                  onChange={(e) =>
                    setEditingAdminUser({ ...editingAdminUser, email: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              {isSuperAdmin && editingAdminUser.id !== currentAdmin.id && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Administrative Role *
                  </label>
                  <select
                    value={editingAdminUser.role}
                    onChange={(e) =>
                      setEditingAdminUser({
                        ...editingAdminUser,
                        role: e.target.value as any
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="content_admin">Content Administrator</option>
                    <option value="super_admin">Super Administrator</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Administrative Notes / Position
                </label>
                <input
                  type="text"
                  placeholder="e.g., Head of IT & Communications"
                  value={editingAdminUser.notes || ''}
                  onChange={(e) =>
                    setEditingAdminUser({ ...editingAdminUser, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingAdminUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 text-white font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CONFIRM ADMINISTRATOR DELETION                      */}
      {/* ========================================================= */}
      {adminToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-slate-950 text-base">Delete Administrator Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setAdminToDelete(null)}
                disabled={isDeletingAdmin}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">
                Are you sure you want to delete this administrator account?
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900 text-sm">
                  {adminToDelete.fullName}
                </p>
                <p className="text-slate-600 text-xs">
                  {adminToDelete.email}
                </p>
                <span
                  className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] mt-1 ${
                    adminToDelete.role === 'super_admin'
                      ? 'bg-purple-100 text-purple-900'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {adminToDelete.role === 'super_admin' ? 'Super Administrator' : 'Content Administrator'}
                </span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                <strong>Security Protection:</strong> You cannot delete your own account, and the system strictly prevents deleting the last active administrator or last super administrator.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                disabled={isDeletingAdmin}
                onClick={() => setAdminToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingAdmin}
                onClick={() => handleDeleteAdmin(adminToDelete)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingAdmin ? 'Deleting...' : 'Yes, Delete Account'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE ADMIN ACCOUNT                               */}
      {/* ========================================================= */}
      {showNewAdminModal && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-950 text-base">New Administrator Account</h3>
              <button
                onClick={() => setShowNewAdminModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Claudine Mukamana"
                  value={newAdminForm.fullName}
                  onChange={(e) =>
                    setNewAdminForm({ ...newAdminForm, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="c.mukamana@gsfakibogora.rw"
                  value={newAdminForm.email}
                  onChange={(e) =>
                    setNewAdminForm({ ...newAdminForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Administrative Role *
                </label>
                <select
                  value={newAdminForm.role}
                  onChange={(e) =>
                    setNewAdminForm({ ...newAdminForm, role: e.target.value as any })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="content_admin">Content Administrator</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Temporary Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={newAdminForm.password}
                  onChange={(e) =>
                    setNewAdminForm({ ...newAdminForm, password: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewAdminModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 text-white font-bold cursor-pointer"
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CHANGE OWN PASSWORD (WITH DIRECT FEEDBACK)          */}
      {/* ========================================================= */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-950 text-base">Change Administrator Password</h3>
              <button
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setPasswordChangeError('');
                  setPasswordChangeSuccess('');
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* DIRECT RESPONSE: Success banner */}
            {passwordChangeSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span className="font-bold">{passwordChangeSuccess}</span>
              </div>
            )}

            {/* DIRECT RESPONSE: Error banner */}
            {passwordChangeError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="font-bold">{passwordChangeError}</span>
              </div>
            )}

            <form onSubmit={handleChangeMyPassword} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none ${
                    passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                      ? 'border-rose-400 focus:border-rose-500'
                      : passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword
                      ? 'border-emerald-400 focus:border-emerald-500'
                      : 'border-slate-300 focus:border-blue-900'
                  }`}
                />

                {/* DIRECT REAL-TIME FEEDBACK */}
                {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="mt-1.5 text-xs font-bold text-rose-600 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Passwords are different. Please ensure both passwords match.</span>
                  </p>
                )}
                {passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword && (
                  <p className="mt-1.5 text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Passwords match.</span>
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setPasswordChangeError('');
                    setPasswordChangeSuccess('');
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordForm.confirmPassword ? passwordForm.newPassword !== passwordForm.confirmPassword : false}
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold cursor-pointer transition shadow-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CONFIRM PERMANENT MESSAGE DELETION                 */}
      {/* ========================================================= */}
      {messageToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3 text-rose-600 pb-2 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-950 text-base">Permanently Delete Message</h3>
                <p className="text-slate-400 text-[11px]">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed">
              Are you sure you want to permanently delete this inquiry message from{' '}
              <strong>{messageToDelete.senderName}</strong> ({messageToDelete.senderEmail}) regarding{' '}
              <em>"{messageToDelete.subject}"</em>?
            </p>

            <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeletingMessage}
                onClick={() => setMessageToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingMessage}
                onClick={handleDeleteMessage}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {isDeletingMessage ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
