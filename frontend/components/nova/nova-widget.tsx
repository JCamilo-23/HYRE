"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  BOTTOM_NAV_OFFSET_PX,
  NOVA_BUBBLE_GAP_PX,
  NOVA_Z_INDEX,
} from "@/modules/nova"
import { useNovaStore } from "@/store/nova-store"
import { NovaChatPanel } from "./nova-chat-panel"
import { NovaFloatingBubble } from "./nova-floating-bubble"
import { NovaCVPanel } from "./nova-cv-panel"
import { MessageSquare, FileText, X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface NovaWidgetProps {
  onNavigateToNova?: () => void
}

export function NovaWidget({ onNavigateToNova }: NovaWidgetProps) {
  const { isOpen, isVisible, hasBottomNav, open, close, activeTab, setActiveTab } = useNovaStore()

  if (!isVisible) return null

  const bottomOffset = hasBottomNav
    ? `calc(${BOTTOM_NAV_OFFSET_PX}px + env(safe-area-inset-bottom, 0px) + ${NOVA_BUBBLE_GAP_PX}px)`
    : `calc(1rem + env(safe-area-inset-bottom, 0px))`

  const panelHeight = activeTab === "cv"
    ? "h-[min(480px,calc(100dvh-12rem))]"
    : "h-[min(520px,calc(100dvh-12rem))]"

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/10"
            style={{ zIndex: NOVA_Z_INDEX.backdrop }}
          />
        )}
      </AnimatePresence>

      <div
        className="pointer-events-none fixed inset-x-0"
        style={{ bottom: bottomOffset, zIndex: NOVA_Z_INDEX.widget }}
      >
        <div className="relative mx-auto h-0 w-full max-w-md px-4">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="nova-panel"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="pointer-events-auto absolute bottom-[calc(100%+12px)] left-4 right-4 sm:right-auto sm:w-[min(380px,calc(100vw-2rem))]"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Panel shell with tabs */}
                <div className={cn("flex flex-col glass rounded-2xl overflow-hidden border border-white/10", panelHeight)}>
                  {/* Header with tabs */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-1.5 flex-1">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-[#F1F5F9] font-semibold text-sm">Nova</span>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 bg-black/20 rounded-lg p-0.5">
                      <button
                        onClick={() => setActiveTab("chat")}
                        className={cn(
                          "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                          activeTab === "chat"
                            ? "bg-[#7C3AED] text-white"
                            : "text-[#94A3B8] hover:text-[#F1F5F9]"
                        )}
                      >
                        <MessageSquare className="w-3 h-3" />
                        Chat
                      </button>
                      <button
                        onClick={() => setActiveTab("cv")}
                        className={cn(
                          "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                          activeTab === "cv"
                            ? "bg-[#7C3AED] text-white"
                            : "text-[#94A3B8] hover:text-[#F1F5F9]"
                        )}
                      >
                        <FileText className="w-3 h-3" />
                        Mi CV
                      </button>
                    </div>

                    <button
                      onClick={close}
                      className="text-[#475569] hover:text-[#94A3B8] transition-colors ml-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tab content */}
                  <div className="flex-1 overflow-hidden flex flex-col">
                    <AnimatePresence mode="wait">
                      {activeTab === "chat" ? (
                        <motion.div
                          key="chat"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex-1 flex flex-col overflow-hidden"
                        >
                          {/* NovaChatPanel without its own header (we handle close above) */}
                          <NovaChatPanel onClose={close} hideHeader className="flex-1 h-full" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="cv"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex-1 flex flex-col overflow-hidden p-4"
                        >
                          <NovaCVPanel onNavigateToNova={onNavigateToNova} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isOpen && (
            <div className="pointer-events-auto absolute bottom-0 left-4">
              <NovaFloatingBubble onClick={open} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
