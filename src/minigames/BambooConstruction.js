/**
 * BambooConstruction - Mission 1 Mini-game
 * Drag and drop 5 bamboo components into snapping target slots.
 */

import { audioManager } from '../audio/AudioManager.js';

export class BambooConstruction {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.active = false;
    this.completed = false;

    // 5 Bamboo pieces (Spaced out comfortably across the tray with generous touch hitboxes)
    this.pieces = [
      { id: 'left_support', name: 'Left Pillar', x: 270, y: 555, origX: 270, origY: 555, w: 22, h: 140, placed: false },
      { id: 'right_support', name: 'Right Pillar', x: 450, y: 555, origX: 450, origY: 555, w: 22, h: 140, placed: false },
      { id: 'top_beam', name: 'Top Beam', x: 640, y: 555, origX: 640, origY: 555, w: 180, h: 22, placed: false },
      { id: 'mid_support', name: 'Center Post', x: 830, y: 555, origX: 830, origY: 555, w: 22, h: 140, placed: false },
      { id: 'roof_support', name: 'Roof Truss', x: 1010, y: 555, origX: 1010, origY: 555, w: 140, h: 42, placed: false }
    ];

    // Corresponding target slots (in mandapam coordinates)
    this.slots = [
      { id: 'left_support', x: 550, y: 290, w: 26, h: 146, occupied: false },
      { id: 'right_support', x: 730, y: 290, w: 26, h: 146, occupied: false },
      { id: 'top_beam', x: 640, y: 215, w: 186, h: 26, occupied: false },
      { id: 'mid_support', x: 640, y: 290, w: 26, h: 146, occupied: false },
      { id: 'roof_support', x: 640, y: 180, w: 146, h: 46, occupied: false }
    ];

    this.draggedPiece = null;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.completionTimer = 0;
  }

  start() {
    this.active = true;
    this.completed = false;
    this.completionTimer = 0;
    this.pieces.forEach(p => {
      p.x = p.origX;
      p.y = p.origY;
      p.placed = false;
    });
    this.slots.forEach(s => s.occupied = false);
  }

  update(dt, input, particles) {
    if (!this.active) return;

    const mouse = input && input.mouse;

    // Close button [X] (x: 1085, y: 75 with generous touch padding)
    if (mouse && mouse.justPressed && mouse.x >= 1060 && mouse.x <= 1140 && mouse.y >= 55 && mouse.y <= 125) {
      this.active = false;
      audioManager.playSnap();
      mouse.justPressed = false;
      if (this.completed && this.onComplete) {
        this.onComplete();
      }
      return;
    }

    if (this.completed) {
      this.completionTimer += dt;
      if (this.completionTimer > 1.2 || (mouse && mouse.justPressed) || (input && input.interactPressed)) {
        if (mouse) mouse.justPressed = false;
        if (input) input.interactPressed = false;
        this.active = false;
        if (this.onComplete) this.onComplete();
      }
      return;
    }

    // Drag start with generous touch padding for mobile fingers
    if (mouse.justPressed) {
      const touchPad = 25; // 25px touch margin so slender bamboo pillars are easily gripped
      for (const piece of this.pieces) {
        if (!piece.placed) {
          const halfW = piece.w / 2 + touchPad;
          const halfH = piece.h / 2 + touchPad;
          if (
            mouse.x >= piece.x - halfW &&
            mouse.x <= piece.x + halfW &&
            mouse.y >= piece.y - halfH &&
            mouse.y <= piece.y + halfH
          ) {
            this.draggedPiece = piece;
            this.dragOffsetX = mouse.x - piece.x;
            this.dragOffsetY = mouse.y - piece.y;
            break;
          }
        }
      }
    }

    // Drag move
    if (this.draggedPiece && mouse.isDown) {
      this.draggedPiece.x = mouse.x - this.dragOffsetX;
      this.draggedPiece.y = mouse.y - this.dragOffsetY;
    }

    // Drag release & snap check
    if (this.draggedPiece && mouse.justReleased) {
      const slot = this.slots.find(s => s.id === this.draggedPiece.id);
      const dist = Math.hypot(this.draggedPiece.x - slot.x, this.draggedPiece.y - slot.y);

      // Generous snap radius for mobile touchscreens (85px)
      if (dist < 85) {
        // Snap!
        this.draggedPiece.x = slot.x;
        this.draggedPiece.y = slot.y;
        this.draggedPiece.placed = true;
        slot.occupied = true;
        audioManager.playSnap();
        particles.emitSparks(slot.x, slot.y, 12);
      } else {
        // Return
        this.draggedPiece.x = this.draggedPiece.origX;
        this.draggedPiece.y = this.draggedPiece.origY;
      }

      this.draggedPiece = null;

      // Check all placed
      if (this.pieces.every(p => p.placed)) {
        this.completed = true;
        audioManager.playSuccess();
        particles.emitDivineAura(640, 260, 25);
      }
    }
  }

  render(ctx) {
    if (!this.active) return;

    ctx.save();
    // Modal Backdrop
    ctx.fillStyle = 'rgba(10, 14, 26, 0.88)';
    ctx.fillRect(0, 0, 1280, 720);

    // Frame Card
    ctx.fillStyle = '#1e2433';
    ctx.beginPath();
    ctx.roundRect(140, 60, 1000, 600, 16);
    ctx.fill();
    ctx.strokeStyle = '#ffb300';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Close Button [X]
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(1085, 75, 40, 36, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✕', 1105, 99);

    // Title & Instructions
    ctx.fillStyle = '#ffb300';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MANDAPAM BAMBOO CONSTRUCTION', 640, 105);

    ctx.fillStyle = '#e0e0e0';
    ctx.font = '16px sans-serif';
    ctx.fillText('Drag each bamboo support piece into its highlighted slot on the framework.', 640, 135);

    // Render Target Blueprint Zones
    this.slots.forEach(slot => {
      ctx.save();
      ctx.strokeStyle = slot.occupied ? '#00e676' : 'rgba(255, 179, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.fillStyle = slot.occupied ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 179, 0, 0.08)';

      ctx.beginPath();
      ctx.roundRect(slot.x - slot.w / 2, slot.y - slot.h / 2, slot.w, slot.h, 4);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // Render Tray Platform at bottom
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.roundRect(180, 480, 920, 150, 10);
    ctx.fill();
    ctx.strokeStyle = '#455a64';
    ctx.stroke();

    // Render Bamboo Pieces
    this.pieces.forEach(piece => {
      ctx.save();
      ctx.fillStyle = '#8d6e63';
      ctx.beginPath();
      ctx.roundRect(piece.x - piece.w / 2, piece.y - piece.h / 2, piece.w, piece.h, 4);
      ctx.fill();
      ctx.strokeStyle = '#5d4037';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Bamboo segment rings
      ctx.fillStyle = '#4e342e';
      if (piece.h > piece.w) {
        for (let ry = piece.y - piece.h / 2 + 20; ry < piece.y + piece.h / 2; ry += 30) {
          ctx.fillRect(piece.x - piece.w / 2 - 2, ry, piece.w + 4, 3);
        }
      } else {
        for (let rx = piece.x - piece.w / 2 + 25; rx < piece.x + piece.w / 2; rx += 35) {
          ctx.fillRect(rx, piece.y - piece.h / 2 - 2, 3, piece.h + 4);
        }
      }

      // Label below if in tray
      if (!piece.placed) {
        ctx.fillStyle = '#ffd54f';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(piece.name, piece.x, piece.y + piece.h / 2 + 16);
      }
      ctx.restore();
    });

    // Completion Banner
    if (this.completed) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 200, 83, 0.95)';
      ctx.beginPath();
      ctx.roundRect(440, 280, 400, 80, 12);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MANDAPAM FRAME COMPLETE! ✨', 640, 328);
      ctx.restore();
    }

    ctx.restore();
  }
}
