const fs = require('fs');
const path = require('path');

// Get the games data
const gamesData = require('./games/games-data.js');

// HTML template for game pages
const createGamePage = (game, gameFileName) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Game Master - ${game.title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@200;300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../styles.css">
    <link rel="stylesheet" href="game-page.css">
</head>
<body>
    <nav class="top-nav">
        <div class="nav-logo">
            <a href="../index.html">The Game Master</a>
        </div>
        <div class="nav-links">
            <a href="../index.html">Home</a>
            <a href="#" class="active">Games</a>
            <a href="#">Forms</a>
            <a href="#">Cheats</a>
            <a href="#">My Youtube Channels</a>
        </div>
    </nav>

    <main class="game-page">
        <div class="game-container">
            <iframe src="${game.url}" 
                    frameborder="0" 
                    allowfullscreen></iframe>
            <button class="fullscreen-btn" onclick="toggleFullscreen()">Play in Fullscreen</button>
        </div>
    </main>

    <footer>
        <p>Last Updated: 1/31/2024</p>
    </footer>

    <script>
        function toggleFullscreen() {
            const iframe = document.querySelector('iframe');
            if (iframe.requestFullscreen) {
                iframe.requestFullscreen();
            } else if (iframe.webkitRequestFullscreen) {
                iframe.webkitRequestFullscreen();
            } else if (iframe.msRequestFullscreen) {
                iframe.msRequestFullscreen();
            }
        }
    </script>
</body>
</html>`;

// Create games directory if it doesn't exist
if (!fs.existsSync('games')) {
    fs.mkdirSync('games');
}

// Generate a page for each game
games.forEach(game => {
    const gameFileName = game.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const filePath = path.join('games', `${gameFileName}.html`);
    
    fs.writeFileSync(filePath, createGamePage(game, gameFileName));
    console.log(`Created: ${filePath}`);
});

console.log('All game pages have been generated!'); 