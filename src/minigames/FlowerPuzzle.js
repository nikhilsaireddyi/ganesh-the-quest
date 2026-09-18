/**
 * FlowerPuzzle - Mission 2 Mini-game
 * Arrange yellow, red, pink, orange flowers & leaves into a festive sacred garland.
 */

import { audioManager } from '../audio/AudioManager.js';

export class FlowerPuzzle {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.active = false;
    this.completed = false;
    this.completionTimer = 0;

    // Target sequence pattern to match
    this.pattern = ['yellow', 'red', 'pink', 'orange', 'green'];

    // 5 garland slots
    this.slots = [
      { id: 0, x: 440, y: 320, expected: 'yellow', flower: null },
      { id: 1, x: 540, y: 350, expected: 'red', flower: null },
      { id: 2, x: 640, y: 365, expected: 'pink', flower: null },
      { id: 3, x: 740, y: 350, expected: 'orange', flower: null },
      { id: 4, x: 840, y: 320, expected: 'green', flower: null }
    ];

    // Source flowers available to pick
    this.flowerTypes = [
      { type: 'yellow', name: 'Marigold', color: '#ffd600', x: 380, y: 530, r: 28 },
      { type: 'red', name: 'Rose', color: '#d50000', x: 510, y: 530, r: 28 },
      { type: 'pink', name: 'Lotus', color: '#f06292', x: 640, y: 530, r: 28 },
      { type: 'orange', name: 'Genda', color: '#ff6d00', x: 770, y: 530, r: 28 },
      { type: 'green', name: 'Mango Leaf', color: '#2e7d32', x: 900, y: 530, r: 28 }
    ];

    this.dragged = null;
    this.dragPos = { x: 0, y: 0 };
  }

  start() {
    this.active = true;
    this.completed = false;
    this.completionTimer = 0;
    this.slots.forEach(s => s.flower = null);
  }

  update(dt, input, particles) {
    if (!this.active) return;

    if (this.completed) {
      this.completionTimer += dt;
      if (this.completionTimer > 1.8) {
        this.active = false;
        if (this.onComplete) this.onComplete();
      }
      return;
    }

    const mouse = input.mouse;

    if (mouse.justPressed) {
      // Check if clicking flower source
      for (const ft of this.flowerTypes) {
        const dist = Math.hypot(mouse.x - ft.x, mouse.y - ft.y);
        if (dist < ft.r + 10) {
          this.dragged = ft;
          this.dragPos = { x: mouse.x, y: mouse.y };
          audioManager.playSnap();
          break;
        }
      }
    }

    if (this.dragged && mouse.isDown) {
      this.dragPos.x = mouse.x;
      this.dragPos.y = mouse.y;
    }

    if (this.dragged && mouse.justReleased) {
      // Check if dropped near a slot
      for (const slot of this.slots) {
        const dist = Math.hypot(this.dragPos.x - slot.x, this.dragPos.y - slot.y);
        if (dist < 45) {
          if (slot.expected === this.dragged.type) {
            slot.flower = this.dragged.type;
            audioManager.playBell();
            particles.emitPetals(slot.x, slot.y, 8);
          } else {
            // Spark feedback for incorrect
            audioManager.playSpark();
            particles.emitSparks(slot.x, slot.y, 6);
          }
          break;
        }
      }
      this.dragged = null;

      // Check all slots satisfied
      if (this.slots.every(s => s.flower !== null)) {
        this.completed = true;
        audioManager.playSuccess();
        particles.emitPetals(640, 340, 30);
      }
    }
  }

  render(ctx) {
    if (!this.active) return;

    ctx.save();
    // Modal Overlay
    ctx.fillStyle = 'rgba(10, 14, 26, 0.88)';
    ctx.fillRect(0, 0, 1280, 720);

    // Dialog Box
    ctx.fillStyle = '#1e2433';
    ctx.beginPath();
    ctx.roundRect(140, 60, 1000, 600, 16);
    ctx.fill();
    ctx.strokeStyle = '#ff8f00';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Title & Instructions
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SACRED FLOWER GARLAND ARRANGEMENT', 640, 110);

    ctx.fillStyle = '#e0e0e0';
    ctx.font = '16px sans-serif';
    ctx.fillText('Drag flowers from the bottom basket onto the garland string in the matching target pattern.', 640, 140);

    // Pattern preview bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(380, 160, 520, 55, 8);
    ctx.fill();
    ctx.fillStyle = '#ffd54f';
    ctx.font = '14px sans-serif';
    ctx.fillText('Pattern Order: Yellow Marigold → Red Rose → Pink Lotus → Orange Genda → Mango Leaf', 640, 192);

    // Draw Garland String Curve
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(380, 290);
    ctx.quadraticCurveTo(640, 420, 900, 290);
    ctx.stroke();

    // Draw Slots
    this.slots.forEach(s => {
      ctx.save();
      ctx.fillStyle = s.flower ? 'transparent' : 'rgba(255, 255, 255, 0.15)';
      ctx.strokeStyle = s.flower ? '#00e676' : 'rgba(255, 215, 0, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.arc(s.x, s.y, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (s.flower) {
        // Draw placed flower
        const flower = this.flowerTypes.find(f => f.type === s.flower);
        ctx.fillStyle = flower.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Hint letter
        ctx.fillStyle = '#ffd54f';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.expected.toUpperCase(), s.x, s.y);
      }
      ctx.restore();
    });

    // Draw Flowers Basket Tray
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.roundRect(240, 470, 800, 120, 12);
    ctx.fill();
    ctx.strokeStyle = '#546e7a';
    ctx.stroke();

    this.flowerTypes.forEach(ft => {
      ctx.save();
      ctx.fillStyle = ft.color;
      ctx.beginPath();
      ctx.arc(ft.x, ft.y, ft.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ft.x, ft.y, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffd54f';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.name, ft.x, ft.y + 44);
      ctx.restore();
    });

    // Currently Dragged Flower
    if (this.dragged) {
      ctx.save();
      ctx.fillStyle = this.dragged.color;
      ctx.beginPath();
      ctx.arc(this.dragPos.x, this.dragPos.y, this.dragged.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Completion Message
    if (this.completed) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 200, 83, 0.95)';
      ctx.beginPath();
      ctx.roundRect(420, 310, 440, 80, 12);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GARLAND COMPLETE! 🌺', 640, 358);
      ctx.restore();
    }

    ctx.restore();
  }
}
