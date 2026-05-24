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

    try {
      onComplete({ name: formData.name, email: formData.email })
    } catch (err: unknown) {
      setErrors({ general: err instanceof Error ? err.message : "Error al continuar" })
    } finally {
      setIsLoading(false)
    }
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

        <div className="flex-1 flex flex-col justify-center gap-3">
          <Button
            onClick={() => setMode("email")}
            disabled={isLoading}
            className="w-full h-14 glass hover:bg-white/10 text-[#F1F5F9] font-medium flex items-center justify-center gap-3"
          >
            <Mail className="w-5 h-5" />
            Ingresar con correo electrónico
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
