/**
 * ParallaxSystem - Multi-depth 2.5D visual layer manager
 * Renders distant hills/temple spires, midground houses/shops,
 * ground walkway, and foreground festoon decorations at varying speeds.
 */

export class ParallaxSystem {
  constructor() {
    this.streetLength = 3200;
  }

  renderBackground(ctx, camera) {
    const camX = camera.x;

    // LAYER 1: Distant City & Temple Silhouettes (Speed: 0.15)
    ctx.save();
    const layer1Offset = -(camX * 0.15) % 800;
    ctx.fillStyle = '#607d8b';
    ctx.globalAlpha = 0.35;

    for (let x = -800 + layer1Offset; x < camera.viewportWidth + 800; x += 380) {
      // Temple Shikhara silhouette
      ctx.beginPath();
      ctx.moveTo(x, 500);
      ctx.lineTo(x + 70, 320);
      ctx.lineTo(x + 140, 500);
      ctx.fill();

      // Flat roof building silhouettes with domes
      ctx.fillRect(x + 140, 380, 160, 120);
      ctx.beginPath();
      ctx.arc(x + 220, 380, 30, Math.PI, 0);
      ctx.fill();
    }
    ctx.restore();

    // LAYER 2: Midground Traditional Houses & Trees (Speed: 0.45)
    ctx.save();
    const layer2Offset = -(camX * 0.45) % 900;
    ctx.fillStyle = '#795548';
    ctx.globalAlpha = 0.65;

    for (let x = -900 + layer2Offset; x < camera.viewportWidth + 900; x += 450) {
      // Houses
      ctx.fillRect(x, 390, 240, 150);

      // Pitched clay roof
      ctx.fillStyle = '#d84315';
      ctx.beginPath();
      ctx.moveTo(x - 20, 390);
      ctx.lineTo(x + 120, 320);
      ctx.lineTo(x + 260, 390);
      ctx.closePath();
      ctx.fill();

      // Festive banyan/neem tree
      ctx.fillStyle = '#2e7d32';
      ctx.beginPath();
      ctx.arc(x + 360, 410, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(x + 350, 450, 20, 90);

      ctx.fillStyle = '#795548';
    }
    ctx.restore();
  }

  renderGround(ctx, camera) {
    // Street Road / Paved Stone Walkway (In world coordinates)
    ctx.save();
    // Warm festive stone pavers
    ctx.fillStyle = '#efebe9';
    ctx.fillRect(-200, 520, this.streetLength + 400, 220);

    // Stone pattern lines
    ctx.strokeStyle = '#d7ccc8';
    ctx.lineWidth = 2;
    for (let x = -200; x < this.streetLength + 400; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 520);
      ctx.lineTo(x, 740);
      ctx.stroke();
    }

    // Street Curb / Edge
    ctx.fillStyle = '#bcaaa4';
    ctx.fillRect(-200, 515, this.streetLength + 400, 8);
    ctx.restore();
  }

  renderForeground(ctx, camera) {
    // LAYER 4: Foreground Overhead Bunting & Hanging Torans (Speed: 1.25)
    ctx.save();
    const camX = camera.x;
    const fgOffset = -(camX * 1.25) % 600;

    const flagColors = ['#ff9800', '#ffd600', '#e91e63', '#00e676', '#00b0ff'];

    for (let x = -600 + fgOffset; x < camera.viewportWidth + 600; x += 300) {
      // Hanging catenary rope
      ctx.strokeStyle = '#5d4037';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.quadraticCurveTo(x + 150, 65, x + 300, 0);
      ctx.stroke();

      // Triangular festive pennant flags
      for (let i = 0; i < 7; i++) {
        const t = (i + 0.5) / 7;
        const fx = x + t * 300;
        const fy = Math.pow(t - 0.5, 2) * 120 + 35;

        ctx.fillStyle = flagColors[(Math.floor(x / 50) + i) % flagColors.length];
        ctx.beginPath();
        ctx.moveTo(fx - 14, fy - 6);
        ctx.lineTo(fx + 14, fy - 6);
        ctx.lineTo(fx, fy + 26);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }
}
