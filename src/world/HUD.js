// ================================================================
//  HUD.js — Glucómetro + botones de control.
//  Todo en coordenadas fijas 800×450.
// ================================================================
class HUD {
  constructor(scene, glucagons, fastLeft) {
    this._scene = scene;
    this._build(glucagons, fastLeft);
  }

  _build(glucagons, fastLeft) {
    const W = CONFIG.W, H = CONFIG.H;
    const S = scene => scene; // alias

    // ── Fondo HUD ──
    const bg = this._scene.add.graphics().setScrollFactor(0).setDepth(90);
    bg.fillStyle(0x000000, 0.65).fillRoundedRect(W/2 - 130, 2, 260, 54, 8);

    // ── Número glucosa ──
    this._valTxt = this._scene.add.text(W/2, 18, '100', {
      fontSize: '28px',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      fill: '#43A047',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(92);

    // Unidad
    this._scene.add.text(W/2 + 52, 22, 'mg/dL', {
      fontSize: '10px', fontFamily: 'monospace', fill: '#666',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(92);

    // ── Estado ──
    this._stateTxt = this._scene.add.text(W/2, 40, 'EN RANGO', {
      fontSize: '11px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#43A047',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(92);

    // ── Barra de glucosa ──
    const bx = W/2 - 110, by = 48, bw = 220, bh = 5;
    const barBg = this._scene.add.graphics().setScrollFactor(0).setDepth(91);
    barBg.fillStyle(0x212121).fillRect(bx, by, bw, bh);
    // Zona en rango
    const rLo = bx + (CONFIG.RANGE_LO / CONFIG.GLUCOSE_MAX) * bw;
    const rWi  = (CONFIG.RANGE_HI - CONFIG.RANGE_LO) / CONFIG.GLUCOSE_MAX * bw;
    barBg.fillStyle(0x43A047, 0.25).fillRect(rLo, by, rWi, bh);
    // Zona RANGAZO
    const rzLo = bx + (CONFIG.RANGAZO_LO / CONFIG.GLUCOSE_MAX) * bw;
    const rzWi  = (CONFIG.RANGAZO_HI - CONFIG.RANGAZO_LO) / CONFIG.GLUCOSE_MAX * bw;
    barBg.fillStyle(0x1B5E20, 0.6).fillRect(rzLo, by, rzWi, bh);

    this._barFg = this._scene.add.graphics().setScrollFactor(0).setDepth(92);
    this._bx = bx; this._by = by; this._bw = bw; this._bh = bh;

    // ── Indicadores izquierda ──
    this._fastTxt = this._scene.add.text(8, 4, `⚡ x${fastLeft}`, {
      fontSize: '11px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#FF6F00', stroke: '#000', strokeThickness: 2,
    }).setScrollFactor(0).setDepth(92);

    this._glucTxt = this._scene.add.text(8, 20, `💉 x${glucagons}`, {
      fontSize: '11px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#4FC3F7', stroke: '#000', strokeThickness: 2,
    }).setScrollFactor(0).setDepth(92);

    this._sprintTxt = this._scene.add.text(W - 8, 4, '', {
      fontSize: '11px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#FFC107', stroke: '#000', strokeThickness: 2,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(92);

    // ── Overlay hiper (se actualiza en refresh) ──
    this._hyperOv = this._scene.add.graphics().setScrollFactor(0).setDepth(88);

    // ── Botones ──
    this._buildButtons();
  }

  _buildButtons() {
    const W = CONFIG.W, H = CONFIG.H;

    // ▲ SALTAR — izquierda
    this._jumpBtn = this._makeBtn(52, H - 52, 38, 0x1565C0, 0x4FC3F7, '▲');
    this._jumpCb  = null;
    this._jumpBtn.on('pointerdown', () => { if (this._jumpCb) this._jumpCb(); });

    // 💉 INSULINA LENTA — derecha grande
    this._slowBtn = this._makeBtn(W - 96, H - 52, 38, 0x1B5E20, 0x43A047, '💉\nLENTA');
    this._slowCb  = null;
    this._slowBtn.on('pointerdown', () => { if (this._slowCb) this._slowCb(); });

    // ⚡ INSULINA RÁPIDA — derecha pequeña
    this._fastBtn  = this._makeBtn(W - 40, H - 40, 26, 0xBF360C, 0xFF6F00, '⚡');
    this._fastLbl  = this._scene.add.text(W - 40, H - 21, `x${CONFIG.INS_FAST_MAX}`, {
      fontSize: '9px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#FFE0B2',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    this._fastCb   = null;
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
    g.on('pointerover',  () => draw(stroke, stroke));
    g.on('pointerout',   () => draw(fill, stroke));
    g.on('pointerup',    () => draw(fill, stroke));

    this._scene.add.text(cx, cy, label, {
      fontSize: `${Math.round(r * 0.5)}px`,
      fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#fff', align: 'center',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

    return g;
  }

  // ── Registrar callbacks ──────────────────────────────────────
  onJump(cb)      { this._jumpCb = cb; }
  onSlowInsulin(cb){ this._slowCb = cb; }
  onFastInsulin(cb){ this._fastCb = cb; }

  // ── Actualizar cada frame ────────────────────────────────────
  refresh(glucose, glucagons, fastLeft, fast) {
    const v   = Math.round(glucose.v);
    const col = glucose.color;

    // Número y estado
    this._valTxt.setText(String(v)).setStyle({ fill: col });
    this._stateTxt.setText(glucose.label).setStyle({ fill: col });

    // Barra
    this._barFg.clear();
    this._barFg.fillStyle(
      Phaser.Display.Color.HexStringToColor(col).color, 1
    );
    const pct = Math.max(0, Math.min(1, v / CONFIG.GLUCOSE_MAX));
    this._barFg.fillRect(this._bx, this._by, this._bw * pct, this._bh);

    // Contadores
    this._fastTxt.setText(`⚡ x${fastLeft}`);
    this._glucTxt.setText(`💉 x${glucagons}`);
    this._sprintTxt.setText(fast ? '🏃 SPRINT!' : '');
    this._fastLbl.setText(`x${fastLeft}`);

    // Overlay hiper
    this._hyperOv.clear();
    if (glucose.isHyper) {
      const a = 0.06 + 0.04 * Math.sin(Date.now() / 200);
      this._hyperOv.fillStyle(0xFF0000, a)
        .fillRect(0, 0, CONFIG.W, CONFIG.H);
    }
  }
}
