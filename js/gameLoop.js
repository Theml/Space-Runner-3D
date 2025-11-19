// Game Loop and Update Logic
class GameLoop {
  constructor(
    scene,
    gameStateManager,
    player,
    entityFactory,
    powerUpManager,
    weaponSystem,
    uiManager
  ) {
    this.scene = scene;
    this.gameState = gameStateManager;
    this.player = player;
    this.entityFactory = entityFactory;
    this.powerUpManager = powerUpManager;
    this.weaponSystem = weaponSystem;
    this.uiManager = uiManager;
  }

  start() {
    this.scene.registerBeforeRender(() => this.update());
  }

  update() {
    if (!this.gameState.game.isPlaying || !this.gameState.game.ship) return;

    this.weaponSystem.update();
    this.updatePlayer();
    this.updateStars();
    this.spawnEntities();
    this.powerUpManager.update(this.gameState);
    this.updateAsteroids();
    this.updateCollectibles();
    this.updatePowerUps();
    this.updateProjectiles();
    this.updateParticles();
    this.updateSpeed();
  }

  updatePlayer() {
    this.player.move(this.gameState.game.keys);

    if (this.gameState.game.invulnerable) {
      this.gameState.game.invulnerableTimer++;
      this.player.updateInvulnerability(
        true,
        this.gameState.game.invulnerableTimer
      );

      if (
        this.gameState.game.invulnerableTimer > GameConfig.INVULNERABLE_DURATION
      ) {
        this.gameState.game.invulnerable = false;
        this.gameState.game.invulnerableTimer = 0;
        this.player.updateInvulnerability(false, 0);
      }
    }
  }

  updateStars() {
    this.gameState.game.stars.forEach((star) => {
      star.position.z -= this.gameState.game.speed * (star.layer + 1) * 0.5;
      if (star.position.z < -10) {
        star.position.z = 100;
        star.position.x = (Math.random() - 0.5) * 100;
        star.position.y = (Math.random() - 0.5) * 50;
      }
    });
  }

  spawnEntities() {
    // Spawn asteroids
    this.gameState.game.spawnTimer++;
    const spawnRate = Math.max(
      GameConfig.ASTEROID_SPAWN_BASE - this.gameState.score * 0.01,
      GameConfig.ASTEROID_SPAWN_MIN
    );
    if (this.gameState.game.spawnTimer > spawnRate) {
      this.gameState.game.asteroids.push(this.entityFactory.createAsteroid());
      this.gameState.game.spawnTimer = 0;
    }

    // Spawn collectibles
    this.gameState.game.collectTimer++;
    if (this.gameState.game.collectTimer > GameConfig.COLLECTIBLE_SPAWN_RATE) {
      this.gameState.game.collectibles.push(
        this.entityFactory.createCollectible()
      );
      this.gameState.game.collectTimer = 0;
    }

    // Spawn power-ups
    this.gameState.game.powerUpTimer++;
    if (this.gameState.game.powerUpTimer > GameConfig.POWERUP_SPAWN_RATE) {
      this.gameState.game.powerUps.push(this.entityFactory.createPowerUp());
      this.gameState.game.powerUpTimer = 0;
    }
  }

  updateAsteroids() {
    for (let i = this.gameState.game.asteroids.length - 1; i >= 0; i--) {
      const asteroid = this.gameState.game.asteroids[i];
      asteroid.position.z -=
        this.gameState.game.speed + this.gameState.game.speed * 0.3;
      asteroid.rotation.x += asteroid.rotationSpeed.x;
      asteroid.rotation.y += asteroid.rotationSpeed.y;

      if (asteroid.position.z < -10) {
        asteroid.dispose();
        this.gameState.game.asteroids.splice(i, 1);
        this.gameState.addScore(1);
        this.uiManager.updateScore(this.gameState.score);
        continue;
      }

      if (
        !this.gameState.game.invulnerable &&
        this.player.intersectsWith(asteroid)
      ) {
        this.handleAsteroidCollision(asteroid, i);
      }
    }
  }

  handleAsteroidCollision(asteroid, index) {
    if (this.powerUpManager.has(PowerUpType.SHIELD)) {
      this.powerUpManager.remove(PowerUpType.SHIELD);
    } else {
      this.entityFactory.createExplosion(
        asteroid.position,
        this.gameState.game.particles
      );
      asteroid.dispose();
      this.gameState.game.asteroids.splice(index, 1);

      const gameOver = this.gameState.loseLife();
      this.uiManager.updateLives(this.gameState.lives);

      if (gameOver) {
        this.onGameOver();
      } else {
        this.gameState.game.invulnerable = true;
        this.gameState.game.invulnerableTimer = 0;
      }
    }
  }

  updateCollectibles() {
    for (let i = this.gameState.game.collectibles.length - 1; i >= 0; i--) {
      const collectible = this.gameState.game.collectibles[i];
      collectible.position.z -=
        this.gameState.game.speed + this.gameState.game.speed * 0.3;
      collectible.rotation.y += 0.05;

      if (collectible.position.z < -10) {
        collectible.dispose();
        this.gameState.game.collectibles.splice(i, 1);
        continue;
      }

      if (this.player.intersectsWith(collectible)) {
        collectible.dispose();
        this.gameState.game.collectibles.splice(i, 1);
        this.gameState.addScore(10);
        this.uiManager.updateScore(this.gameState.score);
      }
    }
  }

  updatePowerUps() {
    for (let i = this.gameState.game.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.gameState.game.powerUps[i];
      powerUp.position.z -=
        this.gameState.game.speed + this.gameState.game.speed * 0.3;
      powerUp.rotation.y += 0.03;
      powerUp.rotation.x += 0.02;

      if (powerUp.position.z < -10) {
        powerUp.dispose();
        this.gameState.game.powerUps.splice(i, 1);
        continue;
      }

      if (this.player.intersectsWith(powerUp)) {
        this.powerUpManager.apply(powerUp.type);
        powerUp.dispose();
        this.gameState.game.powerUps.splice(i, 1);
        this.gameState.addScore(5);
        this.uiManager.updateScore(this.gameState.score);
      }
    }
  }

  updateProjectiles() {
    for (let i = this.gameState.game.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.gameState.game.projectiles[i];
      projectile.position.z += 1;

      if (projectile.position.z > 60) {
        projectile.dispose();
        this.gameState.game.projectiles.splice(i, 1);
        continue;
      }

      for (let j = this.gameState.game.asteroids.length - 1; j >= 0; j--) {
        const asteroid = this.gameState.game.asteroids[j];
        if (projectile.intersectsMesh(asteroid, false)) {
          this.entityFactory.createExplosion(
            asteroid.position,
            this.gameState.game.particles
          );
          projectile.dispose();
          asteroid.dispose();
          this.gameState.game.projectiles.splice(i, 1);
          this.gameState.game.asteroids.splice(j, 1);
          this.gameState.addScore(5);
          this.uiManager.updateScore(this.gameState.score);
          break;
        }
      }
    }
  }

  updateParticles() {
    for (let i = this.gameState.game.particles.length - 1; i >= 0; i--) {
      const particle = this.gameState.game.particles[i];
      particle.position.addInPlace(particle.velocity);
      particle.life--;
      particle.scaling.scaleInPlace(0.95);

      if (particle.life <= 0) {
        particle.dispose();
        this.gameState.game.particles.splice(i, 1);
      }
    }
  }

  updateSpeed() {
    if (!this.powerUpManager.has(PowerUpType.SLOW_MOTION)) {
      this.gameState.game.speed = Math.min(
        this.gameState.game.speed + GameConfig.SPEED_INCREMENT,
        GameConfig.MAX_SPEED
      );
    }
  }

  onGameOver() {
    // Será definido pelo GameController
  }
}
