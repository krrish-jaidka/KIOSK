// ========================================
// The Digital Grill — App Controller
// ========================================

// ── State ──
let cart = [];
let currentCategory = 'All';
let searchQuery = '';
let orderType = 'dine-in';
let customerInfo = { name: '', phone: '' };
let lastOrderNumber = null;

// ── Router ──
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
  });
  const target = document.getElementById('page-' + page);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  window.location.hash = page;

  // Re-render dynamic pages
  if (page === 'menu') renderMenu();
  if (page === 'cart') renderCart();
  if (page === 'checkout') renderCheckout();
  if (page === 'confirmation') renderConfirmation();

  updateCartBadge();
}

// Listen for hash changes
window.addEventListener('hashchange', () => {
  const page = window.location.hash.slice(1) || 'home';
  navigateTo(page);
});

// ── Image Overrides (guaranteed-local fallback) ──
// These override whatever Supabase returns for items with broken CDN images.
const IMAGE_OVERRIDES = {
  'b2':  'images/b2.png',
  'bv1': 'images/bv1.png',
  'd1':  'images/d1.png',
  'd3':  'images/d3.png',
  'p4':  'images/p4.png',
  'c1':  'images/c1.png',
  'c3':  'images/c3.png',
  'c4':  'images/c4.png',
};

window.addEventListener('DOMContentLoaded', async () => {
  // Initialize Supabase and try loading menu from DB
  const supabaseReady = initSupabase();
  if (supabaseReady) {
    const dbMenu = await fetchMenuFromSupabase();
    if (dbMenu && dbMenu.length > 0) {
      // Replace local MENU_DATA with Supabase data
      MENU_DATA.length = 0;
      dbMenu.forEach(item => {
        MENU_DATA.push({
          ...item,
          // Apply local image override if one exists for this item
          image: IMAGE_OVERRIDES[item.id] || item.image,
          price: parseFloat(item.price),
          rating: parseFloat(item.rating),
          tags: item.tags || [],
          customizations: item.customizations || []
        });
      });
      console.log('✅ Menu loaded from Supabase');
    } else {
      console.log('ℹ️ Using local menu data (run supabase_schema.sql to seed DB)');
    }
  } else {
    // Also apply overrides to local data
    MENU_DATA.forEach(item => {
      if (IMAGE_OVERRIDES[item.id]) item.image = IMAGE_OVERRIDES[item.id];
    });
  }

  const page = window.location.hash.slice(1) || 'home';
  navigateTo(page);
});

// ── Toast Notification ──
function showToast(message, icon = 'check_circle') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10">
      <span class="material-symbols-outlined text-green-400">${icon}</span>
      <span class="font-medium">${message}</span>
    </div>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 2200);
}

// ── Cart Badge ──
function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const total = cart.reduce((s, i) => s + i.quantity, 0);
  badges.forEach(b => {
    b.textContent = total;
    b.style.display = total > 0 ? 'flex' : 'none';
    b.classList.remove('badge-pulse');
    void b.offsetWidth; // force reflow
    b.classList.add('badge-pulse');
  });

  // Floating cart bar visibility
  const bar = document.getElementById('floating-cart-bar');
  if (bar) {
    const activePage = window.location.hash.slice(1) || 'home';
    if (total > 0 && activePage === 'menu') {
      bar.classList.remove('hidden');
    } else {
      bar.classList.add('hidden');
    }
  }

  // Update floating bar totals
  const barCount = document.getElementById('bar-cart-count');
  const barTotal = document.getElementById('bar-cart-total');
  const barTax = document.getElementById('bar-cart-tax');
  if (barCount) barCount.textContent = total;
  if (barTotal) barTotal.textContent = '₹' + getSubtotal().toFixed(2);
  if (barTax) barTax.textContent = '+ ₹' + getTax().toFixed(2) + ' GST';
}

// ── Cart Helpers ──
let currentPromo = null;
const VALID_PROMOS = {
  'WELCOME10': 0.10, // 10% off
  'FESTIVE20': 0.20, // 20% off
  'FLAT50': 50 // Flat 50 off
};

function applyPromoCode() {
  const input = document.getElementById('promo-code-input');
  const msg = document.getElementById('promo-message');
  if (!input || !msg) return;

  const code = input.value.trim().toUpperCase();
  if (!code) {
    currentPromo = null;
    msg.textContent = 'Please enter a code';
    msg.className = 'text-xs font-bold mt-2 text-red-500 block';
    renderCart();
    return;
  }

  if (VALID_PROMOS[code]) {
    currentPromo = { code, value: VALID_PROMOS[code] };
    msg.textContent = `Promo code '${code}' applied successfully!`;
    msg.className = 'text-xs font-bold mt-2 text-green-600 block';
    input.value = '';
    renderCart();
    showToast(`Promo '${code}' applied!`);
  } else {
    currentPromo = null;
    msg.textContent = 'Invalid promo code';
    msg.className = 'text-xs font-bold mt-2 text-red-500 block';
    renderCart();
  }
}

function getDiscount() {
  if (!currentPromo) return 0;
  const subtotal = getSubtotal();
  if (currentPromo.value < 1) { // Percentage discount
    return subtotal * currentPromo.value;
  }
  // Flat discount
  return Math.min(subtotal, currentPromo.value);
}

function getSubtotal() {
  return cart.reduce((sum, item) => {
    const customExtra = (item.selectedCustomizations || [])
      .reduce((s, c) => s + c.price, 0);
    return sum + (item.price + customExtra) * item.quantity;
  }, 0);
}
function getTax() { return (getSubtotal() - getDiscount()) * TAX_RATE; }
function getTotal() { return Math.max(0, getSubtotal() - getDiscount() + getTax() + SERVICE_FEE); }

function addToCart(itemId, customizations = []) {
  const menuItem = MENU_DATA.find(m => m.id === itemId);
  if (!menuItem) return;

  // Check if same item with same customizations exists
  const custKey = customizations.map(c => c.name).sort().join(',');
  const existing = cart.find(c => {
    const ck = (c.selectedCustomizations || []).map(x => x.name).sort().join(',');
    return c.id === itemId && ck === custKey;
  });

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      ...menuItem,
      quantity: 1,
      selectedCustomizations: customizations,
      cartId: Date.now() + Math.random()
    });
  }

  updateCartBadge();
  showToast(`${menuItem.name} added to cart`);
}

function removeFromCart(cartId) {
  cart = cart.filter(c => c.cartId !== cartId);
  updateCartBadge();
  renderCart();
}

function updateQuantity(cartId, delta) {
  const item = cart.find(c => c.cartId === cartId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(cartId);
    return;
  }
  updateCartBadge();
  renderCart();
}

function clearCart() {
  cart = [];
  updateCartBadge();
  renderCart();
  showToast('Cart cleared', 'delete_sweep');
}

// ── Customization Modal ──
function openCustomizeModal(itemId) {
  const item = MENU_DATA.find(m => m.id === itemId);
  if (!item) return;

  const modal = document.getElementById('customize-modal');
  const content = document.getElementById('customize-content');

  content.innerHTML = `
    <div class="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl modal-content">
      <!-- Image -->
      <div class="relative h-48 overflow-hidden">
        <img src="${item.image}" alt="${item.name}" class="absolute inset-0 w-full h-full object-cover"
          onerror="this.onerror=null;this.style.display='none';this.parentElement.style.background='linear-gradient(135deg,#1e293b,#334155)';" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <button onclick="closeCustomizeModal()" class="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-white transition-colors">
          <span class="material-symbols-outlined text-lg">close</span>
        </button>
        <div class="absolute bottom-3 left-4">
          <h3 class="text-white font-bold text-xl">${item.name}</h3>
          <p class="text-white/80 text-sm">${item.description}</p>
        </div>
      </div>
      <!-- Customizations -->
      <div class="p-6">
        <h4 class="font-bold text-lg mb-4 flex items-center gap-2">
          <span class="material-symbols-outlined text-primary">tune</span>
          Customize Your Order
        </h4>
        <div class="space-y-3" id="customization-options">
          ${item.customizations.map((c, i) => `
            <label class="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-primary/5 transition-colors cursor-pointer border border-transparent hover:border-primary/20">
              <div class="flex items-center gap-3">
                <input type="checkbox" value="${i}" class="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary cust-check" />
                <span class="font-medium text-slate-700">${c.name}</span>
              </div>
              <span class="text-sm font-semibold ${c.price > 0 ? 'text-primary' : 'text-green-600'}">${c.price > 0 ? '+₹' + c.price.toFixed(2) : 'Free'}</span>
            </label>
          `).join('')}
        </div>
        <!-- Price & Add Button -->
        <div class="mt-6 flex items-center justify-between">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Base Price</p>
            <p class="text-2xl font-black text-primary">₹${item.price.toFixed(2)}</p>
          </div>
          <button onclick="addWithCustomizations('${item.id}')" class="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-transform">
            <span class="material-symbols-outlined">add_shopping_cart</span>
            Add to Order
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
}

function closeCustomizeModal() {
  document.getElementById('customize-modal').classList.remove('open');
}

function addWithCustomizations(itemId) {
  const item = MENU_DATA.find(m => m.id === itemId);
  if (!item) return;

  const checks = document.querySelectorAll('#customization-options .cust-check:checked');
  const selected = Array.from(checks).map(ch => item.customizations[parseInt(ch.value)]);

  addToCart(itemId, selected);
  closeCustomizeModal();
}

// ── Menu Rendering ──
function renderMenu() {
  const container = document.getElementById('menu-items-grid');
  const catContainer = document.getElementById('category-nav');
  const title = document.getElementById('menu-category-title');
  const subtitle = document.getElementById('menu-category-subtitle');
  if (!container) return;

  // Render categories
  if (catContainer) {
    catContainer.innerHTML = CATEGORIES.map(cat => `
      <a href="#" onclick="event.preventDefault(); setCategory('${cat.name}')"
         class="cat-link flex items-center gap-3 px-3 py-3 rounded-xl ${currentCategory === cat.name ? 'active' : 'text-slate-600 hover:bg-primary/10 hover:text-primary'} transition-colors">
        <span class="material-symbols-outlined">${cat.icon}</span>
        <span class="hidden md:block font-medium">${cat.name}</span>
      </a>
    `).join('');
  }

  // Filter items
  let items = MENU_DATA;
  if (currentCategory !== 'All') {
    items = items.filter(i => i.category === currentCategory);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    items = items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  // Update header
  if (title) title.textContent = currentCategory === 'All' ? 'All Items' : currentCategory;
  const subtitles = {
    'All': 'Browse our complete menu',
    'Burgers': 'Freshly made, high-quality ingredients',
    'Pizza': 'Stone-baked to perfection',
    'Beverages': 'Cold drinks & fresh blends',
    'Desserts': 'Sweet treats to finish your meal',
    'Combo Meals': 'Great value meal combos'
  };
  if (subtitle) subtitle.textContent = subtitles[currentCategory] || '';

  if (items.length === 0) {
    container.innerHTML = `
      <div class="col-span-full flex flex-col items-center py-16 text-slate-400">
        <span class="material-symbols-outlined text-6xl mb-4">search_off</span>
        <p class="text-xl font-bold">No items found</p>
        <p class="text-sm mt-1">Try a different search or category</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => {
    const tagHTML = item.tags.map(t => {
      const cls = t === 'Vegetarian' ? 'tag-vegetarian' : t === 'Spicy' ? 'tag-spicy' : 'tag-best-value';
      return `<div class="absolute top-3 left-3 ${cls} text-[10px] font-bold px-2 py-0.5 rounded uppercase">${t}</div>`;
    }).join('');

    const inCart = cart.find(c => c.id === item.id);
    const qtyInCart = inCart ? inCart.quantity : 0;

    return `
      <div class="menu-card group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
        <div class="relative overflow-hidden aspect-[4/3] cursor-pointer" onclick="openCustomizeModal('${item.id}')">
          <img
            src="${item.image}"
            alt="${item.name}"
            class="absolute inset-0 w-full h-full object-cover card-img transition-transform duration-300 group-hover:scale-105"
            onerror="this.onerror=null;this.src='';this.style.display='none';this.parentElement.style.background='linear-gradient(135deg,#f1f5f9,#e2e8f0)';this.parentElement.insertAdjacentHTML('afterbegin','<span class=\'material-symbols-outlined\' style=\'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:48px;color:#94a3b8;\'>restaurant</span>');" />
          ${tagHTML}
          <div class="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
            <span class="material-symbols-outlined text-yellow-500 text-sm" style="font-variation-settings: 'FILL' 1">star</span>
            <span class="text-xs font-bold">${item.rating}</span>
          </div>
        </div>
        <div class="p-4 flex flex-col flex-1">
          <div class="flex justify-between items-start mb-1">
            <h3 class="text-lg font-bold text-slate-900 leading-tight">${item.name}</h3>
            <span class="text-primary font-bold text-lg ml-2 whitespace-nowrap">₹${item.price.toFixed(2)}</span>
          </div>
          <p class="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">${item.description}</p>
          <div class="flex gap-2">
            <button onclick="openCustomizeModal('${item.id}')" class="flex-1 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors btn-ripple active:scale-95">
              <span class="material-symbols-outlined">add_shopping_cart</span>
              Add to Order
            </button>
            ${qtyInCart > 0 ? `<div class="flex items-center justify-center bg-primary/10 text-primary font-bold px-3 rounded-lg text-sm">${qtyInCart} in cart</div>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function setCategory(cat) {
  currentCategory = cat;
  renderMenu();
}

function handleSearch(value) {
  searchQuery = value;
  renderMenu();
}

// ── Cart / Order Summary Rendering ──
function renderCart() {
  const container = document.getElementById('cart-items-list');
  const summary = document.getElementById('cart-summary');
  const emptyState = document.getElementById('cart-empty');
  const cartContent = document.getElementById('cart-content');
  if (!container) return;

  if (cart.length === 0) {
    if (emptyState) emptyState.style.display = 'flex';
    if (cartContent) cartContent.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (cartContent) cartContent.style.display = 'flex';

  container.innerHTML = cart.map(item => {
    const customExtra = (item.selectedCustomizations || []).reduce((s, c) => s + c.price, 0);
    const itemTotal = (item.price + customExtra) * item.quantity;
    const custText = item.selectedCustomizations?.length
      ? item.selectedCustomizations.map(c => c.name).join(', ')
      : '';

    return `
      <div class="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-primary/5 transition-all hover:shadow-md">
        <div class="relative rounded-lg w-20 h-20 shrink-0 overflow-hidden bg-slate-100">
          <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover"
            onerror="this.onerror=null;this.style.display='none';this.parentElement.innerHTML='<span class=\'material-symbols-outlined\' style=\'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:32px;color:#94a3b8;\'>restaurant</span>';" />
        </div>
        <div class="flex flex-1 flex-col justify-center min-w-0">
          <div class="flex justify-between items-start">
            <p class="text-lg font-bold leading-tight truncate">${item.name}</p>
            <button onclick="removeFromCart(${item.cartId})" class="text-slate-400 hover:text-primary transition-colors ml-2 shrink-0">
              <span class="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          ${custText ? `<p class="text-xs text-slate-400 mt-0.5 truncate">${custText}</p>` : ''}
          <p class="text-primary font-semibold mt-1">₹${item.price.toFixed(2)}${customExtra > 0 ? ` <span class="text-xs text-slate-400">+ ₹${customExtra.toFixed(2)}</span>` : ''}</p>
          <div class="flex items-center justify-between mt-3">
            <div class="flex items-center gap-3 bg-slate-50 p-1 rounded-full border border-primary/10">
              <button onclick="updateQuantity(${item.cartId}, -1)" class="qty-btn flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                <span class="material-symbols-outlined text-lg">remove</span>
              </button>
              <span class="text-sm font-bold w-6 text-center">${item.quantity}</span>
              <button onclick="updateQuantity(${item.cartId}, 1)" class="qty-btn flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                <span class="material-symbols-outlined text-lg">add</span>
              </button>
            </div>
            <p class="text-sm font-medium text-slate-500">₹${itemTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Update summary
  if (summary) {
    const sub = getSubtotal();
    const discount = getDiscount();
    const tax = getTax();
    const total = getTotal();
    const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

    let summaryHtml = `
      <div class="flex justify-between text-slate-600">
        <span>Subtotal</span>
        <span id="summary-subtotal" class="font-medium">₹${sub.toFixed(2)}</span>
      </div>`;
      
    if (discount > 0) {
      summaryHtml += `
      <div class="flex justify-between text-green-600 font-medium">
        <span>Discount (${currentPromo.code})</span>
        <span>-₹${discount.toFixed(2)}</span>
      </div>`;
    }

    summaryHtml += `
      <div class="flex justify-between text-slate-600">
        <span>GST (5%)</span>
        <span id="summary-tax" class="font-medium">₹${tax.toFixed(2)}</span>
      </div>
      <div class="flex justify-between text-slate-600">
        <span>Service Fee</span>
        <span id="summary-fee" class="font-medium">₹${SERVICE_FEE.toFixed(2)}</span>
      </div>
      <div class="pt-4 mt-2 border-t border-dashed border-slate-200 flex justify-between items-center">
        <span class="text-lg font-bold">Total Amount</span>
        <span id="summary-total" class="text-2xl font-black text-primary">₹${total.toFixed(2)}</span>
      </div>
    `;
    
    // Replace the space-y-3 div content
    const spaceYDiv = summary.querySelector('.space-y-3');
    if (spaceYDiv) spaceYDiv.innerHTML = summaryHtml;

    document.getElementById('cart-header-count').textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''} in cart`;
  }
}

// ── Checkout Rendering ──
function renderCheckout() {
  const billItems = document.getElementById('checkout-bill-items');
  const checkoutSub = document.getElementById('checkout-subtotal');
  const checkoutTax = document.getElementById('checkout-tax');
  const checkoutTotal = document.getElementById('checkout-total');
  const checkoutTotalMobile = document.getElementById('checkout-total-mobile');
  if (!billItems) return;

  billItems.innerHTML = cart.map(item => {
    const customExtra = (item.selectedCustomizations || []).reduce((s, c) => s + c.price, 0);
    const lineTotal = (item.price + customExtra) * item.quantity;
    return `
      <div class="flex justify-between text-slate-600">
        <span>${item.name} × ${item.quantity}</span>
        <span>₹${lineTotal.toFixed(2)}</span>
      </div>
    `;
  }).join('');

  if (checkoutSub) checkoutSub.textContent = `₹${getSubtotal().toFixed(2)}`;
  if (checkoutTax) checkoutTax.textContent = `₹${getTax().toFixed(2)}`;
  if (checkoutTotal) checkoutTotal.textContent = `₹${getTotal().toFixed(2)}`;
  if (checkoutTotalMobile) checkoutTotalMobile.textContent = `₹${getTotal().toFixed(2)}`;
}

function selectOrderType(type) {
  orderType = type;
  document.querySelectorAll('.order-type-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.type === type);
  });
}

function validateAndConfirm() {
  const nameInput = document.getElementById('customer-name');
  const phoneInput = document.getElementById('customer-phone');

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();

  // Validation
  if (!name) {
    nameInput.focus();
    nameInput.classList.add('!border-red-400', '!ring-red-400');
    showToast('Please enter your name', 'error');
    setTimeout(() => nameInput.classList.remove('!border-red-400', '!ring-red-400'), 2000);
    return;
  }
  if (!phone || phone.length !== 10) {
    phoneInput.focus();
    phoneInput.classList.add('!border-red-400', '!ring-red-400');
    showToast('Please enter a valid 10-digit phone number', 'error');
    setTimeout(() => phoneInput.classList.remove('!border-red-400', '!ring-red-400'), 2000);
    return;
  }

  if (cart.length === 0) {
    showToast('Your cart is empty!', 'shopping_cart');
    return;
  }

  customerInfo = { name, phone };

  // Show payment simulation
  showPaymentSimulation();
}

let selectedPaymentMethod = 'cash';

function showPaymentSimulation() {
  const modal = document.getElementById('customize-modal');
  const content = document.getElementById('customize-content');

  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: 'payments', desc: 'Pay with cash at pickup' },
    { id: 'upi', name: 'UPI', icon: 'qr_code_2', desc: 'GPay, PhonePe, Paytm...' },
    { id: 'card', name: 'Debit / Credit Card', icon: 'credit_card', desc: 'Visa, Mastercard, RuPay' },
    { id: 'loyalty', name: 'Loyalty Points', icon: 'loyalty', desc: 'Redeem your reward points' },
    { id: 'counter', name: 'Pay at Counter', icon: 'storefront', desc: 'Pay when you collect your order' }
  ];

  content.innerHTML = `
    <div class="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-2xl modal-content">
      <div class="p-6 pb-2">
        <div class="flex items-center justify-between mb-1">
          <h3 class="text-xl font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">account_balance_wallet</span>
            Choose Payment Method
          </h3>
          <button onclick="closeCustomizeModal()" class="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
            <span class="material-symbols-outlined text-lg text-slate-500">close</span>
          </button>
        </div>
        <p class="text-slate-500 text-sm mb-4">Total: <span class="font-bold text-primary">₹${getTotal().toFixed(2)}</span></p>
      </div>
      <div class="px-6 pb-6 space-y-2" id="payment-methods-list">
        ${paymentMethods.map(m => `
          <div class="flex flex-col gap-2">
            <button onclick="selectPaymentMethod('${m.id}')" id="pm-${m.id}"
              class="payment-method-btn w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200
                ${m.id === 'cash' ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-100 hover:border-primary/30 hover:bg-primary/5'}">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                ${m.id === 'cash' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}">
                <span class="material-symbols-outlined text-2xl">${m.icon}</span>
              </div>
              <div class="text-left flex-1">
                <p class="font-bold text-slate-900">${m.name}</p>
                <p class="text-xs text-slate-400">${m.desc}</p>
              </div>
              <div class="pm-check shrink-0 ${m.id === 'cash' ? '' : 'opacity-0'}">
                <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1">check_circle</span>
              </div>
            </button>
            ${m.id === 'upi' ? `
              <div id="pm-details-upi" class="hidden overflow-hidden transition-all duration-300 px-1 py-1">
                <input type="text" placeholder="Enter UPI ID (e.g. name@okhdfcbank)" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium">
              </div>
            ` : m.id === 'card' ? `
              <div id="pm-details-card" class="hidden overflow-hidden transition-all duration-300 px-1 py-1 space-y-2">
                <input type="text" placeholder="Card Number" maxlength="19" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium">
                <div class="flex gap-2">
                  <input type="text" placeholder="MM/YY" maxlength="5" class="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium">
                  <input type="password" placeholder="CVV" maxlength="3" class="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium">
                </div>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
      <div class="px-6 pb-6">
        <button onclick="confirmPaymentMethod()"
          class="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/25 hover:translate-y-[-1px] active:translate-y-[0px] transition-all flex items-center justify-center gap-3">
          <span class="material-symbols-outlined">lock</span>
          Proceed to Pay
        </button>
      </div>
    </div>
  `;

  selectedPaymentMethod = 'cash';
  modal.classList.add('open');
}

function selectPaymentMethod(methodId) {
  selectedPaymentMethod = methodId;
  // Update visual state
  document.querySelectorAll('.payment-method-btn').forEach(btn => {
    const id = btn.id.replace('pm-', '');
    const isSelected = id === methodId;
    btn.className = `payment-method-btn w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200
      ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-100 hover:border-primary/30 hover:bg-primary/5'}`;
    // Update icon background
    const iconDiv = btn.querySelector('.w-12');
    if (iconDiv) {
      iconDiv.className = `w-12 h-12 rounded-xl flex items-center justify-center shrink-0
        ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`;
    }
    // Update checkmark
    const check = btn.querySelector('.pm-check');
    if (check) {
      check.style.opacity = isSelected ? '1' : '0';
    }
    
    // Toggle details section
    const detailsDiv = document.getElementById(`pm-details-${id}`);
    if (detailsDiv) {
      if (isSelected) {
        detailsDiv.classList.remove('hidden');
      } else {
        detailsDiv.classList.add('hidden');
      }
    }
  });
}

function confirmPaymentMethod() {
  const modal = document.getElementById('customize-modal');
  const content = document.getElementById('customize-content');

  const methodNames = {
    cash: 'Cash',
    upi: 'UPI',
    card: 'Debit / Credit Card',
    loyalty: 'Loyalty Points',
    counter: 'Pay at Counter'
  };
  const methodIcons = {
    cash: 'payments',
    upi: 'qr_code_2',
    card: 'credit_card',
    loyalty: 'loyalty',
    counter: 'storefront'
  };

  content.innerHTML = `
    <div class="bg-white rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl modal-content">
      <div class="p-8 flex flex-col items-center text-center">
        <div class="relative mb-6">
          <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-primary text-4xl" id="payment-icon">${methodIcons[selectedPaymentMethod]}</span>
          </div>
          <div class="absolute inset-0 rounded-full border-4 border-primary/20 shimmer-bg"></div>
        </div>
        <h3 class="text-xl font-bold mb-2" id="payment-title">Processing Payment...</h3>
        <p class="text-slate-500 text-sm mb-1" id="payment-subtitle">${methodNames[selectedPaymentMethod]}</p>
        <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-4">
          <div class="bg-primary h-full rounded-full progress-fill" id="payment-bar"></div>
        </div>
        <p class="text-2xl font-black text-primary mt-4">₹${getTotal().toFixed(2)}</p>
      </div>
    </div>
  `;

  // Simulate payment processing
  setTimeout(() => {
    document.getElementById('payment-icon').textContent = 'check_circle';
    document.getElementById('payment-title').textContent = 'Payment Successful!';
    document.getElementById('payment-subtitle').textContent = 'Redirecting to confirmation...';

    setTimeout(() => {
      modal.classList.remove('open');
      completeOrder();
    }, 1000);
  }, 2200);
}

async function completeOrder() {
  lastOrderNumber = 1000 + Math.floor(Math.random() * 9000);

  // Save order to Supabase
  const orderData = {
    orderNumber: lastOrderNumber,
    customerName: customerInfo.name,
    customerPhone: customerInfo.phone,
    orderType: orderType,
    paymentMethod: selectedPaymentMethod,
    subtotal: parseFloat(getSubtotal().toFixed(2)),
    tax: parseFloat(getTax().toFixed(2)),
    serviceFee: SERVICE_FEE,
    total: parseFloat(getTotal().toFixed(2)),
    items: cart
  };

  const savedOrder = await saveOrderToSupabase(orderData);
  if (savedOrder) {
    showToast('Order saved to database!', 'cloud_done');
  }

  navigateTo('confirmation');
}

// ── Confirmation Rendering ──
function renderConfirmation() {
  const orderNo = document.getElementById('conf-order-number');
  const confItems = document.getElementById('conf-items-list');
  const confSub = document.getElementById('conf-subtotal');
  const confTax = document.getElementById('conf-tax');
  const confTotal = document.getElementById('conf-total');
  const confName = document.getElementById('conf-customer-name');
  const confType = document.getElementById('conf-order-type');
  if (!orderNo) return;

  orderNo.textContent = `Order #${lastOrderNumber || '0000'}`;
  if (confName) confName.textContent = customerInfo.name || 'Guest';
  if (confType) confType.textContent = orderType === 'dine-in' ? 'Dine-in' : 'Takeaway';

  // Show payment method
  const confPayment = document.getElementById('conf-payment-method');
  if (confPayment) {
    const pmNames = { cash: 'Cash', upi: 'UPI', card: 'Card', loyalty: 'Loyalty Points', counter: 'Pay at Counter' };
    confPayment.textContent = pmNames[selectedPaymentMethod] || 'Cash';
  }

  if (confItems) {
    confItems.innerHTML = cart.map(item => {
      const customExtra = (item.selectedCustomizations || []).reduce((s, c) => s + c.price, 0);
      const lineTotal = (item.price + customExtra) * item.quantity;
      const custText = item.selectedCustomizations?.length
        ? item.selectedCustomizations.map(c => c.name).join(', ')
        : '';

      return `
        <div class="flex justify-between items-start border-b border-slate-100 pb-4">
          <div class="flex gap-4">
            <div class="w-16 h-16 rounded-lg bg-slate-100 shrink-0 overflow-hidden">
              <img alt="${item.name}" class="w-full h-full object-cover rounded-lg" src="${item.image}" />
            </div>
            <div>
              <h3 class="font-bold text-slate-800">${item.name}</h3>
              ${custText ? `<p class="text-xs text-slate-400">${custText}</p>` : ''}
              <p class="text-sm text-slate-400">Qty: ${item.quantity}</p>
            </div>
          </div>
          <span class="font-semibold text-slate-900">₹${lineTotal.toFixed(2)}</span>
        </div>
      `;
    }).join('');
  }

  if (confSub) confSub.textContent = `₹${getSubtotal().toFixed(2)}`;
  if (confTax) confTax.textContent = `₹${getTax().toFixed(2)}`;
  if (confTotal) confTotal.textContent = `₹${getTotal().toFixed(2)}`;
}

function startNewOrder() {
  cart = [];
  customerInfo = { name: '', phone: '' };
  orderType = 'dine-in';
  searchQuery = '';
  currentCategory = 'All';
  lastOrderNumber = null;
  updateCartBadge();
  navigateTo('home');
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('customize-modal');
  if (e.target === modal) {
    closeCustomizeModal();
  }
});

// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCustomizeModal();
});
