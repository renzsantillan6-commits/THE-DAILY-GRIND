function toggleMenu() {
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.getElementById('hamburger');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
    if (hamburger) {
        hamburger.classList.toggle('active');
    }
}

function toggleAuth() {
    const title = document.getElementById('auth-title');
    const btn = document.getElementById('auth-btn');
    const toggleText = document.querySelector('.auth-toggle');
    if (title.innerText === "Welcome Back") {
        title.innerText = "Create Account";
        btn.innerText = "Sign Up";
        toggleText.innerHTML = 'Already have an account? <a href="#" onclick="toggleAuth()">Login</a>';
    } else {
        title.innerText = "Welcome Back";
        btn.innerText = "Login";
        toggleText.innerHTML = 'Don\'t have an account? <a href="#" onclick="toggleAuth()">Sign Up</a>';
    }
}

function openAuth(mode) {
    document.getElementById('auth-overlay').style.display = 'flex';
    if (mode === 'signup' && document.getElementById('auth-title').innerText !== "Create Account") toggleAuth();
    if (mode === 'login' && document.getElementById('auth-title').innerText === "Create Account") toggleAuth();
}

function closeAuth() {
    document.getElementById('auth-overlay').style.display = 'none';
}

function handleAuth() {
    const name = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const isSignUp = document.getElementById('auth-title').innerText === "Create Account";

    if (name === "" || pass === "") {
        alert("Please fill in all fields to continue.");
        return;
    }

    // Mock database using localStorage
    let users = JSON.parse(localStorage.getItem('coffeeAppUsers') || '{}');

    // Pre-seed the admin account into our mock database if it doesn't exist
    if (!users['admin']) {
        users['admin'] = 'admin123';
        localStorage.setItem('coffeeAppUsers', JSON.stringify(users));
    }

    if (isSignUp) {
        if (users[name]) {
            alert("Username already taken. Please login.");
        } else {
            users[name] = pass;
            localStorage.setItem('coffeeAppUsers', JSON.stringify(users));
            localStorage.setItem('coffeeUserName', name);
            location.reload();
        }
    } else if (users[name] === pass) {
        localStorage.setItem('coffeeUserName', name);
        location.reload();
    } else {
        alert("Invalid username or password.");
    }
}

// Logic to display name on protected pages
window.onload = function() {
    const savedName = localStorage.getItem('coffeeUserName');
    
    // Toggle UI based on Auth State
    if (savedName) {
        if (document.getElementById('nav-signup-btn')) document.getElementById('nav-signup-btn').style.display = 'none';
        if (document.getElementById('nav-login-btn')) document.getElementById('nav-login-btn').style.display = 'none';
        if (document.getElementById('nav-logout-btn')) document.getElementById('nav-logout-btn').style.display = 'block';
        if (document.getElementById('hero-signup-btn')) document.getElementById('hero-signup-btn').style.display = 'none';
        // Show profile link if logged in
        const profileLinks = document.querySelectorAll('.profile-link');
        profileLinks.forEach(link => link.style.display = 'block');

        // Show admin link if user is 'admin'
        const adminLinks = document.querySelectorAll('.admin-link');
        if (savedName === 'admin') {
            adminLinks.forEach(link => link.style.display = 'block');
        } else {
            adminLinks.forEach(link => link.style.display = 'none');
        }
    } else {
        if (document.getElementById('nav-logout-btn')) document.getElementById('nav-logout-btn').style.display = 'none';
        const profileLinks = document.querySelectorAll('.profile-link');
        profileLinks.forEach(link => link.style.display = 'none');
        const adminLinks = document.querySelectorAll('.admin-link');
        adminLinks.forEach(link => link.style.display = 'none');

        // Update Order button text for guests to clarify requirements
        const orderBtn = document.getElementById('order-btn');
        if (orderBtn) orderBtn.innerText = "Login to Order";
    }

    // Observe menu items for animation
    document.querySelectorAll('.menu-item').forEach(item => observer.observe(item));
};

function logout() {
    localStorage.removeItem('coffeeUserName');
    location.reload();
}

function addToOrderHistory(itemName, price) {
    const savedName = localStorage.getItem('coffeeUserName');
    if (!savedName) {
        alert("Please login/sign up first to place an order.");
        openAuth('login');
        return;
    }

    // Store orders per user in localStorage
    let allOrders = JSON.parse(localStorage.getItem('coffeeOrders') || '{}');
    if (!allOrders[savedName]) allOrders[savedName] = [];
    
    const newOrder = { 
        name: itemName, 
        price: price, 
        date: new Date().toLocaleDateString(),
        payment: 'Unpaid',
        quantity: 1
    };
    allOrders[savedName].push(newOrder);
    
    localStorage.setItem('coffeeOrders', JSON.stringify(allOrders));
    alert(`${itemName} has been added to your order history!`);
}

function cancelOrder(orderIndex) {
    const savedName = localStorage.getItem('coffeeUserName');
    if (!confirm("Are you sure you want to cancel this order?")) return;

    let allOrders = JSON.parse(localStorage.getItem('coffeeOrders') || '{}');
    if (allOrders[savedName]) {
        allOrders[savedName].splice(orderIndex, 1);
        localStorage.setItem('coffeeOrders', JSON.stringify(allOrders));
        location.reload();
    }
}

function payOrder(orderIndex) {
    const savedName = localStorage.getItem('coffeeUserName');
    let allOrders = JSON.parse(localStorage.getItem('coffeeOrders') || '{}');
    
    if (allOrders[savedName] && allOrders[savedName][orderIndex]) {
        allOrders[savedName][orderIndex].payment = 'Paid';
        localStorage.setItem('coffeeOrders', JSON.stringify(allOrders));
        alert("Payment successful!");
        location.reload();
    }
}

function payAllOrders() {
    const savedName = localStorage.getItem('coffeeUserName');
    let allOrders = JSON.parse(localStorage.getItem('coffeeOrders') || '{}');
    
    if (!allOrders[savedName] || !confirm("Proceed to pay for all unpaid orders?")) return;

    if (allOrders[savedName]) {
        allOrders[savedName].forEach(order => {
            order.payment = 'Paid';
        });
        localStorage.setItem('coffeeOrders', JSON.stringify(allOrders));
        alert("All orders have been paid successfully!");
        location.reload();
    }
}

function updateOrderQuantity(orderIndex, delta) {
    const savedName = localStorage.getItem('coffeeUserName');
    let allOrders = JSON.parse(localStorage.getItem('coffeeOrders') || '{}');
    
    if (allOrders[savedName] && allOrders[savedName][orderIndex]) {
        let currentQty = allOrders[savedName][orderIndex].quantity || 1;
        allOrders[savedName][orderIndex].quantity = currentQty + delta;
        
        if (allOrders[savedName][orderIndex].quantity <= 0) return cancelOrder(orderIndex);
        
        localStorage.setItem('coffeeOrders', JSON.stringify(allOrders));
        location.reload();
    }
}

// Intersection Observer for Menu Animation
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Apply the landslide animation with a staggered delay
            entry.target.style.animation = `landslideIn 0.8s ease-out forwards`;
            entry.target.style.animationDelay = `${index * 0.1}s`;
            observer.unobserve(entry.target); // Stop observing once animated
        }
    });
}, observerOptions);