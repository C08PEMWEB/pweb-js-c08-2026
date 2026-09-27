/**
 * ==========================================================================
 * AUTH CORE & PROTEKSI SESI (auth.js)
 * TANGGUNG JAWAB: ANGGOTA 1
 * ==========================================================================
 * Fitur:
 * 1. Validasi kredensial pengguna via Users API (https://dummyjson.com/users).
 * 2. Loading state & Error handling (try...catch) saat login.
 * 3. Simpan firstName ke localStorage & auto-redirect ke katalog.
 * 4. Auth Guard: Proteksi akses halaman tanpa login.
 * 5. Logika Navbar: Sapaan nama pengguna & Logout.
 * ==========================================================================
 */

const AUTH_STORAGE_KEY = 'userFirstName';
const USERS_ENDPOINT = 'https://dummyjson.com/users';

/**
 * 1. AUTH GUARD (Proteksi Halaman Global)
 */
function checkSessionGuard() {
  const path = window.location.pathname;
  const isLoginPage = path.endsWith('login.html') || path.endsWith('login');
  const user = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!user && !isLoginPage) {
    // Pengguna belum login tapi membuka index.html atau cart.html -> paksa redirect
    window.location.href = 'login.html';
  } else if (user && isLoginPage) {
    // Pengguna sudah login tapi membuka login.html -> alihkan ke katalog
    window.location.href = 'index.html';
  }
}

/**
 * 2. SETUP NAVBAR USERNAME & LOGOUT
 */
function initNavbarAuth() {
  const nameElem = document.getElementById('navbarUserName');
  const logoutBtn = document.getElementById('btnLogout');
  const savedName = localStorage.getItem(AUTH_STORAGE_KEY);

  if (nameElem && savedName) {
    nameElem.textContent = savedName;
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Yakin ingin keluar dari akun ShopeeLite?')) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        window.location.href = 'login.html';
      }
    });
  }
}

/**
 * 3. FORM LOGIN HANDLER (Khusus login.html)
 */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const errBox = document.getElementById('loginErrorBox');
  const errMsg = document.getElementById('loginErrorMsg');
  const submitBtn = document.getElementById('btnSubmit');
  const btnText = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');

  function setLoading(loading) {
    if (loading) {
      submitBtn.disabled = true;
      btnSpinner.classList.remove('hidden');
      btnText.textContent = 'Memverifikasi...';
      errBox.classList.add('hidden');
    } else {
      submitBtn.disabled = false;
      btnSpinner.classList.add('hidden');
      btnText.textContent = 'Masuk';
    }
  }

  function displayError(message) {
    errMsg.textContent = message;
    errBox.classList.remove('hidden');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      displayError('Mohon masukkan username dan password Anda!');
      return;
    }

    setLoading(true);

    try {
      // Ambil daftar user dari Users API
      const res = await fetch(USERS_ENDPOINT);
      if (!res.ok) throw new Error(`Server bermasalah (Status: ${res.status})`);

      const data = await res.json();
      const users = data.users || [];

      // Validasi kredensial pengguna
      const match = users.find((u) => u.username === username && u.password === password);

      if (match) {
        // Simpan nama depan pengguna ke Local Storage sesuai spesifikasi
        localStorage.setItem(AUTH_STORAGE_KEY, match.firstName);
        // Auto-redirect ke katalog produk
        window.location.href = 'index.html';
      } else {
        displayError('Username atau password salah! Coba username demo.');
      }
    } catch (err) {
      console.error('Error login:', err);
      displayError('Gagal melakukan verifikasi: ' + err.message);
    } finally {
      setLoading(false);
    }
  });
}

// Jalankan guard segera
checkSessionGuard();

document.addEventListener('DOMContentLoaded', () => {
  initNavbarAuth();
  initLoginForm();
});
