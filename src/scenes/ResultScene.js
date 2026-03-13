class ResultScene extends Phaser.Scene {
  constructor(){ super('Result'); }

  async create(data){
    const W = this.scale.width;
    const H = this.scale.height;
    this.cameras.main.setBackgroundColor('#0a1628');

    const { score, timeSeconds, timeInRange, rangazoPercent, speedBonus, levelIndex, playerName } = data;
    const lvl = CONFIG.LEVELS[levelIndex];

    // Guardar ranking
    await SupabaseRanking.saveScore({
      playerName, score, timeSeconds,
      timeInRange, rangazoPercent, level: lvl.id,
    });

    // Logo pequeño
    if(this.textures.exists('logo')){
      const logo = this.add.image(W/2, H*0.09, 'logo').setOrigin(0.5);
      const sc = Math.min((W*0.4)/logo.width, (H*0.12)/logo.height);
      logo.setScale(sc);
    }

    // Título
    this.add.text(W/2, H*0.18, '📊 RESULTADOS', {
      fontSize: `${H*0.048}px`, fill: '#FFC107', fontFamily: 'monospace', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5);

    this.add.text(W/2, H*0.25, `${playerName} — Nivel ${lvl.id}: ${lvl.name}`, {
      fontSize: `${H*0.030}px`, fill: '#aaaaaa', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Puntuación
    this.add.text(W/2, H*0.35, String(score), {
      fontSize: `${H*0.10}px`, fill: '#4CAF50', fontFamily: 'monospace', fontStyle: 'bold',
      stroke: '#1B5E20', strokeThickness: 4,
    }).setOrigin(0.5);
    this.add.text(W/2, H*0.44, 'PUNTOS', {
      fontSize: `${H*0.026}px`, fill: '#555', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Stats
    const stats = [
      { label:'Tiempo en rango', value:`${timeInRange}%`,   color: timeInRange>=70?'#4CAF50':'#FFC107' },
      { label:'★ RANGAZO',       value:`${rangazoPercent}%`, color: rangazoPercent>=50?'#FFD700':'#aaa' },
      { label:'Tiempo',          value:`${Math.floor(timeSeconds/60)}:${String(timeSeconds%60).padStart(2,'0')}`, color:'#fff' },
      { label:'Bonus velocidad', value:`+${speedBonus}`,    color:'#FF6F00' },
    ];
    stats.forEach((s,i)=>{
      const x = i%2===0 ? W*0.27 : W*0.73;
      const y = H*0.52 + Math.floor(i/2)*H*0.10;
      const box = this.add.graphics();
      box.fillStyle(0x111a2e).fillRoundedRect(x-W*0.20, y-H*0.04, W*0.40, H*0.08, 8);
      this.add.text(x, y-H*0.012, s.label, { fontSize:`${H*0.022}px`, fill:'#666', fontFamily:'monospace' }).setOrigin(0.5);
      this.add.text(x, y+H*0.020, s.value, { fontSize:`${H*0.036}px`, fill:s.color, fontFamily:'monospace', fontStyle:'bold' }).setOrigin(0.5);
    });

    // Ranking
    this.add.text(W/2, H*0.73, '🏆 TOP RANKING', {
      fontSize:`${H*0.032}px`, fill:'#FFC107', fontFamily:'monospace', fontStyle:'bold',
    }).setOrigin(0.5);

    const scores = await SupabaseRanking.getTopScores(5);
    scores.forEach((s,i)=>{
      const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}.`;
      const isMe  = s.player_name === playerName;
      const color = isMe?'#4CAF50':i<3?'#FFC107':'#888';
      this.add.text(W/2, H*0.79+i*H*0.045,
        `${medal} ${s.player_name.substring(0,10).padEnd(10)} ${String(s.score).padStart(6)} pts`,
        { fontSize:`${H*0.028}px`, fill:color, fontFamily:'monospace', fontStyle:isMe?'bold':'normal' }
      ).setOrigin(0.5);
    });

    // Botones
    const hasNext = levelIndex + 1 < CONFIG.LEVELS.length;
    if(hasNext){
      const btnN = this.add.text(W*0.30, H*0.94, '▶ SIGUIENTE', {
        fontSize:`${H*0.036}px`, fill:'#000', fontFamily:'monospace', fontStyle:'bold',
        backgroundColor:'#4CAF50', padding:{x:16,y:10},
      }).setOrigin(0.5).setInteractive({useHandCursor:true});
      btnN.on('pointerdown',()=>{
        this.registry.set('currentLevel', levelIndex+1);
        this.scene.start('Game');
      });
    }
    const btnM = this.add.text(hasNext?W*0.72:W/2, H*0.94, '⟵ MENÚ', {
      fontSize:`${H*0.036}px`, fill:'#000', fontFamily:'monospace', fontStyle:'bold',
      backgroundColor:'#FFC107', padding:{x:16,y:10},
    }).setOrigin(0.5).setInteractive({useHandCursor:true});
    btnM.on('pointerdown',()=> this.scene.start('Menu'));
  }
}
