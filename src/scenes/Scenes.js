// ================================================================
//  Boot.js — Carga de assets
// ================================================================
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    this.cameras.main.setBackgroundColor('#0a1628');

    // Barra de carga// ================================================================
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

    // Fondo negro con destellos rosas
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 1).fillRect(0, 0, W, H);
    // Líneas decorativas rosas
    bg.lineStyle(1, 0xFF69B4, 0.15);
    for (let y = 0; y < H; y += 40) bg.lineBetween(0, y, W, y);
    for (let x = 0; x < W; x += 80) bg.lineBetween(x, 0, x, H);
    // Esquinas decorativas
    bg.lineStyle(2, 0xFF69B4, 0.6);
    bg.strokeRect(8, 8, W - 16, H - 16);
    bg.lineStyle(1, 0xFF69B4, 0.3);
    bg.strokeRect(14, 14, W - 28, H - 28);

    // Logo grande centrado arriba
    if (this.textures.exists('logo')) {
      const logo = this.add.image(W/2, H * 0.22, 'logo').setOrigin(0.5);
      logo.setScale(Math.min(400 / logo.width, 160 / logo.height));
    }

    const name = window.PLAYER_NAME || '?';

    // Saludo con estilo
    this.add.text(W/2, H * 0.42, `¡Hola, ${name}!`, {
      fontSize: '22px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#ffffff', stroke: '#FF69B4', strokeThickness: 3,
    }).setOrigin(0.5);

    // Botón JUGAR grande y llamativo
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0xFF69B4, 1).fillRoundedRect(W/2 - 120, H * 0.50, 240, 44, 10);
    btnBg.lineStyle(2, 0xffffff, 0.5).strokeRoundedRect(W/2 - 120, H * 0.50, 240, 44, 10);
    const btn = this.add.text(W/2, H * 0.50 + 22, '▶  JUGAR', {
      fontSize: '24px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#000',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => {
      btnBg.clear();
      btnBg.fillStyle(0xC2185B, 1).fillRoundedRect(W/2 - 120, H * 0.50, 240, 44, 10);
      this.scene.start('Game', { lvl: 0 });
    });

    // Cambiar nombre
    this.add.text(W/2, H * 0.62, '✎ Cambiar nombre', {
      fontSize: '12px', fontFamily: 'monospace', fill: '#888',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        window.PLAYER_NAME = null;
        localStorage.removeItem('sg_name');
        location.reload();
      });

    // Título ranking
    this.add.graphics()
      .lineStyle(1, 0xFF69B4, 0.4)
      .lineBetween(W * 0.05, H * 0.68, W * 0.95, H * 0.68);
    this.add.text(W/2, H * 0.71, '🏆  RANKING GLOBAL', {
      fontSize: '14px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#FFC107',
    }).setOrigin(0.5);

    // Ranking scrolleable sin máscara blanca
    const rows = await DB.top(100);
    const rankY0 = H * 0.77;
    const lineH  = 20;
    const rankH  = H - rankY0 - 10;

    // Contenedor con scroll simple — sin máscara
    const rankContainer = this.add.container(0, 0);
    let scrollY = 0;

    if (!rows.length) {
      rankContainer.add(this.add.text(W/2, rankY0 + 10, '¡Sé el primero!', {
        fontSize: '12px', fontFamily: 'monospace', fill: '#666',
      }).setOrigin(0.5));
    } else {
      rows.forEach((r, i) => {
        const medal = ['🥇','🥈','🥉'][i] || `${String(i+1).padStart(2,' ')}.`;
        const isMe  = r.player_name === name;
        rankContainer.add(this.add.text(W/2, rankY0 + i * lineH,
          `${medal} ${r.player_name.substring(0,12).padEnd(12)} ${String(r.score).padStart(6)} pts`,
          { fontSize: '12px', fontFamily: 'monospace',
            fill: isMe ? '#FF69B4' : i < 3 ? '#FFC107' : '#888',
            fontStyle: isMe ? 'bold' : 'normal' }
        ).setOrigin(0.5));
      });
    }

    // Borde inferior para efecto de scroll limpio
    this.add.graphics().setDepth(10)
      .fillStyle(0x000000, 1).fillRect(0, H - 6, W, 6);

    // Scroll drag
    const maxScroll = Math.max(0, rows.length * lineH - rankH);
    this.input.on('pointermove', (p) => {
      if (!p.isDown) return;
      scrollY = Phaser.Math.Clamp(scrollY - p.velocity.y * 0.5, 0, maxScroll);
      rankContainer.y = -scrollY;
    });

    // Camera clip para ranking
    this.cameras.main.setRoundPixels(true);
  }
}

// ================================================================
//  Result.js — Pantalla de resultados
// ================================================================
class ResultScene extends Phaser.Scene {
  constructor() { super('Result'); }

  async create(data) {
    const W = CONFIG.W, H = CONFIG.H;
    this.cameras.main.setBackgroundColor('#0a1628');
    const { score, secs, tir, rng, bonus, lvlIdx, name } = data;
    const lvl = CONFIG.LEVELS[lvlIdx];

    // Solo subir al ranking en el último nivel o si no hay siguiente
    const isLastLevel = lvlIdx + 1 >= CONFIG.LEVELS.length;
    if (isLastLevel) {
      await DB.save({ name, score, secs, tir, rng, level: lvl.id });
    }

    // Logo
    if (this.textures.exists('logo')) {
      const logo = this.add.image(W/2, H * 0.10, 'logo').setOrigin(0.5);
      logo.setScale(Math.min(220 / logo.width, 75 / logo.height));
    }

    this.add.text(W/2, H * 0.21, '📊 RESULTADOS', {
      fontSize: '20px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#FFC107',
    }).setOrigin(0.5);

    this.add.text(W/2, H * 0.29, `${name} — Nivel ${lvl.id}: ${lvl.name}`, {
      fontSize: '13px', fontFamily: 'monospace', fill: '#888',
    }).setOrigin(0.5);

    // Puntuación
    this.add.text(W/2, H * 0.41, String(score), {
      fontSize: '46px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#FF69B4', stroke: '#880E4F', strokeThickness: 4,
    }).setOrigin(0.5);
    this.add.text(W/2, H * 0.51, 'PUNTOS', {
      fontSize: '11px', fontFamily: 'monospace', fill: '#444',
    }).setOrigin(0.5);

    // Stats
    const stats = [
      { label: 'Tiempo en rango', value: `${tir}%`, color: tir >= 70 ? '#FF69B4' : '#FFC107' },
      { label: '★ RANGAZO',       value: `${rng}%`, color: rng >= 50 ? '#FFD700' : '#888' },
      { label: 'Tiempo',          value: `${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`, color: '#fff' },
    ];
    stats.forEach((s, i) => {
      const x = i % 2 === 0 ? W * 0.26 : W * 0.74;
      const y = H * 0.62 + Math.floor(i / 2) * H * 0.11;
      this.add.graphics()
        .fillStyle(0x0d1f3c, 1)
        .fillRoundedRect(x - W * 0.19, y - H * 0.042, W * 0.38, H * 0.082, 7);
      this.add.text(x, y - H * 0.012, s.label, {
        fontSize: '10px', fontFamily: 'monospace', fill: '#555',
      }).setOrigin(0.5);
      this.add.text(x, y + H * 0.018, s.value, {
        fontSize: '17px', fontFamily: 'monospace', fontStyle: 'bold', fill: s.color,
      }).setOrigin(0.5);
    });

    // Posición del jugador
    const myPos = await DB.getPosition(name, score);
    if (myPos) {
      const posColor = myPos <= 10 ? '#FFD700' : myPos <= 50 ? '#FF69B4' : '#888';
      this.add.text(W/2, H * 0.76, `Tu posición: #${myPos}`, {
        fontSize: '14px', fontFamily: 'monospace', fontStyle: 'bold', fill: posColor,
        stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5);
    }

    // Ranking scrolleable
    this.add.text(W/2, H * 0.81, '🏆 RANKING', {
      fontSize: '12px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#FFC107',
    }).setOrigin(0.5);

    const rows = await DB.top(100);
    const rankY0 = H * 0.86;
    const rankH  = H * 0.07;
    const lineH  = 19;
    const rankContainer = this.add.container(0, 0);
    let scrollY = 0;

    rows.forEach((r, i) => {
      const medal = ['🥇','🥈','🥉'][i] || `${i+1}.`;
      const isMe  = r.player_name === name;
      const t = this.add.text(W/2, rankY0 + i * lineH,
        `${medal} ${r.player_name.substring(0,12).padEnd(12)} ${String(r.score).padStart(6)} pts`,
        {
          fontSize: '11px', fontFamily: 'monospace',
          fill: isMe ? '#FF69B4' : i < 3 ? '#FFC107' : '#666',
          fontStyle: isMe ? 'bold' : 'normal',
        }
      ).setOrigin(0.5);
      rankContainer.add(t);
    });

    const maxScroll = Math.max(0, rows.length * lineH - rankH);
    this.input.on('pointermove', (p) => {
      if (!p.isDown) return;
      scrollY = Phaser.Math.Clamp(scrollY - p.velocity.y * 0.4, 0, maxScroll);
      rankContainer.y = -scrollY;
    });
    // Sin máscara blanca — scroll con fondos opacos
    this.add.graphics().setDepth(10)
      .fillStyle(0x0a1628, 1).fillRect(0, 0, W, rankY0 - 2)
      .fillStyle(0x0a1628, 1).fillRect(0, H - 8, W, 8);

    // Botones
    const hasNext = lvlIdx + 1 < CONFIG.LEVELS.length && !data.gameOver;
    if (hasNext) {
      this.add.text(W * 0.30, H * 0.94, '▶ SIGUIENTE', {
        fontSize: '16px', fontFamily: 'monospace', fontStyle: 'bold',
        fill: '#000', backgroundColor: '#FF69B4', padding: { x: 14, y: 9 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start('Game', { lvl: lvlIdx + 1, prevScore: score, prevFast: data.prevFast }));
    }
    this.add.text(hasNext ? W * 0.72 : W/2, H * 0.94, '⟵ MENÚ', {
      fontSize: '16px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#000', backgroundColor: '#FFC107', padding: { x: 14, y: 9 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('Menu'));
  }
}

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

    // Fondo negro con destellos rosas
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 1).fillRect(0, 0, W, H);
    // Líneas decorativas rosas
    bg.lineStyle(1, 0xFF69B4, 0.15);
    for (let y = 0; y < H; y += 40) bg.lineBetween(0, y, W, y);
    for (let x = 0; x < W; x += 80) bg.lineBetween(x, 0, x, H);
    // Esquinas decorativas
    bg.lineStyle(2, 0xFF69B4, 0.6);
    bg.strokeRect(8, 8, W - 16, H - 16);
    bg.lineStyle(1, 0xFF69B4, 0.3);
    bg.strokeRect(14, 14, W - 28, H - 28);

    // Logo grande centrado arriba
    if (this.textures.exists('logo')) {
      const logo = this.add.image(W/2, H * 0.22, 'logo').setOrigin(0.5);
      logo.setScale(Math.min(400 / logo.width, 160 / logo.height));
    }

    const name = window.PLAYER_NAME || '?';

    // Saludo con estilo
    this.add.text(W/2, H * 0.42, `¡Hola, ${name}!`, {
      fontSize: '22px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#ffffff', stroke: '#FF69B4', strokeThickness: 3,
    }).setOrigin(0.5);

    // Botón JUGAR grande y llamativo
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0xFF69B4, 1).fillRoundedRect(W/2 - 120, H * 0.50, 240, 44, 10);
    btnBg.lineStyle(2, 0xffffff, 0.5).strokeRoundedRect(W/2 - 120, H * 0.50, 240, 44, 10);
    const btn = this.add.text(W/2, H * 0.50 + 22, '▶  JUGAR', {
      fontSize: '24px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#000',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => {
      btnBg.clear();
      btnBg.fillStyle(0xC2185B, 1).fillRoundedRect(W/2 - 120, H * 0.50, 240, 44, 10);
      this.scene.start('Game', { lvl: 0 });
    });

    // Cambiar nombre
    this.add.text(W/2, H * 0.62, '✎ Cambiar nombre', {
      fontSize: '12px', fontFamily: 'monospace', fill: '#888',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        window.PLAYER_NAME = null;
        localStorage.removeItem('sg_name');
        location.reload();
      });

    // Título ranking
    this.add.graphics()
      .lineStyle(1, 0xFF69B4, 0.4)
      .lineBetween(W * 0.05, H * 0.68, W * 0.95, H * 0.68);
    this.add.text(W/2, H * 0.71, '🏆  RANKING GLOBAL', {
      fontSize: '14px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#FFC107',
    }).setOrigin(0.5);

    // Ranking scrolleable sin máscara blanca
    const rows = await DB.top(100);
    const rankY0 = H * 0.77;
    const lineH  = 20;
    const rankH  = H - rankY0 - 10;

    // Contenedor con scroll simple — sin máscara
    const rankContainer = this.add.container(0, 0);
    let scrollY = 0;

    if (!rows.length) {
      rankContainer.add(this.add.text(W/2, rankY0 + 10, '¡Sé el primero!', {
        fontSize: '12px', fontFamily: 'monospace', fill: '#666',
      }).setOrigin(0.5));
    } else {
      rows.forEach((r, i) => {
        const medal = ['🥇','🥈','🥉'][i] || `${String(i+1).padStart(2,' ')}.`;
        const isMe  = r.player_name === name;
        rankContainer.add(this.add.text(W/2, rankY0 + i * lineH,
          `${medal} ${r.player_name.substring(0,12).padEnd(12)} ${String(r.score).padStart(6)} pts`,
          { fontSize: '12px', fontFamily: 'monospace',
            fill: isMe ? '#FF69B4' : i < 3 ? '#FFC107' : '#888',
            fontStyle: isMe ? 'bold' : 'normal' }
        ).setOrigin(0.5));
      });
    }

    // Fondo opaco encima y debajo para efecto de scroll limpio
    this.add.graphics().setDepth(10)
      .fillStyle(0x000000, 1).fillRect(0, 0, W, rankY0 - 2)
      .fillStyle(0x000000, 1).fillRect(0, H - 8, W, 8);

    // Scroll drag
    const maxScroll = Math.max(0, rows.length * lineH - rankH);
    this.input.on('pointermove', (p) => {
      if (!p.isDown) return;
      scrollY = Phaser.Math.Clamp(scrollY - p.velocity.y * 0.5, 0, maxScroll);
      rankContainer.y = -scrollY;
    });

    // Camera clip para ranking
    this.cameras.main.setRoundPixels(true);
  }
}

// ================================================================
//  Result.js — Pantalla de resultados
// ================================================================
class ResultScene extends Phaser.Scene {
  constructor() { super('Result'); }

  async create(data) {
    const W = CONFIG.W, H = CONFIG.H;
    this.cameras.main.setBackgroundColor('#0a1628');
    const { score, secs, tir, rng, bonus, lvlIdx, name } = data;
    const lvl = CONFIG.LEVELS[lvlIdx];

    // Solo subir al ranking en el último nivel o si no hay siguiente
    const isLastLevel = lvlIdx + 1 >= CONFIG.LEVELS.length;
    if (isLastLevel) {
      await DB.save({ name, score, secs, tir, rng, level: lvl.id });
    }

    // Logo
    if (this.textures.exists('logo')) {
      const logo = this.add.image(W/2, H * 0.10, 'logo').setOrigin(0.5);
      logo.setScale(Math.min(220 / logo.width, 75 / logo.height));
    }

    this.add.text(W/2, H * 0.21, '📊 RESULTADOS', {
      fontSize: '20px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#FFC107',
    }).setOrigin(0.5);

    this.add.text(W/2, H * 0.29, `${name} — Nivel ${lvl.id}: ${lvl.name}`, {
      fontSize: '13px', fontFamily: 'monospace', fill: '#888',
    }).setOrigin(0.5);

    // Puntuación
    this.add.text(W/2, H * 0.41, String(score), {
      fontSize: '46px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#FF69B4', stroke: '#880E4F', strokeThickness: 4,
    }).setOrigin(0.5);
    this.add.text(W/2, H * 0.51, 'PUNTOS', {
      fontSize: '11px', fontFamily: 'monospace', fill: '#444',
    }).setOrigin(0.5);

    // Stats
    const stats = [
      { label: 'Tiempo en rango', value: `${tir}%`, color: tir >= 70 ? '#FF69B4' : '#FFC107' },
      { label: '★ RANGAZO',       value: `${rng}%`, color: rng >= 50 ? '#FFD700' : '#888' },
      { label: 'Tiempo',          value: `${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`, color: '#fff' },
    ];
    stats.forEach((s, i) => {
      const x = i % 2 === 0 ? W * 0.26 : W * 0.74;
      const y = H * 0.62 + Math.floor(i / 2) * H * 0.11;
      this.add.graphics()
        .fillStyle(0x0d1f3c, 1)
        .fillRoundedRect(x - W * 0.19, y - H * 0.042, W * 0.38, H * 0.082, 7);
      this.add.text(x, y - H * 0.012, s.label, {
        fontSize: '10px', fontFamily: 'monospace', fill: '#555',
      }).setOrigin(0.5);
      this.add.text(x, y + H * 0.018, s.value, {
        fontSize: '17px', fontFamily: 'monospace', fontStyle: 'bold', fill: s.color,
      }).setOrigin(0.5);
    });

    // Posición del jugador
    const myPos = await DB.getPosition(name, score);
    if (myPos) {
      const posColor = myPos <= 10 ? '#FFD700' : myPos <= 50 ? '#FF69B4' : '#888';
      this.add.text(W/2, H * 0.76, `Tu posición: #${myPos}`, {
        fontSize: '14px', fontFamily: 'monospace', fontStyle: 'bold', fill: posColor,
        stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5);
    }

    // Ranking scrolleable
    this.add.text(W/2, H * 0.81, '🏆 RANKING', {
      fontSize: '12px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#FFC107',
    }).setOrigin(0.5);

    const rows = await DB.top(100);
    const rankY0 = H * 0.86;
    const rankH  = H * 0.07;
    const lineH  = 19;
    const rankContainer = this.add.container(0, 0);
    let scrollY = 0;

    rows.forEach((r, i) => {
      const medal = ['🥇','🥈','🥉'][i] || `${i+1}.`;
      const isMe  = r.player_name === name;
      const t = this.add.text(W/2, rankY0 + i * lineH,
        `${medal} ${r.player_name.substring(0,12).padEnd(12)} ${String(r.score).padStart(6)} pts`,
        {
          fontSize: '11px', fontFamily: 'monospace',
          fill: isMe ? '#FF69B4' : i < 3 ? '#FFC107' : '#666',
          fontStyle: isMe ? 'bold' : 'normal',
        }
      ).setOrigin(0.5);
      rankContainer.add(t);
    });

    const maxScroll = Math.max(0, rows.length * lineH - rankH);
    this.input.on('pointermove', (p) => {
      if (!p.isDown) return;
      scrollY = Phaser.Math.Clamp(scrollY - p.velocity.y * 0.4, 0, maxScroll);
      rankContainer.y = -scrollY;
    });
    // Sin máscara blanca — scroll con fondos opacos
    this.add.graphics().setDepth(10)
      .fillStyle(0x0a1628, 1).fillRect(0, 0, W, rankY0 - 2)
      .fillStyle(0x0a1628, 1).fillRect(0, H - 8, W, 8);

    // Botones
    const hasNext = lvlIdx + 1 < CONFIG.LEVELS.length && !data.gameOver;
    if (hasNext) {
      this.add.text(W * 0.30, H * 0.94, '▶ SIGUIENTE', {
        fontSize: '16px', fontFamily: 'monospace', fontStyle: 'bold',
        fill: '#000', backgroundColor: '#FF69B4', padding: { x: 14, y: 9 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start('Game', { lvl: lvlIdx + 1, prevScore: score, prevFast: data.prevFast }));
    }
    this.add.text(hasNext ? W * 0.72 : W/2, H * 0.94, '⟵ MENÚ', {
      fontSize: '16px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#000', backgroundColor: '#FFC107', padding: { x: 14, y: 9 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('Menu'));
  }
}
