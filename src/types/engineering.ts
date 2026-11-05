/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProviderId = 'gemini' | 'qwen' | 'deepseek';

export type ProviderStatusType = 'active_native' | 'configured' | 'not_configured';

export interface ProviderInfo {
  id: ProviderId;
  displayName: string;
  defaultModel: string;
  configuredModel: string;
  status: ProviderStatusType;
  statusText: string;
}

export interface AgentProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  specialty: string;
  provider: ProviderId;
  modelId: string;
  avatarColor: string;
  workstationId: 'orchestrator' | 'hr' | 'power_lab' | 'review_board';
  status: 'idle' | 'assigned' | 'analyzing' | 'completed' | 'unavailable';
  statusNote?: string;
}

export interface HarmonicComponent {
  order: number;
  frequencyHz: number;
  voltagePercent: number; // % of fundamental
  currentPercent?: number; // % of fundamental if available
  sequence: 'positive' | 'negative' | 'zero';
  exceedsIndividualIeee519: boolean;
}

export interface SyntheticDataset {
  id: string;
  isSynthetic: boolean;
  label: string;
  equipmentName: string;
  location: string;
  nominalParameters: {
    voltageLineV: number;
    frequencyHz: number;
    powerKw: number;
    fullLoadCurrentA: number;
    synchronousRpm: number;
    insulationClass: string;
  };
  operationalContext: string;
  eventDescription: string;
  measurements: {
    lineVoltagesV: { vab: number; vbc: number; vca: number };
    phaseCurrentsA: { ia: number; ib: number; ic: number };
    harmonics: { order: number; voltagePercent: number }[];
    statorTemperatureC: number;
    ambientTemperatureC: number;
    thermalRelayTripped: boolean;
    tripDelayMinutes: number;
  };
}

export interface DeterministicEvaluation {
  // Voltages
  vab: number;
  vbc: number;
  vca: number;
  vAvg: number;
  vMaxDeviation: number;
  // Currents
  ia: number;
  ib: number;
  ic: number;
  iAvg: number;
  // NEMA Line Voltage Unbalance Rate (LVUR)
  nemaLvurPercent: number;
  nemaCompliant: boolean; // <= 1.0%
  nemaDeratingFactor: number; // 1.0 down to ~0.75
  nemaNotes: string;
  // IEC Voltage Unbalance Factor (VUF)
  iecVufPercent: number;
  iecCompliant: boolean; // <= 2.0%
  iecNotes: string;
  // Harmonics
  thdvPercent: number;
  harmonicSpectrum: HarmonicComponent[];
  dominantHarmonicOrder: number;
  dominantHarmonicPercent: number;
  // IEEE 519-2022 Table 1 evaluation (PCC <= 1kV)
  ieee519PccVoltageLimit: string;
  ieee519IndividualLimitPercent: number; // 5.0%
  ieee519TotalLimitPercent: number; // 8.0%
  ieee519IndividualViolations: number[];
  ieee519TotalCompliant: boolean; // THDv <= 8.0%
  ieee519OverallCompliant: boolean; // Both total and individual
  ieee519Notes: string;
  // Current limits notice
  currentHarmonicsNotice: string;
}

export interface ExecutionLogEntry {
  id: string;
  timestamp: string;
  stage: string;
  agentName: string;
  provider: ProviderId;
  modelUsed: string;
  evidenceUsed: string;
  keyFindings: string;
  limitations: string;
}

export type CommissionStage =
  | 'IDLE'
  | 'ASSIGNING_TEAM'
  | 'CALCULATING_SIGNALS'
  | 'SPECIALIST_ANALYSIS'
  | 'SYNTHESIZING_REPORT'
  | 'AWAITING_REVIEW'
  | 'APPROVED';

export interface DeliverableReport {
  id: string;
  title: string;
  equipment: string;
  createdAt: string;
  status: 'PENDING_REVIEW' | 'APPROVED';
  executiveSummary: string;
  deterministicFindings: DeterministicEvaluation;
  diagnosticAssessment: string;
  rootCauseHypothesis: string;
  normativeComplianceSummary: {
    ieee519: { status: 'CONFORME' | 'NO_CONFORME'; summary: string };
    nemaMg1: { status: 'CONFORME' | 'DESCLASIFICACION_REQUERIDA' | 'NO_RECOMENDADO'; summary: string };
    iec61000: { status: 'CONFORME' | 'NO_CONFORME'; summary: string };
  };
  recommendedActions: string[];
  limitationsAndMissingData: string[];
  approval?: {
    approvedBy: string;
    approvedAt: string;
    roleTitle: string;
    registrationNumber: string;
    notes: string;
  };
}
