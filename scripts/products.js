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