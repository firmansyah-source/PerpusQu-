/* ==========================================================================
   PerpusQu - Registration & System Shared Core Utilities
   Contains Core Storage Keys, Authentication Helpers, and Common UI Methods
   ========================================================================== */

// Default Avatar SVG Data URL (Tanpa dependensi gambar eksternal)
const DEFAULT_PROFILE_PHOTO = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236b8e23"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>';

/* --------------------------------------------------------------------------
   Local Storage & Session Helpers
   -------------------------------------------------------------------------- */

// Mengambil seluruh daftar pengguna
function getUsersFromStorage() {
  const usersData = localStorage.getItem('perpusqu_users');
  return usersData ? JSON.parse(usersData) : [];
}

// Menyimpan daftar pengguna baru
function saveUsersToStorage(usersArray) {
  localStorage.setItem('perpusqu_users', JSON.stringify(usersArray));
}

// Mengambil data pengguna aktif
function getCurrentUser() {
  const currentUserData = localStorage.getItem('currentUser');
  return currentUserData ? JSON.parse(currentUserData) : null;
}

// Menyimpan pengguna aktif saat ini
function saveCurrentUser(userObject) {
  localStorage.setItem('currentUser', JSON.stringify(userObject));
}

// Menghapus data session pengguna saat ini
function clearCurrentUser() {
  localStorage.removeItem('currentUser');
}

/* --------------------------------------------------------------------------
   Authentication Protection & Navigation Logic
   -------------------------------------------------------------------------- */

// Menolak akses jika belum login (Dipasang pada: index, scan, rating, riwayat, profil)
function redirectIfNotLoggedIn() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
  }
}

// Menolak akses halaman login/register jika sudah login
function redirectIfLoggedIn() {
  const currentUser = getCurrentUser();
  if (currentUser) {
    window.location.href = 'index.html';
  }
}

// Fungsi global Logout
function logoutUser() {
  clearCurrentUser();
  showToast('Logout berhasil.', 'success');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1000);
}

/* --------------------------------------------------------------------------
   UI Utilities (Toast Notifications, ID Generator, Theme Setup)
   -------------------------------------------------------------------------- */

function generateUserId() {
  return 'USER-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconClass = 'fa-circle-info';
  if (type === 'success') iconClass = 'fa-circle-check';
  if (type === 'error') iconClass = 'fa-circle-xmark';
  if (type === 'warning') iconClass = 'fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${iconClass} toast-icon"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animasi Fade In
  setTimeout(() => toast.classList.add('show'), 10);

  // Opsi Hilang Otomatis setelah 3.5 detik
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Terapkan Tema (Light/Dark) dari Local Storage saat pertama dimuat
(function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
})();

/* --------------------------------------------------------------------------
   Registration Form Handler
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  
  // Jika tidak sedang berada di halaman register.html, batalkan proses
  if (!registerForm) return;

  // Jalankan pengecekan redirection jika pengguna sudah login
  redirectIfLoggedIn();

  // Element Inputs
  const namaInput = document.getElementById('regNama');
  const usernameInput = document.getElementById('regUsername');
  const kelasInput = document.getElementById('regKelas');
  const passwordInput = document.getElementById('regPassword');
  const confirmPasswordInput = document.getElementById('regConfirmPassword');

  // Error Text Indicators
  const namaError = document.getElementById('namaError');
  const usernameError = document.getElementById('usernameError');
  const kelasError = document.getElementById('kelasError');
  const passwordError = document.getElementById('passwordError');
  const confirmPasswordError = document.getElementById('confirmPasswordError');

  // Password Visibility Buttons
  const toggleRegPasswordBtn = document.getElementById('toggleRegPasswordBtn');
  const regPasswordIcon = document.getElementById('regPasswordIcon');
  const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPasswordBtn');
  const confirmPasswordIcon = document.getElementById('confirmPasswordIcon');

  if (toggleRegPasswordBtn) {
    toggleRegPasswordBtn.addEventListener('click', () => {
      togglePasswordVisibility(passwordInput, regPasswordIcon);
    });
  }

  if (toggleConfirmPasswordBtn) {
    toggleConfirmPasswordBtn.addEventListener('click', () => {
      togglePasswordVisibility(confirmPasswordInput, confirmPasswordIcon);
    });
  }

  function togglePasswordVisibility(inputField, iconElement) {
    if (inputField.type === 'password') {
      inputField.type = 'text';
      iconElement.classList.remove('fa-eye');
      iconElement.classList.add('fa-eye-slash');
    } else {
      inputField.type = 'password';
      iconElement.classList.remove('fa-eye-slash');
      iconElement.classList.add('fa-eye');
    }
  }

  // Handle Form Registrasi
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset error text
    namaError.textContent = '';
    usernameError.textContent = '';
    kelasError.textContent = '';
    passwordError.textContent = '';
    confirmPasswordError.textContent = '';

    const nama = namaInput.value.trim();
    const username = usernameInput.value.trim();
    const kelas = kelasInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Lakukan Validasi
    const isValid = validateRegister(nama, username, kelas, password, confirmPassword);

    if (isValid) {
      registerUser({
        nama,
        username,
        kelas,
        password
      });
    }
  });

  /**
   * Validasi Input Pendaftaran
   */
  function validateRegister(nama, username, kelas, password, confirmPassword) {
    let valid = true;

    // Validasi Nama Lengkap
    if (!nama) {
      namaError.textContent = 'Nama lengkap wajib diisi.';
      valid = false;
    }

    // Validasi Username
    if (!username) {
      usernameError.textContent = 'Username wajib diisi.';
      valid = false;
    } else {
      const existingUsers = getUsersFromStorage();
      const isDuplicate = existingUsers.some(u => u.username.toLowerCase() === username.toLowerCase());
      if (isDuplicate) {
        usernameError.textContent = 'Username sudah digunakan.';
        showToast('Username sudah digunakan.', 'warning');
        valid = false;
      }
    }

    // Validasi Input Text Kelas
    const kelasRegex = /^[a-zA-Z0-9\s.]{2,20}$/;
    if (!kelas) {
      kelasError.textContent = 'Kelas wajib diisi.';
      valid = false;
    } else if (kelas.length < 2 || kelas.length > 20) {
      kelasError.textContent = 'Kelas harus terdiri dari 2 - 20 karakter.';
      valid = false;
    } else if (!kelasRegex.test(kelas)) {
      kelasError.textContent = 'Kelas hanya boleh memuat huruf, angka, spasi, dan titik.';
      valid = false;
    }

    // Validasi Password
    if (!password) {
      passwordError.textContent = 'Password wajib diisi.';
      valid = false;
    } else if (password.length < 8) {
      passwordError.textContent = 'Password minimal 8 karakter.';
      valid = false;
    }

    // Validasi Konfirmasi Password
    if (!confirmPassword) {
      confirmPasswordError.textContent = 'Konfirmasi password wajib diisi.';
      valid = false;
    } else if (password !== confirmPassword) {
      confirmPasswordError.textContent = 'Konfirmasi password tidak cocok.';
      valid = false;
    }

    return valid;
  }

  /**
   * Perekaman data akun baru ke Local Storage
   */
  function registerUser(userData) {
    const users = getUsersFromStorage();

    const newUser = {
      id: generateUserId(),
      nama: userData.nama,
      username: userData.username,
      kelas: userData.kelas,
      password: userData.password, // Catatan: Pada produksi disarankan di-hash
      role: 'Siswa',
      status: 'Aktif',
      registerDate: new Date().toISOString(),
      profilePhoto: DEFAULT_PROFILE_PHOTO
    };

    users.push(newUser);
    saveUsersToStorage(users);

    showToast('Registrasi berhasil.', 'success');

    // Arahkan ke halaman login
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1200);
  }
});