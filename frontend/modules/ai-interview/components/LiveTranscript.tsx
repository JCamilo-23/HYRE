"use client"

import { motion, AnimatePresence } from "framer-motion"

interface LiveTranscriptProps {
  lines: string[]
  interim?: string
}

export function LiveTranscript({ lines, interim }: LiveTranscriptProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-[#94A3B8]">
        Transcripción en vivo
      </h3>
      <div className="max-h-36 space-y-2 overflow-y-auto text-sm text-[#E2E8F0]">
        <AnimatePresence mode="popLayout">
          {lines.length === 0 && !interim && (
            <p className="text-[#64748B]">Habla o escribe para ver la transcripción…</p>
          )}
          {lines.map((line, i) => (
            <motion.p
              key={`${i}-${line.slice(0, 24)}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-l-2 border-[#7C3AED]/50 pl-3"
            >
              {line}
            </motion.p>
          ))}
          {interim && (
            <motion.p
              key="interim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              className="italic text-[#94A3B8] pl-3"
            >
              {interim}…
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
