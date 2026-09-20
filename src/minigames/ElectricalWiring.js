/**
 * ElectricalWiring - Mission 4 Mini-game
 * Connect matching colored electrical terminals from Power Source to Mandapam Lights.
 */

import { audioManager } from '../audio/AudioManager.js';

export class ElectricalWiring {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.active = false;
    this.completed = false;
    this.completionTimer = 0;

    // Left Terminals (Power Distribution)
    this.leftTerminals = [
      { id: 'red', color: '#ff1744', name: 'Main Phase', x: 340, y: 240, r: 16, connectedTo: null },
      { id: 'blue', color: '#2979ff', name: 'Canopy Circuit', x: 340, y: 330, r: 16, connectedTo: null },
      { id: 'yellow', color: '#ffea00', name: 'Arch Bulbs', x: 340, y: 420, r: 16, connectedTo: null },
      { id: 'green', color: '#00e676', name: 'Ground Earth', x: 340, y: 510, r: 16, connectedTo: null }
    ];

    // Right Terminals (Mandapam Fixtures - shuffled order for puzzle)
    this.rightTerminals = [
      { id: 'blue', color: '#2979ff', name: 'Canopy Fixture', x: 940, y: 240, r: 16, powered: false },
      { id: 'yellow', color: '#ffea00', name: 'Arch Light Grid', x: 940, y: 330, r: 16, powered: false },
      { id: 'green', color: '#00e676', name: 'Ground Earth Stake', x: 940, y: 420, r: 16, powered: false },
      { id: 'red', color: '#ff1744', name: 'Main Pandal Bus', x: 940, y: 510, r: 16, powered: false }
    ];

    this.activeDrag = null;
    this.dragPos = { x: 0, y: 0 };

    this.randomizeTerminals();
  }

  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  randomizeTerminals() {
    const ys = [240, 330, 420, 510];

    // 1. Fully randomize Left Terminal positions with Fisher-Yates
    const leftYs = this.shuffle(ys);
    this.leftTerminals.forEach((lt, idx) => {
      lt.y = leftYs[idx];
      lt.connectedTo = null;
    });

    // 2. Fully randomize Right Terminal positions with Fisher-Yates
    // Ensure puzzle has engaging cross-over wires rather than straight horizontal lines
    let rightYs;
    let attempts = 0;
    do {
      rightYs = this.shuffle(ys);
      attempts++;
      let straightWires = 0;
      this.leftTerminals.forEach(lt => {
        const rt = this.rightTerminals.find(r => r.id === lt.id);
        const rIndex = this.rightTerminals.indexOf(rt);
        if (rightYs[rIndex] === lt.y) {
          straightWires++;
        }
      });
      if (straightWires <= 1 || attempts > 20) break;
    } while (attempts < 25);

    this.rightTerminals.forEach((rt, idx) => {
      rt.y = rightYs[idx];
      rt.powered = false;
    });
  }

  start() {
    this.active = true;
    this.completed = false;
    this.completionTimer = 0;
    this.activeDrag = null;
    this.randomizeTerminals();
  }

  update(dt, input, particles) {
    if (!this.active) return;

    const mouse = input && input.mouse;

    // Close button [X] (x: 1065, y: 75 with generous touch padding)
    if (mouse && mouse.justPressed && mouse.x >= 1040 && mouse.x <= 1120 && mouse.y >= 55 && mouse.y <= 125) {
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

    // Start dragging from left terminal
    if (mouse.justPressed) {
      for (const lt of this.leftTerminals) {
        if (!lt.connectedTo) {
          const dist = Math.hypot(mouse.x - lt.x, mouse.y - lt.y);
          if (dist < lt.r + 14) {
            this.activeDrag = lt;
            this.dragPos = { x: mouse.x, y: mouse.y };
            audioManager.playPickup();
            break;
          }
        }
      }
    }

    if (this.activeDrag && mouse.isDown) {
      this.dragPos.x = mouse.x;
      this.dragPos.y = mouse.y;
    }

    if (this.activeDrag && mouse.justReleased) {
      let matched = false;

      // Check drop on right terminal
      for (const rt of this.rightTerminals) {
        const dist = Math.hypot(this.dragPos.x - rt.x, this.dragPos.y - rt.y);
        if (dist < rt.r + 20) {
          if (rt.id === this.activeDrag.id && !rt.powered) {
            // Correct connection!
            this.activeDrag.connectedTo = rt;
            rt.powered = true;
            matched = true;
            const connectedCount = this.rightTerminals.filter(r => r.powered).length;
            audioManager.playPickup(connectedCount);
            particles.emitSparks(rt.x, rt.y, 16);
          } else {
            // Error mismatch
            audioManager.playSpark();
            particles.emitSparks(this.dragPos.x, this.dragPos.y, 10);
          }
          break;
        }
      }

      this.activeDrag = null;

      // Check all connected
      if (this.rightTerminals.every(r => r.powered)) {
        this.completed = true;
        audioManager.playSuccess();
        particles.emitDivineAura(640, 360, 30);
      }
    }
  }

  render(ctx) {
    if (!this.active) return;

    ctx.save();
    // Dark Circuit Board Overlay
    ctx.fillStyle = 'rgba(10, 14, 26, 0.9)';
    ctx.fillRect(0, 0, 1280, 720);

    // Panel
    ctx.fillStyle = '#1c2331';
    ctx.beginPath();
    ctx.roundRect(160, 60, 960, 600, 16);
    ctx.fill();
    ctx.strokeStyle = '#ffd600';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Close Button [X]
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(1065, 75, 40, 36, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✕', 1085, 99);

    // Header
    ctx.fillStyle = '#ffd600';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ELECTRICAL WIRING SYSTEM', 640, 110);

    ctx.fillStyle = '#cfd8dc';
    ctx.font = '16px sans-serif';
    ctx.fillText('Connect matching colored wires from Power Distribution (Left) to the Mandapam Fixtures (Right).', 640, 140);

    // Draw completed wires
    this.leftTerminals.forEach(lt => {
      if (lt.connectedTo) {
        ctx.strokeStyle = lt.color;
        ctx.lineWidth = 6;
        ctx.shadowColor = lt.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(lt.x, lt.y);
        ctx.bezierCurveTo(
          lt.x + 200, lt.y,
          lt.connectedTo.x - 200, lt.connectedTo.y,
          lt.connectedTo.x, lt.connectedTo.y
        );
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });

    // Draw active dragging wire
    if (this.activeDrag) {
      ctx.strokeStyle = this.activeDrag.color;
      ctx.lineWidth = 5;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(this.activeDrag.x, this.activeDrag.y);
      ctx.bezierCurveTo(
        this.activeDrag.x + 120, this.activeDrag.y,
        this.dragPos.x - 120, this.dragPos.y,
        this.dragPos.x, this.dragPos.y
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Left Terminals
    this.leftTerminals.forEach(lt => {
      ctx.save();
      ctx.fillStyle = lt.color;
      ctx.beginPath();
      ctx.arc(lt.x, lt.y, lt.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(lt.name, lt.x - 25, lt.y + 5);
      ctx.restore();
    });

    // Draw Right Terminals
    this.rightTerminals.forEach(rt => {
      ctx.save();
      ctx.fillStyle = rt.powered ? rt.color : '#37474f';
      ctx.beginPath();
      ctx.arc(rt.x, rt.y, rt.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = rt.powered ? '#ffffff' : '#78909c';
      ctx.lineWidth = 3;
      ctx.stroke();

      if (rt.powered) {
        ctx.fillStyle = rt.color;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(rt.x, rt.y, rt.r + 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(rt.name, rt.x + 25, rt.y + 5);
      ctx.restore();
    });

    // Completion Banner
    if (this.completed) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 200, 83, 0.95)';
      ctx.font = 'bold 24px sans-serif';
      const text = 'CIRCUITS READY FOR ILLUMINATION! ⚡';
      const textMetrics = ctx.measureText(text);
      const boxW = Math.max(620, textMetrics.width + 100);
      const boxX = 640 - boxW / 2;

      ctx.beginPath();
      ctx.roundRect(boxX, 305, boxW, 88, 14);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(text, 640, 358);
      ctx.restore();
    }

    ctx.restore();
  }
}
