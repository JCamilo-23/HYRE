import Link from "next/link"
import { Hexagon } from "lucide-react"
import { footerLinks, trustBadges } from "@/lib/landing/content"

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#06030f]/80 py-16 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Hexagon className="h-6 w-6 text-[#7C3AED]" />
              <span className="font-display text-lg font-semibold text-white">HYRE</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#64748B]">
              La plataforma de hiring con IA disenada para Gen Z. Demuestra potencial,
              conecta con empresas, acelera carreras.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              {trustBadges.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[#94A3B8]"
                >
                  <Icon className="h-3.5 w-3.5 text-[#7C3AED]" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Producto
            </p>
            <ul className="mt-4 space-y-2">
              {footerLinks.producto.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-[#94A3B8] hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Empresa
            </p>
            <ul className="mt-4 space-y-2">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-[#94A3B8] hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Legal
            </p>
            <ul className="mt-4 space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-[#94A3B8] hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-[#64748B]">
            © {new Date().getFullYear()} HYRE. Todos los derechos reservados.
          </p>
          <p className="text-xs text-[#64748B]">
            Hecho para Gen Z · Bogota · San Francisco energy
          </p>
        </div>
      </div>
    </footer>
  )
}
