# Operator Guide — Running the Reactor

## Before You Start

The simulator models a simplified **Pressurized Water Reactor (PWR)**. Your job as operator is to keep four parameters inside their normal operating bands simultaneously:

| Parameter | Normal Range | Alarm | SCRAM |
|---|---|---|---|
| Power | 500–1500 MW | — | — |
| Temperature | 300–500 K | > 500 K | > 600 K |
| Pressure | 140–155 bar | > 157 bar | > 160 bar |
| Coolant flow | 80–100% | < 50% | < 30% |

---

## First Principles

### Why temperature is your primary concern

Power generates heat. Heat raises temperature. Temperature raises pressure. The entire control task reduces to: **manage power to control temperature**.

**The good news:** the reactor has inherent stability. When temperature rises, the Doppler effect reduces reactivity, which reduces power, which slows the temperature rise. You cannot accidentally run the reactor away unless you forcibly fight this mechanism or disable safety systems.

### The patience rule

After any control action (rod movement, power adjustment), the reactor takes approximately **60 seconds** to reach a new thermal equilibrium. The stabilization indicator in the UI tracks this window. Never make a second adjustment before the reactor has settled — chasing a transient with more inputs is the most common operator error.

---

## Control Elements

### Control Rods

Absorb neutrons → reduce reactivity → reduce power.

- **Insert rods** → power decreases (rods absorb neutrons)
- **Withdraw rods** → power increases (fewer neutrons absorbed)
- **Note:** Full effect takes 3 seconds due to mechanical drive delay

**Guideline:** Keep rods between 30–70% inserted during normal operation. Fully inserted (100%) is the SCRAM position.

### Primary Coolant Pump

Circulates water through the core to remove heat.

- **ON** (normal): coolant flow = 100%
- **OFF**: flow drops to 0%; temperature rises rapidly even at low power
- **Restart**: motor takes 5 seconds to reach full speed

**Never turn the pump off without first reducing power to minimum.** Residual decay heat is enough to overheat the core with no cooling.

### SCRAM (Emergency Shutdown)

Inserts all rods to 100% and sets reactivity to −3 $. Causes immediate power drop.

Use SCRAM when:
- Temperature or pressure are approaching their limits and trending upward
- Coolant flow has dropped and cannot be recovered
- You have lost control of the situation

After SCRAM, wait for temperature and pressure to normalize, then use "Recover from SCRAM" to restart.

---

## Normal Startup Procedure

1. Verify pump is running (coolant flow = 100%)
2. Verify rods are at ~50% inserted
3. Verify reactivity is near 0 or slightly negative
4. Gradually withdraw rods by 5–10% increments
5. Wait 60 seconds between adjustments
6. Target: ~1000 MW power, temperature 380–420 K, pressure 148–153 bar

---

## Responding to Alarms

### Temperature rising above 450 K

1. Insert control rods by 10–15%
2. Verify pump is running
3. Wait — Doppler feedback will assist you
4. If temperature continues above 500 K: insert rods further or SCRAM

### Pressure spike above 155 bar

1. The passive relief valve will open automatically above 155 bar
2. Reduce power (insert rods)
3. Verify pump flow is adequate
4. If pressure exceeds 157 bar: prepare for SCRAM
5. Note: relief valve opening temporarily reduces coolant flow

### Coolant flow dropping

1. This is the most dangerous condition — act immediately
2. If pump is running: check for coolant leak failure
3. If pump failed: attempt restart (5 s delay)
4. If flow < 40% and falling: SCRAM immediately
5. Automatic SCRAM triggers at < 30% flow

### Random events (pump vibration, pressure spike notices)

1. Read the event detail in the alert panel
2. Most random events are advisory — monitor for 30–60 seconds
3. If the event is a precursor (e.g., pump vibration), consider reducing power proactively
4. Do not panic — make one deliberate adjustment, then wait

---

## Scoring Strategy

Points are earned primarily by maintaining stability over time. The highest-value approach:

1. Achieve stable operation (T < 450 K, P < 150 bar, power < 1000 MW)
2. Keep rods 70–100% inserted (extra bonus)
3. Avoid all SCRAMs — the **Centinela** achievement requires 300 s without any SCRAM
4. Do not fight the Doppler feedback — it is helping you

---

## Historical Scenarios — What to Expect

### Chernobyl

Safety systems are disabled. The reactor is in an unstable low-power state with positive reactivity. Power will escalate rapidly. You have no automatic protection. Try inserting rods immediately — observe that the rate of power increase is too fast to control manually. This is a demonstration, not a puzzle to solve.

### Fukushima

The automatic SCRAM functions correctly — the reactor shuts down. Your challenge is that the coolant pump fails after 2 seconds. Even at low post-SCRAM power, decay heat accumulates. Observe how temperature climbs without active cooling. SCRAM is already done; there is nothing else to do in a real loss of offsite power. This scenario demonstrates the difference between **shutdown** and **safe** — a SCRAM stops fission, but decay heat remains for hours.

### LOCA

Coolant flow degrades progressively. Respond by inserting rods to reduce power demand. Monitor flow closely. If flow drops below 40%, SCRAM. The challenge is doing this quickly enough before the automatic SCRAM at 30% — a preemptive operator SCRAM avoids the score penalty from an automatic one.

---

## Keyboard and Interface Reference

| Control | Action |
|---|---|
| SCRAM button | Emergency shutdown |
| Recover button | Restart from SCRAM |
| Rod slider | Continuous position control |
| +Rods / −Rods buttons | Step control (±10%) |
| Pump toggle | Start/stop primary pump |
| +Power button | Add reactivity (+0.5 $) |
| Scenario buttons | Load historical accident initial conditions |
| Fault injection buttons | Manually trigger pump failure, LOCA, safety disable |
