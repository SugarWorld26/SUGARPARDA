// ============================================================
//  GlucoseSystem.js — Toda la lógica de glucosa
//  Lee valores de CONFIG, nunca define los suyos propios.
// ============================================================

class GlucoseSystem {
  constructor() {
    this.value = CONFIG.GLUCOSE_START;
    this.activeEffects = [];  // [{type, amount, remaining_ms}]
    this.isHypo = false;
    this.isHyper = false;
  }

  reset() {
    this.value = CONFIG.GLUCOSE_START;
    this.activeEffects = [];
    this.isHypo = false;
    this.isHyper = false;
  }

  // Llamado cada frame por GameScene
  update(delta, isRunning, isFast, isJumping, isUphill) {
    const dt = delta / 1000; // convertir ms a segundos

    // 1. Bajada por movimiento
    if (isRunning) {
      const drop = isFast
        ? CONFIG.FAST_RUN_GLUCOSE_DROP_PER_SEC
        : CONFIG.RUNNING_GLUCOSE_DROP_PER_SEC;
      this.value -= drop * dt;
    }
    if (isUphill && isRunning) {
      this.value -= CONFIG.UPHILL_GLUCOSE_DROP_PER_SEC * dt;
    }

    // 2. Efectos activos (insulina lenta, manzana)
    this.activeEffects = this.activeEffects.filter(effect => {
      effect.remaining_ms -= delta;
      if (effect.type === 'insulin_slow') {
        this.value -= CONFIG.INSULIN_SLOW_DROP_PER_SEC * dt;
      } else if (effect.type === 'apple') {
        this.value += CONFIG.APPLE_RAISE_PER_SEC * dt;
      }
      return effect.remaining_ms > 0;
    });

    // 3. Clamp al rango absoluto
    this.value = Math.max(CONFIG.GLUCOSE_MIN, Math.min(CONFIG.GLUCOSE_MAX, this.value));

    // 4. Actualizar estados
    this.isHypo = this.value <= CONFIG.HYPO_THRESHOLD;
    this.isHyper = this.value >= CONFIG.HYPER_THRESHOLD;

    return this.value;
  }

  applyJump() {
    this.value -= CONFIG.JUMP_GLUCOSE_DROP;
  }

  applyEnemyHit(enemyType) {
    const raises = {
      lollipop:  CONFIG.ENEMY_LOLLIPOP_RAISE,
      cake:      CONFIG.ENEMY_CAKE_RAISE,
      chocolate: CONFIG.ENEMY_CHOCOLATE_RAISE,
      cupcake:   CONFIG.ENEMY_CUPCAKE_RAISE,
    };
    this.value += raises[enemyType] || 20;
  }

  applyInsulinSlow() {
    this.activeEffects.push({
      type: 'insulin_slow',
      remaining_ms: CONFIG.INSULIN_SLOW_DURATION,
    });
  }

  applyInsulinFast() {
    this.value -= CONFIG.INSULIN_FAST_DROP;
  }

  applyApple() {
    this.activeEffects.push({
      type: 'apple',
      remaining_ms: CONFIG.APPLE_DURATION,
    });
  }

  applyGlucagon() {
    this.value = CONFIG.GLUCAGON_GLUCOSE_RESTORE;
    this.activeEffects = this.activeEffects.filter(e => e.type !== 'insulin_slow');
  }

  getState() {
    const v = this.value;
    if (v <= CONFIG.HYPO_THRESHOLD)   return 'hypo';
    if (v < CONFIG.RANGE_LOW)         return 'low';
    if (v <= CONFIG.RANGAZO_LOW)      return 'in_range';
    if (v <= CONFIG.RANGAZO_HIGH)     return 'rangazo';
    if (v <= CONFIG.RANGE_HIGH)       return 'in_range';
    if (v < CONFIG.HYPER_THRESHOLD)   return 'high';
    return 'hyper';
  }

  getColor() {
    const state = this.getState();
    const map = {
      hypo:     CONFIG.COLOR_HYPO,
      low:      CONFIG.COLOR_WARNING,
      in_range: CONFIG.COLOR_IN_RANGE,
      rangazo:  CONFIG.COLOR_RANGAZO,
      high:     CONFIG.COLOR_WARNING,
      hyper:    CONFIG.COLOR_HYPER,
    };
    return map[state];
  }

  getLabel() {
    const state = this.getState();
    if (state === 'rangazo') return '★ RANGAZO';
    if (state === 'in_range') return 'EN RANGO';
    if (state === 'low') return '↓ BAJANDO';
    if (state === 'hypo') return '⚠ HIPO';
    if (state === 'high') return '↑ SUBIENDO';
    if (state === 'hyper') return '⚠ HIPER';
    return '';
  }
}
