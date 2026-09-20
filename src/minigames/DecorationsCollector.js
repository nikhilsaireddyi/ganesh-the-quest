/**
 * DecorationsCollector - Mission 3 System
 * Manages the collection of festival materials from street locations & NPCs,
 * renders world floating pickups with glowing halos and HUD checklist.
 */

import { audioManager } from '../audio/AudioManager.js';

export class DecorationsCollector {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.active = false;
    this.items = [
      { id: 'toran', name: 'Mango Toran', icon: '🌿', collected: false, x: 560, y: 470, hint: 'Mango Tree' },
      { id: 'flowers', name: 'Fresh Flowers', icon: '🌺', collected: false, x: 650, y: 470, hint: 'Flower Seller' },
      { id: 'banners', name: 'Festival Banners', icon: '🚩', collected: false, x: 1050, y: 470, hint: 'Festival Uncle' },
      { id: 'cloth', name: 'Saffron Silk Cloth', icon: '🎗️', collected: false, x: 1800, y: 470, hint: 'At Temple' },
      { id: 'lights', name: 'Fairy Lights', icon: '💡', collected: false, x: 2160, y: 470, hint: 'Electrician' }
    ];
  }

  start() {
    this.active = true;
    this.items.forEach(item => item.collected = false);
  }

  collect(id, particles) {
    const item = this.items.find(i => i.id === id);
    if (item && !item.collected) {
      item.collected = true;
      const count = this.getCollectedCount();
      audioManager.playPickup(count - 1);
      if (particles) {
        particles.emitPetals(item.x, item.y, 20);
        particles.emitDivineAura(item.x, item.y, 10);
      }

      if (this.isComplete()) {
        audioManager.playSuccess();
        if (this.onComplete) this.onComplete();
      }
      return true;
    }
    return false;
  }

  isComplete() {
    return this.items.every(i => i.collected);
  }

  isItemCollected(id) {
    const item = this.items.find(i => i.id === id);
    return item ? item.collected : true;
  }

  getCollectedCount() {
    return this.items.filter(i => i.collected).length;
  }

  renderWorldPickups(ctx, playerX) {
    if (!this.active || this.isComplete()) return;

    const animTime = Date.now() * 0.005;

    this.items.forEach(item => {
      if (!item.collected) {
        // Skip toran item: handled by physical Mango Tree and its dedicated interactive minigame
        if (item.id === 'toran') return;

        const floatY = item.y + Math.sin(animTime * 4 + item.x) * 6;
        const dist = Math.abs(playerX - item.x);
        const isNear = dist < 75;

        ctx.save();
        // Golden glowing aura circle
        const grad = ctx.createRadialGradient(item.x, floatY, 4, item.x, floatY, 28);
        grad.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
        grad.addColorStop(0.5, 'rgba(255, 143, 0, 0.5)');
        grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(item.x, floatY, 28, 0, Math.PI * 2);
        ctx.fill();

        // White border ring
        ctx.fillStyle = '#ff8f00';
        ctx.beginPath();
        ctx.arc(item.x, floatY, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Item Icon Emoji
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.icon, item.x, floatY + 1);

        ctx.restore();
      }
    });
  }

  renderHUD(ctx) {
    if (!this.active || this.isComplete()) return;

    ctx.save();
    // Checklist Card placed neatly on the right side below the top HUD buttons
    const vw = this.game ? this.game.virtualWidth : 1280;
    const bx = vw - 310;
    const by = 70;
    const bw = 285;
    const bh = 175;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 12);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();

    const count = this.getCollectedCount();
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`DECORATIONS NEEDED (${count}/5)`, bx + 16, by + 26);

    ctx.font = '13px sans-serif';
    this.items.forEach((item, index) => {
      const iy = by + 52 + index * 23;
      if (item.collected) {
        ctx.fillStyle = '#00e676';
        ctx.fillText(`✓ ${item.icon} ${item.name}`, bx + 16, iy);
      } else {
        ctx.fillStyle = '#b0bec5';
        ctx.fillText(`○ ${item.icon} ${item.name} (${item.hint})`, bx + 16, iy);
      }
    });

    ctx.restore();
  }
}
