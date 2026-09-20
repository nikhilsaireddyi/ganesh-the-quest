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
import { SaveSystem } from '../core/SaveSystem.js';

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
          COOK_MODAKS: ["Young Ananya is ready down the street. Go help make the sacred modaks!"],
          GANESHA_REVEAL: ["Behold! The divine arrival of Lord Ganesha is upon us!"],
          STORM_PROTECT: ["A sudden squall is coming! Secure the mandapam tarps immediately!"],
          GENERATOR_REPAIR: ["Lightning tripped the breaker! Check the generator near the electrician!"],
          AARTI_RITUAL: ["Step up to the mandapam to begin the grand Maha Aarti!"],
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
          COOK_MODAKS: ["The street lights look stunning! Now go help Ananya with the modaks!"],
          GENERATOR_REPAIR: ["The surge tripped the generator! Reconnect the heavy cable and pull the starter cord!"]
        }
      }),
      new NPC({
        id: 'child',
        name: 'Ananya',
        spriteKey: 'CHILD_SPRITE',
        x: 1670,
        dialogues: {
          COOK_MODAKS: ["Let's prepare sweet steamed modaks with coconut and jaggery for Bappa!"],
          default: ["Ganpati Bappa Morya! I love making modaks for Bappa!"]
        }
      })
    ];

    // Cinematic State Trackers
    this.lightUpCinematic = { active: false, timer: 0 };
    this.ganeshaRevealCinematic = { active: false, timer: 0, stage: 0 };
    this.powerRestorationCinematic = { active: false, timer: 0 };
    this.mandapamCollapseCinematic = { active: false, timer: 0, shookAgain: false };
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
    this.stormProtection = new StormProtection(
      () => {
        this.game.missions.setProgress(4); // completes STORM_PROTECT
        achievementSystem.unlock('storm_guardian');
        this.triggerGeneratorFailure();
      },
      () => {
        this.triggerMandapamCollapse();
      }
    );

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
      this.game.missions.setProgress(1); // completes COOK_MODAKS
      this.player.canMove = true;
      audioManager.playSuccess();
      achievementSystem.unlock('chef_of_bappa');
      this.dialogueCooldown = 0.3;
      this.game.dialogue.start('Ananya', [
        "Yay! These holy modaks smell so fragrant and delicious!",
        "Look towards the pandal! Lord Ganesha's sacred arrival is beginning!"
      ], () => {
        this.startGaneshaRevealCinematic();
      });
    });

    // 9. Maha Aarti Ritual (Manual mission after generator repair)
    this.aartiRitual = new AartiRitual(() => {
      this.game.missions.setProgress(1); // completes AARTI_RITUAL
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

    this.decorationsCollector.game = this.game;
    this.stormProtection.game = this.game;
  }

  enter() {
    this.game.camera.setBounds(0, 3000, 0, 950);
    this.game.camera.releaseScripted();
    this.game.camera.follow(this.player, this.game.input.isMobile);
    this.game.camera.x = this.game.camera.targetX;
    this.game.camera.y = this.game.camera.targetY;
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

  exit() { }

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
      this.game.particles.emitRain(this.game.camera.x, 360, this.game.virtualWidth, this.game.virtualHeight, 18);
      if (Math.random() < 0.008) {
        this.game.particles.emitLightning();
        audioManager.playThunder();
        this.game.camera.shake(12, 0.5);
      }
    } else {
      if (Math.random() < 0.1) {
        this.game.particles.emitPetals(this.game.camera.x + (Math.random() - 0.5) * this.game.virtualWidth, 100, 2);
      }
    }

    // Handle Active Mini-games with modal input proxy
    const modalInput = this.game && typeof this.game.getModalInputProxy === 'function'
      ? this.game.getModalInputProxy(input)
      : input;

    if (this.bambooMinigame.active) {
      this.bambooMinigame.update(dt, modalInput, this.game.particles);
      if (!this.bambooMinigame.active && !this.game.dialogue.active) {
        this.player.canMove = true;
      }
      return;
    }
    if (this.flowerMinigame.active) {
      this.flowerMinigame.update(dt, modalInput, this.game.particles);
      if (!this.flowerMinigame.active && !this.game.dialogue.active) {
        this.player.canMove = true;
      }
      return;
    }
    if (this.wiringMinigame.active) {
      this.wiringMinigame.update(dt, modalInput, this.game.particles);
      if (!this.wiringMinigame.active && !this.game.dialogue.active) {
        this.player.canMove = true;
      }
      return;
    }
    if (this.generatorMinigame.active) {
      this.generatorMinigame.update(dt, modalInput, this.game.particles);
      if (!this.generatorMinigame.active && !this.game.dialogue.active) {
        this.player.canMove = true;
      }
      return;
    }
    if (this.liftMinigame.active) {
      this.liftMinigame.update(dt, modalInput, this.game.particles, this.game.camera);
      if (!this.liftMinigame.active && !this.game.dialogue.active) {
        this.player.canMove = true;
      }
      return;
    }
    if (this.modakMinigame.active) {
      this.modakMinigame.update(dt, modalInput, this.game.particles);
      if (!this.modakMinigame.active && !this.game.dialogue.active) {
        this.player.canMove = true;
      }
      return;
    }
    if (this.aartiRitual.active) {
      this.aartiRitual.update(dt, modalInput, this.game.particles);
      if (!this.aartiRitual.active && !this.game.dialogue.active) {
        this.player.canMove = true;
      }
      return;
    }
    if (this.mandapamCollapseCinematic.active) {
      this.updateMandapamCollapseCinematic(dt);
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
      this.game.camera.follow(this.player, this.game.input.isMobile);
      return;
    }

    // Normal Gameplay Exploration
    this.player.update(dt, input);

    // Determine if Mandapam currently has active work for the player
    const currentMission = this.game.missions.currentMissionId;
    const isMinigameActive = this.isMinigameActive();
    const isDialogueActive = this.game.dialogue && this.game.dialogue.active;

    const isMobile = this.game.input.isMobile;
    const actKey = isMobile ? 'ACT' : 'E';
    let mandapamHasWork = false;
    let mandapamLabel = '';

    if (!isMinigameActive && !isDialogueActive) {
      if (currentMission === 'BUILD_MANDAPAM' && this.mandapam.state === 'empty') {
        mandapamHasWork = true;
        mandapamLabel = `[${actKey}] BUILD`;
      } else if (currentMission === 'AARTI_RITUAL') {
        mandapamHasWork = true;
        mandapamLabel = `[${actKey}] AARTI`;
      } else if (currentMission === 'SYNCHRONIZED_LIFT') {
        mandapamHasWork = true;
        mandapamLabel = `[${actKey}] LIFT`;
      }
    }

    this.mandapam.setWorkState(mandapamHasWork, mandapamLabel);
    this.mandapam.update(dt, this.player.x);
    this.ganesha.update(dt);

    this.npcs.forEach(npc => {
      if (currentMission === 'DECORATE_MANDAPAM') {
        const hasItem = (npc.id === 'flower_seller' && !this.decorationsCollector.isItemCollected('flowers')) ||
          (npc.id === 'uncle' && !this.decorationsCollector.isItemCollected('banners')) ||
          (npc.id === 'electrician' && !this.decorationsCollector.isItemCollected('lights'));
        npc.setPrompt(hasItem ? null : `[${actKey}] TALK`);
      } else if (currentMission === 'COOK_MODAKS' && npc.id === 'child') {
        npc.setPrompt(`[${actKey}] COOK MODAKS`);
      } else if (currentMission === 'FLOWER_PUZZLE' && npc.id === 'flower_seller') {
        npc.setPrompt(`[${actKey}] WEAVE`);
      } else if (currentMission === 'ELECTRICAL_WIRING' && npc.id === 'electrician') {
        npc.setPrompt(`[${actKey}] WIRE`);
      } else {
        npc.setPrompt(`[${actKey}] TALK`);
      }
      npc.update(dt, this.player.x);
    });

    this.game.camera.follow(this.player, this.game.input.isMobile);

    // Contextual Interactions
    this.handleInteractions(input);
  }

  handleInteractions(input) {
    if (!input.interactPressed || this.dialogueCooldown > 0) return;

    const currentMission = this.game.missions.currentMissionId;

    // 1. Mandapam Interaction (only when work is required)
    if (this.mandapam.isNearPlayer) {
      if (currentMission === 'BUILD_MANDAPAM' && this.mandapam.state === 'empty' && !this.bambooMinigame.active) {
        this.player.canMove = false;
        this.bambooMinigame.start();
        return;
      }
      if (currentMission === 'AARTI_RITUAL' && !this.aartiRitual.active) {
        this.player.canMove = false;
        this.aartiRitual.start();
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

    // 3. Decorations Collection Items (Never open dialogue while picking up items!)
    if (currentMission === 'DECORATE_MANDAPAM') {
      for (const item of this.decorationsCollector.items) {
        if (!item.collected && Math.abs(this.player.x - item.x) < 85) {
          this.decorationsCollector.collect(item.id, this.game.particles);
          return;
        }
      }

      for (const npc of this.npcs) {
        if (npc.isNearPlayer) {
          let itemCollected = false;
          if (npc.id === 'flower_seller' && !this.decorationsCollector.isItemCollected('flowers')) {
            this.decorationsCollector.collect('flowers', this.game.particles);
            itemCollected = true;
          } else if (npc.id === 'uncle' && !this.decorationsCollector.isItemCollected('banners')) {
            this.decorationsCollector.collect('banners', this.game.particles);
            itemCollected = true;
          } else if (npc.id === 'electrician' && !this.decorationsCollector.isItemCollected('lights')) {
            this.decorationsCollector.collect('lights', this.game.particles);
            itemCollected = true;
          }

          if (itemCollected) {
            return; // Item collected from NPC: DO NOT OPEN DIALOGUE!
          }
        }
      }
      return; // Do not open general dialogue during decorations gathering
    }

    // 4. NPC Interactions
    for (const npc of this.npcs) {
      if (npc.isNearPlayer) {
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
          if (currentMission === 'COOK_MODAKS' && !this.modakMinigame.active) {
            this.player.canMove = false;
            this.modakMinigame.start();
            return;
          }
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
      // Finish light-up and guide to young Ananya for Modak cooking!
      this.lightUpCinematic.active = false;
      this.player.canMove = true;
      this.game.camera.releaseScripted();
      this.game.missions.start('COOK_MODAKS');
      this.game.dialogue.start('Electrician', [
        "The wiring is complete! Look how brilliantly the whole street shines!",
        "Now visit young Ananya down the street to prepare the sacred Modaks for Lord Ganesha!"
      ]);
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
      this.player.canMove = true;
      this.game.missions.start('AARTI_RITUAL');
      this.game.dialogue.start('Festival Uncle', [
        "The power is restored! The mandapam shines bright once more!",
        "Now step up to the mandapam to begin the grand Maha Aarti!"
      ]);
    }
  }

  triggerMandapamCollapse() {
    this.mandapamCollapseCinematic.active = true;
    this.mandapamCollapseCinematic.timer = 0;
    this.mandapamCollapseCinematic.shookAgain = false;
    this.player.canMove = false;

    // Pan camera dramatically to the mandapam
    this.game.camera.panTo(1400, 480, 1.35, 0.08);
    this.game.camera.shake(35, 2.5);

    // Audio SFX
    audioManager.playThunder();
    audioManager.playSpark();
    audioManager.playSnap();

    // Trigger mandapam entity collapse
    this.mandapam.triggerCollapse();

    // Burst initial debris & dust
    this.game.particles.emitCollapseDust(1400, 520, 40);
    this.game.particles.emitDebris(1400, 480, 35);
    this.game.particles.emitLightning();
  }

  updateMandapamCollapseCinematic(dt) {
    this.mandapamCollapseCinematic.timer += dt;
    const t = this.mandapamCollapseCinematic.timer;

    // Continuous secondary dust & debris during collapse
    if (t < 2.2 && Math.random() < 0.45) {
      const offsetX = (Math.random() - 0.5) * 180;
      this.game.particles.emitCollapseDust(1400 + offsetX, 525, 6);
      if (Math.random() < 0.3) {
        this.game.particles.emitDebris(1400 + offsetX, 500, 4);
        audioManager.playSnap();
      }
    }

    if (t > 0.8 && t < 1.0 && !this.mandapamCollapseCinematic.shookAgain) {
      this.mandapamCollapseCinematic.shookAgain = true;
      this.game.camera.shake(25, 1.2);
      audioManager.playThunder();
      this.game.particles.emitSparks(1400, 460, 20);
    }

    // After 4.0 seconds, cleanly restart the game
    if (t >= 4.0) {
      this.mandapamCollapseCinematic.active = false;
      SaveSystem.reset();
      window.location.reload();
    }
  }

  // --- RENDER ---

  render(ctx) {
    // 1. Sky & Celestial
    this.game.dayNight.renderSky(ctx, this.game.virtualWidth, this.game.virtualHeight);

    // 2. Parallax background
    this.game.parallax.renderBackground(ctx, this.game.camera);

    // 3. World Entities (In Camera Coordinates)
    this.game.camera.begin(ctx);

    // Authentic Street Road Ground
    this.game.parallax.renderGround(ctx, this.game.camera);

    // Buildings & Props
    this.game.assetRegistry.draw(ctx, 'HOUSE_SPRITE', 450, 540, 220, 200, '1');
    this.game.assetRegistry.draw(ctx, 'HOUSE_SPRITE', 950, 540, 220, 200, '2');
    this.game.assetRegistry.draw(ctx, 'TEMPLE_SPRITE', 1800, 540, 260, 280);
    this.game.assetRegistry.draw(ctx, 'GENERATOR_SPRITE', 2100, 540, 70, 55, this.generatorState);

    // Sacred Mandapam & Ganesha
    this.mandapam.render(ctx);
    this.ganesha.render(ctx);

    // Rangoli Road Art (Drawn directly in front of each house and landmark on the road!)
    const roadRangolis = [
      { x: 450, y: 576, w: 135, h: 54, pattern: '1' }, // Directly in front of House 1 entrance!
      { x: 950, y: 576, w: 135, h: 54, pattern: '2' }, // Directly in front of House 2 entrance!
      { x: 1400, y: 585, w: 145, h: 58, pattern: '1' }, // Grand road rangoli in front of Mandapam!
      { x: 1800, y: 576, w: 140, h: 56, pattern: '3' }  // Directly in front of Temple entrance!
    ];
    roadRangolis.forEach(r => {
      this.game.assetRegistry.draw(ctx, 'RANGOLI_ART', r.x, r.y, r.w, r.h, r.pattern, 1, this.game.dayNight.time);
    });

    // Hanging Festive Kandil Lanterns from eaves
    this.game.assetRegistry.draw(ctx, 'KANDIL_LANTERN', 390, 365, 36, 75, 'gold', 1, this.game.dayNight.time);
    this.game.assetRegistry.draw(ctx, 'KANDIL_LANTERN', 510, 365, 36, 75, 'pink', 1, this.game.dayNight.time);
    this.game.assetRegistry.draw(ctx, 'KANDIL_LANTERN', 890, 365, 36, 75, 'pink', 1, this.game.dayNight.time);
    this.game.assetRegistry.draw(ctx, 'KANDIL_LANTERN', 1010, 365, 36, 75, 'gold', 1, this.game.dayNight.time);
    this.game.assetRegistry.draw(ctx, 'KANDIL_LANTERN', 1740, 315, 42, 85, 'gold', 1, this.game.dayNight.time);
    this.game.assetRegistry.draw(ctx, 'KANDIL_LANTERN', 1860, 315, 42, 85, 'pink', 1, this.game.dayNight.time);

    // Ornate Streetlamps along walkway (only lit during night, twilight, or storm)
    const isNight = this.game.dayNight.isNight();
    const streetLampX = [350, 800, 1250, 1600, 1950, 2300];
    streetLampX.forEach(lx => {
      this.game.assetRegistry.draw(ctx, 'STREET_LAMP', lx, 540, 32, 180, isNight ? 'lit' : 'unlit', 1, this.game.dayNight.time);
    });

    // Street NPCs
    this.npcs.forEach(npc => npc.render(ctx));

    // Player
    this.player.render(ctx);

    // Dynamic Atmospheric Particles (In World space)
    this.game.particles.render(ctx);

    // Visible decoration items in world during Mission 3
    this.decorationsCollector.renderWorldPickups(ctx, this.player.x);

    // Active Quest Objective Pointers
    this.renderQuestPointers(ctx);

    // Storm hazard hotspots if mission active
    this.stormProtection.renderWorldHotspots(ctx);

    this.game.camera.end(ctx);

    // 4. Foreground Parallax (Festoon torans hanging from roofs across street)
    this.game.parallax.renderForeground(ctx, this.game.camera);

    // 5. Lighting / Darkness Pass (Night Lamp Glows)
    const ambientDark = this.game.dayNight.getAmbientDarkness();
    this.game.lighting.clear();
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

    // Mini-game Full Modals (Centered dynamically with full-screen dark backdrops)
    this.renderMinigameModal(ctx, this.bambooMinigame);
    this.renderMinigameModal(ctx, this.flowerMinigame);
    this.renderMinigameModal(ctx, this.wiringMinigame);
    this.renderMinigameModal(ctx, this.generatorMinigame);
    this.renderMinigameModal(ctx, this.liftMinigame);
    this.renderMinigameModal(ctx, this.modakMinigame);
    this.renderMinigameModal(ctx, this.aartiRitual);

    // Dialogue Box
    this.game.dialogue.render(ctx);

    // Modals (Settings, Credits, Pause)
    this.game.ui.renderModals(ctx);

    // Mandapam Collapse Dramatic Failure Overlay
    if (this.mandapamCollapseCinematic.active) {
      this.renderMandapamCollapseOverlay(ctx);
    }
  }

  renderMinigameModal(ctx, minigame) {
    if (!minigame || !minigame.active) return;
    if (this.game && typeof this.game.renderCenteredModal === 'function') {
      this.game.renderCenteredModal(ctx, () => minigame.render(ctx));
    } else {
      minigame.render(ctx);
    }
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
      (this.mandapamCollapseCinematic && this.mandapamCollapseCinematic.active) ||
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
    } else if (currentMission === 'DECORATE_MANDAPAM') {
      const uncollected = this.decorationsCollector.items.find(i => !i.collected);
      if (uncollected) {
        targetX = uncollected.x;
        targetName = uncollected.name;
      } else {
        targetX = 1400;
        targetName = 'Mandapam (Finish)';
      }
    } else if (currentMission === 'ELECTRICAL_WIRING') {
      targetX = 2160;
      targetName = 'Electrician';
    } else if (currentMission === 'COOK_MODAKS') {
      targetX = 1670;
      targetName = 'Ananya (Modaks)';
    } else if (currentMission === 'GANESHA_REVEAL') {
      targetX = 1400;
      targetName = 'Mandapam (Ganesha)';
    } else if (currentMission === 'STORM_PROTECT') {
      targetX = 1400;
      targetName = 'Mandapam Tarps';
    } else if (currentMission === 'GENERATOR_REPAIR') {
      targetX = 2100;
      targetName = 'Generator';
    } else if (currentMission === 'AARTI_RITUAL') {
      targetX = 1400;
      targetName = 'Mandapam (Maha Aarti)';
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
      const cx = this.game.virtualWidth / 2;
      const chipX = cx - chipW / 2;
      // chipY = 94: safely below minimap (ends y:64) and SPRINT badge (ends y:86)
      const chipY = 94;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      this._roundRect(ctx, chipX, chipY, chipW, chipH, 15);
      ctx.fill();
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 1.5;
      this._roundRect(ctx, chipX, chipY, chipW, chipH, 15);
      ctx.stroke();

      ctx.fillStyle = '#ffd54f';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, cx, chipY + chipH / 2);
      ctx.restore();
    }
  }


  // Cross-browser safe rounded rectangle path (no ctx.roundRect dependency)
  _roundRect(ctx, x, y, w, h, r) {
    const maxR = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + maxR, y);
    ctx.lineTo(x + w - maxR, y);
    ctx.arcTo(x + w, y, x + w, y + maxR, maxR);
    ctx.lineTo(x + w, y + h - maxR);
    ctx.arcTo(x + w, y + h, x + w - maxR, y + h, maxR);
    ctx.lineTo(x + maxR, y + h);
    ctx.arcTo(x, y + h, x, y + h - maxR, maxR);
    ctx.lineTo(x, y + maxR);
    ctx.arcTo(x, y, x + maxR, y, maxR);
    ctx.closePath();
  }

  renderGoHereIndicator(ctx, targetX, targetY, label, isUrgent = false) {
    if (!Number.isFinite(targetX) || !Number.isFinite(targetY) || !label) return;

    const t = Number.isFinite(this.animTime) ? this.animTime : (performance.now() / 1000);

    // Dynamic bouncy jumping physics
    const jumpFreq = 5.2;
    const bounceCycle = (t * jumpFreq) % Math.PI;
    const jumpProgress = Math.sin(bounceCycle);
    const jumpHeight = 22;
    const jumpY = -jumpProgress * jumpHeight;
    const isNearGround = jumpProgress < 0.15;
    const squashX = isNearGround ? 1.25 : 0.95;
    const squashY = isNearGround ? 0.75 : 1.05;

    ctx.save();

    // 1. Beacon ring at target
    const beaconR = 15 + Math.sin(t * 4) * 4;
    ctx.strokeStyle = isUrgent ? 'rgba(239, 68, 68, 0.75)' : 'rgba(255, 193, 7, 0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(targetX, targetY, beaconR, beaconR * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Bouncing downward arrow
    const tipY = targetY - 10 + jumpY;
    const arrowGrad = ctx.createLinearGradient(targetX, tipY - 26, targetX, tipY + 1);
    if (isUrgent) {
      arrowGrad.addColorStop(0, '#fca5a5');
      arrowGrad.addColorStop(0.5, '#ef4444');
      arrowGrad.addColorStop(1, '#991b1b');
    } else {
      arrowGrad.addColorStop(0, '#fff59d');
      arrowGrad.addColorStop(0.4, '#ffb300');
      arrowGrad.addColorStop(1, '#e65100');
    }
    ctx.fillStyle = arrowGrad;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(targetX, tipY);
    ctx.lineTo(targetX - 13 * squashX, tipY - 14 * squashY);
    ctx.lineTo(targetX - 6 * squashX, tipY - 14 * squashY);
    ctx.lineTo(targetX - 6 * squashX, tipY - 24 * squashY);
    ctx.lineTo(targetX + 6 * squashX, tipY - 24 * squashY);
    ctx.lineTo(targetX + 6 * squashX, tipY - 14 * squashY);
    ctx.lineTo(targetX + 13 * squashX, tipY - 14 * squashY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Floating badge above arrow
    const tagTitle = isUrgent ? '! SECURE HERE' : '* GO HERE *';
    const tagSub = String(label).toUpperCase();
    ctx.font = 'bold 11px sans-serif';
    const w1 = ctx.measureText(tagTitle).width;
    const w2 = ctx.measureText(tagSub).width;
    const pillW = Math.max(96, Math.max(w1, w2) + 26);
    const pillH = 36;
    const pillX = targetX - pillW / 2;
    const badgeY = tipY - 32;
    const pillTop = badgeY - pillH;

    // Outer pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
    this._roundRect(ctx, pillX, pillTop, pillW, pillH, 8);
    ctx.fill();
    ctx.strokeStyle = isUrgent ? '#ef4444' : '#ffd54f';
    ctx.lineWidth = 2;
    this._roundRect(ctx, pillX, pillTop, pillW, pillH, 8);
    ctx.stroke();

    // Top colour accent bar
    ctx.fillStyle = isUrgent ? '#b91c1c' : '#f59e0b';
    this._roundRect(ctx, pillX + 1, pillTop + 1, pillW - 2, 14, 7);
    ctx.fill();

    // Title text
    ctx.fillStyle = isUrgent ? '#ffffff' : '#1e1b4b';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tagTitle, targetX, pillTop + 8);

    // Label text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(tagSub, targetX, pillTop + 24);

    ctx.restore();
  }


  renderQuestPointers(ctx) {
    if (this.isMinigameActive() || (this.game.dialogue && this.game.dialogue.active)) return;

    // GO HERE floats 50px above the target — just above the [ACT] action prompt
    const GO_HERE_OFFSET = 50;
    const isMobile = this.game.input.isMobile;
    const actKey = isMobile ? 'ACT' : 'E';

    try {
      const currentMission = this.game.missions.currentMissionId;

      // ── BUILD MANDAPAM ──────────────────────────────────────────────────────
      if (currentMission === 'BUILD_MANDAPAM') {
        // Point to NPC (Festival Uncle) first, then mandapam when near Uncle
        const activeNPC = this.getActiveStoryNPC();
        if (activeNPC) {
          const isNear = Math.abs(this.player.x - activeNPC.x) < 85;
          const label = isNear ? `[${actKey}] TALK` : activeNPC.label;
          this.renderGoHereIndicator(ctx, activeNPC.x, activeNPC.y - GO_HERE_OFFSET, label);
        }
        // Also show on the mandapam frame as the action site
        this.renderGoHereIndicator(ctx, 1400, 540 - GO_HERE_OFFSET, 'Mandapam Frame');
      }

      // ── FLOWER PUZZLE ────────────────────────────────────────────────────────
      else if (currentMission === 'FLOWER_PUZZLE') {
        const activeNPC = this.getActiveStoryNPC();
        if (activeNPC) {
          const isNear = Math.abs(this.player.x - activeNPC.x) < 85;
          const label = isNear ? `[${actKey}] TALK` : activeNPC.label;
          this.renderGoHereIndicator(ctx, activeNPC.x, activeNPC.y - GO_HERE_OFFSET, label);
        }
      }

      // ── DECORATE MANDAPAM ────────────────────────────────────────────────────
      else if (currentMission === 'DECORATE_MANDAPAM') {
        if (this.decorationsCollector.isComplete()) {
          // All collected → point to Festival Uncle to deliver
          const activeNPC = this.getActiveStoryNPC();
          if (activeNPC) {
            const isNear = Math.abs(this.player.x - activeNPC.x) < 85;
            const label = isNear ? `[${actKey}] TALK` : activeNPC.label;
            this.renderGoHereIndicator(ctx, activeNPC.x, activeNPC.y - GO_HERE_OFFSET, label);
          }
        } else {
          // Show GO HERE over every uncollected decoration item
          this.decorationsCollector.items.forEach(item => {
            if (!item.collected) {
              this.renderGoHereIndicator(ctx, item.x, item.y - GO_HERE_OFFSET, item.name);
            }
          });
        }
      }

      // ── ELECTRICAL WIRING ────────────────────────────────────────────────────
      else if (currentMission === 'ELECTRICAL_WIRING') {
        const activeNPC = this.getActiveStoryNPC();
        if (activeNPC) {
          const isNear = Math.abs(this.player.x - activeNPC.x) < 85;
          const label = isNear ? `[${actKey}] TALK` : activeNPC.label;
          this.renderGoHereIndicator(ctx, activeNPC.x, activeNPC.y - GO_HERE_OFFSET, label);
        }
      }

      // ── COOK MODAKS ──────────────────────────────────────────────────────────
      else if (currentMission === 'COOK_MODAKS') {
        const activeNPC = this.getActiveStoryNPC();
        if (activeNPC) {
          const isNear = Math.abs(this.player.x - activeNPC.x) < 85;
          const label = isNear ? `[${actKey}] TALK` : activeNPC.label;
          this.renderGoHereIndicator(ctx, activeNPC.x, activeNPC.y - GO_HERE_OFFSET, label);
        }
      }

      // ── GANESHA REVEAL ───────────────────────────────────────────────────────
      else if (currentMission === 'GANESHA_REVEAL') {
        const activeNPC = this.getActiveStoryNPC();
        if (activeNPC) {
          const isNear = Math.abs(this.player.x - activeNPC.x) < 85;
          const label = isNear ? `[${actKey}] TALK` : activeNPC.label;
          this.renderGoHereIndicator(ctx, activeNPC.x, activeNPC.y - GO_HERE_OFFSET, label);
        }
        this.renderGoHereIndicator(ctx, 1400, 480 - GO_HERE_OFFSET, 'Lord Ganesha');
      }

      // ── STORM PROTECT ────────────────────────────────────────────────────────
      else if (currentMission === 'STORM_PROTECT') {
        const unfastened = this.stormProtection.hotspots.filter(h => !h.secured);
        unfastened.forEach(h => {
          this.renderGoHereIndicator(ctx, h.x, h.y - GO_HERE_OFFSET, h.name, true);
        });
      }

      // ── GENERATOR REPAIR ─────────────────────────────────────────────────────
      else if (currentMission === 'GENERATOR_REPAIR') {
        const activeNPC = this.getActiveStoryNPC();
        if (activeNPC) {
          const isNear = Math.abs(this.player.x - activeNPC.x) < 85;
          const label = isNear ? `[${actKey}] TALK` : activeNPC.label;
          this.renderGoHereIndicator(ctx, activeNPC.x, activeNPC.y - GO_HERE_OFFSET, label);
        }
        this.renderGoHereIndicator(ctx, 2100, 480 - GO_HERE_OFFSET, 'Generator');
      }

      // ── AARTI RITUAL ─────────────────────────────────────────────────────────
      else if (currentMission === 'AARTI_RITUAL') {
        const activeNPC = this.getActiveStoryNPC();
        if (activeNPC) {
          const isNear = Math.abs(this.player.x - activeNPC.x) < 85;
          const label = isNear ? `[${actKey}] TALK` : activeNPC.label;
          this.renderGoHereIndicator(ctx, activeNPC.x, activeNPC.y - GO_HERE_OFFSET, label);
        }
        this.renderGoHereIndicator(ctx, 1400, 540 - GO_HERE_OFFSET, 'Maha Aarti');
      }

      // ── SYNCHRONIZED LIFT ────────────────────────────────────────────────────
      else if (currentMission === 'SYNCHRONIZED_LIFT') {
        const activeNPC = this.getActiveStoryNPC();
        if (activeNPC) {
          const isNear = Math.abs(this.player.x - activeNPC.x) < 85;
          const label = isNear ? `[${actKey}] TALK` : activeNPC.label;
          this.renderGoHereIndicator(ctx, activeNPC.x, activeNPC.y - GO_HERE_OFFSET, label);
        }
        this.renderGoHereIndicator(ctx, 1400, 540 - GO_HERE_OFFSET, 'Lift Palanquin');
      }

    } catch (err) {
      console.error('Quest pointer render error:', err);
    }
  }


  // --- MANDAPAM COLLAPSE FAILURE CINEMATIC ---

  startMandapamCollapseCinematic() {
    this.mandapamCollapseCinematic.active = true;
    this.mandapamCollapseCinematic.timer = 0;
    this.player.canMove = false;

    // Trigger dramatic collapse audio
    audioManager.playStormAmbience();
    audioManager.playThunder();

    // Trigger massive dust and debris explosion from the mandapam
    this.game.particles.emitCollapseDust(1400, 520, 70);
    this.game.particles.emitDebris(1400, 500, 45);
    this.game.camera.shake(25, 2.5);
  }

  renderMandapamCollapseOverlay(ctx) {
    const t = this.mandapamCollapseCinematic.timer;
    const alpha = Math.min(1, t * 1.5);
    const vw = this.game.virtualWidth;
    const vh = this.game.virtualHeight;
    const cx = vw / 2;
    const cy = vh / 2;

    ctx.save();
    // Dramatic red storm vignette
    const vigGrad = ctx.createRadialGradient(cx, cy, 200, cx, cy, Math.max(cx, cy));
    vigGrad.addColorStop(0, 'rgba(183, 28, 28, 0)');
    vigGrad.addColorStop(1, `rgba(183, 28, 28, ${Math.min(0.7, t * 0.35)})`);
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, vw, vh);

    ctx.globalAlpha = alpha;
    // Dark Red Card
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.beginPath();
    ctx.roundRect(cx - 310, cy - 120, 620, 190, 16);
    ctx.fill();
    ctx.strokeStyle = '#ff1744';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Red alert banner header
    ctx.fillStyle = '#b71c1c';
    ctx.beginPath();
    ctx.roundRect(cx - 310, cy - 120, 620, 52, [16, 16, 0, 0]);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ MANDAPAM HAS COLLAPSED! ⚡', cx, cy - 85);

    ctx.fillStyle = '#ffd54f';
    ctx.font = '16px sans-serif';
    ctx.fillText('The fierce squall broke the bamboo supports and tore the canopy!', cx, cy - 30);

    ctx.fillStyle = '#cfd8dc';
    ctx.font = '14px sans-serif';
    ctx.fillText('The festival cannot continue without Lord Ganesha\'s pandal.', cx, cy);

    const countdown = Math.max(1, Math.ceil(4.0 - t));
    ctx.fillStyle = '#ff8a80';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`Restarting quest in ${countdown}...`, cx, cy + 40);

    ctx.restore();

    // Fade to black in final 0.8s
    if (t > 3.2) {
      const fade = (t - 3.2) / 0.8;
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(1, fade)})`;
      ctx.fillRect(0, 0, vw, vh);
    }
  }
}
