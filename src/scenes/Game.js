// ================================================================
//  Game.js — Escena principal. Solo orquesta módulos.
//  La lógica vive en Glucose, Score, Player, Spawner, Ground, HUD.
// ================================================================
class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  init(data) {
    this._lvlIdx = (data && data.lvl != null) ? data.lvl : 0;
  }

  create() {
    const lvl = CONFIG.LEVELS[this._lvlIdx];

    // ── Estado de partida ──
    this._fast      = false;
    this._fastTimer = 0;
    this._dead      = false;
    this._done      = false;
    this._fastLeft  = CONFIG.INS_FAST_MAX;

    // ── Física ──
    this.physics.world.gravity.y = CONFIG.GRAVITY;
    this.physics.world.setBounds(0, 0, lvl.length, CONFIG.H + 200);

    // ── Fondo ──
    this.cameras.main.setBackgroundColor(lvl.skyColor);
    this._buildBackground(lvl);

    // ── Sistemas ──
    this._glucose   = new Glucose();
    this._score     = new Score();
    this._glucagons = lvl.glucagons;

    // ── Mundo ──
    this._ground = new Ground(this, lvl);

    // ── Entidades ──
    const startY = CONFIG.GROUND_Y - 30;
    this._player = new Player(this, 200, startY);
    this._player.addToGround(this._ground);

    this._spawner = new Spawner(this, lvl, this._ground);
    this._spawner.addOverlap(this._player.sprite, (type) => {
      this._onEnemyHit(type);
    });

    // ── Ítems ──
    this._buildPickups(lvl);

    // ── HUD ──
    this._hud = new HUD(this, this._glucagons, this._fastLeft);
    this._hud.onJump(() => this._player.jump(this._glucose));
    this._hud.onSlowInsulin(() => {
      this._glucose.useSlowInsulin();
      this._float(this._player.x, this._player.y - 45, '💉 Bajando...', '#43A047');
    });
    this._hud.onFastInsulin(() => {
      if (this._fastLeft <= 0) return;
      this._fastLeft--;
      this._glucose.useFastInsulin();
      this._float(this._player.x, this._player.y - 45, `⚡ -${CONFIG.INS_FAST_DROP}`, '#FF6F00');
    });

    // ── Cámara ──
    this.cameras.main.setBounds(0, 0, lvl.length, CONFIG.H);
    this.cameras.main.startFollow(this._player.sprite, false, 0.1, 1);
    this.cameras.main.setFollowOffset(-CONFIG.W * 0.25, 0);

    // ── Acelerómetro ──
    this._buildAccelerometer();

    // ── Meta ──
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
      this._glucose.eatApple();
      this._float(this._player.x, this._player.y - 50, '🍎 +azúcar', '#43A047');
    });

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
    if (type === 'cupcake') this._player.applySlow();
    this._flash(0xFF0000, 160);
    const raise = CONFIG.ENEMY_RAISE[type] || 0;
    this._float(this._player.x, this._player.y - 40, `+${raise} 📈`, '#FF5252');
  }

  _triggerHypo() {
    if (this._dead) return;
    this._dead = true;
    this._player.sprite.body.setVelocityX(0);
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
    this.add.text(W/2, H*0.54, `Glucagones restantes: ${this._glucagons}`, {
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

    // Fast timer
    if (this._fast) {
      this._fastTimer -= delta;
      if (this._fastTimer <= 0) this._fast = false;
    }

    // Caída en agujero
    const overHole = !this._ground.isSolidAt(this._player.x) &&
                     this._player.sprite.body.blocked.down === false &&
                     this._player.y > CONFIG.GROUND_Y - 10;
    if (overHole || this._player.y > CONFIG.H + 40) {
      this._glucose.v = CONFIG.HYPO_THRESH - 1;
    }

    // Detectar cuesta
    const onSlope = this._ground.isSlopeAt(this._player.x);

    // Actualizar glucosa
    this._glucose.tick(dt, true, this._fast, onSlope);

    // Hipoglucemia
    if (this._glucose.isHypo) {
      this._triggerHypo();
      return;
    }

    // Actualizar entidades
    this._player.update(delta, this._fast);
    this._player.applyGlucoseVFX(this._glucose.state, time);
    this._spawner.update(delta);

    // Meta
    if (this._player.x >= this._metaX) this._finish();

    // HUD
    this._hud.refresh(this._glucose, this._glucagons, this._fastLeft, this._fast, onSlope);
  }
}
