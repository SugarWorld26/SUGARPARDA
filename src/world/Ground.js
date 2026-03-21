class Ground {
  constructor(scene, lvl) {
    this._scene   = scene;
    this._lvl     = lvl;
    this.segments = [];
    this.slopes   = [];
    this._bodies  = [];
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
      const sw = Phaser.Math.Between(400, 900);
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

    const gfx  = scene.add.graphics().setDepth(1);
    const RISE = 80;
    const STEP = 24;

    this.segments.forEach(seg => {
      if (seg.slope) {
        const steps = Math.ceil(seg.w / STEP);

        for (let i = 0; i < steps; i++) {
          const sx = seg.x + i * STEP;
          const sw = Math.min(STEP, seg.x + seg.w - sx);
          const dy = Math.round((i / steps) * RISE);

          gfx.fillStyle(lvl.groundColor, 1)
             .fillRect(sx, GY - dy, sw + 1, GH + dy);
          gfx.fillStyle(lvl.groundEdge, 1)
             .fillRect(sx, GY - dy, sw + 1, 8);

          const body = scene.physics.add.image(
            sx + sw / 2,
            (GY - dy) + GH / 2,
            '__DEFAULT'
          );
          body.setVisible(false);
          body.setImmovable(true);
          body.body.allowGravity = false;
          body.body.setSize(sw + 1, GH);
          body.refreshBody();
          this._bodies.push(body);
        }

        gfx.fillStyle(0xFFFFFF, 0.15);
        gfx.fillTriangle(
          seg.x + 30,         GY - 30,
          seg.x + seg.w - 30, GY - RISE - 30,
          seg.x + seg.w - 30, GY - 30
        );

      } else {
        gfx.fillStyle(lvl.groundColor, 1).fillRect(seg.x, GY, seg.w, GH);
        gfx.fillStyle(lvl.groundEdge,  1).fillRect(seg.x, GY, seg.w, 8);
        gfx.fillStyle(0x000000, 0.06);
        for (let dx = seg.x + 20; dx < seg.x + seg.w - 20; dx += 48)
          gfx.fillRect(dx, GY + 12, 16, 3);

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
        this._bodies.push(body);
      }
    });
  }

  isSolidAt(x) {
    return this.segments.some(s => x >= s.x && x < s.x + s.w);
  }

  isSlopeAt(x) {
    return this.slopes.some(s => x >= s.x && x < s.x + s.w);
  }

  addCollider(sprite) {
    this._bodies.forEach(b =>
      this._scene.physics.add.collider(sprite, b)
    );
  }

  get groundY() { return CONFIG.GROUND_Y; }
}
