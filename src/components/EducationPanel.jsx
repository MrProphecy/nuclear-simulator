import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

function Section({ id, open, onToggle, icon, title, colorClass, children }) {
  return (
    <div className="mb-2">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between text-left px-4 py-2.5 bg-slate-800/70 hover:bg-slate-700/70 rounded-lg border border-slate-600/40 transition-all"
      >
        <span className={`font-semibold text-sm ${colorClass}`}>{icon} {title}</span>
        {open === id
          ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {open === id && (
        <div className="mt-1.5 px-4 py-3 bg-slate-900/60 rounded-lg border border-slate-700/40 text-xs leading-relaxed space-y-2.5">
          {children}
        </div>
      )}
    </div>
  );
}

function Equation({ children }) {
  return (
    <div className="bg-slate-800/80 border border-slate-600/40 rounded px-3 py-2 font-mono text-cyan-300 text-xs my-2">
      {children}
    </div>
  );
}

function CaseReal({ title, outcome, children }) {
  return (
    <div className="bg-slate-800/50 border border-slate-600/30 rounded px-3 py-2 mt-2">
      <p className="text-white font-semibold mb-1">{title}</p>
      <p className="text-slate-300">{children}</p>
      {outcome && <p className="text-yellow-300 mt-1 font-semibold">{outcome}</p>}
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
          <span>📚</span> Panel de Educación — v2.2 Realismo Profundo
        </h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1 rounded" aria-label="Cerrar">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── GLOSARIO ── */}
      <Section id="glossary" open={open} onToggle={toggle} icon="📖" title="Glosario Rápido" colorClass="text-blue-300">
        {[
          ['Reactividad', 'Medida del balance neutrónico (en dólares $). Positiva = la reacción crece, negativa = se apaga. El operador la controla con las barras de boro.'],
          ['SCRAM', 'Safety Control Rod Axe Man. Sistema de emergencia que inserta TODAS las barras al instante para detener la fisión en segundos.'],
          ['LOCA', 'Loss Of Coolant Accident. Pérdida de refrigerante por rotura de tubería. Sin agua, el calor residual funde el núcleo aunque el reactor esté "apagado".'],
          ['Punto Cinético', 'Modelo matemático (dn/dt = [(ρ−β)/Λ]·n) que describe cómo cambia la población de neutrones en el tiempo. Es la base física de este simulador.'],
        ].map(([term, def]) => (
          <div key={term}>
            <span className="text-white font-bold">{term}: </span>
            <span className="text-slate-300">{def}</span>
          </div>
        ))}
      </Section>

      {/* ── CÓMO FUNCIONA ── */}
      <Section id="how" open={open} onToggle={toggle} icon="⚛️" title="¿Cómo funciona un reactor?" colorClass="text-green-300">
        {[
          ['Fisión', 'Átomos de uranio-235 se dividen al capturar neutrones. Cada fisión libera ~200 MeV de energía térmica y 2-3 neutrones nuevos que propagan la reacción en cadena.'],
          ['Enfriamiento', 'El agua del circuito primario absorbe el calor del núcleo sin hervir (alta presión). Ese calor convierte agua del circuito secundario en vapor que mueve turbinas eléctricas.'],
          ['Control', 'Las barras de boro absorben neutrones libres. Más inserción = menos neutrones = menos potencia. Sin barras insertadas la reacción escalaría sin control.'],
        ].map(([step, desc], i) => (
          <div key={step} className="flex gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-800 text-green-200 font-bold text-center leading-5">{i + 1}</span>
            <div><span className="text-white font-semibold">{step}: </span><span className="text-slate-300">{desc}</span></div>
          </div>
        ))}
      </Section>

      {/* ── RETROALIMENTACIÓN DOPPLER ── */}
      <Section id="doppler" open={open} onToggle={toggle} icon="🌡️" title="Retroalimentación Térmica Doppler" colorClass="text-cyan-300">
        <div>
          <p className="text-white font-semibold mb-2">¿Qué es el efecto Doppler en un reactor?</p>
          <p className="text-slate-300">
            Cuando la temperatura del combustible sube, los átomos de uranio vibran más rápido.
            Esto ensancha el rango de energías a las que el U-238 captura neutrones sin fisionarse
            (resonance absorption). Resultado: <span className="text-cyan-300 font-semibold">menos neutrones disponibles → reactividad baja AUTOMÁTICAMENTE.</span>
          </p>
        </div>

        <Equation>
          {'ρ_doppler = α_doppler × ΔT\n'}
          {'α_doppler = −0.0025 $/K (coeficiente negativo de temperatura)\n'}
          {'ΔT = T_núcleo − T_referencia (Kelvin)'}
        </Equation>

        <div>
          <p className="text-white font-semibold mb-1">Cómo se ve en el simulador:</p>
          <ul className="text-slate-300 space-y-1">
            <li>• Subes las barras → potencia sube → temperatura sube</li>
            <li>• Temperatura alta → Doppler activa → reactividad baja automáticamente</li>
            <li>• El reactor se <span className="text-cyan-300">estabiliza solo</span> sin que hagas nada</li>
            <li>• Indicador "Doppler: Activo" aparece en el panel de sistemas</li>
          </ul>
        </div>

        <div>
          <p className="text-yellow-300 font-semibold mb-1">Analogía simple:</p>
          <p className="text-slate-300">
            Es como un termostato que se ajusta solo. Si se calienta demasiado,
            el propio calor frena la reacción. <span className="text-green-300">Nadie necesita hacer nada.</span>
          </p>
        </div>

        <CaseReal title="✓ Fukushima 2011" outcome="→ El Doppler funcionó correctamente">
          El reactor se apagó en segundos tras el terremoto gracias al feedback negativo de temperatura.
          El problema fue el calor residual, no la falta de Doppler.
        </CaseReal>
        <CaseReal title="✗ Chernobyl 1986" outcome="→ RBMK-1000 tenía coeficiente de temperatura POSITIVO a baja potencia">
          El reactor RBMK tenía un coeficiente de vacío positivo: más temperatura → más vapor → más reacción.
          Sin Doppler efectivo, la explosión fue inevitable una vez iniciada la excursión.
        </CaseReal>
      </Section>

      {/* ── DEMORAS EN CASCADA ── */}
      <Section id="delays" open={open} onToggle={toggle} icon="⏱️" title="Demoras en Cascada — Por qué la física no es instantánea" colorClass="text-yellow-300">
        <div>
          <p className="text-white font-semibold mb-2">La cadena de causa-efecto en un reactor real:</p>
          <div className="space-y-2">
            {[
              ['Barras → Reactividad', '~3 segundos', 'Tiempo para que las barras se posicionen y los neutrones rápidos sean absorbidos'],
              ['Reactividad → Potencia', '5–30 segundos', 'Los neutrones retardados (β=0.65%) tardan segundos en crecer o decaer'],
              ['Potencia → Temperatura', '~10 segundos', 'El calor debe transferirse del combustible al refrigerante'],
              ['Temperatura → Presión', '~15 segundos', 'La presión responde a la temperatura según Gay-Lussac'],
            ].map(([step, time, desc]) => (
              <div key={step} className="flex gap-2 items-start">
                <div className="flex-shrink-0 text-right">
                  <span className="text-yellow-300 font-mono font-bold text-xs">{time}</span>
                </div>
                <div className="w-px bg-slate-600 flex-shrink-0 mx-2 mt-0.5 self-stretch" />
                <div>
                  <span className="text-white font-semibold">{step}:</span>
                  <span className="text-slate-300 ml-1">{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-950/40 border border-blue-500/30 rounded px-3 py-2 mt-1">
          <p className="text-blue-300 font-semibold mb-1">¿Por qué el simulador implementa esto?</p>
          <p className="text-slate-300">
            En un reactor real, un operador que presiona BARRAS+ debe esperar 60 segundos para ver
            el efecto completo. No puede "spam-clickear". Debe monitorear constantemente y actuar con paciencia.
            Los turnos de operación duran 8–12 horas de vigilancia constante.
          </p>
        </div>

        <p className="text-yellow-300">
          En este simulador: al presionar BARRAS+/- aparece un contador con el tiempo restante
          antes de que el efecto sea completo. Aprende a esperar.
        </p>
      </Section>

      {/* ── VÁLVULA DE ALIVIO ── */}
      <Section id="relief" open={open} onToggle={toggle} icon="🔧" title="Válvula de Alivio de Presión — Protección Pasiva" colorClass="text-orange-300">
        <div>
          <p className="text-white font-semibold mb-1">¿Qué es y por qué existe?</p>
          <p className="text-slate-300">
            El circuito primario opera a ~155 bar para evitar que el agua hierva a 300°C.
            Si la presión sube más de lo previsto, una válvula de alivio se abre automáticamente
            para liberar vapor y proteger las tuberías de una falla catastrófica.
          </p>
        </div>

        <div>
          <p className="text-white font-semibold mb-1">Cómo funciona en el simulador:</p>
          <ol className="text-slate-300 space-y-1 list-decimal list-inside">
            <li>Presión supera 155 bar → válvula se abre automáticamente</li>
            <li>Vapor escapa → flujo de refrigerante baja ligeramente</li>
            <li>Presión baja → válvula se cierra cuando alcanza ~145 bar</li>
            <li>Todo esto sin intervención del operador (protección pasiva)</li>
          </ol>
        </div>

        <div className="bg-orange-950/40 border border-orange-500/30 rounded px-3 py-2">
          <p className="text-orange-300 font-semibold mb-1">Característica de seguridad pasiva:</p>
          <p className="text-slate-300">
            "Pasiva" significa que no requiere electricidad, acción humana ni señal electrónica.
            La presión física del vapor abre la válvula mecánicamente.
            Si falla la electricidad, la válvula sigue funcionando.
          </p>
        </div>

        <CaseReal title="✓ Three Mile Island 1979" outcome="→ Válvula funcionó, contuvo la presión">
          La válvula abrió correctamente. El problema fue que los operadores la cerraron manualmente
          creyendo que era un error, causando el daño al núcleo.
        </CaseReal>
        <CaseReal title="✗ Chernobyl 1986" outcome="→ Sin válvulas de alivio adecuadas → EXPLOSIÓN">
          El diseño RBMK no tenía un sistema de contención y válvulas de alivio equivalente
          a los reactores occidentales. La presión destruyó el reactor.
        </CaseReal>
      </Section>

      {/* ── ZONAS TÉRMICAS ── */}
      <Section id="zones" open={open} onToggle={toggle} icon="🔥" title="Zonas Térmicas del Núcleo" colorClass="text-red-300">
        <div>
          <p className="text-white font-semibold mb-1">El núcleo no tiene temperatura uniforme</p>
          <p className="text-slate-300">
            El centro del reactor tiene mayor densidad de combustible y menos refrigeración relativa.
            La periferia está en contacto directo con el moderador/refrigerante.
            Esta distribución crea un gradiente de temperatura típico.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 my-2">
          {[
            { zone: 'Centro',    color: 'bg-red-500',    approx: '~114% T_base', note: 'Máxima potencia' },
            { zone: 'Medio',     color: 'bg-orange-400', approx: '~104% T_base', note: 'Transición' },
            { zone: 'Periferia', color: 'bg-blue-400',   approx: '~93% T_base',  note: 'Más refrigeración' },
          ].map(({ zone, color, approx, note }) => (
            <div key={zone} className="bg-slate-800/50 rounded p-2 text-center">
              <div className={`w-full h-1 ${color} rounded mb-1.5`} />
              <p className="text-white font-semibold text-xs">{zone}</p>
              <p className="text-slate-400 text-xs">{approx}</p>
              <p className="text-slate-500 text-xs">{note}</p>
            </div>
          ))}
        </div>

        <p className="text-slate-300">
          Si el flujo de refrigerante se reduce (bomba off, LOCA), el centro se calienta mucho
          más rápido que la periferia. El <span className="text-red-300">desequilibrio mayor de 80K</span> indica
          riesgo de daño local al combustible.
        </p>
      </Section>

      {/* ── EVENTOS ALEATORIOS ── */}
      <Section id="events" open={open} onToggle={toggle} icon="⚠️" title="Eventos Aleatorios — Realismo Operacional" colorClass="text-yellow-200">
        <div>
          <p className="text-white font-semibold mb-1">¿Por qué el simulador genera eventos aleatorios?</p>
          <p className="text-slate-300">
            En una central nuclear real, los operadores reciben alertas e incidentes menores
            constantemente durante sus turnos de 12 horas. La mayoría son banales,
            pero deben ser evaluados. Ignorar una alerta puede ser fatal.
          </p>
        </div>

        <div className="space-y-2">
          {[
            ['Vibración en bomba', 'Puede indicar desgaste de cojinetes o cavitación. Ignorar = falla eventual de bomba.'],
            ['Pico de presión', 'Fluctuación transitoria. Monitorear 30s. Si persiste, actuar.'],
            ['Radiactividad detectable', 'Indica desgaste de filtros del circuito primario. No crítico, pero informativo.'],
            ['Temperatura de salida elevada', 'Normal tras subida de potencia. Espera 60s antes de actuar.'],
          ].map(([event, action]) => (
            <div key={event} className="bg-slate-800/40 rounded px-2.5 py-1.5">
              <p className="text-yellow-300 font-semibold">{event}</p>
              <p className="text-slate-300">{action}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-800/50 rounded px-3 py-2 mt-1">
          <p className="text-yellow-200 font-semibold mb-1">Lección de Fukushima:</p>
          <p className="text-slate-300">
            Los operadores de la Planta Daini (vecina a Daichi) respondieron correctamente
            a cada alerta y lograron un apagado seguro a pesar del tsunami.
            Los de Daichi se enfrentaron a un fallo total de energía sin precedentes.
            La diferencia: preparación, procedimientos y no ignorar alertas tempranas.
          </p>
        </div>
      </Section>

      {/* ── POR QUÉ CADA PARÁMETRO IMPORTA ── */}
      <Section id="params" open={open} onToggle={toggle} icon="📊" title="¿Por qué cada parámetro importa?" colorClass="text-yellow-300">
        {[
          ['⚡ Potencia', 'Más potencia = más electricidad generada, pero más calor que disipar. Si excede el límite de diseño el combustible puede fundirse (meltdown).'],
          ['🌡️ Temperatura', 'El zircaloy que recubre las varillas de combustible falla sobre ~1200°C. Si se rompe, el UO₂ queda expuesto y se libera radiactividad al circuito primario.'],
          ['⊕ Presión', 'El agua está a ~155 bar para no hervir a 300°C. Si la presión excede los límites estructurales, las tuberías del circuito primario pueden fallar catastróficamente.'],
          ['💧 Flujo Refrigerante', 'Sin circulación, el calor de decaimiento (decay heat) que genera el núcleo — incluso apagado — puede fundir el combustible en pocas horas (Fukushima).'],
        ].map(([param, why]) => (
          <div key={param}>
            <span className="text-yellow-300 font-semibold">{param}: </span>
            <span className="text-slate-300">{why}</span>
          </div>
        ))}
      </Section>

      {/* ── SEGURIDAD INHERENTE ── */}
      <Section id="inherent" open={open} onToggle={toggle} icon="🛡️" title="Seguridad Inherente — El Reactor se Protege Solo" colorClass="text-green-300">
        <div>
          <p className="text-white font-semibold mb-2">¿Qué es la seguridad inherente?</p>
          <p className="text-slate-300">
            Un reactor con seguridad inherente se apaga solo si algo sale mal,
            sin necesitar electricidad, acción humana ni sistemas activos.
            Las leyes de la física hacen el trabajo.
          </p>
        </div>

        <div className="space-y-2">
          {[
            ['Feedback Doppler negativo', 'T↑ → absorción de neutrones ↑ → ρ↓ → potencia↓'],
            ['Válvula de alivio pasiva', 'P↑ → válvula abre mecánicamente → presión baja → cierra'],
            ['Barras de control por gravedad', 'En algunos diseños, las barras caen por gravedad al cortar electricidad'],
            ['Geometría subcrítica', 'Si el refrigerante se pierde, la geometría cambia y el reactor se apaga'],
          ].map(([mechanism, effect]) => (
            <div key={mechanism} className="flex gap-2">
              <span className="text-green-400 flex-shrink-0">✓</span>
              <div>
                <span className="text-white font-semibold">{mechanism}: </span>
                <span className="text-slate-300 font-mono text-xs">{effect}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-green-950/40 border border-green-600/30 rounded px-3 py-2 mt-1">
          <p className="text-green-300 font-semibold mb-1">Resultado en este simulador:</p>
          <p className="text-slate-300">
            Si presionas BARRAS- y dejas subir la potencia, verás que el reactor
            <span className="text-green-300"> se estabiliza solo</span> gracias al Doppler.
            No necesitas hacer nada. La física lo controla.
            Eso es seguridad inherente en acción.
          </p>
        </div>
      </Section>
    </div>
  );
}
