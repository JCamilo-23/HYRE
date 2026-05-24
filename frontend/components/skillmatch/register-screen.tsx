"use client"

import { useState, type ReactNode } from "react"
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { assertSupabaseConfigured, isSupabaseConfigured } from "@/lib/supabase/config-status"
import { SupabaseConfigBanner } from "@/components/auth/supabase-config-banner"
import { signInWithOAuthProvider } from "@/modules/auth/oauth"
import { ensureUserProfile } from "@/modules/auth/ensure-profile"
import { mapUserTypeToRole, getAuthCallbackUrl } from "@/modules/auth/utils"
import { getSupabaseConfigStatus } from "@/lib/supabase/config-status"
import { formatAuthError } from "@/lib/auth/error-messages"
import { useAuthProviders } from "@/hooks/use-auth-providers"
import type { OAuthProvider } from "@/modules/auth/utils"
import type { Profile } from "@/modules/auth/types"

interface RegisterScreenProps {
  userType: "candidate" | "company" | null
  onComplete: (data: { name: string; email: string }) => void
}

const OAUTH_PROVIDERS: Array<{
  id: OAuthProvider
  label: string
  icon: ReactNode
}> = [
  {
    id: "google",
    label: "Continuar con Google",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
  },
  {
    id: "apple",
    label: "Continuar con Apple",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
  },
  {
    id: "linkedin_oidc",
    label: "Continuar con LinkedIn",
    icon: (
      <svg className="h-5 w-5" fill="#0A66C2" viewBox="0 0 24 24" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.63-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
]

export function RegisterScreen({ userType, onComplete }: RegisterScreenProps) {
  const [mode, setMode] = useState<"options" | "email">("options")
  const [authFlow, setAuthFlow] = useState<"signup" | "signin">("signup")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    acceptNotifications: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const role = mapUserTypeToRole(userType)
  const supabaseReady = isSupabaseConfigured()
  const supabaseStatus = getSupabaseConfigStatus()
  const authProviders = useAuthProviders()

  const showOAuthSection = true

  const validateSignupForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Ingresa tu nombre"
    if (!formData.email.trim()) {
      newErrors.email = "Ingresa tu correo"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ingresa un correo valido"
    }
    if (formData.password.length < 8) newErrors.password = "Minimo 8 caracteres"
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contrasenas no coinciden"
    }
    if (!formData.acceptTerms) newErrors.acceptTerms = "Debes aceptar los terminos"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateSigninForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.email.trim()) newErrors.email = "Ingresa tu correo"
    if (!formData.password) newErrors.password = "Ingresa tu contrasena"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const finishWithSession = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("No se pudo obtener la sesion")

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    const profile = profileData as Profile | null

    if (!profile) {
      await ensureUserProfile(
        user.id,
        user.email ?? formData.email,
        role,
        user.user_metadata?.full_name ?? formData.name,
      )
    }

    onComplete({
      name: profile?.full_name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Usuario",
      email: profile?.email ?? user.email ?? formData.email,
    })
  }

  const handleEmailAuth = async () => {
    setAuthError(null)
    try {
      assertSupabaseConfigured()
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Supabase no configurado")
      return
    }

    const isSignup = authFlow === "signup"
    if (isSignup ? !validateSignupForm() : !validateSigninForm()) return

    setIsLoading(true)
    try {
      const supabase = createClient()

      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: {
              full_name: formData.name.trim(),
              role,
            },
            emailRedirectTo: getAuthCallbackUrl(role, "/app"),
          },
        })
        if (error) throw error

        if (!data.session) {
          setAuthError(
            "Cuenta creada. Revisa tu correo para confirmar el registro, o desactiva 'Confirm email' en Supabase → Authentication → Providers → Email.",
          )
          return
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        })
        if (error) throw error
      }

      await finishWithSession()
    } catch (e) {
      setAuthError(formatAuthError(e instanceof Error ? e.message : "Error de autenticacion"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuth = async (provider: OAuthProvider) => {
    setAuthError(null)
    setLoadingProvider(provider)
    try {
      await signInWithOAuthProvider({ provider, role })
    } catch (e) {
      setAuthError(formatAuthError(e instanceof Error ? e.message : "No se pudo iniciar sesion social"))
      setLoadingProvider(null)
    }
  }

  const title = authFlow === "signup" ? "Unete a HYRE" : "Bienvenido de nuevo"
  const subtitle =
    authFlow === "signup"
      ? userType === "candidate"
        ? "Empieza a demostrar tu talento"
        : "Encuentra el talento que necesitas"
      : "Inicia sesion para continuar"

  if (mode === "options") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
        <SupabaseConfigBanner />

        <div className="text-center mb-12 mt-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/10 flex items-center justify-center glass">
            <span className="text-2xl font-bold bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
              H
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2">{title}</h1>
          <p className="text-[#94A3B8] text-sm">{subtitle}</p>
        </div>

        {authError && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {authError}
          </div>
        )}

        {!supabaseReady && supabaseStatus.url && (
          <p className="mb-4 text-center text-xs text-[#64748B]">
            Detectado:{" "}
            <code className="text-amber-400">{new URL(supabaseStatus.url).hostname}</code>
          </p>
        )}

        <div className="flex-1 flex flex-col gap-3">
          {OAUTH_PROVIDERS.map((provider) => (
            <Button
              key={provider.id}
              onClick={() => void handleOAuth(provider.id)}
              disabled={isLoading || loadingProvider !== null}
              className="w-full h-14 glass hover:bg-white/10 text-[#F1F5F9] font-medium flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loadingProvider === provider.id ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                provider.icon
              )}
              {provider.label}
            </Button>
          ))}

          {showOAuthSection && (
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-[#475569]/50" />
              <span className="text-[#475569] text-sm">o</span>
              <div className="flex-1 h-px bg-[#475569]/50" />
            </div>
          )}

          <Button
            onClick={() => {
              setAuthError(null)
              setMode("email")
            }}
            disabled={
              !supabaseReady ||
              isLoading ||
              loadingProvider !== null ||
              (!authProviders.loading && !authProviders.email)
            }
            className="w-full h-14 glass hover:bg-white/10 text-[#F1F5F9] font-medium flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <Mail className="w-5 h-5" />
            Usar correo electronico
          </Button>

          {!authProviders.loading && !authProviders.email && supabaseReady && (
            <p className="text-center text-xs text-red-300/90">
              El login por correo esta deshabilitado en Supabase. Activa Email en
              Authentication → Providers.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setAuthFlow((f) => (f === "signup" ? "signin" : "signup"))
            setAuthError(null)
          }}
          className="mt-6 text-center text-sm text-[#94A3B8] hover:text-[#F1F5F9]"
        >
          {authFlow === "signup"
            ? "¿Ya tienes cuenta? Inicia sesion"
            : "¿No tienes cuenta? Registrate"}
        </button>

        <p className="text-[#475569] text-xs text-center mt-4">
          Al continuar, aceptas nuestros{" "}
          <span className="text-[#7C3AED]">Terminos de servicio</span> y{" "}
          <span className="text-[#7C3AED]">Politica de privacidad</span>
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
      <SupabaseConfigBanner />

      <button
        type="button"
        onClick={() => {
          setMode("options")
          setAuthError(null)
        }}
        className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2">
          {authFlow === "signup" ? "Crear cuenta" : "Iniciar sesion"}
        </h1>
        <p className="text-[#94A3B8] text-sm">
          {authFlow === "signup"
            ? "Completa tus datos para comenzar"
            : "Ingresa con tu correo y contrasena"}
        </p>
      </div>

      {authError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {authError}
        </div>
      )}

      <div className="flex-1 flex flex-col gap-4">
        {authFlow === "signup" && (
          <div>
            <label className="block text-[#F1F5F9] text-sm font-medium mb-2">Nombre completo</label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Tu nombre"
              className="h-12 bg-[#1A1A2E] border-[rgba(255,255,255,0.1)] text-[#F1F5F9] placeholder:text-[#475569] focus:border-[#7C3AED] input-focus"
            />
            {errors.name && <p className="text-[#EF4444] text-xs mt-1">{errors.name}</p>}
          </div>
        )}

        <div>
          <label className="block text-[#F1F5F9] text-sm font-medium mb-2">Correo electronico</label>
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
          {errors.email && <p className="text-[#EF4444] text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-[#F1F5F9] text-sm font-medium mb-2">Contrasena</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
            <Input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={authFlow === "signup" ? "Minimo 8 caracteres" : "Tu contrasena"}
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
          {errors.password && <p className="text-[#EF4444] text-xs mt-1">{errors.password}</p>}
        </div>

        {authFlow === "signup" && (
          <>
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
            </div>
          </>
        )}
      </div>

      <Button
        onClick={() => void handleEmailAuth()}
        disabled={!supabaseReady || isLoading}
        className="w-full h-14 btn-primary-gradient text-[#F1F5F9] font-medium text-base flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            {authFlow === "signup" ? "Crear cuenta" : "Iniciar sesion"}
            <ChevronRight className="w-5 h-5" />
          </>
        )}
      </Button>
    </div>
  )
}
