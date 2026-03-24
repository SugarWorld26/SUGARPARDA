class HUD {
  constructor(scene, glucagons, fastLeft, backpack) {
    this._scene = scene;
    this._build(glucagons, fastLeft, backpack);
  }

  _build(glucagons, fastLeft, backpack) {
    const W = CONFIG.W, H = CONFIG.H;

    const bg = this._scene.add.graphics().setScrollFactor(0).setDepth(90);
    bg.fillStyle(0x000000, 0.65).fillRoundedRect(W/2 - 130, 2, 260, 54, 8);

    this._valTxt = this._scene.add.text(W/2, 18, '100', {
      fontSize: '28px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#43A047', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(92);

    this._scene.add.text(W/2 + 52, 22, 'mg/dL', {
      fontSize: '10px', fontFamily: 'monospace', fill: '#666',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(92);

    this._stateTxt = this._scene.add.text(W/2, 40, 'EN RANGO', {
      fontSize: '11px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#43A047',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(92);

    const bx = W/2 - 110, by = 48, bw = 220, bh = 5;
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

    this._sprintTxt = this._scene.add.text(W - 8, 4, '', {
      fontSize: '11px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#FFC107', stroke: '#000', strokeThickness: 2,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(92);

    this._hyperOv = this._scene.add.graphics().setScrollFactor(0).setDepth(88);

    this._buildButtons(fastLeft, backpack);
  }

  _buildButtons(fastLeft, backpack) {
    const W = CONFIG.W, H = CONFIG.H;

    this._jumpBtn = this._makeBtn(52, H - 52, 38, 0x1565C0, 0x4FC3F7, '▲');
    this._jumpCb  = null;
    this._jumpBtn.on('pointerdown', () => { if (this._jumpCb) this._jumpCb(); });

    this._appleBtn = this._makeBtn(52, H - 112, 24, 0x388E3C, 0xA5D6A7, '🍎');
    this._appleLbl = this._scene.add.text(52, H - 136, `x${backpack}`, {
      fontSize: '9px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#A5D6A7',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    this._appleCb  = null;
    this._appleBtn.on('pointerdown', () => { if (this._appleCb) this._appleCb(); });

    this._slowBtn = this._makeBtn(W - 96, H - 52, 38, 0x1B5E20, 0x43A047, '💉\nLENTA');
    this._slowCb  = null;
    this._slowBtn.on('pointerdown', () => { if (this._slowCb) this._slowCb(); });

    this._fastBtn = this._makeBtn(W - 40, H - 40, 26, 0xBF360C, 0xFF6F00, '⚡');
    this._fastLbl = this._scene.add.text(W - 40, H - 21, `x${fastLeft}`, {
      fontSize: '9px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#FFE0B2',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    this._fastCb  = null;
    this._fastBtn.on('pointerdown', () => { if (this._fastCb) this._fastCb(); });
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

  // Llámalo una vez después de crear el HUD para dibujar el minimapa estático
  buildMinimap(ground, levelLength) {
    const W  = CONFIG.W;
    const MY = 58;   // justo bajo el glucómetro
    const MH = 16;
    const sc = W / levelLength;

    // Fondo
    this._scene.add.graphics().setScrollFactor(0).setDepth(93)
      .fillStyle(0x000000, 0.55).fillRect(0, MY, W, MH);

    // Orografía estática
    const gfx = this._scene.add.graphics().setScrollFactor(0).setDepth(94);

    ground.segments.forEach(seg => {
      const sx = Math.round(seg.x * sc);
      const sw = Math.max(1, Math.round(seg.w * sc));
      if (seg.slope) {
        // cuesta — triángulo ascendente
        const maxH = Math.round((seg.rise || 80) / 160 * (MH - 3));
        gfx.fillStyle(0xB0BEC5, 1);
        for (let px = 0; px < sw; px++) {
          const h = Math.max(1, Math.round((px / sw) * maxH) + 2);
          gfx.fillRect(sx + px, MY + MH - h - 1, 1, h);
        }
      } else {
        gfx.fillStyle(0x78909C, 1).fillRect(sx, MY + MH - 3, sw, 3);
      }
    });

    // Agujeros en rojo
    gfx.fillStyle(0xB71C1C, 0.8);
    let prevEnd = 0;
    ground.segments.forEach(seg => {
      if (seg.x > prevEnd) {
        const hx = Math.round(prevEnd * sc);
        const hw = Math.max(1, Math.round((seg.x - prevEnd) * sc));
        gfx.fillRect(hx, MY, hw, MH);
      }
      prevEnd = seg.x + seg.w;
    });

    // Meta en dorado
    gfx.fillStyle(0xFFD700, 1).fillRect(Math.round((levelLength - 160) * sc), MY, 2, MH);

    // Marcador jugador (triángulo blanco, se actualiza en refresh)
    this._mmScale  = sc;
    this._mmY      = MY;
    this._mmH      = MH;
    this._mmMarker = this._scene.add.graphics().setScrollFactor(0).setDepth(95);
  }

  refresh(glucose, glucagons, fastLeft, fast, slope = false, backpack = 0, playerX = 0) {
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

    this._hyperOv.clear();
    if (glucose.isHyper) {
      const a = 0.06 + 0.04 * Math.sin(Date.now() / 200);
      this._hyperOv.fillStyle(0xFF0000, a).fillRect(0, 0, CONFIG.W, CONFIG.H);
    }

    // Actualizar marcador de posición en el minimapa
    if (this._mmMarker) {
      const mx = Math.round(playerX * this._mmScale);
      this._mmMarker.clear();
      this._mmMarker.fillStyle(0xFFFFFF, 1)
        .fillTriangle(mx, this._mmY + 2, mx - 3, this._mmY + 9, mx + 3, this._mmY + 9);
    }
  }
}
