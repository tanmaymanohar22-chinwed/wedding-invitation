const loader = document.getElementById('loader');
const navbar = document.querySelector('.navbar');
const backToTop = document.getElementById('backToTop');
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const revealItems = document.querySelectorAll('.reveal');
const welcomeOverlay = document.getElementById('welcomeOverlay');
const openInvitationBtn = document.getElementById('openInvitationBtn');
const welcomeHeading = document.querySelector('.welcome-card h2');
const welcomeSubtitle = document.querySelector('.welcome-subtitle');
const bgMusic = document.getElementById('bgMusic');
const rsvpForm = document.getElementById('rsvpForm');
const rsvpMessage = document.getElementById('rsvpMessage');
const rsvpSheetUrl = rsvpForm?.dataset.sheetUrl || window.RSVP_GOOGLE_SHEET_URL;

// Welcome overlay removed — no interaction needed here

window.addEventListener('load', () => {
  setTimeout(() => {
    loader.classList.add('hidden');
  }, 700);
});

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  backToTop.classList.toggle('show', window.scrollY > 500);
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

toggle?.addEventListener('click', () => {
  navLinks?.classList.toggle('open');
});

navLinks?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealItems.forEach((item) => observer.observe(item));

if (welcomeOverlay && openInvitationBtn) {
  document.body.classList.add('welcome-visible');
  openInvitationBtn.addEventListener('click', () => {
    welcomeOverlay.classList.add('opening');
    if (welcomeHeading) welcomeHeading.textContent = "You're Invited";
    if (welcomeSubtitle) welcomeSubtitle.textContent = 'Step inside and celebrate with us';
    openInvitationBtn.textContent = 'Welcome';
    if (bgMusic) {
      bgMusic.dataset.userUnlocked = 'true';
      window.startMusic?.();
    }
    createConfetti();
    setTimeout(() => {
      welcomeOverlay.classList.add('hidden');
      document.body.classList.remove('welcome-visible');
    }, 900);
  });
}

function createConfetti() {
  const colors = ['#ffe08a', '#ffffff', '#ffd0d0', '#d4af37'];
  const pieceCount = 24;
  for (let i = 0; i < pieceCount; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty('--x', `${(Math.random() - 0.5) * 240}px`);
    piece.style.animationDuration = `${1 + Math.random() * 0.6}s`;
    welcomeOverlay.appendChild(piece);
    setTimeout(() => piece.remove(), 1400);
  }
}

const targetDate = new Date('2026-08-21T15:00:00');
function updateCountdown() {
  const now = new Date();
  const diff = targetDate - now;
  if (diff <= 0) {
    document.getElementById('days').textContent = '00';
    document.getElementById('hours').textContent = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
    return;
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  document.getElementById('days').textContent = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

async function submitRsvpToPrivateStore(data) {
  const url = String(rsvpSheetUrl || '').trim();

  if (!url) {
    throw new Error('RSVP endpoint is not configured.');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      submittedAt: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return response.text();
}

if (rsvpForm) {
  rsvpForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(rsvpForm);
    const submission = Object.fromEntries(formData.entries());
    const name = String(submission.name || '').trim();

    if (!name) {
      if (rsvpMessage) {
        rsvpMessage.textContent = 'Please enter your name before sending the RSVP.';
        rsvpMessage.className = 'form-message error';
      }
      return;
    }

    try {
      await submitRsvpToPrivateStore(submission);
      rsvpForm.reset();

      if (rsvpMessage) {
        rsvpMessage.textContent = `Thank you, ${name}! Your RSVP has been saved privately to your local file.`;
        rsvpMessage.className = 'form-message success';
      }
    } catch (error) {
      console.error('Unable to save RSVP privately:', error);
      if (rsvpMessage) {
        rsvpMessage.textContent = 'Your RSVP could not be saved yet. Please start the local server.';
        rsvpMessage.className = 'form-message error';
      }
    }
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);
