import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';

const HINTS = {
  VALVULA_ALIVIO: {
    title: 'VÁLVULA DE ALIVIO MANUAL',
    icon: '🔧',
    borderColor: 'border-orange-500/60',
    headerBg: 'bg-orange-900/60',
    textColor: 'text-orange-300',
    getBody: (value, state) => ({
      immediate: [
        `Presión bajando hacia: ~${Math.max(100, state.pressure - (value / 100) * 5).toFixed(1)} bar`,
        'Flujo refrigerante puede reducirse levemente',
        'Se libera vapor (pérdida controlada de refrigerante)',
      ],
      in30s: [
        'Presión se estabiliza en nivel más bajo',
        'Temperatura puede bajar levemente por menor densidad',
        'Verificar que presión no caiga por debajo de 140 bar',
      ],
      historical: 'Three Mile Island (1979): La válvula de alivio se trancó abierta durante 2 horas sin que los operadores lo supieran. Resultado: fusión parcial del núcleo.',
      warning: value > 50 ? 'PRECAUCIÓN: Válvula muy abierta — presión puede caer rápidamente' : null,
    }),
  },
  BOMBA_VELOCIDAD: {
    title: 'BOMBA PRIMARIA — VELOCIDAD',
    icon: '⚙️',
    borderColor: 'border-blue-500/60',
    headerBg: 'bg-blue-900/60',
    textColor: 'text-blue-300',
    getBody: (value, state) => ({
      immediate: [
        `Flujo refrigerante objetivo: ~${Math.min(120, value).toFixed(0)}%`,
        value < 80 ? 'Temperatura SUBE (menos enfriamiento)' : 'Temperatura se mantiene estable',
        `Presión ${value < 75 ? 'puede bajar' : 'estable'}`,
      ],
      in30s: [
        value < 75
          ? `Temperatura puede subir hasta ~${Math.min(650, state.temperature + (100 - value) * 0.5).toFixed(0)} K`
          : 'Sistema en equilibrio térmico',
        value < 60 ? '⚠️ Riesgo de SCRAM si flujo < 30%' : 'Flujo dentro de límites seguros',
      ],
      recommendation: value < 80
        ? 'Para bajar presión, abre VÁLVULA DE ALIVIO ──► (más seguro que reducir bomba)'
        : 'Velocidad óptima — mantener en 100% si es posible',
      warning: value < 70 ? 'CUIDADO: Velocidad baja reduce flujo peligrosamente' : null,
    }),
  },
  ENFRIAMIENTO_AUX: {
    title: 'ENFRIAMIENTO AUXILIAR',
    icon: '❄️',
    borderColor: 'border-cyan-500/60',
    headerBg: 'bg-cyan-900/60',
    textColor: 'text-cyan-300',
    getBody: (value, state) => ({
      immediate: [
        value > 0
          ? `Enfriamiento adicional activo: ${value.toFixed(0)}% capacidad`
          : 'Sistema auxiliar apagado',
        value > 0 ? `Temperatura bajando desde ${state.temperature.toFixed(0)} K` : '',
        value > 0 ? 'Agua externa activada (torre de enfriamiento)' : '',
      ].filter(Boolean),
      in30s: [
        value > 50 ? 'Temperatura puede bajar ~50-100 K adicionales' : 'Efecto parcial de enfriamiento',
        'No afecta presión directamente',
        'Redundancia de seguridad activa',
      ],
      recommendation: 'Reserva para emergencias cuando T > 500 K y otros sistemas no responden',
      warning: value > 80 ? 'Alto consumo de agua — monitorea disponibilidad del tanque auxiliar' : null,
    }),
  },
  BOMBA_RESPALDO: {
    title: 'BOMBA DE RESPALDO',
    icon: '🔄',
    borderColor: 'border-green-500/60',
    headerBg: 'bg-green-900/60',
    textColor: 'text-green-300',
    getBody: (value, state) => ({
      immediate: [
        value
          ? `Flujo aumentando: ${state.coolantFlow.toFixed(0)}% → ~${Math.min(120, state.coolantFlow + 20).toFixed(0)}%`
          : `Flujo vuelve a nivel primario: ~${state.coolantFlow.toFixed(0)}%`,
        value ? 'Presión +5 bar (flujo adicional)' : 'Presión se normaliza',
        value ? 'Temperatura baja por mayor flujo' : '',
      ].filter(Boolean),
      in30s: [
        value ? 'Sistema redundante activo — seguridad mejorada' : 'Sistema de respaldo en standby',
        value ? 'Equilibrio térmico mejorado' : '',
      ].filter(Boolean),
      recommendation: value
        ? 'Activar cuando flujo < 50% o bomba primaria falla o falla de LOCA'
        : 'Bomba de respaldo disponible para emergencia',
      warning: null,
    }),
  },
};

export function ContextualHints({ activeHint, state, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!activeHint) return;
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 10000);
    return () => clearTimeout(timerRef.current);
  }, [activeHint?.control, activeHint?.value]);

  const handleDismiss = () => {
    setVisible(false);
    clearTimeout(timerRef.current);
    setTimeout(onDismiss, 300);
  };

  if (!activeHint || !state) return null;

  const hint = HINTS[activeHint.control];
  if (!hint) return null;

  const body = hint.getBody(activeHint.value, state);

  return (
    <div
      className={`fixed bottom-4 left-4 z-40 max-w-sm w-full transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className={`bg-slate-900 rounded-xl border-2 ${hint.borderColor} shadow-2xl overflow-hidden`}>
        <div className={`${hint.headerBg} px-4 py-3 flex items-center justify-between border-b border-white/10`}>
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">{hint.icon}</span>
            <div>
              <p className="text-xs text-slate-400 font-medium">📖 Guía contextual</p>
              <p className={`text-sm font-bold ${hint.textColor}`}>{hint.title}</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white transition flex-shrink-0"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 text-xs">
          <div>
            <p className="font-semibold text-slate-300 mb-1.5 uppercase tracking-wide text-xs">Efecto inmediato:</p>
            <ul className="space-y-1">
              {body.immediate.map((line, i) => (
                <li key={i} className="text-slate-300 flex gap-1.5">
                  <span className="text-slate-500 flex-shrink-0">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {body.in30s?.length > 0 && (
            <div>
              <p className="font-semibold text-slate-300 mb-1.5 uppercase tracking-wide text-xs">En 30 segundos:</p>
              <ul className="space-y-1">
                {body.in30s.map((line, i) => (
                  <li key={i} className="text-slate-400 flex gap-1.5">
                    <span className="text-slate-500 flex-shrink-0">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {body.recommendation && (
            <div className="bg-blue-950/40 border border-blue-700/30 rounded-lg px-3 py-2">
              <p className="text-blue-300">💡 {body.recommendation}</p>
            </div>
          )}

          {body.historical && (
            <div className="bg-amber-950/30 border border-amber-700/30 rounded-lg px-3 py-2">
              <p className="text-amber-200">📚 {body.historical}</p>
            </div>
          )}

          {body.warning && (
            <div className="bg-red-950/40 border border-red-700/30 rounded-lg px-3 py-2">
              <p className="text-red-300">⚠️ {body.warning}</p>
            </div>
          )}
        </div>

        {/* Auto-dismiss progress bar */}
        <div className="h-0.5 bg-slate-700">
          <div
            className={`h-0.5 ${hint.borderColor.replace('border-', 'bg-').replace('/60', '')} transition-all`}
            style={{ animation: 'shrink 10s linear forwards' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
