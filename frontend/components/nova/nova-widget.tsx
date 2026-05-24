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

export function NovaWidget() {
  const { isOpen, isVisible, hasBottomNav, toggle, close } = useNovaStore()

  if (!isVisible) return null

  const bottomOffset = hasBottomNav
    ? `calc(${BOTTOM_NAV_OFFSET_PX}px + env(safe-area-inset-bottom, 0px) + ${NOVA_BUBBLE_GAP_PX}px)`
    : `calc(1rem + env(safe-area-inset-bottom, 0px))`

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.button
            type="button"
            aria-label="Cerrar panel de Nova"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/10"
            style={{ zIndex: NOVA_Z_INDEX.backdrop }}
          />
        )}
      </AnimatePresence>

      {/* Contenedor alineado con la columna principal (max-w-md) */}
      <div
        className="pointer-events-none fixed inset-x-0"
        style={{ bottom: bottomOffset, zIndex: NOVA_Z_INDEX.bubble }}
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
                className="pointer-events-auto absolute bottom-[calc(100%+12px)] left-4 right-4 sm:right-auto sm:w-[min(380px,calc(100vw-2rem))] isolate"
                style={{ zIndex: NOVA_Z_INDEX.panel }}
              >
                <NovaChatPanel
                  onMinimize={close}
                  className="h-[min(520px,calc(100dvh-12rem))] w-full"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pointer-events-auto absolute bottom-0 left-4">
            <NovaFloatingBubble isOpen={isOpen} onClick={toggle} />
          </div>
        </div>
      </div>
    </>
  )
}
