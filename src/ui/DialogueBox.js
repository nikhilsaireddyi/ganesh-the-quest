/**
 * DialogueBox - Reusable dialogue system
 * Typewriter effect, speaker portrait/badge, keyboard & touch tap advance, and skip.
 */

import { audioManager } from '../audio/AudioManager.js';
import { wardrobeManager } from './WardrobeManager.js';

export class DialogueBox {
  constructor() {
    this.active = false;
    this.speaker = '';
    this.lines = [];
    this.currentLineIdx = 0;
    this.displayedText = '';
    this.targetText = '';
    this.charIdx = 0;
    this.charTimer = 0;
    this.charSpeed = 0.025; // seconds per char
    this.onComplete = null;
  }

  start(speaker, lines, onComplete) {
    this.speaker = speaker;
    this.lines = Array.isArray(lines) ? lines : [lines];
    this.currentLineIdx = 0;
    this.onComplete = onComplete;
    this.active = true;
    this.setLine(this.lines[0]);
  }

  setLine(text) {
    this.targetText = text;
    this.displayedText = '';
    this.charIdx = 0;
    this.charTimer = 0;
  }

  update(dt, input) {
    if (!this.active) return;

    // Typewriter progression
    if (this.displayedText.length < this.targetText.length) {
      this.charTimer += dt;
      if (this.charTimer >= this.charSpeed) {
        this.charTimer = 0;
        this.charIdx++;
        this.displayedText = this.targetText.substring(0, this.charIdx);
        // Play soft typing click every 3 chars
        if (this.charIdx % 3 === 0) {
          audioManager.playFootstep();
        }
      }
    }

    // Advance dialogue (E, Space, or tap/click anywhere)
    const advance = input.interactPressed || input.mouse.justPressed;

    if (advance) {
      // Consume input so it doesn't trigger world interactions on the same frame!
      input.interactPressed = false;
      input.mouse.justPressed = false;

      if (this.displayedText.length < this.targetText.length) {
        // Skip typewriter to show full line
        this.displayedText = this.targetText;
      } else {
        // Next line
        this.currentLineIdx++;
        if (this.currentLineIdx < this.lines.length) {
          this.setLine(this.lines[this.currentLineIdx]);
          audioManager.playSnap();
        } else {
          // Finished dialogue
          this.active = false;
          if (this.onComplete) this.onComplete();
        }
      }
    }
  }

  render(ctx) {
    if (!this.active) return;

    ctx.save();
    // Dialogue panel at bottom of screen
    const bx = 120;
    const by = 500;
    const bw = 1040;
    const bh = 185;

    // Glassmorphism background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 16);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Ornate Gold Corner Motifs
    ctx.strokeStyle = '#ffb300';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx + 6, by + 6, bw - 12, bh - 12);

    // 1. Character Portrait Frame (Left Side)
    const px = bx + 22;
    const py = by + 22;
    const pw = 120;
    const ph = 140;

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 12);
    ctx.fill();
    ctx.strokeStyle = '#ffb300';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Illustrated Character Portrait
    this.drawPortrait(ctx, this.speaker, px + pw / 2, py + ph, pw, ph);

    // 2. Speaker Name Tag Badge
    ctx.fillStyle = '#e65100';
    ctx.beginPath();
    ctx.roundRect(bx + 165, by - 16, 210, 34, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.speaker.toUpperCase(), bx + 270, by);

    // 3. Dialogue Body Text (Offset to the right of portrait)
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Word wrap rendering
    const textStartX = bx + 168;
    const maxWidth = bw - 200;
    const words = this.displayedText.split(' ');
    let line = '';
    let lineY = by + 34;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, textStartX, lineY);
        line = words[i] + ' ';
        lineY += 27;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, textStartX, lineY);

    // 4. Continue Prompt at bottom right
    const blink = Math.sin(Date.now() * 0.007) > 0;
    if (blink && this.displayedText.length === this.targetText.length) {
      ctx.fillStyle = '#ffd54f';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('Press [E] or Tap to Continue ▼', bx + bw - 26, by + bh - 20);
    }

    ctx.restore();
  }

  drawPortrait(ctx, speaker, cx, cy, w, h) {
    ctx.save();
    // Clip portrait inside the frame box
    ctx.beginPath();
    ctx.roundRect(cx - w / 2 + 3, cy - h + 3, w - 6, h - 6, 10);
    ctx.clip();

    const id = speaker.toLowerCase();

    if (id.includes('uncle')) {
      // --- FESTIVAL UNCLE PORTRAIT ---
      // Background gradient
      const bg = ctx.createLinearGradient(cx, cy - h, cx, cy);
      bg.addColorStop(0, '#795548');
      bg.addColorStop(1, '#3e2723');
      ctx.fillStyle = bg;
      ctx.fillRect(cx - w / 2, cy - h, w, h);

      // Torso - White Cotton Kurta with Saffron Angavastram
      ctx.fillStyle = '#f5f5f5';
      ctx.beginPath();
      ctx.roundRect(cx - 38, cy - 45, 76, 55, [16, 16, 0, 0]);
      ctx.fill();

      ctx.fillStyle = '#ff6f00';
      ctx.beginPath();
      ctx.moveTo(cx - 38, cy - 40);
      ctx.lineTo(cx - 10, cy - 45);
      ctx.lineTo(cx + 20, cy);
      ctx.lineTo(cx - 38, cy);
      ctx.closePath();
      ctx.fill();

      // Neck
      ctx.fillStyle = '#d7ccc8';
      ctx.fillRect(cx - 10, cy - 58, 20, 18);

      // Head & Face
      ctx.fillStyle = '#bcaaa4';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 74, 25, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      // Grey/Silver Hair
      ctx.fillStyle = '#cfd8dc';
      ctx.beginPath();
      ctx.arc(cx, cy - 88, 26, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - 27, cy - 88, 5, 20);
      ctx.fillRect(cx + 22, cy - 88, 5, 20);

      // Eyes & Spectacles
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(cx - 19, cy - 78, 14, 10);
      ctx.strokeRect(cx + 5, cy - 78, 14, 10);
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy - 73);
      ctx.lineTo(cx + 5, cy - 73);
      ctx.stroke();

      ctx.fillStyle = '#37474f';
      ctx.fillRect(cx - 14, cy - 75, 4, 4);
      ctx.fillRect(cx + 10, cy - 75, 4, 4);

      // Traditional Maharashtrian Grey Mustache
      ctx.fillStyle = '#eceff1';
      ctx.beginPath();
      ctx.moveTo(cx - 18, cy - 60);
      ctx.quadraticCurveTo(cx, cy - 66, cx + 18, cy - 60);
      ctx.quadraticCurveTo(cx + 24, cy - 56, cx + 22, cy - 52);
      ctx.quadraticCurveTo(cx, cy - 58, cx - 22, cy - 52);
      ctx.closePath();
      ctx.fill();

      // Chandan Tilak on forehead
      ctx.fillStyle = '#ffd54f';
      ctx.fillRect(cx - 8, cy - 92, 16, 3);
      ctx.fillStyle = '#d50000';
      ctx.beginPath();
      ctx.arc(cx, cy - 90, 2, 0, Math.PI * 2);
      ctx.fill();

    } else if (id.includes('flower') || id.includes('seller')) {
      // --- FLOWER SELLER PORTRAIT ---
      const bg = ctx.createLinearGradient(cx, cy - h, cx, cy);
      bg.addColorStop(0, '#00695c');
      bg.addColorStop(1, '#004d40');
      ctx.fillStyle = bg;
      ctx.fillRect(cx - w / 2, cy - h, w, h);

      // Torso - Emerald Green Silk Saree & Gold Zari
      ctx.fillStyle = '#00796b';
      ctx.beginPath();
      ctx.roundRect(cx - 38, cy - 45, 76, 55, [18, 18, 0, 0]);
      ctx.fill();

      ctx.fillStyle = '#ffd54f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - 45);
      ctx.lineTo(cx + 30, cy);
      ctx.stroke();

      // Neck & Gold Necklace
      ctx.fillStyle = '#cfb590';
      ctx.fillRect(cx - 9, cy - 58, 18, 16);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy - 48, 10, 0, Math.PI);
      ctx.stroke();

      // Face
      ctx.fillStyle = '#bcaaa4';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 74, 23, 27, 0, 0, Math.PI * 2);
      ctx.fill();

      // Traditional Hair Bun with Jasmine Garland (Gajra)
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(cx, cy - 86, 25, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();
      ctx.arc(cx + 18, cy - 88, 14, 0, Math.PI * 2);
      ctx.fill();

      // White Jasmine Gajra flowers around bun
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 7; i++) {
        const ga = (i * Math.PI) / 6;
        ctx.beginPath();
        ctx.arc(cx + 18 + Math.cos(ga) * 15, cy - 88 + Math.sin(ga) * 15, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Marigold flower accent in hair
      ctx.fillStyle = '#ff9800';
      ctx.beginPath();
      ctx.arc(cx - 14, cy - 86, 6, 0, Math.PI * 2);
      ctx.fill();

      // Big Red Kumkum Bindi
      ctx.fillStyle = '#c62828';
      ctx.beginPath();
      ctx.arc(cx, cy - 80, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Warm smiling eyes & nose ring
      ctx.fillStyle = '#3e2723';
      ctx.beginPath();
      ctx.arc(cx - 8, cy - 73, 2.5, 0, Math.PI * 2);
      ctx.arc(cx + 8, cy - 73, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Gold Nose Pin (Nath)
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(cx - 4, cy - 67, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Gentle Smile
      ctx.strokeStyle = '#c2185b';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(cx, cy - 63, 7, 0.2, Math.PI - 0.2);
      ctx.stroke();

    } else if (id.includes('electrician')) {
      // --- ELECTRICIAN PORTRAIT ---
      const bg = ctx.createLinearGradient(cx, cy - h, cx, cy);
      bg.addColorStop(0, '#1565c0');
      bg.addColorStop(1, '#0d47a1');
      ctx.fillStyle = bg;
      ctx.fillRect(cx - w / 2, cy - h, w, h);

      // Navy Work Shirt with Tool Pocket
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.roundRect(cx - 38, cy - 45, 76, 55, [14, 14, 0, 0]);
      ctx.fill();

      // Pen in pocket
      ctx.fillStyle = '#ffd600';
      ctx.fillRect(cx - 24, cy - 35, 4, 14);

      // Neck
      ctx.fillStyle = '#c5a059';
      ctx.fillRect(cx - 9, cy - 58, 18, 16);

      // Face
      ctx.fillStyle = '#bcaaa4';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 74, 23, 27, 0, 0, Math.PI * 2);
      ctx.fill();

      // Yellow Headband / Bandana
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(cx - 25, cy - 88, 50, 10);
      ctx.strokeStyle = '#f57f17';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - 25, cy - 88, 50, 10);

      // Spiky black hair above headband
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(cx, cy - 90, 24, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();

      // Pencil tucked behind ear
      ctx.fillStyle = '#ff3d00';
      ctx.save();
      ctx.translate(cx + 20, cy - 78);
      ctx.rotate(-0.5);
      ctx.fillRect(0, 0, 18, 4);
      ctx.restore();

      // Focused Eyes & Confident Smile
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(cx - 8, cy - 74, 2.5, 0, Math.PI * 2);
      ctx.arc(cx + 8, cy - 74, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(cx, cy - 64, 7, 0.2, Math.PI - 0.2);
      ctx.stroke();

    } else if (id.includes('ananya') || id.includes('child')) {
      // --- ANANYA (CHILD) PORTRAIT ---
      const bg = ctx.createLinearGradient(cx, cy - h, cx, cy);
      bg.addColorStop(0, '#ad1457');
      bg.addColorStop(1, '#880e4f');
      ctx.fillStyle = bg;
      ctx.fillRect(cx - w / 2, cy - h, w, h);

      // Festive Pink & Gold Pavada/Dress
      ctx.fillStyle = '#e91e63';
      ctx.beginPath();
      ctx.roundRect(cx - 34, cy - 42, 68, 50, [16, 16, 0, 0]);
      ctx.fill();

      ctx.fillStyle = '#ffd54f';
      ctx.fillRect(cx - 34, cy - 20, 68, 4);

      // Neck & Little Gold Pendant
      ctx.fillStyle = '#d7ccc8';
      ctx.fillRect(cx - 8, cy - 54, 16, 14);
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(cx, cy - 44, 3, 0, Math.PI * 2);
      ctx.fill();

      // Cute round face
      ctx.fillStyle = '#cfb590';
      ctx.beginPath();
      ctx.arc(cx, cy - 70, 22, 0, Math.PI * 2);
      ctx.fill();

      // Two cute ponytails with yellow ribbons
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(cx - 22, cy - 82, 10, 0, Math.PI * 2);
      ctx.arc(cx + 22, cy - 82, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(cx - 24, cy - 78, 6, 6);
      ctx.fillRect(cx + 18, cy - 78, 6, 6);

      // Bangs / Front hair
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(cx, cy - 80, 21, Math.PI, Math.PI * 2);
      ctx.fill();

      // Small black bindi
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(cx, cy - 74, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Big Sparkly Eyes
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(cx - 7, cy - 69, 3.5, 0, Math.PI * 2);
      ctx.arc(cx + 7, cy - 69, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - 6, cy - 70, 1.5, 0, Math.PI * 2);
      ctx.arc(cx + 8, cy - 70, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Cheerful Smile
      ctx.strokeStyle = '#d81b60';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy - 61, 6, 0.1, Math.PI - 0.1);
      ctx.stroke();

      // Little Hand Holding Steamed Modak in corner
      ctx.fillStyle = '#fff9c4';
      ctx.beginPath();
      ctx.arc(cx + 24, cy - 18, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbc02d';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#d50000'; // saffron strand
      ctx.fillRect(cx + 23, cy - 25, 2, 4);

    } else {
      // --- PLAYER HERO PORTRAIT ---
      const wardrobe = wardrobeManager.getSettings();
      const bg = ctx.createLinearGradient(cx, cy - h, cx, cy);
      bg.addColorStop(0, '#1e293b');
      bg.addColorStop(1, '#0f172a');
      ctx.fillStyle = bg;
      ctx.fillRect(cx - w / 2, cy - h, w, h);

      // Customized Silk Kurta
      ctx.fillStyle = wardrobe.kurtaColor;
      ctx.beginPath();
      ctx.roundRect(cx - 36, cy - 45, 72, 55, [14, 14, 0, 0]);
      ctx.fill();

      // Golden Placket & Buttons
      ctx.fillStyle = '#b71c1c';
      ctx.fillRect(cx - 4, cy - 45, 8, 26);
      ctx.fillStyle = '#ffd54f';
      ctx.beginPath();
      ctx.arc(cx, cy - 38, 2, 0, Math.PI * 2);
      ctx.arc(cx, cy - 30, 2, 0, Math.PI * 2);
      ctx.fill();

      // Red Dupatta / Angavastram
      ctx.strokeStyle = '#c62828';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy - 40);
      ctx.lineTo(cx + 26, cy);
      ctx.stroke();

      // Neck
      ctx.fillStyle = '#c5a059';
      ctx.fillRect(cx - 9, cy - 58, 18, 16);

      // Face
      ctx.fillStyle = '#bcaaa4';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 74, 23, 27, 0, 0, Math.PI * 2);
      ctx.fill();

      // Headwear / Hair / Pheta
      if (wardrobe.headwear === 'none') {
        // Styled Hair
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(cx, cy - 88, 24, Math.PI * 0.8, Math.PI * 2.2);
        ctx.fill();
      } else {
        // Traditional Maharashtrian Pheta Turban
        const phetaColor = wardrobe.headwear === 'pheta_crimson' ? '#b71c1c' : (wardrobe.headwear === 'pheta_gold' ? '#f59e0b' : '#ea580c');
        ctx.fillStyle = phetaColor;
        ctx.beginPath();
        ctx.roundRect(cx - 26, cy - 108, 52, 28, [14, 14, 4, 4]);
        ctx.fill();

        // Golden Zari Brocade Band
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(cx - 26, cy - 92, 52, 5);

        // Rising Crest / Kalgi Plume
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(cx + 4, cy - 108);
        ctx.lineTo(cx + 12, cy - 126);
        ctx.lineTo(cx + 20, cy - 108);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx + 12, cy - 114, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Tilak
      if (wardrobe.tilak === 'trident') {
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(cx - 6, cy - 88, 12, 3);
        ctx.fillStyle = '#d50000';
        ctx.beginPath();
        ctx.arc(cx, cy - 84, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (wardrobe.tilak === 'bindu') {
        ctx.fillStyle = '#d50000';
        ctx.beginPath();
        ctx.arc(cx, cy - 84, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (wardrobe.tilak === 'vibhuti') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 7, cy - 86);
        ctx.lineTo(cx + 7, cy - 86);
        ctx.moveTo(cx - 7, cy - 83);
        ctx.lineTo(cx + 7, cy - 83);
        ctx.stroke();
        ctx.fillStyle = '#d50000';
        ctx.beginPath();
        ctx.arc(cx, cy - 84.5, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Gold Earring (Kundal)
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(cx - 23, cy - 72, 3, 0, Math.PI * 2);
      ctx.fill();

      // Eyes & Warm expression
      ctx.fillStyle = '#263238';
      ctx.beginPath();
      ctx.arc(cx - 8, cy - 73, 2.5, 0, Math.PI * 2);
      ctx.arc(cx + 8, cy - 73, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#4e342e';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(cx, cy - 63, 6, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
