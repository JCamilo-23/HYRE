"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Hexagon, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { navLinks } from "@/lib/landing/content"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-white/10 bg-[#0a0614]/70 py-3 backdrop-blur-2xl"
            : "bg-transparent py-5",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md transition group-hover:border-[#7C3AED]/40">
              <Hexagon className="h-5 w-5 text-[#7C3AED]" strokeWidth={1.5} />
              <span className="absolute text-sm font-bold bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
                H
              </span>
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-white">
              HYRE
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[#94A3B8] transition hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button
              variant="ghost"
              className="text-[#94A3B8] hover:bg-white/5 hover:text-white"
              asChild
            >
              <a href="#producto">Ver producto</a>
            </Button>
            <Button
              className="rounded-full bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] px-6 shadow-[0_0_30px_rgba(124,58,237,0.45)] hover:opacity-95"
              asChild
            >
              <Link href="/login">Iniciar Sesion</Link>
            </Button>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar menu" : "Abrir menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#0a0614]/95 backdrop-blur-2xl md:hidden"
          >
            <motion.nav
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="flex min-h-screen flex-col gap-2 px-6 pt-28"
            >
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-4 text-lg text-white"
                >
                  {link.label}
                </motion.a>
              ))}
              <Button
                className="mt-4 h-12 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] text-base"
                asChild
              >
                <Link href="/login" onClick={() => setOpen(false)}>
                  Iniciar Sesion
                </Link>
              </Button>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
