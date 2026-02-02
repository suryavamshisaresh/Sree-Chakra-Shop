// ========== GLOBAL VARIABLES ==========
let products = [];
let editingProductId = null;

// ========== LOGIN & SESSION FUNCTIONS ==========

// Check if admin is logged in
function checkAdminLogin() {
    const loginTime = localStorage.getItem('adminLoginTime');
    const loggedIn = localStorage.getItem('adminLoggedIn');
    
    // Check if login is valid (within 2 hours)
    if (loggedIn === 'true' && loginTime) {
        const timeDiff = Date.now() - parseInt(loginTime);
        const twoHours = 2 * 60 * 60 * 1000;
        
        if (timeDiff < twoHours) {
            // Valid session
            const adminContainer = document.getElementById('adminContainer');
            const loginRequired = document.getElementById('loginRequired');
            
            if (adminContainer) adminContainer.style.display = 'flex';
            if (loginRequired) loginRequired.style.display = 'none';
            
            loadProducts();
            startSessionTimer();
            updateStorageUsage();
            return true;
        }
    }
    
    // Not logged in or session expired
    const adminContainer = document.getElementById('adminContainer');
    const loginRequired = document.getElementById('loginRequired');
    
    if (adminContainer) adminContainer.style.display = 'none';
    if (loginRequired) loginRequired.style.display = 'flex';
    
    return false;
}

// Calculate session time remaining
function updateSessionTimer() {
    const loginTime = localStorage.getItem('adminLoginTime');
    if (!loginTime) return;
    
    const sessionDuration = 2 * 60 * 60 * 1000; // 2 hours
    const elapsed = Date.now() - parseInt(loginTime);
    const remaining = sessionDuration - elapsed;
    
    if (remaining <= 0) {
        // Session expired
        logout();
        return;
    }
    
    // Format time
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
    
    const sessionTimer = document.getElementById('sessionTimer');
    if (sessionTimer) {
        sessionTimer.textContent = `${hours}h ${minutes}m ${seconds}s`;
    }
    
    // Update login time display
    const loginTimeDisplay = document.getElementById('loginTime');
    if (loginTimeDisplay) {
        const loginDate = new Date(parseInt(loginTime));
        loginTimeDisplay.textContent = loginDate.toLocaleTimeString();
    }
}

// Start session timer
function startSessionTimer() {
    updateSessionTimer();
    setInterval(updateSessionTimer, 1000);
}

// Renew session
function renewSession() {
    localStorage.setItem('adminLoginTime', Date.now());
    showNotification('Session renewed for 2 hours!', 'success');
    updateSessionTimer();
}

// Logout
function logout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminLoginTime');
    window.location.href = 'admin-login.html';
}

// ========== PRODUCT MANAGEMENT FUNCTIONS ==========

// Get default products
function getDefaultProducts() {
    return [
        {
            id: '1',
            name: 'AquaPure RO+UV+UF',
            price: 18999,
            description: '7-stage purification with mineral retention technology',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            features: ['RO', 'UV', 'UF', 'TDS Controller', 'Mineral Retention'],
            category: 'ro+uv',
            stock: 50
        },
        {
            id: '2',
            name: 'PureFlow Gravity Purifier',
            price: 8999,
            description: 'Non-electric gravity based water purifier, no electricity needed',
            image: 'https://images.unsplash.com/photo-1564971668106-93f2f4b2e176?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
            features: ['Non-Electric', 'Gravity Based', '9L Capacity', 'No Maintenance'],
            category: 'gravity',
            stock: 30
        }
    ];
}

// Load products from local storage
function loadProducts() {
    try {
        const savedProducts = localStorage.getItem('aquapure_products');
        
        if (savedProducts) {
            products = JSON.parse(savedProducts);
        } else {
            // Load default products if none exist
            products = getDefaultProducts();
            saveProducts();
        }
        
        displayAdminProducts();
        updateStats();
    } catch (error) {
        console.error('Error loading products:', error);
        products = getDefaultProducts();
        saveProducts();
        displayAdminProducts();
        updateStats();
    }
}

// Display products in admin panel
function displayAdminProducts() {
    const container = document.getElementById('productsList');
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>No Products Yet</h3>
                <p>Add your first product to get started</p>
                <button class="btn btn-primary" onclick="showAddProductForm()">
                    <i class="fas fa-plus"></i> Add First Product
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-item">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/100x100?text=Product';">
            </div>
            <div class="product-details">
                <h3>${product.name}</h3>
                <div class="product-price">₹${product.price.toLocaleString('en-IN')}</div>
                <p class="product-description">${product.description.substring(0, 60)}...</p>
                <div class="product-meta">
                    <span class="product-category">${getCategoryName(product.category)}</span>
                    <span class="product-stock">Stock: ${product.stock}</span>
                </div>
            </div>
            <div class="product-actions">
                <button class="btn btn-success" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Get category display name
function getCategoryName(category) {
    const categories = {
        'ro': 'RO Water Purifier',
        'uv': 'UV Water Purifier',
        'ro+uv': 'RO+UV Water Purifier',
        'alkaline': 'Alkaline Water Purifier',
        'gravity': 'Gravity Based',
        'commercial': 'Commercial Purifier'
    };
    return categories[category] || category;
}

// Save products to local storage
function saveProducts() {
    try {
        localStorage.setItem('aquapure_products', JSON.stringify(products));
        updateStats();
    } catch (error) {
        console.error('Error saving products:', error);
        showNotification('Error saving products. Please try again.', 'error');
    }
}

// Delete product
function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    products = products.filter(p => p.id !== productId);
    saveProducts();
    displayAdminProducts();
    showNotification('Product deleted successfully!');
}

// Reset to default products
function resetToDefault() {
    if (!confirm('This will replace all products with default ones. Continue?')) {
        return;
    }
    
    products = getDefaultProducts();
    saveProducts();
    displayAdminProducts();
    showNotification('Reset to default products successfully!');
}

// ========== PRODUCT FORM FUNCTIONS ==========

// Show add product form
function showAddProductForm() {
    editingProductId = null;
    const modalTitle = document.getElementById('modalTitle');
    const productForm = document.getElementById('productForm');
    const productId = document.getElementById('productId');
    const productStock = document.getElementById('productStock');
    const productModal = document.getElementById('productModal');
    
    if (modalTitle) modalTitle.textContent = 'Add New Product';
    if (productForm) productForm.reset();
    if (productId) productId.value = '';
    if (productStock) productStock.value = '10';
    if (productModal) productModal.style.display = 'flex';
    
    // Clear image preview
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.innerHTML = '<p>Image will appear here</p>';
    }
}

// Update image preview
function updateImagePreview(imageUrl) {
    const preview = document.getElementById('imagePreview');
    if (!preview) return;
    
    if (imageUrl && imageUrl.trim() !== '') {
        preview.innerHTML = `
            <p>Image Preview:</p>
            <img src="${imageUrl}" alt="Preview" 
                 onerror="this.onerror=null; this.src='https://via.placeholder.com/150x150?text=Invalid+Image';" 
                 style="max-width: 150px; max-height: 150px; border-radius: 5px; margin-top: 5px;">
        `;
    } else {
        preview.innerHTML = '<p>Image will appear here</p>';
    }
}

// Edit product
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    editingProductId = productId;
    const modalTitle = document.getElementById('modalTitle');
    
    if (modalTitle) modalTitle.textContent = 'Edit Product';
    
    // Fill form fields
    if (document.getElementById('productId')) document.getElementById('productId').value = product.id;
    if (document.getElementById('productName')) document.getElementById('productName').value = product.name;
    if (document.getElementById('productPrice')) document.getElementById('productPrice').value = product.price;
    if (document.getElementById('productDescription')) document.getElementById('productDescription').value = product.description;
    if (document.getElementById('productImage')) document.getElementById('productImage').value = product.image;
    if (document.getElementById('productFeatures')) document.getElementById('productFeatures').value = product.features ? product.features.join(', ') : '';
    if (document.getElementById('productCategory')) document.getElementById('productCategory').value = product.category || '';
    if (document.getElementById('productStock')) document.getElementById('productStock').value = product.stock || 0;
    
    // Show image preview
    updateImagePreview(product.image);
    
    const productModal = document.getElementById('productModal');
    if (productModal) productModal.style.display = 'flex';
}

// Save product (add or update)
function saveProduct(event) {
    event.preventDefault();
    
    // Get form values
    const productId = document.getElementById('productId')?.value;
    const productName = document.getElementById('productName')?.value;
    const productPrice = document.getElementById('productPrice')?.value;
    const productDescription = document.getElementById('productDescription')?.value;
    const productImage = document.getElementById('productImage')?.value;
    const productFeatures = document.getElementById('productFeatures')?.value;
    const productCategory = document.getElementById('productCategory')?.value;
    const productStock = document.getElementById('productStock')?.value;
    
    if (!productName || !productPrice || !productDescription || !productImage || !productCategory) {
        showNotification('Please fill all required fields!', 'error');
        return;
    }
    
    const product = {
        id: editingProductId || Date.now().toString(),
        name: productName.trim(),
        price: parseInt(productPrice),
        description: productDescription.trim(),
        image: productImage.trim(),
        features: productFeatures ? 
            productFeatures.split(',')
                .map(f => f.trim())
                .filter(f => f) : [],
        category: productCategory,
        stock: parseInt(productStock) || 0
    };
    
    if (editingProductId) {
        // Update existing product
        const index = products.findIndex(p => p.id === editingProductId);
        if (index > -1) {
            products[index] = product;
        }
    } else {
        // Add new product
        products.push(product);
    }
    
    // Save to local storage
    saveProducts();
    
    // Update display
    displayAdminProducts();
    
    // Close modal
    closeModal();
    
    // Show success message
    showNotification(`Product ${editingProductId ? 'updated' : 'added'} successfully!`);
}

// Close modal
function closeModal() {
    const productModal = document.getElementById('productModal');
    if (productModal) {
        productModal.style.display = 'none';
    }
}

// ========== STATS FUNCTIONS ==========

// Update stats display
function updateStats() {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    
    const totalProductsEl = document.getElementById('totalProducts');
    const totalValueEl = document.getElementById('totalValue');
    const totalStockEl = document.getElementById('totalStock');
    
    if (totalProductsEl) totalProductsEl.textContent = totalProducts;
    if (totalValueEl) totalValueEl.textContent = '₹' + totalValue.toLocaleString('en-IN');
    if (totalStockEl) totalStockEl.textContent = totalStock;
}

// ========== SETTINGS & DATA FUNCTIONS ==========

// Calculate storage usage
function updateStorageUsage() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length * 2; // Approximate byte size
        }
    }
    
    const storageUsage = document.getElementById('storageUsage');
    if (storageUsage) {
        storageUsage.textContent = (total / 1024).toFixed(2) + ' KB';
    }
    
    // Update last backup time
    const lastBackup = localStorage.getItem('lastBackupTime');
    const lastBackupEl = document.getElementById('lastBackup');
    if (lastBackupEl) {
        if (lastBackup) {
            const backupDate = new Date(parseInt(lastBackup));
            lastBackupEl.textContent = backupDate.toLocaleString();
        } else {
            lastBackupEl.textContent = 'Never';
        }
    }
}

// Export products
function exportProducts() {
    const dataStr = JSON.stringify(products, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aquapure-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Record backup time
    localStorage.setItem('lastBackupTime', Date.now());
    updateStorageUsage();
    
    showNotification('Products exported successfully! Backup time recorded.', 'success');
}

// Import products
function importProducts() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            try {
                const importedProducts = JSON.parse(event.target.result);
                
                if (!Array.isArray(importedProducts)) {
                    throw new Error('Invalid file format');
                }
                
                if (confirm(`Import ${importedProducts.length} products? This will replace current products.`)) {
                    products = importedProducts;
                    saveProducts();
                    displayAdminProducts();
                    showNotification('Products imported successfully!');
                }
            } catch (error) {
                showNotification('Error importing file. Please check the format.', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Clear all data
function clearAllData() {
    if (confirm('WARNING: This will delete ALL products and reset everything. Continue?')) {
        localStorage.removeItem('aquapure_products');
        localStorage.removeItem('cart');
        products = [];
        displayAdminProducts();
        showNotification('All data cleared successfully!');
    }
}

// ========== PASSWORD MANAGEMENT ==========

// Change password with storage
function changePassword() {
    const current = document.getElementById('currentPassword')?.value;
    const newPass = document.getElementById('newPassword')?.value;
    const confirmPass = document.getElementById('confirmPassword')?.value;
    
    if (!current || !newPass || !confirmPass) {
        showNotification('Please fill all password fields!', 'error');
        return;
    }
    
    // Get stored password or use default
    let storedPassword = localStorage.getItem('admin_password');
    if (!storedPassword) {
        // Default password on first use
        storedPassword = 'admin123';
    }
    
    // Check current password
    if (current !== storedPassword) {
        showNotification('Current password is incorrect!', 'error');
        
        // Clear password fields
        if (document.getElementById('currentPassword')) {
            document.getElementById('currentPassword').value = '';
        }
        return;
    }
    
    if (newPass !== confirmPass) {
        showNotification('New passwords do not match!', 'error');
        
        // Clear new password fields
        if (document.getElementById('newPassword')) {
            document.getElementById('newPassword').value = '';
        }
        if (document.getElementById('confirmPassword')) {
            document.getElementById('confirmPassword').value = '';
        }
        return;
    }
    
    if (newPass.length < 6) {
        showNotification('Password must be at least 6 characters!', 'error');
        return;
    }
    
    // Check if new password is same as old
    if (newPass === storedPassword) {
        showNotification('New password cannot be same as current password!', 'error');
        return;
    }
    
    // Save new password to localStorage
    localStorage.setItem('admin_password', newPass);
    
    // Logout all sessions
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminLoginTime');
    
    showNotification('Password changed successfully! Please login again with new password.', 'success');
    
    // Clear fields
    const currentPassword = document.getElementById('currentPassword');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (currentPassword) currentPassword.value = '';
    if (newPassword) newPassword.value = '';
    if (confirmPassword) confirmPassword.value = '';
    
    // Redirect to login page after 2 seconds
    setTimeout(() => {
        window.location.href = 'admin-login.html';
    }, 2000);
}

// Reset password to default (emergency)
function resetPasswordToDefault() {
    if (confirm('⚠️ EMERGENCY RESET ⚠️\n\nReset password to default "admin123"?\n\nThis will:\n1. Reset password to "admin123"\n2. Logout all admin sessions\n3. Require re-login\n\nUse this only if you forgot your password!')) {
        localStorage.removeItem('admin_password');
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoginTime');
        
        showNotification('Password reset to default: admin123\nRedirecting to login page...', 'warning');
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 2000);
    }
}

// Check password strength
function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
}

// Update password strength indicator
function updatePasswordStrength() {
    const password = document.getElementById('newPassword')?.value;
    const strengthIndicator = document.getElementById('passwordStrength');
    
    if (!strengthIndicator || !password) return;
    
    const strength = checkPasswordStrength(password);
    
    let strengthText = '';
    let strengthColor = '';
    
    switch (strength) {
        case 0:
        case 1:
            strengthText = 'Very Weak';
            strengthColor = '#ff4757';
            break;
        case 2:
            strengthText = 'Weak';
            strengthColor = '#ffa502';
            break;
        case 3:
            strengthText = 'Medium';
            strengthColor = '#ffb142';
            break;
        case 4:
            strengthText = 'Strong';
            strengthColor = '#2ed573';
            break;
        case 5:
            strengthText = 'Very Strong';
            strengthColor = '#1dd1a1';
            break;
    }
    
    strengthIndicator.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
            <div style="flex: 1; height: 5px; background: #eee; border-radius: 3px; overflow: hidden;">
                <div style="width: ${strength * 20}%; height: 100%; background: ${strengthColor}; transition: width 0.3s;"></div>
            </div>
            <span style="font-size: 0.85rem; color: ${strengthColor}; font-weight: 600;">${strengthText}</span>
        </div>
    `;
}

// Toggle password visibility
function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.type = field.type === 'password' ? 'text' : 'password';
    }
}

// ========== MOBILE MENU FUNCTIONS ==========

// Mobile menu toggle
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    
    sidebar.classList.toggle('active');
    
    if (window.innerWidth <= 768) {
        if (sidebar.classList.contains('active')) {
            mainContent.style.opacity = '0.3';
            mobileBtn.style.opacity = '0';
        } else {
            mainContent.style.opacity = '1';
            mobileBtn.style.opacity = '1';
        }
    }
}

// ========== SECTION NAVIGATION ==========

// Show section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(sectionId + 'Section');
    if (section) {
        section.classList.add('active');
    }
    
    // Update mobile title
    const titles = {
        'products': 'Products',
        'settings': 'Settings'
    };
    const mobileTitle = document.getElementById('mobileTitle');
    if (mobileTitle) {
        mobileTitle.textContent = titles[sectionId] || 'Admin Panel';
    }
    
    // Close mobile menu on mobile devices
    if (window.innerWidth <= 768) {
        toggleMobileMenu();
    }
    
    // Update active nav link
    const activeLink = document.querySelector(`.admin-nav a[onclick*="${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Update stats if products section
    if (sectionId === 'products') {
        updateStats();
    }
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
            .notification.warning {
                background: #ff9800;
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
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========== INITIALIZATION ==========

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    // Check if admin is logged in
    if (checkAdminLogin()) {
        // Setup image preview
        const productImageInput = document.getElementById('productImage');
        if (productImageInput) {
            productImageInput.addEventListener('input', function() {
                updateImagePreview(this.value);
            });
        }
        
        // Setup modal close on outside click
        const productModal = document.getElementById('productModal');
        if (productModal) {
            productModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal();
                }
            });
        }
        
        // Close modal on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
        
        // Close mobile menu when clicking on main content
        const mainContent = document.getElementById('mainContent');
        const sidebar = document.getElementById('sidebar');
        
        if (mainContent) {
            mainContent.addEventListener('click', function() {
                if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active')) {
                    toggleMobileMenu();
                }
            });
        }
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && sidebar) {
                sidebar.classList.remove('active');
                if (mainContent) mainContent.style.opacity = '1';
                const mobileBtn = document.querySelector('.mobile-menu-btn');
                if (mobileBtn) mobileBtn.style.opacity = '1';
            }
        });
        
        // Initialize mobile title
        const mobileTitle = document.getElementById('mobileTitle');
        if (mobileTitle) {
            mobileTitle.textContent = 'Products';
        }
        
        // Setup password strength indicator
        const newPasswordInput = document.getElementById('newPassword');
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', updatePasswordStrength);
        }
        
        // Setup event listeners for buttons
        setupEventListeners();
    }
});

// Setup event listeners for buttons
function setupEventListeners() {
    // Add product button
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', showAddProductForm);
    }
    
    // Reset button
    const resetBtn = document.querySelector('[onclick*="resetToDefault"]');
    if (resetBtn) {
        resetBtn.onclick = resetToDefault;
    }
    
    // Mobile bottom navigation
    const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');
    mobileNavBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.textContent || '';
            if (text.includes('Products')) {
                showSection('products');
            } else if (text.includes('Settings')) {
                showSection('settings');
            } else if (text.includes('Add New')) {
                showAddProductForm();
            }
        });
    });
}
// In admin.js, add to settings functions:
// Save WhatsApp number
function saveWhatsAppNumber() {
    const whatsappNumber = document.getElementById('whatsappNumber')?.value;
    
    if (!whatsappNumber || whatsappNumber.length < 10) {
        showNotification('Please enter a valid WhatsApp number!', 'error');
        return;
    }
    
    // Remove any non-digit characters
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    
    // Check if it's an Indian number (adds 91 if missing)
    let finalNumber = cleanNumber;
    if (cleanNumber.length === 10) {
        finalNumber = '91' + cleanNumber; // Add India country code
    }
    
    localStorage.setItem('whatsapp_contact', finalNumber);
    showNotification('WhatsApp number saved successfully!');
}

// Load WhatsApp number
function loadWhatsAppNumber() {
    const savedNumber = localStorage.getItem('whatsapp_contact');
    const inputField = document.getElementById('whatsappNumber');
    
    if (inputField && savedNumber) {
        // Display without country code for editing
        const displayNumber = savedNumber.startsWith('91') ? savedNumber.substring(2) : savedNumber;
        inputField.value = displayNumber;
    }
}