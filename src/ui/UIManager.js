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
    this.backgroundBells = save.backgroundBells ?? true;
    audioManager.setVolume(this.sfxVol, this.musicVol);
    audioManager.setMute(this.isMuted);
    audioManager.setBackgroundBells(this.backgroundBells);
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

    const vw = this.game ? this.game.virtualWidth : 1280;
    const vh = this.game ? this.game.virtualHeight : 720;
    const pauseX = vw - 120;
    const soundX = vw - 245;
    const fsX = vw - 365;

    // 1. Check HUD Button Clicks during normal gameplay
    const isPhotoActive = this.game.photoMode && (this.game.photoMode.active || this.game.photoMode.showScrapbook);
    const isWardrobeActive = this.game.wardrobe && this.game.wardrobe.showModal;
    const isBadgesActive = this.game.achievements && this.game.achievements.showModal;

    const activeSceneKey = this.game && this.game.sceneManager ? this.game.sceneManager.currentSceneKey : '';
    const isGameplay = activeSceneKey === 'street' || activeSceneKey === 'procession';

    if (isGameplay && !this.isPaused && !this.showSettings && !this.showCredits && !isPhotoActive && !isWardrobeActive && !isBadgesActive) {
      if (mouse.justPressed) {
        // Click Fullscreen Button [ ⛶ FULL ]
        if (mouse.x >= fsX && mouse.x <= fsX + 110 && mouse.y >= 18 && mouse.y <= 64) {
          this.toggleFullscreen();
          audioManager.playSnap();
          return;
        }
        // Click Sound / Settings Button [ 🔊 SOUND ]
        if (mouse.x >= soundX && mouse.x <= soundX + 115 && mouse.y >= 18 && mouse.y <= 64) {
          this.showSettings = true;
          audioManager.playSnap();
          return;
        }
        // Click Pause Button [ || PAUSE ]
        if (mouse.x >= pauseX && mouse.x <= pauseX + 95 && mouse.y >= 18 && mouse.y <= 64) {
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

        // Click / Touch Gulal Splash Button [ 🎨 GULAL ]
        const isBlocked = this.game && typeof this.game.isUIBlocked === 'function'
          ? this.game.isUIBlocked()
          : Boolean(this.game && this.game.dialogue && this.game.dialogue.active);

        const isMobile = Boolean(this.game && this.game.input && this.game.input.isMobile);
        const layout = this.game && this.game.input && typeof this.game.input.getButtonLayout === 'function'
          ? this.game.input.getButtonLayout()
          : null;
        const gx = isMobile && layout ? layout.gulal.x : (isMobile ? vw - 340 : vw - 150);
        const gy = isMobile && layout ? layout.gulal.y : (isMobile ? vh - 106 : vh - 80);
        const gw = isMobile && layout ? layout.gulal.w : (isMobile ? 128 : 120);
        const gh = isMobile && layout ? layout.gulal.h : (isMobile ? 54 : 48);

        if (!isBlocked && (input.gulalPressed || (mouse.x >= gx && mouse.x <= gx + gw && mouse.y >= gy && mouse.y <= gy + gh))) {
          input.gulalPressed = false;
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
    const modalInput = this.game && typeof this.game.getModalInputProxy === 'function'
      ? this.game.getModalInputProxy(input)
      : input;
    const modalMouse = modalInput.mouse;

    if (this.showSettings) {
      this.handleSettingsInteraction(modalMouse);
    } else if (this.showCredits) {
      if (modalMouse.justPressed) {
        const cx = 640;
        const cardX = 220;
        const cardY = 85;
        const cardW = 840;
        const cardH = 565;
        const bellBtnX = cx - 190;
        const bellBtnW = 380;
        const bellBtnY = 471;
        const bellBtnH = 36;

        // CRITICAL: Immediately consume click so it NEVER leaks to TitleScene / Main Menu!
        modalMouse.justPressed = false;
        if (input.mouse) input.mouse.justPressed = false;

        // 1. Check if player clicked the interactive Easter Egg Bell button
        if (modalMouse.x >= bellBtnX && modalMouse.x <= bellBtnX + bellBtnW && modalMouse.y >= bellBtnY && modalMouse.y <= bellBtnY + bellBtnH) {
          audioManager.playSuccess();
          this.creditsBellClicks = (this.creditsBellClicks || 0) + 1;
          if (this.game && this.game.particles) {
            this.game.particles.emitDivineAura(cx, bellBtnY + 18, 30);
            this.game.particles.emitPetals(cx, bellBtnY + 18, 20);
          }
          return;
        }

        // 2. Check Close button [X] at top-right
        const isCloseBtn = (modalMouse.x >= cardX + cardW - 46 && modalMouse.x <= cardX + cardW - 14 && modalMouse.y >= cardY + 14 && modalMouse.y <= cardY + 42);

        // 3. Check click outside the modal card
        const isOutside = (modalMouse.x < cardX || modalMouse.x > cardX + cardW || modalMouse.y < cardY || modalMouse.y > cardY + cardH);

        if (isCloseBtn || isOutside) {
          this.showCredits = false;
          audioManager.playSnap();
        }
      }
    } else if (this.isPaused) {
      if (modalMouse.justPressed) {
        this.handlePauseClick(modalMouse.x, modalMouse.y);
      }
    }
  }

  handlePauseClick(mx, my) {
    if (this.game && this.game.input && this.game.input.mouse) {
      this.game.input.mouse.justPressed = false;
    }

    // Close button [X] at top-right
    if (mx >= 760 && mx <= 810 && my >= 190 && my <= 235) {
      this.isPaused = false;
      audioManager.playSnap();
      return;
    }

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
    if (mouse && mouse.justPressed) {
      if (this.game && this.game.input && this.game.input.mouse) {
        this.game.input.mouse.justPressed = false;
      }
    }

    const mx = mouse.x;
    const my = mouse.y;

    // Close button [X] (x: 835 to 895, y: 140 to 195)
    if (mouse.justPressed && mx >= 835 && mx <= 895 && my >= 140 && my <= 195) {
      this.showSettings = false;
      SaveSystem.save({ musicVolume: this.musicVol, sfxVolume: this.sfxVol, isMuted: this.isMuted, backgroundBells: this.backgroundBells });
      audioManager.playSnap();
      return;
    }

    // Music Volume Slider (x: 460 to 780, y: 250 to 290)
    if (mouse.isDown && mx >= 460 && mx <= 780 && my >= 250 && my <= 290) {
      this.musicVol = Math.max(0, Math.min(1, (mx - 480) / 280));
      audioManager.setVolume(this.sfxVol, this.musicVol);
      SaveSystem.save({ musicVolume: this.musicVol, sfxVolume: this.sfxVol, isMuted: this.isMuted, backgroundBells: this.backgroundBells });
    }

    // SFX Volume Slider (x: 460 to 780, y: 320 to 360)
    if (mouse.isDown && mx >= 460 && mx <= 780 && my >= 320 && my <= 360) {
      const prev = this.sfxVol;
      this.sfxVol = Math.max(0, Math.min(1, (mx - 480) / 280));
      audioManager.setVolume(this.sfxVol, this.musicVol);
      SaveSystem.save({ musicVolume: this.musicVol, sfxVolume: this.sfxVol, isMuted: this.isMuted, backgroundBells: this.backgroundBells });
      if (Math.abs(prev - this.sfxVol) > 0.08) {
        audioManager.playSnap();
      }
    }

    // Toggle Background Bells Button (x: 490 to 770, y: 390 to 434)
    if (mouse.justPressed && mx >= 490 && mx <= 770 && my >= 390 && my <= 434) {
      this.backgroundBells = !this.backgroundBells;
      audioManager.setBackgroundBells(this.backgroundBells);
      SaveSystem.save({ musicVolume: this.musicVol, sfxVolume: this.sfxVol, isMuted: this.isMuted, backgroundBells: this.backgroundBells });
      audioManager.playSnap();
      audioManager.vibrate([20]);
    }

    // Toggle Mute Button (x: 510 to 750, y: 450 to 498)
    if (mouse.justPressed && mx >= 510 && mx <= 750 && my >= 450 && my <= 498) {
      this.isMuted = !this.isMuted;
      audioManager.setMute(this.isMuted);
      SaveSystem.save({ musicVolume: this.musicVol, sfxVolume: this.sfxVol, isMuted: this.isMuted, backgroundBells: this.backgroundBells });
      audioManager.playSnap();
    }
  }

  renderHUD(ctx, mission, playerX = 300, isSprinting = false) {
    if (!mission) return;
    if (this.game.photoMode && (this.game.photoMode.active || this.game.photoMode.showScrapbook)) return;

    const vw = this.game ? this.game.virtualWidth : 1280;
    const vh = this.game ? this.game.virtualHeight : 720;

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

    // 4. Celebrate Gulal Splash Button (Bottom Right - adapt to mobile vs PC layout)
    const isBlocked = this.game && typeof this.game.isUIBlocked === 'function'
      ? this.game.isUIBlocked()
      : Boolean(this.game && this.game.dialogue && this.game.dialogue.active);

    const isMobile = Boolean(this.game && this.game.input && this.game.input.isMobile);
    const layout = this.game && this.game.input && typeof this.game.input.getButtonLayout === 'function'
      ? this.game.input.getButtonLayout()
      : null;
    const gx = isMobile && layout ? layout.gulal.x : (isMobile ? vw - 340 : vw - 150);
    const gy = isMobile && layout ? layout.gulal.y : (isMobile ? vh - 106 : vh - 80);
    const gw = isMobile && layout ? layout.gulal.w : (isMobile ? 128 : 120);
    const gh = isMobile && layout ? layout.gulal.h : (isMobile ? 54 : 48);

    if (!isBlocked) {
      const scale = layout && layout.scale ? layout.scale : 1;
      const isPressed = Boolean(this.game && this.game.input && this.game.input.mobileButtons && this.game.input.mobileButtons.gulal);
      ctx.fillStyle = isPressed ? '#be185d' : '#db2777';
      ctx.beginPath();
      ctx.roundRect(gx, gy, gw, gh, Math.round(16 * scale));
      ctx.fill();
      ctx.strokeStyle = isPressed ? '#ffffff' : '#fde047';
      ctx.lineWidth = isPressed ? 2.8 : 2.0;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = isMobile ? `bold ${Math.round(15 * scale)}px sans-serif` : 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isMobile ? '🎨 GULAL' : '🎨 GULAL [Space]', gx + gw / 2, gy + gh / 2 + 5);
      ctx.textAlign = 'left';
    }

    // 2. STREET MINI-MAP (Top-Center)
    const mapW = 475;
    const mapX = Math.round((vw - mapW) / 2);
    const mapY = 18;
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
      { name: '👧', x: 1670, color: '#ba68c8' },
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
    const pauseX = vw - 120;
    const soundX = vw - 245;
    const fsX = vw - 365;

    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.beginPath();
    ctx.roundRect(fsX, 18, 110, 46, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⛶ FULLSCREEN', fsX + 55, 45);

    // 4. SOUND / SETTINGS BUTTON (Top-Right)
    ctx.fillStyle = this.isMuted ? 'rgba(213, 0, 0, 0.88)' : 'rgba(255, 143, 0, 0.88)';
    ctx.beginPath();
    ctx.roundRect(soundX, 18, 115, 46, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(this.isMuted ? '🔇 MUTED' : '🔊 SOUND', soundX + 57, 45);

    // 5. PAUSE BUTTON (Top-Right edge)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.beginPath();
    ctx.roundRect(pauseX, 18, 95, 46, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('|| PAUSE', pauseX + 47, 45);

    ctx.restore();
  }

  renderContextPrompt(ctx, text = null) {
    const isMobile = this.game && this.game.input && this.game.input.isMobile;
    let displayText = text;
    if (!displayText) {
      displayText = isMobile ? 'PRESS [ACT] TO INTERACT' : 'PRESS [E] TO INTERACT';
    } else if (isMobile) {
      displayText = displayText.replace(/\[E\]/g, '[ACT]').replace(/press\s+e\b/gi, 'PRESS [ACT]');
    } else {
      displayText = displayText.replace(/\[ACT\]/g, '[E]').replace(/press\s+act\b/gi, 'PRESS [E]');
    }

    const vw = this.game ? this.game.virtualWidth : 1280;
    const vh = this.game ? this.game.virtualHeight : 720;
    const cx = vw / 2;

    ctx.save();
    ctx.font = 'bold 15px sans-serif';
    const textW = ctx.measureText(displayText).width;
    const chipW = Math.max(220, textW + 36);

    ctx.fillStyle = 'rgba(255, 143, 0, 0.92)';
    ctx.beginPath();
    ctx.roundRect(cx - chipW / 2, vh - 160, chipW, 46, 23);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayText, cx, vh - 137);
    ctx.restore();
  }

  renderModals(ctx) {
    if (!this.showSettings && !this.showCredits && !this.isPaused) return;

    if (this.game && typeof this.game.renderCenteredModal === 'function') {
      this.game.renderCenteredModal(ctx, () => {
        if (this.showSettings) {
          this.renderSettingsModal(ctx);
        } else if (this.showCredits) {
          this.renderCreditsModal(ctx);
        } else if (this.isPaused) {
          this.renderPauseMenu(ctx);
        }
      });
    } else {
      if (this.showSettings) {
        this.renderSettingsModal(ctx);
      } else if (this.showCredits) {
        this.renderCreditsModal(ctx);
      } else if (this.isPaused) {
        this.renderPauseMenu(ctx);
      }
    }
  }

  renderPauseMenu(ctx) {
    ctx.save();
    ctx.fillStyle = '#1e2433';
    ctx.beginPath();
    ctx.roundRect(460, 180, 360, 360, 16);
    ctx.fill();
    ctx.strokeStyle = '#ffb300';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Close Button [X]
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(765, 195, 40, 36, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✕', 785, 219);

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

    ctx.fillStyle = '#1e2433';
    ctx.beginPath();
    ctx.roundRect(380, 135, 520, 440, 16);
    ctx.fill();
    ctx.strokeStyle = '#ffb300';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AUDIO SETTINGS', 640, 185);

    // Close Button [X]
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(845, 150, 40, 36, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✕', 865, 174);

    // Music Volume Section
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🎵 Music Volume: ${Math.round(this.musicVol * 100)}%`, 480, 248);

    // Music Slider Track
    ctx.fillStyle = '#37474f';
    ctx.beginPath();
    ctx.roundRect(480, 260, 280, 10, 5);
    ctx.fill();
    // Music Slider Fill
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.roundRect(480, 260, 280 * this.musicVol, 10, 5);
    ctx.fill();
    // Music Draggable Knob
    const musicKnobX = 480 + 280 * this.musicVol;
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(musicKnobX, 265, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // SFX Volume Section
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🔊 Sound Effects (SFX): ${Math.round(this.sfxVol * 100)}%`, 480, 318);

    // SFX Slider Track
    ctx.fillStyle = '#37474f';
    ctx.beginPath();
    ctx.roundRect(480, 330, 280, 10, 5);
    ctx.fill();
    // SFX Slider Fill
    ctx.fillStyle = '#ff8f00';
    ctx.beginPath();
    ctx.roundRect(480, 330, 280 * this.sfxVol, 10, 5);
    ctx.fill();
    // SFX Draggable Knob
    const sfxKnobX = 480 + 280 * this.sfxVol;
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(sfxKnobX, 335, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Background Bells Toggle Button
    ctx.fillStyle = this.backgroundBells ? '#15803d' : '#475569';
    ctx.beginPath();
    ctx.roundRect(490, 390, 280, 42, 8);
    ctx.fill();
    ctx.strokeStyle = this.backgroundBells ? '#ffd700' : '#94a3b8';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.backgroundBells ? '🔔 BACKGROUND BELLS: ON' : '🔕 BACKGROUND BELLS: OFF', 630, 416);

    // Mute Button
    ctx.fillStyle = this.isMuted ? '#d50000' : '#0284c7';
    ctx.beginPath();
    ctx.roundRect(510, 450, 240, 44, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.isMuted ? '🔇 UNMUTE ALL AUDIO' : '🔊 MUTE AUDIO', 630, 477);

    ctx.restore();
  }

  renderCreditsModal(ctx) {
    ctx.save();

    const cx = 640;
    const cardW = 840;
    const cardH = 565;
    const cardX = cx - cardW / 2; // 220
    const cardY = 85;
    const animTime = performance.now() * 0.003;

    // 1. Dark Glass Card Background with Deep Cosmic Vignette
    const bgGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.98)');
    bgGrad.addColorStop(0.5, 'rgba(28, 18, 48, 0.98)');
    bgGrad.addColorStop(1, 'rgba(15, 23, 42, 0.98)');
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 16);
    ctx.fill();

    // Golden Outer Border
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Corner Gold Studs
    ctx.fillStyle = '#ffd700';
    const corners = [
      [cardX + 12, cardY + 12],
      [cardX + cardW - 12, cardY + 12],
      [cardX + 12, cardY + cardH - 12],
      [cardX + cardW - 12, cardY + cardH - 12]
    ];
    corners.forEach(([ox, oy]) => {
      ctx.beginPath();
      ctx.arc(ox, oy, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Close Button [✕]
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(cardX + cardW - 46, cardY + 14, 32, 28, 7);
    ctx.fill();
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✕', cardX + cardW - 30, cardY + 28);

    // Header Title & Subtitle
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 22px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GANESH: THE QUEST', cx, cardY + 26);

    ctx.fillStyle = '#fde047';
    ctx.font = 'italic 12px sans-serif';
    ctx.fillText('"A Festival. A Journey. A Team Miracle."  •  Presented by Team VIBΞX', cx, cardY + 46);

    // Golden Divider Line
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cardX + 30, cardY + 58);
    ctx.lineTo(cardX + cardW - 30, cardY + 58);
    ctx.stroke();

    // ── 2-COLUMN BALANCED ROSTER LAYOUT ─────────────────────────────────────
    const colW = 388;
    const colX1 = cardX + 24; // 244
    const colX2 = cardX + cardW - 24 - colW; // 648
    const rowH = 66;

    const renderRoleCard = (r, rx, ry, rw, rh) => {
      // Background Box
      ctx.fillStyle = 'rgba(22, 27, 42, 0.92)';
      ctx.beginPath();
      ctx.roundRect(rx, ry, rw, rh, 8);
      ctx.fill();

      // Border
      ctx.strokeStyle = r.border;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Left Color Accent Strip
      ctx.fillStyle = r.accent;
      ctx.beginPath();
      ctx.roundRect(rx + 1, ry + 1, 5, rh - 2, [7, 0, 0, 7]);
      ctx.fill();

      // Top line: Role + Meme Badge
      ctx.fillStyle = r.color;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(r.role, rx + 14, ry + 7);

      // Badge Pill
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(rx + rw - 170, ry + 5, 162, 18, 5);
      ctx.fill();
      ctx.fillStyle = r.color;
      ctx.font = 'bold 9.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(r.badge, rx + rw - 89, ry + 14);

      // Second line: Name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(r.name, rx + 14, ry + 25);

      // Third line: Quote / Lore
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'italic 10.5px sans-serif';
      ctx.fillText(r.quote, rx + 14, ry + 46);
    };

    // Row 1 (Lead & Story Writer)
    const row1Y = cardY + 68; // 153
    renderRoleCard({
      role: '👑  LEAD',
      name: 'Harshini',
      badge: '⏰ DEADLINE ENFORCER',
      quote: '✦ "Guys is it done yet? Hackathon ends in 10 mins!"',
      color: '#f59e0b',
      border: 'rgba(245, 158, 11, 0.5)',
      accent: '#f59e0b'
    }, colX1, row1Y, colW, rowH);

    renderRoleCard({
      role: '📖  STORY WRITER',
      name: 'Lokeshwari',
      badge: '🎭 LORE ARCHITECT',
      quote: '✦ Turned 5 street errands into an emotional anime arc!',
      color: '#ec4899',
      border: 'rgba(236, 72, 153, 0.5)',
      accent: '#ec4899'
    }, colX2, row1Y, colW, rowH);

    // Row 2 (Web Designer & Props/Audio)
    const row2Y = row1Y + rowH + 6; // 225
    renderRoleCard({
      role: '💻  WEB DESIGNER',
      name: 'Polinaidu',
      badge: '🎯 RESPONSIVE WIZARD',
      quote: '✦ Fought margin-top on 50 devices: "Just add 5px padding bro"',
      color: '#38bdf8',
      border: 'rgba(56, 189, 248, 0.5)',
      accent: '#38bdf8'
    }, colX1, row2Y, colW, rowH);

    renderRoleCard({
      role: '🎶  PROPS & AUDIO',
      name: 'Venkat',
      badge: '🎧 3 AM BEATS & BELLS',
      quote: '✦ Synthesized dhol beats at midnight: "Turn Bappa to 11!"',
      color: '#a855f7',
      border: 'rgba(168, 85, 247, 0.5)',
      accent: '#a855f7'
    }, colX2, row2Y, colW, rowH);

    // Row 3 - Featured Full-Width Card (Background & Bug Fixes)
    const row3Y = row2Y + rowH + 6; // 297
    const wideW = colW * 2 + 16; // 792
    renderRoleCard({
      role: '🛠️  BACKGROUND & BUG FIXES',
      name: 'Gnan Charan  &  Nikhil Sai Reddy',
      badge: '☕ 4 AM BUG EXTERMINATORS',
      quote: '✦ Placed 1,000 houses & mango trees; fixed 99 bugs, created 128, fixed all 128!',
      color: '#10b981',
      border: 'rgba(16, 185, 129, 0.5)',
      accent: '#10b981'
    }, colX1, row3Y, wideW, 62);

    // ── TEAM VIBΞX GRAND EMBLEM (SPACIOUS, GENEROUS BREATHING ROOM) ───────────
    const teamY = row3Y + 70; // 367
    const teamH = 156;

    const teamGrad = ctx.createLinearGradient(colX1, teamY, colX1 + wideW, teamY + teamH);
    teamGrad.addColorStop(0, 'rgba(30, 27, 75, 0.96)');
    teamGrad.addColorStop(0.5, 'rgba(65, 18, 88, 0.96)');
    teamGrad.addColorStop(1, 'rgba(30, 27, 75, 0.96)');
    ctx.fillStyle = teamGrad;
    ctx.beginPath();
    ctx.roundRect(colX1, teamY, wideW, teamH, 12);
    ctx.fill();

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 1. Roster Header (y = teamY + 22)
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★  OFFICIAL TEAM ROSTER  ★', cx, teamY + 22);

    // 2. Team Name (y = teamY + 52) - 30px below header, no overlap
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 10;
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('TEAM  VIBΞX', cx, teamY + 52);
    ctx.shadowBlur = 0;

    // 3. Meme Tagline (y = teamY + 78) - 26px below team name, clear spacing
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'italic 11.5px sans-serif';
    ctx.fillText('"0 Sleep • 5,000 Commits • Powered by Chai, Biryani, StackOverflow & Bappa\'s Blessings 🙏"', cx, teamY + 78);

    // 4. Interactive Easter Egg Bell Button (y = teamY + 104) - 26px below tagline
    const bellBtnW = 380;
    const bellBtnH = 36;
    const bellBtnX = cx - bellBtnW / 2;
    const bellBtnY = teamY + 104;
    const bellPulse = (Math.sin(animTime * 4) + 1) * 0.5;
    const clicks = this.creditsBellClicks || 0;

    ctx.fillStyle = `rgba(234, 179, 8, ${0.22 + bellPulse * 0.18})`;
    ctx.beginPath();
    ctx.roundRect(bellBtnX, bellBtnY, bellBtnW, bellBtnH, 18);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();

    const bellLabel = clicks > 0
      ? `🔔 [CLICK] TEMPLE BELL SPAM: ${clicks} CHIMES! ✨`
      : '🔔 [CLICK ME] SPAM TEMPLE BELL FOR BAPPA ✨';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12.5px sans-serif';
    ctx.fillText(bellLabel, cx, bellBtnY + 18);

    // Close helper note
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText('[ Press ✕ or Click Outside to Close ]', cx, cardY + cardH - 12);

    ctx.restore();
  }
}
