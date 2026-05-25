# The Game Master

> Free browser-based games. No downloads. No limits.

---

## What is this?

The Game Master is a collection of 50+ free browser games playable instantly — no installs, no accounts required. Built as a static website with a clean green-on-black UI.

---

## Games

| Category | Examples |
|---|---|
| Action | 1v1.LOL, Epic Ninja, Gun Spin, Zombie Last Survivor |
| Arcade | Flappy Bird, Geometry Dash, Pac-Man, Subway Surfers |
| Driving | Drift Boss, Drive Mad, Moto X3M |
| Multiplayer | Among Us, JustFall.LOL, Powerline.io, Snake.io |
| Platformer | Super Mario Bros, Vex 1–8 |
| Puzzle | 2048, Fireboy & Watergirl, Maze, The Impossible Quiz |
| Sandbox | Eaglercraft, Terraria |
| Simulation | Cookie Clicker, Idle Breakout, Monkey Mart |
| Skill | Cluster Rush, Run 3, Slope, Stickman Hook |
| Sports | Basket Random, Golf Orbit, Retro Bowl |
| Strategy | Chess, Plants vs Zombies |
| + more | Happy Wheels, Henry Stickman, Jelly Mario... |

---

## Structure

```
The Game Master/
├── index.html              # Home page
├── games.html              # Games browser with search & filters
├── cheats.html             # Game cheats & console tricks
├── forms.html              # Game request / feedback form
├── styles.css              # Global styles
├── app.js                  # Search, filters, game grid logic
├── auth-system.js          # User login / profile system
├── favorites.js            # Favorites functionality
├── games/
│   ├── games-data.js       # Master game list (add new games here)
│   ├── game-page.css       # Shared game page styles
│   ├── game-fullscreen.js  # Fullscreen toggle logic
│   └── *.html              # Individual game pages
└── assets/
    └── images/
        └── games/          # Game thumbnail images
```

---

## Features

- 50+ free games, no downloads required
- Search and category filters
- Favorites system (star any game to save it)
- Recently played tracking
- User accounts and profiles
- "Open in about:blank" tab disguise button
- Fullscreen mode on every game
- Game cheats & console tricks page
- Game request form (EmailJS)
- PWA support (installable)

---

## Tech Stack

Pure HTML, CSS, and vanilla JavaScript. No frameworks, no build tools, no dependencies.
