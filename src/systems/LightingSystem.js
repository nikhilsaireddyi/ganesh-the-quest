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
    // If it's daytime (very low ambient darkness) and no night overlay is needed, skip
    if (ambientDarkness <= 0.08) return;

    ctx.save();
    // Ambient darkness layer
    const darkAlpha = Math.min(0.82, ambientDarkness);
    ctx.fillStyle = `rgba(10, 14, 26, ${darkAlpha})`;
    ctx.fillRect(0, 0, camera.viewportWidth, camera.viewportHeight);

    if (this.lights.length > 0) {
      // 1. Punch out darkness layer smoothly for light sources
      ctx.globalCompositeOperation = 'destination-out';

      for (const light of this.lights) {
        const screenPos = camera.worldToScreen(light.x, light.y);
        const rad = light.radius * camera.zoom;

        const grad = ctx.createRadialGradient(
          screenPos.x, screenPos.y, 4,
          screenPos.x, screenPos.y, rad
        );
        grad.addColorStop(0, `rgba(0, 0, 0, ${Math.min(1.0, light.intensity * 0.95)})`);
        grad.addColorStop(0.4, `rgba(0, 0, 0, ${light.intensity * 0.5})`);
        grad.addColorStop(0.8, `rgba(0, 0, 0, ${light.intensity * 0.15})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Subtle warm tint pass (soft, non-bleaching golden atmosphere)
      ctx.globalCompositeOperation = 'lighter';
      const glowScale = Math.min(0.18, ambientDarkness * 0.25);

      for (const light of this.lights) {
        const screenPos = camera.worldToScreen(light.x, light.y);
        const rad = light.radius * camera.zoom * 0.7;

        const grad = ctx.createRadialGradient(
          screenPos.x, screenPos.y, 2,
          screenPos.x, screenPos.y, rad
        );
        grad.addColorStop(0, `rgba(255, 215, 64, ${glowScale})`);
        grad.addColorStop(0.5, `rgba(255, 179, 0, ${glowScale * 0.4})`);
        grad.addColorStop(1, 'rgba(255, 179, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
