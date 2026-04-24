import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

function Section({ id, open, onToggle, icon, title, colorClass, children }) {
  return (
    <div className="mb-2">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between text-left px-4 py-2.5 bg-slate-800/70 hover:bg-slate-700/70 rounded-lg border border-slate-600/40 transition-all"
      >
        <span className={`font-semibold text-sm ${colorClass}`}>
          {icon} {title}
        </span>
        {open === id
          ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        }
      </button>
      {open === id && (
        <div className="mt-1.5 px-4 py-3 bg-slate-900/60 rounded-lg border border-slate-700/40 text-xs leading-relaxed space-y-2.5">
          {children}
        </div>
      )}
    </div>
  );
}

export function EducationPanel({ onClose }) {
  const [open, setOpen] = useState(null);
  const toggle = (id) => setOpen(o => (o === id ? null : id));

  return (
    <div className="bg-gradient-to-br from-blue-950/60 to-slate-900/80 rounded-xl border border-blue-500/30 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-blue-300 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
          <span>📚</span> Panel de Educación
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition p-1 rounded"
          aria-label="Cerrar panel educativo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Glosario Rápido */}
      <Section id="glossary" open={open} onToggle={toggle} icon="📖" title="Glosario Rápido" colorClass="text-blue-300">
        {[
          [
            'Reactividad',
            'Medida del balance neutrónico (en dólares $). Positiva = la reacción crece, negativa = se apaga. El operador la controla con las barras de boro.',
          ],
          [
            'SCRAM',
            'Safety Control Rod Axe Man. Sistema de emergencia que inserta TODAS las barras al instante para detener la fisión en segundos.',
          ],
          [
            'LOCA',
            'Loss Of Coolant Accident. Pérdida de refrigerante por rotura de tubería. Sin agua, el calor residual funde el núcleo aunque el reactor esté "apagado".',
          ],
          [
            'Punto Cinético',
            'Modelo matemático (dn/dt = [(ρ−β)/Λ]·n) que describe cómo cambia la población de neutrones en el tiempo. Es la base física de este simulador.',
          ],
        ].map(([term, def]) => (
          <div key={term}>
            <span className="text-white font-bold">{term}: </span>
            <span className="text-slate-300">{def}</span>
          </div>
        ))}
      </Section>

      {/* Cómo funciona un reactor */}
      <Section id="how" open={open} onToggle={toggle} icon="⚛️" title="¿Cómo funciona un reactor?" colorClass="text-green-300">
        {[
          [
            'Fisión',
            'Átomos de uranio-235 se dividen al capturar neutrones. Cada fisión libera ~200 MeV de energía térmica y 2-3 neutrones nuevos que propagan la reacción en cadena.',
          ],
          [
            'Enfriamiento',
            'El agua del circuito primario absorbe el calor del núcleo sin hervir (alta presión). Ese calor convierte agua del circuito secundario en vapor que mueve turbinas eléctricas.',
          ],
          [
            'Control',
            'Las barras de boro absorben neutrones libres. Más inserción = menos neutrones = menos potencia. Sin barras insertadas la reacción escalaría sin control.',
          ],
        ].map(([step, desc], i) => (
          <div key={step} className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-800 text-green-200 font-bold text-center leading-5">
              {i + 1}
            </span>
            <div>
              <span className="text-white font-semibold">{step}: </span>
              <span className="text-slate-300">{desc}</span>
            </div>
          </div>
        ))}
      </Section>

      {/* Por qué cada parámetro importa */}
      <Section id="params" open={open} onToggle={toggle} icon="📊" title="¿Por qué cada parámetro importa?" colorClass="text-yellow-300">
        {[
          [
            '⚡ Potencia',
            'Más potencia = más electricidad generada, pero más calor que disipar. Si excede el límite de diseño el combustible puede fundirse (meltdown).',
          ],
          [
            '🌡️ Temperatura',
            'El zircaloy que recubre las varillas de combustible falla sobre ~1200 °C. Si se rompe, el UO₂ queda expuesto y se libera radiactividad al circuito primario.',
          ],
          [
            '⊕ Presión',
            'El agua está a 150 bar para no hervir a 300 °C. Si la presión excede los límites estructurales, las tuberías del circuito primario pueden fallar catastróficamente.',
          ],
          [
            '💧 Flujo Refrigerante',
            'Sin circulación, el calor de decaimiento (decay heat) que genera el núcleo — incluso apagado — puede fundir el combustible en pocas horas (fue el problema en Fukushima).',
          ],
        ].map(([param, why]) => (
          <div key={param}>
            <span className="text-yellow-300 font-semibold">{param}: </span>
            <span className="text-slate-300">{why}</span>
          </div>
        ))}
      </Section>
    </div>
  );
}
