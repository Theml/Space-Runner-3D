// Entity Creation and Management
class EntityFactory {
  constructor(scene) {
    this.scene = scene;
  }

  createAsteroid() {
    const size = Math.random() * 0.8 + 0.6;
    const asteroid = BABYLON.MeshBuilder.CreateSphere(
      "asteroid",
      {
        diameter: size,
        segments: 8,
      },
      this.scene
    );

    const material = new BABYLON.StandardMaterial("asteroidMat", this.scene);
    material.diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.2);
    material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    asteroid.material = material;

    asteroid.position.z = 50;
    asteroid.position.x = (Math.random() - 0.5) * 10;
    asteroid.position.y = Math.random() * 6 + 1;

    asteroid.rotation.x = Math.random() * Math.PI;
    asteroid.rotation.y = Math.random() * Math.PI;
    asteroid.rotationSpeed = {
      x: (Math.random() - 0.5) * 0.05,
      y: (Math.random() - 0.5) * 0.05,
    };

    return asteroid;
  }

  createCollectible() {
    const collectible = BABYLON.MeshBuilder.CreateSphere(
      "collectible",
      {
        diameter: 0.6,
      },
      this.scene
    );

    const material = new BABYLON.StandardMaterial("collectMat", this.scene);
    material.diffuseColor = new BABYLON.Color3(0, 1, 0.5);
    material.emissiveColor = new BABYLON.Color3(0, 0.8, 0.4);
    collectible.material = material;

    collectible.position.z = 50;
    collectible.position.x = (Math.random() - 0.5) * 10;
    collectible.position.y = Math.random() * 6 + 1;

    return collectible;
  }

  createPowerUp() {
    const types = Object.values(PowerUpType);
    const type = types[Math.floor(Math.random() * types.length)];

    const powerUp = BABYLON.MeshBuilder.CreateTorus(
      "powerUp",
      {
        diameter: 0.8,
        thickness: 0.2,
        tessellation: 16,
      },
      this.scene
    );

    const material = new BABYLON.StandardMaterial("powerUpMat", this.scene);

    switch (type) {
      case PowerUpType.SHIELD:
        material.emissiveColor = new BABYLON.Color3(0, 0.5, 1);
        break;
      case PowerUpType.RAPID_FIRE:
        material.emissiveColor = new BABYLON.Color3(1, 0, 0);
        break;
      case PowerUpType.SLOW_MOTION:
        material.emissiveColor = new BABYLON.Color3(1, 1, 0);
        break;
      case PowerUpType.TRIPLE_SHOT:
        material.emissiveColor = new BABYLON.Color3(0.5, 0, 1);
        break;
    }

    powerUp.material = material;
    powerUp.position.z = 50;
    powerUp.position.x = (Math.random() - 0.5) * 10;
    powerUp.position.y = Math.random() * 6 + 1;
    powerUp.type = type;

    return powerUp;
  }

  createProjectile(position, offsetX = 0) {
    const projectile = BABYLON.MeshBuilder.CreateCylinder(
      "projectile",
      {
        height: 1.5,
        diameter: 0.15,
      },
      this.scene
    );

    const material = new BABYLON.StandardMaterial("projectileMat", this.scene);
    material.diffuseColor = new BABYLON.Color3(1, 1, 0);
    material.emissiveColor = new BABYLON.Color3(1, 1, 0);
    projectile.material = material;

    projectile.position = position.clone();
    projectile.position.x += offsetX;
    projectile.position.z += 2;
    projectile.rotation.x = Math.PI / 2;

    return projectile;
  }

  createStar() {
    const star = BABYLON.MeshBuilder.CreateSphere(
      "star",
      {
        diameter: 0.1,
      },
      this.scene
    );

    const material = new BABYLON.StandardMaterial("starMat", this.scene);
    material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    star.material = material;

    star.position.x = (Math.random() - 0.5) * 100;
    star.position.y = (Math.random() - 0.5) * 50;
    star.position.z = Math.random() * 100;

    star.layer = Math.floor(Math.random() * 3);

    return star;
  }

  createExplosion(position, particles = []) {
    for (let i = 0; i < 15; i++) {
      const particle = BABYLON.MeshBuilder.CreateSphere(
        "particle",
        {
          diameter: 0.2,
        },
        this.scene
      );

      const material = new BABYLON.StandardMaterial("particleMat", this.scene);
      material.emissiveColor = new BABYLON.Color3(1, 0.5, 0);
      particle.material = material;

      particle.position = position.clone();

      const velocity = new BABYLON.Vector3(
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      );

      particle.velocity = velocity;
      particle.life = 30;

      particles.push(particle);
    }
  }
}
