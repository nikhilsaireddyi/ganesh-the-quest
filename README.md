# 🪔 GANESH: THE QUEST

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=for-the-badge)](LICENSE)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas_2D-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Web Audio API](https://img.shields.io/badge/Web_Audio-Procedural_Synth-8A2BE2?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Responsive](https://img.shields.io/badge/Platform-Desktop_%7C_Mobile_%7C_Tablet-brightgreen.svg?style=for-the-badge)]()
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero_Runtime-blueviolet.svg?style=for-the-badge)]()

<br />

**A Festival. A Journey. A Homecoming.**

*An atmospheric, story-driven 2.5D cultural festival adventure game built with pure Canvas 2D and real-time procedural Web Audio.*

[Play Demo](#-quickstart) • [Game Features](#-core-features) • [Quest Progression](#-narrative-questline) • [Technical Architecture](#-technical-architecture) • [Controls](#-controls)

---

</div>

## 🌟 Overview

**Ganesh: The Quest** is a cultural adventure game celebrating community, devotion, and festive spirit during Ganesh Chaturthi. Players walk through a lively Indian festival street, assembling the bamboo pandal, weaving flower garlands, stringing fairy lights, cooking sweet modaks, overcoming an emergency storm, performing the sacred Maha Aarti, and leading the grand musical immersion procession.

Engineered from scratch with **zero third-party game frameworks** (no Phaser, no Pixi), running at a locked **60 FPS** on both desktop browsers and mobile touch screens with a fully custom lightweight engine.

---

## ✨ Core Features

<table>
  <tr>
    <td width="50%">
      <h3>🎨 Custom 2.5D Canvas Engine</h3>
      <ul>
        <li><b>Pure Canvas 2D rendering</b> with sub-pixel camera interpolation and smooth zoom.</li>
        <li><b>Multi-depth Parallax System</b> with distant silhouettes, midground clay-roofed homes, and foreground festive torans.</li>
        <li><b>Dynamic 2.5D Lighting System</b> supporting ambient darkness passes, point-light blooms, and glowing festival lamps.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🎵 Procedural Web Audio Engine</h3>
      <ul>
        <li><b>Zero audio file dependencies</b>: 100% synthesized in real-time via Web Audio API oscillators and noise buffers.</li>
        <li>Resonant <b>temple brass bells</b>, booming <b>dhol-tasha drums</b>, thunderstorm strikes, electric spark zaps, and meditative <b>bansuri flute</b> melodies.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📱 Adaptive Dual Input System</h3>
      <ul>
        <li><b>Desktop</b>: Seamless keyboard navigation with <code>A / D / Arrow Keys</code>, sprint with <code>Shift</code>, and interaction with <code>E / Space</code>.</li>
        <li><b>Mobile & Touch Screens</b>: Dynamic on-screen D-Pad (<code>◀</code> <code>▶</code>), tactile <code>RUN</code> and <code>ACT</code> buttons, and safe bottom gesture clearance.</li>
        <li><b>Dynamic Screen Adaptation</b>: Scales seamlessly across 16:9, 20:9 mobile screens, tablets, and ultra-wide displays without black bars.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🌦️ Day-Night & Weather Simulation</h3>
      <ul>
        <li>Real-time atmospheric transitions: <b>Day ➔ Golden Sunset ➔ Twilight ➔ Midnight Lantern Glow</b>.</li>
        <li>Sudden thunderstorm crisis simulation with randomized sheet lightning, screen shake, and wind-blown rain particles.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📸 Festival Photo Mode & Scrapbook</h3>
      <ul>
        <li>In-game camera viewfinder with customizable filters: <i>Festive Vibrant</i>, <i>Golden Hour</i>, <i>Vintage Sepia</i>, and <i>Dramatic Monochrome</i>.</li>
        <li>Flash animation, timestamp watermarks, and an interactive personal photo album.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🏆 Cultural Achievements & Wardrobe</h3>
      <ul>
        <li>10+ unlockable cultural trophies tracking mastery across crafting, cooking, and ritual milestones.</li>
        <li>Interactive festive wardrobe featuring traditional Kurta styles: <i>Saffron Sunrise</i>, <i>Royal Marigold</i>, <i>Peacock Teal</i>, and <i>Crimson Festival</i>.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🗺️ Narrative Questline & Minigames

The journey unfolds across an episodic 8–12 minute narrative arc:

```
[ Title Screen ]
       │
       ▼
[ Cinematic Street Intro ] ────────── Neighborhood walkthrough to empty pandal
       │
       ▼
[ Mission 1: Build the Mandapam ] ── Assemble bamboo support struts & trusses
       │
       ▼
[ Mission 2: Flower Garland ] ────── Weave marigold, rose, and lotus garland
       │
       ▼
[ Mission 3: Festival Decorations ] ─ Gather toran, banners, fairy lights & silk
       │
       ▼
[ Mission 4: Electrical Wiring ] ─── Terminal circuit matching mini-puzzle
       │
       ▼
[ Mission 5: Prepare Sacred Modaks ]  Cook steamed coconut & jaggery modaks
       │
       ▼
[ The Sacred Reveal ] ────────────── Multi-stage divine enshrinement of Lord Ganesha
       │
       ▼
[ The Storm Crisis ] ─────────────── 30s timed emergency: tie down loose tarps & lamps
       │
       ▼
[ Generator Failure & Repair ] ───── 3-step fix: cable, breaker switch, recoil pull
       │
       ▼
[ Mission 8: Maha Aarti Ritual ] ─── Ring auspicious brass bells & circle the diya lamp
       │
       ▼
[ Mission 9: Synchronized Lift ] ─── Devotees countdown: 3... 2... 1... LIFT!
       │
       ▼
[ The Grand Procession ] ────────── Street celebration with dhol drums, dancing & Gulal
       │
       ▼
[ Visarjan Ceremony ] ───────────── Peaceful twilight immersion at the sacred ghat
       │
       ▼
[ Homecoming Finale ] ───────────── "Every goodbye carries the promise of another beginning."
```

---

## 🎮 Controls

### 💻 Desktop / PC Controls
| Action | Primary Key | Secondary Key |
| :--- | :---: | :---: |
| **Move Left / Right** | `A` / `D` | `◀` / `▶` Arrow Keys |
| **Sprint / Fast Walk** | `Left Shift` | `Right Shift` |
| **Interact / Advance / Action** | `E` | `Spacebar` |
| **Celebrate Gulal Powder** | `Spacebar` | On-screen button |
| **Mini-game Actions** | `Mouse Left Click & Drag` | Direct Cursor |
| **Pause / Settings Menu** | `Escape` | On-screen button |

### 📱 Mobile & Tablet Controls
| Control | Touch Location | Function |
| :--- | :--- | :--- |
| **D-Pad Directional Arrows** | Bottom-Left | Smooth side-to-side character movement |
| **Sprint Button `[ ⚡ RUN ]`** | Bottom-Right (Upper) | Hold to sprint through the street |
| **Action Button `[ ACT ]`** | Bottom-Right (Lower) | Talk to NPCs, pick up items, trigger minigames |
| **Gulal Splash `[ 🎨 GULAL ]`** | Bottom-Right (Center) | Shower vibrant festive colors into the sky |
| **Interactive Mini-games** | Center Screen | Intuitive drag-and-drop & tap gestures |

---

## 🏗️ Technical Architecture

The codebase follows a modular, object-oriented design cleanly separating the rendering pipeline, physics, audio, and state management:

```
ganesh-the-quest/
├── src/
│   ├── assets/              # Asset Registry & Procedural Vector Fallbacks
│   │   └── AssetRegistry.js # Decoupled asset loader with canvas vector generators
│   ├── audio/               # Web Audio API Sound Engine
│   │   └── AudioManager.js  # Procedural synthesizer for bells, drums, storms, music
│   ├── core/                # Engine & Foundational Architecture
│   │   ├── Engine.js        # Core game loop (requestAnimationFrame, responsive DPR)
│   │   ├── Camera2D.js      # Smooth lerping camera, bounds clamping, screen shake
│   │   ├── InputManager.js  # Unified keyboard, mouse, and adaptive touch controls
│   │   ├── SaveSystem.js    # Persistent localStorage settings & progression
│   │   └── SceneManager.js  # Scene router with cross-fade transitions
│   ├── entities/            # World Game Entities
│   │   ├── Player.js        # Player physics, sprite state, wardrobe visuals
│   │   ├── NPC.js           # Street characters, proximity prompts, dialogues
│   │   ├── Mandapam.js      # Multi-stage evolving pandal (empty -> built -> lit)
│   │   └── Ganesha.js       # Sacred idol entity with divine aura & reveal stages
│   ├── minigames/           # Interactive Cultural Challenges
│   │   ├── BambooConstruction.js  # Structural bamboo snap puzzle
│   │   ├── FlowerPuzzle.js        # Garland pattern matching
│   │   ├── DecorationsCollector.js# Street exploration & item checklist
│   │   ├── ElectricalWiring.js    # Color-coded circuit connection puzzle
│   │   ├── ModakCooking.js        # Dough kneading, filling & steaming minigame
│   │   ├── StormProtection.js     # Timed storm emergency tie-down challenge
│   │   ├── GeneratorRepair.js     # 3-step physical generator rescue
│   │   ├── AartiRitual.js         # Interactive bell ringing & diya circular aarti
│   │   ├── SynchronizedLift.js    # Multi-devotee timing challenge
│   │   ├── DholRhythmGame.js      # Rhythm drum beat game
│   │   └── LezimDance.js          # Folk dance quick-time minigame
│   ├── scenes/              # Game Scenes
│   │   ├── TitleScene.js          # Atmospheric title screen with options
│   │   ├── CinematicIntroScene.js # Opening panning cinematic
│   │   ├── StreetScene.js         # Core exploration hub and crisis events
│   │   ├── ProcessionScene.js     # Grand street parade with crowds & music
│   │   ├── VisarjanScene.js       # Riverside immersion ceremony
│   │   └── EndingScene.js         # Poetic farewell cinematic
│   ├── systems/             # Rendering & Environmental Systems
│   │   ├── ParallaxSystem.js      # Multi-depth 2.5D scrolling backgrounds
│   │   ├── LightingSystem.js      # Dynamic 2D darkness mask & radial light blooms
│   │   ├── ParticleSystem.js      # Flowers, rain, sparks, smoke, confetti, gulal
│   │   ├── DayNightCycle.js       # Sun/Moon celestial arc & sky gradient interpolation
│   │   ├── MissionManager.js      # Central narrative quest state machine
│   │   └── AchievementSystem.js   # Cultural achievements & banner toast system
│   └── ui/                  # User Interface Overlays
│       ├── UIManager.js           # Dynamic HUD, Mini-Map, Settings & Pause modals
│       ├── DialogueBox.js         # Typewriter dialogue with character portraits
│       ├── PhotoMode.js           # Viewfinder camera, color filters & scrapbook
│       └── WardrobeManager.js     # Traditional Kurta outfit customizer
├── index.html               # Entry HTML shell
├── package.json             # Build configuration
└── vite.config.js           # Optimized Vite bundler setup
```

---

## 🎨 Asset Pipeline & Moddability (`AssetRegistry`)

All visual entities in **Ganesh: The Quest** utilize an **Abstract Asset Registry**. The game ships with complete procedural vector artwork rendered in real time, but also supports hot-swapping any element with custom PNG / WebP sprites or 3D renders (e.g. from Meshy or Blender):

| Asset Key | File Path | Fallback Procedural Render |
| :--- | :--- | :--- |
| `PLAYER_SPRITE` | `assets/characters/player/player.png` | Fully animated vector character with cloth physics |
| `UNCLE_SPRITE` | `assets/characters/festival_uncle/festival_uncle.png` | Traditional elder with kurta and angavastram |
| `FLOWER_SELLER_SPRITE` | `assets/characters/flower_seller/flower_seller.png` | Garland artisan with floral baskets |
| `ELECTRICIAN_SPRITE` | `assets/characters/electrician/electrician.png` | Street electrician with tool pouch |
| `CHILD_SPRITE` | `assets/characters/child/child.png` | Cheerful child with modak bowl |
| `GANESHA_SPRITE` | `assets/ganesha/ganesha_main/ganesha.png` | Detailed idol with crown, modak, trunk, and ornaments |
| `MANDAPAM_SPRITE` | `assets/environment/mandapam/mandapam.png` | Dynamic pandal: empty frame ➔ bamboo ➔ decorated ➔ illuminated |
| `TEMPLE_SPRITE` | `assets/environment/temple/temple.png` | Traditional Nagara-style stone temple with golden kalash |

Simply place custom images into their designated directories — `AssetRegistry` detects and loads them automatically!

---

## 🚀 Quickstart

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm` or `yarn`

### Setup & Run
```bash
# 1. Clone the repository
git clone https://github.com/nikhilsaireddyi/ganesh-the-quest.git
cd ganesh-the-quest

# 2. Install development dependencies
npm install

# 3. Start local development server with LAN support
npm run dev

# 4. Open in your browser (or scan the terminal QR code for mobile!)
http://localhost:5173/
```

### Production Build
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📜 License & Dedication

Distributed under the **MIT License**. See `LICENSE` for details.

> *Dedicated to the spirit of community, celebration, and devotion that unites millions across the world during Ganesh Chaturthi. May Lord Ganesha bestow wisdom, peace, and prosperity upon all.*
> 
> **Ganpati Bappa Morya! 🙏**
