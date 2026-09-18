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

      // Check click outside to close (or close button at top-right of modal)
      if (mx < 300 || mx > 980 || my < 90 || my > 630 || (mx > 930 && mx < 970 && my > 105 && my < 145)) {
        this.showModal = false;
        audioManager.playSnap();
        mouse.justPressed = false;
        return;
      }

      // Check Kurta Color Circles (row at y: 220, x centers from 580 to 920)
      KURTA_COLORS.forEach((color, i) => {
        const cx = 580 + (i % 3) * 115;
        const cy = 210 + Math.floor(i / 3) * 55;
        const dist = Math.hypot(mx - cx, my - cy);
        if (dist <= 24) {
          this.kurtaColor = color.hex;
          this.save();
          audioManager.playSnap();
          audioManager.vibrate([20]);
        }
      });

      // Check Headwear Options (y: 350 to 450)
      HEADWEAR_STYLES.forEach((hw, i) => {
        const hx = 550 + (i % 2) * 180;
        const hy = 345 + Math.floor(i / 2) * 44;
        if (mx >= hx && mx <= hx + 165 && my >= hy && my <= hy + 36) {
          this.headwear = hw.id;
          this.save();
          audioManager.playSnap();
          audioManager.vibrate([20]);
        }
      });

      // Check Tilak Options (y: 470 to 520)
      TILAK_STYLES.forEach((tk, i) => {
        const tx = 550 + i * 125;
        const ty = 460;
        if (mx >= tx && mx <= tx + 115 && my >= ty && my <= ty + 36) {
          this.tilak = tk.id;
          this.save();
          audioManager.playSnap();
          audioManager.vibrate([20]);
        }
      });

      // Done / Confirm Button (y: 545, center 640)
      if (mx >= 540 && mx <= 740 && my >= 540 && my <= 585) {
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

    const bx = 300;
    const by = 85;
    const bw = 680;
    const bh = 535;

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
    ctx.fillText('👕 HERO FESTIVAL WARDROBE', bx + bw / 2, by + 40);

    // Close button (X)
    ctx.fillStyle = '#ff7043';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('✕', bx + bw - 35, by + 35);

    // --- LEFT PREVIEW PANEL ---
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(bx + 30, by + 75, 190, 420, 12);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('LIVE PREVIEW', bx + 125, by + 102);

    // Draw Live Hero Preview in center of preview panel
    this.renderHeroPreview(ctx, bx + 125, by + 380);

    // --- RIGHT CUSTOMIZATION OPTIONS ---

    // 1. Kurta Silk Color
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('1. Silk Kurta Color', bx + 245, by + 95);

    KURTA_COLORS.forEach((c, i) => {
      const cx = 580 + (i % 3) * 115;
      const cy = 210 + Math.floor(i / 3) * 55;
      const isSelected = this.kurtaColor === c.hex;

      // Color circle
      ctx.fillStyle = c.hex;
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
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
      ctx.fillText(c.name.split(' ')[1] || c.name, cx, cy + 32);
    });

    // 2. Traditional Headwear (Pheta)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('2. Traditional Headwear & Pheta', bx + 245, by + 230);

    HEADWEAR_STYLES.forEach((hw, i) => {
      const hx = 550 + (i % 2) * 180;
      const hy = 345 + Math.floor(i / 2) * 44;
      const isSelected = this.headwear === hw.id;

      ctx.fillStyle = isSelected ? '#e65100' : '#1e293b';
      ctx.beginPath();
      ctx.roundRect(hx, hy, 165, 36, 8);
      ctx.fill();

      ctx.strokeStyle = isSelected ? '#ffd700' : '#475569';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(hw.name, hx + 82, hy + 23);
    });

    // 3. Sacred Tilak
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('3. Sacred Tilak Mark', bx + 245, by + 345);

    TILAK_STYLES.forEach((tk, i) => {
      const tx = 550 + i * 125;
      const ty = 460;
      const isSelected = this.tilak === tk.id;

      ctx.fillStyle = isSelected ? '#c2410c' : '#1e293b';
      ctx.beginPath();
      ctx.roundRect(tx, ty, 115, 36, 8);
      ctx.fill();

      ctx.strokeStyle = isSelected ? '#ffd700' : '#475569';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tk.name, tx + 57, ty + 23);
    });

    // CONFIRM BUTTON
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.roundRect(bx + 240, by + 445, 200, 44, 10);
    ctx.fill();
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SAVE & WEAR ✓', bx + 340, by + 473);

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

    // Tilak
    if (tilak === 'trident') {
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-3, -129);
      ctx.lineTo(0, -124);
      ctx.lineTo(3, -129);
      ctx.stroke();
      ctx.fillStyle = '#c62828';
      ctx.beginPath();
      ctx.arc(0, -125, 1.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (tilak === 'bindu') {
      ctx.fillStyle = '#c62828';
      ctx.beginPath();
      ctx.arc(0, -126, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (tilak === 'vibhuti') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-4, -127);
      ctx.lineTo(4, -127);
      ctx.moveTo(-4, -125);
      ctx.lineTo(4, -125);
      ctx.stroke();
      ctx.fillStyle = '#c62828';
      ctx.beginPath();
      ctx.arc(0, -126, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

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
      ctx.roundRect(-15, -142, 30, 16, [8, 8, 2, 2]);
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

    ctx.restore();
  }
}

export const wardrobeManager = new WardrobeManager();
