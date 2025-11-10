// ============================================================================
// PHASER CONFIG
// ============================================================================
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#0d0d0d',
  banner: false,
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
const BPM_NORMAL = 120;
const BPM_STRESS = 190;
const BEATS_PER_BAR = 4;
const SYNC_WINDOW_BEATS = 0.125; // ±1/32 note tolerance for "on beat"
const MEASURES_PER_PROGRESSION = 4; // Progress every 4 measures

// Dynamic timing (calculated per frame based on current BPM)
let currentBPM = BPM_NORMAL;
let SEC_PER_BEAT = 60 / currentBPM;
let SEC_PER_BAR = BEATS_PER_BAR * SEC_PER_BEAT;

// ============================================================================
// GLOBAL CONSTANTS - MUSIC
// ============================================================================
const CIRCLE_OF_FIFTHS = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]; // Semitone offsets from C

// Stem data - Format: [time, midi, velocity, duration]
// STEM_KICK: Simple 4/4 kick pattern (4 kicks per 2 beats, repeated 4 times for 8 beats)
const STEM_KICK=[[0,36,.787,.125],[.5,36,.787,.125],[1,36,.787,.125],[1.5,36,.787,.125],[2,36,.787,.125],[2.5,36,.787,.125],[3,36,.787,.125],[3.5,36,.787,.125],[4,36,.787,.125],[4.5,36,.787,.125],[5,36,.787,.125],[5.5,36,.787,.125],[6,36,.787,.125],[6.5,36,.787,.125],[7,36,.787,.125],[7.5,36,.787,.125]];
// STEM_NORMAL: Normal mode melody (C2, C3 bass pattern, looped to 8 beats)
const STEM_NORMAL=[[0,36,1,.068],[.25,36,.504,.073],[.375,48,1,.068],[.625,36,.504,.068],[.75,36,.504,.068],[1,36,1,.068],[1.12,36,.504,.078],[1.245,48,.504,.073],[1.375,36,.504,.073],[1.625,36,.504,.068],[1.75,36,.504,.068],[2,36,1,.068],[2.25,36,.504,.073],[2.375,48,1,.068],[2.625,36,.504,.068],[2.75,36,.504,.068],[3,36,1,.068],[3.12,36,.504,.078],[3.245,48,.504,.073],[3.375,36,.504,.073],[3.625,36,.504,.068],[3.75,36,.504,.068],[4,36,1,.068],[4.25,36,.504,.073],[4.375,48,1,.068],[4.625,36,.504,.068],[4.75,36,.504,.068],[5,36,1,.068],[5.12,36,.504,.078],[5.245,48,.504,.073],[5.375,36,.504,.073],[5.625,36,.504,.068],[5.75,36,.504,.068],[6,36,1,.068],[6.25,36,.504,.073],[6.375,48,1,.068],[6.625,36,.504,.068],[6.75,36,.504,.068],[7,36,1,.068],[7.12,36,.504,.078],[7.245,48,.504,.073],[7.375,36,.504,.073],[7.625,36,.504,.068],[7.75,36,.504,.068]];
// STEM_STRESS: Stress mode melody (G#1, G#2, C1, A3 pattern, looped to 8 beats)
const STEM_STRESS=[[0,32,1,.068],[.125,32,1,.073],[.25,32,1,.073],[.375,44,.504,.141],[.5,32,.504,.156],[.641,44,.504,.141],[.766,32,.504,.141],[.891,44,.504,.125],[1,24,.504,.219],[1.245,57,1,.193],[1.5,33,.504,.073],[1.641,57,1,.068],[1.766,57,1,.068],[1.891,57,1,.068],[2,32,1,.068],[2.125,32,1,.073],[2.25,32,1,.073],[2.375,44,.504,.141],[2.5,32,.504,.156],[2.641,44,.504,.141],[2.766,32,.504,.141],[2.891,44,.504,.125],[3,24,.504,.219],[3.245,57,1,.193],[3.5,33,.504,.073],[3.641,57,1,.068],[3.766,57,1,.068],[3.891,57,1,.068],[4,32,1,.068],[4.125,32,1,.073],[4.25,32,1,.073],[4.375,44,.504,.141],[4.5,32,.504,.156],[4.641,44,.504,.141],[4.766,32,.504,.141],[4.891,44,.504,.125],[5,24,.504,.219],[5.245,57,1,.193],[5.5,33,.504,.073],[5.641,57,1,.068],[5.766,57,1,.068],[5.891,57,1,.068],[6,32,1,.068],[6.125,32,1,.073],[6.25,32,1,.073],[6.375,44,.504,.141],[6.5,32,.504,.156],[6.641,44,.504,.141],[6.766,32,.504,.141],[6.891,44,.504,.125],[7,24,.504,.219],[7.245,57,1,.193],[7.5,33,.504,.073],[7.641,57,1,.068],[7.766,57,1,.068],[7.891,57,1,.068]];
// STEM_STRESS_TYPE2_DRUMS: Complex drum pattern for stress and type2 phases (74 notes, 8 beats)
const STEM_STRESS_TYPE2_DRUMS=[[0,36,1,.375],[0,46,.906,.125],[.25,40,1,.25],[.25,46,.906,.125],[.5,37,1,.125],[.5,46,.906,.125],[.75,36,1,.125],[.75,40,1,.25],[.75,46,.906,.125],[1,46,.906,.125],[1.25,37,1,.375],[1.25,40,1,.25],[1.25,46,.906,.125],[1.5,40,1,.125],[1.5,46,.906,.125],[1.635,38,1,.125],[1.75,40,1,.25],[1.75,46,.906,.125],[2,36,1,.5],[2,43,.787,.375],[2,46,.906,.125],[2.25,40,1,.25],[2.25,46,.906,.125],[2.5,37,1,.125],[2.5,46,.906,.125],[2.75,36,1,.125],[2.75,40,1,.25],[2.75,46,.906,.125],[3,46,.906,.125],[3.25,37,1,.375],[3.25,40,1,.25],[3.25,46,.906,.125],[3.5,40,1,.125],[3.5,46,.906,.125],[3.635,38,1,.125],[3.75,40,1,.25],[3.75,46,.906,.125],[4,36,1,.375],[4,46,.906,.125],[4.25,40,1,.25],[4.25,46,.906,.125],[4.5,37,1,.125],[4.5,46,.906,.125],[4.75,36,1,.125],[4.75,40,1,.25],[4.75,46,.906,.125],[5,46,.906,.125],[5.25,37,1,.375],[5.25,40,1,.25],[5.25,46,.906,.125],[5.5,40,1,.125],[5.5,46,.906,.125],[5.635,38,1,.125],[5.75,40,1,.25],[5.75,46,.906,.125],[6,36,1,.5],[6,43,.787,.375],[6,46,.906,.125],[6.25,40,1,.25],[6.25,46,.906,.125],[6.5,37,1,.125],[6.5,46,.906,.125],[6.75,36,1,.125],[6.75,40,1,.25],[6.75,46,.906,.125],[7,46,.906,.125],[7.25,37,1,.375],[7.25,40,1,.25],[7.25,46,.906,.125],[7.5,40,1,.125],[7.5,46,.906,.125],[7.635,38,1,.125],[7.75,40,1,.25],[7.75,46,.906,.125]];
const STEM_BEATS=8; // All stems are 8 beats (2 bars) long

// ============================================================================
// GLOBAL CONSTANTS - GRID
// ============================================================================
const GRID_COLS = 8;
const GRID_ROWS = 8;
const GRID_LINE_WIDTH = 1;
const GRID_CELL_WIDTH = SCREEN_WIDTH / GRID_COLS;
const GRID_CELL_HEIGHT = SCREEN_HEIGHT / GRID_ROWS;

// Color palettes (hex colors)
const PALETTE_NORMAL = [0xF2F2F2, 0x90C7F2, 0x01B2CB, 0xB080F2, 0xB527F2, 0xBD21BF];
const PALETTE_TYPE_2 = [0x18F0C8, 0x17A389, 0xF0BC0C, 0xE800F0, 0x9E10A3];
const PALETTE_STRESS = [0xFF0B00, 0xBF0800, 0x800600, 0xE60A00, 0x400300];

// Background colors for each phase
const BG_NORMAL = 0x0d0d0d;
const BG_STRESS = 0x1a0000; // Dark red tint
const BG_TYPE_2 = 0x0f0f0f; // Lighter gray
let currentBgColor = BG_NORMAL;

// Cycle timing (in bars) - aligned with 2-bar stems (8 beats each)
const CYCLE_NORMAL_BARS = 8;  // 3 stems (6 bars = 24 beats)
const CYCLE_STRESS_BARS = 8;  // 2 stems (6 bars = 24 beats)
const CYCLE_TYPE2_BARS = 4;   // 3 stems (6 bars = 24 beats) - matches normal
const CYCLE_TOTAL_BARS = CYCLE_NORMAL_BARS + CYCLE_STRESS_BARS + CYCLE_TYPE2_BARS; // 16 bars

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
const DIAGONAL_CHARGE_BEATS = 3.75; // Just under 1 bar - gives 4 beats total to escape
const DIAGONAL_COLOR_CHANGE_THRESHOLD = 0.75; // 75% opacity
const DIAGONAL_LINE_WIDTH = 2;
const DIAGONAL_COLOR_CHARGING = 0xFFFFFF;
const DIAGONAL_COLOR_LETHAL = 0xFF0000;
const DIAGONAL_GLOW_MULTIPLIER = 5;
const DIAGONAL_ATTACK_INTERVAL_BEATS = 4; // Spawn every bar (2x faster)
const DIAGONAL_EXPLOSION_FADE_TIME = 0.4; // Ray explosion fade duration in seconds
const DIAGONAL_EXPLOSION_SIZE_MULTIPLIER = 3.0; // 300% size for explosion

// Pivoting ray pattern
const PIVOT_ORIGIN_OFFSET_TILES = 2; // Tiles away from player
const PIVOT_ROTATION_SPEED = Math.PI / 2; // Radians per second (90 deg/sec)
const PIVOT_RAY_COUNT = 3; // Number of rays in pivoting pattern
const PIVOT_ROTATION_BEATS = 2; // Beats to rotate before locking
const PIVOT_LOCKIN_BEATS = 2; // Beats to wait after locking before becoming lethal
const PIVOT_CHARGE_BEATS = 1; // Beats in lethal phase
const PIVOT_SPAWN_CHANCE = 0.15; // 15% chance to spawn pivoting attack instead of normal ray

// ============================================================================
// GLOBAL CONSTANTS - GRID CELL ATTACK
// ============================================================================
const CELL_TELEGRAPH_BEATS = 2; // Warning phase duration
const CELL_ACTIVE_BEATS = 0.1; // Lethal phase duration (instant)
const CELL_TELEGRAPH_COLOR = 0xFFFF00; // Yellow warning
const CELL_ACTIVE_COLOR = 0xFF0000; // Red lethal
const CELL_GLOW_COLOR = 0xFF6600; // Orange glow
const CELL_ATTACK_INTERVAL_BEATS = 6; // Spawn every 1.5 bars (2x faster)
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
let textObjects = []; // Pool of Phaser text objects for UI
let textPoolIndex = 0; // Current index in text pool
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
let quarterNotesScore = 0; // Number of 1/32 notes survived (8 per beat)
let audioCtx = null; // Web Audio context
let musicStartTime = 0; // When music started
let scheduledNodes = []; // Track all scheduled audio nodes for cleanup
let currentCycleBars = 0; // Current bar in the cycle
let currentPalette = PALETTE_NORMAL; // Active color palette
let paletteTransitionProgress = 0; // 0-1 for TYPE2 -> NORMAL fade
let lastPhase = 'normal'; // Track last phase to detect changes
let completedCycles = 0; // Number of completed full cycles (for difficulty progression)

// ============================================================================
// GLOBAL STATE - HIGH SCORES
// ============================================================================
const MAX_HIGH_SCORES = 10;
const NAME_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
let nameEntryChars = ['A', 'A', 'A']; // Current name being entered
let nameEntryIndex = 0; // Which character (0-2) is being edited
let charSelectIndex = 0; // Index in NAME_CHARS for current character
let highScoresData = []; // In-memory high scores (sandbox-compatible)

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
  // Characters needed for "vibebeater"
  'v': [[0,0, 0.5,1, 1,0]],
  'i': [[0.5,0, 0.5,1]],
  'b': [[0,0, 0,1, 0.7,1, 0.7,0.5, 0,0.5, 0.7,0.5, 0.7,0, 0,0]],
  'e': [[1,0, 0,0, 0,0.5, 0.6,0.5], [0,0.5, 0,1, 1,1]],
  'a': [[0,1, 0.5,0, 1,1], [0.25,0.5, 0.75,0.5]],
  't': [[0,0, 1,0], [0.5,0, 0.5,1]],
  'r': [[0,1, 0,0, 0.7,0, 0.7,0.5, 0,0.5], [0.7,0.5, 1,1]],
  // Characters needed for "game over"
  'g': [[1,0.2, 0,0.2, 0,1, 1,1, 1,0.5, 0.5,0.5]],
  'm': [[0,1, 0,0, 0.5,0.5, 1,0, 1,1]],
  'o': [[0,0, 1,0, 1,1, 0,1, 0,0]],
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

  // Create pool of text objects for UI rendering
  textObjects = [];
  for (let i = 0; i < 20; i++) {
    const txt = scene.add.text(0, 0, '', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 2
    });
    txt.setOrigin(0.5, 0.5);
    txt.setDepth(1000); // Ensure text renders on top
    txt.setVisible(false);
    textObjects.push(txt);
  }
  textPoolIndex = 0;

  stateChangeTime = scene.sound.context.currentTime;

  // Initialize audio context
  audioCtx = scene.sound.context;
  currentKeyIndex = Phaser.Math.Between(0, CIRCLE_OF_FIFTHS.length - 1);

  // Add action buttons for rhythm input
  const actionKeys = scene.input.keyboard.addKeys({
    SPACE: 'SPACE',
    P1A: 'Z', P1B: 'X', P1C: 'C',
    P1X: 'A', P1Y: 'S', P1Z: 'D',
    P2A: 'N', P2B: 'M', P2C: 'COMMA',
    P2X: 'H', P2Y: 'J', P2Z: 'K'
  });
  
  scene.input.keyboard.on('keydown', (event) => {
    const key = event.key.toUpperCase();

    if (gameState === 'title') {
      if (key === ' ') {
        startGame(scene);
      }
    } else if (gameState === 'name-entry') {
      handleNameEntry(scene, key);
    } else if (gameState === 'leaderboard') {
      // Any key returns to title
      gameState = 'title';
      stateChangeTime = scene.sound.context.currentTime;
    } else if (gameState === 'gameover') {
      restartGame(scene);
    } else if (gameState === 'level') {
      // Check rhythm timing on any action key
      const actionKeysList = ['SPACE', 'Z', 'X', 'C', 'N', 'M', 'COMMA', 'H', 'J', 'K'];
      if (actionKeysList.includes(key)) {
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

    // Music plays at constant 120 BPM regardless of game BPM
    // Stems are 8 beats long at 120 BPM = 4 seconds
    const stemDuration = (STEM_BEATS * 60) / 120;

    // Loop music patterns every stem duration
    if (now - musicStartTime >= stemDuration) {
      musicStartTime += stemDuration;

      // Determine which patterns to use based on current phase
      let activeBassPattern;
      let activeDrumPattern;

      if (currentCycleBars >= CYCLE_NORMAL_BARS && currentCycleBars < CYCLE_NORMAL_BARS + CYCLE_STRESS_BARS) {
        // Stress phase (bars 6-9): use stress melody and complex drums
        activeBassPattern = STEM_STRESS;
        activeDrumPattern = STEM_STRESS_TYPE2_DRUMS;
      } else if (currentCycleBars >= CYCLE_NORMAL_BARS + CYCLE_STRESS_BARS) {
        // Type2 phase (bars 10-11): use normal melody and complex drums
        activeBassPattern = STEM_NORMAL;
        activeDrumPattern = STEM_STRESS_TYPE2_DRUMS;
      } else {
        // Normal phase (bars 0-5): use normal melody and simple kick
        activeBassPattern = STEM_NORMAL;
        activeDrumPattern = STEM_KICK;
      }

      schedulePattern(activeBassPattern, musicStartTime, true);
      schedulePattern(activeDrumPattern, musicStartTime, false);
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

  // Reset color cycle and BPM
  currentCycleBars = 0;
  currentPalette = PALETTE_NORMAL;
  paletteTransitionProgress = 0;
  currentBPM = BPM_NORMAL;
  currentBgColor = BG_NORMAL;
  lastPhase = 'normal'; // Reset phase tracking
  completedCycles = 0; // Reset difficulty progression
  SEC_PER_BEAT = 60 / currentBPM;
  SEC_PER_BAR = BEATS_PER_BAR * SEC_PER_BEAT;
  quarterNotesScore = 0; // Reset score

  nextAttackTime = now + (DIAGONAL_ATTACK_INTERVAL_BEATS * SEC_PER_BEAT);
  nextCellAttackTime = now + (CELL_ATTACK_INTERVAL_BEATS * SEC_PER_BEAT);

  // Stop any existing music and start fresh
  stopAllMusic();
  musicStartTime = now;
  schedulePattern(STEM_NORMAL, now, true); // Start with normal melody
  schedulePattern(STEM_KICK, now, false); // Start with simple kick pattern
}

function restartGame(scene) {
  startGame(scene);
}

function triggerGameOver(scene) {
  stateChangeTime = scene.sound.context.currentTime;
  stopAllMusic();

  // Check if player achieved a high score
  if (isHighScore(quarterNotesScore)) {
    gameState = 'name-entry';
    nameEntryChars = ['A', 'A', 'A'];
    nameEntryIndex = 0;
    charSelectIndex = 0;
  } else {
    gameState = 'leaderboard';
  }
}

// ============================================================================
// BEAT TRACKING
// ============================================================================
function updateBeatTracking(now) {
  const oldBeat = globalBeat;

  while (now > lastBeatTime + SEC_PER_BEAT) {
    lastBeatTime += SEC_PER_BEAT;
    globalBeat++;

    // Increment score by 8 per quarter note (1/32 notes survived)
    if (gameState === 'level') {
      quarterNotesScore += 8;
    }

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

  // Update color cycle (every bar)
  if (gameState === 'level') {
    const previousBars = currentCycleBars;
    currentCycleBars = (currentCycleBars + 1) % CYCLE_TOTAL_BARS;

    // Detect cycle completion (wrap from last bar back to 0)
    if (previousBars === CYCLE_TOTAL_BARS - 1 && currentCycleBars === 0) {
      completedCycles++;
    }

    updateColorPalette();
  }
}

// ============================================================================
// COLOR CYCLING SYSTEM
// ============================================================================
function updateColorPalette() {
  let currentPhase = 'normal';

  if (currentCycleBars < CYCLE_NORMAL_BARS) {
    // Normal phase (0-5 bars)
    currentPalette = PALETTE_NORMAL;
    paletteTransitionProgress = 0;
    currentBPM = BPM_NORMAL;
    currentBgColor = BG_NORMAL;
    currentPhase = 'normal';
  } else if (currentCycleBars < CYCLE_NORMAL_BARS + CYCLE_STRESS_BARS) {
    // Stress phase (6-9 bars) - 1.25x spawn rate, increase BPM, red background
    currentPalette = PALETTE_STRESS;
    paletteTransitionProgress = 0;
    currentBPM = BPM_STRESS;
    currentBgColor = BG_STRESS;
    currentPhase = 'stress';
  } else {
    // Type 2 phase (10-11 bars) - Fade BPM back to normal, transition colors
    const type2Progress = (currentCycleBars - CYCLE_NORMAL_BARS - CYCLE_STRESS_BARS) / CYCLE_TYPE2_BARS;
    paletteTransitionProgress = type2Progress;

    // Interpolate BPM from stress to normal
    currentBPM = BPM_STRESS + (BPM_NORMAL - BPM_STRESS) * type2Progress;

    // Interpolate background: TYPE_2 gray -> normal black
    currentBgColor = lerpColor(BG_TYPE_2, BG_NORMAL, type2Progress);
    currentPhase = 'type2';
  }

  // Change music key when phase changes
  if (currentPhase !== lastPhase) {
    currentKeyIndex = (currentKeyIndex + 1) % CIRCLE_OF_FIFTHS.length;
    lastPhase = currentPhase;

    // Stop all music and restart with new BPM to prevent overlapping
    if (audioCtx) {
      const now = audioCtx.currentTime;
      stopAllMusic();

      // Determine which patterns to use for the new phase
      let newBassPattern;
      let newDrumPattern;

      if (currentPhase === 'stress') {
        newBassPattern = STEM_STRESS;
        newDrumPattern = STEM_STRESS_TYPE2_DRUMS;
      } else if (currentPhase === 'type2') {
        newBassPattern = STEM_NORMAL;
        newDrumPattern = STEM_STRESS_TYPE2_DRUMS;
      } else {
        newBassPattern = STEM_NORMAL;
        newDrumPattern = STEM_KICK;
      }

      // Reset music start time and schedule new patterns at new BPM
      musicStartTime = now;
      schedulePattern(newBassPattern, now, true);
      schedulePattern(newDrumPattern, now, false);
    }
  }

  // Recalculate timing constants
  SEC_PER_BEAT = 60 / currentBPM;
  SEC_PER_BAR = BEATS_PER_BAR * SEC_PER_BEAT;
}

// ============================================================================
// HIGH SCORE SYSTEM
// ============================================================================
function getHighScores() {
  return highScoresData;
}

function isHighScore(score) {
  if (highScoresData.length < MAX_HIGH_SCORES) return true;
  return score > highScoresData[highScoresData.length - 1].score;
}

function addHighScore(name, score) {
  highScoresData.push({ name, score });
  highScoresData.sort((a, b) => b.score - a.score);
  highScoresData = highScoresData.slice(0, MAX_HIGH_SCORES);
  return highScoresData;
}

function getTopScore() {
  const scores = getHighScores();
  return scores.length > 0 ? scores[0].score : 0;
}

function handleNameEntry(scene, key) {
  if (key === 'ARROWUP' || key === 'W') {
    // Cycle character backward
    charSelectIndex = (charSelectIndex - 1 + NAME_CHARS.length) % NAME_CHARS.length;
    nameEntryChars[nameEntryIndex] = NAME_CHARS[charSelectIndex];
  } else if (key === 'ARROWDOWN' || key === 'S') {
    // Cycle character forward
    charSelectIndex = (charSelectIndex + 1) % NAME_CHARS.length;
    nameEntryChars[nameEntryIndex] = NAME_CHARS[charSelectIndex];
  } else if (key === ' ') {
    // Confirm character and move to next
    nameEntryIndex++;
    if (nameEntryIndex >= 3) {
      // Name complete - save and show leaderboard
      const name = nameEntryChars.join('');
      addHighScore(name, quarterNotesScore);
      gameState = 'leaderboard';
      stateChangeTime = scene.sound.context.currentTime;
    } else {
      // Move to next character, reset to 'A'
      charSelectIndex = 0;
      nameEntryChars[nameEntryIndex] = 'A';
    }
  }
}

function lerpColor(color1, color2, t) {
  const r1 = (color1 >> 16) & 0xFF;
  const g1 = (color1 >> 8) & 0xFF;
  const b1 = color1 & 0xFF;

  const r2 = (color2 >> 16) & 0xFF;
  const g2 = (color2 >> 8) & 0xFF;
  const b2 = color2 & 0xFF;

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return (r << 16) | (g << 8) | b;
}

function getCurrentGridColor(index) {
  // During TYPE2 phase, interpolate between TYPE2 and NORMAL
  if (currentCycleBars >= CYCLE_NORMAL_BARS + CYCLE_STRESS_BARS) {
    const type2Color = PALETTE_TYPE_2[index % PALETTE_TYPE_2.length];
    const normalColor = PALETTE_NORMAL[index % PALETTE_NORMAL.length];
    return lerpColor(type2Color, normalColor, paletteTransitionProgress);
  }

  // Otherwise use current palette directly
  return currentPalette[index % currentPalette.length];
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
  // Calculate spawn rate multiplier (1.25x faster during stress phase)
  const isStressPhase = currentCycleBars >= CYCLE_NORMAL_BARS && currentCycleBars < CYCLE_NORMAL_BARS + CYCLE_STRESS_BARS;
  const spawnMultiplier = isStressPhase ? 0.8 : 1.0; // 0.8 interval = 1.25x rate (25% faster)

  // Check if any pivoting ray attacks are currently active
  const hasPivotingRays = activeAttacks.some(attack => attack.type === 'PivotingRay');

  // Spawn diagonal line attacks (disabled if pivoting rays are active)
  if (now >= nextAttackTime && gameState === 'level' && !hasPivotingRays) {
    // Randomly choose between single ray and pivoting pattern based on spawn chance
    if (Math.random() < PIVOT_SPAWN_CHANCE) {
      spawnPivotingRayPattern(now);
    } else {
      // Progressive difficulty: spawn additional rays based on completed cycles
      // First cycle: 1 ray, second cycle: 2 rays, etc.
      const numRays = Math.min(completedCycles + 1, 5); // Cap at 5 rays max
      for (let i = 0; i < numRays; i++) {
        spawnDiagonalLineAttack(now);
      }
    }
    nextAttackTime = now + (DIAGONAL_ATTACK_INTERVAL_BEATS * SEC_PER_BEAT * spawnMultiplier);
  }

  // Spawn cell attacks (disabled if pivoting rays are active)
  if (now >= nextCellAttackTime && gameState === 'level' && !hasPivotingRays) {
    spawnCellAttack(now);
    nextCellAttackTime = now + (CELL_ATTACK_INTERVAL_BEATS * SEC_PER_BEAT * spawnMultiplier);
  }

  activeAttacks = activeAttacks.filter(attack => {
    if (attack.type === 'DiagonalLine') {
      return updateDiagonalLineAttack(attack, scene, now);
    } else if (attack.type === 'PivotingRay') {
      return updatePivotingRay(attack, scene, now);
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
  // Pick a random edge of the screen to spawn from
  const edge = Phaser.Math.Between(0, 3); // 0=top, 1=right, 2=bottom, 3=left
  let originX, originY;

  switch(edge) {
    case 0: // Top edge
      originX = Phaser.Math.Between(0, SCREEN_WIDTH);
      originY = 0;
      break;
    case 1: // Right edge
      originX = SCREEN_WIDTH;
      originY = Phaser.Math.Between(0, SCREEN_HEIGHT);
      break;
    case 2: // Bottom edge
      originX = Phaser.Math.Between(0, SCREEN_WIDTH);
      originY = SCREEN_HEIGHT;
      break;
    case 3: // Left edge
      originX = 0;
      originY = Phaser.Math.Between(0, SCREEN_HEIGHT);
      break;
  }

  // Calculate angle to point directly at player
  const dx = shipPos.x - originX;
  const dy = shipPos.y - originY;
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
// ATTACK SYSTEM - PIVOTING RAY PATTERN
// ============================================================================
function spawnPivotingRayPattern(startTime) {
  // Calculate origin point 2 tiles away from player
  const offsetDist = PIVOT_ORIGIN_OFFSET_TILES * GRID_CELL_WIDTH;
  const randomAngle = Phaser.Math.Between(0, 360) * (Math.PI / 180);

  const originX = shipPos.x + Math.cos(randomAngle) * offsetDist;
  const originY = shipPos.y + Math.sin(randomAngle) * offsetDist;

  // Calculate initial angle pointing at player
  const dx = shipPos.x - originX;
  const dy = shipPos.y - originY;
  const initialAngle = Math.atan2(dy, dx);

  // Spawn multiple rays in a pattern
  for (let i = 0; i < PIVOT_RAY_COUNT; i++) {
    const angleOffset = (i * (Math.PI * 2)) / PIVOT_RAY_COUNT;
    activeAttacks.push({
      type: 'PivotingRay',
      startTime: startTime,
      originX: originX,
      originY: originY,
      initialAngle: initialAngle + angleOffset,
      currentAngle: initialAngle + angleOffset,
      hit: false
    });
  }
}

function updatePivotingRay(attack, scene, now) {
  const elapsed = now - attack.startTime;

  // Phase timings
  const fadeInTime = DIAGONAL_FADE_IN_BEATS * SEC_PER_BEAT;
  const rotationTime = PIVOT_ROTATION_BEATS * SEC_PER_BEAT;
  const lockinTime = PIVOT_LOCKIN_BEATS * SEC_PER_BEAT;
  const chargeTime = PIVOT_CHARGE_BEATS * SEC_PER_BEAT;

  const rotationEndTime = fadeInTime + rotationTime;
  const lockinEndTime = rotationEndTime + lockinTime;
  const totalDuration = lockinEndTime + chargeTime;

  if (elapsed >= totalDuration) {
    if (!attack.exploded) {
      spawnRayExplosion(attack, now);
      attack.exploded = true;
    }
    return false;
  }

  // Phase 1: Fade in - no rotation yet
  if (elapsed < fadeInTime) {
    // Keep initial angle during fade in
  }
  // Phase 2: Rotation - actively pivot the ray
  else if (elapsed < rotationEndTime) {
    const rotationElapsed = elapsed - fadeInTime;
    attack.currentAngle = attack.initialAngle + (PIVOT_ROTATION_SPEED * rotationElapsed);
  }
  // Phase 3: Lock-in - stop rotating, wait before becoming lethal
  else if (elapsed < lockinEndTime) {
    // Keep the angle from end of rotation phase (already set)
  }
  // Phase 4: Charge - lethal phase, ray turns red
  else {
    // Angle stays locked from rotation phase
  }

  // Calculate opacity based on phase
  let opacity = 0;
  if (elapsed < fadeInTime) {
    // Fade in
    opacity = elapsed / fadeInTime;
  } else if (elapsed < rotationEndTime) {
    // Rotation phase - stay at medium opacity (white)
    opacity = 0.6;
  } else if (elapsed < lockinEndTime) {
    // Lock-in phase - pulse to indicate impending danger
    const lockinProgress = (elapsed - rotationEndTime) / lockinTime;
    opacity = 0.6 + 0.2 * Math.sin(lockinProgress * Math.PI * 8); // Rapid pulse
  } else {
    // Charge phase - ramp up to full red
    const chargeProgress = (elapsed - lockinEndTime) / chargeTime;
    opacity = 0.6 + 0.4 * chargeProgress; // Ramp from 0.6 to 1.0
  }

  // Only check collision during charge phase (when red)
  if (!attack.hit && elapsed >= lockinEndTime) {
    if (checkPivotingRayCollision(attack)) {
      attack.hit = true;
      triggerGameOver(scene);
    }
  }

  return true;
}

function checkPivotingRayCollision(attack) {
  const { x1, y1, x2, y2 } = calculateDiagonalLineExtentsFromData(
    attack.originX,
    attack.originY,
    attack.currentAngle
  );

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

// ============================================================================
// RENDERING - MAIN
// ============================================================================
function render(scene, now) {
  gfx.clear();
  resetTextPool(); // Reset text pool at start of each frame

  // Draw background with current phase color
  if (gameState === 'level') {
    const r = (currentBgColor >> 16) & 0xFF;
    const g = (currentBgColor >> 8) & 0xFF;
    const b = currentBgColor & 0xFF;
    const bgColorWithAlpha = (r << 16) | (g << 8) | b;
    gfx.fillStyle(bgColorWithAlpha, 1);
    gfx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  }

  if (gameState === 'title') {
    renderGrid();
    renderTitleScreen(scene, now);
    return;
  }

  if (gameState === 'name-entry') {
    renderGrid();
    renderNameEntry(scene, now);
    return;
  }

  if (gameState === 'leaderboard') {
    renderGrid();
    renderLeaderboard(scene, now);
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

  // Title (vector font - keep for identity)
  drawCenteredVectorText(GAME_NAME, TEXT_CHAR_WIDTH, TEXT_CHAR_HEIGHT, -60, fadeAlpha);

  // Instructions (system font)
  drawSystemText("PRESS SPACE", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 60, 32, fadeAlpha * 0.8);

  // High score (system font)
  const topScore = getTopScore();
  if (topScore > 0) {
    const scoreText = `HIGH SCORE: ${topScore}`;
    drawSystemText(scoreText, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 140, 24, fadeAlpha * 0.6);
  }
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

function renderNameEntry(scene, now) {
  const fadeAlpha = Math.min(1, (now - stateChangeTime) / (FADE_DURATION_BEATS * SEC_PER_BEAT));

  gfx.fillStyle(0x000000, 0.85 * fadeAlpha);
  gfx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  // Title (system font)
  drawSystemText("NEW HIGH SCORE!", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 180, 36, fadeAlpha);

  // Score (system font)
  const scoreText = `SCORE: ${quarterNotesScore}`;
  drawSystemText(scoreText, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 80, 28, fadeAlpha);

  // Name being entered (system font)
  let displayName = '';
  for (let i = 0; i < 3; i++) {
    if (i < nameEntryIndex) {
      displayName += nameEntryChars[i];
    } else if (i === nameEntryIndex) {
      displayName += nameEntryChars[i] + '_';
    } else {
      displayName += '_';
    }
  }
  drawSystemText(displayName, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 48, fadeAlpha);

  // Instructions (system font)
  drawSystemText("PRESS SPACE", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 120, 24, fadeAlpha * 0.7);
}

function renderLeaderboard(scene, now) {
  const fadeAlpha = Math.min(1, (now - stateChangeTime) / (FADE_DURATION_BEATS * SEC_PER_BEAT));

  gfx.fillStyle(0x000000, 0.85 * fadeAlpha);
  gfx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

  // Title (system font)
  drawSystemText("HIGH SCORES", SCREEN_WIDTH / 2, 80, 36, fadeAlpha);

  // Get high scores
  const scores = getHighScores();
  const startY = 160;
  const lineHeight = 38;

  if (scores.length === 0) {
    drawSystemText("NO SCORES YET", SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 24, fadeAlpha * 0.7);
  } else {
    for (let i = 0; i < Math.min(10, scores.length); i++) {
      const y = startY + (i * lineHeight);
      const line = `${i + 1}.  ${scores[i].name}  ${scores[i].score}`;
      drawSystemText(line, SCREEN_WIDTH / 2, y, 22, fadeAlpha);
    }
  }

  // Footer (system font)
  drawSystemText("PRESS ANY KEY", SCREEN_WIDTH / 2, SCREEN_HEIGHT - 60, 20, fadeAlpha * 0.6);
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

  // Vertical lines - cycle through palette colors
  for (let i = 0; i <= GRID_COLS; i++) {
    const x = i * GRID_CELL_WIDTH;
    let baseColor = getCurrentGridColor(i);

    let r = (baseColor >> 16) & 0xFF;
    let g = (baseColor >> 8) & 0xFF;
    let b = baseColor & 0xFF;

    // Apply flash intensity
    r = Math.min(255, Math.floor(r + 255 * flashIntensity));
    g = Math.min(255, Math.floor(g + 255 * flashIntensity));
    b = Math.min(255, Math.floor(b + 255 * flashIntensity));

    const color = (r << 16) | (g << 8) | b;

    gfx.lineStyle(GRID_LINE_WIDTH, color, 1);
    gfx.beginPath();
    gfx.moveTo(x, 0);
    gfx.lineTo(x, SCREEN_HEIGHT);
    gfx.strokePath();
  }

  // Horizontal lines - cycle through palette colors
  for (let i = 0; i <= GRID_ROWS; i++) {
    const y = i * GRID_CELL_HEIGHT;
    let baseColor = getCurrentGridColor(i);

    let r = (baseColor >> 16) & 0xFF;
    let g = (baseColor >> 8) & 0xFF;
    let b = baseColor & 0xFF;

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

  const scoreColor = isFlashing ? '#ff0000' : '#00ffff';
  const scoreText = `${quarterNotesScore}`;

  drawSystemText(scoreText, 60, 30, 28, 1.0, scoreColor, false);
}

// ============================================================================
// RENDERING - ATTACKS
// ============================================================================
function renderAttacks(scene, now) {
  activeAttacks.forEach(attack => {
    if (attack.type === 'DiagonalLine') {
      renderDiagonalLine(attack, now);
    } else if (attack.type === 'PivotingRay') {
      renderPivotingRay(attack, now);
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

function renderPivotingRay(attack, now) {
  const elapsed = now - attack.startTime;

  // Phase timings (must match updatePivotingRay)
  const fadeInTime = DIAGONAL_FADE_IN_BEATS * SEC_PER_BEAT;
  const rotationTime = PIVOT_ROTATION_BEATS * SEC_PER_BEAT;
  const lockinTime = PIVOT_LOCKIN_BEATS * SEC_PER_BEAT;
  const chargeTime = PIVOT_CHARGE_BEATS * SEC_PER_BEAT;

  const rotationEndTime = fadeInTime + rotationTime;
  const lockinEndTime = rotationEndTime + lockinTime;

  let opacity = 0;
  let lineColor = DIAGONAL_COLOR_CHARGING;

  // Calculate opacity and color based on phase
  if (elapsed < fadeInTime) {
    // Fade in
    opacity = elapsed / fadeInTime;
    lineColor = DIAGONAL_COLOR_CHARGING;
  } else if (elapsed < rotationEndTime) {
    // Rotation phase - white, medium opacity
    opacity = 0.6;
    lineColor = DIAGONAL_COLOR_CHARGING;
  } else if (elapsed < lockinEndTime) {
    // Lock-in phase - pulse white
    const lockinProgress = (elapsed - rotationEndTime) / lockinTime;
    opacity = 0.6 + 0.2 * Math.sin(lockinProgress * Math.PI * 8);
    lineColor = DIAGONAL_COLOR_CHARGING;
  } else {
    // Charge phase - red, ramping up
    const chargeProgress = (elapsed - lockinEndTime) / chargeTime;
    opacity = 0.6 + 0.4 * chargeProgress;
    lineColor = DIAGONAL_COLOR_LETHAL;
  }

  // Use currentAngle for pivoting rays
  const { x1, y1, x2, y2 } = calculateDiagonalLineExtentsFromData(
    attack.originX,
    attack.originY,
    attack.currentAngle
  );

  const glowWidth = DIAGONAL_LINE_WIDTH * DIAGONAL_GLOW_MULTIPLIER;

  // Glow
  gfx.lineStyle(glowWidth, lineColor, opacity * 0.15);
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
// RENDERING - TEXT (SYSTEM FONT)
// ============================================================================
function resetTextPool() {
  textObjects.forEach(txt => txt.setVisible(false));
  textPoolIndex = 0;
}

function drawSystemText(text, x, y, size, alpha = 1.0, color = '#00ffff', centered = true) {
  if (textPoolIndex >= textObjects.length) return; // Pool exhausted
  const txt = textObjects[textPoolIndex++];
  txt.setText(text);
  txt.setFontSize(size);
  txt.setColor(color);
  txt.setAlpha(alpha);
  txt.setPosition(x, y);
  if (centered) {
    txt.setOrigin(0.5, 0.5);
  } else {
    txt.setOrigin(0, 0.5);
  }
  txt.setVisible(true);
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
  // Use currentAngle for pivoting rays, angle for normal rays
  const explosionAngle = attack.currentAngle !== undefined ? attack.currentAngle : attack.angle;

  activeRayExplosions.push({
    originX: attack.originX,
    originY: attack.originY,
    angle: explosionAngle,
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

  // Resonant lowpass filter (classic TB-303 acid sound)
  filter.type = 'lowpass';
  filter.Q.value = 20 + velocity * 20; // Very high resonance (20-40) for screaming acid

  // Filter envelope: dramatic sweep based on velocity and note duration
  const filterAttack = Math.min(duration * 0.3, 0.08); // Proportional to note length
  const filterStart = freq * 8; // Higher starting point for more dramatic sweep
  const filterEnd = freq * 0.25; // Lower end point for deeper bass

  filter.frequency.setValueAtTime(filterStart, time);
  filter.frequency.exponentialRampToValueAtTime(filterEnd, time + filterAttack);

  // Amplitude envelope (ADSR) - tight and punchy
  const attackTime = 0.003; // 3ms attack - very snappy
  const releaseTime = 0.04; // 40ms release
  const sustainLevel = velocity * 0.35; // Slightly louder

  gain.gain.setValueAtTime(0.01, time);
  gain.gain.exponentialRampToValueAtTime(sustainLevel, time + attackTime); // Attack
  gain.gain.setValueAtTime(sustainLevel, time + duration - releaseTime); // Sustain
  gain.gain.exponentialRampToValueAtTime(0.01, time + duration); // Release

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

  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.05);

  // Envelope with quick attack and exponential decay
  gain.gain.setValueAtTime(0.01, time);
  gain.gain.exponentialRampToValueAtTime(velocity * 0.8, time + 0.002); // Fast attack
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
  noiseGain.gain.setValueAtTime(0.01, time);
  noiseGain.gain.exponentialRampToValueAtTime(velocity * 0.3, time + 0.002); // Fast attack
  noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

  // Tone component
  const osc = audioCtx.createOscillator();
  const oscGain = audioCtx.createGain();

  osc.frequency.value = 180;
  oscGain.gain.setValueAtTime(0.01, time);
  oscGain.gain.exponentialRampToValueAtTime(velocity * 0.2, time + 0.002); // Fast attack
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

  gain.gain.setValueAtTime(0.01, time);
  gain.gain.exponentialRampToValueAtTime(velocity * 0.4, time + 0.001); // Very fast attack
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

  gain.gain.setValueAtTime(0.01, time);
  gain.gain.exponentialRampToValueAtTime(velocity * 0.6, time + 0.002); // Fast attack
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
  gain.gain.setValueAtTime(0.01, time);
  gain.gain.exponentialRampToValueAtTime(velocity * 0.25, time + 0.001); // Very fast attack
  gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  noise.start(time);
  scheduledNodes.push(noise);
}

function schedulePattern(stem, startTime, isBass, minTime = -Infinity, maxTime = Infinity) {
  if (!audioCtx || !stem) return;

  // Stem times are in seconds (at 120 BPM reference tempo)
  // Keep music at constant tempo - don't scale with game BPM
  // The visual beat grid can speed up, but the music stays groovy

  stem.forEach(note => {
    const [time, midi, velocity, duration] = note;
    const absoluteTime = startTime + time;

    // Only schedule notes within the allowed time range
    if (time >= minTime && time < maxTime) {
      if (isBass) {
        playBassNote(absoluteTime, midi, velocity, duration);
      } else {
        playDrum(absoluteTime, midi, velocity, duration);
      }
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