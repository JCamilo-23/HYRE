"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { updateCandidateProfile, updateBusinessProfile } from "@/modules/auth/actions"
import type { UserRole } from "@/modules/auth/types"

interface Props {
  role: UserRole
}

// ── Candidate onboarding ─────────────────────────────────────────────────────

const CAREER_STAGES = [
  { value: "estudiante", label: "Soy estudiante" },
  { value: "recien_graduado", label: "Recién me gradué" },
  { value: "con_experiencia", label: "Tengo experiencia laboral" },
] as const

const SUGGESTED_SKILLS = [
  "JavaScript", "Python", "React", "Node.js", "SQL",
  "Excel", "Diseño", "Marketing", "Ventas", "Atención al cliente",
  "Comunicación", "Trabajo en equipo", "Inglés",
]

function CandidateOnboarding() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState(0)
  const [city, setCity] = useState("")
  const [careerStage, setCareerStage] = useState<string>("")
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")

  const toggleSkill = (s: string) => {
    setSkills(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    )
  }

  const addCustomSkill = () => {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed])
    }
    setSkillInput("")
  }

  const finish = () => {
    startTransition(async () => {
      await updateCandidateProfile({ city, career_stage: careerStage as any, skills })
      router.push("/")
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Progress */}
        <div className="flex gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">¿En qué ciudad estás?</h1>
              <p className="text-muted-foreground mt-1">Para mostrarte oportunidades cerca de ti</p>
            </div>
            <Input
              placeholder="Ej: Barranquilla, Bogotá, Medellín..."
              value={city}
              onChange={e => setCity(e.target.value)}
              className="text-base"
            />
            <Button
              className="w-full"
              onClick={() => setStep(1)}
              disabled={!city.trim()}
            >
              Continuar
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">¿Cuál es tu etapa profesional?</h1>
              <p className="text-muted-foreground mt-1">Para personalizar tu experiencia</p>
            </div>
            <div className="space-y-3">
              {CAREER_STAGES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setCareerStage(value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                    careerStage === value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <Button
              className="w-full"
              onClick={() => setStep(2)}
              disabled={!careerStage}
            >
              Continuar
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">¿Qué habilidades tienes?</h1>
              <p className="text-muted-foreground mt-1">Selecciona las que apliquen o agrega las tuyas</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SKILLS.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    skills.includes(skill)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {skill}
                </button>
              ))}
              {skills.filter(s => !SUGGESTED_SKILLS.includes(s)).map(skill => (
                <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => toggleSkill(skill)}>
                  {skill} ×
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Otra habilidad..."
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCustomSkill()}
              />
              <Button variant="outline" onClick={addCustomSkill} disabled={!skillInput.trim()}>
                Agregar
              </Button>
            </div>
            <Button
              className="w-full"
              onClick={finish}
              disabled={isPending}
            >
              {isPending ? "Guardando..." : "Listo, empezar"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Business onboarding ──────────────────────────────────────────────────────

const INDUSTRIES = [
  "Tecnología", "Retail / Comercio", "Salud", "Educación",
  "Finanzas", "Marketing", "Manufactura", "Logística", "Otro",
]

const COMPANY_SIZES = [
  { value: "1-10", label: "1 – 10 personas" },
  { value: "11-50", label: "11 – 50 personas" },
  { value: "51-200", label: "51 – 200 personas" },
  { value: "200+", label: "Más de 200 personas" },
] as const

function BusinessOnboarding() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState(0)
  const [companyName, setCompanyName] = useState("")
  const [industry, setIndustry] = useState("")
  const [companySize, setCompanySize] = useState<string>("")
  const [city, setCity] = useState("")

  const finish = () => {
    startTransition(async () => {
      await updateBusinessProfile({
        company_name: companyName,
        industry,
        company_size: companySize as any,
        city,
      })
      router.push("/")
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Progress */}
        <div className="flex gap-2">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">¿Cómo se llama tu empresa?</h1>
              <p className="text-muted-foreground mt-1">Así te verán los candidatos</p>
            </div>
            <Input
              placeholder="Ej: TechCo SAS, Mi Empresa..."
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="text-base"
            />
            <Button className="w-full" onClick={() => setStep(1)} disabled={!companyName.trim()}>
              Continuar
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">¿En qué industria están?</h1>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {INDUSTRIES.map(ind => (
                <button
                  key={ind}
                  onClick={() => setIndustry(ind)}
                  className={`px-4 py-3 rounded-xl border-2 text-sm transition-colors ${
                    industry === ind
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
            <Button className="w-full" onClick={() => setStep(2)} disabled={!industry}>
              Continuar
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">¿Cuántas personas trabajan ahí?</h1>
            </div>
            <div className="space-y-3">
              {COMPANY_SIZES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setCompanySize(value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                    companySize === value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <Button className="w-full" onClick={() => setStep(3)} disabled={!companySize}>
              Continuar
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">¿En qué ciudad operan?</h1>
            </div>
            <Input
              placeholder="Ej: Barranquilla, Bogotá..."
              value={city}
              onChange={e => setCity(e.target.value)}
              className="text-base"
            />
            <Button
              className="w-full"
              onClick={finish}
              disabled={isPending || !city.trim()}
            >
              {isPending ? "Guardando..." : "Listo, empezar"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Root ─────────────────────────────────────────────────────────────────────

export function OnboardingClient({ role }: Props) {
  if (role === "business") return <BusinessOnboarding />
  return <CandidateOnboarding />
}
