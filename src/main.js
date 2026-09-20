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


window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
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
});
