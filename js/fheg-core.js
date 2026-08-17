/* ==========================================================================
   FHEG MATHEMATICAL CORE ENGINE
   ========================================================================== */

const FHEG_Math = {
  // Haversine formula to compute great-circle distance between two GPS coordinates (meters)
  haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = deg => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  // Road slope s_e = (z_j - z_i) / L_e
  calculateSlope(zi, zj, lengthMeters) {
    if (lengthMeters <= 0) return 0;
    return (zj - zi) / lengthMeters;
  },

  // Flood Hazard Function H_e = h_e(v_e + 0.5) + D_e
  calculateHazard(he, ve, De) {
    return he * (ve + 0.5) + De;
  },

  // Feasibility Check (e in E_F <=> H_e < Hc)
  isFeasible(He, Hc = CONFIG.Hc) {
    return He < Hc;
  },

  // Hazard Attenuation Function \phi_p(H_e)
  hazardAttenuation(He, p = CONFIG.defaultP, H0 = CONFIG.H0, Hc = CONFIG.Hc) {
    if (He <= H0) return 1.0;
    if (He >= Hc) return 0.0;
    return Math.pow((Hc - He) / (Hc - H0), p);
  },

  // Tobler's Hiking Function for slope-dependent walking speed (m/min)
  toblerSpeed(slope) {
    // V_T = 6 * exp(-3.5 * |s + 0.05|) in km/h -> m/min
    const kmh = 6.0 * Math.exp(-3.5 * Math.abs(slope + 0.05));
    const clampedKmh = Math.max(0.6, Math.min(6.5, kmh));
    return (clampedKmh * 1000) / 60;
  },

  // Effective walking speed u_e = V_T(s_e) * \phi_p(H_e) (m/min)
  effectiveSpeed(slope, He, p) {
    const base = this.toblerSpeed(slope);
    const phi = this.hazardAttenuation(He, p);
    return Math.max(6.0, base * phi);
  },

  // Travel time t_e = L_e / u_e (minutes)
  calculateTravelTime(lengthMeters, uSpeedMPerMin) {
    if (uSpeedMPerMin <= 0) return Infinity;
    return lengthMeters / uSpeedMPerMin;
  },

  // Risk-equivalent time term r_e
  calculateRiskTerm(te, He, q = CONFIG.defaultQ, Hc = CONFIG.Hc) {
    if (He <= 0.05) return 0.01;
    if (He >= Hc) return Infinity;
    const factor = Math.pow(He / (Hc - Math.min(He, Hc - 0.05)), q);
    return te * factor * 0.45;
  },

  // FHEG Edge Weight w_e(\lambda) = t_e + \lambda * r_e
  calculateEdgeWeight(te, re, lambda) {
    if (!isFinite(te) || !isFinite(re)) return Infinity;
    return te + lambda * re;
  }
};
