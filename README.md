# GANESH: THE QUEST
## A Festival. A Journey. A Homecoming.

A cinematic 2D / 2.5D festival adventure game built for PC, Android/Mobile, and modern browsers. 

---

## 🎮 Game Progression

The game takes the player through an 8–12 minute interactive journey:

1. **Title Screen**: Ambient floating petals, divine golden aura, Title typography, and Settings.
2. **Cinematic Intro**: Slow street pan showcasing the neighborhood, houses, temple, and empty mandapam.
3. **Festival Street Hub**: Explorable street with NPCs (Festival Uncle, Flower Seller, Electrician, Child).
4. **Mission 1 — Bamboo Construction**: Drag-and-drop structural assembly with snapping feedback.
5. **Mission 2 — Flower Arrangement**: Sacred garland pattern matching (Marigold, Rose, Lotus, Genda, Mango leaf).
6. **Mission 3 — Festival Decorations**: Street collection quest (flowers, lights, banners, silk cloth, toran).
7. **Mission 4 — Electrical Wiring**: Terminal-to-terminal circuit connection puzzle.
8. **Mandapam Light-Up Cinematic**: Staged illumination from quiet twinkle to grand festival brilliance.
9. **Ganesha Reveal**: Sacred multi-stage reveal (darkness → silhouette → partial form → trunk & modak → eyes & crown → divine radiant aura).
10. **The Storm Crisis**: Sudden thunderstorm, dark clouds, wind, lightning, and screen shake.
11. **Protect the Mandapam**: 30-second timed mission to secure loose canopies, tarps, and lamps.
12. **Generator Failure & 3-Step Repair**: Blackout crisis followed by cable reconnection, breaker switch activation, and recoil cord pull.
13. **Power Restoration**: Staged surge of power restoring full festival lighting.
14. **Synchronized Lift**: Devotee timing challenge (3... 2... 1... LIFT!) and collective chant: *"Ganpati Bappa Morya!"*.
15. **Grand Procession**: Side-scrolling celebration with dancing crowds, dhol-tasha rhythms, flower showers, and Day → Sunset → Twilight → Night transition.
16. **Festival Night**: Animated celebration with fireworks bursts, glowing lanterns, and festive joy.
17. **Visarjan Ceremony**: Peaceful night at the sacred water ghat, moonlight reflections, water ripples, and gentle immersion.
18. **Final Cinematic & Ending Screen**: Silent water ripples, floating flowers, *"Every goodbye carries the promise of another beginning"*, and *"Ganpati Bappa Morya 🙏"*.

---

## 🕹️ Controls

### PC / Desktop
- **A / D** or **Left / Right Arrow Keys**: Move character
- **E** or **Spacebar**: Interact / Talk / Confirm / Action
- **Mouse Left Click & Drag**: Mini-game puzzles (drag bamboo, flowers, wires, pull cord)
- **Escape (ESC)**: Pause Menu / Settings

### Mobile / Android
- **Virtual Joystick** (Bottom-Left touch area): Analog movement
- **Interact Button** (Bottom-Right touch area): Interact / Talk / Confirm
- **Direct Touch Gestures**: Drag-and-drop support for all mini-games

---

## 🎨 Replaceable Asset System (`AssetRegistry`)

Gameplay logic is completely decoupled from visual assets. If you provide final 2D images or sprite sheets (such as from 3D Meshy renders), drop them into the appropriate folders in `assets/`:

- `assets/characters/player/player.png`
- `assets/characters/festival_uncle/festival_uncle.png`
- `assets/characters/flower_seller/flower_seller.png`
- `assets/characters/electrician/electrician.png`
- `assets/characters/child/child.png`
- `assets/ganesha/ganesha_main/ganesha.png`
- `assets/environment/mandapam/mandapam.png`
- `assets/props/generator/generator.png`
- `assets/props/bamboo/bamboo.png`
- `assets/props/flowers/flowers.png`
- `assets/props/vehicles/chariot.png`
- `assets/environment/temple/temple.png`
- `assets/environment/houses/house.png`

The built-in `AssetRegistry` automatically checks for these files. When present, it renders them seamlessly; when absent, it renders rich procedural canvas vector artwork.

---

## 🎵 Zero-Dependency Audio Engine

The game incorporates a built-in Web Audio API procedural sound synthesizer (`AudioManager`) providing:
- Dhol drums and percussion rhythms
- Resonant temple brass bells
- Environmental rain, wind, and thunder strikes
- Electrical spark zaps and motor rumbling
- Bamboo placement wooden clicks and footsteps
- Meditative bansuri flute melodies for the Visarjan ceremony

Custom MP3/OGG music and SFX files can also be placed in `assets/audio/`.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
http://localhost:5173/

# 4. Build production bundle
npm run build
```
