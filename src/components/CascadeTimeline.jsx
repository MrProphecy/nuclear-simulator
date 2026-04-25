import React, { useMemo } from 'react';

// Demoras características de cascada en segundos
const CASCADE_DELAYS = {
  'barras→reactividad':  '~3 seg',
  'reactividad→potencia': '5–30 seg',
  'potencia→temperatura': '~10 seg',
  'temperatura→presión':  '~15 seg',
};

const ACTION_LABELS = {
  'BARRAS+':    'Insertar barras',
  'BARRAS-':    'Retirar barras',
  'POTENCIA+':  'Aumentar reactividad',
  'BOMBA_ON':   'Encender bomba',
  'BOMBA_OFF':  'Apagar bomba',
  'SLIDER':     'Ajustar barras (slider)',
  'SCRAM_MANUAL': 'SCRAM manual',
  'STARTUP':    'Sistema iniciado',
  'RECUPERAR_SCRAM': 'Recuperar de SCRAM',
};

const LEVEL_STYLES = {
  critical: { dot: 'bg-red-500',    text: 'text-red-400',    icon: '🔴' },
  warning:  { dot: 'bg-yellow-500', text: 'text-yellow-400', icon: '⚠️' },
  info:     { dot: 'bg-blue-500',   text: 'text-green-400',  icon: '✓'  },
};

function TimelineEntry({ entry, isLast }) {
  const style = LEVEL_STYLES[entry.level] || LEVEL_STYLES.info;

  return (
    <div className="flex gap-3">
      {/* Línea vertical */}
      <div className="flex flex-col items-center">
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5 ${style.dot}`} />
        {!isLast && <div className="w-px flex-1 bg-slate-700 mt-1" />}
      </div>

      {/* Contenido */}
      <div className="pb-3 flex-1">
        <div className="flex items-baseline gap-2 flex-wrap mb-0.5">
          <span className="text-slate-500 font-mono text-xs">{entry.simTime?.toFixed(1)}s</span>
          {entry.wallTime && (
            <span className="text-slate-600 text-xs">{entry.wallTime}</span>
          )}
        </div>
        <p className={`text-xs leading-relaxed ${style.text}`}>
          <span className="mr-1">{style.icon}</span>
          {entry.text}
        </p>
        {entry.riskNote && (
          <p className="text-xs text-slate-500 mt-0.5 font-mono">{entry.riskNote}</p>
        )}
      </div>
    </div>
  );
}

export function CascadeTimeline({ state }) {
  const timeline = useMemo(() => {
    const entries = [];

    // Combinar operationLog y events
    (state.events ?? []).forEach(e => {
      entries.push({
        simTime: parseFloat(e.time) || 0,
        wallTime: e.timestamp,
        text: e.message,
        level: e.level,
        kind: 'event',
      });
    });

    (state.operationLog ?? []).forEach(op => {
      const isCritical = ['SCRAM_AUTO_TEMP','SCRAM_AUTO_PRESS','SCRAM_AUTO_FLOW','SCRAM_MANUAL'].includes(op.action);
      entries.push({
        simTime: parseFloat(op.simTime) || 0,
        wallTime: op.timestamp,
        text: `${ACTION_LABELS[op.action] || op.action} — ${op.reason}`,
        level: isCritical ? 'critical' : 'info',
        kind: 'op',
      });
    });

    // Ordenar cronológicamente, mostrar los últimos 10
    entries.sort((a, b) => a.simTime - b.simTime);
    return entries.slice(-10);
  }, [state.events, state.operationLog]);

  if (timeline.length === 0) return null;

  const hasScram = timeline.some(e => e.level === 'critical' && e.text.includes('SCRAM'));

  return (
    <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/90 border border-slate-600/40 rounded-xl p-4 mb-4">
      <h3 className="text-cyan-300 font-bold text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
        📋 LÍNEA DE TIEMPO — Cascada de Eventos
      </h3>
      <p className="text-slate-500 text-xs mb-4">Últimos {timeline.length} eventos — tiempo de simulación</p>

      <div className="pl-1">
        {timeline.map((entry, i) => (
          <TimelineEntry
            key={i}
            entry={entry}
            isLast={i === timeline.length - 1}
          />
        ))}
      </div>

      {/* Explicación de demoras */}
      <div className="mt-3 bg-slate-800/60 border border-slate-700/40 rounded-lg p-3">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">
          ¿Por qué las demoras?
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(CASCADE_DELAYS).map(([chain, delay]) => (
            <div key={chain} className="text-xs flex items-center gap-1.5">
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 capitalize">{chain}:</span>
              <span className="text-cyan-400 font-mono">{delay}</span>
            </div>
          ))}
        </div>
        {!hasScram && (
          <p className="text-green-400 text-xs mt-2 font-semibold">
            LECCIÓN: Paciencia = Seguridad. Los operadores que van rápido causan accidentes.
          </p>
        )}
      </div>

      {/* Cambios pendientes (demoras activas) */}
      {(state.pendingChanges ?? []).length > 0 && (
        <div className="mt-3 bg-yellow-950/40 border border-yellow-700/30 rounded-lg p-3">
          <p className="text-yellow-400 text-xs font-semibold mb-2">Efectos en curso (cola de demoras):</p>
          {state.pendingChanges.map((c, i) => (
            <div key={i} className="text-xs text-yellow-300 flex items-center gap-2 mb-1">
              <span className="text-yellow-500 font-mono font-bold">⏱ {c.remainingSeconds}s</span>
              <span>{c.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
