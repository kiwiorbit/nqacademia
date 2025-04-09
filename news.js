// JavaScript for News Page

// Default news data for the simulated database
window.defaultNewsData = [
    {
        id: 1,
        title: "New Tajweed Course Starting Next Month",
        content: "We are excited to announce that our new Tajweed course for beginners will start on the 15th of next month. This course will cover all the basic rules of Tajweed and is perfect for sisters who are just starting their Tajweed journey. Registration is now open through our website. Limited spots available!",
        author: "Admin",
        timestamp: "2 days ago",
        image: "https://placehold.co/600x300/0f172a/e2e8f0?text=New+Course&font=playfair-display"
    },
    {
        id: 2,
        title: "Ramadan Tajweed Intensive Program",
        content: "In preparation for the blessed month of Ramadan, we will be offering a 2-week intensive Tajweed program focusing on common mistakes in Quran recitation. This program is designed to help you perfect your recitation before Ramadan begins. Classes will be held daily from 5 PM to 7 PM starting from the 1st of Sha'ban.",
        author: "Admin",
        timestamp: "1 week ago",
        image: null
    },
    {
        id: 3,
        title: "Website Maintenance Notice",
        content: "Our website will be undergoing scheduled maintenance this weekend. The site may be temporarily unavailable from Friday 10 PM to Saturday 2 AM. We apologize for any inconvenience this may cause and appreciate your understanding.",
        author: "Admin",
        timestamp: "2 weeks ago",
        image: null
    }
];

// Load news from localStorage or use default data
window.newsDatabase = JSON.parse(localStorage.getItem('tajweedNews')) || window.defaultNewsData;

// Function to save news to localStorage and server
window.saveNews = async () => {
    // Save to localStorage for client-side caching
    localStorage.setItem('tajweedNews', JSON.stringify(window.newsDatabase));

    // If admin is logged in, also save to server
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        try {
            // For each news item with a data URL image, upload the image to the server
            for (let i = 0; i < window.newsDatabase.length; i++) {
                const news = window.newsDatabase[i];

                // Check if the image is a data URL that needs to be uploaded
                if (news.image && news.image.startsWith('data:image/')) {
                    // Upload the image
                    const formData = new FormData();
                    formData.append('imageData', news.image);

                    try {
                        const response = await fetch('api/upload.php', {
                            method: 'POST',
                            body: formData
                        });

                        const data = await response.json();

                        if (data.success) {
                            // Update the image URL to the server path
                            window.newsDatabase[i].image = data.filepath;
                        }
                    } catch (error) {
                        console.error('Image upload error:', error);
                        // Continue with the data URL if upload fails
                    }
                }
            }

            // Save the updated news data to the server
            await fetch('api/news.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'saveAll',
                    news: window.newsDatabase
                })
            });
        } catch (error) {
            console.error('Error saving news to server:', error);
            // Continue with localStorage only if server save fails
        }
    }
};

// Function to load news from server or localStorage
window.loadNews = async () => {
    try {
        // Try to load from server first
        const response = await fetch('api/news.php');
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                window.newsDatabase = data;
                // Update localStorage with server data
                localStorage.setItem('tajweedNews', JSON.stringify(window.newsDatabase));
                return;
            }
        }
    } catch (error) {
        console.error('Error loading news from server:', error);
    }

    // Fall back to localStorage if server load fails or returns empty data
    const localData = localStorage.getItem('tajweedNews');
    if (localData) {
        try {
            const parsedData = JSON.parse(localData);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
                window.newsDatabase = parsedData;
                return;
            }
        } catch (e) {
            console.error('Error parsing localStorage data:', e);
        }
    }

    // Fall back to default data if both server and localStorage fail
    window.newsDatabase = window.defaultNewsData;
};

// Admin authentication is now handled on the server

document.addEventListener('DOMContentLoaded', function() {
    // Admin section elements
    const adminAccordion = document.getElementById('admin-accordion');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const adminLoginForm = document.getElementById('admin-login-form');
    const postCreationForm = document.getElementById('post-creation-form');
    const loginSubmit = document.getElementById('login-submit');
    const navbarAdminBtn = document.getElementById('navbar-admin-btn');
    const mobileAdminBtn = document.getElementById('mobile-admin-btn');
    const closeAdminAccordion = document.getElementById('close-admin-accordion');

    // Admin modal elements
    const adminAuthModal = document.getElementById('admin-auth-modal');
    const closeAdminModal = document.getElementById('close-admin-modal');
    const modalLoginSubmit = document.getElementById('modal-login-submit');

    // News popup modal elements
    const newsPopupModal = document.getElementById('news-popup-modal');
    const closeNewsPopup = document.getElementById('close-news-popup');
    const popupNewsTitle = document.getElementById('popup-news-title');
    const popupNewsMeta = document.getElementById('popup-news-meta');
    const popupNewsImageContainer = document.getElementById('popup-news-image-container');
    const popupNewsImage = document.getElementById('popup-news-image');
    const popupNewsContent = document.getElementById('popup-news-content');

    // News creation elements
    const newsTitle = document.getElementById('news-title');
    const newsContent = document.getElementById('news-content');
    const newsImageUrl = document.getElementById('news-image-url');
    const newsImageUpload = document.getElementById('news-image-upload');
    const imageUploadBtn = document.getElementById('image-upload-btn');
    const clearImageBtn = document.getElementById('clear-image-btn');
    const imageSizeInfo = document.getElementById('image-size-info');
    // Image preview container is accessed directly when needed
    const previewImage = document.getElementById('preview-image');
    const noImageText = document.getElementById('no-image-text');
    const submitNews = document.getElementById('submit-news');
    const newsFeed = document.getElementById('news-feed');

    // Variable to store the uploaded image as data URL
    let uploadedImageDataUrl = null;

    // Check if admin is logged in (for reference)
    // We now check localStorage directly when needed

    // Update UI based on admin login status
    window.updateUIForAdminStatus = () => {
        if (localStorage.getItem('adminLoggedIn') === 'true') {
            adminLogoutBtn.classList.remove('hidden');
            adminLoginForm.classList.add('hidden');
            postCreationForm.classList.remove('hidden');
        } else {
            adminLogoutBtn.classList.add('hidden');
            adminLoginForm.classList.remove('hidden');
            postCreationForm.classList.add('hidden');
        }
    };

    // Initial UI update
    window.updateUIForAdminStatus();

    // Image upload functionality
    if (imageUploadBtn && newsImageUpload) {
        // Trigger file input when the button is clicked
        imageUploadBtn.addEventListener('click', () => {
            newsImageUpload.click();
        });

        // Handle file selection
        newsImageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Check file type
                if (!file.type.match('image.*')) {
                    window.showNotification('Please select an image file', 'error');
                    return;
                }

                // Check file size (limit to 2MB)
                const maxSize = 2 * 1024 * 1024; // 2MB in bytes
                if (file.size > maxSize) {
                    window.showNotification('Image size exceeds 2MB limit, compressing...', 'info');
                }

                // Display original file size information
                const fileSizeKB = Math.round(file.size / 1024);
                imageSizeInfo.textContent = `Original: ${fileSizeKB} KB`;

                // Show clear button
                clearImageBtn.classList.remove('hidden');

                // Compress the image (by approximately 30%)
                new Compressor(file, {
                    quality: 0.7, // 70% quality (30% compression)
                    maxWidth: 1200, // Reasonable max width for news images
                    maxHeight: 1200, // Reasonable max height for news images
                    convertSize: 1000000, // Convert to JPEG if larger than ~1MB
                    success(result) {
                        // Show compressed size
                        const compressedSizeKB = Math.round(result.size / 1024);
                        const compressionRatio = Math.round((1 - (result.size / file.size)) * 100);
                        imageSizeInfo.textContent = `Original: ${fileSizeKB} KB → Compressed: ${compressedSizeKB} KB (${compressionRatio}% smaller)`;

                        // Read and preview the compressed image
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            uploadedImageDataUrl = event.target.result;
                            previewImage.src = uploadedImageDataUrl;
                            previewImage.classList.remove('hidden');
                            noImageText.classList.add('hidden');

                            // Clear the URL input since we're using an uploaded file
                            newsImageUrl.value = '';
                        };
                        reader.readAsDataURL(result);
                    },
                    error(err) {
                        console.error('Image compression error:', err);
                        window.showNotification('Error compressing image, using original', 'error');

                        // Fall back to original image
                        const reader = new FileReader();
                        reader.onload = function(event) {
                            uploadedImageDataUrl = event.target.result;
                            previewImage.src = uploadedImageDataUrl;
                            previewImage.classList.remove('hidden');
                            noImageText.classList.add('hidden');

                            // Clear the URL input since we're using an uploaded file
                            newsImageUrl.value = '';
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }
        });

        // Handle image URL input
        newsImageUrl.addEventListener('input', () => {
            const url = newsImageUrl.value.trim();
            if (url) {
                // Clear the uploaded image data
                uploadedImageDataUrl = null;
                newsImageUpload.value = '';
                imageSizeInfo.textContent = '';

                // Preview the image from URL
                previewImage.src = url;
                previewImage.classList.remove('hidden');
                noImageText.classList.add('hidden');

                // Show clear button
                clearImageBtn.classList.remove('hidden');
            } else {
                // If URL is cleared, hide the preview
                if (!uploadedImageDataUrl) {
                    previewImage.classList.add('hidden');
                    noImageText.classList.remove('hidden');
                    clearImageBtn.classList.add('hidden');
                }
            }
        });

        // Handle clear button click
        clearImageBtn.addEventListener('click', () => {
            // Clear all image data
            uploadedImageDataUrl = null;
            newsImageUpload.value = '';
            newsImageUrl.value = '';
            imageSizeInfo.textContent = '';

            // Reset preview
            previewImage.src = '';
            previewImage.classList.add('hidden');
            noImageText.classList.remove('hidden');

            // Hide clear button
            clearImageBtn.classList.add('hidden');
        });
    }

    // Admin navbar button click - open accordion
    if (navbarAdminBtn) {
        navbarAdminBtn.addEventListener('click', () => {
            adminAccordion.classList.remove('hidden');
            // Use setTimeout to ensure the display:none is removed before applying the transform
            setTimeout(() => {
                adminAccordion.style.transform = 'translateY(0)';
            }, 10);
        });
    }

    // Mobile admin button click - open accordion
    if (mobileAdminBtn) {
        mobileAdminBtn.addEventListener('click', () => {
            adminAccordion.classList.remove('hidden');
            // Use setTimeout to ensure the display:none is removed before applying the transform
            setTimeout(() => {
                adminAccordion.style.transform = 'translateY(0)';
            }, 10);
            // Close mobile menu if open
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        });
    }

    // Close admin accordion button
    if (closeAdminAccordion) {
        closeAdminAccordion.addEventListener('click', () => {
            closeAdminPanel();
        });
    }

    // Function to close admin panel
    const closeAdminPanel = () => {
        adminAccordion.style.transform = 'translateY(-100%)';
        // Wait for animation to complete before hiding
        setTimeout(() => {
            adminAccordion.classList.add('hidden');
        }, 300);
    };

    // Admin logout button click
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', () => {
            // Update admin login state
            // isAdminLoggedIn = false; // Using localStorage directly now
            localStorage.setItem('adminLoggedIn', 'false');
            window.updateUIForAdminStatus();
            window.showNotification('You have been logged out', 'info');
            // Close the admin panel after logout
            closeAdminPanel();
        });
    }

    // Login form submission
    if (loginSubmit) {
        const handleLogin = async (e) => {
            e.preventDefault();

            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;

            // Show loading state
            loginSubmit.innerHTML = '<span class="inline-block animate-spin mr-2"><i class="fas fa-circle-notch"></i></span> Logging in...';
            loginSubmit.disabled = true;

            try {
                const response = await fetch('api/news.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'login',
                        username: username,
                        password: password
                    })
                });

                const data = await response.json();

                if (data.success) {
                    // Update admin login state
                    // isAdminLoggedIn = true; // Using localStorage directly now
                    localStorage.setItem('adminLoggedIn', 'true');
                    window.updateUIForAdminStatus();
                    window.showNotification('Admin login successful', 'success');

                    // Clear the form
                    document.getElementById('admin-username').value = '';
                    document.getElementById('admin-password').value = '';
                } else {
                    window.showNotification('Invalid credentials', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                window.showNotification('Login failed. Please try again.', 'error');
            } finally {
                // Reset button state
                loginSubmit.innerHTML = '<i class="fas fa-sign-in-alt mr-1"></i> Login';
                loginSubmit.disabled = false;
            }
        };

        loginSubmit.addEventListener('click', handleLogin);

        // Allow form submission with Enter key
        const usernameInput = document.getElementById('admin-username');
        const passwordInput = document.getElementById('admin-password');

        if (usernameInput && passwordInput) {
            const handleEnterKey = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLogin(e);
                }
            };

            usernameInput.addEventListener('keydown', handleEnterKey);
            passwordInput.addEventListener('keydown', handleEnterKey);
        }
    }

    // Modal login submission
    if (modalLoginSubmit) {
        modalLoginSubmit.addEventListener('click', async (e) => {
            e.preventDefault();

            const username = document.getElementById('modal-admin-username').value;
            const password = document.getElementById('modal-admin-password').value;

            // Show loading state
            modalLoginSubmit.innerHTML = '<span class="inline-block animate-spin mr-2"><i class="fas fa-circle-notch"></i></span> Logging in...';
            modalLoginSubmit.disabled = true;

            try {
                const response = await fetch('api/news.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'login',
                        username: username,
                        password: password
                    })
                });

                const data = await response.json();

                if (data.success) {
                    // Update admin login state
                    // isAdminLoggedIn = true; // Using localStorage directly now
                    localStorage.setItem('adminLoggedIn', 'true');
                    window.updateUIForAdminStatus();
                    closeAdminAuthModal();
                    window.showNotification('Admin login successful', 'success');

                    // Clear the form
                    document.getElementById('modal-admin-username').value = '';
                    document.getElementById('modal-admin-password').value = '';
                } else {
                    window.showNotification('Invalid credentials', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                window.showNotification('Login failed. Please try again.', 'error');
            } finally {
                // Reset button state
                modalLoginSubmit.innerHTML = '<i class="fas fa-sign-in-alt mr-1"></i> Login';
                modalLoginSubmit.disabled = false;
            }
        });
    }

    // Close admin modal
    const closeAdminAuthModal = () => {
        adminAuthModal.classList.add('hidden');
        document.body.style.overflow = ''; // Re-enable scrolling
    };

    if (closeAdminModal) {
        closeAdminModal.addEventListener('click', closeAdminAuthModal);
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === adminAuthModal) {
            closeAdminAuthModal();
        }
    });

    // Close admin accordion when clicking outside
    document.addEventListener('click', function(event) {
        // Check if admin accordion is open
        if (!adminAccordion.classList.contains('hidden') && adminAccordion.style.transform === 'translateY(0px)') {
            // Check if click is outside the accordion content
            if (!adminAccordion.contains(event.target) && event.target !== navbarAdminBtn && event.target !== mobileAdminBtn) {
                closeAdminPanel();
            }
        }
    });

    // News popup functions
    function openNewsPopup(news) {
        // Populate the popup with news data
        popupNewsTitle.textContent = news.title;
        // Format the timestamp for display
        let displayTimestamp = news.timestamp;
        if (news.timestamp && news.timestamp.includes('T')) {
            try {
                const date = new Date(news.timestamp);
                // Format: "April 9, 2025 at 2:30 PM"
                displayTimestamp = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }) + ' at ' + date.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
            } catch (e) {
                console.error('Error formatting date:', e);
            }
        }
        popupNewsMeta.textContent = `Posted by ${news.author} • ${displayTimestamp}`;

        // Format the content with proper paragraphs
        const formattedContent = news.content
            .split('\n')
            .filter(para => para.trim() !== '')
            .map(para => `<p class="mb-4">${para}</p>`)
            .join('');

        popupNewsContent.innerHTML = formattedContent;

        // Handle image if present
        if (news.image) {
            // Reset any previous image styles
            popupNewsImage.style.width = '';
            popupNewsImage.style.height = '';

            // Set the source
            popupNewsImage.src = news.image;

            // Show the container
            popupNewsImageContainer.classList.remove('hidden');

            // Ensure image loads with proper aspect ratio
            popupNewsImage.onload = function() {
                // If image is very wide and short, limit width instead of height
                const aspectRatio = this.naturalWidth / this.naturalHeight;
                if (aspectRatio > 2.5) { // Very wide image
                    this.classList.add('w-full');
                    this.classList.remove('max-h-96');
                } else {
                    this.classList.remove('w-full');
                    this.classList.add('max-h-96');
                }
            };
        } else {
            popupNewsImageContainer.classList.add('hidden');
        }

        // Show the popup
        newsPopupModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal

        // Add animation class
        setTimeout(() => {
            newsPopupModal.querySelector('div').classList.add('animate-popup-in');
        }, 10);
    }

    function closeNewsPopupModal() {
        // Add animation class for closing
        const modalContent = newsPopupModal.querySelector('div');
        modalContent.classList.remove('animate-popup-in');
        modalContent.classList.add('animate-popup-out');

        // Hide after animation completes
        setTimeout(() => {
            newsPopupModal.classList.add('hidden');
            document.body.style.overflow = ''; // Re-enable scrolling
            modalContent.classList.remove('animate-popup-out');
        }, 300);
    }

    // Close news popup when clicking the close button
    if (closeNewsPopup) {
        closeNewsPopup.addEventListener('click', () => {
            closeNewsPopupModal();
        });
    }

    // Close news popup when clicking outside
    newsPopupModal.addEventListener('click', (event) => {
        if (event.target === newsPopupModal) {
            closeNewsPopupModal();
        }
    });

    // Close news popup with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !newsPopupModal.classList.contains('hidden')) {
            closeNewsPopupModal();
        }
    });

    // Function to render news from database
    window.renderNews = async () => {
        // Show loading state
        newsFeed.innerHTML = `
            <div class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        `;

        // Load news data from server
        await window.loadNews();

        // Clear the news feed
        newsFeed.innerHTML = '';

        // Render each news item from the database
        window.newsDatabase.forEach(news => {
            // Format the timestamp for display
            let displayTimestamp = news.timestamp;
            if (news.timestamp && news.timestamp.includes('T')) {
                try {
                    const date = new Date(news.timestamp);
                    // Format: "April 9, 2025 at 2:30 PM"
                    displayTimestamp = date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) + ' at ' + date.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    });
                } catch (e) {
                    console.error('Error formatting date:', e);
                }
            }
            const newsElement = document.createElement('div');
            newsElement.className = 'bg-white p-6 rounded-lg border border-gray-200 shadow-md mb-6';
            newsElement.dataset.newsId = news.id;

            let imageHtml = '';
            if (news.image) {
                imageHtml = `
                    <div class="mt-4 mb-4">
                        <div class="overflow-hidden rounded-lg border border-gray-200">
                            <img src="${news.image}" alt="News image" class="w-full h-48 object-cover">
                        </div>
                    </div>
                `;
            }

            newsElement.innerHTML = `
                <div class="news-card cursor-pointer">
                    <div class="flex justify-between items-start">
                        <h3 class="text-xl font-semibold text-gray-800">${news.title}</h3>
                        ${localStorage.getItem('adminLoggedIn') === 'true' ? `
                        <div class="relative news-menu">
                            <button class="text-gray-500 hover:text-gray-700 transition duration-300 news-menu-btn">
                                <i class="fas fa-ellipsis-h"></i>
                            </button>
                            <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden news-menu-dropdown border border-gray-200">
                                <button class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition duration-150 delete-news-btn">
                                    <i class="fas fa-trash-alt mr-2 text-red-500"></i> Delete News
                                </button>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    <p class="text-gray-500 text-sm mb-3">Posted by ${news.author} • ${displayTimestamp}</p>
                    ${imageHtml}
                    <div class="mt-2">
                        <p class="text-gray-700 line-clamp-3 overflow-hidden">${news.content}</p>
                    </div>
                    <div class="mt-4 text-right">
                        <span class="text-indigo-600 hover:text-indigo-800 text-sm font-medium inline-flex items-center">
                            Read more <i class="fas fa-chevron-right ml-1 text-xs"></i>
                        </span>
                    </div>
                </div>
            `;

            // Add click event to open the news popup
            const newsCard = newsElement.querySelector('.news-card');
            newsCard.addEventListener('click', (e) => {
                // Don't open popup if clicking on admin menu
                if (e.target.closest('.news-menu')) {
                    return;
                }

                // Populate and open the news popup
                openNewsPopup(news);
            });

            // Add event listeners for admin actions
            if (localStorage.getItem('adminLoggedIn') === 'true') {
                const newsMenuBtn = newsElement.querySelector('.news-menu-btn');
                const newsMenuDropdown = newsElement.querySelector('.news-menu-dropdown');
                const deleteNewsBtn = newsElement.querySelector('.delete-news-btn');

                // News menu toggle
                newsMenuBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent event from bubbling up
                    e.preventDefault(); // Prevent default action
                    console.log('Menu button clicked');
                    newsMenuDropdown.classList.toggle('hidden');
                });

                // Close dropdown when clicking elsewhere
                const closeDropdown = (e) => {
                    if (!newsMenuBtn.contains(e.target) && !newsMenuDropdown.contains(e.target)) {
                        newsMenuDropdown.classList.add('hidden');
                    }
                };
                document.addEventListener('click', closeDropdown);

                // Delete news functionality
                deleteNewsBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent event from bubbling up
                    e.preventDefault(); // Prevent default action
                    console.log('Delete button clicked');
                    const newsId = parseInt(newsElement.dataset.newsId);

                    // Create and show custom confirmation dialog
                    const confirmDialog = document.createElement('div');
                    confirmDialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                    confirmDialog.innerHTML = `
                        <div class="bg-white rounded-lg p-6 max-w-sm mx-auto shadow-xl border border-gray-200">
                            <h3 class="text-xl font-semibold text-gray-800 mb-4">Delete News</h3>
                            <p class="text-gray-600 mb-6">Are you sure you want to delete this news item? This action cannot be undone.</p>
                            <div class="flex justify-end space-x-4">
                                <button class="cancel-delete px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors duration-200">Cancel</button>
                                <button class="confirm-delete px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200">Delete</button>
                            </div>
                        </div>
                    `;

                    document.body.appendChild(confirmDialog);

                    // Add event listeners to the dialog buttons
                    const cancelButton = confirmDialog.querySelector('.cancel-delete');
                    const confirmButton = confirmDialog.querySelector('.confirm-delete');

                    cancelButton.addEventListener('click', () => {
                        document.body.removeChild(confirmDialog);
                    });

                    confirmButton.addEventListener('click', async () => {
                        // Remove news from database
                        const newsIndex = window.newsDatabase.findIndex(n => n.id === newsId);

                        if (newsIndex !== -1) {
                            // Check if the news has an image that's stored on the server
                            const newsToDelete = window.newsDatabase[newsIndex];
                            if (newsToDelete.image && newsToDelete.image.startsWith('data/news-images/')) {
                                // Try to delete the image from the server
                                try {
                                    await fetch(`api/news.php?id=${newsToDelete.id}`, {
                                        method: 'DELETE'
                                    });
                                } catch (error) {
                                    console.error('Error deleting news from server:', error);
                                }
                            }

                            window.newsDatabase.splice(newsIndex, 1);
                            await window.saveNews();
                            window.renderNews();
                            window.showNotification('News deleted successfully', 'success');
                        }

                        document.body.removeChild(confirmDialog);
                    });
                });
            }

            newsFeed.appendChild(newsElement);
        });

        // Add hover effect to news cards
        addHoverEffectToCards();
    };

    // Export news data functionality
    const exportNewsBtn = document.getElementById('export-news-btn');
    if (exportNewsBtn) {
        exportNewsBtn.addEventListener('click', function() {
            // Create a modal to display the JSON data
            const exportModal = document.createElement('div');
            exportModal.className = 'fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50';

            // Format the news data with proper indentation
            const formattedJson = JSON.stringify(window.newsDatabase, null, 4);

            // Create the modal content
            exportModal.innerHTML = `
                <div class="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <div class="p-4 border-b flex justify-between items-center bg-gray-50">
                        <h3 class="text-lg font-semibold text-gray-800">Export News Data</h3>
                        <button id="close-export-modal" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="p-4 overflow-auto flex-grow">
                        <p class="mb-4 text-gray-700">Copy this JSON data and paste it into your <code>data/news-data.json</code> file to permanently save your news posts:</p>
                        <div class="relative">
                            <pre id="json-content" class="bg-gray-100 p-4 rounded-md overflow-auto max-h-[50vh] text-sm">${formattedJson.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                            <button id="copy-json-btn" class="absolute top-2 right-2 bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 transition duration-300">
                                <i class="fas fa-copy mr-1"></i> Copy
                            </button>
                        </div>
                        <div class="mt-4">
                            <h4 class="font-medium text-gray-800 mb-2">Instructions:</h4>
                            <ol class="list-decimal pl-5 space-y-2 text-gray-700">
                                <li>Copy the JSON data above using the Copy button</li>
                                <li>Open your <code>data/news-data.json</code> file in a text editor</li>
                                <li>Replace the entire contents with this new JSON data</li>
                                <li>Save the file and upload it to your hosting service</li>
                                <li>Your news posts will now be permanently saved in your codebase</li>
                            </ol>
                        </div>
                    </div>
                    <div class="p-4 border-t bg-gray-50 flex justify-end">
                        <button id="download-json-btn" class="bg-green-600 text-white px-4 py-2 rounded-md mr-2 hover:bg-green-700 transition duration-300">
                            <i class="fas fa-download mr-1"></i> Download JSON File
                        </button>
                        <button id="close-export-btn" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-300">
                            Close
                        </button>
                    </div>
                </div>
            `;

            // Add the modal to the document
            document.body.appendChild(exportModal);
            document.body.style.overflow = 'hidden'; // Prevent scrolling

            // Add event listeners
            const closeExportModal = () => {
                document.body.removeChild(exportModal);
                document.body.style.overflow = ''; // Re-enable scrolling
            };

            // Close button event listeners
            document.getElementById('close-export-modal').addEventListener('click', closeExportModal);
            document.getElementById('close-export-btn').addEventListener('click', closeExportModal);

            // Copy button event listener
            document.getElementById('copy-json-btn').addEventListener('click', function() {
                const jsonContent = document.getElementById('json-content');
                const range = document.createRange();
                range.selectNode(jsonContent);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
                document.execCommand('copy');
                window.getSelection().removeAllRanges();

                // Show success message
                this.innerHTML = '<i class="fas fa-check mr-1"></i> Copied!';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-copy mr-1"></i> Copy';
                }, 2000);
            });

            // Download button event listener
            document.getElementById('download-json-btn').addEventListener('click', function() {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(formattedJson);
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", "news-data.json");
                document.body.appendChild(downloadAnchorNode); // Required for Firefox
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
            });
        });
    }

    // Initial render of news
    window.renderNews();

    // News submission
    if (submitNews) {
        submitNews.addEventListener('click', async function() {
            const title = newsTitle.value.trim();
            const content = newsContent.value.trim();
            const imageUrl = newsImageUrl.value.trim();

            if (!title || !content) {
                window.showNotification('Please enter both title and content for your news post', 'error');
                return;
            }

            // Determine which image source to use (uploaded image takes precedence)
            const finalImageSource = uploadedImageDataUrl || imageUrl || null;

            // Create new news object with ISO timestamp
            const now = new Date();
            const newNews = {
                id: window.newsDatabase.length > 0 ? Math.max(...window.newsDatabase.map(n => n.id)) + 1 : 1,
                title: title,
                content: content,
                author: "Admin",
                timestamp: now.toISOString(), // ISO 8601 format for proper date handling
                image: finalImageSource
            };

            // Add to database
            window.newsDatabase.unshift(newNews);

            // Save to localStorage and server, then re-render news
            await window.saveNews();
            window.renderNews();

            // Clear the form
            newsTitle.value = '';
            newsContent.value = '';
            newsImageUrl.value = '';

            // Reset image preview
            if (clearImageBtn) {
                clearImageBtn.click(); // Use the existing clear functionality
            }

            // Show success message
            window.showNotification('Your news has been published!', 'success');

            // Scroll to the top of the news feed
            newsFeed.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // Note: Mobile menu toggle is handled by script.js

    // Show notification function
    window.showNotification = function(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300 z-50 ${
            type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' :
            'bg-indigo-500'
        } text-white`;

        // Add icon based on type
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';

        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${icon} mr-2"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to DOM
        document.body.appendChild(notification);

        // Set initial opacity
        notification.style.opacity = '0';

        // Fade in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // No hover effects for news cards
    function addHoverEffectToCards() {
        // Function intentionally left empty to remove all hover effects
    }

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }

        /* Admin accordion styles */
        #admin-accordion {
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease-in-out;
        }

        #admin-accordion.hidden {
            display: none;
        }

        /* News popup animations */
        @keyframes popupIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }

        @keyframes popupOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.95); }
        }

        .animate-popup-in {
            animation: popupIn 0.3s ease-out forwards;
        }

        .animate-popup-out {
            animation: popupOut 0.3s ease-in forwards;
        }

        /* Line clamp for truncating text */
        .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        /* News popup image container styles */
        #popup-news-image-container .rounded-lg {
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        #popup-news-image {
            transition: all 0.3s ease;
        }

        /* News menu styles */
        .news-menu {
            z-index: 20;
            position: relative;
        }

        .news-menu-btn {
            padding: 5px;
            border-radius: 4px;
            cursor: pointer;
        }

        .news-menu-btn:hover {
            background-color: #f3f4f6;
        }

        .news-menu-dropdown {
            z-index: 30;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
    `;
    document.head.appendChild(style);
});
