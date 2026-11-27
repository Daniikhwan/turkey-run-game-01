// Gobble Dash — keyboard, mouse and touch input in one place.
// One file, one job: turn presses and clicks into game intents.
export class Input {
  constructor(canvas) {
    this.jumpQueued = false;
    this.slideQueued = false;
    this.leftHeld = false;
    this.rightHeld = false;
    this.clicks = [];
    this.anyKey = null;
    this.canvas = canvas;
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onPointer = this.onPointer.bind(this);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    canvas.addEventListener('pointerdown', this.onPointer);
  }

  onKeyDown(event) {
    if (event.repeat) return;
    this.anyKey = event.code;
    if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
      this.jumpQueued = true;
      event.preventDefault();
    } else if (event.code === 'ArrowDown' || event.code === 'KeyS') {
      this.slideQueued = true;
      event.preventDefault();
    } else if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
      this.leftHeld = true;
    } else if (event.code === 'ArrowRight' || event.code === 'KeyD') {
      this.rightHeld = true;
    }
  }

  onKeyUp(event) {
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') this.leftHeld = false;
    if (event.code === 'ArrowRight' || event.code === 'KeyD') this.rightHeld = false;
  }

  onPointer(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * this.canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * this.canvas.height;
    this.clicks.push({ x, y, button: event.button });
    // A tap on the play field jumps; buttons handle their own clicks first.
    if (event.button === 0) this.jumpQueued = true;
    if (event.button === 2) this.slideQueued = true;
  }

  consumeJump() {
    const queued = this.jumpQueued;
    this.jumpQueued = false;
    return queued;
  }

  consumeSlide() {
    const queued = this.slideQueued;
    this.slideQueued = false;
    return queued;
  }

  consumeKey() {
    const key = this.anyKey;
    this.anyKey = null;
    return key;
  }

  consumeClicks() {
    const clicks = this.clicks;
    this.clicks = [];
    return clicks;
  }
}
