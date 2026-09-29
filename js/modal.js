

let currentModalProductId = null;

function getProductDataById(productId) {
  // 1. Coba ambil data lengkap dari catalog.js (hanya tersedia di index.html)
  if (typeof window.getAllProducts === 'function') {
    const products = window.getAllProducts();
    const found = products.find((p) => p.id === productId);
    if (found) return found;
  }

  // 2. Fallback: ambil data dari localStorage
  if (typeof window.getCart === 'function') {
    const cartItem = window.getCart().find((i) => i.id === productId);
    if (cartItem) {
      return {
        id: cartItem.id,
        title: cartItem.title,
        thumbnail: cartItem.thumbnail,
        price: cartItem.price,
        category: cartItem.category || '-',
        brand: cartItem.brand || '-',
        stock: cartItem.stock !== undefined ? cartItem.stock : null,
        description: cartItem.description || '-',
        rating: cartItem.rating,
      };
    }
  }

  return null;
}

function openProductModal(productId) {
  const modal = document.getElementById('productDetailModal');
  const product = getProductDataById(productId);

  if (!modal || !product) {
    console.error('Modal atau data produk tidak ditemukan untuk id:', productId);
    return;
  }

  currentModalProductId = productId;

  const modalImg = document.getElementById('modalImg');
  const modalCategory = document.getElementById('modalCategory');
  const modalTitle = document.getElementById('modalTitle');
  const modalBrand = document.getElementById('modalBrand');
  const modalPrice = document.getElementById('modalPrice');
  const modalStock = document.getElementById('modalStock');
  const modalDesc = document.getElementById('modalDesc');

  if (modalImg) modalImg.src = product.thumbnail || '';
  if (modalCategory) modalCategory.textContent = product.category || '-';
  if (modalTitle) modalTitle.textContent = product.title || '-';
  if (modalBrand) modalBrand.textContent = product.brand || '-';

  const modalRatingValue = document.getElementById('modalRatingValue');
  if (modalRatingValue) {
    modalRatingValue.textContent = product.rating ? product.rating.toFixed(1) : '-';
  }

  const priceInUSD = product.price || 0;
  if (modalPrice) {
    modalPrice.textContent =
      typeof window.formatRupiah === 'function'
        ? window.formatRupiah(priceInUSD)
        : Math.round(priceInUSD * 16000).toLocaleString('id-ID');
  }

  if (modalStock) {
    modalStock.textContent =
      product.stock !== null && product.stock !== undefined
        ? `Stok tersedia: ${product.stock}`
        : 'Stok tersedia: -';
  }

  if (modalDesc) modalDesc.textContent = product.description || '-';

  modal.classList.add('active');
}

function closeProductModal() {
  const modal = document.getElementById('productDetailModal');
  if (modal) modal.classList.remove('active');
  currentModalProductId = null;
}

/* ==========================================================================
   EVENT LISTENERS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('productDetailModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const addToCartBtn = document.getElementById('modalAddToCartBtn');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeProductModal);
  }

  // Tutup modal kalau klik di luar area modal-card
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeProductModal();
    });
  }

  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      if (currentModalProductId !== null && typeof window.addToCart === 'function') {
        window.addToCart(currentModalProductId);
        closeProductModal();
      }
    });
  }
});

/* ====================
   EVENT DELEGATION 
   ===================*/
function handleOpenDetailClick(event) {
  const target = event.target.closest('[data-action="open-detail"]');
  if (!target) return;

  const id = parseInt(target.dataset.id, 10);
  openProductModal(id);
}

const productGridElModal = document.getElementById('productGrid');
if (productGridElModal) {
  productGridElModal.addEventListener('click', handleOpenDetailClick);
}

const cartItemsListElModal = document.getElementById('cartItemsList');
if (cartItemsListElModal) {
  cartItemsListElModal.addEventListener('click', handleOpenDetailClick);
}