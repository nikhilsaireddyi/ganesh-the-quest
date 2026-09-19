/**
 * ModakCooking - Interactive Cultural Mini-game
 * Prepare sweet Ukadiche Modaks with little Ananya:
 * 1. Roll dough -> 2. Spoon sweet jaggery-coconut filling -> 3. Pinch 21 pleats -> 4. Steam to golden perfection!
 */

import { audioManager } from '../audio/AudioManager.js';

export class ModakCooking {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.active = false;
    this.completed = false;

    // Stages: 0: Roll Dough, 1: Add Sweet Filling, 2: Pinch Pleats, 3: Steaming & Complete
    this.stage = 0;
    this.rollCount = 0;
    this.pinY = 320;
    this.isDraggingPin = false;

    this.fillingPlaced = false;
    this.isDraggingSpoon = false;
    this.spoonX = 360;
    this.spoonY = 480;

    this.pleats = [
      { angle: 0, pinched: false },
      { angle: Math.PI * 0.33, pinched: false },
      { angle: Math.PI * 0.67, pinched: false },
      { angle: Math.PI, pinched: false },
      { angle: Math.PI * 1.33, pinched: false },
      { angle: Math.PI * 1.67, pinched: false }
    ];

    this.steamTimer = 0;
    this.completionTimer = 0;
  }

  start() {
    this.active = true;
    this.completed = false;
    this.stage = 0;
    this.rollCount = 0;
    this.pinY = 300;
    this.isDraggingPin = false;
    this.fillingPlaced = false;
    this.spoonX = 360;
    this.spoonY = 480;
    this.pleats.forEach(p => p.pinched = false);
    this.steamTimer = 0;
    this.completionTimer = 0;
    audioManager.playBell();
  }

  update(dt, input, particles) {
    if (!this.active) return;

    const mouse = input && input.mouse;

    // Close button [X] (x: 1005, y: 75 with generous touch padding)
    if (mouse && mouse.justPressed && mouse.x >= 980 && mouse.x <= 1060 && mouse.y >= 55 && mouse.y <= 125) {
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

    if (this.stage === 0) {
      // Stage 0: Roll dough with rolling pin
      if (mouse.justPressed && Math.abs(mouse.x - 640) < 160 && Math.abs(mouse.y - this.pinY) < 40) {
        this.isDraggingPin = true;
      }
      if (this.isDraggingPin && mouse.isDown) {
        const prevY = this.pinY;
        this.pinY = Math.max(260, Math.min(420, mouse.y));
        if (Math.abs(this.pinY - prevY) > 20) {
          audioManager.playFootstep();
          particles.emitPetals(640 + (Math.random() - 0.5) * 80, this.pinY, 1);
        }
      }
      if (this.isDraggingPin && mouse.justReleased) {
        this.isDraggingPin = false;
        this.rollCount++;
        audioManager.playSnap();
        if (this.rollCount >= 3) {
          this.stage = 1;
          audioManager.playBell();
        }
      }
    } else if (this.stage === 1) {
      // Stage 1: Spoon coconut-jaggery filling onto center
      if (mouse.justPressed && Math.hypot(mouse.x - this.spoonX, mouse.y - this.spoonY) < 50) {
        this.isDraggingSpoon = true;
      }
      if (this.isDraggingSpoon && mouse.isDown) {
        this.spoonX = mouse.x;
        this.spoonY = mouse.y;
      }
      if (this.isDraggingSpoon && mouse.justReleased) {
        this.isDraggingSpoon = false;
        if (Math.hypot(this.spoonX - 640, this.spoonY - 340) < 65) {
          this.fillingPlaced = true;
          this.stage = 2;
          audioManager.playSuccess();
          particles.emitSparks(640, 340, 15);
        } else {
          this.spoonX = 360;
          this.spoonY = 480;
        }
      }
    } else if (this.stage === 2) {
      // Stage 2: Pinch the pleats around the rim
      if (mouse.justPressed) {
        for (const pleat of this.pleats) {
          if (!pleat.pinched) {
            const px = 640 + Math.cos(pleat.angle) * 75;
            const py = 340 + Math.sin(pleat.angle) * 75;
            if (Math.hypot(mouse.x - px, mouse.y - py) < 32) {
              pleat.pinched = true;
              audioManager.playSnap();
              particles.emitSparks(px, py, 8);
              break;
            }
          }
        }
        if (this.pleats.every(p => p.pinched)) {
          this.stage = 3;
          audioManager.playBell();
        }
      }
    } else if (this.stage === 3) {
      // Stage 3: Steaming animation & golden finish
      this.steamTimer += dt;
      if (Math.random() < 0.3) {
        particles.emitPetals(640 + (Math.random() - 0.5) * 60, 320 - this.steamTimer * 30, 2);
      }
      if (this.steamTimer >= 2.5 && !this.completed) {
        this.completed = true;
        audioManager.playSuccess();
        particles.emitDivineAura(640, 340, 30);
      }
    }
  }

  render(ctx) {
    if (!this.active) return;

    ctx.save();
    // Backdrop
    ctx.fillStyle = 'rgba(10, 14, 26, 0.9)';
    ctx.fillRect(0, 0, 1280, 720);

    // Cooking Counter Board
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(220, 60, 840, 600, 16);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Ornate Border
    ctx.strokeStyle = '#ff8f00';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(228, 68, 824, 584);

    // Close Button [X]
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(1005, 75, 40, 36, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✕', 1025, 99);

    // Title & Instructions
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MAKING SACRED UKADICHE MODAKS 🥟', 640, 110);

    const instructions = [
      'Step 1: Drag the wooden rolling pin up and down to flatten the rice flour dough.',
      'Step 2: Drag the spoon of golden coconut-jaggery filling onto the center.',
      'Step 3: Click the highlighted points around the rim to pinch the traditional pleats!',
      'Step 4: Steaming the holy modaks for Lord Ganesha...'
    ];
    ctx.fillStyle = '#e0e0e0';
    ctx.font = '16px sans-serif';
    ctx.fillText(instructions[this.stage] || '', 640, 145);

    // Marble Rolling Board (Chakla) in Center
    ctx.fillStyle = '#eceff1';
    ctx.beginPath();
    ctx.arc(640, 340, 140, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b0bec5';
    ctx.lineWidth = 4;
    ctx.stroke();

    if (this.stage === 0) {
      // Unflattened to Flattened Dough
      const doughR = 40 + this.rollCount * 25;
      ctx.fillStyle = '#fffde7';
      ctx.beginPath();
      ctx.arc(640, 340, doughR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff59d';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Wooden Rolling Pin (Belan)
      ctx.save();
      ctx.fillStyle = '#8d6e63';
      ctx.beginPath();
      ctx.roundRect(460, this.pinY - 14, 360, 28, 8);
      ctx.fill();
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(440, this.pinY - 8, 20, 16);
      ctx.fillRect(820, this.pinY - 8, 20, 16);
      ctx.restore();

      // Swipe prompt
      ctx.fillStyle = '#ffd54f';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`Roll Progress: ${this.rollCount} / 3`, 640, 520);
    } else if (this.stage === 1) {
      // Flattened Dough Disc
      ctx.fillStyle = '#fffde7';
      ctx.beginPath();
      ctx.arc(640, 340, 95, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff59d';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Center drop target zone
      ctx.strokeStyle = '#ff8f00';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(640, 340, 35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255, 143, 0, 0.15)';
      ctx.fill();

      // Sweet Filling Spoon (Draggable)
      ctx.save();
      ctx.fillStyle = '#cfd8dc';
      ctx.beginPath();
      ctx.ellipse(this.spoonX, this.spoonY, 28, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      // Handle
      ctx.fillRect(this.spoonX - 60, this.spoonY - 4, 40, 8);
      // Jaggery Coconut filling inside spoon
      ctx.fillStyle = '#ff8f00';
      ctx.beginPath();
      ctx.ellipse(this.spoonX, this.spoonY - 2, 22, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd54f'; // cardamom dots
      ctx.fillRect(this.spoonX - 4, this.spoonY - 4, 3, 3);
      ctx.fillRect(this.spoonX + 4, this.spoonY - 2, 3, 3);
      ctx.restore();

      ctx.fillStyle = '#ffd54f';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Drag the sweet spoon into the center ring!', 640, 520);
    } else if (this.stage === 2) {
      // Dough with Filling
      ctx.fillStyle = '#fffde7';
      ctx.beginPath();
      ctx.arc(640, 340, 95, 0, Math.PI * 2);
      ctx.fill();

      // Sweet Filling center
      ctx.fillStyle = '#ff8f00';
      ctx.beginPath();
      ctx.arc(640, 340, 35, 0, Math.PI * 2);
      ctx.fill();

      // Pleat pinching targets around rim
      this.pleats.forEach(p => {
        const px = 640 + Math.cos(p.angle) * 75;
        const py = 340 + Math.sin(p.angle) * 75;

        ctx.save();
        ctx.fillStyle = p.pinched ? '#00e676' : '#ff9800';
        ctx.beginPath();
        ctx.arc(px, py, p.pinched ? 10 : 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.pinched ? '✓' : '✦', px, py);
        ctx.restore();
      });

      ctx.fillStyle = '#ffd54f';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Click all highlighted points to pinch the pleats!', 640, 520);
    } else if (this.stage === 3) {
      // Traditional Steamed Modak
      ctx.save();
      const bob = Math.sin(Date.now() * 0.006) * 3;

      // Golden Brass Steamer Plate
      ctx.fillStyle = '#fbc02d';
      ctx.beginPath();
      ctx.ellipse(640, 390, 90, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sculpted Modak Body
      ctx.fillStyle = '#fffde7';
      ctx.beginPath();
      ctx.moveTo(640, 245 + bob); // pointed crown
      ctx.quadraticCurveTo(695, 330 + bob, 675, 370 + bob);
      ctx.quadraticCurveTo(640, 385 + bob, 605, 370 + bob);
      ctx.quadraticCurveTo(585, 330 + bob, 640, 245 + bob);
      ctx.fill();
      ctx.strokeStyle = '#ffe082';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pleat fold lines along crown
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 1.5;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(640, 248 + bob);
        ctx.quadraticCurveTo(640 + i * 16, 320 + bob, 640 + i * 12, 372 + bob);
        ctx.stroke();
      }

      // Saffron (Kesar) Strand on Peak
      ctx.strokeStyle = '#d50000';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(640, 245 + bob);
      ctx.lineTo(642, 235 + bob);
      ctx.stroke();

      ctx.restore();

      // Steam curls
      ctx.fillStyle = '#ffd54f';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Auspicious Modak Ready for Bappa! ✨', 640, 500);
    }

    // Success Banner
    if (this.completed) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 200, 83, 0.95)';
      ctx.beginPath();
      ctx.roundRect(420, 540, 440, 65, 12);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PRASAD COMPLETE! GANPATI BAPPA MORYA! 🙏', 640, 580);
      ctx.restore();
    }

    ctx.restore();
  }
}
