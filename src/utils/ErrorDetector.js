/**
 * ErrorDetector — monitors reactor state each simulation tick and fires
 * structured educational error objects when unsafe conditions are detected.
 *
 * Each error fires once per "episode" (condition onset → condition recovery → onset again).
 * Errors do not fire while emergencyShutdown is active.
 */
export class ErrorDetector {
  constructor() {
    this._powerSamples = [];    // { time, power }[]  — rolling 10-second window
    this._tempHighSince = null; // sim time when T first exceeded threshold
    this._lowFlowSince  = null; // sim time when flow first dropped below 30%
    this._highPressSince = null;// sim time when P first exceeded threshold

    // Per-episode tracking: once fired, won't re-fire until condition clears
    this._episodeFired = new Set();

    // Track operationLog length to detect new operator actions
    this._lastLogLen = 0;
    this._lastOpSimTime = -999;
  }

  reset() {
    this._powerSamples    = [];
    this._tempHighSince   = null;
    this._lowFlowSince    = null;
    this._highPressSince  = null;
    this._episodeFired    = new Set();
    this._lastLogLen      = 0;
    this._lastOpSimTime   = -999;
  }

  /**
   * Call each simulation tick. Returns a single error object or null.
   * @param {object} state  — result of ReactorSimulator.getState()
   * @param {number} simTime — current simulation time in seconds
   */
  update(state, simTime) {
    if (state.emergencyShutdown) {
      // Clear all tracking while reactor is in shutdown — avoid ghost errors on recovery
      this._tempHighSince   = null;
      this._lowFlowSince    = null;
      this._highPressSince  = null;
      this._episodeFired.clear();
      return null;
    }

    // ── Track operator actions ──────────────────────────────────────────
    const logLen = state.operationLog?.length ?? 0;
    if (logLen > this._lastLogLen) {
      this._lastLogLen    = logLen;
      this._lastOpSimTime = simTime;
    }

    // ── Rolling power history ──────────────────────────────────────────
    this._powerSamples.push({ time: simTime, power: state.power });
    // Keep last 10 seconds only
    const cutoff = simTime - 10;
    let i = 0;
    while (i < this._powerSamples.length && this._powerSamples[i].time < cutoff) i++;
    if (i > 0) this._powerSamples = this._powerSamples.slice(i);

    // ── Condition onset/clear tracking ────────────────────────────────
    if (state.temperature > 550) {
      if (this._tempHighSince === null) this._tempHighSince = simTime;
    } else {
      if (this._tempHighSince !== null) {
        this._tempHighSince = null;
        this._episodeFired.delete('TEMPERATURE_IGNORED');
      }
    }

    if (state.coolantFlow < 30) {
      if (this._lowFlowSince === null) this._lowFlowSince = simTime;
    } else {
      if (this._lowFlowSince !== null) {
        this._lowFlowSince = null;
        this._episodeFired.delete('LOW_COOLANT_FLOW');
      }
    }

    if (state.pressure > 155 && !state.reliefValveOpen) {
      if (this._highPressSince === null) this._highPressSince = simTime;
    } else {
      if (this._highPressSince !== null) {
        this._highPressSince = null;
        this._episodeFired.delete('PRESSURE_HIGH');
      }
    }

    return this._checkErrors(state, simTime);
  }

  _checkErrors(state, simTime) {
    // Priority order: most dangerous first

    // ── ERROR 1: Low coolant flow (most immediately dangerous) ────────
    if (
      this._lowFlowSince !== null &&
      (simTime - this._lowFlowSince) > 5 &&
      !this._episodeFired.has('LOW_COOLANT_FLOW')
    ) {
      this._episodeFired.add('LOW_COOLANT_FLOW');
      return this._buildLowFlowError(state);
    }

    // ── ERROR 2: Temperature ignored ──────────────────────────────────
    if (
      this._tempHighSince !== null &&
      (simTime - this._tempHighSince) > 5 &&
      (simTime - this._lastOpSimTime) > 5 && // no action in last 5s
      !this._episodeFired.has('TEMPERATURE_IGNORED')
    ) {
      this._episodeFired.add('TEMPERATURE_IGNORED');
      return this._buildTempIgnoredError(state, simTime - this._tempHighSince);
    }

    // ── ERROR 3: Pressure high without relief valve ───────────────────
    if (
      this._highPressSince !== null &&
      (simTime - this._highPressSince) > 5 &&
      !this._episodeFired.has('PRESSURE_HIGH')
    ) {
      this._episodeFired.add('PRESSURE_HIGH');
      return this._buildPressureError(state);
    }

    // ── ERROR 4: Rapid power ramp ─────────────────────────────────────
    if (this._powerSamples.length >= 2) {
      const oldest = this._powerSamples[0];
      const newest = this._powerSamples[this._powerSamples.length - 1];
      const deltaP = newest.power - oldest.power;
      const deltaT = Math.max(0.1, newest.time - oldest.time);
      // > 200 MW in 10 seconds while already above 200 MW
      if (deltaP > 200 && oldest.power > 200 && !this._episodeFired.has('POWER_RAMP_TOO_FAST')) {
        this._episodeFired.add('POWER_RAMP_TOO_FAST');
        // Auto-clear after 15 seconds so it can fire again on next deliberate ramp
        setTimeout(() => this._episodeFired.delete('POWER_RAMP_TOO_FAST'), 15000);
        return this._buildPowerRampError(state, deltaP, deltaT);
      }
    }

    return null;
  }

  // ── Error constructors ───────────────────────────────────────────────

  _buildPowerRampError(state, deltaP, deltaT) {
    const rate = (deltaP / deltaT * 60).toFixed(0);
    return {
      type: 'POWER_RAMP_TOO_FAST',
      severity: 'error',
      icon: '⚡',
      title: 'Rampa de Potencia Excesiva',
      whatHappened: `La potencia subió ${deltaP.toFixed(0)} MW en ${deltaT.toFixed(0)} segundos (${rate} MW/min). Este ritmo supera los límites operacionales seguros.`,
      whyError: 'En una central nuclear real, la tasa máxima de aumento de potencia es 2–5% por minuto (≈ 40–100 MW/min para nuestro reactor). Rampas rápidas generan estrés térmico en el combustible, picos de presión en el circuito primario, y transitorios que el operador no puede controlar a tiempo. La física tiene inercia — potencia sube en segundos, temperatura tarda minutos.',
      consequences: [
        `Temperatura actual: ${state.temperature.toFixed(0)} K (tendencia ascendente)`,
        `Presión actual: ${state.pressure.toFixed(1)} bar — puede subir 10–20 bar más`,
        'La válvula de alivio puede abrirse, reduciendo flujo de refrigerante',
        'Si la temperatura supera 550 K: SCRAM automático en ~20 segundos',
      ],
      whatToDo: [
        '1. Inserta barras de control gradualmente (slider o BARRAS+)',
        '2. Objetivo: bajar potencia a menos de 800 MW',
        '3. Espera 30–60 segundos entre ajustes',
        '4. Observa la tendencia en los gráficos antes de actuar de nuevo',
        '5. Regla de oro: máximo un ajuste por minuto en operación estable',
      ],
      historicalCaseKey: 'THREE_MILE_ISLAND',
      params: { power: state.power, temperature: state.temperature, pressure: state.pressure, flow: state.coolantFlow },
    };
  }

  _buildTempIgnoredError(state, duration) {
    return {
      type: 'TEMPERATURE_IGNORED',
      severity: 'critical',
      icon: '🌡️',
      title: '¡Temperatura Crítica Sin Respuesta!',
      whatHappened: `La temperatura lleva ${duration.toFixed(0)} segundos por encima de 550 K sin intervención del operador. Temperatura actual: ${state.temperature.toFixed(0)} K.`,
      whyError: 'A 550 K, el combustible de UO₂ está cerca de su punto de reblandecimiento. Si la temperatura sigue subiendo sin corrección, a 600 K el sistema dispara SCRAM automático — pero para entonces la temperatura del núcleo puede estar muy por encima del límite del revestimiento (zircaloy). En un reactor real, 5 segundos de inacción en una condición de alerta es demasiado.',
      consequences: [
        'Combustible: posible deformación del zircaloy (revestimiento)',
        `Temperatura del centro del núcleo: ~${(state.temperature * 1.14).toFixed(0)} K (zona central)`,
        'SCRAM automático a 600 K — la reacción se detendrá',
        'Presión continuará subiendo incluso después del SCRAM (calor residual)',
      ],
      whatToDo: [
        '1. AHORA: presiona BARRAS+ o sube el slider de barras',
        '2. Si T > 590 K: activa SCRAM manual (más rápido)',
        '3. Verifica que la bomba está ON y flujo al 100%',
        '4. Después de bajar T: espera estabilización (60 segundos)',
        '5. En el futuro: actúa cuando T supere 500 K, no 550 K',
      ],
      historicalCaseKey: 'FUKUSHIMA',
      params: { power: state.power, temperature: state.temperature, pressure: state.pressure, flow: state.coolantFlow },
    };
  }

  _buildLowFlowError(state) {
    return {
      type: 'LOW_COOLANT_FLOW',
      severity: 'critical',
      icon: '💧',
      title: 'Flujo de Refrigerante Crítico',
      whatHappened: `El flujo de refrigerante cayó a ${state.coolantFlow.toFixed(0)}% — por debajo del mínimo de seguridad (30%). El núcleo está perdiendo su capacidad de enfriamiento.`,
      whyError: 'El refrigerante es la única barrera entre la energía de fisión y la fusión del combustible. Con flujo < 30%, la transferencia de calor es insuficiente para mantener el combustible por debajo de su temperatura de fusión (~2800°C para UO₂). La temperatura sube exponencialmente sin refrigeración. El SCRAM detendrá la fisión, pero el calor residual (7% de potencia nominal) seguirá requiriendo enfriamiento durante horas.',
      consequences: [
        'SCRAM automático se activa al llegar al 30%',
        `Temperatura subiendo: ${state.temperature.toFixed(0)} K → puede superar 600 K en segundos`,
        'Sin corrección: inicio de daño al combustible (LOCA inminente)',
        'Calor residual continuará aunque SCRAM se active',
      ],
      whatToDo: [
        '1. INMEDIATO: verifica si la bomba está ON (pulsa BOMBA si está OFF)',
        '2. Si hay fallo de bomba: activa SCRAM manual ahora mismo',
        '3. No hay tiempo para reducir potencia primero — SCRAM primero',
        '4. La recuperación puede tardar 5–10 minutos después del SCRAM',
        '5. En operación normal: monitorea flujo > 80% siempre',
      ],
      historicalCaseKey: 'CHERNOBYL',
      params: { power: state.power, temperature: state.temperature, pressure: state.pressure, flow: state.coolantFlow },
    };
  }

  _buildPressureError(state) {
    return {
      type: 'PRESSURE_HIGH',
      severity: 'warning',
      icon: '⚠️',
      title: 'Presión Alta — Válvula de Alivio',
      whatHappened: `La presión del circuito primario alcanzó ${state.pressure.toFixed(1)} bar sin que la válvula de alivio haya abierto todavía. Límite estructural: 160 bar.`,
      whyError: 'El circuito primario de un PWR opera a ~155 bar. La válvula de alivio de presión (PORV) es la primera línea de protección: se abre automáticamente para liberar presión. Si la PORV no actúa (fallo mecánico o control incorrecto), la presión puede superar los límites estructurales de la vasija del reactor. En Three Mile Island, una PORV atascada abierta causó la pérdida de refrigerante que derivó en fusión parcial.',
      consequences: [
        `Presión actual: ${state.pressure.toFixed(1)} bar — margen hasta límite: ${(160 - state.pressure).toFixed(1)} bar`,
        'La válvula de alivio debería abrir a 155 bar (pasiva)',
        'Si P supera 160 bar sin válvula: SCRAM automático y posible fallo estructural',
        'Al abrirse la válvula: flujo de refrigerante bajará ~8%',
      ],
      whatToDo: [
        '1. Reduce potencia insertando barras (la temperatura baja → la presión baja)',
        '2. La válvula de alivio es pasiva — se activa automáticamente a 155 bar',
        '3. Verifica que el flujo de refrigerante sea óptimo (100%)',
        '4. Si P sube a 158+ bar: SCRAM manual',
        '5. La relación P–T es directa: controlar temperatura es controlar presión',
      ],
      historicalCaseKey: 'THREE_MILE_ISLAND',
      params: { power: state.power, temperature: state.temperature, pressure: state.pressure, flow: state.coolantFlow },
    };
  }
}
