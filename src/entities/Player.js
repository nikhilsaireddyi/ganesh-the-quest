/**
 * Player - Controllable character entity
 * Handles movement, animation timing, footstep sound triggers,
 * interaction proximity detection, and decoupled sprite rendering.
 */

import { assetRegistry } from '../assets/AssetRegistry.js';
import { audioManager } from '../audio/AudioManager.js';

export class Player {
  constructor(x = 200, y = 540) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.speed = 260; // px/sec
    this.facing = 1; // 1 = right, -1 = left
    this.state = 'idle'; // 'idle' | 'walk' | 'interact'
    this.animTime = 0;
    this.footstepTimer = 0;

    this.interactionRadius = 75;
    this.canMove = true;
  }

  update(dt, input, minX = 60, maxX = 3100) {
    this.animTime += dt;

    if (!this.canMove) {
      this.state = 'idle';
      this.vx = 0;
      return;
    }

    const moveX = input.axisX;
    const isSprinting = input.shiftPressed;
    const currentSpeed = isSprinting ? 400 : this.speed;

    if (Math.abs(moveX) > 0.1) {
      this.state = 'walk';
      this.isSprinting = isSprinting;
      this.vx = moveX * currentSpeed;
      this.facing = moveX > 0 ? 1 : -1;

      // Footstep sound cadence (faster during sprint)
      this.footstepTimer += dt;
      const stepRate = isSprinting ? 0.20 : 0.32;
      if (this.footstepTimer > stepRate) {
        this.footstepTimer = 0;
        audioManager.playFootstep();
      }
    } else {
      this.state = 'idle';
      this.isSprinting = false;
      this.vx = 0;
      this.footstepTimer = 0.2; // Ready to step
    }

    // Move and clamp within world
    this.x += this.vx * dt;
    this.x = Math.max(minX, Math.min(maxX, this.x));
  }

  render(ctx) {
    assetRegistry.draw(
      ctx,
      'PLAYER_SPRITE',
      this.x,
      this.y,
      48,
      72,
      this.state,
      this.facing,
      this.animTime
    );

    // Subtle interaction ring on ground
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 179, 0, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.ellipse(this.x, this.y - 2, 28, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
