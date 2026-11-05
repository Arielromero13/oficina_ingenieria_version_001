# Oficina Virtual de Ingeniería: MVP de Agentes Autónomos (Plan Final)

Oficina virtual de ingeniería interactiva en pixel art isométrico (diseño original, sobrio y liviano), con Orquestador nativo en Google AI Studio (`gemini-3.8-flash`), Oficial de RR. HH. con catálogo dinámico de perfiles (Qwen / DeepSeek / Gemini), cálculo determinista riguroso de calidad de energía (IEEE 519-2022 y NEMA MG-1) y flujo de aprobación técnica reservado a Ariel Romero.

---

## Criterios Técnicos y Normativos Validados

### 1. Calidad de Tensión según IEEE 519-2022 (Tabla 1 - Límites de Distorsión de Tensión en PCC)
- Para tensiones en el Punto de Acoplamiento Común (PCC) con $V \le 1.0\text{ kV}$:
  - **Distorsión armónica individual máxima**: $5.0\%$
  - **Distorsión armónica total de tensión ($THD_v$)**: $8.0\%$
- Para cada armónico analizado (fundamental 50/60 Hz, 3.º, 5.º, 7.º, etc.), se evalúa contra el límite individual del $5.0\%$, y el $THD_v$ global se evalúa contra el $8.0\%$. Si la tensión de barra fuera de media tensión ($1\text{ kV} < V \le 69\text{ kV}$), se documenta que los límites serían $3.0\%$ individual y $5.0\%$ total.

### 2. Separación Estricta de Desbalance de Tensión: NEMA (LVUR) vs. IEC (VUF)
- **Desbalance NEMA (Line Voltage Unbalance Rate - LVUR)**:
  $$\text{LVUR} = \frac{\max(|V_{ab} - V_{prom}|, |V_{bc} - V_{prom}|, |V_{ca} - V_{prom}|)}{V_{prom}} \times 100\%$$
  - Criterio NEMA MG-1 Parte 14.36 / 20.43: Límite para operación nominal $\le 1.0\%$. Desbalances superiores requieren desclasificación (derating factor) del motor. No se recomienda operar por encima de $5.0\%$.
- **Desbalance IEC (Voltage Unbalance Factor - VUF)**:
  $$VUF = \frac{|V_-|}{|V_+|} \times 100\%$$
  - Obtenido mediante componentes simétricas de secuencia inversa ($V_-$) y secuencia directa ($V_+$) a través de la transformación de Fortescue. Límite típico de referencia IEC 61000-2-4 Clase 2 / IEC 60034-1: $\le 2.0\%$.
- Se presentan como dos magnitudes independientes y claramente rotuladas en los resultados deterministas.

### 3. Exclusión de Fórmulas Empíricas de Pérdidas
- Se excluyen estimaciones empíricas no normalizadas de pérdidas de energía. El análisis se enfoca exclusivamente en mediciones deterministas de magnitudes eléctricas reales, desbalances, armónicos y temperatura de devanado registrada en el relé de protección.

### 4. Estado de Aprobación y Responsabilidad Profesional
- El informe técnico generado por el Orquestador queda **siempre por defecto como Borrador Técnico Pendiente de Revisión** con estado `PENDING_REVIEW`.
- La condición de `APROBADO` y la firma profesional de **Ariel Romero (Ingeniero Responsable)** solo se incorpora tras una acción explícita del usuario mediante el botón "Aprobar y Emitir Dictamen Final".

### 5. Validación del Modelo Gemini
- Se utiliza el modelo admitido y activo de Google GenAI: `gemini-3.8-flash`. Si el usuario define `GEMINI_MODEL`, se valida que sea un modelo soportado (`gemini-3.8-flash`, `gemini-3.1-flash-lite`, `gemini-4-argon`) antes de invocar la API, arrojando error descriptivo si el identificador no es válido.

---

## Arquitectura y Módulos de Ejecución

1. **Backend Express (`server.ts`)**:
   - Monta Vite dev middleware.
   - Endpoint `/api/config`: Retorna estado real de proveedores (`gemini`: configurado/no configurado, `qwen`: no configurado/configurado, `deepseek`: no configurado/configurado).
   - Endpoint `/api/power-quality/calculate`: Función matemática pura determinista para $V_{rms}$, $I_{rms}$, $THD_v$, $THD_i$, armónicos dominantes, NEMA LVUR (%) e IEC VUF (%).
   - Endpoint `/api/orchestrator/dispatch`: Orquestador modular con `@google/genai` (`gemini-3.8-flash`) para analizar el encargo, sintetizar evidencia determinista y generar el borrador de dictamen técnico.
2. **Lienzo Isométrico Pixel Art (`IsometricOffice.tsx`)**:
   - Renderizado en canvas / SVG pixel art con 4 zonas de trabajo:
     1. Despacho del Orquestador (Gemini)
     2. Estación de RR. HH. (Oficial y archivo de especialistas)
     3. Banco de Calidad de Energía (Analizador de redes y osciloscopio)
     4. Mesa de Dictamen y Aprobación (Pizarra de resultados y carpeta de entregable)
   - Estados visuales reales vinculados a la máquina de estados del encargo.
3. **Panel de Ingeniería y Entregable (`EngineeringConsole.tsx` & `ReportView.tsx`)**:
   - Selección de dataset sintético claramente rotulado (`Bomba Centrífuga P-204 - 75 kW / 400 V`).
   - Gráficas deterministas SVG de espectro armónico y forma de onda trifásica.
   - Tabla de límites normativos verificados (IEEE 519-2022 y NEMA MG-1).
   - Trazabilidad de proveedor, modelo y limitaciones.
   - Botón de aprobación explícita de Ariel Romero y descarga del informe técnico en Markdown/impresión.
