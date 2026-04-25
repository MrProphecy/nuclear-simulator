import React, { useMemo } from 'react';
import { DecayHeatCalculator } from '../utils/DecayHeatCalculator';

const SVG_W = 480;
const SVG_H = 130;
const PAD = { top: 10, right: 20, bottom: 30, left: 44 };
const INNER_W = SVG_W - PAD.left - PAD.right;
const INNER_H = SVG_H - PAD.top - PAD.bottom;

const T_MIN = 280;
const T_MAX = 700;
const T_TARGET = 350;

function tempToY(t) {
  return PAD.top + INNER_H - ((t - T_MIN) / (T_MAX - T_MIN)) * INNER_H;
}

function idxToX(i, total) {
  return PAD.left + (i / (total - 1)) * INNER_W;
}

export function DecayHeatVisualization({ currentTemp, residualHeat, refrigerationActive, postScramSeconds }) {
  const STEPS = 60;
  const DT = 5; // seconds per step → 60 steps × 5s = 300 seconds total view

  const coolingPoints = useMemo(
    () => DecayHeatCalculator.projectCooling(currentTemp, refrigerationActive ? 100 : 0, STEPS, DT),
    [currentTemp, refrigerationActive]
  );

  const meltdownPoints = useMemo(
    () => (!refrigerationActive
      ? DecayHeatCalculator.projectMeltdown(currentTemp, residualHeat, STEPS, DT)
      : null),
    [currentTemp, residualHeat, refrigerationActive]
  );

  const targetY = tempToY(T_TARGET);
  const currentY = tempToY(currentTemp);

  const coolingPath = coolingPoints
    .map((t, i) => `${i === 0 ? 'M' : 'L'}${idxToX(i, coolingPoints.length).toFixed(1)},${tempToY(t).toFixed(1)}`)
    .join(' ');

  const meltdownPath = meltdownPoints
    ? meltdownPoints
        .map((t, i) => `${i === 0 ? 'M' : 'L'}${idxToX(i, meltdownPoints.length).toFixed(1)},${Math.min(SVG_H - PAD.bottom, tempToY(t)).toFixed(1)}`)
        .join(' ')
    : null;

  const yTicks = [300, 400, 500, 600];
  const xTickLabels = ['0s', '1min', '2min', '3min', '4min', '5min'];

  const currentTempClamped = Math.max(T_MIN, Math.min(T_MAX, currentTemp));
  const safeReached = currentTemp <= T_TARGET;

  return (
    <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold text-sm">CURVA DE ENFRIAMIENTO DE DECAIMIENTO</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-0.5 bg-cyan-400 rounded" />
            <span className="text-cyan-300">Con refrigeración</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 border-t-2 border-dashed border-red-500" />
            <span className="text-red-400">Sin refrigeración</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 border-t border-dashed border-green-500" />
            <span className="text-green-400">Objetivo: 350K</span>
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ maxHeight: 160 }}>
        {/* Grid */}
        {yTicks.map(t => {
          const y = tempToY(t);
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={PAD.left + INNER_W} y2={y} stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3" />
              <text x={PAD.left - 4} y={y + 3.5} textAnchor="end" fill="#64748b" fontSize="9">{t}K</text>
            </g>
          );
        })}

        {/* X axis labels */}
        {xTickLabels.map((label, i) => {
          const x = PAD.left + (i / (xTickLabels.length - 1)) * INNER_W;
          return (
            <text key={i} x={x} y={SVG_H - 4} textAnchor="middle" fill="#475569" fontSize="8">{label}</text>
          );
        })}

        {/* Target temperature line */}
        <line x1={PAD.left} y1={targetY} x2={PAD.left + INNER_W} y2={targetY} stroke="#22c55e" strokeWidth="1" strokeDasharray="4,3" />
        <text x={PAD.left + INNER_W + 2} y={targetY + 3.5} fill="#22c55e" fontSize="8">350K</text>

        {/* Meltdown projection (if no cooling) */}
        {meltdownPath && (
          <path d={meltdownPath} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.7" />
        )}

        {/* Cooling projection */}
        <path d={coolingPath} fill="none" stroke="#22d3ee" strokeWidth="2" />

        {/* Shaded area under cooling curve */}
        <path
          d={`${coolingPath} L${idxToX(coolingPoints.length - 1, coolingPoints.length).toFixed(1)},${PAD.top + INNER_H} L${PAD.left},${PAD.top + INNER_H} Z`}
          fill="#22d3ee"
          opacity="0.05"
        />

        {/* Current temperature dot */}
        <circle
          cx={PAD.left}
          cy={tempToY(currentTempClamped)}
          r="4"
          fill={safeReached ? '#22c55e' : currentTemp > 500 ? '#ef4444' : '#f59e0b'}
          stroke="#fff"
          strokeWidth="1.5"
        />

        {/* Current temp label */}
        <text
          x={PAD.left + 6}
          y={tempToY(currentTempClamped) - 5}
          fill={safeReached ? '#22c55e' : '#f59e0b'}
          fontSize="9"
          fontWeight="bold"
        >
          {currentTemp.toFixed(0)}K {safeReached ? '✓' : '↓'}
        </text>

        {/* Axes */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + INNER_H} stroke="#475569" strokeWidth="1" />
        <line x1={PAD.left} y1={PAD.top + INNER_H} x2={PAD.left + INNER_W} y2={PAD.top + INNER_H} stroke="#475569" strokeWidth="1" />
      </svg>

      {/* Bottom info */}
      <div className="grid grid-cols-3 gap-3 mt-2">
        <div className="text-center">
          <p className="text-xs text-slate-500">Temperatura actual</p>
          <p className={`text-sm font-bold font-mono ${currentTemp <= T_TARGET ? 'text-green-400' : currentTemp > 500 ? 'text-red-400' : 'text-yellow-400'}`}>
            {currentTemp.toFixed(0)} K
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500">Calor residual</p>
          <p className="text-sm font-bold font-mono text-orange-300">{residualHeat.toFixed(1)} MW</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500">Objetivo</p>
          <p className={`text-sm font-bold font-mono ${safeReached ? 'text-green-400' : 'text-slate-300'}`}>
            {safeReached ? '✓ ALCANZADO' : '< 350K'}
          </p>
        </div>
      </div>

      {!refrigerationActive && (
        <div className="mt-3 bg-red-950/60 border border-red-500/50 rounded-lg p-2.5 text-xs text-red-200">
          <p className="font-bold text-red-400 mb-1">CRÍTICO: Sin refrigeración activa</p>
          <p>El calor residual está calentando el combustible. Sin enfriamiento, la fusión ocurrirá en minutos.</p>
          <p className="text-red-300 mt-1 font-semibold">Activa la bomba o el sistema auxiliar AHORA.</p>
        </div>
      )}

      {refrigerationActive && !safeReached && (
        <div className="mt-3 bg-blue-950/40 border border-blue-700/30 rounded-lg p-2.5 text-xs text-blue-200">
          <p className="font-bold text-blue-300 mb-1">Enfriamiento activo — proceso correcto</p>
          <p>
            Calor residual: similar al horno apagado. Aunque la fisión se detuvo, el combustible mantiene
            calor por decaimiento de productos de fisión. Se disipa lentamente con el refrigerante.
          </p>
        </div>
      )}

      {safeReached && (
        <div className="mt-3 bg-green-950/40 border border-green-700/30 rounded-lg p-2.5 text-xs text-green-200">
          <p className="font-bold text-green-400 mb-0.5">Temperatura objetivo alcanzada</p>
          <p>El combustible se ha enfriado a temperatura segura para reiniciar operación.</p>
        </div>
      )}
    </div>
  );
}
