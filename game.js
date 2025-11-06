// Minimal scaffolding: title screen, grid, scanline, ship movement

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: { create, update }
};

const game = new Phaser.Game(config);

let gfx;
let cursors;
let wasd;
let gameState = 'title'; // 'title' or 'level'
let shipPos = { x: 400, y: 300 };
let shipVel = { x: 0, y: 0 };
const GAME_NAME = 'vibebeater';

// Ship movement parameters (adjustable)
const SHIP_BASE_SPEED = 5;        // Starting maximum velocity
const SHIP_MAX_SPEED_CAP = 15;    // Maximum speed cap (progressive ramp stops here)
const SHIP_SPEED_RAMP_RATE = 0.55; // Speed increase per second
const SHIP_ACCELERATION = 0.45;    // How fast ship speeds up (0-1, higher = faster)
const SHIP_FRICTION = 0.45;        // How fast ship slows down (0-1, lower = more friction)

// BPM timing
const BPM = 130;
const SEC_PER_BEAT = 60 / BPM;
let beatStartTime = 0;

// Grid settings
const GRID_COLS = 8;
const GRID_ROWS = 8;
const GRID_LINE_WIDTH = 1;
const SCANLINE_WIDTH = GRID_LINE_WIDTH * 2.5;

// Ray attack system (25% slower = multiply times by 1.25, firing rate 50% slower = 2x intervals)
const RAY_MIN_BEATS = (1/3) * 1.25;        // Minimum beats for ray growth (1/3 of set amount, 25% slower)
const RAY_MAX_BEATS = 4 * 1.25;            // Maximum beats for ray growth (25% slower)
const RAY_MIN_DURATION_BEATS = 2 * 1.25;   // Minimum duration of ray attack (25% slower)
const RAY_MAX_DURATION_BEATS = 8 * 1.25;   // Maximum duration of ray attack (25% slower)
const RAY_MIN_SPAWN_INTERVAL = 1 * 1.25 * 2;   // Minimum seconds between ray spawns (25% slower, then 50% slower = 2x)
const RAY_MAX_SPAWN_INTERVAL = 3 * 1.25 * 2;   // Maximum seconds between ray spawns (25% slower, then 50% slower = 2x)
const RAY_COOLDOWN_TIME = 5;               // Cooldown in seconds after hitting target
const RAY_TARGET_OFFSET = 0.35;            // Target offset (35% of way to ship, not direct)
const RAY_POST_HIT_DURATION_MIN = 3;       // Minimum seconds to keep firing after hit
const RAY_POST_HIT_DURATION_MAX = 5;       // Maximum seconds to keep firing after hit
const RAY_MIN_SPAWN_DISTANCE = 150;        // Minimum distance from player for ray origin (pixels)
const SHIP_COLLISION_RATE = 0.0025;        // Collision area multiplier (0.25% = 0.0025)

let activeRays = [];
let lastRaySpawnTime = 0;
let nextRaySpawnTime = 0;
let rayCooldownEnd = 0;

// Vector font: monospaced characters [x1, y1, x2, y2] in normalized 0-1 coordinates
const VECTOR_FONT = {
  'a': [[0,1,0,0],[0,0,0.5,0.25],[0.5,0.25,1,0],[1,0,1,1],[0,0.5,1,0.5]],
  'b': [[0,0,0,1],[0,0,0.6,0],[0,0.5,0.6,0.5],[0,1,0.6,1],[0.6,0,0.6,0.5],[0.6,0.5,0.6,1]],
  'e': [[0,0,0.8,0],[0,0,0,1],[0,0.5,0.7,0.5],[0,1,0.8,1]],
  'i': [[0.5,0,0.5,0.75],[0.3,0.9,0.7,0.9]],
  'r': [[0,0,0,1],[0,0,0.6,0],[0,0.5,0.6,0.5],[0.6,0,0.6,0.5],[0.6,0.5,1,1]],
  't': [[0.5,0,0.5,1],[0,0,1,0]],
  'v': [[0,0,0.5,1],[0.5,1,1,0]]
};

function create() {
  const scene = this;
  gfx = scene.add.graphics();

  // Input
  cursors = scene.input.keyboard.createCursorKeys();
  wasd = scene.input.keyboard.addKeys('W,S,A,D');
  
  // Start on title screen
  scene.input.keyboard.on('keydown', () => {
    if (gameState === 'title') {
      gameState = 'level';
      beatStartTime = scene.sound.context.currentTime;
      shipPos = { x: 400, y: 300 }; // Center ship
      shipVel = { x: 0, y: 0 }; // Reset velocity
      activeRays = []; // Reset rays
      lastRaySpawnTime = scene.sound.context.currentTime;
      nextRaySpawnTime = lastRaySpawnTime + (RAY_MIN_SPAWN_INTERVAL + Math.random() * (RAY_MAX_SPAWN_INTERVAL - RAY_MIN_SPAWN_INTERVAL));
      rayCooldownEnd = 0; // Reset cooldown
    }
  });
}

function update() {
  const scene = this;
  
  if (gameState === 'title') {
    drawTitleScreen();
  } else if (gameState === 'level') {
    handleShipMovement(scene);
    drawLevel(scene);
  }
}

function drawTitleScreen() {
  gfx.clear();
  gfx.setDefaultStyles({ lineStyle: { width: 2, color: 0x00ffff, alpha: 1 } });
  drawVectorText(GAME_NAME, 150, 250, 50, 80);
}

function drawLevel(scene) {
  gfx.clear();
  const scanY = getScanlinePosition(scene);
  updateRays(scene);
  drawGrid(scanY);
  drawRays(scene);
  drawShip();
}

function getScanlinePosition(scene) {
  const ac = scene.sound.context;
  const now = ac.currentTime;
  const elapsed = now - beatStartTime;
  const cycleTime = SEC_PER_BEAT;
  const progress = (elapsed % cycleTime) / cycleTime;
  return progress * 600; // height
}

function drawGrid(scanY) {
  const width = 800;
  const height = 600;
  const cellW = width / GRID_COLS;
  const cellH = height / GRID_ROWS;
  const glowRadius = cellH * 0.5;
  
  // Gradient colors: top #1ED9C6, bottom #BF048D
  const topR = 0x1E, topG = 0xD9, topB = 0xC6;
  const botR = 0xBF, botG = 0x04, botB = 0x8D;
  
  // Draw vertical lines with gradient and glow
  for (let i = 0; i <= GRID_COLS; i++) {
    const x = i * cellW;
    // Draw line segment by segment for gradient
    const segs = 20;
    for (let s = 0; s < segs; s++) {
      const y1 = (s / segs) * height;
      const y2 = ((s + 1) / segs) * height;
      const midY = (y1 + y2) / 2;
      const ratio = midY / height;
      
      // Calculate glow intensity based on distance from scanline
      const distFromScan = Math.abs(midY - scanY);
      const glowIntensity = Math.max(0, 1 - (distFromScan / glowRadius));
      
      const r = Math.floor(topR * (1 - ratio) + botR * ratio);
      const g = Math.floor(topG * (1 - ratio) + botG * ratio);
      const b = Math.floor(topB * (1 - ratio) + botB * ratio);
      const baseColor = (r << 16) | (g << 8) | b;
      
      // Draw base line
      gfx.lineStyle(GRID_LINE_WIDTH, baseColor, 1);
      gfx.beginPath();
      gfx.moveTo(x, y1);
      gfx.lineTo(x, y2);
      gfx.strokePath();
      
      // Draw glow if near scanline
      if (glowIntensity > 0) {
        const glowWidth = GRID_LINE_WIDTH + (SCANLINE_WIDTH - GRID_LINE_WIDTH) * glowIntensity;
        const glowAlpha = glowIntensity * 0.9;
        gfx.lineStyle(glowWidth, baseColor, glowAlpha);
        gfx.beginPath();
        gfx.moveTo(x, y1);
        gfx.lineTo(x, y2);
        gfx.strokePath();
      }
    }
  }
  
  // Draw horizontal lines with gradient and glow
  for (let i = 0; i <= GRID_ROWS; i++) {
    const y = i * cellH;
    const ratio = y / height;
    
    // Calculate glow intensity based on distance from scanline
    const distFromScan = Math.abs(y - scanY);
    const glowIntensity = Math.max(0, 1 - (distFromScan / glowRadius));
    
    const r = Math.floor(topR * (1 - ratio) + botR * ratio);
    const g = Math.floor(topG * (1 - ratio) + botG * ratio);
    const b = Math.floor(topB * (1 - ratio) + botB * ratio);
    const baseColor = (r << 16) | (g << 8) | b;
    
    // Draw base line
    gfx.lineStyle(GRID_LINE_WIDTH, baseColor, 1);
    gfx.beginPath();
    gfx.moveTo(0, y);
    gfx.lineTo(width, y);
    gfx.strokePath();
    
    // Draw glow if near scanline
    if (glowIntensity > 0) {
      const glowWidth = GRID_LINE_WIDTH + (SCANLINE_WIDTH - GRID_LINE_WIDTH) * glowIntensity;
      const glowAlpha = glowIntensity * 0.9;
      gfx.lineStyle(glowWidth, baseColor, glowAlpha);
      gfx.beginPath();
      gfx.moveTo(0, y);
      gfx.lineTo(width, y);
      gfx.strokePath();
    }
  }
}

function drawShip() {
  const x = shipPos.x;
  const y = shipPos.y;
  const size = 20;
  
  gfx.lineStyle(2, 0x00ffff, 1);
  // Simple triangle ship pointing up
  gfx.beginPath();
  gfx.moveTo(x, y - size);
  gfx.lineTo(x - size * 0.7, y + size * 0.5);
  gfx.lineTo(x, y);
  gfx.lineTo(x + size * 0.7, y + size * 0.5);
  gfx.closePath();
  gfx.strokePath();
}

function getCurrentMaxSpeed(scene) {
  if (gameState !== 'level') return SHIP_BASE_SPEED;
  const ac = scene.sound.context;
  const now = ac.currentTime;
  const elapsed = now - beatStartTime;
  const speedIncrease = elapsed * SHIP_SPEED_RAMP_RATE;
  return Math.min(SHIP_BASE_SPEED + speedIncrease, SHIP_MAX_SPEED_CAP);
}

function handleShipMovement(scene) {
  const currentMaxSpeed = getCurrentMaxSpeed(scene);
  
  // Get input direction
  let targetVelX = 0;
  let targetVelY = 0;
  
  if (cursors.left.isDown || wasd.A.isDown) targetVelX = -currentMaxSpeed;
  if (cursors.right.isDown || wasd.D.isDown) targetVelX = currentMaxSpeed;
  if (cursors.up.isDown || wasd.W.isDown) targetVelY = -currentMaxSpeed;
  if (cursors.down.isDown || wasd.S.isDown) targetVelY = currentMaxSpeed;
  
  // Lerp velocity towards target (acceleration)
  shipVel.x = shipVel.x + (targetVelX - shipVel.x) * SHIP_ACCELERATION;
  shipVel.y = shipVel.y + (targetVelY - shipVel.y) * SHIP_ACCELERATION;
  
  // Apply friction when no input
  if (targetVelX === 0) shipVel.x *= SHIP_FRICTION;
  if (targetVelY === 0) shipVel.y *= SHIP_FRICTION;
  
  // Update position
  shipPos.x = Phaser.Math.Clamp(shipPos.x + shipVel.x, 0, 800);
  shipPos.y = Phaser.Math.Clamp(shipPos.y + shipVel.y, 0, 600);
}

function drawVectorText(text, x, y, charWidth, charHeight) {
  const chars = text.toLowerCase().split('');
  const spacing = charWidth; // Monospaced
  
  chars.forEach((char, idx) => {
    const lines = VECTOR_FONT[char] || [];
    drawVectorChar(x + idx * spacing, y, charWidth, charHeight, lines);
  });
}

function drawVectorChar(x, y, w, h, lines) {
  gfx.lineStyle(2, 0x00ffff, 1);
  lines.forEach(line => {
    const [x1, y1, x2, y2] = line;
    gfx.beginPath();
    gfx.moveTo(x + x1 * w, y + y1 * h);
    gfx.lineTo(x + x2 * w, y + y2 * h);
    gfx.strokePath();
  });
}

// Ray system functions
function getGridIntersections() {
  const width = 800;
  const height = 600;
  const cellW = width / GRID_COLS;
  const cellH = height / GRID_ROWS;
  const intersections = [];
  
  for (let i = 0; i <= GRID_COLS; i++) {
    for (let j = 0; j <= GRID_ROWS; j++) {
      intersections.push({ x: i * cellW, y: j * cellH });
    }
  }
  return intersections;
}

function getRandomGridIntersection() {
  const intersections = getGridIntersections();
  
  // Filter out intersections too close to the player
  const validIntersections = intersections.filter(intersection => {
    const dx = intersection.x - shipPos.x;
    const dy = intersection.y - shipPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance >= RAY_MIN_SPAWN_DISTANCE;
  });
  
  // If no valid intersections (unlikely), fall back to all intersections
  const candidates = validIntersections.length > 0 ? validIntersections : intersections;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function getShipCollisionRadius() {
  const shipSize = 20;
  const shipArea = Math.PI * shipSize * shipSize;
  const collisionArea = shipArea * (1 + SHIP_COLLISION_RATE);
  return Math.sqrt(collisionArea / Math.PI);
}

function spawnRay(scene) {
  const origin = getRandomGridIntersection();
  const growthBeats = RAY_MIN_BEATS + Math.random() * (RAY_MAX_BEATS - RAY_MIN_BEATS);
  const durationBeats = RAY_MIN_DURATION_BEATS + Math.random() * (RAY_MAX_DURATION_BEATS - RAY_MIN_DURATION_BEATS);
  const ac = scene.sound.context;
  const now = ac.currentTime;
  
  // Calculate target point offset by 35% from origin towards ship position at moment of firing
  // This target is fixed and does not follow the player
  const targetX = origin.x + (shipPos.x - origin.x) * RAY_TARGET_OFFSET;
  const targetY = origin.y + (shipPos.y - origin.y) * RAY_TARGET_OFFSET;
  
  // Calculate angle to fixed target (calculated once at spawn, never updated)
  const dx = targetX - origin.x;
  const dy = targetY - origin.y;
  const angle = Math.atan2(dy, dx);
  
  activeRays.push({
    originX: origin.x,
    originY: origin.y,
    angle: angle, // Fixed angle, does not follow player
    startTime: now,
    growthBeats: growthBeats,
    durationBeats: durationBeats,
    endTime: now + durationBeats * SEC_PER_BEAT,
    hit: false,
    hitTime: 0,
    postHitEndTime: 0
  });
}

function restartGame(scene) {
  gameState = 'title';
  shipPos = { x: 400, y: 300 };
  shipVel = { x: 0, y: 0 };
  activeRays = [];
  lastRaySpawnTime = 0;
  nextRaySpawnTime = 0;
  beatStartTime = 0;
  rayCooldownEnd = 0;
}

function handleRayHit(ray, scene) {
  const ac = scene.sound.context;
  const now = ac.currentTime;
  
  // Mark ray as hit and set post-hit duration
  if (!ray.hit) {
    ray.hit = true;
    ray.hitTime = now;
    const postHitDuration = RAY_POST_HIT_DURATION_MIN + Math.random() * (RAY_POST_HIT_DURATION_MAX - RAY_POST_HIT_DURATION_MIN);
    ray.postHitEndTime = now + postHitDuration;
    
    // Set cooldown
    rayCooldownEnd = now + RAY_COOLDOWN_TIME;
  }
}

function updateRays(scene) {
  const ac = scene.sound.context;
  const now = ac.currentTime;
  
  // Spawn new rays (only if not in cooldown)
  if (now >= nextRaySpawnTime && now >= rayCooldownEnd) {
    spawnRay(scene);
    lastRaySpawnTime = now;
    nextRaySpawnTime = now + (RAY_MIN_SPAWN_INTERVAL + Math.random() * (RAY_MAX_SPAWN_INTERVAL - RAY_MIN_SPAWN_INTERVAL));
  }
  
  // Update existing rays
  activeRays = activeRays.filter(ray => {
    // Remove expired rays (after post-hit duration if hit, otherwise after normal duration)
    const finalEndTime = ray.hit ? ray.postHitEndTime : ray.endTime;
    if (now >= finalEndTime) return false;
    
    // Angle is fixed at spawn, does not follow player
    
    // Check collision (only if not already hit)
    if (!ray.hit) {
      const elapsed = now - ray.startTime;
      const growthProgress = Math.min(1, elapsed / (ray.growthBeats * SEC_PER_BEAT));
      const currentLength = Math.pow(growthProgress, 2) * 2000; // Exponential growth
      
      const endX = ray.originX + Math.cos(ray.angle) * currentLength;
      const endY = ray.originY + Math.sin(ray.angle) * currentLength;
      
      if (checkRayCollision(ray.originX, ray.originY, endX, endY)) {
        // Collision detected - mark as hit and continue firing
        handleRayHit(ray, scene);
      }
    }
    
    return true;
  });
}

function checkRayCollision(rayX1, rayY1, rayX2, rayY2) {
  const shipRadius = getShipCollisionRadius();
  const shipX = shipPos.x;
  const shipY = shipPos.y;
  
  // Check if ray segment intersects with ship's collision circle
  // Using point-to-line-segment distance
  const dx = rayX2 - rayX1;
  const dy = rayY2 - rayY1;
  const lengthSq = dx * dx + dy * dy;
  
  if (lengthSq === 0) {
    // Ray is a point
    const dist = Math.sqrt((shipX - rayX1) ** 2 + (shipY - rayY1) ** 2);
    return dist <= shipRadius;
  }
  
  // Project ship position onto ray
  const t = Math.max(0, Math.min(1, ((shipX - rayX1) * dx + (shipY - rayY1) * dy) / lengthSq));
  const projX = rayX1 + t * dx;
  const projY = rayY1 + t * dy;
  
  // Check distance from ship to projected point
  const dist = Math.sqrt((shipX - projX) ** 2 + (shipY - projY) ** 2);
  return dist <= shipRadius;
}

function drawRays(scene) {
  const ac = scene.sound.context;
  const now = ac.currentTime;
  
  activeRays.forEach(ray => {
    const elapsed = now - ray.startTime;
    const growthProgress = Math.min(1, elapsed / (ray.growthBeats * SEC_PER_BEAT));
    
    // Exponential growth: progress^2
    const currentLength = Math.pow(growthProgress, 2) * 2000;
    
    const endX = ray.originX + Math.cos(ray.angle) * currentLength;
    const endY = ray.originY + Math.sin(ray.angle) * currentLength;
    
    // Draw ray - red if hit, white otherwise
    const rayColor = ray.hit ? 0xff0000 : 0xffffff;
    gfx.lineStyle(2, rayColor, 1);
    gfx.beginPath();
    gfx.moveTo(ray.originX, ray.originY);
    gfx.lineTo(endX, endY);
    gfx.strokePath();
  });
}
