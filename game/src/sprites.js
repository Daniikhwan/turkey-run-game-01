// Gobble Dash — every picture is drawn from code, no image files.
// One file, one job: the turkey, the farmer, the obstacles and the scenery.
export function drawTurkey(ctx, x, y, width, height, phase, sliding, invincible) {
  ctx.save();
  ctx.translate(x, y);
  if (invincible && Math.floor(performance.now() / 90) % 2 === 0) ctx.globalAlpha = 0.45;
  const squash = sliding ? 0.55 : 1 + Math.sin(phase * 2) * 0.04;
  ctx.scale(1, squash);
  const bodyY = -height * 0.55;
  // Tail fan: five autumn feathers.
  const tailColors = ['#c94f2e', '#e07840', '#e8a13c', '#8a5a2b', '#d8b25a'];
  for (let i = 0; i < 5; i += 1) {
    const angle = -Math.PI / 2 + (i - 2) * 0.42;
    ctx.save();
    ctx.translate(-width * 0.42, bodyY - 4);
    ctx.rotate(angle);
    ctx.fillStyle = tailColors[i];
    ctx.beginPath();
    ctx.ellipse(0, -height * 0.42, width * 0.11, height * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, -height * 0.72, width * 0.05, height * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Body.
  ctx.fillStyle = '#7a4a21';
  ctx.beginPath();
  ctx.ellipse(0, bodyY, width * 0.5, height * 0.48, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#93582a';
  ctx.beginPath();
  ctx.ellipse(width * 0.1, bodyY + 4, width * 0.38, height * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wing.
  ctx.fillStyle = '#5d3617';
  ctx.beginPath();
  ctx.ellipse(-width * 0.08, bodyY + 2, width * 0.26, height * 0.26, -0.5, 0, Math.PI * 2);
  ctx.fill();
  // Head, beak, wattle, eye.
  const headX = width * 0.42;
  const headY = bodyY - height * 0.42;
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.arc(headX, headY, width * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8a13c';
  ctx.beginPath();
  ctx.moveTo(headX + width * 0.14, headY - 2);
  ctx.lineTo(headX + width * 0.36, headY + 4);
  ctx.lineTo(headX + width * 0.14, headY + 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d23b2e';
  ctx.beginPath();
  ctx.ellipse(headX + width * 0.1, headY + 12, 4, 7, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath();
  ctx.arc(headX + width * 0.06, headY - 4, 3, 0, Math.PI * 2);
  ctx.fill();
  // Legs, mid-stride.
  const legSwing = Math.sin(phase) * 10;
  ctx.strokeStyle = '#e8a13c';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, -6);
  ctx.lineTo(-6 + legSwing, 0);
  ctx.moveTo(6, -6);
  ctx.lineTo(6 - legSwing, 0);
  ctx.stroke();
  ctx.restore();
}

export function drawFarmer(ctx, x, y, height, phase, reaching) {
  ctx.save();
  ctx.translate(x, y);
  const bob = Math.sin(phase) * 3;
  // Legs.
  ctx.strokeStyle = '#2e4a7a';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-8, -height * 0.42 + bob);
  ctx.lineTo(-14, 0);
  ctx.moveTo(8, -height * 0.42 - bob);
  ctx.lineTo(16, 0);
  ctx.stroke();
  // Body: plaid shirt + overalls.
  ctx.fillStyle = '#c94f2e';
  ctx.fillRect(-20, -height * 0.82 + bob, 40, height * 0.42);
  ctx.strokeStyle = '#8a2f1a';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-20, -height * 0.72 + i * 9 + bob);
    ctx.lineTo(20, -height * 0.72 + i * 9 + bob);
    ctx.stroke();
  }
  ctx.fillStyle = '#2e4a7a';
  ctx.fillRect(-16, -height * 0.62 + bob, 32, height * 0.22);
  // Arms reaching forward.
  ctx.strokeStyle = '#c94f2e';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(14, -height * 0.72 + bob);
  ctx.lineTo(reaching ? 46 : 34, -height * 0.62 + bob - 4);
  ctx.moveTo(14, -height * 0.66 + bob);
  ctx.lineTo(reaching ? 48 : 32, -height * 0.5 + bob - 4);
  ctx.stroke();
  // Head + straw hat.
  ctx.fillStyle = '#e8b98a';
  ctx.beginPath();
  ctx.arc(4, -height * 0.9 + bob, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8c95a';
  ctx.beginPath();
  ctx.ellipse(4, -height * 0.9 - 10 + bob, 24, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-8, -height * 0.9 - 24 + bob, 24, 14);
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath();
  ctx.arc(12, -height * 0.9 - 2 + bob, 2, 0, Math.PI * 2);
  ctx.fill();
  // Angry moustache.
  ctx.strokeStyle = '#5a3a1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(4, -height * 0.9 + 6 + bob);
  ctx.lineTo(20, -height * 0.9 + 8 + bob);
  ctx.stroke();
  ctx.restore();
}

export function drawObstacle(ctx, kind, x, y, width, height, time) {
  ctx.save();
  ctx.translate(x, y);
  if (kind === 'fence') {
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(0, -height, 6, height);
    ctx.fillRect(width - 6, -height, 6, height);
    ctx.fillStyle = '#a8763e';
    ctx.fillRect(-4, -height + 10, width + 8, 8);
    ctx.fillRect(-4, -height + 38, width + 8, 8);
  } else if (kind === 'hay') {
    ctx.fillStyle = '#d8a13c';
    ctx.beginPath();
    ctx.arc(width / 2, -height / 2, width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a8763e';
    ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.arc(width / 2, -height / 2, (width / 2) * (0.4 + Math.abs(i) * 0.2), 0.6 + i * 0.2, 2.4 + i * 0.2);
      ctx.stroke();
    }
  } else if (kind === 'oven') {
    ctx.fillStyle = '#3a3a44';
    ctx.fillRect(0, -height, width, height);
    ctx.fillStyle = '#565664';
    ctx.fillRect(6, -height + 8, width - 12, height * 0.45);
    ctx.fillStyle = '#ff7a2e';
    const flicker = 0.7 + Math.sin(time * 9) * 0.3;
    ctx.globalAlpha = flicker;
    ctx.beginPath();
    ctx.ellipse(width / 2, -height * 0.3, width * 0.28, height * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#22222a';
    ctx.fillRect(10, -14, width - 20, 8);
    ctx.fillStyle = '#ff5a3c';
    ctx.beginPath();
    ctx.arc(width - 18, -height + 18, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'pumpkin') {
    ctx.fillStyle = '#e07840';
    ctx.beginPath();
    ctx.ellipse(width / 2, -height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b85a28';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width / 2, -height);
    ctx.lineTo(width / 2, 0);
    ctx.moveTo(width * 0.3, -height * 0.9);
    ctx.quadraticCurveTo(width * 0.28, -height / 2, width * 0.3, -height * 0.1);
    ctx.moveTo(width * 0.7, -height * 0.9);
    ctx.quadraticCurveTo(width * 0.72, -height / 2, width * 0.7, -height * 0.1);
    ctx.stroke();
    ctx.fillStyle = '#5d8a38';
    ctx.fillRect(width / 2 - 3, -height - 8, 6, 10);
  } else if (kind === 'knife') {
    ctx.save();
    ctx.translate(width / 2, -height / 2);
    ctx.rotate(0.5);
    ctx.fillStyle = '#c8ccd4';
    ctx.beginPath();
    ctx.moveTo(0, -height * 0.55);
    ctx.lineTo(width * 0.45, height * 0.1);
    ctx.lineTo(0, height * 0.3);
    ctx.lineTo(-width * 0.45, height * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(-width * 0.28, height * 0.28, width * 0.56, height * 0.24);
    ctx.restore();
  }
  ctx.restore();
}

export function drawPickup(ctx, kind, x, y, time) {
  const bob = Math.sin(time * 4 + x * 0.01) * 4;
  ctx.save();
  ctx.translate(x, y + bob);
  if (kind === 'corn') {
    ctx.fillStyle = '#e8c95a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 18, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7e08a';
    for (let row = -1; row <= 1; row += 1) {
      for (let col = -1; col <= 1; col += 1) {
        ctx.beginPath();
        ctx.arc(col * 5, row * 9, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = '#5d8a38';
    ctx.beginPath();
    ctx.ellipse(0, 18, 8, 5, 0.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'feather') {
    ctx.fillStyle = '#e8a13c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 20, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c94f2e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(0, 22);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(-3, -8, 3, 9, 0.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'gravy') {
    ctx.fillStyle = '#d8d8e0';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath();
    ctx.ellipse(0, -2, 12, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawBackground(ctx, stage, scrollX, time, width, height, groundY) {
  const grad = ctx.createLinearGradient(0, 0, 0, groundY);
  grad.addColorStop(0, stage.sky[0]);
  grad.addColorStop(1, stage.sky[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, groundY);
  // Sun / moon.
  ctx.fillStyle = stage.sun;
  ctx.beginPath();
  ctx.arc(width - 130, 84, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  for (let i = 0; i < 4; i += 1) {
    const cx = ((i * 280 - scrollX * 0.15) % (width + 320) + width + 320) % (width + 320) - 160;
    const cy = 60 + i * 26;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 52, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 30, cy + 6, 36, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Far hills.
  ctx.fillStyle = stage.hill;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = 0; x <= width; x += 40) {
    const wave = Math.sin((x + scrollX * 0.3) * 0.008) * 26;
    ctx.lineTo(x, groundY - 70 - wave);
  }
  ctx.lineTo(width, groundY);
  ctx.closePath();
  ctx.fill();
  // Farmhouse and barn silhouettes drifting by.
  ctx.fillStyle = stage.groundDark;
  const houseX = width - ((scrollX * 0.5) % (width + 600)) + 80;
  ctx.fillRect(houseX, groundY - 96, 120, 96);
  ctx.beginPath();
  ctx.moveTo(houseX - 10, groundY - 96);
  ctx.lineTo(houseX + 60, groundY - 140);
  ctx.lineTo(houseX + 130, groundY - 96);
  ctx.closePath();
  ctx.fill();
  // Ground.
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, groundY, width, height - groundY);
  ctx.fillStyle = stage.groundDark;
  ctx.fillRect(0, groundY, width, 6);
  // Grass tufts scrolling past.
  ctx.strokeStyle = stage.groundDark;
  ctx.lineWidth = 2;
  for (let i = 0; i < 24; i += 1) {
    const gx = ((i * 173 - scrollX) % (width + 80) + width + 80) % (width + 80) - 40;
    ctx.beginPath();
    ctx.moveTo(gx, groundY + 26);
    ctx.lineTo(gx - 4, groundY + 14);
    ctx.moveTo(gx + 4, groundY + 26);
    ctx.lineTo(gx + 8, groundY + 15);
    ctx.stroke();
  }
}
