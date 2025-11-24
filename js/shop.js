// Shop System - Gerencia moedas, inventário e compra de naves
class ShopManager {
  constructor() {
    this.ships = [
      {
        id: "default",
        name: "Nave Padrão",
        modelPath: "assets/player/Spaceship.glb",
        icon: "🚀",
        price: 0,
        unlocked: true,
        description: "Nave inicial do jogo",
      },
      {
        id: "flying-car",
        name: "Flying Car",
        modelPath: "assets/player/Flying Car.glb",
        icon: "🚗",
        price: 500,
        unlocked: false,
        description: "Carro voador futurista",
      },
      {
        id: "futuristic-spaceship",
        name: "Futuristic Spaceship",
        modelPath: "assets/player/Futuristic Spaceship.glb",
        icon: "🛸",
        price: 1000,
        unlocked: false,
        description: "Nave espacial avançada",
      },
      {
        id: "space-fighter",
        name: "Space Fighter",
        modelPath: "assets/player/Space Fighter.glb",
        icon: "✈️",
        price: 1500,
        unlocked: false,
        description: "Caça espacial de combate",
      },
      {
        id: "flying-saucer",
        name: "Flying Saucer",
        modelPath: "assets/player/Flying Saucer.glb",
        icon: "🛸",
        price: 2000,
        unlocked: false,
        description: "Disco voador alienígena",
      },
    ];

    this.loadProgress();
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem("spaceRunnerProgress");
      if (saved) {
        const data = JSON.parse(saved);
        this.coins = data.coins || 0;
        this.totalCoins = data.totalCoins || 0;
        this.equippedShip = data.equippedShip || "default";

        // Restaura naves desbloqueadas
        if (data.unlockedShips) {
          data.unlockedShips.forEach((shipId) => {
            const ship = this.ships.find((s) => s.id === shipId);
            if (ship) ship.unlocked = true;
          });
        }
      } else {
        this.coins = 0;
        this.totalCoins = 0;
        this.equippedShip = "default";
      }
    } catch (e) {
      console.error("Erro ao carregar progresso:", e);
      this.coins = 0;
      this.totalCoins = 0;
      this.equippedShip = "default";
    }

    // Retorna o progresso atual
    return {
      coins: this.coins,
      totalCoins: this.totalCoins,
      equippedShip: this.equippedShip,
      unlockedShips: this.ships.filter((s) => s.unlocked).map((s) => s.id),
    };
  }

  saveProgress() {
    try {
      const data = {
        coins: this.coins,
        totalCoins: this.totalCoins,
        equippedShip: this.equippedShip,
        unlockedShips: this.ships.filter((s) => s.unlocked).map((s) => s.id),
      };
      localStorage.setItem("spaceRunnerProgress", JSON.stringify(data));
    } catch (e) {
      console.error("Erro ao salvar progresso:", e);
    }
  }

  addCoins(score) {
    // Conversão: 10 pontos = 1 moeda
    const coinsEarned = Math.floor(score / 10);
    this.coins += coinsEarned;
    this.totalCoins += coinsEarned;
    this.saveProgress();
    return coinsEarned;
  }

  canBuy(shipId) {
    const ship = this.ships.find((s) => s.id === shipId);
    if (!ship) return false;
    if (ship.unlocked) return false;
    return this.coins >= ship.price;
  }

  buyShip(shipId) {
    const ship = this.ships.find((s) => s.id === shipId);
    if (!ship) return { success: false, message: "Nave não encontrada" };
    if (ship.unlocked)
      return { success: false, message: "Nave já desbloqueada" };
    if (this.coins < ship.price) {
      return {
        success: false,
        message: `Moedas insuficientes. Necessário: ${ship.price}, Você tem: ${this.coins}`,
      };
    }

    this.coins -= ship.price;
    ship.unlocked = true;
    this.saveProgress();
    return { success: true, message: `${ship.name} desbloqueada!` };
  }

  equipShip(shipId) {
    const ship = this.ships.find((s) => s.id === shipId);
    if (!ship) return { success: false, message: "Nave não encontrada" };
    if (!ship.unlocked)
      return { success: false, message: "Nave não desbloqueada" };

    this.equippedShip = shipId;
    this.saveProgress();
    return { success: true, message: `${ship.name} equipada!` };
  }

  getEquippedShip() {
    return this.ships.find((s) => s.id === this.equippedShip);
  }

  getUnlockedShips() {
    return this.ships.filter((s) => s.unlocked);
  }

  getLockedShips() {
    return this.ships.filter((s) => !s.unlocked);
  }

  getCoins() {
    return this.coins;
  }

  getTotalCoins() {
    return this.totalCoins;
  }

  resetProgress() {
    this.coins = 0;
    this.totalCoins = 0;
    this.equippedShip = "default";
    this.ships.forEach((ship) => {
      ship.unlocked = ship.id === "default";
    });
    this.saveProgress();
  }
}
