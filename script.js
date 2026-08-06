/**
 * SISTEM AUTHENTICATION PERPUSQU
 * Mengelola Register, Login, Logout, Validasi Form, dan Local Storage
 */

// Kunci penyimpanan Local Storage
const USERS_KEY = 'perpusqu_users';
const SESSION_KEY = 'perpusqu_session';

// ==========================================
// UTILITY / HELPER FUNCTIONS
// ==========================================

/**
 * Mengambil array daftar pengguna dari Local Storage
 */
function getUsersFromStorage() {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
}

/**
 * Menyimpan array daftar pengguna ke Local Storage
 */
function saveUsersToStorage(usersArray) {
    localStorage.setItem(USERS_KEY, JSON.stringify(usersArray));
}

/**
 * Menampilkan pesan alert/error pada halaman
 */
function showAlert(message, type = 'error') {
    const alertBox = document.getElementById('alertBox');
    const authCard = document.querySelector('.auth-card');

    if (!alertBox) return;

    alertBox.textContent = message;
    alertBox.className = `alert-box ${type}`;

    // Jalankan efek Shake jika terjadi error
    if (type === 'error' && authCard) {
        authCard.classList.remove('shake');
        // Trigger reflow untuk reset animasi
        void authCard.offsetWidth;
        authCard.classList.add('shake');
    }
}

/**
 * Menyembunyikan alert box
 */
function hideAlert() {
    const alertBox = document.getElementById('alertBox');
    if (alertBox) {
        alertBox.className = 'alert-box';
        alertBox.textContent = '';
    }
}

/**
 * Mengatur tampilan loading spinner pada tombol submit
 */
function setLoading(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner');

    if (isLoading) {
        button.disabled = true;
        if (btnText) btnText.classList.add('hidden');
        if (spinner) spinner.classList.remove('hidden');
    } else {
        button.disabled = false;
        if (btnText) btnText.classList.remove('hidden');
        if (spinner) spinner.classList.add('hidden');
    }
}

/**
 * Menyiapkan fitur Show / Hide Password
 */
function setupPasswordToggle(inputId, buttonId) {
    const pwInput = document.getElementById(inputId);
    const toggleBtn = document.getElementById(buttonId);

    if (pwInput && toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isPassword = pwInput.type === 'password';
            pwInput.type = isPassword ? 'text' : 'password';
            toggleBtn.textContent = isPassword ? '🙈' : '👁️';
        });
    }
}

// ==========================================
// LOGIKA UNTUK HALAMAN REGISTER
// ==========================================
function initRegister() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    // Inisialisasi Toggle Password
    setupPasswordToggle('regPassword', 'toggleRegPwBtn');

    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        hideAlert();

        // Ambil nilai input
        const usernameInput = document.getElementById('regUsername').value.trim();
        const kelasInput = document.getElementById('regKelas').value.trim();
        const passwordInput = document.getElementById('regPassword').value;

        // --- VALIDASI REGISTER ---
        if (!usernameInput) {
            showAlert('Username wajib diisi.');
            return;
        }

        if (usernameInput.length < 4) {
            showAlert('Username minimal 4 karakter.');
            return;
        }

        // Cek spasi pada username
        if (/\s/.test(usernameInput)) {
            showAlert('Username tidak boleh ada spasi.');
            return;
        }

        if (!kelasInput) {
            showAlert('Kelas wajib diisi.');
            return;
        }

        if (!passwordInput) {
            showAlert('Password wajib diisi.');
            return;
        }

        if (passwordInput.length < 5) {
            showAlert('Password minimal 5 karakter.');
            return;
        }

        // --- CEK DUPLIKASI USERNAME ---
        const users = getUsersFromStorage();
        const isExist = users.some(user => user.username.toLowerCase() === usernameInput.toLowerCase());

        if (isExist) {
            showAlert('Username sudah digunakan.');
            return;
        }

        // Aktifkan Loading Spinner
        setLoading('regSubmitBtn', true);

        // Simulasi delay singkat agar animasi loading terlihat
        setTimeout(() => {
            // Simpan User Baru
            const newUser = {
                username: usernameInput,
                kelas: kelasInput,
                password: passwordInput
            };

            users.push(newUser);
            saveUsersToStorage(users);

            // Tampilkan Alert Sukses
            showAlert('Registrasi berhasil! Mengalihkan ke halaman Login...', 'success');

            // Pindah ke halaman login setelah 1.5 detik
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);

        }, 800);
    });
}

// ==========================================
// LOGIKA UNTUK HALAMAN LOGIN
// ==========================================
function initLogin() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    // Inisialisasi Toggle Password
    setupPasswordToggle('password', 'togglePwBtn');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        hideAlert();

        // Ambil Nilai Input
        const usernameInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value;

        // --- VALIDASI LOGIN ---
        if (!usernameInput) {
            showAlert('Username wajib diisi.');
            return;
        }

        if (!passwordInput) {
            showAlert('Password wajib diisi.');
            return;
        }

        // Aktifkan Loading Spinner
        setLoading('submitBtn', true);

        setTimeout(() => {
            const users = getUsersFromStorage();

            // Cari user yang cocok
            const foundUser = users.find(user => 
                user.username.toLowerCase() === usernameInput.toLowerCase() && 
                user.password === passwordInput
            );

            if (foundUser) {
                // Simpan status session login
                const sessionData = {
                    username: foundUser.username,
                    kelas: foundUser.kelas,
                    loginTime: new Date().getTime()
                };
                localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

                showAlert('Login berhasil! Masuk ke Dashboard...', 'success');

                // Redirect ke Dashboard (index.html)
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                setLoading('submitBtn', false);
                showAlert('Username atau Password salah.');
            }
        }, 800);
    });
}

// ==========================================
// LOGIKA DASHBOARD & LOGOUT
// ==========================================
function initDashboard() {
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    // Cek Session Login
    const sessionRaw = localStorage.getItem(SESSION_KEY);
    const currentPage = window.location.pathname.split('/').pop();

    // Jika di halaman Dashboard (index.html / root) dan belum login -> lempar ke login.html
    if (!sessionRaw && (currentPage === '' || currentPage === 'index.html')) {
        window.location.href = 'login.html';
        return;
    }

    // Jika di halaman Login/Register tapi SUDAH login -> lempar ke index.html
    if (sessionRaw && (currentPage === 'login.html' || currentPage === 'register.html')) {
        window.location.href = 'index.html';
        return;
    }

    // Tampilkan informasi profil jika ada session
    if (sessionRaw && document.getElementById('navUsername')) {
        const session = JSON.parse(sessionRaw);
        document.getElementById('navUsername').textContent = session.username;
        document.getElementById('menuUsername').textContent = session.username;
        document.getElementById('menuKelas').textContent = `Kelas: ${session.kelas}`;
    }

    // Toggle Dropdown Menu Profil
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        // Tutup dropdown jika mengklik luar area
        document.addEventListener('click', () => {
            profileDropdown.classList.remove('show');
        });
    }

    // --- LOGOUT LOGIC ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Hapus status session login saja (tanpa menghapus data akun di USERS_KEY)
            localStorage.removeItem(SESSION_KEY);
            
            // Redirect kembali ke halaman login
            window.location.href = 'login.html';
        });
    }
}

// ==========================================
// EVENT LISTENER LOAD PADA DOKUMEN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initRegister();
    initLogin();
    initDashboard();
});