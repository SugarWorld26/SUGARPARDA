// ============================================================
//  ScoreSystem.js — Cálculo de puntuación
// ============================================================

class ScoreSystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.totalScore = 0;
    this.checkpointScores = [];
    this.startTime = Date.now();
    this.finishTime = null;
  }

  recordCheckpoint(glucoseValue) {
    const state = this._getGlucoseState(glucoseValue);
    let points = 0;
    if (state === 'rangazo')  points = CONFIG.SCORE_RANGAZO;
    else if (state === 'in_range') points = CONFIG.SCORE_IN_RANGE;
    else points = CONFIG.SCORE_OUT_OF_RANGE;

    this.checkpointScores.push({ glucoseValue, state, points });
    this.totalScore += points;
    return points;
  }

  recordFinish() {
    this.finishTime = Date.now();
    const elapsed = (this.finishTime - this.startTime) / 1000;
    const bonus = Math.max(0, Math.round(
      CONFIG.SCORE_SPEED_BONUS_MAX * (CONFIG.SCORE_SPEED_TIME_REF / Math.max(elapsed, 1))
    ));
    const cappedBonus = Math.min(bonus, CONFIG.SCORE_SPEED_BONUS_MAX);
    this.totalScore += cappedBonus;
    return cappedBonus;
  }

  getElapsedSeconds() {
    const end = this.finishTime || Date.now();
    return Math.floor((end - this.startTime) / 1000);
  }

  getTimeInRangePercent() {
    if (this.checkpointScores.length === 0) return 0;
    const inRange = this.checkpointScores.filter(
      c => c.state === 'in_range' || c.state === 'rangazo'
    ).length;
    return Math.round((inRange / this.checkpointScores.length) * 100);
  }

  getRangazoPercent() {
    if (this.checkpointScores.length === 0) return 0;
    const rangazo = this.checkpointScores.filter(c => c.state === 'rangazo').length;
    return Math.round((rangazo / this.checkpointScores.length) * 100);
  }

  _getGlucoseState(v) {
    if (v >= CONFIG.RANGAZO_LOW && v <= CONFIG.RANGAZO_HIGH) return 'rangazo';
    if (v >= CONFIG.RANGE_LOW && v <= CONFIG.RANGE_HIGH) return 'in_range';
    return 'out_of_range';
  }
}
