/**
 * ==========================================================================
 * AUTH CORE & SESSION MANAGEMENT (auth.js)
 * Penanggung Jawab: ANGGOTA 1
 * ==========================================================================
 * Tugas & Tanggung Jawab:
 * 1. Merancang validasi kredensial pengguna via Users API (https://dummyjson.com/users) menggunakan fetch().
 * 2. Komponen Loading State saat proses verifikasi akun.
 * 3. Error Handling dengan try...catch (pesan error visual jika username/password salah atau API bermasalah).
 * 4. Manajemen sesi pengguna: simpan firstName ke localStorage saat login sukses dan redirect ke index.html.
 * 5. Fungsi Proteksi Halaman (Auth Guard): redirect paksa ke login.html jika mencoba akses index.html/cart.html tanpa sesi.
 * 6. Logika Navbar global: sapaan nama user dari localStorage & tombol Logout (hapus sesi & redirect ke login.html).
 * ==========================================================================
 */

// Konstanta Kunci Sesi di localStorage
const SESSION_KEY = 'userFirstName';
const USERS_API_URL = 'https://dummyjson.com/users';

/**
 * 1. AUTH GUARD (Proteksi Halaman Global)
 * Dipanggil langsung saat script dimuat (defer) untuk memastikan akses valid.
 */
function checkAuthGuard() {
  const currentPath = window.location.pathname;
  const isLoginPage = currentPath.endsWith('login.html') || currentPath.endsWith('login');
  const userSession = localStorage.getItem(SESSION_KEY);

  if (!userSession && !isLoginPage) {
    // Pengguna belum login tapi mencoba akses halaman yang dilindungi (index.html atau cart.html)
    window.location.href = 'login.html';
  } else if (userSession && isLoginPage) {
    // Pengguna sudah login tapi membuka login.html -> auto redirect ke katalog
    window.location.href = 'index.html';
  }
}

/**
 * 2. LOGIKA NAVBAR GLOBAL
 * Menampilkan sapaan nama user dan menangani tombol Logout
 */
function initGlobalNavbar() {
  const userNameElem = document.getElementById('navbarUserName');
  const logoutBtn = document.getElementById('btnLogout');
  const savedName = localStorage.getItem(SESSION_KEY);

  if (userNameElem && savedName) {
    userNameElem.textContent = savedName;
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Konfirmasi logout
      if (confirm('Apakah Anda yakin ingin keluar?')) {
        // Hapus data sesi dari localStorage
        localStorage.removeItem(SESSION_KEY);
        // Redirect ke login.html
        window.location.href = 'login.html';
      }
    });
  }
}

/**
 * 3. LOGIKA FORM LOGIN & VALIDASI KREDENSIAL (Hanya dieksekusi di login.html)
 */
function initLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const errorContainer = document.getElementById('loginErrorContainer');
  const errorMessage = document.getElementById('loginErrorMessage');
  const loginSubmitBtn = document.getElementById('btnSubmitLogin');
  const btnText = document.getElementById('btnSubmitText');
  const btnSpinner = document.getElementById('btnSubmitSpinner');

  function setLoading(isLoading) {
    if (isLoading) {
      loginSubmitBtn.disabled = true;
      btnSpinner.classList.remove('hidden');
      btnText.textContent = 'Memverifikasi...';
      hideError();
    } else {
      loginSubmitBtn.disabled = false;
      btnSpinner.classList.add('hidden');
      btnText.textContent = 'Masuk';
    }
  }

  function showError(msg) {
    errorMessage.textContent = msg;
    errorContainer.classList.remove('hidden');
  }

  function hideError() {
    errorMessage.textContent = '';
    errorContainer.classList.add('hidden');
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showError('Harap isi username dan password Anda!');
      return;
    }

    setLoading(true);

    try {
      // Mengambil daftar pengguna dari Users API
      const response = await fetch(USERS_API_URL);

      if (!response.ok) {
        throw new Error(`Gagal menghubungi server (HTTP ${response.status})`);
      }

      const data = await response.json();
      const users = data.users || [];

      // Validasi kredensial pengguna (mencocokkan username & password)
      const matchedUser = users.find(
        (u) => u.username === username && u.password === password
      );

      if (matchedUser) {
        // Simpan firstName pengguna ke Local Storage (sesuai spesifikasi soal)
        localStorage.setItem(SESSION_KEY, matchedUser.firstName);

        // Auto Redirect ke halaman katalog produk
        window.location.href = 'index.html';
      } else {
        showError('Username atau password salah! Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error saat login:', error);
      showError('Terjadi kesalahan saat memproses login: ' + error.message);
    } finally {
      setLoading(false);
    }
  });
}

// Inisialisasi saat file dimuat
checkAuthGuard();
document.addEventListener('DOMContentLoaded', () => {
  initGlobalNavbar();
  initLoginForm();
});
