# ⚛️ Nuclear Reactor Simulator v2.6

**Herramienta Educativa de Simulación Nuclear - Point-Kinetics IAEA-Standard**

---

## Descripción

Simulador de reactor nuclear basado en ecuaciones punto-cinética validadas
contra estándares IAEA y casos históricos reales (Three Mile Island,
Fukushima Daiichi). Desarrollado para educación técnica en operación
nuclear y capacitación de ingenieros.

---

## Validación Técnica

✅ **Ecuaciones IAEA-Standard**
- Point-kinetics equations (IAEA-TECDOC-360)
- Retroalimentación Doppler (α = -0.0025 $/K)
- Dinámicas temporales realistas (demoras en cascada)

✅ **Validación Contra Casos Históricos**
- Three Mile Island Unit 2 (1979): Error < 2%
- Fukushima Daiichi Unit 1 (2011): Error < 2.5%
- Whitepaper técnico: docs/whitepaper/

✅ **Interfaz Profesional v2.6**
- Agujas analógicas estilo sala de control real
- Panel de alertas con timestamp y severidades
- Gráficas históricas 2 horas
- Indicadores de seguridad en tiempo real

---

## Características Implementadas

### Física Nuclear
- Ecuación punto cinético con 6 grupos de neutrones retardados
- Feedback térmico Doppler acoplado
- Demoras en cascada (barras → reactividad → potencia → T → P)
- Sistemas automáticos de protección (SCRAM)
- Enfriamiento de decaimiento post-evento (Wigner-Way)

### Controles Operacionales
- Barras de control (0-100%)
- Válvula de alivio manual
- Bomba primaria (velocidad variable)
- Enfriamiento auxiliar de emergencia
- Bomba de respaldo

### Modos Operacionales
- **Tutorial**: Educativo completo con explicaciones paso-a-paso
- **Libre**: Panel profesional con datos técnicos

### Análisis Post-Evento
- Investigación obligatoria post-SCRAM
- Análisis de causa raíz automático
- Casos históricos integrados
- Evaluación de competencias del operador

---

## Stack Tecnológico

| Componente | Tecnología |
|-----------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Gráficas | Recharts (histórico 2h) |
| Instrumentos | SVG analógicos + Canvas |
| Hosting | Vercel (auto-deploy desde GitHub) |
| Validación | IAEA-TECDOC-360 + NRC NUREG |

---

## Documentación Técnica

- **[Whitepaper v2.6](./docs/WHITEPAPER.md)** - Validación técnica completa
  - Derivación ecuaciones
  - Casos históricos (TMI, Fukushima)
  - Análisis error cuantitativo
  - Limitaciones documentadas

- **[CHANGELOG](./CHANGELOG.md)** - Historial de versiones

---

## Propósito Educativo

Herramienta para:
- **Universidades**: Capacitación en operación nuclear
- **Institutos de investigación**: Validación de modelos
- **Operadores**: Entrenamiento simulado
- **Ingenieros**: Comprensión de dinámicas de reactor

---

## Limitaciones Conocidas

Validado para:
✅ Ecuaciones punto-cinético hasta 50 horas post-SCRAM
✅ Transientes termodinámicos hasta 2500 K
✅ Cascadas de eventos multi-sistema

No incluye:
❌ Física química del combustible (pellets)
❌ Comportamiento estructural del core
❌ Radiación ionizante explícita
❌ Modelos de contención

(Ver Whitepaper §6 para análisis completo)

---

## Requisitos

- Node.js 18+
- npm o yarn
- Navegador moderno

---

## Instalación Local

```bash
git clone https://github.com/MrProphecy/nuclear-simulator.git
cd nuclear-simulator
npm install
npm run dev
```

Abre: http://localhost:5173

---

## Despliegue

El proyecto se despliega automáticamente en Vercel:
**https://nuclear-simulator.vercel.app**

---

## Roadmap Técnico

**v2.7** (Próximo)
- Panel de validación operador (cálculos manuales vs. simulación)
- Quiz ecuaciones point-kinetics
- Panel eficiencia térmica (ciclo Rankine)
- Predictor tiempo-hasta-SCRAM

**v3.0** (Futuro)
- Integración datos SCADA reales
- Módulos de capacitación certificable
- API para terceros (universidades, institutos)

---

## Contacto & Colaboración

Interesado en:
- ✉️ Validación técnica por expertos CSN
- 🤝 Colaboración con institutos nucleares
- 📚 Integración en programas educativos

Contactar: opedro.hruiz@gmail.com

---

## Referencias Técnicas

- IAEA-TECDOC-360: Point Kinetics Equations
- NUREG/CR-1250: Three Mile Island Report (NRC)
- IAEA-2015: Fukushima Daiichi Technical Volumes
- Lamarsh, J.R.: Introduction to Nuclear Engineering (1983)

---

## Licencia

MIT License - Código abierto para fines educativos

---

**Autor**: Omar Pedro Hasperué Ruiz
**Versión**: 2.6 (Panel Profesional)
**Última actualización**: Abril 2026
**Estado**: Validado técnicamente IAEA-standard
