// Advanced Authentication System with Google OAuth and Username Support
// Supports both username-based accounts and Google login with linking capabilities

class AuthenticationSystem {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('gamemaster_users_v2')) || {};
        this.sessionData = JSON.parse(localStorage.getItem('gamemaster_session_v2')) || {};
        this.gameProgress = JSON.parse(localStorage.getItem('gamemaster_progress_v2')) || {};
        this.isGoogleLoaded = false;
        this.googleClientId = '1073028201100-gu11o7r0uri7a6hmgr2lac79d53gp5v9.apps.googleusercontent.com';
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.checkExistingSession();
        await this.initializeGoogleAuth();
        this.updateUI();
        this.isInitialized = true;
        
        console.log('🔐 Authentication System initialized');
    }

    async initializeGoogleAuth() {
        try {
            // Load Google Identity Services
            if (!window.google) {
                await this.loadGoogleScript();
            }
            
            // Initialize Google OAuth with your Client ID
            if (this.googleClientId) {
                window.google.accounts.id.initialize({
                    client_id: this.googleClientId,
                    callback: (response) => this.handleGoogleResponse(response)
                });
                this.isGoogleLoaded = true;
                console.log('🔑 Real Google OAuth ready');
            } else {
                // Fallback to demo mode if no client ID
                this.isGoogleLoaded = true;
                console.log('🔑 Google OAuth in demo mode - add client ID for real authentication');
            }
        } catch (error) {
            console.warn('Google OAuth initialization failed:', error);
            this.isGoogleLoaded = false;
        }
    }

    loadGoogleScript() {
        return new Promise((resolve, reject) => {
            if (document.querySelector('script[src*="accounts.google.com"]')) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    setupEventListeners() {
        // Profile icon dropdown
        const profileIcon = document.getElementById('profile-icon');
        const profileDropdown = document.getElementById('profile-dropdown');
        
        if (profileIcon) {
            profileIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = profileDropdown.style.display === 'block';
                profileDropdown.style.display = isVisible ? 'none' : 'block';
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            if (profileDropdown) {
                profileDropdown.style.display = 'none';
            }
        });

        // Auth modal controls
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const profileBtn = document.getElementById('profile-btn');
        const logoutBtn = document.getElementById('logout-btn');

        if (loginBtn) loginBtn.addEventListener('click', () => {
            this.showLoginModal();
            if (profileDropdown) profileDropdown.style.display = 'none';
        });
        if (signupBtn) signupBtn.addEventListener('click', () => {
            this.showSignupModal();
            if (profileDropdown) profileDropdown.style.display = 'none';
        });
        if (profileBtn) profileBtn.addEventListener('click', () => {
            this.showProfileModal();
            if (profileDropdown) profileDropdown.style.display = 'none';
        });
        if (logoutBtn) logoutBtn.addEventListener('click', () => {
            this.logout();
            if (profileDropdown) profileDropdown.style.display = 'none';
        });

        // Close modals
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-btn')) {
                this.closeModal(e.target.closest('.modal'));
            }
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });

        // Form switching
        document.addEventListener('click', (e) => {
            if (e.target.id === 'switch-to-signup') {
                e.preventDefault();
                this.switchToSignupForm();
            }
            if (e.target.id === 'switch-to-login') {
                e.preventDefault();
                this.switchToLoginForm();
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'username-login-form') {
                e.preventDefault();
                this.handleUsernameLogin(e.target);
            }
            if (e.target.id === 'username-signup-form') {
                e.preventDefault();
                this.handleUsernameSignup(e.target);
            }
        });

        // Username input validation (prevent spaces in real-time)
        document.addEventListener('input', (e) => {
            if (e.target.id === 'signup-username') {
                // Remove spaces as user types
                e.target.value = e.target.value.replace(/\s/g, '');
            }
        });

        // Google login buttons
        document.addEventListener('click', (e) => {
            if (e.target.id === 'google-login-btn' || e.target.closest('#google-login-btn') || 
                e.target.id === 'google-signup-btn' || e.target.closest('#google-signup-btn')) {
                this.handleGoogleLogin();
            }
            if (e.target.id === 'link-google-btn') {
                this.linkGoogleAccount();
            }
            if (e.target.id === 'clear-progress-btn') {
                this.clearAllProgress();
            }
        });
    }

    showLoginModal() {
        const modal = this.createAuthModal();
        document.body.appendChild(modal);
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('signup-form').style.display = 'none';
        this.setupGoogleButton();
    }

    showSignupModal() {
        const modal = this.createAuthModal();
        document.body.appendChild(modal);
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
        this.setupGoogleButton();
    }

    showProfileModal() {
        if (!this.currentUser) return;
        
        const modal = this.createProfileModal();
        document.body.appendChild(modal);
        this.updateProfileDisplay();
    }

    createAuthModal() {
        // Remove existing modal if present
        const existingModal = document.getElementById('auth-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                
                <!-- Login Form -->
                <div id="login-form" class="auth-form">
                    <h2>Login to The Game Master</h2>
                    
                    <!-- Google Login -->
                    <div id="google-signin-container">
                        <button type="button" id="google-login-btn" class="google-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span id="google-btn-text">Continue with Google</span>
                        </button>
                    </div>
                    
                    <div class="auth-divider">
                        <span>OR</span>
                    </div>
                    
                    <!-- Username Login -->
                    <form id="username-login-form">
                        <div class="form-group">
                            <label for="login-username">Username or Email:</label>
                            <input type="text" id="login-username" name="username" required>
                        </div>
                        <div class="form-group">
                            <label for="login-password">Password:</label>
                            <input type="password" id="login-password" name="password" required>
                        </div>
                        <button type="submit" class="submit-btn">Login with Username</button>
                    </form>
                    
                    <p class="switch-form">Don't have an account? <a href="#" id="switch-to-signup">Sign up here</a></p>
                </div>

                <!-- Signup Form -->
                <div id="signup-form" class="auth-form" style="display: none;">
                    <h2>Join The Game Master</h2>
                    
                    <!-- Google Signup -->
                    <div id="google-signin-container-signup">
                        <button type="button" id="google-signup-btn" class="google-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span id="google-signup-btn-text">Sign up with Google</span>
                        </button>
                    </div>
                    
                    <div class="auth-divider">
                        <span>OR</span>
                    </div>
                    
                    <!-- Username Signup -->
                    <form id="username-signup-form">
                        <div class="form-group">
                            <label for="signup-username">Username:</label>
                            <input type="text" id="signup-username" name="username" required minlength="3" maxlength="20" 
                                   pattern="[^\\s]+" title="Username cannot contain spaces">
                            <small style="color: #888; font-size: 0.8rem;">No spaces allowed, case insensitive</small>
                        </div>
                        <div class="form-group">
                            <label for="signup-email">Email (optional):</label>
                            <input type="email" id="signup-email" name="email">
                        </div>
                        <div class="form-group">
                            <label for="signup-password">Password:</label>
                            <input type="password" id="signup-password" name="password" required minlength="6">
                        </div>
                        <div class="form-group">
                            <label for="signup-confirm-password">Confirm Password:</label>
                            <input type="password" id="signup-confirm-password" name="confirm-password" required>
                        </div>
                        <button type="submit" class="submit-btn">Create Username Account</button>
                    </form>
                    
                    <p class="switch-form">Already have an account? <a href="#" id="switch-to-login">Login here</a></p>
                </div>
            </div>
        `;
        return modal;
    }

    createProfileModal() {
        // Remove existing modal if present
        const existingModal = document.getElementById('profile-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'profile-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <div id="user-profile">
                    <h2>User Profile</h2>
                    <div class="profile-section">
                        <h3>Account Information</h3>
                        <p><strong>Username:</strong> <span id="profile-username"></span></p>
                        <p><strong>Account Type:</strong> <span id="profile-account-type"></span></p>
                        <p><strong>Email:</strong> <span id="profile-email"></span></p>
                        <p><strong>Member Since:</strong> <span id="profile-join-date"></span></p>
                        
                        ${this.currentUser && this.currentUser.accountType === 'username' && !this.currentUser.linkedGoogle ? 
                            '<button id="link-google-btn" class="submit-btn google-link-btn">🔗 Link Google Account</button>' : ''}
                    </div>
                    <div class="profile-section">
                        <h3>Gaming Statistics</h3>
                    <p><strong>Total Games Played:</strong> <span id="games-played-count">0</span></p>
                    <p><strong>Favorite Games:</strong> <span id="favorite-games-count">0</span></p>
                    <p><strong>Total Play Time:</strong> <span id="total-play-time">0 minutes</span></p>
                    </div>
                    <div class="profile-section">
                        <h3>Game Progress</h3>
                        <div id="game-progress-list">
                            <p>No saved progress yet. Start playing games to track your progress!</p>
                        </div>
                    </div>
                    <button id="clear-progress-btn" class="submit-btn danger-btn">Clear All Progress</button>
                </div>
            </div>
        `;
        return modal;
    }

    switchToSignupForm() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
    }

    switchToLoginForm() {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('signup-form').style.display = 'none';
    }

    closeModal(modal) {
        if (modal) {
            modal.remove();
        }
    }

    // Username-based authentication
    handleUsernameLogin(form) {
        const formData = new FormData(form);
        const username = formData.get('username').toLowerCase().trim(); // Convert to lowercase and trim
        const password = formData.get('password');

        // Check by username or email (case insensitive)
        let user = null;
        let userKey = null;
        
        for (const [key, userData] of Object.entries(this.users)) {
            // Use usernameKey if available (new users), otherwise fall back to lowercase username (backward compatibility)
            const storedUsernameKey = userData.usernameKey || (userData.username ? userData.username.toLowerCase() : '');
            const storedEmail = userData.email ? userData.email.toLowerCase() : '';
            const keyLower = key.toLowerCase();
            
            if ((storedUsernameKey === username || storedEmail === username || keyLower === username) && 
                userData.password === this.hashPassword(password)) {
                user = userData;
                userKey = key;
                break;
            }
        }

        if (user) {
            this.loginUser(userKey, user);
            this.closeModal(document.getElementById('auth-modal'));
            this.showNotification(`Welcome back, ${user.username}!`, 'success');
        } else {
            this.showNotification('Invalid username/email or password!', 'error');
        }
    }

    handleUsernameSignup(form) {
        const formData = new FormData(form);
        const rawUsername = formData.get('username').trim();
        const email = formData.get('email') || '';
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm-password');

        // Validation
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match!', 'error');
            return;
        }

        if (rawUsername.length < 3) {
            this.showNotification('Username must be at least 3 characters long!', 'error');
            return;
        }

        // Check for spaces in username
        if (rawUsername.includes(' ')) {
            this.showNotification('Username cannot contain spaces!', 'error');
            return;
        }

        // Convert username to lowercase for storage and comparison
        const username = rawUsername.toLowerCase();

        // Check if username already exists (case insensitive)
        for (const userData of Object.values(this.users)) {
            // Use usernameKey if available (new users), otherwise fall back to lowercase username (backward compatibility)
            const existingUsernameKey = userData.usernameKey || (userData.username ? userData.username.toLowerCase() : '');
            if (existingUsernameKey === username) {
                this.showNotification('Username already taken!', 'error');
                return;
            }
            if (email && userData.email && userData.email.toLowerCase() === email.toLowerCase()) {
                this.showNotification('Email already registered!', 'error');
                return;
            }
        }

        // Create new user (store with original case but comparison is case insensitive)
        const userId = this.generateUserId();
        const userData = {
            username: rawUsername, // Store original case for display
            usernameKey: username, // Store lowercase for comparisons
            email: email,
            password: this.hashPassword(password),
            accountType: 'username',
            linkedGoogle: false,
            joinDate: new Date().toISOString(),
            stats: {
                gamesPlayed: 0,
                totalPlayTime: 0,
                favoriteGames: []
            }
        };

        this.users[userId] = userData;
        this.saveUsers();
        
        this.loginUser(userId, userData);
        this.closeModal(document.getElementById('auth-modal'));
        this.showNotification(`Welcome to The Game Master, ${rawUsername}!`, 'success');
    }

    // Google authentication (real + demo fallback)
    async handleGoogleLogin() {
        try {
            if (this.googleClientId && this.googleClientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE' && window.google) {
                // Use real Google OAuth
                window.google.accounts.id.prompt();
            } else {
                // Fallback to demo for testing
                const mockGoogleUser = await this.simulateGoogleLogin();
                if (mockGoogleUser) {
                    this.processGoogleUser(mockGoogleUser);
                    this.closeModal(document.getElementById('auth-modal'));
                }
            }
        } catch (error) {
            console.error('Google login error:', error);
            this.showNotification('Google login failed. Please try again.', 'error');
        }
    }

    // Handle real Google OAuth response
    handleGoogleResponse(response) {
        try {
            // Decode the JWT token to get user info
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            const googleUser = {
                id: payload.sub,
                name: payload.name,
                email: payload.email,
                picture: payload.picture
            };
            
            this.processGoogleUser(googleUser);
            this.closeModal(document.getElementById('auth-modal'));
        } catch (error) {
            console.error('Google response error:', error);
            this.showNotification('Google login failed. Please try again.', 'error');
        }
    }

    // Setup Google Sign-In button (real or demo)
    setupGoogleButton() {
        const loginButton = document.getElementById('google-login-btn');
        const signupButton = document.getElementById('google-signup-btn');
        const loginButtonText = document.getElementById('google-btn-text');
        const signupButtonText = document.getElementById('google-signup-btn-text');
        
        if (this.googleClientId && this.googleClientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE' && window.google) {
            // Real Google OAuth available
            if (loginButtonText) loginButtonText.textContent = 'Continue with Google';
            if (signupButtonText) signupButtonText.textContent = 'Sign up with Google';
            
            // Try to render real Google buttons
            if (window.google.accounts.id) {
                const loginContainer = document.getElementById('google-signin-container');
                const signupContainer = document.getElementById('google-signin-container-signup');
                
                if (loginContainer) {
                    window.google.accounts.id.renderButton(loginContainer, { 
                        theme: 'filled_blue', size: 'large', width: '100%', text: 'continue_with'
                    });
                    if (loginButton) loginButton.style.display = 'none';
                }
                
                if (signupContainer) {
                    window.google.accounts.id.renderButton(signupContainer, { 
                        theme: 'filled_blue', size: 'large', width: '100%', text: 'signup_with'
                    });
                    if (signupButton) signupButton.style.display = 'none';
                }
            }
        } else {
            // Demo mode
            if (loginButtonText) loginButtonText.textContent = 'Continue with Google (Demo)';
            if (signupButtonText) signupButtonText.textContent = 'Sign up with Google (Demo)';
            if (loginButton) loginButton.style.display = 'flex';
            if (signupButton) signupButton.style.display = 'flex';
        }
    }

    // Process Google user data (used by both real and demo)
    processGoogleUser(googleUser) {
        // Check if Google account already exists
        let existingUser = null;
        let userKey = null;
        
        for (const [key, userData] of Object.entries(this.users)) {
            if (userData.googleId === googleUser.id) {
                existingUser = userData;
                userKey = key;
                break;
            }
        }

        if (existingUser) {
            // Login existing Google user
            this.loginUser(userKey, existingUser);
            this.showNotification(`Welcome back, ${existingUser.username}!`, 'success');
        } else {
            // Create new Google user
            const userId = this.generateUserId();
            const userData = {
                username: googleUser.name,
                email: googleUser.email,
                googleId: googleUser.id,
                accountType: 'google',
                linkedGoogle: true,
                joinDate: new Date().toISOString(),
                profilePicture: googleUser.picture,
                stats: {
                    gamesPlayed: 0,
                    totalPlayTime: 0,
                    favoriteGames: []
                }
            };

            this.users[userId] = userData;
            this.saveUsers();
            this.loginUser(userId, userData);
            this.showNotification(`Welcome to The Game Master, ${userData.username}!`, 'success');
        }
    }

    // Demo Google login simulation
    simulateGoogleLogin() {
        return new Promise((resolve, reject) => {
            // Simulate Google OAuth popup
            const popup = window.open('', 'GoogleAuth', 'width=500,height=600');
            
            if (!popup) {
                reject(new Error('Popup blocked'));
                return;
            }

            popup.document.write(`
                <html>
                <head><title>Google Sign In (Demo)</title></head>
                <body style="font-family: Arial; padding: 20px; background: #f5f5f5;">
                    <h2>🔐 Demo Google Sign In</h2>
                    <p>This is a demo of Google OAuth integration.</p>
                    <button onclick="loginAsDemo()" style="background: #4285f4; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                        Sign in as Demo User
                    </button>
                    <button onclick="window.close()" style="background: #ccc; color: black; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-left: 10px;">
                        Cancel
                    </button>
                    <script>
                        function loginAsDemo() {
                            window.opener.postMessage({
                                type: 'google-login-success',
                                user: {
                                    id: 'google_demo_user_${Date.now()}',
                                    name: 'Demo User',
                                    email: 'demo@gamemaster.com',
                                    picture: 'https://via.placeholder.com/96x96?text=Demo'
                                }
                            }, '*');
                            window.close();
                        }
                    </script>
                </body>
                </html>
            `);

            // Listen for messages from popup
            const messageHandler = (event) => {
                if (event.data.type === 'google-login-success') {
                    window.removeEventListener('message', messageHandler);
                    resolve(event.data.user);
                }
            };

            window.addEventListener('message', messageHandler);

            // Handle popup close
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    window.removeEventListener('message', messageHandler);
                    reject(new Error('User cancelled login'));
                }
            }, 1000);
        });
    }

    // Link Google account to existing username account
    async linkGoogleAccount() {
        if (!this.currentUser || this.currentUser.accountType !== 'username') {
            this.showNotification('Can only link Google to username accounts!', 'error');
            return;
        }

        try {
            const mockGoogleUser = await this.simulateGoogleLogin();
            
            if (mockGoogleUser) {
                // Check if this Google account is already linked to another user
                for (const userData of Object.values(this.users)) {
                    if (userData.googleId === mockGoogleUser.id) {
                        this.showNotification('This Google account is already linked to another user!', 'error');
                        return;
                    }
                }

                // Link Google account
                this.currentUser.googleId = mockGoogleUser.id;
                this.currentUser.linkedGoogle = true;
                if (!this.currentUser.email) {
                    this.currentUser.email = mockGoogleUser.email;
                }
                this.currentUser.profilePicture = mockGoogleUser.picture;

                this.saveUsers();
                this.updateProfileDisplay();
                this.showNotification('Google account linked successfully!', 'success');
            }
        } catch (error) {
            console.error('Google linking error:', error);
            this.showNotification('Failed to link Google account. Please try again.', 'error');
        }
    }

    loginUser(userId, userData) {
        this.currentUser = userData;
        this.sessionData = {
            userId: userId,
            loginTime: new Date().toISOString(),
            sessionId: this.generateSessionId()
        };
        this.saveSession();
        this.updateUI();
    }

    logout() {
        this.currentUser = null;
        this.sessionData = {};
        localStorage.removeItem('gamemaster_session_v2');
        this.updateUI();
        this.showNotification('Logged out successfully!', 'success');
    }

    checkExistingSession() {
        if (this.sessionData.userId && this.users[this.sessionData.userId]) {
            // Validate session (could add expiration logic here)
            this.currentUser = this.users[this.sessionData.userId];
        }
    }

    updateUI() {
        const guestMenu = document.getElementById('guest-menu');
        const userMenu = document.getElementById('user-menu');
        const userGreeting = document.getElementById('user-greeting');

        if (this.currentUser) {
            if (guestMenu) guestMenu.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'block';
                if (userGreeting) {
                    userGreeting.textContent = `${this.currentUser.username}`;
                }
            }
        } else {
            if (guestMenu) guestMenu.style.display = 'block';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    updateProfileDisplay() {
        if (!this.currentUser) return;

        const elements = {
            'profile-username': this.currentUser.username,
            'profile-account-type': this.currentUser.accountType === 'google' ? 'Google Account' : 
                                   (this.currentUser.linkedGoogle ? 'Username (Google Linked)' : 'Username'),
            'profile-email': this.currentUser.email || 'Not provided',
            'profile-join-date': new Date(this.currentUser.joinDate).toLocaleDateString(),
            'games-played-count': this.currentUser.stats.gamesPlayed || 0,
            'favorite-games-count': this.currentUser.stats.favoriteGames.length || 0,
            'total-play-time': Math.floor((this.currentUser.stats.totalPlayTime || 0) / 60) + ' minutes'
        };

        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        }

        this.displayGameProgress();
    }

    displayGameProgress() {
        const progressList = document.getElementById('game-progress-list');
        if (!progressList) return;

        const userProgress = this.gameProgress[this.sessionData.userId] || {};
        
        if (Object.keys(userProgress).length === 0) {
            progressList.innerHTML = '<p>No saved progress yet. Start playing games to track your progress!</p>';
            return;
        }

        let progressHTML = '';
        for (const [gameName, progress] of Object.entries(userProgress)) {
            progressHTML += `
                <div class="progress-item">
                    <div class="game-name">${gameName}</div>
                    <div class="progress-details">
                        Level: ${progress.level || 'N/A'} | 
                        Score: ${progress.score || 0} | 
                        Last Played: ${new Date(progress.lastPlayed).toLocaleDateString()}
                    </div>
                </div>
            `;
        }
        
        progressList.innerHTML = progressHTML;
    }

    // Game Progress Methods
    saveGameProgress(gameName, progressData) {
        if (!this.currentUser || !this.sessionData.userId) return;
        
        if (!this.gameProgress[this.sessionData.userId]) {
            this.gameProgress[this.sessionData.userId] = {};
        }
        
        this.gameProgress[this.sessionData.userId][gameName] = {
            ...progressData,
            lastPlayed: new Date().toISOString()
        };
        
        // Update user stats
        this.currentUser.stats.gamesPlayed++;
        this.currentUser.stats.totalPlayTime += progressData.playTime || 0;
        
        this.saveProgress();
        this.saveUsers();
    }

    getGameProgress(gameName) {
        if (!this.currentUser || !this.sessionData.userId) return null;
        return this.gameProgress[this.sessionData.userId]?.[gameName] || null;
    }

    clearAllProgress() {
        if (!this.currentUser || !this.sessionData.userId) return;
        
        if (confirm('Are you sure you want to clear all your game progress? This action cannot be undone.')) {
            delete this.gameProgress[this.sessionData.userId];
            this.currentUser.stats.gamesPlayed = 0;
            this.currentUser.stats.totalPlayTime = 0;
            
            this.saveProgress();
            this.saveUsers();
            this.displayGameProgress();
            this.showNotification('All progress cleared!', 'success');
        }
    }

    // Utility Methods
    hashPassword(password) {
        // Simple hash function - in production, use proper hashing
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    generateUserId() {
        return 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    generateSessionId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    saveUsers() {
        localStorage.setItem('gamemaster_users_v2', JSON.stringify(this.users));
    }

    saveSession() {
        localStorage.setItem('gamemaster_session_v2', JSON.stringify(this.sessionData));
    }

    saveProgress() {
        localStorage.setItem('gamemaster_progress_v2', JSON.stringify(this.gameProgress));
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.auth-notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `auth-notification auth-notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-family: 'Oswald', sans-serif;
            font-weight: 500;
            z-index: 3000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            border: 2px solid transparent;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#00ff00';
                notification.style.color = '#000000';
                notification.style.borderColor = '#00cc00';
                break;
            case 'error':
                notification.style.backgroundColor = '#ff4444';
                notification.style.borderColor = '#cc0000';
                break;
            default:
                notification.style.backgroundColor = '#2196F3';
                notification.style.borderColor = '#1976D2';
        }
        
        // Add animation CSS if not already added
        if (!document.querySelector('#auth-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'auth-notification-styles';
            style.textContent = `
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
        
        document.body.appendChild(notification);
        
        // Remove notification after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Public API for games
    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser ? {
            username: this.currentUser.username,
            email: this.currentUser.email,
            accountType: this.currentUser.accountType,
            joinDate: this.currentUser.joinDate,
            linkedGoogle: this.currentUser.linkedGoogle || false
        } : null;
    }
}

// Global instance and API
window.GameMasterAuth = {
    instance: null,
    
    async init() {
        if (!this.instance) {
            this.instance = new AuthenticationSystem();
            await this.instance.init();
        }
        return this.instance;
    },
    
    // Save game progress
    saveProgress: (gameName, data) => {
        if (window.GameMasterAuth.instance) {
            window.GameMasterAuth.instance.saveGameProgress(gameName, data);
        }
    },
    
    // Get saved progress
    getProgress: (gameName) => {
        return window.GameMasterAuth.instance ? 
               window.GameMasterAuth.instance.getGameProgress(gameName) : null;
    },
    
    // Check if user is logged in
    isLoggedIn: () => {
        return window.GameMasterAuth.instance ? 
               window.GameMasterAuth.instance.isLoggedIn() : false;
    },
    
    // Get current user info
    getCurrentUser: () => {
        return window.GameMasterAuth.instance ? 
               window.GameMasterAuth.instance.getCurrentUser() : null;
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.GameMasterAuth.init();
    });
} else {
    window.GameMasterAuth.init();
}
