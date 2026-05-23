export const NOVA_SUGGESTIONS = [
  "¿Cómo puedo mejorar mi score?",
  "Prepárame para mi próxima entrevista",
  "¿Qué habilidades debo desarrollar?",
  "Analiza mi perfil",
] as const

/** Altura aproximada de la bottom nav + padding (px) */
export const BOTTOM_NAV_OFFSET_PX = 88

/** Tamaño de la burbuja (px) */
export const NOVA_BUBBLE_SIZE_PX = 56

/** Espacio entre burbuja y bottom nav (px) */
export const NOVA_BUBBLE_GAP_PX = 12

export const NOVA_Z_INDEX = {
  backdrop: 65,
  bubble: 60,
  panel: 70,
} as const
