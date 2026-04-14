/* Touch controls for mobile/tablet devices.
   - Left half of screen = virtual joystick (drag to move)
   - Right half of screen = look camera (drag to rotate view)
   - Sprint button + Action button bottom right
*/

export function isTouchDevice() {
  return 'ontouchstart' in window
    || navigator.maxTouchPoints > 0
    || window.matchMedia('(pointer: coarse)').matches;
}

export class TouchControls {
  constructor() {
    this.enabled = false;
    this.move = { x: 0, y: 0 };   // -1..1
    this.look = { dx: 0, dy: 0 }; // consumed per frame
    this.sprintHeld = false;

    this.joyId = null;
    this.lookId = null;
    this.joyStart = { x: 0, y: 0 };
    this.joyRadius = 60;

    this._build();
    this._bind();
  }

  _build() {
    const root = document.createElement('div');
    root.id = 'touch-ui';
    root.innerHTML = `
      <div id="touch-joy"><div id="touch-joy-base"></div><div id="touch-joy-stick"></div></div>
      <div id="touch-look-hint">DRAG TO LOOK</div>
      <button id="touch-sprint">RUN</button>
    `;
    document.body.appendChild(root);
    this.root = root;
    this.joyEl = document.getElementById('touch-joy');
    this.joyBase = document.getElementById('touch-joy-base');
    this.joyStick = document.getElementById('touch-joy-stick');
    this.sprintBtn = document.getElementById('touch-sprint');
  }

  _bind() {
    // Intercept touches on the whole window, route based on screen side
    const onStart = (e) => {
      if (!this.enabled) return;
      for (const t of e.changedTouches) {
        // Sprint button?
        if (this._hit(this.sprintBtn, t)) {
          this.sprintHeld = true;
          this.sprintBtn.classList.add('active');
          e.preventDefault();
          continue;
        }
        const leftHalf = t.clientX < window.innerWidth * 0.5;
        if (leftHalf && this.joyId === null) {
          this.joyId = t.identifier;
          this.joyStart.x = t.clientX;
          this.joyStart.y = t.clientY;
          this.joyEl.style.left = (t.clientX - 70) + 'px';
          this.joyEl.style.top  = (t.clientY - 70) + 'px';
          this.joyEl.style.display = 'block';
          this._updateJoy(t.clientX, t.clientY);
          e.preventDefault();
        } else if (!leftHalf && this.lookId === null) {
          this.lookId = t.identifier;
          this._lookPrev = { x: t.clientX, y: t.clientY };
          e.preventDefault();
        }
      }
    };

    const onMove = (e) => {
      if (!this.enabled) return;
      for (const t of e.changedTouches) {
        if (t.identifier === this.joyId) {
          this._updateJoy(t.clientX, t.clientY);
          e.preventDefault();
        } else if (t.identifier === this.lookId) {
          this.look.dx += (t.clientX - this._lookPrev.x);
          this.look.dy += (t.clientY - this._lookPrev.y);
          this._lookPrev.x = t.clientX;
          this._lookPrev.y = t.clientY;
          e.preventDefault();
        }
      }
    };

    const onEnd = (e) => {
      if (!this.enabled) return;
      for (const t of e.changedTouches) {
        if (t.identifier === this.joyId) {
          this.joyId = null;
          this.move.x = 0; this.move.y = 0;
          this.joyEl.style.display = 'none';
        } else if (t.identifier === this.lookId) {
          this.lookId = null;
        }
        if (this._hit(this.sprintBtn, t)) {
          this.sprintHeld = false;
          this.sprintBtn.classList.remove('active');
        }
      }
    };

    window.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);

    // Sprint via touch release detection (in case finger leaves button)
    this.sprintBtn.addEventListener('touchend', () => {
      this.sprintHeld = false;
      this.sprintBtn.classList.remove('active');
    });
  }

  _hit(el, t) {
    const r = el.getBoundingClientRect();
    return t.clientX >= r.left && t.clientX <= r.right
      && t.clientY >= r.top  && t.clientY <= r.bottom;
  }

  _updateJoy(x, y) {
    const dx = x - this.joyStart.x;
    const dy = y - this.joyStart.y;
    const mag = Math.min(this.joyRadius, Math.sqrt(dx * dx + dy * dy));
    const ang = Math.atan2(dy, dx);
    const nx = Math.cos(ang) * mag;
    const ny = Math.sin(ang) * mag;
    this.joyStick.style.transform = `translate(${nx}px, ${ny}px)`;
    this.move.x = nx / this.joyRadius;
    this.move.y = ny / this.joyRadius;
  }

  /* Call once per frame; returns and clears the accumulated look delta */
  consumeLook() {
    const d = { dx: this.look.dx, dy: this.look.dy };
    this.look.dx = 0; this.look.dy = 0;
    return d;
  }

  enable() {
    this.enabled = true;
    this.root.classList.add('active');
  }

  disable() {
    this.enabled = false;
    this.root.classList.remove('active');
  }
}
