// ===== 1. AUTH GUARD (Proteksi Halaman Global - Anggota 1) =====
function checkAuthGuard() {
  const path = window.location.pathname;
  // Deteksi apakah saat ini sedang berada di halaman login
  const isLoginPage = path.endsWith('login.html') || path.endsWith('/login') || path.endsWith('/login/');
  const userSession = localStorage.getItem('firstName');

  if (!userSession && !isLoginPage) {
    // Pengguna belum login tapi mencoba akses index.html, cart.html, atau root (/)
    window.location.href = 'login.html';
  } else if (userSession && isLoginPage) {
    // Pengguna sudah login tapi membuka login.html -> auto redirect ke katalog produk
    window.location.href = 'index.html';
  }
}

// Jalankan Auth Guard langsung saat script dimuat (defer)
checkAuthGuard();

// ===== 2. LOGIKA AUTH & LOGIN (ANGGOTA 1) =====
(() => {
  // Ambil semua elemen HTML yang dibutuhkan
  const form = document.getElementById("form-login");
  if (!form) return;

  const inputUsername = document.getElementById("username");
  const inputPassword = document.getElementById("password");
  const btnLogin = document.getElementById("btn-login");
  const btnText = document.getElementById("btn-text");
  const loading = document.getElementById("loading");
  const errorMessage = document.getElementById("error-message");

  // Fungsi kecil untuk tampil/sembunyi loading (arrow function)
  const setLoading = (isLoading) => {
    if (btnLogin) btnLogin.disabled = isLoading;
    if (loading) loading.classList.toggle("hidden", !isLoading);
    if (btnText) btnText.classList.toggle("hidden", isLoading);
  };

  // Fungsi kecil untuk tampilkan pesan error
  const showError = (pesan) => {
    if (errorMessage) {
      errorMessage.textContent = pesan;
      errorMessage.classList.remove("hidden");
    }
  };

  const clearError = () => {
    if (errorMessage) {
      errorMessage.textContent = "";
      errorMessage.classList.add("hidden");
    }
  };

  // Fungsi utama: proses login ke API
  async function prosesLogin(username, password) {
    // ?limit=0 supaya seluruh data user ikut diambil (bukan cuma 30 pertama)
    const response = await fetch("https://dummyjson.com/users?limit=0");

    if (!response.ok) {
      throw new Error("Gagal terhubung ke server. Coba lagi.");
    }

    const data = await response.json();

    // Cari user yang username & password-nya cocok (strict equality ===)
    const userDitemukan = data.users.find(
      (u) => u.username === username && u.password === password
    );

    return userDitemukan;
  }

  // Kalau login berhasil
  function loginBerhasil(user) {
    localStorage.setItem("firstName", user.firstName);
    window.location.href = "index.html";
  }

  // Event listener saat form disubmit
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError();

    const username = inputUsername ? inputUsername.value.trim() : "";
    const password = inputPassword ? inputPassword.value.trim() : "";

    // Cek truthy/falsy: kalau salah satu kosong, hentikan proses
    if (!username || !password) {
      showError("Username dan password wajib diisi!");
      return;
    }

    setLoading(true);

    try {
      const user = await prosesLogin(username, password);

      // Ternary sederhana: ada user atau tidak
      user
        ? loginBerhasil(user)
        : showError("Username atau password salah!");
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  });
})();

// ===== 3. Sapaan Pengguna di Navbar & Tombol Logout =====
document.addEventListener("DOMContentLoaded", () => {
  const navbarUserName = document.getElementById("navbarUserName");
  const btnLogout = document.getElementById("btnLogout");

  const savedUser = localStorage.getItem("firstName");
  if (navbarUserName && savedUser) {
    navbarUserName.textContent = savedUser;
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("firstName");
      window.location.href = "login.html";
    });
  }
});
