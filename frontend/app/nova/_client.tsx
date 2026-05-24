"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { NovaCVUpload } from "@/components/nova/nova-cv-upload"
import { NovaScoreCard } from "@/components/nova/nova-score-card"
import { NovaAnalysisView } from "@/components/nova/nova-analysis-view"
import { listCVs, getAnalysis } from "@/modules/nova/cv-service"
import type { NovaCV, NovaAnalysis } from "@/modules/nova/types"

export function NovaDashboard() {
  const [cvs, setCVs] = useState<NovaCV[]>([])
  const [selectedCVId, setSelectedCVId] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<NovaAnalysis | null>(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [view, setView] = useState<"list" | "upload">("list")
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    loadCVs()
  }, [])

  async function loadCVs() {
    try {
      const data = await listCVs()
      setCVs(data)
      if (data.length > 0 && !selectedCVId) {
        selectCV(data[0].id)
      }
    } finally {
      setInitialLoading(false)
    }
  }

  async function selectCV(cvId: string) {
    setSelectedCVId(cvId)
    setAnalysis(null)
    setLoadingAnalysis(true)
    try {
      const a = await getAnalysis(cvId)
      setAnalysis(a)
    } catch {
      // no analysis yet
    } finally {
      setLoadingAnalysis(false)
    }
  }

  async function handleUploadComplete(cvId: string) {
    setView("list")
    await loadCVs()
    selectCV(cvId)
  }

  const selectedCV = cvs.find((c) => c.id === selectedCVId)

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-sm text-zinc-500">Cargando tus CVs…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50">
            Nova <span className="text-violet-600">CV Intelligence</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Análisis de IA para optimizar tu hoja de vida
          </p>
        </div>
        <button
          onClick={() => setView(view === "upload" ? "list" : "upload")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
        >
          {view === "upload" ? (
            <>← Mis CVs</>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Subir CV
            </>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === "upload" ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
          >
            <div className="text-center mb-8">
              <p className="text-zinc-600 dark:text-zinc-400">
                Nova analizará tu CV con IA y te dará un diagnóstico completo en segundos.
              </p>
            </div>
            <NovaCVUpload onComplete={handleUploadComplete} />
          </motion.div>
        ) : cvs.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-5"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Tu primer análisis de CV</h2>
              <p className="text-zinc-500 mt-2 max-w-sm">
                Sube tu CV y Nova lo analizará con IA para darte un diagnóstico ATS, técnico y de recruiter.
              </p>
            </div>
            <button
              onClick={() => setView("upload")}
              className="px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors"
            >
              Analizar mi CV ahora
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* CV list sidebar */}
            <div className="lg:col-span-1">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Mis CVs</p>
              <div className="space-y-2">
                {cvs.map((cv) => (
                  <button
                    key={cv.id}
                    onClick={() => selectCV(cv.id)}
                    className={`w-full text-left rounded-xl px-4 py-3 border transition-colors ${
                      selectedCVId === cv.id
                        ? "border-violet-300 bg-violet-50 dark:border-violet-700 dark:bg-violet-950/30"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-violet-200 dark:hover:border-violet-800"
                    }`}
                  >
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">{cv.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusDot status={cv.status} />
                      <p className="text-xs text-zinc-500 capitalize">{cv.status}</p>
                      {cv.word_count && (
                        <p className="text-xs text-zinc-400">· {cv.word_count} palabras</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Analysis panel */}
            <div className="lg:col-span-2 space-y-5">
              {loadingAnalysis ? (
                <div className="flex items-center justify-center py-20">
                  <motion.div
                    className="w-8 h-8 rounded-full border-4 border-violet-200 border-t-violet-600"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              ) : analysis ? (
                <>
                  {selectedCV && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Analizando</p>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-100">{selectedCV.name}</p>
                    </div>
                  )}
                  <NovaScoreCard analysis={analysis} />
                  <NovaAnalysisView analysis={analysis} />
                </>
              ) : selectedCV?.status === "processing" ? (
                <div className="flex flex-col items-center gap-4 py-16">
                  <motion.div
                    className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="text-sm text-zinc-500">Nova está analizando tu CV…</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-16">
                  <p className="text-zinc-500">No hay análisis para este CV.</p>
                  <button
                    onClick={() => selectedCVId && fetch(`/api/nova/cv/${selectedCVId}/analyze`, { method: "POST" }).then(() => selectCV(selectedCVId))}
                    className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
                  >
                    Analizar ahora
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ready: "bg-emerald-500",
    processing: "bg-amber-500 animate-pulse",
    pending: "bg-zinc-400",
    error: "bg-red-500",
  }
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${colors[status] ?? "bg-zinc-400"}`} />
}
