"use client"

import { motion } from "framer-motion"
import { Hexagon } from "lucide-react"

export function SplashScreen() {
  const logoLetters = "HYRE".split("")

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Hexagon Logo Animation */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative mb-8"
      >
        {/* Outer glow */}
        <div className="absolute inset-0 bg-[#7C3AED] rounded-full blur-3xl opacity-30 scale-150" />
        
        {/* Hexagon container with gradient border */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] rounded-2xl opacity-20" />
          <Hexagon className="w-20 h-20 text-[#7C3AED]" strokeWidth={1.5} />
          
          {/* Inner S letter */}
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute text-3xl font-bold bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent"
          >
            H
          </motion.span>
        </div>
      </motion.div>

      {/* Logo Text - Letter by letter reveal */}
      <div className="flex items-center gap-0.5 mb-4">
        {logoLetters.map((letter, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.08, duration: 0.4 }}
            className="text-3xl font-semibold bg-gradient-to-r from-[#7C3AED] via-[#9F67FF] to-[#06B6D4] bg-clip-text text-transparent"
          >
            {letter}
          </motion.span>
        ))}
      </div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.5 }}
        className="text-[#94A3B8] text-sm text-center"
      >
        Demuestra tu potencial, no solo tu CV.
      </motion.p>

      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.3 }}
        className="mt-12 flex gap-1.5"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="w-2 h-2 rounded-full bg-[#7C3AED]"
          />
        ))}
      </motion.div>
    </div>
  )
}
