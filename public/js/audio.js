/* ==========================================================================
   AUDIO PLAYER & ROMANTIC SYNTHESIZER ENGINE
   ========================================================================== */

class AudioController {
  constructor() {
    this.isPlaying = false;
    this.audioContext = null;
    this.synthTimer = null;
    this.customAudio = null;
    this.customUrl = '';
    
    this.toggleBtn = document.getElementById('audio-toggle-btn');
    this.icon = document.getElementById('audio-icon');
    this.widget = document.getElementById('audio-widget');

    this.init();
  }

  init() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggleAudio());
    }
  }

  setCustomUrl(url) {
    this.customUrl = url;
    if (url) {
      if (!this.customAudio) {
        this.customAudio = new Audio();
        this.customAudio.loop = true;
      }
      this.customAudio.src = url;
    }
  }

  async startAudio() {
    if (this.isPlaying) return;

    if (this.customUrl && this.customAudio) {
      try {
        await this.customAudio.play();
        this.isPlaying = true;
        this.updateUI(true);
        return;
      } catch (e) {
        console.warn('Custom audio playback blocked/failed, switching to romantic synth:', e);
      }
    }

    // Web Audio API Synthesizer Fallback (Happy Birthday Romantic Chimes)
    this.playRomanticSynthMelody();
    this.isPlaying = true;
    this.updateUI(true);
  }

  stopAudio() {
    this.isPlaying = false;
    if (this.customAudio) {
      this.customAudio.pause();
    }
    if (this.synthTimer) {
      clearInterval(this.synthTimer);
      this.synthTimer = null;
    }
    this.updateUI(false);
  }

  toggleAudio() {
    if (this.isPlaying) {
      this.stopAudio();
    } else {
      this.startAudio();
    }
  }

  updateUI(playing) {
    if (!this.widget || !this.icon) return;
    if (playing) {
      this.widget.classList.add('audio-playing');
      this.icon.className = 'fa-solid fa-volume-high music-icon';
    } else {
      this.widget.classList.remove('audio-playing');
      this.icon.className = 'fa-solid fa-volume-xmark music-icon';
    }
  }

  playRomanticSynthMelody() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      } else if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Romantic Happy Birthday Note Frequencies (Hz)
      // Sol-Sol-La-Sol-Do-Si ...
      const notes = [
        261.63, 261.63, 293.66, 261.63, 349.23, 329.63, // Happy Birthday to you
        261.63, 261.63, 293.66, 261.63, 392.00, 349.23, // Happy Birthday to you
        261.63, 261.63, 523.25, 440.00, 349.23, 329.63, 293.66, // Happy Birthday dear special one
        466.16, 466.16, 440.00, 349.23, 392.00, 349.23  // Happy Birthday to you
      ];
      const durations = [
        0.4, 0.4, 0.8, 0.8, 0.8, 1.2,
        0.4, 0.4, 0.8, 0.8, 0.8, 1.2,
        0.4, 0.4, 0.8, 0.8, 0.8, 0.8, 1.2,
        0.4, 0.4, 0.8, 0.8, 0.8, 1.5
      ];

      let noteIndex = 0;

      const playNextNote = () => {
        if (!this.isPlaying) return;

        const freq = notes[noteIndex];
        const duration = durations[noteIndex];

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        // Soft sine wave for music box / celeste chime sound
        osc.type = 'sine';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.01, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.18, this.audioContext.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + duration);

        noteIndex = (noteIndex + 1) % notes.length;
        const delay = duration * 1000 + 100;
        this.synthTimer = setTimeout(playNextNote, delay);
      };

      playNextNote();
    } catch (e) {
      console.warn('Audio synthesis error:', e);
    }
  }
}
