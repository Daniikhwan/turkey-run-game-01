// Gobble Dash — the world: physics, spawning, collisions and the farmer.
// One file, one job: how a run plays, from the first step to caught or escaped.
import {
  CANVAS,
  GROUND_Y,
  STEP,
  TURKEY,
  RUN,
  FARMER,
  LIVES_START,
  ESCAPE_DISTANCE_M,
  STAGES,
  OBSTACLES,
  PICKUPS,
} from './config.js';
import { makeRng, pick, range, chance } from './random.js';

export const EVENT_NONE = 0;
export const EVENT_HIT = 1;
export const EVENT_OVER = 2;
export const EVENT_ESCAPED = 4;
export const EVENT_PICKUP = 8;

function stageFor(distanceM) {
  let stage = STAGES[0];
  for (const candidate of STAGES) {
    if (distanceM >= candidate.fromM) stage = candidate;
  }
  return stage;
}

export class World {
  constructor(seed) {
    this.seed = seed || 1;
    this.reset();
  }

  reset() {
    this.rng = makeRng(this.seed);
    this.time = 0;
    this.distancePx = 0;
    this.distanceM = 0;
    this.speed = RUN.startSpeed;
    this.score = 0;
    this.lives = LIVES_START;
    this.best = 0;
    this.over = false;
    this.escaped = false;
    this.shake = 0;
    this.flash = 0;
    this.cleanSinceHitM = 0;
    this.farmerGap = FARMER.startGap;
    this.farmerAlarm = false;
    this.nextKnifeIn = 4;
    this.nextSpawnAtPx = 700;
    this.obstacles = [];
    this.pickups = [];
    this.particles = [];
    this.player = {
      x: TURKEY.x,
      y: GROUND_Y,
      vy: 0,
      jumps: 0,
      sliding: false,
      slideTimer: 0,
      invincibleTimer: 0,
      phase: 0,
      onGround: true,
    };
    this.stage = STAGES[0];
    this.stageAnnounce = 0;
  }

  playerHeight() {
    return this.player.sliding ? TURKEY.slideHeight : TURKEY.height;
  }

  playerBox() {
    const height = this.playerHeight();
    return {
      x: this.player.x - TURKEY.width / 2 + 8,
      y: this.player.y - height,
      width: TURKEY.width - 16,
      height,
    };
  }

  jump() {
    const player = this.player;
    if (player.onGround) {
      player.vy = TURKEY.jumpVelocity;
      player.jumps = 1;
      player.onGround = false;
      player.sliding = false;
      return 'jump';
    }
    if (player.jumps < 2) {
      player.vy = TURKEY.doubleJumpVelocity;
      player.jumps = 2;
      return 'double';
    }
    return null;
  }

  slide() {
    const player = this.player;
    if (player.onGround && !player.sliding) {
      player.sliding = true;
      player.slideTimer = 0.45;
      return true;
    }
    return false;
  }

  spawnObstacle() {
    const stage = this.stage;
    const kind = pick(this.rng, stage.obstacleMix);
    const def = OBSTACLES[kind];
    const obstacle = {
      kind,
      x: CANVAS.width + 80,
      y: GROUND_Y,
      width: def.width,
      height: def.height,
      passed: false,
    };
    if (kind === 'knife') {
      // A knife waits above, telegraphs, then drops on the turkey's lane.
      obstacle.y = -80;
      obstacle.falling = false;
      obstacle.telegraph = 0.55;
      obstacle.dropX = this.player.x + range(this.rng, -30, 60);
      obstacle.x = obstacle.dropX;
    }
    this.obstacles.push(obstacle);
    // Sometimes a pickup rides just past the obstacle.
    if (chance(this.rng, 0.45)) {
      const pickupKind = chance(this.rng, 0.12) ? 'feather' : 'corn';
      this.pickups.push({
        kind: pickupKind,
        x: obstacle.x + obstacle.width + range(this.rng, 90, 170),
        y: GROUND_Y - (kind === 'fence' || kind === 'hay' ? 150 : 60),
        taken: false,
      });
    }
    if (chance(this.rng, 0.08)) {
      this.pickups.push({ kind: 'gravy', x: obstacle.x + 320, y: GROUND_Y - 60, taken: false });
    }
  }

  spawnPickupLine() {
    const count = 3 + Math.floor(this.rng() * 3);
    const y = chance(this.rng, 0.5) ? GROUND_Y - 60 : GROUND_Y - 150;
    for (let i = 0; i < count; i += 1) {
      this.pickups.push({ kind: 'corn', x: CANVAS.width + 80 + i * 44, y, taken: false });
    }
  }

  burst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      this.particles.push({
        x,
        y,
        vx: range(this.rng, -160, 60),
        vy: range(this.rng, -260, -40),
        life: range(this.rng, 0.4, 0.9),
        maxLife: 0.9,
        color,
        size: range(this.rng, 3, 7),
      });
    }
  }

  hurtPlayer() {
    this.lives -= 1;
    this.player.invincibleTimer = 1.4;
    this.farmerGap = Math.max(FARMER.minGap, this.farmerGap - FARMER.gainOnHit);
    this.shake = 0.45;
    this.flash = 0.35;
    const box = this.playerBox();
    this.burst(box.x + box.width / 2, box.y + 10, '#e8c95a', 16);
    this.cleanSinceHitM = 0;
    if (this.lives <= 0) {
      this.over = true;
      return EVENT_OVER;
    }
    return EVENT_HIT;
  }

  step(dt, move, auto) {
    if (this.over || this.escaped) return EVENT_NONE;
    let events = EVENT_NONE;
    this.time += dt;
    const stage = stageFor(this.distanceM);
    if (stage !== this.stage) {
      this.stage = stage;
      this.stageAnnounce = 2.2;
    }
    if (this.stageAnnounce > 0) this.stageAnnounce -= dt;
    if (this.shake > 0) this.shake -= dt;
    if (this.flash > 0) this.flash -= dt;

    // Speed and distance.
    this.speed = Math.min(RUN.maxSpeed, RUN.startSpeed + this.distanceM * RUN.speedGainPerMetre);
    const scroll = this.speed * dt;
    this.distancePx += scroll;
    this.distanceM = this.distancePx * RUN.metresPerPixel;
    this.score += scroll * 0.045;
    this.cleanSinceHitM += scroll * RUN.metresPerPixel;
    if (this.cleanSinceHitM >= FARMER.cleanStretchMetres) {
      this.cleanSinceHitM = 0;
      this.farmerGap = Math.min(FARMER.maxGap, this.farmerGap + FARMER.pushBackPerCleanStretch);
    }
    if (this.distanceM >= ESCAPE_DISTANCE_M) {
      this.escaped = true;
      this.score += 500;
      return EVENT_ESCAPED;
    }

    // Player physics: sideways movement, then gravity.
    const player = this.player;
    if (move !== 0) {
      player.x = Math.max(90, Math.min(430, player.x + move * 190 * dt));
    }
    if (move !== 0 && player.onGround) player.phase += dt * this.speed * 0.045;
    else if (player.onGround) player.phase += dt * this.speed * 0.045;
    if (player.slideTimer > 0) {
      player.slideTimer -= dt;
      if (player.slideTimer <= 0) player.sliding = false;
    }
    if (player.invincibleTimer > 0) player.invincibleTimer -= dt;
    player.vy = Math.min(TURKEY.maxFall, player.vy + TURKEY.gravity * dt);
    player.y += player.vy * dt;
    if (player.y >= GROUND_Y) {
      player.y = GROUND_Y;
      player.vy = 0;
      player.jumps = 0;
      player.onGround = true;
    } else {
      player.onGround = false;
    }

    // Spawning.
    if (this.distancePx >= this.nextSpawnAtPx) {
      this.spawnObstacle();
      this.nextSpawnAtPx =
        this.distancePx + this.speed * range(this.rng, this.stage.gapMinSec, this.stage.gapMaxSec);
      if (chance(this.rng, 0.3)) this.spawnPickupLine();
    }
    this.nextKnifeIn -= dt;
    if (this.nextKnifeIn <= 0) {
      this.nextKnifeIn = this.stage.knifeEverySec * range(this.rng, 0.8, 1.25);
      this.obstacles.push({
        kind: 'knife',
        x: this.player.x + range(this.rng, -20, 80),
        y: -80,
        width: OBSTACLES.knife.width,
        height: OBSTACLES.knife.height,
        falling: false,
        telegraph: 0.55,
        dropX: this.player.x + range(this.rng, -20, 80),
        passed: false,
      });
    }

    // Obstacles move and resolve.
    const box = this.playerBox();
    for (const obstacle of this.obstacles) {
      if (obstacle.kind === 'knife') {
        if (obstacle.telegraph > 0) {
          obstacle.telegraph -= dt;
          obstacle.x = obstacle.dropX;
          if (obstacle.telegraph <= 0) obstacle.falling = true;
        } else {
          obstacle.y += 1500 * dt;
        }
      } else {
        obstacle.x -= scroll;
      }
      if (obstacle.kind === 'knife' && obstacle.y > GROUND_Y + 40) obstacle.passed = true;
      if (obstacle.x + obstacle.width < -120 || obstacle.y > GROUND_Y + 120) obstacle.passed = true;
      if (obstacle.passed || player.invincibleTimer > 0) continue;
      // A knife still telegraphing above the field cannot hit yet.
      if (obstacle.kind === 'knife' && obstacle.telegraph > 0) continue;
      const overlapX = obstacle.x < box.x + box.width && obstacle.x + obstacle.width > box.x;
      // A falling knife is hit by its real box; a ground obstacle by its top.
      const obstacleTop = obstacle.kind === 'knife' ? obstacle.y : GROUND_Y - obstacle.height;
      const obstacleBottom = obstacle.kind === 'knife' ? obstacle.y + obstacle.height : GROUND_Y;
      const overlapY = obstacleTop < box.y + box.height && obstacleBottom > box.y;
      if (overlapX && overlapY) {
        const result = this.hurtPlayer();
        events |= result;
        if (result & EVENT_OVER) return events;
      }
    }
    this.obstacles = this.obstacles.filter((o) => !o.passed);

    // Pickups.
    for (const pickup of this.pickups) {
      pickup.x -= scroll;
      if (pickup.taken || pickup.x < -60) continue;
      const dx = pickup.x - (box.x + box.width / 2);
      const dy = pickup.y - (box.y + box.height / 2);
      if (Math.abs(dx) < 42 && Math.abs(dy) < 48) {
        pickup.taken = true;
        const def = PICKUPS[pickup.kind];
        this.score += def.score;
        this.farmerGap = Math.min(FARMER.maxGap, this.farmerGap + def.farmerPush);
        if (pickup.kind === 'gravy' && this.lives < LIVES_START) this.lives += 1;
        this.burst(pickup.x, pickup.y, '#e8c95a', 8);
        events |= EVENT_PICKUP;
      }
    }
    this.pickups = this.pickups.filter((p) => !p.taken && p.x > -60);

    // Particles.
    for (const particle of this.particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 500 * dt;
      particle.life -= dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);

    // Farmer pressure: close means danger, and the alarm sounds once.
    const wasAlarmed = this.farmerAlarm;
    this.farmerAlarm = this.farmerGap < 60;
    if (this.farmerAlarm && !wasAlarmed && auto !== true) {
      // The main loop plays the alarm sound; the world only flags it.
    }
    if (this.farmerGap <= FARMER.minGap + 2) {
      this.over = true;
      return events | EVENT_OVER;
    }
    return events;
  }
}
