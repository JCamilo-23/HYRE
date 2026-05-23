"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Clock, 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  ChevronRight,
  Target,
  Trophy,
  ArrowLeft,
  Play
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { WorkSimulatorChat } from "@/components/work-simulator/work-simulator-chat"
import { Screen } from "@/app/page"

interface SimulationScreenProps {
  onNavigate: (screen: Screen) => void
}

type SimulationState = "intro" | "active" | "challenge" | "complete"

const simulation = {
  company: "TechCorp Colombia",
  role: "Desarrollador Frontend Jr",
  duration: "72 horas",
  challenges: 5,
  xp: 2500,
  currentDay: 1,
  totalDays: 3,
}

const challenges = [
  {
    id: 1,
    title: "Decision rapida: Prioridades del sprint",
    type: "decision",
    urgency: "Urgente",
    urgencyColor: "#EF4444",
    context: "Tu equipo tiene 3 tareas pendientes y el PM pide que priorices. El cliente necesita el feature A urgente, pero el bug B esta afectando usuarios. El refactor C mejoraria el codigo.",
    options: [
      { id: "A", text: "Feature A primero - el cliente lo necesita" },
      { id: "B", text: "Bug B primero - usuarios afectados" },
      { id: "C", text: "Refactor C primero - mejora la base" },
      { id: "D", text: "Dividir equipo: B y A en paralelo" },
    ],
    xp: 300,
    timeLimit: 5,
    completed: true,
    score: 85,
  },
  {
    id: 2,
    title: "Redactar correo al cliente",
    type: "written",
    urgency: "Normal",
    urgencyColor: "#F59E0B",
    context: "El cliente esta molesto porque hubo un retraso en la entrega. Tu lider te pide que redactes un correo profesional explicando la situacion y proponiendo una solucion.",
    xp: 400,
    timeLimit: 30,
    completed: true,
    score: 92,
  },
  {
    id: 3,
    title: "Crisis: Servidor caido",
    type: "crisis",
    urgency: "Urgente",
    urgencyColor: "#EF4444",
    context: "Es viernes 5pm. El servidor de produccion se cayo y hay usuarios reportando errores. Tu equipo senior no esta disponible. Tienes acceso a logs y documentacion.",
    options: [
      { id: "A", text: "Intentar reiniciar el servidor inmediatamente" },
      { id: "B", text: "Revisar logs antes de actuar" },
      { id: "C", text: "Escalar al equipo de infraestructura" },
      { id: "D", text: "Comunicar a usuarios mientras investigas" },
    ],
    xp: 500,
    timeLimit: 10,
    completed: false,
    score: null,
  },
  {
    id: 4,
    title: "Priorizacion de backlog",
    type: "prioritization",
    urgency: "Normal",
    urgencyColor: "#F59E0B",
    context: "Ordena estas 5 tareas segun urgencia e importancia para la proxima semana.",
    xp: 350,
    timeLimit: 15,
    completed: false,
    score: null,
  },
  {
    id: 5,
    title: "Feedback a un companero",
    type: "collaboration",
    urgency: "Opcional",
    urgencyColor: "#10B981",
    context: "Un companero nuevo te pide feedback sobre su pull request. Tiene algunos errores pero tambien buenas ideas.",
    xp: 250,
    timeLimit: 20,
    completed: false,
    score: null,
  },
]

export function SimulationScreen({ onNavigate }: SimulationScreenProps) {
  const [state, setState] = useState<SimulationState>("intro")
  const [aiMode, setAiMode] = useState(false)
  const [currentChallenge, setCurrentChallenge] = useState<typeof challenges[0] | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)

  const completedChallenges = challenges.filter(c => c.completed).length
  const totalXpEarned = challenges.filter(c => c.completed).reduce((acc, c) => acc + c.xp, 0)

  // Timer for active challenge
  useEffect(() => {
    if (state === "challenge" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [state, timeLeft])

  const handleStartSimulation = () => {
    setState("active")
  }

  const handleStartChallenge = (challenge: typeof challenges[0]) => {
    setCurrentChallenge(challenge)
    setTimeLeft(challenge.timeLimit * 60)
    setSelectedOption(null)
    setState("challenge")
  }

  const handleSubmitChallenge = () => {
    // Simulate completion
    setState("active")
    setCurrentChallenge(null)
  }

  const handleComplete = () => {
    setState("complete")
  }

  if (state === "intro") {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
        {/* Back button */}
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        {/* Company header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#7C3AED] flex items-center justify-center text-2xl font-bold text-[#F1F5F9]">
            T
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#F1F5F9]">{simulation.company}</h1>
            <p className="text-[#94A3B8] text-sm">{simulation.role}</p>
          </div>
        </div>

        {/* Simulation info */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Sobre esta simulacion</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-[#F1F5F9] font-medium">{simulation.duration}</p>
                <p className="text-[#94A3B8] text-xs">Duracion</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-[#06B6D4]" />
              </div>
              <div>
                <p className="text-[#F1F5F9] font-medium">{simulation.challenges} retos</p>
                <p className="text-[#94A3B8] text-xs">Desafios</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-[#F1F5F9] font-medium">+{simulation.xp} XP</p>
                <p className="text-[#94A3B8] text-xs">Al completar</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <p className="text-[#F1F5F9] font-medium">Badge</p>
                <p className="text-[#94A3B8] text-xs">Posible</p>
              </div>
            </div>
          </div>

          <p className="text-[#94A3B8] text-sm leading-relaxed">
            Viviras {simulation.challenges} desafios laborales reales durante {simulation.duration}. 
            Recibiras notificaciones con retos que debes resolver en tiempo limitado.
          </p>
        </div>

        {/* Rules */}
        <div className="glass rounded-2xl p-6 mb-auto">
          <h3 className="text-[#F1F5F9] font-medium mb-3">Reglas</h3>
          <ul className="space-y-2 text-[#94A3B8] text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
              Recibiras notificaciones durante horario laboral
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
              Cada reto tiene tiempo limite (30 min a 4 horas)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
              Tu comportamiento es evaluado por IA
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#F59E0B] mt-0.5 flex-shrink-0" />
              Puedes pausar pero no extender el tiempo
            </li>
          </ul>
        </div>

        {/* Start button */}
        <Button
          onClick={handleStartSimulation}
          className="w-full h-14 btn-primary-gradient text-[#F1F5F9] font-medium text-base flex items-center justify-center gap-2 mt-6"
        >
          <Play className="w-5 h-5" />
          Comenzar simulacion
        </Button>
      </div>
    )
  }

  if (state === "challenge" && currentChallenge) {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    const isLowTime = timeLeft < 60

    return (
      <div className="min-h-screen flex flex-col px-6 py-8 safe-area-top safe-area-bottom">
        {/* Header with timer */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setState("active")}
            className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isLowTime ? "bg-[#EF4444]/20" : "glass"}`}>
            <Clock className={`w-4 h-4 ${isLowTime ? "text-[#EF4444]" : "text-[#94A3B8]"}`} />
            <span className={`font-mono font-medium ${isLowTime ? "text-[#EF4444]" : "text-[#F1F5F9]"}`}>
              {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Challenge content */}
        <div className="flex-1">
          {/* Urgency badge */}
          <div 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4"
            style={{ 
              backgroundColor: `${currentChallenge.urgencyColor}20`,
              color: currentChallenge.urgencyColor 
            }}
          >
            <AlertCircle className="w-3 h-3" />
            {currentChallenge.urgency}
          </div>

          <h1 className="text-xl font-semibold text-[#F1F5F9] mb-4">{currentChallenge.title}</h1>

          {/* Context */}
          <div className="glass rounded-2xl p-4 mb-6">
            <p className="text-[#94A3B8] text-sm leading-relaxed">{currentChallenge.context}</p>
          </div>

          {/* Options (for decision type) */}
          {currentChallenge.options && (
            <div className="space-y-3">
              {currentChallenge.options.map((option) => (
                <motion.button
                  key={option.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedOption(option.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                    selectedOption === option.id
                      ? "bg-[#7C3AED]/20 border-[#7C3AED]"
                      : "glass hover:bg-white/10"
                  }`}
                  style={{
                    borderWidth: "1px",
                    borderColor: selectedOption === option.id ? "#7C3AED" : "rgba(255,255,255,0.1)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span 
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                        selectedOption === option.id
                          ? "bg-[#7C3AED] text-[#F1F5F9]"
                          : "bg-[#1A1A2E] text-[#94A3B8]"
                      }`}
                    >
                      {option.id}
                    </span>
                    <span className="text-[#F1F5F9] text-sm">{option.text}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* XP indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <Zap className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-[#F59E0B] text-sm font-medium">+{currentChallenge.xp} XP</span>
          </div>
        </div>

        {/* Submit button */}
        <Button
          onClick={handleSubmitChallenge}
          disabled={!selectedOption}
          className={`w-full h-14 font-medium text-base flex items-center justify-center gap-2 ${
            selectedOption
              ? "btn-primary-gradient text-[#F1F5F9]"
              : "bg-[#1A1A2E] text-[#475569] cursor-not-allowed"
          }`}
        >
          Enviar respuesta
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    )
  }

  if (state === "complete") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 safe-area-top safe-area-bottom">
        {/* Confetti */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor: ["#7C3AED", "#06B6D4", "#10B981", "#F59E0B"][i % 4],
              left: `${Math.random() * 100}%`,
            }}
            initial={{ y: -50, opacity: 1 }}
            animate={{ y: "100vh", opacity: 0, rotate: 720 }}
            transition={{ duration: 2 + Math.random(), delay: Math.random() * 0.5 }}
          />
        ))}

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
          className="w-24 h-24 rounded-full bg-[#10B981]/20 flex items-center justify-center mb-6"
        >
          <Trophy className="w-12 h-12 text-[#10B981]" />
        </motion.div>

        <h1 className="text-2xl font-semibold text-[#F1F5F9] mb-2">Simulacion completada!</h1>
        <p className="text-[#94A3B8] text-center mb-8">Excelente trabajo con TechCorp</p>

        {/* Score */}
        <div className="glass rounded-2xl p-6 w-full mb-6">
          <div className="text-center mb-4">
            <span className="text-5xl font-bold text-[#10B981]">87</span>
            <span className="text-2xl text-[#94A3B8]">/100</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-[#F1F5F9] font-medium">+{totalXpEarned} XP</p>
              <p className="text-[#94A3B8] text-xs">Ganados</p>
            </div>
            <div className="text-center">
              <p className="text-[#F1F5F9] font-medium">{completedChallenges}/{challenges.length}</p>
              <p className="text-[#94A3B8] text-xs">Retos</p>
            </div>
          </div>
        </div>

        {/* Desglose */}
        <div className="glass rounded-2xl p-4 w-full mb-8">
          <h3 className="text-[#F1F5F9] font-medium mb-3">Desglose</h3>
          <div className="space-y-2">
            {[
              { label: "Decision", score: 85 },
              { label: "Comunicacion", score: 92 },
              { label: "Gestion del tiempo", score: 78 },
              { label: "Actitud", score: 90 },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-[#94A3B8] text-sm w-32">{item.label}</span>
                <div className="flex-1 h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full"
                  />
                </div>
                <span className="text-[#F1F5F9] text-sm w-8">{item.score}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={() => onNavigate("interview")}
          className="w-full h-14 btn-primary-gradient text-[#F1F5F9] font-medium text-base"
        >
          Ir a mi entrevista
        </Button>
        <button
          onClick={() => onNavigate("report")}
          className="mt-3 text-[#7C3AED] text-sm font-medium"
        >
          Ver detalles completos
        </button>
      </div>
    )
  }

  // Active simulation dashboard
  return (
    <div className="min-h-screen pb-24 safe-area-top">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[#94A3B8] text-sm">
            Dia {simulation.currentDay} de {simulation.totalDays}
          </span>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#7C3AED] flex items-center justify-center text-xl font-bold text-[#F1F5F9]">
            T
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#F1F5F9]">{simulation.company}</h1>
            <p className="text-[#94A3B8] text-sm">{simulation.role}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#94A3B8] text-sm">Progreso</span>
            <span className="text-[#F1F5F9] text-sm font-medium">
              Reto {completedChallenges + 1} de {challenges.length}
            </span>
          </div>
          <div className="h-2 bg-[#1A1A2E] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedChallenges / challenges.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="px-6 mb-4 flex gap-2">
        <Button
          type="button"
          variant={aiMode ? "outline" : "default"}
          size="sm"
          className={aiMode ? "" : "bg-[#7C3AED] hover:bg-[#6D28D9]"}
          onClick={() => setAiMode(false)}
        >
          Retos clásicos
        </Button>
        <Button
          type="button"
          variant={aiMode ? "default" : "outline"}
          size="sm"
          className={aiMode ? "bg-[#06B6D4] hover:bg-[#0891B2]" : ""}
          onClick={() => setAiMode(true)}
        >
          Simulador IA (Gemini)
        </Button>
      </div>

      {aiMode ? (
        <div className="px-6 pb-8">
          <WorkSimulatorChat
            roleTitle={simulation.role}
            companyName={simulation.company}
          />
        </div>
      ) : (
      <>
      {/* Challenges list */}
      <div className="px-6">
        <h2 className="text-lg font-semibold text-[#F1F5F9] mb-4">Retos</h2>
        <div className="space-y-3">
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass rounded-xl p-4 ${!challenge.completed && index === completedChallenges ? "border border-[#7C3AED]" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  challenge.completed 
                    ? "bg-[#10B981]/20" 
                    : index === completedChallenges 
                      ? "bg-[#7C3AED]/20" 
                      : "bg-[#1A1A2E]"
                }`}>
                  {challenge.completed ? (
                    <CheckCircle className="w-5 h-5 text-[#10B981]" />
                  ) : (
                    <span className={`font-medium ${index === completedChallenges ? "text-[#7C3AED]" : "text-[#475569]"}`}>
                      {challenge.id}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ 
                        backgroundColor: `${challenge.urgencyColor}20`,
                        color: challenge.urgencyColor 
                      }}
                    >
                      {challenge.urgency}
                    </span>
                  </div>
                  <p className={`font-medium ${challenge.completed || index === completedChallenges ? "text-[#F1F5F9]" : "text-[#475569]"}`}>
                    {challenge.title}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[#94A3B8] text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {challenge.timeLimit} min
                    </span>
                    <span className="text-[#F59E0B] text-xs flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      +{challenge.xp} XP
                    </span>
                    {challenge.completed && challenge.score && (
                      <span className="text-[#10B981] text-xs font-medium">
                        Score: {challenge.score}
                      </span>
                    )}
                  </div>
                </div>
                {!challenge.completed && index === completedChallenges && (
                  <Button
                    onClick={() => handleStartChallenge(challenge)}
                    className="px-4 py-2 btn-primary-gradient text-[#F1F5F9] text-sm"
                  >
                    Iniciar
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Complete button (for demo) */}
        {completedChallenges >= 2 && (
          <Button
            onClick={handleComplete}
            className="w-full h-12 mt-6 btn-primary-gradient text-[#F1F5F9] font-medium"
          >
            Completar simulacion (demo)
          </Button>
        )}
      </div>
      </>
      )}
    </div>
  )
}
