/**
 * TitleScene - Title Screen
 * Displays GANESH: THE QUEST with floating petals, divine glow,
 * and Play, Settings, Credits options.
 */

import { audioManager } from '../audio/AudioManager.js';

export class TitleScene {
  constructor(game) {
    this.game = game;
    this.animTime = 0;
  }

  enter() {
    this.animTime = 0;
    audioManager.playMusicTheme('CALM');

    // Ensure all gameplay modals and photo mode are closed on title screen
    if (this.game) {
      if (this.game.photoMode) {
        this.game.photoMode.active = false;
        this.game.photoMode.showScrapbook = false;
      }
      if (this.game.wardrobe) this.game.wardrobe.showModal = false;
      if (this.game.achievements) this.game.achievements.showModal = false;
      if (this.game.ui) {
        this.game.ui.isPaused = false;
      }
    }
  }

  exit() {}

  update(dt, input) {
    this.animTime += dt;
    this.game.dayNight.update(dt);
    this.game.particles.update(dt);

    // Continuous subtle floating petals
    if (Math.random() < 0.2) {
      this.game.particles.emitPetals(Math.random() * this.game.virtualWidth, -20, 2);
    }

    // CRITICAL: Block all Main Menu clicks when a modal (Credits / Settings) is active!
    if (this.game && this.game.ui && (this.game.ui.showCredits || this.game.ui.showSettings)) {
      return;
    }

    const mouse = input.mouse;
    const cx = this.game.virtualWidth / 2;
    if (mouse.justPressed) {
      audioManager.resume();

      // Check Buttons:
      // PLAY (x: cx - 120 to cx + 120, y: 440 to 495)
      if (mouse.x >= cx - 120 && mouse.x <= cx + 120 && mouse.y >= 440 && mouse.y <= 495) {
        audioManager.playSuccess();
        this.game.sceneManager.changeScene('intro');
      }
      // SETTINGS (x: cx - 120 to cx + 120, y: 515 to 565)
      else if (mouse.x >= cx - 120 && mouse.x <= cx + 120 && mouse.y >= 515 && mouse.y <= 565) {
        audioManager.playSnap();
        this.game.ui.showSettings = true;
      }
      // CREDITS (x: cx - 120 to cx + 120, y: 585 to 635)
      else if (mouse.x >= cx - 120 && mouse.x <= cx + 120 && mouse.y >= 585 && mouse.y <= 635) {
        audioManager.playSnap();
        this.game.ui.showCredits = true;
      }
    }
  }

  render(ctx) {
    const vw = this.game.virtualWidth;
    const vh = this.game.virtualHeight;
    const cx = vw / 2;

    // 1. Sky & Sun/Moon
    this.game.dayNight.renderSky(ctx, vw, vh);

    // 2. Parallax background silhouettes
    this.game.parallax.renderBackground(ctx, { x: this.animTime * 15, viewportWidth: vw });

    // 3. Ground
    this.game.parallax.renderGround(ctx, { x: 0 });

    // 4. Subtle center Ganesha silhouette with glowing aura
    ctx.save();
    const glow = Math.sin(this.animTime * 2) * 20 + 70;
    const grad = ctx.createRadialGradient(cx, 240, 30, cx, 240, glow * 2);
    grad.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
    grad.addColorStop(0.7, 'rgba(255, 143, 0, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, 240, glow * 2, 0, Math.PI * 2);
    ctx.fill();

    this.game.assetRegistry.draw(
      ctx,
      'GANESHA_SPRITE',
      cx,
      350,
      140,
      180,
      'complete',
      1,
      this.animTime,
      5
    );
    ctx.restore();

    // 5. Particles
    this.game.particles.render(ctx);

    // 6. Title Typography & Card
    ctx.save();
    ctx.fillStyle = 'rgba(10, 14, 26, 0.65)';
    ctx.fillRect(0, 0, vw, vh);

    // Gold decorative border motifs
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, vw - 60, vh - 60);
    ctx.strokeRect(36, 36, vw - 72, vh - 72);

    // Main Title
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 18;
    ctx.font = 'bold 52px serif';
    ctx.textAlign = 'center';
    ctx.fillText('GANESH: THE QUEST', cx, 150);

    // Subtitle
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'italic 20px sans-serif';
    ctx.fillText('A Festival. A Journey. A Homecoming.', cx, 195);

    // Buttons: PLAY, SETTINGS, CREDITS
    const buttons = [
      { text: 'START QUEST', y: 440, bg: '#e65100', border: '#ffd54f' },
      { text: 'SETTINGS', y: 515, bg: '#263238', border: '#78909c' },
      { text: 'CREDITS', y: 585, bg: '#263238', border: '#78909c' }
    ];

    buttons.forEach(b => {
      ctx.fillStyle = b.bg;
      ctx.beginPath();
      ctx.roundRect(cx - 120, b.y, 240, 52, 10);
      ctx.fill();
      ctx.strokeStyle = b.border;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 17px sans-serif';
      ctx.fillText(b.text, cx, b.y + 32);
    });

    // Team VIBΞX Presentation Credit
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ Presented with Devotion by Team VIBΞX ⚡', cx, 665);

    ctx.restore();

    // 7. Modals
    this.game.ui.renderModals(ctx);
  }
}
