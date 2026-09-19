/**
 * Main Entry Point - GANESH: THE QUEST
 */

import { Engine } from './core/Engine.js';
import { audioManager } from './audio/AudioManager.js';

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
