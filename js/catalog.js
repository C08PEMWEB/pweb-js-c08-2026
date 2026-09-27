// 1. URL API, Kurs Rupiah & Variabel State Sederhana
const PRODUCTS_API_URL = 'https://dummyjson.com/products?limit=100';
const KURS_USD_KE_IDR = 16000; // Kurs konversi: Rp 16.000 / USD

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
const btnSearch = document.getElementById('btnSearch');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const btnLoadMore = document.getElementById('btnLoadMore');
const loadMoreSection = document.getElementById('loadMoreSection');
const loadMoreInfo = document.getElementById('loadMoreInfo');
const userAvatarBtn = document.getElementById('userAvatarBtn');
const userMenuWrapper = document.getElementById('userMenuWrapper');

/**
 * Format harga dari USD ke format Rupiah Indonesia (contoh: 160.000)
 */
function formatRupiah(priceInUSD) {
  const rupiah = Math.round(priceInUSD * KURS_USD_KE_IDR);
  return rupiah.toLocaleString('id-ID');
}

/**
 * ==========================================================================
 * 3. TEKNIK DEBOUNCE (Memanfaatkan Konsep CLOSURE)
 * ==========================================================================
 */
function debounce(callback, delay = 300) {
  let timer; // Variabel privat yang disimpan oleh closure

  return function (...args) {
    clearTimeout(timer); // Batalkan timer sebelumnya
    timer = setTimeout(() => {
      callback.apply(this, args); // Jalankan fungsi setelah jeda ketikan
    }, delay);
  };
}

/**
 * ==========================================================================
 * 4. FETCH DATA DARI API & GLOBAL ERROR HANDLING
 * ==========================================================================
 */
async function fetchProducts() {
  showCatalogLoading(true);
  hideCatalogError();

  try {
    const response = await fetch(PRODUCTS_API_URL);

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
    showCatalogError(error.message || 'Koneksi ke server bermasalah.');
  } finally {
    showCatalogLoading(false);
  }
}

/**
 * Mengisi dropdown kategori <select> secara dinamis
 */
function setupCategoryOptions(products) {
  if (!categoryFilter) return;

  const categories = [...new Set(products.map((p) => p.category))].sort();

  categoryFilter.innerHTML = '<option value="all">Semua Kategori</option>';

  categories.forEach((cat) => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });
}

/**
 * ==========================================================================
 * 5. FILTER & SORTING (FUNCTIONAL PROGRAMMING)
 * ==========================================================================
 */
function applyFilterAndSort() {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
  const selectedSort = sortFilter ? sortFilter.value : 'default';

  // 1. FILTER: Pencarian teks & Kategori (Pure Function)
  let result = allProducts.filter((product) => {
    const matchesQuery =
      product.title.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      (product.brand && product.brand.toLowerCase().includes(query));

    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  // 2. SORTING: Pengurutan harga atau rating (Pure Function)
  result = [...result].sort((a, b) => {
    if (selectedSort === 'price-asc') return a.price - b.price;       // Termurah
    if (selectedSort === 'price-desc') return b.price - a.price;      // Termahal
    if (selectedSort === 'rating-desc') return b.rating - a.rating;   // Rating tertinggi
    if (selectedSort === 'rating-asc') return a.rating - b.rating;    // Rating terendah
    return a.id - b.id; // Urutan default (ID)
  });

  filteredProducts = result;
  currentLimit = 12; // Reset batas pagination saat filter/search berubah
  renderProducts();
}

/**
 * ==========================================================================
 * 6. RENDER KARTU PRODUK KE DOM DENGAN ARRAY SLICING
 * ==========================================================================
 */
function renderProducts() {
  if (!productGrid) return;

  productGrid.innerHTML = '';

  if (filteredProducts.length === 0) {
    if (catalogEmpty) catalogEmpty.classList.remove('hidden');
    if (loadMoreSection) loadMoreSection.classList.add('hidden');
    return;
  }

  if (catalogEmpty) catalogEmpty.classList.add('hidden');

  // Potong data sesuai limit pagination saat ini (Array Slicing)
  const itemsToShow = filteredProducts.slice(0, currentLimit);

  itemsToShow.forEach((product) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id; // Digunakan oleh Event Delegation Anggota 3

    // Badge diskon Shopee
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

    productGrid.appendChild(card);
  });

  updateLoadMoreState();
}

/**
 * ==========================================================================
 * 7. LOGIKA TOMBOL LOAD MORE
 * ==========================================================================
 */
function handleLoadMore() {
  currentLimit += ITEMS_PER_PAGE;
  renderProducts();
}

function updateLoadMoreState() {
  if (!loadMoreSection) return;

  const total = filteredProducts.length;
  const showing = Math.min(currentLimit, total);

  if (loadMoreInfo) {
    loadMoreInfo.textContent = `Menampilkan ${showing} dari ${total} produk`;
  }

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
function showCatalogLoading(isLoading) {
  if (catalogLoading) {
    if (isLoading) catalogLoading.classList.remove('hidden');
    else catalogLoading.classList.add('hidden');
  }
}

function showCatalogError(message) {
  if (catalogError && catalogErrorMsg) {
    catalogErrorMsg.textContent = message;
    catalogError.classList.remove('hidden');
  }
}

function hideCatalogError() {
  if (catalogError) {
    catalogError.classList.add('hidden');
  }
}

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
 * 9. INISIALISASI EVENT LISTENERS
 * ==========================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('productGrid')) return;

  // 1. Pencarian Real-Time menggunakan DEBOUNCE (Closure)
  if (searchInput) {
    const onSearchDebounced = debounce(() => {
      applyFilterAndSort();
    }, 300);

    searchInput.addEventListener('input', onSearchDebounced);
  }

  // 2. Tombol Search di Header
  if (btnSearch) {
    btnSearch.addEventListener('click', () => {
      applyFilterAndSort();
    });
  }

  // 3. Kata Kunci Populer di Bawah Search Bar (Interactive Tags)
  const keywordTags = document.querySelectorAll('.keyword-tag');
  keywordTags.forEach((tag) => {
    tag.addEventListener('click', () => {
      const keyword = tag.dataset.keyword || tag.textContent.trim();
      if (searchInput) {
        searchInput.value = keyword;
      }
      applyFilterAndSort();
    });
  });

  // 4. Dropdown Menu Avatar Pengguna (Toggle on Click & Outside Click)
  if (userAvatarBtn && userMenuWrapper) {
    userAvatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenuWrapper.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!userMenuWrapper.contains(e.target)) {
        userMenuWrapper.classList.remove('active');
      }
    });
  }

  // 5. Dropdown Filter Kategori
  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      applyFilterAndSort();
    });
  }

  // 6. Dropdown Sorting Produk
  if (sortFilter) {
    sortFilter.addEventListener('change', () => {
      applyFilterAndSort();
    });
  }

  // 7. Tombol Load More
  if (btnLoadMore) {
    btnLoadMore.addEventListener('click', handleLoadMore);
  }

  // Fetch data awal produk
  fetchProducts();
});

// Ekspor utilitas untuk modul lain (Anggota 3)
window.getAllProducts = () => allProducts;
window.formatRupiah = formatRupiah;
