import React from 'react';
import { AlertTriangle, CheckCircle, BookOpen, RotateCcw } from 'lucide-react';

export function ScramModal({ scramReason, temperature, pressure, coolantFlow = 100, onClose, onRetry, onTutorial, onRecover }) {
  const tempOk = temperature < 400;
  const pressureOk = pressure < 100;
  const flowOk = coolantFlow >= 80;
  const canRecover = tempOk && pressureOk;

  const checkItems = [
    {
      label: 'Espera a que Temperatura < 400K',
      checked: tempOk,
      current: `${temperature.toFixed(0)} K`,
      note: null,
    },
    {
      label: 'Espera a que Presión < 100 bar',
      checked: pressureOk,
      current: `${pressure.toFixed(1)} bar`,
      note: null,
    },
    {
      label: 'Verifica Flujo Refrigerante = 100%',
      checked: flowOk,
      current: `${coolantFlow.toFixed(0)} %`,
      note: !flowOk && coolantFlow < 30
        ? 'Enciende la bomba antes de recuperar'
        : !flowOk ? 'Flujo por debajo del mínimo' : null,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-slate-900 to-red-950/30 rounded-2xl border-2 border-red-500 shadow-2xl shadow-red-900/50 max-w-2xl w-full my-4">

        {/* Header */}
        <div className="bg-red-900/60 rounded-t-2xl p-5 border-b border-red-600/50 text-center">
          <div className="text-5xl mb-2 animate-pulse">⚠️</div>
          <h1 className="text-2xl font-bold text-red-300 tracking-wide">SCRAM ACTIVADO</h1>
          <p className="text-red-200/70 text-sm mt-1">REACTOR APAGADO — SISTEMA DE SEGURIDAD ACTIVADO</p>
        </div>

        <div className="p-5 space-y-4">

          {/* Sección 1: ¿Por qué se activó? */}
          <div className="bg-red-900/20 border border-red-600/40 rounded-xl p-4">
            <h2 className="text-red-300 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Sección 1 — ¿Por qué se activó?
            </h2>
            <div className="bg-red-950/60 rounded-lg p-3 border border-red-500/30">
              <p className="text-slate-400 text-xs mb-1">Causa específica del SCRAM:</p>
              <p className="text-red-100 font-bold text-base">
                {scramReason || 'Sistema de seguridad detectó condición anormal'}
              </p>
            </div>
          </div>

          {/* Sección 2: ¿Qué significa? */}
          <div className="bg-slate-800/60 border border-slate-600/40 rounded-xl p-4">
            <h2 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Sección 2 — ¿Qué significa el SCRAM?
            </h2>
            <div className="space-y-2 mb-3">
              {[
                'El SCRAM es un sistema de SEGURIDAD automático',
                'Barras de control se insertaron al 100%',
                'Reacción nuclear detenida INMEDIATAMENTE',
                'Potencia cae a cero en segundos',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-300 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-green-400" />
                  {item}
                </div>
              ))}
            </div>
            <div className="bg-blue-950/40 border border-blue-600/30 rounded-lg p-3">
              <p className="text-green-300 font-bold text-xs mb-1">¿Es un accidente? NO — es la solución.</p>
              <p className="text-slate-300 text-xs leading-relaxed">
                El SCRAM es como los airbags de un coche: se activa para{' '}
                <strong className="text-green-300">EVITAR un accidente peor</strong>.
                Esto es <strong className="text-white">BUENO, no un problema</strong>.
              </p>
            </div>
          </div>

          {/* Sección 3: Casos históricos */}
          <div className="bg-slate-800/40 border border-slate-600/30 rounded-xl p-4">
            <h2 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Sección 3 — Casos Históricos
            </h2>
            <div className="space-y-3">
              {[
                {
                  emoji: '💣',
                  label: 'Chernobyl 1986',
                  badge: 'SCRAM falló → Explosión',
                  badgeColor: 'bg-red-900/60 text-red-300',
                  text: 'Los operadores desactivaron los sistemas de seguridad para un experimento. El SCRAM llegó tarde. Resultado: explosión de vapor y fusión del núcleo.',
                },
                {
                  emoji: '⚛️',
                  label: 'Three Mile Island 1979',
                  badge: 'SCRAM funcionó → Contenido',
                  badgeColor: 'bg-yellow-900/60 text-yellow-300',
                  text: 'El SCRAM detuvo la reacción correctamente. La crisis fue por mal manejo posterior del refrigerante, pero el reactor quedó contenido.',
                },
                {
                  emoji: '🌊',
                  label: 'Fukushima 2011',
                  badge: 'SCRAM funcionó → Tsunami cortó todo',
                  badgeColor: 'bg-blue-900/60 text-blue-300',
                  text: 'El tsunami activó el SCRAM automático (funcionó perfectamente). El problema fue que destruyó los generadores de la bomba de refrigeración de emergencia.',
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 leading-none mt-0.5">{item.emoji}</span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-white font-bold text-xs">{item.label}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sección 4: Checklist de recuperación */}
          <div className="bg-slate-800/60 border border-slate-600/40 rounded-xl p-4">
            <h2 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Sección 4 — ¿Cómo recuperarse?
            </h2>

            <div className="space-y-2">
              {/* Checklist items 1-3 */}
              {checkItems.map(({ label, checked, current, note }, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-500 ${
                    checked
                      ? 'bg-green-950/40 border-green-600/50'
                      : 'bg-slate-900/60 border-slate-600/40'
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
                      checked ? 'bg-green-500 border-green-500' : 'border-slate-500 bg-slate-800'
                    }`}
                  >
                    {checked && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium ${checked ? 'text-green-300 line-through decoration-green-600' : 'text-slate-300'}`}>
                      {label}
                    </span>
                    {note && (
                      <p className="text-yellow-400 text-xs mt-0.5 font-semibold">{note}</p>
                    )}
                  </div>

                  <span className={`text-xs tabular-nums font-mono flex-shrink-0 ${checked ? 'text-green-400' : 'text-orange-300'}`}>
                    {current}
                  </span>
                </div>
              ))}

              {/* Item 4: RECUPERAR */}
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-500 ${
                  canRecover
                    ? 'bg-green-900/40 border-green-500/60'
                    : 'bg-slate-900/30 border-slate-700/40 opacity-60'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
                    canRecover ? 'bg-green-500 border-green-500' : 'border-slate-600 bg-slate-800'
                  }`}
                >
                  {canRecover && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                <div className="flex-1">
                  <span className={`text-sm font-medium ${canRecover ? 'text-green-300' : 'text-slate-500'}`}>
                    Click en RECUPERAR
                  </span>
                  {!canRecover && (
                    <p className="text-slate-600 text-xs">aparece cuando todo esté OK</p>
                  )}
                </div>

                {canRecover ? (
                  <button
                    onClick={onRecover}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-1.5 px-5 rounded-lg text-sm transition flex-shrink-0 shadow-lg shadow-green-900/40"
                  >
                    RECUPERAR
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-600 text-xs flex-shrink-0">
                    <div className="w-3 h-3 border border-slate-600 border-t-transparent rounded-full animate-spin" />
                    esperando...
                  </div>
                )}
              </div>
            </div>

            {/* Waiting status */}
            {!canRecover && (
              <div className="mt-3 flex items-center gap-3 p-3 bg-orange-900/20 border border-orange-600/30 rounded-lg">
                <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <div>
                  <p className="text-orange-300 text-sm font-semibold">Esperando estabilización...</p>
                  <p className="text-slate-400 text-xs">
                    T: {temperature.toFixed(0)}K → &lt;400K &nbsp;|&nbsp; P: {pressure.toFixed(1)} bar → &lt;100 bar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={onClose}
            className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-xl transition text-sm"
          >
            Entendido
          </button>
          <button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition text-sm flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reiniciar de cero
          </button>
          <button
            onClick={onTutorial}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-xl transition text-sm flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Ver Tutorial
          </button>
        </div>
      </div>
    </div>
  );
}
