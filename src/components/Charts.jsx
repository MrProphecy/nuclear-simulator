import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, AreaChart } from 'recharts';

export function PowerTemperatureChart({ history }) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-lg font-bold text-white mb-4">POTENCIA vs TEMPERATURA</h3>
      {history.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              label={{ value: 'Tiempo (s)', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis
              yAxisId="left"
              stroke="#94a3b8"
              label={{ value: 'Potencia (MW)', angle: -90, position: 'insideLeft' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#94a3b8"
              label={{ value: 'Temperatura (K)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#e2e8f0' }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="power" fill="#ef4444" name="Potencia (MW)" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="temperature"
              stroke="#3b82f6"
              name="Temperatura (K)"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-80 flex items-center justify-center text-slate-500 text-sm">
          Presiona INICIAR para ver datos
        </div>
      )}
    </div>
  );
}

export function PressureFlowChart({ history }) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-lg font-bold text-white mb-4">PRESIÓN y FLUJO DE REFRIGERANTE</h3>
      {history.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              label={{ value: 'Tiempo (s)', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis
              yAxisId="left"
              stroke="#94a3b8"
              label={{ value: 'Presión (bar)', angle: -90, position: 'insideLeft' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#94a3b8"
              label={{ value: 'Flujo (%)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#e2e8f0' }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="pressure"
              stroke="#06b6d4"
              name="Presión (bar)"
              strokeWidth={2}
              dot={false}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="coolantFlow"
              fill="#a855f7"
              stroke="#a855f7"
              name="Flujo Refrigerante (%)"
              fillOpacity={0.3}
            />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-80 flex items-center justify-center text-slate-500 text-sm">
          Presiona INICIAR para ver datos
        </div>
      )}
    </div>
  );
}

export function StabilityChart({ history }) {
  // Calcular "estabilidad" como cuán cercano está a los límites
  const stabilityData = history.map(h => {
    const tempStability = 100 - Math.max(0, (h.temperature - 300) / 300 * 100);
    const pressStability = 100 - Math.max(0, (h.pressure - 140) / 20 * 100);
    const powerStability = 100 - Math.max(0, h.power / 2000 * 100);
    const flowStability = h.coolantFlow > 30 ? 100 : (h.coolantFlow / 30) * 100;

    return {
      time: h.time,
      stability: (tempStability + pressStability + powerStability + flowStability) / 4
    };
  });

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-lg font-bold text-white mb-4">ÍNDICE DE ESTABILIDAD</h3>
      {history.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={stabilityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#e2e8f0' }}
            />
            <Area
              type="monotone"
              dataKey="stability"
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.6}
              name="Estabilidad (%)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
          Sin datos
        </div>
      )}
    </div>
  );
}
