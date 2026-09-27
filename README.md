# 🛍️ ShopeeLite - Praktikum Pemrograman Web Modul 2 (Native Front-End)

Aplikasi katalog belanja **ShopeeLite** yang dibangun murni secara native menggunakan **HTML5, CSS3, dan Vanilla JavaScript from scratch** tanpa menggunakan framework/library (No Tailwind, No Bootstrap, No React, No Vue, No jQuery) dan tanpa template.

Menggunakan tema visual **ShopeeLite** dengan warna utama **Solid Orange (#ee4d2d)**, berdesain flat modern, rapi, dan **tanpa gradien** sama sekali sesuai ketentuan praktikum.

---

## 👥 Pembagian Tugas & File Anggota

Proyek ini telah distrukturkan secara terpisah dan modular agar masing-masing anggota dapat fokus pada bagiannya tanpa bentrok:

| No | Anggota | Bagian / Peran | File Terkait |
|:---|:---|:---|:---|
| **1** | **Anggota 1** | **Halaman Login & Proteksi Sesi Global**<br>• UI login native flat ShopeeLite<br>• Validasi kredensial via Users API (`fetch()`)<br>• Loading state & Error handling (`try...catch`)<br>• Session persistence ke `localStorage`<br>• Auth Guard (proteksi `index.html` & `cart.html`)<br>• Logika navbar nama user & Logout | • `login.html`<br>• `css/login.css`<br>• `js/auth.js` |
| **2** | **Anggota 2** *(Anda)* | **Halaman Katalog & Manipulasi Data Produk**<br>• Layout katalog ShopeeLite & CSS grid kartu produk<br>• Fetch data dari Products API (`https://dummyjson.com/products`)<br>• Global visual error handling & loading state<br>• Render dinamis kartu produk ke DOM<br>• Pencarian real-time dengan **Debounce (Closure)**<br>• Filter & Sorting (**Functional Programming**)<br>• Tombol **Load More** dengan **Array Slicing** | • `index.html`<br>• `css/catalog.css`<br>• `js/catalog.js` |
| **3** | **Anggota 3** | **Keranjang Belanja & Modal Detail Produk**<br>• UI halaman keranjang belanja (`cart.html`)<br>• Modal popup detail produk ShopeeLite<br>• Modal detail dengan teknik **Event Delegation**<br>• Sistem Keranjang Belanja (**CRUD localStorage**)<br>• Badge counter & kalkulasi total harga dinamis<br>• Render daftar keranjang & hapus item | • `cart.html`<br>• `css/cart.css`<br>• `css/modal.css`<br>• `js/cart.js`<br>• `js/modal.js` |

---

## 📁 Struktur Direktori

```text
pweb-js-c08-2026/
├── index.html              # Halaman Katalog ShopeeLite (Tugas: Anggota 2)
├── login.html              # Halaman Login Pengguna (Tugas: Anggota 1)
├── cart.html               # Halaman Keranjang Belanja (Tugas: Anggota 3)
├── css/
│   ├── global.css          # Tema ShopeeLite flat, variabel solid color, navbar
│   ├── catalog.css         # Styling katalog, filter bar, grid kartu (Anggota 2)
│   ├── login.css           # Styling form login (Anggota 1)
│   ├── cart.css            # Styling tabel belanja & ringkasan (Anggota 3)
│   └── modal.css           # Styling modal detail produk (Anggota 3)
├── js/
│   ├── catalog.js          # Fetch Products, Debounce Closure, Filter/Sort, Load More (Anggota 2)
│   ├── auth.js             # Auth Guard, Fetch Users API, Sesi, Navbar Logout (Anggota 1)
│   ├── cart.js             # CRUD Local Storage Keranjang & Badge (Anggota 3)
│   └── modal.js            # Event Delegation pada parent container (Anggota 3)
├── assets/                 # Direktori aset statis
└── README.md
```

---

## 🎯 Panduan Teknis & Penjelasan untuk Demo (Anggota 2)

Saat sesi demo dengan asisten dosen, berikut poin-poin penting yang ada di [`js/catalog.js`](file:///home/zaki/Kuliah/PemWeb/Praktikum/pweb-js-c08-2026/js/catalog.js) yang dapat Anda jelaskan:

### 1. Teknik Debounce memanfaatkan konsep Closure
```javascript
function debounce(callback, delay = 300) {
  let timer; // Variabel lokal yang disimpan di dalam closure
  return function (...args) {
    clearTimeout(timer); // Batalkan timer jika tombol keyboard ditekan lagi sebelum jeda selesai
    timer = setTimeout(() => {
      callback.apply(this, args); // Jalankan fungsi filter
    }, delay);
  };
}
```
* **Poin Jawaban Demo:** Closure adalah kemampuan fungsi inner untuk mengakses variabel `timer` dari scope outer-nya bahkan setelah fungsi outer selesai dieksekusi. Hal ini mencegah pencarian memicu re-render pada setiap ketikan huruf dan membuat aplikasi hemat performa.

### 2. Filter & Sorting (Functional Programming)
```javascript
// Filter: Menyaring produk tanpa mengubah array sumber
let result = allProducts.filter((product) => { ... });

// Sorting: Mengurutkan array salinan baru secara murni
result = [...result].sort((a, b) => a.price - b.price);
```
* **Poin Jawaban Demo:** Menerapkan prinsip *immutability* dan *pure functions* menggunakan method bawaan JavaScript (`.filter()`, `.sort()`) tanpa merubah isi array asli `allProducts`.

### 3. Load More / Pagination dengan Array Slicing
```javascript
const itemsToShow = filteredProducts.slice(0, currentLimit);
```
* **Poin Jawaban Demo:** Menggunakan `.slice()` untuk memotong array data yang tampil ke layar dari indeks 0 hingga `currentLimit`. Setiap kali tombol "Muat Lebih Banyak" diklik, `currentLimit` ditambah sebanyak 8 item (`ITEMS_PER_PAGE`).

---

## 🔑 Akun Demo DummyJSON
- **Username:** `emilys` | **Password:** `emilyspass`
- **Username:** `michaelw` | **Password:** `michaelwpass`

---

## 🚀 Cara Menjalankan
Jalankan live server lokal menggunakan Python:
```bash
python3 -m http.server 8000
```
Buka di browser: `http://localhost:8000/login.html` atau langsung `http://localhost:8000/index.html` (jika sudah login).
