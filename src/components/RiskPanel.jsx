import React from 'react';
import { getRiskLevel, getRecommendedAction, calcAlertedSystems } from '../utils/RiskCalculator';

const SYSTEM_NAMES = {
  cooling:    'Enfriamiento primario',
  relief:     'Válvula de alivio',
  control:    'Sistema de control',
  structural: 'Integridad estructural',
};

function MiniBar({ value, barClass }) {
  return (
    <div className="flex-1 bg-slate-700 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-1.5 rounded-full transition-all duration-500 ${barClass}`}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

export function RiskPanel({ tutorialMode, state }) {
  const risks   = state.risks   ?? { power: 0, temperature: 0, pressure: 0, flow: 0 };
  const total   = state.totalRisk ?? 0;
  const alerted = state.alertedSystems ?? {};
  const pred    = state.prediction60s  ?? {};

  const level   = getRiskLevel(total);
  const alertList = Object.entries(alerted).filter(([, v]) => v).map(([k]) => SYSTEM_NAMES[k] || k);
  const action  = getRecommendedAction(risks, alerted, state);

  // ── MODO LIBRE: compacto ──────────────────────────────────────────
  if (!tutorialMode) {
    return (
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-2 mb-4 text-xs flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className={`font-bold ${level.textClass}`}>
          RIESGO: {total.toFixed(1)}%
        </span>
        <span className="text-slate-500">|</span>
        <span className="text-slate-400 font-mono">
          P:{risks.power.toFixed(1)}% T:{risks.temperature.toFixed(1)}% Pr:{risks.pressure.toFixed(1)}% F:{risks.flow.toFixed(1)}%
        </span>
        {alertList.length > 0 && (
          <>
            <span className="text-slate-500">|</span>
            <span className="text-yellow-400">Alerta: {alertList.join(', ')}</span>
          </>
        )}
        {(Math.abs(pred.tempChange ?? 0) > 1 || Math.abs(pred.pressureChange ?? 0) > 0.1) && (
          <>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 font-mono">
              60s: T{(pred.tempChange ?? 0) >= 0 ? '+' : ''}{(pred.tempChange ?? 0).toFixed(0)}K
              {' '}P{(pred.pressureChange ?? 0) >= 0 ? '+' : ''}{(pred.pressureChange ?? 0).toFixed(1)}bar
            </span>
          </>
        )}
      </div>
    );
  }

  // ── MODO TUTORIAL: completo ───────────────────────────────────────
  return (
    <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/90 border border-slate-600/60 rounded-xl p-4 mb-4">
      <h3 className="text-blue-300 font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
        🎯 ANÁLISIS DE RIESGO EN VIVO
      </h3>

      {/* Riesgo total */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-slate-300 text-sm font-semibold">RIESGO GENERAL</span>
          <span className={`font-bold text-xl ${level.textClass}`}>{total.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3.5 overflow-hidden mb-1">
          <div
            className={`h-3.5 rounded-full transition-all duration-500 ${level.barClass}`}
            style={{ width: `${Math.min(100, total)}%` }}
          />
        </div>
        <span className={`text-xs font-bold ${level.textClass}`}>{level.label}</span>
      </div>

      {/* Riesgos específicos */}
      <div className="bg-slate-800/60 border border-slate-700/40 rounded-lg p-3 mb-3">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Riesgos Específicos</p>
        {[
          { label: 'Potencia',     v: risks.power       },
          { label: 'Temperatura',  v: risks.temperature },
          { label: 'Presión',      v: risks.pressure    },
          { label: 'Flujo',        v: risks.flow        },
        ].map(({ label, v }) => {
          const lv = getRiskLevel(v);
          return (
            <div key={label} className="flex items-center gap-2 mb-1.5">
              <span className="text-slate-400 text-xs w-24 flex-shrink-0">{label}:</span>
              <MiniBar value={v} barClass={lv.barClass} />
              <span className={`text-xs font-mono w-12 text-right flex-shrink-0 ${lv.textClass}`}>
                {v.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Sistemas en alerta */}
      {alertList.length > 0 && (
        <div className="bg-yellow-950/40 border border-yellow-600/30 rounded-lg p-3 mb-3">
          <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wide mb-2">
            Sistemas en Alerta
          </p>
          {alertList.map((sys, i) => (
            <div key={i} className="text-xs text-yellow-200 flex items-center gap-1.5 mb-0.5">
              <span>•</span> {sys}
            </div>
          ))}
        </div>
      )}

      {/* Predicción 60 seg */}
      <div className="bg-slate-800/60 border border-slate-700/40 rounded-lg p-3">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">
          Predicción (60 seg)
        </p>
        <p className="text-slate-400 text-xs mb-2">Si continúa así:</p>
        <div className="space-y-1 text-xs mb-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Temperatura:</span>
            <span className={`font-mono font-bold ${(pred.tempChange ?? 0) > 20 ? 'text-orange-400' : 'text-slate-300'}`}>
              {(pred.tempChange ?? 0) >= 0 ? '+' : ''}{(pred.tempChange ?? 0).toFixed(0)} K
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Presión:</span>
            <span className={`font-mono font-bold ${(pred.pressureChange ?? 0) > 2 ? 'text-orange-400' : 'text-slate-300'}`}>
              {(pred.pressureChange ?? 0) >= 0 ? '+' : ''}{(pred.pressureChange ?? 0).toFixed(1)} bar
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Riesgo total:</span>
            <span className={`font-mono font-bold ${(pred.riskChange ?? 0) > 5 ? 'text-red-400' : (pred.riskChange ?? 0) < -2 ? 'text-green-400' : 'text-slate-300'}`}>
              {(pred.riskChange ?? 0) >= 0 ? '+' : ''}{(pred.riskChange ?? 0).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="bg-blue-950/50 border border-blue-700/30 rounded p-2.5">
          <p className="text-blue-400 text-xs font-bold mb-0.5">Acción recomendada:</p>
          <p className="text-blue-100 text-xs leading-relaxed">"{action}"</p>
        </div>
      </div>
    </div>
  );
}
