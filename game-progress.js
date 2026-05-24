// Game Progress Tracking System - Compatible with new authentication
// This script provides easy integration for games to track progress

class GameProgressTracker {
    constructor(gameName) {
        this.gameName = gameName;
        this.startTime = Date.now();
        this.sessionData = {
            score: 0,
            level: 1,
            playTime: 0,
            customData: {}
        };
        this.autoSaveInterval = null;
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        // Wait for auth system to be ready
        await this.waitForAuthSystem();
        
        // Load existing progress if user is logged in
        this.loadProgress();
        this.startSession();
        this.showLoginPromptIfNeeded();
        this.isInitialized = true;
        
        console.log(`🎮 Game Progress Tracker initialized for "${this.gameName}"`);
    }

    async waitForAuthSystem() {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        while (!window.GameMasterAuth && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (window.GameMasterAuth) {
            // Make sure auth system is initialized
            await window.GameMasterAuth.init();
        }
    }

    loadProgress() {
        if (window.GameMasterAuth && window.GameMasterAuth.isLoggedIn()) {
            const savedProgress = window.GameMasterAuth.getProgress(this.gameName);
            if (savedProgress) {
                this.sessionData = { ...this.sessionData, ...savedProgress };
                this.showProgressLoaded(savedProgress);
            }
        }
    }

    startSession() {
        // Auto-save progress every 30 seconds during gameplay
        this.autoSaveInterval = setInterval(() => {
            this.updatePlayTime();
            this.saveProgress();
        }, 30000);

        // Save progress when user leaves the page
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });

        // Save progress when page becomes hidden (mobile)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.endSession();
            } else {
                this.startTime = Date.now(); // Reset start time when page becomes visible again
            }
        });

        // Listen for auth state changes
        this.setupAuthListeners();
    }

    setupAuthListeners() {
        // Check for login state changes periodically
        let wasLoggedIn = window.GameMasterAuth ? window.GameMasterAuth.isLoggedIn() : false;
        
        setInterval(() => {
            if (window.GameMasterAuth) {
                const isLoggedIn = window.GameMasterAuth.isLoggedIn();
                if (isLoggedIn && !wasLoggedIn) {
                    // User just logged in, load their progress
                    this.loadProgress();
                    this.hideLoginPrompt();
                } else if (!isLoggedIn && wasLoggedIn) {
                    // User just logged out
                    this.showLoginPromptIfNeeded();
                }
                wasLoggedIn = isLoggedIn;
            }
        }, 1000);
    }

    updateScore(newScore) {
        const oldScore = this.sessionData.score;
        if (newScore > oldScore) {
            this.sessionData.score = newScore;
            this.showScoreUpdate(newScore, oldScore);
        }
    }

    updateLevel(newLevel) {
        const oldLevel = this.sessionData.level;
        if (newLevel > oldLevel) {
            this.sessionData.level = newLevel;
            this.showLevelUpdate(newLevel, oldLevel);
        }
    }


    setCustomData(key, value) {
        this.sessionData.customData[key] = value;
    }

    getCustomData(key) {
        return this.sessionData.customData[key];
    }

    updatePlayTime() {
        const currentTime = Date.now();
        const sessionPlayTime = Math.floor((currentTime - this.startTime) / 1000); // in seconds
        this.sessionData.playTime += sessionPlayTime;
        this.startTime = currentTime; // Reset for next calculation
    }

    saveProgress() {
        if (window.GameMasterAuth && window.GameMasterAuth.isLoggedIn()) {
            this.updatePlayTime();
            window.GameMasterAuth.saveProgress(this.gameName, this.sessionData);
            return true;
        }
        return false;
    }

    endSession() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        this.updatePlayTime();
        this.saveProgress();
    }


    // UI feedback methods
    showProgressLoaded(progress) {
        if (window.GameMasterAuth && window.GameMasterAuth.isLoggedIn()) {
            this.showNotification(
                `🔄 Progress loaded: Level ${progress.level}, Score ${progress.score.toLocaleString()}`,
                'success'
            );
        }
    }

    showScoreUpdate(newScore, oldScore) {
        if (window.GameMasterAuth && window.GameMasterAuth.isLoggedIn()) {
            this.showNotification(`📈 New high score: ${newScore.toLocaleString()}!`, 'success');
        }
    }

    showLevelUpdate(newLevel, oldLevel) {
        if (window.GameMasterAuth && window.GameMasterAuth.isLoggedIn()) {
            this.showNotification(`⬆️ Level up! Now at level ${newLevel}`, 'success');
        }
    }


    showNotification(message, type = 'info') {
        // Only show notifications if user is logged in
        if (!window.GameMasterAuth || !window.GameMasterAuth.isLoggedIn()) {
            return;
        }

        // Remove existing game notifications
        document.querySelectorAll('.game-notification').forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `game-notification game-notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 8px;
            color: white;
            font-family: 'Oswald', sans-serif;
            font-weight: 500;
            font-size: 14px;
            z-index: 4000;
            animation: gameSlideIn 0.3s ease;
            max-width: 280px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            border: 2px solid transparent;
        `;
        
        // Set colors based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#00ff00';
                notification.style.color = '#000000';
                notification.style.borderColor = '#00cc00';
                break;
            default:
                notification.style.backgroundColor = '#2196F3';
                notification.style.borderColor = '#1976D2';
        }
        
        // Add animation if not already added
        if (!document.querySelector('#game-progress-styles')) {
            const style = document.createElement('style');
            style.id = 'game-progress-styles';
            style.textContent = `
                @keyframes gameSlideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes gameSlideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'gameSlideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Login prompt for non-logged in users
    showLoginPromptIfNeeded() {
        if (window.GameMasterAuth && window.GameMasterAuth.isLoggedIn()) {
            return; // User is already logged in
        }

        // Check if we've already shown the prompt recently
        const lastPrompt = localStorage.getItem('gamemaster_login_prompt_v2');
        const now = Date.now();
        if (lastPrompt && (now - parseInt(lastPrompt)) < 300000) { // 5 minutes
            return;
        }

        // Show prompt after 10 seconds of gameplay
        setTimeout(() => {
            if (!window.GameMasterAuth || !window.GameMasterAuth.isLoggedIn()) {
                this.createLoginPrompt();
            }
        }, 10000);
    }

    createLoginPrompt() {
        // Remove existing prompt if present
        const existingPrompt = document.getElementById('game-login-prompt');
        if (existingPrompt) {
            existingPrompt.remove();
        }

        const prompt = document.createElement('div');
        prompt.id = 'game-login-prompt';
        prompt.className = 'game-login-prompt';
        prompt.innerHTML = `
            <div class="login-prompt-content">
                <h3>💾 Save Your Progress!</h3>
                <p>Create an account to save your game progress and scores across all devices.</p>
                <div class="login-prompt-buttons">
                    <button id="prompt-login-btn" class="prompt-btn prompt-login">🔑 Login</button>
                    <button id="prompt-signup-btn" class="prompt-btn prompt-signup">✨ Sign Up</button>
                    <button id="prompt-close-btn" class="prompt-btn prompt-close">❌ Maybe Later</button>
                </div>
            </div>
        `;

        // Style the prompt
        prompt.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            border: 2px solid #00ff00;
            border-radius: 12px;
            padding: 20px;
            max-width: 320px;
            box-shadow: 0 8px 32px rgba(0, 255, 0, 0.3);
            z-index: 3500;
            font-family: 'Oswald', sans-serif;
            color: #00ff00;
            animation: promptSlideIn 0.4s ease;
        `;

        // Add styles for prompt elements
        if (!document.querySelector('#login-prompt-styles')) {
            const promptStyles = document.createElement('style');
            promptStyles.id = 'login-prompt-styles';
            promptStyles.textContent = `
                .game-login-prompt h3 {
                    margin: 0 0 10px 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #00ff00;
                    text-transform: uppercase;
                }
                .game-login-prompt p {
                    margin: 0 0 15px 0;
                    font-size: 14px;
                    line-height: 1.4;
                    color: #cccccc;
                }
                .login-prompt-buttons {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .prompt-btn {
                    padding: 8px 12px;
                    border: 1px solid #00ff00;
                    background: transparent;
                    color: #00ff00;
                    border-radius: 4px;
                    cursor: pointer;
                    font-family: 'Oswald', sans-serif;
                    font-size: 11px;
                    text-transform: uppercase;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    flex: 1;
                    min-width: 70px;
                }
                .prompt-btn:hover {
                    background: #00ff00;
                    color: #000000;
                    transform: translateY(-1px);
                }
                .prompt-close {
                    border-color: #666;
                    color: #666;
                }
                .prompt-close:hover {
                    background: #666;
                    color: #ffffff;
                }
                @keyframes promptSlideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes promptSlideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(promptStyles);
        }

        document.body.appendChild(prompt);

        // Add event listeners
        document.getElementById('prompt-login-btn').addEventListener('click', () => {
            if (window.GameMasterAuth && window.GameMasterAuth.instance) {
                window.GameMasterAuth.instance.showLoginModal();
            }
            this.hideLoginPrompt();
        });

        document.getElementById('prompt-signup-btn').addEventListener('click', () => {
            if (window.GameMasterAuth && window.GameMasterAuth.instance) {
                window.GameMasterAuth.instance.showSignupModal();
            }
            this.hideLoginPrompt();
        });

        document.getElementById('prompt-close-btn').addEventListener('click', () => {
            this.hideLoginPrompt();
            localStorage.setItem('gamemaster_login_prompt_v2', Date.now().toString());
        });

        // Auto-close after 15 seconds
        setTimeout(() => {
            this.hideLoginPrompt();
            localStorage.setItem('gamemaster_login_prompt_v2', Date.now().toString());
        }, 15000);
    }

    hideLoginPrompt() {
        const prompt = document.getElementById('game-login-prompt');
        if (prompt) {
            prompt.style.animation = 'promptSlideOut 0.3s ease';
            setTimeout(() => {
                if (prompt.parentNode) {
                    prompt.remove();
                }
            }, 300);
        }
    }

    // Public API for games to use
    getProgress() {
        return { ...this.sessionData };
    }

    getCurrentScore() {
        return this.sessionData.score;
    }

    getCurrentLevel() {
        return this.sessionData.level;
    }

    getPlayTime() {
        return this.sessionData.playTime;
    }


    isLoggedIn() {
        return window.GameMasterAuth ? window.GameMasterAuth.isLoggedIn() : false;
    }

    getCurrentUser() {
        return window.GameMasterAuth ? window.GameMasterAuth.getCurrentUser() : null;
    }
}

// Global API for easy game integration
window.GameProgress = {
    // Create a new tracker for a game
    createTracker: (gameName) => {
        return new GameProgressTracker(gameName);
    },
    
    // Quick access methods (for backward compatibility)
    saveProgress: (gameName, data) => {
        if (window.GameMasterAuth) {
            window.GameMasterAuth.saveProgress(gameName, data);
        }
    },
    
    getProgress: (gameName) => {
        return window.GameMasterAuth ? window.GameMasterAuth.getProgress(gameName) : null;
    },
    
    isLoggedIn: () => {
        return window.GameMasterAuth ? window.GameMasterAuth.isLoggedIn() : false;
    },
    
    getCurrentUser: () => {
        return window.GameMasterAuth ? window.GameMasterAuth.getCurrentUser() : null;
    }
};

// Auto-initialize for backward compatibility
window.GameTracker = GameProgressTracker;
