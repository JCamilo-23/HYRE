"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Video,
  Mic,
  MicOff,
  VideoOff,
  Phone,
  MessageSquare,
  Brain,
  TrendingUp,
  Shield,
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
  Eye,
  Smile,
  Volume2
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

type InterviewState = "preparation" | "live" | "completed"

const preparationTips = [
  { icon: Eye, text: "Mira a la camara para mostrar contacto visual" },
  { icon: Volume2, text: "Habla claro y con ritmo moderado" },
  { icon: Smile, text: "Mantén una postura abierta y relajada" },
  { icon: Brain, text: "Responde con ejemplos concretos" },
]

const interviewQuestions = [
  "Cuentame sobre ti y tu experiencia",
  "Por que te interesa este puesto?",
  "Describe una situacion donde resolviste un problema",
  "Cuales son tus fortalezas y areas de mejora?",
  "Donde te ves en 5 años?",
]

const analysisMetrics = [
  { label: "Comunicacion", value: 85, icon: MessageSquare, color: "bg-primary" },
  { label: "Confianza", value: 78, icon: Shield, color: "bg-[var(--hyre-green)]" },
  { label: "Lenguaje corporal", value: 72, icon: Eye, color: "bg-[var(--hyre-pink)]" },
  { label: "Claridad", value: 88, icon: Volume2, color: "bg-[var(--hyre-cyan)]" },
]

const feedbackItems = [
  { type: "positive", text: "Excelente contacto visual durante las respuestas" },
  { type: "positive", text: "Buena estructura al responder con ejemplos" },
  { type: "improve", text: "Podrías reducir las muletillas como 'este' y 'bueno'" },
  { type: "improve", text: "Intenta hablar un poco más lento en momentos clave" },
]

export function InterviewScreen() {
  const [state, setState] = useState<InterviewState>("preparation")
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)

  const startInterview = () => {
    setState("live")
  }

  const nextQuestion = () => {
    if (currentQuestion < interviewQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setState("completed")
    }
  }

  const endInterview = () => {
    setState("completed")
  }

  // Preparation Screen
  if (state === "preparation") {
    return (
      <div className="min-h-screen px-4 pt-6 pb-24 safe-area-top">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Entrevista IA</h1>
          <p className="text-muted-foreground text-sm">Practica con nuestro entrevistador inteligente</p>
        </div>

        {/* AI Avatar Preview */}
        <Card className="glass-strong border-0 overflow-hidden mb-6">
          <div className="h-48 bg-gradient-to-br from-primary/30 to-[var(--hyre-cyan)]/30 flex items-center justify-center relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-[var(--hyre-cyan)] flex items-center justify-center">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full glass">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">HYRE AI</span>
            </div>
          </div>
          <div className="p-4 text-center">
            <h3 className="font-semibold text-foreground mb-1">Entrevistador IA</h3>
            <p className="text-sm text-muted-foreground">
              Te hare preguntas y analizare tu comunicacion, lenguaje corporal y confianza en tiempo real.
            </p>
          </div>
        </Card>

        {/* Tips */}
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Tips para tu entrevista
        </h2>
        <div className="space-y-3 mb-6">
          {preparationTips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass border-0 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <tip.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm text-foreground">{tip.text}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Company Info */}
        <Card className="glass border-0 p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">TC</span>
            </div>
            <div>
              <h4 className="font-medium text-foreground">TechCorp</h4>
              <p className="text-xs text-muted-foreground">UX Designer Jr.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Duracion estimada: 10-15 min</span>
          </div>
        </Card>

        <Button onClick={startInterview} size="lg" className="w-full rounded-xl h-14 glow-primary">
          <Video className="w-5 h-5 mr-2" />
          Iniciar entrevista
        </Button>
      </div>
    )
  }

  // Live Interview Screen
  if (state === "live") {
    return (
      <div className="min-h-screen flex flex-col safe-area-top safe-area-bottom">
        {/* Video Area */}
        <div className="flex-1 relative bg-gradient-to-br from-secondary to-background">
          {/* AI Avatar */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-[var(--hyre-cyan)] flex items-center justify-center"
            >
              <Brain className="w-16 h-16 text-white" />
            </motion.div>
          </div>

          {/* User video preview */}
          <div className="absolute bottom-4 right-4 w-24 h-32 rounded-xl bg-secondary/80 border border-white/10 flex items-center justify-center">
            {isVideoOff ? (
              <VideoOff className="w-6 h-6 text-muted-foreground" />
            ) : (
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-[var(--hyre-pink)]/30 to-primary/30 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">C</span>
              </div>
            )}
          </div>

          {/* Live indicator */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full glass">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm text-foreground">En vivo</span>
          </div>

          {/* Analysis indicator */}
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full glass">
            <Eye className="w-4 h-4 text-[var(--hyre-cyan)]" />
            <span className="text-sm text-foreground">Analizando...</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="p-4 bg-background/80 backdrop-blur-xl border-t border-white/10">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                Pregunta {currentQuestion + 1} de {interviewQuestions.length}
              </span>
              <span className="text-xs text-primary font-medium">
                {Math.round(((currentQuestion + 1) / interviewQuestions.length) * 100)}%
              </span>
            </div>
            <Progress value={((currentQuestion + 1) / interviewQuestions.length) * 100} className="h-1 mb-3" />
            <Card className="glass border-0 p-4">
              <p className="text-foreground font-medium">{interviewQuestions[currentQuestion]}</p>
            </Card>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMuted(!isMuted)}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isMuted ? 'bg-destructive' : 'glass'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-foreground" />}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={endInterview}
              className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center"
            >
              <Phone className="w-6 h-6 text-white rotate-[135deg]" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isVideoOff ? 'bg-destructive' : 'glass'
              }`}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5 text-white" /> : <Video className="w-5 h-5 text-foreground" />}
            </motion.button>
          </div>

          {/* Next Question */}
          <Button onClick={nextQuestion} variant="outline" className="w-full mt-4 rounded-xl">
            {currentQuestion < interviewQuestions.length - 1 ? "Siguiente pregunta" : "Finalizar entrevista"}
          </Button>
        </div>
      </div>
    )
  }

  // Completed Screen - Analysis Results
  return (
    <div className="min-h-screen px-4 pt-6 pb-24 safe-area-top">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Resultados</h1>
        <p className="text-muted-foreground text-sm">Analisis de tu entrevista con IA</p>
      </div>

      {/* Overall Score */}
      <Card className="glass-strong border-0 p-6 mb-6 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-[var(--hyre-green)] flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-white">81</span>
        </div>
        <h3 className="text-xl font-bold text-foreground mb-1">Excelente desempeno</h3>
        <p className="text-sm text-muted-foreground">
          Estas en el top 20% de candidatos para este puesto
        </p>
        <div className="flex items-center justify-center gap-1 mt-3">
          <TrendingUp className="w-4 h-4 text-[var(--hyre-green)]" />
          <span className="text-sm text-[var(--hyre-green)] font-medium">+8 puntos vs tu anterior entrevista</span>
        </div>
      </Card>

      {/* Metrics */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Analisis detallado
      </h2>
      <Card className="glass border-0 p-4 mb-6">
        <div className="space-y-4">
          {analysisMetrics.map((metric) => (
            <div key={metric.label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <metric.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{metric.label}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{metric.value}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={`h-full ${metric.color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Feedback */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Feedback de la IA
      </h2>
      <div className="space-y-3 mb-6">
        {feedbackItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass border-0 p-4">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  item.type === 'positive' 
                    ? 'bg-[var(--hyre-green)]/20' 
                    : 'bg-[var(--hyre-pink)]/20'
                }`}>
                  {item.type === 'positive' ? (
                    <CheckCircle2 className="w-4 h-4 text-[var(--hyre-green)]" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-[var(--hyre-pink)]" />
                  )}
                </div>
                <p className="text-sm text-foreground flex-1">{item.text}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button className="w-full rounded-xl h-14" size="lg">
          <Play className="w-5 h-5 mr-2" />
          Practicar otra vez
        </Button>
        <Button variant="outline" className="w-full rounded-xl" size="lg">
          Enviar resultados a la empresa
        </Button>
      </div>
    </div>
  )
}
