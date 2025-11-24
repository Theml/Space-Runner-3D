// Entity Creation and Management
class EntityFactory {
  constructor(scene, asteroidModelPath) {
    this.scene = scene;
    this.asteroidModelPath = "assets/entities/Asteroide.glb";
    this.asteroidModelScale = 0.5;
    this.asteroidModelRotation = new BABYLON.Vector3(0, 0, 0);
    this.asteroidModelOffset = new BABYLON.Vector3(0, 0, 0);
  }

  createAsteroid() {
    const size = Math.random() * 0.8 + 0.6;

    // Mesh de colisão invisível
    const asteroid = BABYLON.MeshBuilder.CreateSphere(
      "asteroid",
      { diameter: size, segments: 8 },
      this.scene
    );
    asteroid.visibility = 0;
    asteroid.isPickable = true;
    asteroid.checkCollisions = false;

    // CRÍTICO: Define posição IMEDIATAMENTE para evitar spawnar em (0,0,0)
    const spawnX = (Math.random() - 0.5) * 10;
    const spawnY = Math.random() * 6 + 1;
    const spawnZ = 50 + Math.random() * 10; // Varia entre 50-60 para evitar colisões

    asteroid.position.x = spawnX;
    asteroid.position.y = spawnY;
    asteroid.position.z = spawnZ;

    // Garante que NUNCA fique em (0,0,0)
    if (
      asteroid.position.x === 0 &&
      asteroid.position.y === 0 &&
      asteroid.position.z === 0
    ) {
      console.error("CRITICAL: Asteroide em (0,0,0) detectado! Corrigindo...");
      asteroid.position.x = (Math.random() - 0.5) * 10;
      asteroid.position.y = Math.random() * 6 + 1;
      asteroid.position.z = 50;
    }

    asteroid.rotation.x = Math.random() * Math.PI;
    asteroid.rotation.y = Math.random() * Math.PI;
    asteroid.rotationSpeed = {
      x: (Math.random() - 0.5) * 0.05,
      y: (Math.random() - 0.5) * 0.05,
    };

    // Marca como asteroide móvel com rastreamento de posição
    asteroid.metadata = {
      isMoving: true,
      stuckFrames: 0,
      initialZ: spawnZ,
      spawnTime: Date.now(),
    };

    this._loadAsteroidModel(asteroid, size);

    return asteroid;
  }

  _loadAsteroidModel(parentMesh, size) {
    const pathInfo = this._splitPath(this.asteroidModelPath);
    const container = new BABYLON.TransformNode(
      "asteroidModelRoot_" + Math.random(),
      this.scene
    );
    container.parent = parentMesh;
    container.position.copyFrom(this.asteroidModelOffset);
    container.rotation.copyFrom(this.asteroidModelRotation);
    const scale = this.asteroidModelScale * size;
    container.scaling.set(scale, scale, scale);

    let loadTimeout = setTimeout(() => {
      console.warn("Timeout ao carregar modelo do asteroide, usando fallback");
      this._createAsteroidFallback(parentMesh, size);
    }, 5000);

    BABYLON.SceneLoader.ImportMesh(
      "",
      pathInfo.rootUrl,
      pathInfo.fileName,
      this.scene,
      (meshes) => {
        clearTimeout(loadTimeout);
        if (meshes && meshes.length > 0) {
          let validMeshCount = 0;
          meshes.forEach((m) => {
            if (
              m &&
              m !== container &&
              m.getTotalVertices &&
              m.getTotalVertices() > 0
            ) {
              // Reseta posição, rotação e escala antes de parentear
              m.position = BABYLON.Vector3.Zero();
              m.rotation = BABYLON.Vector3.Zero();
              m.scaling = new BABYLON.Vector3(1, 1, 1);
              m.parent = container;
              validMeshCount++;
            }
          });

          if (validMeshCount === 0) {
            console.warn("Nenhum mesh válido carregado, usando fallback");
            container.dispose();
            this._createAsteroidFallback(parentMesh, size);
          }
        } else {
          container.dispose();
          this._createAsteroidFallback(parentMesh, size);
        }
      },
      null,
      (scene, message, exception) => {
        clearTimeout(loadTimeout);
        container.dispose();
        this._createAsteroidFallback(parentMesh, size);
        console.warn(
          "Falha ao carregar modelo do asteroide:",
          message || exception
        );
      }
    );
  }

  _createAsteroidFallback(parentMesh, size) {
    const visual = BABYLON.MeshBuilder.CreateSphere(
      "asteroidVisual",
      { diameter: size, segments: 8 },
      this.scene
    );
    const material = new BABYLON.StandardMaterial("asteroidMat", this.scene);
    material.diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.2);
    material.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    visual.material = material;
    visual.parent = parentMesh;
  }

  _splitPath(fullPath) {
    const lastSlash = Math.max(
      fullPath.lastIndexOf("/"),
      fullPath.lastIndexOf("\\")
    );
    if (lastSlash === -1) {
      return { rootUrl: "", fileName: fullPath };
    }
    return {
      rootUrl: fullPath.substring(0, lastSlash + 1),
      fileName: fullPath.substring(lastSlash + 1),
    };
  }

  createCollectible() {
    // Mesh de colisão invisível
    const collectible = BABYLON.MeshBuilder.CreateSphere(
      "collectible",
      { diameter: 0.6 },
      this.scene
    );
    collectible.visibility = 0;

    collectible.position.z = 50;
    collectible.position.x = (Math.random() - 0.5) * 10;
    collectible.position.y = Math.random() * 6 + 1;

    // Carrega o modelo Orb.glb
    this._loadOrbModel(collectible);

    return collectible;
  }

  _loadOrbModel(parentMesh) {
    const orbPath = "assets/entities/Orb.glb";
    const pathInfo = this._splitPath(orbPath);

    const container = new BABYLON.TransformNode(
      "orbModelRoot_" + Math.random(),
      this.scene
    );
    container.parent = parentMesh;
    container.position = BABYLON.Vector3.Zero();
    container.scaling.set(0.3, 0.3, 0.3);

    BABYLON.SceneLoader.ImportMesh(
      "",
      pathInfo.rootUrl,
      pathInfo.fileName,
      this.scene,
      (meshes) => {
        if (meshes && meshes.length > 0) {
          meshes.forEach((m) => {
            if (
              m &&
              m !== container &&
              m.getTotalVertices &&
              m.getTotalVertices() > 0
            ) {
              m.position = BABYLON.Vector3.Zero();
              m.rotation = BABYLON.Vector3.Zero();
              m.scaling = new BABYLON.Vector3(1, 1, 1);
              m.parent = container;
            }
          });
        } else {
          this._createOrbFallback(parentMesh);
        }
      },
      null,
      (scene, message, exception) => {
        this._createOrbFallback(parentMesh);
        console.warn("Falha ao carregar Orb.glb:", message || exception);
      }
    );
  }

  _createOrbFallback(parentMesh) {
    const visual = BABYLON.MeshBuilder.CreateSphere(
      "orbVisual",
      { diameter: 0.6 },
      this.scene
    );
    const material = new BABYLON.StandardMaterial("collectMat", this.scene);
    material.diffuseColor = new BABYLON.Color3(0, 1, 0.5);
    material.emissiveColor = new BABYLON.Color3(0, 0.8, 0.4);
    visual.material = material;
    visual.parent = parentMesh;
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
