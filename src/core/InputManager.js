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
      interact: false
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
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
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

  // Mobile Touch Button Geometry (Canvas coords 1280x720)
  getButtonLayout() {
    return {
      left: { x: 45, y: 565, w: 85, h: 85 },
      right: { x: 155, y: 565, w: 85, h: 85 },
      sprint: { x: 100, y: 480, w: 90, h: 55 },
      interact: { x: 1145, y: 565, w: 90, h: 85 }
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

      const touches = e.touches;
      for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        const coords = this.getCanvasCoords(touch.clientX, touch.clientY);

        let hitButton = false;
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

      for (let i = 0; i < changed.length; i++) {
        const touch = changed[i];
        const coords = this.getCanvasCoords(touch.clientX, touch.clientY);

        if (this.hitTest(layout.interact, coords.x, coords.y)) {
          this.interactPressed = true;
        } else if (
          !this.hitTest(layout.left, coords.x, coords.y) &&
          !this.hitTest(layout.right, coords.x, coords.y) &&
          !this.hitTest(layout.sprint, coords.x, coords.y)
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

    // Helper to render button
    const drawButton = (btn, label, icon, isPressed, color = '#ffd54f') => {
      ctx.fillStyle = isPressed ? 'rgba(255, 179, 0, 0.75)' : 'rgba(15, 23, 42, 0.78)';
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 16);
      ctx.fill();

      ctx.strokeStyle = isPressed ? '#ffffff' : color;
      ctx.lineWidth = isPressed ? 2.5 : 1.8;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      if (icon) {
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, btn.x + btn.w / 2, btn.y + btn.h / 2);
      } else if (label) {
        ctx.font = 'bold 13px sans-serif';
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
    this.mouse.justPressed = false;
    this.mouse.justReleased = false;
  }
}
