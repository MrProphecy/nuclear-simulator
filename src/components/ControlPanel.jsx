import React from 'react';
import { AlertTriangle, Zap, Droplets, Radio, Gauge, Play, Pause, RotateCcw } from 'lucide-react';

export function ControlPanel({ sim, isRunning, onToggle, onReset, onLoadScenario, scenario }) {
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      {/* CONTROLES PRINCIPALES */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-4">CONTROLES DEL OPERADOR</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={onToggle}
            className={`font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
              isRunning
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isRunning ? 'PAUSAR' : 'INICIAR'}
          </button>

          <button
            onClick={onReset}
            className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-5 h-5" />
            RESETEAR
          </button>

          <button
            onClick={() => sim.increasePower(0.5)}
            disabled={!isRunning}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Zap className="w-5 h-5" />
            POTENCIA+
          </button>

          <button
            onClick={() => sim.insertControlRods(5)}
            disabled={!isRunning || sim.failures.controlRodsStuck}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Gauge className="w-5 h-5" />
            BARRAS+
          </button>

          <button
            onClick={() => sim.withdrawControlRods(5)}
            disabled={!isRunning || sim.failures.controlRodsStuck}
            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Gauge className="w-5 h-5" />
            BARRAS-
          </button>

          <button
            onClick={() => sim.togglePump()}
            disabled={!isRunning}
            className={`font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
              sim.pumpRunning
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            } disabled:bg-slate-600 disabled:cursor-not-allowed text-white`}
          >
            <Droplets className="w-5 h-5" />
            {sim.pumpRunning ? 'BOMBA ON' : 'BOMBA OFF'}
          </button>

          <button
            onClick={() => sim.emergencyScram()}
            disabled={!isRunning || sim.emergencyShutdown}
            className="bg-red-700 hover:bg-red-800 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition animate-pulse"
          >
            <AlertTriangle className="w-5 h-5" />
            SCRAM
          </button>

          {sim.emergencyShutdown && (
            <button
              onClick={() => sim.resetFromScram()}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition col-span-2 md:col-span-1"
            >
              RECUPERAR
            </button>
          )}
        </div>
      </div>

      {/* ESCENARIOS */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-4">ESCENARIOS</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => onLoadScenario('normal')}
            className={`py-2 px-4 rounded font-bold text-sm transition ${
              scenario === 'normal'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            ✓ Normal
          </button>

          <button
            onClick={() => onLoadScenario('loca')}
            className={`py-2 px-4 rounded font-bold text-sm transition ${
              scenario === 'loca'
                ? 'bg-yellow-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            ⚠️ LOCA
          </button>

          <button
            onClick={() => onLoadScenario('chernobyl')}
            className={`py-2 px-4 rounded font-bold text-sm transition ${
              scenario === 'chernobyl'
                ? 'bg-red-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            💣 Chernobyl
          </button>

          <button
            onClick={() => onLoadScenario('fukushima')}
            className={`py-2 px-4 rounded font-bold text-sm transition ${
              scenario === 'fukushima'
                ? 'bg-red-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            🌊 Fukushima
          </button>
        </div>
      </div>

      {/* FALLOS SIMULABLES */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-4">INYECTAR FALLOS (Avanzado)</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => sim.causePumpFailure()}
            disabled={!isRunning || sim.failures.pumpFailure}
            className="bg-red-700 hover:bg-red-800 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded text-sm transition"
          >
            Fallo Bomba
          </button>

          <button
            onClick={() => sim.causeCoolantLeak()}
            disabled={!isRunning || sim.failures.coolantLeak}
            className="bg-red-700 hover:bg-red-800 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded text-sm transition"
          >
            Pérdida Refrigerante
          </button>

          <button
            onClick={() => sim.disableSafetySystems()}
            disabled={!isRunning || !sim.safetySystemsActive}
            className="bg-red-700 hover:bg-red-800 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded text-sm transition"
          >
            Desactivar Seguridad
          </button>

          <button
            onClick={() => {
              sim.failures.controlRodsStuck = true;
              sim.logEvent('❌ Barras de control ATASCADAS', 'critical');
            }}
            disabled={!isRunning || sim.failures.controlRodsStuck}
            className="bg-red-700 hover:bg-red-800 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded text-sm transition"
          >
            Barras Atascadas
          </button>
        </div>
      </div>
    </div>
  );
}
