// Store JavaScript - Product Display, Cart Management, and Navigation

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// ========== PRODUCT LOADING FUNCTIONS ==========

// Load products from both localStorage and server
async function loadProducts() {
    try {
        console.log('Loading products...');
        
        // Show loading state
        const container = document.getElementById('productsContainer');
        if (container) {
            container.innerHTML = `
                <div class="loading" style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #1a6fc4; margin-bottom: 20px;"></i>
                    <p style="color: #666;">Loading products...</p>
                </div>
            `;
        }
        
        // First, try to load from localStorage (fastest)
        const savedProducts = localStorage.getItem('aquapure_products');
        
        if (savedProducts) {
            try {
                const products = JSON.parse(savedProducts);
                console.log(`Loaded ${products.length} products from localStorage`);
                displayProducts(products);
                
                // In background, try to update from server for fresh data
                setTimeout(loadProductsFromServer, 1000);
            } catch (error) {
                console.error('Error parsing localStorage products:', error);
                // If localStorage is corrupted, load from server
                await loadProductsFromServer();
            }
        } else {
            // No localStorage data, load from server
            await loadProductsFromServer();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Unable to load products. Please check your internet connection and try again.');
    }
}

// Load products from server (JSON file)
async function loadProductsFromServer() {
    try {
        console.log('Loading products from server...');
        
        // Try to load from products.json file
        const response = await fetch('products.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const products = await response.json();
        console.log(`Loaded ${products.length} products from server`);
        
        // Validate products
        if (!Array.isArray(products)) {
            throw new Error('Invalid products data format');
        }
        
        // Save to localStorage for faster loading next time
        localStorage.setItem('aquapure_products', JSON.stringify(products));
        
        // Display products
        displayProducts(products);
        
    } catch (error) {
        console.error('Error loading from server:', error);
        
        // Show user-friendly error message
        showError('Unable to load products from server. Showing cached products if available.');
        
        // Try to show any cached products
        const savedProducts = localStorage.getItem('aquapure_products');
        if (savedProducts) {
            try {
                const products = JSON.parse(savedProducts);
                displayProducts(products);
            } catch (parseError) {
                showError('No products available. Please try again later.');
            }
        } else {
            // No products at all, show empty state
            showNoProducts();
        }
    }
}

// Display error message
function showError(message) {
    const container = document.getElementById('productsContainer');
    if (container) {
        container.innerHTML = `
            <div class="error-state" style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff9800; margin-bottom: 20px;"></i>
                <h3 style="color: #d35400; margin-bottom: 10px;">Oops! Something went wrong</h3>
                <p style="color: #666; margin-bottom: 20px;">${message}</p>
                <button class="btn" onclick="loadProducts()" style="background: #1a6fc4;">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
}

// Show no products message
function showNoProducts() {
    const container = document.getElementById('productsContainer');
    if (container) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                <i class="fas fa-box-open" style="font-size: 3rem; color: #ddd; margin-bottom: 20px;"></i>
                <h3 style="color: #666; margin-bottom: 10px;">No Products Available</h3>
                <p style="color: #888; margin-bottom: 20px;">Check back soon for our latest water purifiers!</p>
            </div>
        `;
    }
}

// ========== PRODUCT DISPLAY FUNCTIONS ==========

// Display products on the page
function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    if (!products || products.length === 0) {
        showNoProducts();
        return;
    }
    
    console.log(`Displaying ${products.length} products`);
    
    container.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image" onclick="viewProduct('${product.id}')">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';">
                <div class="image-overlay">
                    <i class="fas fa-search"></i> Click to View Details
                </div>
            </div>
            <div class="product-info">
                <h3 onclick="viewProduct('${product.id}')" class="product-title">
                    ${product.name}
                </h3>
                <div class="product-price">₹${product.price.toLocaleString('en-IN')}</div>
                
                <p class="product-description">
                    ${product.description.length > 100 ? product.description.substring(0, 100) + '...' : product.description}
                    ${product.description.length > 100 ? '<span class="read-more" onclick="viewProduct(\'' + product.id + '\')">Read More</span>' : ''}
                </p>
                
                <div class="product-features">
                    ${product.features ? product.features.slice(0, 3).map(feature => 
                        `<span class="feature-tag">${feature}</span>`
                    ).join('') : ''}
                </div>
                
                <div class="product-stock">
                    <i class="fas fa-cubes"></i>
                    <span class="stock-text ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                        ${product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
                    </span>
                </div>
                
                <div class="product-actions">
                    <button class="btn btn-view" onclick="viewProduct('${product.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn btn-cart" onclick="addToCart('${product.id}')" 
                            ${product.stock <= 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add CSS styles if not already added
    addProductCardStyles();
}

// ========== PRODUCT NAVIGATION ==========

// View product details
function viewProduct(productId) {
    console.log(`Viewing product ${productId}`);
    
    // Save current scroll position (optional, for back button)
    sessionStorage.setItem('scrollPosition', window.pageYOffset);
    
    // Redirect to product details page
    window.location.href = `product-details.html?id=${productId}`;
}

// ========== CART MANAGEMENT FUNCTIONS ==========

// Add product to cart
async function addToCart(productId) {
    console.log(`Adding product ${productId} to cart`);
    
    try {
        // Get product details
        const product = await getProductById(productId);
        
        if (!product) {
            showNotification('Product not found!', 'error');
            return;
        }
        
        // Check stock
        if (product.stock <= 0) {
            showNotification('This product is out of stock!', 'error');
            return;
        }
        
        // Check if already in cart
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            // Check if exceeding stock
            if (existingItem.quantity >= product.stock) {
                showNotification(`Only ${product.stock} items available in stock!`, 'error');
                return;
            }
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        // Update cart
        updateCart();
        saveCart();
        
        // Show success notification
        showNotification(`${product.name} added to cart!`);
        
        // Optional: Open cart modal
        // toggleCart();
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding product to cart!', 'error');
    }
}

// Get product by ID
async function getProductById(productId) {
    try {
        // First check localStorage
        const savedProducts = localStorage.getItem('aquapure_products');
        if (savedProducts) {
            const products = JSON.parse(savedProducts);
            const product = products.find(p => p.id === productId);
            if (product) return product;
        }
        
        // If not found, try server
        const response = await fetch('products.json');
        const products = await response.json();
        return products.find(p => p.id === productId);
        
    } catch (error) {
        console.error('Error getting product:', error);
        return null;
    }
}

// Remove item from cart
function removeFromCart(productId) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const removedItem = cart[itemIndex];
        cart.splice(itemIndex, 1);
        updateCart();
        saveCart();
        showNotification(`${removedItem.name} removed from cart`);
    }
}

// Update cart quantity
function updateCartQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        const item = cart[itemIndex];
        const newQuantity = item.quantity + change;
        
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }
        
        // Check stock (optional - would need to fetch current stock)
        item.quantity = newQuantity;
        updateCart();
        saveCart();
    }
}

// Update cart display
function updateCart() {
    // Update cart count
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        cartCountElement.style.display = cartCount > 0 ? 'flex' : 'none';
    }
    
    // Update cart modal if open
    updateCartModal();
}

// Update cart modal
function updateCartModal() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartTotal) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotal.textContent = '0';
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="cart-item-total">
                        ₹${itemTotal.toLocaleString('en-IN')}
                    </div>
                    <button class="remove-btn" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    cartTotal.textContent = total.toLocaleString('en-IN');
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// ========== CART MODAL FUNCTIONS ==========

// Toggle cart modal
function toggleCart() {
    const modal = document.getElementById('cartModal');
    if (!modal) return;
    
    modal.style.display = 'flex';
    updateCartModal();
}

// Close cart modal
function closeCart() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Prepare WhatsApp message for order
    const orderItems = cart.map(item => 
        `• ${item.name} (${item.quantity} × ₹${item.price.toLocaleString('en-IN')})`
    ).join('\n');
    
    const whatsappMessage = encodeURIComponent(
        `📱 *NEW ORDER - AquaPure*\n\n` +
        `Order Details:\n${orderItems}\n\n` +
        `💰 *Total Amount:* ₹${total.toLocaleString('en-IN')}\n\n` +
        `Please contact me to confirm this order. Thank you!`
    );
    
    // Get WhatsApp number from localStorage or use default
    const savedWhatsApp = localStorage.getItem('whatsapp_contact');
    const whatsappNumber = savedWhatsApp || '919876543210';
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
    
    // Open WhatsApp
    window.open(whatsappURL, '_blank');
    
    // Show confirmation
    showNotification('Opening WhatsApp to confirm your order!', 'success');
    
    // Clear cart after order (optional)
    // cart = [];
    // saveCart();
    // updateCart();
    // closeCart();
}

// ========== NOTIFICATION SYSTEM ==========

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Add CSS if not exists
    addNotificationStyles();
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========== UTILITY FUNCTIONS ==========

// Add notification styles
function addNotificationStyles() {
    if (!document.getElementById('notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #2ecc71;
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 12px;
                animation: slideInRight 0.3s ease;
                max-width: 400px;
                font-weight: 500;
            }
            .notification.error {
                background: #ff4757;
            }
            .notification.info {
                background: #3498db;
            }
            .notification.warning {
                background: #f39c12;
            }
            .notification i {
                font-size: 1.2rem;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Add product card styles
function addProductCardStyles() {
    if (!document.getElementById('productCardStyles')) {
        const style = document.createElement('style');
        style.id = 'productCardStyles';
        style.textContent = `
            /* Product Card Enhancements */
            .product-image {
                position: relative;
                cursor: pointer;
                overflow: hidden;
            }
            
            .image-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(13, 77, 140, 0);
                color: transparent;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 1.1rem;
                transition: all 0.3s;
                flex-direction: column;
                gap: 10px;
            }
            
            .product-image:hover .image-overlay {
                background: rgba(13, 77, 140, 0.85);
                color: white;
            }
            
            .product-image:hover .image-overlay i {
                transform: scale(1.2);
            }
            
            .image-overlay i {
                font-size: 2rem;
                transition: transform 0.3s;
            }
            
            .product-title {
                cursor: pointer;
                transition: color 0.3s;
            }
            
            .product-title:hover {
                color: #1a6fc4;
            }
            
            .read-more {
                color: #1a6fc4;
                cursor: pointer;
                font-weight: 500;
                margin-left: 5px;
            }
            
            .read-more:hover {
                text-decoration: underline;
            }
            
            .product-stock {
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 10px 0;
                font-size: 0.9rem;
            }
            
            .stock-text.in-stock {
                color: #2ecc71;
                font-weight: 500;
            }
            
            .stock-text.out-of-stock {
                color: #ff4757;
                font-weight: 500;
            }
            
            .product-actions {
                display: flex;
                gap: 10px;
                margin-top: 15px;
            }
            
            .btn-view {
                background: #6c757d;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
                font-weight: 600;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                flex: 1;
            }
            
            .btn-view:hover {
                background: #5a6268;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(108, 117, 125, 0.3);
            }
            
            .btn-cart {
                background: #1a6fc4;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
                font-weight: 600;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                flex: 1;
            }
            
            .btn-cart:hover:not(:disabled) {
                background: #0d4d8c;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(13, 77, 140, 0.3);
            }
            
            /* Cart Modal Enhancements */
            .cart-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid #eee;
                gap: 15px;
            }
            
            .cart-item-info {
                flex: 1;
            }
            
            .cart-item-name {
                font-weight: 600;
                color: #0d4d8c;
                margin-bottom: 5px;
            }
            
            .cart-item-price {
                color: #666;
                font-size: 0.9rem;
            }
            
            .cart-item-controls {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .quantity-controls {
                display: flex;
                align-items: center;
                gap: 10px;
                background: #f5f7fa;
                padding: 5px 10px;
                border-radius: 5px;
            }
            
            .quantity-btn {
                background: none;
                border: none;
                color: #0d4d8c;
                cursor: pointer;
                font-size: 0.9rem;
                padding: 5px;
            }
            
            .quantity {
                font-weight: 600;
                min-width: 20px;
                text-align: center;
            }
            
            .cart-item-total {
                font-weight: 600;
                color: #2ecc71;
                min-width: 80px;
                text-align: right;
            }
            
            .remove-btn {
                background: none;
                border: none;
                color: #ff4757;
                cursor: pointer;
                font-size: 1rem;
                padding: 5px;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .product-actions {
                    flex-direction: column;
                }
                
                .cart-item {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .cart-item-controls {
                    justify-content: space-between;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========== INITIALIZATION ==========

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing store...');
    
    // Load products
    loadProducts();
    
    // Initialize cart
    updateCart();
    
    // Setup event listeners
    setupEventListeners();
    
    // Restore scroll position if coming back from product details
    const scrollPosition = sessionStorage.getItem('scrollPosition');
    if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition));
        sessionStorage.removeItem('scrollPosition');
    }
    
    console.log('Store initialized successfully');
});

// Setup event listeners
function setupEventListeners() {
    // Close cart when clicking outside
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeCart();
            }
        });
    }
    
    // Close cart on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeCart();
        }
    });
    
    // Add to cart buttons (event delegation)
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn-cart') && !e.target.closest('.btn-cart:disabled')) {
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                const productId = productCard.dataset.productId;
                if (productId) {
                    addToCart(productId);
                }
            }
        }
    });
}

// Export for debugging
if (typeof window !== 'undefined') {
    window.store = {
        cart,
        loadProducts,
        addToCart,
        removeFromCart,
        updateCart,
        viewProduct,
        checkout
    };
}