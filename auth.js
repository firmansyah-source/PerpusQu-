/**
 * ==========================================================================
 * PerpusQu - Authentication Controller (js/auth.js)
 * ==========================================================================
 * Pusat logika autentikasi (pendaftaran, login, logout, sesi, dan validasi akun).
 */

const AUTH_KEYS = {
    USERS: 'users',
    CURRENT_USER: 'currentUser',
    REMEMBER_ME: 'rememberMe'
};

// Data pengguna bawaan saat aplikasi pertama kali dijalankan
const DEFAULT_USERS_DATA = [
    {
        id: 101,
        nama: 'Firman Utina',
        username: 'firmannn',
        email: 'firman@perpusqu.id',
        kelas: 'XI RPL 1',
        nisn: '0051234567',
        noHp: '081234567890',
        foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        password: 'masuk123'
    },
    {
        id: 102,
        nama: 'Administrator',
        username: 'admin',
        email: 'admin@perpusqu.id',
        kelas: 'Staf Perpustakaan',
        nisn: '1234567890',
        noHp: '089876543210',
        foto: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
        password: 'admin123'
    }
];

// Helper Storage Sederhana jika StorageHelper belum terdefinisi secara global
const StorageHelper = {
    getData: (key, defaultValue = null) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error("Error reading localStorage:", e);
            return defaultValue;
        }
    },
    saveData: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error("Error writing to localStorage:", e);
            return false;
        }
    },
    removeData: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error("Error removing from localStorage:", e);
            return false;
        }
    }
};

/**
 * Mendapatkan seluruh daftar akun pengguna
 * @returns {Array}
 */
function getUsers() {
    const users = StorageHelper.getData(AUTH_KEYS.USERS, null);
    if (!users || !Array.isArray(users) || users.length === 0) {
        StorageHelper.saveData(AUTH_KEYS.USERS, DEFAULT_USERS_DATA);
        return DEFAULT_USERS_DATA;
    }

    // Memastikan akun 'firmannn' selalu tersedia atau ter-update
    const hasFirman = users.some(u => u.username.toLowerCase() === 'firmannn');
    if (!hasFirman) {
        users.push(DEFAULT_USERS_DATA[0]);
        StorageHelper.saveData(AUTH_KEYS.USERS, users);
    }

    return users;
}

/**
 * Menyimpan seluruh daftar akun pengguna
 * @param {Array} usersArray 
 * @returns {boolean}
 */
function saveUsers(usersArray) {
    return StorageHelper.saveData(AUTH_KEYS.USERS, usersArray);
}

/**
 * Memeriksa keberadaan username dalam penyimpanan
 * @param {string} username 
 * @returns {boolean}
 */
function usernameExists(username) {
    const users = getUsers();
    const cleanUser = username.trim().toLowerCase();
    return users.some(u => u.username.toLowerCase() === cleanUser);
}

/**
 * Memeriksa keberadaan email dalam penyimpanan
 * @param {string} email 
 * @returns {boolean}
 */
function emailExists(email) {
    const users = getUsers();
    const cleanEmail = email.trim().toLowerCase();
    return users.some(u => u.email.toLowerCase() === cleanEmail);
}

/**
 * Mendapatkan data pengguna yang sedang login
 * @returns {Object|null}
 */
function getCurrentUser() {
    return StorageHelper.getData(AUTH_KEYS.CURRENT_USER, null);
}

/**
 * Memeriksa apakah pengguna memiliki sesi login aktif
 * @returns {boolean}
 */
function isLoggedIn() {
    return getCurrentUser() !== null;
}

/**
 * Guard untuk halaman yang membutuhkan login
 */
function checkAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}

/**
 * Mendaftarkan akun baru ke Local Storage
 * @param {Object} userData 
 * @returns {Object} { success: boolean, message: string }
 */
function registerUser(userData) {
    try {
        const users = getUsers();

        if (usernameExists(userData.username)) {
            return { success: false, message: 'Username sudah digunakan.' };
        }

        if (emailExists(userData.email)) {
            return { success: false, message: 'Email sudah terdaftar.' };
        }
        
        const newUser = {
            id: Date.now(),
            nama: userData.nama.trim(),
            username: userData.username.trim().toLowerCase(),
            email: userData.email.trim().toLowerCase(),
            kelas: userData.kelas || 'Siswa',
            nisn: userData.nisn || '-',
            noHp: userData.noHp || '-',
            foto: userData.foto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
            password: userData.password
        };

        users.push(newUser);
        const saved = saveUsers(users);

        if (saved) {
            return { success: true, message: 'Pendaftaran akun berhasil!' };
        } else {
            return { success: false, message: 'Gagal menyimpan data ke penyimpanan lokal.' };
        }
    } catch (e) {
        console.error("registerUser Error:", e);
        return { success: false, message: 'Terjadi kesalahan sistem.' };
    }
}

/**
 * Melakukan proses login pengguna
 * @param {string} username 
 * @param {string} password 
 * @param {boolean} remember 
 * @returns {Object} { success: boolean, message: string }
 */
function loginUser(username, password, remember = false) {
    try {
        const users = getUsers();
        const cleanUser = username.trim().toLowerCase();
        const cleanPwd = password.trim();

        const foundUser = users.find(u => u.username.toLowerCase() === cleanUser && u.password === cleanPwd);

        if (foundUser) {
            // Salin objek user tanpa menyertakan field password untuk keamanan
            const safeUser = { ...foundUser };
            delete safeUser.password;

            // Simpan ke currentUser
            StorageHelper.saveData(AUTH_KEYS.CURRENT_USER, safeUser);

            // Kelola status Remember Me
            if (remember) {
                StorageHelper.saveData(AUTH_KEYS.REMEMBER_ME, cleanUser);
            } else {
                StorageHelper.removeData(AUTH_KEYS.REMEMBER_ME);
            }

            return { success: true, message: 'Login berhasil!', user: safeUser };
        } else {
            return { success: false, message: 'Username atau Password salah.' };
        }
    } catch (e) {
        console.error("loginUser Error:", e);
        return { success: false, message: 'Terjadi kesalahan sistem.' };
    }
}

/**
 * Memperbarui data profil pengguna aktif
 * @param {Object} updatedData 
 * @returns {boolean}
 */
function updateProfile(updatedData) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id || u.username === currentUser.username);

    if (userIndex !== -1) {
        // Update data pada array users
        users[userIndex] = { ...users[userIndex], ...updatedData };
        saveUsers(users);

        // Update data currentUser aktif
        const safeUser = { ...users[userIndex] };
        delete safeUser.password;
        StorageHelper.saveData(AUTH_KEYS.CURRENT_USER, safeUser);

        return true;
    }
    return false;
}

/**
 * Menghapus sesi akun dan keluar ke halaman login
 */
function logoutUser() {
    StorageHelper.removeData(AUTH_KEYS.CURRENT_USER);
    window.location.href = 'login.html';
}

/**
 * Utility Toast Notification yang kompatibel dengan Font Awesome
 * @param {string} msg 
 * @param {string} type 
 */
function showToast(msg, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            width: calc(100% - 40px);
            max-width: 400px;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgColors = {
        success: '#198754',
        danger: '#dc3545',
        info: '#6b8e23'
    };

    const icons = {
        success: 'fa-circle-check',
        danger: 'fa-circle-xmark',
        info: 'fa-circle-info'
    };

    toast.style.cssText = `
        background-color: ${bgColors[type] || bgColors.info};
        color: #FFFFFF;
        padding: 12px 18px;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 500;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        opacity: 0;
        transform: translateY(-15px);
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        pointer-events: auto;
    `;

    toast.innerHTML = `
        <i class="fa-solid ${icons[type] || icons.info}" style="font-size:1.1rem;"></i>
        <span>${msg}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-15px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Otomatis inisialisasi daftar user bawaan saat skrip dimuat
getUsers();
