/**
 * AchievementSystem - Festival Milestones & Badges
 * Tracks unlockable cultural achievements, plays haptic feedback,
 * and displays glowing toast notifications and an inspectable modal.
 */

import { audioManager } from '../audio/AudioManager.js';

export class AchievementSystem {
  constructor() {
    this.badges = {
      master_artisan: {
        id: 'master_artisan',
        icon: '🎋',
        title: 'Master Artisan',
        desc: 'Assembled the sacred bamboo mandapam structure.',
        unlocked: false
      },
      flower_weaver: {
        id: 'flower_weaver',
        icon: '🌺',
        title: 'Garland Weaver',
        desc: 'Strung fresh marigolds & lotus garlands for the pandal.',
        unlocked: false
      },
      chef_of_bappa: {
        id: 'chef_of_bappa',
        icon: '🥟',
        title: 'Chef of Bappa',
        desc: 'Handcrafted 21-pleat steamed modaks with Ananya.',
        unlocked: false
      },
      street_illuminator: {
        id: 'street_illuminator',
        icon: '⚡',
        title: 'Street Illuminator',
        desc: 'Reconnected electrical wiring to light up the pandal.',
        unlocked: false
      },
      storm_guardian: {
        id: 'storm_guardian',
        icon: '⛈️',
        title: 'Storm Guardian',
        desc: 'Protected the mandapam from the sudden squall.',
        unlocked: false
      },
      divine_pujari: {
        id: 'divine_pujari',
        icon: '🪔',
        title: 'Divine Pujari',
        desc: 'Performed the sacred Maha Aarti pradakshina.',
        unlocked: false
      },
      procession_maestro: {
        id: 'procession_maestro',
        icon: '🥁',
        title: 'Procession Maestro',
        desc: 'Danced to the joyous Lezim & Dhol beats.',
        unlocked: false
      },
      gulal_spirit: {
        id: 'gulal_spirit',
        icon: '🎨',
        title: 'Gulal Spirit',
        desc: 'Showered the festival skies with vibrant Gulal colors.',
        unlocked: false
      }
    };

    this.activeToasts = []; // list of active toast objects { title, icon, timer, maxTime }
    this.showModal = false;

    this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem('ganesh_quest_badges');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(k => {
          if (this.badges[k]) {
            this.badges[k].unlocked = parsed[k];
          }
        });
      }
    } catch (_) {}
  }

  save() {
    try {
      const data = {};
      Object.keys(this.badges).forEach(k => {
        data[k] = this.badges[k].unlocked;
      });
      localStorage.setItem('ganesh_quest_badges', JSON.stringify(data));
    } catch (_) {}
  }

  unlock(id) {
    const badge = this.badges[id];
    if (!badge || badge.unlocked) return;

    badge.unlocked = true;
    this.save();

    audioManager.playSuccess();
    audioManager.vibrate([50, 70, 90]);

    this.activeToasts.push({
      title: badge.title,
      icon: badge.icon,
      timer: 4.0,
      maxTime: 4.0
    });
  }

  update(dt, input) {
    // Update toast timers
    for (let i = this.activeToasts.length - 1; i >= 0; i--) {
      this.activeToasts[i].timer -= dt;
      if (this.activeToasts[i].timer <= 0) {
        this.activeToasts.splice(i, 1);
      }
    }

    if (this.showModal && input) {
      if (input.interactPressed || (input.mouse.justPressed && (input.mouse.x > 980 || input.mouse.x < 300 || input.mouse.y < 90 || input.mouse.y > 630))) {
        this.showModal = false;
        input.interactPressed = false;
        if (input.mouse) input.mouse.justPressed = false;
      }
    }
  }

  renderToasts(ctx) {
    if (this.activeToasts.length === 0) return;

    ctx.save();
    this.activeToasts.forEach((toast, idx) => {
      const y = 80 + idx * 72;
      const progress = toast.timer / toast.maxTime;
      const alpha = progress < 0.2 ? progress / 0.2 : 1.0;

      ctx.globalAlpha = alpha;

      // Glow backing
      ctx.fillStyle = 'rgba(10, 14, 26, 0.92)';
      ctx.beginPath();
      ctx.roundRect(460, y, 360, 60, 12);
      ctx.fill();

      // Gold border
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Badge Icon
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(toast.icon, 495, y + 30);

      // Subtitle
      ctx.fillStyle = '#ffd54f';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🏆 BADGE UNLOCKED', 530, y + 20);

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(toast.title, 530, y + 42);
    });
    ctx.restore();
  }

  renderModal(ctx) {
    if (!this.showModal) return;

    ctx.save();
    // Backdrop
    ctx.fillStyle = 'rgba(5, 8, 18, 0.85)';
    ctx.fillRect(0, 0, 1280, 720);

    // Modal Frame
    const mx = 290;
    const my = 80;
    const mw = 700;
    const mh = 560;

    ctx.fillStyle = '#101726';
    ctx.beginPath();
    ctx.roundRect(mx, my, mw, mh, 16);
    ctx.fill();

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 FESTIVAL ACHIEVEMENTS', 640, my + 44);

    ctx.fillStyle = '#ffd54f';
    ctx.font = 'italic 14px sans-serif';
    const unlockedCount = Object.values(this.badges).filter(b => b.unlocked).length;
    ctx.fillText(`${unlockedCount} of 8 Badges Unlocked`, 640, my + 70);

    // Badge Grid (2 columns x 4 rows)
    const badgeList = Object.values(this.badges);
    badgeList.forEach((b, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bx = mx + 30 + col * 325;
      const by = my + 95 + row * 98;

      ctx.fillStyle = b.unlocked ? '#1a2638' : '#141a24';
      ctx.beginPath();
      ctx.roundRect(bx, by, 315, 84, 10);
      ctx.fill();

      ctx.strokeStyle = b.unlocked ? '#ffd700' : '#37474f';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Icon
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (b.unlocked) {
        ctx.fillText(b.icon, bx + 38, by + 42);
      } else {
        ctx.fillStyle = '#78909c';
        ctx.fillText('🔒', bx + 38, by + 42);
      }

      // Title
      ctx.textAlign = 'left';
      ctx.fillStyle = b.unlocked ? '#ffd54f' : '#90a4ae';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(b.title, bx + 75, by + 28);

      // Description
      ctx.fillStyle = b.unlocked ? '#cfd8dc' : '#546e7a';
      ctx.font = '12px sans-serif';
      ctx.fillText(b.desc, bx + 75, by + 52);
    });

    // Close Button prompt
    ctx.fillStyle = '#ffb300';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Click anywhere outside or press [E] to Close', 640, my + mh - 20);

    ctx.restore();
  }
}

export const achievementSystem = new AchievementSystem();
