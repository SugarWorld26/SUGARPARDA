class GameScene extends Phaser.Scene {
  constructor(){ super('Game'); }

  create(){
    const lvlIndex = this.registry.get('currentLevel') || 0;
    this.lvl = CONFIG.LEVELS[lvlIndex];
    this.W = this.scale.width;
    this.H = this.scale.height;

    this.glucose     = new GlucoseSystem();
    this.scoring     = new ScoreSystem();
    this.glucagonLeft    = this.lvl.glucagons;
    this.fastInsulinLeft = CONFIG.INSULIN_FAST_MAX;
    this.isSlowed    = false;
    this.isFastRun   = false;
    this.fastRunTimer= 0;
    this.isDead      = false;
    this.levelDone   = false;
    this.isUphill    = false;
    this._hyperOverlay = null;

    this.physics.world.gravity.y = CONFIG.GRAVITY;

    this._buildBackground();
    this._buildTerrain();
    this._buildPlayer();
    this._buildEnemies();
    this._buildApples();
    this._buildCheckpoints();
    this._buildControls();
    this._buildAccelerometer();

    // Cámara
    this.cameras.main.setBounds(0, 0, this.lvl.levelLength, this.H);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // HUD
    this.scene.launch('HUD', { gameScene: this });
  }

  // ─────────────────────────────────────────────
  //  FONDO PARALLAX
  // ─────────────────────────────────────────────
  _buildBackground(){
    const bgKey = ['bg_city','bg_forest','bg_mountain','bg_candy','bg_final'][
      Math.min(this.registry.get('currentLevel')||0, 4)
    ];
    // Capa 1 (más lejos, más lenta)
    this.bg1 = this.add.tileSprite(0, 0, this.lvl.levelLength, this.H, bgKey)
      .setOrigin(0,0).setScrollFactor(0.2).setDepth(-2);
    // Capa 2
    this.bg2 = this.add.tileSprite(0, this.H*0.4, this.lvl.levelLength, this.H*0.6, bgKey)
      .setOrigin(0,0).setScrollFactor(0.5).setDepth(-1).setAlpha(0.7);
  }

  // ─────────────────────────────────────────────
  //  TERRENO CON CUESTAS REALES
  // ─────────────────────────────────────────────
  _buildTerrain(){
    const lvl  = this.lvl;
    const H    = this.H;
    const tKey = ['ground_city','ground_forest','ground_mountain','ground_candy','ground_city'][
      Math.min(this.registry.get('currentLevel')||0, 4)
    ];

    this.ground    = this.physics.add.staticGroup();
    this.platforms = this.physics.add.staticGroup();
    this.slopeZones = []; // [{x1,x2,startY,endY}]

    const tileW = 32;
    const baseY = H - 40; // suelo base

    // Construir perfil del suelo con cuestas
    // Dividimos el nivel en segmentos
    let segments = [];
    let curX = 0;
    let curY = baseY;

    // Zona plana inicial
    segments.push({ x: 0, y: curY, w: 400 });
    curX = 400;

    // Insertar cuestas definidas en config
    lvl.uphillZones.forEach(([sx, ex]) => {
      // Plano antes de la cuesta
      if(curX < sx){
        segments.push({ x: curX, y: curY, w: sx - curX });
        curX = sx;
      }
      // Cuesta arriba
      const slopeW = ex - sx;
      const slopeH = Phaser.Math.Between(60, 110); // cuánto sube
      const startY = curY;
      const endY   = curY - slopeH;
      segments.push({ x: sx, y: startY, w: slopeW, slopeTo: endY });
      this.slopeZones.push({ x1: sx, x2: ex, startY, endY });
      curX = ex;
      curY = endY;
      // Meseta
      const plateauW = Phaser.Math.Between(300, 500);
      segments.push({ x: curX, y: curY, w: plateauW });
      curX += plateauW;
      // Bajada
      segments.push({ x: curX, y: curY, w: slopeW * 0.7, slopeTo: startY });
      curX += slopeW * 0.7;
      curY = startY;
    });

    // Resto hasta el final
    if(curX < lvl.levelLength){
      segments.push({ x: curX, y: curY, w: lvl.levelLength - curX });
    }

    // Renderizar segmentos
    const gfx = this.add.graphics().setDepth(0);
    const lvlIdx = Math.min(this.registry.get('currentLevel')||0, 4);
    const colors = [0x546E7A, 0x33691E, 0x546E7A, 0xAD1457, 0x1A237E];
    const topColors = [0x607D8B, 0x558B2F, 0x78909C, 0xE91E63, 0x3949AB];
    gfx.fillStyle(colors[lvlIdx]);

    segments.forEach(seg => {
      if(!seg.slopeTo){
        // Segmento plano
        gfx.fillRect(seg.x, seg.y, seg.w, H - seg.y + 10);
        gfx.fillStyle(topColors[lvlIdx]);
        gfx.fillRect(seg.x, seg.y, seg.w, 6);
        gfx.fillStyle(colors[lvlIdx]);

        // Tiles de colisión
        for(let tx = seg.x; tx < seg.x + seg.w; tx += tileW){
          const tile = this.ground.create(tx + tileW/2, seg.y + 16);
          tile.setVisible(false);
          tile.body.setSize(tileW, 32);
        }
      } else {
        // Segmento con cuesta
        const steps = Math.ceil(seg.w / tileW);
        const yStep = (seg.slopeTo - seg.y) / steps;
        for(let s = 0; s < steps; s++){
          const tx = seg.x + s * tileW;
          const ty = seg.y + s * yStep;
          const ty2 = ty + yStep;
          // Triángulo / trapecio
          gfx.fillStyle(colors[lvlIdx]);
          gfx.fillRect(tx, Math.min(ty, ty2), tileW, H - Math.min(ty, ty2) + 10);
          gfx.fillStyle(topColors[lvlIdx]);
          gfx.fillRect(tx, Math.min(ty, ty2), tileW, 5);
          gfx.fillStyle(colors[lvlIdx]);

          const tile = this.ground.create(tx + tileW/2, ty + 16);
          tile.setVisible(false);
          tile.body.setSize(tileW, 32);
        }
      }
    });

    // Plataformas flotantes
    const pGfx = this.add.graphics().setDepth(1);
    pGfx.fillStyle(0x795548);
    let px = 500;
    while(px < lvl.levelLength - 400){
      const pw = Phaser.Math.Between(100, 200);
      // Buscar la Y del suelo en esa zona
      const groundY = this._getGroundYAt(px, segments);
      const py = groundY - Phaser.Math.Between(80, 150);
      pGfx.fillRect(px, py, pw, 16);
      pGfx.fillStyle(0x8D6E63);
      pGfx.fillRect(px, py, pw, 5);
      pGfx.fillStyle(0x795548);
      const plat = this.platforms.create(px + pw/2, py + 8);
      plat.setVisible(false);
      plat.body.setSize(pw, 16);
      px += Phaser.Math.Between(250, 450);
    }

    // Meta
    const metaY = this._getGroundYAt(lvl.levelLength - 100, segments);
    const mgfx = this.add.graphics().setDepth(5);
    mgfx.fillStyle(0xFFD700);
    mgfx.fillRect(lvl.levelLength - 80, metaY - 100, 8, 100);
    mgfx.fillStyle(0xFFD700);
    mgfx.fillTriangle(
      lvl.levelLength - 72, metaY - 100,
      lvl.levelLength - 72, metaY - 70,
      lvl.levelLength - 40, metaY - 85
    );
    this.add.text(lvl.levelLength - 70, metaY - 115, 'META', {
      fontSize: '14px', fill: '#FFD700', fontFamily: 'monospace', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setDepth(6);
    this.metaX = lvl.levelLength - 80;
    this._segments = segments;
  }

  _getGroundYAt(x, segments){
    const seg = segments.find(s => x >= s.x && x < s.x + s.w);
    if(!seg) return this.H - 40;
    if(!seg.slopeTo) return seg.y;
    const pct = (x - seg.x) / seg.w;
    return seg.y + (seg.slopeTo - seg.y) * pct;
  }

  // ─────────────────────────────────────────────
  //  JUGADORA
  // ─────────────────────────────────────────────
  _buildPlayer(){
    const startY = this.H - 100;
    this.anims.create({
      key: 'run',
      frames: [{key:'player',frame:0},{key:'player',frame:1},{key:'player',frame:2},{key:'player',frame:3}].map(
        (_,i) => ({ key:'player', frame: null, sourceSize:{w:32,h:48}, spriteSourceSize:{x:i*32,y:0,w:32,h:48} })
      ),
      frameRate: 10, repeat: -1
    });

    this.player = this.physics.add.sprite(120, startY, 'player');
    this.player.setCollideWorldBounds(false);
    this.player.body.setSize(24, 44);
    this.player.setDepth(10);
    this.player.setScale(1.3);

    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platforms);
  }

  // ─────────────────────────────────────────────
  //  ENEMIGOS QUE SE MUEVEN
  // ─────────────────────────────────────────────
  _buildEnemies(){
    this.enemyGroup = this.physics.add.group();
    const lvl = this.lvl;
    const types = lvl.enemies;
    const count = Math.floor(lvl.levelLength / 380 * lvl.enemyDensity);

    for(let i = 0; i < count; i++){
      const type = types[i % types.length];
      const x = Phaser.Math.Between(400, lvl.levelLength - 200);
      const groundY = this._getGroundYAt(x, this._segments);
      const textures = {
        lollipop: 'enemy_lollipop',
        cake: 'enemy_cake',
        chocolate: 'enemy_chocolate',
        cupcake: 'enemy_cupcake',
      };
      const enemy = this.enemyGroup.create(x, groundY - 20, textures[type]);
      enemy.setData('type', type);
      enemy.setData('hit', false);
      enemy.setData('frame', 0);
      enemy.setData('frameTick', 0);
      enemy.setDepth(8);
      enemy.body.allowGravity = false;
      enemy.body.setImmovable(true);

      // Movimiento horizontal de patrulla
      const speed = Phaser.Math.Between(40, 90);
      enemy.setData('speed', speed);
      enemy.body.setVelocityX(-speed);
      enemy.setData('startX', x);
      enemy.setData('patrolRange', Phaser.Math.Between(80, 200));
    }

    this.physics.add.overlap(this.player, this.enemyGroup, (player, enemy) => {
      if(this.isDead || enemy.getData('hit')) return;
      enemy.setData('hit', true);
      this.time.delayedCall(1500, ()=> enemy.setData('hit', false));
      const type = enemy.getData('type');
      this.glucose.applyEnemyHit(type);
      if(type === 'cupcake') this._applySlowEffect();
      this._flashScreen(0xFF0000, 200);
      this._showFloat(player.x, player.y - 40,
        `+${CONFIG['ENEMY_'+type.toUpperCase()+'_RAISE']} 📈`, '#FF5252');
      // Empujar enemigo atrás
      enemy.body.setVelocityX(enemy.body.velocity.x * -1);
    });
  }

  // ─────────────────────────────────────────────
  //  MANZANAS
  // ─────────────────────────────────────────────
  _buildApples(){
    this.appleGroup = this.physics.add.staticGroup();
    const lvl = this.lvl;
    for(let i = 0; i < lvl.apples; i++){
      const x = Phaser.Math.Between(500, lvl.levelLength - 300);
      const groundY = this._getGroundYAt(x, this._segments);
      const apple = this.appleGroup.create(x, groundY - 60, 'apple');
      apple.setDepth(7);
      // Animación flotante
      this.tweens.add({
        targets: apple, y: groundY - 70,
        duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
    }

    this.physics.add.overlap(this.player, this.appleGroup, (_, apple) => {
      apple.destroy();
      this.glucose.applyApple();
      this._showFloat(this.player.x, this.player.y - 40, '🍎 +20', '#E53935');
    });
  }

  // ─────────────────────────────────────────────
  //  CHECKPOINTS
  // ─────────────────────────────────────────────
  _buildCheckpoints(){
    this.cpGroup = this.physics.add.staticGroup();
    const lvl = this.lvl;
    const spacing = lvl.levelLength / (lvl.checkpoints + 1);

    for(let i = 1; i <= lvl.checkpoints; i++){
      const x = spacing * i;
      const groundY = this._getGroundYAt(x, this._segments);
      const cp = this.cpGroup.create(x, groundY - 24, 'checkpoint');
      cp.setData('passed', false);
      cp.setData('index', i);
      cp.setDepth(6);
    }

    this.physics.add.overlap(this.player, this.cpGroup, (_, cp) => {
      if(cp.getData('passed')) return;
      cp.setData('passed', true);
      cp.setTint(0x00FF00);
      const pts = this.scoring.recordCheckpoint(this.glucose.value);
      this._showFloat(this.player.x, this.player.y - 60, `+${pts} pts ⭐`, '#FFC107');
    });
  }

  // ─────────────────────────────────────────────
  //  CONTROLES TÁCTILES
  // ─────────────────────────────────────────────
  _buildControls(){
    const W = this.W;
    const H = this.H;
    const btnSize = Math.min(W, H) * 0.13;

    // Botón SALTAR
    const jumpGfx = this.add.graphics();
    jumpGfx.fillStyle(0x1565C0, 0.85);
    jumpGfx.fillCircle(btnSize + 10, H - btnSize - 10, btnSize);
    jumpGfx.setScrollFactor(0).setDepth(100);
    jumpGfx.setInteractive(
      new Phaser.Geom.Circle(btnSize + 10, H - btnSize - 10, btnSize),
      Phaser.Geom.Circle.Contains
    );
    this.add.text(btnSize + 10, H - btnSize - 10, '▲', {
      fontSize: `${btnSize}px`, fill: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    jumpGfx.on('pointerdown', ()=> this._doJump());

    // Botón INSULINA LENTA (verde)
    const slowX = W - btnSize * 2.4;
    const slowY = H - btnSize - 10;
    const slowGfx = this.add.graphics();
    slowGfx.fillStyle(CONFIG.COLOR_INSULIN_SLOW, 0.9);
    slowGfx.fillCircle(slowX, slowY, btnSize);
    slowGfx.setScrollFactor(0).setDepth(100);
    slowGfx.setInteractive(
      new Phaser.Geom.Circle(slowX, slowY, btnSize),
      Phaser.Geom.Circle.Contains
    );
    this.add.text(slowX, slowY - btnSize * 0.25, '💉', {
      fontSize: `${btnSize * 0.7}px`,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    this.add.text(slowX, slowY + btnSize * 0.3, 'LENTA', {
      fontSize: `${btnSize * 0.28}px`, fill: '#fff', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    slowGfx.on('pointerdown', ()=>{
      this.glucose.applyInsulinSlow();
      this._showFloat(this.player.x, this.player.y - 40, '💉 Insulina lenta', '#4CAF50');
    });

    // Botón INSULINA RÁPIDA (naranja)
    const fastX = W - btnSize * 0.9;
    const fastY = H - btnSize - 10;
    const fastGfx = this.add.graphics();
    fastGfx.fillStyle(CONFIG.COLOR_INSULIN_FAST, 0.9);
    fastGfx.fillCircle(fastX, fastY, btnSize * 0.75);
    fastGfx.setScrollFactor(0).setDepth(100);
    fastGfx.setInteractive(
      new Phaser.Geom.Circle(fastX, fastY, btnSize * 0.75),
      Phaser.Geom.Circle.Contains
    );
    this.add.text(fastX, fastY - btnSize * 0.2, '⚡', {
      fontSize: `${btnSize * 0.55}px`,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    this.fastCountTxt = this.add.text(fastX, fastY + btnSize * 0.3, `x${this.fastInsulinLeft}`, {
      fontSize: `${btnSize * 0.28}px`, fill: '#fff', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    fastGfx.on('pointerdown', ()=>{
      if(this.fastInsulinLeft <= 0) return;
      this.fastInsulinLeft--;
      this.fastCountTxt.setText(`x${this.fastInsulinLeft}`);
      this.glucose.applyInsulinFast();
      this._showFloat(this.player.x, this.player.y - 40, `⚡ -${CONFIG.INSULIN_FAST_DROP}`, '#FF6F00');
    });

    this.input.addPointer(3);
  }

  _buildAccelerometer(){
    if(!window.DeviceMotionEvent) return;
    window.addEventListener('devicemotion', (e)=>{
      if(this.isDead || this.levelDone) return;
      const a = e.accelerationIncludingGravity;
      if(!a) return;
      const mag = Math.sqrt(a.x**2 + a.y**2 + a.z**2);
      if(mag > CONFIG.SHAKE_THRESHOLD){
        this.isFastRun = true;
        this.fastRunTimer = CONFIG.FAST_RUN_DURATION;
      }
    });
  }

  // ─────────────────────────────────────────────
  //  HELPERS
  // ─────────────────────────────────────────────
  _doJump(){
    if(this.isDead) return;
    if(this.player.body.blocked.down){
      this.player.body.setVelocityY(CONFIG.PLAYER_JUMP_VELOCITY);
      this.glucose.applyJump();
    }
  }

  _applySlowEffect(){
    this.isSlowed = true;
    this.time.delayedCall(CONFIG.ENEMY_CUPCAKE_SLOW_MS, ()=> this.isSlowed = false);
  }

  _flashScreen(color, duration){
    const f = this.add.graphics();
    f.fillStyle(color, 0.35).fillRect(0, 0, this.W, this.H);
    f.setScrollFactor(0).setDepth(200);
    this.time.delayedCall(duration, ()=> f.destroy());
  }

  _showFloat(x, y, text, color){
    const t = this.add.text(x, y, text, {
      fontSize: '15px', fill: color, fontFamily: 'monospace', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(150);
    this.tweens.add({ targets: t, y: y - 55, alpha: 0, duration: 1300,
      onComplete: ()=> t.destroy() });
  }

  _triggerHypo(){
    if(this.isDead) return;
    this.isDead = true;
    this.player.body.setVelocityX(0);
    this._flashScreen(0x1565C0, 800);

    const W = this.W; const H = this.H;
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000033, 0.82).fillRect(0, 0, W, H);
    overlay.setScrollFactor(0).setDepth(300);

    this.add.text(W/2, H * 0.3, '😵 HIPOGLUCEMIA', {
      fontSize: `${H*0.055}px`, fill: '#4FC3F7', fontFamily: 'monospace', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    this.add.text(W/2, H * 0.44, `Glucagones: ${this.glucagonLeft}`, {
      fontSize: `${H*0.038}px`, fill: '#fff', fontFamily: 'monospace',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    if(this.glucagonLeft > 0){
      const btn = this.add.text(W/2, H * 0.58, '💉 USAR GLUCAGÓN', {
        fontSize: `${H*0.045}px`, fill: '#000', fontFamily: 'monospace', fontStyle: 'bold',
        backgroundColor: '#4CAF50', padding: { x: 20, y: 12 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
      btn.on('pointerdown', ()=>{
        this.glucagonLeft--;
        this.glucose.applyGlucagon();
        this.isDead = false;
        overlay.destroy(); btn.destroy();
      });
    } else {
      this.add.text(W/2, H * 0.58, '¡Sin glucagón! Fin del nivel', {
        fontSize: `${H*0.035}px`, fill: '#FF5252', fontFamily: 'monospace',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
      this.time.delayedCall(2500, ()=> this._endLevel());
    }
  }

  _endLevel(){
    if(this.levelDone) return;
    this.levelDone = true;
    const speedBonus = this.scoring.recordFinish();
    this.scene.stop('HUD');
    this.scene.start('Result', {
      score: this.scoring.totalScore,
      timeSeconds: this.scoring.getElapsedSeconds(),
      timeInRange: this.scoring.getTimeInRangePercent(),
      rangazoPercent: this.scoring.getRangazoPercent(),
      speedBonus,
      levelIndex: this.registry.get('currentLevel') || 0,
      playerName: this.registry.get('playerName') || window._playerName,
    });
  }

  // ─────────────────────────────────────────────
  //  UPDATE
  // ─────────────────────────────────────────────
  update(time, delta){
    if(this.isDead || this.levelDone) return;

    // Fast run timer
    if(this.isFastRun){
      this.fastRunTimer -= delta;
      if(this.fastRunTimer <= 0) this.isFastRun = false;
    }

    // Velocidad
    const speed = this.isSlowed ? CONFIG.PLAYER_BASE_SPEED * 0.45
                : this.isFastRun ? CONFIG.PLAYER_FAST_SPEED
                : CONFIG.PLAYER_BASE_SPEED;
    this.player.body.setVelocityX(speed);

    // Detectar cuesta
    const px = this.player.x;
    this.isUphill = this.lvl.uphillZones.some(([s,e])=> px >= s && px <= e);

    // Actualizar glucosa
    const onGround = this.player.body.blocked.down;
    this.glucose.update(delta, true, this.isFastRun, !onGround, this.isUphill);

    // Hipoglucemia
    if(this.glucose.value <= CONFIG.HYPO_THRESHOLD){
      this._triggerHypo();
      return;
    }

    // Efectos visuales
    this._updateVFX();

    // Actualizar enemigos (patrulla + animación)
    this.enemyGroup.getChildren().forEach(enemy => {
      const sx    = enemy.getData('startX');
      const range = enemy.getData('patrolRange');
      const spd   = enemy.getData('speed');
      if(enemy.x < sx - range){
        enemy.body.setVelocityX(spd);
        enemy.setFlipX(true);
      } else if(enemy.x > sx + range){
        enemy.body.setVelocityX(-spd);
        enemy.setFlipX(false);
      }
      // Animación frame swap
      let ft = enemy.getData('frameTick') + delta;
      if(ft > 300){ ft = 0; enemy.setData('frame', 1 - enemy.getData('frame')); }
      enemy.setData('frameTick', ft);
    });

    // Meta
    if(this.player.x >= this.metaX) this._endLevel();

    // Actualizar HUD
    const hud = this.scene.get('HUD');
    if(hud) hud.updateGlucose(this.glucose, this.glucagonLeft, this.fastInsulinLeft);
  }

  _updateVFX(){
    const state = this.glucose.getState();

    // Tint del personaje
    if(state === 'rangazo'){
      this.player.setTint(0xFFD700);
    } else if(state === 'hypo' || state === 'low'){
      this.player.setTint(0x90CAF9);
      // Tambaleo
      this.player.setAngle(Math.sin(this.time.now / 100) * 8);
    } else {
      this.player.clearTint();
      this.player.setAngle(0);
    }

    // Overlay hiper
    if(!this._hyperOverlay){
      this._hyperOverlay = this.add.graphics().setScrollFactor(0).setDepth(190);
    }
    this._hyperOverlay.clear();
    if(state === 'hyper'){
      const alpha = 0.08 + 0.07 * Math.sin(this.time.now / 200);
      this._hyperOverlay.fillStyle(0xFF0000, alpha)
        .fillRect(0, 0, this.W, this.H);
    }
  }
}
