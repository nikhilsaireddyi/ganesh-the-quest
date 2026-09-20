/**
 * AartiRitual - Interactive Cultural Mini-game
 * Perform the sacred Maha Aarti for Lord Ganesha:
 * 1. Move brass thali in clockwise circles around Ganesha (3 complete pradakshinas)
 * 2. Ring the auspicious temple bell in cadence
 * Generates golden light rings, camphor flame trails, and flower showers.
 */

import { audioManager } from '../audio/AudioManager.js';

export class AartiRitual {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.active = false;
    this.completed = false;

    this.thaliAngle = -Math.PI / 2;
    this.rotationsCompleted = 0;
    this.targetRotations = 3;
    this.lastAngle = -Math.PI / 2;

    this.bellRings = 0;
    this.targetBells = 5;

    this.auraRadius = 60;
    this.completionTimer = 0;
  }

  start() {
    this.active = true;
    this.completed = false;
    this.thaliAngle = -Math.PI / 2;
    this.rotationsCompleted = 0;
    this.lastAngle = -Math.PI / 2;
    this.bellRings = 0;
    this.completionTimer = 0;
    audioManager.playBell();
    audioManager.playMusicTheme('FESTIVAL');
  }

  update(dt, input, particles) {
    if (!this.active) return;

    const mouse = input && input.mouse;

    // Close button [X] (x: 1200, y: 30 with generous touch padding)
    if (mouse && mouse.justPressed && mouse.x >= 1180 && mouse.x <= 1255 && mouse.y >= 15 && mouse.y <= 80) {
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

    const centerX = 640;
    const centerY = 340;

    // 1. Circular mouse / touch tracking for Aarti Thali rotation
    if (mouse.isDown) {
      const dx = mouse.x - centerX;
      const dy = mouse.y - centerY;
      const currentAngle = Math.atan2(dy, dx);

      // Check clockwise rotation delta
      let delta = currentAngle - this.lastAngle;
      if (delta < -Math.PI) delta += Math.PI * 2;
      if (delta > Math.PI) delta -= Math.PI * 2;

      // Only count clockwise movement (> 0)
      if (delta > 0 && delta < 1.0) {
        this.thaliAngle += delta;
        const totalRot = (this.thaliAngle + Math.PI / 2) / (Math.PI * 2);
        this.rotationsCompleted = Math.max(this.rotationsCompleted, totalRot);

        // Emit flame spark particles along circle
        const tx = centerX + Math.cos(this.thaliAngle) * 160;
        const ty = centerY + Math.sin(this.thaliAngle) * 160;
        if (Math.random() < 0.4) {
          particles.emitSparks(tx, ty, 3);
        }
      }
      this.lastAngle = currentAngle;
    }

    // 2. Ring Temple Bell (Space, E, or click Bell button)
    const ringBell = input.interactPressed || (mouse.justPressed && mouse.x > 840 && mouse.y > 520);
    if (ringBell) {
      input.interactPressed = false;
      this.bellRings++;
      audioManager.playBell();
      particles.emitDivineAura(centerX, centerY - 60, 15);
      particles.emitPetals(centerX + (Math.random() - 0.5) * 200, 150, 4);
    }

    // 3. Continuous holy petals
    if (Math.random() < 0.15) {
      particles.emitPetals(centerX + (Math.random() - 0.5) * 300, 120, 2);
    }

    // 4. Check Victory Conditions
    if (this.rotationsCompleted >= this.targetRotations && this.bellRings >= this.targetBells && !this.completed) {
      this.completed = true;
      audioManager.playSuccess();
      audioManager.playChantMorya();
      particles.emitDivineAura(centerX, centerY, 50);
      particles.emitPetals(centerX, 200, 40);
    }
  }

  render(ctx) {
    if (!this.active) return;

    ctx.save();
    // Dark Sacred Mandapam Sanctuary Backdrop
    ctx.fillStyle = 'rgba(10, 14, 26, 0.94)';
    ctx.fillRect(0, 0, 1280, 720);

    const cx = 640;
    const cy = 340;

    // Golden Halo / Concentric Mandalas behind Ganesha
    const rot = Date.now() * 0.001;
    ctx.save();
    ctx.translate(cx, cy - 20);
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 130, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 16; i++) {
      const a = rot + (i * Math.PI) / 8;
      ctx.fillStyle = 'rgba(255, 179, 0, 0.18)';
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 130, Math.sin(a) * 130, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Sacred Ganesha Altar Base
    ctx.fillStyle = '#b71c1c';
    ctx.beginPath();
    ctx.roundRect(cx - 160, cy + 80, 320, 45, 10);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Ganesha Idol Silhouette / Body with Aura
    ctx.save();
    const auraGlow = ctx.createRadialGradient(cx, cy - 30, 30, cx, cy - 30, 110);
    auraGlow.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
    auraGlow.addColorStop(0.6, 'rgba(255, 111, 0, 0.2)');
    auraGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGlow;
    ctx.beginPath();
    ctx.arc(cx, cy - 30, 110, 0, Math.PI * 2);
    ctx.fill();

    // Sacred Diya Lamps at corners
    const diyaPositions = [cx - 130, cx - 70, cx + 70, cx + 130];
    diyaPositions.forEach(dx => {
      ctx.fillStyle = '#ff8f00';
      ctx.beginPath();
      ctx.ellipse(dx, cy + 78, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.arc(dx, cy + 68 + Math.sin(Date.now() * 0.02) * 2, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Close Button [X]
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(1200, 30, 44, 38, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✕', 1222, 55);

    // Title & Instructions Header
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 28px serif';
    ctx.textAlign = 'center';
    ctx.fillText('MAHA AARTI RITUAL 🙏', cx, 65);

    ctx.fillStyle = '#ffecb3';
    ctx.font = '16px sans-serif';
    ctx.fillText('Rotate the lit Brass Thali clockwise around Bappa, and ring the Sacred Bell!', cx, 98);

    // Circular Rotation Guide Ring
    ctx.strokeStyle = 'rgba(255, 179, 0, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(cx, cy, 160, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Aarti Brass Thali with Camphor Flame
    const thaliX = cx + Math.cos(this.thaliAngle) * 160;
    const thaliY = cy + Math.sin(this.thaliAngle) * 160;

    ctx.save();
    // Brass Plate Rim
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(thaliX, thaliY, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff8f00';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Red Vermilion (Kumkum) Ring inside Thali
    ctx.fillStyle = '#c62828';
    ctx.beginPath();
    ctx.arc(thaliX, thaliY, 20, 0, Math.PI * 2);
    ctx.fill();

    // Marigold Petals on Thali
    ctx.fillStyle = '#ff9800';
    for (let i = 0; i < 6; i++) {
      const pa = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.arc(thaliX + Math.cos(pa) * 13, thaliY + Math.sin(pa) * 13, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Camphor Lamp in Center with Dancing Golden Flame
    const flameFlicker = Math.sin(Date.now() * 0.03) * 3;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(thaliX, thaliY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Golden flame
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.moveTo(thaliX - 6, thaliY);
    ctx.quadraticCurveTo(thaliX, thaliY - 18 + flameFlicker, thaliX, thaliY - 22 + flameFlicker);
    ctx.quadraticCurveTo(thaliX, thaliY - 18 + flameFlicker, thaliX + 6, thaliY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Directional Clockwise Indicator
    ctx.save();
    const arrowAngle = this.thaliAngle + 0.35;
    const ax = cx + Math.cos(arrowAngle) * 160;
    const ay = cy + Math.sin(arrowAngle) * 160;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(ax, ay, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Bottom HUD: Rotation Meter & Bell Ring Button
    // 1. Rotation Meter
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(160, 570, 360, 60, 10);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Clockwise Pradakshina: ${Math.min(3, Math.floor(this.rotationsCompleted))} / 3 Rounds`, 180, 595);

    // Progress bar
    ctx.fillStyle = '#37474f';
    ctx.fillRect(180, 605, 320, 12);
    ctx.fillStyle = '#ffb300';
    ctx.fillRect(180, 605, Math.min(1, this.rotationsCompleted / 3) * 320, 12);

    // 2. Bell Ring Button
    ctx.fillStyle = '#d84315';
    ctx.beginPath();
    ctx.roundRect(760, 570, 360, 60, 10);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🔔 RING TEMPLE BELL [SPACE] (${this.bellRings} / ${this.targetBells})`, 940, 605);

    // Blessing Banner on Completion
    if (this.completed) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 200, 83, 0.95)';
      const line1 = 'AARTI COMPLETE! ✨🙏';
      const line2 = '"May Lord Ganesha remove all obstacles from your path!"';
      ctx.font = 'bold 24px sans-serif';
      const w1 = ctx.measureText(line1).width;
      ctx.font = 'italic 16px sans-serif';
      const w2 = ctx.measureText(line2).width;
      const boxW = Math.max(600, Math.max(w1, w2) + 100);
      const boxX = 640 - boxW / 2;

      ctx.beginPath();
      ctx.roundRect(boxX, 275, boxW, 100, 16);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(line1, 640, 318);

      ctx.fillStyle = '#ffecb3';
      ctx.font = 'italic 16px sans-serif';
      ctx.fillText(line2, 640, 352);
      ctx.restore();
    }

    ctx.restore();
  }
}
