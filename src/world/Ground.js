// ================================================================
//  Ground.js — Suelo del nivel con agujeros.
//  Usa physics.add.image (no staticGroup) por ser más fiable.
// ================================================================
class Ground {
  constructor(scene, lvl) {
    this._scene    = scene;
    this._lvl      = lvl;
    this.segments  = [];  // [{x, w}]
    this.bodies    = [];  // Phaser bodies

    this._build();
  }

  _build() {
    const scene  = this._scene;
    const lvl    = this._lvl;
    const L      = lvl.length;
    const GY     = CONFIG.GROUND_Y;
    const GH     = CONFIG.GROUND_H;
    const MIN_W  = 350;  // mínimo segmento sólido
    const MAX_W  = 900;  // máximo segmento sólido
    const MIN_HOLE = 130;
    const MAX_HOLE = 220;

    // ── Generar segmentos ──
    this.segments = [];
    let x = 0;

    // Inicio siempre sólido y largo (el jugador empieza aquí)
    this.segments.push({ x: 0, w: 650 });
    x = 650;

    while (x < L - 500) {
      const sw = Phaser.Math.Between(MIN_W, MAX_W);
      const w  = Math.min(sw, L - 500 - x);
      this.segments.push({ x, w });
      x += w;
      if (x < L - 500 && Math.random() < lvl.holePct) {
        x += Phaser.Math.Between(MIN_HOLE, MAX_HOLE);
      }
    }

    // Final siempre sólido
    if (x < L) this.segments.push({ x, w: L - x });

    // ── Visual del suelo ──
    const gfx = scene.add.graphics().setDepth(1);

    this.segments.forEach(seg => {
      // Bloque principal
      gfx.fillStyle(lvl.groundColor, 1)
         .fillRect(seg.x, GY, seg.w, GH);
      // Borde superior (más claro)
      gfx.fillStyle(lvl.groundEdge, 1)
         .fillRect(seg.x, GY, seg.w, 8);
      // Detalle pixel
      gfx.fillStyle(0x000000, 0.06);
      for (let dx = seg.x + 20; dx < seg.x + seg.w - 20; dx += 48) {
        gfx.fillRect(dx, GY + 12, 16, 3);
      }
    });

    // ── Cuerpos físicos — UNO por segmento ──
    this.segments.forEach(seg => {
      const body = scene.physics.add.image(
        seg.x + seg.w / 2,
        GY + GH / 2,
        '__DEFAULT'
      );
      body.setVisible(false);
      body.setImmovable(true);
      body.body.allowGravity = false;
      body.body.setSize(seg.w, GH);
      body.refreshBody();
      this.bodies.push(body);
    });
  }

  // ¿Hay suelo sólido en la coordenada X?
  isSolidAt(x) {
    return this.segments.some(s => x >= s.x && x < s.x + s.w);
  }

  // Añadir colisión entre un sprite y el suelo
  addCollider(sprite) {
    this.bodies.forEach(b =>
      this._scene.physics.add.collider(sprite, b)
    );
  }

  // Añadir overlap entre un sprite y el suelo (para detectar caída)
  get groundY() { return CONFIG.GROUND_Y; }
}
