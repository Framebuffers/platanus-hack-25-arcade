// Minimal scaffolding: title screen, grid, scanline, ship movement

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    scene: { create, update }
  };
  
  const game = new Phaser.Game(config);
  
  // === GLOBAL SETTINGS (single source of truth) ===
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
  const RAY_COOLDOWN_TIME = 5;
  const RAY_TARGET_OFFSET = 0.35;
  const RAY_POST_HIT_DURATION_MIN = 3;
  const RAY_POST_HIT_DURATION_MAX = 5;
  const RAY_MIN_SPAWN_DISTANCE = 150;
  const RAY_MIN_SAFE_CELLS = 2; // Minimum cells away from player line of sight
  const RAY_MAX_LENGTH = 2000;
  const RAY_LINE_WIDTH = 2;
  const RAY_COLOR_NORMAL = 0xffffff;
  const RAY_COLOR_HIT = 0xff0000;
  
  // Text settings
  const TEXT_CHAR_WIDTH = 50;
  const TEXT_CHAR_HEIGHT = 80;
  const TEXT_CHAR_SPACING = 1.2;
  const TEXT_LINE_WIDTH = 2;
  const TEXT_COLOR = 0x00ffff;
  
  // === GLOBAL STATE ===
  let gfx;
  let cursors;
  let wasd;
  let gameState = 'title';
  let shipPos = { x: SHIP_START_X, y: SHIP_START_Y };
  let shipVel = { x: 0, y: 0 };
  let beatStartTime = 0;
  let activeRays = [];
  let lastRaySpawnTime = 0;
  let nextRaySpawnTime = 0;
  let rayCooldownEnd = 0;
  
  // === VECTOR FONT ===
  const VECTOR_FONT = {
    'v': [[0,0, 0.5,1, 1,0]],
    'i': [[0.5,0, 0.5,1]],
    'b': [[0,0, 0,1, 0.7,1, 0.7,0.5, 0,0.5, 0.7,0.5, 0.7,0, 0,0]],
    'e': [[1,0, 0,0, 0,0.5, 0.6,0.5], [0,0.5, 0,1, 1,1]],
    'a': [[0,1, 0.5,0, 1,1], [0.25,0.5, 0.75,0.5]],
    't': [[0,0, 1,0], [0.5,0, 0.5,1]],
    'r': [[0,1, 0,0, 0.7,0, 0.7,0.5, 0,0.5], [0.7,0.5, 1,1]],
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
    wasd = scene.input.keyboard.addKeys('W,S,A,D');
    
    scene.input.keyboard.on('keydown', () => {
      if (gameState === 'title') {
        gameState = 'level';
        beatStartTime = scene.sound.context.currentTime;
        shipPos = { x: SHIP_START_X, y: SHIP_START_Y };
        shipVel = { x: 0, y: 0 };
        activeRays = [];
        lastRaySpawnTime = scene.sound.context.currentTime;
        nextRaySpawnTime = lastRaySpawnTime + (RAY_MIN_SPAWN_INTERVAL + Math.random() * (RAY_MAX_SPAWN_INTERVAL - RAY_MIN_SPAWN_INTERVAL));
        rayCooldownEnd = 0;
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
  
  // === TITLE SCREEN ===
  function drawTitleScreen() {
    gfx.clear();
    drawCenteredVectorText(GAME_NAME);
  }
  
  // === LEVEL DRAWING ===
  function drawLevel(scene) {
    gfx.clear();
    const scanY = getScanlinePosition(scene);
    updateRays(scene);
    drawGrid(scanY);
    drawRays(scene);
    drawShip();
  }
  
  function getScanlinePosition(scene) {
    const now = scene.sound.context.currentTime;
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
  function drawShip() {
    const x = shipPos.x;
    const y = shipPos.y;
    
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
  }
  
  function getShipCollisionRadius() {
    const shipArea = Math.PI * SHIP_SIZE * SHIP_SIZE;
    const collisionArea = shipArea * (1 + SHIP_COLLISION_RATE);
    return Math.sqrt(collisionArea / Math.PI);
  }
  
  // === VECTOR TEXT ===
  function drawVectorChar(x, y, w, h, strokes) {
    gfx.lineStyle(TEXT_LINE_WIDTH, TEXT_COLOR, 1);
    
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
  
  function drawVectorText(text, x, y) {
    const chars = text.toLowerCase().split('');
    const spacing = TEXT_CHAR_WIDTH * TEXT_CHAR_SPACING;
    
    chars.forEach((char, idx) => {
      const strokes = VECTOR_FONT[char] || [];
      drawVectorChar(x + idx * spacing, y, TEXT_CHAR_WIDTH, TEXT_CHAR_HEIGHT, strokes);
    });
  }
  
  function drawCenteredVectorText(text) {
    const totalWidth = text.length * TEXT_CHAR_WIDTH * TEXT_CHAR_SPACING;
    const x = (SCREEN_WIDTH - totalWidth) / 2;
    const y = (SCREEN_HEIGHT - TEXT_CHAR_HEIGHT) / 2;
    
    drawVectorText(text, x, y);
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
  
  function isInLineOfSight(origin, shipPos) {
    const dx = Math.abs(origin.x - shipPos.x);
    const dy = Math.abs(origin.y - shipPos.y);
    
    // Check if origin is within RAY_MIN_SAFE_CELLS of player's grid position
    const cellsAwayX = dx / GRID_CELL_WIDTH;
    const cellsAwayY = dy / GRID_CELL_HEIGHT;
    
    // If either axis is less than minimum safe cells, it's in line of sight
    return cellsAwayX < RAY_MIN_SAFE_CELLS || cellsAwayY < RAY_MIN_SAFE_CELLS;
  }
  
  function getRandomGridIntersection() {
    const intersections = getGridIntersections();
    
    const validIntersections = intersections.filter(intersection => {
      const dx = intersection.x - shipPos.x;
      const dy = intersection.y - shipPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Must be far enough AND not in direct line of sight
      return distance >= RAY_MIN_SPAWN_DISTANCE && !isInLineOfSight(intersection, shipPos);
    });
    
    const candidates = validIntersections.length > 0 ? validIntersections : intersections;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  
  function spawnRay(scene) {
    const origin = getRandomGridIntersection();
    const growthBeats = RAY_MIN_BEATS + Math.random() * (RAY_MAX_BEATS - RAY_MIN_BEATS);
    const durationBeats = RAY_MIN_DURATION_BEATS + Math.random() * (RAY_MAX_DURATION_BEATS - RAY_MIN_DURATION_BEATS);
    const now = scene.sound.context.currentTime;
    
    const targetX = origin.x + (shipPos.x - origin.x) * RAY_TARGET_OFFSET;
    const targetY = origin.y + (shipPos.y - origin.y) * RAY_TARGET_OFFSET;
    
    const dx = targetX - origin.x;
    const dy = targetY - origin.y;
    const angle = Math.atan2(dy, dx);
    
    activeRays.push({
      originX: origin.x,
      originY: origin.y,
      angle: angle,
      startTime: now,
      growthBeats: growthBeats,
      durationBeats: durationBeats,
      endTime: now + durationBeats * SEC_PER_BEAT,
      hit: false,
      hitTime: 0,
      postHitEndTime: 0
    });
  }
  
  function handleRayHit(ray, scene) {
    const now = scene.sound.context.currentTime;
    
    if (!ray.hit) {
      ray.hit = true;
      ray.hitTime = now;
      const postHitDuration = RAY_POST_HIT_DURATION_MIN + Math.random() * (RAY_POST_HIT_DURATION_MAX - RAY_POST_HIT_DURATION_MIN);
      ray.postHitEndTime = now + postHitDuration;
      rayCooldownEnd = now + RAY_COOLDOWN_TIME;
    }
  }
  
  function updateRays(scene) {
    const now = scene.sound.context.currentTime;
    
    if (now >= nextRaySpawnTime && now >= rayCooldownEnd) {
      spawnRay(scene);
      lastRaySpawnTime = now;
      nextRaySpawnTime = now + (RAY_MIN_SPAWN_INTERVAL + Math.random() * (RAY_MAX_SPAWN_INTERVAL - RAY_MIN_SPAWN_INTERVAL));
    }
    
    activeRays = activeRays.filter(ray => {
      const finalEndTime = ray.hit ? ray.postHitEndTime : ray.endTime;
      if (now >= finalEndTime) return false;
      
      if (!ray.hit) {
        const elapsed = now - ray.startTime;
        const growthProgress = Math.min(1, elapsed / (ray.growthBeats * SEC_PER_BEAT));
        const currentLength = Math.pow(growthProgress, 2) * RAY_MAX_LENGTH;
        
        const endX = ray.originX + Math.cos(ray.angle) * currentLength;
        const endY = ray.originY + Math.sin(ray.angle) * currentLength;
        
        if (checkRayCollision(ray.originX, ray.originY, endX, endY)) {
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
    
    const dx = rayX2 - rayX1;
    const dy = rayY2 - rayY1;
    const lengthSq = dx * dx + dy * dy;
    
    if (lengthSq === 0) {
      const dist = Math.sqrt((shipX - rayX1) ** 2 + (shipY - rayY1) ** 2);
      return dist <= shipRadius;
    }
    
    const t = Math.max(0, Math.min(1, ((shipX - rayX1) * dx + (shipY - rayY1) * dy) / lengthSq));
    const projX = rayX1 + t * dx;
    const projY = rayY1 + t * dy;
    
    const dist = Math.sqrt((shipX - projX) ** 2 + (shipY - projY) ** 2);
    return dist <= shipRadius;
  }
  
  function drawRays(scene) {
    const now = scene.sound.context.currentTime;
    
    activeRays.forEach(ray => {
      const elapsed = now - ray.startTime;
      const growthProgress = Math.min(1, elapsed / (ray.growthBeats * SEC_PER_BEAT));
      const currentLength = Math.pow(growthProgress, 2) * RAY_MAX_LENGTH;
      
      const endX = ray.originX + Math.cos(ray.angle) * currentLength;
      const endY = ray.originY + Math.sin(ray.angle) * currentLength;
      
      const rayColor = ray.hit ? RAY_COLOR_HIT : RAY_COLOR_NORMAL;
      gfx.lineStyle(RAY_LINE_WIDTH, rayColor, 1);
      gfx.beginPath();
      gfx.moveTo(ray.originX, ray.originY);
      gfx.lineTo(endX, endY);
      gfx.strokePath();
    });
  }
  
  function restartGame(scene) {
    gameState = 'title';
    shipPos = { x: SHIP_START_X, y: SHIP_START_Y };
    shipVel = { x: 0, y: 0 };
    activeRays = [];
    lastRaySpawnTime = 0;
    nextRaySpawnTime = 0;
    beatStartTime = 0;
    rayCooldownEnd = 0;
  }