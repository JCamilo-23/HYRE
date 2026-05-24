"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2,
  Users,
  Briefcase,
  Target,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Globe,
  DollarSign,
  Clock,
  Sparkles,
  CheckCircle,
  Plus,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface CompanyOnboardingScreenProps {
  onComplete: (data: CompanyData) => void
  initialData?: { name: string; email: string }
}

export interface CompanyData {
  // Informacion basica de la empresa
  companyName: string
  industry: string
  companySize: string
  location: string
  website: string
  description: string

  // Informacion del proyecto/vacante
  projectTitle: string
  projectDescription: string
  requiredSkills: string[]
  experienceLevel: string
  workModality: string
  salaryRange: string
  urgency: string

  // Cultura y valores
  companyValues: string[]
  teamDescription: string
  benefits: string[]
}

const industries = [
  "Tecnologia",
  "Fintech",
  "E-commerce",
  "Salud",
  "Educacion",
  "Marketing",
  "Consultoria",
  "Manufactura",
  "Servicios",
  "Otro",
]

const companySizes = [
  { value: "1-10", label: "1-10 empleados", description: "Startup / Emprendimiento" },
  { value: "11-50", label: "11-50 empleados", description: "Pequena empresa" },
  { value: "51-200", label: "51-200 empleados", description: "Mediana empresa" },
  { value: "201-500", label: "201-500 empleados", description: "Empresa en crecimiento" },
  { value: "500+", label: "500+ empleados", description: "Gran empresa" },
]

const experienceLevels = [
  { value: "sin-experiencia", label: "Sin experiencia", description: "Primer empleo, recien egresados" },
  { value: "junior", label: "Junior", description: "1-2 anos de experiencia" },
  { value: "mid", label: "Mid-level", description: "3-5 anos de experiencia" },
  { value: "senior", label: "Senior", description: "5+ anos de experiencia" },
  { value: "cualquiera", label: "Cualquier nivel", description: "Abierto a todos los niveles" },
]

const workModalities = [
  { value: "presencial", label: "Presencial", icon: Building2 },
  { value: "remoto", label: "Remoto", icon: Globe },
  { value: "hibrido", label: "Hibrido", icon: MapPin },
]

const urgencyOptions = [
  { value: "urgente", label: "Urgente", description: "Necesitamos a alguien esta semana" },
  { value: "pronto", label: "Pronto", description: "En las proximas 2-4 semanas" },
  { value: "normal", label: "Normal", description: "1-2 meses" },
  { value: "flexible", label: "Flexible", description: "Sin prisa especifica" },
]

const commonSkills = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python",
  "Diseno UX/UI", "Figma", "SQL", "Marketing Digital",
  "Comunicacion", "Liderazgo", "Trabajo en equipo", "Excel",
  "Ventas", "Atencion al cliente", "Gestion de proyectos",
]

const commonValues = [
  "Innovacion", "Trabajo en equipo", "Flexibilidad", "Crecimiento",
  "Transparencia", "Diversidad", "Impacto social", "Excelencia",
  "Autonomia", "Aprendizaje continuo",
]

const commonBenefits = [
  "Trabajo remoto", "Horario flexible", "Capacitaciones",
  "Seguro medico", "Bonos por desempeno", "Dias libres adicionales",
  "Equipo de trabajo", "Snacks y bebidas", "Gimnasio",
  "Stock options", "Plan de carrera",
]

export function CompanyOnboardingScreen({ onComplete, initialData }: CompanyOnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [newSkill, setNewSkill] = useState("")
  const [formData, setFormData] = useState<CompanyData>({
    companyName: initialData?.name || "",
    industry: "",
    companySize: "",
    location: "",
    website: "",
    description: "",
    projectTitle: "",
    projectDescription: "",
    requiredSkills: [],
    experienceLevel: "",
    workModality: "",
    salaryRange: "",
    urgency: "",
    companyValues: [],
    teamDescription: "",
    benefits: [],
  })

  const steps = [
    { title: "Tu empresa", icon: Building2, description: "Cuentanos sobre tu empresa" },
    { title: "El proyecto", icon: Briefcase, description: "Que talento necesitas" },
    { title: "Habilidades", icon: Target, description: "Skills y experiencia requerida" },
    { title: "Cultura", icon: Users, description: "Valores y beneficios" },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(formData)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter((s) => s !== skill)
        : [...prev.requiredSkills, skill],
    }))
  }

  const addCustomSkill = () => {
    if (newSkill.trim() && !formData.requiredSkills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const toggleValue = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      companyValues: prev.companyValues.includes(value)
        ? prev.companyValues.filter((v) => v !== value)
        : prev.companyValues.length < 5
        ? [...prev.companyValues, value]
        : prev.companyValues,
    }))
  }

  const toggleBenefit = (benefit: string) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter((b) => b !== benefit)
        : [...prev.benefits, benefit],
    }))
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.companyName && formData.industry && formData.companySize
      case 1:
        return formData.projectTitle && formData.workModality && formData.urgency
      case 2:
        return formData.requiredSkills.length > 0 && formData.experienceLevel
      case 3:
        return formData.companyValues.length > 0
      default:
        return true
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="flex flex-col gap-5">
            {/* Nombre de la empresa */}
            <div>
              <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                Nombre de la empresa *
              </label>
              <Input
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="Ej: TechCorp Colombia"
                className="h-12 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4]"
              />
            </div>

            {/* Industria */}
            <div>
              <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                Industria *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {industries.map((industry) => (
                  <button
                    key={industry}
                    onClick={() => setFormData({ ...formData, industry })}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${
                      formData.industry === industry
                        ? "bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]"
                        : "glass text-[#94A3B8] hover:text-[#F1F5F9]"
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>

            {/* Tamano de empresa */}
            <div>
              <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                Tamano de la empresa *
              </label>
              <div className="flex flex-col gap-2">
                {companySizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setFormData({ ...formData, companySize: size.value })}
                    className={`p-3 rounded-xl text-left transition-all ${
                      formData.companySize === size.value
                        ? "bg-[#06B6D4]/20 border border-[#06B6D4]"
                        : "glass hover:bg-white/5"
                    }`}
                  >
                    <p className={`font-medium ${formData.companySize === size.value ? "text-[#06B6D4]" : "text-[#F1F5F9]"}`}>
                      {size.label}
                    </p>
                    <p className="text-[#94A3B8] text-xs">{size.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Ubicacion */}
            <div>
              <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                Ubicacion (opcional)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ej: Bogota, Colombia"
                  className="h-12 pl-10 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4]"
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                Sitio web (opcional)
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://tuempresa.com"
                  className="h-12 pl-10 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4]"
                />
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="flex flex-col gap-5">
            {/* Titulo del proyecto/vacante */}
            <div>
              <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                Titulo del proyecto o vacante *
              </label>
              <Input
                value={formData.projectTitle}
                onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                placeholder="Ej: Desarrollador Frontend React"
                className="h-12 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4]"
              />
            </div>

            {/* Descripcion */}
            <div>
              <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                Descripcion del proyecto (opcional)
              </label>
              <Textarea
                value={formData.projectDescription}
                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                placeholder="Describe brevemente el proyecto o las responsabilidades del rol..."
                rows={3}
                className="bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4] resize-none"
              />
            </div>

            {/* Modalidad de trabajo */}
            <div>
              <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                Modalidad de trabajo *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {workModalities.map((modality) => {
                  const Icon = modality.icon
                  return (
                    <button
                      key={modality.value}
                      onClick={() => setFormData({ ...formData, workModality: modality.value })}
                      className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                        formData.workModality === modality.value
                          ? "bg-[#06B6D4]/20 border border-[#06B6D4]"
                          : "glass hover:bg-white/5"
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${formData.workModality === modality.value ? "text-[#06B6D4]" : "text-[#94A3B8]"}`} />
                      <span className={`text-sm font-medium ${formData.workModality === modality.value ? "text-[#06B6D4]" : "text-[#F1F5F9]"}`}>
                        {modality.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Rango salarial */}
            <div>
              <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                Rango salarial (opcional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
                <Input
                  value={formData.salaryRange}
                  onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                  placeholder="Ej: $2.000.000 - $4.000.000 COP"
                  className="h-12 pl-10 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4]"
                />
              </div>
            </div>

            {/* Urgencia */}
            <div>
              <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                Urgencia de contratacion *
              </label>
              <div className="flex flex-col gap-2">
                {urgencyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFormData({ ...formData, urgency: option.value })}
                    className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 ${
                      formData.urgency === option.value
                        ? "bg-[#06B6D4]/20 border border-[#06B6D4]"
                        : "glass hover:bg-white/5"
                    }`}
                  >
                    <Clock className={`w-5 h-5 ${formData.urgency === option.value ? "text-[#06B6D4]" : "text-[#475569]"}`} />
                    <div>
                      <p className={`font-medium ${formData.urgency === option.value ? "text-[#06B6D4]" : "text-[#F1F5F9]"}`}>
                        {option.label}
                      </p>
                      <p className="text-[#94A3B8] text-xs">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="flex flex-col gap-5">
            {/* Habilidades requeridas */}
            <div>
              <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                Habilidades requeridas * <span className="text-[#94A3B8] font-normal">(selecciona al menos 1)</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {commonSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      formData.requiredSkills.includes(skill)
                        ? "bg-[#06B6D4] text-[#0F0F1A]"
                        : "glass text-[#94A3B8] hover:text-[#F1F5F9]"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              {/* Agregar skill personalizado */}
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Agregar otra habilidad..."
                  className="h-10 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4]"
                  onKeyDown={(e) => e.key === "Enter" && addCustomSkill()}
                />
                <Button
                  onClick={addCustomSkill}
                  disabled={!newSkill.trim()}
                  className="h-10 px-3 glass hover:bg-white/10"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              {/* Skills seleccionadas */}
              {formData.requiredSkills.length > 0 && (
                <div className="mt-3 p-3 glass rounded-xl">
                  <p className="text-[#94A3B8] text-xs mb-2">Seleccionadas ({formData.requiredSkills.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full text-sm bg-[#06B6D4]/20 text-[#06B6D4] flex items-center gap-1"
                      >
                        {skill}
                        <button onClick={() => toggleSkill(skill)} className="hover:text-[#F1F5F9]">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Nivel de experiencia */}
            <div>
              <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                Nivel de experiencia buscado *
              </label>
              <div className="flex flex-col gap-2">
                {experienceLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setFormData({ ...formData, experienceLevel: level.value })}
                    className={`p-3 rounded-xl text-left transition-all ${
                      formData.experienceLevel === level.value
                        ? "bg-[#06B6D4]/20 border border-[#06B6D4]"
                        : "glass hover:bg-white/5"
                    }`}
                  >
                    <p className={`font-medium ${formData.experienceLevel === level.value ? "text-[#06B6D4]" : "text-[#F1F5F9]"}`}>
                      {level.label}
                    </p>
                    <p className="text-[#94A3B8] text-xs">{level.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="flex flex-col gap-5">
            {/* Valores de la empresa */}
            <div>
              <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                Valores de tu empresa * <span className="text-[#94A3B8] font-normal">(max 5)</span>
              </label>
              <p className="text-[#94A3B8] text-xs mb-3">
                Estos valores nos ayudan a conectarte con candidatos que comparten tu cultura
              </p>
              <div className="flex flex-wrap gap-2">
                {commonValues.map((value) => (
                  <button
                    key={value}
                    onClick={() => toggleValue(value)}
                    disabled={!formData.companyValues.includes(value) && formData.companyValues.length >= 5}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      formData.companyValues.includes(value)
                        ? "bg-[#7C3AED] text-[#F1F5F9]"
                        : formData.companyValues.length >= 5
                        ? "glass text-[#475569] cursor-not-allowed"
                        : "glass text-[#94A3B8] hover:text-[#F1F5F9]"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            {/* Descripcion del equipo */}
            <div>
              <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                Describe tu equipo (opcional)
              </label>
              <Textarea
                value={formData.teamDescription}
                onChange={(e) => setFormData({ ...formData, teamDescription: e.target.value })}
                placeholder="Ej: Somos un equipo joven y dinamico de 5 personas..."
                rows={3}
                className="bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4] resize-none"
              />
            </div>

            {/* Beneficios */}
            <div>
              <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                Beneficios que ofreces (opcional)
              </label>
              <div className="flex flex-wrap gap-2">
                {commonBenefits.map((benefit) => (
                  <button
                    key={benefit}
                    onClick={() => toggleBenefit(benefit)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      formData.benefits.includes(benefit)
                        ? "bg-[#10B981] text-[#0F0F1A]"
                        : "glass text-[#94A3B8] hover:text-[#F1F5F9]"
                    }`}
                  >
                    {benefit}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview de match */}
            <div className="mt-4 p-4 glass rounded-2xl border border-[#06B6D4]/30">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-[#06B6D4]" />
                <span className="text-[#F1F5F9] font-medium">Vista previa de tu perfil</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center text-lg font-bold text-[#06B6D4]">
                  {formData.companyName ? formData.companyName.charAt(0).toUpperCase() : "E"}
                </div>
                <div className="flex-1">
                  <p className="text-[#F1F5F9] font-medium">
                    {formData.companyName || "Tu empresa"}
                  </p>
                  <p className="text-[#94A3B8] text-sm">
                    {formData.industry || "Industria"} - {formData.companySize || "Tamano"}
                  </p>
                  <p className="text-[#06B6D4] text-sm mt-1">
                    {formData.projectTitle || "Posicion disponible"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
      {/* Header con progreso */}
      <div className="mb-6">
        {/* Back button */}
        {currentStep > 0 && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Atras
          </button>
        )}

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-4">
          {steps.map((step, index) => (
            <div key={index} className="flex-1 flex items-center gap-2">
              <div
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  index <= currentStep ? "bg-[#06B6D4]" : "bg-[#1A1A2E]"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Step info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center">
            {(() => {
              const StepIcon = steps[currentStep].icon
              return <StepIcon className="w-6 h-6 text-[#06B6D4]" />
            })()}
          </div>
          <div>
            <p className="text-[#94A3B8] text-xs">Paso {currentStep + 1} de {steps.length}</p>
            <h1 className="text-xl font-semibold text-[#F1F5F9]">{steps[currentStep].title}</h1>
            <p className="text-[#94A3B8] text-sm">{steps[currentStep].description}</p>
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="flex-1 overflow-y-auto pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="pt-4">
        <Button
          onClick={handleNext}
          disabled={!isStepValid()}
          className={`w-full h-14 font-medium text-base flex items-center justify-center gap-2 transition-all ${
            isStepValid()
              ? "bg-gradient-to-r from-[#06B6D4] to-[#7C3AED] text-[#F1F5F9]"
              : "bg-[#1A1A2E] text-[#475569] cursor-not-allowed"
          }`}
        >
          {currentStep === steps.length - 1 ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Publicar proyecto
            </>
          ) : (
            <>
              Continuar
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
