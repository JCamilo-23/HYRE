"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Zap,
  MessageSquare,
  FileText,
  Users,
  Award,
  ChevronRight,
  Lock,
  Video
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { Screen } from "@/lib/hyre-types"

interface SimulationScreenProps {
  onNavigate: (screen: Screen) => void
}

const simulations = [
  {
    id: 1,
    company: "TechCorp",
    role: "UX Designer Jr.",
    tasks: 5,
    completedTasks: 3,
    xpReward: 250,
    timeLeft: "2 dias",
    status: "active",
    color: "from-purple-600 to-blue-600",
    hasInterview: true,
  },
  {
    id: 2,
    company: "GreenFinance",
    role: "Marketing Digital",
    tasks: 4,
    completedTasks: 0,
    xpReward: 200,
    timeLeft: "5 dias",
    status: "new",
    color: "from-green-600 to-teal-600",
    hasInterview: false,
  },
  {
    id: 3,
    company: "CreativeHub",
    role: "Content Creator",
    tasks: 6,
    completedTasks: 6,
    xpReward: 300,
    timeLeft: "Completado",
    status: "completed",
    color: "from-pink-600 to-orange-600",
    hasInterview: true,
  },
]

const currentTasks = [
  {
    id: 1,
    title: "Redisena la pagina de inicio",
    description: "Crea un prototipo en Figma con los nuevos requerimientos",
    type: "design",
    xp: 80,
    deadline: "Hoy 6:00 PM",
    completed: false,
  },
  {
    id: 2,
    title: "Presenta tu propuesta",
    description: "Graba un video de 2 min explicando tu solucion",
    type: "presentation",
    xp: 100,
    deadline: "Manana 10:00 AM",
    completed: false,
  },
  {
    id: 3,
    title: "Feedback del equipo",
    description: "Responde los comentarios del equipo de diseno",
    type: "collaboration",
    xp: 50,
    deadline: "Completado",
    completed: true,
  },
]

const taskIcons = {
  design: FileText,
  presentation: MessageSquare,
  collaboration: Users,
}

export function SimulationScreen({ onNavigate }: SimulationScreenProps) {
  const activeSimulation = simulations.find(s => s.status === "active")

  return (
    <div className="min-h-screen px-4 pt-6 pb-24 safe-area-top">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Simulaciones</h1>
        <p className="text-muted-foreground text-sm">Vive la experiencia antes de aplicar</p>
      </div>

      {/* Active Simulation */}
      {activeSimulation && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Simulacion activa
          </h2>
          <Card className="glass-strong border-0 overflow-hidden">
            <div className={`h-20 bg-gradient-to-r ${activeSimulation.color} p-4 flex items-end`}>
              <div>
                <p className="text-white/70 text-xs font-medium">{activeSimulation.company}</p>
                <h3 className="text-white font-bold text-lg">{activeSimulation.role}</h3>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{activeSimulation.timeLeft} restantes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">+{activeSimulation.xpReward} XP</span>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Progreso</span>
                  <span className="font-medium text-foreground">
                    {activeSimulation.completedTasks}/{activeSimulation.tasks} tareas
                  </span>
                </div>
                <Progress 
                  value={(activeSimulation.completedTasks / activeSimulation.tasks) * 100} 
                  className="h-2"
                />
              </div>
              <div className="flex gap-2 mt-3">
                <Button className="flex-1 rounded-xl" size="lg">
                  <Play className="w-4 h-4 mr-2" />
                  Continuar
                </Button>
                {activeSimulation.hasInterview && (
                  <Button 
                    variant="outline" 
                    className="rounded-xl"
                    size="lg"
                    onClick={() => onNavigate("interview")}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Entrevista IA
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Current Tasks */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Tareas pendientes
        </h2>
        <div className="space-y-3">
          {currentTasks.map((task, index) => {
            const TaskIcon = taskIcons[task.type as keyof typeof taskIcons]
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`glass border-0 p-4 ${task.completed ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      task.completed 
                        ? 'bg-[var(--hyre-green)]/20' 
                        : 'bg-primary/20'
                    }`}>
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-[var(--hyre-green)]" />
                      ) : (
                        <TaskIcon className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {task.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-0.5">{task.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.deadline}
                        </span>
                        <span className="text-xs text-primary font-medium flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          +{task.xp} XP
                        </span>
                      </div>
                    </div>
                    {!task.completed && (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* All Simulations */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Todas las simulaciones
        </h2>
        <div className="space-y-3">
          {simulations.map((sim) => (
            <Card 
              key={sim.id} 
              className={`glass border-0 p-4 cursor-pointer hover:bg-white/10 transition-colors ${
                sim.status === 'completed' ? 'opacity-70' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sim.color} flex items-center justify-center`}>
                  {sim.status === 'completed' ? (
                    <Award className="w-6 h-6 text-white" />
                  ) : sim.status === 'new' ? (
                    <Lock className="w-6 h-6 text-white/70" />
                  ) : (
                    <Play className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{sim.company}</h4>
                  <p className="text-sm text-muted-foreground">{sim.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {sim.completedTasks}/{sim.tasks}
                  </p>
                  <p className="text-xs text-muted-foreground">{sim.timeLeft}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
