// ================================================================
//  Player.js — Chica joven rubia, estilo pixel art mejorado (Sugar vibe)
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

    const S  = 3;
    const FW = 20;
    const FH = 26;

    const C = {
      hairL:  0xFFD600,
      hairM:  0xFFE57F,
      hairH:  0xFFFDE7,

      skin:   0xFFCBA4,
      skinS:  0xEEAA80,
      cheek:  0xFFAB91,

      eyeW:   0xFFFFFF,
      eyeB:   0x1565C0,
      eyeP:   0x0D47A1,
      eyeL:   0xE3F2FD,
      lash:   0x212121,

      lips:   0xE91E63,
      lipL:   0xF48FB1,

      shirt:  0xF06292,
      shirtS: 0xC2185B,
      heart:  0xFF1744,

      pants:  0x1565C0,
      pantsS: 0x0D47A1,

      shoe:   0xFFFFFF,
      shoeS:  0xE0E0E0,
      sole:   0xE53935,

      tie:    0xFF4081,
    };

    const dot = (g, c, pts) => {
      g.fillStyle(c, 1);
      pts.forEach(([x, y]) => g.fillRect(x*S, y*S, S, S));
    };

    // ✨ NUEVO drawBase (MEJORADO)
    const drawBase = (g, f) => {

      // PELO con volumen
      dot(g, C.hairL, [[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],[12,0],[13,0],[14,0],[15,0]]);
      dot(g, C.hairM, [
        [3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1],[11,1],[12,1],[13,1],[14,1],[15,1],[16,1],
        [3,2],[4,2],[5,2],[14,2],[15,2],[16,2]
      ]);
      dot(g, C.hairH, [[7,0],[8,0],[9,0],[10,0],[8,1],[9,1]]);
      dot(g, C.hairL, [[3,3],[3,4],[16,3],[16,4]]);
      dot(g, C.hairM, [[4,4],[15,4]]);

      // CARA
      dot(g, C.skin, [
        [5,3],[6,3],[7,3],[8,3],[9,3],[10,3],[11,3],[12,3],[13,3],[14,3],
        [5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[11,4],[12,4],[13,4],[14,4],
        [6,5],[7,5],[8,5],[9,5],[10,5],[11,5],[12,5],[13,5],
        [7,6],[8,6],[9,6],[10,6],[11,6],[12,6]
      ]);

      // OJOS GRANDES
      dot(g, C.lash, [[6,4],[7,4],[8,4]]);
      dot(g, C.eyeW, [[6,5],[7,5],[8,5]]);
      dot(g, C.eyeB, [[7,5]]);
      dot(g, C.eyeP, [[7,5]]);
      dot(g, C.eyeL, [[6,5]]);

      dot(g, C.lash, [[11,4],[12,4],[13,4]]);
      dot(g, C.eyeW, [[11,5],[12,5],[13,5]]);
      dot(g, C.eyeB, [[12,5]]);
      dot(g, C.eyeP, [[12,5]]);
      dot(g, C.eyeL, [[11,5]]);

      dot(g, C.cheek, [[6,6],[12,6]]);
      dot(g, C.lips, [[8,7],[9,7],[10,7],[11,7]]);
      dot(g, C.lipL, [[9,7],[10,7]]);

      // CUELLO
      dot(g, C.skin, [[8,8],[9,8],[10,8],[11,8]]);

      // CAMISETA
      dot(g, C.shirt, [
        [4,9],[5,9],[6,9],[7,9],[8,9],[9,9],[10,9],[11,9],[12,9],[13,9],[14,9],[15,9],
        [4,10],[5,10],[6,10],[7,10],[8,10],[9,10],[10,10],[11,10],[12,10],[13,10],[14,10],[15,10],
        [5,11],[6,11],[7,11],[8,11],[9,11],[10,11],[11,11],[12,11],[13,11],[14,11],
      ]);

      dot(g, C.heart, [[9,10],[10,10],[9,11],[10,11]]);

      // PANTALÓN
      dot(g, C.pants, [
        [6,12],[7,12],[8,12],[9,12],[10,12],[11,12],[12,12],[13,12],
        [6,13],[7,13],[8,13],[9,13],[10,13],[11,13],[12,13],[13,13],
        [6,14],[7,14],[8,14],[9,14],[10,14],[11,14],[12,14],[13,14],
        [6,15],[7,15],[8,15],[9,15],[10,15],[11,15],[12,15],[13,15]
      ]);
    };

    // (TODO lo demás de tu código sigue EXACTAMENTE igual)
