# System Architecture

## Overview

The simulator is a single-page React application. The physics engine runs entirely in the browser — no server, no backend API. The simulation loop executes at ~60 Hz via `requestAnimationFrame` inside the main `App` component.

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│  ┌──────────────┐    state     ┌───────────────────────┐   │
│  │  App.jsx     │◄────────────►│  ReactorSimulator.js  │   │
│  │  (RAF loop)  │   .step(dt)  │  (physics engine)     │   │
│  └──────┬───────┘              └───────────────────────┘   │
│         │ props                                             │
│         ▼                                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              UI Components                           │  │
│  │  ControlPanel  │  Gauges  │  Charts  │  EventLog    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────┐                                  │
│  │   ScoringSystem.js    │  ← updated each RAF tick         │
│  └───────────────────────┘                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
nuclear-simulator/
├── index.html                 # Vite entry point
├── vite.config.js             # Vite + React plugin config
├── tailwind.config.js         # Tailwind CSS config
├── package.json
│
├── src/
│   ├── main.jsx               # ReactDOM.createRoot bootstrap
│   ├── App.jsx                # Root component + simulation loop
│   ├── index.css              # Tailwind directives + custom animations
│   │
│   ├── utils/
│   │   ├── ReactorSimulator.js  # Physics engine (class)
│   │   └── ScoringSystem.js     # Scoring + achievements (class)
│   │
│   └── components/
│       ├── Gauges.jsx           # Digital meters + core visualization
│       └── Charts.jsx           # Recharts real-time plots
│
└── docs/                      # This documentation
```

---

## Simulation Loop

The main loop lives in `App.jsx` and uses `requestAnimationFrame` for frame-rate-independent stepping:

```javascript
// Conceptual — see App.jsx for actual implementation
useEffect(() => {
  let lastTime = performance.now();

  function tick(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1); // cap at 100 ms
    lastTime = now;

    simulator.step(dt);
    scoring.updateScore(simulator.getState(), dt);
    scoring.checkAchievements(simulator.getState());
    scoring.updateLevel();

    setState(simulator.getState());
    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId);
}, []);
```

**Time step capping** at 100 ms prevents large jumps when the tab is backgrounded or the user switches windows — an important guard against unphysical transients.

---

## ReactorSimulator Class

Central physics engine. Instantiated once and mutated each tick.

### State

| Field | Type | Description |
|---|---|---|
| `power` | number (MW) | Current fission power |
| `temperature` | number (K) | Core average temperature |
| `pressure` | number (bar) | Primary circuit pressure |
| `coolantFlow` | number (%) | Primary pump flow rate |
| `reactividad` | number ($) | Net reactivity |
| `controlRodsInserted` | number (%) | Rod bank position |
| `pumpRunning` | boolean | Pump state |
| `safetySystemsActive` | boolean | SCRAM enable flag |
| `emergencyShutdown` | boolean | SCRAM status |
| `failures` | object | Active failure flags |
| `thermalZones` | object | Center/middle/outer temperatures |
| `pendingChanges` | array | Scheduled delayed effects queue |
| `isStabilizing` | boolean | Post-action stabilization tracking |

### Key Methods

| Method | Description |
|---|---|
| `step(dt)` | Advance simulation by dt seconds — called each RAF tick |
| `solvePointKinetics(dt)` | Integrate PKE using explicit Euler |
| `applyTemperatureFeedback()` | Apply Doppler reactivity feedback |
| `updateTemperature(dt)` | Integrate core thermal dynamics |
| `updatePressure(dt)` | Update pressure + trigger relief valve |
| `insertControlRods(amount)` | Insert rods with 3 s cascade delay |
| `withdrawControlRods(amount)` | Withdraw rods with 3 s cascade delay |
| `setControlRods(value)` | Continuous slider — no delay |
| `togglePump()` | Toggle pump with 5 s restart delay |
| `emergencyScram()` | Manual full SCRAM |
| `resetFromScram()` | Recover from SCRAM state |
| `loadChernobylScenario()` | Apply Chernobyl initial conditions |
| `loadFukushimaScenario()` | Apply Fukushima initial conditions |
| `getState()` | Return full state snapshot |

Full API documentation: [`docs/API.md`](API.md)

---

## ScoringSystem Class

Stateful scoring engine updated in parallel with the physics engine each tick.

### Scoring Logic

```
Base rate:     +10 pts/s  (always)
Stable bonus:  +50 pts/s  (T < 450 K, P < 150 bar, P_th < 1000 MW)
Rod bonus:     +20 pts/s  (rods 70–100% inserted)

Penalties:
  T > 550 K:     −100 pts/s
  P > 155 bar:   −100 pts/s
  flow < 30%:    −150 pts/s
  SCRAM:         −300 pts (one-time)
  Safety violation: −200 pts (one-time)
```

### Achievements

| ID | Name | Trigger |
|---|---|---|
| `perfect_control` | Control Perfecto | 60 s with T < 450 K and P < 150 bar |
| `rod_master` | Maestro de Barras | Rods 50–80% for a period |
| `loca_survivor` | Superviviente de LOCA | Coolant leak active + power < 500 MW |
| `chernobyl_defender` | Defensor de Chernobyl | Chernobyl scenario survived |
| `sentinel` | Centinela | 300 s elapsed, zero SCRAMs |
| `limit_seeker` | Buscador de Límites | Power > 1600 MW without meltdown |

---

## Data Flow

```
User action
    │
    ▼
ReactorSimulator method call
    │ immediate state mutation
    ▼
pendingChanges queue (for delayed effects)
    │
    ▼  each RAF tick
step(dt)
    ├─ processPendingChanges()
    ├─ solvePointKinetics(dt)
    ├─ applyTemperatureFeedback()
    ├─ updateTemperature(dt)
    ├─ updatePressure(dt)
    ├─ generateRandomEvent()
    └─ updateStabilizationProgress()
    │
    ▼
getState() → React setState()
    │
    ▼
React re-render → UI update
```

---

## Build and Deployment

| Command | Output |
|---|---|
| `npm run dev` | Vite dev server at `localhost:5173` with HMR |
| `npm run build` | Optimized bundle in `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run deploy` | Push to Vercel via CLI |

The `vercel.json` config rewrites all routes to `index.html` for SPA compatibility.
