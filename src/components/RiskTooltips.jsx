import React, { useState, useEffect, useRef } from 'react';

const TOOLTIP_DURATION_MS = 9000;

// Datos educativos por acción
const ACTION_DATA = {
  'BARRAS+': {
    emoji: '⬇️',
    title: 'Insertaste barras de control',
    immediate: [
      'Reactividad desciende (neutrones absorbidos)',
      'Efecto completo llega en ~3 segundos',
      'Riesgo de potencia comienza a bajar',
    ],
    in30s: 'Potencia bajará gradualmente. Temperatura seguirá al final.',
    lesson: 'Las barras absorben neutrones — en física nuclear el efecto no es instantáneo sino que se propaga en segundos.',
    historical: null,
  },
  'BARRAS-': {
    emoji: '⬆️',
    title: 'Retiraste barras de control',
    immediate: [
      'Reactividad sube (más neutrones libres)',
      'Efecto completo llega en ~3 segundos',
      'Riesgo de potencia comienza a subir',
    ],
    in30s: 'Potencia subirá. Temperatura y presión seguirán con demora de 10–15 seg.',
    lesson: 'Cambios lentos = física estable. Un escalón a la vez y espera 60 segundos antes del siguiente.',
    historical: 'Chernobyl 1986: operadores retiraron demasiadas barras demasiado rápido durante prueba de turbina.',
  },
  'POTENCIA+': {
    emoji: '🔺',
    title: 'Aumentaste la reactividad base',
    immediate: [
      'Reactividad positiva añadida al núcleo',
      'Neutrones se multiplican más rápido',
      'Potencia comenzará a subir en segundos',
    ],
    in30s: 'Temperatura subirá en ~10–15 seg. Presión seguirá en ~15–20 seg.',
    lesson: 'La ecuación de punto cinético: dn/dt = [(ρ−β)/Λ] × n. Un pequeño cambio en ρ produce gran cambio en n.',
    historical: null,
  },
  'BOMBA_ON': {
    emoji: '💧',
    title: 'Encendiste la bomba de refrigeración',
    immediate: [
      'Motor arrancando (5 segundos hasta flujo completo)',
      'Flujo aumentará gradualmente',
      'Temperatura comenzará a bajar al recuperarse el flujo',
    ],
    in30s: 'Sistema de refrigeración estabilizado. Temperatura y presión descenderán.',
    lesson: 'Los motores de las bombas tienen inercia — arrancan en 5 seg. Planifica con antelación.',
    historical: 'Fukushima 2011: cuando el tsunami llegó, las bombas de respaldo eran diesel — tardaron minutos en arrancar.',
  },
  'BOMBA_OFF': {
    emoji: '🚫',
    title: 'Apagaste la bomba de refrigeración',
    immediate: [
      'Flujo de refrigerante cayendo',
      'Temperatura comenzará a subir sin refrigeración',
      'SCRAM automático si flujo < 30%',
    ],
    in30s: 'Sin acción correctiva: temperatura crítica posible. Flujo < 30% = SCRAM inevitable.',
    lesson: 'La refrigeración es la barrera más crítica. Sin ella, incluso con reactor apagado, el calor residual funde el combustible.',
    historical: 'Three Mile Island 1979: fallo de bomba + válvula atascada → LOCA parcial → fusión parcial del núcleo.',
  },
  'SCRAM_MANUAL': {
    emoji: '🛑',
    title: 'Activaste SCRAM manual',
    immediate: [
      'Barras insertadas 100% en < 2 segundos',
      'Reactividad: −3$ (máximo negativo)',
      'Potencia cayendo exponencialmente',
    ],
    in30s: 'Reactor en frío en ~2 minutos. Sistemas de refrigeración siguen necesarios.',
    lesson: 'Buen instinto. El SCRAM manual existe para situaciones que el operador detecta antes que la instrumentación automática.',
    historical: null,
  },
  'SLIDER': {
    emoji: '🎚️',
    title: 'Ajustaste posición de barras',
    immediate: [
      'Cambio de reactividad inmediato',
      'Efectos en potencia en segundos',
      'Monitorea tendencia antes de continuar',
    ],
    in30s: 'Los parámetros seguirán el cambio con sus demoras características.',
    lesson: 'El control continuo requiere más atención — los cambios pequeños acumulados pueden sorprenderte.',
    historical: null,
  },
  'RECUPERAR_SCRAM': {
    emoji: '⚛️',
    title: 'Recuperando de SCRAM',
    immediate: [
      'Reactor en standby — barras al 50%',
      'Reactividad negativa contenida',
      'Sistema listo para reiniciar controlado',
    ],
    in30s: 'Monitorea temperatura. No aceleres el reinicio.',
    lesson: 'Después de un SCRAM, los operadores reales analizan la causa antes de reiniciar. Aquí tienes el análisis post-evento.',
    historical: null,
  },
};

function TooltipContent({ action, state, tutorialMode }) {
  const data = ACTION_DATA[action?.action];
  if (!data) return null;

  const risks = state.risks ?? {};
  const riskChange = (state.totalRisk ?? 0).toFixed(1);

  if (!tutorialMode) {
    // Modo libre: 2 líneas
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-xs max-w-sm shadow-xl">
        <div className="font-bold text-slate-200 mb-1">
          {data.emoji} {data.title}
        </div>
        <div className="text-slate-400">
          {data.in30s} — Riesgo actual: {riskChange}%
        </div>
      </div>
    );
  }

  // Modo tutorial: completo
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-blue-700/40 rounded-xl p-4 max-w-sm shadow-2xl">
      <div className="font-bold text-blue-200 text-sm mb-3 flex items-center gap-2">
        <span>{data.emoji}</span>
        <span>{data.title}</span>
      </div>

      <div className="mb-3">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1.5">Cambios Inmediatos</p>
        <div className="space-y-1">
          {data.immediate.map((item, i) => (
            <div key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
              <span className="text-blue-400 flex-shrink-0">•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-3 bg-slate-800/60 rounded-lg p-2.5">
        <p className="text-slate-400 text-xs font-semibold mb-1">En 30 segundos:</p>
        <p className="text-slate-300 text-xs leading-relaxed">{data.in30s}</p>
      </div>

      <div className="mb-3 flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Riesgo actual:</span>
          <span className="text-white font-bold font-mono">{riskChange}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Temperatura:</span>
          <span className="font-mono text-slate-300">{(state.temperature ?? 300).toFixed(0)}K</span>
        </div>
      </div>

      <div className="bg-indigo-950/50 border border-indigo-700/30 rounded-lg p-2.5 mb-2">
        <p className="text-indigo-400 text-xs font-bold mb-0.5">Por qué es importante:</p>
        <p className="text-indigo-100 text-xs leading-relaxed">{data.lesson}</p>
      </div>

      {data.historical && (
        <div className="bg-amber-950/40 border border-amber-700/30 rounded-lg p-2.5">
          <p className="text-amber-400 text-xs font-bold mb-0.5">Caso real:</p>
          <p className="text-amber-100 text-xs leading-relaxed">{data.historical}</p>
        </div>
      )}
    </div>
  );
}

export function RiskTooltips({ tutorialMode, lastAction, state }) {
  const [visible, setVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const timerRef = useRef(null);
  const lastActionRef = useRef(null);

  useEffect(() => {
    if (!lastAction) return;
    const key = `${lastAction.action}-${lastAction.simTime}`;
    if (key === lastActionRef.current) return;
    lastActionRef.current = key;

    // No mostrar tooltip para STARTUP ni para acciones sin datos
    if (!ACTION_DATA[lastAction.action]) return;

    setCurrentAction(lastAction);
    setVisible(true);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setVisible(false);
    }, TOOLTIP_DURATION_MS);

    return () => clearTimeout(timerRef.current);
  }, [lastAction]);

  if (!visible || !currentAction) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in" style={{ maxWidth: '340px' }}>
      <div className="relative">
        <button
          onClick={() => setVisible(false)}
          className="absolute -top-2 -right-2 z-10 w-5 h-5 bg-slate-600 hover:bg-slate-500 rounded-full text-slate-300 text-xs flex items-center justify-center"
        >
          ×
        </button>
        <TooltipContent action={currentAction} state={state} tutorialMode={tutorialMode} />
      </div>
    </div>
  );
}
