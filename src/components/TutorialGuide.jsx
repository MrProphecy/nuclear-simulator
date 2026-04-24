import React from 'react';
import { CheckCircle, Circle, ArrowRight, BookOpen, X, AlertTriangle, ShieldAlert } from 'lucide-react';

const STEPS = [
  {
    id: 1,
    title: 'Verifica los sistemas',
    instruction:
      'Antes de arrancar el reactor, verifica que todos los sistemas estén en standby. Este paso comprueba el estado del sistema de control, refrigeración y seguridad.',
    action: 'Haz clic en el botón "VERIFICAR SISTEMAS" que aparece abajo',
    confirmText: '✓ Sistemas verificados',
    showVerifyButton: true,
  },
  {
    id: 2,
    title: 'Enciende la bomba',
    instruction:
      'El refrigerante es esencial para enfriar el núcleo. Siempre debe encenderse ANTES de iniciar la reacción nuclear. Sin refrigerante la temperatura sube exponencialmente.',
    action: 'Haz clic en "BOMBA ON/OFF" en el panel de controles (se ilumina en amarillo)',
    confirmText: '✓ Bomba en marcha',
  },
  {
    id: 3,
    title: 'Inicia la reacción',
    instruction:
      'Ahora puedes iniciar la simulación. El reactor comenzará con baja potencia y podrás observar cómo la temperatura y la presión empiezan a subir gradualmente.',
    action: 'Haz clic en el botón "INICIAR" en el panel de controles (se ilumina en amarillo)',
    confirmText: '✓ Reacción iniciada',
  },
  {
    id: 4,
    title: 'Advertencias de seguridad',
    instruction:
      'Antes de ajustar la potencia, DEBES conocer los límites de seguridad del reactor. Si los superas, el sistema se apagará automáticamente (SCRAM).',
    action: 'Lee los límites y haz clic en "Entendido, continuar"',
    confirmText: '✓ Advertencias entendidas',
    showSafetyButton: true,
  },
  {
    id: 5,
    title: 'Estabiliza la potencia (500–800 MW)',
    instruction:
      'Usa el slider "Barras de Control" para ajustar la potencia. Más % de barras = menos potencia. Mantén la potencia entre 500 y 800 MW durante 3 segundos.',
    action: 'Mueve el slider "Barras de Control" hasta que Potencia esté entre 500–800 MW',
    confirmText: '✓ Potencia estabilizada',
  },
  {
    id: 6,
    title: 'Monitorea temperatura y presión',
    instruction:
      'Observa los medidores y gráficas. La temperatura debe mantenerse bajo 550 K y la presión bajo 155 bar. Si los valores suben, inserta más barras de control.',
    action: 'Observa las gráficas durante unos segundos...',
    confirmText: '✓ Parámetros dentro de rango',
  },
  {
    id: 7,
    title: '¡Reactor operativo!',
    instruction:
      '¡Felicidades! Has encendido el reactor con éxito siguiendo el procedimiento correcto. Has obtenido el logro "Operador Certificado".',
    action: null,
    confirmText: '🏆 Operador Certificado desbloqueado',
  },
];

export function TutorialGuide({ currentStep, completedSteps, onClose, onVerifySystems, onSafetyAcknowledge, power }) {
  const isComplete = currentStep > 7;
  const step = STEPS[Math.min(currentStep, 7) - 1];

  const powerInRange = typeof power === 'number' && power >= 500 && power <= 800;

  return (
    <div className="bg-gradient-to-br from-blue-950/70 to-slate-800 rounded-xl border-2 border-blue-500/60 p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-bold text-sm tracking-wide">TUTORIAL INTERACTIVO</h3>
        </div>
        <div className="flex items-center gap-3">
          {!isComplete && (
            <span className="text-blue-300 text-xs font-mono bg-blue-900/40 px-2 py-0.5 rounded">
              Paso {currentStep}/7
            </span>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
            title="Cerrar tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 mb-4">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              completedSteps.includes(s.id)
                ? 'bg-green-500'
                : s.id === currentStep
                ? 'bg-blue-400 animate-pulse'
                : 'bg-slate-600'
            }`}
          />
        ))}
      </div>

      {isComplete ? (
        <div className="text-center py-6">
          <p className="text-5xl mb-3">🏆</p>
          <p className="text-white font-bold text-xl mb-2">¡Tutorial completado!</p>
          <p className="text-slate-300 text-sm mb-4">
            Ahora puedes explorar el simulador libremente. Prueba los escenarios de Chernobyl o Fukushima para ver qué pasa cuando algo falla.
          </p>
          <button
            onClick={onClose}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Explorar libremente
          </button>
        </div>
      ) : step ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current step detail */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-white text-xs font-bold px-2 py-1 rounded-full ${step.id === 4 ? 'bg-orange-600' : 'bg-blue-600'}`}>
                PASO {step.id}
              </span>
              <h4 className="text-white font-bold">{step.title}</h4>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">{step.instruction}</p>

            {step.action && !completedSteps.includes(step.id) && (
              <div className="bg-blue-900/40 border border-blue-600/50 rounded-lg p-3 flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-blue-200 text-sm">{step.action}</p>
              </div>
            )}

            {/* Step 1: verify button */}
            {step.id === 1 && !completedSteps.includes(1) && (
              <button
                onClick={onVerifySystems}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition text-sm flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                VERIFICAR SISTEMAS
              </button>
            )}

            {/* Step 4: safety warning panel */}
            {step.id === 4 && !completedSteps.includes(4) && (
              <div className="space-y-3">
                <div className="bg-red-950/40 border border-red-500/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3 text-red-300 font-bold text-xs uppercase tracking-wide">
                    <ShieldAlert className="w-4 h-4" />
                    Límites críticos del reactor
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-3 gap-2 text-center font-semibold text-slate-400 mb-1">
                      <span>Parámetro</span>
                      <span className="text-yellow-400">Advertencia</span>
                      <span className="text-red-400">SCRAM automático</span>
                    </div>
                    {[
                      { param: 'Temperatura', warn: '>550 K', scram: '>600 K' },
                      { param: 'Presión', warn: '>155 bar', scram: '>160 bar' },
                      { param: 'Flujo refrigerante', warn: '<50%', scram: '<30%' },
                    ].map((row) => (
                      <div key={row.param} className="grid grid-cols-3 gap-2 text-center bg-slate-800/60 rounded-lg py-1.5 px-2">
                        <span className="text-slate-300 text-left">{row.param}</span>
                        <span className="text-yellow-300 font-mono">{row.warn}</span>
                        <span className="text-red-300 font-mono font-bold">{row.scram}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                    Si el SCRAM se activa: las barras se insertan al 100%, la reacción se detiene y
                    deberás esperar que temperatura y presión bajen antes de reiniciar.
                  </p>
                  <p className="text-blue-300 text-xs mt-2 italic">
                    Esto es exactamente lo que falló en Chernobyl: los operadores ignoraron estas advertencias.
                  </p>
                </div>
                <button
                  onClick={onSafetyAcknowledge}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-lg transition text-sm flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Entendido, continuar al paso 5
                </button>
              </div>
            )}

            {/* Step 5 — live power feedback + arrow to slider */}
            {step.id === 5 && !completedSteps.includes(5) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wide">
                  <span className="text-base animate-bounce">↓</span>
                  <span className="animate-pulse">
                    Usa el slider "Barras de Control" en el panel de arriba
                  </span>
                  <span className="text-base animate-bounce">↓</span>
                </div>

                <div
                  className={`flex items-center justify-between rounded-lg px-3 py-2 border ${
                    powerInRange
                      ? 'bg-green-900/40 border-green-600/50'
                      : 'bg-red-900/30 border-red-600/40'
                  }`}
                >
                  <span className="text-sm text-slate-300">Potencia actual:</span>
                  <span
                    className={`text-xl font-bold tabular-nums ${
                      powerInRange ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {typeof power === 'number' ? power.toFixed(0) : '—'} MW
                  </span>
                </div>

                {powerInRange ? (
                  <div className="flex items-center gap-2 text-green-400 text-sm font-medium bg-green-900/30 rounded-lg px-3 py-2 border border-green-600/40">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    ¡Correcto! Potencia estabilizada. Mantén el rango 3 segundos para continuar →
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-200 text-sm bg-yellow-900/30 rounded-lg px-3 py-2 border border-yellow-600/40">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-yellow-400" />
                    Fuera de rango (necesitas 500–800 MW). Mueve el slider de Barras de Control.
                  </div>
                )}
              </div>
            )}

            {completedSteps.includes(step.id) && (
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                {step.confirmText}
              </div>
            )}
          </div>

          {/* Steps overview sidebar */}
          <div className="space-y-1">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-2">Historial</p>
            {STEPS.map((s) => {
              const done = completedSteps.includes(s.id);
              const active = s.id === currentStep;

              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded transition ${
                    active
                      ? 'bg-blue-600/30 border border-blue-600/40 text-white'
                      : done
                      ? 'text-green-400'
                      : 'text-slate-500'
                  }`}
                >
                  {done ? (
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-green-500" />
                  ) : active ? (
                    <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 flex-shrink-0 text-slate-600" />
                  )}
                  <span className={`truncate ${done ? 'line-through opacity-70' : ''}`}>
                    {s.title}
                  </span>
                  {done && <span className="ml-auto text-green-500 flex-shrink-0">✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
