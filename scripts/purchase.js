
const PurchaseModule = {
    // Process checkout
    async processCheckout(cartItems, total, customerInfo = {}) {
        console.log('Processing checkout with', cartItems.length, 'items');
        
        try {
            const purchaseData = {
                cartItems: cartItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                total: total,
                customerInfo: {
                    name: customerInfo.name || 'Guest Customer',
                    email: customerInfo.email || '',
                    timestamp: new Date().toISOString()
                }
            };
            
            const response = await fetch(`${window.app.API_BASE_URL}/api/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(purchaseData)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Purchase failed');
            }
            
            if (result.success) {
                console.log('Purchase successful:', result.order.orderId);
                return result;
            } else {
                throw new Error(result.message || 'Purchase failed');
            }
            
        } catch (error) {
            console.error('Checkout error:', error);
            throw error;
        }
    },
    
    showCheckoutModal() {
        const cartItems = window.cartModule ? window.cartModule.getCartItems() : [];
        const cartTotal = window.cartModule ? window.cartModule.getCartTotal() : 0;
        
        if (cartItems.length === 0) {
            alert('Your cart is empty');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'checkout-modal';
        modal.id = 'checkout-modal';
        
        const itemsList = cartItems.map(item => 
            `${item.quantity}x ${item.name}: $${item.total.toFixed(2)}`
        ).join('\n');
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Complete Your Purchase</h3>
                    <button class="close-modal">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="order-summary">
                        <h4>Order Summary</h4>
                        <div class="summary-items">
                            ${cartItems.map(item => `
                                <div class="summary-item">
                                    <span>${item.quantity}x ${item.name}</span>
                                    <span>$${item.total.toFixed(2)}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="summary-total">
                            <strong>Total: $${cartTotal.toFixed(2)}</strong>
                        </div>
                    </div>
                    
                    <div class="customer-info">
                        <h4>Customer Information</h4>
                        <div class="form-group">
                            <label for="customer-name">Name</label>
                            <input type="text" id="customer-name" placeholder="Your name" value="Guest Customer">
                        </div>
                        <div class="form-group">
                            <label for="customer-email">Email (optional)</label>
                            <input type="email" id="customer-email" placeholder="your.email@example.com">
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-outline cancel-checkout">Cancel</button>
                        <button class="btn btn-primary confirm-purchase">
                            <i class="fas fa-lock"></i> Confirm Purchase
                        </button>
                    </div>
                    
                    <div class="processing-message" style="display: none;">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Processing your order...</p>
                    </div>
                </div>
            </div>
        `;
        
        const styles = document.createElement('style');
        styles.textContent = `
            .checkout-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            
            .modal-content {
                background: white;
                border-radius: var(--border-radius);
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 30px;
                border-bottom: 1px solid var(--light-gray);
            }
            
            .modal-header h3 {
                margin: 0;
                color: var(--dark);
            }
            
            .close-modal {
                background: none;
                border: none;
                font-size: 28px;
                cursor: pointer;
                color: var(--gray);
                line-height: 1;
            }
            
            .close-modal:hover {
                color: var(--dark);
            }
            
            .modal-body {
                padding: 30px;
            }
            
            .order-summary {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 25px;
            }
            
            .order-summary h4 {
                margin-top: 0;
                margin-bottom: 15px;
                color: var(--dark);
            }
            
            .summary-items {
                margin-bottom: 15px;
            }
            
            .summary-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 14px;
            }
            
            .summary-total {
                border-top: 2px solid var(--light-gray);
                padding-top: 15px;
                display: flex;
                justify-content: space-between;
                font-size: 18px;
            }
            
            .customer-info {
                margin-bottom: 25px;
            }
            
            .customer-info h4 {
                margin-top: 0;
                margin-bottom: 15px;
                color: var(--dark);
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                color: var(--dark);
            }
            
            .form-group input {
                width: 100%;
                padding: 12px;
                border: 1px solid var(--light-gray);
                border-radius: 6px;
                font-size: 16px;
            }
            
            .form-group input:focus {
                outline: none;
                border-color: var(--primary);
            }
            
            .modal-actions {
                display: flex;
                gap: 15px;
            }
            
            .modal-actions .btn {
                flex: 1;
                padding: 15px;
            }
            
            .processing-message {
                text-align: center;
                padding: 30px;
                color: var(--gray);
            }
            
            .processing-message i {
                font-size: 32px;
                margin-bottom: 15px;
                color: var(--primary);
            }
        `;
        
        document.head.appendChild(styles);
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
            styles.remove();
        });
        
        modal.querySelector('.cancel-checkout').addEventListener('click', () => {
            modal.remove();
            styles.remove();
        });
        
        modal.querySelector('.confirm-purchase').addEventListener('click', async () => {
            const nameInput = document.getElementById('customer-name');
            const emailInput = document.getElementById('customer-email');
            const processMessage = modal.querySelector('.processing-message');
            const modalActions = modal.querySelector('.modal-actions');
            
            modalActions.style.display = 'none';
            processMessage.style.display = 'block';
            
            try {
                const customerInfo = {
                    name: nameInput.value.trim(),
                    email: emailInput.value.trim()
                };
                
                const result = await this.processCheckout(cartItems, cartTotal, customerInfo);
                
                this.showReceipt(result.order);
                
                if (window.cartModule && window.cartModule.clearCart) {
                    window.cartModule.clearCart();
                }
                
                setTimeout(() => {
                    modal.remove();
                    styles.remove();
                }, 2000);
                
            } catch (error) {
                modalActions.style.display = 'flex';
                processMessage.style.display = 'none';
                
                alert(`Purchase failed: ${error.message}`);
                console.error('Purchase error:', error);
            }
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                styles.remove();
            }
        });
    },
    
    showReceipt(order) {
        const receipt = document.createElement('div');
        receipt.className = 'purchase-receipt';
        
        receipt.innerHTML = `
            <div class="receipt-content">
                <div class="receipt-header">
                    <i class="fas fa-check-circle"></i>
                    <h3>Purchase Successful!</h3>
                    <p>Order ID: ${order.orderId}</p>
                </div>
                
                <div class="receipt-details">
                    <div class="receipt-row">
                        <span>Date:</span>
                        <span>${new Date(order.date).toLocaleDateString()}</span>
                    </div>
                    
                    ${order.customer.name ? `
                    <div class="receipt-row">
                        <span>Customer:</span>
                        <span>${order.customer.name}</span>
                    </div>
                    ` : ''}
                    
                    <div class="receipt-items">
                        <h4>Items Purchased:</h4>
                        ${order.items.map(item => `
                            <div class="receipt-item">
                                <span>${item.quantity}x ${item.name}</span>
                                <span>$${item.subtotal.toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="receipt-total">
                        <span>Total:</span>
                        <span>$${order.total.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="receipt-footer">
                    <p>Thank you for your purchase!</p>
                    <button class="btn btn-primary close-receipt">Continue Shopping</button>
                </div>
            </div>
        `;
        
        const styles = document.createElement('style');
        styles.textContent = `
            .purchase-receipt {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1001;
            }
            
            .receipt-content {
                background: white;
                border-radius: var(--border-radius);
                width: 90%;
                max-width: 400px;
                padding: 30px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            
            .receipt-header {
                text-align: center;
                margin-bottom: 25px;
            }
            
            .receipt-header i {
                font-size: 48px;
                color: #38a169;
                margin-bottom: 15px;
            }
            
            .receipt-header h3 {
                margin: 0 0 5px 0;
                color: var(--dark);
            }
            
            .receipt-header p {
                color: var(--gray);
                margin: 0;
            }
            
            .receipt-details {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 25px;
            }
            
            .receipt-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-size: 14px;
            }
            
            .receipt-items {
                margin-top: 15px;
            }
            
            .receipt-items h4 {
                margin-top: 0;
                margin-bottom: 10px;
                color: var(--dark);
                font-size: 16px;
            }
            
            .receipt-item {
                display: flex;
                justify-content: space-between;
                font-size: 14px;
                margin-bottom: 5px;
            }
            
            .receipt-total {
                display: flex;
                justify-content: space-between;
                margin-top: 15px;
                padding-top: 15px;
                border-top: 2px solid var(--light-gray);
                font-weight: 700;
                font-size: 18px;
            }
            
            .receipt-footer {
                text-align: center;
            }
            
            .receipt-footer p {
                color: var(--gray);
                margin-bottom: 20px;
            }
            
            .close-receipt {
                width: 100%;
                padding: 15px;
            }
        `;
        
        document.head.appendChild(styles);
        document.body.appendChild(receipt);
        
        receipt.querySelector('.close-receipt').addEventListener('click', () => {
            receipt.remove();
            styles.remove();
        });
        
        setTimeout(() => {
            if (document.body.contains(receipt)) {
                receipt.remove();
                styles.remove();
            }
        }, 10000);
    }
};

window.PurchaseModule = PurchaseModule;