
const CART_STORAGE_KEY = 'cart';
const FALLBACK_KURS_USD_KE_IDR = 16000;

function formatHargaRupiah(priceInUSD) {
  if (typeof window.formatRupiah === 'function') {
    return window.formatRupiah(priceInUSD);
  }
  return Math.round(priceInUSD * FALLBACK_KURS_USD_KE_IDR).toLocaleString('id-ID');
}

/* ==========================================================================
   CRUD DASAR LOCALSTORAGE
   ========================================================================== */

function getCart() {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Gagal membaca data keranjang:', error);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartBadge();
}

// CREATE — tambah produk ke keranjang (dipanggil dari catalog card & modal)
function addToCart(productId) {
  const products =
    typeof window.getAllProducts === 'function' ? window.getAllProducts() : [];
  const product = products.find((p) => p.id === productId);

  if (!product) {
    console.error('Produk tidak ditemukan untuk id:', productId);
    return;
  }

  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      thumbnail: product.thumbnail,
      price: product.price,
      category: product.category,
      brand: product.brand,
      stock: product.stock,
      description: product.description,
      rating: product.rating,
      qty: 1,
    });
  }

  saveCart(cart);
  renderCartPage();
  showToast(`"${product.title}" ditambahkan ke keranjang`);
}

// UPDATE — ubah quantity (+1 / -1), hapus otomatis kalau qty jadi 0
function updateQty(productId, delta) {
  let cart = getCart();
  const item = cart.find((i) => i.id === productId);
  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== productId);
  }

  saveCart(cart);
  renderCartPage();
}

// DELETE — hapus item dari keranjang
function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  renderCartPage();
}

/* ==========================================================================
   UPDATE BADGE JUMLAH BARANG DI NAVBAR (berjalan di semua halaman)
   ========================================================================== */
function updateCartBadge() {
  const badge = document.getElementById('navbarCartBadge');
  if (!badge) return;

  const cart = getCart();
  let totalQty = 0;
  for (let i = 0; i < cart.length; i++) {
    totalQty += cart[i].qty;
  }
  badge.textContent = totalQty;
}

/* ==========================================================================
   RENDER HALAMAN CART.HTML (hanya jalan kalau elemen cart ada di DOM)
   ========================================================================== */
function renderCartPage() {
  const listContainer = document.getElementById('cartItemsList');
  if (!listContainer) return; // bukan halaman cart.html, skip

  const emptyState = document.getElementById('cartEmptyState');
  const layout = document.getElementById('cartLayout');
  const cart = getCart();

  if (cart.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (layout) layout.classList.add('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  if (layout) layout.classList.remove('hidden');

  listContainer.innerHTML = '';

  let subtotal = 0;
  let totalItems = 0;

  cart.forEach((item) => {
    const itemSubtotal = item.price * item.qty;
    subtotal += itemSubtotal;
    totalItems += item.qty;

    const row = document.createElement('div');
    row.className = 'cart-item-row';
    row.innerHTML = `
      <img
        class="cart-item-thumb"
        src="${item.thumbnail}"
        alt="${escapeHtmlCart(item.title)}"
        data-action="open-detail"
        data-id="${item.id}"
      />
      <div class="cart-item-info">
        <div class="cart-item-name" data-action="open-detail" data-id="${item.id}" title="${escapeHtmlCart(item.title)}">
          ${escapeHtmlCart(item.title)}
        </div>
        <div class="cart-item-rating">
          <svg class="icon-star-svg" viewBox="0 0 24 24" fill="#ffb800">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span>${item.rating ? item.rating.toFixed(1) : '-'}</span>
        </div>
        <div class="cart-item-price">Rp ${formatHargaRupiah(item.price)}</div>
      </div>
      <div class="cart-qty-control">
        <button type="button" class="cart-qty-btn" data-action="qty-minus" data-id="${item.id}">-</button>
        <span class="cart-qty-value">${item.qty}</span>
        <button type="button" class="cart-qty-btn" data-action="qty-plus" data-id="${item.id}">+</button>
      </div>
      <div class="cart-item-subtotal">Rp ${formatHargaRupiah(itemSubtotal)}</div>
      <button type="button" class="cart-remove-btn" data-action="remove-item" data-id="${item.id}">Hapus</button>
    `;
    listContainer.appendChild(row);
  });

  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');
  const totalItemsEl = document.getElementById('cartTotalItems');

  if (subtotalEl) subtotalEl.textContent = `Rp ${formatHargaRupiah(subtotal)}`;
  if (totalEl) totalEl.textContent = `Rp ${formatHargaRupiah(subtotal)}`;
  if (totalItemsEl) totalItemsEl.textContent = totalItems;
}

function escapeHtmlCart(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ==========================================================================
   TOAST NOTIFIKASI SEDERHANA
   ========================================================================== */
function showToast(message) {
  const existing = document.getElementById('cartToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'cartToast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #26aa99;
    color: #ffffff;
    padding: 12px 20px;
    border-radius: 4px;
    font-size: 0.88rem;
    font-family: inherit;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 500;
    opacity: 0;
    transition: opacity 0.2s ease;
  `;

  document.body.appendChild(toast);

  // Trigger fade-in
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);

  // Fade-out
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 200);
  }, 2000);
}


function handleCartAreaClick(event) {
  const target = event.target.closest('[data-action]');
  if (!target) return;

  const action = target.dataset.action;
  const id = parseInt(target.dataset.id, 10);

  if (action === 'add-cart') {
    addToCart(id);
  } else if (action === 'qty-plus') {
    updateQty(id, 1);
  } else if (action === 'qty-minus') {
    updateQty(id, -1);
  } else if (action === 'remove-item') {
    removeFromCart(id);
  }
  // 'open-detail' ditangani oleh modal.js lewat parent yang sama
}

const productGridEl = document.getElementById('productGrid');
if (productGridEl) {
  productGridEl.addEventListener('click', handleCartAreaClick);
}

const cartItemsListEl = document.getElementById('cartItemsList');
if (cartItemsListEl) {
  cartItemsListEl.addEventListener('click', handleCartAreaClick);
}

/* ==========================================================================
   TOMBOL CHECKOUT — placeholder, belum ada alur pembayaran
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const btnCheckout = document.getElementById('btnCheckout');
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      const cart = getCart();
      if (cart.length === 0) return;

      alert('Checkout berhasil (simulasi). Keranjang akan dikosongkan.');
      saveCart([]);
      renderCartPage();
    });
  }

  updateCartBadge();
  renderCartPage();
});

// Ekspor untuk dipakai modal.js
window.addToCart = addToCart;
window.getCart = getCart;