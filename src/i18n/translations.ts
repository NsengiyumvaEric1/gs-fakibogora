import { Language } from '../types/index.ts';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    nav_home: 'Home',
    nav_about: 'About Us',
    nav_courses: 'Courses',
    nav_fees: 'School Fees',
    nav_gallery: 'Gallery',
    nav_staff: 'Staff',
    nav_announcements: 'Announcements',
    nav_news: 'News',
    nav_admin: 'Admin',
    nav_admin_login: 'Admin Login',
    nav_admin_dashboard: 'Admin Dashboard',
    nav_contact: 'Contact Us',

    // Top banner
    top_established: 'Est. 1969 · Kibogora, Nyamasheke, Western Province, Rwanda',
    language_select: 'Language',
    logged_in_as: 'Active Admin',
    logout_btn: 'Sign Out',

    // Hero
    hero_badge: 'Secondary Education Heritage · Est. 1969',
    hero_title: 'Groupe Scolaire Frank Adamson de Kibogora',
    hero_subtitle: 'Fostering academic excellence, moral integrity, and technological innovation along the scenic hills of Nyamasheke.',
    hero_cta_curriculum: 'Explore Academic Programs',
    hero_cta_contact: 'Contact Administration',

    // Stats
    stat_heritage: 'Years of Excellence',
    stat_students: 'Enrolled Students',
    stat_pass_rate: 'National Pass Rate',
    stat_faculty: 'Qualified Teachers',

    // Announcements
    section_announcements: 'Official Notices & School Life',
    section_announcements_sub: 'Verified announcements and updates directly published by school leadership.',
    tag_urgent: 'Important Notice',
    read_more: 'Read Full Details',
    author_prefix: 'Issued by',

    // Academic combinations
    section_academics: 'Academic Combinations & Curricula',
    section_academics_sub: 'Aligned with the Rwanda Basic Education Board (NESA) standards.',

    // About Page
    about_title: 'Our History & Educational Mission',
    about_intro_sub: 'Five decades of molding visionary leaders in Kibogora, Rwanda.',
    mission_title: 'Our Mission',
    vision_title: 'Our Vision',
    core_values_title: 'Core Values',
    leadership_title: 'School Leadership & Department Heads',
    leadership_placeholder_note: 'Note: Below profiles are official administrative placeholders configured in the school management database.',

    // Gallery Page
    gallery_title: 'School Photo Gallery & Campus Life',
    gallery_sub: 'Visual glimpses of our campus, science laboratories, academic halls, and sports events.',
    cat_all: 'All Photos',
    cat_campus: 'Campus Grounds',
    cat_labs: 'Science Labs',
    cat_academics: 'Academics & Library',
    cat_sports: 'Athletics & Sports',
    cat_events: 'Culture & Events',

    // Contact Page
    contact_title: 'Contact Administration',
    contact_sub: 'Inquiries regarding admissions, academic schedules, student welfare, or institutional visits.',
    contact_addr_title: 'Physical Location',
    contact_phone_title: 'Telephone Lines',
    contact_email_title: 'Official Email',
    contact_hours_title: 'Office Working Hours',
    form_name: 'Your Full Name',
    form_email: 'Your Email Address',
    form_phone: 'Telephone Number',
    form_subject: 'Inquiry Subject',
    form_message: 'Your Message / Inquiry',
    form_submit: 'Submit Inquiry to School Administration',
    form_success: 'Thank you. Your message has been recorded and routed to the school administration.',
    map_section_title: 'Find Us on the Map',
    map_section_sub: 'Interactive location map and directions to Groupe Scolaire Frank Adamson de Kibogora (GSFAK) in Kibogora, Kanjongo Sector, Nyamasheke District, Western Province, Rwanda.',
    get_directions: 'Get Directions',
    open_in_google_maps: 'Open in Google Maps',
    map_directions_desc: 'Click "Get Directions" to plan your route from any location directly to the GSFAK campus grounds.',
    map_custom_link_tip: 'Need to update the map pin? School administrators can update the Google Maps embed link anytime in Admin settings.',

    // Admin Access Denied (Exact behavior requirement)
    access_denied_badge: 'Restricted Administrative Gateway',
    access_denied_heading: 'Access Denied: You are not authorized to access the administration area.',
    access_denied_desc: 'This administration portal is strictly restricted to authenticated staff and administrators of GS FAKIBOGORA. Public visitors and unauthorized users cannot view administrative tools or sensitive records.',
    access_denied_return_home: '← Return to Public Website',
    access_denied_staff_login: 'Authorized Staff & Administrator Sign In →',

    // Admin Login Page
    login_heading: 'GS FAKIBOGORA Administrator Sign In',
    login_sub: 'Enter your verified institutional credentials to access the management dashboard.',
    login_email: 'Administrator Email',
    login_password: 'Password',
    login_show_pass: 'Show Password',
    login_hide_pass: 'Hide Password',
    login_submit: 'Authenticate & Access Dashboard',
    login_credentials_tip: 'System Setup Default Accounts:',
    login_super_admin: 'Super Admin',
    login_content_admin: 'Content Admin',

    // Admin Dashboard
    dashboard_title: 'Administration Dashboard',
    tab_overview: 'Overview',
    tab_announcements: 'Announcements & News',
    tab_gallery: 'Gallery',
    tab_school_info: 'School Information',
    tab_staff_activities: 'Staff & Activities',
    tab_messages: 'Inquiries',
    tab_admins: 'Administrator Accounts',
    tab_replacement: '★ Staff Replacement Wizard',
    tab_audit: 'Audit Logs',
    tab_export: 'XAMPP & PHP / MySQL Export',

    // Quick Stats
    stat_pub_ann: 'Published Notices',
    stat_draft_ann: 'Draft Notices',
    stat_news: 'News Articles',
    stat_photos: 'Gallery Items',
    stat_admins: 'Active Administrators',
    stat_unread_msgs: 'Unread Inquiries'
  },

  rw: {
    // Nav
    nav_home: 'Ahabanza',
    nav_about: 'Ibyerekeye Ishuri',
    nav_courses: 'Amasomo',
    nav_fees: 'Amafaranga y\'Ishuri',
    nav_gallery: 'Amafoto',
    nav_staff: 'Abakozi',
    nav_announcements: 'Amatangazo',
    nav_news: 'Amakuru',
    nav_admin: 'Ubuyobozi',
    nav_admin_login: 'Kwinjira kwa Admin',
    nav_admin_dashboard: 'Imbonerahamwe ya Admin',
    nav_contact: 'Twandikire',

    // Top banner
    top_established: 'Ryashinzwe mu 1969 · Kibogora, Nyamasheke, Intara y\'Iburengerazuba, Rwanda',
    language_select: 'Ururimi',
    logged_in_as: 'Umuyobozi Uriho',
    logout_btn: 'Sohoka',

    // Hero
    hero_badge: 'Amateka y\'Uburezi Bwisumbuye · Ryashinzwe mu 1969',
    hero_title: 'Groupe Scolaire Frank Adamson de Kibogora',
    hero_subtitle: 'Gutoza ubuhanga, uburere bwiza n\'ikoranabuhanga mu misozi myiza ya Nyamasheke irunguruka Ikiyaga cya Kivu.',
    hero_cta_curriculum: 'Reba Amashami n\'Amasomo',
    hero_cta_contact: 'Vugana n\'Ubuyobozi',

    // Stats
    stat_heritage: 'Imyaka y\'Ubuhanga',
    stat_students: 'Abanyeshuri Bigamo',
    stat_pass_rate: 'Intsinzi mu Bizamini',
    stat_faculty: 'Abarimu Babifitiye Ubushobozi',

    // Announcements
    section_announcements: 'Amatangazo n\'Ubuzima bw\'Ishuri',
    section_announcements_sub: 'Amatangazo yemewe ashyirwaho n\'ubuyobozi bw\'ishuri.',
    tag_urgent: 'Itangazo Rikomeye',
    read_more: 'Soma Itangazo Ryose',
    author_prefix: 'Ryashyizweho na',

    // Academic combinations
    section_academics: 'Amashami Yigishwa n\'Integanyanyigisho',
    section_academics_sub: 'Bihuye n\'amahame y\'Ikigo cy\'Igihugu Gishinzwe Uburezi (NESA/REB).',

    // About Page
    about_title: 'Amateka y\'Ishuri n\'Intego Zaryo',
    about_intro_sub: 'Imyaka irenga 50 irema abanyarwanda b\'intangarugero i Kibogora.',
    mission_title: 'Ubutumwa Bwacu',
    vision_title: 'Icyerekezo Cyacu',
    core_values_title: 'Indangagaciro Z\'Ishuri',
    leadership_title: 'Abayobozi b\'Ishuri n\'Abashinzwe Amashami',
    leadership_placeholder_note: 'Icyitonderwa: Iyi myanya yateguriwe kuzuza amazina yemewe binyuze mu buyobozi bw\'ikoranabuhanga.',

    // Gallery Page
    gallery_title: 'Amafoto y\'Ishuri n\'Ibyiciro Bitandukanye',
    gallery_sub: 'Amashusho agaragaza ibyumba by\'amashuri, laboratwari, isomero n\'imikino.',
    cat_all: 'Amafoto Yose',
    cat_campus: 'Icyanya cy\'Ishuri',
    cat_labs: 'Laboratwari za Siyansi',
    cat_academics: 'Amasomo n\'Isomero',
    cat_sports: 'Imikino n\'Imyitozo',
    cat_events: 'Umuco n\'Ibirori',

    // Contact Page
    contact_title: 'Vugana n\'Ubuyobozi bwa GSFAK',
    contact_sub: 'Ibibazo byerekeye kwiyandikisha, gahunda y\'amasomo, imibereho y\'abanyeshuri no gusura ishuri.',
    contact_addr_title: 'Aho Ishuri Riherereye',
    contact_phone_title: 'Nimero za Telefone',
    contact_email_title: 'Imeyili y\'Ishuri',
    contact_hours_title: 'Amasaha y\'Akazi',
    form_name: 'Amazina Yawe Yose',
    form_email: 'Imeyili Yawe',
    form_phone: 'Nimero ya Telefone',
    form_subject: 'Impamvu y\'Ubutumwa',
    form_message: 'Ubutumwa bwawe / Ikibazo',
    form_submit: 'Ohereza Ubutumwa ku Buyobozi',
    form_success: 'Murakoze cyane. Ubutumwa bwanyu bwakiriwe kandi bwashyikirijwe ubuyobozi bw\'ishuri.',
    map_section_title: 'Dusange ku Ikarita',
    map_section_sub: 'Ikarita igaragaza aho Groupe Scolaire Frank Adamson de Kibogora (GSFAK) iherereye i Kibogora, mu Murenge wa Kanjongo, Akarere ka Nyamasheke, Intara y\'Iburengerazuba mu Rwanda.',
    get_directions: 'Shaka Inzira (Get Directions)',
    open_in_google_maps: 'Fungura muri Google Maps',
    map_directions_desc: 'Kanda "Shaka Inzira" kugira ngo uhabwe inzira ikugeza neza mu kigo cya GSFAK uturutse aho uri hose.',
    map_custom_link_tip: 'Guhindura ikarita: Abayobozi b\'ishuri bashobora guhindura umurongo wa Google Maps mu buryo bw\'ubuyobozi.',

    // Admin Access Denied
    access_denied_badge: 'Urugi Rucunzwe rw\'Ubuyobozi',
    access_denied_heading: 'Ntugifite Ububasha: Ntabwo wemerewe kwinjira mu cyiciro cy\'ubuyobozi.',
    access_denied_desc: 'Aha hagenewe gusa abakozi n\'abayobozi bemewe ba GS FAKIBOGORA bafite konti zifunguye. Abasanzwe basura urubuga ntibemerewe kureba ibikoresho by\'ubuyobozi.',
    access_denied_return_home: '← Subira ku Rubuga Rusanzwe',
    access_denied_staff_login: 'Kwinjira kw\'Abayobozi n\'Abakozi Bemewe →',

    // Admin Login Page
    login_heading: 'Kwinjira kw\'Umuyobozi wa GS FAKIBOGORA',
    login_sub: 'Shyiramo imeyili n\'ijambo ry\'ibanga by\'akazi kugira ngo winjire mu buyobozi.',
    login_email: 'Imeyili y\'Umuyobozi',
    login_password: 'Ijambo ry\'Ibanga',
    login_show_pass: 'Erekana Ijambo',
    login_hide_pass: 'Hisha Ijambo',
    login_submit: 'Injira mu Ibiro by\'Ikoranabuhanga',
    login_credentials_tip: 'Konti zateguwe zo kugerageza:',
    login_super_admin: 'Umuyobozi Mukuru',
    login_content_admin: 'Ushinzwe Amakuru',

    // Admin Dashboard
    dashboard_title: 'Ibiro By\'Ikoranabuhanga ry\'Ishuri',
    tab_overview: 'Incamake',
    tab_announcements: 'Amatangazo n\'Amakuru',
    tab_gallery: 'Amafoto',
    tab_school_info: 'Amakuru y\'Ishuri',
    tab_staff_activities: 'Abakozi n\'Ibikorwa',
    tab_messages: 'Ubutumwa bwakiriwe',
    tab_admins: 'Konti z\'Abayobozi',
    tab_replacement: '★ Gusimbuza Umukozi Wagiye',
    tab_audit: 'Ibyakozwe mu Ikoranabuhanga',
    tab_export: 'Kumanura Code za XAMPP / PHP & MySQL',

    // Quick Stats
    stat_pub_ann: 'Amatangazo Ariho',
    stat_draft_ann: 'Amatangazo Yateguwe',
    stat_news: 'Inkuru z\'Ishuri',
    stat_photos: 'Amafoto yo muri Gallery',
    stat_admins: 'Abayobozi Bafite Ububasha',
    stat_unread_msgs: 'Ubutumwa Butarasomwa'
  },

  fr: {
    // Nav
    nav_home: 'Accueil',
    nav_about: 'À Propos',
    nav_courses: 'Cours',
    nav_fees: 'Frais Scolaires',
    nav_gallery: 'Galerie',
    nav_staff: 'Personnel',
    nav_announcements: 'Annonces',
    nav_news: 'Actualités',
    nav_admin: 'Administration',
    nav_admin_login: 'Connexion Admin',
    nav_admin_dashboard: 'Tableau de Bord Admin',
    nav_contact: 'Contactez-nous',

    // Top banner
    top_established: 'Fondé en 1969 · Kibogora, Nyamasheke, Province de l\'Ouest, Rwanda',
    language_select: 'Langue',
    logged_in_as: 'Administrateur',
    logout_btn: 'Se Déconnecter',

    // Hero
    hero_badge: 'Héritage Pédagogique d\'Excellence · Fondé en 1969',
    hero_title: 'Groupe Scolaire Frank Adamson de Kibogora',
    hero_subtitle: 'Former les esprits à la rigueur scientifique, à la discipline morale et à l\'innovation au cœur des collines de Nyamasheke.',
    hero_cta_curriculum: 'Découvrir Nos Programmes',
    hero_cta_contact: 'Contacter la Direction',

    // Stats
    stat_heritage: 'Années d\'Excellence',
    stat_students: 'Élèves Inscrits',
    stat_pass_rate: 'Taux de Réussite NESA',
    stat_faculty: 'Enseignants Qualifiés',

    // Announcements
    section_announcements: 'Avis Officiels et Vie Scolaire',
    section_announcements_sub: 'Communiqués et actualités validés par la direction de l\'établissement.',
    tag_urgent: 'Avis Important',
    read_more: 'Lire le Communiqué',
    author_prefix: 'Publié par',

    // Academic combinations
    section_academics: 'Filières d\'Études et Sections',
    section_academics_sub: 'Conformes aux programmes officiels du Rwanda Basic Education Board (NESA).',

    // About Page
    about_title: 'Notre Histoire et Vocation Éducative',
    about_intro_sub: 'Plus de cinquante ans au service de la jeunesse rwandaise à Kibogora.',
    mission_title: 'Notre Mission',
    vision_title: 'Notre Vision',
    core_values_title: 'Valeurs Fondamentales',
    leadership_title: 'Direction Scolaire et Responsables Pédagogiques',
    leadership_placeholder_note: 'Note: Ces profils constituent des espaces configurables dans la base de données administrative.',

    // Gallery Page
    gallery_title: 'Galerie Photographique et Campus',
    gallery_sub: 'Aperçus de nos infrastructures, laboratoires de sciences, bibliothèque et activités sportives.',
    cat_all: 'Toutes les Photos',
    cat_campus: 'Campus et Cadre',
    cat_labs: 'Laboratoires de Sciences',
    cat_academics: 'Enseignement & Bibliothèque',
    cat_sports: 'Activités Sportives',
    cat_events: 'Culture et Événements',

    // Contact Page
    contact_title: 'Contacter l\'Administration',
    contact_sub: 'Renseignements sur les inscriptions, scolarité, internat ou visites pédagogiques.',
    contact_addr_title: 'Adresse Physique',
    contact_phone_title: 'Lignes Téléphoniques',
    contact_email_title: 'Courrier Électronique',
    contact_hours_title: 'Horaires d\'Ouverture',
    form_name: 'Nom et Prénom',
    form_email: 'Adresse Email',
    form_phone: 'Numéro de Téléphone',
    form_subject: 'Objet de la Demande',
    form_message: 'Votre Message',
    form_submit: 'Transmettre à la Direction',
    form_success: 'Merci. Votre message a été transmis avec succès à l\'administration de l\'école.',
    map_section_title: 'Trouvez-nous sur la Carte',
    map_section_sub: 'Carte interactive et itinéraire d\'accès au Groupe Scolaire Frank Adamson de Kibogora (GSFAK) situé à Kibogora, Secteur Kanjongo, District de Nyamasheke, Province de l\'Ouest, Rwanda.',
    get_directions: 'Obtenir l\'Itinéraire (Get Directions)',
    open_in_google_maps: 'Ouvrir dans Google Maps',
    map_directions_desc: 'Cliquez sur "Obtenir l\'Itinéraire" pour calculer votre trajet vers le campus du GSFAK depuis votre position.',
    map_custom_link_tip: 'Personnaliser la carte : Les administrateurs peuvent modifier le lien d\'intégration Google Maps dans le tableau de bord.',

    // Admin Access Denied
    access_denied_badge: 'Portail Administratif Sécurisé',
    access_denied_heading: 'Accès Refusé: Vous n\'êtes pas autorisé à accéder à l\'espace d\'administration.',
    access_denied_desc: 'Cet espace est strictement réservé au personnel administratif et pédagogique habilité du GS FAKIBOGORA. Les visiteurs publics ne sont pas autorisés à consulter les outils administratifs.',
    access_denied_return_home: '← Retour au Site Public',
    access_denied_staff_login: 'Connexion des Administrateurs Autorisés →',

    // Admin Login Page
    login_heading: 'Authentification Administrative GS FAKIBOGORA',
    login_sub: 'Veuillez saisir vos identifiants institutionnels pour accéder au tableau de bord.',
    login_email: 'Email Professionnel',
    login_password: 'Mot de Passe',
    login_show_pass: 'Afficher',
    login_hide_pass: 'Masquer',
    login_submit: 'S\'identifier et Ouvrir le Dashboard',
    login_credentials_tip: 'Comptes par défaut pour évaluation:',
    login_super_admin: 'Super Administrateur',
    login_content_admin: 'Administrateur Contenu',

    // Admin Dashboard
    dashboard_title: 'Tableau de Bord Administratif',
    tab_overview: 'Vue Générale',
    tab_announcements: 'Actualités & Avis',
    tab_gallery: 'Galerie',
    tab_school_info: 'Infos Établissement',
    tab_staff_activities: 'Personnel & Événements',
    tab_messages: 'Demandes Reçues',
    tab_admins: 'Comptes Administrateurs',
    tab_replacement: '★ Procédure de Remplacement',
    tab_audit: 'Journal d\'Audit',
    tab_export: 'Export XAMPP & PHP / MySQL',

    // Quick Stats
    stat_pub_ann: 'Avis Publiés',
    stat_draft_ann: 'Avis en Brouillon',
    stat_news: 'Articles Publiés',
    stat_photos: 'Photos en Galerie',
    stat_admins: 'Administrateurs Actifs',
    stat_unread_msgs: 'Messages Non Lus'
  }
};
