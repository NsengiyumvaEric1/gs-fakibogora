export type Language = 'en' | 'rw' | 'fr';

export type NavigationPage =
  | 'home'
  | 'about'
  | 'courses'
  | 'fees'
  | 'gallery'
  | 'staff'
  | 'announcements'
  | 'news'
  | 'contact'
  | 'admin';

export interface MultilingualText {
  en: string;
  rw: string;
  fr: string;
}

export interface SchoolInfo {
  id: string;
  name: string;
  acronym: string;
  establishedYear: number;
  location: {
    village: string;
    cell: string;
    sector: string;
    district: string;
    province: string;
    country: string;
    landmark: string;
    mapEmbedUrl?: string;
    directionsUrl?: string;
  };
  motto: MultilingualText;
  aboutStory: MultilingualText;
  mission: MultilingualText;
  vision: MultilingualText;
  coreValues: Array<{
    name: MultilingualText;
    description: MultilingualText;
  }>;
  contact: {
    phonePrimary: string;
    phoneSecondary: string;
    emailOfficial: string;
    postalAddress: string;
    officeHours: string;
  };
  academicStreams: Array<{
    code: string;
    name: string;
    level: string;
    description: string;
  }>;
  stats: {
    establishedYear: number;
    approxStudents: string;
    passRate: string;
    certifiedTeachers: string;
  };
  logoUrl: string;
  heroImageUrl: string;
  updatedAt: string;
  updatedBy: string;
}

export type AdminRole = 'super_admin' | 'content_admin';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  createdBy: string;
  notes?: string;
}

export interface NewsAnnouncement {
  id: string;
  title: MultilingualText;
  summary: MultilingualText;
  content: MultilingualText;
  type: 'announcement' | 'news' | 'academic' | 'event';
  isImportant: boolean;
  isPublished: boolean;
  publishedAt: string;
  imageUrl?: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  id: string;
  title: MultilingualText;
  caption: MultilingualText;
  category: 'campus' | 'academics' | 'sports' | 'events' | 'labs';
  imageUrl: string;
  isPublished: boolean;
  displayOrder: number;
  uploadedAt: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  label: string;
  displayOrder: number;
  isPublished: boolean;
}

export interface StaffMember {
  id: string;
  fullName: string;
  category?: 'leader' | 'teacher';
  title: MultilingualText;
  department: string;
  qualification: string;
  emailPlaceholder: string;
  photoUrl: string;
  displayOrder: number;
  isPublished: boolean;
  isPlaceholderNotice: boolean;
}

export interface ActivityEvent {
  id: string;
  title: MultilingualText;
  description: MultilingualText;
  date: string;
  category: 'academic' | 'sports' | 'cultural' | 'community';
  location: string;
  isPublished: boolean;
}

export interface ContactMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  submittedAt: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminId: string;
  adminEmail: string;
  adminName: string;
  action: string;
  details: string;
  ipAddress?: string;
}
