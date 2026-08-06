/* ==========================================================================
   PerpusQu - Login Functionality
   Handles form validation, authentication, and session handling
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Pengecekan awal: Jika pengguna sudah login, langsung arahkan ke Dashboard
  redirectIfLoggedIn();

  // Element DOM
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  
  const usernameError = document.getElementById('usernameError');
  const passwordError = document.getElementById('passwordError');
  
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const passwordIcon = document.getElementById('passwordIcon');

  // Toggle visibilitas password
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      togglePasswordVisibility(passwordInput, passwordIcon);
    });
  }

  // Handle pengiriman Form Login
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Clear error text
      usernameError.textContent = '';
      passwordError.textContent = '';

      const username = usernameInput.value.trim();
      const password = passwordInput.value;

      // Validasi form lokal
      const isValid = validateLogin(username, password);

      if (isValid) {
        // Eksekusi Login
        loginUser(username, password);
      }
    });
  }

  /**
   * Mengatur visibilitas input password
   * @param {HTMLElement} inputField 
   * @param {HTMLElement} iconElement 
   */
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

  /**
   * Memvalidasi input form login sebelum mengecek database
   * @param {string} username 
   * @param {string} password 
   * @returns {boolean}
   */
  function validateLogin(username, password) {
    let valid = true;

    if (!username) {
      usernameError.textContent = 'Username wajib diisi.';
      valid = false;
    }

    if (!password) {
      passwordError.textContent = 'Password wajib diisi.';
      valid = false;
    }

    return valid;
  }

  /**
   * Melakukan verifikasi akun dari localStorage
   * @param {string} username 
   * @param {string} password 
   */
  function loginUser(username, password) {
    const users = getUsersFromStorage();

    // Cari pengguna berdasarkan username
    const userFound = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!userFound) {
      showToast('Username tidak ditemukan.', 'error');
      usernameError.textContent = 'Username tidak terdaftar.';
      return;
    }

    // Verifikasi password
    if (userFound.password !== password) {
      showToast('Password salah.', 'error');
      passwordError.textContent = 'Password yang Anda masukkan salah.';
      return;
    }

    // Login Berhasil: Simpan ke currentUser & Arahkan ke Dashboard
    saveCurrentUser(userFound);
    showToast('Login berhasil.', 'success');

    // Beri jeda singkat agar toast terlihat sebelum redirect
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }
});