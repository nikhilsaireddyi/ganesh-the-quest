/**
 * StreetScene - The Festival Street Hub
 * Coordinates all preparation missions, NPC interactions,
 * crisis events (storm, generator failure), and cinematic transitions.
 */

import { Player } from '../entities/Player.js';
import { NPC } from '../entities/NPC.js';
import { Mandapam } from '../entities/Mandapam.js';
import { Ganesha } from '../entities/Ganesha.js';

import { BambooConstruction } from '../minigames/BambooConstruction.js';
import { FlowerPuzzle } from '../minigames/FlowerPuzzle.js';
import { DecorationsCollector } from '../minigames/DecorationsCollector.js';
import { ElectricalWiring } from '../minigames/ElectricalWiring.js';
import { StormProtection } from '../minigames/StormProtection.js';
import { GeneratorRepair } from '../minigames/GeneratorRepair.js';
import { SynchronizedLift } from '../minigames/SynchronizedLift.js';
import { ModakCooking } from '../minigames/ModakCooking.js';
import { AartiRitual } from '../minigames/AartiRitual.js';
import { achievementSystem } from '../systems/AchievementSystem.js';

import { audioManager } from '../audio/AudioManager.js';

export class StreetScene {
  constructor(game) {
    this.game = game;

    this.player = new Player(300, 540);
    this.mandapam = new Mandapam(1400, 540);
    this.ganesha = new Ganesha(1400, 480);

    this.generatorState = 'off'; // 'off' | 'running'

    // NPCs along street
    this.npcs = [
      new NPC({
        id: 'uncle',
        name: 'Festival Uncle',
        spriteKey: 'UNCLE_SPRITE',
        x: 1050,
        dialogues: {
          BUILD_MANDAPAM: ["Let's build the sacred bamboo frame before the auspicious muhurat!"],
          FLOWER_PUZZLE: ["The flower seller has fresh marigolds and lotus. Let's make a garland!"],
          DECORATE_MANDAPAM: ["Here, take these festival banners for the entrance archway."],
          ELECTRICAL_WIRING: ["The electrician needs a hand connecting the main power line."],
          GANESHA_REVEAL: ["Behold! The divine arrival of Lord Ganesha is upon us!"],
          STORM_PROTECT: ["A sudden squall is coming! Secure the mandapam tarps immediately!"],
          GENERATOR_REPAIR: ["Lightning tripped the breaker! Check the generator near the electrician!"],
          SYNCHRONIZED_LIFT: ["Everyone is here. On the count of three, we lift the palanquin together!"]
        }
      }),
      new NPC({
        id: 'flower_seller',
        name: 'Flower Seller',
        spriteKey: 'FLOWER_SELLER_SPRITE',
        x: 650,
        dialogues: {
          FLOWER_PUZZLE: ["These fresh marigolds and lotus flowers will make the pandal radiant!"],
          DECORATE_MANDAPAM: ["Take these fragrant jasmine and rose garlands for Lord Ganesha."],
          default: ["Fresh flowers for the festival! Marigold, rose, and lotus!"]
        }
      }),
      new NPC({
        id: 'electrician',
        name: 'Electrician',
        spriteKey: 'ELECTRICIAN_SPRITE',
        x: 2160,
        dialogues: {
          ELECTRICAL_WIRING: ["Let's get the wiring connected so the entire street shines bright!"],
          DECORATE_MANDAPAM: ["Here are the long strings of colorful fairy lights."],
          GENERATOR_REPAIR: ["The surge tripped the generator! Reconnect the heavy cable and pull the starter cord!"]
        }
      }),
      new NPC({
        id: 'child',
        name: 'Ananya',
        spriteKey: 'CHILD_SPRITE',
        x: 1600,
        dialogues: {
          default: ["Ganpati Bappa Morya! I made modaks for Bappa!"]
        }
      })
    ];

    // Cinematic State Trackers
    this.lightUpCinematic = { active: false, timer: 0 };
    this.ganeshaRevealCinematic = { active: false, timer: 0, stage: 0 };
    this.powerRestorationCinematic = { active: false, timer: 0 };
    this.dialogueCooldown = 0;

    this.initMiniGames();
  }

  initMiniGames() {
    // 1. Bamboo Construction
    this.bambooMinigame = new BambooConstruction(() => {
      this.mandapam.state = 'bamboo';
      this.game.missions.setProgress(5); // completes BUILD_MANDAPAM
      this.player.canMove = true;
      audioManager.playBell();
      achievementSystem.unlock('master_artisan');

      // Dialogue guiding player to Mission 2
      this.game.dialogue.start('Festival Uncle', [
        "Splendid work! The bamboo framework is sturdy and auspicious.",
        "Now visit the Flower Seller at the entrance of the street to craft the sacred garland!"
      ]);
    });

    // 2. Flower Puzzle
    this.flowerMinigame = new FlowerPuzzle(() => {
      this.game.missions.setProgress(5); // completes FLOWER_PUZZLE
      this.player.canMove = true;
      audioManager.playBell();
      achievementSystem.unlock('flower_weaver');

      // Start decoration collection and explain items
      this.decorationsCollector.start();

      this.game.dialogue.start('Festival Uncle', [
        "What a magnificent flower garland! The fragrance fills the street.",
        "Now we must decorate the sacred pandal! Look along the street for 5 items:",
        "1. Toran at House 1  2. Fresh Flowers  3. Banners from me",
        "4. Saffron Silk Cloth at Temple  5. Fairy Lights from Electrician!"
      ]);
    });

    // 3. Decorations Collector
    this.decorationsCollector = new DecorationsCollector(() => {
      this.mandapam.state = 'decorated';
      this.game.missions.setProgress(5); // completes DECORATE_MANDAPAM
      audioManager.playSuccess();
      this.game.particles.emitDivineAura(1400, 420, 30);
      this.game.particles.emitPetals(1400, 340, 25);

      // Dialogue guiding to Mission 4
      this.game.dialogue.start('Electrician', [
        "The pandal looks breathtaking with all the silk and toran!",
        "Now come over to the switchboard so we can connect the electrical wiring and light up the pandal!"
      ]);
    });

    // 4. Electrical Wiring
    this.wiringMinigame = new ElectricalWiring(() => {
      this.game.missions.setProgress(4); // completes ELECTRICAL_WIRING
      achievementSystem.unlock('street_illuminator');
      this.startLightUpCinematic();
    });

    // 5. Storm Protection
    this.stormProtection = new StormProtection(() => {
      this.game.missions.setProgress(4); // completes STORM_PROTECT
      achievementSystem.unlock('storm_guardian');
      this.triggerGeneratorFailure();
    });

    // 6. Generator Repair
    this.generatorMinigame = new GeneratorRepair(() => {
      this.generatorState = 'running';
      this.game.missions.setProgress(3); // completes GENERATOR_REPAIR
      this.startPowerRestorationCinematic();
    });

    // 7. Synchronized Lift
    this.liftMinigame = new SynchronizedLift(() => {
      this.game.missions.setProgress(1); // completes SYNCHRONIZED_LIFT
      this.game.sceneManager.changeScene('procession');
    });

    // 8. Modak Cooking (Interactive with Child Ananya)
    this.modakMinigame = new ModakCooking(() => {
      this.player.canMove = true;
      audioManager.playSuccess();
      achievementSystem.unlock('chef_of_bappa');
      this.dialogueCooldown = 0.3;
      this.game.dialogue.start('Ananya', [
        "Yay! These holy modaks smell so fragrant! Bappa will be overjoyed!",
        "Take these fresh modaks with you for the grand festival!"
      ]);
    });

    // 9. Maha Aarti Ritual (after Mandapam lights up)
    this.aartiRitual = new AartiRitual(() => {
      this.player.canMove = true;
      audioManager.playSuccess();
      achievementSystem.unlock('divine_pujari');
      this.dialogueCooldown = 0.3;
      this.game.dialogue.start('Festival Uncle', [
        "Ganpati Bappa Morya! What a divine and auspicious Aarti!",
        "Now everyone, gather round the palanquin! On the count of three, we lift Lord Ganesha together!"
      ], () => {
        this.game.missions.start('SYNCHRONIZED_LIFT');
      });
    });
  }

  enter() {
    this.game.camera.setBounds(0, 3000, 0, 720);
    this.game.camera.releaseScripted();
    this.game.dayNight.setTimeOfDay('DAY');
    this.game.dayNight.setStorm(false);
    audioManager.playMusicTheme('FESTIVAL');

    // Start initial mission
    this.game.missions.start('BUILD_MANDAPAM');

    // Initial Uncle greeting
    this.game.dialogue.start('Festival Uncle', [
      "Welcome! Today begins our beloved Ganesh festival.",
      "First, come to the pandal foundation and assemble the bamboo supports!"
    ]);
  }

  exit() {}

  // --- CINEMATICS ---

  startLightUpCinematic() {
    this.lightUpCinematic.active = true;
    this.lightUpCinematic.timer = 0;
    this.player.canMove = false;
    this.game.camera.panTo(1400, 480, 1.25, 0.05);
    audioManager.stopMusic();
  }

  startGaneshaRevealCinematic() {
    this.ganeshaRevealCinematic.active = true;
    this.ganeshaRevealCinematic.timer = 0;
    this.ganeshaRevealCinematic.stage = 0;
    this.ganesha.setRevealStage(0);
    this.player.canMove = false;
    this.game.camera.panTo(1400, 460, 1.35, 0.04);
  }

  triggerStorm() {
    this.game.dayNight.setStorm(true);
    audioManager.playMusicTheme('STORM');
    audioManager.playThunder();
    this.game.camera.shake(20, 1.0);
    this.game.particles.emitLightning();
    this.stormProtection.start();
  }

  triggerGeneratorFailure() {
    // Lightning blast cuts power
    audioManager.playThunder();
    audioManager.playSpark();
    this.game.camera.shake(25, 1.2);
    this.game.particles.emitLightning();
    this.mandapam.isLit = false;
    this.generatorState = 'off';

    // Uncle shouts
    this.game.dialogue.start('Festival Uncle', [
      "LIGHTNING STRUCK! The power is out!",
      "Quick! Run to the backup generator by the electrician and restore power!"
    ], () => {
      this.game.missions.start('GENERATOR_REPAIR');
    });
  }

  startPowerRestorationCinematic() {
    this.powerRestorationCinematic.active = true;
    this.powerRestorationCinematic.timer = 0;
    this.player.canMove = false;
    this.game.camera.panTo(1400, 480, 1.2, 0.04);
    audioManager.playBell();
  }

  // --- UPDATE ---

  update(dt, input) {
    this.game.dayNight.update(dt);
    this.game.particles.update(dt);

    // Weather particles
    if (this.game.dayNight.isStorm) {
      this.game.particles.emitRain(this.game.camera.x, 360, 1280, 720, 18);
      if (Math.random() < 0.008) {
        this.game.particles.emitLightning();
        audioManager.playThunder();
        this.game.camera.shake(12, 0.5);
      }
    } else {
      if (Math.random() < 0.1) {
        this.game.particles.emitPetals(this.game.camera.x + (Math.random() - 0.5) * 1280, 100, 2);
      }
    }

    // Handle Active Mini-games
    if (this.bambooMinigame.active) {
      this.bambooMinigame.update(dt, input, this.game.particles);
      return;
    }
    if (this.flowerMinigame.active) {
      this.flowerMinigame.update(dt, input, this.game.particles);
      return;
    }
    if (this.wiringMinigame.active) {
      this.wiringMinigame.update(dt, input, this.game.particles);
      return;
    }
    if (this.generatorMinigame.active) {
      this.generatorMinigame.update(dt, input, this.game.particles);
      return;
    }
    if (this.liftMinigame.active) {
      this.liftMinigame.update(dt, input, this.game.particles, this.game.camera);
      return;
    }
    if (this.modakMinigame.active) {
      this.modakMinigame.update(dt, input, this.game.particles);
      return;
    }
    if (this.aartiRitual.active) {
      this.aartiRitual.update(dt, input, this.game.particles);
      return;
    }
    if (this.stormProtection.active) {
      this.stormProtection.update(dt, this.player.x, input, this.game.particles);
    }

    // Handle Active Cutscenes
    if (this.lightUpCinematic.active) {
      this.updateLightUpCinematic(dt);
      return;
    }
    if (this.ganeshaRevealCinematic.active) {
      this.updateGaneshaRevealCinematic(dt);
      return;
    }
    if (this.powerRestorationCinematic.active) {
      this.updatePowerRestorationCinematic(dt);
      return;
    }

    if (this.dialogueCooldown > 0) {
      this.dialogueCooldown -= dt;
    }

    // Freeze player movement while dialogue is active
    if (this.game.dialogue.active) {
      this.player.isWalking = false;
      this.player.vx = 0;
      return;
    }

    // Normal Gameplay Exploration
    this.player.update(dt, input);
    this.mandapam.update(dt, this.player.x);
    this.ganesha.update(dt);
    this.npcs.forEach(npc => npc.update(dt, this.player.x));

    this.game.camera.follow(this.player);

    // Contextual Interactions
    this.handleInteractions(input);
  }

  handleInteractions(input) {
    if (!input.interactPressed || this.dialogueCooldown > 0) return;

    const currentMission = this.game.missions.currentMissionId;

    // 1. Mandapam Interaction
    if (this.mandapam.isNearPlayer) {
      if (currentMission === 'BUILD_MANDAPAM' && !this.bambooMinigame.active) {
        this.player.canMove = false;
        this.bambooMinigame.start();
        return;
      }
      if (currentMission === 'ELECTRICAL_WIRING' && !this.wiringMinigame.active) {
        this.player.canMove = false;
        this.wiringMinigame.start();
        return;
      }
      if (currentMission === 'SYNCHRONIZED_LIFT' && !this.liftMinigame.active) {
        this.player.canMove = false;
        this.liftMinigame.start();
        return;
      }
    }

    // 2. Generator Interaction
    if (Math.abs(this.player.x - 2100) < 110) {
      if (currentMission === 'GENERATOR_REPAIR' && !this.generatorMinigame.active) {
        this.player.canMove = false;
        this.generatorMinigame.start();
        return;
      }
    }

    // 3. Decorations Collection Items
    if (currentMission === 'DECORATE_MANDAPAM') {
      for (const item of this.decorationsCollector.items) {
        if (!item.collected && Math.abs(this.player.x - item.x) < 85) {
          this.decorationsCollector.collect(item.id, this.game.particles);
          return;
        }
      }
    }

    // 4. NPC Interactions
    for (const npc of this.npcs) {
      if (npc.isNearPlayer) {
        // Collectible check during mission 3
        if (currentMission === 'DECORATE_MANDAPAM') {
          if (npc.id === 'flower_seller') this.decorationsCollector.collect('flowers', this.game.particles);
          if (npc.id === 'uncle') this.decorationsCollector.collect('banners', this.game.particles);
          if (npc.id === 'electrician') this.decorationsCollector.collect('lights', this.game.particles);
        }

        // Mini-game triggers
        if (currentMission === 'FLOWER_PUZZLE' && npc.id === 'flower_seller') {
          this.player.canMove = false;
          this.flowerMinigame.start();
          return;
        }
        if (currentMission === 'ELECTRICAL_WIRING' && npc.id === 'electrician') {
          this.player.canMove = false;
          this.wiringMinigame.start();
          return;
        }

        // Child NPC Ananya -> Sacred Modak Cooking!
        if (npc.id === 'child') {
          this.player.canMove = false;
          this.modakMinigame.start();
          return;
        }

        // Dialogue Trigger
        const lines = npc.getDialogue(currentMission);
        this.dialogueCooldown = 0.3;
        this.game.dialogue.start(npc.name, lines, () => {
          this.dialogueCooldown = 0.3;
        });
        return;
      }
    }
  }

  // --- CUTSCENE UPDATERS ---

  updateLightUpCinematic(dt) {
    this.lightUpCinematic.timer += dt;
    const t = this.lightUpCinematic.timer;

    if (t > 1.2 && !this.mandapam.isLit) {
      // Step 1: First light
      this.mandapam.isLit = true;
      audioManager.playBell();
      this.game.particles.emitSparks(1400, 360, 10);
    }
    if (t > 2.5 && t < 2.6) {
      // Step 2: Grand illumination & music start
      audioManager.playMusicTheme('FESTIVAL');
      this.game.particles.emitDivineAura(1400, 380, 25);
    }
    if (t > 4.5) {
      // Finish light-up and transition to Ganesha Reveal
      this.lightUpCinematic.active = false;
      this.startGaneshaRevealCinematic();
    }
  }

  updateGaneshaRevealCinematic(dt) {
    this.ganeshaRevealCinematic.timer += dt;
    const t = this.ganeshaRevealCinematic.timer;

    // Staged reveal: 0 (darkness) -> 1 -> 2 -> 3 (trunk) -> 4 (eyes & crown) -> 5 (radiant complete)
    if (t > 1.0 && this.ganeshaRevealCinematic.stage < 1) {
      this.ganeshaRevealCinematic.stage = 1;
      this.ganesha.setRevealStage(1);
    } else if (t > 2.2 && this.ganeshaRevealCinematic.stage < 2) {
      this.ganeshaRevealCinematic.stage = 2;
      this.ganesha.setRevealStage(2);
      audioManager.playBell();
    } else if (t > 3.5 && this.ganeshaRevealCinematic.stage < 3) {
      this.ganeshaRevealCinematic.stage = 3;
      this.ganesha.setRevealStage(3);
      this.game.particles.emitPetals(1400, 380, 15);
    } else if (t > 4.8 && this.ganeshaRevealCinematic.stage < 4) {
      this.ganeshaRevealCinematic.stage = 4;
      this.ganesha.setRevealStage(4);
      audioManager.playBell();
    } else if (t > 6.0 && this.ganeshaRevealCinematic.stage < 5) {
      this.ganeshaRevealCinematic.stage = 5;
      this.ganesha.setRevealStage(5);
      audioManager.playSuccess();
      this.game.particles.emitDivineAura(1400, 420, 35);
      this.game.particles.emitPetals(1400, 340, 25);
    }

    if (t > 8.5) {
      // Reveal complete! Enter Storm event!
      this.ganeshaRevealCinematic.active = false;
      this.player.canMove = true;
      this.game.camera.releaseScripted();
      this.game.missions.start('STORM_PROTECT');
      this.triggerStorm();
    }
  }

  updatePowerRestorationCinematic(dt) {
    this.powerRestorationCinematic.timer += dt;
    const t = this.powerRestorationCinematic.timer;

    if (t > 1.2 && !this.mandapam.isLit) {
      this.mandapam.isLit = true;
      this.game.dayNight.setStorm(false);
      audioManager.playMusicTheme('FESTIVAL');
      this.game.particles.emitSparks(1400, 360, 15);
    }

    if (t > 3.5) {
      this.powerRestorationCinematic.active = false;
      this.game.camera.releaseScripted();
      this.aartiRitual.start();
    }
  }

  // --- RENDER ---

  render(ctx) {
    // 1. Sky & Celestial
    this.game.dayNight.renderSky(ctx, 1280, 720);

    // 2. Parallax background
    this.game.parallax.renderBackground(ctx, this.game.camera);

    // 3. World Entities (In Camera Coordinates)
    this.game.camera.begin(ctx);

    // Stone ground
    this.game.parallax.renderGround(ctx, this.game.camera);

    // Rangoli Ground Floor Art
    this.game.assetRegistry.draw(ctx, 'RANGOLI_ART', 450, 542, 120, 50, '1', 1, this.game.dayNight.time);
    this.game.assetRegistry.draw(ctx, 'RANGOLI_ART', 950, 542, 120, 50, '2', 1, this.game.dayNight.time);
    this.game.assetRegistry.draw(ctx, 'RANGOLI_ART', 1400, 542, 140, 55, '3', 1, this.game.dayNight.time);

    // Buildings & Props
    this.game.assetRegistry.draw(ctx, 'HOUSE_SPRITE', 450, 540, 220, 200, '1');
    this.game.assetRegistry.draw(ctx, 'HOUSE_SPRITE', 950, 540, 220, 200, '2');
    this.game.assetRegistry.draw(ctx, 'TEMPLE_SPRITE', 1800, 540, 260, 280);
    this.game.assetRegistry.draw(ctx, 'GENERATOR_SPRITE', 2100, 540, 70, 55, this.generatorState);

    // Hanging Festive Kandil Lanterns from eaves
    this.game.assetRegistry.draw(ctx, 'KANDIL_LANTERN', 390, 365, 36, 75, 'gold', 1, this.game.dayNight.time);
    this.game.assetRegistry.draw(ctx, 'KANDIL_LANTERN', 510, 365, 36, 75, 'pink', 1, this.game.dayNight.time);
    this.game.assetRegistry.draw(ctx, 'KANDIL_LANTERN', 890, 365, 36, 75, 'pink', 1, this.game.dayNight.time);
    this.game.assetRegistry.draw(ctx, 'KANDIL_LANTERN', 1010, 365, 36, 75, 'gold', 1, this.game.dayNight.time);
    this.game.assetRegistry.draw(ctx, 'KANDIL_LANTERN', 1740, 315, 42, 85, 'gold', 1, this.game.dayNight.time);
    this.game.assetRegistry.draw(ctx, 'KANDIL_LANTERN', 1860, 315, 42, 85, 'pink', 1, this.game.dayNight.time);

    // Ornate Streetlamps along walkway (only lit during night, twilight, or storm)
    const isNight = this.game.dayNight.isNight();
    const streetLampX = [220, 750, 1200, 1620, 2350];
    streetLampX.forEach(lx => {
      this.game.assetRegistry.draw(ctx, 'STREET_LAMP', lx, 540, 32, 180, isNight ? 'lit' : 'unlit', 1, this.game.dayNight.time);
    });

    // Sacred Mandapam & Ganesha
    this.mandapam.render(ctx);
    this.ganesha.render(ctx);

    // NPCs
    this.npcs.forEach(npc => npc.render(ctx));

    // Player
    this.player.render(ctx);

    // World particles (sparks, petals)
    this.game.particles.render(ctx);

    // Visible decoration items in world during Mission 3
    this.decorationsCollector.renderWorldPickups(ctx, this.player.x);

    // Active Quest Objective Pointers
    this.renderQuestPointers(ctx);

    // Storm hazard hotspots if mission active
    this.stormProtection.renderWorldHotspots(ctx);

    this.game.camera.end(ctx);

    // 4. Foreground Parallax Bunting & Torans
    this.game.parallax.renderForeground(ctx, this.game.camera);

    // 5. Lighting Pass (Ambient darkness & warm lights - only during dark hours/night)
    this.game.lighting.clear();
    const ambientDark = this.game.dayNight.getAmbientDarkness();
    if (isNight || ambientDark > 0.15) {
      streetLampX.forEach(lx => {
        this.game.lighting.addLight(lx, 360, 95, 'rgba(255, 215, 64, 0.25)', 0.6);
      });
      if (this.mandapam.isLit) {
        this.game.lighting.addLight(1400, 420, 150, 'rgba(255, 179, 0, 0.3)', 0.65);
      }
      if (this.generatorState === 'running') {
        this.game.lighting.addLight(2100, 520, 75, 'rgba(0, 230, 118, 0.25)', 0.5);
      }
    }
    this.game.lighting.render(ctx, this.game.camera, ambientDark);

    // 6. UI & HUD Overlay
    const mission = this.game.missions.getCurrentMission();
    this.game.ui.renderHUD(ctx, mission, this.player.x, this.player.isSprinting);
    this.renderDirectionArrow(ctx);

    // Mini-game HUDs
    this.decorationsCollector.renderHUD(ctx);
    this.stormProtection.renderHUD(ctx);

    // Mini-game Full Modals
    this.bambooMinigame.render(ctx);
    this.flowerMinigame.render(ctx);
    this.wiringMinigame.render(ctx);
    this.generatorMinigame.render(ctx);
    this.liftMinigame.render(ctx);
    this.modakMinigame.render(ctx);
    this.aartiRitual.render(ctx);

    // Dialogue Box
    this.game.dialogue.render(ctx);

    // Modals (Settings, Credits, Pause)
    this.game.ui.renderModals(ctx);
  }

  isMinigameActive() {
    return Boolean(
      (this.bambooMinigame && this.bambooMinigame.active) ||
      (this.flowerMinigame && this.flowerMinigame.active) ||
      (this.wiringMinigame && this.wiringMinigame.active) ||
      (this.generatorMinigame && this.generatorMinigame.active) ||
      (this.liftMinigame && this.liftMinigame.active) ||
      (this.modakMinigame && this.modakMinigame.active) ||
      (this.aartiRitual && this.aartiRitual.active) ||
      (this.stormProtection && this.stormProtection.active) ||
      (this.lightUpCinematic && this.lightUpCinematic.active) ||
      (this.ganeshaRevealCinematic && this.ganeshaRevealCinematic.active) ||
      (this.powerRestorationCinematic && this.powerRestorationCinematic.active)
    );
  }

  renderDirectionArrow(ctx) {
    if (this.game.dialogue.active || this.isMinigameActive()) return;
    const currentMission = this.game.missions.currentMissionId;
    let targetX = null;
    let targetName = '';

    if (currentMission === 'BUILD_MANDAPAM') {
      targetX = 1400;
      targetName = 'Mandapam Frame';
    } else if (currentMission === 'FLOWER_PUZZLE') {
      targetX = 650;
      targetName = 'Flower Seller';
    } else if (currentMission === 'ELECTRICAL_WIRING') {
      targetX = 2160;
      targetName = 'Electrician';
    } else if (currentMission === 'GENERATOR_REPAIR') {
      targetX = 2100;
      targetName = 'Generator';
    } else if (currentMission === 'SYNCHRONIZED_LIFT') {
      targetX = 1400;
      targetName = 'Palanquin';
    }

    if (targetX !== null && Math.abs(targetX - this.player.x) > 240) {
      ctx.save();
      const isRight = targetX > this.player.x;
      const text = isRight ? `Walk Right to ${targetName} ▶` : `◀ Walk Left to ${targetName}`;

      ctx.font = 'bold 12px sans-serif';
      const textWidth = ctx.measureText(text).width;
      const chipW = Math.max(220, textWidth + 36);
      const chipH = 30;
      const chipX = 640 - chipW / 2;
      const chipY = 76;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.beginPath();
      ctx.roundRect(chipX, chipY, chipW, chipH, 15);
      ctx.fill();
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffd54f';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 640, chipY + chipH / 2);
      ctx.restore();
    }
  }

  renderQuestPointers(ctx) {
    const currentMission = this.game.missions.currentMissionId;
    let targetX = null;
    let label = '';

    if (currentMission === 'BUILD_MANDAPAM') {
      targetX = 1400;
      label = '★ ASSEMBLE BAMBOO [E]';
    } else if (currentMission === 'FLOWER_PUZZLE') {
      targetX = 650;
      label = '★ MAKE GARLAND [E]';
    } else if (currentMission === 'ELECTRICAL_WIRING') {
      targetX = 2160;
      label = '⚡ CONNECT WIRING [E]';
    } else if (currentMission === 'GENERATOR_REPAIR') {
      targetX = 2100;
      label = '⚠️ REPAIR GENERATOR [E]';
    } else if (currentMission === 'SYNCHRONIZED_LIFT') {
      targetX = 1400;
      label = '🙏 LIFT GANESHA [E]';
    }

    if (targetX !== null) {
      ctx.save();
      const animTime = Date.now() * 0.005;
      const bob = Math.sin(animTime * 5) * 8;
      const py = 410 + bob;

      // Golden halo & star badge
      ctx.fillStyle = '#ff8f00';
      ctx.beginPath();
      ctx.arc(targetX, py, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', targetX, py);

      // Downward pointer arrow
      ctx.fillStyle = '#ff8f00';
      ctx.beginPath();
      ctx.moveTo(targetX - 8, py + 13);
      ctx.lineTo(targetX + 8, py + 13);
      ctx.lineTo(targetX, py + 24);
      ctx.closePath();
      ctx.fill();

      // Quest Banner text box
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.beginPath();
      ctx.roundRect(targetX - 80, py - 36, 160, 24, 6);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffd54f';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(label, targetX, py - 24);

      ctx.restore();
    }
  }
}
