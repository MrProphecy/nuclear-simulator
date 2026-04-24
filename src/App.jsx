import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Radio, Award, BookOpen, GraduationCap } from 'lucide-react';
import { ReactorSimulator } from './utils/ReactorSimulator';
import { ScoringSystem, DifficultyManager } from './utils/ScoringSystem';
import { ControlPanel } from './components/ControlPanel';
import { GaugeCard, ReactorCoreVisualization, AchievementBadge, ScoreBoard } from './components/Gauges';
import { PowerTemperatureChart, PressureFlowChart, StabilityChart } from './components/Charts';
import { WelcomeModal } from './components/WelcomeModal';
import { ScramModal } from './components/ScramModal';
import { InstrumentsPanel } from './components/InstrumentsPanel';
import { TutorialGuide } from './components/TutorialGuide';
import { EducationPanel } from './components/EducationPanel';
import { Tooltip } from './components/Tooltip';

export default function App() {
  const simulatorRef = useRef(new ReactorSimulator());
  const scoringRef = useRef(new ScoringSystem());
  const difficultyRef = useRef(new DifficultyManager(1));
  
  const [state, setState] = useState(simulatorRef.current.getState());
  const [scoring, setScoring] = useState(scoringRef.current.getState());
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState([]);
  const [scenario, setScenario] = useState('normal');
  const [showAchievements, setShowAchievements] = useState(false);
  const [newAchievements, setNewAchievements] = useState([]);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(Date.now());
  const lastScoringUpdateRef = useRef(0);

  // Tutorial state — show modal only on first visit (no tutorialMode key yet)
  const [showWelcomeModal, setShowWelcomeModal] = useState(
    () => localStorage.getItem('tutorialMode') === null
  );
  const [tutorialMode, setTutorialMode] = useState(
    () => localStorage.getItem('tutorialMode') === 'true'
  );
  const [tutorialStep, setTutorialStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const powerInRangeStartRef = useRef(null);

  // SCRAM modal
  const [showScramModal, setShowScramModal] = useState(false);
  const [scramReason, setScramReason] = useState('');
  const scramModalShownRef = useRef(false);

  // Education panel
  const [showEducation, setShowEducation] = useState(false);

  // Loop de simulación
  useEffect(() => {
    if (!isRunning) return;

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTimeRef.current) / 1000; // segundos
      lastTimeRef.current = now;

      const sim = simulatorRef.current;
      const scoring = scoringRef.current;
      
      sim.step(Math.min(deltaTime, 0.1)); // máximo 0.1s por frame

      const newState = sim.getState();
      setState(newState);

      // Actualizar scoring
      lastScoringUpdateRef.current += deltaTime;
      if (lastScoringUpdateRef.current >= 0.1) {
        scoring.updateScore(newState, lastScoringUpdateRef.current);
        scoring.updateLevel();
        
        // Verificar logros
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

      // Guardar histórico cada 0.5s
      if (newState.time % 0.5 < 0.01) {
        setHistory(prev => [...prev.slice(-180), {
          time: newState.time.toFixed(1),
          power: parseFloat(newState.power.toFixed(2)),
          temperature: parseFloat(newState.temperature.toFixed(1)),
          pressure: parseFloat(newState.pressure.toFixed(1)),
          coolantFlow: parseFloat(newState.coolantFlow.toFixed(1))
        }]);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isRunning]);

  // Tutorial step 2 → 3: pump turned on
  useEffect(() => {
    if (!tutorialMode || tutorialStep !== 2 || completedSteps.includes(2)) return;
    if (state.pumpRunning) {
      simulatorRef.current.logEvent('✓ Bomba de refrigerante en marcha', 'info');
      setState(simulatorRef.current.getState());
      setCompletedSteps(prev => [...prev, 2]);
      setTutorialStep(3);
    }
  }, [tutorialMode, tutorialStep, state.pumpRunning, completedSteps]);

  // Tutorial step 3 → 4: simulation started
  useEffect(() => {
    if (!tutorialMode || tutorialStep !== 3 || completedSteps.includes(3)) return;
    if (isRunning) {
      simulatorRef.current.logEvent('✓ Reacción nuclear iniciada', 'info');
      setState(simulatorRef.current.getState());
      setCompletedSteps(prev => [...prev, 3]);
      setTutorialStep(4);
    }
  }, [tutorialMode, tutorialStep, isRunning, completedSteps]);

  // Tutorial step 5 → 6: power stabilized between 500–800 MW for 3 seconds
  useEffect(() => {
    if (!tutorialMode || tutorialStep !== 5 || completedSteps.includes(5)) return;
    if (state.power >= 500 && state.power <= 800) {
      if (!powerInRangeStartRef.current) {
        powerInRangeStartRef.current = Date.now();
      }
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

  // Tutorial step 6 → 7: monitoring phase completes after 8 seconds
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

  // Alert sound — plays when critical parameters are exceeded (debounced to 4s)
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

  const handleStateChange = () => {
    setState(simulatorRef.current.getState());
  };

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
    setState(simulatorRef.current.getState());
    setScoring(scoringRef.current.getState());
    setHistory([]);
    setScenario('normal');
    setNewAchievements([]);
    setShowScramModal(false);
    scramModalShownRef.current = false;
    lastTimeRef.current = Date.now();
    lastScoringUpdateRef.current = 0;
  };

  // Tutorial handlers
  const handleStartTutorial = () => {
    localStorage.setItem('tutorialMode', 'true');
    setShowWelcomeModal(false);
    setTutorialMode(true);
    setTutorialStep(1);
    setCompletedSteps([]);
    powerInRangeStartRef.current = null;
    setShowScramModal(false);
    scramModalShownRef.current = false;
    // Reset simulator to clean state for tutorial
    simulatorRef.current = new ReactorSimulator();
    scoringRef.current = new ScoringSystem();
    difficultyRef.current = new DifficultyManager(1);
    setState(simulatorRef.current.getState());
    setScoring(scoringRef.current.getState());
    setHistory([]);
    setScenario('normal');
    setNewAchievements([]);
    setIsRunning(false);
    lastTimeRef.current = Date.now();
    lastScoringUpdateRef.current = 0;
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

  const handleScramClose = () => setShowScramModal(false);

  const handleScramRetry = () => {
    reset();
  };

  const handleScramTutorial = () => {
    handleStartTutorial();
  };

  const handleScramRecover = () => {
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
      difficultyRef.current = new DifficultyManager(5); // Muy difícil
    } else if (scenarioName === 'loca') {
      simulatorRef.current.logEvent('📋 Escenario: PÉRDIDA DE REFRIGERANTE (LOCA)', 'warning');
      simulatorRef.current.power = 100;
      simulatorRef.current.temperature = 300;
      difficultyRef.current = new DifficultyManager(4);
    } else if (scenarioName === 'fukushima') {
      simulatorRef.current.logEvent('📋 Escenario: FUKUSHIMA (Terremoto + Tsunami)', 'warning');
      simulatorRef.current.power = 1200;
      simulatorRef.current.temperature = 300;
      simulatorRef.current.causePumpFailure();
      difficultyRef.current = new DifficultyManager(5);
    } else {
      difficultyRef.current = new DifficultyManager(1);
    }

    setScenario(scenarioName);
    setState(simulatorRef.current.getState());
    setScoring(scoringRef.current.getState());
    setHistory([]);
    setNewAchievements([]);
    setShowScramModal(false);
    scramModalShownRef.current = false;
    lastTimeRef.current = Date.now();
    lastScoringUpdateRef.current = 0;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
      {/* WELCOME MODAL */}
      {showWelcomeModal && (
        <WelcomeModal onStartTutorial={handleStartTutorial} onFreeMode={handleFreeMode} />
      )}

      {/* SCRAM MODAL */}
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

      {/* RED ALERT OVERLAY — visible while SCRAM is active */}
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
              <p className="text-slate-400 text-sm">Educativo — Física realista de punto cinético</p>
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
                Modo Tutorial: {tutorialMode ? 'ON' : 'OFF'}
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
                ? Aprende más
              </button>
              <div className={`p-4 rounded-lg border-2 ${alertColors[alertLevel]}`}>
                <p className="text-sm font-bold">
                  {alertLevel === 'critical' && '🔴 CRÍTICO'}
                  {alertLevel === 'warning' && '🟡 ALERTA'}
                  {alertLevel === 'safe' && '🟢 SEGURO'}
                </p>
              </div>
            </div>
          </div>

          {/* SAFETY INDICATORS BAR */}
          {(() => {
            const getTempStatus = (t) => t > 550 ? 'critical' : t > 500 ? 'warning' : 'ok';
            const getPressStatus = (p) => p > 155 ? 'critical' : p > 150 ? 'warning' : 'ok';
            const getFlowStatus = (f) => f < 30 ? 'critical' : f < 50 ? 'warning' : 'ok';

            const indicators = [
              {
                label: 'Temperatura',
                status: getTempStatus(state.temperature),
                value: state.temperature.toFixed(0),
                unit: 'K',
                warnMsg: `ADVERTENCIA: ${state.temperature.toFixed(0)}K`,
                critMsg: `CRÍTICO: ${state.temperature.toFixed(0)}K`,
              },
              {
                label: 'Presión',
                status: getPressStatus(state.pressure),
                value: state.pressure.toFixed(1),
                unit: 'bar',
                warnMsg: `ADVERTENCIA: ${state.pressure.toFixed(1)} bar`,
                critMsg: `CRÍTICO: ${state.pressure.toFixed(1)} bar`,
              },
              {
                label: 'Flujo',
                status: getFlowStatus(state.coolantFlow),
                value: state.coolantFlow.toFixed(0),
                unit: '%',
                warnMsg: `BAJO: ${state.coolantFlow.toFixed(0)}%`,
                critMsg: `CRÍTICO: ${state.coolantFlow.toFixed(0)}%`,
              },
            ];

            const styleMap = {
              ok:       'bg-green-900/40 border-green-600/50 text-green-300',
              warning:  'bg-yellow-900/50 border-yellow-500/60 text-yellow-200',
              critical: 'bg-red-900/60 border-red-500/70 text-red-200 animate-pulse',
            };
            const emojiMap = { ok: '✅', warning: '⚠️', critical: '🔴' };

            return (
              <div className="flex flex-wrap gap-2 mb-4">
                {indicators.map(({ label, status, value, unit, warnMsg, critMsg }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${styleMap[status]}`}
                  >
                    <span>{emojiMap[status]}</span>
                    <span>
                      {label}:{' '}
                      {status === 'ok'
                        ? 'OK'
                        : status === 'warning'
                        ? warnMsg
                        : critMsg}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* SCOREBOARD */}
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

        {/* TUTORIAL GUIDE */}
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

        {/* EDUCATION PANEL */}
        {showEducation && (
          <EducationPanel onClose={() => setShowEducation(false)} />
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

        {/* INSTRUMENTOS DEL REACTOR */}
        <InstrumentsPanel />

        {/* MEDIDORES PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          <Tooltip text="Potencia: Energía generada en Megavatios. Normal: 500–800 MW" position="bottom">
            <GaugeCard
              label="POTENCIA"
              value={state.power}
              unit="MW"
              max={2000}
              color="bg-red-500"
            />
          </Tooltip>
          <Tooltip text="Temperatura: Calor del núcleo en Kelvin. Máximo seguro: 550K" position="bottom">
            <GaugeCard
              label="TEMPERATURA"
              value={state.temperature}
              unit="K"
              max={700}
              color="bg-blue-500"
            />
          </Tooltip>
          <Tooltip text="Presión: Estrés del circuito primario. Máximo: 160 bar" position="bottom">
            <GaugeCard
              label="PRESIÓN"
              value={state.pressure}
              unit="bar"
              max={170}
              color="bg-cyan-500"
            />
          </Tooltip>
          <Tooltip text="Flujo Refrigerante: Circulación de agua. Mínimo: 30%" position="bottom">
            <GaugeCard
              label="FLUJO REFRIGERANTE"
              value={state.coolantFlow}
              unit="%"
              max={100}
              color="bg-purple-500"
            />
          </Tooltip>
        </div>

        {/* VISUALIZACIÓN DEL REACTOR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ReactorCoreVisualization
            power={state.power}
            temperature={state.temperature}
            pressure={state.pressure}
            coolantFlow={state.coolantFlow}
          />

          {/* ESTADO DE SISTEMAS */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">ESTADO DE SISTEMAS</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Barras:</span>
                <span className={`font-bold ${state.controlRodsInserted > 90 ? 'text-green-400' : 'text-orange-400'}`}>
                  {state.controlRodsInserted.toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Bomba:</span>
                <span className={`font-bold ${state.pumpRunning ? 'text-green-400' : 'text-red-400'}`}>
                  {state.pumpRunning ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Seguridad:</span>
                <span className={`font-bold ${state.safetySystemsActive ? 'text-green-400' : 'text-red-400'}`}>
                  {state.safetySystemsActive ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Reactividad:</span>
                <span className={`font-bold ${Math.abs(state.reactividad) > 1.5 ? 'text-red-400' : 'text-blue-400'}`}>
                  {state.reactividad.toFixed(2)} $
                </span>
              </div>
              <div className="flex justify-between">
                <span>SCRAM:</span>
                <span className={`font-bold ${state.emergencyShutdown ? 'text-red-400 alarm-red' : 'text-green-400'}`}>
                  {state.emergencyShutdown ? 'ACTIVO' : '-'}
                </span>
              </div>

              {Object.values(state.failures).some(f => f) && (
                <div className="mt-4 p-3 bg-red-900 border border-red-600 rounded">
                  <p className="font-bold text-red-300 mb-2 text-xs">⚠️ FALLOS:</p>
                  {state.failures.coolantLeak && <p className="text-xs text-red-200">• LOCA</p>}
                  {state.failures.pumpFailure && <p className="text-xs text-red-200">• Bomba</p>}
                  {state.failures.controlRodsStuck && <p className="text-xs text-red-200">• Barras</p>}
                </div>
              )}
            </div>
          </div>

          {/* LOG DE EVENTOS */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">LOG DE EVENTOS</h3>
            <div className="bg-slate-900 rounded p-3 h-64 overflow-y-auto font-mono text-xs space-y-1">
              {state.events.length > 0 ? (
                state.events.slice().reverse().map((event, idx) => (
                  <div
                    key={idx}
                    className={`${
                      event.level === 'critical'
                        ? 'text-red-400'
                        : event.level === 'warning'
                        ? 'text-yellow-400'
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

        {/* GRÁFICAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PowerTemperatureChart history={history} />
          <PressureFlowChart history={history} />
        </div>

        {/* GRÁFICA DE ESTABILIDAD */}
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

        {/* INFORMACIÓN EDUCATIVA */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            FUNDAMENTOS FÍSICOS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
            <div>
              <p className="font-bold text-white mb-2">📐 Ecuación de Punto Cinético</p>
              <p className="text-xs leading-relaxed mb-3">
                dn/dt = [(ρ - β) / Λ] × n<br/>
                Modela cómo varía la potencia nuclear según reactividad
              </p>
            </div>
            <div>
              <p className="font-bold text-white mb-2">🌡️ Feedback Térmico</p>
              <p className="text-xs leading-relaxed mb-3">
                T↑ → absorción↑ → reactividad↓ → estabilización<br/>
                Este sistema autorregunable hace seguros los reactores
              </p>
            </div>
            <div>
              <p className="font-bold text-white mb-2">🛑 Sistemas de Seguridad</p>
              <p className="text-xs leading-relaxed mb-3">
                SCRAM inserta barras que absorben neutrones<br/>
                Sin seguridad = meltdown inevitable (Chernobyl)
              </p>
            </div>
            <div>
              <p className="font-bold text-white mb-2">💧 Dinámica de Refrigeración</p>
              <p className="text-xs leading-relaxed mb-3">
                Sin flujo = calor acumulado exponencial<br/>
                Pérdida de bomba es el peor escenario posible
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center text-slate-500 text-xs border-t border-slate-700 pt-4">
          <p>⚛️ Nuclear Reactor Simulator v2.1 | Educativo</p>
          <p className="mt-2">Física realista • Parámetros ficticios • Para aprendizaje en ingeniería nuclear</p>
          <p className="mt-1">GitHub: MrProphecy | Deployed on Vercel</p>
        </div>
      </div>
    </div>
  );
}
