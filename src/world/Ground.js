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
    const RISE  = lvl.slopeRise || 80;
    const STEP  = 24;

    this.segments = [];
    let x = 0;

    this.segments.push({ x: 0, w: 700, slope: false, rise: 0 });
    x = 700;

    while (x < L - 600) {
      const sw = Phaser.Math.Between(400, 900);
      const w  = Math.min(sw, L - 600 - x);
      if (w > 50) {
        const isSlope = RISE > 0 && w > 300 && Math.random() < (lvl.slopePct || 0);
        this.segments.push({ x, w, slope: isSlope, rise: RISE });
        if (isSlope) this.slopes.push({ x, w });
      }
      x += w;
      if (x < L - 600 && Math.random() < lvl.holePct)
        x += Phaser.Math.Between(130, 210);
    }

    if (x < L) this.segments.push({ x, w: L - x, slope: false, rise: 0 });

    const gfx = scene.add.graphics().setDepth(1);

    this.segments.forEach(seg => {
      if (seg.slope) {
        const steps = Math.ceil(seg.w / STEP);

        for (let i = 0; i < steps; i++) {
          const sx = seg.x + i * STEP;
          const sw = Math.min(STEP, seg.x + seg.w - sx);
          const dy = Math.round((i / steps) * seg.rise);

          gfx.fillStyle(lvl.groundColor, 1)
             .fillRect(sx, GY - dy, sw + 1, GH + dy);
          gfx.fillStyle(lvl.groundEdge, 1)
             .fillRect(sx, GY - dy, sw + 1, 8);

          const body = scene.add.rectangle(sx, GY - dy, sw + 1, GH, 0x000000, 0);
          body.setOrigin(0, 0);
          scene.physics.add.existing(body, true);
          body.body.allowGravity = false;
          this._bodies.push(body);
        }

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

  getSurfaceY(x) {
    const GY   = CONFIG.GROUND_Y;
    const STEP = 24;
    for (const seg of this.segments) {
      if (x >= seg.x && x < seg.x + seg.w) {
        if (!seg.slope) return GY;
        const steps = Math.ceil(seg.w / STEP);
        const i     = Math.floor((x - seg.x) / STEP);
        const dy    = Math.round((i / steps) * seg.rise);
        return GY - dy;
      }
    }
    return GY;
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
