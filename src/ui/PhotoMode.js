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
    if (this.game && typeof this.game.isGameplayScene === 'function') {
      if (!this.game.isGameplayScene()) return;
    }
    this.active = true;
    audioManager.playSnap();
  }

  exit() {
    this.active = false;
    audioManager.playSnap();
  }

  capture() {
    this.flashAlpha = 1.0;
    audioManager.playShutter();

    try {
      // 1. Capture pristine, clean game scene at full resolution (1280x720) without viewfinder or HUD
      let cleanCanvas = null;
      if (this.game && typeof this.game.captureCleanScreenshot === 'function') {
        cleanCanvas = this.game.captureCleanScreenshot();
      } else if (this.game && this.game.canvas) {
        cleanCanvas = this.game.canvas;
      }

      if (!cleanCanvas) return;

      const vw = cleanCanvas.width || (this.game ? this.game.virtualWidth : 1280);
      const vh = cleanCanvas.height || (this.game ? this.game.virtualHeight : 720);

      // 2. Create full-resolution output canvas
      const fullPic = document.createElement('canvas');
      fullPic.width = vw;
      fullPic.height = vh;
      const pctx = fullPic.getContext('2d');

      // Draw the complete, uncropped clean game world
      pctx.drawImage(cleanCanvas, 0, 0, vw, vh);

      // Subtle elegant festival watermark in bottom-right corner
      const now = new Date();
      pctx.save();
      pctx.fillStyle = 'rgba(15, 23, 42, 0.68)';
      pctx.beginPath();
      pctx.roundRect(vw - 360, vh - 44, 342, 32, 6);
      pctx.fill();
      pctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
      pctx.lineWidth = 1;
      pctx.stroke();

      pctx.fillStyle = '#ffd54f';
      pctx.font = 'bold 13px sans-serif';
      pctx.textAlign = 'right';
      pctx.fillText(`✨ Ganesh: The Quest • ${now.toLocaleDateString()}`, vw - 26, vh - 23);
      pctx.restore();

      const dataUrl = fullPic.toDataURL('image/jpeg', 0.92);

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
    a.download = `ganesh-quest-photo-${photo.id}.jpg`;
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
        this.capture();
        input.interactPressed = false;
        if (input.keys) input.keys['KeyC'] = false;
      }

      const vw = this.game ? this.game.virtualWidth : 1280;
      const vh = this.game ? this.game.virtualHeight : 720;
      const cx = vw / 2;

      const mouse = input.mouse;
      if (mouse && mouse.justPressed) {
        // Shutter button (center bottom: cx, vh - 75, radius: 42)
        if (Math.hypot(mouse.x - cx, mouse.y - (vh - 75)) <= 42) {
          this.capture();
          mouse.justPressed = false;
          return;
        }

        // Exit button (top right: vw - 130 to vw - 25, y: 15 to 62)
        if (mouse.x >= vw - 130 && mouse.x <= vw - 25 && mouse.y >= 15 && mouse.y <= 62) {
          this.exit();
          mouse.justPressed = false;
          return;
        }

        // Scrapbook button (bottom right: vw - 190 to vw - 30, y: vh - 90 to vh - 40)
        if (mouse.x >= vw - 190 && mouse.x <= vw - 30 && mouse.y >= vh - 90 && mouse.y <= vh - 40) {
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

        // Close Scrapbook (click outside 190..1090 or click Close)
        if (mx < 190 || mx > 1090 || my < 70 || my > 650 || (mx >= 1025 && mx <= 1085 && my >= 75 && my <= 125)) {
          this.showScrapbook = false;
          this.selectedPhoto = null;
          audioManager.playSnap();
          mouse.justPressed = false;
          return;
        }

        // If inspecting single photo
        if (this.selectedPhoto) {
          // Download button (x: 510 to 670, y: 555 to 605)
          if (mx >= 510 && mx <= 670 && my >= 555 && my <= 605) {
            this.downloadPhoto(this.selectedPhoto);
            mouse.justPressed = false;
            return;
          }
          // Back to gallery (x: 680 to 770, y: 555 to 605)
          if (mx >= 680 && mx <= 770 && my >= 555 && my <= 605) {
            this.selectedPhoto = null;
            audioManager.playSnap();
            mouse.justPressed = false;
            return;
          }
          return;
        }

        // Check clicking on polaroid cards in gallery
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

    const vw = this.game ? this.game.virtualWidth : 1280;
    const vh = this.game ? this.game.virtualHeight : 720;
    const cx = vw / 2;
    const cy = vh / 2;

    ctx.save();
    // Rule of Thirds Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.moveTo(vw / 3, 0);
    ctx.lineTo(vw / 3, vh);
    ctx.moveTo((2 * vw) / 3, 0);
    ctx.lineTo((2 * vw) / 3, vh);
    ctx.moveTo(0, vh / 3);
    ctx.lineTo(vw, vh / 3);
    ctx.moveTo(0, (2 * vh) / 3);
    ctx.lineTo(vw, (2 * vh) / 3);
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
    ctx.moveTo(vw - pad - len, pad);
    ctx.lineTo(vw - pad, pad);
    ctx.lineTo(vw - pad, pad + len);
    // Bottom-Left
    ctx.moveTo(pad, vh - pad - len);
    ctx.lineTo(pad, vh - pad);
    ctx.lineTo(pad + len, vh - pad);
    // Bottom-Right
    ctx.moveTo(vw - pad - len, vh - pad);
    ctx.lineTo(vw - pad, vh - pad);
    ctx.lineTo(vw - pad, vh - pad - len);
    ctx.stroke();

    // Center Golden Focus Reticle
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeRect(cx - 8, cy - 8, 16, 16);

    // Top Status Banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(cx - 180, 18, 360, 38, 10);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📸 PHOTO MODE • TAP SHUTTER OR [C]', cx, 42);

    // Exit Button Top Right
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(vw - 120, 18, 95, 40, 10);
    ctx.fill();
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT ✕', vw - 72, 43);

    // Scrapbook Button Bottom Right
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(vw - 180, vh - 85, 150, 42, 10);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`📖 SCRAPBOOK (${this.photos.length})`, vw - 105, vh - 59);

    // Shutter Button Bottom Center
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.beginPath();
    ctx.arc(cx, vh - 75, 42, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, vh - 75, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.fillStyle = '#e65100';
    ctx.beginPath();
    ctx.arc(cx, vh - 75, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderFlash(ctx) {
    if (this.flashAlpha > 0.01) {
      const vw = this.game ? this.game.virtualWidth : 1280;
      const vh = this.game ? this.game.virtualHeight : 720;
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
      ctx.fillRect(0, 0, vw, vh);
      ctx.restore();
    }
  }

  renderScrapbook(ctx) {
    if (!this.showScrapbook) return;

    ctx.save();
    const mx = 180;
    const my = 55;
    const mw = 920;
    const mh = 610;
    const cx = mx + mw / 2;

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
    ctx.fillText('📖 FESTIVAL MEMORIES SCRAPBOOK', cx, my + 44);

    // Close button [X]
    const btnX = mx + mw - 55;
    const btnY = my + 14;
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

    // If viewing single enlarged photo
    if (this.selectedPhoto) {
      const imgW = 720;
      const imgH = 405; // 16:9 ratio
      const imgX = cx - imgW / 2;
      const imgY = my + 75;

      // Outer gold frame
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.roundRect(imgX - 6, imgY - 6, imgW + 12, imgH + 12, 10);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (this.selectedPhoto._img) {
        ctx.drawImage(this.selectedPhoto._img, imgX, imgY, imgW, imgH);
      } else {
        const img = new Image();
        img.src = this.selectedPhoto.dataUrl;
        img.onload = () => { this.selectedPhoto._img = img; };
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(imgX, imgY, imgW, imgH);
      }

      // Download Button
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.roundRect(510, 555, 155, 42, 8);
      ctx.fill();
      ctx.strokeStyle = '#86efac';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('SAVE FULL PHOTO 💾', 587, 581);

      // Back Button
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(680, 555, 100, 42, 8);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('BACK ↩', 730, 581);

      ctx.restore();
      return;
    }

    if (this.photos.length === 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'italic 18px sans-serif';
      ctx.fillText('No photos yet! Click [📸 PHOTO] during your quest to capture memories.', cx, 340);
      ctx.restore();
      return;
    }

    // Grid of captured full-size photographs (16:9 thumbnails)
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

      // Photo Card frame
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(px, py, cardW, cardH, 8);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const imgW = cardW - 14;
      const imgH = 104;

      if (photo._img) {
        ctx.drawImage(photo._img, px + 7, py + 7, imgW, imgH);
      } else {
        const img = new Image();
        img.src = photo.dataUrl;
        img.onload = () => { photo._img = img; };
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(px + 7, py + 7, imgW, imgH);
      }

      // Caption
      ctx.fillStyle = '#ffd54f';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`✨ Snapshot #${this.photos.length - i}`, px + cardW / 2, py + cardH - 12);
    });

    ctx.fillStyle = '#ffd54f';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Click any snapshot to inspect full size & download 💾', mx + mw / 2, my + mh - 22);

    ctx.restore();
  }
}
