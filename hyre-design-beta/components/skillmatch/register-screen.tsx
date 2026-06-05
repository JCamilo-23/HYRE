"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator"
import { isPasswordValid } from "@/lib/utils"

interface RegisterScreenProps {
  userType: "candidate" | "company" | null
  onComplete: (data: { name: string; email: string }) => void
  onBack?: () => void
}

export function RegisterScreen({ userType, onComplete, onBack }: RegisterScreenProps) {
  const isCompany = userType === "company"
  const [mode, setMode] = useState<"options" | "email">("options")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    acceptNotifications: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const validateField = (field: string, value: string) => {
    switch (field) {
      case "email":
        if (!value.trim()) return "Ingresa tu correo"
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Ingresa un correo válido"
        return ""
      case "password":
        if (!isPasswordValid(value)) return "La contraseña no cumple los requisitos"
        return ""
      case "confirmPassword":
        if (value !== formData.password) return "Las contraseñas no coinciden"
        return ""
      default:
        return ""
    }
  }

  const handleBlur = (field: string, value: string) => {
    setTouched((t) => ({ ...t, [field]: true }))
    const error = validateField(field, value)
    setErrors((e) => ({ ...e, [field]: error }))
  }

  const validateAll = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Ingresa tu nombre"

    const emailErr = validateField("email", formData.email)
    if (emailErr) newErrors.email = emailErr

    if (!isPasswordValid(formData.password)) newErrors.password = "La contraseña no cumple los requisitos de seguridad"

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden"

    if (!formData.acceptTerms) newErrors.acceptTerms = "Debes aceptar los términos"

    setErrors(newErrors)
    setTouched({ name: true, email: true, password: true, confirmPassword: true, acceptTerms: true })
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateAll()) return
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    onComplete({ name: formData.name, email: formData.email })
    setIsLoading(false)
  }

  const handleSocialLogin = async (_provider: "google" | "github") => {
    setIsLoading(true)
    await new Promise((r) => setTimeout(r, 500))
    onComplete({
      name: formData.name || "Usuario demo",
      email: formData.email || "demo@hyre.app",
    })
    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit()
  }

  // ─── Pantalla: opciones OAuth ─────────────────────────────────────────────
  if (mode === "options") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
        <div className="text-center mb-12 mt-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/10 flex items-center justify-center glass">
            <span className="text-2xl font-bold bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
              H
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2">
            {isCompany ? "Publica tu proyecto en HYRE" : "Únete a HYRE"}
          </h1>
          <p className="text-[#94A3B8] text-sm">
            {isCompany
              ? "Crea tu cuenta empresarial y encuentra talento compatible"
              : "Empieza a demostrar tu talento"}
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <Button
            onClick={() => handleSocialLogin("google")}
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
            onClick={() => handleSocialLogin("github")}
            disabled={isLoading}
            className="w-full h-14 glass hover:bg-white/10 text-[#F1F5F9] font-medium flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            Continuar con GitHub
          </Button>

          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-[#475569]/50" />
            <span className="text-[#475569] text-sm">o</span>
            <div className="flex-1 h-px bg-[#475569]/50" />
          </div>

          <Button
            onClick={() => setMode("email")}
            disabled={isLoading}
            className="w-full h-14 glass hover:bg-white/10 text-[#F1F5F9] font-medium flex items-center justify-center gap-3"
          >
            <Mail className="w-5 h-5" />
            Usar correo electrónico
          </Button>
        </div>

        <p className="text-[#475569] text-xs text-center mt-6">
          Al continuar, aceptas nuestros{" "}
          <span className="text-[#7C3AED]">Términos de servicio</span> y{" "}
          <span className="text-[#7C3AED]">Política de privacidad</span>
        </p>
      </div>
    )
  }

  // ─── Pantalla: formulario de registro ─────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
      <button
        onClick={() => (onBack ? onBack() : setMode("options"))}
        className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2">
          {isCompany ? "Crear cuenta empresarial" : "Crear cuenta"}
        </h1>
        <p className="text-[#94A3B8] text-sm">
          {isCompany
            ? "Datos del contacto de la empresa. Luego completarás el perfil de tu organización."
            : "Completa tus datos para comenzar"}
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-4" onKeyDown={handleKeyDown}>

        {/* Nombre */}
        <div>
          <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
            {isCompany ? "Nombre del contacto" : "Nombre completo"}
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onBlur={() => {
              if (!formData.name.trim()) setErrors((e) => ({ ...e, name: "Ingresa tu nombre" }))
            }}
            placeholder={isCompany ? "Tu nombre como representante" : "Tu nombre"}
            autoComplete="name"
            className="h-12 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#7C3AED] input-focus"
          />
          {errors.name && <p className="text-[#EF4444] text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Correo */}
        <div>
          <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                if (touched.email) {
                  const err = validateField("email", e.target.value)
                  setErrors((prev) => ({ ...prev, email: err }))
                }
              }}
              onBlur={(e) => handleBlur("email", e.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
              className="h-12 pl-10 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#7C3AED] input-focus"
            />
          </div>
          {errors.email && <p className="text-[#EF4444] text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
            <Input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value })
                if (touched.password) {
                  const err = isPasswordValid(e.target.value) ? "" : "La contraseña no cumple los requisitos de seguridad"
                  setErrors((prev) => ({ ...prev, password: err }))
                }
              }}
              onFocus={() => setPasswordFocused(true)}
              onBlur={(e) => {
                setPasswordFocused(false)
                handleBlur("password", e.target.value)
              }}
              placeholder="Mínimo 10 caracteres"
              autoComplete="new-password"
              className="h-12 pl-10 pr-10 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#7C3AED] input-focus"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94A3B8]"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <PasswordStrengthIndicator
            password={formData.password}
            visible={passwordFocused || formData.password.length > 0}
          />
          {errors.password && !passwordFocused && (
            <p className="text-[#EF4444] text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirmar contraseña */}
        <div>
          <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
            Confirmar contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value })
                if (touched.confirmPassword && e.target.value.length > 0) {
                  const err = e.target.value !== formData.password ? "Las contraseñas no coinciden" : ""
                  setErrors((prev) => ({ ...prev, confirmPassword: err }))
                }
              }}
              onBlur={(e) => handleBlur("confirmPassword", e.target.value)}
              placeholder="Repite tu contraseña"
              autoComplete="new-password"
              className="h-12 pl-10 pr-10 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#7C3AED] input-focus"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94A3B8]"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[#EF4444] text-xs mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Checkboxes */}
        <div className="flex flex-col gap-3 mt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.acceptTerms}
              onChange={(e) => {
                setFormData({ ...formData, acceptTerms: e.target.checked })
                if (errors.acceptTerms) setErrors((prev) => ({ ...prev, acceptTerms: "" }))
              }}
              className="mt-1 w-4 h-4 rounded border-[#475569] bg-[#1A1A2E] text-[#7C3AED] focus:ring-[#7C3AED]"
            />
            <span className="text-[#94A3B8] text-sm">
              Acepto los <span className="text-[#7C3AED]">términos y condiciones</span>
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-[#EF4444] text-xs -mt-2 ml-7">{errors.acceptTerms}</p>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.acceptNotifications}
              onChange={(e) => setFormData({ ...formData, acceptNotifications: e.target.checked })}
              className="mt-1 w-4 h-4 rounded border-[#475569] bg-[#1A1A2E] text-[#7C3AED] focus:ring-[#7C3AED]"
            />
            <span className="text-[#94A3B8] text-sm">
              {isCompany
                ? "Acepto recibir notificaciones de candidatos y matches"
                : "Acepto recibir notificaciones de oportunidades"}
            </span>
          </label>
        </div>
      </div>

      {errors.general && (
        <p className="text-[#EF4444] text-sm text-center mt-3">{errors.general}</p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        className={`w-full h-14 font-medium text-base flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed ${
          isCompany ? "" : "btn-primary-gradient text-[#F1F5F9]"
        }`}
        style={
          isCompany
            ? { background: "linear-gradient(135deg, #06B6D4, #7C3AED)", color: "#F1F5F9" }
            : undefined
        }
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {isCompany ? "Continuar al perfil de empresa" : "Crear cuenta"}
            <ChevronRight className="w-5 h-5" />
          </>
        )}
      </Button>
    </div>
  )
}
