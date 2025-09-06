// ===========================================
// ИСПРАВЛЕННАЯ ВЕРСИЯ APP.JS С ИНТЕГРАЦИЕЙ
// ===========================================
///////////////
// Configuration
const API_CONFIG = {
    // Автоматическое определение окружения
    BASE_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:8080' 
        : 'https://5ef83c5dc964.ngrok-free.app',
    
    ENDPOINTS: {
        USER: '/api/user',
        WEBAPP_DATA: '/api/webapp-data',
        ORDERS: '/api/orders'
    },
    
    TIMEOUT: 5000, // 5 секунд
    RETRY_ATTEMPTS: 1
};

// Telegram WebApp Integration
let tg = null;
let telegramUser = null;
let isProduction = false;

// Application State
let currentUser = {
    id: null,
    first_name: '',
    username: '',
    balance: 5000,
    bonus_points: 150,
    is_admin: false
};

let cart = [];
let favorites = [];
let currentCategory = null;
let currentProduct = null;
let selectedSize = null;
let serverConnected = false;

// Application Data
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
    ],
    orders: []
};

// ===========================================
// TELEGRAM WEBAPP INITIALIZATION
// ===========================================

function initializeTelegramWebApp() {
    console.log('🚀 Инициализация Telegram WebApp...');
    
    // Проверяем доступность Telegram WebApp API
    if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
        tg = window.Telegram.WebApp;
        isProduction = true;
        
        console.log('✅ Telegram WebApp API найден');
        console.log('📱 Telegram WebApp версия:', tg.version);
        console.log('🎨 Цветовая схема:', tg.colorScheme);
        
        // Инициализируем WebApp
        tg.ready();
        tg.expand();
        
        // Применяем цветовую схему Telegram
        applyTelegramTheme();
        
        // Получаем данные пользователя
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            telegramUser = tg.initDataUnsafe.user;
            console.log('👤 Пользователь Telegram:', telegramUser);
            
            currentUser.id = telegramUser.id;
            currentUser.first_name = telegramUser.first_name || '';
            currentUser.username = telegramUser.username || '';
            
            // Настраиваем MainButton
            setupTelegramMainButton();
            
        } else {
            console.warn('⚠️ Данные пользователя Telegram недоступны');
            // Используем тестовые данные для разработки
            currentUser.id = 123456789;
            currentUser.first_name = 'Тестовый пользователь';
        }
        
    } else {
        console.log('🔧 Режим разработки - Telegram WebApp API недоступен');
        // Используем тестовые данные
        currentUser.id = 123456789;
        currentUser.first_name = 'Тестовый пользователь';
        currentUser.username = 'testuser';
        isProduction = false;
    }
}

function applyTelegramTheme() {
    if (!tg) return;
    
    const root = document.documentElement;
    
    if (tg.colorScheme === 'dark') {
        root.setAttribute('data-color-scheme', 'dark');
        console.log('🌙 Применена темная тема');
    } else {
        root.setAttribute('data-color-scheme', 'light');
        console.log('☀️ Применена светлая тема');
    }
}

function setupTelegramMainButton() {
    if (!tg || !tg.MainButton) return;
    
    console.log('🔘 Настройка MainButton');
    
    // Скрываем кнопку по умолчанию
    tg.MainButton.hide();
    
    // Обработчик нажатия MainButton
    tg.MainButton.onClick(() => {
        console.log('🔘 MainButton нажата');
        
        if (cart.length > 0) {
            // Открываем форму заказа
            document.getElementById('checkoutModal').classList.remove('hidden');
        } else {
            showToast('Корзина пуста', 'error');
        }
    });
    
    // Обновляем MainButton при изменении корзины
    updateTelegramMainButton();
}

function updateTelegramMainButton() {
    if (!tg || !tg.MainButton) return;
    
    if (cart.length > 0) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        tg.MainButton.text = `Оформить заказ (${total.toLocaleString()}₽)`;
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
}

// ===========================================
// API FUNCTIONS
// ===========================================

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
    
    const requestOptions = { ...defaultOptions, ...options };
    
    console.log(`🌐 API запрос: ${requestOptions.method} ${url}`);
    
    // Добавляем данные Telegram если доступны
    if (tg && tg.initData) {
        requestOptions.headers['X-Telegram-Init-Data'] = tg.initData;
    }
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
        
        const response = await fetch(url, {
            ...requestOptions,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log(`📡 Ответ API: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Данные получены:', data);
        
        serverConnected = true;
        updateConnectionStatus(true);
        
        return data;
        
    } catch (error) {
        console.error('❌ Ошибка API запроса:', error);
        
        serverConnected = false;
        updateConnectionStatus(false);
        
        throw error;
    }
}

async function loadUserProfile() {
    console.log('👤 Загрузка профиля пользователя...');
    
    if (!currentUser.id) {
        console.warn('⚠️ ID пользователя не найден');
        return;
    }
    
    try {
        const userData = await makeAPIRequest(`${API_CONFIG.ENDPOINTS.USER}/${currentUser.id}`);
        
        // Обновляем данные пользователя
        currentUser.balance = userData.balance || currentUser.balance;
        currentUser.bonus_points = userData.bonus_points || currentUser.bonus_points;
        currentUser.is_admin = userData.is_admin || false;
        
        console.log('✅ Профиль пользователя загружен:', currentUser);
        
    } catch (error) {
        console.warn('⚠️ Не удалось загрузить профиль пользователя, используем локальные данные');
    }
}

async function submitOrder(orderData) {
    console.log('📦 Отправка заказа на сервер...');
    
    // Подготавливаем данные для C# сервера
    const serverOrderData = {
        user_id: currentUser.id,
        user_name: currentUser.first_name,
        user_username: currentUser.username,
        items: orderData.items.map(item => ({
            product_id: item.product_id,
            product_name: appData.products.find(p => p.id === item.product_id)?.name || 'Unknown',
            quantity: item.quantity,
            size: item.size || null,
            price: appData.products.find(p => p.id === item.product_id)?.price || 0
        })),
        total_amount: orderData.total,
        phone: orderData.phone,
        telegram: orderData.telegram,
        address: orderData.address,
        full_name: orderData.full_name,
        order_date: new Date().toISOString(),
        telegram_init_data: tg ? tg.initData : null
    };
    
    console.log('📋 Данные заказа для сервера:', serverOrderData);
    
    try {
        const response = await makeAPIRequest(API_CONFIG.ENDPOINTS.ORDERS, {
            method: 'POST',
            body: JSON.stringify(serverOrderData)
        });
        
        console.log('✅ Заказ успешно отправлен на сервер:', response);
        
        // Сохраняем заказ локально для истории
        const localOrder = {
            id: response.order_id || Date.now(),
            ...orderData,
            status: 'В обработке',
            date: new Date().toISOString().split('T')[0]
        };
        
        appData.orders.push(localOrder);
        saveDataToStorage();
        
        return response;
        
    } catch (error) {
        console.error('❌ Ошибка при отправке заказа:', error);
        
        // Сохраняем заказ локально если сервер недоступен
        const localOrder = {
            id: Date.now(),
            ...orderData,
            status: 'Ожидает отправки',
            date: new Date().toISOString().split('T')[0]
        };
        
        appData.orders.push(localOrder);
        saveDataToStorage();
        
        throw error;
    }
}

function updateConnectionStatus(connected) {
    let indicator = document.querySelector('.connection-status');
    
    if (!indicator) {
        // Создаем индикатор соединения
        indicator = document.createElement('div');
        indicator.className = 'connection-status';
        indicator.style.cssText = `
            position: fixed;
            top: 60px;
            right: 16px;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            z-index: 101;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(indicator);
    }
    
    if (connected) {
        indicator.textContent = '🟢 Онлайн';
        indicator.style.background = 'rgba(var(--color-success-rgb), 0.15)';
        indicator.style.color = 'var(--color-success)';
    } else {
        indicator.textContent = '🔴 Офлайн';
        indicator.style.background = 'rgba(var(--color-error-rgb), 0.15)';
        indicator.style.color = 'var(--color-error)';
    }
}

// ===========================================
// APPLICATION INITIALIZATION
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Запуск приложения...');
    setTimeout(initializeApp, 100); // Небольшая задержка для гарантии загрузки DOM
});

async function initializeApp() {
    console.log('⚙️ Инициализация приложения...');
    
    try {
        // 1. Инициализируем Telegram WebApp
        initializeTelegramWebApp();
        
        // 2. Загружаем данные из localStorage
        loadDataFromStorage();
        
        // 3. Настраиваем UI
        setupNavigation();
        setupModals();
        setupEventListeners();
        
        // 4. Пробуем загрузить данные пользователя с сервера
        try {
            await loadUserProfile();
        } catch (error) {
            console.warn('Продолжаем без сервера');
        }
        
        // 5. Рендерим интерфейс
        renderHomePage();
        renderCategories();
        updateCartBadge();
        updateUserBalance();
        checkAdminAccess();
        
        console.log('✅ Приложение успешно инициализировано');
        
    } catch (error) {
        console.error('❌ Ошибка инициализации приложения:', error);
        showToast('Ошибка при запуске приложения', 'error');
    }
}

function loadDataFromStorage() {
    try {
        const savedCart = localStorage.getItem('shopTG_cart');
        const savedFavorites = localStorage.getItem('shopTG_favorites');
        const savedOrders = localStorage.getItem('shopTG_orders');
        
        if (savedCart) {
            cart = JSON.parse(savedCart);
            console.log('🛒 Корзина загружена из localStorage');
        }
        
        if (savedFavorites) {
            favorites = JSON.parse(savedFavorites);
            console.log('❤️ Избранное загружено из localStorage');
        }
        
        if (savedOrders) {
            appData.orders = JSON.parse(savedOrders);
            console.log('📋 История заказов загружена из localStorage');
        }
        
    } catch (error) {
        console.error('❌ Ошибка загрузки данных из localStorage:', error);
    }
}

function saveDataToStorage() {
    try {
        localStorage.setItem('shopTG_cart', JSON.stringify(cart));
        localStorage.setItem('shopTG_favorites', JSON.stringify(favorites));
        localStorage.setItem('shopTG_orders', JSON.stringify(appData.orders));
        
        console.log('💾 Данные сохранены в localStorage');
        
    } catch (error) {
        console.error('❌ Ошибка сохранения в localStorage:', error);
    }
}

function setupEventListeners() {
    // Price filter
    const priceFilter = document.getElementById('priceFilter');
    const priceValue = document.getElementById('priceValue');
    
    if (priceFilter && priceValue) {
        priceFilter.addEventListener('input', function() {
            priceValue.textContent = this.value + '₽';
            if (currentCategory) {
                renderCategoryProducts(currentCategory);
            }
        });
    }
    
    // Back to categories
    const backToCategories = document.getElementById('backToCategories');
    if (backToCategories) {
        backToCategories.addEventListener('click', resetCatalogView);
    }
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Корзина пуста', 'error');
                return;
            }
            
            // Заполняем форму данными пользователя если доступны
            if (currentUser.username) {
                const telegramField = document.getElementById('telegram');
                if (telegramField) {
                    telegramField.value = '@' + currentUser.username;
                }
            }
            
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const checkoutTotal = document.getElementById('checkoutTotal');
            if (checkoutTotal) {
                checkoutTotal.textContent = total.toLocaleString() + '₽';
            }
            
            const checkoutModal = document.getElementById('checkoutModal');
            if (checkoutModal) {
                checkoutModal.classList.remove('hidden');
            }
        });
    }
    
    // Checkout form
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }
}

async function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Отправляем заказ...';
    }
    
    try {
        const orderData = {
            id: Date.now(),
            user_id: currentUser.id,
            items: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                size: item.size
            })),
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            phone: document.getElementById('phone').value,
            telegram: document.getElementById('telegram').value,
            address: document.getElementById('address').value,
            full_name: document.getElementById('fullName').value
        };
        
        console.log('📝 Подготовлен заказ:', orderData);
        
        // Отправляем заказ на сервер
        try {
            await submitOrder(orderData);
            showToast('Заказ успешно оформлен! Ожидайте уведомление в Telegram.');
        } catch (error) {
            showToast('Заказ сохранен. Будет отправлен при восстановлении связи.', 'warning');
        }
        
        // Очищаем корзину
        cart = [];
        updateCartBadge();
        updateTelegramMainButton();
        saveDataToStorage();
        
        closeModal('checkoutModal');
        
        // Сбрасываем форму
        e.target.reset();
        
        // Переходим в профиль
        showPage('profile');
        updateActiveNavItem('profile');
        
    } catch (error) {
        console.error('❌ Ошибка при оформлении заказа:', error);
        showToast('Ошибка при оформлении заказа. Попробуйте еще раз.', 'error');
        
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Подтвердить заказ';
        }
    }
}

function checkAdminAccess() {
    if (currentUser.is_admin || currentUser.id === 111111111) {
        currentUser.is_admin = true;
        const adminNav = document.getElementById('adminNav');
        if (adminNav) {
            adminNav.classList.remove('hidden');
        }
        console.log('👑 Доступ администратора активирован');
    }
}

// ===========================================
// NAVIGATION
// ===========================================

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            if (page) {
                showPage(page);
                updateActiveNavItem(page);
            }
        });
    });
}

function updateActiveNavItem(pageId) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(nav => nav.classList.remove('active'));
    
    const activeNav = document.querySelector(`[data-page="${pageId}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
}

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
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
    }
}

// ===========================================
// HOME PAGE
// ===========================================

function renderHomePage() {
    const container = document.getElementById('latestProducts');
    if (!container) return;
    
    const latestProducts = appData.products.slice(0, 4);
    
    container.innerHTML = latestProducts.map(product => createProductCard(product)).join('');
}

// ===========================================
// CATALOG
// ===========================================

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
    
    const categoriesList = document.getElementById('categoriesList');
    const categoryProducts = document.getElementById('categoryProducts');
    const backToCategories = document.getElementById('backToCategories');
    
    if (categoriesList) categoriesList.classList.add('hidden');
    if (categoryProducts) categoryProducts.classList.remove('hidden');
    if (backToCategories) backToCategories.classList.remove('hidden');
    
    renderCategoryProducts(categoryId);
}

function renderCategoryProducts(categoryId) {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    const priceFilter = document.getElementById('priceFilter');
    const maxPrice = priceFilter ? parseInt(priceFilter.value) : 50000;
    
    const categoryProducts = appData.products.filter(product => 
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
    const categoriesList = document.getElementById('categoriesList');
    const categoryProducts = document.getElementById('categoryProducts');
    const backToCategories = document.getElementById('backToCategories');
    
    if (categoriesList) categoriesList.classList.remove('hidden');
    if (categoryProducts) categoryProducts.classList.add('hidden');
    if (backToCategories) backToCategories.classList.add('hidden');
    
    currentCategory = null;
}

function createProductCard(product) {
    const inFavorites = favorites.some(fav => fav.id === product.id);
    const outOfStock = !product.in_stock;
    
    return `
        <div class="product-card ${outOfStock ? 'out-of-stock' : ''}" onclick="showProductModal(${product.id})">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-name">${product.name}</div>
            <div class="product-price">${product.price.toLocaleString()}₽</div>
            <div class="product-actions" onclick="event.stopPropagation()">
                <button class="btn btn--primary btn--sm" onclick="addToCart(${product.id})" ${outOfStock ? 'disabled' : ''}>
                    В корзину
                </button>
                <button class="btn-icon ${inFavorites ? 'active' : ''}" onclick="toggleFavorite(${product.id})">
                    ❤️
                </button>
            </div>
        </div>
    `;
}

// ===========================================
// PRODUCT MODAL
// ===========================================

function showProductModal(productId) {
    const product = appData.products.find(p => p.id === productId);
    if (!product) return;
    
    currentProduct = product;
    selectedSize = null;
    
    const modal = document.getElementById('productModal');
    const content = document.getElementById('productModalContent');
    
    if (!modal || !content) return;
    
    const inFavorites = favorites.some(fav => fav.id === product.id);
    const outOfStock = !product.in_stock;
    
    content.innerHTML = `
        <div class="product-detail">
            <img src="${product.image}" alt="${product.name}" class="product-detail-image">
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

// ===========================================
// CART FUNCTIONALITY
// ===========================================

function addToCart(productId, size = null) {
    const product = appData.products.find(p => p.id === productId);
    if (!product || !product.in_stock) return;
    
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
    updateTelegramMainButton();
    saveDataToStorage();
    showToast('Товар добавлен в корзину');
    
    console.log('🛒 Товар добавлен в корзину:', product.name);
}

function removeFromCart(productId, size = null) {
    cart = cart.filter(item => !(item.id === productId && item.size === size));
    updateCartBadge();
    updateTelegramMainButton();
    renderCart();
    saveDataToStorage();
}

function updateCartQuantity(productId, size, newQuantity) {
    const item = cart.find(item => item.id === productId && item.size === size);
    if (!item) return;
    
    if (newQuantity <= 0) {
        removeFromCart(productId, size);
    } else {
        item.quantity = newQuantity;
        updateCartBadge();
        updateTelegramMainButton();
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

function renderCart() {
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
        totalElement.textContent = '0₽';
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image" onclick="showProductModal(${item.id})">
            <div class="cart-item-info">
                <div class="cart-item-name" onclick="showProductModal(${item.id})" style="cursor: pointer;">${item.name}</div>
                ${item.size ? `<div class="cart-item-size">Размер: ${item.size}</div>` : ''}
                <div class="cart-item-price">${(item.price * item.quantity).toLocaleString()}₽</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, '${item.size}', ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, '${item.size}', ${item.quantity + 1})">+</button>
                <button class="btn btn--outline btn--sm" onclick="removeFromCart(${item.id}, '${item.size}')">Удалить</button>
            </div>
        </div>
    `).join('');
    
    totalElement.textContent = total.toLocaleString() + '₽';
}

// ===========================================
// FAVORITES
// ===========================================

function toggleFavorite(productId) {
    const product = appData.products.find(p => p.id === productId);
    if (!product) return;
    
    const existingIndex = favorites.findIndex(fav => fav.id === productId);
    
    if (existingIndex >= 0) {
        favorites.splice(existingIndex, 1);
        showToast('Товар удален из избранного');
    } else {
        favorites.push(product);
        showToast('Товар добавлен в избранное');
    }
    
    saveDataToStorage();
    
    // Update UI
    const activePage = document.querySelector('.page.active');
    if (activePage && activePage.id === 'favorites') {
        renderFavorites();
    }
    
    // Update favorite buttons
    updateFavoriteButtons();
}

function updateFavoriteButtons() {
    document.querySelectorAll('.btn-icon').forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes('toggleFavorite')) {
            const match = onclickAttr.match(/\d+/);
            if (match) {
                const productId = parseInt(match[0]);
                const inFavorites = favorites.some(fav => fav.id === productId);
                btn.classList.toggle('active', inFavorites);
            }
        }
    });
}

function renderFavorites() {
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
}

// ===========================================
// PROFILE
// ===========================================

function renderProfile() {
    const profileBalance = document.getElementById('profileBalance');
    const profileBonus = document.getElementById('profileBonus');
    
    if (profileBalance) {
        profileBalance.textContent = currentUser.balance.toLocaleString() + '₽';
    }
    
    if (profileBonus) {
        profileBonus.textContent = currentUser.bonus_points + ' баллов';
    }
    
    renderOrderHistory();
}

function renderOrderHistory() {
    const container = document.getElementById('orderHistory');
    if (!container) return;
    
    const userOrders = appData.orders.filter(order => order.user_id === currentUser.id);
    
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
                <div class="order-date">${order.date}</div>
            </div>
            <div class="order-total">${order.total.toLocaleString()}₽</div>
            <div class="status status--${getStatusClass(order.status)}">${order.status}</div>
        </div>
    `).join('');
}

function getStatusClass(status) {
    switch(status) {
        case 'В обработке': return 'processing';
        case 'Отправлен': return 'shipped';
        case 'Доставлен': return 'delivered';
        case 'Отменен': return 'cancelled';
        case 'Ожидает отправки': return 'warning';
        default: return 'processing';
    }
}

// ===========================================
// MODAL MANAGEMENT
// ===========================================

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

// ===========================================
// UTILITIES
// ===========================================

function updateUserBalance() {
    const userBalance = document.getElementById('userBalance');
    if (userBalance) {
        userBalance.textContent = `Баланс: ${currentUser.balance.toLocaleString()}₽`;
    }
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

// ===========================================
// ADMIN PANEL (базовая реализация)
// ===========================================

function renderAdminPanel() {
    if (!currentUser.is_admin) return;
    console.log('👑 Открыта админ панель');
}

// ===========================================
// DEMO FEATURES
// ===========================================

// Demo toggle (клик по лого 5 раз для переключения роли)
let logoClickCount = 0;

// Добавляем обработчик после инициализации DOM
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const logo = document.querySelector('.header__logo');
        if (logo) {
            logo.addEventListener('click', () => {
                logoClickCount++;
                if (logoClickCount >= 5) {
                    toggleUserRole();
                    logoClickCount = 0;
                }
            });
        }
    }, 500);
});

function toggleUserRole() {
    currentUser.is_admin = !currentUser.is_admin;
    currentUser.id = currentUser.is_admin ? 111111111 : 123456789;
    
    saveDataToStorage();
    showToast('Роль пользователя изменена');
    checkAdminAccess();
    
    console.log('🔄 Роль изменена:', currentUser.is_admin ? 'Администратор' : 'Пользователь');
}

console.log('✅ app.js загружен и готов к работе с C# сервером');
