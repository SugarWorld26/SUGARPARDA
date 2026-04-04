// ================================================================
//  Game.js — Escena principal.
// ================================================================
class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  init(data) {
    this._lvlIdx      = (data && data.lvl         != null) ? data.lvl         : 0;
    this._prevScore   = (data && data.prevScore    != null) ? data.prevScore    : 0;
    this._prevFast    = (data && data.prevFast     != null) ? data.prevFast     : CONFIG.INS_FAST_MAX;
    this._prevBackpack= (data && data.prevBackpack != null) ? data.prevBackpack : CONFIG.BACKPACK_START;
  }

  create() {
    const lvl = CONFIG.LEVELS[this._lvlIdx];

    this._fast        = false;
    this._fastTimer   = 0;
    this._dead        = false;
    this._done        = false;
    this._fastLeft    = this._prevFast;
    this._slopeJump   = false;  // true mientras salta en rampa
    this._wasOnSlope  = false;  // para detectar entrada en rampa

    this.physics.world.gravity.y = CONFIG.GRAVITY;
    this.physics.world.setBounds(0, 0, lvl.length, CONFIG.H + 200);

    this.cameras.main.setBackgroundColor(lvl.skyColor);
    this._buildBackground(lvl);

    this._glucose   = new Glucose();
    this._score     = new Score();
    this._glucagons = lvl.glucagons;
    this._backpack  = this._prevBackpack;

    this._ground = new Ground(this, lvl);

    AudioManager.unlock();
    AudioManager.playMusic(this._lvlIdx);

    const startY = CONFIG.GROUND_Y - 48;
    this._player = new Player(this, 200, startY);
    this._player.addToGround(this._ground);

    this._spawner = new Spawner(this, lvl, this._ground);
    this._spawner.addOverlap(this._player.sprite, (type) => {
      this._onEnemyHit(type);
    });

    this._buildPickups(lvl);

    this._hud = new HUD(this, this._glucagons, this._fastLeft, this._backpack);
    this._hud.onJump(() => {
      if (this._slopeJump) return;
      const slope  = this._ground.isSlopeAt(this._player.x);
      const jumped = this._player.jump(this._glucose, slope);
      if (jumped) {
        AudioManager.sfx('jump');
        if (slope) this._slopeJump = true;
      }
    });
    this._hud.onSlowInsulin(() => {
      this._glucose.useSlowInsulin();
      AudioManager.sfx('slowInsulin');
      this._float(this._player.x, this._player.y - 45, '💉 -5/s x5s', '#43A047');
    });
    this._hud.onFastInsulin(() => {
      if (this._fastLeft <= 0) return;
      this._fastLeft--;
      this._glucose.useFastInsulin();
      AudioManager.sfx('fastInsulin');
      this._float(this._player.x, this._player.y - 45, `⚡ -${CONFIG.INS_FAST_DROP}`, '#FF6F00');
    });
    this._hud.onEatApple(() => {
      if (this._backpack <= 0) return;
      this._backpack--;
      this._glucose.eatApple();
      AudioManager.sfx('apple');
      this._float(this._player.x, this._player.y - 45, `🍎 +${CONFIG.APPLE_RAISE}`, '#A5D6A7');
    });

    this.cameras.main.setBounds(0, 0, lvl.length, CONFIG.H);
    this.cameras.main.startFollow(this._player.sprite, false, 0.1, 1);
    this.cameras.main.setFollowOffset(-CONFIG.W * 0.25, 0);
    this._hud.buildMinimap(this._ground, lvl.length, lvl.name, lvl, this._cpData);

    this._buildAccelerometer();

    this._metaX = lvl.length - 160;
    this._buildMeta(lvl);

    this.input.addPointer(3);
    this._lvl = lvl;
  }

  _buildBackground(lvl) {
    const bgKey = `bg${lvl.id}`;
    if (this.textures.exists(bgKey)) {
      // Repetir el fondo a lo largo del nivel con parallax
      const W = CONFIG.W, H = CONFIG.H;
      const L = lvl.length;
      const reps = Math.ceil(L / W) + 1;
      for (let i = 0; i < reps; i++) {
        this.add.image(i * W + W / 2, H / 2, bgKey)
          .setScrollFactor(0.3)
          .setDepth(0)
          .setDisplaySize(W, H);
      }
    }
  }

  _buildMeta(lvl) {
    const GY = CONFIG.GROUND_Y;
    const mx = this._metaX;
    if (this.textures.exists('meta_flag')) {
      this.add.image(mx + 24, GY, 'meta_flag')
        .setDepth(3).setOrigin(0.5, 1)
        .setDisplaySize(60, 110);
    } else {
      const g = this.add.graphics().setDepth(3);
      g.fillStyle(0xFFD700, 1).fillRect(mx, GY - 88, 6, 88);
      g.fillStyle(0xFFC107, 1).fillTriangle(mx + 6, GY - 88, mx + 6, GY - 52, mx + 52, GY - 70);
    }
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
      do {
        ax = Phaser.Math.Between(600, lvl.length - 400);
        tries++;
      } while ((!this._ground.isSolidAt(ax) || this._ground.isSlopeAt(ax)) && tries < 40);
      if (!this._ground.isSolidAt(ax) || this._ground.isSlopeAt(ax)) continue;
      const surfY = this._ground.getSurfaceY(ax);
      const a = this._apples.create(ax, surfY - 40, 'apple');
      a.setDepth(7);
      a.refreshBody();
      this.tweens.add({ targets: a, y: surfY - 58, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    this.physics.add.overlap(this._player.sprite, this._apples, (_, a) => {
      a.destroy();
      if (this._backpack < CONFIG.BACKPACK_MAX) {
        this._backpack++;
        AudioManager.sfx('apple');
        this._float(this._player.x, this._player.y - 50, `🎒 Mochila: ${this._backpack}`, '#FFC107');
      } else {
        this._glucose.eatApple();
        AudioManager.sfx('apple');
        this._float(this._player.x, this._player.y - 50, `🍎 +${CONFIG.APPLE_RAISE}`, '#A5D6A7');
      }
    });

    // ── Checkpoints — se activan al cruzar la X ──
    this._cpData = [];
    const sp = lvl.length / (lvl.checkpoints + 1);
    for (let i = 1; i <= lvl.checkpoints; i++) {
      let cx = Math.round(sp * i);
      // Si cae en agujero o cuesta, buscar suelo plano cercano
      let offset = 0;
      while ((!this._ground.isSolidAt(cx) || this._ground.isSlopeAt(cx)) && offset < 800) {
        offset += 20;
        cx = Math.round(sp * i) + (offset % 2 === 0 ? offset/2 : -Math.ceil(offset/2));
      }
      if (!this._ground.isSolidAt(cx) || this._ground.isSlopeAt(cx)) continue;
      const cpTex    = this.textures.exists('cp_off') ? 'cp_off' : '_cp';
      if (cpTex === '_cp' && !this.textures.exists('_cp')) this._makeCpTex();
      const cpSurfY  = this._ground.getSurfaceY(cx);
      const cpSprite = this.add.image(cx, cpSurfY, cpTex, 0).setDepth(6).setOrigin(0.5, 1);
      this._cpData.push({ x: cx, sprite: cpSprite, done: false });
    }

    // ── 1 pickup de insulina rápida por nivel ──
    this._fastPickups = this.physics.add.staticGroup();
    let fpx, fpTries = 0;
    do {
      fpx = Phaser.Math.Between(Math.round(lvl.length * 0.3), Math.round(lvl.length * 0.7));
      fpTries++;
    } while ((!this._ground.isSolidAt(fpx) || this._ground.isSlopeAt(fpx)) && fpTries < 40);
    if (this._ground.isSolidAt(fpx) && !this._ground.isSlopeAt(fpx)) {
      const fpSurfY = this._ground.getSurfaceY(fpx);
      const fp = this._fastPickups.create(fpx, fpSurfY - 40, 'fastpickup');
      fp.setDepth(7);
      fp.refreshBody();
      this.tweens.add({ targets: fp, y: fpSurfY - 58, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    this.physics.add.overlap(this._player.sprite, this._fastPickups, (_, fp) => {
      fp.destroy();
      this._fastLeft++;
      AudioManager.sfx('pickup');
      this._float(this._player.x, this._player.y - 50, '⚡ +1 dosis', '#FF6F00');
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

  _makeCpDoneTex() {
    const g = this.make.graphics({ add: false });
    const S = 3;
    g.fillStyle(0x546E7A, 1).fillRect(3*S, 0, 2*S, 20*S);
    g.fillStyle(0x00E676, 1).fillRect(4*S, 2*S, 6*S, 3*S).fillRect(4*S, 5*S, 6*S, 1*S);
    g.generateTexture('_cp_done', 10*S, 20*S);
    g.destroy();
  }

  _makeFastPickupTex() {
    const g = this.make.graphics({ add: false });
    const S = 4;
    g.fillStyle(0xFF6F00, 1).fillRect(3*S, 1*S, 5*S, 8*S);
    g.fillStyle(0xFFE0B2, 1).fillRect(4*S, 0, 3*S, 2*S);
    g.fillStyle(0xBF360C, 1).fillRect(3*S, 7*S, 5*S, 2*S);
    g.fillStyle(0xFFFFFF, 1).fillRect(4*S, 2*S, 1*S, 4*S);
    g.fillStyle(0xFFD54F, 1).fillRect(0, 3*S, 2*S, 2*S).fillRect(9*S, 3*S, 2*S, 2*S);
    g.generateTexture('_fastpickup', 11*S, 10*S);
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
    AudioManager.sfx('enemy');
    this._flash(0xFF0000, 160);
    const raise = CONFIG.ENEMY_RAISE[type] || 0;
    this._float(this._player.x, this._player.y - 40, `+${raise} 📈`, '#FF5252');
  }

  _triggerHole() {
    if (this._dead || this._done) return;
    this._dead = true;
    this._player.sprite.body.setVelocityX(0);
    this._player.sprite.body.setVelocityY(0);
    AudioManager.stopMusic();
    AudioManager.sfx('hole');
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
    AudioManager.sfx('hypo');
    this._flash(0x1565C0, 500);

    const W = CONFIG.W, H = CONFIG.H;
    const ov    = this.add.graphics().setScrollFactor(0).setDepth(300);
    ov.fillStyle(0x000820, 0.9).fillRect(0, 0, W, H);

    const t1 = this.add.text(W/2, H*0.20, '😵', { fontSize: '52px' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(301);
    const t2 = this.add.text(W/2, H*0.40, 'HIPOGLUCEMIA', {
      fontSize: '26px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#4FC3F7', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    const t3 = this.add.text(W/2, H*0.54, `Glucagones: ${this._glucagons}`, {
      fontSize: '15px', fontFamily: 'monospace', fill: '#fff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const destroyAll = () => { ov.destroy(); t1.destroy(); t2.destroy(); t3.destroy(); };

    if (this._glucagons > 0) {
      const btn = this.add.text(W/2, H*0.70, '💉 USAR GLUCAGÓN', {
        fontSize: '20px', fontFamily: 'monospace', fontStyle: 'bold',
        fill: '#000', backgroundColor: '#43A047', padding: { x: 18, y: 10 },
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301)
        .setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => {
        this._glucagons--;
        this._glucose.useGlucagon();
        AudioManager.sfx('glucagon');
        const safeX = this._findSafeX(this._player.x);
        this._player.sprite.body.reset(safeX, CONFIG.GROUND_Y - 48);
        this._dead = false;
        destroyAll();
        btn.destroy();
      });
    } else {
      this.add.text(W/2, H*0.70, 'Sin glucagón — fin del juego', {
        fontSize: '15px', fontFamily: 'monospace', fill: '#FF5252',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
      this.time.delayedCall(2500, () => this.scene.start('Menu'));
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

  _finish(gameOver = false) {
    if (this._done) return;
    this._done = true;
    if (this._motionHandler) window.removeEventListener('devicemotion', this._motionHandler);
    this._score.finish();
    AudioManager.stopMusic();
    const isLast = this._lvlIdx + 1 >= CONFIG.LEVELS.length;
    if (!gameOver) {
      if (isLast) AudioManager.sfx('winFinal');
      else        AudioManager.sfx('winLevel');
    }
    this.scene.start('Result', {
      score:        this._score.total + this._prevScore,
      secs:         this._score.elapsedSecs,
      tir:          this._score.timeInRange,
      rng:          this._score.rangazoPct,
      lvlIdx:       this._lvlIdx,
      name:         window.PLAYER_NAME,
      prevFast:     this._fastLeft,
      prevBackpack: this._backpack,
      gameOver,
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
    // Agujero: solo cuando ha caído físicamente por debajo del suelo
    const belowGround = this._player.y > CONFIG.GROUND_Y + 80;
    const offScreen   = this._player.y > CONFIG.H + 40;
    if (belowGround || offScreen) {
      this._triggerHole();
      return;
    }

    const onSlope = this._ground.isSlopeAt(this._player.x);
    this._glucose.tick(dt, true, this._fast, onSlope);

    if (this._glucose.isHypo) {
      this._triggerHypo();
      return;
    }

    // ── Lógica de rampa sin física ──────────────────────────────
    if (onSlope) {
      const sprite  = this._player.sprite;
      const surfY   = this._ground.getSurfaceY(this._player.x);
      const targetY = surfY - 48;

      if (this._slopeJump) {
        // En salto sobre rampa: física libre, sin snap
        sprite.body.allowGravity = true;
        // Aterriza cuando baja y está cerca del suelo
        if (sprite.body.velocity.y >= 0 && sprite.y >= targetY - 4) {
          this._slopeJump = false;
        }
      }

      if (!this._slopeJump) {
        // En suelo de rampa: pegar Y exacta
        sprite.body.allowGravity = false;
        sprite.body.setVelocityY(0);
        sprite.y = targetY;
      }
      this._wasOnSlope = true;

    } else {
      // Fuera de rampa
      sprite_ref: {
        const sprite = this._player.sprite;
        sprite.body.allowGravity = true;

        if (this._wasOnSlope && !this._slopeJump) {
          // Salió de la rampa andando (no saltando) — suavizar transición
          sprite.body.setVelocityY(0);
        }
        // Solo cancelar slopeJump cuando toca suelo plano
        if (sprite.body.blocked.down) {
          this._slopeJump = false;
        }
        this._wasOnSlope = false;
      }
    }
    // ──────────────────────────────────────────────────────────────

    this._player.update(delta, this._fast, onSlope);
    this._player.applyGlucoseVFX(this._glucose.state, time);
    this._spawner.update(delta);

    // Rangazo — jingle si llevas 3s en rango perfecto
    AudioManager.tickRangazo(delta / 1000, this._glucose.state === 'rangazo');

    // Checkpoints por X
    if (this._cpData) {
      for (const cp of this._cpData) {
        if (!cp.done && this._player.x >= cp.x) {
          cp.done = true;
          const doneTex = this.textures.exists('cp_on') ? 'cp_on' : '_cp_done';
          if (doneTex === '_cp_done' && !this.textures.exists('_cp_done')) this._makeCpDoneTex();
          cp.sprite.setTexture(doneTex, 0);
          const { pts } = this._score.checkpoint(this._glucose.v);
          AudioManager.sfx('checkpoint');
          this._float(this._player.x, this._player.y - 60, `+${pts} pts`, '#FFC107');
        }
      }
    }

    if (this._player.x >= this._metaX) {
      if (!this._metaDone) {
        this._metaDone = true;
        const { pts } = this._score.checkpoint(this._glucose.v);
        AudioManager.sfx('checkpoint');
        this._float(this._player.x, this._player.y - 60, `+${pts} pts`, '#FFD700');
      }
      this._finish();
    }

    this._hud.refresh(this._glucose, this._glucagons, this._fastLeft, this._fast, onSlope, this._backpack, this._player.x, this._glucose.slowSecsLeft);
  }
}
