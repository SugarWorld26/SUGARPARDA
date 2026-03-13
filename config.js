// ============================================================
//  SUGARPARDA — config.js
//  ⭐ ÚNICO FICHERO QUE NECESITAS EDITAR PARA CAMBIAR EL JUEGO
//  Cambia cualquier valor aquí y se aplica en todo el juego.
// ============================================================

const CONFIG = {

  // ──────────────────────────────────────────
  //  SUPABASE (ranking público)
  // ──────────────────────────────────────────
  SUPABASE_URL: 'https://hicrocsgqcfwilpuhqoo.supabase.co',
  SUPABASE_KEY: 'sb_publishable_2ppgnZ9CetTDMOY1g3XgFA_B8Ggb_l7',

  // ──────────────────────────────────────────
  //  PANTALLA
  // ──────────────────────────────────────────
  GAME_WIDTH: 800,
  GAME_HEIGHT: 450,

  // ──────────────────────────────────────────
  //  GLUCOSA
  // ──────────────────────────────────────────
  GLUCOSE_START: 100,       // Glucosa al inicio de cada nivel
  GLUCOSE_MIN: 20,          // Mínimo absoluto
  GLUCOSE_MAX: 400,         // Máximo absoluto

  RANGE_LOW: 80,            // Límite inferior rango saludable
  RANGE_HIGH: 130,          // Límite superior rango saludable

  RANGAZO_LOW: 90,          // Límite inferior RANGAZO
  RANGAZO_HIGH: 110,        // Límite superior RANGAZO

  HYPO_THRESHOLD: 50,       // Por debajo → desmayo
  HYPER_THRESHOLD: 180,     // Por encima → efectos visuales hiper

  // ──────────────────────────────────────────
  //  INSULINA
  // ──────────────────────────────────────────
  INSULIN_SLOW_DROP_PER_SEC: 3,    // mg/dL por segundo, insulina lenta
  INSULIN_SLOW_DURATION: 8000,     // ms que dura el efecto (acumulable)
  INSULIN_FAST_DROP: 40,           // mg/dL que baja de golpe la rápida
  INSULIN_FAST_MAX: 3,             // Dosis de insulina rápida por partida

  // ──────────────────────────────────────────
  //  MOVIMIENTO Y GLUCOSA
  // ──────────────────────────────────────────
  RUNNING_GLUCOSE_DROP_PER_SEC: 0.8,   // Bajada corriendo normal
  FAST_RUN_GLUCOSE_DROP_PER_SEC: 2.0,  // Bajada corriendo rápido (agitando)
  JUMP_GLUCOSE_DROP: 1.0,              // Bajada al saltar
  UPHILL_GLUCOSE_DROP_PER_SEC: 1.2,   // Bajada extra en cuesta arriba

  PLAYER_BASE_SPEED: 220,              // Velocidad base (px/seg)
  PLAYER_FAST_SPEED: 360,              // Velocidad al agitar el móvil
  FAST_RUN_DURATION: 3000,             // ms que dura el sprint por agitada
  SHAKE_THRESHOLD: 15,                 // Sensibilidad del acelerómetro (m/s²)

  PLAYER_JUMP_VELOCITY: -520,          // Fuerza del salto
  GRAVITY: 800,                        // Gravedad del mundo

  // ──────────────────────────────────────────
  //  ENEMIGOS — SUBIDA DE GLUCOSA AL IMPACTO
  // ──────────────────────────────────────────
  ENEMY_LOLLIPOP_RAISE: 15,    // Piruleta
  ENEMY_CAKE_RAISE: 30,        // Tarta
  ENEMY_CHOCOLATE_RAISE: 45,   // Chocolate
  ENEMY_CUPCAKE_RAISE: 25,     // Cupcake
  ENEMY_CUPCAKE_SLOW_MS: 2000, // ms que dura el efecto lentitud del cupcake

  // ──────────────────────────────────────────
  //  ÍTEMS
  // ──────────────────────────────────────────
  APPLE_GLUCOSE_RAISE: 20,         // mg/dL que sube la manzana (gradual)
  APPLE_RAISE_PER_SEC: 4,          // mg/dL por segundo que sube
  APPLE_DURATION: 5000,            // ms que dura el efecto
  GLUCAGON_MAX: 2,                 // Glucagones por partida
  GLUCAGON_GLUCOSE_RESTORE: 80,    // A qué nivel sube la glucosa el glucagón

  // ──────────────────────────────────────────
  //  PUNTUACIÓN
  // ──────────────────────────────────────────
  SCORE_RANGAZO: 100,          // Puntos por checkpoint en RANGAZO (90-110)
  SCORE_IN_RANGE: 60,          // Puntos por checkpoint en rango (80-130)
  SCORE_OUT_OF_RANGE: 10,      // Puntos por checkpoint fuera de rango
  SCORE_SPEED_BONUS_MAX: 500,  // Máximo bonus por velocidad
  SCORE_SPEED_TIME_REF: 90,    // Segundos de referencia para el bonus

  // ──────────────────────────────────────────
  //  COLORES HUD (glucómetro)
  // ──────────────────────────────────────────
  COLOR_RANGAZO:    0x1B5E20,   // Verde oscuro brillante
  COLOR_IN_RANGE:   0x4CAF50,   // Verde
  COLOR_WARNING:    0xFFC107,   // Amarillo (bajando hacia hipo)
  COLOR_HYPO:       0x1565C0,   // Azul (hipoglucemia)
  COLOR_HYPER:      0xE53935,   // Rojo (hiperglucemia)

  COLOR_INSULIN_SLOW:  0x4CAF50,  // Verde (insulina lenta)
  COLOR_INSULIN_FAST:  0xFF6F00,  // Naranja (insulina rápida)

  // ──────────────────────────────────────────
  //  NIVELES
  // ──────────────────────────────────────────
  LEVELS: [
    {
      id: 1,
      name: 'Ciudad',
      bgColor: 0x87CEEB,         // Color de fondo del nivel
      groundColor: 0x8B6914,
      platformColor: 0x607D8B,
      music: null,               // 'city_theme' cuando tengas audio
      checkpoints: 4,
      apples: 3,
      glucagons: 2,
      enemies: ['lollipop', 'cake'],
      enemyDensity: 0.4,
      levelLength: 6000,         // px de longitud del nivel
      scrollSpeed: 180,
      uphillZones: [             // Zonas de cuesta arriba [inicio_px, fin_px]
        [1500, 2000],
        [3500, 4200],
      ],
    },
    {
      id: 2,
      name: 'Bosque',
      bgColor: 0x2E7D32,
      groundColor: 0x4E342E,
      platformColor: 0x388E3C,
      music: null,
      checkpoints: 5,
      apples: 2,
      glucagons: 2,
      enemies: ['lollipop', 'cake', 'chocolate'],
      enemyDensity: 0.55,
      levelLength: 7000,
      scrollSpeed: 200,
      uphillZones: [
        [1000, 1800],
        [4000, 5000],
      ],
    },
    {
      id: 3,
      name: 'Montaña',
      bgColor: 0x90A4AE,
      groundColor: 0x546E7A,
      platformColor: 0x78909C,
      music: null,
      checkpoints: 5,
      apples: 2,
      glucagons: 1,
      enemies: ['cake', 'chocolate', 'cupcake'],
      enemyDensity: 0.65,
      levelLength: 7500,
      scrollSpeed: 220,
      uphillZones: [
        [500, 1500],
        [2500, 3500],
        [5000, 6500],
      ],
    },
    {
      id: 4,
      name: 'Mundo Chuches',
      bgColor: 0xF48FB1,
      groundColor: 0xAD1457,
      platformColor: 0xE91E63,
      music: null,
      checkpoints: 6,
      apples: 1,
      glucagons: 1,
      enemies: ['lollipop', 'cake', 'chocolate', 'cupcake'],
      enemyDensity: 0.8,
      levelLength: 8000,
      scrollSpeed: 240,
      uphillZones: [
        [1000, 2000],
        [3000, 4000],
        [5500, 7000],
      ],
    },
    {
      id: 5,
      name: 'Final',
      bgColor: 0x1A237E,
      groundColor: 0x283593,
      platformColor: 0x3949AB,
      music: null,
      checkpoints: 6,
      apples: 1,
      glucagons: 1,
      enemies: ['lollipop', 'cake', 'chocolate', 'cupcake'],
      enemyDensity: 0.9,
      levelLength: 9000,
      scrollSpeed: 260,
      uphillZones: [
        [800, 2000],
        [3000, 4500],
        [6000, 8000],
      ],
    },
  ],
};
