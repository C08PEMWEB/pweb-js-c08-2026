/**
 * ==========================================================================
 * SHOPPING CART SYSTEM (cart.js)
 * Penanggung Jawab: ANGGOTA 3
 * ==========================================================================
 * Tugas & Tanggung Jawab:
 * 1. Sistem Keranjang Belanja (CRUD localStorage):
 *    - Tombol "Tambah ke Keranjang" pada kartu produk dan modal detail.
 *    - Menyimpan dan memperbarui data keranjang ke Local Storage (setItem, getItem, removeItem).
 *    - Memperbarui badge jumlah barang di navbar dan menghitung total harga belanjaan secara dinamis.
 *    - Render daftar belanjaan dari localStorage di cart.html beserta fitur hapus item.
 * ==========================================================================
 */

const CART_STORAGE_KEY = 'miniShopee_cart';

/**
 * Mendapatkan daftar item keranjang dari Local Storage
 */
function getCartItems() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Gagal membaca cart dari localStorage:', e);
    return [];
  }
}

/**
 * Menyimpan daftar item keranjang ke Local Storage
 */
function saveCartItems(items) {
  try {
    if (items.length === 0) {
      // Jika kosong, bisa hapus key sesuai spesifikasi localStorage.removeItem
      localStorage.removeItem(CART_STORAGE_KEY);
    } else {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  } catch (e) {
    console.error('Gagal menyimpan cart ke localStorage:', e);
  }
  updateNavbarCartBadge();
}

/**
 * Menambahkan produk ke Keranjang Belanja
 */
function addToCart(product, quantity = 1) {
  if (!product) return;

  const items = getCartItems();
  const existingIndex = items.findIndex((item) => item.id === product.id);

  if (existingIndex > -1) {
    // Tambah jumlah jika barang sudah ada
    items[existingIndex].quantity += quantity;
  } else {
    // Tambah item baru
    items.push({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      brand: product.brand || 'No Brand',
      quantity: quantity
    });
  }

  saveCartItems(items);

  // Tampilkan notifikasi toast/alert singkat
  showToastNotification(`"${product.title}" berhasil ditambahkan ke keranjang!`);
}

/**
 * Menghapus produk dari Keranjang Belanja
 */
function removeFromCart(productId) {
  let items = getCartItems();
  items = items.filter((item) => item.id !== productId);
  saveCartItems(items);

  // Jika berada di cart.html, render ulang tampilannya
  if (document.getElementById('cartPageContainer')) {
    renderCartPage();
  }
}

/**
 * Mengubah jumlah (quantity) item belanja
 */
function updateItemQuantity(productId, delta) {
  const items = getCartItems();
  const target = items.find((item) => item.id === productId);

  if (target) {
    target.quantity += delta;
    if (target.quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    saveCartItems(items);
    if (document.getElementById('cartPageContainer')) {
      renderCartPage();
    }
  }
}

/**
 * Memperbarui badge jumlah keranjang di Navbar secara dinamis
 */
function updateNavbarCartBadge() {
  const badge = document.getElementById('navbarCartBadge');
  if (!badge) return;

  const items = getCartItems();
  const totalCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  badge.textContent = totalCount;
  if (totalCount > 0) {
    badge.classList.remove('hidden');
  } else {
    badge.textContent = '0';
  }
}

/**
 * Menghitung total ringkasan belanja (Total Item & Total Harga)
 */
function calculateCartTotals() {
  const items = getCartItems();
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return { totalQuantity, totalPrice };
}

/**
 * Render Halaman Keranjang Belanja (cart.html)
 */
function renderCartPage() {
  const cartContainer = document.getElementById('cartItemsList');
  const cartSummary = document.getElementById('cartSummarySection');
  const cartEmpty = document.getElementById('cartEmptyState');
  const totalItemsCount = document.getElementById('summaryTotalItems');
  const totalPriceElem = document.getElementById('summaryTotalPrice');

  if (!cartContainer) return; // Tidak di cart.html

  const items = getCartItems();

  if (items.length === 0) {
    cartContainer.innerHTML = '';
    if (cartEmpty) cartEmpty.classList.remove('hidden');
    if (cartSummary) cartSummary.classList.add('hidden');
    return;
  }

  if (cartEmpty) cartEmpty.classList.add('hidden');
  if (cartSummary) cartSummary.classList.remove('hidden');

  let tableHtml = `
    <table class="cart-table">
      <thead>
        <tr>
          <th>Produk</th>
          <th>Harga Satuan</th>
          <th>Jumlah</th>
          <th>Subtotal</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
  `;

  items.forEach((item) => {
    const subtotal = (item.price * item.quantity).toFixed(2);
    tableHtml += `
      <tr class="cart-item-row" data-id="${item.id}">
        <td>
          <div class="cart-item-product">
            <img class="cart-item-thumb" src="${item.thumbnail}" alt="${escapeCartHtml(item.title)}" />
            <div class="cart-item-info">
              <span class="cart-item-name">${escapeCartHtml(item.title)}</span>
              <small class="category-tag">${escapeCartHtml(item.brand)}</small>
            </div>
          </div>
        </td>
        <td class="cart-item-price">$${item.price.toFixed(2)}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button type="button" class="btn btn-secondary btn-qty-minus" data-id="${item.id}" style="padding: 2px 8px;">-</button>
            <span class="cart-item-qty">${item.quantity}</span>
            <button type="button" class="btn btn-secondary btn-qty-plus" data-id="${item.id}" style="padding: 2px 8px;">+</button>
          </div>
        </td>
        <td class="cart-item-price">$${subtotal}</td>
        <td>
          <button type="button" class="btn-remove-item" data-action="remove-item" data-id="${item.id}">
            🗑 Hapus
          </button>
        </td>
      </tr>
    `;
  });

  tableHtml += '</tbody></table>';
  cartContainer.innerHTML = tableHtml;

  // Hitung total harga belanjaan
  const { totalQuantity, totalPrice } = calculateCartTotals();
  if (totalItemsCount) totalItemsCount.textContent = totalQuantity;
  if (totalPriceElem) totalPriceElem.textContent = `$${totalPrice.toFixed(2)}`;

  // Pasang event listener aksi di tabel keranjang (Event Delegation)
  cartContainer.onclick = (e) => {
    const removeBtn = e.target.closest('[data-action="remove-item"]');
    if (removeBtn) {
      const id = Number(removeBtn.dataset.id);
      if (confirm('Hapus produk ini dari keranjang?')) {
        removeFromCart(id);
      }
      return;
    }

    const minusBtn = e.target.closest('.btn-qty-minus');
    if (minusBtn) {
      const id = Number(minusBtn.dataset.id);
      updateItemQuantity(id, -1);
      return;
    }

    const plusBtn = e.target.closest('.btn-qty-plus');
    if (plusBtn) {
      const id = Number(plusBtn.dataset.id);
      updateItemQuantity(id, 1);
      return;
    }
  };
}

/**
 * Toast notification sederhana
 */
function showToastNotification(message) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #2e7d32;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 0.9rem;
      z-index: 2000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      transition: opacity 0.3s ease, transform 0.3s ease;
      opacity: 0;
      transform: translateY(20px);
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
  }, 2500);
}

function escapeCartHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  updateNavbarCartBadge();
  if (document.getElementById('cartPageContainer')) {
    renderCartPage();

    const checkoutBtn = document.getElementById('btnCheckout');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        alert('Terima kasih! Pesanan Anda telah berhasil diproses (Simulasi).');
        localStorage.removeItem(CART_STORAGE_KEY);
        renderCartPage();
        updateNavbarCartBadge();
      });
    }
  }
});

// Ekspor fungsi agar dapat dipanggil dari catalog dan modal
window.cartSystem = {
  addToCart,
  removeFromCart,
  getCartItems,
  updateNavbarCartBadge
};
