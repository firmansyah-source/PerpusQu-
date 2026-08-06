/**
 * JAVASCRIPT DASHBOARD PERPUSQU (FIXED)
 */

// Kunci penyimpanan Local Storage yang seragam di semua file
const KEYS = {
    SESSION: 'currentUser', // disesuaikan agar sama dengan login.js, register.js & profil.js
    THEME: 'theme',        // disesuaikan agar sama dengan profil.js
    STATS: 'perpusqu_stats'
};

const QUOTES = [
    "Membaca adalah jendela dunia.",
    "Hari ini membaca, besok menginspirasi.",
    "Satu buku dapat mengubah masa depan.",
    "Ilmu bertambah setiap kali kamu membuka buku.",
    "Buku adalah sahabat paling setia dalam belajar."
];

// ==========================================
// 1. CEK OTENTIKASI HAK AKSES
// ==========================================
function checkAuth() {
    const sessionRaw = localStorage.getItem(KEYS.SESSION);
    
    // Jika tidak ada data login, lempar langsung ke login.html
    if (!sessionRaw) {
        window.location.href = 'login.html';
        return null;
    }

    try {
        return JSON.parse(sessionRaw);
    } catch (e) {
        window.location.href = 'login.html';
        return null;
    }
}

// ==========================================
// 2. INISIALISASI & TAMPILKAN USER INFO
// ==========================================
function renderUserInfo(user) {
    if (!user) return;

    const userGreetingEl = document.getElementById('userGreeting');
    const userRoleEl = document.getElementById('userRole');
    const userClassEl = document.getElementById('userClass');

    // Mengakomodasi beragam struktur objek user (fullName / nama / username)
    const displayName = user.fullName || user.nama || user.username || 'Siswa';

    if (userGreetingEl) userGreetingEl.textContent = `Halo, ${displayName}`;
    if (userRoleEl) userRoleEl.textContent = user.role || 'Siswa';
    if (userClassEl) userClassEl.textContent = user.class || user.kelas || '-';
}

// ==========================================
// 3. TEMA LIGHT / DARK MODE
// ==========================================
function initTheme() {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    
    const currentTheme = localStorage.getItem(KEYS.THEME) || 'light';

    document.documentElement.setAttribute('data-theme', currentTheme);
    if (themeIcon) {
        if (currentTheme === 'dark') {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        } else {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const activeTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = activeTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem(KEYS.THEME, newTheme);

            if (themeIcon) {
                if (newTheme === 'dark') {
                    themeIcon.classList.replace('fa-moon', 'fa-sun');
                } else {
                    themeIcon.classList.replace('fa-sun', 'fa-moon');
                }
            }
        });
    }
}

// ==========================================
// 4. QUOTES BERJALAN OTOMATIS
// ==========================================
function initQuotes() {
    const quoteTextEl = document.getElementById('quoteText');
    if (!quoteTextEl) return;

    let quoteIndex = 0;

    setInterval(() => {
        quoteTextEl.classList.add('quote-fade');

        setTimeout(() => {
            quoteIndex = (quoteIndex + 1) % QUOTES.length;
            quoteTextEl.textContent = `"${QUOTES[quoteIndex]}"`;
            quoteTextEl.classList.remove('quote-fade');
        }, 500);

    }, 4500);
}

// ==========================================
// 5. MANAJEMEN STATISTIK & ANIMASI ANGKA
// ==========================================
function getStatsFromStorage() {
    const statsRaw = localStorage.getItem(KEYS.STATS);
    if (statsRaw) {
        try {
            return JSON.parse(statsRaw);
        } catch (e) {
            // Abaikan kesalahan parsial
        }
    }

    const defaultStats = {
        totalBuku: 24,
        totalReview: 0,
        sedangDipinjam: 0,
        bukuPopuler: 0
    };

    localStorage.setItem(KEYS.STATS, JSON.stringify(defaultStats));
    return defaultStats;
}

function animateValue(element, start, end, duration) {
    if (!element) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function renderStats() {
    const stats = getStatsFromStorage();

    const totalBukuEl = document.getElementById('statTotalBuku');
    const totalReviewEl = document.getElementById('statTotalReview');
    const sedangDipinjamEl = document.getElementById('statSedangDipinjam');
    const bukuPopulerEl = document.getElementById('statBukuPopuler');

    animateValue(totalBukuEl, 0, stats.totalBuku || 0, 1000);
    animateValue(totalReviewEl, 0, stats.totalReview || 0, 1000);
    animateValue(sedangDipinjamEl, 0, stats.sedangDipinjam || 0, 1000);
    animateValue(bukuPopulerEl, 0, stats.bukuPopuler || 0, 1000);
}

function setupStorageListener() {
    window.addEventListener('storage', (e) => {
        if (e.key === KEYS.STATS) {
            renderStats();
        }
    });
}

// ==========================================
// INITIALIZATION ON DOM READY
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = checkAuth();

    if (currentUser) {
        renderUserInfo(currentUser);
        initTheme();
        initQuotes();
        renderStats();
        setupStorageListener();
    }
});
        
