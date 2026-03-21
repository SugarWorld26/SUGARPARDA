// ================================================================
//  db.js — Ranking Supabase. No tocar.
// ================================================================
const DB = {
  _c: null,

  init() {
    this._c = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
  },

  async save({ name, score, secs, tir, rng, level }) {
    if (!this._c) return;
    try {
      await this._c.from('ranking').insert({
        player_name:     name,
        score,
        time_seconds:    secs,
        time_in_range:   tir,
        rangazo_percent: rng,
        level,
      });
    } catch(e) { console.warn('DB.save:', e.message); }
  },

  async top(limit = 8) {
    if (!this._c) return [];
    try {
      const { data } = await this._c
        .from('ranking')
        .select('player_name,score,time_in_range,rangazo_percent')
        .order('score', { ascending: false })
        .limit(limit);
      return data || [];
    } catch(e) { return []; }
  },
};
