/**
 * InputManager - Unified Desktop & Mobile Input System
 * Supports WASD/Arrow keys, Mouse clicks & drags,
 * and Mobile Touch (Virtual Joystick + Action Button).
 */

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

    // Mobile / Touch state
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.joystick = {
      active: false,
      touchId: null,
      baseX: 0,
      baseY: 0,
      stickX: 0,
      stickY: 0,
      radius: 50
    };

    this.actionButtonTouchId = null;

    this.setupKeyboard();
    this.setupMouse();
    this.setupTouch();
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
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
      this.updateKeyboardAxes();
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.shiftPressed = false;
      }
      this.updateKeyboardAxes();
    });
  }

  updateKeyboardAxes() {
    let x = 0;
    let y = 0;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) x -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) y -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) y += 1;

    // Only override axes from keyboard if joystick is not active
    if (!this.joystick.active) {
      this.axisX = x;
      this.axisY = y;
    }
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

  setupTouch() {
    const handleTouchStart = (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const rect = this.canvas.getBoundingClientRect();
        const screenX = touch.clientX - rect.left;
        const screenY = touch.clientY - rect.top;

        // Virtual joystick left half of screen
        if (screenX < rect.width * 0.45 && !this.joystick.active) {
          this.joystick.active = true;
          this.joystick.touchId = touch.identifier;
          this.joystick.baseX = screenX;
          this.joystick.baseY = screenY;
          this.joystick.stickX = screenX;
          this.joystick.stickY = screenY;
        } else if (screenX > rect.width * 0.75 && screenY > rect.height * 0.6) {
          // Action button area bottom right
          this.interactPressed = true;
          this.actionButtonTouchId = touch.identifier;
        } else {
          // General touch interaction (puzzles / minigames)
          const coords = this.getCanvasCoords(touch.clientX, touch.clientY);
          this.mouse.x = coords.x;
          this.mouse.y = coords.y;
          this.mouse.isDown = true;
          this.mouse.justPressed = true;
        }
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.joystick.touchId) {
          const rect = this.canvas.getBoundingClientRect();
          const curX = touch.clientX - rect.left;
          const curY = touch.clientY - rect.top;
          const dx = curX - this.joystick.baseX;
          const dy = curY - this.joystick.baseY;
          const dist = Math.hypot(dx, dy);

          const maxR = this.joystick.radius;
          const clampedDist = Math.min(dist, maxR);
          const angle = Math.atan2(dy, dx);

          this.joystick.stickX = this.joystick.baseX + Math.cos(angle) * clampedDist;
          this.joystick.stickY = this.joystick.baseY + Math.sin(angle) * clampedDist;

          this.axisX = (clampedDist / maxR) * Math.cos(angle);
          this.axisY = (clampedDist / maxR) * Math.sin(angle);
        } else {
          const coords = this.getCanvasCoords(touch.clientX, touch.clientY);
          this.mouse.x = coords.x;
          this.mouse.y = coords.y;
        }
      }
    };

    const handleTouchEnd = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.joystick.touchId) {
          this.joystick.active = false;
          this.joystick.touchId = null;
          this.axisX = 0;
          this.axisY = 0;
          this.updateKeyboardAxes();
        } else if (touch.identifier === this.actionButtonTouchId) {
          this.actionButtonTouchId = null;
        } else {
          this.mouse.isDown = false;
          this.mouse.justReleased = true;
          this.mouse.draggedItem = null;
        }
      }
    };

    this.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    this.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    this.canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });
  }

  renderTouchControls(ctx) {
    if (!this.isTouchDevice && !this.joystick.active) return;

    ctx.save();
    // Render Virtual Joystick if active
    if (this.joystick.active) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const bx = this.joystick.baseX * scaleX;
      const by = this.joystick.baseY * scaleY;
      const sx = this.joystick.stickX * scaleX;
      const sy = this.joystick.stickY * scaleY;

      // Base ring
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(bx, by, this.joystick.radius * scaleX, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 179, 0, 0.6)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Stick head
      ctx.fillStyle = 'rgba(255, 179, 0, 0.8)';
      ctx.beginPath();
      ctx.arc(sx, sy, 24 * scaleX, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render Action Button in bottom-right corner
    const btnX = this.canvas.width - 90;
    const btnY = this.canvas.height - 90;
    const btnR = 40;

    ctx.fillStyle = 'rgba(255, 143, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(btnX, btnY, btnR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('INTERACT', btnX, btnY);

    ctx.restore();
  }

  postUpdate() {
    this.interactPressed = false;
    this.pausePressed = false;
    this.mouse.justPressed = false;
    this.mouse.justReleased = false;
  }
}
