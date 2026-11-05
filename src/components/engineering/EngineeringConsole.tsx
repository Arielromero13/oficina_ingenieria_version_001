/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  AgentProfile,
  CommissionStage,
  DeterministicEvaluation,
  ProviderInfo,
  SyntheticDataset,
} from '../../types/engineering';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Database,
  Play,
  RotateCcw,
  Users,
} from 'lucide-react';

interface EngineeringConsoleProps {
  datasets: SyntheticDataset[];
  selectedDataset: SyntheticDataset;
  onSelectDataset: (dataset: SyntheticDataset) => void;
  availableAgents: AgentProfile[];
  selectedTeam: AgentProfile[];
  onToggleAgent: (agentId: string) => void;
  providers: ProviderInfo[];
  allowGeminiFallback: boolean;
  onToggleFallback: (allow: boolean) => void;
  stage: CommissionStage;
  onStartCommission: () => void;
  onResetCommission: () => void;
  evaluation: DeterministicEvaluation | null;
}

export const EngineeringConsole: React.FC<EngineeringConsoleProps> = ({
  datasets,
  selectedDataset,
  onSelectDataset,
  availableAgents,
  selectedTeam,
  onToggleAgent,
  providers,
  allowGeminiFallback,
  onToggleFallback,
  stage,
  onStartCommission,
  onResetCommission,
  evaluation,
}) => {
  const isRunning =
    stage === 'ASSIGNING_TEAM' ||
    stage === 'CALCULATING_SIGNALS' ||
    stage === 'SPECIALIST_ANALYSIS' ||
    stage === 'SYNTHESIZING_REPORT';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      {/* Top Console Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded">
              PANEL DE CONTROL DEL DIRECTOR
            </span>
            <span className="text-xs font-mono text-slate-400">
              Ingeniero Responsable: <strong className="text-slate-200">Ariel Romero</strong>
            </span>
          </div>
          <h2 className="text-base md:text-lg font-bold text-slate-100 mt-1">
            Gestión de Encargo Técnico & Convocatoria de IA
          </h2>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2">
          {stage !== 'IDLE' && (
            <button
              onClick={onResetCommission}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar
            </button>
          )}

          <button
            onClick={onStartCommission}
            disabled={isRunning || selectedTeam.length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-lg ${
              isRunning
                ? 'bg-amber-600/80 text-white cursor-wait animate-pulse'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRunning ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                Ejecutando Ciclo Técnico...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                Iniciar Ciclo del Encargo
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: Dataset Selection & Provider Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Dataset Selector */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              1. Seleccionar Muestra de Telemetría
            </label>
            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded">
              DATOS SINTÉTICOS DE PRUEBA
            </span>
          </div>

          <div className="space-y-2">
            {datasets.map((ds) => {
              const isSelected = ds.id === selectedDataset.id;
              return (
                <div
                  key={ds.id}
                  onClick={() => !isRunning && onSelectDataset(ds)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500/80 ring-1 ring-blue-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  } ${isRunning ? 'pointer-events-none opacity-80' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{ds.equipmentName}</span>
                    <span className="text-[10px] font-mono text-cyan-400">
                      {ds.nominalParameters.powerKw} kW · {ds.nominalParameters.voltageLineV} V
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {ds.eventDescription}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Equipment Technical Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
            <div>
              <span className="text-slate-500 block">V Línea Nom:</span>
              <span className="text-slate-200 font-bold">{selectedDataset.nominalParameters.voltageLineV} V</span>
            </div>
            <div>
              <span className="text-slate-500 block">I Nom:</span>
              <span className="text-slate-200 font-bold">{selectedDataset.nominalParameters.fullLoadCurrentA} A</span>
            </div>
            <div>
              <span className="text-slate-500 block">Temp Devanado:</span>
              <span className="text-rose-400 font-bold">{selectedDataset.measurements.statorTemperatureC} °C</span>
            </div>
            <div>
              <span className="text-slate-500 block">Disparo Relé:</span>
              <span className="text-amber-400 font-bold">
                {selectedDataset.measurements.thermalRelayTripped ? 'DISPARADO (46m)' : 'NORMAL'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Provider Connectivity Status */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              2. Estado Real de Proveedores de IA
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Claves en Backend</span>
          </div>

          <div className="space-y-2">
            {providers.map((p) => {
              const isNative = p.id === 'gemini';
              const isConfigured = p.status === 'configured' || isNative;
              return (
                <div
                  key={p.id}
                  className="bg-slate-900 border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-200 flex items-center gap-2">
                      <span>{p.displayName}</span>
                      {isNative && (
                        <span className="text-[10px] bg-blue-950 border border-blue-700 text-blue-300 px-1.5 py-0.2 rounded">
                          ORQUESTADOR
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">{p.statusText}</p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                      isConfigured
                        ? 'bg-emerald-950/80 border border-emerald-600/60 text-emerald-300'
                        : 'bg-rose-950/80 border border-rose-800/60 text-rose-300'
                    }`}
                  >
                    {isConfigured ? 'CONFIGURADO' : 'NO CONFIGURADO'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Gemini Fallback Authorization Toggle */}
          <div className="pt-2 border-t border-slate-800/80">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={allowGeminiFallback}
                onChange={(e) => onToggleFallback(e.target.checked)}
                disabled={isRunning}
                className="mt-0.5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0 focus:ring-offset-0"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-200">
                  Autorizar a Gemini como fallback para especialistas no configurados
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Si Qwen o DeepSeek no tienen credenciales en el backend, sus tareas serán atendidas
                  por el Orquestador Gemini con registro explícito en la trazabilidad (sin reemplazos silenciosos).
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Team Assembly / Agent Pool (Oficial de RR. HH.) */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              3. Convocatoria de Cuadrilla Técnica (Catálogo de RR. HH.)
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Los perfiles se activan según pertinencia para este encargo. Memoria efímera individual.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
            {selectedTeam.length} / {availableAgents.length} PERFILES ASIGNADOS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableAgents.map((agent) => {
            const isAssigned = selectedTeam.some((a) => a.id === agent.id);
            const isOrchestrator = agent.id === 'orchestrator-gemini';
            const providerInfo = providers.find((p) => p.id === agent.provider);
            const isConfigured = providerInfo?.status === 'configured' || agent.provider === 'gemini';

            return (
              <div
                key={agent.id}
                onClick={() => {
                  if (!isOrchestrator && !isRunning) {
                    onToggleAgent(agent.id);
                  }
                }}
                className={`p-3 rounded-lg border transition-all ${
                  isAssigned
                    ? 'bg-slate-900 border-cyan-500/60 shadow-sm'
                    : 'bg-slate-950/80 border-slate-800/80 opacity-60'
                } ${isOrchestrator ? 'cursor-default ring-1 ring-blue-500/40' : 'cursor-pointer hover:border-slate-700'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-100">{agent.name}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                      isConfigured ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                    }`}
                  >
                    {agent.provider} ({isConfigured ? 'Disp' : 'No config'})
                  </span>
                </div>
                <div className="text-[11px] text-cyan-400 font-mono">{agent.role}</div>
                <p className="text-[10px] text-slate-400 mt-1 font-sans line-clamp-2">
                  {agent.specialty}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] font-mono">
                  <span className="text-slate-500">Modelo: {agent.modelId}</span>
                  <span className={isAssigned ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {isAssigned ? '✓ ASIGNADO' : 'INACTIVO'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
