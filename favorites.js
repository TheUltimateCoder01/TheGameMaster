document.addEventListener('DOMContentLoaded', () => {
    const gameGrid = document.getElementById('game-grid');
    const searchInput = document.getElementById('search-input');
    const categoryFilters = document.getElementById('category-filters');
    let favorites = JSON.parse(localStorage.getItem('favoriteGames')) || [];

    // --- Create Category Filters ---
    if (categoryFilters) {
        const categories = ['All', 'Favorites', ...new Set(games.map(game => game.category))];
        categories.forEach(category => {
            const button = document.createElement('button');
            button.textContent = category;
            button.classList.add('filter-btn');
            if (category === 'All') {
                button.classList.add('active');
            }
            
            // Add favorites count to the Favorites button
            if (category === 'Favorites') {
                const favoritesCount = favorites.length;
                button.textContent = `Favorites (${favoritesCount})`;
            }
            
            button.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                filterGames();
            });
            categoryFilters.appendChild(button);
        });
    }

    // --- Update Favorites Count in Filter Button ---
    const updateFavoritesCount = () => {
        const favoritesBtn = Array.from(document.querySelectorAll('.filter-btn')).find(btn => btn.textContent.includes('Favorites'));
        if (favoritesBtn) {
            favoritesBtn.textContent = `Favorites (${favorites.length})`;
        }
    };

    // --- Display Recently Played Games ---
    const displayRecentlyPlayed = () => {
        const recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed')) || [];
        const container = document.getElementById('recently-played');
        const grid = document.getElementById('recently-played-grid');

        if (!container || recentlyPlayed.length === 0) {
            if(container) container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        container.style.opacity = '1';
        grid.innerHTML = '';

        recentlyPlayed.forEach(game => {
            const gameCard = document.createElement('a');
            gameCard.href = `games/${game.url}`;
            gameCard.className = 'game-card';

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-from-recent-btn';
            removeBtn.innerHTML = '&times;'; // The 'X' symbol
            removeBtn.title = 'Remove from recently played';

            removeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                let currentRecentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed')) || [];
                currentRecentlyPlayed = currentRecentlyPlayed.filter(item => item.title !== game.title);
                localStorage.setItem('recentlyPlayed', JSON.stringify(currentRecentlyPlayed));
                displayRecentlyPlayed();
            });

            const imageContainer = document.createElement('div');
            imageContainer.className = 'game-image-container';

            const gameImage = document.createElement('img');
            gameImage.src = `assets/images/games/${game.image}`;
            gameImage.alt = game.title;
            gameImage.onerror = () => { gameImage.src = 'assets/images/placeholder.jpg'; };

            const gameTitle = document.createElement('h2');
            gameTitle.className = 'game-title';
            gameTitle.textContent = game.title;

            const favoriteBtn = document.createElement('button');
            favoriteBtn.className = 'favorite-btn';
            favoriteBtn.innerHTML = '&#9734;';
            favoriteBtn.title = 'Add to favorites';
            if (favorites.some(fav => fav.title === game.title)) {
                favoriteBtn.innerHTML = '&#9733;';
                favoriteBtn.title = 'Remove from favorites';
                favoriteBtn.classList.add('favorited');
            }

            favoriteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(game, favoriteBtn);
            });

            gameCard.appendChild(removeBtn);
            imageContainer.appendChild(gameImage);
            gameCard.appendChild(imageContainer);
            gameCard.appendChild(gameTitle);
            gameCard.appendChild(favoriteBtn);
            grid.appendChild(gameCard);
        });
    };

    // --- Display Games ---
    const displayGames = (filteredGames) => {
        if (!gameGrid) return;
        gameGrid.innerHTML = '';
        const gamesToDisplay = filteredGames || games;

        if (gamesToDisplay.length === 0) {
            const activeFilter = document.querySelector('.filter-btn.active').textContent;
            if (activeFilter.includes('Favorites')) {
                gameGrid.innerHTML = '<p class="no-results" style="color: #00ff00;">No favorite games yet. Click the star on any game to add it to your favorites!</p>';
            } else {
                gameGrid.innerHTML = '<p class="no-results" style="color: #00ff00;">No games found...</p>';
            }
            return;
        }

        gamesToDisplay.forEach(game => {
            const gameCard = document.createElement('a');
            gameCard.href = `games/${game.url}`;
            gameCard.className = 'game-card';
            gameCard.setAttribute('data-category', game.category);

            gameCard.addEventListener('click', () => {
                let recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed')) || [];
                const playedGame = { title: game.title, url: game.url, image: game.image };
                recentlyPlayed = recentlyPlayed.filter(item => item.title !== playedGame.title);
                recentlyPlayed.unshift(playedGame);
                recentlyPlayed = recentlyPlayed.slice(0, 5);
                localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
            });

            const imageContainer = document.createElement('div');
            imageContainer.className = 'game-image-container';

            const gameImage = document.createElement('img');
            gameImage.src = `assets/images/games/${game.image}`;
            gameImage.alt = game.title;
            gameImage.onerror = () => { gameImage.src = 'assets/images/placeholder.jpg'; };

            const gameTitle = document.createElement('h2');
            gameTitle.className = 'game-title';
            gameTitle.textContent = game.title;

            const favoriteBtn = document.createElement('button');
            favoriteBtn.className = 'favorite-btn';
            favoriteBtn.innerHTML = '&#9734;';
            favoriteBtn.title = 'Add to favorites';
            if (favorites.some(fav => fav.title === game.title)) {
                favoriteBtn.innerHTML = '&#9733;';
                favoriteBtn.title = 'Remove from favorites';
                favoriteBtn.classList.add('favorited');
            }

            favoriteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(game, favoriteBtn);
            });

            imageContainer.appendChild(gameImage);
            gameCard.appendChild(imageContainer);
            gameCard.appendChild(gameTitle);
            gameCard.appendChild(favoriteBtn);
            gameGrid.appendChild(gameCard);
        });
    };

    // --- Toggle Favorite ---
    const toggleFavorite = (game, favoriteBtn) => {
        const gameIndex = favorites.findIndex(fav => fav.title === game.title);

        favoriteBtn.classList.add('animating');
        setTimeout(() => favoriteBtn.classList.remove('animating'), 300);

        if (gameIndex > -1) {
            favorites.splice(gameIndex, 1);
            favoriteBtn.innerHTML = '&#9734;';
            favoriteBtn.title = 'Add to favorites';
            favoriteBtn.classList.remove('favorited');
            showNotification(`${game.title} removed from favorites`, 'info');
        } else {
            favorites.push({ title: game.title, url: game.url, image: game.image, category: game.category });
            favoriteBtn.innerHTML = '&#9733;';
            favoriteBtn.title = 'Remove from favorites';
            favoriteBtn.classList.add('favorited');
            showNotification(`${game.title} added to favorites!`, 'success');
        }

        localStorage.setItem('favoriteGames', JSON.stringify(favorites));
        updateFavoritesCount();
        
        const activeFilter = document.querySelector('.filter-btn.active');
        if (activeFilter && activeFilter.textContent.includes('Favorites')) {
            filterGames();
        }
    };

    // --- Show Notification ---
    const showNotification = (message, type = 'info') => {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 12px 20px;
            border-radius: 8px; color: #00ff00; font-weight: 600; z-index: 1000;
            transform: translateX(120%); transition: transform 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            background-color: #000;
            border: 2px solid #00ff00;
        `;

        document.body.appendChild(notification);

        setTimeout(() => { notification.style.transform = 'translateX(0)'; }, 100);
        setTimeout(() => {
            notification.style.transform = 'translateX(120%)';
            setTimeout(() => { notification.remove(); }, 300);
        }, 3000);
    };

    // --- Filter and Search ---
    const filterGames = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const activeCategory = document.querySelector('.filter-btn.active').textContent;
        let filteredGames = games;

        if (activeCategory.includes('Favorites')) {
            const favoriteTitles = favorites.map(fav => fav.title);
            filteredGames = games.filter(game => favoriteTitles.includes(game.title));
        } else if (activeCategory !== 'All') {
            filteredGames = games.filter(game => game.category === activeCategory);
        }

        if (searchTerm) {
            filteredGames = filteredGames.filter(game => game.title.toLowerCase().includes(searchTerm));
        }

        displayGames(filteredGames);
    };

    if (searchInput) {
        searchInput.addEventListener('input', filterGames);
    }
    
    if (gameGrid) {
        displayGames();
    }
    if (document.getElementById('recently-played')) {
        displayRecentlyPlayed();
    }

    // --- Back to Top Button ---
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if(backToTopBtn) {
        window.onscroll = () => {
            if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        };
        backToTopBtn.addEventListener('click', () => {
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        });
    }

    // --- Show Favorites Instructions ---
    const instructions = document.getElementById('favorites-instructions');
    if (instructions) {
        const hasSeen = localStorage.getItem('favoritesInstructionsShown');
        if (!hasSeen) {
            setTimeout(() => {
                instructions.style.display = 'block';
                setTimeout(() => instructions.style.opacity = '1', 50);
            }, 1000);
        }
    }
    
    window.hideFavoritesInstructions = () => {
        if (!instructions) return;
        instructions.style.opacity = '0';
        setTimeout(() => {
            instructions.style.display = 'none';
        }, 300);
        localStorage.setItem('favoritesInstructionsShown', 'true');
    };
});