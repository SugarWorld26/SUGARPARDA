class Ground {
  constructor(scene, lvl) {
    this._scene   = scene;
    this._lvl     = lvl;
    this.segments = [];
    this._body    = null;
    this._build();
  }

  _build() {
    const lvl = this._lvl;
    const L   = lvl.length;
    const GY  = CONFIG.GROUND_Y;
    const GH  = CONFIG.GROUND_H;

    this.segments = [];
    let x = 0;
    this.segments.push({ x: 0, w: 700 });
    x = 700;
    while (x < L - 600) {
      const sw = Phaser.Math.Between(350, 850);
      const w  = Math.min(sw, L - 600 - x);
      if (w > 50) this.segments.push({ x, w });
      x += w;
      if (x < L - 600 && Math.random() < lvl.holePct)
        x += Phaser.Math.Between(130, 210);
    }
    if (x < L) this.segments.push({ x, w: L - x });

    const gfx = this._scene.add.graphics().setDepth(1);
    this.segments.forEach(seg => {
      gfx.fillStyle(lvl.groundColor, 1).fillRect(seg.x, GY, seg.w, GH);
      gfx.fillStyle(lvl.groundEdge,  1).fillRect(seg.x, GY, seg.w, 8);
      gfx.fillStyle(0x000000, 0.06);
      for (let dx = seg.x + 20; dx < seg.x + seg.w - 20; dx += 48)
        gfx.fillRect(dx, GY + 12, 16, 3);
    });

    this._body = this._scene.physics.add.image(L / 2, GY + GH / 2, '__DEFAULT');
    this._body.setVisible(false);
    this._body.setImmovable(true);
    this._body.body.allowGravity = false;
    this._body.body.setSize(L, GH);
    this._body.refreshBody();
  }

  isSolidAt(x) {
    return this.segments.some(s => x >= s.x && x < s.x + s.w);
  }

  addCollider(sprite) {
    this._scene.physics.add.collider(sprite, this._body);
  }

  get groundY() { return CONFIG.GROUND_Y; }
}
