// ================================================================
//  Player.js — SugarGirl con spritesheet PNG generado por IA.
//  Spritesheet: 480x102px, 6 frames de 80x102px
//  Frames: 0-3 correr, 4 salto, 5 idle
// ================================================================
class Player {
  constructor(scene, x, y) {
    this._scene = scene;

    // Crear animaciones a partir del spritesheet
    if (!scene.textures.exists('sugargirl')) {
      // El spritesheet se carga en BootScene
    }

    // Crear frames manualmente desde el spritesheet
    if (!scene.anims.exists('run')) {
      scene.anims.create({
        key: 'run',
        frames: [
          { key: 'sugargirl', frame: 0 },
          { key: 'sugargirl', frame: 1 },
          { key: 'sugargirl', frame: 2 },
          { key: 'sugargirl', frame: 3 },
        ],
        frameRate: 10,
        repeat: -1,
      });
      scene.anims.create({
        key: 'jump',
        frames: [{ key: 'sugargirl', frame: 4 }],
        frameRate: 1,
        repeat: 0,
      });
    }

    this.sprite = scene.physics.add.sprite(x, y, 'sugargirl', 0);
    this.sprite.setDepth(10);
    this.sprite.body.setSize(36, 72);
    // Centrar el body en el sprite
    this.sprite.body.setOffset(22, 20);

    this._onGround = false;
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
