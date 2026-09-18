/**
 * NPC - Non-Player Character entity
 * Handles idle animations, dialogue interactions, and proximity detection.
 */

import { assetRegistry } from '../assets/AssetRegistry.js';

export class NPC {
  constructor({ id, name, spriteKey, x, y = 540, facing = -1, dialogues = {} }) {
    this.id = id;
    this.name = name;
    this.spriteKey = spriteKey;
    this.x = x;
    this.y = y;
    this.facing = facing;
    this.dialogues = dialogues;
    this.animTime = Math.random() * 5;
    this.isNearPlayer = false;
  }

  update(dt, playerX) {
    this.animTime += dt;
    const dist = Math.abs(this.x - playerX);
    this.isNearPlayer = dist < 85;

    // Face player if nearby
    if (this.isNearPlayer) {
      this.facing = playerX > this.x ? 1 : -1;
    }
  }

  getDialogue(missionId) {
    if (this.dialogues[missionId]) {
      return this.dialogues[missionId];
    }
    return this.dialogues.default || ["Let's make this festival unforgettable!"];
  }

  render(ctx) {
    assetRegistry.draw(
      ctx,
      this.spriteKey,
      this.x,
      this.y,
      50,
      72,
      'idle',
      this.facing,
      this.animTime
    );

    // Floating interaction prompt when near player
    if (this.isNearPlayer) {
      ctx.save();
      const promptY = this.y - 82 + Math.sin(this.animTime * 4) * 3;

      // Small speech bubble
      ctx.fillStyle = 'rgba(255, 111, 0, 0.9)';
      ctx.beginPath();
      ctx.roundRect(this.x - 36, promptY - 14, 72, 22, 6);
      ctx.fill();
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pointer triangle
      ctx.beginPath();
      ctx.moveTo(this.x - 5, promptY + 8);
      ctx.lineTo(this.x + 5, promptY + 8);
      ctx.lineTo(this.x, promptY + 13);
      ctx.closePath();
      ctx.fill();

      // Text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('[E] TALK', this.x, promptY - 3);

      ctx.restore();
    }
  }
}
