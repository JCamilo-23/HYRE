import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type PasswordRule = {
  label: string
  test: (pw: string) => boolean
}

export const PASSWORD_RULES: PasswordRule[] = [
  { label: "Mínimo 10 caracteres",       test: (pw) => pw.length >= 10 },
  { label: "Mayúscula (A-Z)",            test: (pw) => /[A-Z]/.test(pw) },
  { label: "Minúscula (a-z)",            test: (pw) => /[a-z]/.test(pw) },
  { label: "Número (0-9)",              test: (pw) => /[0-9]/.test(pw) },
  { label: 'Carácter especial (!@#…)',  test: (pw) => /[!@#$%^&*(),.?":{}|<>_\-]/.test(pw) },
]

export type PasswordStrength = "weak" | "medium" | "strong"

export function getPasswordStrength(pw: string): PasswordStrength {
  const passed = PASSWORD_RULES.filter((r) => r.test(pw)).length
  if (passed <= 2) return "weak"
  if (passed <= 4) return "medium"
  return "strong"
}

export function isPasswordValid(pw: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(pw))
}
