import React from 'react';
import { Radio, BookOpen } from 'lucide-react';

export function WelcomeModal({ onStartTutorial, onSkip }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-yellow-500 p-8 max-w-lg w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Radio className="w-16 h-16 text-yellow-500 reactor-core" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Bienvenido al Simulador Nuclear Educativo
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            En este simulador aprenderás cómo funciona una central nuclear real,
            qué instrumentos se usan, y cómo mantener la reacción controlada de forma segura.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: '⚡', label: 'Física realista' },
            { icon: '📚', label: 'Tutorial guiado' },
            { icon: '🏆', label: 'Logros y puntos' },
          ].map(({ icon, label }) => (
            <div key={label} className="bg-slate-700/50 rounded-lg p-3 text-center">
              <p className="text-2xl mb-1">{icon}</p>
              <p className="text-xs text-slate-300">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onStartTutorial}
            className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/25"
          >
            <BookOpen className="w-5 h-5" />
            Empezar Tutorial
          </button>
          <button
            onClick={onSkip}
            className="flex-1 bg-slate-600 hover:bg-slate-500 text-slate-200 font-bold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Saltar Tutorial
          </button>
        </div>
        <p className="text-center text-slate-500 text-xs mt-3">
          Puedes activar el tutorial en cualquier momento con el botón en la cabecera
        </p>
      </div>
    </div>
  );
}
