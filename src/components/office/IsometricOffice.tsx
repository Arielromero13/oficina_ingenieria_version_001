/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  AgentProfile,
  CommissionStage,
  DeterministicEvaluation,
} from '../../types/engineering';

interface IsometricOfficeProps {
  stage: CommissionStage;
  team: AgentProfile[];
  deterministicMetrics: DeterministicEvaluation | null;
  activeSpeechBubble: { agentName: string; text: string } | null;
  isApproved: boolean;
  onSelectZone: (zone: 'orchestrator' | 'hr' | 'power_lab' | 'review_board') => void;
  selectedZone: 'orchestrator' | 'hr' | 'power_lab' | 'review_board';
}

export const IsometricOffice: React.FC<IsometricOfficeProps> = ({
  stage,
  team,
  deterministicMetrics,
  activeSpeechBubble,
  isApproved,
  onSelectZone,
  selectedZone,
}) => {
  // Helpers to check agent activity in each zone
  const isOrchestratorActive = stage === 'SYNTHESIZING_REPORT' || stage === 'ASSIGNING_TEAM';
  const isHrActive = stage === 'ASSIGNING_TEAM';
  const isLabActive = stage === 'CALCULATING_SIGNALS' || stage === 'SPECIALIST_ANALYSIS';
  const isReviewActive = stage === 'AWAITING_REVIEW' || stage === 'APPROVED';

  return (
    <div className="relative w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 md:p-6 shadow-2xl overflow-hidden select-none">
      {/* Top Office Header HUD */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-sm bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          <div>
            <h2 className="text-sm md:text-base font-bold text-slate-100 tracking-wide font-sans">
              OFICINA VIRTUAL DE INGENIERÍA · VISTA ISOMÉTRICA
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              ESTADO DEL ENTORNO:{' '}
              <span
                className={`font-semibold ${
                  stage === 'APPROVED'
                    ? 'text-emerald-400'
                    : stage === 'IDLE'
                    ? 'text-slate-400'
                    : 'text-amber-400'
                }`}
              >
                {stage === 'IDLE' && 'EN ESPERA DE ENCARGO'}
                {stage === 'ASSIGNING_TEAM' && 'RR. HH. CONVOCANDO CUADRILLA'}
                {stage === 'CALCULATING_SIGNALS' && 'LABORATORIO: CÁLCULO DETERMINISTA'}
                {stage === 'SPECIALIST_ANALYSIS' && 'ESPECIALISTAS: ANÁLISIS DE FALLA'}
                {stage === 'SYNTHESIZING_REPORT' && 'ORQUESTADOR: ENSAMBLANDO DICTAMEN'}
                {stage === 'AWAITING_REVIEW' && 'MESA DE REVISIÓN: PENDIENTE APROBACIÓN'}
                {stage === 'APPROVED' && 'DICTAMEN APROBADO POR ARIEL ROMERO'}
              </span>
            </p>
          </div>
        </div>

        {/* Quick Zone Navigation Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => onSelectZone('orchestrator')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedZone === 'orchestrator'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Despacho
          </button>
          <button
            onClick={() => onSelectZone('hr')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedZone === 'hr'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. RR. HH.
          </button>
          <button
            onClick={() => onSelectZone('power_lab')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedZone === 'power_lab'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Lab Señales
          </button>
          <button
            onClick={() => onSelectZone('review_board')}
            className={`px-2.5 py-1 rounded transition-colors ${
              selectedZone === 'review_board'
                ? 'bg-amber-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            4. Mesa Dictamen
          </button>
        </div>
      </div>

      {/* SVG Isometric Canvas Scene */}
      <div className="relative w-full aspect-[16/9] min-h-[380px] max-h-[520px] bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
        {/* Isometric Grid Floor Tiles */}
        <svg
          viewBox="0 0 960 540"
          className="w-full h-full object-contain"
          style={{ imageRendering: 'pixelated' }}
        >
          <defs>
            {/* Floor Tile Pattern */}
            <pattern id="isoGrid" width="60" height="30" patternUnits="userSpaceOnUse">
              <path
                d="M 30,0 L 60,15 L 30,30 L 0,15 Z"
                fill="#0f172a"
                stroke="#1e293b"
                strokeWidth="1"
              />
            </pattern>
            {/* Lab Tile Pattern */}
            <pattern id="labGrid" width="60" height="30" patternUnits="userSpaceOnUse">
              <path
                d="M 30,0 L 60,15 L 30,30 L 0,15 Z"
                fill="#0b1b2b"
                stroke="#163854"
                strokeWidth="1"
              />
            </pattern>
            {/* Wall Gradient */}
            <linearGradient id="wallGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="wallGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>

          {/* BACK WALLS (ISOMETRIC ROOM BOUNDARIES) */}
          {/* Left Wall */}
          <polygon
            points="480,50 40,240 40,320 480,130"
            fill="url(#wallGradLeft)"
            stroke="#475569"
            strokeWidth="2"
          />
          {/* Right Wall */}
          <polygon
            points="480,50 920,240 920,320 480,130"
            fill="url(#wallGradRight)"
            stroke="#475569"
            strokeWidth="2"
          />

          {/* Wall Paneling & Technical Posters */}
          {/* IEEE 519 Reference Poster on Left Wall */}
          <polygon points="180,185 300,135 300,195 180,245" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
          <text x="240" y="195" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle" transform="skewY(-14) rotate(-5)">
            IEEE 519-2022
          </text>

          {/* NEMA MG-1 Reference Poster on Right Wall */}
          <polygon points="660,135 780,185 780,245 660,195" fill="#1e293b" stroke="#fbbf24" strokeWidth="1" />
          <text x="720" y="200" fill="#fbbf24" fontSize="10" fontFamily="monospace" textAnchor="middle" transform="skewY(14) rotate(5)">
            NEMA MG-1 LVUR
          </text>

          {/* ISOMETRIC FLOOR */}
          <polygon
            points="480,130 920,320 480,510 40,320"
            fill="url(#isoGrid)"
            stroke="#334155"
            strokeWidth="2"
          />

          {/* ==============================================================
              ZONA 1: DESPACHO DEL ORQUESTADOR (Superior Izquierda: X: 260, Y: 220)
              ============================================================== */}
          <g
            className="cursor-pointer transition-transform hover:opacity-90"
            onClick={() => onSelectZone('orchestrator')}
          >
            {/* Desk Floor Highlight */}
            <polygon
              points="260,165 370,215 270,265 160,215"
              fill={selectedZone === 'orchestrator' ? '#1e3a8a44' : '#0f172a33'}
              stroke={selectedZone === 'orchestrator' ? '#3b82f6' : '#1e3a8a'}
              strokeWidth={selectedZone === 'orchestrator' ? 2 : 1}
            />

            {/* Executive Desk (Isometric block) */}
            {/* Desk Top */}
            <polygon points="260,180 340,215 260,250 180,215" fill="#3b4252" stroke="#4c566a" strokeWidth="2" />
            {/* Desk Front Right */}
            <polygon points="340,215 340,255 260,290 260,250" fill="#2e3440" stroke="#4c566a" strokeWidth="2" />
            {/* Desk Front Left */}
            <polygon points="260,250 260,290 180,255 180,215" fill="#242933" stroke="#4c566a" strokeWidth="2" />

            {/* Orchestrator Multimonitor Stand */}
            {/* Center Main Screen */}
            <polygon points="250,150 270,140 270,175 250,185" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
            <polygon points="252,153 268,145 268,172 252,180" fill={isOrchestratorActive ? '#0284c7' : '#0369a1'} />
            {/* Left Screen */}
            <polygon points="230,160 248,150 248,183 230,193" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
            <polygon points="232,163 246,155 246,180 232,188" fill="#075985" />
            {/* Screen Glow Pulsing */}
            {isOrchestratorActive && (
              <circle cx="260" cy="165" r="14" fill="#38bdf8" opacity="0.3" className="animate-pulse" />
            )}

            {/* Desk Lamp */}
            <line x1="295" y1="195" x2="295" y2="175" stroke="#94a3b8" strokeWidth="2" />
            <circle cx="295" cy="173" r="4" fill="#fbbf24" />

            {/* ORCHESTRATOR AVATAR (Pixel Art Style: Traje Azul, Cabello Técnico) */}
            <g transform="translate(255, 125)">
              {/* Shadow */}
              <ellipse cx="6" cy="72" rx="14" ry="7" fill="#000000" opacity="0.4" />
              {/* Legs / Trousers */}
              <rect x="0" y="44" width="5" height="24" fill="#1e293b" />
              <rect x="7" y="44" width="5" height="24" fill="#1e293b" />
              {/* Shoes */}
              <rect x="-1" y="66" width="6" height="4" fill="#090d16" />
              <rect x="7" y="66" width="6" height="4" fill="#090d16" />
              {/* Torso / Navy Blazer */}
              <rect x="-3" y="18" width="18" height="28" fill="#1d4ed8" rx="2" />
              {/* Shirt & Tie */}
              <rect x="4" y="20" width="4" height="12" fill="#f8fafc" />
              <polygon points="5,22 7,22 6,32" fill="#dc2626" />
              {/* Arms */}
              <rect x="-7" y="20" width="5" height="20" fill="#1e40af" rx="2" />
              <rect x="14" y="20" width="5" height="20" fill="#1e40af" rx="2" />
              {/* Hands */}
              <rect x="-7" y="38" width="5" height="5" fill="#fcd34d" />
              <rect x="14" y="38" width="5" height="5" fill="#fcd34d" />
              {/* Head */}
              <rect x="-1" y="2" width="14" height="16" fill="#fcd34d" rx="2" />
              {/* Eyes */}
              <rect x="2" y="7" width="2" height="3" fill="#0f172a" />
              <rect x="8" y="7" width="2" height="3" fill="#0f172a" />
              {/* Hair */}
              <rect x="-2" y="0" width="16" height="6" fill="#475569" rx="1" />
              <rect x="-3" y="3" width="3" height="8" fill="#475569" />
              {/* Headset / Comm Badge */}
              <circle cx="12" cy="10" r="2" fill="#38bdf8" />
            </g>

            {/* Zone Tag */}
            <rect x="200" y="295" width="120" height="20" rx="3" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" />
            <text x="260" y="309" fill="#93c5fd" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              1. DESPACHO ORQUESTADOR
            </text>
          </g>

          {/* ==============================================================
              ZONA 2: ESTACIÓN DEL OFICIAL DE RR. HH. (Superior Derecha: X: 690, Y: 220)
              ============================================================== */}
          <g
            className="cursor-pointer transition-transform hover:opacity-90"
            onClick={() => onSelectZone('hr')}
          >
            {/* Zone Floor Highlight */}
            <polygon
              points="690,165 800,215 700,265 590,215"
              fill={selectedZone === 'hr' ? '#064e3b44' : '#0f172a33'}
              stroke={selectedZone === 'hr' ? '#10b981' : '#064e3b'}
              strokeWidth={selectedZone === 'hr' ? 2 : 1}
            />

            {/* HR Station Desk */}
            <polygon points="690,180 770,215 690,250 610,215" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <polygon points="770,215 770,255 690,290 690,250" fill="#111827" stroke="#334155" strokeWidth="2" />
            <polygon points="690,250 690,290 610,255 610,215" fill="#0b0f19" stroke="#334155" strokeWidth="2" />

            {/* Profile Filing Cabinet behind HR Desk */}
            <polygon points="760,140 810,160 810,210 760,190" fill="#334155" stroke="#475569" strokeWidth="1.5" />
            <polygon points="710,160 760,140 760,190 710,210" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            {/* Filing Drawers with Green Tabs */}
            <line x1="720" y1="175" x2="750" y2="162" stroke="#10b981" strokeWidth="2" />
            <line x1="720" y1="190" x2="750" y2="177" stroke="#10b981" strokeWidth="2" />

            {/* HR Desktop Tablet / Roster Display */}
            <polygon points="660,190 680,180 680,205 660,215" fill="#022c22" stroke="#10b981" strokeWidth="1" />
            {isHrActive && (
              <circle cx="670" cy="195" r="10" fill="#10b981" opacity="0.3" className="animate-pulse" />
            )}

            {/* HR OFFICER AVATAR (Analista con portapapeles verde esmeralda) */}
            <g transform="translate(685, 125)">
              {/* Shadow */}
              <ellipse cx="6" cy="72" rx="14" ry="7" fill="#000000" opacity="0.4" />
              {/* Legs */}
              <rect x="1" y="44" width="4" height="24" fill="#0f172a" />
              <rect x="7" y="44" width="4" height="24" fill="#0f172a" />
              {/* Shoes */}
              <rect x="0" y="66" width="6" height="4" fill="#1e293b" />
              <rect x="7" y="66" width="6" height="4" fill="#1e293b" />
              {/* Emerald Uniform Blazer */}
              <rect x="-2" y="18" width="16" height="28" fill="#059669" rx="2" />
              {/* Blouse & Badge */}
              <rect x="3" y="20" width="6" height="10" fill="#ecfdf5" />
              <rect x="8" y="24" width="4" height="3" fill="#fbbf24" />
              {/* Arms holding Clipboard */}
              <rect x="-5" y="22" width="4" height="16" fill="#047857" rx="1" />
              <rect x="13" y="22" width="4" height="16" fill="#047857" rx="1" />
              {/* Clipboard */}
              <rect x="2" y="28" width="10" height="14" fill="#d97706" rx="1" stroke="#78350f" strokeWidth="1" />
              <rect x="3" y="30" width="8" height="10" fill="#fef3c7" />
              <line x1="4" y1="33" x2="9" y2="33" stroke="#92400e" strokeWidth="1" />
              <line x1="4" y1="36" x2="9" y2="36" stroke="#92400e" strokeWidth="1" />
              {/* Head */}
              <rect x="0" y="3" width="13" height="15" fill="#fed7aa" rx="2" />
              {/* Eyes */}
              <rect x="3" y="8" width="2" height="3" fill="#0f172a" />
              <rect x="8" y="8" width="2" height="3" fill="#0f172a" />
              {/* Hair (Collected bun) */}
              <rect x="-1" y="0" width="15" height="6" fill="#7c2d12" rx="2" />
              <circle cx="6" cy="-2" r="4" fill="#7c2d12" />
            </g>

            {/* Zone Tag */}
            <rect x="630" y="295" width="120" height="20" rx="3" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
            <text x="690" y="309" fill="#a7f3d0" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              2. OFICIAL DE RR. HH.
            </text>
          </g>

          {/* ==============================================================
              ZONA 3: LABORATORIO DE CALIDAD DE ENERGÍA (Inferior Izquierda: X: 260, Y: 370)
              ============================================================== */}
          <g
            className="cursor-pointer transition-transform hover:opacity-90"
            onClick={() => onSelectZone('power_lab')}
          >
            {/* Zone Floor Highlight */}
            <polygon
              points="260,315 370,365 270,415 160,365"
              fill={selectedZone === 'power_lab' ? '#08334444' : '#0b1b2b33'}
              stroke={selectedZone === 'power_lab' ? '#06b6d4' : '#0e7490'}
              strokeWidth={selectedZone === 'power_lab' ? 2 : 1}
            />

            {/* Laboratory Workbench */}
            <polygon points="260,330 350,370 260,410 170,370" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <polygon points="350,370 350,410 260,450 260,410" fill="#111827" stroke="#334155" strokeWidth="2" />
            <polygon points="260,410 260,450 170,410 170,370" fill="#0b0f19" stroke="#334155" strokeWidth="2" />

            {/* Digital Oscilloscope Instrument */}
            <polygon points="220,315 270,335 270,365 220,345" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
            <polygon points="222,318 268,336 268,362 222,344" fill="#022c22" />
            {/* Oscilloscope Waveform Trace (Green phosphor) */}
            <path
              d="M 225,335 Q 235,325 245,335 T 265,335"
              fill="none"
              stroke={isLabActive ? '#22c55e' : '#15803d'}
              strokeWidth="1.5"
            />
            {/* Knobs and BNC Connectors */}
            <circle cx="230" cy="352" r="2" fill="#94a3b8" />
            <circle cx="240" cy="356" r="2" fill="#94a3b8" />
            <circle cx="250" cy="360" r="2" fill="#06b6d4" />

            {/* Power Quality Analyzer box on table */}
            <polygon points="290,345 330,360 330,380 290,365" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
            {/* LED Status Bar (Red / Yellow / Green) */}
            <circle cx="300" cy="360" r="1.5" fill="#ef4444" />
            <circle cx="306" cy="362" r="1.5" fill="#f59e0b" />
            <circle cx="312" cy="364" r="1.5" fill="#22c55e" />

            {/* SPECIALIST AVATAR (Ingeniero de Señales con Bata Técnica) */}
            <g transform="translate(255, 275)">
              <ellipse cx="6" cy="72" rx="14" ry="7" fill="#000000" opacity="0.4" />
              {/* Dark work pants */}
              <rect x="0" y="44" width="5" height="24" fill="#1e293b" />
              <rect x="7" y="44" width="5" height="24" fill="#1e293b" />
              {/* Safety Boots */}
              <rect x="-1" y="66" width="6" height="4" fill="#78350f" />
              <rect x="7" y="66" width="6" height="4" fill="#78350f" />
              {/* White Laboratory Coat */}
              <rect x="-3" y="18" width="18" height="30" fill="#f1f5f9" rx="2" stroke="#cbd5e1" strokeWidth="1" />
              {/* Inner shirt (Cyan) */}
              <rect x="4" y="20" width="4" height="8" fill="#06b6d4" />
              {/* Pocket with multimeter probe */}
              <rect x="9" y="25" width="4" height="4" fill="#e2e8f0" />
              <line x1="11" y1="21" x2="11" y2="25" stroke="#ef4444" strokeWidth="1.5" />
              {/* Arms */}
              <rect x="-7" y="20" width="5" height="18" fill="#f1f5f9" rx="1" />
              <rect x="14" y="20" width="5" height="18" fill="#f1f5f9" rx="1" />
              {/* Head & Safety Glasses */}
              <rect x="-1" y="2" width="14" height="16" fill="#fed7aa" rx="2" />
              {/* Safety Glasses (Cyan tint) */}
              <rect x="1" y="6" width="10" height="4" fill="#38bdf8" opacity="0.7" stroke="#0284c7" strokeWidth="1" />
              {/* Hair */}
              <rect x="-2" y="0" width="16" height="5" fill="#1e293b" rx="1" />
            </g>

            {/* Zone Tag */}
            <rect x="200" y="455" width="120" height="20" rx="3" fill="#0f172a" stroke="#06b6d4" strokeWidth="1" />
            <text x="260" y="469" fill="#a5f3fc" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              3. LAB CALIDAD ENERGÍA
            </text>
          </g>

          {/* ==============================================================
              ZONA 4: MESA DE DICTAMEN Y APROBACIÓN (Inferior Derecha: X: 690, Y: 370)
              ============================================================== */}
          <g
            className="cursor-pointer transition-transform hover:opacity-90"
            onClick={() => onSelectZone('review_board')}
          >
            {/* Zone Floor Highlight */}
            <polygon
              points="690,315 800,365 700,415 590,365"
              fill={selectedZone === 'review_board' ? '#78350f44' : '#0f172a33'}
              stroke={selectedZone === 'review_board' ? '#f59e0b' : '#b45309'}
              strokeWidth={selectedZone === 'review_board' ? 2 : 1}
            />

            {/* Conference Table (Solid Oak / Walnut Wood) */}
            <polygon points="690,330 780,370 690,410 600,370" fill="#451a03" stroke="#78350f" strokeWidth="2" />
            <polygon points="780,370 780,410 690,450 690,410" fill="#290e02" stroke="#78350f" strokeWidth="2" />
            <polygon points="690,410 690,450 600,410 600,370" fill="#1a0801" stroke="#78350f" strokeWidth="2" />

            {/* Technical Blueprints on Table */}
            <polygon points="630,360 670,350 680,370 640,380" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
            {/* Report Deliverable Folder */}
            <polygon points="690,365 740,355 750,380 700,390" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Stamp on Report: Red Draft OR Green Approved */}
            {isApproved ? (
              <circle cx="720" cy="372" r="7" fill="#10b981" stroke="#047857" strokeWidth="1" />
            ) : stage === 'AWAITING_REVIEW' ? (
              <polygon
                points="715,368 725,368 720,378"
                fill="#f59e0b"
                className="animate-pulse"
              />
            ) : (
              <circle cx="720" cy="372" r="5" fill="#64748b" />
            )}

            {/* Whiteboard Stand behind table with Normative Diagram */}
            <polygon points="740,290 820,325 820,370 740,335" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="755" y1="315" x2="805" y2="335" stroke="#dc2626" strokeWidth="1.5" />
            <line x1="755" y1="330" x2="795" y2="348" stroke="#1d4ed8" strokeWidth="1" />

            {/* AUDITOR / REVIEWER AVATAR */}
            <g transform="translate(685, 275)">
              <ellipse cx="6" cy="72" rx="14" ry="7" fill="#000000" opacity="0.4" />
              {/* Pants */}
              <rect x="0" y="44" width="5" height="24" fill="#334155" />
              <rect x="7" y="44" width="5" height="24" fill="#334155" />
              {/* Shoes */}
              <rect x="-1" y="66" width="6" height="4" fill="#0f172a" />
              <rect x="7" y="66" width="6" height="4" fill="#0f172a" />
              {/* Auditor Vest / Sweater (Amber/Gold) */}
              <rect x="-3" y="18" width="18" height="28" fill="#d97706" rx="2" />
              {/* White Shirt Collar */}
              <polygon points="2,18 6,24 10,18" fill="#f8fafc" />
              {/* Arms */}
              <rect x="-7" y="20" width="5" height="18" fill="#b45309" rx="1" />
              <rect x="14" y="20" width="5" height="18" fill="#b45309" rx="1" />
              {/* Head */}
              <rect x="-1" y="2" width="14" height="16" fill="#fde68a" rx="2" />
              {/* Reading Glasses */}
              <circle cx="3" cy="8" r="2.5" fill="none" stroke="#78350f" strokeWidth="1" />
              <circle cx="9" cy="8" r="2.5" fill="none" stroke="#78350f" strokeWidth="1" />
              <line x1="5.5" y1="8" x2="6.5" y2="8" stroke="#78350f" strokeWidth="1" />
              {/* Graying Hair */}
              <rect x="-2" y="0" width="16" height="5" fill="#64748b" rx="1" />
            </g>

            {/* Zone Tag */}
            <rect x="630" y="455" width="120" height="20" rx="3" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
            <text x="690" y="469" fill="#fde68a" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
              4. MESA DE DICTAMEN
            </text>
          </g>

          {/* ==============================================================
              SPEECH BUBBLE OVER ACTIVE AGENTS (HABBO STYLE)
              ============================================================== */}
          {activeSpeechBubble && (
            <g transform="translate(480, 110)">
              {/* Bubble Box */}
              <rect
                x="-160"
                y="-45"
                width="320"
                height="45"
                rx="6"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="1.5"
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
              />
              {/* Pointer Tip */}
              <polygon points="-8,0 8,0 0,8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <rect x="-7" y="-2" width="14" height="3" fill="#0f172a" />
              {/* Speaker Label */}
              <text x="-150" y="-28" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                [{activeSpeechBubble.agentName}]:
              </text>
              {/* Text */}
              <text x="-150" y="-12" fill="#f1f5f9" fontSize="10" fontFamily="sans-serif">
                {activeSpeechBubble.text.length > 58
                  ? `${activeSpeechBubble.text.slice(0, 56)}...`
                  : activeSpeechBubble.text}
              </text>
            </g>
          )}
        </svg>

        {/* Ambient Room Badges (Overlay HUD) */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>ESTACIONES ACTIVAS: 4</span>
          <span className="text-slate-600">|</span>
          <span>PERFILES CONVOCADOS: {team.length}</span>
        </div>

        {deterministicMetrics && (
          <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-lg text-xs font-mono text-slate-300 pointer-events-none max-w-xs shadow-lg hidden sm:block">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              TELEMETRÍA EN VIVO (MOTOR 75 kW)
            </div>
            <div className="flex justify-between gap-4 mt-1">
              <span>NEMA LVUR:</span>
              <span className={`font-bold ${deterministicMetrics.nemaCompliant ? 'text-emerald-400' : 'text-amber-400'}`}>
                {deterministicMetrics.nemaLvurPercent}% ({deterministicMetrics.nemaCompliant ? 'Nominal' : 'Derating 88%'})
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>THDv / Arm. 5.º:</span>
              <span className={`font-bold ${deterministicMetrics.ieee519OverallCompliant ? 'text-emerald-400' : 'text-amber-400'}`}>
                {deterministicMetrics.thdvPercent}% / {deterministicMetrics.dominantHarmonicPercent}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
