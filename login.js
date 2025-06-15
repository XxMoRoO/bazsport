const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginError = document.getElementById('login-error-message');
const signupError = document.getElementById('signup-error-message');

const loginView = document.getElementById('login-view');
const signupView = document.getElementById('signup-view');

const showSignupBtn = document.getElementById('show-signup');
const showLoginBtn = document.getElementById('show-login');

// --- View Toggling ---
showSignupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginView.classList.add('hidden');
    signupView.classList.remove('hidden');
});

showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signupView.classList.add('hidden');
    loginView.classList.remove('hidden');
});


// --- Form Submissions ---
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loginError.classList.add('hidden');
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    window.api.login({ username, password });
});

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    signupError.classList.add('hidden');
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const adminPassword = document.getElementById('signup-admin-password').value;

    if (!username || !password || !adminPassword) {
        signupError.textContent = 'All fields are required.';
        signupError.classList.remove('hidden');
        return;
    }

    const result = await window.api.addUser({ username, password, adminPassword });
    if (result.success) {
        alert('Account created successfully! Please log in.');
        showLoginBtn.click(); 
        loginForm.reset();
        signupForm.reset();
    } else {
        signupError.textContent = result.message; 
        signupError.classList.remove('hidden');
    }
});

// --- Listeners for Main Process Events ---
window.api.onLoginFailed(() => {
    loginError.classList.remove('hidden');
});

// --- Password Visibility Toggle ---
document.querySelectorAll('.password-toggle-icon').forEach(icon => {
    icon.addEventListener('click', function() {
        const passwordInput = this.previousElementSibling;
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        // Optional: Change icon based on state
        this.querySelector('svg').classList.toggle('bi-eye');
        this.querySelector('svg').classList.toggle('bi-eye-slash');
    });
});
