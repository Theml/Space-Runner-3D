// Weapon System
class WeaponSystem {
  constructor(entityFactory) {
    this.entityFactory = entityFactory;
    this.cooldown = 0;
  }

  update() {
    if (this.cooldown > 0) {
      this.cooldown--;
    }
  }

  canShoot() {
    return this.cooldown <= 0;
  }

  shoot(position, powerUpManager) {
    if (!this.canShoot()) return [];

    const projectiles = [];
    const cooldownTime = powerUpManager.has(PowerUpType.RAPID_FIRE)
      ? GameConfig.RAPID_FIRE_COOLDOWN
      : GameConfig.NORMAL_FIRE_COOLDOWN;

    this.cooldown = cooldownTime;

    if (powerUpManager.has(PowerUpType.TRIPLE_SHOT)) {
      // Disparo triplo
      projectiles.push(this.entityFactory.createProjectile(position, -0.5));
      projectiles.push(this.entityFactory.createProjectile(position, 0));
      projectiles.push(this.entityFactory.createProjectile(position, 0.5));
    } else {
      // Disparo simples
      projectiles.push(this.entityFactory.createProjectile(position));
    }

    return projectiles;
  }
}
