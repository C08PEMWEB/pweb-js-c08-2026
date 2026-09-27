/**
 * ==========================================================================
 * KATALOG PRODUK & MANIPULASI DATA (catalog.js)
 * TANGGUNG JAWAB: ANGGOTA 2
 * ==========================================================================
 * Konsep & Fitur Wajib yang Diimplementasikan:
 * 1. Pengambilan data dari Products API (https://dummyjson.com/products) via fetch().
 * 2. Visual Global Error Handling jika fetch produk gagal.
 * 3. Render dinamis kartu produk ke DOM.
 * 4. Pencarian Real-Time dengan teknik Debounce (Closure).
 * 5. Filter & Sorting menggunakan Functional Programming (pure array methods).
 * 6. Tombol Load More / Pagination menggunakan teknik Array Slicing.
 * ==========================================================================
 */

// 1. URL API & Variabel State Sederhana
const PRODUCTS_API_URL = 'https://dummyjson.com/products?limit=100';

let allProducts = [];        // Data asli seluruh produk dari API
let filteredProducts = [];   // Data produk setelah disaring (search/filter/sort)
let currentLimit = 12;       // Batas jumlah produk yang tampil saat ini
const ITEMS_PER_PAGE = 8;    // Tambahan jumlah produk setiap klik "Load More"

// 2. Elemen DOM
const productGrid = document.getElementById('productGrid');
const catalogLoading = document.getElementById('catalogLoading');
const catalogError = document.getElementById('catalogError');
const catalogErrorMsg = document.getElementById('catalogErrorMessage');
const catalogEmpty = document.getElementById('catalogEmpty');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const btnLoadMore = document.getElementById('btnLoadMore');
const loadMoreSection = document.getElementById('loadMoreSection');
const loadMoreInfo = document.getElementById('loadMoreInfo');

/**
 * ==========================================================================
 * 3. TEKNIK DEBOUNCE (Memanfaatkan Konsep CLOSURE)
 * ==========================================================================
 * Penjelasan untuk Demo:
 * Fungsi di dalam mengingat variabel 'timer' dari lingkup luarnya (Closure).
 * Setiap ada ketikan baru sebelum jeda selesai, timer lama dibatalkan dan
 * direset kembali, sehingga browser tidak melakukan re-render berlebihan.
 */
function debounce(callback, delay = 300) {
  let timer; // Variabel privat yang disimpan oleh closure

  return function (...args) {
    clearTimeout(timer); // Batalkan timer sebelumnya
    timer = setTimeout(() => {
      callback.apply(this, args); // Jalankan fungsi setelah user berhenti mengetik
    }, delay);
  };
}

/**
 * ==========================================================================
 * 4. FETCH DATA DARI API & GLOBAL ERROR HANDLING
 * ==========================================================================
 */
async function fetchProducts() {
  // Tampilkan loading spinner & sembunyikan pesan error
  showLoading(true);
  hideError();

  try {
    const response = await fetch(PRODUCTS_API_URL);

    // Cek status HTTP respon
    if (!response.ok) {
      throw new Error(`Gagal memuat produk dari server (Status: ${response.status})`);
    }

    const data = await response.json();
    allProducts = data.products || [];

    // Isi pilihan kategori ke elemen <select> secara dinamis
    setupCategoryOptions(allProducts);

    // Terapkan filter & render awal
    applyFilterAndSort();

  } catch (error) {
    console.error('Terjadi kesalahan saat fetch produk:', error);
    // Tampilkan pesan error visual kepada pengguna
    showError(error.message || 'Koneksi ke server bermasalah.');
  } finally {
    // Sembunyikan loading spinner setelah selesai
    showLoading(false);
  }
}

/**
 * Mengisi dropdown kategori <select> secara dinamis
 */
function setupCategoryOptions(products) {
  if (!categoryFilter) return;

  // Ambil daftar kategori unik menggunakan Set
  const categories = [...new Set(products.map((p) => p.category))].sort();

  // Reset opsi kategori dengan opsi awal
  categoryFilter.innerHTML = '<option value="all">Semua Kategori</option>';

  categories.forEach((cat) => {
    const option = document.createElement('option');
    option.value = cat;
    // Format huruf awal kapital (misal: "beauty" -> "Beauty")
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });
}

/**
 * ==========================================================================
 * 5. FILTER & SORTING (FUNCTIONAL PROGRAMMING)
 * ==========================================================================
 * Penjelasan untuk Demo:
 * Menggunakan metode array murni (.filter() dan .sort()) tanpa memodifikasi
 * array asli 'allProducts'. Menghasilkan array baru yang bersih.
 */
function applyFilterAndSort() {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
  const selectedSort = sortFilter ? sortFilter.value : 'default';

  // 1. FILTER: Pencarian teks & Kategori
  let result = allProducts.filter((product) => {
    // Cocokkan judul, kategori, atau brand dengan kata kunci pencarian
    const matchesQuery =
      product.title.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      (product.brand && product.brand.toLowerCase().includes(query));

    // Cocokkan kategori dropdown
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  // 2. SORTING: Pengurutan harga atau rating
  result = [...result].sort((a, b) => {
    if (selectedSort === 'price-asc') return a.price - b.price;       // Termurah
    if (selectedSort === 'price-desc') return b.price - a.price;      // Termahal
    if (selectedSort === 'rating-desc') return b.rating - a.rating;   // Rating tertinggi
    if (selectedSort === 'rating-asc') return a.rating - b.rating;    // Rating terendah
    return a.id - b.id; // Urutan rekomendasi / default ID
  });

  filteredProducts = result;
  currentLimit = 12; // Reset batas pagination saat filter/search berubah
  renderProducts();
}

/**
 * ==========================================================================
 * 6. RENDER KARTU PRODUK KE DOM DENGAN TEKNIK ARRAY SLICING (Load More)
 * ==========================================================================
 * Penjelasan untuk Demo:
 * Menggunakan .slice(0, currentLimit) untuk mengambil porsi data yang ingin
 * ditampilkan ke layar, sehingga performa halaman tetap ringan dan cepat.
 */
function renderProducts() {
  if (!productGrid) return;

  // Bersihkan kartu sebelumnya
  productGrid.innerHTML = '';

  // Jika tidak ada produk yang cocok
  if (filteredProducts.length === 0) {
    if (catalogEmpty) catalogEmpty.classList.remove('hidden');
    if (loadMoreSection) loadMoreSection.classList.add('hidden');
    return;
  }

  if (catalogEmpty) catalogEmpty.classList.add('hidden');

  // Potong data sesuai limit pagination saat ini (Array Slicing)
  const itemsToShow = filteredProducts.slice(0, currentLimit);

  // Buat HTML kartu produk ala ShopeeLite
  itemsToShow.forEach((product) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id; // Digunakan oleh Event Delegation Anggota 3

    // Badge diskon Shopee (jika ada diskon)
    const discountBadge = product.discountPercentage
      ? `<span class="shopee-discount-tag">-${Math.round(product.discountPercentage)}%</span>`
      : '';

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
          <span class="currency-symbol">$</span>
          <span class="price-number">${product.price.toFixed(2)}</span>
        </div>
        <div class="card-meta">
          <span class="card-rating">⭐ ${product.rating.toFixed(1)}</span>
          <span class="card-brand">${escapeHtml(product.brand || 'Original')}</span>
        </div>
        <div class="card-footer">
          <button type="button" class="btn btn-shopee-outline btn-add-cart" data-action="add-cart" data-id="${product.id}">
            + Keranjang
          </button>
        </div>
      </div>
    `;

    productGrid.appendChild(card);
  });

  // Atur tampilan tombol "Load More"
  updateLoadMoreState();
}

/**
 * ==========================================================================
 * 7. LOGIKA TOMBOL LOAD MORE
 * ==========================================================================
 */
function handleLoadMore() {
  currentLimit += ITEMS_PER_PAGE; // Tambah batas slice
  renderProducts();
}

function updateLoadMoreState() {
  if (!loadMoreSection) return;

  const total = filteredProducts.length;
  const showing = Math.min(currentLimit, total);

  if (loadMoreInfo) {
    loadMoreInfo.textContent = `Menampilkan ${showing} dari ${total} produk`;
  }

  // Sembunyikan tombol jika seluruh produk sudah ditampilkan
  if (currentLimit >= total) {
    btnLoadMore.classList.add('hidden');
  } else {
    btnLoadMore.classList.remove('hidden');
    loadMoreSection.classList.remove('hidden');
  }
}

/**
 * ==========================================================================
 * 8. FUNGSI PEMBANTU (HELPERS)
 * ==========================================================================
 */
function showLoading(isLoading) {
  if (catalogLoading) {
    if (isLoading) catalogLoading.classList.remove('hidden');
    else catalogLoading.classList.add('hidden');
  }
}

function showError(message) {
  if (catalogError && catalogErrorMsg) {
    catalogErrorMsg.textContent = message;
    catalogError.classList.remove('hidden');
  }
}

function hideError() {
  if (catalogError) {
    catalogError.classList.add('hidden');
  }
}

// Mencegah XSS sederhana pada data dari API
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * ==========================================================================
 * 9. EVENT LISTENERS
 * ==========================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
  // Hanya jalankan jika berada di halaman yang memiliki productGrid
  if (!document.getElementById('productGrid')) return;

  // 1. Pencarian Real-Time menggunakan DEBOUNCE (Closure)
  if (searchInput) {
    const onSearchDebounced = debounce(() => {
      applyFilterAndSort();
    }, 300);

    searchInput.addEventListener('input', onSearchDebounced);
  }

  // 2. Dropdown Filter Kategori
  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      applyFilterAndSort();
    });
  }

  // 3. Dropdown Sorting Produk
  if (sortFilter) {
    sortFilter.addEventListener('change', () => {
      applyFilterAndSort();
    });
  }

  // 4. Tombol Load More
  if (btnLoadMore) {
    btnLoadMore.addEventListener('click', handleLoadMore);
  }

  // Panggil fetch awal data produk
  fetchProducts();
});

// Menyediakan akses produk untuk komponen modal detail (Anggota 3)
window.getAllProducts = () => allProducts;
