document.addEventListener('DOMContentLoaded', () => {
    const gamesGrid = document.querySelector('.games-grid');

    // Only run this script if the gamesGrid container exists on the page
    if (gamesGrid) {
        // Create game cards without sorting
        games.forEach(game => {
            const gameCard = document.createElement('a');
            gameCard.href = `games/${game.url}`;
            gameCard.className = 'game-card';
            
            // Special case for Vex - use Vex 8 image
            let imageUrl;
            if (game.title === "Vex") {
                imageUrl = `assets/images/games/vex/Vex 8.png`;
            } else {
                // Try both formats for image URL - with spaces and with hyphens
                const imageUrlWithSpaces = `assets/images/games/${game.title}.png`;
                imageUrl = imageUrlWithSpaces;
            }
            
            // Create image element with error handling
            const img = new Image();
            img.src = imageUrl;
            img.alt = game.title;
            
            // Set a default background color while image loads
            img.style.backgroundColor = '#000000';
            
            // If image fails to load, try hyphenated version, then fallback to initials
            img.onerror = function() {
                // For Vex, don't try alternative paths since we're using a specific image
                if (game.title === "Vex") {
                    this.onerror = function() {
                        this.style.height = '150px';
                        this.style.width = '150px';
                        this.style.display = 'flex';
                        this.style.alignItems = 'center';
                        this.style.justifyContent = 'center';
                        this.style.fontSize = '2rem';
                        this.style.color = '#00ff00';
                        this.style.textTransform = 'uppercase';
                        this.style.fontFamily = 'Oswald, sans-serif';
                        const initials = game.title.split(' ')
                            .map(word => word[0])
                            .join('')
                            .substring(0, 2);
                        this.style.backgroundImage = 'none';
                        this.style.backgroundColor = '#000000';
                        this.parentNode.classList.add('placeholder');
                        const textDiv = document.createElement('div');
                        textDiv.textContent = initials;
                        textDiv.style.position = 'absolute';
                        textDiv.style.top = '50%';
                        textDiv.style.left = '50%';
                        textDiv.style.transform = 'translate(-50%, -50%)';
                        this.parentNode.style.position = 'relative';
                        this.parentNode.appendChild(textDiv);
                    };
                    return;
                }
                
                // Try hyphenated version first
                const gameFileName = game.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
                this.src = `assets/images/games/${gameFileName}.png`;
                
                // If that also fails, show initials
                this.onerror = function() {
                    this.style.height = '150px';
                    this.style.width = '150px';
                    this.style.display = 'flex';
                    this.style.alignItems = 'center';
                    this.style.justifyContent = 'center';
                    this.style.fontSize = '2rem';
                    this.style.color = '#00ff00';
                    this.style.textTransform = 'uppercase';
                    this.style.fontFamily = 'Oswald, sans-serif';
                    // Use first letter of each word for the placeholder
                    const initials = game.title.split(' ')
                        .map(word => word[0])
                        .join('')
                        .substring(0, 2);
                    this.style.backgroundImage = 'none';
                    this.style.backgroundColor = '#000000';
                    // Add placeholder class to container
                    this.parentNode.classList.add('placeholder');
                    // Create a div for the text since img can't contain text
                    const textDiv = document.createElement('div');
                    textDiv.textContent = initials;
                    textDiv.style.position = 'absolute';
                    textDiv.style.top = '50%';
                    textDiv.style.left = '50%';
                    textDiv.style.transform = 'translate(-50%, -50%)';
                    this.parentNode.style.position = 'relative';
                    this.parentNode.appendChild(textDiv);
                };
            };
            
            gameCard.innerHTML = `
                <div class="game-image-container">
                    ${img.outerHTML}
                </div>
                <h3>${game.title}</h3>
            `;
            
            gamesGrid.appendChild(gameCard);
        });
    }
}); 