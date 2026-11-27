// Gobble Dash — the game loop and the screens' state machine.
// One file, one job: wire input, world, sound and rendering together.
import { CANVAS, STEP, SCREENS } from './config.js';
import { World, EVENT_HIT, EVENT_OVER, EVENT_ESCAPED, EVENT_PICKUP } from './world.js';
import { Input } from './input.js';
import { SoundBank } from './audio.js';
import { drawWorld, drawHud, drawTitle, drawPause, drawCaught, drawEscaped } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') || '1') || 1;

const input = new Input(canvas);
const sounds = new SoundBank();
const world = new World(seed);
let screen = SCREENS.TITLE;
let best = 0;
try {
  best = Number(window.localStorage.getItem('gobble-dash-best') || '0') || 0;
} catch {
  best = 0;
}
let button = null;
let accumulator = 0;
let lastTime = 0;
let farmerAlarmOn = false;

function saveBest() {
  if (world.score > best) {
    best = Math.floor(world.score);
    try {
      window.localStorage.setItem('gobble-dash-best', String(best));
    } catch {
      // Private mode: the best score simply does not persist.
    }
  }
}

function startRun() {
  world.reset();
  world.best = best;
  screen = SCREENS.PLAY;
  sounds.unlock();
  sounds.startMusic();
}

function endRun(escaped) {
  saveBest();
  screen = escaped ? SCREENS.ESCAPED : SCREENS.CAUGHT;
  sounds.stopMusic();
  if (escaped) sounds.escaped();
  else sounds.caught();
}

function buttonHit(click) {
  return (
    button &&
    click.x >= button.x &&
    click.x <= button.x + button.width &&
    click.y >= button.y &&
    click.y <= button.y + button.height
  );
}

function handleClicks() {
  for (const click of input.consumeClicks()) {
    if (buttonHit(click)) {
      sounds.click();
      if (screen === SCREENS.TITLE || screen === SCREENS.CAUGHT || screen === SCREENS.ESCAPED) startRun();
      else if (screen === SCREENS.PAUSE) screen = SCREENS.PLAY;
      return;
    }
  }
}

function update(dt) {
  const key = input.consumeKey();
  if (key === 'KeyM') {
    sounds.toggleMute();
  } else if (key === 'KeyP' || key === 'Escape') {
    if (screen === SCREENS.PLAY) {
      screen = SCREENS.PAUSE;
      sounds.stopMusic();
    } else if (screen === SCREENS.PAUSE) {
      screen = SCREENS.PLAY;
      sounds.startMusic();
    }
  } else if (key === 'KeyR' && (screen === SCREENS.CAUGHT || screen === SCREENS.ESCAPED || screen === SCREENS.PAUSE)) {
    startRun();
  } else if (key === 'Enter' && screen === SCREENS.TITLE) {
    startRun();
  }
  handleClicks();

  if (screen === SCREENS.TITLE) {
    // The title idles over a living farmyard: the turkey runs in place.
    world.step(dt, 0, true);
    if (input.consumeJump()) startRun();
    return;
  }
  if (screen !== SCREENS.PLAY) return;

  if (input.consumeJump()) {
    const result = world.jump();
    if (result === 'jump') sounds.jump();
    else if (result === 'double') sounds.doubleJump();
  }
  if (input.consumeSlide()) {
    if (world.slide()) sounds.slide();
  }
  const move = (input.rightHeld ? 1 : 0) - (input.leftHeld ? 1 : 0);
  const events = world.step(dt, move, false);
  if (events & EVENT_PICKUP) sounds.corn();
  if (events & EVENT_HIT) sounds.hurt();
  if (world.farmerAlarm && !farmerAlarmOn) sounds.alarm();
  farmerAlarmOn = world.farmerAlarm;
  if (events & EVENT_OVER) endRun(false);
  else if (events & EVENT_ESCAPED) endRun(true);
}

function render() {
  ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);
  button = null;
  if (screen === SCREENS.TITLE) {
    button = drawTitle(ctx, world, best);
  } else if (screen === SCREENS.PLAY) {
    drawWorld(ctx, world);
    drawHud(ctx, world, best);
  } else if (screen === SCREENS.PAUSE) {
    drawWorld(ctx, world);
    drawHud(ctx, world, best);
    button = drawPause(ctx);
  } else if (screen === SCREENS.CAUGHT) {
    drawWorld(ctx, world);
    button = drawCaught(ctx, world, best);
  } else if (screen === SCREENS.ESCAPED) {
    drawWorld(ctx, world);
    button = drawEscaped(ctx, world, best);
  }
}

function frame(time) {
  const delta = Math.min(0.1, (time - lastTime) / 1000 || 0);
  lastTime = time;
  accumulator += delta;
  while (accumulator >= STEP) {
    update(STEP);
    accumulator -= STEP;
  }
  render();
  window.requestAnimationFrame(frame);
}

if (shotName) {
  // Screenshot mode: stage one fixed scene, draw it once, and stop.
  document.title = `Gobble Dash — shot ${shotName}`;
  screen = stageShot(shotName, world);
  world.best = best;
  saveBest();
  render();
} else {
  window.requestAnimationFrame(frame);
}
