import React from 'react';

export function WelcomeModal({ onStartTutorial, onFreeMode }) {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-slate-600 p-8 max-w-lg w-full shadow-2xl">

        {/* Icono y título */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">⚛️</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Bienvenido al Simulador Nuclear Educativo
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            En este simulador aprenderás cómo funciona una central nuclear real.
            Entenderás los parámetros de funcionamiento, cómo se enciende un reactor,
            y cómo mantener la reacción nuclear controlada de forma segura.
          </p>
          <p className="text-slate-300 text-sm leading-relaxed mt-3 font-medium">
            ¿Prefieres que te guiemos paso a paso, o prefieres explorar libremente?
          </p>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={onStartTutorial}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
          >
            <span className="text-lg">📚</span>
            Empezar con Tutorial Guiado
          </button>
          <button
            onClick={onFreeMode}
            className="flex-1 bg-slate-600 hover:bg-slate-500 text-slate-200 font-bold py-3 px-5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span className="text-lg">🚀</span>
            Modo Libre
          </button>
        </div>

        {/* Nota al pie */}
        <p className="text-center text-slate-500 text-xs mt-4">
          Puedes cambiar el modo en cualquier momento con el toggle "Modo Tutorial"
        </p>
      </div>
    </div>
  );
}
