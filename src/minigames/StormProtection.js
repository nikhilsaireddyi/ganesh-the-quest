/**
 * StormProtection - Mission 6 System
 * 30-second timed challenge during the sudden thunderstorm.
 * Player must run and secure 4 flapping tarps, lights, and decorations.
 */

import { audioManager } from '../audio/AudioManager.js';

export class StormProtection {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.active = false;
    this.completed = false;
    this.timer = 30; // 30 seconds

    this.hotspots = [
      { id: 'tarp', name: 'Canopy Tarp', x: 1320, y: 520, secured: false },
      { id: 'lights', name: 'Fairy Light Cable', x: 1480, y: 520, secured: false },
      { id: 'diya', name: 'Sacred Lamp', x: 1260, y: 520, secured: false },
      { id: 'curtain', name: 'Side Curtain', x: 1540, y: 520, secured: false }
    ];
  }

  start() {
    this.active = true;
    this.completed = false;
    this.timer = 30;
    this.hotspots.forEach(h => h.secured = false);
    audioManager.playThunder();
  }

  update(dt, playerX, input, particles) {
    if (!this.active || this.completed) return;

    this.timer -= dt;

    // Check if player is near any unsecured hotspot and presses interact
    for (const h of this.hotspots) {
      if (!h.secured) {
        const dist = Math.abs(playerX - h.x);
        if (dist < 55) {
          if (input.interactPressed || (input.mouse.justPressed && Math.hypot(input.mouse.x - h.x, input.mouse.y - h.y) < 60)) {
            h.secured = true;
            audioManager.playSnap();
            particles.emitSparks(h.x, h.y - 40, 10);
            break;
          }
        }
      }
    }

    // Check all secured
    if (this.hotspots.every(h => h.secured)) {
      this.completed = true;
      this.active = false;
      audioManager.playSuccess();
      if (this.onComplete) this.onComplete();
      return;
    }

    // Timer expired: generous retry reset so player isn't stuck
    if (this.timer <= 0) {
      this.timer = 20; // reset extra time
    }
  }

  renderWorldHotspots(ctx) {
    if (!this.active || this.completed) return;

    const animTime = Date.now() * 0.005;

    for (const h of this.hotspots) {
      if (!h.secured) {
        ctx.save();
        const pulse = Math.sin(animTime * 6) * 6;
        const hy = h.y - 60 + pulse;

        // Danger pulsing ring
        ctx.fillStyle = 'rgba(255, 23, 68, 0.85)';
        ctx.beginPath();
        ctx.arc(h.x, hy, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', h.x, hy);

        // Name tag
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(h.x - 45, hy - 32, 90, 18);
        ctx.fillStyle = '#ffea00';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`SECURE [E]`, h.x, hy - 20);

        ctx.restore();
      }
    }
  }

  renderHUD(ctx) {
    if (!this.active || this.completed) return;

    ctx.save();
    // Storm Warning Timer HUD at Top Center
    ctx.fillStyle = 'rgba(183, 28, 28, 0.9)';
    ctx.beginPath();
    ctx.roundRect(490, 20, 300, 70, 12);
    ctx.fill();
    ctx.strokeStyle = '#ffea00';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ PROTECT THE MANDAPAM!', 640, 44);

    const secs = Math.ceil(this.timer);
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = secs <= 5 ? '#ff1744' : '#ffd54f';
    ctx.fillText(`00:${secs < 10 ? '0' : ''}${secs}`, 640, 72);

    ctx.restore();
  }
}
