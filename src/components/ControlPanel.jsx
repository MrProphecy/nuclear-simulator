import React from 'react';
import { AlertTriangle, Zap, Droplets, Gauge, Play, Pause, RotateCcw, Activity } from 'lucide-react';
import { Tooltip } from './Tooltip';

function getParamStatus(param, value) {
  if (param === 'power') {
    if (value > 600) return 'red';
    if (value > 400) return 'yellow';
    return 'green';
  }
  if (param === 'temperature') {
    if (value > 550) return 'red';
    if (value > 500) return 'yellow';
    return 'green';
  }
  if (param === 'pressure') {
    if (value > 155) return 'red';
    if (value > 150) return 'yellow';
    return 'green';
  }
  if (param === 'coolantFlow') {
    return value < 30 ? 'red' : 'green';
  }
  return 'green';
}

const STATUS_COLORS = {
  red: {
    bg: 'bg-red-950/60',
    border: 'border-red-600/60',
    text: 'text-red-400',
    bar: 'bg-red-500',
  },
  yellow: {
    bg: 'bg-yellow-950/40',
    border: 'border-yellow-600/50',
    text: 'text-yellow-300',
    bar: 'bg-yellow-400',
  },
  green: {
    bg: 'bg-slate-800/70',
    border: 'border-slate-600/30',
    text: 'text-green-400',
    bar: 'bg-green-500',
  },
};

function ParamBar({ label, value, unit, maxDisplay, param, tooltip, decimals = 1 }) {
  const status = getParamStatus(param, value);
  const c = STATUS_COLORS[status];
  const pct = Math.min(100, Math.max(0, (value / maxDisplay) * 100));
  const displayVal = typeof value === 'number' ? value.toFixed(decimals) : value;

  return (
    <Tooltip text={tooltip} position="bottom">
      <div className={`rounded-lg px-3 py-2.5 border ${c.bg} ${c.border} transition-colors duration-500 cursor-help`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">{label}</span>
          <span className={`text-base font-bold tabular-nums ${c.text}`}>
            {displayVal} <span className="text-xs font-normal text-slate-500">{unit}</span>
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${c.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Tooltip>
  );
}

export function ControlPanel({
  sim, state, isRunning,
  onToggle, onReset, onLoadScenario,
  scenario, tutorialMode, tutorialStep, onStateChange,
}) {
  const tutorialHighlight = (step) =>
    tutorialMode && tutorialStep === step
      ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-slate-800'
      : '';

  const isStepPower = tutorialMode && tutorialStep === 5;

  const alerts = [];
  if (isRunning) {
    if (state.power > 600) {
      alerts.push({ msg: `POTENCIA alta — ${state.power.toFixed(0)} MW (máx recomendado 600 MW)`, level: 'red' });
    }
    if (state.temperature > 550) {
      alerts.push({ msg: `TEMPERATURA crítica — ${state.temperature.toFixed(0)} K (máx seguro 550 K)`, level: 'red' });
    } else if (state.temperature > 500) {
      alerts.push({ msg: `TEMPERATURA elevada — ${state.temperature.toFixed(0)} K (límite de 550 K próximo)`, level: 'yellow' });
    }
    if (state.pressure > 155) {
      alerts.push({ msg: `PRESIÓN fuera de rango — ${state.pressure.toFixed(1)} bar (máx seguro 155 bar)`, level: 'red' });
    } else if (state.pressure > 150) {
      alerts.push({ msg: `PRESIÓN elevada — ${state.pressure.toFixed(1)} bar (zona de precaución)`, level: 'yellow' });
    }
    if (state.coolantFlow < 30) {
      alerts.push({ msg: `FLUJO REFRIGERANTE crítico — ${state.coolantFlow.toFixed(0)}% (mínimo seguro 30%)`, level: 'red' });
    }
  }

  const handleRodSlider = (e) => {
    sim.setControlRods(parseInt(e.target.value, 10));
    onStateChange();
  };

  const sliderDisabled = sim.failures.controlRodsStuck || sim.emergencyShutdown;

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">

      {/* ══════════════════════════════════════
          PANEL DE ESTADO EN VIVO
      ══════════════════════════════════════ */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-bold text-white tracking-widest uppercase">Panel de Estado en Vivo</h3>
          <span className="relative flex h-2 w-2 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
        </div>

        {/* Alert banners */}
        {alerts.length > 0 && (
          <div className="mb-3 space-y-1.5">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`text-xs font-bold px-3 py-2 rounded-lg flex items-start gap-2 ${
                  a.level === 'red'
                    ? 'bg-red-900/80 text-red-300 border border-red-500/60 animate-pulse'
                    : 'bg-yellow-900/60 text-yellow-200 border border-yellow-500/50'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  ⚠️ ADVERTENCIA: {a.msg}
                  {a.level === 'red' && tutorialMode && (
                    <span className="block mt-0.5 font-normal opacity-80">
                      Esto es peligroso. Vuelve a estabilizar los controles.
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Parameter grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
          <ParamBar
            label="Potencia"
            value={state.power}
            unit="MW"
            maxDisplay={1000}
            param="power"
            decimals={0}
            tooltip="Potencia: Energía producida. Se mide en Megavatios (MW). Verde < 400 MW · Amarillo 400–600 MW · Rojo > 600 MW"
          />
          <ParamBar
            label="Temperatura"
            value={state.temperature}
            unit="K"
            maxDisplay={700}
            param="temperature"
            decimals={0}
            tooltip="Temperatura: Calor del núcleo. Verde < 500 K · Amarillo 500–550 K · Rojo > 550 K (peligro de fusión del núcleo)"
          />
          <ParamBar
            label="Presión"
            value={state.pressure}
            unit="bar"
            maxDisplay={170}
            param="pressure"
            decimals={1}
            tooltip="Presión: Estrés del circuito primario. Verde < 150 bar · Amarillo 150–155 bar · Rojo > 155 bar. SCRAM automático a 160 bar"
          />

          {/* Coolant flow — custom because threshold is inverted */}
          <Tooltip
            text="Flujo Refrigerante: Circulación del agua de enfriamiento. Verde ≥ 30% (seguro) · Rojo < 30% (emergencia LOCA)"
            position="bottom"
          >
            <div
              className={`rounded-lg px-3 py-2.5 border cursor-help transition-colors duration-500 ${
                state.coolantFlow < 30
                  ? 'bg-red-950/60 border-red-600/60'
                  : 'bg-slate-800/70 border-slate-600/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Flujo Refrigerante</span>
                <span className={`text-base font-bold tabular-nums ${state.coolantFlow < 30 ? 'text-red-400' : 'text-green-400'}`}>
                  {state.coolantFlow.toFixed(0)} <span className="text-xs font-normal text-slate-500">%</span>
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${state.coolantFlow < 30 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(100, state.coolantFlow)}%` }}
                />
              </div>
            </div>
          </Tooltip>

          {/* Pump status */}
          <Tooltip
            text="Estado Bomba: La bomba de refrigeración debe estar siempre ON durante operación. Sin bomba el reactor sobrecalienta en segundos"
            position="bottom"
          >
            <div
              className={`rounded-lg px-3 py-2.5 border cursor-help transition-colors duration-500 ${
                state.pumpRunning
                  ? 'bg-green-950/30 border-green-600/40'
                  : 'bg-red-950/60 border-red-600/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Estado Bomba</span>
                <span className={`text-base font-bold ${state.pumpRunning ? 'text-green-400' : 'text-red-400 animate-pulse'}`}>
                  {state.pumpRunning ? '● ON' : '○ OFF'}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${state.pumpRunning ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: state.pumpRunning ? '100%' : '0%' }}
                />
              </div>
            </div>
          </Tooltip>

          {/* Control rods % */}
          <Tooltip
            text="Barras de Control: Varillas de boro que absorben neutrones. Más % = menos reacción = menos potencia"
            position="bottom"
          >
            <div className="rounded-lg px-3 py-2.5 border bg-cyan-950/30 border-cyan-700/40 cursor-help">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">% Barras Control</span>
                <span className="text-base font-bold text-cyan-400 tabular-nums">
                  {state.controlRodsInserted.toFixed(0)} <span className="text-xs font-normal text-slate-500">%</span>
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${state.controlRodsInserted}%` }}
                />
              </div>
            </div>
          </Tooltip>
        </div>

        {/* ── SLIDER DE BARRAS DE CONTROL ── */}
        <div
          id="control-rods-slider"
          className={`rounded-xl p-4 border transition-all duration-300 ${
            isStepPower
              ? 'border-red-500 bg-red-950/20 ring-2 ring-red-500/50 shadow-lg shadow-red-900/30'
              : 'border-cyan-700/40 bg-cyan-950/10'
          }`}
        >
          {isStepPower && (
            <div className="flex items-center justify-center gap-3 mb-3 text-red-400 text-xs font-bold uppercase tracking-wide">
              <span className="text-lg animate-bounce">▼</span>
              <span className="animate-pulse">Mueve este slider para controlar la potencia</span>
              <span className="text-lg animate-bounce">▼</span>
            </div>
          )}

          <div className="flex items-center justify-between mb-2">
            <Tooltip text="Barras de Control: Varillas de boro que absorben neutrones. Más % = menos reacción = menos potencia">
              <span className="text-cyan-300 text-sm font-bold cursor-help">
                Barras de Control: {state.controlRodsInserted.toFixed(0)}%
              </span>
            </Tooltip>
            <span className="text-slate-500 text-xs">0% = máx potencia · 100% = mín potencia</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={Math.round(state.controlRodsInserted)}
            onChange={handleRodSlider}
            disabled={sliderDisabled}
            className="control-rods-slider"
          />

          <div className="flex justify-between text-xs mt-1">
            <span className="text-orange-400">0% — Máx potencia</span>
            <span className="text-slate-400 font-mono tabular-nums">{state.controlRodsInserted.toFixed(0)}%</span>
            <span className="text-green-400">100% — Control total</span>
          </div>

          {sliderDisabled && (
            <p className="text-xs text-red-400 mt-1.5 text-center">
              {sim.failures.controlRodsStuck ? '❌ Barras atascadas — no se pueden mover' : '🛑 SCRAM activo — barras bloqueadas'}
            </p>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          CONTROLES DEL OPERADOR
      ══════════════════════════════════════ */}
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
              onClick={() => { sim.increasePower(0.5); onStateChange(); }}
              disabled={!isRunning}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Zap className="w-5 h-5" />
              POTENCIA+
            </button>
          </Tooltip>

          <Tooltip text="Inserta barras de boro → absorben neutrones → reduce la reactividad y baja la potencia">
            <button
              onClick={() => { sim.insertControlRods(5); onStateChange(); }}
              disabled={!isRunning || sim.failures.controlRodsStuck}
              className={`w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition ${tutorialHighlight(5)}`}
            >
              <Gauge className="w-5 h-5" />
              BARRAS+
            </button>
          </Tooltip>

          <Tooltip text="Retira barras de control → más neutrones libres → aumenta la reactividad y sube la potencia">
            <button
              onClick={() => { sim.withdrawControlRods(5); onStateChange(); }}
              disabled={!isRunning || sim.failures.controlRodsStuck}
              className={`w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition ${tutorialHighlight(5)}`}
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
              onClick={() => { sim.togglePump(); onStateChange(); }}
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
              onClick={() => { sim.emergencyScram(); onStateChange(); }}
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
                onClick={() => { sim.resetFromScram(); onStateChange(); }}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
              >
                RECUPERAR
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          ESCENARIOS
      ══════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════
          FALLOS SIMULABLES
      ══════════════════════════════════════ */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">INYECTAR FALLOS (Avanzado)</h3>
        <div className="grid grid-cols-2 gap-3">
          <Tooltip text="Detiene la bomba de refrigeración — el reactor pierde su sistema de enfriamiento principal">
            <button
              onClick={() => { sim.causePumpFailure(); onStateChange(); }}
              disabled={!isRunning || sim.failures.pumpFailure}
              className="w-full bg-red-700 hover:bg-red-800 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded text-sm transition"
            >
              Fallo Bomba
            </button>
          </Tooltip>
          <Tooltip text="Simula una brecha en el circuito primario: el refrigerante se escapa reduciendo el flujo al 50%">
            <button
              onClick={() => { sim.causeCoolantLeak(); onStateChange(); }}
              disabled={!isRunning || sim.failures.coolantLeak}
              className="w-full bg-red-700 hover:bg-red-800 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded text-sm transition"
            >
              Pérdida Refrigerante
            </button>
          </Tooltip>
          <Tooltip text="Desactiva el SCRAM automático — sin protecciones, la reacción puede ser incontrolable (como en Chernobyl)">
            <button
              onClick={() => { sim.disableSafetySystems(); onStateChange(); }}
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
                onStateChange();
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
