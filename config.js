// ================================================================
//  config.js — ÚNICA FUENTE DE VERDAD
//  Cambia cualquier valor aquí. Nunca en otro fichero.
// ================================================================
const CONFIG = {

  // ── Supabase ────────────────────────────────────────────────
  SUPABASE_URL: 'https://hicrocsgqcfwilpuhqoo.supabase.co',
  SUPABASE_KEY: 'sb_publishable_2ppgnZ9CetTDMOY1g3XgFA_B8Ggb_l7',

  // ── Pantalla (no cambiar) ────────────────────────────────────
  W: 800,
  H: 450,

  // ── Física ──────────────────────────────────────────────────
  GRAVITY:      900,
  JUMP_VY:     -520,   // velocidad vertical al saltar

  // ── Velocidad jugadora ───────────────────────────────────────
  SPD_NORMAL:   230,   // px/s corriendo normal
  SPD_FAST:     380,   // px/s corriendo rápido (agitando)
  SPD_SLOW:      90,   // px/s tras impacto cupcake
  FAST_MS:     3000,   // duración del sprint en ms
  SHAKE_G:       14,   // umbral acelerómetro (m/s²)

  // ── Glucosa ──────────────────────────────────────────────────
  GLUCOSE_INIT:    100,
  GLUCOSE_MIN:      20,
  GLUCOSE_MAX:     400,
  RANGE_LO:         80,   // límite inferior rango saludable
  RANGE_HI:        130,   // límite superior rango saludable
  RANGAZO_LO:       90,   // RANGAZO inferior
  RANGAZO_HI:      110,   // RANGAZO superior
  HYPO_THRESH:      50,   // por debajo → desmayo
  HYPER_THRESH:    180,   // por encima → overlay rojo

  // caídas de glucosa por movimiento (mg/dL por segundo)
  DROP_RUN:        0.7,
  DROP_FAST:       1.8,
  DROP_JUMP:       1.2,  // caída al saltar (instantánea)

  // ── Insulina ─────────────────────────────────────────────────
  INS_SLOW_DPS:    3,     // mg/dL/s insulina lenta
  INS_SLOW_MS:  8000,     // duración efecto
  INS_FAST_DROP:  40,     // caída instantánea insulina rápida
  INS_FAST_MAX:    3,     // dosis disponibles por partida

  // ── Enemigos ─────────────────────────────────────────────────
  ENEMY_RAISE: {
    lollipop: 15,
    cake:     30,
    choco:    45,
    cupcake:  25,
  },
  CUPCAKE_SLOW_MS: 2000, // duración efecto lentitud

  // ── Ítems ────────────────────────────────────────────────────
  APPLE_DPS:     4,      // mg/dL/s que sube la manzana
  APPLE_MS:   5000,      // duración
  GLUCAGON_MAX:  2,      // glucagones por partida
  GLUCAGON_VAL: 80,      // glucosa al usar glucagón

  // ── Puntuación ───────────────────────────────────────────────
  PTS_RANGAZO:   100,
  PTS_IN_RANGE:   60,
  PTS_OUT:        10,
  SPEED_BONUS:   500,    // máximo bonus velocidad
  SPEED_REF_S:    90,    // segundos de referencia para el bonus

  // ── Suelo ────────────────────────────────────────────────────
  GROUND_Y:      390,    // Y del borde superior del suelo
  GROUND_H:       60,    // altura del bloque de suelo

  // ── Niveles ──────────────────────────────────────────────────
  LEVELS: [
    {
      id: 1, name: 'Ciudad',
      skyColor:   0x87CEEB,
      groundColor:0x607D8B,
      groundEdge: 0x90A4AE,
      enemyTypes: ['lollipop', 'cake'],
      enemySpd:   80,
      density:    0.45,
      checkpoints:4,
      apples:     3,
      glucagons:  2,
      length:     7000,
      holePct:    0.06,
    },
    {
      id: 2, name: 'Bosque',
      skyColor:   0x2E7D32,
      groundColor:0x4E342E,
      groundEdge: 0x7CB342,
      enemyTypes: ['lollipop', 'cake', 'choco'],
      enemySpd:   100,
      density:    0.60,
      checkpoints:5,
      apples:     2,
      glucagons:  2,
      length:     8000,
      holePct:    0.08,
    },
    {
      id: 3, name: 'Montaña',
      skyColor:   0x78909C,
      groundColor:0x455A64,
      groundEdge: 0xB0BEC5,
      enemyTypes: ['cake', 'choco', 'cupcake'],
      enemySpd:   120,
      density:    0.70,
      checkpoints:5,
      apples:     2,
      glucagons:  1,
      length:     8500,
      holePct:    0.10,
    },
    {
      id: 4, name: 'Mundo Chuches',
      skyColor:   0xF48FB1,
      groundColor:0xAD1457,
      groundEdge: 0xFF80AB,
      enemyTypes: ['lollipop', 'cake', 'choco', 'cupcake'],
      enemySpd:   140,
      density:    0.80,
      checkpoints:6,
      apples:     1,
      glucagons:  1,
      length:     9000,
      holePct:    0.12,
    },
    {
      id: 5, name: 'Nivel Final',
      skyColor:   0x0D0D2B,
      groundColor:0x1A237E,
      groundEdge: 0x3949AB,
      enemyTypes: ['lollipop', 'cake', 'choco', 'cupcake'],
      enemySpd:   160,
      density:    0.90,
      checkpoints:6,
      apples:     1,
      glucagons:  1,
      length:     10000,
      holePct:    0.14,
    },
  ],
};
