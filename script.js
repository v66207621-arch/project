/**
 * PREMIUM ROMANTIC BIRTHDAY WEBSITE - INTERACTION SCRIPT
 * Manages load states, custom mouse tracking, background particle canvas, 
 * typewriter sequences, tilt elements, audio players (with synth fallback), 
 * timers, and canvas fireworks.
 */

// Custom Date Configuration — reads from MEMORIES_CONFIG if available
const MILITARY_START_DATE = (typeof MEMORIES_CONFIG !== 'undefined' && MEMORIES_CONFIG.startDate)
  ? new Date(MEMORIES_CONFIG.startDate)
  : null; // TBD — relationship start date not yet provided

// Global State
let isMusicPlaying = false;
let audioContext = null;
let synthTimer = null;
let cursor = { x: 0, y: 0, targetX: 0, targetY: 0 };

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
  initMemoryBoard();
  initIntersectionObserver();
  initMilestoneCounter();
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

/* 7. OUR STORY & EDITORIAL MEMORY TIMELINE ENGINE */
function initMemoryBoard() {
  if (typeof MEMORIES === 'undefined' || typeof MEMORIES_CONFIG === 'undefined') return;

  const basePath = MEMORIES_CONFIG.mediaBasePath || 'memories/';
  const filtersContainer = document.getElementById('timelineFilters');
  const storyTimelineItems = document.getElementById('storyTimelineItems');
  const undatedStoryItems = document.getElementById('undatedStoryItems');
  const undatedSection = document.getElementById('undatedStorySection');

  function initTimelineVideoLifecycle() {
    const videos = document.querySelectorAll('#timeline video');
    if (!videos.length || !('IntersectionObserver' in window)) return;

    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) entry.target.pause();
      });
    }, { threshold: 0.1 });

    videos.forEach(video => videoObserver.observe(video));
  }

  // Lightbox elements
  const lightboxOverlay = document.getElementById('memoryLightbox');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxImg = document.getElementById('lightboxMediaImg');
  const lightboxVideo = document.getElementById('lightboxMediaVideo');
  const lightboxTitle = document.getElementById('lightboxMemoryTitle');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxCloseBtn = document.getElementById('lightboxClose');
  const lightboxPrevBtn = document.getElementById('lightboxPrev');
  const lightboxNextBtn = document.getElementById('lightboxNext');

  function pauseTimelineVideos() {
    document.querySelectorAll('#timeline video').forEach(video => video.pause());
  }

  // Lightbox state
  let currentMemory = null;
  let currentMediaIndex = 0;
  let activeFilter = 'All';

  // ---------- HELPER: Build media path ----------
  function mediaPath(memory, mediaItem) {
    return basePath + encodeURIComponent(memory.folder) + '/' + encodeURIComponent(mediaItem.filename);
  }

  // ---------- CATEGORY FILTERS ----------
  function buildFilters() {
    if (!filtersContainer) return;
    filtersContainer.innerHTML = '';

    const categories = new Set();
    MEMORIES.forEach(m => { if (m.category) categories.add(m.category); });

    // "All" button
    const allBtn = document.createElement('button');
    allBtn.className = 'timeline-filter-btn active';
    allBtn.textContent = 'All Milestones';
    allBtn.addEventListener('click', () => setFilter('All'));
    filtersContainer.appendChild(allBtn);

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'timeline-filter-btn';
      btn.textContent = cat;
      btn.addEventListener('click', () => setFilter(cat));
      filtersContainer.appendChild(btn);
    });
  }

  function setFilter(category) {
    activeFilter = category;

    // Update active pill button
    filtersContainer.querySelectorAll('.timeline-filter-btn').forEach(btn => {
      const isMatch = (category === 'All' && btn.textContent === 'All Milestones') || btn.textContent === category;
      btn.classList.toggle('active', isMatch);
    });

    // Filter timeline milestones
    document.querySelectorAll('.story-milestone').forEach(el => {
      const memCat = el.dataset.category;
      if (category === 'All' || memCat === category) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });

    // Filter undated cards
    let visibleUndated = 0;
    document.querySelectorAll('.undated-story-card').forEach(el => {
      const memCat = el.dataset.category;
      if (category === 'All' || memCat === category) {
        el.style.display = '';
        visibleUndated++;
      } else {
        el.style.display = 'none';
      }
    });

    if (undatedSection) {
      undatedSection.style.display = visibleUndated > 0 ? '' : 'none';
    }
  }

  // ---------- CREATIVE MEDIA ITEM COMPONENT ----------
  function createMediaElement(memory, mediaItem, index, count) {
    const itemEl = document.createElement('div');
    itemEl.className = 'story-media-item';
    itemEl.setAttribute('role', 'button');
    itemEl.setAttribute('tabindex', '0');
    itemEl.setAttribute('aria-label', `${memory.title} - Item ${index + 1}`);

    const frame = document.createElement('div');
    frame.className = 'story-media-frame';

    const src = mediaPath(memory, mediaItem);

    if (mediaItem.type === 'video') {
      const video = document.createElement('video');
      video.src = src;
      video.muted = true;
      video.preload = 'metadata';
      video.playsInline = true;
      video.addEventListener('play', () => {
        document.querySelectorAll('#timeline video').forEach(otherVideo => {
          if (otherVideo !== video) otherVideo.pause();
        });
        if (lightboxVideo) lightboxVideo.pause();
      });
      frame.appendChild(video);

      const playPill = document.createElement('div');
      playPill.className = 'media-play-pill';
      playPill.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
      frame.appendChild(playPill);
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.alt = memory.title;
      img.loading = 'lazy';
      frame.appendChild(img);
    }

    itemEl.appendChild(frame);

    // If memory has multiple photos, show a little badge on the primary
    if (index === 0 && count > 1) {
      const badge = document.createElement('span');
      badge.className = 'media-counter-tag';
      badge.textContent = `${count} photos`;
      itemEl.appendChild(badge);
    }

    // Click opens physical photograph lightbox
    itemEl.addEventListener('click', () => openLightbox(memory, index));
    itemEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(memory, index);
      }
    });

    return itemEl;
  }

  // ---------- ASPECT-RATIO-AWARE EDITORIAL COMPOSITIONS ----------
  function getMediaProfile(media) {
    const items = media.map((item, index) => {
      const ratio = Number(item.ratio) || (item.width && item.height ? item.width / item.height : 1);
      const sourceArea = Number(item.width) && Number(item.height)
        ? Number(item.width) * Number(item.height)
        : 0;
      let shape = 'square';
      if (ratio >= 1.8) shape = 'very-wide';
      else if (ratio >= 1.1) shape = 'landscape';
      else if (ratio <= 0.6) shape = 'very-tall';
      else if (ratio < 0.9) shape = 'portrait';
      const family = ratio < 0.9 ? 'portrait' : ratio > 1.1 ? 'landscape' : 'square';
      return { item, index, ratio, shape, family, sourceArea };
    });

    const sourceAreaTotal = items.reduce((total, entry) => total + entry.sourceArea, 0);
    const familyCounts = items.reduce((counts, entry) => {
      counts[entry.family] = (counts[entry.family] || 0) + 1;
      return counts;
    }, {});
    const dominantFamily = Object.entries(familyCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'square';

    items.forEach(entry => {
      entry.relativeArea = sourceAreaTotal
        ? entry.sourceArea / sourceAreaTotal
        : 1 / Math.max(items.length, 1);
    });

    return {
      items,
      count: items.length,
      landscapes: items.filter(entry => entry.shape === 'landscape' || entry.shape === 'very-wide').length,
      portraits: items.filter(entry => entry.shape === 'portrait' || entry.shape === 'very-tall').length,
      veryWide: items.filter(entry => entry.shape === 'very-wide').length,
      veryTall: items.filter(entry => entry.shape === 'very-tall').length,
      dominantFamily,
      familyCounts
    };
  }

  function chooseMediaPattern(profile) {
    const { count, landscapes, portraits, veryWide, veryTall } = profile;
    if (count <= 1) return 'single';
    if (count >= 8) return 'scattered';
    if (count === 3) return 'trio';

    const mixedOrientations = landscapes > 0 && portraits > 0;
    const candidates = [
      {
        name: 'pair',
        score: count === 2 ? 12 : 0
      },
      {
        name: 'pair-mixed',
        score: count === 2 && mixedOrientations ? 15 : 0
      },
      {
        name: 'landscape-focus',
        score: mixedOrientations
          ? (veryWide * 5) + (landscapes * 2) + 2 - (veryTall * 2) +
            (count >= 4 && count <= 7 ? 3 : 0)
          : 0
      },
      {
        name: 'portrait-focus',
        score: mixedOrientations
          ? (veryTall * 5) + (portraits * 2) + 2 - (veryWide * 2) +
            (count >= 4 && count <= 7 ? 3 : 0)
          : 0
      },
      {
        name: 'row-stack',
        score: (count >= 4 ? 4 : 0) + (landscapes === count ? 5 : 0) +
          (count >= 6 ? 2 : 0)
      },
      {
        name: 'balanced',
        score: (mixedOrientations ? 8 : 5) + (count >= 4 && count <= 7 ? 5 : 0) +
          (count >= 4 && profile.dominantFamily === 'portrait' ? 3 : 0)
      },
    ];

    return candidates.reduce((best, candidate) =>
      candidate.score > best.score ? candidate : best
    ).name;
  }

  function appendMediaItems(container, memory, profile, indexes, count) {
    indexes.forEach(index => {
      const itemEl = createMediaElement(memory, profile.items[index].item, index, count);
      itemEl.dataset.mediaShape = profile.items[index].shape;
      container.appendChild(itemEl);
    });
  }

  function getFinalRowIndexes(profile) {
    if (profile.count < 8) return [];
    const outliers = profile.items.filter(entry => entry.family !== profile.dominantFamily);
    return outliers.length > 0 && outliers.length < profile.count ? outliers.map(entry => entry.index) : [];
  }

  function buildMediaComposition(memory) {
    const media = memory.media || [];
    const profile = getMediaProfile(media);
    const count = profile.count;
    const pattern = chooseMediaPattern(profile);
    const container = document.createElement('div');
    const patternClass = pattern === 'pair-mixed'
      ? 'layout-pattern-pair layout-pattern-pair-mixed'
      : `layout-pattern-${pattern}`;
    container.className = `story-media-composition ${patternClass}`;
    container.dataset.memoryFolder = memory.folder || '';

    if (pattern === 'single') {
      appendMediaItems(container, memory, profile, [0], count);
      return container;
    }

    if (pattern === 'pair' || pattern === 'pair-mixed') {
      appendMediaItems(container, memory, profile, profile.items.map(entry => entry.index), count);
      return container;
    }

    if (pattern === 'trio') {
      appendMediaItems(container, memory, profile, profile.items.map(entry => entry.index), count);
      return container;
    }

    const sortedByRatio = [...profile.items].sort((a, b) => b.ratio - a.ratio);
    const widestIndex = sortedByRatio[0].index;
    const tallestIndex = sortedByRatio[sortedByRatio.length - 1].index;

    if (pattern === 'landscape-focus' || pattern === 'portrait-focus') {
      const focusIndex = pattern === 'landscape-focus' ? widestIndex : tallestIndex;
      const focus = document.createElement('div');
      focus.className = 'pattern-focus-media';
      appendMediaItems(focus, memory, profile, [focusIndex], count);
      container.appendChild(focus);

      const support = document.createElement('div');
      support.className = 'pattern-support-media';
      appendMediaItems(
        support,
        memory,
        profile,
        profile.items.filter(entry => entry.index !== focusIndex).map(entry => entry.index),
        count
      );
      container.appendChild(support);
      return container;
    }

    if (pattern === 'row-stack') {
      const primaryRow = document.createElement('div');
      primaryRow.className = 'pattern-primary-row';
      const primaryCount = Math.min(3, Math.ceil(count / 2));
      appendMediaItems(primaryRow, memory, profile, profile.items.slice(0, primaryCount).map(entry => entry.index), count);
      container.appendChild(primaryRow);

      const supportRow = document.createElement('div');
      const supportCount = count - primaryCount;
      supportRow.className = `pattern-support-row${supportCount >= 4 ? ' pattern-support-row-wide' : ''}`;
      appendMediaItems(supportRow, memory, profile, profile.items.slice(primaryCount).map(entry => entry.index), count);
      container.appendChild(supportRow);
      return container;
    }

    if (pattern === 'scattered') {
      const finalRowIndexes = getFinalRowIndexes(profile);
      const mainIndexes = profile.items
        .map(entry => entry.index)
        .filter(index => !finalRowIndexes.includes(index));
      const mainGrid = document.createElement('div');
      mainGrid.className = 'pattern-main-grid';
      appendMediaItems(mainGrid, memory, profile, mainIndexes, count);
      container.appendChild(mainGrid);

      if (finalRowIndexes.length > 0) {
        const finalRow = document.createElement('div');
        finalRow.className = 'pattern-final-row';
        appendMediaItems(finalRow, memory, profile, finalRowIndexes, count);
        container.appendChild(finalRow);
      }
      return container;
    }

    appendMediaItems(container, memory, profile, profile.items.map(entry => entry.index), count);
    return container;
  }

  function updateCompositionAfterVideoMetadata(container, memory) {
    if (
      container.dataset.videoProfilePending === 'true' ||
      container.dataset.videoProfileResolved === 'true'
    ) return;
    const videos = [...container.querySelectorAll('video')];
    if (videos.length === 0) return;

    const update = () => {
      const videoDimensions = videos.map(video => ({
        video,
        width: video.videoWidth,
        height: video.videoHeight
      }));
      if (videoDimensions.some(dimensions => !dimensions.width || !dimensions.height)) return;

      const mediaWithVideoRatios = (memory.media || []).map(item => {
        const dimensions = videoDimensions.find(entry =>
          decodeURIComponent(new URL(entry.video.currentSrc).pathname)
            .endsWith(`/${memory.folder}/${item.filename}`)
        );
        if (!dimensions) return item;
        return {
          ...item,
          width: dimensions.width,
          height: dimensions.height,
          ratio: dimensions.width / dimensions.height
        };
      });

      const replacement = buildMediaComposition({
        ...memory,
        media: mediaWithVideoRatios
      });
      replacement.dataset.videoProfileResolved = 'true';
      container.replaceWith(replacement);
    };

    container.dataset.videoProfilePending = 'true';
    videos.forEach(video => {
      if (video.readyState < 1) {
        video.addEventListener('loadedmetadata', update, { once: true });
      }
    });
    if (videos.every(video => video.readyState >= 1)) update();
  }

  // ---------- RENDER DATED STORY MILESTONES ----------
  function renderStoryTimeline() {
    if (!storyTimelineItems) return;
    storyTimelineItems.innerHTML = '';

    const datedMemories = MEMORIES
      .filter(m => m.date !== null)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    datedMemories.forEach((memory, idx) => {
      const milestone = document.createElement('div');
      milestone.className = 'story-milestone reveal';
      milestone.dataset.id = memory.id;
      milestone.dataset.category = memory.category || '';

      // Center timeline node
      const node = document.createElement('div');
      node.className = 'story-node';
      milestone.appendChild(node);

      // Milestone content block
      const content = document.createElement('div');
      content.className = 'story-milestone-content';

      // Header: Date + Title
      const header = document.createElement('div');
      header.className = 'story-meta-header';

      if (memory.displayDate) {
        const dateTag = document.createElement('div');
        dateTag.className = 'story-date-tag';
        dateTag.textContent = memory.displayDate;
        header.appendChild(dateTag);
      }

      const title = document.createElement('h3');
      title.className = 'story-milestone-title';
      title.textContent = memory.title;
      header.appendChild(title);

      // Locked description
      if (memory.description) {
        const desc = document.createElement('p');
        desc.className = 'story-description-text';
        desc.textContent = memory.description;
        header.appendChild(desc);
      }

      // Locked caption
      if (memory.caption) {
        const quote = document.createElement('div');
        quote.className = 'story-caption-quote';
        quote.textContent = memory.caption;
        header.appendChild(quote);
      }

      content.appendChild(header);

      // Integrated Media Composition
      const mediaComp = buildMediaComposition(memory);
      content.appendChild(mediaComp);
      updateCompositionAfterVideoMetadata(mediaComp, memory);

      milestone.appendChild(content);
      storyTimelineItems.appendChild(milestone);
    });
  }

  // ---------- RENDER UNDATED / EVERYDAY MOMENTS ----------
  function renderUndatedStory() {
    if (!undatedStoryItems) return;
    undatedStoryItems.innerHTML = '';

    const undatedMemories = MEMORIES.filter(m => m.date === null);
    if (undatedMemories.length === 0) {
      if (undatedSection) undatedSection.style.display = 'none';
      return;
    }

    undatedMemories.forEach(memory => {
      const card = document.createElement('div');
      card.className = 'undated-story-card reveal';
      card.dataset.id = memory.id;
      card.dataset.category = memory.category || '';

      const header = document.createElement('div');
      header.className = 'undated-card-header';

      const title = document.createElement('h3');
      title.className = 'undated-card-title';
      title.textContent = memory.title;
      header.appendChild(title);

      if (memory.description) {
        const desc = document.createElement('p');
        desc.className = 'undated-card-desc';
        desc.textContent = memory.description;
        header.appendChild(desc);
      }

      if (memory.caption) {
        const quote = document.createElement('div');
        quote.className = 'story-caption-quote';
        quote.textContent = memory.caption;
        header.appendChild(quote);
      }

      card.appendChild(header);

      // Media composition
      const mediaComp = buildMediaComposition(memory);
      card.appendChild(mediaComp);
      updateCompositionAfterVideoMetadata(mediaComp, memory);

      undatedStoryItems.appendChild(card);
    });
  }

  // ---------- REFINED EDITORIAL LIGHTBOX CONTROLLER ----------
  function openLightbox(memory, mediaIndex) {
    pauseTimelineVideos();
    currentMemory = memory;
    currentMediaIndex = mediaIndex;
    showLightboxMedia();

    lightboxOverlay.classList.add('active');
    lightboxOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Play subtle bell chime
    if (typeof playClickSound === 'function') {
      playClickSound(587.33);
    }
  }

  function closeLightbox() {
    lightboxOverlay.classList.remove('active');
    lightboxOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (lightboxVideo) {
      lightboxVideo.pause();
      lightboxVideo.removeAttribute('src');
      lightboxVideo.style.display = 'none';
    }
    if (lightboxImg) {
      lightboxImg.style.display = 'none';
    }
  }

  function showLightboxMedia() {
    if (!currentMemory) return;
    const mediaItem = currentMemory.media[currentMediaIndex];
    const src = mediaPath(currentMemory, mediaItem);

    lightboxTitle.textContent = currentMemory.title;
    lightboxCounter.textContent = `${currentMediaIndex + 1} of ${currentMemory.media.length}`;
    lightboxCaption.textContent = currentMemory.caption || '';

    if (mediaItem.type === 'video') {
      lightboxImg.style.display = 'none';
      lightboxVideo.preload = 'metadata';
      if (lightboxVideo.src !== new URL(src, document.baseURI).href) {
        lightboxVideo.pause();
        lightboxVideo.src = src;
        lightboxVideo.load();
      }
      lightboxVideo.style.display = 'block';
    } else {
      if (lightboxVideo) {
        lightboxVideo.pause();
        lightboxVideo.style.display = 'none';
      }
      lightboxImg.src = src;
      lightboxImg.alt = `${currentMemory.title} - ${currentMediaIndex + 1}`;
      lightboxImg.style.display = 'block';
    }

    // Toggle arrow navigation visibility
    const hasMultiple = currentMemory.media.length > 1;
    lightboxPrevBtn.style.display = hasMultiple ? 'flex' : 'none';
    lightboxNextBtn.style.display = hasMultiple ? 'flex' : 'none';

    lightboxPrevBtn.style.visibility = currentMediaIndex > 0 ? 'visible' : 'hidden';
    lightboxNextBtn.style.visibility = currentMediaIndex < currentMemory.media.length - 1 ? 'visible' : 'hidden';
  }

  function lightboxPrev() {
    if (currentMediaIndex > 0) {
      currentMediaIndex--;
      showLightboxMedia();
    }
  }

  function lightboxNext() {
    if (currentMemory && currentMediaIndex < currentMemory.media.length - 1) {
      currentMediaIndex++;
      showLightboxMedia();
    }
  }

  // Lightbox event listeners
  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
  if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', lightboxPrev);
  if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', lightboxNext);
  if (lightboxVideo) {
    lightboxVideo.addEventListener('play', pauseTimelineVideos);
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightboxOverlay.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev();
    if (e.key === 'ArrowRight') lightboxNext();
  });

  // ---------- INITIALIZATION ----------
  buildFilters();
  renderStoryTimeline();
  renderUndatedStory();
  initTimelineVideoLifecycle();
}

/* 8. LEGACY PLACEHOLDERS (safely no-op) */
function initLightbox() {}
function initPolaroidTilt() {}

/* 9. MILESTONE ANNIVERSARY COUNTER */
function initMilestoneCounter() {
  const daysBox = document.getElementById('daysBox');
  const hoursBox = document.getElementById('hoursBox');
  const minutesBox = document.getElementById('minutesBox');
  const secondsBox = document.getElementById('secondsBox');
  const counterDateLabel = document.getElementById('counterDateLabel');

  // Use MEMORIES_CONFIG.startDate if available
  let startDate = MILITARY_START_DATE;

  if (!startDate) {
    // Start date is TBD
    daysBox.textContent = '—';
    hoursBox.textContent = '—';
    minutesBox.textContent = '—';
    secondsBox.textContent = '—';
    if (counterDateLabel) {
      counterDateLabel.textContent = 'Start date to be set ❤️';
    }
    return;
  }

  if (counterDateLabel) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    counterDateLabel.textContent = 'Since our journey began on ' + startDate.toLocaleDateString('en-IN', options) + ' ❤️';
  }

  function updateCounter() {
    const now = new Date();
    const diff = Math.max(0, now - startDate);

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

/* 10. AUDIO ENGINE & WEB AUDIO API FALLBACK */
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
