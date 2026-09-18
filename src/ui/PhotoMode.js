/**
 * PhotoMode - Festival Camera & Collectible Scrapbook
 * Features live viewfinder, polaroid framing, flash animation,
 * gallery inspection, and instant image downloading.
 */

import { audioManager } from '../audio/AudioManager.js';

export class PhotoMode {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.showScrapbook = false;
    this.flashAlpha = 0;
    this.selectedPhoto = null;

    this.photos = [];
    this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem('ganesh_quest_scrapbook');
      if (saved) {
        this.photos = JSON.parse(saved);
      }
    } catch (_) {}
  }

  save() {
    try {
      // Keep up to 8 photos to stay within localStorage quota
      if (this.photos.length > 8) {
        this.photos = this.photos.slice(-8);
      }
      localStorage.setItem('ganesh_quest_scrapbook', JSON.stringify(this.photos));
    } catch (_) {}
  }

  enter() {
    this.active = true;
    audioManager.playSnap();
  }

  exit() {
    this.active = false;
    audioManager.playSnap();
  }

  capture(canvas) {
    if (!canvas) return;

    this.flashAlpha = 1.0;
    audioManager.playShutter();

    try {
      // Create offscreen canvas for polaroid framing
      const polaroid = document.createElement('canvas');
      polaroid.width = 640;
      polaroid.height = 420;
      const pctx = polaroid.getContext('2d');

      // Cream Polaroid Card
      pctx.fillStyle = '#fdfbf7';
      pctx.fillRect(0, 0, 640, 420);
      pctx.strokeStyle = '#e2d9cc';
      pctx.lineWidth = 4;
      pctx.strokeRect(2, 2, 636, 416);

      // Snapshot image inside
      pctx.drawImage(canvas, 20, 20, 600, 337);

      // Decorative handwritten caption
      pctx.fillStyle = '#2d241e';
      pctx.font = 'italic bold 18px serif';
      pctx.textAlign = 'left';
      pctx.fillText('✨ Ganeshotsav Memories • Pune', 25, 385);

      pctx.fillStyle = '#b45309';
      pctx.font = '13px sans-serif';
      pctx.textAlign = 'right';
      const now = new Date();
      pctx.fillText(`${now.toLocaleDateString()} • Auspicious Festival`, 615, 385);

      const dataUrl = polaroid.toDataURL('image/jpeg', 0.85);

      this.photos.unshift({
        id: Date.now(),
        dataUrl,
        date: now.toLocaleDateString()
      });

      this.save();
    } catch (err) {
      console.warn('[PhotoMode] Capture error:', err);
    }
  }

  downloadPhoto(photo) {
    if (!photo || !photo.dataUrl) return;
    const a = document.createElement('a');
    a.href = photo.dataUrl;
    a.download = `ganesh-quest-${photo.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    audioManager.playSuccess();
  }

  update(dt, input) {
    if (this.flashAlpha > 0) {
      this.flashAlpha = Math.max(0, this.flashAlpha - dt * 3.5);
    }

    if (this.active) {
      if (input.interactPressed || (input.keys && input.keys['KeyC'])) {
        this.capture(this.game.canvas);
        input.interactPressed = false;
        if (input.keys) input.keys['KeyC'] = false;
      }

      const mouse = input.mouse;
      if (mouse && mouse.justPressed) {
        // Shutter button (center bottom: 640, 650, radius: 36)
        if (Math.hypot(mouse.x - 640, mouse.y - 650) <= 36) {
          this.capture(this.game.canvas);
          mouse.justPressed = false;
          return;
        }

        // Exit button (top right: 1140 to 1255, y: 15 to 62)
        if (mouse.x >= 1140 && mouse.x <= 1255 && mouse.y >= 15 && mouse.y <= 62) {
          this.exit();
          mouse.justPressed = false;
          return;
        }

        // Scrapbook button (bottom right: 1100, 640)
        if (mouse.x >= 1060 && mouse.x <= 1240 && mouse.y >= 625 && mouse.y <= 675) {
          this.showScrapbook = true;
          this.active = false;
          audioManager.playSnap();
          mouse.justPressed = false;
          return;
        }
      }
      return;
    }

    if (this.showScrapbook) {
      const mouse = input.mouse;
      if (mouse && mouse.justPressed) {
        const mx = mouse.x;
        const my = mouse.y;

        // Close Scrapbook (click outside 200..1080 or click Close)
        if (mx < 180 || mx > 1100 || my < 60 || my > 660 || (mx > 1030 && mx < 1070 && my > 70 && my < 110)) {
          this.showScrapbook = false;
          this.selectedPhoto = null;
          audioManager.playSnap();
          mouse.justPressed = false;
          return;
        }

        // If inspecting single photo
        if (this.selectedPhoto) {
          // Download button
          if (mx >= 520 && mx <= 660 && my >= 575 && my <= 620) {
            this.downloadPhoto(this.selectedPhoto);
            mouse.justPressed = false;
            return;
          }
          // Back to gallery
          if (mx >= 680 && mx <= 760 && my >= 575 && my <= 620) {
            this.selectedPhoto = null;
            audioManager.playSnap();
            mouse.justPressed = false;
            return;
          }
          return;
        }

        // Check clicking on polaroid cards in gallery
        const startX = 220;
        const startY = 150;
        const cardW = 200;
        const cardH = 150;
        const gapX = 20;
        const gapY = 25;

        this.photos.forEach((photo, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const px = startX + col * (cardW + gapX);
          const py = startY + row * (cardH + gapY);

          if (mx >= px && mx <= px + cardW && my >= py && my <= py + cardH) {
            this.selectedPhoto = photo;
            audioManager.playSnap();
            mouse.justPressed = false;
          }
        });
      }

      if (input.interactPressed) {
        this.showScrapbook = false;
        this.selectedPhoto = null;
        input.interactPressed = false;
      }
    }
  }

  renderViewfinder(ctx) {
    if (!this.active) return;

    ctx.save();
    // Rule of Thirds Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(426, 0);
    ctx.lineTo(426, 720);
    ctx.moveTo(853, 0);
    ctx.lineTo(853, 720);
    ctx.moveTo(0, 240);
    ctx.lineTo(1280, 240);
    ctx.moveTo(0, 480);
    ctx.lineTo(1280, 480);
    ctx.stroke();
    ctx.setLineDash([]);

    // Viewfinder Corner Brackets
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3.5;
    const pad = 40;
    const len = 35;
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(pad, pad + len);
    ctx.lineTo(pad, pad);
    ctx.lineTo(pad + len, pad);
    // Top-Right
    ctx.moveTo(1280 - pad - len, pad);
    ctx.lineTo(1280 - pad, pad);
    ctx.lineTo(1280 - pad, pad + len);
    // Bottom-Left
    ctx.moveTo(pad, 720 - pad - len);
    ctx.lineTo(pad, 720 - pad);
    ctx.lineTo(pad + len, 720 - pad);
    // Bottom-Right
    ctx.moveTo(1280 - pad - len, 720 - pad);
    ctx.lineTo(1280 - pad, 720 - pad);
    ctx.lineTo(1280 - pad, 720 - pad - len);
    ctx.stroke();

    // Center Golden Focus Reticle
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(640, 360, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeRect(632, 352, 16, 16);

    // Top Status Banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(460, 18, 360, 38, 10);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📸 PHOTO MODE • TAP SHUTTER OR [C]', 640, 42);

    // Exit Button Top Right
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(1150, 18, 95, 40, 10);
    ctx.fill();
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT ✕', 1197, 43);

    // Scrapbook Button Bottom Right
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(1070, 630, 150, 42, 10);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`📖 SCRAPBOOK (${this.photos.length})`, 1145, 656);

    // Shutter Button Bottom Center
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.beginPath();
    ctx.arc(640, 650, 42, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(640, 650, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.fillStyle = '#e65100';
    ctx.beginPath();
    ctx.arc(640, 650, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderFlash(ctx) {
    if (this.flashAlpha > 0.01) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
      ctx.fillRect(0, 0, 1280, 720);
      ctx.restore();
    }
  }

  renderScrapbook(ctx) {
    if (!this.showScrapbook) return;

    ctx.save();
    // Backdrop
    ctx.fillStyle = 'rgba(5, 8, 18, 0.9)';
    ctx.fillRect(0, 0, 1280, 720);

    const mx = 180;
    const my = 55;
    const mw = 920;
    const mh = 610;

    // Album Frame
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(mx, my, mw, mh, 16);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px serif';
    ctx.textAlign = 'center';
    ctx.fillText('📖 FESTIVAL MEMORIES SCRAPBOOK', mx + mw / 2, my + 44);

    // Close button
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('✕', mx + mw - 35, my + 40);

    // If viewing single enlarged photo
    if (this.selectedPhoto) {
      if (this.selectedPhoto._img) {
        ctx.drawImage(this.selectedPhoto._img, 340, 130, 600, 394);
      } else {
        const img = new Image();
        img.src = this.selectedPhoto.dataUrl;
        img.onload = () => { this.selectedPhoto._img = img; };
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(340, 130, 600, 394);
      }

      // Download Button
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.roundRect(520, 560, 140, 40, 8);
      ctx.fill();
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('SAVE 💾', 590, 585);

      // Back Button
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(680, 560, 100, 40, 8);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('BACK ↩', 730, 585);

      ctx.restore();
      return;
    }

    if (this.photos.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'italic 18px sans-serif';
      ctx.fillText('No photos yet! Click [📸 PHOTO] during your quest to capture memories.', mx + mw / 2, 340);
      ctx.restore();
      return;
    }

    // Grid of captured polaroids
    const startX = 220;
    const startY = 130;
    const cardW = 200;
    const cardH = 155;
    const gapX = 22;
    const gapY = 25;

    this.photos.forEach((photo, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const px = startX + col * (cardW + gapX);
      const py = startY + row * (cardH + gapY);

      // Polaroid Card frame
      ctx.fillStyle = '#fdfbf7';
      ctx.beginPath();
      ctx.roundRect(px, py, cardW, cardH, 6);
      ctx.fill();
      ctx.strokeStyle = '#d6cbbe';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (photo._img) {
        ctx.drawImage(photo._img, px + 8, py + 8, cardW - 16, cardH - 36);
      } else {
        const img = new Image();
        img.src = photo.dataUrl;
        img.onload = () => { photo._img = img; };
      }

      // Caption
      ctx.fillStyle = '#451a03';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Snapshot #${this.photos.length - i}`, px + cardW / 2, py + cardH - 10);
    });

    ctx.fillStyle = '#ffd54f';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Click any snapshot to inspect full size & download 💾', mx + mw / 2, my + mh - 22);

    ctx.restore();
  }
}
