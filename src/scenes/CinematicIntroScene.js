/**
 * CinematicIntroScene - Opening cutscene
 * Slow camera traversal across the festival street revealing the unfinished mandapam.
 */

import { audioManager } from '../audio/AudioManager.js';

export class CinematicIntroScene {
  constructor(game) {
    this.game = game;
    this.timer = 0;
    this.duration = 7.5; // seconds
    this.camStartX = 200;
    this.camEndX = 1400; // empty mandapam position
  }

  enter() {
    this.timer = 0;
    this.game.camera.setBounds(0, 3200, 0, 720);
    this.game.camera.isScripted = true;
    this.game.camera.x = this.camStartX;
    this.game.camera.y = 500;
    this.game.dayNight.setTimeOfDay('DAY');
    audioManager.playMusicTheme('CALM');
    audioManager.playBell();
  }

  exit() {
    this.game.camera.releaseScripted();
  }

  update(dt, input) {
    this.timer += dt;
    this.game.dayNight.update(dt);
    this.game.particles.update(dt);

    const t = Math.min(1.0, this.timer / (this.duration - 1.5));
    // Smooth easeInOut
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    this.game.camera.x = this.camStartX + (this.camEndX - this.camStartX) * ease;

    // Skip on click or key press (with 0.2s debounce so initial click doesn't skip)
    if (this.timer > 0.2 && (input.interactPressed || input.mouse.justPressed || this.timer >= this.duration)) {
      this.game.sceneManager.changeScene('street');
    }
  }

  render(ctx) {
    const vw = this.game.virtualWidth;
    const vh = this.game.virtualHeight;

    // 1. Sky
    this.game.dayNight.renderSky(ctx, vw, vh);

    // 2. Parallax background
    this.game.parallax.renderBackground(ctx, this.game.camera);

    // 3. World Entities & Props
    this.game.camera.begin(ctx);
    this.game.parallax.renderGround(ctx, this.game.camera);

    // Temple & Houses along the street
    this.game.assetRegistry.draw(ctx, 'TEMPLE_SPRITE', 1800, 540, 260, 280);
    this.game.assetRegistry.draw(ctx, 'HOUSE_SPRITE', 500, 540, 220, 200, '1');
    this.game.assetRegistry.draw(ctx, 'HOUSE_SPRITE', 950, 540, 220, 200, '2');

    // Generator
    this.game.assetRegistry.draw(ctx, 'GENERATOR_SPRITE', 2100, 540, 70, 55, 'off');

    // NPCs along street
    this.game.assetRegistry.draw(ctx, 'FLOWER_SELLER_SPRITE', 650, 540, 50, 70, 'idle', 1, this.timer);
    this.game.assetRegistry.draw(ctx, 'UNCLE_SPRITE', 1050, 540, 52, 74, 'idle', -1, this.timer);
    this.game.assetRegistry.draw(ctx, 'ELECTRICIAN_SPRITE', 2160, 540, 50, 72, 'idle', -1, this.timer);

    // Empty Mandapam foundation
    this.game.assetRegistry.draw(ctx, 'MANDAPAM_SPRITE', 1400, 540, 280, 240, 'empty', 1, this.timer, false);

    // Player waiting at start of street
    this.game.assetRegistry.draw(ctx, 'PLAYER_SPRITE', 220, 540, 48, 72, 'idle', 1, this.timer);

    this.game.camera.end(ctx);

    // 4. Foreground Parallax
    this.game.parallax.renderForeground(ctx, this.game.camera);

    // 5. Cinematic Letterbox & Narrative Quote
    ctx.save();
    // Top & Bottom Cinematic Black Bars
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, vw, 70);
    ctx.fillRect(0, vh - 70, vw, 70);

    // Narrative Text
    if (this.timer > 2.0) {
      const alpha = Math.min(1.0, (this.timer - 2.0) * 1.2);
      ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      ctx.font = 'italic 22px serif';
      ctx.textAlign = 'center';
      ctx.fillText('"Every celebration begins with a little work."', vw / 2, vh - 25);
    }

    // Skip prompt top right
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Press [E] or Click to Skip ▶', vw - 30, 42);

    ctx.restore();
  }
}
