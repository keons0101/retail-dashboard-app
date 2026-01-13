const cartState = {
    items: [],
    total: 0,
    subtotal: 0,
    tax: 0
};

function initCart() {
    loadCartFromStorage();
    updateCartUI();
    setupCartEventListeners();
    console.log('Cart initialized. Items:', cartState.items.length);
}

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('retailCart');
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            cartState.items = parsedCart.items || [];
            calculateCartTotals();
            console.log('Cart has been loaded from local storage:', cartState.items);
        }
    } catch (error) {
        console.error('There was an error while loading the cart from local storage:', error);
        cartState.items = [];
    }
}

function saveCartToStorage() {
    try {
        localStorage.setItem('retailCart', JSON.stringify({
            items: cartState.items,
            timestamp: new Date().toISOString()
        }));
        console.log('Cart has been saved in local storage');
    } catch (error) {
        console.error('There was an error while loading the cart from local storage:', error);
    }
}

function addToCart(productId, quantity = 1) {
    // Search for the product
    const product = window.app.allProducts.find(p => p.id === productId);
    
    if (!product) {
        console.error('Product not found:', productId);
        alert('Error: Product not found');
        return false;
    }
    
    // Check for available stock
    if (product.stock <= 0) {
        alert(`"${product.name}" is out of stock and can't be added in your cart`);
        return false;
    }
    
    // Check if it's already in the cart
    const existingItemIndex = cartState.items.findIndex(item => item.id === productId);
    
    if (existingItemIndex >= 0) {
        const newQuantity = cartState.items[existingItemIndex].quantity + quantity;
        
        if (newQuantity > product.stock) {
            alert(`There are ${product.stock} avaible units of "${product.name}".`);
            return false;
        }
        
        cartState.items[existingItemIndex].quantity = newQuantity;
        cartState.items[existingItemIndex].total = product.price * newQuantity;
    } else {
        if (quantity > product.stock) {
            alert(`There are ${product.stock} avaible units of "${product.name}".`);
            return false;
        }
        
        // Add new item in cart
        cartState.items.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            total: product.price * quantity,
            category: product.category,
            stock: product.stock
        });
    }
    
    calculateCartTotals();
    updateCartUI();
    saveCartToStorage();
    
    showCartNotification(`"${product.name}" added to your cart`);
    
    return true;
}

// Remove a product from the cart
function removeFromCart(productId, removeCompletely = false) {
    const itemIndex = cartState.items.findIndex(item => item.id === productId);
    
    if (itemIndex < 0) {
        return false; // Item not found
    }
    
    const itemName = cartState.items[itemIndex].name;
    const currentQuantity = cartState.items[itemIndex].quantity;
    
    if (removeCompletely || currentQuantity === 1) {
        cartState.items.splice(itemIndex, 1);
        showCartNotification(`"${itemName}" removed from the cart`);
    } else {
        // Remove one by one
        cartState.items[itemIndex].quantity--;
        cartState.items[itemIndex].total = 
            cartState.items[itemIndex].price * cartState.items[itemIndex].quantity;
        showCartNotification(`Quantity of "${itemName}" reduced to ${cartState.items[itemIndex].quantity}`);
    }
    
    calculateCartTotals();
    updateCartUI();
    saveCartToStorage();
    
    return true;
}

// Calculate prices
function calculateCartTotals() {
    cartState.subtotal = cartState.items.reduce((sum, item) => sum + item.total, 0);
    cartState.tax = cartState.subtotal * 0.10;
    cartState.total = cartState.subtotal + cartState.tax;
    
    cartState.subtotal = Math.round(cartState.subtotal * 100) / 100;
    cartState.tax = Math.round(cartState.tax * 100) / 100;
    cartState.total = Math.round(cartState.total * 100) / 100;
}

// Remove everything in the cart
function clearCart() {
    if (cartState.items.length === 0) return;
    
    if (confirm('Are you sure you want to remove everything in cart?')) {
        cartState.items = [];
        calculateCartTotals();
        updateCartUI();
        saveCartToStorage();
        
        showCartNotification('Cart is empty now');
    }
}

function updateCartUI() {
    const cartCount = cartState.items.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    const cartEmptyElement = document.getElementById('cart-empty-state');
    const cartWithItemsElement = document.getElementById('cart-with-items');
    
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        cartCountElement.style.display = cartCount > 0 ? 'flex' : 'none';
    }
    
    if (cartEmptyElement && cartWithItemsElement) {
        if (cartState.items.length === 0) {
            cartEmptyElement.style.display = 'block';
            cartWithItemsElement.style.display = 'none';
        } else {
            cartEmptyElement.style.display = 'none';
            cartWithItemsElement.style.display = 'flex';
            
            const cartCountTitle = document.getElementById('cart-count');
            if (cartCountTitle) {
                cartCountTitle.textContent = cartCount;
            }
            
            renderCartItems();
            
            updateCartTotalsUI();
            
            const checkoutBtn = document.getElementById('checkout-btn');
            if (checkoutBtn) {
                checkoutBtn.disabled = cartState.items.length === 0;
            }
        }
    }
    
    updateProductButtons();
}

function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    cartState.items.forEach(item => {
        const itemElement = createCartItemElement(item);
        container.appendChild(itemElement);
    });
}

function createCartItemElement(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.dataset.id = item.id;
    
    const categoryIcon = getCategoryIcon(item.category);
    
    div.innerHTML = `
        <div class="cart-item-image">
            <i class="fas fa-${categoryIcon}"></i>
        </div>
        
        <div class="cart-item-details">
            <div class="cart-item-header">
                <h3 class="cart-item-title">${item.name}</h3>
                <span class="cart-item-price">$${item.price.toFixed(2)}</span>
            </div>
            
            <div class="cart-item-category">
                <i class="fas fa-tag"></i> ${item.category}
            </div>
            
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn decrease-btn" data-id="${item.id}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn increase-btn" data-id="${item.id}" 
                            ${item.quantity >= item.stock ? 'disabled' : ''}>
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                
                <div class="item-total">
                    <strong>$${item.total.toFixed(2)}</strong>
                </div>
                
                <button class="btn-remove-item" data-id="${item.id}">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `;
    
    return div;
}

function updateCartTotalsUI() {
    const subtotalElement = document.getElementById('cart-subtotal');
    const taxElement = document.getElementById('cart-tax');
    const totalElement = document.getElementById('cart-total');
    
    if (subtotalElement) subtotalElement.textContent = `$${cartState.subtotal.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `$${cartState.tax.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `$${cartState.total.toFixed(2)}`;
}

function updateProductButtons() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        const productId = parseInt(button.dataset.id);
        const product = window.app.allProducts.find(p => p.id === productId);
        
        if (product) {
            const cartItem = cartState.items.find(item => item.id === productId);
            const inCartQuantity = cartItem ? cartItem.quantity : 0;
            
            if (product.stock <= 0) {
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-times"></i> Out of Stock';
            } else if (inCartQuantity >= product.stock) {
                button.disabled = true;
                button.innerHTML = `<i class="fas fa-check"></i> Max (${inCartQuantity})`;
            } else if (inCartQuantity > 0) {
                button.disabled = false;
                button.innerHTML = `<i class="fas fa-cart-plus"></i> Add More (${inCartQuantity} in cart)`;
            } else {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
            }
        }
    });
}

function setupCartEventListeners() {
    document.addEventListener('click', (event) => {
        const target = event.target;
        
        if (target.id === 'clear-cart-btn' || target.closest('#clear-cart-btn')) {
            clearCart();
            return;
        }
        
        if (target.id === 'checkout-btn') {
            processCheckout();
            return;
        }
        
        if (target.classList.contains('decrease-btn') || target.closest('.decrease-btn')) {
            const button = target.classList.contains('decrease-btn') ? target : target.closest('.decrease-btn');
            const productId = parseInt(button.dataset.id);
            removeFromCart(productId, false);
            return;
        }
        
        if (target.classList.contains('increase-btn') || target.closest('.increase-btn')) {
            const button = target.classList.contains('increase-btn') ? target : target.closest('.increase-btn');
            const productId = parseInt(button.dataset.id);
            addToCart(productId, 1);
            return;
        }
        
        if (target.classList.contains('btn-remove-item') || target.closest('.btn-remove-item')) {
            const button = target.classList.contains('btn-remove-item') ? target : target.closest('.btn-remove-item');
            const productId = parseInt(button.dataset.id);
            removeFromCart(productId, true);
        }
    });
}

function showCartNotification(message) {
    let notification = document.getElementById('cart-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'cart-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            transform: translateX(150%);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(notification);
    }
    
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    notification.style.transform = 'translateX(0)';
    
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
    }, 3000);
}

function processCheckout() {
    if (cartState.items.length === 0) {
        alert('Cart is empty');
        return;
    }
    
    alert(`Checkout procesado por $${cartState.total.toFixed(2)}\n\nEsta funcionalidad se completará en el Día 4 (Compras y Stock)`);
    
    clearCart();
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

window.cartModule = {
    initCart,
    addToCart,
    removeFromCart,
    clearCart,
    getCartCount: () => cartState.items.reduce((sum, item) => sum + item.quantity, 0),
    getCartItems: () => [...cartState.items],
    getCartTotal: () => cartState.total
};