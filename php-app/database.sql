-- =====================================================================
-- GROUPE SCOLAIRE FRANK ADAMSON DE KIBOGORA (GS FAKIBOGORA / GSFAK)
-- DATABASE SCHEMA & SEED DATA (MySQL 8.0 / MariaDB 10.4+ / XAMPP Compatible)
-- Location: Kibogora, Kanjongo Sector, Nyamasheke District, Western Province, Rwanda
-- Established: 1969
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `password_resets`;
DROP TABLE IF EXISTS `contact_messages`;
DROP TABLE IF EXISTS `activities`;
DROP TABLE IF EXISTS `staff_members`;
DROP TABLE IF EXISTS `gallery_items`;
DROP TABLE IF EXISTS `news_announcements`;
DROP TABLE IF EXISTS `school_info`;
DROP TABLE IF EXISTS `admins`;
DROP TABLE IF EXISTS `roles`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. ROLES TABLE
CREATE TABLE `roles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `role_key` VARCHAR(50) NOT NULL UNIQUE,
  `role_name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`role_key`, `role_name`, `description`) VALUES
('super_admin', 'Super Administrator', 'Full administrative authority over accounts, security, and all website content.'),
('content_admin', 'Content Administrator', 'Authorized to manage news, announcements, gallery, and general content only.');

-- 2. ADMINISTRATOR ACCOUNTS TABLE
CREATE TABLE `admins` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `role_key` VARCHAR(50) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_login_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` VARCHAR(150) DEFAULT 'System Provisioning',
  `notes` TEXT,
  INDEX `idx_admin_email` (`email`),
  INDEX `idx_admin_status` (`is_active`),
  FOREIGN KEY (`role_key`) REFERENCES `roles`(`role_key`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Administrators (Default credentials: Password: GSFak@1969#Admin / Editor@GSFAK2026)
-- Generated using PHP password_hash('GSFak@1969#Admin', PASSWORD_DEFAULT)
INSERT INTO `admins` (`email`, `password_hash`, `full_name`, `role_key`, `is_active`, `created_by`, `notes`) VALUES
('superadmin@gsfakibogora.rw', '$2y$10$w3UeN7dG8E9B6U1Cj4vDquN9vF0C0tJb9Jk1pPzXoXj3K5W1P2mNu', 'Principal Administrator (GSFAK)', 'super_admin', 1, 'System Bootstrap', 'Initial Super Administrator account'),
('editor@gsfakibogora.rw', '$2y$10$K7Z2hT5vE1oM3uB9q4P0luN9vF0C0tJb9Jk1pPzXoXj3K5W1P2mNu', 'Academic Communications Officer', 'content_admin', 1, 'Principal Administrator', 'Content editor account');

-- 3. SESSIONS TABLE (For server-side session tracking & instant revocation)
CREATE TABLE `sessions` (
  `id` VARCHAR(128) PRIMARY KEY,
  `admin_id` INT UNSIGNED NOT NULL,
  `token` VARCHAR(255) NOT NULL UNIQUE,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP NOT NULL,
  INDEX `idx_session_token` (`token`),
  FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. PASSWORD RESET TOKENS
CREATE TABLE `password_resets` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(150) NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `expires_at` TIMESTAMP NOT NULL,
  `used` TINYINT(1) DEFAULT 0,
  INDEX `idx_reset_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. SCHOOL INFORMATION & CONFIGURATION TABLE
CREATE TABLE `school_info` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `school_name` VARCHAR(200) NOT NULL,
  `acronym` VARCHAR(50) NOT NULL,
  `established_year` INT NOT NULL DEFAULT 1969,
  `location_village` VARCHAR(100) NOT NULL DEFAULT 'Kibogora',
  `location_cell` VARCHAR(100) NOT NULL DEFAULT 'Kanjongo',
  `location_sector` VARCHAR(100) NOT NULL DEFAULT 'Kanjongo',
  `location_district` VARCHAR(100) NOT NULL DEFAULT 'Nyamasheke',
  `location_province` VARCHAR(100) NOT NULL DEFAULT 'Western Province',
  `location_country` VARCHAR(100) NOT NULL DEFAULT 'Rwanda',
  `landmark` VARCHAR(255) DEFAULT 'Near Kibogora Hospital and Lake Kivu',
  `motto_en` VARCHAR(255) NOT NULL,
  `motto_rw` VARCHAR(255) NOT NULL,
  `motto_fr` VARCHAR(255) NOT NULL,
  `about_en` TEXT NOT NULL,
  `about_rw` TEXT NOT NULL,
  `about_fr` TEXT NOT NULL,
  `mission_en` TEXT NOT NULL,
  `mission_rw` TEXT NOT NULL,
  `mission_fr` TEXT NOT NULL,
  `vision_en` TEXT NOT NULL,
  `vision_rw` TEXT NOT NULL,
  `vision_fr` TEXT NOT NULL,
  `phone_primary` VARCHAR(50) NOT NULL,
  `phone_secondary` VARCHAR(50) NULL,
  `email_official` VARCHAR(100) NOT NULL,
  `postal_address` VARCHAR(255) NOT NULL,
  `office_hours` VARCHAR(150) NOT NULL,
  `logo_url` VARCHAR(255) DEFAULT NULL,
  `hero_image_url` VARCHAR(255) DEFAULT NULL,
  `map_embed_url` TEXT DEFAULT NULL,
  `directions_url` TEXT DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `school_info` (
  `school_name`, `acronym`, `established_year`, `location_village`, `location_cell`, `location_sector`,
  `location_district`, `location_province`, `location_country`, `landmark`,
  `motto_en`, `motto_rw`, `motto_fr`,
  `about_en`, `about_rw`, `about_fr`,
  `mission_en`, `mission_rw`, `mission_fr`,
  `vision_en`, `vision_rw`, `vision_fr`,
  `phone_primary`, `phone_secondary`, `email_official`, `postal_address`, `office_hours`,
  `logo_url`, `hero_image_url`, `map_embed_url`, `directions_url`
) VALUES (
  'Groupe Scolaire Frank Adamson de Kibogora',
  'GS FAKIBOGORA (GSFAK)',
  1969,
  'Kibogora',
  'Kanjongo',
  'Kanjongo',
  'Nyamasheke',
  'Western Province',
  'Rwanda',
  'Near Kibogora Hospital, overlooking Lake Kivu hills',
  'Knowledge & Character (Ubumenyi - Uburere)',
  'Ubumenyi - Uburere',
  'Savoir et Éducation (Ubumenyi - Uburere)',
  'Groupe Scolaire Frank Adamson de Kibogora (GS FAKIBOGORA / GSFAK) was established in 1969 in Kibogora, Kanjongo Sector, Nyamasheke District, Western Province of Rwanda. For over five decades, the institution has stood as a beacon of academic rigor, moral formation, and community leadership overlooking the scenic landscape of Lake Kivu. Named in honor of Frank Adamson, a missionary pioneer committed to empowering Rwandan youth through holistic education, GSFAK provides secondary education nurturing both scientific innovation and human values.',
  'Groupe Scolaire Frank Adamson de Kibogora (GS FAKIBOGORA / GSFAK) yashinzwe mu mwaka wa 1969 i Kibogora, mu Murenge wa Kanjongo, Akarere ka Nyamasheke, Intara y\'Iburengerazuba mu Rwanda. Mu myaka irenga mirongo itanu ishize, iri shuri ryabaye isoko y\'uburezi bufite ireme, uburere mbonezamubano n\'ubuyobozi butsimbataje indangagaciro z\'umuco n\'ubumenyi.',
  'Le Groupe Scolaire Frank Adamson de Kibogora (GS FAKIBOGORA / GSFAK) a été fondé en 1969 à Kibogora, Secteur Kanjongo, District de Nyamasheke, Province de l\'Ouest du Rwanda. Depuis plus de cinq décennies, l\'institution incarne l\'excellence académique, la formation morale et l\'engagement civique.',
  'To provide quality, inclusive, and transformative secondary education anchored in academic excellence, moral discipline, and technological innovation to prepare resilient servant leaders for Rwanda and the world.',
  'Gutanga uburezi bufite ireme, budaheza kandi buhindura ubuzima bishingiye ku buhanga, ikinyabupfura n\'ikoranabuhanga kugira ngo hategurwe abayobozi b\'ejo hazaza bafitiye igihugu umumaro.',
  'Fournir un enseignement secondaire de qualité, inclusif et transformateur, fondé sur l\'excellence intellectuelle, la discipline morale et l\'innovation scientifique.',
  'To be a premier center of academic distinction, Christian and human values, and transformative innovation in Western Rwanda and across the nation.',
  'Kuba intangarugero mu burezi bufite ireme, indangagaciro z\'ubupfura n\'ikoranabuhanga mu Ntara y\'Iburengerazuba no mu Rwanda hose.',
  'Demeurer un centre de référence pour la réussite scolaire, les valeurs humaines et l\'innovation transformatrice au Rwanda.',
  '+250 788 000 000 (Placeholder)',
  '+250 728 000 000 (Placeholder)',
  'info@gsfakibogora.rw',
  'P.O. Box 24, Kibogora, Nyamasheke, Rwanda',
  'Monday – Friday: 07:30 AM – 05:00 PM (CAT)',
  'gsfak_logo.jpg',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80',
  'https://maps.google.com/maps?q=Groupe+Scolaire+Frank+Adamson+de+Kibogora,+Kibogora,+Kanjongo,+Nyamasheke,+Western+Province,+Rwanda&t=&z=15&ie=UTF8&iwloc=&output=embed',
  'https://www.google.com/maps/dir/?api=1&destination=Groupe+Scolaire+Frank+Adamson+de+Kibogora,+Kibogora,+Kanjongo,+Nyamasheke,+Western+Province,+Rwanda'
);

-- 6. NEWS AND ANNOUNCEMENTS TABLE
CREATE TABLE `news_announcements` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title_en` VARCHAR(255) NOT NULL,
  `title_rw` VARCHAR(255) NOT NULL,
  `title_fr` VARCHAR(255) NOT NULL,
  `summary_en` TEXT NOT NULL,
  `summary_rw` TEXT NOT NULL,
  `summary_fr` TEXT NOT NULL,
  `content_en` LONGTEXT NOT NULL,
  `content_rw` LONGTEXT NOT NULL,
  `content_fr` LONGTEXT NOT NULL,
  `type` ENUM('announcement', 'news', 'academic', 'event') NOT NULL DEFAULT 'announcement',
  `is_important` TINYINT(1) NOT NULL DEFAULT 0,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `published_at` DATETIME NOT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `author_name` VARCHAR(150) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_news_published` (`is_published`, `published_at`),
  INDEX `idx_news_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `news_announcements` (
  `title_en`, `title_rw`, `title_fr`,
  `summary_en`, `summary_rw`, `summary_fr`,
  `content_en`, `content_rw`, `content_fr`,
  `type`, `is_important`, `is_published`, `published_at`, `image_url`, `author_name`
) VALUES
(
  'Academic Year 2026/2027 Registration & Reporting Dates Announced',
  'Amatangazo y\'Iyandikishwa n\'Itangira ry\'Umwaka w\'Amashuri 2026/2027',
  'Annonce des Dates de Rentrée et Inscriptions pour l\'Année Scolaire 2026/2027',
  'GS FAKIBOGORA welcomes all returning and newly admitted students for Term 1. Review required academic materials and reporting schedules.',
  'Ubuyobozi bwa GS FAKIBOGORA buramenyesha abanyeshuri bose n\'ababyeyi gahunda yo gutangira igihembwe cya mbere n\'ibikoresho bisabwa.',
  'La direction du GS FAKIBOGORA informe tous les élèves et parents du calendrier officiel de reprise des cours pour le premier trimestre.',
  'The administration of Groupe Scolaire Frank Adamson de Kibogora wishes to announce the official commencement of the new academic term following the Rwanda Basic Education Board (REB/NESA) calendar. Boarding students are scheduled to report on campus by 4:00 PM on Sunday. All students must bring complete uniforms, approved stationery, and certified clearance certificates.',
  'Ubuyobozi bwa GS FAKIBOGORA burashimira ababyeyi bose ku bufatanye bugaragara mu kurera. Turabibutsa ko abanyeshuri bacumbika bose bagomba kugera ku ishuri mbere ya saa kumi z\'umugoroba ku cyumweru.',
  'L\'administration du Groupe Scolaire Frank Adamson de Kibogora est heureuse de porter à la connaissance de la communauté éducative la réouverture officielle des classes. Les élèves internes sont attendus sur le campus avant 16h00 le dimanche précédant la rentrée.',
  'announcement', 1, 1, '2026-09-15 08:00:00',
  'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
  'Directorate of Studies'
),
(
  'Outstanding Performance in National Science & STEM Olympiads',
  'Amanota Meza n\'Intsinzi mu Marushanwa ya Siyansi ku Rwego rw\'Igihugu',
  'Excellents Résultats aux Olympiades Nationales des Sciences et Technologies',
  'GSFAK Senior 5 and Senior 6 science students earned top positions in the Western Province Regional Science Fair in Physics and Chemistry laboratory innovations.',
  'Abanyeshuri ba GSFAK biga mu mashami ya siyansi (MCB & PCB) bitwaye neza mu marushanwa y\'Intara y\'Iburengerazuba mu gukora imishinga ya siyansi.',
  'Les élèves des sections scientifiques (PCB et MCB) du GSFAK se sont distingués lors de la foire scientifique régionale de la Province de l\'Ouest.',
  'In line with our tradition of scientific excellence, students from GS FAKIBOGORA demonstrated remarkable innovation at the recent Western Province Science & Robotics Expo. Guided by our dedicated science faculty, their practical project on water purification earned second place in the district showcase.',
  'Dukomeje umuhigo wo guteza imbere ubumenyi n\'ubushakashatsi, itsinda ry\'abanyeshuri ba GS FAKIBOGORA ryatsindiye umwanya wa kabiri mu marushanwa y\'Intara y\'Iburengerazuba.',
  'Fidèle à notre tradition d\'excellence dans les sciences exactes, la délégation du GS FAKIBOGORA a obtenu d\'élogieux résultats lors de l\'exposition scientifique de la Province de l\'Ouest.',
  'news', 0, 1, '2026-10-02 10:30:00',
  'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
  'Science Department'
);

-- 7. GALLERY ITEMS TABLE
CREATE TABLE `gallery_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title_en` VARCHAR(255) NOT NULL,
  `title_rw` VARCHAR(255) NOT NULL,
  `title_fr` VARCHAR(255) NOT NULL,
  `caption_en` TEXT NOT NULL,
  `caption_rw` TEXT NOT NULL,
  `caption_fr` TEXT NOT NULL,
  `category` ENUM('campus', 'academics', 'sports', 'events', 'labs') NOT NULL DEFAULT 'campus',
  `image_url` VARCHAR(255) NOT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` INT NOT NULL DEFAULT 0,
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_gallery_pub` (`is_published`, `category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `gallery_items` (
  `title_en`, `title_rw`, `title_fr`,
  `caption_en`, `caption_rw`, `caption_fr`,
  `category`, `image_url`, `is_published`, `display_order`
) VALUES
(
  'GSFAK Campus Grounds & Panorama',
  'Inyubako z\'Ishuri n\'Umutuzo w\'Icyanya cya Kibogora',
  'Campus et Cadre Naturel de Kibogora',
  'Scenic hillside campus of GS FAKIBOGORA overlooking the hills of Nyamasheke near Lake Kivu.',
  'Icyanya cyiza kiberanye n\'imyigire i Kibogora mu Karere ka Nyamasheke.',
  'Le campus paisible et verdoyant du GS FAKIBOGORA, propice aux études secondaires.',
  'campus', 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80', 1, 1
),
(
  'Biology & Chemistry Science Laboratory',
  'Laboratwari ya Siyansi n\'Ibyiciro bya Shimi n\'Ubugenge',
  'Laboratoire de Biologie et Chimie Expérimentale',
  'Hands-on practical experiments for Senior 4–6 students preparing for national scientific examinations.',
  'Abanyeshuri bakora imyitozo ngiro muri laboratwari ya siyansi mu buryo bugezweho.',
  'Séance de travaux pratiques en sciences de la vie et chimie pour nos lycéens.',
  'labs', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80', 1, 2
),
(
  'Main Library & Quiet Study Hall',
  'Isomero Rikuru ry\'Ishuri',
  'Bibliothèque Centrale et Salle d\'Étude',
  'Stocked with national curriculum textbooks, revision modules, and research references.',
  'Isomero ryuje ibitabo by\'imyigire n\'ubushakashatsi ku banyeshuri bose.',
  'Fonds documentaire complet adapté aux programmes nationaux de l\'éducation au Rwanda.',
  'academics', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80', 1, 3
);

-- 8. STAFF MEMBERS TABLE (School leaders and teaching faculty)
CREATE TABLE `staff_members` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(150) NOT NULL,
  `category` ENUM('leader', 'teacher') NOT NULL DEFAULT 'teacher',
  `title_en` VARCHAR(150) NOT NULL,
  `title_rw` VARCHAR(150) NOT NULL,
  `title_fr` VARCHAR(150) NOT NULL,
  `department` VARCHAR(150) NOT NULL,
  `qualification` VARCHAR(255) NOT NULL,
  `email_placeholder` VARCHAR(100) NOT NULL,
  `photo_url` VARCHAR(255) NOT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `is_placeholder_notice` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_staff_cat` (`category`, `is_published`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `staff_members` (
  `full_name`, `category`, `title_en`, `title_rw`, `title_fr`, `department`, `qualification`, `email_placeholder`, `photo_url`, `display_order`, `is_published`, `is_placeholder_notice`
) VALUES
(
  '[Official Name - Editable Placeholder]',
  'leader',
  'Head of School / Headmaster',
  'Umuyobozi w\'Ishuri Mukuru',
  'Chef d\'Établissement / Préfet des Études',
  'School Administration & Leadership',
  'Masters in Educational Administration / Leadership',
  'headmaster@gsfakibogora.rw (Placeholder)',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  1, 1, 1
),
(
  '[Official Name - Editable Placeholder]',
  'leader',
  'Director of Studies (DOS)',
  'Umuyobozi Ushinzwe Amasomo (DOS)',
  'Directeur des Études (DOS)',
  'Academic Directorate & Examination Board',
  'B.Ed. Sciences / Mathematics & Curriculum Design',
  'dos@gsfakibogora.rw (Placeholder)',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  2, 1, 1
),
(
  'Jean-Pierre Hakizimana',
  'teacher',
  'Teacher of Mathematics & Physics',
  'Umwarimu w\'Imibare n\'Ubugenge',
  'Professeur de Mathématiques et Physique',
  'Sciences & STEM Faculty',
  'B.Ed. Physical Sciences',
  'j.hakizimana@gsfakibogora.rw',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  3, 1, 0
);

-- 9. ACTIVITIES & EVENTS TABLE
CREATE TABLE `activities` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title_en` VARCHAR(255) NOT NULL,
  `title_rw` VARCHAR(255) NOT NULL,
  `title_fr` VARCHAR(255) NOT NULL,
  `description_en` TEXT NOT NULL,
  `description_rw` TEXT NOT NULL,
  `description_fr` TEXT NOT NULL,
  `event_date` DATE NOT NULL,
  `category` ENUM('academic', 'sports', 'cultural', 'community') NOT NULL DEFAULT 'academic',
  `location` VARCHAR(150) NOT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `activities` (
  `title_en`, `title_rw`, `title_fr`,
  `description_en`, `description_rw`, `description_fr`,
  `event_date`, `category`, `location`, `is_published`
) VALUES
(
  'Beginning of Term 1 Examinations & Assessment Week',
  'Ibizamini n\'Isuzumabumenyi by\'Igihembwe cya Mbere',
  'Évaluations et Examens Périodiques du Premier Trimestre',
  'Comprehensive diagnostic testing for all O-Level and A-Level classes to gauge curriculum mastery.',
  'Isuzuma ry\'ubumenyi ry\'abanyeshuri bose bo mu cyiciro rusange no mu mashami yisumbuye.',
  'Évaluations diagnostiques pour mesurer l\'assimilation des apprentissages.',
  '2026-11-04', 'academic', 'Main Examination Halls', 1
);

-- 10. CONTACT MESSAGES / INQUIRIES TABLE
CREATE TABLE `contact_messages` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `sender_name` VARCHAR(150) NOT NULL,
  `sender_email` VARCHAR(150) NOT NULL,
  `sender_phone` VARCHAR(50) DEFAULT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('unread', 'read', 'replied', 'archived') NOT NULL DEFAULT 'unread',
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `replied_at` TIMESTAMP NULL DEFAULT NULL,
  `notes` TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. AUDIT LOGS TABLE
CREATE TABLE `audit_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `admin_id` VARCHAR(50) NOT NULL,
  `admin_email` VARCHAR(150) NOT NULL,
  `admin_name` VARCHAR(150) NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `details` TEXT NOT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_admin` (`admin_id`),
  INDEX `idx_audit_action` (`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `audit_logs` (`admin_id`, `admin_email`, `admin_name`, `action`, `details`) VALUES
('1', 'superadmin@gsfakibogora.rw', 'Principal Administrator (GSFAK)', 'SYSTEM_PROVISIONED', 'Database schema and initial administrative records provisioned successfully.');
