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
    const camX = camera.x || 0;
    // Parallax vertical adjustment for PC vs Mobile floor positioning
    const camY = (camera && camera.y !== undefined) ? camera.y : (camera && camera.isMobile ? 555 : 410);
    const yShift = (410 - camY) * 0.7;

    // LAYER 1: Distant City & Temple Silhouettes (Speed: 0.15)
    ctx.save();
    const layer1Offset = -(camX * 0.15) % 800;
    ctx.fillStyle = '#607d8b';
    ctx.globalAlpha = 0.35;

    for (let x = -800 + layer1Offset; x < camera.viewportWidth + 800; x += 380) {
      // Temple Shikhara silhouette
      ctx.beginPath();
      ctx.moveTo(x, 500 + yShift * 0.4);
      ctx.lineTo(x + 70, 320 + yShift * 0.4);
      ctx.lineTo(x + 140, 500 + yShift * 0.4);
      ctx.fill();

      // Flat roof building silhouettes with domes
      ctx.fillRect(x + 140, 380 + yShift * 0.4, 160, 240);
      ctx.beginPath();
      ctx.arc(x + 220, 380 + yShift * 0.4, 30, Math.PI, 0);
      ctx.fill();
    }
    ctx.restore();

    // LAYER 2: Midground Traditional Houses & Trees (Speed: 0.45)
    ctx.save();
    const layer2Offset = -(camX * 0.45) % 900;
    ctx.fillStyle = '#795548';
    ctx.globalAlpha = 0.65;

    for (let x = -900 + layer2Offset; x < camera.viewportWidth + 900; x += 450) {
      // Houses (extended downwards so no gap ever appears above the street road)
      ctx.fillRect(x, 390 + yShift * 0.8, 240, 360);

      // Pitched clay roof
      ctx.fillStyle = '#d84315';
      ctx.beginPath();
      ctx.moveTo(x - 20, 390 + yShift * 0.8);
      ctx.lineTo(x + 120, 320 + yShift * 0.8);
      ctx.lineTo(x + 260, 390 + yShift * 0.8);
      ctx.closePath();
      ctx.fill();

      // Festive banyan/neem tree
      ctx.fillStyle = '#2e7d32';
      ctx.beginPath();
      ctx.arc(x + 360, 410 + yShift * 0.8, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4e342e';
      ctx.fillRect(x + 350, 450 + yShift * 0.8, 20, 180);

      ctx.fillStyle = '#795548';
    }
    ctx.restore();
  }

  renderGround(ctx, camera) {
    // Authentic Festive Street Road (In world coordinates)
    ctx.save();

    const startX = -600;
    const endX = this.streetLength + 1000;
    const totalW = endX - startX;

    // 1. Sidewalk / Pedestrian Walkway (y: 515 - 540)
    // Warm Indian sandstone pavement where houses & streetlamps stand
    ctx.fillStyle = '#cfc5bb';
    ctx.fillRect(startX, 515, totalW, 25);

    // Subtle paving slab joints along walkway
    ctx.strokeStyle = '#b8aca1';
    ctx.lineWidth = 1.5;
    for (let x = startX; x < endX; x += 55) {
      ctx.beginPath();
      ctx.moveTo(x, 515);
      ctx.lineTo(x, 538);
      ctx.stroke();
    }

    // 2. Street Kerbstone (y: 538 - 546)
    // Classic festive yellow-and-black painted kerbstones
    const kerbW = 42;
    for (let x = startX; x < endX; x += kerbW) {
      const idx = Math.floor(Math.abs(x) / kerbW);
      ctx.fillStyle = idx % 2 === 0 ? '#ffb300' : '#1e293b';
      ctx.fillRect(x, 538, kerbW + 0.5, 8);

      // 3D Kerb Top highlight bevel
      ctx.fillStyle = idx % 2 === 0 ? '#fff59d' : '#475569';
      ctx.fillRect(x, 538, kerbW + 0.5, 1.5);
    }

    // Drop shadow under kerb onto asphalt road
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.fillRect(startX, 546, totalW, 4);

    // 3. Main Asphalt Roadway Surface (y: 546 - 1200)
    // Rich dark tar / macadam asphalt road gradient
    const roadGrad = ctx.createLinearGradient(0, 546, 0, 950);
    roadGrad.addColorStop(0, '#2d3239');
    roadGrad.addColorStop(0.12, '#24272e');
    roadGrad.addColorStop(1, '#181a1f');
    ctx.fillStyle = roadGrad;
    ctx.fillRect(startX, 546, totalW, 700);

    // Subtle asphalt grain speckles (deterministic, non-flickering)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let x = startX; x < endX; x += 28) {
      const hash = ((x * 13) ^ 0x5deece66d) & 0x7fffffff;
      const offY1 = 555 + (hash % 160);
      const offY2 = 610 + ((hash >> 4) % 180);
      ctx.fillRect(x, offY1, 3, 2);
      ctx.fillRect(x + 14, offY2, 4, 2);
    }

    // 4. Road Markings
    // Continuous white road shoulder edge stripe
    ctx.fillStyle = 'rgba(241, 245, 249, 0.55)';
    ctx.fillRect(startX, 558, totalW, 3);

    // Festive Center Dashed Road Divider Line (y: 636)
    ctx.save();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 5;
    ctx.setLineDash([70, 50]);
    ctx.beginPath();
    ctx.moveTo(startX, 636);
    ctx.lineTo(endX, 636);
    ctx.stroke();
    ctx.restore();

    // Secondary lower guideline stripe (y: 715)
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 3;
    ctx.setLineDash([40, 45]);
    ctx.beginPath();
    ctx.moveTo(startX, 715);
    ctx.lineTo(endX, 715);
    ctx.stroke();
    ctx.restore();

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
