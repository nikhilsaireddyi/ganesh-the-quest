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

  // Mobile Touch Button Geometry (Dynamic based on virtualWidth & virtualHeight)
  getButtonLayout() {
    const vw = this.engine ? this.engine.virtualWidth : 1280;
    const vh = this.engine ? this.engine.virtualHeight : 720;
    return {
      left: { x: 75, y: vh - 148, w: 96, h: 96 },
      right: { x: 185, y: vh - 148, w: 96, h: 96 },
      sprint: { x: vw - 192, y: vh - 222, w: 106, h: 58 },
      interact: { x: vw - 190, y: vh - 148, w: 102, h: 96 },
      gulal: { x: vw - 340, y: vh - 106, w: 128, h: 54 }
    };
  }

  hitTest(btn, x, y, padding = 15) {
    return (
      x >= btn.x - padding &&
      x <= btn.x + btn.w + padding &&
      y >= btn.y - padding &&
      y <= btn.y + btn.h + padding
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

    // Helper to render button with slightly larger size & modern styling
    const drawButton = (btn, label, icon, isPressed, color = '#ffd54f') => {
      ctx.fillStyle = isPressed ? 'rgba(255, 179, 0, 0.75)' : 'rgba(15, 23, 42, 0.78)';
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 18);
      ctx.fill();

      ctx.strokeStyle = isPressed ? '#ffffff' : color;
      ctx.lineWidth = isPressed ? 2.8 : 2.0;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      if (icon) {
        ctx.font = 'bold 34px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, btn.x + btn.w / 2, btn.y + btn.h / 2);
      } else if (label) {
        ctx.font = 'bold 15px sans-serif';
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
    drawButton(layout.interact, '[E] ACT', null, this.mobileButtons.interact, '#ffd54f');

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
