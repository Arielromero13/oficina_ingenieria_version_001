/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo, useRef, useState } from "react";
import { Bot, FileText, LoaderCircle, Paperclip, Send, X } from "lucide-react";
import { AgentProfile, DeterministicEvaluation, ProviderInfo, ProviderId, SyntheticDataset } from "../../types/engineering";

type Attachment = { name: string; content: string };
type Message = { id: string; role: "user" | "assistant"; text: string; detail?: string; files?: string[] };
type Props = { agents: AgentProfile[]; providers: ProviderInfo[]; dataset: SyntheticDataset; evaluation: DeterministicEvaluation; allowGeminiFallback: boolean };
const extensions = [".txt", ".md", ".csv", ".json", ".log", ".yaml", ".yml", ".xml"];

export const OfficeAssistant: React.FC<Props> = ({ agents, providers, dataset, evaluation, allowGeminiFallback }) => {
  const [targetId, setTargetId] = useState("orchestrator");
  const [draft, setDraft] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ id: "welcome", role: "assistant", text: "Cuéntame qué necesitas revisar. Puedes adjuntar mediciones, registros o notas; el equipo usará el contexto del encargo activo.", detail: "Orquestador técnico · Gemini" }]);
  const inputRef = useRef<HTMLInputElement>(null);
  const targets = useMemo(() => [{ id: "orchestrator", name: "Orquestador técnico", role: "Coordina el encargo y sintetiza la respuesta.", provider: "gemini" as ProviderId }, ...agents.map((a) => ({ id: a.id, name: a.name, role: a.role, provider: a.provider }))], [agents]);
  const target = targets.find((item) => item.id === targetId) || targets[0];
  const provider = providers.find((item) => item.id === target.provider);
  const configured = Boolean(provider && provider.status !== "not_configured");
  const canSend = Boolean(draft.trim() || files.length) && !busy && (configured || allowGeminiFallback);

  const addFiles = async (list: FileList | null) => {
    if (!list) return;
    setError("");
    const next = [...files];
    for (const file of Array.from(list)) {
      const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      if (!extensions.includes(ext)) { setError("Admite TXT, Markdown, CSV, JSON, LOG, YAML y XML."); continue; }
      if (file.size > 256 * 1024) { setError(file.name + " supera 256 KB."); continue; }
      if (next.length >= 3) { setError("Puedes adjuntar hasta 3 archivos por consulta."); break; }
      try { next.push({ name: file.name, content: await file.text() }); }
      catch { setError("No se pudo leer " + file.name + " como texto."); }
    }
    setFiles(next);
    if (inputRef.current) inputRef.current.value = "";
  };

  const send = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!canSend) return;
    const question = draft.trim() || "Revisa los archivos adjuntos y dime qué hallazgos encuentras.";
    const sentFiles = files;
    const history = messages.filter((m) => m.id !== "welcome").slice(-8).map((m) => ({ role: m.role, content: m.text }));
    setMessages((current) => [...current, { id: "u" + Date.now(), role: "user", text: question, files: sentFiles.map((f) => f.name) }]);
    setDraft(""); setFiles([]); setError(""); setBusy(true);
    try {
      const response = await fetch("/api/workspace/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        targetProvider: target.provider, targetAgent: target.name, targetRole: target.role, message: question, history, attachments: sentFiles, allowGeminiFallback,
        context: { equipmentName: dataset.equipmentName, location: dataset.location, isSynthetic: dataset.isSynthetic, eventDescription: dataset.eventDescription, operationalContext: dataset.operationalContext, deterministicMetrics: { nemaLvurPercent: evaluation.nemaLvurPercent, iecVufPercent: evaluation.iecVufPercent, thdvPercent: evaluation.thdvPercent, dominantHarmonicOrder: evaluation.dominantHarmonicOrder, dominantHarmonicPercent: evaluation.dominantHarmonicPercent, ia: evaluation.ia, ib: evaluation.ib, ic: evaluation.ic } }
      }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "La consulta no pudo completarse.");
      setMessages((current) => [...current, { id: "a" + Date.now(), role: "assistant", text: result.reply, detail: result.agentName + " · " + result.providerName + " · " + result.model + (result.fallback ? " · respaldo autorizado" : "") }]);
    } catch (err) { setError(err instanceof Error ? err.message : "Error de conexión."); }
    finally { setBusy(false); }
  };

  return <section className="overflow-hidden rounded-2xl border border-cyan-900/60 bg-slate-900 shadow-xl shadow-slate-950/30">
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 bg-gradient-to-r from-cyan-950/50 to-slate-900 px-5 py-4">
      <div className="flex items-start gap-3"><div className="rounded-xl border border-cyan-800/70 bg-cyan-950/70 p-2.5 text-cyan-300"><Bot className="h-5 w-5" /></div><div><p className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-cyan-400">Puesto de trabajo</p><h2 className="mt-1 text-lg font-bold text-slate-100">Habla con la oficina</h2><p className="mt-1 max-w-2xl text-sm text-slate-400">Escribe una consulta y agrega archivos para que el orquestador o un especialista los revise.</p></div></div>
      <label className="grid gap-1 text-xs text-slate-400"><span className="font-mono uppercase tracking-wide">Consultar a</span><select value={targetId} onChange={(e) => setTargetId(e.target.value)} aria-label="Seleccionar agente para la consulta" className="min-w-56 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500">{targets.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.provider}</option>)}</select></label>
    </div>
    <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex min-h-[340px] flex-col"><div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-5" aria-live="polite">
        {messages.map((m) => <div key={m.id} className={"flex gap-3 " + (m.role === "user" ? "justify-end" : "justify-start")}>{m.role === "assistant" && <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-950 text-cyan-300"><Bot className="h-4 w-4" /></div>}<div className={"max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed " + (m.role === "user" ? "bg-blue-600 text-white" : "border border-slate-800 bg-slate-950 text-slate-200")}><p className="whitespace-pre-wrap">{m.text}</p>{m.files?.length ? <p className="mt-2 text-xs text-blue-100">Adjuntos: {m.files.join(", ")}</p> : null}{m.detail ? <p className="mt-2 border-t border-slate-800 pt-2 text-[10px] font-mono text-slate-500">{m.detail}</p> : null}</div></div>)}
        {busy && <div className="flex items-center gap-2 pl-11 text-xs font-mono text-cyan-300"><LoaderCircle className="h-4 w-4 animate-spin" /> {target.name} está trabajando…</div>}
      </div>
      <form onSubmit={(e) => void send(e)} className="border-t border-slate-800 bg-slate-950/70 p-4">
        {files.length > 0 && <div className="mb-3 flex flex-wrap gap-2">{files.map((f) => <span key={f.name} className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300"><FileText className="h-3.5 w-3.5 text-cyan-400" />{f.name}<button type="button" onClick={() => setFiles((current) => current.filter((x) => x.name !== f.name))} aria-label={"Quitar " + f.name} className="text-slate-500 hover:text-white"><X className="h-3.5 w-3.5" /></button></span>)}</div>}
        <div className="flex items-end gap-2"><input ref={inputRef} type="file" multiple accept={extensions.join(",")} className="hidden" onChange={(e) => void addFiles(e.target.files)} /><button type="button" onClick={() => inputRef.current?.click()} aria-label="Adjuntar archivos" className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-slate-700 px-3 text-xs font-semibold text-slate-300 transition hover:border-cyan-700 hover:text-cyan-300"><Paperclip className="h-4 w-4" /><span className="hidden sm:inline">Adjuntar</span></button>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} rows={2} placeholder="Ej.: revisa este registro y dime qué datos faltan para diagnosticar la falla…" aria-label="Escribe tu consulta" className="min-h-11 flex-1 resize-y rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-500" />
          <button type="submit" disabled={!canSend} aria-label="Enviar consulta" className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-cyan-600 px-3 text-sm font-bold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}<span className="hidden sm:inline">Enviar</span></button></div>
        <p className="mt-2 text-[10px] text-slate-500">Hasta 3 archivos de texto · 256 KB por archivo · el contenido se envía al proveedor seleccionado.</p>{error && <p role="alert" className="mt-2 text-xs text-rose-300">{error}</p>}
      </form></div>
      <aside className="border-t border-slate-800 bg-slate-950/40 p-4 lg:border-l lg:border-t-0"><h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">Estado del agente</h3><div className="mt-3 rounded-xl border border-slate-800 bg-slate-950 p-3"><p className="text-sm font-semibold text-slate-100">{target.name}</p><p className="mt-1 text-xs leading-relaxed text-slate-400">{target.role}</p><div className="mt-3 flex items-center justify-between gap-2"><span className="rounded-md bg-slate-900 px-2 py-1 text-[10px] font-mono uppercase text-cyan-300">{target.provider}</span><span className={"text-[10px] font-mono " + (configured ? "text-emerald-400" : allowGeminiFallback ? "text-amber-300" : "text-rose-300")}>{configured ? provider?.configuredModel : allowGeminiFallback ? "Respaldo Gemini autorizado" : "Proveedor sin configurar"}</span></div></div>
        {!configured && !allowGeminiFallback && <p className="mt-3 rounded-lg border border-amber-900/60 bg-amber-950/30 p-3 text-xs leading-relaxed text-amber-200">Configura la clave del proveedor en Secrets o activa el respaldo explícito a Gemini en la consola del encargo.</p>}
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3"><p className="text-[10px] font-mono uppercase tracking-wide text-slate-500">Contexto activo</p><p className="mt-2 text-xs font-semibold text-slate-200">{dataset.equipmentName}</p><p className="mt-1 text-[11px] text-slate-500">{dataset.isSynthetic ? "Datos sintéticos de demostración" : "Datos del usuario"} · {dataset.location}</p><p className="mt-2 text-[11px] leading-relaxed text-slate-400">NEMA {evaluation.nemaLvurPercent}% · IEC {evaluation.iecVufPercent}% · THDv {evaluation.thdvPercent}%</p></div>
      </aside>
    </div>
  </section>;
};
