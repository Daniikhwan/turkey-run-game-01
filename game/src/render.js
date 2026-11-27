// Gobble Dash — everything on the canvas: the run, the HUD and the screens.
// One file, one job: turn a World into pictures.
import { CANVAS, GROUND_Y, SCREENS, ESCAPE_DISTANCE_M, FARMER } from './config.js';
import { drawBackground, drawTurkey, drawFarmer, drawObstacle, drawPickup } from './sprites.js';

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

export function drawWorld(ctx, world) {
  const stage = world.stage;
  ctx.save();
  if (world.shake > 0) {
    const magnitude = world.shake * 14;
    ctx.translate((Math.random() - 0.5) * magnitude, (Math.random() - 0.5) * magnitude);
  }
  drawBackground(ctx, stage, world.distancePx, world.time, CANVAS.width, CANVAS.height, GROUND_Y);

  // Knife telegraphs: a warning shadow on the ground before the drop.
  for (const obstacle of world.obstacles) {
    if (obstacle.kind === 'knife' && obstacle.telegraph > 0) {
      ctx.fillStyle = 'rgba(210,59,46,0.35)';
      ctx.beginPath();
      ctx.ellipse(obstacle.dropX, GROUND_Y - 4, 26, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d23b2e';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', obstacle.dropX, GROUND_Y - 46);
    }
  }
  // Pickups.
  for (const pickup of world.pickups) {
    drawPickup(ctx, pickup.kind, pickup.x, pickup.y, world.time);
  }
  // Obstacles.
  for (const obstacle of world.obstacles) {
    const y = obstacle.kind === 'knife' ? obstacle.y : GROUND_Y;
    drawObstacle(ctx, obstacle.kind, obstacle.x, y, obstacle.width, obstacle.height, world.time);
  }
  // Particles.
  for (const particle of world.particles) {
    ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // The farmer, closing in from the left when the gap is small.
  const gap = world.farmerGap;
  if (gap < 200) {
    const farmerX = world.player.x - gap - 40;
    const reaching = gap < 60;
    drawFarmer(ctx, farmerX, GROUND_Y, 92, world.time * 8, reaching);
    if (reaching) {
      ctx.fillStyle = '#d23b2e';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HE IS RIGHT BEHIND YOU!', CANVAS.width / 2, 108);
    }
  }

  // The turkey.
  const player = world.player;
  drawTurkey(
    ctx,
    player.x,
    player.y,
    58,
    player.sliding ? 34 : 64,
    player.phase,
    player.sliding,
    player.invincibleTimer > 0,
  );

  // Hit flash.
  if (world.flash > 0) {
    ctx.fillStyle = `rgba(210,59,46,${world.flash * 0.7})`;
    ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
  }
  ctx.restore();
}

export function drawHud(ctx, world, best) {
  ctx.save();
  // Top bar.
  ctx.fillStyle = 'rgba(20,16,12,0.55)';
  roundRect(ctx, 12, 10, CANVAS.width - 24, 58, 12);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${Math.floor(world.score)}`, 28, 34);
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(`${Math.floor(world.distanceM)} m  ·  ${world.stage.name}`, 28, 58);
  // Lives as hearts.
  for (let i = 0; i < 3; i += 1) {
    const hx = CANVAS.width - 150 + i * 34;
    const hy = 34;
    ctx.fillStyle = i < world.lives ? '#e84a5f' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(hx - 6, hy - 4, 8, 0, Math.PI * 2);
    ctx.arc(hx + 6, hy - 4, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx - 13, hy - 2);
    ctx.lineTo(hx, hy + 12);
    ctx.lineTo(hx + 13, hy - 2);
    ctx.closePath();
    ctx.fill();
  }
  // Farmer distance bar.
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  roundRect(ctx, CANVAS.width - 330, 46, 150, 10, 5);
  ctx.fill();
  const gapRatio = (world.farmerGap - FARMER.minGap) / (FARMER.maxGap - FARMER.minGap);
  ctx.fillStyle = world.farmerGap < 60 ? '#d23b2e' : '#e8a13c';
  roundRect(ctx, CANVAS.width - 330, 46, 150 * Math.max(0, gapRatio), 10, 5);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('FARMER', CANVAS.width - 340, 54);
  // Best score, below the bar on the left where the sky is empty.
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`BEST ${Math.floor(best)}`, 28, 88);
  // Stage announcement.
  if (world.stageAnnounce > 0) {
    ctx.globalAlpha = Math.min(1, world.stageAnnounce);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`— ${world.stage.name.toUpperCase()} —`, CANVAS.width / 2, 150);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawButton(ctx, x, y, width, height, label) {
  ctx.fillStyle = '#c94f2e';
  roundRect(ctx, x, y, width, height, 12);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, width, height, 12);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + width / 2, y + height / 2 + 8);
  return { x, y, width, height };
}

function drawPanel(ctx, title, lines, buttonLabel) {
  ctx.fillStyle = 'rgba(20,14,10,0.72)';
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
  ctx.fillStyle = 'rgba(255,248,235,0.96)';
  roundRect(ctx, 150, 70, CANVAS.width - 300, 400, 18);
  ctx.fill();
  ctx.fillStyle = '#3a2410';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, CANVAS.width / 2, 140);
  ctx.font = '20px sans-serif';
  let y = 190;
  for (const line of lines) {
    ctx.fillText(line, CANVAS.width / 2, y);
    y += 34;
  }
  if (buttonLabel) return drawButton(ctx, CANVAS.width / 2 - 130, 400, 260, 54, buttonLabel);
  return null;
}

export function drawTitle(ctx, world, best) {
  drawWorld(ctx, world);
  ctx.fillStyle = 'rgba(20,14,10,0.45)';
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GOBBLE DASH', CANVAS.width / 2, 130);
  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = '#ffd94d';
  ctx.fillText('A turkey escapes Thanksgiving dinner', CANVAS.width / 2, 168);
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px sans-serif';
  ctx.fillText('SPACE / CLICK — jump (twice for a double jump)', CANVAS.width / 2, 250);
  ctx.fillText('LEFT / RIGHT — sidestep the falling carving knives', CANVAS.width / 2, 282);
  ctx.fillText('DOWN / RIGHT-CLICK — slide under the knives', CANVAS.width / 2, 314);
  ctx.fillText('Outrun the farmer 1300 m: farmyard → barn → kitchen. Corn feeds your score.', CANVAS.width / 2, 346);
  if (best > 0) {
    ctx.fillStyle = '#ffd94d';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`BEST SCORE: ${Math.floor(best)}`, CANVAS.width / 2, 392);
  }
  return drawButton(ctx, CANVAS.width / 2 - 130, 420, 260, 58, '▶  START RUN');
}

export function drawPause(ctx) {
  return drawPanel(ctx, 'PAUSED', ['Take a breath. The farmer waits for no turkey.', 'SPACE — resume · M — mute · R — restart'], 'RESUME');
}

export function drawCaught(ctx, world, best) {
  return drawPanel(
    ctx,
    'CAUGHT!',
    [
      'The farmer got you at ' + Math.floor(world.distanceM) + ' m.',
      `Score ${Math.floor(world.score)}  ·  Best ${Math.floor(Math.max(best, world.score))}`,
      world.lives <= 0 ? 'Three strikes — dinner is served.' : 'He closed the gap and grabbed you.',
    ],
    '↻  RUN AGAIN',
  );
}

export function drawEscaped(ctx, world, best) {
  return drawPanel(
    ctx,
    'ESCAPED!',
    [
      '1500 m of farmyard, barn and kitchen — and freedom!',
      `Score ${Math.floor(world.score)}  ·  Best ${Math.floor(Math.max(best, world.score))}`,
      'The forest gate is yours. Happy Thanksgiving, turkey.',
    ],
    '↻  RUN AGAIN',
  );
}

export function screenNameForShot(name) {
  if (name === 'play' || name === 'kitchen') return SCREENS.PLAY;
  if (name === 'caught') return SCREENS.CAUGHT;
  if (name === 'escaped') return SCREENS.ESCAPED;
  return SCREENS.TITLE;
}

export { ESCAPE_DISTANCE_M };
