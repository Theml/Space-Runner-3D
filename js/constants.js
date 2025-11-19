// Game State Constants
const GameState = {
  MENU: "MENU",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  GAME_OVER: "GAME_OVER",
};

// Power-up Types
const PowerUpType = {
  SHIELD: "shield",
  RAPID_FIRE: "rapid_fire",
  SLOW_MOTION: "slow_motion",
  TRIPLE_SHOT: "triple_shot",
};

// Game Configuration
const GameConfig = {
  INITIAL_SPEED: 0.15,
  MAX_SPEED: 0.4,
  SPEED_INCREMENT: 0.0001,
  INITIAL_LIVES: 3,
  SHIP_MOVE_SPEED: 0.15,
  SHIP_MAX_X: 6,
  SHIP_MIN_Y: 0.5,
  SHIP_MAX_Y: 8,
  ASTEROID_SPAWN_BASE: 30,
  ASTEROID_SPAWN_MIN: 15,
  COLLECTIBLE_SPAWN_RATE: 180,
  POWERUP_SPAWN_RATE: 300,
  POWERUP_DURATION: 600,
  INVULNERABLE_DURATION: 120,
  RAPID_FIRE_COOLDOWN: 5,
  NORMAL_FIRE_COOLDOWN: 12,
  STAR_COUNT: 200,
};
