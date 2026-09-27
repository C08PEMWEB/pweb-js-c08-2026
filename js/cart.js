/**
 * ==========================================================================
 * SISTEM KERANJANG BELANJA (cart.js)
 * TANGGUNG JAWAB: ANGGOTA 3
 * ==========================================================================
 * Fitur:
 * 1. CRUD Local Storage untuk keranjang (setItem, getItem, removeItem).
 * 2. Tambah produk ke keranjang dari kartu katalog & modal detail.
 * 3. Update badge jumlah keranjang di navbar.
 * 4. Hitung total harga belanja dinamis.
 * 5. Render daftar belanjaan di cart.html dan fitur hapus item.
 * ==========================================================================
 */

const CART_KEY = 'shopeeLite_cart';

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  if (cart.length === 0) {
    localStorage.removeItem(CART_KEY);
  } else {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
  updateNavbarCartBadge();
}

function addToCart(product, qty = 1) {
  if (!product) return;

  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      brand: product.brand || 'Original',
      quantity: qty
    });
  }

  saveCart(cart);
  showToast(`"${product.title}" berhasil masuk ke keranjang!`);
}

function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter((item) => item.id !== id);
  saveCart(cart);
  if (document.getElementById('cartPageList')) {
    renderCartPage();
  }
}

function updateQuantity(id, delta) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(id);
      return;
    }
    saveCart(cart);
    if (document.getElementById('cartPageList')) {
      renderCartPage();
    }
  }
}

function updateNavbarCartBadge() {
  const badge = document.getElementById('navbarCartBadge');
  if (!badge) return;

  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = count;
}

function renderCartPage() {
  const listElem = document.getElementById('cartPageList');
  const emptyElem = document.getElementById('cartEmpty');
  const summaryElem = document.getElementById('cartSummary');
  const totalItemsElem = document.getElementById('totalItemsCount');
  const totalPriceElem = document.getElementById('totalPriceAmount');

  if (!listElem) return;

  const cart = getCart();

  if (cart.length === 0) {
    listElem.innerHTML = '';
    if (emptyElem) emptyElem.classList.remove('hidden');
    if (summaryElem) summaryElem.classList.add('hidden');
    return;
  }

  if (emptyElem) emptyElem.classList.add('hidden');
  if (summaryElem) summaryElem.classList.remove('hidden');

  let html = `
    <table class="cart-table">
      <thead>
        <tr>
          <th>Produk</th>
          <th>Harga Satuan</th>
          <th>Jumlah</th>
          <th>Total</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
  `;

  cart.forEach((item) => {
    const subtotal = (item.price * item.quantity).toFixed(2);
    html += `
      <tr>
        <td>
          <div class="cart-item-flex">
            <img class="cart-thumb-img" src="${item.thumbnail}" alt="${item.title}" />
            <div>
              <div class="cart-title">${item.title}</div>
              <small style="color: var(--shopee-muted);">${item.brand}</small>
            </div>
          </div>
        </td>
        <td style="color: var(--shopee-price); font-weight: 600;">$${item.price.toFixed(2)}</td>
        <td>
          <div class="qty-control">
            <button type="button" class="btn-qty" onclick="cartSystem.updateQuantity(${item.id}, -1)">-</button>
            <span>${item.quantity}</span>
            <button type="button" class="btn-qty" onclick="cartSystem.updateQuantity(${item.id}, 1)">+</button>
          </div>
        </td>
        <td style="color: var(--shopee-price); font-weight: 700;">$${subtotal}</td>
        <td>
          <button type="button" class="btn-delete-cart" onclick="cartSystem.removeFromCart(${item.id})">
            Hapus
          </button>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  listElem.innerHTML = html;

  const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  if (totalItemsElem) totalItemsElem.textContent = totalQty;
  if (totalPriceElem) totalPriceElem.textContent = `$${totalPrice.toFixed(2)}`;
}

function showToast(msg) {
  let toast = document.getElementById('shopeeToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'shopeeToast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background-color: #222222;
      color: #ffffff;
      padding: 10px 18px;
      border-radius: 4px;
      font-size: 0.88rem;
      z-index: 1100;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: opacity 0.25s ease, transform 0.25s ease;
      opacity: 0;
      transform: translateY(12px);
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
  }, 2200);
}

document.addEventListener('DOMContentLoaded', () => {
  updateNavbarCartBadge();
  if (document.getElementById('cartPageContainer')) {
    renderCartPage();

    const checkoutBtn = document.getElementById('btnCheckout');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        alert('Pesanan berhasil dibuat! Keranjang telah dikosongkan.');
        localStorage.removeItem(CART_KEY);
        renderCartPage();
        updateNavbarCartBadge();
      });
    }
  }
});

window.cartSystem = {
  addToCart,
  removeFromCart,
  updateQuantity,
  getCart,
  updateNavbarCartBadge
};
