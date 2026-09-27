// URL API DummyJSON untuk mengambil data 100 produk
const PRODUCTS_API_URL = 'https://dummyjson.com/products?limit=100';

// Nilai tukar kurs 1 USD ke Rupiah (Rp 16.000)
const KURS_USD_KE_IDR = 16000;

// Variabel array untuk menampung seluruh data produk asli dari API
let allProducts = [];

// Variabel array untuk menampung produk hasil pencarian, filter, dan sort
let filteredProducts = [];

// Batas jumlah produk yang sedang ditampilkan saat ini
let currentLimit = 12;

// Jumlah produk yang ditambahkan setiap kali tombol Load More ditekan
const ITEMS_PER_PAGE = 8;

// Mengambil elemen kontainer grid tempat kartu produk ditampilkan
const productGrid = document.getElementById('productGrid');

// Mengambil elemen kotak loading visual
const catalogLoading = document.getElementById('catalogLoading');

// Mengambil elemen kotak pesan error global
const catalogError = document.getElementById('catalogError');

// Mengambil elemen teks paragraf untuk menampilkan pesan error
const catalogErrorMsg = document.getElementById('catalogErrorMessage');

// Mengambil elemen kotak informasi saat produk tidak ditemukan
const catalogEmpty = document.getElementById('catalogEmpty');

// Mengambil elemen input teks pencarian produk
const searchInput = document.getElementById('searchInput');

// Mengambil elemen tombol ikon pencarian di navbar
const btnSearch = document.getElementById('btnSearch');

// Mengambil elemen dropdown select untuk filter kategori
const categoryFilter = document.getElementById('categoryFilter');

// Mengambil elemen dropdown select untuk pengurutan (sorting) produk
const sortFilter = document.getElementById('sortFilter');

// Mengambil elemen tombol Load More untuk memuat produk tambahan
const btnLoadMore = document.getElementById('btnLoadMore');

// Mengambil elemen pembungkus area tombol Load More
const loadMoreSection = document.getElementById('loadMoreSection');

// Mengambil elemen teks info jumlah produk yang sedang tampil
const loadMoreInfo = document.getElementById('loadMoreInfo');

// Mengambil elemen tombol avatar pengguna di navbar
const userAvatarBtn = document.getElementById('userAvatarBtn');

// Mengambil elemen pembungkus menu dropdown pengguna
const userMenuWrapper = document.getElementById('userMenuWrapper');

// Fungsi untuk mengubah harga USD menjadi format Rupiah Indonesia
function formatRupiah(priceInUSD) {
  // Kalikan harga USD dengan kurs lalu bulatkan ke bilangan bulat terdekat
  const rupiah = Math.round(priceInUSD * KURS_USD_KE_IDR);
  // Format angka ke format lokal Indonesia dengan pemisah titik ribuan
  return rupiah.toLocaleString('id-ID');
}

// Fungsi debounce menggunakan Closure untuk memberi jeda waktu eksekusi saat mengetik
function debounce(callback, delay = 300) {
  // Variabel privat timer yang disimpan di dalam closure
  let timer;

  // Mengembalikan fungsi baru yang akan menunda eksekusi
  return function (...args) {
    // Batalkan timer yang sedang berjalan sebelumnya
    clearTimeout(timer);
    // Set timer baru untuk menjalankan callback setelah jeda waktu selesai
    timer = setTimeout(() => {
      // Jalankan fungsi asli dengan parameter yang diberikan
      callback.apply(this, args);
    }, delay);
  };
}

// Fungsi asynchronous untuk mengambil data produk dari server API
async function fetchProducts() {
  // Tampilkan indikator loading berputar
  showCatalogLoading(true);
  // Sembunyikan kotak error jika sebelumnya ada
  hideCatalogError();

  try {
    // Kirim permintaan HTTP GET ke API menggunakan fetch
    const response = await fetch(PRODUCTS_API_URL);

    // Cek apakah respon server gagal (status bukan 200-299)
    if (!response.ok) {
      // Lempar error agar ditangkap oleh blok catch
      throw new Error(`Gagal memuat produk dari server (Status: ${response.status})`);
    }

    // Ubah data respon dari format JSON menjadi object JavaScript
    const data = await response.json();
    // Simpan array produk ke variabel allProducts (default array kosong jika null)
    allProducts = data.products || [];

    // Buat daftar opsi kategori secara dinamis ke elemen select
    setupCategoryOptions(allProducts);

    // Jalankan filter, sort, dan render produk pertama kali
    applyFilterAndSort();

  } catch (error) {
    // Tampilkan pesan error ke konsol browser untuk keperluan debugging
    console.error('Terjadi kesalahan saat fetch produk:', error);
    // Tampilkan pesan error visual ke pengguna di halaman
    showCatalogError(error.message || 'Koneksi ke server bermasalah.');
  } finally {
    // Sembunyikan indikator loading baik fetch berhasil maupun gagal
    showCatalogLoading(false);
  }
}

// Fungsi untuk mengisi pilihan kategori ke dropdown select secara dinamis
function setupCategoryOptions(products) {
  // Keluar jika elemen categoryFilter tidak ada di halaman
  if (!categoryFilter) return;

  // Ambil semua kategori unik menggunakan Set lalu urutkan abjad menggunakan sort
  const categories = [...new Set(products.map((p) => p.category))].sort();

  // Reset opsi dropdown dengan opsi default semua kategori
  categoryFilter.innerHTML = '<option value="all">Semua Kategori</option>';

  // Loop setiap nama kategori yang ditemukan
  categories.forEach((cat) => {
    // Buat elemen baru option
    const option = document.createElement('option');
    // Set nilai value option dengan nama kategori asli
    option.value = cat;
    // Ubah huruf pertama menjadi kapital untuk teks label yang tampil
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    // Masukkan elemen option ke dalam dropdown select
    categoryFilter.appendChild(option);
  });
}

// Fungsi Functional Programming untuk menyaring dan mengurutkan produk
function applyFilterAndSort() {
  // Ambil teks pencarian dari input, hilangkan spasi dan ubah ke huruf kecil
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  // Ambil kategori yang dipilih dari dropdown (default 'all')
  const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
  // Ambil metode sorting yang dipilih dari dropdown (default 'default')
  const selectedSort = sortFilter ? sortFilter.value : 'default';

  // Menyaring produk menggunakan metode filter murni (Pure Function)
  let result = allProducts.filter((product) => {
    // Cek apakah query pencarian cocok dengan nama, kategori, atau brand produk
    const matchesQuery =
      product.title.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      (product.brand && product.brand.toLowerCase().includes(query));

    // Cek apakah kategori produk cocok dengan yang dipilih di dropdown
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;

    // Produk lolos filter hanya jika memenuhi kedua kondisi di atas
    return matchesQuery && matchesCategory;
  });

  // Mengurutkan produk menggunakan metode sort murni dengan spread operator
  result = [...result].sort((a, b) => {
    // Urutkan harga termurah ke termahal
    if (selectedSort === 'price-asc') return a.price - b.price;
    // Urutkan harga termahal ke termurah
    if (selectedSort === 'price-desc') return b.price - a.price;
    // Urutkan rating tertinggi ke terendah
    if (selectedSort === 'rating-desc') return b.rating - a.rating;
    // Urutkan rating terendah ke tertinggi
    if (selectedSort === 'rating-asc') return a.rating - b.rating;
    // Urutan default berdasarkan id produk
    return a.id - b.id;
  });

  // Simpan hasil filter dan sort ke variabel filteredProducts
  filteredProducts = result;
  // Reset batas pagination ke 12 setiap kali filter atau pencarian berubah
  currentLimit = 12;
  // Render ulang kartu produk ke halaman web
  renderProducts();
}

// Fungsi untuk merender daftar kartu produk ke elemen DOM dengan teknik Array Slicing
function renderProducts() {
  // Keluar jika elemen productGrid tidak ditemukan
  if (!productGrid) return;

  // Kosongkan isi kontainer grid sebelum merender kartu baru
  productGrid.innerHTML = '';

  // Jika tidak ada produk yang cocok dengan pencarian atau filter
  if (filteredProducts.length === 0) {
    // Tampilkan kotak informasi produk kosong
    if (catalogEmpty) catalogEmpty.classList.remove('hidden');
    // Sembunyikan area tombol load more
    if (loadMoreSection) loadMoreSection.classList.add('hidden');
    return;
  }

  // Sembunyikan kotak informasi produk kosong karena data ada
  if (catalogEmpty) catalogEmpty.classList.add('hidden');

  // Potong array data produk sesuai batas pagination saat ini menggunakan slice
  const itemsToShow = filteredProducts.slice(0, currentLimit);

  // Loop setiap produk yang akan ditampilkan pada batch ini
  itemsToShow.forEach((product) => {
    // Buat elemen div untuk wadah kartu produk
    const card = document.createElement('div');
    // Beri class product-card untuk styling kartu
    card.className = 'product-card';
    // Simpan id produk di data attribute untuk event delegation
    card.dataset.id = product.id;

    // Buat badge diskon Shopee jika produk memiliki diskon
    const discountBadge = product.discountPercentage
      ? `<span class="shopee-discount-tag">-${Math.round(product.discountPercentage)}%</span>`
      : '';

    // Isi struktur HTML di dalam kartu produk secara dinamis
    card.innerHTML = `
      <div class="card-thumb-wrap" data-action="open-detail" data-id="${product.id}">
        <img class="card-thumb" src="${product.thumbnail}" alt="${escapeHtml(product.title)}" loading="lazy" />
        ${discountBadge}
      </div>
      <div class="card-content">
        <span class="card-category">${escapeHtml(product.category)}</span>
        <h3 class="card-title" data-action="open-detail" data-id="${product.id}" title="${escapeHtml(product.title)}">
          ${escapeHtml(product.title)}
        </h3>
        <div class="card-price-row">
          <span class="currency-symbol">Rp</span>
          <span class="price-number">${formatRupiah(product.price)}</span>
        </div>
        <div class="card-meta">
          <span class="card-rating">
            <svg class="icon-star-svg" viewBox="0 0 24 24" fill="#ffb800">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span>${product.rating.toFixed(1)}</span>
          </span>
          <span class="card-brand">${escapeHtml(product.brand || 'Original')}</span>
        </div>
        <div class="card-footer">
          <button type="button" class="btn btn-shopee-outline btn-add-cart" data-action="add-cart" data-id="${product.id}">
            + Keranjang
          </button>
        </div>
      </div>
    `;

    // Masukkan kartu produk yang sudah dibuat ke dalam kontainer grid
    productGrid.appendChild(card);
  });

  // Perbarui status tampilan tombol load more dan teks info jumlah
  updateLoadMoreState();
}

// Fungsi untuk menangani penambahan batch produk saat tombol Load More diklik
function handleLoadMore() {
  // Tambah batas limit produk dengan nilai ITEMS_PER_PAGE (8)
  currentLimit += ITEMS_PER_PAGE;
  // Render ulang produk untuk menampilkan item tambahan
  renderProducts();
}

// Fungsi untuk memperbarui status visibilitas tombol Load More
function updateLoadMoreState() {
  // Keluar jika elemen loadMoreSection tidak ditemukan
  if (!loadMoreSection) return;

  // Hitung total produk yang lolos filter
  const total = filteredProducts.length;
  // Hitung jumlah produk yang sedang tampil (tidak boleh melebihi total)
  const showing = Math.min(currentLimit, total);

  // Perbarui teks informasi jumlah produk yang sedang ditampilkan
  if (loadMoreInfo) {
    loadMoreInfo.textContent = `Menampilkan ${showing} dari ${total} produk`;
  }

  // Jika semua produk sudah ditampilkan, sembunyikan tombol load more
  if (currentLimit >= total) {
    btnLoadMore.classList.add('hidden');
  } else {
    // Jika masih ada produk tersisa, tampilkan tombol load more
    btnLoadMore.classList.remove('hidden');
    loadMoreSection.classList.remove('hidden');
  }
}

// Fungsi untuk menampilkan atau menyembunyikan status loading visual
function showCatalogLoading(isLoading) {
  if (catalogLoading) {
    // Hapus class hidden jika loading aktif, tambahkan jika loading selesai
    if (isLoading) catalogLoading.classList.remove('hidden');
    else catalogLoading.classList.add('hidden');
  }
}

// Fungsi untuk menampilkan pesan error visual kepada pengguna
function showCatalogError(message) {
  if (catalogError && catalogErrorMsg) {
    // Tulis pesan error ke elemen teks
    catalogErrorMsg.textContent = message;
    // Tampilkan kotak error dengan menghapus class hidden
    catalogError.classList.remove('hidden');
  }
}

// Fungsi untuk menyembunyikan kotak error visual
function hideCatalogError() {
  if (catalogError) {
    // Sembunyikan kotak error dengan menambahkan class hidden
    catalogError.classList.add('hidden');
  }
}

// Fungsi keamanan untuk mencegah serangan XSS dengan mengubah karakter khusus HTML
function escapeHtml(text) {
  // Kembalikan string kosong jika nilai text null atau undefined
  if (!text) return '';
  // Ubah karakter HTML berbahaya menjadi entitas HTML aman
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Menunggu seluruh elemen DOM HTML selesai dimuat sebelum menjalankan event listener
document.addEventListener('DOMContentLoaded', () => {
  // Pastikan halaman ini memiliki elemen productGrid sebelum menginisialisasi katalog
  if (!document.getElementById('productGrid')) return;

  // Inisialisasi event input pencarian dengan debounce jika elemen searchInput ada
  if (searchInput) {
    // Buat fungsi debounced yang akan menjalankan filter setelah jeda 300ms
    const onSearchDebounced = debounce(() => {
      applyFilterAndSort();
    }, 300);

    // Pasang event listener input saat pengguna mengetik di kolom pencarian
    searchInput.addEventListener('input', onSearchDebounced);
  }

  // Pasang event click pada tombol pencarian di navbar
  if (btnSearch) {
    btnSearch.addEventListener('click', () => {
      applyFilterAndSort();
    });
  }

  // Ambil semua tag kata kunci populer di bawah search bar
  const keywordTags = document.querySelectorAll('.keyword-tag');
  // Pasang event click pada setiap tag kata kunci
  keywordTags.forEach((tag) => {
    tag.addEventListener('click', () => {
      // Ambil teks kata kunci dari atribut data-keyword atau teks tombol
      const keyword = tag.dataset.keyword || tag.textContent.trim();
      // Masukkan kata kunci ke dalam input pencarian
      if (searchInput) {
        searchInput.value = keyword;
      }
      // Terapkan filter pencarian
      applyFilterAndSort();
    });
  });

  // Mengatur interaksi klik menu avatar pengguna
  if (userAvatarBtn && userMenuWrapper) {
    // Klik tombol avatar untuk buka atau tutup menu dropdown
    userAvatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenuWrapper.classList.toggle('active');
    });

    // Menutup menu dropdown jika pengguna mengklik di luar area avatar
    document.addEventListener('click', (e) => {
      if (!userMenuWrapper.contains(e.target)) {
        userMenuWrapper.classList.remove('active');
      }
    });
  }

  // Pasang event change pada dropdown kategori
  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      applyFilterAndSort();
    });
  }

  // Pasang event change pada dropdown sorting produk
  if (sortFilter) {
    sortFilter.addEventListener('change', () => {
      applyFilterAndSort();
    });
  }

  // Pasang event click pada tombol Load More
  if (btnLoadMore) {
    btnLoadMore.addEventListener('click', handleLoadMore);
  }

  // Panggil fungsi untuk mengambil data produk pertama kali saat halaman dimuat
  fetchProducts();
});

// Ekspor fungsi getter seluruh produk ke window agar bisa diakses oleh modal.js
window.getAllProducts = () => allProducts;

// Ekspor fungsi format Rupiah ke window agar bisa dipakai oleh script lain
window.formatRupiah = formatRupiah;
