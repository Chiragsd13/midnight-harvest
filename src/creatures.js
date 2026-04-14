import * as THREE from 'three';

export class Creatures {
  constructor(scene) {
    this.scene = scene;
    this.scarecrows = [];
    this.crows = [];
    this.animals = [];
  }

  /* ---- scarecrows (detailed, scary) ---- */
  spawnScarecrows(count = 18, fieldSize = 200) {
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

    const woodDark = new THREE.MeshStandardMaterial({ color: 0x1a1208, roughness: 1 });
    const woodFaded = new THREE.MeshStandardMaterial({ color: 0x2f2112, roughness: 1 });
    const coatOuter = new THREE.MeshStandardMaterial({ color: 0x18130d, roughness: 0.98 });
    const coatInner = new THREE.MeshStandardMaterial({ color: 0x0e0c09, roughness: 1 });
    const burlap = new THREE.MeshStandardMaterial({ color: 0x4c3922, roughness: 0.92 });
    const strawMat = new THREE.MeshStandardMaterial({ color: 0x86753a, roughness: 1 });
    const stitchMat = new THREE.MeshBasicMaterial({ color: 0x0b0a08, side: THREE.DoubleSide });
    const emberEye = new THREE.MeshBasicMaterial({ color: 0xff7a1f });
    const dimEye = new THREE.MeshBasicMaterial({ color: 0xc64119 });

    const addPart = (geo, mat, x, y, z, name) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      if (name) m.name = name;
      g.add(m);
      return m;
    };

    addPart(new THREE.CylinderGeometry(0.03, 0.045, 2.6, 5), woodDark, 0, 1.3, 0);
    const legGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.9, 5);
    const leftLeg = addPart(legGeo, coatOuter, -0.12, 0.45, 0, 'leftLeg');
    const rightLeg = addPart(legGeo, coatOuter, 0.12, 0.45, 0, 'rightLeg');
    for (const leg of [leftLeg, rightLeg]) {
      for (let s = 0; s < 3; s++) {
        const strip = new THREE.Mesh(
          new THREE.PlaneGeometry(0.06, 0.15),
          new THREE.MeshStandardMaterial({ color: 0x100d09, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
        );
        strip.position.set((Math.random() - 0.5) * 0.06, -0.2 + s * 0.15, 0.04);
        strip.rotation.z = (Math.random() - 0.5) * 0.5;
        leg.add(strip);
      }
      const boot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.08, 0.11, 6),
        woodDark
      );
      boot.position.set(0, -0.48, 0.04);
      leg.add(boot);
    }

    const torso = addPart(new THREE.CylinderGeometry(0.24, 0.28, 0.92, 8), coatOuter, 0, 1.36, 0.02, 'torso');
    const belly = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 0.62, 6),
      coatInner
    );
    belly.position.set(0, -0.04, 0.1);
    torso.add(belly);
    for (const side of [-1, 1]) {
      const lapel = new THREE.Mesh(
        new THREE.PlaneGeometry(0.16, 0.42),
        new THREE.MeshStandardMaterial({ color: 0x23180f, roughness: 1, side: THREE.DoubleSide })
      );
      lapel.position.set(side * 0.12, 0.1, 0.18);
      lapel.rotation.set(0.08, 0, side * -0.28);
      torso.add(lapel);
    }
    for (const side of [-1, 1]) {
      const tail = new THREE.Mesh(
        new THREE.PlaneGeometry(0.16, 0.48),
        new THREE.MeshStandardMaterial({ color: 0x110d09, roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: 0.86 })
      );
      tail.position.set(side * 0.12, -0.43, 0.02);
      tail.rotation.z = side * 0.12;
      torso.add(tail);
    }

    for (let s = 0; s < 6; s++) {
      const straw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.005, 0.12 + Math.random() * 0.1, 3),
        strawMat
      );
      straw.position.set(
        (Math.random() - 0.5) * 0.34,
        -0.2 + Math.random() * 0.55,
        0.18
      );
      straw.rotation.set(Math.random(), Math.random(), Math.random());
      torso.add(straw);
    }

    addPart(new THREE.BoxGeometry(1.6, 0.04, 0.04), woodFaded, 0, 1.95, 0);

    const armGeo = new THREE.CylinderGeometry(0.045, 0.035, 0.55, 6);
    const leftArm = addPart(armGeo, coatOuter, -0.4, 1.7, 0, 'leftArm');
    const rightArm = addPart(armGeo, coatOuter, 0.4, 1.7, 0, 'rightArm');
    leftArm.rotation.z = 0.42;
    rightArm.rotation.z = -0.42;
    for (const [arm, side] of [[leftArm, -1], [rightArm, 1]]) {
      const hand = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 6, 6),
        burlap
      );
      hand.position.set(0, -0.32, 0);
      arm.add(hand);
      for (let s = 0; s < 2; s++) {
        const sleeveTear = new THREE.Mesh(
          new THREE.PlaneGeometry(0.08, 0.18),
          new THREE.MeshStandardMaterial({ color: 0x0d0b09, roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: 0.82 })
        );
        sleeveTear.position.set(side * 0.015, -0.18 + s * 0.07, 0.03);
        sleeveTear.rotation.z = side * (0.18 + s * 0.08);
        arm.add(sleeveTear);
      }
      for (let f = 0; f < 2; f++) {
        const straw = new THREE.Mesh(
          new THREE.CylinderGeometry(0.008, 0.004, 0.12, 3),
          strawMat
        );
        straw.position.set(-0.015 + f * 0.03, -0.4, 0.01);
        straw.rotation.z = side * (0.12 + f * 0.1);
        hand.add(straw);
      }
    }

    const headGroup = new THREE.Group();
    headGroup.name = 'head';
    headGroup.position.set(0.03, 2.46, 0.01);
    headGroup.rotation.z = 0.12;
    g.add(headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), burlap);
    head.scale.set(0.96, 1.18, 0.9);
    headGroup.add(head);

    const cheekPatch = new THREE.Mesh(
      new THREE.PlaneGeometry(0.12, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x776145, roughness: 0.96, side: THREE.DoubleSide })
    );
    cheekPatch.position.set(-0.06, -0.02, 0.17);
    cheekPatch.rotation.z = -0.28;
    headGroup.add(cheekPatch);

    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(0.028, 0.12, 4),
      woodFaded
    );
    nose.position.set(0.02, -0.01, 0.2);
    nose.rotation.x = Math.PI / 2;
    nose.rotation.z = 0.2;
    headGroup.add(nose);

    const mouth = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.02), stitchMat);
    mouth.position.set(0.005, -0.085, 0.205);
    mouth.rotation.z = -0.08;
    headGroup.add(mouth);
    for (let s = 0; s < 7; s++) {
      const stitch = new THREE.Mesh(
        new THREE.PlaneGeometry(0.008, 0.05),
        stitchMat
      );
      stitch.position.set(-0.065 + s * 0.022, -0.083 + Math.sin(s * 0.8) * 0.01, 0.206);
      stitch.rotation.z = 0.22 + (s % 2 === 0 ? -0.18 : 0.14);
      headGroup.add(stitch);
    }

    const leftEye = new THREE.Mesh(new THREE.CircleGeometry(0.03, 3), emberEye);
    leftEye.position.set(-0.075, 0.04, 0.195);
    leftEye.rotation.z = -0.3;
    headGroup.add(leftEye);
    const rightEye = new THREE.Mesh(new THREE.CircleGeometry(0.017, 5), dimEye);
    rightEye.position.set(0.055, 0.065, 0.196);
    headGroup.add(rightEye);
    for (const [x, y, angle] of [[0.055, 0.065, 0.5], [0.057, 0.065, -0.48]]) {
      const stitch = new THREE.Mesh(
        new THREE.PlaneGeometry(0.008, 0.06),
        stitchMat
      );
      stitch.position.set(x, y, 0.198);
      stitch.rotation.z = angle;
      headGroup.add(stitch);
    }

    for (let r = 0; r < 4; r++) {
      const rag = new THREE.Mesh(
        new THREE.PlaneGeometry(0.09, 0.18 + Math.random() * 0.06),
        new THREE.MeshStandardMaterial({ color: 0x1b1510, roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: 0.84 })
      );
      rag.position.set(-0.08 + r * 0.05, 0.08 + Math.random() * 0.05, -0.03);
      rag.rotation.set(
        -0.12 + Math.random() * 0.18,
        0,
        -0.26 + r * 0.17
      );
      headGroup.add(rag);
    }

    const hatBrim = addPart(new THREE.CylinderGeometry(0.3, 0.34, 0.03, 10), woodDark, 0.02, 2.68, 0);
    hatBrim.rotation.z = -0.12;
    const hatTop = addPart(new THREE.CylinderGeometry(0.11, 0.16, 0.27, 10), woodDark, 0.05, 2.83, -0.02);
    hatTop.rotation.set(0.02, 0, -0.18);

    const rope = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.012, 4, 12),
      new THREE.MeshStandardMaterial({ color: 0x3a2a0a, roughness: 1 })
    );
    rope.position.set(0, 2.25, 0);
    rope.rotation.x = Math.PI / 2;
    g.add(rope);

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

          if (!sc.triggered && sc.willScare && dist < 11.5 && dist > 2.5 && playerMotion.speed > 0.1) {
            const move = this._normalize2(playerMotion.x, playerMotion.z);
            const toward = this._normalize2(sc.x - playerXZ.x, sc.z - playerXZ.z);
            const approachDot = move.x * toward.x + move.z * toward.z;

            if (approachDot > 0.76) {
              this._triggerAmbush(sc, playerXZ, playerMotion, onScare);
            }
          }
          break;

        case 'ambush': {
          const jumpT = Math.min(1, sc.timer / 0.17);
          const jumpEase = 1 - Math.pow(1 - jumpT, 4);
          sc.mesh.position.x = THREE.MathUtils.lerp(sc.ambushFrom.x, sc.ambushTo.x, jumpEase);
          sc.mesh.position.z = THREE.MathUtils.lerp(sc.ambushFrom.z, sc.ambushTo.z, jumpEase);
          sc.mesh.position.y = Math.sin(Math.min(1, sc.timer / 0.24) * Math.PI) * 0.55;
          sc.mesh.lookAt(playerXZ.x, 1.3 + sc.mesh.position.y * 0.2, playerXZ.z);

          if (sc.arms[0]) {
            sc.arms[0].rotation.x = -1.1;
            sc.arms[1].rotation.x = -1.1;
            sc.arms[0].rotation.z = 0.18;
            sc.arms[1].rotation.z = -0.18;
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
            sc.leftLeg.rotation.x = -0.55;
            sc.rightLeg.rotation.x = -0.55;
          }
          if (!sc.didBoo && sc.timer > 0.09) {
            sc.didBoo = true;
            if (audio?.playScarecrowBoo) audio.playScarecrowBoo();
          }

          if (sc.timer > 0.42) {
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
