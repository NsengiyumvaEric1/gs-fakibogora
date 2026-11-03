<?php
// admin_view.php - Fully Integrated Admin Dashboard View (XAMPP / PHP)
$tab = $_GET['tab'] ?? 'overview';

// Metrics from DB
$cntPubAnn = $pdo->query("SELECT COUNT(*) FROM news_announcements WHERE is_published = 1 AND type = 'announcement'")->fetchColumn();
$cntDraftAnn = $pdo->query("SELECT COUNT(*) FROM news_announcements WHERE is_published = 0")->fetchColumn();
$cntNews = $pdo->query("SELECT COUNT(*) FROM news_announcements WHERE is_published = 1 AND type != 'announcement'")->fetchColumn();
$cntGal = $pdo->query("SELECT COUNT(*) FROM gallery_items WHERE is_published = 1")->fetchColumn();
$cntAdmins = $pdo->query("SELECT COUNT(*) FROM admins WHERE is_active = 1")->fetchColumn();
$cntStaff = $pdo->query("SELECT COUNT(*) FROM staff_members")->fetchColumn();
$cntMsgs = $pdo->query("SELECT COUNT(*) FROM contact_messages WHERE status = 'unread'")->fetchColumn();
?>
<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <!-- Header strip -->
    <div class="bg-white border border-slate-200 rounded-2xl p-6 mb-8 flex flex-wrap justify-between items-center gap-4 shadow-sm">
        <div>
            <div class="flex items-center gap-2 text-xs font-semibold text-blue-900 mb-1">
                <span>GS FAKIBOGORA ADMINISTRATION PORTAL</span>
                <span>·</span>
                <span class="capitalize text-emerald-700 font-bold"><?= e($currentAdmin['role_key']) ?></span>
            </div>
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight">
                Welcome, <?= e($currentAdmin['full_name']) ?>
            </h2>
            <p class="text-xs text-slate-500 mt-1">Logged in with <?= e($currentAdmin['email']) ?></p>
        </div>
        <div class="flex items-center gap-3">
            <a href="index.php?page=home" class="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50">
                View Public Site
            </a>
            <a href="index.php?action=logout" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm">
                Log Out
            </a>
        </div>
    </div>

    <!-- Navigation tabs -->
    <div class="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-4 text-xs font-semibold">
        <a href="index.php?page=admin&tab=overview" class="px-4 py-2 rounded-xl transition <?= $tab === 'overview' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' ?>">Dashboard Overview</a>
        <a href="index.php?page=admin&tab=announcements" class="px-4 py-2 rounded-xl transition <?= $tab === 'announcements' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' ?>">News & Announcements (<?= $cntPubAnn + $cntDraftAnn ?>)</a>
        <a href="index.php?page=admin&tab=gallery" class="px-4 py-2 rounded-xl transition <?= $tab === 'gallery' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' ?>">Gallery (<?= $cntGal ?>)</a>
        <a href="index.php?page=admin&tab=staff" class="px-4 py-2 rounded-xl transition <?= $tab === 'staff' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' ?>">Staff Management (<?= $cntStaff ?>)</a>
        <a href="index.php?page=admin&tab=messages" class="px-4 py-2 rounded-xl transition <?= $tab === 'messages' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' ?>">Contact Inquiries (<?= $cntMsgs ?> Unread)</a>
        <a href="index.php?page=admin&tab=admins" class="px-4 py-2 rounded-xl transition <?= $tab === 'admins' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' ?>">Administrator Accounts (<?= $cntAdmins ?>)</a>
        <a href="index.php?page=admin&tab=replacement" class="px-4 py-2 rounded-xl transition <?= $tab === 'replacement' ? 'bg-amber-600 text-white' : 'bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100' ?>">★ Replace Administrator Wizard</a>
        <a href="index.php?page=admin&tab=audit" class="px-4 py-2 rounded-xl transition <?= $tab === 'audit' ? 'bg-blue-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' ?>">Audit Logs</a>
    </div>

    <!-- Tab 1: Overview Metrics -->
    <?php if ($tab === 'overview'): ?>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span class="text-xs text-slate-500 font-medium">Published Notices</span>
                <p class="text-2xl font-bold text-slate-900 mt-1"><?= $cntPubAnn ?></p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span class="text-xs text-slate-500 font-medium">Draft Notices</span>
                <p class="text-2xl font-bold text-amber-700 mt-1"><?= $cntDraftAnn ?></p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span class="text-xs text-slate-500 font-medium">News Articles</span>
                <p class="text-2xl font-bold text-slate-900 mt-1"><?= $cntNews ?></p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span class="text-xs text-slate-500 font-medium">Gallery Photos</span>
                <p class="text-2xl font-bold text-slate-900 mt-1"><?= $cntGal ?></p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span class="text-xs text-slate-500 font-medium">Active Admins</span>
                <p class="text-2xl font-bold text-blue-900 mt-1"><?= $cntAdmins ?></p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span class="text-xs text-slate-500 font-medium">Unread Messages</span>
                <p class="text-2xl font-bold text-rose-600 mt-1"><?= $cntMsgs ?></p>
            </div>
        </div>

        <!-- Recent Audit Log Strip -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-slate-900 text-base">Recent System & Administrative Actions</h3>
                <a href="index.php?page=admin&tab=audit" class="text-xs text-blue-900 font-semibold hover:underline">View All Logs →</a>
            </div>
            <?php
            $logs = $pdo->query("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5")->fetchAll();
            ?>
            <div class="divide-y divide-slate-100 text-xs">
                <?php foreach ($logs as $l): ?>
                    <div class="py-3 flex flex-col sm:flex-row justify-between gap-2">
                        <div>
                            <span class="font-bold text-slate-800"><?= e($l['action']) ?></span>
                            <span class="text-slate-400">·</span>
                            <span class="text-slate-600"><?= e($l['details']) ?></span>
                        </div>
                        <div class="text-slate-400 whitespace-nowrap">
                            <?= e($l['admin_name']) ?> (<?= e($l['created_at']) ?>)
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

    <!-- Tab: Staff Management (Teachers & School Leaders) -->
    <?php elseif ($tab === 'staff'): ?>
        <?php
        $staffList = $pdo->query("SELECT * FROM staff_members ORDER BY display_order ASC, id ASC")->fetchAll();
        ?>
        <div class="space-y-6">
            <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 class="font-bold text-slate-900 text-lg">Staff Profiles & Faculty Management</h3>
                    <p class="text-xs text-slate-500 mt-0.5">
                        Manage teachers and school leaders. Teachers display only their name and photo publicly; leaders display name, photo, and official position.
                    </p>
                </div>
                <button
                    type="button"
                    onclick="document.getElementById('add-staff-modal').classList.remove('hidden')"
                    class="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer shrink-0"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Staff Member</span>
                </button>
            </div>

            <!-- Add Staff Modal -->
            <div id="add-staff-modal" class="hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                <div class="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center pb-3 border-b border-slate-100 sticky top-0 bg-white">
                        <h3 class="font-bold text-slate-950 text-base">Add New Staff Member</h3>
                        <button
                            type="button"
                            onclick="document.getElementById('add-staff-modal').classList.add('hidden')"
                            class="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    <form method="POST" action="index.php?page=admin&tab=staff" enctype="multipart/form-data" class="space-y-4">
                        <input type="hidden" name="action" value="add_staff_member">
                        <input type="hidden" name="csrf_token" value="<?= e(get_csrf_token()) ?>">

                        <!-- Category Selector -->
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Staff Category *</label>
                            <div class="grid grid-cols-2 gap-3">
                                <label class="flex items-center gap-2 p-2.5 rounded-xl border border-blue-900 bg-blue-50/70 text-blue-950 font-bold cursor-pointer">
                                    <input type="radio" name="category" value="teacher" checked class="text-blue-900">
                                    <span>Teacher</span>
                                </label>
                                <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold cursor-pointer">
                                    <input type="radio" name="category" value="leader" class="text-amber-600">
                                    <span>School Leader</span>
                                </label>
                            </div>
                            <p class="text-[11px] text-slate-500 mt-1">
                                Notice: Teachers display only their name and photo on the public website. Leaders also display their official position.
                            </p>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Full Name *</label>
                            <input
                                type="text"
                                name="full_name"
                                required
                                placeholder="e.g., Jean-Paul Ndayisaba"
                                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                            >
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Role / Teaching Specialization</label>
                            <input
                                type="text"
                                name="title_en"
                                placeholder="e.g., Mathematics & Physics Teacher or Headmaster"
                                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                            >
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Upload Photograph (JPG, PNG, WEBP max 10MB)</label>
                            <input
                                type="file"
                                name="staff_photo"
                                accept="image/jpeg,image/png,image/webp"
                                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-white"
                            >
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Or Photo URL</label>
                            <input
                                type="text"
                                name="photo_url"
                                placeholder="https://..."
                                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                            >
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Department</label>
                            <input
                                type="text"
                                name="department"
                                placeholder="e.g., Science & Mathematics Faculty"
                                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                            >
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Academic Qualification</label>
                            <input
                                type="text"
                                name="qualification"
                                placeholder="e.g., B.Ed. in Physical Sciences"
                                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                            >
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Email / Contact Placeholder</label>
                            <input
                                type="text"
                                name="email_placeholder"
                                placeholder="staff@gsfakibogora.rw"
                                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                            >
                        </div>

                        <div class="pt-3 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                            <button
                                type="button"
                                onclick="document.getElementById('add-staff-modal').classList.add('hidden')"
                                class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                class="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold cursor-pointer"
                            >
                                Save Staff Member
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Staff Grid -->
            <?php if (empty($staffList)): ?>
                <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center text-sm text-slate-500">
                    <p class="font-semibold text-slate-800 text-base mb-1">No Staff Profiles Found</p>
                    <p class="text-xs">Add teachers or school leaders using the button above.</p>
                </div>
            <?php else: ?>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <?php foreach ($staffList as $st): ?>
                        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                            <div>
                                <div class="flex items-center gap-4 mb-3">
                                    <img
                                        src="<?= e($st['photo_url']) ?>"
                                        alt="<?= e($st['full_name']) ?>"
                                        class="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                                        onerror="this.src='gsfak_logo.jpg'; this.className='w-14 h-14 rounded-xl object-contain p-2 bg-slate-50 border border-slate-200';"
                                    >
                                    <div class="overflow-hidden">
                                        <div class="flex items-center gap-1.5 flex-wrap">
                                            <h4 class="font-bold text-slate-900 text-sm truncate"><?= e($st['full_name']) ?></h4>
                                            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider <?= ($st['category'] ?? 'teacher') === 'leader' ? 'bg-amber-100 text-amber-900' : 'bg-blue-50 text-blue-800' ?>">
                                                <?= ($st['category'] ?? 'teacher') === 'leader' ? 'Leader' : 'Teacher' ?>
                                            </span>
                                        </div>
                                        <p class="text-xs text-blue-900 font-semibold truncate"><?= e($st['title_en']) ?></p>
                                        <p class="text-[11px] text-slate-400 truncate"><?= e($st['department']) ?></p>
                                    </div>
                                </div>
                                <div class="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                                    <p><span class="font-semibold">Qualification:</span> <?= e($st['qualification']) ?></p>
                                    <p><span class="font-semibold">Email:</span> <?= e($st['email_placeholder']) ?></p>
                                    <?php if (($st['category'] ?? 'teacher') === 'teacher'): ?>
                                        <p class="text-[11px] text-slate-400 italic">Public site rule: Only name and photograph are shown publicly.</p>
                                    <?php else: ?>
                                        <p class="text-[11px] text-slate-400 italic">Public site rule: Name, photo, and official title are shown publicly.</p>
                                    <?php endif; ?>
                                </div>
                            </div>
                            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                <button
                                    type="button"
                                    onclick="document.getElementById('edit-staff-modal-<?= (int)$st['id'] ?>').classList.remove('hidden')"
                                    class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                                >
                                    <span>Edit</span>
                                </button>
                                <form
                                    method="POST"
                                    action="index.php?page=admin&tab=staff"
                                    onsubmit="return confirm('Are you sure you want to delete this staff member?');"
                                    class="inline-block m-0 p-0"
                                >
                                    <input type="hidden" name="action" value="delete_staff_member">
                                    <input type="hidden" name="csrf_token" value="<?= e(get_csrf_token()) ?>">
                                    <input type="hidden" name="staff_id" value="<?= (int)$st['id'] ?>">
                                    <button
                                        type="submit"
                                        class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition cursor-pointer"
                                    >
                                        <svg class="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>Delete</span>
                                    </button>
                                </form>
                            </div>
                        </div>

                        <!-- Edit Staff Modal for <?= (int)$st['id'] ?> -->
                        <div id="edit-staff-modal-<?= (int)$st['id'] ?>" class="hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                            <div class="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
                                <div class="flex justify-between items-center pb-3 border-b border-slate-100 sticky top-0 bg-white">
                                    <h3 class="font-bold text-slate-950 text-base">Edit Staff Member</h3>
                                    <button
                                        type="button"
                                        onclick="document.getElementById('edit-staff-modal-<?= (int)$st['id'] ?>').classList.add('hidden')"
                                        class="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form method="POST" action="index.php?page=admin&tab=staff" enctype="multipart/form-data" class="space-y-4">
                                    <input type="hidden" name="action" value="edit_staff_member">
                                    <input type="hidden" name="csrf_token" value="<?= e(get_csrf_token()) ?>">
                                    <input type="hidden" name="staff_id" value="<?= (int)$st['id'] ?>">

                                    <div>
                                        <label class="block font-bold text-slate-700 mb-1">Staff Category *</label>
                                        <div class="grid grid-cols-2 gap-3">
                                            <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold cursor-pointer">
                                                <input type="radio" name="category" value="teacher" <?= ($st['category'] ?? 'teacher') === 'teacher' ? 'checked' : '' ?> class="text-blue-900">
                                                <span>Teacher</span>
                                            </label>
                                            <label class="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold cursor-pointer">
                                                <input type="radio" name="category" value="leader" <?= ($st['category'] ?? 'teacher') === 'leader' ? 'checked' : '' ?> class="text-amber-600">
                                                <span>School Leader</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label class="block font-bold text-slate-700 mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            required
                                            value="<?= e($st['full_name']) ?>"
                                            class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                                        >
                                    </div>

                                    <div>
                                        <label class="block font-bold text-slate-700 mb-1">Role / Position Title</label>
                                        <input
                                            type="text"
                                            name="title_en"
                                            value="<?= e($st['title_en']) ?>"
                                            class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                                        >
                                    </div>

                                    <div>
                                        <label class="block font-bold text-slate-700 mb-1">Replace Photograph (File upload)</label>
                                        <input
                                            type="file"
                                            name="staff_photo"
                                            accept="image/jpeg,image/png,image/webp"
                                            class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-white"
                                        >
                                    </div>

                                    <div>
                                        <label class="block font-bold text-slate-700 mb-1">Or Photo URL</label>
                                        <input
                                            type="text"
                                            name="photo_url"
                                            value="<?= e($st['photo_url']) ?>"
                                            class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                                        >
                                    </div>

                                    <div>
                                        <label class="block font-bold text-slate-700 mb-1">Department</label>
                                        <input
                                            type="text"
                                            name="department"
                                            value="<?= e($st['department']) ?>"
                                            class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                                        >
                                    </div>

                                    <div>
                                        <label class="block font-bold text-slate-700 mb-1">Academic Qualification</label>
                                        <input
                                            type="text"
                                            name="qualification"
                                            value="<?= e($st['qualification']) ?>"
                                            class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                                        >
                                    </div>

                                    <div>
                                        <label class="block font-bold text-slate-700 mb-1">Contact Placeholder</label>
                                        <input
                                            type="text"
                                            name="email_placeholder"
                                            value="<?= e($st['email_placeholder']) ?>"
                                            class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                                        >
                                    </div>

                                    <div class="pt-3 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                                        <button
                                            type="button"
                                            onclick="document.getElementById('edit-staff-modal-<?= (int)$st['id'] ?>').classList.add('hidden')"
                                            class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            class="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold cursor-pointer"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>

    <!-- Tab: Administrator Accounts Management & Security -->
    <?php elseif ($tab === 'admins'): ?>
        <?php
        $admins = $pdo->query("SELECT * FROM admins ORDER BY id ASC")->fetchAll();
        $isSuperAdmin = ($currentAdmin['role_key'] === 'super_admin');
        ?>
        <div class="space-y-6">
            <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 class="font-bold text-slate-900 text-lg">Administrator Accounts & Access Control</h3>
                    <p class="text-xs text-slate-500 mt-0.5">Role-Based Access Control (Super Administrator vs Content Administrator)</p>
                </div>
                <div class="flex items-center gap-2">
                    <button
                        type="button"
                        onclick="document.getElementById('change-password-modal').classList.remove('hidden')"
                        class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
                    >
                        Change My Password
                    </button>
                    <?php if ($isSuperAdmin): ?>
                        <button
                            type="button"
                            onclick="document.getElementById('create-admin-modal').classList.remove('hidden')"
                            class="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <span>Add Administrator</span>
                        </button>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Create Admin Modal -->
            <?php if ($isSuperAdmin): ?>
                <div id="create-admin-modal" class="hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                    <div class="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
                        <div class="flex justify-between items-center pb-3 border-b border-slate-100">
                            <h3 class="font-bold text-slate-950 text-base">New Administrator Account</h3>
                            <button
                                type="button"
                                onclick="document.getElementById('create-admin-modal').classList.add('hidden')"
                                class="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form method="POST" action="index.php?page=admin&tab=admins" class="space-y-4">
                            <input type="hidden" name="action" value="add_admin">
                            <input type="hidden" name="csrf_token" value="<?= e(get_csrf_token()) ?>">

                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    required
                                    placeholder="e.g., Claudine Mukamana"
                                    class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                                >
                            </div>

                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="c.mukamana@gsfakibogora.rw"
                                    class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                                >
                            </div>

                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Administrative Role *</label>
                                <select
                                    name="role_key"
                                    class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                                >
                                    <option value="content_admin">Content Administrator</option>
                                    <option value="super_admin">Super Administrator</option>
                                </select>
                            </div>

                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Temporary Password *</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    placeholder="Minimum 8 characters"
                                    class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                                >
                            </div>

                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Administrative Notes</label>
                                <input
                                    type="text"
                                    name="notes"
                                    placeholder="e.g., Academic Registrar"
                                    class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                                >
                            </div>

                            <div class="pt-3 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onclick="document.getElementById('create-admin-modal').classList.add('hidden')"
                                    class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    class="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold cursor-pointer"
                                >
                                    Provision Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            <?php endif; ?>

            <!-- Change Password Modal -->
            <div id="change-password-modal" class="hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                <div class="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
                    <div class="flex justify-between items-center pb-3 border-b border-slate-100">
                        <h3 class="font-bold text-slate-950 text-base">Change Administrator Password</h3>
                        <button
                            type="button"
                            onclick="document.getElementById('change-password-modal').classList.add('hidden')"
                            class="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    <form method="POST" action="index.php?page=admin&tab=admins" class="space-y-4">
                        <input type="hidden" name="action" value="change_my_password">
                        <input type="hidden" name="csrf_token" value="<?= e(get_csrf_token()) ?>">

                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Current Password *</label>
                            <input
                                type="password"
                                name="current_password"
                                required
                                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                            >
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 mb-1">New Password (min 8 chars) *</label>
                            <input
                                type="password"
                                name="new_password"
                                required
                                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                            >
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Confirm New Password *</label>
                            <input
                                type="password"
                                name="confirm_password"
                                required
                                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                            >
                        </div>

                        <div class="pt-3 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onclick="document.getElementById('change-password-modal').classList.add('hidden')"
                                class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                class="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold cursor-pointer"
                            >
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Admins Table -->
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead>
                            <tr class="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold bg-slate-50">
                                <th class="py-3 px-4">Admin Name</th>
                                <th class="py-3 px-4">Email</th>
                                <th class="py-3 px-4">Role</th>
                                <th class="py-3 px-4">Status</th>
                                <th class="py-3 px-4">Last Login</th>
                                <th class="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <?php foreach ($admins as $a): ?>
                                <tr>
                                    <td class="py-3.5 px-4 font-bold text-slate-900">
                                        <?= e($a['full_name']) ?>
                                        <?php if (!empty($a['notes'])): ?>
                                            <span class="block text-[10px] text-slate-400 font-normal"><?= e($a['notes']) ?></span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="py-3.5 px-4 text-slate-600"><?= e($a['email']) ?></td>
                                    <td class="py-3.5 px-4">
                                        <span class="px-2.5 py-1 rounded-md font-semibold <?= $a['role_key'] === 'super_admin' ? 'bg-purple-100 text-purple-900' : 'bg-slate-100 text-slate-700' ?>">
                                            <?= e($a['role_key']) ?>
                                        </span>
                                    </td>
                                    <td class="py-3.5 px-4">
                                        <span class="font-semibold <?= $a['is_active'] ? 'text-emerald-700' : 'text-rose-600' ?>">
                                            ● <?= $a['is_active'] ? 'Active' : 'Deactivated' ?>
                                        </span>
                                    </td>
                                    <td class="py-3.5 px-4 text-slate-500"><?= e($a['last_login_at'] ?? 'Never') ?></td>
                                    <td class="py-3.5 px-4 text-right">
                                        <div class="flex items-center justify-end gap-1.5 flex-wrap">
                                            <!-- Edit button -->
                                            <?php if ($isSuperAdmin || (int)$a['id'] === (int)$currentAdmin['id']): ?>
                                                <button
                                                    type="button"
                                                    onclick="document.getElementById('edit-admin-modal-<?= (int)$a['id'] ?>').classList.remove('hidden')"
                                                    class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                            <?php endif; ?>

                                            <!-- Toggle status button -->
                                            <?php if ($isSuperAdmin && (int)$a['id'] !== (int)$currentAdmin['id']): ?>
                                                <form
                                                    method="POST"
                                                    action="index.php?page=admin&tab=admins"
                                                    onsubmit="return confirm('Are you sure you want to <?= $a['is_active'] ? 'DEACTIVATE' : 'ACTIVATE' ?> this administrator?');"
                                                    class="inline-block m-0 p-0"
                                                >
                                                    <input type="hidden" name="action" value="toggle_admin_status">
                                                    <input type="hidden" name="csrf_token" value="<?= e(get_csrf_token()) ?>">
                                                    <input type="hidden" name="admin_id" value="<?= (int)$a['id'] ?>">
                                                    <button
                                                        type="submit"
                                                        class="px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer <?= $a['is_active'] ? 'bg-amber-50 hover:bg-amber-100 text-amber-800' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800' ?>"
                                                    >
                                                        <?= $a['is_active'] ? 'Deactivate' : 'Reactivate' ?>
                                                    </button>
                                                </form>

                                                <!-- Delete button -->
                                                <form
                                                    method="POST"
                                                    action="index.php?page=admin&tab=admins"
                                                    onsubmit="return confirm('Are you sure you want to delete this administrator account?');"
                                                    class="inline-block m-0 p-0"
                                                >
                                                    <input type="hidden" name="action" value="delete_admin">
                                                    <input type="hidden" name="csrf_token" value="<?= e(get_csrf_token()) ?>">
                                                    <input type="hidden" name="admin_id" value="<?= (int)$a['id'] ?>">
                                                    <button
                                                        type="submit"
                                                        class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>
                                                </form>
                                            <?php endif; ?>

                                            <?php if ((int)$a['id'] === (int)$currentAdmin['id']): ?>
                                                <span class="text-slate-400 italic text-[11px] px-2 py-1">(Your Account)</span>
                                            <?php endif; ?>
                                        </div>
                                    </td>
                                </tr>

                                <!-- Edit Admin Modal for <?= (int)$a['id'] ?> -->
                                <div id="edit-admin-modal-<?= (int)$a['id'] ?>" class="hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                                    <div class="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
                                        <div class="flex justify-between items-center pb-3 border-b border-slate-100">
                                            <h3 class="font-bold text-slate-950 text-base">Edit Administrator</h3>
                                            <button
                                                type="button"
                                                onclick="document.getElementById('edit-admin-modal-<?= (int)$a['id'] ?>').classList.add('hidden')"
                                                class="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <form method="POST" action="index.php?page=admin&tab=admins" class="space-y-4">
                                            <input type="hidden" name="action" value="edit_admin">
                                            <input type="hidden" name="csrf_token" value="<?= e(get_csrf_token()) ?>">
                                            <input type="hidden" name="admin_id" value="<?= (int)$a['id'] ?>">

                                            <div>
                                                <label class="block font-bold text-slate-700 mb-1">Full Name *</label>
                                                <input
                                                    type="text"
                                                    name="full_name"
                                                    required
                                                    value="<?= e($a['full_name']) ?>"
                                                    class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                                                >
                                            </div>

                                            <div>
                                                <label class="block font-bold text-slate-700 mb-1">Email Address *</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    value="<?= e($a['email']) ?>"
                                                    class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                                                >
                                            </div>

                                            <?php if ($isSuperAdmin && (int)$a['id'] !== (int)$currentAdmin['id']): ?>
                                                <div>
                                                    <label class="block font-bold text-slate-700 mb-1">Administrative Role *</label>
                                                    <select
                                                        name="role_key"
                                                        class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                                                    >
                                                        <option value="content_admin" <?= $a['role_key'] === 'content_admin' ? 'selected' : '' ?>>Content Administrator</option>
                                                        <option value="super_admin" <?= $a['role_key'] === 'super_admin' ? 'selected' : '' ?>>Super Administrator</option>
                                                    </select>
                                                </div>
                                            <?php endif; ?>

                                            <div>
                                                <label class="block font-bold text-slate-700 mb-1">Administrative Notes</label>
                                                <input
                                                    type="text"
                                                    name="notes"
                                                    value="<?= e($a['notes'] ?? '') ?>"
                                                    class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                                                >
                                            </div>

                                            <div class="pt-3 border-t border-slate-100 flex justify-end gap-3">
                                                <button
                                                    type="button"
                                                    onclick="document.getElementById('edit-admin-modal-<?= (int)$a['id'] ?>').classList.add('hidden')"
                                                    class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    class="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold cursor-pointer"
                                                >
                                                    Save Changes
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    <!-- Tab: Replace Administrator Wizard -->
    <?php elseif ($tab === 'replacement'): ?>
        <div class="bg-white rounded-2xl border border-amber-200 p-8 shadow-sm max-w-3xl mx-auto">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center font-bold">
                    ★
                </div>
                <div>
                    <h3 class="font-bold text-slate-900 text-lg">Staff Succession & Administrator Replacement Workflow</h3>
                    <p class="text-xs text-slate-500">Security procedure when an administrator leaves GS FAKIBOGORA or changes duties</p>
                </div>
            </div>

            <div class="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed mb-6">
                <strong>Official Protocol:</strong> When an employee leaves, their password must NEVER be handed to another person.
                Instead, a new account is issued for the replacement employee, and the predecessor's account is permanently deactivated with all active sessions terminated.
            </div>

            <ol class="space-y-4 text-xs text-slate-700 border-l-2 border-amber-500 pl-4 my-6">
                <li>
                    <strong>Step 1: Create Successor Account</strong>
                    <p class="text-slate-500 mt-0.5">The Super Administrator provisions a distinct account for the incoming employee with their verified institutional email.</p>
                </li>
                <li>
                    <strong>Step 2: Assign Strict Least-Privilege Role</strong>
                    <p class="text-slate-500 mt-0.5">Designate either Super Administrator or Content Administrator based on formal job responsibilities.</p>
                </li>
                <li>
                    <strong>Step 3: Deactivate Predecessor & Revoke Active Sessions</strong>
                    <p class="text-slate-500 mt-0.5">The departing administrator's account is flagged inactive, immediately invalidating any active cookie or session token.</p>
                </li>
                <li>
                    <strong>Step 4: Formal Audit Trail Logging</strong>
                    <p class="text-slate-500 mt-0.5">The transition is recorded permanently in the institutional audit log with actor ID and timestamp.</p>
                </li>
            </ol>
        </div>

    <!-- Tab: Audit Logs -->
    <?php elseif ($tab === 'audit'): ?>
        <?php
        $logs = $pdo->query("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50")->fetchAll();
        ?>
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 class="font-bold text-slate-900 text-lg mb-4">Institutional Security & Audit Trail</h3>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead>
                        <tr class="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                            <th class="py-3 px-4">Timestamp</th>
                            <th class="py-3 px-4">Action</th>
                            <th class="py-3 px-4">Actor</th>
                            <th class="py-3 px-4">IP Address</th>
                            <th class="py-3 px-4">Details</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <?php foreach ($logs as $l): ?>
                            <tr>
                                <td class="py-3.5 px-4 text-slate-400 whitespace-nowrap"><?= e($l['created_at']) ?></td>
                                <td class="py-3.5 px-4 font-bold text-blue-900"><?= e($l['action']) ?></td>
                                <td class="py-3.5 px-4 text-slate-700"><?= e($l['admin_name']) ?></td>
                                <td class="py-3.5 px-4 text-slate-500"><?= e($l['ip_address'] ?? '127.0.0.1') ?></td>
                                <td class="py-3.5 px-4 text-slate-600"><?= e($l['details']) ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>

    <!-- Tab: Gallery Management -->
    <?php elseif ($tab === 'gallery'): ?>
        <?php
        $photos = $pdo->query("SELECT * FROM gallery_items ORDER BY display_order ASC, id DESC")->fetchAll();
        ?>
        <div class="space-y-6">
            <!-- Header bar with Add Photo button -->
            <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 class="font-bold text-slate-900 text-lg">School Image Archives & Gallery Management</h3>
                    <p class="text-xs text-slate-500 mt-0.5">
                        Upload new photos, manage campus archives, or delete outdated images from database and server storage.
                    </p>
                </div>
                <button
                    type="button"
                    onclick="document.getElementById('add-gallery-modal').classList.remove('hidden')"
                    class="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer shrink-0"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Upload / Add Photo</span>
                </button>
            </div>

            <!-- Upload / Add Photo Modal -->
            <div id="add-gallery-modal" class="hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
                <div class="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 text-xs">
                    <div class="flex justify-between items-center pb-3 border-b border-slate-100">
                        <h3 class="font-bold text-slate-950 text-base">Upload Photo to School Gallery</h3>
                        <button
                            type="button"
                            onclick="document.getElementById('add-gallery-modal').classList.add('hidden')"
                            class="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>

                    <form method="POST" action="index.php?page=admin&tab=gallery" enctype="multipart/form-data" class="space-y-4">
                        <input type="hidden" name="action" value="add_gallery_photo">
                        <input type="hidden" name="csrf_token" value="<?= e(get_csrf_token()) ?>">

                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Photo Title *</label>
                            <input
                                type="text"
                                name="title_en"
                                required
                                placeholder="e.g., Senior 5 Chemistry Laboratory Session"
                                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                            >
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Category *</label>
                            <select
                                name="category"
                                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                            >
                                <option value="campus">Campus Grounds & Buildings</option>
                                <option value="labs">Science Laboratories</option>
                                <option value="academics">Classrooms & Library</option>
                                <option value="sports">Athletics & Sports Grounds</option>
                                <option value="events">Cultural & Official Events</option>
                            </select>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Upload Photo File (JPG, PNG, WEBP max 10MB)</label>
                            <input
                                type="file"
                                name="photo_file"
                                accept="image/jpeg,image/png,image/webp"
                                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-900 file:text-white hover:file:bg-blue-800"
                            >
                        </div>

                        <div class="flex items-center gap-2 my-1 text-[11px] text-slate-400">
                            <span class="flex-1 border-t border-slate-200"></span>
                            <span>OR SPECIFY IMAGE URL</span>
                            <span class="flex-1 border-t border-slate-200"></span>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Image URL (Optional if file is chosen)</label>
                            <input
                                type="text"
                                name="image_url"
                                placeholder="https://..."
                                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                            >
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Caption / Description</label>
                            <textarea
                                name="caption_en"
                                rows="2"
                                placeholder="Brief explanatory caption..."
                                class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                            ></textarea>
                        </div>

                        <div class="pt-3 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onclick="document.getElementById('add-gallery-modal').classList.add('hidden')"
                                class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                class="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold cursor-pointer"
                            >
                                Save to Gallery
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Photos Grid -->
            <?php if (empty($photos)): ?>
                <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center text-sm text-slate-500">
                    <p class="font-semibold text-slate-800 text-base mb-1">No Gallery Photos Found</p>
                    <p class="text-xs">Use the button above to upload new photographs to the school gallery.</p>
                </div>
            <?php else: ?>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <?php foreach ($photos as $p): ?>
                        <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
                            <div>
                                <div class="relative w-full h-48 bg-slate-100 overflow-hidden">
                                    <img
                                        src="<?= e($p['image_url']) ?>"
                                        alt="<?= e($p['title_en']) ?>"
                                        class="w-full h-full object-cover"
                                        onerror="this.src='gsfak_logo.jpg'; this.className='w-full h-full object-contain p-4 bg-slate-50';"
                                    >
                                    <div class="absolute top-2.5 left-2.5">
                                        <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-xs">
                                            <?= e($p['category']) ?>
                                        </span>
                                    </div>
                                    <?php if (str_contains($p['image_url'], 'uploads/')): ?>
                                        <div class="absolute top-2.5 right-2.5">
                                            <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600/90 text-white backdrop-blur-xs">
                                                Managed File
                                            </span>
                                        </div>
                                    <?php endif; ?>
                                </div>
                                <div class="p-4">
                                    <h4 class="font-bold text-slate-900 text-sm line-clamp-1">
                                        <?= e($p['title_en']) ?>
                                    </h4>
                                    <p class="text-xs text-slate-500 mt-1 line-clamp-2">
                                        <?= e($p['caption_en'] ?: 'No caption provided.') ?>
                                    </p>
                                </div>
                            </div>
                            <div class="p-4 pt-0 border-t border-slate-100 mt-2 flex justify-between items-center text-xs">
                                <span class="text-slate-400 text-[11px]">
                                    <?= date('M d, Y', strtotime($p['uploaded_at'] ?? 'now')) ?>
                                </span>
                                
                                <!-- Secure Delete Form with CSRF protection, input validation, and confirmation -->
                                <form
                                    method="POST"
                                    action="index.php?page=admin&tab=gallery"
                                    onsubmit="return confirm('Are you sure you want to delete this photo?');"
                                    class="inline-block m-0 p-0"
                                >
                                    <input type="hidden" name="action" value="delete_gallery_photo">
                                    <input type="hidden" name="csrf_token" value="<?= e(get_csrf_token()) ?>">
                                    <input type="hidden" name="photo_id" value="<?= (int)$p['id'] ?>">
                                    <button
                                        type="submit"
                                        title="Delete this photo"
                                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 font-bold text-xs transition shadow-2xs cursor-pointer"
                                    >
                                        <svg class="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>Delete</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>

    <!-- Fallback / Announcements tabs -->
    <?php else: ?>
        <div class="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-600">
            Select a module from the navigation strip above to review or update school records.
        </div>
    <?php endif; ?>

</section>
