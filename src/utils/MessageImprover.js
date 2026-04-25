export class MessageImprover {
  static getOutOfRangeMessage({ power, controlRodsInserted, target = { min: 500, max: 800 } }) {
    const tooLow = power < target.min;
    const diff = tooLow ? (target.min - power) : (power - target.max);
    const stepsNeeded = Math.round(diff / 5);

    return {
      type: 'out_of_range',
      status: tooLow ? 'SUBESTIMADO (Potencia muy baja)' : 'SOBREESTIMADO (Potencia muy alta)',
      currentPower: Math.round(power),
      targetRange: `${target.min}–${target.max} MW`,
      diffMW: Math.round(diff),
      direction: tooLow ? 'IZQUIERDA ◄──' : 'DERECHA ──►',
      directionExplanation: tooLow
        ? '(Izquierda = SACAR barras = Aumenta potencia)'
        : '(Derecha = METER barras = Reduce potencia)',
      currentPosition: Math.round(controlRodsInserted),
      targetPosition: tooLow ? '0–30% (barras fuera)' : '70–100% (barras dentro)',
      stepsNeeded,
      warning: 'NO lo hagas de una vez. Debe ser LENTO y CONTROLADO.',
      steps: tooLow ? [
        'Mueve 20% hacia izquierda (= +100 MW aprox)',
        'ESPERA 60 segundos',
        'Monitorea temperatura y presión',
        'Cuando estabilicen, siguiente escalón',
        'Repite hasta llegar a 500 MW',
      ] : [
        'Mueve 20% hacia derecha (= -100 MW aprox)',
        'ESPERA 60 segundos',
        'Monitorea temperatura y presión',
        'Cuando estabilicen, siguiente escalón',
        'Repite hasta llegar a 800 MW',
      ],
    };
  }

  static getAlerts({ state, tutorialMode, isRunning }) {
    if (!isRunning) return [];
    const alerts = [];

    if (state.power > 800 && state.power < 1500) {
      alerts.push({
        level: 'red',
        msg: `POTENCIA ALTA — ${state.power.toFixed(0)} MW (máximo recomendado: 800 MW)`,
        directive: tutorialMode
          ? 'Mueve BARRAS DE CONTROL HACIA LA DERECHA ──►   (Derecha = meter barras = menos potencia)'
          : 'BARRAS ──► para reducir potencia',
      });
    }

    if (state.power >= 1 && state.power < 500) {
      alerts.push({
        level: 'yellow',
        msg: `POTENCIA BAJA — ${state.power.toFixed(0)} MW  (objetivo: 500–800 MW)`,
        directive: tutorialMode
          ? 'Mueve BARRAS DE CONTROL HACIA LA IZQUIERDA ◄──   (Izquierda = sacar barras = más potencia)'
          : 'BARRAS ◄── para subir potencia',
      });
    }

    if (state.temperature > 550) {
      alerts.push({
        level: 'red',
        msg: `TEMPERATURA CRÍTICA — ${state.temperature.toFixed(0)} K  (límite: 600 K)`,
        directive: tutorialMode
          ? 'Mueve BARRAS DE CONTROL HACIA LA DERECHA ──► para reducir potencia y temperatura'
          : 'BARRAS ──►  o  ENFRIAMIENTO AUX ──►  (derecha = más enfriamiento)',
      });
    } else if (state.temperature > 500) {
      alerts.push({
        level: 'yellow',
        msg: `TEMPERATURA ELEVADA — ${state.temperature.toFixed(0)} K  (precaución > 500 K)`,
        directive: tutorialMode
          ? 'Considera mover BARRAS HACIA LA DERECHA ──► o espera que el sistema se estabilice'
          : 'Monitorea — o activa ENFRIAMIENTO AUX si sigue subiendo',
      });
    }

    if (state.pressure > 155) {
      alerts.push({
        level: 'red',
        msg: `PRESIÓN FUERA DE RANGO — ${state.pressure.toFixed(1)} bar  (límite: 160 bar)`,
        directive: tutorialMode
          ? 'La válvula de alivio se activará automáticamente. Puedes también reducir potencia con BARRAS ──►'
          : 'VÁLVULA ALIVIO ──►  (abre manual, baja presión)  o  BARRAS ──►',
      });
    } else if (state.pressure > 150) {
      alerts.push({
        level: 'yellow',
        msg: `PRESIÓN ELEVADA — ${state.pressure.toFixed(1)} bar  (válvula abre a 155 bar)`,
        directive: tutorialMode
          ? 'Precaución: la válvula de alivio automática se activa a 155 bar'
          : 'Monitorea — si sube, abre VÁLVULA ALIVIO ──►',
      });
    }

    if (state.coolantFlow < 30) {
      alerts.push({
        level: 'red',
        msg: `FLUJO REFRIGERANTE CRÍTICO — ${state.coolantFlow.toFixed(0)}%  (SCRAM a < 30%)`,
        directive: tutorialMode
          ? '¡URGENTE! Verifica que la BOMBA esté encendida. Si está ON, puede estar fallando.'
          : 'BOMBA VELOCIDAD ──►  →  BOMBA RESPALDO ON  →  ENFRIAMIENTO AUX ──►',
      });
    } else if (state.coolantFlow < 50) {
      alerts.push({
        level: 'yellow',
        msg: `FLUJO REFRIGERANTE BAJO — ${state.coolantFlow.toFixed(0)}%  (mínimo seguro: 30%)`,
        directive: tutorialMode
          ? 'El flujo está bajo. Verifica que la BOMBA esté encendida.'
          : 'BOMBA VELOCIDAD ──►  para aumentar flujo refrigerante',
      });
    }

    if (state.reliefValveOpen) {
      alerts.push({
        level: 'yellow',
        msg: 'VÁLVULA DE ALIVIO ABIERTA — liberando presión automáticamente',
        directive: tutorialMode
          ? 'Sistema automático funcionando correctamente. Monitorea presión y flujo.'
          : 'Presión bajando. Flujo puede reducirse ~5%. Normal.',
      });
    }

    return alerts;
  }

  static getControlDirectionHint(control) {
    const hints = {
      BARRAS: {
        left:  '◄── IZQUIERDA = SACAR barras = Más reactividad = Sube potencia',
        right: 'DERECHA ──► = METER barras = Menos reactividad = Baja potencia',
      },
      BOMBA_VELOCIDAD: {
        right: 'DERECHA ──► = Más velocidad = Más flujo refrigerante = Baja temperatura',
        left:  '◄── IZQUIERDA = Menos velocidad = Menos flujo = Sube temperatura',
      },
      VALVULA_ALIVIO: {
        right: 'DERECHA ──► = Abre válvula = Baja presión = Libera vapor',
        left:  '◄── IZQUIERDA = Cierra válvula = Sube presión',
      },
      ENFRIAMIENTO_AUX: {
        right: 'DERECHA ──► = Más enfriamiento auxiliar = Baja temperatura',
        left:  '◄── IZQUIERDA = Menos enfriamiento auxiliar',
      },
    };
    return hints[control] || {};
  }
}
