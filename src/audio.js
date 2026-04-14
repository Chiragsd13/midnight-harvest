export class Audio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.ambient = [];
  }

  get ready() { return !!this.ctx; }

  init() {
    try {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      // Increased master overall volume as requested
      this.master.gain.value = 0.75;
      this.master.connect(this.ctx.destination);
    } catch { /* audio unsupported */ }
  }

  /* --- helpers --- */
  _noise(dur, loop = false) {
    if (!this.ctx) return null;
    const n = this.ctx.sampleRate * dur;
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = this.ctx.createBufferSource();
    s.buffer = buf; s.loop = loop;
    return s;
  }
  _gain(v) {
    const g = this.ctx.createGain(); g.gain.value = v; return g;
  }
  _filter(type, freq, q = 1) {
    const f = this.ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = q; return f;
  }
  _pipe(src, ...nodes) {
    let p = src;
    for (const n of nodes) { p.connect(n); p = n; }
    p.connect(this.master);
    return src;
  }

  /* === AMBIENT LOOPS === */
  startWind(intensity = 0.25) {
    if (!this.ctx) return;
    const s = this._noise(2, true);
    const hp = this._filter('highpass', 18);
    const lp = this._filter('lowpass', 120);
    const g = this._gain(intensity * 0.075);
    this._pipe(s, hp, lp, g); s.start();
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.09;
    const lg = this._gain(intensity * 0.018);
    lfo.connect(lg); lg.connect(g.gain); lfo.start();
    this.ambient.push({ src: s, g, tag: 'wind' });
  }

  startCrickets() {
    if (!this.ctx) return;
    // Replace harsh triangular alarm with rhythmic high-pass noise for organic chirps
    const s = this._noise(2, true);
    const o = this.ctx.createOscillator();
    o.frequency.value = 16; // Chirp rate
    const mg = this._gain(1);
    o.connect(mg);
    const g = this._gain(0.015);
    mg.connect(g.gain);
    
    // Smooth resonant bandpass for cricket tone
    const f = this._filter('bandpass', 3200, 5);
    this._pipe(s, f, g);
    s.start(); o.start();
    this.ambient.push({ src: s, g, tag: 'crickets' });
    this.ambient.push({ src: o, g: this._gain(0), tag: 'crickets' });
  }

  startRain(intensity = 0.5) {
    if (!this.ctx) return;
    const s = this._noise(2, true);
    const hp = this._filter('highpass', 1400);
    const lp = this._filter('lowpass', 3000);
    const g = this._gain(intensity * 0.016);
    this._pipe(s, hp, lp, g); s.start();
    this.ambient.push({ src: s, g, tag: 'rain' });
  }

  startFire(intensity = 0.15) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = 62;
    const wobble = this.ctx.createOscillator();
    wobble.frequency.value = 0.18;
    const wobbleGain = this._gain(10);
    wobble.connect(wobbleGain);
    wobbleGain.connect(o.frequency);

    const f = this._filter('lowpass', 110);
    const g = this._gain(Math.max(0.004, intensity * 0.14));
    this._pipe(o, f, g);
    o.start();
    wobble.start();
    this.ambient.push({ src: o, g, tag: 'fire' });
    this.ambient.push({ src: wobble, g: this._gain(0), tag: 'fire' });
  }

  // Persistent bug/insect ambient (chirps + buzzes)
  startBugs() {
    if (!this.ctx) return;
    const b = this.ctx.createOscillator();
    b.type = 'triangle'; b.frequency.value = 92;
    const wobble = this.ctx.createOscillator();
    wobble.frequency.value = 0.4;
    const wobbleGain = this._gain(10);
    wobble.connect(wobbleGain);
    wobbleGain.connect(b.frequency);
    const bf = this._filter('bandpass', 110, 3);
    const bg = this._gain(0.0014);
    this._pipe(b, bf, bg); b.start();
    wobble.start();
    this.ambient.push({ src: b, g: bg, tag: 'bugs' });
    this.ambient.push({ src: wobble, g: this._gain(0), tag: 'bugs' });
  }

  // Eerie drone that builds tension
  startDrone() {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    o.type = 'sine'; o.frequency.value = 55;
    const o2 = this.ctx.createOscillator();
    o2.type = 'sine'; o2.frequency.value = 56.5; // slight detune = beat frequency
    const g = this._gain(0.012);
    const g2 = this._gain(0.012);
    this._pipe(o, g); this._pipe(o2, g2);
    o.start(); o2.start();
    this.ambient.push({ src: o, g, tag: 'drone' });
    this.ambient.push({ src: o2, g: g2, tag: 'drone' });
  }

  stopAmbient(tag) {
    if (!this.ctx) return;
    this.ambient = this.ambient.filter(n => {
      if (n.tag === tag) {
        n.g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
        setTimeout(() => { try { n.src.stop(); } catch {} }, 2500);
        return false;
      }
      return true;
    });
  }

  setAmbientGain(tag, v) {
    for (const n of this.ambient) {
      if (n.tag === tag) n.g.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.5);
    }
  }

  /* === ONE-SHOTS === */

  // Footstep: muffled dirt crunch (Made louder)
  playFootstep() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const s = this._noise(0.09);
    const f = this._filter('lowpass', 400 + Math.random() * 500);
    const g = this._gain(0.45 + Math.random() * 0.15); // Much louder base gain
    g.gain.setValueAtTime(g.gain.value, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    this._pipe(s, f, g); s.start(t); s.stop(t + 0.12);
  }

  // Corn rustle: brushing past stalks while walking (Made louder)
  playCornRustle() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const s = this._noise(0.3);
    const f = this._filter('bandpass', 1700 + Math.random() * 900, 0.9);
    const g = this._gain(0.18 + Math.random() * 0.08); // Significantly louder
    g.gain.setValueAtTime(g.gain.value, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    this._pipe(s, f, g); s.start(t); s.stop(t + 0.35);
  }

  // Heavy jump scare: louder, layered, terrifying
  playJumpScare() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Harsh noise burst
    const s = this._noise(0.6);
    const f = this._filter('highpass', 350);
    const g = this._gain(1.0);
    g.gain.setValueAtTime(1.0, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
    this._pipe(s, f, g); s.start(t); s.stop(t + 0.7);
    // Deep sub thud
    const o = this.ctx.createOscillator();
    o.frequency.setValueAtTime(90, t);
    o.frequency.exponentialRampToValueAtTime(18, t + 0.4);
    const og = this._gain(0.9);
    og.gain.setValueAtTime(0.9, t);
    og.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    this._pipe(o, og); o.start(t); o.stop(t + 0.5);
    // High shriek
    const sh = this.ctx.createOscillator();
    sh.type = 'sawtooth';
    sh.frequency.setValueAtTime(1800, t);
    sh.frequency.linearRampToValueAtTime(3200, t + 0.12);
    sh.frequency.linearRampToValueAtTime(1200, t + 0.4);
    const sf = this._filter('bandpass', 2000, 3);
    const sg = this._gain(0.25);
    sg.gain.setValueAtTime(0.25, t);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    this._pipe(sh, sf, sg); sh.start(t); sh.stop(t + 0.45);
  }

  playScarecrowBoo() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const voice = this.ctx.createOscillator();
    voice.type = 'triangle';
    voice.frequency.setValueAtTime(260, t);
    voice.frequency.exponentialRampToValueAtTime(150, t + 0.18);
    voice.frequency.exponentialRampToValueAtTime(108, t + 0.55);
    const vf = this._filter('bandpass', 820, 2.4);
    const vg = this._gain(0);
    vg.gain.setValueAtTime(0.001, t);
    vg.gain.linearRampToValueAtTime(0.18, t + 0.03);
    vg.gain.linearRampToValueAtTime(0.11, t + 0.18);
    vg.gain.exponentialRampToValueAtTime(0.001, t + 0.58);
    this._pipe(voice, vf, vg); voice.start(t); voice.stop(t + 0.62);

    const chest = this.ctx.createOscillator();
    chest.type = 'sine';
    chest.frequency.setValueAtTime(86, t);
    chest.frequency.exponentialRampToValueAtTime(54, t + 0.38);
    const cg = this._gain(0);
    cg.gain.setValueAtTime(0.001, t);
    cg.gain.linearRampToValueAtTime(0.08, t + 0.04);
    cg.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
    this._pipe(chest, cg); chest.start(t); chest.stop(t + 0.45);

    const breath = this._noise(0.5);
    const bf = this._filter('bandpass', 620, 1.5);
    const bg = this._gain(0);
    bg.gain.setValueAtTime(0.001, t);
    bg.gain.linearRampToValueAtTime(0.045, t + 0.05);
    bg.gain.linearRampToValueAtTime(0.028, t + 0.16);
    bg.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    this._pipe(breath, bf, bg); breath.start(t); breath.stop(t + 0.52);
  }

  playCrow() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const at = t + i * 0.25;
      const o = this.ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(650 + Math.random() * 200, at);
      o.frequency.linearRampToValueAtTime(380, at + 0.12);
      const f = this._filter('bandpass', 550, 3);
      const g = this._gain(0);
      g.gain.setValueAtTime(0.12, at);
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.2);
      this._pipe(o, f, g); o.start(at); o.stop(at + 0.22);
    }
  }

  playThunder() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const s = this._noise(3.5);
    const f = this._filter('lowpass', 180);
    const g = this._gain(0);
    g.gain.setValueAtTime(0.01, t);
    g.gain.linearRampToValueAtTime(0.8, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.01, t + 3.5);
    this._pipe(s, f, g); s.start(t); s.stop(t + 4);
  }

  playExplosion() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const s = this._noise(1.5);
    const f = this._filter('lowpass', 280);
    const g = this._gain(1);
    g.gain.setValueAtTime(1, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 1.5);
    this._pipe(s, f, g); s.start(t); s.stop(t + 2);
  }

  playCatMeow() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.frequency.setValueAtTime(480, t);
    o.frequency.linearRampToValueAtTime(850, t + 0.18);
    o.frequency.linearRampToValueAtTime(380, t + 0.55);
    const g = this._gain(0);
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
    this._pipe(o, g); o.start(t); o.stop(t + 0.65);
  }

  playHeartbeat(bpm = 90) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const iv = 60 / bpm;
    for (let i = 0; i < 8; i++) {
      const at = t + i * iv;
      const o = this.ctx.createOscillator();
      o.frequency.value = 42;
      const g = this._gain(0);
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(0.35, at + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.25);
      this._pipe(o, g); o.start(at); o.stop(at + 0.28);
    }
  }

  playWhisper() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const s = this._noise(3);
    const f = this._filter('bandpass', 2200, 8);
    const g = this._gain(0);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.06, t + 0.8);
    g.gain.linearRampToValueAtTime(0, t + 3);
    this._pipe(s, f, g); s.start(t); s.stop(t + 3.5);
  }

  playRustle() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const s = this._noise(0.3);
    const f = this._filter('bandpass', 2100, 1);
    const g = this._gain(0.05);
    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    this._pipe(s, f, g); s.start(t); s.stop(t + 0.35);
  }

  // Distant scream (faint, unsettling)
  playDistantScream() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(600, t);
    o.frequency.linearRampToValueAtTime(1400, t + 0.6);
    o.frequency.linearRampToValueAtTime(500, t + 2);
    const f = this._filter('bandpass', 900, 4);
    const g = this._gain(0);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.03, t + 0.3);
    g.gain.linearRampToValueAtTime(0.05, t + 0.6);
    g.gain.exponentialRampToValueAtTime(0.001, t + 2.2);
    this._pipe(o, f, g); o.start(t); o.stop(t + 2.5);
  }

  // Owl hoot
  playOwl() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      const at = t + i * 0.8;
      const o = this.ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(420, at);
      o.frequency.linearRampToValueAtTime(380, at + 0.3);
      const g = this._gain(0);
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(0.08, at + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.35);
      this._pipe(o, g); o.start(at); o.stop(at + 0.4);
    }
  }

  // Something moving in corn nearby (stereo rustle sequence)
  playSomethingMoving() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const at = t + i * 0.18 + Math.random() * 0.08;
      const s = this._noise(0.12);
      const f = this._filter('bandpass', 1400 + Math.random() * 1200, 1.2);
      const g = this._gain(0.028 + i * 0.01);
      g.gain.setValueAtTime(g.gain.value, at);
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.12);
      this._pipe(s, f, g); s.start(at); s.stop(at + 0.15);
    }
  }

  // Breathing (close, heavy)
  playBreathing() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const at = t + i * 1.2;
      const s = this._noise(0.8);
      const f = this._filter('bandpass', 400, 2);
      const g = this._gain(0);
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(0.06, at + 0.25);
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.8);
      this._pipe(s, f, g); s.start(at); s.stop(at + 0.9);
    }
  }

  playLightningStrike() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const s = this._noise(0.15);
    const g = this._gain(1);
    g.gain.setValueAtTime(1, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    this._pipe(s, g); s.start(t); s.stop(t + 0.2);
    setTimeout(() => this.playThunder(), 100);
  }

  playFireCrackle() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const at = t + Math.random() * 0.4;
      const s = this._noise(0.07);
      const f = this._filter('bandpass', 1500 + Math.random() * 2500, 2);
      const g = this._gain(0.07);
      g.gain.setValueAtTime(0.07, at);
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.07);
      this._pipe(s, f, g); s.start(at); s.stop(at + 0.1);
    }
  }

  // Cough: two-stage throat/chest burst with a softer rasp tail.
  playCough(intensity = 0.5) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const vol = 0.22 + intensity * 0.24;
    const firstDur = 0.16 + intensity * 0.08;
    const secondDur = 0.12 + intensity * 0.08;
    const secondAt = t + 0.08 + intensity * 0.035;

    const burst1 = this._noise(firstDur);
    const body1 = this._filter('bandpass', 720 + Math.random() * 90, 1.35);
    const rasp1 = this._filter('highpass', 2100 + intensity * 300);
    const bodyGain1 = this._gain(0);
    const raspGain1 = this._gain(0);
    bodyGain1.gain.setValueAtTime(0, t);
    bodyGain1.gain.linearRampToValueAtTime(vol, t + 0.012);
    bodyGain1.gain.exponentialRampToValueAtTime(0.001, t + firstDur);
    raspGain1.gain.setValueAtTime(0, t);
    raspGain1.gain.linearRampToValueAtTime(vol * 0.22, t + 0.01);
    raspGain1.gain.exponentialRampToValueAtTime(0.001, t + firstDur * 0.8);
    burst1.connect(rasp1); rasp1.connect(raspGain1); raspGain1.connect(this.master);
    this._pipe(burst1, body1, bodyGain1); burst1.start(t); burst1.stop(t + firstDur + 0.03);

    const burst2 = this._noise(secondDur);
    const body2 = this._filter('bandpass', 840 + Math.random() * 110, 1.15);
    const bodyGain2 = this._gain(0);
    bodyGain2.gain.setValueAtTime(0, secondAt);
    bodyGain2.gain.linearRampToValueAtTime(vol * 0.72, secondAt + 0.01);
    bodyGain2.gain.exponentialRampToValueAtTime(0.001, secondAt + secondDur);
    this._pipe(burst2, body2, bodyGain2); burst2.start(secondAt); burst2.stop(secondAt + secondDur + 0.03);

    const throat = this.ctx.createOscillator();
    throat.type = 'triangle';
    throat.frequency.setValueAtTime(145, t);
    throat.frequency.exponentialRampToValueAtTime(92, t + 0.12);
    throat.frequency.exponentialRampToValueAtTime(70, secondAt + secondDur);
    const throatFilter = this._filter('lowpass', 520);
    const throatGain = this._gain(0);
    throatGain.gain.setValueAtTime(0.001, t);
    throatGain.gain.linearRampToValueAtTime(vol * 0.55, t + 0.018);
    throatGain.gain.exponentialRampToValueAtTime(0.001, secondAt + secondDur + 0.05);
    this._pipe(throat, throatFilter, throatGain);
    throat.start(t);
    throat.stop(secondAt + secondDur + 0.08);

    if (intensity > 0.42) {
      const tailAt = secondAt + secondDur * 0.55;
      const tail = this._noise(0.18);
      const tailFilter = this._filter('bandpass', 1800 + Math.random() * 300, 2.2);
      const tailGain = this._gain(0);
      tailGain.gain.setValueAtTime(0, tailAt);
      tailGain.gain.linearRampToValueAtTime(vol * 0.12, tailAt + 0.03);
      tailGain.gain.exponentialRampToValueAtTime(0.001, tailAt + 0.18);
      this._pipe(tail, tailFilter, tailGain);
      tail.start(tailAt);
      tail.stop(tailAt + 0.2);
    }
  }

  // Intense suffocation coughing fit (rapid, desperate)
  playSuffocationFit() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const at = t + i * 0.28 + Math.random() * 0.06;
      const dur = 0.2 + Math.random() * 0.1;
      const vol = 0.5 + Math.random() * 0.3; // Louder end coughs

      const s = this._noise(dur);
      const f = this._filter('bandpass', 750 + Math.random() * 100, 1.5);
      
      const fh = this._filter('highpass', 2400);
      const gh = this._gain(vol * 0.3);
      s.connect(fh); fh.connect(gh); gh.connect(this.master);

      const g = this._gain(0);
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(vol, at + 0.015);
      g.gain.exponentialRampToValueAtTime(vol * 0.2, at + dur * 0.5);
      g.gain.linearRampToValueAtTime(vol * 0.35, at + dur * 0.6);
      g.gain.exponentialRampToValueAtTime(0.001, at + dur);
      this._pipe(s, f, g); s.start(at); s.stop(at + dur + 0.05);

      // Each cough has a body thud
      const o = this.ctx.createOscillator();
      o.frequency.setValueAtTime(65, at);
      o.frequency.exponentialRampToValueAtTime(28, at + 0.1);
      const og = this._gain(vol * 0.8);
      og.gain.setValueAtTime(vol * 0.8, at);
      og.gain.exponentialRampToValueAtTime(0.001, at + 0.12);
      this._pipe(o, og); o.start(at); o.stop(at + 0.12);
    }

    // Desperate gasping wheeze after the fit
    const gasp = this._noise(1.2);
    const gf = this._filter('bandpass', 1800, 6);
    const gg = this._gain(0);
    const gStart = t + 1.8;
    gg.gain.setValueAtTime(0, gStart);
    gg.gain.linearRampToValueAtTime(0.12, gStart + 0.2);
    gg.gain.exponentialRampToValueAtTime(0.001, gStart + 1.2);
    this._pipe(gasp, gf, gg); gasp.start(gStart); gasp.stop(gStart + 1.3);
  }

  /* === SPATIAL AUDIO === */

  // Create a PannerNode for 3D positioned sound
  _panner(x, y, z) {
    if (!this.ctx) return null;
    const p = this.ctx.createPanner();
    p.panningModel = 'HRTF';
    p.distanceModel = 'inverse';
    p.refDistance = 5;
    p.maxDistance = 200;
    p.rolloffFactor = 1.2;
    p.coneInnerAngle = 360;
    p.coneOuterAngle = 360;
    p.setPosition(x, y, z);
    return p;
  }

  // Pipe through panner → master (spatial version of _pipe)
  _pipeSpatial(src, panner, ...nodes) {
    let p = src;
    for (const n of nodes) { p.connect(n); p = n; }
    p.connect(panner);
    panner.connect(this.master);
    return src;
  }

  // Update listener position/orientation (call every frame)
  updateListenerPosition(pos, forward, up) {
    if (!this.ctx || !this.ctx.listener) return;
    const L = this.ctx.listener;
    if (L.positionX) {
      L.positionX.value = pos.x;
      L.positionY.value = pos.y;
      L.positionZ.value = pos.z;
      L.forwardX.value = forward.x;
      L.forwardY.value = forward.y;
      L.forwardZ.value = forward.z;
      L.upX.value = up.x;
      L.upY.value = up.y;
      L.upZ.value = up.z;
    } else {
      L.setPosition(pos.x, pos.y, pos.z);
      L.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
    }
  }

  // Car passing on highway: engine rumble + tire hiss, Doppler-like sweep
  // Returns duration (ms) so caller can sync headlights
  playCarPassing(startX, startY, startZ, endX, endY, endZ) {
    if (!this.ctx) return 3000;
    const t = this.ctx.currentTime;
    const dur = 2.8 + Math.random() * 1.5;

    // Engine rumble (low frequency oscillator)
    const eng = this.ctx.createOscillator();
    eng.type = 'sawtooth';
    // Doppler: pitch rises as car approaches, drops as it passes
    eng.frequency.setValueAtTime(55, t);
    eng.frequency.linearRampToValueAtTime(72, t + dur * 0.4);
    eng.frequency.linearRampToValueAtTime(48, t + dur);
    const engFilt = this._filter('lowpass', 140);
    const engG = this._gain(0);
    engG.gain.setValueAtTime(0.001, t);
    engG.gain.linearRampToValueAtTime(0.35, t + dur * 0.35);
    engG.gain.linearRampToValueAtTime(0.4, t + dur * 0.45);
    engG.gain.exponentialRampToValueAtTime(0.001, t + dur);

    // Tire noise (high-pass filtered noise)
    const tire = this._noise(dur);
    const tireHP = this._filter('highpass', 800);
    const tireLP = this._filter('lowpass', 3500);
    const tireG = this._gain(0);
    tireG.gain.setValueAtTime(0.001, t);
    tireG.gain.linearRampToValueAtTime(0.12, t + dur * 0.35);
    tireG.gain.exponentialRampToValueAtTime(0.001, t + dur);

    // Animate panner position along highway path
    const panner = this._panner(startX, startY, startZ);
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const st = t + dur * frac;
      const px = startX + (endX - startX) * frac;
      const py = startY + (endY - startY) * frac;
      const pz = startZ + (endZ - startZ) * frac;
      // Schedule position updates via gain automation timing
      setTimeout(() => {
        try { panner.setPosition(px, py, pz); } catch {}
      }, frac * dur * 1000);
    }

    this._pipeSpatial(eng, panner, engFilt, engG);
    // Tire shares the same panner
    let p = tire;
    p.connect(tireHP); p = tireHP;
    p.connect(tireLP); p = tireLP;
    p.connect(tireG); p = tireG;
    p.connect(panner);

    eng.start(t); eng.stop(t + dur + 0.1);
    tire.start(t); tire.stop(t + dur + 0.1);

    return dur * 1000;
  }
}
