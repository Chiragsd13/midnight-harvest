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

    const handMat = new THREE.MeshStandardMaterial({ color: 0x181a1c, roughness: 0.95 }); // Dark sleeve/glove
    const handGeo = new THREE.CylinderGeometry(0.035, 0.045, 0.7, 8);
    // Left arm
    this.lHand = new THREE.Mesh(handGeo, handMat);
    this.lHand.position.set(-0.35, -0.2, 0.1);
    this.lHand.rotation.set(Math.PI / 2 + 0.2, 0, 0.15); // Pointing forward, slightly inward
    this.handsGroup.add(this.lHand);
    // Right arm
    this.rHand = new THREE.Mesh(handGeo, handMat);
    this.rHand.position.set(0.35, -0.2, 0.1);
    this.rHand.rotation.set(Math.PI / 2 + 0.2, 0, -0.15);
    this.handsGroup.add(this.rHand);

    // Hand animation state
    this.lHandBase = { pos: this.lHand.position.clone(), rot: this.lHand.rotation.clone() };
    this.rHandBase = { pos: this.rHand.position.clone(), rot: this.rHand.rotation.clone() };
    this.pushAnimPhase = 0;

    this._onMouse = this._onMouse.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    document.addEventListener('mousemove', this._onMouse);
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
  }

  _onMouse(e) {
    if (!this.locked) return;
    const s = 0.002;
    this.euler.setFromQuaternion(this.cam.quaternion);
    this.euler.y -= e.movementX * s;
    this.euler.x -= e.movementY * s;
    this.euler.x = Math.max(-1.5, Math.min(1.5, this.euler.x));
    this.cam.quaternion.setFromEuler(this.euler);

    // Procedural hand sway on mouse move
    this.handsGroup.rotation.y -= e.movementX * 0.0005;
    this.handsGroup.rotation.x -= e.movementY * 0.0005;
  }

  _applyTouchLook() {
    if (!this.touch || !this.touch.enabled) return;
    const d = this.touch.consumeLook();
    if (d.dx === 0 && d.dy === 0) return;
    const s = 0.004;
    this.euler.setFromQuaternion(this.cam.quaternion);
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
      if (state.runCooldown === 0 && state.runTimeLeft <= 0) {
        state.runTimeLeft = 10;
      }
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
      sprinting = sprintDown && state.runCooldown <= 0 && state.runTimeLeft > 0;
      if (sprinting) {
        state.runTimeLeft = Math.max(0, state.runTimeLeft - dt);
        if (state.runTimeLeft === 0) {
          sprinting = false;
          state.runCooldown = 30;
        }
      }
    }

    const targetSpeed = sprinting ? this.sprintSpeed : this.walkSpeed;
    const targetVelocity = dir.lengthSq() > 0 ? dir.clone().multiplyScalar(targetSpeed) : new THREE.Vector3();
    const response = dir.lengthSq() > 0 ? (sprinting ? 8.5 : 6.2) : 9.4;
    const blend = 1 - Math.exp(-response * dt);
    this.velocity.lerp(targetVelocity, blend);

    const horizontalSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    
    // Hand spring-back to center (recovering from mouse sway)
    this.handsGroup.rotation.x *= 0.9;
    this.handsGroup.rotation.y *= 0.9;

    if (horizontalSpeed > 0.02) {
      this.moveDir.set(this.velocity.x / horizontalSpeed, 0, this.velocity.z / horizontalSpeed);
      this.moveSpeed = horizontalSpeed;
      this.cam.position.x += this.velocity.x * dt;
      this.cam.position.z += this.velocity.z * dt;
      state.distanceTraveled += horizontalSpeed * dt;

      // Head bob & hand movements
      this.bobTime += dt * horizontalSpeed * 1.7;
      const amp = sprinting ? 0.055 : 0.028;
      const bobOffset = Math.sin(this.bobTime) * amp;
      const groundY = world && world.groundHeightAt ? world.groundHeightAt(this.cam.position.x, this.cam.position.z) : 0;
      this.cam.position.y = groundY + this.eyeHeight + bobOffset;

      // Walk cycle hand sway
      if (!sprinting) {
        this.lHand.position.y = this.lHandBase.pos.y + Math.sin(this.bobTime) * 0.02;
        this.rHand.position.y = this.rHandBase.pos.y + Math.cos(this.bobTime) * 0.02;
        this.lHand.position.z = this.lHandBase.pos.z + Math.cos(this.bobTime * 0.5) * 0.05;
        this.rHand.position.z = this.rHandBase.pos.z - Math.cos(this.bobTime * 0.5) * 0.05;
        this.lHand.rotation.x = this.lHandBase.rot.x;
        this.rHand.rotation.x = this.rHandBase.rot.x;
      } else {
        // Vigorous crop-pushing animation when sprinting
        this.pushAnimPhase += dt * 14;
        const p1 = Math.sin(this.pushAnimPhase);
        const p2 = Math.sin(this.pushAnimPhase + Math.PI);
        // Left hand pushes forward and out
        this.lHand.position.z = this.lHandBase.pos.z - 0.2 + p1 * 0.15;
        this.lHand.position.x = this.lHandBase.pos.x - 0.15 + p1 * 0.1;
        this.lHand.rotation.x = this.lHandBase.rot.x - 0.3 + p1 * 0.2;
        // Right hand alternates
        this.rHand.position.z = this.rHandBase.pos.z - 0.2 + p2 * 0.15;
        this.rHand.position.x = this.rHandBase.pos.x + 0.15 - p2 * 0.1;
        this.rHand.rotation.x = this.rHandBase.rot.x - 0.3 + p2 * 0.2;
      }

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
      this.rHand.rotation.x += (this.rHandBase.rot.x - this.rHand.rotation.x) * 0.1;
    }

    // Coughing overlay hand animation overriding all else
    if (state.isCoughing) {
      // Bring left hand up to face
      this.lHand.position.lerp(new THREE.Vector3(-0.1, 0.15, -0.2), 0.2);
      this.lHand.rotation.x += (Math.PI / 2 - 0.2 - this.lHand.rotation.x) * 0.2;
      this.lHand.rotation.z += (0.5 - this.lHand.rotation.z) * 0.2;
    }

    state.isRunning = sprinting && horizontalSpeed > this.walkSpeed + 0.35;
    state.stamina = state.runCooldown > 0 ? 0 : (state.runTimeLeft / 10) * 100;

    // No bounds clamping: field is unlimited
  }

  pos() { return this.cam.position; }
  xz() { return { x: this.cam.position.x, z: this.cam.position.z }; }
  movementXZ() { return { x: this.moveDir.x, z: this.moveDir.z, speed: this.moveSpeed }; }
}
