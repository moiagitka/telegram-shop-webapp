// ==========================================
// ENHANCED TELEGRAM WEBAPP - SHOPTG PRO - FIXED
// ==========================================

// Configuration
const API_CONFIG = {
    BASE_URL: 'https://71c2a0ff435c.ngrok-free.app',
    ENDPOINTS: {
        USER: '/api/user',
        WEBAPP_DATA: '/api/webapp-data',
        ORDERS: '/api/orders',
        PRODUCTS: '/api/products',
        REVIEWS: '/api/reviews'
    },
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
};

const SHOP_CONFIG = {
    CURRENCY: 'RUB',
    DELIVERY_PRICE: 300,
    FREE_DELIVERY_FROM: 5000,
    LOYALTY_LEVELS: {
        NEWBIE: { name: 'Новичок', minPoints: 0, discount: 0 },
        BRONZE: { name: 'Бронза', minPoints: 100, discount: 5 },
        SILVER: { name: 'Серебро', minPoints: 500, discount: 10 },
        GOLD: { name: 'Золото', minPoints: 1000, discount: 15 },
        PLATINUM: { name: 'Платина', minPoints: 2500, discount: 20 }
    }
};

const ADMIN_USERS = [111111111, 222222222];

// Enhanced product data from JSON
const ENHANCED_PRODUCTS = [
    {
        id: 1,
        name: "iPhone 15 Pro",
        price: 124999,
        originalPrice: 139999,
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
        category_id: 1,
        sizes: ["128GB", "256GB", "512GB", "1TB"],
        colors: ["Титан", "Синий", "Белый", "Черный"],
        in_stock: true,
        description: "Новейший iPhone с процессором A17 Pro и улучшенными камерами",
        rating: 4.8,
        reviewCount: 245,
        discount: 11,
        tags: ["новинка", "хит", "скидка"]
    },
    {
        id: 2,
        name: "MacBook Air M2",
        price: 149999,
        image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop",
        category_id: 2,
        sizes: ["256GB", "512GB", "1TB"],
        colors: ["Серебристый", "Серый космос", "Золотой", "Полночный"],
        in_stock: true,
        description: "Ультратонкий ноутбук с процессором M2 и 18-часовой автономностью",
        rating: 4.9,
        reviewCount: 189,
        discount: 0,
        tags: ["популярный", "производительность"]
    },
    {
        id: 3,
        name: "AirPods Pro 2",
        price: 24999,
        originalPrice: 29999,
        image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop",
        category_id: 3,
        sizes: [],
        colors: ["Белый"],
        in_stock: true,
        description: "Беспроводные наушники с активным шумоподавлением",
        rating: 4.7,
        reviewCount: 356,
        discount: 17,
        tags: ["скидка", "аудио", "хит"]
    },
    {
        id: 4,
        name: "iPad Pro M2",
        price: 89999,
        originalPrice: 99999,
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",
        category_id: 1,
        sizes: ["256GB", "512GB", "1TB"],
        colors: ["Серебристый", "Серый космос"],
        in_stock: true,
        description: "Мощный планшет для профессиональных задач",
        rating: 4.6,
        reviewCount: 128,
        discount: 10,
        tags: ["новинка", "производительность"]
    },
    {
        id: 5,
        name: "Apple Watch Ultra",
        price: 79999,
        image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop",
        category_id: 4,
        sizes: ["44mm", "49mm"],
        colors: ["Титан", "Оранжевый"],
        in_stock: true,
        description: "Самые прочные Apple Watch для экстремальных условий",
        rating: 4.5,
        reviewCount: 89,
        discount: 0,
        tags: ["спорт", "прочность"]
    },
    {
        id: 6,
        name: "HomePod mini",
        price: 12999,
        image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=400&h=400&fit=crop",
        category_id: 3,
        sizes: [],
        colors: ["Белый", "Черный", "Оранжевый", "Синий"],
        in_stock: false,
        description: "Умная колонка с отличным звуком",
        rating: 4.3,
        reviewCount: 67,
        discount: 0,
        tags: ["аудио", "умный дом"]
    }
];

const ENHANCED_CATEGORIES = [
    {
        id: 1,
        name: "Смартфоны",
        icon: "📱",
        color: "#007AFF",
        description: "Последние модели iPhone и Android"
    },
    {
        id: 2,
        name: "Ноутбуки", 
        icon: "💻",
        color: "#34C759",
        description: "MacBook, Windows и игровые ноутбуки"
    },
    {
        id: 3,
        name: "Аудио",
        icon: "🎧", 
        color: "#FF9500",
        description: "Наушники, колонки и аудиосистемы"
    },
    {
        id: 4,
        name: "Гаджеты",
        icon: "⌚",
        color: "#FF2D92",
        description: "Умные часы и аксессуары"
    }
];

const PROMO_CODES = [
    {
        code: "WELCOME10",
        discount: 10,
        description: "Скидка 10% для новых пользователей",
        type: "percentage",
        minAmount: 0
    },
    {
        code: "SAVE500", 
        discount: 500,
        description: "Скидка 500₽ от 5000₽",
        type: "fixed",
        minAmount: 5000
    }
];

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
    is_admin: false,
    loyalty_level: 'NEWBIE'
};

let cart = [];
let favorites = [];
let products = [...ENHANCED_PRODUCTS];
let categories = [...ENHANCED_CATEGORIES];
let orders = [];
let viewHistory = [];
let compareList = [];
let appliedPromoCodes = [];
let productReviews = {};
let chatMessages = [];

let currentCategory = null;
let currentProduct = null;
let selectedSize = null;
let selectedColor = null;
let currentView = 'grid';
let searchQuery = '';
let searchFilters = {
    category: '',
    sort: 'name',
    maxPrice: 200000
};

let serverConnected = false;

// ==========================================
// TELEGRAM WEBAPP INITIALIZATION
// ==========================================

function initializeTelegramWebApp() {
    console.log('🚀 Initializing Enhanced Telegram WebApp...');
    
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
            setupTelegramBackButton();
            
            console.log('✅ User initialized:', currentUser);
            
        } else {
            console.warn('⚠️ Telegram user data not available');
            showEnhancedToast('Не удалось получить данные пользователя Telegram', 'error');
        }
        
    } else {
        console.log('🔧 Development mode - Telegram WebApp API not available');
        isProduction = false;
        
        // Development fallback
        currentUser.id = 221933064;
        currentUser.first_name = 'Test User';
        currentUser.username = 'testuser';
        currentUser.is_admin = true;
        currentUser.bonus_points = 150;
        currentUser.balance = 15000;
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
    
    // Apply Telegram theme colors
    if (tg.themeParams) {
        if (tg.themeParams.bg_color) {
            root.style.setProperty('--tg-bg-color', tg.themeParams.bg_color);
        }
        if (tg.themeParams.text_color) {
            root.style.setProperty('--tg-text-color', tg.themeParams.text_color);
        }
        if (tg.themeParams.button_color) {
            root.style.setProperty('--color-primary', tg.themeParams.button_color);
        }
    }
}

function setupTelegramMainButton() {
    if (!tg?.MainButton) return;
    
    console.log('🔘 Setting up Enhanced MainButton');
    
    tg.MainButton.hide();
    
    tg.MainButton.onClick(() => {
        console.log('🔘 MainButton clicked');
        triggerHaptic('impact', 'medium');
        
        if (cart.length > 0) {
            openCheckoutModal();
        } else {
            showEnhancedToast('Корзина пуста', 'error');
        }
    });
    
    updateTelegramMainButton();
}

function setupTelegramBackButton() {
    if (!tg?.BackButton) return;
    
    tg.BackButton.onClick(() => {
        triggerHaptic('selection');
        const modals = document.querySelectorAll('.modal:not(.hidden)');
        if (modals.length > 0) {
            modals[modals.length - 1].classList.add('hidden');
        } else {
            showPage('home');
            updateActiveNavItem('home');
        }
    });
}

function updateTelegramMainButton() {
    if (!tg?.MainButton) return;
    
    if (cart.length > 0) {
        const total = calculateCartTotal();
        const discount = calculateTotalDiscount();
        const finalTotal = total - discount + (total >= SHOP_CONFIG.FREE_DELIVERY_FROM ? 0 : SHOP_CONFIG.DELIVERY_PRICE);
        
        tg.MainButton.text = `🛒 Оформить заказ (${formatPrice(finalTotal)})`;
        tg.MainButton.color = '#32808D';
        tg.MainButton.textColor = '#FFFFFF';
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
}

function setupHapticFeedback() {
    if (!tg?.HapticFeedback) return;
    console.log('📳 Enhanced haptic feedback available');
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
// APPLICATION INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, starting enhanced app...');
    setTimeout(initializeApp, 100);
});

async function initializeApp() {
    console.log('⚙️ Initializing enhanced application...');
    
    try {
        // Show loading screen
        showLoadingScreen();
        
        // Initialize Telegram WebApp
        initializeTelegramWebApp();
        
        // Load data from localStorage
        loadFromStorage();
        
        // Setup UI
        setupNavigation();
        setupModals();
        setupEventListeners();
        setupSearch();
        
        // Load user profile
        await loadUserProfile();
        
        // Setup admin features if admin
        if (currentUser.is_admin) {
            setupAdminFeatures();
        }
        
        // Initial render
        updateUserInterface();
        renderHomePage();
        updateAllBadges();
        
        // Hide loading screen and show app
        setTimeout(() => {
            hideLoadingScreen();
            showApp();
        }, 2500);
        
        console.log('✅ Enhanced application initialized successfully');
        showEnhancedToast('🎉 Добро пожаловать в ShopTG Pro!', 'success');
        
        // Initialize background features
        initializeRecommendations();
        initializeLoyaltySystem();
        
    } catch (error) {
        console.error('❌ Application initialization failed:', error);
        hideLoadingScreen();
        showEnhancedToast('Ошибка инициализации. Попробуйте перезагрузить страницу.', 'error');
    }
}

function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

function showApp() {
    const app = document.getElementById('app');
    if (app) {
        app.classList.remove('hidden');
    }
}

function loadFromStorage() {
    try {
        const keys = ['cart', 'favorites', 'orders', 'viewHistory', 'compareList', 'appliedPromoCodes', 'productReviews'];
        
        keys.forEach(key => {
            const saved = localStorage.getItem(`shopTG_${key}`);
            if (saved) {
                window[key] = JSON.parse(saved);
            }
        });
        
        console.log('💾 Enhanced data loaded from storage');
        
    } catch (error) {
        console.error('❌ Storage loading error:', error);
    }
}

function saveToStorage() {
    try {
        const data = {
            cart,
            favorites,
            orders,
            viewHistory: viewHistory.slice(-50),
            compareList,
            appliedPromoCodes,
            productReviews
        };
        
        Object.entries(data).forEach(([key, value]) => {
            localStorage.setItem(`shopTG_${key}`, JSON.stringify(value));
        });
        
    } catch (error) {
        console.error('❌ Storage saving error:', error);
    }
}

async function loadUserProfile() {
    console.log('👤 Loading enhanced user profile...');
    
    if (!currentUser.id) {
        console.warn('⚠️ User ID not found');
        return;
    }
    
    try {
        currentUser.balance = 15000;
        currentUser.bonus_points = 350;
        currentUser.loyalty_level = calculateLoyaltyLevel(currentUser.bonus_points);
        
        console.log('✅ Enhanced user profile loaded:', currentUser);
        updateUserInterface();
        
    } catch (error) {
        console.warn('⚠️ Failed to load user profile, using fallback data');
        currentUser.balance = 15000;
        currentUser.bonus_points = 350;
        updateUserInterface();
    }
}

function calculateLoyaltyLevel(points) {
    const levels = Object.entries(SHOP_CONFIG.LOYALTY_LEVELS);
    for (let i = levels.length - 1; i >= 0; i--) {
        const [level, config] = levels[i];
        if (points >= config.minPoints) {
            return level;
        }
    }
    return 'NEWBIE';
}

function initializeRecommendations() {
    setTimeout(() => {
        generateRecommendations();
    }, 1000);
}

function initializeLoyaltySystem() {
    updateLoyaltyDisplay();
}

// ==========================================
// ENHANCED UI SETUP - FIXED
// ==========================================

function setupNavigation() {
    console.log('📱 Setting up enhanced navigation...');
    
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
    
    // Logo click handler
    const logo = document.querySelector('.header__logo');
    if (logo) {
        logo.addEventListener('click', () => {
            showPage('home');
            updateActiveNavItem('home');
        });
    }
    
    console.log('✅ Enhanced navigation setup complete');
}

function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
    }
    
    // Filter inputs
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    const priceRange = document.getElementById('priceRange');
    const priceRangeValue = document.getElementById('priceRangeValue');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleFilterChange);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', handleFilterChange);
    }
    
    if (priceRange && priceRangeValue) {
        priceRange.addEventListener('input', (e) => {
            const value = e.target.value;
            priceRangeValue.textContent = formatPrice(value);
            searchFilters.maxPrice = parseInt(value);
            handleFilterChange();
        });
    }
    
    // Checkout form
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }
    
    // Review form
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }
    
    // Stars rating
    setupStarsRating();
    
    // Chat input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Clear cart button
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
    
    // Checkout button  
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', openCheckoutModal);
    }
}

function setupSearch() {
    // Populate category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="">Все категории</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    }
}

function setupStarsRating() {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            const rating = index + 1;
            updateStarsDisplay(rating);
        });
        
        star.addEventListener('mouseenter', () => {
            highlightStars(index + 1);
        });
    });
    
    const starsContainer = document.getElementById('starsInput');
    if (starsContainer) {
        starsContainer.addEventListener('mouseleave', () => {
            const currentRating = getCurrentRating();
            highlightStars(currentRating);
        });
    }
}

function setupModals() {
    console.log('🪟 Setting up enhanced modals...');
    
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    console.log('✅ Enhanced modals setup complete');
}

function setupAdminFeatures() {
    const adminNav = document.getElementById('adminNav');
    if (adminNav) {
        adminNav.classList.remove('hidden');
    }
    
    console.log('👑 Enhanced admin features enabled');
}

// ==========================================
// ENHANCED SEARCH & FILTERING - FIXED
// ==========================================

function toggleSearchFilters() {
    const filters = document.getElementById('searchFilters');
    if (filters) {
        filters.classList.toggle('hidden');
        triggerHaptic('selection');
    }
}

function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchQuery = searchInput.value.trim().toLowerCase();
    console.log('🔍 Search query:', searchQuery);
    
    updateSearchResults();
    triggerHaptic('selection');
}

function handleFilterChange() {
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (categoryFilter) {
        searchFilters.category = categoryFilter.value;
    }
    
    if (sortFilter) {
        searchFilters.sort = sortFilter.value;
    }
    
    console.log('🎛️ Filters changed:', searchFilters);
    
    updateSearchResults();
    triggerHaptic('selection');
}

function updateSearchResults() {
    let filteredProducts = [...products];
    
    // Apply search query
    if (searchQuery) {
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchQuery) ||
            product.description.toLowerCase().includes(searchQuery) ||
            product.tags?.some(tag => tag.toLowerCase().includes(searchQuery))
        );
    }
    
    // Apply category filter
    if (searchFilters.category) {
        filteredProducts = filteredProducts.filter(product => 
            product.category_id.toString() === searchFilters.category
        );
    }
    
    // Apply price filter
    filteredProducts = filteredProducts.filter(product => 
        product.price <= searchFilters.maxPrice
    );
    
    // Apply sorting
    filteredProducts = sortProducts(filteredProducts, searchFilters.sort);
    
    // Render results
    if (searchQuery || searchFilters.category || searchFilters.maxPrice < 200000) {
        showSearchResults(filteredProducts);
    } else if (currentCategory) {
        renderCategoryProducts(currentCategory);
    } else {
        renderHomePage();
    }
}

function sortProducts(products, sortBy) {
    const sorted = [...products];
    
    switch(sortBy) {
        case 'price-asc':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-desc':
            return sorted.sort((a, b) => b.price - a.price);
        case 'rating':
            return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        case 'discount':
            return sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        case 'name':
        default:
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
}

function showSearchResults(filteredProducts) {
    showPage('catalog');
    updateActiveNavItem('catalog');
    
    const catalogHeader = document.querySelector('#catalog .catalog-header h2');
    if (catalogHeader) {
        catalogHeader.textContent = searchQuery ? 
            `Результаты поиска: "${searchQuery}"` : 
            'Результаты фильтрации';
    }
    
    const categoriesList = document.getElementById('categoriesList');
    const categoryProducts = document.getElementById('categoryProducts');
    const backBtn = document.getElementById('backToCategories');
    
    if (categoriesList) categoriesList.classList.add('hidden');
    if (categoryProducts) categoryProducts.classList.remove('hidden');
    if (backBtn) backBtn.classList.remove('hidden');
    
    renderFilteredProducts(filteredProducts);
}

function renderFilteredProducts(filteredProducts) {
    const container = document.getElementById('productsGrid');
    const countContainer = document.getElementById('productsCount');
    
    if (!container) return;
    
    if (countContainer) {
        countContainer.textContent = `Найдено: ${filteredProducts.length} товаров`;
    }
    
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <p>Товары не найдены</p>
                <button class="btn btn--secondary" onclick="clearSearch()">Очистить поиск</button>
            </div>
        `;
        return;
    }
    
    container.className = `products-grid ${currentView === 'list' ? 'list-view' : ''}`;
    container.innerHTML = filteredProducts.map(product => createEnhancedProductCard(product)).join('');
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const priceRange = document.getElementById('priceRange');
    const priceRangeValue = document.getElementById('priceRangeValue');
    
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (priceRange) {
        priceRange.value = 200000;
        if (priceRangeValue) priceRangeValue.textContent = formatPrice(200000);
    }
    
    searchQuery = '';
    searchFilters = {
        category: '',
        sort: 'name',
        maxPrice: 200000
    };
    
    resetCatalogView();
    showPage('home');
    updateActiveNavItem('home');
    
    triggerHaptic('selection');
}

function setProductView(view) {
    currentView = view;
    
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    const container = document.getElementById('productsGrid');
    if (container) {
        container.className = `products-grid ${view === 'list' ? 'list-view' : ''}`;
    }
    
    triggerHaptic('selection');
}

// ==========================================
// ENHANCED PRODUCT MANAGEMENT - FIXED
// ==========================================

function createEnhancedProductCard(product) {
    const inFavorites = favorites.some(fav => fav.id === product.id);
    const inCompare = compareList.some(item => item.id === product.id);
    const outOfStock = !product.in_stock;
    
    const rating = product.rating || 0;
    const reviewCount = product.reviewCount || 0;
    const stars = '⭐'.repeat(Math.floor(rating));
    
    const originalPrice = product.originalPrice || 0;
    const discount = product.discount || 0;
    
    const tags = product.tags || [];
    
    return `
        <div class="product-card ${outOfStock ? 'out-of-stock' : ''}" onclick="showEnhancedProductModal(${product.id})">
            <div class="product-header">
                <div class="product-name">${product.name}</div>
                ${rating > 0 ? `
                    <div class="product-rating">
                        <span>${stars}</span>
                        <span>${rating}</span>
                        <span>(${reviewCount})</span>
                    </div>
                ` : ''}
            </div>
            
            <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
            
            ${tags.length > 0 ? `
                <div class="product-tags">
                    ${tags.map(tag => `<span class="product-tag ${tag}">${getTagText(tag)}</span>`).join('')}
                </div>
            ` : ''}
            
            <div class="product-price-section">
                <div class="product-price">${formatPrice(product.price)}</div>
                ${originalPrice > 0 ? `
                    <span class="product-original-price">${formatPrice(originalPrice)}</span>
                    <span class="product-discount">-${discount}%</span>
                ` : ''}
            </div>
            
            <div class="product-actions" onclick="event.stopPropagation()">
                <button class="btn btn--primary btn--sm" onclick="addToCartEnhanced(${product.id})" ${outOfStock ? 'disabled' : ''}>
                    ${outOfStock ? '❌ Нет в наличии' : '🛒 В корзину'}
                </button>
                <button class="btn-icon ${inFavorites ? 'active' : ''}" onclick="toggleFavoriteEnhanced(${product.id})" title="Избранное">
                    ❤️
                </button>
                <button class="btn-icon ${inCompare ? 'active' : ''}" onclick="toggleCompare(${product.id})" title="Сравнить">
                    ⚖️
                </button>
            </div>
        </div>
    `;
}

function getTagText(tag) {
    const tagMap = {
        'новинка': '🆕 Новинка',
        'хит': '🔥 Хит',
        'скидка': '💥 Скидка',
        'популярный': '👑 Популярный',
        'производительность': '⚡ Быстрый',
        'аудио': '🎵 Аудио',
        'спорт': '🏃 Спорт',
        'прочность': '💪 Прочный',
        'умный дом': '🏠 Smart'
    };
    return tagMap[tag] || tag;
}

function addToViewHistory(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    viewHistory = viewHistory.filter(item => item.id !== productId);
    
    viewHistory.unshift({
        ...product,
        viewedAt: new Date().toISOString()
    });
    
    viewHistory = viewHistory.slice(0, 20);
    
    saveToStorage();
}

function showEnhancedProductModal(productId) {
    console.log('🪟 Showing enhanced product modal:', productId);
    
    const product = products.find(p => p.id === productId);
    if (!product) {
        console.error('❌ Product not found:', productId);
        return;
    }
    
    addToViewHistory(productId);
    
    currentProduct = product;
    selectedSize = null;
    selectedColor = null;
    
    const modal = document.getElementById('productModal');
    const content = document.getElementById('productModalContent');
    
    if (!modal || !content) {
        console.error('❌ Modal elements not found');
        return;
    }
    
    const inFavorites = favorites.some(fav => fav.id === product.id);
    const inCompare = compareList.some(item => item.id === product.id);
    const outOfStock = !product.in_stock;
    
    const rating = product.rating || 0;
    const reviewCount = product.reviewCount || 0;
    const stars = '⭐'.repeat(Math.floor(rating));
    
    const reviews = productReviews[productId] || [];
    
    content.innerHTML = `
        <div class="product-detail">
            <img src="${product.image}" alt="${product.name}" class="product-detail-image">
            
            <h3 class="product-detail-name">${product.name}</h3>
            
            ${rating > 0 ? `
                <div class="product-detail-rating">
                    <span>${stars} ${rating}</span>
                    <span>(${reviewCount} отзывов)</span>
                </div>
            ` : ''}
            
            <div class="product-detail-price">${formatPrice(product.price)}</div>
            
            <p class="product-detail-description">${product.description}</p>
            
            ${product.colors && product.colors.length > 0 ? `
                <div class="product-colors">
                    <h4>Цвет:</h4>
                    <div class="color-options">
                        ${product.colors.map(color => `
                            <button class="color-option" onclick="selectColor('${color}')">${color}</button>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${product.sizes && product.sizes.length > 0 ? `
                <div class="product-sizes">
                    <h4>Размер:</h4>
                    ${product.sizes.map(size => `
                        <button class="size-option" onclick="selectSize('${size}')">${size}</button>
                    `).join('')}
                </div>
            ` : ''}
            
            <div class="product-detail-actions">
                <button class="btn btn--primary" onclick="addToCartFromModal()" ${outOfStock ? 'disabled' : ''}>
                    ${outOfStock ? '❌ Нет в наличии' : '🛒 Добавить в корзину'}
                </button>
                <button class="btn-icon ${inFavorites ? 'active' : ''}" onclick="toggleFavoriteEnhanced(${product.id})">
                    ❤️
                </button>
                <button class="btn-icon ${inCompare ? 'active' : ''}" onclick="toggleCompare(${product.id})">
                    ⚖️
                </button>
            </div>
            
            <div class="product-reviews">
                <div class="reviews-header">
                    <h4>💬 Отзывы</h4>
                    <button class="btn btn--outline btn--sm" onclick="openReviewModal(${product.id})">
                        ⭐ Оставить отзыв
                    </button>
                </div>
                
                ${reviews.length > 0 ? `
                    <div class="reviews-list">
                        ${reviews.slice(0, 3).map(review => `
                            <div class="review-item">
                                <div class="review-header">
                                    <span class="review-author">${review.author}</span>
                                    <span class="review-rating">${'⭐'.repeat(review.rating)}</span>
                                </div>
                                <p class="review-text">${review.text}</p>
                            </div>
                        `).join('')}
                        ${reviews.length > 3 ? `<p>И еще ${reviews.length - 3} отзывов...</p>` : ''}
                    </div>
                ` : '<p>Пока нет отзывов. Будьте первым!</p>'}
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    triggerHaptic('impact', 'light');
    
    console.log('✅ Enhanced product modal shown');
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

function selectColor(color) {
    selectedColor = color;
    triggerHaptic('selection');
    
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    console.log('🎨 Color selected:', color);
}

function addToCartFromModal() {
    if (!currentProduct) return;
    
    if (currentProduct.sizes && currentProduct.sizes.length > 0 && !selectedSize) {
        showEnhancedToast('Выберите размер', 'warning');
        return;
    }
    
    if (currentProduct.colors && currentProduct.colors.length > 0 && !selectedColor) {
        showEnhancedToast('Выберите цвет', 'warning');
        return;
    }
    
    addToCartEnhanced(currentProduct.id, selectedSize, selectedColor);
    closeModal('productModal');
}

// ==========================================
// ENHANCED CART MANAGEMENT - FIXED
// ==========================================

function addToCartEnhanced(productId, size = null, color = null) {
    console.log('🛒 Adding to enhanced cart:', productId, size, color);
    
    const product = products.find(p => p.id === productId);
    if (!product || !product.in_stock) {
        showEnhancedToast('Товар недоступен', 'error');
        return;
    }
    
    triggerHaptic('impact', 'light');
    
    if ((product.sizes && product.sizes.length > 0 && !size) || 
        (product.colors && product.colors.length > 0 && !color)) {
        showEnhancedProductModal(productId);
        return;
    }
    
    const existingItem = cart.find(item => 
        item.id === productId && 
        (item.size || '') === (size || '') && 
        (item.color || '') === (color || '')
    );
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1,
            size: size,
            color: color,
            addedAt: new Date().toISOString(),
            ...product
        });
    }
    
    updateAllBadges();
    updateTelegramMainButton();
    saveToStorage();
    
    showEnhancedToast(`✅ ${product.name} добавлен в корзину`, 'success');
    awardBonusPoints(1, 'Добавление товара в корзину');
    
    console.log('✅ Enhanced cart updated:', cart);
}

function removeFromCartEnhanced(productId, size = '', color = '') {
    console.log('🗑️ Removing from enhanced cart:', productId, size, color);
    
    triggerHaptic('impact', 'light');
    
    const itemIndex = cart.findIndex(item => 
        item.id === productId && 
        (item.size || '') === size && 
        (item.color || '') === color
    );
    
    if (itemIndex >= 0) {
        const item = cart[itemIndex];
        cart.splice(itemIndex, 1);
        
        updateAllBadges();
        updateTelegramMainButton();
        renderCart();
        saveToStorage();
        
        showEnhancedToast(`🗑️ ${item.name} удален из корзины`, 'info');
    }
}

function updateCartQuantityEnhanced(productId, size, color, newQuantity) {
    const item = cart.find(item => 
        item.id === productId && 
        (item.size || '') === (size || '') && 
        (item.color || '') === (color || '')
    );
    
    if (!item) return;
    
    triggerHaptic('selection');
    
    if (newQuantity <= 0) {
        removeFromCartEnhanced(productId, size, color);
    } else {
        item.quantity = newQuantity;
        updateAllBadges();
        updateTelegramMainButton();
        renderCart();
        saveToStorage();
    }
}

function clearCart() {
    if (cart.length === 0) {
        showEnhancedToast('Корзина уже пуста', 'info');
        return;
    }
    
    triggerHaptic('impact', 'medium');
    
    cart = [];
    updateAllBadges();
    updateTelegramMainButton();
    renderCart();
    saveToStorage();
    
    showEnhancedToast('🗑️ Корзина очищена', 'info');
}

// ==========================================
// PROMO CODE SYSTEM - FIXED
// ==========================================

function applyPromoCode() {
    const input = document.getElementById('promoCodeInput');
    if (!input) return;
    
    const code = input.value.trim().toUpperCase();
    if (!code) {
        showEnhancedToast('Введите промокод', 'warning');
        return;
    }
    
    if (appliedPromoCodes.some(promo => promo.code === code)) {
        showEnhancedToast('Промокод уже применен', 'warning');
        return;
    }
    
    const promoCode = PROMO_CODES.find(promo => promo.code === code);
    if (!promoCode) {
        showEnhancedToast('Неверный промокод', 'error');
        return;
    }
    
    const cartTotal = calculateCartTotal();
    
    if (cartTotal < promoCode.minAmount) {
        showEnhancedToast(`Минимальная сумма заказа для этого промокода: ${formatPrice(promoCode.minAmount)}`, 'warning');
        return;
    }
    
    appliedPromoCodes.push(promoCode);
    input.value = '';
    
    triggerHaptic('notification', 'success');
    showEnhancedToast(`✅ Промокод "${code}" применен!`, 'success');
    
    renderCart();
    updateTelegramMainButton();
    saveToStorage();
    
    awardBonusPoints(5, 'Использование промокода');
}

function removePromoCode(code) {
    appliedPromoCodes = appliedPromoCodes.filter(promo => promo.code !== code);
    
    triggerHaptic('selection');
    showEnhancedToast(`Промокод "${code}" удален`, 'info');
    
    renderCart();
    updateTelegramMainButton();
    saveToStorage();
}

function calculateTotalDiscount() {
    const cartTotal = calculateCartTotal();
    let totalDiscount = 0;
    
    appliedPromoCodes.forEach(promo => {
        if (promo.type === 'percentage') {
            totalDiscount += (cartTotal * promo.discount) / 100;
        } else if (promo.type === 'fixed') {
            totalDiscount += promo.discount;
        }
    });
    
    const loyaltyLevel = SHOP_CONFIG.LOYALTY_LEVELS[currentUser.loyalty_level];
    if (loyaltyLevel && loyaltyLevel.discount > 0) {
        totalDiscount += (cartTotal * loyaltyLevel.discount) / 100;
    }
    
    return Math.min(totalDiscount, cartTotal);
}

function openPromoModal() {
    const modal = document.getElementById('promoModal');
    if (modal) {
        modal.classList.remove('hidden');
        triggerHaptic('impact', 'light');
    }
}

function copyPromoCode(code) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(() => {
            showEnhancedToast(`📋 Промокод "${code}" скопирован`, 'success');
            triggerHaptic('impact', 'light');
        });
    } else {
        const input = document.getElementById('promoCodeInput');
        if (input) {
            input.value = code;
            showEnhancedToast(`Промокод "${code}" вставлен`, 'success');
        }
    }
    
    closeModal('promoModal');
}

// ==========================================
// FAVORITES & COMPARISON - FIXED
// ==========================================

function toggleFavoriteEnhanced(productId) {
    console.log('❤️ Toggling enhanced favorite:', productId);
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    triggerHaptic('impact', 'light');
    
    const existingIndex = favorites.findIndex(fav => fav.id === productId);
    
    if (existingIndex >= 0) {
        favorites.splice(existingIndex, 1);
        showEnhancedToast(`💔 ${product.name} удален из избранного`, 'info');
    } else {
        favorites.push({
            ...product,
            addedAt: new Date().toISOString()
        });
        showEnhancedToast(`❤️ ${product.name} добавлен в избранное`, 'success');
        awardBonusPoints(2, 'Добавление в избранное');
    }
    
    updateAllBadges();
    updateFavoriteButtons();
    saveToStorage();
    
    const activePage = document.querySelector('.page.active');
    if (activePage?.id === 'favorites') {
        renderFavorites();
    }
}

function clearFavorites() {
    if (favorites.length === 0) {
        showEnhancedToast('Избранное уже пусто', 'info');
        return;
    }
    
    triggerHaptic('impact', 'medium');
    
    favorites = [];
    updateAllBadges();
    updateFavoriteButtons();
    renderFavorites();
    saveToStorage();
    
    showEnhancedToast('💔 Избранное очищено', 'info');
}

function toggleCompare(productId) {
    console.log('⚖️ Toggling comparison:', productId);
    
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    triggerHaptic('impact', 'light');
    
    const existingIndex = compareList.findIndex(item => item.id === productId);
    
    if (existingIndex >= 0) {
        compareList.splice(existingIndex, 1);
        showEnhancedToast(`⚖️ ${product.name} удален из сравнения`, 'info');
    } else {
        if (compareList.length >= 4) {
            showEnhancedToast('Максимум 4 товара для сравнения', 'warning');
            return;
        }
        
        compareList.push({
            ...product,
            addedAt: new Date().toISOString()
        });
        showEnhancedToast(`⚖️ ${product.name} добавлен к сравнению`, 'success');
    }
    
    updateCompareButtons();
    saveToStorage();
    
    const activePage = document.querySelector('.page.active');
    if (activePage?.id === 'compare') {
        renderComparison();
    }
}

function clearComparison() {
    if (compareList.length === 0) {
        showEnhancedToast('Список сравнения пуст', 'info');
        return;
    }
    
    triggerHaptic('impact', 'medium');
    
    compareList = [];
    updateCompareButtons();
    renderComparison();
    saveToStorage();
    
    showEnhancedToast('⚖️ Список сравнения очищен', 'info');
}

function clearHistory() {
    if (viewHistory.length === 0) {
        showEnhancedToast('История просмотров пуста', 'info');
        return;
    }
    
    triggerHaptic('impact', 'medium');
    
    viewHistory = [];
    renderHistory();
    saveToStorage();
    
    showEnhancedToast('🕒 История просмотров очищена', 'info');
}

// ==========================================
// REVIEWS SYSTEM - FIXED
// ==========================================

function openReviewModal(productId) {
    currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return;
    
    const modal = document.getElementById('reviewModal');
    if (modal) {
        const form = document.getElementById('reviewForm');
        if (form) form.reset();
        
        resetStarsDisplay();
        
        modal.classList.remove('hidden');
        triggerHaptic('impact', 'light');
    }
}

function handleReviewSubmit(e) {
    e.preventDefault();
    
    const rating = getCurrentRating();
    const text = document.getElementById('reviewText').value.trim();
    
    if (rating === 0) {
        showEnhancedToast('Поставьте оценку', 'warning');
        return;
    }
    
    if (!text) {
        showEnhancedToast('Напишите отзыв', 'warning');
        return;
    }
    
    const review = {
        id: Date.now(),
        productId: currentProduct.id,
        author: currentUser.first_name || 'Аноним',
        rating: rating,
        text: text,
        date: new Date().toISOString()
    };
    
    if (!productReviews[currentProduct.id]) {
        productReviews[currentProduct.id] = [];
    }
    
    productReviews[currentProduct.id].unshift(review);
    saveToStorage();
    
    triggerHaptic('notification', 'success');
    showEnhancedToast('⭐ Спасибо за отзыв!', 'success');
    
    awardBonusPoints(10, 'Написание отзыва');
    
    closeModal('reviewModal');
    
    const productModal = document.getElementById('productModal');
    if (productModal && !productModal.classList.contains('hidden')) {
        showEnhancedProductModal(currentProduct.id);
    }
}

function updateStarsDisplay(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function highlightStars(rating) {
    updateStarsDisplay(rating);
}

function getCurrentRating() {
    const activeStars = document.querySelectorAll('.star.active');
    return activeStars.length;
}

function resetStarsDisplay() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => star.classList.remove('active'));
}

// ==========================================
// LOYALTY & BONUS SYSTEM - FIXED
// ==========================================

function awardBonusPoints(points, reason) {
    currentUser.bonus_points += points;
    
    const oldLevel = currentUser.loyalty_level;
    currentUser.loyalty_level = calculateLoyaltyLevel(currentUser.bonus_points);
    
    if (oldLevel !== currentUser.loyalty_level) {
        const levelConfig = SHOP_CONFIG.LOYALTY_LEVELS[currentUser.loyalty_level];
        showEnhancedNotification(
            `🎉 Поздравляем! Новый статус: ${levelConfig.name}`,
            `Теперь вам доступна скидка ${levelConfig.discount}%`,
            'success'
        );
        triggerHaptic('notification', 'success');
    }
    
    updateUserInterface();
    updateLoyaltyDisplay();
    
    console.log(`⭐ Awarded ${points} bonus points for: ${reason}`);
}

function updateLoyaltyDisplay() {
    const loyaltyStatus = document.getElementById('loyaltyStatus');
    if (loyaltyStatus) {
        const levelConfig = SHOP_CONFIG.LOYALTY_LEVELS[currentUser.loyalty_level];
        loyaltyStatus.innerHTML = `
            <span class="loyalty-icon">👑</span>
            <span>Статус: ${levelConfig.name}</span>
        `;
    }
}

// ==========================================
// SUPPORT CHAT SYSTEM - FIXED
// ==========================================

function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    addChatMessage(message, 'user');
    input.value = '';
    
    triggerHaptic('impact', 'light');
    
    setTimeout(() => {
        const responses = [
            'Спасибо за ваше сообщение! Мы рассмотрим его в ближайшее время.',
            'Здравствуйте! Чем могу помочь?',
            'Для срочных вопросов обращайтесь по телефону +7 (800) 123-45-67',
            'Ваш заказ обрабатывается. Ожидайте уведомления в Telegram.'
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addChatMessage(randomResponse, 'support');
    }, 1500);
}

function addChatMessage(text, type) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    const message = document.createElement('div');
    message.className = `chat-message ${type}`;
    message.textContent = text;
    
    container.appendChild(message);
    container.scrollTop = container.scrollHeight;
    
    chatMessages.push({
        text: text,
        type: type,
        timestamp: new Date().toISOString()
    });
    
    saveToStorage();
}

function showOrderTracking() {
    showEnhancedToast('📦 Функция отслеживания заказов скоро будет доступна', 'info');
}

function showFAQ() {
    const faqText = `Часто задаваемые вопросы:

❓ Как оформить заказ?
✅ Добавьте товары в корзину и нажмите "Оформить заказ"

❓ Сколько стоит доставка?
✅ 300₽, бесплатно от 5000₽

❓ Как использовать промокод?
✅ Введите код в корзине и нажмите "Применить"

❓ Как накопить бонусы?
✅ Делайте покупки, оставляйте отзывы, добавляйте в избранное`;
    
    addChatMessage(faqText, 'support');
}

// Make functions available globally for onclick handlers
window.showCategoryProducts = showCategoryProducts;
window.showEnhancedProductModal = showEnhancedProductModal;
window.addToCartEnhanced = addToCartEnhanced;
window.toggleFavoriteEnhanced = toggleFavoriteEnhanced;
window.toggleCompare = toggleCompare;
window.removeFromCartEnhanced = removeFromCartEnhanced;
window.updateCartQuantityEnhanced = updateCartQuantityEnhanced;
window.clearCart = clearCart;
window.clearFavorites = clearFavorites;
window.clearComparison = clearComparison;
window.clearHistory = clearHistory;
window.clearSearch = clearSearch;
window.setProductView = setProductView;
window.resetCatalogView = resetCatalogView;
window.openCheckoutModal = openCheckoutModal;
window.openPromoModal = openPromoModal;
window.copyPromoCode = copyPromoCode;
window.applyPromoCode = applyPromoCode;
window.removePromoCode = removePromoCode;
window.openReviewModal = openReviewModal;
window.selectSize = selectSize;
window.selectColor = selectColor;
window.addToCartFromModal = addToCartFromModal;
window.sendMessage = sendMessage;
window.showOrderTracking = showOrderTracking;
window.showFAQ = showFAQ;
window.switchAdminTab = switchAdminTab;
window.loadAdminData = loadAdminData;
window.toggleSearchFilters = toggleSearchFilters;

// ==========================================
// ENHANCED UI FUNCTIONS - FIXED
// ==========================================

function showPage(pageId) {
    console.log('📄 Showing enhanced page:', pageId);
    
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
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
            case 'compare':
                renderComparison();
                break;
            case 'history':
                renderHistory();
                break;
            case 'support':
                renderSupport();
                break;
            case 'profile':
                renderProfile();
                break;
            case 'admin':
                renderAdminPanel();
                break;
        }
        
        console.log('✅ Enhanced page shown:', pageId);
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

function updateUserInterface() {
    const welcomeTitle = document.getElementById('welcomeTitle');
    const welcomeSubtitle = document.getElementById('welcomeSubtitle');
    
    if (welcomeTitle) {
        const timeOfDay = getTimeOfDay();
        welcomeTitle.textContent = `${timeOfDay}, ${currentUser.first_name || 'Пользователь'}!`;
    }
    
    if (welcomeSubtitle) {
        welcomeSubtitle.textContent = 'Откройте для себя премиальные товары';
    }
    
    const userBalance = document.getElementById('userBalance');
    if (userBalance) {
        const balanceAmount = userBalance.querySelector('.balance-amount');
        if (balanceAmount) {
            balanceAmount.textContent = formatPrice(currentUser.balance);
        }
    }
    
    const pointsAmount = document.getElementById('pointsAmount');
    if (pointsAmount) {
        pointsAmount.textContent = currentUser.bonus_points;
    }
    
    const userName = document.getElementById('userName');
    const userTelegram = document.getElementById('userTelegram');
    const profileBalance = document.getElementById('profileBalance');
    const profileBonus = document.getElementById('profileBonus');
    const ordersCount = document.getElementById('ordersCount');
    
    if (userName) {
        userName.textContent = `${currentUser.first_name} ${currentUser.last_name}`.trim() || 'Пользователь';
    }
    if (userTelegram) {
        userTelegram.textContent = currentUser.username ? `@${currentUser.username}` : 'Не указан';
    }
    if (profileBalance) {
        profileBalance.textContent = formatPrice(currentUser.balance);
    }
    if (profileBonus) {
        profileBonus.textContent = currentUser.bonus_points;
    }
    if (ordersCount) {
        ordersCount.textContent = orders.filter(order => order.user_id === currentUser.id).length;
    }
}

function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 6) return '🌙 Доброй ночи';
    if (hour < 12) return '🌅 Доброе утро';
    if (hour < 18) return '☀️ Добрый день';
    return '🌆 Добрый вечер';
}

function updateAllBadges() {
    updateCartBadge();
    updateFavoritesBadge();
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

function updateFavoritesBadge() {
    const badge = document.getElementById('favoritesBadge');
    if (!badge) return;
    
    if (favorites.length > 0) {
        badge.textContent = favorites.length;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function updateFavoriteButtons() {
    document.querySelectorAll('.btn-icon').forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr?.includes('toggleFavoriteEnhanced')) {
            const match = onclickAttr.match(/\d+/);
            if (match) {
                const productId = parseInt(match[0]);
                const inFavorites = favorites.some(fav => fav.id === productId);
                btn.classList.toggle('active', inFavorites);
            }
        }
    });
}

function updateCompareButtons() {
    document.querySelectorAll('.btn-icon').forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr?.includes('toggleCompare')) {
            const match = onclickAttr.match(/\d+/);
            if (match) {
                const productId = parseInt(match[0]);
                const inCompare = compareList.some(item => item.id === productId);
                btn.classList.toggle('active', inCompare);
            }
        }
    });
}

// ==========================================
// ENHANCED RENDERING FUNCTIONS - FIXED
// ==========================================

function renderHomePage() {
    console.log('🏠 Rendering enhanced home page...');
    
    const featuredContainer = document.getElementById('featuredProducts');
    const recommendedContainer = document.getElementById('recommendedProducts');
    const categoriesContainer = document.getElementById('categoriesPreview');
    
    if (featuredContainer) {
        const featuredProducts = products
            .filter(p => p.in_stock)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 6);
        
        if (featuredProducts.length > 0) {
            featuredContainer.innerHTML = featuredProducts.map(product => createEnhancedProductCard(product)).join('');
        } else {
            featuredContainer.innerHTML = '<div class="loading">Загрузка товаров...</div>';
        }
    }
    
    if (recommendedContainer) {
        const recommendations = generateRecommendations().slice(0, 4);
        if (recommendations.length > 0) {
            recommendedContainer.innerHTML = recommendations.map(product => createEnhancedProductCard(product)).join('');
        } else {
            recommendedContainer.innerHTML = '<div class="loading">Генерируем рекомендации...</div>';
        }
    }
    
    if (categoriesContainer) {
        categoriesContainer.innerHTML = categories.map(category => `
            <div class="category-card" onclick="showCategoryProducts(${category.id})">
                <div class="category-icon">${category.icon}</div>
                <div class="category-name">${category.name}</div>
            </div>
        `).join('');
    }
    
    console.log('✅ Enhanced home page rendered');
}

function generateRecommendations() {
    let recommendations = [];
    
    const viewedCategories = [...new Set(viewHistory.map(item => item.category_id))];
    const favoriteCategories = [...new Set(favorites.map(item => item.category_id))];
    const relevantCategories = [...new Set([...viewedCategories, ...favoriteCategories])];
    
    if (relevantCategories.length > 0) {
        recommendations = products.filter(product => 
            relevantCategories.includes(product.category_id) && 
            product.in_stock &&
            !viewHistory.some(viewed => viewed.id === product.id)
        );
    }
    
    if (recommendations.length < 4) {
        const additionalProducts = products
            .filter(p => p.in_stock && !recommendations.some(r => r.id === p.id))
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 4 - recommendations.length);
        
        recommendations = [...recommendations, ...additionalProducts];
    }
    
    return recommendations;
}

function renderCategories() {
    console.log('📦 Rendering enhanced categories...');
    
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
            <div class="category-description">${category.description}</div>
        </div>
    `).join('');
    
    console.log('✅ Enhanced categories rendered');
}

function showCategoryProducts(categoryId) {
    console.log('📂 Showing enhanced category products:', categoryId);
    
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
    const countContainer = document.getElementById('productsCount');
    
    if (!container) return;
    
    const categoryProducts = products.filter(product => product.category_id === categoryId);
    
    if (countContainer) {
        countContainer.textContent = `Товаров в категории: ${categoryProducts.length}`;
    }
    
    if (categoryProducts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <p>Товары в категории не найдены</p>
            </div>
        `;
        return;
    }
    
    container.className = `products-grid ${currentView === 'list' ? 'list-view' : ''}`;
    container.innerHTML = categoryProducts.map(product => createEnhancedProductCard(product)).join('');
}

function resetCatalogView() {
    console.log('🔄 Resetting enhanced catalog view...');
    
    const categoriesList = document.getElementById('categoriesList');
    const categoryProducts = document.getElementById('categoryProducts');
    const backBtn = document.getElementById('backToCategories');
    const catalogHeader = document.querySelector('#catalog .catalog-header h2');
    
    if (categoriesList) categoriesList.classList.remove('hidden');
    if (categoryProducts) categoryProducts.classList.add('hidden');
    if (backBtn) backBtn.classList.add('hidden');
    if (catalogHeader) catalogHeader.textContent = 'Каталог товаров';
    
    currentCategory = null;
}

function renderCart() {
    console.log('🛒 Rendering enhanced cart...');
    
    const container = document.getElementById('cartItems');
    const summaryContainer = document.getElementById('cartSummary');
    const clearBtn = document.getElementById('clearCartBtn');
    
    if (!container) return;
    
    if (clearBtn) {
        clearBtn.style.display = cart.length > 0 ? 'block' : 'none';
    }
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <p>Корзина пуста</p>
                <button class="btn btn--primary" onclick="showPage('catalog'); updateActiveNavItem('catalog');">
                    Перейти к покупкам
                </button>
            </div>
        `;
        
        if (summaryContainer) {
            summaryContainer.style.display = 'none';
        }
        return;
    }
    
    if (summaryContainer) {
        summaryContainer.style.display = 'block';
    }
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image" onclick="showEnhancedProductModal(${item.id})">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                ${item.size ? `<div class="cart-item-size">Размер: ${item.size}</div>` : ''}
                ${item.color ? `<div class="cart-item-size">Цвет: ${item.color}</div>` : ''}
                <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateCartQuantityEnhanced(${item.id}, '${item.size || ''}', '${item.color || ''}', ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartQuantityEnhanced(${item.id}, '${item.size || ''}', '${item.color || ''}', ${item.quantity + 1})">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCartEnhanced(${item.id}, '${item.size || ''}', '${item.color || ''}')">Удалить</button>
            </div>
        </div>
    `).join('');
    
    renderCartSummary();
    
    console.log('✅ Enhanced cart rendered');
}

function renderCartSummary() {
    const itemsTotal = calculateCartTotal();
    const discount = calculateTotalDiscount();
    const deliveryCost = itemsTotal >= SHOP_CONFIG.FREE_DELIVERY_FROM ? 0 : SHOP_CONFIG.DELIVERY_PRICE;
    const finalTotal = itemsTotal - discount + deliveryCost;
    
    const itemsTotalEl = document.getElementById('itemsTotal');
    const discountAmountEl = document.getElementById('discountAmount');
    const discountRowEl = document.getElementById('discountRow');
    const deliveryAmountEl = document.getElementById('deliveryAmount');
    const cartTotalEl = document.getElementById('cartTotal');
    
    if (itemsTotalEl) itemsTotalEl.textContent = formatPrice(itemsTotal);
    if (deliveryAmountEl) {
        deliveryAmountEl.textContent = deliveryCost > 0 ? formatPrice(deliveryCost) : 'Бесплатно';
    }
    if (cartTotalEl) cartTotalEl.textContent = formatPrice(finalTotal);
    
    if (discount > 0) {
        if (discountAmountEl) discountAmountEl.textContent = `-${formatPrice(discount)}`;
        if (discountRowEl) discountRowEl.style.display = 'flex';
    } else {
        if (discountRowEl) discountRowEl.style.display = 'none';
    }
    
    const activePromosContainer = document.getElementById('activePromos');
    if (activePromosContainer) {
        if (appliedPromoCodes.length > 0) {
            activePromosContainer.innerHTML = appliedPromoCodes.map(promo => `
                <div class="active-promo">
                    <span>📁 ${promo.code}: ${promo.description}</span>
                    <button class="active-promo-remove" onclick="removePromoCode('${promo.code}')">✕</button>
                </div>
            `).join('');
        } else {
            activePromosContainer.innerHTML = '';
        }
    }
}

function calculateCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function renderFavorites() {
    console.log('❤️ Rendering enhanced favorites...');
    
    const container = document.getElementById('favoritesItems');
    if (!container) return;
    
    if (favorites.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❤️</div>
                <p>Нет избранных товаров</p>
                <button class="btn btn--primary" onclick="showPage('catalog'); updateActiveNavItem('catalog');">
                    Найти товары
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = favorites.map(product => createEnhancedProductCard(product)).join('');
    console.log('✅ Enhanced favorites rendered');
}

function renderComparison() {
    console.log('⚖️ Rendering enhanced comparison...');
    
    const container = document.getElementById('compareItems');
    const clearBtn = document.getElementById('clearCompareBtn');
    
    if (!container) return;
    
    if (clearBtn) {
        clearBtn.style.display = compareList.length > 0 ? 'block' : 'none';
    }
    
    if (compareList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚖️</div>
                <p>Нет товаров для сравнения</p>
                <p>Добавьте товары через кнопку "⚖️" на карточке товара</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = compareList.map(product => `
        <div class="compare-item">
            <button class="compare-remove" onclick="toggleCompare(${product.id})">✕</button>
            <img src="${product.image}" alt="${product.name}" class="compare-image">
            <h4>${product.name}</h4>
            <div class="compare-price">${formatPrice(product.price)}</div>
            ${product.rating ? `<div>⭐ ${product.rating}</div>` : ''}
            <div class="compare-features">
                <div class="compare-feature">
                    <span>Категория:</span>
                    <span>${categories.find(c => c.id === product.category_id)?.name || 'Неизвестно'}</span>
                </div>
                ${product.sizes && product.sizes.length > 0 ? `
                    <div class="compare-feature">
                        <span>Размеры:</span>
                        <span>${product.sizes.join(', ')}</span>
                    </div>
                ` : ''}
                ${product.colors && product.colors.length > 0 ? `
                    <div class="compare-feature">
                        <span>Цвета:</span>
                        <span>${product.colors.join(', ')}</span>
                    </div>
                ` : ''}
            </div>
            <button class="btn btn--primary btn--sm" onclick="addToCartEnhanced(${product.id})" ${!product.in_stock ? 'disabled' : ''}>
                ${!product.in_stock ? 'Нет в наличии' : 'В корзину'}
            </button>
        </div>
    `).join('');
    
    console.log('✅ Enhanced comparison rendered');
}

function renderHistory() {
    console.log('🕒 Rendering enhanced history...');
    
    const container = document.getElementById('historyItems');
    if (!container) return;
    
    if (viewHistory.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🕒</div>
                <p>История просмотров пуста</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = viewHistory.map(product => createEnhancedProductCard(product)).join('');
    console.log('✅ Enhanced history rendered');
}

function renderSupport() {
    console.log('💬 Rendering enhanced support...');
    
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    if (chatMessages.length === 0) {
        addChatMessage('Здравствуйте! Чем могу помочь? Задайте свой вопрос или воспользуйтесь быстрыми действиями ниже.', 'support');
    } else {
        messagesContainer.innerHTML = chatMessages.map(msg => `
            <div class="chat-message ${msg.type}">
                ${msg.text}
            </div>
        `).join('');
    }
    
    console.log('✅ Enhanced support rendered');
}

function renderProfile() {
    console.log('👤 Rendering enhanced profile...');
    
    updateUserInterface();
    updateLoyaltyDisplay();
    renderOrderHistory();
    
    console.log('✅ Enhanced profile rendered');
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
            <div class="order-actions">
                <button class="btn btn--outline btn--sm" onclick="openReviewModal(${order.items?.[0]?.product_id || 0})">
                    ⭐ Отзыв
                </button>
            </div>
        </div>
    `).join('');
}

function renderAdminPanel() {
    if (!currentUser.is_admin) return;
    
    console.log('👑 Rendering enhanced admin panel...');
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

function switchAdminTab(tab) {
    const tabs = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.admin-section');
    
    tabs.forEach(t => t.classList.remove('active'));
    sections.forEach(s => s.classList.add('hidden'));
    
    const activeTab = document.getElementById(`admin${tab.charAt(0).toUpperCase() + tab.slice(1)}Tab`);
    const activeSection = document.getElementById(`admin${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
    
    if (activeTab) activeTab.classList.add('active');
    if (activeSection) activeSection.classList.remove('hidden');
    
    if (tab === 'stats') {
        updateAdminStats();
    }
    
    triggerHaptic('selection');
}

function updateAdminStats() {
    const totalOrders = document.getElementById('totalOrders');
    const totalRevenue = document.getElementById('totalRevenue');
    
    if (totalOrders) {
        totalOrders.textContent = orders.length;
    }
    
    if (totalRevenue) {
        const revenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        totalRevenue.textContent = formatPrice(revenue);
    }
}

function loadAdminData() {
    showEnhancedToast('🔄 Обновление данных...', 'info');
    
    setTimeout(() => {
        renderAdminOrders();
        updateAdminStats();
        showEnhancedToast('✅ Данные обновлены', 'success');
    }, 1000);
}

// ==========================================
// CHECKOUT PROCESS - FIXED
// ==========================================

function openCheckoutModal() {
    console.log('💳 Opening enhanced checkout modal...');
    
    if (cart.length === 0) {
        showEnhancedToast('Корзина пуста', 'error');
        return;
    }
    
    const telegramField = document.getElementById('telegram');
    const fullNameField = document.getElementById('fullName');
    
    if (telegramField && currentUser.username) {
        telegramField.value = `@${currentUser.username}`;
    }
    if (fullNameField && currentUser.first_name) {
        fullNameField.value = `${currentUser.first_name} ${currentUser.last_name}`.trim();
    }
    
    renderCheckoutSummary();
    
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.classList.remove('hidden');
        triggerHaptic('impact', 'light');
        console.log('✅ Enhanced checkout modal opened');
    }
}

function renderCheckoutSummary() {
    const checkoutItems = document.getElementById('checkoutItems');
    const checkoutItemsTotal = document.getElementById('checkoutItemsTotal');
    const checkoutDiscountAmount = document.getElementById('checkoutDiscountAmount');
    const checkoutDiscountRow = document.getElementById('checkoutDiscountRow');
    const checkoutDeliveryAmount = document.getElementById('checkoutDeliveryAmount');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    const itemsTotal = calculateCartTotal();
    const discount = calculateTotalDiscount();
    const deliveryCost = itemsTotal >= SHOP_CONFIG.FREE_DELIVERY_FROM ? 0 : SHOP_CONFIG.DELIVERY_PRICE;
    const finalTotal = itemsTotal - discount + deliveryCost;
    
    if (checkoutItems) {
        checkoutItems.innerHTML = cart.map(item => `
            <div class="checkout-item">
                <span>${item.name} ${item.size ? `(${item.size})` : ''} ${item.color ? `(${item.color})` : ''} x${item.quantity}</span>
                <span>${formatPrice(item.price * item.quantity)}</span>
            </div>
        `).join('');
    }
    
    if (checkoutItemsTotal) checkoutItemsTotal.textContent = formatPrice(itemsTotal);
    if (checkoutDeliveryAmount) {
        checkoutDeliveryAmount.textContent = deliveryCost > 0 ? formatPrice(deliveryCost) : 'Бесплатно';
    }
    if (checkoutTotal) checkoutTotal.textContent = formatPrice(finalTotal);
    
    if (discount > 0) {
        if (checkoutDiscountAmount) checkoutDiscountAmount.textContent = `-${formatPrice(discount)}`;
        if (checkoutDiscountRow) checkoutDiscountRow.style.display = 'flex';
    } else {
        if (checkoutDiscountRow) checkoutDiscountRow.style.display = 'none';
    }
}

async function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitOrderBtn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnLoading = submitBtn?.querySelector('.btn-loading');
    
    if (submitBtn) {
        submitBtn.disabled = true;
        if (btnText) btnText.style.opacity = '0';
        if (btnLoading) btnLoading.classList.remove('hidden');
    }
    
    try {
        triggerHaptic('impact', 'heavy');
        
        if (cart.length === 0) {
            throw new Error('Корзина пуста');
        }
        
        const itemsTotal = calculateCartTotal();
        const discount = calculateTotalDiscount();
        const deliveryCost = itemsTotal >= SHOP_CONFIG.FREE_DELIVERY_FROM ? 0 : SHOP_CONFIG.DELIVERY_PRICE;
        const finalTotal = itemsTotal - discount + deliveryCost;
        
        const orderData = {
            id: Date.now(),
            user_id: currentUser.id,
            items: cart.map(item => ({
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                size: item.size || null,
                color: item.color || null,
                price: item.price
            })),
            total: finalTotal,
            discount: discount,
            delivery_cost: deliveryCost,
            applied_promo_codes: appliedPromoCodes,
            phone: document.getElementById('phone').value.trim(),
            telegram: document.getElementById('telegram').value.trim(),
            address: document.getElementById('address').value.trim(),
            full_name: document.getElementById('fullName').value.trim(),
            comment: document.getElementById('orderComment').value.trim(),
            status: 'В обработке',
            date: new Date().toISOString().split('T')[0]
        };
        
        if (!orderData.phone || !orderData.address || !orderData.full_name) {
            throw new Error('Заполните все обязательные поля');
        }
        
        console.log('📝 Enhanced order prepared:', orderData);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        orders.push(orderData);
        
        const pointsAwarded = Math.floor(finalTotal / 100);
        awardBonusPoints(pointsAwarded, 'Оформление заказа');
        
        triggerHaptic('notification', 'success');
        showEnhancedNotification(
            '🎉 Заказ успешно оформлен!',
            `Заказ #${orderData.id} принят в обработку. Ожидайте уведомление в Telegram.`,
            'success'
        );
        
        cart = [];
        appliedPromoCodes = [];
        updateAllBadges();
        updateTelegramMainButton();
        saveToStorage();
        
        closeModal('checkoutModal');
        showPage('profile');
        updateActiveNavItem('profile');
        renderProfile();
        
        e.target.reset();
        
    } catch (error) {
        console.error('❌ Enhanced order submission error:', error);
        triggerHaptic('notification', 'error');
        showEnhancedToast(error.message || 'Ошибка при оформлении заказа', 'error');
        
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            if (btnText) btnText.style.opacity = '1';
            if (btnLoading) btnLoading.classList.add('hidden');
        }
    }
}

// ==========================================
// ENHANCED NOTIFICATIONS & MODALS - FIXED
// ==========================================

function showEnhancedToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    if (!toast || !toastMessage || !toastIcon) return;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toastIcon.textContent = icons[type] || '✅';
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    console.log(`🍞 Enhanced toast: ${message} (${type})`);
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function showEnhancedNotification(title, message, type = 'info') {
    const container = document.getElementById('notificationsContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <button class="notification-close" onclick="this.parentElement.remove()">✕</button>
        <h4>${title}</h4>
        <p>${message}</p>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
    
    console.log(`🔔 Enhanced notification: ${title} - ${message}`);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        triggerHaptic('selection');
    }
}

// ==========================================
// UTILITY FUNCTIONS - FIXED
// ==========================================

function formatPrice(amount) {
    return `${Math.round(amount).toLocaleString('ru-RU')}₽`;
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

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Global error handling
window.addEventListener('error', (event) => {
    console.error('❌ Global error:', event.error);
    showEnhancedToast('Произошла ошибка в приложении', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled promise rejection:', event.reason);
});

console.log('✅ ShopTG Pro Enhanced App loaded and ready');
console.log('🎨 Features: Search, Filters, Recommendations, Reviews, Chat, Loyalty System');
console.log('🛍️ Enhanced UX with animations, haptic feedback, and modern design');