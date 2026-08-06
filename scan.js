/**
 * PerpusQu Scan Module (scan.js)
 * Memindahkan logika scanner, ISBN Search, Peminjaman, dan Sinkronisasi Local Storage.
 */

// Global Variables & State
let html5QrcodeScanner = null;
let isScanning = false;
let currentScannedBook = null;

// Initial Dummy Books Data jika LocalStorage Kosong
const DEFAULT_BOOKS = [
    {
        id: "BK001",
        isbn: "9786020324784",
        title: "Laskar Pelangi",
        author: "Andrea Hirata",
        publisher: "Bentang Pustaka",
        category: "Novel",
        year: 2005,
        cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300",
        stock: 3,
        borrowCount: 15,
        status: "Tersedia"
    },
    {
        id: "BK002",
        isbn: "9789793062792",
        title: "Bumi Manusia",
        author: "Pramoedya Ananta Toer",
        publisher: "Lentera Dipantara",
        category: "Sastra",
        year: 1980,
        cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300",
        stock: 0,
        borrowCount: 28,
        status: "Sedang Dipinjam"
    },
    {
        id: "BK003",
        isbn: "9786020633177",
        title: "Filosofi Teras",
        author: "Henry Manampiring",
        publisher: "Kompas",
        category: "Self Improvement",
        year: 2018,
        cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=300",
        stock: 5,
        borrowCount: 42,
        status: "Tersedia"
    }
];

// Initial Dummy User jika LocalStorage Kosong
const DEFAULT_USER = {
    username: "siswa_perpus",
    nama: "Ahmad Rizky",
    kelas: "XI RPL 1"
};

// --- DOM Content Loaded ---
document.addEventListener("DOMContentLoaded", () => {
    loadTheme();
    checkLogin();
    initData();
    initScanner();

    // Keypress Event Enter pada Search Bar ISBN
    const inputIsbn = document.getElementById("inputIsbn");
    if (inputIsbn) {
        inputIsbn.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                searchBookByISBN();
            }
        });
    }
});

// --- Theme & User Handlers ---
function loadTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
        document.body.classList.remove("light-mode");
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
        document.body.classList.add("light-mode");
    }
}

function checkLogin() {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        localStorage.setItem("currentUser", JSON.stringify(DEFAULT_USER));
    }
}

function initData() {
    if (!localStorage.getItem("perpusqu_books")) {
        localStorage.setItem("perpusqu_books", JSON.stringify(DEFAULT_BOOKS));
    }
    if (!localStorage.getItem("perpusqu_history")) {
        localStorage.setItem("perpusqu_history", JSON.stringify([]));
    }
    if (!localStorage.getItem("perpusqu_stats")) {
        localStorage.setItem("perpusqu_stats", JSON.stringify({
            totalBorrowed: 0,
            popularBooks: []
        }));
    }
}

// --- Logika Scanner Kamera ---
function initScanner() {
    startScanner();
}

function startScanner() {
    const scannerCard = document.getElementById("scannerCard");
    const errorCard = document.getElementById("cameraErrorCard");
    const statusText = document.getElementById("statusText");
    const scanLine = document.getElementById("scanLine");
    const btnStop = document.getElementById("btnStopScan");
    const btnRestart = document.getElementById("btnRestartScan");

    scannerCard.style.display = "flex";
    errorCard.style.display = "none";
    statusText.innerText = "Meminta akses kamera...";
    scanLine.style.display = "block";

    html5QrcodeScanner = new Html5Qrcode("reader");

    const config = {
        fps: 10,
        qrbox: { width: 220, height: 180 },
        aspectRatio: 1.0
    };

    html5QrcodeScanner.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure
    ).then(() => {
        isScanning = true;
        statusText.innerText = "Siap memindai barcode / QR buku";
        btnStop.style.display = "inline-flex";
        btnRestart.style.display = "none";
        showToast("Scanner aktif.");
    }).catch((err) => {
        console.error("Camera Error:", err);
        isScanning = false;
        scannerCard.style.display = "none";
        errorCard.style.display = "flex";
        showToast("Kamera gagal dibuka.");
    });
}

function stopScanner() {
    if (html5QrcodeScanner && isScanning) {
        html5QrcodeScanner.stop().then(() => {
            isScanning = false;
            updateScannerUIOnStop();
            showToast("Scanner dihentikan.");
        }).catch((err) => {
            console.error("Gagal menghentikan scanner:", err);
        });
    }
}

function updateScannerUIOnStop() {
    const statusText = document.getElementById("statusText");
    const scanLine = document.getElementById("scanLine");
    const btnStop = document.getElementById("btnStopScan");
    const btnRestart = document.getElementById("btnRestartScan");

    statusText.innerText = "Scanner dimatikan";
    scanLine.style.display = "none";
    btnStop.style.display = "none";
    btnRestart.style.display = "inline-flex";
}

function restartScanner() {
    if (html5QrcodeScanner) {
        if (isScanning) {
            html5QrcodeScanner.stop().then(() => {
                startScanner();
            });
        } else {
            startScanner();
        }
    } else {
        startScanner();
    }
}

// Callback saat barcode/QR berhasil dipindai
function onScanSuccess(decodedText, decodedResult) {
    if (!isScanning) return;
    
    // Suara Beep atau Notifikasi singkat
    stopScanner();
    showToast("Barcode terbaca!");
    
    // Otomatis cari buku berdasarkan barcode/ISBN/id
    searchBookByBarcode(decodedText);
}

function onScanFailure(error) {
    // Abaikan error konstan saat pemindaian berlangsung
}

// --- Logika Pencarian Buku ---
function searchBookByISBN() {
    const inputIsbn = document.getElementById("inputIsbn").value.trim();

    if (!inputIsbn) {
        showToast("Masukkan ISBN.");
        return;
    }

    processBook(inputIsbn);
}

function searchBookByBarcode(barcodeValue) {
    // Salin nilai barcode ke input untuk feedback visual
    document.getElementById("inputIsbn").value = barcodeValue;
    processBook(barcodeValue);
}

function processBook(query) {
    const books = JSON.parse(localStorage.getItem("perpusqu_books")) || [];
    
    // Cari berdasarkan ID atau ISBN
    const foundBook = books.find(b => 
        b.isbn.toLowerCase() === query.toLowerCase() || 
        b.id.toLowerCase() === query.toLowerCase()
    );

    if (foundBook) {
        currentScannedBook = foundBook;
        renderBookCard(foundBook);
        showToast("Buku ditemukan.");
    } else {
        currentScannedBook = null;
        document.getElementById("resultSection").style.display = "none";
        showToast("Buku tidak ditemukan.");
    }
}

// Render Tampilan Card Detail Buku
function renderBookCard(book) {
    const resultSection = document.getElementById("resultSection");
    
    const isAvailable = book.stock > 0 && book.status === "Tersedia";
    const statusBadgeClass = isAvailable ? "badge-available" : "badge-borrowed";
    const statusText = isAvailable ? "Tersedia" : "Sedang Dipinjam";

    resultSection.innerHTML = `
        <div class="book-card">
            <div class="book-card-header">
                <img src="${book.cover}" alt="${book.title}" class="book-cover" onerror="this.src='https://via.placeholder.com/90x130?text=No+Cover'">
                <div class="book-info-main">
                    <h2 class="book-title">${book.title}</h2>
                    <p class="book-author">Oleh: ${book.author}</p>
                    <span class="badge ${statusBadgeClass}">${statusText}</span>
                </div>
            </div>

            <div class="book-details-grid">
                <div class="detail-item">
                    <span>Penerbit</span>
                    <strong>${book.publisher}</strong>
                </div>
                <div class="detail-item">
                    <span>ISBN</span>
                    <strong>${book.isbn}</strong>
                </div>
                <div class="detail-item">
                    <span>Kategori</span>
                    <strong>${book.category}</strong>
                </div>
                <div class="detail-item">
                    <span>Tahun</span>
                    <strong>${book.year}</strong>
                </div>
                <div class="detail-item">
                    <span>Stok Tersedia</span>
                    <strong>${book.stock} Exemplar</strong>
                </div>
                <div class="detail-item">
                    <span>Total Dipinjam</span>
                    <strong>${book.borrowCount} Kali</strong>
                </div>
            </div>

            ${isAvailable ? `
                <button class="btn btn-primary btn-borrow ripple" onclick="borrowBook('${book.id}')">
                    <i class="fa-solid fa-bookmark"></i> Pinjam Buku
                </button>
            ` : `
                <button class="btn btn-secondary btn-borrow" disabled style="opacity: 0.7; cursor: not-allowed;">
                    <i class="fa-solid fa-lock"></i> Sedang Dipinjam
                </button>
            `}
        </div>
    `;

    resultSection.style.display = "block";
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// --- Logika Peminjaman Buku ---
function borrowBook(bookId) {
    let books = JSON.parse(localStorage.getItem("perpusqu_books")) || [];
    let currentUser = JSON.parse(localStorage.getItem("currentUser")) || DEFAULT_USER;

    const bookIndex = books.findIndex(b => b.id === bookId);

    if (bookIndex !== -1) {
        let book = books[bookIndex];

        if (book.stock <= 0) {
            showToast("Buku tidak tersedia.");
            return;
        }

        // 1. Kurangi stok & Tambah borrowCount
        book.stock -= 1;
        book.borrowCount += 1;
        if (book.stock === 0) {
            book.status = "Sedang Dipinjam";
        }

        books[bookIndex] = book;
        localStorage.setItem("perpusqu_books", JSON.stringify(books));

        // 2. Simpan Ke Riwayat (perpusqu_history)
        updateHistory(currentUser, book);

        // 3. Update Statistik (perpusqu_stats)
        updateStats(book);

        // 4. Update UI Card
        renderBookCard(book);

        showToast("Buku berhasil dipinjam.");
    }
}

function updateHistory(user, book) {
    let history = JSON.parse(localStorage.getItem("perpusqu_history")) || [];

    const today = new Date();
    const returnDate = new Date();
    returnDate.setDate(today.getDate() + 7); // Default +7 hari

    const historyEntry = {
        id: "HIST-" + Date.now(),
        username: user.username,
        nama: user.nama,
        kelas: user.kelas,
        judul: book.title,
        isbn: book.isbn,
        tanggalPinjam: formatDate(today),
        tanggalKembali: formatDate(returnDate),
        status: "Dipinjam"
    };

    history.unshift(historyEntry);
    localStorage.setItem("perpusqu_history", JSON.stringify(history));
}

function updateStats(book) {
    let stats = JSON.parse(localStorage.getItem("perpusqu_stats")) || { totalBorrowed: 0, popularBooks: [] };
    let books = JSON.parse(localStorage.getItem("perpusqu_books")) || [];

    stats.totalBorrowed += 1;

    // Urutkan buku terpopuler berdasarkan borrowCount terbanyak
    const sortedBooks = [...books].sort((a, b) => b.borrowCount - a.borrowCount);
    stats.popularBooks = sortedBooks.slice(0, 5).map(b => ({
        id: b.id,
        title: b.title,
        borrowCount: b.borrowCount
    }));

    localStorage.setItem("perpusqu_stats", JSON.stringify(stats));
}

// Helper Format Tanggal
function formatDate(dateObj) {
    const d = String(dateObj.getDate()).padStart(2, '0');
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const y = dateObj.getFullYear();
    return `${d}-${m}-${y}`;
}

// --- Universal Toast Notification ---
function showToast(message) {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "toastOut 0.3s forwards";
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 2800);
}