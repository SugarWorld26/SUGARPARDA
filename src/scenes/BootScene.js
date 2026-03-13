class BootScene extends Phaser.Scene {
  constructor(){ super('Boot'); }

  preload(){
    // Generar todos los sprites pixel art proceduralmente
    this._makeSugarparda();
    this._makeEnemies();
    this._makeItems();
    this._makeTiles();
    this.load.image('logo','assets/logo.png');
  }

  _makeSugarparda(){
    // Sprite sheet: 4 frames de correr, 1 salto, 1 tambaleo
    const g = this.make.graphics({x:0,y:0,add:false});
    const frames = [0,1,2,3,4,5]; // run0-3, jump, wobble

    frames.forEach((f,i)=>{
      const ox = i*32;
      // Piernas (animadas)
      g.fillStyle(0x1565C0);
      if(f<4){
        const legOff = [0,4,-4,0][f%4];
        g.fillRect(ox+8,  32+legOff, 6, 12);
        g.fillRect(ox+18, 32-legOff, 6, 12);
      } else {
        g.fillRect(ox+6, 30, 6, 14);
        g.fillRect(ox+20, 30, 6, 14);
      }
      // Zapatos
      g.fillStyle(0xE53935);
      g.fillRect(ox+6,  43, 8, 4);
      g.fillRect(ox+18, 43, 8, 4);
      // Cuerpo / camiseta verde
      g.fillStyle(0x2E7D32);
      g.fillRect(ox+6, 18, 20, 16);
      // Detalle camiseta
      g.fillStyle(0x4CAF50);
      g.fillRect(ox+9, 20, 14, 3);
      // Brazos
      g.fillStyle(0xFFCC80);
      const armOff = f<4 ? [3,-3,3,-3][f%4] : 0;
      g.fillRect(ox+2,  20+armOff, 5, 10);
      g.fillRect(ox+25, 20-armOff, 5, 10);
      // Cuello
      g.fillStyle(0xFFCC80);
      g.fillRect(ox+13, 14, 6, 5);
      // Cabeza
      g.fillStyle(0xFFCC80);
      g.fillRect(ox+8, 4, 16, 12);
      // Pelo rubio
      g.fillStyle(0xFFD54F);
      g.fillRect(ox+7, 2, 18, 6);
      g.fillRect(ox+7, 6, 3, 6);
      g.fillRect(ox+22, 6, 3, 6);
      // Ojos
      g.fillStyle(0x1A237E);
      g.fillRect(ox+11, 8, 3, 3);
      g.fillRect(ox+18, 8, 3, 3);
      // Mejillas
      g.fillStyle(0xFFAB91);
      g.fillRect(ox+9,  11, 3, 2);
      g.fillRect(ox+20, 11, 3, 2);
      // Boca
      g.fillStyle(0xE91E63);
      g.fillRect(ox+13, 13, 6, 2);
      // Efecto tambaleo (frame 5)
      if(f===5){
        g.fillStyle(0x1565C0,0.5);
        g.fillRect(ox+0, 0, 32, 48);
      }
    });

    g.generateTexture('player', 192, 48);
    g.destroy();
  }

  _makeEnemies(){
    const g = this.make.graphics({x:0,y:0,add:false});

    // 🍭 PIRULETA (2 frames)
    [0,1].forEach(f=>{
      const ox = f*40;
      const wobble = f===1 ? 2 : 0;
      // Palo
      g.fillStyle(0xF5F5DC);
      g.fillRect(ox+18, 24+wobble, 4, 16);
      // Caramelo
      g.fillStyle(0xFF4081);
      g.fillCircle(ox+20, 18, 14);
      g.fillStyle(0xFFFFFF);
      g.fillRect(ox+8, 12, 6, 12);
      g.fillRect(ox+20, 6, 6, 12);
      g.fillStyle(0xFF80AB);
      g.fillCircle(ox+20, 18, 8);
      // Cara
      g.fillStyle(0x000000);
      g.fillRect(ox+15, 15, 3, 3);
      g.fillRect(ox+22, 15, 3, 3);
      g.fillStyle(0xFF1744);
      g.fillRect(ox+15, 20, 10, 2);
    });
    g.generateTexture('enemy_lollipop', 80, 40);

    // 🍰 TARTA (2 frames)
    g.clear();
    [0,1].forEach(f=>{
      const ox = f*48;
      const wobble = f===1 ? -1 : 0;
      // Base
      g.fillStyle(0xF8BBD9);
      g.fillRect(ox+2, 20+wobble, 44, 20);
      // Capa crema
      g.fillStyle(0xFFFDE7);
      g.fillRect(ox+2, 14+wobble, 44, 8);
      // Frosting ondulado
      g.fillStyle(0xFFFFFF);
      for(let x=0;x<5;x++) g.fillCircle(ox+6+x*9, 14+wobble, 5);
      // Fresa encima
      g.fillStyle(0xE53935);
      g.fillCircle(ox+24, 8+wobble, 6);
      g.fillStyle(0x4CAF50);
      g.fillRect(ox+22, 3+wobble, 4, 5);
      // Cara malvada
      g.fillStyle(0x880E4F);
      g.fillRect(ox+12, 24+wobble, 4, 4);
      g.fillRect(ox+32, 24+wobble, 4, 4);
      g.fillRect(ox+14, 30+wobble, 20, 3);
    });
    g.generateTexture('enemy_cake', 96, 42);

    // 🍫 CHOCOLATE (2 frames)
    g.clear();
    [0,1].forEach(f=>{
      const ox = f*44;
      const wobble = f===1 ? 2 : 0;
      g.fillStyle(0x4E342E);
      g.fillRect(ox+2, 4+wobble, 40, 32);
      // Cuadrantes
      g.fillStyle(0x6D4C41);
      g.fillRect(ox+4, 6+wobble, 17, 13);
      g.fillRect(ox+23, 6+wobble, 17, 13);
      g.fillRect(ox+4, 21+wobble, 17, 13);
      g.fillRect(ox+23, 21+wobble, 17, 13);
      // Brillo
      g.fillStyle(0x8D6E63);
      g.fillRect(ox+5, 7+wobble, 6, 4);
      // Cara
      g.fillStyle(0xFFFFFF);
      g.fillRect(ox+10, 10+wobble, 5, 5);
      g.fillRect(ox+29, 10+wobble, 5, 5);
      g.fillStyle(0x000000);
      g.fillRect(ox+11, 11+wobble, 3, 3);
      g.fillRect(ox+30, 11+wobble, 3, 3);
      g.fillRect(ox+12, 22+wobble, 20, 3);
    });
    g.generateTexture('enemy_chocolate', 88, 38);

    // 🧁 CUPCAKE (2 frames)
    g.clear();
    [0,1].forEach(f=>{
      const ox = f*42;
      const wobble = f===1 ? -2 : 0;
      // Papel
      g.fillStyle(0xF8BBD9);
      g.fillRect(ox+6, 22+wobble, 30, 18);
      g.fillStyle(0xF48FB1);
      for(let i=0;i<4;i++) g.fillRect(ox+6+i*8, 22+wobble, 4, 18);
      // Crema
      g.fillStyle(0xCE93D8);
      g.fillCircle(ox+21, 16+wobble, 12);
      g.fillStyle(0xBA68C8);
      g.fillCircle(ox+21, 12+wobble, 8);
      g.fillStyle(0xAB47BC);
      g.fillCircle(ox+21, 8+wobble, 5);
      // Sprinkles
      g.fillStyle(0xFF4081); g.fillRect(ox+14,14+wobble,3,2);
      g.fillStyle(0xFFD54F); g.fillRect(ox+24,12+wobble,3,2);
      g.fillStyle(0x4FC3F7); g.fillRect(ox+18,10+wobble,3,2);
      // Cara malvada
      g.fillStyle(0x4A148C);
      g.fillRect(ox+16, 18+wobble, 3, 3);
      g.fillRect(ox+23, 18+wobble, 3, 3);
      g.fillRect(ox+15, 23+wobble, 12, 2);
    });
    g.generateTexture('enemy_cupcake', 84, 42);

    g.destroy();
  }

  _makeItems(){
    const g = this.make.graphics({x:0,y:0,add:false});

    // 🍎 Manzana
    g.fillStyle(0xC62828);
    g.fillCircle(16, 18, 13);
    g.fillStyle(0xE53935);
    g.fillCircle(13, 15, 8);
    g.fillStyle(0xFF5252);
    g.fillCircle(11, 13, 4);
    g.fillStyle(0x2E7D32);
    g.fillRect(15, 4, 3, 7);
    g.fillStyle(0x4CAF50);
    g.fillRect(18, 6, 6, 3);
    g.generateTexture('apple', 32, 32);

    // 💉 Glucagón (jeringa)
    g.clear();
    g.fillStyle(0xE3F2FD);
    g.fillRect(4, 10, 24, 12);
    g.fillStyle(0x1565C0);
    g.fillRect(4, 10, 8, 12);
    g.fillStyle(0x90CAF9);
    g.fillRect(12, 12, 16, 8);
    g.fillStyle(0xBBDEFB);
    g.fillRect(13, 13, 6, 6);
    g.fillStyle(0x546E7A);
    g.fillRect(28, 14, 8, 4);
    g.fillStyle(0xFFFFFF);
    g.fillRect(2, 12, 3, 8);
    g.generateTexture('glucagon', 36, 32);

    // ⬤ Checkpoint bandera
    g.clear();
    g.fillStyle(0xFFC107);
    g.fillRect(6, 0, 4, 48);
    g.fillStyle(0xFFD54F);
    g.fillRect(10, 4, 20, 14);
    g.fillStyle(0xFFA000);
    g.fillRect(10, 4, 20, 4);
    g.generateTexture('checkpoint', 32, 48);

    g.destroy();
  }

  _makeTiles(){
    const g = this.make.graphics({x:0,y:0,add:false});

    // Suelo ciudad
    g.fillStyle(0x546E7A);
    g.fillRect(0,0,32,32);
    g.fillStyle(0x607D8B);
    g.fillRect(0,0,32,6);
    g.fillStyle(0x455A64);
    g.fillRect(0,6,32,2);
    g.fillStyle(0x78909C);
    g.fillRect(4,2,8,3);
    g.fillRect(20,2,8,3);
    g.generateTexture('ground_city',32,32);

    // Suelo bosque
    g.clear();
    g.fillStyle(0x33691E);
    g.fillRect(0,0,32,32);
    g.fillStyle(0x558B2F);
    g.fillRect(0,0,32,8);
    g.fillStyle(0x7CB342);
    g.fillRect(0,0,32,4);
    g.fillStyle(0x4E342E);
    g.fillRect(0,8,32,24);
    g.fillStyle(0x5D4037);
    g.fillRect(8,10,4,20);
    g.fillRect(20,14,4,16);
    g.generateTexture('ground_forest',32,32);

    // Suelo montaña
    g.clear();
    g.fillStyle(0x546E7A);
    g.fillRect(0,0,32,32);
    g.fillStyle(0x78909C);
    g.fillRect(0,0,32,6);
    g.fillStyle(0xB0BEC5);
    g.fillRect(2,1,6,3);
    g.fillRect(18,2,8,2);
    g.generateTexture('ground_mountain',32,32);

    // Suelo chuches
    g.clear();
    g.fillStyle(0xAD1457);
    g.fillRect(0,0,32,32);
    g.fillStyle(0xE91E63);
    g.fillRect(0,0,32,6);
    g.fillStyle(0xFF80AB);
    g.fillRect(4,1,6,3);
    g.fillRect(16,2,10,2);
    g.generateTexture('ground_candy',32,32);

    // Plataforma
    g.clear();
    g.fillStyle(0x795548);
    g.fillRect(0,0,32,16);
    g.fillStyle(0x8D6E63);
    g.fillRect(0,0,32,4);
    g.fillStyle(0xA1887F);
    g.fillRect(2,1,8,2);
    g.generateTexture('platform',32,16);

    // Fondo cielo ciudad
    g.clear();
    g.fillStyle(0x87CEEB);
    g.fillRect(0,0,64,64);
    g.fillStyle(0xFFFFFF);
    g.fillRect(4,8,20,8); g.fillRect(10,4,12,6);
    g.fillRect(38,20,18,6); g.fillRect(42,16,10,6);
    g.generateTexture('bg_city',64,64);

    // Fondo bosque
    g.clear();
    g.fillStyle(0x1B5E20);
    g.fillRect(0,0,64,64);
    g.fillStyle(0x2E7D32);
    g.fillRect(0,30,64,34);
    g.fillStyle(0x388E3C);
    for(let i=0;i<4;i++){
      g.fillTriangle(i*18,64, i*18+9,20, i*18+18,64);
    }
    g.generateTexture('bg_forest',64,64);

    // Fondo montaña
    g.clear();
    g.fillStyle(0x263238);
    g.fillRect(0,0,64,64);
    g.fillStyle(0x37474F);
    g.fillTriangle(0,64,32,10,64,64);
    g.fillStyle(0xB0BEC5);
    g.fillTriangle(20,30,32,10,44,30);
    g.generateTexture('bg_mountain',64,64);

    // Fondo chuches
    g.clear();
    g.fillStyle(0x880E4F);
    g.fillRect(0,0,64,64);
    g.fillStyle(0xAD1457);
    g.fillCircle(16,16,12);
    g.fillCircle(48,40,10);
    g.fillStyle(0xFF4081);
    g.fillCircle(16,16,6);
    g.generateTexture('bg_candy',64,64);

    // Fondo final (espacio)
    g.clear();
    g.fillStyle(0x0D0D2B);
    g.fillRect(0,0,64,64);
    g.fillStyle(0xFFFFFF);
    for(let i=0;i<12;i++){
      const sx=Math.floor(Math.random()*60);
      const sy=Math.floor(Math.random()*60);
      g.fillRect(sx,sy,2,2);
    }
    g.generateTexture('bg_final',64,64);

    g.destroy();
  }

  create(){
    this.time.delayedCall(200, ()=> this.scene.start('Menu'));
  }
}
