class Score {
  constructor(refSecs) {
    this.total  = 0;
    this._cps   = [];
    this._t0    = performance.now();
    this._t1    = null;
    // Tiempo de referencia: cuánto tardarías a velocidad normal
    // Si terminas más rápido (sprint) obtienes bonus, si tardas más, menos bonus
    this._refSecs = refSecs || CONFIG.SPEED_REF_S;
  }

  checkpoint(glucoseValue) {
    const s  = this._classify(glucoseValue);
    const pt = s === 'rangazo' ? CONFIG.PTS_RANGAZO
             : s === 'range'   ? CONFIG.PTS_IN_RANGE
             : CONFIG.PTS_OUT;
    this._cps.push(s);
    this.total += pt;
    return { pts: pt, state: s };
  }

  finish() {
    this._t1 = performance.now();
    const secs  = this.elapsedSecs;
    // Bonus solo si llegas ANTES del tiempo de referencia (por haber sprintado)
    // Si llegas en el tiempo normal o más, bonus = 0
    const bonus = secs >= this._refSecs ? 0 : Math.round(
      CONFIG.SPEED_BONUS * (this._refSecs - secs) / this._refSecs
    );
    this.total += bonus;
    return bonus;
  }

  get elapsedSecs() {
    return Math.floor(((this._t1 || performance.now()) - this._t0) / 1000);
  }

  get timeInRange() {
    if (!this._cps.length) return 0;
    const n = this._cps.filter(s => s === 'rangazo' || s === 'range').length;
    return Math.round(n / this._cps.length * 100);
  }

  get rangazoPct() {
    if (!this._cps.length) return 0;
    return Math.round(this._cps.filter(s => s === 'rangazo').length / this._cps.length * 100);
  }

  _classify(v) {
    if (v >= CONFIG.RANGAZO_LO && v <= CONFIG.RANGAZO_HI) return 'rangazo';
    if (v >= CONFIG.RANGE_LO   && v <= CONFIG.RANGE_HI)   return 'range';
    return 'out';
  }
}
