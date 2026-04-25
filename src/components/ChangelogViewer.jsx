import React, { useState } from 'react';

const ChangelogViewer = ({ tutorialMode = false }) => {
  const [expandedVersion, setExpandedVersion] = useState('v2.6');

  const changelog = [
    {
      version: 'v2.6',
      title: 'Panel Profesional',
      description: 'Agujas analógicas, gráficas de histórico (2h), alertas con timestamp',
      sections: {
        'Agregado': [
          'Agujas analógicas profesionales para todos los parámetros',
          'Gráficas avanzadas con histórico de últimas 2 horas',
          'Sistema de alertas profesional con timestamp',
          'Panel de instrumentación realista tipo sala de control',
          'CHANGELOG visualizable en la app'
        ],
        'Mejorado': [
          'Interface profesional con estética realista',
          'Performance de gráficas optimizado',
          'Responsive en múltiples resoluciones'
        ]
      }
    },
    {
      version: 'v2.5',
      title: 'Recuperación Post-SCRAM Realista',
      description: 'Enfriamiento de decaimiento, investigación obligatoria, cuenta regresiva',
      sections: {
        'Agregado': [
          'Sistema de enfriamiento de decaimiento realista',
          'Investigación obligatoria post-evento',
          'Cuenta regresiva educativa (2 horas para reinicio seguro)',
          'Análisis de cascada de eventos completo',
          'Riesgo de fusión si refrigeración falla'
        ],
        'Mejorado': [
          'Modal SCRAM más realista',
          'Predicción de cascada más precisa',
          'Error handling mejorado'
        ]
      }
    },
    {
      version: 'v2.4',
      title: 'Controles Avanzados + Análisis de Riesgo',
      description: 'Válvula de alivio, bomba velocidad, enfriamiento auxiliar, análisis de riesgo',
      sections: {
        'Agregado': [
          'Cuatro nuevos controles profesionales (Válvula, Bomba, Enfriamiento, Respaldo)',
          'Sistema de análisis de riesgo en tiempo real',
          'Mensajes específicos y directivos',
          'Dos modos completamente diferenciados (Tutorial vs Libre)'
        ],
        'Mejorado': [
          'Interface profesional (sin referencias a "juego")',
          'Interacciones realistas entre controles',
          'Detección automática de eventos dinámicos'
        ]
      }
    },
    {
      version: 'v2.3',
      title: 'Sistema Inteligente de Errores',
      description: 'Detección automática, bocadillos educativos, análisis post-error',
      sections: {
        'Agregado': [
          'Detección automática de errores operacionales',
          'Bocadillos explicativos inteligentes con casos históricos',
          'Análisis post-error detallado con causa raíz',
          'Sistema educativo sin "game over"'
        ],
        'Mejorado': [
          'ErrorDetector.js con lógica inteligente',
          'Logging automático de incidentes'
        ]
      }
    },
    {
      version: 'v2.2',
      title: 'Realismo Profundo',
      description: 'Dinámicas temporales, retroalimentación Doppler, eventos dinámicos',
      sections: {
        'Agregado': [
          'Dinámicas temporales realistas (demoras en cascada 30-60 seg)',
          'Retroalimentación térmica automática (Doppler)',
          'Sistemas acoplados (cambios afectan todo)',
          'Eventos dinámicos aleatorios realistas',
          'Múltiples zonas de temperatura',
          'Válvula de alivio automática',
          'Historial de auditoría completo'
        ],
        'Mejorado': [
          'Ecuaciones más precisas',
          'Simulación más fiel a física real'
        ]
      }
    },
    {
      version: 'v2.1',
      title: 'Profundidad Educativa + SCRAM Explicativo',
      description: 'Tooltips educativos, panel "Aprende más", SCRAM mejorado',
      sections: {
        'Agregado': [
          'Tooltips educativos interactivos',
          'Panel "Aprende más" expandible con glosario',
          'Modal SCRAM mejorado con casos históricos',
          'Indicadores de seguridad (Verde/Amarillo/Rojo)',
          'Tutorial de 7 pasos'
        ],
        'Mejorado': [
          'Sistema de tutorial mejorado',
          'Contenido educativo expandido'
        ]
      }
    },
    {
      version: 'v2.0',
      title: 'Fundamentos',
      description: 'Lanzamiento inicial con física realista, controles básicos, tutorial',
      sections: {
        'Agregado': [
          'React + Vite + Tailwind CSS',
          'Física nuclear realista (ecuación punto cinético)',
          'Controles básicos (Barras + Bomba)',
          'Gráficas en tiempo real',
          'Panel de estado',
          'Tutorial de 6 pasos',
          'Licencia MIT (código abierto)'
        ],
        'Validación': [
          'Ecuaciones verificadas contra IAEA standards',
          'Procedimientos según CSN (España)',
          'Comportamiento físicamente correcto'
        ]
      }
    }
  ];

  return (
    <div className="w-full bg-gray-900 p-4 rounded-lg border border-gray-700">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-blue-400 mb-2">Historial de Cambios</h2>
        <p className="text-sm text-gray-400">
          Evolución de Nuclear Reactor Simulator — Desde fundamentos hasta panel profesional
        </p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {changelog.map((entry) => (
          <div
            key={entry.version}
            className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpandedVersion(expandedVersion === entry.version ? null : entry.version)}
              className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-400">{entry.version}</span>
                  <span className="text-gray-400">—</span>
                  <span className="font-semibold text-white">{entry.title}</span>
                  {entry.version === 'v2.6' && (
                    <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded">ACTUAL</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">{entry.description}</p>
              </div>
              <span className="text-gray-400 text-lg flex-shrink-0 ml-2">
                {expandedVersion === entry.version ? '▼' : '▶'}
              </span>
            </button>

            {expandedVersion === entry.version && (
              <div className="px-4 py-3 bg-slate-800 border-t border-gray-700 text-sm text-gray-300 space-y-3">
                {Object.entries(entry.sections).map(([section, items]) => (
                  <div key={section}>
                    <p className="font-semibold text-yellow-400 mb-2">✨ {section}</p>
                    <ul className="space-y-1 ml-4">
                      {items.map((item, idx) => (
                        <li key={idx} className="flex gap-2 text-xs">
                          <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-900 bg-opacity-20 border border-blue-700 rounded text-xs text-blue-200">
        <p>
          <strong>Nota:</strong> Este changelog refleja la evolución desde v2.0 (fundamentos)
          hasta v2.6 (panel profesional). Cada versión añade complejidad realista y profundidad educativa.
        </p>
      </div>
    </div>
  );
};

export default ChangelogViewer;
