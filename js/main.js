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
const scheduleCards = document.querySelectorAll('.schedule-card');
const scheduleList = document.querySelector('.schedule-list');

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

if (scheduleCards.length && scheduleList) {
  const scheduleRail = document.createElement('span');
  scheduleRail.className = 'schedule-rail';
  scheduleList.appendChild(scheduleRail);

  const scheduleObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      } else {
        entry.target.classList.remove('active');
      }
    });
  }, { threshold: 0.55 });

  scheduleCards.forEach((card) => scheduleObserver.observe(card));

  const updateScheduleRail = () => {
    if (!scheduleList) return;
    const rect = scheduleList.getBoundingClientRect();
    
    // Position the heart near the vertical middle of the screen
    // so it arrives at events well before the navbar does.
    let offset = (window.innerHeight * 0.5) - rect.top;
    
    // Clamp the heart so it stays within the vertical line
    if (offset < 0) offset = 0;
    if (offset > rect.height) offset = rect.height;
    
    const scrollPct = rect.height > 0 ? (offset / rect.height) * 100 : 0;
    
    scheduleList.style.setProperty('--ball-top', `${offset}px`);
    scheduleList.style.setProperty('--scroll-pct', scrollPct);
    
    // Calculate exact X position by measuring the SVG path length
    const svgPath = scheduleList.querySelector('.winding-path-base');
    if (svgPath) {
      const pathLength = svgPath.getTotalLength();
      // Clamp to 0-1 for getting the point along the SVG length
      let clampedPct = scrollPct / 100;
      if (clampedPct < 0) clampedPct = 0;
      if (clampedPct > 1) clampedPct = 1;
      
      const point = svgPath.getPointAtLength(pathLength * clampedPct);
      // Pass the raw percentage (0 to 1) so CSS can scale it based on width
      scheduleList.style.setProperty('--heart-x-pct', point.x / 100); 
    }
  };

  window.addEventListener('scroll', updateScheduleRail, { passive: true });
  window.addEventListener('resize', updateScheduleRail);
  updateScheduleRail();
}

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

  // Google Apps Script requires no-cors mode; data still saves to the sheet
  await fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      submittedAt: new Date().toISOString(),
    }),
  });
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
        rsvpMessage.textContent = `Thank you, ${name}! Your RSVP has been received. We look forward to celebrating with you! 🎉`;
        rsvpMessage.className = 'form-message success';
      }
    } catch (error) {
      console.error('Unable to save RSVP:', error);
      if (rsvpMessage) {
        rsvpMessage.textContent = 'Something went wrong. Please try again or contact us directly.';
        rsvpMessage.className = 'form-message error';
      }
    }

  });
}

const greetingForm = document.getElementById('greetingForm');
const greetingMessage = document.getElementById('greetingMessage');

if (greetingForm) {
  greetingForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(greetingForm);
    const submission = Object.fromEntries(formData.entries());
    const name = String(submission.name || '').trim();

    if (!name) {
      if (greetingMessage) {
        greetingMessage.textContent = 'Please enter your name.';
        greetingMessage.className = 'form-message error';
      }
      return;
    }

    try {
      await submitRsvpToPrivateStore(submission);
      greetingForm.reset();

      if (greetingMessage) {
        greetingMessage.textContent = `Thank you, ${name}! Your blessing has been received with love. 💖`;
        greetingMessage.className = 'form-message success';
      }
    } catch (error) {
      console.error('Unable to save greeting:', error);
      if (greetingMessage) {
        greetingMessage.textContent = 'Something went wrong. Please try again.';
        greetingMessage.className = 'form-message error';
      }
    }
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Automatically apply 'filled' class for styling when inputs have data (handles autofill/paste robustly on all browsers)
document.querySelectorAll('.rsvp-form input, .rsvp-form textarea, .rsvp-form select').forEach(el => {
  const checkFilled = () => {
    if (el.value.trim() !== '') {
      el.classList.add('filled');
    } else {
      el.classList.remove('filled');
    }
  };
  el.addEventListener('input', checkFilled);
  el.addEventListener('change', checkFilled);
  el.addEventListener('blur', checkFilled);
  el.addEventListener('paste', () => setTimeout(checkFilled, 10));
  
  // Initial check in case of browser autofill on load
  setTimeout(checkFilled, 100);
});
