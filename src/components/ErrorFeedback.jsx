import React, { useState } from 'react';
import { AlertTriangle, X, ChevronRight, BookOpen, RotateCcw } from 'lucide-react';
import { HISTORICAL_CASES } from '../utils/HistoricalCases';

const SEVERITY_STYLES = {
  warning:  { border: 'border-yellow-500',  header: 'bg-yellow-900/60',  badge: 'bg-yellow-800 text-yellow-200',  accent: 'text-yellow-300' },
  error:    { border: 'border-orange-500',  header: 'bg-orange-900/60',  badge: 'bg-orange-800 text-orange-200',  accent: 'text-orange-300' },
  critical: { border: 'border-red-500',     header: 'bg-red-900/60',     badge: 'bg-red-800 text-red-200',        accent: 'text-red-300'    },
};

function Section({ number, title, color = 'text-slate-300', children }) {
  return (
    <div className="space-y-2">
      <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${color}`}>
        <span className="bg-slate-700 rounded-full w-5 h-5 flex items-center justify-center text-white font-mono text-xs flex-shrink-0">
          {number}
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

export function ErrorFeedback({ error, onAcknowledge, onSkip, queueLength = 1 }) {
  const [showHistory, setShowHistory] = useState(false);

  if (!error) return null;

  const styles = SEVERITY_STYLES[error.severity] ?? SEVERITY_STYLES.error;
  const historicalCase = HISTORICAL_CASES[error.historicalCaseKey];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div
        className={`bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border-2 ${styles.border} shadow-2xl max-w-2xl w-full my-4`}
      >
        {/* ── Header ── */}
        <div className={`${styles.header} rounded-t-2xl px-5 py-4 border-b border-white/10`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none">{error.icon}</span>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${styles.badge}`}>
                    {error.severity === 'critical' ? 'CRÍTICO' : error.severity === 'error' ? 'ERROR' : 'ADVERTENCIA'}
                  </span>
                  {queueLength > 1 && (
                    <span className="text-xs text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                      +{queueLength - 1} más en cola
                    </span>
                  )}
                </div>
                <h2 className={`text-lg font-bold ${styles.accent}`}>{error.title}</h2>
              </div>
            </div>
            <button
              onClick={onSkip}
              className="text-slate-400 hover:text-white transition flex-shrink-0 mt-0.5"
              title="Ignorar este error"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-5 space-y-4">

          {/* Section 1: ¿Qué pasó? */}
          <Section number="1" title="¿Qué pasó?" color="text-slate-300">
            <div className="bg-slate-800/80 border border-slate-600/40 rounded-lg px-4 py-3">
              <p className="text-sm text-slate-200 leading-relaxed">{error.whatHappened}</p>
              {/* Parameter snapshot */}
              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-700/50">
                {[
                  { label: 'Potencia', value: `${error.params.power.toFixed(0)} MW`, hot: error.params.power > 1000 },
                  { label: 'Temperatura', value: `${error.params.temperature.toFixed(0)} K`, hot: error.params.temperature > 500 },
                  { label: 'Presión', value: `${error.params.pressure.toFixed(1)} bar`, hot: error.params.pressure > 150 },
                  { label: 'Flujo', value: `${error.params.flow.toFixed(0)} %`, hot: error.params.flow < 50 },
                ].map(({ label, value, hot }) => (
                  <div key={label} className="text-center">
                    <p className="text-slate-500 text-xs">{label}</p>
                    <p className={`text-sm font-bold font-mono ${hot ? 'text-orange-400' : 'text-slate-300'}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Section 2: ¿Por qué es un error? */}
          <Section number="2" title="¿Por qué es un error?" color={styles.accent}>
            <div className="bg-slate-800/60 border border-slate-600/30 rounded-lg px-4 py-3">
              <p className="text-sm text-slate-300 leading-relaxed">{error.whyError}</p>
            </div>
          </Section>

          {/* Section 3: Consecuencias */}
          <Section number="3" title="¿Qué pasó en tu reactor?" color="text-slate-300">
            <ul className="space-y-1.5">
              {error.consequences.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <ChevronRight className="w-3.5 h-3.5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Section 4: Qué deberías haber hecho */}
          <Section number="4" title="¿Qué deberías haber hecho?" color="text-green-400">
            <div className="bg-green-950/30 border border-green-700/40 rounded-lg px-4 py-3 space-y-1">
              {error.whatToDo.map((step, i) => (
                <p key={i} className="text-xs text-green-200 leading-relaxed">{step}</p>
              ))}
            </div>
          </Section>

          {/* Section 5: Caso histórico real */}
          {historicalCase && (
            <Section number="5" title="Caso real relacionado" color="text-blue-400">
              <button
                onClick={() => setShowHistory(h => !h)}
                className="w-full bg-blue-950/40 border border-blue-700/40 rounded-lg px-4 py-3 text-left hover:bg-blue-950/60 transition group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl leading-none">{historicalCase.emoji}</span>
                    <div>
                      <p className="text-blue-300 font-bold text-sm">{historicalCase.name} — {historicalCase.year}</p>
                      <p className="text-slate-400 text-xs">{historicalCase.location} · Escala {historicalCase.scale}</p>
                    </div>
                  </div>
                  <BookOpen className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition flex-shrink-0" />
                </div>

                {showHistory && (
                  <div className="mt-3 pt-3 border-t border-blue-700/30 space-y-2 text-left">
                    <div>
                      <p className="text-xs font-semibold text-blue-400 mb-1">Qué ocurrió:</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{historicalCase.what}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-blue-400 mb-1">Consecuencia:</p>
                      <p className="text-xs text-slate-300 leading-relaxed">{historicalCase.consequence}</p>
                    </div>
                    <div className="bg-blue-900/30 rounded-lg px-3 py-2">
                      <p className="text-xs font-semibold text-blue-300 mb-1">Lección aprendida:</p>
                      <p className="text-xs text-blue-100 leading-relaxed italic">"{historicalCase.lesson}"</p>
                    </div>
                    {historicalCase.casualties > 0 && (
                      <p className="text-xs text-red-400 font-semibold">
                        Víctimas directas confirmadas: {historicalCase.casualties}
                      </p>
                    )}
                  </div>
                )}
              </button>
            </Section>
          )}
        </div>

        {/* ── Footer buttons ── */}
        <div className="px-5 pb-5 grid grid-cols-2 gap-3">
          <button
            onClick={onSkip}
            className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-3 px-4 rounded-xl transition text-sm flex items-center justify-center gap-2"
          >
            Continuar igualmente
          </button>
          <button
            onClick={onAcknowledge}
            className="bg-green-700 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition text-sm flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Entendido — aplicar corrección
          </button>
        </div>
      </div>
    </div>
  );
}
