/**
 * Mandapam - The sacred festival pavilion
 * Evolves visually from empty ground -> bamboo frame -> decorated -> lit up with lights.
 */

import { assetRegistry } from '../assets/AssetRegistry.js';

export class Mandapam {
  constructor(x = 1400, y = 540) {
    this.x = x;
    this.y = y;
    this.state = 'empty'; // 'empty' | 'bamboo' | 'decorated'
    this.isLit = false;
    this.animTime = 0;
    this.isNearPlayer = false;
  }

  update(dt, playerX) {
    this.animTime += dt;
    this.isNearPlayer = Math.abs(this.x - playerX) < 140;
  }

  render(ctx) {
    assetRegistry.draw(
      ctx,
      'MANDAPAM_SPRITE',
      this.x,
      this.y,
      280,
      240,
      this.state,
      1,
      this.animTime,
      this.isLit
    );

    // Interactive prompt if near and action is required
    if (this.isNearPlayer && !this.isLit) {
      ctx.save();
      const promptY = this.y - 200 + Math.sin(this.animTime * 3) * 4;

      ctx.fillStyle = 'rgba(255, 143, 0, 0.9)';
      ctx.beginPath();
      ctx.roundRect(this.x - 45, promptY - 14, 90, 24, 6);
      ctx.fill();
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('[E] WORK', this.x, promptY - 2);
      ctx.restore();
    }
  }
}
