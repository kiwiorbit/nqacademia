// JavaScript for Arabic Tajweed Learning Website

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Interactive form effects
    const formInputs = document.querySelectorAll('#contact-form input, #contact-form textarea, #contact-form select');

    formInputs.forEach(input => {
        // Add focus effects
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('relative');
            const focusEffect = document.createElement('span');
            focusEffect.classList.add('focus-effect');
            input.parentElement.appendChild(focusEffect);

            // Animate the focus effect
            setTimeout(() => {
                focusEffect.style.opacity = '0';
                focusEffect.style.transform = 'scale(1.5)';
            }, 10);

            // Remove the effect after animation
            setTimeout(() => {
                if (focusEffect.parentElement) {
                    focusEffect.parentElement.removeChild(focusEffect);
                }
            }, 500);
        });

        // Add floating label effect for text inputs and textareas
        if (input.tagName.toLowerCase() !== 'select' && input.type !== 'checkbox') {
            input.addEventListener('input', () => {
                if (input.value.trim() !== '') {
                    input.classList.add('has-content');
                } else {
                    input.classList.remove('has-content');
                }
            });
        }
    });

    // Form submission with animation
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Add submission animation
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="inline-block animate-spin mr-2"><i class="fas fa-circle-notch"></i></span> Submitting...';
            submitBtn.disabled = true;

            // Simulate form submission (replace with actual form submission)
            setTimeout(() => {
                submitBtn.innerHTML = '<span class="inline-block mr-2"><i class="fas fa-check"></i></span> Registered!';
                submitBtn.classList.add('bg-green-600');

                // Reset form after delay
                setTimeout(() => {
                    contactForm.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('bg-green-600');
                }, 3000);
            }, 2000);
        });
    }
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Close mobile menu if open
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });

    // Statistics counter animation
    const counters = document.querySelectorAll('.counter');
    const animationDuration = 5000; // Animation duration in milliseconds (5 seconds)

    // Function to start counter animation when element is in viewport
    const startCounterWhenVisible = () => {
        // Create a copy of the NodeList to avoid modification issues during iteration
        const countersArray = Array.from(counters);

        countersArray.forEach(counter => {
            // Skip if counter has already been animated
            if (counter.classList.contains('animated')) {
                return;
            }

            const position = counter.getBoundingClientRect();

            // Check if counter is in viewport or close to it
            if (position.top < window.innerHeight && position.bottom >= 0) {
                // Mark as animated to prevent re-animation
                counter.classList.add('animated');

                const target = parseInt(counter.getAttribute('data-target'));
                const startTime = Date.now();

                // Set initial value
                counter.innerText = '0';

                // Animation function
                const updateCount = () => {
                    const elapsedTime = Date.now() - startTime;
                    const progress = Math.min(elapsedTime / animationDuration, 1); // Value between 0 and 1

                    // Use easeOutQuad for smoother animation
                    const easeProgress = 1 - (1 - progress) * (1 - progress);

                    // Calculate current count based on progress
                    const currentCount = Math.floor(target * easeProgress);
                    counter.innerText = currentCount;

                    // Continue animation if not complete
                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    } else {
                        // Ensure final value is exactly the target
                        counter.innerText = target;
                    }
                };

                // Start the animation
                requestAnimationFrame(updateCount);
            }
        });
    };

    // Run counter animation when scrolling
    window.addEventListener('scroll', startCounterWhenVisible);
    // Also run once on page load
    startCounterWhenVisible();

    // The form submission is now handled by the interactive form code above

    // Interactive Live Sessions section
    const sessionCards = document.querySelectorAll('#join .hover-card');

    sessionCards.forEach(card => {
        // Add mouse move effect for cards
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element

            // Calculate rotation based on mouse position
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            // Apply the rotation and slight scale
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        // Reset transform on mouse leave
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            card.style.transition = 'transform 0.5s ease';
        });

        // Remove transition on mouse enter for smooth movement
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.1s ease';
        });
    });

    // Theme functionality removed
});
