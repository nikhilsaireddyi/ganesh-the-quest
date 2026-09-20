/**
 * Main Entry Point - GANESH: THE QUEST
 */

import { Engine } from './core/Engine.js';
import { audioManager } from './audio/AudioManager.js';

// ── Polyfill: ctx.roundRect ─────────────────────────────────────────────────
// ctx.roundRect is not available on older browsers / some mobile WebViews.
// This one-time patch on the prototype covers every canvas usage in the game.
if (typeof CanvasRenderingContext2D !== 'undefined' &&
    typeof CanvasRenderingContext2D.prototype.roundRect !== 'function') {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
    let r = 0;
    if (Array.isArray(radii)) {
      r = radii[0] || 0;
    } else if (typeof radii === 'number') {
      r = radii;
    }
    r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    this.beginPath();
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.arcTo(x + w, y,     x + w, y + r,     r);
    this.lineTo(x + w, y + h - r);
    this.arcTo(x + w, y + h, x + w - r, y + h, r);
    this.lineTo(x + r, y + h);
    this.arcTo(x,     y + h, x,     y + h - r, r);
    this.lineTo(x,     y + r);
    this.arcTo(x,     y,     x + r, y,          r);
    this.closePath();
  };
}
// ───────────────────────────────────────────────────────────────────────────


function initGame() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) {
    console.error('[Engine] gameCanvas not found!');
    return;
  }

  try {
    const engine = new Engine(canvas);
    window.__engine = engine;

    // Audio unlock banner interaction
    const audioBanner = document.getElementById('audio-banner');
    const unlockAudio = () => {
      audioManager.resume();
      if (audioBanner) {
        audioBanner.classList.add('hidden');
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      if (audioBanner) {
        audioBanner.removeEventListener('click', unlockAudio);
        audioBanner.removeEventListener('touchstart', unlockAudio);
      }
      canvas.removeEventListener('touchstart', unlockAudio);
      canvas.removeEventListener('click', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    if (audioBanner) {
      audioBanner.addEventListener('click', unlockAudio);
      audioBanner.addEventListener('touchstart', unlockAudio, { passive: true });
    }
    canvas.addEventListener('click', unlockAudio);
    canvas.addEventListener('touchstart', unlockAudio, { passive: true });

    engine.start();
    console.log('[Engine] Game engine initialized and running successfully!');
  } catch (err) {
    console.error('[Engine] Critical startup failure:', err);
    // Display fallback on screen so any issue is immediately transparent
    const errBox = document.createElement('div');
    errBox.style.cssText = 'position:fixed;top:20%;left:10%;right:10%;background:#b91c1c;color:#fff;padding:24px;border-radius:12px;font-family:sans-serif;z-index:99999;box-shadow:0 10px 30px rgba(0,0,0,0.6);text-align:center;';
    errBox.innerHTML = `<h3 style="font-size:20px;margin-bottom:8px;">⚠️ Game Initialization Error</h3><p style="font-size:14px;opacity:0.9;">${err.message || err}</p><button onclick="if('caches' in window){caches.keys().then(k=>Promise.all(k.map(c=>caches.delete(c)))).then(()=>location.reload(true));}else{location.reload(true);}" style="margin-top:16px;padding:10px 20px;background:#ffd700;color:#111;border:none;border-radius:8px;cursor:pointer;font-weight:bold;font-size:14px;">Clear Cache & Reload</button>`;
    document.body.appendChild(errBox);
  }
}

// Safely execute whether DOM has already completed parsing or is still loading
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}

