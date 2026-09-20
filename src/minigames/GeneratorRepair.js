/**
 * GeneratorRepair - Mission 7 Mini-game
 * Fully randomized interactive repair sequence:
 * - Dynamic layout: Cable bay, Power Breaker, and Starter Recoil are randomly positioned on every game.
 * - Dynamic heavy cable types: Random industrial color themes and ratings.
 * - Dynamic starter recoil pulls: 1 or 2 rhythmic engine starter pulls.
 * - Active step illumination: Auric pulsing glow highlights the active objective component.
 */

import { audioManager } from '../audio/AudioManager.js';

const CABLE_TYPES = [
  { name: '220V Main Cable', wire: '#d50000', plug: '#ff5252' },
  { name: 'Backup Feed Line', wire: '#0288d1', plug: '#40c4ff' },
  { name: 'Generator Busbar', wire: '#fbc02d', plug: '#ffee58' },
  { name: 'Ground Earth Wire', wire: '#2e7d32', plug: '#69f0ae' },
  { name: 'Auxiliary Dyno Line', wire: '#e65100', plug: '#ff9800' }
];

export class GeneratorRepair {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.active = false;
    this.completed = false;
    this.step = 1; // 1: Cable, 2: Switch, 3: Starter Pull
    this.completionTimer = 0;
    this.animTime = 0;

    // Component Positions (randomized on each start)
    this.plug = { x: 340, y: 380, origX: 340, origY: 380, connected: false };
    this.socket = { x: 440, y: 380, r: 24 };
    this.cableRoot = { x: 220, y: 520 };
    this.cableType = CABLE_TYPES[0];

    this.breaker = { x: 640, y: 380 };
    this.switchOn = false;

    this.recoil = { x: 940, y: 380 };
    this.pullsNeeded = 1;
    this.pullsDone = 0;
    this.cordPulled = false;
    this.handleShake = 0;
  }

  randomizeLayout() {
    // 3 Bays across panel (panel width 920 from x: 180 to 1100)
    const bays = [340, 640, 940];
    // Randomly shuffle bay assignments
    const shuffledBays = [...bays].sort(() => Math.random() - 0.5);

    // 1. Cable & Socket in shuffledBays[0]
    const cableBayX = shuffledBays[0];
    const cableBayY = 380 + (Math.random() - 0.5) * 35;
    this.socket = {
      x: cableBayX + 55 + (Math.random() - 0.5) * 16,
      y: cableBayY + (Math.random() - 0.5) * 16,
      r: 24
    };
    const plugX = cableBayX - 70 + (Math.random() - 0.5) * 20;
    const plugY = cableBayY + (Math.random() - 0.5) * 20;
    this.plug = {
      x: plugX,
      y: plugY,
      origX: plugX,
      origY: plugY,
      connected: false
    };
    this.cableRoot = {
      x: cableBayX - 115,
      y: 520 + (Math.random() - 0.5) * 20
    };
    this.cableType = CABLE_TYPES[Math.floor(Math.random() * CABLE_TYPES.length)];

    // 2. Breaker Switch in shuffledBays[1]
    this.breaker = {
      x: shuffledBays[1] + (Math.random() - 0.5) * 25,
      y: 380 + (Math.random() - 0.5) * 35
    };
    this.switchOn = false;

    // 3. Starter Recoil in shuffledBays[2]
    this.recoil = {
      x: shuffledBays[2] + (Math.random() - 0.5) * 25,
      y: 380 + (Math.random() - 0.5) * 35
    };
    this.pullsNeeded = Math.floor(Math.random() * 2) + 1; // 1 or 2 pulls
    this.pullsDone = 0;
    this.cordPulled = false;
    this.handleShake = 0;
  }

  start() {
    this.active = true;
    this.completed = false;
    this.step = 1;
    this.completionTimer = 0;
    this.animTime = 0;
    this.randomizeLayout();
  }

  update(dt, input, particles) {
    if (!this.active) return;
    this.animTime += dt;

    if (this.handleShake > 0) {
      this.handleShake = Math.max(0, this.handleShake - dt * 6);
    }

    const mouse = input && input.mouse;

    // Close button [X] (x: 1045, y: 95 with generous touch padding)
    if (mouse && mouse.justPressed && mouse.x >= 1020 && mouse.x <= 1100 && mouse.y >= 75 && mouse.y <= 145) {
      this.active = false;
      audioManager.playSnap();
      mouse.justPressed = false;
      if (this.completed && this.onComplete) {
        this.onComplete();
      }
      return;
    }

    if (this.completed) {
      this.completionTimer += dt;
      if (this.completionTimer > 1.2 || (mouse && mouse.justPressed) || (input && input.interactPressed)) {
        if (mouse) mouse.justPressed = false;
        if (input) input.interactPressed = false;
        this.active = false;
        if (this.onComplete) this.onComplete();
      }
      return;
    }

    // STEP 1: Reconnect Cable
    if (this.step === 1) {
      if (mouse.isDown) {
        const dist = Math.hypot(mouse.x - this.plug.x, mouse.y - this.plug.y);
        if (dist < 45) {
          this.plug.x = mouse.x;
          this.plug.y = mouse.y;
        }
      }

      if (mouse.justReleased) {
        const distToSocket = Math.hypot(this.plug.x - this.socket.x, this.plug.y - this.socket.y);
        if (distToSocket < 50) {
          this.plug.connected = true;
          this.plug.x = this.socket.x;
          this.plug.y = this.socket.y;
          this.step = 2;
          audioManager.playPickup(1);
          particles.emitSparks(this.socket.x, this.socket.y, 16);
        } else {
          this.plug.x = this.plug.origX;
          this.plug.y = this.plug.origY;
        }
      }
    }
    // STEP 2: Activate Breaker Switch
    else if (this.step === 2) {
      if (mouse.justPressed) {
        const dist = Math.hypot(mouse.x - this.breaker.x, mouse.y - this.breaker.y);
        if (dist < 42) {
          this.switchOn = true;
          this.step = 3;
          audioManager.playSnap();
          particles.emitSparks(this.breaker.x, this.breaker.y, 14);
        }
      }
    }
    // STEP 3: Pull Recoil Cord
    else if (this.step === 3) {
      if (mouse.justPressed) {
        const dist = Math.hypot(mouse.x - this.recoil.x, mouse.y - this.recoil.y);
        if (dist < 48) {
          this.pullsDone++;
          this.handleShake = 1.0;

          if (this.pullsDone < this.pullsNeeded) {
            // Sputter pull
            audioManager.playSnap();
            audioManager.playSpark();
            particles.emitSparks(this.recoil.x, this.recoil.y, 12);
            particles.emitCollapseDust(this.recoil.x, this.recoil.y, 10);
          } else {
            // Engine ignition!
            this.cordPulled = true;
            this.completed = true;
            audioManager.playSuccess();
            particles.emitSparks(this.recoil.x, this.recoil.y, 25);
            particles.emitDivineAura(this.recoil.x, this.recoil.y, 25);
          }
        }
      }
    }
  }

  render(ctx) {
    if (!this.active) return;

    ctx.save();
    // Modal background
    ctx.fillStyle = 'rgba(10, 14, 26, 0.9)';
    ctx.fillRect(0, 0, 1280, 720);

    // Industrial Generator Interface Panel
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.roundRect(180, 80, 920, 560, 16);
    ctx.fill();
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Close Button [X]
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(1045, 95, 40, 36, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✕', 1065, 119);

    // Title
    ctx.fillStyle = '#ffb300';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EMERGENCY GENERATOR REPAIR', 640, 130);

    ctx.fillStyle = '#b0bec5';
    ctx.font = '16px sans-serif';
    ctx.fillText('Step-by-step restoration of backup festival power.', 640, 160);

    // Progress Tabs at top
    const steps = [
      { num: 1, title: '1. Reconnect Cable', active: this.step === 1, done: this.step > 1 },
      { num: 2, title: '2. Flip Breaker', active: this.step === 2, done: this.step > 2 },
      { num: 3, title: '3. Pull Starter Cord', active: this.step === 3, done: this.completed }
    ];

    steps.forEach((s, idx) => {
      const bx = 320 + idx * 220;
      ctx.fillStyle = s.done ? '#00c853' : (s.active ? '#ff8f00' : '#37474f');
      ctx.beginPath();
      ctx.roundRect(bx - 95, 190, 190, 42, 8);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.title, bx, 216);
    });

    const glowPulse = Math.sin(this.animTime * 6) * 5;

    // --- COMPONENT 1: CABLE & SOCKET ---
    ctx.save();
    // Highlight ring if active
    if (this.step === 1) {
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(this.socket.x, this.socket.y, 42 + glowPulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Socket Housing
    ctx.fillStyle = '#102027';
    ctx.beginPath();
    ctx.arc(this.socket.x, this.socket.y, this.socket.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.plug.connected ? '#00e676' : '#ffd54f';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Socket pin holes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(this.socket.x - 8, this.socket.y, 4, 0, Math.PI * 2);
    ctx.arc(this.socket.x + 8, this.socket.y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Heavy Wire leading to plug
    ctx.strokeStyle = this.cableType.wire;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(this.cableRoot.x, this.cableRoot.y);
    ctx.quadraticCurveTo(
      (this.cableRoot.x + this.plug.x) / 2,
      Math.max(this.cableRoot.y, this.plug.y) + 15,
      this.plug.x,
      this.plug.y
    );
    ctx.stroke();

    // Plug Head
    ctx.fillStyle = this.cableType.plug;
    ctx.beginPath();
    ctx.roundRect(this.plug.x - 16, this.plug.y - 14, 32, 28, 6);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#cfd8dc';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.cableType.name, (this.socket.x + this.plug.origX) / 2, Math.max(this.socket.y, this.plug.origY) + 50);
    ctx.restore();

    // --- COMPONENT 2: POWER BREAKER SWITCH ---
    ctx.save();
    // Highlight ring if active
    if (this.step === 2) {
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(this.breaker.x - 38 - glowPulse, this.breaker.y - 58 - glowPulse, 76 + glowPulse * 2, 116 + glowPulse * 2);
    }

    ctx.fillStyle = '#37474f';
    ctx.fillRect(this.breaker.x - 30, this.breaker.y - 50, 60, 100);
    ctx.strokeStyle = '#78909c';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(this.breaker.x - 30, this.breaker.y - 50, 60, 100);

    // Switch toggle
    const toggleY = this.switchOn ? this.breaker.y - 35 : this.breaker.y + 5;
    ctx.fillStyle = this.switchOn ? '#00e676' : '#d50000';
    ctx.beginPath();
    ctx.roundRect(this.breaker.x - 20, toggleY, 40, 30, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.switchOn ? 'ON' : 'OFF', this.breaker.x, toggleY + 19);

    ctx.fillStyle = '#cfd8dc';
    ctx.font = '13px sans-serif';
    ctx.fillText('Power Breaker', this.breaker.x, this.breaker.y + 70);
    ctx.restore();

    // --- COMPONENT 3: RECOIL STARTER PULL HANDLE ---
    ctx.save();
    const shakeOffsetX = this.handleShake > 0 ? (Math.random() - 0.5) * 8 * this.handleShake : 0;
    const recoilX = this.recoil.x + shakeOffsetX;
    const recoilY = this.recoil.y;

    // Highlight ring if active
    if (this.step === 3 && !this.completed) {
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(recoilX, recoilY, 52 + glowPulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = '#37474f';
    ctx.beginPath();
    ctx.arc(recoilX, recoilY, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78909c';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Cord handle (T-bar)
    ctx.fillStyle = this.completed ? '#00c853' : '#ff6d00';
    ctx.beginPath();
    ctx.roundRect(recoilX - 30, recoilY - 14, 60, 28, 6);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    const pullLabel = this.completed
      ? 'READY'
      : (this.pullsNeeded > 1 ? `PULL (${this.pullsDone}/${this.pullsNeeded})` : 'PULL');
    ctx.fillText(pullLabel, recoilX, recoilY + 4);

    ctx.fillStyle = '#cfd8dc';
    ctx.font = '13px sans-serif';
    ctx.fillText('Starter Recoil', recoilX, recoilY + 70);
    ctx.restore();

    // Completion Banner
    if (this.completed) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 200, 83, 0.95)';
      ctx.font = 'bold 22px sans-serif';
      const text = 'ENGINE FIRING! RESTORING POWER... ⚡';
      const textMetrics = ctx.measureText(text);
      const boxW = Math.max(580, textMetrics.width + 100);
      const boxX = 640 - boxW / 2;

      ctx.beginPath();
      ctx.roundRect(boxX, 485, boxW, 82, 14);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(text, 640, 535);
      ctx.restore();
    }

    ctx.restore();
  }
}
