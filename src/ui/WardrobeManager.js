/**
 * WardrobeManager - Hero Festive Attire & Pheta Customizer
 * Allows changing kurta silk colors, traditional Maharashtrian Pheta (turban),
 * and sacred tilak styles with real-time preview and persistence.
 */

import { audioManager } from '../audio/AudioManager.js';

export const KURTA_COLORS = [
  { id: 'saffron', name: 'Royal Saffron', hex: '#e65100', border: '#ffd54f' },
  { id: 'purple', name: 'Imperial Purple', hex: '#6a1b9a', border: '#e1bee7' },
  { id: 'gold', name: 'Turmeric Gold', hex: '#fbc02d', border: '#fff59d' },
  { id: 'green', name: 'Emerald Green', hex: '#1b5e20', border: '#a5d6a7' },
  { id: 'crimson', name: 'Festive Crimson', hex: '#b71c1c', border: '#ffcdd2' },
  { id: 'blue', name: 'Peacock Blue', hex: '#0277bd', border: '#b3e5fc' }
];

export const HEADWEAR_STYLES = [
  { id: 'none', name: 'Festive Hair' },
  { id: 'pheta_saffron', name: 'Saffron Pheta' },
  { id: 'pheta_crimson', name: 'Royal Crimson Pheta' },
  { id: 'pheta_gold', name: 'Golden Zari Pheta' }
];

export const TILAK_STYLES = [
  { id: 'trident', name: 'Chandan Trishul' },
  { id: 'bindu', name: 'Kumkum Bindu' },
  { id: 'vibhuti', name: 'Sacred Vibhuti' }
];

export class WardrobeManager {
  constructor() {
    this.kurtaColor = '#e65100'; // default Saffron
    this.headwear = 'pheta_saffron'; // default traditional Pheta
    this.tilak = 'trident';

    this.showModal = false;
    this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem('ganesh_quest_wardrobe');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.kurtaColor) this.kurtaColor = parsed.kurtaColor;
        if (parsed.headwear) this.headwear = parsed.headwear;
        if (parsed.tilak) this.tilak = parsed.tilak;
      }
    } catch (_) {}
  }

  save() {
    try {
      localStorage.setItem('ganesh_quest_wardrobe', JSON.stringify({
        kurtaColor: this.kurtaColor,
        headwear: this.headwear,
        tilak: this.tilak
      }));
    } catch (_) {}
  }

  getSettings() {
    return {
      kurtaColor: this.kurtaColor,
      headwear: this.headwear,
      tilak: this.tilak
    };
  }

  update(dt, input) {
    if (!this.showModal || !input) return;

    const mouse = input.mouse;
    if (mouse && mouse.justPressed) {
      const mx = mouse.x;
      const my = mouse.y;

      const bx = 280;
      const by = 60;
      const bw = 720;
      const bh = 600;

      // Check click outside to close or close button [X] at top-right
      if (mx < bx || mx > bx + bw || my < by || my > by + bh || (mx >= bx + bw - 60 && mx <= bx + bw - 10 && my >= by + 12 && my <= by + 56)) {
        this.showModal = false;
        audioManager.playSnap();
        mouse.justPressed = false;
        return;
      }

      // Check Kurta Color Circles (row 0 at cy: 152, row 1 at cy: 206)
      KURTA_COLORS.forEach((color, i) => {
        const cx = 630 + (i % 3) * 120;
        const cy = 152 + Math.floor(i / 3) * 54;
        const dist = Math.hypot(mx - cx, my - cy);
        if (dist <= 24) {
          this.kurtaColor = color.hex;
          this.save();
          audioManager.playSnap();
          audioManager.vibrate([20]);
        }
      });

      // Check Headwear Options (row 0 at hy: 306, row 1 at hy: 350)
      HEADWEAR_STYLES.forEach((hw, i) => {
        const hx = 560 + (i % 2) * 200;
        const hy = 306 + Math.floor(i / 2) * 44;
        if (mx >= hx && mx <= hx + 180 && my >= hy && my <= hy + 34) {
          this.headwear = hw.id;
          this.save();
          audioManager.playSnap();
          audioManager.vibrate([20]);
        }
      });

      // Check Tilak Options (ty: 444)
      TILAK_STYLES.forEach((tk, i) => {
        const tx = 555 + i * 135;
        const ty = 444;
        if (mx >= tx && mx <= tx + 120 && my >= ty && my <= ty + 36) {
          this.tilak = tk.id;
          this.save();
          audioManager.playSnap();
          audioManager.vibrate([20]);
        }
      });

      // Done / Confirm Button (y: 520 to 566, x: 635 to 865)
      if (mx >= 635 && mx <= 865 && my >= 520 && my <= 566) {
        this.showModal = false;
        audioManager.playSuccess();
        mouse.justPressed = false;
      }
    }

    if (input.interactPressed) {
      this.showModal = false;
      input.interactPressed = false;
    }
  }

  renderModal(ctx) {
    if (!this.showModal) return;

    ctx.save();
    // Dark transparent backdrop
    ctx.fillStyle = 'rgba(6, 10, 22, 0.88)';
    ctx.fillRect(0, 0, 1280, 720);

    const bx = 280;
    const by = 60;
    const bw = 720;
    const bh = 600;

    // Modal card background
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 16);
    ctx.fill();

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    ctx.fillText('👕 HERO FESTIVAL WARDROBE', bx + bw / 2, by + 38);

    // Close button [X]
    const btnX = bx + bw - 55;
    const btnY = by + 16;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(btnX, btnY, 40, 36, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✕', btnX + 20, btnY + 24);

    // --- LEFT PREVIEW PANEL ---
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(bx + 25, by + 60, 205, 515, 12);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('LIVE PREVIEW', bx + 127, by + 86);

    // Draw Live Hero Preview in center of preview panel
    this.renderHeroPreview(ctx, bx + 127, by + 460);

    // --- RIGHT CUSTOMIZATION OPTIONS (Centered at x = 750) ---
    const paneCenterX = 750;

    // 1. Kurta Silk Color
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('1. Silk Kurta Color', paneCenterX, 122);

    KURTA_COLORS.forEach((c, i) => {
      const cx = 630 + (i % 3) * 120;
      const cy = 152 + Math.floor(i / 3) * 54;
      const isSelected = this.kurtaColor === c.hex;

      // Color circle
      ctx.fillStyle = c.hex;
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fill();

      // Border & selection ring
      ctx.strokeStyle = isSelected ? '#ffffff' : c.border;
      ctx.lineWidth = isSelected ? 3.5 : 1.5;
      ctx.stroke();

      if (isSelected) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✓', cx, cy + 5);
      }

      ctx.fillStyle = isSelected ? '#ffd54f' : '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.name.split(' ')[1] || c.name, cx, cy + 28);
    });

    // 2. Traditional Headwear (Pheta) - Dragged down & centered
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('2. Traditional Headwear & Pheta', paneCenterX, 284);

    HEADWEAR_STYLES.forEach((hw, i) => {
      const hx = 560 + (i % 2) * 200;
      const hy = 306 + Math.floor(i / 2) * 44;
      const isSelected = this.headwear === hw.id;

      ctx.fillStyle = isSelected ? '#e65100' : '#1e293b';
      ctx.beginPath();
      ctx.roundRect(hx, hy, 180, 34, 8);
      ctx.fill();

      ctx.strokeStyle = isSelected ? '#ffd700' : '#475569';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(hw.name, hx + 90, hy + 22);
    });

    // 3. Sacred Tilak Mark - Dragged down & centered
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('3. Sacred Tilak Mark', paneCenterX, 422);

    TILAK_STYLES.forEach((tk, i) => {
      const tx = 555 + i * 135;
      const ty = 444;
      const isSelected = this.tilak === tk.id;

      ctx.fillStyle = isSelected ? '#c2410c' : '#1e293b';
      ctx.beginPath();
      ctx.roundRect(tx, ty, 120, 36, 8);
      ctx.fill();

      ctx.strokeStyle = isSelected ? '#ffd700' : '#475569';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tk.name, tx + 60, ty + 23);
    });

    // CONFIRM BUTTON - Centered
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.roundRect(635, 520, 230, 46, 10);
    ctx.fill();
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SAVE & WEAR ✓', paneCenterX, 549);

    ctx.restore();
  }

  renderHeroPreview(ctx, px, py) {
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(1.5, 1.5);

    const kurta = this.kurtaColor;
    const hw = this.headwear;
    const tilak = this.tilak;

    // Juttis
    ctx.fillStyle = '#b71c1c';
    ctx.beginPath();
    ctx.roundRect(-14, -10, 11, 10, 3);
    ctx.roundRect(3, -10, 11, 10, 3);
    ctx.fill();

    // Silk Pleated Dhoti
    ctx.fillStyle = '#fff8e1';
    ctx.beginPath();
    ctx.moveTo(-16, -65);
    ctx.lineTo(16, -65);
    ctx.lineTo(18, -12);
    ctx.lineTo(-18, -12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Kurta Body
    ctx.fillStyle = kurta;
    ctx.beginPath();
    ctx.moveTo(-15, -112);
    ctx.lineTo(15, -112);
    ctx.lineTo(17, -65);
    ctx.lineTo(-17, -65);
    ctx.closePath();
    ctx.fill();

    // Golden Zari Trim on Kurta Hem
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.strokeRect(-16, -67, 32, 4);

    // Flowing Angavastram (Shawl)
    ctx.strokeStyle = '#b71c1c';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-14, -110);
    ctx.quadraticCurveTo(0, -90, 15, -110);
    ctx.stroke();

    // Head
    ctx.fillStyle = '#d79968';
    ctx.beginPath();
    ctx.arc(0, -124, 13, 0, Math.PI * 2);
    ctx.fill();

    // Headwear
    if (hw === 'none') {
      // Styled festive dark hair
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(0, -132, 11, Math.PI, 0);
      ctx.fill();
    } else {
      // Traditional Maharashtrian Pheta Turban
      const phetaColor = hw === 'pheta_crimson' ? '#b71c1c' : (hw === 'pheta_gold' ? '#f59e0b' : '#ea580c');
      ctx.fillStyle = phetaColor;
      ctx.beginPath();
      ctx.roundRect(-15, -142, 30, 15, [8, 8, 2, 2]);
      ctx.fill();

      // Golden Zari Border band
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-15, -132, 30, 3.5);

      // Rising Plume / Kalgi Crest
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(3, -142);
      ctx.lineTo(8, -155);
      ctx.lineTo(13, -142);
      ctx.closePath();
      ctx.fill();

      // Pearl jewel on kalgi
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(8, -145, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sacred Tilak (Drawn over forehead and lower band so it is clearly visible in preview)
    if (tilak === 'trident') {
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-5, -128, 10, 3);
      ctx.fillStyle = '#c62828';
      ctx.fillRect(-1.5, -131, 3, 8);
    } else if (tilak === 'bindu') {
      ctx.fillStyle = '#c62828';
      ctx.beginPath();
      ctx.arc(0, -126, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, -126, 1.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (tilak === 'vibhuti') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-6, -128);
      ctx.lineTo(6, -128);
      ctx.moveTo(-6, -125);
      ctx.lineTo(6, -125);
      ctx.stroke();
      ctx.fillStyle = '#c62828';
      ctx.beginPath();
      ctx.arc(0, -126.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

export const wardrobeManager = new WardrobeManager();
