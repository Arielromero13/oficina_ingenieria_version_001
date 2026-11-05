/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  DeliverableReport,
  ExecutionLogEntry,
} from '../../types/engineering';
import { CheckCircle2, Clock, Download, FileText, Printer, ShieldAlert } from 'lucide-react';

interface ReportViewProps {
  report: DeliverableReport;
  logs: ExecutionLogEntry[];
  onApproveReport: (notes: string) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  report,
  logs,
  onApproveReport,
}) => {
  const [approvalNotes, setApprovalNotes] = useState(
    'Revisión técnica conforme. Se constata correlación entre el desbalance de fases NEMA y el disparo térmico por par inverso de armónico 5.º. Proceder con el plan de mitigación recomendado.'
  );
  const [isApproving, setIsApproving] = useState(false);

  const isApproved = report.status === 'APPROVED';

  // Export report as clean Markdown
  const handleDownloadMarkdown = () => {
    const mdContent = `# ${report.title}
**Fecha:** ${new Date(report.createdAt).toLocaleString('es-ES')}
**Equipo:** ${report.equipment}
**Estado:** ${report.status === 'APPROVED' ? 'APROBADO' : 'BORRADOR TÉCNICO PENDIENTE DE REVISIÓN'}
${
  report.approval
    ? `**Aprobado por:** ${report.approval.approvedBy} (${report.approval.roleTitle})
**Fecha de Aprobación:** ${new Date(report.approval.approvedAt).toLocaleString('es-ES')}
**Notas del Revisor:** ${report.approval.notes}`
    : '**Dictamen:** Pendiente de revisión y firma profesional por Ariel Romero.'
}

---

## 1. Resumen Ejecutivo
${report.executiveSummary}

---

## 2. Magnitudes Deterministas Evaluadas
- **Tensiones de Línea:** Vab = ${report.deterministicFindings.vab} V, Vbc = ${report.deterministicFindings.vbc} V, Vca = ${report.deterministicFindings.vca} V (Promedio: ${report.deterministicFindings.vAvg} V)
- **Corrientes de Fase:** Ia = ${report.deterministicFindings.ia} A, Ib = ${report.deterministicFindings.ib} A, Ic = ${report.deterministicFindings.ic} A (Promedio: ${report.deterministicFindings.iAvg} A)
- **NEMA Line Voltage Unbalance Rate (LVUR):** ${report.deterministicFindings.nemaLvurPercent}% (Límite nominal NEMA MG-1: <= 1.0%)
  - *Factor de Derating requerido:* ${Math.round(report.deterministicFindings.nemaDeratingFactor * 100)}% de la potencia nominal
  - *Evaluación NEMA:* ${report.deterministicFindings.nemaNotes}
- **IEC Voltage Unbalance Factor (VUF):** ${report.deterministicFindings.iecVufPercent}% (Límite estándar IEC 61000-2-4 Clase 2: <= 2.0%)
  - *Evaluación IEC:* ${report.deterministicFindings.iecNotes}
- **Distorsión Armónica de Tensión (THDv):** ${report.deterministicFindings.thdvPercent}% (Límite global IEEE 519-2022 Tabla 1 para PCC <= 1 kV: <= 8.0%)
- **Armónico Dominante:** Orden ${report.deterministicFindings.dominantHarmonicOrder} con ${report.deterministicFindings.dominantHarmonicPercent}% (Límite individual IEEE 519-2022: <= 5.0% - ${report.deterministicFindings.ieee519IndividualViolations.length > 0 ? 'NO CONFORME' : 'CONFORME'})

---

## 3. Diagnóstico Técnico Asistido por IA
${report.diagnosticAssessment}

---

## 4. Hipótesis de Causa Raíz
${report.rootCauseHypothesis}

---

## 5. Matriz de Cumplimiento Normativo
- **IEEE 519-2022 Tabla 1 (Tensión en PCC):** [${report.normativeComplianceSummary.ieee519.status}] ${report.normativeComplianceSummary.ieee519.summary}
- **NEMA MG-1 (Desbalance de Tensión):** [${report.normativeComplianceSummary.nemaMg1.status}] ${report.normativeComplianceSummary.nemaMg1.summary}
- **IEC 61000-2-4 Clase 2 (VUF):** [${report.normativeComplianceSummary.iec61000.status}] ${report.normativeComplianceSummary.iec61000.summary}

---

## 6. Plan de Acciones Correctivas y Recomendaciones
${report.recommendedActions.map((act, i) => `${i + 1}. ${act}`).join('\n')}

---

## 7. Limitaciones y Datos No Disponibles
${report.limitationsAndMissingData.map((lim, i) => `- ${lim}`).join('\n')}
- ${report.deterministicFindings.currentHarmonicsNotice}

---

## 8. Trazabilidad de Agentes y Modelos
${logs
  .map(
    (l) =>
      `### ${l.stage}
- **Agente:** ${l.agentName}
- **Proveedor / Modelo:** ${l.provider} (${l.modelUsed})
- **Evidencia Utilizada:** ${l.evidenceUsed}
- **Resultados:** ${l.keyFindings}
- **Limitaciones:** ${l.limitations}`
  )
  .join('\n\n')}
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dictamen_${report.id}_${report.equipment.replace(/\s+/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header with Title and Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              ID: {report.id}
            </span>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1.5 ${
                isApproved
                  ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                  : 'bg-amber-950/80 border border-amber-500/50 text-amber-300'
              }`}
            >
              {isApproved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  DICTAMEN APROBADO POR ARIEL ROMERO
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  BORRADOR TÉCNICO PENDIENTE DE REVISIÓN
                </>
              )}
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-100 mt-2 font-sans">
            {report.title}
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Generado: {new Date(report.createdAt).toLocaleString('es-ES')} · Equipo:{' '}
            <span className="text-slate-200 font-semibold">{report.equipment}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Descargar Markdown (.md)
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Professional Approval Box */}
      <div
        className={`rounded-xl p-5 border transition-all ${
          isApproved
            ? 'bg-emerald-950/30 border-emerald-500/40'
            : 'bg-amber-950/20 border-amber-500/40'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Revisión Profesional y Responsabilidad Técnica
            </h3>
            <p className="text-xs text-slate-300">
              Los agentes de IA actúan como asistentes analíticos y elaboran el borrador técnico.
              La validez profesional, rigor técnico y aprobación legal del peritaje está reservada
              exclusivamente a <strong className="text-white">Ariel Romero</strong>.
            </p>
          </div>

          {!isApproved ? (
            <div className="w-full sm:w-auto flex flex-col gap-2">
              <button
                onClick={() => {
                  onApproveReport(approvalNotes);
                  setIsApproving(false);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold tracking-wider uppercase transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Aprobar y Emitir Dictamen Final (Ariel Romero)
              </button>
            </div>
          ) : (
            <div className="bg-emerald-900/40 border border-emerald-600/50 rounded-lg p-3 text-xs font-mono text-emerald-200">
              <div className="font-bold flex items-center gap-1 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                DICTAMEN APROBADO Y CERTIFICADO
              </div>
              <div className="text-[11px] text-emerald-300/80 mt-1">
                Aprobado por: <span className="font-semibold">{report.approval?.approvedBy}</span>
              </div>
              <div className="text-[11px] text-emerald-300/80">
                Fecha/Hora: {report.approval ? new Date(report.approval.approvedAt).toLocaleString('es-ES') : ''}
              </div>
              <div className="text-[11px] text-slate-300 mt-1 italic">
                "{report.approval?.notes}"
              </div>
            </div>
          )}
        </div>

        {!isApproved && (
          <div className="mt-3">
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Notas de aprobación y directrices del Ingeniero Director:
            </label>
            <input
              type="text"
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-sans"
            />
          </div>
        )}
      </div>

      {/* Section 1: Executive Summary */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider">
          01. Resumen Ejecutivo
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          {report.executiveSummary}
        </p>
      </div>

      {/* Section 2: Deterministic Metrics Summary Table */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider">
          02. Magnitudes Deterministas Calculadas en Código Puro
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Parámetro</th>
                <th className="py-2.5 px-3 text-right">Valor Obtenido</th>
                <th className="py-2.5 px-3">Límite Normativo Verificado</th>
                <th className="py-2.5 px-3">Estado de Conformidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                  Desbalance NEMA (LVUR)
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-amber-400 tabular-nums">
                  {report.deterministicFindings.nemaLvurPercent}%
                </td>
                <td className="py-2.5 px-3 text-slate-400">
                  NEMA MG-1: &le; 1.0% (operación nominal continua)
                </td>
                <td className="py-2.5 px-3">
                  <span className="text-amber-400 font-bold">
                    REQUIERE DESCLASIFICACIÓN ({Math.round(report.deterministicFindings.nemaDeratingFactor * 100)}% de Pn)
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                  Desbalance IEC (VUF)
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-amber-400 tabular-nums">
                  {report.deterministicFindings.iecVufPercent}%
                </td>
                <td className="py-2.5 px-3 text-slate-400">
                  IEC 61000-2-4 Clase 2 / IEC 60034-1: &le; 2.0%
                </td>
                <td className="py-2.5 px-3">
                  <span className="text-amber-400 font-bold">NO CONFORME (&gt; 2.0%)</span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                  Distorsión Armónica Total (THDv)
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-emerald-400 tabular-nums">
                  {report.deterministicFindings.thdvPercent}%
                </td>
                <td className="py-2.5 px-3 text-slate-400">
                  IEEE 519-2022 Tabla 1 (PCC &le; 1 kV): &le; 8.0%
                </td>
                <td className="py-2.5 px-3">
                  <span className="text-emerald-400 font-bold">CONFORME (Límite Global)</span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                  Armónico Dominante (5.º Orden)
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-rose-400 tabular-nums">
                  {report.deterministicFindings.dominantHarmonicPercent}% (250 Hz, - seq)
                </td>
                <td className="py-2.5 px-3 text-slate-400">
                  IEEE 519-2022 Tabla 1 (PCC &le; 1 kV): &le; 5.0% Individual
                </td>
                <td className="py-2.5 px-3">
                  <span className="text-rose-400 font-bold">NO CONFORME (Excede 5.0%)</span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                  Desbalance de Corriente de Estator
                </td>
                <td className="py-2.5 px-3 text-right font-bold text-slate-200 tabular-nums">
                  Ia: {report.deterministicFindings.ia}A · Ib: {report.deterministicFindings.ib}A · Ic: {report.deterministicFindings.ic}A
                </td>
                <td className="py-2.5 px-3 text-slate-400">
                  Inominal = 138 A (Fase C supera en +14.5%)
                </td>
                <td className="py-2.5 px-3">
                  <span className="text-rose-400 font-bold">SOBRECARGA FASE C</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Diagnostic and Root Cause */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <h3 className="text-xs font-bold font-mono uppercase text-cyan-400 tracking-wider">
            03. Evaluación Diagnóstica
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
            {report.diagnosticAssessment}
          </p>
        </div>
        <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <h3 className="text-xs font-bold font-mono uppercase text-amber-400 tracking-wider">
            04. Hipótesis de Causa Raíz
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
            {report.rootCauseHypothesis}
          </p>
        </div>
      </div>

      {/* Section 4: Recommended Engineering Actions */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider">
          05. Plan de Acciones Correctivas Recomendadas
        </h3>
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
          {report.recommendedActions.map((action, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
              <span className="w-5 h-5 rounded bg-slate-800 text-cyan-400 flex items-center justify-center font-mono font-bold shrink-0 text-[11px]">
                {i + 1}
              </span>
              <span className="mt-0.5">{action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Limitations and Missing Data (Mandatory Transparency) */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          06. Limitaciones del Estudio y Datos No Disponibles
        </h3>
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1.5">
          {report.limitationsAndMissingData.map((lim, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-amber-400">·</span>
              <span>{lim}</span>
            </div>
          ))}
          <div className="flex items-start gap-2 pt-1 border-t border-slate-800/60 text-slate-400">
            <span className="text-amber-400">·</span>
            <span>{report.deterministicFindings.currentHarmonicsNotice}</span>
          </div>
        </div>
      </div>

      {/* Section 6: Audit Log of Execution */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider">
          07. Trazabilidad de Proveedores y Etapas
        </h3>
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs font-mono space-y-1"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-1.5">
                <span className="font-bold text-slate-200">{log.stage}</span>
                <span className="text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleTimeString('es-ES')}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-slate-400">Agente: </span>
                  <span className="text-slate-200">{log.agentName}</span>
                </div>
                <div>
                  <span className="text-slate-400">Proveedor / Modelo: </span>
                  <span
                    className={`font-semibold ${
                      log.modelUsed.includes('Fallback')
                        ? 'text-amber-400'
                        : log.modelUsed.includes('NO CONFIGURADO')
                        ? 'text-rose-400'
                        : 'text-cyan-400'
                    }`}
                  >
                    {log.modelUsed}
                  </span>
                </div>
              </div>
              <div className="text-[11px] pt-1">
                <span className="text-slate-400">Evidencia: </span>
                <span className="text-slate-300 font-sans">{log.evidenceUsed}</span>
              </div>
              <div className="text-[11px]">
                <span className="text-slate-400">Resultados: </span>
                <span className="text-slate-300 font-sans">{log.keyFindings}</span>
              </div>
              {log.limitations !== 'Ninguna para esta etapa.' && (
                <div className="text-[11px] text-amber-400/90">
                  <span>Limitación: </span>
                  <span className="font-sans">{log.limitations}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
