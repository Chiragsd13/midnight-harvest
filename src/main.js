import * as THREE from 'three';
import { state, getTimerString, getClockString, shouldEvent, ROUND_SECONDS } from './state.js';
import { Audio } from './audio.js';
import { World } from './world.js';
import { Player } from './player.js';
import { Creatures } from './creatures.js';
import { Effects } from './effects.js';
import { TouchControls } from './touch.js';

/* ---- DOM ---- */
const $ = id => document.getElementById(id);
const introScreen = $('intro-screen');
const blinkOverlay = $('blink-overlay');
const eyelidTop = $('eyelid-top');
const eyelidBottom = $('eyelid-bottom');
const wakeBriefing = $('wake-briefing');
const briefingLocation = $('briefing-location');
const briefingTime = $('briefing-time');
const briefingWarning = $('briefing-warning');
const hud = $('hud');
const hudTime = $('hud-time');
const hudLocation = $('hud-location');
const hudStatus = $('hud-status');
const hudTimer = $('hud-timer');
const hudRun = $('hud-run');
const endScreen = $('end-screen');
const endTitle = $('end-title');
const endSubtitle = $('end-subtitle');
const endDetail = $('end-detail');
const instructions = $('instructions');
const canvas = $('game-canvas');

/* ---- engine ---- */
let audio, renderer, camera, world, player, creatures, effects;

audio = new Audio();
renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.96;

camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 300);
world = new World();
world.build();

// TouchControls instance always created (builds its own DOM) but stays disabled
// until the user actually starts the game with a touch tap.
const touch = new TouchControls();

player = new Player(camera, canvas, touch);
creatures = new Creatures(world.scene);
effects = new Effects(world.scene);

// Track whether the most recent input on a key UI element was a touch tap
// or a mouse click. Only after the canvas "tap to begin" step do we lock this in.
let startedViaTouch = false;

effects.createRain();
effects.createSnow();
effects.createFireParticles();
effects.createFireflies();
effects.createDust();
effects.createGroundMist();
effects.createAsh();
effects.createClouds(); // Add sky clouds
creatures.spawnScarecrows(60, world.fieldSize);

/* ---- pick weather ONCE per round (realistic: locked for the session) ---- */
const WEATHER_OPTIONS = ['clear', 'clear', 'clear', 'foggy', 'rain', 'rain', 'storm', 'snow'];
const roundWeather = WEATHER_OPTIONS[Math.floor(Math.random() * WEATHER_OPTIONS.length)];
state.weather = roundWeather;
world.adjustCloudsForWeather(state.weather);

/* ---- event timers ---- */
let eventTimer = 0;
let lightningTimer = 0;
let fireCrackleTimer = 0;
let coughTimer = 0;
let carTimer = 8 + Math.random() * 10;
let lastTime = 0;
const coughOverlay = $('cough-overlay');
let coughResetTimeout = null;

/* ---- resize ---- */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ---- pointer lock (desktop only) ---- */
document.addEventListener('pointerlockchange', () => {
  // In touch mode we never rely on pointer lock: keep player.locked=true always during play
  if (startedViaTouch) return;
  player.locked = document.pointerLockElement === canvas;
  if (!player.locked && state.phase === 'playing') {
    instructions.textContent = 'Click to resume';
    instructions.classList.remove('hidden');
    canvas.addEventListener('click', function resume() {
      canvas.removeEventListener('click', resume);
      canvas.requestPointerLock();
      instructions.classList.add('hidden');
    });
  }
});

/* ---- buttons ---- */
$('play-btn').addEventListener('click', startGame);
$('restart-btn').addEventListener('click', () => location.reload());

/* ---- helpers ---- */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function setEyelids(transition, openPct) {
  eyelidTop.style.transition = transition;
  eyelidBottom.style.transition = transition;
  eyelidTop.style.transform = `translateY(-${openPct}%)`;
  eyelidBottom.style.transform = `translateY(${openPct}%)`;
}

function formatRunHud() {
  if (state.runCooldown > 0) {
    return `Run Cooldown · ${Math.ceil(state.runCooldown)}s`;
  }
  if (state.isRunning) {
    return `Running · ${Math.max(0, state.runTimeLeft).toFixed(1)}s left`;
  }
  return `Run Ready · ${Math.max(0, state.runTimeLeft).toFixed(1)}s`;
}

function syncRunHud() {
  hudRun.textContent = formatRunHud();
  hudRun.classList.remove('active', 'cooldown');
  if (state.runCooldown > 0) hudRun.classList.add('cooldown');
  else if (state.isRunning) hudRun.classList.add('active');
}

function triggerCoughReaction(intensity = 0.5, durationMs = 700) {
  state.isCoughing = true;
  state.coughIntensity = intensity;

  if (coughOverlay) {
    const opacity = Math.min(0.28, 0.08 + intensity * 0.14);
    coughOverlay.style.transition = `opacity ${Math.max(120, Math.round(durationMs * 0.18))}ms ease`;
    coughOverlay.style.opacity = String(opacity);
  }

  if (coughResetTimeout) clearTimeout(coughResetTimeout);
  coughResetTimeout = setTimeout(() => {
    state.isCoughing = false;
    state.coughIntensity = 0;
    if (coughOverlay) coughOverlay.style.opacity = '0';
    coughResetTimeout = null;
  }, durationMs);
}

async function playWakeBriefing() {
  hud.classList.remove('hidden');
  hud.classList.add('intro-phase');
  hudLocation.textContent = 'Unknown Farm';
  hudTime.textContent = '12:00:00 AM';
  hudStatus.textContent = 'Fire spreading. Smoke closes in fast.';
  hudTimer.textContent = '5:00';
  syncRunHud();

  briefingLocation.textContent = 'Location: Unknown Farm';
  briefingTime.textContent = 'Time: 12:00 AM';
  briefingWarning.textContent = 'Fire is spreading. Follow the distant glow where the road meets the fields. Listen for traffic.';

  wakeBriefing.classList.remove('hidden', 'settle');
  wakeBriefing.classList.add('show');
  await sleep(1150);
  wakeBriefing.classList.add('settle');
  hud.classList.add('ready');
  await sleep(1500);
  wakeBriefing.classList.add('hidden');
  wakeBriefing.classList.remove('show', 'settle');
  hud.classList.remove('intro-phase');
}

async function playWakeBlinks() {
  const easeOut = ms => `transform ${ms}ms cubic-bezier(0.23,1,0.32,1)`;
  const easeIn = ms => `transform ${ms}ms cubic-bezier(0.55,0,1,0.45)`;

  // Start fully closed
  setEyelids('none', 0);
  blinkOverlay.style.opacity = '0';
  canvas.style.filter = 'blur(12px) brightness(0.5)';
  await sleep(400);

  // Blink 1: barely conscious — crack open, blurry sideways world
  canvas.style.transition = 'filter 350ms ease';
  canvas.style.filter = 'blur(8px) brightness(0.6)';
  setEyelids(easeOut(300), 18);
  await sleep(400);
  // Close again involuntarily
  setEyelids(easeIn(200), 0);
  canvas.style.filter = 'blur(12px) brightness(0.45)';
  await sleep(520);

  // Blink 2: fighting to stay awake — open wider
  canvas.style.filter = 'blur(5px) brightness(0.72)';
  setEyelids(easeOut(360), 34);
  await sleep(520);
  // Heavy close
  setEyelids(easeIn(170), 2);
  await sleep(380);

  // Blink 3: eyes opening wider — world becoming clearer
  canvas.style.filter = 'blur(2px) brightness(0.88)';
  setEyelids(easeOut(320), 52);
  await sleep(360);
  // Quick flutter (eyelids wavering)
  setEyelids('transform 90ms ease', 42);
  await sleep(130);

  // Fully open — vision focused
  canvas.style.transition = 'filter 650ms ease';
  canvas.style.filter = 'blur(0px) brightness(1)';
  setEyelids(easeOut(480), 100);
  await sleep(550);
}

async function animateRollUp(groundY) {
  const duration = 2400;
  const startTime = Date.now();
  const startRoll = 1.22;
  const startPitch = 0.08;
  const startYaw = 0.35;
  const lyingY = groundY + 0.14;
  const sittingY = groundY + 0.52;

  await new Promise(resolve => {
    (function frame() {
      const t = Math.min(1, (Date.now() - startTime) / duration);
      // Asymmetric ease: groggy push at start, smoother at end
      const ease = Math.min(1, t < 0.4 ? 1.56 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2.2 + 0.05);

      const roll = startRoll * (1 - ease);
      // Look slightly down during roll, then level out
      const pitch = startPitch + Math.sin(t * Math.PI) * 0.18;
      const yaw = startYaw * (1 - ease * 0.85);
      // Disorientation wobble — fades as character steadies
      const wobble = Math.sin(t * 14) * 0.018 * (1 - t);

      camera.position.y = lyingY + (sittingY - lyingY) * ease;
      camera.quaternion.setFromEuler(
        new THREE.Euler(pitch, yaw, roll + wobble, 'YXZ')
      );

      if (t < 1) requestAnimationFrame(frame); else resolve();
    })();
  });
}

async function animateStandUp(groundY) {
  const duration = 1800;
  const startTime = Date.now();
  const sittingY = groundY + 0.52;
  const standingY = groundY + player.eyeHeight;

  await new Promise(resolve => {
    (function frame() {
      const t = Math.min(1, (Date.now() - startTime) / duration);
      const ease = 1 - Math.pow(1 - t, 3);

      camera.position.y = sittingY + (standingY - sittingY) * ease;
      // Forward lean (pushing off ground) then straighten
      const lean = Math.sin(t * Math.PI * 0.75) * 0.12;
      const sway = Math.sin(t * 9) * 0.012 * (1 - t);
      const remainYaw = 0.35 * 0.15 * (1 - ease);

      camera.quaternion.setFromEuler(
        new THREE.Euler(lean, remainYaw, sway, 'YXZ')
      );

      if (t < 1) requestAnimationFrame(frame); else {
        camera.quaternion.setFromEuler(new THREE.Euler(0, 0, 0, 'YXZ'));
        resolve();
      }
    })();
  });
}

/* ======== INTRO SEQUENCE ======== */
async function startGame() {
  audio.init();
  state.phase = 'intro';
  introScreen.classList.add('fade-out');
  await sleep(900);
  introScreen.style.display = 'none';

  const groundY = world.groundHeightAt(0, 0);

  // Start lying on right side — head near ground, body tilted sideways
  camera.position.set(0, groundY + 0.14, 0);
  player.setView(0.08, 0.35, 1.22);

  // Eyes start closed (eyelids cover the screen)
  setEyelids('none', 0);
  canvas.style.filter = 'blur(12px) brightness(0.5)';

  await playWakeBriefing();
  await playWakeBlinks();

  // Roll from lying on side to sitting upright
  await animateRollUp(groundY);

  // Stand up from sitting position
  await animateStandUp(groundY);
  player.syncViewFromCamera(true);

  // Clean up intro overlays
  eyelidTop.style.display = 'none';
  eyelidBottom.style.display = 'none';
  canvas.style.filter = '';
  canvas.style.transition = '';

  instructions.textContent = 'Tap or click to move';
  instructions.classList.remove('hidden');

  // Use pointerdown so we can tell touch vs mouse input reliably
  function begin(e) {
    canvas.removeEventListener('pointerdown', begin);

    // Lock in input mode based on how the user started
    startedViaTouch = (e.pointerType === 'touch' || e.pointerType === 'pen');

    if (startedViaTouch) {
      // No pointer lock on touch; directly unlock player controls
      player.syncViewFromCamera(true);
      player.locked = true;
      touch.enable();
    } else {
      player.syncViewFromCamera(true);
      canvas.requestPointerLock();
    }

    state.phase = 'playing';
    document.body.classList.add('playing');
    instructions.classList.add('hidden');

    // Start ambient audio layers (kept extremely minimal for quiet night atmosphere).
    // Wind only — fire presence is handled by discrete crackle events + visual FX
    // (the continuous 62Hz fire drone was unpleasant and has been removed).
    audio.startWind(0.03);

    // Apply round weather
    effects.setWeather(roundWeather, audio);

    if (roundWeather !== 'clear') {
      hudStatus.textContent = `${weatherLabel(roundWeather)} Fire spreading.`;
    }

    setTimeout(() => {
      instructions.textContent = startedViaTouch
        ? 'Left joystick to move | Drag right side to look | RUN: 10s max, 30s cooldown'
        : 'WASD to move | SHIFT to run (10s max, 30s cooldown) | Mouse to look';
      instructions.classList.remove('hidden');
      setTimeout(() => instructions.classList.add('hidden'), 5000);
    }, 600);
  }
  canvas.addEventListener('pointerdown', begin);
}

function weatherLabel(w) {
  switch (w) {
    case 'rain': return 'Rain is falling...';
    case 'storm': return 'A storm is coming...';
    case 'snow': return 'Snow drifts through the air...';
    case 'foggy': return 'Thick fog covers the field...';
    default: return '';
  }
}

/* ======== ENDINGS (3 only: fire, pit, escape) ======== */
const ENDINGS = {
  fire: {
    title: 'CONSUMED BY FIRE',
    subtitle: 'The flames caught up. You never made it out of the field.',
    detail: 'The fire swallowed everything.',
    deathClass: 'death',
  },
  pit: {
    title: 'SWALLOWED BY DARKNESS',
    subtitle: 'You stumbled into a pit hidden by the corn. There was no way out.',
    detail: 'The ground was not what it seemed.',
    deathClass: 'death',
  },
  escape: {
    title: 'YOU ESCAPED',
    subtitle: 'You found the highway. A passing car pulled over and saved you.',
    detail: 'You lived to tell the tale.',
    deathClass: 'win',
  },
};

function triggerEnding(type) {
  if (state.phase === 'ended') return;
  state.phase = 'ended';
  state.endingType = type;
  const e = ENDINGS[type];
  document.exitPointerLock();

  if (type === 'fire') {
    Effects.damageFlash();
    audio.playJumpScare();
  }
  if (type === 'pit') {
    // Camera falls into pit with tumble
    let fallT = 0;
    const startY = camera.position.y;
    const fallInterval = setInterval(() => {
      fallT += 16;
      const t = Math.min(1, fallT / 1800);
      const ease = t * t; // accelerating fall
      camera.position.y = startY - ease * 8;
      camera.rotation.z += 0.03 * (1 - t * 0.5);
      camera.rotation.x += 0.015;
      if (t >= 1) clearInterval(fallInterval);
    }, 16);
    audio.playJumpScare();
  }
  if (type === 'escape') {
    playEscapeCinematic(e);
    return; // cinematic handles the end screen
  }

  setTimeout(() => {
    endTitle.textContent = e.title;
    endTitle.className = e.deathClass;
    endSubtitle.textContent = e.subtitle;
    endDetail.textContent = e.detail;
    endScreen.classList.remove('hidden');
    requestAnimationFrame(() => endScreen.classList.add('show'));
  }, type === 'pit' ? 2200 : 800);
}

async function playEscapeCinematic(e) {
  const ep = world.exitPos;
  const half = world.fieldSize / 2;
  const isNS = Math.abs(ep.z) > half - 5;
  const roadLen = 40;

  // Car approaches from far end of highway
  const carStart = new THREE.Vector3(
    isNS ? ep.x - roadLen : ep.x,
    1.0,
    isNS ? ep.z : ep.z - roadLen
  );
  const carStop = new THREE.Vector3(ep.x, 1.0, ep.z);

  // Approaching headlights
  const hl1 = new THREE.PointLight(0xffeedd, 3.5, 80, 1.3);
  const hl2 = new THREE.PointLight(0xffeedd, 3.5, 80, 1.3);
  hl1.position.copy(carStart);
  hl2.position.copy(carStart);
  world.scene.add(hl1);
  world.scene.add(hl2);

  // Camera slowly turns toward the highway
  const lookTarget = carStop.clone();
  lookTarget.y = camera.position.y;
  const targetDir = lookTarget.clone().sub(camera.position).normalize();
  const targetYaw = Math.atan2(-targetDir.x, -targetDir.z);

  // Engine sound
  audio.playCarPassing(
    carStart.x, carStart.y, carStart.z,
    carStop.x, carStop.y, carStop.z
  );

  // Animate: car approaches over 3.5 seconds
  const dur = 3500;
  const startTime = Date.now();
  await new Promise(resolve => {
    (function frame() {
      const t = Math.min(1, (Date.now() - startTime) / dur);
      // Ease-out: car decelerates as it approaches
      const ease = 1 - Math.pow(1 - t, 2.5);

      const cx = carStart.x + (carStop.x - carStart.x) * ease;
      const cz = carStart.z + (carStop.z - carStart.z) * ease;
      const offset = isNS ? 0.4 : 0;
      hl1.position.set(cx + offset, 1.0, cz + (isNS ? 0 : offset));
      hl2.position.set(cx - offset, 1.0, cz - (isNS ? 0 : offset));

      // Headlights get brighter as car nears
      hl1.intensity = 3.5 + ease * 4;
      hl2.intensity = 3.5 + ease * 4;

      // Camera gently turns toward the car
      const camLerp = Math.min(1, t * 1.5);
      const currentYaw = camera.rotation.y;
      camera.rotation.y += (targetYaw - currentYaw) * camLerp * 0.04;

      if (t < 1) requestAnimationFrame(frame); else resolve();
    })();
  });

  // Car stopped — bright headlight wash + horn
  world.flash(0.6);
  // Synthesized horn
  if (audio.ctx) {
    const t = audio.ctx.currentTime;
    const horn = audio.ctx.createOscillator();
    horn.type = 'sawtooth';
    horn.frequency.setValueAtTime(320, t);
    const hf = audio._filter('lowpass', 600);
    const hg = audio._gain(0.2);
    hg.gain.setValueAtTime(0.2, t);
    hg.gain.linearRampToValueAtTime(0.25, t + 0.3);
    hg.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    audio._pipe(horn, hf, hg);
    horn.start(t); horn.stop(t + 1.3);
  }

  await sleep(1800);

  // Clean up
  world.scene.remove(hl1);
  world.scene.remove(hl2);
  hl1.dispose(); hl2.dispose();

  // Show end screen
  endTitle.textContent = e.title;
  endTitle.className = e.deathClass;
  endSubtitle.textContent = e.subtitle;
  endDetail.textContent = e.detail;
  endScreen.classList.remove('hidden');
  requestAnimationFrame(() => endScreen.classList.add('show'));
}

/* ======== GAME LOOP ======== */
function gameLoop(time) {
  requestAnimationFrame(gameLoop);
  const dt = Math.min(0.1, (time - lastTime) / 1000);
  lastTime = time;

  if (state.phase === 'playing' || state.phase === 'dying') {
    state.elapsed += dt;

    // Fire progress: starts slow, accelerates
    state.fireProgress = Math.min(1, (state.elapsed / ROUND_SECONDS) ** 1.4);
    world.updateFire(state.fireProgress);
    world.updateWind(dt, state.weather);
    effects.updateFireParticles(dt, world.fireOrigin, state.fireProgress, world.wind);
    Effects.updateSmoke(state.fireProgress);

    player.update(dt, state, audio, world);
    world.updateAtmosphere(dt, player.pos(), state.fireProgress, state.weather);
    creatures.updateScarecrows(player.xz(), player.movementXZ(), dt, audio, () => {
      Effects.scareFlash();
      shakeCamera(260, 0.055);
      state.fear += 15;
    });
    creatures.updateAnimals(dt);
    effects.updateRain(dt, player.pos(), world.wind);
    effects.updateSnow(dt, player.pos(), world.wind);
    effects.updateGroundMist(dt, player.pos(), world.wind, state.fireProgress, state.weather);
    effects.updateFireflies(dt, player.pos(), state.elapsed, state.fireProgress);
    effects.updateDust(dt, player.pos(), world.wind);
    effects.updateAsh(dt, player.pos(), world.wind, state.fireProgress);
    effects.updateClouds(dt, player.pos());

    updateHUD();
    updateCoughing(dt);
    updateCarPassing(dt);
    checkFireCatchPlayer();
    checkPit();
    checkHighway();
    checkTimeUp();
    scheduleEvents(dt);

    // Sync spatial audio listener to camera
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const upv = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
    audio.updateListenerPosition(camera.position, fwd, upv);
  }

  renderer.render(world.scene, camera);
}

/* ---- HUD (no health, just time and timer) ---- */
function updateHUD() {
  hudTime.textContent = getClockString();
  hudTimer.textContent = getTimerString();
  hudStatus.textContent = state.fireProgress > 0.75
    ? 'Smoke is closing around you.'
    : state.fireProgress > 0.45
      ? 'Fire is spreading through the rows.'
      : roundWeather === 'storm'
        ? 'Storm wind is driving the fire.'
        : roundWeather === 'foggy'
          ? 'Fog hangs low between the rows.'
          : 'Stay ahead of the smoke.';

  // Subtle highway proximity hint (distance only, no direction)
  const hxd = world.exitPos.x - camera.position.x;
  const hzd = world.exitPos.z - camera.position.z;
  const hDist = Math.sqrt(hxd * hxd + hzd * hzd);
  if (hDist < 30) {
    hudStatus.textContent = 'Headlights flicker through the stalks!';
  } else if (hDist < 60) {
    hudStatus.textContent = 'You hear vehicles nearby.';
  } else if (hDist < 120) {
    hudStatus.textContent += ' · Distant traffic hums.';
  }
  syncRunHud();
  const rem = ROUND_SECONDS - state.elapsed;
  hudTimer.classList.toggle('urgent', rem < 60);
}

/* ---- highway car passing (environmental discovery instead of HUD compass) ---- */
function updateCarPassing(dt) {
  carTimer -= dt;
  if (carTimer > 0) return;
  carTimer = 18 + Math.random() * 17; // Next car in 18-35 seconds

  const ep = world.exitPos;
  const roadLen = 40;
  // Determine if road runs N-S or E-W based on exit position
  const half = world.fieldSize / 2;
  const isNS = Math.abs(ep.z) > half - 5;

  // Car travels the length of the highway
  const sx = isNS ? ep.x - roadLen * 0.5 : ep.x;
  const sz = isNS ? ep.z : ep.z - roadLen * 0.5;
  const ex = isNS ? ep.x + roadLen * 0.5 : ep.x;
  const ez = isNS ? ep.z : ep.z + roadLen * 0.5;

  // Play spatial car sound (returns duration in ms)
  const durMs = audio.playCarPassing(sx, 1, sz, ex, 1, ez);
  const dur = durMs / 1000;

  // Moving headlights (two point lights sweeping along road)
  const hl1 = new THREE.PointLight(0xffeedd, 2.2, 45, 1.5);
  const hl2 = new THREE.PointLight(0xffeedd, 2.2, 45, 1.5);
  hl1.position.set(sx, 1.0, sz);
  hl2.position.set(sx, 1.0, sz);
  world.scene.add(hl1);
  world.scene.add(hl2);

  // Red tail lights
  const tl = new THREE.PointLight(0xff2200, 0.8, 20, 2);
  tl.position.set(sx, 0.8, sz);
  world.scene.add(tl);

  const startTime = Date.now();
  const headlightOffset = isNS ? 0.4 : 0; // offset between headlights
  (function animateCar() {
    const t = Math.min(1, (Date.now() - startTime) / (dur * 1000));
    const cx = sx + (ex - sx) * t;
    const cz = sz + (ez - sz) * t;
    hl1.position.set(cx + (isNS ? headlightOffset : 0), 1.0, cz + (isNS ? 0 : headlightOffset));
    hl2.position.set(cx - (isNS ? headlightOffset : 0), 1.0, cz - (isNS ? 0 : headlightOffset));
    // Tail lights trail behind
    const tailOff = 2.5;
    tl.position.set(
      cx - (isNS ? tailOff * Math.sign(ex - sx) : 0), 0.8,
      cz - (isNS ? 0 : tailOff * Math.sign(ez - sz))
    );
    if (t < 1) requestAnimationFrame(animateCar);
    else {
      world.scene.remove(hl1);
      world.scene.remove(hl2);
      world.scene.remove(tl);
      hl1.dispose(); hl2.dispose(); tl.dispose();
    }
  })();
}

/* ---- coughing from smoke (increases over time, suffocation at end) ---- */
function updateCoughing(dt) {
  if (state.fireProgress < 0.1) return;

  coughTimer += dt;

  // Cough interval decreases as fire progresses:
  // At 10% fire: every ~12s, at 50%: every ~5s, at 80%: every ~2s, at 95%+: every ~0.8s
  const progress = state.fireProgress;
  const interval = Math.max(0.8, 12 - progress * 14);
  const intensity = Math.min(1, progress * 1.3);

  if (coughTimer >= interval) {
    coughTimer = 0;
    audio.playCough(intensity);
    triggerCoughReaction(intensity, 520 + intensity * 420);
  }
}

/* ---- fire catches player (fire radius expands, if player is inside = death) ---- */
function checkFireCatchPlayer() {
  if (state.phase !== 'playing') return;
  const p = player.xz();
  const dx = p.x - world.fireOrigin.x;
  const dz = p.z - world.fireOrigin.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  // Fire visual radius expands around progress * 90-95. Lethal boundary is 85.
  const lethalRadius = 10 + state.fireProgress * 85;
  if (dist < lethalRadius && state.fireProgress > 0.3) {
    triggerBurningDeath();
  }
}

/* ---- pit detection ---- */
function checkPit() {
  const p = player.xz();
  // Main pit near highway
  const pdx = p.x - world.pitCenter.x;
  const pdz = p.z - world.pitCenter.z;
  if (pdx * pdx + pdz * pdz < 4) {
    triggerEnding('pit');
    return;
  }
  // Additional ground holes
  if (world.groundHoles) {
    for (const hole of world.groundHoles) {
      const hdx = p.x - hole.x;
      const hdz = p.z - hole.z;
      if (hdx * hdx + hdz * hdz < hole.r * hole.r) {
        triggerEnding('pit');
        return;
      }
    }
  }
}

/* ---- highway approach = escape (saved by passing car) ---- */
function checkHighway() {
  const p = player.xz();
  const dx = p.x - world.exitPos.x;
  const dz = p.z - world.exitPos.z;
  const dist = Math.sqrt(dx * dx + dz * dz);

  if (dist < 4) {
    triggerEnding('escape');
  }
}

function shakeCamera(dur, intensity) {
  const ox = camera.position.x, oz = camera.position.z;
  let t = 0;
  const iv = setInterval(() => {
    t += 16;
    const f = 1 - t / dur;
    camera.position.x = ox + (Math.random() - 0.5) * intensity * f;
    camera.position.z = oz + (Math.random() - 0.5) * intensity * f;
    if (t >= dur) { clearInterval(iv); camera.position.x = ox; camera.position.z = oz; }
  }, 16);
}

/* ---- time check: suffocation death sequence ---- */
function checkTimeUp() {
  if (state.elapsed >= ROUND_SECONDS && state.phase === 'playing') {
    triggerSuffocation();
  }
}

function triggerSuffocation() {
  state.phase = 'dying';
  document.exitPointerLock();

  triggerCoughReaction(1, 3200);

  // Intense coughing fit
  audio.playSuffocationFit();

  const smokeEl = document.getElementById('smoke-overlay');
  if (smokeEl) {
    smokeEl.style.transition = 'opacity 1.5s ease';
    smokeEl.style.opacity = '1';
  }

  // Second coughing fit after 1.5s
  setTimeout(() => audio.playSuffocationFit(), 1200);

  // Visceral collapse sequence (stagger -> kneel -> faceplant)
  let fallStart = Date.now();
  const startY = camera.position.y;
  const startX = camera.position.x;
  const startZ = camera.position.z;
  const startRotZ = camera.rotation.z;
  const startRotX = camera.rotation.x;
  const fallDuration = 3200;
  
  const fallInterval = setInterval(() => {
    const t = Math.min(1, (Date.now() - fallStart) / fallDuration);
    
    // Knee buckle (0 -> 0.4)
    let yDrop = 0;
    if (t < 0.4) {
      const buckleT = t / 0.4;
      yDrop = buckleT * 0.6; // kneels down by 0.6 units
    } else {
      // Final faceplant (0.4 -> 1.0)
      const plantT = (t - 0.4) / 0.6;
      yDrop = 0.6 + plantT * plantT * (startY - 0.7); 
    }
    
    camera.position.y = startY - yDrop;
    
    // Staggering body sway
    const stagger = (1 - t) * Math.sin(t * Math.PI * 8) * 0.15;
    camera.position.x = startX + stagger;
    camera.position.z = startZ + stagger * 0.5;

    // Tilt head downwards and to the side as falling
    camera.rotation.z = startRotZ + t * t * 1.2;
    camera.rotation.x = startRotX - t * 0.8;

    if (t >= 1) {
      clearInterval(fallInterval);
      state.isCoughing = false;
      state.coughIntensity = 0;
      // Final gasp, then show death screen
      setTimeout(() => {
        state.phase = 'ended';
        state.endingType = 'fire';
        endTitle.textContent = 'SUFFOCATED';
        endTitle.className = 'death';
        endSubtitle.textContent = 'The smoke filled your lungs. You collapsed in the field, unable to breathe.';
        endDetail.textContent = 'The fire consumed everything.';
        endScreen.classList.remove('hidden');
        requestAnimationFrame(() => endScreen.classList.add('show'));
      }, 500);
    }
  }, 16);
}

function triggerBurningDeath() {
  state.phase = 'dying';
  
  const dmgOverlay = document.getElementById('damage-overlay');
  if (dmgOverlay) {
    dmgOverlay.style.background = 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(200,40,0,0.6) 60%, rgba(255,100,0,0.9) 100%)';
    dmgOverlay.style.transition = 'opacity 1s ease';
    dmgOverlay.style.opacity = '1.0';
  }

  // Brutal sound
  audio.playJumpScare();
  setTimeout(() => audio.playExplosion(), 200);

  // Intense shake
  shakeCamera(2000, 0.4);

  let fallStart = Date.now();
  const startY = camera.position.y;
  const startX = camera.position.x;
  const startZ = camera.position.z;
  const startRotZ = camera.rotation.z;
  const startRotX = camera.rotation.x;
  const fallDuration = 1800; // faster fall than suffocation
  
  const fallInterval = setInterval(() => {
    const t = Math.min(1, (Date.now() - fallStart) / fallDuration);
    
    // Drop
    const yDrop = t * t * (startY - 0.2); 
    camera.position.y = startY - yDrop;
    
    // Thrashing body
    const thrash = (1 - t) * Math.sin(t * Math.PI * 18) * 0.3;
    camera.position.x = startX + thrash * Math.cos(t * 10);
    camera.position.z = startZ + thrash * Math.sin(t * 10);

    // Roll backwards and sideways
    camera.rotation.z = startRotZ + t * 0.8;
    camera.rotation.x = startRotX - t * 1.5;

    if (t >= 1) {
      clearInterval(fallInterval);
      setTimeout(() => {
        state.phase = 'ended';
        state.endingType = 'burnt';
        endTitle.textContent = 'BURNT ALIVE';
        endTitle.className = 'death';
        endSubtitle.textContent = 'The wall of flames overtook you. There was nowhere left to run.';
        endDetail.textContent = 'You have become ash in the wind.';
        endScreen.classList.remove('hidden');
        requestAnimationFrame(() => endScreen.classList.add('show'));
      }, 800);
    }
  }, 16);
}

/* ---- random events (escalate horror over time) ---- */
function scheduleEvents(dt) {
  eventTimer += dt;
  fireCrackleTimer += dt;

  if (fireCrackleTimer > 3 + Math.random() * 3) {
    fireCrackleTimer = 0;
    if (state.fireProgress > 0.08) audio.playFireCrackle();
  }

  // Lightning during storm
  if (state.weather === 'storm') {
    lightningTimer += dt;
    if (lightningTimer > 4 + Math.random() * 8) {
      lightningTimer = 0;
      world.triggerLightning(camera.position);
      setTimeout(() => audio.playThunder(), 400 + Math.random() * 1800);
    }
  }

  // Much faster event cooldown base 
  const baseInterval = 1.5 + Math.random() * 2;
  const escalation = Math.max(0.3, 1.0 - state.fireProgress * 0.8);
  if (eventTimer > baseInterval * escalation) {
    eventTimer = 0;
    randomEvent();
  }
}

function triggerLightning() {
  const oldBg = world.scene.background.clone();
  const oldFog = world.scene.fog.color.clone();
  const white = new THREE.Color(0xddeeff);
  
  // Flash 1
  world.scene.background.copy(white);
  world.scene.fog.color.copy(white);
  
  setTimeout(() => {
    world.scene.background.copy(oldBg);
    world.scene.fog.color.copy(oldFog);
  }, 100);

  // Flash 2
  setTimeout(() => {
    world.scene.background.copy(white);
    world.scene.fog.color.copy(white);
  }, 180);

  setTimeout(() => {
    world.scene.background.copy(oldBg);
    world.scene.fog.color.copy(oldFog);
  }, 250);

  // Rolling thunder
  setTimeout(() => {
    audio.playExplosion();
    shakeCamera(800, 0.1);
  }, 1200 + Math.random() * 800);
}

function randomEvent() {
  const p = player.pos();
  const progress = state.fireProgress;
  const roll = Math.random();

  // Remove pacing handcuffs to allow heavy events earlier.
  // We want jump scares to hit hard.

  if (roll < 0.12) {
    if (shouldEvent(0.4)) creatures.spawnCrows(p, audio);
  } else if (roll < 0.18 && shouldEvent(0.3)) {
    const isBlack = Math.random() < 0.35;
    creatures.spawnCat(p, audio, isBlack, state);
  } else if (roll < 0.23) {
    creatures.spawnSquirrel(p, audio);
  } else if (roll < 0.30) {
    audio.playOwl();
  } else if (roll < 0.36) {
    audio.playWhisper();
  } else if (roll < 0.42) {
    audio.playSomethingMoving();
    if (Math.random() < 0.4) shakeCamera(250, 0.05);
  } else if (roll < 0.48) {
    // Brand new engaging feature: Dynamic Lightning Storms
    triggerLightning();
  } else if (roll < 0.54) {
    audio.playHeartbeat(90 + state.fear + progress * 60);
  } else if (roll < 0.60) {
    audio.playRustle();
  } else if (roll < 0.66) {
    audio.playDistantScream();
  } else if (roll < 0.72) {
    audio.playBreathing();
    if (Math.random() < 0.6) shakeCamera(200, 0.04);
  } else {
    // Jump scare bracket explicitly opens up widely (28% overall chance per event trigger)
    audio.playSomethingMoving();
    setTimeout(() => audio.playWhisper(), 400);
    setTimeout(() => {
      // Much higher odds of direct jump scare
      if (Math.random() < 0.65) {
        audio.playJumpScare();
        Effects.scareFlash();
        shakeCamera(500, 0.2);
      }
    }, 1200);
  }
}

/* ---- start render ---- */
requestAnimationFrame(gameLoop);
