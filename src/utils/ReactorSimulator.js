/**
 * Nuclear Reactor Physics Simulator v2.2 — Realismo Profundo
 * Cascade delays, Doppler feedback, thermal zones, pressure relief, random events
 */

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

    // MODOS DE FALLO
    this.failures = {
      coolantLeak: false,
      pumpFailure: false,
      controlRodsStuck: false,
      safetyDisabled: false,
    };

    // LOG DE EVENTOS (sistema)
    this.events = [];
    this.logEvent('Sistema iniciado — v2.2 Realismo Profundo', 'info');
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
    const dT_dt = heatGeneration - heatRemoval;
    this.temperature += dT_dt * dt;
    this.temperature = Math.max(280, this.temperature);

    // Actualizar zonas térmicas del núcleo
    this.updateThermalZones();

    if (this.temperature > this.temperatureLimit) {
      this.reactividad -= 0.5;
      this.logEvent('⚠️ ALERTA: Temperatura crítica — Doppler refuerza absorción', 'warning');
      if (this.safetySystemsActive && !this.emergencyShutdown) {
        this.scramReason = `Temperatura excedió ${this.temperatureLimit}K (límite de seguridad)`;
        this.emergencyShutdown = true;
        this.controlRodsInserted = 100;
        this.reactividad = -3;
        this.logEvent('💥 SCRAM AUTOMÁTICO: Temperatura límite alcanzada', 'critical');
        this.logOperation('SCRAM_AUTO_TEMP', { temperature: this.temperature }, 'SCRAM por temperatura');
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
    this.pressure = 155 + pressureFromTemp - pressureDecay;

    // Válvula de alivio (automática, pasiva)
    this.checkPressureRelief();

    if (this.pressure > this.pressureLimit && !this.reliefValveOpen) {
      this.logEvent('🔴 CRÍTICO: Presión primaria fuera de límites estructurales', 'critical');
      if (this.safetySystemsActive && !this.emergencyShutdown) {
        this.scramReason = `Presión excedió ${this.pressureLimit} bar (límite estructural)`;
        this.emergencyShutdown = true;
        this.controlRodsInserted = 100;
        this.reactividad = -3;
        this.logEvent('💥 SCRAM AUTOMÁTICO activado', 'critical');
        this.logOperation('SCRAM_AUTO_PRESS', { pressure: this.pressure }, 'SCRAM por presión');
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
    const prev = { power: this.power, temperature: this.temperature, pressure: this.pressure };
    this.controlRodsInserted = 100;
    this.reactividad = -3;
    this.emergencyShutdown = true;
    this.scramReason = 'Activaste manualmente SCRAM';
    this.logEvent('🛑 SCRAM DE EMERGENCIA ACTIVADO', 'critical');
    this.logOperation('SCRAM_MANUAL', prev, 'Operador activó SCRAM de emergencia');
  }

  resetFromScram() {
    this.emergencyShutdown = false;
    this.controlRodsInserted = 50;
    this.reactividad = -1.5;
    this.power = 1;
    this.scramReason = null;
    this.pendingChanges = []; // limpiar cola de demoras
    this.isStabilizing = false;
    this.logEvent('⚛️ Reactor recuperado de SCRAM — en standby', 'warning');
    this.logOperation('RECUPERAR_SCRAM', {}, 'Recuperación manual de emergencia');
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
      this.power *= Math.exp(-0.5 * dt);
      this.temperature = Math.max(290, this.temperature - 10 * dt);
      this.pressure = Math.max(100, this.pressure - 5 * dt);
      this.updateThermalZones();
      return;
    }

    // Fallos progresivos
    if (this.failures.coolantLeak && Math.random() < 0.02) {
      this.coolantFlow *= 0.95;
    }

    if (!this.pumpRunning) {
      this.coolantFlow = Math.max(0, this.coolantFlow - 5 * dt);
    } else if (!this.failures.coolantLeak && !this.failures.pumpFailure) {
      // Recuperación gradual si la bomba está encendida (no inmediata)
      this.coolantFlow = Math.min(100, this.coolantFlow + 3 * dt);
    }

    // SCRAM automático por flujo de refrigerante crítico
    if (this.coolantFlow < 30 && this.safetySystemsActive && !this.emergencyShutdown) {
      this.scramReason = 'Flujo de refrigerante cayó por debajo de 30%';
      this.emergencyShutdown = true;
      this.controlRodsInserted = 100;
      this.reactividad = -3;
      this.logEvent('💥 SCRAM AUTOMÁTICO: Flujo refrigerante crítico', 'critical');
      this.logOperation('SCRAM_AUTO_FLOW', { coolantFlow: this.coolantFlow }, 'SCRAM por flujo crítico');
    }

    // Física principal
    this.solvePointKinetics(dt);
    this.applyTemperatureFeedback();
    this.updateTemperature(dt);
    this.updatePressure(dt);

    // Eventos aleatorios
    this.generateRandomEvent();

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
