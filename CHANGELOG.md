# Changelog

Historial de versiones y mejoras de Nuclear Reactor Simulator.

## [v2.6] - Panel Profesional

### Agregado
- **Agujas analógicas profesionales** - Indicadores visuales tipo central nuclear real
  - Potencia (0-1000 MW)
  - Temperatura (0-600 K)
  - Presión (0-200 bar)
  - Flujo de refrigerante (0-100%)
- **Gráficas avanzadas con histórico** - Últimas 2 horas de datos
  - Potencia vs Temperatura
  - Presión vs Flujo
  - Límites de seguridad visualizados
  - Actualización en tiempo real
- **Sistema de alertas profesional** - Panel de eventos con timestamp
  - Alertas críticas, advertencias e información
  - Historial completo de eventos
  - Exportación de logs
- **Panel de instrumentación realista** - Interface estilo sala de control
  - Dos modos: Tutorial (educativo) y Profesional (compacto)
  - Indicadores de estado de sistemas auxiliares
  - Opciones de control (sonido, descargas, impresión)
- **CHANGELOG visualizable** - Historial de cambios accesible en la app

### Mejorado
- Interface general con estética profesional
- Compatibilidad tema oscuro/claro
- Performance de gráficas (sin lags)
- Responsive en múltiples resoluciones

### Técnico
- Nuevo componente AnalogGauge.jsx (SVG)
- Nuevo componente AdvancedCharts.jsx (Recharts avanzado)
- Nuevo componente ProfessionalAlertPanel.jsx
- Nuevo componente ChangelogViewer.jsx
- Sistema de histórico de datos (últimas 2 horas)
- Optimización de renders con useMemo

---

## [v2.5] - Recuperación Post-SCRAM Realista

### Agregado
- **Sistema de enfriamiento de decaimiento** - Calor residual realista después de SCRAM
  - Temperatura se disipa en ~2 horas (refrigeración activa)
  - Riesgo de fusión si refrigeración falla (2-4 horas hasta meltdown)
- **Investigación obligatoria post-evento** - Usuario debe entender qué pasó
  - Revisión de causa del SCRAM
  - Verificación de sistemas de seguridad
  - Análisis de logs de seguridad
  - Aprobación de reinicio
- **Cuenta regresiva educativa** - Timeline visual de enfriamiento
  - Predicción de temperatura cada 30 minutos
  - Tiempo estimado para reinicio seguro
  - Advertencias si refrigeración falla
- **Análisis de cascada de eventos** - Línea de tiempo completa del incidente
  - Causa raíz identificada
  - Efectos en cascada mostrados visualmente
  - Lecciones aprendidas
- **Mensajes educativos contextuales** - Explicación de calor residual
  - Analogía: horno apagado pero aún caliente
  - Importancia de refrigeración
  - Consecuencias de pérdida de refrigerante

### Mejorado
- Modal SCRAM más realista (datos técnicos)
- Indicadores de riesgo por sistema
- Predicción de 60 segundos más precisa
- Error handling mejorado

### Técnico
- DecayHeatCalculator.js (cálculos Wigner-Way)
- PostScramRecovery.jsx
- PostScramInvestigation.jsx
- DecayHeatVisualization.jsx
- ScramInvestigationLogic.js

---

## [v2.4] - Controles Avanzados + Análisis de Riesgo

### Agregado
- **Cuatro nuevos controles profesionales**
  - Válvula de Alivio Manual (0-100% apertura)
  - Bomba Primaria Velocidad (50-100% velocidad)
  - Enfriamiento Auxiliar (0-100% flujo)
  - Bomba de Respaldo (ON/OFF)
- **Sistema de análisis de riesgo en tiempo real**
  - Panel lateral que muestra riesgo por parámetro
  - Cálculo de riesgo total (fórmula realista)
  - Predicción de cascada a 60 segundos
- **Mensajes mejorados y específicos**
  - Directivas claras ("Mueve HACIA LA IZQUIERDA porque...")
  - Explicación de efectos inmediatos
  - Predicción de consecuencias (30 seg, 60 seg, futuro)
  - Recomendaciones de acción
- **Dos modos completamente diferenciados**
  - Modo Tutorial: Completo, educativo, explicativo
  - Modo Libre: Profesional, compacto, técnico

### Mejorado
- Interface profesional (lenguaje sin "juego")
- Interacciones realistas entre controles
- Detección automática de eventos dinámicos
- Sistema de tooltips contextuales

### Técnico
- RiskCalculator.js (cálculo de riesgos)
- AdvancedControls.jsx (4 nuevos sliders)
- RiskPanel.jsx (panel lateral)
- RiskTooltips.jsx (bocadillos educativos)
- CascadeTimeline.jsx (timeline visual)
- PostEventAnalysis.jsx (análisis completo)

---

## [v2.3] - Sistema Inteligente de Errores

### Agregado
- **Detección automática de errores** - Sistema que identifica problemas operacionales
  - Error: Subir potencia demasiado rápido
  - Error: Ignorar advertencias de temperatura
  - Error: Flujo bajo sin respuesta
  - Error: Presión no controlada
- **Bocadillos explicativos inteligentes**
  - ¿Qué pasó? (descripción clara)
  - ¿Por qué es un error? (explicación pedagógica)
  - ¿Qué pasó en el reactor? (consecuencias visibles)
  - ¿Qué deberías haber hecho? (instrucción correcta)
  - Caso histórico real (Three Mile Island, Fukushima, Chernobyl)
- **Análisis post-error detallado**
  - Línea de tiempo completa del evento
  - Causa raíz identificada
  - Riesgos que existieron en cada paso
  - Dónde falló la mitigación
  - Qué pudo haber pasado peor
- **Sistema educativo sin "game over"**
  - Los errores son oportunidades de aprendizaje
  - No hay castigo, solo feedback educativo
  - Usuario reintentar cuando entienda

### Mejorado
- ErrorDetector.js (detección inteligente)
- ErrorFeedback.jsx (bocadillos realistas)
- HistoricalCases.js (base de casos reales)
- PostEventAnalysis.jsx (análisis completo)

### Técnico
- Sistema de tolerancia de errores
- Detección basada en física (no arbitraria)
- Logging automático de incidentes
- Análisis de causa raíz

---

## [v2.2] - Realismo Profundo

### Agregado
- **Dinámicas temporales realistas**
  - Demoras en cascada (barras→reactividad→potencia→temp→presión)
  - Cada cambio toma 30-60 segundos (como en realidad)
- **Retroalimentación térmica automática (Doppler)**
  - Temperatura sube → Reactividad baja automáticamente
  - α_doppler = -0.0025 $/K (verificado IAEA)
  - Reactor se autocontrola
- **Sistemas acoplados**
  - Cambiar un parámetro afecta a todos los demás
  - Interacciones realistas (presión → flujo → temperatura)
- **Eventos dinámicos aleatorios**
  - Vibración en bomba (falla inminente)
  - Presión spike (cierre de válvula)
  - Radiactividad detectada (filtro degradado)
  - Flujo bajo (LOCA incipiente)
  - Thermostat glitch (sensor falla)
- **Múltiples zonas de temperatura**
  - Centro/Medio/Periferia del núcleo
  - Desequilibrio visible
- **Válvula de alivio automática**
  - Se abre a 155 bar automáticamente
  - Reduce presión y flujo
- **Historial de auditoría**
  - Logger.js registra todo (timestamp, acción, parámetros, razón)

### Mejorado
- Ecuaciones de punto cinético más precisas
- Cálculos de transferencia de calor mejorados
- Simulación más fiel a física real

### Técnico
- ReactorSimulator.js (ecuaciones avanzadas)
- EventGenerator.js (eventos dinámicos)
- Logger.js (auditoría completa)

---

## [v2.1] - Profundidad Educativa + SCRAM Explicativo

### Agregado
- **Tooltips educativos interactivos**
  - Cada parámetro tiene explicación
  - Tooltips en Potencia, Temperatura, Presión, Flujo, Barras, Bomba
- **Panel "Aprende más" expandible**
  - Glosario de términos nucleares
  - Cómo funciona un reactor paso a paso
  - Por qué cada parámetro importa
- **Modal SCRAM mejorado**
  - Explicación clara de por qué se activó
  - Qué significa (parada de emergencia)
  - Casos históricos (Chernobyl/TMI/Fukushima)
  - Checklist de recuperación
- **Indicadores de seguridad en tiempo real**
  - Verde/Amarillo/Rojo por parámetro
  - Visual claro del estado
- **Modal de bienvenida mejorado**
  - Elige "Tutorial Guiado" o "Modo Libre"
  - Persistencia en localStorage
- **7 pasos del tutorial**
  - Paso a paso guiado
  - Feedback en cada etapa

### Técnico
- TutorialSystem.js (sistema de pasos)
- EducationalContent.js (glosario y explicaciones)
- SafetyIndicators.jsx (indicadores)
- HistoricalCases.js (base de datos de casos reales)

---

## [v2.0] - Fundamentos

### Agregado
- **React + Vite + Tailwind CSS**
- **Física nuclear realista (ecuación punto cinético)**
- **Controles básicos (Barras + Bomba)**
- **Gráficas en tiempo real (Recharts)**
- **Panel de estado básico**
- **Tutorial de 6 pasos**
- **Validación científica (IAEA-standard)**

### Licencia
- MIT License (código abierto)

### Validación
- Ecuaciones verificadas contra IAEA standards
- Procedimientos según CSN (España)
- Comportamiento físicamente correcto
