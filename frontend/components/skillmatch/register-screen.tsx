"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

interface RegisterScreenProps {
  userType: "candidate" | "company" | null
  onComplete: (data: { name: string; email: string }) => void
  onBack?: () => void
}

export function RegisterScreen({ userType, onComplete, onBack }: RegisterScreenProps) {
  const isCompany = userType === "company"
  const [mode, setMode] = useState<"options" | "email">("options")
  const [showPassword, setShowPassword] = useState(false)
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Ingresa tu nombre"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Ingresa tu correo"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ingresa un correo valido"
    }
    if (formData.password.length < 8) {
      newErrors.password = "Minimo 8 caracteres"
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contrasenas no coinciden"
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Debes aceptar los terminos"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    setIsLoading(true)

    try {
      const supabase = createClient()
      const role = userType === "company" ? "business" : "candidate"
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.name, role } },
      })

      if (error) {
        if (error.message.toLowerCase().includes("already registered") || error.message.toLowerCase().includes("already exists")) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          })
          if (signInError) {
            setErrors({ general: "Contraseña incorrecta para este correo" })
            return
          }
        } else {
          setErrors({ general: error.message })
          return
        }
      }

      onComplete({ name: formData.name, email: formData.email })
    } catch (err: any) {
      setErrors({ general: err.message ?? "Error al crear la cuenta" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: "google" | "github") => {
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setErrors({ general: error.message })
      setIsLoading(false)
    }
  }

  if (mode === "options") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
        {/* Header */}
        <div className="text-center mb-12 mt-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/10 flex items-center justify-center glass">
            <span className="text-2xl font-bold bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
              H
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2">
            {isCompany ? "Publica tu proyecto en HYRE" : "Unete a HYRE"}
          </h1>
          <p className="text-[#94A3B8] text-sm">
            {isCompany
              ? "Crea tu cuenta empresarial y encuentra talento compatible"
              : "Empieza a demostrar tu talento"}
          </p>
        </div>

        {/* OAuth options */}
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

          {/* Divider */}
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
            Usar correo electronico
          </Button>
        </div>

        {/* Terms */}
        <p className="text-[#475569] text-xs text-center mt-6">
          Al continuar, aceptas nuestros{" "}
          <span className="text-[#7C3AED]">Terminos de servicio</span> y{" "}
          <span className="text-[#7C3AED]">Politica de privacidad</span>
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
      {/* Back button */}
      <button
        onClick={() => setMode("options")}
        className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2">
          Crear cuenta
        </h1>
        <p className="text-[#94A3B8] text-sm">
          Completa tus datos para comenzar
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Name */}
        <div>
          <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
            Nombre completo
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Tu nombre"
            className="h-12 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#7C3AED] input-focus"
          />
          {errors.name && (
            <p className="text-[#EF4444] text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
            Correo electronico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="tu@correo.com"
              className="h-12 pl-10 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#7C3AED] input-focus"
            />
          </div>
          {errors.email && (
            <p className="text-[#EF4444] text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
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
          {errors.password && (
            <p className="text-[#EF4444] text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-[#F1F5F9] text-sm font-medium mb-2">
            Confirmar contrasena
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
            <Input
              type={showPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Repite tu contrasena"
              className="h-12 pl-10 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#7C3AED] input-focus"
            />
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
              onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
              className="mt-1 w-4 h-4 rounded border-[#475569] bg-[#1A1A2E] text-[#7C3AED] focus:ring-[#7C3AED]"
            />
            <span className="text-[#94A3B8] text-sm">
              Acepto los <span className="text-[#7C3AED]">terminos y condiciones</span>
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
              Acepto recibir notificaciones de oportunidades
            </span>
          </label>
        </div>
      </div>

      {errors.general && (
        <p className="text-[#EF4444] text-sm text-center mt-3">{errors.general}</p>
      )}

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full h-14 btn-primary-gradient text-[#F1F5F9] font-medium text-base flex items-center justify-center gap-2 mt-6"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Crear cuenta
            <ChevronRight className="w-5 h-5" />
          </>
        )}
      </Button>
    </div>
  )
}
