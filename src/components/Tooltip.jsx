import React, { useState } from 'react';

export function Tooltip({ text, children, position = 'top' }) {
  const [visible, setVisible] = useState(false);

  if (!text) return children;

  const posClass = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  };

  const arrowClass = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-900',
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={`absolute ${posClass[position]} z-50 pointer-events-none`}>
          <div className="bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded-lg px-3 py-2 shadow-xl max-w-xs text-center leading-relaxed">
            {text}
          </div>
          <div className={`absolute ${arrowClass[position]} border-4 border-transparent`} />
        </div>
      )}
    </div>
  );
}
