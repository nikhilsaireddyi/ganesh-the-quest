/**
 * LezimDance - Traditional Maharashtrian Folk Dance Challenge
 * Players rhythmically snap the jingling Lezim instrument in sync with the dancers.
 */

import { audioManager } from '../audio/AudioManager.js';

export class LezimDance {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.active = false;
    this.score = 0;
    this.targetScore = 8;
    this.combo = 0;

    this.timer = 0;
    this.beatInterval = 1.0; // beat every 1.0s
    this.beatTimer = 0;
    this.currentStep = 0; // 0: Right, 1: Left, 2: Center snap
    this.feedbackText = '';
    this.feedbackTimer = 0;

    // Rings
    this.rings = [];
  }

  start() {
    this.active = true;
    this.score = 0;
    this.combo = 0;
    this.timer = 0;
    this.beatTimer = 0;
    this.rings = [];
    audioManager.playLezim();
  }

  update(dt, input) {
    if (!this.active) return;

    const mouse = input && input.mouse;
    if (mouse && mouse.justPressed && mouse.x >= 1170 && mouse.x <= 1250 && mouse.y >= 20 && mouse.y <= 85) {
      this.active = false;
      audioManager.playSnap();
      mouse.justPressed = false;
      return;
    }

    this.timer += dt;
    this.beatTimer += dt;

    if (this.feedbackTimer > 0) {
      this.feedbackTimer -= dt;
    }

    // Spawn new rhythmic dance beat ring
    if (this.beatTimer >= this.beatInterval) {
      this.beatTimer = 0;
      this.currentStep = (this.currentStep + 1) % 3;
      this.rings.push({
        radius: 120,
        step: this.currentStep,
        hit: false
      });
    }

    // Update existing rings
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const ring = this.rings[i];
      ring.radius -= dt * 110; // collapses to center radius 40

      if (ring.radius < 20) {
        if (!ring.hit) {
          this.combo = 0;
          this.feedbackText = 'MISS!';
          this.feedbackTimer = 0.5;
        }
        this.rings.splice(i, 1);
      }
    }

    // Player Input: [L], [Space], [Enter], or Mouse/Touch click
    let triggerHit = false;
    if (input.interactPressed || (input.keys && (input.keys['KeyL'] || input.keys['Space']))) {
      triggerHit = true;
      input.interactPressed = false;
      if (input.keys) {
        input.keys['KeyL'] = false;
        input.keys['Space'] = false;
      }
    }

    if (mouse && mouse.justPressed) {
      // Check click on central target (640, 360, radius 80) or bottom button
      if (Math.hypot(mouse.x - 640, mouse.y - 360) <= 80 || (mouse.x >= 520 && mouse.x <= 760 && mouse.y >= 540 && mouse.y <= 600)) {
        triggerHit = true;
      }
      mouse.justPressed = false;
    }

    if (triggerHit) {
      this.handleHit();
    }
  }

  handleHit() {
    // Find closest ring near radius 40
    let closestRing = null;
    let minDiff = Infinity;

    this.rings.forEach(r => {
      if (!r.hit) {
        const diff = Math.abs(r.radius - 40);
        if (diff < minDiff) {
          minDiff = diff;
          closestRing = r;
        }
      }
    });

    if (closestRing && minDiff < 35) {
      closestRing.hit = true;
      this.score++;
      this.combo++;
      audioManager.playLezim();

      if (minDiff < 15) {
        this.feedbackText = 'PERFECT! 🪘';
      } else {
        this.feedbackText = 'GOOD! 👏';
      }
      this.feedbackTimer = 0.6;

      if (this.score >= this.targetScore) {
        this.active = false;
        audioManager.playChantMorya();
        if (this.onComplete) {
          this.onComplete();
        }
      }
    } else {
      this.combo = 0;
      this.feedbackText = 'TOO EARLY!';
      this.feedbackTimer = 0.4;
    }
  }

  render(ctx) {
    if (!this.active) return;

    ctx.save();
    // Festive semi-transparent backdrop
    ctx.fillStyle = 'rgba(10, 14, 26, 0.85)';
    ctx.fillRect(0, 0, 1280, 720);

    // Close Button [X]
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(1190, 35, 40, 36, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✕', 1210, 59);

    // Center Stage Podium
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(640, 360, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hit Target Center Circle
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(640, 360, 40, 0, Math.PI * 2);
    ctx.stroke();

    // Collapsing beat rings
    this.rings.forEach(r => {
      ctx.strokeStyle = r.hit ? '#4ade80' : '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(640, 360, Math.max(5, r.radius), 0, Math.PI * 2);
      ctx.stroke();
    });

    // Draw Festive Lezim Stick in center with motion
    this.renderLezimStick(ctx, 640, 360, this.currentStep);

    // Header Title
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 26px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🥁 MAHARASHTRIAN LEZIM FOLK DANCE', 640, 95);

    ctx.fillStyle = '#ffffff';
    ctx.font = '15px sans-serif';
    ctx.fillText('Snap the Lezim when the blue ring reaches the gold circle! Press [L], [SPACE] or Tap Target.', 640, 125);

    // Score & Progress Bar
    const progressW = 360;
    const progressX = 640 - progressW / 2;
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(progressX, 155, progressW, 16, 8);
    ctx.fill();

    const fillW = (this.score / this.targetScore) * progressW;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(progressX, 155, fillW, 16, 8);
    ctx.fill();

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`Dance Energy: ${this.score} / ${this.targetScore}  •  Combo: ${this.combo}x`, 640, 195);

    // Feedback popup
    if (this.feedbackTimer > 0) {
      ctx.fillStyle = this.feedbackText.includes('MISS') ? '#ef4444' : '#facc15';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(this.feedbackText, 640, 290);
    }

    // Tap Target Button at bottom
    ctx.fillStyle = '#e65100';
    ctx.beginPath();
    ctx.roundRect(520, 545, 240, 52, 12);
    ctx.fill();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('SNAP LEZIM! 🔔', 640, 577);

    ctx.restore();
  }

  renderLezimStick(ctx, cx, cy, step) {
    ctx.save();
    ctx.translate(cx, cy);

    const angle = step === 0 ? 0.35 : (step === 1 ? -0.35 : 0);
    ctx.rotate(angle);

    // Wooden handle stick
    ctx.fillStyle = '#854d0e';
    ctx.beginPath();
    ctx.roundRect(-8, -50, 16, 100, 4);
    ctx.fill();

    // Metallic chain link
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -45);
    ctx.quadraticCurveTo(35, 0, 0, 45);
    ctx.stroke();

    // Metallic jingling cymbals / discs along chain
    ctx.fillStyle = '#ffd700';
    for (let i = -2; i <= 2; i++) {
      const cyy = i * 18;
      const cxx = Math.cos(i * 0.4) * 28;
      ctx.beginPath();
      ctx.arc(cxx, cyy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }
}
