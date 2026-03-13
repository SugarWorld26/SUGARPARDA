class HUDScene extends Phaser.Scene {
  constructor(){ super('HUD'); }

  create(data){
    this.gameScene = data.gameScene;
    this.W = this.scale.width;
    this.H = this.scale.height;
    this._buildHUD();
  }

  _buildHUD(){
    const W = this.W;
    const H = this.H;
    const hudH = H * 0.12;

    // Fondo HUD
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.75);
    bg.fillRoundedRect(W/2 - W*0.28, 4, W*0.56, hudH, 10);
    bg.setDepth(200);

    // Valor glucosa
    this.glucoseVal = this.add.text(W/2, hudH * 0.38, '100', {
      fontSize: `${hudH * 0.55}px`,
      fill: '#4CAF50', fontFamily: 'monospace', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(202);

    this.add.text(W/2 + W*0.09, hudH * 0.42, 'mg/dL', {
      fontSize: `${hudH * 0.22}px`, fill: '#aaaaaa', fontFamily: 'monospace',
    }).setOrigin(0, 0.5).setDepth(202);

    // Estado
    this.glucoseState = this.add.text(W/2, hudH * 0.8, 'EN RANGO', {
      fontSize: `${hudH * 0.24}px`, fill: '#4CAF50', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(202);

    // Barra glucosa
    this.barBg = this.add.graphics().setDepth(201);
    this.barFg = this.add.graphics().setDepth(202);
    this._barX = W/2 - W*0.22;
    this._barY = hudH * 0.88;
    this._barW = W*0.44;
    this._barH = 6;

    this.barBg.fillStyle(0x333333).fillRect(this._barX, this._barY, this._barW, this._barH);
    // Zonas
    this.barBg.fillStyle(0x4CAF50, 0.3).fillRect(
      this._barX + (CONFIG.RANGE_LOW/CONFIG.GLUCOSE_MAX)*this._barW, this._barY,
      ((CONFIG.RANGE_HIGH-CONFIG.RANGE_LOW)/CONFIG.GLUCOSE_MAX)*this._barW, this._barH
    );
    this.barBg.fillStyle(0x1B5E20, 0.6).fillRect(
      this._barX + (CONFIG.RANGAZO_LOW/CONFIG.GLUCOSE_MAX)*this._barW, this._barY,
      ((CONFIG.RANGAZO_HIGH-CONFIG.RANGAZO_LOW)/CONFIG.GLUCOSE_MAX)*this._barW, this._barH
    );

    // Indicadores izquierda (insulina rápida y glucagón)
    this.fastTxt = this.add.text(12, 8, `⚡ x${CONFIG.INSULIN_FAST_MAX}`, {
      fontSize: `${hudH * 0.32}px`, fill: '#FF6F00', fontFamily: 'monospace', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setDepth(202);

    this.glucTxt = this.add.text(12, 8 + hudH * 0.38, `💉 x${this.gameScene.glucagonLeft}`, {
      fontSize: `${hudH * 0.32}px`, fill: '#4FC3F7', fontFamily: 'monospace', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setDepth(202);

    // Indicador cuesta arriba
    this.uphillTxt = this.add.text(W - 12, 8, '', {
      fontSize: `${hudH * 0.30}px`, fill: '#FFC107', fontFamily: 'monospace', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(1, 0).setDepth(202);
  }

  updateGlucose(glucose, glucagonLeft, fastLeft){
    const v     = Math.round(glucose.value);
    const color = glucose.getColor();
    const hex   = '#' + color.toString(16).padStart(6,'0');
    const state = glucose.getLabel();

    this.glucoseVal.setText(String(v)).setStyle({ fill: hex });
    this.glucoseState.setText(state).setStyle({ fill: hex });

    this.barFg.clear();
    this.barFg.fillStyle(color);
    const pct = Math.max(0, Math.min(1, v / CONFIG.GLUCOSE_MAX));
    this.barFg.fillRect(this._barX, this._barY, this._barW * pct, this._barH);

    this.fastTxt.setText(`⚡ x${fastLeft}`);
    this.glucTxt.setText(`💉 x${glucagonLeft}`);

    // Cuesta arriba
    const gs = this.gameScene;
    if(gs && gs.isUphill){
      this.uphillTxt.setText('⛰ CUESTA');
    } else {
      this.uphillTxt.setText('');
    }
  }
}
