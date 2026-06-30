const audio = document.getElementById('bgMusic');
const playPauseBtn = document.getElementById('playPauseBtn');

function updateMusicUI() {
  if (!audio) return;
  const playing = !audio.paused;
  playPauseBtn.innerHTML = playing ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
}

playPauseBtn?.addEventListener('click', () => {
  if (!audio) return;
  if (audio.paused) {
    audio.play().catch(() => {});
  } else {
    audio.pause();
    // fully stop and reset so it doesn't continue
    try { audio.currentTime = 0; } catch (e) {}
  }
  updateMusicUI();
});

audio?.addEventListener('play', updateMusicUI);
audio?.addEventListener('pause', updateMusicUI);
updateMusicUI();
