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