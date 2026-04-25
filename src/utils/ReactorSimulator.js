/**
 * Nuclear Reactor Physics Simulator v2.5 — Post-SCRAM Recovery + Decay Heat
 * Cascade delays, Doppler feedback, thermal zones, pressure relief, random events
 * + Real-time risk calculation, decay heat simulation, meltdown risk without cooling
 */
import { calcPowerRisk, calcTempRisk, calcPressureRisk, calcFlowRisk, calcTotalRisk, calcAlertedSystems } from './RiskCalculator';
import { DecayHeatCalculator } from './DecayHeatCalculator';

export class ReactorSimulator {
  constructor() {
    // ESTADO DEL REACTOR
    this.power = 1;          // MW
    this.temperature = 300;  // Kelvin
    this.pressure = 155;     // bar
    this.coolantFlow = 100;  // %
    this.reactividad = 0;    // dólares ($)

    // SISTEMAS DE CONTROL
    this.controlRodsInserted = 0;
    this.pumpRunning = true;
    this.safetySystemsActive = true;
    this.emergencyShutdown = false;
    this.scramReason = null;

    // PARÁMETROS FÍSICOS
    this.betaEffective = 0.0065;
    this.generationTime = 0.0001;
    this.temperatureLimit = 600;
    this.pressureLimit = 160;

    // TIEMPO
    this.time = 0;
    this.elapsedSeconds = 0;

    // DEMORAS EN CASCADA — cola de cambios programados
    // { triggerTime: number, apply: fn, description: string }
    this.pendingChanges = [];

    // RETROALIMENTACIÓN DOPPLER
    // α_doppler: coeficiente de temperatura del combustible
    // Cuando T sube → reactividad baja AUTOMÁTICAMENTE
    this.dopplerCoeff = -0.0025;   // $/K
    this.dopplerActive = false;
    this.dopplerDeltaRho = 0;      // cambio de ρ por Doppler (para UI)

    // ZONAS TÉRMICAS DEL NÚCLEO (3 zonas)
    this.thermalZones = {
      center: { temp: 300, label: 'Centro' },
      middle: { temp: 295, label: 'Medio' },
      outer:  { temp: 290, label: 'Periferia' },
    };

    // VÁLVULA DE ALIVIO DE PRESIÓN (automática)
    this.reliefValveOpen = false;
    this.reliefValveSetpoint = 155; // bar — abre con 5 bar de margen

    // EVENTOS ALEATORIOS
    this.lastRandomEventTime = -999;
    this.randomEventCooldown = 0;
    this.pendingAlert = null; // { id, msg, detail, timestamp }

    // SEGUIMIENTO DE ESTABILIZACIÓN (Indicador de Paciencia)
    this.lastActionTime = -999;
    this.lastActionName = null;
    this.isStabilizing = false;
    this.stabilizationProgress = 0; // 0–100%

    // HISTORIAL DE OPERACIONES (auditoría)
    this.operationLog = [];

    // CONTROLES AVANZADOS (Modo Libre)
    this.reliefValveManual = 0;   // 0–100% apertura manual
    this.primaryPumpSpeed  = 100; // 50–100% velocidad bomba
    this.auxiliaryCooling  = 0;   // 0–100% sistema auxiliar
    this.backupPumpActive  = false;

    // MODOS DE FALLO
    this.failures = {
      coolantLeak: false,
      pumpFailure: false,
      controlRodsStuck: false,
      safetyDisabled: false,
    };

    // RIESGO EN TIEMPO REAL
    this.risks = { power: 0, temperature: 0, pressure: 0, flow: 0 };
    this.totalRisk = 0;
    this.alertedSystems = { cooling: false, relief: false, control: false, structural: false };
    this.prediction60s = { tempChange: 0, pressureChange: 0, riskChange: 0 };
    // Tracking de tendencias para predicción
    this._prevTemp = 300;
    this._prevPressure = 155;
    this._prevRisk = 0;
    this._trendAccum = 0;

    // POST-SCRAM — calor de decaimiento y recuperación
    this.postScramSeconds = 0;        // sim-seconds since SCRAM
    this.residualHeat = 0;            // MW of decay heat
    this.decayHeatStartPower = 0;     // reactor power at moment of SCRAM
    this._meltdownWarned = false;
    this._meltdownStarted = false;
    this._lastMeltdownLogTime = -999;

    // LOG DE EVENTOS (sistema)
    this.events = [];
    this.logEvent('Sistema iniciado — v2.5 Recuperación Post-SCRAM', 'info');
    this.logOperation('STARTUP', {}, 'Reactor iniciado en estado seguro');
  }

  // ── DEMORAS EN CASCADA ──────────────────────────────────────────

  /** Encola un cambio a ejecutarse cuando sim.time >= triggerTime */
  scheduleChange(delaySeconds, applyFn, description) {
    this.pendingChanges.push({
      triggerTime: this.time + delaySeconds,
      apply: applyFn,
      description,
      scheduledAt: this.time,
    });
  }

  processPendingChanges() {
    const due = [];
    const remaining = [];
    for (const change of this.pendingChanges) {
      if (this.time >= change.triggerTime) {
        due.push(change);
      } else {
        remaining.push(change);
      }
    }
    this.pendingChanges = remaining;
    for (const change of due) {
      try { change.apply(); } catch (_) {}
    }
  }

  // ── SCRAM CENTRALIZADO ─────────────────────────────────────────

  triggerScram(reason, logAction, logParams = {}) {
    if (this.emergencyShutdown) return;
    this.emergencyShutdown = true;
    this.scramReason = reason;
    this.controlRodsInserted = 100;
    this.reactividad = -3;
    // Capture power for decay heat calculation
    this.decayHeatStartPower = this.power;
    this.residualHeat = this.power * 0.07;
    this.postScramSeconds = 0;
    this._meltdownWarned = false;
    this._meltdownStarted = false;
    this._lastMeltdownLogTime = -999;
    this.logOperation(logAction, { power: this.power, temperature: this.temperature, ...logParams }, reason);
  }

  // ── FÍSICA NUCLEAR ──────────────────────────────────────────────

  /** Ecuación de punto cinético: dn/dt = (ρ−β)/Λ × n */
  solvePointKinetics(dt) {
    const rho = this.reactividad / 100;
    const dn_dt = ((rho - this.betaEffective) / this.generationTime) * this.power;
    this.power += dn_dt * dt;
    this.power = Math.max(0.001, Math.min(this.power, 10000));
  }

  /**
   * Retroalimentación Doppler automática.
   * T↑ → uranio se expande → geometría cambia → menos capturas → ρ↓
   * Esta es la característica de seguridad inherente más importante.
   */
  applyTemperatureFeedback() {
    const deltaTemp = this.temperature - 300;
    // ρ_doppler = α_doppler × ΔT (en dólares por segundo, escalado)
    const dopplerEffect = this.dopplerCoeff * deltaTemp * 0.003;
    this.reactividad = Math.max(-3, Math.min(3, this.reactividad + dopplerEffect));

    this.dopplerActive = Math.abs(deltaTemp) > 25;
    this.dopplerDeltaRho = parseFloat((this.dopplerCoeff * deltaTemp).toFixed(4));
  }

  /** Dinámica térmica del núcleo con zonas */
  updateTemperature(dt) {
    const heatGeneration = this.power * 2.5;
    const coolantTemp = 290 - this.coolantFlow * 0.3;
    const heatRemoval = Math.max(0, this.coolantFlow / 100) * (this.temperature - coolantTemp) * 0.8;
    // Enfriamiento auxiliar: hasta -3 K/s a 100%
    const auxCooling = (this.auxiliaryCooling / 100) * 3;
    const dT_dt = heatGeneration - heatRemoval - auxCooling;
    this.temperature += dT_dt * dt;
    this.temperature = Math.max(280, this.temperature);

    // Actualizar zonas térmicas del núcleo
    this.updateThermalZones();

    if (this.temperature > this.temperatureLimit) {
      this.reactividad -= 0.5;
      this.logEvent('⚠️ ALERTA: Temperatura crítica — Doppler refuerza absorción', 'warning');
      if (this.safetySystemsActive && !this.emergencyShutdown) {
        this.logEvent('💥 SCRAM AUTOMÁTICO: Temperatura límite alcanzada', 'critical');
        this.triggerScram(
          `Temperatura excedió ${this.temperatureLimit}K (límite de seguridad)`,
          'SCRAM_AUTO_TEMP',
          { temperature: this.temperature }
        );
      }
    }
  }

  /** Tres zonas térmicas: centro es más caliente, periferia más fría */
  updateThermalZones() {
    const base = this.temperature;
    // Factor de flujo: menos refrigeración → más desequilibrio entre zonas
    const flowFactor = 1 + (100 - this.coolantFlow) / 200;

    this.thermalZones.center.temp = Math.min(900, base * 1.14 * flowFactor);
    this.thermalZones.middle.temp = Math.min(850, base * 1.04);
    this.thermalZones.outer.temp  = Math.min(800, base * 0.93);
  }

  /** Dinámica de presión con válvula de alivio automática */
  updatePressure(dt) {
    const pressureFromTemp = (this.temperature - 300) * 0.2;
    const pressureDecay = this.coolantFlow > 0 ? 0.3 : 0;
    // Válvula manual reduce presión hasta -5 bar al 100% de apertura
    const manualValveRelief = (this.reliefValveManual / 100) * 5;
    this.pressure = 155 + pressureFromTemp - pressureDecay - manualValveRelief;

    // Válvula de alivio (automática, pasiva)
    this.checkPressureRelief();

    if (this.pressure > this.pressureLimit && !this.reliefValveOpen) {
      this.logEvent('🔴 CRÍTICO: Presión primaria fuera de límites estructurales', 'critical');
      if (this.safetySystemsActive && !this.emergencyShutdown) {
        this.logEvent('💥 SCRAM AUTOMÁTICO activado por presión', 'critical');
        this.triggerScram(
          `Presión excedió ${this.pressureLimit} bar (límite estructural)`,
          'SCRAM_AUTO_PRESS',
          { pressure: this.pressure }
        );
      }
    }
  }

  /** Válvula de alivio de presión — protección pasiva (no requiere electricidad) */
  checkPressureRelief() {
    const sp = this.reliefValveSetpoint;

    if (this.pressure > sp && !this.reliefValveOpen) {
      this.reliefValveOpen = true;
      this.logEvent(`🟡 VÁLVULA DE ALIVIO ABIERTA — Presión > ${sp} bar`, 'warning');
      this.coolantFlow = Math.max(0, this.coolantFlow - 8);
      this.temperature += 4;
    }

    if (this.reliefValveOpen) {
      // La válvula libera vapor → baja presión activamente
      this.pressure -= 1.5;
      if (this.pressure < sp - 8) {
        this.reliefValveOpen = false;
        this.logEvent('✓ Válvula de alivio cerrada — presión normalizada', 'info');
      }
    }
  }

  // ── EVENTOS ALEATORIOS ──────────────────────────────────────────

  generateRandomEvent() {
    if (!this.pumpRunning || this.emergencyShutdown) return;
    if (this.randomEventCooldown > 0) return;
    // Ventana de 45s sin evento antes de generar uno nuevo
    if (this.time - this.lastRandomEventTime < 45) return;
    // ~0.8% probabilidad por frame (dt~0.016s → ~once cada 2 minutos de media)
    if (Math.random() > 0.006) return;

    const events = [
      {
        id: 'pump_vibration',
        msg: '⚠️ VIBRACIÓN EN BOMBA B — Revisar cojinetes',
        detail: 'Posible desgaste de cojinetes o cavitación. Considera activar bomba de respaldo antes de que falle.',
        level: 'warning',
      },
      {
        id: 'pressure_spike',
        msg: '⚠️ PICO DE PRESIÓN TRANSITORIO — Verificar válvula de descarga',
        detail: 'Fluctuación breve de presión. Monitorea 30 segundos. Si se repite, reduce potencia 5%.',
        level: 'warning',
      },
      {
        id: 'radioactivity_detected',
        msg: '🟡 RADIACTIVIDAD DETECTABLE — Filtro del circuito primario degradado',
        detail: 'No es condición crítica. Indica desgaste de filtros. Programar mantenimiento en próxima parada.',
        level: 'warning',
      },
      {
        id: 'coolant_temp_spike',
        msg: '🌡️ TEMPERATURA DE SALIDA ELEVADA — Verificar distribución de flujo',
        detail: 'Temperatura de salida del refrigerante ligeramente alta. Normal si potencia subió recientemente. Espera 60s.',
        level: 'warning',
      },
    ];

    const evt = events[Math.floor(Math.random() * events.length)];
    this.logEvent(evt.msg, evt.level);
    this.pendingAlert = { ...evt, timestamp: this.time };
    this.lastRandomEventTime = this.time;
    this.randomEventCooldown = 60;
  }

  // ── CONTROLES DEL OPERADOR ──────────────────────────────────────

  /** Inserta barras: efecto inmediato parcial + efecto completo a los 3s */
  insertControlRods(amount) {
    const prevPos = this.controlRodsInserted;
    this.controlRodsInserted = Math.min(100, this.controlRodsInserted + amount);

    // Efecto inmediato (~25%)
    this.reactividad -= (amount / 100) * 0.3;

    // Efecto completo a los 3 segundos (demora mecánica real)
    this.scheduleChange(3, () => {
      this.reactividad -= (amount / 100) * 0.9;
      this.reactividad = Math.max(-3, Math.min(3, this.reactividad));
      this.logEvent('⏱️ +3s: Barras insertadas — efecto neutrónico completo', 'info');
    }, 'Efecto de inserción de barras (3s)');

    this.logEvent(`Control rods: ${this.controlRodsInserted.toFixed(1)}% insertadas`, 'info');
    this.logOperation('BARRAS+', { position: prevPos, reactivity: this.reactividad }, 'Insertar barras de control');
    this.startStabilizationTracking('BARRAS+');
  }

  /** Retira barras: efecto inmediato parcial + efecto completo a los 3s */
  withdrawControlRods(amount) {
    if (this.failures.controlRodsStuck) {
      this.logEvent('❌ Barras ATASCADAS — no se pueden retirar', 'critical');
      return;
    }
    const prevPos = this.controlRodsInserted;
    this.controlRodsInserted = Math.max(0, this.controlRodsInserted - amount);

    // Efecto inmediato (~25%)
    this.reactividad += (amount / 100) * 0.3;

    // Efecto completo a los 3 segundos
    this.scheduleChange(3, () => {
      this.reactividad += (amount / 100) * 0.9;
      this.reactividad = Math.max(-3, Math.min(3, this.reactividad));
      this.logEvent('⏱️ +3s: Barras retiradas — aumento neutrónico completo', 'info');
    }, 'Efecto de retirada de barras (3s)');

    this.logEvent(`Control rods: ${this.controlRodsInserted.toFixed(1)}% insertadas`, 'info');
    this.logOperation('BARRAS-', { position: prevPos, reactivity: this.reactividad }, 'Retirar barras de control');
    this.startStabilizationTracking('BARRAS-');
  }

  /** Slider de barras — efecto inmediato (control continuo, sin delay) */
  setControlRods(newValue) {
    if (this.failures.controlRodsStuck) {
      this.logEvent('❌ Barras ATASCADAS — no se pueden mover', 'critical');
      return;
    }
    const clamped = Math.max(0, Math.min(100, newValue));
    const delta = clamped - this.controlRodsInserted;
    this.controlRodsInserted = clamped;
    this.reactividad -= (delta / 100) * 1.2;
    this.reactividad = Math.max(-3, Math.min(3, this.reactividad));
    this.startStabilizationTracking('SLIDER');
  }

  increasePower(amount) {
    if (this.emergencyShutdown) {
      this.logEvent('❌ Reactor en SCRAM — no se puede aumentar potencia', 'critical');
      return;
    }
    const prev = { power: this.power, reactivity: this.reactividad };
    this.reactividad += amount;
    this.reactividad = Math.max(-3, Math.min(3, this.reactividad));
    this.logOperation('POTENCIA+', prev, 'Aumentar reactividad base');
    this.startStabilizationTracking('POTENCIA+');
  }

  togglePump() {
    this.pumpRunning = !this.pumpRunning;
    if (this.pumpRunning) {
      // Demora de arranque del motor: 5 segundos
      this.logEvent('💧 Iniciando bomba... (arranque: 5s)', 'info');
      this.scheduleChange(5, () => {
        this.coolantFlow = 100;
        this.logEvent('✓ +5s: Bomba en marcha completa — flujo restablecido', 'info');
      }, 'Arranque de bomba (+5s)');
      this.logOperation('BOMBA_ON', { coolantFlow: this.coolantFlow }, 'Encender bomba de refrigeración');
    } else {
      this.logEvent('⚠️ Bomba de refrigeración APAGADA', 'warning');
      this.coolantFlow = 0;
      this.logOperation('BOMBA_OFF', { coolantFlow: this.coolantFlow }, 'Apagar bomba');
    }
  }

  causePumpFailure() {
    this.failures.pumpFailure = true;
    this.pumpRunning = false;
    this.coolantFlow = 0;
    this.logEvent('💔 FALLO: Bomba de refrigeración falla', 'critical');
    this.logOperation('FALLO_BOMBA', {}, 'Fallo automático de bomba');
  }

  causeCoolantLeak() {
    this.failures.coolantLeak = true;
    this.coolantFlow *= 0.5;
    this.logEvent('🌊 FALLO: Pérdida de refrigerante detectada (LOCA)', 'critical');
    this.logOperation('FALLO_LOCA', { coolantFlow: this.coolantFlow }, 'Pérdida de refrigerante');
  }

  disableSafetySystems() {
    this.safetySystemsActive = false;
    this.logEvent('🚨 CRÍTICO: Sistemas de seguridad deshabilitados — NO HACER EN REAL', 'critical');
    this.logOperation('DESHABILITAR_SEGURIDAD', {}, 'Deshabilitar sistemas de seguridad');
  }

  emergencyScram() {
    this.logEvent('🛑 SCRAM DE EMERGENCIA ACTIVADO', 'critical');
    this.triggerScram('Activaste manualmente SCRAM', 'SCRAM_MANUAL', {});
  }

  resetFromScram() {
    this.emergencyShutdown = false;
    this.controlRodsInserted = 50;
    this.reactividad = -1.5;
    this.power = 1;
    this.scramReason = null;
    this.pendingChanges = [];
    this.isStabilizing = false;
    // Decay heat reset
    this.postScramSeconds = 0;
    this.residualHeat = 0;
    this.decayHeatStartPower = 0;
    this._meltdownWarned = false;
    this._meltdownStarted = false;
    this._lastMeltdownLogTime = -999;
    // Reset controles de emergencia
    this.reliefValveManual = 0;
    this.auxiliaryCooling  = 0;
    this.logEvent('⚛️ Reactor recuperado de SCRAM — en standby', 'warning');
    this.logOperation('RECUPERAR_SCRAM', {}, 'Recuperación manual de emergencia');
  }

  // ── CONTROLES AVANZADOS (Modo Libre) ───────────────────────────

  setReliefValveManual(value) {
    const prev = this.reliefValveManual;
    this.reliefValveManual = Math.max(0, Math.min(100, value));
    if (this.reliefValveManual > 0 && prev === 0) {
      this.logEvent(`🔧 Válvula de alivio manual: ${this.reliefValveManual.toFixed(0)}% abierta`, 'info');
      this.logOperation('VALVULA_MANUAL_OPEN', { value: this.reliefValveManual }, 'Abrir válvula de alivio manual');
    } else if (this.reliefValveManual === 0 && prev > 0) {
      this.logEvent('🔧 Válvula de alivio manual cerrada', 'info');
    }
  }

  setPrimaryPumpSpeed(value) {
    this.primaryPumpSpeed = Math.max(50, Math.min(100, value));
    this.startStabilizationTracking('BOMBA_VELOCIDAD');
  }

  setAuxiliaryCooling(value) {
    const prev = this.auxiliaryCooling;
    this.auxiliaryCooling = Math.max(0, Math.min(100, value));
    if (this.auxiliaryCooling > 0 && prev === 0) {
      this.logEvent(`❄️ Enfriamiento auxiliar activado: ${this.auxiliaryCooling.toFixed(0)}%`, 'warning');
      this.logOperation('ENFRIAMIENTO_AUX_ON', { value: this.auxiliaryCooling }, 'Activar enfriamiento auxiliar de emergencia');
    } else if (this.auxiliaryCooling === 0 && prev > 0) {
      this.logEvent('❄️ Enfriamiento auxiliar desactivado', 'info');
    }
  }

  toggleBackupPump() {
    this.backupPumpActive = !this.backupPumpActive;
    if (this.backupPumpActive) {
      this.logEvent('✓ Bomba de respaldo ACTIVADA — flujo +20%', 'info');
      this.logOperation('BOMBA_RESPALDO_ON', { coolantFlow: this.coolantFlow }, 'Activar bomba de respaldo');
    } else {
      this.logEvent('Bomba de respaldo desactivada', 'info');
      this.logOperation('BOMBA_RESPALDO_OFF', {}, 'Desactivar bomba de respaldo');
    }
    this.startStabilizationTracking('BOMBA_RESPALDO');
  }

  // ── PACIENCIA / ESTABILIZACIÓN ──────────────────────────────────

  startStabilizationTracking(actionName) {
    this.lastActionTime = this.time;
    this.lastActionName = actionName;
    this.isStabilizing = true;
    this.stabilizationProgress = 0;
  }

  updateStabilizationProgress() {
    if (!this.isStabilizing) return;
    const elapsed = this.time - this.lastActionTime;
    // 60 segundos para estabilización completa
    this.stabilizationProgress = Math.min(100, (elapsed / 60) * 100);
    if (this.stabilizationProgress >= 100) {
      this.isStabilizing = false;
      this.logEvent('✓ Sistema estabilizado — parámetros en equilibrio térmico', 'info');
    }
  }

  // ── AUDITORÍA ────────────────────────────────────────────────────

  logOperation(action, parameters, reason) {
    this.operationLog.push({
      timestamp: new Date().toLocaleTimeString(),
      simTime: this.time.toFixed(1),
      action,
      parameters: { ...parameters },
      reason,
    });
    if (this.operationLog.length > 100) {
      this.operationLog.shift();
    }
  }

  // ── RIESGO EN TIEMPO REAL ────────────────────────────────────────

  calculateRisks(dt) {
    const powerRisk = calcPowerRisk(this.power);
    const tempRisk  = calcTempRisk(this.temperature);
    const pressRisk = calcPressureRisk(this.pressure);
    const flowRisk  = calcFlowRisk(this.coolantFlow);

    this.risks = { power: powerRisk, temperature: tempRisk, pressure: pressRisk, flow: flowRisk };
    this.totalRisk = calcTotalRisk(this.risks);
    this.alertedSystems = calcAlertedSystems(this, this.risks);

    // Predicción: tasa de cambio acumulada cada segundo
    this._trendAccum += dt;
    if (this._trendAccum >= 1.0) {
      const tempRate  = (this.temperature - this._prevTemp)     / this._trendAccum;
      const pressRate = (this.pressure    - this._prevPressure) / this._trendAccum;
      const riskRate  = (this.totalRisk   - this._prevRisk)     / this._trendAccum;
      this.prediction60s = {
        tempChange:     tempRate  * 60,
        pressureChange: pressRate * 60,
        riskChange:     riskRate  * 60,
      };
      this._prevTemp     = this.temperature;
      this._prevPressure = this.pressure;
      this._prevRisk     = this.totalRisk;
      this._trendAccum   = 0;
    }
  }

  // ── PASO DE SIMULACIÓN PRINCIPAL ─────────────────────────────────

  step(dt = 0.1) {
    this.time += dt;
    this.elapsedSeconds += dt;

    // Ejecutar cambios con demora que ya llegaron a su tiempo
    this.processPendingChanges();

    // Reducir cooldown de eventos aleatorios
    if (this.randomEventCooldown > 0) {
      this.randomEventCooldown -= dt;
    }

    if (this.emergencyShutdown) {
      // Power drops to near-zero rapidly (neutron chain reaction stopped)
      this.power = Math.max(0, this.power * Math.exp(-0.5 * dt));

      // Track post-SCRAM time for decay heat calculation
      this.postScramSeconds += dt;

      // Wigner-Way decay heat calculation
      if (this.decayHeatStartPower > 0) {
        this.residualHeat = DecayHeatCalculator.calculateDecayHeat(
          this.postScramSeconds,
          this.decayHeatStartPower
        );
      }

      // Temperature: depends on whether cooling is active
      if (this.coolantFlow >= 30) {
        // Active cooling: temperature drops toward ambient
        const coolingStrength = DecayHeatCalculator.coolingRate(this.coolantFlow);
        this.temperature = Math.max(290, this.temperature - coolingStrength * dt);
      } else {
        // No cooling: residual heat warms the fuel back up
        const heatingStrength = DecayHeatCalculator.heatingRate(this.residualHeat);
        this.temperature = Math.min(3000, this.temperature + heatingStrength * dt);

        // Log meltdown warnings (rate-limited)
        if (this.temperature > 800 && this.time - this._lastMeltdownLogTime > 20) {
          this._lastMeltdownLogTime = this.time;
          if (this.temperature < 1500) {
            this.logEvent('🔴 CRÍTICO: Sin refrigeración — combustible calentándose', 'critical');
          } else if (this.temperature < 2500) {
            this.logEvent('💣 FUSIÓN DE COMBUSTIBLE EN PROGRESO — INTERVENCIÓN INMEDIATA', 'critical');
          } else {
            this.logEvent('💥 MELTDOWN COMPLETO — CATÁSTROFE NUCLEAR', 'critical');
          }
        }
      }

      this.pressure = Math.max(95, this.pressure - 3 * dt);
      this.updateThermalZones();
      this.calculateRisks(dt);
      return;
    }

    // Fallos progresivos
    if (this.failures.coolantLeak && Math.random() < 0.02) {
      this.coolantFlow *= 0.95;
    }

    if (!this.pumpRunning) {
      this.coolantFlow = Math.max(0, this.coolantFlow - 5 * dt);
    } else if (!this.failures.coolantLeak && !this.failures.pumpFailure) {
      // Flujo objetivo basado en velocidad de bomba, válvula manual y bomba de respaldo
      const pumpTarget    = this.primaryPumpSpeed;                       // 50–100%
      const reliefDrain   = (this.reliefValveManual / 100) * 30;         // válvula abierta reduce flujo max -30%
      const autoValveDrain = this.reliefValveOpen ? 5 : 0;               // válvula auto abierta: -5%
      const backupBoost   = this.backupPumpActive ? 20 : 0;              // bomba respaldo: +20%
      const targetFlow    = Math.min(120, Math.max(0,
        pumpTarget - reliefDrain - autoValveDrain + backupBoost
      ));

      if (this.coolantFlow < targetFlow) {
        this.coolantFlow = Math.min(targetFlow, this.coolantFlow + 3 * dt);
      } else if (this.coolantFlow > targetFlow) {
        this.coolantFlow = Math.max(targetFlow, this.coolantFlow - 3 * dt);
      }
    }

    // SCRAM automático por flujo de refrigerante crítico
    if (this.coolantFlow < 30 && this.safetySystemsActive && !this.emergencyShutdown) {
      this.logEvent('💥 SCRAM AUTOMÁTICO: Flujo refrigerante crítico', 'critical');
      this.triggerScram(
        'Flujo de refrigerante cayó por debajo de 30%',
        'SCRAM_AUTO_FLOW',
        { coolantFlow: this.coolantFlow }
      );
    }

    // Física principal
    this.solvePointKinetics(dt);
    this.applyTemperatureFeedback();
    this.updateTemperature(dt);
    this.updatePressure(dt);

    // Eventos aleatorios
    this.generateRandomEvent();

    // Riesgo en tiempo real
    this.calculateRisks(dt);

    // Progreso de estabilización (indicador de paciencia)
    this.updateStabilizationProgress();

    if (this.temperature > this.temperatureLimit * 1.5) {
      this.logEvent('💣 MELTDOWN EN PROGRESO', 'critical');
    }
  }

  logEvent(message, level = 'info') {
    this.events.push({
      time: this.time.toFixed(2),
      message,
      level,
      timestamp: new Date().toLocaleTimeString(),
    });
    if (this.events.length > 50) {
      this.events.shift();
    }
  }

  getState() {
    return {
      // v2.1 original
      power: this.power,
      temperature: this.temperature,
      pressure: this.pressure,
      coolantFlow: this.coolantFlow,
      reactividad: this.reactividad,
      controlRodsInserted: this.controlRodsInserted,
      pumpRunning: this.pumpRunning,
      emergencyShutdown: this.emergencyShutdown,
      scramReason: this.scramReason,
      safetySystemsActive: this.safetySystemsActive,
      failures: this.failures,
      events: this.events,
      time: this.time,
      // v2.2 nuevo
      dopplerActive: this.dopplerActive,
      dopplerDeltaRho: this.dopplerDeltaRho,
      reliefValveOpen: this.reliefValveOpen,
      thermalZones: this.thermalZones,
      pendingChanges: this.pendingChanges.map(c => ({
        triggerTime: c.triggerTime,
        scheduledAt: c.scheduledAt,
        description: c.description,
        remainingSeconds: Math.max(0, c.triggerTime - this.time).toFixed(1),
      })),
      isStabilizing: this.isStabilizing,
      stabilizationProgress: this.stabilizationProgress,
      lastActionName: this.lastActionName,
      pendingAlert: this.pendingAlert,
      operationLog: this.operationLog,
      // v2.3 — riesgo en tiempo real
      risks: this.risks,
      totalRisk: this.totalRisk,
      alertedSystems: this.alertedSystems,
      prediction60s: this.prediction60s,
      // v2.4 — controles avanzados
      reliefValveManual: this.reliefValveManual,
      primaryPumpSpeed: this.primaryPumpSpeed,
      auxiliaryCooling: this.auxiliaryCooling,
      backupPumpActive: this.backupPumpActive,
      // v2.5 — post-SCRAM decay heat
      postScramSeconds: this.postScramSeconds,
      residualHeat: this.residualHeat,
      decayHeatStartPower: this.decayHeatStartPower,
    };
  }

  // ── ESCENARIOS HISTÓRICOS ────────────────────────────────────────

  loadChernobylScenario() {
    this.logEvent('📋 Escenario: CHERNOBYL 1986 SIMULADO', 'warning');
    this.power = 1500;
    this.temperature = 300;
    this.pressure = 155;
    this.reactividad = 0.8;
    this.safetySystemsActive = false;
    this.logEvent('⚠️ Sistemas de seguridad deshabilitados para prueba de turbina', 'critical');
    this.logOperation('ESCENARIO_CHERNOBYL', { safetyOff: true }, 'Cargar escenario Chernobyl');
  }

  loadFukushimaScenario() {
    this.logEvent('📋 Escenario: FUKUSHIMA 2011 (Terremoto + Tsunami)', 'warning');
    this.power = 1380;
    this.temperature = 300;
    this.pressure = 155;
    this.reactividad = 0.2;
    this.safetySystemsActive = true;
    this.logEvent('🌊 TERREMOTO 9.0 Richter — Barras insertadas automáticamente', 'critical');
    this.logEvent('🌊 TSUNAMI golpea — Falla backup de generadores eléctricos', 'critical');
    this.logOperation('ESCENARIO_FUKUSHIMA', {}, 'Cargar escenario Fukushima');
    setTimeout(() => { this.causePumpFailure(); }, 2000);
  }
}
