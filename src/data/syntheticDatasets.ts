/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AgentProfile, SyntheticDataset } from '../types/engineering';

export const SYNTHETIC_DATASETS: SyntheticDataset[] = [
  {
    id: 'p204-motor-75kw',
    isSynthetic: true,
    label: '[DATOS SINTÉTICOS DE PRUEBA] Bomba Centrífuga P-204 (Motor 75 kW / 400 V)',
    equipmentName: 'Bomba Centrífuga de Alimentación P-204',
    location: 'Estación de Bombeo Principal - Bahía de Servicios Auxiliares',
    nominalParameters: {
      voltageLineV: 400,
      frequencyHz: 50,
      powerKw: 75,
      fullLoadCurrentA: 138,
      synchronousRpm: 1500,
      insulationClass: 'Clase F (Límite 155 °C, Alarma a 125 °C)',
    },
    operationalContext:
      'Motor acoplado a bomba centrífuga de agua tratada, alimentado desde Centro de Control de Motores (CCM-02) a través de un variador de frecuencia de 6 pulsos (VFD) con bypass electromecánico. Se opera en régimen continuo a 85% de carga.',
    eventDescription:
      'Disparos térmicos reiterados del relé de protección estatórica tras 40-50 minutos de operación continua. La sonda RTD Pt100 interna registró 132 °C en la fase C (por encima del umbral de alarma de 125 °C). El personal de mantenimiento constató vibración incrementada en 100 Hz y 300 Hz.',
    measurements: {
      lineVoltagesV: {
        vab: 408.0,
        vbc: 394.0,
        vca: 388.0,
      },
      phaseCurrentsA: {
        ia: 142.0,
        ib: 135.0,
        ic: 158.0,
      },
      harmonics: [
        { order: 1, voltagePercent: 100.0 },
        { order: 3, voltagePercent: 1.4 },
        { order: 5, voltagePercent: 5.8 }, // Violates individual 5.0% limit of IEEE 519-2022
        { order: 7, voltagePercent: 3.2 },
        { order: 9, voltagePercent: 0.6 },
        { order: 11, voltagePercent: 1.1 },
        { order: 13, voltagePercent: 0.8 },
        { order: 15, voltagePercent: 0.4 },
      ],
      statorTemperatureC: 132.0,
      ambientTemperatureC: 28.5,
      thermalRelayTripped: true,
      tripDelayMinutes: 46,
    },
  },
  {
    id: 'k101-compressor-45kw',
    isSynthetic: true,
    label: '[DATOS SINTÉTICOS DE PRUEBA] Compresor de Aire K-101 (Condición Nominal)',
    equipmentName: 'Compresor de Aire de Instrumentos K-101',
    location: 'Sala de Compresores - Planta Central',
    nominalParameters: {
      voltageLineV: 400,
      frequencyHz: 50,
      powerKw: 45,
      fullLoadCurrentA: 82,
      synchronousRpm: 3000,
      insulationClass: 'Clase F (Límite 155 °C, Alarma a 125 °C)',
    },
    operationalContext:
      'Compresor de tornillo rotativo con arrancador suave y filtros LC pasivos en acometida. Ensayo de referencia en régimen estable.',
    eventDescription:
      'Lectura de rutina mensual. Operación estable sin disparos de protección ni alarmas térmicas. Sirve como línea base de comparación.',
    measurements: {
      lineVoltagesV: {
        vab: 401.0,
        vbc: 399.0,
        vca: 400.0,
      },
      phaseCurrentsA: {
        ia: 76.0,
        ib: 77.0,
        ic: 76.5,
      },
      harmonics: [
        { order: 1, voltagePercent: 100.0 },
        { order: 3, voltagePercent: 0.8 },
        { order: 5, voltagePercent: 2.1 },
        { order: 7, voltagePercent: 1.4 },
        { order: 9, voltagePercent: 0.3 },
        { order: 11, voltagePercent: 0.6 },
        { order: 13, voltagePercent: 0.4 },
        { order: 15, voltagePercent: 0.2 },
      ],
      statorTemperatureC: 84.0,
      ambientTemperatureC: 26.0,
      thermalRelayTripped: false,
      tripDelayMinutes: 0,
    },
  },
];

export const AVAILABLE_AGENT_CATALOG: AgentProfile[] = [
  {
    id: 'orchestrator-gemini',
    name: 'Orquestador Técnico',
    role: 'Director del Encargo & Síntesis',
    department: 'Dirección de Operaciones',
    specialty: 'Desglose de requerimientos, auditoría cruzada y ensamblaje de dictámenes',
    provider: 'gemini',
    modelId: 'gemini-3.8-flash',
    avatarColor: '#2563EB', // Blue
    workstationId: 'orchestrator',
    status: 'idle',
    statusNote: 'Listo en despacho central',
  },
  {
    id: 'hr-officer',
    name: 'Oficial de RR. HH.',
    role: 'Coordinador de Cuadrillas & Recursos',
    department: 'Gestión de Perfiles',
    specialty: 'Convocatoria de especialistas pertinentes y optimización de contexto efímero',
    provider: 'gemini',
    modelId: 'gemini-3.8-flash',
    avatarColor: '#10B981', // Emerald
    workstationId: 'hr',
    status: 'idle',
    statusNote: 'Catálogo de perfiles activo',
  },
  {
    id: 'power-spec-qwen',
    name: 'Ing. Espectro y Armónicos',
    role: 'Especialista en Señales de Red',
    department: 'Laboratorio Eléctrico',
    specialty: 'Análisis espectral FFT, armónicos de secuencia negativa e IEEE 519-2022',
    provider: 'qwen',
    modelId: 'qwen-2.5-coder',
    avatarColor: '#8B5CF6', // Purple
    workstationId: 'power_lab',
    status: 'idle',
    statusNote: 'Disponible en catálogo (requiere credencial API o autorización de fallback)',
  },
  {
    id: 'root-cause-deepseek',
    name: 'Ing. Causa Raíz y FMEA',
    role: 'Analista de Fallas Electromecánicas',
    department: 'Confiabilidad y Mantenimiento',
    specialty: 'Correlación de temperatura, par inverso, desbalance NEMA y fatiga térmica',
    provider: 'deepseek',
    modelId: 'deepseek-chat',
    avatarColor: '#0EA5E9', // Sky
    workstationId: 'power_lab',
    status: 'idle',
    statusNote: 'Disponible en catálogo (requiere credencial API o autorización de fallback)',
  },
  {
    id: 'auditor-gemini',
    name: 'Auditor Normativo IEEE/NEMA',
    role: 'Especialista en Estándares y Seguridad',
    department: 'Garantía de Calidad Técnica',
    specialty: 'Verificación de tablas normativas IEEE 519, IEC 61000 y derating NEMA MG-1',
    provider: 'gemini',
    modelId: 'gemini-3.8-flash',
    avatarColor: '#F59E0B', // Amber
    workstationId: 'review_board',
    status: 'idle',
    statusNote: 'Listo en mesa de revisión',
  },
];
