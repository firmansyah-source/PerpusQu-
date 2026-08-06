/**
 * ==========================================================================
 * PerpusQu - Storage Helper (js/storage.js)
 * ==========================================================================
 * Helper universal untuk menangani pembacaan dan penyimpanan Local Storage
 * dengan aman menggunakan try...catch.
 */

const StorageHelper = {
    /**
     * Menyimpan data ke Local Storage
     * @param {string} key 
     * @param {any} value 
     * @returns {boolean}
     */
    saveData(key, value) {
        try {
            const jsonString = JSON.stringify(value);
            localStorage.setItem(key, jsonString);
            return true;
        } catch (error) {
            console.error(`StorageHelper.saveData Error [${key}]:`, error);
            return false;
        }
    },

    /**
     * Mengambil data dari Local Storage
     * @param {string} key 
     * @param {any} defaultValue 
     * @returns {any}
     */
    getData(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`StorageHelper.getData Error [${key}]:`, error);
            return defaultValue;
        }
    },

    /**
     * Menghapus kunci spesifik dari Local Storage
     * @param {string} key 
     * @returns {boolean}
     */
    removeData(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`StorageHelper.removeData Error [${key}]:`, error);
            return false;
        }
    },

    /**
     * Membersihkan seluruh isi Local Storage
     * @returns {boolean}
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