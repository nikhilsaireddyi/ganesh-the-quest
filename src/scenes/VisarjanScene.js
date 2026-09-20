/**
 * VisarjanScene - The Sacred Water Immersion
 * Devotees gather at the shore ghat as Lord Ganesha is carried
 * out into deep, sacred waters on a decorated ceremonial boat (Naav).
 * Immersion takes place far from the shore under the moonlit sky.
 */

import { Player } from '../entities/Player.js';
import { audioManager } from '../audio/AudioManager.js';

export class VisarjanScene {
  constructor(game) {
    this.game = game;
    this.player = new Player(310, 530);
    this.animTime = 0;
    this.stageTimer = 0;

    // Positions
    this.SHORE_DOCK_X = 520;
    this.DEEP_WATER_X = 1320;
    this.WATER_LEVEL_Y = 545;

    this.boatX = this.SHORE_DOCK_X;
    this.boatY = 545;
    this.submergeY = 515; // Starting resting position on the boat dais

    this.isRowing = false;
    this.oarTimer = 0;
    this.bellStep = 0;
  }

  enter() {
    this.animTime = 0;
    this.stageTimer = 0;
    this.boatX = this.SHORE_DOCK_X;
    this.boatY = 545;
    this.submergeY = 515;
    this.isRowing = false;
    this.oarTimer = 0;
    this.bellStep = 0;

    this.player.x = 310;
    this.player.y = 530;
    this.player.facing = 1;
    this.player.canMove = false;

    // Set world camera bounds allowing panoramic pan from shore to deep water
    this.game.camera.setBounds(-200, 2000, 0, 720);
    this.game.camera.isScripted = true;
    this.game.camera.x = 480;
    this.game.camera.y = 480;
    this.game.camera.setZoom(1.15);

    this.game.dayNight.setTimeOfDay('NIGHT');
    audioManager.playMusicTheme('VISARJAN');
    audioManager.playBell();
  }

  exit() {
    this.game.camera.releaseScripted();
  }

  update(dt) {
    this.animTime += dt;
    this.stageTimer += dt;
    this.game.dayNight.update(dt);
    this.game.particles.update(dt);

    // -------------------------------------------------------------
    // PHASE 1: AT THE SHORE GHAT (0.0s - 2.0s)
    // -------------------------------------------------------------
    if (this.stageTimer < 2.0) {
      this.boatX = this.SHORE_DOCK_X;
      this.submergeY = 515;
      this.isRowing = false;
      this.game.camera.panTo(480, 480, 1.15, 0.05);
    }

    // -------------------------------------------------------------
    // PHASE 2: JOURNEY TO DEEP WATER (2.0s - 8.5s)
    // The ceremonial boat rows away from shore out into deep waters
    // -------------------------------------------------------------
    else if (this.stageTimer >= 2.0 && this.stageTimer < 8.5) {
      this.isRowing = true;
      const progress = Math.min(1.0, (this.stageTimer - 2.0) / 6.5);
      // Smooth easeInOutQuad
      const ease = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;

      this.boatX = this.SHORE_DOCK_X + (this.DEEP_WATER_X - this.SHORE_DOCK_X) * ease;
      this.submergeY = 515;

      // Camera smoothly tracks with the boat into deep waters
      this.game.camera.panTo(this.boatX, 480, 1.12, 0.045);

      // Water displacement wake & paddling audio
      this.oarTimer += dt;
      if (this.oarTimer > 0.8) {
        this.oarTimer = 0;
        audioManager.playWaterRipple();
        this.game.particles.emitWaterRipple(this.boatX - 65, this.WATER_LEVEL_Y + 4);
      }

      if (Math.random() < 0.25) {
        this.game.particles.emitWaterRipple(this.boatX - 50 + (Math.random() - 0.5) * 30, this.WATER_LEVEL_Y);
      }

      // Floating marigold flower petals drifting along wake
      if (Math.random() < 0.12) {
        this.game.particles.emitPetals(this.boatX - 40, this.WATER_LEVEL_Y - 2, 1);
      }
    }

    // -------------------------------------------------------------
    // PHASE 3: DEEP WATER IMMERSION / VISARJAN (8.5s - 15.0s)
    // In peaceful deep open waters far from shore under the full moon
    // -------------------------------------------------------------
    else if (this.stageTimer >= 8.5 && this.stageTimer < 15.0) {
      this.isRowing = false;
      this.boatX = this.DEEP_WATER_X;
      this.game.camera.panTo(this.DEEP_WATER_X, 480, 1.15, 0.05);

      // Sacred bells chime at solemn intervals
      if (this.stageTimer > 8.8 && this.bellStep === 0) {
        this.bellStep = 1;
        audioManager.playBell();
      } else if (this.stageTimer > 11.0 && this.bellStep === 1) {
        this.bellStep = 2;
        audioManager.playBell();
      } else if (this.stageTimer > 13.2 && this.bellStep === 2) {
        this.bellStep = 3;
        audioManager.playBell();
      }

      // Idol gradually and reverently lowers into deep water (from 515 down to 650)
      const submergeProgress = Math.min(1.0, (this.stageTimer - 8.5) / 5.5);
      this.submergeY = 515 + submergeProgress * 135;

      // Concentric water ripples in deep water
      if (Math.random() < 0.3) {
        this.game.particles.emitWaterRipple(
          this.boatX + (Math.random() - 0.5) * 50,
          this.WATER_LEVEL_Y
        );
        audioManager.playWaterRipple();
      }

      // Blossoms scattering outward in the deep water
      if (Math.random() < 0.18) {
        this.game.particles.emitPetals(
          this.boatX + (Math.random() - 0.5) * 100,
          this.WATER_LEVEL_Y - 2,
          1
        );
      }

      // Divine aura bubbling up through deep water
      if (this.stageTimer > 10.0 && Math.random() < 0.28) {
        this.game.particles.emitDivineAura(
          this.boatX + (Math.random() - 0.5) * 70,
          this.WATER_LEVEL_Y - 10,
          2
        );
      }
    }

    // -------------------------------------------------------------
    // PHASE 4: DIVINE FAREWELL & BLESSINGS (15.0s - 20.0s)
    // -------------------------------------------------------------
    else if (this.stageTimer >= 15.0 && this.stageTimer < 20.5) {
      this.boatX = this.DEEP_WATER_X;
      this.isRowing = false;

      // Golden divine aura beams ascending toward the moon
      if (Math.random() < 0.35) {
        this.game.particles.emitDivineAura(
          this.boatX + (Math.random() - 0.5) * 90,
          this.WATER_LEVEL_Y - 15,
          3
        );
      }

      // Floating water ripples under the moon
      if (Math.random() < 0.15) {
        this.game.particles.emitWaterRipple(
          this.boatX + (Math.random() - 0.5) * 80,
          this.WATER_LEVEL_Y
        );
      }
    }

    // Transition to final Ending Scene
    if (this.stageTimer > 20.5) {
      this.game.sceneManager.changeScene('ending');
    }
  }

  render(ctx) {
    // 1. Sky & Celestial Backdrop (Screen space - pass false so celestial orb isn't duplicated)
    this.game.dayNight.renderSky(ctx, this.game.virtualWidth, this.game.virtualHeight, false);

    // 2. World Elements transformed by Camera (Pan from Shore to Deep Water)
    this.game.camera.begin(ctx);

    // (A) Parallax Far Shore & Opposite River Bank with soft moonlit ambient silhouette
    ctx.save();
    // Distant mountain ridge silhouette catching subtle moonlit edge
    ctx.fillStyle = '#0f1d33';
    ctx.beginPath();
    ctx.moveTo(-300, 440);
    for (let mx = -300; mx <= 2300; mx += 200) {
      ctx.quadraticCurveTo(mx + 100, 395 + Math.sin(mx * 0.01) * 18, mx + 200, 440);
    }
    ctx.lineTo(2300, 520);
    ctx.lineTo(-300, 520);
    ctx.closePath();
    ctx.fill();

    // Far bank terrain
    const bankGrad = ctx.createLinearGradient(0, 415, 0, 515);
    bankGrad.addColorStop(0, '#152945');
    bankGrad.addColorStop(1, '#0c1728');
    ctx.fillStyle = bankGrad;
    ctx.fillRect(-300, 425, 2600, 92);

    // Far bank temple domes, shikharas & banyan tree silhouettes
    ctx.fillStyle = '#1b3354';
    for (let bx = -200; bx < 2200; bx += 130) {
      // Tree / dome
      ctx.beginPath();
      ctx.arc(bx, 430, 24, Math.PI, Math.PI * 2);
      ctx.fill();

      // Temple shikhara spire every 390px
      if (Math.abs(bx) % 390 === 0) {
        ctx.beginPath();
        ctx.moveTo(bx - 12, 430);
        ctx.lineTo(bx, 396);
        ctx.lineTo(bx + 12, 430);
        ctx.closePath();
        ctx.fill();
        // Golden kalash top
        ctx.fillStyle = '#ffd54f';
        ctx.beginPath();
        ctx.arc(bx, 394, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1b3354';
      }
    }

    // Distant oil diyas on opposite bank
    for (let dx = -200; dx < 2200; dx += 75) {
      ctx.fillStyle = '#ffb300';
      ctx.beginPath();
      ctx.arc(dx, 474, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // (B) Sacred River Waters (y: 515 to 750)
    ctx.save();
    const waterGrad = ctx.createLinearGradient(0, 515, 0, 750);
    waterGrad.addColorStop(0, '#06284e');
    waterGrad.addColorStop(0.3, '#031f3f');
    waterGrad.addColorStop(0.7, '#02152b');
    waterGrad.addColorStop(1, '#010c1a');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(-300, 515, 2500, 240);

    // Wave shimmer lines on water surface
    ctx.strokeStyle = 'rgba(255, 249, 196, 0.08)';
    ctx.lineWidth = 2;
    for (let wy = 530; wy < 720; wy += 25) {
      const waveShift = Math.sin(this.animTime * 1.8 + wy) * 20;
      ctx.beginPath();
      ctx.moveTo(-300, wy);
      for (let wx = -300; wx < 2200; wx += 160) {
        ctx.quadraticCurveTo(
          wx + 80 + waveShift,
          wy + Math.sin(this.animTime * 2 + wx * 0.02) * 3,
          wx + 160,
          wy
        );
      }
      ctx.stroke();
    }
    ctx.restore();

    // (C) Sacred Full Moon & Moonlit Deep Water Reflection
    ctx.save();
    const moonX = this.DEEP_WATER_X;
    const moonY = 110;

    // Glowing Lunar Halo
    const moonHalo = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 120);
    moonHalo.addColorStop(0, 'rgba(255, 253, 231, 0.45)');
    moonHalo.addColorStop(0.4, 'rgba(255, 245, 157, 0.18)');
    moonHalo.addColorStop(1, 'rgba(255, 245, 157, 0)');
    ctx.fillStyle = moonHalo;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 120, 0, Math.PI * 2);
    ctx.fill();

    // Sacred Full Moon
    ctx.fillStyle = '#fff9c4';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 32, 0, Math.PI * 2);
    ctx.fill();

    // Moonlight path shimmering vertically into the deep water
    const waveShimmer = Math.sin(this.animTime * 2.2) * 14;
    const moonReflectGrad = ctx.createLinearGradient(moonX, 515, moonX, 730);
    moonReflectGrad.addColorStop(0, 'rgba(255, 249, 196, 0.28)');
    moonReflectGrad.addColorStop(0.4, 'rgba(255, 249, 196, 0.15)');
    moonReflectGrad.addColorStop(1, 'rgba(255, 249, 196, 0.02)');

    ctx.fillStyle = moonReflectGrad;
    ctx.beginPath();
    ctx.moveTo(moonX - 35, 515);
    ctx.lineTo(moonX + 35, 515);
    ctx.lineTo(moonX + 110 + waveShimmer, 730);
    ctx.lineTo(moonX - 110 + waveShimmer, 730);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // (D) Stone Ghat Steps on Shore (Left Side: x: -200 to 450)
    ctx.save();
    // Ghat stone structure
    ctx.fillStyle = '#37474f';
    ctx.beginPath();
    ctx.moveTo(-200, 430);
    ctx.lineTo(450, 490);
    ctx.lineTo(440, 560);
    ctx.lineTo(400, 750);
    ctx.lineTo(-200, 750);
    ctx.closePath();
    ctx.fill();

    // Stone Steps Lines
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 3;
    const stepCoords = [
      { x1: -200, y1: 450, x2: 440, y2: 490 },
      { x1: -200, y1: 480, x2: 430, y2: 515 },
      { x1: -200, y1: 510, x2: 420, y2: 540 },
      { x1: -200, y1: 540, x2: 410, y2: 565 },
      { x1: -200, y1: 570, x2: 400, y2: 590 }
    ];
    stepCoords.forEach(step => {
      ctx.beginPath();
      ctx.moveTo(step.x1, step.y1);
      ctx.lineTo(step.x2, step.y2);
      ctx.stroke();
    });

    // Deepa-Stambha (Stone Lamp Pillar) on Ghat Edge
    ctx.fillStyle = '#263238';
    ctx.fillRect(415, 470, 16, 45);
    ctx.fillStyle = '#ff6f00';
    ctx.beginPath();
    ctx.arc(423, 467, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(423, 465, 4, 0, Math.PI * 2);
    ctx.fill();

    // Lit Earthen Diyas along the steps
    const diyaPositions = [
      { x: 200, y: 492 },
      { x: 270, y: 507 },
      { x: 350, y: 524 },
      { x: 400, y: 535 },
      { x: 435, y: 550 }
    ];
    diyaPositions.forEach(pos => {
      const flicker = Math.sin(this.animTime * 6 + pos.x) * 1.5;
      ctx.fillStyle = '#795548'; // terracotta diya
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y + 4, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff6f00';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y + flicker, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff59d';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - 1 + flicker, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Brass Aarti Plate on Ghat Step with Camphor Flame
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.ellipse(380, 532, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff9100';
    ctx.beginPath();
    ctx.arc(380, 528, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fffde7';
    ctx.beginPath();
    ctx.arc(380, 526, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // (E) Devotees & Characters Gathered on the Ghat Steps (Folded Hands)
    // Electrician
    this.game.assetRegistry.draw(
      ctx,
      'ELECTRICIAN_SPRITE',
      120,
      465,
      60,
      80,
      'idle',
      1,
      this.animTime
    );

    // Flower Seller
    this.game.assetRegistry.draw(
      ctx,
      'FLOWER_SELLER_SPRITE',
      180,
      485,
      60,
      80,
      'idle',
      1,
      this.animTime
    );

    // Festival Uncle
    this.game.assetRegistry.draw(
      ctx,
      'UNCLE_SPRITE',
      240,
      505,
      60,
      80,
      'idle',
      1,
      this.animTime
    );

    // Child Ananya
    this.game.assetRegistry.draw(
      ctx,
      'CHILD_SPRITE',
      360,
      535,
      48,
      64,
      'idle',
      1,
      this.animTime
    );

    // Player with folded hands facing toward the river
    this.player.render(ctx);

    // (F) The Ceremonial Boat (Naav) Carrying Lord Ganesha to Deep Waters
    this.renderCeremonialBoat(
      ctx,
      this.boatX,
      this.boatY,
      this.animTime,
      this.isRowing
    );

    // (G) Lord Ganesha Idol - Seated on the Boat / Submerging in Deep Water
    if (this.stageTimer < 15.5) {
      ctx.save();
      // Clip mask: Idol is cleanly submerged beneath the water level (545px)
      ctx.beginPath();
      ctx.rect(this.boatX - 140, -400, 280, this.WATER_LEVEL_Y + 400);
      ctx.clip();

      this.game.assetRegistry.draw(
        ctx,
        'GANESHA_SPRITE',
        this.boatX,
        this.submergeY,
        130,
        170,
        'complete',
        1,
        this.animTime,
        5
      );
      ctx.restore();
    }

    // (H) Dynamic Water Particles, Floating Flowers & Ripples
    this.game.particles.render(ctx);

    this.game.camera.end(ctx);

    // 3. Atmospheric Lighting Pass (Soft, serene festival moonlit night)
    this.game.lighting.clear();

    const camX = this.game.camera ? this.game.camera.x : 640;

    // (A) Very slight ambient background moonlight fill across sky & far water
    this.game.lighting.addLight(camX, 360, 950, 'rgba(165, 205, 255, 0.22)', 0.38);
    this.game.lighting.addLight(this.DEEP_WATER_X, 220, 480, 'rgba(210, 235, 255, 0.28)', 0.48);

    // (B) Far bank subtle warm glow
    this.game.lighting.addLight(150, 460, 380, 'rgba(255, 225, 175, 0.16)', 0.32);
    this.game.lighting.addLight(850, 460, 380, 'rgba(255, 225, 175, 0.16)', 0.32);

    // (C) Shore ghat warm diya & aarti light (softened from 0.8 down to 0.46)
    this.game.lighting.addLight(360, 520, 140, 'rgba(255, 170, 40, 0.35)', 0.46);

    // (D) Glowing lantern on ceremonial boat (softened from 0.9/160 down to 0.38/95)
    this.game.lighting.addLight(this.boatX + 90, 535, 95, 'rgba(255, 195, 60, 0.35)', 0.38);

    // (E) Divine aura around Lord Ganesha (softened from 0.95/220 down to gentle 0.32/110)
    this.game.lighting.addLight(
      this.boatX,
      Math.min(545, this.submergeY - 30),
      110,
      'rgba(255, 220, 110, 0.28)',
      0.32
    );

    // (F) Celestial moon reflection light in deep water
    this.game.lighting.addLight(this.DEEP_WATER_X, 540, 220, 'rgba(215, 240, 255, 0.24)', 0.42);

    // Render with gentle ambient darkness (0.46 instead of pitch black 0.72)
    // Allows background landscape, far bank silhouettes, and water to be subtly, serenely visible!
    this.game.lighting.render(ctx, this.game.camera, 0.46);

    // 4. Cinematic Captions & Parting Narration (Screen space)
    ctx.save();
    // Phase 1 subtitle
    if (this.stageTimer < 2.0) {
      const alpha = Math.min(1.0, this.stageTimer * 1.5);
      this.renderSubtitle(
        ctx,
        'Devotees gather at the sacred ghat as Lord Ganesha prepares for the final journey...',
        alpha
      );
    }
    // Phase 2 subtitle (Journey to deep waters)
    else if (this.stageTimer >= 2.0 && this.stageTimer < 8.5) {
      const alpha = Math.min(1.0, Math.sin(((this.stageTimer - 2.0) / 6.5) * Math.PI) * 1.4);
      this.renderSubtitle(
        ctx,
        'Taking Lord Ganesha far into the deep, calm waters for the sacred immersion...',
        alpha
      );
    }
    // Phase 3 subtitle (Immersion in deep waters)
    else if (this.stageTimer >= 8.5 && this.stageTimer < 14.5) {
      const alpha = Math.min(1.0, Math.sin(((this.stageTimer - 8.5) / 6.0) * Math.PI) * 1.4);
      this.renderSubtitle(
        ctx,
        'In the moonlit depths of the holy waters, the sacred visarjan begins...',
        alpha
      );
    }

    // Phase 4: Final Emotional Vignette & Parting Quote
    if (this.stageTimer > 14.5) {
      const alpha = Math.min(1.0, (this.stageTimer - 14.5) * 0.75);
      // Dark vignette fade
      const vw = this.game.virtualWidth;
      const vh = this.game.virtualHeight;
      const cx = vw / 2;
      const cy = vh / 2;

      ctx.fillStyle = `rgba(5, 10, 20, ${alpha * 0.88})`;
      ctx.fillRect(0, 0, vw, vh);

      // Parting verses
      ctx.fillStyle = `rgba(255, 236, 179, ${alpha})`;
      ctx.font = 'italic 26px serif';
      ctx.textAlign = 'center';
      ctx.fillText('"Every goodbye carries the promise of another beginning."', cx, cy - 40);

      ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.95})`;
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('Ganpati Bappa Morya! Pudhchya Varshi Lavkar Ya 🙏', cx, cy + 20);

      ctx.fillStyle = `rgba(200, 230, 255, ${alpha * 0.8})`;
      ctx.font = '17px sans-serif';
      ctx.fillText('May Lord Ganesha dissolve all obstacles and bless every path ahead.', cx, cy + 65);
    }
    ctx.restore();
  }

  renderSubtitle(ctx, text, alpha) {
    if (alpha <= 0.05) return;
    ctx.save();
    ctx.fillStyle = `rgba(10, 15, 26, ${alpha * 0.75})`;
    ctx.beginPath();
    ctx.roundRect(140, 650, 1000, 42, 10);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 249, 196, ${alpha})`;
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, 640, 677);
    ctx.restore();
  }

  /**
   * Render the authentic ceremonial boat (Naav)
   * Teak wood hull, brass fixtures, velvet throne, marigold garlands,
   * bow lantern, and rowing devotees.
   */
  renderCeremonialBoat(ctx, bx, by, animTime, isRowing) {
    ctx.save();

    // Gentle wave bobbing motion
    const bobY = Math.sin(animTime * 2.4) * 2;
    const bobRot = Math.sin(animTime * 1.8) * 0.015;
    ctx.translate(bx, by + bobY);
    ctx.rotate(bobRot);

    // 1. Water shadow beneath boat
    ctx.fillStyle = 'rgba(1, 10, 25, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 95, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Stern Oar (Behind hull)
    ctx.save();
    const oarStroke = isRowing ? Math.sin(animTime * 3.6) * 0.28 : 0.05;
    ctx.translate(-70, 2);
    ctx.rotate(0.35 + oarStroke);
    // Shaft
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(-3, -10, 6, 52);
    // Blade
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath();
    ctx.roundRect(-7, 36, 14, 22, 4);
    ctx.fill();
    ctx.restore();

    // 3. Devotee 1: Stern Rower (White Kurta, Saffron Pagri)
    ctx.save();
    ctx.translate(-62, -18);
    // Kurta
    ctx.fillStyle = '#f5f5f5';
    ctx.beginPath();
    ctx.roundRect(-9, 0, 18, 24, 4);
    ctx.fill();
    // Arms holding oar
    ctx.strokeStyle = '#f5f5f5';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-4, 6);
    ctx.lineTo(-12, 18);
    ctx.stroke();
    // Head & face
    ctx.fillStyle = '#d7ccc8';
    ctx.beginPath();
    ctx.arc(0, -7, 7, 0, Math.PI * 2);
    ctx.fill();
    // Saffron Pagri
    ctx.fillStyle = '#ff6f00';
    ctx.beginPath();
    ctx.roundRect(-8, -14, 16, 9, 3);
    ctx.fill();
    ctx.restore();

    // 4. Teak Wood Hull
    const hullGrad = ctx.createLinearGradient(0, -10, 0, 22);
    hullGrad.addColorStop(0, '#5d4037');
    hullGrad.addColorStop(0.5, '#4e342e');
    hullGrad.addColorStop(1, '#271406');
    ctx.fillStyle = hullGrad;

    ctx.beginPath();
    // Indian boat contour: curved stern, gracefully sweeping prow
    ctx.moveTo(-92, -10);
    ctx.quadraticCurveTo(-60, 20, 0, 22);
    ctx.quadraticCurveTo(65, 20, 96, -12); // Prow tip
    ctx.quadraticCurveTo(80, 2, 60, 4);
    ctx.lineTo(-60, 4);
    ctx.quadraticCurveTo(-80, 2, -92, -10);
    ctx.closePath();
    ctx.fill();

    // Gold brass rim along gunwale
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-92, -10);
    ctx.quadraticCurveTo(-60, 2, 0, 4);
    ctx.quadraticCurveTo(60, 4, 96, -12);
    ctx.stroke();

    // Wood plank ribs
    ctx.strokeStyle = 'rgba(39, 20, 6, 0.4)';
    ctx.lineWidth = 1.5;
    for (let rx = -60; rx <= 60; rx += 20) {
      ctx.beginPath();
      ctx.moveTo(rx, 4);
      ctx.lineTo(rx * 0.85, 20);
      ctx.stroke();
    }

    // 5. Ceremonial Dais / Throne in Center (where idol rests)
    ctx.fillStyle = '#b71c1c'; // Crimson velvet
    ctx.fillRect(-45, -4, 90, 8);
    ctx.fillStyle = '#ffd700'; // Gold brocade borders
    ctx.fillRect(-45, -6, 90, 2);
    ctx.fillRect(-45, 2, 90, 2);

    // Marigold Garland along the boat side
    for (let gx = -75; gx <= 75; gx += 12) {
      const drop = Math.sin(((gx + 75) / 150) * Math.PI) * 5;
      ctx.fillStyle = Math.abs(gx) % 24 === 0 ? '#ff9800' : '#ffd600';
      ctx.beginPath();
      ctx.arc(gx, 5 + drop, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Green mango foliage at prow & stern
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.ellipse(88, -8, 8, 4, -0.4, 0, Math.PI * 2);
    ctx.ellipse(-84, -6, 8, 4, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // 6. Devotee 2: Bow Devotee (Saffron Kurta, Folded Prayer Hands)
    ctx.save();
    ctx.translate(62, -18);
    // Kurta
    ctx.fillStyle = '#ff9800';
    ctx.beginPath();
    ctx.roundRect(-8, 0, 16, 24, 4);
    ctx.fill();
    // Folded prayer hands
    ctx.fillStyle = '#ffcc80';
    ctx.beginPath();
    ctx.moveTo(2, 6);
    ctx.lineTo(-4, 12);
    ctx.lineTo(2, 14);
    ctx.fill();
    // Head & face
    ctx.fillStyle = '#d7ccc8';
    ctx.beginPath();
    ctx.arc(0, -7, 7, 0, Math.PI * 2);
    ctx.fill();
    // Headband
    ctx.fillStyle = '#d84315';
    ctx.beginPath();
    ctx.roundRect(-7, -13, 14, 7, 2);
    ctx.fill();
    ctx.restore();

    // 7. Brass Lantern hanging at Prow (Golden Warm Flame)
    ctx.save();
    ctx.translate(94, -10);
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(8, -6);
    ctx.lineTo(8, 4);
    ctx.stroke();

    ctx.fillStyle = '#424242';
    ctx.fillRect(5, 4, 6, 8);

    ctx.fillStyle = '#ffeb3b';
    ctx.shadowColor = '#ffb300';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(8, 7, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }
}
