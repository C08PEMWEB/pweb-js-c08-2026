// ===== Ambil semua elemen HTML yang dibutuhkan =====
const form = document.getElementById("form-login");
const inputUsername = document.getElementById("username");
const inputPassword = document.getElementById("password");
const btnLogin = document.getElementById("btn-login");
const btnText = document.getElementById("btn-text");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
 
// ===== Fungsi kecil untuk tampil/sembunyi loading (arrow function) =====
const setLoading = (isLoading) => {
  if (btnLogin) btnLogin.disabled = isLoading;
  if (loading) loading.classList.toggle("hidden", !isLoading);
  if (btnText) btnText.classList.toggle("hidden", isLoading);
};
 
// ===== Fungsi kecil untuk tampilkan pesan error =====
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
 
// ===== Fungsi utama: proses login ke API =====
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
 
// ===== Event listener saat form disubmit =====
if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError();
   
    const username = inputUsername.value.trim();
    const password = inputPassword.value.trim();
   
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
}
 
// ===== Kalau login berhasil =====
function loginBerhasil(user) {
  localStorage.setItem("firstName", user.firstName);
  window.location.href = "index.html";
}

// ===== Sapaan Pengguna di Navbar & Tombol Logout =====
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
