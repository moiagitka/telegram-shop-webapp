// Telegram WebApp Integration
const tg = window.Telegram?.WebApp;

// Configuration
const CONFIG = {
  bot_token: "1742846566:AAGXMHYJr3kPi71dCwAYzOzWns24OtxWJgM",
  webhook_url: "https://fe074be00d23.ngrok-free.app",
  admin_chat_id: "221933064",
  payment_provider_token: "YOUR_PAYMENT_TOKEN",
  app_name: "ShopTG",
  currency: "RUB",
  delivery_price: 300,
  free_delivery_from: 5000,
  admin_users: [221933064, 222222222]
};

// Application Data with working images
const appData = {
  categories: [
    { id: 1, name: "Верхняя одежда", icon: "🧥" },
    { id: 2, name: "Кроссовки", icon: "👟" },
    { id: 3, name: "Джинсы", icon: "👖" },
    { id: 4, name: "Аксессуары", icon: "👜" }
  ],
  products: [
    {
      id: 1, name: "Куртка Nike", price: 8500,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop",
      category_id: 1, sizes: ["S", "M", "L", "XL"], in_stock: true,
      description: "Спортивная куртка Nike высокого качества для активного отдыха"
    },
    {
      id: 2, name: "Кроссовки Adidas", price: 12000,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop",
      category_id: 2, sizes: ["40", "41", "42", "43"], in_stock: true,
      description: "Удобные кроссовки Adidas для спорта и повседневной носки"
    },
    {
      id: 3, name: "Джинсы Levi's", price: 6500,
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&h=200&fit=crop",
      category_id: 3, sizes: ["30", "32", "34", "36"], in_stock: false,
      description: "Классические джинсы Levi's прямого кроя"
    },
    {
      id: 4, name: "Рюкзак", price: 3500,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop",
      category_id: 4, sizes: [], in_stock: true,
      description: "Стильный рюкзак для повседневного использования"
    },
    {
      id: 5, name: "Худи Supreme", price: 15000,
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop",
      category_id: 1, sizes: ["S", "M", "L", "XL"], in_stock: true,
      description: "Оригинальное худи Supreme лимитированной серии"
    },
    {
      id: 6, name: "Кроссовки Jordan", price: 18000,
      image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=200&h=200&fit=crop",
      category_id: 2, sizes: ["40", "41", "42", "43"], in_stock: true,
      description: "Легендарные кроссовки Air Jordan"
    }
  ],
  orders: []
};

// Application State
let currentUser = {
  id: null,
  first_name: "",
  username: "",
  balance: 0,
  bonus_points: 0,
  is_admin: true
};

let cart = [];
let favorites = [];
let currentCategory = null;
let currentProduct = null;
let selectedSize = null;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

async function initializeApp() {
  showLoading(true);
  
  try {
    // Initialize Telegram API
    initTelegramAPI();
    
    // Load data
    loadDataFromStorage();
    loadOrders();
    
    // Setup UI
    setupNavigation();
    setupModals();
    setupEventListeners();
    setupFilters();
    
    // Render initial content
    renderHomePage();
    renderCategories();
    updateCartBadge();
    updateUserInfo();
    updateAdminStats();
    
  } catch (error) {
    console.error('App initialization failed:', error);
    showToast('Ошибка инициализации приложения', 'error');
  } finally {
    showLoading(false);
  }
}

// Telegram API Integration
function initTelegramAPI() {
  if (!tg) {
    console.warn('Telegram WebApp API not available');
    initDemoUser();
    return;
  }

  try {
    tg.ready();
    tg.expand();
    setTheme();
    initUser();
    setupMainButton();
    setupHaptics();
    
    tg.BackButton.onClick(() => {
      handleBackButton();
    });

    tg.onEvent('themeChanged', setTheme);
  } catch (error) {
    console.error('Telegram API initialization failed:', error);
    initDemoUser();
  }
}

function initUser() {
  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    const user = tg.initDataUnsafe.user;
    currentUser = {
      id: user.id,
      first_name: user.first_name || '',
      username: user.username || '',
      balance: getStoredBalance(user.id),
      bonus_points: getStoredBonus(user.id),
      is_admin: CONFIG.admin_users.includes(user.id)
    };
  } else {
    initDemoUser();
  }
}

function initDemoUser() {
  currentUser = {
    id: 123456789,
    first_name: "Demo User",
    username: "demo_user",
    balance: 5000,
    bonus_points: 150,
    is_admin: true // For demo purposes
  };
}

function setTheme() {
  if (!tg) return;
  
  const params = tg.themeParams;
  if (params) {
    document.documentElement.style.setProperty('--tg-bg-color', params.bg_color);
    document.documentElement.style.setProperty('--tg-text-color', params.text_color);
    document.documentElement.style.setProperty('--tg-hint-color', params.hint_color);
    document.documentElement.style.setProperty('--tg-link-color', params.link_color);
    document.documentElement.style.setProperty('--tg-button-color', params.button_color);
    document.documentElement.style.setProperty('--tg-button-text-color', params.button_text_color);
  }
}

function setupMainButton() {
  if (!tg) return;
  
  tg.MainButton.setText('Оформить заказ');
  tg.MainButton.color = '#32808D';
  tg.MainButton.textColor = '#FFFFFF';
  tg.MainButton.hide();
  
  tg.MainButton.onClick(() => {
    if (cart.length > 0) {
      showCheckoutModal();
    }
  });
}

function updateMainButton() {
  if (!tg) return;
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  if (totalItems > 0) {
    const total = calculateCartTotal();
    tg.MainButton.setText(`Оформить заказ (${total.toLocaleString()}₽)`);
    tg.MainButton.show();
  } else {
    tg.MainButton.hide();
  }
}

function setupHaptics() {
  if (!tg) return;
  
  document.addEventListener('click', (e) => {
    if (e.target.matches('button, .btn, .product-card, .category-card, .nav-item')) {
      tg.HapticFeedback.impactOccurred('light');
    }
  });
}

function handleBackButton() {
  const currentPage = document.querySelector('.page.active');
  if (currentPage) {
    const pageId = currentPage.id;
    if (pageId === 'catalog' && currentCategory) {
      resetCatalogView();
    } else if (pageId !== 'home') {
      showPage('home');
      setActiveNavItem('home');
    }
  }
}

// Data Management
function loadDataFromStorage() {
  try {
    const savedCart = localStorage.getItem('shopTG_cart');
    const savedFavorites = localStorage.getItem('shopTG_favorites');
    const savedProducts = localStorage.getItem('shopTG_products');
    const savedConfig = localStorage.getItem('shopTG_config');
    
    if (savedCart) cart = JSON.parse(savedCart);
    if (savedFavorites) favorites = JSON.parse(savedFavorites);
    if (savedProducts) appData.products = JSON.parse(savedProducts);
    if (savedConfig) Object.assign(CONFIG, JSON.parse(savedConfig));
    
  } catch (error) {
    console.error('Failed to load data:', error);
  }
}

function saveDataToStorage() {
  try {
    localStorage.setItem('shopTG_cart', JSON.stringify(cart));
    localStorage.setItem('shopTG_favorites', JSON.stringify(favorites));
    localStorage.setItem('shopTG_products', JSON.stringify(appData.products));
    localStorage.setItem('shopTG_config', JSON.stringify(CONFIG));
  } catch (error) {
    console.error('Failed to save data:', error);
  }
}

function loadOrders() {
  const saved = localStorage.getItem('shopTG_orders');
  if (saved) {
    appData.orders = JSON.parse(saved);
  }
}

function saveOrders() {
  localStorage.setItem('shopTG_orders', JSON.stringify(appData.orders));
}

function getStoredBalance(userId) {
  const stored = localStorage.getItem(`balance_${userId}`);
  return stored ? parseInt(stored) : 5000;
}

function getStoredBonus(userId) {
  const stored = localStorage.getItem(`bonus_${userId}`);
  return stored ? parseInt(stored) : 150;
}

function saveBalance(userId, balance) {
  localStorage.setItem(`balance_${userId}`, balance.toString());
}

function saveBonus(userId, bonus) {
  localStorage.setItem(`bonus_${userId}`, bonus.toString());
}

// Navigation - FIXED
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const page = item.dataset.page;
      if (page) {
        showPage(page);
        setActiveNavItem(page);
      }
    });
  });
}

function showPage(pageId) {
  // Hide all pages
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));
  
  // Show target page
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
    
    // Load page content
    switch(pageId) {
      case 'home':
        renderHomePage();
        break;
      case 'catalog':
        resetCatalogView();
        break;
      case 'cart':
        renderCart();
        updateMainButton();
        break;
      case 'orders':
        renderOrders();
        break;
      case 'profile':
        renderProfile();
        break;
      case 'admin':
        if (currentUser.is_admin) {
          renderAdminPanel();
        } else {
          showToast('Доступ запрещен', 'error');
          showPage('home');
          setActiveNavItem('home');
          return;
        }
        break;
    }
    
    // Update back button
    if (tg) {
      if (pageId === 'home') {
        tg.BackButton.hide();
      } else {
        tg.BackButton.show();
      }
    }
  }
}

function setActiveNavItem(pageId) {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(nav => nav.classList.remove('active'));
  
  const activeItem = document.querySelector(`[data-page="${pageId}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }
}

// User Info Update
function updateUserInfo() {
  const userInfoEl = document.getElementById('userInfo');
  const userBalanceEl = document.getElementById('userBalance');
  const profileNameEl = document.getElementById('profileName');
  const profileUsernameEl = document.getElementById('profileUsername');
  const profileBalanceEl = document.getElementById('profileBalance');
  const profileBonusEl = document.getElementById('profileBonus');
  const profileInitialsEl = document.getElementById('profileInitials');

  if (userInfoEl) {
    userInfoEl.textContent = currentUser.first_name ? 
      `Привет, ${currentUser.first_name}!` : 'Добро пожаловать!';
  }
  
  if (userBalanceEl) {
    userBalanceEl.textContent = `Баланс: ${currentUser.balance.toLocaleString()}₽`;
  }
  
  if (profileNameEl) {
    profileNameEl.textContent = currentUser.first_name || 'Пользователь';
  }
  
  if (profileUsernameEl) {
    profileUsernameEl.textContent = currentUser.username ? 
      `@${currentUser.username}` : '#' + currentUser.id;
  }
  
  if (profileBalanceEl) {
    profileBalanceEl.textContent = `${currentUser.balance.toLocaleString()}₽`;
  }
  
  if (profileBonusEl) {
    profileBonusEl.textContent = `${currentUser.bonus_points} баллов`;
  }
  
  if (profileInitialsEl && currentUser.first_name) {
    const initials = currentUser.first_name.substring(0, 2).toUpperCase();
    profileInitialsEl.textContent = initials;
  }

  // Show admin panel if user is admin
  if (currentUser.is_admin) {
    document.getElementById('adminNav').classList.remove('hidden');
  }
}

// Home Page
function renderHomePage() {
  const container = document.getElementById('latestProducts');
  if (!container) return;
  
  const popularProducts = appData.products.filter(p => p.in_stock).slice(0, 6);
  container.innerHTML = popularProducts.map(product => createProductCard(product)).join('');
}

// Catalog
function renderCategories() {
  const container = document.getElementById('categoriesList');
  if (!container) return;
  
  container.innerHTML = appData.categories.map(category => `
    <div class="category-card" onclick="showCategoryProducts(${category.id})">
      <div class="category-icon">${category.icon}</div>
      <div class="category-name">${category.name}</div>
    </div>
  `).join('');
}

function showCategoryProducts(categoryId) {
  currentCategory = categoryId;
  document.getElementById('categoriesList').classList.add('hidden');
  document.getElementById('categoryProducts').classList.remove('hidden');
  document.getElementById('backToCategories').classList.remove('hidden');
  
  renderCategoryProducts(categoryId);
}

function renderCategoryProducts(categoryId) {
  const container = document.getElementById('productsGrid');
  if (!container) return;
  
  const maxPrice = parseInt(document.getElementById('priceFilter').value);
  const inStockOnly = document.getElementById('inStockFilter').checked;
  
  let categoryProducts = appData.products.filter(product => 
    product.category_id === categoryId && product.price <= maxPrice
  );
  
  if (inStockOnly) {
    categoryProducts = categoryProducts.filter(product => product.in_stock);
  }
  
  if (categoryProducts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <p>Товары не найдены</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = categoryProducts.map(product => createProductCard(product)).join('');
}

function resetCatalogView() {
  document.getElementById('categoriesList').classList.remove('hidden');
  document.getElementById('categoryProducts').classList.add('hidden');
  document.getElementById('backToCategories').classList.add('hidden');
  currentCategory = null;
}

function createProductCard(product) {
  const inFavorites = favorites.some(fav => fav.id === product.id);
  const outOfStock = !product.in_stock;
  
  return `
    <div class="product-card ${outOfStock ? 'out-of-stock' : ''}" onclick="showProductModal(${product.id})">
      <img src="${product.image}" alt="${product.name}" class="product-image" 
           onerror="this.src='https://via.placeholder.com/200x200/CCCCCC/FFFFFF?text=No+Image'">
      <div class="product-name">${product.name}</div>
      <div class="product-price">${product.price.toLocaleString()}₽</div>
      <div class="product-actions" onclick="event.stopPropagation()">
        <button class="btn btn--primary btn--sm" onclick="addToCart(${product.id})" ${outOfStock ? 'disabled' : ''}>
          ${outOfStock ? 'Нет в наличии' : 'В корзину'}
        </button>
        <button class="btn-icon ${inFavorites ? 'active' : ''}" onclick="toggleFavorite(${product.id})">
          ❤️
        </button>
      </div>
    </div>
  `;
}

// Product Modal
function showProductModal(productId) {
  const product = appData.products.find(p => p.id === productId);
  if (!product) return;
  
  currentProduct = product;
  selectedSize = null;
  
  const modal = document.getElementById('productModal');
  const content = document.getElementById('productModalContent');
  
  const inFavorites = favorites.some(fav => fav.id === product.id);
  const outOfStock = !product.in_stock;
  
  content.innerHTML = `
    <div class="product-detail">
      <img src="${product.image}" alt="${product.name}" class="product-detail-image"
           onerror="this.src='https://via.placeholder.com/200x200/CCCCCC/FFFFFF?text=No+Image'">
      <h3 class="product-detail-name">${product.name}</h3>
      <div class="product-detail-price">${product.price.toLocaleString()}₽</div>
      <p class="product-detail-description">${product.description}</p>
      
      ${product.sizes.length > 0 ? `
        <div class="product-sizes">
          ${product.sizes.map(size => `
            <button class="size-option" onclick="selectSize('${size}')">${size}</button>
          `).join('')}
        </div>
      ` : ''}
      
      <div class="product-detail-actions">
        <button class="btn btn--primary" onclick="addToCartFromModal()" ${outOfStock ? 'disabled' : ''}>
          ${outOfStock ? 'Нет в наличии' : 'В корзину'}
        </button>
        <button class="btn-icon ${inFavorites ? 'active' : ''}" onclick="toggleFavorite(${product.id})">
          ❤️
        </button>
      </div>
    </div>
  `;
  
  modal.classList.remove('hidden');
}

function selectSize(size) {
  selectedSize = size;
  document.querySelectorAll('.size-option').forEach(btn => {
    btn.classList.remove('selected');
  });
  event.target.classList.add('selected');
}

function addToCartFromModal() {
  if (!currentProduct) return;
  
  if (currentProduct.sizes.length > 0 && !selectedSize) {
    showToast('Выберите размер', 'error');
    return;
  }
  
  addToCart(currentProduct.id, selectedSize);
  closeModal('productModal');
}

// Cart functionality - FIXED
function addToCart(productId, size = null) {
  const product = appData.products.find(p => p.id === productId);
  if (!product || !product.in_stock) {
    showToast('Товар недоступен', 'error');
    return;
  }
  
  // If product has sizes but no size selected, use first available size
  if (product.sizes.length > 0 && !size) {
    size = product.sizes[0];
  }
  
  const existingItem = cart.find(item => 
    item.id === productId && item.size === size
  );
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      quantity: 1,
      size: size,
      ...product
    });
  }
  
  updateCartBadge();
  updateMainButton();
  saveDataToStorage();
  showToast('Товар добавлен в корзину');
}

function removeFromCart(productId, size = null) {
  cart = cart.filter(item => !(item.id === productId && item.size === size));
  updateCartBadge();
  updateMainButton();
  renderCart();
  saveDataToStorage();
  showToast('Товар удален из корзины');
}

function updateCartQuantity(productId, size, newQuantity) {
  const item = cart.find(item => item.id === productId && item.size === size);
  if (!item) return;
  
  if (newQuantity <= 0) {
    removeFromCart(productId, size);
  } else {
    item.quantity = newQuantity;
    updateCartBadge();
    updateMainButton();
    renderCart();
    saveDataToStorage();
  }
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  if (totalItems > 0) {
    badge.textContent = totalItems;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function calculateCartTotal() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCost = subtotal >= CONFIG.free_delivery_from ? 0 : CONFIG.delivery_price;
  return subtotal + deliveryCost;
}

function renderCart() {
  const container = document.getElementById('cartItems');
  const totalElement = document.getElementById('cartTotal');
  const deliveryPriceElement = document.getElementById('deliveryPrice');
  
  if (!container || !totalElement) return;
  
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🛒</div>
        <p>Корзина пуста</p>
        <button class="btn btn--primary" onclick="showPage('catalog'); setActiveNavItem('catalog');">
          Перейти к покупкам
        </button>
      </div>
    `;
    totalElement.textContent = '0₽';
    if (deliveryPriceElement) deliveryPriceElement.textContent = CONFIG.delivery_price + '₽';
    return;
  }
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCost = subtotal >= CONFIG.free_delivery_from ? 0 : CONFIG.delivery_price;
  const total = subtotal + deliveryCost;
  
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-image" 
           onclick="showProductModal(${item.id})"
           onerror="this.src='https://via.placeholder.com/60x60/CCCCCC/FFFFFF?text=No+Image'">
      <div class="cart-item-info">
        <div class="cart-item-name" onclick="showProductModal(${item.id})">${item.name}</div>
        ${item.size ? `<div class="cart-item-size">Размер: ${item.size}</div>` : ''}
        <div class="cart-item-price">${(item.price * item.quantity).toLocaleString()}₽</div>
      </div>
      <div class="cart-item-controls">
        <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, '${item.size || ''}', ${item.quantity - 1})">−</button>
        <span>${item.quantity}</span>
        <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, '${item.size || ''}', ${item.quantity + 1})">+</button>
        <button class="btn btn--outline btn--sm" onclick="removeFromCart(${item.id}, '${item.size || ''}')">✕</button>
      </div>
    </div>
  `).join('');
  
  totalElement.textContent = total.toLocaleString() + '₽';
  if (deliveryPriceElement) {
    deliveryPriceElement.textContent = deliveryCost === 0 ? 'Бесплатно' : deliveryCost + '₽';
  }
}

// Favorites
function toggleFavorite(productId) {
  const product = appData.products.find(p => p.id === productId);
  if (!product) return;
  
  const existingIndex = favorites.findIndex(fav => fav.id === productId);
  
  if (existingIndex >= 0) {
    favorites.splice(existingIndex, 1);
    showToast('Удалено из избранного');
  } else {
    favorites.push(product);
    showToast('Добавлено в избранное');
  }
  
  saveDataToStorage();
  
  // Update UI
  const currentPageId = document.querySelector('.page.active')?.id;
  if (currentPageId === 'home') {
    renderHomePage();
  } else if (currentPageId === 'catalog' && currentCategory) {
    renderCategoryProducts(currentCategory);
  }
  
  updateFavoriteButtons();
}

function updateFavoriteButtons() {
  document.querySelectorAll('.btn-icon').forEach(btn => {
    const onclickAttr = btn.getAttribute('onclick');
    if (onclickAttr && onclickAttr.includes('toggleFavorite')) {
      const matches = onclickAttr.match(/toggleFavorite\((\d+)\)/);
      if (matches) {
        const productId = parseInt(matches[1]);
        const inFavorites = favorites.some(fav => fav.id === productId);
        btn.classList.toggle('active', inFavorites);
      }
    }
  });
}

// Orders
function renderOrders() {
  const container = document.getElementById('ordersItems');
  if (!container) return;
  
  const userOrders = appData.orders.filter(order => order.user_id === currentUser.id);
  
  if (userOrders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <p>У вас пока нет заказов</p>
        <button class="btn btn--primary" onclick="showPage('catalog'); setActiveNavItem('catalog');">
          Сделать первый заказ
        </button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = userOrders.map(order => `
    <div class="order-item">
      <div class="order-header">
        <div class="order-id">Заказ #${order.id}</div>
        <div class="order-date">${new Date(order.created_at).toLocaleDateString('ru-RU')}</div>
      </div>
      <div class="order-total">${order.total.toLocaleString()}₽</div>
      <div class="status status--${getStatusClass(order.status)}">${getStatusText(order.status)}</div>
      <div class="order-items">
        <h4>Товары:</h4>
        <div class="order-item-list">
          ${order.items.map(item => `
            <div class="order-item-row">
              ${item.name} ${item.size ? `(${item.size})` : ''} — ${item.quantity}шт × ${item.price.toLocaleString()}₽
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

function getStatusClass(status) {
  switch(status) {
    case 'pending': return 'processing';
    case 'confirmed': return 'info';
    case 'shipped': return 'shipped';
    case 'delivered': return 'delivered';
    case 'cancelled': return 'cancelled';
    default: return 'processing';
  }
}

function getStatusText(status) {
  switch(status) {
    case 'pending': return 'В обработке';
    case 'confirmed': return 'Подтвержден';
    case 'shipped': return 'Отправлен';
    case 'delivered': return 'Доставлен';
    case 'cancelled': return 'Отменен';
    default: return status;
  }
}

// Profile
function renderProfile() {
  updateUserInfo();
}

// Checkout - FIXED
function showCheckoutModal() {
  if (cart.length === 0) {
    showToast('Корзина пуста', 'error');
    return;
  }
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCost = subtotal >= CONFIG.free_delivery_from ? 0 : CONFIG.delivery_price;
  const total = subtotal + deliveryCost;
  
  document.getElementById('checkoutSubtotal').textContent = subtotal.toLocaleString() + '₽';
  document.getElementById('checkoutDelivery').textContent = deliveryCost === 0 ? 'Бесплатно' : deliveryCost + '₽';
  document.getElementById('checkoutTotal').textContent = total.toLocaleString() + '₽';
  document.getElementById('checkoutModal').classList.remove('hidden');
}

// Event Listeners
function setupEventListeners() {
  // Back to categories button
  const backToCategoriesBtn = document.getElementById('backToCategories');
  if (backToCategoriesBtn) {
    backToCategoriesBtn.addEventListener('click', resetCatalogView);
  }
  
  // Checkout button
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', showCheckoutModal);
  }
  
  // Checkout form
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckout);
  }
  
  // Top up button
  const topUpBtn = document.getElementById('topUpBtn');
  if (topUpBtn) {
    topUpBtn.addEventListener('click', () => {
      document.getElementById('paymentModal').classList.remove('hidden');
    });
  }
  
  // Support button
  const supportBtn = document.getElementById('supportBtn');
  if (supportBtn) {
    supportBtn.addEventListener('click', () => {
      if (tg) {
        tg.openTelegramLink('https://t.me/support_bot');
      } else {
        window.open('https://t.me/support_bot', '_blank');
      }
    });
  }
  
  // Share button
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: 'ShopTG - Интернет магазин',
          text: 'Лучший интернет-магазин в Telegram!',
          url: window.location.href
        });
      } else if (tg) {
        showToast('Поделитесь ссылкой с друзьями: ' + window.location.href);
      }
    });
  }
  
  // Payment form
  const paymentForm = document.getElementById('paymentForm');
  if (paymentForm) {
    paymentForm.addEventListener('submit', handlePayment);
  }
  
  // Payment method selection
  document.querySelectorAll('.payment-method').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.payment-method').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  
  // Add product form
  const addProductForm = document.getElementById('addProductForm');
  if (addProductForm) {
    addProductForm.addEventListener('submit', handleAddProduct);
  }
  
  // Settings form
  const settingsForm = document.getElementById('settingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', handleSettingsUpdate);
  }
}

function setupFilters() {
  const priceFilter = document.getElementById('priceFilter');
  const priceValue = document.getElementById('priceValue');
  const inStockFilter = document.getElementById('inStockFilter');
  
  if (priceFilter && priceValue) {
    priceFilter.addEventListener('input', function() {
      priceValue.textContent = this.value + '₽';
      if (currentCategory) {
        renderCategoryProducts(currentCategory);
      }
    });
  }
  
  if (inStockFilter) {
    inStockFilter.addEventListener('change', function() {
      if (currentCategory) {
        renderCategoryProducts(currentCategory);
      }
    });
  }
}

async function handleCheckout(e) {
  e.preventDefault();
  
  showLoading(true);
  
  try {
    const formData = new FormData(e.target);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCost = subtotal >= CONFIG.free_delivery_from ? 0 : CONFIG.delivery_price;
    
    const orderData = {
      items: cart.map(item => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size
      })),
      subtotal: subtotal,
      delivery_cost: deliveryCost,
      total: subtotal + deliveryCost,
      payment_method: formData.get('paymentMethod'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      comment: formData.get('orderComment')
    };
    
    const order = await createOrder(orderData);
    
    // Clear cart
    cart = [];
    updateCartBadge();
    updateMainButton();
    saveDataToStorage();
    
    closeModal('checkoutModal');
    showToast('Заказ успешно оформлен!');
    
    // Reset form
    e.target.reset();
    
    // Show orders page
    setTimeout(() => {
      showPage('orders');
      setActiveNavItem('orders');
    }, 1000);
    
  } catch (error) {
    console.error('Checkout error:', error);
    showToast('Ошибка при оформлении заказа: ' + error.message, 'error');
  } finally {
    showLoading(false);
  }
}

async function createOrder(orderData) {
  const order = {
    id: Date.now(),
    user_id: currentUser.id,
    user_name: currentUser.first_name,
    user_username: currentUser.username,
    items: orderData.items,
    subtotal: orderData.subtotal,
    delivery_cost: orderData.delivery_cost,
    total: orderData.total,
    status: 'pending',
    payment_method: orderData.payment_method,
    delivery_info: {
      phone: orderData.phone,
      address: orderData.address,
      comment: orderData.comment || ''
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Save order locally
  appData.orders.unshift(order);
  saveOrders();

  // Send notification to admin (mock)
  console.log('Order created:', order);
  
  return order;
}

async function handlePayment(e) {
  e.preventDefault();
  
  const amount = parseInt(document.getElementById('topUpAmount').value);
  
  try {
    // Mock payment processing
    currentUser.balance += amount;
    saveBalance(currentUser.id, currentUser.balance);
    updateUserInfo();
    
    closeModal('paymentModal');
    showToast('Баланс успешно пополнен!');
    e.target.reset();
    
  } catch (error) {
    console.error('Payment error:', error);
    showToast('Ошибка пополнения: ' + error.message, 'error');
  }
}

// Admin Panel
function renderAdminPanel() {
  if (!currentUser.is_admin) {
    showToast('Доступ запрещен', 'error');
    return;
  }
  
  updateAdminStats();
  setupAdminTabs();
  renderAdminProducts();
}

function updateAdminStats() {
  if (!currentUser.is_admin) return;
  
  const totalOrdersEl = document.getElementById('totalOrders');
  const totalRevenueEl = document.getElementById('totalRevenue');
  
  if (totalOrdersEl) {
    totalOrdersEl.textContent = appData.orders.length;
  }
  
  if (totalRevenueEl) {
    const revenue = appData.orders.reduce((sum, order) => sum + order.total, 0);
    totalRevenueEl.textContent = revenue.toLocaleString() + '₽';
  }
}

function setupAdminTabs() {
  const productsTab = document.getElementById('adminProductsTab');
  const ordersTab = document.getElementById('adminOrdersTab');
  const settingsTab = document.getElementById('adminSettingsTab');
  const addProductBtn = document.getElementById('addProductBtn');
  
  if (productsTab) {
    productsTab.addEventListener('click', () => setActiveAdminTab('products'));
  }
  
  if (ordersTab) {
    ordersTab.addEventListener('click', () => setActiveAdminTab('orders'));
  }
  
  if (settingsTab) {
    settingsTab.addEventListener('click', () => setActiveAdminTab('settings'));
  }
  
  if (addProductBtn) {
    addProductBtn.addEventListener('click', showAddProductModal);
  }
}

function setActiveAdminTab(tab) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  const activeTab = document.getElementById(`admin${tab.charAt(0).toUpperCase() + tab.slice(1)}Tab`);
  if (activeTab) activeTab.classList.add('active');
  
  // Show/hide sections
  document.querySelectorAll('.admin-section').forEach(section => section.classList.add('hidden'));
  const activeSection = document.getElementById(`admin${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
  if (activeSection) activeSection.classList.remove('hidden');
  
  // Load content
  switch(tab) {
    case 'products':
      renderAdminProducts();
      break;
    case 'orders':
      renderAdminOrders();
      break;
    case 'settings':
      loadSettings();
      break;
  }
}

function renderAdminProducts() {
  const container = document.getElementById('adminProductsList');
  if (!container) return;
  
  container.innerHTML = appData.products.map(product => `
    <div class="admin-product-item">
      <img src="${product.image}" alt="${product.name}" class="cart-item-image"
           onerror="this.src='https://via.placeholder.com/60x60/CCCCCC/FFFFFF?text=No+Image'">
      <div class="admin-product-info">
        <div class="cart-item-name">${product.name}</div>
        <div class="cart-item-price">${product.price.toLocaleString()}₽</div>
        <div class="cart-item-size">В наличии: ${product.in_stock ? 'Да' : 'Нет'}</div>
      </div>
      <div class="admin-product-actions">
        <button class="btn btn--outline btn--sm" onclick="toggleProductStock(${product.id})">
          ${product.in_stock ? 'Снять' : 'Вернуть'}
        </button>
        <button class="btn btn--outline btn--sm" onclick="deleteProduct(${product.id})" style="color: var(--color-error); border-color: var(--color-error);">
          Удалить
        </button>
      </div>
    </div>
  `).join('');
}

function renderAdminOrders() {
  const container = document.getElementById('adminOrdersList');
  if (!container) return;
  
  if (appData.orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <p>Заказов пока нет</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = appData.orders.map(order => `
    <div class="order-item">
      <div class="order-header">
        <div class="order-id">Заказ #${order.id}</div>
        <div class="order-date">${new Date(order.created_at).toLocaleDateString('ru-RU')}</div>
      </div>
      <div class="order-total">${order.total.toLocaleString()}₽</div>
      <div class="status status--${getStatusClass(order.status)}">${getStatusText(order.status)}</div>
      <p><strong>Клиент:</strong> ${order.user_name} (@${order.user_username || order.user_id})</p>
      <p><strong>Телефон:</strong> ${order.delivery_info.phone}</p>
      <p><strong>Адрес:</strong> ${order.delivery_info.address}</p>
      ${order.delivery_info.comment ? `<p><strong>Комментарий:</strong> ${order.delivery_info.comment}</p>` : ''}
      <div class="admin-product-actions">
        <select onchange="updateOrderStatus(${order.id}, this.value)" class="form-control">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>В обработке</option>
          <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Подтвержден</option>
          <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Отправлен</option>
          <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Доставлен</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Отменен</option>
        </select>
      </div>
      <div class="order-items">
        <h4>Товары:</h4>
        <div class="order-item-list">
          ${order.items.map(item => `
            <div class="order-item-row">
              ${item.name} ${item.size ? `(${item.size})` : ''} — ${item.quantity}шт × ${item.price.toLocaleString()}₽
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

function loadSettings() {
  const deliveryCostInput = document.getElementById('deliveryCost');
  const freeDeliveryFromInput = document.getElementById('freeDeliveryFrom');
  const adminChatIdInput = document.getElementById('adminChatId');
  
  if (deliveryCostInput) deliveryCostInput.value = CONFIG.delivery_price;
  if (freeDeliveryFromInput) freeDeliveryFromInput.value = CONFIG.free_delivery_from;
  if (adminChatIdInput) adminChatIdInput.value = CONFIG.admin_chat_id || '';
}

function handleSettingsUpdate(e) {
  e.preventDefault();
  
  CONFIG.delivery_price = parseInt(document.getElementById('deliveryCost').value);
  CONFIG.free_delivery_from = parseInt(document.getElementById('freeDeliveryFrom').value);
  CONFIG.admin_chat_id = document.getElementById('adminChatId').value;
  
  saveDataToStorage();
  showToast('Настройки сохранены');
}

function toggleProductStock(productId) {
  const product = appData.products.find(p => p.id === productId);
  if (product) {
    product.in_stock = !product.in_stock;
    saveDataToStorage();
    renderAdminProducts();
    showToast(`Товар ${product.in_stock ? 'возвращен в продажу' : 'снят с продажи'}`);
  }
}

function deleteProduct(productId) {
  if (confirm('Вы уверены, что хотите удалить этот товар?')) {
    const index = appData.products.findIndex(p => p.id === productId);
    if (index > -1) {
      appData.products.splice(index, 1);
      saveDataToStorage();
      renderAdminProducts();
      showToast('Товар удален');
    }
  }
}

function updateOrderStatus(orderId, newStatus) {
  const order = appData.orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    order.updated_at = new Date().toISOString();
    saveOrders();
    showToast('Статус заказа обновлен');
    updateAdminStats();
  }
}

function showAddProductModal() {
  const categorySelect = document.getElementById('productCategory');
  if (categorySelect) {
    categorySelect.innerHTML = '<option value="">Выберите категорию</option>' +
      appData.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
  }
  
  document.getElementById('addProductModal').classList.remove('hidden');
}

async function handleAddProduct(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const newProduct = {
    id: Date.now(),
    name: formData.get('productName'),
    price: parseInt(formData.get('productPrice')),
    category_id: parseInt(formData.get('productCategory')),
    description: formData.get('productDescription'),
    image: formData.get('productImage'),
    sizes: formData.get('productSizes') ? 
      formData.get('productSizes').split(',').map(s => s.trim()).filter(s => s) : [],
    in_stock: true
  };
  
  appData.products.push(newProduct);
  saveDataToStorage();
  
  closeModal('addProductModal');
  renderAdminProducts();
  showToast('Товар добавлен');
  
  e.target.reset();
}

// Modal Management
function setupModals() {
  document.querySelectorAll('.modal-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) {
        modal.classList.add('hidden');
      }
    });
  });
  
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Utilities
function showLoading(show) {
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) {
    if (show) {
      spinner.classList.remove('hidden');
    } else {
      spinner.classList.add('hidden');
    }
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  
  if (toast && toastMessage) {
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }
}

// Global function exports for onclick handlers
window.showProductModal = showProductModal;
window.addToCart = addToCart;
window.toggleFavorite = toggleFavorite;
window.selectSize = selectSize;
window.addToCartFromModal = addToCartFromModal;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.showCategoryProducts = showCategoryProducts;
window.toggleProductStock = toggleProductStock;
window.deleteProduct = deleteProduct;
window.updateOrderStatus = updateOrderStatus;
window.showPage = showPage;
window.setActiveNavItem = setActiveNavItem;
