/**
 * News Fallback System
 *
 * This script provides a fallback mechanism for loading and saving news data
 * when the PHP API is not available (e.g., on static hosting).
 *
 * It works by directly accessing the news-data.json file.
 */

// Wait for the main news.js script to load first
document.addEventListener('DOMContentLoaded', function() {
    // Only run on the news page
    if (!document.getElementById('news-feed')) return;

    console.log('News fallback system initializing...');

    // Add fallback login handler for when PHP is not available
    const loginSubmit = document.getElementById('login-submit');
    const modalLoginSubmit = document.getElementById('modal-login-submit');

    // Add direct login handlers as a backup
    if (loginSubmit) {
        loginSubmit.addEventListener('click', function(e) {
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;

            console.log('Direct login attempt with:', username, password);

            if (username === 'admin' && password === 'khalila') {
                console.log('Direct login successful');
                localStorage.setItem('adminLoggedIn', 'true');

                // Update UI
                if (typeof window.updateUIForAdminStatus === 'function') {
                    window.updateUIForAdminStatus();
                } else {
                    // Fallback UI update
                    const adminLoginForm = document.getElementById('admin-login-form');
                    const postCreationForm = document.getElementById('post-creation-form');
                    const adminLogoutBtn = document.getElementById('admin-logout-btn');

                    if (adminLoginForm) adminLoginForm.classList.add('hidden');
                    if (postCreationForm) postCreationForm.classList.remove('hidden');
                    if (adminLogoutBtn) adminLogoutBtn.classList.remove('hidden');
                }

                // Show notification
                if (typeof window.showNotification === 'function') {
                    window.showNotification('Admin login successful (direct fallback mode)', 'success');
                } else {
                    alert('Admin login successful (direct fallback mode)');
                }

                // Clear form
                document.getElementById('admin-username').value = '';
                document.getElementById('admin-password').value = '';
            } else {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('Invalid credentials', 'error');
                } else {
                    alert('Invalid credentials');
                }
            }
        }, true); // Use capturing to ensure this runs first
    }

    // Add direct login handler for modal login
    if (modalLoginSubmit) {
        modalLoginSubmit.addEventListener('click', function(e) {
            const username = document.getElementById('modal-admin-username').value;
            const password = document.getElementById('modal-admin-password').value;

            console.log('Direct modal login attempt with:', username, password);

            if (username === 'admin' && password === 'khalila') {
                console.log('Direct modal login successful');
                localStorage.setItem('adminLoggedIn', 'true');

                // Update UI
                if (typeof window.updateUIForAdminStatus === 'function') {
                    window.updateUIForAdminStatus();
                }

                // Close modal
                const adminAuthModal = document.getElementById('admin-auth-modal');
                if (adminAuthModal) {
                    adminAuthModal.classList.add('hidden');
                    document.body.style.overflow = ''; // Re-enable scrolling
                }

                // Show notification
                if (typeof window.showNotification === 'function') {
                    window.showNotification('Admin login successful (direct fallback mode)', 'success');
                } else {
                    alert('Admin login successful (direct fallback mode)');
                }

                // Clear form
                document.getElementById('modal-admin-username').value = '';
                document.getElementById('modal-admin-password').value = '';
            } else {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('Invalid credentials', 'error');
                } else {
                    alert('Invalid credentials');
                }
            }
        }, true); // Use capturing to ensure this runs first
    }

    // Intercept the fetch calls for login
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        // If this is a login request to the API
        if (url === 'api/news.php' && options && options.body) {
            try {
                const body = JSON.parse(options.body);
                if (body.action === 'login') {
                    console.log('Intercepting login request with fallback');

                    // Check credentials (admin/khalila)
                    console.log('Checking credentials:', body.username, body.password);
                    if (body.username === 'admin' && body.password === 'khalila') {
                        console.log('Login successful in fallback mode');
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ success: true, message: 'Login successful (fallback mode)' })
                        });
                    } else {
                        console.log('Login failed in fallback mode');
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({ success: false, message: 'Invalid credentials' })
                        });
                    }
                }
            } catch (e) {
                console.error('Error parsing fetch body:', e);
            }
        }

        // Otherwise, proceed with the original fetch
        return originalFetch.apply(this, arguments);
    };

    // Check if loadNews is already defined in news.js
    if (typeof window.loadNews !== 'function') {
        // Define loadNews if it doesn't exist
        window.loadNews = async function() {
            try {
                console.log('Using fallback loadNews function');
                const response = await fetch('data/news-data.json');
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        window.newsDatabase = data;
                        // Update localStorage with file data
                        localStorage.setItem('tajweedNews', JSON.stringify(data));
                        console.log('News data loaded from file');
                        return;
                    }
                }
            } catch (error) {
                console.error('Error loading news from file:', error);
            }

            // Fall back to localStorage if file loading fails
            const localData = localStorage.getItem('tajweedNews');
            if (localData) {
                try {
                    const parsedData = JSON.parse(localData);
                    if (Array.isArray(parsedData) && parsedData.length > 0) {
                        window.newsDatabase = parsedData;
                        console.log('News data loaded from localStorage');
                        return;
                    }
                } catch (e) {
                    console.error('Error parsing localStorage data:', e);
                }
            }

            // Fall back to default data if both file and localStorage fail
            console.log('Using default news data');
        };
    }

    // Override saveNews if it's not working properly
    if (typeof window.saveNews !== 'function' || window.saveNews.toString().indexOf('async') === -1) {
        // Define a fallback saveNews function
        window.saveNews = async function() {
            // Save to localStorage for client-side caching
            localStorage.setItem('tajweedNews', JSON.stringify(window.newsDatabase));
            console.log('News saved to localStorage (fallback mode)');

            // Note: In fallback mode, we can't save to the server-side JSON file
            // This would require server-side code which isn't available in static hosting
            return true;
        };
    }

    // Trigger initial news loading if it hasn't happened yet
    setTimeout(function() {
        if (document.getElementById('news-feed').children.length === 0) {
            console.log('News feed is empty, triggering renderNews...');
            if (typeof window.renderNews === 'function') {
                window.renderNews();
            }
        }
    }, 500); // Wait a bit to ensure the main script has had time to run
});
