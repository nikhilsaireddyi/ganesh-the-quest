/**
 * Ganesha - The divine idol entity
 * Supports staged cinematic reveal (0 to 5),
 * placement within mandapam or procession chariot,
 * and completely replaceable art abstraction.
 */

import { assetRegistry } from '../assets/AssetRegistry.js';

export class Ganesha {
  constructor(x = 1400, y = 490) {
    this.x = x;
    this.y = y;
    this.revealStage = 0; // 0 = dark silhouette, 5 = radiant complete
    this.animTime = 0;
    this.visible = false;
  }

  update(dt) {
    this.animTime += dt;
  }

  setRevealStage(stage) {
    this.revealStage = Math.max(0, Math.min(5, stage));
    this.visible = true;
  }

  render(ctx) {
    if (!this.visible) return;

    assetRegistry.draw(
      ctx,
      'GANESHA_SPRITE',
      this.x,
      this.y,
      140,
      180,
      'complete',
      1,
      this.animTime,
      this.revealStage
    );
  }
}
