/**
 * Nuclear Reactor Physics Simulator
 * Basado en ecuaciones de punto cinético y dinámica térmica real
 */

export class ReactorSimulator {
  constructor() {
    // ESTADO DEL REACTOR
    this.power = 1; // MW (escala logarítmica relativa)
    this.temperature = 300; // Kelvin (núcleo)
    this.pressure = 155; // bar (primario)
    this.coolantFlow = 100; // % (flujo refrigerante)
    this.reactividad = 0; // en dólares (medida estándar nuclear)

    // SISTEMAS DE CONTROL
    this.controlRodsInserted = 0; // 0-100% insertadas
    this.pumpRunning = true;
    this.safetySystemsActive = true;
    this.emergencyShutdown = false;
    this.scramReason = null; // razón del último SCRAM

    // PARÁMETROS FÍSICOS (realistas pero ficticios)
    this.betaEffective = 0.0065; // fracción de neutrones retardados
    this.generationTime = 0.0001; // segundos
    this.temperatureFeedback = -2.5; // $/K (coeficiente de retroalimentación)
    this.pressureLimit = 160; // bar máximo seguro
    this.temperatureLimit = 600; // K máxima segura

    this.time = 0;

    // HISTORIA DE EVENTOS
    this.events = [];
    this.logEvent('Sistema iniciado', 'info');

    // MODOS DE FALLO
    this.failures = {
      coolantLeak: false,
      pumpFailure: false,
      controlRodsStuck: false,
      safetyDisabled: false
    };
  }

  /**
   * Resolver ecuación de punto cinético de forma numérica
   * dn/dt = (ρ - β) / Λ * n + suma(λ_i * C_i)
   */
  solvePointKinetics(dt) {
    const rho = this.reactividad / 100; // convertir de $ a fracción
    const dn_dt = ((rho - this.betaEffective) / this.generationTime) * this.power;

    // Euler simple para integración
    this.power += dn_dt * dt;
    this.power = Math.max(0.001, Math.min(this.power, 10000)); // límites físicos
  }

  /**
   * Feedback de temperatura:
   * A mayor temperatura → más resonancia de absorción → menos reactividad
   */
  applyTemperatureFeedback() {
    const deltaTemp = this.temperature - 300; // referencia
    const reactivyChange = this.temperatureFeedback * deltaTemp / 1000;
    this.reactividad = Math.max(-3, Math.min(3, this.reactividad + reactivyChange * 0.01));
  }

  /**
   * Dinámica térmica del núcleo
   * dT/dt = k * power - h * (T - T_coolant) - coolantFlow_effect
   */
  updateTemperature(dt) {
    const heatGeneration = this.power * 2.5; // heat release per MW
    const coolantTemp = 290 - this.coolantFlow * 0.3; // simplificado
    const heatRemoval = Math.max(0, this.coolantFlow / 100) * (this.temperature - coolantTemp) * 0.8;

    const dT_dt = heatGeneration - heatRemoval;
    this.temperature += dT_dt * dt;

    // Límite físico
    if (this.temperature > this.temperatureLimit) {
      this.reactividad -= 0.5; // inserción automática de barras por feedback
      this.logEvent('⚠️ ALERTA: Temperatura crítica - feedback negativo activado', 'warning');
      if (this.safetySystemsActive && !this.emergencyShutdown) {
        this.scramReason = `Temperatura excedió ${this.temperatureLimit}K (límite de seguridad)`;
        this.emergencyShutdown = true;
        this.controlRodsInserted = 100;
        this.reactividad = -3;
        this.logEvent('💥 SCRAM AUTOMÁTICO: Temperatura límite alcanzada', 'critical');
      }
    }
  }

  /**
   * Dinámica de presión primaria
   * Presión ↑ con temperatura, ↓ con flujo de refrigeración
   */
  updatePressure(dt) {
    const pressureFromTemp = (this.temperature - 300) * 0.2;
    const pressureDecay = this.coolantFlow > 0 ? 0.3 : 0;

    this.pressure = 155 + pressureFromTemp - pressureDecay;

    if (this.pressure > this.pressureLimit) {
      this.logEvent('🔴 CRÍTICO: Presión primaria fuera de límites', 'critical');
      if (this.safetySystemsActive && !this.emergencyShutdown) {
        this.scramReason = `Presión excedió ${this.pressureLimit} bar (límite estructural)`;
        this.emergencyShutdown = true;
        this.controlRodsInserted = 100;
        this.reactividad = -3;
        this.logEvent('💥 SCRAM AUTOMÁTICO activado', 'critical');
      }
    }
  }

  /**
   * Control de barras de control
   * Más insertadas = más absorción de neutrones = menos reactividad
   */
  insertControlRods(amount) {
    this.controlRodsInserted = Math.min(100, this.controlRodsInserted + amount);
    this.reactividad -= (amount / 100) * 1.2; // $1.20 per 100% inserted
    this.logEvent(`Control rods: ${this.controlRodsInserted.toFixed(1)}% insertadas`, 'info');
  }

  /**
   * Retirar barras de control
   */
  withdrawControlRods(amount) {
    if (this.failures.controlRodsStuck) {
      this.logEvent('❌ Barras de control ATASCADAS - no se pueden retirar', 'critical');
      return;
    }
    this.controlRodsInserted = Math.max(0, this.controlRodsInserted - amount);
    this.reactividad += (amount / 100) * 1.2;
    this.logEvent(`Control rods: ${this.controlRodsInserted.toFixed(1)}% insertadas`, 'info');
  }

  /**
   * Establecer posición de barras de control directamente (desde slider)
   */
  setControlRods(newValue) {
    if (this.failures.controlRodsStuck) {
      this.logEvent('❌ Barras de control ATASCADAS — no se pueden mover', 'critical');
      return;
    }
    const clamped = Math.max(0, Math.min(100, newValue));
    const delta = clamped - this.controlRodsInserted;
    this.controlRodsInserted = clamped;
    this.reactividad -= (delta / 100) * 1.2;
    this.reactividad = Math.max(-3, Math.min(3, this.reactividad));
  }

  /**
   * Aumentar potencia manualmente
   */
  increasePower(amount) {
    if (this.emergencyShutdown) {
      this.logEvent('❌ Reactor en SCRAM - no se puede aumentar potencia', 'critical');
      return;
    }
    this.reactividad += amount;
    this.reactividad = Math.max(-3, Math.min(3, this.reactividad));
  }

  /**
   * Bomba de refrigeración
   */
  togglePump() {
    this.pumpRunning = !this.pumpRunning;
    if (this.pumpRunning) {
      this.logEvent('💧 Bomba de refrigeración ON', 'info');
      this.coolantFlow = 100;
    } else {
      this.logEvent('⚠️ Bomba de refrigeración APAGADA', 'warning');
      this.coolantFlow = 0;
    }
  }

  /**
   * Simular fallo de bomba
   */
  causePumpFailure() {
    this.failures.pumpFailure = true;
    this.pumpRunning = false;
    this.coolantFlow = 0;
    this.logEvent('💔 FALLO: Bomba de refrigeración falla', 'critical');
  }

  /**
   * Simular pérdida de refrigerante (LOCA)
   */
  causeCoolantLeak() {
    this.failures.coolantLeak = true;
    this.coolantFlow *= 0.5;
    this.logEvent('🌊 FALLO: Pérdida de refrigerante detectada', 'critical');
  }

  /**
   * Deshabilitar sistemas de seguridad (simulando Chernobyl)
   */
  disableSafetySystems() {
    this.safetySystemsActive = false;
    this.logEvent('🚨 CRÍTICO: Sistemas de seguridad deshabilitados - NO HACER EN REAL', 'critical');
  }

  /**
   * SCRAM de emergencia
   */
  emergencyScram() {
    this.insertControlRods(100);
    this.emergencyShutdown = true;
    this.reactividad = -3;
    this.scramReason = 'Activaste manualmente SCRAM';
    this.logEvent('🛑 SCRAM DE EMERGENCIA ACTIVADO', 'critical');
  }

  /**
   * Recuperar reactor del SCRAM (solo con confirmación)
   */
  resetFromScram() {
    this.emergencyShutdown = false;
    this.controlRodsInserted = 50;
    this.reactividad = -1.5;
    this.power = 1;
    this.scramReason = null;
    this.logEvent('⚛️ Reactor recuperado de SCRAM', 'warning');
  }

  /**
   * Resolver sistema completo
   */
  step(dt = 0.1) {
    this.time += dt;

    // Si está en SCRAM, solo disminuir potencia
    if (this.emergencyShutdown) {
      this.power *= Math.exp(-0.5 * dt);
      this.temperature -= 10 * dt;
      this.pressure -= 5 * dt;
      return;
    }

    // Fallos progresivos
    if (this.failures.coolantLeak && Math.random() < 0.02) {
      this.coolantFlow *= 0.95;
    }

    // Flujo de refrigerante afectado por bomba
    if (!this.pumpRunning) {
      this.coolantFlow = 0;
    } else {
      this.coolantFlow = Math.min(100, this.coolantFlow + 5 * dt);
    }

    // SCRAM automático por flujo de refrigerante crítico
    if (this.coolantFlow < 30 && this.safetySystemsActive && !this.emergencyShutdown) {
      this.scramReason = 'Flujo de refrigerante cayó por debajo de 30%';
      this.emergencyShutdown = true;
      this.controlRodsInserted = 100;
      this.reactividad = -3;
      this.logEvent('💥 SCRAM AUTOMÁTICO: Flujo refrigerante crítico', 'critical');
    }

    // Ecuaciones de estado
    this.solvePointKinetics(dt);
    this.applyTemperatureFeedback();
    this.updateTemperature(dt);
    this.updatePressure(dt);

    // Verificación de condiciones críticas
    if (this.temperature > this.temperatureLimit * 1.5) {
      this.logEvent('💣 MELTDOWN EN PROGRESO', 'critical');
    }
  }

  logEvent(message, level = 'info') {
    this.events.push({
      time: this.time.toFixed(2),
      message,
      level,
      timestamp: new Date().toLocaleTimeString()
    });

    // Mantener últimos 50 eventos
    if (this.events.length > 50) {
      this.events.shift();
    }
  }

  /**
   * Estado actual del reactor
   */
  getState() {
    return {
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
      time: this.time
    };
  }

  /**
   * Escenario histórico: Chernobyl (simplificado)
   */
  loadChernobylScenario() {
    this.logEvent('📋 Escenario: CHERNOBYL SIMULADO', 'warning');
    this.power = 1500; // Potencia nominal
    this.temperature = 300;
    this.pressure = 155;
    this.reactividad = 0.8;
    this.safetySystemsActive = false;
    this.logEvent('⚠️ Sistemas de seguridad deshabilitados para prueba', 'critical');
  }

  /**
   * Escenario histórico: Fukushima (Terremoto + Tsunami)
   */
  loadFukushimaScenario() {
    this.logEvent('📋 Escenario: FUKUSHIMA 2011 (Terremoto + Tsunami)', 'warning');
    this.power = 1380; // Potencia en el momento
    this.temperature = 300;
    this.pressure = 155;
    this.reactividad = 0.2;
    this.safetySystemsActive = true;
    this.logEvent('🌊 TERREMOTO 9.0 Richter - Reactor automáticamente insertó barras', 'critical');
    this.logEvent('🌊 TSUNAMI golpea - Falla backup de generadores eléctricos', 'critical');
    // La bomba falla en seguida
    setTimeout(() => {
      this.causePumpFailure();
    }, 2000);
  }
}
