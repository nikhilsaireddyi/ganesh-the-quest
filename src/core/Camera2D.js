/**
 * Camera2D - Cinematic 2D Camera System
 * Provides smooth tracking, bounds clamping, zoom control,
 * screen shake effects, and scripted cinematic panning.
 */

export class Camera2D {
  constructor(viewportWidth = 1280, viewportHeight = 720) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;

    this.x = 300;
    this.y = 450;
    this.targetX = 300;
    this.targetY = 450;

    this.zoom = 1.0;
    this.targetZoom = 1.0;
    this.zoomSpeed = 2.0;

    this.lerpSpeed = 0.08;

    this.minX = 0;
    this.maxX = 3000;
    this.minY = 0;
    this.maxY = 720;

    // Screen shake
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTimer = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;

    // Device mode tracking (PC vs Mobile floor placement)
    this.isMobile = false;

    // Scripted cutscene override
    this.isScripted = false;
  }

  setBounds(minX, maxX, minY = 0, maxY = 950) {
    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;
  }

  follow(entity, isMobile = this.isMobile) {
    if (this.isScripted) return;
    this.targetX = entity.x;
    // On mobile: floor/road is positioned much higher towards the middle (screenY ~345-360)
    // leaving the spacious lower half for touch buttons without overlapping objects.
    // On PC: floor is near the bottom (screenY ~490) where it fits perfectly with keyboard controls.
    const yOffset = isMobile ? -15 : 130;
    this.targetY = entity.y - yOffset;
  }

  panTo(x, y, zoom = 1.0, speed = 0.05) {
    this.isScripted = true;
    this.targetX = x;
    const mobileShift = this.isMobile ? 135 : 0;
    const pcOffset = !this.isMobile ? 90 : 0;
    this.targetY = y - pcOffset + mobileShift;
    this.targetZoom = zoom;
    this.lerpSpeed = speed;
  }

  releaseScripted() {
    this.isScripted = false;
    this.lerpSpeed = 0.08;
    this.targetZoom = 1.0;
  }

  shake(intensity = 15, duration = 0.5) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTimer = duration;
  }

  setZoom(zoom) {
    this.targetZoom = zoom;
  }

  update(dt) {
    // Interpolate zoom
    this.zoom += (this.targetZoom - this.zoom) * this.zoomSpeed * dt;

    // Smooth follow
    this.x += (this.targetX - this.x) * this.lerpSpeed;
    this.y += (this.targetY - this.y) * this.lerpSpeed;

    // Handle screen shake
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const progress = this.shakeTimer / this.shakeDuration;
      const currentIntensity = this.shakeIntensity * progress;
      this.shakeOffsetX = (Math.random() * 2 - 1) * currentIntensity;
      this.shakeOffsetY = (Math.random() * 2 - 1) * currentIntensity;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }

    // Clamp camera within world bounds taking zoom into account
    const halfW = (this.viewportWidth / 2) / this.zoom;
    const halfH = (this.viewportHeight / 2) / this.zoom;

    if (this.maxX - this.minX >= halfW * 2) {
      this.x = Math.max(this.minX + halfW, Math.min(this.maxX - halfW, this.x));
    } else {
      this.x = (this.minX + this.maxX) / 2;
    }

    if (this.maxY - this.minY >= halfH * 2) {
      this.y = Math.max(this.minY + halfH, Math.min(this.maxY - halfH, this.y));
    } else {
      this.y = (this.minY + this.maxY) / 2;
    }
  }

  begin(ctx) {
    ctx.save();
    // Center of screen
    ctx.translate(this.viewportWidth / 2, this.viewportHeight / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(
      -this.x + this.shakeOffsetX,
      -this.y + this.shakeOffsetY
    );
  }

  end(ctx) {
    ctx.restore();
  }

  screenToWorld(screenX, screenY) {
    const centeredX = (screenX - this.viewportWidth / 2) / this.zoom;
    const centeredY = (screenY - this.viewportHeight / 2) / this.zoom;
    return {
      x: centeredX + this.x - this.shakeOffsetX,
      y: centeredY + this.y - this.shakeOffsetY
    };
  }

  worldToScreen(worldX, worldY) {
    const screenX = (worldX - this.x + this.shakeOffsetX) * this.zoom + this.viewportWidth / 2;
    const screenY = (worldY - this.y + this.shakeOffsetY) * this.zoom + this.viewportHeight / 2;
    return { x: screenX, y: screenY };
  }
}
