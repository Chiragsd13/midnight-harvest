import * as THREE from 'three';

export class Creatures {
  constructor(scene) {
    this.scene = scene;
    this.scarecrows = [];
    this.crows = [];
    this.animals = [];
  }

  /* ---- scarecrows (DC-inspired terror geometry) ---- */
  spawnScarecrows(count = 36, fieldSize = 200) {
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * fieldSize * 0.85;
      const z = (Math.random() - 0.5) * fieldSize * 0.85;
      if (Math.sqrt(x * x + z * z) < 14) { i--; continue; }

      const mesh = this._buildScarecrow();
      mesh.position.set(x, 0, z);
      // Random facing direction
      mesh.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(mesh);

      this.scarecrows.push({
        mesh, x, z,
        triggered: false,
        willScare: Math.random() < 0.85,
        state: 'idle',
        timer: Math.random() * Math.PI * 2,
        fleeDir: null,
        ambushFrom: null,
        ambushTo: null,
        didBoo: false,
        baseYaw: mesh.rotation.y,
        phase: Math.random() * Math.PI * 2,
        leftLeg: mesh.getObjectByName('leftLeg'),
        rightLeg: mesh.getObjectByName('rightLeg'),
        arms: [mesh.getObjectByName('leftArm'), mesh.getObjectByName('rightArm')],
        head: mesh.getObjectByName('head'),
        torso: mesh.getObjectByName('torso'),
      });
    }
  }

  _buildScarecrow() {
    const g = new THREE.Group();

    // DC Scarecrow aesthetic: Tattered dark overcoat, noose, fear-gas tubes, gas-mask eyes, needle hands
    const woodDark = new THREE.MeshStandardMaterial({ color: 0x110d08, roughness: 1 });
    const woodFaded = new THREE.MeshStandardMaterial({ color: 0x1a1510, roughness: 1 });
    const coatOuter = new THREE.MeshStandardMaterial({ color: 0x0a0806, roughness: 0.98 });
    const coatInner = new THREE.MeshStandardMaterial({ color: 0x120c0a, roughness: 1 });
    const burlapDark = new THREE.MeshStandardMaterial({ color: 0x2b1e11, roughness: 0.92 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x333b3a, roughness: 0.5, metalness: 0.8 });
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0x228800, roughness: 0.3, transparent: true, opacity: 0.85 }); // Glowing green fear gas
    const glowingEyeMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const deadEyeMat = new THREE.MeshBasicMaterial({ color: 0x331100 });

    const addPart = (geo, mat, x, y, z, name) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      if (name) m.name = name;
      g.add(m);
      return m;
    };

    // Central mounting pole
    addPart(new THREE.CylinderGeometry(0.04, 0.05, 2.8, 5), woodDark, 0, 1.4, 0);
    
    // Tattered elongated legs
    const legGeo = new THREE.CylinderGeometry(0.05, 0.07, 1.1, 5);
    const leftLeg = addPart(legGeo, coatOuter, -0.16, 0.55, 0, 'leftLeg');
    const rightLeg = addPart(legGeo, coatOuter, 0.16, 0.55, 0, 'rightLeg');
    for (const leg of [leftLeg, rightLeg]) {
      const wraps = new THREE.Mesh(
        new THREE.TorusGeometry(0.06, 0.015, 4, 8),
        burlapDark
      );
      wraps.position.set(0, -0.1, 0);
      leg.add(wraps);
    }

    // Elongated skeletal torso wrapped in dark rags
    const torso = addPart(new THREE.CylinderGeometry(0.2, 0.14, 0.95, 8), coatOuter, 0, 1.55, 0.02, 'torso');
    // Gas tubes wrapping the torso
    for (let t = 0; t < 3; t++) {
      const tube = new THREE.Mesh(
        new THREE.TorusGeometry(0.21 - t * 0.02, 0.012, 6, 12, Math.PI),
        tubeMat
      );
      tube.position.set(0, -0.2 + t * 0.15, 0);
      tube.rotation.x = Math.PI / 2 + Math.random() * 0.5;
      tube.rotation.y = (Math.random() - 0.5);
      torso.add(tube);
    }

    // Ragged tail coat
    for (const side of [-1, 1]) {
      const tail = new THREE.Mesh(
        new THREE.PlaneGeometry(0.18, 0.65),
        new THREE.MeshStandardMaterial({ color: 0x050403, roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
      );
      tail.position.set(side * 0.14, -0.65, 0.04);
      tail.rotation.z = side * 0.15;
      torso.add(tail);
    }

    // Cross beam for shoulders
    addPart(new THREE.BoxGeometry(1.9, 0.05, 0.05), woodFaded, 0, 1.95, 0);

    // Arms ending in syringe needle fingers / rusted blades
    const armGeo = new THREE.CylinderGeometry(0.06, 0.035, 0.65, 6);
    const leftArm = addPart(armGeo, coatOuter, -0.5, 1.8, 0, 'leftArm');
    const rightArm = addPart(armGeo, coatOuter, 0.5, 1.8, 0, 'rightArm');
    leftArm.rotation.z = 0.35;
    rightArm.rotation.z = -0.35;
    
    for (const [arm, side] of [[leftArm, -1], [rightArm, 1]]) {
      const wristWrap = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.08, 6), burlapDark);
      wristWrap.position.set(0, -0.32, 0);
      arm.add(wristWrap);
      
      // Syringe needle hands
      for (let f = 0; f < 3; f++) {
        const needle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.004, 0.012, 0.28, 4),
          metalMat
        );
        needle.position.set((f - 1) * 0.02, -0.48, Math.random() * 0.02);
        needle.rotation.x = (Math.random() - 0.5) * 0.2;
        needle.rotation.z = side * 0.1 + (f - 1) * 0.1;
        arm.add(needle);
      }
    }

    // Heavy noose around the neck
    const noose = new THREE.Mesh(
      new THREE.TorusGeometry(0.11, 0.025, 6, 12),
      burlapDark
    );
    noose.position.set(0, 2.22, 0.06);
    noose.rotation.x = Math.PI / 2 + 0.1;
    g.add(noose);

    // Gas Mask Burlap Head
    const headGroup = new THREE.Group();
    headGroup.name = 'head';
    headGroup.position.set(0, 2.45, 0.08);
    headGroup.rotation.x = 0.2; // staring down
    g.add(headGroup);

    // Burlap sack
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.38, 8), burlapDark);
    headGroup.add(head);

    // Twin organic respirator filters on the cheeks
    for (const side of [-1, 1]) {
      const filter = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 8), metalMat);
      filter.position.set(side * 0.15, -0.06, 0.14);
      filter.rotation.z = side * Math.PI / 2;
      filter.rotation.y = side * 0.4;
      headGroup.add(filter);
    }
    
    // Fear toxin glowing tube injecting into the mask
    const headTube = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 5), tubeMat);
    headTube.position.set(0, -0.22, 0.15);
    headTube.rotation.x = -0.4;
    headGroup.add(headTube);

    // Dead eye socket and glowing gas eye
    const leftEye = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 6), glowingEyeMat);
    leftEye.position.set(-0.07, 0.04, 0.16);
    leftEye.rotation.x = Math.PI / 2;
    headGroup.add(leftEye);
    
    // Asymmetric dead eye
    const rightEye = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 6), deadEyeMat);
    rightEye.position.set(0.07, 0.05, 0.16);
    rightEye.rotation.x = Math.PI / 2 + 0.1;
    headGroup.add(rightEye);

    // Wide, stitched Joker-like mouth using vertical staples
    const mouthCut = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.01), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    mouthCut.position.set(0, -0.08, 0.182);
    headGroup.add(mouthCut);
    for (let s = 0; s < 12; s++) {
      const staple = new THREE.Mesh(new THREE.PlaneGeometry(0.008, 0.04), metalMat);
      staple.position.set(-0.11 + s * 0.02, -0.08, 0.183);
      staple.rotation.z = (Math.random() - 0.5) * 0.4;
      headGroup.add(staple);
    }

    // Tattered witch/scarecrow hat
    const hatBrim = addPart(new THREE.CylinderGeometry(0.35, 0.38, 0.02, 10), coatOuter, 0, 2.65, 0.06);
    hatBrim.rotation.x = 0.1;
    const hatTop = addPart(new THREE.ConeGeometry(0.18, 0.45, 8), coatOuter, 0, 2.85, 0.02);
    hatTop.rotation.set(0.15, 0, -0.15); // crooked

    return g;
  }

  _normalize2(x, z) {
    const len = Math.hypot(x, z) || 1;
    return { x: x / len, z: z / len, len };
  }

  _poseIdle(sc, sway) {
    sc.mesh.position.y = Math.sin(sway * 0.7) * 0.03;
    sc.mesh.rotation.x = 0;
    sc.mesh.rotation.y = sc.baseYaw + Math.sin(sway * 0.42) * 0.05;
    sc.mesh.rotation.z = Math.sin(sway) * 0.035;

    if (sc.leftLeg && sc.rightLeg) {
      sc.leftLeg.rotation.x = Math.sin(sway * 0.8) * 0.05;
      sc.rightLeg.rotation.x = -Math.sin(sway * 0.8) * 0.05;
    }
    if (sc.arms[0]) {
      sc.arms[0].rotation.x = 0;
      sc.arms[1].rotation.x = 0;
      sc.arms[0].rotation.z = 0.42 + Math.sin(sway * 0.9) * 0.08;
      sc.arms[1].rotation.z = -0.42 - Math.sin(sway * 0.9) * 0.08;
    }
    if (sc.head) {
      sc.head.rotation.x = Math.sin(sway * 0.7) * 0.04;
      sc.head.rotation.z = 0.12 + Math.sin(sway * 1.2) * 0.1;
      sc.head.rotation.y = Math.sin(sway * 0.6) * 0.08;
    }
    if (sc.torso) {
      sc.torso.rotation.x = 0;
      sc.torso.rotation.z = Math.sin(sway * 0.65) * 0.03;
    }
  }

  _triggerAmbush(sc, playerXZ, playerMotion, onScare) {
    const motion = this._normalize2(playerMotion.x, playerMotion.z);
    const side = Math.random() < 0.5 ? -1 : 1;
    const lateral = { x: -motion.z * side, z: motion.x * side };
    const frontDistance = 1.85 + Math.random() * 0.55;
    const sideOffset = 0.32 + Math.random() * 0.42;

    sc.triggered = true;
    sc.state = 'ambush';
    sc.timer = 0;
    sc.didBoo = false;
    sc.ambushFrom = { x: sc.mesh.position.x, z: sc.mesh.position.z };
    sc.ambushTo = {
      x: playerXZ.x + motion.x * frontDistance + lateral.x * sideOffset,
      z: playerXZ.z + motion.z * frontDistance + lateral.z * sideOffset,
    };

    const flee = this._normalize2(
      sc.ambushTo.x - playerXZ.x + lateral.x * 1.2 + (Math.random() - 0.5) * 0.35,
      sc.ambushTo.z - playerXZ.z + lateral.z * 1.2 + (Math.random() - 0.5) * 0.35
    );
    sc.fleeDir = { x: flee.x, z: flee.z };

    if (onScare) onScare();
  }

  updateScarecrows(playerXZ, playerMotion, dt, audio, onScare) {
    for (const sc of this.scarecrows) {
      if (sc.state === 'gone') continue;
      sc.timer += dt;
      const dx = playerXZ.x - sc.x;
      const dz = playerXZ.z - sc.z;
      const dist = Math.hypot(dx, dz);
      const sway = sc.timer + sc.phase;

      switch (sc.state) {
        case 'idle':
          this._poseIdle(sc, sway);

          // Jump scare trigger conditions: Much looser angle required so they actually trigger
          if (!sc.triggered && sc.willScare && dist < 12.5 && dist > 1.5 && playerMotion.speed > 0.05) {
            const move = this._normalize2(playerMotion.x, playerMotion.z);
            const toward = this._normalize2(sc.x - playerXZ.x, sc.z - playerXZ.z);
            const approachDot = move.x * toward.x + move.z * toward.z;

            // Trigger if you are even vaguely walking towards it (-0.2 is very loose)
            if (approachDot > -0.2) {
              this._triggerAmbush(sc, playerXZ, playerMotion, onScare);
            }
          }
          break;

        case 'ambush': {
          // Double the speed of the leap (timer / 0.08 instead of 0.17)
          const jumpT = Math.min(1, sc.timer / 0.08);
          // Explode forward instead of smooth ease
          const jumpEase = 1 - Math.pow(1 - jumpT, 5);
          sc.mesh.position.x = THREE.MathUtils.lerp(sc.ambushFrom.x, sc.ambushTo.x, jumpEase);
          sc.mesh.position.z = THREE.MathUtils.lerp(sc.ambushFrom.z, sc.ambushTo.z, jumpEase);
          sc.mesh.position.y = Math.sin(Math.min(1, sc.timer / 0.12) * Math.PI) * 0.7;
          sc.mesh.lookAt(playerXZ.x, 1.3 + sc.mesh.position.y * 0.2, playerXZ.z);

          if (sc.arms[0]) {
            sc.arms[0].rotation.x = -1.8; // Arms raised aggressively high
            sc.arms[1].rotation.x = -1.8;
            sc.arms[0].rotation.z = 0.4;
            sc.arms[1].rotation.z = -0.4;
          }
          if (sc.head) {
            sc.head.rotation.x = -0.35 + Math.sin(sc.timer * 12) * 0.1;
            sc.head.rotation.y = Math.sin(sc.timer * 10) * 0.18;
            sc.head.rotation.z = 0.08 + Math.sin(sc.timer * 18) * 0.18;
          }
          if (sc.torso) {
            sc.torso.rotation.x = -0.22;
          }
          if (sc.leftLeg && sc.rightLeg) {
            sc.leftLeg.rotation.x = -0.7;
            sc.rightLeg.rotation.x = -0.7;
          }
          if (!sc.didBoo && sc.timer > 0.02) {
            sc.didBoo = true;
            // Play the terrifying jump scare (the generic playJumpScare is way louder than the scarecrow one)
            if (audio?.playJumpScare) audio.playJumpScare();
            if (audio?.playScarecrowBoo) audio.playScarecrowBoo();
          }

          if (sc.timer > 0.28) {
            sc.state = 'flee';
            sc.timer = 0;
            sc.mesh.position.y = 0;
          }
          break;
        }

        case 'flee': {
          const speed = 10.5;
          sc.mesh.position.x += sc.fleeDir.x * speed * dt;
          sc.mesh.position.z += sc.fleeDir.z * speed * dt;
          sc.mesh.position.y = Math.abs(Math.sin(sc.timer * 15)) * 0.14;
          if (sc.leftLeg && sc.rightLeg) {
            sc.leftLeg.rotation.x = Math.sin(sc.timer * 15) * 0.82;
            sc.rightLeg.rotation.x = -Math.sin(sc.timer * 15) * 0.82;
          }
          if (sc.arms[0]) {
            sc.arms[0].rotation.x = -0.22;
            sc.arms[1].rotation.x = -0.22;
            sc.arms[0].rotation.z = 0.45 + Math.sin(sc.timer * 15) * 0.35;
            sc.arms[1].rotation.z = -0.45 - Math.sin(sc.timer * 15) * 0.35;
          }
          if (sc.head) {
            sc.head.rotation.x = 0.18 + Math.sin(sc.timer * 12) * 0.08;
            sc.head.rotation.z = 0.12 + Math.sin(sc.timer * 18) * 0.14;
          }
          if (sc.torso) {
            sc.torso.rotation.x = 0.2;
          }

          const fleeDist = Math.hypot(sc.fleeDir.x, sc.fleeDir.z) || 1;
          sc.mesh.lookAt(
            sc.mesh.position.x + sc.fleeDir.x / fleeDist,
            1.2,
            sc.mesh.position.z + sc.fleeDir.z / fleeDist
          );

          if (sc.timer > 3.2) {
            sc.state = 'gone';
            sc.mesh.visible = false;
          }
          break;
        }
      }

      // Update tracked position
      sc.x = sc.mesh.position.x;
      sc.z = sc.mesh.position.z;
    }
  }

  /* ---- crows ---- */
  spawnCrows(playerPos, audio) {
    audio.playCrow();
    const count = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < count; i++) {
      // Better crow shape: body + wings
      const crowGroup = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.ConeGeometry(0.06, 0.2, 4),
        new THREE.MeshBasicMaterial({ color: 0x080808 })
      );
      body.rotation.x = Math.PI / 2;
      crowGroup.add(body);

      // Wings
      for (const side of [-1, 1]) {
        const wing = new THREE.Mesh(
          new THREE.PlaneGeometry(0.18, 0.06),
          new THREE.MeshBasicMaterial({ color: 0x0a0a0a, side: THREE.DoubleSide })
        );
        wing.position.set(side * 0.1, 0, 0);
        wing.name = 'wing';
        crowGroup.add(wing);
      }

      const a = Math.random() * Math.PI * 2;
      const d = 2 + Math.random() * 4;
      crowGroup.position.set(
        playerPos.x + Math.cos(a) * d,
        0.4 + Math.random() * 1.2,
        playerPos.z + Math.sin(a) * d,
      );
      this.scene.add(crowGroup);
      this.crows.push({
        mesh: crowGroup,
        vel: new THREE.Vector3((Math.random() - 0.5) * 4, 2.5 + Math.random() * 2, (Math.random() - 0.5) * 4),
        life: 3 + Math.random() * 2,
        flapTime: 0,
      });
    }
  }

  /* ---- cat ---- */
  spawnCat(playerPos, audio, isBlack, state) {
    audio.playCatMeow();
    const color = isBlack ? 0x040404 : 0x775522;
    const mat = new THREE.MeshStandardMaterial({ color });
    
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.45, 8), mat);
    body.rotation.x = Math.PI / 2;

    for (const dx of [-0.07, 0.07]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.07, 4), mat);
      ear.position.set(dx, 0.18, 0.12);
      ear.rotation.x = -Math.PI / 2;
      body.add(ear);
    }
    const eyeColor = isBlack ? 0xffcc00 : 0x44aa44;
    const eyeMat = new THREE.MeshBasicMaterial({ color: eyeColor });
    for (const dx of [-0.05, 0.05]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.015, 6, 6), eyeMat);
      eye.position.set(dx, 0.22, 0.05);
      body.add(eye);
    }
    // Tail
    const tail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.008, 0.25, 4),
      mat
    );
    tail.position.set(0, 0.06, 0.25);
    tail.rotation.x = -0.5;
    body.add(tail);

    const side = Math.random() < 0.5 ? -1 : 1;
    body.position.set(playerPos.x + side * 5, 0.13, playerPos.z + (Math.random() - 0.5) * 3);
    this.scene.add(body);

    if (isBlack) state.luck = Math.max(0, state.luck - 15);

    this.animals.push({
      mesh: body,
      vel: new THREE.Vector3(-side * 3.5, 0, (Math.random() - 0.5) * 2),
      life: 4,
    });
  }

  /* ---- squirrel ---- */
  spawnSquirrel(playerPos, audio) {
    audio.playRustle();
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 5, 4),
      new THREE.MeshStandardMaterial({ color: 0x553311 })
    );
    const a = Math.random() * Math.PI * 2;
    mesh.position.set(playerPos.x + Math.cos(a) * 3, 0.08, playerPos.z + Math.sin(a) * 3);
    this.scene.add(mesh);
    this.animals.push({
      mesh,
      vel: new THREE.Vector3((Math.random() - 0.5) * 5, 0, (Math.random() - 0.5) * 5),
      life: 2.5,
    });
  }

  /* ---- update all ---- */
  updateAnimals(dt) {
    this.crows = this.crows.filter(c => {
      c.life -= dt;
      c.mesh.position.add(c.vel.clone().multiplyScalar(dt));
      // Wing flapping
      c.flapTime = (c.flapTime || 0) + dt;
      c.mesh.children.forEach(child => {
        if (child.name === 'wing') {
          child.rotation.z = Math.sin(c.flapTime * 15) * 0.5;
        }
      });
      if (c.life <= 0) { this.scene.remove(c.mesh); return false; }
      return true;
    });
    this.animals = this.animals.filter(a => {
      a.life -= dt;
      a.mesh.position.add(a.vel.clone().multiplyScalar(dt));
      if (a.life <= 0) { this.scene.remove(a.mesh); return false; }
      return true;
    });
  }
}
