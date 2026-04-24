import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';

const INSTRUMENTS = [
  {
    icon: '⚡',
    name: 'Potencia',
    unit: 'MW',
    description: 'Mide la energía que produce el reactor en Megavatios. La potencia nominal de un reactor PWR típico es de 1000 MW.',
    safeRange: '500 – 1000 MW',
    warning: 'Por encima de 1600 MW el reactor entra en zona peligrosa.',
    color: 'text-red-400',
  },
  {
    icon: '🌡️',
    name: 'Temperatura',
    unit: 'K',
    description: 'Temperatura del núcleo del reactor. Debe mantenerse bajo 550 K para evitar la fusión del material combustible.',
    safeRange: '300 – 450 K',
    warning: 'Por encima de 600 K hay riesgo inminente de fusión del núcleo (meltdown).',
    color: 'text-orange-400',
  },
  {
    icon: '💨',
    name: 'Presión',
    unit: 'bar',
    description: 'Presión del circuito primario de refrigeración. Un exceso de presión puede romper la vasija del reactor.',
    safeRange: '140 – 155 bar',
    warning: 'Por encima de 160 bar el sistema activa el SCRAM automáticamente.',
    color: 'text-cyan-400',
  },
  {
    icon: '💧',
    name: 'Flujo de Refrigerante',
    unit: '%',
    description: 'Circulación de agua que enfría el núcleo. Sin refrigerante, la temperatura sube exponencialmente en segundos.',
    safeRange: '80 – 100%',
    warning: 'Por debajo del 30% es un estado de emergencia (accidente LOCA).',
    color: 'text-blue-400',
  },
  {
    icon: '⚛️',
    name: 'Reactividad',
    unit: '$',
    description: 'Nivel de control de la reacción nuclear. Valor positivo = la reacción se acelera; negativo = se frena. Se mide en dólares ($).',
    safeRange: '−1 a +1 $',
    warning: 'Por encima de +1 $ la potencia crece muy rápidamente y puede ser difícil de controlar.',
    color: 'text-yellow-400',
  },
  {
    icon: '🔩',
    name: 'Barras de Control',
    unit: '% insertadas',
    description: 'Varas de boro que absorben neutrones. A mayor inserción, menor reactividad y menor potencia. Son el principal mecanismo de control.',
    safeRange: '50 – 90% insertadas',
    warning: 'Barras completamente retiradas = reacción sin control ni frenado posible.',
    color: 'text-purple-400',
  },
];

function InstrumentCard({ instrument }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-slate-700/40 rounded-lg border border-slate-600/60 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-700/70 transition"
      >
        <span className="text-lg">{instrument.icon}</span>
        <div className="flex-1 min-w-0">
          <span className={`font-bold text-sm ${instrument.color}`}>{instrument.name}</span>
          <span className="text-slate-500 text-xs ml-2">({instrument.unit})</span>
        </div>
        {open ? (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-600/60 space-y-2">
          <p className="text-sm text-slate-200 leading-relaxed">{instrument.description}</p>
          <p className="text-xs">
            <span className="text-green-400 font-semibold">✓ Rango seguro: </span>
            <span className="text-slate-300">{instrument.safeRange}</span>
          </p>
          <div className="bg-red-900/30 border border-red-700/40 rounded px-3 py-2">
            <span className="text-red-300 text-xs">⚠ {instrument.warning}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function InstrumentsPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-700/40 transition rounded-lg"
      >
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">INSTRUMENTOS DEL REACTOR</h3>
          <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-600/40">
            Guía educativa
          </span>
        </div>
        {open ? (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-slate-400 text-sm mb-3">
            Cada instrumento mide un parámetro crítico del reactor. Haz clic en cada uno para aprender más.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {INSTRUMENTS.map((ins) => (
              <InstrumentCard key={ins.name} instrument={ins} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
