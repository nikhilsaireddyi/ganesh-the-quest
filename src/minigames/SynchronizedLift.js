/**
 * SynchronizedLift - Mission 8 Mini-game
 * Timing-based group cooperation: 3... 2... 1... LIFT!
 * Requires pressing interact or spacebar in the golden timing window.
 */

import { audioManager } from '../audio/AudioManager.js';

export class SynchronizedLift {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.active = false;
    this.completed = false;
    this.countdown = 3.9; // 3, 2, 1, LIFT
    this.ringScale = 2.5;
    this.liftSuccess = false;
    this.completionTimer = 0;
  }

  start() {
    this.active = true;
    this.completed = false;
    this.liftSuccess = false;
    this.countdown = 3.9;
    this.ringScale = 2.5;
    this.completionTimer = 0;
  }

  update(dt, input, particles, camera) {
    if (!this.active) return;

    if (this.completed) {
      this.completionTimer += dt;
      if (this.completionTimer > 2.0) {
        this.active = false;
        if (this.onComplete) this.onComplete();
      }
      return;
    }

    this.countdown -= dt;

    // Ring contracts toward 1.0 during countdown
    if (this.countdown > 0) {
      this.ringScale = 1.0 + (this.countdown / 3.9) * 1.5;
    }

    // Check for user press during the LIFT zone (when countdown <= 0.4 and >= -0.6)
    const canPress = this.countdown <= 0.4 && this.countdown >= -0.6;
    const pressed = input.interactPressed || input.mouse.justPressed || (input.keys && input.keys['Space']);

    if (pressed) {
      if (canPress || this.countdown <= 0) {
        // Successful Lift!
        this.liftSuccess = true;
        this.completed = true;
        audioManager.playSuccess();
        audioManager.playDhol();
        camera.shake(18, 0.8);
        particles.emitDivineAura(640, 360, 40);
        particles.emitPetals(640, 320, 30);
      } else {
        // Pressed too early: reset countdown slightly with friendly feedback
        audioManager.playSpark();
        this.countdown = 3.5;
      }
    }

    // Auto-succeed if timer runs slightly past so player is never stuck
    if (this.countdown < -0.8 && !this.completed) {
      this.liftSuccess = true;
      this.completed = true;
      audioManager.playSuccess();
      audioManager.playDhol();
      camera.shake(15, 0.6);
      particles.emitDivineAura(640, 360, 30);
    }
  }

  render(ctx) {
    if (!this.active) return;

    ctx.save();
    // Modal Overlay
    ctx.fillStyle = 'rgba(10, 14, 26, 0.85)';
    ctx.fillRect(0, 0, 1280, 720);

    // Title Card
    ctx.fillStyle = '#ffb300';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SYNCHRONIZED LIFT', 640, 130);

    ctx.fillStyle = '#cfd8dc';
    ctx.font = '18px sans-serif';
    ctx.fillText('Devotees gather around the chariot. Prepare to lift together!', 640, 170);

    // Countdown Display
    let promptText = 'READY?';
    let promptColor = '#ffffff';

    if (this.countdown > 2.0) {
      promptText = '3';
      promptColor = '#ffb300';
    } else if (this.countdown > 1.0) {
      promptText = '2';
      promptColor = '#ff9100';
    } else if (this.countdown > 0.0) {
      promptText = '1';
      promptColor = '#ff3d00';
    } else {
      promptText = 'LIFT NOW!';
      promptColor = '#00e676';
    }

    // Central Timing Target Circle
    const cx = 640;
    const cy = 360;
    const targetRadius = 60;

    // Target Golden Ring
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, targetRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Shrinking Countdown Ring
    if (this.countdown > 0) {
      ctx.strokeStyle = 'rgba(0, 230, 118, 0.8)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, targetRadius * this.ringScale, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Big Center Number / Text
    ctx.fillStyle = promptColor;
    ctx.font = 'bold 54px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(promptText, cx, cy);

    // Instruction Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.roundRect(460, 480, 360, 56, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.stroke();

    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 16px sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('TAP SCREEN / PRESS [E] ON "LIFT!"', 640, 514);

    // Success Shout Banner
    if (this.completed) {
      ctx.fillStyle = 'rgba(255, 143, 0, 0.95)';
      ctx.beginPath();
      ctx.roundRect(360, 270, 560, 110, 16);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('GANPATI BAPPA MORYA! 🙏', 640, 325);
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#fff9c4';
      ctx.fillText('The palanquin rises with thunderous devotion!', 640, 360);
    }

    ctx.restore();
  }
}
