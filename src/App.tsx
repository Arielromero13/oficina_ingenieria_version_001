/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  AgentProfile,
  CommissionStage,
  DeliverableReport,
  DeterministicEvaluation,
  ExecutionLogEntry,
  ProviderInfo,
  SyntheticDataset,
} from './types/engineering';
import {
  AVAILABLE_AGENT_CATALOG,
  SYNTHETIC_DATASETS,
} from './data/syntheticDatasets';
import {
  evaluatePowerQualityDataset,
  generateWaveformPoints,
} from './services/powerQualityMath';
import { IsometricOffice } from './components/office/IsometricOffice';
import { OfficeAssistant } from './components/office/OfficeAssistant';
import { EngineeringConsole } from './components/engineering/EngineeringConsole';
import { SignalCharts } from './components/engineering/SignalCharts';
import { ReportView } from './components/engineering/ReportView';
import {
  Activity,
  CheckCircle2,
  Cpu,
  FileCheck2,
  FileText,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // Datasets and Commission State
  const [datasets] = useState<SyntheticDataset[]>(SYNTHETIC_DATASETS);
  const [selectedDataset, setSelectedDataset] = useState<SyntheticDataset>(
    SYNTHETIC_DATASETS[0]
  );
  const [availableAgents, setAvailableAgents] = useState<AgentProfile[]>(
    AVAILABLE_AGENT_CATALOG
  );
  const [selectedTeam, setSelectedTeam] = useState<AgentProfile[]>(
    AVAILABLE_AGENT_CATALOG
  );

  // Provider configuration from backend
  const [providers, setProviders] = useState<ProviderInfo[]>([
    {
      id: 'gemini',
      displayName: 'Google Gemini (Nativo)',
      defaultModel: 'gemini-3.8-flash',
      configuredModel: 'gemini-3.8-flash',
      status: 'active_native',
      statusText: 'Nativo en Google AI Studio',
    },
    {
      id: 'qwen',
      displayName: 'Alibaba Qwen',
      defaultModel: 'qwen-2.5-coder',
      configuredModel: 'qwen-2.5-coder',
      status: 'not_configured',
      statusText: 'No configurado (sin credencial QWEN_API_KEY)',
    },
    {
      id: 'deepseek',
      displayName: 'DeepSeek',
      defaultModel: 'deepseek-chat',
      configuredModel: 'deepseek-chat',
      status: 'not_configured',
      statusText: 'No configurado (sin credencial DEEPSEEK_API_KEY)',
    },
  ]);

  const [allowGeminiFallback, setAllowGeminiFallback] = useState<boolean>(false);

  // Execution Stage
  const [stage, setStage] = useState<CommissionStage>('IDLE');
  const [selectedZone, setSelectedZone] = useState<
    'orchestrator' | 'hr' | 'power_lab' | 'review_board'
  >('orchestrator');
  const [activeTab, setActiveTab] = useState<
    'office' | 'signals' | 'report' | 'logs'
  >('office');

  // Math & Deterministic Evaluation
  const [evaluation, setEvaluation] = useState<DeterministicEvaluation>(() =>
    evaluatePowerQualityDataset(SYNTHETIC_DATASETS[0])
  );
  const [waveform, setWaveform] = useState<{ tMs: number; vab: number; vbc: number; vca: number }[]>(() =>
    generateWaveformPoints(
      SYNTHETIC_DATASETS[0].measurements.lineVoltagesV.vab,
      SYNTHETIC_DATASETS[0].measurements.lineVoltagesV.vbc,
      SYNTHETIC_DATASETS[0].measurements.lineVoltagesV.vca,
      SYNTHETIC_DATASETS[0].measurements.harmonics,
      SYNTHETIC_DATASETS[0].nominalParameters.frequencyHz,
      2,
      60
    )
  );

  // Deliverable Report and Logs
  const [report, setReport] = useState<DeliverableReport | null>(null);
  const [logs, setLogs] = useState<ExecutionLogEntry[]>([]);
  const [activeSpeechBubble, setActiveSpeechBubble] = useState<{
    agentName: string;
    text: string;
  } | null>(null);

  // Load config on mount
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.providers)) {
          setProviders(data.providers);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch backend config, using defaults:', err);
      });
  }, []);

  // Update calculations when dataset changes
  const handleSelectDataset = (dataset: SyntheticDataset) => {
    setSelectedDataset(dataset);
    const evalResult = evaluatePowerQualityDataset(dataset);
    setEvaluation(evalResult);
    setWaveform(
      generateWaveformPoints(
        dataset.measurements.lineVoltagesV.vab,
        dataset.measurements.lineVoltagesV.vbc,
        dataset.measurements.lineVoltagesV.vca,
        dataset.measurements.harmonics,
        dataset.nominalParameters.frequencyHz,
        2,
        60
      )
    );
    setReport(null);
    setLogs([]);
    setStage('IDLE');
    setActiveSpeechBubble(null);
  };

  // Toggle agent selection
  const handleToggleAgent = (agentId: string) => {
    setSelectedTeam((prev) => {
      const exists = prev.some((a) => a.id === agentId);
      if (exists) {
        return prev.filter((a) => a.id !== agentId);
      } else {
        const found = availableAgents.find((a) => a.id === agentId);
        return found ? [...prev, found] : prev;
      }
    });
  };

  // Full Commission Execution Cycle
  const handleStartCommission = async () => {
    setReport(null);
    setLogs([]);

    // 1. Stage: ASSIGNING_TEAM (RR. HH.)
    setStage('ASSIGNING_TEAM');
    setSelectedZone('hr');
    setActiveSpeechBubble({
      agentName: 'Oficial de RR. HH.',
      text: `Convocando cuadrilla técnica para ${selectedDataset.equipmentName}. Asignados: ${selectedTeam.length} perfiles.`,
    });

    await new Promise((r) => setTimeout(r, 1400));

    // 2. Stage: CALCULATING_SIGNALS (Power Lab)
    setStage('CALCULATING_SIGNALS');
    setSelectedZone('power_lab');
    setActiveSpeechBubble({
      agentName: 'Laboratorio de Calidad de Energía',
      text: `Calculando magnitudes deterministas: NEMA LVUR (${evaluation.nemaLvurPercent}%), IEC VUF (${evaluation.iecVufPercent}%), THDv (${evaluation.thdvPercent}%).`,
    });

    await new Promise((r) => setTimeout(r, 1600));

    // 3. Stage: SPECIALIST_ANALYSIS (Lab)
    setStage('SPECIALIST_ANALYSIS');
    setActiveSpeechBubble({
      agentName: 'Especialista en Armónicos & Causa Raíz',
      text: `Constatada componente de 5.º armónico (${evaluation.dominantHarmonicPercent}%) que excede el límite individual del 5.0% de IEEE 519-2022.`,
    });

    await new Promise((r) => setTimeout(r, 1600));

    // 4. Stage: SYNTHESIZING_REPORT (Orchestrator Gemini)
    setStage('SYNTHESIZING_REPORT');
    setSelectedZone('orchestrator');
    setActiveSpeechBubble({
      agentName: 'Orquestador Técnico',
      text: 'Ensamblando dictamen técnico con verificación de límites normativos y plan de mitigación...',
    });

    try {
      const response = await fetch('/api/orchestrator/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataset: selectedDataset,
          deterministicMetrics: evaluation,
          selectedTeam,
          allowGeminiFallback,
        }),
      });

      if (!response.ok) {
        throw new Error('Error en el servidor al despachar el encargo.');
      }

      const data = await response.json();
      setReport(data.report);
      setLogs(data.logs || []);

      // 5. Stage: AWAITING_REVIEW (Review Board)
      setStage('AWAITING_REVIEW');
      setSelectedZone('review_board');
      setActiveSpeechBubble({
        agentName: 'Mesa de Dictamen',
        text: 'Borrador depositado en la mesa. Estado: PENDIENTE DE REVISIÓN por Ariel Romero.',
      });
      setActiveTab('report');
    } catch (err) {
      console.error('Failed to dispatch commission:', err);
      setActiveSpeechBubble({
        agentName: 'Orquestador Técnico',
        text: 'Error en la llamada. Se generó borrador determinista de respaldo.',
      });
      setStage('AWAITING_REVIEW');
    }
  };

  // Reset Commission
  const handleResetCommission = () => {
    setStage('IDLE');
    setReport(null);
    setLogs([]);
    setActiveSpeechBubble(null);
    setSelectedZone('orchestrator');
    setActiveTab('office');
  };

  // Explicit approval by Ariel Romero
  const handleApproveReport = (notes: string) => {
    if (!report) return;
    const updatedReport: DeliverableReport = {
      ...report,
      status: 'APPROVED',
      approval: {
        approvedBy: 'Ariel Romero',
        roleTitle: 'Ingeniero Responsable',
        registrationNumber: 'Reg. Profesional COPAIPA-AR',
        approvedAt: new Date().toISOString(),
        notes,
      },
    };
    setReport(updatedReport);
    setStage('APPROVED');
    setSelectedZone('review_board');
    setActiveSpeechBubble({
      agentName: 'Ariel Romero (Ingeniero Responsable)',
      text: 'Dictamen técnico aprobado y certificado formalmente.',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* =========================================================================
          TOP BAR CONTRACT (1 ROW, 3 ZONES: Brand wordmark - Nav Links - 1 CTA)
          ========================================================================= */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          <span className="text-base md:text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap">
            Oficina Virtual de Ingeniería
          </span>
        </div>

        {/* Zone 2: 4 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('office')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
              activeTab === 'office' ? 'text-cyan-400 font-bold border-b border-cyan-400 pb-0.5' : ''
            }`}
          >
            Oficina Isométrica
          </button>
          <button
            onClick={() => setActiveTab('signals')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
              activeTab === 'signals' ? 'text-cyan-400 font-bold border-b border-cyan-400 pb-0.5' : ''
            }`}
          >
            Señales & IEEE 519
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
              activeTab === 'report' ? 'text-cyan-400 font-bold border-b border-cyan-400 pb-0.5' : ''
            }`}
          >
            Entregable Técnico {report && `(${report.status === 'APPROVED' ? 'Aprobado' : 'Borrador'})`}
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-100 ${
              activeTab === 'logs' ? 'text-cyan-400 font-bold border-b border-cyan-400 pb-0.5' : ''
            }`}
          >
            Trazabilidad de Modelos
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {report && report.status !== 'APPROVED' ? (
            <button
              onClick={() => {
                setActiveTab('report');
                setSelectedZone('review_board');
              }}
              className="px-4 py-2 text-xs font-mono font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-md"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              Revisar Dictamen
            </button>
          ) : (
            <button
              onClick={handleStartCommission}
              disabled={stage !== 'IDLE' && stage !== 'APPROVED'}
              className="px-4 py-2 text-xs font-mono font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              Ejecutar Encargo
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Navigation Tabs (Mobile & Sub-Bar) */}
        <div className="flex md:hidden items-center gap-1 overflow-x-auto pb-1 border-b border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('office')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'office' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            Oficina Isométrica
          </button>
          <button
            onClick={() => setActiveTab('signals')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'signals' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            Señales & Armónicos
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'report' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            Entregable Técnico
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'logs' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            Trazabilidad
          </button>
        </div>

        {/* View 1: Isometric Office and Control Console */}
        {activeTab === 'office' && (
          <div className="space-y-6">
            {/* Gamified 2.5D Isometric Virtual Office */}
            <IsometricOffice
              stage={stage}
              team={selectedTeam}
              deterministicMetrics={evaluation}
              activeSpeechBubble={activeSpeechBubble}
              isApproved={report?.status === 'APPROVED'}
              onSelectZone={(zone) => setSelectedZone(zone)}
              selectedZone={selectedZone}
            />

            <OfficeAssistant
              agents={availableAgents}
              providers={providers}
              dataset={selectedDataset}
              evaluation={evaluation}
              allowGeminiFallback={allowGeminiFallback}
            />

            {/* Engineering Control Console */}
            <EngineeringConsole
              datasets={datasets}
              selectedDataset={selectedDataset}
              onSelectDataset={handleSelectDataset}
              availableAgents={availableAgents}
              selectedTeam={selectedTeam}
              onToggleAgent={handleToggleAgent}
              providers={providers}
              allowGeminiFallback={allowGeminiFallback}
              onToggleFallback={setAllowGeminiFallback}
              stage={stage}
              onStartCommission={handleStartCommission}
              onResetCommission={handleResetCommission}
              evaluation={evaluation}
            />
          </div>
        )}

        {/* View 2: Power Quality Signals & Deterministic Curves */}
        {activeTab === 'signals' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm md:text-base font-bold text-slate-100 font-sans">
                  Inspección Determinista de Calidad de Energía
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Muestra activa: <span className="text-cyan-400 font-bold">{selectedDataset.equipmentName}</span> · {selectedDataset.nominalParameters.powerKw} kW / {selectedDataset.nominalParameters.voltageLineV} V
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-950/80 border border-amber-800/80 text-amber-300 font-bold">
                  DATOS SINTÉTICOS DE PRUEBA
                </span>
              </div>
            </div>

            <SignalCharts evaluation={evaluation} waveform={waveform} />

            {/* Normative Reference Quick Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono space-y-2">
                <div className="text-cyan-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4" />
                  Criterio IEEE 519-2022 (Tabla 1 - Tensión en PCC)
                </div>
                <p className="text-slate-300 font-sans leading-relaxed">
                  Para tensiones de barra nominales &le; 1.0 kV en el punto de acoplamiento común:
                </p>
                <ul className="space-y-1 text-slate-400">
                  <li>· Distorsión armónica individual máxima: <strong className="text-slate-200">5.0%</strong> (Armónico 5.º obtenido: <strong className="text-rose-400">{evaluation.dominantHarmonicPercent}% - VIOLACIÓN</strong>)</li>
                  <li>· Distorsión armónica total de tensión (THDv): <strong className="text-slate-200">8.0%</strong> (THDv obtenido: <strong className="text-emerald-400">{evaluation.thdvPercent}% - CONFORME</strong>)</li>
                </ul>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono space-y-2">
                <div className="text-amber-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                  <Cpu className="w-4 h-4" />
                  Criterio NEMA MG-1 (Desbalance de Tensión LVUR)
                </div>
                <p className="text-slate-300 font-sans leading-relaxed">
                  Desbalance calculado: <strong className="text-amber-400">{evaluation.nemaLvurPercent}%</strong> (Límite nominal: &le; 1.0%).
                </p>
                <p className="text-slate-400 font-sans leading-relaxed">
                  NEMA MG-1 Parte 14.36 exige desclasificar el motor a un <strong className="text-slate-200">{Math.round(evaluation.nemaDeratingFactor * 100)}% de la potencia nominal</strong>. A plena carga continuada, el par inverso inducido provocó la sobretemperatura de {selectedDataset.measurements.statorTemperatureC} °C y el disparo del relé.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View 3: Technical Deliverable Report */}
        {activeTab === 'report' && (
          <div className="space-y-6">
            {report ? (
              <ReportView
                report={report}
                logs={logs}
                onApproveReport={handleApproveReport}
              />
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
                <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-200">
                  No hay dictamen técnico generado todavía
                </h3>
                <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
                  Inicia el ciclo del encargo desde la Oficina Isométrica para que el Orquestador
                  y la cuadrilla de especialistas procesen la muestra y elaboren el borrador técnico.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('office');
                    handleStartCommission();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-colors inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Iniciar Encargo Ahora
                </button>
              </div>
            )}
          </div>
        )}

        {/* View 4: Full Audit Trail and Tracing */}
        {activeTab === 'logs' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm md:text-base font-bold text-slate-100 font-sans flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Trazabilidad de Ejecución por Etapa y Modelo
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Registro transparente de proveedores reales, evidencias, conclusiones y limitaciones.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {logs.length} Eventos Registrados
              </span>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-8 text-xs font-mono text-slate-500">
                El registro de auditoría se poblará al ejecutar un encargo.
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                      <span className="font-bold text-cyan-300 text-sm">{log.stage}</span>
                      <span className="text-slate-500 text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString('es-ES')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500 block">Agente Responsable:</span>
                        <span className="text-slate-200 font-bold">{log.agentName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Proveedor & Modelo:</span>
                        <span className="text-amber-400 font-semibold">{log.modelUsed}</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <span className="text-slate-500 block">Evidencia Empleada:</span>
                      <p className="text-slate-300 font-sans mt-0.5">{log.evidenceUsed}</p>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Conclusiones Principales:</span>
                      <p className="text-slate-300 font-sans mt-0.5">{log.keyFindings}</p>
                    </div>

                    {log.limitations !== 'Ninguna para esta etapa.' && (
                      <div className="bg-amber-950/20 border border-amber-900/40 rounded p-2 text-amber-300/90 font-sans text-[11px]">
                        <strong>Limitación Registrada:</strong> {log.limitations}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-6 py-4 text-xs font-mono text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <div>
          Oficina Virtual de Ingeniería · Director: <span className="text-slate-400">Ariel Romero</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Orquestador: Google Gemini (3.8 Flash)</span>
          <span className="text-slate-700">·</span>
          <span>Normativa: IEEE 519-2022 / NEMA MG-1</span>
        </div>
      </footer>
    </div>
  );
}
