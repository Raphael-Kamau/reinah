

// reinah_script.js

document.addEventListener('DOMContentLoaded', () => {
    // Navigation Menu Elements
    const menuIcon = document.getElementById('menu-icon');
    const closeBtn = document.querySelector('.closebtn');
    const overlay = document.getElementById('myNav');

    // Cart Modal Elements
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.querySelector('.modal .close');
    const checkoutButton = document.getElementById('checkout-button');
    const cartItemsContainer = document.getElementById('cart-items');

    // Search Elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const productGrid = document.querySelectorAll('.product_grid .product');

    // Notification Element 
    const notification = document.getElementById('notification');

    // Initialize Cart by Loading from Local Storage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Function to Save Cart to Local Storage
    const saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    // Function to Notify User with Custom Notification
    const notifyUser = (message) => {
        if (notification) {
            notification.textContent = message;
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        } else {
            // Fallback to alert if notification element doesn't exist
            alert(message);
        }
    };

    // Function to Open Navigation Menu
    const openNav = () => {
        overlay.style.width = "50%";
        overlay.setAttribute('aria-hidden', 'false');
        menuIcon.setAttribute('aria-expanded', 'true');
    };

    // Function to Close Navigation Menu
    const closeNavFunc = () => {
        overlay.style.width = "0%";
        overlay.setAttribute('aria-hidden', 'true');
        menuIcon.setAttribute('aria-expanded', 'false');
    };

    // Function to Trap Focus Within an Element
    const trapFocus = (element) => {
        const focusableElements = element.querySelectorAll('a[href], button, textarea, input, select');
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', (e) => {
            const isTabPressed = (e.key === 'Tab' || e.keyCode === 9);

            if (!isTabPressed) return;

            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        });
    };

    // Function to Open Cart Modal
    const openCart = () => {
        cartModal.style.display = "block";
        cartModal.setAttribute('aria-hidden', 'false');
        cartModal.focus(); // Shift focus to modal for accessibility
        trapFocus(cartModal); // Trap focus within modal
        updateCart();
    };

    // Function to Close Cart Modal
    const closeCartModalFunc = () => {
        cartModal.style.display = "none";
        cartModal.setAttribute('aria-hidden', 'true');
        cartIcon.focus(); // Return focus to cart icon
    };

    // Function to Add Items to Cart
    const addToCart = (productName, productPrice) => {
        const existingProduct = cart.find(item => item.name === productName);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push({ name: productName, price: productPrice, quantity: 1 });
        }
        updateCart();
        notifyUser(`${productName} has been added to your cart.`);
    };

    // Function to Update Cart Display
    const updateCart = () => {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            checkoutButton.style.display = 'none';
            saveCart();
            return;
        }
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <span>${item.name}</span>
                <span>KES ${item.price.toFixed(2)} x ${item.quantity}</span>
                <button class="remove-item" data-name="${item.name}" aria-label="Remove ${item.name} from cart">Remove</button>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
        checkoutButton.style.display = 'block';
        saveCart(); // Persist the updated cart
    };

    // Event Delegation for Remove Buttons
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            const productName = e.target.getAttribute('data-name');
            cart = cart.filter(item => item.name !== productName);
            updateCart();
            notifyUser(`${productName} has been removed from your cart.`);
        }
    });

    // Function to Handle Search with Debouncing
    const debounce = (func, delay) => {
        let debounceTimer;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    };

    const handleSearch = () => {
        const query = searchInput.value.toLowerCase();
        productGrid.forEach(product => {
            const productName = product.querySelector('h3').textContent.toLowerCase();
            if (productName.includes(query)) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    };

    // Function to Validate WhatsApp Number
    const isValidNumber = (number) => {
        const regex = /^\d{11,14}$/; // Example: Kenya numbers (254 followed by 9 digits)
        return regex.test(number);
    };

    // Event Listeners

    // Navigation Menu Toggle
    menuIcon.addEventListener('click', openNav);
    closeBtn.addEventListener('click', closeNavFunc);

    // Close Navigation Menu with Esc Key
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && overlay.style.width === "50%") {
            closeNavFunc();
        }
    });

    // Cart Modal Toggle
    cartIcon.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartModalFunc);

    // Close Cart Modal When Clicking Outside
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            closeCartModalFunc();
        }
    });

    // Close Cart Modal with Esc Key
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && cartModal.style.display === "block") {
            closeCartModalFunc();
        }
    });

    // Search Functionality with Debounce
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    });
    searchInput.addEventListener('input', debounce(handleSearch, 300));

    // Checkout Button Functionality
    checkoutButton.addEventListener('click', () => {
        if (cart.length === 0) {
            notifyUser('Your cart is empty.');
            return;
        }

        // Prepare WhatsApp Redirection
        const whatsappNumber = '254792070625'; // Replace with your WhatsApp number in international format without '+' or '00'
        if (!isValidNumber(whatsappNumber)) {
            notifyUser('Invalid WhatsApp number. Please contact support.');
            return;
        }

        let message = 'Hello, I would like to proceed to checkout with the following items:%0A%0A';

        cart.forEach(item => {
            message += `${item.name} - KES ${item.price.toFixed(2)} x ${item.quantity}%0A`;
        });

        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

        // Redirect to WhatsApp
        window.open(whatsappURL, '_blank');

        // Notify User
        notifyUser('Redirecting to WhatsApp for checkout...');

        // Clear cart
        cart = [];
        updateCart();

        // Close the cart modal after redirecting
        closeCartModalFunc();
    });

    // Add to Cart Buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productName = button.getAttribute('data-name');
            const productPrice = parseFloat(button.getAttribute('data-price'));
            addToCart(productName, productPrice);
        });
    });

    // Initial Render of Cart on Page Load
    updateCart();
});