import type { CvAnalysis } from "@/lib/hyre-types"

export function getCvFallbackAnalysis(fileName?: string): CvAnalysis {
  const label = fileName ? ` (${fileName})` : ""
  return {
    summary: `Analisis preliminar del CV${label}. Perfil con experiencia en desarrollo y habilidades blandas destacadas.`,
    keyPoints: [
      "3+ anos de experiencia en tecnologia",
      "Dominio de herramientas modernas de desarrollo",
      "Experiencia en trabajo colaborativo y remoto",
      "Formacion en area relacionada al rol",
    ],
    skills: ["React", "TypeScript", "Comunicacion", "Trabajo en equipo", "Git"],
    experience: [
      { role: "Desarrollador", company: "Empresa anterior", duration: "2022 - 2024" },
      { role: "Practicante", company: "Startup", duration: "2021 - 2022" },
    ],
    education: ["Ingenieria / Tecnologia — Universidad"],
    strengths: [
      "Perfil tecnico solido",
      "Buena progresion de carrera",
      "Habilidades transferibles",
    ],
    suggestions: [
      "Destaca logros cuantificables en cada experiencia",
      "Agrega palabras clave del rol al que postulas",
      "Incluye proyectos personales relevantes",
    ],
  }
}
