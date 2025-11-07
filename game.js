// Stage 2: Game Over State and P2 Join

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: { create, update }
};

const game = new Phaser.Game(config);

// === GLOBAL SETTINGS ===
const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;
const GAME_NAME = 'vibebeater';

// Ship settings
const SHIP_START_X = 400;
const SHIP_START_Y = 300;
const SHIP_SIZE = 20;
const SHIP_BASE_SPEED = 5;
const SHIP_MAX_SPEED_CAP = 15;
const SHIP_SPEED_RAMP_RATE = 0.55;
const SHIP_ACCELERATION = 0.45;
const SHIP_FRICTION = 0.45;
const SHIP_COLLISION_RATE = 0.0025; 

// BPM timing
const BPM = 130;
const SEC_PER_BEAT = 60 / BPM;

// Grid settings
const GRID_COLS = 8;
const GRID_ROWS = 8;
const GRID_LINE_WIDTH = 1;
const SCANLINE_WIDTH = GRID_LINE_WIDTH * 2.5;
const GRID_CELL_WIDTH = SCREEN_WIDTH / GRID_COLS;
const GRID_CELL_HEIGHT = SCREEN_HEIGHT / GRID_ROWS;

// Grid colors (gradient)
const GRID_TOP_COLOR = { r: 0x1E, g: 0xD9, b: 0xC6 };
const GRID_BOT_COLOR = { r: 0xBF, g: 0x04, b: 0x8D };
const GRID_GLOW_RADIUS = GRID_CELL_HEIGHT * 0.5;
const GRID_GRADIENT_SEGMENTS = 20;

// Ray attack settings
const RAY_MIN_BEATS = (1/3) * 1.25;
const RAY_MAX_BEATS = 4 * 1.25;
const RAY_MIN_DURATION_BEATS = 2 * 1.25;
const RAY_MAX_DURATION_BEATS = 8 * 1.25;
const RAY_MIN_SPAWN_INTERVAL = 1 * 1.25 * 2;
const RAY_MAX_SPAWN_INTERVAL = 3 * 1.25 * 2;
const RAY_MIN_SPAWN_DISTANCE = 150;
const RAY_MIN_SAFE_CELLS = 2;
const RAY_MAX_LENGTH = 3000; 
const RAY_LINE_WIDTH = 2;
const RAY_COLLISION_OFFSET = 8; 
const RAY_COLOR_NORMAL = 0xffffff;
const RAY_COLOR_HIT = 0xff0000; 
const RAY_GLOW_LAYERS = 3;

// Game Over timing and layout
const GAMEOVER_TITLE_MARGIN = 50;

// Text settings
const TEXT_CHAR_WIDTH = 50;
const TEXT_CHAR_HEIGHT = 80;
const TEXT_CHAR_SPACING = 1.2;
const TEXT_LINE_WIDTH = 2;
const TEXT_COLOR = 0x00ffff;

// Score settings
const BEAT_COUNTER_Y_OFFSET = 25;
const SCORE_TEXT_CHAR_WIDTH = TEXT_CHAR_WIDTH * 0.5;
const SCORE_TEXT_CHAR_HEIGHT = TEXT_CHAR_HEIGHT * 0.5;
const SCORE_TEXT_X_LEFT = 25;
const SCORE_TEXT_X_RIGHT = SCREEN_WIDTH - (SCORE_TEXT_CHAR_WIDTH * 8) - 25; 

// === GLOBAL STATE ===
let gfx;
let cursors;
let wasd;
let gameState = 'title';
let shipPos = { x: SHIP_START_X, y: SHIP_START_Y };
let shipVel = { x: 0, y: 0 };
let ship1Score = 0;

// Player 2
let ship2Pos = { x: 0, y: 0 };
let ship2Vel = { x: 0, y: 0 };
let ship2Score = 0;
let ship2Active = false;

let beatStartTime = 0;
let activeRays = [];
let lastRaySpawnTime = 0;
let nextRaySpawnTime = 0;
let hittingRay = null;


// === VECTOR FONT ===
const VECTOR_FONT = {
  'v': [[0,0, 0.5,1, 1,0]],
  'i': [[0.5,0, 0.5,1]],
  'b': [[0,0, 0,1, 0.7,1, 0.7,0.5, 0,0.5, 0.7,0.5, 0.7,0, 0,0]],
  'e': [[1,0, 0,0, 0,0.5, 0.6,0.5], [0,0.5, 0,1, 1,1]],
  'a': [[0,1, 0.5,0, 1,1], [0.25,0.5, 0.75,0.5]],
  't': [[0,0, 1,0], [0.5,0, 0.5,1]],
  'r': [[0,1, 0,0, 0.7,0, 0.7,0.5, 0,0.5], [0.7,0.5, 1,1]],
  'g': [[1,0.2, 0,0.2, 0,1, 1,1, 1,0.5, 0.5,0.5]],
  'm': [[0,1, 0,0, 0.5,0.5, 1,0, 1,1]],
  'o': [[0,0, 1,0, 1,1, 0,1, 0,0]],
  'p': [[0,1, 0,0, 1,0, 1,0.5, 0,0.5]],
  's': [[1,0.2, 0,0.2, 0,0.5, 1,0.5, 1,0.8, 0,0.8]],
  'y': [[0,0, 0.5,0.5, 1,0], [0.5,0.5, 0.5,1]],
  'k': [[0,1, 0,0], [1,0, 0.5,0.5, 1,1]],
  'n': [[0,1, 0,0, 1,1, 1,0]],
  '0': [[0,0, 1,0, 1,1, 0,1, 0,0], [0,0, 1,1]],
  '1': [[0.3,0.2, 0.5,0, 0.5,1]],
  '2': [[0,0, 1,0, 1,0.5, 0,1, 1,1]],
  '3': [[0,0, 1,0, 1,1, 0,1], [1,0.5, 0.5,0.5]],
  '4': [[0,0, 0,0.6, 1,0.6], [0.7,0, 0.7,1]],
  '5': [[1,0, 0,0, 0,0.5, 1,0.5, 1,1, 0,1]],
  '6': [[1,0, 0,0.5, 0,1, 1,1, 1,0.5, 0,0.5]],
  '7': [[0,0, 1,0, 0.5,1]],
  '8': [[0,0, 1,0, 1,0.5, 0,0.5, 0,0], [0,0.5, 1,0.5, 1,1, 0,1, 0,0.5]],
  '9': [[1,1, 1,0, 0,0, 0,0.5, 1,0.5]],
  ' ': []
};

// === PHASER LIFECYCLE ===
function create() {
  const scene = this;
  gfx = scene.add.graphics();
  cursors = scene.input.keyboard.createCursorKeys();
  wasd = scene.input.keyboard.addKeys({
    W: 'W', S: 'S', A: 'A', D: 'D',
    pad2_up: 'I', pad2_down: 'K', pad2_left: 'J', pad2_right: 'L' // P2 controls
  });
  
  ship1Score = 0;
  ship2Active = false;
  
  // Only handle starting the game from the title screen
  scene.input.keyboard.on('keydown', () => {
    if (gameState === 'title') {
      gameState = 'level';
      beatStartTime = scene.sound.context.currentTime;
      shipPos = { x: SHIP_START_X, y: SHIP_START_Y };
      shipVel = { x: 0, y: 0 };
      activeRays = [];
      lastRaySpawnTime = scene.sound.context.currentTime;
      nextRaySpawnTime = lastRaySpawnTime + (RAY_MIN_SPAWN_INTERVAL + Math.random() * (RAY_MAX_SPAWN_INTERVAL - RAY_MIN_SPAWN_INTERVAL));
    }
  });
}

function update() {
  const scene = this;
  
  // P2 Join check
  if (gameState === 'level' && !ship2Active) {
    if (wasd.pad2_up.isDown || wasd.pad2_down.isDown || wasd.pad2_left.isDown || wasd.pad2_right.isDown) {
      ship2Active = true;
      ship2Pos = { x: SCREEN_WIDTH - SHIP_START_X, y: SHIP_START_Y };
      ship2Vel = { x: 0, y: 0 };
      ship2Score = ship1Score; // Start at same score
    }
  }
  
  if (gameState === 'title') {
    drawTitleScreen();
  } else if (gameState === 'level') {
    handleShipMovement(scene);
    drawLevel(scene);
    updateRays(scene); // Update rays after movement
  } else if (gameState === 'gameover') {
    // Draw final frame (with red ray)
    drawLevel(scene); 
    // Draw static game over text
    drawGameOverScreen(scene);
  }
}

// === GAME OVER LOGIC ===

/**
 * Called when a ray hits a player.
 * Immediately sets gameState to 'gameover' and sets up a one-time key listener
 * to return to the playable 'level' state upon any key press.
 */
function handleRayHit(ray, scene) {
  if (!ray.hit) {
    ray.hit = true;
    hittingRay = ray;
    gameState = 'gameover';

    // Attach a one-time listener to reset and return to the playable state immediately upon keypress.
    scene.input.keyboard.once('keydown', () => {
      if (gameState === 'gameover') {
        restartGame(scene); // Reset all game state variables
        
        // Go back to the playable 'level' state
        gameState = 'level'; 
        
        // Restart beat and ray timers for the new round
        beatStartTime = scene.sound.context.currentTime; 
        lastRaySpawnTime = scene.sound.context.currentTime;
        nextRaySpawnTime = lastRaySpawnTime + (RAY_MIN_SPAWN_INTERVAL + Math.random() * (RAY_MAX_SPAWN_INTERVAL - RAY_MIN_SPAWN_INTERVAL));
      }
    });
  }
}

// === TITLE SCREEN ===
function drawTitleScreen() {
  gfx.clear();
  drawCenteredVectorText(GAME_NAME, TEXT_CHAR_WIDTH, TEXT_CHAR_HEIGHT, 0);
}

// === GAME OVER SCREEN ===
function drawGameOverScreen(scene) {
  // Fade screen (constant black overlay)
  gfx.fillStyle(0x000000, 0.75); // 75% opacity black
  gfx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  
  // --- 1. Draw "GAME OVER" (Title Screen Style, 50px margin) ---
  
  // Calculate max allowed width to enforce 50px margin
  const maxTitleWidth = SCREEN_WIDTH - (GAMEOVER_TITLE_MARGIN * 2);
  const titleText = "game over";
  const titleLength = titleText.length;
  
  // Calculate required char width to fill maxTitleWidth
  const requiredCharWidth = maxTitleWidth / (titleLength * TEXT_CHAR_SPACING);
  
  const titleCharWidth = requiredCharWidth;
  // Maintain aspect ratio for height
  const titleCharHeight = requiredCharWidth * (TEXT_CHAR_HEIGHT / TEXT_CHAR_WIDTH); 

  // Y offset to center the text block vertically
  const titleYOffset = -titleCharHeight;
  
  // Draw the title text (always full alpha 1)
  drawCenteredVectorText(titleText, titleCharWidth, titleCharHeight, titleYOffset, 1);
}


// === LEVEL DRAWING ===
function drawLevel(scene) {
  gfx.clear();
  const scanY = getScanlinePosition(scene);
  
  if (gameState === 'level') {
    // Update score
    const now = scene.sound.context.currentTime;
    const elapsed = now - beatStartTime;
    const score = Math.floor(elapsed / (SEC_PER_BEAT / 8)); // 32nd notes
    ship1Score = score;
    if (ship2Active) {
      ship2Score = score;
    }
  }

  drawGrid(scanY);
  drawRays(scene);
  drawShip(shipPos.x, shipPos.y); // Draw P1
  
  if (ship2Active) {
    drawShip(ship2Pos.x, ship2Pos.y); // Draw P2
  }
  
  // Draw scores
  drawVectorText(ship1Score.toString(), SCORE_TEXT_X_LEFT, BEAT_COUNTER_Y_OFFSET, SCORE_TEXT_CHAR_WIDTH, SCORE_TEXT_CHAR_HEIGHT);
  if (ship2Active) {
    drawVectorText(ship2Score.toString(), SCORE_TEXT_X_RIGHT, BEAT_COUNTER_Y_OFFSET, SCORE_TEXT_CHAR_WIDTH, SCORE_TEXT_CHAR_HEIGHT);
  }
}

function getScanlinePosition(scene) {
  const now = scene.sound.context.currentTime;
  if (beatStartTime === 0) return 0; // Avoid NaN before game start
  const elapsed = now - beatStartTime;
  const progress = (elapsed % SEC_PER_BEAT) / SEC_PER_BEAT;
  return progress * SCREEN_HEIGHT;
}

// === GRID DRAWING ===
function drawGrid(scanY) {
  drawVerticalGridLines(scanY);
  drawHorizontalGridLines(scanY);
}

function drawVerticalGridLines(scanY) {
  for (let i = 0; i <= GRID_COLS; i++) {
    const x = i * GRID_CELL_WIDTH;
    
    for (let s = 0; s < GRID_GRADIENT_SEGMENTS; s++) {
      const y1 = (s / GRID_GRADIENT_SEGMENTS) * SCREEN_HEIGHT;
      const y2 = ((s + 1) / GRID_GRADIENT_SEGMENTS) * SCREEN_HEIGHT;
      const midY = (y1 + y2) / 2;
      const ratio = midY / SCREEN_HEIGHT;
      const distFromScan = Math.abs(midY - scanY);
      const glowIntensity = Math.max(0, 1 - (distFromScan / GRID_GLOW_RADIUS));
      
      const r = Math.floor(GRID_TOP_COLOR.r * (1 - ratio) + GRID_BOT_COLOR.r * ratio);
      const g = Math.floor(GRID_TOP_COLOR.g * (1 - ratio) + GRID_BOT_COLOR.g * ratio);
      const b = Math.floor(GRID_TOP_COLOR.b * (1 - ratio) + GRID_BOT_COLOR.b * ratio);
      const baseColor = (r << 16) | (g << 8) | b;
      
      gfx.lineStyle(GRID_LINE_WIDTH, baseColor, 1);
      gfx.beginPath();
      gfx.moveTo(x, y1);
      gfx.lineTo(x, y2);
      gfx.strokePath();
      
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
}

function drawHorizontalGridLines(scanY) {
  for (let i = 0; i <= GRID_ROWS; i++) {
    const y = i * GRID_CELL_HEIGHT;
    const ratio = y / SCREEN_HEIGHT;
    const distFromScan = Math.abs(y - scanY);
    const glowIntensity = Math.max(0, 1 - (distFromScan / GRID_GLOW_RADIUS));
    
    const r = Math.floor(GRID_TOP_COLOR.r * (1 - ratio) + GRID_BOT_COLOR.r * ratio);
    const g = Math.floor(GRID_TOP_COLOR.g * (1 - ratio) + GRID_BOT_COLOR.g * ratio);
    const b = Math.floor(GRID_TOP_COLOR.b * (1 - ratio) + GRID_BOT_COLOR.b * ratio);
    const baseColor = (r << 16) | (g << 8) | b;
    
    gfx.lineStyle(GRID_LINE_WIDTH, baseColor, 1);
    gfx.beginPath();
    gfx.moveTo(0, y);
    gfx.lineTo(SCREEN_WIDTH, y);
    gfx.strokePath();
    
    if (glowIntensity > 0) {
      const glowWidth = GRID_LINE_WIDTH + (SCANLINE_WIDTH - GRID_LINE_WIDTH) * glowIntensity;
      const glowAlpha = glowIntensity * 0.9;
      gfx.lineStyle(glowWidth, baseColor, glowAlpha);
      gfx.beginPath();
      gfx.moveTo(0, y);
      gfx.lineTo(SCREEN_WIDTH, y);
      gfx.strokePath();
    }
  }
}

// === SHIP ===
function drawShip(x, y) {
  gfx.lineStyle(TEXT_LINE_WIDTH, TEXT_COLOR, 1);
  gfx.beginPath();
  gfx.moveTo(x, y - SHIP_SIZE);
  gfx.lineTo(x - SHIP_SIZE * 0.7, y + SHIP_SIZE * 0.5);
  gfx.lineTo(x, y);
  gfx.lineTo(x + SHIP_SIZE * 0.7, y + SHIP_SIZE * 0.5);
  gfx.closePath();
  gfx.strokePath();
}

function getCurrentMaxSpeed(scene) {
  if (gameState !== 'level') return SHIP_BASE_SPEED;
  
  const now = scene.sound.context.currentTime;
  const elapsed = now - beatStartTime;
  const speedIncrease = elapsed * SHIP_SPEED_RAMP_RATE;
  return Math.min(SHIP_BASE_SPEED + speedIncrease, SHIP_MAX_SPEED_CAP);
}

function handleShipMovement(scene) {
  const currentMaxSpeed = getCurrentMaxSpeed(scene);
  
  // P1 Movement
  let targetVelX = 0;
  let targetVelY = 0;
  if (cursors.left.isDown || wasd.A.isDown) targetVelX = -currentMaxSpeed;
  if (cursors.right.isDown || wasd.D.isDown) targetVelX = currentMaxSpeed;
  if (cursors.up.isDown || wasd.W.isDown) targetVelY = -currentMaxSpeed;
  if (cursors.down.isDown || wasd.S.isDown) targetVelY = currentMaxSpeed;
  
  shipVel.x = shipVel.x + (targetVelX - shipVel.x) * SHIP_ACCELERATION;
  shipVel.y = shipVel.y + (targetVelY - shipVel.y) * SHIP_ACCELERATION;
  
  if (targetVelX === 0) shipVel.x *= SHIP_FRICTION;
  if (targetVelY === 0) shipVel.y *= SHIP_FRICTION;
  
  shipPos.x = Phaser.Math.Clamp(shipPos.x + shipVel.x, 0, SCREEN_WIDTH);
  shipPos.y = Phaser.Math.Clamp(shipPos.y + shipVel.y, 0, SCREEN_HEIGHT);
  
  // P2 Movement
  if (ship2Active) {
    let targetVelX2 = 0;
    let targetVelY2 = 0;
    if (wasd.pad2_left.isDown) targetVelX2 = -currentMaxSpeed;
    if (wasd.pad2_right.isDown) targetVelX2 = currentMaxSpeed;
    if (wasd.pad2_up.isDown) targetVelY2 = -currentMaxSpeed;
    if (wasd.pad2_down.isDown) targetVelY2 = currentMaxSpeed;
    
    ship2Vel.x = ship2Vel.x + (targetVelX2 - ship2Vel.x) * SHIP_ACCELERATION;
    ship2Vel.y = ship2Vel.y + (targetVelY2 - ship2Vel.y) * SHIP_ACCELERATION;
    
    if (targetVelX2 === 0) ship2Vel.x *= SHIP_FRICTION;
    if (targetVelY2 === 0) ship2Vel.y *= SHIP_FRICTION;
    
    ship2Pos.x = Phaser.Math.Clamp(ship2Pos.x + ship2Vel.x, 0, SCREEN_WIDTH);
    ship2Pos.y = Phaser.Math.Clamp(ship2Pos.y + ship2Vel.y, 0, SCREEN_HEIGHT);
  }
}

function getShipCollisionRadius() {
  const shipArea = Math.PI * SHIP_SIZE * SHIP_SIZE;
  const collisionArea = shipArea * (1 + SHIP_COLLISION_RATE);
  return Math.sqrt(collisionArea / Math.PI);
}

// === VECTOR TEXT UTILITIES ===

function drawVectorChar(x, y, w, h, strokes, alpha = 1) {
  gfx.lineStyle(TEXT_LINE_WIDTH, TEXT_COLOR, alpha);
  
  strokes.forEach(stroke => {
    if (stroke.length < 2) return;
    
    gfx.beginPath();
    gfx.moveTo(x + stroke[0] * w, y + stroke[1] * h);
    
    for (let i = 2; i < stroke.length; i += 2) {
      gfx.lineTo(x + stroke[i] * w, y + stroke[i+1] * h);
    }
    
    gfx.strokePath();
  });
}

function drawVectorText(text, x, y, w, h, alpha = 1) {
  const chars = text.toLowerCase().split('');
  const spacing = w * TEXT_CHAR_SPACING;
  
  chars.forEach((char, idx) => {
    const strokes = VECTOR_FONT[char] || [];
    drawVectorChar(x + idx * spacing, y, w, h, strokes, alpha);
  });
}

function drawCenteredVectorText(text, w, h, yOffset, alpha = 1) {
  const totalWidth = text.length * w * TEXT_CHAR_SPACING;
  const x = (SCREEN_WIDTH - totalWidth) / 2;
  const y = (SCREEN_HEIGHT - h) / 2 + yOffset;
  
  drawVectorText(text, x, y, w, h, alpha);
}

// === RAY SYSTEM ===
function getGridIntersections() {
  const intersections = [];
  
  for (let i = 0; i <= GRID_COLS; i++) {
    for (let j = 0; j <= GRID_ROWS; j++) {
      intersections.push({ x: i * GRID_CELL_WIDTH, y: j * GRID_CELL_HEIGHT });
    }
  }
  return intersections;
}

function isInLineOfSight(origin, pos) {
  const dx = Math.abs(origin.x - pos.x);
  const dy = Math.abs(origin.y - pos.y);
  
  const cellsAwayX = dx / GRID_CELL_WIDTH;
  const cellsAwayY = dy / GRID_CELL_HEIGHT;
  
  return cellsAwayX < RAY_MIN_SAFE_CELLS || cellsAwayY < RAY_MIN_SAFE_CELLS;
}

function getRandomGridIntersection() {
  const intersections = getGridIntersections();
  
  // Check against P1
  let validIntersections = intersections.filter(intersection => {
    const dx = intersection.x - shipPos.x;
    const dy = intersection.y - shipPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance >= RAY_MIN_SPAWN_DISTANCE && !isInLineOfSight(intersection, shipPos);
  });
  
  // If P2 is active, filter again against P2
  if (ship2Active) {
    validIntersections = validIntersections.filter(intersection => {
      const dx = intersection.x - ship2Pos.x;
      const dy = intersection.y - ship2Pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      return distance >= RAY_MIN_SPAWN_DISTANCE && !isInLineOfSight(intersection, ship2Pos);
    });
  }
  
  const candidates = validIntersections.length > 0 ? validIntersections : intersections;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function spawnRay(scene) {
  const origin = getRandomGridIntersection();
  const growthBeats = RAY_MIN_BEATS + Math.random() * (RAY_MAX_BEATS - RAY_MIN_BEATS);
  const durationBeats = RAY_MIN_DURATION_BEATS + Math.random() * (RAY_MAX_DURATION_BEATS - RAY_MIN_DURATION_BEATS);
  const now = scene.sound.context.currentTime;
  
  // Target P1 by default, or P2 if P1 is far and P2 is closer
  let targetPos = shipPos;
  if (ship2Active) {
    const distP1 = Math.hypot(shipPos.x - origin.x, shipPos.y - origin.y);
    const distP2 = Math.hypot(ship2Pos.x - origin.x, ship2Pos.y - origin.y);
    if (distP2 < distP1) {
      targetPos = ship2Pos;
    }
  }

  const dx = targetPos.x - origin.x;
  const dy = targetPos.y - origin.y;
  const angle = Math.atan2(dy, dx);
  
  activeRays.push({
    originX: origin.x,
    originY: origin.y,
    angle: angle, // Store the fixed angle
    startTime: now,
    growthBeats: growthBeats,
    durationBeats: durationBeats,
    endTime: now + durationBeats * SEC_PER_BEAT,
    hit: false
  });
}

function updateRays(scene) {
  const now = scene.sound.context.currentTime;
  
  if (now >= nextRaySpawnTime && gameState === 'level') {
    spawnRay(scene);
    lastRaySpawnTime = now;
    nextRaySpawnTime = now + (RAY_MIN_SPAWN_INTERVAL + Math.random() * (RAY_MAX_SPAWN_INTERVAL - RAY_MIN_SPAWN_INTERVAL));
  }
  
  activeRays = activeRays.filter(ray => {
    const finalEndTime = ray.endTime;
    if (now >= finalEndTime) return false;
    
    // Calculate current ray geometry (required for collision check below)
    const elapsed = now - ray.startTime;
    const growthProgress = Math.min(1, elapsed / (ray.growthBeats * SEC_PER_BEAT));
    const currentLength = Math.pow(growthProgress, 2) * RAY_MAX_LENGTH;
    
    const endX = ray.originX + Math.cos(ray.angle) * currentLength;
    const endY = ray.originY + Math.sin(ray.angle) * currentLength;
    
    // Check collision
    if (gameState === 'level' && !ray.hit) {
      
      // Check for collision throughout the ray's growth phase (while length is increasing)
      if (growthProgress < 1) { 
        // Check P1
        if (checkRayCollision(ray.originX, ray.originY, endX, endY, shipPos.x, shipPos.y)) {
          handleRayHit(ray, scene); // Pass scene here
        } 
        // Check P2
        else if (ship2Active && checkRayCollision(ray.originX, ray.originY, endX, endY, ship2Pos.x, ship2Pos.y)) {
          handleRayHit(ray, scene); // Pass scene here
        }
      }
    }
    
    return true;
  });
}

function checkRayCollision(rayX1, rayY1, rayX2, rayY2, shipX, shipY) {
  const shipRadius = getShipCollisionRadius();
  // Calculate the total collision radius, including the 8px offset for the ray's width.
  const totalCollisionRadius = shipRadius + RAY_COLLISION_OFFSET; 
  
  const dx = rayX2 - rayX1;
  const dy = rayY2 - rayY1;
  const lengthSq = dx * dx + dy * dy;
  
  if (lengthSq === 0) {
    const dist = Math.sqrt((shipX - rayX1) ** 2 + (shipY - rayY1) ** 2);
    // Use the new radius for collision check
    return dist <= totalCollisionRadius;
  }
  
  const t = Math.max(0, Math.min(1, ((shipX - rayX1) * dx + (shipY - rayY1) * dy) / lengthSq));
  const projX = rayX1 + t * dx;
  const projY = rayY1 + t * dy;
  
  const dist = Math.sqrt((shipX - projX) ** 2 + (shipY - projY) ** 2);
  // Use the new radius for collision check
  return dist <= totalCollisionRadius;
}


function drawRays(scene) {
  const now = scene.sound.context.currentTime;
  
  activeRays.forEach(ray => {
    const elapsed = now - ray.startTime;
    const growthProgress = Math.min(1, elapsed / (ray.growthBeats * SEC_PER_BEAT));
    const currentLength = Math.pow(growthProgress, 2) * RAY_MAX_LENGTH;
    
    const endX = ray.originX + Math.cos(ray.angle) * currentLength;
    const endY = ray.originY + Math.sin(ray.angle) * currentLength;
    
    // Ray turns red instantly on hit
    const rayColor = ray.hit ? RAY_COLOR_HIT : RAY_COLOR_NORMAL;
    
    // Draw glow layers (outer to inner)
    for (let i = RAY_GLOW_LAYERS; i >= 0; i--) {
      const glowWidth = RAY_LINE_WIDTH + (i * 2);
      const glowAlpha = (1 - (i / RAY_GLOW_LAYERS)) * 0.4;
      
      gfx.lineStyle(glowWidth, rayColor, glowAlpha);
      gfx.beginPath();
      gfx.moveTo(ray.originX, ray.originY);
      gfx.lineTo(endX, endY);
      gfx.strokePath();
    }
    
    // Draw core beam
    gfx.lineStyle(RAY_LINE_WIDTH, rayColor, 1);
    gfx.beginPath();
    gfx.moveTo(ray.originX, ray.originY);
    gfx.lineTo(endX, endY);
    gfx.strokePath();
  });
}

function restartGame(scene) {
  // We transition back to 'level' but still need to reset the state first
  shipPos = { x: SHIP_START_X, y: SHIP_START_Y };
  shipVel = { x: 0, y: 0 };
  ship1Score = 0;
  
  ship2Active = false;
  ship2Score = 0;
  ship2Pos = { x: 0, y: 0 };
  ship2Vel = { x: 0, y: 0 };
  
  activeRays = [];
  lastRaySpawnTime = 0;
  nextRaySpawnTime = 0;
  beatStartTime = 0;
  hittingRay = null;
}