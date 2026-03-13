// ============================================================
//  MenuScene.js — Menú principal y ranking
//  El nombre ya viene resuelto desde index.html
// ============================================================

class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  async create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.cameras.main.setBackgroundColor('#0a1628');

    const name = window._playerName || this.registry.get('playerName') || 'Jugador';
    this.registry.set('playerName', name);
    this.registry.set('currentLevel', 0);

    // Logo
    if (this.textures.exists('logo')) {
      const logo = this.add.image(W/2, H * 0.18, 'logo').setOrigin(0.5);
      const scale = Math.min((W * 0.65) / logo.width, (H * 0.25) / logo.height);
      logo.setScale(scale);
    } else {
      this.add.text(W/2, H * 0.15, 'SUGARWORLD', {
        fontSize: `${Math.round(H * 0.06)}px`,
        fill: '#4CAF50', fontFamily: 'monospace', fontStyle: 'bold',
        stroke: '#1B5E20', strokeThickness: 3,
      }).setOrigin(0.5);
    }

    // Saludo
    this.add.text(W/2, H * 0.36, `¡Hola, ${name}!`, {
      fontSize: `${Math.round(H * 0.042)}px`,
      fill: '#ffffff', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Botón JUGAR
    const playBtn = this.add.text(W/2, H * 0.50, '▶  JUGAR', {
      fontSize: `${Math.round(H * 0.048)}px`,
      fill: '#000000', fontFamily: 'monospace', fontStyle: 'bold',
      backgroundColor: '#4CAF50',
      padding: { x: 30, y: 14 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playBtn.on('pointerover', () => playBtn.setStyle({ backgroundColor: '#66BB6A' }));
    playBtn.on('pointerout',  () => playBtn.setStyle({ backgroundColor: '#4CAF50' }));
    playBtn.on('pointerdown', () => {
      this.registry.set('currentLevel', 0);
      this.scene.start('Game');
    });

    // Cambiar nombre
    const changeBtn = this.add.text(W/2, H * 0.62, '✎ Cambiar nombre', {
      fontSize: `${Math.round(H * 0.030)}px`,
      fill: '#555555', fontFamily: 'monospace',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    changeBtn.on('pointerdown', () => {
      window._playerName = null;
      localStorage.removeItem('sugarparda_name');
      window.location.reload();
    });

    // Ranking
    this.add.text(W/2, H * 0.70, '🏆 RANKING GLOBAL', {
      fontSize: `${Math.round(H * 0.032)}px`,
      fill: '#FFC107', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    const scores = await SupabaseRanking.getTopScores(6);
    if (scores.length === 0) {
      this.add.text(W/2, H * 0.77, '¡Sé el primero en el ranking!', {
        fontSize: `${Math.round(H * 0.028)}px`,
        fill: '#444444', fontFamily: 'monospace',
      }).setOrigin(0.5);
    } else {
      scores.forEach((s, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`;
        const isMe = s.player_name === name;
        const color = isMe ? '#4CAF50' : (i < 3 ? '#FFC107' : '#888888');
        this.add.text(W/2, H * 0.76 + i * (H * 0.048),
          `${medal} ${s.player_name.substring(0,12).padEnd(12)} ${String(s.score).padStart(6)} pts`,
          {
            fontSize: `${Math.round(H * 0.030)}px`,
            fill: color, fontFamily: 'monospace',
            fontStyle: isMe ? 'bold' : 'normal',
          }
        ).setOrigin(0.5);
      });
    }
  }
}
