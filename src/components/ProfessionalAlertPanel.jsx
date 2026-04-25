import React, { useState, useEffect, useRef } from 'react';

const SEV = {
  critical: {
    icon: '🔴',
    label: 'CRÍTICO',
    text: 'text-red-300',
    bg: 'bg-red-950/50',
    border: 'border-red-700/60',
    badge: 'bg-red-600',
  },
  warning: {
    icon: '⚠️',
    label: 'ALERTA',
    text: 'text-yellow-300',
    bg: 'bg-yellow-950/40',
    border: 'border-yellow-700/50',
    badge: 'bg-yellow-600',
  },
  info: {
    icon: 'ℹ️',
    label: 'INFO',
    text: 'text-blue-300',
    bg: 'bg-blue-950/30',
    border: 'border-blue-700/40',
    badge: 'bg-blue-600',
  },
};

let alertSeq = 0;

export const ProfessionalAlertPanel = ({ state, isRunning }) => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const prevRef = useRef({});
  const idRef = useRef(0);

  useEffect(() => {
    if (!isRunning || !state) return;

    const prev = prevRef.current;
    const batch = [];
    const now = new Date().toLocaleTimeString('es', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    const simT = state.time != null ? state.time.toFixed(1) : '—';

    const push = (severity, message) =>
      batch.push({ id: ++idRef.current, severity, time: now, simTime: simT, message });

    // SCRAM
    if (state.emergencyShutdown && !prev.emergencyShutdown) {
      push('critical', `SCRAM ACTIVADO — ${state.scramReason || 'Condición de seguridad detectada'}`);
    }

    // Temperature thresholds
    if (state.temperature > 550 && (prev.temperature ?? 0) <= 550)
      push('critical', `Temperatura CRÍTICA: ${state.temperature.toFixed(0)} K (límite 550 K)`);
    else if (state.temperature > 500 && (prev.temperature ?? 0) <= 500)
      push('warning', `Temperatura ALTA: ${state.temperature.toFixed(0)} K — Zona de advertencia`);
    else if (state.temperature <= 500 && (prev.temperature ?? 999) > 500)
      push('info', `Temperatura normalizada: ${state.temperature.toFixed(0)} K`);

    // Pressure thresholds
    if (state.pressure > 155 && (prev.pressure ?? 0) <= 155)
      push('critical', `Presión CRÍTICA: ${state.pressure.toFixed(1)} bar — Válvula de alivio activa`);
    else if (state.pressure > 145 && (prev.pressure ?? 0) <= 145)
      push('warning', `Presión ALTA: ${state.pressure.toFixed(1)} bar — Monitorear`);
    else if (state.pressure <= 145 && (prev.pressure ?? 999) > 145)
      push('info', `Presión normalizada: ${state.pressure.toFixed(1)} bar`);

    // Flow thresholds
    if (state.coolantFlow < 30 && (prev.coolantFlow ?? 100) >= 30)
      push('critical', `Flujo CRÍTICO: ${state.coolantFlow.toFixed(0)}% — Riesgo de meltdown`);
    else if (state.coolantFlow < 50 && (prev.coolantFlow ?? 100) >= 50)
      push('warning', `Flujo BAJO: ${state.coolantFlow.toFixed(0)}% — Refrigeración comprometida`);
    else if (state.coolantFlow >= 50 && (prev.coolantFlow ?? 100) < 50)
      push('info', `Flujo recuperado: ${state.coolantFlow.toFixed(0)}%`);

    // Relief valve
    if (state.reliefValveOpen && !prev.reliefValveOpen)
      push('warning', 'Válvula de alivio ABIERTA — Presión excede setpoint automático');
    if (!state.reliefValveOpen && prev.reliefValveOpen)
      push('info', 'Válvula de alivio cerrada — Presión normalizada');

    // System failures
    if (state.failures?.coolantLeak && !prev.failures?.coolantLeak)
      push('critical', 'LOCA DETECTADO — Pérdida de refrigerante activa — Acción inmediata requerida');
    if (state.failures?.pumpFailure && !prev.failures?.pumpFailure)
      push('critical', 'FALLO DE BOMBA — Circulación de refrigerante comprometida');
    if (state.failures?.controlRodsStuck && !prev.failures?.controlRodsStuck)
      push('critical', 'BARRAS ATASCADAS — Control de reactividad limitado');

    // Doppler feedback active
    if (state.dopplerActive && !prev.dopplerActive)
      push('info', `Retroalimentación Doppler activa — Reactor autorregulándose (ρ = ${state.dopplerDeltaRho ?? '?'} $)`);

    if (batch.length > 0) {
      setAlerts(prev => [...batch, ...prev].slice(0, 120));
    }

    prevRef.current = {
      emergencyShutdown: state.emergencyShutdown,
      temperature: state.temperature,
      pressure: state.pressure,
      coolantFlow: state.coolantFlow,
      reliefValveOpen: state.reliefValveOpen,
      dopplerActive: state.dopplerActive,
      failures: state.failures ? { ...state.failures } : {},
    };
  }, [state, isRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  const critCount = alerts.filter(a => a.severity === 'critical').length;
  const warnCount = alerts.filter(a => a.severity === 'warning').length;
  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-600 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${
            critCount > 0 ? 'bg-red-500 animate-pulse' :
            warnCount > 0 ? 'bg-yellow-500 animate-pulse' :
            'bg-green-500'
          }`} />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Panel de Alertas
          </h3>
          {critCount > 0 && (
            <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded-full font-mono">
              {critCount}
            </span>
          )}
          {warnCount > 0 && (
            <span className="text-xs bg-yellow-600 text-white px-1.5 py-0.5 rounded-full font-mono">
              {warnCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {['all', 'critical', 'warning', 'info'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'critical' ? '🔴' : f === 'warning' ? '⚠️' : 'ℹ️'}
            </button>
          ))}
          {alerts.length > 0 && (
            <button
              onClick={() => setAlerts([])}
              className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-400 hover:bg-slate-600 transition-colors ml-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Alert list */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs space-y-1">
            <p className="text-2xl">✅</p>
            <p className="font-semibold">Sin alertas activas</p>
            {!isRunning && <p>Inicia el reactor para comenzar monitoreo</p>}
          </div>
        ) : (
          filtered.map(alert => {
            const s = SEV[alert.severity] ?? SEV.info;
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-2.5 px-3 py-2 rounded-lg border ${s.bg} ${s.border}`}
              >
                <span className="text-sm flex-shrink-0 mt-px">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold leading-snug ${s.text}`}>
                    {alert.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 font-mono">
                    {alert.time} · t={alert.simTime}s
                  </p>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded font-bold text-white flex-shrink-0 ${s.badge}`}>
                  {s.label}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Footer stats */}
      {alerts.length > 0 && (
        <div className="mt-3 pt-2 border-t border-slate-700 flex items-center gap-4 text-xs text-slate-500">
          <span>Total: <strong className="text-slate-300">{alerts.length}</strong></span>
          <span>Críticos: <strong className="text-red-400">{critCount}</strong></span>
          <span>Alertas: <strong className="text-yellow-400">{warnCount}</strong></span>
          <span className="ml-auto">Máx 120 registros</span>
        </div>
      )}
    </div>
  );
};

export default ProfessionalAlertPanel;
