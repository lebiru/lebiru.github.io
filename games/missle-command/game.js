(function () {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);

  const scoreLabel = document.getElementById("score");
  const levelLabel = document.getElementById("level");
  const ammoLabel = document.getElementById("ammo");
  const statusLabel = document.getElementById("status");
  const restartButton = document.getElementById("restart");

  const WORLD = {
    width: 72,
    height: 42,
    top: 21,
    groundY: -16
  };

  const CITY_X = [-27, -18, -9, 9, 18, 27];
  const BASE_X = [-36, 0, 36];
  const STARTING_AMMO = 30;

  let scene;
  let ground;
  let clickPlane;
  let cities = [];
  let bases = [];
  let enemyMissiles = [];
  let playerMissiles = [];
  let explosions = [];
  let spawnPlan = [];
  let spawnClock = 0;
  let score = 0;
  let level = 1;
  let levelFinished = false;
  let roundTransitionAt = 0;
  let lastTouchTimestamp = 0;

  function createScene() {
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.02, 0.03, 0.08, 1);

    const camera = new BABYLON.ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      1.15,
      72,
      new BABYLON.Vector3(0, -5, 0),
      scene
    );
    camera.lowerRadiusLimit = 72;
    camera.upperRadiusLimit = 72;
    camera.lowerBetaLimit = 1.15;
    camera.upperBetaLimit = 1.15;
    camera.lowerAlphaLimit = -Math.PI / 2;
    camera.upperAlphaLimit = -Math.PI / 2;

    const hemi = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
    hemi.intensity = 0.85;

    const fill = new BABYLON.PointLight("fill", new BABYLON.Vector3(0, 10, -25), scene);
    fill.intensity = 0.55;

    const sky = BABYLON.MeshBuilder.CreateBox("sky", { size: 220 }, scene);
    const skyMat = new BABYLON.StandardMaterial("skyMat", scene);
    skyMat.backFaceCulling = false;
    skyMat.emissiveColor = new BABYLON.Color3(0.04, 0.06, 0.16);
    skyMat.disableLighting = true;
    sky.material = skyMat;

    ground = BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: WORLD.width + 12, height: 12 },
      scene
    );
    ground.position.y = WORLD.groundY;
    const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0.1, 0.42, 0.2);
    groundMat.emissiveColor = new BABYLON.Color3(0.04, 0.16, 0.08);
    ground.material = groundMat;

    clickPlane = BABYLON.MeshBuilder.CreatePlane("click-plane", {
      width: WORLD.width + 18,
      height: WORLD.height + 10
    }, scene);
    clickPlane.position.y = 1;
    clickPlane.isVisible = false;

    const stars = new BABYLON.PointsCloudSystem("stars", 1, scene);
    stars.addPoints(250, (particle) => {
      particle.position = new BABYLON.Vector3(
        (Math.random() - 0.5) * 140,
        Math.random() * 60 - 2,
        -30 - Math.random() * 45
      );
      const c = 0.65 + Math.random() * 0.35;
      particle.color = new BABYLON.Color4(c, c, c + 0.1, 1);
    });
    stars.buildMeshAsync().then((mesh) => {
      mesh.alwaysSelectAsActiveMesh = true;
    });

    buildDefenses();
    beginLevel(1);
    wireInput();

    scene.onBeforeRenderObservable.add(updateGame);
    return scene;
  }

  function wireInput() {
    canvas.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      if (event.pointerType === "touch") {
        lastTouchTimestamp = performance.now();
      }

      event.preventDefault();
      handleFireInput(event.clientX, event.clientY);
    });

    canvas.addEventListener("touchstart", (event) => {
      if (performance.now() - lastTouchTimestamp < 400 || event.changedTouches.length === 0) {
        return;
      }

      lastTouchTimestamp = performance.now();
      event.preventDefault();

      const touch = event.changedTouches[0];
      handleFireInput(touch.clientX, touch.clientY);
    }, { passive: false });
  }

  function handleFireInput(clientX, clientY) {
    if (isGameOver()) {
      return;
    }

    const point = pickPlayfieldPoint(clientX, clientY);
    if (!point) {
      return;
    }

    firePlayerMissile(point);
  }

  function pickPlayfieldPoint(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * engine.getRenderWidth();
    const y = ((clientY - rect.top) / rect.height) * engine.getRenderHeight();
    const pickInfo = scene.pick(x, y, (mesh) => mesh === clickPlane);

    if (!pickInfo || !pickInfo.hit || !pickInfo.pickedPoint) {
      return null;
    }

    return pickInfo.pickedPoint;
  }

  function buildDefenses() {
    disposeDefenseMeshes();
    cities = CITY_X.map((x, index) => createCity(x, index));
    bases = BASE_X.map((x, index) => createBase(x, index));
    updateHud();
  }

  function disposeDefenseMeshes() {
    [...cities, ...bases].forEach((item) => {
      if (item.mesh && !item.mesh.isDisposed()) {
        item.mesh.dispose(false, true);
      }
    });
  }

  function createCity(x, index) {
    const box = BABYLON.MeshBuilder.CreateBox(`city-${index}`, {
      width: 5,
      height: 2.8,
      depth: 2.2
    }, scene);
    box.position.set(x, WORLD.groundY + 1.4, 0);

    const mat = new BABYLON.StandardMaterial(`city-mat-${index}`, scene);
    mat.diffuseColor = new BABYLON.Color3(0.3, 0.82, 1);
    mat.emissiveColor = new BABYLON.Color3(0.08, 0.35, 0.48);
    box.material = mat;

    return {
      type: "city",
      index,
      x,
      alive: true,
      mesh: box,
      material: mat
    };
  }

  function createBase(x, index) {
    const root = new BABYLON.TransformNode(`base-root-${index}`, scene);

    const base = BABYLON.MeshBuilder.CreateCylinder(`base-${index}`, {
      diameterTop: 0,
      diameterBottom: 5.2,
      height: 3.6,
      tessellation: 3
    }, scene);
    base.rotation.z = Math.PI;
    base.position.y = WORLD.groundY + 1.8;
    base.parent = root;

    const pad = BABYLON.MeshBuilder.CreateCylinder(`base-pad-${index}`, {
      diameter: 6,
      height: 0.7,
      tessellation: 24
    }, scene);
    pad.position.y = WORLD.groundY + 0.35;
    pad.parent = root;

    root.position.x = x;

    const mat = new BABYLON.StandardMaterial(`base-mat-${index}`, scene);
    mat.diffuseColor = new BABYLON.Color3(1, 0.72, 0.2);
    mat.emissiveColor = new BABYLON.Color3(0.4, 0.2, 0.04);
    base.material = mat;
    pad.material = mat;

    return {
      type: "base",
      index,
      x,
      alive: true,
      ammo: STARTING_AMMO,
      mesh: root,
      material: mat
    };
  }

  function beginLevel(nextLevel) {
    level = nextLevel;
    levelFinished = false;
    roundTransitionAt = 0;
    clearProjectiles();
    createSpawnPlan();
    statusLabel.textContent = `Wave ${level}: tap or click to intercept.`;
    updateHud();
  }

  function clearProjectiles() {
    enemyMissiles.forEach(disposeMissile);
    playerMissiles.forEach(disposeMissile);
    explosions.forEach((explosion) => {
      if (explosion.mesh && !explosion.mesh.isDisposed()) {
        explosion.mesh.dispose();
      }
    });
    enemyMissiles = [];
    playerMissiles = [];
    explosions = [];
  }

  function createSpawnPlan() {
    const count = 10 + (level - 1) * 3;
    spawnPlan = [];

    for (let i = 0; i < count; i += 1) {
      spawnPlan.push({
        delay: i === 0 ? 0.6 : 0.45 + Math.random() * Math.max(0.8, 1.6 - level * 0.08),
        speed: 8 + level * 1.1 + Math.random() * 2.4
      });
    }

    spawnClock = spawnPlan.length > 0 ? spawnPlan[0].delay : 0;
  }

  function firePlayerMissile(target) {
    const base = selectFiringBase(target.x);
    if (!base) {
      statusLabel.textContent = "No active launcher can reach the target.";
      return;
    }

    base.ammo -= 1;

    const start = new BABYLON.Vector3(base.x, WORLD.groundY + 2.8, 0);
    const missile = createMissile({
      kind: "player",
      color: new BABYLON.Color3(0.5, 0.9, 1),
      start,
      target: new BABYLON.Vector3(target.x, target.y, 0),
      speed: 24,
      trailDiameter: 0.18
    });

    missile.onArrival = () => createExplosion(missile.position.clone(), false);
    playerMissiles.push(missile);
    updateHud();
  }

  function selectFiringBase(targetX) {
    const candidates = bases
      .filter((base) => base.alive && base.ammo > 0)
      .sort((a, b) => Math.abs(a.x - targetX) - Math.abs(b.x - targetX));

    return candidates[0];
  }

  function createMissile(options) {
    const material = new BABYLON.StandardMaterial(`${options.kind}-trail-${Date.now()}-${Math.random()}`, scene);
    material.emissiveColor = options.color;
    material.diffuseColor = options.color;
    material.disableLighting = true;

    const missileMesh = BABYLON.MeshBuilder.CreateSphere(`${options.kind}-head`, {
      diameter: options.kind === "enemy" ? 0.55 : 0.4
    }, scene);
    missileMesh.position.copyFrom(options.start);
    missileMesh.material = material;

    const trail = BABYLON.MeshBuilder.CreateTube(`${options.kind}-trail`, {
      path: [options.start.clone(), options.start.clone().add(new BABYLON.Vector3(0, 0.01, 0))],
      radius: options.trailDiameter / 2,
      updatable: true
    }, scene);
    trail.material = material;

    return {
      kind: options.kind,
      start: options.start.clone(),
      position: options.start.clone(),
      target: options.target.clone(),
      speed: options.speed,
      progress: 0,
      mesh: missileMesh,
      trail,
      material,
      onArrival: options.onArrival || null
    };
  }

  function spawnEnemyMissile() {
    const targets = [...cities, ...bases].filter((item) => item.alive);
    if (targets.length === 0 || spawnPlan.length === 0) {
      return;
    }

    const next = spawnPlan.shift();
    const target = targets[Math.floor(Math.random() * targets.length)];
    const startX = (Math.random() - 0.5) * WORLD.width;
    const start = new BABYLON.Vector3(startX, WORLD.top, 0);
    const targetPoint = new BABYLON.Vector3(target.x, WORLD.groundY + 1.2, 0);

    const missile = createMissile({
      kind: "enemy",
      color: new BABYLON.Color3(1, 0.38, 0.25),
      start,
      target: targetPoint,
      speed: next.speed,
      trailDiameter: 0.2
    });

    missile.targetEntity = target;
    missile.onArrival = () => resolveEnemyImpact(target, targetPoint);
    enemyMissiles.push(missile);
  }

  function resolveEnemyImpact(target, point) {
    createExplosion(point.clone(), true);
    destroyDefense(target);
  }

  function destroyDefense(target) {
    if (!target || !target.alive) {
      return;
    }

    target.alive = false;

    if (target.type === "base") {
      target.ammo = 0;
    }

    if (target.material) {
      target.material.diffuseColor = new BABYLON.Color3(0.28, 0.28, 0.32);
      target.material.emissiveColor = new BABYLON.Color3(0.1, 0.08, 0.08);
    }

    if (target.mesh && !target.mesh.isDisposed()) {
      target.mesh.scaling.y = Math.max(0.2, target.mesh.scaling.y * 0.35);
      target.mesh.position.y = WORLD.groundY + 0.6;
    }

    updateHud();
    if (isGameOver()) {
      statusLabel.textContent = "Game over. Press Restart to defend the next skyline.";
    }
  }

  function createExplosion(position, hostile) {
    const sphere = BABYLON.MeshBuilder.CreateSphere(`explosion-${Date.now()}-${Math.random()}`, {
      diameter: 1.2,
      segments: 12
    }, scene);
    sphere.position.copyFrom(position);

    const mat = new BABYLON.StandardMaterial(`explosion-mat-${Date.now()}-${Math.random()}`, scene);
    mat.emissiveColor = hostile
      ? new BABYLON.Color3(1, 0.45, 0.2)
      : new BABYLON.Color3(0.42, 0.95, 1);
    mat.alpha = 0.65;
    sphere.material = mat;

    explosions.push({
      mesh: sphere,
      material: mat,
      position: position.clone(),
      radius: 0.6,
      maxRadius: hostile ? 3.2 : 4.8,
      growthRate: hostile ? 6 : 10,
      decayRate: hostile ? 3.2 : 5.5,
      expanding: true,
      hostile
    });
  }

  function updateGame() {
    const dt = Math.min(engine.getDeltaTime() / 1000, 0.033);

    if (!isGameOver() && !levelFinished && spawnPlan.length > 0) {
      spawnClock -= dt;
      if (spawnClock <= 0) {
        spawnEnemyMissile();
        if (spawnPlan.length > 0) {
          spawnClock = spawnPlan[0].delay;
        }
      }
    }

    advanceMissiles(enemyMissiles, dt);
    advanceMissiles(playerMissiles, dt);
    advanceExplosions(dt);
    detectExplosionHits();
    checkWaveState();
  }

  function advanceMissiles(list, dt) {
    for (let i = list.length - 1; i >= 0; i -= 1) {
      const missile = list[i];
      const direction = missile.target.subtract(missile.start);
      const distance = direction.length();

      if (distance === 0) {
        disposeMissile(missile);
        list.splice(i, 1);
        continue;
      }

      missile.progress += (missile.speed * dt) / distance;

      if (missile.progress >= 1) {
        missile.position.copyFrom(missile.target);
        updateMissileVisual(missile);
        if (missile.onArrival) {
          missile.onArrival();
        }
        disposeMissile(missile);
        list.splice(i, 1);
        continue;
      }

      missile.position = BABYLON.Vector3.Lerp(missile.start, missile.target, missile.progress);
      updateMissileVisual(missile);
    }
  }

  function updateMissileVisual(missile) {
    missile.mesh.position.copyFrom(missile.position);
    BABYLON.MeshBuilder.CreateTube(null, {
      path: [missile.start, missile.position],
      instance: missile.trail
    });
  }

  function advanceExplosions(dt) {
    for (let i = explosions.length - 1; i >= 0; i -= 1) {
      const explosion = explosions[i];

      if (explosion.expanding) {
        explosion.radius += explosion.growthRate * dt;
        if (explosion.radius >= explosion.maxRadius) {
          explosion.radius = explosion.maxRadius;
          explosion.expanding = false;
        }
      } else {
        explosion.radius -= explosion.decayRate * dt;
      }

      if (explosion.radius <= 0) {
        explosion.mesh.dispose();
        explosions.splice(i, 1);
        continue;
      }

      const scale = explosion.radius * 0.75;
      explosion.mesh.scaling.set(scale, scale, scale);
      explosion.material.alpha = Math.max(0, Math.min(0.72, explosion.radius / explosion.maxRadius));
    }
  }

  function detectExplosionHits() {
    for (let i = enemyMissiles.length - 1; i >= 0; i -= 1) {
      const missile = enemyMissiles[i];
      const hit = explosions.find((explosion) =>
        !explosion.hostile &&
        BABYLON.Vector3.Distance(explosion.position, missile.position) <= explosion.radius
      );

      if (!hit) {
        continue;
      }

      score += 25;
      createExplosion(missile.position.clone(), true);
      disposeMissile(missile);
      enemyMissiles.splice(i, 1);
      updateHud();
    }
  }

  function disposeMissile(missile) {
    if (missile.mesh && !missile.mesh.isDisposed()) {
      missile.mesh.dispose();
    }
    if (missile.trail && !missile.trail.isDisposed()) {
      missile.trail.dispose();
    }
    if (missile.material) {
      missile.material.dispose();
    }
  }

  function checkWaveState() {
    if (isGameOver()) {
      return;
    }

    if (!levelFinished && spawnPlan.length === 0 && enemyMissiles.length === 0 && playerMissiles.length === 0) {
      levelFinished = true;
      const bonus = cities.filter((city) => city.alive).length * 100 + bases.reduce((sum, base) => sum + base.ammo * 2, 0);
      score += bonus;
      updateHud();
      statusLabel.textContent = `Wave cleared. Bonus ${bonus} points.`;
      roundTransitionAt = performance.now() + 2400;
    }

    if (levelFinished && roundTransitionAt > 0 && performance.now() >= roundTransitionAt) {
      resupplyBases();
      beginLevel(level + 1);
    }
  }

  function resupplyBases() {
    bases.forEach((base) => {
      if (base.alive) {
        base.ammo = STARTING_AMMO;
      }
    });
  }

  function isGameOver() {
    return cities.every((city) => !city.alive);
  }

  function updateHud() {
    scoreLabel.textContent = String(score);
    levelLabel.textContent = String(level);
    ammoLabel.textContent = bases.map((base) => (base.alive ? base.ammo : 0)).join(" / ");
  }

  function restartGame() {
    score = 0;
    level = 1;
    clearProjectiles();
    buildDefenses();
    beginLevel(1);
  }

  restartButton.addEventListener("click", restartGame);

  createScene();

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });
})();
