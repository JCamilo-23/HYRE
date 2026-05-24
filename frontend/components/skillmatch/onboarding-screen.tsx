"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, MapPin, Briefcase, Zap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface OnboardingScreenProps {
  onComplete: () => void
}

const ROLES = [
  "Frontend", "Backend", "Full Stack", "Diseño UX/UI",
  "Marketing Digital", "Ventas", "Datos / IA", "Product Manager", "Otro",
]

const SKILLS = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL",
  "Figma", "CSS", "Git", "Java", "Vue", "Angular", "Flutter", "Kotlin",
  "Excel / Sheets", "Comunicación", "Liderazgo", "Inglés",
]

const MODALITIES = [
  { id: "remote", label: "Remoto", emoji: "💻" },
  { id: "hybrid", label: "Híbrido", emoji: "🏢" },
  { id: "onsite", label: "Presencial", emoji: "📍" },
]

function TagChip({
  label,
  selected,
  onClick,
  accent = "#7C3AED",
}: {
  label: string
  selected: boolean
  onClick: () => void
  accent?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
      style={{
        backgroundColor: selected ? `${accent}33` : "#1A1A2E",
        color: selected ? accent : "#94A3B8",
        border: `1px solid ${selected ? accent : "rgba(255,255,255,0.1)"}`,
      }}
    >
      {label}
    </button>
  )
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0)
  const [role, setRole] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [city, setCity] = useState("")
  const [modality, setModality] = useState("")
  const [saving, setSaving] = useState(false)

  const toggleSkill = (s: string) =>
    setSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])

  const canNext = () => {
    if (step === 0) return role !== ""
    if (step === 1) return skills.length > 0
    if (step === 2) return city.trim() !== "" && modality !== ""
    return true
  }

  const handleNext = async () => {
    if (step < 2) {
      setStep(step + 1)
      return
    }
    // Guardar en candidate_profiles
    setSaving(true)
    try {
      await fetch("/api/candidate/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, skills, city, modality }),
      })
    } catch {
      // No bloqueamos si falla
    } finally {
      setSaving(false)
    }
    onComplete()
  }

  const steps = [
    { icon: Briefcase, label: "Tu rol" },
    { icon: Zap, label: "Tus skills" },
    { icon: MapPin, label: "Tu ciudad" },
  ]

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= step ? "#7C3AED" : "#1A1A2E" }}
          />
        ))}
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <>
                <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2">¿Qué rol buscas?</h1>
                <p className="text-[#94A3B8] text-sm mb-6">
                  Así te conectamos con las empresas correctas
                </p>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((r) => (
                    <TagChip
                      key={r}
                      label={r}
                      selected={role === r}
                      onClick={() => setRole(r)}
                    />
                  ))}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2">¿Qué sabes hacer?</h1>
                <p className="text-[#94A3B8] text-sm mb-6">
                  Selecciona tus habilidades — mínimo una
                </p>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map((s) => (
                    <TagChip
                      key={s}
                      label={s}
                      selected={skills.includes(s)}
                      onClick={() => toggleSkill(s)}
                      accent="#06B6D4"
                    />
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2">¿Dónde estás?</h1>
                <p className="text-[#94A3B8] text-sm mb-6">
                  Tu ciudad y preferencia de trabajo
                </p>
                <div className="mb-6">
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Ciudad
                  </label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ej. Barranquilla, Colombia"
                    className="h-12 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#7C3AED]"
                  />
                </div>
                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-3">
                    Modalidad preferida
                  </label>
                  <div className="flex flex-col gap-2">
                    {MODALITIES.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setModality(m.id)}
                        className="flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                        style={{
                          backgroundColor: modality === m.id ? "#7C3AED22" : "#1A1A2E",
                          border: `1px solid ${modality === m.id ? "#7C3AED" : "rgba(255,255,255,0.1)"}`,
                        }}
                      >
                        <span className="text-2xl">{m.emoji}</span>
                        <span className="text-[#F1F5F9] font-medium">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3 mt-8">
        <Button
          onClick={handleNext}
          disabled={!canNext() || saving}
          className="w-full h-14 btn-primary-gradient text-[#F1F5F9] font-medium text-base flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {step === 2 ? "¡Listo, buscar matches!" : "Siguiente"}
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </Button>
        {step < 2 && (
          <button
            onClick={onComplete}
            className="text-[#475569] text-sm text-center hover:text-[#94A3B8] transition-colors"
          >
            Saltar por ahora
          </button>
        )}
      </div>
    </div>
  )
}
