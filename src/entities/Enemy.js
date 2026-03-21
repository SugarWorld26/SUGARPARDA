// ================================================================
//  Enemy.js — Un enemigo individual.
//  Gráficos placeholder geométricos. Fácil de sustituir.
// ================================================================

// Paleta de colores por tipo
const ENEMY_COLORS = {
  lollipop: { body: 0xFF4081, accent: 0xFFFFFF, stick: 0xF5F5DC },
  cake:     { body: 0xF48FB1, accent: 0xFFFFFF, stick: 0xE91E63 },
  choco:    { body: 0x4E342E, accent: 0x8D6E63, stick: 0x3E2723 },
  cupcake:  { body: 0xCE93D8, accent: 0xFF80AB, stick: 0x7B1FA2 },
};

// Asegurar que la textura del tipo existe
function ensureEnemyTexture(scene, type) {
  const key = `_enemy_${type}`;
  if (scene.textures.exists(key)) return key;

  const col = ENEMY_COLORS[type];
  const g   = scene.make.graphics({ add: false });
  const S   = 4; // px per logical pixel

  // ── Formas geométricas claras y reconocibles ──
  switch (type) {
    case 'lollipop': {
      // Círculo con cara + palo
      // Palo
      g.fillStyle(col.stick, 1);
      g.fillRect(5*S, 9*S, 2*S, 5*S);
      // Cuerpo circular (rectángulo redondeado pixel)
      g.fillStyle(col.body, 1);
      g.fillRect(1*S, 1*S, 10*S, 8*S);
      g.fillStyle(col.body, 1);
      g.fillRect(0*S, 2*S, 12*S, 6*S);
      // Espiral decorativa
      g.fillStyle(col.accent, 1);
      g.fillRect(2*S, 2*S, 3*S, 2*S);
      g.fillRect(2*S, 4*S, 1*S, 3*S);
      g.fillRect(3*S, 6*S, 4*S, 1*S);
      // Ojos
      g.fillStyle(0x880E4F, 1);
      g.fillRect(2*S, 3*S, 2*S, 2*S);
      g.fillRect(8*S, 3*S, 2*S, 2*S);
      // Boca
      g.fillRect(3*S, 6*S, 6*S, 1*S);
      g.generateTexture(key, 12*S, 14*S);
      break;
    }
    case 'cake': {
      // Tarta rectangular con capas
      // Plato
      g.fillStyle(0xE0E0E0, 1);
      g.fillRect(0, 11*S, 14*S, 2*S);
      // Base bizcocho
      g.fillStyle(col.stick, 1);
      g.fillRect(1*S, 7*S, 12*S, 5*S);
      // Línea relleno
      g.fillStyle(0xFFF9C4, 1);
      g.fillRect(1*S, 8*S, 12*S, 2*S);
      // Crema
      g.fillStyle(col.accent, 1);
      g.fillRect(0, 5*S, 14*S, 3*S);
      // Ondas crema
      g.fillStyle(col.body, 1);
      for (let i = 0; i < 4; i++) g.fillRect(i*3*S+1, 4*S, 2*S, 2*S);
      // Fresa encima
      g.fillStyle(0xE53935, 1);
      g.fillRect(5*S, 1*S, 4*S, 4*S);
      g.fillStyle(0x4CAF50, 1);
      g.fillRect(6*S, 0, 2*S, 2*S);
      // Ojos malvados
      g.fillStyle(0x880E4F, 1);
      g.fillRect(3*S, 8*S, 2*S, 2*S);
      g.fillRect(9*S, 8*S, 2*S, 2*S);
      // Boca
      g.fillRect(4*S, 9*S, 6*S, 1*S);
      g.generateTexture(key, 14*S, 13*S);
      break;
    }
    case 'choco': {
      // Tableta de chocolate
      g.fillStyle(col.stick, 1);
      g.fillRect(0, 0, 14*S, 10*S);
      // Borde oscuro
      g.fillStyle(col.body, 1);
      g.fillRect(1*S, 1*S, 12*S, 8*S);
      // Cuadrantes
      g.fillStyle(col.stick, 1);
      g.fillRect(3*S, 3*S, 1*S, 4*S);
      g.fillRect(7*S, 1*S, 1*S, 8*S);
      g.fillRect(11*S, 3*S, 1*S, 4*S);
      g.fillRect(1*S, 5*S, 12*S, 1*S);
      // Brillo
      g.fillStyle(col.accent, 1);
      g.fillRect(2*S, 2*S, 3*S, 2*S);
      g.fillRect(8*S, 2*S, 2*S, 1*S);
      // Cara
      g.fillStyle(0xFFFFFF, 1);
      g.fillRect(2*S, 7*S, 2*S, 2*S);
      g.fillRect(10*S, 7*S, 2*S, 2*S);
      g.fillStyle(0xFF1744, 1);
      g.fillRect(4*S, 8*S, 6*S, 1*S);
      g.generateTexture(key, 14*S, 10*S);
      break;
    }
    case 'cupcake': {
      // Cupcake con crema y papel
      // Papel
      g.fillStyle(col.stick, 1);
      g.fillRect(2*S, 8*S, 10*S, 5*S);
      g.fillStyle(0xF48FB1, 1);
      for (let i = 0; i < 4; i++) g.fillRect((2+i*2)*S+S, 8*S, S, 5*S);
      // Crema base
      g.fillStyle(col.body, 1);
      g.fillRect(1*S, 4*S, 12*S, 5*S);
      g.fillRect(2*S, 2*S, 10*S, 3*S);
      // Punta crema
      g.fillStyle(0xAB47BC, 1);
      g.fillRect(4*S, 1*S, 6*S, 2*S);
      g.fillRect(5*S, 0, 4*S, 2*S);
      // Sprinkles
      g.fillStyle(0xFF4081, 1); g.fillRect(3*S, 5*S, 2*S, S);
      g.fillStyle(0xFFD54F, 1); g.fillRect(9*S, 4*S, 2*S, S);
      g.fillStyle(0x4FC3F7, 1); g.fillRect(6*S, 6*S, 2*S, S);
      // Cara
      g.fillStyle(0x4A148C, 1);
      g.fillRect(3*S, 6*S, 2*S, 2*S);
      g.fillRect(9*S, 6*S, 2*S, 2*S);
      g.fillRect(4*S, 7*S, 6*S, 1*S);
      g.generateTexture(key, 14*S, 13*S);
      break;
    }
  }

  g.destroy();
  return key;
}

// ================================================================
//  Spawner.js — Genera y gestiona todos los enemigos del nivel
// ================================================================
class Spawner {
  constructor(scene, lvl, ground) {
    this._scene   = scene;
    this._lvl     = lvl;
    this._ground  = ground;
    this.group    = scene.physics.add.group({ allowGravity: false, immovable: true });
    this._spawn();
  }

  _spawn() {
    const lvl   = this._lvl;
    const count = Math.floor(lvl.length / 480 * lvl.density);
    const types = lvl.enemyTypes;
    const GY    = CONFIG.GROUND_Y;

    for (let i = 0; i < count; i++) {
      const type  = types[i % types.length];
      const texKey= ensureEnemyTexture(this._scene, type);
      const tex   = this._scene.textures.get(texKey);
      const th    = tex.getSourceImage().height;

      // Buscar posición sobre suelo sólido
      let ex, tries = 0;
      do {
        ex = Phaser.Math.Between(800, lvl.length - 300);
        tries++;
      } while (!this._ground.isSolidAt(ex) && tries < 20);
      if (!this._ground.isSolidAt(ex)) continue;

      const ey  = GY - th / 2 - 2;
      const e   = this.group.create(ex, ey, texKey);
      e.setDepth(8);
      e.body.setImmovable(true);
      e.body.setSize(tex.getSourceImage().width * 0.72, th * 0.88);
      e.setData('type',   type);
      e.setData('startX', ex);
      e.setData('range',  Phaser.Math.Between(80, 200));
      e.setData('speed',  lvl.enemySpd + Phaser.Math.Between(-15, 15));
      e.setData('tick',   Phaser.Math.Between(0, 400)); // desincronizar animaciones
      e.body.setVelocityX(-lvl.enemySpd);
    }
  }

  // Llamado cada frame
  update(delta) {
    this.group.getChildren().forEach(e => {
      const sx  = e.getData('startX');
      const rng = e.getData('range');
      const spd = e.getData('speed');

      // Patrulla
      if (e.x < sx - rng) {
        e.body.setVelocityX(spd);
        e.setFlipX(false);
      } else if (e.x > sx + rng) {
        e.body.setVelocityX(-spd);
        e.setFlipX(true);
      }

      // Animación: oscilación vertical suave
      let tk = e.getData('tick') + delta;
      if (tk > 400) tk -= 400;
      e.setData('tick', tk);
      const bob = Math.sin((tk / 400) * Math.PI * 2) * 3;
      e.setY(e.getData('startY') || (e.y));
      if (!e.getData('startY')) e.setData('startY', e.y);
      e.y = e.getData('startY') + bob;
    });
  }

  // Añadir overlap con el jugador
  addOverlap(playerSprite, callback) {
    this._scene.physics.add.overlap(playerSprite, this.group, (_, e) => {
      if (!e.getData('hit')) {
        callback(e.getData('type'));
        e.setData('hit', true);
        this._scene.time.delayedCall(1600, () => e.setData('hit', false));
      }
    });
  }
}
