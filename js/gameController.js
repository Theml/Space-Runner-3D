// Game Controller - Main Game Logic Coordinator
class GameController {
  constructor() {
    this.setupEngine();
    this.gameState = new GameStateManager();
    this.uiManager = new UIManager();
    this.player = new Player(this.scene);
    this.entityFactory = new EntityFactory(this.scene);
    this.powerUpManager = new PowerUpManager();
    this.weaponSystem = new WeaponSystem(this.entityFactory);
    // Áudio do menu
    this.menuMusic = null;
    this._audioUnlocked = false;

    this.gameLoop = new GameLoop(
      this.scene,
      this.gameState,
      this.player,
      this.entityFactory,
      this.powerUpManager,
      this.weaponSystem,
      this.uiManager
    );

    this.gameLoop.onGameOver = () => this.gameOver();
    this.inputManager = new InputManager(this.gameState, this);

    // Inicializa música e desbloqueio de áudio por interação do usuário
    this.initMenuMusic();
    this.setupAudioUnlock();

    this.init();
  }

  setupEngine() {
    const canvas = document.getElementById("renderCanvas");
    this.engine = new BABYLON.Engine(canvas, true);
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color3(0, 0, 0.1);
    this.scene.audioEnabled = true;

    // Camera
    this.camera = new BABYLON.ArcRotateCamera(
      "camera",
      0,
      Math.PI / 3,
      15,
      new BABYLON.Vector3(0, 2, 0),
      this.scene
    );
    this.camera.lowerRadiusLimit = 12;
    this.camera.upperRadiusLimit = 18;
    this.camera.lowerBetaLimit = Math.PI / 4;
    this.camera.upperBetaLimit = Math.PI / 2.5;
    this.camera.attachControl(canvas, true);

    // Lighting
    const light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    light.intensity = 0.7;

    const dirLight = new BABYLON.DirectionalLight(
      "dirLight",
      new BABYLON.Vector3(0, -1, 0.5),
      this.scene
    );
    dirLight.intensity = 0.5;
  }

  init() {
    this.createStars();
    this.gameLoop.start();
    this.startRenderLoop();
    this.setupResize();
    this.uiManager.updateHighScore(this.gameState.highScore);
    // Tenta tocar música do menu (pode ser bloqueado até interação)
    if (this.gameState.currentState === GameState.MENU) {
      this.playMenuMusic();
    }
  }

  createStars() {
    for (let i = 0; i < GameConfig.STAR_COUNT; i++) {
      this.gameState.game.stars.push(this.entityFactory.createStar());
    }
  }

  start() {
    // Ao iniciar jogo, para a música do menu
    this.stopMenuMusic();
    this.gameState.clearGameObjects();
    this.gameState.reset();

    this.gameState.game.ship = this.player.create();
    this.gameState.game.shipTrail = this.player.trail;

    this.powerUpManager.clear();
    this.gameState.setState(GameState.PLAYING);

    this.uiManager.hideAllScreens();
    this.uiManager.showHUD(true);
    this.uiManager.updateScore(this.gameState.score);
    this.uiManager.updateLives(this.gameState.lives);
  }

  pause() {
    this.gameState.game.isPlaying = false;
    this.gameState.setState(GameState.PAUSED);
    this.uiManager.showHUD(false);
    this.uiManager.showScreen("pauseScreen");
  }

  resume() {
    this.gameState.game.isPlaying = true;
    this.gameState.setState(GameState.PLAYING);
    this.uiManager.hideAllScreens();
    this.uiManager.showHUD(true);
  }

  goToMenu() {
    // Para o jogo e limpa objetos
    this.gameState.game.isPlaying = false;
    this.gameState.setState(GameState.MENU);
    this.gameState.clearGameObjects();
    this.uiManager.showHUD(false);
    this.uiManager.showScreen("menuScreen");
    this.playMenuMusic();
  }

  gameOver() {
    this.gameState.game.isPlaying = false;
    this.gameState.setState(GameState.GAME_OVER);
    this.uiManager.showGameOver(this.gameState.score, this.gameState.highScore);
  }

  shoot() {
    const position = this.player.getPosition();
    if (!position) return;

    const projectiles = this.weaponSystem.shoot(position, this.powerUpManager);
    this.gameState.game.projectiles.push(...projectiles);
  }

  startRenderLoop() {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }

  setupResize() {
    window.addEventListener("resize", () => {
      this.engine.resize();
    });
  }

  // ====== Áudio do Menu ======
  initMenuMusic() {
    try {
      const musicUrl = "assets/sounds/Running Through the Stars.mp3";
      this.menuMusicReady = false;
      this.audioLoadRetries = 0;
      this.maxRetries = 3;

      console.log("[AUDIO] Iniciando carregamento:", musicUrl);

      // Para arquivos grandes (>2MB), HTMLAudio com streaming é mais eficiente
      this.htmlAudio = new Audio(musicUrl);
      this.htmlAudio.preload = "auto";
      this.htmlAudio.loop = true;
      this.htmlAudio.volume = 0.5;

      // Listeners de progresso
      this.htmlAudio.addEventListener("loadstart", () => {
        console.log("[AUDIO] Download iniciado...");
      });

      this.htmlAudio.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          console.log(`[AUDIO] Carregando: ${percent}%`);
        }
      });

      this.htmlAudio.addEventListener(
        "canplaythrough",
        () => {
          console.log("[AUDIO] Áudio pronto para reprodução!");
          this.menuMusicReady = true;
        },
        { once: true }
      );

      this.htmlAudio.addEventListener("error", (e) => {
        console.error("[AUDIO] Erro ao carregar:", e);
        console.error("[AUDIO] Detalhes:", this.htmlAudio.error);
      });

      // Inicia o carregamento
      this.htmlAudio.load();

      // Babylon.Sound como backup (opcional, só se HTMLAudio falhar)
      this.menuMusic = new BABYLON.Sound(
        "menuMusic",
        musicUrl,
        this.scene,
        () => {
          console.log("[AUDIO] Babylon.Sound carregado (backup)");
        },
        { loop: true, autoplay: false, volume: 0.5, streaming: true }
      );
    } catch (e) {
      console.error("[AUDIO] Falha ao inicializar música do menu:", e);
    }
  }

  playMenuMusic() {
    console.log("[AUDIO] Tentando tocar música do menu...");

    // Prioriza HTMLAudio para arquivos grandes
    if (this.htmlAudio) {
      if (this.menuMusicReady || this.htmlAudio.readyState >= 3) {
        // readyState 3 = HAVE_FUTURE_DATA, 4 = HAVE_ENOUGH_DATA
        this.htmlAudio
          .play()
          .then(() => {
            console.log("[AUDIO] ✓ Música tocando (HTMLAudio)");
            this.audioLoadRetries = 0;
          })
          .catch((err) => {
            console.error("[AUDIO] Erro ao tocar HTMLAudio:", err);
            this._tryBabylonFallback();
          });
      } else {
        // Ainda carregando - limita tentativas
        if (this.audioLoadRetries < this.maxRetries) {
          this.audioLoadRetries++;
          console.log(
            `[AUDIO] Aguardando carregamento... (tentativa ${this.audioLoadRetries}/${this.maxRetries})`
          );
          setTimeout(() => this.playMenuMusic(), 1000);
        } else {
          console.warn(
            "[AUDIO] Timeout - arquivo pode ser muito grande ou conexão lenta"
          );
        }
      }
    } else {
      this._tryBabylonFallback();
    }
  }

  _tryBabylonFallback() {
    if (
      this.menuMusic &&
      this.menuMusic.isReady() &&
      !this.menuMusic.isPlaying
    ) {
      try {
        this.menuMusic.play();
        console.log("[AUDIO] ✓ Música tocando (Babylon.Sound)");
      } catch (e) {
        console.error("[AUDIO] Falha no fallback Babylon.Sound:", e);
      }
    }
  }

  setupAudioUnlock() {
    const unlock = () => {
      console.log("Desbloqueando áudio após interação do usuário");

      if (!this._audioUnlocked) {
        this._audioUnlocked = true;

        // Desbloqueia engine de áudio do Babylon
        try {
          if (BABYLON.Engine && BABYLON.Engine.audioEngine) {
            BABYLON.Engine.audioEngine.unlock();
          }
        } catch (e) {
          console.error("Erro ao desbloquear audioEngine:", e);
        }

        // Tenta tocar a música se estiver no menu
        if (this.gameState.currentState === GameState.MENU) {
          // Aguarda um pouco para garantir que tudo está pronto
          setTimeout(() => this.playMenuMusic(), 100);
        }
      }
    };

    // Adiciona listeners múltiplos para garantir captura
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    window.addEventListener("click", unlock, { once: true });
  }
}

// Global functions for HTML onclick handlers
let gameController;

function startGame() {
  if (gameController) {
    gameController.start();
  }
}

function resumeGame() {
  if (gameController) {
    gameController.resume();
  }
}

function goToMenu() {
  if (gameController) {
    gameController.goToMenu();
  }
}

function quitGame() {
  // Tenta fechar a aba; se não permitido, navega para about:blank
  try {
    window.open("", "_self");
    window.close();
  } catch (e) {}
  setTimeout(() => {
    try {
      if (!window.closed) {
        window.location.href = "about:blank";
      }
    } catch (e) {}
  }, 150);
}

// Initialize game when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  gameController = new GameController();
});
