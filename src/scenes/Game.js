// ================================================================
//  Game.js — Escena principal.
// ================================================================
class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  init(data) {
    this._lvlIdx = (data && data.lvl != null) ? data.lvl : 0;
  }

  create() {
    const lvl = CONFIG.LEVELS[this._lvlIdx];

    this._fast      = false;
    this._fastTimer = 0;
    this._dead      = false;
    this._done      = false;
    this._fastLeft  = CONFIG.INS_FAST_MAX;

    this.physics.world.gravity.y = CONFIG.GRAVITY;
    this.physics.world.setBounds(0, 0, lvl.length, CONFIG.H + 200);

    this.cameras.main.setBackgroundColor(lvl.skyColor);
    this._buildBackground(lvl);

    // Tiempo de referencia para el bonus de velocidad
    const refSecs   = Math.round(lvl.length / CONFIG.SPD_NORMAL);
    this._glucose   = new Glucose();
    this._score     = new Score(refSecs);
    this._glucagons = lvl.glucagons;
    this._backpack  = CONFIG.BACKPACK_START;

    this._ground = new Ground(this, lvl);

    const startY = CONFIG.GROUND_Y - 30;
    this._player = new Player(this, 200, startY);
    this._player.addToGround(this._ground);

    this._spawner = new Spawner(this, lvl, this._ground);
    this._spawner.addOverlap(this._player.sprite, (type) => {
      this._onEnemyHit(type);
    });

    this._buildPickups(lvl);

    this._hud = new HUD(this, this._glucagons, this._fastLeft, this._backpack);
    this._hud.onJump(() => this._player.jump(this._glucose));
    this._hud.onSlowInsulin(() => {
      this._glucose.useSlowInsulin();
      this._float(this._player.x, this._player.y - 45, '💉 -5/s x5s', '#43A047');
    });
    this._hud.onFastInsulin(() => {
      if (this._fastLeft <= 0) return;
      this._fastLeft--;
      this._glucose.useFastInsulin();
      this._float(this._player.x, this._player.y - 45, `⚡ -${CONFIG.INS_FAST_DROP}`, '#FF6F00');
    });
    this._hud.onEatApple(() => {
      if (this._backpack <= 0) return;
      this._backpack--;
      this._glucose.eatApple();
      this._float(this._player.x, this._player.y - 45, `🍎 +${CONFIG.APPLE_RAISE}`, '#A5D6A7');
    });

    this.cameras.main.setBounds(0, 0, lvl.length, CONFIG.H);
    this.cameras.main.startFollow(this._player.sprite, false, 0.1, 1);
    this.cameras.main.setFollowOffset(-CONFIG.W * 0.25, 0);
    this._hud.buildMinimap(this._ground, lvl.length);

    this._buildAccelerometer();

    this._metaX = lvl.length - 160;
    this._buildMeta(lvl);

    this.input.addPointer(3);
    this._lvl = lvl;
  }

  _buildBackground(lvl) {
    const L  = lvl.length;
    const GY = CONFIG.GROUND_Y;
    const g  = this.add.graphics().setScrollFactor(0.15).setDepth(0);

    if (lvl.skyColor === 0x87CEEB) {
      g.fillStyle(0x90A4AE, 1);
      for (let bx = 60; bx < L; bx += 220) {
        const bh = Phaser.Math.Between(70, 180);
        const bw = Phaser.Math.Between(40, 80);
        g.fillRect(bx, GY - bh, bw, bh);
        g.fillStyle(0xFFF9C4, 0.65);
        for (let wy = GY - bh + 8; wy < GY - 6; wy += 16)
          for (let wx = bx + 5; wx < bx + bw - 5; wx += 13)
            g.fillRect(wx, wy, 7, 9);
        g.fillStyle(0x90A4AE, 1);
      }
    } else {
      const tc = (lvl.skyColor === 0x2E7D32) ? 0x1B5E20
               : (lvl.skyColor === 0x78909C) ? 0x37474F
               : (lvl.skyColor === 0xF48FB1) ? 0xAD1457
               : 0x283593;
      g.fillStyle(tc, 1);
      for (let tx = 40; tx < L; tx += 150) {
        const th = Phaser.Math.Between(40, 90);
        g.fillTriangle(tx, GY, tx + 22, GY - th, tx + 44, GY);
        g.fillTriangle(tx + 10, GY, tx + 22, GY - th * 0.65, tx + 34, GY);
      }
    }
  }

  _buildMeta(lvl) {
    const GY = CONFIG.GROUND_Y;
    const mx = this._metaX;
    const g  = this.add.graphics().setDepth(3);
    g.fillStyle(0xFFD700, 1).fillRect(mx, GY - 88, 6, 88);
    g.fillStyle(0xFFC107, 1).fillTriangle(mx + 6, GY - 88, mx + 6, GY - 52, mx + 52, GY - 70);
    this.add.text(mx + 2, GY - 104, 'META', {
      fontSize: '13px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#FFD700', stroke: '#000', strokeThickness: 2,
    }).setDepth(4);
  }

  _buildPickups(lvl) {
    const GY = CONFIG.GROUND_Y;

    // ── Manzanas: van a la mochila ──
    this._apples = this.physics.add.staticGroup();
    for (let i = 0; i < lvl.apples; i++) {
      let ax, tries = 0;
      do { ax = Phaser.Math.Between(600, lvl.length - 400); tries++; }
      while (!this._ground.isSolidAt(ax) && tries < 20);
      if (!this.textures.exists('_apple')) this._makeAppleTex();
      const a = this._apples.create(ax, GY - 52, '_apple');
      a.setDepth(7);
      a.refreshBody();
      this.tweens.add({ targets: a, y: GY - 62, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    this.physics.add.overlap(this._player.sprite, this._apples, (_, a) => {
      a.destroy();
      if (this._backpack < CONFIG.BACKPACK_MAX) {
        this._backpack++;
        this._float(this._player.x, this._player.y - 50, `🎒 Mochila: ${this._backpack}`, '#FFC107');
      } else {
        // Mochila llena: se come directamente
        this._glucose.eatApple();
        this._float(this._player.x, this._player.y - 50, `🍎 +${CONFIG.APPLE_RAISE}`, '#A5D6A7');
      }
    });

    // ── Checkpoints ──
    this._cps = this.physics.add.staticGroup();
    const sp  = lvl.length / (lvl.checkpoints + 1);
    for (let i = 1; i <= lvl.checkpoints; i++) {
      const cx = sp * i;
      if (!this.textures.exists('_cp')) this._makeCpTex();
      const cp = this._cps.create(cx, GY - 28, '_cp');
      cp.setDepth(6);
      cp.setData('done', false);
      cp.refreshBody();
    }
    this.physics.add.overlap(this._player.sprite, this._cps, (_, cp) => {
      if (cp.getData('done')) return;
      cp.setData('done', true);
      cp.setTint(0x00E676);
      const { pts } = this._score.checkpoint(this._glucose.v);
      this._float(this._player.x, this._player.y - 60, `+${pts} pts`, '#FFC107');
    });
  }

  _makeAppleTex() {
    const g = this.make.graphics({ add: false });
    const S = 4;
    g.fillStyle(0x4CAF50, 1).fillRect(4*S, 0, 2*S, 2*S);
    g.fillStyle(0xC62828, 1).fillRect(1*S, 2*S, 8*S, 7*S);
    g.fillStyle(0xC62828, 1).fillRect(0, 3*S, 10*S, 5*S);
    g.fillStyle(0xE53935, 1).fillRect(2*S, 3*S, 6*S, 5*S);
    g.fillStyle(0xFF8A80, 1).fillRect(2*S, 3*S, 2*S, 2*S);
    g.generateTexture('_apple', 10*S, 9*S);
    g.destroy();
  }

  _makeCpTex() {
    const g = this.make.graphics({ add: false });
    const S = 3;
    g.fillStyle(0x546E7A, 1).fillRect(3*S, 0, 2*S, 20*S);
    g.fillStyle(0xFFC107, 1).fillRect(4*S, 2*S, 6*S, 3*S).fillRect(4*S, 5*S, 6*S, 1*S);
    g.generateTexture('_cp', 10*S, 20*S);
    g.destroy();
  }

  _buildAccelerometer() {
    if (!window.DeviceMotionEvent) return;
    this._motionHandler = (e) => {
      if (this._dead || this._done) return;
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      if (Math.sqrt(a.x**2 + a.y**2 + a.z**2) > CONFIG.SHAKE_G) {
        this._fast      = true;
        this._fastTimer = CONFIG.FAST_MS;
      }
    };
    window.addEventListener('devicemotion', this._motionHandler);
  }

  _onEnemyHit(type) {
    this._glucose.onEnemyHit(type);
    this._flash(0xFF0000, 160);
    const raise = CONFIG.ENEMY_RAISE[type] || 0;
    this._float(this._player.x, this._player.y - 40, `+${raise} 📈`, '#FF5252');
  }

  _triggerHole() {
    if (this._dead || this._done) return;
    this._dead = true;
    this._player.sprite.body.setVelocityX(0);
    this._player.sprite.body.setVelocityY(0);
    this._flash(0xB71C1C, 600);

    const W = CONFIG.W, H = CONFIG.H;
    const ov = this.add.graphics().setScrollFactor(0).setDepth(300);
    ov.fillStyle(0x000820, 0.92).fillRect(0, 0, W, H);

    this.add.text(W/2, H*0.25, '💀', { fontSize: '52px' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(301);
    this.add.text(W/2, H*0.45, '¡CAÍDA AL VACÍO!', {
      fontSize: '26px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#FF5252', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    this.add.text(W/2, H*0.60, 'Fin del nivel', {
      fontSize: '15px', fontFamily: 'monospace', fill: '#fff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    this.time.delayedCall(2200, () => this._finish());
  }

  _triggerHypo() {
    if (this._dead) return;
    this._dead = true;
    this._player.sprite.body.setVelocityX(0);
    this._player.sprite.body.setVelocityY(0);
    this._flash(0x1565C0, 500);

    const W = CONFIG.W, H = CONFIG.H;
    const ov = this.add.graphics().setScrollFactor(0).setDepth(300);
    ov.fillStyle(0x000820, 0.9).fillRect(0, 0, W, H);

    this.add.text(W/2, H*0.20, '😵', { fontSize: '52px' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(301);
    this.add.text(W/2, H*0.40, 'HIPOGLUCEMIA', {
      fontSize: '26px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#4FC3F7', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    this.add.text(W/2, H*0.54, `Glucagones: ${this._glucagons}`, {
      fontSize: '15px', fontFamily: 'monospace', fill: '#fff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    if (this._glucagons > 0) {
      const btn = this.add.text(W/2, H*0.70, '💉 USAR GLUCAGÓN', {
        fontSize: '20px', fontFamily: 'monospace', fontStyle: 'bold',
        fill: '#000', backgroundColor: '#43A047', padding: { x: 18, y: 10 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301)
        .setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => {
        this._glucagons--;
        this._glucose.useGlucagon();
        // Volver a suelo sólido plano cercano
        const safeX = this._findSafeX(this._player.x);
        this._player.sprite.body.reset(safeX, CONFIG.GROUND_Y - 30);
        this._dead = false;
        ov.destroy();
        btn.destroy();
      });
    } else {
      this.add.text(W/2, H*0.70, 'Sin glucagón — fin del nivel', {
        fontSize: '15px', fontFamily: 'monospace', fill: '#FF5252',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
      this.time.delayedCall(2500, () => this._finish());
    }
  }

  _findSafeX(fromX) {
    for (let dx = 0; dx < 800; dx += 20) {
      const tx = fromX - dx;
      if (tx > 0 && this._ground.isSolidAt(tx) && !this._ground.isSlopeAt(tx))
        return tx;
    }
    return 300;
  }

  _finish() {
    if (this._done) return;
    this._done = true;
    if (this._motionHandler) window.removeEventListener('devicemotion', this._motionHandler);
    const bonus = this._score.finish();
    this.scene.start('Result', {
      score:  this._score.total,
      secs:   this._score.elapsedSecs,
      tir:    this._score.timeInRange,
      rng:    this._score.rangazoPct,
      bonus,
      lvlIdx: this._lvlIdx,
      name:   window.PLAYER_NAME,
    });
  }

  _flash(color, dur) {
    const f = this.add.graphics().setScrollFactor(0).setDepth(200);
    f.fillStyle(color, 0.28).fillRect(0, 0, CONFIG.W, CONFIG.H);
    this.time.delayedCall(dur, () => f.destroy());
  }

  _float(x, y, text, color) {
    const t = this.add.text(x, y, text, {
      fontSize: '13px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: color, stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(150);
    this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 1200, onComplete: () => t.destroy() });
  }

  update(time, delta) {
    if (this._dead || this._done) return;

    const dt = delta / 1000;

    if (this._fast) {
      this._fastTimer -= delta;
      if (this._fastTimer <= 0) this._fast = false;
    }

    // Caída en agujero = fin de partida inmediato
    const overHole = !this._ground.isSolidAt(this._player.x) &&
                     this._player.sprite.body.blocked.down === false &&
                     this._player.y > CONFIG.GROUND_Y - 10;
    if (overHole || this._player.y > CONFIG.H + 40) {
      this._triggerHole();
      return;
    }

    const onSlope = this._ground.isSlopeAt(this._player.x);
    this._glucose.tick(dt, true, this._fast, onSlope);

    if (this._glucose.isHypo) {
      this._triggerHypo();
      return;
    }

    // Rampa: cuando el sprite toca el suelo en zona de cuesta,
    // desactivamos la gravedad y lo pegamos suavemente a la superficie.
    // Así el personaje desliza sin botes ni escalones.
    const body = this._player.sprite.body;
    if (onSlope && body.blocked.down) {
      const surfY   = this._ground.getSurfaceY(this._player.x);
      const targetY = surfY - this._player.sprite.height / 2;
      body.allowGravity = false;
      body.setVelocityY(0);
      this._player.sprite.setY(targetY);
    } else {
      body.allowGravity = true;
    }

    this._player.update(delta, this._fast);
    this._player.applyGlucoseVFX(this._glucose.state, time);
    this._spawner.update(delta);

    if (this._player.x >= this._metaX) this._finish();

    this._hud.refresh(this._glucose, this._glucagons, this._fastLeft, this._fast, onSlope, this._backpack, this._player.x, this._glucose.slowSecsLeft);
  }
}
