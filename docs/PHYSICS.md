# Nuclear Physics — Equations and Implementation

## 1. Point Kinetics Model

The reactor power is governed by the **point kinetics equation** (PKE), which treats the entire core as a single lumped system:

```
dn/dt = [(ρ − β) / Λ] × n + Σᵢ λᵢ Cᵢ
```

In this simplified implementation, precursor groups are collapsed into an effective prompt-neutron model:

```
dn/dt = [(ρ − β) / Λ] × n
```

### Parameters

| Symbol | Name | Value | Units |
|---|---|---|---|
| n | Relative power | — | MW (normalized) |
| ρ | Total reactivity | variable | dollars ($) |
| β | Effective delayed neutron fraction | 0.0065 | dimensionless |
| Λ | Prompt neutron generation time | 1 × 10⁻⁴ | s |

**Physical interpretation:**  
- When ρ < β (subcritical or delayed-critical), power changes slowly, controlled by delayed neutrons.  
- When ρ > β (prompt critical), power rises on prompt-neutron timescale (~0.1 ms) — the Chernobyl condition.  
- β = 0.0065 is the experimentally measured value for U-235 under thermal neutron fission.

### Numerical Integration

The PKE is integrated using **explicit Euler** with a fixed time step dt = 0.1 s at the application level:

```javascript
// ReactorSimulator.js — solvePointKinetics()
const dn_dt = ((rho - this.betaEffective) / this.generationTime) * this.power;
this.power += dn_dt * dt;
```

**Stability note:** Explicit Euler is conditionally stable. The time step satisfies the stability criterion for subcritical operation. In prompt-critical transients (ρ ≫ β), power is bounded by `Math.min(..., 10000)` to prevent numerical blow-up; the physical limiter is Doppler feedback (see §3).

---

## 2. Reactivity Sources

Total reactivity ρ is the algebraic sum of all contributions:

```
ρ_total = ρ_control_rods + ρ_operator + ρ_Doppler(T)
```

### 2.1 Control Rod Reactivity

Rod position maps to reactivity with a two-stage model that reflects the mechanical insertion delay (~3 s) of real rod drive mechanisms:

```
Immediate effect (t = 0):    Δρ_immediate = −(Δposition / 100) × 0.3
Full effect (t = 3 s):       Δρ_full      = −(Δposition / 100) × 0.9
```

The 3-second delay is implemented via a **scheduled-change queue** (`pendingChanges`). This teaches operators that control rod actions have inertia — a common source of operator error in real incidents.

### 2.2 Operator-Commanded Reactivity

Direct reactivity addition via the power control is bounded:

```
ρ ∈ [−3, +3] dollars
```

The ±3 $ range is conservative. Real PWRs have total rod worth of ~15–20 $; the restriction here prevents trivially achieving prompt criticality by slider manipulation.

---

## 3. Doppler Temperature Feedback

The **Doppler effect** is the most important inherent safety mechanism of thermal reactors. As fuel temperature rises, uranium-238 resonance absorption peaks broaden (Doppler broadening), increasing parasitic neutron capture and reducing reactivity:

```
Δρ_Doppler = α_D × ΔT
```

| Parameter | Value | Notes |
|---|---|---|
| α_D (Doppler coefficient) | −0.0025 $/K | Applied as incremental each time step |
| ΔT | T − 300 K | Reference temperature 300 K |
| Activation threshold | ±25 K | Below this, effect is negligible |

**Implementation:**

```javascript
// ReactorSimulator.js — applyTemperatureFeedback()
const deltaTemp = this.temperature - 300;
const dopplerEffect = this.dopplerCoeff * deltaTemp * 0.003;
this.reactividad = Math.max(-3, Math.min(3, this.reactividad + dopplerEffect));
```

The `× 0.003` scaling factor converts the per-step contribution to a rate consistent with the thermal time constant. This produces stable negative feedback visible on the real-time charts.

**Educational significance:**  
Without Doppler feedback (α_D > 0, as in the RBMK graphite moderator at certain power levels), a temperature excursion increases reactivity, which increases power, which increases temperature — a positive feedback loop driving the reactor to destruction.

---

## 4. Thermal-Hydraulic Model

### 4.1 Core Temperature Dynamics

```
dT/dt = k·P − h·(T − T_coolant)
```

```javascript
// ReactorSimulator.js — updateTemperature()
const heatGeneration = this.power * 2.5;          // k = 2.5 K/MW
const coolantTemp    = 290 - this.coolantFlow * 0.3;
const heatRemoval    = (coolantFlow/100) × (T − T_coolant) × 0.8;
const dT_dt = heatGeneration - heatRemoval;
```

| Term | Physical meaning |
|---|---|
| k × P | Heat generation from fission (2.5 K per MW) |
| h × (T − T_c) | Convective heat removal to coolant |
| T_coolant | Effective coolant temperature, decreases with flow |

### 4.2 Three-Zone Thermal Model

The core is divided into three concentric zones reflecting the radial power distribution in a real reactor:

| Zone | Temperature factor | Physical basis |
|---|---|---|
| Center | T × 1.14 × flowFactor | Peak power density at core center |
| Middle | T × 1.04 | Intermediate flux region |
| Outer (periphery) | T × 0.93 | Reflector region, lower flux |

The `flowFactor` increases zone-to-zone temperature spread when coolant flow is reduced, modeling the reduced mixing that occurs during loss-of-coolant events.

### 4.3 Pressure Model

```
P(t) = 155 + 0.2·(T − 300) − 0.3·φ
```

Where φ = coolantFlow (%). This is a quasi-static model: pressure is an algebraic function of temperature and flow rather than a separate ODE. This simplification is acceptable for a 0D model but omits pressurizer dynamics, steam generator, and secondary circuit.

---

## 5. Passive Safety Systems

### 5.1 Automatic SCRAM

Three independent SCRAM setpoints trigger full rod insertion (100%) and ρ = −3 $ when safety systems are enabled:

| Condition | Setpoint | Response |
|---|---|---|
| Temperature | T > 600 K | SCRAM + log |
| Pressure | P > 160 bar (and relief valve open) | SCRAM + log |
| Coolant flow | φ < 30% | SCRAM + log |

### 5.2 Passive Pressure Relief Valve

Modeled as a **passive device** (requires no electrical power or operator action):

```
Opens:  P > 155 bar  →  φ -= 8%,  T += 4 K
Closes: P < 147 bar  →  normal operation resumes
While open: P -= 1.5 bar/step  (steam vented)
```

This models the Pilot-Operated Relief Valve (PORV) present in PWR designs. In the Three Mile Island accident, a stuck-open PORV was the initiating event for loss of coolant.

---

## 6. Cascade Delay System

All operator actions that have physical inertia are modeled with a **scheduled-change queue**:

```javascript
// Enqueue a delayed effect
scheduleChange(delaySeconds, applyFn, description)

// Processed each time step
processPendingChanges()  // fires any changes where time >= triggerTime
```

| Action | Delay | Physical basis |
|---|---|---|
| Control rod insertion | 3 s (full effect) | Rod drive mechanism speed |
| Pump restart | 5 s (full flow) | Motor acceleration time |
| Pump shutdown | Immediate | Coastdown modeled separately |

---

## 7. Limitations and Simplifications

This is a **0-dimensional (point) model**. The following effects are not modeled:

- **Neutron transport** — no spatial flux distribution, no hotspot modeling
- **Xenon-135 poisoning** — the dominant long-term reactivity transient after shutdown
- **Samarium-149 poisoning** — secondary fission product worth ~−0.7 $
- **Delayed neutron precursor groups** — collapsed to a single effective β
- **Secondary circuit** — no steam generator, turbine, or condenser
- **Boron concentration control** — primary PWR long-term reactivity management
- **Fuel depletion** — no burnup, no plutonium buildup
- **Seismic/structural mechanics** — Fukushima scenario uses simplified failure injection

For rigorous simulation, refer to established codes such as RELAP5, TRACE, or PARCS.

---

## References

1. Hetrick, D.L. (1971). *Dynamics of Nuclear Reactors*. University of Chicago Press.  
2. Todreas, N.E. & Kazimi, M.S. (2011). *Nuclear Systems I: Thermal Hydraulic Fundamentals*. CRC Press.  
3. Stacey, W.M. (2007). *Nuclear Reactor Physics*. Wiley-VCH.  
4. IAEA Safety Reports Series No. 25: *Thermohydraulic Relationships for Advanced Water Cooled Reactors*.
