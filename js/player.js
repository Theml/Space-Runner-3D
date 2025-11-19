// Player Ship Management
class Player {
  constructor(scene, modelPath) {
    this.scene = scene;
    this.mesh = null;
    this.trail = [];
    // Config do modelo 3D (glb/gltf)
    this.modelPath = modelPath || "../assets/player/Spaceship.glb"; // ajuste o caminho conforme seu projeto
    this.modelScale = 1.2; // ajuste de escala do modelo
    this.modelRotation = new BABYLON.Vector3(0, 0, 0); // rotação em radianos
    this.modelOffset = new BABYLON.Vector3(0, 0, 0); // deslocamento local do modelo
    this._modelContainer = null; // nó/raiz do modelo importado
    this.visualMeshes = []; // lista de partes visuais (modelo ou fallback) que podem piscar
  }

  // como usar o .glp para criar a nave em vez do box e cylinder ?

  create() {
    // 1) Cria um mesh simples para colisão e como "raiz" da nave
    //    Mantemos um box invisível para preservar colisões e o fluxo atual
    this.mesh = BABYLON.MeshBuilder.CreateBox(
      "shipCollision",
      { height: 0.6, width: 1.0, depth: 1.6 },
      this.scene
    );
    this.mesh.position.y = 2;
    this.mesh.position.z = 0;
    this.mesh.visibility = 0; // invisível, mas ainda útil para colisões

    // 2) Tenta carregar o modelo .glb/.gltf
    this._loadShipModel();

    // 3) Cria rastro atrelado à raiz (mesh de colisão)
    this.createTrail();

    return this.mesh; // compatível com o código existente
  }

  createTrail() {
    this.trail = [];
    for (let i = 0; i < 8; i++) {
      const trailParticle = BABYLON.MeshBuilder.CreateSphere(
        "trail",
        {
          diameter: 0.1,
        },
        this.scene
      );

      const material = new BABYLON.StandardMaterial("trailMat", this.scene);
      material.emissiveColor = new BABYLON.Color3(0, 0.8, 1);
      material.alpha = 0.3;
      trailParticle.material = material;

      trailParticle.parent = this.mesh;
      trailParticle.position.z = -0.8 - i * 0.3;
      trailParticle.position.y = -0.1;
      trailParticle.scaling.scaleInPlace(1 - i * 0.1);

      this.trail.push(trailParticle);
    }
  }

  _loadShipModel() {
    const pathInfo = this._splitPath(this.modelPath);
    const rootUrl = pathInfo.rootUrl;
    const fileName = pathInfo.fileName;

    // Contêiner/nó para organizar as malhas do modelo importado
    const container = new BABYLON.TransformNode("shipModelRoot", this.scene);
    container.parent = this.mesh; // parent no mesh de colisão
    container.position.copyFrom(this.modelOffset);
    container.rotation.copyFrom(this.modelRotation);
    container.scaling.set(this.modelScale, this.modelScale, this.modelScale);
    this._modelContainer = container;

    // Importa apenas as malhas; mantém animações se existirem
    BABYLON.SceneLoader.ImportMesh(
      "",
      rootUrl,
      fileName,
      this.scene,
      (meshes, particleSystems, skeletons, animationGroups) => {
        // Reparenta todas as malhas importadas para o container
        meshes.forEach((m) => {
          // evita reparentar a raiz se já for o próprio container
          if (m && m !== container) {
            m.parent = container;
            this.visualMeshes.push(m);
          }
        });
      },
      null,
      (scene, message, exception) => {
        // Falhou: usa um fallback visual simples para não ficar invisível
        this._createVisualFallback();
        console.warn("Falha ao carregar modelo da nave:", message || exception);
      }
    );
  }

  _createVisualFallback() {
    // Fallback simples (parecido com o antigo), agora como filho do mesh de colisão
    const material = new BABYLON.StandardMaterial(
      "shipMatFallback",
      this.scene
    );
    material.diffuseColor = new BABYLON.Color3(0.2, 0.6, 1);
    material.emissiveColor = new BABYLON.Color3(0.1, 0.3, 0.5);

    const body = BABYLON.MeshBuilder.CreateBox(
      "shipBodyFallback",
      { height: 0.5, width: 1, depth: 1.5 },
      this.scene
    );
    body.material = material;
    body.parent = this.mesh;
    this.visualMeshes.push(body);

    const wingL = BABYLON.MeshBuilder.CreateBox(
      "wingLFallback",
      { height: 0.1, width: 0.8, depth: 0.8 },
      this.scene
    );
    wingL.parent = this.mesh;
    wingL.position.x = -1;
    wingL.position.y = -0.2;
    wingL.material = material;
    this.visualMeshes.push(wingL);

    const wingR = wingL.clone("wingRFallback");
    wingR.parent = this.mesh;
    wingR.position.x = 1;
    this.visualMeshes.push(wingR);

    const cannon = BABYLON.MeshBuilder.CreateCylinder(
      "cannonFallback",
      { height: 0.8, diameter: 0.2 },
      this.scene
    );
    cannon.parent = this.mesh;
    cannon.position.z = 0.8;
    cannon.position.y = 0.1;
    cannon.rotation.x = Math.PI / 2;
    cannon.material = material;
    this.visualMeshes.push(cannon);
  }

  _splitPath(fullPath) {
    // Aceita formatos tipo "assets/ship.glb" ou "assets/models/ship.gltf"
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

  move(keys) {
    if (!this.mesh) return;

    // Movimento horizontal
    if (keys["a"] || keys["arrowleft"]) {
      this.mesh.position.x -= GameConfig.SHIP_MOVE_SPEED;
    }
    if (keys["d"] || keys["arrowright"]) {
      this.mesh.position.x += GameConfig.SHIP_MOVE_SPEED;
    }

    // Movimento vertical
    if (keys["w"] || keys["arrowup"]) {
      this.mesh.position.y = Math.min(
        this.mesh.position.y + GameConfig.SHIP_MOVE_SPEED,
        GameConfig.SHIP_MAX_Y
      );
    }
    if (keys["s"] || keys["arrowdown"]) {
      this.mesh.position.y = Math.max(
        this.mesh.position.y - GameConfig.SHIP_MOVE_SPEED,
        GameConfig.SHIP_MIN_Y
      );
    }

    // Limitar movimento horizontal
    this.mesh.position.x = Math.max(
      -GameConfig.SHIP_MAX_X,
      Math.min(GameConfig.SHIP_MAX_X, this.mesh.position.x)
    );

    // Animação de inclinação
    if (keys["a"] || keys["arrowleft"]) {
      this.mesh.rotation.z = Math.min(this.mesh.rotation.z + 0.05, 0.3);
    } else if (keys["d"] || keys["arrowright"]) {
      this.mesh.rotation.z = Math.max(this.mesh.rotation.z - 0.05, -0.3);
    } else {
      this.mesh.rotation.z *= 0.9;
    }
  }

  updateInvulnerability(invulnerable, timer) {
    if (!this.mesh) return;
    // Mantém hitbox (this.mesh) sempre invisível e pisca somente visualMeshes
    if (invulnerable) {
      const v = Math.sin(timer * 0.5) > 0 ? 1 : 0.3;
      this.visualMeshes.forEach((m) => (m.visibility = v));
    } else {
      this.visualMeshes.forEach((m) => (m.visibility = 1));
    }
  }

  getPosition() {
    return this.mesh ? this.mesh.position : null;
  }

  intersectsWith(mesh) {
    return this.mesh ? this.mesh.intersectsMesh(mesh, false) : false;
  }

  dispose() {
    this.trail.forEach((t) => t.dispose());
    if (this._modelContainer) this._modelContainer.dispose();
    if (this.mesh) this.mesh.dispose();
    this.mesh = null;
    this.trail = [];
    this._modelContainer = null;
    this.visualMeshes = [];
  }
}
