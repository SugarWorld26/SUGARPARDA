// ================================================================
//  Player.js — La jugadora.
//  Cada frame es una textura independiente. Sin setCrop.
//  Para sustituir gráficos: cambiar _buildGraphics() solamente.
// ================================================================
class Player {
  constructor(scene, x, y) {
    this._scene = scene;
    this._buildGraphics();

    // Sprite físico — empieza con frame 0
    this.sprite = scene.physics.add.sprite(x, y, '_p0');
    this.sprite.setDepth(10);
    this.sprite.body.setSize(26, 44);

    this._frame    = 0;
    this._tick     = 0;
    this.isSlowed  = false;
    this._slowTimer= 0;
  }

  // ── Gráficos placeholder ─────────────────────────────────────
  // 5 texturas independientes: _p0 _p1 _p2 _p3 (correr) _p4 (salto)
  // Para sustituir: generar las mismas texturas con sprites reales
  _buildGraphics() {
    const scene = this._scene;
    if (scene.textures.exists('_p0')) return; // ya creadas

    const S  = 4;  // px por pixel lógico
    const FW = 10; // ancho frame en pixels lógicos
    const FH = 16; // alto frame en pixels lógicos

    const C = {
      hair:  0xFFD54F,
      skin:  0xFFCC80,
      cheek: 0xFFAB91,
      eye:   0x263238,
      mouth: 0xE91E63,
      shirt: 0x2E7D32,
      logo:  0x66BB6A,
      pants: 0x1565C0,
      shoe:  0xE53935,
    };

    // Helper: dibuja puntos [x,y] con color dado
    const dot = (g, c, pts) => {
      g.fillStyle(c, 1);
      pts.forEach(([x, y]) => g.fillRect(x*S, y*S, S, S));
    };

    // Datos de piernas por frame de carrera
    const legData = [
      { l1: [[2,11],[3,11],[2,12],[3,12]], l2: [[6,11],[7,11],[6,12],[7,12]], s1: [[1,13],[2,13],[3,13],[4,13]], s2: [[5,13],[6,13],[7,13],[8,13]] },
      { l1: [[3,11],[4,11],[3,12],[4,12]], l2: [[6,11],[7,11],[6,12],[7,12]], s1: [[2,13],[3,13],[4,13],[5,13]], s2: [[5,13],[6,13],[7,13],[8,13]] },
      { l1: [[2,11],[3,11],[2,12],[3,12]], l2: [[5,11],[6,11],[5,12],[6,12]], s1: [[1,13],[2,13],[3,13],[4,13]], s2: [[4,13],[5,13],[6,13],[7,13]] },
      { l1: [[3,11],[4,11],[3,12],[4,12]], l2: [[5,11],[6,11],[5,12],[6,12]], s1: [[2,13],[3,13],[4,13],[5,13]], s2: [[4,13],[5,13],[6,13],[7,13]] },
    ];

    // Brazos por frame
    const armData = [
      [[1,7],[1,8],[8,7],[8,8]],
      [[1,6],[1,7],[8,8],[8,9]],
      [[1,7],[1,8],[8,7],[8,8]],
      [[1,8],[1,9],[8,6],[8,7]],
    ];

    for (let f = 0; f < 5; f++) {
      const g = scene.make.graphics({ add: false });

      // Pelo
      dot(g, C.hair,  [[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[1,1],[8,1],[1,2],[8,2]]);
      // Cara
      dot(g, C.skin,  [[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[3,3],[4,3],[5,3],[6,3],[4,4],[5,4]]);
      // Ojos
      dot(g, C.eye,   [[3,2],[6,2]]);
      // Mejillas
      dot(g, C.cheek, [[2,3],[7,3]]);
      // Boca
      dot(g, C.mouth, [[4,4],[5,4]]);
      // Cuello
      dot(g, C.skin,  [[4,5],[5,5]]);
      // Cuerpo
      dot(g, C.shirt, [[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[2,7],[7,7],[2,8],[3,8],[4,8],[5,8],[6,8],[7,8]]);
      dot(g, C.logo,  [[4,7],[5,7]]);

      if (f < 4) {
        // Brazos corriendo
        dot(g, C.skin, armData[f]);
        // Pantalón
        dot(g, C.pants, [[2,9],[3,9],[4,9],[5,9],[6,9],[7,9],[2,10],[3,10],[4,10],[5,10],[6,10],[7,10]]);
        // Piernas
        dot(g, C.pants, legData[f].l1);
        dot(g, C.pants, legData[f].l2);
        // Zapatos
        dot(g, C.shoe, legData[f].s1);
        dot(g, C.shoe, legData[f].s2);
      } else {
        // Frame salto — brazos arriba, piernas juntas levantadas
        dot(g, C.skin,  [[1,5],[1,6],[8,5],[8,6]]);
        dot(g, C.pants, [[2,9],[3,9],[4,9],[5,9],[6,9],[7,9],[3,10],[4,10],[5,10],[6,10],[3,11],[4,11],[5,11],[6,11]]);
        dot(g, C.shoe,  [[2,12],[3,12],[4,12],[5,12],[5,12],[6,12],[7,12]]);
      }

      g.generateTexture(`_p${f}`, FW * S, FH * S);
      g.destroy();
    }
  }

  addToGround(ground) {
    ground.addCollider(this.sprite);
  }

  jump(glucose) {
    if (!this.sprite.body.blocked.down) return false;
    this.sprite.body.setVelocityY(CONFIG.JUMP_VY);
    glucose.onJump();
    return true;
  }

  applySlow() {
    this.isSlowed   = true;
    this._slowTimer = CONFIG.CUPCAKE_SLOW_MS;
  }

  update(delta, fast) {
    // Velocidad
    const spd = this.isSlowed ? CONFIG.SPD_SLOW
              : fast          ? CONFIG.SPD_FAST
              : CONFIG.SPD_NORMAL;
    this.sprite.body.setVelocityX(spd);

    // Slow timer
    if (this.isSlowed) {
      this._slowTimer -= delta;
      if (this._slowTimer <= 0) this.isSlowed = false;
    }

    // Animación — setTexture en vez de setCrop
    const onGround = this.sprite.body.blocked.down;
    if (onGround) {
      this._tick += delta;
      const speed = fast ? 65 : 100;
      if (this._tick >= speed) {
        this._tick  = 0;
        this._frame = (this._frame + 1) % 4;
      }
      this.sprite.setTexture(`_p${this._frame}`);
    } else {
      this._frame = 0; // reset para que al aterrizar empiece bien
      this.sprite.setTexture('_p4');
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
