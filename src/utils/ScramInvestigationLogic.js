export const SCRAM_TYPE_DETAILS = {
  SCRAM_AUTO_TEMP: {
    type: 'SCRAM_AUTO_TEMP',
    title: 'SCRAM por Temperatura',
    triggerDesc: 'Temperatura del núcleo superó 600K (límite de seguridad)',
    primaryError: 'La potencia aumentó demasiado rápido — la refrigeración no pudo seguir el ritmo térmico',
    howToAvoid: [
      'Sube potencia en escalones de máximo 100 MW',
      'Espera 60 segundos entre cada cambio para que la temperatura se estabilice',
      'Si T > 500K: inserta barras de control inmediatamente',
      'Si T sube > 10K/minuto: reduce potencia sin dudar',
    ],
    realWorldCase: 'Three Mile Island (1979): el operador no entendía el estado del reactor tras el SCRAM. Pasó horas confundido, lo que causó pérdida de refrigerante y fusión parcial del núcleo.',
    systems: [
      { name: 'Barras de control', expected: '100% insertadas', ok: true },
      { name: 'Refrigeración primaria', expected: '100% activa', ok: true },
      { name: 'Válvula de alivio', expected: 'Cerrada tras alivio', ok: true },
      { name: 'Potencia del reactor', expected: '0 MW (reacción detenida)', ok: true },
    ],
  },
  SCRAM_AUTO_PRESS: {
    type: 'SCRAM_AUTO_PRESS',
    title: 'SCRAM por Presión',
    triggerDesc: 'Presión del circuito primario superó 160 bar (límite estructural)',
    primaryError: 'La presión es consecuencia de la temperatura — sin controlar T, la presión se disparó',
    howToAvoid: [
      'Controla temperatura para controlar presión automáticamente',
      'Si presión > 157 bar: reduce potencia inmediatamente',
      'La válvula de alivio protege pero reduce el flujo de refrigerante',
      'El SCRAM de presión siempre indica un error previo de temperatura',
    ],
    realWorldCase: 'Los accidentes por sobrepresión en reactores generalmente son consecuencia de errores de gestión térmica previos. La presión es un indicador tardío del problema.',
    systems: [
      { name: 'Barras de control', expected: '100% insertadas', ok: true },
      { name: 'Válvula de alivio', expected: 'Actuó automáticamente', ok: true },
      { name: 'Refrigeración primaria', expected: 'Activa y verificada', ok: true },
      { name: 'Integridad estructural', expected: 'Sin brechas detectadas', ok: true },
    ],
  },
  SCRAM_AUTO_FLOW: {
    type: 'SCRAM_AUTO_FLOW',
    title: 'SCRAM por Flujo Crítico',
    triggerDesc: 'Flujo de refrigerante cayó por debajo de 30% — umbral de SCRAM automático',
    primaryError: 'Sin refrigeración adecuada, el calor residual puede fundir el combustible incluso sin fisión activa',
    howToAvoid: [
      'Nunca apagues la bomba principal sin activar el respaldo primero',
      'Con flujo < 70%: activa bomba de respaldo inmediatamente',
      'Mantén flujo > 80% durante toda la operación normal',
      'El calor de decaimiento dura horas — la refrigeración siempre es necesaria tras el SCRAM',
    ],
    realWorldCase: 'Fukushima (2011): el SCRAM funcionó perfectamente al detectar el terremoto. El desastre fue causado porque el tsunami destruyó los generadores que alimentaban las bombas de refrigeración de emergencia.',
    systems: [
      { name: 'Barras de control', expected: '100% insertadas', ok: true },
      { name: 'Bomba principal', expected: 'Verificar estado', ok: false },
      { name: 'Bomba de respaldo', expected: 'Activar si necesario', ok: false },
      { name: 'Nivel de refrigerante', expected: 'Verificar presurización', ok: true },
    ],
  },
  SCRAM_MANUAL: {
    type: 'SCRAM_MANUAL',
    title: 'SCRAM Manual del Operador',
    triggerDesc: 'El operador activó el SCRAM de emergencia manualmente',
    primaryError: 'Buen instinto profesional — decidiste parar antes de que la situación empeorara',
    howToAvoid: [
      'El SCRAM manual es la decisión más importante de un operador nuclear',
      'Analiza qué condición te llevó a activarlo y documenta la causa',
      'Un SCRAM preventivo limpio es mucho mejor que esperar al SCRAM automático',
      'Esta es exactamente la mentalidad de seguridad que se espera',
    ],
    realWorldCase: 'Los operadores experimentados de centrales nucleares están entrenados para activar el SCRAM manual ante cualquier duda. Es considerado señal de competencia, no de error.',
    systems: [
      { name: 'Barras de control', expected: '100% insertadas', ok: true },
      { name: 'Refrigeración primaria', expected: 'Activa y verificada', ok: true },
      { name: 'Todos los sistemas', expected: 'Respuesta normal', ok: true },
      { name: 'Estado del reactor', expected: 'Seguro y contenido', ok: true },
    ],
  },
};

export function getScramDetails(operationLog) {
  const lastScram = (operationLog ?? []).slice().reverse().find(op =>
    Object.keys(SCRAM_TYPE_DETAILS).includes(op.action)
  );
  return SCRAM_TYPE_DETAILS[lastScram?.action] ?? SCRAM_TYPE_DETAILS.SCRAM_MANUAL;
}

export const INVESTIGATION_STEPS = [
  {
    id: 'step1_cause',
    number: 1,
    title: 'Revisar causa del SCRAM',
    shortDesc: 'Analiza por qué se activó el sistema de protección',
    buttonLabel: 'Ver análisis de causa',
    completedLabel: 'Causa analizada y comprendida',
  },
  {
    id: 'step2_systems',
    number: 2,
    title: 'Verificar sistemas de seguridad',
    shortDesc: 'Confirma que barras, refrigeración y válvulas respondieron correctamente',
    buttonLabel: 'Verificar todos los sistemas',
    completedLabel: 'Sistemas verificados — todos OK',
  },
  {
    id: 'step3_logs',
    number: 3,
    title: 'Revisar historial de eventos',
    shortDesc: 'Lee el registro completo del incidente',
    buttonLabel: 'Ver historial completo',
    completedLabel: 'Historial revisado',
  },
  {
    id: 'step4_approved',
    number: 4,
    title: 'Aprobar procedimiento de reinicio',
    shortDesc: 'Confirma que entiendes qué pasó y cómo evitarlo',
    buttonLabel: 'Entiendo y apruebo el reinicio',
    completedLabel: 'Reinicio aprobado por el operador',
  },
];

export function isInvestigationComplete(steps) {
  return INVESTIGATION_STEPS.every(s => steps[s.id]);
}

export function investigationProgress(steps) {
  const done = INVESTIGATION_STEPS.filter(s => steps[s.id]).length;
  return Math.round((done / INVESTIGATION_STEPS.length) * 100);
}
