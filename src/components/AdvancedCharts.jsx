import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-xs shadow-xl">
      <p className="text-slate-400 mb-1.5 font-mono">t = {label} s</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-mono">
          {entry.name}: <strong>{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}</strong>
        </p>
      ))}
    </div>
  );
};

// Subsample data to max N points for rendering performance
const subsample = (arr, maxPoints = 300) => {
  if (!arr || arr.length <= maxPoints) return arr || [];
  const step = Math.ceil(arr.length / maxPoints);
  return arr.filter((_, i) => i % step === 0);
};

const historyLabel = (data, intervalSeconds) => {
  if (!data || data.length < 2) return 'En tiempo real';
  const span = data.length * intervalSeconds;
  if (span < 120) return `Últimos ${span.toFixed(0)} s`;
  if (span < 3600) return `Últimos ${(span / 60).toFixed(0)} min`;
  return `Últimas ${(span / 3600).toFixed(1)} h`;
};

export const AdvancedPowerTempChart = ({ history, longHistory }) => {
  const useLong = longHistory && longHistory.length > 30;
  const raw = useLong ? longHistory : history;
  const data = useMemo(() => subsample(raw, 300), [raw]);
  const label = useLong ? historyLabel(longHistory, 5) : historyLabel(history, 0.5);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-600 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Potencia / Temperatura
          </h3>
          <p className="text-xs text-slate-500">Con límites de seguridad</p>
        </div>
        <span className="text-xs text-blue-400 bg-blue-900/30 border border-blue-700/40 px-2 py-1 rounded font-mono">
          {label}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="time"
            stroke="#334155"
            tick={{ fill: '#64748b', fontSize: 9 }}
            tickFormatter={v => `${v}s`}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="power"
            domain={[0, 1200]}
            stroke="#ef4444"
            tick={{ fill: '#ef4444', fontSize: 9 }}
            width={42}
            tickFormatter={v => `${v}MW`}
          />
          <YAxis
            yAxisId="temp"
            orientation="right"
            domain={[260, 680]}
            stroke="#3b82f6"
            tick={{ fill: '#3b82f6', fontSize: 9 }}
            width={42}
            tickFormatter={v => `${v}K`}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />

          {/* Safety reference lines */}
          <ReferenceLine yAxisId="power" y={1000} stroke="#ef4444" strokeDasharray="4 4" opacity={0.45} />
          <ReferenceLine yAxisId="temp" y={550} stroke="#f59e0b" strokeDasharray="4 4" opacity={0.55}
            label={{ value: 'Alerta 550K', fill: '#f59e0b', fontSize: 8, position: 'insideTopRight' }} />
          <ReferenceLine yAxisId="temp" y={600} stroke="#ef4444" strokeDasharray="4 4" opacity={0.55}
            label={{ value: 'SCRAM 600K', fill: '#ef4444', fontSize: 8, position: 'insideTopRight' }} />

          <Line
            yAxisId="power"
            type="monotone"
            dataKey="power"
            stroke="#ef4444"
            dot={false}
            strokeWidth={2}
            name="Potencia (MW)"
            isAnimationActive={false}
          />
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="temperature"
            stroke="#60a5fa"
            dot={false}
            strokeWidth={2}
            name="Temperatura (K)"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AdvancedPressureFlowChart = ({ history, longHistory }) => {
  const useLong = longHistory && longHistory.length > 30;
  const raw = useLong ? longHistory : history;
  const data = useMemo(() => subsample(raw, 300), [raw]);
  const label = useLong ? historyLabel(longHistory, 5) : historyLabel(history, 0.5);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-600 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Presión / Flujo Refrigerante
          </h3>
          <p className="text-xs text-slate-500">Límites operacionales visualizados</p>
        </div>
        <span className="text-xs text-blue-400 bg-blue-900/30 border border-blue-700/40 px-2 py-1 rounded font-mono">
          {label}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="time"
            stroke="#334155"
            tick={{ fill: '#64748b', fontSize: 9 }}
            tickFormatter={v => `${v}s`}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="press"
            domain={[0, 185]}
            stroke="#06b6d4"
            tick={{ fill: '#06b6d4', fontSize: 9 }}
            width={42}
            tickFormatter={v => `${v}b`}
          />
          <YAxis
            yAxisId="flow"
            orientation="right"
            domain={[0, 110]}
            stroke="#a855f7"
            tick={{ fill: '#a855f7', fontSize: 9 }}
            width={38}
            tickFormatter={v => `${v}%`}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />

          <ReferenceLine yAxisId="press" y={155} stroke="#f59e0b" strokeDasharray="4 4" opacity={0.55}
            label={{ value: '155 bar', fill: '#f59e0b', fontSize: 8, position: 'insideTopRight' }} />
          <ReferenceLine yAxisId="flow" y={50} stroke="#f59e0b" strokeDasharray="4 4" opacity={0.45} />
          <ReferenceLine yAxisId="flow" y={30} stroke="#ef4444" strokeDasharray="4 4" opacity={0.55}
            label={{ value: 'Mín 30%', fill: '#ef4444', fontSize: 8, position: 'insideBottomRight' }} />

          <Line
            yAxisId="press"
            type="monotone"
            dataKey="pressure"
            stroke="#22d3ee"
            dot={false}
            strokeWidth={2}
            name="Presión (bar)"
            isAnimationActive={false}
          />
          <Line
            yAxisId="flow"
            type="monotone"
            dataKey="coolantFlow"
            stroke="#c084fc"
            dot={false}
            strokeWidth={2}
            name="Flujo (%)"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
