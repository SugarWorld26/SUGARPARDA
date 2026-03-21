// ================================================================
//  Player.js — La jugadora.
//  Gráficos en _buildGraphics(). Fácil de sustituir por sprites.
// ================================================================
class Player {
  constructor(scene, x, y) {
    this._scene = scene;
    this._buildGraphics();

    // Sprite físico
    this.sprite = scene.physics.add.sprite(x, y, '_player_tex');
    this.sprite.setDepth(10);
    this.sprite.body.setSize(28, 46);

    // Estado
    this._frame    = 0;
    this._tick     = 0;
    this._inAir    = false;
    this.isSlowed  = false;
    this._slowTimer= 0;
  }

  // ── Gráficos placeholder ────────────────────────────────────
  // TODO: sustituir por spritesheet real cuando haya arte
  _buildGraphics() {
    const scene = this._scene;
    if (scene.textures.exists('_player_tex')) return;

    const g = scene.make.graphics({ add: false });
    const S = 3; // px per logical pixel

    // Dibujamos 5 frames: 4 correr + 1 salto
    // Cada frame: 10 × 16 píxeles lógicos → 30 × 48 canvas px
    const FW = 10, FH = 16;

    const col = {
      hair:  0xFFD54F,
      skin:  0xFFCC80,
      cheek: 0xFFAB91,
      eye:   0x37474F,
      mouth: 0xE91E63,
      shirt: 0x2E7D32,
      logo:  0x66BB6A,
      pants: 0x1565C0,
      shoe:  0xE53935,
    };

    const dot = (c, pts, ox = 0, oy = 0) => {
      g.fillStyle(c, 1);
      pts.forEach(([x, y]) => g.fillRect(ox + x*S, oy + y*S, S, S));
    };

    // Generamos los 5 frames
    for (let f = 0; f < 5; f++) {
      const ox = f * FW * S;

      // Pelo
      dot(col.hair,  [[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[1,1],[8,1],[1,2],[8,2]], ox);
      // Cara
      dot(col.skin,  [[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[3,3],[4,3],[5,3],[6,3],[4,4],[5,4]], ox);
      // Ojos
      dot(col.eye,   [[3,2],[5,2]], ox);
      // Mejillas
      dot(col.cheek, [[2,3],[6,3]], ox);
      // Boca
      dot(col.mouth, [[4,4],[5,4]], ox);
      // Cuello
      dot(col.skin,  [[4,5],[5,5]], ox);
      // Cuerpo
      dot(col.shirt, [[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[2,7],[7,7],[2,8],[3,8],[4,8],[5,8],[6,8],[7,8]], ox);
      dot(col.logo,  [[3,7],[4,7],[5,7],[6,7]], ox);
      // Brazos (con leve animación)
      const armOff = [0, 1, 0, -1][f % 4];
      dot(col.skin,  [[1, 6 + (armOff > 0 ? armOff : 0)], [1, 7 + (armOff > 0 ? armOff : 0)],
                       [8, 6 + (armOff < 0 ? -armOff : 0)], [8, 7 + (armOff < 0 ? -armOff : 0)]], ox);
      // Pantalón
      dot(col.pants, [[2,9],[3,9],[4,9],[5,9],[6,9],[7,9],[2,10],[3,10],[4,10],[5,10],[6,10],[7,10]], ox);

      if (f < 4) {
        // Frames de correr — piernas alternas
        const p = [
          [[2,11],[3,11],[2,12],[3,12]], // frame 0 — pierna izq adelante
          [[3,11],[4,11],[3,12],[4,12]], // frame 1
          [[5,11],[6,11],[5,12],[6,12]], // frame 2 — pierna der adelante
          [[4,11],[5,11],[4,12],[5,12]], // frame 3
        ][f];
        dot(col.pants, p, ox);
        // Pierna opuesta
        const p2 = [
          [[5,11],[6,11],[5,12],[6,12]],
          [[5,11],[6,11],[5,12],[6,12]],
          [[2,11],[3,11],[2,12],[3,12]],
          [[3,11],[4,11],[3,12],[4,12]],
        ][f];
        dot(col.pants, p2, ox);
        // Zapatos
        dot(col.shoe, [[1,13],[2,13],[3,13],[4,13],[5,13],[6,13],[7,13],[8,13]], ox);
      } else {
        // Frame salto — piernas juntas y levantadas
        dot(col.pants, [[3,11],[4,11],[5,11],[6,11],[3,12],[4,12],[5,12],[6,12]], ox);
        dot(col.shoe,  [[2,12],[3,12],[4,12],[5,12],[5,12],[6,12],[7,12]], ox);
      }
    }

    g.generateTexture('_player_tex', FW * S * 5, FH * S);
    g.destroy();

    this._FW = FW * S;
    this._FH = FH * S;
  }

  // ── Colisión con el suelo ───────────────────────────────────
  addToGround(ground) {
    ground.addCollider(this.sprite);
  }

  // ── Saltar ──────────────────────────────────────────────────
  jump(glucose) {
    if (!this.sprite.body.blocked.down) return false;
    this.sprite.body.setVelocityY(CONFIG.JUMP_VY);
    glucose.onJump();
    return true;
  }

  // ── Efecto de ralentización (cupcake) ───────────────────────
  applySlow() {
    this.isSlowed  = true;
    this._slowTimer = CONFIG.CUPCAKE_SLOW_MS;
  }

  // ── Update por frame ────────────────────────────────────────
  update(delta, fast) {
    // Velocidad horizontal
    const spd = this.isSlowed ? CONFIG.SPD_SLOW
              : fast          ? CONFIG.SPD_FAST
              : CONFIG.SPD_NORMAL;
    this.sprite.body.setVelocityX(spd);

    // Timer de ralentización
    if (this.isSlowed) {
      this._slowTimer -= delta;
      if (this._slowTimer <= 0) this.isSlowed = false;
    }

    // Detectar si está en el aire
    const onGround = this.sprite.body.blocked.down;
    this._inAir = !onGround;

    // Animación de frames
    this._tick += delta;
    if (onGround) {
      const spd_anim = fast ? 65 : 105;
      if (this._tick >= spd_anim) {
        this._tick  = 0;
        this._frame = (this._frame + 1) % 4;
      }
    } else {
      this._frame = 4; // frame salto
      this._tick  = 0;
    }

    // Aplicar crop para seleccionar frame
    // La textura tiene 5 frames juntos horizontalmente
    const fw = this._FW || 30;
    const fh = this._FH || 48;
    this.sprite.setCrop(this._frame * fw, 0, fw, fh);
  }

  // ── VFX según estado de glucosa ─────────────────────────────
  applyGlucoseVFX(glucoseState, time) {
    switch (glucoseState) {
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
