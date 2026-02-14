// ===== CONFIGURATION =====
// Propose Day: Answer is checked via date selectors (14 Nov 2023)
// Promise & Kiss Day: Text-based answers (change below)
const dayConfig = {
  promise: {
    question: "What's our special date? 📅",
    answer: "14 feb",   // <-- CHANGE THIS to your real answer
    hint: "The day that changed everything...",
    questionElement: 'promiseQuestionText',
    answerElement: 'promiseAnswer',
    hintElement: 'promiseHint',
    questionPage: 'promiseQuestion',
    dayPage: 'promisePage'
  },
  kiss: {
    question: "What do you call me? 💕",
    answer: "baby",     // <-- CHANGE THIS to your real answer
    hint: "Your sweetest nickname for me...",
    questionElement: 'kissQuestionText',
    answerElement: 'kissAnswer',
    hintElement: 'kissHint',
    questionPage: 'kissQuestion',
    dayPage: 'kissPage'
  }
};

// Propose Day correct date
const PROPOSE_CORRECT_DAY = 14;
const PROPOSE_CORRECT_MONTH = 11; // November
const PROPOSE_CORRECT_YEAR = 2023;

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
  createFloatingHearts();
  createSparkles();
  setQuestionTexts();
  populateDateSelectors();
});

// ===== SET QUESTION TEXTS =====
function setQuestionTexts() {
  for (const [key, config] of Object.entries(dayConfig)) {
    const el = document.getElementById(config.questionElement);
    if (el) el.textContent = config.question;
  }
}

// ===== POPULATE DATE SELECTORS =====
function populateDateSelectors() {
  const daySelect = document.getElementById('proposeDay');
  const yearSelect = document.getElementById('proposeYear');

  // Days 1-31
  for (let d = 1; d <= 31; d++) {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d < 10 ? '0' + d : d;
    daySelect.appendChild(opt);
  }

  // Years 2018-2026
  for (let y = 2018; y <= 2026; y++) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }
}

// ===== PAGE NAVIGATION =====
let currentPage = 'frontPage';
let loveTextInterval = null;
let proposePageActive = false;
let slideshowInterval = null;
let slideshowTimeout = null;
let currentSlide = 0;
const MUSIC_LEAD_TIME = 4000;  // 4 seconds before photos appear
const SLIDE_DURATION = 4000;   // 4 seconds per photo

function showPage(pageId) {
  // Hide current page
  const current = document.getElementById(currentPage);
  if (current) {
    current.classList.add('page-exit');
    setTimeout(() => {
      current.classList.remove('active', 'page-exit');
    }, 400);
  }

  // Show new page
  setTimeout(() => {
    const next = document.getElementById(pageId);
    if (next) {
      next.classList.add('active', 'page-enter');
      currentPage = pageId;

      // Focus input if it's a question page
      const input = next.querySelector('.answer-input');
      if (input) {
        setTimeout(() => input.focus(), 500);
      }

      // If showing propose page, start animations
      if (pageId === 'proposePage') {
        proposePageActive = true;
        startProposePage();
      }
    }
  }, 400);
}

function showQuestionPage(day) {
  if (day === 'propose') {
    // Reset date selectors
    document.getElementById('proposeDay').selectedIndex = 0;
    document.getElementById('proposeMonth').selectedIndex = 0;
    document.getElementById('proposeYear').selectedIndex = 0;
    document.getElementById('proposeHint').textContent = '';
    // Start music early so it plays during the question
    autoPlayMusic();
    showPage('proposeQuestion');
  } else {
    const config = dayConfig[day];
    if (config) {
      document.getElementById(config.hintElement).textContent = '';
      document.getElementById(config.answerElement).value = '';
      showPage(config.questionPage);
    }
  }
}

function goBack() {
  showPage('frontPage');
}

function goBackFromPropose() {
  // Stop music and animations
  stopProposePage();
  showPage('frontPage');
}

// ===== PROPOSE DATE CHECKER =====
function checkProposeDate() {
  const day = parseInt(document.getElementById('proposeDay').value);
  const month = parseInt(document.getElementById('proposeMonth').value);
  const year = parseInt(document.getElementById('proposeYear').value);
  const hint = document.getElementById('proposeHint');
  const container = document.querySelector('.date-selector-container');

  // Check if all selected
  if (!day || !month || !year) {
    hint.style.color = 'rgba(255, 100, 100, 0.8)';
    hint.textContent = "Please select the complete date, my love 💝";
    shakeElement(container);
    return;
  }

  if (day === PROPOSE_CORRECT_DAY && month === PROPOSE_CORRECT_MONTH && year === PROPOSE_CORRECT_YEAR) {
    // Correct!
    hint.style.color = 'rgba(100, 255, 150, 0.8)';
    hint.textContent = "You remember! 🎉💖 November 14, 2023!";
    createCelebrationBurst();

    setTimeout(() => {
      hint.style.color = '';
      hint.textContent = '';
      showPage('proposePage');
    }, 1500);
  } else {
    // Wrong
    hint.style.color = 'rgba(255, 100, 100, 0.8)';
    hint.textContent = "Hmm, that's not right... Think harder! 💭";
    shakeElement(container);
  }
}

// ===== ANSWER CHECKING (for Promise & Kiss days) =====
function checkAnswer(day) {
  const config = dayConfig[day];
  const input = document.getElementById(config.answerElement);
  const hint = document.getElementById(config.hintElement);
  const userAnswer = input.value.trim().toLowerCase();
  const correctAnswer = config.answer.toLowerCase();

  if (!userAnswer) {
    hint.textContent = "Don't leave it empty, my love! 💝";
    shakeElement(input);
    return;
  }

  if (userAnswer === correctAnswer) {
    input.classList.add('correct-glow');
    hint.textContent = '';
    hint.style.color = 'rgba(100, 255, 150, 0.8)';
    hint.textContent = "That's right! 🎉💖";
    createCelebrationBurst();

    setTimeout(() => {
      hint.style.color = '';
      input.classList.remove('correct-glow');
      showPage(config.dayPage);
    }, 1200);
  } else {
    hint.style.color = 'rgba(255, 100, 100, 0.8)';
    hint.textContent = config.hint;
    shakeElement(input);
    input.value = '';
    input.focus();
  }
}

function shakeElement(el) {
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 500);
}

// Allow Enter key to submit
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const activeInput = document.activeElement;
    if (activeInput && activeInput.classList.contains('answer-input')) {
      const day = activeInput.id.replace('Answer', '');
      checkAnswer(day);
    }
  }
});

// ===== PROPOSE PAGE FEATURES =====
function startProposePage() {
  createRosePetals();
  startLoveTextAnimation();

  // Hide slideshow initially
  const slideshow = document.getElementById('photoSlideshow');
  slideshow.classList.remove('visible');
  document.querySelectorAll('.slide').forEach(s => {
    s.classList.remove('active', 'fade-out');
  });
  currentSlide = 0;

  // After 20 seconds of music, reveal the photos
  slideshowTimeout = setTimeout(() => {
    if (!proposePageActive) return;
    slideshow.classList.add('visible');

    // Show first photo after a small delay
    setTimeout(() => {
      if (!proposePageActive) return;
      showSlide(0);
      // Start cycling
      slideshowInterval = setInterval(() => {
        if (!proposePageActive) return;
        nextSlide();
      }, SLIDE_DURATION);
    }, 800);
  }, MUSIC_LEAD_TIME);
}

function showSlide(index) {
  const slides = document.querySelectorAll('.slide');
  slides.forEach(s => {
    s.classList.remove('active', 'fade-out');
    s.style.display = 'none';
  });
  currentSlide = index;
  const slide = slides[index];
  if (slide) {
    slide.style.display = 'block';
    // Small delay for CSS to register display change
    requestAnimationFrame(() => {
      slide.classList.add('active');
    });
  }
}

function nextSlide() {
  const slides = document.querySelectorAll('.slide');
  const current = slides[currentSlide];

  // Fade out current
  current.classList.remove('active');
  current.classList.add('fade-out');

  // After fade-out animation, show next
  setTimeout(() => {
    current.classList.remove('fade-out');
    current.style.display = 'none';
    const nextIndex = (currentSlide + 1) % slides.length;
    showSlide(nextIndex);
  }, 800);
}

function stopProposePage() {
  proposePageActive = false;

  // Stop slideshow
  if (slideshowTimeout) { clearTimeout(slideshowTimeout); slideshowTimeout = null; }
  if (slideshowInterval) { clearInterval(slideshowInterval); slideshowInterval = null; }

  // Hide slideshow
  const slideshow = document.getElementById('photoSlideshow');
  if (slideshow) slideshow.classList.remove('visible');
  document.querySelectorAll('.slide').forEach(s => {
    s.classList.remove('active', 'fade-out');
    s.style.display = 'none';
  });

  // Stop music
  const music = document.getElementById('proposeMusic');
  if (music) {
    music.pause();
    music.currentTime = 0;
  }

  // Update music control
  const control = document.getElementById('musicControl');
  if (control) control.classList.remove('playing');
  const icon = document.getElementById('musicIcon');
  if (icon) icon.textContent = '🎵';
  const text = document.getElementById('musicText');
  if (text) text.textContent = 'Tap to play music';
  musicPlaying = false;

  // Stop love text animation
  if (loveTextInterval) {
    clearInterval(loveTextInterval);
    loveTextInterval = null;
  }

  // Clear love text
  const loveText = document.getElementById('loveText');
  if (loveText) loveText.textContent = '';

  // Clear rose petals
  const petals = document.getElementById('rosePetals');
  if (petals) petals.innerHTML = '';
}

// ===== MUSIC CONTROL =====
let musicPlaying = false;

function autoPlayMusic() {
  const music = document.getElementById('proposeMusic');
  const control = document.getElementById('musicControl');
  const icon = document.getElementById('musicIcon');
  const text = document.getElementById('musicText');

  music.play().then(() => {
    musicPlaying = true;
    control.classList.add('playing');
    icon.textContent = '🎶';
    text.textContent = 'Music playing...';
  }).catch(() => {
    // Browser blocked autoplay, show tap to play
    text.textContent = 'Tap to play music';
  });
}

function toggleMusic() {
  const music = document.getElementById('proposeMusic');
  const control = document.getElementById('musicControl');
  const icon = document.getElementById('musicIcon');
  const text = document.getElementById('musicText');

  if (music.paused) {
    music.play().then(() => {
      musicPlaying = true;
      control.classList.add('playing');
      icon.textContent = '🎶';
      text.textContent = 'Music playing...';
    });
  } else {
    music.pause();
    musicPlaying = false;
    control.classList.remove('playing');
    icon.textContent = '🎵';
    text.textContent = 'Tap to play music';
  }
}

// ===== TYPEWRITER LOVE TEXT =====
function startLoveTextAnimation() {
  const loveText = document.getElementById('loveText');
  const message = "I love you chutkuu..";
  let charIndex = 0;
  let isDeleting = false;
  let pauseCount = 0;

  if (loveTextInterval) clearInterval(loveTextInterval);

  loveTextInterval = setInterval(() => {
    if (!proposePageActive) {
      clearInterval(loveTextInterval);
      return;
    }

    if (!isDeleting) {
      // Typing
      charIndex++;
      loveText.textContent = message.substring(0, charIndex);

      if (charIndex === message.length) {
        // Pause at end, then burst hearts
        pauseCount++;
        if (pauseCount === 1) {
          createLoveHeartsBurst();
        }
        if (pauseCount > 20) { // ~2 seconds pause
          isDeleting = true;
          pauseCount = 0;
        }
      }
    } else {
      // Deleting
      charIndex--;
      loveText.textContent = message.substring(0, charIndex);

      if (charIndex === 0) {
        isDeleting = false;
        pauseCount = 0;
      }
    }
  }, 100);
}

// Hearts burst when text finishes typing
function createLoveHeartsBurst() {
  const container = document.getElementById('loveHeartsBurst');
  const hearts = ['💖', '💕', '❤️', '💗', '🥰', '✨'];

  for (let i = 0; i < 8; i++) {
    const h = document.createElement('span');
    h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    h.style.position = 'absolute';
    h.style.left = '50%';
    h.style.top = '50%';
    h.style.fontSize = (Math.random() * 14 + 10) + 'px';
    h.style.pointerEvents = 'none';
    h.style.transition = 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    h.style.opacity = '1';
    h.style.zIndex = '10';
    container.appendChild(h);

    requestAnimationFrame(() => {
      const angle = (Math.PI * 2 * i) / 8;
      const dist = Math.random() * 60 + 30;
      h.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist - 20}px)`;
      h.style.opacity = '0';
    });

    setTimeout(() => h.remove(), 1600);
  }
}

// ===== ROSE PETALS =====
function createRosePetals() {
  const container = document.getElementById('rosePetals');
  container.innerHTML = '';
  const petals = ['🌹', '🌸', '💮', '🪷', '🏵️'];

  for (let i = 0; i < 12; i++) {
    const petal = document.createElement('div');
    petal.className = 'rose-petal';
    petal.textContent = petals[Math.floor(Math.random() * petals.length)];
    petal.style.left = Math.random() * 100 + '%';
    petal.style.fontSize = (Math.random() * 14 + 12) + 'px';
    petal.style.animationDuration = (Math.random() * 6 + 6) + 's';
    petal.style.animationDelay = (Math.random() * 8) + 's';
    petal.style.opacity = Math.random() * 0.4 + 0.2;
    container.appendChild(petal);
  }
}

// ===== FLOATING HEARTS =====
function createFloatingHearts() {
  const container = document.getElementById('heartsContainer');
  const hearts = ['♥', '❤', '💕', '♡', '❣', '💗'];
  const heartCount = 15;

  for (let i = 0; i < heartCount; i++) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = (Math.random() * 18 + 10) + 'px';
    heart.style.animationDuration = (Math.random() * 8 + 8) + 's';
    heart.style.animationDelay = (Math.random() * 10) + 's';
    heart.style.opacity = Math.random() * 0.4 + 0.1;
    container.appendChild(heart);
  }
}

// ===== SPARKLES =====
function createSparkles() {
  const container = document.getElementById('sparklesContainer');
  const sparkleCount = 25;

  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = Math.random() * 100 + '%';
    sparkle.style.top = Math.random() * 100 + '%';
    sparkle.style.animationDelay = (Math.random() * 3) + 's';
    sparkle.style.animationDuration = (Math.random() * 2 + 2) + 's';

    const colors = [
      'rgba(255, 200, 220, 0.8)',
      'rgba(255, 150, 180, 0.6)',
      'rgba(255, 100, 150, 0.5)',
      'rgba(255, 255, 255, 0.4)'
    ];
    sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];
    container.appendChild(sparkle);
  }
}

// ===== CELEBRATION BURST (on correct answer) =====
function createCelebrationBurst() {
  const emojis = ['💖', '✨', '🎉', '💕', '🥰', '❤️', '💗', '⭐'];
  const container = document.body;

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    particle.style.position = 'fixed';
    particle.style.left = '50%';
    particle.style.top = '50%';
    particle.style.fontSize = (Math.random() * 20 + 14) + 'px';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';
    particle.style.transition = 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    particle.style.opacity = '1';
    container.appendChild(particle);

    requestAnimationFrame(() => {
      const angle = (Math.PI * 2 * i) / 20;
      const distance = Math.random() * 150 + 80;
      particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) rotate(${Math.random() * 360}deg)`;
      particle.style.opacity = '0';
    });

    setTimeout(() => particle.remove(), 1300);
  }
}
