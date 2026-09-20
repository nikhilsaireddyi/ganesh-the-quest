/**
 * NPC - Non-Player Character entity
 * Handles idle animations, dialogue interactions, and proximity detection.
 */

import { assetRegistry } from '../assets/AssetRegistry.js';

export class NPC {
  constructor({ id, name, spriteKey, x, y = 540, facing = -1, dialogues = {}, promptText = '[E] TALK' }) {
    this.id = id;
    this.name = name;
    this.spriteKey = spriteKey;
    this.x = x;
    this.y = y;
    this.facing = facing;
    this.dialogues = dialogues;
    this.promptText = promptText;
    this.animTime = Math.random() * 5;
    this.isNearPlayer = false;
  }

  setPrompt(text) {
    this.promptText = text;
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
  }
}
