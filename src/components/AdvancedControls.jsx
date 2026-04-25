import React from 'react';
import { Tooltip } from './Tooltip';

function DisplayOnlyBar({ label, value, unit, max, color = 'bg-blue-500', note }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="rounded-lg px-3 py-3 border bg-slate-800/50 border-slate-600/30">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">{label}</span>
        <span className="text-sm font-bold text-slate-300 tabular-nums">
          {typeof value === 'number' ? value.toFixed(0) : value}
          <span className="text-xs font-normal text-slate-500 ml-1">{unit}</span>
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
        <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      {note && <p className="text-xs text-slate-500 mt-1.5">{note}</p>}
    </div>
  );
}

function AdvancedSlider({ label, value, min, max, step = 1, unit, onChange, disabled, leftLabel, rightLabel, tooltipText, accentColor = 'text-blue-400', infoLines = [], warningLine }) {
  return (
    <div className="rounded-xl p-4 border border-slate-600/40 bg-slate-800/50">
      <div className="flex items-center justify-between mb-2">
        <Tooltip text={tooltipText}>
          <span className="text-sm font-bold text-white cursor-help">{label}</span>
        </Tooltip>
        <span className={`text-sm font-bold tabular-nums ${accentColor}`}>
          {value.toFixed(0)}<span className="text-xs font-normal text-slate-500 ml-0.5">{unit}</span>
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="control-rods-slider w-full"
      />

      <div className="flex justify-between text-xs mt-1 text-slate-500">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>

      {infoLines.length > 0 && (
        <div className="mt-2 space-y-0.5 border-t border-slate-700/50 pt-2">
          {infoLines.map((line, i) => (
            <p key={i} className="text-xs text-slate-400">{line}</p>
          ))}
        </div>
      )}

      {warningLine && (
        <p className="text-xs text-yellow-400 mt-1.5 font-semibold">⚠️ {warningLine}</p>
      )}
    </div>
  );
}

function BackupPumpControl({ active, onToggle, disabled, coolantFlow }) {
  return (
    <div className="rounded-xl p-4 border border-slate-600/40 bg-slate-800/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-white">BOMBA DE RESPALDO</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
          active ? 'bg-green-700 text-green-200' : 'bg-slate-700 text-slate-400'
        }`}>
          {active ? 'ON' : 'OFF'}
        </span>
      </div>

      <button
        onClick={onToggle}
        disabled={disabled}
        className={`w-full font-bold py-2.5 px-4 rounded-lg transition text-sm ${
          active
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {active ? '● DESACTIVAR RESPALDO' : '○ ACTIVAR RESPALDO'}
      </button>

      <div className="mt-2 space-y-0.5 border-t border-slate-700/50 pt-2">
        <p className="text-xs text-slate-400">• Flujo adicional: <span className="text-green-400 font-semibold">+20%</span>  cuando ON</p>
        <p className="text-xs text-slate-400">• Presión: <span className="text-blue-400">+5 bar</span>  cuando ON</p>
        <p className="text-xs text-slate-500">Activar cuando flujo primario &lt; 50%</p>
        {coolantFlow < 50 && (
          <p className="text-xs text-yellow-400 font-semibold mt-1">⚠️ Flujo bajo — considera activar respaldo</p>
        )}
      </div>
    </div>
  );
}

export function AdvancedControls({ sim, state, tutorialMode, isRunning, onStateChange, onControlChange }) {
  if (tutorialMode) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mt-4">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-lg font-bold text-white">SISTEMAS DE SOPORTE</h3>
          <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded font-bold border border-blue-700/50">
            Solo visualización — Tutorial
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          En Modo Tutorial solo puedes observar estos sistemas. Actívalos en <strong className="text-white">Modo Libre</strong> para controlarlos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DisplayOnlyBar
            label="Bomba Primaria"
            value={state.primaryPumpSpeed ?? 100}
            unit="%"
            max={100}
            color="bg-blue-500"
            note="Velocidad de la bomba principal de refrigeración"
          />
          <DisplayOnlyBar
            label="Válvula de Alivio (Manual)"
            value={state.reliefValveManual ?? 0}
            unit="% abierta"
            max={100}
            color="bg-orange-500"
            note={
              (state.reliefValveManual ?? 0) > 0
                ? '⚠️ Válvula abierta manualmente'
                : `Cerrada — se abre automáticamente a ${(state.pressure ?? 155).toFixed(1)} bar > 155 bar`
            }
          />
          <DisplayOnlyBar
            label="Enfriamiento Auxiliar"
            value={state.auxiliaryCooling ?? 0}
            unit="%"
            max={100}
            color="bg-cyan-500"
            note="Sistema de enfriamiento de emergencia (agua externa)"
          />
          <div className="rounded-lg px-3 py-3 border bg-slate-800/50 border-slate-600/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Bomba de Respaldo</span>
              <span className={`text-sm font-bold ${(state.backupPumpActive ?? false) ? 'text-green-400' : 'text-slate-500'}`}>
                {(state.backupPumpActive ?? false) ? '● ON' : '○ OFF'}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all duration-500 ${(state.backupPumpActive ?? false) ? 'bg-green-500 w-full' : 'bg-slate-600 w-0'}`} />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">Flujo secundario adicional (+20% cuando ON)</p>
          </div>
        </div>
      </div>
    );
  }

  // ── MODO LIBRE — controles interactivos ─────────────────────────
  const handlePumpSpeed = (val) => {
    sim.setPrimaryPumpSpeed(val);
    onStateChange();
    onControlChange?.({ control: 'BOMBA_VELOCIDAD', value: val });
  };

  const handleReliefValve = (val) => {
    sim.setReliefValveManual(val);
    onStateChange();
    onControlChange?.({ control: 'VALVULA_ALIVIO', value: val });
  };

  const handleAuxCooling = (val) => {
    sim.setAuxiliaryCooling(val);
    onStateChange();
    onControlChange?.({ control: 'ENFRIAMIENTO_AUX', value: val });
  };

  const handleBackupPump = () => {
    sim.toggleBackupPump();
    onStateChange();
    onControlChange?.({ control: 'BOMBA_RESPALDO', value: !(state.backupPumpActive ?? false) });
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mt-4">
      <div className="flex items-center gap-3 mb-5">
        <h3 className="text-lg font-bold text-white">CONTROLES AVANZADOS</h3>
        <span className="text-xs bg-orange-900 text-orange-300 px-2 py-0.5 rounded font-bold border border-orange-700/50">
          Modo Libre
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ─ Sistema Primario ─ */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sistema Primario</h4>
          <AdvancedSlider
            label="Bomba Primaria — Velocidad"
            value={state.primaryPumpSpeed ?? 100}
            min={50}
            max={100}
            unit="%"
            onChange={handlePumpSpeed}
            disabled={!isRunning || !(state.pumpRunning ?? true)}
            leftLabel="50% — Lenta"
            rightLabel="100% — Máxima"
            tooltipText={`Velocidad de la bomba primaria. Controla el flujo de refrigerante.
DERECHA ──► = Más velocidad = Más flujo = Baja temperatura
◄── IZQUIERDA = Menos velocidad = Menos flujo = Sube temperatura`}
            accentColor="text-blue-400"
            infoLines={[
              `Flujo refrigerante actual: ${(state.coolantFlow ?? 100).toFixed(0)}%`,
              '100% = máximo flujo · 50% = flujo reducido 50%',
            ]}
            warningLine="Disminuir aumenta temperatura del núcleo"
          />
        </div>

        {/* ─ Válvula de Alivio ─ */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Válvula de Alivio</h4>
          <AdvancedSlider
            label="Válvula de Alivio Manual"
            value={state.reliefValveManual ?? 0}
            min={0}
            max={100}
            unit="% abierta"
            onChange={handleReliefValve}
            disabled={!isRunning}
            leftLabel="0% — Cerrada"
            rightLabel="100% — Abierta"
            tooltipText={`Válvula de alivio de presión manual.
DERECHA ──► = Abre = Baja presión = Libera vapor
◄── IZQUIERDA = Cierra = Sube presión
Se abre automáticamente a 155 bar — válvula manual lo acelera.`}
            accentColor="text-orange-400"
            infoLines={[
              `Presión actual: ${(state.pressure ?? 155).toFixed(1)} bar  (límite automático: 155 bar)`,
              (state.reliefValveOpen ?? false)
                ? '⚠️ Válvula automática también ABIERTA'
                : 'Válvula automática: cerrada',
            ]}
            warningLine="Usar solo en emergencia — libera vapor radiactivo"
          />
        </div>

        {/* ─ Enfriamiento Auxiliar ─ */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enfriamiento de Emergencia</h4>
          <AdvancedSlider
            label="Enfriamiento Auxiliar"
            value={state.auxiliaryCooling ?? 0}
            min={0}
            max={100}
            unit="%"
            onChange={handleAuxCooling}
            disabled={!isRunning}
            leftLabel="0% — Apagado"
            rightLabel="100% — Máximo"
            tooltipText={`Sistema de enfriamiento auxiliar de emergencia (agua exterior).
DERECHA ──► = Más enfriamiento = Baja temperatura
Cada 1% ≈ -0.3K/s temperatura nuclear
50% ≈ -100K en ~60 segundos (condiciones de emergencia)`}
            accentColor="text-cyan-400"
            infoLines={[
              `Temperatura actual: ${(state.temperature ?? 300).toFixed(0)} K`,
              '50% ≈ -100 K en ~60s · 100% = enfriamiento de emergencia total',
            ]}
            warningLine="Usar SOLO en emergencia cuando T > 500 K"
          />
        </div>

        {/* ─ Bomba de Respaldo ─ */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sistema de Respaldo</h4>
          <BackupPumpControl
            active={state.backupPumpActive ?? false}
            onToggle={handleBackupPump}
            disabled={!isRunning}
            coolantFlow={state.coolantFlow ?? 100}
          />
        </div>
      </div>

      {/* ─ Guía de dirección (libre mode) ─ */}
      <div className="mt-4 bg-slate-900/60 border border-slate-700/40 rounded-lg p-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Referencia Rápida — Dirección de Controles</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
          <p className="text-slate-300"><span className="text-cyan-400 font-mono">BARRAS ◄──</span> Sacar = sube potencia</p>
          <p className="text-slate-300"><span className="text-cyan-400 font-mono">BARRAS ──►</span> Meter = baja potencia</p>
          <p className="text-slate-300"><span className="text-blue-400 font-mono">BOMBA ──►</span> Más velocidad = más flujo</p>
          <p className="text-slate-300"><span className="text-orange-400 font-mono">VÁLVULA ──►</span> Abre = baja presión</p>
          <p className="text-slate-300"><span className="text-cyan-400 font-mono">ENFR. AUX ──►</span> Más = baja temperatura</p>
          <p className="text-slate-300"><span className="text-green-400 font-mono">RESPALDO ON</span> Flujo +20%</p>
        </div>
      </div>
    </div>
  );
}
