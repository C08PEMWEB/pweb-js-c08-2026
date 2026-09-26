/**
 * ==========================================================================
 * PRODUCT DETAIL MODAL (modal.js)
 * Penanggung Jawab: ANGGOTA 3
 * ==========================================================================
 * Tugas & Tanggung Jawab:
 * 1. Merancang komponen UI Modal/Popup detail produk (gambar, brand, stok, deskripsi lengkap, tombol close).
 * 2. Implementasi Modal Detail Produk menggunakan teknik EVENT DELEGATION pada elemen parent (#productGrid).
 * 3. Menangani tombol "Tambah ke Keranjang" baik pada kartu katalog maupun pada modal detail produk.
 * ==========================================================================
 */

// DOM Elements untuk Modal
const modalOverlay = document.getElementById('productDetailModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalBrand = document.getElementById('modalBrand');
const modalCategory = document.getElementById('modalCategory');
const modalPrice = document.getElementById('modalPrice');
const modalStock = document.getElementById('modalStock');
const modalDesc = document.getElementById('modalDesc');
const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');

let currentActiveProduct = null;

/**
 * Mencari data produk berdasarkan ID dari global products state
 */
function findProductById(id) {
  if (typeof window.getAllProducts === 'function') {
    const products = window.getAllProducts();
    return products.find((p) => p.id === id);
  }
  return null;
}

/**
 * Membuka Modal Detail Produk dan mengisi informasinya
 */
function openProductDetailModal(productId) {
  const product = findProductById(productId);
  if (!product || !modalOverlay) return;

  currentActiveProduct = product;

  // Render detail data ke dalam modal DOM
  if (modalImg) {
    modalImg.src = product.thumbnail || (product.images && product.images[0]) || '';
    modalImg.alt = product.title;
  }
  if (modalTitle) modalTitle.textContent = product.title;
  if (modalBrand) modalBrand.textContent = `Brand: ${product.brand || 'No Brand'}`;
  if (modalCategory) modalCategory.textContent = product.category;
  if (modalPrice) modalPrice.textContent = `$${product.price.toFixed(2)}`;

  if (modalStock) {
    const stockClass = product.stock < 10 ? 'stock-low' : 'stock-in';
    modalStock.innerHTML = `Stok tersedia: <span class="${stockClass}">${product.stock} unit</span>`;
  }

  if (modalDesc) {
    modalDesc.textContent = product.description || 'Tidak ada deskripsi.';
  }

  // Tampilkan modal
  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // Mencegah scrolling latar belakang
}

/**
 * Menutup Modal Detail Produk
 */
function closeProductDetailModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
  currentActiveProduct = null;
}

/**
 * EVENT DELEGATION PADA ELEMEN PARENT (#productGrid)
 * Menangani event klik kartu produk maupun tombol tambah keranjang dalam satu listener parent.
 */
function setupEventDelegation() {
  const productGrid = document.getElementById('productGrid');
  if (!productGrid) return;

  productGrid.addEventListener('click', (event) => {
    // 1. Delegasi: Cek apakah yang diklik adalah tombol "+ Keranjang"
    const addCartBtn = event.target.closest('[data-action="add-cart"]');
    if (addCartBtn) {
      event.stopPropagation(); // Cegah membuka modal jika tombol keranjang diklik
      const productId = Number(addCartBtn.dataset.id);
      const product = findProductById(productId);
      if (product && window.cartSystem) {
        window.cartSystem.addToCart(product);
      }
      return;
    }

    // 2. Delegasi: Cek apakah yang diklik adalah elemen kartu produk (untuk buka modal)
    const card = event.target.closest('.product-card');
    if (card) {
      const productId = Number(card.dataset.id);
      openProductDetailModal(productId);
    }
  });
}

/**
 * Inisialisasi event listener modal
 */
document.addEventListener('DOMContentLoaded', () => {
  // Pasang Event Delegation pada kontainer grid
  setupEventDelegation();

  // Tombol close modal (X)
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeProductDetailModal);
  }

  // Klik di luar dialog modal (area backdrop overlay) untuk menutup
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeProductDetailModal();
      }
    });
  }

  // Tutup dengan tombol keyboard ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
      closeProductDetailModal();
    }
  });

  // Tombol "+ Keranjang" di dalam Modal Detail Produk
  if (modalAddToCartBtn) {
    modalAddToCartBtn.addEventListener('click', () => {
      if (currentActiveProduct && window.cartSystem) {
        window.cartSystem.addToCart(currentActiveProduct);
        closeProductDetailModal();
      }
    });
  }
});
