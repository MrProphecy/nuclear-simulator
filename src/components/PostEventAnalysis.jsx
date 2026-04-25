import React, { useMemo } from 'react';

const SCRAM_DETAILS = {
  SCRAM_AUTO_TEMP: {
    title: 'SCRAM por Temperatura',
    rootCause: 'Temperatura del núcleo excedió el límite de seguridad (600 K)',
    primaryError: 'Potencia subió demasiado rápido — la refrigeración no pudo seguir el ritmo',
    criticalWindow: 'Momento en que temperatura superó 500K sin reducir potencia',
    worstCase1: 'Sin SCRAM automático: temperatura seguiría subiendo → combustible funde → LOCA',
    worstCase2: 'Con pérdida de refrigeración simultánea: fusión total del núcleo (Fukushima-like)',
    lesson: 'Gestión de temperatura: inserta barras cuando T supere 500 K. No esperes al límite.',
    nextTime: [
      'Un escalón de potencia cada 60 segundos',
      'Monitorea temperatura antes de cada cambio',
      'Si T > 500K: inserta barras inmediatamente',
      'Si T sube > 10K/min: baja potencia sin dudar',
    ],
  },
  SCRAM_AUTO_PRESS: {
    title: 'SCRAM por Presión',
    rootCause: 'Presión del circuito primario excedió el límite estructural (160 bar)',
    primaryError: 'La presión sigue a la temperatura — al no controlar T, la presión se disparó',
    criticalWindow: 'Presión superó 158 bar sin acción correctiva',
    worstCase1: 'Sin válvula de alivio: presión podría romper tuberías → LOCA masiva',
    worstCase2: 'Con fallo de válvula simultáneo: explosión de vapor en circuito primario',
    lesson: 'La presión es consecuencia de la temperatura. Controla T y controlas P.',
    nextTime: [
      'Mantén temperatura < 500K para evitar presión alta',
      'La válvula de alivio protege pero reduce flujo',
      'Si presión > 157 bar: REDUCE POTENCIA inmediatamente',
      'El SCRAM de presión indica error previo de temperatura',
    ],
  },
  SCRAM_AUTO_FLOW: {
    title: 'SCRAM por Flujo Crítico',
    rootCause: 'Flujo de refrigerante cayó por debajo del 30% — umbral de SCRAM automático',
    primaryError: 'Refrigeración insuficiente — bomba apagada o fallo de sistema',
    criticalWindow: 'Cuando flujo descendió por debajo del 50% sin acción correctiva',
    worstCase1: 'Sin SCRAM: calor residual funde combustible incluso sin fisión activa',
    worstCase2: 'Con pérdida total de refrigerante: zircaloy oxida, hidrógeno se acumula → explosión',
    lesson: 'Flujo < 50% es zona de alerta. Flujo < 30% es SCRAM inevitable.',
    nextTime: [
      'Nunca apagues la bomba sin activar el respaldo primero',
      'Monitorea flujo constantemente si la bomba tiene problemas',
      'Flujo < 70%: activa bomba de respaldo',
      'El calor residual dura horas — la refrigeración siempre es necesaria',
    ],
  },
  SCRAM_MANUAL: {
    title: 'SCRAM Manual Activado',
    rootCause: 'El operador detectó condición peligrosa y activó SCRAM preventivo',
    primaryError: 'Buen instinto — activaste el SCRAM antes de que el sistema lo hiciera',
    criticalWindow: 'No aplica — acción preventiva exitosa',
    worstCase1: 'Sin el SCRAM manual: el sistema automático habría actuado poco después',
    worstCase2: 'Si hubiera esperado más: podría haber causado condición más severa',
    lesson: 'Buen instinto. El SCRAM manual es la decisión más importante de un operador.',
    nextTime: [
      'El SCRAM manual es siempre la opción correcta en duda',
      'Analiza por qué necesitaste el SCRAM y qué lo precedió',
      'Un SCRAM limpio es mucho mejor que un SCRAM de emergencia',
      'Después de un SCRAM: analiza antes de reiniciar',
    ],
  },
};

const ROW_COLORS = {
  critical: 'text-red-400',
  warning:  'text-yellow-400',
  info:     'text-slate-400',
};
const ROW_ICONS = { critical: '🔴', warning: '⚠️', info: '✓' };

function DataOnlyView({ scramReason, events, operationLog, onRetry, onRecover }) {
  // Último SCRAM en el log
  const lastScram = (operationLog ?? []).slice().reverse().find(op =>
    op.action?.startsWith('SCRAM')
  );

  return (
    <div className="bg-slate-900/90 border border-red-700/40 rounded-xl p-4 mb-6">
      <h2 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
        📊 POST-EVENTO
      </h2>
      <div className="text-xs space-y-1.5 font-mono">
        <div className="flex gap-2">
          <span className="text-slate-500 w-28">Causa:</span>
          <span className="text-orange-300">{lastScram?.action ?? 'SCRAM'}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate-500 w-28">Razón:</span>
          <span className="text-slate-300">{scramReason ?? '—'}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate-500 w-28">Eventos críticos:</span>
          <span className="text-red-400">
            {(events ?? []).filter(e => e.level === 'critical').length}
          </span>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={onRecover}
          className="text-xs px-3 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white transition font-bold"
        >
          Recuperar
        </button>
        <button
          onClick={onRetry}
          className="text-xs px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
        >
          Reiniciar
        </button>
      </div>
    </div>
  );
}

export function PostEventAnalysis({ tutorialMode, scramReason, events, operationLog, onRetry, onRecover }) {
  const timeline = useMemo(() => {
    const entries = [];
    (events ?? []).forEach(e => {
      entries.push({ simTime: parseFloat(e.time) || 0, wallTime: e.timestamp, text: e.message, level: e.level });
    });
    (operationLog ?? []).forEach(op => {
      const critical = ['SCRAM_AUTO_TEMP','SCRAM_AUTO_PRESS','SCRAM_AUTO_FLOW','SCRAM_MANUAL','FALLO_BOMBA','FALLO_LOCA','DESHABILITAR_SEGURIDAD'].includes(op.action);
      entries.push({ simTime: parseFloat(op.simTime) || 0, wallTime: op.timestamp, text: `${op.action} — ${op.reason}`, level: critical ? 'critical' : 'info' });
    });
    entries.sort((a, b) => a.simTime - b.simTime);
    return entries.slice(-16);
  }, [events, operationLog]);

  // Encontrar el tipo de SCRAM
  const lastScramOp = (operationLog ?? []).slice().reverse().find(op => SCRAM_DETAILS[op.action]);
  const details = SCRAM_DETAILS[lastScramOp?.action ?? 'SCRAM_MANUAL'] ?? SCRAM_DETAILS.SCRAM_MANUAL;

  const criticalCount = timeline.filter(e => e.level === 'critical').length;
  const duration = timeline.length > 1
    ? (timeline[timeline.length - 1].simTime - timeline[0].simTime).toFixed(0)
    : '0';

  if (!tutorialMode) {
    return (
      <DataOnlyView
        scramReason={scramReason}
        events={events}
        operationLog={operationLog}
        onRetry={onRetry}
        onRecover={onRecover}
      />
    );
  }

  // Modo tutorial: análisis completo
  return (
    <div className="bg-gradient-to-br from-slate-900/95 to-red-950/20 border border-red-700/40 rounded-xl p-5 mb-6">
      <h2 className="text-white font-bold text-base mb-1 flex items-center gap-2">
        📊 ANÁLISIS POST-EVENTO: {details.title}
      </h2>
      <p className="text-slate-400 text-xs mb-4">Análisis completo de lo ocurrido — duración registrada: {duration}s</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Línea de Tiempo Completa</p>
          <div className="bg-slate-950/70 rounded-lg border border-slate-700/40 overflow-hidden mb-4">
            <div className="max-h-52 overflow-y-auto font-mono text-xs">
              {timeline.map((entry, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 px-3 py-1.5 border-b border-slate-800/50 ${ROW_COLORS[entry.level] ?? 'text-slate-400'}`}
                >
                  <span className="flex-shrink-0 w-12 tabular-nums text-slate-600">{entry.simTime.toFixed(1)}s</span>
                  <span className="flex-shrink-0">{ROW_ICONS[entry.level] ?? '·'}</span>
                  <span className="text-slate-500 text-xs flex-shrink-0 w-16 hidden sm:block">{entry.wallTime}</span>
                  <span className="flex-1">{entry.text}</span>
                </div>
              ))}
              {timeline.length === 0 && (
                <p className="px-3 py-3 text-slate-600 text-xs">Sin eventos registrados.</p>
              )}
            </div>
          </div>

          {/* Análisis de causa raíz */}
          <div className="space-y-3">
            <div className="bg-red-950/30 border border-red-700/30 rounded-lg p-3">
              <p className="text-red-400 text-xs font-bold mb-1">Causa raíz:</p>
              <p className="text-red-100 text-xs leading-relaxed">{details.rootCause}</p>
            </div>
            <div className="bg-orange-950/30 border border-orange-700/30 rounded-lg p-3">
              <p className="text-orange-400 text-xs font-bold mb-1">Error principal:</p>
              <p className="text-orange-100 text-xs leading-relaxed">{details.primaryError}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-600/30 rounded-lg p-3">
              <p className="text-slate-400 text-xs font-bold mb-1">Momento crítico:</p>
              <p className="text-slate-200 text-xs leading-relaxed">{details.criticalWindow}</p>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-3">
          {/* Resumen numérico */}
          <div className="bg-slate-800/60 border border-slate-600/30 rounded-lg p-3 space-y-2">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Resumen</p>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Duración:</span>
              <span className="text-white font-mono font-bold">{duration}s</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Eventos críticos:</span>
              <span className={`font-mono font-bold ${criticalCount > 0 ? 'text-red-400' : 'text-green-400'}`}>{criticalCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Tipo SCRAM:</span>
              <span className="text-orange-300 font-bold text-right max-w-28 leading-tight">{lastScramOp?.action ?? '—'}</span>
            </div>
          </div>

          {/* ¿Qué pudo haber pasado peor? */}
          <div className="bg-slate-800/60 border border-slate-600/30 rounded-lg p-3">
            <p className="text-slate-400 text-xs font-bold mb-2">Qué pudo haber pasado peor:</p>
            <div className="space-y-1.5">
              <div className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="text-red-500 flex-shrink-0">1.</span>
                <span>{details.worstCase1}</span>
              </div>
              <div className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="text-red-600 flex-shrink-0">2.</span>
                <span>{details.worstCase2}</span>
              </div>
            </div>
          </div>

          {/* Lección principal */}
          <div className="bg-blue-950/40 border border-blue-700/30 rounded-lg p-3">
            <p className="text-blue-400 text-xs font-bold mb-1.5">Lección principal</p>
            <p className="text-blue-100 text-xs leading-relaxed italic">"{details.lesson}"</p>
          </div>

          {/* Próxima vez */}
          <div className="bg-green-950/30 border border-green-700/30 rounded-lg p-3">
            <p className="text-green-400 text-xs font-bold mb-1.5">Próxima vez:</p>
            <div className="space-y-1">
              {details.nextTime.map((tip, i) => (
                <div key={i} className="text-xs text-green-200 flex items-start gap-1.5">
                  <span className="text-green-500 flex-shrink-0">{i + 1}.</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              onClick={onRecover}
              className="w-full text-sm px-4 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white transition font-bold"
            >
              Recuperar y continuar
            </button>
            <button
              onClick={onRetry}
              className="w-full text-sm px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
            >
              Reiniciar desde cero
            </button>
          </div>
        </div>
      </div>

      {/* Nota final */}
      <div className="mt-4 bg-slate-800/40 rounded-lg p-3">
        <p className="text-slate-300 text-xs leading-relaxed">
          <span className="text-green-400 font-bold">Sistema funcionó perfectamente:</span>{' '}
          El SCRAM automático te protegió. El reactor está seguro. Esto es exactamente para lo que
          están diseñados los sistemas de seguridad nucleares: múltiples capas independientes que
          actúan aunque el operador cometa errores.
        </p>
      </div>
    </div>
  );
}
