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

    // Subsystems
    this.assetRegistry = assetRegistry;
    this.input = new InputManager(canvas);
    this.camera = new Camera2D(this.virtualWidth, this.virtualHeight);
    this.particles = new ParticleSystem();
    this.parallax = new ParallaxSystem();
    this.dayNight = new DayNightSystem();
    this.lighting = new LightingSystem();
    this.missions = new MissionManager();
    this.dialogue = new DialogueBox();
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
      // Internal buffer size stays 1280x720 for crisp pixel-perfect scaling
      this.canvas.width = this.virtualWidth;
      this.canvas.height = this.virtualHeight;
    };
    window.addEventListener('resize', resize);
    resize();
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
    this.photoMode.update(dt, this.input);
    if (this.photoMode.active || this.photoMode.showScrapbook) {
      return; // Freeze scene while framing or browsing scrapbook
    }

    // 1. Wardrobe & Achievements modals
    this.wardrobe.update(dt, this.input);
    this.achievements.update(dt, this.input);

    // 2. Camera
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

  render() {
    this.ctx.clearRect(0, 0, this.virtualWidth, this.virtualHeight);

    // 1. Render Active Scene
    this.sceneManager.render(this.ctx);

    // 2. Render Touch Controls
    this.input.renderTouchControls(this.ctx);

    // 3. Photo Mode Viewfinder & Flash
    this.photoMode.renderViewfinder(this.ctx);
    this.photoMode.renderFlash(this.ctx);

    // 4. Achievements Toast notifications
    this.achievements.renderToasts(this.ctx);

    // 5. Modals (Wardrobe, Badges, Scrapbook)
    this.wardrobe.renderModal(this.ctx);
    this.achievements.renderModal(this.ctx);
    this.photoMode.renderScrapbook(this.ctx);
  }
}
