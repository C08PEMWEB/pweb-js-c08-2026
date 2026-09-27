/**
 * ==========================================================================
 * MODAL DETAIL PRODUK (modal.js)
 * TANGGUNG JAWAB: ANGGOTA 3
 * ==========================================================================
 * Fitur:
 * 1. Event Delegation pada elemen kontainer parent (#productGrid).
 * 2. Menampilkan popup modal dengan detail lengkap produk (stok, brand, deskripsi).
 * 3. Tambah produk ke keranjang dari dalam modal.
 * ==========================================================================
 */

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

let activeProduct = null;

// Fungsi helper mencari produk dari array global Anggota 2
function getProductById(id) {
  if (typeof window.getAllProducts === 'function') {
    return window.getAllProducts().find((p) => p.id === id);
  }
  return null;
}

// Buka Modal & Render Data Detail
function showProductModal(productId) {
  const product = getProductById(productId);
  if (!product || !modalOverlay) return;

  activeProduct = product;

  if (modalImg) {
    modalImg.src = product.thumbnail || (product.images && product.images[0]) || '';
    modalImg.alt = product.title;
  }
  if (modalTitle) modalTitle.textContent = product.title;
  if (modalBrand) modalBrand.textContent = `Brand: ${product.brand || 'No Brand'}`;
  if (modalCategory) modalCategory.textContent = product.category;
  if (modalPrice) modalPrice.textContent = product.price.toFixed(2);

  if (modalStock) {
    const isLow = product.stock < 10;
    const stockClass = isLow ? 'stock-warn' : 'stock-good';
    modalStock.innerHTML = `Stok tersedia: <span class="${stockClass}">${product.stock} unit</span>`;
  }

  if (modalDesc) {
    modalDesc.textContent = product.description || 'Tidak ada deskripsi.';
  }

  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Tutup Modal
function hideProductModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
  activeProduct = null;
}

/**
 * TEKNIK EVENT DELEGATION PADA PARENT (#productGrid)
 * Menangani klik tombol "+ Keranjang" dan klik kartu produk dalam satu listener.
 */
function initModalEventDelegation() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  grid.addEventListener('click', (event) => {
    // 1. Jika tombol "+ Keranjang" diklik
    const addBtn = event.target.closest('[data-action="add-cart"]');
    if (addBtn) {
      event.stopPropagation();
      const id = Number(addBtn.dataset.id);
      const prod = getProductById(id);
      if (prod && window.cartSystem) {
        window.cartSystem.addToCart(prod);
      }
      return;
    }

    // 2. Jika area kartu atau judul produk diklik -> Buka Modal Detail
    const card = event.target.closest('.product-card');
    if (card) {
      const id = Number(card.dataset.id);
      showProductModal(id);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initModalEventDelegation();

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', hideProductModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) hideProductModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
      hideProductModal();
    }
  });

  if (modalAddToCartBtn) {
    modalAddToCartBtn.addEventListener('click', () => {
      if (activeProduct && window.cartSystem) {
        window.cartSystem.addToCart(activeProduct);
        hideProductModal();
      }
    });
  }
});
