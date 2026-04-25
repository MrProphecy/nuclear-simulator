import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const BUBBLE_STYLES = {
  info:     { bg: 'bg-blue-950/95',  border: 'border-blue-500/70',   text: 'text-blue-200',   icon: Info,          iconColor: 'text-blue-400',   label: 'INFO'      },
  warning:  { bg: 'bg-yellow-950/95',border: 'border-yellow-500/70', text: 'text-yellow-100', icon: AlertTriangle, iconColor: 'text-yellow-400',  label: 'ATENCIÓN'  },
  critical: { bg: 'bg-red-950/95',   border: 'border-red-500/80',    text: 'text-red-100',    icon: AlertTriangle, iconColor: 'text-red-400',     label: 'CRÍTICO'   },
  success:  { bg: 'bg-green-950/95', border: 'border-green-500/70',  text: 'text-green-100',  icon: CheckCircle,   iconColor: 'text-green-400',   label: 'CORRECTO'  },
};

const AUTO_DISMISS_MS = { info: 9000, warning: 0, critical: 0, success: 7000 };

let _bubbleCounter = 0;

function makeBubble(type, conditionKey, message, detail) {
  return { id: `fb_${_bubbleCounter++}`, type, conditionKey, message, detail, createdAt: Date.now() };
}

export function TutorialFeedback({ temperature, pressure, coolantFlow, power, isRunning, dopplerActive }) {
  const [bubbles, setBubbles] = useState([]);
  const activeConditionsRef = useRef(new Set()); // conditionKeys currently active

  const add = (type, conditionKey, message, detail) => {
    if (activeConditionsRef.current.has(conditionKey)) return;
    activeConditionsRef.current.add(conditionKey);
    setBubbles(prev => {
      // Cap at 4 bubbles — drop oldest info/success first
      let next = [...prev];
      if (next.length >= 4) {
        const dropIdx = next.findIndex(b => b.type === 'info' || b.type === 'success');
        if (dropIdx !== -1) next.splice(dropIdx, 1);
        else next.shift();
      }
      return [...next, makeBubble(type, conditionKey, message, detail)];
    });
  };

  const clear = (conditionKey) => {
    if (!activeConditionsRef.current.has(conditionKey)) return;
    activeConditionsRef.current.delete(conditionKey);
    setBubbles(prev => prev.filter(b => b.conditionKey !== conditionKey));
  };

  const dismiss = (id, conditionKey) => {
    activeConditionsRef.current.delete(conditionKey);
    setBubbles(prev => prev.filter(b => b.id !== id));
  };

  // Auto-dismiss info/success bubbles
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setBubbles(prev => prev.filter(b => {
        const ttl = AUTO_DISMISS_MS[b.type];
        if (ttl > 0 && (now - b.createdAt) > ttl) {
          activeConditionsRef.current.delete(b.conditionKey);
          return false;
        }
        return true;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Generate contextual bubbles based on reactor state
  useEffect(() => {
    if (!isRunning) return;

    // ── Temperature feedback ────────────────────────────────────────
    if (temperature > 585) {
      clear('temp_warning');
      add('critical', 'temp_critical',
        '🔴 ¡TEMPERATURA CRÍTICA!',
        `${temperature.toFixed(0)} K — SCRAM automático en segundos. Presiona BARRAS+ o SCRAM ahora.`
      );
    } else if (temperature > 520) {
      clear('temp_critical');
      add('warning', 'temp_warning',
        '⚠️ Temperatura elevada — actúa pronto',
        `${temperature.toFixed(0)} K y subiendo. Inserta barras de control. Límite de SCRAM: 600 K.`
      );
    } else {
      clear('temp_critical');
      clear('temp_warning');
    }

    // ── Pressure feedback ───────────────────────────────────────────
    if (pressure > 157) {
      add('warning', 'pressure_high',
        '⚠️ Presión fuera de rango',
        `${pressure.toFixed(1)} bar — válvula de alivio debería abrir. Reduce potencia.`
      );
    } else {
      clear('pressure_high');
    }

    // ── Coolant flow feedback ───────────────────────────────────────
    if (coolantFlow < 30) {
      clear('flow_warning');
      add('critical', 'flow_critical',
        '🔴 FLUJO CRÍTICO — sin refrigeración',
        `${coolantFlow.toFixed(0)}% — enciende la bomba o activa SCRAM inmediatamente.`
      );
    } else if (coolantFlow < 55) {
      clear('flow_critical');
      add('warning', 'flow_warning',
        '⚠️ Flujo de refrigerante bajo',
        `${coolantFlow.toFixed(0)}% — verifica que la bomba esté ON. El límite crítico es 30%.`
      );
    } else {
      clear('flow_warning');
      clear('flow_critical');
    }

    // ── Power feedback ──────────────────────────────────────────────
    if (power > 1800) {
      add('warning', 'power_very_high',
        '⚠️ Potencia muy alta',
        `${power.toFixed(0)} MW — inserta barras ya. La temperatura seguirá subiendo.`
      );
    } else {
      clear('power_very_high');
    }

    // ── Doppler info ────────────────────────────────────────────────
    if (dopplerActive && temperature > 370) {
      add('info', 'doppler_active',
        'ℹ️ Retroalimentación Doppler activa',
        'T↑ → uranio se expande → absorbe más neutrones → reactividad baja. El reactor se está autoregulando.'
      );
    } else {
      clear('doppler_active');
    }

    // ── Stable operation success ────────────────────────────────────
    if (
      temperature < 450 &&
      pressure < 150 &&
      coolantFlow > 85 &&
      power > 400 &&
      power < 1000
    ) {
      add('success', 'stable_operation',
        '✓ Operación estable',
        `${power.toFixed(0)} MW · ${temperature.toFixed(0)} K · ${pressure.toFixed(1)} bar — dentro de todos los rangos seguros.`
      );
    } else {
      clear('stable_operation');
    }

  }, [temperature, pressure, coolantFlow, power, isRunning, dopplerActive]);

  // Clear all when simulation stops
  useEffect(() => {
    if (!isRunning) {
      setBubbles([]);
      activeConditionsRef.current.clear();
    }
  }, [isRunning]);

  if (bubbles.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2 w-80 pointer-events-none">
      {bubbles.map(bubble => {
        const style = BUBBLE_STYLES[bubble.type] ?? BUBBLE_STYLES.info;
        const Icon = style.icon;
        return (
          <div
            key={bubble.id}
            className={`${style.bg} border ${style.border} rounded-xl shadow-2xl p-3.5 pointer-events-auto
              animate-in slide-in-from-right-4 duration-300`}
          >
            <div className="flex items-start gap-2.5">
              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.iconColor}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-xs font-bold ${style.iconColor} uppercase tracking-wider`}>
                    {style.label}
                  </span>
                  <button
                    onClick={() => dismiss(bubble.id, bubble.conditionKey)}
                    className="text-slate-500 hover:text-slate-300 transition flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className={`text-sm font-semibold leading-tight mb-1 ${style.text}`}>
                  {bubble.message}
                </p>
                <p className="text-xs text-slate-400 leading-snug">
                  {bubble.detail}
                </p>
              </div>
            </div>
            {/* Progress bar for auto-dismissing bubbles */}
            {AUTO_DISMISS_MS[bubble.type] > 0 && (
              <div className="mt-2 h-0.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-0.5 rounded-full ${style.iconColor.replace('text-', 'bg-')}`}
                  style={{
                    animation: `shrink ${AUTO_DISMISS_MS[bubble.type]}ms linear forwards`,
                    width: '100%',
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
