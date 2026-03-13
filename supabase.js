// ============================================================
//  supabase.js — Ranking público
// ============================================================

const SupabaseRanking = {
  client: null,

  init() {
    this.client = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
  },

  async saveScore({ playerName, score, timeSeconds, timeInRange, rangazoPercent, level }) {
    try {
      const { error } = await this.client.from('ranking').insert({
        player_name: playerName,
        score,
        time_seconds: timeSeconds,
        time_in_range: timeInRange,
        rangazo_percent: rangazoPercent,
        level,
      });
      if (error) console.error('Error guardando puntuación:', error);
    } catch (e) {
      console.error('Error de red al guardar:', e);
    }
  },

  async getTopScores(limit = 10) {
    try {
      const { data, error } = await this.client
        .from('ranking')
        .select('player_name, score, time_in_range, rangazo_percent, level, created_at')
        .order('score', { ascending: false })
        .limit(limit);
      if (error) return [];
      return data || [];
    } catch (e) {
      return [];
    }
  },
};
