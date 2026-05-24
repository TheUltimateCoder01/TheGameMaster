function toggleFullscreen() {
    const container = document.querySelector('.game-container');
    if (!container) return;

    const doc = document;
    const active =
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.msFullscreenElement;

    if (active) {
        const exit =
            doc.exitFullscreen ||
            doc.webkitExitFullscreen ||
            doc.msExitFullscreen;
        if (exit) exit.call(doc);
        return;
    }

    const request =
        container.requestFullscreen ||
        container.webkitRequestFullscreen ||
        container.msRequestFullscreen;
    if (request) request.call(container);
}

function ensureExitButton() {
    let btn = document.querySelector('.fullscreen-exit-btn');
    if (btn) return btn;

    const container = document.querySelector('.game-container');
    if (!container) return null;

    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fullscreen-exit-btn';
    btn.setAttribute('aria-label', 'Exit fullscreen');
    btn.title = 'Exit fullscreen';
    btn.innerHTML = '&times;';
    btn.addEventListener('click', toggleFullscreen);
    container.appendChild(btn);
    return btn;
}

function updateFullscreenUI() {
    const active = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
    );

    const playBtn = document.querySelector('.fullscreen-btn');
    const exitBtn = ensureExitButton();

    if (playBtn) {
        playBtn.style.display = active ? 'none' : '';
        playBtn.textContent = 'Play in Fullscreen';
    }
    if (exitBtn) {
        exitBtn.style.display = active ? 'flex' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', ensureExitButton);
document.addEventListener('fullscreenchange', updateFullscreenUI);
document.addEventListener('webkitfullscreenchange', updateFullscreenUI);
