/**
 * ==========================================================================
 * PerpusQu - Storage Helper (js/storage.js)
 * ==========================================================================
 * Helper universal untuk menangani pembacaan, penyimpanan, dan penghapusan
 * Local Storage secara aman dengan penanganan error komprehensif.
 */

const StorageHelper = {
    /**
     * Menyimpan data ke Local Storage dengan serialisasi JSON
     * @param {string} key - Kunci penyimpanan
     * @param {any} value - Data yang ingin disimpan
     * @returns {boolean} Status keberhasilan
     */
    saveData(key, value) {
        if (!key || typeof key !== 'string') {
            console.warn('StorageHelper.saveData: Parameter "key" harus berupa string non-kosong.');
            return false;
        }

        try {
            const jsonString = JSON.stringify(value);
            localStorage.setItem(key, jsonString);
            return true;
        } catch (error) {
            // Menangani kouta penyimpanan penuh (QuotaExceededError)
            if (error.name === 'QuotaExceededError' || error.code === 22) {
                console.error(`StorageHelper.saveData Error [${key}]: Penyimpanan lokal penuh.`);
            } else {
                console.error(`StorageHelper.saveData Error [${key}]:`, error);
            }
            return false;
        }
    },

    /**
     * Mengambil dan mendeserialisasi data dari Local Storage
     * @param {string} key - Kunci penyimpanan
     * @param {any} defaultValue - Nilai standar jika data tidak ditemukan/invalid
     * @returns {any} Data hasil parse atau defaultValue
     */
    getData(key, defaultValue = null) {
        if (!key || typeof key !== 'string') {
            return defaultValue;
        }

        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;

            // Mencegah error jika data di localStorage berupa string biasa / primitif
            try {
                return JSON.parse(item);
            } catch (e) {
                return item;
            }
        } catch (error) {
            console.error(`StorageHelper.getData Error [${key}]:`, error);
            return defaultValue;
        }
    },

    /**
     * Memeriksa apakah sebuah key ada di Local Storage
     * @param {string} key - Kunci penyimpanan
     * @returns {boolean}
     */
    hasData(key) {
        if (!key || typeof key !== 'string') return false;
        return localStorage.getItem(key) !== null;
    },

    /**
     * Menghapus data spesifik berdasarkan key dari Local Storage
     * @param {string} key - Kunci penyimpanan
     * @returns {boolean} Status keberhasilan
     */
    removeData(key) {
        if (!key || typeof key !== 'string') return false;

        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`StorageHelper.removeData Error [${key}]:`, error);
            return false;
        }
    },

    /**
     * Membersihkan seluruh data aplikasi di Local Storage
     * @returns {boolean} Status keberhasilan
     */
    clearData() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error("StorageHelper.clearData Error:", error);
            return false;
        }
    }
};

// Ekspor modul jika digunakan pada environment Node.js / ES6 Module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageHelper;
                }
