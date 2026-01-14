// reviews.js - Sistema de reseñas

const ReviewsModule = {
    showAddReviewModal(productId) {
        const product = window.app.allProducts.find(p => p.id === productId);
        if (!product) {
            alert('Product not found');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'review-modal';
        modal.id = 'review-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add a Review for ${product.name}</h3>
                    <button class="close-review-modal">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="current-rating">
                        <p>Current rating: <strong>${product.rating.toFixed(1)}</strong> / 5.0</p>
                        <div class="current-stars">${this.createRatingStars(product.rating)}</div>
                    </div>
                    
                    <div class="review-form">
                        <div class="form-group">
                            <label for="reviewer-name">Your Name</label>
                            <input type="text" id="reviewer-name" placeholder="Enter your name" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="review-rating">Rating</label>
                            <div class="star-rating">
                                ${[1, 2, 3, 4, 5].map(star => `
                                    <span class="star" data-value="${star}">
                                        <i class="far fa-star"></i>
                                    </span>
                                `).join('')}
                            </div>
                            <input type="hidden" id="selected-rating" value="0">
                        </div>
                        
                        <div class="form-group">
                            <label for="review-comment">Your Review</label>
                            <textarea id="review-comment" rows="4" placeholder="Share your experience with this product..." required></textarea>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-outline cancel-review">Cancel</button>
                        <button class="btn btn-primary submit-review" disabled>
                            <i class="fas fa-paper-plane"></i> Submit Review
                        </button>
                    </div>
                    
                    <div class="processing-message" style="display: none;">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Submitting your review...</p>
                    </div>
                </div>
            </div>
        `;
        
        const styles = document.createElement('style');
        styles.textContent = `
            .review-modal {
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
            
            .review-modal .modal-content {
                background: white;
                border-radius: var(--border-radius);
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            
            .current-rating {
                text-align: center;
                margin-bottom: 25px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            .current-rating p {
                margin: 0 0 10px 0;
                font-size: 16px;
            }
            
            .current-stars {
                color: #fbbf24;
                font-size: 20px;
            }
            
            .star-rating {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin: 15px 0;
            }
            
            .star {
                cursor: pointer;
                font-size: 32px;
                color: #e2e8f0;
                transition: color 0.2s;
            }
            
            .star:hover,
            .star.active {
                color: #fbbf24;
            }
            
            .star.active ~ .star {
                color: #e2e8f0;
            }
            
            .review-form textarea {
                width: 100%;
                padding: 12px;
                border: 1px solid var(--light-gray);
                border-radius: 6px;
                font-size: 16px;
                font-family: inherit;
                resize: vertical;
            }
            
            .review-form textarea:focus {
                outline: none;
                border-color: var(--primary);
            }
            
            .modal-actions {
                display: flex;
                gap: 15px;
                margin-top: 25px;
            }
            
            .modal-actions .btn {
                flex: 1;
                padding: 15px;
            }
        `;
        
        document.head.appendChild(styles);
        document.body.appendChild(modal);
        
        const stars = modal.querySelectorAll('.star');
        const selectedRatingInput = document.getElementById('selected-rating');
        const submitButton = modal.querySelector('.submit-review');
        
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const value = parseInt(star.dataset.value);
                selectedRatingInput.value = value;
                
                stars.forEach((s, index) => {
                    if (index < value) {
                        s.classList.add('active');
                        s.querySelector('i').className = 'fas fa-star';
                    } else {
                        s.classList.remove('active');
                        s.querySelector('i').className = 'far fa-star';
                    }
                });
                
                this.validateReviewForm();
            });
        });
        
        const nameInput = document.getElementById('reviewer-name');
        const commentInput = document.getElementById('review-comment');
        
        nameInput.addEventListener('input', this.validateReviewForm);
        commentInput.addEventListener('input', this.validateReviewForm);
        
        modal.querySelector('.close-review-modal').addEventListener('click', () => {
            modal.remove();
            styles.remove();
        });
        
        modal.querySelector('.cancel-review').addEventListener('click', () => {
            modal.remove();
            styles.remove();
        });
        
        modal.querySelector('.submit-review').addEventListener('click', async () => {
            await this.submitReview(productId);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                styles.remove();
            }
        });
    },
    
    validateReviewForm() {
        const modal = document.getElementById('review-modal');
        if (!modal) return;
        
        const name = document.getElementById('reviewer-name').value.trim();
        const rating = parseInt(document.getElementById('selected-rating').value);
        const comment = document.getElementById('review-comment').value.trim();
        const submitButton = modal.querySelector('.submit-review');
        
        const isValid = name.length > 0 && rating > 0 && comment.length > 0;
        submitButton.disabled = !isValid;
    },
    
    async submitReview(productId) {
        const modal = document.getElementById('review-modal');
        if (!modal) return;
        
        const nameInput = document.getElementById('reviewer-name');
        const ratingInput = document.getElementById('selected-rating');
        const commentInput = document.getElementById('review-comment');
        const processMessage = modal.querySelector('.processing-message');
        const modalActions = modal.querySelector('.modal-actions');
        
        modalActions.style.display = 'none';
        processMessage.style.display = 'block';
        
        try {
            const reviewData = {
                user: nameInput.value.trim(),
                rating: parseInt(ratingInput.value),
                comment: commentInput.value.trim()
            };
            
            const response = await fetch(`${window.app.API_BASE_URL}/api/products/${productId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewData)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to submit review');
            }
            
            if (result.success) {
                const productIndex = window.app.allProducts.findIndex(p => p.id === productId);
                if (productIndex !== -1) {
                    window.app.allProducts[productIndex].reviews.push(result.review);
                    window.app.allProducts[productIndex].rating = result.newAverageRating;
                    
                    if (window.renderProducts) {
                        window.renderProducts();
                    }
                    
                    this.showReviewSuccess(result.review, result.newAverageRating);
                }
                
                setTimeout(() => {
                    modal.remove();
                    const styles = document.querySelector('style');
                    if (styles && styles.parentNode === document.head) {
                        styles.remove();
                    }
                }, 1000);
            }
            
        } catch (error) {
            modalActions.style.display = 'flex';
            processMessage.style.display = 'none';
            
            alert(`Failed to submit review: ${error.message}`);
            console.error('Review submission error:', error);
        }
    },
    
    showReviewSuccess(review, newAverage) {
        const successMsg = document.createElement('div');
        successMsg.className = 'review-success';
        successMsg.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <h4>Review Submitted!</h4>
                <p>Thank you for your feedback.</p>
                <p>New average rating: <strong>${newAverage.toFixed(1)}</strong> / 5.0</p>
            </div>
        `;
        
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #38a169;
            color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.remove();
            style.remove();
        }, 3000);
    },
    
    createRatingStars(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }
};

window.ReviewsModule = ReviewsModule;