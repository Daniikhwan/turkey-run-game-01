// Gobble Dash — tuning, stages and shared constants.
// One file, one job: every number that shapes how the game feels lives here.
export const CANVAS = { width: 960, height: 540 };
export const GROUND_Y = 470;
export const STEP = 1 / 60;

export const TURKEY = {
  x: 180,
  width: 58,
  height: 64,
  slideHeight: 34,
  jumpVelocity: -880,
  doubleJumpVelocity: -790,
  gravity: 2400,
  maxFall: 1200,
};

export const RUN = {
  startSpeed: 280,
  maxSpeed: 480,
  speedGainPerMetre: 0.12,
  metresPerPixel: 1 / 50,
};

export const FARMER = {
  startGap: 150,
  minGap: 8,
  maxGap: 260,
  gainOnHit: 55,
  gainOnLifeLost: 0,
  pushBackPerCorn: 6,
  pushBackPerCleanStretch: 25,
  cleanStretchMetres: 150,
};

export const LIVES_START = 3;
export const ESCAPE_DISTANCE_M = 1300;

// Stages: farmyard (day) -> barn (dusk) -> kitchen (night, indoors).
export const STAGES = [
  {
    name: 'Farmyard',
    fromM: 0,
    sky: ['#8ec9ee', '#d8f0ff'],
    sun: '#ffd94d',
    ground: '#7fae4c',
    groundDark: '#5d8a38',
    hill: '#6da344',
    accent: '#e07840',
    // Spawn gaps are in seconds, not pixels: as the run speeds up, the
    // turkey always gets the same time to land and jump again.
    gapMinSec: 1.05,
    gapMaxSec: 1.6,
    knifeEverySec: 9,
    obstacleMix: ['fence', 'hay', 'pumpkin'],
  },
  {
    name: 'Barn',
    fromM: 500,
    sky: ['#e8935a', '#f7cf8e'],
    sun: '#ff9d45',
    ground: '#a8763e',
    groundDark: '#7d5527',
    hill: '#8a5a2b',
    accent: '#c94f2e',
    gapMinSec: 0.95,
    gapMaxSec: 1.45,
    knifeEverySec: 8,
    obstacleMix: ['fence', 'hay', 'pumpkin'],
  },
  {
    name: 'Kitchen',
    fromM: 1000,
    sky: ['#3a2b4d', '#6b4a7a'],
    sun: '#ffb347',
    ground: '#5a3a28',
    groundDark: '#3e2718',
    hill: '#4a2c3d',
    accent: '#ff5a3c',
    gapMinSec: 0.9,
    gapMaxSec: 1.35,
    knifeEverySec: 6,
    obstacleMix: ['fence', 'oven', 'pumpkin', 'hay'],
  },
];

export const OBSTACLES = {
  fence: { width: 26, height: 72, clear: 'jump' },
  hay: { width: 74, height: 82, clear: 'jump' },
  oven: { width: 118, height: 96, clear: 'jump' },
  pumpkin: { width: 52, height: 52, clear: 'jump' },
  knife: { width: 20, height: 58, clear: 'dodge' },
};

export const PICKUPS = {
  corn: { score: 25, farmerPush: 6 },
  feather: { score: 150, farmerPush: 18 },
  gravy: { score: 100, farmerPush: 10 },
};

export const SCREENS = {
  TITLE: 'title',
  PLAY: 'play',
  PAUSE: 'pause',
  CAUGHT: 'caught',
  ESCAPED: 'escaped',
};
