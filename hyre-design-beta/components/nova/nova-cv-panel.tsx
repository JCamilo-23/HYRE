"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { FileText, Loader2, Upload, AlertCircle, ChevronRight, RefreshCw } from "lucide-react"
import { uploadCV, analyzeCV, listCVs, getAnalysis } from "@/modules/nova/cv-service"
import type { NovaAnalysis } from "@/modules/nova/types"

type PanelState = "loading" | "empty" | "uploading" | "analyzing" | "ready" | "error"

interface NovaCVPanelProps {
  onNavigateToNova?: () => void
}

const SCORE_KEYS = [
  { key: "score_general" as const, label: "General" },
  { key: "score_ats" as const, label: "ATS" },
  { key: "score_technical" as const, label: "Técnico" },
  { key: "score_recruiter" as const, label: "Recruiter" },
  { key: "score_visual" as const, label: "Visual" },
]

function scoreColor(v: number) {
  if (v >= 80) return "#10B981"
  if (v >= 60) return "#F59E0B"
  return "#EF4444"
}

export function NovaCVPanel({ onNavigateToNova }: NovaCVPanelProps) {
  const [panelState, setPanelState] = useState<PanelState>("loading")
  const [analysis, setAnalysis] = useState<NovaAnalysis | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let mounted = true
    listCVs()
      .then(async (cvs) => {
        if (!mounted) return
        if (cvs.length === 0) { setPanelState("empty"); return }
        const latest = cvs[0]
        if (latest.latest_analysis) {
          if (mounted) { setAnalysis(latest.latest_analysis); setPanelState("ready") }
          return
        }
        try {
          const result = await getAnalysis(latest.id)
          if (mounted) { setAnalysis(result); setPanelState("ready") }
        } catch {
          if (mounted) setPanelState("empty")
        }
      })
      .catch(() => { if (mounted) setPanelState("empty") })
    return () => { mounted = false }
  }, [])

  async function handleFile(file: File) {
    setErrorMsg("")
    setPanelState("uploading")
    try {
      const { cv_id } = await uploadCV(file, { name: file.name.replace(/\.[^.]+$/, "") })
      setPanelState("analyzing")
      await analyzeCV(cv_id)
      // Re-fetch analysis after a short delay
      await new Promise((r) => setTimeout(r, 2000))
      const result = await getAnalysis(cv_id)
      setAnalysis(result)
      setPanelState("ready")
    } catch (err: any) {
      setErrorMsg(err.message ?? "Error al procesar el CV")
      setPanelState("error")
    }
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ""
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  if (panelState === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#7C3AED]" />
      </div>
    )
  }

  if (panelState === "uploading") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
        <p className="text-[#94A3B8] text-sm text-center">Subiendo tu CV...</p>
      </div>
    )
  }

  if (panelState === "analyzing") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center"
        >
          <FileText className="w-6 h-6 text-white" />
        </motion.div>
        <p className="text-[#F1F5F9] font-medium text-sm">Nova está analizando tu CV...</p>
        <p className="text-[#94A3B8] text-xs text-center">Esto puede tardar unos segundos</p>
      </div>
    )
  }

  if (panelState === "error") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6">
        <AlertCircle className="w-8 h-8 text-[#EF4444]" />
        <p className="text-[#EF4444] text-sm text-center">{errorMsg || "Algo salió mal"}</p>
        <button
          onClick={() => setPanelState("empty")}
          className="flex items-center gap-2 text-[#7C3AED] text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    )
  }

  if (panelState === "ready" && analysis) {
    const general = analysis.score_general
    return (
      <div className="flex-1 flex flex-col gap-4 px-1 overflow-y-auto">
        {/* Score general */}
        <div className="text-center">
          <p className="text-[#94A3B8] text-xs mb-1">Score general</p>
          <span
            className="text-4xl font-bold"
            style={{ color: scoreColor(general) }}
          >
            {general}
          </span>
          <span className="text-[#94A3B8] text-sm">/100</span>
        </div>

        {/* Mini score bars */}
        <div className="flex flex-col gap-2">
          {SCORE_KEYS.filter((s) => s.key !== "score_general").map(({ key, label }) => {
            const val = analysis[key] ?? 0
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[#94A3B8] text-xs w-20 shrink-0">{label}</span>
                <div className="flex-1 h-1.5 bg-[#1A1A2E] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${val}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: scoreColor(val) }}
                  />
                </div>
                <span className="text-xs font-medium w-6 text-right" style={{ color: scoreColor(val) }}>
                  {val}
                </span>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-1">
          {onNavigateToNova && (
            <button
              onClick={onNavigateToNova}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-[#7C3AED]/20 text-[#7C3AED] text-xs font-medium hover:bg-[#7C3AED]/30 transition-colors"
            >
              Ver detalle <ChevronRight className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => inputRef.current?.click()}
            className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl glass text-[#94A3B8] text-xs hover:bg-white/10 transition-colors"
          >
            <Upload className="w-3 h-3" />
            Nuevo
          </button>
        </div>

        <input ref={inputRef} type="file" accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={onFileInput} />
      </div>
    )
  }

  // empty state — drop zone
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`w-full flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
          dragging ? "border-[#7C3AED] bg-[#7C3AED]/10" : "border-[#475569]/50 hover:border-[#7C3AED]/50"
        }`}
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED]/30 to-[#06B6D4]/20 flex items-center justify-center">
          <FileText className="w-6 h-6 text-[#7C3AED]" />
        </div>
        <div className="text-center">
          <p className="text-[#F1F5F9] text-sm font-medium">Sube tu CV para analizarlo</p>
          <p className="text-[#94A3B8] text-xs mt-1">PDF, DOCX o TXT · Score ATS, técnico y recruiter</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-medium">
          <Upload className="w-3 h-3" />
          Seleccionar archivo
        </div>
      </div>
      <input ref={inputRef} type="file" accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={onFileInput} />
    </div>
  )
}
