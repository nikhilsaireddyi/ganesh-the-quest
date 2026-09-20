/**
 * Engine - Main Game Loop & Lifecycle Manager
 * Handles high-DPI scaling, fixed delta time, input dispatch, and master rendering.
 */

import { InputManager } from './InputManager.js';
import { Camera2D } from './Camera2D.js';
import { SceneManager } from './SceneManager.js';

import { AssetRegistry, assetRegistry } from '../assets/AssetRegistry.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { ParallaxSystem } from '../systems/ParallaxSystem.js';
import { DayNightSystem } from '../systems/DayNightSystem.js';
import { LightingSystem } from '../systems/LightingSystem.js';
import { MissionManager } from '../systems/MissionManager.js';

import { DialogueBox } from '../ui/DialogueBox.js';
import { UIManager } from '../ui/UIManager.js';
import { PhotoMode } from '../ui/PhotoMode.js';
import { wardrobeManager } from '../ui/WardrobeManager.js';
import { achievementSystem } from '../systems/AchievementSystem.js';

import { TitleScene } from '../scenes/TitleScene.js';
import { CinematicIntroScene } from '../scenes/CinematicIntroScene.js';
import { StreetScene } from '../scenes/StreetScene.js';
import { ProcessionScene } from '../scenes/ProcessionScene.js';
import { VisarjanScene } from '../scenes/VisarjanScene.js';
import { EndingScene } from '../scenes/EndingScene.js';

export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Virtual design resolution
    this.virtualWidth = 1280;
    this.virtualHeight = 720;
    this.dprScale = 1;

    // Subsystems
    this.assetRegistry = assetRegistry;
    this.input = new InputManager(canvas);
    this.input.engine = this;
    this.camera = new Camera2D(this.virtualWidth, this.virtualHeight);
    this.particles = new ParticleSystem();
    this.parallax = new ParallaxSystem();
    this.dayNight = new DayNightSystem();
    this.lighting = new LightingSystem();
    this.missions = new MissionManager();
    this.dialogue = new DialogueBox(this);
    this.wardrobe = wardrobeManager;
    this.achievements = achievementSystem;
    this.photoMode = new PhotoMode(this);
    this.ui = new UIManager(this);

    // Scene Manager
    this.sceneManager = new SceneManager(this);
    this.initScenes();

    // Loop timing
    this.lastTime = 0;
    this.maxDt = 0.1; // clamp delta time for lag spikes

    this.setupResize();
  }

  initScenes() {
    this.sceneManager.addScene('title', new TitleScene(this));
    this.sceneManager.addScene('intro', new CinematicIntroScene(this));
    this.sceneManager.addScene('street', new StreetScene(this));
    this.sceneManager.addScene('procession', new ProcessionScene(this));
    this.sceneManager.addScene('visarjan', new VisarjanScene(this));
    this.sceneManager.addScene('ending', new EndingScene(this));
  }

  setupResize() {
    const resize = () => {
      // Dynamic Full-Screen Responsive Scaling
      // Fills 100% of the display window with no black bars and no distortion
      const rect = this.canvas.getBoundingClientRect();
      const cssWidth = rect.width > 0 ? rect.width : window.innerWidth;
      const cssHeight = rect.height > 0 ? rect.height : window.innerHeight;

      const aspect = cssWidth / cssHeight;

      // Maintain minimum 1280x720 virtual coordinate space while expanding dynamically
      if (aspect >= 16 / 9) {
        this.virtualHeight = 720;
        this.virtualWidth = Math.round(720 * aspect);
      } else {
        this.virtualWidth = 1280;
        this.virtualHeight = Math.round(1280 / aspect);
      }

      // Update camera viewport to match dynamic screen dimensions
      if (this.camera) {
        this.camera.viewportWidth = this.virtualWidth;
        this.camera.viewportHeight = this.virtualHeight;
      }

      const rawDpr = window.devicePixelRatio || 1;
      const dpr = Math.min(Math.max(1, rawDpr), 2.5);

      const targetWidth = Math.round(cssWidth * dpr);
      const targetHeight = Math.round(cssHeight * dpr);

      if (this.canvas.width !== targetWidth || this.canvas.height !== targetHeight) {
        this.canvas.width = targetWidth;
        this.canvas.height = targetHeight;
        this.dprScale = targetWidth / this.virtualWidth;
      }
    };

    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    resize();
    requestAnimationFrame(resize);
  }

  getModalOffsets() {
    return {
      x: (this.virtualWidth - 1280) / 2,
      y: (this.virtualHeight - 720) / 2
    };
  }

  getModalInputProxy(input) {
    const { x: ox, y: oy } = this.getModalOffsets();
    if (ox === 0 && oy === 0) return input;

    return {
      ...input,
      mouse: {
        ...input.mouse,
        x: input.mouse.x - ox,
        y: input.mouse.y - oy
      }
    };
  }

  renderCenteredModal(ctx, renderFn) {
    const { x: ox, y: oy } = this.getModalOffsets();
    ctx.save();
    // 1. Dark overlay covering the full screen edge-to-edge
    ctx.fillStyle = 'rgba(10, 14, 26, 0.88)';
    ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);

    // 2. Translate context to center the 1280x720 modal frame
    ctx.translate(ox, oy);
    renderFn();
    ctx.restore();
  }

  start() {
    this.sceneManager.changeScene('title');
    this.lastTime = performance.now();
    requestAnimationFrame(this.loop.bind(this));
  }

  loop(currentTime) {
    let dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Clamp dt
    if (dt > this.maxDt) dt = this.maxDt;

    this.update(dt);
    this.render();

    this.input.postUpdate();
    requestAnimationFrame(this.loop.bind(this));
  }

  update(dt) {
    // 0. Photo Mode updates
    const modalInput = this.getModalInputProxy(this.input);
    if (this.photoMode.showScrapbook) {
      this.photoMode.update(dt, modalInput);
    } else {
      this.photoMode.update(dt, this.input);
    }
    if (this.photoMode.active || this.photoMode.showScrapbook) {
      return; // Freeze scene while framing or browsing scrapbook
    }

    // 1. Wardrobe & Achievements modals
    if (this.wardrobe.showModal) {
      this.wardrobe.update(dt, modalInput);
    } else {
      this.wardrobe.update(dt, this.input);
    }

    if (this.achievements.showModal) {
      this.achievements.update(dt, modalInput);
    } else {
      this.achievements.update(dt, this.input);
    }

    // 2. Camera
    this.camera.isMobile = this.input.isMobile;
    this.camera.update(dt);

    // 3. UI / Menus
    this.ui.update(dt, this.input);

    // 4. Dialogue System
    if (this.dialogue.active) {
      this.dialogue.update(dt, this.input);
    }

    // 5. Active Scene (always update so transitions fade out and scene progresses)
    this.sceneManager.update(dt, this.input);
  }

  isUIBlocked() {
    const activeKey = this.sceneManager.currentSceneKey;
    const isGameplay = activeKey === 'street' || activeKey === 'procession';
    if (!isGameplay) return true;

    const activeScene = this.sceneManager.currentScene;
    // Storm protection is active world movement gameplay - controls must stay active!
    if (activeScene && activeScene.stormProtection && activeScene.stormProtection.active) {
      return false;
    }

    const isMinigame = activeScene && typeof activeScene.isMinigameActive === 'function' && activeScene.isMinigameActive();

    return Boolean(
      this.dialogue.active ||
      this.ui.isPaused ||
      this.ui.showSettings ||
      this.ui.showCredits ||
      this.wardrobe.showModal ||
      this.achievements.showModal ||
      this.photoMode.active ||
      isMinigame
    );
  }

  render() {
    // Clear full physical canvas buffer
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    const scale = this.dprScale || 1;
    this.ctx.scale(scale, scale);

    // 1. Render Active Scene
    this.sceneManager.render(this.ctx);

    // 2. Render Touch Controls (only during active world gameplay, never during dialogue/modals)
    if (!this.isUIBlocked()) {
      this.input.renderTouchControls(this.ctx);
    }

    // 3. Photo Mode Viewfinder & Flash
    this.photoMode.renderViewfinder(this.ctx);
    this.photoMode.renderFlash(this.ctx);

    // 4. Achievements Toast notifications
    this.achievements.renderToasts(this.ctx);

    // 5. Modals (Wardrobe, Badges, Scrapbook)
    if (this.wardrobe.showModal) {
      this.renderCenteredModal(this.ctx, () => this.wardrobe.renderModal(this.ctx));
    }
    if (this.achievements.showModal) {
      this.renderCenteredModal(this.ctx, () => this.achievements.renderModal(this.ctx));
    }
    if (this.photoMode.showScrapbook) {
      this.renderCenteredModal(this.ctx, () => this.photoMode.renderScrapbook(this.ctx));
    }

    this.ctx.restore();
  }
}
