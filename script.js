/**
 * PREMIUM ROMANTIC BIRTHDAY WEBSITE - INTERACTION SCRIPT
 * Manages load states, custom mouse tracking, background particle canvas, 
 * typewriter sequences, tilt elements, audio players (with synth fallback), 
 * timers, and canvas fireworks.
 */

// Custom Date Configuration (Year, Month Index (0-11), Day, Hour, Minute)
// October 24, 2024
const MILITARY_START_DATE = new Date(2024, 9, 24, 0, 0, 0);

// Global State
let isMusicPlaying = false;
let audioContext = null;
let synthTimer = null;
let cursor = { x: 0, y: 0, targetX: 0, targetY: 0 };
let typedBuffer = '';

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const loaderProgress = document.getElementById('loaderProgress');
const cursorGlow = document.getElementById('cursorGlow');
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const soundWaves = document.getElementById('soundWaves');
const typewriterElement = document.getElementById('typewriter');
const startBtn = document.getElementById('startBtn');
const letterContent = document.getElementById('letterContent');
const scrollProgressBar = document.getElementById('scrollProgress');

// Initialize Website
window.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
  initBackgroundParticles();
  initTypewriter();
  initScrollProgress();
  initIntersectionObserver();
  initPolaroidTilt();
  initLightbox();
  initFlippableCards();
  initFunInteractions();
  initMilestoneCounter();
  initFinalSurprise();
  initEasterEgg();
  initCursorGlow();
});

/* 1. LOADING SCREEN MANAGER */
function initLoadingScreen() {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.visibility = 'hidden';
        // Auto scroll to top on load to start fresh
        window.scrollTo(0, 0);
      }, 500);
    }
    loaderProgress.style.width = progress + '%';
  }, 150);
}

/* 2. CUSTOM CURSOR GLOW EFFECT */
function initCursorGlow() {
  document.addEventListener('mousemove', (e) => {
    cursor.targetX = e.clientX;
    cursor.targetY = e.clientY;
  });

  // Smooth cursor follow using lerp
  function updateCursor() {
    cursor.x += (cursor.targetX - cursor.x) * 0.1;
    cursor.y += (cursor.targetY - cursor.y) * 0.1;
    cursorGlow.style.left = cursor.x + 'px';
    cursorGlow.style.top = cursor.y + 'px';
    requestAnimationFrame(updateCursor);
  }
  updateCursor();
}

/* 3. CANVAS BACKGROUND PARTICLES */
function initBackgroundParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const heartPath2D = new Path2D('M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height; // Spread initially
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + 20;
      this.size = Math.random() * 8 + 4;
      this.speedY = Math.random() * 0.8 + 0.3;
      this.speedX = Math.random() * 0.4 - 0.2;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.swaySpeed = Math.random() * 0.02 + 0.005;
      this.swayAngle = Math.random() * Math.PI;
      this.isHeart = Math.random() > 0.6; // 40% hearts, 60% stars
    }

    update() {
      this.y -= this.speedY;
      this.swayAngle += this.swaySpeed;
      this.x += Math.sin(this.swayAngle) * 0.3 + this.speedX;

      if (this.y < -20 || this.x < -20 || this.x > canvas.width + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      if (this.isHeart) {
        ctx.fillStyle = '#ff7597';
        ctx.translate(this.x, this.y);
        ctx.scale(this.size / 24, this.size / 24); // Scale standard 24px SVG path
        ctx.fill(heartPath2D);
      } else {
        ctx.fillStyle = '#e5c158';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#e5c158';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Populate particles
  const particleCount = Math.min(60, Math.floor(window.innerWidth / 20));
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

/* 4. TYPEWRITER EFFECT */
function initTypewriter() {
  const phrases = [
    "best friend. 💖",
    "soulmate. ✨",
    "favorite person. 👑",
    "entire world. 🌎",
    "happy place. 🏡"
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 120;

  function type() {
    const currentPhrase = phrases[phraseIndex];
    if (isDeleting) {
      typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 60;
    } else {
      typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 150;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      isDeleting = true;
      typingSpeed = 2000; // Pause at full phrase
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typingSpeed = 500; // Pause before typing next
    }

    setTimeout(type, typingSpeed);
  }

  setTimeout(type, 1000);
}

/* 5. SCROLL PROGRESS INDICATOR */
function initScrollProgress() {
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    scrollProgressBar.style.width = progress + '%';
  });
}

/* 6. SCROLL REVEALS & PARAGRAPH DELAY */
function initIntersectionObserver() {
  const revealElements = document.querySelectorAll('.reveal');
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // Custom cascade for Love Letter paragraphs
        const letterParagraphs = entry.target.querySelectorAll ? entry.target.querySelectorAll('.reveal-paragraph') : [];
        if (letterParagraphs.length) {
          letterParagraphs.forEach((p, idx) => {
            setTimeout(() => {
              p.classList.add('visible');
            }, idx * 600); // 600ms stagger between lines
          });
        }
        
        observer.unobserve(entry.target); // Trigger once
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* 7. POLAROID TILT EFFECT */
function initPolaroidTilt() {
  const polaroids = document.querySelectorAll('.polaroid-card');
  
  polaroids.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate within client bounding box
      const y = e.clientY - rect.top;  // y coordinate within client bounding box
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation strength based on pointer offset from center
      const rotateX = ((centerY - y) / centerY) * 12; // Max 12deg vertical tilt
      const rotateY = ((x - centerX) / centerX) * 12; // Max 12deg horizontal tilt
      
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  });
}

/* 8. LIGHTBOX MODAL */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.querySelector('.lightbox-close');
  const polaroids = document.querySelectorAll('.polaroid-card');

  polaroids.forEach(card => {
    card.addEventListener('click', () => {
      const imgSrc = card.getAttribute('data-img-src');
      const caption = card.getAttribute('data-caption');
      
      lightboxImg.src = imgSrc;
      lightboxCaption.textContent = caption;
      lightbox.classList.add('active');
      
      // Play a subtle click note
      playClickSound(587.33); // D5 chime
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('active');
  }

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

/* 9. FLIPPABLE CARDS ON TOUCH/CLICK */
function initFlippableCards() {
  const flipCards = document.querySelectorAll('.flip-card');
  
  flipCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
      playClickSound(440); // A4 note on flip
    });
  });
}

/* 10. PLAYFUL FUN SECTION INTERACTIONS */
function initFunInteractions() {
  // Love Meter Calculator
  const loveBtn = document.getElementById('loveCalcBtn');
  const meterWrapper = document.getElementById('meterWrapper');
  const meterFill = document.getElementById('meterFill');
  const meterValue = document.getElementById('meterValue');
  const loveResultText = document.getElementById('loveResultText');
  
  const loveQuotes = [
    "More than there are stars in the sky. ✨",
    "More than pizza on a Friday night! 🍕",
    "To the moon and back, infinity times! 🚀",
    "More than a perfect night's sleep. 😴",
    "More than coffee on a busy Monday morning. ☕",
    "More than words could ever describe. 💝"
  ];

  loveBtn.addEventListener('click', () => {
    loveBtn.style.display = 'none';
    meterWrapper.style.display = 'flex';
    
    // Play warm synthesizer sound effect
    playSweepSynth();

    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      meterValue.textContent = count + '%';
      meterFill.style.width = count + '%';
      
      if (count >= 100) {
        clearInterval(interval);
        // Exceeded 100% romantic surprise
        setTimeout(() => {
          meterValue.textContent = 'INFINITE ❤️';
          meterValue.classList.add('text-glow');
          
          // Random cute quote
          const randomQuote = loveQuotes[Math.floor(Math.random() * loveQuotes.length)];
          loveResultText.textContent = randomQuote;
          
          // Confetti explosion
          triggerConfettiBurst();
        }, 300);
      }
    }, 25);
  });

  // Surprise Message Button
  const surpriseBtn = document.getElementById('surpriseBtn');
  const surpriseResultText = document.getElementById('surpriseResultText');
  
  const surpriseMessages = [
    "You make my heart skip a beat! 💓",
    "Have I told you recently how beautiful you are? 😍",
    "You are my absolute favorite blessing! 🎁",
    "I'm still falling for you every day! 🍂",
    "Thank you for being my rock. 💎",
    "My heart is, and always will be, yours. 🔒"
  ];

  surpriseBtn.addEventListener('click', () => {
    const randomMsg = surpriseMessages[Math.floor(Math.random() * surpriseMessages.length)];
    surpriseResultText.textContent = randomMsg;
    surpriseResultText.classList.add('text-glow');
    
    // Play bells
    playClickSound(659.25); // E5 note
    
    // Burst particles
    triggerConfettiBurst();
  });
}

/* 11. MILESTONE ANNIVERSARY COUNTER */
function initMilestoneCounter() {
  const daysBox = document.getElementById('daysBox');
  const hoursBox = document.getElementById('hoursBox');
  const minutesBox = document.getElementById('minutesBox');
  const secondsBox = document.getElementById('secondsBox');

  // Try to read the journey start date from the page text (e.g. "Since our journey began on June 9, 2026 11:45 AM")
  let startDate = MILITARY_START_DATE;
  const counterDateEl = document.querySelector('.counter-date');
  if (counterDateEl) {
    const text = counterDateEl.textContent || '';
    let dateStr = null;

    // Try common formats: "MonthName D, YYYY [HH:MM AM/PM]"
    let m = text.match(/([A-Za-z]+\s+\d{1,2},\s*\d{4}(?:\s+\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)?)/);
    if (m) dateStr = m[1];

    // Try "D MonthName YYYY [HH:MM AM/PM]"
    if (!dateStr) {
      m = text.match(/(\d{1,2}\s+[A-Za-z]+\s+\d{4}(?:\s+\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)?)/);
      if (m) dateStr = m[1];
    }

    // Fallback: everything after 'on' or 'began'
    if (!dateStr) {
      m = text.match(/on\s+(.+)$/i) || text.match(/began\s+(.+)$/i);
      if (m) dateStr = m[1];
    }

    if (dateStr) {
      // Clean up common words
      dateStr = dateStr.replace(/approx\.?/i, '').replace(/at\s+/i, '').trim();
      const parsed = new Date(dateStr);
      if (!isNaN(parsed)) {
        startDate = parsed;
      } else {
        const parsedTs = Date.parse(dateStr);
        if (!isNaN(parsedTs)) startDate = new Date(parsedTs);
      }
    }
  }

  function updateCounter() {
    const now = new Date();
    const diff = Math.max(0, now - startDate); // milliseconds

    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    const days = Math.floor(diff / day);
    const hours = Math.floor((diff % day) / hour);
    const minutes = Math.floor((diff % hour) / minute);
    const seconds = Math.floor((diff % minute) / second);

    daysBox.textContent = String(days).padStart(2, '0');
    hoursBox.textContent = String(hours).padStart(2, '0');
    minutesBox.textContent = String(minutes).padStart(2, '0');
    secondsBox.textContent = String(seconds).padStart(2, '0');
  }

  updateCounter();
  setInterval(updateCounter, 1000);
}

/* 12. FINAL SURPRISE & FIREWORKS CANVAS */
function initFinalSurprise() {
  const finalSection = document.getElementById('final-surprise');
  const openHeartBtn = document.getElementById('openHeartBtn');
  const finalMessageCard = document.getElementById('finalMessageCard');
  const restartBtn = document.getElementById('restartJourney');
  
  // Cinematic line timing reveals
  let cinematicTriggered = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !cinematicTriggered) {
        cinematicTriggered = true;
        revealCinematicText();
      }
    });
  }, { threshold: 0.4 });

  observer.observe(finalSection);

  function revealCinematicText() {
    const lines = finalSection.querySelectorAll('.cinema-line');
    lines.forEach(line => {
      const delay = parseInt(line.getAttribute('data-delay') || '0');
      setTimeout(() => {
        line.classList.add('visible');
      }, delay);
    });

    // Show final CTA open heart button after text finishes
    setTimeout(() => {
      openHeartBtn.style.display = 'inline-flex';
      setTimeout(() => {
        openHeartBtn.style.opacity = '1';
        openHeartBtn.classList.add('pulse');
      }, 50);
    }, 9500);
  }

  // Open Heart action
  openHeartBtn.addEventListener('click', () => {
    // Play fireworks sounds + increase volume
    if (isMusicPlaying) {
      bgMusic.volume = 1.0;
    } else {
      initAudioContext();
      startMusicEngine();
    }

    // Play high pitch harp chord
    playHarpSynth();

    // Hide cinematic elements
    document.getElementById('cinematicText').style.display = 'none';
    openHeartBtn.style.display = 'none';

    // Show final greeting card
    finalMessageCard.style.display = 'block';
    setTimeout(() => {
      finalMessageCard.classList.add('active');
    }, 100);

    // Run active fireworks canvas loops
    startFireworksEngine();
  });

  // Restart Button
  restartBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      // Reload page to reset all meters & play animations again
      window.location.reload();
    }, 800);
  });
}

// Confetti burst helper for fun actions
function triggerConfettiBurst() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  
  // Spawns instant falling colorful circles from top-middle
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const conf = {
        x: Math.random() * canvas.width,
        y: -10,
        r: Math.random() * 6 + 4,
        color: ['#ff7597', '#e5c158', '#b76e79', '#ff8fa3', '#fff'][Math.floor(Math.random() * 5)],
        speedY: Math.random() * 4 + 2,
        speedX: Math.random() * 4 - 2,
        decay: 0.98
      };
      
      function drawConfettiPiece() {
        if (conf.y > canvas.height) return;
        ctx.fillStyle = conf.color;
        ctx.beginPath();
        ctx.arc(conf.x, conf.y, conf.r, 0, Math.PI * 2);
        ctx.fill();
        conf.y += conf.speedY;
        conf.x += conf.speedX;
        conf.speedX *= conf.decay;
        requestAnimationFrame(drawConfettiPiece);
      }
      drawConfettiPiece();
    }, i * 20);
  }
}

// Fullscreen Fireworks Logic
let fireworksActive = false;
function startFireworksEngine() {
  fireworksActive = true;
  const canvas = document.getElementById('fireworksCanvas');
  const ctx = canvas.getContext('2d');
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let fireworks = [];
  let particles = [];

  class Firework {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height;
      this.tx = this.x + (Math.random() * 200 - 100);
      this.ty = Math.random() * (canvas.height * 0.5);
      this.speed = Math.random() * 3 + 4;
      this.angle = Math.atan2(this.ty - this.y, this.tx - this.x);
      this.opacity = 1;
    }

    update() {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      
      const distance = Math.hypot(this.tx - this.x, this.ty - this.y);
      if (distance < 10) {
        explode(this.tx, this.ty);
        return false;
      }
      return true;
    }

    draw() {
      ctx.save();
      ctx.strokeStyle = '#ff7597';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - Math.cos(this.angle) * 10, this.y - Math.sin(this.angle) * 10);
      ctx.stroke();
      ctx.restore();
    }
  }

  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.angle = Math.random() * Math.PI * 2;
      this.speed = Math.random() * 4 + 1;
      this.gravity = 0.08;
      this.opacity = 1;
      this.fade = Math.random() * 0.015 + 0.008;
    }

    update() {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed + this.gravity;
      this.speed *= 0.98;
      this.opacity -= this.fade;
      return this.opacity > 0;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function explode(x, y) {
    const colors = ['#ff7597', '#e5c158', '#ff8fa3', '#b76e79', '#ffffff', '#e0a96d'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    // Play synthetic boom sound
    playBoomSound();
    for (let i = 0; i < 40; i++) {
      particles.push(new Particle(x, y, color));
    }
  }

  function animate() {
    if (!fireworksActive) return;
    ctx.fillStyle = 'rgba(3, 2, 6, 0.2)'; // trail effect
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (Math.random() < 0.04 && fireworks.length < 5) {
      fireworks.push(new Firework());
    }

    fireworks = fireworks.filter(f => {
      const keep = f.update();
      if (keep) f.draw();
      return keep;
    });

    particles = particles.filter(p => {
      const keep = p.update();
      if (keep) p.draw();
      return keep;
    });

    requestAnimationFrame(animate);
  }
  animate();
}

/* 13. AUDIO ENGINE & WEB AUDIO API FALLBACK */
// Music toggle trigger
musicToggle.addEventListener('click', () => {
  initAudioContext();
  if (isMusicPlaying) {
    pauseMusicEngine();
  } else {
    startMusicEngine();
  }
});

function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

function startMusicEngine() {
  isMusicPlaying = true;
  soundWaves.classList.add('playing');
  musicToggle.querySelector('.music-label').textContent = "Pause Music";

  // Try playing DOM audio element
  bgMusic.volume = 0.45;
  const playPromise = bgMusic.play();

  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.warn("DOM Audio blocked or missing. Starting Web Audio API Synthesizer fallback chimes.");
      // Audio element blocked or missing file. Start synth loop!
      startSynthFallback();
    });
  }
}

function pauseMusicEngine() {
  isMusicPlaying = false;
  soundWaves.classList.remove('playing');
  musicToggle.querySelector('.music-label').textContent = "Play Music";

  bgMusic.pause();
  stopSynthFallback();
}

// Fallback Synth Loop (Plays slow, relaxing warm romantic chord progression)
function startSynthFallback() {
  if (synthTimer) return;
  
  // Chords: Cmaj7 -> Fmaj7 -> Am7 -> G6
  const chords = [
    [261.63, 329.63, 392.00, 493.88], // Cmaj7 (C4, E4, G4, B4)
    [349.23, 440.00, 261.63, 329.63], // Fmaj7 (F4, A4, C5, E5 / modified voicing)
    [220.00, 261.63, 329.63, 392.00], // Am7 (A3, C4, E4, G4)
    [196.00, 246.94, 293.66, 329.63]  // G6 (G3, B3, D4, E4)
  ];
  
  let step = 0;

  function playChordStep() {
    if (!isMusicPlaying) return;
    const notes = chords[step];
    const time = audioContext.currentTime;
    
    // Play notes of chord slightly arpeggiated
    notes.forEach((freq, idx) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.type = 'sine'; // Pure sweet bell sounds
      osc.frequency.setValueAtTime(freq, time + idx * 0.08); // Arpeggio delay
      
      // Envelope
      gain.gain.setValueAtTime(0, time + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.06, time + idx * 0.08 + 0.5); // Soft attack
      gain.gain.exponentialRampToValueAtTime(0.0001, time + idx * 0.08 + 4.5); // Slow decay
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.start(time + idx * 0.08);
      osc.stop(time + idx * 0.08 + 5.0);
    });

    step = (step + 1) % chords.length;
    // Call next chord in 5.2 seconds
    synthTimer = setTimeout(playChordStep, 5200);
  }

  playChordStep();
}

function stopSynthFallback() {
  if (synthTimer) {
    clearTimeout(synthTimer);
    synthTimer = null;
  }
}

// SFX: Light Bell note when clicking items
function playClickSound(freq = 440) {
  if (!audioContext) return;
  initAudioContext();
  
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, audioContext.currentTime);
  
  gain.gain.setValueAtTime(0.12, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
  
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  osc.start();
  osc.stop(audioContext.currentTime + 0.9);
}

// SFX: Heart Sweep for meters
function playSweepSynth() {
  if (!audioContext) return;
  initAudioContext();
  
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(261.63, audioContext.currentTime); // Start C4
  osc.frequency.exponentialRampToValueAtTime(523.25, audioContext.currentTime + 2.0); // Sweep up to C5
  
  gain.gain.setValueAtTime(0.08, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 1.8);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2.2);
  
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  osc.start();
  osc.stop(audioContext.currentTime + 2.3);
}

// SFX: Harp Sweep for opening heart
function playHarpSynth() {
  if (!audioContext) return;
  initAudioContext();
  
  const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25];
  const now = audioContext.currentTime;

  notes.forEach((freq, idx) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.05); // Rapid notes
    
    gain.gain.setValueAtTime(0.08, now + idx * 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 1.2);
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.start(now + idx * 0.05);
    osc.stop(now + idx * 0.05 + 1.3);
  });
}

// SFX: Deep fireworks boom sound effect
function playBoomSound() {
  if (!audioContext) return;
  
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.type = 'sine';
  // Rapid frequency fall mimicking a thunderous boom
  osc.frequency.setValueAtTime(120, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.4);
  
  gain.gain.setValueAtTime(0.3, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
  
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  osc.start();
  osc.stop(audioContext.currentTime + 0.9);
}

/* 14. EASTER EGG (L-O-V-E) */
function initEasterEgg() {
  const modal = document.getElementById('easterEggModal');
  const closeBtn = document.getElementById('easterCloseBtn');
  
  document.addEventListener('keydown', (e) => {
    // Record keys typed
    typedBuffer += e.key.toLowerCase();
    
    // Cap length to avoid infinite memory growth
    if (typedBuffer.length > 20) {
      typedBuffer = typedBuffer.substring(typedBuffer.length - 10);
    }
    
    // Check key patterns
    if (typedBuffer.endsWith('love')) {
      typedBuffer = ''; // Clear
      modal.classList.add('active');
      playHarpSynth();
    }
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
}
