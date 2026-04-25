/**
 * RiskCalculator.js — Cálculo de riesgo en tiempo real v2.3
 * Fórmulas físicamente realistas basadas en desviación de parámetros nominales
 */

// ── CONSTANTES NOMINALES ─────────────────────────────────────────────────────
export const NOMINAL = {
  power: 1000,        // MW rated
  temperature: 300,   // K idle baseline
  tempOperating: 350, // K operating nominal
  tempMax: 600,       // K SCRAM limit
  pressure: 155,      // bar nominal
  pressureMax: 160,   // bar SCRAM limit
  pressureRelief: 155,// bar relief setpoint
  flow: 100,          // % nominal
};

// ── RIESGO POR PARÁMETRO ─────────────────────────────────────────────────────

/** Risk_Power = (P/P_max)^2 × 100 */
export function calcPowerRisk(power) {
  return Math.min(100, Math.pow(Math.max(0, power) / NOMINAL.power, 2) * 100);
}

/** Risk_Temperature = (T - T_baseline) / (T_max - T_baseline) × 100 */
export function calcTempRisk(temperature) {
  const deviation = Math.max(0, temperature - NOMINAL.temperature);
  const range = NOMINAL.tempMax - NOMINAL.temperature; // 300K range
  return Math.min(100, (deviation / range) * 100);
}

/** Risk_Pressure = (P - P_nominal) / (P_max - P_nominal) × 100 */
export function calcPressureRisk(pressure) {
  const deviation = Math.max(0, pressure - NOMINAL.pressure);
  const range = NOMINAL.pressureMax - NOMINAL.pressure; // 5 bar range
  return Math.min(100, (deviation / range) * 100);
}

/** Risk_Flow = (1 - flow/100)^2 × 100 */
export function calcFlowRisk(coolantFlow) {
  const deficit = Math.max(0, 1 - coolantFlow / 100);
  return Math.min(100, deficit * deficit * 100);
}

/** Riesgo total ponderado */
export function calcTotalRisk(risks) {
  return (
    0.30 * risks.power +
    0.40 * risks.temperature +
    0.20 * risks.pressure +
    0.10 * risks.flow
  );
}

/** Sistemas que están en alerta */
export function calcAlertedSystems(state, risks) {
  return {
    cooling:
      risks.temperature > 15 ||
      state.coolantFlow < 50 ||
      state.reliefValveOpen,
    relief:
      risks.pressure > 10 ||
      state.reliefValveOpen,
    control:
      risks.power > 20 ||
      Math.abs(state.reactividad) > 0.5,
    structural:
      risks.pressure > 30 || risks.temperature > 40,
  };
}

/** Etiqueta de nivel según % de riesgo */
export function getRiskLevel(risk) {
  if (risk > 60) return { label: 'CRÍTICO',  color: 'red',    barClass: 'bg-red-500',    textClass: 'text-red-400'    };
  if (risk > 30) return { label: 'ALTO',     color: 'orange', barClass: 'bg-orange-500', textClass: 'text-orange-400' };
  if (risk > 10) return { label: 'MODERADO', color: 'yellow', barClass: 'bg-yellow-500', textClass: 'text-yellow-400' };
  return         { label: 'BAJO',     color: 'green',  barClass: 'bg-green-500',  textClass: 'text-green-400'  };
}

/** Acción recomendada basada en estado de riesgos */
export function getRecommendedAction(risks, alertedSystems, state) {
  const total = calcTotalRisk(risks);
  if (total > 60 || state.emergencyShutdown) return 'Activar SCRAM de emergencia';
  if (total > 30) return 'Bajar potencia 2 escalones — insertar barras';
  if (risks.temperature > 30) return 'Insertar barras — reducir potencia gradualmente';
  if (risks.pressure > 30) return 'Reducir potencia — verificar válvula de alivio';
  if (alertedSystems.cooling && state.coolantFlow < 70) return 'Verificar bomba — activar respaldo';
  if (risks.power > 20) return 'Monitorear — un escalón a la vez';
  return 'Sistema estable — continuar monitoreando';
}

/** Calcular un snapshot de riesgos completo desde el estado del reactor */
export function calcFullRiskSnapshot(state) {
  const risks = {
    power:       calcPowerRisk(state.power),
    temperature: calcTempRisk(state.temperature),
    pressure:    calcPressureRisk(state.pressure),
    flow:        calcFlowRisk(state.coolantFlow),
  };
  const total = calcTotalRisk(risks);
  const alerted = calcAlertedSystems(state, risks);
  const level = getRiskLevel(total);
  const action = getRecommendedAction(risks, alerted, state);
  return { risks, total, alerted, level, action };
}
