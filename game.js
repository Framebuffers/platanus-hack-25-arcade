// Stage 3: Music Engine (Tracker-Style)

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

// Ray safe zone settings (10% of SHIP_DIAMETER)
const SHIP_DIAMETER = SHIP_SIZE * 2; // 40 pixels
const MIN_SAFE_GAP = SHIP_DIAMETER * 0.1; // 4 pixels

// BPM timing
const BPM = 130;
const SEC_PER_BEAT = 60 / BPM;

// Music Engine Settings
const NOTE_RESOLUTION = 8; // Steps per bar (1/8th notes)
const SEC_PER_STEP = SEC_PER_BEAT / NOTE_RESOLUTION; // Time per step
const BASE_FREQUENCY = 440; // A4
const SCALE = [0, 2, 3, 5, 7, 8, 10, 12]; // Minor scale in semitones (0=A, 2=B, 3=C, etc.)

// Music Data: PATTERNS (The "Bars")
// Structure: {s: step_index (0-7), p: pitch_index (0-7), d: duration_steps (1-8), c: is_change_point (bool)}
const PATTERNS = [
  // Pattern 0: Kick on every quarter note (steps 0, 2, 4, 6)
  [{s: 0, p: 0, d: 1, c: false}, {s: 2, p: 0, d: 1, c: false}, {s: 4, p: 0, d: 1, c: false}, {s: 6, p: 0, d: 1, c: false}],
];

// Music Data: SONG_SEQUENCE (The "Composition")
// Structure: [PATTERN_ID, REPETITIONS, BASE_CHANNEL_INDEX]
const SONG_SEQUENCE = [
  [0, 16, 0], // Pattern 0 (Kick), 16 bars, Channel 0
];

// Instruments (ADSR implemented via AudioParam)
const INSTRUMENTS = [
  // 0: Kick (Triangle, fast attack/decay)
  { wave: 'triangle', volume: 0.8, attack: 0.001, decay: 0.15, sustain: 0, release: 0.01 },
  // 1: Lead Square (standard) - Placeholder for future use
  { wave: 'square', volume: 0.4, attack: 0.05, decay: 0.2, sustain: 0.5, release: 0.1 },
  // 3: Unused Placeholder
  { wave: 'square', volume: 0.6, attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.1 },
];

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
// Spawn interval set to minimum 1 bar (4 beats) and maximum 4 bars (16 beats)
const RAY_MIN_SPAWN_INTERVAL_BEATS = 4;
const RAY_MAX_SPAWN_INTERVAL_BEATS = 16;
const RAY_MIN_SPAWN_DISTANCE = 150;
const RAY_MAX_LENGTH = 3000; // Ensures ray extends beyond screen bounds
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

// Ray Pattern Management
let DEFAULT_RAY_ORIGINS = []; // All grid intersections, initialized in create
const RAY_PATTERNS = [
  // Pattern 0: Uses all grid intersections as potential origins
  { name: 'FullGrid', originPool: DEFAULT_RAY_ORIGINS },
];

let rayPatternState = {
  patternIndex: 0,
  lastPatternChange: 0,
  minDurationBeats: 16, // Minimum duration of a pattern before it can change (4 bars)
};


// === MUSIC STATE ===
let audioContext;
let masterGain;
let channels = []; // Stores gain nodes and instrument definitions
let sequenceState = {
  sequenceIndex: 0, // Index into SONG_SEQUENCE
  barInSequence: 0, // Repetition count of the current sequence item
  stepInBar: 0,     // Current step (0 to NOTE_RESOLUTION-1)
  jumpWaitBars: 0,  // Bars to wait before executing a jump
  jumpTargetIndex: -1, // The target index in SONG_SEQUENCE
};
let isPlayerPressing = false; // Flag for player input
let lastStepTime = 0; // Time the last note step was processed


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
  
  // Initialize Ray Pattern Origins
  DEFAULT_RAY_ORIGINS = generateAllGridIntersections();
  RAY_PATTERNS[0].originPool = DEFAULT_RAY_ORIGINS;
  
  // Audio must be initialized here
  initAudio(scene);
  
  // Only handle starting the game from the title screen
  scene.input.keyboard.on('keydown', () => {
    if (gameState === 'title') {
      gameState = 'level';
      beatStartTime = scene.sound.context.currentTime;
      lastStepTime = beatStartTime; // Initialize sequencer time
      shipPos = { x: SHIP_START_X, y: SHIP_START_Y };
      shipVel = { x: 0, y: 0 };
      activeRays = [];
      
      const minSecs = RAY_MIN_SPAWN_INTERVAL_BEATS * SEC_PER_BEAT;
      const maxSecs = RAY_MAX_SPAWN_INTERVAL_BEATS * SEC_PER_BEAT;

      lastRaySpawnTime = scene.sound.context.currentTime;
      // Schedule initial spawn time based on new constants
      nextRaySpawnTime = lastRaySpawnTime + (minSecs + Math.random() * (maxSecs - minSecs));
    }
  });
}

function update() {
  const scene = this;
  
  // Check player input for music interaction
  isPlayerPressing = cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown ||
                     wasd.W.isDown || wasd.S.isDown || wasd.A.isDown || wasd.D.isDown ||
                     wasd.pad2_up.isDown || wasd.pad2_down.isDown || wasd.pad2_left.isDown || wasd.pad2_right.isDown;
  
  if (gameState === 'level' || gameState === 'gameover') {
    // Sequencer runs continuously in level and gameover state for atmosphere
    processSequencerStep(scene);
  }
  
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

// === MUSIC ENGINE ===

function initAudio(scene) {
  audioContext = scene.sound.context;
  masterGain = audioContext.createGain();
  masterGain.gain.setValueAtTime(0.5, audioContext.currentTime); // Master Volume
  masterGain.connect(audioContext.destination);

  // Initialize 4 channels (0: Triangle, 1-3: Square)
  for (let i = 0; i < 4; i++) {
    const instrument = INSTRUMENTS[i] || INSTRUMENTS[1];
    const type = (i === 0) ? 'triangle' : 'square';
    const gainNode = audioContext.createGain();
    gainNode.connect(masterGain);
    channels.push({
      type: type,
      gainNode: gainNode,
      instrument: instrument
    });
  }
}

function noteToFrequency(noteIndex) {
  if (noteIndex === 0) return 60; // Fixed kick frequency
  
  // Map index (1-8) to scale degree, add octave offset (e.g., +24 semitones for C4)
  const octaveOffset = 24; 
  const scaleDegree = SCALE[noteIndex % SCALE.length];
  const midiNote = 60 + octaveOffset + scaleDegree; 
  return BASE_FREQUENCY * Math.pow(2, (midiNote - 69) / 12);
}

function triggerNote(channelIndex, noteIndex, durationSecs) {
  const channel = channels[channelIndex];
  const instrument = channel.instrument;
  const now = audioContext.currentTime;

  // Create oscillator
  const osc = audioContext.createOscillator();
  osc.type = channel.type;
  
  // Calculate and set frequency
  const freq = noteToFrequency(noteIndex);
  osc.frequency.setValueAtTime(freq, now);

  // Connect and start
  const noteGain = audioContext.createGain();
  noteGain.gain.setValueAtTime(0.0001, now); 
  
  osc.connect(noteGain).connect(channel.gainNode);

  // --- ADSR Envelope ---
  const gain = noteGain.gain;
  
  // Attack
  gain.linearRampToValueAtTime(instrument.volume, now + instrument.attack);
  
  // Decay (to Sustain level)
  const sustainLevel = instrument.volume * instrument.sustain;
  gain.linearRampToValueAtTime(sustainLevel, now + instrument.attack + instrument.decay);

  // Note OFF time (duration of the note)
  const noteOffTime = now + durationSecs;

  // Release
  gain.setValueAtTime(sustainLevel, noteOffTime); // Hold sustain until note off
  gain.linearRampToValueAtTime(0.0001, noteOffTime + instrument.release);

  osc.start(now);
  // Ensure the oscillator stops slightly after the release phase is complete
  osc.stop(noteOffTime + instrument.release + 0.05); 
}

function processSequencerStep(scene) {
  const now = scene.sound.context.currentTime;
  
  // Check if enough time has passed since the last step (quantization)
  if (now < lastStepTime + SEC_PER_STEP) {
    return;
  }
  
  // Use the calculated time for note precision
  const triggerTime = lastStepTime + SEC_PER_STEP; 
  lastStepTime = triggerTime;

  // 1. Handle Jump Queue
  if (sequenceState.jumpWaitBars > 0) {
    if (sequenceState.stepInBar === 0) { // Start of a new bar (Bar 0 step)
      sequenceState.jumpWaitBars--;
      if (sequenceState.jumpWaitBars === 0 && sequenceState.jumpTargetIndex !== -1) {
        // EXECUTE JUMP
        sequenceState.sequenceIndex = sequenceState.jumpTargetIndex;
        sequenceState.barInSequence = 0;
        sequenceState.jumpTargetIndex = -1;
      }
    }
  }

  // 2. Get Current Pattern Step Data
  const currentSeq = SONG_SEQUENCE[sequenceState.sequenceIndex];
  const baseChannelIndex = currentSeq[2];
  const patternId = currentSeq[0];
  const repetitions = currentSeq[1];
  const pattern = PATTERNS[patternId];
  
  // 3. Trigger Notes for Current Step
  const currentStep = sequenceState.stepInBar;
  
  pattern.filter(noteData => noteData.s === currentStep).forEach(noteData => {
    const pitchIndex = noteData.p;
    const durationSteps = noteData.d; 
    const durationSecs = durationSteps * SEC_PER_STEP;
    
    // Only trigger if pitch is not 0 (which is used for the kick channel)
    if (pitchIndex !== 'R') { 
      triggerNote(baseChannelIndex, pitchIndex, durationSecs);
    }

    // 4. Check for Change Point and Player Input
    if (noteData.c && isPlayerPressing && sequenceState.jumpWaitBars === 0) {
      
      // Select a new random target bar (avoid repeating the current one)
      let nextIndex = sequenceState.sequenceIndex;
      if (SONG_SEQUENCE.length > 1) {
        let attempts = 0;
        do {
          nextIndex = Math.floor(Math.random() * SONG_SEQUENCE.length);
          attempts++;
        } while(nextIndex === sequenceState.sequenceIndex && attempts < 10);
      }
      
      // Queue the jump after a random number of bars (1-4)
      sequenceState.jumpWaitBars = Phaser.Math.Between(1, 4);
      sequenceState.jumpTargetIndex = nextIndex;
    }
  });

  // 5. Advance Sequencer
  sequenceState.stepInBar++;
  
  if (sequenceState.stepInBar >= NOTE_RESOLUTION) {
    sequenceState.stepInBar = 0;
    sequenceState.barInSequence++;
    
    // Check if repetition is complete
    if (sequenceState.barInSequence >= repetitions) {
      sequenceState.barInSequence = 0;
      
      // Advance to the next item in the SONG_SEQUENCE
      sequenceState.sequenceIndex = (sequenceState.sequenceIndex + 1) % SONG_SEQUENCE.length;
    }
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
        
        const minSecs = RAY_MIN_SPAWN_INTERVAL_BEATS * SEC_PER_BEAT;
        const maxSecs = RAY_MAX_SPAWN_INTERVAL_BEATS * SEC_PER_BEAT;
        
        lastRaySpawnTime = scene.sound.context.currentTime;
        nextRaySpawnTime = lastRaySpawnTime + (minSecs + Math.random() * (maxSecs - minSecs));
        
        // Reset music sequencer for a fresh start
        lastStepTime = beatStartTime;
        sequenceState = {
          sequenceIndex: 0,
          barInSequence: 0,
          stepInBar: 0,
          jumpWaitBars: 0,
          jumpTargetIndex: -1,
        };
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
  // A rough approximation of the triangle's minimum distance from center
  const baseArea = SHIP_SIZE * (SHIP_SIZE * 0.7 * 2) * 0.5; 
  // Simplified calculation for bounding circle radius (approx 11.5 from center to side)
  return SHIP_SIZE * 0.7; // ~14 pixels, closer to the actual bounding radius
}

/**
 * Calculates the minimum required distance from the center of a player
 * to the ray's infinite line, ensuring the collision margin (RAY_COLLISION_OFFSET)
 * plus the user-defined safe gap (MIN_SAFE_GAP) is respected.
 */
function getMinRequiredSeparation() {
  const shipRadius = getShipCollisionRadius(); 
  // Total effective collision buffer: ship radius + ray offset + 10% safety gap
  return shipRadius + RAY_COLLISION_OFFSET + MIN_SAFE_GAP;
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

// === RAY SYSTEM - Pattern Logic Extracted ===

/**
 * Generates all possible grid intersection points.
 */
function generateAllGridIntersections() {
  const intersections = [];
  
  for (let i = 0; i <= GRID_COLS; i++) {
    for (let j = 0; j <= GRID_ROWS; j++) {
      intersections.push({ x: i * GRID_CELL_WIDTH, y: j * GRID_CELL_HEIGHT });
    }
  }
  return intersections;
}

/**
 * Selects a random, collision-safe origin from the provided pool based on player positions.
 */
function getRandomOriginFromPool(originPool) {
  const minDistance = RAY_MIN_SPAWN_DISTANCE; 
  
  // Filter origins that are far enough from both players
  let validOrigins = originPool.filter(origin => {
    const distP1 = Math.hypot(origin.x - shipPos.x, origin.y - shipPos.y);
    
    if (distP1 < minDistance) return false;
    
    if (ship2Active) {
      const distP2 = Math.hypot(origin.x - ship2Pos.x, origin.y - ship2Pos.y);
      if (distP2 < minDistance) return false;
    }
    
    return true; 
  });
  
  // Fallback: If no truly safe origin is found, use any from the pattern's pool.
  const candidates = validOrigins.length > 0 ? validOrigins : originPool;
  
  if (candidates.length === 0) return null; 
  
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Checks if the ray defined by origin and angle maintains the required minimum
 * separation distance from the player's center.
 */
function isAngleSafeForPlayer(originX, originY, angle, shipX, shipY) {
  const minDistance = getMinRequiredSeparation();
  
  // Vector from origin to ship
  const dx = shipX - originX;
  const dy = shipY - originY;
  
  // 1. Calculate distance from ship (point) to the infinite line (ray)
  // Line definition: Ax + By + C = 0, where A=sin(angle), B=-cos(angle)
  const A = Math.sin(angle);
  const B = -Math.cos(angle);
  const C = -A * originX - B * originY;
  
  // Distance = |A*shipX + B*shipY + C| / 1 (since A^2+B^2=1)
  const distanceToLine = Math.abs(A * shipX + B * shipY + C);

  // The ray is unsafe if the distance to the line is less than the required separation.
  return distanceToLine >= minDistance;
}

function spawnRay(scene) {
  const currentPattern = RAY_PATTERNS[rayPatternState.patternIndex];
  const origin = getRandomOriginFromPool(currentPattern.originPool); 
  
  if (!origin) return; 

  const now = scene.sound.context.currentTime;

  // --- Find a safe angle ---
  const SAFE_ANGLE_INCREMENT = Math.PI / 18; // 10 degrees in radians
  let safeAngles = [];
  
  // Iterate through 36 angles (0 to 350 degrees)
  for (let i = 0; i < 36; i++) {
    const candidateAngle = i * SAFE_ANGLE_INCREMENT;
    
    // Check safety for P1
    let isSafe = isAngleSafeForPlayer(origin.x, origin.y, candidateAngle, shipPos.x, shipPos.y);
    
    // Check safety for P2 if active
    if (ship2Active && isSafe) {
      isSafe = isAngleSafeForPlayer(origin.x, origin.y, candidateAngle, ship2Pos.x, ship2Pos.y);
    }
    
    if (isSafe) {
      safeAngles.push(candidateAngle);
    }
  }
  
  // If no safe angle is found, skip spawning the ray this frame.
  if (safeAngles.length === 0) {
    // If we can't find a safe angle, reset the timer to try again very soon
    lastRaySpawnTime = now;
    nextRaySpawnTime = now + 0.1; 
    return; 
  }
  
  // Pick a random safe angle
  const angle = safeAngles[Math.floor(Math.random() * safeAngles.length)];

  const growthBeats = RAY_MIN_BEATS + Math.random() * (RAY_MAX_BEATS - RAY_MIN_BEATS);
  const durationBeats = RAY_MIN_DURATION_BEATS + Math.random() * (RAY_MAX_DURATION_BEATS - RAY_MIN_DURATION_BEATS);
  
  activeRays.push({
    originX: origin.x,
    originY: origin.y,
    angle: angle, // Use the safe, fixed angle. It does not track the player.
    startTime: now,
    growthBeats: growthBeats,
    durationBeats: durationBeats,
    endTime: now + durationBeats * SEC_PER_BEAT,
    hit: false
  });
}

function updateRays(scene) {
  const now = scene.sound.context.currentTime;
  
  const minSecs = RAY_MIN_SPAWN_INTERVAL_BEATS * SEC_PER_BEAT;
  const maxSecs = RAY_MAX_SPAWN_INTERVAL_BEATS * SEC_PER_BEAT;
  
  if (now >= nextRaySpawnTime && gameState === 'level') {
    spawnRay(scene);
    lastRaySpawnTime = now;
    // Schedule next spawn based on new beat constants
    nextRaySpawnTime = now + (minSecs + Math.random() * (maxSecs - minSecs));
  }
  
  activeRays = activeRays.filter(ray => {
    const finalEndTime = ray.endTime;
    if (now >= finalEndTime) return false;
    
    // Calculate current ray geometry (required for collision check below)
    const elapsed = now - ray.startTime;
    const growthProgress = Math.min(1, elapsed / (ray.growthBeats * SEC_PER_BEAT));
    // The ray should always extend fully beyond the screen when growthProgress is 1
    const currentLength = Math.pow(growthProgress, 2) * RAY_MAX_LENGTH; 
    
    // Use the fixed angle (ray.angle)
    const endX = ray.originX + Math.cos(ray.angle) * currentLength;
    const endY = ray.originY + Math.sin(ray.angle) * currentLength;
    
    // Check collision
    if (gameState === 'level' && !ray.hit) {
      
      // Check for collision throughout the ray's growth phase (while length is increasing)
      if (growthProgress > 0) { 
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
  
  // Calculate point on the ray line segment closest to the ship
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
    
    // Use the fixed ray.angle to calculate the endpoint
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