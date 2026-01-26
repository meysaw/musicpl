// Authentication JavaScript for Login and Signup Pages

// Utility Functions
const showError = (inputId, errorId, message) => {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);

    if (input && error) {
        input.classList.add('error');
        input.classList.remove('success');
        error.textContent = message;
        error.classList.add('show');
    }
};

const clearError = (inputId, errorId) => {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);

    if (input && error) {
        input.classList.remove('error');
        error.classList.remove('show');
        error.textContent = '';
    }
};

const showSuccess = (inputId) => {
    const input = document.getElementById(inputId);
    if (input) {
        input.classList.add('success');
        input.classList.remove('error');
    }
};

// Email Validation
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password Strength Checker
const checkPasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: 'weak', text: 'Weak password' };
    if (strength <= 4) return { level: 'medium', text: 'Medium password' };
    return { level: 'strong', text: 'Strong password' };
};

// Update Password Strength Indicator (for signup page)
const updatePasswordStrength = (password) => {
    const strengthIndicator = document.getElementById('passwordStrength');
    const strengthBarFill = document.getElementById('strengthBarFill');
    const strengthText = document.getElementById('strengthText');

    if (!strengthIndicator || !strengthBarFill || !strengthText) return;

    if (password.length === 0) {
        strengthIndicator.classList.remove('show');
        return;
    }

    strengthIndicator.classList.add('show');
    const strength = checkPasswordStrength(password);

    strengthBarFill.className = 'strength-bar-fill ' + strength.level;
    strengthText.textContent = strength.text;
};

// Password Toggle Visibility
const setupPasswordToggle = (toggleId, inputId) => {
    const toggle = document.getElementById(toggleId);
    const input = document.getElementById(inputId);

    if (toggle && input) {
        toggle.addEventListener('click', () => {
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;

            toggle.classList.toggle('fa-eye');
            toggle.classList.toggle('fa-eye-slash');
        });
    }
};

// Form Validation
const validateLoginForm = () => {
    let isValid = true;

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Clear previous errors
    clearError('email', 'emailError');
    clearError('password', 'passwordError');

    // Validate email
    if (!email) {
        showError('email', 'emailError', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('email', 'emailError', 'Please enter a valid email');
        isValid = false;
    } else {
        showSuccess('email');
    }

    // Validate password
    if (!password) {
        showError('password', 'passwordError', 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showError('password', 'passwordError', 'Password must be at least 6 characters');
        isValid = false;
    } else {
        showSuccess('password');
    }

    return isValid;
};

const validateSignupForm = () => {
    let isValid = true;

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;

    // Clear previous errors
    clearError('fullName', 'fullNameError');
    clearError('email', 'emailError');
    clearError('password', 'passwordError');
    clearError('confirmPassword', 'confirmPasswordError');
    clearError('agreeTerms', 'termsError');

    // Validate full name
    if (!fullName) {
        showError('fullName', 'fullNameError', 'Full name is required');
        isValid = false;
    } else if (fullName.length < 2) {
        showError('fullName', 'fullNameError', 'Please enter your full name');
        isValid = false;
    } else {
        showSuccess('fullName');
    }

    // Validate email
    if (!email) {
        showError('email', 'emailError', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('email', 'emailError', 'Please enter a valid email');
        isValid = false;
    } else {
        showSuccess('email');
    }

    // Validate password
    if (!password) {
        showError('password', 'passwordError', 'Password is required');
        isValid = false;
    } else if (password.length < 8) {
        showError('password', 'passwordError', 'Password must be at least 8 characters');
        isValid = false;
    } else if (!/[A-Z]/.test(password)) {
        showError('password', 'passwordError', 'Password must contain an uppercase letter');
        isValid = false;
    } else if (!/[a-z]/.test(password)) {
        showError('password', 'passwordError', 'Password must contain a lowercase letter');
        isValid = false;
    } else if (!/[0-9]/.test(password)) {
        showError('password', 'passwordError', 'Password must contain a number');
        isValid = false;
    } else {
        showSuccess('password');
    }

    // Validate confirm password
    if (!confirmPassword) {
        showError('confirmPassword', 'confirmPasswordError', 'Please confirm your password');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('confirmPassword', 'confirmPasswordError', 'Passwords do not match');
        isValid = false;
    } else {
        showSuccess('confirmPassword');
    }

    // Validate terms agreement
    if (!agreeTerms) {
        const termsError = document.getElementById('termsError');
        if (termsError) {
            termsError.textContent = 'You must agree to the terms and conditions';
            termsError.classList.add('show');
        }
        isValid = false;
    }

    return isValid;
};

// Handle Login Form Submission
const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateLoginForm()) {
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        // Call backend API
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Store logged-in user
            localStorage.setItem('jamplayer_current_user', JSON.stringify(data.user));

            if (rememberMe) {
                localStorage.setItem('jamplayer_remember', 'true');
            }

            // Show success message
            successMessage.classList.add('show');

            // Redirect to main app
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            // Show error
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            showError('password', 'passwordError', data.message || 'Invalid email or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        showError('password', 'passwordError', 'An error occurred. Please try again.');
    }
};

// Handle Signup Form Submission
const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateSignupForm()) {
        return;
    }

    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        // Call backend API
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullName, email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Auto-login the user
            localStorage.setItem('jamplayer_current_user', JSON.stringify(data.user));

            // Show success message
            successMessage.classList.add('show');

            // Redirect to main app
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            // Show error
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;

            // Handle validation errors
            if (data.fullName) {
                showError('fullName', 'fullNameError', data.fullName);
            }
            if (data.email) {
                showError('email', 'emailError', data.email);
            }
            if (data.password) {
                showError('password', 'passwordError', data.password);
            }
            if (data.message && !data.fullName && !data.email && !data.password) {
                showError('email', 'emailError', data.message);
            }
        }
    } catch (error) {
        console.error('Signup error:', error);
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        showError('email', 'emailError', 'An error occurred. Please try again.');
    }
};

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
    // Setup password toggles
    setupPasswordToggle('togglePassword', 'password');
    setupPasswordToggle('toggleConfirmPassword', 'confirmPassword');

    // Check which page we're on
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        // Login page
        loginForm.addEventListener('submit', handleLogin);

        // Handle forgot password link
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Password reset functionality will be implemented soon!');
            });
        }
    }

    if (signupForm) {
        // Signup page
        signupForm.addEventListener('submit', handleSignup);

        // Password strength indicator
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                updatePasswordStrength(e.target.value);
            });
        }

        // Handle terms link
        const termsLink = document.getElementById('termsLink');
        if (termsLink) {
            termsLink.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Terms & Conditions will be displayed here!');
            });
        }
    }

    // Real-time validation on blur
    const inputs = document.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]');
    inputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (loginForm) {
                validateLoginForm();
            } else if (signupForm) {
                validateSignupForm();
            }
        });
    });
});
