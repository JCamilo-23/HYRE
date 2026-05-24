"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Bell,
  Mail,
  Moon,
  Shield,
  LogOut,
  User,
  Building2,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Screen, UserData } from "@/lib/hyre-types"

interface SettingsScreenProps {
  onNavigate: (screen: Screen) => void
  onResetToStart: () => void
  userData: UserData
}

interface SettingToggleProps {
  icon: React.ReactNode
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

function SettingToggle({ icon, label, description, checked, onCheckedChange }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[#F1F5F9] text-sm font-medium">{label}</p>
          <p className="text-[#94A3B8] text-xs">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

export function SettingsScreen({ onNavigate, onResetToStart, userData }: SettingsScreenProps) {
  const [pushNotifications, setPushNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [matchAlerts, setMatchAlerts] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const isCompany = userData.userType === "company"
  const displayName = isCompany && userData.company?.companyName
    ? userData.company.companyName
    : userData.name || "Usuario"

  const handleReset = () => {
    setShowResetConfirm(false)
    onResetToStart()
  }

  return (
    <div className="min-h-screen pb-8 safe-area-top">
      <div className="px-6 pt-6 pb-4">
        <button
          onClick={() => onNavigate("profile")}
          className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al perfil
        </button>

        <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-1">Configuracion</h1>
        <p className="text-[#94A3B8] text-sm">Administra tu cuenta y preferencias</p>
      </div>

      {/* Account info */}
      <div className="px-6 mb-6">
        <h2 className="text-[#475569] text-xs font-medium uppercase tracking-wider mb-3 px-1">
          Cuenta
        </h2>
        <div className="glass rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
              {isCompany ? (
                <Building2 className="w-5 h-5 text-[#F1F5F9]" />
              ) : (
                <User className="w-5 h-5 text-[#F1F5F9]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[#F1F5F9] text-sm font-medium truncate">{displayName}</p>
              <p className="text-[#94A3B8] text-xs truncate">{userData.email || "usuario@hyre.com"}</p>
            </div>
            <span className="text-[#7C3AED] text-xs font-medium shrink-0">
              {isCompany ? "Empresa" : "Candidato"}
            </span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="px-6 mb-6">
        <h2 className="text-[#475569] text-xs font-medium uppercase tracking-wider mb-3 px-1">
          Notificaciones
        </h2>
        <div className="glass rounded-2xl overflow-hidden divide-y divide-white/5">
          <SettingToggle
            icon={<Bell className="w-5 h-5 text-[#7C3AED]" />}
            label="Notificaciones push"
            description="Alertas en tiempo real"
            checked={pushNotifications}
            onCheckedChange={setPushNotifications}
          />
          <SettingToggle
            icon={<Mail className="w-5 h-5 text-[#06B6D4]" />}
            label="Correo electronico"
            description="Resumenes y actualizaciones"
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
          <SettingToggle
            icon={<Shield className="w-5 h-5 text-[#10B981]" />}
            label={isCompany ? "Alertas de candidatos" : "Alertas de match"}
            description={isCompany ? "Nuevos postulantes y reportes" : "Nuevas oportunidades compatibles"}
            checked={matchAlerts}
            onCheckedChange={setMatchAlerts}
          />
        </div>
      </div>

      {/* Appearance */}
      <div className="px-6 mb-6">
        <h2 className="text-[#475569] text-xs font-medium uppercase tracking-wider mb-3 px-1">
          Apariencia
        </h2>
        <div className="glass rounded-2xl overflow-hidden">
          <SettingToggle
            icon={<Moon className="w-5 h-5 text-[#F59E0B]" />}
            label="Modo oscuro"
            description="Tema visual de la app"
            checked={darkMode}
            onCheckedChange={setDarkMode}
          />
        </div>
      </div>

      {/* Reset to start */}
      <div className="px-6">
        <h2 className="text-[#475569] text-xs font-medium uppercase tracking-wider mb-3 px-1">
          Sesion
        </h2>
        <div className="glass rounded-2xl p-4">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5 text-[#EF4444]" />
              </div>
              <div>
                <p className="text-[#F1F5F9] text-sm font-medium">Regresar al inicio</p>
                <p className="text-[#94A3B8] text-xs">Volver a elegir candidato o empresa</p>
              </div>
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-[#F1F5F9] text-sm text-center">
                ¿Seguro que quieres volver al inicio? Se cerrara tu sesion actual.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-white/10 text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/5"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white"
                  onClick={handleReset}
                >
                  Si, regresar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
