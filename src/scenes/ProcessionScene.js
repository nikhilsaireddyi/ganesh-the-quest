/**
 * ProcessionScene - Grand Festive Procession
 * Side-scrolling celebration with dancing crowd, dhol-tasha beats,
 * flower petal showers, fireworks bursts, and Day -> Sunset -> Night transition.
 */

import { Player } from '../entities/Player.js';
import { audioManager } from '../audio/AudioManager.js';
import { DholRhythmGame } from '../minigames/DholRhythmGame.js';
import { LezimDance } from '../minigames/LezimDance.js';
import { achievementSystem } from '../systems/AchievementSystem.js';

export class ProcessionScene {
  constructor(game) {
    this.game = game;
    this.player = new Player(400, 540);
    this.chariotX = 260;
    this.processionSpeed = 90; // px/sec auto-advance
    this.totalDistance = 2400;
    this.distanceTraveled = 0;
    this.animTime = 0;

    this.rhythmGame = new DholRhythmGame(() => {
      this.rhythmGamePlayed = true;
      audioManager.playSuccess();
      audioManager.playChantMorya();
      achievementSystem.unlock('procession_maestro');
    });
    this.rhythmGamePlayed = false;

    this.lezimDance = new LezimDance(() => {
      this.lezimPlayed = true;
      audioManager.playSuccess();
      audioManager.playChantMorya();
      achievementSystem.unlock('procession_maestro');
    });
    this.lezimPlayed = false;
  }

  enter() {
    this.animTime = 0;
    this.distanceTraveled = 0;
    this.chariotX = 260;
    this.player.x = 420;
    this.game.camera.setBounds(0, 5000, 0, 720);
    this.game.camera.isScripted = false;
    this.game.dayNight.setTimeOfDay('DAY');
    audioManager.playMusicTheme('PROCESSION');
  }

  exit() {}

  isMinigameActive() {
    return Boolean(
      (this.rhythmGame && this.rhythmGame.active) ||
      (this.lezimDance && this.lezimDance.active)
    );
  }

  update(dt, input) {
    if (this.rhythmGame.active) {
      this.rhythmGame.update(dt, input, this.game.particles);
      return;
    }

    if (this.lezimDance.active) {
      this.lezimDance.update(dt, input);
      return;
    }

    this.animTime += dt;
    this.distanceTraveled += this.processionSpeed * dt;
    this.chariotX += this.processionSpeed * dt;
    this.player.x += this.processionSpeed * dt;

    // Day -> Sunset -> Twilight -> Night Progression based on distance
    const progress = Math.min(1.0, this.distanceTraveled / this.totalDistance);

    // Interactive Dhol-Tasha prompt trigger
    if (!this.rhythmGamePlayed && progress > 0.25 && progress < 0.50 && (input.interactPressed || (input.mouse && input.mouse.justPressed && input.mouse.y > 600))) {
      input.interactPressed = false;
      this.rhythmGame.start();
      return;
    }

    // Interactive Lezim Folk Dance prompt trigger
    if (!this.lezimPlayed && progress > 0.52 && progress < 0.78 && (input.interactPressed || (input.keys && input.keys['KeyL']) || (input.mouse && input.mouse.justPressed && input.mouse.y > 600))) {
      input.interactPressed = false;
      if (input.keys) input.keys['KeyL'] = false;
      this.lezimDance.start();
      return;
    }
    if (progress < 0.25) {
      this.game.dayNight.setTimeOfDay('DAY');
    } else if (progress < 0.5) {
      this.game.dayNight.setTimeOfDay('SUNSET');
    } else if (progress < 0.75) {
      this.game.dayNight.setTimeOfDay('TWILIGHT');
    } else {
      this.game.dayNight.setTimeOfDay('NIGHT');
    }

    this.game.dayNight.update(dt);
    this.game.particles.update(dt);

    // Continuous festive petal showers
    if (Math.random() < 0.3) {
      this.game.particles.emitPetals(this.player.x + (Math.random() - 0.5) * 600, 80, 5);
    }

    // Fireworks bursts during night phase
    if (progress > 0.65 && Math.random() < 0.035) {
      const fx = this.game.camera.x + (Math.random() - 0.5) * 800;
      const fy = 120 + Math.random() * 160;
      this.game.particles.emitFireworks(fx, fy);
      audioManager.playFirework();
      this.game.camera.shake(6, 0.25);
    }

    // Camera follows slightly ahead of chariot
    this.game.camera.targetX = this.chariotX + 180;
    this.game.camera.targetY = 480;

    // Player can move slightly left/right for exploration
    const moveX = input.axisX;
    this.player.x += moveX * 120 * dt;

    // Transition to Visarjan when procession reaches the river ghat
    if (this.distanceTraveled >= this.totalDistance) {
      this.game.sceneManager.changeScene('visarjan');
    }
  }

  render(ctx) {
    // 1. Sky & Celestial
    this.game.dayNight.renderSky(ctx, 1280, 720);

    // 2. Parallax background
    this.game.parallax.renderBackground(ctx, this.game.camera);

    // 3. World Entities (In Camera Coordinates)
    this.game.camera.begin(ctx);

    // Ground
    this.game.parallax.renderGround(ctx, this.game.camera);

    // Dancing crowd members in background of street
    const crowdSpacing = 160;
    const startIdx = Math.floor((this.game.camera.x - 800) / crowdSpacing);
    const endIdx = Math.ceil((this.game.camera.x + 800) / crowdSpacing);

    for (let i = startIdx; i <= endIdx; i++) {
      const cx = i * crowdSpacing;
      const jump = Math.abs(Math.sin(this.animTime * 6 + i)) * 14;
      ctx.save();
      // Devotee silhouette with saffron scarf
      ctx.fillStyle = i % 2 === 0 ? '#ff8f00' : '#d84315';
      ctx.beginPath();
      ctx.roundRect(cx - 10, 520 - jump - 45, 20, 30, 4);
      ctx.fill();

      // Head
      ctx.fillStyle = '#d7996c';
      ctx.beginPath();
      ctx.arc(cx, 520 - jump - 54, 8, 0, Math.PI * 2);
      ctx.fill();

      // Raised arms
      ctx.strokeStyle = '#ff8f00';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 8, 520 - jump - 40);
      ctx.lineTo(cx - 14, 520 - jump - 64);
      ctx.moveTo(cx + 8, 520 - jump - 40);
      ctx.lineTo(cx + 14, 520 - jump - 64);
      ctx.stroke();

      ctx.restore();
    }

    // Procession Chariot with Ganesha Mounted
    this.game.assetRegistry.draw(ctx, 'VEHICLE_SPRITE', this.chariotX, 540, 180, 120);
    this.game.assetRegistry.draw(
      ctx,
      'GANESHA_SPRITE',
      this.chariotX,
      485,
      130,
      170,
      'complete',
      1,
      this.animTime,
      5
    );

    // Player walking alongside chariot
    this.player.render(ctx);

    // Particles (petals, fireworks, divine aura)
    this.game.particles.render(ctx);

    this.game.camera.end(ctx);

    // 4. Foreground Parallax Bunting & Torans
    this.game.parallax.renderForeground(ctx, this.game.camera);

    // 5. Lighting Pass (Chariot diyas and night glow)
    this.game.lighting.clear();
    const isNight = this.game.dayNight.isNight();
    const ambientDark = this.game.dayNight.getAmbientDarkness();
    if (isNight || ambientDark > 0.15) {
      this.game.lighting.addLight(this.chariotX, 470, 160, 'rgba(255, 215, 64, 0.25)', 0.65);
    }
    this.game.lighting.render(ctx, this.game.camera, ambientDark);

    // 6. HUD / Festival Progress Overlay
    ctx.save();
    // Top banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(460, 20, 360, 60, 12);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffb300';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GRAND PROCESSION', 640, 44);

    const percent = Math.floor((this.distanceTraveled / this.totalDistance) * 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Approaching Sacred Ghat: ${percent}%`, 640, 66);

    // Dhol Rhythm prompt
    if (!this.rhythmGamePlayed && !this.rhythmGame.active && percent > 25 && percent < 50) {
      const pulse = Math.sin(Date.now() * 0.008) * 3;
      ctx.fillStyle = '#ff6d00';
      ctx.beginPath();
      ctx.roundRect(470, 630 + pulse, 340, 46, 23);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🥁 PLAY DHOL-TASHA BEATS [E]', 640, 658 + pulse);
    }

    // Lezim Dance prompt
    if (!this.lezimPlayed && !this.lezimDance.active && percent >= 52 && percent < 78) {
      const pulse = Math.sin(Date.now() * 0.008) * 3;
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(470, 630 + pulse, 340, 46, 23);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔔 DANCE LEZIM FOLK DANCE [E] / [L]', 640, 658 + pulse);
    }

    ctx.restore();

    // Render Dhol Rhythm Game
    this.rhythmGame.render(ctx);

    // Render Lezim Dance Game
    this.lezimDance.render(ctx);

    this.game.ui.renderModals(ctx);
  }
}
