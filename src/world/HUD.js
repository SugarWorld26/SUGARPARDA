class HUD {
  constructor(scene, glucagons, fastLeft, backpack) {
    this._scene = scene;
    this._build(glucagons, fastLeft, backpack);
  }

  _build(glucagons, fastLeft, backpack) {
    const W = CONFIG.W, H = CONFIG.H;

    // Glucómetro PNG
    // Glucómetro PNG — centrado arriba
    const gmY = 95;  // borde inferior del glucómetro
    if (this._scene.textures.exists('glucometer')) {
      this._scene.add.image(W/2, gmY, 'glucometer')
        .setDisplaySize(280, 100).setScrollFactor(0).setDepth(90).setOrigin(0.5, 1);
    } else {
      const bg = this._scene.add.graphics().setScrollFactor(0).setDepth(90);
      bg.fillStyle(0x000000, 0.65).fillRoundedRect(W/2 - 130, 4, 260, 80, 8);
    }

    // Pantalla blanca del glucómetro
    this._scene.add.graphics().setScrollFactor(0).setDepth(91)
      .fillStyle(0xFFFFFF, 1).fillRoundedRect(W/2 - 105, gmY - 88, 160, 60, 6);

    // Número glucosa — en la pantalla del glucómetro
    this._valTxt = this._scene.add.text(W/2 - 22, gmY - 68, '100', {
      fontSize: '34px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#43A047', stroke: '#fff', strokeThickness: 1,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(92);

    this._scene.add.text(W/2 + 42, gmY - 60, 'mg/dL', {
      fontSize: '10px', fontFamily: 'monospace', fill: '#444',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(92);

    this._stateTxt = this._scene.add.text(W/2 - 22, gmY - 40, 'EN RANGO', {
      fontSize: '11px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#43A047',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(92);

    // Barra glucosa
    const bx = W/2 - 110, by = 98, bw = 220, bh = 6;
    const barBg = this._scene.add.graphics().setScrollFactor(0).setDepth(91);
    barBg.fillStyle(0x212121).fillRect(bx, by, bw, bh);
    const rLo  = bx + (CONFIG.RANGE_LO   / CONFIG.GLUCOSE_MAX) * bw;
    const rWi  = (CONFIG.RANGE_HI - CONFIG.RANGE_LO) / CONFIG.GLUCOSE_MAX * bw;
    const rzLo = bx + (CONFIG.RANGAZO_LO / CONFIG.GLUCOSE_MAX) * bw;
    const rzWi = (CONFIG.RANGAZO_HI - CONFIG.RANGAZO_LO) / CONFIG.GLUCOSE_MAX * bw;
    barBg.fillStyle(0x43A047, 0.25).fillRect(rLo,  by, rWi,  bh);
    barBg.fillStyle(0x1B5E20, 0.60).fillRect(rzLo, by, rzWi, bh);
    this._barFg = this._scene.add.graphics().setScrollFactor(0).setDepth(92);
    this._bx = bx; this._by = by; this._bw = bw; this._bh = bh;

    // Indicadores izquierda
    this._fastTxt = this._scene.add.text(8, 4, `⚡ x${fastLeft}`, {
      fontSize: '11px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#FF6F00', stroke: '#000', strokeThickness: 2,
    }).setScrollFactor(0).setDepth(92);

    this._glucTxt = this._scene.add.text(8, 20, `💉 x${glucagons}`, {
      fontSize: '11px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#4FC3F7', stroke: '#000', strokeThickness: 2,
    }).setScrollFactor(0).setDepth(92);

    this._backpackTxt = this._scene.add.text(8, 36, `🎒 x${backpack}`, {
      fontSize: '11px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#A5D6A7', stroke: '#000', strokeThickness: 2,
    }).setScrollFactor(0).setDepth(92);

    this._fastDosesTxt = this._scene.add.text(8, 52, `⚡ x${fastLeft}`, {
      fontSize: '11px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#FF6F00', stroke: '#000', strokeThickness: 2,
    }).setScrollFactor(0).setDepth(92);

    this._sprintTxt = this._scene.add.text(W - 8, 4, '', {
      fontSize: '11px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#FFC107', stroke: '#000', strokeThickness: 2,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(92);

    // Panel insulina activa — solo lenta
    this._scene.add.graphics().setScrollFactor(0).setDepth(89)
      .fillStyle(0x000000, 0.60).fillRoundedRect(W - 122, 58, 120, 26, 6);
    this._scene.add.text(W - 120, 60, 'INSULINA ACTIVA', {
      fontSize: '8px', fontFamily: 'monospace', fill: '#777',
    }).setScrollFactor(0).setDepth(90);
    this._insSlowTxt = this._scene.add.text(W - 120, 72, '💉 LENTA   0s', {
      fontSize: '10px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#555',
    }).setScrollFactor(0).setDepth(90);

    this._hyperOv = this._scene.add.graphics().setScrollFactor(0).setDepth(88);

    this._buildButtons(fastLeft, backpack);
  }

  buildMinimap(ground, levelLength) {
    const W  = CONFIG.W;
    const MY = 102;
    const MH = 14;
    const sc = W / levelLength;

    this._scene.add.graphics().setScrollFactor(0).setDepth(89)
      .fillStyle(0x000000, 0.55).fillRect(0, MY, W, MH);

    const gfx = this._scene.add.graphics().setScrollFactor(0).setDepth(90);

    // Suelo y cuestas
    ground.segments.forEach(seg => {
      const sx = Math.round(seg.x * sc);
      const sw = Math.max(1, Math.round(seg.w * sc));
      if (seg.slope) {
        gfx.fillStyle(0xCFD8DC, 1);
        const maxH = Math.round((seg.rise || 80) / 160 * (MH - 3));
        for (let px = 0; px < sw; px++) {
          const h = Math.max(1, Math.round((px / sw) * maxH) + 2);
          gfx.fillRect(sx + px, MY + MH - h - 1, 1, h);
        }
      } else {
        gfx.fillStyle(0x78909C, 1).fillRect(sx, MY + MH - 3, sw, 3);
      }
    });

    // Agujeros en rojo
    let prevEnd = 0;
    ground.segments.forEach(seg => {
      if (seg.x > prevEnd) {
        const hx = Math.round(prevEnd * sc);
        const hw = Math.max(2, Math.round((seg.x - prevEnd) * sc));
        gfx.fillStyle(0xB71C1C, 1).fillRect(hx, MY, hw, MH);
      }
      prevEnd = seg.x + seg.w;
    });

    // Meta
    gfx.fillStyle(0xFFD700, 1).fillRect(Math.round((levelLength - 160) * sc), MY, 3, MH);

    // Marcador jugador
    this._mmSc     = sc;
    this._mmY      = MY;
    this._mmH      = MH;
    this._mmMarker = this._scene.add.graphics().setScrollFactor(0).setDepth(91);
  }

  _buildButtons(fastLeft, backpack) {
    const W = CONFIG.W, H = CONFIG.H;
    const sc = this._scene;
    const SZ = 72;

    const makeImgBtn = (key, cx, cy, size, cbName) => {
      if (!sc.textures.exists(key)) return null;
      const img = sc.add.image(cx, cy, key).setDisplaySize(size, size)
        .setScrollFactor(0).setDepth(100).setInteractive();
      img.on('pointerdown', () => { img.setAlpha(0.7); if (this[cbName]) this[cbName](); });
      img.on('pointerup',   () => img.setAlpha(1));
      img.on('pointerout',  () => img.setAlpha(1));
      return img;
    };

    // Saltar — abajo izquierda
    this._jumpCb  = null;
    this._jumpBtn = makeImgBtn('btn_jump', 52, H - 52, SZ, '_jumpCb')
                 || this._makeBtn(52, H - 52, 38, 0x1565C0, 0x4FC3F7, '▲');
    if (!sc.textures.exists('btn_jump'))
      this._jumpBtn.on('pointerdown', () => { if (this._jumpCb) this._jumpCb(); });

    // Manzana — encima del salto
    this._appleCb  = null;
    this._appleBtn = makeImgBtn('btn_apple', 52, H - 134, SZ * 0.75, '_appleCb')
                  || this._makeBtn(52, H - 112, 24, 0x388E3C, 0xA5D6A7, '🍎');
    if (!sc.textures.exists('btn_apple'))
      this._appleBtn.on('pointerdown', () => { if (this._appleCb) this._appleCb(); });
    this._appleLbl = sc.add.text(52, H - 170, `x${backpack}`, {
      fontSize: '11px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#A5D6A7', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

    // Insulina lenta — abajo derecha
    this._slowCb  = null;
    this._slowBtn = makeImgBtn('btn_slow', W - 88, H - 52, SZ, '_slowCb')
                 || this._makeBtn(W - 96, H - 52, 38, 0x1B5E20, 0x43A047, '💉\nLENTA');
    if (!sc.textures.exists('btn_slow'))
      this._slowBtn.on('pointerdown', () => { if (this._slowCb) this._slowCb(); });

    // Insulina rápida — encima de lenta
    this._fastCb  = null;
    this._fastBtn = makeImgBtn('btn_fast', W - 88, H - 134, SZ * 0.75, '_fastCb')
                 || this._makeBtn(W - 40, H - 40, 26, 0xBF360C, 0xFF6F00, '⚡');
    if (!sc.textures.exists('btn_fast'))
      this._fastBtn.on('pointerdown', () => { if (this._fastCb) this._fastCb(); });
    this._fastLbl = sc.add.text(W - 88, H - 170, `x${fastLeft}`, {
      fontSize: '11px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#FFE0B2', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
  }

  _makeBtn(cx, cy, r, fill, stroke, label) {
    const g = this._scene.add.graphics().setScrollFactor(0).setDepth(100);
    const draw = (f, s) => {
      g.clear();
      g.fillStyle(f, 0.90).fillCircle(cx, cy, r);
      g.lineStyle(2, s, 0.8).strokeCircle(cx, cy, r);
    };
    draw(fill, stroke);
    g.setInteractive(new Phaser.Geom.Circle(cx, cy, r), Phaser.Geom.Circle.Contains);
    g.on('pointerover', () => draw(stroke, stroke));
    g.on('pointerout',  () => draw(fill, stroke));
    g.on('pointerup',   () => draw(fill, stroke));

    this._scene.add.text(cx, cy, label, {
      fontSize: `${Math.round(r * 0.5)}px`,
      fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#fff', align: 'center',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

    return g;
  }

  onJump(cb)        { this._jumpCb  = cb; }
  onSlowInsulin(cb) { this._slowCb  = cb; }
  onFastInsulin(cb) { this._fastCb  = cb; }
  onEatApple(cb)    { this._appleCb = cb; }

  refresh(glucose, glucagons, fastLeft, fast, slope = false, backpack = 0, playerX = 0, slowSecs = 0) {
    const v   = Math.round(glucose.v);
    const col = glucose.color;

    this._valTxt.setText(String(v)).setStyle({ fill: col });
    this._stateTxt.setText(glucose.label).setStyle({ fill: col });

    this._barFg.clear();
    this._barFg.fillStyle(Phaser.Display.Color.HexStringToColor(col).color, 1);
    const pct = Math.max(0, Math.min(1, v / CONFIG.GLUCOSE_MAX));
    this._barFg.fillRect(this._bx, this._by, this._bw * pct, this._bh);

    this._fastTxt.setText(`⚡ x${fastLeft}`);
    this._glucTxt.setText(`💉 x${glucagons}`);
    this._backpackTxt.setText(`🎒 x${backpack}`);
    this._appleLbl.setText(`x${backpack}`);
    this._fastLbl.setText(`x${fastLeft}`);
    this._sprintTxt.setText(slope ? '⛰ CUESTA' : fast ? '🏃 SPRINT!' : '');

    // Panel insulina activa
    this._insSlowTxt.setText('💉 LENTA   ' + slowSecs + 's')
      .setStyle({ fill: slowSecs > 0 ? '#43A047' : '#555' });
    if (this._fastDosesTxt) this._fastDosesTxt.setText('⚡ x' + fastLeft)
      .setStyle({ fill: fastLeft > 0 ? '#FF6F00' : '#555' });

    this._hyperOv.clear();
    if (glucose.isHyper) {
      const a = 0.06 + 0.04 * Math.sin(Date.now() / 200);
      this._hyperOv.fillStyle(0xFF0000, a).fillRect(0, 0, CONFIG.W, CONFIG.H);
    }

    // Marcador minimapa
    if (this._mmMarker) {
      const mx = Math.round(playerX * this._mmSc);
      this._mmMarker.clear();
      this._mmMarker.fillStyle(0xFFFFFF, 1)
        .fillTriangle(mx, this._mmY + 2, mx - 3, this._mmY + this._mmH - 2, mx + 3, this._mmY + this._mmH - 2);
    }
  }
}
