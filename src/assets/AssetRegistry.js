/**
 * AssetRegistry - Centralized asset abstraction system
 * Decouples all gameplay logic from visual art.
 * Automatically tries to load real images from /assets/ paths.
 * Falls back to rich procedural canvas drawings if files are absent.
 */

import { wardrobeManager } from '../ui/WardrobeManager.js';

export class AssetRegistry {
  constructor() {
    this.assets = new Map();
    this.initRegistry();
  }

  register(keyOrOptions, maybeOptions) {
    let key, options;
    if (typeof keyOrOptions === 'string') {
      key = keyOrOptions;
      options = maybeOptions || {};
    } else if (keyOrOptions && typeof keyOrOptions === 'object') {
      key = keyOrOptions.key;
      options = keyOrOptions;
    } else {
      console.warn('[AssetRegistry] Invalid register parameters', keyOrOptions);
      return;
    }

    const { path, width = 64, height = 64, frames = 1, fallback } = options;
    const asset = {
      key,
      path,
      width,
      height,
      frames,
      loaded: false,
      img: null,
      fallback
    };

    if (path) {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        asset.loaded = true;
        asset.img = img;
      };
      img.onerror = () => {
        asset.loaded = false;
        // Graceful fallback to procedural
      };
      asset.img = img;
    }

    this.assets.set(key, asset);
  }

  get(key) {
    return this.assets.get(key);
  }

  initRegistry() {
    // 1. PLAYER (Cinematic Indian Festival Hero)
    this.register('PLAYER_SPRITE', {
      path: '/assets/characters/player/player.png',
      width: 56,
      height: 84,
      fallback: (ctx, x, y, w, h, state = 'idle', facing = 1, animTime = 0) => {
        ctx.save();
        ctx.translate(x, y);
        if (facing < 0) {
          ctx.scale(-1, 1);
        }

        const isWalking = state === 'walk';
        const walkCycle = isWalking ? Math.sin(animTime * 10) : 0;
        const walkCos = isWalking ? Math.cos(animTime * 10) : 0;
        const breath = Math.sin(animTime * 2.5) * 1.5;
        const bob = isWalking ? Math.abs(Math.sin(animTime * 10)) * 3 : breath;

        const wardrobe = wardrobeManager ? wardrobeManager.getSettings() : { kurtaColor: '#e65100', headwear: 'pheta_saffron', tilak: 'trident' };

        // 1. Dual Soft Contact Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 32, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Animated Legs & Pleated Dhoti / Pants
        // Left Leg
        ctx.save();
        ctx.strokeStyle = '#fff8e1';
        ctx.lineWidth = 9;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-6, -26 - bob);
        ctx.quadraticCurveTo(-10 + walkCycle * 8, -14, -7 + walkCycle * 14, -3);
        ctx.stroke();
        // Left Dhoti Gold Zari Border
        ctx.strokeStyle = '#ffd54f';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-9 + walkCycle * 8, -12);
        ctx.lineTo(-7 + walkCycle * 14, -3);
        ctx.stroke();

        // Left Foot - Embroidered Jutti with curled tip
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.roundRect(-12 + walkCycle * 14, -5, 12, 5, 2);
        ctx.fill();
        ctx.fillStyle = '#ffd54f';
        ctx.fillRect(-11 + walkCycle * 14, -4, 4, 3); // Gold motif
        ctx.restore();

        // Right Leg
        ctx.save();
        ctx.strokeStyle = '#f5eedc';
        ctx.lineWidth = 9;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(6, -26 - bob);
        ctx.quadraticCurveTo(10 - walkCycle * 8, -14, 7 - walkCycle * 14, -3);
        ctx.stroke();
        // Right Dhoti Gold Zari Border
        ctx.strokeStyle = '#ffd54f';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(9 - walkCycle * 8, -12);
        ctx.lineTo(7 - walkCycle * 14, -3);
        ctx.stroke();

        // Right Foot - Embroidered Jutti
        ctx.fillStyle = '#4e342e';
        ctx.beginPath();
        ctx.roundRect(4 - walkCycle * 14, -5, 12, 5, 2);
        ctx.fill();
        ctx.fillStyle = '#ffd54f';
        ctx.fillRect(5 - walkCycle * 14, -4, 4, 3);
        ctx.restore();

        // 3. Torso - Silk Kurta with Shading & Zari
        // Kurta Base
        const kurtaGrad = ctx.createLinearGradient(-15, -60 - bob, 15, -20 - bob);
        kurtaGrad.addColorStop(0, wardrobe.kurtaColor);
        kurtaGrad.addColorStop(0.6, wardrobe.kurtaColor);
        kurtaGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = kurtaGrad;
        ctx.beginPath();
        ctx.roundRect(-16, -58 - bob, 32, 34, [8, 8, 4, 4]);
        ctx.fill();

        // Kurta Slits & Gold Hem
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-16, -26 - bob, 32, 3);

        // Center Placket / Mandarin Collar
        ctx.fillStyle = '#c62828';
        ctx.fillRect(-3, -58 - bob, 6, 22);
        // Golden Buttons
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(0, -54 - bob, 1.8, 0, Math.PI * 2);
        ctx.arc(0, -48 - bob, 1.8, 0, Math.PI * 2);
        ctx.arc(0, -42 - bob, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // 4. Flowing Silk Angavastram (Dupatta/Stole) with Cloth Physics
        const sway = isWalking ? Math.sin(animTime * 8) * 6 : Math.sin(animTime * 3) * 2;
        ctx.save();
        // Shawl diagonal wrap
        ctx.strokeStyle = '#b71c1c';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-14, -54 - bob);
        ctx.quadraticCurveTo(2, -42 - bob, 14, -26 - bob);
        ctx.stroke();

        // Gold border along shawl
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-13, -53 - bob);
        ctx.quadraticCurveTo(2, -41 - bob, 14, -25 - bob);
        ctx.stroke();

        // Flowing drape tail behind left shoulder
        ctx.fillStyle = '#c62828';
        ctx.beginPath();
        ctx.moveTo(-12, -52 - bob);
        ctx.quadraticCurveTo(-18 + sway, -35 - bob, -14 + sway * 1.3, -15 - bob);
        ctx.lineTo(-8 + sway * 1.3, -16 - bob);
        ctx.quadraticCurveTo(-12 + sway, -35 - bob, -6, -50 - bob);
        ctx.closePath();
        ctx.fill();
        // Golden fringe at bottom of stole
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(-14 + sway * 1.3, -15 - bob, 6, 3);
        ctx.restore();

        // 5. Head, Neck & Expressive Festive Face
        // Neck
        ctx.fillStyle = '#cb8354';
        ctx.fillRect(-5, -64 - bob, 10, 8);

        // Face
        ctx.fillStyle = '#df9b6d';
        ctx.beginPath();
        ctx.ellipse(0, -68 - bob, 11, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ear & Golden Kundal Stud
        ctx.fillStyle = '#cf8a5b';
        ctx.beginPath();
        ctx.arc(-10, -68 - bob, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(-10, -66 - bob, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Headwear / Hair / Pheta (Rendered before facial features and tilak)
        if (wardrobe.headwear === 'none') {
          // Styled Festive Hair
          ctx.fillStyle = '#1c1c1c';
          ctx.beginPath();
          ctx.arc(0, -72 - bob, 12, Math.PI * 0.85, Math.PI * 2.15);
          ctx.fill();
          // Hair tuft volume / waves
          ctx.beginPath();
          ctx.arc(3, -78 - bob, 6, 0, Math.PI * 2);
          ctx.arc(-4, -77 - bob, 7, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Traditional Maharashtrian Pheta Turban
          const pColor = wardrobe.headwear === 'pheta_crimson' ? '#b71c1c' : (wardrobe.headwear === 'pheta_gold' ? '#f59e0b' : '#ea580c');
          ctx.fillStyle = pColor;
          ctx.beginPath();
          ctx.roundRect(-13, -84 - bob, 26, 12, [7, 7, 2, 2]);
          ctx.fill();

          // Golden Zari Band
          ctx.fillStyle = '#ffd700';
          ctx.fillRect(-13, -74 - bob, 26, 3);

          // Kalgi Plume / Crest
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          const kalgiX = 4;
          ctx.moveTo(kalgiX - 3, -84 - bob);
          ctx.lineTo(kalgiX, -94 - bob);
          ctx.lineTo(kalgiX + 3, -84 - bob);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(kalgiX, -87 - bob, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Expressive Eyes & Smile
        const eyeX = 3;
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.ellipse(eyeX, -69 - bob, 2.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(eyeX + 0.5, -70 - bob, 1.2, 1.2); // Eye gleam

        // Eyebrow
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(eyeX - 2, -73 - bob);
        ctx.lineTo(eyeX + 3, -73 - bob);
        ctx.stroke();

        // Warm Festive Smile
        ctx.strokeStyle = '#a65636';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(eyeX, -63 - bob, 2.5, 0.2, Math.PI * 0.8);
        ctx.stroke();

        // Sacred Tilak (Drawn ON TOP of forehead / lower turban band so it is always vibrant & visible)
        if (wardrobe.tilak === 'trident') {
          // Yellow chandan U base
          ctx.fillStyle = '#ffd700';
          ctx.fillRect(1.5, -72 - bob, 4.5, 2.2);
          // Red kumkum vertical mark
          ctx.fillStyle = '#d50000';
          ctx.fillRect(3, -75 - bob, 2, 6.5);
        } else if (wardrobe.tilak === 'bindu') {
          // Auspicious Red Kumkum Bindu
          ctx.fillStyle = '#d50000';
          ctx.beginPath();
          ctx.arc(3.5, -71 - bob, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.arc(3.5, -71 - bob, 0.8, 0, Math.PI * 2);
          ctx.fill();
        } else if (wardrobe.tilak === 'vibhuti') {
          // Three sacred white Vibhuti lines with center vermillion dot
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(1, -73 - bob);
          ctx.lineTo(6.5, -73 - bob);
          ctx.moveTo(1, -71 - bob);
          ctx.lineTo(6.5, -71 - bob);
          ctx.stroke();
          ctx.fillStyle = '#d50000';
          ctx.beginPath();
          ctx.arc(3.8, -72 - bob, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // 6. Arms & Hands with Sacred Kalava Thread
        const armSwing = isWalking ? walkCycle * 10 : Math.sin(animTime * 2) * 2;
        // Back Arm
        ctx.save();
        ctx.strokeStyle = '#e65100';
        ctx.lineWidth = 5.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-12, -54 - bob);
        ctx.lineTo(-18 - armSwing, -38 - bob);
        ctx.lineTo(-15 - armSwing * 1.2, -26 - bob);
        ctx.stroke();
        // Back Hand
        ctx.fillStyle = '#df9b6d';
        ctx.beginPath();
        ctx.arc(-15 - armSwing * 1.2, -24 - bob, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Front Arm
        ctx.save();
        ctx.strokeStyle = '#ff9100';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(12, -54 - bob);
        ctx.lineTo(18 + armSwing, -38 - bob);
        ctx.lineTo(15 + armSwing * 1.2, -26 - bob);
        ctx.stroke();

        // Kurta Sleeve Cuff
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(13 + armSwing * 1.1, -29 - bob, 4, 3);

        // Front Hand & Sacred Red Kalava Thread
        ctx.fillStyle = '#df9b6d';
        ctx.beginPath();
        ctx.arc(15 + armSwing * 1.2, -24 - bob, 4, 0, Math.PI * 2);
        ctx.fill();
        // Red Kalava thread on right wrist
        ctx.fillStyle = '#d50000';
        ctx.fillRect(13 + armSwing * 1.2, -26 - bob, 4, 1.5);
        ctx.restore();

        ctx.restore();
      }
    });

    // 2. FESTIVAL UNCLE
    this.register('UNCLE_SPRITE', {
      path: '/assets/characters/festival_uncle/festival_uncle.png',
      width: 52,
      height: 74,
      fallback: (ctx, x, y, w, h, state = 'idle', facing = 1, animTime = 0) => {
        ctx.save();
        ctx.translate(x, y);
        if (facing < 0) ctx.scale(-1, 1);
        const breath = Math.sin(animTime * 1.8) * 1.2;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.fillStyle = '#eceff1';
        ctx.fillRect(-10, -22, 9, 20);
        ctx.fillRect(2, -22, 9, 20);

        // Kurta (White) + Nehru Jacket (Maroon)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-16, -52 + breath, 32, 32);

        ctx.fillStyle = '#880e4f'; // Nehru jacket
        ctx.fillRect(-16, -52 + breath, 32, 24);
        ctx.fillStyle = '#ffd54f'; // Buttons
        ctx.fillRect(-1, -48 + breath, 2, 16);

        // Head
        ctx.fillStyle = '#cb8b5b';
        ctx.beginPath();
        ctx.arc(0, -60 + breath, 11, 0, Math.PI * 2);
        ctx.fill();

        // Gray hair & mustache
        ctx.fillStyle = '#9e9e9e';
        ctx.beginPath();
        ctx.arc(0, -64 + breath, 11, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(1, -58 + breath, 6, 3); // mustache

        // Spectacles
        ctx.strokeStyle = '#263238';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(2, -63 + breath, 6, 4);

        ctx.restore();
      }
    });

    // 3. FLOWER SELLER
    this.register('FLOWER_SELLER_SPRITE', {
      path: '/assets/characters/flower_seller/flower_seller.png',
      width: 50,
      height: 70,
      fallback: (ctx, x, y, w, h, state = 'idle', facing = 1, animTime = 0) => {
        ctx.save();
        ctx.translate(x, y);
        if (facing < 0) ctx.scale(-1, 1);
        const breath = Math.sin(animTime * 2) * 1.2;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Saree (Bright Orange/Green)
        ctx.fillStyle = '#00897b';
        ctx.beginPath();
        ctx.moveTo(-14, -50 + breath);
        ctx.lineTo(14, -50 + breath);
        ctx.lineTo(18, -4);
        ctx.lineTo(-18, -4);
        ctx.closePath();
        ctx.fill();

        // Pallu
        ctx.fillStyle = '#e65100';
        ctx.beginPath();
        ctx.moveTo(-12, -48 + breath);
        ctx.lineTo(14, -28 + breath);
        ctx.lineTo(10, -4);
        ctx.lineTo(-6, -4);
        ctx.closePath();
        ctx.fill();

        // Head
        ctx.fillStyle = '#bd7a49';
        ctx.beginPath();
        ctx.arc(0, -58 + breath, 9.5, 0, Math.PI * 2);
        ctx.fill();

        // Hair bun with Jasmine (Gajra)
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(-8, -59 + breath, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff'; // Gajra
        ctx.beginPath();
        ctx.arc(-8, -59 + breath, 7, Math.PI * 0.4, Math.PI * 1.6);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#fff9c4';
        ctx.stroke();

        // Flower Basket in Hand
        ctx.fillStyle = '#8d6e63';
        ctx.beginPath();
        ctx.arc(16, -26 + breath, 12, 0, Math.PI);
        ctx.fill();
        // Marigold flowers in basket
        ctx.fillStyle = '#ff9800';
        ctx.beginPath();
        ctx.arc(12, -28 + breath, 4, 0, Math.PI * 2);
        ctx.arc(18, -29 + breath, 4, 0, Math.PI * 2);
        ctx.arc(22, -27 + breath, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    });

    // 4. ELECTRICIAN
    this.register('ELECTRICIAN_SPRITE', {
      path: '/assets/characters/electrician/electrician.png',
      width: 50,
      height: 72,
      fallback: (ctx, x, y, w, h, state = 'idle', facing = 1, animTime = 0) => {
        ctx.save();
        ctx.translate(x, y);
        if (facing < 0) ctx.scale(-1, 1);
        const breath = Math.sin(animTime * 2.2) * 1.2;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Blue Work Overalls / Pants
        ctx.fillStyle = '#1565c0';
        ctx.fillRect(-10, -26, 8, 24);
        ctx.fillRect(2, -26, 8, 24);

        // Tool belt
        ctx.fillStyle = '#4e342e';
        ctx.fillRect(-13, -28, 26, 6);
        ctx.fillStyle = '#ffd600'; // Screwdriver handle
        ctx.fillRect(8, -32, 3, 10);

        // Shirt (Khaki)
        ctx.fillStyle = '#d7ccc8';
        ctx.fillRect(-12, -50 + breath, 24, 24);

        // Safety Helmet (Yellow)
        ctx.fillStyle = '#fbc02d';
        ctx.beginPath();
        ctx.arc(0, -62 + breath, 12, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-14, -62 + breath, 28, 4);

        // Face
        ctx.fillStyle = '#c58354';
        ctx.beginPath();
        ctx.arc(0, -56 + breath, 8, 0, Math.PI * 2);
        ctx.fill();

        // Wire Coil on Shoulder
        ctx.strokeStyle = '#d50000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(-12, -42 + breath, 6, 12, 0.3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      }
    });

    // 5. CHILD
    this.register('CHILD_SPRITE', {
      path: '/assets/characters/child/child.png',
      width: 36,
      height: 52,
      fallback: (ctx, x, y, w, h, state = 'idle', facing = 1, animTime = 0) => {
        ctx.save();
        ctx.translate(x, y);
        if (facing < 0) ctx.scale(-1, 1);
        const jump = Math.abs(Math.sin(animTime * 4)) * 3;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shorts & Legs
        ctx.fillStyle = '#e91e63';
        ctx.fillRect(-8, -18 - jump, 6, 16);
        ctx.fillRect(2, -18 - jump, 6, 16);

        // T-Shirt (Bright Blue with Modak motif)
        ctx.fillStyle = '#00b0ff';
        ctx.beginPath();
        ctx.roundRect(-10, -38 - jump, 20, 22, [4, 4, 1, 1]);
        ctx.fill();

        // Head
        ctx.fillStyle = '#d7996c';
        ctx.beginPath();
        ctx.arc(0, -44 - jump, 8, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(0, -46 - jump, 8.5, Math.PI, Math.PI * 2);
        ctx.fill();

        // Happy Hands Raised
        ctx.strokeStyle = '#00b0ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-10, -34 - jump);
        ctx.lineTo(-14, -42 - jump);
        ctx.moveTo(10, -34 - jump);
        ctx.lineTo(14, -42 - jump);
        ctx.stroke();

        ctx.restore();
      }
    });

    // 6. GANESHA IDOL (Central spiritual focus)
    this.register('GANESHA_SPRITE', {
      path: '/assets/ganesha/ganesha_main/ganesha.png',
      width: 140,
      height: 180,
      fallback: (ctx, x, y, w, h, state = 'complete', facing = 1, animTime = 0, revealStage = 5) => {
        ctx.save();
        ctx.translate(x, y);

        const glowPulse = Math.sin(animTime * 2) * 0.15 + 0.85;

        // Aura (Soft, reverent halo in complete or high reveal stages)
        if (revealStage >= 4) {
          const grad = ctx.createRadialGradient(0, -80, 20, 0, -80, 85);
          grad.addColorStop(0, `rgba(255, 215, 0, ${0.22 * glowPulse})`);
          grad.addColorStop(0.6, `rgba(255, 140, 0, ${0.08 * glowPulse})`);
          grad.addColorStop(1, 'rgba(255, 215, 0, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, -80, 85, 0, Math.PI * 2);
          ctx.fill();
        }

        // Shadow / Base Pedestal
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.roundRect(-48, -12, 96, 16, 4);
        ctx.fill();
        ctx.fillStyle = '#8d6e63';
        ctx.beginPath();
        ctx.roundRect(-42, -22, 84, 12, 3);
        ctx.fill();

        // Reveal stage filter if in reveal cutscene
        // 0: Darkness / faint shadow
        // 1: Silhouette
        // 2: Partial body form
        // 3: Trunk & Modak
        // 4: Eyes & Crown
        // 5: Full radiant form

        if (revealStage === 0) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
          ctx.beginPath();
          ctx.arc(0, -75, 40, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          return;
        }

        if (revealStage === 1) {
          ctx.fillStyle = '#261c14';
          ctx.beginPath();
          ctx.ellipse(0, -50, 38, 30, 0, 0, Math.PI * 2);
          ctx.arc(0, -85, 25, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          return;
        }

        // Body / Dhoti (Vibrant Yellow / Pitambara)
        ctx.fillStyle = '#fbc02d';
        ctx.beginPath();
        // Seated folded legs (Padmasana)
        ctx.ellipse(-26, -30, 20, 14, -0.2, 0, Math.PI * 2);
        ctx.ellipse(26, -30, 20, 14, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Round Divine Belly (Lambodara)
        ctx.fillStyle = '#e65100'; // Silk waistband
        ctx.fillRect(-22, -44, 44, 10);
        ctx.fillStyle = '#ffb74d'; // Warm terracotta clay skin
        ctx.beginPath();
        ctx.ellipse(0, -48, 28, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sacred Thread (Yajnopavita / Snake)
        ctx.strokeStyle = '#ffd54f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-18, -75);
        ctx.quadraticCurveTo(5, -55, 18, -36);
        ctx.stroke();

        // Large Divine Ears
        ctx.fillStyle = '#ffa726';
        // Left Ear
        ctx.beginPath();
        ctx.ellipse(-32, -85, 16, 22, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffcc80';
        ctx.beginPath();
        ctx.ellipse(-32, -85, 10, 15, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // Right Ear
        ctx.fillStyle = '#ffa726';
        ctx.beginPath();
        ctx.ellipse(32, -85, 16, 22, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffcc80';
        ctx.beginPath();
        ctx.ellipse(32, -85, 10, 15, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Elephant Head
        ctx.fillStyle = '#ffb74d';
        ctx.beginPath();
        ctx.ellipse(0, -82, 24, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Trunk (Vakratunda)
        if (revealStage >= 3) {
          ctx.fillStyle = '#ffa726';
          ctx.beginPath();
          ctx.moveTo(-8, -78);
          ctx.quadraticCurveTo(-14, -50, -4, -36);
          ctx.quadraticCurveTo(8, -32, 10, -44);
          ctx.quadraticCurveTo(0, -52, 2, -78);
          ctx.closePath();
          ctx.fill();

          // Modak (Sweet) in Trunk Tip
          ctx.fillStyle = '#ffd54f';
          ctx.beginPath();
          ctx.moveTo(8, -48);
          ctx.lineTo(14, -42);
          ctx.lineTo(4, -40);
          ctx.closePath();
          ctx.fill();

          // Left Tusk (Intact) & Right Tusk (Broken - Ekadanta)
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(-8, -72);
          ctx.lineTo(-15, -65);
          ctx.lineTo(-6, -68);
          ctx.fill();
          // Broken right
          ctx.beginPath();
          ctx.moveTo(8, -72);
          ctx.lineTo(12, -67);
          ctx.lineTo(7, -68);
          ctx.fill();
        }

        // Eyes & Tilak (Trishul mark)
        if (revealStage >= 4) {
          ctx.fillStyle = '#212121';
          ctx.beginPath();
          ctx.ellipse(-10, -85, 4, 2.5, 0, 0, Math.PI * 2);
          ctx.ellipse(10, -85, 4, 2.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-11, -86, 2, 2);
          ctx.fillRect(9, -86, 2, 2);

          // Trishul / Chandan Tilak
          ctx.fillStyle = '#c62828';
          ctx.beginPath();
          ctx.moveTo(0, -96);
          ctx.lineTo(4, -88);
          ctx.lineTo(-4, -88);
          ctx.fill();
          ctx.fillStyle = '#ffd600';
          ctx.fillRect(-6, -91, 12, 2.5);
        }

        // Ornate Golden Crown (Mukut)
        if (revealStage >= 4) {
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.moveTo(-18, -98);
          ctx.lineTo(0, -128);
          ctx.lineTo(18, -98);
          ctx.closePath();
          ctx.fill();

          // Crown Jewels
          ctx.fillStyle = '#d50000';
          ctx.beginPath();
          ctx.arc(0, -112, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#00b0ff';
          ctx.beginPath();
          ctx.arc(-8, -104, 2.5, 0, Math.PI * 2);
          ctx.arc(8, -104, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Four Hands (Chaturbhuja)
        // 1. Upper Right: Ankusha (Axe/Goad)
        // 2. Upper Left: Pasha (Noose/Lotus)
        // 3. Lower Right: Abhaya Mudra (Blessing)
        // 4. Lower Left: Bowl of Modaks
        if (revealStage >= 3) {
          // Blessing Hand
          ctx.fillStyle = '#ffb74d';
          ctx.beginPath();
          ctx.arc(28, -58, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#c62828'; // Red auspicious palm circle
          ctx.beginPath();
          ctx.arc(28, -58, 3, 0, Math.PI * 2);
          ctx.fill();

          // Modak Plate (Prasad) in Left Hand
          ctx.fillStyle = '#ffb74d';
          ctx.beginPath();
          ctx.arc(-28, -52, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffd54f';
          ctx.beginPath();
          ctx.ellipse(-28, -52, 10, 5, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Fresh Marigold Garland (Har)
        if (revealStage >= 5) {
          const flowerColors = ['#ff6f00', '#ffd600', '#e65100', '#ffd600', '#ff6f00'];
          for (let i = 0; i < 9; i++) {
            const angle = Math.PI * 0.2 + (i / 8) * Math.PI * 0.6;
            const fx = Math.cos(angle) * 36;
            const fy = Math.sin(angle) * 32 - 70;
            ctx.fillStyle = flowerColors[i % flowerColors.length];
            ctx.beginPath();
            ctx.arc(fx, fy, 5.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      }
    });

    // 7. MANDAPAM (Pandal / Stage)
    this.register('MANDAPAM_SPRITE', {
      path: '/assets/environment/mandapam/mandapam.png',
      width: 280,
      height: 240,
      fallback: (ctx, x, y, w, h, state = 'empty', facing = 1, animTime = 0, isLit = false) => {
        ctx.save();
        ctx.translate(x, y);

        // Platform / Base Steps
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(-130, -14, 260, 14);
        ctx.fillStyle = '#bcaaa4';
        ctx.fillRect(-120, -24, 240, 10);
        ctx.fillStyle = '#d7ccc8';
        ctx.fillRect(-105, -30, 210, 6);

        // Rangoli in front of mandapam
        ctx.fillStyle = 'rgba(255, 235, 59, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, -6, 40, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        if (state === 'empty') {
          // Just foundation markers
          ctx.strokeStyle = 'rgba(255, 193, 7, 0.6)';
          ctx.setLineDash([6, 6]);
          ctx.strokeRect(-90, -180, 180, 150);
          ctx.setLineDash([]);
          ctx.restore();
          return;
        }

        // Bamboo / Timber Frame (States: 'bamboo', 'decorated', 'lit')
        ctx.fillStyle = '#8d6e63'; // Bamboo brown
        ctx.strokeStyle = '#6d4c41';
        ctx.lineWidth = 1.5;

        // Pillars
        const pillars = [-90, -45, 45, 90];
        pillars.forEach(px => {
          ctx.fillRect(px - 5, -180, 10, 150);
          ctx.strokeRect(px - 5, -180, 10, 150);
          // Bamboo rings
          for (let ry = -160; ry < -30; ry += 30) {
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(px - 6, ry, 12, 3);
            ctx.fillStyle = '#8d6e63';
          }
        });

        // Top horizontal beams
        ctx.fillRect(-96, -185, 192, 10);
        ctx.strokeRect(-96, -185, 192, 10);

        // Roof Truss / Triangle
        ctx.beginPath();
        ctx.moveTo(-100, -185);
        ctx.lineTo(0, -235);
        ctx.lineTo(100, -185);
        ctx.closePath();
        ctx.stroke();

        if (state === 'bamboo') {
          ctx.restore();
          return;
        }

        // DECORATED STATE: Rich Fabric, Canopy, Torans
        // Canopy Fabric (Yellow & Saffron draped folds)
        ctx.fillStyle = '#ff8f00';
        ctx.beginPath();
        ctx.moveTo(-102, -185);
        ctx.lineTo(0, -238);
        ctx.lineTo(102, -185);
        ctx.closePath();
        ctx.fill();

        // Kalash on roof peak
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(0, -244, 7, 0, Math.PI * 2);
        ctx.fill();
        // Coconut & Mango leaves
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.moveTo(-6, -244);
        ctx.lineTo(0, -256);
        ctx.lineTo(6, -244);
        ctx.fill();

        // Draped Backdrop Fabric (Royal Red with Golden Stars)
        ctx.fillStyle = '#b71c1c';
        ctx.fillRect(-85, -178, 170, 148);

        // Gold border curtains
        ctx.fillStyle = '#ffd54f';
        ctx.fillRect(-85, -178, 170, 8);

        // Side Drapes (Saffron swag curtains)
        ctx.fillStyle = '#e65100';
        ctx.beginPath();
        ctx.moveTo(-85, -170);
        ctx.quadraticCurveTo(-70, -100, -85, -30);
        ctx.lineTo(-65, -30);
        ctx.quadraticCurveTo(-50, -100, -65, -170);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(85, -170);
        ctx.quadraticCurveTo(70, -100, 85, -30);
        ctx.lineTo(65, -30);
        ctx.quadraticCurveTo(50, -100, 65, -170);
        ctx.closePath();
        ctx.fill();

        // Mango Leaves & Marigold Toran
        for (let tx = -90; tx < 90; tx += 15) {
          ctx.fillStyle = '#2e7d32'; // Mango leaf
          ctx.beginPath();
          ctx.moveTo(tx, -175);
          ctx.lineTo(tx + 7, -162);
          ctx.lineTo(tx + 14, -175);
          ctx.fill();

          ctx.fillStyle = '#ffb300'; // Marigold ball
          ctx.beginPath();
          ctx.arc(tx + 7, -160, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Hanging Brass Bells
        [-70, -35, 35, 70].forEach(bx => {
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(bx, -175);
          ctx.lineTo(bx, -155);
          ctx.stroke();

          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.moveTo(bx - 5, -148);
          ctx.lineTo(bx + 5, -148);
          ctx.lineTo(bx + 2, -155);
          ctx.lineTo(bx - 2, -155);
          ctx.closePath();
          ctx.fill();
        });

        // LIGHTS (If lit or decorated)
        const lightColors = ['#ff1744', '#00e676', '#ffea00', '#00e5ff', '#ff9100'];
        const numBulbs = 18;
        for (let i = 0; i <= numBulbs; i++) {
          const lx = -94 + (i / numBulbs) * 188;
          const ly = -186 + Math.sin((i / numBulbs) * Math.PI) * 12;
          const bulbColor = lightColors[i % lightColors.length];

          ctx.fillStyle = isLit ? bulbColor : '#757575';
          ctx.beginPath();
          ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
          ctx.fill();

          if (isLit) {
            // Glow halo
            ctx.fillStyle = bulbColor;
            ctx.globalAlpha = 0.4 + Math.sin(animTime * 6 + i) * 0.2;
            ctx.beginPath();
            ctx.arc(lx, ly, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }
        }

        ctx.restore();
      }
    });

    // 8. GENERATOR
    this.register('GENERATOR_SPRITE', {
      path: '/assets/props/generator/generator.png',
      width: 70,
      height: 55,
      fallback: (ctx, x, y, w, h, state = 'off', facing = 1, animTime = 0) => {
        ctx.save();
        ctx.translate(x, y);

        const isRunning = state === 'running';
        const vib = isRunning ? (Math.random() - 0.5) * 2 : 0;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 32, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wheels
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(-22, -6, 6, 0, Math.PI * 2);
        ctx.arc(22, -6, 6, 0, Math.PI * 2);
        ctx.fill();

        // Main Heavy Body
        ctx.fillStyle = '#37474f';
        ctx.beginPath();
        ctx.roundRect(-28, -44 + vib, 56, 38, 4);
        ctx.fill();

        // Control Panel
        ctx.fillStyle = '#263238';
        ctx.fillRect(-22, -38 + vib, 24, 26);

        // Power Switch
        ctx.fillStyle = isRunning ? '#00e676' : '#d50000';
        ctx.fillRect(-18, -32 + vib, 6, 8);

        // Voltmeter Gauge
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-8, -26 + vib, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d50000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-8, -26 + vib);
        ctx.lineTo(isRunning ? -6 : -10, -29 + vib);
        ctx.stroke();

        // Pull Cord Handle
        ctx.fillStyle = '#ff6d00';
        ctx.fillRect(8, -34 + vib, 8, 4);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(12, -30 + vib);
        ctx.lineTo(12, -22 + vib);
        ctx.stroke();

        // Cooling Vents / Grille
        ctx.fillStyle = '#1c2529';
        for (let gy = -38; gy <= -18; gy += 4) {
          ctx.fillRect(8, gy + vib, 14, 2);
        }

        // Exhaust Pipe
        ctx.fillStyle = '#78909c';
        ctx.fillRect(20, -48 + vib, 5, 8);

        // Exhaust smoke puffs if running
        if (isRunning && Math.random() > 0.4) {
          ctx.fillStyle = 'rgba(200, 200, 200, 0.35)';
          ctx.beginPath();
          ctx.arc(22 + (Math.random() * 8), -54 - (animTime * 20 % 30), 4 + Math.random() * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    });

    // 9. BAMBOO STICK (for construction)
    this.register('BAMBOO_SPRITE', {
      path: '/assets/props/bamboo/bamboo.png',
      width: 24,
      height: 90,
      fallback: (ctx, x, y, w, h, state = 'default', facing = 1, animTime = 0) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(-w / 2, -h / 2, w, h);
        // Rings
        ctx.fillStyle = '#5d4037';
        for (let ry = -h / 2 + 15; ry < h / 2; ry += 25) {
          ctx.fillRect(-w / 2 - 2, ry, w + 4, 4);
        }
        ctx.restore();
      }
    });

    // 10. FLOWER BASKET & FLOWERS
    this.register('FLOWERS_SPRITE', {
      path: '/assets/props/flowers/flowers.png',
      width: 40,
      height: 30,
      fallback: (ctx, x, y, w, h, state = 'yellow', facing = 1, animTime = 0) => {
        ctx.save();
        ctx.translate(x, y);
        const colors = {
          yellow: '#ffd600',
          red: '#d50000',
          pink: '#f06292',
          orange: '#ff6d00',
          green: '#2e7d32'
        };
        ctx.fillStyle = colors[state] || '#ff9800';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    // 11. STREET HOUSES & TEMPLE
    this.register('TEMPLE_SPRITE', {
      path: '/assets/environment/temple/temple.png',
      width: 260,
      height: 280,
      fallback: (ctx, x, y, w, h, state = 'default', facing = 1, animTime = 0) => {
        ctx.save();
        ctx.translate(x, y);

        // Sanctum Base
        ctx.fillStyle = '#d7ccc8';
        ctx.fillRect(-110, -110, 220, 110);
        ctx.fillStyle = '#bcaaa4';
        ctx.fillRect(-120, -12, 240, 12);

        // Ornate Pillars & Carvings
        [-90, -40, 40, 90].forEach(col => {
          ctx.fillStyle = '#a1887f';
          ctx.fillRect(col - 8, -110, 16, 98);
        });

        // Entrance Arch (Temple sanctum)
        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        ctx.arc(0, -60, 28, Math.PI, 0);
        ctx.fillRect(-28, -60, 56, 48);
        ctx.fill();

        // Shikhara (Traditional Tower Spire)
        ctx.fillStyle = '#ffb300';
        ctx.beginPath();
        ctx.moveTo(-90, -110);
        ctx.lineTo(0, -240);
        ctx.lineTo(90, -110);
        ctx.closePath();
        ctx.fill();

        // Shikhara tiers
        for (let sy = -130; sy > -220; sy -= 25) {
          ctx.fillStyle = '#ffa000';
          const sw = (sy + 240) * 0.6;
          ctx.fillRect(-sw, sy, sw * 2, 6);
        }

        // Golden Kalash & Trident
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(0, -246, 8, 0, Math.PI * 2);
        ctx.fill();

        // Fluttering Saffron Flag (Dhwaja)
        const flagWave = Math.sin(animTime * 4) * 6;
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -254);
        ctx.lineTo(0, -280);
        ctx.stroke();

        ctx.fillStyle = '#ff6f00';
        ctx.beginPath();
        ctx.moveTo(0, -280);
        ctx.lineTo(24 + flagWave, -270);
        ctx.lineTo(0, -260);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
    });

    this.register('HOUSE_SPRITE', {
      path: '/assets/environment/houses/house.png',
      width: 220,
      height: 200,
      fallback: (ctx, x, y, w, h, state = '1', facing = 1, animTime = 0) => {
        ctx.save();
        ctx.translate(x, y);

        const isHouse1 = state === '1';

        // 1. Entrance Plinth / Stone Foundation (y: -14 to 0)
        ctx.fillStyle = '#334155';
        ctx.fillRect(-105, -7, 210, 7);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-100, -13, 200, 6);

        // 2. Main Ground Floor Structure (y: -85 to -13)
        ctx.fillStyle = isHouse1 ? '#f8fafc' : '#f1f5f9';
        ctx.fillRect(-96, -85, 192, 72);

        // Modern Architectural Fluted Wood / Slate Accent Wall Panel
        ctx.fillStyle = isHouse1 ? '#8d6e63' : '#3b4252';
        ctx.fillRect(-96, -85, 52, 72);

        // Vertical fluted slats on accent panel
        ctx.fillStyle = isHouse1 ? '#5d4037' : '#1e293b';
        for (let sx = -92; sx < -48; sx += 8) {
          ctx.fillRect(sx, -85, 3, 72);
        }

        // Ground Floor Modern Large Picture Window
        ctx.fillStyle = '#0f172a'; // Slim black frame
        ctx.fillRect(-38, -78, 50, 54);
        ctx.fillStyle = '#fef08a'; // Warm ambient interior glow
        ctx.fillRect(-36, -76, 46, 50);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.22)'; // Glass reflection
        ctx.fillRect(-36, -76, 46, 50);
        // Modern thin mullions
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-14, -76, 2.5, 50);
        ctx.fillRect(-36, -52, 46, 2.5);

        // Modern Entrance Porch / Canopy (Floating cantilever)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(18, -88, 76, 7);

        // Modern Grand Entrance Teak Door
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(26, -81, 46, 68);
        ctx.fillStyle = '#4e342e'; // Inner door panel
        ctx.fillRect(29, -78, 40, 62);

        // Modern Long Vertical Bronze Door Handle
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(63, -56, 3, 24);

        // Exterior Modern Wall Sconce Light (with up/down glow)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(16, -58, 5, 14);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(17, -54, 3, 6);

        // 3. Cantilevered Upper Floor / Balcony Level (y: -165 to -85)
        ctx.fillStyle = isHouse1 ? '#ffffff' : '#f8fafc';
        ctx.fillRect(-102, -165, 204, 80);

        // Upper floor feature frame / architectural box
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(-102, -165, 204, 80);

        // Upper Modern Sliding French Glass Doors
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-45, -158, 80, 65);
        ctx.fillStyle = '#fffbeb'; // Soft golden interior warmth
        ctx.fillRect(-42, -155, 74, 59);
        // Glass sheen diagonal highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(-35, -155);
        ctx.lineTo(-15, -155);
        ctx.lineTo(-42, -96);
        ctx.lineTo(-42, -116);
        ctx.closePath();
        ctx.fill();
        // Sliding door frame
        ctx.fillStyle = '#334155';
        ctx.fillRect(-6, -155, 3, 59);

        // Modern Glass & Steel Balcony Railing (y: -118 to -85)
        ctx.fillStyle = 'rgba(186, 230, 253, 0.55)'; // Tempered glass panel
        ctx.fillRect(-85, -118, 160, 30);
        ctx.strokeStyle = '#94a3b8'; // Top steel handrail
        ctx.lineWidth = 3;
        ctx.strokeRect(-85, -118, 160, 30);
        // Stainless steel mounting posts
        ctx.fillStyle = '#64748b';
        [-83, -32, 20, 72].forEach(px => {
          ctx.fillRect(px, -118, 3, 30);
        });

        // Balcony Planter Box with green foliage
        ctx.fillStyle = '#475569';
        ctx.fillRect(-80, -96, 50, 10);
        ctx.fillStyle = '#16a34a';
        for (let bx = -78; bx <= -34; bx += 8) {
          ctx.beginPath();
          ctx.arc(bx, -97, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        // 4. Roof Terrace & Pergola (y: -192 to -165)
        // Modern parapet wall
        ctx.fillStyle = isHouse1 ? '#e2e8f0' : '#cbd5e1';
        ctx.fillRect(-106, -172, 212, 8);

        // Modern Architectural Pergola Wooden Beams (Rooftop Trellis)
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(-85, -192, 6, 20);
        ctx.fillRect(75, -192, 6, 20);
        ctx.fillRect(-90, -194, 175, 5);
        for (let bx = -80; bx <= 70; bx += 22) {
          ctx.fillRect(bx, -192, 4, 18);
        }

        // 5. Festive Mango Leaf & Marigold Toran above entrance
        const toranColors = ['#f59e0b', '#e11d48', '#10b981', '#fbbf24'];
        for (let tx = 22; tx <= 72; tx += 6) {
          ctx.fillStyle = toranColors[Math.floor(Math.abs(tx) / 6) % toranColors.length];
          ctx.beginPath();
          ctx.arc(tx, -84, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    });

    // 12. PROCESSION CART / VEHICLE
    this.register('VEHICLE_SPRITE', {
      path: '/assets/props/vehicles/chariot.png',
      width: 180,
      height: 120,
      fallback: (ctx, x, y, w, h, state = 'default', facing = 1, animTime = 0) => {
        ctx.save();
        ctx.translate(x, y);

        // Chariot platform
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(-70, -35, 140, 20);
        ctx.fillStyle = '#ffb300'; // Gold trim
        ctx.fillRect(-75, -40, 150, 6);

        // Large Decorative Wheels
        [-45, 45].forEach(wx => {
          ctx.fillStyle = '#4e342e';
          ctx.beginPath();
          ctx.arc(wx, -10, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.arc(wx, -10, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#4e342e';
          ctx.beginPath();
          ctx.arc(wx, -10, 5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Floral Garland swags
        ctx.fillStyle = '#ff9800';
        for (let gx = -65; gx <= 65; gx += 12) {
          ctx.beginPath();
          ctx.arc(gx, -32 + Math.sin(gx * 0.1) * 4, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    });

    // 13. Rangoli Ground Art
    this.register({
      key: 'RANGOLI_ART',
      width: 140,
      height: 60,
      fallback: (ctx, x, y, w, h, state = '1', facing = 1, animTime = 0) => {
        ctx.save();
        ctx.translate(x, y);

        // Perspective flat ellipse on street road floor
        ctx.scale(1, 0.45);

        if (state === '2') {
          // Pattern 2: Peacock Emerald Star Mandala
          // Outer white chalk dots ring
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 5]);
          ctx.beginPath();
          ctx.arc(0, 0, 56, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Peacock blue outer petals
          const petals = 10;
          for (let i = 0; i < petals; i++) {
            const angle = (i * Math.PI * 2) / petals;
            ctx.fillStyle = i % 2 === 0 ? '#0284c7' : '#06b6d4';
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * 42, Math.sin(angle) * 42, 11, 0, Math.PI * 2);
            ctx.fill();
          }

          // Emerald Green Ring
          ctx.fillStyle = '#059669';
          ctx.beginPath();
          ctx.arc(0, 0, 32, 0, Math.PI * 2);
          ctx.fill();

          // Saffron Gold Inner Star
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          for (let i = 0; i < 8; i++) {
            const r = i % 2 === 0 ? 22 : 11;
            const a = (i * Math.PI) / 4;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();

          // Chalk white center ring
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.stroke();

          // Center ruby bindu
          ctx.fillStyle = '#e11d48';
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.fill();
        } else if (state === '3') {
          // Pattern 3: Royal Magenta & Turmeric Lotus Rangoli
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(0, 0, 58, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Magenta & Pink Lotus Petals
          const petals = 12;
          for (let i = 0; i < petals; i++) {
            const angle = (i * Math.PI * 2) / petals;
            ctx.fillStyle = i % 2 === 0 ? '#c026d3' : '#ec4899';
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * 43, Math.sin(angle) * 43, 10, 0, Math.PI * 2);
            ctx.fill();
          }

          // Turmeric yellow ring
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(0, 0, 32, 0, Math.PI * 2);
          ctx.fill();

          // Crimson Lotus Heart
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(0, 0, 20, 0, Math.PI * 2);
          ctx.fill();

          // Golden center flower
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Pattern 1: Classic Grand Vermilion Diya Kolam
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 6]);
          ctx.beginPath();
          ctx.arc(0, 0, 54, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Outer Vermilion Petals
          const petals = 12;
          for (let i = 0; i < petals; i++) {
            const angle = (i * Math.PI * 2) / petals;
            ctx.fillStyle = i % 2 === 0 ? '#d50000' : '#ff6d00';
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * 40, Math.sin(angle) * 40, 10, 0, Math.PI * 2);
            ctx.fill();
          }

          // Mid Ring - Turmeric Gold & Peacock Green
          ctx.fillStyle = '#ffd600';
          ctx.beginPath();
          ctx.arc(0, 0, 32, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#00bfa5';
          ctx.beginPath();
          ctx.arc(0, 0, 22, 0, Math.PI * 2);
          ctx.fill();

          // Inner Sacred Star
          ctx.fillStyle = '#7b1fa2';
          ctx.beginPath();
          for (let i = 0; i < 8; i++) {
            const r = i % 2 === 0 ? 16 : 8;
            const a = (i * Math.PI) / 4;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();

          // Center Diya Base & Flame
          ctx.fillStyle = '#b71c1c';
          ctx.beginPath();
          ctx.arc(0, 0, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fff59d';
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    });

    // 14. Hanging Festive Kandil Lantern (Akash Kandil)
    this.register({
      key: 'KANDIL_LANTERN',
      width: 48,
      height: 90,
      fallback: (ctx, x, y, w, h, state = 'gold', facing = 1, animTime = 0) => {
        ctx.save();
        ctx.translate(x, y);
        const sway = Math.sin(animTime * 3 + x * 0.05) * 6;

        // Hanging string from roof
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(sway * 0.3, 20);
        ctx.stroke();

        ctx.translate(sway * 0.3, 20);
        ctx.rotate((sway * Math.PI) / 180);

        // Warm radial light glow around lantern
        const glow = ctx.createRadialGradient(0, 22, 5, 0, 22, 38);
        glow.addColorStop(0, 'rgba(255, 215, 0, 0.45)');
        glow.addColorStop(0.7, 'rgba(255, 143, 0, 0.15)');
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 22, 38, 0, Math.PI * 2);
        ctx.fill();

        // Octagonal Diamond Paper Prism
        const colors = state === 'pink' ? ['#e91e63', '#9c27b0'] : ['#ff9800', '#ffd600'];
        ctx.fillStyle = colors[0];
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(18, 14);
        ctx.lineTo(18, 30);
        ctx.lineTo(0, 44);
        ctx.lineTo(-18, 30);
        ctx.lineTo(-18, 14);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner Diamond Contrast Face
        ctx.fillStyle = colors[1];
        ctx.beginPath();
        ctx.moveTo(0, 8);
        ctx.lineTo(11, 22);
        ctx.lineTo(0, 36);
        ctx.lineTo(-11, 22);
        ctx.closePath();
        ctx.fill();

        // Golden mirror / star cutout in center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 22, 4, 0, Math.PI * 2);
        ctx.fill();

        // 5 Flowing Paper Tassels / Ribbons with dynamic wind sway
        const tasselColors = ['#ffd600', '#ff5722', '#e91e63', '#00e676', '#ffd600'];
        for (let i = -2; i <= 2; i++) {
          const tx = i * 6;
          const tSway = Math.sin(animTime * 4 + i * 0.8) * 8;
          ctx.strokeStyle = tasselColors[i + 2];
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(tx, 44);
          ctx.quadraticCurveTo(tx + tSway * 0.5, 62, tx + tSway, 80);
          ctx.stroke();
        }

        ctx.restore();
      }
    });

    // 15. Ornate Streetlamp
    this.register({
      key: 'STREET_LAMP',
      width: 40,
      height: 220,
      fallback: (ctx, x, y, w, h, state = 'lit', facing = 1, animTime = 0) => {
        ctx.save();
        ctx.translate(x, y);

        // Ground base
        ctx.fillStyle = '#263238';
        ctx.beginPath();
        ctx.roundRect(-16, -10, 32, 10, 3);
        ctx.fill();
        ctx.fillStyle = '#37474f';
        ctx.beginPath();
        ctx.roundRect(-10, -26, 20, 16, 3);
        ctx.fill();

        // Main Fluted Post
        ctx.fillStyle = '#212121';
        ctx.fillRect(-4, -180, 8, 154);

        // Decorative Cast-Iron Rings & Brackets
        ctx.fillStyle = '#ffd54f';
        ctx.fillRect(-6, -90, 12, 4);
        ctx.fillRect(-6, -140, 12, 4);
        ctx.fillRect(-8, -182, 16, 5);

        // Curved Scroll Brackets
        ctx.strokeStyle = '#263238';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(-10, -172, 8, 0, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(10, -172, 8, 0, Math.PI);
        ctx.stroke();

        // Lantern Housing Top & Finial
        ctx.fillStyle = '#1e2433';
        ctx.beginPath();
        ctx.moveTo(0, -220);
        ctx.lineTo(16, -196);
        ctx.lineTo(-16, -196);
        ctx.closePath();
        ctx.fill();

        // Finial spike
        ctx.strokeStyle = '#ffd54f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -220);
        ctx.lineTo(0, -228);
        ctx.stroke();

        // Lantern Glass Chamber
        ctx.fillStyle = state === 'lit' ? 'rgba(255, 224, 130, 0.85)' : 'rgba(200, 214, 229, 0.4)';
        ctx.beginPath();
        ctx.moveTo(-14, -196);
        ctx.lineTo(14, -196);
        ctx.lineTo(9, -165);
        ctx.lineTo(-9, -165);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#37474f';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Glowing Core Bulb (if lit)
        if (state === 'lit') {
          const bulbFlicker = Math.sin(animTime * 15) * 1.5;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, -180, 4 + bulbFlicker * 0.2, 0, Math.PI * 2);
          ctx.fill();

          // Warm radial halo
          const halo = ctx.createRadialGradient(0, -180, 4, 0, -180, 45);
          halo.addColorStop(0, 'rgba(255, 235, 59, 0.6)');
          halo.addColorStop(0.5, 'rgba(255, 160, 0, 0.25)');
          halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(0, -180, 45, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    });

    // 10. MANGO TREE (Auspicious Festive Mango Tree for Leaves & Toran)
    this.register('MANGO_TREE_SPRITE', {
      path: '/assets/environment/props/mango_tree.png',
      width: 170,
      height: 230,
      fallback: (ctx, x, y, w = 170, h = 230, state = 'default', facing = 1, animTime = 0) => {
        ctx.save();
        ctx.translate(x, y);

        // 1. Dual Soft Ground Contact Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.beginPath();
        ctx.ellipse(0, 0, w * 0.46, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
        ctx.beginPath();
        ctx.ellipse(0, -2, w * 0.32, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Gnarled Organic Trunk & Roots
        const trunkGrad = ctx.createLinearGradient(-25, -h * 0.6, 25, 0);
        trunkGrad.addColorStop(0, '#4e342e');
        trunkGrad.addColorStop(0.5, '#5d4037');
        trunkGrad.addColorStop(1, '#3e2723');
        ctx.fillStyle = trunkGrad;

        // Trunk outline
        ctx.beginPath();
        ctx.moveTo(-28, 0); // Left root flare
        ctx.quadraticCurveTo(-18, -25, -16, -h * 0.35);
        ctx.quadraticCurveTo(-22, -h * 0.5, -35, -h * 0.65); // Left fork branch
        ctx.lineTo(-24, -h * 0.68);
        ctx.quadraticCurveTo(-10, -h * 0.52, -4, -h * 0.45);
        ctx.quadraticCurveTo(8, -h * 0.55, 32, -h * 0.64); // Right fork branch
        ctx.lineTo(38, -h * 0.60);
        ctx.quadraticCurveTo(20, -h * 0.48, 16, -h * 0.35);
        ctx.quadraticCurveTo(18, -22, 28, 0); // Right root flare
        ctx.closePath();
        ctx.fill();

        // Bark texture lines
        ctx.strokeStyle = '#2d1d17';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-10, -8);
        ctx.quadraticCurveTo(-8, -h * 0.2, -6, -h * 0.36);
        ctx.moveTo(3, -5);
        ctx.quadraticCurveTo(7, -h * 0.22, 6, -h * 0.4);
        ctx.moveTo(-18, -h * 0.45);
        ctx.lineTo(-26, -h * 0.6);
        ctx.moveTo(10, -h * 0.42);
        ctx.lineTo(24, -h * 0.58);
        ctx.stroke();

        // Subtle moss/lichen at base
        ctx.fillStyle = 'rgba(76, 175, 80, 0.4)';
        ctx.beginPath();
        ctx.ellipse(-8, -4, 10, 4, 0.2, 0, Math.PI * 2);
        ctx.ellipse(8, -3, 8, 3, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // 3. Multi-Tiered Foliage Canopy with natural breeze
        const wind = Math.sin(animTime * 2.2) * 3;
        const windFine = Math.cos(animTime * 3.1) * 2;

        const canopyLayers = [
          // Background Deep Shadow Foliage
          { cx: -32 + wind * 0.3, cy: -h * 0.68, rx: 46, ry: 38, col: '#1b5e20' },
          { cx: 34 + wind * 0.3, cy: -h * 0.66, rx: 48, ry: 40, col: '#1b5e20' },
          { cx: 0 + wind * 0.4, cy: -h * 0.82, rx: 54, ry: 44, col: '#1e6827' },
          // Mid Canopy Clusters
          { cx: -42 + wind * 0.6, cy: -h * 0.58, rx: 42, ry: 34, col: '#2e7d32' },
          { cx: 44 + wind * 0.6, cy: -h * 0.56, rx: 44, ry: 36, col: '#2e7d32' },
          { cx: -18 + wind * 0.7, cy: -h * 0.74, rx: 50, ry: 40, col: '#388e3c' },
          { cx: 22 + wind * 0.7, cy: -h * 0.72, rx: 48, ry: 38, col: '#388e3c' },
          // Foreground Sunlit Leaf Clusters
          { cx: 0 + wind, cy: -h * 0.62, rx: 46, ry: 36, col: '#43a047' },
          { cx: -28 + wind, cy: -h * 0.48, rx: 36, ry: 28, col: '#4caf50' },
          { cx: 30 + wind, cy: -h * 0.47, rx: 38, ry: 30, col: '#4caf50' },
          { cx: 0 + wind * 1.1, cy: -h * 0.88, rx: 34, ry: 26, col: '#66bb6a' }
        ];

        canopyLayers.forEach(c => {
          ctx.fillStyle = c.col;
          ctx.beginPath();
          ctx.ellipse(c.cx, c.cy, c.rx, c.ry, 0, 0, Math.PI * 2);
          ctx.fill();
        });

        // 4. Detailed Lanceolate Mango Leaves (Clusters hanging down)
        const hangingLeafClusters = [
          { x: -55 + wind * 0.8, y: -h * 0.45, rot: 0.3 },
          { x: -35 + wind, y: -h * 0.38, rot: 0.1 },
          { x: -10 + wind * 1.2, y: -h * 0.35, rot: -0.1 },
          { x: 15 + wind * 1.1, y: -h * 0.36, rot: 0.2 },
          { x: 40 + wind * 0.9, y: -h * 0.40, rot: -0.2 },
          { x: 60 + wind * 0.7, y: -h * 0.46, rot: -0.35 }
        ];

        hangingLeafClusters.forEach(lc => {
          ctx.save();
          ctx.translate(lc.x, lc.y);
          ctx.rotate(lc.rot);

          // Render 3 overlapping pointed leaves
          for (let i = -1; i <= 1; i++) {
            ctx.save();
            ctx.rotate(i * 0.28 + windFine * 0.04);
            ctx.fillStyle = i === 0 ? '#81c784' : '#2e7d32';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-6, 12, 0, 26);
            ctx.quadraticCurveTo(6, 12, 0, 0);
            ctx.fill();

            // Central vein
            ctx.strokeStyle = '#c8e6c9';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 22);
            ctx.stroke();
            ctx.restore();
          }
          ctx.restore();
        });

        // 5. Hanging Golden-Red Ripe Mangoes
        const treeMangoes = [
          { x: -38 + wind * 0.7, y: -h * 0.48, r: 8.5 },
          { x: -12 + wind * 0.9, y: -h * 0.60, r: 9.5 },
          { x: 26 + wind * 0.8, y: -h * 0.50, r: 9.0 },
          { x: 46 + wind * 0.6, y: -h * 0.62, r: 8.0 }
        ];

        treeMangoes.forEach(m => {
          // Mango stem
          ctx.strokeStyle = '#5d4037';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y - m.r - 8);
          ctx.lineTo(m.x, m.y - m.r);
          ctx.stroke();

          // Mango fruit
          const mg = ctx.createRadialGradient(m.x - 2, m.y - 3, 1, m.x, m.y, m.r);
          mg.addColorStop(0, '#fff59d');
          mg.addColorStop(0.35, '#ffca28');
          mg.addColorStop(0.75, '#ff9800');
          mg.addColorStop(1, '#e53935');
          ctx.fillStyle = mg;

          ctx.beginPath();
          ctx.ellipse(m.x, m.y, m.r * 0.85, m.r * 1.15, 0.25, 0, Math.PI * 2);
          ctx.fill();
        });

        // 6. Interactive / Quest Golden Shimmer (if quest active)
        if (state === 'highlight' || state === 'quest') {
          const shimmer = (Math.sin(animTime * 4) + 1) * 0.5;
          ctx.strokeStyle = `rgba(255, 215, 0, ${0.4 + shimmer * 0.45})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(0, -h * 0.6, w * 0.48, h * 0.38, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Sparkle stars
          for (let sp = 0; sp < 4; sp++) {
            const sx = Math.sin(animTime * 3 + sp * 1.6) * (w * 0.35);
            const sy = -h * 0.45 - Math.cos(animTime * 2.5 + sp * 1.2) * (h * 0.25);
            const sa = 0.5 + Math.sin(animTime * 5 + sp) * 0.5;
            ctx.fillStyle = `rgba(255, 245, 157, ${sa})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      }
    });
  }

  /**
   * Universal draw method.
   * Renders real sprite if available; otherwise uses fallback function.
   */
  draw(ctx, key, x, y, w, h, state = 'default', facing = 1, animTime = 0, ...extraArgs) {
    const asset = this.get(key);
    if (!asset) {
      console.warn(`[AssetRegistry] Asset '${key}' not registered.`);
      return;
    }

    if (asset.loaded && asset.img) {
      ctx.save();
      ctx.translate(x, y);
      if (facing < 0) ctx.scale(-1, 1);
      ctx.drawImage(asset.img, -w / 2, -h, w, h);
      ctx.restore();
    } else if (asset.fallback) {
      asset.fallback(ctx, x, y, w, h, state, facing, animTime, ...extraArgs);
    }
  }
}

export const assetRegistry = new AssetRegistry();
