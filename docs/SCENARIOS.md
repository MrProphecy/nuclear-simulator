# Historical Accident Scenarios

## Educational Purpose

Each scenario reconstructs the initiating conditions of a real nuclear accident using the simulator's physics engine. They demonstrate how the same reactor physics that makes reactors safe can be defeated by specific failure combinations.

> **Disclaimer:** Initial parameters, timescales, and failure progressions are simplified for educational clarity. They do not represent engineering documentation of any real facility.

---

## Scenario 1 — Chernobyl (April 26, 1986)

### Historical Context

Unit 4 of the Chernobyl Nuclear Power Plant (RBMK-1000 reactor, Ukraine) was conducting a safety test to verify that the turbine's rotational inertia could power the emergency cooling pumps during the 60–75 second gap before diesel generators started.

### Key Design Flaw: Positive Void Coefficient

The RBMK reactor had a **positive void coefficient** at low power: when coolant boiled (forming steam voids), reactivity increased instead of decreasing. This is the opposite of the inherent stability found in PWR designs.

Additionally, the control rods had a **graphite displacer tip** (called the "positive scram effect") — inserting rods initially increased reactivity for 2–3 seconds before decreasing it.

### Accident Progression

| Time | Event |
|---|---|
| 01:06 | Reactor at 200 MW (too low — operator should have aborted) |
| 01:23:04 | Test begins; steam valves closed |
| 01:23:40 | Operators press AZ-5 (SCRAM) due to power excursion |
| 01:23:43 | Graphite tips enter core — reactivity surges |
| ~01:23:44 | Power exceeds 30,000 MW in ~3 seconds |
| 01:23:44 | Steam explosion, then prompt-critical explosion |

### Simulator Conditions

```javascript
// loadChernobylScenario()
this.power             = 1500;     // MW — low power, unstable region
this.reactividad       = 0.8;      // Near prompt critical ($)
this.safetySystemsActive = false;  // Safety systems bypassed for test
```

**Immediate state:**
- Safety systems disabled (cannot auto-SCRAM)
- High positive reactivity
- Operator has no automatic protection

**Learning objective:** Observe prompt-critical power excursion with no negative feedback arrest. Demonstrates why positive void coefficient and disabled safety systems are an unacceptable combination.

---

## Scenario 2 — Fukushima Daiichi (March 11, 2011)

### Historical Context

A magnitude 9.0 earthquake followed by a 14-meter tsunami struck the Fukushima Daiichi plant. The earthquake triggered an automatic SCRAM — correct behavior. However, the tsunami disabled all emergency diesel generators and the switchyard, leaving the reactors with no active cooling despite the fuel remaining at decay-heat levels (~7% of full power).

### Accident Progression

| Time | Event |
|---|---|
| 14:46 | Earthquake M9.0 — automatic SCRAM, control rods inserted |
| 15:41 | Tsunami wave overtops seawall — all diesels flooded |
| ~16:00 | Station blackout confirmed; battery power only |
| ~16:36 | Emergency core cooling lost in Units 1, 2, 3 |
| March 12 | Hydrogen explosion in Unit 1 building |
| March 14 | Hydrogen explosion in Unit 3 building |

### Key Lesson: Decay Heat

Even after SCRAM, a reactor core produces significant heat from fission product decay:

```
P_decay(t) ≈ 0.066 × P_0 × t^(−0.2)   (Wigner-Way approximation)

At t = 1 hour: ~1.5% of full power
At t = 1 day:  ~0.6% of full power
```

For a 2700 MW(th) reactor: 1.5% = 40 MW — sufficient to boil coolant in a few hours without active cooling.

### Simulator Conditions

```javascript
// loadFukushimaScenario()
this.power             = 1380;     // MW — near full power before SCRAM
this.reactividad       = 0.2;      // Slight positive reactivity
this.safetySystemsActive = true;   // Safety systems functional

// Injected after 2 seconds:
this.causePumpFailure(); // Pump fails → no active cooling
```

**Learning objective:** The automatic SCRAM works correctly. The challenge is managing decay heat with no active cooling. Temperature rises even at low power because heat removal has stopped.

---

## Scenario 3 — LOCA (Generic Loss of Coolant Accident)

### Description

Loss of Coolant Accident (LOCA) is the design-basis accident for all PWRs. A breach in the primary circuit allows high-pressure coolant to escape, reducing core cooling capability.

### Failure Injection

```javascript
// causeCoolantLeak()
this.failures.coolantLeak = true;
this.coolantFlow *= 0.5;   // Immediate 50% flow reduction

// Progressive worsening each step:
if (this.failures.coolantLeak && Math.random() < 0.02) {
  this.coolantFlow *= 0.95;  // ~2% probability of further decay per step
}
```

### PWR Safety Response (Real)

Real plants respond with:
1. **High-pressure injection** (HPIS) — injects borated water if pressure is still high
2. **Low-pressure injection** (LPIS / ECCS) — floods core when pressure drops
3. **Containment isolation** — prevents fission product release

The simulator models the operator's role in managing this with available controls (SCRAM, rod insertion) since ECCS injection is not explicitly modeled.

### Learning Objective

Recognize the flow rate alarm, respond with SCRAM before automatic systems trigger, observe how coolant flow loss drives temperature rise even at low power.

---

## Normal Operation (Tutorial / Free Mode)

### Target Operating Range

| Parameter | Normal Range | Warning | Limit |
|---|---|---|---|
| Power | 500–1500 MW | > 1800 MW | > 2000 MW |
| Temperature | 300–450 K | > 500 K | > 600 K |
| Pressure | 140–155 bar | > 157 bar | > 160 bar |
| Coolant flow | 80–100% | < 50% | < 30% |
| Reactivity | −0.5 to +0.5 $ | ±1 $ | ±2 $ |

### Stability Protocol

After any control action (rod adjustment, power change), the reactor requires ~60 seconds to reach a new thermal equilibrium. The **stabilization indicator** in the UI tracks this. A common operator error is making multiple adjustments before the reactor settles, causing oscillations.

---

## Comparison Table

| Aspect | Chernobyl | Fukushima | LOCA |
|---|---|---|---|
| Initiating event | Low-power instability + test | Natural disaster (tsunami) | Primary circuit breach |
| Reactor type | RBMK (graphite-moderated) | BWR (boiling water) | Generic PWR |
| Safety systems | Disabled by operators | Functional but lost power | Functional |
| Root cause | Design flaw + procedure violation | Inadequate tsunami protection | Mechanical failure |
| Outcome (real) | Prompt-critical explosion | Station blackout + hydrogen explosions | Design-basis — containment holds |
| Outcome (simulator) | Uncontrollable power excursion | Temperature rise from decay heat | Manageable with SCRAM |
