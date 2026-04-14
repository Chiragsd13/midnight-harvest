export const ROUND_SECONDS = 300; // 5 minutes

export const state = {
  phase: 'menu',      // menu | intro | playing | ended
  health: 100,
  luck: 50,           // hidden: black cat lowers this
  elapsed: 0,         // real seconds since gameplay start
  isRunning: false,
  stamina: 100,
  runTimeLeft: 10,
  runCooldown: 0,
  fear: 0,
  weather: 'clear',
  fireProgress: 0,    // 0..1 how much of field is burning
  distanceTraveled: 0,
  endingType: null,    // fire | lightning | pit | escape
};

export function damage(amt) {
  state.health = Math.max(0, state.health - amt);
  if (state.health <= 0) state.phase = 'ended';
}

export function modifyLuck(amt) {
  state.luck = Math.max(0, Math.min(100, state.luck + amt));
}

export function getRemainingTime() {
  return Math.max(0, ROUND_SECONDS - state.elapsed);
}

export function getTimerString() {
  const rem = getRemainingTime();
  const m = Math.floor(rem / 60);
  const s = Math.floor(rem % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function getClockString(showSeconds = true) {
  const total = Math.floor(state.elapsed);
  const h = Math.floor(total / 3600) % 24;
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const period = h < 12 ? 'AM' : 'PM';
  const dh = h === 0 ? 12 : h > 12 ? h - 12 : h;
  if (!showSeconds) {
    return `${dh}:${String(m).padStart(2, '0')} ${period}`;
  }
  return `${dh}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${period}`;
}

export function shouldEvent(baseChance) {
  const mod = 1 + (50 - state.luck) / 100;
  return Math.random() < baseChance * mod;
}

export function reset() {
  Object.assign(state, {
    phase: 'menu', health: 100, luck: 50, elapsed: 0,
    isRunning: false, stamina: 100, runTimeLeft: 10, runCooldown: 0, fear: 0,
    weather: 'clear', fireProgress: 0,
    distanceTraveled: 0, endingType: null,
  });
}
