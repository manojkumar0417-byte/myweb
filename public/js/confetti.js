/* ==========================================================================
   CELEBRATORY CANVAS CONFETTI BURST ENGINE
   ========================================================================== */

class ConfettiEngine {
  constructor() {
    this.canvas = document.getElementById('confetti-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.confetti = [];
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(count = 120) {
    const colors = ['#ff4d8d', '#ff75a0', '#ffd700', '#d8b4fe', '#00e5ff', '#ff9100', '#ffffff'];
    for (let i = 0; i < count; i++) {
      this.confetti.push({
        x: this.canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: this.canvas.height / 2 + (Math.random() - 0.5) * 100,
        size: Math.random() * 10 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 16,
        vy: Math.random() * -18 - 8,
        gravity: 0.45,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        decay: Math.random() * 0.008 + 0.004,
        shape: Math.random() > 0.4 ? 'rect' : 'circle'
      });
    }

    if (!this.animating) {
      this.animating = true;
      this.animate();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += c.gravity;
      c.rotation += c.rotationSpeed;
      c.opacity -= c.decay;

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, c.opacity);
      this.ctx.translate(c.x, c.y);
      this.ctx.rotate((c.rotation * Math.PI) / 180);
      this.ctx.fillStyle = c.color;

      if (c.shape === 'rect') {
        this.ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, c.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();

      if (c.opacity <= 0 || c.y > this.canvas.height + 50) {
        this.confetti.splice(i, 1);
      }
    }

    if (this.confetti.length > 0) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.animating = false;
    }
  }
}
