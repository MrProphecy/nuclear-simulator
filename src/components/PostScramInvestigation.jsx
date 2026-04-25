import React, { useState } from 'react';
import { CheckCircle, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { INVESTIGATION_STEPS, getScramDetails } from '../utils/ScramInvestigationLogic';

function SystemCheckRow({ name, expected, ok }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${ok ? 'bg-green-950/30 border-green-700/30' : 'bg-yellow-950/30 border-yellow-700/30'}`}>
      <span className={`text-base flex-shrink-0 ${ok ? 'text-green-400' : 'text-yellow-400'}`}>{ok ? '✓' : '!'}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${ok ? 'text-green-300' : 'text-yellow-300'}`}>{name}</p>
        <p className="text-xs text-slate-400">{expected}</p>
      </div>
      <span className={`text-xs font-bold flex-shrink-0 ${ok ? 'text-green-400' : 'text-yellow-400'}`}>
        {ok ? 'OK' : 'VERIFICAR'}
      </span>
    </div>
  );
}

function StepPanel({ step, completed, onComplete, scramDetails, events, operationLog }) {
  const [expanded, setExpanded] = useState(false);

  const handleAction = () => {
    setExpanded(e => !e);
    if (!expanded && !completed) {
      // Auto-complete steps 1, 2, 3 when opened; step 4 requires explicit confirm
      if (step.id !== 'step4_approved') {
        setTimeout(() => onComplete(step.id), 800);
      }
    }
  };

  const handleConfirm = () => {
    onComplete(step.id);
  };

  return (
    <div className={`rounded-xl border transition-all duration-200 ${
      completed
        ? 'bg-green-950/20 border-green-700/30'
        : expanded
        ? 'bg-slate-800/60 border-blue-600/40'
        : 'bg-slate-800/40 border-slate-700/40'
    }`}>
      {/* Step header */}
      <button
        onClick={handleAction}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all ${
          completed ? 'bg-green-500 border-green-500' : 'border-slate-500 bg-slate-800'
        }`}>
          {completed ? (
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <span className="text-xs text-slate-400 font-bold">{step.number}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${completed ? 'text-green-300' : 'text-white'}`}>
            {step.title}
          </p>
          <p className="text-xs text-slate-400 truncate">
            {completed ? step.completedLabel : step.shortDesc}
          </p>
        </div>

        <span className="flex-shrink-0 text-slate-500">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-700/40 pt-3">
          {/* Step 1: Cause analysis */}
          {step.id === 'step1_cause' && (
            <>
              <div className="bg-red-950/30 border border-red-700/30 rounded-lg p-3 space-y-2">
                <p className="text-red-400 text-xs font-bold uppercase tracking-wider">Causa del SCRAM</p>
                <p className="text-red-100 text-sm font-semibold">{scramDetails.triggerDesc}</p>
              </div>
              <div className="bg-orange-950/30 border border-orange-700/30 rounded-lg p-3 space-y-2">
                <p className="text-orange-400 text-xs font-bold uppercase tracking-wider">Error principal</p>
                <p className="text-orange-100 text-xs leading-relaxed">{scramDetails.primaryError}</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-600/30 rounded-lg p-3">
                <p className="text-slate-300 text-xs font-bold mb-2">Cómo evitarlo próxima vez:</p>
                <div className="space-y-1.5">
                  {scramDetails.howToAvoid.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-cyan-500 flex-shrink-0 font-bold mt-0.5">{i + 1}.</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
              {!completed && (
                <p className="text-xs text-blue-400 animate-pulse">Leyendo análisis... se marcará como completado automáticamente.</p>
              )}
            </>
          )}

          {/* Step 2: Systems verification */}
          {step.id === 'step2_systems' && (
            <>
              <p className="text-xs text-slate-400 mb-2">Estado de todos los sistemas de seguridad tras el SCRAM:</p>
              <div className="space-y-2">
                {scramDetails.systems.map((sys, i) => (
                  <SystemCheckRow key={i} {...sys} />
                ))}
              </div>
              <div className="bg-blue-950/30 border border-blue-700/30 rounded-lg p-3 mt-2">
                <p className="text-blue-300 text-xs leading-relaxed">
                  <span className="font-bold">Principio de defensa en profundidad:</span> Los reactores nucleares tienen múltiples
                  capas de seguridad independientes. Aunque el operador cometa errores, los sistemas automáticos protegen el reactor.
                </p>
              </div>
              {!completed && (
                <p className="text-xs text-blue-400 animate-pulse">Verificando sistemas... se marcará como completado automáticamente.</p>
              )}
            </>
          )}

          {/* Step 3: Event logs */}
          {step.id === 'step3_logs' && (
            <>
              <p className="text-xs text-slate-400 mb-2">Historial de eventos registrados durante el incidente:</p>
              <div className="bg-slate-950/70 rounded-lg border border-slate-700/40 overflow-hidden">
                <div className="max-h-48 overflow-y-auto font-mono text-xs">
                  {(events ?? []).slice(-15).reverse().map((e, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2 px-3 py-1.5 border-b border-slate-800/50 ${
                        e.level === 'critical' ? 'text-red-400' : e.level === 'warning' ? 'text-yellow-400' : 'text-slate-400'
                      }`}
                    >
                      <span className="flex-shrink-0 w-12 tabular-nums text-slate-600">{parseFloat(e.time).toFixed(1)}s</span>
                      <span>{e.message}</span>
                    </div>
                  ))}
                  {(events ?? []).length === 0 && (
                    <p className="px-3 py-2 text-slate-600">Sin eventos registrados.</p>
                  )}
                </div>
              </div>
              {!completed && (
                <p className="text-xs text-blue-400 animate-pulse">Revisando historial... se marcará como completado automáticamente.</p>
              )}
            </>
          )}

          {/* Step 4: Approval */}
          {step.id === 'step4_approved' && (
            <>
              <div className="bg-slate-800/60 border border-slate-600/30 rounded-lg p-3 space-y-2">
                <p className="text-white text-xs font-bold">Caso de referencia histórico:</p>
                <p className="text-slate-300 text-xs leading-relaxed italic">"{scramDetails.realWorldCase}"</p>
              </div>
              <div className="bg-blue-950/30 border border-blue-700/30 rounded-lg p-3">
                <p className="text-blue-300 text-xs leading-relaxed">
                  En una central nuclear real, el procedimiento de reinvestigación y aprobación toma entre
                  <span className="font-bold text-blue-200"> 1 y 4 horas</span>. Requiere la firma del supervisor
                  de turno, revisión del ingeniero de seguridad y confirmación del jefe de planta.
                </p>
              </div>
              {!completed ? (
                <button
                  onClick={handleConfirm}
                  className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition"
                >
                  Entiendo qué pasó y cómo evitarlo — Aprobar reinicio
                </button>
              ) : (
                <div className="flex items-center gap-2 text-green-300 text-xs">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Reinicio aprobado por el operador</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function PostScramInvestigation({ investigationSteps, onCompleteStep, scramDetails, events, operationLog }) {
  const completedCount = INVESTIGATION_STEPS.filter(s => investigationSteps[s.id]).length;
  const total = INVESTIGATION_STEPS.length;
  const progress = Math.round((completedCount / total) * 100);

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
          Investigación obligatoria — {completedCount}/{total} pasos
        </p>
        <span className="text-xs font-mono text-white">{progress}%</span>
      </div>
      <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-3">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      {INVESTIGATION_STEPS.map(step => (
        <StepPanel
          key={step.id}
          step={step}
          completed={investigationSteps[step.id]}
          onComplete={onCompleteStep}
          scramDetails={scramDetails}
          events={events}
          operationLog={operationLog}
        />
      ))}
    </div>
  );
}
