"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ChevronRight, 
  Loader2,
  Users,
  Briefcase,
  MapPin,
  Globe,
  Target,
  DollarSign,
  Clock,
  CheckCircle,
  Plus,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface CompanyRegisterScreenProps {
  onComplete: (data: CompanyData) => void
}

export interface CompanyData {
  // Paso 1: Datos basicos
  companyName: string
  email: string
  password: string
  // Paso 2: Informacion de la empresa
  industry: string
  companySize: string
  location: string
  website: string
  description: string
  // Paso 3: Necesidades de talento
  roles: string[]
  skills: string[]
  experience: string
  workType: string
  salaryRange: string
  urgency: string
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
  "Otro"
]

const companySizes = [
  { value: "1-10", label: "1-10 empleados", description: "Startup / Emprendimiento" },
  { value: "11-50", label: "11-50 empleados", description: "Empresa pequena" },
  { value: "51-200", label: "51-200 empleados", description: "Empresa mediana" },
  { value: "201-500", label: "201-500 empleados", description: "Empresa grande" },
  { value: "500+", label: "500+ empleados", description: "Corporacion" }
]

const experienceLevels = [
  { value: "entry", label: "Junior / Entry level", description: "0-2 anos" },
  { value: "mid", label: "Mid-level", description: "2-5 anos" },
  { value: "senior", label: "Senior", description: "5+ anos" },
  { value: "any", label: "Cualquier nivel", description: "Estamos abiertos" }
]

const workTypes = [
  { value: "remote", label: "100% Remoto", icon: Globe },
  { value: "hybrid", label: "Hibrido", icon: Building2 },
  { value: "onsite", label: "Presencial", icon: MapPin }
]

const urgencyLevels = [
  { value: "immediate", label: "Inmediato", description: "Esta semana", color: "#EF4444" },
  { value: "soon", label: "Pronto", description: "Este mes", color: "#F59E0B" },
  { value: "planning", label: "Planificando", description: "Proximo trimestre", color: "#10B981" }
]

const popularSkills = [
  "JavaScript", "React", "Node.js", "Python", "SQL", "AWS",
  "UI/UX Design", "Product Management", "Data Analysis", "Marketing Digital",
  "Ventas", "Atencion al cliente", "Excel", "Comunicacion"
]

const popularRoles = [
  "Desarrollador Frontend",
  "Desarrollador Backend",
  "Full Stack Developer",
  "UX/UI Designer",
  "Product Manager",
  "Data Analyst",
  "Marketing Manager",
  "Sales Representative",
  "Customer Success",
  "Project Manager"
]

export function CompanyRegisterScreen({ onComplete }: CompanyRegisterScreenProps) {
  const [mode, setMode] = useState<"options" | "form">("options")
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [customSkill, setCustomSkill] = useState("")
  const [customRole, setCustomRole] = useState("")
  
  const [formData, setFormData] = useState<CompanyData>({
    companyName: "",
    email: "",
    password: "",
    industry: "",
    companySize: "",
    location: "",
    website: "",
    description: "",
    roles: [],
    skills: [],
    experience: "",
    workType: "",
    salaryRange: "",
    urgency: ""
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const totalSteps = 3

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}
    
    if (step === 1) {
      if (!formData.companyName.trim()) newErrors.companyName = "Ingresa el nombre de tu empresa"
      if (!formData.email.trim()) {
        newErrors.email = "Ingresa tu correo corporativo"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Ingresa un correo valido"
      }
      if (formData.password.length < 8) newErrors.password = "Minimo 8 caracteres"
    }
    
    if (step === 2) {
      if (!formData.industry) newErrors.industry = "Selecciona una industria"
      if (!formData.companySize) newErrors.companySize = "Selecciona el tamano"
      if (!formData.location.trim()) newErrors.location = "Ingresa la ubicacion"
    }
    
    if (step === 3) {
      if (formData.roles.length === 0) newErrors.roles = "Selecciona al menos un rol"
      if (formData.skills.length === 0) newErrors.skills = "Selecciona al menos una habilidad"
      if (!formData.workType) newErrors.workType = "Selecciona el tipo de trabajo"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      setMode("options")
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
    onComplete(formData)
  }

  const handleSocialLogin = (provider: string) => {
    setMode("form")
    setFormData(prev => ({
      ...prev,
      email: `empresa@${provider.toLowerCase()}.com`,
      password: "temporal123" // En produccion esto seria manejado por OAuth
    }))
  }

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }))
  }

  const addCustomSkill = () => {
    if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, customSkill.trim()]
      }))
      setCustomSkill("")
    }
  }

  const addCustomRole = () => {
    if (customRole.trim() && !formData.roles.includes(customRole.trim())) {
      setFormData(prev => ({
        ...prev,
        roles: [...prev.roles, customRole.trim()]
      }))
      setCustomRole("")
    }
  }

  // Pantalla de opciones de registro
  if (mode === "options") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
        <div className="text-center mb-12 mt-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#06B6D4]/20 to-[#10B981]/10 flex items-center justify-center glass">
            <Building2 className="w-8 h-8 text-[#06B6D4]" />
          </div>
          <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2">
            Bienvenido a HYRE Business
          </h1>
          <p className="text-[#94A3B8] text-sm">
            Encuentra el talento que tu empresa necesita
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <Button
            onClick={() => handleSocialLogin("Google")}
            disabled={isLoading}
            className="w-full h-14 glass hover:bg-white/10 text-[#F1F5F9] font-medium flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </Button>

          <Button
            onClick={() => handleSocialLogin("LinkedIn")}
            disabled={isLoading}
            className="w-full h-14 glass hover:bg-white/10 text-[#F1F5F9] font-medium flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Continuar con LinkedIn
          </Button>

          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-[#475569]/50" />
            <span className="text-[#475569] text-sm">o</span>
            <div className="flex-1 h-px bg-[#475569]/50" />
          </div>

          <Button
            onClick={() => setMode("form")}
            disabled={isLoading}
            className="w-full h-14 glass hover:bg-white/10 text-[#F1F5F9] font-medium flex items-center justify-center gap-3"
          >
            <Mail className="w-5 h-5" />
            Usar correo corporativo
          </Button>
        </div>

        <p className="text-[#475569] text-xs text-center mt-6">
          Al continuar, aceptas nuestros{" "}
          <span className="text-[#06B6D4]">Terminos de servicio</span> y{" "}
          <span className="text-[#06B6D4]">Politica de privacidad</span>
        </p>
      </div>
    )
  }

  // Formulario de registro por pasos
  return (
    <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
      {/* Header con navegacion */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBack}
          className="w-10 h-10 glass rounded-full flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-[#94A3B8] text-xs mb-1">Paso {currentStep} de {totalSteps}</p>
          <div className="flex gap-2">
            {[...Array(totalSteps)].map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < currentStep ? "bg-[#06B6D4]" : "bg-[#1A1A2E]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          {/* Paso 1: Datos basicos */}
          {currentStep === 1 && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2">
                  Datos de tu empresa
                </h1>
                <p className="text-[#94A3B8] text-sm">
                  Empecemos con la informacion basica
                </p>
              </div>

              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Nombre de la empresa
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
                    <Input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Ej: TechCorp Colombia"
                      className="h-12 pl-10 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4]"
                    />
                  </div>
                  {errors.companyName && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.companyName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Correo corporativo
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="rrhh@tuempresa.com"
                      className="h-12 pl-10 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4]"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Contrasena
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimo 8 caracteres"
                      className="h-12 pl-10 pr-10 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94A3B8]"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.password}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Paso 2: Informacion de la empresa */}
          {currentStep === 2 && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2">
                  Sobre tu empresa
                </h1>
                <p className="text-[#94A3B8] text-sm">
                  Esta informacion nos ayuda a encontrar el mejor talento
                </p>
              </div>

              <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                {/* Industria */}
                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Industria
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {industries.map((ind) => (
                      <button
                        key={ind}
                        onClick={() => setFormData({ ...formData, industry: ind })}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          formData.industry === ind
                            ? "bg-[#06B6D4] text-[#F1F5F9]"
                            : "glass text-[#94A3B8] hover:text-[#F1F5F9]"
                        }`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                  {errors.industry && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.industry}</p>
                  )}
                </div>

                {/* Tamano de empresa */}
                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Tamano de la empresa
                  </label>
                  <div className="flex flex-col gap-2">
                    {companySizes.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => setFormData({ ...formData, companySize: size.value })}
                        className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 ${
                          formData.companySize === size.value
                            ? "glass-strong border border-[#06B6D4]"
                            : "glass hover:bg-white/5"
                        }`}
                      >
                        <Users className={`w-5 h-5 ${
                          formData.companySize === size.value ? "text-[#06B6D4]" : "text-[#475569]"
                        }`} />
                        <div>
                          <p className="text-[#F1F5F9] text-sm font-medium">{size.label}</p>
                          <p className="text-[#475569] text-xs">{size.description}</p>
                        </div>
                        {formData.companySize === size.value && (
                          <CheckCircle className="w-5 h-5 text-[#06B6D4] ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                  {errors.companySize && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.companySize}</p>
                  )}
                </div>

                {/* Ubicacion */}
                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Ubicacion principal
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
                    <Input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ej: Bogota, Colombia"
                      className="h-12 pl-10 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4]"
                    />
                  </div>
                  {errors.location && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.location}</p>
                  )}
                </div>

                {/* Website (opcional) */}
                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Sitio web <span className="text-[#475569]">(opcional)</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
                    <Input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://tuempresa.com"
                      className="h-12 pl-10 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4]"
                    />
                  </div>
                </div>

                {/* Descripcion (opcional) */}
                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Descripcion breve <span className="text-[#475569]">(opcional)</span>
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Cuentanos que hace tu empresa..."
                    className="min-h-[80px] bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4] resize-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Paso 3: Necesidades de talento */}
          {currentStep === 3 && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2">
                  Que talento necesitas?
                </h1>
                <p className="text-[#94A3B8] text-sm">
                  Esto nos permite hacer match con los candidatos ideales
                </p>
              </div>

              <div className="flex-1 flex flex-col gap-5 overflow-y-auto pb-4">
                {/* Roles buscados */}
                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Roles que buscas
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {popularRoles.map((role) => (
                      <button
                        key={role}
                        onClick={() => toggleRole(role)}
                        className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                          formData.roles.includes(role)
                            ? "bg-[#06B6D4] text-[#F1F5F9]"
                            : "glass text-[#94A3B8] hover:text-[#F1F5F9]"
                        }`}
                      >
                        {formData.roles.includes(role) && <CheckCircle className="w-3 h-3 inline mr-1" />}
                        {role}
                      </button>
                    ))}
                  </div>
                  {/* Agregar rol personalizado */}
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      placeholder="Agregar otro rol..."
                      className="h-10 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && addCustomRole()}
                    />
                    <Button onClick={addCustomRole} className="h-10 px-3 glass">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {/* Roles seleccionados custom */}
                  {formData.roles.filter(r => !popularRoles.includes(r)).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.roles.filter(r => !popularRoles.includes(r)).map((role) => (
                        <span
                          key={role}
                          className="px-3 py-1.5 rounded-full text-xs bg-[#06B6D4] text-[#F1F5F9] flex items-center gap-1"
                        >
                          {role}
                          <button onClick={() => toggleRole(role)}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {errors.roles && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.roles}</p>
                  )}
                </div>

                {/* Habilidades requeridas */}
                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Habilidades clave
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {popularSkills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                          formData.skills.includes(skill)
                            ? "bg-[#7C3AED] text-[#F1F5F9]"
                            : "glass text-[#94A3B8] hover:text-[#F1F5F9]"
                        }`}
                      >
                        {formData.skills.includes(skill) && <CheckCircle className="w-3 h-3 inline mr-1" />}
                        {skill}
                      </button>
                    ))}
                  </div>
                  {/* Agregar skill personalizado */}
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      placeholder="Agregar otra habilidad..."
                      className="h-10 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
                    />
                    <Button onClick={addCustomSkill} className="h-10 px-3 glass">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {errors.skills && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.skills}</p>
                  )}
                </div>

                {/* Nivel de experiencia */}
                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Nivel de experiencia
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {experienceLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setFormData({ ...formData, experience: level.value })}
                        className={`p-3 rounded-xl text-left transition-all ${
                          formData.experience === level.value
                            ? "glass-strong border border-[#06B6D4]"
                            : "glass hover:bg-white/5"
                        }`}
                      >
                        <p className="text-[#F1F5F9] text-sm font-medium">{level.label}</p>
                        <p className="text-[#475569] text-xs">{level.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tipo de trabajo */}
                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Modalidad de trabajo
                  </label>
                  <div className="flex gap-2">
                    {workTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.value}
                          onClick={() => setFormData({ ...formData, workType: type.value })}
                          className={`flex-1 p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
                            formData.workType === type.value
                              ? "glass-strong border border-[#06B6D4]"
                              : "glass hover:bg-white/5"
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${
                            formData.workType === type.value ? "text-[#06B6D4]" : "text-[#475569]"
                          }`} />
                          <span className="text-[#F1F5F9] text-xs font-medium">{type.label}</span>
                        </button>
                      )
                    })}
                  </div>
                  {errors.workType && (
                    <p className="text-[#EF4444] text-xs mt-1">{errors.workType}</p>
                  )}
                </div>

                {/* Urgencia */}
                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Urgencia de contratacion
                  </label>
                  <div className="flex gap-2">
                    {urgencyLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setFormData({ ...formData, urgency: level.value })}
                        className={`flex-1 p-3 rounded-xl text-center transition-all ${
                          formData.urgency === level.value
                            ? "glass-strong"
                            : "glass hover:bg-white/5"
                        }`}
                        style={{
                          borderColor: formData.urgency === level.value ? level.color : "transparent",
                          borderWidth: formData.urgency === level.value ? "1px" : "0"
                        }}
                      >
                        <Clock className="w-4 h-4 mx-auto mb-1" style={{ 
                          color: formData.urgency === level.value ? level.color : "#475569" 
                        }} />
                        <p className="text-[#F1F5F9] text-xs font-medium">{level.label}</p>
                        <p className="text-[#475569] text-[10px]">{level.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rango salarial (opcional) */}
                <div>
                  <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
                    Rango salarial <span className="text-[#475569]">(opcional)</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
                    <Input
                      type="text"
                      value={formData.salaryRange}
                      onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                      placeholder="Ej: $3M - $5M COP"
                      className="h-12 pl-10 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#06B6D4]"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Boton de navegacion */}
      <Button
        onClick={handleNext}
        disabled={isLoading}
        className="w-full h-14 bg-gradient-to-r from-[#06B6D4] to-[#10B981] text-[#F1F5F9] font-medium text-base flex items-center justify-center gap-2 mt-4"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : currentStep === totalSteps ? (
          <>
            Crear cuenta de empresa
            <CheckCircle className="w-5 h-5" />
          </>
        ) : (
          <>
            Continuar
            <ChevronRight className="w-5 h-5" />
          </>
        )}
      </Button>
    </div>
  )
}
