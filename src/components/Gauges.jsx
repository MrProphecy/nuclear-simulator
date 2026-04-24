import React from 'react';

export function GaugeCard({ label, value, unit, max, color, icon: Icon }) {
  const percentage = Math.min((value / max) * 100, 100);
  const isWarning = percentage > 75;
  const isCritical = percentage > 90;

  const bgColor = isCritical ? 'bg-red-900' : isWarning ? 'bg-yellow-900' : 'bg-slate-800';
  const barColor = isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : color;
  const textColor = isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className={`${bgColor} rounded-lg p-4 border border-slate-700`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-slate-400 text-sm font-semibold">{label}</p>
        {Icon && <Icon className="w-5 h-5 text-slate-500" />}
      </div>
      <p className={`text-3xl font-bold ${textColor}`}>
        {typeof value === 'number' ? value.toFixed(1) : value}
      </p>
      <p className="text-xs text-slate-500 mt-1">{unit}</p>
      <div className="mt-3 w-full bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-2">{percentage.toFixed(0)}% del límite</p>
    </div>
  );
}

export function ReactorCoreVisualization({ power, temperature, pressure, coolantFlow }) {
  const glow = Math.min(power / 1000, 1) * 100;

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h3 className="text-lg font-bold text-white mb-4">NÚCLEO DEL REACTOR</h3>
      
      <div className="flex justify-center items-center">
        <div className="relative w-48 h-48">
          {/* Glow effect */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(239, 68, 68, ${glow / 200}), rgba(239, 68, 68, 0))`,
              filter: `blur(${glow / 4}px)`
            }}
          />
          
          {/* Reactor core */}
          <div
            className="absolute inset-0 rounded-full border-4 border-yellow-500 flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, rgba(234, 179, 8, 0.3), rgba(234, 179, 8, 0.1))`,
              animation: `pulse ${2 + (power / 1000) * 1}s infinite`
            }}
          >
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{Math.floor(power)}</p>
              <p className="text-xs text-yellow-300">MW</p>
            </div>
          </div>

          {/* Información radial */}
          <div className="absolute -bottom-20 left-0 right-0 text-center text-xs">
            <p className="text-blue-400">T: {temperature.toFixed(0)}K</p>
            <p className="text-cyan-400">P: {pressure.toFixed(1)}bar</p>
            <p className="text-purple-400">Q: {coolantFlow.toFixed(0)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AchievementBadge({ achievement, isNew }) {
  return (
    <div
      className={`p-3 rounded-lg border-2 transition-all ${
        isNew ? 'bg-yellow-900 border-yellow-500 shadow-lg shadow-yellow-500' : 'bg-slate-800 border-slate-600'
      }`}
    >
      <p className="font-bold text-sm">{achievement.name}</p>
      <p className="text-xs text-slate-400 mt-1">{achievement.desc}</p>
      <p className="text-xs text-yellow-400 mt-2">+{achievement.points} pts</p>
    </div>
  );
}

export function ScoreBoard({ score, level, timeElapsed, achievements }) {
  return (
    <div className="bg-gradient-to-r from-purple-900 to-slate-800 rounded-lg p-6 border border-purple-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <p className="text-slate-400 text-sm">PUNTUACIÓN</p>
          <p className="text-3xl font-bold text-yellow-400">{Math.floor(score).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-400 text-sm">NIVEL</p>
          <p className="text-3xl font-bold text-purple-400">{level}</p>
        </div>
        <div>
          <p className="text-slate-400 text-sm">TIEMPO</p>
          <p className="text-3xl font-bold text-cyan-400">{Math.floor(timeElapsed)}s</p>
        </div>
        <div>
          <p className="text-slate-400 text-sm">LOGROS</p>
          <p className="text-3xl font-bold text-green-400">{achievements.length}</p>
        </div>
      </div>

      {/* Barra de progreso al siguiente nivel */}
      <div className="mb-4">
        <p className="text-xs text-slate-400 mb-2">Progreso al próximo nivel</p>
        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
            style={{ width: `${((score % 1000) / 1000) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
