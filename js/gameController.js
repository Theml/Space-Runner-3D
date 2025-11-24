// Game Controller - Main Game Logic Coordinator
class GameController {
  constructor() {
    this.setupEngine();
    this.gameState = new GameStateManager();
    this.uiManager = new UIManager();
    this.shopManager = new ShopManager();
    this.player = new Player(
      this.scene,
      this.shopManager.getEquippedShip().modelPath
    );
    this.entityFactory = new EntityFactory(this.scene);
    this.powerUpManager = new PowerUpManager();
    this.weaponSystem = new WeaponSystem(this.entityFactory);

    // Sistema de áudio
    this.menuMusic = null;
    this.gameplayMusic = null;
    this.pauseMusic = null;
    this.currentMusic = null;
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
    this.initAllMusic();
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
    this.uiManager.updateCoins(this.shopManager.getCoins());
    this.uiManager.updateMenuCoins(this.shopManager.getCoins());
    // Tenta tocar música do menu (pode ser bloqueado até interação)
    if (this.gameState.currentState === GameState.MENU) {
      this.playMusic("menu");
    }
  }

  createStars() {
    for (let i = 0; i < GameConfig.STAR_COUNT; i++) {
      this.gameState.game.stars.push(this.entityFactory.createStar());
    }
  }

  start() {
    // Ao iniciar jogo, muda para música de gameplay
    this.stopAllMusic();
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
    this.playMusic("gameplay");
  }

  pause() {
    this.gameState.game.isPlaying = false;
    this.gameState.setState(GameState.PAUSED);
    this.stopAllMusic();
    this.uiManager.showHUD(false);
    this.uiManager.showScreen("pauseScreen");
    this.playMusic("pause");
  }

  resume() {
    this.gameState.game.isPlaying = true;
    this.gameState.setState(GameState.PLAYING);
    this.stopAllMusic();
    this.uiManager.hideAllScreens();
    this.uiManager.showHUD(true);
    this.playMusic("gameplay");
  }

  goToMenu() {
    // Para o jogo e limpa objetos
    this.gameState.game.isPlaying = false;
    this.gameState.setState(GameState.MENU);
    this.gameState.clearGameObjects();
    this.stopAllMusic();
    this.uiManager.showHUD(false);
    this.uiManager.showScreen("menuScreen");
    this.playMusic("menu");
  }

  gameOver() {
    this.gameState.game.isPlaying = false;
    this.gameState.setState(GameState.GAME_OVER);

    // Adiciona moedas baseado na pontuação
    const coinsEarned = this.shopManager.addCoins(this.gameState.score);

    this.uiManager.showGameOver(
      this.gameState.score,
      this.gameState.highScore,
      coinsEarned,
      this.shopManager.getCoins()
    );
  }

  shoot() {
    const position = this.player.getPosition();
    if (!position) return;

    const projectiles = this.weaponSystem.shoot(position, this.powerUpManager);
    this.gameState.game.projectiles.push(...projectiles);
  }

  openShop() {
    this.uiManager.showScreen("shopScreen");
    this.populateShopGrid();
  }

  closeShop() {
    this.cleanupShopPreviews();
    this.uiManager.hideScreen("shopScreen");
    this.uiManager.showScreen("menuScreen");
    this.uiManager.updateMenuCoins(this.shopManager.getCoins());
  }

  cleanupShopPreviews() {
    if (this.shopPreviews) {
      this.shopPreviews.forEach((preview) => {
        if (preview.engine) {
          preview.engine.stopRenderLoop();
          preview.scene.dispose();
          preview.engine.dispose();
        }
      });
      this.shopPreviews = [];
    }
  }

  populateShopGrid() {
    const shipGrid = document.getElementById("shipGrid");
    const shopCoinsDisplay = document.getElementById("shopCoins");
    const currentCoins = this.shopManager.getCoins();

    shopCoinsDisplay.textContent = currentCoins;
    shipGrid.innerHTML = "";

    // Limpa previews anteriores
    this.cleanupShopPreviews();
    this.shopPreviews = [];

    const ships = this.shopManager.ships;
    const progress = this.shopManager.loadProgress();

    ships.forEach((ship, index) => {
      const isUnlocked = progress.unlockedShips.includes(ship.id);
      const isEquipped = progress.equippedShip === ship.id;

      const card = document.createElement("div");
      card.className = "ship-card";
      if (!isUnlocked) card.classList.add("locked");
      if (isEquipped) card.classList.add("equipped");

      const preview = document.createElement("div");
      preview.className = "ship-preview";
      preview.id = `ship-preview-${index}`;

      const name = document.createElement("h3");
      name.textContent = ship.name;

      const price = document.createElement("div");
      price.className = "ship-price";
      price.textContent = isUnlocked ? "DESBLOQUEADA" : `🪙 ${ship.price}`;

      card.appendChild(preview);
      card.appendChild(name);
      card.appendChild(price);

      if (!isUnlocked) {
        const buyBtn = document.createElement("button");
        buyBtn.className = "btn btn-buy";
        buyBtn.textContent = "COMPRAR";
        buyBtn.disabled = currentCoins < ship.price;
        buyBtn.onclick = () => this.buyShip(ship.id);
        card.appendChild(buyBtn);
      } else if (!isEquipped) {
        const equipBtn = document.createElement("button");
        equipBtn.className = "btn btn-equip";
        equipBtn.textContent = "EQUIPAR";
        equipBtn.onclick = () => this.equipShip(ship.id);
        card.appendChild(equipBtn);
      } else {
        const equippedBtn = document.createElement("button");
        equippedBtn.className = "btn btn-equipped";
        equippedBtn.textContent = "EQUIPADA";
        equippedBtn.disabled = true;
        card.appendChild(equippedBtn);
      }

      shipGrid.appendChild(card);

      // Renderiza o modelo 3D no preview
      setTimeout(
        () => this.createShipPreview(ship, preview.id, index),
        50 * index
      );
    });
  }

  createShipPreview(ship, containerId, index) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    container.appendChild(canvas);

    const engine = new BABYLON.Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

    // Camera - ajustada para melhor visualização
    const camera = new BABYLON.ArcRotateCamera(
      "previewCamera",
      Math.PI / 2,
      Math.PI / 3,
      4.5,
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.lowerRadiusLimit = 3;
    camera.upperRadiusLimit = 8;
    camera.attachControl(canvas, true);
    camera.wheelPrecision = 50;

    // Lighting - melhorada para destacar os modelos
    const light1 = new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(1, 1, 0),
      scene
    );
    light1.intensity = 1.0;

    const light2 = new BABYLON.DirectionalLight(
      "light2",
      new BABYLON.Vector3(-1, -2, -1),
      scene
    );
    light2.intensity = 0.8;

    const light3 = new BABYLON.PointLight(
      "light3",
      new BABYLON.Vector3(2, 2, 2),
      scene
    );
    light3.intensity = 0.6;

    // Carrega o modelo
    const pathInfo = this._splitPath(ship.modelPath);
    BABYLON.SceneLoader.ImportMesh(
      "",
      pathInfo.rootUrl,
      pathInfo.fileName,
      scene,
      (meshes) => {
        if (meshes.length > 0) {
          // Centraliza e escala o modelo
          const boundingInfo = meshes[0].getHierarchyBoundingVectors(true);
          const sizeVec = boundingInfo.max.subtract(boundingInfo.min);
          const maxSize = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);
          const scale = 2.5 / maxSize;

          meshes.forEach((mesh) => {
            if (mesh) {
              mesh.scaling.scaleInPlace(scale);
              mesh.rotation.y = Math.PI;
            }
          });

          // Animação de rotação suave
          scene.registerBeforeRender(() => {
            meshes.forEach((mesh) => {
              if (mesh) {
                mesh.rotation.y += 0.008;
              }
            });
          });
        }
      },
      null,
      (scene, message) => {
        console.warn(`Falha ao carregar preview de ${ship.name}:`, message);
      }
    );

    engine.runRenderLoop(() => {
      scene.render();
    });

    this.shopPreviews.push({ engine, scene, canvas });
  }

  _splitPath(fullPath) {
    const parts = fullPath.split("/");
    const fileName = parts.pop();
    const rootUrl = parts.join("/") + "/";
    return { rootUrl, fileName };
  }

  buyShip(shipId) {
    if (this.shopManager.buyShip(shipId)) {
      this.populateShopGrid();
    } else {
      alert("Moedas insuficientes!");
    }
  }

  equipShip(shipId) {
    if (this.shopManager.equipShip(shipId)) {
      // Atualiza o modelo da nave do jogador
      this.player.updateModel(this.shopManager.getEquippedShip().modelPath);
      this.populateShopGrid();
    }
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

  // ====== Sistema de Áudio ======
  initAllMusic() {
    try {
      console.log("[AUDIO] Inicializando sistema de música...");

      // Música do Menu (Stardust Whispers)
      this.menuMusic = this._createAudioTrack(
        "assets/sounds/Stardust Whispers.mp3",
        "menu"
      );

      // Música do Gameplay (Running Through the Stars)
      this.gameplayMusic = this._createAudioTrack(
        "assets/sounds/Running Through the Stars.mp3",
        "gameplay"
      );

      // Música da Pausa (Galactic-Drift)
      this.pauseMusic = this._createAudioTrack(
        "assets/sounds/Galactic-Drift.mp3",
        "pause"
      );

      this.audioLoadRetries = 0;
      this.maxRetries = 3;
    } catch (e) {
      console.error("[AUDIO] Falha ao inicializar sistema de música:", e);
    }
  }

  _createAudioTrack(url, name) {
    const audio = new Audio(url);
    audio.preload = "auto";
    audio.loop = true;
    audio.volume = 0.3;
    audio.trackName = name;
    audio.ready = false;

    audio.addEventListener(
      "canplaythrough",
      () => {
        console.log(`[AUDIO] ${name} pronto para reprodução`);
        audio.ready = true;
      },
      { once: true }
    );

    audio.addEventListener("error", (e) => {
      console.error(`[AUDIO] Erro ao carregar ${name}:`, e);
    });

    audio.load();
    return audio;
  }

  playMusic(type) {
    let audio = null;

    switch (type) {
      case "menu":
        audio = this.menuMusic;
        break;
      case "gameplay":
        audio = this.gameplayMusic;
        break;
      case "pause":
        audio = this.pauseMusic;
        break;
      default:
        console.warn(`[AUDIO] Tipo de música desconhecido: ${type}`);
        return;
    }

    if (!audio) {
      console.warn(`[AUDIO] Música ${type} não inicializada`);
      return;
    }

    console.log(`[AUDIO] Tentando tocar música: ${type}`);

    if (audio.ready || audio.readyState >= 3) {
      audio
        .play()
        .then(() => {
          console.log(`[AUDIO] ✓ ${type} tocando`);
          this.currentMusic = audio;
          this.audioLoadRetries = 0;
        })
        .catch((err) => {
          console.error(`[AUDIO] Erro ao tocar ${type}:`, err);
        });
    } else {
      if (this.audioLoadRetries < this.maxRetries) {
        this.audioLoadRetries++;
        console.log(
          `[AUDIO] Aguardando ${type}... (${this.audioLoadRetries}/${this.maxRetries})`
        );
        setTimeout(() => this.playMusic(type), 1000);
      } else {
        console.warn(`[AUDIO] Timeout ao carregar ${type}`);
      }
    }
  }

  stopAllMusic() {
    [this.menuMusic, this.gameplayMusic, this.pauseMusic].forEach((audio) => {
      if (audio && !audio.paused) {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (e) {}
      }
    });
    this.currentMusic = null;
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
          setTimeout(() => this.playMusic("menu"), 100);
        } else if (this.gameState.currentState === GameState.PLAYING) {
          setTimeout(() => this.playMusic("gameplay"), 100);
        } else if (this.gameState.currentState === GameState.PAUSED) {
          setTimeout(() => this.playMusic("pause"), 100);
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

function openShop() {
  if (gameController) {
    gameController.openShop();
  }
}

function closeShop() {
  if (gameController) {
    gameController.closeShop();
  }
}

function buyShip(shipId) {
  if (gameController) {
    gameController.buyShip(shipId);
  }
}

function equipShip(shipId) {
  if (gameController) {
    gameController.equipShip(shipId);
  }
}

// Initialize game when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  gameController = new GameController();
});
