"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  Upload,
  Sparkles,
  ChevronDown,
  Loader2,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CvAnalysis } from "@/lib/hyre-types"

interface CvReaderPanelProps {
  userName?: string
}

export function CvReaderPanel({ userName }: CvReaderPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<CvAnalysis | null>(null)
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const [source, setSource] = useState<"vision" | "document" | "text" | null>(null)
  const [showExtracted, setShowExtracted] = useState(false)

  const analyzeFile = async (file: File) => {
    setLoading(true)
    setError(null)
    setFileName(file.name)
    setExtractedText(null)
    setSource(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/cv/analyze", {
        method: "POST",
        body: formData,
      })

      const data = (await res.json()) as {
        analysis?: CvAnalysis
        extractedText?: string
        source?: "vision" | "document" | "text"
        error?: string
      }

      if (!res.ok) {
        const msg = data.error ?? "No se pudo analizar el CV"
        if (res.status === 503 && msg.includes("GEMINI_API_KEY")) {
          throw new Error(
            "Falta configurar la IA. Agrega GEMINI_API_KEY en frontend/.env.local (local) o en Vercel → Settings → Environment Variables (produccion), luego reinicia el servidor.",
          )
        }
        throw new Error(msg)
      }

      if (!data.analysis) {
        throw new Error("La IA no devolvio un analisis valido.")
      }

      setAnalysis(data.analysis)
      setExtractedText(data.extractedText ?? null)
      setSource(data.source ?? null)
      setOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) analyzeFile(file)
    e.target.value = ""
  }

  return (
    <div className="px-6 mb-6">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.png,.jpg,.jpeg,.webp,application/pdf,text/plain,image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        onClick={() => (analysis ? setOpen(!open) : inputRef.current?.click())}
        disabled={loading}
        className="w-full p-4 glass rounded-xl flex items-center gap-4 hover:bg-white/10 transition-colors disabled:opacity-60"
      >
        <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/20 flex items-center justify-center shrink-0">
          {loading ? (
            <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin" />
          ) : (
            <FileText className="w-6 h-6 text-[#7C3AED]" />
          )}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-[#F1F5F9] font-medium">Lector de CV</p>
          <p className="text-[#94A3B8] text-xs truncate">
            {loading
              ? "Leyendo documento con IA..."
              : fileName
                ? fileName
                : "Sube tu CV (PDF, PNG, JPG o TXT) — analisis real con IA"}
          </p>
        </div>
        {analysis ? (
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-5 h-5 text-[#94A3B8]" />
          </motion.div>
        ) : (
          <Upload className="w-5 h-5 text-[#94A3B8] shrink-0" />
        )}
      </button>

      {error && (
        <p className="mt-2 text-[#EF4444] text-xs px-1">{error}</p>
      )}

      {!analysis && !loading && (
        <Button
          variant="outline"
          className="w-full mt-3 h-10 glass border-[#7C3AED]/30 text-[#7C3AED] hover:bg-[#7C3AED]/10"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          Subir curriculum
        </Button>
      )}

      <AnimatePresence>
        {open && analysis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4">
              {source === "vision" && (
                <div className="px-3 py-2 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-xs">
                  Analisis real extraido de la imagen con OCR + IA
                </div>
              )}

              {extractedText && (
                <div className="glass rounded-xl p-4">
                  <button
                    type="button"
                    onClick={() => setShowExtracted(!showExtracted)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <p className="text-[#F1F5F9] text-sm font-medium">Texto detectado en el CV</p>
                    <ChevronDown
                      className={`w-4 h-4 text-[#94A3B8] transition-transform ${showExtracted ? "rotate-180" : ""}`}
                    />
                  </button>
                  {showExtracted && (
                    <pre className="mt-3 text-[#94A3B8] text-xs leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {extractedText}
                    </pre>
                  )}
                </div>
              )}

              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                  <p className="text-[#F1F5F9] text-sm font-medium">
                    Resumen IA{userName ? ` — ${userName}` : ""}
                  </p>
                </div>
                <p className="text-[#94A3B8] text-sm leading-relaxed">{analysis.summary}</p>
              </div>

              <Section title="Puntos clave" icon={<Target className="w-4 h-4 text-[#06B6D4]" />}>
                <ul className="space-y-2">
                  {analysis.keyPoints.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-[#94A3B8] text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                      {point}
                    </li>
                  ))}
                </ul>
              </Section>

              {analysis.skills.length > 0 && (
                <Section title="Habilidades detectadas" icon={<Sparkles className="w-4 h-4 text-[#7C3AED]" />}>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-full bg-[#7C3AED]/20 text-[#7C3AED] text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {analysis.experience.length > 0 && (
                <Section title="Experiencia" icon={<Briefcase className="w-4 h-4 text-[#06B6D4]" />}>
                  <div className="space-y-2">
                    {analysis.experience.map((exp) => (
                      <div key={`${exp.role}-${exp.company}`} className="text-sm">
                        <p className="text-[#F1F5F9] font-medium">{exp.role}</p>
                        <p className="text-[#94A3B8] text-xs">
                          {exp.company} · {exp.duration}
                        </p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {analysis.education.length > 0 && (
                <Section title="Formacion" icon={<GraduationCap className="w-4 h-4 text-[#F59E0B]" />}>
                  <ul className="space-y-1">
                    {analysis.education.map((edu) => (
                      <li key={edu} className="text-[#94A3B8] text-sm">
                        {edu}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {analysis.strengths.length > 0 && (
                <Section title="Fortalezas" icon={<CheckCircle2 className="w-4 h-4 text-[#10B981]" />}>
                  <div className="flex flex-wrap gap-2">
                    {analysis.strengths.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] text-xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {analysis.suggestions.length > 0 && (
                <Section title="Sugerencias de mejora" icon={<Lightbulb className="w-4 h-4 text-[#F59E0B]" />}>
                  <ul className="space-y-1.5">
                    {analysis.suggestions.map((s) => (
                      <li key={s} className="text-[#94A3B8] text-xs leading-relaxed">
                        • {s}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              <Button
                variant="outline"
                className="w-full h-10 glass border-white/10 text-[#94A3B8] hover:text-[#F1F5F9]"
                onClick={() => inputRef.current?.click()}
                disabled={loading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir otro CV
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <p className="text-[#F1F5F9] text-sm font-medium">{title}</p>
      </div>
      {children}
    </div>
  )
}
