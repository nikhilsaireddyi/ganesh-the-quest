/**
 * VisarjanScene - The Sacred Water Immersion
 * Calm, emotional ceremony at the water ghat.
 * Gentle submergence of Lord Ganesha with floating flowers, ripples, and moonlight reflections.
 */

import { Player } from '../entities/Player.js';
import { audioManager } from '../audio/AudioManager.js';

export class VisarjanScene {
  constructor(game) {
    this.game = game;
    this.player = new Player(320, 540);
    this.animTime = 0;
    this.stageTimer = 0;
    this.submergeY = 480; // Starting idol position on boat/shore
  }

  enter() {
    this.animTime = 0;
    this.stageTimer = 0;
    this.submergeY = 480;
    this.player.x = 280;
    this.player.facing = 1;
    this.player.canMove = false;

    this.game.camera.setBounds(0, 1600, 0, 720);
    this.game.camera.isScripted = true;
    this.game.camera.x = 520;
    this.game.camera.y = 480;
    this.game.camera.setZoom(1.15);

    this.game.dayNight.setTimeOfDay('NIGHT');
    audioManager.playMusicTheme('VISARJAN');
    audioManager.playBell();
  }

  exit() {
    this.game.camera.releaseScripted();
  }

  update(dt) {
    this.animTime += dt;
    this.stageTimer += dt;
    this.game.dayNight.update(dt);
    this.game.particles.update(dt);

    // Idol gradually moves toward water and gently lowers
    if (this.stageTimer > 3.0 && this.stageTimer < 11.0) {
      this.submergeY += 14 * dt;

      // Gentle water ripple emission
      if (Math.random() < 0.25) {
        this.game.particles.emitWaterRipple(640 + (Math.random() - 0.5) * 60, 560);
        audioManager.playWaterRipple();
      }

      // Floating marigold flowers on water surface
      if (Math.random() < 0.1) {
        this.game.particles.emitPetals(640 + (Math.random() - 0.5) * 120, 555, 1);
      }
    }

    // After submergence, soft divine aura rising from water
    if (this.stageTimer > 11.0 && this.stageTimer < 16.0) {
      if (Math.random() < 0.2) {
        this.game.particles.emitDivineAura(640 + (Math.random() - 0.5) * 80, 540, 2);
      }
    }

    // Transition to EndingScene after final cinematic text
    if (this.stageTimer > 18.0) {
      this.game.sceneManager.changeScene('ending');
    }
  }

  render(ctx) {
    // 1. Night Sky & Full Moon
    this.game.dayNight.renderSky(ctx, 1280, 720);

    // 2. Parallax distant ghat lamps
    ctx.save();
    ctx.fillStyle = '#102027';
    ctx.fillRect(0, 420, 1280, 80);
    // Distant oil diyas on opposite bank
    for (let dx = 40; dx < 1280; dx += 90) {
      ctx.fillStyle = '#ffb300';
      ctx.beginPath();
      ctx.arc(dx, 480, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. Sacred River / Lake Waters (y: 500 to 720)
    ctx.save();
    const waterGrad = ctx.createLinearGradient(0, 500, 0, 720);
    waterGrad.addColorStop(0, '#0d47a1');
    waterGrad.addColorStop(0.5, '#01579b');
    waterGrad.addColorStop(1, '#002f6c');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, 500, 1280, 220);

    // Moonlight reflection shimmer on water
    const moonX = 980;
    const waveShift = Math.sin(this.animTime * 2) * 15;
    ctx.fillStyle = 'rgba(255, 249, 196, 0.15)';
    ctx.beginPath();
    ctx.moveTo(moonX - 50, 500);
    ctx.lineTo(moonX + 50, 500);
    ctx.lineTo(moonX + 160 + waveShift, 720);
    ctx.lineTo(moonX - 160 + waveShift, 720);
    ctx.closePath();
    ctx.fill();

    // Stone Ghat Steps on Left Shore (y: 470 to 720)
    ctx.fillStyle = '#455a64';
    ctx.beginPath();
    ctx.moveTo(0, 470);
    ctx.lineTo(440, 520);
    ctx.lineTo(400, 720);
    ctx.lineTo(0, 720);
    ctx.closePath();
    ctx.fill();

    // Steps lines
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 3;
    for (let sy = 490; sy < 720; sy += 30) {
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(430, sy);
      ctx.stroke();
    }

    // Diya on ghat step
    ctx.fillStyle = '#ff6f00';
    ctx.beginPath();
    ctx.arc(410, 516, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(410, 513, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 4. World Entities in Camera View
    this.game.camera.begin(ctx);

    // Player with folded hands praying by the ghat edge
    this.player.render(ctx);

    // Ganesha Idol entering the water
    if (this.stageTimer < 14.0) {
      ctx.save();
      // Clip mask so the idol disappears beneath the water level
      ctx.beginPath();
      ctx.rect(480, 0, 320, 560);
      ctx.clip();

      this.game.assetRegistry.draw(
        ctx,
        'GANESHA_SPRITE',
        640,
        this.submergeY,
        130,
        170,
        'complete',
        1,
        this.animTime,
        5
      );
      ctx.restore();
    }

    // Water particles & floating blossoms
    this.game.particles.render(ctx);

    this.game.camera.end(ctx);

    // 5. Lighting Pass
    this.game.lighting.clear();
    this.game.lighting.addLight(640, 530, 180, 'rgba(255, 215, 0, 0.35)', 0.8);
    this.game.lighting.render(ctx, this.game.camera, 0.75);

    // 6. Final Narrative Quote & Peaceful Silence
    ctx.save();
    if (this.stageTimer > 12.0) {
      const alpha = Math.min(1.0, (this.stageTimer - 12.0) * 0.8);
      // Dark vignette fade
      ctx.fillStyle = `rgba(10, 14, 26, ${alpha * 0.85})`;
      ctx.fillRect(0, 0, 1280, 720);

      // Poetic parting quote
      ctx.fillStyle = `rgba(255, 236, 179, ${alpha})`;
      ctx.font = 'italic 26px serif';
      ctx.textAlign = 'center';
      ctx.fillText('"Every goodbye carries the promise of another beginning."', 640, 340);

      ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.85})`;
      ctx.font = '20px sans-serif';
      ctx.fillText('Pudhchya varshi lavkar ya 🙏', 640, 395);
    }
    ctx.restore();
  }
}
