/* ==========================================================================
   AMBIENT HTML5 CANVAS PARTICLE SYSTEM (HEARTS, STARS & BALLOONS)
   ========================================================================== */

class ParticleEngine {
  constructor() {
    this.canvas = document.getElementById('particles-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.balloons = [];
    this.maxParticles = 60;
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initParticles();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle() {
    const isHeart = Math.random() > 0.3;
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      size: isHeart ? Math.random() * 12 + 6 : Math.random() * 3 + 1,
      speedY: Math.random() * -1.2 - 0.3,
      speedX: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.7 + 0.3,
      fadeSpeed: Math.random() * 0.01 + 0.005,
      type: isHeart ? 'heart' : 'star',
      color: isHeart ? `hsl(${340 + Math.random() * 30}, 100%, ${65 + Math.random() * 20}%)` : '#ffd700'
    };
  }

  spawnBalloons(count = 12) {
    const colors = ['#ff4d8d', '#ff75a0', '#ffd700', '#d8b4fe', '#ff5722', '#e91e63'];
    for (let i = 0; i < count; i++) {
      this.balloons.push({
        x: Math.random() * this.canvas.width,
        y: this.canvas.height + 50 + Math.random() * 100,
        radius: Math.random() * 18 + 16,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * -2 - 1.5,
        swingSpeed: Math.random() * 0.05 + 0.02,
        swingDistance: Math.random() * 30 + 10,
        angle: Math.random() * Math.PI * 2
      });
    }
  }

  drawHeart(x, y, size, color, opacity) {
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    const topCurveHeight = size * 0.3;
    this.ctx.moveTo(x, y + topCurveHeight);
    // top left curve
    this.ctx.bezierCurveTo(
      x, y, 
      x - size / 2, y, 
      x - size / 2, y + topCurveHeight
    );
    // bottom left curve
    this.ctx.bezierCurveTo(
      x - size / 2, y + (size + topCurveHeight) / 2, 
      x, y + size, 
      x, y + size
    );
    // bottom right curve
    this.ctx.bezierCurveTo(
      x, y + size, 
      x + size / 2, y + (size + topCurveHeight) / 2, 
      x + size / 2, y + topCurveHeight
    );
    // top right curve
    this.ctx.bezierCurveTo(
      x + size / 2, y, 
      x, y, 
      x, y + topCurveHeight
    );
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  drawStar(x, y, size, opacity) {
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = '#ffd700';
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#ffd700';
    this.ctx.beginPath();
    this.ctx.arc(x, y, size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawBalloon(balloon) {
    this.ctx.save();
    this.ctx.fillStyle = balloon.color;
    this.ctx.beginPath();
    this.ctx.ellipse(balloon.x, balloon.y, balloon.radius * 0.85, balloon.radius, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Balloon string
    this.ctx.beginPath();
    this.ctx.moveTo(balloon.x, balloon.y + balloon.radius);
    this.ctx.lineTo(balloon.x + Math.sin(balloon.angle) * 5, balloon.y + balloon.radius + 35);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    // Balloon shine accent
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.beginPath();
    this.ctx.arc(balloon.x - balloon.radius * 0.3, balloon.y - balloon.radius * 0.3, balloon.radius * 0.25, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update Particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.y += p.speedY;
      p.x += p.speedX;

      if (p.type === 'heart') {
        this.drawHeart(p.x, p.y, p.size, p.color, p.opacity);
      } else {
        this.drawStar(p.x, p.y, p.size, p.opacity);
      }

      if (p.y < -20 || p.x < -20 || p.x > this.canvas.width + 20) {
        this.particles[i] = this.createParticle();
        this.particles[i].y = this.canvas.height + 10;
      }
    }

    // Update Floating Balloons
    for (let i = this.balloons.length - 1; i >= 0; i--) {
      const b = this.balloons[i];
      b.y += b.speedY;
      b.angle += b.swingSpeed;
      b.x += Math.sin(b.angle) * 0.8;

      this.drawBalloon(b);

      if (b.y < -100) {
        this.balloons.splice(i, 1);
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}
