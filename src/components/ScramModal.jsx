import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, BookOpen, RotateCcw } from 'lucide-react';

export function ScramModal({ scramReason, temperature, pressure, onClose, onRetry, onTutorial, onRecover }) {
  const canRecover = temperature < 400 && pressure < 100;

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

          {/* Sección 1: Por qué pasó */}
          <div className="bg-red-900/20 border border-red-600/40 rounded-xl p-4">
            <h2 className="text-red-300 font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              ¿Por qué pasó?
            </h2>
            <div className="bg-red-950/60 rounded-lg p-3 mb-3 border border-red-500/30">
              <p className="text-slate-300 text-xs mb-1">El SCRAM se activó porque:</p>
              <p className="text-red-100 font-bold text-base">
                {scramReason || 'Sistema de seguridad detectó condición anormal'}
              </p>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Esta es una <strong className="text-white">medida de seguridad automática</strong> que detiene
              INMEDIATAMENTE la reacción nuclear cuando detecta una condición peligrosa.
            </p>
          </div>

          {/* Sección 2: Consecuencias */}
          <div className="bg-slate-800/60 border border-slate-600/40 rounded-xl p-4">
            <h2 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Consecuencias</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-green-300 text-xs font-semibold mb-2">¿Qué pasó?</p>
                <div className="space-y-1.5">
                  {[
                    'Barras de control insertadas al 100%',
                    'Reacción nuclear detenida',
                    'Potencia cae a cero',
                    'Temperatura y presión bajan lentamente',
                    'Sistema de refrigeración de emergencia activado',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-300 text-xs">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-green-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-blue-950/40 border border-blue-600/30 rounded-lg p-3">
                <p className="text-blue-300 font-bold text-xs mb-2">¿Es peligroso?</p>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Paradójicamente <strong className="text-green-400">NO</strong>. El SCRAM es una
                  <strong className="text-white"> CARACTERÍSTICA DE SEGURIDAD</strong>.
                  Es como los airbags: se disparan para <strong className="text-green-300">EVITAR un accidente peor</strong>.
                </p>
                <p className="text-slate-500 text-xs mt-2 italic leading-relaxed">
                  "En Chernobyl, el SCRAM falló. En Fukushima, el SCRAM funcionó perfectamente y evitó una catástrofe mayor."
                </p>
              </div>
            </div>
          </div>

          {/* Sección 3: Cómo solucionarlo + estado en tiempo real */}
          <div className="bg-slate-800/60 border border-slate-600/40 rounded-xl p-4">
            <h2 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Estado actual del sistema</h2>

            {/* Valores en tiempo real */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className={`rounded-lg p-3 border text-center ${temperature < 400 ? 'bg-green-950/40 border-green-600/50' : 'bg-slate-900/60 border-slate-600/40'}`}>
                <p className="text-slate-400 text-xs mb-1">Temperatura</p>
                <p className={`text-xl font-bold tabular-nums ${temperature < 400 ? 'text-green-400' : 'text-orange-300'}`}>
                  {temperature.toFixed(0)} K
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  {temperature < 400 ? '✓ Seguro' : 'Objetivo <400K'}
                </p>
                <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${temperature < 400 ? 'bg-green-500' : 'bg-orange-500'}`}
                    style={{ width: `${Math.min(100, (temperature / 600) * 100)}%` }}
                  />
                </div>
              </div>

              <div className={`rounded-lg p-3 border text-center ${pressure < 100 ? 'bg-green-950/40 border-green-600/50' : 'bg-slate-900/60 border-slate-600/40'}`}>
                <p className="text-slate-400 text-xs mb-1">Presión</p>
                <p className={`text-xl font-bold tabular-nums ${pressure < 100 ? 'text-green-400' : 'text-cyan-300'}`}>
                  {pressure.toFixed(1)} bar
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  {pressure < 100 ? '✓ Seguro' : 'Objetivo <100 bar'}
                </p>
                <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${pressure < 100 ? 'bg-green-500' : 'bg-cyan-500'}`}
                    style={{ width: `${Math.min(100, (pressure / 160) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-lg p-3 border bg-slate-900/60 border-slate-600/40 text-center">
                <p className="text-slate-400 text-xs mb-1">Barras</p>
                <p className="text-xl font-bold text-green-400">100%</p>
                <p className="text-slate-500 text-xs mt-1">Totalmente insertadas</p>
                <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div className="h-1.5 rounded-full bg-green-500 w-full" />
                </div>
              </div>
            </div>

            {/* Qué hacer / qué no hacer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-green-300 text-xs font-bold mb-2">Qué hacer ahora:</p>
                <ol className="space-y-1">
                  {[
                    'Espera que temperatura baje a <400K',
                    'Espera que presión baje a <100 bar',
                    'Verifica flujo de refrigerante al 100%',
                    "Click en 'RECUPERAR' para reiniciar",
                    'Comienza lentamente desde cero',
                  ].map((item, i) => (
                    <li key={i} className="text-slate-300 text-xs flex items-start gap-1.5">
                      <span className="text-blue-400 font-bold flex-shrink-0 w-3">{i + 1}.</span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <p className="text-red-300 text-xs font-bold mb-2">Qué NO hacer:</p>
                <ul className="space-y-1">
                  {[
                    'No ignores las advertencias previas',
                    'No hagas cambios bruscos de parámetros',
                    'No intentes reiniciar antes de estabilizar',
                  ].map((item, i) => (
                    <li key={i} className="text-slate-300 text-xs flex items-start gap-1.5">
                      <XCircle className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Estado de recuperación */}
            {canRecover ? (
              <div className="bg-green-900/40 border border-green-500/50 rounded-lg p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-green-300 font-bold text-sm">Sistema estabilizado</p>
                    <p className="text-green-400/70 text-xs">Temperatura y presión en rango seguro</p>
                  </div>
                </div>
                <button
                  onClick={onRecover}
                  className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition flex-shrink-0"
                >
                  RECUPERAR
                </button>
              </div>
            ) : (
              <div className="bg-orange-900/20 border border-orange-600/30 rounded-lg p-3 flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <div>
                  <p className="text-orange-300 text-sm font-semibold">Esperando estabilización...</p>
                  <p className="text-slate-400 text-xs">
                    Temp: {temperature.toFixed(0)}K → 400K &nbsp;|&nbsp; Presión: {pressure.toFixed(1)} bar → 100 bar
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sección 4: Lecciones históricas */}
          <div className="bg-slate-800/40 border border-slate-600/30 rounded-xl p-4">
            <h2 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Esto pasó en la vida real</h2>
            <div className="space-y-3">
              {[
                {
                  emoji: '💣',
                  label: 'Chernobyl 1986',
                  color: 'text-red-300',
                  text: 'Los operadores ignoraron advertencias y desactivaron los sistemas de seguridad. El SCRAM llegó tarde. Resultado: explosión y fusión del núcleo.',
                },
                {
                  emoji: '⚛️',
                  label: 'Three Mile Island 1979',
                  color: 'text-yellow-300',
                  text: 'El SCRAM funcionó correctamente y detuvo la reacción. La crisis fue por mal manejo posterior del refrigerante. El reactor quedó contenido.',
                },
                {
                  emoji: '🌊',
                  label: 'Fukushima 2011',
                  color: 'text-blue-300',
                  text: 'El tsunami activó el SCRAM automático (funcionó perfectamente). El problema fue que el tsunami también destruyó los generadores de la bomba de refrigeración de emergencia.',
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{item.emoji}</span>
                  <div>
                    <p className={`${item.color} font-bold text-xs`}>{item.label}:</p>
                    <p className="text-slate-400 text-xs leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
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
