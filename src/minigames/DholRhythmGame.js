/**
 * DholRhythmGame - Interactive Rhythm Challenge during Grand Procession
 * Play authentic Dhol-Tasha beats (Dhum, Ta, Dha, Tin) to lead the dancing devotees!
 */

import { audioManager } from '../audio/AudioManager.js';

export class DholRhythmGame {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.active = false;
    this.completed = false;

    // 4 Beat Lanes
    this.lanes = [
      { key: 'KeyA', label: 'A', name: 'DHUM', color: '#ff3d00', x: 440 },
      { key: 'KeyS', label: 'S', name: 'TA', color: '#ffd600', x: 560 },
      { key: 'KeyD', label: 'D', name: 'DHA', color: '#ff6d00', x: 680 },
      { key: 'KeyF', label: 'F', name: 'TIN', color: '#00e5ff', x: 800 }
    ];

    this.hitY = 560;
    this.notes = [];
    this.noteSpeed = 260; // px/sec

    this.score = 0;
    this.combo = 0;
    this.feedbackText = '';
    this.feedbackTimer = 0;

    this.totalNotesToSpawn = 24;
    this.notesSpawned = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 0.65;
    this.completionTimer = 0;
  }

  start() {
    this.active = true;
    this.completed = false;
    this.notes = [];
    this.score = 0;
    this.combo = 0;
    this.feedbackText = '';
    this.notesSpawned = 0;
    this.spawnTimer = 0;
    this.completionTimer = 0;
    audioManager.playDholBeat();
  }

  update(dt, input, particles) {
    if (!this.active) return;

    const mouse = input && input.mouse;

    // Close button [X] (x: 805, y: 115 with generous touch padding)
    if (mouse && mouse.justPressed && mouse.x >= 780 && mouse.x <= 860 && mouse.y >= 95 && mouse.y <= 165) {
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

    // Spawn falling notes
    if (this.notesSpawned < this.totalNotesToSpawn) {
      this.spawnTimer += dt;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer = 0;
        const laneIdx = Math.floor(Math.random() * 4);
        this.notes.push({
          lane: laneIdx,
          y: 180,
          hit: false,
          missed: false
        });
        this.notesSpawned++;
      }
    }

    // Update note positions
    for (const note of this.notes) {
      if (!note.hit && !note.missed) {
        note.y += this.noteSpeed * dt;
        if (note.y > this.hitY + 50) {
          note.missed = true;
          this.combo = 0;
          this.feedbackText = 'MISS';
          this.feedbackTimer = 0.5;
        }
      }
    }

    // Feedback timer
    if (this.feedbackTimer > 0) {
      this.feedbackTimer -= dt;
    }

    // Lane hit inputs
    this.lanes.forEach((lane, idx) => {
      const keyTriggered = input.keys[lane.key] || false;
      const mouseTriggered = mouse.justPressed && Math.abs(mouse.x - lane.x) < 45 && Math.abs(mouse.y - this.hitY) < 55;

      if (keyTriggered || mouseTriggered) {
        // Reset key state so single press counts
        input.keys[lane.key] = false;

        // Check closest note in this lane
        let closest = null;
        let minDist = 999;
        for (const note of this.notes) {
          if (note.lane === idx && !note.hit && !note.missed) {
            const dist = Math.abs(note.y - this.hitY);
            if (dist < minDist) {
              minDist = dist;
              closest = note;
            }
          }
        }

        if (closest && minDist < 65) {
          closest.hit = true;
          this.combo++;
          audioManager.playDholBeat();

          if (minDist < 25) {
            this.score += 100 * this.combo;
            this.feedbackText = 'PERFECT! ★';
          } else {
            this.score += 50 * this.combo;
            this.feedbackText = 'GREAT! ♪';
          }
          this.feedbackTimer = 0.5;

          // Emit gulal colored powder particles
          particles.emitPetals(lane.x, this.hitY, 8);
          particles.emitSparks(lane.x, this.hitY, 6);
        }
      }
    });

    // Check completion
    const allProcessed = this.notesSpawned >= this.totalNotesToSpawn && this.notes.every(n => n.hit || n.missed);
    if (allProcessed && !this.completed) {
      this.completed = true;
      audioManager.playSuccess();
      audioManager.playChantMorya();
      particles.emitDivineAura(640, 360, 40);
    }
  }

  render(ctx) {
    if (!this.active) return;

    ctx.save();
    // Darkened rhythmic stage backdrop
    ctx.fillStyle = 'rgba(10, 14, 26, 0.88)';
    ctx.fillRect(0, 0, 1280, 720);

    // Rhythm Track Board
    const trackX = 380;
    const trackW = 480;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.beginPath();
    ctx.roundRect(trackX, 100, trackW, 540, 16);
    ctx.fill();
    ctx.strokeStyle = '#ff8f00';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Close Button [X]
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(trackX + trackW - 55, 115, 40, 36, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✕', trackX + trackW - 35, 139);

    // Title & Instructions
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🥁 DHOL-TASHA RHYTHM CHALLENGE', 640, 140);

    ctx.fillStyle = '#e0e0e0';
    ctx.font = '14px sans-serif';
    ctx.fillText('Tap A, S, D, F or Click the drum pads in time with the falling beats!', 640, 168);

    // Render Lane Dividers
    this.lanes.forEach((lane, i) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lane.x - 50, 180);
      ctx.lineTo(lane.x - 50, 620);
      ctx.stroke();
    });

    // Golden Hit Target Line
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(trackX + 20, this.hitY);
    ctx.lineTo(trackX + trackW - 20, this.hitY);
    ctx.stroke();

    // Drum Pad Targets at Bottom
    this.lanes.forEach(lane => {
      ctx.save();
      ctx.fillStyle = lane.color;
      ctx.beginPath();
      ctx.arc(lane.x, this.hitY, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lane.label, lane.x, this.hitY - 6);

      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(lane.name, lane.x, this.hitY + 12);
      ctx.restore();
    });

    // Falling Notes
    for (const note of this.notes) {
      if (!note.hit && !note.missed) {
        const lane = this.lanes[note.lane];
        ctx.save();
        ctx.fillStyle = lane.color;
        ctx.beginPath();
        ctx.arc(lane.x, note.y, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffd54f';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♪', lane.x, note.y);
        ctx.restore();
      }
    }

    // Feedback Rating (PERFECT, GREAT, MISS)
    if (this.feedbackTimer > 0) {
      ctx.save();
      ctx.fillStyle = this.feedbackText.includes('PERFECT') ? '#ffd700' : (this.feedbackText.includes('GREAT') ? '#00e676' : '#f44336');
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.feedbackText, 640, 480);
      ctx.restore();
    }

    // Score & Combo HUD
    ctx.fillStyle = '#ffd54f';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${this.score}`, trackX + 30, 215);

    ctx.textAlign = 'right';
    ctx.fillText(`COMBO: ${this.combo}x`, trackX + trackW - 30, 215);

    // Completion Banner
    if (this.completed) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 200, 83, 0.95)';
      const line1 = 'PROCESSION RHYTHM TRIUMPH! 🥁✨';
      const line2 = `Final Score: ${this.score} | Bappa is Pleased!`;
      ctx.font = 'bold 24px sans-serif';
      const w1 = ctx.measureText(line1).width;
      ctx.font = 'bold 15px sans-serif';
      const w2 = ctx.measureText(line2).width;
      const boxW = Math.max(580, Math.max(w1, w2) + 100);
      const boxX = 640 - boxW / 2;

      ctx.beginPath();
      ctx.roundRect(boxX, 305, boxW, 95, 16);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(line1, 640, 345);

      ctx.fillStyle = '#ffecb3';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(line2, 640, 377);
      ctx.restore();
    }

    ctx.restore();
  }
}
