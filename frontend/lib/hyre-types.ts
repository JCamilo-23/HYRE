export type Screen =
  | "splash"
  | "onboarding"
  | "userType"
  | "register"
  | "companyOnboarding"
  | "home"
  | "employerHome"
  | "employerCandidates"
  | "match"
  | "simulation"
  | "interview"
  | "report"
  | "profile"
  | "settings"
  | "mentor"
  | "nova"

export interface CompanyProfile {
  companyName: string
  industry: string
  size: string
  location: string
  remotePolicy: "remote" | "hybrid" | "onsite"
  description: string
  culture: string[]
  benefits: string[]
  vacancyTitle: string
  vacancyRequirements: string[]
  salaryMin: string
  salaryMax: string
  vacancyRemote: boolean
}

export interface UserData {
  name: string
  email: string
  userType: "candidate" | "company" | null
  company?: CompanyProfile
}

export const INDUSTRY_OPTIONS = [
  "Tecnologia",
  "Diseno",
  "Fintech",
  "Salud",
  "Educacion",
  "Retail",
  "Manufactura",
  "Consultoria",
  "Marketing",
  "Otro",
] as const

export const COMPANY_SIZE_OPTIONS = [
  "1-10 empleados",
  "11-50 empleados",
  "51-200 empleados",
  "201-500 empleados",
  "500+ empleados",
] as const

export const CULTURE_OPTIONS = [
  "Innovador",
  "Colaborativo",
  "Flexible",
  "Remoto",
  "Creativo",
  "Dinamico",
  "Startup",
  "Internacional",
  "Agil",
  "Autonomo",
  "Competitivo",
  "Formal",
] as const

export const BENEFIT_OPTIONS = [
  "Trabajo remoto",
  "Horario flexible",
  "Capacitacion pagada",
  "Seguro medico",
  "Bonos",
  "Equity",
  "Dias libres extra",
  "Gimnasio",
  "Remoto hibrido",
  "Crecimiento rapido",
] as const
