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
        id: 1,
        nama: 'Firman Utina',
        username: 'firman123',
        email: 'firman@email.com',
        kelas: 'XI-A',
        password: 'password123'
    },
    {
        id: 2,
        nama: 'Administrator',
        username: 'admin',
        email: 'admin@perpusqu.id',
        kelas: 'Umum/Staf',
        password: 'admin123'
    }
];

/**
 * Mendapatkan seluruh daftar akun pengguna
 * @returns {Array}
 */
function getUsers() {
    const users = StorageHelper.getData(AUTH_KEYS.USERS, null);
    if (!users) {
        StorageHelper.saveData(AUTH_KEYS.USERS, DEFAULT_USERS_DATA);
        return DEFAULT_USERS_DATA;
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
 * Mendaftarkan akun baru ke Local Storage
 * @param {Object} userData 
 * @returns {Object} { success: boolean, message: string }
 */
function registerUser(userData) {
    try {
        const users = getUsers();
        
        const newUser = {
            id: Date.now(),
            nama: userData.nama.trim(),
            username: userData.username.trim().toLowerCase(),
            email: userData.email.trim().toLowerCase(),
            kelas: userData.kelas,
            password: userData.password
        };

        users.push(newUser);
        const saved = saveUsers(users);

        if (saved) {
            return { success: true, message: 'Akun berhasil mendaftar!' };
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
            // Salin objek user tanpa password
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

            return { success: true, message: 'Login berhasil!' };
        } else {
            return { success: false, message: 'Username atau Password salah.' };
        }
    } catch (e) {
        console.error("loginUser Error:", e);
        return { success: false, message: 'Terjadi kesalahan sistem.' };
    }
}

/**
 * Menghapus sesi akun dan keluar
 */
function logoutUser() {
    StorageHelper.removeData(AUTH_KEYS.CURRENT_USER);
    window.location.href = 'login.html';
}

/**
 * Utility Toast Notification
 * @param {string} msg 
 * @param {string} type 
 */
function showToast(msg, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const bgColors = {
        success: '#7FA37A',
        danger: '#FF5A5A',
        info: '#6E9169'
    };

    toast.style.cssText = `
        background-color: ${bgColors[type] || bgColors.info};
        color: #FFFFFF;
        padding: 12px 16px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 500;
        box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        opacity: 0;
        transform: translateY(-15px);
        transition: all 0.3s ease;
        pointer-events: auto;
    `;

    toast.innerHTML = `
        <span class="material-symbols-outlined" style="font-size:18px;">
            ${type === 'danger' ? 'error' : type === 'success' ? 'check_circle' : 'info'}
        </span>
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