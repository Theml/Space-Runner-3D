// Input Management
class InputManager {
  constructor(gameStateManager, gameController) {
    this.gameStateManager = gameStateManager;
    this.gameController = gameController;
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener("keydown", (e) => this.handleKeyDown(e));
    window.addEventListener("keyup", (e) => this.handleKeyUp(e));
  }

  handleKeyDown(e) {
    const key = e.key.toLowerCase();
    this.gameStateManager.setKey(key, true);

    // Atirar
    if (
      key === " " &&
      this.gameStateManager.game.isPlaying &&
      this.gameStateManager.game.ship
    ) {
      e.preventDefault();
      this.gameController.shoot();
    }

    // Pausar/Despausar
    if (key === "p" || key === "escape") {
      if (
        this.gameStateManager.currentState === GameState.PLAYING &&
        this.gameStateManager.game.isPlaying
      ) {
        this.gameController.pause();
      } else if (this.gameStateManager.currentState === GameState.PAUSED) {
        this.gameController.resume();
      }
    }

    // Reiniciar no game over
    if (
      key === "r" &&
      this.gameStateManager.currentState === GameState.GAME_OVER
    ) {
      this.gameController.start();
    }
  }

  handleKeyUp(e) {
    const key = e.key.toLowerCase();
    this.gameStateManager.setKey(key, false);
  }
}
