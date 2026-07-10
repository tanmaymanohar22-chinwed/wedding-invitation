const audio = document.getElementById('bgMusic');
const playPauseBtn = document.getElementById('playPauseBtn');

function updateMusicUI() {
  if (!audio) return;
  const playing = !audio.paused;
  if (playPauseBtn) {
    playPauseBtn.innerHTML = playing ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
  }
}

function startMusic() {
  if (!audio) return;
  if (audio.paused) {
    const playPromise = audio.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }
  }
  updateMusicUI();
}

function toggleMusic() {
  if (!audio) return;
  if (audio.paused) {
    startMusic();
  } else {
    audio.pause();
    try { audio.currentTime = 0; } catch (e) {}
  }
  updateMusicUI();
}

playPauseBtn?.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleMusic();
});

document.addEventListener('click', () => {
  if (!audio) return;
  if (audio.paused && audio.dataset.userUnlocked !== 'true') {
    startMusic();
    audio.dataset.userUnlocked = 'true';
  }
}, { once: false });

audio?.addEventListener('play', updateMusicUI);
audio?.addEventListener('pause', updateMusicUI);
window.updateMusicUI = updateMusicUI;
window.startMusic = startMusic;
window.toggleMusic = toggleMusic;
updateMusicUI();
