"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { uploadCV, analyzeCV } from "@/modules/nova/cv-service"

interface NovaCVUploadProps {
  onComplete: (cvId: string) => void
}

type UploadState = "idle" | "uploading" | "analyzing" | "done" | "error"

const ACCEPT = ".pdf,.docx,.doc,.txt"

export function NovaCVUpload({ onComplete }: NovaCVUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<UploadState>("idle")
  const [progress, setProgress] = useState("")
  const [error, setError] = useState("")
  const [dragging, setDragging] = useState(false)

  async function handleFile(file: File) {
    if (!file) return
    setError("")
    setState("uploading")
    setProgress("Subiendo archivo…")

    try {
      const { cv_id } = await uploadCV(file, { name: file.name.replace(/\.[^.]+$/, "") })

      setState("analyzing")
      setProgress("Nova está analizando tu CV con IA…")

      await analyzeCV(cv_id)

      setState("done")
      setProgress("¡Análisis listo!")
      onComplete(cv_id)
    } catch (err: any) {
      setState("error")
      setError(err.message ?? "Error inesperado")
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const isLoading = state === "uploading" || state === "analyzing"

  return (
    <div className="w-full max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {state === "idle" || state === "error" ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
              dragging
                ? "border-violet-400 bg-violet-50 dark:bg-violet-950/20"
                : "border-zinc-300 dark:border-zinc-700 hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-950/10"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
                  Sube tu CV aquí
                </p>
                <p className="text-sm text-zinc-500 mt-1">
                  PDF, DOCX o TXT — máx. 10 MB
                </p>
              </div>
              <button
                type="button"
                className="mt-1 px-5 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
              >
                Seleccionar archivo
              </button>

              {state === "error" && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-5 py-10"
          >
            <div className="relative w-16 h-16">
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-violet-200 dark:border-violet-900"
              />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-600"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <div className="text-center">
              <p className="font-semibold text-zinc-800 dark:text-zinc-100">{progress}</p>
              {state === "analyzing" && (
                <p className="text-sm text-zinc-500 mt-1">
                  Esto puede tomar 15-30 segundos
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
