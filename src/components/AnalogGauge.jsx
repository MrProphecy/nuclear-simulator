import React from 'react';

// Helper: convert gauge angle (-135..+135) to SVG (cx,cy)
const polarToCartesian = (cx, cy, r, gaugeDeg) => {
  const rad = (gaugeDeg - 90) * Math.PI / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

// Build SVG arc path going clockwise from startGaugeDeg to endGaugeDeg
const describeArc = (cx, cy, r, startDeg, endDeg) => {
  const start = polarToCartesian(cx, cy, r, startDeg);
  const end = polarToCartesian(cx, cy, r, endDeg);
  const cwSpan = ((endDeg - startDeg) + 360) % 360;
  if (cwSpan < 0.5) return '';
  const largeArc = cwSpan > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
};

const GAUGE_START = -135;
const GAUGE_END = 135;

/**
 * AnalogGauge — SVG needle gauge component.
 *
 * Props:
 *   label        - displayed below gauge
 *   value        - current value
 *   min / max    - range
 *   unit         - unit string shown in digital readout
 *   warningAt    - value where yellow zone starts (or ends if invertZones)
 *   dangerAt     - value where red zone starts (or ends if invertZones)
 *   invertZones  - when true, LOW is dangerous (e.g. coolant flow)
 *   size         - SVG canvas size in px (default 170)
 */
const AnalogGauge = ({
  label,
  value,
  min = 0,
  max = 100,
  unit = '',
  warningAt,
  dangerAt,
  invertZones = false,
  size = 170,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;

  const valueToGaugeDeg = (v) => {
    const pct = Math.max(0, Math.min(1, (v - min) / (max - min)));
    return GAUGE_START + pct * (GAUGE_END - GAUGE_START);
  };

  const currentAngle = valueToGaugeDeg(value);

  // Determine needle + active-arc color
  const getColor = () => {
    if (invertZones) {
      if (dangerAt !== undefined && value <= dangerAt) return '#ef4444';
      if (warningAt !== undefined && value <= warningAt) return '#f59e0b';
      return '#22c55e';
    }
    if (dangerAt !== undefined && value >= dangerAt) return '#ef4444';
    if (warningAt !== undefined && value >= warningAt) return '#f59e0b';
    return '#22c55e';
  };
  const color = getColor();

  // Background zone angles
  let greenStart, greenEnd, yellowStart, yellowEnd, redStart, redEnd;
  if (!invertZones) {
    greenStart  = GAUGE_START;
    greenEnd    = warningAt !== undefined ? valueToGaugeDeg(warningAt) : GAUGE_END;
    yellowStart = warningAt !== undefined ? valueToGaugeDeg(warningAt) : null;
    yellowEnd   = dangerAt  !== undefined ? valueToGaugeDeg(dangerAt)  : null;
    redStart    = dangerAt  !== undefined ? valueToGaugeDeg(dangerAt)  : null;
    redEnd      = GAUGE_END;
  } else {
    // invertZones: red is low, green is high
    redStart    = GAUGE_START;
    redEnd      = dangerAt  !== undefined ? valueToGaugeDeg(dangerAt)  : null;
    yellowStart = dangerAt  !== undefined ? valueToGaugeDeg(dangerAt)  : null;
    yellowEnd   = warningAt !== undefined ? valueToGaugeDeg(warningAt) : null;
    greenStart  = warningAt !== undefined ? valueToGaugeDeg(warningAt) : GAUGE_START;
    greenEnd    = GAUGE_END;
  }

  // Tick marks
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const gDeg = GAUGE_START + i * ((GAUGE_END - GAUGE_START) / 10);
    const major = i % 5 === 0;
    const rInner = r * (major ? 0.80 : 0.88);
    const rOuter = r * 1.03;
    const inner = polarToCartesian(cx, cy, rInner, gDeg);
    const outer = polarToCartesian(cx, cy, rOuter, gDeg);
    return { ...inner, x2: outer.x, y2: outer.y, major };
  });

  // Needle
  const needleLen = r * 0.76;
  const needle = polarToCartesian(cx, cy, needleLen, currentAngle);

  const displayValue = Math.abs(value) >= 1000
    ? value.toFixed(0)
    : Math.abs(value) >= 100
    ? value.toFixed(0)
    : value.toFixed(1);

  return (
    <div className="flex flex-col items-center bg-slate-800 border border-slate-600 rounded-xl p-2">
      <svg
        width={size}
        height={Math.round(size * 0.82)}
        viewBox={`0 0 ${size} ${Math.round(size * 0.82)}`}
      >
        {/* Bezel */}
        <circle cx={cx} cy={cy} r={r + 14} fill="#0f172a" stroke="#1e293b" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={r + 11} fill="none" stroke="#334155" strokeWidth="1" />

        {/* Background zone arcs (thick, dim) */}
        {greenStart !== null && greenEnd !== null && (
          <path
            d={describeArc(cx, cy, r, greenStart, greenEnd)}
            fill="none" stroke="#166534" strokeWidth="11" strokeLinecap="butt" opacity="0.65"
          />
        )}
        {yellowStart !== null && yellowEnd !== null && (
          <path
            d={describeArc(cx, cy, r, yellowStart, yellowEnd)}
            fill="none" stroke="#92400e" strokeWidth="11" strokeLinecap="butt" opacity="0.65"
          />
        )}
        {redStart !== null && redEnd !== null && (
          <path
            d={describeArc(cx, cy, r, redStart, redEnd)}
            fill="none" stroke="#7f1d1d" strokeWidth="11" strokeLinecap="butt" opacity="0.65"
          />
        )}

        {/* Active value arc (thin, bright) */}
        {!invertZones && currentAngle > GAUGE_START && (
          <path
            d={describeArc(cx, cy, r, GAUGE_START, currentAngle)}
            fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"
          />
        )}
        {invertZones && currentAngle < GAUGE_END && (
          <path
            d={describeArc(cx, cy, r, currentAngle, GAUGE_END)}
            fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"
          />
        )}

        {/* Tick marks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x} y1={t.y} x2={t.x2} y2={t.y2}
            stroke={t.major ? '#94a3b8' : '#475569'}
            strokeWidth={t.major ? 2 : 1}
          />
        ))}

        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={needle.x} y2={needle.y}
          stroke={color} strokeWidth="2.5" strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="6" fill={color} />
        <circle cx={cx} cy={cy} r="3" fill="#0f172a" />

        {/* Digital readout */}
        <rect
          x={cx - 38} y={cy + r * 0.36}
          width="76" height="22" rx="4"
          fill="#0f172a" stroke="#334155" strokeWidth="1"
        />
        <text
          x={cx} y={cy + r * 0.36 + 15}
          textAnchor="middle"
          fill="white"
          fontSize={size * 0.1}
          fontFamily="monospace"
          fontWeight="bold"
        >
          {displayValue} {unit}
        </text>
      </svg>
      <p className="text-xs font-bold text-slate-300 uppercase tracking-widest text-center mt-1 pb-1">
        {label}
      </p>
    </div>
  );
};

export { AnalogGauge };
export default AnalogGauge;
