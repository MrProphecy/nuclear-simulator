import React from 'react';

// Análisis detallado por tipo de evento
const EVENT_ANALYSIS = {
  pump_vibration: {
    title: 'VIBRACIÓN DETECTADA EN BOMBA',
    icon: '⚠️',
    what: 'Sensores detectaron oscilación anómala en bomba de refrigeración primaria. La amplitud excede el límite normal de operación.',
    causes: ['Cavitación (burbujas de vapor en circuito)', 'Desequilibrio del rotor', 'Rodamiento degradado', 'Oclusión parcial del impulsor'],
    riskPct: 8,
    riskTime: 10,
    timeline: [
      { min: '0–3',  desc: 'Vibración puede aumentar, flujo se mantiene' },
      { min: '3–7',  desc: 'Flujo comienza a bajar gradualmente' },
      { min: '7–10', desc: 'Riesgo sube al 20%+, bomba puede fallar' },
      { min: '10+',  desc: 'Bomba falla → SCRAM automático por flujo bajo' },
    ],
    options: [
      {
        label: 'Encender bomba de respaldo (RECOMENDADO)',
        risk: 'Bajo',
        time: '30 seg',
        detail: 'Activa el respaldo ANTES de apagar la actual. Flujo continuo garantizado durante la transición.',
        color: 'green',
      },
      {
        label: 'Reducir potencia inmediatamente',
        risk: 'Moderado',
        time: '2–3 min',
        detail: 'Baja potencia reduce la carga térmica. La bomba puede sobrevivir más tiempo pero el riesgo sigue presente.',
        color: 'yellow',
      },
      {
        label: 'Abrir válvula de alivio primaria',
        risk: 'Moderado',
        time: '1 min',
        detail: 'Reduce presión, aumenta flujo neto. Mantiene bomba funcionando más tiempo. Acción profesional.',
        color: 'yellow',
      },
    ],
    historical: 'Fukushima 2011: bomba primary dañada por tsunami pero respaldo diesel activó. El sistema sostuvo el primer día.',
  },
  pressure_spike: {
    title: 'PICO DE PRESIÓN TRANSITORIO',
    icon: '⚠️',
    what: 'Fluctuación breve detectada en presión del circuito primario. Puede indicar cambio térmico rápido o problema de válvula.',
    causes: ['Cambio brusco de potencia', 'Válvula de descarga parcialmente abierta', 'Reducción de flujo transitoria', 'Expansión térmica súbita'],
    riskPct: 5,
    riskTime: 5,
    timeline: [
      { min: '0–1',  desc: 'Pico de presión transitorio, sistema responde' },
      { min: '1–3',  desc: 'Si se repite: causa subyacente presente' },
      { min: '3–5',  desc: 'Riesgo sube si potencia no se reduce' },
      { min: '5+',   desc: 'Válvula de alivio puede abrirse automáticamente' },
    ],
    options: [
      {
        label: 'Esperar 30 segundos y monitorear (RECOMENDADO)',
        risk: 'Bajo',
        time: '30 seg',
        detail: 'Si es transitorio normal, se resuelve solo. Monitorea que presión no supere 158 bar.',
        color: 'green',
      },
      {
        label: 'Reducir potencia 5%',
        risk: 'Muy bajo',
        time: '1–2 min',
        detail: 'Preventivo: baja la energía térmica que genera presión. Sin riesgo.',
        color: 'green',
      },
    ],
    historical: null,
  },
  radioactivity_detected: {
    title: 'RADIACTIVIDAD DETECTABLE EN CIRCUITO',
    icon: '🟡',
    what: 'Monitores detectaron actividad en el circuito primario por encima del umbral de rutina. Indica desgaste de barrera de combustible o filtros.',
    causes: ['Microfisuras en revestimiento de combustible (zircaloy)', 'Filtros del circuito primario degradados', 'Pequeña fuga de vapor del generador de vapor'],
    riskPct: 3,
    riskTime: 60,
    timeline: [
      { min: 'Ahora', desc: 'No es condición operativa crítica' },
      { min: 'Días',  desc: 'Monitoreo continuo necesario' },
      { min: 'Semanas', desc: 'Programar inspección en próxima parada' },
    ],
    options: [
      {
        label: 'Registrar y programar mantenimiento (RECOMENDADO)',
        risk: 'Ninguno',
        time: 'Próxima parada programada',
        detail: 'Condición normal de desgaste. No requiere acción inmediata. Documenta para el próximo mantenimiento.',
        color: 'green',
      },
    ],
    historical: 'En centrales reales, pequeñas actividades en el primario son normales y se monitorean continuamente.',
  },
  coolant_temp_spike: {
    title: 'TEMPERATURA DE SALIDA ELEVADA',
    icon: '🌡️',
    what: 'La temperatura de salida del refrigerante está ligeramente por encima del rango normal. Puede ser consecuencia normal de un aumento reciente de potencia.',
    causes: ['Potencia subió recientemente (normal)', 'Flujo ligeramente reducido', 'Distribución de flujo no uniforme en el núcleo'],
    riskPct: 4,
    riskTime: 3,
    timeline: [
      { min: '0–30s', desc: 'Si potencia subió: normal, se estabilizará' },
      { min: '30–60s', desc: 'Si no baja: revisar flujo y potencia' },
      { min: '60s+', desc: 'Si sigue subiendo: insertar barras' },
    ],
    options: [
      {
        label: 'Esperar 60 segundos (RECOMENDADO si subiste potencia)',
        risk: 'Bajo',
        time: '60 seg',
        detail: 'La temperatura de salida tarda en estabilizarse. Es normal después de un cambio de potencia.',
        color: 'green',
      },
      {
        label: 'Insertar barras una posición',
        risk: 'Muy bajo',
        time: '30 seg',
        detail: 'Preventivo. Reduce potencia ligeramente. Temperatura bajará en 15–20 segundos.',
        color: 'green',
      },
    ],
    historical: null,
  },
};

function OptionCard({ option, tutorialMode }) {
  const colorMap = {
    green:  { border: 'border-green-600/40', bg: 'bg-green-950/30', badge: 'bg-green-800/60 text-green-200', risk: 'text-green-400' },
    yellow: { border: 'border-yellow-600/40', bg: 'bg-yellow-950/20', badge: 'bg-yellow-800/60 text-yellow-200', risk: 'text-yellow-400' },
    red:    { border: 'border-red-600/40', bg: 'bg-red-950/20', badge: 'bg-red-800/60 text-red-200', risk: 'text-red-400' },
  };
  const c = colorMap[option.color] || colorMap.yellow;

  if (!tutorialMode) {
    return (
      <div className={`text-xs border ${c.border} ${c.bg} rounded-lg p-2`}>
        <span className={`font-bold ${c.risk}`}>{option.label}</span>
        {' — '}<span className="text-slate-400">{option.time}</span>
      </div>
    );
  }

  return (
    <div className={`border ${c.border} ${c.bg} rounded-lg p-3`}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className={`text-xs font-bold ${c.risk} leading-tight`}>{option.label}</p>
        <span className={`text-xs px-2 py-0.5 rounded font-mono flex-shrink-0 ${c.badge}`}>{option.time}</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">{option.detail}</p>
    </div>
  );
}

export function EventAnalysis({ tutorialMode, alert, onDismiss }) {
  if (!alert) return null;

  const data = EVENT_ANALYSIS[alert.id];

  if (!data) {
    // Evento sin análisis detallado — mostrar versión básica
    return (
      <div className="bg-yellow-950/80 border border-yellow-500/60 rounded-xl p-4 mb-4 flex items-start gap-3">
        <span className="text-yellow-400 text-lg flex-shrink-0">⚠️</span>
        <div className="flex-1">
          <p className="font-bold text-yellow-200 text-sm mb-1">{alert.msg}</p>
          <p className="text-xs text-yellow-300/80">{alert.detail}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-yellow-500 hover:text-yellow-300 text-xs px-2 py-1 rounded bg-yellow-900/40 hover:bg-yellow-900/70 transition flex-shrink-0"
        >
          OK
        </button>
      </div>
    );
  }

  if (!tutorialMode) {
    // Modo libre: compacto
    return (
      <div className="bg-yellow-950/80 border border-yellow-500/60 rounded-xl p-3 mb-4">
        <div className="flex items-start gap-2">
          <span className="text-yellow-400">{data.icon}</span>
          <div className="flex-1">
            <p className="font-bold text-yellow-200 text-xs">{data.title}: {data.riskPct}% riesgo</p>
            <p className="text-xs text-yellow-300/80 mt-0.5">
              Causas: {data.causes.slice(0, 2).join(' / ')}
            </p>
            {data.options[0] && (
              <p className="text-xs text-green-300 mt-0.5">
                Acción: {data.options[0].label}
              </p>
            )}
            <p className="text-xs text-slate-400">Tiempo límite: ~{data.riskTime} min</p>
          </div>
          <button
            onClick={onDismiss}
            className="text-yellow-500 hover:text-yellow-300 text-xs px-2 py-1 rounded bg-yellow-900/40 flex-shrink-0"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  // Modo tutorial: completo
  return (
    <div className="bg-gradient-to-br from-slate-900/95 to-yellow-950/20 border border-yellow-600/40 rounded-xl p-5 mb-4">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-yellow-200 font-bold text-base flex items-center gap-2">
          <span>{data.icon}</span>
          <span>{data.title}</span>
        </h3>
        <button
          onClick={onDismiss}
          className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1 rounded bg-slate-700/50 hover:bg-slate-700 transition flex-shrink-0"
        >
          Cerrar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Columna izquierda */}
        <div className="space-y-3">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1.5">¿Qué pasó?</p>
            <p className="text-slate-200 text-xs leading-relaxed">{data.what}</p>
          </div>

          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1.5">Causas posibles</p>
            <div className="space-y-1">
              {data.causes.map((c, i) => (
                <div key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                  <span className="text-slate-500">•</span> {c}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-orange-950/40 border border-orange-700/30 rounded-lg p-3">
            <p className="text-orange-400 text-xs font-semibold mb-1.5">Si no hago nada:</p>
            <div className="space-y-1">
              {data.timeline.map((t, i) => (
                <div key={i} className="text-xs flex items-start gap-2">
                  <span className="text-orange-500 font-mono flex-shrink-0 w-14">Min {t.min}:</span>
                  <span className="text-orange-200">{t.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-3">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">¿Qué hacer ahora?</p>
            <div className="space-y-2">
              {data.options.map((opt, i) => (
                <OptionCard key={i} option={opt} tutorialMode={tutorialMode} />
              ))}
            </div>
          </div>

          <div className="bg-red-950/30 border border-red-700/30 rounded-lg p-2.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-red-400 text-xs font-bold">Riesgo de falla:</span>
              <span className="text-red-300 font-bold font-mono text-sm">{data.riskPct}%</span>
              <span className="text-slate-500 text-xs">en {data.riskTime} min sin acción</span>
            </div>
          </div>

          {data.historical && (
            <div className="bg-slate-800/60 border border-slate-600/40 rounded-lg p-2.5">
              <p className="text-slate-400 text-xs font-bold mb-1">Caso real:</p>
              <p className="text-slate-300 text-xs leading-relaxed">{data.historical}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
