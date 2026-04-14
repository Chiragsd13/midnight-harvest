# Midnight Harvest

**[Play the game online here!](https://midnight-harvest.vercel.app/)**

`Midnight Harvest` is a first-person horror survival game prototype set in an endless-feeling cornfield at midnight while a spreading fire slowly turns the farm into a death trap.

The player wakes up disoriented on the ground, realizes the field is filling with smoke, and has roughly five minutes to find the highway and escape before the fire or the air kills them.

## Premise

You wake up in a remote corn farm at `12:00 AM`.

You do not know exactly where you are.

You do know three things:

- The field is enormous.
- Fire is spreading somewhere in the dark.
- The road is the only way out.

The game is built around panic, disorientation, environmental reading, and pressure from time, smoke, visibility, and sudden disturbances in the rows.

## Core Experience

The current version aims for a specific kind of horror:

- Not pitch black, but dark enough that shapes, movement, and silhouettes matter.
- A field that feels much bigger than the literal play volume.
- Constant pressure from smoke, fire progression, weather, and sound.
- Scares that come from proximity, ambiguity, and rural horror imagery rather than pure gore.
- A first-person body presence through wake-up animation, hand motion, coughing, and collapse sequences.

## Gameplay Loop

Every run follows the same high-level structure:

1. The player starts at midnight in an intro wake-up sequence.
2. A short centered briefing establishes location, time, and the spreading fire.
3. The player regains consciousness through eye blinks and a stand-up animation.
4. Exploration begins inside the field.
5. Environmental cues hint at the highway: distant traffic, passing cars, headlights, lampposts, and road geometry.
6. Fire and smoke intensify as the timer runs down.
7. The player either escapes, falls into a pit, gets overtaken by fire, or dies from smoke exposure.

## Current Features

### World and Atmosphere

- Large moonlit field with rolling ground variation.
- Endless-field illusion using a recentered corn patch and moving horizon shells.
- Dense corn rows with gaps, silhouettes, props, and distant markers.
- Dynamic fog and background color that shift as the fire spreads.
- Highway generation placed on a random edge of the field.
- Visible pits, scattered holes, road shoulders, lane lines, reflectors, guardrails, and lampposts.

### Horror Presentation

- Wake-up intro with sideways-on-the-ground framing, blink sequence, and rise-to-standing motion.
- On-screen mission briefing that settles into the HUD.
- First-person hand rig for movement and reactive body language.
- Cough reactions with hand-to-mouth animation and synthesized cough audio.
- Screen-space overlays for smoke, scare flashes, vignette, and end-state presentation.

### Dynamic Threats

- Fire progression over a 5-minute round.
- Expanding lethal fire radius.
- Smoke-driven coughing and suffocation sequence.
- Pit death state and collapse sequence.
- Random ambient horror events.
- Scarecrows with approach-triggered ambush behavior.

### Creatures and Encounters

- Scarecrow set pieces distributed around the field.
- Some scarecrows remain static.
- Some lunge into the player’s path, “boo,” then flee back into the corn.
- Additional ambient creature events such as crows, cats, squirrels, owls, whispers, rustles, breathing, and distant screams.

### Weather Variants

Each session locks to one weather state for the full run:

- `clear`
- `foggy`
- `rain`
- `storm`
- `snow`

Weather affects atmosphere, visibility, particle systems, ambient sound, cloud density, and how the field feels moment to moment.

### Audio

The game uses synthesized Web Audio rather than a traditional asset pipeline for most sound design:

- wind ambience
- rain ambience
- footsteps
- corn rustle
- coughs and suffocation fits
- fire crackle
- passing cars with spatial panning
- thunder and lightning-related events
- jump-scare hits
- whispers, breathing, screams, and creature cues

## Objective

Survive long enough to find the highway before the fire and smoke close in.

### Escape Cues

The game intentionally does not use a bright quest marker. Instead, it relies on environmental cues:

- distant traffic hum
- passing car audio
- flickering headlights
- lamppost silhouettes
- road textures and lane markings
- HUD status hints when you get closer

## Fail States

The current game can end in multiple ways:

- `Escape`: you reach the highway and survive.
- `Pit`: you step into the main pit or a hidden field hole.
- `Fire`: flames overtake you.
- `Smoke / Suffocation`: time runs out and the smoke collapses you.

## Controls

### Desktop

- `W / A / S / D` or arrow keys: move
- `Mouse`: look
- `Shift`: run
- `Click after intro`: lock pointer and begin control

### Touch / Mobile

- Left side drag: virtual joystick movement
- Right side drag: camera look
- `RUN` button: sprint input

## HUD

The HUD currently shows:

- location label
- in-world clock
- survival countdown timer
- status text
- run-state text
- crosshair

## Tech Stack

- `Three.js` for rendering and scene management
- `Vite` for development and build tooling
- `Web Audio API` for procedural sound and spatial audio
- Plain `HTML`, `CSS`, and `ES modules`

There is no gameplay framework layered on top. The project is intentionally direct and code-driven.

## Project Structure

```text
midnight-harvest/
├─ index.html
├─ manual-test.bat
├─ package.json
├─ vite.config.js
└─ src/
   ├─ main.js
   ├─ world.js
   ├─ player.js
   ├─ creatures.js
   ├─ effects.js
   ├─ audio.js
   ├─ state.js
   ├─ touch.js
   └─ style.css
```

### Module Breakdown

#### `src/main.js`

Owns the game bootstrap and top-level orchestration:

- renderer setup
- camera creation
- world/player/effects/creatures initialization
- intro sequence
- per-frame game loop
- HUD updates
- event scheduling
- death and escape cinematics

#### `src/world.js`

Builds and updates the physical scene:

- terrain
- cornfield
- moon and sky
- fog and fire coloration
- horizon shells and silhouettes
- highway and pits
- props and environmental dressing
- wind and lightning behavior

#### `src/player.js`

Handles first-person control and body feel:

- keyboard and touch movement
- look input
- head bob
- camera roll
- first-person hands
- cough body language
- terrain-following movement

#### `src/creatures.js`

Implements non-player encounters:

- scarecrow construction and animation
- scarecrow ambush logic
- crows
- cats
- squirrels
- other ambient creature events

#### `src/effects.js`

Handles particle and visual atmosphere systems:

- rain
- snow
- fire particles
- fireflies
- dust
- ground mist
- ash
- cloud layers
- screen flashes and smoke overlays

#### `src/audio.js`

Implements procedural audio and spatial sound:

- ambient loops
- one-shot scare and environmental sounds
- cough and suffocation audio
- fire crackle
- thunder
- car pass-bys

#### `src/state.js`

Stores round state and small helpers:

- timer logic
- clock formatting
- ending state
- run/cough/fear/luck values

#### `src/touch.js`

Builds the mobile input layer:

- touch joystick
- touch look controls
- sprint button

#### `src/style.css`

Owns the visual identity and screen-space presentation:

- intro screen
- wake-up overlays
- HUD
- end screen
- touch UI
- post-process style overlays

## Running the Game

### Option 1: Vite Dev Server

```bash
npm install
npm run dev
```

### Option 2: Simple Manual Test Server

If you want a no-build static test path, use:

```bat
manual-test.bat
```

That serves the game at:

```text
http://127.0.0.1:4173
```

This works because `index.html` includes an import map that resolves `three` directly from `node_modules`.

## Design Goals

The project is currently pushing toward these pillars:

- `Rural horror`: lonely, agricultural, uncanny, and hostile.
- `Readable darkness`: scary, but still visible enough for navigation and jump-scare timing.
- `Embodied first person`: waking up, coughing, stumbling, collapsing, and physically occupying the scene.
- `Environmental guidance`: players should infer direction from sound, light, and terrain rather than waypoint arrows.
- `Procedural mood`: weather, ambient events, and audio should make each run feel slightly different.

## Current Status

This is an actively iterated horror prototype rather than a content-complete release.

The game already contains:

- a complete start-to-finish playable loop
- intro to end-state flow
- multiple weather states
- environmental storytelling
- procedural audio and visual atmosphere
- mobile/touch support
- escape and death outcomes

## Known Caveats

As of the current codebase, several systems are still being tuned:

- sprint/run behavior and HUD messaging are still under active refinement
- event pacing is intentionally aggressive and may feel harsher than final balance
- some death and camera systems are still evolving
- browser pointer lock and Web Audio still require user interaction to begin, by design
- the project uses procedural sound heavily, so audio tone is still being refined rather than finalized

## Why This Project Is Distinct

This is not a generic maze game reskinned as a field.

The game’s identity comes from the combination of:

- a waking-up-on-the-ground intro
- a large cornfield built for dread and directional confusion
- a visible, advancing fire instead of an abstract timer
- road-seeking survival instead of combat
- rural scarecrow horror mixed with smoke, weather, and traffic cues

## Next Documentation Candidates

If this project grows, the next useful docs after this README would be:

- `DESIGN.md` for architecture and design decisions
- a tuning/balance document for audio, visibility, and event pacing
- a content roadmap for additional entities, endings, and encounter types

## Ownership

This repository and project documentation are intended for the local `midnight-harvest` project only.

No remote publishing, repo creation, or version changes are implied by this README.
