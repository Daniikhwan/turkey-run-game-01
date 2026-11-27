// Gobble Dash — the screenshot scenes behind ?shot=.
// One file, one job: play the real rules forward from a fresh world for a
// fixed time, steered by an autopilot, so each frame is what a short game
// really looks like and the same seed always gives the same frame.
import { STEP, SCREENS, ESCAPE_DISTANCE_M } from './config.js';
import { goodPilot, badPilot } from './autopilot.js';
import { EVENT_OVER, EVENT_ESCAPED } from './world.js';

const START_SECONDS = 4;
const PLAY_SECONDS = 24;
const KITCHEN_SECONDS = 150;
const CAUGHT_SECONDS = 90;
const END_LIMIT_SECONDS = 600;

/**
 * Set `world` to the named scene and return the screen to draw over it.
 * Scenes: start (title), play (mid-run), kitchen (late stage), caught
 * (a hurried run that ends badly), escaped (a full 1500 m run).
 */
export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'kitchen' && name !== 'caught' && name !== 'escaped') {
    for (let i = 0; i < START_SECONDS / STEP; i += 1) world.step(STEP, 1, true);
    return SCREENS.TITLE;
  }
  const seconds =
    name === 'kitchen' ? KITCHEN_SECONDS : name === 'caught' ? CAUGHT_SECONDS : name === 'escaped' ? END_LIMIT_SECONDS : PLAY_SECONDS;
  const pilot = name === 'caught' ? badPilot : goodPilot;
  for (let i = 0; i < seconds / STEP; i += 1) {
    const decision = pilot(world);
    if (decision.jump) world.jump();
    if (decision.slide) world.slide();
    const events = world.step(STEP, decision.move || 0, true);
    if (events & EVENT_OVER) return SCREENS.CAUGHT;
    if (events & EVENT_ESCAPED) return SCREENS.ESCAPED;
    if (world.distanceM >= ESCAPE_DISTANCE_M) return SCREENS.ESCAPED;
  }
  return SCREENS.PLAY;
}
