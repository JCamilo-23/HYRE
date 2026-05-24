import {
  Brain,
  Building2,
  ChartLine,
  Gamepad2,
  MessageSquare,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Users,
  Video,
  Zap,
} from "lucide-react"

export const navLinks = [
  { label: "Producto", href: "#producto" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Precios", href: "#precios" },
  { label: "Historias", href: "#testimonios" },
] as const

export const heroStats = [
  { value: "94%", label: "Match promedio" },
  { value: "12k+", label: "Talentos activos" },
  { value: "3.2x", label: "Contratacion mas rapida" },
] as const

export const features = [
  {
    title: "IA que entiende talento real",
    description:
      "Modelos entrenados para evaluar habilidades, soft skills y potencial — no solo palabras clave en un CV.",
    icon: Brain,
    span: "lg:col-span-2 lg:row-span-2",
    accent: "from-[#7C3AED] to-[#9F67FF]",
  },
  {
    title: "Simulaciones inmersivas",
    description: "Retos gamificados que demuestran como trabajas bajo presion.",
    icon: Gamepad2,
    span: "",
    accent: "from-[#06B6D4] to-[#22D3EE]",
  },
  {
    title: "Match inteligente",
    description: "Compatibilidad multidimensional con empresas que encajan contigo.",
    icon: Target,
    span: "",
    accent: "from-[#10B981] to-[#34D399]",
  },
  {
    title: "Entrevistas con IA",
    description: "Practica, recibe feedback instantaneo y mejora cada sesion.",
    icon: Video,
    span: "lg:col-span-2",
    accent: "from-[#F59E0B] to-[#FBBF24]",
  },
  {
    title: "Mentor Nova",
    description: "Tu copiloto de carrera 24/7 con insights personalizados.",
    icon: MessageSquare,
    span: "",
    accent: "from-[#EC4899] to-[#F472B6]",
  },
  {
    title: "Analytics para empresas",
    description: "Pipeline de talento, scores y prediccion de fit en un solo panel.",
    icon: ChartLine,
    span: "",
    accent: "from-[#7C3AED] to-[#06B6D4]",
  },
] as const

export const timelineSteps = [
  {
    step: "01",
    title: "Crea tu perfil de potencial",
    description:
      "Sube experiencias, proyectos y aspiraciones. La IA construye tu mapa de habilidades unico.",
    icon: Sparkles,
  },
  {
    step: "02",
    title: "Demuestra con simulaciones",
    description:
      "Completa retos reales del rol. Cada accion alimenta tu score de competencia.",
    icon: Zap,
  },
  {
    step: "03",
    title: "Match y entrevista inteligente",
    description:
      "Conecta con empresas compatibles. Practica entrevistas con feedback en tiempo real.",
    icon: Users,
  },
  {
    step: "04",
    title: "Contrata o consigue el rol",
    description:
      "Empresas ven evidencia, no suposiciones. Candidatos desbloquean oportunidades premium.",
    icon: Trophy,
  },
] as const

export const testimonials = [
  {
    quote:
      "HYRE cambio como contratamos Gen Z. Vemos talento real antes de la primera llamada.",
    name: "Camila R.",
    role: "Head of Talent, TechCorp Colombia",
    avatar: "CR",
    metric: "-40% tiempo de hiring",
  },
  {
    quote:
      "Las simulaciones me dieron confianza. Consegui mi primer rol tech en 3 semanas.",
    name: "Andres M.",
    role: "Frontend Developer",
    avatar: "AM",
    metric: "+2.4k XP en 14 dias",
  },
  {
    quote:
      "El match score es brutalmente preciso. Menos ruido, mas contrataciones que funcionan.",
    name: "Laura P.",
    role: "People Ops, StartupXYZ",
    avatar: "LP",
    metric: "89% retention a 6 meses",
  },
] as const

export const pricingPlans = [
  {
    name: "Starter",
    price: "Gratis",
    period: "para talento",
    description: "Ideal para explorar tu potencial y practicar.",
    features: [
      "Perfil de habilidades con IA",
      "3 simulaciones al mes",
      "Match basico",
      "Mentor Nova lite",
    ],
    cta: "Empezar gratis",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mes",
    description: "Para candidatos que quieren acelerar su carrera.",
    features: [
      "Simulaciones ilimitadas",
      "Entrevistas IA avanzadas",
      "Match prioritario",
      "Analytics de progreso + XP",
      "Certificados verificables",
    ],
    cta: "Desbloquear Pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Para equipos de talento que escalan contratacion.",
    features: [
      "Dashboard de hiring",
      "Pipeline IA + scores",
      "Integraciones ATS",
      "Soporte dedicado",
      "SLA empresarial",
    ],
    cta: "Hablar con ventas",
    highlighted: false,
  },
] as const

export const footerLinks = {
  producto: [
    { label: "Funciones", href: "#producto" },
    { label: "Vista del producto", href: "#producto" },
    { label: "Precios", href: "#precios" },
  ],
  empresa: [
    { label: "Sobre HYRE", href: "#" },
    { label: "Carreras", href: "#" },
    { label: "Prensa", href: "#" },
  ],
  legal: [
    { label: "Privacidad", href: "#" },
    { label: "Terminos", href: "#" },
  ],
} as const

export const trustBadges = [
  { icon: Shield, label: "SOC2 ready" },
  { icon: Building2, label: "500+ empresas" },
  { icon: Users, label: "Gen Z first" },
] as const
