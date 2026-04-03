// ================================================================
//  Boot.js — Carga de assets
// ================================================================
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    this.cameras.main.setBackgroundColor('#0a1628');

    // Barra de carga
    const W = CONFIG.W, H = CONFIG.H;
    const barBg = this.add.graphics();
    barBg.fillStyle(0x1a2a3a).fillRoundedRect(W/2 - 160, H/2 - 14, 320, 28, 6);
    const bar = this.add.graphics();
    this.load.on('progress', v => {
      bar.clear().fillStyle(0xFF69B4).fillRoundedRect(W/2 - 158, H/2 - 12, 316 * v, 24, 5);
    });
    this.add.text(W/2, H/2 - 40, 'Cargando...', {
      fontSize: '14px', fontFamily: 'monospace', fill: '#546E7A',
    }).setOrigin(0.5);

    this.load.image('logo', 'assets/logo.png');
    this.load.image('glucometer', 'assets/glucometer.png');
    this.load.image('btn_jump',  'assets/btn_jump.png');
    this.load.image('btn_apple', 'assets/btn_apple.png');
    this.load.image('btn_slow',  'assets/btn_slow.png');
    this.load.image('btn_fast',  'assets/btn_fast.png');
    this.load.spritesheet('cp_off',    'assets/cp_off.png',    { frameWidth: 48, frameHeight: 65 });
    this.load.spritesheet('cp_on',     'assets/cp_on.png',     { frameWidth: 48, frameHeight: 65 });
    this.load.image('meta_flag', 'assets/meta_flag.png');
    this.load.image('bg1', 'assets/bg1.jpg');
    this.load.image('bg2', 'assets/bg2.jpg');
    this.load.image('bg3', 'assets/bg3.jpg');
    this.load.image('bg4', 'assets/bg4.jpg');
    this.load.image('bg5', 'assets/bg5.jpg');
    this.load.spritesheet('lollipop', 'assets/lollipop.png', { frameWidth: 60, frameHeight: 73 });
    this.load.spritesheet('cake',     'assets/cake.png',     { frameWidth: 60, frameHeight: 59 });
    this.load.spritesheet('choco',    'assets/choco.png',    { frameWidth: 60, frameHeight: 50 });
    this.load.image('apple',          'assets/apple.png');
    this.load.image('fastpickup',     'assets/fastpickup.png');
    this.load.spritesheet('sugargirl', 'assets/sugargirl.png', {
      frameWidth: 80,
      frameHeight: 101,
    });
  }

  create() {
    // Crear animaciones del spritesheet aquí, ya cargado
    if (this.textures.exists('sugargirl')) {
      this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('sugargirl', { start: 0, end: 2 }),
        frameRate: 10,
        repeat: -1,
      });
      this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('sugargirl', { start: 3, end: 3 }),
        frameRate: 1,
        repeat: 0,
      });
    }
    this.scene.start('Menu');
  }
}

// ================================================================
//  Menu.js — Menú principal
// ================================================================
class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  async create() {
    const W = CONFIG.W, H = CONFIG.H;
    this.cameras.main.setBackgroundColor('#000000');
    AudioManager.unlock();
    AudioManager.playMusic(-1);

    // Fondo grid rosa + bordes
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 1).fillRect(0, 0, W, H);
    bg.lineStyle(1, 0xFF69B4, 0.12);
    for (let y = 0; y < H; y += 40) bg.lineBetween(0, y, W, y);
    for (let x = 0; x < W; x += 80) bg.lineBetween(x, 0, x, H);
    bg.lineStyle(2, 0xFF69B4, 0.6).strokeRect(8, 8, W-16, H-16);
    bg.lineStyle(1, 0xFF69B4, 0.3).strokeRect(14, 14, W-28, H-28);

    // Logo
    if (this.textures.exists('logo')) {
      const logo = this.add.image(W/2, H*0.20, 'logo').setOrigin(0.5);
      logo.setScale(Math.min(380/logo.width, 140/logo.height));
    }

    const name = window.PLAYER_NAME || '?';
    this.add.text(W/2, H*0.39, `¡Hola, ${name}!`, {
      fontSize: '20px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#fff', stroke: '#FF69B4', strokeThickness: 2,
    }).setOrigin(0.5);

    // Botón JUGAR — superficie completa interactiva
    this.add.text(W/2, H*0.47+20, '▶  JUGAR', {
      fontSize: '20px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#000', backgroundColor: '#FF69B4',
      padding: { x: 48, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('Game', { lvl: 0 }));

    // Cambiar nombre
    this.add.text(W/2, H*0.58, '✎ Cambiar nombre', {
      fontSize: '11px', fontFamily: 'monospace', fill: '#666',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        window.PLAYER_NAME = null;
        localStorage.removeItem('sg_name');
        location.reload();
      });

    // Separador + título ranking
    this.add.graphics()
      .lineStyle(1, 0xFF69B4, 0.4)
      .lineBetween(W*0.05, H*0.64, W*0.95, H*0.64);
    this.add.text(W/2, H*0.67, '🏆  RANKING GLOBAL', {
      fontSize: '13px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#FFC107',
    }).setOrigin(0.5);

    // ── Ranking con cámara secundaria ──
    const rankY0 = Math.round(H * 0.73);
    const rankH  = Math.round(H - rankY0 - 10);
    // Top 3 más altos, resto normal
    const lineH3 = 28;  // altura top 3
    const lineH  = 18;  // altura resto

    const rankCam = this.cameras.add(0, rankY0, W, rankH);
    rankCam.setBackgroundColor('rgba(0,0,0,0)');
    rankCam.scrollY = rankY0;

    const rows = await DB.top(100);
    const rankContainer = this.add.container(0, 0);

    if (!rows.length) {
      rankContainer.add(this.add.text(W/2, rankY0+10, '¡Sé el primero!', {
        fontSize: '12px', fontFamily: 'monospace', fill: '#555',
      }).setOrigin(0.5));
    } else {
      let curY = rankY0 + 4;
      rows.forEach((r, i) => {
        const isTop3    = i < 3;
        const fh        = isTop3 ? lineH3 : lineH;
        const medal     = ['🥇','🥈','🥉'][i] || `${i+1}.`;
        const verified  = DB.isVerified(r.player_name);
        const cleanName = DB.cleanName(r.player_name);
        const isMe      = cleanName === name;
        const fs        = isTop3 ? '15px' : '11px';
        const fill      = isMe   ? '#FF69B4'
                        : i === 0 ? '#FFD700'
                        : i === 1 ? '#E0E0E0'
                        : i === 2 ? '#CD7F32'
                        : '#888';

        // Fondo para top 3
        if (isTop3) {
          const fbg = this.add.graphics();
          const bgCol = i===0 ? 0x332200 : i===1 ? 0x222222 : 0x221100;
          fbg.fillStyle(bgCol, 0.8).fillRoundedRect(W*0.05, curY, W*0.9, fh-2, 4);
          rankContainer.add(fbg);
        }

        const checkMark = verified ? ' ✓' : '';
        const nameDisplay = cleanName.substring(0,12).padEnd(12);
        const txt = this.add.text(W/2, curY + fh/2,
          `${medal} ${nameDisplay}${checkMark} ${String(r.score).padStart(6)} pts`,
          { fontSize: fs, fontFamily: 'monospace',
            fill, fontStyle: isTop3 ? 'bold' : 'normal',
            stroke: isTop3 ? '#000' : undefined,
            strokeThickness: isTop3 ? 2 : 0 }
        ).setOrigin(0.5);
        rankContainer.add(txt);

        curY += fh;
      });
    }

    // Ignorar en cámara principal
    rankContainer.each(obj => { obj.cameraFilter = this.cameras.main.id; });

    // Total altura del contenido
    const totalH = 4 + rows.slice(0,3).length * lineH3 + Math.max(0, rows.length-3) * lineH;
    const maxScroll = Math.max(0, totalH - rankH);
    let scrollY = 0;

    // Scroll: arrastrar hacia arriba = ver más abajo (scrollY aumenta)
    this.input.on('pointermove', (p) => {
      if (!p.isDown) return;
      // velocity.y negativo = dedo sube = queremos ver más abajo
      scrollY = Phaser.Math.Clamp(scrollY - p.velocity.y * 0.4, 0, maxScroll);
      rankCam.scrollY = rankY0 + scrollY;
    });

    // Indicador de scroll si hay más contenido
    if (maxScroll > 0) {
      this.add.text(W/2, H - 8, '▼ desliza para ver más', {
        fontSize: '9px', fontFamily: 'monospace', fill: '#FF69B4',
      }).setOrigin(0.5).setAlpha(0.6);
    }
  }
}

// ================================================================
//  Result.js — Pantalla de resultados
// ================================================================
class ResultScene extends Phaser.Scene {
  constructor() { super('Result'); }

  async create(data) {
    const W = CONFIG.W, H = CONFIG.H;
    this.cameras.main.setBackgroundColor('#000000');
    AudioManager.stopMusic();
    const { score, secs, tir, rng, lvlIdx, name } = data;
    const lvl = CONFIG.LEVELS[lvlIdx];

    const isLastLevel = lvlIdx + 1 >= CONFIG.LEVELS.length;

    // Si es el último nivel: guardar y buscar posición en ranking
    let rankPos = null;
    if (isLastLevel) {
      await DB.save({ name, score, secs, tir, rng, level: lvl.id });
      // Obtener ranking completo para calcular posición
      const allRows = await DB.top(200);
      // La posición es cuántas entradas tienen score mayor al nuestro + 1
      // (puede haber empates: mostramos el primer puesto igual)
      rankPos = allRows.findIndex(r => r.score <= score);
      if (rankPos === -1) rankPos = allRows.length; // último
      rankPos += 1; // 1-based
    }

    // Fondo grid
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 1).fillRect(0, 0, W, H);
    bg.lineStyle(1, 0xFF69B4, 0.10);
    for (let y = 0; y < H; y += 40) bg.lineBetween(0, y, W, y);
    for (let x = 0; x < W; x += 80) bg.lineBetween(x, 0, x, H);
    bg.lineStyle(2, 0xFF69B4, 0.5).strokeRect(8, 8, W-16, H-16);

    // Título nivel
    this.add.text(W/2, H*0.07, `NIVEL ${lvl.id}`, {
      fontSize: '16px', fontFamily: 'monospace', fill: '#ffffff',
    }).setOrigin(0.5);
    this.add.text(W/2, H*0.14, lvl.name.toUpperCase(), {
      fontSize: '26px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#FF69B4', stroke: '#880E4F', strokeThickness: 3,
    }).setOrigin(0.5);

    // Línea de subtítulo: puesto en ranking (último nivel) o próximo nivel
    if (isLastLevel && rankPos !== null) {
      const medal = rankPos === 1 ? '🥇' : rankPos === 2 ? '🥈' : rankPos === 3 ? '🥉' : '🏅';
      const posColor = rankPos <= 3 ? '#FFD700' : rankPos <= 10 ? '#FFC107' : '#FF69B4';
      this.add.text(W/2, H*0.21, `${medal}  PUESTO #${rankPos} EN EL RANKING`, {
        fontSize: '16px', fontFamily: 'monospace', fontStyle: 'bold',
        fill: posColor, stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5);
    } else {
      const nextLvl = CONFIG.LEVELS[lvlIdx + 1];
      if (nextLvl) {
        this.add.text(W/2, H*0.21, `PRÓXIMO: ${nextLvl.name.toUpperCase()}`, {
          fontSize: '15px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#FFC107',
        }).setOrigin(0.5);
      }
    }

    // Puntuación
    this.add.text(W/2, H*0.31, String(score), {
      fontSize: '64px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#FF69B4', stroke: '#880E4F', strokeThickness: 5,
    }).setOrigin(0.5);
    this.add.text(W/2, H*0.41, 'PUNTOS', {
      fontSize: '13px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#FF69B4',
    }).setOrigin(0.5);

    // Separador
    this.add.graphics()
      .lineStyle(1, 0xFF69B4, 0.4)
      .lineBetween(W*0.05, H*0.46, W*0.95, H*0.46);

    // Stats: 2 cajas
    const stats = [
      { label: 'TIEMPO EN RANGO', value: `${tir}%`, color: tir >= 70 ? '#FF69B4' : '#FFC107' },
      { label: 'RANGAZO',         value: `${rng}%`, color: rng >= 50 ? '#FFD700' : '#aaa' },
    ];
    [W*0.26, W*0.74].forEach((x, i) => {
      const s = stats[i];
      const y = H*0.57, bw = W*0.38, bh = H*0.16;
      this.add.graphics()
        .fillStyle(0x0d1020, 1).fillRoundedRect(x-bw/2, y-bh/2, bw, bh, 8)
        .lineStyle(1, 0xFF69B4, 0.35).strokeRoundedRect(x-bw/2, y-bh/2, bw, bh, 8);
      this.add.text(x, y-bh*0.2, s.label, {
        fontSize: '11px', fontFamily: 'monospace', fill: '#ffffff',
      }).setOrigin(0.5);
      this.add.text(x, y+bh*0.18, s.value, {
        fontSize: '26px', fontFamily: 'monospace', fontStyle: 'bold',
        fill: s.color, stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5);
    });

    // Separador
    this.add.graphics()
      .lineStyle(1, 0xFF69B4, 0.3)
      .lineBetween(W*0.05, H*0.68, W*0.95, H*0.68);

    // ── Botones ──
    const hasNext = !isLastLevel && !data.gameOver;

    if (hasNext) {
      // Niveles intermedios: SIGUIENTE NIVEL (izq) + MENÚ (der)
      this.add.text(W*0.28, H*0.82, '▶  SIGUIENTE NIVEL', {
        fontSize: '17px', fontFamily: 'monospace', fontStyle: 'bold',
        fill: '#000', backgroundColor: '#FF69B4', padding: { x: 14, y: 11 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start('Game', {
          lvl: lvlIdx+1, prevScore: score, prevFast: data.prevFast,
          prevBackpack: data.prevBackpack != null ? data.prevBackpack : CONFIG.BACKPACK_START,
        }));

      this.add.text(W*0.74, H*0.82, '⟵  MENÚ', {
        fontSize: '17px', fontFamily: 'monospace', fontStyle: 'bold',
        fill: '#000', backgroundColor: '#FFC107', padding: { x: 14, y: 11 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start('Menu'));

    } else {
      // Último nivel: MENÚ (izq) + RANKING (der)
      this.add.text(W*0.28, H*0.82, '⟵  MENÚ', {
        fontSize: '17px', fontFamily: 'monospace', fontStyle: 'bold',
        fill: '#000', backgroundColor: '#FFC107', padding: { x: 14, y: 11 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start('Menu'));

      this.add.text(W*0.74, H*0.82, '🏆  RANKING', {
        fontSize: '17px', fontFamily: 'monospace', fontStyle: 'bold',
        fill: '#000', backgroundColor: '#FF69B4', padding: { x: 14, y: 11 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start('Ranking', { myScore: score, myName: name }));
    }
  }
}

// ================================================================
//  Ranking.js — Pantalla de ranking completo
// ================================================================
class RankingScene extends Phaser.Scene {
  constructor() { super('Ranking'); }

  async create(data) {
    const W = CONFIG.W, H = CONFIG.H;
    this.cameras.main.setBackgroundColor('#000000');
    const myScore = data ? data.myScore : null;
    const myName  = data ? data.myName  : null;

    // Fondo grid
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 1).fillRect(0, 0, W, H);
    bg.lineStyle(1, 0xFF69B4, 0.10);
    for (let y = 0; y < H; y += 40) bg.lineBetween(0, y, W, y);
    for (let x = 0; x < W; x += 80) bg.lineBetween(x, 0, x, H);
    bg.lineStyle(2, 0xFF69B4, 0.5).strokeRect(8, 8, W-16, H-16);

    // Título
    this.add.text(W/2, 26, '🏆  RANKING GLOBAL', {
      fontSize: '20px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#FFC107', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    // Zona scrollable — se crea ANTES del botón para poder filtrarlo
    const rankY0 = 52;
    const rankH  = H - rankY0 - 10;
    const lineH3 = 28;
    const lineH  = 20;

    const rankCam = this.cameras.add(0, rankY0, W, rankH);
    rankCam.setBackgroundColor('rgba(0,0,0,0)');
    rankCam.scrollY = rankY0;

    // Botón volver — creado DESPUÉS de rankCam y excluido de ella
    const volverBtn = this.add.text(W - 12, 12, '✕ VOLVER', {
      fontSize: '12px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#000', backgroundColor: '#FFC107', padding: { x: 10, y: 6 },
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true }).setDepth(99)
      .setScrollFactor(0)
      .on('pointerdown', () => this.scene.start('Menu'));
    volverBtn.cameraFilter = rankCam.id;

    const rows = await DB.top(200);
    const rankContainer = this.add.container(0, 0);

    if (!rows.length) {
      rankContainer.add(this.add.text(W/2, rankY0 + 20, '¡Aún no hay puntuaciones!', {
        fontSize: '14px', fontFamily: 'monospace', fill: '#555',
      }).setOrigin(0.5));
    } else {
      let curY = rankY0 + 6;
      rows.forEach((r, i) => {
        const isTop3    = i < 3;
        const fh        = isTop3 ? lineH3 : lineH;
        const medal     = ['🥇','🥈','🥉'][i] || `${i+1}.`;
        const verified  = DB.isVerified(r.player_name);
        const cleanName = DB.cleanName(r.player_name);
        const isMe      = cleanName === myName && r.score === myScore;
        const fs        = isTop3 ? '14px' : '12px';
        const fill      = isMe   ? '#00FF99'
                        : i === 0 ? '#FFD700'
                        : i === 1 ? '#E0E0E0'
                        : i === 2 ? '#CD7F32'
                        : '#aaa';

        if (isTop3 || isMe) {
          const fbg   = this.add.graphics();
          const bgCol = isMe    ? 0x003322
                      : i === 0 ? 0x332200
                      : i === 1 ? 0x222222
                      : 0x221100;
          fbg.fillStyle(bgCol, 0.85).fillRoundedRect(W*0.04, curY, W*0.92, fh - 2, 4);
          rankContainer.add(fbg);
        }

        const checkMark2 = verified ? ' ✓' : '';
        const nameDisplay2 = cleanName.substring(0,14).padEnd(14);
        const label = `${medal} ${nameDisplay2}${checkMark2} ${String(r.score).padStart(6)} pts`;
        const txt = this.add.text(W/2, curY + fh/2, label, {
          fontSize: fs, fontFamily: 'monospace',
          fill, fontStyle: (isTop3 || isMe) ? 'bold' : 'normal',
          stroke: (isTop3 || isMe) ? '#000' : undefined,
          strokeThickness: (isTop3 || isMe) ? 2 : 0,
        }).setOrigin(0.5);
        rankContainer.add(txt);

        // Indicador "← TÚ" para la entrada propia
        if (isMe) {
          rankContainer.add(this.add.text(W*0.93, curY + fh/2, '← TÚ', {
            fontSize: '10px', fontFamily: 'monospace', fontStyle: 'bold',
            fill: '#00FF99',
          }).setOrigin(1, 0.5));
        }

        curY += fh;
      });
    }

    // Excluir de cámara principal
    rankContainer.each(obj => { obj.cameraFilter = this.cameras.main.id; });

    // Scroll táctil
    const totalH   = 6 + rows.slice(0,3).length * lineH3 + Math.max(0, rows.length - 3) * lineH;
    const maxScroll = Math.max(0, totalH - rankH);
    let scrollY = 0;

    this.input.on('pointermove', (p) => {
      if (!p.isDown) return;
      scrollY = Phaser.Math.Clamp(scrollY - p.velocity.y * 0.4, 0, maxScroll);
      rankCam.scrollY = rankY0 + scrollY;
    });

    if (maxScroll > 0) {
      this.add.text(W/2, H - 8, '▼ desliza para ver más', {
        fontSize: '9px', fontFamily: 'monospace', fill: '#FF69B4',
      }).setOrigin(0.5).setAlpha(0.6);
    }
  }
}
