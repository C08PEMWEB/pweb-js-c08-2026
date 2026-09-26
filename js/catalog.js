/**
 * ==========================================================================
 * PRODUCT CATALOG & DATA MANIPULATION (catalog.js)
 * Penanggung Jawab: ANGGOTA 2
 * ==========================================================================
 * Tugas & Tanggung Jawab:
 * 1. Mengambil data dari Products API (https://dummyjson.com/products) menggunakan fetch().
 * 2. Visual Global Error Handling jika fetch produk gagal.
 * 3. Render dinamis kartu produk (thumbnail, nama, harga, rating, diskon, kategori) ke dalam DOM.
 * 4. Pencarian Real-Time menggunakan teknik Debounce (berbasis Closure).
 * 5. Filter & Sorting (Functional Programming):
 *    - Filter kategori melalui elemen dropdown <select>.
 *    - Sorting harga (termahal/termurah) atau rating menggunakan manipulasi array murni.
 * 6. Tombol Load More / Pagination menggunakan teknik pemotongan data (array slicing).
 * ==========================================================================
 */

const PRODUCTS_API_URL = 'https://dummyjson.com/products?limit=100';

// State global katalog
let allProducts = [];        // Menyimpan semua produk dari API
let filteredProducts = [];   // Menyimpan produk setelah filter, search, & sort
let currentLimit = 12;       // Jumlah item yang sedang ditampilkan saat ini
const ITEMS_PER_PAGE = 8;    // Tambahan item setiap klik "Load More"

// DOM Elements
const productGrid = document.getElementById('productGrid');
const catalogLoading = document.getElementById('catalogLoading');
const catalogError = document.getElementById('catalogError');
const catalogErrorMsg = document.getElementById('catalogErrorMessage');
const catalogEmpty = document.getElementById('catalogEmpty');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const loadMoreBtn = document.getElementById('btnLoadMore');
const loadMoreContainer = document.getElementById('loadMoreContainer');

/**
 * 1. TEKNIK DEBOUNCE (Memanfaatkan Konsep Closure)
 * Mencegah pemanggilan fungsi berulang-ulang pada setiap ketikan tombol keyboard.
 */
function createDebounce(callback, delay = 350) {
  let timerId = null; // Private variable dipertahankan oleh closure

  return function (...args) {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
}

/**
 * 2. MENGAMBIL DATA PRODUK DARI API
 */
async function fetchProducts() {
  showLoading(true);
  hideError();

  try {
    const response = await fetch(PRODUCTS_API_URL);

    if (!response.ok) {
      throw new Error(`Gagal memuat katalog produk (HTTP ${response.status})`);
    }

    const data = await response.json();
    allProducts = data.products || [];

    // Populasi opsi kategori di dropdown <select>
    populateCategories(allProducts);

    // Terapkan manipulasi data awal (filter/search/sort) & render
    applyFiltersAndSort();
  } catch (error) {
    console.error('Error saat fetch katalog:', error);
    showError('Katalog gagal dimuat: ' + error.message);
  } finally {
    showLoading(false);
  }
}

/**
 * Mengisi dropdown Kategori secara dinamis berdasarkan data produk yang diterima
 */
function populateCategories(products) {
  if (!categoryFilter) return;

  // Mengambil daftar kategori unik (Functional Programming: map & Set)
  const categories = [...new Set(products.map((p) => p.category))].sort();

  // Reset dropdown dengan opsi default
  categoryFilter.innerHTML = '<option value="all">Semua Kategori</option>';

  categories.forEach((cat) => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });
}

/**
 * 3. FILTER & SORTING (Functional Programming)
 * Menggunakan pure array methods: .filter(), .sort() tanpa mengubah array asli.
 */
function applyFiltersAndSort() {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
  const selectedSort = sortFilter ? sortFilter.value : 'default';

  // Step 1: Filter berdasarkan pencarian nama atau kategori
  let result = allProducts.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      (product.brand && product.brand.toLowerCase().includes(query));

    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Step 2: Sorting (Manipulasi array terurut)
  result = [...result].sort((a, b) => {
    switch (selectedSort) {
      case 'price-asc':
        return a.price - b.price; // Termurah ke termahal
      case 'price-desc':
        return b.price - a.price; // Termahal ke termurah
      case 'rating-desc':
        return b.rating - a.rating; // Rating tertinggi
      case 'rating-asc':
        return a.rating - b.rating; // Rating terendah
      default:
        return a.id - b.id; // Urutan default (ID)
    }
  });

  filteredProducts = result;
  currentLimit = 12; // Reset pagination setiap kali filter/search berubah
  renderProducts();
}

/**
 * 4. RENDER DINAMIS KARTU PRODUK KE DOM DENGAN TEKNIK ARRAY SLICING (Load More)
 */
function renderProducts() {
  if (!productGrid) return;

  productGrid.innerHTML = '';

  if (filteredProducts.length === 0) {
    if (catalogEmpty) catalogEmpty.classList.remove('hidden');
    if (loadMoreContainer) loadMoreContainer.classList.add('hidden');
    return;
  }

  if (catalogEmpty) catalogEmpty.classList.add('hidden');

  // Teknik pemotongan data (Array Slicing) untuk Pagination / Load More
  const visibleProducts = filteredProducts.slice(0, currentLimit);

  visibleProducts.forEach((product) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id; // Untuk keperluan Event Delegation (Anggota 3)

    // Format harga & diskon
    const discountTag = product.discountPercentage
      ? `<span class="discount-badge">-${Math.round(product.discountPercentage)}%</span>`
      : '';

    card.innerHTML = `
      <div class="card-img-wrapper" data-action="open-detail" data-id="${product.id}">
        <img class="card-img" src="${product.thumbnail}" alt="${escapeHtml(product.title)}" loading="lazy" />
        ${discountTag}
      </div>
      <div class="card-body">
        <span class="category-tag">${escapeHtml(product.category)}</span>
        <h3 class="card-title" data-action="open-detail" data-id="${product.id}" title="${escapeHtml(product.title)}">
          ${escapeHtml(product.title)}
        </h3>
        <div class="card-price-row">
          <span class="card-price">$${product.price.toFixed(2)}</span>
        </div>
        <div class="card-rating">
          ★ ${product.rating.toFixed(1)} / 5.0
        </div>
        <div class="card-actions">
          <button type="button" class="btn btn-primary btn-add-cart" data-action="add-cart" data-id="${product.id}">
            + Keranjang
          </button>
        </div>
      </div>
    `;

    productGrid.appendChild(card);
  });

  // Tampilkan/sembunyikan tombol Load More berdasarkan sisa data
  if (loadMoreContainer) {
    if (currentLimit < filteredProducts.length) {
      loadMoreContainer.classList.remove('hidden');
    } else {
      loadMoreContainer.classList.add('hidden');
    }
  }
}

/**
 * 5. PAGINATION / LOAD MORE HANDLER
 */
function handleLoadMore() {
  currentLimit += ITEMS_PER_PAGE;
  renderProducts();
}

/**
 * Visual Feedback Helpers (Loading & Global Error)
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

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Inisialisasi Event Listener
 */
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('productGrid')) return;

  // 1. Debounced Search Event Listener
  if (searchInput) {
    const handleDebouncedSearch = createDebounce(() => {
      applyFiltersAndSort();
    }, 350);

    searchInput.addEventListener('input', handleDebouncedSearch);
  }

  // 2. Filter Kategori Dropdown Event Listener
  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      applyFiltersAndSort();
    });
  }

  // 3. Sorting Dropdown Event Listener
  if (sortFilter) {
    sortFilter.addEventListener('change', () => {
      applyFiltersAndSort();
    });
  }

  // 4. Tombol Load More
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', handleLoadMore);
  }

  // Muat data produk dari API
  fetchProducts();
});

// Ekspor produk global untuk diakses komponen modal (Anggota 3)
window.getAllProducts = () => allProducts;
