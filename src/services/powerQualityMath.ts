/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DeterministicEvaluation,
  HarmonicComponent,
  SyntheticDataset,
} from '../types/engineering';

/**
 * Calculates NEMA Line Voltage Unbalance Rate (LVUR)
 * Reference: NEMA MG-1 Part 14.36 / Part 20.43
 * LVUR = (Maximum deviation from average line voltage / Average line voltage) * 100
 */
export function calculateNemaLvur(vab: number, vbc: number, vca: number): {
  vAvg: number;
  maxDev: number;
  lvurPercent: number;
  compliant: boolean;
  deratingFactor: number;
  notes: string;
} {
  const vAvg = (vab + vbc + vca) / 3;
  const devAb = Math.abs(vab - vAvg);
  const devBc = Math.abs(vbc - vAvg);
  const devCa = Math.abs(vca - vAvg);
  const maxDev = Math.max(devAb, devBc, devCa);
  const lvurPercent = (maxDev / vAvg) * 100;

  const compliant = lvurPercent <= 1.0;

  // Derating factor approximation based on NEMA MG-1 curve
  let deratingFactor = 1.0;
  let notes = '';

  if (compliant) {
    deratingFactor = 1.0;
    notes = 'Operación nominal permisible (LVUR <= 1.0%). No requiere desclasificación.';
  } else if (lvurPercent <= 5.0) {
    // Polynomial fit matching NEMA MG-1 curve: 1% -> 1.00, 2% -> 0.95, 3% -> 0.88, 4% -> 0.82, 5% -> 0.75
    const x = lvurPercent - 1.0;
    deratingFactor = Math.max(0.75, +(1.0 - 0.038 * x - 0.006 * x * x).toFixed(3));
    notes = `Desbalance superior al límite nominal (1.0%). Requiere desclasificar motor a ${Math.round(
      deratingFactor * 100
    )}% de la potencia nominal según NEMA MG-1 para evitar sobrecalentamiento en devanados.`;
  } else {
    deratingFactor = 0.70;
    notes = 'Desbalance crítico (> 5.0%). NEMA MG-1 no recomienda la operación del motor bajo estas condiciones por riesgo severo de daño al aislamiento.';
  }

  return {
    vAvg: +vAvg.toFixed(2),
    maxDev: +maxDev.toFixed(2),
    lvurPercent: +lvurPercent.toFixed(2),
    compliant,
    deratingFactor,
    notes,
  };
}

/**
 * Calculates IEC Voltage Unbalance Factor (VUF)
 * Reference: IEC 61000-2-4 Class 2 / IEC 60034-1
 * VUF = (|V-| / |V+|) * 100
 * Calculated from line-to-line voltage magnitudes using the symmetrical component formulation
 */
export function calculateIecVuf(vab: number, vbc: number, vca: number): {
  vufPercent: number;
  compliant: boolean;
  notes: string;
} {
  const v1sq = vab * vab;
  const v2sq = vbc * vbc;
  const v3sq = vca * vca;

  const sumSq = v1sq + v2sq + v3sq;
  const sumQuart = v1sq * v1sq + v2sq * v2sq + v3sq * v3sq;

  // Exact magnitude-based sequence ratio formula:
  // beta = (V1^4 + V2^4 + V3^4) / (V1^2 + V2^2 + V3^2)^2
  // VUF = sqrt( (1 - sqrt(3 - 6*beta)) / (1 + sqrt(3 - 6*beta)) ) * 100%
  const beta = sumQuart / (sumSq * sumSq);
  const radical = 3 - 6 * beta;

  let vufPercent = 0;
  if (radical >= 0 && radical <= 1) {
    const sqrtRad = Math.sqrt(radical);
    const num = 1 - sqrtRad;
    const den = 1 + sqrtRad;
    if (den > 0 && num >= 0) {
      vufPercent = Math.sqrt(num / den) * 100;
    }
  }

  // Safety fallback if degenerate:
  if (isNaN(vufPercent) || vufPercent <= 0) {
    const vAvg = (vab + vbc + vca) / 3;
    vufPercent = (Math.max(Math.abs(vab - vAvg), Math.abs(vbc - vAvg), Math.abs(vca - vAvg)) / vAvg) * 88;
  }

  const vufRounded = +vufPercent.toFixed(2);
  const compliant = vufRounded <= 2.0;
  const notes = compliant
    ? 'Conforme con IEC 61000-2-4 Clase 2 (VUF <= 2.0%).'
    : `No conforme con IEC 61000-2-4 Clase 2. VUF (${vufRounded}%) excede el umbral estándar de 2.0%, induciendo corrientes de secuencia negativa que generan par de frenado y calentamiento del rotor.`;

  return {
    vufPercent: vufRounded,
    compliant,
    notes,
  };
}

/**
 * Calculates Voltage THD and checks IEEE 519-2022 Table 1 (PCC <= 1 kV)
 * - Individual harmonic voltage limit: 5.0%
 * - Total harmonic voltage distortion (THDv) limit: 8.0%
 */
export function evaluateHarmonicsAndIeee519(
  harmonics: { order: number; voltagePercent: number }[],
  fundamentalFreqHz: number = 50
): {
  thdvPercent: number;
  harmonicSpectrum: HarmonicComponent[];
  dominantHarmonicOrder: number;
  dominantHarmonicPercent: number;
  ieee519PccVoltageLimit: string;
  ieee519IndividualLimitPercent: number;
  ieee519TotalLimitPercent: number;
  ieee519IndividualViolations: number[];
  ieee519TotalCompliant: boolean;
  ieee519OverallCompliant: boolean;
  ieee519Notes: string;
} {
  // Sum squares of harmonics from order 2 up to max order
  let sumSquares = 0;
  let dominantOrder = 1;
  let dominantMag = 0;
  const individualViolations: number[] = [];

  const individualLimit = 5.0; // IEEE 519-2022 Table 1 for V <= 1 kV
  const totalLimit = 8.0; // IEEE 519-2022 Table 1 for V <= 1 kV

  const spectrum: HarmonicComponent[] = harmonics.map((h) => {
    const freq = h.order * fundamentalFreqHz;
    // Sequence identification for 3-phase systems
    let sequence: 'positive' | 'negative' | 'zero' = 'zero';
    if (h.order % 3 === 1) sequence = 'positive';
    else if (h.order % 3 === 2) sequence = 'negative';
    else sequence = 'zero';

    if (h.order > 1) {
      sumSquares += h.voltagePercent * h.voltagePercent;
      if (h.voltagePercent > dominantMag) {
        dominantMag = h.voltagePercent;
        dominantOrder = h.order;
      }
      if (h.voltagePercent > individualLimit) {
        individualViolations.push(h.order);
      }
    }

    return {
      order: h.order,
      frequencyHz: freq,
      voltagePercent: +h.voltagePercent.toFixed(2),
      sequence,
      exceedsIndividualIeee519: h.order > 1 && h.voltagePercent > individualLimit,
    };
  });

  const thdvPercent = +Math.sqrt(sumSquares).toFixed(2);
  const ieee519TotalCompliant = thdvPercent <= totalLimit;
  const ieee519OverallCompliant = ieee519TotalCompliant && individualViolations.length === 0;

  let ieee519Notes = '';
  if (ieee519OverallCompliant) {
    ieee519Notes = `Conforme con IEEE 519-2022 Tabla 1 (PCC <= 1 kV). THDv (${thdvPercent}%) <= ${totalLimit}% y todas las componentes individuales <= ${individualLimit}%.`;
  } else if (!ieee519TotalCompliant && individualViolations.length > 0) {
    ieee519Notes = `No conforme con IEEE 519-2022 Tabla 1 (PCC <= 1 kV). THDv (${thdvPercent}%) excede el límite total de ${totalLimit}% y las órdenes armónicas [${individualViolations.join(
      ', '
    )}] superan el límite individual de ${individualLimit}%.`;
  } else if (individualViolations.length > 0) {
    ieee519Notes = `Disconformidad parcial en IEEE 519-2022 Tabla 1 (PCC <= 1 kV). Si bien el THDv total (${thdvPercent}%) se encuentra por debajo del límite global de ${totalLimit}%, el armónico de orden ${individualViolations.join(
      ', '
    )} excede el límite individual permisible de ${individualLimit}%.`;
  } else {
    ieee519Notes = `No conforme con IEEE 519-2022 Tabla 1 (PCC <= 1 kV). THDv (${thdvPercent}%) excede el límite global de ${totalLimit}%.`;
  }

  return {
    thdvPercent,
    harmonicSpectrum: spectrum,
    dominantHarmonicOrder: dominantOrder,
    dominantHarmonicPercent: +dominantMag.toFixed(2),
    ieee519PccVoltageLimit: 'V <= 1.0 kV (PCC en Baja Tensión)',
    ieee519IndividualLimitPercent: individualLimit,
    ieee519TotalLimitPercent: totalLimit,
    ieee519IndividualViolations: individualViolations,
    ieee519TotalCompliant,
    ieee519OverallCompliant,
    ieee519Notes,
  };
}

/**
 * Full deterministic evaluation of power quality dataset
 */
export function evaluatePowerQualityDataset(dataset: SyntheticDataset): DeterministicEvaluation {
  const { lineVoltagesV, phaseCurrentsA, harmonics } = dataset.measurements;
  const { vab, vbc, vca } = lineVoltagesV;
  const { ia, ib, ic } = phaseCurrentsA;

  const iAvg = +( (ia + ib + ic) / 3 ).toFixed(2);
  const nema = calculateNemaLvur(vab, vbc, vca);
  const iec = calculateIecVuf(vab, vbc, vca);
  const harmonicsEval = evaluateHarmonicsAndIeee519(harmonics, dataset.nominalParameters.frequencyHz);

  const currentNotice =
    'Límites de distorsión de corriente según IEEE 519-2022 Tabla 2 requieren conocer la relación de cortocircuito Isc/IL en el PCC. Dado que el ensayo no incluye ensayo de impedancia de red ni valor Isc de acometida, la evaluación de TDD de corriente se señala como dato no disponible en la muestra.';

  return {
    vab,
    vbc,
    vca,
    vAvg: nema.vAvg,
    vMaxDeviation: nema.maxDev,
    ia,
    ib,
    ic,
    iAvg,
    nemaLvurPercent: nema.lvurPercent,
    nemaCompliant: nema.compliant,
    nemaDeratingFactor: nema.deratingFactor,
    nemaNotes: nema.notes,
    iecVufPercent: iec.vufPercent,
    iecCompliant: iec.compliant,
    iecNotes: iec.notes,
    thdvPercent: harmonicsEval.thdvPercent,
    harmonicSpectrum: harmonicsEval.harmonicSpectrum,
    dominantHarmonicOrder: harmonicsEval.dominantHarmonicOrder,
    dominantHarmonicPercent: harmonicsEval.dominantHarmonicPercent,
    ieee519PccVoltageLimit: harmonicsEval.ieee519PccVoltageLimit,
    ieee519IndividualLimitPercent: harmonicsEval.ieee519IndividualLimitPercent,
    ieee519TotalLimitPercent: harmonicsEval.ieee519TotalLimitPercent,
    ieee519IndividualViolations: harmonicsEval.ieee519IndividualViolations,
    ieee519TotalCompliant: harmonicsEval.ieee519TotalCompliant,
    ieee519OverallCompliant: harmonicsEval.ieee519OverallCompliant,
    ieee519Notes: harmonicsEval.ieee519Notes,
    currentHarmonicsNotice: currentNotice,
  };
}

/**
 * Generates instantaneous waveform points for plotting deterministic 3-phase curves
 */
export function generateWaveformPoints(
  vabRms: number,
  vbcRms: number,
  vcaRms: number,
  harmonics: { order: number; voltagePercent: number }[],
  freqHz: number = 50,
  cycles: number = 2,
  pointsPerCycle: number = 50
): { tMs: number; vab: number; vbc: number; vca: number }[] {
  const periodSec = 1 / freqHz;
  const totalTimeSec = cycles * periodSec;
  const totalPoints = cycles * pointsPerCycle;
  const dt = totalTimeSec / totalPoints;
  const omega = 2 * Math.PI * freqHz;

  const vabPeak = vabRms * Math.SQRT2;
  const vbcPeak = vbcRms * Math.SQRT2;
  const vcaPeak = vcaRms * Math.SQRT2;

  const points: { tMs: number; vab: number; vbc: number; vca: number }[] = [];

  for (let i = 0; i <= totalPoints; i++) {
    const t = i * dt;
    const tMs = +(t * 1000).toFixed(2);

    // Fundamental components with 120-degree phase shift
    let v1_ab = vabPeak * Math.sin(omega * t);
    let v1_bc = vbcPeak * Math.sin(omega * t - (2 * Math.PI) / 3);
    let v1_ca = vcaPeak * Math.sin(omega * t + (2 * Math.PI) / 3);

    // Add harmonics (orders 3, 5, 7, etc.)
    for (const h of harmonics) {
      if (h.order <= 1) continue;
      const hRatio = h.voltagePercent / 100;
      const hOmega = h.order * omega;

      // Phase sequence for harmonics in 3-phase systems:
      // positive sequence (orders 4, 7, 10, 13...) -> shift 0, -120, +120
      // negative sequence (orders 2, 5, 8, 11, 14...) -> shift 0, +120, -120
      // zero sequence (orders 3, 6, 9, 12, 15...) -> shift 0, 0, 0
      let phaseShiftBc = 0;
      let phaseShiftCa = 0;

      if (h.order % 3 === 1) {
        phaseShiftBc = -(2 * Math.PI) / 3;
        phaseShiftCa = (2 * Math.PI) / 3;
      } else if (h.order % 3 === 2) {
        phaseShiftBc = (2 * Math.PI) / 3;
        phaseShiftCa = -(2 * Math.PI) / 3;
      }

      v1_ab += vabPeak * hRatio * Math.sin(hOmega * t);
      v1_bc += vbcPeak * hRatio * Math.sin(hOmega * t + phaseShiftBc);
      v1_ca += vcaPeak * hRatio * Math.sin(hOmega * t + phaseShiftCa);
    }

    points.push({
      tMs,
      vab: +v1_ab.toFixed(1),
      vbc: +v1_bc.toFixed(1),
      vca: +v1_ca.toFixed(1),
    });
  }

  return points;
}
