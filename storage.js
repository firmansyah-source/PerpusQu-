/**
 * ==========================================================================
 * PerpusQu - Storage Helper (js/storage.js)
 * ==========================================================================
 */

const StorageHelper = {

    // Menyimpan data
    saveData(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Gagal menyimpan data (${key})`, error);
            return false;
        }
    },

    // Mengambil data
    getData(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`Gagal mengambil data (${key})`, error);
            return defaultValue;
        }
    },

    // Menghapus data
    removeData(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Gagal menghapus data (${key})`, error);
            return false;
        }
    },

    // Menghapus semua data
    clearData() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error("Gagal menghapus semua data", error);
            return false;
        }
    },

    // Mengecek apakah key sudah ada
    hasData(key) {
        return localStorage.getItem(key) !== null;
    }
};

/* ==========================================================
   Inisialisasi Data Awal
========================================================== */

// Data buku
if (!StorageHelper.hasData("books")) {
    StorageHelper.saveData("books", [
        {
            id: 1,
            barcode: "9786238829682",
            isbn: "9786238829682",
            judul: "Hello",
            penulis: "Tere Liye",
            penerbit: "Sabak Grip",
            tahun: 2023,
            kategori: "Novel Remaja",
            halaman: 318,
            stok: 5,
            status: "Tersedia"
        }
    ]);
}

// Data user
if (!StorageHelper.hasData("users")) {
    StorageHelper.saveData("users", [
        {
            username: "admin",
            password: "admin123",
            role: "admin"
        },
        {
            username: "firman",
            password: "firman123",
            nama: "Muh. Firmansyah",
            kelas: "XI-1",
            role: "siswa"
        }
    ]);
}

// Riwayat peminjaman
if (!StorageHelper.hasData("borrowHistory")) {
    StorageHelper.saveData("borrowHistory", []);
}

// Review
if (!StorageHelper.hasData("reviews")) {
    StorageHelper.saveData("reviews", []);
}

// Tema
if (!StorageHelper.hasData("theme")) {
    StorageHelper.saveData("theme", "light");
}
