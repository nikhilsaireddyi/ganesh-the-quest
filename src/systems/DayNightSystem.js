/**
 * DayNightSystem - Dynamic sky lighting and diurnal cycle
 * Supports DAY -> SUNSET -> TWILIGHT -> NIGHT and stormy weather moods.
 */

export class DayNightSystem {
  constructor() {
    // Current time of day progress: 0.0 (Day) -> 0.33 (Sunset) -> 0.66 (Twilight) -> 1.0 (Night)
    this.progress = 0.0;
    this.targetProgress = 0.0;
    this.transitionSpeed = 0.15;

    this.isStorm = false;
    this.stormFactor = 0.0;

    // Predefined sky gradient stops
    this.skies = {
      day: { top: '#4fc3f7', bottom: '#e1f5fe', sun: '#ffee58', ambientDark: 0.0 },
      sunset: { top: '#e65100', bottom: '#ffd54f', sun: '#ff7043', ambientDark: 0.15 },
      twilight: { top: '#311b92', bottom: '#b388ff', sun: '#ffd54f', ambientDark: 0.45 },
      night: { top: '#0a0e1a', bottom: '#1a237e', sun: '#ffffff', ambientDark: 0.72 },
      storm: { top: '#212121', bottom: '#455a64', sun: '#78909c', ambientDark: 0.6 }
    };
  }

  setTimeOfDay(timeStr) {
    switch (timeStr) {
      case 'DAY': this.targetProgress = 0.0; break;
      case 'SUNSET': this.targetProgress = 0.33; break;
      case 'TWILIGHT': this.targetProgress = 0.66; break;
      case 'NIGHT': this.targetProgress = 1.0; break;
    }
  }

  setStorm(isStorm) {
    this.isStorm = isStorm;
  }

  update(dt) {
    // Smooth transition
    this.progress += (this.targetProgress - this.progress) * this.transitionSpeed * dt;

    if (this.isStorm) {
      this.stormFactor = Math.min(1.0, this.stormFactor + dt * 0.8);
    } else {
      this.stormFactor = Math.max(0.0, this.stormFactor - dt * 0.8);
    }
  }

  getAmbientDarkness() {
    let dark = 0;
    if (this.progress < 0.33) {
      const t = this.progress / 0.33;
      dark = this.skies.day.ambientDark * (1 - t) + this.skies.sunset.ambientDark * t;
    } else if (this.progress < 0.66) {
      const t = (this.progress - 0.33) / 0.33;
      dark = this.skies.sunset.ambientDark * (1 - t) + this.skies.twilight.ambientDark * t;
    } else {
      const t = (this.progress - 0.66) / 0.34;
      dark = this.skies.twilight.ambientDark * (1 - t) + this.skies.night.ambientDark * t;
    }

    // Blend storm
    if (this.stormFactor > 0) {
      dark = dark * (1 - this.stormFactor) + this.skies.storm.ambientDark * this.stormFactor;
    }

    return dark;
  }

  isNight() {
    return this.progress >= 0.5 || this.isStorm || this.getAmbientDarkness() > 0.25;
  }

  isDay() {
    return !this.isNight();
  }

  renderSky(ctx, viewportWidth = 1280, viewportHeight = 720, renderCelestial = true) {
    ctx.save();

    let topColor, bottomColor;

    if (this.stormFactor > 0.5) {
      topColor = this.skies.storm.top;
      bottomColor = this.skies.storm.bottom;
    } else if (this.progress < 0.33) {
      topColor = this.progress < 0.15 ? this.skies.day.top : this.skies.sunset.top;
      bottomColor = this.progress < 0.15 ? this.skies.day.bottom : this.skies.sunset.bottom;
    } else if (this.progress < 0.66) {
      topColor = this.skies.twilight.top;
      bottomColor = this.skies.twilight.bottom;
    } else {
      topColor = this.skies.night.top;
      bottomColor = this.skies.night.bottom;
    }

    const grad = ctx.createLinearGradient(0, 0, 0, viewportHeight);
    grad.addColorStop(0, topColor);
    grad.addColorStop(1, bottomColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, viewportWidth, viewportHeight);

    // Stars (Night sky)
    if (this.progress >= 0.5 && this.stormFactor < 0.7) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 4;
      for (let i = 0; i < 40; i++) {
        const sx = (i * 137.5) % viewportWidth;
        const sy = (i * 73.1) % (viewportHeight * 0.45);
        ctx.globalAlpha = 0.3 + Math.sin(Date.now() * 0.003 + i) * 0.4;
        ctx.fillRect(sx, sy, 2, 2);
      }
      ctx.globalAlpha = 1.0;
    }

    // Render Celestial Body: Sun or Moon (if enabled)
    if (renderCelestial && this.stormFactor < 0.7) {
      if (this.progress < 0.5) {
        // Sun
        const sunY = 120 + this.progress * 240;
        const sunX = 300 + this.progress * 400;
        ctx.fillStyle = this.progress > 0.25 ? '#ff7043' : '#ffee58';
        ctx.shadowColor = '#ffd54f';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 36, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Crescent / Full Festive Moon
        const moonX = 980;
        const moonY = 130;
        ctx.fillStyle = '#fff9c4';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 28, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
