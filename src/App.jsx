import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Radio, TrendingUp, Award } from 'lucide-react';
import { ReactorSimulator } from './utils/ReactorSimulator';
import { ScoringSystem, DifficultyManager } from './utils/ScoringSystem';
import { ControlPanel } from './components/ControlPanel';
import { GaugeCard, ReactorCoreVisualization, AchievementBadge, ScoreBoard } from './components/Gauges';
import { PowerTemperatureChart, PressureFlowChart, StabilityChart } from './components/Charts';

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
    lastTimeRef.current = Date.now();
    lastScoringUpdateRef.current = 0;
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
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-2">
                <Radio className="w-10 h-10 text-yellow-500 reactor-core" />
                Nuclear Simulator
              </h1>
              <p className="text-slate-400 text-sm">Educativo — Física realista de punto cinético</p>
            </div>
            <div className={`p-4 rounded-lg border-2 ${alertColors[alertLevel]}`}>
              <p className="text-sm font-bold">
                {alertLevel === 'critical' && '🔴 CRÍTICO'}
                {alertLevel === 'warning' && '🟡 ALERTA'}
                {alertLevel === 'safe' && '🟢 SEGURO'}
              </p>
            </div>
          </div>

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

        {/* PANEL DE CONTROL */}
        <ControlPanel
          sim={sim}
          isRunning={isRunning}
          onToggle={toggleSimulation}
          onReset={reset}
          onLoadScenario={loadScenario}
          scenario={scenario}
        />

        {/* MEDIDORES PRINCIPALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          <GaugeCard
            label="POTENCIA"
            value={state.power}
            unit="MW"
            max={2000}
            color="bg-red-500"
          />
          <GaugeCard
            label="TEMPERATURA"
            value={state.temperature}
            unit="K"
            max={700}
            color="bg-blue-500"
          />
          <GaugeCard
            label="PRESIÓN"
            value={state.pressure}
            unit="bar"
            max={170}
            color="bg-cyan-500"
          />
          <GaugeCard
            label="FLUJO REFRIGERANTE"
            value={state.coolantFlow}
            unit="%"
            max={100}
            color="bg-purple-500"
          />
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
          <p>⚛️ Nuclear Reactor Simulator v2.0 | Educativo</p>
          <p className="mt-2">Física realista • Parámetros ficticios • Para aprendizaje en ingeniería nuclear</p>
          <p className="mt-1">GitHub: MrProphecy | Deployed on Vercel</p>
        </div>
      </div>
    </div>
  );
}
