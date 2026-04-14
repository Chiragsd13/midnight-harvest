import * as THREE from 'three';

function createMistTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;

  const grad = ctx.createRadialGradient(center, center, size * 0.08, center, center, size * 0.48);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
  grad.addColorStop(0.38, 'rgba(218, 224, 236, 0.28)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 8 + Math.random() * 18;
    const puff = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
    puff.addColorStop(0, 'rgba(255,255,255,0.45)');
    puff.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = puff;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class Effects {
  constructor(scene) {
    this.scene = scene;
    this.rain = null;
    this.rainActive = false;
    this.rainVelocities = null;

    this.snow = null;
    this.snowActive = false;
    this.snowVelocities = null;

    this.fireParticles = null;
    this.fireVelocities = null;

    this.fireflies = null;
    this.fireflyData = null;

    this.dust = null;
    this.dustVel = null;

    this.groundMist = [];
    this.groundMistData = [];

    this.ash = null;
    this.ashVel = null;
    this.ashColors = null;
  }

  /* ---- fireflies (warm pinpoints of life drifting in the field) ---- */
  createFireflies(count = 90) {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const data = new Array(count);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 60;
      pos[i * 3]     = Math.cos(a) * r;
      pos[i * 3 + 1] = 0.5 + Math.random() * 2.5;
      pos[i * 3 + 2] = Math.sin(a) * r;
      // Warm yellow-green glow
      col[i * 3]     = 0.85 + Math.random() * 0.15;
      col[i * 3 + 1] = 0.95;
      col[i * 3 + 2] = 0.35 + Math.random() * 0.25;
      data[i] = {
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.9,
        radius: 0.6 + Math.random() * 1.2,
        blinkPhase: Math.random() * Math.PI * 2,
        blinkSpeed: 1.0 + Math.random() * 1.8,
        driftX: (Math.random() - 0.5) * 0.4,
        driftZ: (Math.random() - 0.5) * 0.4,
      };
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.fireflies = new THREE.Points(geo, mat);
    this.fireflyData = data;
    this.scene.add(this.fireflies);
  }

  updateFireflies(dt, playerPos, elapsed, fireProgress = 0) {
    if (!this.fireflies) return;
    const p = this.fireflies.geometry.attributes.position;
    const c = this.fireflies.geometry.attributes.color;
    const survival = 1 - Math.max(0, fireProgress - 0.12) * 1.35;
    for (let i = 0; i < p.count; i++) {
      const d = this.fireflyData[i];
      d.phase += dt * d.speed;
      d.blinkPhase += dt * d.blinkSpeed;

      let x = p.getX(i) + d.driftX * dt + Math.cos(d.phase) * d.radius * dt;
      let y = p.getY(i) + Math.sin(d.phase * 0.8) * 0.4 * dt;
      let z = p.getZ(i) + d.driftZ * dt + Math.sin(d.phase * 1.1) * d.radius * dt;

      // Keep fireflies within a loose sphere around the player — gives the
      // illusion of an always-populated field without needing 10000 points.
      const dx = x - playerPos.x;
      const dz = z - playerPos.z;
      const dist2 = dx * dx + dz * dz;
      if (dist2 > 70 * 70 || y < 0.2 || y > 4) {
        const a = Math.random() * Math.PI * 2;
        const r = 10 + Math.random() * 45;
        x = playerPos.x + Math.cos(a) * r;
        z = playerPos.z + Math.sin(a) * r;
        y = 0.6 + Math.random() * 2.4;
      }
      p.setXYZ(i, x, y, z);

      // Slow blink: opacity is global, but tint color intensity per-vertex.
      const blink = (0.35 + (Math.sin(d.blinkPhase) * 0.5 + 0.5) * 0.65) * Math.max(0, survival);
      c.setXYZ(i,
        (0.85 + i * 0.001) * blink,
        0.95 * blink,
        0.4 * blink
      );
    }
    p.needsUpdate = true;
    c.needsUpdate = true;
  }

  /* ---- floating dust motes (moonlit specks, subtle atmosphere) ---- */
  createDust(count = 280) {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 90;
      pos[i * 3 + 1] = 0.2 + Math.random() * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 90;
      vel[i * 3]     = (Math.random() - 0.5) * 0.15;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.08;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.15;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x6a7088,
      size: 0.04,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    this.dust = new THREE.Points(geo, mat);
    this.dustVel = vel;
    this.scene.add(this.dust);
  }

  updateDust(dt, playerPos, wind) {
    if (!this.dust) return;
    const p = this.dust.geometry.attributes.position;
    const v = this.dustVel;
    const wx = wind ? wind.x * 0.8 : 0;
    const wz = wind ? wind.z * 0.8 : 0;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i) + (v[i * 3] + wx) * dt;
      let y = p.getY(i) + v[i * 3 + 1] * dt;
      let z = p.getZ(i) + (v[i * 3 + 2] + wz) * dt;
      const dx = x - playerPos.x;
      const dz = z - playerPos.z;
      if (dx * dx + dz * dz > 45 * 45 || y < 0 || y > 5) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * 42;
        x = playerPos.x + Math.cos(a) * r;
        z = playerPos.z + Math.sin(a) * r;
        y = 0.2 + Math.random() * 4;
      }
      p.setXYZ(i, x, y, z);
    }
    p.needsUpdate = true;
  }

  createGroundMist(count = 18) {
    const texture = createMistTexture();
    this.groundMist = [];
    this.groundMistData = [];

    for (let i = 0; i < count; i++) {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texture,
          color: 0x8d96ab,
          transparent: true,
          opacity: 0.08,
          depthWrite: false,
        })
      );
      const data = {
        driftX: (Math.random() - 0.5) * 0.65,
        driftZ: (Math.random() - 0.5) * 0.65,
        bob: Math.random() * Math.PI * 2,
        radius: 8 + Math.random() * 28,
        baseY: 0.9 + Math.random() * 1.2,
        scaleX: 18 + Math.random() * 18,
        scaleY: 7 + Math.random() * 5,
        opacity: 0.65 + Math.random() * 0.55,
      };
      sprite.position.set((Math.random() - 0.5) * 20, data.baseY, (Math.random() - 0.5) * 20);
      sprite.scale.set(data.scaleX, data.scaleY, 1);
      this.scene.add(sprite);
      this.groundMist.push(sprite);
      this.groundMistData.push(data);
    }
  }

  updateGroundMist(dt, playerPos, wind, fireProgress, weather) {
    if (!this.groundMist.length) return;

    const baseOpacity = (
      weather === 'foggy' ? 0.16 :
      weather === 'storm' ? 0.12 :
      weather === 'rain' ? 0.09 :
      weather === 'snow' ? 0.11 :
      0.06
    ) + fireProgress * 0.11;
    const wx = wind ? wind.x * 0.55 : 0;
    const wz = wind ? wind.z * 0.55 : 0;

    for (let i = 0; i < this.groundMist.length; i++) {
      const sprite = this.groundMist[i];
      const data = this.groundMistData[i];
      data.bob += dt * (0.18 + i * 0.002);

      sprite.position.x += (data.driftX + wx) * dt;
      sprite.position.z += (data.driftZ + wz) * dt;
      sprite.position.y = data.baseY + Math.sin(data.bob) * 0.18;

      const dx = sprite.position.x - playerPos.x;
      const dz = sprite.position.z - playerPos.z;
      const dist2 = dx * dx + dz * dz;

      if (dist2 > 48 * 48) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 12 + Math.random() * 32;
        sprite.position.x = playerPos.x + Math.cos(angle) * radius;
        sprite.position.z = playerPos.z + Math.sin(angle) * radius;
        data.baseY = 0.8 + Math.random() * 1.4;
      }

      const warm = Math.min(1, Math.max(0, fireProgress - 0.18) * 1.4);
      sprite.material.color.setRGB(
        0.55 + warm * 0.22,
        0.58 + warm * 0.04,
        0.68 - warm * 0.22
      );
      sprite.material.opacity = baseOpacity * data.opacity * (0.82 + Math.sin(data.bob + i) * 0.12);
      sprite.scale.set(
        data.scaleX * (1 + fireProgress * 0.2),
        data.scaleY * (1 + fireProgress * 0.16),
        1
      );
    }
  }

  createAsh(count = 240) {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = -20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      vel[i * 3] = (Math.random() - 0.5) * 0.7;
      vel[i * 3 + 1] = 0.7 + Math.random() * 1.6;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.7;

      const ember = Math.random();
      col[i * 3] = ember > 0.74 ? 1 : 0.55 + Math.random() * 0.18;
      col[i * 3 + 1] = ember > 0.74 ? 0.55 + Math.random() * 0.2 : 0.48 + Math.random() * 0.12;
      col[i * 3 + 2] = ember > 0.74 ? 0.12 : 0.12 + Math.random() * 0.12;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.ash = new THREE.Points(geo, mat);
    this.ashVel = vel;
    this.ashColors = col;
    this.scene.add(this.ash);
  }

  updateAsh(dt, playerPos, wind, fireProgress) {
    if (!this.ash) return;

    const opacity = Math.max(0, fireProgress - 0.08) * 0.95;
    this.ash.material.opacity = Math.min(0.78, opacity);
    if (opacity <= 0) return;

    const p = this.ash.geometry.attributes.position;
    const v = this.ashVel;
    const c = this.ash.geometry.attributes.color;
    const wx = wind ? wind.x * 1.4 : 0;
    const wz = wind ? wind.z * 1.4 : 0;
    const radius = 12 + fireProgress * 36;

    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i) + (v[i * 3] + wx) * dt;
      let y = p.getY(i) + (v[i * 3 + 1] + fireProgress * 1.3) * dt;
      let z = p.getZ(i) + (v[i * 3 + 2] + wz) * dt;

      const dx = x - playerPos.x;
      const dz = z - playerPos.z;
      if (y > 10 + fireProgress * 7 || dx * dx + dz * dz > 52 * 52 || y < 0.2) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * radius;
        x = playerPos.x + Math.cos(angle) * r;
        y = 0.25 + Math.random() * 3.2;
        z = playerPos.z + Math.sin(angle) * r;

        const ember = Math.random() < 0.24 + fireProgress * 0.2;
        c.setXYZ(
          i,
          ember ? 1 : 0.52 + Math.random() * 0.18,
          ember ? 0.42 + Math.random() * 0.2 : 0.44 + Math.random() * 0.12,
          ember ? 0.06 + Math.random() * 0.12 : 0.1 + Math.random() * 0.1
        );
      }

      p.setXYZ(i, x, y, z);
    }

    p.needsUpdate = true;
    c.needsUpdate = true;
  }

  /* ---- rain ---- */
  createRain(count = 5000) {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 120;
      pos[i * 3 + 1] = Math.random() * 35;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 120;
      vel[i * 3]     = 0;
      vel[i * 3 + 1] = 14 + Math.random() * 10;
      vel[i * 3 + 2] = 0;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x8899bb, size: 0.08, transparent: true, opacity: 0.5,
    });
    this.rain = new THREE.Points(geo, mat);
    this.rain.visible = false;
    this.rainVelocities = vel;
    this.scene.add(this.rain);
  }

  startRain() { if (this.rain) { this.rain.visible = true; this.rainActive = true; } }
  stopRain()  { if (this.rain) { this.rain.visible = false; this.rainActive = false; } }

  updateRain(dt, playerPos, wind) {
    if (!this.rainActive || !this.rain) return;
    const p = this.rain.geometry.attributes.position;
    const v = this.rainVelocities;
    for (let i = 0; i < p.count; i++) {
      const wx = wind ? wind.x * 3 : 0;
      const wz = wind ? wind.z * 3 : 0;
      let x = p.getX(i) + wx * dt;
      let y = p.getY(i) - v[i * 3 + 1] * dt;
      let z = p.getZ(i) + wz * dt;

      if (y < 0) {
        y = 30 + Math.random() * 5;
        x = playerPos.x + (Math.random() - 0.5) * 120;
        z = playerPos.z + (Math.random() - 0.5) * 120;
      }
      p.setXYZ(i, x, y, z);
    }
    p.needsUpdate = true;
  }

  /* ---- snow ---- */
  createSnow(count = 3000) {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 120;
      pos[i * 3 + 1] = Math.random() * 35;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 120;
      vel[i * 3]     = (Math.random() - 0.5) * 0.8;
      vel[i * 3 + 1] = 1.2 + Math.random() * 1.5;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xddddee, size: 0.12, transparent: true, opacity: 0.7,
    });
    this.snow = new THREE.Points(geo, mat);
    this.snow.visible = false;
    this.snowVelocities = vel;
    this.scene.add(this.snow);
  }

  startSnow() { if (this.snow) { this.snow.visible = true; this.snowActive = true; } }
  stopSnow()  { if (this.snow) { this.snow.visible = false; this.snowActive = false; } }

  updateSnow(dt, playerPos, wind) {
    if (!this.snowActive || !this.snow) return;
    const p = this.snow.geometry.attributes.position;
    const v = this.snowVelocities;
    for (let i = 0; i < p.count; i++) {
      const wx = wind ? wind.x * 1.5 : 0;
      const wz = wind ? wind.z * 1.5 : 0;
      const swirl = Math.sin(dt * 2 + i * 0.1) * 0.3;
      let x = p.getX(i) + (v[i * 3] + wx + swirl) * dt;
      let y = p.getY(i) - v[i * 3 + 1] * dt;
      let z = p.getZ(i) + (v[i * 3 + 2] + wz) * dt;

      if (y < 0) {
        y = 30 + Math.random() * 5;
        x = playerPos.x + (Math.random() - 0.5) * 120;
        z = playerPos.z + (Math.random() - 0.5) * 120;
      }
      p.setXYZ(i, x, y, z);
    }
    p.needsUpdate = true;
  }

  /* ---- fire/ember particles ---- */
  createFireParticles(count = 800) {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = 0; pos[i * 3 + 1] = -10; pos[i * 3 + 2] = 0;
      vel[i * 3]     = (Math.random() - 0.5) * 2;
      vel[i * 3 + 1] = 1 + Math.random() * 3;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xff6622, size: 0.15, transparent: true, opacity: 0.7,
    });
    this.fireParticles = new THREE.Points(geo, mat);
    this.fireVelocities = vel;
    this.scene.add(this.fireParticles);
  }

  updateFireParticles(dt, fireOrigin, progress, wind) {
    if (!this.fireParticles || progress < 0.05) return;
    const p = this.fireParticles.geometry.attributes.position;
    const v = this.fireVelocities;
    const radius = 15 + progress * 70;
    const wx = wind ? wind.x * 2 : 0;
    const wz = wind ? wind.z * 2 : 0;

    for (let i = 0; i < p.count; i++) {
      if (i > p.count * progress * 1.5) break;

      let x = p.getX(i) + (v[i * 3] + wx) * dt;
      let y = p.getY(i) + v[i * 3 + 1] * dt;
      let z = p.getZ(i) + (v[i * 3 + 2] + wz) * dt;

      if (y > 7 || y < -5) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * radius;
        x = fireOrigin.x + Math.cos(a) * r;
        y = Math.random() * 0.5;
        z = fireOrigin.z + Math.sin(a) * r;
      }
      p.setXYZ(i, x, y, z);
    }
    p.needsUpdate = true;
  }

  /* ---- weather management ---- */
  setWeather(weather, audio) {
    switch (weather) {
      case 'clear':
        this.stopRain();
        this.stopSnow();
        audio.stopAmbient('rain');
        break;
      case 'foggy':
        this.stopRain();
        this.stopSnow();
        audio.stopAmbient('rain');
        break;
      case 'rain':
        this.startRain();
        this.stopSnow();
        audio.startRain(0.28);
        break;
      case 'storm':
        this.startRain();
        this.stopSnow();
        audio.startRain(0.42);
        break;
      case 'snow':
        this.stopRain();
        this.startSnow();
        audio.stopAmbient('rain');
        break;
    }
  }

  /* ---- screen effects (static) ---- */
  static damageFlash() {
    const el = document.getElementById('damage-overlay');
    if (!el) return;
    el.style.opacity = '0.85';
    setTimeout(() => { el.style.opacity = '0'; }, 400);
  }

  static scareFlash() {
    const el = document.getElementById('scare-overlay');
    if (!el) return;
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 280);
  }

  static updateSmoke(progress) {
    const el = document.getElementById('smoke-overlay');
    if (!el) return;
    // Smoke becomes progressively more opaque. Visible by ~15% progress,
    // reaches nearly suffocating density by the last minute.
    // progress 0.0  → 0 opacity
    // progress 0.15 → ~0.22
    // progress 0.50 → ~0.65
    // progress 0.85 → ~0.92
    // progress 1.00 → 1
    const eased = Math.min(1, Math.pow(progress, 0.8) * 1.05);
    el.style.opacity = String(eased * 0.5);
  }
}
