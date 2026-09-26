# 🛍️ Mini Shopee - Praktikum Pemrograman Web Modul 2 (Native Front-End)

Proyek aplikasi web e-commerce interaktif **Mini Shopee** yang dibangun murni menggunakan **HTML5, CSS3, dan Vanilla JavaScript (Native from scratch)** tanpa menggunakan framework, template, atau library eksternal (No React, Vue, jQuery, Bootstrap, Tailwind, dll).

Seluruh file JavaScript eksternal dihubungkan dengan atribut `defer` sesuai ketentuan praktikum.

---

## 👥 Pembagian Tugas Anggota Kelompok

Proyek ini telah distrukturisasi secara modular dan terpisah rapi agar setiap anggota kelompok dapat fokus mengembangkan, memelihara, dan menjelaskan bagian tugasnya saat sesi demo:

| No | Anggota | Bagian / Peran | File Terkait |
|:---|:---|:---|:---|
| **1** | **Anggota 1** | **Halaman Login & Proteksi Sesi Global**<br>• UI & layout login native<br>• Validasi kredensial via Users API (`fetch()`)<br>• Loading state & Error handling (`try...catch`)<br>• Session persistence ke `localStorage`<br>• Auth Guard (proteksi `index.html` & `cart.html`)<br>• Logika navbar sapaan user & Logout | • `login.html`<br>• `css/login.css`<br>• `js/auth.js` |
| **2** | **Anggota 2** | **Halaman Katalog & Manipulasi Data Produk**<br>• UI layout katalog & CSS grid kartu produk<br>• Pengambilan data via Products API (`fetch()`)<br>• Global visual error handling & loading state<br>• Render dinamis kartu produk ke DOM<br>• Pencarian real-time dengan **Debounce (Closure)**<br>• Filter & Sorting (**Functional Programming**)<br>• Tombol **Load More** dengan **Array Slicing** | • `index.html` (bagian katalog & filter)<br>• `css/catalog.css`<br>• `js/catalog.js` |
| **3** | **Anggota 3** | **Keranjang Belanja & Modal Detail Produk**<br>• UI & layout halaman keranjang belanja (`cart.html`)<br>• Komponen UI Modal Popup detail produk<br>• Modal detail dengan teknik **Event Delegation**<br>• Sistem Keranjang Belanja (**CRUD localStorage**)<br>• Badge counter & kalkulasi total harga dinamis<br>• Render daftar keranjang & hapus item | • `cart.html`<br>• `css/cart.css`<br>• `css/modal.css`<br>• `js/cart.js`<br>• `js/modal.js` |

---

## 📁 Struktur Folder & File Proyek

```text
pweb-js-c08-2026/
├── index.html              # Halaman Utama Katalog Produk (Mini Shopee)
├── login.html              # Halaman Login Pengguna
├── cart.html               # Halaman Keranjang Belanja
├── css/
│   ├── global.css          # Styling global, variabel tema, navbar, spinner, alert
│   ├── login.css           # Styling halaman login (Anggota 1)
│   ├── catalog.css         # Styling katalog, filter bar, grid kartu (Anggota 2)
│   ├── cart.css            # Styling tabel belanja, ringkasan harga (Anggota 3)
│   └── modal.css           # Styling modal popup detail produk (Anggota 3)
├── js/
│   ├── auth.js             # Auth Guard, Fetch Users API, Sesi, Navbar Logout (Anggota 1)
│   ├── catalog.js          # Fetch Products, Debounce Closure, Filter/Sort, Load More (Anggota 2)
│   ├── cart.js             # CRUD Local Storage Keranjang, Badge Count, Total Harga (Anggota 3)
│   └── modal.js            # Event Delegation pada parent container, Detail Modal (Anggota 3)
├── assets/                 # Direktori gambar, ikon, atau aset statis
└── README.md               # Dokumentasi spesifikasi & petunjuk pengerjaan
```

---

## 🌐 API yang Digunakan

1. **Users API (Autentikasi Login):**
   - URL: `https://dummyjson.com/users`
   - Dipanggil menggunakan `fetch()` di [`js/auth.js`](file:///home/zaki/Kuliah/PemWeb/Praktikum/pweb-js-c08-2026/js/auth.js).
   - Validasi kredensial `username` & `password`.

2. **Products API (Katalog Produk):**
   - URL: `https://dummyjson.com/products?limit=100`
   - Dipanggil menggunakan `fetch()` di [`js/catalog.js`](file:///home/zaki/Kuliah/PemWeb/Praktikum/pweb-js-c08-2026/js/catalog.js).
   - Mendukung manipulasi data: nama produk, thumbnail, harga, diskon, rating, brand, kategori, dan stok.

---

## 🔑 Akun Demo untuk Pengujian (DummyJSON)

Gunakan kredensial berikut untuk login di `login.html`:
- **Username:** `emilys` | **Password:** `emilyspass`
- **Username:** `michaelw` | **Password:** `michaelwpass`

---

## 🛠️ Konsep & Teknik Khusus yang Diterapkan

1. **Debounce menggunakan Closure (`js/catalog.js`):**
   ```javascript
   function createDebounce(callback, delay = 350) {
     let timerId = null; // Closure variable
     return function (...args) {
       if (timerId) clearTimeout(timerId);
       timerId = setTimeout(() => {
         callback.apply(this, args);
       }, delay);
     };
   }
   ```
2. **Functional Programming (`js/catalog.js`):**
   - Filter dan pengurutan menggunakan pure methods tanpa mutasi langsung pada array sumber: `array.filter(...)`, `[...array].sort(...)`.
3. **Array Slicing untuk Pagination / Load More (`js/catalog.js`):**
   - Pemotongan kumpulan data menggunakan `filteredProducts.slice(0, currentLimit)`.
4. **Event Delegation (`js/modal.js`):**
   - Event listener dipasang hanya pada elemen kontainer parent (`#productGrid`), mendeteksi target klik menggunakan `event.target.closest()`.
5. **Session & CRUD Local Storage (`js/auth.js` & `js/cart.js`):**
   - `localStorage.setItem()`, `localStorage.getItem()`, dan `localStorage.removeItem()` digunakan untuk persistensi login dan keranjang belanja.

---

## 🚀 Cara Menjalankan

Buka proyek menggunakan ekstensi **Live Server** di VS Code atau jalankan local server bawaan:

```bash
# Menggunakan Python 3:
python3 -m http.server 8000
```
Buka browser di: `http://localhost:8000/login.html`
