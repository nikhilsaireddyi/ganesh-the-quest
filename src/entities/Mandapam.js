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
    this.isCollapsing = false;
    this.isCollapsed = false;
    this.collapseProgress = 0; // 0 to 1
    this.hasWork = false;
    this.interactLabel = '[E] WORK';
  }

  setWorkState(hasWork, label = '[E] WORK') {
    this.hasWork = Boolean(hasWork);
    if (label) this.interactLabel = label;
  }

  triggerCollapse() {
    this.isCollapsing = true;
    this.isLit = false;
    this.hasWork = false;
  }

  update(dt, playerX) {
    this.animTime += dt;
    this.isNearPlayer = Math.abs(this.x - playerX) < 140;

    if (this.isCollapsing) {
      this.collapseProgress = Math.min(1, this.collapseProgress + dt * 0.85);
      if (this.collapseProgress >= 1) {
        this.isCollapsing = false;
        this.isCollapsed = true;
      }
    }
  }

  render(ctx) {
    if (this.collapseProgress > 0) {
      this.renderCollapsed(ctx);
      return;
    }

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
  }

  renderCollapsed(ctx) {
    const p = this.collapseProgress;
    ctx.save();
    ctx.translate(this.x, this.y);

    // 1. Base Platform & Steps
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(-130, -14, 260, 14);
    ctx.fillStyle = '#bcaaa4';
    ctx.fillRect(-120, -24, 240, 10);
    ctx.fillStyle = '#d7ccc8';
    ctx.fillRect(-105, -30, 210, 6);

    // Torn Rangoli / dust stains
    ctx.fillStyle = 'rgba(121, 85, 72, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, -6, 50, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Snapped Bamboo Pillars (tilting and breaking down)
    ctx.fillStyle = '#8d6e63';
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 2;

    // Pillar 1: Far Left (breaks at base, falls outward left)
    ctx.save();
    ctx.translate(-90, -30);
    ctx.rotate(-p * 1.25);
    ctx.fillRect(-5, -150, 10, 150);
    ctx.strokeRect(-5, -150, 10, 150);
    ctx.restore();

    // Pillar 2: Inner Left (snaps midway, leaning inward)
    ctx.save();
    ctx.translate(-45, -30);
    ctx.rotate(-p * 0.75);
    ctx.fillRect(-5, -80, 10, 80);
    ctx.strokeRect(-5, -80, 10, 80);
    // Broken top splinter
    ctx.translate(0, -80);
    ctx.rotate(p * 1.1);
    ctx.fillRect(-4, -65, 8, 65);
    ctx.strokeRect(-4, -65, 8, 65);
    ctx.restore();

    // Pillar 3: Inner Right (breaks and leans inward)
    ctx.save();
    ctx.translate(45, -30);
    ctx.rotate(p * 0.7);
    ctx.fillRect(-5, -90, 10, 90);
    ctx.strokeRect(-5, -90, 10, 90);
    // Broken upper splinter
    ctx.translate(0, -90);
    ctx.rotate(-p * 1.05);
    ctx.fillRect(-4, -55, 8, 55);
    ctx.strokeRect(-4, -55, 8, 55);
    ctx.restore();

    // Pillar 4: Far Right (leans heavily outward right)
    ctx.save();
    ctx.translate(90, -30);
    ctx.rotate(p * 1.2);
    ctx.fillRect(-5, -150, 10, 150);
    ctx.strokeRect(-5, -150, 10, 150);
    ctx.restore();

    // 3. Crumpled Backdrop Fabric (collapsed onto floor)
    ctx.fillStyle = '#b71c1c';
    ctx.beginPath();
    ctx.moveTo(-90, -30);
    ctx.quadraticCurveTo(-40, -30 - (1 - p) * 120, 0, -30 - (1 - p) * 140);
    ctx.quadraticCurveTo(50, -30 - (1 - p) * 110, 90, -30);
    ctx.lineTo(80, -25);
    ctx.lineTo(-80, -25);
    ctx.closePath();
    ctx.fill();

    // 4. Snapped Roof Truss & Saffron Canopy (crashing down onto platform)
    const roofDrop = p * 155;
    const roofTilt = -p * 0.18;
    ctx.save();
    ctx.translate(0, -185 + roofDrop);
    ctx.rotate(roofTilt);

    // Broken horizontal beam
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(-96, 0, 85, 9);
    ctx.fillRect(5, 4, 85, 9);

    // Collapsed Canopy Fabric
    ctx.fillStyle = '#ff8f00';
    ctx.beginPath();
    ctx.moveTo(-102, 0);
    ctx.lineTo(0, -50);
    ctx.lineTo(102, 0);
    ctx.closePath();
    ctx.fill();

    // Kalash falling / rolling off
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(p * 45, -56 + p * 30, 7, 0, Math.PI * 2);
    ctx.fill();

    // Snapped marigold toran & loose bulbs
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-80, 0);
    ctx.lineTo(80, 8);
    ctx.stroke();

    ctx.restore();

    // 5. Debris splinters & fallen marigolds on platform
    for (let i = -80; i <= 80; i += 22) {
      // Marigold flower on floor
      ctx.fillStyle = '#ffb300';
      ctx.beginPath();
      ctx.arc(i + Math.sin(i) * 6, -32 + Math.cos(i) * 3, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Splintered wood chip
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(i - 4, -30, 8, 3);
    }

    ctx.restore();
  }
}
