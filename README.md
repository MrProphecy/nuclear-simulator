# ⚛️ Nuclear Reactor Simulator v2.0

**Simulador educativo realista de reactor nuclear basado en física nuclear avanzada.**

![Status](https://img.shields.io/badge/status-production-brightgreen)
![Version](https://img.shields.io/badge/version-2.0-informational)
![Educational](https://img.shields.io/badge/type-Educational-blue)

## 🎯 ¿Qué es?

Un simulador interactivo **jugable** de reactor nuclear que modela el comportamiento real usando física nuclear real. Operador el reactor, mantén estable, evita meltdown. Sistema de puntuación y logros.

**Totalmente educativo** — parámetros ficticios pero físicamente coherentes.

---

## ✨ Características v2.0

### 🎮 Modo Operador Interactivo

- ✅ Control en tiempo real de potencia, barras, bomba
- ✅ Interfaz tipo "control center" realista
- ✅ Panel de alarmas y eventos cronológico
- ✅ Medidores digitales de todos parámetros críticos
- ✅ Botones para inyectar fallos intencionalmente

### 🏆 Sistema de Puntuación & Logros

- ✅ Puntuación dinámica basada en estabilidad
- ✅ 6+ logros desbloqueables:
  - 🎯 Control Perfecto (60s sin problemas)
  - ⚙️ Maestro de Barras (control suave)
  - 💧 Superviviente de LOCA
  - 🛡️ Defensor de Chernobyl
  - 🛡️ Centinela (300s sin SCRAM)
  - 🔥 Buscador de Límites
- ✅ Sistema de niveles (0-∞)
- ✅ Progreso visual al siguiente nivel

### 📊 Visualización Avanzada

- ✅ 3 gráficas en tiempo real (Recharts):
  - Potencia vs Temperatura
  - Presión vs Flujo refrigerante
  - Índice de estabilidad general
- ✅ Visualización 3D del núcleo reactor (con glow dinámico)
- ✅ Indicadores de estado por sistema
- ✅ Log de eventos cronológico coloreado

### 🎬 4 Escenarios Educativos

1. **Normal**: Operación segura nominal (+puntos por estabilidad)
2. **LOCA** (Loss Of Coolant): Pérdida de refrigerante +fallo de bomba
3. **Chernobyl**: Sistemas seguridad OFF + reactividad fuera de control (IMPOSIBLE)
4. **Fukushima**: Terremoto 9.0 + tsunami + fallo de backup (muy difícil)

### 🔬 Física Realista

Implementadas ecuaciones diferenciales reales:

```
dn/dt = [(ρ - β) / Λ] × n    [Punto Cinético]
dT/dt = k×P - h×(T-T_c)       [Dinámica térmica]
dP/dt = f(T, Q, losses)        [Presión primaria]
ρ(T) = α × ΔT                  [Feedback térmico negativo]
```

**Parámetros realistas**:
- β = 0.0065 (fracción de neutrones retardados reales)
- Λ = 0.0001 s (tiempo de generación real)
- α = -2.5 $/K (coeficiente feedback negativo real)

### 🌡️ Sistemas Realistas

- **Dinámica de temperatura**: acumulación de calor, transferencia térmica
- **Dinámica de presión**: aumento por temperatura, disminución por refrigeración
- **Control de barras**: inserción reduce reactividad, retracción aumenta
- **Bomba refrigeración**: ON/OFF, fallo causa meltdown
- **SCRAM automático**: inserta barras cuando T/P exceden límites
- **Fallos inyectables**: LOCA, fallo bomba, barras atascadas

### 📲 UI/UX Mejorado

- Dark theme profesional (inspire en SCADA real)
- Tailwind CSS responsive (mobile-friendly)
- Animaciones suaves (pulse, glow, blink en alarmas)
- Información educativa integrada
- Tooltip ayuda en parámetros críticos

---

## 🎓 Educativo: Qué Enseña

### Ingeniería Nuclear

1. **Dinámica de neutrones**: Cómo potencia depende de reactividad
2. **Feedback negativo**: Por qué temperatura estabiliza reactor
3. **SCRAM**: Inserción de barras salva el reactor
4. **LOCA**: Pérdida de refrigerante = peor escenario
5. **Meltdown**: Qué pasa sin enfriamiento

### Historia Nuclear Real

- **Chernobyl**: Deshabilitación de seguridad → explosión
- **Fukushima**: Pérdida backup eléctrico → meltdown
- **Three Mile Island** (próxima versión)

### Control y Operación

- Cómo operador gestiona potencia
- Respuesta ante anomalías
- Criterios de seguridad

---

## 📦 Stack Tecnológico

- **Frontend**: React 18 + Vite + Tailwind CSS (responsive)
- **Gráficas**: Recharts (tiempo real)
- **Física**: Solvers numéricos personalizados (Euler, precisión doble)
- **Hosting**: Vercel (free tier) + GitHub Pages
- **Deploy**: Automático en push a main

---

## 🚀 Cómo Usar

### En Línea (Vercel)
👉 **[https://nuclear-simulator.vercel.app](https://nuclear-simulator.vercel.app)**

### Localmente

```bash
# Clonar
git clone https://github.com/MrProphecy/nuclear-simulator.git
cd nuclear-simulator

# Instalar
npm install

# Desarrollo
npm run dev

# Abrir
http://localhost:5173
```

### Build para producción

```bash
npm run build
# Output: dist/

# Previsualizó
npm run preview
```

---

## 🎮 Gameplay

**Objetivo**: Mantener reactor estable el máximo tiempo. Gana puntos por:
- ⏱️ Tiempo sin problemas (+10 pts/seg base)
- ✅ Estabilidad (-550°C T, <150 bar P, <1000MW) (+50 pts/seg)
- 🎯 Logros desbloqueados (+300-5000 pts)

**Pierdes puntos por**:
- 🔴 Temperatura > 550K (-100 pts/seg)
- 🔴 Presión > 155 bar (-100 pts/seg)
- 🔴 Flujo < 30% (-150 pts/seg)
- 🛑 SCRAM (-300 pts)
- ⚠️ Violación de seguridad (-200 pts)

**Modos difíciles**:
- Chernobyl: Sistemas OFF → imposible ganar
- Fukushima: Fallo en cascada → muy difícil  
- LOCA: Pérdida refrigerante → desafío real

---

## 📚 Ecuaciones Implementadas

### Punto Cinético
```
dn/dt = [(ρ - β) / Λ] × n + Σ(λ_i × C_i)

donde:
  ρ = reactividad (dólares)
  β = 0.0065 (fracción neutrones retardados)
  Λ = 0.0001 s (tiempo generación)
  n = potencia relativa
  C_i = concentración de precursores
  λ_i = constante decay de precursores
```

Integración numérica: **Euler explícito** con dt adaptativo

### Retroalimentación Térmica
```
dρ/dT = α = -2.5 $/K

Efecto: T↑ → ρ↓ → n↓ → autorregulación
Este feedback es lo que hace seguros los reactores modernos
```

### Dinámica Térmica
```
dT/dt = k × Power - h × (T - T_coolant) - losses

donde:
  k = coef generación (≈2.5 K/MW)
  h = coef transferencia térmica
  T_coolant = temp refrigerante (≈280-300K)
  losses = disipación parasitaria
```

### Dinámica Presión
```
P(t) = P_base + ΔP_thermal - ΔP_cooling

donde:
  ΔP_thermal = 0.2 × (T - T_ref)
  ΔP_cooling = 0.3 × flow%
```

---

## 🛡️ Ciberseguridad & Disclaimer

⚠️ **SIMULADOR EDUCATIVO ÚNICAMENTE**

- ❌ No contiene datos de instalaciones reales
- ❌ No es un manual de operación
- ❌ Parámetros ficticios pero físicamente coherentes
- ❌ Para aprendizaje académico solamente
- ✅ MIT License - libre para educación

**Diferencias vs realidad**:
- Parámetros 10-20% alejados de valores reales
- Simplificaciones en dinámica (reactor 0D, no 3D)
- Sin xenón, samario, otros venenos neutronicos
- Sin control de temperatura primaria-secundaria

---

## 📡 API de Simulación

```javascript
import { ReactorSimulator } from './utils/ReactorSimulator';

const sim = new ReactorSimulator();

// Control
sim.increasePower(0.5);
sim.insertControlRods(10);
sim.withdrawControlRods(5);
sim.togglePump();
sim.emergencyScram();

// Fallos
sim.causePumpFailure();
sim.causeCoolantLeak();
sim.disableSafetySystems();

// Escenarios
sim.loadChernobylScenario();
sim.loadFukushimaScenario();

// Simulación
for (let i = 0; i < 1000; i++) {
  sim.step(0.01); // resolver 0.01 segundos
}

// Estado
const state = sim.getState();
console.log(state.power, state.temperature, state.pressure);
```

---

## 🏗️ Arquitectura

```
src/
├── App.jsx (componente principal + loop simulación)
├── utils/
│   ├── ReactorSimulator.js (motor de física)
│   └── ScoringSystem.js (puntuación + logros)
├── components/
│   ├── ControlPanel.jsx (botones + escenarios)
│   ├── Gauges.jsx (medidores + visualización)
│   └── Charts.jsx (gráficas Recharts)
├── index.css (Tailwind + animaciones custom)
└── main.jsx (entry point)
```

---

## 🔗 Referencias Técnicas

### Ingeniería Nuclear
- Todreas & Kazimi: Nuclear Engineering - Theory and Technology
- Lilley: Fundamentals of Nuclear Science and Engineering
- IAEA: Nuclear Safety Guides

### Accidentes Nucleares (Educativo)
- Chernobyl: Disablement of safety systems + RBMK design flaw
- Fukushima: Station blackout + loss of active cooling
- TMI-2: Cooling system failure detection delay

### Solvers Numéricos
- Hairer & Wanner: Solving Ordinary Differential Equations
- Press et al: Numerical Recipes in C

---

## 👨‍💻 Autor

**MrProphecy (Viking)**
- Cloud Infrastructure & Cybersecurity Architect
- 15+ años experiencia IT
- GitHub: [@MrProphecy](https://github.com/MrProphecy)
- Portfolio: [vikingproject.com](https://vikingproject.com)

---

## 📄 Licencia

MIT License - Libre para educación, investigación y uso personal.

```
Copyright (c) 2026 MrProphecy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, and distribute copies of the Software...
```

---

## 🎯 Roadmap Futuro

- [ ] Escenario Three Mile Island
- [ ] Sistema de xenón (envenenamiento neutrónico)
- [ ] Dinámica 3D del reactor (heat distribution map)
- [ ] Multiplayer: compite con amigos
- [ ] Leaderboard global
- [ ] WebGL para visualización 3D del núcleo
- [ ] VR mode (HTC Vive, Meta Quest)
- [ ] Audio realista (alarmas, ventiladores)
- [ ] Certificación educativa (IAEA)

---

**⚛️ Built with React + Vite + Tailwind | Deployed on Vercel | Educational Purpose Only**

**Construido para aprender física nuclear jugando. Diviértete pero aprende.**

