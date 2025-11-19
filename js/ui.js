// UI Management
class UIManager {
  updateScore(score) {
    const scoreElement = document.getElementById("score");
    if (scoreElement) {
      scoreElement.textContent = `Score: ${score}`;
    }
  }

  updateLives(lives) {
    const livesElement = document.getElementById("lives");
    if (livesElement) {
      let heartsHTML = "";
      for (let i = 0; i < lives; i++) {
        heartsHTML += "❤️ ";
      }
      livesElement.textContent = `Lives: ${heartsHTML}`;
    }
  }

  updateHighScore(highScore) {
    const elements = ["highScoreMenu", "highScoreGameOver"];
    elements.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = highScore;
      }
    });
  }

  showScreen(screenId) {
    const screens = ["menuScreen", "pauseScreen", "gameOverScreen"];
    screens.forEach((id) => {
      const screen = document.getElementById(id);
      if (screen) {
        if (id === screenId) {
          screen.classList.remove("hidden");
        } else {
          screen.classList.add("hidden");
        }
      }
    });
  }

  showHUD(visible) {
    const hud = document.getElementById("hud");
    if (hud) {
      if (visible) {
        hud.classList.remove("hidden");
      } else {
        hud.classList.add("hidden");
      }
    }
  }

  showGameOver(score, highScore) {
    const finalScoreElement = document.getElementById("finalScore");
    if (finalScoreElement) {
      finalScoreElement.textContent = score;
    }
    this.updateHighScore(highScore);
    this.showScreen("gameOverScreen");
  }

  hideAllScreens() {
    this.showScreen(null);
  }
}
