/**
 * InputManager - Unified Desktop & Mobile Input System
 * PC: WASD/Arrow keys for movement, E/Space to interact (NO on-screen buttons).
 * Mobile: Tactical On-Screen Arrow Buttons (◀ ▶, RUN, INTERACT).
 */

export function isMobileDevice() {
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const isSmallScreen = window.innerWidth <= 1024;
  return isMobileUA || (isCoarse && isSmallScreen);
}

export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;

    // Movement axes [-1 to 1]
    this.axisX = 0;
    this.axisY = 0;

    // Key states
    this.keys = {};
    this.interactPressed = false;
    this.pausePressed = false;
    this.shiftPressed = false;
    this.gulalPressed = false;

    // Mouse state
    this.mouse = {
      x: 0,
      y: 0,
      isDown: false,
      justPressed: false,
      justReleased: false,
      draggedItem: null
    };

    // Mobile vs PC detection
    this.isMobile = isMobileDevice();

    // Mobile Arrow Buttons State
    this.mobileButtons = {
      left: false,
      right: false,
      sprint: false,
      interact: false,
      gulal: false
    };

    // Active touch touchIds mapped to button names
    this.activeTouches = new Map();

    this.setupKeyboard();
    this.setupMouse();
    this.setupTouch();
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Any physical key press on desktop confirms PC mode
      if (!isMobileDevice()) {
        this.isMobile = false;
      }

      this.keys[e.code] = true;
      if (e.code === 'KeyE' || e.code === 'Space') {
        this.interactPressed = true;
      }
      if (e.code === 'Escape') {
        this.pausePressed = true;
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.shiftPressed = true;
      }
      this.updateAxes();
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.shiftPressed = false;
      }
      this.updateAxes();
    });
  }

  updateAxes() {
    let kx = 0;
    let ky = 0;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) kx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) kx += 1;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) ky -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) ky += 1;

    let tx = 0;
    if (this.mobileButtons.left) tx -= 1;
    if (this.mobileButtons.right) tx += 1;

    // Use touch buttons on mobile, otherwise keyboard
    this.axisX = this.isMobile && tx !== 0 ? tx : kx;
    this.axisY = ky;
    this.shiftPressed = Boolean(this.keys['ShiftLeft'] || this.keys['ShiftRight'] || (this.isMobile && this.mobileButtons.sprint));
  }

  getCanvasCoords(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return { x: 0, y: 0 };
    const vw = this.engine ? this.engine.virtualWidth : 1280;
    const vh = this.engine ? this.engine.virtualHeight : 720;
    return {
      x: ((clientX - rect.left) / rect.width) * vw,
      y: ((clientY - rect.top) / rect.height) * vh
    };
  }

  setupMouse() {
    this.canvas.addEventListener('mousedown', (e) => {
      if (!isMobileDevice()) {
        this.isMobile = false;
      }
      const coords = this.getCanvasCoords(e.clientX, e.clientY);
      this.mouse.x = coords.x;
      this.mouse.y = coords.y;
      this.mouse.isDown = true;
      this.mouse.justPressed = true;
    });

    window.addEventListener('mousemove', (e) => {
      const coords = this.getCanvasCoords(e.clientX, e.clientY);
      this.mouse.x = coords.x;
      this.mouse.y = coords.y;
    });

    window.addEventListener('mouseup', () => {
      this.mouse.isDown = false;
      this.mouse.justReleased = true;
      this.mouse.draggedItem = null;
    });
  }

  getButtonScale() {
    const vw = this.engine ? this.engine.virtualWidth : 1280;
    const vh = this.engine ? this.engine.virtualHeight : 720;
    // Scale smoothly adapts based on virtual screen dimensions
    const computed = (vh / 720) * 0.65 + (vw / 1280) * 0.35;
    return Math.max(0.85, Math.min(1.3, computed));
  }

  // Mobile Touch Button Geometry (Dynamic based on screen dimensions & dynamic scale)
  getButtonLayout() {
    const vw = this.engine ? this.engine.virtualWidth : 1280;
    const vh = this.engine ? this.engine.virtualHeight : 720;
    const scale = this.getButtonScale();

    // Dynamic safe bottom & side padding so buttons don't sink down into gestures or bezels
    // Shifted slightly towards the up (bottomPad ~80px on 720p vs previous 52px)
    const bottomPad = Math.max(76, Math.round(vh * 0.115));
    const sidePad = Math.max(55, Math.round(vw * 0.045));

    // D-Pad left & right controlling buttons (slightly far apart from each other: 30px gap vs 14px)
    const dirSize = Math.round(96 * scale);
    const dirGap = Math.round(30 * scale);
    const dirY = vh - bottomPad - dirSize;

    const left = {
      x: sidePad,
      y: dirY,
      w: dirSize,
      h: dirSize
    };

    const right = {
      x: sidePad + dirSize + dirGap,
      y: dirY,
      w: dirSize,
      h: dirSize
    };

    // Action buttons on the right ([ ⚡ RUN ] & [ [E] ACT ])
    // More far apart vertically (34px gap vs previous 16px)
    const actW = Math.round(106 * scale);
    const actH = Math.round(96 * scale);
    const actX = vw - sidePad - actW;
    const actY = dirY; // Align bottom baseline with D-Pad

    const sprintW = actW;
    const sprintH = Math.round(58 * scale);
    const sprintX = actX;
    const rightGap = Math.round(34 * scale); // Distinctly separated vertically
    const sprintY = actY - rightGap - sprintH;

    const sprint = {
      x: sprintX,
      y: sprintY,
      w: sprintW,
      h: sprintH
    };

    // Gulal festival celebrate button (aligned to the left of ACT button)
    const gulalW = Math.round(128 * scale);
    const gulalH = Math.round(54 * scale);
    const gulalGap = Math.round(24 * scale);
    const gulalX = actX - gulalGap - gulalW;
    const gulalY = actY + actH - gulalH;

    return {
      scale,
      left,
      right,
      sprint,
      interact: { x: actX, y: actY, w: actW, h: actH },
      gulal: { x: gulalX, y: gulalY, w: gulalW, h: gulalH }
    };
  }

  hitTest(btn, x, y, padding) {
    const scale = this.getButtonScale();
    const pad = padding !== undefined ? padding : Math.round(16 * scale);
    return (
      x >= btn.x - pad &&
      x <= btn.x + btn.w + pad &&
      y >= btn.y - pad &&
      y <= btn.y + btn.h + pad
    );
  }

  setupTouch() {
    const handleTouch = (e) => {
      e.preventDefault();
      this.isMobile = true;
      const layout = this.getButtonLayout();

      // Reset touch states before re-evaluating active touches
      this.mobileButtons.left = false;
      this.mobileButtons.right = false;
      this.mobileButtons.sprint = false;
      this.mobileButtons.interact = false;
      this.mobileButtons.gulal = false;

      const isUIBlocked = Boolean(this.engine && typeof this.engine.isUIBlocked === 'function' && this.engine.isUIBlocked());

      const touches = e.touches;
      for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const coords = this.getCanvasCoords(touch.clientX, touch.clientY);

        let hitButton = false;
        // Only evaluate on-screen gameplay buttons during normal exploration (never during puzzles/dialogues)
        if (!isUIBlocked) {
          if (this.hitTest(layout.left, coords.x, coords.y)) {
            this.mobileButtons.left = true;
            hitButton = true;
          }
          if (this.hitTest(layout.right, coords.x, coords.y)) {
            this.mobileButtons.right = true;
            hitButton = true;
          }
          if (this.hitTest(layout.sprint, coords.x, coords.y)) {
            this.mobileButtons.sprint = true;
            hitButton = true;
          }
          if (this.hitTest(layout.interact, coords.x, coords.y)) {
            this.mobileButtons.interact = true;
            this.interactPressed = true;
            hitButton = true;
          }
          if (this.hitTest(layout.gulal, coords.x, coords.y)) {
            this.mobileButtons.gulal = true;
            this.gulalPressed = true;
            hitButton = true;
          }
        }

        if (!hitButton) {
          // Normal touch coordinates for UI, menus, puzzles
          this.mouse.x = coords.x;
          this.mouse.y = coords.y;
          this.mouse.isDown = true;
        }
      }

      this.updateAxes();
    };

    const handleTouchStart = (e) => {
      this.isMobile = true;
      const layout = this.getButtonLayout();
      const changed = e.changedTouches;
      const isUIBlocked = Boolean(this.engine && typeof this.engine.isUIBlocked === 'function' && this.engine.isUIBlocked());

      for (let i = 0; i < changed.length; i++) {
        const touch = changed[i];
        const coords = this.getCanvasCoords(touch.clientX, touch.clientY);

        if (!isUIBlocked && this.hitTest(layout.interact, coords.x, coords.y)) {
          this.interactPressed = true;
        } else if (!isUIBlocked && this.hitTest(layout.gulal, coords.x, coords.y)) {
          this.gulalPressed = true;
        } else if (
          isUIBlocked ||
          (!this.hitTest(layout.left, coords.x, coords.y) &&
           !this.hitTest(layout.right, coords.x, coords.y) &&
           !this.hitTest(layout.sprint, coords.x, coords.y))
        ) {
          this.mouse.x = coords.x;
          this.mouse.y = coords.y;
          this.mouse.isDown = true;
          this.mouse.justPressed = true;
        }
      }

      handleTouch(e);
    };

    const handleTouchEnd = (e) => {
      if (e.touches.length === 0) {
        this.mouse.isDown = false;
        this.mouse.justReleased = true;
        this.mouse.draggedItem = null;
      }
      handleTouch(e);
    };

    this.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', handleTouch, { passive: false });
    this.canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    this.canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
  }

  renderTouchControls(ctx) {
    // ON PC: NOTHING IS RENDERED! Only render on mobile devices!
    if (!this.isMobile) return;

    ctx.save();
    const layout = this.getButtonLayout();
    const scale = layout.scale || 1.0;
    const radius = Math.round(18 * scale);
    const iconFont = `bold ${Math.round(34 * scale)}px sans-serif`;
    const labelFont = `bold ${Math.round(15 * scale)}px sans-serif`;
    const defaultLineWidth = Math.max(1.8, Math.round(2.0 * scale * 10) / 10);
    const activeLineWidth = Math.max(2.4, Math.round(2.8 * scale * 10) / 10);

    // Helper to render button with dynamic scale & modern styling
    const drawButton = (btn, label, icon, isPressed, color = '#ffd54f') => {
      ctx.fillStyle = isPressed ? 'rgba(255, 179, 0, 0.75)' : 'rgba(15, 23, 42, 0.78)';
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, radius);
      ctx.fill();

      ctx.strokeStyle = isPressed ? '#ffffff' : color;
      ctx.lineWidth = isPressed ? activeLineWidth : defaultLineWidth;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      if (icon) {
        ctx.font = iconFont;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, btn.x + btn.w / 2, btn.y + btn.h / 2);
      } else if (label) {
        ctx.font = labelFont;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, btn.x + btn.w / 2, btn.y + btn.h / 2);
      }
    };

    // 1. Mobile Left Arrow Button
    drawButton(layout.left, null, '◀', this.mobileButtons.left, '#38bdf8');

    // 2. Mobile Right Arrow Button
    drawButton(layout.right, null, '▶', this.mobileButtons.right, '#38bdf8');

    // 3. Mobile Sprint Button
    drawButton(layout.sprint, '⚡ RUN', null, this.mobileButtons.sprint, '#f59e0b');

    // 4. Mobile Interact Button
    drawButton(layout.interact, 'ACT', null, this.mobileButtons.interact, '#ffd54f');

    ctx.restore();
  }

  postUpdate() {
    this.interactPressed = false;
    this.pausePressed = false;
    this.gulalPressed = false;
    this.mouse.justPressed = false;
    this.mouse.justReleased = false;
  }
}
