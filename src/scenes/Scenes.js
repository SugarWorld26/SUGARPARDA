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

    // Botón JUGAR
    this.add.graphics()
      .fillStyle(0xFF69B4, 1).fillRoundedRect(W/2-110, H*0.47, 220, 40, 10);
    this.add.text(W/2, H*0.47+20, '▶  JUGAR', {
      fontSize: '20px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#000',
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
      // Calcular posición Y de cada fila
      let curY = rankY0 + 4;
      rows.forEach((r, i) => {
        const isTop3 = i < 3;
        const fh     = isTop3 ? lineH3 : lineH;
        const medal  = ['🥇','🥈','🥉'][i] || `${i+1}.`;
        const isMe   = r.player_name === name;
        const fs     = isTop3 ? '15px' : '11px';
        const fill   = isMe   ? '#FF69B4'
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

        rankContainer.add(this.add.text(W/2, curY + fh/2,
          `${medal} ${r.player_name.substring(0,12).padEnd(12)} ${String(r.score).padStart(6)} pts`,
          { fontSize: fs, fontFamily: 'monospace',
            fill, fontStyle: isTop3 ? 'bold' : 'normal',
            stroke: isTop3 ? '#000' : undefined,
            strokeThickness: isTop3 ? 2 : 0 }
        ).setOrigin(0.5));

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
    const { score, secs, tir, rng, bonus, lvlIdx, name } = data;
    const lvl = CONFIG.LEVELS[lvlIdx];

    // Solo subir al ranking en el último nivel
    const isLastLevel = lvlIdx + 1 >= CONFIG.LEVELS.length;
    if (isLastLevel) {
      await DB.save({ name, score, secs, tir, rng, level: lvl.id });
    }

    // Fondo grid rosa igual que el menú
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 1).fillRect(0, 0, W, H);
    bg.lineStyle(1, 0xFF69B4, 0.10);
    for (let y = 0; y < H; y += 40) bg.lineBetween(0, y, W, y);
    for (let x = 0; x < W; x += 80) bg.lineBetween(x, 0, x, H);
    bg.lineStyle(2, 0xFF69B4, 0.5).strokeRect(8, 8, W-16, H-16);
    bg.lineStyle(1, 0xFF69B4, 0.25).strokeRect(14, 14, W-28, H-28);

    // Título nivel grande
    this.add.text(W/2, H*0.08, `NIVEL ${lvl.id}`, {
      fontSize: '18px', fontFamily: 'monospace', fill: '#ffffff',
    }).setOrigin(0.5);
    this.add.text(W/2, H*0.15, lvl.name.toUpperCase(), {
      fontSize: '28px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#FF69B4', stroke: '#880E4F', strokeThickness: 3,
    }).setOrigin(0.5);

    // Próximo nivel
    const nextLvl = CONFIG.LEVELS[lvlIdx + 1];
    if (nextLvl) {
      this.add.text(W/2, H*0.23, `PRÓXIMO: ${nextLvl.name.toUpperCase()}`, {
        fontSize: '17px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#FFC107',
      }).setOrigin(0.5);
    }

    // Puntuación grande y centrada
    this.add.text(W/2, H*0.32, String(score), {
      fontSize: '72px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#FF69B4', stroke: '#880E4F', strokeThickness: 5,
    }).setOrigin(0.5);
    this.add.text(W/2, H*0.43, 'PUNTOS', {
      fontSize: '14px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#FF69B4',
    }).setOrigin(0.5);

    // Separador
    this.add.graphics()
      .lineStyle(1, 0xFF69B4, 0.4)
      .lineBetween(W*0.1, H*0.48, W*0.9, H*0.48);

    // Stats — 3 cajas grandes y claras
    const stats = [
      { label: 'TIEMPO EN RANGO', value: `${tir}%`,  color: tir >= 70 ? '#FF69B4' : '#FFC107', icon: '⏱' },
      { label: 'RANGAZO',         value: `${rng}%`,  color: rng >= 50 ? '#FFD700' : '#aaa',    icon: '⭐' },
      { label: 'TIEMPO',          value: `${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`, color: '#fff', icon: '🕐' },
    ];

    stats.forEach((s, i) => {
      const x = [W*0.22, W*0.5, W*0.78][i];
      const y = H * 0.59;
      const bw = W * 0.26, bh = H * 0.14;
      // Caja
      this.add.graphics()
        .fillStyle(0x0d1020, 1)
        .fillRoundedRect(x - bw/2, y - bh/2, bw, bh, 8)
        .lineStyle(1, 0xFF69B4, 0.3)
        .strokeRoundedRect(x - bw/2, y - bh/2, bw, bh, 8);
      // Label
      this.add.text(x, y - bh*0.22, s.label, {
        fontSize: '10px', fontFamily: 'monospace', fill: '#ffffff',
      }).setOrigin(0.5);
      // Valor grande
      this.add.text(x, y + bh*0.15, s.value, {
        fontSize: '22px', fontFamily: 'monospace', fontStyle: 'bold', fill: s.color,
        stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5);
    });

    // Posición del jugador
    const myPos = await DB.getPosition(name, score);
    if (myPos) {
      const posColor = myPos <= 3 ? '#FFD700' : myPos <= 10 ? '#FF69B4' : myPos <= 50 ? '#ffffff' : '#ffffff';
      const posText  = myPos <= 3 ? `🏆 #${myPos} DEL RANKING` : `Tu posición: #${myPos}`;
      this.add.text(W/2, H*0.72, posText, {
        fontSize: myPos <= 3 ? '20px' : '15px',
        fontFamily: 'monospace', fontStyle: 'bold', fill: posColor,
        stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5);
    }

    // Botones grandes y claros
    const hasNext = lvlIdx + 1 < CONFIG.LEVELS.length && !data.gameOver;
    const btnY = H * 0.84;
    const btnW = hasNext ? W*0.36 : W*0.5;
    const btnH = 48;

    if (hasNext) {
      const bx = W*0.10;
      // Usar zona invisible interactiva sobre el botón
      this.add.graphics().setDepth(6)
        .fillStyle(0xFF69B4, 1).fillRoundedRect(bx, btnY-btnH/2, btnW, btnH, 12)
        .lineStyle(2, 0xffffff, 0.5).strokeRoundedRect(bx, btnY-btnH/2, btnW, btnH, 12);
      this.add.text(bx + btnW/2, btnY, '▶  SIGUIENTE', {
        fontSize: '20px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#000',
      }).setOrigin(0.5).setDepth(7)
        .setInteractive(new Phaser.Geom.Rectangle(-btnW/2, -btnH/2, btnW, btnH), Phaser.Geom.Rectangle.Contains)
        .on('pointerdown', () => this.scene.start('Game', {
          lvl: lvlIdx + 1, prevScore: score, prevFast: data.prevFast
        }));
    }

    // Botón menú
    const mbx = hasNext ? W*0.54 : W*0.25;
    const mbw = hasNext ? W*0.36 : W*0.5;
    this.add.graphics().setDepth(6)
      .fillStyle(0xFFC107, 1).fillRoundedRect(mbx, btnY-btnH/2, mbw, btnH, 12)
      .lineStyle(2, 0xffffff, 0.5).strokeRoundedRect(mbx, btnY-btnH/2, mbw, btnH, 12);
    this.add.text(mbx + mbw/2, btnY, '⟵  MENÚ', {
      fontSize: '20px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#000',
    }).setOrigin(0.5).setDepth(7)
      .setInteractive(new Phaser.Geom.Rectangle(-mbw/2, -btnH/2, mbw, btnH), Phaser.Geom.Rectangle.Contains)
      .on('pointerdown', () => this.scene.start('Menu'));

    // Mini ranking abajo
    this.add.graphics()
      .lineStyle(1, 0xFF69B4, 0.3)
      .lineBetween(W*0.1, H*0.91, W*0.9, H*0.91);

    const rankY0 = Math.round(H * 0.93);
    const rankH  = Math.round(H - rankY0 - 4);
    const lineH  = 16;

    const rankCam = this.cameras.add(0, rankY0, W, rankH);
    rankCam.setBackgroundColor('rgba(0,0,0,0)');
    rankCam.scrollY = rankY0;

    const rows = await DB.top(100);
    const rankContainer = this.add.container(0, 0);
    rows.forEach((r, i) => {
      const medal = ['🥇','🥈','🥉'][i] || `${i+1}.`;
      const isMe  = r.player_name === name;
      rankContainer.add(this.add.text(W/2, rankY0 + i * lineH,
        `${medal} ${r.player_name.substring(0,12).padEnd(12)} ${String(r.score).padStart(6)} pts`,
        { fontSize: '10px', fontFamily: 'monospace',
          fill: isMe ? '#FF69B4' : i < 3 ? '#FFC107' : '#555',
          fontStyle: isMe ? 'bold' : 'normal' }
      ).setOrigin(0.5));
    });
    rankContainer.each(obj => { obj.cameraFilter = this.cameras.main.id; });

    const maxScroll = Math.max(0, rows.length * lineH - rankH);
    let scrollY = 0;
    this.input.on('pointermove', (p) => {
      if (!p.isDown) return;
      scrollY = Phaser.Math.Clamp(scrollY - p.velocity.y * 0.4, 0, maxScroll);
      rankCam.scrollY = rankY0 + scrollY;
    });
  }
}
