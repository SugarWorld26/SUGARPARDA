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
  JUMP_VY:     -520,

  // ── Velocidad jugadora ───────────────────────────────────────
  SPD_NORMAL:   230,
  SPD_FAST:     380,
  SPD_SLOW:      90,
  FAST_MS:     3000,
  SHAKE_G:       14,

  // ── Glucosa ──────────────────────────────────────────────────
  GLUCOSE_INIT:    100,
  GLUCOSE_MIN:      20,
  GLUCOSE_MAX:     400,
  RANGE_LO:         80,
  RANGE_HI:        130,
  RANGAZO_LO:       90,
  RANGAZO_HI:      110,
  HYPO_THRESH:      50,
  HYPER_THRESH:    180,

  // caídas de glucosa por movimiento (mg/dL por segundo)
  DROP_RUN:        3.5,
DROP_FAST:       6.0,
DROP_JUMP:       4.0,
DROP_SLOPE:      5.0,

  // ── Insulina ─────────────────────────────────────────────────
  INS_SLOW_DPS:    2,
  INS_SLOW_MS:  8000,
  INS_FAST_DROP:  40,
  INS_FAST_MAX:    3,

  // ── Enemigos ─────────────────────────────────────────────────
  ENEMY_RAISE: {
    lollipop: 25,
    cake:     45,
    choco:    65,
    cupcake:  35,
  },
  CUPCAKE_SLOW_MS: 2000,

  // ── Ítems ────────────────────────────────────────────────────
  APPLE_DPS:     4,
  APPLE_MS:   5000,
  GLUCAGON_MAX:  2,
  GLUCAGON_VAL: 80,

  // ── Puntuación ───────────────────────────────────────────────
  PTS_RANGAZO:   100,
  PTS_IN_RANGE:   60,
  PTS_OUT:        10,
  SPEED_BONUS:   500,
  SPEED_REF_S:    90,

  // ── Suelo ────────────────────────────────────────────────────
  GROUND_Y:      390,
  GROUND_H:       60,

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
      slopePct:   0.55,
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
      slopePct:   0.60,
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
      slopePct:   0.65,
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
      slopePct:   0.70,
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
      slopePct:   0.75,
    },
  ],
};
