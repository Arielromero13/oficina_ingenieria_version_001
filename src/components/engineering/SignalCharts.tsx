/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DeterministicEvaluation } from '../../types/engineering';

interface SignalChartsProps {
  evaluation: DeterministicEvaluation;
  waveform: { tMs: number; vab: number; vbc: number; vca: number }[];
}

export const SignalCharts: React.FC<SignalChartsProps> = ({ evaluation, waveform }) => {
  // Waveform SVG dimensions
  const waveWidth = 600;
  const waveHeight = 200;
  const padding = 30;

  // Find max voltage for Y scaling
  const maxV = 650; // nominal peak ~577 V
  const minV = -650;
  const vRange = maxV - minV;

  const scaleX = (tMs: number) => {
    // 0 to 40 ms
    return padding + (tMs / 40) * (waveWidth - 2 * padding);
  };

  const scaleY = (v: number) => {
    return waveHeight - padding - ((v - minV) / vRange) * (waveHeight - 2 * padding);
  };

  // Build SVG path strings
  let pathAb = '';
  let pathBc = '';
  let pathCa = '';

  waveform.forEach((p, index) => {
    const x = scaleX(p.tMs);
    const yAb = scaleY(p.vab);
    const yBc = scaleY(p.vbc);
    const yCa = scaleY(p.vca);

    if (index === 0) {
      pathAb = `M ${x.toFixed(1)} ${yAb.toFixed(1)}`;
      pathBc = `M ${x.toFixed(1)} ${yBc.toFixed(1)}`;
      pathCa = `M ${x.toFixed(1)} ${yCa.toFixed(1)}`;
    } else {
      pathAb += ` L ${x.toFixed(1)} ${yAb.toFixed(1)}`;
      pathBc += ` L ${x.toFixed(1)} ${yBc.toFixed(1)}`;
      pathCa += ` L ${x.toFixed(1)} ${yCa.toFixed(1)}`;
    }
  });

  // Harmonics bar chart dimensions
  const barWidth = 600;
  const barHeight = 220;
  const barPadding = 40;
  const maxHarmonicPercent = 10; // scale up to 10% for harmonics h2-h15

  const harmonicsFiltered = evaluation.harmonicSpectrum.filter((h) => h.order > 1);
  const barSlotWidth = (barWidth - 2 * barPadding) / harmonicsFiltered.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Waveform Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div>
            <h3 className="text-xs md:text-sm font-bold text-slate-200 uppercase tracking-wide font-sans">
              1. Forma de Onda Trifásica (Vab, Vbc, Vca)
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              2 ciclos a 50 Hz (40 ms) · Distorsión por armónico 5.º y desbalance NEMA
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-cyan-400">
              <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" /> Vab ({evaluation.vab} V)
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-0.5 bg-amber-400 inline-block" /> Vbc ({evaluation.vbc} V)
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" /> Vca ({evaluation.vca} V)
            </span>
          </div>
        </div>

        <svg viewBox={`0 0 ${waveWidth} ${waveHeight}`} className="w-full h-auto bg-slate-950 rounded border border-slate-800">
          {/* Zero center axis line */}
          <line
            x1={padding}
            y1={scaleY(0)}
            x2={waveWidth - padding}
            y2={scaleY(0)}
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Time axis ticks (0, 10, 20, 30, 40 ms) */}
          {[0, 10, 20, 30, 40].map((t) => (
            <g key={t} transform={`translate(${scaleX(t)}, 0)`}>
              <line y1={padding} y2={waveHeight - padding} stroke="#1e293b" strokeWidth="1" />
              <text y={waveHeight - 8} fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">
                {t} ms
              </text>
            </g>
          ))}

          {/* Voltage ticks */}
          {[-500, 0, 500].map((v) => (
            <g key={v} transform={`translate(0, ${scaleY(v)})`}>
              <text x={padding - 6} y={3} fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="end">
                {v}V
              </text>
            </g>
          ))}

          {/* Waveform Paths */}
          <path d={pathAb} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
          <path d={pathBc} fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          <path d={pathCa} fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* 2. Harmonics Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div>
            <h3 className="text-xs md:text-sm font-bold text-slate-200 uppercase tracking-wide font-sans">
              2. Espectro Armónico de Tensión (Órdenes 2 a 15)
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Evaluación frente a IEEE 519-2022 Tabla 1 (PCC &le; 1 kV: Límite Individual 5.0%)
            </p>
          </div>
          <div className="text-right text-xs font-mono">
            <span className="text-slate-400">THDv Total: </span>
            <span className="text-cyan-400 font-bold">{evaluation.thdvPercent}%</span>
            <span className="text-slate-500"> / Máx 8.0%</span>
          </div>
        </div>

        <svg viewBox={`0 0 ${barWidth} ${barHeight}`} className="w-full h-auto bg-slate-950 rounded border border-slate-800">
          {/* Y Axis Grid lines (0%, 2.5%, 5.0%, 7.5%, 10%) */}
          {[0, 2.5, 5.0, 7.5, 10.0].map((pct) => {
            const y = barHeight - barPadding - (pct / maxHarmonicPercent) * (barHeight - 2 * barPadding);
            const isLimit = pct === 5.0;
            return (
              <g key={pct}>
                <line
                  x1={barPadding}
                  y1={y}
                  x2={barWidth - barPadding}
                  y2={y}
                  stroke={isLimit ? '#ef4444' : '#1e293b'}
                  strokeWidth={isLimit ? 1.5 : 1}
                  strokeDasharray={isLimit ? '4 2' : undefined}
                />
                <text x={barPadding - 6} y={y + 3} fill={isLimit ? '#ef4444' : '#64748b'} fontSize="9" fontFamily="monospace" textAnchor="end">
                  {pct.toFixed(1)}%
                </text>
              </g>
            );
          })}

          {/* IEEE 519-2022 Limit Label */}
          <text
            x={barWidth - barPadding - 5}
            y={barHeight - barPadding - (5.0 / maxHarmonicPercent) * (barHeight - 2 * barPadding) - 5}
            fill="#ef4444"
            fontSize="10"
            fontFamily="monospace"
            textAnchor="end"
            fontWeight="bold"
          >
            LÍMITE INDIVIDUAL IEEE 519-2022 (5.0%)
          </text>

          {/* Harmonic Bars */}
          {harmonicsFiltered.map((h, i) => {
            const barW = barSlotWidth * 0.65;
            const x = barPadding + i * barSlotWidth + (barSlotWidth - barW) / 2;
            const barH = (Math.min(h.voltagePercent, maxHarmonicPercent) / maxHarmonicPercent) * (barHeight - 2 * barPadding);
            const y = barHeight - barPadding - barH;
            const isViolation = h.voltagePercent > evaluation.ieee519IndividualLimitPercent;

            return (
              <g key={h.order}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  rx="2"
                  fill={isViolation ? '#ef4444' : h.order === 5 ? '#f59e0b' : '#0284c7'}
                  stroke={isViolation ? '#f87171' : undefined}
                  strokeWidth={isViolation ? 1 : 0}
                />

                {/* Percentage on top */}
                <text
                  x={x + barW / 2}
                  y={y - 4}
                  fill={isViolation ? '#f87171' : '#94a3b8'}
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight={isViolation ? 'bold' : 'normal'}
                >
                  {h.voltagePercent}%
                </text>

                {/* Order Label (X Axis) */}
                <text
                  x={x + barW / 2}
                  y={barHeight - barPadding + 14}
                  fill={isViolation ? '#f87171' : '#cbd5e1'}
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  h{h.order}
                </text>
                {/* Sequence Indicator (+ / - / 0) */}
                <text
                  x={x + barW / 2}
                  y={barHeight - barPadding + 26}
                  fill="#64748b"
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {h.sequence === 'negative' ? '(- seq)' : h.sequence === 'positive' ? '(+ seq)' : '(zero)'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
