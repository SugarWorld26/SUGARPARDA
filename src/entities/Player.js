// ================================================================
//  Player.js — Chica joven rubia, estilo pixel art detallado.
// ================================================================
class Player {
  constructor(scene, x, y) {
    this._scene = scene;
    this._buildGraphics();

    this.sprite = scene.physics.add.sprite(x, y, '_p0');
    this.sprite.setDepth(10);
    this.sprite.body.setSize(28, 52);

    this._frame    = 0;
    this._tick     = 0;
    this.isSlowed  = false;
    this._slowTimer= 0;
  }

  _buildGraphics() {
    const scene = this._scene;
    if (scene.textures.exists('_p0')) return;

    const S  = 3;   // px por pixel lógico
    const FW = 20;  // ancho frame lógico
    const FH = 26;  // alto frame lógico

    const C = {
      // Pelo rubio
      hairL:  0xFFD600,  // rubio oscuro (raíces/sombra)
      hairM:  0xFFE57F,  // rubio medio
      hairH:  0xFFFDE7,  // rubio claro (brillo)
      // Piel
      skin:   0xFFCBA4,
      skinS:  0xEEAA80,  // sombra piel
      cheek:  0xFFAB91,
      // Ojos azules
      eyeW:   0xFFFFFF,
      eyeB:   0x1565C0,  // iris azul
      eyeP:   0x0D47A1,  // pupila
      eyeL:   0xE3F2FD,  // brillo ojo
      lash:   0x212121,  // pestañas
      // Boca
      lips:   0xE91E63,
      lipL:   0xF48FB1,
      // Ropa — camiseta rosa con corazón
      shirt:  0xF06292,
      shirtS: 0xC2185B,
      heart:  0xFF1744,
      // Pantalón vaquero
      pants:  0x1565C0,
      pantsS: 0x0D47A1,
      // Zapatillas blancas con suela roja
      shoe:   0xFFFFFF,
      shoeS:  0xE0E0E0,
      sole:   0xE53935,
      // Pelo coleta
      tie:    0xFF4081,
    };

    const dot = (g, c, pts) => {
      g.fillStyle(c, 1);
      pts.forEach(([x, y]) => g.fillRect(x*S, y*S, S, S));
    };

    // ── FRAMES DE CARRERA (0-3) ──────────────────────────────────
    // Piernas animadas — 4 frames de ciclo de carrera
    const legs = [
      // frame 0: pierna izq adelante, der atrás
      {
        l1: [[6,18],[7,18],[6,19],[7,19],[5,20],[6,20]],   // muslo izq
        l2: [[10,18],[11,18],[11,19],[12,19],[12,20],[13,20]], // muslo der
        s1: [[4,21],[5,21],[6,21],[5,22],[6,22]],           // pie izq
        s2: [[13,21],[14,21],[13,22],[14,22],[15,22]],       // pie der
      },
      // frame 1
      {
        l1: [[7,18],[8,18],[7,19],[8,19],[7,20],[8,20]],
        l2: [[10,18],[11,18],[10,19],[11,19],[11,20],[12,20]],
        s1: [[6,21],[7,21],[8,21],[7,22],[8,22]],
        s2: [[12,21],[13,21],[12,22],[13,22],[14,22]],
      },
      // frame 2: pierna der adelante, izq atrás
      {
        l1: [[5,18],[6,18],[5,19],[6,19],[5,20],[6,20]],
        l2: [[11,18],[12,18],[12,19],[13,19],[13,20],[14,20]],
        s1: [[4,21],[5,21],[4,22],[5,22],[6,22]],
        s2: [[14,21],[15,21],[13,22],[14,22],[15,22]],
      },
      // frame 3
      {
        l1: [[6,18],[7,18],[6,19],[7,19],[6,20],[7,20]],
        l2: [[11,18],[12,18],[11,19],[12,19],[12,20],[13,20]],
        s1: [[5,21],[6,21],[7,21],[6,22],[7,22]],
        s2: [[13,21],[14,21],[12,22],[13,22],[14,22]],
      },
    ];

    // Brazos animados
    const arms = [
      // frame 0
      { a1: [[2,11],[2,12],[3,13]], a2: [[16,11],[17,12],[16,13]] },
      { a1: [[2,10],[2,11],[3,12]], a2: [[16,12],[17,13],[16,14]] },
      { a1: [[2,11],[2,12],[3,13]], a2: [[16,11],[17,12],[16,13]] },
      { a1: [[2,12],[2,13],[3,14]], a2: [[16,10],[17,11],[16,12]] },
    ];

    const drawBase = (g, f) => {
      // ── PELO ──
      // Coleta alta
      dot(g, C.hairL, [[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0],[13,0],[14,0]]);
      dot(g, C.hairM, [[4,0],[4,1],[4,2],[4,3],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1],[11,1],[12,1],[13,1],[14,1],[15,1],[15,0]]);
      dot(g, C.hairH, [[7,0],[8,0],[9,0],[10,0]]);
      // Flequillo
      dot(g, C.hairL, [[4,2],[5,2],[14,2],[15,2]]);
      dot(g, C.hairM, [[6,2],[7,2]]);
      // Coleta lateral derecha
      dot(g, C.hairL, [[15,2],[16,2],[16,3],[16,4],[15,4],[15,5]]);
      dot(g, C.hairM, [[15,3],[14,4]]);
      // Gomita
      dot(g, C.tie,   [[10,1],[11,1]]);

      // ── CARA ──
      dot(g, C.skin,  [
        [5,2],[6,2],[7,2],[8,2],[9,2],[10,2],[11,2],[12,2],[13,2],[14,2],
        [5,3],[6,3],[7,3],[8,3],[9,3],[10,3],[11,3],[12,3],[13,3],[14,3],
        [5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[11,4],[12,4],[13,4],[14,4],
        [6,5],[7,5],[8,5],[9,5],[10,5],[11,5],[12,5],[13,5],
        [7,6],[8,6],[9,6],[10,6],[11,6],[12,6],
      ]);
      dot(g, C.skinS, [[5,5],[5,6],[14,5],[14,6]]);

      // Ojos — azules expresivos
      // Ojo izquierdo
      dot(g, C.lash,  [[6,3],[7,3],[8,3]]);
      dot(g, C.eyeW,  [[6,4],[7,4],[8,4]]);
      dot(g, C.eyeB,  [[7,4]]);
      dot(g, C.eyeP,  [[7,4]]);
      dot(g, C.eyeL,  [[6,4]]);
      // Ojo derecho
      dot(g, C.lash,  [[11,3],[12,3],[13,3]]);
      dot(g, C.eyeW,  [[11,4],[12,4],[13,4]]);
      dot(g, C.eyeB,  [[12,4]]);
      dot(g, C.eyeP,  [[12,4]]);
      dot(g, C.eyeL,  [[11,4]]);

      // Mejillas
      dot(g, C.cheek, [[6,5],[7,5],[12,5],[13,5]]);

      // Nariz
      dot(g, C.skinS, [[9,5],[10,5]]);

      // Boca
      dot(g, C.lips,  [[8,6],[9,6],[10,6],[11,6]]);
      dot(g, C.lipL,  [[9,6],[10,6]]);

      // ── CUELLO ──
      dot(g, C.skin,  [[8,7],[9,7],[10,7],[11,7]]);

      // ── CAMISETA ──
      dot(g, C.shirt, [
        [4,8],[5,8],[6,8],[7,8],[8,8],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[15,8],
        [4,9],[5,9],[6,9],[7,9],[8,9],[9,9],[10,9],[11,9],[12,9],[13,9],[14,9],[15,9],
        [4,10],[5,10],[6,10],[7,10],[8,10],[9,10],[10,10],[11,10],[12,10],[13,10],[14,10],[15,10],
        [5,11],[6,11],[7,11],[8,11],[9,11],[10,11],[11,11],[12,11],[13,11],[14,11],
        [5,12],[6,12],[7,12],[8,12],[9,12],[10,12],[11,12],[12,12],[13,12],[14,12],
      ]);
      dot(g, C.shirtS,[[4,8],[4,9],[4,10],[15,8],[15,9],[15,10]]);
      // Corazón
      dot(g, C.heart, [[8,9],[9,9],[10,9],[11,9],[8,10],[11,10],[9,11],[10,11]]);

      // ── PANTALÓN ──
      dot(g, C.pants, [
        [5,13],[6,13],[7,13],[8,13],[9,13],[10,13],[11,13],[12,13],[13,13],[14,13],
        [5,14],[6,14],[7,14],[8,14],[9,14],[10,14],[11,14],[12,14],[13,14],[14,14],
        [5,15],[6,15],[7,15],[8,15],[9,15],[10,15],[11,15],[12,15],[13,15],[14,15],
        [5,16],[6,16],[7,16],[8,16],[9,16],[10,16],[11,16],[12,16],[13,16],[14,16],
        [5,17],[6,17],[7,17],[8,17],[9,17],[10,17],[11,17],[12,17],[13,17],[14,17],
      ]);
      dot(g, C.pantsS,[[5,13],[14,13],[5,17],[14,17],[9,13],[10,13]]);
    };

    // ── 4 frames de carrera ──
    for (let f = 0; f < 4; f++) {
      const g = scene.make.graphics({ add: false });
      drawBase(g, f);

      // Brazos
      dot(g, C.skin,   arms[f].a1);
      dot(g, C.skin,   arms[f].a2);
      dot(g, C.shirtS, arms[f].a1.slice(0,1));
      dot(g, C.shirtS, arms[f].a2.slice(0,1));

      // Piernas
      dot(g, C.pants,  legs[f].l1);
      dot(g, C.pants,  legs[f].l2);
      dot(g, C.pantsS, legs[f].l1.slice(0,1));
      dot(g, C.pantsS, legs[f].l2.slice(0,1));

      // Zapatillas
      dot(g, C.shoe,   legs[f].s1);
      dot(g, C.sole,   legs[f].s1.slice(-2));
      dot(g, C.shoe,   legs[f].s2);
      dot(g, C.sole,   legs[f].s2.slice(-2));
      dot(g, C.shoeS,  legs[f].s1.slice(0,1));
      dot(g, C.shoeS,  legs[f].s2.slice(0,1));

      g.generateTexture(`_p${f}`, FW * S, FH * S);
      g.destroy();
    }

    // ── Frame salto (f=4) ──
    const g4 = scene.make.graphics({ add: false });
    drawBase(g4, 4);

    // Brazos arriba
    dot(g4, C.skin, [[2,8],[2,9],[3,10],[17,8],[17,9],[16,10]]);
    dot(g4, C.shirtS, [[3,8],[16,8]]);

    // Piernas recogidas
    dot(g4, C.pants, [
      [6,18],[7,18],[8,18],[9,18],[10,18],[11,18],[12,18],[13,18],
      [7,19],[8,19],[9,19],[10,19],[11,19],[12,19],
      [7,20],[8,20],[9,20],[10,20],[11,20],[12,20],
    ]);
    // Zapatillas juntas
    dot(g4, C.shoe, [[6,21],[7,21],[8,21],[9,21],[10,21],[11,21],[12,21],[13,21]]);
    dot(g4, C.sole, [[6,22],[7,22],[8,22],[9,22],[10,22],[11,22],[12,22],[13,22]]);

    g4.generateTexture('_p4', FW * S, FH * S);
    g4.destroy();
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
      this._tick += delta;
      const speed = fast ? 65 : 100;
      if (this._tick >= speed) {
        this._tick  = 0;
        this._frame = (this._frame + 1) % 4;
      }
      this.sprite.setTexture(`_p${this._frame}`);
    } else {
      this._frame = 0;
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
