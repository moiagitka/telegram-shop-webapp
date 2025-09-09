// 🔧 КОНФИГУРАЦИЯ API - ИЗМЕНИТЕ ЭТУ ССЫЛКУ НА ВАШ NGROK URL
const API_CONFIG = {
    // ⚠️ ВАЖНО: Замените на ваш ngrok URL после запуска C# бэкэнда
    BASE_URL: 'https://c36e7a7fc2e4.ngrok-free.app/api',

    // Пример: 'https://abc123.ngrok.io/api'
    // Для тестирования локально: 'http://localhost:5000/api'
};

// 🛍️ Главный класс Telegram Store
class TelegramStore {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.currentPage = 'home';
        this.cart = [];
        this.favorites = [];
        this.products = [];
        this.categories = [];
        this.user = null;
        this.orders = [];

        this.init();
    }

    // 🚀 Инициализация приложения
    async init() {
        console.log('🚀 Запуск TeleStore App');
        console.log(`🔗 API URL: ${API_CONFIG.BASE_URL}`);

        // Настройка Telegram WebApp
        this.setupTelegram();

        // Загрузка данных из localStorage
        this.loadFromStorage();

        // Настройка событий
        this.setupEventListeners();

        // Загрузка данных с API
        await this.loadInitialData();

        // Скрытие загрузки и показ приложения
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
            this.renderCurrentPage();
        }, 1500);
    }

    // 🤖 Настройка Telegram WebApp
    setupTelegram() {
        if (this.tg) {
            this.tg.ready();
            this.tg.expand();

            // Применение темы Telegram
            const themeParams = this.tg.themeParams;
            if (themeParams.bg_color) {
                document.documentElement.style.setProperty('--tg-bg-color', themeParams.bg_color);
            }

            // Получение данных пользователя
            if (this.tg.initDataUnsafe?.user) {
                const tgUser = this.tg.initDataUnsafe.user;
                this.user = {
                    id: tgUser.id,
                    firstName: tgUser.first_name,
                    lastName: tgUser.last_name,
                    username: tgUser.username,
                    balance: 0,
                    bonusPoints: 0,
                    isAdmin: false
                };
                console.log('👤 Пользователь Telegram:', this.user);
            }
        }
    }

    // 🌐 БАЗОВЫЙ МЕТОД ДЛЯ API ЗАПРОСОВ (ИСПРАВЛЕН!)
    async apiCall(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const method = options.method || 'GET';
        console.log(`🔗 API запрос: ${method} ${url}`);

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true',  // ← ОБХОД ПРЕДУПРЕЖДЕНИЯ
                    ...options.headers
                },
                body: options.body ? JSON.stringify(options.body) : undefined,
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ API ответ:', data);
            return data;

        } catch (error) {
            console.error('❌ API ошибка:', error);
            this.showToast(`Ошибка API: ${error.message}`, 'error');

            // Возвращаем тестовые данные если API недоступен
            return this.getMockData(endpoint);
        }
    }

    // 📦 ЗАГРУЗКА ТОВАРОВ С API
    async loadProducts(category = null, search = null) {
        let endpoint = '/products';
        const params = new URLSearchParams();

        if (category && category !== 'all') {
            params.append('category', category);
        }
        if (search) {
            params.append('search', search);
        }

        if (params.toString()) {
            endpoint += '?' + params.toString();
        }

        const products = await this.apiCall(endpoint);

        if (Array.isArray(products)) {
            this.products = products;
        }

        this.renderProducts();
        return this.products;
    }

    // 🛒 СОЗДАНИЕ ЗАКАЗА ЧЕРЕЗ API
    async createOrder(orderData) {
        const orderRequest = {
            initData: this.tg?.initData || '',
            customerName: orderData.name,
            phoneNumber: orderData.phone,
            telegramUsername: this.user?.username || orderData.username,
            deliveryAddress: orderData.address,
            paymentScreenshotUrl: orderData.screenshot || null,
            items: this.cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            }))
        };

        console.log('📦 Создание заказа:', orderRequest);

        const result = await this.apiCall('/orders', {
            method: 'POST',
            body: orderRequest
        });

        if (result && result.id) {
            this.cart = [];
            this.saveToStorage();
            this.showToast('✅ Заказ успешно оформлен!', 'success');
            this.navigateToPage('profile');
            await this.loadUserOrders();
        }

        return result;
    }

    // 👤 ЗАГРУЗКА ЗАКАЗОВ ПОЛЬЗОВАТЕЛЯ
    async loadUserOrders() {
        if (!this.user?.id) return;

        const orders = await this.apiCall(`/orders/user/${this.user.id}`);

        if (Array.isArray(orders)) {
            this.orders = orders;
        }

        return this.orders;
    }

    // 🔄 ЗАГРУЗКА НАЧАЛЬНЫХ ДАННЫХ
    async loadInitialData() {
        console.log('📡 Загрузка данных с API...');

        // Загружаем товары
        await this.loadProducts();

        // Загружаем заказы пользователя
        if (this.user?.id) {
            await this.loadUserOrders();
        }

        console.log('✅ Данные загружены');
    }

    // 🎭 ТЕСТОВЫЕ ДАННЫЕ (если API недоступен)
    getMockData(endpoint) {
        if (endpoint.includes('/products')) {
            return [
                {
                    id: 1,
                    name: "Куртка зимняя Premium",
                    price: 8500,
                    oldPrice: 12000,
                    category: "outerwear",
                    imageUrl: "https://via.placeholder.com/300x300/4A90E2/FFFFFF?text=Куртка",
                    description: "Теплая зимняя куртка из высококачественных материалов",
                    inStock: true,
                    rating: 4.8,
                    reviewsCount: 156
                },
                {
                    id: 2,
                    name: "Кроссовки Nike Air Max",
                    price: 6200,
                    category: "sneakers",
                    imageUrl: "https://via.placeholder.com/300x300/50E3C2/FFFFFF?text=Nike",
                    description: "Стильные кроссовки для активного образа жизни",
                    inStock: true,
                    rating: 4.9,
                    reviewsCount: 89
                },
                {
                    id: 3,
                    name: "Джинсы классические",
                    price: 3200,
                    category: "pants",
                    imageUrl: "https://via.placeholder.com/300x300/F5A623/FFFFFF?text=Джинсы",
                    description: "Удобные джинсы прямого кроя",
                    inStock: false,
                    rating: 4.5,
                    reviewsCount: 67
                },
                {
                    id: 4,
                    name: "Рубашка деловая",
                    price: 2800,
                    category: "shirts",
                    imageUrl: "https://via.placeholder.com/300x300/BD10E0/FFFFFF?text=Рубашка",
                    description: "Элегантная рубашка для офиса",
                    inStock: true,
                    rating: 4.6,
                    reviewsCount: 43
                },
                {
                    id: 5,
                    name: "Пальто осеннее",
                    price: 7800,
                    category: "outerwear",
                    imageUrl: "https://via.placeholder.com/300x300/D0021B/FFFFFF?text=Пальто",
                    description: "Стильное пальто для прохладной погоды",
                    inStock: true,
                    rating: 4.7,
                    reviewsCount: 234
                },
                {
                    id: 6,
                    name: "Adidas Ultraboost",
                    price: 8900,
                    category: "sneakers",
                    imageUrl: "https://via.placeholder.com/300x300/7ED321/FFFFFF?text=Adidas",
                    description: "Инновационные кроссовки с технологией Boost",
                    inStock: true,
                    rating: 4.9,
                    reviewsCount: 178
                }
            ];
        }

        if (endpoint.includes('/orders')) {
            return [];
        }

        return [];
    }

    // 🎛️ НАСТРОЙКА СОБЫТИЙ
    setupEventListeners() {
        // Навигация
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Поиск
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.loadProducts(this.currentCategory, e.target.value);
                }, 500);
            });
        }

        // Переключение темы
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Делегирование событий для динамического контента
        document.addEventListener('click', (e) => {
            // Фильтры категорий
            if (e.target.classList.contains('category-chip')) {
                const category = e.target.dataset.category;
                this.filterByCategory(category);
            }

            // Добавить в корзину
            if (e.target.classList.contains('add-to-cart-btn')) {
                const productId = parseInt(e.target.dataset.productId);
                this.addToCart(productId);
            }

            // Добавить в избранное
            if (e.target.classList.contains('add-to-favorites-btn')) {
                const productId = parseInt(e.target.dataset.productId);
                this.toggleFavorite(productId);
            }

            // Управление количеством в корзине
            if (e.target.classList.contains('quantity-btn')) {
                const action = e.target.dataset.action;
                const productId = parseInt(e.target.dataset.productId);
                this.updateCartQuantity(productId, action);
            }

            // Удалить из корзины
            if (e.target.classList.contains('remove-from-cart-btn')) {
                const productId = parseInt(e.target.dataset.productId);
                this.removeFromCart(productId);
            }
        });
    }

    // 🧭 НАВИГАЦИЯ
    navigateToPage(page) {
        this.currentPage = page;

        // Обновляем навигацию
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        this.renderCurrentPage();
    }

    // 🎨 РЕНДЕРИНГ СТРАНИЦ
    renderCurrentPage() {
        // Скрываем все страницы
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Показываем текущую
        const currentPageElement = document.getElementById(`${this.currentPage}-page`);
        if (currentPageElement) {
            currentPageElement.classList.add('active');
        }

        // Рендерим контент
        switch (this.currentPage) {
            case 'home':
                this.renderHomePage();
                break;
            case 'catalog':
                this.renderCatalogPage();
                break;
            case 'cart':
                this.renderCartPage();
                break;
            case 'favorites':
                this.renderFavoritesPage();
                break;
            case 'profile':
                this.renderProfilePage();
                break;
        }

        this.updateNavigationBadges();
    }

    // 🏠 РЕНДЕРИНГ ГЛАВНОЙ СТРАНИЦЫ
    renderHomePage() {
        const latestProducts = document.getElementById('latest-products');
        if (latestProducts) {
            latestProducts.innerHTML = this.renderProductCards(this.products.slice(0, 4));
        }
    }

    // 📦 РЕНДЕРИНГ КАТАЛОГА
    renderCatalogPage() {
        const catalogProducts = document.getElementById('catalog-products');
        if (catalogProducts) {
            catalogProducts.innerHTML = this.renderProductCards(this.products);
        }
    }

    // 🛒 РЕНДЕРИНГ КОРЗИНЫ
    renderCartPage() {
        const cartContent = document.getElementById('cart-content');

        if (this.cart.length === 0) {
            cartContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🛒</div>
                    <h3>Корзина пуста</h3>
                    <p>Добавьте товары из каталога</p>
                    <button class="btn btn--primary" onclick="app.navigateToPage('catalog')">
                        Перейти в каталог
                    </button>
                </div>
            `;
            return;
        }

        const cartHTML = `
            <div class="page-header">
                <h2>Корзина (${this.cart.length})</h2>
            </div>
            <div class="cart-items">
                ${this.cart.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <div class="cart-item-price">${this.formatPrice(item.price)}</div>
                            <div class="cart-item-controls">
                                <button class="quantity-btn" data-action="decrease" data-product-id="${item.productId}">-</button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="quantity-btn" data-action="increase" data-product-id="${item.productId}">+</button>
                                <button class="remove-from-cart-btn" data-product-id="${item.productId}">🗑️</button>
                            </div>
                        </div>
                        <div class="cart-item-total">
                            ${this.formatPrice(item.price * item.quantity)}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="cart-summary">
                <div class="cart-total">
                    <h3>Итого: ${this.formatPrice(this.getCartTotal())}</h3>
                </div>
                <button class="btn btn--primary btn--full" onclick="app.showCheckoutForm()">
                    Оформить заказ
                </button>
            </div>
        `;

        cartContent.innerHTML = cartHTML;
    }

    // ❤️ РЕНДЕРИНГ ИЗБРАННОГО
    renderFavoritesPage() {
        const favoritesContent = document.getElementById('favorites-content');
        const favoriteProducts = this.products.filter(p => this.favorites.includes(p.id));

        if (favoriteProducts.length === 0) {
            favoritesContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">❤️</div>
                    <h3>Нет избранных товаров</h3>
                    <p>Добавьте товары в избранное из каталога</p>
                    <button class="btn btn--primary" onclick="app.navigateToPage('catalog')">
                        Перейти в каталог
                    </button>
                </div>
            `;
            return;
        }

        favoritesContent.innerHTML = `
            <div class="page-header">
                <h2>Избранное (${favoriteProducts.length})</h2>
            </div>
            <div class="products-grid">
                ${this.renderProductCards(favoriteProducts)}
            </div>
        `;
    }

    // 👤 РЕНДЕРИНГ ПРОФИЛЯ
    renderProfilePage() {
        const profileContent = document.getElementById('profile-content');

        const profileHTML = `
            <div class="profile-header">
                <div class="profile-avatar">
                    <div class="avatar-placeholder">
                        ${this.user ? this.user.firstName?.charAt(0) + this.user.lastName?.charAt(0) : 'У'}
                    </div>
                </div>
                <div class="profile-info">
                    <h2>${this.user ? this.user.firstName + ' ' + this.user.lastName : 'Пользователь'}</h2>
                    <p>@${this.user?.username || 'username'}</p>
                </div>
            </div>

            <div class="profile-stats">
                <div class="stat-card">
                    <div class="stat-value">${this.formatPrice(this.user?.balance || 0)}</div>
                    <div class="stat-label">Баланс</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.user?.bonusPoints || 0}</div>
                    <div class="stat-label">Бонусы</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.orders.length}</div>
                    <div class="stat-label">Заказов</div>
                </div>
            </div>

            <div class="profile-section">
                <h3>История заказов</h3>
                <div class="orders-list">
                    ${this.orders.length > 0 ? this.orders.map(order => `
                        <div class="order-card">
                            <div class="order-header">
                                <span class="order-number">${order.orderNumber || order.id}</span>
                                <span class="order-status status-${order.status}">
                                    ${this.getStatusText(order.status)}
                                </span>
                            </div>
                            <div class="order-date">${new Date(order.createdAt).toLocaleDateString('ru-RU')}</div>
                            <div class="order-total">${this.formatPrice(order.totalAmount)}</div>
                        </div>
                    `).join('') : '<p>Заказов пока нет</p>'}
                </div>
            </div>
        `;

        profileContent.innerHTML = profileHTML;
    }

    // 🎴 РЕНДЕРИНГ КАРТОЧЕК ТОВАРОВ
    renderProductCards(products) {
        if (!products || products.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📦</div>
                    <h3>Товары не найдены</h3>
                    <p>Попробуйте изменить критерии поиска</p>
                </div>
            `;
        }

        return products.map(product => `
            <div class="product-card ${!product.inStock ? 'out-of-stock' : ''}" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.imageUrl || product.image}" alt="${product.name}" loading="lazy">
                    ${!product.inStock ? '<div class="out-of-stock-badge">Нет в наличии</div>' : ''}
                    ${product.oldPrice ? `<div class="discount-badge">-${Math.round((1 - product.price / product.oldPrice) * 100)}%</div>` : ''}
                </div>
                <div class="product-info">
                    <h4 class="product-name">${product.name}</h4>
                    <div class="product-rating">
                        ${'⭐'.repeat(Math.floor(product.rating || 4))} ${(product.rating || 4).toFixed(1)} (${product.reviewsCount || product.reviews || 0})
                    </div>
                    <div class="product-price">
                        <span class="current-price">${this.formatPrice(product.price)}</span>
                        ${product.oldPrice ? `<span class="old-price">${this.formatPrice(product.oldPrice)}</span>` : ''}
                    </div>
                </div>
                <div class="product-actions">
                    <button class="btn btn--outline add-to-favorites-btn ${this.isInFavorites(product.id) ? 'active' : ''}" 
                            data-product-id="${product.id}">
                        ❤️
                    </button>
                    <button class="btn btn--primary add-to-cart-btn ${!product.inStock ? 'disabled' : ''}" 
                            data-product-id="${product.id}" 
                            ${!product.inStock ? 'disabled' : ''}>
                        ${!product.inStock ? 'Нет в наличии' : 'В корзину'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderProducts() {
        // Обновляем товары на всех страницах
        const latestProducts = document.getElementById('latest-products');
        if (latestProducts) {
            latestProducts.innerHTML = this.renderProductCards(this.products.slice(0, 4));
        }

        const catalogProducts = document.getElementById('catalog-products');
        if (catalogProducts) {
            catalogProducts.innerHTML = this.renderProductCards(this.products);
        }
    }

    // 🛒 МЕТОДЫ КОРЗИНЫ
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product || !product.inStock) {
            this.showToast('Товар недоступен', 'error');
            return;
        }

        const existingItem = this.cart.find(item => item.productId === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                productId: productId,
                name: product.name,
                price: product.price,
                image: product.imageUrl || product.image,
                quantity: 1
            });
        }

        this.saveToStorage();
        this.updateNavigationBadges();
        this.showToast('Товар добавлен в корзину', 'success');
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.productId !== productId);
        this.saveToStorage();
        this.updateNavigationBadges();
        this.renderCartPage();
        this.showToast('Товар удален из корзины', 'info');
    }

    updateCartQuantity(productId, action) {
        const item = this.cart.find(item => item.productId === productId);
        if (!item) return;

        if (action === 'increase') {
            item.quantity += 1;
        } else if (action === 'decrease') {
            item.quantity = Math.max(1, item.quantity - 1);
        }

        this.saveToStorage();
        this.renderCartPage();
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // ❤️ МЕТОДЫ ИЗБРАННОГО
    toggleFavorite(productId) {
        const index = this.favorites.indexOf(productId);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.showToast('Товар удален из избранного', 'info');
        } else {
            this.favorites.push(productId);
            this.showToast('Товар добавлен в избранное', 'success');
        }

        this.saveToStorage();
        this.updateNavigationBadges();

        // Обновляем кнопки
        document.querySelectorAll(`[data-product-id="${productId}"].add-to-favorites-btn`).forEach(btn => {
            btn.classList.toggle('active', this.isInFavorites(productId));
        });

        if (this.currentPage === 'favorites') {
            this.renderFavoritesPage();
        }
    }

    isInFavorites(productId) {
        return this.favorites.includes(productId);
    }

    // 🔍 ФИЛЬТРАЦИЯ
    filterByCategory(category) {
        this.currentCategory = category;
        this.loadProducts(category);

        // Обновляем активный чип
        document.querySelectorAll('.category-chip').forEach(chip => {
            chip.classList.remove('active');
            if (chip.dataset.category === category) {
                chip.classList.add('active');
            }
        });
    }

    // 📋 ФОРМА ОФОРМЛЕНИЯ ЗАКАЗА
    showCheckoutForm() {
        const checkoutHTML = `
            <div class="checkout-overlay active">
                <div class="checkout-modal">
                    <div class="checkout-header">
                        <h3>Оформление заказа</h3>
                        <button class="close-btn" onclick="app.hideCheckoutForm()">×</button>
                    </div>

                    <form class="checkout-form" onsubmit="app.submitOrder(event)">
                        <div class="form-group">
                            <label>ФИО *</label>
                            <input type="text" name="name" class="form-control" 
                                   value="${this.user ? this.user.firstName + ' ' + this.user.lastName : ''}" required>
                        </div>

                        <div class="form-group">
                            <label>Номер телефона *</label>
                            <input type="tel" name="phone" class="form-control" placeholder="+7 (999) 123-45-67" required>
                        </div>

                        <div class="form-group">
                            <label>Telegram username</label>
                            <input type="text" name="username" class="form-control" 
                                   value="@${this.user?.username || ''}" readonly>
                        </div>

                        <div class="form-group">
                            <label>Адрес доставки *</label>
                            <textarea name="address" class="form-control" rows="3" 
                                      placeholder="Укажите полный адрес доставки" required></textarea>
                        </div>

                        <div class="form-group">
                            <label>Скриншот оплаты</label>
                            <input type="file" name="screenshot" class="form-control" accept="image/*">
                            <small>Приложите скриншот оплаты заказа</small>
                        </div>

                        <div class="order-summary">
                            <h4>Ваш заказ:</h4>
                            ${this.cart.map(item => `
                                <div class="order-item">
                                    <span>${item.name} × ${item.quantity}</span>
                                    <span>${this.formatPrice(item.price * item.quantity)}</span>
                                </div>
                            `).join('')}
                            <div class="order-total">
                                <strong>Итого: ${this.formatPrice(this.getCartTotal())}</strong>
                            </div>
                        </div>

                        <button type="submit" class="btn btn--primary btn--full">
                            Подтвердить заказ
                        </button>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', checkoutHTML);
    }

    hideCheckoutForm() {
        const overlay = document.querySelector('.checkout-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    async submitOrder(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        const orderData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            username: formData.get('username'),
            address: formData.get('address'),
            screenshot: formData.get('screenshot')?.name || null
        };

        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Оформляем заказ...';
        submitBtn.disabled = true;

        try {
            await this.createOrder(orderData);
            this.hideCheckoutForm();
        } catch (error) {
            console.error('Order submission error:', error);
            this.showToast('Ошибка при оформлении заказа', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // 🔧 УТИЛИТЫ
    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price);
    }

    getStatusText(status) {
        const statusMap = {
            'processing': 'В обработке',
            'confirmed': 'Подтвержден',
            'shipped': 'Отправлен',
            'delivered': 'Доставлен',
            'cancelled': 'Отменен'
        };
        return statusMap[status] || status;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    updateNavigationBadges() {
        // Badge корзины
        const cartBadge = document.querySelector('.nav-item[data-page="cart"] .nav-badge');
        if (cartBadge) {
            const cartCount = this.cart.reduce((total, item) => total + item.quantity, 0);
            cartBadge.textContent = cartCount;
            cartBadge.style.display = cartCount > 0 ? 'block' : 'none';
        }

        // Badge избранного
        const favoritesBadge = document.querySelector('.nav-item[data-page="favorites"] .nav-badge');
        if (favoritesBadge) {
            favoritesBadge.textContent = this.favorites.length;
            favoritesBadge.style.display = this.favorites.length > 0 ? 'block' : 'none';
        }
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');

        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = isDark ? '☀️' : '🌙';
        }

        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.showToast(`Переключено на ${isDark ? 'темную' : 'светлую'} тему`, 'info');
    }

    // 💾 ЛОКАЛЬНОЕ ХРАНЕНИЕ
    saveToStorage() {
        localStorage.setItem('telestore-cart', JSON.stringify(this.cart));
        localStorage.setItem('telestore-favorites', JSON.stringify(this.favorites));
    }

    loadFromStorage() {
        const savedCart = localStorage.getItem('telestore-cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }

        const savedFavorites = localStorage.getItem('telestore-favorites');
        if (savedFavorites) {
            this.favorites = JSON.parse(savedFavorites);
        }

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            const themeIcon = document.querySelector('.theme-icon');
            if (themeIcon) {
                themeIcon.textContent = '☀️';
            }
        }
    }
}

// 🚀 ЗАПУСК ПРИЛОЖЕНИЯ
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Инициализация TeleStore...');
    app = new TelegramStore();
});

// Экспорт для глобального доступа
window.app = app;
