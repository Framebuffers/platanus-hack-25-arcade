// Stage 1: Restructured game with Diagonal Line Attack

// ============================================================================
// PHASER CONFIG
// ============================================================================
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: { create, update }
};

const game = new Phaser.Game(config);

// ============================================================================
// GLOBAL CONSTANTS - SCREEN
// ============================================================================
const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;
const GAME_NAME = 'vibebeater';

// ============================================================================
// GLOBAL CONSTANTS - TIMING
// ============================================================================
const BPM = 120;
const SEC_PER_BEAT = 60 / BPM;
const BEATS_PER_BAR = 4;
const SEC_PER_BAR = BEATS_PER_BAR * SEC_PER_BEAT;

// ============================================================================
// GLOBAL CONSTANTS - GRID
// ============================================================================
const GRID_COLS = 8;
const GRID_ROWS = 8;
const GRID_LINE_WIDTH = 1;
const GRID_CELL_WIDTH = SCREEN_WIDTH / GRID_COLS;
const GRID_CELL_HEIGHT = SCREEN_HEIGHT / GRID_ROWS;

// Grid colors (gradient)
const GRID_TOP_COLOR = { r: 0x1E, g: 0xD9, b: 0xC6 };
const GRID_BOT_COLOR = { r: 0xBF, g: 0x04, b: 0x8D };
const GRID_GRADIENT_SEGMENTS = 20;

// ============================================================================
// GLOBAL CONSTANTS - SHIP
// ============================================================================
const SHIP_START_X = SCREEN_WIDTH / 2;
const SHIP_START_Y = SCREEN_HEIGHT / 2;
const SHIP_SIZE = 20;
const SHIP_BASE_SPEED = 5;
const SHIP_MAX_SPEED_CAP = 15;
const SHIP_SPEED_RAMP_RATE = 0.55;
const SHIP_ACCELERATION = 0.45;
const SHIP_FRICTION = 0.45;
const SHIP_COLLISION_RADIUS = SHIP_SIZE * 0.7;
const SHIP_COLOR_P1 = 0x00FF00;

// ============================================================================
// GLOBAL CONSTANTS - DIAGONAL LINE ATTACK
// ============================================================================
const DIAGONAL_FADE_IN_BEATS = 0.25; // Quarter note fade in
const DIAGONAL_CHARGE_BEATS = 4; // Full bar lethal duration
const DIAGONAL_COLOR_CHANGE_THRESHOLD = 0.75; // 75% opacity
const DIAGONAL_LINE_WIDTH = 2;
const DIAGONAL_COLOR_CHARGING = 0xFFFFFF;
const DIAGONAL_COLOR_LETHAL = 0xFF0000;
const DIAGONAL_GLOW_MULTIPLIER = 5;
const DIAGONAL_ATTACK_INTERVAL_BEATS = 8; // Spawn every 2 bars

// ============================================================================
// GLOBAL CONSTANTS - TRANSITIONS
// ============================================================================
const FADE_DURATION_BEATS = 0.25; // Quarter note for all fades
const TITLE_BG_OPACITY = 0.9;

// ============================================================================
// GLOBAL CONSTANTS - TEXT
// ============================================================================
const TEXT_CHAR_WIDTH = 50;
const TEXT_CHAR_HEIGHT = 80;
const TEXT_CHAR_SPACING = 1.2;
const TEXT_LINE_WIDTH = 2;
const TEXT_COLOR = 0x00ffff;

// ============================================================================
// GLOBAL STATE - GAME
// ============================================================================
let gfx;
let cursors;
let wasd;
let gameState = 'title';
let beatStartTime = 0;
let globalBeat = 0;
let lastBeatTime = 0;
let stateChangeTime = 0; // Track when state changes for fades

// ============================================================================
// GLOBAL STATE - PLAYER
// ============================================================================
let shipPos = { x: SHIP_START_X, y: SHIP_START_Y };
let shipVel = { x: 0, y: 0 };

// ============================================================================
// GLOBAL STATE - ATTACKS
// ============================================================================
let activeAttacks = [];
let nextAttackTime = 0;

// ============================================================================
// VECTOR FONT DATA
// ============================================================================
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
  '0': [[0,0, 1,0, 1,1, 0,1, 0,0]],
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

// ============================================================================
// PHASER LIFECYCLE - CREATE
// ============================================================================
function create() {
  const scene = this;
  gfx = scene.add.graphics();
  cursors = scene.input.keyboard.createCursorKeys();
  wasd = scene.input.keyboard.addKeys('W,S,A,D');
  
  stateChangeTime = scene.sound.context.currentTime;
  
  scene.input.keyboard.on('keydown', () => {
    if (gameState === 'title') {
      startGame(scene);
    } else if (gameState === 'gameover') {
      restartGame(scene);
    }
  });
}

// ============================================================================
// PHASER LIFECYCLE - UPDATE
// ============================================================================
function update() {
  const scene = this;
  const now = scene.sound.context.currentTime;
  
  updateBeatTracking(now);
  
  if (gameState === 'level') {
    updatePlayer(scene);
    updateAttacks(scene, now);
  }
  
  render(scene, now);
}

// ============================================================================
// GAME STATE MANAGEMENT
// ============================================================================
function startGame(scene) {
  stateChangeTime = scene.sound.context.currentTime;
  gameState = 'level';
  const now = scene.sound.context.currentTime;
  beatStartTime = now;
  lastBeatTime = now;
  globalBeat = 0;
  
  shipPos = { x: SHIP_START_X, y: SHIP_START_Y };
  shipVel = { x: 0, y: 0 };
  activeAttacks = [];
  
  nextAttackTime = now + (DIAGONAL_ATTACK_INTERVAL_BEATS * SEC_PER_BEAT);
}

function restartGame(scene) {
  startGame(scene);
}

function triggerGameOver(scene) {
  stateChangeTime = scene.sound.context.currentTime;
  gameState = 'gameover';
}

// ============================================================================
// BEAT TRACKING
// ============================================================================
function updateBeatTracking(now) {
  while (now > lastBeatTime + SEC_PER_BEAT) {
    lastBeatTime += SEC_PER_BEAT;
    globalBeat++;
  }
}

// ============================================================================
// PLAYER MOVEMENT
// ============================================================================
function updatePlayer(scene) {
  const currentMaxSpeed = getCurrentMaxSpeed(scene);
  
  let targetVelX = 0;
  let targetVelY = 0;
  
  if (cursors.left.isDown || wasd.A.isDown) targetVelX = -currentMaxSpeed;
  if (cursors.right.isDown || wasd.D.isDown) targetVelX = currentMaxSpeed;
  if (cursors.up.isDown || wasd.W.isDown) targetVelY = -currentMaxSpeed;
  if (cursors.down.isDown || wasd.S.isDown) targetVelY = currentMaxSpeed;
  
  shipVel.x += (targetVelX - shipVel.x) * SHIP_ACCELERATION;
  shipVel.y += (targetVelY - shipVel.y) * SHIP_ACCELERATION;
  
  if (targetVelX === 0) shipVel.x *= SHIP_FRICTION;
  if (targetVelY === 0) shipVel.y *= SHIP_FRICTION;
  
  shipPos.x = Phaser.Math.Clamp(shipPos.x + shipVel.x, 0, SCREEN_WIDTH);
  shipPos.y = Phaser.Math.Clamp(shipPos.y + shipVel.y, 0, SCREEN_HEIGHT);
}

function getCurrentMaxSpeed(scene) {
  if (gameState !== 'level') return SHIP_BASE_SPEED;
  
  const now = scene.sound.context.currentTime;
  const elapsed = now - beatStartTime;
  const speedIncrease = elapsed * SHIP_SPEED_RAMP_RATE;
  return Math.min(SHIP_BASE_SPEED + speedIncrease, SHIP_MAX_SPEED_CAP);
}

// ============================================================================
// ATTACK SYSTEM - MANAGEMENT
// ============================================================================
function updateAttacks(scene, now) {
  if (now >= nextAttackTime && gameState === 'level') {
    spawnDiagonalLineAttack(now);
    nextAttackTime = now + (DIAGONAL_ATTACK_INTERVAL_BEATS * SEC_PER_BEAT);
  }
  
  activeAttacks = activeAttacks.filter(attack => {
    const elapsed = now - attack.startTime;
    const fadeInTime = DIAGONAL_FADE_IN_BEATS * SEC_PER_BEAT;
    const chargeTime = DIAGONAL_CHARGE_BEATS * SEC_PER_BEAT;
    const totalDuration = fadeInTime + chargeTime;
    
    if (elapsed >= totalDuration) return false;
    
    // Calculate opacity to check if ray is red
    let opacity = 0;
    if (elapsed < fadeInTime) {
      opacity = elapsed / fadeInTime;
    } else {
      const chargeProgress = (elapsed - fadeInTime) / chargeTime;
      opacity = Math.min(1, chargeProgress);
    }
    
    // Only check collision when ray is red (opacity >= 75%)
    if (!attack.hit && opacity >= DIAGONAL_COLOR_CHANGE_THRESHOLD) {
      if (checkDiagonalLineCollision(attack)) {
        attack.hit = true;
        triggerGameOver(scene);
      }
    }
    
    return true;
  });
}

// ============================================================================
// ATTACK SYSTEM - DIAGONAL LINE ATTACK
// ============================================================================
function spawnDiagonalLineAttack(startTime) {
  const originCol = Phaser.Math.Between(0, GRID_COLS);
  const originRow = Phaser.Math.Between(0, GRID_ROWS);
  
  const originX = originCol * GRID_CELL_WIDTH;
  const originY = originRow * GRID_CELL_HEIGHT;
  
  const endCol = GRID_COLS - originCol;
  const endRow = GRID_ROWS - originRow;
  
  const endX = endCol * GRID_CELL_WIDTH;
  const endY = endRow * GRID_CELL_HEIGHT;
  
  const dx = endX - originX;
  const dy = endY - originY;
  const angle = Math.atan2(dy, dx);
  
  activeAttacks.push({
    type: 'DiagonalLine',
    startTime: startTime,
    originX: originX,
    originY: originY,
    angle: angle,
    hit: false
  });
}

function checkDiagonalLineCollision(attack) {
  const { x1, y1, x2, y2 } = calculateDiagonalLineExtents(attack);
  
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  
  if (lengthSq === 0) return false;
  
  const t = Math.max(0, Math.min(1, 
    ((shipPos.x - x1) * dx + (shipPos.y - y1) * dy) / lengthSq
  ));
  
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  
  const dist = Math.sqrt((shipPos.x - projX) ** 2 + (shipPos.y - projY) ** 2);
  return dist <= SHIP_COLLISION_RADIUS;
}

function calculateDiagonalLineExtents(attack) {
  const angle = attack.angle;
  
  // Extend line to screen borders
  const maxDist = Math.sqrt(SCREEN_WIDTH * SCREEN_WIDTH + SCREEN_HEIGHT * SCREEN_HEIGHT);
  
  const x1 = attack.originX - Math.cos(angle) * maxDist;
  const y1 = attack.originY - Math.sin(angle) * maxDist;
  const x2 = attack.originX + Math.cos(angle) * maxDist;
  const y2 = attack.originY + Math.sin(angle) * maxDist;
  
  return { x1, y1, x2, y2 };
}

// ============================================================================
// RENDERING - MAIN
// ============================================================================
function render(scene, now) {
  gfx.clear();
  
  if (gameState === 'title') {
    renderGrid();
    renderTitleScreen(scene, now);
    return;
  }
  
  renderGrid();
  renderAttacks(scene, now);
  renderShip();
  
  if (gameState === 'gameover') {
    renderGameOverScreen(scene, now);
  }
}

// ============================================================================
// RENDERING - TITLE & GAME OVER
// ============================================================================
function renderTitleScreen(scene, now) {
  const fadeAlpha = Math.min(1, (now - stateChangeTime) / (FADE_DURATION_BEATS * SEC_PER_BEAT));
  
  gfx.fillStyle(0x000000, TITLE_BG_OPACITY * fadeAlpha);
  gfx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  
  drawCenteredVectorText(GAME_NAME, TEXT_CHAR_WIDTH, TEXT_CHAR_HEIGHT, 0, fadeAlpha);
}

function renderGameOverScreen(scene, now) {
  const fadeAlpha = Math.min(1, (now - stateChangeTime) / (FADE_DURATION_BEATS * SEC_PER_BEAT));
  
  gfx.fillStyle(0x000000, 0.75 * fadeAlpha);
  gfx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  
  const titleText = "game over";
  const maxWidth = SCREEN_WIDTH * 0.8;
  const charWidth = maxWidth / (titleText.length * TEXT_CHAR_SPACING);
  const charHeight = charWidth * (TEXT_CHAR_HEIGHT / TEXT_CHAR_WIDTH);
  
  drawCenteredVectorText(titleText, charWidth, charHeight, -charHeight, fadeAlpha);
}

// ============================================================================
// RENDERING - GRID
// ============================================================================
function renderGrid() {
  // Vertical lines with gradient
  for (let i = 0; i <= GRID_COLS; i++) {
    const x = i * GRID_CELL_WIDTH;
    
    for (let s = 0; s < GRID_GRADIENT_SEGMENTS; s++) {
      const y1 = (s / GRID_GRADIENT_SEGMENTS) * SCREEN_HEIGHT;
      const y2 = ((s + 1) / GRID_GRADIENT_SEGMENTS) * SCREEN_HEIGHT;
      const midY = (y1 + y2) / 2;
      const ratio = midY / SCREEN_HEIGHT;
      
      const r = Math.floor(GRID_TOP_COLOR.r * (1 - ratio) + GRID_BOT_COLOR.r * ratio);
      const g = Math.floor(GRID_TOP_COLOR.g * (1 - ratio) + GRID_BOT_COLOR.g * ratio);
      const b = Math.floor(GRID_TOP_COLOR.b * (1 - ratio) + GRID_BOT_COLOR.b * ratio);
      const color = (r << 16) | (g << 8) | b;
      
      gfx.lineStyle(GRID_LINE_WIDTH, color, 1);
      gfx.beginPath();
      gfx.moveTo(x, y1);
      gfx.lineTo(x, y2);
      gfx.strokePath();
    }
  }
  
  // Horizontal lines with gradient
  for (let i = 0; i <= GRID_ROWS; i++) {
    const y = i * GRID_CELL_HEIGHT;
    const ratio = y / SCREEN_HEIGHT;
    
    const r = Math.floor(GRID_TOP_COLOR.r * (1 - ratio) + GRID_BOT_COLOR.r * ratio);
    const g = Math.floor(GRID_TOP_COLOR.g * (1 - ratio) + GRID_BOT_COLOR.g * ratio);
    const b = Math.floor(GRID_TOP_COLOR.b * (1 - ratio) + GRID_BOT_COLOR.b * ratio);
    const color = (r << 16) | (g << 8) | b;
    
    gfx.lineStyle(GRID_LINE_WIDTH, color, 1);
    gfx.beginPath();
    gfx.moveTo(0, y);
    gfx.lineTo(SCREEN_WIDTH, y);
    gfx.strokePath();
  }
}

// ============================================================================
// RENDERING - SHIP
// ============================================================================
function renderShip() {
  gfx.lineStyle(TEXT_LINE_WIDTH, SHIP_COLOR_P1, 1);
  gfx.beginPath();
  gfx.moveTo(shipPos.x, shipPos.y - SHIP_SIZE);
  gfx.lineTo(shipPos.x - SHIP_SIZE * 0.7, shipPos.y + SHIP_SIZE * 0.5);
  gfx.lineTo(shipPos.x, shipPos.y);
  gfx.lineTo(shipPos.x + SHIP_SIZE * 0.7, shipPos.y + SHIP_SIZE * 0.5);
  gfx.closePath();
  gfx.strokePath();
}

// ============================================================================
// RENDERING - ATTACKS
// ============================================================================
function renderAttacks(scene, now) {
  activeAttacks.forEach(attack => {
    if (attack.type === 'DiagonalLine') {
      renderDiagonalLine(attack, now);
    }
  });
}

function renderDiagonalLine(attack, now) {
  const elapsed = now - attack.startTime;
  const fadeInTime = DIAGONAL_FADE_IN_BEATS * SEC_PER_BEAT;
  const chargeTime = DIAGONAL_CHARGE_BEATS * SEC_PER_BEAT;
  
  let opacity = 0;
  let lineColor = DIAGONAL_COLOR_CHARGING;
  
  // Fade in
  if (elapsed < fadeInTime) {
    opacity = elapsed / fadeInTime;
  }
  // Charge/lethal phase
  else {
    const chargeProgress = (elapsed - fadeInTime) / chargeTime;
    opacity = Math.min(1, chargeProgress);
    
    if (opacity >= DIAGONAL_COLOR_CHANGE_THRESHOLD) {
      lineColor = DIAGONAL_COLOR_LETHAL;
    }
  }
  
  const { x1, y1, x2, y2 } = calculateDiagonalLineExtents(attack);
  
  const glowWidth = DIAGONAL_LINE_WIDTH * DIAGONAL_GLOW_MULTIPLIER;
  
  // Glow
  gfx.lineStyle(glowWidth, lineColor, opacity * 0.3);
  gfx.beginPath();
  gfx.moveTo(x1, y1);
  gfx.lineTo(x2, y2);
  gfx.strokePath();
  
  // Core
  gfx.lineStyle(DIAGONAL_LINE_WIDTH, lineColor, opacity);
  gfx.beginPath();
  gfx.moveTo(x1, y1);
  gfx.lineTo(x2, y2);
  gfx.strokePath();
}

// ============================================================================
// RENDERING - TEXT (VECTOR FONT)
// ============================================================================
function drawCenteredVectorText(text, charWidth, charHeight, yOffset = 0, alpha = 1.0) {
  const totalWidth = text.length * charWidth * TEXT_CHAR_SPACING;
  const startX = (SCREEN_WIDTH - totalWidth) / 2;
  const startY = (SCREEN_HEIGHT - charHeight) / 2 + yOffset;
  drawVectorText(text, startX, startY, charWidth, charHeight, alpha);
}

function drawVectorText(text, startX, startY, charWidth, charHeight, alpha = 1.0) {
  gfx.lineStyle(TEXT_LINE_WIDTH, TEXT_COLOR, alpha);
  let currentX = startX;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const vectors = VECTOR_FONT[char.toLowerCase()];
    if (!vectors) continue;

    vectors.forEach(vector => {
      if (vector.length >= 4) {
        for (let j = 0; j < vector.length; j += 2) {
          const x1 = currentX + vector[j] * charWidth;
          const y1 = startY + vector[j + 1] * charHeight;
          if (j < vector.length - 2) {
            const x2 = currentX + vector[j + 2] * charWidth;
            const y2 = startY + vector[j + 3] * charHeight;
            gfx.beginPath();
            gfx.moveTo(x1, y1);
            gfx.lineTo(x2, y2);
            gfx.strokePath();
          }
        }
      }
    });
    currentX += charWidth * TEXT_CHAR_SPACING;
  }
}

// ============================================================================
// HELPER FUNCTIONS - GRID
// ============================================================================
function getGridIntersection(col, row) {
  return {
    x: col * GRID_CELL_WIDTH,
    y: row * GRID_CELL_HEIGHT
  };
}