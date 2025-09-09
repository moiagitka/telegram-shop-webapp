// Telegram WebApp Store - Main Application Logic
class TelegramStore {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.currentPage = 'home';
        this.cart = [];
        this.favorites = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.sortBy = 'name';
        
        // Application data
        this.products = [
            {
                id: 1,
                name: "Куртка зимняя Premium",
                price: 8500,
                oldPrice: 12000,
                category: "outerwear",
                image: "https://via.placeholder.com/300x300/4A90E2/FFFFFF?text=Куртка",
                description: "Теплая зимняя куртка из высококачественных материалов",
                inStock: true,
                rating: 4.8,
                reviews: 156
            },
            {
                id: 2,
                name: "Кроссовки Nike Air Max",
                price: 6200,
                category: "sneakers",
                image: "https://via.placeholder.com/300x300/50E3C2/FFFFFF?text=Nike",
                description: "Стильные кроссовки для активного образа жизни",
                inStock: true,
                rating: 4.9,
                reviews: 89
            },
            {
                id: 3,
                name: "Джинсы классические",
                price: 3200,
                category: "pants",
                image: "https://via.placeholder.com/300x300/F5A623/FFFFFF?text=Джинсы",
                description: "Удобные джинсы прямого кроя",
                inStock: false,
                rating: 4.5,
                reviews: 67
            },
            {
                id: 4,
                name: "Рубашка деловая",
                price: 2800,
                category: "shirts",
                image: "https://via.placeholder.com/300x300/BD10E0/FFFFFF?text=Рубашка",
                description: "Элегантная рубашка для офиса",
                inStock: true,
                rating: 4.6,
                reviews: 43
            },
            {
                id: 5,
                name: "Пальто осеннее",
                price: 7800,
                category: "outerwear",
                image: "https://via.placeholder.com/300x300/D0021B/FFFFFF?text=Пальто",
                description: "Стильное пальто для прохладной погоды",
                inStock: true,
                rating: 4.7,
                reviews: 234
            },
            {
                id: 6,
                name: "Adidas Ultraboost",
                price: 8900,
                category: "sneakers",
                image: "https://via.placeholder.com/300x300/7ED321/FFFFFF?text=Adidas",
                description: "Инновационные кроссовки с технологией Boost",
                inStock: true,
                rating: 4.9,
                reviews: 178
            }
        ];

        this.categories = [
            {id: "all", name: "Все товары", icon: "🛍️"},
            {id: "outerwear", name: "Верхняя одежда", icon: "🧥"},
            {id: "sneakers", name: "Кроссовки", icon: "👟"},
            {id: "pants", name: "Брюки", icon: "👖"},
            {id: "shirts", name: "Рубашки", icon: "👔"}
        ];

        this.orders = [
            {
                id: "ORD-001",
                date: "2025-09-08",
                status: "delivered",
                total: 14700,
                items: [
                    {productId: 1, quantity: 1, price: 8500},
                    {productId: 2, quantity: 1, price: 6200}
                ]
            },
            {
                id: "ORD-002",
                date: "2025-09-10",
                status: "processing",
                total: 5600,
                items: [
                    {productId: 4, quantity: 2, price: 2800}
                ]
            }
        ];

        this.user = {
            id: 123456789,
            firstName: "Иван",
            lastName: "Петров",
            username: "ivan_petrov",
            balance: 2500,
            bonusPoints: 340,
            isAdmin: false
        };

        this.init();
    }

    init() {
        // Initialize Telegram WebApp
        if (this.tg) {
            this.tg.ready();
            this.tg.expand();
            
            // Get user data from Telegram
            if (this.tg.initDataUnsafe?.user) {
                const teleUser = this.tg.initDataUnsafe.user;
                this.user.firstName = teleUser.first_name || this.user.firstName;
                this.user.lastName = teleUser.last_name || this.user.lastName;
                this.user.username = teleUser.username || this.user.username;
                this.user.id = teleUser.id || this.user.id;
            }

            // Apply Telegram theme
            this.applyTelegramTheme();
        }

        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 1000);

        this.setupEventListeners();
        this.renderHomePage();
        this.updateUserProfile();
    }

    applyTelegramTheme() {
        if (this.tg?.colorScheme) {
            document.documentElement.setAttribute('data-color-scheme', this.tg.colorScheme);
        }
    }

    setupEventListeners() {
        // Bottom navigation - with higher priority and event stopping
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const page = item.dataset.page;
                this.showPage(page);
            }, true); // Use capture phase for higher priority
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleTheme();
        });

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            if (this.currentPage === 'catalog') {
                this.renderCatalogPage();
            }
        });

        // Sort select
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.renderCatalogPage();
        });

        // Admin button
        document.getElementById('admin-btn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showPage('admin');
        });

        // Admin tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tab = btn.dataset.tab;
                this.showAdminTab(tab);
            });
        });

        // Add product button
        document.getElementById('add-product-btn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showModal('add-product-modal');
        });

        // Add product form
        document.getElementById('add-product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProduct();
        });

        // Checkout form
        document.getElementById('checkout-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processCheckout();
        });

        // Modal event listeners
        this.setupModalEventListeners();
    }

    setupModalEventListeners() {
        // Close modals when clicking outside or on close button
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const modal = btn.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal:not(.hidden)');
                if (openModal) {
                    this.closeModal(openModal.id);
                }
            }
        });
    }

    showPage(page) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const navItem = document.querySelector(`[data-page="${page}"]`);
        if (navItem) {
            navItem.classList.add('active');
        }

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // Show selected page
        const pageElement = document.getElementById(`${page}-page`);
        if (pageElement) {
            pageElement.classList.add('active');
        }
        
        this.currentPage = page;

        // Render page content
        switch (page) {
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
            case 'admin':
                this.renderAdminPage();
                break;
            case 'checkout':
                this.renderCheckoutPage();
                break;
        }
    }

    renderHomePage() {
        // Render latest products
        const latestContainer = document.getElementById('latest-products');
        const latestProducts = this.products.slice(0, 4);
        
        latestContainer.innerHTML = latestProducts.map(product => 
            this.createProductCard(product, true)
        ).join('');

        // Render categories
        const categoriesContainer = document.getElementById('categories-grid');
        categoriesContainer.innerHTML = this.categories.filter(cat => cat.id !== 'all').map(category => `
            <div class="category-card" data-category="${category.id}">
                <div class="category-icon">${category.icon}</div>
                <div class="category-name">${category.name}</div>
            </div>
        `).join('');

        // Add category click handlers
        this.setupCategoryHandlers();
    }

    renderCatalogPage() {
        // Render category chips
        const chipsContainer = document.getElementById('category-chips');
        chipsContainer.innerHTML = this.categories.map(category => `
            <button class="chip ${this.currentCategory === category.id ? 'active' : ''}" 
                    data-category="${category.id}">
                ${category.name}
            </button>
        `).join('');

        // Setup chip handlers
        this.setupChipHandlers();

        // Filter and sort products
        let filteredProducts = this.products;
        
        if (this.currentCategory !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.category === this.currentCategory);
        }
        
        if (this.searchQuery) {
            filteredProducts = filteredProducts.filter(p => 
                p.name.toLowerCase().includes(this.searchQuery) ||
                p.description.toLowerCase().includes(this.searchQuery)
            );
        }

        // Sort products
        filteredProducts.sort((a, b) => {
            switch (this.sortBy) {
                case 'price_asc':
                    return a.price - b.price;
                case 'price_desc':
                    return b.price - a.price;
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        // Render products grid
        const productsContainer = document.getElementById('products-grid');
        productsContainer.innerHTML = filteredProducts.map(product => 
            this.createProductCard(product)
        ).join('');
    }

    renderCartPage() {
        const cartContent = document.getElementById('cart-content');
        const cartEmpty = document.getElementById('cart-empty');

        if (this.cart.length === 0) {
            cartContent.style.display = 'none';
            cartEmpty.style.display = 'block';
            return;
        }

        cartEmpty.style.display = 'none';
        cartContent.style.display = 'block';

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        cartContent.innerHTML = `
            ${this.cart.map(item => {
                const product = this.products.find(p => p.id === item.productId);
                return `
                    <div class="cart-item">
                        <img src="${product.image}" alt="${product.name}" class="cart-item-image">
                        <div class="cart-item-info">
                            <div class="cart-item-name">${product.name}</div>
                            <div class="cart-item-price">${this.formatPrice(item.price)} ₽</div>
                        </div>
                        <div class="cart-item-actions">
                            <div class="quantity-controls">
                                <button class="quantity-btn" data-action="decrease" data-product-id="${item.productId}">-</button>
                                <span class="quantity-value">${item.quantity}</span>
                                <button class="quantity-btn" data-action="increase" data-product-id="${item.productId}">+</button>
                            </div>
                            <button class="remove-btn" data-product-id="${item.productId}">🗑️</button>
                        </div>
                    </div>
                `;
            }).join('')}
            <div class="cart-total">
                <h3>Итого: ${this.formatPrice(total)} ₽</h3>
                <button class="btn btn--primary btn--full-width" id="proceed-checkout-btn">
                    Оформить заказ
                </button>
            </div>
        `;

        // Setup cart event handlers
        this.setupCartHandlers();
    }

    renderFavoritesPage() {
        const favoritesContent = document.getElementById('favorites-content');
        const favoritesEmpty = document.getElementById('favorites-empty');

        if (this.favorites.length === 0) {
            favoritesContent.style.display = 'none';
            favoritesEmpty.style.display = 'block';
            return;
        }

        favoritesEmpty.style.display = 'none';
        favoritesContent.style.display = 'block';

        const favoriteProducts = this.products.filter(p => this.favorites.includes(p.id));
        
        favoritesContent.innerHTML = `
            <div class="products-grid">
                ${favoriteProducts.map(product => this.createProductCard(product)).join('')}
            </div>
        `;
    }

    renderProfilePage() {
        // Update user info
        document.getElementById('user-name').textContent = `${this.user.firstName} ${this.user.lastName}`;
        document.getElementById('user-username').textContent = `@${this.user.username}`;
        document.getElementById('user-avatar').textContent = this.user.firstName.charAt(0);
        document.getElementById('user-balance').textContent = this.formatPrice(this.user.balance);
        document.getElementById('user-bonus').textContent = this.user.bonusPoints;

        // Show admin button if user is admin
        document.getElementById('admin-btn').style.display = this.user.isAdmin ? 'block' : 'none';

        // Render order history
        const ordersContainer = document.getElementById('orders-history');
        ordersContainer.innerHTML = this.orders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <span class="order-id">${order.id}</span>
                    <span class="order-date">${this.formatDate(order.date)}</span>
                </div>
                <div class="order-status">
                    <span class="status status--${this.getStatusClass(order.status)}">
                        ${this.getStatusText(order.status)}
                    </span>
                </div>
                <div class="order-total">${this.formatPrice(order.total)} ₽</div>
            </div>
        `).join('');
    }

    renderCheckoutPage() {
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('checkout-total-amount').textContent = this.formatPrice(total);
        
        // Pre-fill user data
        document.getElementById('checkout-name').value = `${this.user.firstName} ${this.user.lastName}`;
        document.getElementById('checkout-username').value = this.user.username;
    }

    renderAdminPage() {
        this.renderAdminProducts();
        this.renderAdminOrders();
        this.renderAdminAnalytics();
    }

    renderAdminProducts() {
        const container = document.getElementById('admin-products-list');
        container.innerHTML = this.products.map(product => `
            <div class="admin-product-item">
                <img src="${product.image}" alt="${product.name}" class="admin-product-image">
                <div class="admin-product-info">
                    <div class="admin-product-name">${product.name}</div>
                    <div class="admin-product-price">${this.formatPrice(product.price)} ₽</div>
                    <div class="admin-product-stock">${product.inStock ? 'В наличии' : 'Нет в наличии'}</div>
                </div>
                <div class="admin-product-actions">
                    <button class="btn btn--sm btn--outline" data-action="edit" data-product-id="${product.id}">Редактировать</button>
                    <button class="btn btn--sm btn--outline" data-action="delete" data-product-id="${product.id}">Удалить</button>
                </div>
            </div>
        `).join('');

        // Setup admin product handlers
        this.setupAdminProductHandlers();
    }

    renderAdminOrders() {
        const container = document.getElementById('admin-orders-list');
        container.innerHTML = this.orders.map(order => `
            <div class="card">
                <div class="card__body">
                    <div class="order-header">
                        <span class="order-id">${order.id}</span>
                        <span class="order-date">${this.formatDate(order.date)}</span>
                    </div>
                    <div class="order-status">
                        <select class="form-control" data-order-id="${order.id}">
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>В обработке</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Отправлен</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Доставлен</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Отменен</option>
                        </select>
                    </div>
                    <div class="order-total">${this.formatPrice(order.total)} ₽</div>
                </div>
            </div>
        `).join('');

        // Setup order status handlers
        this.setupOrderStatusHandlers();
    }

    renderAdminAnalytics() {
        // Render sales chart
        setTimeout(() => {
            const ctx = document.getElementById('sales-chart');
            if (ctx && window.Chart) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
                        datasets: [{
                            label: 'Продажи',
                            data: [12000, 19000, 15000, 25000, 22000, 30000],
                            borderColor: '#1FB8CD',
                            backgroundColor: 'rgba(31, 184, 205, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return value.toLocaleString() + ' ₽';
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }, 100);
    }

    createProductCard(product, isHorizontal = false) {
        const inFavorites = this.favorites.includes(product.id);
        const inCart = this.cart.find(item => item.productId === product.id);
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                ${!product.inStock ? '<div class="out-of-stock-badge">Нет в наличии</div>' : ''}
                <button class="favorite-btn ${inFavorites ? 'active' : ''}" 
                        data-action="toggle-favorite" data-product-id="${product.id}">
                    ${inFavorites ? '❤️' : '🤍'}
                </button>
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">
                        ${this.formatPrice(product.price)} ₽
                        ${product.oldPrice ? `<span class="product-old-price">${this.formatPrice(product.oldPrice)} ₽</span>` : ''}
                    </div>
                    ${product.rating ? `
                        <div class="product-rating">
                            ⭐ ${product.rating} (${product.reviews} отзывов)
                        </div>
                    ` : ''}
                    <div class="product-actions">
                        <button class="btn btn--primary btn--sm" 
                                data-action="add-to-cart" data-product-id="${product.id}"
                                ${!product.inStock ? 'disabled' : ''}>
                            ${inCart ? 'В корзине' : 'В корзину'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Event handler setup methods
    setupCategoryHandlers() {
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const categoryId = card.dataset.category;
                this.filterByCategory(categoryId);
            });
        });
    }

    setupChipHandlers() {
        document.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const categoryId = chip.dataset.category;
                this.filterByCategory(categoryId);
            });
        });
    }

    setupCartHandlers() {
        // Quantity controls
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const action = btn.dataset.action;
                const productId = parseInt(btn.dataset.productId);
                const currentItem = this.cart.find(item => item.productId === productId);
                
                if (action === 'increase') {
                    this.updateCartQuantity(productId, currentItem.quantity + 1);
                } else if (action === 'decrease') {
                    this.updateCartQuantity(productId, currentItem.quantity - 1);
                }
            });
        });

        // Remove buttons
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const productId = parseInt(btn.dataset.productId);
                this.removeFromCart(productId);
            });
        });

        // Checkout button
        const checkoutBtn = document.getElementById('proceed-checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.proceedToCheckout();
            });
        }
    }

    setupAdminProductHandlers() {
        document.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const productId = parseInt(btn.dataset.productId);
                this.editProduct(productId);
            });
        });

        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const productId = parseInt(btn.dataset.productId);
                this.deleteProduct(productId);
            });
        });
    }

    setupOrderStatusHandlers() {
        document.querySelectorAll('select[data-order-id]').forEach(select => {
            select.addEventListener('change', (e) => {
                const orderId = select.dataset.orderId;
                const newStatus = select.value;
                this.updateOrderStatus(orderId, newStatus);
            });
        });
    }

    // Setup product interaction handlers using event delegation
    setupProductHandlers() {
        document.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            if (!productCard) return;

            const action = e.target.dataset.action;
            const productId = parseInt(e.target.dataset.productId || productCard.dataset.productId);

            if (!productId) return;

            e.preventDefault();
            e.stopPropagation();

            switch (action) {
                case 'toggle-favorite':
                    this.toggleFavorite(productId);
                    break;
                case 'add-to-cart':
                    this.addToCart(productId);
                    break;
                default:
                    // Only show product detail if no specific action was triggered
                    if (!action) {
                        this.showProductDetail(productId);
                    }
                    break;
            }
        });
    }

    // Product actions
    showProductDetail(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const modal = document.getElementById('product-modal');
        const nameEl = document.getElementById('modal-product-name');
        const contentEl = document.getElementById('modal-product-content');

        nameEl.textContent = product.name;
        contentEl.innerHTML = `
            <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 16px;">
            <p><strong>Цена:</strong> ${this.formatPrice(product.price)} ₽</p>
            <p><strong>Описание:</strong> ${product.description}</p>
            ${product.rating ? `<p><strong>Рейтинг:</strong> ⭐ ${product.rating} (${product.reviews} отзывов)</p>` : ''}
            <p><strong>Наличие:</strong> ${product.inStock ? 'В наличии' : 'Нет в наличии'}</p>
            <div style="display: flex; gap: 12px; margin-top: 24px;">
                <button class="btn btn--primary" data-action="add-to-cart" data-product-id="${product.id}"
                        ${!product.inStock ? 'disabled' : ''}>
                    Добавить в корзину
                </button>
                <button class="btn btn--outline" data-action="toggle-favorite" data-product-id="${product.id}">
                    ${this.favorites.includes(product.id) ? 'Убрать из избранного' : 'В избранное'}
                </button>
            </div>
        `;

        this.showModal('product-modal');
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product || !product.inStock) return;

        const existingItem = this.cart.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.cart.push({
                productId: product.id,
                price: product.price,
                quantity: 1
            });
        }

        this.updateCartBadge();
        this.showToast('Товар добавлен в корзину', 'success');
        
        // Update Telegram WebApp main button
        if (this.tg) {
            this.tg.MainButton.setText(`Корзина (${this.cart.length})`);
            this.tg.MainButton.show();
        }

        // Re-render current page to update button states
        this.rerenderCurrentPage();
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.productId !== productId);
        this.updateCartBadge();
        this.renderCartPage();
        this.showToast('Товар удален из корзины', 'info');
    }

    updateCartQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        const item = this.cart.find(item => item.productId === productId);
        if (item) {
            item.quantity = newQuantity;
            this.updateCartBadge();
            this.renderCartPage();
        }
    }

    toggleFavorite(productId) {
        const index = this.favorites.indexOf(productId);
        
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.showToast('Товар убран из избранного', 'info');
        } else {
            this.favorites.push(productId);
            this.showToast('Товар добавлен в избранное', 'success');
        }

        this.updateFavoritesBadge();
        this.rerenderCurrentPage();
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.showPage('catalog');
    }

    // Checkout
    proceedToCheckout() {
        if (this.cart.length === 0) return;
        this.showPage('checkout');
    }

    processCheckout() {
        const formData = {
            name: document.getElementById('checkout-name').value,
            phone: document.getElementById('checkout-phone').value,
            username: document.getElementById('checkout-username').value,
            address: document.getElementById('checkout-address').value,
            screenshot: document.getElementById('checkout-screenshot').files[0]
        };

        // Validate form
        if (!formData.name || !formData.phone || !formData.address || !formData.screenshot) {
            this.showToast('Заполните все поля', 'error');
            return;
        }

        // Create order
        const newOrder = {
            id: `ORD-${String(Date.now()).slice(-3)}`,
            date: new Date().toISOString().split('T')[0],
            status: 'processing',
            total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            items: [...this.cart],
            customerInfo: formData
        };

        this.orders.unshift(newOrder);
        this.cart = [];
        this.updateCartBadge();

        this.showToast('Заказ успешно оформлен!', 'success');
        this.showPage('profile');

        // Send data to Telegram WebApp
        if (this.tg) {
            this.tg.sendData(JSON.stringify(newOrder));
        }
    }

    // Admin functions
    showAdminTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`admin-${tab}`).classList.add('active');

        if (tab === 'analytics') {
            this.renderAdminAnalytics();
        }
    }

    addProduct() {
        const formData = {
            name: document.getElementById('product-name').value,
            price: parseFloat(document.getElementById('product-price').value),
            category: document.getElementById('product-category').value,
            description: document.getElementById('product-description').value,
            image: document.getElementById('product-image').value
        };

        const newProduct = {
            id: Date.now(),
            ...formData,
            inStock: true,
            rating: 0,
            reviews: 0
        };

        this.products.push(newProduct);
        this.closeModal('add-product-modal');
        this.renderAdminProducts();
        this.showToast('Товар добавлен', 'success');

        // Reset form
        document.getElementById('add-product-form').reset();
    }

    editProduct(productId) {
        // Simplified edit - in real app would show edit modal
        this.showToast('Функция редактирования в разработке', 'info');
    }

    deleteProduct(productId) {
        this.products = this.products.filter(p => p.id !== productId);
        this.renderAdminProducts();
        this.showToast('Товар удален', 'success');
    }

    updateOrderStatus(orderId, newStatus) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            this.showToast('Статус заказа обновлен', 'success');
        }
    }

    // Utility functions
    updateCartBadge() {
        const badge = document.getElementById('cart-badge');
        const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    }

    updateFavoritesBadge() {
        const badge = document.getElementById('favorites-badge');
        badge.textContent = this.favorites.length;
        badge.style.display = this.favorites.length > 0 ? 'block' : 'none';
    }

    updateUserProfile() {
        if (this.tg?.initDataUnsafe?.user) {
            const teleUser = this.tg.initDataUnsafe.user;
            this.user.firstName = teleUser.first_name || this.user.firstName;
            this.user.lastName = teleUser.last_name || this.user.lastName;
            this.user.username = teleUser.username || this.user.username;
        }
    }

    rerenderCurrentPage() {
        switch (this.currentPage) {
            case 'home':
                this.renderHomePage();
                break;
            case 'catalog':
                this.renderCatalogPage();
                break;
            case 'favorites':
                this.renderFavoritesPage();
                break;
        }
    }

    formatPrice(price) {
        return price.toLocaleString('ru-RU');
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('ru-RU');
    }

    getStatusClass(status) {
        const statusMap = {
            'processing': 'info',
            'shipped': 'warning',
            'delivered': 'success',
            'cancelled': 'error'
        };
        return statusMap[status] || 'info';
    }

    getStatusText(status) {
        const statusMap = {
            'processing': 'В обработке',
            'shipped': 'Отправлен',
            'delivered': 'Доставлен',
            'cancelled': 'Отменен'
        };
        return statusMap[status] || status;
    }

    toggleTheme() {
        const currentScheme = document.documentElement.getAttribute('data-color-scheme');
        const newScheme = currentScheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-color-scheme', newScheme);
        
        const themeIcon = document.querySelector('.theme-icon');
        themeIcon.textContent = newScheme === 'dark' ? '☀️' : '🌙';
    }

    // Modal functions
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            // Restore body scroll
            document.body.style.overflow = '';
        }
    }

    // Toast notifications
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        const container = document.getElementById('toast-container');
        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Global functions for HTML onclick handlers
window.store = null;

function showPage(page) {
    window.store?.showPage(page);
}

function closeModal(modalId) {
    window.store?.closeModal(modalId);
}

function goBack() {
    window.store?.showPage('catalog');
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.store = new TelegramStore();
    
    // Setup global product interaction handlers
    window.store.setupProductHandlers();
});

// Handle Telegram WebApp events
if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.onEvent('mainButtonClicked', () => {
        if (window.store?.cart.length > 0) {
            window.store.showPage('cart');
        }
    });

    window.Telegram.WebApp.onEvent('themeChanged', () => {
        window.store?.applyTelegramTheme();
    });
}