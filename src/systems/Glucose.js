// ================================================================
//  Glucose.js — Sistema de glucosa puro.
//  Sin dependencias de Phaser. Testeable de forma aislada.
// ================================================================
class Glucose {
  constructor() { this.reset(); }

  reset() {
    this.v         = CONFIG.GLUCOSE_INIT;
    this._slowEnd  = 0;
    this._appleEnd = 0;
  }

  // Llamado cada frame con delta en segundos
  tick(dt, running, fast, slope = false) {
    if (running) {
      this.v -= (fast ? CONFIG.DROP_FAST : CONFIG.DROP_RUN) * dt;
    }
    // Cuesta arriba — esfuerzo extra baja más la glucosa
    if (slope && running) {
      this.v -= CONFIG.DROP_SLOPE * dt;
    }
    const now = performance.now();
    if (now < this._slowEnd) this.v -= CONFIG.INS_SLOW_DPS * dt;
    this.v = Math.max(CONFIG.GLUCOSE_MIN, Math.min(CONFIG.GLUCOSE_MAX, this.v));
  }

  onJump()         { this.v -= CONFIG.DROP_JUMP; }
  onEnemyHit(type) { this.v += CONFIG.ENEMY_RAISE[type] || 20; }
  useSlowInsulin() { this._slowEnd  = performance.now() + CONFIG.INS_SLOW_MS; }
  useFastInsulin() { this.v -= CONFIG.INS_FAST_DROP; }
  eatApple()       { this.v += CONFIG.APPLE_RAISE; }
  useGlucagon()    { this.v = CONFIG.GLUCAGON_VAL; this._slowEnd = 0; }

  get state() {
    const v = this.v;
    if (v <= CONFIG.HYPO_THRESH)                              return 'hypo';
    if (v <  CONFIG.RANGE_LO)                                 return 'low';
    if (v >= CONFIG.RANGAZO_LO && v <= CONFIG.RANGAZO_HI)     return 'rangazo';
    if (v <= CONFIG.RANGE_HI)                                 return 'range';
    if (v <  CONFIG.HYPER_THRESH)                             return 'high';
    return 'hyper';
  }

  get color() {
    return {
      hypo:   '#1E88E5',
      low:    '#FDD835',
      rangazo:'#1B5E20',
      range:  '#43A047',
      high:   '#FDD835',
      hyper:  '#E53935',
    }[this.state];
  }

  get label() {
    return {
      hypo:   '⚠ HIPO',
      low:    '↓ BAJANDO',
      rangazo:'★ RANGAZO',
      range:  'EN RANGO',
      high:   '↑ SUBIENDO',
      hyper:  '⚠ HIPER',
    }[this.state];
  }

  get isHypo()  { return this.v <= CONFIG.HYPO_THRESH; }
  get isHyper() { return this.v >= CONFIG.HYPER_THRESH; }
}
