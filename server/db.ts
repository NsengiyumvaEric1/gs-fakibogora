import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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
  motto: {
    en: string;
    rw: string;
    fr: string;
  };
  aboutStory: {
    en: string;
    rw: string;
    fr: string;
  };
  mission: {
    en: string;
    rw: string;
    fr: string;
  };
  vision: {
    en: string;
    rw: string;
    fr: string;
  };
  coreValues: Array<{
    name: { en: string; rw: string; fr: string };
    description: { en: string; rw: string; fr: string };
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
  passwordHash: string; // salt$hash
  createdAt: string;
  lastLoginAt: string | null;
  createdBy: string;
  notes?: string;
}

export interface Session {
  id: string;
  token: string;
  adminId: string;
  createdAt: string;
  expiresAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface NewsAnnouncement {
  id: string;
  title: { en: string; rw: string; fr: string };
  summary: { en: string; rw: string; fr: string };
  content: { en: string; rw: string; fr: string };
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
  title: { en: string; rw: string; fr: string };
  caption: { en: string; rw: string; fr: string };
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
  title: { en: string; rw: string; fr: string };
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
  title: { en: string; rw: string; fr: string };
  description: { en: string; rw: string; fr: string };
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
  repliedAt?: string;
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

export interface PasswordResetToken {
  id: string;
  adminId: string;
  email: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
}

export interface DatabaseSchema {
  schoolInfo: SchoolInfo;
  heroSlides: HeroSlide[];
  admins: AdminUser[];
  sessions: Session[];
  newsAnnouncements: NewsAnnouncement[];
  galleryItems: GalleryItem[];
  staffMembers: StaffMember[];
  activities: ActivityEvent[];
  contactMessages: ContactMessage[];
  auditLogs: AuditLog[];
  adminSetupCompleted?: boolean;
  passwordResetTokens?: PasswordResetToken[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

// Password security helpers using standard Node crypto
export function hashPassword(plainText: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plainText, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}$${hash}`;
}

export function verifyPassword(plainText: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split('$');
    if (parts.length !== 2) return false;
    const [salt, hash] = parts;
    const testHash = crypto.pbkdf2Sync(plainText, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(testHash, 'hex'));
  } catch {
    return false;
  }
}

export const defaultHeroSlides: HeroSlide[] = [
  {
    id: 'slide-1',
    title: 'Scenic Lake Kivu Campus Environment',
    subtitle: 'A serene, peaceful learning haven overlooking the sparkling waters of Lake Kivu with fresh mountain air conducive to disciplined academic study.',
    image: '/gsfak_campus_kivu.jpg',
    badge: 'Kibogora, Nyamasheke · Est. 1969',
    label: 'Campus & Lake Kivu',
    displayOrder: 1,
    isPublished: true
  },
  {
    id: 'slide-2',
    title: 'Distinguished Leadership & Championship Honors',
    subtitle: 'Legal Representative & Headmaster Mr. Jean Bosco Nsengimana proudly presenting national trophies earned by GSFAK Kibogora scholars and athletic teams.',
    image: '/gsfak_principal_trophies.jpg',
    badge: 'Institutional Leadership · Honors',
    label: 'Headmaster & Trophies',
    displayOrder: 2,
    isPublished: true
  },
  {
    id: 'slide-3',
    title: '2024/2025 Rwanda National Handball Champions',
    subtitle: 'Celebrating championship victory in the FERWAHAND National Division, demonstrating discipline, teamwork, and athletic distinction.',
    image: '/gsfak_handball_champions.jpg',
    badge: 'National Champions · Sports Division',
    label: 'Handball Champions',
    displayOrder: 3,
    isPublished: true
  },
  {
    id: 'slide-4',
    title: 'Dedicated Teachers & Administrative Faculty',
    subtitle: 'Our qualified Rwandan educators and administrative leaders united at the GSFAK main gate, committed to educational excellence ("Uburezi Bufite Ireme").',
    image: '/gsfak_staff_group.jpg',
    badge: 'Teaching Faculty & Staff',
    label: 'Staff & Faculty',
    displayOrder: 4,
    isPublished: true
  },
  {
    id: 'slide-5',
    title: 'Modern Chemistry & Science Laboratory Research',
    subtitle: 'Hands-on experimentation with analytical reagents, beakers, and equipment fostering national distinction in PCB and MCB streams.',
    image: '/gsfak_science_lab.jpg',
    badge: 'Advanced Science & Chemistry Lab',
    label: 'Science Laboratory',
    displayOrder: 5,
    isPublished: true
  },
  {
    id: 'slide-6',
    title: 'Smart ICT & Computer Center',
    subtitle: 'Modern computer lab equipped with high-speed internet, coding workstations, and digital learning tools empowering technological mastery.',
    image: '/gsfak_ict_center.jpg',
    badge: 'Smart Class & Technology',
    label: 'ICT Center',
    displayOrder: 6,
    isPublished: true
  },
  {
    id: 'slide-7',
    title: 'Vibrant Campus Life & Academic Discipline',
    subtitle: 'Students thriving in a peaceful, disciplined secondary school environment anchored in knowledge, character, and community leadership.',
    image: '/gsfak_campus_life.jpg',
    badge: 'Student Community & Character',
    label: 'Campus Life',
    displayOrder: 7,
    isPublished: true
  }
];

// Initial seed data with authentic details for GS FAKIBOGORA
function getInitialSeedData(): DatabaseSchema {
  const defaultSuperAdminHash = hashPassword('GSFak@1969#Admin');
  const defaultEditorHash = hashPassword('Editor@GSFAK2026');

  return {
    heroSlides: [...defaultHeroSlides],
    schoolInfo: {
      id: 'gsfak-info-1',
      name: 'Groupe Scolaire Frank Adamson de Kibogora',
      acronym: 'GS FAKIBOGORA (GSFAK)',
      establishedYear: 1969,
      location: {
        village: 'Kibogora',
        cell: 'Kanjongo',
        sector: 'Kanjongo',
        district: 'Nyamasheke',
        province: 'Western Province',
        country: 'Rwanda',
        landmark: 'Near Kibogora Hospital and Lake Kivu hills',
        mapEmbedUrl: 'https://maps.google.com/maps?q=Groupe+Scolaire+Frank+Adamson+de+Kibogora,+Kibogora,+Kanjongo,+Nyamasheke,+Western+Province,+Rwanda&t=&z=15&ie=UTF8&iwloc=&output=embed',
        directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Groupe+Scolaire+Frank+Adamson+de+Kibogora,+Kibogora,+Kanjongo,+Nyamasheke,+Western+Province,+Rwanda'
      },
      motto: {
        en: 'Knowledge & Character (Ubumenyi - Uburere)',
        rw: 'Ubumenyi - Uburere',
        fr: 'Savoir et Éducation (Ubumenyi - Uburere)'
      },
      aboutStory: {
        en: 'Groupe Scolaire Frank Adamson de Kibogora (GS FAKIBOGORA / GSFAK) was established in 1969 in Kibogora, Kanjongo Sector, Nyamasheke District, Western Province of Rwanda. For over five decades, the institution has stood as a beacon of academic rigor, moral formation, and community leadership overlooking the scenic landscape of Lake Kivu. Named in honor of Frank Adamson, a missionary pioneer committed to empowering Rwandan youth through holistic education, GSFAK provides secondary education nurturing both scientific innovation and human values.',
        rw: 'Groupe Scolaire Frank Adamson de Kibogora (GS FAKIBOGORA / GSFAK) yashinzwe mu mwaka wa 1969 i Kibogora, mu Murenge wa Kanjongo, Akarere ka Nyamasheke, Intara y\'Iburengerazuba mu Rwanda. Mu myaka irenga mirongo itanu ishize, iri shuri ryabaye isoko y\'uburezi bufite ireme, uburere mbonezamubano n\'ubuyobozi butsimbataje indangagaciro z\'umuco n\'ubumenyi. Rirangwa no gufatanya n\'ababyeyi, guha abanyeshuri ubumenyi buhamye bwa siyansi n\'ubumenyamuntu.',
        fr: 'Le Groupe Scolaire Frank Adamson de Kibogora (GS FAKIBOGORA / GSFAK) a été fondé en 1969 à Kibogora, Secteur Kanjongo, District de Nyamasheke, Province de l\'Ouest du Rwanda. Depuis plus de cinq décennies, l\'institution incarne l\'excellence académique, la formation morale et l\'engagement civique. Nommé en hommage à Frank Adamson, pionnier dévoué à l\'émancipation de la jeunesse rwandaise par l\'éducation chrétienne et scientifique, le GSFAK prépare des leaders responsables et intègres.'
      },
      mission: {
        en: 'To provide quality, inclusive, and transformative secondary education anchored in academic excellence, moral discipline, and technological innovation to prepare resilient servant leaders for Rwanda and the world.',
        rw: 'Gutanga uburezi bufite ireme, budaheza kandi buhindura ubuzima bishingiye ku buhanga, ikinyabupfura n\'ikoranabuhanga kugira ngo hategurwe abayobozi b\'ejo hazaza bafitiye igihugu umumaro.',
        fr: 'Fournir un enseignement secondaire de qualité, inclusif et transformateur, fondé sur l\'excellence intellectuelle, la discipline morale et l\'innovation scientifique.'
      },
      vision: {
        en: 'To be a premier center of academic distinction, Christian and human values, and transformative innovation in Western Rwanda and across the nation.',
        rw: 'Kuba intangarugero mu burezi bufite ireme, indangagaciro z\'ubupfura n\'ikoranabuhanga mu Ntara y\'Iburengerazuba no mu Rwanda hose.',
        fr: 'Demeurer un centre de référence pour la réussite scolaire, les valeurs humaines et l\'innovation transformatrice au Rwanda.'
      },
      coreValues: [
        {
          name: { en: 'Academic Rigor', rw: 'Ubuhanga n\'Umwete', fr: 'Rigueur Académique' },
          description: {
            en: 'Pursuing mastery in sciences, arts, and languages with curiosity and dedication.',
            rw: 'Gushimangira ubumenyi buhamye mu bumenyi bw\'isi, siyansi n\'indimi.',
            fr: 'Exigence intellectuelle constante et maîtrise des savoirs scientifiques et littéraires.'
          }
        },
        {
          name: { en: 'Moral Discipline & Integrity', rw: 'Ikinyabupfura n\'Ubupfura', fr: 'Discipline & Intégrité' },
          description: {
            en: 'Upholding honesty, respect, accountability, and strong ethical principles in all actions.',
            rw: 'Kubaha, kubumbatira ukuri n\'imyitwarire myiza mu muryango w\'ishuri.',
            fr: 'Respect des règles, honnêteté intellectuelle et civisme exemplaire.'
          }
        },
        {
          name: { en: 'Faith & Stewardship', rw: 'Ukwizera n\'Urukundo', fr: 'Foi & Responsabilité' },
          description: {
            en: 'Nurturing spiritual grounding, empathy, mutual support, and responsible environmental care.',
            rw: 'Gukunda bagenzi bacu no kwita ku bidukikije n\'umuryango.',
            fr: 'Cultiver la fraternité, la compassion et le respect du bien commun.'
          }
        },
        {
          name: { en: 'Innovation & Self-Reliance', rw: 'Guhanga Udushya no Kwigira', fr: 'Innovation & Autonomie' },
          description: {
            en: 'Equipping students with practical problem-solving skills for sustainable development.',
            rw: 'Gutoza abanyeshuri gukemura ibibazo no gutekereza byimbitse.',
            fr: 'Former l\'esprit d\'initiative et les compétences pratiques pour l\'avenir.'
          }
        }
      ],
      contact: {
        phonePrimary: '+250 788 000 000 (Placeholder)',
        phoneSecondary: '+250 728 000 000 (Placeholder)',
        emailOfficial: 'info@gsfakibogora.rw',
        postalAddress: 'P.O. Box 24, Kibogora, Nyamasheke, Rwanda',
        officeHours: 'Monday – Friday: 07:30 AM – 05:00 PM (CAT)'
      },
      academicStreams: [
        {
          code: 'O-LEVEL',
          name: 'Ordinary Level (Tronc Commun)',
          level: 'Senior 1 to Senior 3',
          description: 'Comprehensive general foundational curriculum: Mathematics, Physics, Chemistry, Biology, Geography, History, English, Kinyarwanda, French, ICT.'
        },
        {
          code: 'MCB',
          name: 'Mathematics - Chemistry - Biology',
          level: 'Senior 4 to Senior 6',
          description: 'Advanced Level science combination preparing students for Medicine, Biomedical Sciences, Pharmacy, and Health Professions.'
        },
        {
          code: 'PCB',
          name: 'Physics - Chemistry - Biology',
          level: 'Senior 4 to Senior 6',
          description: 'Rigorous STEM stream designed for future engineers, researchers, environmental scientists, and medical doctors.'
        },
        {
          code: 'MEG',
          name: 'Mathematics - Economics - Geography',
          level: 'Senior 4 to Senior 6',
          description: 'Multidisciplinary pathway preparing students for Finance, Statistics, Economics, Urban Planning, and Business Leadership.'
        }
      ],
      stats: {
        establishedYear: 1969,
        approxStudents: '850+',
        passRate: '100% NESA Certified',
        certifiedTeachers: '40+'
      },
      logoUrl: '/gsfak_logo.jpg',
      heroImageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80',
      updatedAt: new Date().toISOString(),
      updatedBy: 'System Bootstrap'
    },
    admins: [
      {
        id: 'admin-super-01',
        email: 'superadmin@gsfakibogora.rw',
        fullName: 'Principal Administrator (GSFAK)',
        role: 'super_admin',
        isActive: true,
        passwordHash: defaultSuperAdminHash,
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
        createdBy: 'Initial System Provisioning',
        notes: 'Chief administrative account for institutional IT and governance.'
      },
      {
        id: 'admin-content-02',
        email: 'editor@gsfakibogora.rw',
        fullName: 'Academic Communications Officer',
        role: 'content_admin',
        isActive: true,
        passwordHash: defaultEditorHash,
        createdAt: new Date().toISOString(),
        lastLoginAt: null,
        createdBy: 'Initial System Provisioning',
        notes: 'Responsible for public announcements, news articles, and gallery updates.'
      }
    ],
    sessions: [],
    newsAnnouncements: [
      {
        id: 'news-01',
        title: {
          en: 'Academic Year 2026/2027 Registration & Reporting Dates Announced',
          rw: 'Amatangazo y\'Iyandikishwa n\'Itangira ry\'Umwaka w\'Amashuri 2026/2027',
          fr: 'Annonce des Dates de Rentrée et Inscriptions pour l\'Année Scolaire 2026/2027'
        },
        summary: {
          en: 'GS FAKIBOGORA welcomes all returning and newly admitted students for Term 1. Review required academic materials, boarding requirements, and reporting schedules.',
          rw: 'Ubuyobozi bwa GS FAKIBOGORA buramenyesha abanyeshuri bose n\'ababyeyi gahunda yo gutangira igihembwe cya mbere n\'ibikoresho bisabwa.',
          fr: 'La direction du GS FAKIBOGORA informe tous les élèves et parents du calendrier officiel de reprise des cours pour le premier trimestre.'
        },
        content: {
          en: 'The administration of Groupe Scolaire Frank Adamson de Kibogora wishes to announce the official commencement of the new academic term following the Rwanda Basic Education Board (REB/NESA) calendar. Boarding students are scheduled to report on campus by 4:00 PM on Sunday. All students must bring complete uniforms, approved stationery, and certified clearance certificates. Parents are reminded that fees clearance is conducted strictly through institutional banking channels. We look forward to another semester of intellectual rigor and exemplary conduct.',
          rw: 'Ubuyobozi bwa GS FAKIBOGORA burashimira ababyeyi bose ku bufatanye bugaragara mu kurera. Turabibutsa ko abanyeshuri bacumbika bose bagomba kugera ku ishuri mbere ya saa kumi z\'umugoroba ku cyumweru. Buri munyeshuri asabwa kwitwaza imyenda y\'ishuri yujuje ibipimo, ibikoresho by\'isuku n\'iby\'ishuri byose biteganyijwe. Kwishyura amafaranga y\'ishuri bikorwa binyuze kuri konti za banki zemejwe n\'ishuri.',
          fr: 'L\'administration du Groupe Scolaire Frank Adamson de Kibogora est heureuse de porter à la connaissance de la communauté éducative la réouverture officielle des classes. Les élèves internes sont attendus sur le campus avant 16h00 le dimanche précédant la rentrée. Le respect des règles d\'hygiène, de tenue réglementaire et de discipline stricte reste au cœur de notre contrat pédagogique.'
        },
        type: 'announcement',
        isImportant: true,
        isPublished: true,
        publishedAt: '2026-09-15T08:00:00.000Z',
        imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
        authorName: 'Directorate of Studies',
        createdAt: '2026-09-15T08:00:00.000Z',
        updatedAt: '2026-09-15T08:00:00.000Z'
      },
      {
        id: 'news-02',
        title: {
          en: 'Outstanding Performance in National Science & STEM Olympiads',
          rw: 'Amanota Meza n\'Intsinzi mu Marushanwa ya Siyansi ku Rwego rw\'Igihugu',
          fr: 'Excellents Résultats aux Olympiades Nationales des Sciences et Technologies'
        },
        summary: {
          en: 'GSFAK Senior 5 and Senior 6 science students earned top positions in the Western Province Regional Science Fair in Physics and Chemistry laboratory innovations.',
          rw: 'Abanyeshuri ba GSFAK biga mu mashami ya siyansi (MCB & PCB) bitwaye neza mu marushanwa y\'Intara y\'Iburengerazuba mu gukora imishinga ya siyansi.',
          fr: 'Les élèves des sections scientifiques (PCB et MCB) du GSFAK se sont distingués lors de la foire scientifique régionale de la Province de l\'Ouest.'
        },
        content: {
          en: 'In line with our tradition of scientific excellence, students from GS FAKIBOGORA demonstrated remarkable innovation at the recent Western Province Science & Robotics Expo. Guided by our dedicated science faculty, their practical project on water purification and renewable energy applications earned second place in the district showcase. The school administration extends sincere congratulations to the student innovators and their mentor teachers.',
          rw: 'Dukomeje umuhigo wo guteza imbere ubumenyi n\'ubushakashatsi, itsinda ry\'abanyeshuri ba GS FAKIBOGORA ryatsindiye umwanya wa kabiri mu marushanwa y\'Intara y\'Iburengerazuba. Berekanye umushinga wo gukora isuku ku mazi no gukoresha ingufu zituruka ku zuba. Ubuyobozi burashimira abarimu batanze ubufasha n\'abanyeshuri bose bagize uruhare muri iyi ntsinzi.',
          fr: 'Fidèle à notre tradition d\'excellence dans les sciences exactes, la délégation du GS FAKIBOGORA a obtenu d\'élogieux résultats lors de l\'exposition scientifique de la Province de l\'Ouest. Les démonstrations de nos laboratoires de chimie et physique ont reçu les félicitations chaleureuses des jurys académiques.'
        },
        type: 'news',
        isImportant: false,
        isPublished: true,
        publishedAt: '2026-10-02T10:30:00.000Z',
        imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
        authorName: 'Science Department',
        createdAt: '2026-10-02T10:30:00.000Z',
        updatedAt: '2026-10-02T10:30:00.000Z'
      },
      {
        id: 'news-03',
        title: {
          en: 'Annual Inter-Schools Athletics and Cultural Heritage Festival',
          rw: 'Iserukiramuco ry\'Umuco n\'Imikino Ihuza Amashuri yo mu Karere ka Nyamasheke',
          fr: 'Festival Annuel d\'Athlétisme et de Sauvegarde du Patrimoine Culturel'
        },
        summary: {
          en: 'Celebrating physical fitness, traditional Rwandan dance (Itorero), football, and volleyball tournaments across Nyamasheke secondary schools.',
          rw: 'Abanyeshuri bishimiye imikino itandukanye irimo umupira w\'amaguru, volleyball, hamwe n\'itorero ry\'umuco nyarwanda mu birori bishimishije.',
          fr: 'Les compétitions sportives et les représentations des troupes traditionnelles (Itorero) ont rassemblé notre communauté scolaire dans une ambiance festive.'
        },
        content: {
          en: 'GSFAK hosted the zonal secondary schools sports and cultural festival this past weekend. Our school football and volleyball teams delivered spirited performances, while the GSFAK traditional dance troupe captivated guests with an inspiring choreography celebrating Rwandan values of patriotic dedication and unity.',
          rw: 'Muri iki cyumweru gishize, GSFAK yakiriye imikino n\'ibirori by\'umuco byahuje amashuri yisumbuye yo muri kano karere. Amakipe yacu y\'umupira w\'amaguru na volleyball yitwaye neza cyane, mu gihe itorero ry\'ishuri ryataramiye abashyitsi mu mbyino gakondo zishimishije cyane.',
          fr: 'Le GSFAK a accueilli ce week-end le festival sportif et culturel interscolaire de notre zone. Nos équipes de football et de volley-ball ont fait preuve d\'un remarquable esprit d\'équipe, tandis que notre troupe folklorique a ému l\'assistance par des chants et danses traditionnels.'
        },
        type: 'event',
        isImportant: false,
        isPublished: true,
        publishedAt: '2026-10-08T14:15:00.000Z',
        imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
        authorName: 'Sports & Culture Committee',
        createdAt: '2026-10-08T14:15:00.000Z',
        updatedAt: '2026-10-08T14:15:00.000Z'
      },
      {
        id: 'news-04-draft',
        title: {
          en: '[DRAFT] Notice: Upcoming Parent-Teacher General Assembly Meeting',
          rw: '[IGITEGANYO] Itangazo: Inama Rusange y\'Ababyeyi n\'Abarimu',
          fr: '[BROUILLON] Avis: Prochaine Assemblée Générale des Parents et Enseignants'
        },
        summary: {
          en: 'Preliminary agenda for the upcoming term review and campus infrastructure enhancement projects.',
          rw: 'Imyanzuro y\'agateganyo y\'inama ireba imyigire y\'abanyeshuri n\'ibikorwa byo kuvugurura inyubako z\'ishuri.',
          fr: 'Ordre du jour préliminaire pour l\'évaluation trimestrielle et les projets d\'infrastructure scolaire.'
        },
        content: {
          en: 'This announcement is currently in draft review by the headmaster and will be published once the date and agenda items are officially finalized by the school board.',
          rw: 'Iri tangazo riracyari mu mushinga rigitegereje kwemezwa n\'ubuyobozi mbere y\'uko rishyirwa ku mugaragaro.',
          fr: 'Ce communiqué est en cours de validation par la direction et sera rendu public dès confirmation par le conseil d\'établissement.'
        },
        type: 'announcement',
        isImportant: false,
        isPublished: false,
        publishedAt: '2026-10-14T09:00:00.000Z',
        imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',
        authorName: 'Academic Communications Officer',
        createdAt: '2026-10-10T09:00:00.000Z',
        updatedAt: '2026-10-10T09:00:00.000Z'
      }
    ],
    galleryItems: [
      {
        id: 'gal-00-principal',
        title: {
          en: 'Distinguished Leadership & Championship Honors',
          rw: 'Ubuyobozi Bukuru n\'Ibikombe by\'Ishimwe by\'Ishuri',
          fr: 'Direction Générale et Trophées d\'Honneur'
        },
        caption: {
          en: 'GSFAK Headmaster Mr. Jean Bosco Nsengimana proudly presenting national trophies earned by GSFAK Kibogora scholars and athletic champions.',
          rw: 'Umuyobozi w\'Ishuri Mr. Jean Bosco Nsengimana agaragaza ibikombe n\'imidari byatwawe n\'abanyeshuri ba GSFAK Kibogora.',
          fr: 'Le Directeur M. Jean Bosco Nsengimana présentant les trophées nationaux remportés par les élèves de GSFAK Kibogora.'
        },
        category: 'academics',
        imageUrl: '/gsfak_principal_trophies.jpg',
        isPublished: true,
        displayOrder: 1,
        uploadedAt: '2026-10-15T15:00:00.000Z'
      },
      {
        id: 'gal-00-handball',
        title: {
          en: 'Rwanda National Handball Champions 2024/2025',
          rw: 'Ikipe ya Handball ya GSFAK Yatwaye Igikombe cy\'Igihugu',
          fr: 'Champions Nationaux Scolaires de Handball 2024/2025'
        },
        caption: {
          en: 'GSFAK Kibogora handball team celebrating victorious championship in the FERWAHAND 2nd Division, displaying athletic discipline and teamwork.',
          rw: 'Ikipe ya Handball y\'Abanyeshuri ba GSFAK Kibogora bishimira igikombe cy\'igihugu cya FERWAHAND mu cyiciro cya kabiri.',
          fr: 'L\'équipe de handball de GSFAK Kibogora célébrant leur titre de champion national de 2ème division FERWAHAND.'
        },
        category: 'sports',
        imageUrl: '/gsfak_handball_champions.jpg',
        isPublished: true,
        displayOrder: 2,
        uploadedAt: '2026-10-15T15:01:00.000Z'
      },
      {
        id: 'gal-00-staff',
        title: {
          en: 'Dedicated Teaching Faculty & Staff',
          rw: 'Abarimu n\'Abakozi b\'Ishuri rya GSFAK Kibogora',
          fr: 'Corps Enseignant et Personnel Administratif de GSFAK'
        },
        caption: {
          en: 'Our qualified pedagogical educators and school leaders united at the GSFAK main gate, dedicated to educational excellence ("Uburezi Bufite Ireme").',
          rw: 'Abarimu n\'abayobozi b\'ishuri bateraniye ku marembo makuru ya GSFAK, baharanira uburezi bufite ireme n\'uburere bwiza.',
          fr: 'L\'ensemble du corps enseignant et administratif réuni devant l\'entrée principale de GSFAK pour l\'excellence pédagogique.'
        },
        category: 'campus',
        imageUrl: '/gsfak_staff_group.jpg',
        isPublished: true,
        displayOrder: 3,
        uploadedAt: '2026-10-15T15:02:00.000Z'
      },
      {
        id: 'gal-01',
        title: {
          en: 'GSFAK Campus Grounds & Panorama',
          rw: 'Inyubako z\'Ishuri n\'Umutuzo w\'Icyanya cya Kibogora',
          fr: 'Campus et Cadre Naturel de Kibogora'
        },
        caption: {
          en: 'Scenic hillside campus of GS FAKIBOGORA overlooking the hills of Nyamasheke near Lake Kivu.',
          rw: 'Icyanya cyiza kiberanye n\'imyigire i Kibogora mu Karere ka Nyamasheke.',
          fr: 'Le campus paisible et verdoyant du GS FAKIBOGORA, propice aux études secondaires.'
        },
        category: 'campus',
        imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80',
        isPublished: true,
        displayOrder: 4,
        uploadedAt: '2026-09-01T10:00:00.000Z'
      },
      {
        id: 'gal-02',
        title: {
          en: 'Biology & Chemistry Science Laboratory',
          rw: 'Laboratwari ya Siyansi n\'Ibyiciro bya Shimi n\'Ubugenge',
          fr: 'Laboratoire de Biologie et Chimie Expérimentale'
        },
        caption: {
          en: 'Hands-on practical experiments for Senior 4–6 students preparing for national scientific examinations.',
          rw: 'Abanyeshuri bakora imyitozo ngiro muri laboratwari ya siyansi mu buryo bugezweho.',
          fr: 'Séance de travaux pratiques en sciences de la vie et chimie pour nos lycéens.'
        },
        category: 'labs',
        imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
        isPublished: true,
        displayOrder: 2,
        uploadedAt: '2026-09-03T11:00:00.000Z'
      },
      {
        id: 'gal-03',
        title: {
          en: 'Main Library & Quiet Study Hall',
          rw: 'Isomero Rikuru ry\'Ishuri',
          fr: 'Bibliothèque Centrale et Salle d\'Étude'
        },
        caption: {
          en: 'Stocked with national curriculum textbooks, revision modules, and research references.',
          rw: 'Isomero ryuje ibitabo by\'imyigire n\'ubushakashatsi ku banyeshuri bose.',
          fr: 'Fonds documentaire complet adapté aux programmes nationaux de l\'éducation au Rwanda.'
        },
        category: 'academics',
        imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
        isPublished: true,
        displayOrder: 3,
        uploadedAt: '2026-09-05T09:30:00.000Z'
      },
      {
        id: 'gal-04',
        title: {
          en: 'Classroom Instruction & Interactive Discussions',
          rw: 'Amasomo mu Byumba by\'Amashuri',
          fr: 'Enseignement Interactif en Salle de Classe'
        },
        caption: {
          en: 'Engaged teaching methodology promoting critical thinking, teamwork, and active inquiry.',
          rw: 'Uburyo bwo kwigisha butuma abanyeshuri bafata iya mbere mu kuganira no gusobanukirwa.',
          fr: 'Pédagogie active favorisant le dialogue, l\'esprit critique et la rigueur intellectuelle.'
        },
        category: 'academics',
        imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
        isPublished: true,
        displayOrder: 4,
        uploadedAt: '2026-09-07T14:20:00.000Z'
      },
      {
        id: 'gal-05',
        title: {
          en: 'School Athletics, Football & Volleyball Courts',
          rw: 'Imyitozo n\'Imikino ku Kibuga cy\'Ishuri',
          fr: 'Activités Sportives et Équipes Scolaires'
        },
        caption: {
          en: 'Developing healthy physical lifestyles, sportsmanship, and teamwork through active athletic leagues.',
          rw: 'Umutimanama w\'ubufatanye n\'imbaraga binyuze mu mikino n\'imyitozo ngororangingo.',
          fr: 'Développement de l\'esprit d\'équipe et de la santé physique par le sport scolaire.'
        },
        category: 'sports',
        imageUrl: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80',
        isPublished: true,
        displayOrder: 5,
        uploadedAt: '2026-09-10T16:00:00.000Z'
      },
      {
        id: 'gal-06',
        title: {
          en: 'Traditional Dance (Itorero) & Cultural Day',
          rw: 'Itorero ry\'Ishuri mu Mbyino Gakondo',
          fr: 'Troupe Traditionnelle (Itorero) et Célébration Culturelle'
        },
        caption: {
          en: 'Preserving Rwandan heritage, patriotic values, and artistic expression through traditional performances.',
          rw: 'Kubumbatira umuco nyarwanda n\'ubuhanzi binyuze mu ndangagaciro z\'itorero ry\'ishuri.',
          fr: 'Préservation des arts et des valeurs culturelles rwandaises par le spectacle vivant.'
        },
        category: 'events',
        imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
        isPublished: true,
        displayOrder: 6,
        uploadedAt: '2026-09-12T15:00:00.000Z'
      }
    ],
    staffMembers: [
      {
        id: 'staff-01',
        fullName: '[Official Name - Editable Placeholder]',
        title: {
          en: 'Head of School / Headmaster',
          rw: 'Umuyobozi w\'Ishuri Mukuru',
          fr: 'Chef d\'Établissement / Préfet des Études'
        },
        department: 'School Administration & Leadership',
        qualification: 'Masters in Educational Administration / Leadership',
        emailPlaceholder: 'headmaster@gsfakibogora.rw (Placeholder)',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        displayOrder: 1,
        isPublished: true,
        isPlaceholderNotice: true
      },
      {
        id: 'staff-02',
        fullName: '[Official Name - Editable Placeholder]',
        title: {
          en: 'Director of Studies (DOS)',
          rw: 'Umuyobozi Ushinzwe Amasomo (DOS)',
          fr: 'Directeur des Études (DOS)'
        },
        department: 'Academic Directorate & Examination Board',
        qualification: 'B.Ed. Sciences / Mathematics & Curriculum Design',
        emailPlaceholder: 'dos@gsfakibogora.rw (Placeholder)',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        displayOrder: 2,
        isPublished: true,
        isPlaceholderNotice: true
      },
      {
        id: 'staff-03',
        fullName: '[Official Name - Editable Placeholder]',
        title: {
          en: 'Dean of Students & Discipline (DOD)',
          rw: 'Umuyobozi Ushinzwe Imyitwarire n\'Imibereho y\'Abanyeshuri (DOD)',
          fr: 'Directeur de la Discipline et de la Vie Scolaire (DOD)'
        },
        department: 'Student Welfare, Guidance & Pastoral Care',
        qualification: 'B.A. Educational Psychology / Counseling',
        emailPlaceholder: 'discipline@gsfakibogora.rw (Placeholder)',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        displayOrder: 3,
        isPublished: true,
        isPlaceholderNotice: true
      },
      {
        id: 'staff-04',
        fullName: '[Official Name - Editable Placeholder]',
        title: {
          en: 'Head of Science & Mathematics Department',
          rw: 'Umuyobozi w\'Ishami rya Siyansi n\'Imibare',
          fr: 'Responsable du Département des Sciences et Mathématiques'
        },
        department: 'Sciences (PCB & MCB Combinations)',
        qualification: 'B.Sc. Chemistry & Physics Education',
        emailPlaceholder: 'science.dept@gsfakibogora.rw (Placeholder)',
        photoUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=400&q=80',
        displayOrder: 4,
        isPublished: true,
        isPlaceholderNotice: true
      },
      {
        id: 'staff-05',
        fullName: '[Official Name - Editable Placeholder]',
        title: {
          en: 'Senior Bursar & Finance Administrator',
          rw: 'Umubitsi w\'Ishuri n\'Imicungire y\'Umutungo',
          fr: 'Économe & Gestionnaire Financier'
        },
        department: 'Bursary, Procurement & Finance',
        qualification: 'BBA Accounting / Certified Public Accountant',
        emailPlaceholder: 'finance@gsfakibogora.rw (Placeholder)',
        photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
        displayOrder: 5,
        isPublished: true,
        isPlaceholderNotice: true
      }
    ],
    activities: [
      {
        id: 'act-01',
        title: {
          en: 'Beginning of Term 1 Examinations & Assessment Week',
          rw: 'Ibizamini n\'Isuzumabumenyi by\'Igihembwe cya Mbere',
          fr: 'Évaluations et Examens Périodiques du Premier Trimestre'
        },
        description: {
          en: 'Comprehensive diagnostic testing for all O-Level and A-Level classes to gauge curriculum mastery.',
          rw: 'Isuzuma ry\'ubumenyi ry\'abanyeshuri bose bo mu cyiciro rusange no mu mashami yisumbuye.',
          fr: 'Évaluations diagnostiques pour mesurer l\'assimilation des apprentissages.'
        },
        date: '2026-11-04',
        category: 'academic',
        location: 'Main Examination Halls',
        isPublished: true
      },
      {
        id: 'act-02',
        title: {
          en: 'Inter-House Football & Volleyball Championship Finals',
          rw: 'Imikino ya Nyuma y\'Umupira w\'Amaguru na Volleyball mu Mashuri',
          fr: 'Finales du Championnat Inter-Classes de Football et Volley'
        },
        description: {
          en: 'Annual school tournament championship featuring Senior 1 to Senior 6 house teams.',
          rw: 'Amarushanwa ahuza amashuri yose yo muri GSFAK mu kureba ikipe ihiga izindi.',
          fr: 'Compétition sportive annuelle opposant les différentes promotions.'
        },
        date: '2026-11-20',
        category: 'sports',
        location: 'GSFAK Sports Grounds',
        isPublished: true
      },
      {
        id: 'act-03',
        title: {
          en: 'Community Tree Planting & Environmental Stewardship Day',
          rw: 'Umuganda wo Gutera Ibiti no Kubungabunga Ibidukikije',
          fr: 'Journée Écologique et Reboisement Communautaire'
        },
        description: {
          en: 'Student environmental club leads campus greening and Lake Kivu watershed conservation.',
          rw: 'Abanyeshuri batera ibiti ku nkengero z\'ikiyaga cya Kivu mu kurengera urusobe rw\'ibinyabuzima.',
          fr: 'Action citoyenne menée par le club environnemental pour la préservation du bassin du lac Kivu.'
        },
        date: '2026-12-05',
        category: 'community',
        location: 'Kibogora Hills & Campus Perimeter',
        isPublished: true
      }
    ],
    contactMessages: [
      {
        id: 'msg-01',
        senderName: 'Parent Representative (Kanjongo)',
        senderEmail: 'parent.inquiry@example.rw',
        senderPhone: '+250 788 123 456',
        subject: 'Inquiry regarding Advanced Level Science Combination requirements',
        message: 'Dear Administration, I would like to inquire about the entry criteria and cut-off points for admission into Senior 4 PCB (Physics-Chemistry-Biology) for the upcoming intake. Thank you.',
        status: 'read',
        submittedAt: '2026-10-09T14:30:00.000Z',
        notes: 'Inquiry addressed by Director of Studies on phone.'
      }
    ],
    auditLogs: [
      {
        id: 'log-01',
        timestamp: new Date().toISOString(),
        adminId: 'system',
        adminEmail: 'system@gsfakibogora.rw',
        adminName: 'System Provisioning Engine',
        action: 'SYSTEM_INITIALIZED',
        details: 'GS FAKIBOGORA institutional database bootstrap completed with secure role definitions, initial school profile, and multilingual dictionaries.'
      }
    ]
  };
}

// In-memory cache + file synchronization
let cachedDb: DatabaseSchema | null = null;

function ensureDataDirectory(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getDatabase(): DatabaseSchema {
  if (cachedDb) return cachedDb;

  ensureDataDirectory();
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      cachedDb = JSON.parse(raw) as DatabaseSchema;
      if (!cachedDb.passwordResetTokens) {
        cachedDb.passwordResetTokens = [];
      }
      if (!cachedDb.heroSlides || !Array.isArray(cachedDb.heroSlides) || cachedDb.heroSlides.length === 0) {
        cachedDb.heroSlides = [...defaultHeroSlides];
        saveDatabase(cachedDb);
      }
      return cachedDb;
    } catch (err) {
      console.error('Error reading database file, re-seeding:', err);
    }
  }

  const initial = getInitialSeedData();
  saveDatabase(initial);
  cachedDb = initial;
  return cachedDb;
}

export function saveDatabase(data: DatabaseSchema): void {
  ensureDataDirectory();
  const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_FILE);
  cachedDb = data;
}

export function addAuditLog(
  admin: { id: string; email: string; fullName: string },
  action: string,
  details: string,
  ipAddress?: string
): void {
  const db = getDatabase();
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.fullName,
    action,
    details,
    ipAddress
  };
  db.auditLogs.unshift(newLog);
  // Keep up to 200 recent logs
  if (db.auditLogs.length > 200) {
    db.auditLogs = db.auditLogs.slice(0, 200);
  }
  saveDatabase(db);
}
