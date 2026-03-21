// ================================================================
//  Ground.js — Suelo con agujeros y cuestas.
//  - Un único cuerpo físico continuo (evita rebotes entre tiles)
//  - Cuestas son visuales + zonas que aumentan caída de glucosa
//  - isSlopeAt(x) devuelve true si el jugador está en cuesta
// ================================================================
class Ground {
  constructor(scene, lvl) {
    this._scene   = scene;
    this._lvl     = lvl;
    this.segments = [];
    this.slopes   = [];
    this._body    = null;
    this._build();
  }

  _build() {
    const scene = this._scene;
    const lvl   = this._lvl;
    const L     = lvl.length;
    const GY    = CONFIG.GROUND_Y;
    const GH    = CONFIG.GROUND_H;

    this.segments = [];
    let x = 0;

    this.segments.push({ x: 0, w: 700, slope: false });
    x = 700;

    while (x < L - 600) {
      const sw = Phaser.Math.Between(350, 850);
      const w  = Math.min(sw, L - 600 - x);
      if (w > 50) {
        const isSlope = w > 300 && Math.random() < (lvl.slopePct || 0.3);
        this.segments.push({ x, w, slope: isSlope });
        if (isSlope) this.slopes.push({ x, w });
      }
      x += w;
      if (x < L - 600 && Math.random() < lvl.holePct)
        x += Phaser.Math.Between(130, 210);
    }

    if (x < L) this.segments.push({ x, w: L - x, slope: false });

    const gfx = scene.add.graphics().setDepth(1);

    this.segments.forEach(seg => {
      if (seg.slope) {
        const steps = Math.floor(seg.w / 40);
        const rise  = 28;
        for (let i = 0; i < steps; i++) {
          const sx  = seg.x + i * (seg.w / steps);
          const sw2 = seg.w / steps + 1;
          const dy  = Math.round((i / steps) * rise);
          gfx.fillStyle(lvl.groundColor, 1).fillRect(sx, GY - dy, sw2, GH + dy);
          gfx.fillStyle(lvl.groundEdge,  1).fillRect(sx, GY - dy, sw2, 8);
        }
        gfx.fillStyle(0xFFFFFF, 0.18);
        gfx.fillTriangle(
          seg.x + 20,         GY - 20,
          seg.x + seg.w - 20, GY - rise - 20,
          seg.x + seg.w - 20, GY - 20
        );
      } else {
        gfx.fillStyle(lvl.groundColor, 1).fillRect(seg.x, GY, seg.w, GH);
        gfx.fillStyle(lvl.groundEdge,  1).fillRect(seg.x, GY, seg.w, 8);
        gfx.fillStyle(0x000000, 0.06);
        for (let dx = seg.x + 20; dx < seg.x + seg.w - 20; dx += 48)
          gfx.fillRect(dx, GY + 12, 16, 3);
      }
    });

    this._body = scene.physics.add.image(L / 2, GY + GH / 2, '__DEFAULT');
    this._body.setVisible(false);
    this._body.setImmovable(true);
    this._body.body.allowGravity = false;
    this._body.body.setSize(L, GH);
    this._body.refreshBody();
  }

  isSolidAt(x) {
    return this.segments.some(s => x >= s.x && x < s.x + s.w);
  }

  isSlopeAt(x) {
    return this.slopes.some(s => x >= s.x && x < s.x + s.w);
  }

  addCollider(sprite) {
    this._scene.physics.add.collider(sprite, this._body);
  }

  get groundY() { return CONFIG.GROUND_Y; }
}
