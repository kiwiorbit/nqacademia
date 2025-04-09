/**
 * Admin Login Fallback
 * 
 * This script provides a simple fallback mechanism for admin login
 * when the PHP API is not available.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin login fallback initializing...');
    
    // Get login elements
    const loginForm = document.getElementById('admin-login-form');
    const loginSubmit = document.getElementById('login-submit');
    const usernameInput = document.getElementById('admin-username');
    const passwordInput = document.getElementById('admin-password');
    
    // Get modal login elements
    const modalLoginSubmit = document.getElementById('modal-login-submit');
    const modalUsernameInput = document.getElementById('modal-admin-username');
    const modalPasswordInput = document.getElementById('modal-admin-password');
    const adminAuthModal = document.getElementById('admin-auth-modal');
    
    // Get admin elements
    const adminLoginForm = document.getElementById('admin-login-form');
    const postCreationForm = document.getElementById('post-creation-form');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    
    // Check if we're on the news page
    if (!loginForm || !loginSubmit) return;
    
    // Simple direct login function
    function handleDirectLogin(username, password, isModal = false) {
        console.log('Direct login attempt:', username, password);
        
        if (username === 'admin' && password === 'khalila') {
            // Set login state
            localStorage.setItem('adminLoggedIn', 'true');
            
            // Update UI
            if (adminLoginForm) adminLoginForm.classList.add('hidden');
            if (postCreationForm) postCreationForm.classList.remove('hidden');
            if (adminLogoutBtn) adminLogoutBtn.classList.remove('hidden');
            
            // Close modal if needed
            if (isModal && adminAuthModal) {
                adminAuthModal.classList.add('hidden');
            }
            
            // Show success message
            if (typeof window.showNotification === 'function') {
                window.showNotification('Admin login successful', 'success');
            } else {
                alert('Admin login successful');
            }
            
            return true;
        } else {
            // Show error message
            if (typeof window.showNotification === 'function') {
                window.showNotification('Invalid credentials', 'error');
            } else {
                alert('Invalid credentials');
            }
            
            return false;
        }
    }
    
    // Add direct login handler for main form
    if (loginSubmit) {
        // Add a direct submit handler
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = usernameInput.value;
            const password = passwordInput.value;
            
            if (handleDirectLogin(username, password)) {
                // Clear form
                usernameInput.value = '';
                passwordInput.value = '';
            }
        });
    }
    
    // Add direct login handler for modal
    if (modalLoginSubmit) {
        modalLoginSubmit.addEventListener('click', function(e) {
            e.preventDefault();
            const username = modalUsernameInput.value;
            const password = modalPasswordInput.value;
            
            if (handleDirectLogin(username, password, true)) {
                // Clear form
                modalUsernameInput.value = '';
                modalPasswordInput.value = '';
            }
        });
    }
    
    // Check if already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        // Update UI
        if (adminLoginForm) adminLoginForm.classList.add('hidden');
        if (postCreationForm) postCreationForm.classList.remove('hidden');
        if (adminLogoutBtn) adminLogoutBtn.classList.remove('hidden');
    }
});
