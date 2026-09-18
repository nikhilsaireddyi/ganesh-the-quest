/**
 * UIManager - Manages HUD, Settings, Credits, and Pause menus
 */

import { audioManager } from '../audio/AudioManager.js';
import { SaveSystem } from '../core/SaveSystem.js';

export class UIManager {
  constructor(game) {
    this.game = game;
    this.showSettings = false;
    this.showCredits = false;
    this.isPaused = false;

    this.musicVol = 0.6;
    this.sfxVol = 0.8;
    this.isMuted = false;

    // Load saved settings
    const save = SaveSystem.load();
    this.musicVol = save.musicVolume ?? 0.6;
    this.sfxVol = save.sfxVolume ?? 0.8;
    this.isMuted = save.isMuted ?? false;
    audioManager.setVolume(this.sfxVol, this.musicVol);
    audioManager.setMute(this.isMuted);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    audioManager.playSnap();
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    }
  }

  triggerGulal() {
    if (this.game) {
      const scene = this.game.sceneManager.currentScene;
      const px = (scene && scene.player) ? scene.player.x : 640;
      const py = (scene && scene.player) ? scene.player.y - 45 : 450;
      this.game.particles.emitGulal(px, py, 40);
      audioManager.playGulalSplash();
      if (this.game.achievements) {
        this.game.achievements.unlock('gulal_spirit');
      }
    }
  }

  update(dt, input) {
    if (input.pausePressed) {
      this.togglePause();
    }

    const mouse = input.mouse;

    // 1. Check HUD Button Clicks during normal gameplay
    if (!this.isPaused && !this.showSettings && !this.showCredits) {
      if (mouse.justPressed) {
        // Click Fullscreen Button [ ⛶ FULL ] (x: 915 to 1025, y: 20 to 58)
        if (mouse.x >= 915 && mouse.x <= 1025 && mouse.y >= 20 && mouse.y <= 58) {
          this.toggleFullscreen();
          audioManager.playSnap();
          return;
        }
        // Click Sound / Settings Button [ 🔊 SOUND ] (x: 1040 to 1165, y: 20 to 58)
        if (mouse.x >= 1040 && mouse.x <= 1165 && mouse.y >= 20 && mouse.y <= 58) {
          this.showSettings = true;
          audioManager.playSnap();
          return;
        }
        // Click Pause Button [ || PAUSE ] (x: 1175 to 1255, y: 20 to 58)
        if (mouse.x >= 1175 && mouse.x <= 1255 && mouse.y >= 20 && mouse.y <= 58) {
          this.togglePause();
          return;
        }

        // Click Photo Mode Button [ 📸 PHOTO ] (x: 24 to 134, y: 122 to 154)
        if (mouse.x >= 24 && mouse.x <= 134 && mouse.y >= 122 && mouse.y <= 154) {
          if (this.game && this.game.photoMode) {
            this.game.photoMode.enter();
          }
          return;
        }

        // Click Wardrobe Button [ 👕 WARDROBE ] (x: 144 to 264, y: 122 to 154)
        if (mouse.x >= 144 && mouse.x <= 264 && mouse.y >= 122 && mouse.y <= 154) {
          if (this.game && this.game.wardrobe) {
            this.game.wardrobe.showModal = true;
            audioManager.playSnap();
          }
          return;
        }

        // Click Badges Button [ 🏆 BADGES ] (x: 274 to 384, y: 122 to 154)
        if (mouse.x >= 274 && mouse.x <= 384 && mouse.y >= 122 && mouse.y <= 154) {
          if (this.game && this.game.achievements) {
            this.game.achievements.showModal = true;
            audioManager.playSnap();
          }
          return;
        }

        // Click Gulal Splash Button [ 🎨 GULAL ] (x: 1010 to 1125, y: 610 to 656)
        const isBlocked = this.game && typeof this.game.isUIBlocked === 'function'
          ? this.game.isUIBlocked()
          : Boolean(this.game && this.game.dialogue && this.game.dialogue.active);

        if (!isBlocked && mouse.x >= 1010 && mouse.x <= 1125 && mouse.y >= 610 && mouse.y <= 656) {
          this.triggerGulal();
          return;
        }
      }

      // Space key for Gulal in street / procession
      if (input.keys && input.keys['Space']) {
        const isBlocked = this.game && typeof this.game.isUIBlocked === 'function'
          ? this.game.isUIBlocked()
          : Boolean(this.game && this.game.dialogue && this.game.dialogue.active);
        if (!isBlocked) {
          this.triggerGulal();
          input.keys['Space'] = false;
        }
      }
      return;
    }

    // 2. Active Modals Interaction
    if (this.showSettings) {
      this.handleSettingsInteraction(mouse);
    } else if (this.showCredits) {
      if (mouse.justPressed) {
        this.showCredits = false;
        audioManager.playSnap();
      }
    } else if (this.isPaused) {
      if (mouse.justPressed) {
        this.handlePauseClick(mouse.x, mouse.y);
      }
    }
  }

  handlePauseClick(mx, my) {
    // Resume (x: 520 to 760, y: 280 to 330)
    if (mx >= 520 && mx <= 760 && my >= 280 && my <= 330) {
      this.isPaused = false;
      audioManager.playSnap();
    }
    // Settings (x: 520 to 760, y: 350 to 400)
    else if (mx >= 520 && mx <= 760 && my >= 350 && my <= 400) {
      this.showSettings = true;
      audioManager.playSnap();
    }
    // Reset (x: 520 to 760, y: 420 to 470)
    else if (mx >= 520 && mx <= 760 && my >= 420 && my <= 470) {
      SaveSystem.reset();
      window.location.reload();
    }
  }

  handleSettingsInteraction(mouse) {
    const mx = mouse.x;
    const my = mouse.y;

    // Close button [X] (x: 820 to 880, y: 150 to 195)
    if (mouse.justPressed && mx >= 820 && mx <= 880 && my >= 150 && my <= 195) {
      this.showSettings = false;
      SaveSystem.save({ musicVolume: this.musicVol, sfxVolume: this.sfxVol, isMuted: this.isMuted });
      audioManager.playSnap();
      return;
    }

    // Music Volume Slider (x: 480 to 760, y: 280 to 325)
    if (mouse.isDown && mx >= 460 && mx <= 780 && my >= 280 && my <= 325) {
      this.musicVol = Math.max(0, Math.min(1, (mx - 480) / 280));
      audioManager.setVolume(this.sfxVol, this.musicVol);
      SaveSystem.save({ musicVolume: this.musicVol, sfxVolume: this.sfxVol, isMuted: this.isMuted });
    }

    // SFX Volume Slider (x: 480 to 760, y: 360 to 405)
    if (mouse.isDown && mx >= 460 && mx <= 780 && my >= 360 && my <= 405) {
      const prev = this.sfxVol;
      this.sfxVol = Math.max(0, Math.min(1, (mx - 480) / 280));
      audioManager.setVolume(this.sfxVol, this.musicVol);
      SaveSystem.save({ musicVolume: this.musicVol, sfxVolume: this.sfxVol, isMuted: this.isMuted });
      if (Math.abs(prev - this.sfxVol) > 0.08) {
        audioManager.playSnap();
      }
    }

    // Toggle Mute Button (x: 520 to 760, y: 440 to 490)
    if (mouse.justPressed && mx >= 520 && mx <= 760 && my >= 440 && my <= 490) {
      this.isMuted = !this.isMuted;
      audioManager.setMute(this.isMuted);
      SaveSystem.save({ musicVolume: this.musicVol, sfxVolume: this.sfxVol, isMuted: this.isMuted });
      audioManager.playSnap();
    }
  }

  renderHUD(ctx, mission, playerX = 300, isSprinting = false) {
    if (!mission) return;

    ctx.save();
    // 1. MISSION CARD (Top-Left)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.beginPath();
    ctx.roundRect(24, 18, 380, 95, 12);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Mission Title
    ctx.fillStyle = '#ffb300';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('ACTIVE MISSION', 42, 38);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(mission.title, 42, 62);

    // Objective text
    ctx.fillStyle = '#cfd8dc';
    ctx.font = '13px sans-serif';
    ctx.fillText(mission.objective, 42, 88);

    // --- QUICK ACTION CHIPS (Under Mission Card) ---
    // 1. Photo Mode [ 📸 PHOTO ]
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(24, 122, 110, 32, 8);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('📸 PHOTO', 42, 143);

    // 2. Wardrobe [ 👕 WARDROBE ]
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(144, 122, 120, 32, 8);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('👕 WARDROBE', 158, 143);

    // 3. Badges [ 🏆 BADGES ]
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(274, 122, 110, 32, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('🏆 BADGES', 290, 143);

    // 4. Celebrate Gulal Splash Button (Bottom Right - positioned safely beside touch action button, hidden when UI blocked/dialogue active)
    const isBlocked = this.game && typeof this.game.isUIBlocked === 'function'
      ? this.game.isUIBlocked()
      : Boolean(this.game && this.game.dialogue && this.game.dialogue.active);

    if (!isBlocked) {
      ctx.fillStyle = '#db2777';
      ctx.beginPath();
      ctx.roundRect(1010, 610, 115, 46, 12);
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎨 GULAL', 1067, 638);
      ctx.textAlign = 'left';
    }

    // 2. STREET MINI-MAP (Top-Center)
    const mapX = 425;
    const mapY = 18;
    const mapW = 475;
    const mapH = 46;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.beginPath();
    ctx.roundRect(mapX, mapY, mapW, mapH, 10);
    ctx.fill();
    ctx.strokeStyle = '#ffb300';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Mini-map title / street distance
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('FESTIVAL STREET MINI-MAP', mapX + 14, mapY + 14);

    ctx.fillStyle = '#90a4ae';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(playerX)}m / 3000m`, mapX + mapW - 14, mapY + 14);
    ctx.textAlign = 'left';

    // Track baseline
    const trackStartX = mapX + 16;
    const trackEndX = mapX + mapW - 16;
    const trackW = trackEndX - trackStartX;
    const trackY = mapY + 28;

    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(trackStartX, trackY);
    ctx.lineTo(trackEndX, trackY);
    ctx.stroke();

    // Landmark icons on mini-map
    const landmarks = [
      { name: 'H1', x: 450, color: '#e57373' },
      { name: '🌸', x: 650, color: '#f06292' },
      { name: 'H2', x: 950, color: '#e57373' },
      { name: '👴', x: 1050, color: '#ffb74d' },
      { name: '★', x: 1400, color: '#ffd700', big: true }, // Mandapam
      { name: '👧', x: 1600, color: '#ba68c8' },
      { name: '🛕', x: 1800, color: '#ff9800' },
      { name: '⚡', x: 2160, color: '#00e676' }
    ];

    landmarks.forEach(lm => {
      const lx = trackStartX + (lm.x / 3000) * trackW;
      ctx.fillStyle = lm.color;
      ctx.beginPath();
      ctx.arc(lx, trackY, lm.big ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Player Pin (Animated Pulse)
    const playerPinX = trackStartX + Math.max(0, Math.min(1, playerX / 3000)) * trackW;
    const pulse = Math.sin(Date.now() * 0.008) * 2;
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.arc(playerPinX, trackY, 5 + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Sprinting Speed Badge indicator
    if (isSprinting) {
      ctx.fillStyle = '#ff6d00';
      ctx.beginPath();
      ctx.roundRect(mapX + mapW / 2 - 35, mapY + mapH + 4, 70, 18, 9);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ SPRINT', mapX + mapW / 2, mapY + mapH + 16);
      ctx.textAlign = 'left';
    }

    // 3. FULLSCREEN BUTTON (Top-Right)
    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.beginPath();
    ctx.roundRect(915, 18, 110, 46, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⛶ FULLSCREEN', 970, 45);

    // 4. SOUND / SETTINGS BUTTON (Top-Right)
    ctx.fillStyle = this.isMuted ? 'rgba(213, 0, 0, 0.88)' : 'rgba(255, 143, 0, 0.88)';
    ctx.beginPath();
    ctx.roundRect(1035, 18, 115, 46, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(this.isMuted ? '🔇 MUTED' : '🔊 SOUND', 1092, 45);

    // 5. PAUSE BUTTON (Top-Right edge)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.beginPath();
    ctx.roundRect(1160, 18, 95, 46, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('|| PAUSE', 1207, 45);

    ctx.restore();
  }

  renderContextPrompt(ctx, text = 'INTERACT [E]') {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 143, 0, 0.9)';
    ctx.beginPath();
    ctx.roundRect(540, 640, 200, 44, 22);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 640, 662);
    ctx.restore();
  }

  renderModals(ctx) {
    if (this.showSettings) {
      this.renderSettingsModal(ctx);
    } else if (this.showCredits) {
      this.renderCreditsModal(ctx);
    } else if (this.isPaused) {
      this.renderPauseMenu(ctx);
    }
  }

  renderPauseMenu(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(10, 14, 26, 0.85)';
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#1e2433';
    ctx.beginPath();
    ctx.roundRect(460, 180, 360, 360, 16);
    ctx.fill();
    ctx.strokeStyle = '#ffb300';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', 640, 235);

    // Buttons: Resume, Settings, Restart
    const buttons = [
      { text: 'RESUME', y: 280 },
      { text: 'SETTINGS', y: 350 },
      { text: 'RESTART CHECKPOINT', y: 420 }
    ];

    buttons.forEach(btn => {
      ctx.fillStyle = '#ff8f00';
      ctx.beginPath();
      ctx.roundRect(520, btn.y, 240, 50, 8);
      ctx.fill();
      ctx.strokeStyle = '#ffd54f';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(btn.text, 640, btn.y + 31);
    });

    ctx.restore();
  }

  renderSettingsModal(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(10, 14, 26, 0.88)';
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#1e2433';
    ctx.beginPath();
    ctx.roundRect(380, 140, 520, 440, 16);
    ctx.fill();
    ctx.strokeStyle = '#ffb300';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AUDIO SETTINGS', 640, 195);

    // Close Button [X]
    ctx.fillStyle = '#ff3d00';
    ctx.beginPath();
    ctx.roundRect(830, 160, 45, 34, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('X', 852, 183);

    // Music Volume Section
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🎵 Music Volume: ${Math.round(this.musicVol * 100)}%`, 480, 272);

    // Music Slider Track
    ctx.fillStyle = '#37474f';
    ctx.beginPath();
    ctx.roundRect(480, 286, 280, 10, 5);
    ctx.fill();
    // Music Slider Fill
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.roundRect(480, 286, 280 * this.musicVol, 10, 5);
    ctx.fill();
    // Music Draggable Knob
    const musicKnobX = 480 + 280 * this.musicVol;
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(musicKnobX, 291, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // SFX Volume Section
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🔔 Sound Effects (SFX): ${Math.round(this.sfxVol * 100)}%`, 480, 352);

    // SFX Slider Track
    ctx.fillStyle = '#37474f';
    ctx.beginPath();
    ctx.roundRect(480, 366, 280, 10, 5);
    ctx.fill();
    // SFX Slider Fill
    ctx.fillStyle = '#ff8f00';
    ctx.beginPath();
    ctx.roundRect(480, 366, 280 * this.sfxVol, 10, 5);
    ctx.fill();
    // SFX Draggable Knob
    const sfxKnobX = 480 + 280 * this.sfxVol;
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(sfxKnobX, 371, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Mute Button
    ctx.fillStyle = this.isMuted ? '#d50000' : '#00c853';
    ctx.beginPath();
    ctx.roundRect(520, 440, 240, 48, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.isMuted ? '🔇 UNMUTE ALL AUDIO' : '🔊 MUTE AUDIO', 640, 470);

    ctx.restore();
  }

  renderCreditsModal(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(10, 14, 26, 0.9)';
    ctx.fillRect(0, 0, 1280, 720);

    ctx.fillStyle = '#1e2433';
    ctx.beginPath();
    ctx.roundRect(340, 100, 600, 520, 16);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GANESH: THE QUEST', 640, 160);

    ctx.fillStyle = '#ffb300';
    ctx.font = 'italic 16px sans-serif';
    ctx.fillText('"A Festival. A Journey. A Homecoming."', 640, 195);

    ctx.fillStyle = '#e0e0e0';
    ctx.font = '15px sans-serif';
    const lines = [
      'Dedicated to the spirit, joy, and unity of Ganesh Chaturthi.',
      '',
      '• Concept & Architecture: Antigravity Game Engine',
      '• Visuals: Decoupled 2D/2.5D Replaceable Asset System',
      '• Audio: Procedural Web Audio Synthesizer (Dhol, Bells, Sitar)',
      '• Built for: Hackathons, PC, Mobile & Browser',
      '',
      'Ganpati Bappa Morya! 🙏'
    ];

    lines.forEach((l, i) => {
      ctx.fillText(l, 640, 245 + i * 28);
    });

    // Tap to close
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('[ Tap anywhere to close ]', 640, 570);

    ctx.restore();
  }
}
