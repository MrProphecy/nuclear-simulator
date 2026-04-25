import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, RotateCcw } from 'lucide-react';
import { DecayHeatVisualization } from './DecayHeatVisualization';
import { PostScramInvestigation } from './PostScramInvestigation';
import { INVESTIGATION_STEPS, isInvestigationComplete, investigationProgress, getScramDetails } from '../utils/ScramInvestigationLogic';

// Constants
const COUNTDOWN_SECONDS = 120; // 2 minutes real time (represents ~120 min real world)

function formatCountdown(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function StatusBadge({ label, value, ok, warning }) {
  const color = ok ? 'bg-green-950/40 border-green-700/30 text-green-300'
    : warning ? 'bg-yellow-950/40 border-yellow-700/30 text-yellow-300'
    : 'bg-red-950/40 border-red-700/30 text-red-300';
  return (
    <div className={`flex flex-col items-center px-3 py-2 rounded-lg border ${color}`}>
      <span className="text-xs text-slate-500 mb-0.5">{label}</span>
      <span className="text-sm font-bold font-mono">{value}</span>
    </div>
  );
}

// ── MODO LIBRE (Professional compact view) ──────────────────────────────────
function FreeModeView({ state, countdown, investigationSteps, onCompleteStep, canRestart, onRestart, onReset, scramDetails }) {
  const invDone = isInvestigationComplete(investigationSteps);
  const tempOk = state.temperature < 350;
  const timerDone = countdown <= 0;

  return (
    <div className="bg-slate-900/90 border border-red-700/40 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-bold text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          SCRAM AUTOMÁTICO — Recuperación en progreso
        </h2>
        <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${timerDone ? 'text-green-300 bg-green-950/40' : 'text-orange-300 bg-orange-950/40'}`}>
          {timerDone ? '00:00:00' : formatCountdown(countdown)}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <StatusBadge label="Temperatura" value={`${state.temperature.toFixed(0)}K`} ok={tempOk} warning={state.temperature < 500} />
        <StatusBadge label="Calor residual" value={`${(state.residualHeat ?? 0).toFixed(1)} MW`} ok={(state.residualHeat ?? 0) < 10} warning={(state.residualHeat ?? 0) < 30} />
        <StatusBadge label="Refrigeración" value={`${state.coolantFlow.toFixed(0)}%`} ok={state.coolantFlow >= 70} warning={state.coolantFlow >= 30} />
        <StatusBadge label="Barras" value={`${state.controlRodsInserted.toFixed(0)}%`} ok={state.controlRodsInserted === 100} />
      </div>

      {/* Causa del SCRAM */}
      <div className="text-xs text-slate-400 mb-3">
        <span className="text-slate-500">Causa: </span>
        <span className="text-orange-300 font-semibold">{scramDetails.triggerDesc}</span>
      </div>

      {/* Investigación compacta */}
      <div className="space-y-1 mb-3">
        {INVESTIGATION_STEPS.map(step => (
          <div key={step.id} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
              investigationSteps[step.id] ? 'bg-green-500 border-green-500' : 'border-slate-500'
            }`}>
              {investigationSteps[step.id] && (
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className={`text-xs ${investigationSteps[step.id] ? 'text-green-300 line-through decoration-green-700' : 'text-slate-400'}`}>
              {step.title}
            </span>
            {!investigationSteps[step.id] && (
              <button
                onClick={() => onCompleteStep(step.id === 'step4_approved' ? 'step4_approved' : step.id)}
                className="ml-auto text-xs px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition flex-shrink-0"
              >
                {step.buttonLabel}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Conditions summary */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${timerDone ? 'bg-green-900/50 text-green-300' : 'bg-orange-900/50 text-orange-300'}`}>
          {timerDone ? '✓ Temporizador' : `⏱ ${formatCountdown(countdown)}`}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${tempOk ? 'bg-green-900/50 text-green-300' : 'bg-orange-900/50 text-orange-300'}`}>
          {tempOk ? '✓ Temperatura' : `T: ${state.temperature.toFixed(0)}K → <350K`}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${invDone ? 'bg-green-900/50 text-green-300' : 'bg-orange-900/50 text-orange-300'}`}>
          {invDone ? '✓ Investigación' : `Investigación (${investigationProgress(investigationSteps)}%)`}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onRestart}
          disabled={!canRestart}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition ${
            canRestart
              ? 'bg-green-700 hover:bg-green-600 text-white'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          {canRestart ? 'Reiniciar operación' : 'Esperando condiciones...'}
        </button>
        <button
          onClick={onReset}
          className="py-2 px-3 rounded-lg text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 transition"
        >
          Reinicio completo
        </button>
      </div>
    </div>
  );
}

// ── MODO TUTORIAL (Educational full view) ────────────────────────────────────
function TutorialModeView({ state, countdown, investigationSteps, onCompleteStep, canRestart, onRestart, onReset, scramDetails }) {
  const invDone = isInvestigationComplete(investigationSteps);
  const tempOk = state.temperature < 350;
  const timerDone = countdown <= 0;
  const pct = (1 - Math.max(0, countdown) / COUNTDOWN_SECONDS) * 100;

  return (
    <div className="bg-gradient-to-br from-slate-900/95 to-red-950/10 border border-red-600/40 rounded-xl p-5 mb-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <span className="text-2xl">🛑</span>
            SCRAM AUTOMÁTICO ACTIVADO
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            {scramDetails.title} — Procedimiento de recuperación en curso
          </p>
        </div>
        <div className={`text-right px-3 py-2 rounded-lg ${timerDone ? 'bg-green-950/40 border border-green-700/30' : 'bg-slate-800/60 border border-slate-600/30'}`}>
          <p className="text-xs text-slate-500 mb-0.5">Tiempo restante</p>
          <p className={`text-xl font-bold font-mono ${timerDone ? 'text-green-400' : 'text-orange-300'}`}>
            {formatCountdown(countdown)}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">(= ~120 min en central real)</p>
        </div>
      </div>

      {/* Current state panel */}
      <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4">
        <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Estado actual del reactor</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <StatusBadge label="Temperatura" value={`${state.temperature.toFixed(0)}K`} ok={tempOk} warning={state.temperature < 500} />
          <StatusBadge label="Calor residual" value={`${(state.residualHeat ?? 0).toFixed(1)} MW`} ok={(state.residualHeat ?? 0) < 10} warning={(state.residualHeat ?? 0) < 30} />
          <StatusBadge label="Refrigeración" value={`${state.coolantFlow.toFixed(0)}%`} ok={state.coolantFlow >= 70} warning={state.coolantFlow >= 30} />
          <StatusBadge label="Barras control" value={`${state.controlRodsInserted.toFixed(0)}%`} ok={state.controlRodsInserted === 100} />
        </div>

        {/* Educational explanation */}
        <div className="bg-blue-950/30 border border-blue-700/30 rounded-lg p-3 text-xs text-blue-100 leading-relaxed">
          <p className="font-bold text-blue-300 mb-1.5">¿Qué está pasando ahora?</p>
          <p className="mb-2">
            La reacción nuclear se <span className="text-green-300 font-bold">DETUVO COMPLETAMENTE</span> con el SCRAM.
            La potencia es 0 MW y las barras están 100% insertadas.
          </p>
          <p className="mb-2">
            <span className="text-yellow-300 font-bold">PERO</span> el combustible todavía contiene calor residual de los productos de fisión
            que se generaron mientras la reacción estaba activa. Este calor se llama <span className="text-orange-300 font-semibold">calor de decaimiento</span>.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="bg-green-950/40 border border-green-700/30 rounded p-2">
              <p className="font-bold text-green-300 mb-1">Con refrigeración activa:</p>
              <p className="text-green-100 text-xs">→ Calor se disipa correctamente</p>
              <p className="text-green-100 text-xs">→ Temperatura baja lentamente</p>
              <p className="text-green-100 text-xs">→ Reactor se enfría de forma segura</p>
            </div>
            <div className="bg-red-950/40 border border-red-700/30 rounded p-2">
              <p className="font-bold text-red-300 mb-1">Sin refrigeración:</p>
              <p className="text-red-100 text-xs">→ Calor NO se disipa</p>
              <p className="text-red-100 text-xs">→ Temperatura sube de nuevo</p>
              <p className="text-red-100 text-xs">→ En minutos: fusión de combustible</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decay heat visualization */}
      <DecayHeatVisualization
        currentTemp={state.temperature}
        residualHeat={state.residualHeat ?? 0}
        refrigerationActive={state.coolantFlow >= 30}
        postScramSeconds={state.postScramSeconds ?? 0}
      />

      {/* Countdown progress */}
      <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            Período obligatorio de enfriamiento
          </h3>
          <span className={`text-xs font-bold font-mono ${timerDone ? 'text-green-400' : 'text-orange-300'}`}>
            {timerDone ? 'COMPLETADO ✓' : formatCountdown(countdown)}
          </span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden mb-2">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-orange-500 via-yellow-400 to-green-500 transition-all duration-1000"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="grid grid-cols-3 text-center text-xs text-slate-500 mb-3">
          <span>0 min (SCRAM)</span>
          <span>1 min (≈ 60 min real)</span>
          <span>2 min (≈ 120 min real)</span>
        </div>
        <div className="bg-slate-900/40 border border-slate-700/30 rounded-lg p-2.5 text-xs text-slate-400">
          <p>
            <span className="text-white font-semibold">En una central nuclear real:</span>{' '}
            El protocolo de recuperación post-SCRAM requiere un mínimo de 2 horas de enfriamiento,
            más 1–4 horas de investigación obligatoria antes de cualquier intento de reinicio.
          </p>
        </div>
      </div>

      {/* Investigation */}
      <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4">
        <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-1">Investigación obligatoria</h3>
        <p className="text-slate-400 text-xs mb-4">
          Antes de reintentar la operación, debes completar los 4 pasos de la investigación.
        </p>
        <PostScramInvestigation
          investigationSteps={investigationSteps}
          onCompleteStep={onCompleteStep}
          scramDetails={scramDetails}
          events={state.events}
          operationLog={state.operationLog}
        />
      </div>

      {/* Conditions checklist */}
      <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4">
        <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Condiciones para reinicio</h3>
        <div className="space-y-2">
          {[
            {
              label: 'Temporizador completado (2 min)',
              sublabel: timerDone ? 'Período de enfriamiento completado' : `Tiempo restante: ${formatCountdown(countdown)}`,
              done: timerDone,
            },
            {
              label: 'Temperatura < 350K',
              sublabel: tempOk ? `Temperatura actual: ${state.temperature.toFixed(0)}K ✓` : `Temperatura actual: ${state.temperature.toFixed(0)}K — esperando enfriamiento`,
              done: tempOk,
            },
            {
              label: 'Investigación completa (4/4 pasos)',
              sublabel: invDone ? 'Todos los pasos completados' : `${INVESTIGATION_STEPS.filter(s => investigationSteps[s.id]).length}/4 pasos completados`,
              done: invDone,
            },
          ].map(({ label, sublabel, done }, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${
                done ? 'bg-green-950/30 border-green-700/30' : 'bg-slate-900/40 border-slate-700/30'
              }`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                done ? 'bg-green-500 border-green-500' : 'border-slate-500'
              }`}>
                {done && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${done ? 'text-green-300' : 'text-slate-300'}`}>{label}</p>
                <p className={`text-xs ${done ? 'text-green-500' : 'text-slate-500'}`}>{sublabel}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Restart button */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={onRestart}
            disabled={!canRestart}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition ${
              canRestart
                ? 'bg-green-700 hover:bg-green-600 text-white shadow-lg shadow-green-900/40'
                : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
            }`}
          >
            {canRestart
              ? '⚛️ Reiniciar operación del reactor'
              : `Esperando condiciones (${[!timerDone, !tempOk, !invDone].filter(Boolean).length} pendientes)...`}
          </button>
          <button
            onClick={onReset}
            className="py-3 px-4 rounded-xl text-sm text-slate-400 bg-slate-800/50 hover:bg-slate-700 transition"
          >
            Reinicio completo
          </button>
        </div>
      </div>

      {/* Real world reference note */}
      <div className="bg-slate-800/40 border border-slate-600/30 rounded-xl p-4">
        <p className="text-xs font-bold text-slate-300 mb-2">Referencia histórica: Three Mile Island (TMI-2, 1979)</p>
        <p className="text-xs text-slate-400 leading-relaxed">
          El SCRAM automático funcionó correctamente en TMI. El desastre fue causado por que los operadores
          <span className="text-yellow-300 font-semibold"> no entendían el estado del reactor tras el SCRAM</span>.
          Abrieron manualmente una válvula de alivio atascada pensando que la presión era alta cuando en realidad
          el refrigerante se estaba perdiendo. Resultado: fusión parcial del núcleo por pérdida de refrigerante.
        </p>
        <p className="text-xs text-slate-500 mt-1.5 italic">
          Lección: La investigación y comprensión post-SCRAM son tan importantes como el SCRAM en sí.
        </p>
      </div>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export function PostScramRecovery({
  tutorialMode,
  state,
  countdown,
  investigationSteps,
  onCompleteStep,
  onRestart,
  onReset,
}) {
  const scramDetails = getScramDetails(state.operationLog);
  const invDone = isInvestigationComplete(investigationSteps);
  const tempOk = state.temperature < 350;
  const timerDone = countdown <= 0;
  const canRestart = timerDone && tempOk && invDone;

  if (!state.emergencyShutdown) return null;

  const props = { state, countdown, investigationSteps, onCompleteStep, canRestart, onRestart, onReset, scramDetails };

  return tutorialMode
    ? <TutorialModeView {...props} />
    : <FreeModeView {...props} />;
}
