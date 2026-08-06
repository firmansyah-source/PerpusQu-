/**
 * PERPUSQU - Riwayat Peminjaman Module
 * Pure JavaScript Implementation
 */

// Key Local Storage Konsisten
const STORAGE_KEYS = {
    CURRENT_USER: 'currentUser',
    BOOKS: 'perpusqu_books',
    HISTORY: 'perpusqu_history',
    REVIEWS: 'perpusqu_reviews',
    STATS: 'perpusqu_stats'
};

// Global State
let currentUser = null;
let allHistoryData = [];
let filteredHistoryData = [];
let currentFilter = 'semua';
let searchQuery = '';
let selectedHistoryItem = null;

// Initialization Engine
document.addEventListener('DOMContentLoaded', () => {
    if (checkLogin()) {
        seedInitialDataIfEmpty();
        loadHistory();
        setupEventListeners();
        showToast('Riwayat berhasil dimuat.', 'success');
    }
});

/**
 * Otentikasi & Cek User
 */
function checkLogin() {
    const userRaw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!userRaw) {
        window.location.href = 'login.html';
        return false;
    }
    currentUser = JSON.parse(userRaw);
    return true;
}

/**
 * Seeding Data Contoh untuk Pertama Kali (Demo Purpose)
 */
function seedInitialDataIfEmpty() {
    if (!localStorage.getItem(STORAGE_KEYS.HISTORY)) {
        const dummyHistory = [
            {
                id: 'HIST-001',
                bookId: 'BK-101',
                bookTitle: 'Laskar Pelangi',
                bookAuthor: 'Andrea Hirata',
                category: 'Novel',
                coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300',
                username: currentUser.username,
                userClass: currentUser.class || 'XII IPA 1',
                userRole: currentUser.role || 'Siswa',
                borrowDate: '2026-07-20',
                returnDate: '2026-07-27',
                actualReturnDate: null,
                status: 'Dipinjam',
                rating: null,
                comment: null
            },
            {
                id: 'HIST-002',
                bookId: 'BK-102',
                bookTitle: 'Bumi Manusia',
                bookAuthor: 'Pramoedya Ananta Toer',
                category: 'Sastra',
                coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300',
                username: currentUser.username,
                userClass: currentUser.class || 'XII IPA 1',
                userRole: currentUser.role || 'Siswa',
                borrowDate: '2026-06-10',
                returnDate: '2026-06-17',
                actualReturnDate: '2026-06-16',
                status: 'Dikembalikan',
                rating: 5,
                comment: 'Buku sangat menginspirasi!'
            }
        ];
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(dummyHistory));
    }

    if (!localStorage.getItem(STORAGE_KEYS.BOOKS)) {
        const dummyBooks = [
            { id: 'BK-101', title: 'Laskar Pelangi', author: 'Andrea Hirata', category: 'Novel', status: 'Dipinjam', coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300' },
            { id: 'BK-102', title: 'Bumi Manusia', author: 'Pramoedya Ananta Toer', category: 'Sastra', status: 'Tersedia', coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300' }
        ];
        localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(dummyBooks));
    }
}

/**
 * Muat Seluruh Data Riwayat milik User saat ini
 */
function loadHistory() {
    const rawHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    const historyList = rawHistory ? JSON.parse(rawHistory) : [];

    // Filter hanya data user login
    allHistoryData = historyList.filter(item => item.username === currentUser.username);

    // Urutkan berdasarkan tanggal pinjam terbaru
    allHistoryData.sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));

    calculateStats();
    applyFilterAndSearch();
}

/**
 * Hitung & Render Statistik Ringkasan
 */
function calculateStats() {
    const total = allHistoryData.length;
    const dipinjam = allHistoryData.filter(item => item.status === 'Dipinjam' || item.status === 'Terlambat').length;
    const dikembalikan = allHistoryData.filter(item => item.status === 'Dikembalikan').length;

    document.getElementById('statTotalBooks').textContent = total;
    document.getElementById('statBorrowedBooks').textContent = dipinjam;
    document.getElementById('statReturnedBooks').textContent = dikembalikan;
}

/**
 * Filter & Search Realtime Engine
 */
function applyFilterAndSearch() {
    filteredHistoryData = allHistoryData.filter(item => {
        // Filter Status
        let matchFilter = true;
        if (currentFilter === 'dipinjam') {
            matchFilter = item.status === 'Dipinjam' || item.status === 'Terlambat';
        } else if (currentFilter === 'dikembalikan') {
            matchFilter = item.status === 'Dikembalikan';
        }

        // Search Query
        const query = searchQuery.toLowerCase().trim();
        const matchSearch = item.bookTitle.toLowerCase().includes(query) ||
                            item.bookId.toLowerCase().includes(query) ||
                            item.category.toLowerCase().includes(query);

        return matchFilter && matchSearch;
    });

    renderHistory();
}

/**
 * Render Cards ke HTML
 */
function renderHistory() {
    const container = document.getElementById('historyList');
    const emptyState = document.getElementById('emptyState');
    container.innerHTML = '';

    if (filteredHistoryData.length === 0) {
        emptyState.style.display = 'block';
        if (searchQuery !== '') {
            document.getElementById('emptyStateText').textContent = 'Tidak ada riwayat yang cocok dengan pencarian Anda.';
        } else {
            document.getElementById('emptyStateText').textContent = 'Belum ada riwayat peminjaman buku.';
        }
        return;
    }

    emptyState.style.display = 'none';

    filteredHistoryData.forEach(item => {
        const card = document.createElement('div');
        card.className = 'history-card';
        card.onclick = () => showDetailModal(item.id);

        let badgeClass = 'dipinjam';
        let badgeIcon = 'fa-clock';
        
        if (item.status === 'Dikembalikan') {
            badgeClass = 'dikembalikan';
            badgeIcon = 'fa-circle-check';
        } else if (item.status === 'Terlambat') {
            badgeClass = 'terlambat';
            badgeIcon = 'fa-triangle-exclamation';
        }

        card.innerHTML = `
            <img src="${item.coverUrl}" alt="${item.bookTitle}" class="book-cover" onerror="this.src='https://via.placeholder.com/70x95?text=Cover'">
            <div class="book-info">
                <div>
                    <h3 class="book-title">${escapeHtml(item.bookTitle)}</h3>
                    <p class="book-author">${escapeHtml(item.bookAuthor)}</p>
                    <div class="book-meta">
                        <span class="category-tag">${escapeHtml(item.category)}</span>
                        <span>ID: ${escapeHtml(item.bookId)}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <span class="date-text">
                        <i class="fa-solid fa-calendar"></i> ${formatDate(item.borrowDate)}
                    </span>
                    <span class="status-badge ${badgeClass}">
                        <i class="fa-solid ${badgeIcon}"></i> ${item.status}
                    </span>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

/**
 * Tampilkan Detail Modal Peminjaman
 */
function showDetailModal(historyId) {
    selectedHistoryItem = allHistoryData.find(i => i.id === historyId);
    if (!selectedHistoryItem) return;

    const modalBody = document.getElementById('detailModalBody');
    const modalFooter = document.getElementById('detailModalFooter');

    const duration = calculateDuration(selectedHistoryItem.borrowDate, selectedHistoryItem.actualReturnDate || selectedHistoryItem.returnDate);

    let ratingHtml = '-';
    if (selectedHistoryItem.rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<i class="fa-solid fa-star ${i <= selectedHistoryItem.rating ? 'color-warning' : ''}"></i>`;
        }
        ratingHtml = `<div class="rating-display">${stars} (${selectedHistoryItem.rating}/5)</div>`;
    }

    modalBody.innerHTML = `
        <div class="detail-cover-container">
            <img src="${selectedHistoryItem.coverUrl}" class="detail-cover" alt="Cover Buku">
        </div>
        <div class="detail-header-info">
            <h3 class="detail-title">${escapeHtml(selectedHistoryItem.bookTitle)}</h3>
            <p class="detail-author">${escapeHtml(selectedHistoryItem.bookAuthor)}</p>
        </div>
        <div class="detail-grid">
            <div class="detail-item">
                <span class="detail-item-label">ID Buku</span>
                <span class="detail-item-value">${escapeHtml(selectedHistoryItem.bookId)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-item-label">Kategori</span>
                <span class="detail-item-value">${escapeHtml(selectedHistoryItem.category)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-item-label">Tanggal Pinjam</span>
                <span class="detail-item-value">${formatDate(selectedHistoryItem.borrowDate)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-item-label">Tgl Jatuh Tempo</span>
                <span class="detail-item-value">${formatDate(selectedHistoryItem.returnDate)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-item-label">Status</span>
                <span class="detail-item-value">${selectedHistoryItem.status}</span>
            </div>
            <div class="detail-item">
                <span class="detail-item-label">Durasi Pinjam</span>
                <span class="detail-item-value">${duration} Hari</span>
            </div>
            <div class="detail-item detail-full-width">
                <span class="detail-item-label">Rating</span>
                <span class="detail-item-value">${ratingHtml}</span>
            </div>
            <div class="detail-item detail-full-width">
                <span class="detail-item-label">Komentar</span>
                <span class="detail-item-value">${selectedHistoryItem.comment ? escapeHtml(selectedHistoryItem.comment) : '-'}</span>
            </div>
        </div>
    `;

    // Tombol aksi di modal footer
    modalFooter.innerHTML = '';
    
    if (selectedHistoryItem.status === 'Dipinjam' || selectedHistoryItem.status === 'Terlambat') {
        const btnReturn = document.createElement('button');
        btnReturn.className = 'btn btn-primary btn-block';
        btnReturn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Kembalikan Buku`;
        btnReturn.onclick = () => returnBook(selectedHistoryItem.id);
        modalFooter.appendChild(btnReturn);
    } else if (selectedHistoryItem.status === 'Dikembalikan' && !selectedHistoryItem.rating) {
        const btnRate = document.createElement('button');
        btnRate.className = 'btn btn-secondary btn-block';
        btnRate.innerHTML = `<i class="fa-solid fa-star"></i> Beri Rating Buku`;
        btnRate.onclick = () => {
            closeModal('detailModal');
            openRatingModal(selectedHistoryItem);
        };
        modalFooter.appendChild(btnRate);
    }

    openModal('detailModal');
}

/**
 * Proses Pengembalian Buku
 */
function returnBook(historyId) {
    const rawHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
    const rawBooks = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKS) || '[]');

    const todayStr = new Date().toISOString().split('T')[0];

    // Update Data History
    const historyIndex = rawHistory.findIndex(h => h.id === historyId);
    if (historyIndex !== -1) {
        rawHistory[historyIndex].status = 'Dikembalikan';
        rawHistory[historyIndex].actualReturnDate = todayStr;
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(rawHistory));

        // Update Status Buku di Katalog
        const bookIndex = rawBooks.findIndex(b => b.id === rawHistory[historyIndex].bookId);
        if (bookIndex !== -1) {
            rawBooks[bookIndex].status = 'Tersedia';
            localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(rawBooks));
        }

        // Update Statistik Dashboard Global
        updateDashboardStats();

        closeModal('detailModal');
        loadHistory();
        showToast('Buku berhasil dikembalikan!', 'success');

        // Berikan opsi rating secara otomatis
        setTimeout(() => {
            openRatingModal(rawHistory[historyIndex]);
        }, 400);
    }
}

/**
 * Memperbarui data statistik Dashboard secara otomatis
 */
function updateDashboardStats() {
    const rawHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
    const activeBorrows = rawHistory.filter(h => h.status === 'Dipinjam').length;

    const stats = JSON.parse(localStorage.getItem(STORAGE_KEYS.STATS) || '{}');
    stats.activeBorrows = activeBorrows;
    stats.lastUpdated = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
}

/**
 * Rating Modal Handlers
 */
function openRatingModal(historyItem) {
    selectedHistoryItem = historyItem;
    document.getElementById('ratingBookTitle').textContent = historyItem.bookTitle;
    document.getElementById('ratingBookAuthor').textContent = historyItem.bookAuthor;
    document.getElementById('selectedRatingValue').value = '0';
    document.getElementById('reviewComment').value = '';

    resetStarPicker();
    openModal('ratingModal');
}

function resetStarPicker() {
    const stars = document.querySelectorAll('#starPicker .star-btn');
    stars.forEach(star => star.classList.remove('active'));
}

function submitRating() {
    const ratingVal = parseInt(document.getElementById('selectedRatingValue').value);
    const commentVal = document.getElementById('reviewComment').value.trim();

    if (ratingVal === 0) {
        showToast('Pilih setidaknya 1 bintang.', 'warning');
        return;
    }

    // Save to History
    const rawHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
    const idx = rawHistory.findIndex(h => h.id === selectedHistoryItem.id);
    if (idx !== -1) {
        rawHistory[idx].rating = ratingVal;
        rawHistory[idx].comment = commentVal;
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(rawHistory));
    }

    // Save to Reviews Collection
    const rawReviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
    rawReviews.push({
        id: 'REV-' + Date.now(),
        bookId: selectedHistoryItem.bookId,
        username: currentUser.username,
        rating: ratingVal,
        comment: commentVal,
        date: new Date().toISOString().split('T')[0]
    });
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(rawReviews));

    closeModal('ratingModal');
    loadHistory();
    showToast('Ulasan berhasil disimpan.', 'success');
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    const btnClearSearch = document.getElementById('btnClearSearch');

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        btnClearSearch.style.display = searchQuery ? 'block' : 'none';
        applyFilterAndSearch();
    });

    btnClearSearch.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        btnClearSearch.style.display = 'none';
        applyFilterAndSearch();
    });

    // Filter Buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            applyFilterAndSearch();
        });
    });

    // Close Modals
    document.getElementById('btnCloseDetailModal').onclick = () => closeModal('detailModal');
    document.getElementById('btnCloseRatingModal').onclick = () => closeModal('ratingModal');
    document.getElementById('btnCancelRating').onclick = () => closeModal('ratingModal');

    // Star Picker Interaction
    const stars = document.querySelectorAll('#starPicker .star-btn');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const val = parseInt(star.getAttribute('data-value'));
            document.getElementById('selectedRatingValue').value = val;
            stars.forEach(s => {
                const sVal = parseInt(s.getAttribute('data-value'));
                if (sVal <= val) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });

    // Submit Rating
    document.getElementById('btnSubmitRating').onclick = submitRating;
}

/**
 * Utility: Helpers
 */
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function calculateDuration(start, end) {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Toast Notification System
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'warning') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}