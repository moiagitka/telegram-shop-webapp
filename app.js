// ==========================================
// PRODCUTION READY TELEGRAM WEBAPP - FIXED
// ==========================================

// Configuration
const API_CONFIG = {
    BASE_URL: 'https://5ef83c5dc964.ngrok-free.app',
    ENDPOINTS: {
        USER: '/api/user',
        WEBAPP_DATA: '/api/webapp-data',
        ORDERS: '/api/orders'
    },
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
};

const SHOP_CONFIG = {
    CURRENCY: 'RUB',
    DELIVERY_PRICE: 300,
    FREE_DELIVERY_FROM: 5000
};

const ADMIN_USERS = [111111111, 222222222];

// Telegram WebApp Integration
let tg = window.Telegram?.WebApp;
let telegramUser = null;
let isProduction = false;

// Application State
let currentUser = {
    id: null,
    first_name: '',
    last_name: '',
    username: '',
    balance: 0,
    bonus_points: 0,
    is_admin: false
};

let cart = [];
let favorites = [];
let products = [];
let categories = [];
let orders = [];
let currentCategory = null;
let currentProduct = null;
let selectedSize = null;
let serverConnected = false;

// ==========================================
// TELEGRAM WEBAPP INITIALIZATION
// ==========================================

function initializeTelegramWebApp() {
    console.log('🚀 Initializing Telegram WebApp...');
    
    if (tg) {
        isProduction = true;
        console.log('✅ Telegram WebApp API found');
        console.log('📱 Version:', tg.version);
        console.log('🎨 Color scheme:', tg.colorScheme);
        
        // Initialize WebApp
        tg.ready();
        tg.expand();
        
        // Apply Telegram theme
        applyTelegramTheme();
        
        // Get user data
        if (tg.initDataUnsafe?.user) {
            telegramUser = tg.initDataUnsafe.user;
            console.log('👤 Telegram user:', telegramUser);
            
            currentUser.id = telegramUser.id;
            currentUser.first_name = telegramUser.first_name || '';
            currentUser.last_name = telegramUser.last_name || '';
            currentUser.username = telegramUser.username || '';
            currentUser.is_admin = ADMIN_USERS.includes(telegramUser.id);
            
            // Setup Telegram features
            setupTelegramMainButton();
            setupHapticFeedback();
            
            console.log('✅ User initialized:', currentUser);
            
        } else {
            console.warn('⚠️ Telegram user data not available');
            showToast('Не удалось получить данные пользователя Telegram', 'error');
        }
        
    } else {
        console.log('🔧 Development mode - Telegram WebApp API not available');
        isProduction = false;
        
        // Development fallback
        currentUser.id = 221933064;
        currentUser.first_name = 'Test User';
        currentUser.username = 'testuser';
        currentUser.is_admin = true;
    }
}

function applyTelegramTheme() {
    if (!tg) return;
    
    const root = document.documentElement;
    
    if (tg.colorScheme === 'dark') {
        root.setAttribute('data-color-scheme', 'dark');
    } else {
        root.setAttribute('data-color-scheme', 'light');
    }
    
    // Apply Telegram theme colors if available
    if (tg.themeParams) {
        if (tg.themeParams.bg_color) {
            root.style.setProperty('--tg-bg-color', tg.themeParams.bg_color);
        }
        if (tg.themeParams.text_color) {
            root.style.setProperty('--tg-text-color', tg.themeParams.text_color);
        }
    }
}

function setupTelegramMainButton() {
    if (!tg?.MainButton) return;
    
    console.log('🔘 Setting up MainButton');
    
    tg.MainButton.hide();
    
    tg.MainButton.onClick(() => {
        console.log('🔘 MainButton clicked');
        triggerHaptic('impact', 'medium');
        
        if (cart.length > 0) {
            openCheckoutModal();
        } else {
            showToast('Корзина пуста', 'error');
        }
    });
    
    updateTelegramMainButton();
}

function updateTelegramMainButton() {
    if (!tg?.MainButton) return;
    
    if (cart.length > 0) {
        const total = calculateCartTotal();
        tg.MainButton.text = `Оформить заказ (${formatPrice(total)})`;
        tg.MainButton.color = '#32808D';
        tg.MainButton.textColor = '#FFFFFF';
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
}

function setupHapticFeedback() {
    if (!tg?.HapticFeedback) return;
    console.log('📳 Haptic feedback available');
}

function triggerHaptic(type = 'impact', style = 'light') {
    if (!tg?.HapticFeedback) return;
    
    try {
        if (type === 'impact') {
            tg.HapticFeedback.impactOccurred(style);
        } else if (type === 'notification') {
            tg.HapticFeedback.notificationOccurred(style);
        } else if (type === 'selection') {
            tg.HapticFeedback.selectionChanged();
        }
    } catch (error) {
        console.warn('Haptic feedback error:', error);
    }
}

// ==========================================
// API FUNCTIONS
// ==========================================

async function makeAPIRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        }
    };
    
    if (tg?.initData) {
        defaultOptions.headers['X-Telegram-Init-Data'] = tg.initData;
    }
    
    const requestOptions = { ...defaultOptions, ...options };
    
    console.log(`🌐 API Request: ${requestOptions.method} ${url}`);
    
    for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
            
            const response = await fetch(url, {
                ...requestOptions,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            console.log(`📡 API Response: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('✅ Data received:', data);
            
            updateConnectionStatus(true);
            return data;
            
        } catch (error) {
            console.error(`❌ API Request failed (attempt ${attempt}):`, error);
            
            if (attempt === API_CONFIG.RETRY_ATTEMPTS) {
                updateConnectionStatus(false);
                throw error;
            }
            
            await sleep(API_CONFIG.RETRY_DELAY * attempt);
        }
    }
}

async function loadUserProfile() {
    console.log('👤 Loading user profile...');
    
    if (!currentUser.id) {
        console.warn('⚠️ User ID not found');
        return;
    }
    
    try {
        const userData = await makeAPIRequest(`${API_CONFIG.ENDPOINTS.USER}/${currentUser.id}`);
        
        currentUser.balance = userData.balance || 0;
        currentUser.bonus_points = userData.bonus_points || 0;
        
        console.log('✅ User profile loaded:', currentUser);
        updateUserInterface();
        
    } catch (error) {
        console.warn('⚠️ Failed to load user profile, using fallback data');
        currentUser.balance = 5000;
        currentUser.bonus_points = 150;
        updateUserInterface();
    }
}

async function loadProducts() {
    console.log('📦 Loading products...');
    
    try {
        const data = await makeAPIRequest('/api/products');
        products = data.products || [];
        categories = data.categories || [];
        
        console.log('✅ Products loaded:', products.length);
        renderAllContent();
        
    } catch (error) {
        console.warn('⚠️ Failed to load products, using fallback data');
        loadFallbackData();
        renderAllContent();
    }
}

async function loadOrders() {
    if (!currentUser.is_admin) return;
    
    console.log('📋 Loading orders (admin)...');
    
    try {
        const data = await makeAPIRequest(API_CONFIG.ENDPOINTS.ORDERS);
        orders = data.orders || [];
        
        console.log('✅ Orders loaded:', orders.length);
        
        if (document.querySelector('.page.active')?.id === 'admin') {
            renderAdminOrders();
        }
        
    } catch (error) {
        console.warn('⚠️ Failed to load orders');
    }
}

async function submitOrder(orderData) {
    console.log('📦 Submitting order...');
    
    const serverOrderData = {
        user_id: currentUser.id,
        user_name: `${currentUser.first_name} ${currentUser.last_name}`.trim(),
        user_username: currentUser.username,
        telegram_init_data: tg?.initData || null,
        items: orderData.items.map(item => {
            const product = products.find(p => p.id === item.product_id);
            return {
                product_id: item.product_id,
                product_name: product?.name || 'Unknown Product',
                quantity: item.quantity,
                size: item.size || null,
                price: product?.price || 0
            };
        }),
        total_amount: orderData.total,
        delivery_cost: orderData.delivery_cost || 0,
        phone: orderData.phone,
        telegram_username: orderData.telegram,
        address: orderData.address,
        full_name: orderData.full_name,
        comment: orderData.comment || '',
        order_date: new Date().toISOString()
    };
    
    console.log('📋 Order data for server:', serverOrderData);
    
    try {
        const response = await makeAPIRequest(API_CONFIG.ENDPOINTS.WEBAPP_DATA, {
            method: 'POST',
            body: JSON.stringify(serverOrderData)
        });
        
        console.log('✅ Order submitted successfully:', response);
        
        // Save to local history
        const localOrder = {
            id: response.order_id || Date.now(),
            ...orderData,
            status: 'В обработке',
            date: new Date().toISOString().split('T')[0]
        };
        
        orders.push(localOrder);
        saveToStorage();
        
        return response;
        
    } catch (error) {
        console.error('❌ Order submission failed:', error);
        
        // Save locally if server unavailable
        const localOrder = {
            id: Date.now(),
            ...orderData,
            status: 'Ожидает отправки',
            date: new Date().toISOString().split('T')[0]
        };
        
        orders.push(localOrder);
        saveToStorage();
        
        throw error;
    }
}

// ==========================================
// APPLICATION INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, starting app...');
    setTimeout(initializeApp, 100);
});

async function initializeApp() {
    console.log('⚙️ Initializing application...');
    
    try {
        showLoadingOverlay('Инициализация приложения...');
        
        // Initialize Telegram WebApp
        initializeTelegramWebApp();
        
        // Load data from localStorage
        loadFromStorage();
        
        // Load fallback data immediately for better UX
        loadFallbackData();
        
        // Setup UI
        setupNavigation();
        setupModals();
        setupEventListeners();
        
        // Load user profile
        await loadUserProfile();
        
        // Try to load products from server
        try {
            await loadProducts();
        } catch (error) {
            console.warn('Using fallback product data');
        }
        
        // Setup admin features if admin
        if (currentUser.is_admin) {
            setupAdminFeatures();
            await loadOrders();
        }
        
        // Initial render
        updateUserInterface();
        renderHomePage();
        updateCartBadge();
        
        hideLoadingOverlay();
        
        console.log('✅ Application initialized successfully');
        showToast('Приложение готово к работе!');
        
    } catch (error) {
        console.error('❌ Application initialization failed:', error);
        hideLoadingOverlay();
        showToast('Ошибка инициализации. Попробуйте перезагрузить страницу.', 'error');
    }
}

function loadFromStorage() {
    try {
        const savedCart = localStorage.getItem('shopTG_cart');
        const savedFavorites = localStorage.getItem('shopTG_favorites');
        const savedOrders = localStorage.getItem('shopTG_orders');
        
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
        if (savedFavorites) {
            favorites = JSON.parse(savedFavorites);
        }
        if (savedOrders) {
            orders = JSON.parse(savedOrders);
        }
        
        console.log('💾 Data loaded from storage');
        
    } catch (error) {
        console.error('❌ Storage loading error:', error);
    }
}

function saveToStorage() {
    try {
        localStorage.setItem('shopTG_cart', JSON.stringify(cart));
        localStorage.setItem('shopTG_favorites', JSON.stringify(favorites));
        localStorage.setItem('shopTG_orders', JSON.stringify(orders));
    } catch (error) {
        console.error('❌ Storage saving error:', error);
    }
}

function loadFallbackData() {
    categories = [
        { id: 1, name: "Верхняя одежда", icon: "🧥" },
        { id: 2, name: "Кроссовки", icon: "👟" },
        { id: 3, name: "Джинсы", icon: "👖" },
        { id: 4, name: "Аксессуары", icon: "👜" }
    ];
    
    products = [
        {
            id: 1, name: "Куртка Nike", price: 8500,
            image: "https://via.placeholder.com/200x200/0088CC/FFFFFF?text=Nike+Jacket",
            category_id: 1, sizes: ["S", "M", "L", "XL"], in_stock: true,
            description: "Спортивная куртка Nike высокого качества"
        },
        {
            id: 2, name: "Кроссовки Adidas", price: 12000,
            image: "https://via.placeholder.com/200x200/000000/FFFFFF?text=Adidas",
            category_id: 2, sizes: ["40", "41", "42", "43", "44"], in_stock: true,
            description: "Удобные кроссовки Adidas для спорта и повседневной носки"
        },
        {
            id: 3, name: "Джинсы Levi's", price: 6500,
            image: "https://via.placeholder.com/200x200/000080/FFFFFF?text=Levi%27s",
            category_id: 3, sizes: ["30", "32", "34", "36"], in_stock: false,
            description: "Классические джинсы Levi's"
        },
        {
            id: 4, name: "Рюкзак", price: 3500,
            image: "https://via.placeholder.com/200x200/008000/FFFFFF?text=Backpack",
            category_id: 4, sizes: [], in_stock: true,
            description: "Стильный рюкзак для повседневного использования"
        },
        {
            id: 5, name: "Худи Supreme", price: 15000,
            image: "https://via.placeholder.com/200x200/FF0000/FFFFFF?text=Supreme",
            category_id: 1, sizes: ["S", "M", "L", "XL"], in_stock: true,
            description: "Оригинальное худи Supreme"
        },
        {
            id: 6, name: "Кроссовки Jordan", price: 18000,
            image: "https://via.placeholder.com/200x200/800000/FFFFFF?text=Jordan",
            category_id: 2, sizes: ["40", "41", "42", "43"], in_stock: true,
            description: "Легендарные кроссовки Air Jordan"
        }
    ];
}

function setupEventListeners() {
    // Price filter
    const priceFilter = document.getElementById('priceFilter');
    const priceValue = document.getElementById('priceValue');
    
    if (priceFilter && priceValue) {
        priceFilter.addEventListener('input', function() {
            priceValue.textContent = formatPrice(this.value);
            if (currentCategory) {
                renderCategoryProducts(currentCategory);
            }
        });
    }
    
    // Back to categories
    const backBtn = document.getElementById('backToCategories');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            triggerHaptic('selection');
            resetCatalogView();
        });
    }
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            triggerHaptic('impact', 'medium');
            openCheckoutModal();
        });
    }
    
    // Checkout form
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }
}

function setupAdminFeatures() {
    const adminNav = document.getElementById('adminNav');
    if (adminNav) {
        adminNav.classList.remove('hidden');
    }
    
    const adminTabs = document.querySelectorAll('.tab-btn');
    adminTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            triggerHaptic('selection');
            switchAdminTab(e.target.id);
        });
    });
    
    console.log('👑 Admin features enabled');
}

async function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitOrderBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправляем заказ...';
    }
    
    try {
        triggerHaptic('impact', 'heavy');
        
        if (cart.length === 0) {
            throw new Error('Корзина пуста');
        }
        
        const total = calculateCartTotal();
        const deliveryCost = total >= SHOP_CONFIG.FREE_DELIVERY_FROM ? 0 : SHOP_CONFIG.DELIVERY_PRICE;
        
        const orderData = {
            id: Date.now(),
            user_id: currentUser.id,
            items: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                size: item.size || null
            })),
            total: total + deliveryCost,
            delivery_cost: deliveryCost,
            phone: document.getElementById('phone').value.trim(),
            telegram: document.getElementById('telegram').value.trim(),
            address: document.getElementById('address').value.trim(),
            full_name: document.getElementById('fullName').value.trim(),
            comment: document.getElementById('orderComment').value.trim()
        };
        
        // Validation
        if (!orderData.phone || !orderData.address || !orderData.full_name) {
            throw new Error('Заполните все обязательные поля');
        }
        
        console.log('📝 Order prepared:', orderData);
        
        // Submit order
        await submitOrder(orderData);
        
        // Success
        triggerHaptic('notification', 'success');
        showToast('Заказ успешно оформлен! Ожидайте уведомление в Telegram.');
        
        // Clear cart
        cart = [];
        updateCartBadge();
        updateTelegramMainButton();
        saveToStorage();
        
        // Close modal and show profile
        closeModal('checkoutModal');
        showPage('profile');
        updateActiveNavItem('profile');
        renderProfile();
        
        e.target.reset();
        
    } catch (error) {
        console.error('❌ Order submission error:', error);
        triggerHaptic('notification', 'error');
        showToast(error.message || 'Ошибка при оформлении заказа', 'error');
        
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Подтвердить заказ';
        }
    }
}

// ==========================================
// NAVIGATION - FIXED
// ==========================================

function setupNavigation() {
    console.log('📱 Setting up navigation...');
    
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const page = item.dataset.page;
            console.log('📍 Nav clicked:', page);
            
            if (page) {
                triggerHaptic('selection');
                showPage(page);
                updateActiveNavItem(page);
            }
        });
    });
    
    console.log('✅ Navigation setup complete');
}

function showPage(pageId) {
    console.log('📄 Showing page:', pageId);
    
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Load page-specific content
        switch(pageId) {
            case 'home':
                renderHomePage();
                break;
            case 'catalog':
                resetCatalogView();
                renderCategories();
                break;
            case 'cart':
                renderCart();
                break;
            case 'favorites':
                renderFavorites();
                break;
            case 'profile':
                renderProfile();
                break;
            case 'admin':
                renderAdminPanel();
                break;
        }
        
        console.log('✅ Page shown:', pageId);
    } else {
        console.error('❌ Page not found:', pageId);
    }
}

function updateActiveNavItem(pageId) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(nav => nav.classList.remove('active'));
    
    const activeNav = document.querySelector(`[data-page="${pageId}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
}

// ==========================================
// RENDERING FUNCTIONS - FIXED
// ==========================================

function updateUserInterface() {
    // Update welcome message
    const welcomeUser = document.getElementById('welcomeUser');
    if (welcomeUser) {
        welcomeUser.textContent = `Добро пожаловать, ${currentUser.first_name || 'Пользователь'}!`;
    }
    
    // Update balance
    const userBalance = document.getElementById('userBalance');
    if (userBalance) {
        userBalance.textContent = `Баланс: ${formatPrice(currentUser.balance)}`;
    }
    
    // Update profile info
    const userName = document.getElementById('userName');
    const userTelegram = document.getElementById('userTelegram');
    
    if (userName) {
        userName.textContent = `${currentUser.first_name} ${currentUser.last_name}`.trim() || 'Пользователь';
    }
    if (userTelegram) {
        userTelegram.textContent = currentUser.username ? `@${currentUser.username}` : 'Не указан';
    }
}

function renderAllContent() {
    renderHomePage();
    renderCategories();
}

function renderHomePage() {
    console.log('🏠 Rendering home page...');
    
    const container = document.getElementById('latestProducts');
    if (!container) return;
    
    const featuredProducts = products.filter(p => p.in_stock).slice(0, 6);
    
    if (featuredProducts.length === 0) {
        container.innerHTML = '<div class="loading">Товары загружаются...</div>';
        return;
    }
    
    container.innerHTML = featuredProducts.map(product => createProductCard(product)).join('');
    console.log('✅ Home page rendered');
}

function renderCategories() {
    console.log('📦 Rendering categories...');
    
    const container = document.getElementById('categoriesList');
    if (!container) return;
    
    if (categories.length === 0) {
        container.innerHTML = '<div class="loading">Категории загружаются...</div>';
        return;
    }
    
    container.innerHTML = categories.map(category => `
        <div class="category-card" onclick="showCategoryProducts(${category.id})">
            <div class="category-icon">${category.icon}</div>
            <div class="category-name">${category.name}</div>
        </div>
    `).join('');
    
    console.log('✅ Categories rendered');
}

function showCategoryProducts(categoryId) {
    console.log('📂 Showing category products:', categoryId);
    
    currentCategory = categoryId;
    triggerHaptic('selection');
    
    const categoriesList = document.getElementById('categoriesList');
    const categoryProducts = document.getElementById('categoryProducts');
    const backBtn = document.getElementById('backToCategories');
    
    if (categoriesList) categoriesList.classList.add('hidden');
    if (categoryProducts) categoryProducts.classList.remove('hidden');
    if (backBtn) backBtn.classList.remove('hidden');
    
    renderCategoryProducts(categoryId);
}

function renderCategoryProducts(categoryId) {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    const priceFilter = document.getElementById('priceFilter');
    const maxPrice = priceFilter ? parseInt(priceFilter.value) : 999999;
    
    const categoryProducts = products.filter(product => 
        product.category_id === categoryId && product.price <= maxPrice
    );
    
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
    console.log('🔄 Resetting catalog view...');
    
    const categoriesList = document.getElementById('categoriesList');
    const categoryProducts = document.getElementById('categoryProducts');
    const backBtn = document.getElementById('backToCategories');
    
    if (categoriesList) categoriesList.classList.remove('hidden');
    if (categoryProducts) categoryProducts.classList.add('hidden');
    if (backBtn) backBtn.classList.add('hidden');
    
    currentCategory = null;
}

function createProductCard(product) {
    const inFavorites = favorites.some(fav => fav.id === product.id);
    const outOfStock = !product.in_stock;
    
    return `
        <div class="product-card ${outOfStock ? 'out-of-stock' : ''}" onclick="showProductModal(${product.id})">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-name">${product.name}</div>
            <div class="product-price">${formatPrice(product.price)}</div>
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

function renderCart() {
    console.log('🛒 Rendering cart...');
    
    const container = document.getElementById('cartItems');
    const totalElement = document.getElementById('cartTotal');
    
    if (!container || !totalElement) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <p>Корзина пуста</p>
            </div>
        `;
        totalElement.textContent = formatPrice(0);
        return;
    }
    
    const total = calculateCartTotal();
    const deliveryCost = total >= SHOP_CONFIG.FREE_DELIVERY_FROM ? 0 : SHOP_CONFIG.DELIVERY_PRICE;
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image" onclick="showProductModal(${item.id})">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                ${item.size ? `<div class="cart-item-size">Размер: ${item.size}</div>` : ''}
                <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, '${item.size || ''}', ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, '${item.size || ''}', ${item.quantity + 1})">+</button>
                <button class="btn btn--outline btn--sm" onclick="removeFromCart(${item.id}, '${item.size || ''}')">Удалить</button>
            </div>
        </div>
    `).join('');
    
    const finalTotal = total + deliveryCost;
    totalElement.innerHTML = `
        ${deliveryCost > 0 ? `
            <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-4);">
                Товары: ${formatPrice(total)}<br>
                Доставка: ${formatPrice(deliveryCost)}<br>
                <small>Бесплатная доставка от ${formatPrice(SHOP_CONFIG.FREE_DELIVERY_FROM)}</small>
            </div>
        ` : ''}
        ${formatPrice(finalTotal)}
    `;
    
    console.log('✅ Cart rendered');
}

function renderFavorites() {
    console.log('❤️ Rendering favorites...');
    
    const container = document.getElementById('favoritesItems');
    if (!container) return;
    
    if (favorites.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❤️</div>
                <p>Нет избранных товаров</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = favorites.map(product => createProductCard(product)).join('');
    console.log('✅ Favorites rendered');
}

function renderProfile() {
    console.log('👤 Rendering profile...');
    
    const profileBalance = document.getElementById('profileBalance');
    const profileBonus = document.getElementById('profileBonus');
    
    if (profileBalance) {
        profileBalance.textContent = formatPrice(currentUser.balance);
    }
    if (profileBonus) {
        profileBonus.textContent = `${currentUser.bonus_points} баллов`;
    }
    
    renderOrderHistory();
    console.log('✅ Profile rendered');
}

function renderOrderHistory() {
    const container = document.getElementById('orderHistory');
    if (!container) return;
    
    const userOrders = orders.filter(order => order.user_id === currentUser.id);
    
    if (userOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>История заказов пуста</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = userOrders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <div class="order-id">Заказ #${order.id}</div>
                <div class="order-date">${formatDate(order.date)}</div>
            </div>
            <div class="order-total">${formatPrice(order.total)}</div>
            <div class="status status--${getStatusClass(order.status)}">${order.status}</div>
            ${order.items ? `<div class="order-items">${order.items.length} товар(ов)</div>` : ''}
        </div>
    `).join('');
}

function renderAdminPanel() {
    if (!currentUser.is_admin) return;
    
    console.log('👑 Rendering admin panel...');
    renderAdminOrders();
}

function renderAdminOrders() {
    const container = document.getElementById('adminOrdersList');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>Заказы не найдены</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="admin-order-item">
            <div class="admin-order-header">
                <div>
                    <div class="order-id">Заказ #${order.id}</div>
                    <div class="order-date">${formatDate(order.date)}</div>
                </div>
                <div class="status status--${getStatusClass(order.status)}">${order.status}</div>
            </div>
            <div class="order-total">${formatPrice(order.total)}</div>
            <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: var(--space-8);">
                ${order.full_name} | ${order.phone}<br>
                ${order.address}
            </div>
            ${order.items ? `<div class="order-items" style="margin-top: var(--space-8);">${order.items.length} товар(ов)</div>` : ''}
        </div>
    `).join('');
}

async function loadAdminOrders() {
    showToast('Обновление заказов...');
    await loadOrders();
    showToast('Заказы обновлены');
}

function switchAdminTab(tabId) {
    const tabs = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.admin-section');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    sections.forEach(section => section.classList.add('hidden'));
    
    document.getElementById(tabId).classList.add('active');
    
    if (tabId === 'adminOrdersTab') {
        document.getElementById('adminOrders').classList.remove('hidden');
    } else if (tabId === 'adminUsersTab') {
        document.getElementById('adminUsers').classList.remove('hidden');
    }
}

// ==========================================
// CART FUNCTIONALITY - FIXED
// ==========================================

function addToCart(productId, size = null) {
    console.log('🛒 Adding to cart:', productId, size);
    
    const product = products.find(p => p.id === productId);
    if (!product || !product.in_stock) {
        showToast('Товар недоступен', 'error');
        return;
    }
    
    triggerHaptic('impact', 'light');
    
    if (product.sizes.length > 0 && !size) {
        showProductModal(productId);
        return;
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
    updateTelegramMainButton();
    saveToStorage();
    showToast('Товар добавлен в корзину');
    
    console.log('✅ Cart updated:', cart);
}

function removeFromCart(productId, size = '') {
    console.log('🗑️ Removing from cart:', productId, size);
    
    triggerHaptic('impact', 'light');
    cart = cart.filter(item => !(item.id === productId && (item.size || '') === size));
    
    updateCartBadge();
    updateTelegramMainButton();
    renderCart();
    saveToStorage();
    
    showToast('Товар удален из корзины');
}

function updateCartQuantity(productId, size, newQuantity) {
    const item = cart.find(item => item.id === productId && (item.size || '') === size);
    if (!item) return;
    
    triggerHaptic('selection');
    
    if (newQuantity <= 0) {
        removeFromCart(productId, size);
    } else {
        item.quantity = newQuantity;
        updateCartBadge();
        updateTelegramMainButton();
        renderCart();
        saveToStorage();
    }
}

function calculateCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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

function toggleFavorite(productId) {
    console.log('❤️ Toggling favorite:', productId);
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    triggerHaptic('impact', 'light');
    
    const existingIndex = favorites.findIndex(fav => fav.id === productId);
    
    if (existingIndex >= 0) {
        favorites.splice(existingIndex, 1);
        showToast('Удалено из избранного');
    } else {
        favorites.push(product);
        showToast('Добавлено в избранное');
    }
    
    saveToStorage();
    updateFavoriteButtons();
    
    const activePage = document.querySelector('.page.active');
    if (activePage?.id === 'favorites') {
        renderFavorites();
    }
}

function updateFavoriteButtons() {
    document.querySelectorAll('.btn-icon').forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr?.includes('toggleFavorite')) {
            const match = onclickAttr.match(/\d+/);
            if (match) {
                const productId = parseInt(match[0]);
                const inFavorites = favorites.some(fav => fav.id === productId);
                btn.classList.toggle('active', inFavorites);
            }
        }
    });
}

// ==========================================
// MODAL FUNCTIONALITY - FIXED
// ==========================================

function setupModals() {
    console.log('🪟 Setting up modals...');
    
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
    
    console.log('✅ Modals setup complete');
}

function showProductModal(productId) {
    console.log('🪟 Showing product modal:', productId);
    
    const product = products.find(p => p.id === productId);
    if (!product) {
        console.error('❌ Product not found:', productId);
        return;
    }
    
    currentProduct = product;
    selectedSize = null;
    
    const modal = document.getElementById('productModal');
    const content = document.getElementById('productModalContent');
    
    if (!modal || !content) {
        console.error('❌ Modal elements not found');
        return;
    }
    
    const inFavorites = favorites.some(fav => fav.id === product.id);
    const outOfStock = !product.in_stock;
    
    content.innerHTML = `
        <div class="product-detail">
            <img src="${product.image}" alt="${product.name}" class="product-detail-image">
            <h3 class="product-detail-name">${product.name}</h3>
            <div class="product-detail-price">${formatPrice(product.price)}</div>
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
    console.log('✅ Product modal shown');
}

function selectSize(size) {
    selectedSize = size;
    triggerHaptic('selection');
    
    document.querySelectorAll('.size-option').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    console.log('📏 Size selected:', size);
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

function openCheckoutModal() {
    console.log('💳 Opening checkout modal...');
    
    if (cart.length === 0) {
        showToast('Корзина пуста', 'error');
        return;
    }
    
    // Pre-fill form with user data
    const telegramField = document.getElementById('telegram');
    const fullNameField = document.getElementById('fullName');
    
    if (telegramField && currentUser.username) {
        telegramField.value = `@${currentUser.username}`;
    }
    if (fullNameField && currentUser.first_name) {
        fullNameField.value = `${currentUser.first_name} ${currentUser.last_name}`.trim();
    }
    
    // Fill checkout summary
    const checkoutItems = document.getElementById('checkoutItems');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    if (checkoutItems) {
        checkoutItems.innerHTML = cart.map(item => `
            <div class="checkout-item">
                <span>${item.name} ${item.size ? `(${item.size})` : ''} x${item.quantity}</span>
                <span>${formatPrice(item.price * item.quantity)}</span>
            </div>
        `).join('');
    }
    
    const total = calculateCartTotal();
    const deliveryCost = total >= SHOP_CONFIG.FREE_DELIVERY_FROM ? 0 : SHOP_CONFIG.DELIVERY_PRICE;
    
    if (checkoutTotal) {
        checkoutTotal.innerHTML = `
            ${deliveryCost > 0 ? `
                <div style="font-size: var(--font-size-sm); margin-bottom: var(--space-4);">
                    Товары: ${formatPrice(total)}<br>
                    Доставка: ${formatPrice(deliveryCost)}
                </div>
            ` : ''}
            ${formatPrice(total + deliveryCost)}
        `;
    }
    
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.classList.remove('hidden');
        console.log('✅ Checkout modal opened');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function formatPrice(amount) {
    return `${Math.round(amount).toLocaleString()}₽`;
}

function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    } catch {
        return dateString;
    }
}

function getStatusClass(status) {
    const statusMap = {
        'В обработке': 'processing',
        'Отправлен': 'shipped', 
        'Доставлен': 'delivered',
        'Отменен': 'cancelled',
        'Ожидает отправки': 'pending'
    };
    return statusMap[status] || 'processing';
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    console.log(`🍞 Toast: ${message} (${type})`);
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function showLoadingOverlay(text = 'Загрузка...') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    
    if (overlay) overlay.classList.remove('hidden');
    if (loadingText) loadingText.textContent = text;
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('hidden');
}

function updateConnectionStatus(connected) {
    const status = document.getElementById('connectionStatus');
    const statusText = document.getElementById('statusText');
    
    if (!status || !statusText) return;
    
    if (connected) {
        statusText.textContent = '🟢 Онлайн';
        status.className = 'connection-status online';
        serverConnected = true;
    } else {
        statusText.textContent = '🔴 Офлайн';
        status.className = 'connection-status offline';
        serverConnected = false;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Global error handling
window.addEventListener('error', (event) => {
    console.error('❌ Global error:', event.error);
    showToast('Произошла ошибка в приложении', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled promise rejection:', event.reason);
});

console.log('✅ ShopTG Production App loaded and ready');
console.log('🔗 API Base URL:', API_CONFIG.BASE_URL);
console.log('👑 Admin users:', ADMIN_USERS);
