/**
 * MangoLeavesMinigame - Interactive Mango Leaf Plucking System
 * The player plucks fresh, glossy green mango leaves from the mango tree branches
 * into a traditional festive burlap bag to prepare the sacred Toran for Lord Ganesha's pandal.
 */

import { audioManager } from '../audio/AudioManager.js';

export class MangoLeavesMinigame {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.active = false;
    this.completed = false;
    this.completionTimer = 0;

    this.leavesNeeded = 5;
    this.leavesInBag = 0;

    // Bag position & squash/bounce animation
    this.bag = {
      x: 640,
      y: 530,
      w: 170,
      h: 155,
      bounce: 0,
      glow: 0
    };

    // Array of interactive mango leaves on the branch
    this.leaves = [];
    this.fallingLeaves = [];
    this.floatingTexts = [];
    this.animTime = 0;
  }

  initLeaves() {
    this.leaves = [
      { id: 1, x: 360, y: 195, length: 70, width: 26, angle: 0.35, plucked: false, hover: false, stemX: 340, stemY: 180 },
      { id: 2, x: 440, y: 225, length: 75, width: 28, angle: 0.65, plucked: false, hover: false, stemX: 420, stemY: 205 },
      { id: 3, x: 520, y: 190, length: 72, width: 27, angle: -0.25, plucked: false, hover: false, stemX: 510, stemY: 175 },
      { id: 4, x: 590, y: 235, length: 76, width: 28, angle: 0.40, plucked: false, hover: false, stemX: 575, stemY: 215 },
      { id: 5, x: 670, y: 195, length: 74, width: 26, angle: -0.30, plucked: false, hover: false, stemX: 660, stemY: 180 },
      { id: 6, x: 740, y: 240, length: 78, width: 29, angle: 0.55, plucked: false, hover: false, stemX: 720, stemY: 220 },
      { id: 7, x: 820, y: 205, length: 72, width: 26, angle: -0.45, plucked: false, hover: false, stemX: 810, stemY: 190 },
      { id: 8, x: 890, y: 230, length: 70, width: 25, angle: 0.20, plucked: false, hover: false, stemX: 875, stemY: 215 }
    ];

    this.fallingLeaves = [];
    this.floatingTexts = [];
    this.leavesInBag = 0;
  }

  start() {
    this.active = true;
    this.completed = false;
    this.completionTimer = 0;
    this.bag.bounce = 0;
    this.bag.glow = 0;
    this.initLeaves();
    audioManager.playBell();
  }

  pluckLeaf(leaf, particles) {
    if (leaf.plucked || this.leavesInBag >= this.leavesNeeded) return;

    leaf.plucked = true;
    const currentCombo = this.leavesInBag;
    audioManager.playSnap();
    audioManager.playPickup(currentCombo);

    // Spawn falling leaf physics entity
    this.fallingLeaves.push({
      x: leaf.x,
      y: leaf.y,
      vx: (Math.random() - 0.5) * 40,
      vy: 60 + Math.random() * 40,
      angle: leaf.angle,
      vRot: (Math.random() - 0.5) * 3,
      length: leaf.length,
      width: leaf.width,
      targetX: this.bag.x + (Math.random() - 0.5) * 50,
      targetY: this.bag.y - 10,
      progress: 0
    });

    if (particles) {
      particles.emitPetals(leaf.x, leaf.y, 8);
    }
  }

  update(dt, input, particles) {
    if (!this.active) return;
    this.animTime += dt;

    const mouse = input && input.mouse;

    // 1. Close Button [X] (top right: x: 1085, y: 75 with generous padding)
    if (mouse && mouse.justPressed && mouse.x >= 1060 && mouse.x <= 1140 && mouse.y >= 55 && mouse.y <= 125) {
      this.active = false;
      audioManager.playSnap();
      mouse.justPressed = false;
      if (this.completed && this.onComplete) {
        this.onComplete();
      }
      return;
    }

    // 2. Handle completion delay or click to finish
    if (this.completed) {
      this.completionTimer += dt;
      if (this.completionTimer > 1.8 || (mouse && mouse.justPressed) || (input && input.interactPressed)) {
        if (mouse) mouse.justPressed = false;
        this.active = false;
        if (this.onComplete) this.onComplete();
      }
      return;
    }

    // 3. Hover and Plucking clicks
    if (mouse) {
      for (const leaf of this.leaves) {
        if (!leaf.plucked) {
          const dx = mouse.x - leaf.x;
          const dy = mouse.y - leaf.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          leaf.hover = dist < 38;

          if (leaf.hover && mouse.justPressed) {
            mouse.justPressed = false;
            this.pluckLeaf(leaf, particles);
            break;
          }
        } else {
          leaf.hover = false;
        }
      }

      // Keyboard shortcut [E] or Space plucks next available leaf
      if (input && input.interactPressed) {
        const nextLeaf = this.leaves.find(l => !l.plucked);
        if (nextLeaf) {
          this.pluckLeaf(nextLeaf, particles);
        }
      }
    }

    // 4. Update Falling Leaves animation towards the bag
    for (let i = this.fallingLeaves.length - 1; i >= 0; i--) {
      const fl = this.fallingLeaves[i];
      fl.progress += dt * 1.8;
      fl.angle += fl.vRot * dt;

      // Cubic curve from pluck position into bag opening
      const t = Math.min(1, fl.progress);
      const easeT = t * t;
      fl.currX = fl.x + (fl.targetX - fl.x) * easeT + Math.sin(this.animTime * 8 + fl.progress * 4) * 14 * (1 - t);
      fl.currY = fl.y + (fl.targetY - fl.y) * easeT;

      if (fl.progress >= 1) {
        // Leaf landed in bag!
        this.fallingLeaves.splice(i, 1);
        this.leavesInBag++;
        this.bag.bounce = 1.0; // Trigger bag squash/bounce

        this.floatingTexts.push({
          text: `+1 Auspicious Leaf! (${this.leavesInBag}/${this.leavesNeeded})`,
          x: this.bag.x,
          y: this.bag.y - 70,
          alpha: 1.0,
          vy: -35
        });

        if (particles) {
          particles.emitSparks(this.bag.x, this.bag.y - 20, 10);
        }

        // Check completion
        if (this.leavesInBag >= this.leavesNeeded && !this.completed) {
          this.completed = true;
          this.completionTimer = 0;
          this.bag.glow = 1.0;
          audioManager.playSuccess();
          audioManager.playBell();

          if (particles) {
            particles.emitDivineAura(this.bag.x, this.bag.y, 35);
            particles.emitPetals(this.bag.x, this.bag.y - 40, 30);
          }
        }
      }
    }

    // 5. Update Bag bounce physics
    if (this.bag.bounce > 0) {
      this.bag.bounce = Math.max(0, this.bag.bounce - dt * 3.5);
    }
    if (this.bag.glow > 0) {
      this.bag.glow = Math.min(2.0, this.bag.glow + dt * 1.5);
    }

    // 6. Update Floating Feedback Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.alpha -= dt * 0.9;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  render(ctx) {
    if (!this.active) return;

    ctx.save();

    // 1. Modal Overlay Backdrop (Warm Indian festival vignette)
    const vw = 1280;
    const vh = 720;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(0, 0, vw, vh);

    // Decorative festival frame card
    const cardX = 140;
    const cardY = 50;
    const cardW = 1000;
    const cardH = 620;

    // Card background
    const bgGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
    bgGrad.addColorStop(0, '#1e293b');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 20);
    ctx.fill();

    // Card gold border
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 2. Header Banner
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(cardX + 4, cardY + 4, cardW - 8, 64, [16, 16, 0, 0]);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌿 GATHER SACRED MANGO LEAVES', vw / 2, cardY + 28);

    // Subtitle
    ctx.fillStyle = '#fef08a';
    ctx.font = '13px sans-serif';
    ctx.fillText('Pluck 5 auspicious green leaves from the mango branch into the festival bag for Lord Ganesha\'s Toran!', vw / 2, cardY + 50);

    // Close Button [X]
    ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.beginPath();
    ctx.arc(cardX + cardW - 38, cardY + 34, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('✕', cardX + cardW - 38, cardY + 35);

    // 3. Render Mango Tree Branches (Arching naturally across top area)
    this.renderBranches(ctx);

    // 4. Render Leaves on Branches
    this.renderLeaves(ctx);

    // 5. Render Falling Leaves
    this.renderFallingLeaves(ctx);

    // 6. Render Festival Bag (Thaila)
    this.renderBag(ctx);

    // 7. Render Progress Bar / Counter
    this.renderProgress(ctx, cardX, cardY, cardW, cardH);

    // 8. Render Floating Texts
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = '#ffd54f';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    // 9. Completion Celebration Banner
    if (this.completed) {
      this.renderCompletionOverlay(ctx, vw, vh);
    }

    ctx.restore();
  }

  renderBranches(ctx) {
    ctx.save();
    // Main arching wooden branch
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(140, 120);
    ctx.quadraticCurveTo(400, 180, 640, 150);
    ctx.quadraticCurveTo(850, 120, 1140, 160);
    ctx.stroke();

    // Inner bark highlight
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(140, 116);
    ctx.quadraticCurveTo(400, 175, 640, 146);
    ctx.quadraticCurveTo(850, 116, 1140, 156);
    ctx.stroke();

    // Secondary sub-twigs
    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = 6;
    ctx.beginPath();
    // Twig 1
    ctx.moveTo(340, 175);
    ctx.lineTo(355, 195);
    // Twig 2
    ctx.moveTo(420, 172);
    ctx.lineTo(435, 210);
    // Twig 3
    ctx.moveTo(510, 165);
    ctx.lineTo(520, 185);
    // Twig 4
    ctx.moveTo(580, 155);
    ctx.lineTo(590, 220);
    // Twig 5
    ctx.moveTo(660, 150);
    ctx.lineTo(670, 185);
    // Twig 6
    ctx.moveTo(730, 142);
    ctx.lineTo(740, 225);
    // Twig 7
    ctx.moveTo(810, 136);
    ctx.lineTo(820, 195);
    // Twig 8
    ctx.moveTo(880, 140);
    ctx.lineTo(890, 220);
    ctx.stroke();

    // Dangling Golden Mangoes on branch for atmosphere
    const mangoes = [
      { x: 300, y: 190, r: 16 },
      { x: 475, y: 185, r: 18 },
      { x: 790, y: 170, r: 17 },
      { x: 970, y: 180, r: 16 }
    ];

    mangoes.forEach(m => {
      // Mango body
      const mGrad = ctx.createLinearGradient(m.x - m.r, m.y - m.r, m.x + m.r, m.y + m.r);
      mGrad.addColorStop(0, '#ffd600');
      mGrad.addColorStop(0.6, '#ff9800');
      mGrad.addColorStop(1, '#e53935');
      ctx.fillStyle = mGrad;

      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();

      // Stem
      ctx.strokeStyle = '#2e7d32';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y - m.r);
      ctx.lineTo(m.x - 4, m.y - m.r - 12);
      ctx.stroke();
    });

    ctx.restore();
  }

  renderLeaves(ctx) {
    const t = this.animTime;

    this.leaves.forEach((leaf, idx) => {
      if (leaf.plucked) return;

      const sway = Math.sin(t * 3 + idx * 1.3) * 0.08;
      const angle = leaf.angle + sway;

      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(angle);

      // Hover / interactive aura glow
      if (leaf.hover) {
        ctx.fillStyle = 'rgba(255, 235, 59, 0.45)';
        ctx.beginPath();
        ctx.ellipse(0, 0, leaf.width * 1.5, leaf.length * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mango Leaf Body (Elongated lanceolate shape with glossy dark green)
      const leafGrad = ctx.createLinearGradient(0, -leaf.length / 2, 0, leaf.length / 2);
      leafGrad.addColorStop(0, '#1b5e20');
      leafGrad.addColorStop(0.3, '#2e7d32');
      leafGrad.addColorStop(0.7, '#388e3c');
      leafGrad.addColorStop(1, '#43a047');
      ctx.fillStyle = leafGrad;
      ctx.strokeStyle = leaf.hover ? '#ffd700' : '#1b5e20';
      ctx.lineWidth = leaf.hover ? 2.5 : 1.5;

      ctx.beginPath();
      ctx.moveTo(0, -leaf.length / 2);
      ctx.quadraticCurveTo(leaf.width / 2, -leaf.length * 0.1, 0, leaf.length / 2);
      ctx.quadraticCurveTo(-leaf.width / 2, -leaf.length * 0.1, 0, -leaf.length / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Central Leaf Vein (Midrib)
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -leaf.length / 2 + 4);
      ctx.lineTo(0, leaf.length / 2 - 4);
      ctx.stroke();

      // Side Veins
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.35)';
      ctx.lineWidth = 1;
      for (let v = -18; v <= 18; v += 9) {
        ctx.beginPath();
        ctx.moveTo(0, v);
        ctx.lineTo(leaf.width * 0.35, v + 6);
        ctx.moveTo(0, v);
        ctx.lineTo(-leaf.width * 0.35, v + 6);
        ctx.stroke();
      }

      // Small plucking prompt if hovered
      if (leaf.hover) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✂️ Click to Pluck', 0, leaf.length / 2 + 14);
      }

      ctx.restore();
    });
  }

  renderFallingLeaves(ctx) {
    this.fallingLeaves.forEach(fl => {
      ctx.save();
      ctx.translate(fl.currX, fl.currY);
      ctx.rotate(fl.angle);

      // Falling leaf body
      ctx.fillStyle = '#388e3c';
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(0, -fl.length / 2);
      ctx.quadraticCurveTo(fl.width / 2, 0, 0, fl.length / 2);
      ctx.quadraticCurveTo(-fl.width / 2, 0, 0, -fl.length / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Vein
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -fl.length / 2);
      ctx.lineTo(0, fl.length / 2);
      ctx.stroke();

      ctx.restore();
    });
  }

  renderBag(ctx) {
    ctx.save();
    const bx = this.bag.x;
    const by = this.bag.y;
    const bw = this.bag.w;
    const bh = this.bag.h;

    // Bounce squash and stretch scale
    const squash = 1.0 + Math.sin(this.bag.bounce * Math.PI) * 0.18;
    const stretch = 1.0 - Math.sin(this.bag.bounce * Math.PI) * 0.12;

    ctx.translate(bx, by);
    ctx.scale(squash, stretch);

    // 1. Ambient shadow on floor
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, bh / 2 + 8, bw * 0.65, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Aura glow if completed
    if (this.completed) {
      const gGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 120);
      gGrad.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
      gGrad.addColorStop(0.5, 'rgba(255, 152, 0, 0.3)');
      gGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = gGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 120, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Traditional Jute / Burlap Bag Body (Thaila)
    const bagGrad = ctx.createLinearGradient(-bw / 2, -bh / 2, bw / 2, bh / 2);
    bagGrad.addColorStop(0, '#d7ccc8');
    bagGrad.addColorStop(0.3, '#bcaaa4');
    bagGrad.addColorStop(0.8, '#a1887f');
    bagGrad.addColorStop(1, '#8d6e63');
    ctx.fillStyle = bagGrad;
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 3;

    // Rounded sack silhouette
    ctx.beginPath();
    ctx.moveTo(-bw * 0.35, -bh * 0.4);
    ctx.quadraticCurveTo(-bw * 0.55, 0, -bw * 0.45, bh * 0.45);
    ctx.quadraticCurveTo(0, bh * 0.55, bw * 0.45, bh * 0.45);
    ctx.quadraticCurveTo(bw * 0.55, 0, bw * 0.35, -bh * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Woven burlap crosshatch texture
    ctx.strokeStyle = 'rgba(93, 64, 55, 0.18)';
    ctx.lineWidth = 1;
    for (let lx = -bw * 0.4; lx <= bw * 0.4; lx += 12) {
      ctx.beginPath();
      ctx.moveTo(lx, -bh * 0.3);
      ctx.lineTo(lx, bh * 0.4);
      ctx.stroke();
    }

    // 4. Festive Red / Saffron Embroidered Border
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-bw * 0.36, -bh * 0.38, bw * 0.72, 10);
    ctx.fillStyle = '#b91c1c';
    for (let bx = -bw * 0.32; bx <= bw * 0.32; bx += 14) {
      ctx.beginPath();
      ctx.arc(bx, -bh * 0.33, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Drawstring Neck & Tie Ribbon
    ctx.fillStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(0, -bh * 0.38, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Dangling tassels
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-3, -bh * 0.38);
    ctx.quadraticCurveTo(-14, -bh * 0.25, -18, -bh * 0.15);
    ctx.moveTo(3, -bh * 0.38);
    ctx.quadraticCurveTo(14, -bh * 0.25, 18, -bh * 0.15);
    ctx.stroke();

    // Red tassel ends
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(-18, -bh * 0.15, 4.5, 0, Math.PI * 2);
    ctx.arc(18, -bh * 0.15, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // 6. Plucked Leaves Peeking out of the bag opening!
    const leafCount = Math.min(this.leavesInBag, 5);
    for (let li = 0; li < leafCount; li++) {
      ctx.save();
      const lx = -35 + li * 17;
      const ly = -bh * 0.42 - Math.sin(li) * 8;
      const lRot = -0.4 + li * 0.2;

      ctx.translate(lx, ly);
      ctx.rotate(lRot);

      ctx.fillStyle = '#2e7d32';
      ctx.strokeStyle = '#1b5e20';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Vein
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(0, 18);
      ctx.stroke();

      ctx.restore();
    }

    // 7. Bag Label Badge
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(-55, 10, 110, 24, 6);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`TORAN BAG (${this.leavesInBag}/${this.leavesNeeded})`, 0, 22);

    ctx.restore();
  }

  renderProgress(ctx, cardX, cardY, cardW, cardH) {
    ctx.save();
    const px = cardX + 160;
    const py = cardY + cardH - 55;
    const pw = cardW - 320;
    const ph = 18;

    // Progress Bar Track
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 9);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Fill
    const fillRatio = Math.min(1, this.leavesInBag / this.leavesNeeded);
    if (fillRatio > 0) {
      const fillW = Math.max(18, pw * fillRatio);
      const fGrad = ctx.createLinearGradient(px, py, px + fillW, py);
      fGrad.addColorStop(0, '#15803d');
      fGrad.addColorStop(0.5, '#22c55e');
      fGrad.addColorStop(1, '#86efac');
      ctx.fillStyle = fGrad;
      ctx.beginPath();
      ctx.roundRect(px + 1, py + 1, fillW - 2, ph - 2, 8);
      ctx.fill();
    }

    // Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Auspicious Leaves Plucked: ${this.leavesInBag} / ${this.leavesNeeded}`, px + pw / 2, py + ph / 2);

    ctx.restore();
  }

  renderCompletionOverlay(ctx, vw, vh) {
    ctx.save();
    const cx = vw / 2;
    const cy = vh / 2 + 30;

    // Golden celebratory banner card
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.beginPath();
    ctx.roundRect(cx - 260, cy - 65, 520, 130, 16);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Accent header
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.roundRect(cx - 258, cy - 63, 516, 38, [14, 14, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ SACRED TORAN LEAVES READY! ✨', cx, cy - 44);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Bag is full with fresh, auspicious mango leaves!', cx, cy - 8);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '13px sans-serif';
    ctx.fillText('Adding Mango Toran to your pandal decorations...', cx, cy + 18);

    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Click anywhere or press [E] to continue', cx, cy + 44);

    ctx.restore();
  }
}
