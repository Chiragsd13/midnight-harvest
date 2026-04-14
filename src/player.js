import * as THREE from 'three';

export class Player {
  constructor(camera, canvas, touch = null) {
    this.cam = camera;
    this.canvas = canvas;
    this.touch = touch;
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.locked = false;

    this.keys = { f: false, b: false, l: false, r: false, sprint: false };
    this.walkSpeed = 3.05;
    this.sprintSpeed = 5.35;
    this.eyeHeight = 1.68;
    this.velocity = new THREE.Vector3();
    this.bobTime = 0;
    this.stepTimer = 0;
    this.rustleTimer = 0;
    this.moveDir = new THREE.Vector3();
    this.moveSpeed = 0;

    this.cam.position.set(0, this.eyeHeight, 0);

    // First-person Hands
    this.handsGroup = new THREE.Group();
    // Positioned slightly below and forward of the camera
    this.handsGroup.position.set(0, -0.38, -0.5);
    this.cam.add(this.handsGroup);
    this.handsGroupBasePos = this.handsGroup.position.clone();
    this.handsGroupBaseRot = this.handsGroup.rotation.clone();

    const handMat = new THREE.MeshStandardMaterial({ color: 0x181a1c, roughness: 0.95 }); // Dark sleeve/glove
    const handGeo = new THREE.CylinderGeometry(0.035, 0.045, 0.7, 8);
    // Left arm
    this.lHand = new THREE.Mesh(handGeo, handMat);
    this.lHand.position.set(-0.35, -0.2, 0.1);
    this.lHand.rotation.set(-Math.PI / 2 + 0.2, 0, 0.15); // Pointing forward, slightly inward
    this.handsGroup.add(this.lHand);
    // Right arm
    this.rHand = new THREE.Mesh(handGeo, handMat);
    this.rHand.position.set(0.35, -0.2, 0.1);
    this.rHand.rotation.set(-Math.PI / 2 + 0.2, 0, -0.15);
    this.handsGroup.add(this.rHand);

    // Hand animation state
    this.lHandBase = { pos: this.lHand.position.clone(), rot: this.lHand.rotation.clone() };
    this.rHandBase = { pos: this.rHand.position.clone(), rot: this.rHand.rotation.clone() };
    this.pushAnimPhase = 0;
    this.coughBlend = 0;
    this.coughPhase = 0;

    this._onMouse = this._onMouse.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    document.addEventListener('mousemove', this._onMouse);
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
  }

  _onMouse(e) {
    if (!this.locked) return;
    const mx = e.movementX || 0;
    const my = e.movementY || 0;
    const s = 0.002;
    // `this.euler` is the canonical camera orientation (YXZ: yaw, pitch, roll).
    // Do NOT read it back from the quaternion — Three.js round-trips rotation
    // through XYZ order, which silently mangles pitch over time and can flip
    // the camera upside-down after enough input.
    this.euler.y -= mx * s;
    this.euler.x -= my * s;
    this.euler.x = Math.max(-1.5, Math.min(1.5, this.euler.x));
    this.cam.quaternion.setFromEuler(this.euler);

    // Procedural hand sway on mouse move
    this.handsGroup.rotation.y -= mx * 0.0005;
    this.handsGroup.rotation.x -= my * 0.0005;
  }

  setView(pitch = 0, yaw = 0, roll = 0) {
    this.euler.set(pitch, yaw, roll, 'YXZ');
    this.cam.quaternion.setFromEuler(this.euler);
  }

  syncViewFromCamera(clearRoll = false) {
    this.euler.setFromQuaternion(this.cam.quaternion, 'YXZ');
    if (clearRoll) {
      this.euler.z = 0;
      this.cam.quaternion.setFromEuler(this.euler);
    }
  }

  _applyTouchLook() {
    if (!this.touch || !this.touch.enabled) return;
    const d = this.touch.consumeLook();
    if (d.dx === 0 && d.dy === 0) return;
    const s = 0.004;
    this.euler.y -= d.dx * s;
    this.euler.x -= d.dy * s;
    this.euler.x = Math.max(-1.5, Math.min(1.5, this.euler.x));
    this.cam.quaternion.setFromEuler(this.euler);
  }

  _onKeyDown(e) {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp':    this.keys.f = true; break;
      case 'KeyS': case 'ArrowDown':  this.keys.b = true; break;
      case 'KeyA': case 'ArrowLeft':  this.keys.l = true; break;
      case 'KeyD': case 'ArrowRight': this.keys.r = true; break;
      case 'ShiftLeft': case 'ShiftRight': this.keys.sprint = true; break;
    }
  }

  _onKeyUp(e) {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp':    this.keys.f = false; break;
      case 'KeyS': case 'ArrowDown':  this.keys.b = false; break;
      case 'KeyA': case 'ArrowLeft':  this.keys.l = false; break;
      case 'KeyD': case 'ArrowRight': this.keys.r = false; break;
      case 'ShiftLeft': case 'ShiftRight': this.keys.sprint = false; break;
    }
  }

  update(dt, state, audio, world = null) {
    if (!this.locked || state.phase !== 'playing') return;

    // Apply touch look deltas each frame
    this._applyTouchLook();

    // Touch joystick overrides key state when active
    let fwd = this.keys.f, back = this.keys.b, lft = this.keys.l, rgt = this.keys.r;
    let sprintDown = this.keys.sprint;
    if (this.touch && this.touch.enabled) {
      const tx = this.touch.move.x, ty = this.touch.move.y;
      const dead = 0.15;
      // joystick y positive = down on screen = backward
      if (ty < -dead) fwd = true;
      if (ty > dead)  back = true;
      if (tx < -dead) lft = true;
      if (tx > dead)  rgt = true;
      if (this.touch.sprintHeld) sprintDown = true;
    }

    const moving = fwd || back || lft || rgt;

    if (state.runCooldown > 0) {
      state.runCooldown = Math.max(0, state.runCooldown - dt);
    }

    const dir = new THREE.Vector3();
    const fwdV = new THREE.Vector3();
    this.cam.getWorldDirection(fwdV);
    fwdV.y = 0; fwdV.normalize();
    const right = new THREE.Vector3().crossVectors(fwdV, new THREE.Vector3(0, 1, 0));

    if (fwd)  dir.add(fwdV);
    if (back) dir.sub(fwdV);
    if (lft)  dir.sub(right);
    if (rgt)  dir.add(right);

    let sprinting = false;
    if (dir.lengthSq() > 0) {
      dir.normalize();
      sprinting = sprintDown; // Unlimited frantic sprinting
    }

    const targetSpeed = sprinting ? this.sprintSpeed : this.walkSpeed;
    const targetVelocity = dir.lengthSq() > 0 ? dir.clone().multiplyScalar(targetSpeed) : new THREE.Vector3();
    const response = dir.lengthSq() > 0 ? (sprinting ? 8.5 : 6.2) : 9.4;
    const blend = 1 - Math.exp(-response * dt);
    this.velocity.lerp(targetVelocity, blend);

    const horizontalSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    
    // Hand spring-back to center (recovering from mouse sway)
    this.handsGroup.position.lerp(this.handsGroupBasePos, 0.12);
    this.handsGroup.rotation.x *= 0.9;
    this.handsGroup.rotation.y *= 0.9;
    this.handsGroup.rotation.z += (this.handsGroupBaseRot.z - this.handsGroup.rotation.z) * 0.12;

    if (horizontalSpeed > 0.02) {
      this.moveDir.set(this.velocity.x / horizontalSpeed, 0, this.velocity.z / horizontalSpeed);
      this.moveSpeed = horizontalSpeed;
      this.cam.position.x += this.velocity.x * dt;
      this.cam.position.z += this.velocity.z * dt;
      state.distanceTraveled += horizontalSpeed * dt;

      // Thrashing heavy head bob & visceral hand movements
      this.bobTime += dt * horizontalSpeed * Math.PI;
      const amp = sprinting ? 0.095 : 0.045; // Massive head bob displacement
      const bobOffset = Math.sin(this.bobTime) * amp;
      const groundY = world && world.groundHeightAt ? world.groundHeightAt(this.cam.position.x, this.cam.position.z) : 0;
      this.cam.position.y = groundY + this.eyeHeight + bobOffset;
      // Camera roll via euler.z (YXZ order gives proper FPS bank).
      // Writing to cam.rotation.z directly would round-trip through XYZ order
      // and flip the camera upside-down over time.
      this.euler.z = sprinting ? Math.sin(this.bobTime * 0.5) * 0.02 : 0;
      this.cam.quaternion.setFromEuler(this.euler);

      // Procedural crop-pushing for ALL movement, scaled by speed
      const animSpeed = sprinting ? 11 : 6;
      this.pushAnimPhase += dt * animSpeed;
      
      const cycleL = (Math.sin(this.pushAnimPhase) + 1) / 2; // 0 to 1
      const cycleR = (Math.sin(this.pushAnimPhase + Math.PI) + 1) / 2; // 0 to 1

      // Intensity heavily scaled up if sprinting
      const pushZ = sprinting ? 0.3 : 0.15;
      const pushX = sprinting ? 0.28 : 0.12;
      const twistX = sprinting ? 0.5 : 0.2;
      const twistZ = sprinting ? 0.5 : 0.2;
      const hookY = sprinting ? 0.6 : 0.25;

      // Left Hand: Thrust forward, Sweep out to left, Twist wrist outward
      this.lHand.position.z = this.lHandBase.pos.z - 0.15 - cycleL * pushZ;
      this.lHand.position.x = this.lHandBase.pos.x - 0.1 - cycleL * pushX;
      this.lHand.rotation.x = this.lHandBase.rot.x - 0.4 - cycleL * twistX;
      this.lHand.rotation.z = cycleL * twistZ;
      this.lHand.rotation.y = cycleL * -hookY;

      // Right Hand: Thrust forward, Sweep out to right, Twist wrist outward
      this.rHand.position.z = this.rHandBase.pos.z - 0.15 - cycleR * pushZ;
      this.rHand.position.x = this.rHandBase.pos.x + 0.1 + cycleR * pushX;
      this.rHand.rotation.x = this.rHandBase.rot.x - 0.4 - cycleR * twistX;
      this.rHand.rotation.z = cycleR * -twistZ;
      this.rHand.rotation.y = cycleR * hookY;

      // Footsteps: dirt crunch
      this.stepTimer += dt;
      const stepInterval = sprinting ? 0.29 : 0.5;
      if (this.stepTimer > stepInterval && audio.ready) {
        audio.playFootstep();
        this.stepTimer = 0;
      }

      // Corn rustle: brushing past stalks while moving
      this.rustleTimer += dt;
      const rustleInterval = sprinting ? 0.46 : 0.76;
      if (this.rustleTimer > rustleInterval && audio.ready) {
        audio.playCornRustle();
        this.rustleTimer = 0;
      }
    } else {
      this.moveDir.set(0, 0, 0);
      this.moveSpeed = 0;
      const groundY = world && world.groundHeightAt ? world.groundHeightAt(this.cam.position.x, this.cam.position.z) : 0;
      this.cam.position.y = groundY + this.eyeHeight;
      this.bobTime = 0;
      
      // Return hands to resting position smoothly
      this.lHand.position.lerp(this.lHandBase.pos, 0.1);
      this.rHand.position.lerp(this.rHandBase.pos, 0.1);
      this.lHand.rotation.x += (this.lHandBase.rot.x - this.lHand.rotation.x) * 0.1;
      this.lHand.rotation.y += (this.lHandBase.rot.y - this.lHand.rotation.y) * 0.1;
      this.lHand.rotation.z += (this.lHandBase.rot.z - this.lHand.rotation.z) * 0.1;
      this.rHand.rotation.x += (this.rHandBase.rot.x - this.rHand.rotation.x) * 0.1;
      this.rHand.rotation.y += (this.rHandBase.rot.y - this.rHand.rotation.y) * 0.1;
      this.rHand.rotation.z += (this.rHandBase.rot.z - this.rHand.rotation.z) * 0.1;
    }

    if (state.isCoughing) {
      this.coughBlend = Math.min(1, this.coughBlend + dt * 7.5);
      this.coughPhase += dt * (11 + state.coughIntensity * 7);
    } else {
      this.coughBlend = Math.max(0, this.coughBlend - dt * 5.5);
      if (this.coughBlend === 0) this.coughPhase = 0;
    }

    if (this.coughBlend > 0.001) {
      const coughLift = Math.sin(this.coughPhase) * 0.03 * this.coughBlend;
      const handEase = 0.18 + this.coughBlend * 0.12;

      this.handsGroup.position.y += 0.035 * this.coughBlend;
      this.handsGroup.position.z += 0.028 * this.coughBlend;
      this.handsGroup.rotation.x += 0.1 * this.coughBlend;
      this.handsGroup.rotation.z += 0.05 * Math.sin(this.coughPhase * 0.5) * this.coughBlend;

      // Right hand covers the mouth while the left arm tenses down.
      this.rHand.position.lerp(new THREE.Vector3(0.12, 0.16 + coughLift, -0.16), handEase);
      this.rHand.rotation.x += ((Math.PI / 2) - 0.42 - this.rHand.rotation.x) * 0.24;
      this.rHand.rotation.y += (-0.82 - this.rHand.rotation.y) * 0.24;
      this.rHand.rotation.z += (-0.62 - this.rHand.rotation.z) * 0.24;

      this.lHand.position.lerp(new THREE.Vector3(-0.22, -0.04, -0.02), 0.12);
      this.lHand.rotation.x += (this.lHandBase.rot.x - 0.18 - this.lHand.rotation.x) * 0.14;
      this.lHand.rotation.y += (0.24 - this.lHand.rotation.y) * 0.14;
      this.lHand.rotation.z += (0.08 - this.lHand.rotation.z) * 0.14;
    }

    state.isRunning = sprinting && horizontalSpeed > this.walkSpeed + 0.35;
    state.stamina = state.runCooldown > 0 ? 0 : (state.runTimeLeft / 10) * 100;

    // No bounds clamping: field is unlimited
  }

  pos() { return this.cam.position; }
  xz() { return { x: this.cam.position.x, z: this.cam.position.z }; }
  movementXZ() { return { x: this.moveDir.x, z: this.moveDir.z, speed: this.moveSpeed }; }
}
