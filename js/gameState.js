// Game State Management
class GameStateManager {
  constructor() {
    this.currentState = GameState.MENU;
    this.score = 0;
    this.lives = GameConfig.INITIAL_LIVES;
    this.highScore = 0;

    this.game = {
      ship: null,
      asteroids: [],
      collectibles: [],
      powerUps: [],
      projectiles: [],
      stars: [],
      particles: [],
      speed: GameConfig.INITIAL_SPEED,
      spawnTimer: 0,
      collectTimer: 0,
      powerUpTimer: 0,
      keys: {},
      isPlaying: false,
      invulnerable: false,
      invulnerableTimer: 0,
      activePowerUps: new Map(),
      shootCooldown: 0,
      shipTrail: [],
    };
  }

  reset() {
    this.score = 0;
    this.lives = GameConfig.INITIAL_LIVES;
    this.game.speed = GameConfig.INITIAL_SPEED;
    this.game.spawnTimer = 0;
    this.game.collectTimer = 0;
    this.game.powerUpTimer = 0;
    this.game.isPlaying = true;
    this.game.invulnerable = false;
    this.game.invulnerableTimer = 0;
    this.game.shootCooldown = 0;
    this.game.activePowerUps.clear();
  }

  clearGameObjects() {
    this.game.asteroids.forEach((a) => a.dispose());
    this.game.collectibles.forEach((c) => c.dispose());
    this.game.powerUps.forEach((p) => p.dispose());
    this.game.projectiles.forEach((p) => p.dispose());
    this.game.particles.forEach((p) => p.dispose());
    this.game.shipTrail.forEach((t) => t.dispose());

    this.game.asteroids = [];
    this.game.collectibles = [];
    this.game.powerUps = [];
    this.game.projectiles = [];
    this.game.particles = [];
    this.game.shipTrail = [];

    if (this.game.ship) this.game.ship.dispose();
  }

  setState(state) {
    this.currentState = state;
  }

  addScore(points) {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  loseLife() {
    this.lives--;
    return this.lives <= 0;
  }

  setKey(key, value) {
    this.game.keys[key] = value;
  }

  isKeyPressed(key) {
    return this.game.keys[key] === true;
  }
}
