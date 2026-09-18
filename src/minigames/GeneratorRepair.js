/**
 * GeneratorRepair - Mission 7 Mini-game
 * 3-step interactive repair sequence:
 * Step 1: Reconnect cable -> Step 2: Activate breaker switch -> Step 3: Pull recoil starter.
 */

import { audioManager } from '../audio/AudioManager.js';

export class GeneratorRepair {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.active = false;
    this.completed = false;
    this.step = 1; // 1: Cable, 2: Switch, 3: Starter Pull
    this.completionTimer = 0;

    // Cable positions
    this.plug = { x: 380, y: 380, origX: 380, origY: 380, connected: false };
    this.socket = { x: 520, y: 380, r: 24 };

    // Switch
    this.switchOn = false;

    // Pull Cord
    this.cordPulled = false;
    this.cordY = 460;
  }

  start() {
    this.active = true;
    this.completed = false;
    this.step = 1;
    this.completionTimer = 0;
    this.plug.connected = false;
    this.plug.x = this.plug.origX;
    this.plug.y = this.plug.origY;
    this.switchOn = false;
    this.cordPulled = false;
  }

  update(dt, input, particles) {
    if (!this.active) return;

    if (this.completed) {
      this.completionTimer += dt;
      if (this.completionTimer > 1.8) {
        this.active = false;
        if (this.onComplete) this.onComplete();
      }
      return;
    }

    const mouse = input.mouse;

    // STEP 1: Reconnect Cable
    if (this.step === 1) {
      if (mouse.isDown) {
        const dist = Math.hypot(mouse.x - this.plug.x, mouse.y - this.plug.y);
        if (dist < 40) {
          this.plug.x = mouse.x;
          this.plug.y = mouse.y;
        }
      }

      if (mouse.justReleased) {
        const distToSocket = Math.hypot(this.plug.x - this.socket.x, this.plug.y - this.socket.y);
        if (distToSocket < 45) {
          this.plug.connected = true;
          this.plug.x = this.socket.x;
          this.plug.y = this.socket.y;
          this.step = 2;
          audioManager.playBell();
          particles.emitSparks(this.socket.x, this.socket.y, 14);
        } else {
          this.plug.x = this.plug.origX;
          this.plug.y = this.plug.origY;
        }
      }
    }
    // STEP 2: Activate Breaker Switch
    else if (this.step === 2) {
      if (mouse.justPressed) {
        // Switch click zone (x: 640, y: 380)
        const dist = Math.hypot(mouse.x - 640, mouse.y - 380);
        if (dist < 36) {
          this.switchOn = true;
          this.step = 3;
          audioManager.playSnap();
          particles.emitSparks(640, 380, 10);
        }
      }
    }
    // STEP 3: Pull Recoil Cord
    else if (this.step === 3) {
      if (mouse.justPressed) {
        // Handle click zone (x: 820, y: 380)
        const dist = Math.hypot(mouse.x - 820, mouse.y - 380);
        if (dist < 40) {
          this.cordPulled = true;
          this.completed = true;
          audioManager.playSuccess();
          particles.emitSparks(820, 380, 20);
          particles.emitDivineAura(640, 380, 25);
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

    // Title
    ctx.fillStyle = '#ffb300';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EMERGENCY GENERATOR REPAIR', 640, 130);

    ctx.fillStyle = '#b0bec5';
    ctx.font = '16px sans-serif';
    ctx.fillText('Step-by-step restoration of backup festival power.', 640, 160);

    // Progress Tabs
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

    // STEP 1 SECTION: Cable & Socket
    ctx.save();
    // Socket
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
    ctx.strokeStyle = '#d50000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(220, 500);
    ctx.quadraticCurveTo(280, 480, this.plug.x, this.plug.y);
    ctx.stroke();

    // Plug Head
    ctx.fillStyle = '#ff5252';
    ctx.beginPath();
    ctx.roundRect(this.plug.x - 16, this.plug.y - 14, 32, 28, 6);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#cfd8dc';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Heavy Cable', 380, 430);
    ctx.restore();

    // STEP 2 SECTION: Breaker Switch
    ctx.save();
    ctx.fillStyle = '#37474f';
    ctx.fillRect(610, 330, 60, 100);
    ctx.strokeStyle = '#78909c';
    ctx.strokeRect(610, 330, 60, 100);

    // Switch toggle
    const toggleY = this.switchOn ? 345 : 385;
    ctx.fillStyle = this.switchOn ? '#00e676' : '#d50000';
    ctx.beginPath();
    ctx.roundRect(620, toggleY, 40, 30, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.switchOn ? 'ON' : 'OFF', 640, toggleY + 18);

    ctx.fillStyle = '#cfd8dc';
    ctx.font = '13px sans-serif';
    ctx.fillText('Power Breaker', 640, 455);
    ctx.restore();

    // STEP 3 SECTION: Recoil Starter Pull Handle
    ctx.save();
    ctx.fillStyle = '#37474f';
    ctx.beginPath();
    ctx.arc(820, 380, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78909c';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Cord handle (T-bar)
    ctx.fillStyle = '#ff6d00';
    ctx.beginPath();
    ctx.roundRect(795, 365, 50, 24, 6);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PULL', 820, 381);

    ctx.fillStyle = '#cfd8dc';
    ctx.font = '13px sans-serif';
    ctx.fillText('Starter Recoil', 820, 455);
    ctx.restore();

    // Completion Banner
    if (this.completed) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 200, 83, 0.95)';
      ctx.beginPath();
      ctx.roundRect(420, 490, 440, 75, 12);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ENGINE FIRING! RESTORING POWER... ⚡', 640, 536);
      ctx.restore();
    }

    ctx.restore();
  }
}
