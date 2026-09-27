// Konfigurasi API, kurs Rupiah, dan state penampung data produk
const PRODUCTS_API_URL = 'https://dummyjson.com/products?limit=100';
const KURS_USD_KE_IDR = 16000;

let allProducts = [];
let filteredProducts = [];
let currentLimit = 12;
const ITEMS_PER_PAGE = 8;

// Mengambil elemen-elemen DOM yang dibutuhkan di halaman katalog
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

// Format konversi harga dari USD ke format Rupiah Indonesia
function formatRupiah(priceInUSD) {
  const rupiah = Math.round(priceInUSD * KURS_USD_KE_IDR);
  return rupiah.toLocaleString('id-ID');
}

// Teknik Debounce (Closure) untuk menunda pencarian saat mengetik agar tidak re-render berlebihan
function debounce(callback, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback.apply(this, args);
    }, delay);
  };
}

// Mengambil data produk dari API dengan async/await dan visual error handling
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

    setupCategoryOptions(allProducts);
    applyFilterAndSort();
  } catch (error) {
    console.error('Terjadi kesalahan saat fetch produk:', error);
    showCatalogError(error.message || 'Koneksi ke server bermasalah.');
  } finally {
    showCatalogLoading(false);
  }
}

// Mengisi dropdown kategori secara dinamis dari kategori unik produk yang ada
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

// Filter pencarian teks & kategori, serta sorting produk (Functional Programming)
function applyFilterAndSort() {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
  const selectedSort = sortFilter ? sortFilter.value : 'default';

  // Saring produk berdasarkan kecocokan teks dan kategori yang dipilih
  let result = allProducts.filter((product) => {
    const matchesQuery =
      product.title.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      (product.brand && product.brand.toLowerCase().includes(query));

    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  // Urutkan produk berdasarkan harga atau rating yang dipilih
  result = [...result].sort((a, b) => {
    if (selectedSort === 'price-asc') return a.price - b.price;
    if (selectedSort === 'price-desc') return b.price - a.price;
    if (selectedSort === 'rating-desc') return b.rating - a.rating;
    if (selectedSort === 'rating-asc') return a.rating - b.rating;
    return a.id - b.id;
  });

  filteredProducts = result;
  currentLimit = 12; // Reset batas pagination saat filter berubah
  renderProducts();
}

// Render kartu produk ke dalam grid DOM menggunakan teknik Array Slicing untuk pagination
function renderProducts() {
  if (!productGrid) return;

  productGrid.innerHTML = '';

  // Tampilkan empty state jika tidak ada produk yang cocok
  if (filteredProducts.length === 0) {
    if (catalogEmpty) catalogEmpty.classList.remove('hidden');
    if (loadMoreSection) loadMoreSection.classList.add('hidden');
    return;
  }

  if (catalogEmpty) catalogEmpty.classList.add('hidden');

  // Ambil hanya sejumlah produk sesuai batas pagination saat ini (Array Slicing)
  const itemsToShow = filteredProducts.slice(0, currentLimit);

  // Buat dan susun elemen kartu produk
  itemsToShow.forEach((product) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id; // Untuk Event Delegation di modal.js & cart.js

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

// Menambah jumlah produk yang tampil saat tombol Load More diklik
function handleLoadMore() {
  currentLimit += ITEMS_PER_PAGE;
  renderProducts();
}

// Memperbarui visibilitas tombol Load More dan informasi total produk
function updateLoadMoreState() {
  if (!loadMoreSection) return;

  const total = filteredProducts.length;
  const showing = Math.min(currentLimit, total);

  if (loadMoreInfo) {
    loadMoreInfo.textContent = `Menampilkan ${showing} dari ${total} produk`;
  }

  // Sembunyikan tombol Load More jika seluruh produk sudah ditampilkan
  if (currentLimit >= total) {
    btnLoadMore.classList.add('hidden');
  } else {
    btnLoadMore.classList.remove('hidden');
    loadMoreSection.classList.remove('hidden');
  }
}

// Helper untuk menampilkan atau menyembunyikan status loading
function showCatalogLoading(isLoading) {
  if (catalogLoading) {
    if (isLoading) catalogLoading.classList.remove('hidden');
    else catalogLoading.classList.add('hidden');
  }
}

// Helper untuk menampilkan pesan error visual jika fetch gagal
function showCatalogError(message) {
  if (catalogError && catalogErrorMsg) {
    catalogErrorMsg.textContent = message;
    catalogError.classList.remove('hidden');
  }
}

// Helper untuk menyembunyikan kotak error visual
function hideCatalogError() {
  if (catalogError) {
    catalogError.classList.add('hidden');
  }
}

// Sanitasi string untuk mencegah celah keamanan XSS pada rendering HTML
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Inisialisasi event listeners setelah seluruh struktur DOM selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('productGrid')) return;

  // Event pencarian real-time dengan debounce
  if (searchInput) {
    const onSearchDebounced = debounce(() => {
      applyFilterAndSort();
    }, 300);

    searchInput.addEventListener('input', onSearchDebounced);
  }

  // Event klik tombol search di header
  if (btnSearch) {
    btnSearch.addEventListener('click', () => {
      applyFilterAndSort();
    });
  }

  // Event klik kata kunci populer di bawah search bar
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

  // Toggle menu dropdown avatar pengguna
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

  // Event perubahan filter kategori
  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      applyFilterAndSort();
    });
  }

  // Event perubahan urutan sorting produk
  if (sortFilter) {
    sortFilter.addEventListener('change', () => {
      applyFilterAndSort();
    });
  }

  // Event klik tombol Load More
  if (btnLoadMore) {
    btnLoadMore.addEventListener('click', handleLoadMore);
  }

  // Mengambil data awal produk dari API
  fetchProducts();
});

// Ekspor fungsi agar dapat diakses oleh file script lain (modal.js & cart.js)
window.getAllProducts = () => allProducts;
window.formatRupiah = formatRupiah;
