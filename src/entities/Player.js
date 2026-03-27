class Player {
  constructor(scene, x, y) {
    this._scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'sugargirl', 0);
    this.sprite.setDepth(10);
    // Sprite: 80x104px. Body cubre el personaje de offsetY hacia abajo.
    // offsetY=8 => body top en pixel 8 del sprite
    // bodyH=90  => body bottom en pixel 98 del sprite
    // sprite.y (centro) = GROUND_Y - (90/2 + 8 - 104/2) = GROUND_Y - 1
    // => startY en Game.js = GROUND_Y - 1
    this.sprite.body.setSize(40, 90);
    this.sprite.body.setOffset(20, 8);

    this.isSlowed  = false;
    this._slowTimer= 0;
  }

  addToGround(ground) {
    ground.addCollider(this.sprite);
  }

  jump(glucose, onSlope = false) {
    if (!this.sprite.body.blocked.down && !onSlope) return false;
    this.sprite.body.allowGravity = true;
    this.sprite.body.setVelocityY(CONFIG.JUMP_VY);
    glucose.onJump();
    return true;
  }

  applySlow() {
    this.isSlowed   = true;
    this._slowTimer = CONFIG.CUPCAKE_SLOW_MS;
  }

  update(delta, fast) {
    const spd = this.isSlowed ? CONFIG.SPD_SLOW
              : fast          ? CONFIG.SPD_FAST
              : CONFIG.SPD_NORMAL;
    this.sprite.body.setVelocityX(spd);

    if (this.isSlowed) {
      this._slowTimer -= delta;
      if (this._slowTimer <= 0) this.isSlowed = false;
    }

    const onGround = this.sprite.body.blocked.down;
    if (onGround) {
      if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim?.key !== 'run') {
        this.sprite.play('run');
      }
    } else {
      if (this.sprite.anims.currentAnim?.key !== 'jump') {
        this.sprite.play('jump');
      }
    }
  }

  applyGlucoseVFX(state, time) {
    switch (state) {
      case 'rangazo':
        this.sprite.setTint(0xFFD700);
        this.sprite.setAngle(0);
        break;
      case 'low':
      case 'hypo':
        this.sprite.setTint(0xBBDEFB);
        this.sprite.setAngle(Math.sin(time / 80) * 5);
        break;
      default:
        this.sprite.clearTint();
        this.sprite.setAngle(0);
    }
  }

  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
}
