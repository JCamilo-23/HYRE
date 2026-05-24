"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Heart,
  Loader2,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  BENEFIT_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  CULTURE_OPTIONS,
  CompanyProfile,
  INDUSTRY_OPTIONS,
} from "@/lib/hyre-types"

interface CompanyOnboardingScreenProps {
  contactName: string
  onComplete: (profile: CompanyProfile) => void
  onBack: () => void
}

const STEPS = [
  { id: 1, title: "Tu empresa", icon: Building2 },
  { id: 2, title: "Cultura", icon: Heart },
  { id: 3, title: "Primera vacante", icon: Sparkles },
] as const

const emptyProfile: CompanyProfile = {
  companyName: "",
  industry: "",
  size: "",
  location: "",
  remotePolicy: "hybrid",
  description: "",
  culture: [],
  benefits: [],
  vacancyTitle: "",
  vacancyRequirements: [],
  salaryMin: "",
  salaryMax: "",
  vacancyRemote: false,
}

function TagSelector({
  options,
  selected,
  onChange,
  accent = "#06B6D4",
}: {
  options: readonly string[]
  selected: string[]
  onChange: (tags: string[]) => void
  accent?: string
}) {
  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag))
    } else {
      onChange([...selected, tag])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((tag) => {
        const isSelected = selected.includes(tag)
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
            style={{
              backgroundColor: isSelected ? `${accent}33` : "#1A1A2E",
              color: isSelected ? accent : "#94A3B8",
              border: `1px solid ${isSelected ? accent : "rgba(255,255,255,0.1)"}`,
            }}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}

export function CompanyOnboardingScreen({
  contactName,
  onComplete,
  onBack,
}: CompanyOnboardingScreenProps) {
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<CompanyProfile>(emptyProfile)
  const [requirementInput, setRequirementInput] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (partial: Partial<CompanyProfile>) => {
    setProfile((prev) => ({ ...prev, ...partial }))
  }

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (step === 0) {
      if (!profile.companyName.trim()) newErrors.companyName = "Ingresa el nombre de la empresa"
      if (!profile.industry) newErrors.industry = "Selecciona una industria"
      if (!profile.size) newErrors.size = "Selecciona el tamano"
      if (!profile.location.trim()) newErrors.location = "Ingresa la ubicacion"
    }

    if (step === 1) {
      if (!profile.description.trim()) newErrors.description = "Describe tu empresa"
      if (profile.culture.length === 0) newErrors.culture = "Selecciona al menos un valor"
      if (profile.benefits.length === 0) newErrors.benefits = "Selecciona al menos un beneficio"
    }

    if (step === 2) {
      if (!profile.vacancyTitle.trim()) newErrors.vacancyTitle = "Ingresa el titulo de la vacante"
      if (profile.vacancyRequirements.length === 0) {
        newErrors.vacancyRequirements = "Agrega al menos un requisito"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (!validateStep()) return

    if (step < STEPS.length - 1) {
      setStep(step + 1)
      return
    }

    setIsLoading(true)
    try {
      await fetch("/api/company/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })
    } catch {
      // No bloqueamos el flujo si falla — los datos se guardan igualmente en estado local
    } finally {
      setIsLoading(false)
    }
    onComplete(profile)
  }

  const addRequirement = () => {
    const trimmed = requirementInput.trim()
    if (!trimmed || profile.vacancyRequirements.includes(trimmed)) return
    update({ vacancyRequirements: [...profile.vacancyRequirements, trimmed] })
    setRequirementInput("")
  }

  const firstName = contactName.split(" ")[0] || "equipo"

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
      <button
        onClick={step === 0 ? onBack : () => setStep(step - 1)}
        className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver
      </button>

      <div className="mb-6">
        <p className="text-[#06B6D4] text-sm font-medium mb-1">
          Paso {step + 1} de {STEPS.length}
        </p>
        <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2">
          {step === 0 && `Hola ${firstName}, cuentanos de tu empresa`}
          {step === 1 && "Como es trabajar contigo?"}
          {step === 2 && "Que talento buscas?"}
        </h1>
        <p className="text-[#94A3B8] text-sm">
          {step === 0 && "Esta informacion nos ayuda a conectar con candidatos compatibles"}
          {step === 1 && "Los candidatos ven cultura y beneficios al hacer match contigo"}
          {step === 2 && "Publica tu primera vacante para empezar a recibir matches"}
        </p>
      </div>

      <div className="flex gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i <= step ? "#06B6D4" : "#1A1A2E",
            }}
          />
        ))}
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4"
          >
            {step === 0 && (
              <>
                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Nombre de la empresa
                  </label>
                  <Input
                    value={profile.companyName}
                    onChange={(e) => update({ companyName: e.target.value })}
                    placeholder="Ej. TechCorp Colombia"
                    className="h-12 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4]"
                  />
                  {errors.companyName && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.companyName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Industria
                  </label>
                  <TagSelector
                    options={INDUSTRY_OPTIONS}
                    selected={profile.industry ? [profile.industry] : []}
                    onChange={(tags) => update({ industry: tags[tags.length - 1] || "" })}
                    accent="#06B6D4"
                  />
                  {errors.industry && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.industry}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Tamano de la empresa
                  </label>
                  <TagSelector
                    options={COMPANY_SIZE_OPTIONS}
                    selected={profile.size ? [profile.size] : []}
                    onChange={(tags) => update({ size: tags[tags.length - 1] || "" })}
                  />
                  {errors.size && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.size}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Ubicacion principal
                  </label>
                  <Input
                    value={profile.location}
                    onChange={(e) => update({ location: e.target.value })}
                    placeholder="Ej. Bogota, Colombia"
                    className="h-12 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4]"
                  />
                  {errors.location && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.location}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Modalidad de trabajo
                  </label>
                  <div className="flex gap-2">
                    {(
                      [
                        { value: "remote", label: "Remoto" },
                        { value: "hybrid", label: "Hibrido" },
                        { value: "onsite", label: "Presencial" },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => update({ remotePolicy: option.value })}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                        style={{
                          backgroundColor:
                            profile.remotePolicy === option.value ? "#06B6D433" : "#1A1A2E",
                          color:
                            profile.remotePolicy === option.value ? "#06B6D4" : "#94A3B8",
                          border: `1px solid ${
                            profile.remotePolicy === option.value
                              ? "#06B6D4"
                              : "rgba(255,255,255,0.1)"
                          }`,
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Descripcion de la empresa
                  </label>
                  <Textarea
                    value={profile.description}
                    onChange={(e) => update({ description: e.target.value })}
                    placeholder="Cuentanos que hace tu empresa y que la hace unica..."
                    rows={4}
                    className="bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4] resize-none"
                  />
                  {errors.description && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Valores y cultura
                  </label>
                  <TagSelector
                    options={CULTURE_OPTIONS}
                    selected={profile.culture}
                    onChange={(culture) => update({ culture })}
                  />
                  {errors.culture && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.culture}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Beneficios que ofreces
                  </label>
                  <TagSelector
                    options={BENEFIT_OPTIONS}
                    selected={profile.benefits}
                    onChange={(benefits) => update({ benefits })}
                  />
                  {errors.benefits && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.benefits}</p>
                  )}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Titulo de la vacante
                  </label>
                  <Input
                    value={profile.vacancyTitle}
                    onChange={(e) => update({ vacancyTitle: e.target.value })}
                    placeholder="Ej. Desarrollador Frontend Jr"
                    className="h-12 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4]"
                  />
                  {errors.vacancyTitle && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.vacancyTitle}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Requisitos clave
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={requirementInput}
                      onChange={(e) => setRequirementInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                      placeholder="Ej. React, TypeScript..."
                      className="h-12 flex-1 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4]"
                    />
                    <Button
                      type="button"
                      onClick={addRequirement}
                      className="h-12 px-4 bg-[#06B6D4]/20 text-[#06B6D4] hover:bg-[#06B6D4]/30"
                    >
                      Agregar
                    </Button>
                  </div>
                  {profile.vacancyRequirements.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {profile.vacancyRequirements.map((req) => (
                        <span
                          key={req}
                          className="px-3 py-1 rounded-full bg-[#06B6D4]/20 text-[#06B6D4] text-xs flex items-center gap-1"
                        >
                          {req}
                          <button
                            type="button"
                            onClick={() =>
                              update({
                                vacancyRequirements: profile.vacancyRequirements.filter(
                                  (r) => r !== req
                                ),
                              })
                            }
                            className="ml-1 hover:text-[#F1F5F9]"
                          >
                            x
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {errors.vacancyRequirements && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.vacancyRequirements}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                      Salario minimo (opcional)
                    </label>
                    <Input
                      type="number"
                      value={profile.salaryMin}
                      onChange={(e) => update({ salaryMin: e.target.value })}
                      placeholder="3000000"
                      className="h-12 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                      Salario maximo (opcional)
                    </label>
                    <Input
                      type="number"
                      value={profile.salaryMax}
                      onChange={(e) => update({ salaryMax: e.target.value })}
                      placeholder="5000000"
                      className="h-12 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4]"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    checked={profile.vacancyRemote}
                    onChange={(e) => update({ vacancyRemote: e.target.checked })}
                    className="w-4 h-4 rounded border-[#475569] bg-[#1A1A2E] text-[#06B6D4] focus:ring-[#06B6D4]"
                  />
                  <span className="text-[#94A3B8] text-sm">Esta vacante permite trabajo remoto</span>
                </label>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <Button
        onClick={handleNext}
        disabled={isLoading}
        className="w-full h-14 mt-6 font-medium text-base flex items-center justify-center gap-2"
        style={{
          background: "linear-gradient(135deg, #06B6D4, #7C3AED)",
          color: "#F1F5F9",
        }}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {step === STEPS.length - 1 ? "Publicar proyecto" : "Continuar"}
            <ChevronRight className="w-5 h-5" />
          </>
        )}
      </Button>
    </div>
  )
}
