/**
 * PERPUSQU - Rating System Logic
 * Menggunakan Local Storage dengan dukungan Tema Terang/Gelap & Sinkronisasi Navigasi.
 */

// Key Local Storage
const KEYS = {
    CURRENT_USER: 'currentUser',
    BOOKS: 'perpusqu_books',
    REVIEWS: 'perpusqu_reviews',
    HISTORY: 'perpusqu_history',
    STATS: 'perpusqu_stats',
    BORROWED: 'perpusqu_borrowed',
    THEME: 'perpusqu_theme' // Menyimpan preferensi 'dark' | 'light'
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();               // 1. Inisialisasi Tema
    checkAuthentication();     // 2. Cek Akses Login
    initDummyData();           // 3. Muat Data Awal
    syncBottomNavigation();    // 4. Sinkronisasi Bottom Nav
    renderBookList();          // 5. Render Buku
    renderRatingHistory();     // 6. Render Riwayat Rating
    setupEventListeners();     // 7. Event Listener
});

// --- DEDICATED THEME MANAGEMENT ---
function initTheme() {
    const savedTheme = localStorage.getItem(KEYS.THEME);
    if (savedTheme === 'dark' || savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

// Fungsi global yang dapat dipanggil dari halaman Pengaturan/Profil untuk ganti tema
function switchTheme(themeName) {
    if (themeName === 'dark' || themeName === 'light') {
        localStorage.setItem(KEYS.THEME, themeName);
        document.documentElement.setAttribute('data-theme', themeName);
    } else {
        localStorage.removeItem(KEYS.THEME);
        document.documentElement.removeAttribute('data-theme');
    }
}

// --- DATA ACCESS LAYER ---
const StorageManager = {
    getUser() {
        return JSON.parse(localStorage.getItem(KEYS.CURRENT_USER));
    },
    getBooks() {
        return JSON.parse(localStorage.getItem(KEYS.BOOKS)) || [];
    },
    saveBooks(books) {
        localStorage.setItem(KEYS.BOOKS, JSON.stringify(books));
    },
    getReviews() {
        return JSON.parse(localStorage.getItem(KEYS.REVIEWS)) || [];
    },
    saveReviews(reviews) {
        localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
    },
    getBorrowedBooks() {
        return JSON.parse(localStorage.getItem(KEYS.BORROWED)) || [];
    },
    getStats() {
        return JSON.parse(localStorage.getItem(KEYS.STATS)) || { totalReviews: 0, avgRating: 0 };
    },
    saveStats(stats) {
        localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
    }
};

// --- AUTHENTICATION CHECK ---
function checkAuthentication() {
    const user = StorageManager.getUser();
    if (!user || !user.username) {
        window.location.href = 'login.html';
    }
}

// --- DUMMY DATA SEEDING ---
function initDummyData() {
    if (!localStorage.getItem(KEYS.BOOKS)) {
        const dummyBooks = [
            {
                id: 'B001',
                title: 'Laskar Pelangi',
                author: 'Andrea Hirata',
                category: 'Novel',
                cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=300&q=80',
                rating: 4.5,
                reviewsCount: 12
            },
            {
                id: 'B002',
                title: 'Bumi',
                author: 'Tere Liye',
                category: 'Fiksi',
                cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80',
                rating: 4.8,
                reviewsCount: 20
            },
            {
                id: 'B003',
                title: 'Filosofi Teras',
                author: 'Henry Manampiring',
                category: 'Pengembangan Diri',
                cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=300&q=80',
                rating: 4.0,
                reviewsCount: 5
            },
            {
                id: 'B004',
                title: 'Atomic Habits',
                author: 'James Clear',
                category: 'Self Improvement',
                cover: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=300&q=80',
                rating: 0,
                reviewsCount: 0
            }
        ];
        StorageManager.saveBooks(dummyBooks);
    }

    if (!localStorage.getItem(KEYS.BORROWED)) {
        localStorage.setItem(KEYS.BORROWED, JSON.stringify(['B001', 'B002']));
    }

    if (!localStorage.getItem(KEYS.CURRENT_USER)) {
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify({
            username: 'SiswaPerpus',
            kelas: 'XII MIPA 1'
        }));
    }
}

// --- SINKRONISASI BOTTOM NAVIGATION ---
function syncBottomNavigation() {
    const currentPath = window.location.pathname.split('/').pop() || 'rating.html';
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');

    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPath) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// --- RENDER DAFTAR BUKU ---
function renderBookList(searchQuery = '') {
    const bookListContainer = document.getElementById('bookList');
    const books = StorageManager.getBooks();
    const reviews = StorageManager.getReviews();
    const borrowedBooks = StorageManager.getBorrowedBooks();
    const user = StorageManager.getUser();

    let filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filteredBooks = filteredBooks.map(book => {
        const hasRated = reviews.some(r => r.bookId === book.id && r.username === user.username);
        return { ...book, isRated: hasRated };
    });

    // Urutkan: Belum dinilai dulu, lalu berdasarkan judul
    filteredBooks.sort((a, b) => {
        if (a.isRated === b.isRated) {
            return a.title.localeCompare(b.title);
        }
        return a.isRated ? 1 : -1;
    });

    bookListContainer.innerHTML = '';

    if (filteredBooks.length === 0) {
        bookListContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-magnifying-glass empty-icon"></i>
                <p class="empty-text">Buku yang Anda cari tidak ditemukan.</p>
            </div>
        `;
        return;
    }

    filteredBooks.forEach(book => {
        const isBorrowed = borrowedBooks.includes(book.id);
        const card = document.createElement('div');
        card.className = 'book-card';

        const starsHtml = generateStarRating(book.rating);

        card.innerHTML = `
            <img src="${book.cover}" alt="Cover ${book.title}" class="book-cover">
            <div class="book-details">
                <div class="book-meta-top">
                    <span class="book-category">${book.category}</span>
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">${book.author}</p>
                    <div class="book-rating-info">
                        <div class="rating-stars">${starsHtml}</div>
                        <span class="rating-score">${book.rating ? book.rating.toFixed(1) : '0.0'}</span>
                        <span class="review-count">(${book.reviewsCount} ulasan)</span>
                    </div>
                </div>

                <div class="book-card-bottom">
                    <span class="status-badge ${book.isRated ? 'rated' : 'unrated'}">
                        <i class="fa-solid ${book.isRated ? 'fa-circle-check' : 'fa-star'}"></i>
                        ${book.isRated ? 'Sudah Dinilai' : 'Belum Dinilai'}
                    </span>

                    <button class="btn-rate" 
                        data-id="${book.id}" 
                        ${(!isBorrowed || book.isRated) ? 'disabled' : ''}>
                        <i class="fa-solid fa-pen"></i> Beri Rating
                    </button>
                </div>
                ${!isBorrowed ? `
                    <div class="borrow-warning">
                        <i class="fa-solid fa-circle-xmark"></i>
                        Pinjam buku terlebih dahulu untuk memberikan rating.
                    </div>` : ''}
            </div>
        `;

        bookListContainer.appendChild(card);
    });

    document.querySelectorAll('.btn-rate').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookId = e.currentTarget.getAttribute('data-id');
            openRatingModal(bookId);
        });
    });
}

function generateStarRating(rating) {
    let stars = '';
    const rounded = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
        if (i <= rounded) {
            stars += '<i class="fa-solid fa-star"></i>';
        } else {
            stars += '<i class="fa-solid fa-star" style="color:var(--color-star-disabled);"></i>';
        }
    }
    return stars;
}

// --- RENDER RIWAYAT RATING ---
function renderRatingHistory() {
    const historyContainer = document.getElementById('ratingHistory');
    const reviews = StorageManager.getReviews();
    const books = StorageManager.getBooks();
    const user = StorageManager.getUser();

    const userReviews = reviews.filter(r => r.username === user.username);
    userReviews.sort((a, b) => new Date(b.date) - new Date(a.date));

    historyContainer.innerHTML = '';

    if (userReviews.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-book empty-icon"></i>
                <p class="empty-text">Belum ada rating yang diberikan.</p>
            </div>
        `;
        return;
    }

    userReviews.forEach(review => {
        const book = books.find(b => b.id === review.bookId) || {
            cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=300&q=80',
            title: review.bookTitle
        };

        const card = document.createElement('div');
        card.className = 'history-card';

        const starsHtml = generateStarRating(review.rating);

        card.innerHTML = `
            <img src="${book.cover}" alt="${review.bookTitle}" class="history-cover">
            <div class="history-content">
                <h4 class="history-title">${review.bookTitle}</h4>
                <div class="history-stars">${starsHtml}</div>
                <p class="history-comment">"${escapeHtml(review.comment)}"</p>
                <div class="history-date">
                    <i class="fa-solid fa-calendar"></i> ${formatDate(review.date)}
                </div>
            </div>
        `;

        historyContainer.appendChild(card);
    });
}

// --- EVENT LISTENERS & MODAL MANAGEMENT ---
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        renderBookList(e.target.value);
    });

    const starBtns = document.querySelectorAll('.star-btn');
    starBtns.forEach(star => {
        star.addEventListener('click', function() {
            const val = parseInt(this.getAttribute('data-value'));
            document.getElementById('selectedRatingValue').value = val;
            
            starBtns.forEach((s, idx) => {
                if (idx < val) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });

    document.getElementById('btnCancelModal').addEventListener('click', closeModal);
    document.getElementById('btnCancelModalUpper').addEventListener('click', closeModal);
    document.getElementById('ratingForm').addEventListener('submit', handleFormSubmit);
}

function openRatingModal(bookId) {
    const books = StorageManager.getBooks();
    const reviews = StorageManager.getReviews();
    const user = StorageManager.getUser();

    const alreadyRated = reviews.some(r => r.bookId === bookId && r.username === user.username);
    if (alreadyRated) {
        showToast('Anda sudah memberikan rating untuk buku ini.', 'error');
        return;
    }

    const book = books.find(b => b.id === bookId);
    if (!book) return;

    document.getElementById('modalBookId').value = book.id;
    document.getElementById('modalBookTitle').innerText = book.title;
    document.getElementById('modalBookAuthor').innerText = book.author;
    document.getElementById('modalBookCover').src = book.cover;

    document.getElementById('selectedRatingValue').value = '0';
    document.getElementById('commentInput').value = '';
    document.getElementById('commentError').classList.add('hidden');
    document.querySelectorAll('.star-btn').forEach(s => s.classList.remove('active'));

    document.getElementById('ratingModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('ratingModal').classList.add('hidden');
}

// --- SUBMIT FORM RATING ---
function handleFormSubmit(e) {
    e.preventDefault();

    const bookId = document.getElementById('modalBookId').value;
    const ratingVal = parseInt(document.getElementById('selectedRatingValue').value);
    const commentVal = document.getElementById('commentInput').value.trim();
    const user = StorageManager.getUser();

    if (!ratingVal || ratingVal === 0) {
        showToast('Rating wajib dipilih (bintang 1-5).', 'error');
        return;
    }

    if (commentVal.length < 5) {
        document.getElementById('commentError').classList.remove('hidden');
        return;
    } else {
        document.getElementById('commentError').classList.add('hidden');
    }

    const newReview = {
        id: 'REV_' + Date.now(),
        bookId: bookId,
        bookTitle: document.getElementById('modalBookTitle').innerText,
        username: user.username,
        kelas: user.kelas || 'Siswa',
        rating: ratingVal,
        comment: commentVal,
        date: new Date().toISOString()
    };

    try {
        const reviews = StorageManager.getReviews();
        reviews.push(newReview);
        StorageManager.saveReviews(reviews);

        updateBookStatistics(bookId);
        updateDashboardGlobalStats();

        closeModal();
        renderBookList(document.getElementById('searchInput').value);
        renderRatingHistory();

        showToast('Rating berhasil disimpan.', 'success');

    } catch (err) {
        console.error(err);
        showToast('Rating gagal disimpan.', 'error');
    }
}

function updateBookStatistics(bookId) {
    const books = StorageManager.getBooks();
    const reviews = StorageManager.getReviews();

    const bookIndex = books.findIndex(b => b.id === bookId);
    if (bookIndex !== -1) {
        const bookReviews = reviews.filter(r => r.bookId === bookId);
        const totalRatingSum = bookReviews.reduce((sum, r) => sum + r.rating, 0);
        
        books[bookIndex].reviewsCount = bookReviews.length;
        books[bookIndex].rating = totalRatingSum / bookReviews.length;

        StorageManager.saveBooks(books);
    }
}

function updateDashboardGlobalStats() {
    const reviews = StorageManager.getReviews();
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) : 0;

    StorageManager.saveStats({
        totalReviews: totalReviews,
        avgRating: avgRating.toFixed(1)
    });
}

// --- UTILITY FUNCTIONS ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-xmark';

    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function formatDate(isoString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(isoString).toLocaleDateString('id-ID', options);
}

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}