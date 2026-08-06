/**
 * Profil PerpusQu - Main JavaScript
 * Logout dibuat serba instan tanpa delay dan perbaikan performa navigasi.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inisialisasi/Validasi Akun & Tanggal Registrasi
    checkLogin();

    // 2. Inisialisasi Seluruh Aplikasi
    initApp();
});

// DEFAULT AVATAR (SVG Base64 Data URI)
const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234A6B5B'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-.85-5.05-2.2.03-1.68 3.37-2.6 5.05-2.6s5.02.92 5.05 2.6C15.8 19.15 14.03 20 12 20z'/></svg>";

/* ==========================================================================
   FUNGSI UTILITY: FORMAT TANGGAL OTOMATIS
   ========================================================================== */
function getTodayFormattedDate() {
    const today = new Date();
    return today.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/* ==========================================================================
   1. PENGECEKAN AKUN & LOGIN
   ========================================================================== */
function checkLogin() {
    let rawUser = localStorage.getItem('currentUser');
    
    if (!rawUser) {
        const dummyUser = {
            fullName: "Siswa PerpusQu",
            username: "siswa_perpusqu",
            class: "XI.4",
            role: "Siswa",
            email: "siswa@perpusqu.sch.id",
            regDate: getTodayFormattedDate(),
            password: "password123"
        };
        localStorage.setItem('currentUser', JSON.stringify(dummyUser));
    } else {
        let userData = JSON.parse(rawUser);
        if (!userData.regDate) {
            userData.regDate = getTodayFormattedDate();
            localStorage.setItem('currentUser', JSON.stringify(userData));
        }
    }
}

function getCurrentUserData() {
    try {
        const raw = localStorage.getItem('currentUser');
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        console.error("Gagal membaca data pengguna", e);
        return null;
    }
}

/* ==========================================================================
   2. INISIALISASI & MEMUAT DATA
   ========================================================================== */
function initApp() {
    loadTheme();
    loadUser();
    loadStatistics();
    loadProfilePhoto();
    setupEventListeners();
}

function loadUser() {
    const user = getCurrentUserData();
    if (!user) return;
    
    document.getElementById('displayFullName').textContent = user.fullName || 'Pengguna PerpusQu';
    document.getElementById('displayUsername').textContent = user.username ? `@${user.username}` : '@user';
    document.getElementById('displayRole').textContent = user.role || 'Siswa';
    document.getElementById('displayClass').textContent = user.class || 'XI.4';
    document.getElementById('displayEmail').textContent = user.email || 'Belum diatur';
    document.getElementById('displayRegDate').textContent = user.regDate || getTodayFormattedDate();
}

function loadStatistics() {
    const user = getCurrentUserData();
    if (!user) return;

    const userHistory = JSON.parse(localStorage.getItem('perpusqu_history')) || [];
    const userReviews = JSON.parse(localStorage.getItem('perpusqu_reviews')) || [];

    const userBorrowHistory = userHistory.filter(item => item.username === user.username);
    const userReviewList = userReviews.filter(item => item.username === user.username);
    const currentlyBorrowed = userBorrowHistory.filter(item => item.status === 'Dipinjam');

    document.getElementById('statTotalBorrowed').textContent = userBorrowHistory.length || 0;
    document.getElementById('statTotalReviews').textContent = userReviewList.length || 0;
    document.getElementById('statCurrentlyBorrowed').textContent = currentlyBorrowed.length || 0;
}

/* ==========================================================================
   3. PENGELOLAAN FOTO PROFIL
   ========================================================================== */
function loadProfilePhoto() {
    const savedPhoto = localStorage.getItem('profilePhoto');
    const avatarImg = document.getElementById('avatarImage');
    const photoActions = document.getElementById('photoActions');

    if (savedPhoto) {
        avatarImg.src = savedPhoto;
        photoActions.style.display = 'block';
    } else {
        avatarImg.src = DEFAULT_AVATAR;
        photoActions.style.display = 'none';
    }
}

function changeProfilePhoto(file) {
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

    if (file.size > maxSizeBytes) {
        showToast('Ukuran foto melebihi batas maksimal 5 MB.');
        return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showToast('Format foto harus JPG, JPEG, PNG, atau WEBP.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64Image = e.target.result;
        localStorage.setItem('profilePhoto', base64Image);
        loadProfilePhoto();
        showToast('Foto berhasil disimpan.');
    };
    reader.readAsDataURL(file);
}

function removeProfilePhoto() {
    localStorage.removeItem('profilePhoto');
    loadProfilePhoto();
    showToast('Foto berhasil dihapus.');
}

/* ==========================================================================
   4. KELOLA DATA AKUN
   ========================================================================== */
function updateAccount(event) {
    event.preventDefault();
    
    const fullName = document.getElementById('editFullName').value.trim();
    const username = document.getElementById('editUsername').value.trim();
    const className = document.getElementById('editClass').value.trim();
    const email = document.getElementById('editEmail').value.trim();

    if (!fullName || !username || !className || !email) {
        showToast('Semua bidang harus diisi.');
        return;
    }

    const currentUser = getCurrentUserData();
    const allUsers = JSON.parse(localStorage.getItem('perpusqu_users')) || [];

    const isUsernameTaken = allUsers.some(u => u.username === username && u.username !== currentUser.username);
    if (isUsernameTaken) {
        showToast('Username sudah digunakan oleh pengguna lain.');
        return;
    }

    const updatedUser = {
        ...currentUser,
        fullName: fullName,
        username: username,
        class: className,
        email: email,
        regDate: currentUser.regDate || getTodayFormattedDate()
    };

    const userIndex = allUsers.findIndex(u => u.username === currentUser.username);
    if (userIndex !== -1) {
        allUsers[userIndex] = updatedUser;
    } else {
        allUsers.push(updatedUser);
    }

    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    localStorage.setItem('perpusqu_users', JSON.stringify(allUsers));

    loadUser();
    closeModal('modalAccount');
    showToast('Data berhasil diperbarui.');
}

/* ==========================================================================
   5. UBAH PASSWORD
   ========================================================================== */
function updatePassword(event) {
    event.preventDefault();

    const oldPw = document.getElementById('oldPassword').value;
    const newPw = document.getElementById('newPassword').value;
    const confirmPw = document.getElementById('confirmPassword').value;
    
    const currentUser = getCurrentUserData();

    if (currentUser.password && oldPw !== currentUser.password) {
        showToast('Password lama tidak sesuai.');
        return;
    }

    if (newPw.length < 8) {
        showToast('Password baru minimal 8 karakter.');
        return;
    }

    if (newPw === oldPw) {
        showToast('Password baru tidak boleh sama dengan password lama.');
        return;
    }

    if (newPw !== confirmPw) {
        showToast('Konfirmasi password baru tidak cocok.');
        return;
    }

    currentUser.password = newPw;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    const allUsers = JSON.parse(localStorage.getItem('perpusqu_users')) || [];
    const userIndex = allUsers.findIndex(u => u.username === currentUser.username);
    if (userIndex !== -1) {
        allUsers[userIndex].password = newPw;
        localStorage.setItem('perpusqu_users', JSON.stringify(allUsers));
    }

    document.getElementById('formPassword').reset();
    closeModal('modalPassword');
    showToast('Password berhasil diubah.');
}

function togglePassword(button) {
    const targetId = button.getAttribute('data-target');
    const inputField = document.getElementById(targetId);
    const icon = button.querySelector('i');

    if (inputField.type === 'password') {
        inputField.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        inputField.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

/* ==========================================================================
   6. PENGATURAN TEMA
   ========================================================================== */
function loadTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    applyTheme(currentTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeLabel = document.getElementById('currentThemeLabel');
    if (themeLabel) {
        themeLabel.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
    }

    const btnLight = document.getElementById('btnThemeLight');
    const btnDark = document.getElementById('btnThemeDark');
    
    if (btnLight && btnDark) {
        if (theme === 'dark') {
            btnDark.classList.add('selected');
            btnLight.classList.remove('selected');
        } else {
            btnLight.classList.add('selected');
            btnDark.classList.remove('selected');
        }
    }
}

function changeTheme(theme) {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    showToast('Tema berhasil diubah.');
}

/* ==========================================================================
   7. LOGOUT USER (OPTIMASI SUPER CEPAT)
   ========================================================================== */
function logoutUser() {
    // 1. Hapus status login
    localStorage.removeItem('currentUser');
    
    // 2. Langsung redirect secara instan tanpa delay setTimeout
    window.location.replace('login.html');
}

/* ==========================================================================
   8. HELPER MODAL & TOAST
   ========================================================================== */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function showToast(message) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fa-solid fa-circle-check toast-icon"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/* ==========================================================================
   9. EVENT LISTENERS SETUP
   ========================================================================== */
function setupEventListeners() {
    const btnChangePhoto = document.getElementById('btnChangePhoto');
    const filePhotoInput = document.getElementById('filePhotoInput');
    const btnRemovePhoto = document.getElementById('btnRemovePhoto');

    if (btnChangePhoto && filePhotoInput) {
        btnChangePhoto.addEventListener('click', () => filePhotoInput.click());
        filePhotoInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                changeProfilePhoto(e.target.files[0]);
            }
        });
    }
    
    if (btnRemovePhoto) {
        btnRemovePhoto.addEventListener('click', removeProfilePhoto);
    }

    // Modal Kelola Akun
    const btnOpenAccount = document.getElementById('btnOpenAccountModal');
    if (btnOpenAccount) {
        btnOpenAccount.addEventListener('click', () => {
            const user = getCurrentUserData();
            if (user) {
                document.getElementById('editFullName').value = user.fullName || '';
                document.getElementById('editUsername').value = user.username || '';
                document.getElementById('editClass').value = user.class || '';
                document.getElementById('editEmail').value = user.email || '';
            }
            openModal('modalAccount');
        });
    }

    document.getElementById('btnCloseAccountModal')?.addEventListener('click', () => closeModal('modalAccount'));
    document.getElementById('btnCancelAccount')?.addEventListener('click', () => closeModal('modalAccount'));
    document.getElementById('formAccount')?.addEventListener('submit', updateAccount);

    // Modal Password
    document.getElementById('btnOpenPasswordModal')?.addEventListener('click', () => {
        document.getElementById('formPassword')?.reset();
        openModal('modalPassword');
    });
    document.getElementById('btnClosePasswordModal')?.addEventListener('click', () => closeModal('modalPassword'));
    document.getElementById('btnCancelPassword')?.addEventListener('click', () => closeModal('modalPassword'));
    document.getElementById('formPassword')?.addEventListener('submit', updatePassword);

    // Toggle Password Visibility
    document.querySelectorAll('.btn-toggle-pw').forEach(btn => {
        btn.addEventListener('click', function () {
            togglePassword(this);
        });
    });

    // Modal Tema
    document.getElementById('btnOpenThemeModal')?.addEventListener('click', () => openModal('modalTheme'));
    document.getElementById('btnCloseThemeModal')?.addEventListener('click', () => closeModal('modalTheme'));
    document.getElementById('btnThemeLight')?.addEventListener('click', () => {
        changeTheme('light');
        closeModal('modalTheme');
    });
    document.getElementById('btnThemeDark')?.addEventListener('click', () => {
        changeTheme('dark');
        closeModal('modalTheme');
    });

    // Modal Bantuan
    document.getElementById('btnOpenHelpModal')?.addEventListener('click', () => openModal('modalHelp'));
    document.getElementById('btnCloseHelpModal')?.addEventListener('click', () => closeModal('modalHelp'));
    document.getElementById('btnOkHelp')?.addEventListener('click', () => closeModal('modalHelp'));

    // Modal Logout
    document.getElementById('btnOpenLogoutModal')?.addEventListener('click', () => openModal('modalLogout'));
    document.getElementById('btnCloseLogoutModal')?.addEventListener('click', () => closeModal('modalLogout'));
    document.getElementById('btnCancelLogout')?.addEventListener('click', () => closeModal('modalLogout'));
    
    // Pemicu Logout Langsung
    document.getElementById('btnConfirmLogout')?.addEventListener('click', logoutUser);

    // Close Modal Outside Click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(overlay.id);
            }
        });
    });
}