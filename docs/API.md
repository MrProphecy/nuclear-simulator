# API Reference

## ReactorSimulator

`src/utils/ReactorSimulator.js`

### Constructor

```javascript
import { ReactorSimulator } from './utils/ReactorSimulator';

const sim = new ReactorSimulator();
```

Initializes the reactor in a safe nominal state:
- Power: 1 MW
- Temperature: 300 K
- Pressure: 155 bar
- Coolant flow: 100%
- Control rods: 0% inserted
- Safety systems: active

---

### Core Simulation

#### `step(dt = 0.1)`

Advances the simulation by `dt` seconds. Processes all physics, queued events, and safety logic.

```javascript
sim.step(0.1);   // advance 100 ms
sim.step(0.016); // advance one 60 Hz frame
```

Should be called in a `requestAnimationFrame` loop or equivalent. The time step is capped internally to prevent unphysical jumps.

#### `getState()`

Returns a plain object snapshot of all simulator state. Safe to call at any time.

```javascript
const state = sim.getState();

// Core parameters
state.power            // number — MW
state.temperature      // number — Kelvin
state.pressure         // number — bar
state.coolantFlow      // number — percent (0–100)
state.reactividad      // number — dollars (−3 to +3)

// Control state
state.controlRodsInserted  // number — percent (0–100)
state.pumpRunning          // boolean
state.safetySystemsActive  // boolean
state.emergencyShutdown    // boolean
state.scramReason          // string | null

// v2.2 additions
state.dopplerActive        // boolean — Doppler feedback in effect
state.dopplerDeltaRho      // number — current Doppler reactivity contribution ($)
state.reliefValveOpen      // boolean — pressure relief valve status
state.thermalZones         // { center, middle, outer } — each has .temp (K) and .label
state.pendingChanges       // array — scheduled delayed effects
state.isStabilizing        // boolean — post-action stabilization in progress
state.stabilizationProgress // number — 0–100%
state.lastActionName       // string — last operator action
state.pendingAlert         // object | null — pending random event alert

// Audit
state.operationLog         // array — last 100 operator actions with timestamps
state.events               // array — last 50 system events

// Failure flags
state.failures = {
  coolantLeak:       boolean,
  pumpFailure:       boolean,
  controlRodsStuck:  boolean,
  safetyDisabled:    boolean,
}
```

---

### Operator Controls

#### `insertControlRods(amount)`

Inserts control rods by `amount` percent. Immediate partial effect, full effect at +3 s.

```javascript
sim.insertControlRods(10); // insert 10% — rod position += 10
```

Fails silently if `controlRodsStuck` failure is active.

#### `withdrawControlRods(amount)`

Withdraws control rods by `amount` percent. Immediate partial effect, full effect at +3 s.

```javascript
sim.withdrawControlRods(5); // withdraw 5% — rod position -= 5
```

#### `setControlRods(value)`

Sets absolute rod position (0–100%) from a continuous slider. No cascade delay — immediate effect.

```javascript
sim.setControlRods(65); // set to 65% inserted
```

#### `increasePower(amount)`

Adds `amount` dollars of reactivity directly.

```javascript
sim.increasePower(0.5); // add +0.5 $ reactivity
```

No-op if `emergencyShutdown` is active.

#### `togglePump()`

Toggles the primary coolant pump. Restart has a 5-second delay to reach full flow.

```javascript
sim.togglePump(); // if running → stop; if stopped → start (5s delay)
```

---

### Safety Functions

#### `emergencyScram()`

Manual full SCRAM. Inserts rods to 100%, sets ρ = −3 $, flags `emergencyShutdown`.

```javascript
sim.emergencyScram();
```

#### `resetFromScram()`

Recovers from SCRAM state. Sets rods to 50%, ρ = −1.5 $, power = 1 MW. Clears pending changes queue.

```javascript
sim.resetFromScram();
```

---

### Failure Injection

#### `causePumpFailure()`

Fails the primary coolant pump. Sets `pumpRunning = false`, `coolantFlow = 0`.

```javascript
sim.causePumpFailure();
```

#### `causeCoolantLeak()`

Initiates a LOCA. Reduces flow by 50% immediately, then continues degrading stochastically each step.

```javascript
sim.causeCoolantLeak();
```

#### `disableSafetySystems()`

Disables automatic SCRAM. Required for Chernobyl scenario. Unsafe state.

```javascript
sim.disableSafetySystems();
```

---

### Historical Scenarios

#### `loadChernobylScenario()`

Applies Chernobyl 1986 initial conditions: high power, positive reactivity, safety systems disabled.

```javascript
sim.loadChernobylScenario();
```

#### `loadFukushimaScenario()`

Applies Fukushima 2011 conditions: near-full power, then injects pump failure after 2 seconds.

```javascript
sim.loadFukushimaScenario();
```

---

### Utility

#### `logEvent(message, level)`

Appends an event to the event log (max 50 entries, FIFO).

```javascript
sim.logEvent('Custom event message', 'warning'); // levels: 'info', 'warning', 'critical'
```

#### `logOperation(action, parameters, reason)`

Appends an entry to the operation audit log (max 100 entries, FIFO).

```javascript
sim.logOperation('CUSTOM_ACTION', { value: 42 }, 'Reason for action');
```

---

### Internal Methods (not for external use)

| Method | Description |
|---|---|
| `solvePointKinetics(dt)` | Euler integration of PKE |
| `applyTemperatureFeedback()` | Compute and apply Doppler reactivity |
| `updateTemperature(dt)` | Thermal dynamics integration |
| `updatePressure(dt)` | Pressure update + relief valve check |
| `checkPressureRelief()` | Passive relief valve logic |
| `generateRandomEvent()` | Probabilistic event generation |
| `updateStabilizationProgress()` | Update 60 s stabilization timer |
| `scheduleChange(delay, fn, desc)` | Enqueue a delayed effect |
| `processPendingChanges()` | Fire due delayed effects |
| `startStabilizationTracking(name)` | Begin stabilization timer after action |

---

## ScoringSystem

`src/utils/ScoringSystem.js`

### Constructor

```javascript
import { ScoringSystem } from './utils/ScoringSystem';

const scoring = new ScoringSystem();
```

### Methods

#### `updateScore(state, deltaTime)`

Updates score based on current reactor state. Call each simulation tick.

```javascript
scoring.updateScore(sim.getState(), dt);
```

#### `checkAchievements(state)`

Checks for newly unlocked achievements. Returns array of new achievements (empty if none).

```javascript
const newAchievements = scoring.checkAchievements(sim.getState());
// newAchievements: [{ id, name, desc, points }, ...]
```

#### `updateLevel()`

Recalculates level from current score (`level = floor(score / 1000) + 1`).

```javascript
scoring.updateLevel();
```

#### `registerSafetyViolation()`

Deducts 200 points and increments violation counter.

#### `registerScram()`

Deducts 300 points and increments SCRAM counter.

#### `getState()`

Returns current scoring state.

```javascript
const scoreState = scoring.getState();
// { score, level, timeElapsed, maxPowerReached, safetyViolations, scaramTriggered, achievements }
```

#### `getSessionSummary()`

Returns a compact end-of-session summary object.

```javascript
const summary = scoring.getSessionSummary();
// { score, level, duration, achievements (count), maxPower, violations, scramTriggered }
```

---

## DifficultyManager

`src/utils/ScoringSystem.js` — exported class

### Constructor

```javascript
import { DifficultyManager } from './utils/ScoringSystem';

const dm = new DifficultyManager(level); // level: 1 (easy) to 5 (hard)
```

### Methods

#### `generateRandomEvent(state)`

Returns a random event object or `null`. Event probability scales with difficulty level.

```javascript
const event = dm.generateRandomEvent(sim.getState());
if (event) event.action(sim); // apply to simulator
```

#### `generateRandomFailure(state)`

Returns a random failure descriptor or `null`. Failure probability scales with difficulty level.

```javascript
const failure = dm.generateRandomFailure(sim.getState());
// { type: string, name: string } | null
```
