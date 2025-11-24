// UI Management
class UIManager {
  updateScore(score) {
    const scoreElement = document.getElementById("score");
    if (scoreElement) {
      scoreElement.textContent = `Score: ${score}`;
    }
  }

  updateCoins(coins) {
    const coinElement = document.getElementById("coinCount");
    if (coinElement) {
      coinElement.textContent = coins;
    }
  }

  updateMenuCoins(coins) {
    const menuCoinsElement = document.getElementById("menuCoins");
    if (menuCoinsElement) {
      menuCoinsElement.textContent = coins;
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
    const screens = [
      "menuScreen",
      "pauseScreen",
      "gameOverScreen",
      "shopScreen",
    ];
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

  hideScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.add("hidden");
    }
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

  showGameOver(score, highScore, coinsEarned, totalCoins) {
    const finalScoreElement = document.getElementById("finalScore");
    if (finalScoreElement) {
      finalScoreElement.textContent = score;
    }

    const coinsEarnedElement = document.getElementById("coinsEarned");
    if (coinsEarnedElement) {
      coinsEarnedElement.textContent = coinsEarned;
    }

    this.updateHighScore(highScore);
    this.showScreen("gameOverScreen");
  }

  hideAllScreens() {
    this.showScreen(null);
  }
}
