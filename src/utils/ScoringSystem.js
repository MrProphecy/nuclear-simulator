/**
 * Sistema de Puntuación, Logros y Estadísticas
 * para Nuclear Reactor Simulator
 */

export class ScoringSystem {
  constructor() {
    this.score = 0;
    this.level = 1;
    this.timeElapsed = 0;
    this.achievements = [];
    this.maxPowerReached = 0;
    this.safetyViolations = 0;
    this.scaramTriggered = 0;
    this.meldownAvoided = false;
    this.chernobylSurvived = false;
  }

  /**
   * Calcular puntuación basada en estabilidad
   */
  updateScore(state, deltaTime) {
    this.timeElapsed += deltaTime;

    // Puntos base por tiempo
    this.score += deltaTime * 10;

    // Bonus por mantener reactor estable
    if (state.temperature < 450 && state.pressure < 150 && state.power < 1000) {
      this.score += deltaTime * 50; // +50 pts/seg si está bien
    }

    // Penalización por peligro
    if (state.temperature > 550) {
      this.score -= deltaTime * 100; // muy caliente
    }
    if (state.pressure > 155) {
      this.score -= deltaTime * 100; // presión alta
    }
    if (state.coolantFlow < 30) {
      this.score -= deltaTime * 150; // refrigerante crítico
    }

    // Bonus por barras bien insertadas
    if (state.controlRodsInserted > 70) {
      this.score += deltaTime * 20;
    }

    // Mantener score mínimo en 0
    this.score = Math.max(0, this.score);

    // Track máxima potencia
    this.maxPowerReached = Math.max(this.maxPowerReached, state.power);
  }

  /**
   * Detectar y desbloquear logros
   */
  checkAchievements(state) {
    const newAchievements = [];

    // Logro 1: "Control Perfecto" - 60+ segundos sin problemas
    if (this.timeElapsed > 60 && state.temperature < 450 && state.pressure < 150 && !this.achievements.find(a => a.id === 'perfect_control')) {
      newAchievements.push({
        id: 'perfect_control',
        name: '🎯 Control Perfecto',
        desc: '60+ segundos sin violar límites de seguridad',
        points: 500
      });
    }

    // Logro 2: "Maestro de Barras" - inserción y retracción suave
    if (state.controlRodsInserted > 50 && state.controlRodsInserted < 80 && !this.achievements.find(a => a.id === 'rod_master')) {
      newAchievements.push({
        id: 'rod_master',
        name: '⚙️ Maestro de Barras',
        desc: 'Mantener barras entre 50-80% insertadas por 30s',
        points: 300
      });
    }

    // Logro 3: "Survived LOCA" - sobrevivir pérdida de refrigerante
    if (state.failures.coolantLeak && state.power < 500 && !this.achievements.find(a => a.id === 'loca_survivor')) {
      newAchievements.push({
        id: 'loca_survivor',
        name: '💧 Superviviente de LOCA',
        desc: 'Sobrevivir a una pérdida de refrigerante controlada',
        points: 1000
      });
    }

    // Logro 4: "Chernobyl Defender" - completar escenario Chernobyl sin meltdown
    if (this.chernobylSurvived && !this.achievements.find(a => a.id === 'chernobyl_defender')) {
      newAchievements.push({
        id: 'chernobyl_defender',
        name: '🛡️ Defensor de Chernobyl',
        desc: 'Evitar meltdown en escenario Chernobyl',
        points: 5000
      });
    }

    // Logro 5: "Centinela" - 300+ segundos sin SCRAM
    if (this.timeElapsed > 300 && this.scaramTriggered === 0 && !this.achievements.find(a => a.id === 'sentinel')) {
      newAchievements.push({
        id: 'sentinel',
        name: '🛡️ Centinela',
        desc: '300+ segundos sin activar SCRAM',
        points: 2000
      });
    }

    // Logro 6: "Buscador de Límites" - alcanzar 80% de potencia nominal sin fallo
    if (this.maxPowerReached > 1600 && state.temperature < 500 && !this.achievements.find(a => a.id === 'limit_seeker')) {
      newAchievements.push({
        id: 'limit_seeker',
        name: '🔥 Buscador de Límites',
        desc: 'Alcanzar 80% de potencia nominal sin meltdown',
        points: 800
      });
    }

    // Agregar puntos por logros nuevos
    newAchievements.forEach(ach => {
      this.score += ach.points;
      this.achievements.push(ach);
    });

    return newAchievements;
  }

  /**
   * Calcular nivel basado en score
   */
  updateLevel() {
    this.level = Math.floor(this.score / 1000) + 1;
  }

  /**
   * Registrar violación de seguridad
   */
  registerSafetyViolation() {
    this.safetyViolations++;
    this.score -= 200;
  }

  /**
   * Registrar SCRAM
   */
  registerScram() {
    this.scaramTriggered++;
    this.score -= 300;
  }

  /**
   * Estado de scoring
   */
  getState() {
    return {
      score: Math.floor(this.score),
      level: this.level,
      timeElapsed: this.timeElapsed,
      maxPowerReached: this.maxPowerReached,
      safetyViolations: this.safetyViolations,
      scaramTriggered: this.scaramTriggered,
      achievements: this.achievements
    };
  }

  /**
   * Obtener resumen final
   */
  getSessionSummary() {
    return {
      score: Math.floor(this.score),
      level: this.level,
      duration: Math.floor(this.timeElapsed),
      achievements: this.achievements.length,
      maxPower: Math.floor(this.maxPowerReached),
      violations: this.safetyViolations,
      scramTriggered: this.scaramTriggered
    };
  }
}

/**
 * Dificulta y Eventos Aleatorios
 */
export class DifficultyManager {
  constructor(level = 1) {
    this.level = level;
    this.eventChance = 0.01 * level; // más eventos en dificultades altas
    this.failureChance = 0.002 * level;
  }

  /**
   * Generar eventos aleatorios
   */
  generateRandomEvent(state) {
    if (Math.random() > this.eventChance) return null;

    const events = [
      {
        name: 'Fluctuación de red eléctrica',
        action: (sim) => {
          sim.reactividad += (Math.random() - 0.5) * 0.2;
        }
      },
      {
        name: 'Aumento de demanda eléctrica',
        action: (sim) => {
          sim.increasePower(0.3);
        }
      },
      {
        name: 'Instrumentación inestable',
        action: (sim) => {
          sim.logEvent('⚠️ Lectura de sensores fluctuante', 'warning');
        }
      }
    ];

    return events[Math.floor(Math.random() * events.length)];
  }

  /**
   * Generar fallo aleatorio
   */
  generateRandomFailure(state) {
    if (Math.random() > this.failureChance) return null;

    const failures = [
      { type: 'valve_stuck', name: 'Válvula atascada en línea primaria' },
      { type: 'sensor_drift', name: 'Desviación de sensor de temperatura' },
      { type: 'pump_vibration', name: 'Vibración anormal en bomba' }
    ];

    return failures[Math.floor(Math.random() * failures.length)];
  }
}
