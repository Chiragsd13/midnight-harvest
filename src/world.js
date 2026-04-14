import * as THREE from 'three';

function createMoonTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;
  const radius = size * 0.31;

  const glow = ctx.createRadialGradient(
    center * 0.86,
    center * 0.78,
    radius * 0.1,
    center,
    center,
    radius * 1.8,
  );
  glow.addColorStop(0, 'rgba(255, 247, 231, 0.98)');
  glow.addColorStop(0.38, 'rgba(228, 230, 236, 0.95)');
  glow.addColorStop(0.72, 'rgba(158, 170, 194, 0.55)');
  glow.addColorStop(1, 'rgba(120, 136, 165, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = 'rgba(225, 229, 234, 0.96)';
  ctx.fillRect(0, 0, size, size);

  ctx.globalAlpha = 0.22;
  ctx.fillStyle = 'rgba(124, 136, 156, 0.9)';
  for (const [x, y, r] of [
    [0.37, 0.42, 0.06],
    [0.55, 0.35, 0.045],
    [0.62, 0.57, 0.075],
    [0.44, 0.63, 0.05],
  ]) {
    ctx.beginPath();
    ctx.arc(size * x, size * y, size * r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createHaloTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const center = size / 2;
  const grad = ctx.createRadialGradient(center, center, size * 0.08, center, center, size * 0.5);
  grad.addColorStop(0, 'rgba(190, 202, 232, 0.5)');
  grad.addColorStop(0.45, 'rgba(118, 130, 160, 0.18)');
  grad.addColorStop(1, 'rgba(118, 130, 160, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createStalkTexture() {
  const w = 64, h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#2a3518';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 45; i++) {
    const x = Math.random() * w;
    ctx.strokeStyle = `rgba(${18 + Math.random() * 28}, ${28 + Math.random() * 35}, ${8 + Math.random() * 16}, ${0.14 + Math.random() * 0.22})`;
    ctx.lineWidth = 0.3 + Math.random() * 0.9;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (Math.random() - 0.5) * 5, h); ctx.stroke();
  }
  for (let n = 0; n < 4; n++) {
    const y = (n + 0.5) * (h / 4.5);
    ctx.fillStyle = `rgba(42, 50, 22, ${0.22 + Math.random() * 0.18})`;
    ctx.fillRect(0, y - 2, w, 5);
    ctx.fillStyle = 'rgba(12, 15, 6, 0.28)';
    ctx.fillRect(0, y + 2, w, 2);
  }
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 48 : 10}, ${Math.random() > 0.5 ? 52 : 18}, 10, ${0.04 + Math.random() * 0.07})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random(), 1 + Math.random() * 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createLeafTexture() {
  const w = 128, h = 24;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#2d4520';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(55, 72, 30, 0.65)';
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
  for (let i = 0; i < 16; i++) {
    const x = (i / 16) * w + Math.random() * 4;
    ctx.strokeStyle = `rgba(48, 62, 26, ${0.18 + Math.random() * 0.24})`;
    ctx.lineWidth = 0.3 + Math.random() * 0.3;
    ctx.beginPath(); ctx.moveTo(x, h / 2); ctx.lineTo(x + 6 + Math.random() * 5, 1 + Math.random() * 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, h / 2); ctx.lineTo(x + 6 + Math.random() * 5, h - 1 - Math.random() * 3); ctx.stroke();
  }
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * w;
    const y = Math.random() < 0.5 ? Math.random() * 5 : h - Math.random() * 5;
    ctx.fillStyle = `rgba(${55 + Math.random() * 40}, ${38 + Math.random() * 18}, 12, ${0.22 + Math.random() * 0.32})`;
    ctx.beginPath(); ctx.arc(x, y, 1.5 + Math.random() * 3, 0, Math.PI * 2); ctx.fill();
  }
  const tipGrad = ctx.createLinearGradient(w - 22, 0, w, 0);
  tipGrad.addColorStop(0, 'rgba(60, 45, 18, 0)');
  tipGrad.addColorStop(1, 'rgba(60, 45, 18, 0.38)');
  ctx.fillStyle = tipGrad;
  ctx.fillRect(w - 22, 0, 22, h);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createLightningGlowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const c = size / 2;
  const grad = ctx.createRadialGradient(c, c, 0, c, c, c);
  grad.addColorStop(0, 'rgba(190, 210, 255, 0.7)');
  grad.addColorStop(0.25, 'rgba(140, 170, 230, 0.35)');
  grad.addColorStop(0.6, 'rgba(100, 130, 200, 0.08)');
  grad.addColorStop(1, 'rgba(80, 100, 160, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createGroundTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Base soil
  ctx.fillStyle = '#1a150e';
  ctx.fillRect(0, 0, size, size);

  // Soil grain noise (sand/dirt particles)
  for (let i = 0; i < 9000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const b = Math.random();
    if (b < 0.3) {
      ctx.fillStyle = `rgba(${15 + Math.random() * 20}, ${12 + Math.random() * 15}, ${8 + Math.random() * 10}, ${0.25 + Math.random() * 0.35})`;
    } else if (b < 0.65) {
      ctx.fillStyle = `rgba(${30 + Math.random() * 25}, ${24 + Math.random() * 18}, ${16 + Math.random() * 12}, ${0.2 + Math.random() * 0.25})`;
    } else {
      // Sandy lighter specks
      ctx.fillStyle = `rgba(${42 + Math.random() * 30}, ${36 + Math.random() * 22}, ${24 + Math.random() * 15}, ${0.12 + Math.random() * 0.18})`;
    }
    ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }

  // Dried-mud cracks
  for (let i = 0; i < 35; i++) {
    ctx.strokeStyle = `rgba(${8 + Math.random() * 12}, ${6 + Math.random() * 8}, ${4 + Math.random() * 6}, ${0.25 + Math.random() * 0.3})`;
    ctx.lineWidth = 0.3 + Math.random() * 0.7;
    ctx.beginPath();
    let x = Math.random() * size, y = Math.random() * size;
    ctx.moveTo(x, y);
    for (let s = 0; s < 3 + Math.floor(Math.random() * 5); s++) {
      x += (Math.random() - 0.5) * 28;
      y += (Math.random() - 0.5) * 28;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Small pebbles / stone fragments
  for (let i = 0; i < 65; i++) {
    ctx.fillStyle = `rgba(${25 + Math.random() * 30}, ${20 + Math.random() * 25}, ${15 + Math.random() * 18}, ${0.35 + Math.random() * 0.4})`;
    const x = Math.random() * size, y = Math.random() * size;
    const r = 1 + Math.random() * 3;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.6 + Math.random() * 0.4), Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Darker organic decomposition patches
  for (let i = 0; i < 18; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const r = 8 + Math.random() * 22;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(${10 + Math.random() * 8}, ${8 + Math.random() * 6}, ${5 + Math.random() * 5}, ${0.18 + Math.random() * 0.18})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(110, 110);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class World {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060913);
    // Very large field — fog hides the edges, and the corn patch recenters
    // around the player so the rows keep reading as endless.
    this.fieldSize = 180;
    this.stalkData = [];
    this.landmines = [];
    this.exitPos = new THREE.Vector3();
    this.exitDir = new THREE.Vector3();
    this.lightningLight = null;
    this.fireLight = null;
    this.fireOrigin = new THREE.Vector3();
    this.moonLight = null;
    this.rimLight = null;
    this.playerFillLight = null;
    this.moonSprite = null;
    this.moonHalos = [];
    this.horizonShells = [];
    this.horizonSilhouettes = [];

    // Wind system
    this.wind = { x: 0, z: 0, strength: 0, time: 0 };
    this.cornGroup = new THREE.Group();
    this.cornAnchorStep = 72;
    this.stalks = null;
    this.leaves = null;
  }

  build() {
    this._ground();
    this._groundDetails();
    this._sky();
    this._corn();
    this._lighting();
    this._fog();
    this._horizon();
    this._highway();
    this._mines();
    this._fireSetup();
    this._fieldProps();
    return this.scene;
  }

  /* ---- realistic ground with varied textures (true midnight palette) ---- */
  _ground() {
    // Main ground plane with vertex colors for soil/grass variation
    const size = 2400;
    const seg = 280;
    const g = new THREE.PlaneGeometry(size, size, seg, seg);
    const p = g.attributes.position;

    // Vertex colors for natural ground variation — all very dark, as real
    // moonlit dirt would appear. The brightest patch is barely brighter than
    // the darkest. Fire light and the moon DirectionalLight provide
    // real-time illumination on top of these base colors.
    const colors = new Float32Array(p.count * 3);
    const baseColors = [
      [0.064, 0.052, 0.034],  // deep wet soil
      [0.078, 0.064, 0.040],  // medium soil
      [0.054, 0.044, 0.028],  // shadowed dirt
      [0.074, 0.066, 0.038],  // dry earth
      [0.055, 0.064, 0.034],  // dark grass-dirt mix
      [0.068, 0.058, 0.038],  // clay
      [0.045, 0.038, 0.025],  // darker patch
    ];

    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      // Terrain bumps: gentle rolling with some rough patches
      const macro = Math.sin(x * 0.04) * Math.cos(y * 0.03) * 0.28;
      const mid   = Math.sin(x * 0.11 + 0.4) * Math.cos(y * 0.09 + 1.1) * 0.12;
      const micro = Math.sin(x * 0.3) * Math.cos(y * 0.4) * 0.06;
      const rough = (Math.random() - 0.5) * 0.045;
      p.setZ(i, macro + mid + micro + rough);

      // Vertex color: natural soil variation using noise-like pattern
      const noise = (Math.sin(x * 0.08 + 1.3) * Math.cos(y * 0.06 + 0.7)) * 0.5 + 0.5;
      const idx = Math.floor(noise * (baseColors.length - 0.01));
      const bc = baseColors[idx];
      const variation = (Math.random() - 0.5) * 0.012;
      // Distance darkening: outer regions even dimmer (feels more endless)
      const d = Math.sqrt(x * x + y * y);
      const distDim = 1 - Math.min(0.24, d / (size * 1.1));
      colors[i * 3]     = Math.max(0, (bc[0] + variation) * distDim);
      colors[i * 3 + 1] = Math.max(0, (bc[1] + variation) * distDim);
      colors[i * 3 + 2] = Math.max(0, (bc[2] + variation * 0.5) * distDim);
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();

    const groundTex = createGroundTexture();
    const m = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 1.0,
      metalness: 0.0,
      map: groundTex,
    });
    const mesh = new THREE.Mesh(g, m);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  /* ---- ground detail objects: rocks, dirt patches, mud, grass tufts ---- */
  _groundDetails() {
    const half = this.fieldSize / 2;

    // Scattered rocks (various sizes)
    const rockGeo1 = new THREE.DodecahedronGeometry(0.15, 0);
    const rockGeo2 = new THREE.DodecahedronGeometry(0.25, 1);
    const rockGeo3 = new THREE.DodecahedronGeometry(0.4, 0);
    const rockMats = [
      new THREE.MeshStandardMaterial({ color: 0x14110f, roughness: 0.95 }),
      new THREE.MeshStandardMaterial({ color: 0x1c1915, roughness: 0.92 }),
      new THREE.MeshStandardMaterial({ color: 0x0e0c0a, roughness: 1.0 }),
    ];
    const rockGeos = [rockGeo1, rockGeo2, rockGeo3];

    for (let i = 0; i < 230; i++) {
      const geo = rockGeos[Math.floor(Math.random() * rockGeos.length)];
      const mat = rockMats[Math.floor(Math.random() * rockMats.length)];
      const rock = new THREE.Mesh(geo, mat);
      rock.position.set(
        (Math.random() - 0.5) * half * 1.8,
        Math.random() * 0.04,
        (Math.random() - 0.5) * half * 1.8
      );
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * 0.5);
      const s = 0.5 + Math.random() * 1.2;
      rock.scale.set(s, s * (0.4 + Math.random() * 0.6), s);
      this.scene.add(rock);
    }

    // Mud puddles (very dark, slightly reflective so moon catches them)
    for (let i = 0; i < 55; i++) {
      const r = 0.8 + Math.random() * 2.5;
      const pg = new THREE.CircleGeometry(r, 12);
      const pm = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.58, 0.15, 0.015 + Math.random() * 0.012),
        roughness: 0.18,
        metalness: 0.35,
      });
      const puddle = new THREE.Mesh(pg, pm);
      puddle.rotation.x = -Math.PI / 2;
      puddle.position.set(
        (Math.random() - 0.5) * half * 1.6,
        0.005,
        (Math.random() - 0.5) * half * 1.6
      );
      this.scene.add(puddle);
    }

    // Small water puddles (clear water with reflections)
    for (let i = 0; i < 22; i++) {
      const wr = 0.3 + Math.random() * 1.0;
      const wpg = new THREE.CircleGeometry(wr, 10);
      const wpm = new THREE.MeshStandardMaterial({
        color: 0x081822,
        roughness: 0.05,
        metalness: 0.6,
        transparent: true,
        opacity: 0.55 + Math.random() * 0.2,
      });
      const wp = new THREE.Mesh(wpg, wpm);
      wp.rotation.x = -Math.PI / 2;
      wp.position.set(
        (Math.random() - 0.5) * half * 1.3,
        0.007,
        (Math.random() - 0.5) * half * 1.3
      );
      this.scene.add(wp);
      // Wet earth ring around puddle
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(wr - 0.05, wr + 0.3, 10),
        new THREE.MeshStandardMaterial({
          color: 0x0a0806,
          roughness: 0.6,
          metalness: 0.15,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(wp.position.x, 0.004, wp.position.z);
      this.scene.add(ring);
    }

    // Dirt mounds / soil patches with different colors (much darker)
    for (let i = 0; i < 90; i++) {
      const pg = new THREE.CircleGeometry(1.0 + Math.random() * 3.5, 8);
      const hue = 0.06 + Math.random() * 0.04;
      const sat = 0.15 + Math.random() * 0.2;
      const light = 0.026 + Math.random() * 0.03;
      const pm = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(hue, sat, light),
        roughness: 1,
      });
      const patch = new THREE.Mesh(pg, pm);
      patch.rotation.x = -Math.PI / 2;
      patch.position.set(
        (Math.random() - 0.5) * half * 1.8,
        0.006 + Math.random() * 0.01,
        (Math.random() - 0.5) * half * 1.8
      );
      this.scene.add(patch);
    }

    // Grass tuft clusters (very dark, barely visible at night)
    const turfMat = new THREE.MeshStandardMaterial({
      color: 0x152017,
      roughness: 0.95,
      side: THREE.DoubleSide,
    });
    for (let i = 0; i < 240; i++) {
      const cluster = new THREE.Group();
      const bladeCount = 3 + Math.floor(Math.random() * 5);
      for (let b = 0; b < bladeCount; b++) {
        const shape = new THREE.Shape();
        const w = 0.02 + Math.random() * 0.03;
        const h = 0.15 + Math.random() * 0.25;
        shape.moveTo(-w, 0);
        shape.lineTo(0, h);
        shape.lineTo(w, 0);
        const geo = new THREE.ShapeGeometry(shape);
        const blade = new THREE.Mesh(geo, turfMat.clone());
        blade.material.color.setHSL(
          0.22 + Math.random() * 0.1,
          0.15 + Math.random() * 0.2,
          0.035 + Math.random() * 0.03
        );
        blade.position.set(
          (Math.random() - 0.5) * 0.3,
          0,
          (Math.random() - 0.5) * 0.3
        );
        blade.rotation.y = Math.random() * Math.PI;
        blade.rotation.x = -0.1 + Math.random() * 0.2;
        cluster.add(blade);
      }
      cluster.position.set(
        (Math.random() - 0.5) * half * 1.8,
        0.01,
        (Math.random() - 0.5) * half * 1.8
      );
      this.scene.add(cluster);
    }

    // Fallen corn stalk debris
    const debrisMat = new THREE.MeshStandardMaterial({ color: 0x2c2514, roughness: 0.95 });
    for (let i = 0; i < 95; i++) {
      const len = 1.0 + Math.random() * 2.5;
      const dg = new THREE.CylinderGeometry(0.015, 0.025, len, 4);
      const debris = new THREE.Mesh(dg, debrisMat);
      debris.position.set(
        (Math.random() - 0.5) * half * 1.6,
        0.02,
        (Math.random() - 0.5) * half * 1.6
      );
      debris.rotation.x = Math.PI / 2;
      debris.rotation.z = Math.random() * Math.PI;
      this.scene.add(debris);
    }

    // Short grass blades (instanced for performance)
    const bladeGeo = new THREE.PlaneGeometry(0.018, 0.1);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0x1a3010,
      roughness: 0.92,
      side: THREE.DoubleSide,
    });
    // Massive density increase
    const grassCount = 12000;
    const grassBlades = new THREE.InstancedMesh(bladeGeo, bladeMat, grassCount);
    const gDummy = new THREE.Object3D();
    const grassColor = new THREE.Color();
    for (let i = 0; i < grassCount; i++) {
      gDummy.position.set(
        (Math.random() - 0.5) * half * 1.6,
        0.04 + Math.random() * 0.02,
        (Math.random() - 0.5) * half * 1.6
      );
      gDummy.rotation.set(
        -0.08 + Math.random() * 0.16,
        Math.random() * Math.PI,
        (Math.random() - 0.5) * 0.25
      );
      const h = 0.7 + Math.random() * 0.6;
      gDummy.scale.set(0.8 + Math.random() * 0.4, h, 1);
      gDummy.updateMatrix();
      grassBlades.setMatrixAt(i, gDummy.matrix);
      grassColor.setHSL(
        0.22 + Math.random() * 0.1,
        0.2 + Math.random() * 0.2,
        0.03 + Math.random() * 0.035
      );
      grassBlades.setColorAt(i, grassColor);
    }
    grassBlades.instanceMatrix.needsUpdate = true;
    grassBlades.instanceColor.needsUpdate = true;
    this.scene.add(grassBlades);
  }

  /* ---- creepy field props (abandoned farm debris, markers, lanterns) ---- */
  _fieldProps() {
    const half = this.fieldSize / 2;
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x1a1208, roughness: 1 });
    const darkWood = new THREE.MeshStandardMaterial({ color: 0x0e0a06, roughness: 1 });
    const rustyMetal = new THREE.MeshStandardMaterial({ color: 0x2a1a0e, roughness: 0.85, metalness: 0.25 });

    // --- Old broken fence posts with occasional wire ---
    for (let i = 0; i < 30; i++) {
      const height = 0.8 + Math.random() * 1.6;
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.055, height, 5), woodMat
      );
      post.position.set(
        (Math.random() - 0.5) * half * 1.6, height / 2,
        (Math.random() - 0.5) * half * 1.6
      );
      post.rotation.set(
        (Math.random() - 0.5) * 0.25, Math.random() * Math.PI,
        (Math.random() - 0.5) * 0.35
      );
      this.scene.add(post);
      if (Math.random() < 0.28) {
        const wire = new THREE.Mesh(
          new THREE.CylinderGeometry(0.003, 0.003, 2.2 + Math.random() * 2, 3), rustyMetal
        );
        wire.position.copy(post.position);
        wire.position.y = height * 0.7;
        wire.rotation.z = Math.PI / 2;
        wire.rotation.y = Math.random() * Math.PI;
        this.scene.add(wire);
      }
    }

    // --- Wooden crosses / grave markers (rounded, weathered) ---
    for (let i = 0; i < 10; i++) {
      const group = new THREE.Group();
      const vH = 1.0 + Math.random() * 0.6;
      const vert = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.028, vH, 5), darkWood
      );
      vert.position.y = vH / 2;
      group.add(vert);
      const hW = 0.45 + Math.random() * 0.3;
      const horiz = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.022, hW, 5), darkWood
      );
      horiz.position.y = vH * 0.72;
      horiz.rotation.z = Math.PI / 2;
      group.add(horiz);
      // Weathered cap on top
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 5, 4, 0, Math.PI * 2, 0, Math.PI / 2), darkWood
      );
      cap.position.y = vH;
      group.add(cap);
      group.position.set(
        (Math.random() - 0.5) * half * 1.4, 0,
        (Math.random() - 0.5) * half * 1.4
      );
      group.rotation.y = Math.random() * Math.PI;
      group.rotation.z = (Math.random() - 0.5) * 0.12;
      this.scene.add(group);
    }

    // --- Hay bales (round, scattered) ---
    const hayMat = new THREE.MeshStandardMaterial({ color: 0x3a3018, roughness: 0.95 });
    for (let i = 0; i < 14; i++) {
      const bale = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.48, 0.7 + Math.random() * 0.3, 10), hayMat
      );
      bale.rotation.x = Math.PI / 2;
      bale.rotation.z = Math.random() * Math.PI;
      bale.position.set(
        (Math.random() - 0.5) * half * 1.3, 0.35,
        (Math.random() - 0.5) * half * 1.3
      );
      this.scene.add(bale);
      for (let s = 0; s < 4; s++) {
        const straw = new THREE.Mesh(
          new THREE.CylinderGeometry(0.005, 0.003, 0.18 + Math.random() * 0.12, 3),
          new THREE.MeshStandardMaterial({ color: 0x86753a, roughness: 1 })
        );
        straw.position.copy(bale.position);
        straw.position.x += (Math.random() - 0.5) * 0.5;
        straw.position.z += (Math.random() - 0.5) * 0.5;
        straw.position.y += 0.08;
        straw.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.4);
        this.scene.add(straw);
      }
    }

    // --- Pumpkins (harvest season — some intact, some rotting) ---
    for (let i = 0; i < 18; i++) {
      const sz = 0.1 + Math.random() * 0.2;
      const pumpkin = new THREE.Mesh(
        new THREE.SphereGeometry(sz, 12, 10),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(0.055 + Math.random() * 0.025, 0.6 + Math.random() * 0.15, 0.07 + Math.random() * 0.08),
          roughness: 0.82,
        })
      );
      pumpkin.scale.y = 0.68;
      pumpkin.position.set(
        (Math.random() - 0.5) * half * 1.2, sz * 0.55,
        (Math.random() - 0.5) * half * 1.2
      );
      this.scene.add(pumpkin);
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.015, 0.05, 4),
        new THREE.MeshStandardMaterial({ color: 0x2a2a0a, roughness: 1 })
      );
      stem.position.copy(pumpkin.position);
      stem.position.y += sz * 0.6;
      this.scene.add(stem);
    }

    // --- Dead tree stumps with root tendrils ---
    for (let i = 0; i < 12; i++) {
      const r1 = 0.18 + Math.random() * 0.35;
      const r2 = r1 + 0.05 + Math.random() * 0.1;
      const h = 0.3 + Math.random() * 0.7;
      const stump = new THREE.Mesh(
        new THREE.CylinderGeometry(r1, r2, h, 7),
        new THREE.MeshStandardMaterial({ color: 0x110d08, roughness: 1 })
      );
      stump.position.set(
        (Math.random() - 0.5) * half * 1.5, h / 2,
        (Math.random() - 0.5) * half * 1.5
      );
      this.scene.add(stump);
      for (let r = 0; r < 3; r++) {
        const root = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.04, 0.5 + Math.random() * 0.4, 4),
          new THREE.MeshStandardMaterial({ color: 0x0e0a06, roughness: 1 })
        );
        const angle = (r / 3) * Math.PI * 2 + Math.random() * 0.5;
        root.position.copy(stump.position);
        root.position.x += Math.cos(angle) * r2;
        root.position.z += Math.sin(angle) * r2;
        root.position.y = 0.08;
        root.rotation.z = (Math.random() < 0.5 ? -1 : 1) * (0.8 + Math.random() * 0.4);
        root.rotation.y = angle;
        this.scene.add(root);
      }
    }

    // --- Old rusted lanterns (some lit with faint flicker) ---
    this.lanternLights = [];
    for (let i = 0; i < 5; i++) {
      const group = new THREE.Group();
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.028, 1.1, 4), rustyMetal
      );
      pole.position.y = 0.55;
      group.add(pole);
      const hook = new THREE.Mesh(
        new THREE.TorusGeometry(0.04, 0.006, 4, 8, Math.PI), rustyMetal
      );
      hook.position.y = 1.12;
      hook.rotation.x = Math.PI / 2;
      group.add(hook);
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.06, 0.12, 6),
        new THREE.MeshStandardMaterial({ color: 0x3a2a12, roughness: 0.8, metalness: 0.3 })
      );
      body.position.y = 1.04;
      group.add(body);
      if (Math.random() < 0.6) {
        const glow = new THREE.PointLight(0xff7722, 0.12 + Math.random() * 0.18, 7, 2);
        glow.position.y = 1.04;
        group.add(glow);
        this.lanternLights.push(glow);
      }
      group.position.set(
        (Math.random() - 0.5) * half * 1.2, 0,
        (Math.random() - 0.5) * half * 1.2
      );
      group.rotation.z = (Math.random() - 0.5) * 0.15;
      this.scene.add(group);
    }

    // --- Old wooden crates (weathered, imperfect shape) ---
    for (let i = 0; i < 10; i++) {
      const s = 0.25 + Math.random() * 0.3;
      const crateGroup = new THREE.Group();
      // Main body: slightly deformed box via non-uniform scale on dodecahedron
      const crateBody = new THREE.Mesh(
        new THREE.BoxGeometry(s, s, s, 2, 2, 2),
        new THREE.MeshStandardMaterial({ color: 0x1e1408, roughness: 0.95 })
      );
      // Displace vertices slightly for worn look
      const cpos = crateBody.geometry.attributes.position;
      for (let v = 0; v < cpos.count; v++) {
        cpos.setX(v, cpos.getX(v) + (Math.random() - 0.5) * s * 0.06);
        cpos.setY(v, cpos.getY(v) + (Math.random() - 0.5) * s * 0.06);
        cpos.setZ(v, cpos.getZ(v) + (Math.random() - 0.5) * s * 0.06);
      }
      crateBody.geometry.computeVertexNormals();
      crateGroup.add(crateBody);
      // Plank line detail on one face
      for (let p = 0; p < 3; p++) {
        const plank = new THREE.Mesh(
          new THREE.CylinderGeometry(0.004, 0.004, s * 0.9, 3),
          new THREE.MeshStandardMaterial({ color: 0x120c04, roughness: 1 })
        );
        plank.position.set((p - 1) * s * 0.3, 0, s * 0.51);
        plank.rotation.x = 0;
        crateGroup.add(plank);
      }
      crateGroup.position.set(
        (Math.random() - 0.5) * half * 1.3, s / 2 + 0.01,
        (Math.random() - 0.5) * half * 1.3
      );
      crateGroup.rotation.y = Math.random() * Math.PI;
      if (Math.random() < 0.3) {
        crateGroup.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.3;
        crateGroup.position.y = s / 2 - 0.05;
      }
      this.scene.add(crateGroup);
    }

    // --- Tattered cloth / fabric strips hanging on posts ---
    const clothMat = new THREE.MeshStandardMaterial({
      color: 0x141210, roughness: 1, side: THREE.DoubleSide,
      transparent: true, opacity: 0.82,
    });
    for (let i = 0; i < 8; i++) {
      const cloth = new THREE.Mesh(
        new THREE.PlaneGeometry(0.3 + Math.random() * 0.2, 0.5 + Math.random() * 0.4),
        clothMat.clone()
      );
      cloth.material.color.setHSL(0.07, 0.1 + Math.random() * 0.1, 0.04 + Math.random() * 0.04);
      cloth.position.set(
        (Math.random() - 0.5) * half * 1.3, 1.0 + Math.random() * 0.8,
        (Math.random() - 0.5) * half * 1.3
      );
      cloth.rotation.set(
        (Math.random() - 0.5) * 0.3, Math.random() * Math.PI,
        (Math.random() - 0.5) * 0.2
      );
      this.scene.add(cloth);
    }

    // --- Old barrels (some upright, some fallen) ---
    for (let i = 0; i < 8; i++) {
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.25, 0.6, 8),
        new THREE.MeshStandardMaterial({ color: 0x1e1408, roughness: 0.9 })
      );
      barrel.position.set(
        (Math.random() - 0.5) * half * 1.3, 0.3,
        (Math.random() - 0.5) * half * 1.3
      );
      if (Math.random() < 0.4) {
        barrel.rotation.x = Math.PI / 2;
        barrel.position.y = 0.2;
      }
      this.scene.add(barrel);
    }
  }

  /* ---- sky + moon + stars ---- */
  _sky() {
    // Stars with varied brightness
    const count = 1200;
    const sp = new Float32Array(count * 3);
    const sc = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.random() * Math.PI * 0.45;
      const r = 150;
      sp[i * 3]     = r * Math.sin(ph) * Math.cos(th);
      sp[i * 3 + 1] = r * Math.cos(ph) + 8;
      sp[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
      const b = 0.4 + Math.random() * 0.6;
      sc[i * 3] = b; sc[i * 3 + 1] = b; sc[i * 3 + 2] = b + Math.random() * 0.2;
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    sg.setAttribute('color', new THREE.BufferAttribute(sc, 3));
    this.scene.add(new THREE.Points(sg, new THREE.PointsMaterial({
      size: 0.33,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })));

    // Moon rendered as a textured sprite so it reads more like a looming body.
    this.moonSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: createMoonTexture(),
        color: 0xf2efe4,
        transparent: true,
        opacity: 0.98,
        depthWrite: false,
        fog: false,
      })
    );
    this.moonSprite.position.set(35, 55, -50);
    this.moonSprite.scale.set(11, 11, 1);
    this.scene.add(this.moonSprite);

    // Halo layers that can dim as smoke and storm clouds build.
    for (const [sz, op] of [[18, 0.2], [28, 0.1], [40, 0.045]]) {
      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: createHaloTexture(),
          color: 0x8d98b8,
          transparent: true,
          opacity: op,
          depthWrite: false,
          fog: false,
        })
      );
      halo.position.copy(this.moonSprite.position);
      halo.scale.set(sz, sz, 1);
      this.scene.add(halo);
      this.moonHalos.push({ sprite: halo, baseOpacity: op, pulse: Math.random() * Math.PI * 2 });
    }

    // Clouds — randomized per round: sometimes many, sometimes few, occasionally clear sky
    this.clouds = [];
    const cloudCount = Math.random() < 0.16 ? 0 : Math.floor(4 + Math.random() * 28);
    for (let i = 0; i < cloudCount; i++) {
      const cg = new THREE.PlaneGeometry(20 + Math.random() * 32, 5 + Math.random() * 6);
      const cm = new THREE.MeshBasicMaterial({
        color: 0x0b0e16,
        transparent: true,
        opacity: 0.05 + Math.random() * 0.13,
        side: THREE.DoubleSide,
        depthWrite: false,
        fog: false,
      });
      const cloud = new THREE.Mesh(cg, cm);
      cloud.position.set(
        (Math.random() - 0.5) * 260,
        26 + Math.random() * 38,
        (Math.random() - 0.5) * 260
      );
      cloud.rotation.x = -Math.PI / 2;
      cloud.rotation.z = Math.random() * Math.PI;
      this.scene.add(cloud);
      this.clouds.push({ mesh: cloud, speed: 0.25 + Math.random() * 0.6 });
    }
  }

  /* ---- ensure weather-appropriate cloud cover ---- */
  adjustCloudsForWeather(weather) {
    let minClouds, opacityMul;
    switch (weather) {
      case 'storm': minClouds = 22; opacityMul = 2.8; break;
      case 'rain':  minClouds = 15; opacityMul = 2.2; break;
      case 'snow':  minClouds = 12; opacityMul = 1.6; break;
      case 'foggy': minClouds = 5;  opacityMul = 1.3; break;
      default: return; // clear sky — keep randomized count as-is
    }

    // Add more clouds if below weather minimum
    while (this.clouds.length < minClouds) {
      const cg = new THREE.PlaneGeometry(22 + Math.random() * 30, 6 + Math.random() * 7);
      const cm = new THREE.MeshBasicMaterial({
        color: weather === 'storm' ? 0x080b12 : 0x0b0e16,
        transparent: true,
        opacity: Math.min(0.32, (0.08 + Math.random() * 0.14) * opacityMul),
        side: THREE.DoubleSide,
        depthWrite: false,
        fog: false,
      });
      const cloud = new THREE.Mesh(cg, cm);
      cloud.position.set(
        (Math.random() - 0.5) * 260,
        24 + Math.random() * 38,
        (Math.random() - 0.5) * 260
      );
      cloud.rotation.x = -Math.PI / 2;
      cloud.rotation.z = Math.random() * Math.PI;
      this.scene.add(cloud);
      this.clouds.push({ mesh: cloud, speed: 0.2 + Math.random() * 0.5 });
    }

    // Darken/thicken existing clouds for bad weather
    for (const c of this.clouds) {
      c.mesh.material.opacity = Math.min(0.35, c.mesh.material.opacity * opacityMul);
      if (weather === 'storm') {
        c.mesh.material.color.setHex(0x080b12);
      }
    }
  }

  /* ---- cornfield with mixed colors ---- */
  _corn() {
    const half = this.fieldSize / 2;
    // Optimized density spacing. Trims hidden geometry bloat massively to lift GPU overhead.
    const sp = 0.55;
    const rows = Math.ceil(this.fieldSize / sp);
    const max = rows * rows;
    const dummy = new THREE.Object3D();

    // Corn color palette: realistic field mix lit by moonlight only —
    // daytime greens and yellows appear deeply muted at true night.
    const stalkColors = [
      new THREE.Color(0x223018),
      new THREE.Color(0x27351b),
      new THREE.Color(0x2d3b1d),
      new THREE.Color(0x332f16),
      new THREE.Color(0x3a3417),
      new THREE.Color(0x312717),
      new THREE.Color(0x2a2116),
    ];
    const leafColors = [
      new THREE.Color(0x29401d),
      new THREE.Color(0x304721),
      new THREE.Color(0x385026),
      new THREE.Color(0x3d481c),
      new THREE.Color(0x4a431a),
      new THREE.Color(0x34261a),
    ];

    const stalkGeo = new THREE.CylinderGeometry(0.02, 0.035, 3.5, 6);
    const stalkTex = createStalkTexture();
    const stalkMat = new THREE.MeshStandardMaterial({ roughness: 0.85, map: stalkTex });
    const stalks = new THREE.InstancedMesh(stalkGeo, stalkMat, max);

    const leafGeo = new THREE.PlaneGeometry(0.6, 0.07);
    const leafTex = createLeafTexture();
    const leafMat = new THREE.MeshStandardMaterial({ roughness: 0.75, side: THREE.DoubleSide, map: leafTex });
    const leaves = new THREE.InstancedMesh(leafGeo, leafMat, max * 4);

    let si = 0, li = 0;
    const tmpColor = new THREE.Color();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < rows; c++) {
        const bx = -half + c * sp;
        const bz = -half + r * sp;
        const x = bx + (Math.random() - 0.5) * 0.25;
        const z = bz + (Math.random() - 0.5) * 0.25;
        if (Math.sqrt(x * x + z * z) < 1.25) continue;
        // Random gaps for realism (trampled paths, bare patches)
        if (Math.random() < 0.015) continue;

        const h = 3.0 + Math.random() * 1.5;
        dummy.position.set(x, h / 2, z);
        dummy.rotation.set(0, Math.random() * Math.PI, (Math.random() - 0.5) * 0.08);
        dummy.scale.set(1, h / 3.5, 1);
        dummy.updateMatrix();
        stalks.setMatrixAt(si, dummy.matrix);

        const sc = stalkColors[Math.floor(Math.random() * stalkColors.length)];
        tmpColor.copy(sc).offsetHSL(0, (Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.02);
        stalks.setColorAt(si, tmpColor);
        si++;
        this.stalkData.push({ x, z });

        const leafCount = 3 + Math.floor(Math.random() * 2);
        for (let l = 0; l < leafCount; l++) {
          const ly = 0.3 + l * 0.55 + Math.random() * 0.35;
          dummy.position.set(x, ly, z);
          dummy.rotation.set(
            (Math.random() - 0.5) * 0.15,
            Math.random() * Math.PI * 2,
            0.15 + Math.random() * 0.55
          );
          dummy.scale.set(0.65 + Math.random() * 0.65, 1, 1);
          dummy.updateMatrix();
          if (li < max * 4) {
            leaves.setMatrixAt(li, dummy.matrix);
            const lc = leafColors[Math.floor(Math.random() * leafColors.length)];
            tmpColor.copy(lc).offsetHSL(0, (Math.random() - 0.5) * 0.06, (Math.random() - 0.5) * 0.03);
            leaves.setColorAt(li, tmpColor);
            li++;
          }
        }
      }
    }

    stalks.count = si;
    leaves.count = li;
    stalks.instanceMatrix.needsUpdate = true;
    leaves.instanceMatrix.needsUpdate = true;
    if (stalks.instanceColor) stalks.instanceColor.needsUpdate = true;
    if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true;

    this.cornGroup.add(stalks, leaves);
    this.scene.add(this.cornGroup);
    this.stalks = stalks;
    this.leaves = leaves;
  }

  /* ---- lighting (real midnight — only moon and fire light meaningfully) ---- */
  _lighting() {
    // Very low ambient so cornfield truly reads as night. No cheating.
    this.scene.add(new THREE.AmbientLight(0x263045, 0.36));

    // Cool moon directional — the main source of illumination.
    const moon = new THREE.DirectionalLight(0xa5b7de, 1.18);
    moon.position.set(35, 55, -50);
    this.scene.add(moon);
    this.moonLight = moon;

    // A faint back rim keeps silhouettes readable without flattening the darkness.
    this.rimLight = new THREE.DirectionalLight(0x627696, 0.46);
    this.rimLight.position.set(-24, 10, 36);
    this.scene.add(this.rimLight);

    // Hemisphere: faint blue sky / near-black ground response.
    this.scene.add(new THREE.HemisphereLight(0x243049, 0x0b0a09, 0.34));

    this.playerFillLight = new THREE.PointLight(0x7e90b3, 0.48, 18, 2.4);
    this.playerFillLight.position.set(0, 2.3, 0);
    this.scene.add(this.playerFillLight);

    this.lightningLight = new THREE.DirectionalLight(0xffffff, 0);
    this.lightningLight.position.set(0, 80, 0);
    this.scene.add(this.lightningLight);
  }

  /* ---- fog (denser, darker, pushes horizon into void) ---- */
  _fog() {
    this.scene.fog = new THREE.FogExp2(0x060913, 0.013);
  }

  _horizon() {
    const shellSpecs = [
      { radius: 46, height: 13, opacity: 0.022, color: 0x0a0c12 },
      { radius: 70, height: 19, opacity: 0.04, color: 0x0c0f15 },
      { radius: 98, height: 28, opacity: 0.065, color: 0x11131b },
    ];

    for (const spec of shellSpecs) {
      const shell = new THREE.Mesh(
        new THREE.CylinderGeometry(spec.radius, spec.radius, spec.height, 36, 1, true),
        new THREE.MeshBasicMaterial({
          color: spec.color,
          transparent: true,
          opacity: spec.opacity,
          side: THREE.BackSide,
          depthWrite: false,
          fog: false,
        })
      );
      shell.position.y = spec.height * 0.48;
      this.scene.add(shell);
      this.horizonShells.push({
        mesh: shell,
        height: spec.height,
        baseOpacity: spec.opacity,
        spin: (Math.random() - 0.5) * 0.06,
      });
    }

    for (let i = 0; i < 14; i++) {
      const marker = Math.random() < 0.55 ? this._createHorizonTree() : this._createHorizonTotem();
      this.scene.add(marker);
      this.horizonSilhouettes.push({
        mesh: marker,
        angle: Math.random() * Math.PI * 2,
        radius: 58 + Math.random() * 24,
        yaw: (Math.random() - 0.5) * 0.35,
        sway: Math.random() * Math.PI * 2,
      });
    }
  }

  _createHorizonTree() {
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 1 });
    const branchMat = new THREE.MeshStandardMaterial({ color: 0x070709, roughness: 1 });

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 5.8, 6), trunkMat);
    trunk.position.y = 2.9;
    group.add(trunk);

    for (let i = 0; i < 4; i++) {
      const branch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.08, 2.4 + Math.random() * 1.6, 4),
        branchMat
      );
      branch.position.y = 2.2 + Math.random() * 1.6;
      branch.position.x = (Math.random() - 0.5) * 0.5;
      branch.rotation.z = (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.6);
      branch.rotation.y = Math.random() * Math.PI * 2;
      group.add(branch);
    }

    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 1.1, 5),
      branchMat
    );
    crown.position.y = 5.7;
    group.add(crown);

    return group;
  }

  _createHorizonTotem() {
    const group = new THREE.Group();
    const wood = new THREE.MeshStandardMaterial({ color: 0x060505, roughness: 1 });
    const cloth = new THREE.MeshStandardMaterial({
      color: 0x09070a,
      roughness: 1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
    });

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 5, 5), wood);
    post.position.y = 2.5;
    group.add(post);

    const cross = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 0.14), wood);
    cross.position.y = 3.4;
    group.add(cross);

    for (const dx of [-0.82, 0.82]) {
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 1.6), cloth);
      strip.position.set(dx, 2.65, 0.08);
      strip.rotation.z = (Math.random() - 0.5) * 0.18;
      group.add(strip);
    }

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 7, 6), wood);
    head.position.y = 4.55;
    group.add(head);

    return group;
  }

  groundHeightAt(x, z) {
    const macro = Math.sin(x * 0.04) * Math.cos(z * 0.03) * 0.28;
    const mid = Math.sin(x * 0.11 + 0.4) * Math.cos(z * 0.09 + 1.1) * 0.12;
    const micro = Math.sin(x * 0.3) * Math.cos(z * 0.4) * 0.06;
    return macro + mid + micro;
  }

  updateAtmosphere(dt, playerPos, progress, weather) {
    const weatherFog = weather === 'foggy' ? 0.024 : weather === 'storm' ? 0.014 : weather === 'rain' ? 0.008 : 0;
    const smokeFog = progress * 0.034;
    const t = this.wind.time;

    if (this.cornGroup) {
      this.cornGroup.position.x = Math.round(playerPos.x / this.cornAnchorStep) * this.cornAnchorStep;
      this.cornGroup.position.z = Math.round(playerPos.z / this.cornAnchorStep) * this.cornAnchorStep;
    }

    for (const shell of this.horizonShells) {
      shell.mesh.position.x = playerPos.x;
      shell.mesh.position.z = playerPos.z;
      shell.mesh.position.y = shell.height * 0.48;
      shell.mesh.rotation.y += shell.spin * dt;
      shell.mesh.material.opacity = Math.min(0.13, shell.baseOpacity + weatherFog + smokeFog);
    }

    for (const marker of this.horizonSilhouettes) {
      const angle = marker.angle + t * 0.022 + Math.sin(t * 0.2 + marker.sway) * 0.04;
      marker.mesh.position.x = playerPos.x + Math.cos(angle) * marker.radius;
      marker.mesh.position.z = playerPos.z + Math.sin(angle) * marker.radius;
      marker.mesh.position.y = Math.sin(t * 0.45 + marker.sway) * 0.05;
      marker.mesh.rotation.y = -angle + Math.PI / 2 + marker.yaw;
    }

    if (this.moonSprite) {
      const moonFade = weather === 'storm' ? 0.22 : weather === 'foggy' ? 0.12 : 0;
      this.moonSprite.material.opacity = Math.max(0.64, 0.98 - moonFade - progress * 0.06);
    }

    for (const halo of this.moonHalos) {
      const pulse = 0.92 + Math.sin(t * 0.22 + halo.pulse) * 0.08;
      halo.sprite.position.copy(this.moonSprite.position);
      halo.sprite.material.opacity = Math.max(
        0.008,
        halo.baseOpacity * pulse * (weather === 'storm' ? 0.42 : weather === 'foggy' ? 0.72 : 1) * (1 - progress * 0.2)
      );
    }

    if (this.rimLight) {
      this.rimLight.intensity = 0.42 + progress * 0.05 + (weather === 'storm' ? 0.04 : 0);
    }

    if (this.playerFillLight) {
      this.playerFillLight.position.copy(playerPos);
      this.playerFillLight.position.y = Math.max(2, playerPos.y + 0.65);
      this.playerFillLight.intensity = 0.48 - progress * 0.1 + (weather === 'foggy' ? 0.05 : 0);
    }
  }

  /* ---- highway (exit) - visually distinct from far away ---- */
  _highway() {
    const half = this.fieldSize / 2;
    const side = Math.floor(Math.random() * 4);
    const off = (Math.random() - 0.5) * this.fieldSize * 0.4;
    let x, z;
    switch (side) {
      case 0: x = off; z = -half; break;
      case 1: x = half; z = off; break;
      case 2: x = off; z = half; break;
      case 3: x = -half; z = off; break;
    }
    this.exitPos.set(x, 0, z);
    this.exitDir.set(x, 0, z).normalize();

    const roadLen = 40;
    const isNS = side === 0 || side === 2;

    // Gravel shoulder (wider, visible from distance)
    const shoulderGeo = new THREE.PlaneGeometry(isNS ? roadLen : 10, isNS ? 10 : roadLen);
    const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x2a2520, roughness: 0.98 });
    const shoulder = new THREE.Mesh(shoulderGeo, shoulderMat);
    shoulder.rotation.x = -Math.PI / 2;
    shoulder.position.set(x, 0.004, z);
    this.scene.add(shoulder);

    // Asphalt road surface
    const roadGeo = new THREE.PlaneGeometry(isNS ? roadLen : 6, isNS ? 6 : roadLen);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.88 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(x, 0.01, z);
    this.scene.add(road);

    // Yellow center double line
    for (const lineOff of [-0.08, 0.08]) {
      const lineGeo = new THREE.PlaneGeometry(isNS ? roadLen * 0.85 : 0.06, isNS ? 0.06 : roadLen * 0.85);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xcc9900 });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      if (isNS) line.position.set(x, 0.02, z + lineOff);
      else line.position.set(x + lineOff, 0.02, z);
      this.scene.add(line);
    }

    // White dashed edge lines (both sides)
    const dashCount = 12;
    for (const edgeOff of [-2.5, 2.5]) {
      for (let d = 0; d < dashCount; d++) {
        const dw = isNS ? 1.5 : 0.1;
        const dh = isNS ? 0.1 : 1.5;
        const dashGeo = new THREE.PlaneGeometry(dw, dh);
        const dashMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
        const dash = new THREE.Mesh(dashGeo, dashMat);
        dash.rotation.x = -Math.PI / 2;
        const offset = (d - dashCount / 2) * (roadLen / dashCount);
        if (isNS) dash.position.set(x + offset, 0.021, z + edgeOff);
        else dash.position.set(x + edgeOff, 0.021, z + offset);
        this.scene.add(dash);
      }
    }

    // Road reflectors (small orange dots)
    for (let r = 0; r < 8; r++) {
      const ref = new THREE.Mesh(
        new THREE.CircleGeometry(0.04, 6),
        new THREE.MeshBasicMaterial({ color: 0xff6600 })
      );
      ref.rotation.x = -Math.PI / 2;
      const offset = (r - 4) * (roadLen / 8);
      if (isNS) ref.position.set(x + offset, 0.022, z);
      else ref.position.set(x, 0.022, z + offset);
      this.scene.add(ref);
    }

    // Multiple lampposts along highway (visible from far)
    const postMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    for (let lp = 0; lp < 3; lp++) {
      const lpOff = (lp - 1) * 12;
      const px = isNS ? x + lpOff : x + 3.5;
      const pz = isNS ? z + 3.5 : z + lpOff;

      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 5.5, 6), postMat);
      post.position.set(px, 2.75, pz);
      this.scene.add(post);

      // Light arm extending over road (curved pipe)
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, isNS ? 1.5 : 1.5, 5),
        postMat
      );
      arm.position.set(px, 5.5, pz - (isNS ? 0.75 : 0));
      arm.rotation.x = isNS ? Math.PI / 2 : 0;
      arm.rotation.z = isNS ? 0 : Math.PI / 2;
      this.scene.add(arm);

      // Light fixture (rounded housing)
      const fixture = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.12, 0.06, 8),
        new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 })
      );
      fixture.position.set(px, 5.45, pz - (isNS ? 2.5 : 0));
      this.scene.add(fixture);

      // Dim, realistic light (local glow only)
      const rl = new THREE.PointLight(0xffaa44, 0.45, 18, 2.0);
      rl.position.set(px, 5.3, pz - (isNS ? 2 : 0));
      this.scene.add(rl);
    }

    // Guardrail (metal barrier along one side)
    const railMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.5, roughness: 0.6 });
    for (let rp = 0; rp < 10; rp++) {
      const rpOff = (rp - 5) * (roadLen / 10);
      const rpx = isNS ? x + rpOff : x - 4;
      const rpz = isNS ? z - 4 : z + rpOff;
      // Rail post
      const rPost = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 4), railMat);
      rPost.position.set(rpx, 0.35, rpz);
      this.scene.add(rPost);
    }
    // Rail beam
    const beamLen = roadLen;
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(isNS ? beamLen : 0.02, 0.08, isNS ? 0.02 : beamLen),
      railMat
    );
    beam.position.set(x + (isNS ? 0 : -4), 0.55, z + (isNS ? -4 : 0));
    this.scene.add(beam);

    // Pit on RIGHT side (visible with warning signs)
    const rightDir = new THREE.Vector3(-this.exitDir.z, 0, this.exitDir.x);
    this.pitCenter = this.exitPos.clone().add(rightDir.multiplyScalar(6));
    this.pitCenter.y = 0;

    // Pit: visible dark hole with cracked earth edges
    const pitGeo = new THREE.CircleGeometry(3.0, 20);
    const pitMat = new THREE.MeshStandardMaterial({ color: 0x020201, roughness: 1 });
    const pit = new THREE.Mesh(pitGeo, pitMat);
    pit.rotation.x = -Math.PI / 2;
    pit.position.set(this.pitCenter.x, 0.003, this.pitCenter.z);
    this.scene.add(pit);

    // Pit edge: cracked dirt ring
    const pitRing = new THREE.Mesh(
      new THREE.RingGeometry(2.8, 4.2, 20),
      new THREE.MeshStandardMaterial({ color: 0x1a1208, roughness: 0.95 })
    );
    pitRing.rotation.x = -Math.PI / 2;
    pitRing.position.set(this.pitCenter.x, 0.002, this.pitCenter.z);
    this.scene.add(pitRing);

    // Scattered rocks around pit edge (warning: something is here)
    for (let r = 0; r < 8; r++) {
      const a = (r / 8) * Math.PI * 2;
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.12 + Math.random() * 0.15, 0),
        new THREE.MeshStandardMaterial({ color: 0x2a2520, roughness: 0.9 })
      );
      rock.position.set(
        this.pitCenter.x + Math.cos(a) * (3.2 + Math.random() * 0.5),
        0.05,
        this.pitCenter.z + Math.sin(a) * (3.2 + Math.random() * 0.5)
      );
      this.scene.add(rock);
    }

    // Additional visible holes/pits scattered in the field
    this.groundHoles = [];
    for (let h = 0; h < 8; h++) {
      const hx = (Math.random() - 0.5) * this.fieldSize * 0.7;
      const hz = (Math.random() - 0.5) * this.fieldSize * 0.7;
      if (Math.sqrt(hx * hx + hz * hz) < 10) { continue; }
      const holeR = 0.5 + Math.random() * 1.5;
      const hole = new THREE.Mesh(
        new THREE.CircleGeometry(holeR, 10),
        new THREE.MeshStandardMaterial({ color: 0x050502, roughness: 1 })
      );
      hole.rotation.x = -Math.PI / 2;
      hole.position.set(hx, 0.003, hz);
      this.scene.add(hole);
      // Dirt ring around hole
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(holeR - 0.1, holeR + 0.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x1a1005, roughness: 0.95 })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(hx, 0.002, hz);
      this.scene.add(ring);
      this.groundHoles.push({ x: hx, z: hz, r: holeR });
    }
  }

  /* ---- landmines ---- */
  _mines() {
    for (let i = 0; i < 18; i++) {
      const x = (Math.random() - 0.5) * this.fieldSize * 0.8;
      const z = (Math.random() - 0.5) * this.fieldSize * 0.8;
      if (Math.sqrt(x * x + z * z) < 12) { i--; continue; }
      this.landmines.push({ x, z, active: true });
    }
  }

  /* ---- fire system (visible spreading fire) ---- */
  _createFireBlazeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 80, 10, 64, 80, 60);
    grad.addColorStop(0, 'rgba(255, 230, 150, 1)');
    grad.addColorStop(0.3, 'rgba(255, 120, 20, 0.9)');
    grad.addColorStop(0.7, 'rgba(200, 30, 5, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    // Add some random bright licks
    for(let i=0; i<15; i++) {
        ctx.fillStyle = `rgba(255, ${150 + Math.random()*100}, 50, ${0.4 + Math.random()*0.4})`;
        ctx.beginPath();
        ctx.ellipse(30+Math.random()*68, 60+Math.random()*40, 5+Math.random()*15, 20+Math.random()*40, (Math.random()-0.5)*0.5, 0, Math.PI*2);
        ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  _createSmokePuffTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 15, 64, 64, 60);
    grad.addColorStop(0, 'rgba(30, 25, 25, 0.9)');
    grad.addColorStop(0.5, 'rgba(20, 15, 15, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  _fireSetup() {
    const ex = this.exitPos.x, ez = this.exitPos.z;
    const half = this.fieldSize / 2;
    let best = null, bestD = -1;
    for (const [cx, cz] of [[-half, -half], [half, -half], [half, half], [-half, half]]) {
      const d = Math.sqrt((cx - ex) ** 2 + (cz - ez) ** 2);
      if (d > bestD) { bestD = d; best = [cx, cz]; }
    }
    this.fireOrigin.set(best[0], 0, best[1]);

    // Main fire light
    this.fireLight = new THREE.PointLight(0xff4400, 0, 80, 1.5);
    this.fireLight.position.set(best[0], 4, best[1]);
    this.scene.add(this.fireLight);

    // Additional fire glow lights that spread over time
    this.fireGlows = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const gl = new THREE.PointLight(0xff3300, 0, 40, 2);
      gl.position.set(best[0] + Math.cos(a) * 15, 3, best[1] + Math.sin(a) * 15);
      this.scene.add(gl);
      this.fireGlows.push({ light: gl, angle: a, baseR: 15 });
    }

    // Fire wall meshes (realistic blaze sprites)
    this.fireWalls = [];
    const blazeTex = this._createFireBlazeTexture();
    const smokeTex = this._createSmokePuffTexture();

    // Volumetric fire front
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      
      const fireMat = new THREE.SpriteMaterial({
        map: blazeTex,
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const fw = new THREE.Sprite(fireMat);
      
      const scaleBase = 8 + Math.random() * 6;
      fw.scale.set(scaleBase, scaleBase * 1.2, 1);
      
      fw.position.set(
        best[0] + Math.cos(a) * 10,
        scaleBase * 0.4,
        best[1] + Math.sin(a) * 10
      );
      this.scene.add(fw);

      // Attach a dark smoke column above and behind each blaze
      const smokeMat = new THREE.SpriteMaterial({
        map: smokeTex, color: 0xffffff,
        transparent: true, opacity: 0.8,
        depthWrite: false
      });
      const smoke = new THREE.Sprite(smokeMat);
      smoke.scale.set(scaleBase * 1.5, scaleBase * 2.5, 1);
      smoke.position.set(
        fw.position.x,
        fw.position.y + scaleBase * 0.8,
        fw.position.z
      );
      this.scene.add(smoke);

      this.fireWalls.push({ mesh: fw, smoke: smoke, angle: a, baseR: 10, offsetPhase: Math.random() * Math.PI * 2 });
    }
  }

  /* ---- runtime: wind ---- */
  updateWind(dt, weather) {
    this.wind.time += dt;

    let targetStrength = 0.3;
    if (weather === 'storm') targetStrength = 1.5;
    else if (weather === 'rain') targetStrength = 0.8;
    else if (weather === 'snow') targetStrength = 0.5;
    else if (weather === 'foggy') targetStrength = 0.15;

    this.wind.strength += (targetStrength - this.wind.strength) * dt * 0.5;

    const wt = this.wind.time * 0.15;
    this.wind.x = Math.sin(wt) * this.wind.strength;
    this.wind.z = Math.cos(wt * 0.7) * this.wind.strength;

    // Sway corn group with wind + turbulence
    const sway = Math.sin(this.wind.time * 1.8) * 0.003 * this.wind.strength;
    const gust = Math.sin(this.wind.time * 4.5) * 0.001 * this.wind.strength;
    this.cornGroup.rotation.x = sway + gust;
    this.cornGroup.rotation.z = Math.sin(this.wind.time * 1.3 + 1) * 0.002 * this.wind.strength;

    // Drift clouds
    for (const c of this.clouds) {
      c.mesh.position.x += c.speed * this.wind.strength * dt * 0.3;
      if (c.mesh.position.x > 150) c.mesh.position.x = -150;
    }
  }

  /* ---- runtime: lightning flash (headlights / generic bright flash) ---- */
  flash(dur = 0.12) {
    this.lightningLight.color.setHex(0xffffff);
    this.lightningLight.intensity = 3;
    setTimeout(() => { this.lightningLight.intensity = 0; }, dur * 1000);
  }

  /* ---- storm lightning: visible bolt in sky + subtle ground reflection ---- */
  triggerLightning(playerPos) {
    if (this._activeLightning) return;
    this._activeLightning = true;

    // Position bolt within visible range of player
    const boltX = playerPos.x + (Math.random() - 0.5) * 80;
    const boltZ = playerPos.z + (Math.random() - 0.5) * 80;
    const topY = 48 + Math.random() * 18;

    const start = new THREE.Vector3(boltX, topY, boltZ);
    const end = new THREE.Vector3(
      boltX + (Math.random() - 0.5) * 12, 0.3,
      boltZ + (Math.random() - 0.5) * 12
    );

    // Build visible bolt (tube geometry with glow layers)
    const bolt = this._buildLightningBolt(start, end);
    this.scene.add(bolt);

    // Sky glow behind bolt (illuminated cloud area)
    const glowTex = this._lightningGlowTex ||
      (this._lightningGlowTex = createLightningGlowTexture());
    const skyGlow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex,
      color: 0x8899cc,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    }));
    skyGlow.position.set(boltX, topY - 4, boltZ);
    skyGlow.scale.set(50, 38, 1);
    this.scene.add(skyGlow);

    // Ground reflection — subtle directional illumination (NOT white-out)
    this.lightningLight.position.set(boltX, topY, boltZ);
    this.lightningLight.color.setHex(0xccdaef);
    this.lightningLight.intensity = 1.6;

    // --- Double-flash pattern (realistic lightning flicker) ---
    // First dim
    setTimeout(() => {
      this.lightningLight.intensity = 0.3;
      bolt.traverse(c => { if (c.material) c.material.opacity *= 0.25; });
      skyGlow.material.opacity = 0.12;
    }, 70);

    // Re-flash
    setTimeout(() => {
      this.lightningLight.intensity = 1.1;
      bolt.traverse(c => {
        if (c.material && c.userData.baseOpacity)
          c.material.opacity = c.userData.baseOpacity * 0.65;
      });
      skyGlow.material.opacity = 0.35;
    }, 140);

    // Final fade
    setTimeout(() => {
      this.lightningLight.intensity = 0.15;
      bolt.traverse(c => { if (c.material) c.material.opacity *= 0.15; });
      skyGlow.material.opacity = 0.03;
    }, 240);

    // Cleanup
    setTimeout(() => {
      this.lightningLight.intensity = 0;
      this.scene.remove(bolt);
      this.scene.remove(skyGlow);
      bolt.traverse(c => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
      skyGlow.material.dispose();
      this._activeLightning = false;
    }, 380);
  }

  _buildLightningBolt(start, end) {
    const group = new THREE.Group();
    const mainPath = this._boltPath(start, end, 12 + Math.floor(Math.random() * 6));

    // Core (bright white center)
    this._addBoltTube(group, mainPath, 0.08, 0xeef4ff, 0.92);
    // Inner glow
    this._addBoltTube(group, mainPath, 0.35, 0x8899cc, 0.38);
    // Outer glow
    this._addBoltTube(group, mainPath, 0.95, 0x5566aa, 0.1);

    // Branches (forks splitting off the main bolt)
    const branches = 2 + Math.floor(Math.random() * 4);
    for (let b = 0; b < branches; b++) {
      const fi = 2 + Math.floor(Math.random() * Math.max(1, mainPath.length - 4));
      const fs = mainPath[Math.min(fi, mainPath.length - 1)].clone();
      const fe = new THREE.Vector3(
        fs.x + (Math.random() - 0.5) * 22,
        Math.max(0.5, fs.y - 6 - Math.random() * 16),
        fs.z + (Math.random() - 0.5) * 22
      );
      const bp = this._boltPath(fs, fe, 4 + Math.floor(Math.random() * 4));
      this._addBoltTube(group, bp, 0.05, 0xdde8ff, 0.65);
      this._addBoltTube(group, bp, 0.18, 0x7788bb, 0.22);
    }

    return group;
  }

  _boltPath(start, end, segments) {
    const pts = [start.clone()];
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const jitter = 2.5 * (1 - t * 0.35);
      pts.push(new THREE.Vector3(
        THREE.MathUtils.lerp(start.x, end.x, t) + (Math.random() - 0.5) * jitter,
        THREE.MathUtils.lerp(start.y, end.y, t),
        THREE.MathUtils.lerp(start.z, end.z, t) + (Math.random() - 0.5) * jitter
      ));
    }
    pts.push(end.clone());
    return pts;
  }

  _addBoltTube(group, points, radius, color, opacity) {
    if (points.length < 2) return;
    const curve = new THREE.CatmullRomCurve3(points, false, 'chordal');
    const geo = new THREE.TubeGeometry(curve, Math.max(4, points.length * 3), radius, 5, false);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      fog: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.baseOpacity = opacity;
    group.add(mesh);
  }

  /* ---- runtime: fire progression (visible spreading fire) ---- */
  updateFire(progress) {
    this.fireLight.intensity = progress * 4;
    this.fireLight.distance = 40 + progress * 100;

    // Fog starts near-black midnight, shifts to smoky-orange as fire spreads.
    const fogBase = new THREE.Color(0x060913);
    const fogFire = new THREE.Color(0x1a0a04);
    this.scene.fog.color.copy(fogBase).lerp(fogFire, progress * 0.75);
    this.scene.background.copy(new THREE.Color(0x060913)).lerp(fogFire, progress * 0.45);
    // Thickening smoke density as fire grows
    this.scene.fog.density = 0.013 + progress * 0.022;

    // Spread fire glow lights outward
    const t = Date.now() * 0.001;
    if (this.fireGlows) {
      for (const fg of this.fireGlows) {
        const r = fg.baseR + progress * 90;
        fg.light.position.x = this.fireOrigin.x + Math.cos(fg.angle + t * 0.1) * r;
        fg.light.position.z = this.fireOrigin.z + Math.sin(fg.angle + t * 0.1) * r;
        fg.light.intensity = progress * 2.5;
        fg.light.distance = 25 + progress * 40;
      }
    }

    // Animate volumetric fire blazes and smoke columns
    if (this.fireWalls) {
      for (const fw of this.fireWalls) {
        const r = fw.baseR + progress * 95;
        
        // Swaying fire base
        const xPos = this.fireOrigin.x + Math.cos(fw.angle + t * 0.05) * r;
        const zPos = this.fireOrigin.z + Math.sin(fw.angle + t * 0.05) * r;
        fw.mesh.position.x = xPos + Math.sin(t * 1.5 + fw.offsetPhase) * 1.5;
        fw.mesh.position.z = zPos + Math.cos(t * 1.2 + fw.offsetPhase) * 1.5;
        
        // Scaling breath effect
        const breath = 1.0 + Math.sin(t * 3 + fw.offsetPhase) * 0.15;
        const baseH = fw.mesh.scale.x; 
        // Note: scale.x is the base width we set during initialization
        fw.mesh.scale.y = baseH * 1.2 * breath;
        
        fw.mesh.material.opacity = Math.min(0.9, progress * 2.0);
        
        // Flicker intensity
        const flicker = 0.6 + Math.sin(t * 8 + fw.offsetPhase * 3) * 0.4;
        fw.mesh.material.color.setHSL(0.04, 1, flicker);

        // Animate attached smoke column (drifts higher and swirls)
        if (fw.smoke) {
          const sBreath = 1.0 + Math.cos(t * 1.5 + fw.offsetPhase) * 0.2;
          fw.smoke.scale.set(baseH * 1.8 * sBreath, baseH * 3.5 * sBreath, 1);
          fw.smoke.position.x = fw.mesh.position.x + Math.sin(t * 2 + fw.angle) * 2;
          fw.smoke.position.z = fw.mesh.position.z + Math.cos(t * 1.8 + fw.angle) * 2;
          fw.smoke.position.y = fw.mesh.position.y + baseH * 0.8 + Math.sin(t + fw.offsetPhase) * 1.5;
          
          // Smoke gets fully opaque and huge as fire progresses
          fw.smoke.material.opacity = Math.min(1.0, progress * 2.5);
          // Darken smoke color randomly for depth
          const smDark = 0.4 + Math.sin(t * 0.5 + fw.offsetPhase) * 0.3;
          fw.smoke.material.color.setHSL(0, 0, smDark);
        }
      }
    }
  }

  getApproachSide(playerPos) {
    const toExit = new THREE.Vector3().subVectors(this.exitPos, new THREE.Vector3(0, 0, 0)).normalize();
    const toPlayer = new THREE.Vector3(playerPos.x - this.exitPos.x, 0, playerPos.z - this.exitPos.z).normalize();
    const cross = toExit.x * toPlayer.z - toExit.z * toPlayer.x;
    const dot = toExit.x * toPlayer.x + toExit.z * toPlayer.z;
    if (dot > 0.3) return 'front';
    if (cross > 0.3) return 'left';
    if (cross < -0.3) return 'right';
    return 'front';
  }
}
