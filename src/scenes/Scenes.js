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
      bar.clear().fillStyle(0x43A047).fillRoundedRect(W/2 - 158, H/2 - 12, 316 * v, 24, 5);
    });
    this.add.text(W/2, H/2 - 40, 'Cargando...', {
      fontSize: '14px', fontFamily: 'monospace', fill: '#546E7A',
    }).setOrigin(0.5);

    this.load.image('logo', 'assets/logo.png');
    this.load.spritesheet('sugargirl', 'assets/sugargirl.png', {
      frameWidth: 80,
      frameHeight: 102,
    });
  }

  create() {
    // Crear animaciones del spritesheet aquí, ya cargado
    if (this.textures.exists('sugargirl')) {
      this.anims.create({
        key: 'run',
        frames: this.anims.generateFrameNumbers('sugargirl', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1,
      });
      this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('sugargirl', { start: 4, end: 4 }),
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
    this.cameras.main.setBackgroundColor('#0a1628');

    // Fondo gradiente
    this.add.graphics()
      .fillGradientStyle(0x0a1628, 0x0a1628, 0x0d2040, 0x0d2040, 1)
      .fillRect(0, 0, W, H);

    // Logo
    if (this.textures.exists('logo')) {
      const logo = this.add.image(W/2, H * 0.18, 'logo').setOrigin(0.5);
      logo.setScale(Math.min(280 / logo.width, 100 / logo.height));
    }

    // Separador
    this.add.graphics()
      .lineStyle(1, 0x43A047, 0.2)
      .lineBetween(W * 0.1, H * 0.33, W * 0.9, H * 0.33);

    const name = window.PLAYER_NAME || '?';
    this.add.text(W/2, H * 0.39, `¡Hola, ${name}!`, {
      fontSize: '20px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#fff',
    }).setOrigin(0.5);

    // Botón JUGAR
    const btn = this.add.text(W/2, H * 0.52, '▶  JUGAR', {
      fontSize: '22px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#000', backgroundColor: '#43A047', padding: { x: 28, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerover',  () => btn.setStyle({ backgroundColor: '#66BB6A' }));
    btn.on('pointerout',   () => btn.setStyle({ backgroundColor: '#43A047' }));
    btn.on('pointerdown',  () => this.scene.start('Game', { lvl: 0 }));

    // Cambiar nombre
    this.add.text(W/2, H * 0.63, '✎ Cambiar nombre', {
      fontSize: '13px', fontFamily: 'monospace', fill: '#546E7A',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        window.PLAYER_NAME = null;
        localStorage.removeItem('sg_name');
        location.reload();
      });

    // Ranking
    this.add.text(W/2, H * 0.71, '🏆 RANKING GLOBAL', {
      fontSize: '13px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#FFC107',
    }).setOrigin(0.5);

    const rows = await DB.top(6);
    if (!rows.length) {
      this.add.text(W/2, H * 0.80, '¡Sé el primero!', {
        fontSize: '12px', fontFamily: 'monospace', fill: '#444',
      }).setOrigin(0.5);
    } else {
      rows.forEach((r, i) => {
        const medal = ['🥇','🥈','🥉'][i] || `${i+1}.`;
        const isMe  = r.player_name === name;
        this.add.text(W/2, H * 0.78 + i * 22,
          `${medal} ${r.player_name.substring(0,12).padEnd(12)} ${String(r.score).padStart(6)} pts`,
          {
            fontSize: '12px', fontFamily: 'monospace',
            fill: isMe ? '#43A047' : i < 3 ? '#FFC107' : '#666',
            fontStyle: isMe ? 'bold' : 'normal',
          }
        ).setOrigin(0.5);
      });
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
    this.cameras.main.setBackgroundColor('#0a1628');
    const { score, secs, tir, rng, bonus, lvlIdx, name } = data;
    const lvl = CONFIG.LEVELS[lvlIdx];

    await DB.save({ name, score, secs, tir, rng, level: lvl.id });

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
      fill: '#43A047', stroke: '#1B5E20', strokeThickness: 4,
    }).setOrigin(0.5);
    this.add.text(W/2, H * 0.51, 'PUNTOS', {
      fontSize: '11px', fontFamily: 'monospace', fill: '#444',
    }).setOrigin(0.5);

    // Stats
    const stats = [
      { label: 'Tiempo en rango', value: `${tir}%`,   color: tir >= 70 ? '#43A047' : '#FFC107' },
      { label: '★ RANGAZO',       value: `${rng}%`,   color: rng >= 50 ? '#FFD700' : '#888' },
      { label: 'Tiempo',          value: `${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`, color: '#fff' },
      { label: 'Bonus velocidad', value: `+${bonus}`, color: '#FF6F00' },
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

    // Ranking
    this.add.text(W/2, H * 0.78, '🏆 RANKING', {
      fontSize: '12px', fontFamily: 'monospace', fontStyle: 'bold', fill: '#FFC107',
    }).setOrigin(0.5);
    const rows = await DB.top(5);
    rows.forEach((r, i) => {
      const medal = ['🥇','🥈','🥉'][i] || `${i+1}.`;
      const isMe  = r.player_name === name;
      this.add.text(W/2, H * 0.84 + i * 21,
        `${medal} ${r.player_name.substring(0,12).padEnd(12)} ${String(r.score).padStart(6)} pts`,
        {
          fontSize: '12px', fontFamily: 'monospace',
          fill: isMe ? '#43A047' : i < 3 ? '#FFC107' : '#666',
          fontStyle: isMe ? 'bold' : 'normal',
        }
      ).setOrigin(0.5);
    });

    // Botones
    const hasNext = lvlIdx + 1 < CONFIG.LEVELS.length;
    if (hasNext) {
      this.add.text(W * 0.30, H * 0.94, '▶ SIGUIENTE', {
        fontSize: '16px', fontFamily: 'monospace', fontStyle: 'bold',
        fill: '#000', backgroundColor: '#43A047', padding: { x: 14, y: 9 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start('Game', { lvl: lvlIdx + 1 }));
    }
    this.add.text(hasNext ? W * 0.72 : W/2, H * 0.94, '⟵ MENÚ', {
      fontSize: '16px', fontFamily: 'monospace', fontStyle: 'bold',
      fill: '#000', backgroundColor: '#FFC107', padding: { x: 14, y: 9 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('Menu'));
  }
}
