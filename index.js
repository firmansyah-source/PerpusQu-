/**
 * JAVASCRIPT DASHBOARD PERPUSQU
 * Mengelola Autentikasi Session, Inisialisasi Data LocalStorage,
 * Quotes Berjalan, Dark/Light Mode (dengan Font Awesome Classes), & Animasi Angka Statistik.
 */

// Kunci penyimpanan Local Storage
const KEYS = {
    SESSION: 'perpusqu_session',
    THEME: 'perpusqu_theme',
    STATS: 'perpusqu_stats'
};

// Collection Quotes Berjalan
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

    if (userGreetingEl) userGreetingEl.textContent = `Halo, ${user.username}`;
    if (userRoleEl) userRoleEl.textContent = user.role || 'Siswa';
    if (userClassEl) userClassEl.textContent = user.kelas || '-';
}

// ==========================================
// 3. TEMA LIGHT / DARK MODE (FONT AWESOME CLASS)
// ==========================================
function initTheme() {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    
    // Ambil preferensi dari LocalStorage atau default ke light
    const currentTheme = localStorage.getItem(KEYS.THEME) || 'light';

    // Terapkan tema saat ini & atur class Font Awesome
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

            // Set Atribut & Simpan ke Storage
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem(KEYS.THEME, newTheme);

            // Ubah Class Ikon Font Awesome
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
        // Beri efek fade-out
        quoteTextEl.classList.add('quote-fade');

        setTimeout(() => {
            // Ubah teks quote
            quoteIndex = (quoteIndex + 1) % QUOTES.length;
            quoteTextEl.textContent = `"${QUOTES[quoteIndex]}"`;
            
            // Lakukan fade-in kembali
            quoteTextEl.classList.remove('quote-fade');
        }, 500);

    }, 4500); // Pergantian setiap 4.5 detik
}

// ==========================================
// 5. MANAJEMEN STATISTIK & ANIMASI ANGKA
// ==========================================

/**
 * Mengambil data statistik dari Local Storage atau buat default baru
 */
function getStatsFromStorage() {
    const statsRaw = localStorage.getItem(KEYS.STATS);
    if (statsRaw) {
        try {
            return JSON.parse(statsRaw);
        } catch (e) {
            // Abaikan kesalahan parsial
        }
    }

    // Default Nilai Statistik Awal
    const defaultStats = {
        totalBuku: 24,        // Contoh data awal buku perpustakaan
        totalReview: 0,       // Awalnya 0
        sedangDipinjam: 0,    // Awalnya 0
        bukuPopuler: 0        // Awalnya 0
    };

    localStorage.setItem(KEYS.STATS, JSON.stringify(defaultStats));
    return defaultStats;
}

/**
 * Animasi Penghitung Angka dari 0 ke Angka Target
 */
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

/**
 * Memuat dan Menampilkan Statistik dengan Animasi
 */
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

/**
 * Memantau perubahan Local Storage agar statistik terupdate otomatis
 */
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
    // 1. Cek Login User
    const currentUser = checkAuth();

    if (currentUser) {
        // 2. Tampilkan Info User
        renderUserInfo(currentUser);

        // 3. Inisialisasi Tema (Light/Dark Mode)
        initTheme();

        // 4. Jalankan Quotes Berjalan
        initQuotes();

        // 5. Muat Statistik dengan Animasi
        renderStats();

        // 6. Pasang Listener Perubahan Local Storage
        setupStorageListener();
    }
});