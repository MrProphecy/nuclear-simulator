import React from 'react';
import { CheckCircle, Circle, ArrowRight, BookOpen, X } from 'lucide-react';

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
    title: 'Enciende la bomba de refrigerante',
    instruction:
      'El refrigerante es esencial para enfriar el núcleo. Siempre debe encenderse ANTES de iniciar la reacción nuclear. Sin refrigerante la temperatura sube exponencialmente.',
    action: 'Haz clic en "BOMBA ON/OFF" en el panel de controles (se ilumina en amarillo)',
    confirmText: '✓ Bomba en marcha',
  },
  {
    id: 3,
    title: 'Inicia la reacción nuclear',
    instruction:
      'Ahora puedes iniciar la simulación. El reactor comenzará con baja potencia y podrás observar cómo la temperatura y la presión empiezan a subir gradualmente.',
    action: 'Haz clic en el botón "INICIAR" en el panel de controles (se ilumina en amarillo)',
    confirmText: '✓ Reacción iniciada',
  },
  {
    id: 4,
    title: 'Estabiliza la potencia (500–800 MW)',
    instruction:
      'Usa BARRAS+ para insertar barras de boro y reducir la potencia, o BARRAS- para retirarlas y aumentarla. Mantén la potencia entre 500 y 800 MW durante 3 segundos.',
    action: 'Ajusta los controles de barras hasta que la Potencia esté entre 500 y 800 MW',
    confirmText: '✓ Potencia estabilizada',
  },
  {
    id: 5,
    title: 'Monitorea temperatura y presión',
    instruction:
      'Observa los medidores y gráficas. La temperatura debe mantenerse bajo 550 K y la presión bajo 155 bar. Si los valores suben, inserta más barras de control.',
    action: 'Observa las gráficas durante unos segundos...',
    confirmText: '✓ Parámetros dentro de rango',
  },
  {
    id: 6,
    title: '¡Reactor operativo!',
    instruction:
      '¡Felicidades! Has encendido el reactor con éxito siguiendo el procedimiento correcto. Has obtenido el logro "Operador Certificado".',
    action: null,
    confirmText: '🏆 Operador Certificado desbloqueado',
  },
];

export function TutorialGuide({ currentStep, completedSteps, onClose, onVerifySystems }) {
  const isComplete = currentStep > 6;
  const step = STEPS[Math.min(currentStep, 6) - 1];

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
              Paso {currentStep}/6
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
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
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

            {step.id === 1 && !completedSteps.includes(1) && (
              <button
                onClick={onVerifySystems}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition text-sm flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                VERIFICAR SISTEMAS
              </button>
            )}

            {completedSteps.includes(step.id) && (
              <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                {step.confirmText}
              </div>
            )}
          </div>

          {/* Steps overview sidebar */}
          <div className="space-y-1.5">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded transition ${
                  s.id === currentStep
                    ? 'bg-blue-600/30 border border-blue-600/40 text-white'
                    : completedSteps.includes(s.id)
                    ? 'text-green-400'
                    : 'text-slate-500'
                }`}
              >
                {completedSteps.includes(s.id) ? (
                  <CheckCircle className="w-3 h-3 flex-shrink-0" />
                ) : s.id === currentStep ? (
                  <ArrowRight className="w-3 h-3 flex-shrink-0 text-blue-400" />
                ) : (
                  <Circle className="w-3 h-3 flex-shrink-0" />
                )}
                <span className="truncate">{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
