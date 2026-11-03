<?php
// login_view.php - Staff & Administrator Authentication View
?>
<section class="max-w-md mx-auto my-16 px-4">
    <div class="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div class="text-center mb-6">
            <div class="w-16 h-16 bg-white border border-slate-200 rounded-2xl mx-auto flex items-center justify-center mb-3 p-1 overflow-hidden shadow-sm">
                <img src="gsfak_logo.jpg" alt="GS FAKIBOGORA Official Crest" class="w-full h-full object-contain">
            </div>
            <h2 class="text-xl font-bold text-slate-900"><?= e($curT['login_title']) ?></h2>
            <p class="text-xs text-slate-500 mt-1">Authorized personnel credentials only</p>
        </div>

        <?php if (!empty($loginError)): ?>
            <div class="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                <?= e($loginError) ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="index.php?page=admin&flow=login">
            <input type="hidden" name="action" value="admin_login">
            <input type="hidden" name="csrf_token" value="<?= e(get_csrf_token()) ?>">

            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1"><?= e($curT['email_label']) ?></label>
                    <input type="email" name="email" required placeholder="admin@gsfakibogora.rw"
                           class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-900 focus:outline-none">
                </div>

                <div>
                    <label class="block text-xs font-semibold text-slate-700 mb-1"><?= e($curT['pass_label']) ?></label>
                    <div class="relative">
                        <input type="password" id="phpAdminPass" name="password" required placeholder="••••••••"
                               class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-blue-900 focus:outline-none">
                        <button type="button" onclick="togglePass()" class="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-800">
                            Show
                        </button>
                    </div>
                </div>

                <div class="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-600">
                    <span class="font-semibold text-slate-800">Default Super Administrator:</span><br>
                    Email: <code class="text-blue-900">superadmin@gsfakibogora.rw</code><br>
                    Password: <code class="text-blue-900">GSFak@1969#Admin</code>
                </div>

                <button type="submit" class="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-sm transition shadow-sm">
                    <?= e($curT['login_btn']) ?>
                </button>
            </div>
        </form>

        <div class="mt-6 text-center">
            <a href="index.php?page=home" class="text-xs text-slate-500 hover:text-slate-800">
                ← Return to Public School Website
            </a>
        </div>
    </div>
</section>

<script>
function togglePass() {
    const input = document.getElementById('phpAdminPass');
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}
</script>
