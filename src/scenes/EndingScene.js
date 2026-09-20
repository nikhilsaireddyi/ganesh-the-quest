/**
 * EndingScene - Final End Screen
 * Celebrates the completion of the festival quest with blessings and replay options.
 */

import { audioManager } from '../audio/AudioManager.js';
import { SaveSystem } from '../core/SaveSystem.js';

export class EndingScene {
  constructor(game) {
    this.game = game;
    this.animTime = 0;
  }

  enter() {
    this.animTime = 0;
    audioManager.playMusicTheme('CALM');
    audioManager.playSuccess();
  }

  exit() {}

  update(dt, input) {
    this.animTime += dt;
    this.game.dayNight.update(dt);
    this.game.particles.update(dt);

    if (Math.random() < 0.2) {
      this.game.particles.emitPetals(Math.random() * this.game.virtualWidth, 20, 2);
    }

    const mouse = input.mouse;
    const cx = this.game.virtualWidth / 2;
    if (mouse.justPressed) {
      // PLAY AGAIN BUTTON (cx - 220 to cx - 20, y: 490 to 545)
      if (mouse.x >= cx - 220 && mouse.x <= cx - 20 && mouse.y >= 490 && mouse.y <= 545) {
        audioManager.playSuccess();
        SaveSystem.reset();
        window.location.reload();
      }
      // CREDITS BUTTON (cx + 20 to cx + 220, y: 490 to 545)
      else if (mouse.x >= cx + 20 && mouse.x <= cx + 220 && mouse.y >= 490 && mouse.y <= 545) {
        audioManager.playSnap();
        this.game.ui.showCredits = true;
      }
    }
  }

  render(ctx) {
    const vw = this.game.virtualWidth;
    const vh = this.game.virtualHeight;
    const cx = vw / 2;

    // 1. Serene Twilight Night Sky
    this.game.dayNight.renderSky(ctx, vw, vh);

    // 2. Divine Aura Background
    ctx.save();
    const glow = Math.sin(this.animTime * 2) * 15 + 60;
    const grad = ctx.createRadialGradient(cx, 220, 20, cx, 220, glow * 2.5);
    grad.addColorStop(0, 'rgba(255, 215, 0, 0.45)');
    grad.addColorStop(0.7, 'rgba(255, 143, 0, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, 220, glow * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Golden Silhouette Ganesha
    this.game.assetRegistry.draw(
      ctx,
      'GANESHA_SPRITE',
      cx,
      310,
      130,
      170,
      'complete',
      1,
      this.animTime,
      5
    );
    ctx.restore();

    // 4. Particles
    this.game.particles.render(ctx);

    // 5. Ending Card & Typography
    ctx.save();
    ctx.fillStyle = 'rgba(10, 14, 26, 0.65)';
    ctx.fillRect(0, 0, vw, vh);

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, vw - 80, vh - 80);

    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 18;
    ctx.font = 'bold 48px serif';
    ctx.textAlign = 'center';
    ctx.fillText('GANESH: THE QUEST', cx, 130);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('Ganpati Bappa Morya! 🙏', cx, 185);

    ctx.fillStyle = '#cfd8dc';
    ctx.font = 'italic 18px sans-serif';
    ctx.fillText('May wisdom, prosperity, and joy accompany all your journeys.', cx, 225);

    // Completion Badge
    ctx.fillStyle = 'rgba(255, 179, 0, 0.15)';
    ctx.beginPath();
    ctx.roundRect(cx - 180, 360, 360, 70, 12);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#00e676';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('✓ QUEST COMPLETED WITH DEVOTION', cx, 392);
    ctx.fillStyle = '#cfd8dc';
    ctx.font = '13px sans-serif';
    ctx.fillText('All 10 Festival Milestones Achieved', cx, 415);

    // Team VIBΞX Credit
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('⚡ Crafted with Devotion by Team VIBΞX ⚡', cx, 460);

    // Buttons: PLAY AGAIN & CREDITS
    // Button 1: PLAY AGAIN
    ctx.fillStyle = '#e65100';
    ctx.beginPath();
    ctx.roundRect(cx - 220, 490, 200, 55, 10);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('PLAY AGAIN', cx - 120, 524);

    // Button 2: CREDITS
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.roundRect(cx + 20, 490, 200, 55, 10);
    ctx.fill();
    ctx.strokeStyle = '#78909c';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('CREDITS', cx + 120, 524);

    ctx.restore();

    this.game.ui.renderModals(ctx);
  }
}
