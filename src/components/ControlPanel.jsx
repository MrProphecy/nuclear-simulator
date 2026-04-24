import React from 'react';
import { AlertTriangle, Zap, Droplets, Gauge, Play, Pause, RotateCcw } from 'lucide-react';
import { Tooltip } from './Tooltip';

export function ControlPanel({ sim, isRunning, onToggle, onReset, onLoadScenario, scenario, tutorialMode, tutorialStep }) {
  const tutorialHighlight = (step) =>
    tutorialMode && tutorialStep === step
      ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-slate-800'
      : '';

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      {/* CONTROLES PRINCIPALES */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-4">CONTROLES DEL OPERADOR</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          <Tooltip text={isRunning ? 'Pausa la simulación del reactor' : 'Inicia la simulación del reactor nuclear'}>
            <button
              onClick={onToggle}
              className={`w-full font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
                isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              } text-white ${tutorialHighlight(3)}`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isRunning ? 'PAUSAR' : 'INICIAR'}
            </button>
          </Tooltip>

          <Tooltip text="Restablece todos los parámetros al estado inicial">
            <button
              onClick={onReset}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <RotateCcw className="w-5 h-5" />
              RESETEAR
            </button>
          </Tooltip>

          <Tooltip text="Aumenta la reactividad del reactor (más fisiones nucleares → más potencia)">
            <button
              onClick={() => sim.increasePower(0.5)}
              disabled={!isRunning}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Zap className="w-5 h-5" />
              POTENCIA+
            </button>
          </Tooltip>

          <Tooltip text="Inserta barras de boro → absorben neutrones → reduce la reactividad y baja la potencia">
            <button
              onClick={() => sim.insertControlRods(5)}
              disabled={!isRunning || sim.failures.controlRodsStuck}
              className={`w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition ${tutorialHighlight(4)}`}
            >
              <Gauge className="w-5 h-5" />
              BARRAS+
            </button>
          </Tooltip>

          <Tooltip text="Retira barras de control → más neutrones libres → aumenta la reactividad y sube la potencia">
            <button
              onClick={() => sim.withdrawControlRods(5)}
              disabled={!isRunning || sim.failures.controlRodsStuck}
              className={`w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition ${tutorialHighlight(4)}`}
            >
              <Gauge className="w-5 h-5" />
              BARRAS-
            </button>
          </Tooltip>

          <Tooltip
            text={
              sim.pumpRunning
                ? 'Apagar la bomba es peligroso — sin refrigerante la temperatura sube sin control'
                : 'Enciende la bomba de refrigerante para enfriar el núcleo del reactor'
            }
          >
            <button
              onClick={() => sim.togglePump()}
              disabled={!isRunning}
              className={`w-full font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
                sim.pumpRunning ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              } disabled:bg-slate-600 disabled:cursor-not-allowed text-white ${tutorialHighlight(2)}`}
            >
              <Droplets className="w-5 h-5" />
              {sim.pumpRunning ? 'BOMBA ON' : 'BOMBA OFF'}
            </button>
          </Tooltip>

          <Tooltip text="PARADA DE EMERGENCIA (SCRAM): inserta todas las barras al instante para detener la reacción">
            <button
              onClick={() => sim.emergencyScram()}
              disabled={!isRunning || sim.emergencyShutdown}
              className="w-full bg-red-700 hover:bg-red-800 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition animate-pulse"
            >
              <AlertTriangle className="w-5 h-5" />
              SCRAM
            </button>
          </Tooltip>

          {sim.emergencyShutdown && (
            <Tooltip text="Recupera el reactor del estado de parada de emergencia para reiniciar operación">
              <button
                onClick={() => sim.resetFromScram()}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
              >
                RECUPERAR
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* ESCENARIOS */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-4">ESCENARIOS</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Tooltip text="Operación normal estándar. Ideal para aprender y practicar" position="bottom">
            <button
              onClick={() => onLoadScenario('normal')}
              className={`w-full py-2 px-4 rounded font-bold text-sm transition ${
                scenario === 'normal' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              ✓ Normal
            </button>
          </Tooltip>
          <Tooltip text="Loss Of Coolant Accident: simula una brecha en el circuito de refrigeración" position="bottom">
            <button
              onClick={() => onLoadScenario('loca')}
              className={`w-full py-2 px-4 rounded font-bold text-sm transition ${
                scenario === 'loca' ? 'bg-yellow-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              ⚠️ LOCA
            </button>
          </Tooltip>
          <Tooltip text="Recrea Chernobyl 1986: alta potencia con sistemas de seguridad desactivados" position="bottom">
            <button
              onClick={() => onLoadScenario('chernobyl')}
              className={`w-full py-2 px-4 rounded font-bold text-sm transition ${
                scenario === 'chernobyl' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              💣 Chernobyl
            </button>
          </Tooltip>
          <Tooltip text="Recrea Fukushima 2011: el tsunami destruye la bomba de refrigeración" position="bottom">
            <button
              onClick={() => onLoadScenario('fukushima')}
              className={`w-full py-2 px-4 rounded font-bold text-sm transition ${
                scenario === 'fukushima' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              🌊 Fukushima
            </button>
          </Tooltip>
        </div>
      </div>

      {/* FALLOS SIMULABLES */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">INYECTAR FALLOS (Avanzado)</h3>
        <div className="grid grid-cols-2 gap-3">
          <Tooltip text="Detiene la bomba de refrigeración — el reactor pierde su sistema de enfriamiento principal">
            <button
              onClick={() => sim.causePumpFailure()}
              disabled={!isRunning || sim.failures.pumpFailure}
              className="w-full bg-red-700 hover:bg-red-800 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded text-sm transition"
            >
              Fallo Bomba
            </button>
          </Tooltip>
          <Tooltip text="Simula una brecha en el circuito primario: el refrigerante se escapa reduciendo el flujo al 50%">
            <button
              onClick={() => sim.causeCoolantLeak()}
              disabled={!isRunning || sim.failures.coolantLeak}
              className="w-full bg-red-700 hover:bg-red-800 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded text-sm transition"
            >
              Pérdida Refrigerante
            </button>
          </Tooltip>
          <Tooltip text="Desactiva el SCRAM automático — sin protecciones, la reacción puede ser incontrolable (como en Chernobyl)">
            <button
              onClick={() => sim.disableSafetySystems()}
              disabled={!isRunning || !sim.safetySystemsActive}
              className="w-full bg-red-700 hover:bg-red-800 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded text-sm transition"
            >
              Desactivar Seguridad
            </button>
          </Tooltip>
          <Tooltip text="Bloquea las barras de control en su posición actual — no se podrán mover manualmente">
            <button
              onClick={() => {
                sim.failures.controlRodsStuck = true;
                sim.logEvent('❌ Barras de control ATASCADAS', 'critical');
              }}
              disabled={!isRunning || sim.failures.controlRodsStuck}
              className="w-full bg-red-700 hover:bg-red-800 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded text-sm transition"
            >
              Barras Atascadas
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
