// Render all products
function renderProducts() {
    const productsContainer = document.getElementById('products-container');

    if (!productsContainer) {
        console.error("Product container wasn't found");
        return;
    }

    // Check if there are products
    if (!window.app.allProducts || window.app.allProducts.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open"></i>
                <h3>No products available</h3>
                <p>Products will be here soon</p>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .no-products {
                grid-column: 1 / -1;
                text-align: center;
                padding: 60px 20px;
                color: var(--gray);
            }
            .no-products i {
                font-size: 48px;
                margin-bottom: 20px;
                opacity: 0.5;
            }
        `;
        document.head.appendChild(style);
        return;
    }

    productsContainer.innerHTML = '';

    window.app.allProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });

    console.log(`${window.app.allProducts.length} rendered products`);
}

// Create a product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id;

    let stockStatus = '';
    let stockClass = '';

    if (product.stock <= 0) {
        stockStatus = 'Out of Stock';
        stockClass = 'out-of-stock';
    } else if (product.stock <= 5) {
        stockStatus = `Only ${product.stock} left`;
        stockClass = 'low-stock';
    } else if (product.stock <= 10) {
        stockStatus = `${product.stock} in stock`;
        stockClass = 'medium-stock';
    } else {
        stockStatus = 'In Stock';
        stockClass = 'in-stock';
    }

    // Set rating color based on its value
    let ratingColor = '';
    if (product.rating >= 4.5) ratingColor = '#38a169';
    else if (product.rating >= 4.0) ratingColor = '#d69e2e';
    else ratingColor = '#e53e3e';

    // Rating stars
    const stars = createRatingStars(product.rating);

    // Card html
    card.innerHTML = `
        <div class="product-image">
            <div class="image-placeholder">
                <i class="fas fa-${getCategoryIcon(product.category)}"></i>
            </div>
            <div class="product-badge ${stockClass}">${stockStatus}</div>
        </div>
        
        <div class="product-info">
            <div class="product-header">
                <h3 class="product-title">${product.name}</h3>
                <span class="product-price">$${product.price.toFixed(2)}</span>
            </div>
            
            <div class="product-category">
                <i class="fas fa-tag"></i> ${product.category}
            </div>
            
            <p class="product-description">${product.description}</p>
            
            <div class="product-rating">
                <div class="stars">${stars}</div>
                <span class="rating-value" style="color: ${ratingColor}">
                    ${product.rating.toFixed(1)}
                </span>
                <span class="rating-count">
                    (${product.reviews ? product.reviews.length : 0} reviews)
                </span>
            </div>
            
            <div class="product-actions">
                <button class="btn btn-outline view-details" data-id="${product.id}">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="btn btn-primary add-to-cart" data-id="${product.id}" 
                        ${product.stock <= 0 ? 'disabled' : ''}>
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `;

    // Add event listeners for buttons
    const viewDetailsBtn = card.querySelector('.view-details');
    const addToCartBtn = card.querySelector('.add-to-cart');

    viewDetailsBtn.addEventListener('click', () => {
        viewProductDetails(product.id);
    });

    addToCartBtn.addEventListener('click', () => {
        if (window.cartModule && window.cartModule.addToCart) {
            const added = window.cartModule.addToCart(product.id, 1);
            if (added) {
                
            }
        } else {
            alert('Cart module is not loaded. Please recharge the page');
        }
    });

    return card;
}

function createRatingStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Full star
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }

    // Half star
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }

    // Empty star
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }

    return stars;
}

function getCategoryIcon(category) {
    const icons = {
        'Apparel': 'tshirt',
        'Electronics': 'laptop',
        'Home Goods': 'home',
        'Accessories': 'bag-shopping'
    };
    return icons[category] || 'cube';
}

function viewProductDetails(productId) {
    console.log(`View product details with ID: ${productId}`);

    // Temp alert
    const product = window.app.allProducts.find(p => p.id === productId);
    if (product) {
        alert(`Detalles de ${product.name}:\n\n` +
            `Precio: $${product.price}\n` +
            `Stock: ${product.stock} unidades\n` +
            `Rating: ${product.rating}/5\n\n` +
            `${product.description}`);
    }
}

function updateProductStockDisplays() {
    document.querySelectorAll('.product-card').forEach(card => {
        const productId = parseInt(card.dataset.id);
        const product = window.app.allProducts.find(p => p.id === productId);
        
        if (product) {
            const badge = card.querySelector('.product-badge');
            const addButton = card.querySelector('.add-to-cart');
            const cartItem = window.cartModule ? window.cartModule.getCartItems().find(item => item.id === productId) : null;
            const inCartQuantity = cartItem ? cartItem.quantity : 0;
            
            if (badge) {
                if (product.stock <= 0) {
                    badge.textContent = 'Out of Stock';
                    badge.className = 'product-badge out-of-stock';
                } else if (product.stock - inCartQuantity <= 5) {
                    badge.textContent = `Only ${product.stock - inCartQuantity} left`;
                    badge.className = 'product-badge low-stock';
                } else if (product.stock - inCartQuantity <= 10) {
                    badge.textContent = `${product.stock - inCartQuantity} in stock`;
                    badge.className = 'product-badge medium-stock';
                } else {
                    badge.textContent = 'In Stock';
                    badge.className = 'product-badge in-stock';
                }
            }
            
            if (addButton) {
                if (product.stock <= 0) {
                    addButton.disabled = true;
                    addButton.innerHTML = '<i class="fas fa-times"></i> Out of Stock';
                } else if (inCartQuantity >= product.stock) {
                    addButton.disabled = true;
                    addButton.innerHTML = `<i class="fas fa-check"></i> Max (${inCartQuantity})`;
                } else if (inCartQuantity > 0) {
                    addButton.disabled = false;
                    addButton.innerHTML = `<i class="fas fa-cart-plus"></i> Add More (${inCartQuantity} in cart)`;
                }
            }
        }
    });
}

window.renderProducts = renderProducts;
window.createProductCard = createProductCard;
window.viewProductDetails = viewProductDetails;