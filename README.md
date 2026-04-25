# ⚛️ Nuclear Reactor Simulator v2.4

**Simulador Nuclear Educativo Realista para Capacitación de Operadores**

---

## 🎯 Descripción

Plataforma educativa interactiva que enseña operación de reactores nucleares con **física realista**, **eventos dinámicos**, **análisis de riesgo en tiempo real** y **sistemas de control avanzados**.

Validado para:
- 📚 Enseñanza universitaria de física nuclear e ingeniería
- 👨‍🔬 Capacitación de operadores de centrales nucleares
- 🏢 Instituciones de investigación nuclear
- 🎓 Formación en procedimientos de seguridad

**Diferencia:** No es un entretenimiento. Es una herramienta profesional de capacitación que simula el comportamiento REAL de un reactor nuclear con controles y sistemas certificados.

---

## ✨ Características v2.4 (Sistemas Avanzados + Análisis de Riesgo)

### Dinámicas Realistas
- ⏱️ **Demoras en cascada** - Los cambios toman 30-60 segundos en propagarse (como en realidad)
- 🌡️ **Retroalimentación térmica automática** - El reactor se autocontrola mediante efecto Doppler
- 🔄 **Sistemas acoplados** - Cambiar un parámetro afecta a todos los demás
- 🎲 **Eventos dinámicos aleatorios** - Emergencias realistas ocurren sin avisar

### Controles Realistas (4 nuevos sistemas)
- 🎛️ **Válvula de Alivio** - Slider manual para alivio de presión
- ⚙️ **Bomba Primaria Velocidad** - Control de flujo de refrigeración
- ❄️ **Enfriamiento Auxiliar** - Sistema de respaldo de emergencia
- 🔄 **Bomba de Respaldo** - Redundancia de seguridad

### Análisis de Riesgo en Tiempo Real
- 📊 **Panel de Riesgo** - Monitoreo en vivo de riesgos por sistema
- 🎯 **Riesgo Específico** - Potencia, Temperatura, Presión, Flujo separados
- ⚠️ **Predicción de Cascada** - Qué pasará en próximos 60 segundos
- 📈 **Análisis Post-Evento** - Causa raíz, cascada de efectos, lecciones aprendidas

### Dos Modos Diferenciados
- **MODO TUTORIAL**: Completo, educativo, explicativo
  - Mensajes detallados con "por qué"
  - Panel de riesgo completo
  - Timeline de cascada visible
  - Casos históricos reales
  - Guía paso a paso
  
- **MODO LIBRE**: Profesional, compacto, técnico
  - Mensajes concisos
  - Panel de riesgo mini
  - Solo datos necesarios
  - Sin explicaciones extra
  - Para operadores formados

### Mensajes Mejorados (Específicos y Claros)
- ✅ Directivas claras ("Mueve HACIA LA IZQUIERDA porque...")
- ✅ Explicación de efectos inmediatos
- ✅ Predicción de consecuencias (30 seg, 60 seg)
- ✅ Recomendaciones de acción
- ✅ Casos históricos como referencia

### Educación Semi-Profesional
- 📖 **Tooltips explicativos** - Cada acción explica el "por qué" es importante
- 🎓 **Panel "Aprende más"** - Glosario, conceptos, ecuaciones universitarias
- 📊 **Historial de auditoría** - Registro completo: quién hizo qué, cuándo, por qué
- 🌡️ **Múltiples zonas de temperatura** - Desequilibrio visible en núcleo

### Seguridad Nuclear Integrada
- 🔴 **Válvula de alivio automática** - Se abre cuando presión > 155 bar (protección pasiva)
- ⚠️ **Indicadores de seguridad** - Temperatura, presión, flujo monitoreados en tiempo real
- 📋 **SCRAM automático** - Detenida automática cuando temperatura > 600K
- 🎯 **Limitaciones operacionales** - Velocidades reales de cambio (no puedes acelerar la física)

### Tutorial Interactivo
- 7 pasos guiados: Verificación → Encendido → Operación → Cierre
- Feedback educativo en cada paso
- Explicaciones de "por qué" cada cosa importa
- Historial visual de progreso

### Validación Científica
- ✅ Ecuaciones de punto cinético (IAEA-standard)
- ✅ Retroalimentación térmica Doppler (física verificada)
- ✅ Procedimientos operacionales (CSN España)
- ✅ Casos históricos (Chernobyl, Fukushima, Three Mile Island)
- ✅ Sistemas de control reales (4 controles profesionales)

---

## 🚀 Demo en Vivo

**Accede ahora (gratis):** https://nuclear-simulator.vercel.app

No requiere registro. Inicia tu sesión de capacitación inmediatamente.

---

## 📋 Stack Técnico

| Componente | Tecnología | Justificación |
|---|---|---|
| Frontend | React 18 + Vite | Reactividad en tiempo real |
| Física | JavaScript (EDPs) | Ecuaciones diferenciales acopladas |
| Gráficas | Recharts | Monitoreo dinámico de parámetros |
| Análisis Riesgo | Custom Math Engine | Cálculo de riesgos realista |
| Hosting | Vercel | Deploy automático, sin servidor |
| Licencia | MIT | Código abierto |

---

## 🎓 Para Educadores / Instituciones

### Nivel 1: Estudiantes de Secundaria
Objetivo: Entender "qué es una fisión nuclear"
- Comprenden cómo se controla un reactor
- Observan consecuencias de errores operacionales
- Aprenden por qué existen protecciones
- Modo: Tutorial activado

### Nivel 2: Estudiantes Universitarios (Ingeniería Nuclear)
Objetivo: Aprender ecuaciones de punto cinético + procedimientos reales
- Operan reactor realista
- Responden a emergencias técnicas
- Entienden matemática detrás de la física
- Analizan riesgos en cascada
- Modo: Tutorial + análisis de riesgos

### Nivel 3: Operadores / Inspectores Certificados
Objetivo: Validar competencias operacionales
- Practican procedimientos operacionales reales
- Responden a eventos dinámicos complejos
- Manejan sistemas de control avanzado
- Analizan causa raíz de incidentes
- Modo: Libre (profesional)

---

## 💡 ¿Por qué Este Simulador es Diferente?

| Simulador Típico | Este Simulador |
|---|---|
| Cambios instantáneos | Demoras realistas (30-60 seg) |
| Sistemas independientes | Sistemas acoplados (interdependientes) |
| 1-2 controles | 5 controles reales profesionales |
| Eventos fijos | Eventos dinámicos (aleatorios) |
| Sin análisis de riesgo | Análisis de riesgo en tiempo real + cascada |
| Sin explicación | Explicación educativa en cada paso |
| Simplificado | Física verificada + IAEA-standard |
| Entretenimiento | Capacitación profesional |

**Resultado:** Operadores reales reconocen el simulador como herramienta profesional.

---

## 📚 Documentación Completa

- **[Fundamentos Nucleares](./docs/FUNDAMENTOS.md)** - Introducción a física nuclear
- **[Manual de Usuario](./docs/MANUAL_USUARIO.md)** - Guía paso a paso
- **[Guía de Instalación Local](./docs/INSTALACION.md)** - Cómo ejecutar en tu PC
- **[Ecuaciones Científicas](./docs/ECUACIONES.md)** - Matemática detrás del simulador
- **[Referencias](./docs/REFERENCIAS.md)** - Fuentes, papers, estándares IAEA
- **[Casos de Estudio](./docs/CASOS_ESTUDIO.md)** - Chernobyl, Fukushima, TMI

---

## 🚀 Próximas Versiones

**v2.5 (Junio 2026):** Validación Manual y Cálculos
- Panel de cálculo para verificar eficiencia
- Evaluación de competencias
- Validación manual vs automática

**v2.6 (Julio 2026):** Modo Multiplayer
- Comunicación entre operadores
- Roles diferentes (control, monitoreo, supervisor)
- Simulaciones coordinadas

**v3.0 (Agosto 2026):** Plataforma Educativa Completa
- Módulos 0-6 (Fundamentos → Operación Avanzada)
- Certificaciones reconocibles
- API para instituciones

---

## 👨‍💼 Para Instituciones Nucleares / Universidades

¿Interesado en integrar este simulador en tu programa de capacitación?

**Contacto:** opedro.hruiz@gmail.com

Disponible:
- 📋 Licencia institucional (€5,000-50,000/año)
- 🔧 Customización para tu central/departamento
- 📚 Módulos educativos adicionales (Física, Operación, Emergencias)
- ✅ Validación por expertos en seguridad nuclear (CSN)
- 👨‍🏫 Capacitación para docentes

---

## 🤝 Créditos

**Desarrollado por:** MrProphecy (Omar Pedro Hasperué Ruiz)

**Basado en:** IAEA Safety Standards, CSN (Consejo de Seguridad Nuclear España)

**Validación:** Consultor externo - Especialista en Seguridad Nuclear

**Open Source:** MIT License - Contribuciones bienvenidas

---

## 📄 Licencia

MIT License - Libre de usar en educación, investigación, y proyectos comerciales.

Ver [LICENSE](./LICENSE) para detalles completos.

---

## 📊 Características Técnicas Avanzadas

### Sistema de Cálculo de Riesgos
Risk_Total = 0.3×Risk_Power + 0.4×Risk_Temperature +
0.2×Risk_Pressure + 0.1×Risk_Flow
Riesgos específicos calculados en tiempo real
Predicción de cascada a 60 segundos
Análisis post-evento automático

### Interacciones Realistas Entre Controles
- Válvula de alivio reduce presión + flujo
- Bomba primaria controla flujo + temperatura
- Enfriamiento auxiliar baja temperatura directamente
- Bomba respaldo suma flujo adicional

### Detección Automática de Eventos
- Vibración en bomba (falla inminente)
- Radiactividad detectada (filtro degradado)
- Presión spike (cierre de válvula)
- Flujo bajo (LOCA incipiente)
- Y más...

---

**⚛️ Simula. Aprende. Comprende. Seguridad.**

**Herramienta Profesional de Capacitación Nuclear**

Last Updated: 2026-04-25
Version: v2.4 Sistemas Avanzados