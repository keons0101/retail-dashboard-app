// Global settings
const API_BASE_URL = 'http://localhost:3000';
let allProducts = []; // Store all products
let currentView = 'products'; // products, dashboard, cart

window.addEventListener('load', async () => {
    console.log('Retail Dashboard fully loaded');

    // Initialize navigation first
    initNavigation();

    // Load products from server
    await loadProducts();

    // Check if renderProducts exists before calling it
    if (typeof renderProducts === 'function') {
        console.log('renderProducts function found, calling it...');
        renderProducts();
        if (window.cartModule && window.cartModule.initCart) {
            window.cartModule.initCart();
        } else {
            console.error('Módulo del carrito no disponible');
        }
    } else {
        console.error('renderProducts function NOT found!');
        // Fallback: render products directly
        renderProductsFallback();
    }

    // Show initial section
    showSection('products');
});

async function loadProducts() {
    console.log('Loading products from server...');

    const productsContainer = document.getElementById('products-container');

    try {
        productsContainer.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Connecting to server...</p>
            </div>
        `;

        const response = await fetch(`${API_BASE_URL}/products`);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            allProducts = result.data;
            console.log(`${allProducts.length} loaded products:`, allProducts);

            window.app = window.app || {};
            window.app.allProducts = allProducts;

            return allProducts;
        } else {
            throw new Error(result.message || 'There was an error while loading products');
        }

    } catch (error) {
        console.error('There was an error while loading products:', error);

        productsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>No se pudieron cargar los productos</h3>
                <p>${error.message}</p>
                <p class="error-help">
                    <strong>Solución:</strong> Make sure server is running on http://localhost:3000
                </p>
                <button onclick="location.reload()" class="retry-btn">
                    <i class="fas fa-redo"></i> Try again
                </button>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .error-message {
                grid-column: 1 / -1;
                text-align: center;
                padding: 60px 20px;
                background: #fff5f5;
                border-radius: var(--border-radius);
                border: 2px solid #fed7d7;
            }
            .error-message i {
                font-size: 48px;
                color: #fc8181;
                margin-bottom: 20px;
            }
            .error-message h3 {
                color: #c53030;
                margin-bottom: 10px;
            }
            .error-message p {
                color: #718096;
                margin-bottom: 15px;
                max-width: 600px;
                margin-left: auto;
                margin-right: auto;
            }
            .error-help {
                font-size: 14px;
                color: #4a5568;
                background: #edf2f7;
                padding: 15px;
                border-radius: 8px;
                margin-top: 20px;
            }
            .retry-btn {
                margin-top: 20px;
                padding: 12px 24px;
                background-color: var(--primary);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: var(--transition);
            }
            .retry-btn:hover {
                background-color: var(--primary-dark);
            }
        `;
        document.head.appendChild(style);
    }
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove "active" class on every link
            navLinks.forEach(l => l.classList.remove('active'));

            // Add "active" class to the clicked link
            link.classList.add('active');

            // Show the clicked section
            const sectionId = link.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });
}

function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Show selected section
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
        currentView = sectionId;
        console.log(`Active section: ${sectionId}`);

        // If dashboard is requested, update charts
        if (sectionId === 'dashboard') {
            updateDashboardMetrics();

            if (window.app.allProducts && window.app.allProducts.length > 0) {
                setTimeout(() => {
                    if (window.ChartsModule && window.ChartsModule.initCharts) {
                        window.ChartsModule.initCharts(window.app.allProducts);
                    }
                }, 100);
            }
        }
    }
}

async function updateDashboardMetrics() {
    console.log('Updating dashboard metrics...');

    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const result = await response.json();

        if (result.success) {
            window.app.allProducts = result.data;

            const metrics = calculateMetrics(result.data);

            updateDashboardUI(metrics);

            console.log('Attempting to initialize charts...');
            if (window.ChartsModule && window.ChartsModule.initCharts) {
                console.log('ChartsModule found, initializing charts with', result.data.length, 'products');
                window.ChartsModule.initCharts(result.data);
            } else {
                console.error('ChartsModule not available');
            }
        }
    } catch (error) {
        console.error('Error updating dashboard metrics:', error);
    }
}
function calculateMetrics(products) {
    const totalRevenue = products.reduce((sum, product) => {
        const initialStock = 10;
        const sold = Math.max(0, initialStock - product.stock);
        return sum + (product.price * sold);
    }, 0);

    const lowStockProducts = products.filter(p => p.stock <= 5 && p.stock > 0).length;
    const outOfStockProducts = products.filter(p => p.stock === 0).length;
    const totalReviews = products.reduce((sum, product) => sum + product.reviews.length, 0);
    const averageRating = products.length > 0
        ? products.reduce((sum, product) => sum + product.rating, 0) / products.length
        : 0;

    return {
        totalRevenue: Math.round(totalRevenue),
        lowStockProducts: lowStockProducts,
        outOfStockProducts: outOfStockProducts,
        totalReviews: totalReviews,
        averageRating: averageRating.toFixed(1),
        totalProducts: products.length
    };
}

function updateDashboardUI(metrics) {
    const revenueElement = document.querySelector('.metric-card:nth-child(1) .metric-value');
    const ordersElement = document.querySelector('.metric-card:nth-child(2) .metric-value');
    const reviewsElement = document.querySelector('.metric-card:nth-child(3) .metric-value');
    const returnsElement = document.querySelector('.metric-card:nth-child(4) .metric-value');

    if (revenueElement) revenueElement.textContent = `$${metrics.totalRevenue.toLocaleString()}`;
    if (ordersElement) ordersElement.textContent = metrics.lowStockProducts;
    if (reviewsElement) reviewsElement.textContent = metrics.totalReviews;
    if (returnsElement) returnsElement.textContent = `${metrics.outOfStockProducts} products`;

    const ordersPeriod = document.querySelector('.metric-card:nth-child(2) .metric-period');
    const reviewsPeriod = document.querySelector('.metric-card:nth-child(3) .metric-period');

    if (ordersPeriod) ordersPeriod.textContent = 'Need restocking';
    if (reviewsPeriod) reviewsPeriod.textContent = `${metrics.averageRating} avg rating`;

    console.log('Dashboard metrics updated:', metrics);
}

function renderProductsFallback() {
    console.log('Using fallback render (products.js not loaded)');
    const container = document.getElementById('products-container');
    if (!container || !allProducts.length) return;

    container.innerHTML = '';

    allProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                <div class="image-placeholder">
                    <i class="fas fa-cube"></i>
                </div>
                <div class="product-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                    ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </div>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="price">$${product.price.toFixed(2)}</p>
                <p>${product.description}</p>
                <button onclick="alert('${product.name} - $${product.price}')">
                    View Details
                </button>
            </div>
        `;
        container.appendChild(card);
    });

    console.log(`${allProducts.length} products rendered (fallback)`);
}

window.app = window.app || {};
window.app.API_BASE_URL = API_BASE_URL;
window.app.showSection = showSection;
window.app.loadProducts = loadProducts;