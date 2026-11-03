import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import {
  getDatabase,
  saveDatabase,
  hashPassword,
  verifyPassword,
  addAuditLog,
  AdminUser,
  Session,
  NewsAnnouncement,
  GalleryItem,
  StaffMember,
  ActivityEvent,
  HeroSlide,
  PasswordResetToken
} from './server/db.ts';

dotenv.config();

const app = express();

// Resolve server port: dev server must bind to port 3000 as Nginx reverse proxy runs on 8080
function resolvePort(): number {
  const portArgIdx = process.argv.indexOf('--port');
  if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
    const val = parseInt(process.argv[portArgIdx + 1], 10);
    if (!isNaN(val)) return val;
  }
  if (process.env.DEFAULT_APP_PORT) {
    const val = parseInt(process.env.DEFAULT_APP_PORT, 10);
    if (!isNaN(val)) return val;
  }
  // When PORT is 8080 (Cloud Run container port used by Nginx), app must bind to 3000
  if (process.env.PORT && process.env.PORT !== '8080') {
    const val = parseInt(process.env.PORT, 10);
    if (!isNaN(val)) return val;
  }
  return 3000;
}
const PORT = resolvePort();
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'public/uploads')));

// In-memory rate limiting map for login protection
interface RateLimitRecord {
  attempts: number;
  lastAttemptTime: number;
  blockedUntil: number;
}
const loginRateLimitMap = new Map<string, RateLimitRecord>();

function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = loginRateLimitMap.get(key);
  if (!record) {
    return { allowed: true };
  }
  if (record.blockedUntil > now) {
    const remaining = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds: remaining };
  }
  return { allowed: true };
}

function recordLoginAttempt(key: string, success: boolean): void {
  const now = Date.now();
  let record = loginRateLimitMap.get(key);
  if (!record) {
    record = { attempts: 0, lastAttemptTime: now, blockedUntil: 0 };
    loginRateLimitMap.set(key, record);
  }

  if (success) {
    loginRateLimitMap.delete(key);
  } else {
    record.attempts += 1;
    record.lastAttemptTime = now;
    if (record.attempts >= 5) {
      record.blockedUntil = now + 60 * 1000; // 60 seconds block
      record.attempts = 0;
    }
  }
}

// Authentication middleware
interface AuthenticatedRequest extends Request {
  currentAdmin?: AdminUser;
  currentSession?: Session;
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. No bearer token provided.' });
    return;
  }

  const token = authHeader.substring(7);
  const db = getDatabase();
  const session = db.sessions.find(s => s.token === token);

  if (!session) {
    res.status(401).json({ error: 'Session expired or invalid.' });
    return;
  }

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    // Session expired
    db.sessions = db.sessions.filter(s => s.token !== token);
    saveDatabase(db);
    res.status(401).json({ error: 'Session expired. Please log in again.' });
    return;
  }

  const admin = db.admins.find(a => a.id === session.adminId);
  if (!admin || !admin.isActive) {
    // Revoke session if user deactivated
    db.sessions = db.sessions.filter(s => s.token !== token);
    saveDatabase(db);
    res.status(403).json({ error: 'Account has been deactivated. Please contact the Head of School.' });
    return;
  }

  req.currentAdmin = admin;
  req.currentSession = session;
  next();
}

function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.currentAdmin || req.currentAdmin.role !== 'super_admin') {
    res.status(403).json({ error: 'Permission denied. Super Administrator role is required for this action.' });
    return;
  }
  next();
}

// ---------------------------------------------------------------------
// PUBLIC ROUTES
// ---------------------------------------------------------------------

app.get('/api/public/data', (_req, res) => {
  const db = getDatabase();
  const publishedAnnouncements = db.newsAnnouncements
    .filter(a => a.isPublished)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const publishedGallery = db.galleryItems
    .filter(g => g.isPublished)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const publishedStaff = db.staffMembers
    .filter(s => s.isPublished)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const publishedActivities = db.activities
    .filter(act => act.isPublished)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const publishedSlides = (db.heroSlides || [])
    .filter(s => s.isPublished)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  res.json({
    schoolInfo: db.schoolInfo,
    heroSlides: publishedSlides,
    announcements: publishedAnnouncements,
    gallery: publishedGallery,
    staff: publishedStaff,
    activities: publishedActivities
  });
});

app.post('/api/public/contact', (req, res) => {
  const { senderName, senderEmail, senderPhone, subject, message } = req.body;
  if (!senderName || !senderEmail || !subject || !message) {
    res.status(400).json({ error: 'Please provide full name, email address, subject, and message.' });
    return;
  }

  const db = getDatabase();
  const newMsg = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    senderName: String(senderName).trim(),
    senderEmail: String(senderEmail).trim(),
    senderPhone: senderPhone ? String(senderPhone).trim() : undefined,
    subject: String(subject).trim(),
    message: String(message).trim(),
    status: 'unread' as const,
    submittedAt: new Date().toISOString()
  };

  db.contactMessages.unshift(newMsg);
  saveDatabase(db);

  res.json({ success: true, message: 'Your message has been sent to the school administration.' });
});

app.post('/api/public/update-logo', (req, res) => {
  const { logoUrl } = req.body;
  if (!logoUrl) {
    res.status(400).json({ error: 'Please provide a valid logo image data or URL.' });
    return;
  }
  const db = getDatabase();
  db.schoolInfo.logoUrl = logoUrl;
  db.schoolInfo.updatedAt = new Date().toISOString();
  saveDatabase(db);
  res.json({ success: true, message: 'School logo photo updated successfully.', logoUrl });
});

// ---------------------------------------------------------------------
// AUTHENTICATION & ADMIN SETUP ROUTES
// ---------------------------------------------------------------------

app.get('/api/auth/setup-status', (_req, res) => {
  const db = getDatabase();
  // Registration is allowed if adminSetupCompleted is not true
  const canRegisterAdmin = !db.adminSetupCompleted;
  res.json({
    canRegisterAdmin,
    adminSetupCompleted: !!db.adminSetupCompleted,
    adminsCount: db.admins.length
  });
});

app.post('/api/auth/register-admin', (req, res) => {
  const { fullName, email, password, phone } = req.body;
  const ip = req.ip || '127.0.0.1';

  if (!fullName || !email || !password) {
    res.status(400).json({ error: 'Please provide your full name, email address, and password.' });
    return;
  }

  const db = getDatabase();
  if (db.adminSetupCompleted) {
    res.status(403).json({
      error: 'Administrator setup has already been completed. Public registration is locked to prevent unauthorized admin accounts.'
    });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    return;
  }

  let admin = db.admins.find(a => a.email.toLowerCase() === cleanEmail);
  if (admin) {
    admin.fullName = fullName.trim();
    admin.passwordHash = hashPassword(password);
    admin.isActive = true;
    admin.role = 'super_admin';
    admin.lastLoginAt = new Date().toISOString();
    if (phone) admin.notes = `Phone: ${phone}`;
  } else {
    admin = {
      id: `admin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      fullName: fullName.trim(),
      role: 'super_admin',
      isActive: true,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      createdBy: 'Administrator Initial Setup',
      notes: phone ? `Phone: ${phone}` : 'Official registered school administrator'
    };
    db.admins.push(admin);
  }

  // Once the administrator has set up their account, lock registration so no one else can register
  db.adminSetupCompleted = true;

  // Create active session
  const token = crypto.randomBytes(32).toString('hex');
  const session: Session = {
    id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    token,
    adminId: admin.id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: ip,
    userAgent: req.headers['user-agent']
  };

  db.sessions.push(session);
  saveDatabase(db);

  addAuditLog(
    { id: admin.id, email: admin.email, fullName: admin.fullName },
    'AUTH_ADMIN_REGISTERED',
    `Administrator account created and verified for ${admin.fullName} (${cleanEmail}). Registration feature is now permanently removed.`,
    ip
  );

  res.json({
    success: true,
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      lastLoginAt: admin.lastLoginAt
    },
    message: 'Administrator account successfully created and logged in.'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, username, password } = req.body;
  const rawIdentifier = username || email;
  const ip = req.ip || '127.0.0.1';

  if (!rawIdentifier || !password) {
    res.status(400).json({ error: 'Please enter both username and password.' });
    return;
  }

  const cleanIdentifier = String(rawIdentifier).trim().toLowerCase();
  const rateLimit = checkRateLimit(cleanIdentifier);
  if (!rateLimit.allowed) {
    res.status(429).json({
      error: `Too many login attempts. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`
    });
    return;
  }

  const db = getDatabase();
  const admin = db.admins.find(a => {
    const adminEmail = a.email.toLowerCase();
    const localPart = adminEmail.split('@')[0];
    return adminEmail === cleanIdentifier || localPart === cleanIdentifier || a.id.toLowerCase() === cleanIdentifier;
  });

  if (!admin) {
    recordLoginAttempt(cleanIdentifier, false);
    addAuditLog(
      { id: 'guest', email: cleanIdentifier, fullName: 'Unknown' },
      'AUTH_LOGIN_FAILED',
      `Login attempt failed: User not found (${cleanIdentifier})`,
      ip
    );
    res.status(401).json({ error: 'Invalid username or password.' });
    return;
  }

  if (!admin.isActive) {
    recordLoginAttempt(cleanIdentifier, false);
    addAuditLog(
      { id: admin.id, email: admin.email, fullName: admin.fullName },
      'AUTH_LOGIN_BLOCKED',
      `Attempted login on deactivated account: ${cleanIdentifier}`,
      ip
    );
    res.status(403).json({ error: 'This administrator account is deactivated. Contact the Head of School.' });
    return;
  }

  const isValid = verifyPassword(password, admin.passwordHash);
  if (!isValid) {
    recordLoginAttempt(cleanIdentifier, false);
    addAuditLog(
      { id: admin.id, email: admin.email, fullName: admin.fullName },
      'AUTH_LOGIN_FAILED',
      `Incorrect password entered for ${cleanIdentifier}`,
      ip
    );
    res.status(401).json({ error: 'Invalid username or password.' });
    return;
  }

  // Login successful
  recordLoginAttempt(cleanIdentifier, true);
  admin.lastLoginAt = new Date().toISOString();
  // Ensure admin registration is locked once administrator logs in
  db.adminSetupCompleted = true;

  // Create session
  const token = crypto.randomBytes(32).toString('hex');
  const session: Session = {
    id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    token,
    adminId: admin.id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    ipAddress: ip,
    userAgent: req.headers['user-agent']
  };

  db.sessions.push(session);
  saveDatabase(db);

  addAuditLog(
    { id: admin.id, email: admin.email, fullName: admin.fullName },
    'AUTH_LOGIN_SUCCESS',
    `Administrator authenticated successfully with role ${admin.role}`,
    ip
  );

  res.json({
    success: true,
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      lastLoginAt: admin.lastLoginAt
    }
  });
});

app.post('/api/auth/logout', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = getDatabase();
  const token = req.currentSession?.token;
  if (token) {
    db.sessions = db.sessions.filter(s => s.token !== token);
    saveDatabase(db);
  }

  if (req.currentAdmin) {
    addAuditLog(
      { id: req.currentAdmin.id, email: req.currentAdmin.email, fullName: req.currentAdmin.fullName },
      'AUTH_LOGOUT',
      'Administrator logged out and session was terminated'
    );
  }

  res.json({ success: true, message: 'Logged out successfully.' });
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const admin = req.currentAdmin!;
  res.json({
    admin: {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
      isActive: admin.isActive,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt
    }
  });
});

// ---------------------------------------------------------------------
// SECURE FORGOT PASSWORD & PASSWORD RESET FLOW
// ---------------------------------------------------------------------

app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email || !String(email).trim()) {
    res.status(400).json({ error: 'Please enter your registered administrator email address.' });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const db = getDatabase();
  if (!db.passwordResetTokens) {
    db.passwordResetTokens = [];
  }

  const admin = db.admins.find(a => a.email.toLowerCase() === cleanEmail);
  if (!admin) {
    res.status(404).json({
      error: 'No administrator account was found with this email address. Please ensure you entered your registered school administrator email.'
    });
    return;
  }

  if (!admin.isActive) {
    res.status(403).json({
      error: 'This administrator account has been deactivated. Please contact the Head of School for assistance.'
    });
    return;
  }

  // Invalidate any existing unused reset tokens for this admin
  db.passwordResetTokens.forEach(t => {
    if (t.adminId === admin.id && !t.used) {
      t.used = true;
    }
  });

  // Generate cryptographically secure random token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour expiration

  const resetTokenObj: PasswordResetToken = {
    id: `rst-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    adminId: admin.id,
    email: admin.email,
    token,
    createdAt: new Date().toISOString(),
    expiresAt,
    used: false
  };

  db.passwordResetTokens.push(resetTokenObj);
  saveDatabase(db);

  const resetLink = `/?view=admin-reset-password&token=${token}`;

  addAuditLog(
    { id: admin.id, email: admin.email, fullName: admin.fullName },
    'AUTH_PASSWORD_RESET_REQUESTED',
    `Secure password reset link generated for ${admin.email} (Expires: 60 minutes).`
  );

  res.json({
    success: true,
    message: 'Password reset link successfully created and dispatched.',
    token,
    resetLink,
    expiresAt,
    email: admin.email,
    fullName: admin.fullName
  });
});

app.get('/api/auth/verify-reset-token', (req, res) => {
  const token = req.query.token as string;
  if (!token) {
    res.status(400).json({ valid: false, error: 'No password reset token provided.' });
    return;
  }

  const db = getDatabase();
  const tokenRecord = (db.passwordResetTokens || []).find(t => t.token === token);
  if (!tokenRecord) {
    res.status(400).json({ valid: false, error: 'Password reset link is invalid or does not exist.' });
    return;
  }

  if (tokenRecord.used) {
    res.status(400).json({ valid: false, error: 'This password reset link has already been used.' });
    return;
  }

  if (new Date(tokenRecord.expiresAt).getTime() <= Date.now()) {
    res.status(400).json({ valid: false, error: 'This password reset link has expired. Please request a new one.' });
    return;
  }

  res.json({
    valid: true,
    email: tokenRecord.email,
    token: tokenRecord.token
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    res.status(400).json({ error: 'Reset token and new password are required.' });
    return;
  }

  if (String(newPassword).length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    return;
  }

  const db = getDatabase();
  const tokenRecord = (db.passwordResetTokens || []).find(t => t.token === token);
  if (!tokenRecord) {
    res.status(400).json({ error: 'Password reset link is invalid or does not exist.' });
    return;
  }

  if (tokenRecord.used) {
    res.status(400).json({ error: 'This password reset link has already been used. Please request a new reset link.' });
    return;
  }

  if (new Date(tokenRecord.expiresAt).getTime() <= Date.now()) {
    res.status(400).json({ error: 'This password reset link has expired. Please request a new reset link.' });
    return;
  }

  const admin = db.admins.find(a => a.id === tokenRecord.adminId);
  if (!admin) {
    res.status(404).json({ error: 'Associated administrator account not found.' });
    return;
  }

  // Update password hash securely
  admin.passwordHash = hashPassword(String(newPassword));
  // Invalidate this token immediately so it cannot be reused
  tokenRecord.used = true;
  // Terminate all existing sessions for this admin for safety
  db.sessions = db.sessions.filter(s => s.adminId !== admin.id);
  saveDatabase(db);

  addAuditLog(
    { id: admin.id, email: admin.email, fullName: admin.fullName },
    'AUTH_PASSWORD_RESET_COMPLETED',
    `Administrator ${admin.fullName} (${admin.email}) successfully reset password via secure reset token.`
  );

  res.json({
    success: true,
    message: 'Your password has been changed successfully. You can now log in using your new password.'
  });
});

// ---------------------------------------------------------------------
// ADMIN DASHBOARD & MANAGEMENT API
// ---------------------------------------------------------------------

app.get('/api/admin/overview', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = getDatabase();
  const publishedAnnouncements = db.newsAnnouncements.filter(a => a.isPublished && a.type === 'announcement').length;
  const draftAnnouncements = db.newsAnnouncements.filter(a => !a.isPublished).length;
  const newsArticles = db.newsAnnouncements.filter(a => a.isPublished && a.type !== 'announcement').length;
  const galleryCount = db.galleryItems.length;
  const activeAdmins = db.admins.filter(a => a.isActive).length;
  const unreadMessages = db.contactMessages.filter(m => m.status === 'unread').length;

  res.json({
    stats: {
      publishedAnnouncements,
      draftAnnouncements,
      newsArticles,
      galleryCount,
      activeAdmins,
      unreadMessages
    },
    recentAuditLogs: db.auditLogs.slice(0, 10),
    schoolInfo: db.schoolInfo
  });
});

// School Info Management
app.put('/api/admin/school-info', requireAuth, (req: AuthenticatedRequest, res) => {
  const db = getDatabase();
  const updates = req.body;

  db.schoolInfo = {
    ...db.schoolInfo,
    ...updates,
    updatedAt: new Date().toISOString(),
    updatedBy: req.currentAdmin!.fullName
  };

  saveDatabase(db);
  addAuditLog(
    { id: req.currentAdmin!.id, email: req.currentAdmin!.email, fullName: req.currentAdmin!.fullName },
    'SCHOOL_INFO_UPDATED',
    'Updated school details, contact information, and institutional statements.'
  );

  res.json({ success: true, schoolInfo: db.schoolInfo });
});

// Helper to save base64 uploaded images to permanent server storage
function saveBase64Image(fileData: string, folderName: string, prefix = 'img'): { url: string; filename: string } {
  const match = fileData.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid file format. Please upload a valid image file (JPG, PNG, WEBP).');
  }

  const mimeType = match[1].toLowerCase();
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, 'base64');

  if (buffer.length > 15 * 1024 * 1024) {
    throw new Error('Image file size exceeds the 15MB limit.');
  }

  const mimeExtMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
  };
  const ext = mimeExtMap[mimeType] || 'jpg';
  const safeName = `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
  const allowedFolders = ['announcements', 'gallery', 'staff', 'slides', 'branding'];
  const sanitizedFolder = allowedFolders.includes(folderName) ? folderName : 'general';
  const uploadsDir = path.resolve(process.cwd(), `public/uploads/${sanitizedFolder}`);

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const destPath = path.join(uploadsDir, safeName);
  fs.writeFileSync(destPath, buffer);

  return {
    url: `/uploads/${sanitizedFolder}/${safeName}`,
    filename: safeName
  };
}

// Unified image upload endpoint for any admin module
app.post('/api/admin/upload-image', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { fileData, folder, prefix } = req.body;
    if (!fileData) {
      res.status(400).json({ error: 'No image file data provided.' });
      return;
    }
    const result = saveBase64Image(fileData, folder || 'general', prefix || 'img');
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Unified image upload error:', err);
    res.status(400).json({ error: err.message || 'Image upload failed.' });
  }
});

// Branding (logo/banner) image upload endpoint
app.post('/api/admin/branding/upload', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { fileData, prefix } = req.body;
    if (!fileData) {
      res.status(400).json({ error: 'No image file data provided.' });
      return;
    }
    const result = saveBase64Image(fileData, 'branding', prefix || 'branding');
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Branding image upload error:', err);
    res.status(400).json({ error: err.message || 'Branding upload failed.' });
  }
});

// News & Announcements Management
app.get('/api/admin/announcements', requireAuth, (_req, res) => {
  const db = getDatabase();
  res.json({ announcements: db.newsAnnouncements });
});

// Announcements Image Upload endpoint
app.post('/api/admin/announcements/upload', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { fileData } = req.body;
    if (!fileData) {
      res.status(400).json({ error: 'No image file data provided.' });
      return;
    }
    const result = saveBase64Image(fileData, 'announcements', 'ann');
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Announcement image upload error:', err);
    res.status(400).json({ error: err.message || 'Failed to upload announcement image.' });
  }
});

app.post('/api/admin/announcements', requireAuth, (req: AuthenticatedRequest, res) => {
  const { title, summary, content, type, isImportant, isPublished, publishedAt, imageUrl } = req.body;
  if (!title?.en || !summary?.en || !content?.en) {
    res.status(400).json({ error: 'English title, summary, and content are required.' });
    return;
  }

  const db = getDatabase();
  const newPost: NewsAnnouncement = {
    id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: {
      en: title.en,
      rw: title.rw || title.en,
      fr: title.fr || title.en
    },
    summary: {
      en: summary.en,
      rw: summary.rw || summary.en,
      fr: summary.fr || summary.en
    },
    content: {
      en: content.en,
      rw: content.rw || content.en,
      fr: content.fr || content.en
    },
    type: type || 'announcement',
    isImportant: Boolean(isImportant),
    isPublished: Boolean(isPublished),
    publishedAt: publishedAt || new Date().toISOString(),
    imageUrl: imageUrl || '/gsfak_campus_life.jpg',
    authorName: req.currentAdmin!.fullName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.newsAnnouncements.unshift(newPost);
  saveDatabase(db);

  addAuditLog(
    { id: req.currentAdmin!.id, email: req.currentAdmin!.email, fullName: req.currentAdmin!.fullName },
    'ANNOUNCEMENT_CREATED',
    `Created ${newPost.type}: "${newPost.title.en}" (Status: ${newPost.isPublished ? 'Published' : 'Draft'})`
  );

  res.json({ success: true, announcement: newPost });
});

app.put('/api/admin/announcements/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const index = db.newsAnnouncements.findIndex(a => a.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Announcement not found.' });
    return;
  }

  const current = db.newsAnnouncements[index];
  const updated: NewsAnnouncement = {
    ...current,
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  db.newsAnnouncements[index] = updated;
  saveDatabase(db);

  addAuditLog(
    { id: req.currentAdmin!.id, email: req.currentAdmin!.email, fullName: req.currentAdmin!.fullName },
    'ANNOUNCEMENT_UPDATED',
    `Updated post "${updated.title.en}" (Published: ${updated.isPublished})`
  );

  res.json({ success: true, announcement: updated });
});

app.delete('/api/admin/announcements/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const item = db.newsAnnouncements.find(a => a.id === id);
  if (!item) {
    res.status(404).json({ error: 'Announcement not found.' });
    return;
  }

  // Safe file removal: if the announcement has an uploaded image file managed by this application, delete it
  const imageUrl = item.imageUrl || '';
  if (imageUrl) {
    const cleanUrl = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
    if (cleanUrl.startsWith('uploads/')) {
      const uploadsBaseDir = path.resolve(process.cwd(), 'public/uploads');
      const targetFilePath = path.resolve(process.cwd(), 'public', cleanUrl);
      if (targetFilePath.startsWith(uploadsBaseDir) && fs.existsSync(targetFilePath)) {
        try {
          fs.unlinkSync(targetFilePath);
        } catch (unlinkErr) {
          console.error('Failed to unlink deleted announcement image:', unlinkErr);
        }
      }
    }
  }

  db.newsAnnouncements = db.newsAnnouncements.filter(a => a.id !== id);
  saveDatabase(db);

  addAuditLog(
    { id: req.currentAdmin!.id, email: req.currentAdmin!.email, fullName: req.currentAdmin!.fullName },
    'ANNOUNCEMENT_DELETED',
    `Deleted announcement "${item.title.en}" (ID: ${item.id})`
  );

  res.json({ success: true, message: 'Announcement permanently deleted.' });
});

// ---------------------------------------------------------------------
// HOMEPAGE HERO SLIDESHOW MANAGEMENT (Auto-Changing Images)
// ---------------------------------------------------------------------
app.get('/api/admin/slides', requireAuth, (_req, res) => {
  const db = getDatabase();
  res.json({ slides: (db.heroSlides || []).sort((a, b) => a.displayOrder - b.displayOrder) });
});

app.post('/api/admin/slides', requireAuth, (req: AuthenticatedRequest, res) => {
  const { title, subtitle, image, badge, label, displayOrder, isPublished } = req.body;
  if (!title || !image) {
    res.status(400).json({ error: 'Slide title and image URL are required.' });
    return;
  }

  const db = getDatabase();
  if (!db.heroSlides) db.heroSlides = [];

  const newSlide: HeroSlide = {
    id: `slide-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: String(title).trim(),
    subtitle: subtitle ? String(subtitle).trim() : '',
    image: String(image).trim(),
    badge: badge ? String(badge).trim() : 'Campus Showcase',
    label: label ? String(label).trim() : String(title).trim().slice(0, 18),
    displayOrder: displayOrder !== undefined ? Number(displayOrder) : db.heroSlides.length + 1,
    isPublished: isPublished !== undefined ? Boolean(isPublished) : true
  };

  db.heroSlides.push(newSlide);
  saveDatabase(db);

  addAuditLog(
    { id: req.currentAdmin!.id, email: req.currentAdmin!.email, fullName: req.currentAdmin!.fullName },
    'HERO_SLIDE_ADDED',
    `Added homepage hero slide "${newSlide.title}"`
  );

  res.json({ success: true, slide: newSlide });
});

app.put('/api/admin/slides/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDatabase();
  if (!db.heroSlides) db.heroSlides = [];
  const idx = db.heroSlides.findIndex(s => s.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Slide not found.' });
    return;
  }

  const current = db.heroSlides[idx];
  db.heroSlides[idx] = {
    ...current,
    ...req.body
  };
  saveDatabase(db);

  addAuditLog(
    { id: req.currentAdmin!.id, email: req.currentAdmin!.email, fullName: req.currentAdmin!.fullName },
    'HERO_SLIDE_UPDATED',
    `Updated homepage hero slide "${db.heroSlides[idx].title}"`
  );

  res.json({ success: true, slide: db.heroSlides[idx] });
});

app.delete('/api/admin/slides/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDatabase();
  if (!db.heroSlides) db.heroSlides = [];
  const item = db.heroSlides.find(s => s.id === id);
  if (!item) {
    res.status(404).json({ error: 'Slide not found.' });
    return;
  }

  // Safe file removal if it is a managed custom upload
  let fileRemoved = false;
  const imageUrl = item.image || '';
  if (imageUrl) {
    const cleanUrl = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
    if (cleanUrl.startsWith('uploads/slides/')) {
      const uploadsBaseDir = path.resolve(process.cwd(), 'public/uploads/slides');
      const targetFilePath = path.resolve(process.cwd(), 'public', cleanUrl);
      if (targetFilePath.startsWith(uploadsBaseDir) && fs.existsSync(targetFilePath)) {
        try {
          fs.unlinkSync(targetFilePath);
          fileRemoved = true;
        } catch (err) {
          console.error('Failed to unlink slide photo file:', err);
        }
      }
    }
  }

  db.heroSlides = db.heroSlides.filter(s => s.id !== id);
  saveDatabase(db);

  addAuditLog(
    { id: req.currentAdmin!.id, email: req.currentAdmin!.email, fullName: req.currentAdmin!.fullName },
    'HERO_SLIDE_DELETED',
    `Deleted homepage hero slide "${item.title}" (ID: ${item.id})`
  );

  res.json({ success: true, message: 'Hero slide removed successfully.' });
});

// Slide image upload endpoint
app.post('/api/admin/slides/upload', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { fileData } = req.body;
    if (!fileData) {
      res.status(400).json({ error: 'No image file data provided.' });
      return;
    }

    const match = fileData.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!match) {
      res.status(400).json({ error: 'Invalid file format. Please upload a valid image (JPG, PNG, WEBP).' });
      return;
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > 15 * 1024 * 1024) {
      res.status(400).json({ error: 'Image file size exceeds the 15MB limit.' });
      return;
    }

    const mimeExtMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp'
    };
    const ext = mimeExtMap[mimeType] || 'jpg';
    const safeName = `slide_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const uploadsDir = path.resolve(process.cwd(), 'public/uploads/slides');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const destPath = path.join(uploadsDir, safeName);
    fs.writeFileSync(destPath, buffer);

    const relativeUrl = `/uploads/slides/${safeName}`;
    res.json({ success: true, url: relativeUrl, filename: safeName });
  } catch (err: any) {
    console.error('Slide file upload error:', err);
    res.status(500).json({ error: `File upload failed: ${err.message}` });
  }
});

// Gallery Management
app.get('/api/admin/gallery', requireAuth, (_req, res) => {
  const db = getDatabase();
  res.json({ gallery: db.galleryItems });
});

app.post('/api/admin/gallery', requireAuth, (req: AuthenticatedRequest, res) => {
  const { title, caption, category, imageUrl, isPublished, displayOrder } = req.body;
  if (!title?.en || !imageUrl) {
    res.status(400).json({ error: 'Title and image URL are required.' });
    return;
  }

  const db = getDatabase();
  const newItem: GalleryItem = {
    id: `gal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: {
      en: title.en,
      rw: title.rw || title.en,
      fr: title.fr || title.en
    },
    caption: {
      en: caption?.en || '',
      rw: caption?.rw || caption?.en || '',
      fr: caption?.fr || caption?.en || ''
    },
    category: category || 'campus',
    imageUrl,
    isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    displayOrder: displayOrder || db.galleryItems.length + 1,
    uploadedAt: new Date().toISOString()
  };

  db.galleryItems.push(newItem);
  saveDatabase(db);

  addAuditLog(
    { id: req.currentAdmin!.id, email: req.currentAdmin!.email, fullName: req.currentAdmin!.fullName },
    'GALLERY_IMAGE_ADDED',
    `Added image "${newItem.title.en}" to category ${newItem.category}`
  );

  res.json({ success: true, item: newItem });
});

app.put('/api/admin/gallery/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const idx = db.galleryItems.findIndex(g => g.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Gallery item not found.' });
    return;
  }

  db.galleryItems[idx] = { ...db.galleryItems[idx], ...req.body };
  saveDatabase(db);

  addAuditLog(
    { id: req.currentAdmin!.id, email: req.currentAdmin!.email, fullName: req.currentAdmin!.fullName },
    'GALLERY_IMAGE_UPDATED',
    `Updated gallery item "${db.galleryItems[idx].title.en}"`
  );

  res.json({ success: true, item: db.galleryItems[idx] });
});

// Upload photo file directly to server's managed uploads directory
app.post('/api/admin/gallery/upload', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { fileData, fileName } = req.body;
    if (!fileData) {
      res.status(400).json({ error: 'No image file data provided.' });
      return;
    }

    const match = fileData.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!match) {
      res.status(400).json({ error: 'Invalid file format. Please upload a valid image file (JPG, PNG, WEBP).' });
      return;
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > 10 * 1024 * 1024) {
      res.status(400).json({ error: 'Image file size exceeds the 10MB limit.' });
      return;
    }

    const mimeExtMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif'
    };
    const ext = mimeExtMap[mimeType] || 'jpg';
    const safeName = `gallery_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const uploadsDir = path.resolve(process.cwd(), 'public/uploads/gallery');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const destPath = path.join(uploadsDir, safeName);
    fs.writeFileSync(destPath, buffer);

    const relativeUrl = `/uploads/gallery/${safeName}`;
    res.json({ success: true, url: relativeUrl, filename: safeName });
  } catch (err: any) {
    console.error('Gallery file upload error:', err);
    res.status(500).json({ error: `File upload failed: ${err.message}` });
  }
});

app.delete('/api/admin/gallery/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const item = db.galleryItems.find(g => g.id === id);
  if (!item) {
    res.status(404).json({ error: 'Gallery photo not found.' });
    return;
  }

  // Safe file removal: if the photo image file is managed in the server's uploads directory, remove it
  let fileRemoved = false;
  const imageUrl = item.imageUrl || '';
  if (imageUrl) {
    const cleanUrl = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
    if (cleanUrl.startsWith('uploads/')) {
      const uploadsBaseDir = path.resolve(process.cwd(), 'public/uploads');
      const targetFilePath = path.resolve(process.cwd(), 'public', cleanUrl);

      // Strict path verification to prevent directory traversal
      if (targetFilePath.startsWith(uploadsBaseDir) && fs.existsSync(targetFilePath)) {
        try {
          const stat = fs.statSync(targetFilePath);
          if (stat.isFile()) {
            const protectedFiles = ['gsfak_logo.jpg', 'logo.jpg', 'favicon.ico'];
            if (protectedFiles.includes(path.basename(targetFilePath))) {
              res.status(400).json({ error: 'Security violation: protected system file cannot be removed.' });
              return;
            }
            fs.unlinkSync(targetFilePath);
            fileRemoved = true;
          }
        } catch (fileErr: any) {
          console.error('Error removing photo file from disk:', fileErr);
          // If file deletion fails, preserve the database record intact
          res.status(500).json({
            error: `Failed to remove photo file from server storage: ${fileErr.message}. The photo record was kept intact.`
          });
          return;
        }
      }
    }
  }

  // Remove photo record from database
  db.galleryItems = db.galleryItems.filter(g => g.id !== id);
  saveDatabase(db);

  addAuditLog(
    { id: req.currentAdmin!.id, email: req.currentAdmin!.email, fullName: req.currentAdmin!.fullName },
    'GALLERY_IMAGE_DELETED',
    `Deleted gallery photo "${item.title.en}" (ID: ${item.id})${fileRemoved ? ' and removed associated file from uploads directory' : ''}`
  );

  res.json({
    success: true,
    message: fileRemoved
      ? 'Gallery photo and associated file were successfully deleted.'
      : 'Gallery photo record was successfully deleted.'
  });
});

// Staff Photo File Upload
app.post('/api/admin/staff/upload', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { fileData } = req.body;
    if (!fileData) {
      res.status(400).json({ error: 'No image file data provided.' });
      return;
    }

    const match = fileData.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!match) {
      res.status(400).json({ error: 'Invalid file format. Please upload a valid image file (JPG, PNG, WEBP).' });
      return;
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > 10 * 1024 * 1024) {
      res.status(400).json({ error: 'Image file size exceeds the 10MB limit.' });
      return;
    }

    const mimeExtMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp'
    };
    const ext = mimeExtMap[mimeType] || 'jpg';
    const safeName = `staff_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const uploadsDir = path.resolve(process.cwd(), 'public/uploads/staff');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const destPath = path.join(uploadsDir, safeName);
    fs.writeFileSync(destPath, buffer);

    const relativeUrl = `/uploads/staff/${safeName}`;
    res.json({ success: true, url: relativeUrl, filename: safeName });
  } catch (err: any) {
    console.error('Staff photo upload error:', err);
    res.status(500).json({ error: `File upload failed: ${err.message}` });
  }
});

// Staff Management
app.get('/api/admin/staff', requireAuth, (_req, res) => {
  const db = getDatabase();
  res.json({ staff: db.staffMembers });
});

app.post('/api/admin/staff', requireAuth, (req: AuthenticatedRequest, res) => {
  const { fullName, category, title, department, qualification, emailPlaceholder, photoUrl, displayOrder, isPublished } = req.body;
  if (!fullName || !fullName.trim()) {
    res.status(400).json({ error: 'Full name is required.' });
    return;
  }

  const staffCategory = category === 'leader' ? 'leader' : 'teacher';
  let titleObj = title;
  if (!titleObj || !titleObj.en) {
    titleObj = staffCategory === 'teacher'
      ? { en: 'Teacher', rw: 'Umwarimu', fr: 'Enseignant' }
      : { en: 'School Leader', rw: 'Umuyobozi', fr: 'Responsable' };
  }

  const db = getDatabase();
  const newStaff: StaffMember = {
    id: `staff-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    fullName: String(fullName).trim(),
    category: staffCategory,
    title: {
      en: titleObj.en,
      rw: titleObj.rw || titleObj.en,
      fr: titleObj.fr || titleObj.en
    },
    department: department || (staffCategory === 'teacher' ? 'Teaching Faculty' : 'School Administration'),
    qualification: qualification || 'B.Ed. Education',
    emailPlaceholder: emailPlaceholder || 'staff@gsfakibogora.rw (Placeholder)',
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    displayOrder: displayOrder || db.staffMembers.length + 1,
    isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    isPlaceholderNotice: false
  };

  db.staffMembers.push(newStaff);
  saveDatabase(db);

  addAuditLog(
    { id: req.currentAdmin!.id, email: req.currentAdmin!.email, fullName: req.currentAdmin!.fullName },
    'STAFF_MEMBER_ADDED',
    `Added ${staffCategory === 'leader' ? 'school leader' : 'teacher'}: ${newStaff.fullName} (${newStaff.title.en})`
  );

  res.json({ success: true, staff: newStaff });
});

app.put('/api/admin/staff/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const idx = db.staffMembers.findIndex(s => s.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Staff member not found.' });
    return;
  }

  const prevPhoto = db.staffMembers[idx].photoUrl;
  const newPhoto = req.body.photoUrl;

  // If photo was replaced and previous photo was a managed upload, remove old file from server storage
  if (newPhoto && prevPhoto && prevPhoto !== newPhoto && prevPhoto.includes('uploads/staff/')) {
    const cleanPrev = prevPhoto.startsWith('/') ? prevPhoto.slice(1) : prevPhoto;
    const oldFilePath = path.resolve(process.cwd(), 'public', cleanPrev);
    const uploadsBase = path.resolve(process.cwd(), 'public/uploads');
    if (oldFilePath.startsWith(uploadsBase) && fs.existsSync(oldFilePath)) {
      try {
        fs.unlinkSync(oldFilePath);
      } catch (err) {
        console.error('Failed to unlink replaced staff photo:', err);
      }
    }
  }

  db.staffMembers[idx] = {
    ...db.staffMembers[idx],
    ...req.body
  };
  saveDatabase(db);

  addAuditLog(
    { id: req.currentAdmin!.id, email: req.currentAdmin!.email, fullName: req.currentAdmin!.fullName },
    'STAFF_MEMBER_UPDATED',
    `Updated staff profile "${db.staffMembers[idx].fullName}"`
  );

  res.json({ success: true, staff: db.staffMembers[idx] });
});

app.delete('/api/admin/staff/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const member = db.staffMembers.find(s => s.id === id);
  if (!member) {
    res.status(404).json({ error: 'Staff member not found.' });
    return;
  }

  // Safe file removal: only delete if the photo is managed in uploads directory
  let fileRemoved = false;
  const photoUrl = member.photoUrl || '';
  if (photoUrl) {
    const cleanUrl = photoUrl.startsWith('/') ? photoUrl.slice(1) : photoUrl;
    if (cleanUrl.startsWith('uploads/')) {
      const uploadsBaseDir = path.resolve(process.cwd(), 'public/uploads');
      const targetFilePath = path.resolve(process.cwd(), 'public', cleanUrl);

      // Verify path stays inside uploads directory
      if (targetFilePath.startsWith(uploadsBaseDir) && fs.existsSync(targetFilePath)) {
        try {
          const stat = fs.statSync(targetFilePath);
          if (stat.isFile()) {
            const protectedFiles = ['gsfak_logo.jpg', 'logo.jpg', 'gsfak_principal_trophies.jpg', 'gsfak_handball_champions.jpg', 'gsfak_staff_group.jpg'];
            if (protectedFiles.includes(path.basename(targetFilePath))) {
              res.status(400).json({ error: 'Security violation: protected system file cannot be removed.' });
              return;
            }
            fs.unlinkSync(targetFilePath);
            fileRemoved = true;
          }
        } catch (fileErr: any) {
          console.error('Error removing staff photo from disk:', fileErr);
          res.status(500).json({
            error: `Failed to remove staff photo from server storage: ${fileErr.message}. The staff record was kept intact.`
          });
          return;
        }
      }
    }
  }

  db.staffMembers = db.staffMembers.filter(s => s.id !== id);
  saveDatabase(db);

  addAuditLog(
    { id: req.currentAdmin!.id, email: req.currentAdmin!.email, fullName: req.currentAdmin!.fullName },
    'STAFF_MEMBER_DELETED',
    `Deleted staff member: ${member.fullName}${fileRemoved ? ' and removed associated photo file' : ''}`
  );

  res.json({
    success: true,
    message: fileRemoved
      ? 'Staff member and associated photograph were successfully deleted.'
      : 'Staff member record was successfully deleted.'
  });
});

// Contact Messages
app.get('/api/admin/messages', requireAuth, (_req, res) => {
  const db = getDatabase();
  res.json({ messages: db.contactMessages });
});

app.put('/api/admin/messages/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const db = getDatabase();
  const msg = db.contactMessages.find(m => m.id === id);
  if (!msg) {
    res.status(404).json({ error: 'Message not found.' });
    return;
  }

  if (status) msg.status = status;
  if (notes !== undefined) msg.notes = notes;
  saveDatabase(db);

  res.json({ success: true, message: msg });
});

app.delete('/api/admin/messages/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const idx = db.contactMessages.findIndex(m => m.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Inquiry message not found.' });
    return;
  }

  const targetMsg = db.contactMessages[idx];
  db.contactMessages.splice(idx, 1);
  saveDatabase(db);

  addAuditLog(
    { id: req.currentAdmin!.id, email: req.currentAdmin!.email, fullName: req.currentAdmin!.fullName },
    'MESSAGE_DELETED',
    `Permanently deleted inquiry message from ${targetMsg.senderName} (${targetMsg.senderEmail}) - "${targetMsg.subject}"`
  );

  res.json({ success: true, message: 'Inquiry message has been permanently deleted.' });
});

// ---------------------------------------------------------------------
// ADMINISTRATOR ACCOUNTS & REPLACEMENT WORKFLOW (CRITICAL REQUIREMENT)
// ---------------------------------------------------------------------

app.get('/api/admin/users', requireAuth, (_req, res) => {
  const db = getDatabase();
  const safeAdmins = db.admins.map(a => ({
    id: a.id,
    email: a.email,
    fullName: a.fullName,
    role: a.role,
    isActive: a.isActive,
    createdAt: a.createdAt,
    lastLoginAt: a.lastLoginAt,
    createdBy: a.createdBy,
    notes: a.notes
  }));
  res.json({ admins: safeAdmins });
});

app.post('/api/admin/users', requireAuth, requireSuperAdmin, (req: AuthenticatedRequest, res) => {
  const { email, fullName, role, password, notes } = req.body;
  if (!email || !fullName || !role || !password) {
    res.status(400).json({ error: 'Email, full name, role, and temporary password are required.' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    return;
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const db = getDatabase();
  if (db.admins.some(a => a.email.toLowerCase() === cleanEmail)) {
    res.status(400).json({ error: 'An administrator account with this email address already exists.' });
    return;
  }

  const newAdmin: AdminUser = {
    id: `admin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    email: cleanEmail,
    fullName: String(fullName).trim(),
    role: role === 'super_admin' ? 'super_admin' : 'content_admin',
    isActive: true,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
    createdBy: req.currentAdmin!.fullName,
    notes: notes ? String(notes).trim() : undefined
  };

  db.admins.push(newAdmin);
  saveDatabase(db);

  addAuditLog(
    { id: req.currentAdmin!.id, email: req.currentAdmin!.email, fullName: req.currentAdmin!.fullName },
    'ADMIN_ACCOUNT_CREATED',
    `Created new ${newAdmin.role} account for ${newAdmin.fullName} (${newAdmin.email})`
  );

  res.json({
    success: true,
    admin: {
      id: newAdmin.id,
      email: newAdmin.email,
      fullName: newAdmin.fullName,
      role: newAdmin.role,
      isActive: newAdmin.isActive
    }
  });
});

// Edit Administrator Account Details
app.put('/api/admin/users/:id', requireAuth, requireSuperAdmin, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { fullName, email, role, notes } = req.body;

  const db = getDatabase();
  const target = db.admins.find(a => a.id === id);
  if (!target) {
    res.status(404).json({ error: 'Administrator account not found.' });
    return;
  }

  if (fullName) target.fullName = String(fullName).trim();
  if (notes !== undefined) target.notes = String(notes).trim();

  // Validate and change email
  if (email) {
    const cleanEmail = String(email).trim().toLowerCase();
    if (cleanEmail !== target.email.toLowerCase()) {
      if (db.admins.some(a => a.id !== id && a.email.toLowerCase() === cleanEmail)) {
        res.status(400).json({ error: 'Another administrator is already registered with this email address.' });
        return;
      }
      target.email = cleanEmail;
    }
  }

  // Role modification protections
  if (role && (role === 'super_admin' || role === 'content_admin')) {
    if (target.role === 'super_admin' && role === 'content_admin') {
      const superAdminsCount = db.admins.filter(a => a.role === 'super_admin' && a.isActive).length;
      if (superAdminsCount <= 1) {
        res.status(400).json({ error: 'Cannot demote the last active super administrator account.' });
        return;
      }
    }
    target.role = role;
  }

  saveDatabase(db);

  addAuditLog(
    { id: req.currentAdmin!.id, email: req.currentAdmin!.email, fullName: req.currentAdmin!.fullName },
    'ADMIN_ACCOUNT_UPDATED',
    `Updated details for administrator ${target.fullName} (${target.email})`
  );

  res.json({
    success: true,
    message: 'Administrator account updated successfully.',
    admin: {
      id: target.id,
      email: target.email,
      fullName: target.fullName,
      role: target.role,
      isActive: target.isActive,
      notes: target.notes
    }
  });
});

app.put('/api/admin/users/:id/toggle-status', requireAuth, requireSuperAdmin, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const target = db.admins.find(a => a.id === id);

  if (!target) {
    res.status(404).json({ error: 'Administrator not found.' });
    return;
  }

  // Protect against self-deactivation while logged in
  if (target.id === req.currentAdmin!.id) {
    res.status(400).json({ error: 'You cannot deactivate your own administrative account while logged in.' });
    return;
  }

  // Protect against deactivating the last active administrator
  if (target.isActive) {
    const activeAdminsCount = db.admins.filter(a => a.isActive).length;
    if (activeAdminsCount <= 1) {
      res.status(400).json({ error: 'Security Protection: Cannot disable the last active administrator account.' });
      return;
    }

    if (target.role === 'super_admin') {
      const activeSuperAdmins = db.admins.filter(a => a.isActive && a.role === 'super_admin');
      if (activeSuperAdmins.length <= 1) {
        res.status(400).json({ error: 'Security Protection: Cannot disable the last active super administrator account.' });
        return;
      }
    }
  }

  target.isActive = !target.isActive;

  // If deactivated, IMMEDIATELY REVOKE all active sessions for this administrator!
  if (!target.isActive) {
    db.sessions = db.sessions.filter(s => s.adminId !== target.id);
  }

  saveDatabase(db);

  addAuditLog(
    { id: req.currentAdmin!.id, email: req.currentAdmin!.email, fullName: req.currentAdmin!.fullName },
    target.isActive ? 'ADMIN_ACCOUNT_ACTIVATED' : 'ADMIN_ACCOUNT_DEACTIVATED',
    `${target.isActive ? 'Activated' : 'Deactivated'} account ${target.email} and ${target.isActive ? 'restored access' : 'revoked all active sessions'}.`
  );

  res.json({ success: true, isActive: target.isActive });
});

// Delete Administrator Account
app.delete('/api/admin/users/:id', requireAuth, requireSuperAdmin, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const db = getDatabase();
  const target = db.admins.find(a => a.id === id);

  if (!target) {
    res.status(404).json({ error: 'Administrator not found.' });
    return;
  }

  // Protection: Cannot delete own account while logged in
  if (target.id === req.currentAdmin!.id) {
    res.status(400).json({ error: 'Security Protection: You cannot delete your own administrative account while logged in.' });
    return;
  }

  // Protection: Cannot delete last active administrator
  if (target.isActive) {
    const activeAdmins = db.admins.filter(a => a.isActive);
    if (activeAdmins.length <= 1) {
      res.status(400).json({ error: 'Security Protection: Cannot delete the last active administrator account.' });
      return;
    }
  }

  // Protection: Cannot delete last super administrator
  if (target.role === 'super_admin') {
    const superAdmins = db.admins.filter(a => a.role === 'super_admin');
    if (superAdmins.length <= 1) {
      res.status(400).json({ error: 'Security Protection: Cannot delete the last super administrator account.' });
      return;
    }
  }

  // Revoke any active sessions immediately
  db.sessions = db.sessions.filter(s => s.adminId !== target.id);
  // Remove account
  db.admins = db.admins.filter(a => a.id !== id);
  saveDatabase(db);

  addAuditLog(
    { id: req.currentAdmin!.id, email: req.currentAdmin!.email, fullName: req.currentAdmin!.fullName },
    'ADMIN_ACCOUNT_DELETED',
    `Permanently deleted administrator account "${target.fullName}" (${target.email}) and revoked all associated sessions.`
  );

  res.json({ success: true, message: 'Administrator account deleted successfully.' });
});

app.post('/api/admin/users/:id/reset-password', requireAuth, requireSuperAdmin, (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    return;
  }

  const db = getDatabase();
  const target = db.admins.find(a => a.id === id);
  if (!target) {
    res.status(404).json({ error: 'Administrator not found.' });
    return;
  }

  target.passwordHash = hashPassword(newPassword);
  // Invalidate any existing sessions for safety so they re-login
  db.sessions = db.sessions.filter(s => s.adminId !== target.id);
  saveDatabase(db);

  addAuditLog(
    { id: req.currentAdmin!.id, email: req.currentAdmin!.email, fullName: req.currentAdmin!.fullName },
    'ADMIN_PASSWORD_RESET',
    `Reset password for ${target.email} and invalidated existing sessions.`
  );

  res.json({ success: true, message: `Password reset successfully for ${target.email}.` });
});

// GUIDED SUCCESSION / REPLACEMENT WORKFLOW
app.post('/api/admin/users/replace-admin', requireAuth, requireSuperAdmin, (req: AuthenticatedRequest, res) => {
  const {
    predecessorId,
    replacementFullName,
    replacementEmail,
    replacementRole,
    replacementPassword,
    reasonNotes
  } = req.body;

  if (!predecessorId || !replacementFullName || !replacementEmail || !replacementPassword) {
    res.status(400).json({ error: 'Predecessor ID, successor name, email, and password are required.' });
    return;
  }

  const db = getDatabase();
  const predecessor = db.admins.find(a => a.id === predecessorId);
  if (!predecessor) {
    res.status(404).json({ error: 'Predecessor administrator not found.' });
    return;
  }

  if (predecessor.id === req.currentAdmin!.id) {
    res.status(400).json({ error: 'You cannot replace yourself using this self-target wizard.' });
    return;
  }

  const cleanEmail = String(replacementEmail).trim().toLowerCase();
  if (db.admins.some(a => a.email.toLowerCase() === cleanEmail)) {
    res.status(400).json({ error: 'An administrator with this email already exists.' });
    return;
  }

  // 1. Create Successor Account
  const successor: AdminUser = {
    id: `admin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    email: cleanEmail,
    fullName: String(replacementFullName).trim(),
    role: replacementRole === 'super_admin' ? 'super_admin' : 'content_admin',
    isActive: true,
    passwordHash: hashPassword(replacementPassword),
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
    createdBy: req.currentAdmin!.fullName,
    notes: `Successor replacing former administrator ${predecessor.fullName} (${predecessor.email}). Reason: ${reasonNotes || 'Staff role transition'}`
  };
  db.admins.push(successor);

  // 2. Deactivate Predecessor Account
  predecessor.isActive = false;
  predecessor.notes = `Deactivated on ${new Date().toLocaleDateString()} after replacement by ${successor.fullName}. ${predecessor.notes || ''}`;

  // 3. Revoke all active sessions belonging to predecessor
  const revokedCount = db.sessions.filter(s => s.adminId === predecessor.id).length;
  db.sessions = db.sessions.filter(s => s.adminId !== predecessor.id);

  saveDatabase(db);

  // 4. Record high-priority audit trail log
  addAuditLog(
    { id: req.currentAdmin!.id, email: req.currentAdmin!.email, fullName: req.currentAdmin!.fullName },
    'ADMIN_STAFF_REPLACEMENT',
    `Succession executed: Provisioned replacement account "${successor.fullName}" (${successor.email}), deactivated predecessor "${predecessor.fullName}" (${predecessor.email}), and terminated ${revokedCount} active session(s).`
  );

  res.json({
    success: true,
    message: `Succession completed. Replacement account created and predecessor access permanently terminated.`,
    successor: {
      id: successor.id,
      email: successor.email,
      fullName: successor.fullName,
      role: successor.role
    },
    predecessor: {
      id: predecessor.id,
      email: predecessor.email,
      fullName: predecessor.fullName,
      isActive: predecessor.isActive
    }
  });
});

// Self Password Change
app.post('/api/admin/users/change-my-password', requireAuth, (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Both current password and new password are required.' });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    return;
  }

  const db = getDatabase();
  const admin = db.admins.find(a => a.id === req.currentAdmin!.id);
  if (!admin) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  if (!verifyPassword(currentPassword, admin.passwordHash)) {
    res.status(400).json({ error: 'Current password is incorrect.' });
    return;
  }

  admin.passwordHash = hashPassword(newPassword);
  saveDatabase(db);

  addAuditLog(
    { id: admin.id, email: admin.email, fullName: admin.fullName },
    'ADMIN_PASSWORD_CHANGED',
    'User updated their administrative password.'
  );

  res.json({ success: true, message: 'Your password has been changed successfully.' });
});

// Audit Logs
app.get('/api/admin/audit-logs', requireAuth, requireSuperAdmin, (_req, res) => {
  const db = getDatabase();
  res.json({ logs: db.auditLogs });
});

// ---------------------------------------------------------------------
// XAMPP / PHP EXPORT API (Provides downloadable source code & schema)
// ---------------------------------------------------------------------

app.get('/api/export/schema.sql', (_req, res) => {
  const schemaPath = path.resolve(process.cwd(), 'php-app', 'database.sql');
  if (fs.existsSync(schemaPath)) {
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', 'attachment; filename="gsfakibogora_database.sql"');
    res.sendFile(schemaPath);
  } else {
    res.status(404).json({ error: 'Schema file not found.' });
  }
});

app.get('/api/export/php-bundle', (_req, res) => {
  const phpDir = path.resolve(process.cwd(), 'php-app');
  if (!fs.existsSync(phpDir)) {
    res.status(404).json({ error: 'PHP distribution folder not found.' });
    return;
  }

  const files = ['database.sql', 'config.php', 'auth.php', 'index.php', 'login_view.php', 'admin_view.php', 'README.md'];
  const bundle: Record<string, string> = {};

  for (const f of files) {
    const p = path.join(phpDir, f);
    if (fs.existsSync(p)) {
      bundle[f] = fs.readFileSync(p, 'utf-8');
    }
  }

  res.json({ success: true, files: bundle });
});

// ---------------------------------------------------------------------
// VITE DEV SERVER OR STATIC PRODUCTION SERVING
// ---------------------------------------------------------------------

async function startServer() {
  if (!isProduction) {
    // Mount Vite in middleware mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files from dist
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GS FAKIBOGORA Portal running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
