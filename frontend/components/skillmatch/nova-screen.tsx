"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Upload, Sparkles, ChevronRight, X, Send, Loader2 } from "lucide-react"
import { Screen } from "@/lib/hyre-types"
import { uploadCV, analyzeCV, listCVs, getAnalysis } from "@/modules/nova/cv-service"
import { useNovaChat } from "@/modules/nova/hooks"
import type { NovaCV, NovaAnalysis } from "@/modules/nova/types"

interface NovaScreenProps {
  onNavigate: (screen: Screen) => void
}

type Tab = "cv" | "chat"
type UploadState = "idle" | "uploading" | "analyzing" | "done" | "error"

const SCORE_LABELS: Record<string, string> = {
  score_general: "General",
  score_ats: "ATS",
  score_technical: "Técnico",
  score_recruiter: "Recruiter",
  score_visual: "Visual",
  score_communication: "Comunicación",
}

function scoreColor(n: number) {
  if (n >= 80) return { text: "text-emerald-400", bar: "bg-emerald-500" }
  if (n >= 60) return { text: "text-amber-400", bar: "bg-amber-500" }
  return { text: "text-red-400", bar: "bg-red-500" }
}

export function NovaScreen({ onNavigate }: NovaScreenProps) {
  const [tab, setTab] = useState<Tab>("cv")

  return (
    <div className="min-h-screen pb-24 safe-area-top flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-0">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#F1F5F9]">Nova</h1>
            <p className="text-xs text-[#94A3B8]">AI Career Intelligence</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-[#1E293B] mb-5">
          <button
            onClick={() => setTab("cv")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "cv"
                ? "bg-[#7C3AED] text-white"
                : "text-[#94A3B8] hover:text-[#F1F5F9]"
            }`}
          >
            Mi CV
          </button>
          <button
            onClick={() => setTab("chat")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "chat"
                ? "bg-[#7C3AED] text-white"
                : "text-[#94A3B8] hover:text-[#F1F5F9]"
            }`}
          >
            Chat
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === "cv" ? (
          <motion.div key="cv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 px-6">
            <CVIntelligence />
          </motion.div>
        ) : (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col px-6">
            <NovaChatInline />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── CV Intelligence ─────────────────────────────── */

function CVIntelligence() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [cvs, setCVs] = useState<NovaCV[]>([])
  const [analysis, setAnalysis] = useState<NovaAnalysis | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [uploadMsg, setUploadMsg] = useState("")
  const [error, setError] = useState("")
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"actions" | "weaknesses" | "ats" | "strengths">("actions")

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const data = await listCVs()
      setCVs(data)
      if (data.length > 0 && data[0].status === "ready") {
        const a = await getAnalysis(data[0].id)
        setAnalysis(a)
      }
    } catch {
      // usuario sin sesión o sin CVs
    } finally {
      setLoading(false)
    }
  }

  async function handleFile(file: File) {
    setError("")
    setUploadState("uploading")
    setUploadMsg("Subiendo archivo…")
    try {
      const { cv_id } = await uploadCV(file, { name: file.name.replace(/\.[^.]+$/, "") })
      setUploadState("analyzing")
      setUploadMsg("Nova analiza tu CV con IA…")
      await analyzeCV(cv_id)
      setUploadState("done")
      await loadData()
    } catch (err: any) {
      setUploadState("error")
      setError(err.message ?? "Error inesperado")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <motion.div className="w-8 h-8 rounded-full border-4 border-[#7C3AED]/30 border-t-[#7C3AED]"
          animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
      </div>
    )
  }

  // Upload / analyzing state
  if (uploadState === "uploading" || uploadState === "analyzing") {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-5">
        <motion.div className="w-12 h-12 rounded-full border-4 border-[#7C3AED]/30 border-t-[#7C3AED]"
          animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
        <div className="text-center">
          <p className="text-[#F1F5F9] font-semibold">{uploadMsg}</p>
          {uploadState === "analyzing" && (
            <p className="text-[#94A3B8] text-sm mt-1">Esto tarda 15–30 segundos</p>
          )}
        </div>
      </div>
    )
  }

  // No CV yet — show uploader
  if (cvs.length === 0 || !analysis) {
    return (
      <div className="flex flex-col gap-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
            dragging ? "border-[#7C3AED] bg-[#7C3AED]/10" : "border-[#334155] hover:border-[#7C3AED]/60"
          }`}
        >
          <input ref={inputRef} type="file" accept=".pdf,.docx,.doc,.txt" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
              <Upload className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-[#F1F5F9] font-semibold">Sube tu CV aquí</p>
              <p className="text-[#94A3B8] text-sm mt-1">PDF, DOCX o TXT — máx. 10 MB</p>
            </div>
            <button type="button"
              className="px-5 py-2 rounded-xl bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] transition-colors">
              Seleccionar archivo
            </button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </div>
        </div>

        <div className="glass rounded-2xl p-4">
          <p className="text-[#94A3B8] text-xs font-semibold uppercase tracking-wide mb-3">Qué analiza Nova</p>
          <div className="flex flex-col gap-2">
            {["Puntaje ATS y compatibilidad", "Fortalezas y debilidades", "Keywords que te faltan", "Mejora de bullets con IA", "Acciones prioritarias en minutos"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
                <p className="text-[#94A3B8] text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Analysis result
  const scores = [
    { key: "score_general", val: analysis.score_general },
    { key: "score_ats", val: analysis.score_ats },
    { key: "score_technical", val: analysis.score_technical },
    { key: "score_recruiter", val: analysis.score_recruiter },
    { key: "score_visual", val: analysis.score_visual },
    { key: "score_communication", val: analysis.score_communication },
  ]
  const mainScore = analysis.score_general
  const { text: mainText } = scoreColor(mainScore)

  return (
    <div className="flex flex-col gap-4">
      {/* Score summary */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[#94A3B8] text-xs mb-1">Puntuación general</p>
            <p className={`text-4xl font-black ${mainText}`}>{mainScore}</p>
            <p className="text-[#94A3B8] text-xs mt-1">
              {mainScore >= 80 ? "CV competitivo ✓" : mainScore >= 60 ? "Requiere mejoras" : "Necesita trabajo"}
            </p>
          </div>
          <button
            onClick={() => { setAnalysis(null); setCVs([]); setUploadState("idle") }}
            className="p-2 rounded-xl bg-[#1E293B] text-[#94A3B8] hover:text-[#F1F5F9]"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {scores.slice(1).map(({ key, val }, i) => {
            const { text, bar } = scoreColor(val)
            return (
              <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.07 }}>
                <div className="flex justify-between mb-1">
                  <span className="text-[#94A3B8] text-xs">{SCORE_LABELS[key]}</span>
                  <span className={`text-xs font-bold ${text}`}>{val}</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#1E293B] overflow-hidden">
                  <motion.div className={`h-full rounded-full ${bar}`}
                    initial={{ width: 0 }} animate={{ width: `${val}%` }}
                    transition={{ duration: 0.7, delay: i * 0.07 + 0.2, ease: "easeOut" }} />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Feedback summary */}
      {analysis.feedback_summary && (
        <div className="rounded-2xl p-4" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
          <p className="text-[#C4B5FD] text-sm leading-relaxed">{analysis.feedback_summary}</p>
        </div>
      )}

      {/* Detail tabs */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex border-b border-white/5">
          {(["actions", "weaknesses", "ats", "strengths"] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                activeTab === t ? "text-[#7C3AED] border-b-2 border-[#7C3AED]" : "text-[#94A3B8]"
              }`}>
              {t === "actions" ? "Acciones" : t === "weaknesses" ? "Debilidades" : t === "ats" ? "ATS" : "Fortalezas"}
            </button>
          ))}
        </div>

        <div className="p-4 max-h-72 overflow-y-auto space-y-3">
          {activeTab === "actions" && analysis.top_actions.map((a) => (
            <div key={a.priority} className="flex gap-3">
              <div className="w-6 h-6 rounded-lg bg-[#7C3AED] text-white text-xs font-bold flex items-center justify-center shrink-0">{a.priority}</div>
              <div>
                <p className="text-[#F1F5F9] text-sm font-medium">{a.action}</p>
                <p className="text-[#94A3B8] text-xs mt-0.5">{a.impact}</p>
                <span className="text-xs text-[#475569] bg-[#1E293B] px-2 py-0.5 rounded-full mt-1 inline-block">{a.time_estimate}</span>
              </div>
            </div>
          ))}

          {activeTab === "weaknesses" && analysis.weaknesses.map((w, i) => (
            <div key={i} className="rounded-xl border border-white/5 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  w.impact === "critical" ? "bg-red-900/40 text-red-400" :
                  w.impact === "high" ? "bg-orange-900/40 text-orange-400" :
                  "bg-yellow-900/40 text-yellow-400"
                }`}>{w.impact}</span>
                <p className="text-[#F1F5F9] text-sm font-medium">{w.category}</p>
              </div>
              <p className="text-[#94A3B8] text-xs">{w.description}</p>
            </div>
          ))}

          {activeTab === "ats" && (
            <>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {analysis.sections_missing.map((s) => (
                  <span key={s} className="text-xs bg-red-900/30 text-red-400 px-2 py-0.5 rounded-full">Falta: {s}</span>
                ))}
              </div>
              {analysis.ats_issues.map((issue, i) => (
                <div key={i} className="rounded-xl border border-white/5 p-3">
                  <p className="text-[#F1F5F9] text-sm font-medium mb-1">{issue.issue}</p>
                  <p className="text-[#94A3B8] text-xs mb-1">{issue.description}</p>
                  <p className="text-[#7C3AED] text-xs">→ {issue.fix}</p>
                </div>
              ))}
              {analysis.ats_issues.length === 0 && <p className="text-emerald-400 text-sm text-center py-3">Sin problemas ATS detectados</p>}
            </>
          )}

          {activeTab === "strengths" && analysis.strengths.map((s, i) => (
            <div key={i} className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div>
                <p className="text-[#F1F5F9] text-sm font-medium">{s.category}</p>
                <p className="text-[#94A3B8] text-xs">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[#475569] text-xs text-center">
        Analizado con {analysis.model_used} · {Math.round(analysis.processing_time_ms / 1000)}s
      </p>
    </div>
  )
}

/* ── Chat inline ─────────────────────────────────── */

function NovaChatInline() {
  const { messages, isTyping, sendMessage } = useNovaChat()
  const [input, setInput] = useState("")
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const send = async (text?: string) => {
    const val = (text ?? input).trim()
    if (!val) return
    setInput("")
    await sendMessage(val)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-220px)]">
      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user" ? "bg-[#7C3AED] text-white" : "bg-[#1E293B] text-[#F1F5F9] border border-white/5"
              }`}>
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-white/5 bg-[#1E293B] px-4 py-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-[#7C3AED]" />
              <span className="text-xs text-[#94A3B8]">Nova está escribiendo…</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#1E293B] p-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send() } }}
          placeholder="Escribe tu mensaje…"
          className="flex-1 bg-transparent px-3 py-2 text-sm text-[#F1F5F9] outline-none placeholder:text-[#475569]"
        />
        <button onClick={() => void send()} disabled={!input.trim() || isTyping}
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
            input.trim() && !isTyping ? "bg-[#7C3AED] text-white hover:bg-[#6D28D9]" : "bg-[#0A0A12] text-[#475569]"
          }`}>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
