/**
 * LightingSystem - 2D Ambient & Point Light Composite System
 * Casts atmospheric darkness with warm glowing radial falloffs for festival lights.
 */

export class LightingSystem {
  constructor() {
    this.lights = [];
  }

  clear() {
    this.lights = [];
  }

  addLight(x, y, radius = 100, color = 'rgba(255, 193, 7, 0.7)', intensity = 1.0) {
    this.lights.push({ x, y, radius, color, intensity });
  }

  render(ctx, camera, ambientDarkness = 0.0) {
    if (ambientDarkness <= 0.05 && this.lights.length === 0) return;

    ctx.save();
    // Ambient darkness layer
    ctx.fillStyle = `rgba(10, 14, 26, ${Math.min(0.85, ambientDarkness)})`;
    ctx.fillRect(0, 0, camera.viewportWidth, camera.viewportHeight);

    // Punch out warm light sources using 'destination-out' or additive glow
    ctx.globalCompositeOperation = 'destination-out';

    for (const light of this.lights) {
      const screenPos = camera.worldToScreen(light.x, light.y);
      const rad = light.radius * camera.zoom;

      const grad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 5,
        screenPos.x, screenPos.y, rad
      );
      grad.addColorStop(0, `rgba(0, 0, 0, ${light.intensity})`);
      grad.addColorStop(0.5, `rgba(0, 0, 0, ${light.intensity * 0.5})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // Warm colored light overlay pass
    ctx.globalCompositeOperation = 'lighter';
    for (const light of this.lights) {
      const screenPos = camera.worldToScreen(light.x, light.y);
      const rad = light.radius * camera.zoom * 0.9;

      const grad = ctx.createRadialGradient(
        screenPos.x, screenPos.y, 2,
        screenPos.x, screenPos.y, rad
      );
      grad.addColorStop(0, light.color);
      grad.addColorStop(1, 'rgba(255, 179, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
