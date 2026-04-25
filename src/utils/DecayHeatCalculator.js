/**
 * Decay Heat Calculator — Wigner-Way approximation for post-SCRAM residual heat.
 * After shutdown, fission products continue decaying and emitting heat (~7% of rated power).
 */
export class DecayHeatCalculator {
  // P(t) = P0 × 0.07 × (10/(10+t))^0.2  (Wigner-Way formula)
  static calculateDecayHeat(timeSinceSCRAM_s, originalPower_MW) {
    if (originalPower_MW <= 0 || timeSinceSCRAM_s < 0) return 0;
    const P0 = originalPower_MW * 0.07;
    return P0 * Math.pow(10 / (10 + timeSinceSCRAM_s), 0.2);
  }

  // Temperature cooling rate in K/s given coolant flow %
  static coolingRate(coolantFlow_pct) {
    if (coolantFlow_pct < 30) return 0;
    return (coolantFlow_pct / 100) * 8;
  }

  // Temperature rise rate in K/s without cooling (from residual heat)
  static heatingRate(residualHeat_MW) {
    return Math.min(5, residualHeat_MW / 20);
  }

  // Project future temperatures WITH active cooling (array of K values, one per dtPerStep seconds)
  static projectCooling(startTemp_K, coolantFlow_pct, steps = 60, dtPerStep = 5) {
    const points = [startTemp_K];
    let temp = startTemp_K;
    const rate = DecayHeatCalculator.coolingRate(coolantFlow_pct);
    for (let i = 0; i < steps; i++) {
      temp = Math.max(290, temp - rate * dtPerStep);
      points.push(temp);
    }
    return points;
  }

  // Project future temperatures WITHOUT cooling (potential meltdown scenario)
  static projectMeltdown(startTemp_K, residualHeat_MW, steps = 60, dtPerStep = 5) {
    const points = [startTemp_K];
    let temp = startTemp_K;
    let heat = residualHeat_MW;
    for (let i = 0; i < steps; i++) {
      const rate = DecayHeatCalculator.heatingRate(heat);
      temp = Math.min(3000, temp + rate * dtPerStep);
      heat *= 0.998;
      points.push(temp);
    }
    return points;
  }

  // Returns seconds until temperature reaches targetTemp with active cooling
  static timeToReachTarget(currentTemp_K, targetTemp_K = 350, coolantFlow_pct = 100) {
    if (currentTemp_K <= targetTemp_K) return 0;
    const rate = DecayHeatCalculator.coolingRate(coolantFlow_pct);
    if (rate <= 0) return Infinity;
    return (currentTemp_K - targetTemp_K) / rate;
  }
}
