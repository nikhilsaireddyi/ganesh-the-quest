/**
 * ParticleSystem - High-performance configurable particle emitter
 * Supports flower petals, storm rain, lightning flash,
 * fireworks bursts, electrical sparks, water ripples, and divine aura dust.
 */

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.lightningAlpha = 0;
  }

  update(dt) {
    if (this.lightningAlpha > 0) {
      this.lightningAlpha = Math.max(0, this.lightningAlpha - dt * 2.5);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.gravity) {
        p.vy += p.gravity * dt;
      }

      if (p.type === 'petal') {
        p.angle += p.vAngle * dt;
        p.x += Math.sin(p.life * 4) * p.sway;
      } else if (p.type === 'firework') {
        p.vx *= 0.96;
        p.vy *= 0.96;
      } else if (p.type === 'ripple') {
        p.radius += p.growRate * dt;
      } else if (p.type === 'gulal') {
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.size += dt * 14; // expand like a puff of smoke
      } else if (p.type === 'dust') {
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.size += dt * 15; // expanding dust cloud
      } else if (p.type === 'debris') {
        p.angle += p.vAngle * dt;
        p.vx *= 0.98;
      }
    }

    // Cap maximum particles to prevent GC lag during intense storms or bursts
    if (this.particles.length > 250) {
      this.particles.splice(0, this.particles.length - 250);
    }
  }

  render(ctx) {
    if (this.particles.length === 0 && this.lightningAlpha <= 0) return;

    // High-performance particle rendering
    for (const p of this.particles) {
      const progress = p.life / p.maxLife;
      const alpha = Math.max(0, Math.min(1, progress * (p.alpha || 1)));

      if (p.type === 'petal') {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'debris') {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      } else {
        ctx.globalAlpha = alpha;

        if (p.type === 'rain') {
          ctx.strokeStyle = 'rgba(180, 215, 255, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04);
          ctx.stroke();
        } else if (p.type === 'spark') {
          ctx.fillStyle = p.color || '#fff176';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * progress, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'firework') {
          // Fast glowing halo without GPU shadowBlur overhead
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha * 0.35;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * progress * 1.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * progress, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'aura') {
          ctx.fillStyle = '#ffd54f';
          ctx.globalAlpha = alpha * 0.35;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * progress * 1.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * progress, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'ripple') {
          ctx.strokeStyle = `rgba(100, 181, 246, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.type === 'gulal' || p.type === 'dust') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.globalAlpha = 1.0;

    // Lightning Flash overlay
    if (this.lightningAlpha > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.lightningAlpha * 0.75})`;
      ctx.fillRect(-2000, -2000, 10000, 10000);
    }
  }

  // --- EMITTERS ---

  emitPetals(x, y, count = 10) {
    const colors = ['#ff8f00', '#ffd54f', '#e91e63', '#d50000'];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'petal',
        x: x + (Math.random() - 0.5) * 80,
        y: y + (Math.random() - 0.5) * 40,
        vx: 20 + Math.random() * 40,
        vy: 30 + Math.random() * 40,
        size: 4 + Math.random() * 4,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 4,
        sway: 1 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 3 + Math.random() * 2,
        maxLife: 5,
        alpha: 0.9
      });
    }
  }

  emitRain(viewX, viewY, width = 1280, height = 720, count = 25) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'rain',
        x: viewX - 400 + Math.random() * (width + 800),
        y: viewY - 200 + Math.random() * (height + 200),
        vx: -150 - Math.random() * 80, // Slanted wind rain
        vy: 900 + Math.random() * 300,
        life: 0.5 + Math.random() * 0.4,
        maxLife: 0.9,
        alpha: 0.7
      });
    }
  }

  emitLightning() {
    this.lightningAlpha = 1.0;
  }

  emitSparks(x, y, count = 15) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 160;
      this.particles.push({
        type: 'spark',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 250,
        size: 3 + Math.random() * 3,
        color: Math.random() > 0.3 ? '#fff59d' : '#ff9800',
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        alpha: 1.0
      });
    }
  }

  emitFireworks(x, y, color = null) {
    const burstColors = ['#ff1744', '#00e676', '#ffea00', '#00e5ff', '#e040fb', '#ff9100'];
    const selectedColor = color || burstColors[Math.floor(Math.random() * burstColors.length)];
    const count = 40;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const speed = 60 + Math.random() * 180;
      this.particles.push({
        type: 'firework',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 40,
        size: 3.5 + Math.random() * 3,
        color: selectedColor,
        life: 0.8 + Math.random() * 0.6,
        maxLife: 1.4,
        alpha: 1.0
      });
    }
  }

  emitDivineAura(x, y, count = 6) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        type: 'aura',
        x: x + (Math.random() - 0.5) * 70,
        y: y + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 20,
        vy: -30 - Math.random() * 40, // Floating upward
        size: 3 + Math.random() * 4,
        life: 1.5 + Math.random() * 1.5,
        maxLife: 3.0,
        alpha: 0.8
      });
    }
  }

  emitWaterRipple(x, y) {
    this.particles.push({
      type: 'ripple',
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 6,
      growRate: 45,
      life: 1.6,
      maxLife: 1.6,
      alpha: 0.8
    });
  }

  emitGulal(x, y, count = 35) {
    const colors = ['#ec4899', '#db2777', '#f97316', '#ea580c', '#eab308', '#facc15', '#a855f7'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 160;
      this.particles.push({
        type: 'gulal',
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30, // upward puff
        size: 5 + Math.random() * 9,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.2 + Math.random() * 1.0,
        maxLife: 2.2,
        alpha: 0.85
      });
    }
  }

  emitCollapseDust(x, y, count = 25) {
    const dustColors = ['#8d6e63', '#a1887f', '#bcaaa4', '#d7ccc8', '#795548'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 110;
      this.particles.push({
        type: 'dust',
        x: x + (Math.random() - 0.5) * 180,
        y: y + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed * 0.4 - 25,
        size: 9 + Math.random() * 16,
        color: dustColors[Math.floor(Math.random() * dustColors.length)],
        life: 1.2 + Math.random() * 1.2,
        maxLife: 2.4,
        alpha: 0.82
      });
    }
  }

  emitDebris(x, y, count = 20) {
    const debrisColors = ['#6d4c41', '#8d6e63', '#b71c1c', '#ff8f00', '#ffd54f'];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI * 0.1 - Math.random() * Math.PI * 0.8;
      const speed = 70 + Math.random() * 190;
      this.particles.push({
        type: 'debris',
        x: x + (Math.random() - 0.5) * 140,
        y: y + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 380,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 12,
        w: 6 + Math.random() * 14,
        h: 3 + Math.random() * 6,
        color: debrisColors[Math.floor(Math.random() * debrisColors.length)],
        life: 1.0 + Math.random() * 0.8,
        maxLife: 1.8,
        alpha: 1.0
      });
    }
  }

  clear() {
    this.particles = [];
  }
}
