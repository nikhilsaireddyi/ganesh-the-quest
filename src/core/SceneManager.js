/**
 * SceneManager - State machine coordinating scenes and smooth transitions
 */

export class SceneManager {
  constructor(game) {
    this.game = game;
    this.scenes = new Map();
    this.currentScene = null;
    this.currentSceneKey = '';

    this.isTransitioning = false;
    this.transitionAlpha = 0;
    this.transitionSpeed = 3.2;
    this.nextSceneKey = null;
  }

  addScene(key, scene) {
    this.scenes.set(key, scene);
  }

  changeScene(key) {
    if (!this.scenes.has(key)) {
      console.error(`[SceneManager] Scene '${key}' does not exist.`);
      return;
    }

    if (this.currentSceneKey === key && !this.isTransitioning) {
      return;
    }

    if (this.currentScene) {
      this.isTransitioning = true;
      this.nextSceneKey = key;
    } else {
      this.currentSceneKey = key;
      this.currentScene = this.scenes.get(key);
      this.currentScene.enter();
    }
  }

  update(dt, input) {
    // Handle scene fade transitions
    if (this.isTransitioning) {
      this.transitionAlpha += this.transitionSpeed * dt;
      if (this.transitionAlpha >= 1.0) {
        this.transitionAlpha = 1.0;
        // Swap scene
        if (this.currentScene) this.currentScene.exit();
        this.currentSceneKey = this.nextSceneKey;
        this.currentScene = this.scenes.get(this.nextSceneKey);
        this.nextSceneKey = null;
        this.isTransitioning = false; // Transition in finished, now fade back out
        
        if (this.currentScene) {
          this.currentScene.enter();
        }
      }
    } else if (this.transitionAlpha > 0) {
      this.transitionAlpha = Math.max(0, this.transitionAlpha - this.transitionSpeed * dt);
    }

    // Update active scene
    if (this.currentScene && !this.game.ui.isPaused) {
      this.currentScene.update(dt, input);
    }
  }

  render(ctx) {
    if (this.currentScene) {
      this.currentScene.render(ctx);
    }

    // Transition Fade Overlay
    if (this.transitionAlpha > 0.01) {
      ctx.save();
      ctx.fillStyle = `rgba(10, 14, 26, ${this.transitionAlpha})`;
      ctx.fillRect(0, 0, this.game.virtualWidth, this.game.virtualHeight);
      ctx.restore();
    }
  }
}
