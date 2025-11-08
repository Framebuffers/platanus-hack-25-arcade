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
const SYNC_WINDOW_BEATS = 0.125; // ±1/32 note tolerance for "on beat"
const MEASURES_PER_PROGRESSION = 4; // Progress every 4 measures

// ============================================================================
// GLOBAL CONSTANTS - MUSIC
// ============================================================================
const CIRCLE_OF_FIFTHS = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]; // Semitone offsets from C

// Stem data - Format: [time, midi, velocity, duration]
const STEM_BASS_1=[[0,36,.787,.125],[.125,36,.787,.125],[.25,36,.787,.125],[.375,36,.787,.125],[.546875,48,.787,.203125],[.75,36,.787,.125],[.875,48,.787,.125],[1,36,.787,.125],[1.125,48,.787,.125],[1.25,48,.787,.125],[1.375,48,.787,.125],[1.5,39,.787,.125],[1.625,48,.787,.125],[1.75,49,.787,.25],[2,36,.787,.125],[2.125,36,.787,.125],[2.25,36,.787,.125],[2.375,36,.787,.125],[2.53125,48,.787,.21875],[2.75,36,.787,.125],[2.875,48,.787,.125],[3,36,.787,.125],[3.125,48,.787,.125],[3.25,48,.787,.125],[3.375,48,.787,.125],[3.5,37,.787,.125],[3.625,48,.787,.125],[3.75,49,.787,.25],[4,36,.787,.125],[4.125,36,.787,.125],[4.25,36,.787,.125],[4.375,36,.787,.125],[4.53125,48,.787,.21875],[4.75,36,.787,.125],[4.875,48,.787,.125],[5,36,.787,.125],[5.125,48,.787,.125],[5.25,48,.787,.125],[5.375,48,.787,.125],[5.5,37,.787,.125],[5.625,48,.787,.125],[5.75,49,.787,.25],[6,35,.787,.125],[6.125,35,.787,.125],[6.25,35,.787,.125],[6.375,35,.787,.125],[6.53125,47,.787,.21875],[6.75,35,.787,.125],[6.875,47,.787,.125],[7,35,.787,.125],[7.125,47,.787,.125],[7.25,47,.787,.125],[7.375,47,.787,.125],[7.5,36,.787,.125],[7.625,47,.787,.125],[7.75,48,.787,.25]];
const STEM_BASS_2=[[0,37,.787,.125],[.125,37,.787,.125],[.25,37,.787,.125],[.375,37,.787,.125],[.5,49,.787,.197917],[.75,36,.787,.125],[.75,49,.787,.125],[.875,48,.787,.125],[1,36,.787,.125],[1.125,50,.787,.125],[1.25,50,.787,.125],[1.375,50,.787,.125],[1.5,39,.787,.125],[1.625,48,.787,.125],[1.75,49,.787,.25],[2,38,.787,.125],[2.125,38,.787,.125],[2.25,38,.787,.125],[2.375,38,.787,.125],[2.5,50,.787,.197917],[2.75,37,.787,.125],[2.75,50,.787,.125],[2.875,49,.787,.125],[3,37,.787,.125],[3.125,49,.787,.125],[3.25,49,.787,.125],[3.375,49,.787,.125],[3.5,40,.787,.125],[3.625,49,.787,.125],[3.75,48,.787,.25],[4,37,.787,.125],[4.125,37,.787,.125],[4.25,37,.787,.125],[4.375,37,.787,.125],[4.75,36,.787,.125],[5,36,.787,.125],[5,48,.787,.125],[5.125,48,.787,.125],[5.25,48,.787,.125],[5.375,48,.787,.125],[5.5,39,.787,.125],[5.625,35,.787,.375],[6,36,.787,.125],[6,60,.787,.125],[6.125,60,.787,.125],[6.25,60,.787,.125],[6.375,60,.787,.125],[6.5,35,.787,.125],[6.625,35,.787,.125],[6.75,39,.787,.125],[6.875,39,.787,.125],[7,39,.787,.125],[7.125,72,.787,.125],[7.25,72,.787,.125],[7.375,84,.787,.125],[7.5,84,.787,.125],[7.625,84,.787,.125],[7.75,48,.787,.125],[7.875,48,.787,.125]];
const STEM_BREAK_1=[[0,36,1,.25],[0,45,.756,.25],[.25,36,1,.25],[.25,45,.504,.25],[.5,37,1,.25],[.5,45,1,.25],[.75,40,1,.25],[.75,45,.504,.25],[.885417,38,1,.125],[1,40,1,.25],[1,45,.756,.25],[1.135417,38,1,.125],[1.25,36,1,.125],[1.25,45,.504,.25],[1.385417,36,.709,.125],[1.5,37,1,.375],[1.5,45,1,.25],[1.75,40,1,.25],[1.75,45,.504,.25],[2,36,1,.25],[2,45,.756,.25],[2.25,36,1,.25],[2.25,45,.504,.25],[2.5,37,1,.25],[2.5,45,1,.25],[2.75,40,1,.25],[2.75,45,.504,.25],[2.885417,38,1,.125],[3,40,1,.25],[3,45,.756,.25],[3.135417,38,1,.125],[3.25,36,1,.125],[3.25,45,.504,.25],[3.5,40,1,.25],[3.5,45,.504,.25],[3.75,37,1,.375],[3.75,45,1,.25],[4,40,1,.25],[4,45,.756,.25],[4.25,36,1,.125],[4.25,45,.504,.25],[4.385417,36,.866,.125],[4.5,37,1,.25],[4.5,45,1,.25],[4.75,40,1,.25],[4.75,45,.504,.25],[4.885417,38,1,.125],[5,40,1,.25],[5,45,.756,.25],[5.135417,38,1,.125],[5.25,36,1,.25],[5.25,43,1,.25],[5.25,45,.504,.25],[5.5,37,1,.25],[5.5,45,.756,.25],[5.75,37,1,.375],[5.75,40,1,.25],[5.75,45,.504,.25],[6,40,1,.25],[6,45,.756,.25],[6.25,36,1,.125],[6.25,45,.504,.25],[6.385417,36,.866,.125],[6.5,37,1,.25],[6.5,45,1,.25],[6.75,40,1,.25],[6.75,45,.504,.25],[6.885417,38,1,.125],[7,40,1,.25],[7,45,.756,.25],[7.135417,38,1,.125],[7.25,36,1,.25],[7.25,43,1,.25],[7.25,45,.504,.25],[7.5,37,1,.25],[7.5,45,.756,.25],[7.75,40,1,.25],[7.75,45,.504,.25]];
const STEM_BREAK_2=[[0,36,1,.25],[0,45,.756,.25],[.010417,38,1,.125],[.25,36,1,.25],[.25,45,.504,.25],[.260417,38,1,.125],[.5,37,1,.25],[.5,45,1,.25],[.75,40,1,.25],[.75,45,.504,.25],[1,38,1,.125],[1,40,1,.25],[1,45,.756,.25],[1.125,38,1,.125],[1.25,36,1,.125],[1.25,38,1,.125],[1.25,45,.504,.25],[1.375,38,1,.125],[1.385417,36,.709,.125],[1.5,37,1,.375],[1.5,38,1,.125],[1.5,45,1,.25],[1.75,40,1,.25],[1.75,45,.504,.25],[2,36,1,.25],[2,38,1,.125],[2,45,.756,.25],[2.25,36,1,.25],[2.25,38,1,.125],[2.25,45,.504,.25],[2.5,37,1,.25],[2.5,45,1,.25],[2.75,40,1,.25],[2.75,45,.504,.25],[3,40,1,.25],[3,45,.756,.25],[3.25,36,1,.125],[3.25,45,.504,.25],[3.5,40,1,.25],[3.5,45,.504,.25],[3.75,37,1,.375],[3.75,38,.787,.25],[3.75,45,1,.25],[4,40,1,.25],[4,45,.756,.25],[4.25,36,1,.125],[4.25,45,.504,.25],[4.385417,36,.866,.125],[4.5,37,1,.25],[4.5,45,1,.25],[4.75,40,1,.25],[4.75,45,.504,.25],[5,40,1,.25],[5,45,.756,.25],[5.010417,38,1,.125],[5.135417,38,1,.125],[5.25,36,1,.25],[5.25,43,1,.25],[5.25,45,.504,.25],[5.260417,38,1,.125],[5.385417,38,1,.114583],[5.5,37,1,.25],[5.5,38,1,.125],[5.5,45,.756,.25],[5.75,40,1,.25],[5.75,45,.504,.25],[6,36,1,.25],[6,45,.756,.25],[6.25,36,1,.25],[6.25,45,.504,.25],[6.5,37,1,.25],[6.5,45,1,.25],[6.75,40,1,.25],[6.75,45,.504,.25],[7,40,1,.25],[7,45,.756,.25],[7.010417,38,1,.125],[7.135417,38,1,.125],[7.25,36,1,.125],[7.25,45,.504,.25],[7.260417,38,1,.125],[7.385417,38,1,.114583],[7.5,38,1,.125],[7.5,40,1,.25],[7.5,45,.504,.25],[7.75,37,1,.375],[7.75,45,1,.25]];
const STEM_DURATION=8;

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

// Grid flash feedback
const GRID_FLASH_DURATION = 0.1; // Flash duration in seconds
const GRID_FLASH_INTENSITY = 0.5; // Additional brightness on beat


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
const DIAGONAL_EXPLOSION_FADE_TIME = 1.0; // Ray explosion fade duration in seconds
const DIAGONAL_EXPLOSION_SIZE_MULTIPLIER = 3.0; // 300% size for explosion

// ============================================================================
// GLOBAL CONSTANTS - GRID CELL ATTACK
// ============================================================================
const CELL_TELEGRAPH_BEATS = 2; // Warning phase duration
const CELL_ACTIVE_BEATS = 0.1; // Lethal phase duration (instant)
const CELL_TELEGRAPH_COLOR = 0xFFFF00; // Yellow warning
const CELL_ACTIVE_COLOR = 0xFF0000; // Red lethal
const CELL_GLOW_COLOR = 0xFF6600; // Orange glow
const CELL_ATTACK_INTERVAL_BEATS = 12; // Spawn every 1.5 bars
const CELL_GLOW_FADE_TIME = 1.0; // Glow fade duration in seconds

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
const SCORE_FLASH_DURATION = 0.2; // Duration for red flash on off-beat
const SCORE_COLOR_ERROR = 0xff0000; // Red for off-beat

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
let currentKeyIndex = 0; // Current position in circle of fifths
let measureCount = 0; // Current measure (0-3)
let lastBeatFlashTime = 0; // Last time grid flashed
let lastInputTime = -999; // Last player input time
let lastInputWasSynced = false; // Was last input on beat?
let scoreFlashTime = 0; // Time when score should flash red
let audioCtx = null; // Web Audio context
let currentBassStem = null; // Current bass pattern
let currentBreakStem = null; // Current break pattern
let musicStartTime = 0; // When music started
let scheduledNodes = []; // Track all scheduled audio nodes for cleanup

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
let nextCellAttackTime = 0;
let activeParticles = [];
let activeGlows = []; // Glowing tile effects
let activeRayExplosions = []; // Ray explosion effects

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

  // Initialize audio context and select random stems
  audioCtx = scene.sound.context;
  currentKeyIndex = Phaser.Math.Between(0, CIRCLE_OF_FIFTHS.length - 1);
  currentBassStem = Phaser.Math.RND.pick([STEM_BASS_1, STEM_BASS_2]);
  currentBreakStem = Phaser.Math.RND.pick([STEM_BREAK_1, STEM_BREAK_2]);

  // Add action buttons for rhythm input
  const actionKeys = scene.input.keyboard.addKeys({
    SPACE: 'SPACE',
    P1A: 'Z', P1B: 'X', P1C: 'C',
    P1X: 'A', P1Y: 'S', P1Z: 'D',
    P2A: 'N', P2B: 'M', P2C: 'COMMA',
    P2X: 'H', P2Y: 'J', P2Z: 'K'
  });
  
  scene.input.keyboard.on('keydown', (event) => {
    if (gameState === 'title') {
      startGame(scene);
    } else if (gameState === 'gameover') {
      restartGame(scene);
    } else if (gameState === 'level') {
      // Check rhythm timing on any action key
      const actionKeysList = ['SPACE', 'Z', 'X', 'C', 'N', 'M', 'COMMA', 'H', 'J', 'K'];
      if (actionKeysList.includes(event.key.toUpperCase())) {
        handleRhythmInput(scene);
      }
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
    updateParticles(now);
    updateGlows(now);
    updateRayExplosions(now);

    // Loop music patterns every STEM_DURATION seconds
    if (now - musicStartTime >= STEM_DURATION) {
      musicStartTime += STEM_DURATION;
      schedulePattern(currentBassStem, musicStartTime, true);
      schedulePattern(currentBreakStem, musicStartTime, false);
    }
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
  activeParticles = [];
  activeGlows = [];
  activeRayExplosions = [];

  nextAttackTime = now + (DIAGONAL_ATTACK_INTERVAL_BEATS * SEC_PER_BEAT);
  nextCellAttackTime = now + (CELL_ATTACK_INTERVAL_BEATS * SEC_PER_BEAT);

  // Stop any existing music and start fresh
  stopAllMusic();
  musicStartTime = now;
  schedulePattern(currentBassStem, now, true);
  schedulePattern(currentBreakStem, now, false);
}

function restartGame(scene) {
  startGame(scene);
}

function triggerGameOver(scene) {
  stateChangeTime = scene.sound.context.currentTime;
  gameState = 'gameover';
  stopAllMusic();
}

// ============================================================================
// BEAT TRACKING
// ============================================================================
function updateBeatTracking(now) {
  const oldBeat = globalBeat;
  
  while (now > lastBeatTime + SEC_PER_BEAT) {
    lastBeatTime += SEC_PER_BEAT;
    globalBeat++;
    
    // Flash grid on each beat
    lastBeatFlashTime = now;
    
    // Check measure boundaries (every 4 beats)
    if (globalBeat % BEATS_PER_BAR === 0) {
      onMeasureComplete(now);
    }
  }
}

// ============================================================================
// MUSIC SYSTEM - RHYTHM INPUT
// ============================================================================
function handleRhythmInput(scene) {
  const now = scene.sound.context.currentTime;
  lastInputTime = now;
  
  // Calculate current beat position (fractional)
  const timeSinceBeatStart = now - lastBeatTime;
  const beatProgress = timeSinceBeatStart / SEC_PER_BEAT;
  
  // Check if within sync window of any quarter note
  const distanceToNearestBeat = Math.min(beatProgress, 1 - beatProgress);
  const isOnBeat = distanceToNearestBeat <= SYNC_WINDOW_BEATS;
  
  lastInputWasSynced = isOnBeat;
  
  if (!isOnBeat) {
    // Flash score red on off-beat input
    scoreFlashTime = now;
  }
}

function onMeasureComplete(now) {
  measureCount++;
  
  if (measureCount >= MEASURES_PER_PROGRESSION) {
    measureCount = 0;
    // Progress through circle of fifths
    currentKeyIndex = (currentKeyIndex + 1) % CIRCLE_OF_FIFTHS.length;
  }
}

// ============================================================================
// MUSIC SYSTEM - RHYTHM INPUT
// ============================================================================
function handleRhythmInput(scene) {
  const now = scene.sound.context.currentTime;
  lastInputTime = now;
  
  // Calculate current beat position (fractional)
  const timeSinceBeatStart = now - lastBeatTime;
  const beatProgress = timeSinceBeatStart / SEC_PER_BEAT;
  
  // Check if within sync window of any quarter note
  const distanceToNearestBeat = Math.min(beatProgress, 1 - beatProgress);
  const isOnBeat = distanceToNearestBeat <= SYNC_WINDOW_BEATS;
  
  lastInputWasSynced = isOnBeat;
  
  if (!isOnBeat) {
    // Flash score red on off-beat input
    scoreFlashTime = now;
  }
}

function onMeasureComplete(now) {
  measureCount++;
  
  if (measureCount >= MEASURES_PER_PROGRESSION) {
    measureCount = 0;
    // Progress through circle of fifths
    currentKeyIndex = (currentKeyIndex + 1) % CIRCLE_OF_FIFTHS.length;
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
  // Spawn diagonal line attacks
  if (now >= nextAttackTime && gameState === 'level') {
    spawnDiagonalLineAttack(now);
    nextAttackTime = now + (DIAGONAL_ATTACK_INTERVAL_BEATS * SEC_PER_BEAT);
  }

  // Spawn cell attacks
  if (now >= nextCellAttackTime && gameState === 'level') {
    spawnCellAttack(now);
    nextCellAttackTime = now + (CELL_ATTACK_INTERVAL_BEATS * SEC_PER_BEAT);
  }

  activeAttacks = activeAttacks.filter(attack => {
    if (attack.type === 'DiagonalLine') {
      return updateDiagonalLineAttack(attack, scene, now);
    } else if (attack.type === 'GridCell') {
      return updateGridCellAttack(attack, scene, now);
    }
    return true;
  });
}

function updateDiagonalLineAttack(attack, scene, now) {
  const elapsed = now - attack.startTime;
  const fadeInTime = DIAGONAL_FADE_IN_BEATS * SEC_PER_BEAT;
  const chargeTime = DIAGONAL_CHARGE_BEATS * SEC_PER_BEAT;
  const totalDuration = fadeInTime + chargeTime;

  if (elapsed >= totalDuration) {
    // Spawn explosion when ray completes
    if (!attack.exploded) {
      spawnRayExplosion(attack, now);
      attack.exploded = true;
    }
    return false;
  }

  // Calculate opacity to check if ray is red
  let opacity = 0;
  if (elapsed < fadeInTime) {
    opacity = elapsed / fadeInTime;
  } else {
    const chargeProgress = (elapsed - fadeInTime) / chargeTime;
    opacity = Math.min(1, chargeProgress);
  }

  // Only check collision when FULLY in lethal phase (after fade-in complete and red)
  if (!attack.hit && elapsed >= fadeInTime && opacity >= DIAGONAL_COLOR_CHANGE_THRESHOLD) {
    if (checkDiagonalLineCollision(attack)) {
      attack.hit = true;
      triggerGameOver(scene);
    }
  }

  return true;
}

function updateGridCellAttack(attack, scene, now) {
  const elapsed = now - attack.startTime;
  const telegraphTime = CELL_TELEGRAPH_BEATS * SEC_PER_BEAT;
  const activeTime = CELL_ACTIVE_BEATS * SEC_PER_BEAT;
  const totalDuration = telegraphTime + activeTime;

  if (elapsed >= totalDuration) return false;

  // Transition from telegraph to active phase
  if (elapsed >= telegraphTime && !attack.activated) {
    attack.activated = true;
    spawnCellExplosion(attack);
  }

  // Check collision during active phase
  if (attack.activated && !attack.hit) {
    if (checkCellCollision(attack)) {
      attack.hit = true;
      triggerGameOver(scene);
    }
  }

  return true;
}

// ============================================================================
// ATTACK SYSTEM - DIAGONAL LINE ATTACK
// ============================================================================
function spawnDiagonalLineAttack(startTime) {
  const SAFE_ZONE_RADIUS = 80; // Don't spawn lines too close to player
  let attempts = 0;
  let validLine = false;
  let originX, originY, angle;

  // Try to find a line that doesn't pass through player's current position
  while (!validLine && attempts < 10) {
    const originCol = Phaser.Math.Between(0, GRID_COLS);
    const originRow = Phaser.Math.Between(0, GRID_ROWS);

    originX = originCol * GRID_CELL_WIDTH;
    originY = originRow * GRID_CELL_HEIGHT;

    const endCol = GRID_COLS - originCol;
    const endRow = GRID_ROWS - originRow;

    const endX = endCol * GRID_CELL_WIDTH;
    const endY = endRow * GRID_CELL_HEIGHT;

    const dx = endX - originX;
    const dy = endY - originY;
    angle = Math.atan2(dy, dx);

    // Calculate distance from player to line
    const lineLength = Math.sqrt(dx * dx + dy * dy);
    if (lineLength === 0) {
      attempts++;
      continue;
    }

    const t = Math.max(0, Math.min(1,
      ((shipPos.x - originX) * dx + (shipPos.y - originY) * dy) / (lineLength * lineLength)
    ));

    const projX = originX + t * dx;
    const projY = originY + t * dy;
    const distToPlayer = Math.sqrt((shipPos.x - projX) ** 2 + (shipPos.y - projY) ** 2);

    if (distToPlayer > SAFE_ZONE_RADIUS) {
      validLine = true;
    }

    attempts++;
  }

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

function calculateDiagonalLineExtentsFromData(originX, originY, angle) {
  // Extend line to screen borders
  const maxDist = Math.sqrt(SCREEN_WIDTH * SCREEN_WIDTH + SCREEN_HEIGHT * SCREEN_HEIGHT);

  const x1 = originX - Math.cos(angle) * maxDist;
  const y1 = originY - Math.sin(angle) * maxDist;
  const x2 = originX + Math.cos(angle) * maxDist;
  const y2 = originY + Math.sin(angle) * maxDist;

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
  renderGlows(now);
  renderRayExplosions(now);
  renderParticles(now);
  renderShip();
  renderScore();
  
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

// ========================================================================
// RENDERING - GRID
// ============================================================================
function renderGrid() {
  const now = gameState === 'level' ? gfx.scene.sound.context.currentTime : 0;
  const timeSinceFlash = now - lastBeatFlashTime;
  const flashIntensity = timeSinceFlash < GRID_FLASH_DURATION 
    ? (1 - timeSinceFlash / GRID_FLASH_DURATION) * GRID_FLASH_INTENSITY 
    : 0;
  
  // Vertical lines with gradient
  for (let i = 0; i <= GRID_COLS; i++) {
    const x = i * GRID_CELL_WIDTH;
    
    for (let s = 0; s < GRID_GRADIENT_SEGMENTS; s++) {
      const y1 = (s / GRID_GRADIENT_SEGMENTS) * SCREEN_HEIGHT;
      const y2 = ((s + 1) / GRID_GRADIENT_SEGMENTS) * SCREEN_HEIGHT;
      const midY = (y1 + y2) / 2;
      const ratio = midY / SCREEN_HEIGHT;
      
      let r = Math.floor(GRID_TOP_COLOR.r * (1 - ratio) + GRID_BOT_COLOR.r * ratio);
      let g = Math.floor(GRID_TOP_COLOR.g * (1 - ratio) + GRID_BOT_COLOR.g * ratio);
      let b = Math.floor(GRID_TOP_COLOR.b * (1 - ratio) + GRID_BOT_COLOR.b * ratio);
      
      // Apply flash intensity
      r = Math.min(255, Math.floor(r + 255 * flashIntensity));
      g = Math.min(255, Math.floor(g + 255 * flashIntensity));
      b = Math.min(255, Math.floor(b + 255 * flashIntensity));
      
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
    
    let r = Math.floor(GRID_TOP_COLOR.r * (1 - ratio) + GRID_BOT_COLOR.r * ratio);
    let g = Math.floor(GRID_TOP_COLOR.g * (1 - ratio) + GRID_BOT_COLOR.g * ratio);
    let b = Math.floor(GRID_TOP_COLOR.b * (1 - ratio) + GRID_BOT_COLOR.b * ratio);
    
    // Apply flash intensity
    r = Math.min(255, Math.floor(r + 255 * flashIntensity));
    g = Math.min(255, Math.floor(g + 255 * flashIntensity));
    b = Math.min(255, Math.floor(b + 255 * flashIntensity));
    
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

function renderScore() {
  if (gameState !== 'level') return;
  
  const now = gfx.scene.sound.context.currentTime;
  const timeSinceScoreFlash = now - scoreFlashTime;
  const isFlashing = timeSinceScoreFlash < SCORE_FLASH_DURATION;
  
  const scoreColor = isFlashing ? SCORE_COLOR_ERROR : TEXT_COLOR;
  const scoreText = `key ${currentKeyIndex}`;
  
  drawVectorText(scoreText, 25, 25, 20, 30, 1.0, scoreColor);
}

// ============================================================================
// RENDERING - ATTACKS
// ============================================================================
function renderAttacks(scene, now) {
  activeAttacks.forEach(attack => {
    if (attack.type === 'DiagonalLine') {
      renderDiagonalLine(attack, now);
    } else if (attack.type === 'GridCell') {
      renderGridCell(attack, now);
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

function renderGridCell(attack, now) {
  const elapsed = now - attack.startTime;
  const telegraphTime = CELL_TELEGRAPH_BEATS * SEC_PER_BEAT;

  let cellColor = CELL_TELEGRAPH_COLOR;
  let opacity = 0;

  if (elapsed < telegraphTime) {
    // Telegraph phase - pulse effect
    const progress = elapsed / telegraphTime;
    opacity = 0.3 + 0.3 * Math.sin(progress * Math.PI * 4); // Pulsing
    cellColor = CELL_TELEGRAPH_COLOR;
  } else {
    // Active phase
    opacity = 0.6;
    cellColor = CELL_ACTIVE_COLOR;
  }

  const x = attack.col * GRID_CELL_WIDTH;
  const y = attack.row * GRID_CELL_HEIGHT;

  gfx.fillStyle(cellColor, opacity);
  gfx.fillRect(x, y, GRID_CELL_WIDTH, GRID_CELL_HEIGHT);
}

// ============================================================================
// RENDERING - PARTICLES
// ============================================================================
function renderParticles(now) {
  activeParticles.forEach(p => {
    const age = now - p.birthTime;
    const lifeRatio = 1 - (age / p.life);

    if (lifeRatio > 0) {
      const size = 3 * lifeRatio;
      const alpha = lifeRatio;

      gfx.fillStyle(CELL_ACTIVE_COLOR, alpha);
      gfx.fillCircle(p.x, p.y, size);
    }
  });
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

function drawVectorText(text, startX, startY, charWidth, charHeight, alpha = 1.0, color = TEXT_COLOR) {
  gfx.lineStyle(TEXT_LINE_WIDTH, color, alpha);
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
// ATTACK SYSTEM - GRID CELL ATTACK
// ============================================================================
function spawnCellAttack(startTime) {
  const patterns = [
    () => spawnRowPattern(),
    () => spawnColumnPattern(),
    () => spawnCheckerboardPattern(),
    () => spawnRandomCellsPattern()
  ];

  const pattern = Phaser.Math.RND.pick(patterns);
  const cells = pattern();

  cells.forEach(cell => {
    activeAttacks.push({
      type: 'GridCell',
      startTime: startTime,
      col: cell.col,
      row: cell.row,
      activated: false,
      hit: false
    });
  });
}

function spawnRowPattern() {
  const row = Phaser.Math.Between(0, GRID_ROWS - 1);
  const cells = [];
  for (let col = 0; col < GRID_COLS; col++) {
    cells.push({ col, row });
  }
  return cells;
}

function spawnColumnPattern() {
  const col = Phaser.Math.Between(0, GRID_COLS - 1);
  const cells = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    cells.push({ col, row });
  }
  return cells;
}

function spawnCheckerboardPattern() {
  const offset = Phaser.Math.Between(0, 1);
  const cells = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      if ((row + col + offset) % 2 === 0) {
        cells.push({ col, row });
      }
    }
  }
  return cells;
}

function spawnRandomCellsPattern() {
  const count = Phaser.Math.Between(3, 8);
  const cells = [];
  for (let i = 0; i < count; i++) {
    cells.push({
      col: Phaser.Math.Between(0, GRID_COLS - 1),
      row: Phaser.Math.Between(0, GRID_ROWS - 1)
    });
  }
  return cells;
}

function checkCellCollision(attack) {
  const cellMinX = attack.col * GRID_CELL_WIDTH;
  const cellMaxX = (attack.col + 1) * GRID_CELL_WIDTH;
  const cellMinY = attack.row * GRID_CELL_HEIGHT;
  const cellMaxY = (attack.row + 1) * GRID_CELL_HEIGHT;

  return shipPos.x >= cellMinX && shipPos.x <= cellMaxX &&
         shipPos.y >= cellMinY && shipPos.y <= cellMaxY;
}

// ============================================================================
// GLOW SYSTEM
// ============================================================================
function spawnCellExplosion(attack) {
  const explosionTime = attack.startTime + (CELL_TELEGRAPH_BEATS * SEC_PER_BEAT);

  // Glow the center tile and surrounding 8 tiles
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const glowCol = attack.col + dx;
      const glowRow = attack.row + dy;

      // Check bounds
      if (glowCol >= 0 && glowCol < GRID_COLS && glowRow >= 0 && glowRow < GRID_ROWS) {
        activeGlows.push({
          col: glowCol,
          row: glowRow,
          birthTime: explosionTime
        });
      }
    }
  }
}

function updateParticles(now) {
  activeParticles = activeParticles.filter(p => {
    const age = now - p.birthTime;
    if (age >= p.life) return false;

    const dt = 1 / 60; // Approximate frame time
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    return true;
  });
}

function updateGlows(now) {
  activeGlows = activeGlows.filter(glow => {
    const age = now - glow.birthTime;
    return age < CELL_GLOW_FADE_TIME;
  });
}

function renderGlows(now) {
  activeGlows.forEach(glow => {
    const age = now - glow.birthTime;
    const fadeRatio = 1 - (age / CELL_GLOW_FADE_TIME);

    if (fadeRatio > 0) {
      const x = glow.col * GRID_CELL_WIDTH;
      const y = glow.row * GRID_CELL_HEIGHT;
      const opacity = 0.5 * fadeRatio;

      gfx.fillStyle(CELL_GLOW_COLOR, opacity);
      gfx.fillRect(x, y, GRID_CELL_WIDTH, GRID_CELL_HEIGHT);
    }
  });
}

// ============================================================================
// RAY EXPLOSION SYSTEM
// ============================================================================
function spawnRayExplosion(attack, explosionTime) {
  activeRayExplosions.push({
    originX: attack.originX,
    originY: attack.originY,
    angle: attack.angle,
    birthTime: explosionTime
  });
}

function updateRayExplosions(now) {
  activeRayExplosions = activeRayExplosions.filter(explosion => {
    const age = now - explosion.birthTime;
    return age < DIAGONAL_EXPLOSION_FADE_TIME;
  });
}

function renderRayExplosions(now) {
  activeRayExplosions.forEach(explosion => {
    const age = now - explosion.birthTime;
    const fadeRatio = 1 - (age / DIAGONAL_EXPLOSION_FADE_TIME);

    if (fadeRatio > 0) {
      const { x1, y1, x2, y2 } = calculateDiagonalLineExtentsFromData(
        explosion.originX,
        explosion.originY,
        explosion.angle
      );

      // Calculate expanded glow width (300% of normal)
      const baseGlowWidth = DIAGONAL_LINE_WIDTH * DIAGONAL_GLOW_MULTIPLIER;
      const explosionWidth = baseGlowWidth * DIAGONAL_EXPLOSION_SIZE_MULTIPLIER;
      const opacity = 0.3 * fadeRatio;

      // Draw expanded explosion glow
      gfx.lineStyle(explosionWidth, DIAGONAL_COLOR_LETHAL, opacity);
      gfx.beginPath();
      gfx.moveTo(x1, y1);
      gfx.lineTo(x2, y2);
      gfx.strokePath();
    }
  });
}

// ============================================================================
// AUDIO SYNTHESIS
// ============================================================================
function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function stopAllMusic() {
  scheduledNodes.forEach(node => {
    try {
      node.stop();
    } catch (e) {
      // Node might already be stopped
    }
  });
  scheduledNodes = [];
}

function playBassNote(time, midi, velocity, duration) {
  if (!audioCtx) return;

  const transposedMidi = midi + CIRCLE_OF_FIFTHS[currentKeyIndex];
  const freq = midiToFreq(transposedMidi);

  // TB-303 style square wave bass
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = 'square';
  osc.frequency.value = freq;

  // Resonant lowpass filter
  filter.type = 'lowpass';
  filter.Q.value = 8 + velocity * 12; // Accent affects resonance
  filter.frequency.setValueAtTime(freq * 2, time);
  filter.frequency.exponentialRampToValueAtTime(freq * 0.5, time + 0.05);

  // Amplitude envelope
  gain.gain.setValueAtTime(velocity * 0.3, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(time);
  osc.stop(time + duration);
  scheduledNodes.push(osc);
}

function playDrum(time, midi, velocity, duration) {
  if (!audioCtx) return;

  switch(midi) {
    case 36: // Kick
      playKickDrum(time, velocity);
      break;
    case 37: // Rim
      playRimShot(time, velocity);
      break;
    case 38: // Snare
      playSnare(time, velocity);
      break;
    case 40: // Tom (low)
      playTom(time, 110, velocity);
      break;
    case 43: // Tom (mid)
      playTom(time, 165, velocity);
      break;
    case 45: // Tom (high)
      playTom(time, 220, velocity);
      break;
    case 42: // Closed Hat
      playHat(time, velocity, 0.05);
      break;
    case 46: // Open Hat
      playHat(time, velocity, 0.15);
      break;
  }
}

function playKickDrum(time, velocity) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.frequency.setValueAtTime(120, time);
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.05);

  gain.gain.setValueAtTime(velocity * 0.8, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(time);
  osc.stop(time + 0.15);
  scheduledNodes.push(osc);
}

function playSnare(time, velocity) {
  // Noise component
  const noise = audioCtx.createBufferSource();
  const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.1, audioCtx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noise.buffer = noiseBuffer;

  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 2000;

  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(velocity * 0.25, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

  // Tone component
  const osc = audioCtx.createOscillator();
  const oscGain = audioCtx.createGain();

  osc.frequency.value = 180;
  oscGain.gain.setValueAtTime(velocity * 0.15, time);
  oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);

  osc.connect(oscGain);
  oscGain.connect(audioCtx.destination);

  noise.start(time);
  osc.start(time);
  osc.stop(time + 0.08);
  scheduledNodes.push(noise);
  scheduledNodes.push(osc);
}

function playRimShot(time, velocity) {
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc1.frequency.value = 400;
  osc2.frequency.value = 1200;

  gain.gain.setValueAtTime(velocity * 0.4, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(audioCtx.destination);

  osc1.start(time);
  osc2.start(time);
  osc1.stop(time + 0.03);
  osc2.stop(time + 0.03);
  scheduledNodes.push(osc1);
  scheduledNodes.push(osc2);
}

function playTom(time, freq, velocity) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.frequency.setValueAtTime(freq, time);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.5, time + 0.08);

  gain.gain.setValueAtTime(velocity * 0.6, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(time);
  osc.stop(time + 0.15);
  scheduledNodes.push(osc);
}

function playHat(time, velocity, duration) {
  const noise = audioCtx.createBufferSource();
  const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * duration, audioCtx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noise.buffer = noiseBuffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 7000;

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(velocity * 0.2, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  noise.start(time);
  scheduledNodes.push(noise);
}

function schedulePattern(stem, startTime, isBass) {
  if (!audioCtx || !stem) return;

  stem.forEach(note => {
    const [time, midi, velocity, duration] = note;
    const absoluteTime = startTime + time;

    if (isBass) {
      playBassNote(absoluteTime, midi, velocity, duration);
    } else {
      playDrum(absoluteTime, midi, velocity, duration);
    }
  });
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

// normal: #F2F2F2, #90C7F2, #01B2CB, #B080F2, #B527F2, #BD21BF]
// type_2: #18F0C8, #17A389, #F0BC0C, #E800F0, #9E10A3]
// stress: #FF0B00, #BF0800, #800600, #E60A00, #400300]