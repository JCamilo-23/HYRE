export interface MatchCompany {
  id: string | number
  jobId?: string
  name: string
  industry: string
  size: string
  match: number
  vacancy: string
  description: string
  culture: string[]
  benefits: string[]
  location: string
  logo: string
  color: string
  bgGradient: string
}

export const MATCH_COMPANIES: MatchCompany[] = [
  {
    id: 1,
    name: "TechCorp Colombia",
    industry: "Tecnologia",
    size: "51-200 empleados",
    match: 94,
    vacancy: "Desarrollador Frontend Jr",
    description:
      "Empresa lider en desarrollo de software con cultura innovadora y ambiente colaborativo.",
    culture: ["Innovador", "Colaborativo", "Flexible", "Remoto"],
    benefits: ["Trabajo remoto", "Horario flexible", "Capacitacion pagada", "Seguro medico"],
    location: "Bogota, Colombia",
    logo: "T",
    color: "#7C3AED",
    bgGradient: "from-[#7C3AED]/30 to-[#06B6D4]/20",
  },
  {
    id: 2,
    name: "DesignLab Studio",
    industry: "Diseno",
    size: "11-50 empleados",
    match: 89,
    vacancy: "UX/UI Designer",
    description:
      "Estudio de diseno digital enfocado en crear experiencias memorables para startups.",
    culture: ["Creativo", "Dinamico", "Startup", "Internacional"],
    benefits: ["Remoto hibrido", "Bonos", "Dias libres extra", "Gimnasio"],
    location: "Medellin, Colombia",
    logo: "D",
    color: "#06B6D4",
    bgGradient: "from-[#06B6D4]/30 to-[#10B981]/20",
  },
  {
    id: 3,
    name: "StartupXYZ",
    industry: "Fintech",
    size: "1-10 empleados",
    match: 87,
    vacancy: "Product Manager Jr",
    description:
      "Fintech en crecimiento que esta revolucionando los pagos digitales en Latam.",
    culture: ["Startup", "Agil", "Autonomo", "Competitivo"],
    benefits: ["Equity", "Horario flexible", "Crecimiento rapido"],
    location: "Remoto",
    logo: "S",
    color: "#10B981",
    bgGradient: "from-[#10B981]/30 to-[#F59E0B]/20",
  },
]

export function getCompanyById(id: number): MatchCompany | undefined {
  return MATCH_COMPANIES.find((c) => c.id === id)
}

export function inferIndustryKey(industry?: string): string {
  if (!industry) return "default"
  const lower = industry.toLowerCase()
  if (lower.includes("tecnolog") || lower.includes("software") || lower.includes("tech")) {
    return "tecnologia"
  }
  if (lower.includes("diseno") || lower.includes("design") || lower.includes("ux")) {
    return "diseno"
  }
  if (lower.includes("fintech") || lower.includes("financ")) {
    return "fintech"
  }
  return "default"
}
