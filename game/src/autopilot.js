// Gobble Dash — the autopilot that plays the game for screenshots.
// One file, one job: decide jump / slide / sidestep from the world ahead.
import { GROUND_Y, TURKEY, OBSTACLES } from './config.js';

/** The nearest ground obstacle in front of the turkey, if any. */
function nearestGroundThreat(world) {
  const box = world.playerBox();
  let best = null;
  for (const obstacle of world.obstacles) {
    if (obstacle.passed || obstacle.kind === 'knife') continue;
    if (obstacle.x + obstacle.width < box.x - 10) continue;
    if (!best || obstacle.x < best.x) best = obstacle;
  }
  return best;
}

/** A knife whose blade would land on the turkey's box, if any. */
function knifeOnLane(world) {
  const box = world.playerBox();
  const knifeWidth = OBSTACLES.knife.width;
  const margin = 12;
  for (const obstacle of world.obstacles) {
    if (obstacle.kind !== 'knife' || obstacle.passed) continue;
    // The knife's real box is dropX .. dropX + width; keep a margin clear.
    if (obstacle.dropX + knifeWidth + margin < box.x) continue;
    if (obstacle.dropX - margin > box.x + box.width) continue;
    return obstacle;
  }
  return null;
}

/**
 * A good pilot: sidesteps a knife that drops on its lane, jumps early for
 * fences, hay, ovens and pumpkins, and double-jumps when it lands short.
 * Sidestep and jump combine: a knife and a fence at once get both.
 */
export function goodPilot(world) {
  const player = world.player;
  const box = world.playerBox();
  let move = 0;
  const knife = knifeOnLane(world);
  if (knife) {
    // Step aside from the blade: never jump up into a falling knife.
    // Pick the side with no ground obstacle in the way.
    const centre = box.x + box.width / 2;
    const preferred = knife.dropX + OBSTACLES.knife.width / 2 > centre ? -1 : 1;
    move = preferred;
    if (groundObstacleInDirection(world, box, preferred)) {
      if (!groundObstacleInDirection(world, box, -preferred)) move = -preferred;
      else move = 0;
    }
  }
  // The jump looks at ground obstacles alone: a falling knife must never
  // mask the fence behind it.
  const threat = nearestGroundThreat(world);
  let jump = false;
  // While a knife drops on the turkey's lane, never jump up into it: the
  // ground jump waits until the blade has passed.
  const knifeFalling = knife && (knife.falling || knife.telegraph < 0.3);
  if (threat && !knifeFalling) {
    const distance = threat.x - (player.x + TURKEY.width / 2);
    const timeToReach = distance / world.speed;
    // Ground obstacles: jump late enough to still be airborne past the
    // obstacle's rear edge — jumping too early lands the turkey on it.
    if (player.onGround && timeToReach < 0.4 && timeToReach > 0.02) {
      jump = true;
    }
    // Airborne, descending and about to land on it: a double jump saves it.
    if (!player.onGround && player.jumps < 2 && player.vy > 0 && timeToReach < 0.18 && player.y > GROUND_Y - 130) {
      jump = true;
    }
    // Last-second save: low in the air, rising or falling, and the obstacle
    // is almost here — spend the double jump now or land on it.
    if (!player.onGround && player.jumps < 2 && timeToReach < 0.12 && player.y > GROUND_Y - 100) {
      jump = true;
    }
  }
  // No knife to dodge: drift back to the home lane, where ground obstacles
  // give the most warning. (A knife dodge never leaves the turkey stranded.)
  if (!knife && move === 0) {
    if (player.x > 200) move = -1;
    else if (player.x < 160) move = 1;
  }
  return { jump, slide: false, move };
}

/** True when a ground obstacle sits within `reach` px of the box in `direction`. */
function groundObstacleInDirection(world, box, direction) {
  const reach = 110;
  const edge = direction < 0 ? box.x - reach : box.x + box.width;
  const far = direction < 0 ? box.x : box.x + box.width + reach;
  for (const obstacle of world.obstacles) {
    if (obstacle.passed || obstacle.kind === 'knife') continue;
    if (obstacle.x + obstacle.width > edge && obstacle.x < far) return true;
  }
  return false;
}

/** A hurried pilot: reacts far too late, never sidesteps, never double-jumps. */
export function badPilot(world) {
  const player = world.player;
  const threat = nearestGroundThreat(world);
  if (!threat || threat.kind === 'knife') return { jump: false, slide: false, move: 0 };
  const distance = threat.x - (player.x + TURKEY.width / 2);
  if (player.onGround && distance < 14) return { jump: true, slide: false, move: 0 };
  return { jump: false, slide: false, move: 0 };
}
