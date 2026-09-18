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
      if (mx < bx || mx > bx + bw || my < by || my > by + bh || (mx > bx + bw - 50 && mx < bx + bw - 15 && my > by + 15 && my < by + 55)) {
        this.showModal = false;
        audioManager.playSnap();
        mouse.justPressed = false;
        return;
      }

      // Check Kurta Color Circles (row 0 at cy: 158, row 1 at cy: 212)
      KURTA_COLORS.forEach((color, i) => {
        const cx = 575 + (i % 3) * 115;
        const cy = 158 + Math.floor(i / 3) * 54;
        const dist = Math.hypot(mx - cx, my - cy);
        if (dist <= 24) {
          this.kurtaColor = color.hex;
          this.save();
          audioManager.playSnap();
          audioManager.vibrate([20]);
        }
      });

      // Check Headwear Options (row 0 at hy: 298, row 1 at hy: 340)
      HEADWEAR_STYLES.forEach((hw, i) => {
        const hx = 540 + (i % 2) * 185;
        const hy = 298 + Math.floor(i / 2) * 42;
        if (mx >= hx && mx <= hx + 175 && my >= hy && my <= hy + 34) {
          this.headwear = hw.id;
          this.save();
          audioManager.playSnap();
          audioManager.vibrate([20]);
        }
      });

      // Check Tilak Options (ty: 435)
      TILAK_STYLES.forEach((tk, i) => {
        const tx = 540 + i * 125;
        const ty = 435;
        if (mx >= tx && mx <= tx + 118 && my >= ty && my <= ty + 36) {
          this.tilak = tk.id;
          this.save();
          audioManager.playSnap();
          audioManager.vibrate([20]);
        }
      });

      // Done / Confirm Button (y: 520 to 568, x: 620 to 840)
      if (mx >= 620 && mx <= 840 && my >= 520 && my <= 568) {
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

    // Close button (X)
    ctx.fillStyle = '#ff7043';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('✕', bx + bw - 32, by + 38);

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

    // --- RIGHT CUSTOMIZATION OPTIONS ---

    // 1. Kurta Silk Color
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('1. Silk Kurta Color', 540, 128);

    KURTA_COLORS.forEach((c, i) => {
      const cx = 575 + (i % 3) * 115;
      const cy = 158 + Math.floor(i / 3) * 54;
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

    // 2. Traditional Headwear (Pheta)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('2. Traditional Headwear & Pheta', 540, 278);

    HEADWEAR_STYLES.forEach((hw, i) => {
      const hx = 540 + (i % 2) * 185;
      const hy = 298 + Math.floor(i / 2) * 42;
      const isSelected = this.headwear === hw.id;

      ctx.fillStyle = isSelected ? '#e65100' : '#1e293b';
      ctx.beginPath();
      ctx.roundRect(hx, hy, 175, 34, 8);
      ctx.fill();

      ctx.strokeStyle = isSelected ? '#ffd700' : '#475569';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(hw.name, hx + 87, hy + 22);
    });

    // 3. Sacred Tilak Mark (with generous 41px clearance above)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('3. Sacred Tilak Mark', 540, 415);

    TILAK_STYLES.forEach((tk, i) => {
      const tx = 540 + i * 125;
      const ty = 435;
      const isSelected = this.tilak === tk.id;

      ctx.fillStyle = isSelected ? '#c2410c' : '#1e293b';
      ctx.beginPath();
      ctx.roundRect(tx, ty, 118, 36, 8);
      ctx.fill();

      ctx.strokeStyle = isSelected ? '#ffd700' : '#475569';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(tk.name, tx + 59, ty + 23);
    });

    // CONFIRM BUTTON (with clean clearance)
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.roundRect(620, 520, 220, 48, 10);
    ctx.fill();
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SAVE & WEAR ✓', 730, 550);

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
