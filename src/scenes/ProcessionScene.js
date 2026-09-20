/**
 * ProcessionScene - Grand Festive Procession
 * Side-scrolling celebration with dancing crowd, dhol-tasha beats,
 * flower petal showers, fireworks bursts, and Day -> Sunset -> Night transition.
 * Featuring all story characters (Uncle, Flower Seller, Electrician, Child),
 * Chariot Pullers with golden ropes, Saffron Flag Bearer, Dhol players,
 * Lezim dancers, and spectating town NPCs cheering along the sacred route.
 */

import { Player } from '../entities/Player.js';
import { audioManager } from '../audio/AudioManager.js';
import { DholRhythmGame } from '../minigames/DholRhythmGame.js';
import { LezimDance } from '../minigames/LezimDance.js';
import { achievementSystem } from '../systems/AchievementSystem.js';

export class ProcessionScene {
  constructor(game) {
    this.game = game;
    this.player = new Player(420, 540);
    this.chariotX = 260;
    this.processionSpeed = 85; // px/sec auto-advance
    this.totalDistance = 2400;
    this.distanceTraveled = 0;
    this.animTime = 0;

    this.rhythmGame = new DholRhythmGame(() => {
      this.rhythmGamePlayed = true;
      audioManager.playSuccess();
      audioManager.playChantMorya();
      achievementSystem.unlock('procession_maestro');
    });
    this.rhythmGamePlayed = false;

    this.lezimDance = new LezimDance(() => {
      this.lezimPlayed = true;
      audioManager.playSuccess();
      audioManager.playChantMorya();
      achievementSystem.unlock('procession_maestro');
    });
    this.lezimPlayed = false;

    this.companions = [];
    this.townSpectators = [];
  }

  enter() {
    this.animTime = 0;
    this.distanceTraveled = 0;
    this.chariotX = 260;
    this.player.x = 420;
    this.game.camera.setBounds(0, 5000, 0, 950);
    this.game.camera.isScripted = false;
    this.game.camera.follow(this.player, this.game.input.isMobile);
    this.game.camera.x = this.game.camera.targetX;
    this.game.camera.y = this.game.camera.targetY;
    this.game.dayNight.setTimeOfDay('DAY');
    audioManager.playMusicTheme('PROCESSION');
    this.initCompanionsAndSpectators();
  }

  exit() {}

  initCompanionsAndSpectators() {
    // 1. Procession Troupe & Story Characters walking alongside Lord Ganesha's Chariot
    this.companions = [
      {
        id: 'uncle',
        name: 'Festival Uncle',
        spriteKey: 'UNCLE_SPRITE',
        offsetX: -110,
        y: 538,
        w: 52,
        h: 74,
        dialogue: "Ganpati Bappa Morya! Look at our community united in joy, my boy!"
      },
      {
        id: 'flower_seller',
        name: 'Flower Seller',
        spriteKey: 'FLOWER_SELLER_SPRITE',
        offsetX: -55,
        y: 542,
        w: 50,
        h: 70,
        dialogue: "May Lord Ganesha shower your family with endless health and happiness!"
      },
      {
        id: 'electrician',
        name: 'Electrician',
        spriteKey: 'ELECTRICIAN_SPRITE',
        offsetX: -170,
        y: 536,
        w: 50,
        h: 72,
        dialogue: "All the chariot diyas and lights are glowing like diamonds!"
      },
      {
        id: 'dhol_behind',
        name: 'Dhol Player',
        type: 'dhol_player',
        offsetX: -225,
        y: 540
      },
      {
        id: 'puller_1',
        name: 'Chariot Puller',
        type: 'puller',
        offsetX: 110,
        y: 538
      },
      {
        id: 'puller_2',
        name: 'Chariot Puller',
        type: 'puller',
        offsetX: 152,
        y: 536
      },
      {
        id: 'child',
        name: 'Devotee Child',
        spriteKey: 'CHILD_SPRITE',
        offsetX: 85,
        y: 545,
        w: 36,
        h: 52,
        dialogue: "Bappa is looking so grand! Morya Re Bappa Morya!"
      },
      {
        id: 'lezim_dancer',
        name: 'Lezim Dancer',
        type: 'lezim_dancer',
        offsetX: 165,
        y: 546
      },
      {
        id: 'flag_bearer',
        name: 'Flag Bearer',
        type: 'flag_bearer',
        offsetX: 210,
        y: 538
      },
      {
        id: 'dhol_ahead',
        name: 'Dhol Player',
        type: 'dhol_player',
        offsetX: 265,
        y: 542
      }
    ];

    // 2. Spectating town NPCs standing along the street watching the procession
    this.townSpectators = [];
    const colors = ['#e91e63', '#00897b', '#f57c00', '#7b1fa2', '#1976d2', '#388e3c', '#d32f2f', '#fbc02d', '#5c6bc0'];
    const cheers = [
      'Ganpati Bappa Morya!',
      'Mangal Murti Morya!',
      'Pudhchya Varshi Lavkar Ya!',
      'Bappa Bless Us All!',
      'Jai Dev Jai Mangal Murti!'
    ];

    for (let x = 360; x <= 4600; x += 190 + Math.random() * 70) {
      this.townSpectators.push({
        x,
        y: 532 + Math.random() * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        cheer: cheers[Math.floor(Math.random() * cheers.length)],
        hasAarti: Math.random() < 0.35,
        hasPetals: Math.random() < 0.5,
        waved: false,
        animOffset: Math.random() * 5
      });
    }
  }

  isMinigameActive() {
    return Boolean(
      (this.rhythmGame && this.rhythmGame.active) ||
      (this.lezimDance && this.lezimDance.active)
    );
  }

  update(dt, input) {
    // Dialogue update
    if (this.game.dialogue && this.game.dialogue.active) {
      this.game.dialogue.update(dt, input);
      return;
    }

    const modalInput = this.game && typeof this.game.getModalInputProxy === 'function'
      ? this.game.getModalInputProxy(input)
      : input;

    if (this.rhythmGame.active) {
      this.rhythmGame.update(dt, modalInput, this.game.particles);
      return;
    }

    if (this.lezimDance.active) {
      this.lezimDance.update(dt, modalInput);
      return;
    }

    this.animTime += dt;
    this.distanceTraveled += this.processionSpeed * dt;
    this.chariotX += this.processionSpeed * dt;
    this.player.x += this.processionSpeed * dt;

    // Day -> Sunset -> Twilight -> Night Progression based on distance
    const progress = Math.min(1.0, this.distanceTraveled / this.totalDistance);
    const cx = this.game ? this.game.virtualWidth / 2 : 640;

    // Interactive Dhol-Tasha prompt trigger
    const isDholClicked = input.mouse && input.mouse.justPressed &&
      input.mouse.x >= cx - 210 && input.mouse.x <= cx + 210 &&
      input.mouse.y >= 540 && input.mouse.y <= 620;

    if (!this.rhythmGamePlayed && progress > 0.25 && progress < 0.50 && (input.interactPressed || isDholClicked)) {
      input.interactPressed = false;
      this.rhythmGame.start();
      return;
    }

    // Interactive Lezim Folk Dance prompt trigger
    const isLezimClicked = input.mouse && input.mouse.justPressed &&
      input.mouse.x >= cx - 210 && input.mouse.x <= cx + 210 &&
      input.mouse.y >= 540 && input.mouse.y <= 620;

    if (!this.lezimPlayed && progress > 0.52 && progress < 0.78 && (input.interactPressed || (input.keys && input.keys['KeyL']) || isLezimClicked)) {
      input.interactPressed = false;
      if (input.keys) input.keys['KeyL'] = false;
      this.lezimDance.start();
      return;
    }

    // Check NPC interaction during procession
    if (input.interactPressed) {
      for (const comp of this.companions) {
        if (comp.dialogue) {
          const compX = this.chariotX + comp.offsetX;
          if (Math.abs(this.player.x - compX) < 65) {
            input.interactPressed = false;
            audioManager.playSnap();
            this.game.dialogue.start(comp.name, [comp.dialogue]);
            return;
          }
        }
      }
    }

    if (progress < 0.25) {
      this.game.dayNight.setTimeOfDay('DAY');
    } else if (progress < 0.5) {
      this.game.dayNight.setTimeOfDay('SUNSET');
    } else if (progress < 0.75) {
      this.game.dayNight.setTimeOfDay('TWILIGHT');
    } else {
      this.game.dayNight.setTimeOfDay('NIGHT');
    }

    this.game.dayNight.update(dt);
    this.game.particles.update(dt);

    // Continuous festive petal showers around Ganesha
    if (Math.random() < 0.35) {
      this.game.particles.emitPetals(this.chariotX + (Math.random() - 0.5) * 350, 80, 4);
    }

    // Flower seller throws petals towards Ganesha periodically
    if (Math.random() < 0.08) {
      this.game.particles.emitPetals(this.chariotX - 55, 510, 2);
    }

    // Town spectators wave and throw flowers when Bappa passes
    for (const spec of this.townSpectators) {
      if (!spec.waved && Math.abs(spec.x - this.chariotX) < 140) {
        spec.waved = true;
        if (spec.hasPetals) {
          this.game.particles.emitPetals(spec.x, spec.y - 35, 4);
        }
      }
    }

    // Fireworks bursts during night phase
    if (progress > 0.65 && Math.random() < 0.035) {
      const fx = this.game.camera.x + (Math.random() - 0.5) * 800;
      const fy = 120 + Math.random() * 160;
      this.game.particles.emitFireworks(fx, fy);
      audioManager.playFirework();
      this.game.camera.shake(6, 0.25);
    }

    // Camera follows smoothly slightly ahead of chariot
    this.game.camera.targetX = this.chariotX + 180;
    this.game.camera.targetY = this.game.input.isMobile ? 490 : 410;

    // Player can explore freely left/right along the procession
    const moveX = input.axisX;
    if (Math.abs(moveX) > 0.1) {
      this.player.facing = moveX > 0 ? 1 : -1;
      this.player.state = 'walk';
    } else {
      this.player.state = 'idle';
    }
    this.player.animTime += dt;
    this.player.x += moveX * 120 * dt;

    // Transition to Visarjan when procession reaches the sacred water ghat
    if (this.distanceTraveled >= this.totalDistance) {
      this.game.sceneManager.changeScene('visarjan');
    }
  }

  // --- RENDERING HELPERS FOR PROCESSION PARTICIPANTS ---

  renderPullRopes(ctx) {
    ctx.save();
    const startX = this.chariotX + 70;
    const startY = 516;

    ctx.strokeStyle = '#c68a4c';
    ctx.lineWidth = 3.5;

    // Rope 1 to Puller 1
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(this.chariotX + 90, 524, this.chariotX + 110, 508);
    ctx.stroke();

    // Rope 2 to Puller 2
    ctx.beginPath();
    ctx.moveTo(startX, startY + 2);
    ctx.quadraticCurveTo(this.chariotX + 110, 526, this.chariotX + 152, 506);
    ctx.stroke();

    ctx.restore();
  }

  renderChariotPuller(ctx, x, y, animTime) {
    ctx.save();
    ctx.translate(x, y);
    const step = Math.sin(animTime * 5) * 6;
    ctx.rotate(0.12); // Determined forward lean

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs / Saffron Dhoti
    ctx.fillStyle = '#ff9800';
    ctx.fillRect(-8 + step, -22, 7, 22);
    ctx.fillRect(2 - step, -22, 7, 22);

    // Torso (Saffron vest / banyan)
    ctx.fillStyle = '#e65100';
    ctx.fillRect(-12, -48, 24, 28);

    // Red waistband / Patka
    ctx.fillStyle = '#d50000';
    ctx.fillRect(-13, -26, 26, 6);

    // Head with saffron bandana
    ctx.fillStyle = '#c58354';
    ctx.beginPath();
    ctx.arc(0, -56, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff6f00'; // Bandana
    ctx.beginPath();
    ctx.arc(0, -60, 9.5, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-10, -60, 20, 4);

    // Sturdy arms gripping rope forward
    ctx.strokeStyle = '#c58354';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-6, -42);
    ctx.lineTo(8, -34);
    ctx.stroke();

    ctx.restore();
  }

  renderFlagBearer(ctx, x, y, animTime) {
    ctx.save();
    ctx.translate(x, y);
    const bob = Math.sin(animTime * 4.5) * 2;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs & White Kurta
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-8, -24, 7, 22);
    ctx.fillRect(2, -24, 7, 22);
    ctx.fillRect(-12, -50 + bob, 24, 28);

    // Head with Saffron Pheta (Turban)
    ctx.fillStyle = '#c58354';
    ctx.beginPath();
    ctx.arc(0, -58 + bob, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff6f00';
    ctx.beginPath();
    ctx.roundRect(-11, -67 + bob, 22, 11, 4);
    ctx.fill();
    // Golden Kalgi pin
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-2, -71 + bob, 4, 6);

    // Tall wooden flag pole
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(8, -10 + bob);
    ctx.lineTo(14, -135 + bob);
    ctx.stroke();

    // Golden finial spearhead
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(14, -145 + bob);
    ctx.lineTo(18, -135 + bob);
    ctx.lineTo(10, -135 + bob);
    ctx.closePath();
    ctx.fill();

    // Fluttering Saffron Bhagwa Dhwaj (Double pointed swallowtail)
    const wave1 = Math.sin(animTime * 7) * 8;
    const wave2 = Math.cos(animTime * 7) * 8;
    ctx.fillStyle = '#ff6d00';
    ctx.beginPath();
    ctx.moveTo(14, -135 + bob);
    ctx.quadraticCurveTo(55 + wave1, -125 + bob, 95 + wave2, -130 + bob);
    ctx.lineTo(75 + wave1, -105 + bob);
    ctx.lineTo(95 + wave2, -80 + bob);
    ctx.quadraticCurveTo(55 + wave1, -95 + bob, 14, -85 + bob);
    ctx.closePath();
    ctx.fill();

    // Golden Sun/Om emblem on flag
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(42 + wave1 * 0.5, -107 + bob, 6, 0, Math.PI * 2);
    ctx.fill();

    // Hands gripping pole
    ctx.fillStyle = '#c58354';
    ctx.beginPath();
    ctx.arc(10, -42 + bob, 4, 0, Math.PI * 2);
    ctx.arc(12, -32 + bob, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderDholPlayer(ctx, x, y, animTime) {
    ctx.save();
    ctx.translate(x, y);
    const beat = Math.abs(Math.sin(animTime * 8)) * 12;
    const bob = Math.sin(animTime * 5) * 2.5;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs & Kurta
    ctx.fillStyle = '#eceff1';
    ctx.fillRect(-8, -24, 7, 22);
    ctx.fillRect(2, -24, 7, 22);

    ctx.fillStyle = '#ff8f00'; // Saffron festive Kurta
    ctx.fillRect(-13, -50 + bob, 26, 28);

    // Head & Red Pheta
    ctx.fillStyle = '#c58354';
    ctx.beginPath();
    ctx.arc(0, -58 + bob, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d50000';
    ctx.fillRect(-11, -66 + bob, 22, 9);

    // Dhol Drum slung around body
    ctx.fillStyle = '#8d6e63'; // Wood barrel
    ctx.beginPath();
    ctx.roundRect(-18, -42 + bob, 36, 22, 6);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f'; // Golden ropes/lacing
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Drum skins
    ctx.fillStyle = '#f5f5f5';
    ctx.beginPath();
    ctx.ellipse(-17, -31 + bob, 4, 10, 0, 0, Math.PI * 2);
    ctx.ellipse(17, -31 + bob, 4, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sticks striking drum
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-10, -42 + bob);
    ctx.lineTo(-18, -31 + bob - beat * 0.4);
    ctx.moveTo(10, -42 + bob);
    ctx.lineTo(18, -31 + bob - beat * 0.4);
    ctx.stroke();

    ctx.restore();
  }

  renderLezimDancer(ctx, x, y, animTime) {
    ctx.save();
    ctx.translate(x, y);
    const danceJump = Math.abs(Math.sin(animTime * 6)) * 8;
    const lezimExt = (Math.sin(animTime * 6) + 1) * 7;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Green Dhoti & White Kurta
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(-8, -22 - danceJump, 7, 20);
    ctx.fillRect(2, -22 - danceJump, 7, 20);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-12, -48 - danceJump, 24, 28);

    // Saffron Sash
    ctx.fillStyle = '#ff6f00';
    ctx.fillRect(-13, -30 - danceJump, 26, 6);

    // Head & Cap
    ctx.fillStyle = '#c58354';
    ctx.beginPath();
    ctx.arc(0, -56 - danceJump, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff6f00';
    ctx.fillRect(-9, -64 - danceJump, 18, 8);

    // Lezim with jingling metal cymbals
    ctx.strokeStyle = '#ffb300';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-16 - lezimExt * 0.4, -40 - danceJump);
    ctx.lineTo(16 + lezimExt * 0.4, -40 - danceJump);
    ctx.stroke();

    ctx.fillStyle = '#ffd700';
    for (let c = -10; c <= 10; c += 7) {
      ctx.beginPath();
      ctx.arc(c, -40 - danceJump, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  renderTownSpectator(ctx, spec, animTime) {
    ctx.save();
    ctx.translate(spec.x, spec.y);
    const bob = Math.sin(animTime * 4 + spec.animOffset) * 3;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Traditional Dress / Kurta / Sari
    ctx.fillStyle = spec.color;
    ctx.beginPath();
    ctx.roundRect(-10, -46 + bob, 20, 44, 4);
    ctx.fill();

    // Head
    ctx.fillStyle = '#c58354';
    ctx.beginPath();
    ctx.arc(0, -54 + bob, 8.5, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(0, -57 + bob, 9, Math.PI, Math.PI * 2);
    ctx.fill();

    if (spec.hasAarti) {
      // Devotee holding glowing Aarti Diya Thali
      ctx.fillStyle = '#ffd700'; // Brass thali
      ctx.beginPath();
      ctx.ellipse(6, -30 + bob, 9, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Diya flame
      ctx.fillStyle = '#ff3d00';
      ctx.beginPath();
      ctx.arc(6, -33 + bob, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffea00';
      ctx.beginPath();
      ctx.arc(6, -34 + bob, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Cheering arms raised in devotion
      ctx.strokeStyle = spec.color;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(-8, -38 + bob);
      ctx.lineTo(-14, -56 + bob);
      ctx.moveTo(8, -38 + bob);
      ctx.lineTo(14, -56 + bob);
      ctx.stroke();
    }

    // Floating cheer text when chariot is nearby
    const distToChariot = Math.abs(spec.x - this.chariotX);
    if (distToChariot < 160) {
      const floatY = -72 + bob + Math.sin(animTime * 5 + spec.animOffset) * 4;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.roundRect(-55, floatY - 12, 110, 20, 6);
      ctx.fill();
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = '#ffd54f';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(spec.cheer, 0, floatY - 2);
    }

    ctx.restore();
  }

  renderCompanion(ctx, comp, i) {
    const compX = this.chariotX + comp.offsetX;
    const walkBob = Math.sin(this.animTime * 5 + i) * 2.5;
    const compY = comp.y + walkBob;

    if (comp.spriteKey) {
      // Story character rendered via AssetRegistry
      this.game.assetRegistry.draw(
        ctx,
        comp.spriteKey,
        compX,
        compY,
        comp.w,
        comp.h,
        'walk',
        1,
        this.animTime + i * 0.7
      );
    } else if (comp.type === 'puller') {
      this.renderChariotPuller(ctx, compX, compY, this.animTime + i * 0.5);
    } else if (comp.type === 'flag_bearer') {
      this.renderFlagBearer(ctx, compX, compY, this.animTime);
    } else if (comp.type === 'dhol_player') {
      this.renderDholPlayer(ctx, compX, compY, this.animTime + i * 0.3);
    } else if (comp.type === 'lezim_dancer') {
      this.renderLezimDancer(ctx, compX, compY, this.animTime);
    }

    // Proximity [E] TALK prompt when player is nearby
    if (comp.dialogue && Math.abs(this.player.x - compX) < 65) {
      ctx.save();
      const promptY = compY - 82 + Math.sin(this.animTime * 4) * 3;
      ctx.fillStyle = 'rgba(255, 111, 0, 0.92)';
      ctx.beginPath();
      ctx.roundRect(compX - 36, promptY - 12, 72, 22, 6);
      ctx.fill();
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('[E] TALK', compX, promptY - 1);
      ctx.restore();
    }
  }

  // --- MAIN RENDER ---

  render(ctx) {
    // 1. Sky & Celestial
    this.game.dayNight.renderSky(ctx, this.game.virtualWidth, this.game.virtualHeight);

    // 2. Parallax background
    this.game.parallax.renderBackground(ctx, this.game.camera);

    // 3. World Entities (In Camera Coordinates)
    this.game.camera.begin(ctx);

    // Ground
    this.game.parallax.renderGround(ctx, this.game.camera);

    // A. Spectating Town NPCs standing along the street route
    const camLeft = this.game.camera.x - 750;
    const camRight = this.game.camera.x + 750;
    for (const spec of this.townSpectators) {
      if (spec.x >= camLeft && spec.x <= camRight) {
        this.renderTownSpectator(ctx, spec, this.animTime);
      }
    }

    // B. Background dancing devotees in crowd
    const crowdSpacing = 160;
    const startIdx = Math.floor((this.game.camera.x - 800) / crowdSpacing);
    const endIdx = Math.ceil((this.game.camera.x + 800) / crowdSpacing);

    for (let i = startIdx; i <= endIdx; i++) {
      const cx = i * crowdSpacing;
      const jump = Math.abs(Math.sin(this.animTime * 6 + i)) * 14;
      ctx.save();
      ctx.fillStyle = i % 2 === 0 ? '#ff8f00' : '#d84315';
      ctx.beginPath();
      ctx.roundRect(cx - 10, 520 - jump - 45, 20, 30, 4);
      ctx.fill();

      // Head
      ctx.fillStyle = '#d7996c';
      ctx.beginPath();
      ctx.arc(cx, 520 - jump - 54, 8, 0, Math.PI * 2);
      ctx.fill();

      // Raised arms
      ctx.strokeStyle = '#ff8f00';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 8, 520 - jump - 40);
      ctx.lineTo(cx - 14, 520 - jump - 64);
      ctx.moveTo(cx + 8, 520 - jump - 40);
      ctx.lineTo(cx + 14, 520 - jump - 64);
      ctx.stroke();

      ctx.restore();
    }

    // C. Golden braided pull-ropes from chariot front to pullers
    this.renderPullRopes(ctx);

    // D. Procession companions walking BEHIND chariot
    this.companions
      .filter(comp => comp.offsetX < 0)
      .forEach((comp, idx) => this.renderCompanion(ctx, comp, idx));

    // E. Procession Chariot with Ganesha Mounted
    this.game.assetRegistry.draw(ctx, 'VEHICLE_SPRITE', this.chariotX, 540, 180, 120);
    this.game.assetRegistry.draw(
      ctx,
      'GANESHA_SPRITE',
      this.chariotX,
      485,
      130,
      170,
      'complete',
      1,
      this.animTime,
      5
    );

    // F. Procession companions walking AHEAD of chariot
    this.companions
      .filter(comp => comp.offsetX >= 0)
      .forEach((comp, idx) => this.renderCompanion(ctx, comp, idx));

    // G. Player walking alongside chariot
    this.player.render(ctx);

    // H. Particles (petals, fireworks, divine aura)
    this.game.particles.render(ctx);

    this.game.camera.end(ctx);

    // 4. Foreground Parallax Bunting & Torans
    this.game.parallax.renderForeground(ctx, this.game.camera);

    // 5. Lighting Pass (Chariot diyas and night glow)
    this.game.lighting.clear();
    const isNight = this.game.dayNight.isNight();
    const ambientDark = this.game.dayNight.getAmbientDarkness();
    if (isNight || ambientDark > 0.15) {
      this.game.lighting.addLight(this.chariotX, 470, 160, 'rgba(255, 215, 64, 0.25)', 0.65);
    }
    this.game.lighting.render(ctx, this.game.camera, ambientDark);

    // 6. Dialogue Box (if player speaks with companions)
    if (this.game.dialogue) {
      this.game.dialogue.render(ctx);
    }

    // 7. HUD / Festival Progress Overlay
    ctx.save();
    const cx = this.game ? this.game.virtualWidth / 2 : 640;

    // Top banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(cx - 180, 20, 360, 60, 12);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffb300';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GRAND PROCESSION', cx, 44);

    const percent = Math.floor((this.distanceTraveled / this.totalDistance) * 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Approaching Sacred Ghat: ${percent}%`, cx, 66);

    // Dhol Rhythm prompt (Dynamically positioned with safe bottom clearance on all displays)
    if (!this.rhythmGamePlayed && !this.rhythmGame.active && percent > 25 && percent < 50) {
      const pulse = Math.sin(Date.now() * 0.008) * 3;
      const py = 556 + pulse;
      ctx.fillStyle = '#ff6d00';
      ctx.beginPath();
      ctx.roundRect(cx - 200, py, 400, 50, 25);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🥁 PLAY DHOL-TASHA BEATS [E]', cx, py + 31);
    }

    // Lezim Dance prompt (Dynamically positioned with safe bottom clearance on all displays)
    if (!this.lezimPlayed && !this.lezimDance.active && percent >= 52 && percent < 78) {
      const pulse = Math.sin(Date.now() * 0.008) * 3;
      const py = 556 + pulse;
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(cx - 200, py, 400, 50, 25);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔔 DANCE LEZIM FOLK DANCE [E] / [L]', cx, py + 31);
    }

    ctx.restore();

    // Render Minigame Modals (Centered dynamically with full-screen dark backdrops)
    this.renderMinigameModal(ctx, this.rhythmGame);
    this.renderMinigameModal(ctx, this.lezimDance);

    this.game.ui.renderModals(ctx);
  }

  renderMinigameModal(ctx, minigame) {
    if (!minigame || !minigame.active) return;
    if (this.game && typeof this.game.renderCenteredModal === 'function') {
      this.game.renderCenteredModal(ctx, () => minigame.render(ctx));
    } else {
      minigame.render(ctx);
    }
  }
}
