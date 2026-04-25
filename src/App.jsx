import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Radio, Award, BookOpen, GraduationCap, ClipboardList, Clock } from 'lucide-react';
import { ReactorSimulator } from './utils/ReactorSimulator';
import { ScoringSystem, DifficultyManager } from './utils/ScoringSystem';
import { ControlPanel } from './components/ControlPanel';
import { ReactorCoreVisualization, AchievementBadge, ScoreBoard } from './components/Gauges';
import { StabilityChart } from './components/Charts';
import { WelcomeModal } from './components/WelcomeModal';
import { ScramModal } from './components/ScramModal';
import { InstrumentsPanel } from './components/InstrumentsPanel';
import { TutorialGuide } from './components/TutorialGuide';
import { EducationPanel } from './components/EducationPanel';
import { Tooltip } from './components/Tooltip';
import { ErrorFeedback } from './components/ErrorFeedback';
import { TutorialFeedback } from './components/TutorialFeedback';
import { ErrorDetector } from './utils/ErrorDetector';
import { RiskPanel } from './components/RiskPanel';
import { RiskTooltips } from './components/RiskTooltips';
import { EventAnalysis } from './components/EventAnalysis';
import { CascadeTimeline } from './components/CascadeTimeline';
import { PostEventAnalysis } from './components/PostEventAnalysis';
import { PostScramRecovery } from './components/PostScramRecovery';
import { AdvancedControls } from './components/AdvancedControls';
import { ContextualHints } from './components/ContextualHints';
import { isInvestigationComplete } from './utils/ScramInvestigationLogic';
import { AnalogGauge } from './components/AnalogGauge';
import { AdvancedPowerTempChart, AdvancedPressureFlowChart } from './components/AdvancedCharts';
import { ProfessionalAlertPanel } from './components/ProfessionalAlertPanel';
import ChangelogViewer from './components/ChangelogViewer';

// ── INDICADOR DE PACIENCIA ────────────────────────────────────────────────────
function PatienceIndicator({ isStabilizing, stabilizationProgress, lastActionName, pendingChanges }) {
  if (!isStabilizing && pendingChanges.length === 0) return null;

  const actionLabels = {
    'BARRAS+': 'Inserción de barras',
    'BARRAS-': 'Retirada de barras',
    'POTENCIA+': 'Aumento de potencia',
    'SLIDER': 'Ajuste de barras',
    'BOMBA_ON': 'Arranque de bomba',
  };
  const label = actionLabels[lastActionName] || lastActionName || 'Acción reciente';

  return (
    <div className="bg-gradient-to-r from-blue-950/70 to-slate-900/80 border border-blue-500/40 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-blue-400 animate-pulse" />
        <h3 className="text-blue-300 font-bold text-sm uppercase tracking-wider">
          Monitoreo en Progreso — {label}
        </h3>
      </div>

      {/* Cambios pendientes en cola */}
      {pendingChanges.length > 0 && (
        <div className="mb-3 space-y-1.5">
          {pendingChanges.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-yellow-300 bg-yellow-950/40 border border-yellow-600/30 rounded px-2.5 py-1.5">
              <span className="text-yellow-400 font-mono font-bold">⏱️ {c.remainingSeconds}s</span>
              <span>{c.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Barra de progreso de estabilización */}
      {isStabilizing && (
        <>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Estabilización del sistema</span>
            <span className="font-mono">{stabilizationProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden mb-3">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${stabilizationProgress}%` }}
            />
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-300 bg-slate-800/50 rounded-lg p-3">
        <p className="col-span-2 text-blue-300 font-semibold mb-1">¿Por qué esperar?</p>
        <p>✓ En una central REAL, los cambios son lentos</p>
        <p>✓ Los neutrones tardan en multiplicarse</p>
        <p>✓ El agua tarda en calentarse</p>
        <p>✓ Los turnos nucleares duran 12–24 horas</p>
        <p className="col-span-2 text-yellow-300 mt-1">Paciencia y atención constante = Seguridad nuclear.</p>
      </div>
    </div>
  );
}

// ── PANEL DE ZONAS TÉRMICAS ───────────────────────────────────────────────────
function ThermalZonesPanel({ thermalZones, temperature }) {
  const zones = [
    { key: 'center', label: 'Centro',    color: 'bg-red-500',    textColor: 'text-red-300' },
    { key: 'middle', label: 'Medio',     color: 'bg-orange-400', textColor: 'text-orange-300' },
    { key: 'outer',  label: 'Periferia', color: 'bg-blue-400',   textColor: 'text-blue-300' },
  ];

  const centerTemp = thermalZones?.center?.temp ?? temperature * 1.14;
  const middleTemp = thermalZones?.middle?.temp ?? temperature * 1.04;
  const outerTemp  = thermalZones?.outer?.temp  ?? temperature * 0.93;
  const temps = { center: centerTemp, middle: middleTemp, outer: outerTemp };
  const maxTemp = Math.max(centerTemp, 310);

  const imbalance = centerTemp - outerTemp;
  const isImbalanced = imbalance > 80;

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <h3 className="text-lg font-bold text-white mb-1">ZONAS TÉRMICAS</h3>
      <p className="text-xs text-slate-500 mb-3">Distribución de temperatura en el núcleo</p>
      <div className="space-y-2.5">
        {zones.map(({ key, label, color, textColor }) => {
          const t = temps[key];
          const pct = Math.min(100, ((t - 280) / (maxTemp - 280)) * 100);
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className={`font-semibold ${textColor}`}>{label}</span>
                <span className="font-mono text-white">{t.toFixed(0)} K</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      {isImbalanced && (
        <div className="mt-3 p-2.5 bg-orange-950/60 border border-orange-500/40 rounded text-xs text-orange-200">
          <p className="font-bold mb-1">⚠️ DESEQUILIBRIO DETECTADO</p>
          <p>Centro sobrecalentado +{imbalance.toFixed(0)}K sobre periferia.</p>
          <p className="text-orange-400 mt-1">Monitorea redistribución de flujo.</p>
        </div>
      )}
    </div>
  );
}

// ── PANEL HISTÓRICO DE OPERACIONES ───────────────────────────────────────────
function HistoryPanel({ operationLog, onClose }) {
  const actionColors = {
    'STARTUP': 'text-slate-400',
    'BARRAS+': 'text-cyan-400',
    'BARRAS-': 'text-cyan-300',
    'POTENCIA+': 'text-orange-400',
    'BOMBA_ON': 'text-green-400',
    'BOMBA_OFF': 'text-red-400',
    'SCRAM_MANUAL': 'text-red-500 font-bold',
    'SCRAM_AUTO_TEMP': 'text-red-500 font-bold',
    'SCRAM_AUTO_PRESS': 'text-red-500 font-bold',
    'SCRAM_AUTO_FLOW': 'text-red-500 font-bold',
    'RECUPERAR_SCRAM': 'text-yellow-400',
    'FALLO_BOMBA': 'text-red-400',
    'FALLO_LOCA': 'text-red-400',
    'DESHABILITAR_SEGURIDAD': 'text-red-600 font-bold',
    'SLIDER': 'text-cyan-300',
  };

  const log = [...(operationLog ?? [])].reverse();

  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-600/50 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-slate-400" />
          HISTORIAL DE OPERACIONES
        </h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 transition"
        >
          Cerrar
        </button>
      </div>

      {log.length === 0 ? (
        <p className="text-slate-500 text-sm">Sin operaciones registradas aún.</p>
      ) : (
        <div className="bg-slate-950 rounded-lg overflow-hidden border border-slate-700/40">
          <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-bold text-slate-400 border-b border-slate-700/40 uppercase tracking-wide">
            <span className="col-span-2">Hora</span>
            <span className="col-span-2">T. Sim</span>
            <span className="col-span-3">Acción</span>
            <span className="col-span-5">Razón</span>
          </div>
          <div className="max-h-64 overflow-y-auto font-mono text-xs">
            {log.map((entry, i) => (
              <div
                key={i}
                className="grid grid-cols-12 gap-2 px-3 py-1.5 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
              >
                <span className="col-span-2 text-slate-500">{entry.timestamp}</span>
                <span className="col-span-2 text-slate-500">{entry.simTime}s</span>
                <span className={`col-span-3 ${actionColors[entry.action] ?? 'text-slate-300'}`}>
                  {entry.action}
                </span>
                <span className="col-span-5 text-slate-300">{entry.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── PANEL DE ALERTA ALEATORIA ─────────────────────────────────────────────────
function RandomEventAlert({ alert, onDismiss }) {
  if (!alert) return null;
  return (
    <div className="bg-yellow-950/80 border border-yellow-500/60 rounded-xl p-4 mb-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-bold text-yellow-200 text-sm mb-1">{alert.msg}</p>
        <p className="text-xs text-yellow-300/80">{alert.detail}</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-yellow-500 hover:text-yellow-300 text-xs px-2 py-1 rounded bg-yellow-900/40 hover:bg-yellow-900/70 transition flex-shrink-0"
      >
        OK
      </button>
    </div>
  );
}

// ── ANÁLISIS POST-SCRAM ───────────────────────────────────────────────────────
const SCRAM_LESSONS = {
  SCRAM_AUTO_TEMP:   'Gestión de temperatura: inserta barras cuando T supere 500 K, no esperes al límite.',
  SCRAM_AUTO_PRESS:  'Control de presión: la presión sigue a la temperatura — controlando T controlas P.',
  SCRAM_AUTO_FLOW:   'Refrigeración primaria: flujo < 50% es zona de alerta, < 30% es SCRAM inevitable.',
  SCRAM_MANUAL:      'Buen instinto: activaste el SCRAM manualmente antes de que la situación se saliera de control.',
  DEFAULT:           'Paciencia y atención constante — un ajuste cada vez, espera la estabilización antes del siguiente.',
};

function IncidentAnalysis({ events, operationLog, scramReason }) {
  const timeline = React.useMemo(() => {
    const entries = [];

    (events ?? []).forEach(e => {
      entries.push({
        simTime: parseFloat(e.time) || 0,
        wallTime: e.timestamp,
        kind: 'event',
        text: e.message,
        level: e.level,
      });
    });

    (operationLog ?? []).forEach(op => {
      entries.push({
        simTime: parseFloat(op.simTime) || 0,
        wallTime: op.timestamp,
        kind: 'op',
        text: `${op.action} — ${op.reason}`,
        level: ['SCRAM_AUTO_TEMP','SCRAM_AUTO_PRESS','SCRAM_AUTO_FLOW','SCRAM_MANUAL','DESHABILITAR_SEGURIDAD','FALLO_BOMBA','FALLO_LOCA'].includes(op.action) ? 'critical' : 'info',
      });
    });

    entries.sort((a, b) => a.simTime - b.simTime);
    return entries.slice(-14); // show last 14 entries
  }, [events, operationLog]);

  const criticalCount = timeline.filter(e => e.level === 'critical').length;
  const duration = timeline.length > 1
    ? (timeline[timeline.length - 1].simTime - timeline[0].simTime).toFixed(0)
    : '0';

  // Pick lesson based on operation log
  const lastScramOp = (operationLog ?? []).slice().reverse().find(op =>
    Object.keys(SCRAM_LESSONS).includes(op.action)
  );
  const lesson = SCRAM_LESSONS[lastScramOp?.action ?? 'DEFAULT'] ?? SCRAM_LESSONS.DEFAULT;

  const rowColor = { critical: 'text-red-400', warning: 'text-yellow-400', info: 'text-slate-400' };
  const rowIcon  = { critical: '🔴', warning: '⚠️', info: '✓' };

  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-red-950/20 border border-red-700/40 rounded-xl p-5 mb-6">
      <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
        📊 ANÁLISIS DEL INCIDENTE
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Línea de tiempo</p>
          <div className="bg-slate-950/70 rounded-lg border border-slate-700/40 overflow-hidden">
            <div className="max-h-56 overflow-y-auto font-mono text-xs">
              {timeline.map((entry, i) => (
                <div key={i} className={`flex items-start gap-2 px-3 py-1.5 border-b border-slate-800/50 ${rowColor[entry.level] ?? 'text-slate-400'}`}>
                  <span className="flex-shrink-0 w-12 tabular-nums text-slate-600">{entry.simTime.toFixed(1)}s</span>
                  <span className="flex-shrink-0">{rowIcon[entry.level] ?? '·'}</span>
                  <span className="text-slate-400 text-xs flex-shrink-0 w-16 hidden sm:block">{entry.wallTime}</span>
                  <span className="truncate">{entry.text}</span>
                </div>
              ))}
              {timeline.length === 0 && (
                <p className="px-3 py-3 text-slate-600 text-xs">Sin eventos registrados.</p>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-3">
          <div className="bg-slate-800/60 border border-slate-600/30 rounded-lg p-3 space-y-2">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Resumen</p>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Duración registrada:</span>
              <span className="text-white font-mono font-bold">{duration} s</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Eventos críticos:</span>
              <span className={`font-mono font-bold ${criticalCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {criticalCount}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Causa del SCRAM:</span>
              <span className="text-orange-300 font-bold text-right max-w-28 leading-tight">
                {scramReason ? scramReason.split(' ').slice(0, 4).join(' ') + '...' : '—'}
              </span>
            </div>
          </div>

          <div className="bg-blue-950/40 border border-blue-700/30 rounded-lg p-3">
            <p className="text-blue-400 text-xs font-bold mb-2">Lección principal</p>
            <p className="text-blue-100 text-xs leading-relaxed italic">"{lesson}"</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── APLICACIÓN PRINCIPAL ──────────────────────────────────────────────────────
export default function App() {
  const simulatorRef = useRef(new ReactorSimulator());
  const scoringRef = useRef(new ScoringSystem());
  const difficultyRef = useRef(new DifficultyManager(1));
  const errorDetectorRef = useRef(new ErrorDetector());

  const [state, setState] = useState(simulatorRef.current.getState());
  const [scoring, setScoring] = useState(scoringRef.current.getState());
  const [isRunning, setIsRunning] = useState(false);
  const [errorQueue, setErrorQueue] = useState([]);
  const [history, setHistory] = useState([]);
  const [scenario, setScenario] = useState('normal');
  const [showAchievements, setShowAchievements] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(Date.now());
  const lastScoringUpdateRef = useRef(0);

  const [showWelcomeModal, setShowWelcomeModal] = useState(
    () => localStorage.getItem('tutorialMode') === null
  );
  const [tutorialMode, setTutorialMode] = useState(
    () => localStorage.getItem('tutorialMode') === 'true'
  );
  const [tutorialStep, setTutorialStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const powerInRangeStartRef = useRef(null);

  const [showScramModal, setShowScramModal] = useState(false);
  const [scramReason, setScramReason] = useState('');
  const scramModalShownRef = useRef(false);

  // Post-SCRAM recovery state
  const SCRAM_COOLDOWN_SECONDS = 120; // 2 real minutes = "120 minutes" educational
  const scramWallTimeRef = useRef(null);
  const [postScramCountdown, setPostScramCountdown] = useState(SCRAM_COOLDOWN_SECONDS);
  const [investigationSteps, setInvestigationSteps] = useState({
    step1_cause: false,
    step2_systems: false,
    step3_logs: false,
    step4_approved: false,
  });
  const countdownTimerRef = useRef(null);

  const [showEducation, setShowEducation] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  // Long-term history: sampled every 5 simulation seconds, kept for 2 hours (1440 pts)
  const [longHistory, setLongHistory] = useState([]);
  const lastLongHistoryTimeRef = useRef(-5);

  // Alerta de evento aleatorio — la dismisseamos manualmente
  const [dismissedAlertTime, setDismissedAlertTime] = useState(-999);

  // Tracking última acción para RiskTooltips
  const [lastAction, setLastAction] = useState(null);
  const lastOpCountRef = useRef(0);

  // Hint contextual para controles avanzados
  const [activeHint, setActiveHint] = useState(null);

  // Simulación principal
  useEffect(() => {
    if (!isRunning) return;

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      const sim = simulatorRef.current;
      const scoring = scoringRef.current;

      sim.step(Math.min(deltaTime, 0.1));
      const newState = sim.getState();
      setState(newState);

      // Detectar nueva acción para RiskTooltips
      const opLog = newState.operationLog ?? [];
      if (opLog.length > lastOpCountRef.current) {
        const newest = opLog[opLog.length - 1];
        if (newest && newest.action !== 'STARTUP') {
          setLastAction({ ...newest, simTime: newState.time.toFixed(1) });
        }
        lastOpCountRef.current = opLog.length;
      }

      // Error detection — fires at most once per condition episode
      const detected = errorDetectorRef.current.update(newState, newState.time);
      if (detected) {
        setErrorQueue(prev =>
          prev.some(e => e.type === detected.type) ? prev : [...prev, detected]
        );
      }

      lastScoringUpdateRef.current += deltaTime;
      if (lastScoringUpdateRef.current >= 0.1) {
        scoring.updateScore(newState, lastScoringUpdateRef.current);
        scoring.updateLevel();

        const newAchs = scoring.checkAchievements(newState);
        if (newAchs.length > 0) {
          setNewAchievements(prev => [...prev, ...newAchs]);
          setTimeout(() => setNewAchievements(prev => prev.slice(newAchs.length)), 5000);
        }

        if (newState.emergencyShutdown) {
          scoring.registerScram();
          if (!scramModalShownRef.current) {
            scramModalShownRef.current = true;
            setScramReason(newState.scramReason || 'Condición de seguridad detectada');
            setShowScramModal(true);
          }
        }
        if (!newState.emergencyShutdown) {
          scramModalShownRef.current = false;
        }

        setScoring(scoring.getState());
        lastScoringUpdateRef.current = 0;
      }

      if (newState.time % 0.5 < 0.01) {
        setHistory(prev => [...prev.slice(-240), {
          time: newState.time.toFixed(1),
          power: parseFloat(newState.power.toFixed(2)),
          temperature: parseFloat(newState.temperature.toFixed(1)),
          pressure: parseFloat(newState.pressure.toFixed(1)),
          coolantFlow: parseFloat(newState.coolantFlow.toFixed(1))
        }]);
      }

      // Long-term history sampled every 5 simulation seconds (up to 1440 pts = 2h)
      if (newState.time - lastLongHistoryTimeRef.current >= 5) {
        lastLongHistoryTimeRef.current = newState.time;
        setLongHistory(prev => [...prev.slice(-1440), {
          time: newState.time.toFixed(0),
          power: parseFloat(newState.power.toFixed(1)),
          temperature: parseFloat(newState.temperature.toFixed(1)),
          pressure: parseFloat(newState.pressure.toFixed(1)),
          coolantFlow: parseFloat(newState.coolantFlow.toFixed(1)),
        }]);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isRunning]);

  // Tutorial steps (unchanged from v2.1)
  useEffect(() => {
    if (!tutorialMode || tutorialStep !== 2 || completedSteps.includes(2)) return;
    if (state.pumpRunning) {
      simulatorRef.current.logEvent('✓ Bomba de refrigerante en marcha', 'info');
      setState(simulatorRef.current.getState());
      setCompletedSteps(prev => [...prev, 2]);
      setTutorialStep(3);
    }
  }, [tutorialMode, tutorialStep, state.pumpRunning, completedSteps]);

  useEffect(() => {
    if (!tutorialMode || tutorialStep !== 3 || completedSteps.includes(3)) return;
    if (isRunning) {
      simulatorRef.current.logEvent('✓ Reacción nuclear iniciada', 'info');
      setState(simulatorRef.current.getState());
      setCompletedSteps(prev => [...prev, 3]);
      setTutorialStep(4);
    }
  }, [tutorialMode, tutorialStep, isRunning, completedSteps]);

  useEffect(() => {
    if (!tutorialMode || tutorialStep !== 5 || completedSteps.includes(5)) return;
    if (state.power >= 500 && state.power <= 800) {
      if (!powerInRangeStartRef.current) powerInRangeStartRef.current = Date.now();
      const elapsed = (Date.now() - powerInRangeStartRef.current) / 1000;
      if (elapsed >= 3) {
        simulatorRef.current.logEvent('✓ Potencia estabilizada en rango 500–800 MW', 'info');
        setState(simulatorRef.current.getState());
        setCompletedSteps(prev => [...prev, 5]);
        setTutorialStep(6);
        powerInRangeStartRef.current = null;
      }
    } else {
      powerInRangeStartRef.current = null;
    }
  }, [tutorialMode, tutorialStep, state.power, completedSteps]);

  useEffect(() => {
    if (!tutorialMode || tutorialStep !== 6 || completedSteps.includes(6)) return;
    const timer = setTimeout(() => {
      simulatorRef.current.logEvent('✓ Parámetros monitoreados — Reactor operativo', 'info');
      setState(simulatorRef.current.getState());
      setCompletedSteps(prev => [...prev, 6]);
      setTutorialStep(7);
      const certAchievement = {
        id: 'certified_operator',
        name: '🎓 Operador Certificado',
        desc: 'Completaste el tutorial y encendiste tu primer reactor',
        points: 1000,
      };
      setNewAchievements(prev => [...prev, certAchievement]);
      setTimeout(() => setNewAchievements(prev => prev.filter(a => a.id !== 'certified_operator')), 6000);
    }, 8000);
    return () => clearTimeout(timer);
  }, [tutorialMode, tutorialStep, completedSteps]);

  // Post-SCRAM countdown: start when SCRAM detected, stop when cleared
  useEffect(() => {
    if (state.emergencyShutdown) {
      if (!scramWallTimeRef.current) {
        scramWallTimeRef.current = Date.now();
        setPostScramCountdown(SCRAM_COOLDOWN_SECONDS);
      }
      // Start interval if not already running
      if (!countdownTimerRef.current) {
        countdownTimerRef.current = setInterval(() => {
          const elapsed = (Date.now() - scramWallTimeRef.current) / 1000;
          const remaining = Math.max(0, SCRAM_COOLDOWN_SECONDS - elapsed);
          setPostScramCountdown(remaining);
        }, 500);
      }
    } else {
      // SCRAM cleared: reset everything
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      scramWallTimeRef.current = null;
      setPostScramCountdown(SCRAM_COOLDOWN_SECONDS);
      setInvestigationSteps({ step1_cause: false, step2_systems: false, step3_logs: false, step4_approved: false });
    }
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [state.emergencyShutdown]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sonido de alerta crítica
  const lastAlertSoundRef = useRef(0);
  useEffect(() => {
    if (!isRunning) return;
    const isCritical =
      state.temperature > 550 ||
      state.pressure > 155 ||
      state.coolantFlow < 30 ||
      state.emergencyShutdown;
    const now = Date.now();
    if (isCritical && now - lastAlertSoundRef.current > 4000) {
      lastAlertSoundRef.current = now;
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.value = 440;
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch (_) {}
    }
  }, [state, isRunning]);

  const handleStateChange = () => setState(simulatorRef.current.getState());

  const toggleSimulation = () => {
    lastTimeRef.current = Date.now();
    lastScoringUpdateRef.current = 0;
    setIsRunning(!isRunning);
  };

  const reset = () => {
    setIsRunning(false);
    simulatorRef.current = new ReactorSimulator();
    scoringRef.current = new ScoringSystem();
    difficultyRef.current = new DifficultyManager(1);
    errorDetectorRef.current.reset();
    setState(simulatorRef.current.getState());
    setScoring(scoringRef.current.getState());
    setHistory([]);
    setLongHistory([]);
    lastLongHistoryTimeRef.current = -5;
    setScenario('normal');
    setNewAchievements([]);
    setShowScramModal(false);
    scramModalShownRef.current = false;
    lastTimeRef.current = Date.now();
    lastScoringUpdateRef.current = 0;
    setDismissedAlertTime(-999);
    setErrorQueue([]);
  };

  const handleStartTutorial = () => {
    localStorage.setItem('tutorialMode', 'true');
    setShowWelcomeModal(false);
    setTutorialMode(true);
    setTutorialStep(1);
    setCompletedSteps([]);
    powerInRangeStartRef.current = null;
    setShowScramModal(false);
    scramModalShownRef.current = false;
    simulatorRef.current = new ReactorSimulator();
    scoringRef.current = new ScoringSystem();
    difficultyRef.current = new DifficultyManager(1);
    errorDetectorRef.current.reset();
    setState(simulatorRef.current.getState());
    setScoring(scoringRef.current.getState());
    setHistory([]);
    setLongHistory([]);
    lastLongHistoryTimeRef.current = -5;
    setScenario('normal');
    setNewAchievements([]);
    setIsRunning(false);
    lastTimeRef.current = Date.now();
    lastScoringUpdateRef.current = 0;
    setErrorQueue([]);
  };

  const handleFreeMode = () => {
    localStorage.setItem('tutorialMode', 'false');
    setShowWelcomeModal(false);
    setTutorialMode(false);
  };

  const handleToggleTutorial = () => {
    if (!tutorialMode) {
      localStorage.setItem('tutorialMode', 'true');
      setTutorialMode(true);
      setTutorialStep(1);
      setCompletedSteps([]);
      powerInRangeStartRef.current = null;
    } else {
      localStorage.setItem('tutorialMode', 'false');
      setTutorialMode(false);
    }
  };

  const handleVerifySystems = () => {
    simulatorRef.current.logEvent('✓ Verificación de sistemas completada — Reactor en standby', 'info');
    setState(simulatorRef.current.getState());
    setCompletedSteps(prev => [...prev, 1]);
    setTutorialStep(2);
  };

  const handleSafetyAcknowledge = () => {
    simulatorRef.current.logEvent('✓ Advertencias de seguridad revisadas — listo para operar', 'info');
    setState(simulatorRef.current.getState());
    setCompletedSteps(prev => [...prev, 4]);
    setTutorialStep(5);
  };

  const handleAcknowledgeError = () => setErrorQueue(prev => prev.slice(1));
  const handleSkipError = () => setErrorQueue(prev => prev.slice(1));

  const handleScramClose = () => setShowScramModal(false);
  const handleScramRetry = () => reset();
  const handleScramTutorial = () => handleStartTutorial();
  const handleScramRecover = () => {
    simulatorRef.current.resetFromScram();
    setState(simulatorRef.current.getState());
    setShowScramModal(false);
    scramModalShownRef.current = false;
  };

  const handleCompleteInvestigationStep = (stepId) => {
    setInvestigationSteps(prev => ({ ...prev, [stepId]: true }));
  };

  const handlePostScramRestart = () => {
    // Only allow if all conditions met
    const tempOk = state.temperature < 350;
    const timerDone = postScramCountdown <= 0;
    const invDone = isInvestigationComplete(investigationSteps);
    if (!tempOk || !timerDone || !invDone) return;
    simulatorRef.current.resetFromScram();
    setState(simulatorRef.current.getState());
    setShowScramModal(false);
    scramModalShownRef.current = false;
  };

  const loadScenario = (scenarioName) => {
    setIsRunning(false);
    simulatorRef.current = new ReactorSimulator();
    scoringRef.current = new ScoringSystem();

    if (scenarioName === 'chernobyl') {
      simulatorRef.current.loadChernobylScenario();
      difficultyRef.current = new DifficultyManager(5);
    } else if (scenarioName === 'loca') {
      simulatorRef.current.logEvent('📋 Escenario: PÉRDIDA DE REFRIGERANTE (LOCA)', 'warning');
      simulatorRef.current.power = 100;
      simulatorRef.current.temperature = 300;
      difficultyRef.current = new DifficultyManager(4);
    } else if (scenarioName === 'fukushima') {
      simulatorRef.current.loadFukushimaScenario();
      difficultyRef.current = new DifficultyManager(5);
    } else {
      difficultyRef.current = new DifficultyManager(1);
    }

    errorDetectorRef.current.reset();
    setScenario(scenarioName);
    setState(simulatorRef.current.getState());
    setScoring(scoringRef.current.getState());
    setHistory([]);
    setLongHistory([]);
    lastLongHistoryTimeRef.current = -5;
    setNewAchievements([]);
    setShowScramModal(false);
    scramModalShownRef.current = false;
    lastTimeRef.current = Date.now();
    lastScoringUpdateRef.current = 0;
    setDismissedAlertTime(-999);
    setErrorQueue([]);
  };

  const sim = simulatorRef.current;

  const getAlertLevel = () => {
    if (state.emergencyShutdown) return 'critical';
    if (state.temperature > 550 || state.pressure > 155) return 'warning';
    if (state.failures.coolantLeak || state.failures.pumpFailure) return 'warning';
    return 'safe';
  };

  const alertLevel = getAlertLevel();
  const alertColors = {
    safe: 'bg-green-900 border-green-500',
    warning: 'bg-yellow-900 border-yellow-500',
    critical: 'bg-red-900 border-red-500'
  };

  // Mostrar alerta aleatoria solo si no fue dismisseada
  const showRandomAlert =
    state.pendingAlert &&
    state.pendingAlert.timestamp !== dismissedAlertTime;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
      {showWelcomeModal && (
        <WelcomeModal onStartTutorial={handleStartTutorial} onFreeMode={handleFreeMode} />
      )}

      {showScramModal && (
        <ScramModal
          scramReason={scramReason}
          temperature={state.temperature}
          pressure={state.pressure}
          coolantFlow={state.coolantFlow}
          onClose={handleScramClose}
          onRetry={handleScramRetry}
          onTutorial={handleScramTutorial}
          onRecover={handleScramRecover}
        />
      )}

      {errorQueue.length > 0 && !showScramModal && (
        <ErrorFeedback
          error={errorQueue[0]}
          queueLength={errorQueue.length}
          onAcknowledge={handleAcknowledgeError}
          onSkip={handleSkipError}
        />
      )}

      {showChangelog && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 w-full max-w-2xl rounded-xl border border-slate-600 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
              <div>
                <h2 className="text-lg font-bold text-blue-400">Changelog — Nuclear Reactor Simulator</h2>
                <p className="text-xs text-slate-400 mt-0.5">Historial de versiones y mejoras</p>
              </div>
              <button
                onClick={() => setShowChangelog(false)}
                className="text-slate-400 hover:text-white text-2xl leading-none px-2 py-1 rounded hover:bg-slate-700 transition"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>
              <ChangelogViewer tutorialMode={tutorialMode} />
            </div>
          </div>
        </div>
      )}

      {state.emergencyShutdown && (
        <div
          className="fixed inset-0 pointer-events-none z-40 alarm-red"
          style={{ boxShadow: 'inset 0 0 0 4px rgb(239, 68, 68)' }}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
                <Radio className="w-10 h-10 text-yellow-500 reactor-core" />
                Nuclear Simulator
              </h1>
              <p className="text-slate-400 text-sm">Educativo — Física realista v2.6 · Panel Profesional · Agujas Analógicas · Alertas con Timestamp</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleToggleTutorial}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition ${
                  tutorialMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Tutorial: {tutorialMode ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setShowEducation(e => !e)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition ${
                  showEducation
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Aprende
              </button>
              <button
                onClick={() => setShowHistory(h => !h)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition ${
                  showHistory
                    ? 'bg-slate-500 hover:bg-slate-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                Historial
              </button>
              <button
                onClick={() => setShowChangelog(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition bg-indigo-700 hover:bg-indigo-600 text-white"
              >
                Changelog
              </button>
              <div className={`p-4 rounded-lg border-2 ${alertColors[alertLevel]}`}>
                <p className="text-sm font-bold">
                  {alertLevel === 'critical' && '🔴 CRÍTICO'}
                  {alertLevel === 'warning'  && '🟡 ALERTA'}
                  {alertLevel === 'safe'     && '🟢 SEGURO'}
                </p>
              </div>
            </div>
          </div>

          {/* INDICADORES DE SEGURIDAD */}
          {(() => {
            const getTempStatus   = t => t > 550 ? 'critical' : t > 500 ? 'warning' : 'ok';
            const getPressStatus  = p => p > 155 ? 'critical' : p > 150 ? 'warning' : 'ok';
            const getFlowStatus   = f => f < 30  ? 'critical' : f < 50  ? 'warning' : 'ok';

            const indicators = [
              { label: 'Temperatura', status: getTempStatus(state.temperature), value: state.temperature.toFixed(0), unit: 'K', warnMsg: `ADVERTENCIA: ${state.temperature.toFixed(0)}K`, critMsg: `CRÍTICO: ${state.temperature.toFixed(0)}K` },
              { label: 'Presión',     status: getPressStatus(state.pressure),   value: state.pressure.toFixed(1),     unit: 'bar', warnMsg: `ADVERTENCIA: ${state.pressure.toFixed(1)} bar`, critMsg: `CRÍTICO: ${state.pressure.toFixed(1)} bar` },
              { label: 'Flujo',       status: getFlowStatus(state.coolantFlow),  value: state.coolantFlow.toFixed(0),  unit: '%',   warnMsg: `BAJO: ${state.coolantFlow.toFixed(0)}%`,          critMsg: `CRÍTICO: ${state.coolantFlow.toFixed(0)}%` },
            ];

            // v2.2 extra indicators
            const extraIndicators = [];
            if (state.dopplerActive) {
              extraIndicators.push({ label: 'Doppler', status: 'ok', value: state.dopplerDeltaRho?.toFixed(3), unit: '$', warnMsg: '', critMsg: '' });
            }
            if (state.reliefValveOpen) {
              extraIndicators.push({ label: 'Válvula Alivio', status: 'warning', value: 'ABIERTA', unit: '', warnMsg: 'VÁLVULA ABIERTA', critMsg: '' });
            }

            const all = [...indicators, ...extraIndicators];
            const styleMap = { ok: 'bg-green-900/40 border-green-600/50 text-green-300', warning: 'bg-yellow-900/50 border-yellow-500/60 text-yellow-200', critical: 'bg-red-900/60 border-red-500/70 text-red-200 animate-pulse' };
            const emojiMap = { ok: '✅', warning: '⚠️', critical: '🔴' };

            return (
              <div className="flex flex-wrap gap-2 mb-4">
                {all.map(({ label, status, value, unit, warnMsg, critMsg }) => (
                  <div key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${styleMap[status]}`}>
                    <span>{emojiMap[status]}</span>
                    <span>
                      {label}:{' '}
                      {status === 'ok'       ? (unit ? `${value} ${unit}` : 'OK')
                       : status === 'warning' ? warnMsg
                       : critMsg}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}

          <ScoreBoard
            score={scoring.score}
            level={scoring.level}
            timeElapsed={scoring.timeElapsed}
            achievements={scoring.achievements}
          />
        </div>

        {/* LOGROS RECIENTES */}
        {newAchievements.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {newAchievements.map((ach, idx) => (
              <AchievementBadge key={idx} achievement={ach} isNew={true} />
            ))}
          </div>
        )}

        {/* EVENTO ALEATORIO — análisis educativo/compacto según modo */}
        {showRandomAlert && (
          <EventAnalysis
            tutorialMode={tutorialMode}
            alert={state.pendingAlert}
            onDismiss={() => setDismissedAlertTime(state.pendingAlert.timestamp)}
          />
        )}

        {/* PANEL DE RIESGO EN TIEMPO REAL */}
        {isRunning && (
          <RiskPanel tutorialMode={tutorialMode} state={state} />
        )}

        {/* INDICADOR DE PACIENCIA */}
        {isRunning && (
          <PatienceIndicator
            isStabilizing={state.isStabilizing}
            stabilizationProgress={state.stabilizationProgress}
            lastActionName={state.lastActionName}
            pendingChanges={state.pendingChanges ?? []}
          />
        )}

        {/* TIMELINE DE CASCADA (tutorial only) */}
        {tutorialMode && isRunning && (
          <CascadeTimeline state={state} />
        )}

        {/* TUTORIAL */}
        {tutorialMode && (
          <TutorialGuide
            currentStep={tutorialStep}
            completedSteps={completedSteps}
            onClose={handleToggleTutorial}
            onVerifySystems={handleVerifySystems}
            onSafetyAcknowledge={handleSafetyAcknowledge}
            power={state.power}
          />
        )}

        {/* PANEL EDUCATIVO */}
        {showEducation && (
          <EducationPanel onClose={() => setShowEducation(false)} />
        )}

        {/* HISTORIAL DE OPERACIONES */}
        {showHistory && (
          <HistoryPanel
            operationLog={state.operationLog}
            onClose={() => setShowHistory(false)}
          />
        )}

        {/* PANEL DE CONTROL */}
        <ControlPanel
          sim={sim}
          state={state}
          isRunning={isRunning}
          onToggle={toggleSimulation}
          onReset={reset}
          onLoadScenario={loadScenario}
          scenario={scenario}
          tutorialMode={tutorialMode}
          tutorialStep={tutorialStep}
          onStateChange={handleStateChange}
        />

        {/* CONTROLES AVANZADOS (siempre visibles — interactivos en libre, visualización en tutorial) */}
        <AdvancedControls
          sim={sim}
          state={state}
          tutorialMode={tutorialMode}
          isRunning={isRunning}
          onStateChange={handleStateChange}
          onControlChange={(hint) => setActiveHint(hint)}
        />

        {/* INSTRUMENTOS DEL REACTOR */}
        <InstrumentsPanel />

        {/* PANEL PROFESIONAL — AGUJAS ANALÓGICAS */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 my-6">
          <div className="flex items-center gap-3 mb-4">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              state.emergencyShutdown ? 'bg-red-500 animate-pulse' :
              isRunning ? 'bg-green-500 animate-pulse' : 'bg-slate-500'
            }`} />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">
              Panel de Instrumentación — Sala de Control v2.6
            </h2>
            <span className={`ml-auto text-xs px-2.5 py-1 rounded font-bold ${
              state.emergencyShutdown ? 'bg-red-900 text-red-300 animate-pulse' :
              tutorialMode ? 'bg-blue-900 text-blue-300' : 'bg-slate-700 text-slate-300'
            }`}>
              {state.emergencyShutdown ? 'SCRAM ACTIVO' : tutorialMode ? 'MODO TUTORIAL' : 'MODO LIBRE'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <Tooltip text="Potencia: Energía generada. Normal: 500–800 MW. Límite: 1000 MW" position="bottom">
              <AnalogGauge
                label="Potencia"
                value={state.power}
                min={0} max={1000}
                unit="MW"
                warningAt={700}
                dangerAt={900}
                size={168}
              />
            </Tooltip>
            <Tooltip text="Temperatura del núcleo en Kelvin. Alerta: 500 K. Máximo: 550 K" position="bottom">
              <AnalogGauge
                label="Temperatura"
                value={Math.min(state.temperature, 650)}
                min={270} max={650}
                unit="K"
                warningAt={500}
                dangerAt={550}
                size={168}
              />
            </Tooltip>
            <Tooltip text={`Presión del circuito primario. Alerta: 145 bar. SCRAM: 155 bar${state.reliefValveOpen ? ' — VÁLVULA ABIERTA' : ''}`} position="bottom">
              <AnalogGauge
                label={state.reliefValveOpen ? 'Presión ⚠' : 'Presión'}
                value={Math.min(state.pressure, 180)}
                min={0} max={180}
                unit="bar"
                warningAt={145}
                dangerAt={155}
                size={168}
              />
            </Tooltip>
            <Tooltip text="Flujo de refrigerante. Alerta: <50%. Crítico: <30%" position="bottom">
              <AnalogGauge
                label="Flujo Refrig."
                value={state.coolantFlow}
                min={0} max={100}
                unit="%"
                warningAt={50}
                dangerAt={30}
                invertZones={true}
                size={168}
              />
            </Tooltip>
          </div>

          {/* Professional alert panel */}
          <ProfessionalAlertPanel state={state} isRunning={isRunning} />
        </div>

        {/* VISUALIZACIÓN DEL REACTOR + ZONAS TÉRMICAS + ESTADO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ReactorCoreVisualization
            power={state.power}
            temperature={state.temperature}
            pressure={state.pressure}
            coolantFlow={state.coolantFlow}
          />

          {/* ESTADO DE SISTEMAS + ZONAS TÉRMICAS */}
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">ESTADO DE SISTEMAS</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Barras:</span>
                  <span className={`font-bold ${state.controlRodsInserted > 90 ? 'text-green-400' : 'text-orange-400'}`}>
                    {state.controlRodsInserted.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bomba:</span>
                  <span className={`font-bold ${state.pumpRunning ? 'text-green-400' : 'text-red-400'}`}>
                    {state.pumpRunning ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Seguridad:</span>
                  <span className={`font-bold ${state.safetySystemsActive ? 'text-green-400' : 'text-red-400'}`}>
                    {state.safetySystemsActive ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reactividad:</span>
                  <span className={`font-bold ${Math.abs(state.reactividad) > 1.5 ? 'text-red-400' : 'text-blue-400'}`}>
                    {state.reactividad.toFixed(2)} $
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Válvula Alivio:</span>
                  <span className={`font-bold ${state.reliefValveOpen ? 'text-orange-400 animate-pulse' : 'text-green-400'}`}>
                    {state.reliefValveOpen ? 'ABIERTA' : 'Cerrada'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Doppler:</span>
                  <span className={`font-bold text-xs ${state.dopplerActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {state.dopplerActive ? `Activo (${state.dopplerDeltaRho} $)` : 'Inactivo'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SCRAM:</span>
                  <span className={`font-bold ${state.emergencyShutdown ? 'text-red-400 alarm-red' : 'text-green-400'}`}>
                    {state.emergencyShutdown ? 'ACTIVO' : '—'}
                  </span>
                </div>

                {Object.values(state.failures).some(f => f) && (
                  <div className="mt-3 p-2.5 bg-red-900 border border-red-600 rounded">
                    <p className="font-bold text-red-300 mb-1.5 text-xs">⚠️ FALLOS ACTIVOS:</p>
                    {state.failures.coolantLeak  && <p className="text-xs text-red-200">• LOCA — Pérdida de refrigerante</p>}
                    {state.failures.pumpFailure  && <p className="text-xs text-red-200">• Bomba de refrigeración fallida</p>}
                    {state.failures.controlRodsStuck && <p className="text-xs text-red-200">• Barras de control atascadas</p>}
                  </div>
                )}
              </div>
            </div>

            {/* ZONAS TÉRMICAS */}
            <ThermalZonesPanel thermalZones={state.thermalZones} temperature={state.temperature} />
          </div>

          {/* LOG DE EVENTOS */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">LOG DE EVENTOS</h3>
            <div className="bg-slate-900 rounded p-3 h-72 overflow-y-auto font-mono text-xs space-y-1">
              {state.events.length > 0 ? (
                state.events.slice().reverse().map((event, idx) => (
                  <div
                    key={idx}
                    className={`${
                      event.level === 'critical' ? 'text-red-400'
                        : event.level === 'warning' ? 'text-yellow-400'
                        : 'text-green-400'
                    }`}
                  >
                    <span className="text-slate-500">[{event.time}]</span> {event.message}
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-xs">Sin eventos</p>
              )}
            </div>
          </div>
        </div>

        {/* RECUPERACIÓN POST-SCRAM v2.5 */}
        {state.emergencyShutdown && (
          <PostScramRecovery
            tutorialMode={tutorialMode}
            state={state}
            countdown={postScramCountdown}
            investigationSteps={investigationSteps}
            onCompleteStep={handleCompleteInvestigationStep}
            onRestart={handlePostScramRestart}
            onReset={reset}
          />
        )}

        {/* GRÁFICAS AVANZADAS CON HISTÓRICO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AdvancedPowerTempChart history={history} longHistory={longHistory} />
          <AdvancedPressureFlowChart history={history} longHistory={longHistory} />
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6">
          <StabilityChart history={history} />
        </div>

        {/* LOGROS */}
        {scoring.achievements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-6 h-6" />
              LOGROS DESBLOQUEADOS ({scoring.achievements.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scoring.achievements.map((ach, idx) => (
                <AchievementBadge key={idx} achievement={ach} isNew={false} />
              ))}
            </div>
          </div>
        )}

        {/* FUNDAMENTOS FÍSICOS */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            FUNDAMENTOS FÍSICOS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
            <div>
              <p className="font-bold text-white mb-1">📐 Ecuación de Punto Cinético</p>
              <p className="text-xs leading-relaxed">
                dn/dt = [(ρ − β) / Λ] × n<br/>
                Modela cómo varía la potencia nuclear según reactividad
              </p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">🌡️ Retroalimentación Doppler</p>
              <p className="text-xs leading-relaxed">
                ρ_doppler = α_doppler × ΔT (α = −0.0025 $/K)<br/>
                T↑ → expansión U → menos capturas → ρ↓ automáticamente
              </p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">🛑 Sistemas de Seguridad</p>
              <p className="text-xs leading-relaxed">
                SCRAM inserta barras en &lt;1s. Válvula de alivio: protección pasiva.<br/>
                Sin seguridad = meltdown inevitable (Chernobyl)
              </p>
            </div>
            <div>
              <p className="font-bold text-white mb-1">⏱️ Demoras en Cascada</p>
              <p className="text-xs leading-relaxed">
                Barras → reactividad: 3s · Reactividad → potencia: 5–30s<br/>
                Potencia → temperatura: 10s · Temperatura → presión: 15s
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center text-slate-500 text-xs border-t border-slate-700 pt-4">
          <p>⚛️ Nuclear Reactor Simulator v2.6 | Panel Profesional | Agujas Analógicas | Alertas con Timestamp</p>
          <p className="mt-2">Doppler · Calor de Decaimiento · Cuenta Regresiva · Investigación Post-SCRAM · Gráficas 2h · Changelog</p>
          <p className="mt-1">GitHub: MrProphecy | Deployed on Vercel</p>
        </div>
      </div>

      {/* Feedback contextual — fixed overlay, visible when reactor running */}
      <TutorialFeedback
        temperature={state.temperature}
        pressure={state.pressure}
        coolantFlow={state.coolantFlow}
        power={state.power}
        isRunning={isRunning}
        dopplerActive={state.dopplerActive}
      />

      {/* Tooltip de acción — fixed overlay bottom-right */}
      <RiskTooltips
        tutorialMode={tutorialMode}
        lastAction={lastAction}
        state={state}
      />

      {/* Hint contextual de controles avanzados — fixed overlay bottom-left */}
      {activeHint && (
        <ContextualHints
          activeHint={activeHint}
          state={state}
          onDismiss={() => setActiveHint(null)}
        />
      )}
    </div>
  );
}
