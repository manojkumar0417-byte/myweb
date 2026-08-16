/* ==========================================================================
   MAIN SURPRISE APPLICATION CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Core Engines
  const particleEngine = new ParticleEngine();
  const confettiEngine = new ConfettiEngine();
  const audioController = new AudioController();

  // Application State
  let surpriseData = null;

  // DOM Elements
  const landingScreen = document.getElementById('landing-screen');
  const openSurpriseBtn = document.getElementById('open-surprise-btn');
  const countdownOverlay = document.getElementById('countdown-overlay');
  const typingStatusText = document.getElementById('typing-status-text');
  const countdownNumber = document.getElementById('countdown-number');
  const mainSurpriseContainer = document.getElementById('main-surprise');

  // Modals & Triggers
  const customizerModal = document.getElementById('customizer-modal');
  const customizeTriggerBtn = document.getElementById('customize-trigger-btn');
  const customizerCloseBtn = document.getElementById('customizer-close-btn');
  const customizerForm = document.getElementById('customizer-form');
  const resetDefaultsBtn = document.getElementById('reset-defaults-btn');

  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');

  const loveNoteModal = document.getElementById('love-note-modal');
  const openLoveNoteBtn = document.getElementById('open-love-note-btn');
  const loveNoteCloseBtn = document.getElementById('love-note-close-btn');

  const replaySurpriseBtn = document.getElementById('replay-surprise-btn');
  const toastNotification = document.getElementById('toast-notification');
  const toastMessage = document.getElementById('toast-message');

  // Load Surprise Payload
  async function loadAndRender() {
    surpriseData = await ApiService.fetchSurpriseData();
    renderContent(surpriseData);
  }

  // Render Data into UI
  function renderContent(data) {
    if (!data) return;

    // Audio setup
    if (data.audio && data.audio.customUrl) {
      audioController.setCustomUrl(data.audio.customUrl);
    }
    if (data.audio && data.audio.title) {
      const audioTitleEl = document.getElementById('audio-title');
      if (audioTitleEl) audioTitleEl.textContent = data.audio.title;
    }

    // Replace Name placeholders
    const name = data.recipientName || '[NAME]';

    // Landing Screen elements
    const landingTitleEl = document.getElementById('landing-title-text');
    if (landingTitleEl && data.landingTitle) {
      landingTitleEl.textContent = data.landingTitle.replace(/\[NAME\]/g, name);
    }
    const landingBtnEl = document.getElementById('landing-btn-text');
    if (landingBtnEl && data.landingButtonText) {
      landingBtnEl.textContent = data.landingButtonText.replace(/\[NAME\]/g, name);
    }
    
    // Header & Greeting
    const mainGreeting = document.getElementById('display-main-greeting');
    if (mainGreeting) mainGreeting.textContent = data.mainGreeting ? data.mainGreeting.replace(/\[NAME\]/g, name) : `Happy Birthday, ${name} 🎂❤️`;

    const recipientElements = document.querySelectorAll('.recipient-inline, #letter-recipient-name, #footer-recipient-name');
    recipientElements.forEach(el => { el.textContent = name; });

    // Emotional Message
    const emotionalMsgEl = document.getElementById('display-emotional-message');
    if (emotionalMsgEl && data.emotionalMessage) {
      emotionalMsgEl.textContent = data.emotionalMessage.replace(/\[NAME\]/g, name);
    }

    // Cake Wish & Final Section
    const cakeWishEl = document.getElementById('display-cake-wish');
    if (cakeWishEl && data.cakeWishText) cakeWishEl.textContent = data.cakeWishText;

    const finalTitleEl = document.getElementById('display-final-title');
    if (finalTitleEl && data.finalSectionTitle) finalTitleEl.textContent = data.finalSectionTitle.replace(/\[NAME\]/g, name);

    const finalMsgEl = document.getElementById('display-final-message');
    if (finalMsgEl && data.finalSectionMessage) finalMsgEl.textContent = data.finalSectionMessage.replace(/\[NAME\]/g, name);

    // Gallery Polaroids
    renderGallery(data.gallery);

    // Timeline Tree
    renderTimeline(data.memories);

    // Pre-fill Customizer Form
    prefillCustomizerForm(data);
  }

  // Render Polaroid Gallery Cards
  function renderGallery(items) {
    const grid = document.getElementById('polaroid-grid');
    const dotsContainer = document.getElementById('gallery-dots');
    const prevBtn = document.getElementById('gallery-scroll-left');
    const nextBtn = document.getElementById('gallery-scroll-right');

    if (!grid || !items) return;
    grid.innerHTML = '';
    if (dotsContainer) dotsContainer.innerHTML = '';

    const rotations = [-3, 2, -2, 4, -4, 3];

    items.forEach((item, index) => {
      const rot = rotations[index % rotations.length];
      const card = document.createElement('div');
      card.className = 'polaroid-card fade-in-up';
      card.style.setProperty('--rotation', `${rot}deg`);

      card.innerHTML = `
        <div class="polaroid-img-wrapper">
          <img src="${item.imageUrl}" alt="${item.title}" loading="lazy">
        </div>
        <div class="polaroid-caption-box">
          <h3 class="polaroid-title">${item.title}</h3>
          <p class="polaroid-subcaption">${item.caption}</p>
        </div>
      `;

      card.addEventListener('click', () => {
        openLightbox(item);
      });

      grid.appendChild(card);

      // Create Dot Indicator
      if (dotsContainer) {
        const dot = document.createElement('span');
        dot.className = `gallery-dot ${index === 0 ? 'active' : ''}`;
        dot.setAttribute('title', `Photo ${index + 1}`);
        dot.addEventListener('click', () => {
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
        dotsContainer.appendChild(dot);
      }
    });

    // Scroll buttons logic
    if (prevBtn) {
      prevBtn.onclick = () => {
        grid.scrollBy({ left: -300, behavior: 'smooth' });
      };
    }
    if (nextBtn) {
      nextBtn.onclick = () => {
        grid.scrollBy({ left: 300, behavior: 'smooth' });
      };
    }

    // Active dot update on scroll
    if (dotsContainer && grid) {
      grid.addEventListener('scroll', () => {
        const dots = dotsContainer.querySelectorAll('.gallery-dot');
        const scrollLeft = grid.scrollLeft;
        const cardWidth = grid.querySelector('.polaroid-card')?.offsetWidth || 280;
        const activeIndex = Math.min(
          dots.length - 1,
          Math.max(0, Math.round(scrollLeft / (cardWidth + 28)))
        );

        dots.forEach((d, idx) => {
          if (idx === activeIndex) {
            d.classList.add('active');
          } else {
            d.classList.remove('active');
          }
        });
      });
    }
  }

  // Render Timeline Tree Items
  function renderTimeline(memories) {
    const tree = document.getElementById('timeline-tree');
    if (!tree || !memories) return;
    tree.innerHTML = '';

    memories.forEach((mem, index) => {
      const isLeft = index % 2 === 0;
      const item = document.createElement('div');
      item.className = `timeline-item ${isLeft ? 'left' : 'right'} fade-in-up`;

      item.innerHTML = `
        <div class="timeline-icon">
          <i class="fa-solid fa-heart"></i>
        </div>
        <div class="timeline-card glass-card">
          <span class="timeline-date-badge">${mem.date}</span>
          <h3>${mem.title}</h3>
          ${mem.imageUrl ? `<img src="${mem.imageUrl}" alt="${mem.title}" class="timeline-img">` : ''}
          <p>${mem.description}</p>
        </div>
      `;

      tree.appendChild(item);
    });
  }

  // Open Surprise Transition Flow
  if (openSurpriseBtn) {
    openSurpriseBtn.addEventListener('click', () => {
      // Start audio playback
      audioController.startAudio();

      // Fade out landing card, show countdown overlay
      landingScreen.classList.add('hidden');
      countdownOverlay.classList.remove('hidden');

      runCountdownSequence();
    });
  }

  // Countdown & Typing Sequence
  function runCountdownSequence() {
    const msgs = (surpriseData && surpriseData.countdownMessages) || [
      "Preparing something special...",
      "Counting down to magic...",
      "Get ready for a heartwarming journey..."
    ];

    let count = 3;
    let msgIndex = 0;

    typingStatusText.textContent = msgs[0];
    countdownNumber.textContent = count;

    const timer = setInterval(() => {
      count--;
      msgIndex++;
      if (msgs[msgIndex]) {
        typingStatusText.textContent = msgs[msgIndex];
      }

      if (count > 0) {
        countdownNumber.textContent = count;
      } else {
        clearInterval(timer);
        
        // Burst Confetti & Balloons!
        confettiEngine.burst(160);
        particleEngine.spawnBalloons(15);

        // Hide overlay & reveal main surprise
        countdownOverlay.classList.add('hidden');
        mainSurpriseContainer.classList.remove('hidden');
        mainSurpriseContainer.classList.add('fade-in-up');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 1200);
  }

  // Cake Candle Blowing Interactive Logic
  const candles = document.querySelectorAll('.candle');
  const wishBox = document.getElementById('wish-reveal-box');
  const cakeInstruction = document.getElementById('cake-instruction-text');
  let extinguishedCount = 0;

  candles.forEach(candle => {
    candle.addEventListener('click', () => {
      const flame = candle.querySelector('.flame');
      if (flame && !flame.classList.contains('extinguished')) {
        flame.classList.add('extinguished');
        extinguishedCount++;

        // Confetti burst per candle
        confettiEngine.burst(30);

        if (extinguishedCount === candles.length) {
          if (wishBox) wishBox.classList.remove('hidden');
          if (cakeInstruction) cakeInstruction.textContent = "✨ All candles blown! Your wish is on its way! ✨";
          confettiEngine.burst(150);
          particleEngine.spawnBalloons(10);
        }
      }
    });
  });

  // Replay Surprise Handler
  if (replaySurpriseBtn) {
    replaySurpriseBtn.addEventListener('click', () => {
      // Relight candles
      candles.forEach(candle => {
        const flame = candle.querySelector('.flame');
        if (flame) flame.classList.remove('extinguished');
      });
      extinguishedCount = 0;
      if (wishBox) wishBox.classList.add('hidden');
      if (cakeInstruction) cakeInstruction.textContent = "Click or tap the candles to blow them out and make a wish!";

      // Show landing screen again
      mainSurpriseContainer.classList.add('hidden');
      landingScreen.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Lightbox Modal Handlers
  function openLightbox(item) {
    document.getElementById('lightbox-img').src = item.imageUrl;
    document.getElementById('lightbox-title').textContent = item.title;
    document.getElementById('lightbox-date').textContent = item.date || '';
    document.getElementById('lightbox-caption').textContent = item.caption || '';
    lightboxModal.classList.remove('hidden');
  }

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', () => lightboxModal.classList.add('hidden'));
  }
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) lightboxModal.classList.add('hidden');
    });
  }

  // Secret Love Note Modal Handlers
  if (openLoveNoteBtn) {
    openLoveNoteBtn.addEventListener('click', () => loveNoteModal.classList.remove('hidden'));
  }
  if (loveNoteCloseBtn) {
    loveNoteCloseBtn.addEventListener('click', () => loveNoteModal.classList.add('hidden'));
  }
  if (loveNoteModal) {
    loveNoteModal.addEventListener('click', (e) => {
      if (e.target === loveNoteModal) loveNoteModal.classList.add('hidden');
    });
  }

  // Secret Heart Button → Video Modal
  const secretHeartBtn = document.getElementById('secret-heart-btn');
  const secretVideoModal = document.getElementById('secret-video-modal');
  const secretVideoCloseBtn = document.getElementById('secret-video-close-btn');
  const secretVideoIframe = document.getElementById('secret-video-iframe');
  const secretVideoPlayer = document.getElementById('secret-video-player');

  function stopSecretVideo() {
    if (secretVideoPlayer) {
      secretVideoPlayer.pause();
      secretVideoPlayer.currentTime = 0;
      secretVideoPlayer.src = '';
      secretVideoPlayer.style.display = 'none';
    }
    if (secretVideoIframe) {
      secretVideoIframe.src = '';
      secretVideoIframe.style.display = 'none';
    }
  }

  function playSecretVideo(videoUrl) {
    if (!videoUrl) {
      videoUrl = 'videos/secret.mp4';
    }
    const isEmbedOrYoutube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('vimeo.com') || videoUrl.includes('embed');

    if (isEmbedOrYoutube) {
      if (secretVideoPlayer) {
        secretVideoPlayer.pause();
        secretVideoPlayer.style.display = 'none';
      }
      if (secretVideoIframe) {
        secretVideoIframe.src = videoUrl;
        secretVideoIframe.style.display = 'block';
      }
    } else {
      // Local video or direct video file (mp4, webm, etc.)
      if (secretVideoIframe) {
        secretVideoIframe.src = '';
        secretVideoIframe.style.display = 'none';
      }
      if (secretVideoPlayer) {
        secretVideoPlayer.src = videoUrl;
        secretVideoPlayer.style.display = 'block';
        secretVideoPlayer.load();
        const playPromise = secretVideoPlayer.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.log('Video autoplay prevented or source not loaded yet:', err);
          });
        }
      }
    }
  }

  if (secretHeartBtn) {
    secretHeartBtn.addEventListener('click', () => {
      const videoUrl = (surpriseData && surpriseData.secretVideoUrl) || 'videos/secret.mp4';
      playSecretVideo(videoUrl);
      loveNoteModal.classList.add('hidden');
      if (secretVideoModal) secretVideoModal.classList.remove('hidden');
      confettiEngine.burst(60);
      // Pause background music while video plays
      audioController.stopAudio();
    });
  }
  if (secretVideoCloseBtn) {
    secretVideoCloseBtn.addEventListener('click', () => {
      stopSecretVideo();
      secretVideoModal.classList.add('hidden');
      // Resume background music after video closes
      audioController.startAudio();
    });
  }
  if (secretVideoModal) {
    secretVideoModal.addEventListener('click', (e) => {
      if (e.target === secretVideoModal) {
        stopSecretVideo();
        secretVideoModal.classList.add('hidden');
        // Resume background music after video closes
        audioController.startAudio();
      }
    });
  }

  // Customizer Modal Handlers
  if (customizeTriggerBtn) {
    customizeTriggerBtn.addEventListener('click', () => customizerModal.classList.remove('hidden'));
  }
  if (customizerCloseBtn) {
    customizerCloseBtn.addEventListener('click', () => customizerModal.classList.add('hidden'));
  }

  function prefillCustomizerForm(data) {
    if (!data) return;
    const nameInput = document.getElementById('input-recipient-name');
    if (nameInput) nameInput.value = data.recipientName || '';
    
    const landingTitleInput = document.getElementById('input-landing-title');
    if (landingTitleInput) landingTitleInput.value = data.landingTitle || '';

    const landingBtnInput = document.getElementById('input-landing-btn-text');
    if (landingBtnInput) landingBtnInput.value = data.landingButtonText || '';

    const mainGreetingInput = document.getElementById('input-main-greeting');
    if (mainGreetingInput) mainGreetingInput.value = data.mainGreeting || '';

    const emotionalMsgInput = document.getElementById('input-emotional-message');
    if (emotionalMsgInput) emotionalMsgInput.value = data.emotionalMessage || '';

    const cakeWishInput = document.getElementById('input-cake-wish');
    if (cakeWishInput) cakeWishInput.value = data.cakeWishText || '';

    const audioUrlInput = document.getElementById('input-audio-url');
    if (audioUrlInput) audioUrlInput.value = (data.audio && data.audio.customUrl) || '';

    const videoUrlInput = document.getElementById('input-video-url');
    if (videoUrlInput) videoUrlInput.value = data.secretVideoUrl || '';
  }

  // Form Submit Handler -> Update backend API & local storage
  if (customizerForm) {
    customizerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const newName = document.getElementById('input-recipient-name').value.trim();
      const newLandingTitle = document.getElementById('input-landing-title') ? document.getElementById('input-landing-title').value.trim() : '';
      const newLandingBtn = document.getElementById('input-landing-btn-text') ? document.getElementById('input-landing-btn-text').value.trim() : '';
      const newGreeting = document.getElementById('input-main-greeting').value.trim();
      const newMsg = document.getElementById('input-emotional-message').value.trim();
      const newCakeWish = document.getElementById('input-cake-wish').value.trim();
      const newAudioUrl = document.getElementById('input-audio-url').value.trim();
      const newVideoUrl = document.getElementById('input-video-url') ? document.getElementById('input-video-url').value.trim() : '';

      if (!surpriseData) {
        surpriseData = ApiService.getDefaultFallbackData();
      }

      if (newName) surpriseData.recipientName = newName;
      if (newLandingTitle) surpriseData.landingTitle = newLandingTitle;
      if (newLandingBtn) surpriseData.landingButtonText = newLandingBtn;
      if (newGreeting) surpriseData.mainGreeting = newGreeting;
      if (newMsg) surpriseData.emotionalMessage = newMsg;
      if (newCakeWish) surpriseData.cakeWishText = newCakeWish;
      
      if (!surpriseData.audio) surpriseData.audio = {};
      surpriseData.audio.customUrl = newAudioUrl;

      if (newVideoUrl) surpriseData.secretVideoUrl = newVideoUrl;

      try {
        const res = await ApiService.updateSurpriseData(surpriseData);
        if (res && res.data) {
          surpriseData = res.data;
        }
        renderContent(surpriseData);
        customizerModal.classList.add('hidden');
        showToast('Surprise data updated successfully! ❤️');
      } catch (err) {
        console.error('Error saving:', err);
        renderContent(surpriseData);
        customizerModal.classList.add('hidden');
        showToast('Saved locally! ❤️');
      }
    });
  }

  // Reset Defaults Handler
  if (resetDefaultsBtn) {
    resetDefaultsBtn.addEventListener('click', async () => {
      try {
        const res = await ApiService.resetSurpriseData();
        surpriseData = res.data;
        renderContent(surpriseData);
        customizerModal.classList.add('hidden');
        showToast('Reset to default template values! ✨');
      } catch (err) {
        showToast('Failed to reset data');
      }
    });
  }

  function showToast(msg) {
    if (!toastNotification || !toastMessage) return;
    toastMessage.textContent = msg;
    toastNotification.classList.remove('hidden');
    setTimeout(() => {
      toastNotification.classList.add('hidden');
    }, 3000);
  }

  // Initial Load
  await loadAndRender();
});
