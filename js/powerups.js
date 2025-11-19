// Power-up Management
class PowerUpManager {
  constructor() {
    this.activePowerUps = new Map();
  }

  apply(type) {
    this.activePowerUps.set(type, GameConfig.POWERUP_DURATION);
    this.updateDisplay();
  }

  update(gameState) {
    this.activePowerUps.forEach((duration, type) => {
      this.activePowerUps.set(type, duration - 1);
      if (duration <= 1) {
        this.activePowerUps.delete(type);
      }
    });

    // Aplicar efeito de slow motion
    if (this.activePowerUps.has(PowerUpType.SLOW_MOTION)) {
      gameState.game.speed = Math.max(0.05, gameState.game.speed * 0.7);
    }

    this.updateDisplay();
  }

  has(type) {
    return this.activePowerUps.has(type);
  }

  remove(type) {
    this.activePowerUps.delete(type);
    this.updateDisplay();
  }

  clear() {
    this.activePowerUps.clear();
    this.updateDisplay();
  }

  updateDisplay() {
    const powerUpElement = document.getElementById("activePowerups");
    if (!powerUpElement) return;

    if (this.activePowerUps.size === 0) {
      powerUpElement.textContent = "None";
      return;
    }

    let html = "";
    this.activePowerUps.forEach((duration, type) => {
      let icon = "❓";
      switch (type) {
        case PowerUpType.SHIELD:
          icon = "🛡️";
          break;
        case PowerUpType.RAPID_FIRE:
          icon = "🔥";
          break;
        case PowerUpType.SLOW_MOTION:
          icon = "⏱️";
          break;
        case PowerUpType.TRIPLE_SHOT:
          icon = "🔺";
          break;
      }
      html += `<span class="powerup-icon" title="${type}">${icon}</span>`;
    });

    powerUpElement.innerHTML = html;
  }
}
